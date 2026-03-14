/**
 * Solar Battery Cost Calculator Formula Module
 *
 * Estimates home battery storage costs across five capacity tiers and three
 * battery chemistries. Factors in inverter type, transfer switch, electrical
 * upgrades, IRA 30% federal tax credit, and regional labor multipliers.
 *
 * Cost formula:
 *   batteryCostBase = CAPACITY_COSTS[batteryCapacity]
 *   adjustedBattery = base × chemistry mult
 *   laborCost = adjustedBattery × 0.25 × regionalMultiplier
 *   inverterCost = INVERTER_COSTS[inverterType] midpoint
 *   transferSwitchCost = TRANSFER_SWITCH_COSTS[transferSwitch] midpoint
 *   electricalCost = ELECTRICAL_COSTS[electricalUpgrade] midpoint
 *   subtotal = adjustedBattery + laborCost + inverterCost + transferSwitchCost + electricalCost
 *   iraTaxCredit = subtotal × 0.30 (if toggle on)
 *   totalAfterCredit = subtotal - iraTaxCredit
 *
 * Source: HomeAdvisor / Angi 2025-2026 national averages;
 *         ENERGY STAR; IRS Inflation Reduction Act (IRC §25D) Clean Energy Tax Credit
 */

export interface SolarBatteryCostInput {
  batteryCapacity: string;    // 'small-5kwh' | 'medium-10kwh' | 'standard-13kwh' | 'large-20kwh' | 'whole-home-30kwh'
  batteryChemistry: string;   // 'lithium-ion-nmc' | 'lithium-iron-phosphate' | 'lead-acid'
  inverterType: string;       // 'hybrid-included' | 'separate-inverter' | 'existing-compatible'
  transferSwitch: string;     // 'none' | 'manual' | 'automatic'
  claimIRATaxCredit: string;  // 'yes' | 'no'
  electricalUpgrade: string;  // 'none' | 'panel-upgrade' | 'service-upgrade'
  region: string;             // 'national' | 'northeast' | 'west-coast' | 'mid-atlantic' | 'midwest' | 'south' | 'mountain-west'
}

export interface SolarBatteryCostOutput {
  batteryCost: number;
  laborCost: number;
  inverterCost: number;
  transferSwitchCost: number;
  electricalCost: number;
  subtotalLow: number;
  subtotalHigh: number;
  subtotal: number;
  iraTaxCredit: number;
  totalAfterCredit: number;
  totalLow: number;
  totalHigh: number;
  totalMid: number;
  capacityComparison: { label: string; value: number }[];
  estimatedBackupHours: string;
  paybackPeriod: string;
  timeline: string;
}

/**
 * Battery capacity base cost ranges (equipment only, before chemistry mult).
 * Source: HomeAdvisor / Angi 2025-2026; EnergySage marketplace data.
 */
const CAPACITY_COSTS: Record<string, { low: number; high: number }> = {
  'small-5kwh':        { low: 4000,  high: 6000 },
  'medium-10kwh':      { low: 7000,  high: 11000 },
  'standard-13kwh':    { low: 9000,  high: 14000 },
  'large-20kwh':       { low: 13000, high: 20000 },
  'whole-home-30kwh':  { low: 18000, high: 28000 },
};

/**
 * Battery chemistry multipliers.
 * NMC is baseline (1.0x), LFP is 10% more, lead-acid is 35% cheaper.
 */
const CHEMISTRY_MULTIPLIERS: Record<string, number> = {
  'lithium-ion-nmc':           1.0,
  'lithium-iron-phosphate':    1.10,
  'lead-acid':                 0.65,
};

/**
 * Inverter cost ranges (adder).
 */
const INVERTER_COSTS: Record<string, { low: number; high: number }> = {
  'hybrid-included':      { low: 0,    high: 0 },
  'separate-inverter':    { low: 1500, high: 3000 },
  'existing-compatible':  { low: 0,    high: 0 },
};

/**
 * Transfer switch cost ranges (adder).
 */
const TRANSFER_SWITCH_COSTS: Record<string, { low: number; high: number }> = {
  'none':      { low: 0,    high: 0 },
  'manual':    { low: 300,  high: 600 },
  'automatic': { low: 1000, high: 2500 },
};

/**
 * Electrical upgrade cost ranges (adder).
 */
const ELECTRICAL_COSTS: Record<string, { low: number; high: number }> = {
  'none':             { low: 0,    high: 0 },
  'panel-upgrade':    { low: 1500, high: 3000 },
  'service-upgrade':  { low: 3000, high: 6000 },
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
 * Display labels for capacity tiers.
 */
const CAPACITY_LABELS: Record<string, string> = {
  'small-5kwh':        '5 kWh (Partial Backup)',
  'medium-10kwh':      '10 kWh (Essential Circuits)',
  'standard-13kwh':    '13.5 kWh (Standard Home)',
  'large-20kwh':       '20 kWh (Large Home)',
  'whole-home-30kwh':  '30 kWh (Whole-Home Backup)',
};

/**
 * Estimated backup hours by capacity (average US home uses ~30 kWh/day).
 */
const BACKUP_HOURS: Record<string, string> = {
  'small-5kwh':        '4–6 hours (essential loads only)',
  'medium-10kwh':      '8–12 hours (essential circuits)',
  'standard-13kwh':    '10–14 hours (most circuits)',
  'large-20kwh':       '16–20 hours (nearly whole home)',
  'whole-home-30kwh':  '20–30 hours (full home backup)',
};

/**
 * Estimated payback period by capacity (with solar pairing).
 */
const PAYBACK_PERIODS: Record<string, string> = {
  'small-5kwh':        '6–9 years with solar',
  'medium-10kwh':      '7–11 years with solar',
  'standard-13kwh':    '8–12 years with solar',
  'large-20kwh':       '9–14 years with solar',
  'whole-home-30kwh':  '10–15 years with solar',
};

/**
 * Solar battery cost calculator.
 *
 * subtotal = batteryCost + laborCost + inverterCost + transferSwitchCost + electricalCost
 * iraTaxCredit = subtotal × 0.30 (if toggle on)
 * totalAfterCredit = subtotal - iraTaxCredit
 *
 * Source: HomeAdvisor / Angi 2025-2026, ENERGY STAR, IRS IRC §25D.
 */
export function calculateSolarBatteryCost(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const batteryCapacity = String(inputs.batteryCapacity || 'standard-13kwh');
  const batteryChemistry = String(inputs.batteryChemistry || 'lithium-ion-nmc');
  const inverterType = String(inputs.inverterType || 'hybrid-included');
  const transferSwitch = String(inputs.transferSwitch || 'none');
  const claimIRA = String(inputs.claimIRATaxCredit || 'yes');
  const electricalUpgrade = String(inputs.electricalUpgrade || 'none');
  const region = String(inputs.region || 'national');

  // ── Look up rates ─────────────────────────────────────
  const capRates = CAPACITY_COSTS[batteryCapacity] ?? CAPACITY_COSTS['standard-13kwh'];
  const chemMult = CHEMISTRY_MULTIPLIERS[batteryChemistry] ?? 1.0;
  const invRates = INVERTER_COSTS[inverterType] ?? INVERTER_COSTS['hybrid-included'];
  const tsRates = TRANSFER_SWITCH_COSTS[transferSwitch] ?? TRANSFER_SWITCH_COSTS['none'];
  const elecRates = ELECTRICAL_COSTS[electricalUpgrade] ?? ELECTRICAL_COSTS['none'];
  const regionMult = REGIONAL_MULTIPLIERS[region] ?? 1.0;

  // ── Battery equipment cost (adjusted by chemistry) ────
  const batteryCostLow = parseFloat((capRates.low * chemMult).toFixed(2));
  const batteryCostHigh = parseFloat((capRates.high * chemMult).toFixed(2));

  // ── Labor = 25% of battery cost × regional multiplier ─
  const laborCostLow = parseFloat((batteryCostLow * 0.25 * regionMult).toFixed(2));
  const laborCostHigh = parseFloat((batteryCostHigh * 0.25 * regionMult).toFixed(2));

  // ── Add-on costs ──────────────────────────────────────
  const inverterCostLow = parseFloat(invRates.low.toFixed(2));
  const inverterCostHigh = parseFloat(invRates.high.toFixed(2));
  const transferSwitchCostLow = parseFloat(tsRates.low.toFixed(2));
  const transferSwitchCostHigh = parseFloat(tsRates.high.toFixed(2));
  const electricalCostLow = parseFloat(elecRates.low.toFixed(2));
  const electricalCostHigh = parseFloat(elecRates.high.toFixed(2));

  // ── Subtotals ─────────────────────────────────────────
  const subtotalLow = parseFloat((batteryCostLow + laborCostLow + inverterCostLow + transferSwitchCostLow + electricalCostLow).toFixed(2));
  const subtotalHigh = parseFloat((batteryCostHigh + laborCostHigh + inverterCostHigh + transferSwitchCostHigh + electricalCostHigh).toFixed(2));
  const subtotalMid = parseFloat(((subtotalLow + subtotalHigh) / 2).toFixed(2));

  // ── IRA 30% Tax Credit ────────────────────────────────
  const iraLow = claimIRA === 'yes' ? parseFloat((subtotalLow * 0.30).toFixed(2)) : 0;
  const iraHigh = claimIRA === 'yes' ? parseFloat((subtotalHigh * 0.30).toFixed(2)) : 0;
  const iraTaxCredit = parseFloat(((iraLow + iraHigh) / 2).toFixed(2));

  // ── Totals after credit ───────────────────────────────
  const totalLow = parseFloat((subtotalLow - iraLow).toFixed(2));
  const totalHigh = parseFloat((subtotalHigh - iraHigh).toFixed(2));
  const totalMid = parseFloat(((totalLow + totalHigh) / 2).toFixed(2));
  const totalAfterCredit = totalMid;

  // ── Mid-point costs for display ───────────────────────
  const batteryCost = parseFloat(((batteryCostLow + batteryCostHigh) / 2).toFixed(2));
  const laborCost = parseFloat(((laborCostLow + laborCostHigh) / 2).toFixed(2));
  const inverterCost = parseFloat(((inverterCostLow + inverterCostHigh) / 2).toFixed(2));
  const transferSwitchCost = parseFloat(((transferSwitchCostLow + transferSwitchCostHigh) / 2).toFixed(2));
  const electricalCost = parseFloat(((electricalCostLow + electricalCostHigh) / 2).toFixed(2));

  // ── Capacity comparison (all 5 sizes, NMC, national, no add-ons, with IRA) ──
  const capKeys = Object.keys(CAPACITY_COSTS);
  const capacityComparison = capKeys.map(key => {
    const cr = CAPACITY_COSTS[key];
    const batMid = (cr.low + cr.high) / 2;
    const labMid = batMid * 0.25;
    const sub = batMid + labMid;
    const afterCredit = claimIRA === 'yes' ? sub * 0.70 : sub;
    return {
      label: CAPACITY_LABELS[key] ?? key,
      value: parseFloat(afterCredit.toFixed(2)),
    };
  });

  // ── Backup hours & payback ────────────────────────────
  const estimatedBackupHours = BACKUP_HOURS[batteryCapacity] ?? '10–14 hours';
  const paybackPeriod = PAYBACK_PERIODS[batteryCapacity] ?? '8–12 years with solar';
  const timeline = '1–3 days';

  return {
    batteryCost,
    laborCost,
    inverterCost,
    transferSwitchCost,
    electricalCost,
    subtotalLow,
    subtotalHigh,
    subtotal: subtotalMid,
    iraTaxCredit,
    totalAfterCredit,
    totalLow,
    totalHigh,
    totalMid,
    capacityComparison,
    estimatedBackupHours,
    paybackPeriod,
    timeline,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'solar-battery-cost': calculateSolarBatteryCost,
};
