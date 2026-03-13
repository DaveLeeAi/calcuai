/**
 * Bathroom Tile Cost Calculator Formula Module
 *
 * Estimates bathroom tiling costs by project scope (shower walls, shower floor,
 * bathroom floor, tub surround, full bathroom) across five tile materials:
 * ceramic, porcelain, natural stone, glass, and large-format.
 * Splits costs into material and labor components, with regional labor multipliers.
 *
 * Cost formula:
 *   effectiveArea = area × (1 + wasteFactor / 100)
 *   materialCost = effectiveArea × materialRate
 *   laborCost = effectiveArea × laborRate × regionalMultiplier
 *   demoCost = area × demoRate (if selected)
 *   waterproofingCost = area × waterproofRate (if selected)
 *   suppliesCost = area × $3
 *   totalLow = materialCostLow + laborCostLow + demoCostLow + waterproofingCostLow + suppliesCost
 *   totalHigh = materialCostHigh + laborCostHigh + demoCostHigh + waterproofingCostHigh + suppliesCost
 *   totalMid = (totalLow + totalHigh) / 2
 *
 * Source: HomeAdvisor / Angi 2025-2026 national averages;
 *         National Tile Contractors Association (NTCA)
 */

export interface BathroomTileCostInput {
  projectType: string;          // 'shower-walls' | 'shower-floor' | 'bathroom-floor' | 'tub-surround' | 'full-bathroom'
  area: number;                 // sq ft
  tileType: string;             // 'ceramic' | 'porcelain' | 'natural-stone' | 'glass' | 'large-format'
  demoOldTile: string;          // 'none' | 'yes'
  waterproofing: string;        // 'none' | 'standard' | 'premium'
  wasteFactor: number;          // percentage 5-25
  region: string;               // 'national' | 'northeast' | 'west-coast' | 'mid-atlantic' | 'midwest' | 'south' | 'mountain-west'
}

export interface BathroomTileCostOutput {
  area: number;
  effectiveArea: number;
  materialCost: number;
  laborCost: number;
  demoCost: number;
  waterproofingCost: number;
  suppliesCost: number;
  totalLow: number;
  totalHigh: number;
  totalMid: number;
  costPerSqFt: number;
  tileComparison: { label: string; value: number }[];
  projectNote: string;
}

/**
 * Default areas by project type (sq ft).
 */
const DEFAULT_AREAS: Record<string, number> = {
  'shower-walls':    80,
  'shower-floor':    15,
  'bathroom-floor':  50,
  'tub-surround':    60,
  'full-bathroom':   180,
};

/**
 * Material cost per square foot by tile type (material portion only).
 * Source: HomeAdvisor / Angi 2025-2026 national averages.
 */
const MATERIAL_COSTS: Record<string, { low: number; high: number }> = {
  'ceramic':       { low: 4,  high: 8 },
  'porcelain':     { low: 5,  high: 10 },
  'natural-stone': { low: 8,  high: 16 },
  'glass':         { low: 7,  high: 14 },
  'large-format':  { low: 6,  high: 12 },
};

/**
 * Labor cost per square foot by tile type.
 * Source: HomeAdvisor / Angi 2025-2026 national averages.
 */
const LABOR_COSTS: Record<string, { low: number; high: number }> = {
  'ceramic':       { low: 6,  high: 12 },
  'porcelain':     { low: 7,  high: 15 },
  'natural-stone': { low: 12, high: 24 },
  'glass':         { low: 11, high: 21 },
  'large-format':  { low: 9,  high: 18 },
};

/**
 * Demo cost per square foot of existing tile.
 * Applied to raw area (not effective area with waste).
 */
const DEMO_COSTS: Record<string, { low: number; high: number }> = {
  'none': { low: 0, high: 0 },
  'yes':  { low: 4, high: 8 },
};

/**
 * Waterproofing cost per square foot.
 * Applied to raw area (not effective area with waste).
 */
const WATERPROOFING_COSTS: Record<string, { low: number; high: number }> = {
  'none':     { low: 0, high: 0 },
  'standard': { low: 2, high: 4 },
  'premium':  { low: 4, high: 7 },
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
 * Supplies cost per square foot (grout, thin-set, backer board, spacers).
 */
const SUPPLIES_PER_SQFT = 3;

/**
 * Display labels for tile types.
 */
const TILE_LABELS: Record<string, string> = {
  'ceramic':       'Ceramic',
  'porcelain':     'Porcelain',
  'natural-stone': 'Natural Stone',
  'glass':         'Glass',
  'large-format':  'Large-Format',
};

/**
 * Project type descriptions.
 */
const PROJECT_NOTES: Record<string, string> = {
  'shower-walls':   'Shower wall tiling — typically 80 sq ft for a standard 3×3-foot shower with 8-foot ceiling. Includes three walls from base to ceiling height.',
  'shower-floor':   'Shower floor tiling — typically 15 sq ft for a standard shower pan. Small mosaic tiles with slope-to-drain are most common.',
  'bathroom-floor': 'Bathroom floor tiling — typically 50 sq ft for a standard bathroom. Includes area around toilet, vanity, and tub/shower perimeter.',
  'tub-surround':   'Tub surround tiling — typically 60 sq ft covering three walls above a standard 5-foot bathtub to a height of 6 feet.',
  'full-bathroom':  'Full bathroom tiling — typically 180 sq ft covering shower walls, shower floor, bathroom floor, and tub surround. Largest scope with highest total cost.',
};

/**
 * Bathroom tile cost calculator.
 *
 * totalLow = materialCostLow + laborCostLow + demoCostLow + waterproofingCostLow + suppliesCost
 * totalHigh = materialCostHigh + laborCostHigh + demoCostHigh + waterproofingCostHigh + suppliesCost
 * totalMid = (totalLow + totalHigh) / 2
 *
 * Source: HomeAdvisor / Angi 2025-2026, National Tile Contractors Association (NTCA).
 */
export function calculateBathroomTileCost(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const projectType = String(inputs.projectType || 'shower-walls');
  const rawArea = Number(inputs.area) || 0;
  const area = rawArea > 0 ? rawArea : (DEFAULT_AREAS[projectType] ?? 80);
  const tileType = String(inputs.tileType || 'ceramic');
  const demoOption = String(inputs.demoOldTile || 'none');
  const waterproofing = String(inputs.waterproofing || 'none');
  const wasteFactor = Math.max(0, Math.min(100, Number(inputs.wasteFactor) || 10));
  const region = String(inputs.region || 'national');

  // ── Effective area with waste ─────────────────────────
  const effectiveArea = parseFloat((area * (1 + wasteFactor / 100)).toFixed(2));

  // ── Look up rates ─────────────────────────────────────
  const matRates = MATERIAL_COSTS[tileType] ?? MATERIAL_COSTS['ceramic'];
  const labRates = LABOR_COSTS[tileType] ?? LABOR_COSTS['ceramic'];
  const demoRates = DEMO_COSTS[demoOption] ?? DEMO_COSTS['none'];
  const wpRates = WATERPROOFING_COSTS[waterproofing] ?? WATERPROOFING_COSTS['none'];
  const regionMult = REGIONAL_MULTIPLIERS[region] ?? 1.0;

  // ── Calculate costs ───────────────────────────────────
  const materialCostLow = parseFloat((effectiveArea * matRates.low).toFixed(2));
  const materialCostHigh = parseFloat((effectiveArea * matRates.high).toFixed(2));
  const laborCostLow = parseFloat((effectiveArea * labRates.low * regionMult).toFixed(2));
  const laborCostHigh = parseFloat((effectiveArea * labRates.high * regionMult).toFixed(2));
  const demoCostLow = parseFloat((area * demoRates.low).toFixed(2));
  const demoCostHigh = parseFloat((area * demoRates.high).toFixed(2));
  const demoCost = parseFloat(((demoCostLow + demoCostHigh) / 2).toFixed(2));
  const wpCostLow = parseFloat((area * wpRates.low).toFixed(2));
  const wpCostHigh = parseFloat((area * wpRates.high).toFixed(2));
  const waterproofingCost = parseFloat(((wpCostLow + wpCostHigh) / 2).toFixed(2));
  const suppliesCost = parseFloat((area * SUPPLIES_PER_SQFT).toFixed(2));

  const totalLow = parseFloat((materialCostLow + laborCostLow + demoCostLow + wpCostLow + suppliesCost).toFixed(2));
  const totalHigh = parseFloat((materialCostHigh + laborCostHigh + demoCostHigh + wpCostHigh + suppliesCost).toFixed(2));
  const totalMid = parseFloat(((totalLow + totalHigh) / 2).toFixed(2));
  const costPerSqFt = area > 0 ? parseFloat((totalMid / area).toFixed(2)) : 0;

  // ── Mid-point costs for display ───────────────────────
  const materialCost = parseFloat(((materialCostLow + materialCostHigh) / 2).toFixed(2));
  const laborCost = parseFloat(((laborCostLow + laborCostHigh) / 2).toFixed(2));

  // ── Tile comparison (all 5 types, national avg, no demo/waterproofing) ──
  const tileKeys = Object.keys(MATERIAL_COSTS);
  const tileComparison = tileKeys.map(key => {
    const mr = MATERIAL_COSTS[key];
    const lr = LABOR_COSTS[key];
    const matMid = effectiveArea * (mr.low + mr.high) / 2;
    const labMid = effectiveArea * (lr.low + lr.high) / 2;
    const mid = matMid + labMid + suppliesCost;
    return {
      label: `${TILE_LABELS[key]} ($${mr.low + lr.low}–$${mr.high + lr.high}/sq ft)`,
      value: parseFloat(mid.toFixed(2)),
    };
  });

  // ── Project note ──────────────────────────────────────
  const projectNote = PROJECT_NOTES[projectType] ?? PROJECT_NOTES['shower-walls'];

  return {
    area,
    effectiveArea,
    materialCost,
    laborCost,
    demoCost,
    waterproofingCost,
    suppliesCost,
    totalLow,
    totalHigh,
    totalMid,
    costPerSqFt,
    tileComparison,
    projectNote,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'bathroom-tile-cost': calculateBathroomTileCost,
};
