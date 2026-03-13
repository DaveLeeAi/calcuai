/**
 * Concrete Slab Calculator Formula Module
 *
 * Calculates concrete needed for a rectangular slab (patio, driveway,
 * garage floor, sidewalk) in cubic yards, bags, and cost.
 *
 * Volume formula (rectangular prism):
 *   V_ft³ = L_ft × W_ft × (T_in / 12)
 *   V_yd³ = V_ft³ / 27
 *   V_with_waste = V_yd³ × (1 + wasteFactor / 100)
 *
 * Bag counts:
 *   60-lb bag yields ~0.45 cu ft
 *   80-lb bag yields ~0.60 cu ft
 *
 * Rebar estimate (approximate):
 *   Linear feet of #4 rebar at 18" grid spacing ≈ area / 2
 *
 * Source: Portland Cement Association — Design and Control of Concrete Mixtures
 */

export interface ConcreteSlabInput {
  length: number;            // Raw numeric value
  lengthUnit: string;        // 'ft' | 'm'
  width: number;             // Raw numeric value
  widthUnit: string;         // 'ft' | 'm'
  thickness: number;         // Raw numeric value
  thicknessUnit: string;     // 'in' | 'cm'
  wasteFactor: number;       // Percentage (e.g. 10 = 10%)
}

export interface ConcreteSlabOutput {
  cubicYards: number;
  cubicFeet: number;
  cubicMeters: number;
  bags60lb: number;
  bags80lb: number;
  area: number;
  costEstimate: { label: string; value: number }[];
  rebarNeeded: number;
  yardWithoutWaste: number;
}

/**
 * Unit conversion factors to feet for length/width inputs.
 */
const lengthToFeet: Record<string, number> = {
  ft: 1,
  m: 3.28084,
};

/**
 * Unit conversion factors to inches for thickness input.
 */
const thicknessToInches: Record<string, number> = {
  in: 1,
  cm: 0.393701,
};

/**
 * Bag yields in cubic feet per bag.
 * Source: Portland Cement Association (PCA) and manufacturer labels.
 *
 * - 60-lb bag: ~0.45 cubic feet
 * - 80-lb bag: ~0.60 cubic feet
 */
const BAG_YIELD_60 = 0.45;
const BAG_YIELD_80 = 0.60;

/**
 * Cost estimates (USD):
 * - Ready-mix delivery: ~$150 per cubic yard
 * - 60-lb bag: ~$5.50 each
 * - 80-lb bag: ~$6.50 each
 */
const READY_MIX_PER_YARD = 150;
const BAG_60_PRICE = 5.50;
const BAG_80_PRICE = 6.50;

/**
 * Concrete slab calculator.
 *
 * V = L × W × (T / 12) cubic feet
 * Cubic yards = V / 27
 * Apply waste factor: V_total = V × (1 + wasteFactor/100)
 *
 * Source: Portland Cement Association (PCA) — Design and Control of
 * Concrete Mixtures, and standard geometric volume formulas.
 */
export function calculateConcreteSlab(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const rawLength = Number(inputs.length) || 0;
  const rawWidth = Number(inputs.width) || 0;
  const rawThickness = Number(inputs.thickness) || 0;
  const lengthUnit = String(inputs.lengthUnit || 'ft');
  const widthUnit = String(inputs.widthUnit || 'ft');
  const thicknessUnit = String(inputs.thicknessUnit || 'in');
  const wasteFactor = Math.min(25, Math.max(0, Number(inputs.wasteFactor) ?? 10));

  // ── Convert to feet / inches ──────────────────────────
  const lengthFt = rawLength * (lengthToFeet[lengthUnit] ?? 1);
  const widthFt = rawWidth * (lengthToFeet[widthUnit] ?? 1);
  const thicknessIn = rawThickness * (thicknessToInches[thicknessUnit] ?? 1);
  const thicknessFt = thicknessIn / 12;

  // ── Calculate base volume ─────────────────────────────
  const baseCuFt = lengthFt * widthFt * thicknessFt;
  const baseCuYd = baseCuFt / 27;

  // ── Apply waste factor ────────────────────────────────
  const wasteMultiplier = 1 + wasteFactor / 100;
  const totalCuFt = baseCuFt * wasteMultiplier;
  const totalCuYd = baseCuFt * wasteMultiplier / 27;
  const totalCuMeters = totalCuYd * 0.764555;

  // ── Bag counts ────────────────────────────────────────
  const bags60lb = totalCuFt > 0 ? Math.ceil(totalCuFt / BAG_YIELD_60) : 0;
  const bags80lb = totalCuFt > 0 ? Math.ceil(totalCuFt / BAG_YIELD_80) : 0;

  // ── Area ──────────────────────────────────────────────
  const area = parseFloat((lengthFt * widthFt).toFixed(2));

  // ── Cost estimate ─────────────────────────────────────
  const costEstimate = [
    { label: 'Ready-Mix Delivery', value: parseFloat((totalCuYd * READY_MIX_PER_YARD).toFixed(2)) },
    { label: '60-lb Bags', value: parseFloat((bags60lb * BAG_60_PRICE).toFixed(2)) },
    { label: '80-lb Bags', value: parseFloat((bags80lb * BAG_80_PRICE).toFixed(2)) },
  ];

  // ── Rebar estimate ────────────────────────────────────
  // Approximate linear feet of #4 rebar at 18" grid spacing
  const rebarNeeded = parseFloat((area / 2).toFixed(2));

  return {
    cubicYards: parseFloat(totalCuYd.toFixed(2)),
    cubicFeet: parseFloat(totalCuFt.toFixed(2)),
    cubicMeters: parseFloat(totalCuMeters.toFixed(4)),
    bags60lb,
    bags80lb,
    area,
    costEstimate,
    rebarNeeded,
    yardWithoutWaste: parseFloat(baseCuYd.toFixed(2)),
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'concrete-slab': calculateConcreteSlab,
};
