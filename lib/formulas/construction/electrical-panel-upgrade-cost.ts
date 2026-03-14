/**
 * Electrical Panel Upgrade Cost Calculator Formula Module
 *
 * Estimates electrical panel upgrade costs across four upgrade types:
 * panel swap (same amperage), 100A-to-200A upgrade, upgrade to 400A,
 * and sub-panel addition. Splits costs into panel/parts, labor, circuits,
 * permit, and surge protector components with regional labor multipliers.
 *
 * Cost formula:
 *   panelCostLow = upgradeType.partsLow × panelBrandMultiplier
 *   panelCostHigh = upgradeType.partsHigh × panelBrandMultiplier
 *   laborCostLow = upgradeType.laborLow × regionalMultiplier
 *   laborCostHigh = upgradeType.laborHigh × regionalMultiplier
 *   circuitCost = additionalCircuits range
 *   permitCost = permit range (if included)
 *   surgeCost = surge protector range (if enabled)
 *   totalLow = panelCostLow + laborCostLow + circuitCostLow + permitCostLow + surgeCostLow
 *   totalHigh = panelCostHigh + laborCostHigh + circuitCostHigh + permitCostHigh + surgeCostHigh
 *   totalMid = (totalLow + totalHigh) / 2
 *
 * Source: HomeAdvisor / Angi 2025-2026 Electrical Panel Cost Data;
 *         National Electrical Contractors Association (NECA)
 */

export interface ElectricalPanelUpgradeCostInput {
  upgradeType: string;               // 'panel-swap-same-amp' | 'upgrade-100-to-200' | 'upgrade-to-400' | 'sub-panel-add'
  panelBrand: string;                // 'standard' | 'mid-grade' | 'premium'
  additionalCircuits: string;        // 'none' | '2-4-circuits' | '5-8-circuits' | '10-plus-circuits'
  permitInspection: string;          // 'included' | 'not-needed'
  wholeHouseSurgeProtector: string;  // 'yes' | 'no'
  region: string;                    // 'national' | 'northeast' | 'west-coast' | 'mid-atlantic' | 'midwest' | 'south' | 'mountain-west'
}

export interface ElectricalPanelUpgradeCostOutput {
  panelCost: number;
  laborCost: number;
  circuitCost: number;
  permitCost: number;
  surgeCost: number;
  totalLow: number;
  totalHigh: number;
  totalMid: number;
  upgradeComparison: { label: string; value: number }[];
  timeline: string;
  safetyNote: string;
}

/**
 * Panel/parts cost by upgrade type.
 * Source: HomeAdvisor / Angi 2025-2026 national averages.
 */
const PANEL_COSTS: Record<string, { low: number; high: number }> = {
  'panel-swap-same-amp': { low: 1000, high: 1800 },
  'upgrade-100-to-200':  { low: 1500, high: 3000 },
  'upgrade-to-400':      { low: 3000, high: 5000 },
  'sub-panel-add':       { low: 800,  high: 1500 },
};

/**
 * Labor cost by upgrade type.
 * Source: HomeAdvisor / Angi 2025-2026 national averages.
 */
const LABOR_COSTS: Record<string, { low: number; high: number }> = {
  'panel-swap-same-amp': { low: 500,  high: 1000 },
  'upgrade-100-to-200':  { low: 800,  high: 1500 },
  'upgrade-to-400':      { low: 1500, high: 2500 },
  'sub-panel-add':       { low: 400,  high: 800 },
};

/**
 * Panel brand tier multipliers.
 * Applied to panel/parts cost only.
 */
const BRAND_MULTIPLIERS: Record<string, number> = {
  'standard':  1.0,
  'mid-grade': 1.15,
  'premium':   1.30,
};

/**
 * Additional circuit costs.
 * Source: HomeAdvisor / Angi 2025-2026 national averages.
 */
const CIRCUIT_COSTS: Record<string, { low: number; high: number }> = {
  'none':             { low: 0,   high: 0 },
  '2-4-circuits':     { low: 200, high: 400 },
  '5-8-circuits':     { low: 400, high: 800 },
  '10-plus-circuits': { low: 800, high: 1500 },
};

/**
 * Permit and inspection costs.
 * Source: HomeAdvisor / Angi 2025-2026 national averages.
 */
const PERMIT_COSTS: Record<string, { low: number; high: number }> = {
  'included':    { low: 150, high: 400 },
  'not-needed':  { low: 0,   high: 0 },
};

/**
 * Whole-house surge protector costs.
 * Source: HomeAdvisor / Angi 2025-2026 national averages.
 */
const SURGE_COSTS: Record<string, { low: number; high: number }> = {
  'yes': { low: 200, high: 500 },
  'no':  { low: 0,   high: 0 },
};

/**
 * Regional labor multipliers.
 * Applied to labor portion only, not parts/materials.
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
 * Display labels for upgrade types.
 */
const UPGRADE_LABELS: Record<string, string> = {
  'panel-swap-same-amp': 'Panel Swap (Same Amp)',
  'upgrade-100-to-200':  '100A to 200A Upgrade',
  'upgrade-to-400':      'Upgrade to 400A',
  'sub-panel-add':       'Sub-Panel Addition',
};

/**
 * Estimated timelines by upgrade type.
 */
const TIMELINES: Record<string, string> = {
  'panel-swap-same-amp': '4–8 hours',
  'upgrade-100-to-200':  '1–2 days',
  'upgrade-to-400':      '2–3 days',
  'sub-panel-add':       '4–6 hours',
};

/**
 * Electrical panel upgrade cost calculator.
 *
 * totalLow = panelCostLow + laborCostLow + circuitCostLow + permitCostLow + surgeCostLow
 * totalHigh = panelCostHigh + laborCostHigh + circuitCostHigh + permitCostHigh + surgeCostHigh
 * totalMid = (totalLow + totalHigh) / 2
 *
 * Source: HomeAdvisor / Angi 2025-2026; NECA.
 */
export function calculateElectricalPanelUpgradeCost(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const upgradeType = String(inputs.upgradeType || 'upgrade-100-to-200');
  const panelBrand = String(inputs.panelBrand || 'standard');
  const additionalCircuits = String(inputs.additionalCircuits || 'none');
  const permitInspection = String(inputs.permitInspection || 'included');
  const wholeHouseSurge = String(inputs.wholeHouseSurgeProtector || 'no');
  const region = String(inputs.region || 'national');

  // ── Look up rates ─────────────────────────────────────
  const panelRates = PANEL_COSTS[upgradeType] ?? PANEL_COSTS['upgrade-100-to-200'];
  const laborRates = LABOR_COSTS[upgradeType] ?? LABOR_COSTS['upgrade-100-to-200'];
  const brandMult = BRAND_MULTIPLIERS[panelBrand] ?? 1.0;
  const circuitRates = CIRCUIT_COSTS[additionalCircuits] ?? CIRCUIT_COSTS['none'];
  const permitRates = PERMIT_COSTS[permitInspection] ?? PERMIT_COSTS['included'];
  const surgeRates = SURGE_COSTS[wholeHouseSurge] ?? SURGE_COSTS['no'];
  const regionMult = REGIONAL_MULTIPLIERS[region] ?? 1.0;

  // ── Calculate panel/parts cost ────────────────────────
  const panelCostLow = parseFloat((panelRates.low * brandMult).toFixed(2));
  const panelCostHigh = parseFloat((panelRates.high * brandMult).toFixed(2));

  // ── Calculate labor cost ──────────────────────────────
  const laborCostLow = parseFloat((laborRates.low * regionMult).toFixed(2));
  const laborCostHigh = parseFloat((laborRates.high * regionMult).toFixed(2));

  // ── Additional circuit cost ───────────────────────────
  const circuitCostLow = parseFloat(circuitRates.low.toFixed(2));
  const circuitCostHigh = parseFloat(circuitRates.high.toFixed(2));

  // ── Permit cost ───────────────────────────────────────
  const permitCostLow = parseFloat(permitRates.low.toFixed(2));
  const permitCostHigh = parseFloat(permitRates.high.toFixed(2));

  // ── Surge protector cost ──────────────────────────────
  const surgeCostLow = parseFloat(surgeRates.low.toFixed(2));
  const surgeCostHigh = parseFloat(surgeRates.high.toFixed(2));

  // ── Calculate totals ──────────────────────────────────
  const totalLow = parseFloat((panelCostLow + laborCostLow + circuitCostLow + permitCostLow + surgeCostLow).toFixed(2));
  const totalHigh = parseFloat((panelCostHigh + laborCostHigh + circuitCostHigh + permitCostHigh + surgeCostHigh).toFixed(2));
  const totalMid = parseFloat(((totalLow + totalHigh) / 2).toFixed(2));

  // ── Mid-point costs for display ───────────────────────
  const panelCost = parseFloat(((panelCostLow + panelCostHigh) / 2).toFixed(2));
  const laborCost = parseFloat(((laborCostLow + laborCostHigh) / 2).toFixed(2));
  const circuitCost = parseFloat(((circuitCostLow + circuitCostHigh) / 2).toFixed(2));
  const permitCost = parseFloat(((permitCostLow + permitCostHigh) / 2).toFixed(2));
  const surgeCost = parseFloat(((surgeCostLow + surgeCostHigh) / 2).toFixed(2));

  // ── Upgrade comparison (all 4 types, national avg, standard brand, no extras) ──
  const upgradeKeys = Object.keys(PANEL_COSTS);
  const upgradeComparison = upgradeKeys.map(key => {
    const pr = PANEL_COSTS[key];
    const lr = LABOR_COSTS[key];
    const panelMid = (pr.low + pr.high) / 2;
    const laborMid = (lr.low + lr.high) / 2;
    const mid = panelMid + laborMid;
    return {
      label: `${UPGRADE_LABELS[key]} ($${pr.low + lr.low}–$${pr.high + lr.high})`,
      value: parseFloat(mid.toFixed(2)),
    };
  });

  // ── Timeline ──────────────────────────────────────────
  const timeline = TIMELINES[upgradeType] ?? '1–2 days';

  // ── Safety note ───────────────────────────────────────
  const safetyNote = 'Electrical panel work requires a licensed electrician. Never attempt panel upgrades as a DIY project — risk of electrocution, arc flash, fire, and code violations. Always obtain permits and schedule inspection.';

  return {
    panelCost,
    laborCost,
    circuitCost,
    permitCost,
    surgeCost,
    totalLow,
    totalHigh,
    totalMid,
    upgradeComparison,
    timeline,
    safetyNote,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'electrical-panel-upgrade-cost': calculateElectricalPanelUpgradeCost,
};
