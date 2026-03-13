/**
 * Regrouting Cost Calculator Formula Module
 *
 * Estimates the cost to regrout existing tile, including grout material,
 * labor, old grout removal, and optional sealing.
 *
 * Cost formula (split labor/material with regional multiplier on labor only):
 *   materialCostLow  = area × materialRateLow
 *   materialCostHigh = area × materialRateHigh
 *   laborCostLow     = area × laborRateLow × regionalMultiplier
 *   laborCostHigh    = area × laborRateHigh × regionalMultiplier
 *   removalCost      = area × removalRate
 *   sealingCost      = area × sealingRate
 *   totalLow  = materialCostLow + laborCostLow + removalCost + sealingCost
 *   totalHigh = materialCostHigh + laborCostHigh + removalCost + sealingCost
 *   totalMid  = (totalLow + totalHigh) / 2
 *   costPerSqFt = totalMid / area
 *
 * Source: HomeAdvisor / Angi 2025-2026 national averages,
 *         Tile Council of North America
 */

export interface RegroutingCostInput {
  area: number;
  groutType: string;       // 'standard-sanded' | 'epoxy' | 'urethane'
  groutRemoval: string;    // 'manual' | 'power-tool' | 'none'
  groutSealing: string;    // 'none' | 'standard-sealer' | 'premium-sealer'
  region: string;          // 'national' | 'northeast' | 'west-coast' | 'mid-atlantic' | 'midwest' | 'south' | 'mountain-west'
}

export interface RegroutingCostOutput {
  area: number;
  materialCost: { low: number; high: number };
  laborCost: { low: number; high: number };
  removalCost: number;
  sealingCost: number;
  totalLow: number;
  totalHigh: number;
  totalMid: number;
  costPerSqFt: number;
  groutComparison: { label: string; value: number }[];
  timeline: string;
}

/**
 * Regional labor multipliers — applied to labor costs only, not materials.
 * Source: HomeAdvisor regional cost index 2025-2026.
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
 * Material cost per square foot by grout type (~30% of installed cost).
 * Source: HomeAdvisor, Angi 2025-2026.
 */
const MATERIAL_RATES: Record<string, { low: number; high: number }> = {
  'standard-sanded': { low: 1.50, high: 3.00 },
  'epoxy':           { low: 2.40, high: 4.50 },
  'urethane':        { low: 3.00, high: 5.40 },
};

/**
 * Labor cost per square foot by grout type (~70% of installed cost).
 * Source: HomeAdvisor, Angi 2025-2026.
 */
const LABOR_RATES: Record<string, { low: number; high: number }> = {
  'standard-sanded': { low: 3.50, high: 7.00 },
  'epoxy':           { low: 5.60, high: 10.50 },
  'urethane':        { low: 7.00, high: 12.60 },
};

/**
 * Grout removal cost per square foot.
 * - manual: $3/sq ft (slower, lower risk of chipping)
 * - power-tool: $1.50/sq ft (faster, slight chip risk)
 * - none: $0 (overlay only — not recommended)
 */
const REMOVAL_RATES: Record<string, number> = {
  'manual':     3.00,
  'power-tool': 1.50,
  'none':       0,
};

/**
 * Sealing cost per square foot.
 * - none: $0
 * - standard-sealer: $1.50/sq ft
 * - premium-sealer: $2.50/sq ft
 */
const SEALING_RATES: Record<string, number> = {
  'none':            0,
  'standard-sealer': 1.50,
  'premium-sealer':  2.50,
};

/**
 * Grout type display labels for comparison output.
 */
const GROUT_LABELS: Record<string, string> = {
  'standard-sanded': 'Standard Sanded',
  'epoxy':           'Epoxy',
  'urethane':        'Urethane',
};

/**
 * Timeline estimates by grout type.
 */
const TIMELINE_ESTIMATES: Record<string, string> = {
  'standard-sanded': '1–2 days (24-hour cure before wet use)',
  'epoxy':           '2–3 days (48-hour full cure)',
  'urethane':        '2–3 days (48-hour full cure)',
};

/**
 * Regrouting cost calculator.
 *
 * totalLow  = area × materialRateLow + area × laborRateLow × regionMult + area × removalRate + area × sealRate
 * totalHigh = area × materialRateHigh + area × laborRateHigh × regionMult + area × removalRate + area × sealRate
 * totalMid  = (totalLow + totalHigh) / 2
 *
 * Source: HomeAdvisor / Angi 2025-2026, Tile Council of North America.
 */
export function calculateRegroutingCost(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const area = Math.max(Number(inputs.area) || 0, 0);
  const groutType = String(inputs.groutType || 'standard-sanded');
  const groutRemoval = String(inputs.groutRemoval || 'manual');
  const groutSealing = String(inputs.groutSealing || 'none');
  const region = String(inputs.region || 'national');

  // ── Look up rates ─────────────────────────────────────
  const materialRate = MATERIAL_RATES[groutType] ?? MATERIAL_RATES['standard-sanded'];
  const laborRate = LABOR_RATES[groutType] ?? LABOR_RATES['standard-sanded'];
  const removalRate = REMOVAL_RATES[groutRemoval] ?? 0;
  const sealingRate = SEALING_RATES[groutSealing] ?? 0;
  const regionalMultiplier = REGIONAL_MULTIPLIERS[region] ?? 1.0;

  // ── Calculate component costs ─────────────────────────
  const materialCostLow = parseFloat((area * materialRate.low).toFixed(2));
  const materialCostHigh = parseFloat((area * materialRate.high).toFixed(2));
  const laborCostLow = parseFloat((area * laborRate.low * regionalMultiplier).toFixed(2));
  const laborCostHigh = parseFloat((area * laborRate.high * regionalMultiplier).toFixed(2));
  const removalCost = parseFloat((area * removalRate).toFixed(2));
  const sealingCost = parseFloat((area * sealingRate).toFixed(2));

  // ── Calculate totals ──────────────────────────────────
  const totalLow = parseFloat((materialCostLow + laborCostLow + removalCost + sealingCost).toFixed(2));
  const totalHigh = parseFloat((materialCostHigh + laborCostHigh + removalCost + sealingCost).toFixed(2));
  const totalMid = parseFloat(((totalLow + totalHigh) / 2).toFixed(2));
  const costPerSqFt = area > 0 ? parseFloat((totalMid / area).toFixed(2)) : 0;

  // ── Grout comparison (all 3 types at national, with user's removal & sealing) ──
  const groutKeys = Object.keys(MATERIAL_RATES);
  const groutComparison = groutKeys.map(key => {
    const mRate = MATERIAL_RATES[key];
    const lRate = LABOR_RATES[key];
    const midMaterial = area * (mRate.low + mRate.high) / 2;
    const midLabor = area * (lRate.low + lRate.high) / 2;
    const mid = midMaterial + midLabor + removalCost + sealingCost;
    return {
      label: `${GROUT_LABELS[key]} ($${(mRate.low + lRate.low).toFixed(0)}–$${(mRate.high + lRate.high).toFixed(0)}/sq ft)`,
      value: parseFloat(mid.toFixed(2)),
    };
  });

  // ── Timeline ──────────────────────────────────────────
  const timeline = TIMELINE_ESTIMATES[groutType] ?? '1–2 days';

  return {
    area,
    materialCost: { low: materialCostLow, high: materialCostHigh },
    laborCost: { low: laborCostLow, high: laborCostHigh },
    removalCost,
    sealingCost,
    totalLow,
    totalHigh,
    totalMid,
    costPerSqFt,
    groutComparison,
    timeline,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'regrouting-cost': calculateRegroutingCost,
};
