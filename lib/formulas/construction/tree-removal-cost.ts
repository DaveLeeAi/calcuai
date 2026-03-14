/**
 * Tree Removal Cost Calculator Formula Module
 *
 * Estimates tree removal costs based on height, trunk diameter, condition,
 * proximity to structures, stump removal, and cleanup options.
 * Splits costs into material (30%) and labor (70%) components,
 * with regional labor multipliers.
 *
 * Cost formula:
 *   baseLow  = heightRateLow × trunkMult × conditionMult × proximityMult
 *   baseHigh = heightRateHigh × trunkMult × conditionMult × proximityMult
 *   materialLow  = baseLow × 0.30
 *   materialHigh = baseHigh × 0.30
 *   laborLow  = baseLow × 0.70 × regionalMultiplier
 *   laborHigh = baseHigh × 0.70 × regionalMultiplier
 *   treeCostLow  = materialLow + laborLow
 *   treeCostHigh = materialHigh + laborHigh
 *   stumpCostLow / stumpCostHigh = stump add-on range
 *   cleanupCostLow / cleanupCostHigh = cleanup add-on range
 *   totalLow  = treeCostLow + stumpCostLow + cleanupCostLow
 *   totalHigh = treeCostHigh + stumpCostHigh + cleanupCostHigh
 *   totalMid  = (totalLow + totalHigh) / 2
 *
 * Source: HomeAdvisor / Angi 2025-2026 national averages;
 *         International Society of Arboriculture (ISA)
 */

export interface TreeRemovalCostInput {
  treeHeight: string;       // 'small-under-25ft' | 'medium-25-50ft' | 'large-50-75ft' | 'xlarge-over-75ft'
  trunkDiameter: string;    // 'thin-under-12in' | 'medium-12-24in' | 'thick-over-24in'
  condition: string;        // 'healthy' | 'dead-diseased' | 'storm-damaged'
  proximity: string;        // 'open-yard' | 'near-structure' | 'near-power-lines'
  stumpRemoval: string;     // 'none' | 'grinding' | 'full-removal'
  cleanup: string;          // 'leave-debris' | 'chip-and-haul'
  region: string;           // 'national' | 'northeast' | 'west-coast' | 'mid-atlantic' | 'midwest' | 'south' | 'mountain-west'
}

export interface TreeRemovalCostOutput {
  treeCost: number;
  stumpCost: number;
  cleanupCost: number;
  totalLow: number;
  totalHigh: number;
  totalMid: number;
  costPerTree: number;
  sizeComparison: { label: string; value: number }[];
  timeline: string;
  permitNote: string;
}

/**
 * Tree height base cost ranges (total removal before stump/cleanup).
 * Source: HomeAdvisor / Angi 2025-2026.
 */
const HEIGHT_RATES: Record<string, { low: number; high: number }> = {
  'small-under-25ft':  { low: 200,  high: 500 },
  'medium-25-50ft':    { low: 500,  high: 1200 },
  'large-50-75ft':     { low: 1200, high: 2500 },
  'xlarge-over-75ft':  { low: 2500, high: 5000 },
};

/**
 * Trunk diameter multipliers.
 * Thin (under 12") is baseline (1.0x).
 * Source: HomeAdvisor / Angi 2025-2026, ISA pricing guidelines.
 */
const TRUNK_MULTIPLIERS: Record<string, number> = {
  'thin-under-12in':   1.00,
  'medium-12-24in':    1.20,
  'thick-over-24in':   1.50,
};

/**
 * Tree condition multipliers.
 * Healthy is baseline (1.0x). Dead/diseased and storm-damaged cost more
 * due to unpredictable structural integrity.
 * Source: HomeAdvisor / ISA 2025-2026.
 */
const CONDITION_MULTIPLIERS: Record<string, number> = {
  'healthy':        1.00,
  'dead-diseased':  1.15,
  'storm-damaged':  1.30,
};

/**
 * Proximity multipliers.
 * Open yard is baseline (1.0x). Near structures/power lines increases risk and labor.
 * Source: HomeAdvisor / Angi 2025-2026.
 */
const PROXIMITY_MULTIPLIERS: Record<string, number> = {
  'open-yard':         1.00,
  'near-structure':    1.25,
  'near-power-lines':  1.50,
};

/**
 * Stump removal add-on cost ranges.
 * Source: HomeAdvisor / Angi 2025-2026.
 */
const STUMP_COSTS: Record<string, { low: number; high: number }> = {
  'none':          { low: 0,   high: 0 },
  'grinding':      { low: 150, high: 400 },
  'full-removal':  { low: 300, high: 700 },
};

/**
 * Cleanup add-on cost ranges.
 * Source: HomeAdvisor / Angi 2025-2026.
 */
const CLEANUP_COSTS: Record<string, { low: number; high: number }> = {
  'leave-debris':   { low: 0,  high: 0 },
  'chip-and-haul':  { low: 75, high: 200 },
};

/**
 * Regional labor multipliers — applied to labor portion only.
 * Source: HomeAdvisor regional cost index 2025-2026.
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
 * Display labels for tree height sizes.
 */
const HEIGHT_LABELS: Record<string, string> = {
  'small-under-25ft':  'Small (Under 25 ft)',
  'medium-25-50ft':    'Medium (25-50 ft)',
  'large-50-75ft':     'Large (50-75 ft)',
  'xlarge-over-75ft':  'Extra Large (Over 75 ft)',
};

/**
 * Timeline estimates by tree height.
 */
const TIMELINE_ESTIMATES: Record<string, string> = {
  'small-under-25ft':  '2-4 hours',
  'medium-25-50ft':    '4-8 hours (half day to full day)',
  'large-50-75ft':     '1-2 days',
  'xlarge-over-75ft':  '2-3 days',
};

/**
 * Tree removal cost calculator.
 *
 * totalLow  = treeCostLow + stumpCostLow + cleanupCostLow
 * totalHigh = treeCostHigh + stumpCostHigh + cleanupCostHigh
 * totalMid  = (totalLow + totalHigh) / 2
 *
 * Source: HomeAdvisor / Angi 2025-2026, ISA.
 */
export function calculateTreeRemovalCost(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const treeHeight = String(inputs.treeHeight || 'medium-25-50ft');
  const trunkDiameter = String(inputs.trunkDiameter || 'thin-under-12in');
  const condition = String(inputs.condition || 'healthy');
  const proximity = String(inputs.proximity || 'open-yard');
  const stumpRemoval = String(inputs.stumpRemoval || 'none');
  const cleanup = String(inputs.cleanup || 'leave-debris');
  const region = String(inputs.region || 'national');

  // ── Look up rates ─────────────────────────────────────
  const heightRate = HEIGHT_RATES[treeHeight] ?? HEIGHT_RATES['medium-25-50ft'];
  const trunkMult = TRUNK_MULTIPLIERS[trunkDiameter] ?? 1.0;
  const conditionMult = CONDITION_MULTIPLIERS[condition] ?? 1.0;
  const proximityMult = PROXIMITY_MULTIPLIERS[proximity] ?? 1.0;
  const stumpRange = STUMP_COSTS[stumpRemoval] ?? STUMP_COSTS['none'];
  const cleanupRange = CLEANUP_COSTS[cleanup] ?? CLEANUP_COSTS['leave-debris'];
  const regionMult = REGIONAL_MULTIPLIERS[region] ?? 1.0;

  // ── Calculate base tree removal cost ──────────────────
  const baseLow = parseFloat((heightRate.low * trunkMult * conditionMult * proximityMult).toFixed(2));
  const baseHigh = parseFloat((heightRate.high * trunkMult * conditionMult * proximityMult).toFixed(2));

  // ── Split into material (30%) and labor (70%) ─────────
  const materialLow = parseFloat((baseLow * 0.30).toFixed(2));
  const materialHigh = parseFloat((baseHigh * 0.30).toFixed(2));
  const laborLow = parseFloat((baseLow * 0.70 * regionMult).toFixed(2));
  const laborHigh = parseFloat((baseHigh * 0.70 * regionMult).toFixed(2));

  // ── Tree cost (material + labor) ──────────────────────
  const treeCostLow = parseFloat((materialLow + laborLow).toFixed(2));
  const treeCostHigh = parseFloat((materialHigh + laborHigh).toFixed(2));

  // ── Stump and cleanup add-ons ─────────────────────────
  const stumpCostLow = stumpRange.low;
  const stumpCostHigh = stumpRange.high;
  const cleanupCostLow = cleanupRange.low;
  const cleanupCostHigh = cleanupRange.high;

  // ── Totals ────────────────────────────────────────────
  const totalLow = parseFloat((treeCostLow + stumpCostLow + cleanupCostLow).toFixed(2));
  const totalHigh = parseFloat((treeCostHigh + stumpCostHigh + cleanupCostHigh).toFixed(2));
  const totalMid = parseFloat(((totalLow + totalHigh) / 2).toFixed(2));

  // ── Mid-point costs for display ───────────────────────
  const treeCost = parseFloat(((treeCostLow + treeCostHigh) / 2).toFixed(2));
  const stumpCost = parseFloat(((stumpCostLow + stumpCostHigh) / 2).toFixed(2));
  const cleanupCost = parseFloat(((cleanupCostLow + cleanupCostHigh) / 2).toFixed(2));
  const costPerTree = totalMid;

  // ── Size comparison (all 4 heights, national, thin trunk, healthy, open yard, no stump/cleanup) ──
  const heightKeys = Object.keys(HEIGHT_RATES);
  const sizeComparison = heightKeys.map(key => {
    const hr = HEIGHT_RATES[key];
    const bLow = hr.low;
    const bHigh = hr.high;
    // Material (30%) + Labor (70%) at national rate
    const mLow = bLow * 0.30;
    const mHigh = bHigh * 0.30;
    const lLow = bLow * 0.70;
    const lHigh = bHigh * 0.70;
    const mid = (mLow + lLow + mHigh + lHigh) / 2;
    return {
      label: `${HEIGHT_LABELS[key]} ($${hr.low}-$${hr.high})`,
      value: parseFloat(mid.toFixed(2)),
    };
  });

  // ── Timeline ──────────────────────────────────────────
  const timeline = TIMELINE_ESTIMATES[treeHeight] ?? '4-8 hours';

  // ── Permit note ───────────────────────────────────────
  const permitNote = 'Most municipalities require a permit to remove trees over a certain height or trunk diameter. Check with your local planning or zoning department before scheduling removal.';

  return {
    treeCost,
    stumpCost,
    cleanupCost,
    totalLow,
    totalHigh,
    totalMid,
    costPerTree,
    sizeComparison,
    timeline,
    permitNote,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'tree-removal-cost': calculateTreeRemovalCost,
};
