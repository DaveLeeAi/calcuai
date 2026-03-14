/**
 * EV Charger Installation Cost Calculator Formula Module
 *
 * Estimates home EV charger installation costs across four charger levels
 * (level-1, level-2-32amp, level-2-48amp, level-2-80amp) with four brand
 * tiers, three circuit distance ranges, three panel upgrade options,
 * optional permit costs, and regional labor multipliers.
 *
 * Cost formula:
 *   chargerCostBase = charger level base price range × brand multiplier
 *   laborCostBase = labor base × circuit distance multiplier × regional multiplier
 *   panelCost = panel upgrade range (fixed add-on)
 *   permitCost = permit range (fixed add-on)
 *   totalLow = chargerCostLow + laborCostLow + panelCostLow + permitCostLow
 *   totalHigh = chargerCostHigh + laborCostHigh + panelCostHigh + permitCostHigh
 *   totalMid = (totalLow + totalHigh) / 2
 *
 * Source: HomeAdvisor / Angi 2025-2026 national averages;
 *         U.S. Department of Energy Alternative Fuels Data Center
 */

export interface EvChargerInstallationCostInput {
  chargerLevel: string;   // 'level-1' | 'level-2-32amp' | 'level-2-48amp' | 'level-2-80amp'
  chargerBrand: string;   // 'basic' | 'mid-range' | 'premium' | 'tesla-wall-connector'
  circuitDistance: string; // 'under-25ft' | '25-50ft' | 'over-50ft'
  panelUpgrade: string;   // 'none' | 'subpanel' | 'main-panel-upgrade'
  permitRequired: string; // 'yes' | 'no'
  region: string;         // 'national' | 'northeast' | 'west-coast' | 'mid-atlantic' | 'midwest' | 'south' | 'mountain-west'
}

export interface EvChargerInstallationCostOutput {
  chargerCost: number;
  laborCost: number;
  panelCost: number;
  permitCost: number;
  totalLow: number;
  totalHigh: number;
  totalMid: number;
  chargerComparison: { label: string; value: number }[];
  chargingSpeed: string;
  timeline: string;
}

/**
 * Charger unit base price ranges by level.
 * Level 1 uses the included EVSE cord — $0 charger cost.
 * Source: HomeAdvisor / Angi 2025-2026, DOE AFDC.
 */
const CHARGER_COSTS: Record<string, { low: number; high: number }> = {
  'level-1':         { low: 0,   high: 0 },
  'level-2-32amp':   { low: 300, high: 600 },
  'level-2-48amp':   { low: 500, high: 900 },
  'level-2-80amp':   { low: 700, high: 1200 },
};

/**
 * Brand multipliers applied to charger cost.
 * Basic is the baseline (1.0x).
 */
const BRAND_MULTIPLIERS: Record<string, number> = {
  'basic':                  1.00,
  'mid-range':              1.15,
  'premium':                1.40,
  'tesla-wall-connector':   1.25,
};

/**
 * Base labor cost per charger level (installation only).
 * Source: HomeAdvisor / Angi 2025-2026.
 */
const LABOR_BASE: Record<string, { low: number; high: number }> = {
  'level-1':         { low: 100, high: 200 },
  'level-2-32amp':   { low: 400, high: 800 },
  'level-2-48amp':   { low: 500, high: 1000 },
  'level-2-80amp':   { low: 600, high: 1200 },
};

/**
 * Circuit distance multiplier applied to labor.
 * Longer runs require more wire, conduit, and labor time.
 */
const CIRCUIT_DISTANCE_MULTIPLIERS: Record<string, number> = {
  'under-25ft': 1.00,
  '25-50ft':    1.20,
  'over-50ft':  1.50,
};

/**
 * Panel upgrade cost ranges (fixed add-on).
 */
const PANEL_COSTS: Record<string, { low: number; high: number }> = {
  'none':                { low: 0,    high: 0 },
  'subpanel':            { low: 500,  high: 1500 },
  'main-panel-upgrade':  { low: 1500, high: 3000 },
};

/**
 * Permit cost ranges (fixed add-on).
 */
const PERMIT_COSTS: Record<string, { low: number; high: number }> = {
  'yes': { low: 75,  high: 250 },
  'no':  { low: 0,   high: 0 },
};

/**
 * Regional labor multipliers.
 * Applied to labor portion only.
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
 * Display labels for charger levels.
 */
const CHARGER_LEVEL_LABELS: Record<string, string> = {
  'level-1':       'Level 1 (120V — included EVSE)',
  'level-2-32amp': 'Level 2 — 32A (240V)',
  'level-2-48amp': 'Level 2 — 48A (240V)',
  'level-2-80amp': 'Level 2 — 80A (240V)',
};

/**
 * Charging speed descriptions.
 */
const CHARGING_SPEEDS: Record<string, string> = {
  'level-1':       '3–5 miles of range per hour (120V, ~1.4 kW)',
  'level-2-32amp': '20–25 miles of range per hour (240V, ~7.7 kW)',
  'level-2-48amp': '30–35 miles of range per hour (240V, ~11.5 kW)',
  'level-2-80amp': '40–50 miles of range per hour (240V, ~19.2 kW)',
};

/**
 * Timeline estimates by charger level.
 */
const TIMELINE_ESTIMATES: Record<string, string> = {
  'level-1':       '1–2 hours (outlet installation only)',
  'level-2-32amp': '2–4 hours (dedicated circuit + charger mount)',
  'level-2-48amp': '3–5 hours (dedicated circuit + charger mount)',
  'level-2-80amp': '4–8 hours (heavy circuit + charger mount)',
};

/**
 * EV charger installation cost calculator.
 *
 * totalLow = chargerCostLow + laborCostLow + panelCostLow + permitCostLow
 * totalHigh = chargerCostHigh + laborCostHigh + panelCostHigh + permitCostHigh
 * totalMid = (totalLow + totalHigh) / 2
 *
 * Source: HomeAdvisor / Angi 2025-2026, DOE AFDC.
 */
export function calculateEvChargerInstallationCost(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const chargerLevel = String(inputs.chargerLevel || 'level-2-32amp');
  const chargerBrand = String(inputs.chargerBrand || 'basic');
  const circuitDistance = String(inputs.circuitDistance || 'under-25ft');
  const panelUpgrade = String(inputs.panelUpgrade || 'none');
  const permitRequired = String(inputs.permitRequired || 'yes');
  const region = String(inputs.region || 'national');

  // ── Look up rates ─────────────────────────────────────
  const chargerBase = CHARGER_COSTS[chargerLevel] ?? CHARGER_COSTS['level-2-32amp'];
  const brandMult = BRAND_MULTIPLIERS[chargerBrand] ?? 1.0;
  const laborBase = LABOR_BASE[chargerLevel] ?? LABOR_BASE['level-2-32amp'];
  const distanceMult = CIRCUIT_DISTANCE_MULTIPLIERS[circuitDistance] ?? 1.0;
  const panelBase = PANEL_COSTS[panelUpgrade] ?? PANEL_COSTS['none'];
  const permitBase = PERMIT_COSTS[permitRequired] ?? PERMIT_COSTS['yes'];
  const regionMult = REGIONAL_MULTIPLIERS[region] ?? 1.0;

  // ── Calculate charger cost (base × brand multiplier) ──
  const chargerCostLow = parseFloat((chargerBase.low * brandMult).toFixed(2));
  const chargerCostHigh = parseFloat((chargerBase.high * brandMult).toFixed(2));

  // ── Calculate labor cost (base × distance multiplier × regional multiplier) ──
  const laborCostLow = parseFloat((laborBase.low * distanceMult * regionMult).toFixed(2));
  const laborCostHigh = parseFloat((laborBase.high * distanceMult * regionMult).toFixed(2));

  // ── Panel cost (fixed add-on) ─────────────────────────
  const panelCostLow = parseFloat(panelBase.low.toFixed(2));
  const panelCostHigh = parseFloat(panelBase.high.toFixed(2));

  // ── Permit cost (fixed add-on) ────────────────────────
  const permitCostLow = parseFloat(permitBase.low.toFixed(2));
  const permitCostHigh = parseFloat(permitBase.high.toFixed(2));

  // ── Totals ────────────────────────────────────────────
  const totalLow = parseFloat((chargerCostLow + laborCostLow + panelCostLow + permitCostLow).toFixed(2));
  const totalHigh = parseFloat((chargerCostHigh + laborCostHigh + panelCostHigh + permitCostHigh).toFixed(2));
  const totalMid = parseFloat(((totalLow + totalHigh) / 2).toFixed(2));

  // ── Mid-point costs for display ───────────────────────
  const chargerCost = parseFloat(((chargerCostLow + chargerCostHigh) / 2).toFixed(2));
  const laborCost = parseFloat(((laborCostLow + laborCostHigh) / 2).toFixed(2));
  const panelCost = parseFloat(((panelCostLow + panelCostHigh) / 2).toFixed(2));
  const permitCost = parseFloat(((permitCostLow + permitCostHigh) / 2).toFixed(2));

  // ── Charger level comparison (basic brand, under-25ft, no panel, with permit, national) ──
  const chargerKeys = Object.keys(CHARGER_COSTS);
  const chargerComparison = chargerKeys.map(key => {
    const cBase = CHARGER_COSTS[key];
    const lBase = LABOR_BASE[key] ?? LABOR_BASE['level-2-32amp'];
    const chargerMid = (cBase.low + cBase.high) / 2;
    const laborMid = (lBase.low + lBase.high) / 2;
    const mid = chargerMid + laborMid;
    return {
      label: `${CHARGER_LEVEL_LABELS[key]} ($${cBase.low}–$${cBase.high} charger)`,
      value: parseFloat(mid.toFixed(2)),
    };
  });

  // ── Charging speed ────────────────────────────────────
  const chargingSpeed = CHARGING_SPEEDS[chargerLevel] ?? '20–25 miles of range per hour';

  // ── Timeline ──────────────────────────────────────────
  let timeline = TIMELINE_ESTIMATES[chargerLevel] ?? '2–4 hours';
  if (panelUpgrade !== 'none') {
    timeline = timeline + ' + panel work adds 4–8 hours';
  }

  return {
    chargerCost,
    laborCost,
    panelCost,
    permitCost,
    totalLow,
    totalHigh,
    totalMid,
    chargerComparison,
    chargingSpeed,
    timeline,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'ev-charger-installation-cost': calculateEvChargerInstallationCost,
};
