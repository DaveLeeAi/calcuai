/**
 * Concrete Patio Cost Calculator Formula Module
 *
 * Estimates concrete patio installation costs across five finish types:
 * broom-finish, stamped, exposed-aggregate, colored-stained, and polished.
 *
 * Cost formula (split labor/material with regional multiplier on labor only):
 *   area = length × width (converted to feet)
 *   materialCostLow  = area × (materialRateLow + thicknessAdj)
 *   materialCostHigh = area × (materialRateHigh + thicknessAdj)
 *   laborCostLow     = area × laborRateLow × regionalMultiplier
 *   laborCostHigh    = area × laborRateHigh × regionalMultiplier
 *   demoCost         = area × demoRate
 *   extrasCost       = sum of selected extras
 *   totalLow  = materialCostLow + laborCostLow + demoCost + extrasCost
 *   totalHigh = materialCostHigh + laborCostHigh + demoCost + extrasCost
 *   totalMid  = (totalLow + totalHigh) / 2
 *   costPerSqFt = totalMid / area
 *
 * Source: HomeAdvisor / Angi 2025-2026 national averages,
 *         Concrete Network, American Concrete Institute
 */

export interface ConcretePatioCostInput {
  length: number;
  lengthUnit: string;        // 'ft' | 'm'
  width: number;
  widthUnit: string;         // 'ft' | 'm'
  thickness: string;         // '4-inch' | '6-inch'
  finishType: string;        // 'broom-finish' | 'stamped' | 'exposed-aggregate' | 'colored-stained' | 'polished'
  demolition: string;        // 'none' | 'remove-old-patio'
  extras: string;            // 'none' | 'steps-1' | 'steps-2' | 'seating-wall'
  region: string;            // 'national' | 'northeast' | 'west-coast' | 'mid-atlantic' | 'midwest' | 'south' | 'mountain-west'
}

export interface ConcretePatioCostOutput {
  area: number;
  materialCost: { low: number; high: number };
  laborCost: { low: number; high: number };
  demoCost: number;
  extrasCost: number;
  totalLow: number;
  totalHigh: number;
  totalMid: number;
  costPerSqFt: number;
  finishComparison: { label: string; value: number }[];
  timeline: string;
}

/**
 * Unit conversion factors to feet.
 */
const lengthToFeet: Record<string, number> = {
  ft: 1,
  m: 3.28084,
};

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
 * Material cost per square foot by finish type (~40% of installed cost).
 * Source: HomeAdvisor, Angi, Concrete Network 2025-2026.
 */
const MATERIAL_RATES: Record<string, { low: number; high: number }> = {
  'broom-finish':       { low: 2.40, high: 4.80 },
  'stamped':            { low: 4.80, high: 8.00 },
  'exposed-aggregate':  { low: 4.00, high: 7.20 },
  'colored-stained':    { low: 3.20, high: 6.40 },
  'polished':           { low: 4.00, high: 8.00 },
};

/**
 * Labor cost per square foot by finish type (~60% of installed cost).
 * Source: HomeAdvisor, Angi, Concrete Network 2025-2026.
 */
const LABOR_RATES: Record<string, { low: number; high: number }> = {
  'broom-finish':       { low: 3.60, high: 7.20 },
  'stamped':            { low: 7.20, high: 12.00 },
  'exposed-aggregate':  { low: 6.00, high: 10.80 },
  'colored-stained':    { low: 4.80, high: 9.60 },
  'polished':           { low: 6.00, high: 12.00 },
};

/**
 * Thickness adjustment — additional material cost per sq ft.
 * 4-inch is standard (no additional). 6-inch adds $1/sqft material.
 */
const THICKNESS_ADJUSTMENTS: Record<string, number> = {
  '4-inch': 0,
  '6-inch': 1.00,
};

/**
 * Demolition costs per square foot.
 * - none: $0
 * - remove-old-patio: $3-$6/sq ft → we use midpoint $4.50 for low estimate, but
 *   split as low: $3, high: $6 for consistency. We'll use avg for single-value output.
 */
const DEMOLITION_RATES: Record<string, { low: number; high: number }> = {
  'none':             { low: 0, high: 0 },
  'remove-old-patio': { low: 3.00, high: 6.00 },
};

/**
 * Extras flat costs.
 * - none: $0
 * - steps-1: $400
 * - steps-2: $750
 * - seating-wall: $1,500
 */
const EXTRAS_COSTS: Record<string, number> = {
  'none':         0,
  'steps-1':      400,
  'steps-2':      750,
  'seating-wall': 1500,
};

/**
 * Finish type display labels for comparison output.
 */
const FINISH_LABELS: Record<string, string> = {
  'broom-finish':       'Broom Finish',
  'stamped':            'Stamped',
  'exposed-aggregate':  'Exposed Aggregate',
  'colored-stained':    'Colored/Stained',
  'polished':           'Polished',
};

/**
 * Timeline estimates by finish type.
 */
const TIMELINE_ESTIMATES: Record<string, string> = {
  'broom-finish':       '2–4 days (plus 7-day cure before heavy use)',
  'stamped':            '3–5 days (plus 7-day cure before heavy use)',
  'exposed-aggregate':  '3–5 days (plus 7-day cure before heavy use)',
  'colored-stained':    '3–5 days (plus 7-day cure before heavy use)',
  'polished':           '4–6 days (plus 7-day cure before heavy use)',
};

/**
 * Concrete patio cost calculator.
 *
 * totalLow  = area × (materialRateLow + thicknessAdj) + area × laborRateLow × regionMult + demoCostLow × area + extrasCost
 * totalHigh = area × (materialRateHigh + thicknessAdj) + area × laborRateHigh × regionMult + demoCostHigh × area + extrasCost
 * totalMid  = (totalLow + totalHigh) / 2
 *
 * Source: HomeAdvisor / Angi 2025-2026, Concrete Network, ACI.
 */
export function calculateConcretePatioCost(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const rawLength = Number(inputs.length) || 0;
  const rawWidth = Number(inputs.width) || 0;
  const lengthUnit = String(inputs.lengthUnit || 'ft');
  const widthUnit = String(inputs.widthUnit || 'ft');
  const thickness = String(inputs.thickness || '4-inch');
  const finishType = String(inputs.finishType || 'broom-finish');
  const demolition = String(inputs.demolition || 'none');
  const extras = String(inputs.extras || 'none');
  const region = String(inputs.region || 'national');

  // ── Convert to feet ───────────────────────────────────
  const lengthFt = rawLength * (lengthToFeet[lengthUnit] ?? 1);
  const widthFt = rawWidth * (lengthToFeet[widthUnit] ?? 1);

  // ── Calculate area ────────────────────────────────────
  const area = parseFloat((lengthFt * widthFt).toFixed(2));

  // ── Look up rates ─────────────────────────────────────
  const materialRate = MATERIAL_RATES[finishType] ?? MATERIAL_RATES['broom-finish'];
  const laborRate = LABOR_RATES[finishType] ?? LABOR_RATES['broom-finish'];
  const thicknessAdj = THICKNESS_ADJUSTMENTS[thickness] ?? 0;
  const demoRate = DEMOLITION_RATES[demolition] ?? DEMOLITION_RATES['none'];
  const extrasCost = EXTRAS_COSTS[extras] ?? 0;
  const regionalMultiplier = REGIONAL_MULTIPLIERS[region] ?? 1.0;

  // ── Calculate component costs ─────────────────────────
  const materialCostLow = parseFloat((area * (materialRate.low + thicknessAdj)).toFixed(2));
  const materialCostHigh = parseFloat((area * (materialRate.high + thicknessAdj)).toFixed(2));
  const laborCostLow = parseFloat((area * laborRate.low * regionalMultiplier).toFixed(2));
  const laborCostHigh = parseFloat((area * laborRate.high * regionalMultiplier).toFixed(2));
  const demoCostLow = parseFloat((area * demoRate.low).toFixed(2));
  const demoCostHigh = parseFloat((area * demoRate.high).toFixed(2));

  // ── Calculate totals ──────────────────────────────────
  const totalLow = parseFloat((materialCostLow + laborCostLow + demoCostLow + extrasCost).toFixed(2));
  const totalHigh = parseFloat((materialCostHigh + laborCostHigh + demoCostHigh + extrasCost).toFixed(2));
  const totalMid = parseFloat(((totalLow + totalHigh) / 2).toFixed(2));
  const costPerSqFt = area > 0 ? parseFloat((totalMid / area).toFixed(2)) : 0;

  // ── Demo cost as midpoint for single output ───────────
  const demoCost = parseFloat(((demoCostLow + demoCostHigh) / 2).toFixed(2));

  // ── Finish comparison (all 5 types at national, user's thickness, no demo/extras) ──
  const finishKeys = Object.keys(MATERIAL_RATES);
  const finishComparison = finishKeys.map(key => {
    const mRate = MATERIAL_RATES[key];
    const lRate = LABOR_RATES[key];
    const midMaterial = area * ((mRate.low + mRate.high) / 2 + thicknessAdj);
    const midLabor = area * (lRate.low + lRate.high) / 2;
    const mid = midMaterial + midLabor;
    const totalPerSqFt = (mRate.low + lRate.low + thicknessAdj);
    const totalPerSqFtHigh = (mRate.high + lRate.high + thicknessAdj);
    return {
      label: `${FINISH_LABELS[key]} ($${totalPerSqFt.toFixed(0)}–$${totalPerSqFtHigh.toFixed(0)}/sq ft)`,
      value: parseFloat(mid.toFixed(2)),
    };
  });

  // ── Timeline ──────────────────────────────────────────
  const timeline = TIMELINE_ESTIMATES[finishType] ?? '3–5 days';

  return {
    area,
    materialCost: { low: materialCostLow, high: materialCostHigh },
    laborCost: { low: laborCostLow, high: laborCostHigh },
    demoCost,
    extrasCost,
    totalLow,
    totalHigh,
    totalMid,
    costPerSqFt,
    finishComparison,
    timeline,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'concrete-patio-cost': calculateConcretePatioCost,
};
