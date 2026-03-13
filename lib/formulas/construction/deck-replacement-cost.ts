/**
 * Deck Replacement Cost Calculator Formula Module
 *
 * Estimates deck tear-off and replacement costs across five decking
 * materials: pressure-treated, cedar, composite, PVC, and tropical hardwood.
 * Includes demolition, substructure work, railing, stairs, and regional labor.
 *
 * Cost formula:
 *   demolitionCost = area × $5
 *   deckingMaterialCost = area × materialRate
 *   deckingLaborCost = area × laborRate × regionalMultiplier
 *   substructureCost = area × substructureRate
 *   railingCost = railingLength × railingRate
 *   stairCost = stairCount × stairRate
 *   totalLow = sum of all low components
 *   totalHigh = sum of all high components
 *   totalMid = (totalLow + totalHigh) / 2
 *
 * Source: HomeAdvisor / Angi 2025-2026 national averages,
 *         North American Deck and Railing Association (NADRA)
 */

export interface DeckReplacementCostInput {
  deckLength: number;
  deckLengthUnit: string;       // 'ft' | 'm'
  deckWidth: number;
  deckWidthUnit: string;        // 'ft' | 'm'
  deckingMaterial: string;      // 'pressure-treated' | 'cedar' | 'composite' | 'pvc' | 'tropical-hardwood'
  substructureWork: string;     // 'none-boards-only' | 'partial-repair' | 'full-replacement'
  railingLength: number;
  railingType: string;          // 'wood' | 'composite' | 'metal' | 'cable'
  stairCount: number;
  region: string;               // 'national' | 'northeast' | 'west-coast' | 'mid-atlantic' | 'midwest' | 'south' | 'mountain-west'
}

export interface DeckReplacementCostOutput {
  area: number;
  demolitionCost: number;
  deckingMaterialCost: number;
  deckingLaborCost: number;
  substructureCost: number;
  railingCost: number;
  stairCost: number;
  totalLow: number;
  totalHigh: number;
  totalMid: number;
  costPerSqFt: number;
  materialComparison: { label: string; value: number }[];
  timeline: string;
}

/**
 * Unit conversion factors to feet.
 */
const lengthToFeet: Record<string, number> = {
  ft: 1,
  m: 3.28084,
};

/**
 * Regional labor multipliers.
 * Applied to labor costs only, not materials.
 */
const REGIONAL_MULTIPLIERS: Record<string, number> = {
  'national': 1.0,
  'northeast': 1.20,
  'west-coast': 1.25,
  'mid-atlantic': 1.15,
  'midwest': 0.90,
  'south': 0.85,
  'mountain-west': 0.95,
};

/**
 * Decking material cost per square foot (material portion only, ~45% of installed).
 * Source: HomeAdvisor / Angi 2025-2026.
 */
const DECKING_MATERIAL_RATES: Record<string, { low: number; high: number }> = {
  'pressure-treated':  { low: 6.75,  high: 11.25 },
  'cedar':             { low: 9,     high: 15.75 },
  'composite':         { low: 11.25, high: 20.25 },
  'pvc':               { low: 13.50, high: 22.50 },
  'tropical-hardwood': { low: 15.75, high: 27 },
};

/**
 * Decking labor cost per square foot (~55% of installed).
 * Source: HomeAdvisor / Angi 2025-2026.
 */
const DECKING_LABOR_RATES: Record<string, { low: number; high: number }> = {
  'pressure-treated':  { low: 8.25,  high: 13.75 },
  'cedar':             { low: 11,    high: 19.25 },
  'composite':         { low: 13.75, high: 24.75 },
  'pvc':               { low: 16.50, high: 27.50 },
  'tropical-hardwood': { low: 19.25, high: 33 },
};

/**
 * Substructure work cost per square foot.
 */
const SUBSTRUCTURE_RATES: Record<string, { low: number; high: number }> = {
  'none-boards-only':  { low: 0,  high: 0 },
  'partial-repair':    { low: 5,  high: 10 },
  'full-replacement':  { low: 15, high: 25 },
};

/**
 * Railing cost per linear foot (installed).
 */
const RAILING_RATES: Record<string, { low: number; high: number }> = {
  'wood':      { low: 20, high: 40 },
  'composite': { low: 35, high: 60 },
  'metal':     { low: 50, high: 80 },
  'cable':     { low: 60, high: 100 },
};

/**
 * Stair cost per tread (installed).
 */
const STAIR_RATE = { low: 250, high: 450 };

/**
 * Demolition rate per square foot (flat rate for demo + haul-away).
 */
const DEMOLITION_RATE = 5;

/**
 * Material display labels for comparison output.
 */
const MATERIAL_LABELS: Record<string, string> = {
  'pressure-treated':  'Pressure-Treated',
  'cedar':             'Cedar',
  'composite':         'Composite',
  'pvc':               'PVC',
  'tropical-hardwood': 'Tropical Hardwood',
};

/**
 * Timeline estimates per material.
 */
const TIMELINE_ESTIMATES: Record<string, string> = {
  'pressure-treated':  '3–5 days (demo 1 day, build 2–4 days)',
  'cedar':             '3–5 days (demo 1 day, build 2–4 days)',
  'composite':         '4–7 days (demo 1 day, build 3–6 days)',
  'pvc':               '4–7 days (demo 1 day, build 3–6 days)',
  'tropical-hardwood': '5–10 days (demo 1 day, build 4–9 days — pre-drilling required)',
};

/**
 * Deck replacement cost calculator.
 *
 * totalLow = demolitionCost + materialCostLow + laborCostLow×region + substructureLow + railingLow + stairLow
 * totalHigh = demolitionCost + materialCostHigh + laborCostHigh×region + substructureHigh + railingHigh + stairHigh
 * totalMid = (totalLow + totalHigh) / 2
 *
 * Source: HomeAdvisor / Angi 2025-2026, NADRA.
 */
export function calculateDeckReplacementCost(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const rawLength = Number(inputs.deckLength) || 0;
  const rawWidth = Number(inputs.deckWidth) || 0;
  const lengthUnit = String(inputs.deckLengthUnit || 'ft');
  const widthUnit = String(inputs.deckWidthUnit || 'ft');
  const deckingMaterial = String(inputs.deckingMaterial || 'pressure-treated');
  const substructureWork = String(inputs.substructureWork || 'none-boards-only');
  const railingLength = Math.max(0, Number(inputs.railingLength) || 0);
  const railingType = String(inputs.railingType || 'wood');
  const stairCount = Math.max(0, Math.floor(Number(inputs.stairCount) || 0));
  const region = String(inputs.region || 'national');

  // ── Convert to feet ───────────────────────────────────
  const lengthFt = rawLength * (lengthToFeet[lengthUnit] ?? 1);
  const widthFt = rawWidth * (lengthToFeet[widthUnit] ?? 1);

  // ── Calculate area ────────────────────────────────────
  const area = parseFloat((lengthFt * widthFt).toFixed(2));

  // ── Look up rates ─────────────────────────────────────
  const materialRates = DECKING_MATERIAL_RATES[deckingMaterial] ?? DECKING_MATERIAL_RATES['pressure-treated'];
  const laborRates = DECKING_LABOR_RATES[deckingMaterial] ?? DECKING_LABOR_RATES['pressure-treated'];
  const subRates = SUBSTRUCTURE_RATES[substructureWork] ?? SUBSTRUCTURE_RATES['none-boards-only'];
  const railRates = RAILING_RATES[railingType] ?? RAILING_RATES['wood'];
  const regionalMultiplier = REGIONAL_MULTIPLIERS[region] ?? 1.0;

  // ── Calculate cost components ─────────────────────────
  const demolitionCost = parseFloat((area * DEMOLITION_RATE).toFixed(2));

  const deckingMaterialCostLow = parseFloat((area * materialRates.low).toFixed(2));
  const deckingMaterialCostHigh = parseFloat((area * materialRates.high).toFixed(2));

  const deckingLaborCostLow = parseFloat((area * laborRates.low * regionalMultiplier).toFixed(2));
  const deckingLaborCostHigh = parseFloat((area * laborRates.high * regionalMultiplier).toFixed(2));

  const substructureCostLow = parseFloat((area * subRates.low).toFixed(2));
  const substructureCostHigh = parseFloat((area * subRates.high).toFixed(2));

  const railingCostLow = parseFloat((railingLength * railRates.low).toFixed(2));
  const railingCostHigh = parseFloat((railingLength * railRates.high).toFixed(2));

  const stairCostLow = parseFloat((stairCount * STAIR_RATE.low).toFixed(2));
  const stairCostHigh = parseFloat((stairCount * STAIR_RATE.high).toFixed(2));

  // ── Totals ────────────────────────────────────────────
  const totalLow = parseFloat((demolitionCost + deckingMaterialCostLow + deckingLaborCostLow + substructureCostLow + railingCostLow + stairCostLow).toFixed(2));
  const totalHigh = parseFloat((demolitionCost + deckingMaterialCostHigh + deckingLaborCostHigh + substructureCostHigh + railingCostHigh + stairCostHigh).toFixed(2));
  const totalMid = parseFloat(((totalLow + totalHigh) / 2).toFixed(2));
  const costPerSqFt = area > 0 ? parseFloat((totalMid / area).toFixed(2)) : 0;

  // ── Mid-point outputs for display ─────────────────────
  const deckingMaterialCost = parseFloat(((deckingMaterialCostLow + deckingMaterialCostHigh) / 2).toFixed(2));
  const deckingLaborCost = parseFloat(((deckingLaborCostLow + deckingLaborCostHigh) / 2).toFixed(2));
  const substructureCost = parseFloat(((substructureCostLow + substructureCostHigh) / 2).toFixed(2));
  const railingCost = parseFloat(((railingCostLow + railingCostHigh) / 2).toFixed(2));
  const stairCost = parseFloat(((stairCostLow + stairCostHigh) / 2).toFixed(2));

  // ── Material comparison (all at national, no sub/railing/stairs) ──
  const materialKeys = Object.keys(DECKING_MATERIAL_RATES);
  const materialComparison = materialKeys.map(key => {
    const mRates = DECKING_MATERIAL_RATES[key];
    const lRates = DECKING_LABOR_RATES[key];
    const midMat = area * (mRates.low + mRates.high) / 2;
    const midLab = area * (lRates.low + lRates.high) / 2;
    const midTotal = midMat + midLab + demolitionCost;
    const installedLow = mRates.low + lRates.low;
    const installedHigh = mRates.high + lRates.high;
    return {
      label: `${MATERIAL_LABELS[key]} ($${installedLow}–$${installedHigh}/sq ft)`,
      value: parseFloat(midTotal.toFixed(2)),
    };
  });

  // ── Timeline ──────────────────────────────────────────
  const timeline = TIMELINE_ESTIMATES[deckingMaterial] ?? '3–7 days';

  return {
    area,
    demolitionCost,
    deckingMaterialCost,
    deckingLaborCost,
    substructureCost,
    railingCost,
    stairCost,
    totalLow,
    totalHigh,
    totalMid,
    costPerSqFt,
    materialComparison,
    timeline,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'deck-replacement-cost': calculateDeckReplacementCost,
};
