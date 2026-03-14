/**
 * Radon Mitigation Cost Calculator Formula Module
 *
 * Estimates radon mitigation system installation costs across five foundation
 * types and five mitigation methods. Factors in home size, piping route,
 * fan type, and regional labor multipliers. Labor is 55% of total cost.
 *
 * Cost formula:
 *   baseCost = FOUNDATION_COSTS[foundationType]
 *   adjustedBase = baseCost × methodMultiplier × homeSizeMultiplier × pipingMultiplier × fanMultiplier
 *   equipmentCost = adjustedBase × 0.45
 *   laborCost = adjustedBase × 0.55 × regionalMultiplier
 *   total = equipmentCost + laborCost
 *
 * Source: HomeAdvisor / Angi 2025-2026 national averages;
 *         EPA Radon Mitigation Standards (EPA 402-R-93-078);
 *         AARST/NRPP certified mitigator rate surveys
 */

export interface RadonMitigationCostInput {
  foundationType: string;    // 'slab-on-grade' | 'basement-unfinished' | 'basement-finished' | 'crawl-space' | 'mixed-foundation'
  mitigationMethod: string;  // 'sub-slab-depressurization' | 'sub-membrane-depressurization' | 'drain-tile-suction' | 'block-wall-suction' | 'heat-recovery-ventilator'
  homeSize: string;          // 'small-under-1500' | 'medium-1500-2500' | 'standard-2500-3500' | 'large-over-3500'
  pipingRoute: string;       // 'interior-closet' | 'exterior-wall' | 'garage-route'
  fanType: string;           // 'standard' | 'high-suction' | 'ultra-quiet'
  region: string;            // 'national' | 'northeast' | 'west-coast' | 'mid-atlantic' | 'midwest' | 'south' | 'mountain-west'
}

export interface RadonMitigationCostOutput {
  equipmentCost: number;
  laborCost: number;
  subtotalLow: number;
  subtotalHigh: number;
  subtotal: number;
  totalLow: number;
  totalHigh: number;
  totalMid: number;
  methodComparison: { label: string; value: number }[];
  annualFanCost: string;
  timeline: string;
}

/**
 * Foundation type base cost ranges (total installed before multipliers).
 * Source: HomeAdvisor / Angi 2025-2026, EPA guidelines.
 */
const FOUNDATION_COSTS: Record<string, { low: number; high: number }> = {
  'slab-on-grade':        { low: 800,  high: 1500 },
  'basement-unfinished':  { low: 900,  high: 1800 },
  'basement-finished':    { low: 1200, high: 2500 },
  'crawl-space':          { low: 1000, high: 2000 },
  'mixed-foundation':     { low: 1500, high: 3000 },
};

/**
 * Mitigation method multipliers applied to foundation base cost.
 * Sub-slab depressurization is baseline (1.0x).
 */
const METHOD_MULTIPLIERS: Record<string, number> = {
  'sub-slab-depressurization':     1.0,
  'sub-membrane-depressurization': 1.10,
  'drain-tile-suction':            1.25,
  'block-wall-suction':            1.15,
  'heat-recovery-ventilator':      1.75,
};

/**
 * Home size multipliers.
 * Small is baseline (1.0x).
 */
const HOME_SIZE_MULTIPLIERS: Record<string, number> = {
  'small-under-1500':  1.0,
  'medium-1500-2500':  1.10,
  'standard-2500-3500': 1.20,
  'large-over-3500':   1.35,
};

/**
 * Piping route multipliers.
 * Interior closet is baseline (1.0x).
 */
const PIPING_MULTIPLIERS: Record<string, number> = {
  'interior-closet': 1.0,
  'exterior-wall':   1.10,
  'garage-route':    0.95,
};

/**
 * Fan type multipliers.
 * Standard is baseline (1.0x).
 */
const FAN_MULTIPLIERS: Record<string, number> = {
  'standard':      1.0,
  'high-suction':  1.15,
  'ultra-quiet':   1.25,
};

/**
 * Regional labor multipliers.
 * Applied to labor portion only (55% of total), not equipment.
 */
const REGIONAL_MULTIPLIERS: Record<string, number> = {
  'national':      1.0,
  'northeast':     1.20,
  'west-coast':    1.25,
  'mid-atlantic':  1.15,
  'midwest':       0.90,
  'south':         0.85,
  'mountain-west': 0.95,
};

/**
 * Display labels for mitigation methods.
 */
const METHOD_LABELS: Record<string, string> = {
  'sub-slab-depressurization':     'Sub-Slab Depressurization (SSD)',
  'sub-membrane-depressurization': 'Sub-Membrane Depressurization (SMD)',
  'drain-tile-suction':            'Drain Tile Suction',
  'block-wall-suction':            'Block Wall Suction',
  'heat-recovery-ventilator':      'Heat Recovery Ventilator (HRV)',
};

/**
 * Radon mitigation cost calculator.
 *
 * adjustedCost = foundationBase × methodMult × sizeMult × pipingMult × fanMult
 * equipmentCost = adjustedCost × 0.45
 * laborCost = adjustedCost × 0.55 × regionalMultiplier
 * total = equipmentCost + laborCost
 *
 * Source: HomeAdvisor / Angi 2025-2026, EPA 402-R-93-078, AARST/NRPP.
 */
export function calculateRadonMitigationCost(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const foundationType = String(inputs.foundationType || 'slab-on-grade');
  const mitigationMethod = String(inputs.mitigationMethod || 'sub-slab-depressurization');
  const homeSize = String(inputs.homeSize || 'medium-1500-2500');
  const pipingRoute = String(inputs.pipingRoute || 'interior-closet');
  const fanType = String(inputs.fanType || 'standard');
  const region = String(inputs.region || 'national');

  // ── Look up rates ─────────────────────────────────────
  const foundationRates = FOUNDATION_COSTS[foundationType] ?? FOUNDATION_COSTS['slab-on-grade'];
  const methodMult = METHOD_MULTIPLIERS[mitigationMethod] ?? 1.0;
  const sizeMult = HOME_SIZE_MULTIPLIERS[homeSize] ?? 1.10;
  const pipingMult = PIPING_MULTIPLIERS[pipingRoute] ?? 1.0;
  const fanMult = FAN_MULTIPLIERS[fanType] ?? 1.0;
  const regionMult = REGIONAL_MULTIPLIERS[region] ?? 1.0;

  // ── Adjusted base cost (all multipliers except regional) ─
  const adjustedLow = parseFloat((foundationRates.low * methodMult * sizeMult * pipingMult * fanMult).toFixed(2));
  const adjustedHigh = parseFloat((foundationRates.high * methodMult * sizeMult * pipingMult * fanMult).toFixed(2));

  // ── Equipment cost (45% of adjusted base) ─────────────
  const equipmentCostLow = parseFloat((adjustedLow * 0.45).toFixed(2));
  const equipmentCostHigh = parseFloat((adjustedHigh * 0.45).toFixed(2));

  // ── Labor cost (55% of adjusted base × regional multiplier) ─
  const laborCostLow = parseFloat((adjustedLow * 0.55 * regionMult).toFixed(2));
  const laborCostHigh = parseFloat((adjustedHigh * 0.55 * regionMult).toFixed(2));

  // ── Subtotals (before regional — equipment + labor at national) ─
  const subtotalLow = parseFloat((adjustedLow * 0.45 + adjustedLow * 0.55).toFixed(2));
  const subtotalHigh = parseFloat((adjustedHigh * 0.45 + adjustedHigh * 0.55).toFixed(2));

  // ── Totals (equipment + labor with regional) ──────────
  const totalLow = parseFloat((equipmentCostLow + laborCostLow).toFixed(2));
  const totalHigh = parseFloat((equipmentCostHigh + laborCostHigh).toFixed(2));
  const totalMid = parseFloat(((totalLow + totalHigh) / 2).toFixed(2));

  // ── Mid-point costs for display ───────────────────────
  const equipmentCost = parseFloat(((equipmentCostLow + equipmentCostHigh) / 2).toFixed(2));
  const laborCost = parseFloat(((laborCostLow + laborCostHigh) / 2).toFixed(2));
  const subtotal = parseFloat(((subtotalLow + subtotalHigh) / 2).toFixed(2));

  // ── Method comparison (slab-on-grade, medium home, interior, standard fan, national) ──
  const methodKeys = Object.keys(METHOD_MULTIPLIERS);
  const comparisonFoundation = FOUNDATION_COSTS['slab-on-grade'];
  const methodComparison = methodKeys.map(key => {
    const mMult = METHOD_MULTIPLIERS[key];
    const midBase = (comparisonFoundation.low + comparisonFoundation.high) / 2;
    const adjusted = midBase * mMult * 1.10 * 1.0 * 1.0; // medium home, interior, standard fan
    const equip = adjusted * 0.45;
    const labor = adjusted * 0.55;
    const total = equip + labor;
    return {
      label: METHOD_LABELS[key] ?? key,
      value: parseFloat(total.toFixed(2)),
    };
  });

  // ── Annual fan cost ───────────────────────────────────
  const annualFanCost = '$50-150/year';

  // ── Timeline ──────────────────────────────────────────
  const timeline = '4-8 hours';

  return {
    equipmentCost,
    laborCost,
    subtotalLow,
    subtotalHigh,
    subtotal,
    totalLow,
    totalHigh,
    totalMid,
    methodComparison,
    annualFanCost,
    timeline,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'radon-mitigation-cost': calculateRadonMitigationCost,
};
