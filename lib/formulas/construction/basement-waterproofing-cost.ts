/**
 * Basement Waterproofing Cost Calculator Formula Module
 *
 * Estimates basement waterproofing costs across four methods:
 * interior sealant, interior drainage system, exterior excavation,
 * and combination (interior drainage + exterior membrane).
 * Includes crack repair add-ons, sump pump options, and regional labor multipliers.
 *
 * Cost formula:
 *   waterproofingLow  = wallLength × methodRateLow
 *   waterproofingHigh = wallLength × methodRateHigh
 *   materialLow  = waterproofingLow × 0.30
 *   materialHigh = waterproofingHigh × 0.30
 *   laborLow   = waterproofingLow × 0.70 × regionMult
 *   laborHigh  = waterproofingHigh × 0.70 × regionMult
 *   crackLow / crackHigh = crack repair cost range
 *   sumpLow / sumpHigh = sump pump cost range
 *   totalLow  = materialLow + laborLow + crackLow + sumpLow
 *   totalHigh = materialHigh + laborHigh + crackHigh + sumpHigh
 *   totalMid  = (totalLow + totalHigh) / 2
 *   costPerLinearFoot = totalMid / wallLength
 *
 * Source: HomeAdvisor / Angi 2025-2026 national averages;
 *         Basement Health Association waterproofing cost data
 */

export interface BasementWaterproofingCostInput {
  basementSize: string;      // 'small-under-500' | 'medium-500-1000' | 'large-1000-1500' | 'xlarge-over-1500'
  method: string;            // 'interior-sealant' | 'interior-drainage' | 'exterior-excavation' | 'combination'
  wallLength: number;        // linear feet of basement wall, default 100
  crackRepair: string;       // 'none' | 'minor' | 'major'
  sumpPump: string;          // 'none' | 'standard' | 'battery-backup'
  region: string;            // 'national' | 'northeast' | 'west-coast' | 'mid-atlantic' | 'midwest' | 'south' | 'mountain-west'
}

export interface BasementWaterproofingCostOutput {
  waterproofingCost: number;
  crackRepairCost: number;
  sumpPumpCost: number;
  materialCost: number;
  laborCost: number;
  totalLow: number;
  totalHigh: number;
  totalMid: number;
  costPerLinearFoot: number;
  methodComparison: { label: string; value: number }[];
  timeline: string;
}

/**
 * Method cost per linear foot of basement wall.
 * Source: HomeAdvisor / Angi 2025-2026.
 */
const METHOD_COSTS: Record<string, { low: number; high: number }> = {
  'interior-sealant':      { low: 3,   high: 7 },
  'interior-drainage':     { low: 50,  high: 100 },
  'exterior-excavation':   { low: 100, high: 200 },
  'combination':           { low: 80,  high: 150 },
};

/**
 * Crack repair cost ranges (flat add-on).
 * Source: HomeAdvisor / Angi 2025-2026.
 */
const CRACK_REPAIR_COSTS: Record<string, { low: number; high: number }> = {
  'none':  { low: 0,    high: 0 },
  'minor': { low: 250,  high: 800 },
  'major': { low: 1000, high: 3000 },
};

/**
 * Sump pump cost ranges (flat add-on, installed).
 * Source: HomeAdvisor / Angi 2025-2026.
 */
const SUMP_PUMP_COSTS: Record<string, { low: number; high: number }> = {
  'none':           { low: 0,    high: 0 },
  'standard':       { low: 500,  high: 1500 },
  'battery-backup': { low: 1000, high: 3000 },
};

/**
 * Regional labor multipliers — applied to labor portion only.
 * Source: HomeAdvisor regional cost index 2025-2026.
 */
const REGIONAL_MULTIPLIERS: Record<string, number> = {
  'national':      1.00,
  'northeast':     1.20,
  'west-coast':    1.25,
  'mid-atlantic':  1.15,
  'midwest':       0.90,
  'south':         0.85,
  'mountain-west': 0.95,
};

/**
 * Display labels for waterproofing methods.
 */
const METHOD_LABELS: Record<string, string> = {
  'interior-sealant':    'Interior Sealant',
  'interior-drainage':   'Interior Drainage System',
  'exterior-excavation': 'Exterior Excavation',
  'combination':         'Combination (Interior + Exterior)',
};

/**
 * Timeline estimates by method.
 */
const TIMELINE_ESTIMATES: Record<string, string> = {
  'interior-sealant':    '1-2 days',
  'interior-drainage':   '2-4 days',
  'exterior-excavation': '5-10 days',
  'combination':         '7-14 days',
};

/**
 * Default wall length by basement size (linear feet of perimeter wall).
 */
const DEFAULT_WALL_LENGTHS: Record<string, number> = {
  'small-under-500':  80,
  'medium-500-1000':  120,
  'large-1000-1500':  150,
  'xlarge-over-1500': 180,
};

/**
 * Basement waterproofing cost calculator.
 *
 * totalLow  = materialLow + laborLow + crackLow + sumpLow
 * totalHigh = materialHigh + laborHigh + crackHigh + sumpHigh
 * totalMid  = (totalLow + totalHigh) / 2
 *
 * Source: HomeAdvisor / Angi 2025-2026, Basement Health Association.
 */
export function calculateBasementWaterproofingCost(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const basementSize = String(inputs.basementSize || 'medium-500-1000');
  const method = String(inputs.method || 'interior-drainage');
  const soilTypeOrWall = inputs.wallLength;
  const wallLength = Math.max(20, Math.min(500, Number(soilTypeOrWall) || DEFAULT_WALL_LENGTHS[basementSize] || 100));
  const crackRepair = String(inputs.crackRepair || 'none');
  const sumpPump = String(inputs.sumpPump || 'none');
  const region = String(inputs.region || 'national');

  // ── Look up rates ─────────────────────────────────────
  const methodRate = METHOD_COSTS[method] ?? METHOD_COSTS['interior-drainage'];
  const crackRange = CRACK_REPAIR_COSTS[crackRepair] ?? CRACK_REPAIR_COSTS['none'];
  const sumpRange = SUMP_PUMP_COSTS[sumpPump] ?? SUMP_PUMP_COSTS['none'];
  const regionMult = REGIONAL_MULTIPLIERS[region] ?? 1.0;

  // ── Calculate waterproofing base cost ─────────────────
  const waterproofingLow = wallLength * methodRate.low;
  const waterproofingHigh = wallLength * methodRate.high;

  // ── Material cost (30% of waterproofing) ──────────────
  const materialLow = parseFloat((waterproofingLow * 0.30).toFixed(2));
  const materialHigh = parseFloat((waterproofingHigh * 0.30).toFixed(2));

  // ── Labor cost (70% of waterproofing × region) ────────
  const laborLow = parseFloat((waterproofingLow * 0.70 * regionMult).toFixed(2));
  const laborHigh = parseFloat((waterproofingHigh * 0.70 * regionMult).toFixed(2));

  // ── Crack repair ──────────────────────────────────────
  const crackLow = crackRange.low;
  const crackHigh = crackRange.high;

  // ── Sump pump ─────────────────────────────────────────
  const sumpLow = sumpRange.low;
  const sumpHigh = sumpRange.high;

  // ── Totals ────────────────────────────────────────────
  const totalLow = parseFloat((materialLow + laborLow + crackLow + sumpLow).toFixed(2));
  const totalHigh = parseFloat((materialHigh + laborHigh + crackHigh + sumpHigh).toFixed(2));
  const totalMid = parseFloat(((totalLow + totalHigh) / 2).toFixed(2));
  const costPerLinearFoot = wallLength > 0 ? parseFloat((totalMid / wallLength).toFixed(2)) : 0;

  // ── Mid-point costs for display ───────────────────────
  const waterproofingCost = parseFloat(((materialLow + materialHigh + laborLow + laborHigh) / 2).toFixed(2));
  const crackRepairCost = parseFloat(((crackLow + crackHigh) / 2).toFixed(2));
  const sumpPumpCost = parseFloat(((sumpLow + sumpHigh) / 2).toFixed(2));
  const materialCost = parseFloat(((materialLow + materialHigh) / 2).toFixed(2));
  const laborCost = parseFloat(((laborLow + laborHigh) / 2).toFixed(2));

  // ── Method comparison (all 4 methods, user's wall length, national, no crack repair, no sump) ──
  const methodKeys = Object.keys(METHOD_COSTS);
  const methodComparison = methodKeys.map(key => {
    const rate = METHOD_COSTS[key];
    const wLow = wallLength * rate.low;
    const wHigh = wallLength * rate.high;
    const mLow = wLow * 0.30;
    const mHigh = wHigh * 0.30;
    const lLow = wLow * 0.70;
    const lHigh = wHigh * 0.70;
    const mid = (mLow + mHigh + lLow + lHigh) / 2;
    return {
      label: METHOD_LABELS[key],
      value: parseFloat(mid.toFixed(2)),
    };
  });

  // ── Timeline ──────────────────────────────────────────
  const timeline = TIMELINE_ESTIMATES[method] ?? '2-4 days';

  return {
    waterproofingCost,
    crackRepairCost,
    sumpPumpCost,
    materialCost,
    laborCost,
    totalLow,
    totalHigh,
    totalMid,
    costPerLinearFoot,
    methodComparison,
    timeline,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'basement-waterproofing-cost': calculateBasementWaterproofingCost,
};
