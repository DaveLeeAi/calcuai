/**
 * Water Heater Cost Calculator Formula Module
 *
 * Estimates water heater purchase and installation costs across six heater types:
 * tank gas, tank electric, tankless gas, tankless electric, heat pump, and solar.
 * Splits costs into unit, labor, fuel conversion, venting, and permit components,
 * with regional labor multipliers.
 *
 * Cost formula:
 *   unitCostLow/High = heaterTypeBase + tankSizeAdjustment
 *   laborCostLow/High = heaterTypeLaborRate × regionalMultiplier
 *   fuelConversionCostLow/High = conversionRate (if applicable)
 *   ventingCostLow/High = ventingRate (if applicable)
 *   permitCostLow/High = $100–$300 (if applicable)
 *   totalLow = unitCostLow + laborCostLow + fuelConvLow + ventingLow + permitLow
 *   totalHigh = unitCostHigh + laborCostHigh + fuelConvHigh + ventingHigh + permitHigh
 *   totalMid = (totalLow + totalHigh) / 2
 *
 * Source: HomeAdvisor / Angi 2025-2026 Water Heater Cost Data;
 *         ENERGY STAR Water Heater Selection Guide;
 *         U.S. Department of Energy
 */

export interface WaterHeaterCostInput {
  heaterType: string;      // 'tank-gas' | 'tank-electric' | 'tankless-gas' | 'tankless-electric' | 'heat-pump' | 'solar'
  tankSize: string;        // '40-gallon' | '50-gallon' | '75-gallon' | 'tankless-standard' | 'tankless-high-flow'
  fuelConversion: string;  // 'none' | 'gas-to-electric' | 'electric-to-gas'
  ventingUpgrade: string;  // 'none' | 'standard-vent' | 'power-vent' | 'direct-vent'
  permitRequired: string;  // 'yes' | 'no'
  region: string;          // 'national' | 'northeast' | 'west-coast' | 'mid-atlantic' | 'midwest' | 'south' | 'mountain-west'
}

export interface WaterHeaterCostOutput {
  unitCost: number;
  laborCost: number;
  fuelConversionCost: number;
  ventingCost: number;
  permitCost: number;
  totalLow: number;
  totalHigh: number;
  totalMid: number;
  annualOperatingCost: number;
  heaterComparison: { label: string; value: number }[];
  paybackPeriod: string;
  timeline: string;
}

/**
 * Base unit cost by heater type (equipment only, before size adjustment).
 * Source: HomeAdvisor / Angi 2025-2026 national averages.
 */
const UNIT_COSTS: Record<string, { low: number; high: number }> = {
  'tank-gas':          { low: 800,  high: 1500 },
  'tank-electric':     { low: 600,  high: 1200 },
  'tankless-gas':      { low: 1500, high: 3000 },
  'tankless-electric': { low: 800,  high: 1500 },
  'heat-pump':         { low: 1500, high: 3500 },
  'solar':             { low: 3000, high: 6000 },
};

/**
 * Tank size / flow rate cost adjustments.
 * Applied on top of base unit cost.
 */
const SIZE_ADJUSTMENTS: Record<string, { low: number; high: number }> = {
  '40-gallon':          { low: 0,   high: 0 },
  '50-gallon':          { low: 100, high: 200 },
  '75-gallon':          { low: 200, high: 400 },
  'tankless-standard':  { low: 0,   high: 0 },
  'tankless-high-flow': { low: 300, high: 500 },
};

/**
 * Installation labor cost by heater type (labor portion only).
 * Source: HomeAdvisor / Angi 2025-2026 national averages.
 */
const LABOR_COSTS: Record<string, { low: number; high: number }> = {
  'tank-gas':          { low: 300,  high: 600 },
  'tank-electric':     { low: 250,  high: 500 },
  'tankless-gas':      { low: 600,  high: 1200 },
  'tankless-electric': { low: 400,  high: 800 },
  'heat-pump':         { low: 500,  high: 1000 },
  'solar':             { low: 1000, high: 2000 },
};

/**
 * Fuel line conversion costs.
 */
const FUEL_CONVERSION_COSTS: Record<string, { low: number; high: number }> = {
  'none':              { low: 0,   high: 0 },
  'gas-to-electric':   { low: 500, high: 1200 },
  'electric-to-gas':   { low: 800, high: 1500 },
};

/**
 * Venting upgrade costs.
 */
const VENTING_COSTS: Record<string, { low: number; high: number }> = {
  'none':          { low: 0,   high: 0 },
  'standard-vent': { low: 200, high: 500 },
  'power-vent':    { low: 400, high: 800 },
  'direct-vent':   { low: 300, high: 600 },
};

/**
 * Permit cost range.
 */
const PERMIT_COSTS = { low: 100, high: 300 };

/**
 * Regional labor multipliers.
 * Applied to labor portion only, not equipment or other costs.
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
 * Estimated annual operating cost by heater type.
 * Source: U.S. Department of Energy / ENERGY STAR.
 */
const ANNUAL_OPERATING_COSTS: Record<string, number> = {
  'tank-gas':          350,
  'tank-electric':     500,
  'tankless-gas':      200,
  'tankless-electric': 350,
  'heat-pump':         150,
  'solar':             50,
};

/**
 * Display labels for heater types.
 */
const HEATER_LABELS: Record<string, string> = {
  'tank-gas':          'Tank Gas',
  'tank-electric':     'Tank Electric',
  'tankless-gas':      'Tankless Gas',
  'tankless-electric': 'Tankless Electric',
  'heat-pump':         'Heat Pump',
  'solar':             'Solar',
};

/**
 * Typical installation timelines by heater type.
 */
const TIMELINES: Record<string, string> = {
  'tank-gas':          '2–4 hours',
  'tank-electric':     '2–3 hours',
  'tankless-gas':      '4–8 hours',
  'tankless-electric': '3–6 hours',
  'heat-pump':         '4–8 hours',
  'solar':             '1–3 days',
};

/**
 * Water heater cost calculator.
 *
 * totalLow = unitCostLow + laborCostLow + fuelConvLow + ventingLow + permitLow
 * totalHigh = unitCostHigh + laborCostHigh + fuelConvHigh + ventingHigh + permitHigh
 * totalMid = (totalLow + totalHigh) / 2
 *
 * Source: HomeAdvisor / Angi 2025-2026, ENERGY STAR, U.S. Department of Energy.
 */
export function calculateWaterHeaterCost(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const heaterType = String(inputs.heaterType || 'tank-gas');
  const tankSize = String(inputs.tankSize || '40-gallon');
  const fuelConversion = String(inputs.fuelConversion || 'none');
  const ventingUpgrade = String(inputs.ventingUpgrade || 'none');
  const permitRequired = String(inputs.permitRequired || 'no');
  const region = String(inputs.region || 'national');

  // ── Look up rates ─────────────────────────────────────
  const unitRates = UNIT_COSTS[heaterType] ?? UNIT_COSTS['tank-gas'];
  const sizeAdj = SIZE_ADJUSTMENTS[tankSize] ?? SIZE_ADJUSTMENTS['40-gallon'];
  const labRates = LABOR_COSTS[heaterType] ?? LABOR_COSTS['tank-gas'];
  const fuelRates = FUEL_CONVERSION_COSTS[fuelConversion] ?? FUEL_CONVERSION_COSTS['none'];
  const ventRates = VENTING_COSTS[ventingUpgrade] ?? VENTING_COSTS['none'];
  const regionMult = REGIONAL_MULTIPLIERS[region] ?? 1.0;

  // ── Calculate unit cost (equipment + size adjustment) ──
  const unitCostLow = parseFloat((unitRates.low + sizeAdj.low).toFixed(2));
  const unitCostHigh = parseFloat((unitRates.high + sizeAdj.high).toFixed(2));
  const unitCost = parseFloat(((unitCostLow + unitCostHigh) / 2).toFixed(2));

  // ── Calculate labor cost with regional multiplier ──────
  const laborCostLow = parseFloat((labRates.low * regionMult).toFixed(2));
  const laborCostHigh = parseFloat((labRates.high * regionMult).toFixed(2));
  const laborCost = parseFloat(((laborCostLow + laborCostHigh) / 2).toFixed(2));

  // ── Fuel conversion cost ───────────────────────────────
  const fuelConvLow = parseFloat(fuelRates.low.toFixed(2));
  const fuelConvHigh = parseFloat(fuelRates.high.toFixed(2));
  const fuelConversionCost = parseFloat(((fuelConvLow + fuelConvHigh) / 2).toFixed(2));

  // ── Venting cost ───────────────────────────────────────
  const ventLow = parseFloat(ventRates.low.toFixed(2));
  const ventHigh = parseFloat(ventRates.high.toFixed(2));
  const ventingCost = parseFloat(((ventLow + ventHigh) / 2).toFixed(2));

  // ── Permit cost ────────────────────────────────────────
  const permitLow = permitRequired === 'yes' ? PERMIT_COSTS.low : 0;
  const permitHigh = permitRequired === 'yes' ? PERMIT_COSTS.high : 0;
  const permitCost = parseFloat(((permitLow + permitHigh) / 2).toFixed(2));

  // ── Calculate totals ───────────────────────────────────
  const totalLow = parseFloat((unitCostLow + laborCostLow + fuelConvLow + ventLow + permitLow).toFixed(2));
  const totalHigh = parseFloat((unitCostHigh + laborCostHigh + fuelConvHigh + ventHigh + permitHigh).toFixed(2));
  const totalMid = parseFloat(((totalLow + totalHigh) / 2).toFixed(2));

  // ── Annual operating cost ──────────────────────────────
  const annualOperatingCost = ANNUAL_OPERATING_COSTS[heaterType] ?? 350;

  // ── Heater comparison (all 6 types, national avg, 40-gal/standard, no extras) ──
  const heaterKeys = Object.keys(UNIT_COSTS);
  const heaterComparison = heaterKeys.map(key => {
    const ur = UNIT_COSTS[key];
    const lr = LABOR_COSTS[key];
    const unitMid = (ur.low + ur.high) / 2;
    const labMid = (lr.low + lr.high) / 2;
    const mid = unitMid + labMid;
    const opCost = ANNUAL_OPERATING_COSTS[key] ?? 350;
    return {
      label: `${HEATER_LABELS[key]} ($${ur.low + lr.low}–$${ur.high + lr.high} | $${opCost}/yr)`,
      value: parseFloat(mid.toFixed(2)),
    };
  });

  // ── Payback period vs tank-gas baseline ────────────────
  const baselineAnnualCost = ANNUAL_OPERATING_COSTS['tank-gas'];
  const annualSavings = baselineAnnualCost - annualOperatingCost;
  const selectedTotalMid = totalMid;
  const baselineUnitMid = (UNIT_COSTS['tank-gas'].low + UNIT_COSTS['tank-gas'].high) / 2;
  const baselineLaborMid = (LABOR_COSTS['tank-gas'].low + LABOR_COSTS['tank-gas'].high) / 2;
  const baselineTotalMid = baselineUnitMid + baselineLaborMid;
  const upfrontDiff = selectedTotalMid - baselineTotalMid;

  let paybackPeriod: string;
  if (heaterType === 'tank-gas') {
    paybackPeriod = 'Baseline — this is the reference type for payback comparison';
  } else if (annualSavings <= 0) {
    paybackPeriod = 'No payback — operating costs are equal to or higher than tank gas';
  } else if (upfrontDiff <= 0) {
    paybackPeriod = 'Immediate — lower upfront cost and lower operating costs than tank gas';
  } else {
    const years = parseFloat((upfrontDiff / annualSavings).toFixed(1));
    paybackPeriod = `~${years} years vs. standard tank gas (saves $${annualSavings}/yr in operating costs)`;
  }

  // ── Timeline ───────────────────────────────────────────
  const timeline = TIMELINES[heaterType] ?? '2–4 hours';

  return {
    unitCost,
    laborCost,
    fuelConversionCost,
    ventingCost,
    permitCost,
    totalLow,
    totalHigh,
    totalMid,
    annualOperatingCost,
    heaterComparison,
    paybackPeriod,
    timeline,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'water-heater-cost': calculateWaterHeaterCost,
};
