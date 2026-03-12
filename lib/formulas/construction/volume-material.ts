/**
 * Volume-Material Calculator Formula Module
 * Shared by Mulch Calculator and Gravel Calculator.
 *
 * Volume Formula:
 *   Volume (cu ft) = Length (ft) × Width (ft) × Depth (in) ÷ 12
 *   Volume (cu yd) = Volume (cu ft) ÷ 27
 *
 * Bags:
 *   Bags = Volume (cu ft) ÷ bag volume (cu ft per bag)
 *
 * Weight:
 *   Weight (lbs) = Volume (cu yd) × density (lbs per cu yd)
 *
 * Source: USDA Natural Resources Conservation Service material density tables.
 * Bag sizes from manufacturer specifications (Vigoro, Scotts, Quikrete).
 */

export interface VolumeMaterialInput {
  length: number;
  lengthUnit: string;
  width: number;
  widthUnit: string;
  depth: number;
  depthUnit: string;
  materialType: string;
  coverage: number;           // for irregular areas, override sq ft directly
  bagSize: string;            // cu ft per bag as string
}

export interface VolumeMaterialOutput {
  cubicYards: number;
  cubicFeet: number;
  numberOfBags: number;
  weightTons: number;
  weightLbs: number;
  area: number;
  costEstimate: { label: string; value: number }[];
  volumeBreakdown: { label: string; value: number }[];
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

/**
 * Material densities in lbs per cubic yard.
 * Source: USDA NRCS, landscape supplier industry standards.
 *
 * Mulch materials:
 */
const materialDensity: Record<string, number> = {
  // Mulch types
  'hardwood-mulch': 800,
  'cedar-mulch': 600,
  'pine-bark-mulch': 450,
  'cypress-mulch': 750,
  'rubber-mulch': 1200,
  'straw': 400,
  'compost': 1000,
  'pine-straw': 300,
  // Gravel types
  'pea-gravel': 2700,
  'crushed-stone': 2700,
  'river-rock': 2700,
  'decomposed-granite': 3000,
  'base-gravel': 2800,
  'lava-rock': 1500,
  'marble-chips': 2500,
  'slate-chips': 2600,
};

/**
 * Cost per cubic yard (USD) — low and high estimates.
 * Source: HomeAdvisor / Angi 2025-2026 national averages (delivered bulk).
 */
const costPerYardLow: Record<string, number> = {
  'hardwood-mulch': 25,
  'cedar-mulch': 35,
  'pine-bark-mulch': 25,
  'cypress-mulch': 30,
  'rubber-mulch': 80,
  'straw': 15,
  'compost': 25,
  'pine-straw': 20,
  'pea-gravel': 30,
  'crushed-stone': 25,
  'river-rock': 40,
  'decomposed-granite': 35,
  'base-gravel': 20,
  'lava-rock': 50,
  'marble-chips': 60,
  'slate-chips': 55,
};

const costPerYardHigh: Record<string, number> = {
  'hardwood-mulch': 45,
  'cedar-mulch': 60,
  'pine-bark-mulch': 45,
  'cypress-mulch': 55,
  'rubber-mulch': 160,
  'straw': 30,
  'compost': 50,
  'pine-straw': 40,
  'pea-gravel': 55,
  'crushed-stone': 50,
  'river-rock': 80,
  'decomposed-granite': 60,
  'base-gravel': 40,
  'lava-rock': 100,
  'marble-chips': 120,
  'slate-chips': 100,
};

/**
 * Bag sizes in cubic feet. Common retail bag sizes.
 */
const bagSizeCuFt: Record<string, number> = {
  '0.5': 0.5,
  '1': 1.0,
  '1.5': 1.5,
  '2': 2.0,
  '3': 3.0,
};

/**
 * Volume-material calculator for mulch, gravel, and similar bulk materials.
 *
 * Volume = L × W × (Depth in inches ÷ 12)
 * Cubic Yards = Cubic Feet ÷ 27
 * Bags = ⌈Cubic Feet ÷ bag size⌉
 * Weight = Cubic Yards × density
 *
 * Source: USDA NRCS material density tables, manufacturer bag specifications.
 */
export function calculateVolumeMaterial(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const rawLength = Number(inputs.length) || 0;
  const rawWidth = Number(inputs.width) || 0;
  const rawDepth = Number(inputs.depth) || 0;
  const lengthUnit = String(inputs.lengthUnit || 'ft');
  const widthUnit = String(inputs.widthUnit || 'ft');
  const depthUnit = String(inputs.depthUnit || 'in');
  const materialType = String(inputs.materialType || 'hardwood-mulch');
  const bagSize = String(inputs.bagSize || '2');

  // ── Convert to feet ───────────────────────────────────
  const lengthFt = rawLength * (lengthToFeet[lengthUnit] ?? 1);
  const widthFt = rawWidth * (lengthToFeet[widthUnit] ?? 1);
  const depthIn = rawDepth * (depthToInches[depthUnit] ?? 1);
  const depthFt = depthIn / 12;

  // ── Calculate area ────────────────────────────────────
  const area = lengthFt * widthFt;

  // ── Calculate volume ──────────────────────────────────
  const cubicFeet = area * depthFt;
  const cubicYards = cubicFeet / 27;

  // ── Bag count ─────────────────────────────────────────
  const bagVolume = bagSizeCuFt[bagSize] ?? 2.0;
  const numberOfBags = cubicFeet > 0 ? Math.ceil(cubicFeet / bagVolume) : 0;

  // ── Weight ────────────────────────────────────────────
  const density = materialDensity[materialType] ?? 800;
  const weightLbs = cubicYards * density;
  const weightTons = weightLbs / 2000;

  // ── Cost estimate ─────────────────────────────────────
  const lowRate = costPerYardLow[materialType] ?? 25;
  const highRate = costPerYardHigh[materialType] ?? 50;
  const costLow = cubicYards * lowRate;
  const costHigh = cubicYards * highRate;
  const costMid = (costLow + costHigh) / 2;

  const costEstimate = [
    { label: 'Low Estimate (bulk)', value: parseFloat(costLow.toFixed(2)) },
    { label: 'Mid Estimate (bulk)', value: parseFloat(costMid.toFixed(2)) },
    { label: 'High Estimate (bulk)', value: parseFloat(costHigh.toFixed(2)) },
  ];

  const volumeBreakdown = [
    { label: 'Coverage Area (sq ft)', value: parseFloat(area.toFixed(2)) },
    { label: 'Depth (inches)', value: parseFloat(depthIn.toFixed(2)) },
    { label: 'Volume (cu ft)', value: parseFloat(cubicFeet.toFixed(2)) },
    { label: 'Volume (cu yd)', value: parseFloat(cubicYards.toFixed(2)) },
    { label: 'Weight (lbs)', value: parseFloat(weightLbs.toFixed(0)) },
  ];

  return {
    cubicYards: parseFloat(cubicYards.toFixed(2)),
    cubicFeet: parseFloat(cubicFeet.toFixed(2)),
    numberOfBags,
    weightTons: parseFloat(weightTons.toFixed(2)),
    weightLbs: parseFloat(weightLbs.toFixed(0)),
    area: parseFloat(area.toFixed(2)),
    costEstimate,
    volumeBreakdown,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'volume-material': calculateVolumeMaterial,
};
