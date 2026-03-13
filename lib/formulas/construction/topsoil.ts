/**
 * Topsoil Calculator Formula Module
 *
 * Volume Formula:
 *   Volume (cu ft) = Length (ft) x Width (ft) x Depth (in) / 12
 *   Volume (cu yd) = Volume (cu ft) / 27
 *
 * Weight:
 *   Tons = Volume (cu yd) x 1.1  (topsoil ~ 1.1 tons per cubic yard)
 *
 * Bags:
 *   Bags (40 lb) = ceil(Tons x 2000 / 40)
 *
 * Source: USDA Natural Resources Conservation Service — Soil Properties and Management.
 * Topsoil density approximately 2,200 lbs per cubic yard (1.1 tons/cu yd).
 */

export interface TopsoilInput {
  length: number;
  lengthUnit: string;
  width: number;
  widthUnit: string;
  depth: number;
  depthUnit: string;
}

export interface TopsoilOutput {
  cubicYards: number;
  cubicFeet: number;
  tons: number;
  bags40lb: number;
  costEstimate: { label: string; value: number }[];
  coverage: number;
  depthInInches: number;
}

const lengthToFeet: Record<string, number> = {
  ft: 1,
  in: 1 / 12,
  m: 3.28084,
  yd: 3,
};

const depthToInches: Record<string, number> = {
  in: 1,
  ft: 12,
  cm: 0.393701,
};

/** Topsoil density: approximately 1.1 tons per cubic yard */
const TOPSOIL_TONS_PER_CU_YD = 1.1;

/** Weight of a standard retail bag in pounds */
const BAG_WEIGHT_LBS = 40;

/**
 * Topsoil calculator.
 *
 * V(cu ft) = L(ft) x W(ft) x D(in) / 12
 * V(cu yd) = V(cu ft) / 27
 * Tons = V(cu yd) x 1.1
 * Bags(40 lb) = ceil(Tons x 2000 / 40)
 *
 * Source: USDA NRCS soil density reference data.
 */
export function calculateTopsoil(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const rawLength = Number(inputs.length) || 0;
  const rawWidth = Number(inputs.width) || 0;
  const rawDepth = Number(inputs.depth) || 0;
  const lengthUnit = String(inputs.lengthUnit || 'ft');
  const widthUnit = String(inputs.widthUnit || 'ft');
  const depthUnit = String(inputs.depthUnit || 'in');

  // ── Convert to feet / inches ──────────────────────────
  const lengthFt = rawLength * (lengthToFeet[lengthUnit] ?? 1);
  const widthFt = rawWidth * (lengthToFeet[widthUnit] ?? 1);
  const depthIn = rawDepth * (depthToInches[depthUnit] ?? 1);
  const depthFt = depthIn / 12;

  // ── Area ──────────────────────────────────────────────
  const coverage = lengthFt * widthFt;

  // ── Volume ────────────────────────────────────────────
  const cubicFeet = coverage * depthFt;
  const cubicYards = cubicFeet / 27;

  // ── Weight ────────────────────────────────────────────
  const tons = cubicYards * TOPSOIL_TONS_PER_CU_YD;
  const totalLbs = tons * 2000;
  const bags40lb = totalLbs > 0 ? Math.ceil(totalLbs / BAG_WEIGHT_LBS) : 0;

  // ── Cost estimates ────────────────────────────────────
  const costEstimate = [
    { label: 'Bulk Delivery (Low)', value: parseFloat((cubicYards * 20).toFixed(2)) },
    { label: 'Bulk Delivery (Mid)', value: parseFloat((cubicYards * 35).toFixed(2)) },
    { label: 'Bulk Delivery (High)', value: parseFloat((cubicYards * 50).toFixed(2)) },
    { label: 'Bagged (approx)', value: parseFloat((bags40lb * 5).toFixed(2)) },
  ];

  return {
    cubicYards: parseFloat(cubicYards.toFixed(2)),
    cubicFeet: parseFloat(cubicFeet.toFixed(1)),
    tons: parseFloat(tons.toFixed(2)),
    bags40lb,
    costEstimate,
    coverage: parseFloat(coverage.toFixed(2)),
    depthInInches: parseFloat(depthIn.toFixed(2)),
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'topsoil': calculateTopsoil,
};
