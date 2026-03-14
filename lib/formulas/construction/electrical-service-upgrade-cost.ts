/**
 * Electrical Service Upgrade Cost Calculator Formula Module
 *
 * Estimates the full cost of upgrading electrical service — utility meter,
 * weatherhead, main service line, AND new panel. This is DISTINCT from a
 * panel-only upgrade (electrical-panel-upgrade-cost), which swaps the
 * breaker box at the same amperage or upgrades within the existing service.
 *
 * A service upgrade involves: utility coordination, new meter base, new
 * weatherhead/mast or underground lateral, new main service entrance cable,
 * AND a new main panel.
 *
 * Cost formula:
 *   baseCost = UPGRADE_COSTS[upgradeType]
 *   materialCost = baseCost x 0.35
 *   laborCostBase = baseCost x 0.65
 *   adjustedLabor = laborCostBase x meterMult x weatherheadMult x homeAgeMult x regionMult
 *   permitCost = PERMIT_COSTS[permitRequired]
 *   total = materialCost + adjustedLabor + permitCost
 *
 * Source: HomeAdvisor / Angi 2025-2026 national averages;
 *         National Electrical Contractors Association (NECA);
 *         Bureau of Labor Statistics (SOC 47-2111) for electrician wages
 */

export interface ElectricalServiceUpgradeCostInput {
  upgradeType: string;     // '100-to-200' | '200-to-400' | '100-to-400'
  meterLocation: string;   // 'same-location' | 'relocate'
  weatherhead: string;     // 'standard' | 'underground-conversion'
  homeAge: string;         // 'modern-post-2000' | 'mid-1960-2000' | 'old-pre-1960'
  permitRequired: string;  // 'yes' | 'no'
  region: string;          // 'national' | 'northeast' | 'west-coast' | 'mid-atlantic' | 'midwest' | 'south' | 'mountain-west'
}

export interface ElectricalServiceUpgradeCostOutput {
  upgradeCost: number;
  materialCost: number;
  laborCost: number;
  permitCost: number;
  totalLow: number;
  totalHigh: number;
  totalMid: number;
  costPerAmp: number;
  upgradeComparison: { label: string; value: number }[];
  timeline: string;
  utilityNote: string;
}

/**
 * Upgrade type base cost ranges (total project, before material/labor split).
 * Source: HomeAdvisor / Angi 2025-2026; NECA unit pricing.
 */
const UPGRADE_COSTS: Record<string, { low: number; high: number }> = {
  '100-to-200': { low: 3000,  high: 5000 },
  '200-to-400': { low: 5000,  high: 10000 },
  '100-to-400': { low: 7000,  high: 14000 },
};

/**
 * Target amperage by upgrade type (used for cost-per-amp calculation).
 */
const TARGET_AMPS: Record<string, number> = {
  '100-to-200': 200,
  '200-to-400': 400,
  '100-to-400': 400,
};

/**
 * Meter location multiplier — applied to labor only.
 * Relocating the meter adds trenching, conduit, and utility coordination.
 */
const METER_MULTIPLIERS: Record<string, number> = {
  'same-location': 1.0,
  'relocate':      1.20,
};

/**
 * Weatherhead/service entrance type multiplier — applied to labor only.
 * Underground conversion adds trenching and conduit work.
 */
const WEATHERHEAD_MULTIPLIERS: Record<string, number> = {
  'standard':                1.0,
  'underground-conversion':  1.30,
};

/**
 * Home age multiplier — applied to labor only.
 * Older homes require more work due to outdated wiring, asbestos concerns,
 * non-standard configurations, and code remediation.
 */
const HOME_AGE_MULTIPLIERS: Record<string, number> = {
  'modern-post-2000': 1.0,
  'mid-1960-2000':    1.10,
  'old-pre-1960':     1.25,
};

/**
 * Permit cost ranges (adder).
 */
const PERMIT_COSTS: Record<string, { low: number; high: number }> = {
  'yes': { low: 200, high: 600 },
  'no':  { low: 0,   high: 0 },
};

/**
 * Regional labor multipliers.
 * Applied to labor portion only, not materials.
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
 * Display labels for upgrade types.
 */
const UPGRADE_LABELS: Record<string, string> = {
  '100-to-200': '100A to 200A Service Upgrade',
  '200-to-400': '200A to 400A Service Upgrade',
  '100-to-400': '100A to 400A Service Upgrade',
};

/**
 * Timeline by upgrade type.
 */
const TIMELINES: Record<string, string> = {
  '100-to-200': '1–2 days (plus utility scheduling)',
  '200-to-400': '2–3 days (plus utility scheduling)',
  '100-to-400': '2–4 days (plus utility scheduling)',
};

/**
 * Electrical service upgrade cost calculator.
 *
 * total = materialCost + adjustedLabor + permitCost
 * materialCost = baseCost x 0.35
 * adjustedLabor = (baseCost x 0.65) x meterMult x weatherheadMult x homeAgeMult x regionMult
 *
 * Source: HomeAdvisor / Angi 2025-2026, NECA, BLS SOC 47-2111.
 */
export function calculateElectricalServiceUpgradeCost(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const upgradeType = String(inputs.upgradeType || '100-to-200');
  const meterLocation = String(inputs.meterLocation || 'same-location');
  const weatherhead = String(inputs.weatherhead || 'standard');
  const homeAge = String(inputs.homeAge || 'modern-post-2000');
  const permitRequired = String(inputs.permitRequired || 'yes');
  const region = String(inputs.region || 'national');

  // ── Look up rates ─────────────────────────────────────
  const baseRates = UPGRADE_COSTS[upgradeType] ?? UPGRADE_COSTS['100-to-200'];
  const targetAmps = TARGET_AMPS[upgradeType] ?? 200;
  const meterMult = METER_MULTIPLIERS[meterLocation] ?? 1.0;
  const weatherMult = WEATHERHEAD_MULTIPLIERS[weatherhead] ?? 1.0;
  const ageMult = HOME_AGE_MULTIPLIERS[homeAge] ?? 1.0;
  const permitRates = PERMIT_COSTS[permitRequired] ?? PERMIT_COSTS['yes'];
  const regionMult = REGIONAL_MULTIPLIERS[region] ?? 1.0;

  // ── Material cost = 35% of base ───────────────────────
  const materialCostLow = parseFloat((baseRates.low * 0.35).toFixed(2));
  const materialCostHigh = parseFloat((baseRates.high * 0.35).toFixed(2));

  // ── Labor cost = 65% of base x all multipliers ────────
  const laborBaseLow = baseRates.low * 0.65;
  const laborBaseHigh = baseRates.high * 0.65;
  const combinedMult = meterMult * weatherMult * ageMult * regionMult;
  const laborCostLow = parseFloat((laborBaseLow * combinedMult).toFixed(2));
  const laborCostHigh = parseFloat((laborBaseHigh * combinedMult).toFixed(2));

  // ── Permit cost ───────────────────────────────────────
  const permitCostLow = parseFloat(permitRates.low.toFixed(2));
  const permitCostHigh = parseFloat(permitRates.high.toFixed(2));

  // ── Totals ────────────────────────────────────────────
  const totalLow = parseFloat((materialCostLow + laborCostLow + permitCostLow).toFixed(2));
  const totalHigh = parseFloat((materialCostHigh + laborCostHigh + permitCostHigh).toFixed(2));
  const totalMid = parseFloat(((totalLow + totalHigh) / 2).toFixed(2));

  // ── Mid-point costs for display ───────────────────────
  const upgradeCost = parseFloat(((baseRates.low + baseRates.high) / 2).toFixed(2));
  const materialCost = parseFloat(((materialCostLow + materialCostHigh) / 2).toFixed(2));
  const laborCost = parseFloat(((laborCostLow + laborCostHigh) / 2).toFixed(2));
  const permitCost = parseFloat(((permitCostLow + permitCostHigh) / 2).toFixed(2));

  // ── Cost per amp ──────────────────────────────────────
  const costPerAmp = parseFloat((totalMid / targetAmps).toFixed(2));

  // ── Upgrade comparison (all types, same-location, standard weatherhead, modern home, national, with permit) ──
  const upgradeKeys = Object.keys(UPGRADE_COSTS);
  const upgradeComparison = upgradeKeys.map(key => {
    const cr = UPGRADE_COSTS[key];
    const matMid = ((cr.low + cr.high) / 2) * 0.35;
    const labMid = ((cr.low + cr.high) / 2) * 0.65;
    const permMid = (PERMIT_COSTS['yes'].low + PERMIT_COSTS['yes'].high) / 2;
    const total = matMid + labMid + permMid;
    return {
      label: UPGRADE_LABELS[key] ?? key,
      value: parseFloat(total.toFixed(2)),
    };
  });

  // ── Timeline ──────────────────────────────────────────
  const timeline = TIMELINES[upgradeType] ?? '1–2 days (plus utility scheduling)';

  // ── Utility note ──────────────────────────────────────
  const utilityNote = 'Your utility company must disconnect and reconnect power. Schedule 2–4 weeks ahead. Some utilities charge $0–$500 for the service drop reconnection.';

  return {
    upgradeCost,
    materialCost,
    laborCost,
    permitCost,
    totalLow,
    totalHigh,
    totalMid,
    costPerAmp,
    upgradeComparison,
    timeline,
    utilityNote,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'electrical-service-upgrade-cost': calculateElectricalServiceUpgradeCost,
};
