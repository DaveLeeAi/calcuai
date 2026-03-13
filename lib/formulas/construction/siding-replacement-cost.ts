/**
 * Siding Replacement Cost Calculator Formula Module
 *
 * Estimates full siding replacement costs across six materials:
 * vinyl, fiber cement, wood, engineered wood, aluminum, and stone veneer.
 * Includes old siding removal, housewrap, trim, story factor, and regional labor.
 *
 * Cost formula:
 *   materialCost = wallArea × materialRate
 *   laborCost = wallArea × laborRate × storyMultiplier × regionalMultiplier
 *   removalCost = wallArea × removalRate
 *   housewrapCost = wallArea × housewrapRate
 *   trimCost = wallArea × $0.75
 *   totalLow = materialCostLow + laborCostLow + removalCostLow + housewrapCostLow + trimCost
 *   totalHigh = materialCostHigh + laborCostHigh + removalCostHigh + housewrapCostHigh + trimCost
 *   totalMid = (totalLow + totalHigh) / 2
 *
 * Source: HomeAdvisor / Angi 2025-2026 national averages,
 *         Vinyl Siding Institute, James Hardie Industries
 */

export interface SidingReplacementCostInput {
  wallArea: number;
  sidingType: string;           // 'vinyl' | 'fiber-cement' | 'wood' | 'engineered-wood' | 'aluminum' | 'stone-veneer'
  stories: string;              // '1-story' | '2-story' | '3-story'
  oldSidingRemoval: string;     // 'none' | 'standard-removal' | 'asbestos-abatement'
  housewrap: string;            // 'none' | 'standard'
  region: string;               // 'national' | 'northeast' | 'west-coast' | 'mid-atlantic' | 'midwest' | 'south' | 'mountain-west'
}

export interface SidingReplacementCostOutput {
  wallArea: number;
  materialCost: number;
  laborCost: number;
  removalCost: number;
  housewrapCost: number;
  trimCost: number;
  totalLow: number;
  totalHigh: number;
  totalMid: number;
  costPerSqFt: number;
  sidingComparison: { label: string; value: number }[];
  timeline: string;
}

/**
 * Regional labor multipliers.
 * Applied to labor costs only, not materials.
 */
const REGIONAL_MULTIPLIERS: Record<string, number> = {
  'national': 1.0,
  'northeast': 1.20,
  'west-coast': 1.25,
  'mid-atlantic': 1.15,
  'midwest': 0.90,
  'south': 0.85,
  'mountain-west': 0.95,
};

/**
 * Story multipliers applied to labor costs.
 * Higher stories require scaffolding and rigging.
 */
const STORY_MULTIPLIERS: Record<string, number> = {
  '1-story': 1.0,
  '2-story': 1.20,
  '3-story': 1.40,
};

/**
 * Siding material cost per square foot (~40% of installed cost).
 * Source: HomeAdvisor / Angi 2025-2026.
 */
const SIDING_MATERIAL_RATES: Record<string, { low: number; high: number }> = {
  'vinyl':           { low: 1.20, high: 2.80 },
  'fiber-cement':    { low: 2.40, high: 5.20 },
  'wood':            { low: 2.40, high: 4.80 },
  'engineered-wood': { low: 2,    high: 4 },
  'aluminum':        { low: 1.20, high: 2.40 },
  'stone-veneer':    { low: 4.80, high: 12 },
};

/**
 * Siding labor cost per square foot (~60% of installed cost).
 * Source: HomeAdvisor / Angi 2025-2026.
 */
const SIDING_LABOR_RATES: Record<string, { low: number; high: number }> = {
  'vinyl':           { low: 1.80, high: 4.20 },
  'fiber-cement':    { low: 3.60, high: 7.80 },
  'wood':            { low: 3.60, high: 7.20 },
  'engineered-wood': { low: 3,    high: 6 },
  'aluminum':        { low: 1.80, high: 3.60 },
  'stone-veneer':    { low: 7.20, high: 18 },
};

/**
 * Old siding removal cost per square foot.
 */
const REMOVAL_RATES: Record<string, { low: number; high: number }> = {
  'none':               { low: 0,    high: 0 },
  'standard-removal':   { low: 1.50, high: 3 },
  'asbestos-abatement': { low: 5,    high: 15 },
};

/**
 * Housewrap cost per square foot.
 */
const HOUSEWRAP_RATES: Record<string, { low: number; high: number }> = {
  'none':     { low: 0,    high: 0 },
  'standard': { low: 0.50, high: 1.50 },
};

/**
 * Trim/accessories cost per square foot of wall area (flat estimate).
 */
const TRIM_RATE = 0.75;

/**
 * Material display labels for comparison output.
 */
const MATERIAL_LABELS: Record<string, string> = {
  'vinyl':           'Vinyl',
  'fiber-cement':    'Fiber Cement',
  'wood':            'Wood',
  'engineered-wood': 'Engineered Wood',
  'aluminum':        'Aluminum',
  'stone-veneer':    'Stone Veneer',
};

/**
 * Timeline estimates per material.
 */
const TIMELINE_ESTIMATES: Record<string, string> = {
  'vinyl':           '1–2 weeks for average home',
  'fiber-cement':    '2–3 weeks (heavier material, more cuts)',
  'wood':            '2–3 weeks (staining/painting adds time)',
  'engineered-wood': '1–2 weeks',
  'aluminum':        '1–2 weeks',
  'stone-veneer':    '3–6 weeks (mortar set time, skilled masonry)',
};

/**
 * Siding replacement cost calculator.
 *
 * totalLow = materialCostLow + laborCostLow + removalCostLow + housewrapCostLow + trimCost
 * totalHigh = materialCostHigh + laborCostHigh + removalCostHigh + housewrapCostHigh + trimCost
 * totalMid = (totalLow + totalHigh) / 2
 *
 * Source: HomeAdvisor / Angi 2025-2026, Vinyl Siding Institute, James Hardie.
 */
export function calculateSidingReplacementCost(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const wallArea = Math.max(0, Number(inputs.wallArea) || 0);
  const sidingType = String(inputs.sidingType || 'vinyl');
  const stories = String(inputs.stories || '1-story');
  const oldSidingRemoval = String(inputs.oldSidingRemoval || 'none');
  const housewrap = String(inputs.housewrap || 'none');
  const region = String(inputs.region || 'national');

  // ── Look up rates ─────────────────────────────────────
  const materialRates = SIDING_MATERIAL_RATES[sidingType] ?? SIDING_MATERIAL_RATES['vinyl'];
  const laborRates = SIDING_LABOR_RATES[sidingType] ?? SIDING_LABOR_RATES['vinyl'];
  const removalRates = REMOVAL_RATES[oldSidingRemoval] ?? REMOVAL_RATES['none'];
  const housewrapRates = HOUSEWRAP_RATES[housewrap] ?? HOUSEWRAP_RATES['none'];
  const storyMultiplier = STORY_MULTIPLIERS[stories] ?? 1.0;
  const regionalMultiplier = REGIONAL_MULTIPLIERS[region] ?? 1.0;

  // ── Calculate cost components ─────────────────────────
  const materialCostLow = parseFloat((wallArea * materialRates.low).toFixed(2));
  const materialCostHigh = parseFloat((wallArea * materialRates.high).toFixed(2));

  const laborCostLow = parseFloat((wallArea * laborRates.low * storyMultiplier * regionalMultiplier).toFixed(2));
  const laborCostHigh = parseFloat((wallArea * laborRates.high * storyMultiplier * regionalMultiplier).toFixed(2));

  const removalCostLow = parseFloat((wallArea * removalRates.low).toFixed(2));
  const removalCostHigh = parseFloat((wallArea * removalRates.high).toFixed(2));

  const housewrapCostLow = parseFloat((wallArea * housewrapRates.low).toFixed(2));
  const housewrapCostHigh = parseFloat((wallArea * housewrapRates.high).toFixed(2));

  const trimCost = parseFloat((wallArea * TRIM_RATE).toFixed(2));

  // ── Totals ────────────────────────────────────────────
  const totalLow = parseFloat((materialCostLow + laborCostLow + removalCostLow + housewrapCostLow + trimCost).toFixed(2));
  const totalHigh = parseFloat((materialCostHigh + laborCostHigh + removalCostHigh + housewrapCostHigh + trimCost).toFixed(2));
  const totalMid = parseFloat(((totalLow + totalHigh) / 2).toFixed(2));
  const costPerSqFt = wallArea > 0 ? parseFloat((totalMid / wallArea).toFixed(2)) : 0;

  // ── Mid-point outputs for display ─────────────────────
  const materialCost = parseFloat(((materialCostLow + materialCostHigh) / 2).toFixed(2));
  const laborCost = parseFloat(((laborCostLow + laborCostHigh) / 2).toFixed(2));
  const removalCost = parseFloat(((removalCostLow + removalCostHigh) / 2).toFixed(2));
  const housewrapCost = parseFloat(((housewrapCostLow + housewrapCostHigh) / 2).toFixed(2));

  // ── Siding comparison (all at 1-story, national, no removal/wrap) ──
  const materialKeys = Object.keys(SIDING_MATERIAL_RATES);
  const sidingComparison = materialKeys.map(key => {
    const mRates = SIDING_MATERIAL_RATES[key];
    const lRates = SIDING_LABOR_RATES[key];
    const midMat = wallArea * (mRates.low + mRates.high) / 2;
    const midLab = wallArea * (lRates.low + lRates.high) / 2;
    const midTotal = midMat + midLab + trimCost;
    const installedLow = mRates.low + lRates.low;
    const installedHigh = mRates.high + lRates.high;
    return {
      label: `${MATERIAL_LABELS[key]} ($${installedLow}–$${installedHigh}/sq ft)`,
      value: parseFloat(midTotal.toFixed(2)),
    };
  });

  // ── Timeline ──────────────────────────────────────────
  const timeline = TIMELINE_ESTIMATES[sidingType] ?? '1–3 weeks';

  return {
    wallArea,
    materialCost,
    laborCost,
    removalCost,
    housewrapCost,
    trimCost,
    totalLow,
    totalHigh,
    totalMid,
    costPerSqFt,
    sidingComparison,
    timeline,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'siding-replacement-cost': calculateSidingReplacementCost,
};
