export interface ConcreteInput {
  projectType: string;       // 'slab' | 'footing' | 'column' | 'steps'
  length: number;            // Raw numeric value
  lengthUnit: string;        // Unit key (ft, in, m, cm)
  width: number;             // Raw numeric value
  widthUnit: string;         // Unit key (ft, in, m, cm)
  depth: number;             // Raw numeric value
  depthUnit: string;         // Unit key (in, ft, cm)
  quantity: number;          // Number of identical sections
  wastePercent: number;      // Waste percentage (e.g. 10 = 10%)
  bagSize: string;           // '40' | '60' | '80'
}

export interface ConcreteOutput {
  cubicYards: number;
  cubicFeet: number;
  numberOfBags: number;
  preMixCost: { label: string; value: number }[];
  weightTotal: number;
  projectBreakdown: { label: string; value: number }[];
}

/**
 * Unit conversion factors to feet for length/width inputs.
 */
const lengthToFeet: Record<string, number> = {
  ft: 1,
  in: 1 / 12,          // 0.0833333...
  m: 3.28084,
  cm: 0.0328084,
};

/**
 * Unit conversion factors to inches for depth input.
 * Depth is natively in inches, so we convert everything to inches first,
 * then to feet for volume calculation.
 */
const depthToInches: Record<string, number> = {
  in: 1,
  ft: 12,
  cm: 0.393701,
};

/**
 * Bag yields in cubic feet per bag.
 * Source: Portland Cement Association (PCA) and manufacturer labels.
 *
 * - 40 lb bag: ~0.30 cubic feet (≈ 0.011 cubic yards)
 * - 60 lb bag: ~0.45 cubic feet (≈ 0.017 cubic yards)
 * - 80 lb bag: ~0.60 cubic feet (≈ 0.022 cubic yards)
 */
const bagYieldCuFt: Record<string, number> = {
  '40': 0.30,
  '60': 0.45,
  '80': 0.60,
};

/**
 * Typical retail price per bag (USD) for estimating cost range.
 * Low estimate uses big-box store pricing; high estimate adds ~30% for
 * premium brands or smaller retailers.
 */
const bagPriceLow: Record<string, number> = {
  '40': 3.50,
  '60': 4.50,
  '80': 5.50,
};

const bagPriceHigh: Record<string, number> = {
  '40': 5.50,
  '60': 6.50,
  '80': 8.50,
};

/**
 * Concrete volume calculator for slabs, footings, columns, and steps.
 *
 * Volume formulas:
 *   Slab / Footing (rectangular prism):
 *     V = L × W × D
 *
 *   Column / Cylinder:
 *     V = π × r² × h
 *     where r = diameter / 2, h = length (height)
 *
 *   Steps / Stairs (triangular prism approximation):
 *     V = L × W × D / 2
 *     where L = total run, W = width, D = total rise
 *
 * Conversion:
 *   Cubic Yards = Cubic Feet ÷ 27
 *
 * Bag count:
 *   Bags = Cubic Feet ÷ yield per bag (rounded up)
 *
 * Source: Portland Cement Association (PCA) — Design and Control of
 * Concrete Mixtures, and standard geometric volume formulas.
 */
export function calculateConcreteVolume(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const projectType = String(inputs.projectType || 'slab');
  const rawLength = Number(inputs.length) || 0;
  const rawWidth = Number(inputs.width) || 0;
  const rawDepth = Number(inputs.depth) || 0;
  const lengthUnit = String(inputs.lengthUnit || 'ft');
  const widthUnit = String(inputs.widthUnit || 'ft');
  const depthUnit = String(inputs.depthUnit || 'in');
  const quantity = Math.max(1, Math.round(Number(inputs.quantity) || 1));
  const wastePercent = Math.min(30, Math.max(0, Number(inputs.wastePercent) || 0));
  const bagSize = String(inputs.bagSize || '80');

  // ── Convert to feet ───────────────────────────────────
  const lengthFt = rawLength * (lengthToFeet[lengthUnit] ?? 1);
  const widthFt = rawWidth * (lengthToFeet[widthUnit] ?? 1);
  const depthIn = rawDepth * (depthToInches[depthUnit] ?? 1);
  const depthFt = depthIn / 12;

  // ── Calculate volume per section (cubic feet) ─────────
  let volumePerSectionCuFt: number;

  switch (projectType) {
    case 'column': {
      // Cylinder: width = diameter, length = height
      const radiusFt = widthFt / 2;
      const heightFt = lengthFt;
      volumePerSectionCuFt = Math.PI * radiusFt * radiusFt * heightFt;
      break;
    }
    case 'steps': {
      // Triangular prism approximation:
      // width = stair width, length = total run, depth = total rise
      volumePerSectionCuFt = (lengthFt * widthFt * depthFt) / 2;
      break;
    }
    case 'slab':
    case 'footing':
    default: {
      // Rectangular prism: L × W × D
      volumePerSectionCuFt = lengthFt * widthFt * depthFt;
      break;
    }
  }

  // ── Apply quantity ────────────────────────────────────
  const baseVolumeCuFt = volumePerSectionCuFt * quantity;

  // ── Apply waste factor ────────────────────────────────
  const wasteFactor = 1 + wastePercent / 100;
  const totalVolumeCuFt = baseVolumeCuFt * wasteFactor;
  const wasteVolumeCuFt = totalVolumeCuFt - baseVolumeCuFt;

  // ── Convert to cubic yards ────────────────────────────
  const totalVolumeCuYd = totalVolumeCuFt / 27;

  // ── Bag calculation ───────────────────────────────────
  const yieldPerBag = bagYieldCuFt[bagSize] ?? 0.60;
  const numberOfBags = totalVolumeCuFt > 0
    ? Math.ceil(totalVolumeCuFt / yieldPerBag)
    : 0;

  // ── Cost estimate ─────────────────────────────────────
  const bagWeight = parseInt(bagSize, 10) || 80;
  const lowPrice = bagPriceLow[bagSize] ?? 5.50;
  const highPrice = bagPriceHigh[bagSize] ?? 8.50;
  const costLow = numberOfBags * lowPrice;
  const costHigh = numberOfBags * highPrice;
  const costMid = (costLow + costHigh) / 2;

  // ── Weight total ──────────────────────────────────────
  const weightTotal = numberOfBags * bagWeight;

  // ── Build output ──────────────────────────────────────
  const preMixCost = [
    { label: 'Low Estimate', value: parseFloat(costLow.toFixed(2)) },
    { label: 'Mid Estimate', value: parseFloat(costMid.toFixed(2)) },
    { label: 'High Estimate', value: parseFloat(costHigh.toFixed(2)) },
  ];

  const projectBreakdown = [
    { label: 'Base Volume (cu ft)', value: parseFloat(baseVolumeCuFt.toFixed(2)) },
    { label: 'Waste Volume (cu ft)', value: parseFloat(wasteVolumeCuFt.toFixed(2)) },
    { label: 'Total Volume (cu ft)', value: parseFloat(totalVolumeCuFt.toFixed(2)) },
    { label: 'Total Volume (cu yd)', value: parseFloat(totalVolumeCuYd.toFixed(2)) },
  ];

  return {
    cubicYards: parseFloat(totalVolumeCuYd.toFixed(2)),
    cubicFeet: parseFloat(totalVolumeCuFt.toFixed(2)),
    numberOfBags,
    preMixCost,
    weightTotal,
    projectBreakdown,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'concrete-volume': calculateConcreteVolume,
};
