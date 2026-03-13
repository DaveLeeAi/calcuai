/**
 * Asphalt Calculator Formula Module
 *
 * Calculates asphalt tonnage, volume, area, and cost for paving projects
 * (driveways, parking lots, roads, overlays).
 *
 * Volume formula (rectangular prism):
 *   V_ft³ = L_ft × W_ft × (T_in / 12)
 *   Tons  = V_ft³ × 145 × (1 + wasteFactor / 100) / 2000
 *
 * Hot-mix asphalt (HMA) density: ~145 lbs per cubic foot
 * Source: National Asphalt Pavement Association (NAPA) —
 *         *Information Series 128: HMA Pavement Mix Type Selection Guide*
 *         Asphalt Institute — *MS-2 Mix Design Methods*
 */

export interface AsphaltInput {
  length: number;            // Raw numeric value
  lengthUnit: string;        // 'ft' | 'm'
  width: number;             // Raw numeric value
  widthUnit: string;         // 'ft' | 'm'
  thickness: number;         // Raw numeric value
  thicknessUnit: string;     // 'in' | 'cm'
  asphaltType: string;       // 'hot-mix' | 'cold-patch' | 'recycled'
  wasteFactor: number;       // Percentage (e.g. 10 = 10%)
}

export interface AsphaltOutput {
  tons: number;
  cubicYards: number;
  cubicFeet: number;
  squareFeet: number;
  squareYards: number;
  costEstimate: { label: string; value: number }[];
  tonsWithoutWaste: number;
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
 * Density of hot-mix asphalt in lbs per cubic foot.
 * Source: NAPA — typical compacted HMA density range 140–150 lbs/cu ft.
 * 145 lbs/cu ft is the industry-standard planning figure.
 */
const ASPHALT_DENSITY_LBS_PER_CUFT = 145;

/**
 * Pounds per US short ton.
 */
const LBS_PER_TON = 2000;

/**
 * Asphalt calculator.
 *
 * Tons = L_ft × W_ft × (T_in / 12) × 145 × (1 + wasteFactor/100) / 2000
 *
 * Source: National Asphalt Pavement Association (NAPA) and Asphalt Institute.
 */
export function calculateAsphalt(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const rawLength = Number(inputs.length) || 0;
  const rawWidth = Number(inputs.width) || 0;
  const rawThickness = Number(inputs.thickness) || 0;
  const lengthUnit = String(inputs.lengthUnit || 'ft');
  const widthUnit = String(inputs.widthUnit || 'ft');
  const thicknessUnit = String(inputs.thicknessUnit || 'in');
  const asphaltType = String(inputs.asphaltType || 'hot-mix');
  const wasteFactor = Math.min(20, Math.max(5, Number(inputs.wasteFactor) ?? 10));

  // ── Convert to feet / inches ──────────────────────────
  const lengthFt = rawLength * (lengthToFeet[lengthUnit] ?? 1);
  const widthFt = rawWidth * (lengthToFeet[widthUnit] ?? 1);
  const thicknessIn = rawThickness * (thicknessToInches[thicknessUnit] ?? 1);
  const thicknessFt = thicknessIn / 12;

  // ── Calculate area ────────────────────────────────────
  const areaSquareFeet = parseFloat((lengthFt * widthFt).toFixed(2));
  const areaSquareYards = parseFloat((areaSquareFeet / 9).toFixed(2));

  // ── Calculate base volume ─────────────────────────────
  const baseCuFt = lengthFt * widthFt * thicknessFt;
  const baseCuYd = baseCuFt / 27;

  // ── Calculate base tonnage ────────────────────────────
  const baseTons = (baseCuFt * ASPHALT_DENSITY_LBS_PER_CUFT) / LBS_PER_TON;

  // ── Apply waste factor ────────────────────────────────
  const wasteMultiplier = 1 + wasteFactor / 100;
  const totalCuFt = baseCuFt * wasteMultiplier;
  const totalCuYd = baseCuFt * wasteMultiplier / 27;
  const totalTons = baseTons * wasteMultiplier;

  // ── Cost estimates ────────────────────────────────────
  // Material only: $80-$120 per ton (2025-2026 national averages)
  // Installed: $3-$7 per sq ft (includes labor, base prep, compaction)
  const materialLow = parseFloat((totalTons * 80).toFixed(2));
  const materialHigh = parseFloat((totalTons * 120).toFixed(2));
  const installedLow = parseFloat((areaSquareFeet * 3).toFixed(2));
  const installedHigh = parseFloat((areaSquareFeet * 7).toFixed(2));

  const costEstimate = [
    { label: 'Material Only ($80–$120/ton) — Low', value: materialLow },
    { label: 'Material Only ($80–$120/ton) — High', value: materialHigh },
    { label: 'Installed ($3–$7/sq ft) — Low', value: installedLow },
    { label: 'Installed ($3–$7/sq ft) — High', value: installedHigh },
  ];

  return {
    tons: parseFloat(totalTons.toFixed(2)),
    cubicYards: parseFloat(totalCuYd.toFixed(2)),
    cubicFeet: parseFloat(totalCuFt.toFixed(2)),
    squareFeet: areaSquareFeet,
    squareYards: areaSquareYards,
    costEstimate,
    tonsWithoutWaste: parseFloat(baseTons.toFixed(2)),
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'asphalt': calculateAsphalt,
};
