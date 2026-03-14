/**
 * HVAC Replacement Cost Calculator Formula Module
 *
 * Estimates HVAC system replacement costs for central AC, furnaces, heat pumps,
 * and ductless mini-splits. Splits costs into equipment, labor, ductwork, and
 * thermostat components, with regional labor multipliers.
 *
 * Cost formula:
 *   equipmentLow  = systemBase.low × homeSizeMultiplier × efficiencyMultiplier
 *   equipmentHigh = systemBase.high × homeSizeMultiplier × efficiencyMultiplier
 *   laborLow  = equipmentLow × 0.40 × regionalMultiplier
 *   laborHigh = equipmentHigh × 0.40 × regionalMultiplier
 *   ductworkCost = (ductwork.low + ductwork.high) / 2
 *   thermostatCost = (thermostat.low + thermostat.high) / 2
 *   totalLow  = equipmentLow + laborLow + ductwork.low + thermostat.low
 *   totalHigh = equipmentHigh + laborHigh + ductwork.high + thermostat.high
 *   totalMid  = (totalLow + totalHigh) / 2
 *
 * Source: HomeAdvisor / Angi 2025-2026 HVAC Cost Data;
 *         ENERGY STAR HVAC Efficiency Guidelines; ACCA Manual J
 */

export interface HvacReplacementCostInput {
  systemType: string;     // 'central-ac-only' | 'furnace-only' | 'ac-and-furnace' | 'heat-pump' | 'ductless-mini-split'
  homeSize: string;       // 'small-under-1500' | 'medium-1500-2500' | 'large-2500-3500' | 'xlarge-over-3500'
  efficiency: string;     // 'standard-14-seer' | 'high-16-seer' | 'premium-20-seer'
  ductwork: string;       // 'existing-good' | 'minor-repair' | 'major-repair' | 'new-ductwork'
  thermostat: string;     // 'none' | 'basic-programmable' | 'smart-wifi'
  region: string;         // 'national' | 'northeast' | 'west-coast' | 'mid-atlantic' | 'midwest' | 'south' | 'mountain-west'
}

export interface HvacReplacementCostOutput {
  equipmentCost: number;
  laborCost: number;
  ductworkCost: number;
  thermostatCost: number;
  totalLow: number;
  totalHigh: number;
  totalMid: number;
  costPerTon: number;
  systemComparison: { label: string; value: number }[];
  estimatedAnnualSavings: string;
  timeline: string;
}

/**
 * Base equipment cost by system type (before home size and efficiency multipliers).
 * Source: HomeAdvisor / Angi 2025-2026 national averages.
 */
const SYSTEM_BASE_COSTS: Record<string, { low: number; high: number }> = {
  'central-ac-only':      { low: 3000, high: 6000 },
  'furnace-only':         { low: 2500, high: 5000 },
  'ac-and-furnace':       { low: 5000, high: 10000 },
  'heat-pump':            { low: 4000, high: 8000 },
  'ductless-mini-split':  { low: 3000, high: 5000 },
};

/**
 * Home size multiplier.
 * Larger homes require higher-capacity units and more complex installation.
 */
const HOME_SIZE_MULTIPLIERS: Record<string, number> = {
  'small-under-1500':  1.0,
  'medium-1500-2500':  1.25,
  'large-2500-3500':   1.50,
  'xlarge-over-3500':  1.80,
};

/**
 * Efficiency level multiplier.
 * Higher SEER-rated units cost more upfront.
 */
const EFFICIENCY_MULTIPLIERS: Record<string, number> = {
  'standard-14-seer':  1.0,
  'high-16-seer':      1.15,
  'premium-20-seer':   1.35,
};

/**
 * Ductwork condition cost adder.
 * Source: HomeAdvisor 2025-2026 ductwork cost data.
 */
const DUCTWORK_COSTS: Record<string, { low: number; high: number }> = {
  'existing-good':  { low: 0,    high: 0 },
  'minor-repair':   { low: 500,  high: 1500 },
  'major-repair':   { low: 2000, high: 5000 },
  'new-ductwork':   { low: 5000, high: 12000 },
};

/**
 * Thermostat upgrade cost adder.
 */
const THERMOSTAT_COSTS: Record<string, { low: number; high: number }> = {
  'none':                { low: 0,   high: 0 },
  'basic-programmable':  { low: 150, high: 300 },
  'smart-wifi':          { low: 200, high: 400 },
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
 * Typical tonnage by home size (for cost-per-ton calculation).
 * Source: ACCA Manual J guidelines.
 */
const TYPICAL_TONNAGE: Record<string, number> = {
  'small-under-1500':  2.0,
  'medium-1500-2500':  3.0,
  'large-2500-3500':   4.0,
  'xlarge-over-3500':  5.0,
};

/**
 * Display labels for system types.
 */
const SYSTEM_LABELS: Record<string, string> = {
  'central-ac-only':      'Central AC Only',
  'furnace-only':         'Furnace Only',
  'ac-and-furnace':       'AC + Furnace Bundle',
  'heat-pump':            'Heat Pump',
  'ductless-mini-split':  'Ductless Mini-Split',
};

/**
 * Typical installation timelines by system type.
 */
const TIMELINES: Record<string, string> = {
  'central-ac-only':      '1–2 days',
  'furnace-only':         '1–2 days',
  'ac-and-furnace':       '2–3 days',
  'heat-pump':            '1–3 days',
  'ductless-mini-split':  '1–2 days',
};

/**
 * Labor is roughly 40% of equipment cost for HVAC installations.
 */
const LABOR_RATIO = 0.40;

/**
 * HVAC replacement cost calculator.
 *
 * totalLow  = equipmentLow + laborLow + ductwork.low + thermostat.low
 * totalHigh = equipmentHigh + laborHigh + ductwork.high + thermostat.high
 * totalMid  = (totalLow + totalHigh) / 2
 *
 * Source: HomeAdvisor / Angi 2025-2026, ENERGY STAR, ACCA Manual J.
 */
export function calculateHvacReplacementCost(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const systemType = String(inputs.systemType || 'central-ac-only');
  const homeSize = String(inputs.homeSize || 'medium-1500-2500');
  const efficiency = String(inputs.efficiency || 'standard-14-seer');
  const ductwork = String(inputs.ductwork || 'existing-good');
  const thermostat = String(inputs.thermostat || 'none');
  const region = String(inputs.region || 'national');

  // ── Look up rates ─────────────────────────────────────
  const systemBase = SYSTEM_BASE_COSTS[systemType] ?? SYSTEM_BASE_COSTS['central-ac-only'];
  const homeMult = HOME_SIZE_MULTIPLIERS[homeSize] ?? 1.0;
  const effMult = EFFICIENCY_MULTIPLIERS[efficiency] ?? 1.0;
  const ductRates = DUCTWORK_COSTS[ductwork] ?? DUCTWORK_COSTS['existing-good'];
  const thermoRates = THERMOSTAT_COSTS[thermostat] ?? THERMOSTAT_COSTS['none'];
  const regionMult = REGIONAL_MULTIPLIERS[region] ?? 1.0;
  const tonnage = TYPICAL_TONNAGE[homeSize] ?? 3.0;

  // ── Calculate equipment cost ──────────────────────────
  const equipmentLow = parseFloat((systemBase.low * homeMult * effMult).toFixed(2));
  const equipmentHigh = parseFloat((systemBase.high * homeMult * effMult).toFixed(2));
  const equipmentCost = parseFloat(((equipmentLow + equipmentHigh) / 2).toFixed(2));

  // ── Calculate labor cost (40% of equipment × regional multiplier) ──
  const laborLow = parseFloat((equipmentLow * LABOR_RATIO * regionMult).toFixed(2));
  const laborHigh = parseFloat((equipmentHigh * LABOR_RATIO * regionMult).toFixed(2));
  const laborCost = parseFloat(((laborLow + laborHigh) / 2).toFixed(2));

  // ── Ductwork and thermostat costs ─────────────────────
  const ductworkCost = parseFloat(((ductRates.low + ductRates.high) / 2).toFixed(2));
  const thermostatCost = parseFloat(((thermoRates.low + thermoRates.high) / 2).toFixed(2));

  // ── Calculate totals ──────────────────────────────────
  const totalLow = parseFloat((equipmentLow + laborLow + ductRates.low + thermoRates.low).toFixed(2));
  const totalHigh = parseFloat((equipmentHigh + laborHigh + ductRates.high + thermoRates.high).toFixed(2));
  const totalMid = parseFloat(((totalLow + totalHigh) / 2).toFixed(2));

  // ── Cost per ton ──────────────────────────────────────
  const costPerTon = tonnage > 0 ? parseFloat((totalMid / tonnage).toFixed(2)) : 0;

  // ── System comparison (all 5 types, same home size, standard efficiency, national, no ductwork/thermo) ──
  const systemKeys = Object.keys(SYSTEM_BASE_COSTS);
  const systemComparison = systemKeys.map(key => {
    const base = SYSTEM_BASE_COSTS[key];
    const eqLow = base.low * homeMult * effMult;
    const eqHigh = base.high * homeMult * effMult;
    const labLow = eqLow * LABOR_RATIO * regionMult;
    const labHigh = eqHigh * LABOR_RATIO * regionMult;
    const mid = (eqLow + labLow + eqHigh + labHigh) / 2;
    return {
      label: `${SYSTEM_LABELS[key]} ($${base.low.toLocaleString()}–$${base.high.toLocaleString()} base)`,
      value: parseFloat(mid.toFixed(2)),
    };
  });

  // ── Estimated annual savings for high-efficiency ──────
  let estimatedAnnualSavings: string;
  if (efficiency === 'premium-20-seer') {
    estimatedAnnualSavings = '$300–$500/year vs. standard 14 SEER';
  } else if (efficiency === 'high-16-seer') {
    estimatedAnnualSavings = '$100–$250/year vs. standard 14 SEER';
  } else {
    estimatedAnnualSavings = 'Baseline — upgrade to 16+ SEER for $100–$500/year savings';
  }

  // ── Timeline ──────────────────────────────────────────
  const timeline = TIMELINES[systemType] ?? '1–3 days';

  return {
    equipmentCost,
    laborCost,
    ductworkCost,
    thermostatCost,
    totalLow,
    totalHigh,
    totalMid,
    costPerTon,
    systemComparison,
    estimatedAnnualSavings,
    timeline,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'hvac-replacement-cost': calculateHvacReplacementCost,
};
