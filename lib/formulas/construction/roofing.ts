/**
 * Roofing Calculator Formula Module
 *
 * Calculates roofing materials needed based on roof dimensions and pitch.
 *
 * Roof Area Formula:
 *   Roof Area = Ground Area × Pitch Factor
 *   Pitch Factor = √(rise² + run²) / run
 *   where run = 12 (standard), rise = pitch value (e.g., 4 for 4/12 pitch)
 *
 * Squares:
 *   1 roofing square = 100 sq ft of roof area
 *
 * Bundles:
 *   3-tab shingles: 3 bundles per square
 *   Architectural shingles: 3 bundles per square (heavier)
 *   Metal panels: panels = roof area / panel coverage (typically 28 sq ft per 3×8 panel)
 *
 * Source: National Roofing Contractors Association (NRCA) — Roofing and
 * Waterproofing Manual (6th Edition). Pitch multipliers per NRCA tables.
 */

export interface RoofingInput {
  length: number;
  lengthUnit: string;
  width: number;
  widthUnit: string;
  pitch: number;             // rise per 12 inches run (e.g., 4 = 4/12 pitch)
  roofType: string;          // 'gable' | 'hip' | 'flat'
  material: string;          // '3tab' | 'architectural' | 'metal' | 'tile' | 'wood-shake'
  wastePercent: number;
  layers: number;            // number of existing layers (for tear-off estimate)
}

export interface RoofingOutput {
  roofArea: number;
  groundArea: number;
  pitchFactor: number;
  squares: number;
  bundlesOrPanels: number;
  underlaymentRolls: number;
  ridgeCap: number;
  nailsLbs: number;
  costEstimate: { label: string; value: number }[];
  materialBreakdown: { label: string; value: number }[];
}

const lengthToFeet: Record<string, number> = {
  ft: 1,
  in: 1 / 12,
  m: 3.28084,
  yd: 3,
};

/**
 * NRCA pitch multipliers: sqrt(rise² + 12²) / 12
 * Pre-calculated for common pitches, but the formula works for any value.
 */
function getPitchFactor(rise: number): number {
  const run = 12;
  return Math.sqrt(rise * rise + run * run) / run;
}

/**
 * Bundles per square by material type.
 * Shingles: 3 bundles/square (industry standard).
 * Metal: expressed as panels per square (100 sq ft / panel coverage).
 */
const bundlesPerSquare: Record<string, number> = {
  '3tab': 3,
  'architectural': 3,
  'metal': 3.57,          // ~28 sq ft per panel → 100/28 = 3.57 panels
  'tile': 90,             // ~90 tiles per square (varies by profile)
  'wood-shake': 4,        // 4 bundles per square (heavier, thicker)
};

/**
 * Cost per square (materials only, USD) — low and high estimates.
 * Source: HomeAdvisor / Angi 2025-2026 national averages.
 */
const costPerSquareLow: Record<string, number> = {
  '3tab': 90,
  'architectural': 120,
  'metal': 350,
  'tile': 400,
  'wood-shake': 250,
};

const costPerSquareHigh: Record<string, number> = {
  '3tab': 150,
  'architectural': 200,
  'metal': 600,
  'tile': 700,
  'wood-shake': 450,
};

/**
 * Roofing calculator — squares, bundles, underlayment, and cost estimate.
 *
 * Roof Area = Length × Width × Pitch Factor × Roof Type Multiplier
 *   - Gable: ×1.0 (two rectangular planes)
 *   - Hip: ×1.0 (same total area, different shape)
 *   - Flat: pitch factor = 1.0 (no slope adjustment)
 *
 * Squares = Roof Area ÷ 100
 * Bundles = Squares × bundles per square (by material)
 * Underlayment = Roof Area ÷ 400 sq ft per roll (15 lb felt) — rounded up
 * Ridge cap = (Length + Width) ÷ 25 ft per bundle (hip) or Length ÷ 25 (gable)
 *
 * Source: NRCA Roofing and Waterproofing Manual, 6th Edition
 */
export function calculateRoofing(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const rawLength = Number(inputs.length) || 0;
  const rawWidth = Number(inputs.width) || 0;
  const lengthUnit = String(inputs.lengthUnit || 'ft');
  const widthUnit = String(inputs.widthUnit || 'ft');
  const pitch = Math.max(0, Math.min(24, Number(inputs.pitch) || 4));
  const roofType = String(inputs.roofType || 'gable');
  const material = String(inputs.material || 'architectural');
  const wastePercent = Math.min(30, Math.max(0, Number(inputs.wastePercent) || 0));
  const layers = Math.max(1, Math.round(Number(inputs.layers) || 1));

  // ── Convert to feet ───────────────────────────────────
  const lengthFt = rawLength * (lengthToFeet[lengthUnit] ?? 1);
  const widthFt = rawWidth * (lengthToFeet[widthUnit] ?? 1);

  // ── Calculate ground area ─────────────────────────────
  const groundArea = lengthFt * widthFt;

  // ── Calculate pitch factor ────────────────────────────
  const pitchFactor = roofType === 'flat' ? 1.0 : getPitchFactor(pitch);

  // ── Calculate roof area with waste ────────────────────
  const baseRoofArea = groundArea * pitchFactor;
  const wasteFactor = 1 + wastePercent / 100;
  const totalRoofArea = baseRoofArea * wasteFactor;

  // ── Squares ───────────────────────────────────────────
  const squares = totalRoofArea / 100;

  // ── Bundles or panels ─────────────────────────────────
  const bpsRate = bundlesPerSquare[material] ?? 3;
  const bundlesOrPanels = Math.ceil(squares * bpsRate);

  // ── Underlayment rolls (15 lb felt, 400 sq ft per roll) ──
  const underlaymentRolls = Math.ceil(totalRoofArea / 400);

  // ── Ridge cap bundles ─────────────────────────────────
  let ridgeLinearFt: number;
  if (roofType === 'hip') {
    // Hip roof: ridge + 4 hip ridges ≈ length + 2 × hip length
    const hipLength = Math.sqrt((widthFt / 2) ** 2 + (widthFt / 2) ** 2);
    ridgeLinearFt = lengthFt + 4 * hipLength;
  } else if (roofType === 'flat') {
    ridgeLinearFt = 0;
  } else {
    // Gable: single ridge line
    ridgeLinearFt = lengthFt;
  }
  const ridgeCap = ridgeLinearFt > 0 ? Math.ceil(ridgeLinearFt / 25) : 0;

  // ── Roofing nails (lbs) ───────────────────────────────
  // ~1.5 lbs of nails per square for shingles
  const nailsLbs = Math.ceil(squares * 1.5);

  // ── Cost estimate ─────────────────────────────────────
  const lowRate = costPerSquareLow[material] ?? 120;
  const highRate = costPerSquareHigh[material] ?? 200;
  const costLow = squares * lowRate;
  const costHigh = squares * highRate;
  const costMid = (costLow + costHigh) / 2;

  const costEstimate = [
    { label: 'Low Estimate', value: parseFloat(costLow.toFixed(2)) },
    { label: 'Mid Estimate', value: parseFloat(costMid.toFixed(2)) },
    { label: 'High Estimate', value: parseFloat(costHigh.toFixed(2)) },
  ];

  const materialBreakdown = [
    { label: 'Ground Area (sq ft)', value: parseFloat(groundArea.toFixed(2)) },
    { label: 'Pitch Factor', value: parseFloat(pitchFactor.toFixed(4)) },
    { label: 'Roof Area (sq ft)', value: parseFloat(totalRoofArea.toFixed(2)) },
    { label: 'Squares', value: parseFloat(squares.toFixed(2)) },
    { label: 'Tear-off Layers', value: layers },
  ];

  // ── Warnings ─────────────────────────────────────────
  const warnings: string[] = [];
  if (pitch > 12) {
    warnings.push('Pitch exceeds 12/12 (45°) — verify measurement');
  }

  return {
    roofArea: parseFloat(totalRoofArea.toFixed(2)),
    groundArea: parseFloat(groundArea.toFixed(2)),
    pitchFactor: parseFloat(pitchFactor.toFixed(4)),
    squares: parseFloat(squares.toFixed(2)),
    bundlesOrPanels,
    underlaymentRolls,
    ridgeCap,
    nailsLbs,
    costEstimate,
    materialBreakdown,
    warnings,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'roofing': calculateRoofing,
};
