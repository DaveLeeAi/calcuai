/**
 * Cubic Yard Calculator Formula Module
 *
 * A universal volume-to-cubic-yards converter supporting rectangular,
 * circular, and triangular shapes.
 *
 * Rectangular: V = L x W x D(ft) / 27
 * Circular:    V = pi x (diameter/2)^2 x D(ft) / 27
 * Triangular:  V = 0.5 x L x W x D(ft) / 27
 *
 * Outputs volume in cubic yards, cubic feet, cubic meters, and cubic inches.
 * Includes weight estimates for common construction materials and
 * load counts for wheelbarrows, pickup trucks, and dump trucks.
 *
 * Source: Standard geometric volume formulas; material weight densities
 * from USDA NRCS and Portland Cement Association (PCA).
 */

export interface CubicYardInput {
  shape: string;                // 'rectangular' | 'circular' | 'triangular'
  length: number;
  lengthUnit: string;           // 'ft' | 'm'
  width: number;
  widthUnit: string;            // 'ft' | 'm'
  depth: number;
  depthUnit: string;            // 'in' | 'ft' | 'cm'
  diameter: number;
  diameterUnit: string;         // 'ft' | 'm'
}

export interface CubicYardOutput {
  cubicYards: number;
  cubicFeet: number;
  cubicMeters: number;
  cubicInches: number;
  area: number;
  weightEstimate: { label: string; value: number }[];
  loads: { label: string; value: number }[];
}

const lengthToFeet: Record<string, number> = {
  ft: 1,
  m: 3.28084,
};

const depthToFeet: Record<string, number> = {
  in: 1 / 12,
  ft: 1,
  cm: 0.0328084,
};

/**
 * Cubic yard calculator — universal volume converter for construction projects.
 *
 * Rectangular: V(cu ft) = Length(ft) x Width(ft) x Depth(ft)
 * Circular:    V(cu ft) = pi x (Diameter(ft)/2)^2 x Depth(ft)
 * Triangular:  V(cu ft) = 0.5 x Length(ft) x Width(ft) x Depth(ft)
 *
 * Cubic Yards = Cubic Feet / 27
 * Cubic Meters = Cubic Yards x 0.764555
 * Cubic Inches = Cubic Feet x 1728
 *
 * Source: Standard geometry; material densities from PCA and USDA NRCS.
 */
export function calculateCubicYard(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const shape = String(inputs.shape || 'rectangular');
  const rawLength = Number(inputs.length) || 0;
  const lengthUnit = String(inputs.lengthUnit || 'ft');
  const rawWidth = Number(inputs.width) || 0;
  const widthUnit = String(inputs.widthUnit || 'ft');
  const rawDepth = Number(inputs.depth) || 0;
  const depthUnit = String(inputs.depthUnit || 'in');
  const rawDiameter = Number(inputs.diameter) || 0;
  const diameterUnit = String(inputs.diameterUnit || 'ft');

  // ── Convert to feet ───────────────────────────────────
  const lengthFt = rawLength * (lengthToFeet[lengthUnit] ?? 1);
  const widthFt = rawWidth * (lengthToFeet[widthUnit] ?? 1);
  const depthFt = rawDepth * (depthToFeet[depthUnit] ?? (1 / 12));
  const diameterFt = rawDiameter * (lengthToFeet[diameterUnit] ?? 1);

  // ── Calculate area and volume ─────────────────────────
  let areaSqFt: number;
  let cubicFeet: number;

  switch (shape) {
    case 'circular': {
      const radiusFt = diameterFt / 2;
      areaSqFt = Math.PI * radiusFt * radiusFt;
      cubicFeet = areaSqFt * depthFt;
      break;
    }
    case 'triangular': {
      areaSqFt = 0.5 * lengthFt * widthFt;
      cubicFeet = areaSqFt * depthFt;
      break;
    }
    case 'rectangular':
    default: {
      areaSqFt = lengthFt * widthFt;
      cubicFeet = areaSqFt * depthFt;
      break;
    }
  }

  // ── Edge case: zero or negative volume ────────────────
  if (cubicFeet <= 0) {
    return {
      cubicYards: 0,
      cubicFeet: 0,
      cubicMeters: 0,
      cubicInches: 0,
      area: 0,
      weightEstimate: [
        { label: 'Concrete (~150 lb/cu ft)', value: 0 },
        { label: 'Gravel (~100 lb/cu ft)', value: 0 },
        { label: 'Topsoil (~75 lb/cu ft)', value: 0 },
        { label: 'Mulch (~45 lb/cu ft)', value: 0 },
        { label: 'Sand (~100 lb/cu ft)', value: 0 },
      ],
      loads: [
        { label: 'Wheelbarrow (3 cu ft)', value: 0 },
        { label: 'Pickup Truck (~1.5 cu yd)', value: 0 },
        { label: 'Dump Truck (~10 cu yd)', value: 0 },
      ],
    };
  }

  // ── Unit conversions ──────────────────────────────────
  const cubicYards = cubicFeet / 27;
  const cubicMeters = cubicYards * 0.764555;
  const cubicInches = cubicFeet * 1728;

  // ── Weight estimates by material ──────────────────────
  // Densities in lbs per cubic foot (industry standard averages)
  const concreteLbs = cubicFeet * 150;
  const gravelLbs = cubicFeet * 100;
  const topsoilLbs = cubicFeet * 75;
  const mulchLbs = cubicFeet * 45;
  const sandLbs = cubicFeet * 100;

  const weightEstimate = [
    { label: 'Concrete (~150 lb/cu ft)', value: parseFloat(concreteLbs.toFixed(0)) },
    { label: 'Gravel (~100 lb/cu ft)', value: parseFloat(gravelLbs.toFixed(0)) },
    { label: 'Topsoil (~75 lb/cu ft)', value: parseFloat(topsoilLbs.toFixed(0)) },
    { label: 'Mulch (~45 lb/cu ft)', value: parseFloat(mulchLbs.toFixed(0)) },
    { label: 'Sand (~100 lb/cu ft)', value: parseFloat(sandLbs.toFixed(0)) },
  ];

  // ── Load counts ───────────────────────────────────────
  const loads = [
    { label: 'Wheelbarrow (3 cu ft)', value: Math.ceil(cubicFeet / 3) },
    { label: 'Pickup Truck (~1.5 cu yd)', value: Math.ceil(cubicYards / 1.5) },
    { label: 'Dump Truck (~10 cu yd)', value: Math.ceil(cubicYards / 10) },
  ];

  return {
    cubicYards: parseFloat(cubicYards.toFixed(2)),
    cubicFeet: parseFloat(cubicFeet.toFixed(2)),
    cubicMeters: parseFloat(cubicMeters.toFixed(4)),
    cubicInches: parseFloat(cubicInches.toFixed(0)),
    area: parseFloat(areaSqFt.toFixed(2)),
    weightEstimate,
    loads,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'cubic-yard': calculateCubicYard,
};
