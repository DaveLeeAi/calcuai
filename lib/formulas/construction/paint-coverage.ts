/**
 * Paint Calculator Formula Module
 *
 * Calculates gallons of paint needed for a room or exterior surface.
 *
 * Wall Area Formula:
 *   Total Wall Area = Perimeter × Height
 *   Paintable Area = Total Wall Area - (Doors × 21 sq ft) - (Windows × 15 sq ft)
 *
 * Gallons:
 *   Gallons = (Paintable Area × Coats) ÷ Coverage per gallon
 *
 * Coverage rates (sq ft per gallon):
 *   Flat/Matte: 350-400 → use 350
 *   Eggshell: 350-400 → use 375
 *   Satin: 350-400 → use 375
 *   Semi-Gloss: 300-350 → use 325
 *   Gloss: 300-350 → use 300
 *   Primer: 250-350 → use 300
 *
 * Source: Paint manufacturers (Benjamin Moore, Sherwin-Williams) published
 * coverage specifications. Standard door (3×7 = 21 sq ft) and window
 * (3×5 = 15 sq ft) sizes per residential construction norms.
 */

export interface PaintInput {
  roomLength: number;
  roomLengthUnit: string;
  roomWidth: number;
  roomWidthUnit: string;
  wallHeight: number;
  wallHeightUnit: string;
  doors: number;
  windows: number;
  coats: number;
  paintType: string;        // 'flat' | 'eggshell' | 'satin' | 'semi-gloss' | 'gloss' | 'primer'
  includeCeiling: boolean;
}

export interface PaintOutput {
  gallonsNeeded: number;
  paintableArea: number;
  totalWallArea: number;
  ceilingArea: number;
  openingsArea: number;
  perimeter: number;
  costEstimate: { label: string; value: number }[];
  areaBreakdown: { label: string; value: number }[];
}

const lengthToFeet: Record<string, number> = {
  ft: 1,
  in: 1 / 12,
  m: 3.28084,
};

/** Standard opening sizes (sq ft) per residential construction norms */
const DOOR_AREA = 21;      // 3 ft × 7 ft standard interior door
const WINDOW_AREA = 15;    // 3 ft × 5 ft standard window

/**
 * Coverage in sq ft per gallon by paint finish type.
 * Source: Benjamin Moore and Sherwin-Williams product data sheets.
 */
const coveragePerGallon: Record<string, number> = {
  'flat': 350,
  'eggshell': 375,
  'satin': 375,
  'semi-gloss': 325,
  'gloss': 300,
  'primer': 300,
};

/**
 * Cost per gallon (USD) — low and high estimates.
 * Source: HomeAdvisor / national retailer averages, 2025-2026.
 */
const costPerGallonLow: Record<string, number> = {
  'flat': 25,
  'eggshell': 30,
  'satin': 30,
  'semi-gloss': 32,
  'gloss': 35,
  'primer': 20,
};

const costPerGallonHigh: Record<string, number> = {
  'flat': 50,
  'eggshell': 55,
  'satin': 55,
  'semi-gloss': 60,
  'gloss': 65,
  'primer': 40,
};

/**
 * Paint calculator — gallons, cost, and area breakdown.
 *
 * Perimeter = 2 × (Length + Width)
 * Wall Area = Perimeter × Height
 * Openings = (Doors × 21) + (Windows × 15)
 * Paintable = Wall Area - Openings + (Ceiling if included)
 * Gallons = ⌈(Paintable × Coats) ÷ Coverage⌉
 *
 * Source: Benjamin Moore, Sherwin-Williams coverage specifications.
 */
export function calculatePaintCoverage(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const rawLength = Number(inputs.roomLength) || 0;
  const rawWidth = Number(inputs.roomWidth) || 0;
  const rawHeight = Number(inputs.wallHeight) || 0;
  const lengthUnit = String(inputs.roomLengthUnit || 'ft');
  const widthUnit = String(inputs.roomWidthUnit || 'ft');
  const heightUnit = String(inputs.wallHeightUnit || 'ft');
  const doors = Math.max(0, Math.round(Number(inputs.doors) || 0));
  const windows = Math.max(0, Math.round(Number(inputs.windows) || 0));
  const coats = Math.max(1, Math.round(Number(inputs.coats) || 2));
  const paintType = String(inputs.paintType || 'eggshell');
  const includeCeiling = inputs.includeCeiling === true || inputs.includeCeiling === 'true';

  // ── Convert to feet ───────────────────────────────────
  const lengthFt = rawLength * (lengthToFeet[lengthUnit] ?? 1);
  const widthFt = rawWidth * (lengthToFeet[widthUnit] ?? 1);
  const heightFt = rawHeight * (lengthToFeet[heightUnit] ?? 1);

  // ── Calculate areas ───────────────────────────────────
  const perimeter = 2 * (lengthFt + widthFt);
  const totalWallArea = perimeter * heightFt;
  const openingsArea = (doors * DOOR_AREA) + (windows * WINDOW_AREA);
  const netWallArea = Math.max(0, totalWallArea - openingsArea);

  const ceilingArea = includeCeiling ? lengthFt * widthFt : 0;
  const paintableArea = netWallArea + ceilingArea;

  // ── Gallons calculation ───────────────────────────────
  const coverage = coveragePerGallon[paintType] ?? 350;
  const totalCoverage = paintableArea * coats;
  const gallonsExact = totalCoverage / coverage;
  const gallonsNeeded = gallonsExact > 0 ? Math.ceil(gallonsExact) : 0;

  // ── Cost estimate ─────────────────────────────────────
  const lowPrice = costPerGallonLow[paintType] ?? 30;
  const highPrice = costPerGallonHigh[paintType] ?? 55;
  const costLow = gallonsNeeded * lowPrice;
  const costHigh = gallonsNeeded * highPrice;
  const costMid = (costLow + costHigh) / 2;

  const costEstimate = [
    { label: 'Low Estimate', value: parseFloat(costLow.toFixed(2)) },
    { label: 'Mid Estimate', value: parseFloat(costMid.toFixed(2)) },
    { label: 'High Estimate', value: parseFloat(costHigh.toFixed(2)) },
  ];

  const areaBreakdown = [
    { label: 'Perimeter (ft)', value: parseFloat(perimeter.toFixed(2)) },
    { label: 'Gross Wall Area (sq ft)', value: parseFloat(totalWallArea.toFixed(2)) },
    { label: 'Openings Deducted (sq ft)', value: parseFloat(openingsArea.toFixed(2)) },
    { label: 'Net Wall Area (sq ft)', value: parseFloat(netWallArea.toFixed(2)) },
    { label: 'Ceiling Area (sq ft)', value: parseFloat(ceilingArea.toFixed(2)) },
    { label: 'Total Paintable (sq ft)', value: parseFloat(paintableArea.toFixed(2)) },
  ];

  return {
    gallonsNeeded,
    paintableArea: parseFloat(paintableArea.toFixed(2)),
    totalWallArea: parseFloat(totalWallArea.toFixed(2)),
    ceilingArea: parseFloat(ceilingArea.toFixed(2)),
    openingsArea: parseFloat(openingsArea.toFixed(2)),
    perimeter: parseFloat(perimeter.toFixed(2)),
    costEstimate,
    areaBreakdown,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'paint-coverage': calculatePaintCoverage,
};
