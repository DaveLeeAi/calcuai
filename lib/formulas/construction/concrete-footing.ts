/**
 * Concrete Footing Calculator Formula Module
 *
 * Calculates concrete needed for footings: rectangular pad footings,
 * continuous/strip footings, and round pier footings.
 *
 * Volume formulas:
 *
 *   Rectangular:
 *     V = L_ft × W_ft × D_ft × quantity
 *
 *   Continuous (strip):
 *     V = L_ft × (W_in / 12) × (D_in / 12)
 *
 *   Round (pier):
 *     V = π × (diameter_in / 24)² × (D_in / 12) × quantity
 *
 *   All: V_yd³ = V_ft³ / 27, then apply waste factor
 *
 * Bag counts:
 *   60-lb bag yields ~0.45 cu ft
 *   80-lb bag yields ~0.60 cu ft
 *
 * Source: International Residential Code (IRC) Section R403, ACI 318
 */

export interface ConcreteFootingInput {
  footingType: string;       // 'rectangular' | 'continuous' | 'round'
  length: number;            // Raw numeric value
  lengthUnit: string;        // 'ft' | 'm'
  width: number;             // Raw numeric value
  widthUnit: string;         // 'ft' | 'in' | 'm'
  depth: number;             // Raw numeric value
  depthUnit: string;         // 'in' | 'cm'
  diameter: number;          // Raw numeric value (for round footings)
  diameterUnit: string;      // 'in' | 'cm'
  quantity: number;           // Number of footings
  wasteFactor: number;       // Percentage (e.g. 10 = 10%)
}

export interface ConcreteFootingOutput {
  cubicYards: number;
  cubicFeet: number;
  bags80lb: number;
  bags60lb: number;
  volumePerFooting: number;
  costEstimate: { label: string; value: number }[];
  yardWithoutWaste: number;
}

/**
 * Unit conversion factors to feet for length inputs.
 */
const lengthToFeet: Record<string, number> = {
  ft: 1,
  in: 1 / 12,
  m: 3.28084,
};

/**
 * Unit conversion factors to inches for depth/diameter inputs.
 */
const toInches: Record<string, number> = {
  in: 1,
  cm: 0.393701,
  ft: 12,
};

/**
 * Bag yields in cubic feet per bag.
 */
const BAG_YIELD_60 = 0.45;
const BAG_YIELD_80 = 0.60;

/**
 * Cost estimates (USD).
 */
const READY_MIX_PER_YARD = 150;
const BAG_60_PRICE = 5.50;
const BAG_80_PRICE = 6.50;

/**
 * Concrete footing calculator — rectangular, continuous, and round footings.
 *
 * Rectangular:  V = L × W × D (all in feet) × quantity / 27
 * Continuous:   V = L × W × D / 27  (width in inches converted)
 * Round:        V = π × (d/2)² × D × quantity / 27 (diameter in inches converted)
 *
 * Source: International Residential Code (IRC) R403, ACI 318.
 */
export function calculateConcreteFooting(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const footingType = String(inputs.footingType || 'continuous');
  const rawLength = Number(inputs.length) || 0;
  const rawWidth = Number(inputs.width) || 0;
  const rawDepth = Number(inputs.depth) || 0;
  const rawDiameter = Number(inputs.diameter) || 0;
  const lengthUnit = String(inputs.lengthUnit || 'ft');
  const widthUnit = String(inputs.widthUnit || 'in');
  const depthUnit = String(inputs.depthUnit || 'in');
  const diameterUnit = String(inputs.diameterUnit || 'in');
  const quantity = Math.max(1, Math.round(Number(inputs.quantity) || 1));
  const wasteFactor = Math.min(25, Math.max(0, Number(inputs.wasteFactor) ?? 10));

  // ── Convert to feet ───────────────────────────────────
  const lengthFt = rawLength * (lengthToFeet[lengthUnit] ?? 1);
  const widthFt = rawWidth * (lengthToFeet[widthUnit] ?? (1 / 12));
  const depthIn = rawDepth * (toInches[depthUnit] ?? 1);
  const depthFt = depthIn / 12;
  const diameterIn = rawDiameter * (toInches[diameterUnit] ?? 1);
  const diameterFt = diameterIn / 12;

  // ── Calculate volume per footing (cubic feet) ─────────
  let volumePerFootingCuFt: number;

  switch (footingType) {
    case 'round': {
      // Cylinder: V = π × r² × h
      const radiusFt = diameterFt / 2;
      volumePerFootingCuFt = Math.PI * radiusFt * radiusFt * depthFt;
      break;
    }
    case 'rectangular': {
      // Rectangular pad: V = L × W × D
      volumePerFootingCuFt = lengthFt * widthFt * depthFt;
      break;
    }
    case 'continuous':
    default: {
      // Continuous/strip: V = L × W × D (single long footing)
      volumePerFootingCuFt = lengthFt * widthFt * depthFt;
      break;
    }
  }

  // ── Apply quantity ────────────────────────────────────
  // For continuous footings, quantity is typically 1 (the length IS the whole run)
  // For rectangular and round, quantity multiplies
  const totalFootings = (footingType === 'continuous') ? 1 : quantity;
  const baseVolumeCuFt = volumePerFootingCuFt * totalFootings;

  // ── Apply waste factor ────────────────────────────────
  const wasteMultiplier = 1 + wasteFactor / 100;
  const totalCuFt = baseVolumeCuFt * wasteMultiplier;
  const totalCuYd = totalCuFt / 27;
  const baseCuYd = baseVolumeCuFt / 27;

  // ── Bag counts ────────────────────────────────────────
  const bags60lb = totalCuFt > 0 ? Math.ceil(totalCuFt / BAG_YIELD_60) : 0;
  const bags80lb = totalCuFt > 0 ? Math.ceil(totalCuFt / BAG_YIELD_80) : 0;

  // ── Volume per footing (for display when quantity > 1) ─
  const volPerFootingCuYd = parseFloat((volumePerFootingCuFt / 27).toFixed(4));

  // ── Cost estimate ─────────────────────────────────────
  const costEstimate = [
    { label: 'Ready-Mix Delivery', value: parseFloat((totalCuYd * READY_MIX_PER_YARD).toFixed(2)) },
    { label: '60-lb Bags', value: parseFloat((bags60lb * BAG_60_PRICE).toFixed(2)) },
    { label: '80-lb Bags', value: parseFloat((bags80lb * BAG_80_PRICE).toFixed(2)) },
  ];

  return {
    cubicYards: parseFloat(totalCuYd.toFixed(2)),
    cubicFeet: parseFloat(totalCuFt.toFixed(2)),
    bags80lb,
    bags60lb,
    volumePerFooting: volPerFootingCuYd,
    costEstimate,
    yardWithoutWaste: parseFloat(baseCuYd.toFixed(2)),
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'concrete-footing': calculateConcreteFooting,
};
