/**
 * Roof Replacement Cost Calculator Formula Module
 *
 * Estimates roof replacement costs across eight roofing materials:
 * asphalt 3-tab, architectural shingle, metal standing seam, metal corrugated,
 * clay tile, concrete tile, slate, and wood shake.
 * Includes story multiplier, roof complexity, tear-off, and regional labor.
 *
 * Cost formula:
 *   materialCost = area × materialRate
 *   laborCost = area × laborRate × storyMultiplier × complexityMultiplier × regionalMultiplier
 *   tearOffCost = area × tearOffRate
 *   totalLow = materialCostLow + laborCostLow + tearOffCostLow
 *   totalHigh = materialCostHigh + laborCostHigh + tearOffCostHigh
 *   totalMid = (totalLow + totalHigh) / 2
 *
 * Source: HomeAdvisor / Angi 2025-2026 national averages;
 *         National Roofing Contractors Association (NRCA)
 */

export interface RoofReplacementCostInput {
  roofArea: number;
  roofAreaUnit: string;           // 'sqft' | 'sqm'
  roofingMaterial: string;        // 'asphalt-3tab' | 'architectural-shingle' | 'metal-standing-seam' | 'metal-corrugated' | 'tile-clay' | 'tile-concrete' | 'slate' | 'wood-shake'
  stories: string;                // '1-story' | '2-story' | '3-story'
  roofComplexity: string;         // 'simple-gable' | 'moderate-hip' | 'complex-multi-level'
  tearOff: string;                // 'none' | 'single-layer' | 'double-layer'
  region: string;                 // 'national' | 'northeast' | 'west-coast' | 'mid-atlantic' | 'midwest' | 'south' | 'mountain-west'
}

export interface RoofReplacementCostOutput {
  area: number;
  materialCost: number;
  laborCost: number;
  tearOffCost: number;
  totalLow: number;
  totalHigh: number;
  totalMid: number;
  costPerSquare: number;
  materialComparison: { label: string; value: number }[];
  timeline: string;
}

/**
 * Unit conversion factors to square feet.
 */
const areaToSqFt: Record<string, number> = {
  sqft: 1,
  sqm: 10.7639,
};

/**
 * Material cost per square foot by roofing material (material portion only).
 * Source: HomeAdvisor / Angi 2025-2026 national averages.
 */
const MATERIAL_COSTS: Record<string, { low: number; high: number }> = {
  'asphalt-3tab':           { low: 3,  high: 5 },
  'architectural-shingle':  { low: 4,  high: 7 },
  'metal-standing-seam':    { low: 8,  high: 14 },
  'metal-corrugated':       { low: 5,  high: 9 },
  'tile-clay':              { low: 10, high: 18 },
  'tile-concrete':          { low: 8,  high: 14 },
  'slate':                  { low: 15, high: 30 },
  'wood-shake':             { low: 6,  high: 10 },
};

/**
 * Labor cost per square foot by roofing material.
 * Source: HomeAdvisor / Angi 2025-2026 national averages.
 */
const LABOR_COSTS: Record<string, { low: number; high: number }> = {
  'asphalt-3tab':           { low: 2,    high: 4 },
  'architectural-shingle':  { low: 2.50, high: 4.50 },
  'metal-standing-seam':    { low: 4,    high: 7 },
  'metal-corrugated':       { low: 3,    high: 5 },
  'tile-clay':              { low: 5,    high: 9 },
  'tile-concrete':          { low: 4,    high: 7 },
  'slate':                  { low: 7,    high: 12 },
  'wood-shake':             { low: 3.50, high: 6 },
};

/**
 * Story height multipliers.
 * Higher stories increase labor cost due to access difficulty and safety.
 */
const STORY_MULTIPLIERS: Record<string, number> = {
  '1-story': 1.0,
  '2-story': 1.10,
  '3-story': 1.20,
};

/**
 * Roof complexity multipliers.
 * More complex roof designs increase labor due to additional cuts and flashing.
 */
const COMPLEXITY_MULTIPLIERS: Record<string, number> = {
  'simple-gable':        1.0,
  'moderate-hip':        1.10,
  'complex-multi-level': 1.25,
};

/**
 * Tear-off cost per square foot (removal of existing roofing layers).
 * Source: HomeAdvisor / Angi 2025-2026.
 */
const TEAROFF_COSTS: Record<string, { low: number; high: number }> = {
  'none':         { low: 0,   high: 0 },
  'single-layer': { low: 1,   high: 2 },
  'double-layer': { low: 2,   high: 3.50 },
};

/**
 * Regional labor multipliers.
 * Applied to labor portion only, not materials.
 */
const REGIONAL_MULTIPLIERS: Record<string, number> = {
  'national':       1.0,
  'northeast':      1.20,
  'west-coast':     1.25,
  'mid-atlantic':   1.15,
  'midwest':        0.90,
  'south':          0.85,
  'mountain-west':  0.95,
};

/**
 * Display labels for roofing materials.
 */
const MATERIAL_LABELS: Record<string, string> = {
  'asphalt-3tab':           'Asphalt 3-Tab',
  'architectural-shingle':  'Architectural Shingle',
  'metal-standing-seam':    'Metal Standing Seam',
  'metal-corrugated':       'Metal Corrugated',
  'tile-clay':              'Clay Tile',
  'tile-concrete':          'Concrete Tile',
  'slate':                  'Slate',
  'wood-shake':             'Wood Shake',
};

/**
 * Timeline estimates per roofing material.
 */
const TIMELINE_ESTIMATES: Record<string, string> = {
  'asphalt-3tab':           '2–4 days',
  'architectural-shingle':  '2–5 days',
  'metal-standing-seam':    '5–10 days',
  'metal-corrugated':       '4–7 days',
  'tile-clay':              '1–2 weeks',
  'tile-concrete':          '1–2 weeks',
  'slate':                  '2–3 weeks',
  'wood-shake':             '5–10 days',
};

/**
 * Roof replacement cost calculator.
 *
 * totalLow = materialCostLow + laborCostLow×story×complexity×region + tearOffCostLow
 * totalHigh = materialCostHigh + laborCostHigh×story×complexity×region + tearOffCostHigh
 * totalMid = (totalLow + totalHigh) / 2
 *
 * Source: HomeAdvisor / Angi 2025-2026, NRCA.
 */
export function calculateRoofReplacementCost(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const rawArea = Number(inputs.roofArea) || 0;
  const areaUnit = String(inputs.roofAreaUnit || 'sqft');
  const roofingMaterial = String(inputs.roofingMaterial || 'asphalt-3tab');
  const stories = String(inputs.stories || '1-story');
  const roofComplexity = String(inputs.roofComplexity || 'simple-gable');
  const tearOff = String(inputs.tearOff || 'none');
  const region = String(inputs.region || 'national');

  // ── Convert to square feet ────────────────────────────
  const area = parseFloat((rawArea * (areaToSqFt[areaUnit] ?? 1)).toFixed(2));

  // ── Look up rates ─────────────────────────────────────
  const matRates = MATERIAL_COSTS[roofingMaterial] ?? MATERIAL_COSTS['asphalt-3tab'];
  const labRates = LABOR_COSTS[roofingMaterial] ?? LABOR_COSTS['asphalt-3tab'];
  const tearOffRates = TEAROFF_COSTS[tearOff] ?? TEAROFF_COSTS['none'];
  const storyMult = STORY_MULTIPLIERS[stories] ?? 1.0;
  const complexMult = COMPLEXITY_MULTIPLIERS[roofComplexity] ?? 1.0;
  const regionMult = REGIONAL_MULTIPLIERS[region] ?? 1.0;

  // ── Calculate material cost ───────────────────────────
  const materialCostLow = parseFloat((area * matRates.low).toFixed(2));
  const materialCostHigh = parseFloat((area * matRates.high).toFixed(2));

  // ── Calculate labor cost (with all multipliers) ───────
  const laborCostLow = parseFloat((area * labRates.low * storyMult * complexMult * regionMult).toFixed(2));
  const laborCostHigh = parseFloat((area * labRates.high * storyMult * complexMult * regionMult).toFixed(2));

  // ── Calculate tear-off cost ───────────────────────────
  const tearOffCostLow = parseFloat((area * tearOffRates.low).toFixed(2));
  const tearOffCostHigh = parseFloat((area * tearOffRates.high).toFixed(2));

  // ── Totals ────────────────────────────────────────────
  const totalLow = parseFloat((materialCostLow + laborCostLow + tearOffCostLow).toFixed(2));
  const totalHigh = parseFloat((materialCostHigh + laborCostHigh + tearOffCostHigh).toFixed(2));
  const totalMid = parseFloat(((totalLow + totalHigh) / 2).toFixed(2));

  // ── Cost per roofing square (100 sq ft) ───────────────
  const costPerSquare = area > 0 ? parseFloat((totalMid / area * 100).toFixed(2)) : 0;

  // ── Mid-point costs for display ───────────────────────
  const materialCost = parseFloat(((materialCostLow + materialCostHigh) / 2).toFixed(2));
  const laborCost = parseFloat(((laborCostLow + laborCostHigh) / 2).toFixed(2));
  const tearOffCost = parseFloat(((tearOffCostLow + tearOffCostHigh) / 2).toFixed(2));

  // ── Material comparison (all 8 types, national avg, no tear-off, 1-story simple) ──
  const materialKeys = Object.keys(MATERIAL_COSTS);
  const materialComparison = materialKeys.map(key => {
    const mr = MATERIAL_COSTS[key];
    const lr = LABOR_COSTS[key];
    const matMid = area * (mr.low + mr.high) / 2;
    const labMid = area * (lr.low + lr.high) / 2;
    const midTotal = matMid + labMid;
    const installedLow = mr.low + lr.low;
    const installedHigh = mr.high + lr.high;
    return {
      label: `${MATERIAL_LABELS[key]} ($${installedLow}–$${installedHigh}/sq ft)`,
      value: parseFloat(midTotal.toFixed(2)),
    };
  });

  // ── Timeline ──────────────────────────────────────────
  const timeline = TIMELINE_ESTIMATES[roofingMaterial] ?? '3–7 days';

  return {
    area,
    materialCost,
    laborCost,
    tearOffCost,
    totalLow,
    totalHigh,
    totalMid,
    costPerSquare,
    materialComparison,
    timeline,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'roof-replacement-cost': calculateRoofReplacementCost,
};
