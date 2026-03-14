/**
 * Sump Pump Cost Calculator Formula Module
 *
 * Estimates sump pump installation costs across five pump types:
 * submersible primary, pedestal primary, battery backup, water-powered backup,
 * and combination (primary + backup). Includes horsepower options, basin types,
 * discharge line work, check valves, and regional labor multipliers.
 *
 * Cost formula:
 *   pumpBaseLow / pumpBaseHigh = pump type base range
 *   pumpCostLow = pumpBaseLow × hpMultiplier
 *   pumpCostHigh = pumpBaseHigh × hpMultiplier
 *   basinCost = basin type add-on range
 *   dischargeCost = discharge line add-on range
 *   checkValveCost = check valve add-on range
 *   laborCost = base labor ($300-$600) × regionalMultiplier
 *   totalLow = pumpCostLow + basinLow + dischargeLow + checkValveLow + laborLow
 *   totalHigh = pumpCostHigh + basinHigh + dischargeHigh + checkValveHigh + laborHigh
 *   totalMid = (totalLow + totalHigh) / 2
 *
 * Source: HomeAdvisor / Angi 2025-2026 national averages;
 *         Sump Pump Advisor
 */

export interface SumpPumpCostInput {
  pumpType: string;       // 'submersible-primary' | 'pedestal-primary' | 'battery-backup' | 'water-powered-backup' | 'combination-primary-backup'
  horsePower: string;     // '1/3-hp' | '1/2-hp' | '3/4-hp' | '1-hp'
  basinType: string;      // 'existing-basin' | 'new-plastic' | 'new-fiberglass'
  dischargeLine: string;  // 'existing' | 'new-interior' | 'new-exterior-with-burial'
  checkValve: string;     // 'none' | 'standard' | 'quiet-check'
  region: string;         // 'national' | 'northeast' | 'west-coast' | 'mid-atlantic' | 'midwest' | 'south' | 'mountain-west'
}

export interface SumpPumpCostOutput {
  pumpCost: number;
  basinCost: number;
  dischargeCost: number;
  checkValveCost: number;
  laborCost: number;
  subtotalLow: number;
  subtotalHigh: number;
  subtotal: number;
  totalLow: number;
  totalHigh: number;
  totalMid: number;
  pumpTypeComparison: { label: string; value: number }[];
  timeline: string;
}

/**
 * Pump type base cost ranges (unit cost before HP adjustment).
 * Source: HomeAdvisor / Angi 2025-2026.
 */
const PUMP_COSTS: Record<string, { low: number; high: number }> = {
  'submersible-primary':        { low: 150, high: 400 },
  'pedestal-primary':           { low: 100, high: 300 },
  'battery-backup':             { low: 300, high: 800 },
  'water-powered-backup':       { low: 200, high: 500 },
  'combination-primary-backup': { low: 500, high: 1200 },
};

/**
 * Horsepower multipliers applied to pump cost.
 * Source: HomeAdvisor / Angi 2025-2026.
 */
const HP_MULTIPLIERS: Record<string, number> = {
  '1/3-hp': 1.0,
  '1/2-hp': 1.15,
  '3/4-hp': 1.35,
  '1-hp':   1.55,
};

/**
 * Basin/pit cost ranges (installed).
 * Source: HomeAdvisor / Angi 2025-2026.
 */
const BASIN_COSTS: Record<string, { low: number; high: number }> = {
  'existing-basin':  { low: 0,   high: 0 },
  'new-plastic':     { low: 75,  high: 200 },
  'new-fiberglass':  { low: 150, high: 350 },
};

/**
 * Discharge line cost ranges.
 * Source: HomeAdvisor / Angi 2025-2026.
 */
const DISCHARGE_COSTS: Record<string, { low: number; high: number }> = {
  'existing':                 { low: 0,   high: 0 },
  'new-interior':             { low: 100, high: 300 },
  'new-exterior-with-burial': { low: 300, high: 800 },
};

/**
 * Check valve cost ranges (installed).
 * Source: HomeAdvisor / Angi 2025-2026.
 */
const CHECK_VALVE_COSTS: Record<string, { low: number; high: number }> = {
  'none':        { low: 0,  high: 0 },
  'standard':    { low: 30, high: 60 },
  'quiet-check': { low: 60, high: 120 },
};

/**
 * Base installation labor cost range.
 * Source: HomeAdvisor / Angi 2025-2026.
 */
const BASE_LABOR = { low: 300, high: 600 };

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
 * Display labels for pump types.
 */
const PUMP_LABELS: Record<string, string> = {
  'submersible-primary':        'Submersible Primary',
  'pedestal-primary':           'Pedestal Primary',
  'battery-backup':             'Battery Backup',
  'water-powered-backup':       'Water-Powered Backup',
  'combination-primary-backup': 'Combination (Primary + Backup)',
};

/**
 * Sump pump cost calculator.
 *
 * totalLow = pumpCostLow + basinLow + dischargeLow + checkValveLow + laborLow
 * totalHigh = pumpCostHigh + basinHigh + dischargeHigh + checkValveHigh + laborHigh
 * totalMid = (totalLow + totalHigh) / 2
 *
 * Source: HomeAdvisor / Angi 2025-2026, Sump Pump Advisor.
 */
export function calculateSumpPumpCost(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const pumpType = String(inputs.pumpType || 'submersible-primary');
  const horsePower = String(inputs.horsePower || '1/3-hp');
  const basinType = String(inputs.basinType || 'existing-basin');
  const dischargeLine = String(inputs.dischargeLine || 'existing');
  const checkValve = String(inputs.checkValve || 'none');
  const region = String(inputs.region || 'national');

  // ── Look up rates ─────────────────────────────────────
  const pumpRange = PUMP_COSTS[pumpType] ?? PUMP_COSTS['submersible-primary'];
  const hpMult = HP_MULTIPLIERS[horsePower] ?? 1.0;
  const basinRange = BASIN_COSTS[basinType] ?? BASIN_COSTS['existing-basin'];
  const dischargeRange = DISCHARGE_COSTS[dischargeLine] ?? DISCHARGE_COSTS['existing'];
  const checkValveRange = CHECK_VALVE_COSTS[checkValve] ?? CHECK_VALVE_COSTS['none'];
  const regionMult = REGIONAL_MULTIPLIERS[region] ?? 1.0;

  // ── Calculate pump cost with HP adjustment ────────────
  const pumpCostLow = parseFloat((pumpRange.low * hpMult).toFixed(2));
  const pumpCostHigh = parseFloat((pumpRange.high * hpMult).toFixed(2));

  // ── Labor cost (base installation × regional multiplier) ──
  const laborLow = parseFloat((BASE_LABOR.low * regionMult).toFixed(2));
  const laborHigh = parseFloat((BASE_LABOR.high * regionMult).toFixed(2));

  // ── Totals ────────────────────────────────────────────
  const totalLow = parseFloat((pumpCostLow + basinRange.low + dischargeRange.low + checkValveRange.low + laborLow).toFixed(2));
  const totalHigh = parseFloat((pumpCostHigh + basinRange.high + dischargeRange.high + checkValveRange.high + laborHigh).toFixed(2));
  const totalMid = parseFloat(((totalLow + totalHigh) / 2).toFixed(2));

  // ── Mid-point costs for display ───────────────────────
  const pumpCost = parseFloat(((pumpCostLow + pumpCostHigh) / 2).toFixed(2));
  const basinCost = parseFloat(((basinRange.low + basinRange.high) / 2).toFixed(2));
  const dischargeCost = parseFloat(((dischargeRange.low + dischargeRange.high) / 2).toFixed(2));
  const checkValveCost = parseFloat(((checkValveRange.low + checkValveRange.high) / 2).toFixed(2));
  const laborCost = parseFloat(((laborLow + laborHigh) / 2).toFixed(2));
  const subtotalLow = totalLow;
  const subtotalHigh = totalHigh;
  const subtotal = totalMid;

  // ── Pump type comparison (all 5 types, 1/3 HP, no basin/discharge/valve, national) ──
  const pumpKeys = Object.keys(PUMP_COSTS);
  const pumpTypeComparison = pumpKeys.map(key => {
    const range = PUMP_COSTS[key];
    const midPump = (range.low + range.high) / 2;
    const midLabor = (BASE_LABOR.low + BASE_LABOR.high) / 2;
    const mid = midPump + midLabor;
    return {
      label: `${PUMP_LABELS[key]} ($${range.low}–$${range.high})`,
      value: parseFloat(mid.toFixed(2)),
    };
  });

  // ── Timeline ──────────────────────────────────────────
  const timeline = '3-6 hours';

  return {
    pumpCost,
    basinCost,
    dischargeCost,
    checkValveCost,
    laborCost,
    subtotalLow,
    subtotalHigh,
    subtotal,
    totalLow,
    totalHigh,
    totalMid,
    pumpTypeComparison,
    timeline,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'sump-pump-cost': calculateSumpPumpCost,
};
