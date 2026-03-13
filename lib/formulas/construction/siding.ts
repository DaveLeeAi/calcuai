/**
 * Siding Calculator Formula Module
 *
 * Calculates siding materials needed for exterior walls, accounting for
 * windows, doors, gable areas, and waste.
 *
 * Gross Wall Area:
 *   grossArea = wallLength × wallHeight + gableArea
 *
 * Opening Deductions:
 *   openings = (windows × windowArea) + (doors × doorArea)
 *
 * Net Area:
 *   netArea = max(0, grossArea - openings)
 *
 * Area with Waste:
 *   areaWithWaste = netArea × (1 + wasteFactor / 100)
 *
 * Squares:
 *   squares = areaWithWaste / 100  (1 "square" = 100 sq ft, siding industry unit)
 *
 * Material-specific units:
 *   vinyl panels ≈ 16.8 sq ft per panel (12.5' × 8" double 4" exposure, 2 courses)
 *   fiber-cement planks ≈ 5.33 sq ft per plank (12' × 8.25" exposure)
 *
 * J-Channel (vinyl):
 *   jChannel = (windows × 3 + doors × 2) × 12.5 linear feet
 *
 * Starter Strip:
 *   starterStrip = wallLength linear feet
 *
 * Source: Vinyl Siding Institute (VSI) installation manual,
 * James Hardie HardiePlank installation guide,
 * US Census Bureau — Characteristics of New Housing (siding market data).
 */

export interface SidingInput {
  wallLength: number;
  wallLengthUnit: string;
  wallHeight: number;
  wallHeightUnit: string;
  gableArea: number;          // sq ft
  windows: number;
  windowArea: number;         // sq ft per window
  doors: number;
  doorArea: number;           // sq ft per door
  sidingType: string;         // 'vinyl' | 'fiber-cement' | 'wood' | 'engineered-wood' | 'metal'
  wasteFactor: number;        // percentage (e.g. 10 = 10%)
}

export interface SidingOutput {
  netArea: number;
  grossArea: number;
  areaWithWaste: number;
  squares: number;
  panelsOrPlanks: number;
  jChannel: number;           // linear feet
  starterStrip: number;       // linear feet
  openingDeductions: number;
  costEstimate: { label: string; value: number }[];
}

const lengthToFeet: Record<string, number> = {
  ft: 1,
  in: 1 / 12,
  m: 3.28084,
  yd: 3,
};

/**
 * Coverage per unit by siding type (sq ft per panel/plank).
 * Vinyl: standard double-4 panel 12.5' × 8" exposure × 2 courses = ~16.8 sq ft
 * Fiber-cement: HardiePlank 12' × 8.25" exposure = ~8.25 sq ft (but lap overlap reduces to ~5.33)
 * Others use a generic factor of 8 sq ft per unit.
 *
 * Source: Vinyl Siding Institute, James Hardie technical data sheets.
 */
const coveragePerUnit: Record<string, number> = {
  'vinyl': 16.8,
  'fiber-cement': 5.33,
  'wood': 8.0,
  'engineered-wood': 8.0,
  'metal': 16.0,
};

/**
 * Installed cost per sq ft [low, high] by siding type (USD).
 * Includes materials + labor.
 * Source: HomeAdvisor / Angi 2025-2026 national averages.
 */
const costPerSqFt: Record<string, [number, number]> = {
  'vinyl': [3, 7],
  'fiber-cement': [5, 13],
  'wood': [6, 12],
  'engineered-wood': [4, 9],
  'metal': [7, 15],
};

/**
 * Siding calculator — squares, panels/planks, J-channel, starter strip, and cost.
 *
 * Gross Area = wallLength × wallHeight + gableArea
 * Net Area = Gross - (windows × windowArea) - (doors × doorArea)
 * With Waste = Net × (1 + waste%)
 * Squares = With Waste / 100
 * Panels/Planks = ⌈With Waste / coveragePerUnit⌉
 *
 * Source: VSI, James Hardie, US Census Bureau.
 */
export function calculateSiding(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const rawLength = Number(inputs.wallLength) || 0;
  const rawHeight = Number(inputs.wallHeight) || 0;
  const lengthUnit = String(inputs.wallLengthUnit || 'ft');
  const heightUnit = String(inputs.wallHeightUnit || 'ft');
  const gableArea = Math.max(0, Number(inputs.gableArea) || 0);
  const windows = Math.max(0, Math.round(Number(inputs.windows) || 0));
  const windowArea = Math.max(0, Number(inputs.windowArea) || 15);
  const doors = Math.max(0, Math.round(Number(inputs.doors) || 0));
  const doorArea = Math.max(0, Number(inputs.doorArea) || 21);
  const sidingType = String(inputs.sidingType || 'vinyl');
  const wasteRaw = inputs.wasteFactor !== undefined ? Number(inputs.wasteFactor) : 10;
  const wastePercent = Math.min(20, Math.max(0, wasteRaw || 0));

  // ── Convert to feet ───────────────────────────────────
  const lengthFt = rawLength * (lengthToFeet[lengthUnit] ?? 1);
  const heightFt = rawHeight * (lengthToFeet[heightUnit] ?? 1);

  // ── Guard: zero or negative dimensions ────────────────
  if (lengthFt <= 0 || heightFt <= 0) {
    return {
      netArea: 0,
      grossArea: 0,
      areaWithWaste: 0,
      squares: 0,
      panelsOrPlanks: 0,
      jChannel: 0,
      starterStrip: 0,
      openingDeductions: 0,
      costEstimate: [
        { label: 'Material', value: 0 },
        { label: 'Installation', value: 0 },
        { label: 'Total', value: 0 },
      ],
    };
  }

  // ── Calculate areas ───────────────────────────────────
  const wallArea = lengthFt * heightFt;
  const grossArea = parseFloat((wallArea + gableArea).toFixed(2));
  const openingDeductions = parseFloat(((windows * windowArea) + (doors * doorArea)).toFixed(2));
  const netArea = parseFloat(Math.max(0, grossArea - openingDeductions).toFixed(2));

  // ── Area with waste ───────────────────────────────────
  const wasteFactor = 1 + wastePercent / 100;
  const areaWithWaste = parseFloat((netArea * wasteFactor).toFixed(2));

  // ── Squares (siding industry unit = 100 sq ft) ────────
  const squares = parseFloat((areaWithWaste / 100).toFixed(2));

  // ── Material-specific panel/plank count ───────────────
  const coverage = coveragePerUnit[sidingType] ?? 8.0;
  const panelsOrPlanks = areaWithWaste > 0 ? Math.ceil(areaWithWaste / coverage) : 0;

  // ── J-Channel (vinyl trim around openings) ────────────
  // Each window needs ~3 pieces × 12.5 ft, each door needs ~2 pieces × 12.5 ft
  const jChannel = parseFloat((Math.ceil(windows * 3 + doors * 2) * 12.5).toFixed(2));

  // ── Starter strip (runs along bottom of wall) ─────────
  const starterStrip = parseFloat(lengthFt.toFixed(2));

  // ── Cost estimate ─────────────────────────────────────
  const [lowRate, highRate] = costPerSqFt[sidingType] ?? [3, 7];
  // Split into material (~40%) and installation (~60%)
  const materialLow = areaWithWaste * lowRate * 0.4;
  const materialHigh = areaWithWaste * highRate * 0.4;
  const installLow = areaWithWaste * lowRate * 0.6;
  const installHigh = areaWithWaste * highRate * 0.6;
  const materialMid = (materialLow + materialHigh) / 2;
  const installMid = (installLow + installHigh) / 2;
  const totalMid = materialMid + installMid;

  const costEstimate = [
    { label: 'Material', value: parseFloat(materialMid.toFixed(2)) },
    { label: 'Installation', value: parseFloat(installMid.toFixed(2)) },
    { label: 'Total', value: parseFloat(totalMid.toFixed(2)) },
  ];

  return {
    netArea,
    grossArea,
    areaWithWaste,
    squares,
    panelsOrPlanks,
    jChannel,
    starterStrip,
    openingDeductions,
    costEstimate,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'siding': calculateSiding,
};
