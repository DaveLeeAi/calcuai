/**
 * Insulation Cost Calculator Formula Module
 *
 * Estimates full insulation installation costs (material + labor) across six
 * insulation types: fiberglass batt, blown-in cellulose, open-cell spray foam,
 * closed-cell spray foam, rigid board, and mineral wool.
 * Includes application area multipliers, R-value target multipliers, old
 * insulation removal, and regional labor multipliers.
 *
 * DISTINCT from insulation-calculator, which calculates material quantity only.
 * This module estimates total installed project cost.
 *
 * Cost formula:
 *   materialCost = area × materialRate × rValueMultiplier
 *   laborCost = area × laborRate × applicationMultiplier × regionalMultiplier
 *   removalCost = area × removalRate (if selected)
 *   total = materialCost + laborCost + removalCost
 *
 * Source: HomeAdvisor / Angi 2025-2026 national averages;
 *         U.S. DOE Insulation Recommendations
 */

export interface InsulationCostInput {
  area: number;
  areaUnit: string;               // 'sqft' | 'sqm'
  insulationType: string;         // 'fiberglass-batt' | 'blown-cellulose' | 'spray-foam-open' | 'spray-foam-closed' | 'rigid-board' | 'mineral-wool'
  applicationArea: string;        // 'attic' | 'walls' | 'crawlspace' | 'basement'
  rValueTarget: string;           // 'R-13' | 'R-19' | 'R-30' | 'R-38' | 'R-49'
  removalOfOld: string;           // 'none' | 'yes'
  region: string;                 // 'national' | 'northeast' | 'west-coast' | 'mid-atlantic' | 'midwest' | 'south' | 'mountain-west'
}

export interface InsulationCostOutput {
  area: number;
  materialCost: number;
  laborCost: number;
  removalCost: number;
  totalLow: number;
  totalHigh: number;
  totalMid: number;
  costPerSqFt: number;
  insulationComparison: { label: string; value: number }[];
  rValueAchieved: string;
  timeline: string;
}

/**
 * Area unit conversion factors to square feet.
 */
const areaToSqFt: Record<string, number> = {
  sqft: 1,
  sqm: 10.7639,
};

/**
 * Material cost per square foot by insulation type.
 * Source: HomeAdvisor / Angi 2025-2026 national averages.
 */
const MATERIAL_RATES: Record<string, { low: number; high: number }> = {
  'fiberglass-batt':    { low: 1.50, high: 3.50 },
  'blown-cellulose':    { low: 1.50, high: 3.00 },
  'spray-foam-open':    { low: 2.50, high: 5.50 },
  'spray-foam-closed':  { low: 4.00, high: 8.00 },
  'rigid-board':        { low: 2.00, high: 4.50 },
  'mineral-wool':       { low: 3.00, high: 5.50 },
};

/**
 * Labor cost per square foot by insulation type.
 * Source: HomeAdvisor / Angi 2025-2026 national averages.
 */
const LABOR_RATES: Record<string, { low: number; high: number }> = {
  'fiberglass-batt':    { low: 0.75, high: 1.50 },
  'blown-cellulose':    { low: 1.00, high: 2.00 },
  'spray-foam-open':    { low: 1.50, high: 3.00 },
  'spray-foam-closed':  { low: 2.00, high: 4.00 },
  'rigid-board':        { low: 1.00, high: 2.00 },
  'mineral-wool':       { low: 1.50, high: 2.50 },
};

/**
 * Application area multipliers (applied to labor).
 * Attic is baseline; other areas require more labor due to access difficulty.
 */
const APPLICATION_MULTIPLIERS: Record<string, number> = {
  'attic':      1.0,
  'walls':      1.15,
  'crawlspace': 1.10,
  'basement':   1.20,
};

/**
 * R-value target multipliers (applied to material cost).
 * Higher R-values require more material thickness/density.
 */
const RVALUE_MULTIPLIERS: Record<string, number> = {
  'R-13': 0.80,
  'R-19': 0.90,
  'R-30': 1.00,
  'R-38': 1.15,
  'R-49': 1.30,
};

/**
 * Old insulation removal cost per square foot (applied to raw area).
 */
const REMOVAL_RATES: Record<string, { low: number; high: number }> = {
  'none': { low: 0, high: 0 },
  'yes':  { low: 1.00, high: 2.50 },
};

/**
 * Regional labor multipliers. Applied to labor only, not materials.
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
 * Display labels for insulation types.
 */
const INSULATION_LABELS: Record<string, string> = {
  'fiberglass-batt':    'Fiberglass Batt',
  'blown-cellulose':    'Blown-In Cellulose',
  'spray-foam-open':    'Open-Cell Spray Foam',
  'spray-foam-closed':  'Closed-Cell Spray Foam',
  'rigid-board':        'Rigid Board',
  'mineral-wool':       'Mineral Wool',
};

/**
 * R-value achieved description by type and target.
 */
const RVALUE_DESCRIPTIONS: Record<string, string> = {
  'R-13': 'R-13 (walls, mild climate minimum)',
  'R-19': 'R-19 (walls, moderate climate)',
  'R-30': 'R-30 (attic, standard recommendation)',
  'R-38': 'R-38 (attic, cold climate)',
  'R-49': 'R-49 (attic, very cold climate / DOE Zone 5+)',
};

/**
 * Timeline estimates by insulation type.
 */
const TIMELINE_ESTIMATES: Record<string, string> = {
  'fiberglass-batt':    '1–2 days',
  'blown-cellulose':    '1 day (machine-blown)',
  'spray-foam-open':    '1–2 days (cure 24h)',
  'spray-foam-closed':  '1–3 days (cure 24h)',
  'rigid-board':        '2–3 days',
  'mineral-wool':       '1–2 days',
};

/**
 * Insulation cost calculator.
 *
 * materialCost = area × materialRate × rValueMultiplier
 * laborCost = area × laborRate × applicationMultiplier × regionalMultiplier
 * removalCost = area × removalRate
 * total = materialCost + laborCost + removalCost
 *
 * Source: HomeAdvisor / Angi 2025-2026, U.S. DOE.
 */
export function calculateInsulationCost(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const rawArea = Math.max(0, Number(inputs.area) || 0);
  const areaUnit = String(inputs.areaUnit || 'sqft');
  const insulationType = String(inputs.insulationType || 'fiberglass-batt');
  const applicationArea = String(inputs.applicationArea || 'attic');
  const rValueTarget = String(inputs.rValueTarget || 'R-30');
  const removalOption = String(inputs.removalOfOld || 'none');
  const region = String(inputs.region || 'national');

  // ── Convert to square feet ────────────────────────────
  const area = parseFloat((rawArea * (areaToSqFt[areaUnit] ?? 1)).toFixed(2));

  // ── Look up rates ─────────────────────────────────────
  const matRates = MATERIAL_RATES[insulationType] ?? MATERIAL_RATES['fiberglass-batt'];
  const labRates = LABOR_RATES[insulationType] ?? LABOR_RATES['fiberglass-batt'];
  const appMult = APPLICATION_MULTIPLIERS[applicationArea] ?? 1.0;
  const rValMult = RVALUE_MULTIPLIERS[rValueTarget] ?? 1.0;
  const regionMult = REGIONAL_MULTIPLIERS[region] ?? 1.0;
  const removalRate = REMOVAL_RATES[removalOption] ?? REMOVAL_RATES['none'];

  // ── Calculate material cost (area × rate × rValue multiplier) ──
  const materialCostLow = parseFloat((area * matRates.low * rValMult).toFixed(2));
  const materialCostHigh = parseFloat((area * matRates.high * rValMult).toFixed(2));
  const materialCostMid = parseFloat(((materialCostLow + materialCostHigh) / 2).toFixed(2));

  // ── Calculate labor cost (area × rate × app multiplier × regional multiplier) ──
  const laborCostLow = parseFloat((area * labRates.low * appMult * regionMult).toFixed(2));
  const laborCostHigh = parseFloat((area * labRates.high * appMult * regionMult).toFixed(2));
  const laborCostMid = parseFloat(((laborCostLow + laborCostHigh) / 2).toFixed(2));

  // ── Calculate removal cost (area × removal rate) ──────
  const removalCostLow = parseFloat((area * removalRate.low).toFixed(2));
  const removalCostHigh = parseFloat((area * removalRate.high).toFixed(2));
  const removalCostMid = parseFloat(((removalCostLow + removalCostHigh) / 2).toFixed(2));

  // ── Totals ────────────────────────────────────────────
  const totalLow = parseFloat((materialCostLow + laborCostLow + removalCostLow).toFixed(2));
  const totalHigh = parseFloat((materialCostHigh + laborCostHigh + removalCostHigh).toFixed(2));
  const totalMid = parseFloat(((totalLow + totalHigh) / 2).toFixed(2));
  const costPerSqFt = area > 0 ? parseFloat((totalMid / area).toFixed(2)) : 0;

  // ── Insulation comparison (all 6 types, national, attic, R-30, no removal) ──
  const insulationKeys = Object.keys(MATERIAL_RATES);
  const insulationComparison = insulationKeys.map(key => {
    const mr = MATERIAL_RATES[key];
    const lr = LABOR_RATES[key];
    const matMid = area * (mr.low + mr.high) / 2;
    const labMid = area * (lr.low + lr.high) / 2;
    const totalMidComp = matMid + labMid;
    const totalLowComp = mr.low + lr.low;
    const totalHighComp = mr.high + lr.high;
    return {
      label: `${INSULATION_LABELS[key]} ($${totalLowComp.toFixed(2)}–$${totalHighComp.toFixed(2)}/sq ft)`,
      value: parseFloat(totalMidComp.toFixed(2)),
    };
  });

  // ── R-value achieved text ─────────────────────────────
  const rValueAchieved = RVALUE_DESCRIPTIONS[rValueTarget] ?? rValueTarget;

  // ── Timeline ──────────────────────────────────────────
  const timeline = TIMELINE_ESTIMATES[insulationType] ?? '1–3 days';

  return {
    area,
    materialCost: materialCostMid,
    laborCost: laborCostMid,
    removalCost: removalCostMid,
    totalLow,
    totalHigh,
    totalMid,
    costPerSqFt,
    insulationComparison,
    rValueAchieved,
    timeline,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'insulation-cost': calculateInsulationCost,
};
