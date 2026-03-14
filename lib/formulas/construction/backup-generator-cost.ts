/**
 * Backup Generator Cost Calculator Formula Module
 *
 * Estimates whole-house standby generator costs across four size tiers and
 * three fuel types. Factors in transfer switch type, concrete pad, permit
 * fees, and regional labor multipliers.
 *
 * Cost formula:
 *   generatorCostBase = GENERATOR_COSTS[generatorSize]
 *   adjustedGenerator = base x fuelMultiplier
 *   laborCost = adjustedGenerator x 0.30 x regionalMultiplier
 *   transferSwitchCost = TRANSFER_SWITCH_COSTS[transferSwitch]
 *   padCost = PAD_COSTS[pad]
 *   permitCost = PERMIT_COSTS[permitRequired]
 *   total = adjustedGenerator + laborCost + transferSwitchCost + padCost + permitCost
 *
 * Source: HomeAdvisor / Angi 2025-2026 national averages;
 *         Generac, Kohler, and Cummins MSRP data;
 *         Bureau of Labor Statistics (SOC 49-9051) for electrician wages
 */

export interface BackupGeneratorCostInput {
  generatorSize: string;    // 'small-7-10kw' | 'medium-12-16kw' | 'large-20-24kw' | 'xlarge-30-48kw'
  fuelType: string;         // 'natural-gas' | 'propane' | 'diesel'
  transferSwitch: string;   // 'manual' | 'automatic-load-shedding' | 'automatic-whole-home'
  pad: string;              // 'existing' | 'new-concrete-pad'
  permitRequired: string;   // 'yes' | 'no'
  region: string;           // 'national' | 'northeast' | 'west-coast' | 'mid-atlantic' | 'midwest' | 'south' | 'mountain-west'
}

export interface BackupGeneratorCostOutput {
  generatorCost: number;
  laborCost: number;
  transferSwitchCost: number;
  padCost: number;
  permitCost: number;
  totalLow: number;
  totalHigh: number;
  totalMid: number;
  sizeComparison: { label: string; value: number }[];
  weeklyFuelCost: string;
  timeline: string;
}

/**
 * Generator base cost ranges (equipment only, before fuel multiplier).
 * Source: HomeAdvisor / Angi 2025-2026; Generac, Kohler, Cummins MSRP.
 */
const GENERATOR_COSTS: Record<string, { low: number; high: number }> = {
  'small-7-10kw':   { low: 2500,  high: 4000 },
  'medium-12-16kw': { low: 3500,  high: 6000 },
  'large-20-24kw':  { low: 5000,  high: 10000 },
  'xlarge-30-48kw': { low: 10000, high: 18000 },
};

/**
 * Fuel type multipliers applied to generator equipment cost.
 * Natural gas is baseline (1.0x), propane adds 5%, diesel adds 15%.
 */
const FUEL_MULTIPLIERS: Record<string, number> = {
  'natural-gas': 1.0,
  'propane':     1.05,
  'diesel':      1.15,
};

/**
 * Transfer switch cost ranges (adder).
 */
const TRANSFER_SWITCH_COSTS: Record<string, { low: number; high: number }> = {
  'manual':                    { low: 300,  high: 600 },
  'automatic-load-shedding':   { low: 800,  high: 1500 },
  'automatic-whole-home':      { low: 1500, high: 3000 },
};

/**
 * Concrete pad cost ranges (adder).
 */
const PAD_COSTS: Record<string, { low: number; high: number }> = {
  'existing':         { low: 0,   high: 0 },
  'new-concrete-pad': { low: 300, high: 800 },
};

/**
 * Permit cost ranges (adder).
 */
const PERMIT_COSTS: Record<string, { low: number; high: number }> = {
  'yes': { low: 100, high: 400 },
  'no':  { low: 0,   high: 0 },
};

/**
 * Regional labor multipliers.
 * Applied to labor portion only, not equipment.
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
 * Display labels for generator size tiers.
 */
const SIZE_LABELS: Record<string, string> = {
  'small-7-10kw':   '7–10 kW (Essential Circuits)',
  'medium-12-16kw': '12–16 kW (Most Circuits)',
  'large-20-24kw':  '20–24 kW (Whole Home)',
  'xlarge-30-48kw': '30–48 kW (Large/Luxury Home)',
};

/**
 * Estimated weekly fuel cost at 50% load for 8 hours/week.
 */
const WEEKLY_FUEL_COSTS: Record<string, Record<string, string>> = {
  'small-7-10kw': {
    'natural-gas': '$15–$25/week at 50% load',
    'propane':     '$20–$35/week at 50% load',
    'diesel':      '$25–$40/week at 50% load',
  },
  'medium-12-16kw': {
    'natural-gas': '$25–$40/week at 50% load',
    'propane':     '$35–$55/week at 50% load',
    'diesel':      '$40–$60/week at 50% load',
  },
  'large-20-24kw': {
    'natural-gas': '$35–$55/week at 50% load',
    'propane':     '$50–$75/week at 50% load',
    'diesel':      '$55–$85/week at 50% load',
  },
  'xlarge-30-48kw': {
    'natural-gas': '$55–$90/week at 50% load',
    'propane':     '$75–$120/week at 50% load',
    'diesel':      '$85–$140/week at 50% load',
  },
};

/**
 * Backup generator cost calculator.
 *
 * total = generatorCost + laborCost + transferSwitchCost + padCost + permitCost
 * laborCost = generatorCost x 0.30 x regionalMultiplier
 *
 * Source: HomeAdvisor / Angi 2025-2026, Generac/Kohler MSRP, BLS SOC 49-9051.
 */
export function calculateBackupGeneratorCost(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const generatorSize = String(inputs.generatorSize || 'large-20-24kw');
  const fuelType = String(inputs.fuelType || 'natural-gas');
  const transferSwitch = String(inputs.transferSwitch || 'automatic-whole-home');
  const pad = String(inputs.pad || 'new-concrete-pad');
  const permitRequired = String(inputs.permitRequired || 'yes');
  const region = String(inputs.region || 'national');

  // ── Look up rates ─────────────────────────────────────
  const genRates = GENERATOR_COSTS[generatorSize] ?? GENERATOR_COSTS['large-20-24kw'];
  const fuelMult = FUEL_MULTIPLIERS[fuelType] ?? 1.0;
  const tsRates = TRANSFER_SWITCH_COSTS[transferSwitch] ?? TRANSFER_SWITCH_COSTS['automatic-whole-home'];
  const padRates = PAD_COSTS[pad] ?? PAD_COSTS['new-concrete-pad'];
  const permitRates = PERMIT_COSTS[permitRequired] ?? PERMIT_COSTS['yes'];
  const regionMult = REGIONAL_MULTIPLIERS[region] ?? 1.0;

  // ── Generator equipment cost (adjusted by fuel type) ──
  const genCostLow = parseFloat((genRates.low * fuelMult).toFixed(2));
  const genCostHigh = parseFloat((genRates.high * fuelMult).toFixed(2));

  // ── Labor = 30% of generator cost x regional multiplier ─
  const laborCostLow = parseFloat((genCostLow * 0.30 * regionMult).toFixed(2));
  const laborCostHigh = parseFloat((genCostHigh * 0.30 * regionMult).toFixed(2));

  // ── Add-on costs ──────────────────────────────────────
  const tsCostLow = parseFloat(tsRates.low.toFixed(2));
  const tsCostHigh = parseFloat(tsRates.high.toFixed(2));
  const padCostLow = parseFloat(padRates.low.toFixed(2));
  const padCostHigh = parseFloat(padRates.high.toFixed(2));
  const permitCostLow = parseFloat(permitRates.low.toFixed(2));
  const permitCostHigh = parseFloat(permitRates.high.toFixed(2));

  // ── Totals ────────────────────────────────────────────
  const totalLow = parseFloat((genCostLow + laborCostLow + tsCostLow + padCostLow + permitCostLow).toFixed(2));
  const totalHigh = parseFloat((genCostHigh + laborCostHigh + tsCostHigh + padCostHigh + permitCostHigh).toFixed(2));
  const totalMid = parseFloat(((totalLow + totalHigh) / 2).toFixed(2));

  // ── Mid-point costs for display ───────────────────────
  const generatorCost = parseFloat(((genCostLow + genCostHigh) / 2).toFixed(2));
  const laborCost = parseFloat(((laborCostLow + laborCostHigh) / 2).toFixed(2));
  const transferSwitchCost = parseFloat(((tsCostLow + tsCostHigh) / 2).toFixed(2));
  const padCost = parseFloat(((padCostLow + padCostHigh) / 2).toFixed(2));
  const permitCost = parseFloat(((permitCostLow + permitCostHigh) / 2).toFixed(2));

  // ── Size comparison (all sizes, natural gas, national, automatic-whole-home, new pad, permit) ──
  const sizeKeys = Object.keys(GENERATOR_COSTS);
  const sizeComparison = sizeKeys.map(key => {
    const cr = GENERATOR_COSTS[key];
    const genMid = (cr.low + cr.high) / 2;
    const labMid = genMid * 0.30;
    const tsMid = (TRANSFER_SWITCH_COSTS['automatic-whole-home'].low + TRANSFER_SWITCH_COSTS['automatic-whole-home'].high) / 2;
    const pMid = (PAD_COSTS['new-concrete-pad'].low + PAD_COSTS['new-concrete-pad'].high) / 2;
    const permMid = (PERMIT_COSTS['yes'].low + PERMIT_COSTS['yes'].high) / 2;
    const total = genMid + labMid + tsMid + pMid + permMid;
    return {
      label: SIZE_LABELS[key] ?? key,
      value: parseFloat(total.toFixed(2)),
    };
  });

  // ── Weekly fuel cost ──────────────────────────────────
  const fuelCostMap = WEEKLY_FUEL_COSTS[generatorSize] ?? WEEKLY_FUEL_COSTS['large-20-24kw'];
  const weeklyFuelCost = fuelCostMap[fuelType] ?? '$35–$55/week at 50% load';

  // ── Timeline ──────────────────────────────────────────
  const timeline = generatorSize === 'xlarge-30-48kw' ? '2–3 days' : '1–2 days';

  return {
    generatorCost,
    laborCost,
    transferSwitchCost,
    padCost,
    permitCost,
    totalLow,
    totalHigh,
    totalMid,
    sizeComparison,
    weeklyFuelCost,
    timeline,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'backup-generator-cost': calculateBackupGeneratorCost,
};
