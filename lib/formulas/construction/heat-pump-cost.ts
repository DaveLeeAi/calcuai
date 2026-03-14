/**
 * Heat Pump Cost Calculator Formula Module
 *
 * Estimates heat pump installation costs across five pump types:
 * air-source standard, air-source cold-climate, ductless mini-split,
 * dual-fuel hybrid, and geothermal. Includes IRA 30% federal tax
 * credit calculation (capped at $2,000), backup heat add-ons,
 * refrigerant line set costs, and regional labor multipliers.
 *
 * Cost formula:
 *   equipmentLow = pumpTypeBaseLow × homeSizeMultiplier × efficiencyMultiplier
 *   equipmentHigh = pumpTypeBaseHigh × homeSizeMultiplier × efficiencyMultiplier
 *   laborLow = pumpTypeLaborLow × regionalMultiplier
 *   laborHigh = pumpTypeLaborHigh × regionalMultiplier
 *   subtotalLow = equipmentLow + laborLow + backupHeatLow + lineSetLow
 *   subtotalHigh = equipmentHigh + laborHigh + backupHeatHigh + lineSetHigh
 *   iraTaxCredit = min(subtotalMid × 0.30, 2000) if enabled
 *   totalAfterCredit = subtotalMid − iraTaxCredit
 *
 * Source: HomeAdvisor / Angi 2025-2026 Heat Pump Cost Data;
 *         ENERGY STAR Heat Pump Guide;
 *         IRS Inflation Reduction Act (IRC §25D) Heat Pump Tax Credit
 */

export interface HeatPumpCostInput {
  pumpType: string;          // 'air-source-standard' | 'air-source-cold-climate' | 'ductless-mini-split' | 'dual-fuel-hybrid' | 'geothermal'
  homeSize: string;          // 'small-under-1500' | 'medium-1500-2500' | 'large-2500-3500' | 'xlarge-over-3500'
  efficiency: string;        // 'standard-15-seer2' | 'high-17-seer2' | 'premium-20-seer2'
  backupHeat: string;        // 'none' | 'electric-resistance-strips' | 'existing-furnace-kept' | 'new-gas-furnace'
  lineSet: string;           // 'existing-reuse' | 'new-short-run' | 'new-long-run'
  claimIRATaxCredit: string; // 'true' | 'false'
  region: string;            // 'national' | 'northeast' | 'west-coast' | 'mid-atlantic' | 'midwest' | 'south' | 'mountain-west'
}

export interface HeatPumpCostOutput {
  equipmentCost: number;
  laborCost: number;
  backupHeatCost: number;
  lineSetCost: number;
  subtotal: number;
  iraTaxCredit: number;
  totalAfterCredit: number;
  totalLow: number;
  totalHigh: number;
  totalMid: number;
  pumpTypeComparison: { label: string; value: number }[];
  annualSavingsVsGas: string;
  paybackPeriod: string;
  timeline: string;
}

/**
 * Equipment base cost by pump type (before home-size and efficiency multipliers).
 * Source: HomeAdvisor / Angi 2025-2026 Heat Pump Cost Data.
 */
const EQUIPMENT_COSTS: Record<string, { low: number; high: number }> = {
  'air-source-standard':      { low: 4000,  high: 7000 },
  'air-source-cold-climate':  { low: 5500,  high: 9000 },
  'ductless-mini-split':      { low: 3000,  high: 5000 },
  'dual-fuel-hybrid':         { low: 5000,  high: 9000 },
  'geothermal':               { low: 15000, high: 30000 },
};

/**
 * Labor cost by pump type (flat, adjusted by region only — not by home size).
 * Source: HomeAdvisor / Angi 2025-2026.
 */
const LABOR_COSTS: Record<string, { low: number; high: number }> = {
  'air-source-standard':      { low: 2000, high: 4000 },
  'air-source-cold-climate':  { low: 2500, high: 4500 },
  'ductless-mini-split':      { low: 1500, high: 3000 },
  'dual-fuel-hybrid':         { low: 2500, high: 5000 },
  'geothermal':               { low: 8000, high: 15000 },
};

/**
 * Home size multipliers — applied to equipment cost only.
 */
const HOME_SIZE_MULTIPLIERS: Record<string, number> = {
  'small-under-1500': 1.0,
  'medium-1500-2500': 1.20,
  'large-2500-3500':  1.45,
  'xlarge-over-3500': 1.75,
};

/**
 * Efficiency/SEER2 multipliers — applied to equipment cost only.
 */
const EFFICIENCY_MULTIPLIERS: Record<string, number> = {
  'standard-15-seer2': 1.0,
  'high-17-seer2':     1.20,
  'premium-20-seer2':  1.40,
};

/**
 * Backup heat source add-on costs.
 */
const BACKUP_HEAT_COSTS: Record<string, { low: number; high: number }> = {
  'none':                       { low: 0,    high: 0 },
  'electric-resistance-strips': { low: 300,  high: 800 },
  'existing-furnace-kept':      { low: 0,    high: 0 },
  'new-gas-furnace':            { low: 2000, high: 3500 },
};

/**
 * Refrigerant line set costs.
 */
const LINE_SET_COSTS: Record<string, { low: number; high: number }> = {
  'existing-reuse': { low: 0,   high: 0 },
  'new-short-run':  { low: 300, high: 600 },
  'new-long-run':   { low: 600, high: 1200 },
};

/**
 * Regional labor multipliers.
 * Applied to labor portion only, not equipment or add-ons.
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
 * Display labels for pump types.
 */
const PUMP_LABELS: Record<string, string> = {
  'air-source-standard':     'Air Source Standard',
  'air-source-cold-climate': 'Air Source Cold Climate',
  'ductless-mini-split':     'Ductless Mini-Split',
  'dual-fuel-hybrid':        'Dual-Fuel Hybrid',
  'geothermal':              'Geothermal',
};

/**
 * IRA tax credit: 30% of total, capped at $2,000.
 * Source: IRS IRC §25D, Inflation Reduction Act of 2022, effective through 2032.
 */
const IRA_CREDIT_RATE = 0.30;
const IRA_CREDIT_CAP = 2000;

/**
 * Annual savings estimates vs. gas furnace + central AC (by pump type).
 * Source: ENERGY STAR.
 */
const ANNUAL_SAVINGS: Record<string, string> = {
  'air-source-standard':     '$300–$600/year vs. gas furnace + AC',
  'air-source-cold-climate': '$400–$800/year vs. gas furnace + AC',
  'ductless-mini-split':     '$200–$500/year vs. gas furnace + AC',
  'dual-fuel-hybrid':        '$200–$450/year vs. gas furnace alone',
  'geothermal':              '$700–$1,500/year vs. gas furnace + AC',
};

/**
 * Estimated payback period (by pump type, before IRA credit).
 * Source: ENERGY STAR, HomeAdvisor.
 */
const PAYBACK_PERIODS: Record<string, string> = {
  'air-source-standard':     '6–10 years (4–7 years with IRA credit)',
  'air-source-cold-climate': '7–12 years (5–9 years with IRA credit)',
  'ductless-mini-split':     '5–8 years (3–6 years with IRA credit)',
  'dual-fuel-hybrid':        '8–13 years (6–10 years with IRA credit)',
  'geothermal':              '10–20 years (7–15 years with IRA credit)',
};

/**
 * Timeline estimates (by pump type).
 */
const TIMELINES: Record<string, string> = {
  'air-source-standard':     '1–2 days',
  'air-source-cold-climate': '1–2 days',
  'ductless-mini-split':     '1–3 days (varies by zone count)',
  'dual-fuel-hybrid':        '2–3 days',
  'geothermal':              '1–2 weeks (includes ground loop)',
};

/**
 * Heat pump cost calculator.
 *
 * equipmentCost = pumpTypeBase × homeSizeMultiplier × efficiencyMultiplier
 * laborCost = pumpTypeLabor × regionalMultiplier
 * subtotal = equipmentCost + laborCost + backupHeatCost + lineSetCost
 * iraTaxCredit = min(subtotal × 0.30, 2000) if enabled
 * totalAfterCredit = subtotal − iraTaxCredit
 *
 * Source: HomeAdvisor / Angi 2025-2026; ENERGY STAR; IRS IRC §25D.
 */
export function calculateHeatPumpCost(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const pumpType = String(inputs.pumpType || 'air-source-standard');
  const homeSize = String(inputs.homeSize || 'medium-1500-2500');
  const efficiency = String(inputs.efficiency || 'standard-15-seer2');
  const backupHeat = String(inputs.backupHeat || 'none');
  const lineSet = String(inputs.lineSet || 'existing-reuse');
  const claimCredit = String(inputs.claimIRATaxCredit ?? 'true') === 'true';
  const region = String(inputs.region || 'national');

  // ── Look up rates ─────────────────────────────────────
  const equipRates = EQUIPMENT_COSTS[pumpType] ?? EQUIPMENT_COSTS['air-source-standard'];
  const labRates = LABOR_COSTS[pumpType] ?? LABOR_COSTS['air-source-standard'];
  const homeMult = HOME_SIZE_MULTIPLIERS[homeSize] ?? 1.0;
  const effMult = EFFICIENCY_MULTIPLIERS[efficiency] ?? 1.0;
  const backupRates = BACKUP_HEAT_COSTS[backupHeat] ?? BACKUP_HEAT_COSTS['none'];
  const lineRates = LINE_SET_COSTS[lineSet] ?? LINE_SET_COSTS['existing-reuse'];
  const regionMult = REGIONAL_MULTIPLIERS[region] ?? 1.0;

  // ── Calculate equipment cost (low/high) ───────────────
  const equipLow = parseFloat((equipRates.low * homeMult * effMult).toFixed(2));
  const equipHigh = parseFloat((equipRates.high * homeMult * effMult).toFixed(2));
  const equipmentCost = parseFloat(((equipLow + equipHigh) / 2).toFixed(2));

  // ── Calculate labor cost (low/high) ───────────────────
  const laborLow = parseFloat((labRates.low * regionMult).toFixed(2));
  const laborHigh = parseFloat((labRates.high * regionMult).toFixed(2));
  const laborCost = parseFloat(((laborLow + laborHigh) / 2).toFixed(2));

  // ── Backup heat cost ──────────────────────────────────
  const backupLow = backupRates.low;
  const backupHigh = backupRates.high;
  const backupHeatCost = parseFloat(((backupLow + backupHigh) / 2).toFixed(2));

  // ── Line set cost ─────────────────────────────────────
  const lineLow = lineRates.low;
  const lineHigh = lineRates.high;
  const lineSetCost = parseFloat(((lineLow + lineHigh) / 2).toFixed(2));

  // ── Subtotal (low / high / mid) ───────────────────────
  const totalLow = parseFloat((equipLow + laborLow + backupLow + lineLow).toFixed(2));
  const totalHigh = parseFloat((equipHigh + laborHigh + backupHigh + lineHigh).toFixed(2));
  const totalMid = parseFloat(((totalLow + totalHigh) / 2).toFixed(2));
  const subtotal = totalMid;

  // ── IRA tax credit ────────────────────────────────────
  const iraTaxCredit = claimCredit
    ? parseFloat((Math.min(subtotal * IRA_CREDIT_RATE, IRA_CREDIT_CAP)).toFixed(2))
    : 0;
  const totalAfterCredit = parseFloat((subtotal - iraTaxCredit).toFixed(2));

  // ── Pump type comparison (national avg, medium home, standard efficiency, no add-ons) ──
  const pumpKeys = Object.keys(EQUIPMENT_COSTS);
  const pumpTypeComparison = pumpKeys.map(key => {
    const eq = EQUIPMENT_COSTS[key];
    const lb = LABOR_COSTS[key];
    const eqMid = (eq.low + eq.high) / 2;
    const lbMid = (lb.low + lb.high) / 2;
    const mid = eqMid + lbMid;
    return {
      label: `${PUMP_LABELS[key]} ($${eq.low.toLocaleString()}–$${eq.high.toLocaleString()})`,
      value: parseFloat(mid.toFixed(2)),
    };
  });

  // ── Text outputs ──────────────────────────────────────
  const annualSavingsVsGas = ANNUAL_SAVINGS[pumpType] ?? ANNUAL_SAVINGS['air-source-standard'];
  const paybackPeriod = PAYBACK_PERIODS[pumpType] ?? PAYBACK_PERIODS['air-source-standard'];
  const timeline = TIMELINES[pumpType] ?? TIMELINES['air-source-standard'];

  return {
    equipmentCost,
    laborCost,
    backupHeatCost,
    lineSetCost,
    subtotal,
    iraTaxCredit,
    totalAfterCredit,
    totalLow,
    totalHigh,
    totalMid,
    pumpTypeComparison,
    annualSavingsVsGas,
    paybackPeriod,
    timeline,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'heat-pump-cost': calculateHeatPumpCost,
};
