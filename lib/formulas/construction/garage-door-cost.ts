/**
 * Garage Door Cost Calculator Formula Module
 *
 * Estimates garage door purchase and installation costs across five door types
 * (single-standard, single-insulated, double-standard, double-insulated,
 * custom-carriage) with four materials, three insulation upgrades, four opener
 * options, optional old-door removal, and regional labor multipliers.
 *
 * Cost formula:
 *   doorCostBase = doorType base price range
 *   doorCostAdjusted = doorCostBase × materialMultiplier × insulationMultiplier
 *   laborCost = laborRate × regionalMultiplier
 *   openerCost = opener price range (fixed add-on)
 *   removalCost = removal price (fixed add-on)
 *   totalLow = doorCostLow + laborCostLow + openerCostLow + removalCostLow
 *   totalHigh = doorCostHigh + laborCostHigh + openerCostHigh + removalCostHigh
 *   totalMid = (totalLow + totalHigh) / 2
 *
 * Source: HomeAdvisor / Angi 2025-2026 national averages;
 *         International Door Association (IDA)
 */

export interface GarageDoorCostInput {
  doorType: string;       // 'single-standard' | 'single-insulated' | 'double-standard' | 'double-insulated' | 'custom-carriage'
  material: string;       // 'steel' | 'wood' | 'aluminum' | 'fiberglass' | 'composite'
  insulation: string;     // 'none' | 'polystyrene' | 'polyurethane'
  opener: string;         // 'none' | 'chain-drive' | 'belt-drive' | 'smart-wifi'
  oldDoorRemoval: string; // 'none' | 'yes'
  region: string;         // 'national' | 'northeast' | 'west-coast' | 'mid-atlantic' | 'midwest' | 'south' | 'mountain-west'
}

export interface GarageDoorCostOutput {
  doorCost: number;
  laborCost: number;
  openerCost: number;
  removalCost: number;
  totalLow: number;
  totalHigh: number;
  totalMid: number;
  doorTypeComparison: { label: string; value: number }[];
  timeline: string;
}

/**
 * Door type base price ranges (door unit only, before material/insulation).
 * Source: HomeAdvisor / Angi 2025-2026.
 */
const DOOR_TYPE_COSTS: Record<string, { low: number; high: number }> = {
  'single-standard':   { low: 600,  high: 1200 },
  'single-insulated':  { low: 800,  high: 1600 },
  'double-standard':   { low: 800,  high: 1800 },
  'double-insulated':  { low: 1200, high: 2500 },
  'custom-carriage':   { low: 2000, high: 5000 },
};

/**
 * Material multipliers applied to door cost.
 * Steel is the baseline (1.0x).
 */
const MATERIAL_MULTIPLIERS: Record<string, number> = {
  'steel':       1.00,
  'wood':        1.40,
  'aluminum':    0.85,
  'fiberglass':  1.15,
  'composite':   1.25,
};

/**
 * Insulation upgrade multipliers applied to door cost.
 * 'none' = no insulation surcharge.
 */
const INSULATION_MULTIPLIERS: Record<string, number> = {
  'none':         1.00,
  'polystyrene':  1.10,
  'polyurethane': 1.20,
};

/**
 * Labor cost per door installation (not per sq ft — per project).
 * Source: HomeAdvisor / Angi 2025-2026.
 */
const LABOR_COSTS: Record<string, { low: number; high: number }> = {
  'single-standard':   { low: 200, high: 400 },
  'single-insulated':  { low: 200, high: 400 },
  'double-standard':   { low: 300, high: 500 },
  'double-insulated':  { low: 300, high: 500 },
  'custom-carriage':   { low: 400, high: 500 },
};

/**
 * Opener add-on cost ranges (installed).
 */
const OPENER_COSTS: Record<string, { low: number; high: number }> = {
  'none':        { low: 0,   high: 0 },
  'chain-drive': { low: 200, high: 350 },
  'belt-drive':  { low: 300, high: 500 },
  'smart-wifi':  { low: 400, high: 700 },
};

/**
 * Old door removal and disposal cost.
 */
const REMOVAL_COSTS: Record<string, { low: number; high: number }> = {
  'none': { low: 0,   high: 0 },
  'yes':  { low: 100, high: 200 },
};

/**
 * Regional labor multipliers.
 * Applied to labor portion only, not door/opener/removal costs.
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
 * Display labels for door types.
 */
const DOOR_TYPE_LABELS: Record<string, string> = {
  'single-standard':  'Single Standard',
  'single-insulated': 'Single Insulated',
  'double-standard':  'Double Standard',
  'double-insulated': 'Double Insulated',
  'custom-carriage':  'Custom Carriage',
};

/**
 * Timeline estimates by door type.
 */
const TIMELINE_ESTIMATES: Record<string, string> = {
  'single-standard':  '3–5 hours (same-day installation)',
  'single-insulated': '3–5 hours (same-day installation)',
  'double-standard':  '4–6 hours (same-day installation)',
  'double-insulated': '4–6 hours (same-day installation)',
  'custom-carriage':  '1–2 days (custom fit and finishing)',
};

/**
 * Garage door cost calculator.
 *
 * totalLow = doorCostLow + laborCostLow + openerCostLow + removalCostLow
 * totalHigh = doorCostHigh + laborCostHigh + openerCostHigh + removalCostHigh
 * totalMid = (totalLow + totalHigh) / 2
 *
 * Source: HomeAdvisor / Angi 2025-2026, International Door Association (IDA).
 */
export function calculateGarageDoorCost(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const doorType = String(inputs.doorType || 'single-standard');
  const material = String(inputs.material || 'steel');
  const insulation = String(inputs.insulation || 'none');
  const opener = String(inputs.opener || 'none');
  const oldDoorRemoval = String(inputs.oldDoorRemoval || 'none');
  const region = String(inputs.region || 'national');

  // ── Look up rates ─────────────────────────────────────
  const doorBase = DOOR_TYPE_COSTS[doorType] ?? DOOR_TYPE_COSTS['single-standard'];
  const materialMult = MATERIAL_MULTIPLIERS[material] ?? 1.0;
  const insulationMult = INSULATION_MULTIPLIERS[insulation] ?? 1.0;
  const laborBase = LABOR_COSTS[doorType] ?? LABOR_COSTS['single-standard'];
  const openerBase = OPENER_COSTS[opener] ?? OPENER_COSTS['none'];
  const removalBase = REMOVAL_COSTS[oldDoorRemoval] ?? REMOVAL_COSTS['none'];
  const regionMult = REGIONAL_MULTIPLIERS[region] ?? 1.0;

  // ── Calculate door cost (base × material × insulation) ──
  const doorCostLow = parseFloat((doorBase.low * materialMult * insulationMult).toFixed(2));
  const doorCostHigh = parseFloat((doorBase.high * materialMult * insulationMult).toFixed(2));

  // ── Calculate labor cost (per-door rate × regional multiplier) ──
  const laborCostLow = parseFloat((laborBase.low * regionMult).toFixed(2));
  const laborCostHigh = parseFloat((laborBase.high * regionMult).toFixed(2));

  // ── Opener cost (fixed add-on, not affected by region) ──
  const openerCostLow = parseFloat(openerBase.low.toFixed(2));
  const openerCostHigh = parseFloat(openerBase.high.toFixed(2));

  // ── Removal cost (fixed add-on, not affected by region) ──
  const removalCostLow = parseFloat(removalBase.low.toFixed(2));
  const removalCostHigh = parseFloat(removalBase.high.toFixed(2));

  // ── Totals ────────────────────────────────────────────
  const totalLow = parseFloat((doorCostLow + laborCostLow + openerCostLow + removalCostLow).toFixed(2));
  const totalHigh = parseFloat((doorCostHigh + laborCostHigh + openerCostHigh + removalCostHigh).toFixed(2));
  const totalMid = parseFloat(((totalLow + totalHigh) / 2).toFixed(2));

  // ── Mid-point costs for display ───────────────────────
  const doorCost = parseFloat(((doorCostLow + doorCostHigh) / 2).toFixed(2));
  const laborCost = parseFloat(((laborCostLow + laborCostHigh) / 2).toFixed(2));
  const openerCost = parseFloat(((openerCostLow + openerCostHigh) / 2).toFixed(2));
  const removalCost = parseFloat(((removalCostLow + removalCostHigh) / 2).toFixed(2));

  // ── Door type comparison (steel, no insulation, no opener/removal, national) ──
  const doorTypeKeys = Object.keys(DOOR_TYPE_COSTS);
  const doorTypeComparison = doorTypeKeys.map(key => {
    const base = DOOR_TYPE_COSTS[key];
    const labor = LABOR_COSTS[key] ?? LABOR_COSTS['single-standard'];
    const doorMid = (base.low + base.high) / 2;
    const laborMid = (labor.low + labor.high) / 2;
    const mid = doorMid + laborMid;
    return {
      label: `${DOOR_TYPE_LABELS[key]} ($${base.low}–$${base.high} door)`,
      value: parseFloat(mid.toFixed(2)),
    };
  });

  // ── Timeline ──────────────────────────────────────────
  const timeline = TIMELINE_ESTIMATES[doorType] ?? '3–6 hours';

  return {
    doorCost,
    laborCost,
    openerCost,
    removalCost,
    totalLow,
    totalHigh,
    totalMid,
    doorTypeComparison,
    timeline,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'garage-door-cost': calculateGarageDoorCost,
};
