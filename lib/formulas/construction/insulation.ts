/**
 * Insulation Calculator Formula Module
 *
 * Calculates insulation materials needed based on area dimensions,
 * insulation type, and R-value target.
 *
 * Total Area:
 *   A = L × W (sq ft)
 *
 * Material quantity varies by insulation type:
 *   Batt: batts = ⌈A / battCoverage⌉  (coverage varies by R-value)
 *   Blown-in: bags = ⌈A / bagCoverage⌉  (coverage varies by R-value)
 *   Spray Foam: boardFeet = A × thickness / 12
 *   Rigid Board: sheets = ⌈A / 32⌉  (4×8 ft sheets = 32 sq ft)
 *
 * Effective R-Value:
 *   If existing insulation present: effectiveR = targetR + existingR
 *   Otherwise: effectiveR = targetR
 *
 * Source: U.S. Department of Energy — Insulation R-Value Recommendations
 * by Climate Zone. Coverage rates per manufacturer specifications.
 */

export interface InsulationInput {
  areaLength: number;
  areaLengthUnit: string;
  areaWidth: number;
  areaWidthUnit: string;
  insulationType: string;    // 'batt' | 'blown' | 'spray-foam' | 'rigid-board'
  rValue: string;            // 'R-13' | 'R-19' | 'R-30' | 'R-38' | 'R-49'
  applicationArea: string;   // 'attic' | 'walls' | 'floor' | 'crawlspace'
  existingInsulation: boolean;
  existingRValue: number;
}

export interface InsulationOutput {
  totalArea: number;
  effectiveRValue: number;
  insulationThickness: number;
  materialQuantity: number;
  materialUnit: string;
  costEstimate: { label: string; value: number }[];
  wasteRecommendation: number;
  totalCoverage: number;
}

const lengthToFeet: Record<string, number> = {
  ft: 1,
  in: 1 / 12,
  m: 3.28084,
  cm: 0.0328084,
};

/**
 * Numeric R-value extracted from the R-value string code.
 */
function parseRValue(code: string): number {
  const match = code.match(/R-?(\d+)/i);
  return match ? parseInt(match[1], 10) : 30;
}

/**
 * Batt insulation thickness in inches by R-value.
 * Standard fiberglass batt dimensions (depth).
 * Source: DOE / manufacturer spec sheets.
 */
const battThickness: Record<number, number> = {
  13: 3.5,
  19: 6.25,
  30: 9.5,
  38: 12,
  49: 15.5,
};

/**
 * Batt coverage in sq ft per roll/batt pack.
 * Based on standard 15" or 23" faced batts (average coverage per pack).
 */
const battCoverage: Record<number, number> = {
  13: 40,    // ~40 sq ft per roll (15" wide × 32 ft)
  19: 48.96, // ~49 sq ft per roll (15" wide × 39.2 ft)
  30: 31.25, // ~31 sq ft per roll (15" wide × 25 ft)
  38: 24,    // ~24 sq ft per roll (smaller packs)
  49: 18,    // ~18 sq ft per roll (thickest batts)
};

/**
 * Blown-in insulation: coverage per bag in sq ft (by R-value).
 * Based on cellulose blown-in insulation at settled density.
 */
const blownCoverage: Record<number, number> = {
  13: 40,    // ~40 sq ft per bag at R-13
  19: 27,    // ~27 sq ft per bag at R-19
  30: 17,    // ~17 sq ft per bag at R-30
  38: 13,    // ~13 sq ft per bag at R-38
  49: 10,    // ~10 sq ft per bag at R-49
};

/**
 * Blown-in thickness in inches by R-value.
 * Cellulose blown-in at settled density.
 */
const blownThickness: Record<number, number> = {
  13: 3.5,
  19: 5.25,
  30: 8.25,
  38: 10.5,
  49: 13.5,
};

/**
 * Spray foam: thickness in inches per R-value.
 * Closed-cell spray foam at ~R-6.5 per inch.
 */
const sprayFoamThickness: Record<number, number> = {
  13: 2,
  19: 3,
  30: 4.6,
  38: 5.8,
  49: 7.5,
};

/**
 * Rigid board: thickness in inches per R-value.
 * Polyiso rigid foam at ~R-6.5 per inch.
 */
const rigidBoardThickness: Record<number, number> = {
  13: 2,
  19: 3,
  30: 4.5,
  38: 6,
  49: 7.5,
};

/**
 * Cost per sq ft by insulation type: [low, high].
 * Source: HomeAdvisor / Angi 2025-2026 national averages.
 */
const costPerSqFt: Record<string, [number, number]> = {
  'batt': [0.50, 1.50],
  'blown': [1.00, 2.50],
  'spray-foam': [1.50, 3.50],
  'rigid-board': [0.75, 2.00],
};

/**
 * Insulation calculator — material quantity, thickness, cost estimate.
 *
 * Area = Length × Width
 * Quantity = ⌈Area / coveragePerUnit⌉ (by type and R-value)
 * Cost = Area × $/sq ft range
 *
 * Source: U.S. Department of Energy — Insulation R-Value Recommendations.
 */
export function calculateInsulation(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const rawLength = Number(inputs.areaLength) || 0;
  const rawWidth = Number(inputs.areaWidth) || 0;
  const lengthUnit = String(inputs.areaLengthUnit || 'ft');
  const widthUnit = String(inputs.areaWidthUnit || 'ft');
  const insulationType = String(inputs.insulationType || 'batt');
  const rValueCode = String(inputs.rValue || 'R-30');
  const applicationArea = String(inputs.applicationArea || 'attic');
  const existingInsulation = inputs.existingInsulation === true || inputs.existingInsulation === 'true';
  const existingRValue = Math.max(0, Math.min(60, Number(inputs.existingRValue) || 0));

  // ── Convert to feet ───────────────────────────────────
  const lengthFt = rawLength * (lengthToFeet[lengthUnit] ?? 1);
  const widthFt = rawWidth * (lengthToFeet[widthUnit] ?? 1);

  // ── Calculate area ────────────────────────────────────
  const totalArea = parseFloat((lengthFt * widthFt).toFixed(2));

  // ── Parse R-value ─────────────────────────────────────
  const targetR = parseRValue(rValueCode);

  // ── Effective R-value ─────────────────────────────────
  const effectiveRValue = existingInsulation ? targetR + existingRValue : targetR;

  // ── Guard: zero area ──────────────────────────────────
  if (totalArea <= 0) {
    return {
      totalArea: 0,
      effectiveRValue,
      insulationThickness: 0,
      materialQuantity: 0,
      materialUnit: getUnitLabel(insulationType),
      costEstimate: [
        { label: 'Low Estimate', value: 0 },
        { label: 'Mid Estimate', value: 0 },
        { label: 'High Estimate', value: 0 },
      ],
      wasteRecommendation: 0,
      totalCoverage: 0,
    };
  }

  // ── Calculate thickness and quantity by type ──────────
  let insulationThickness: number;
  let materialQuantity: number;
  let materialUnit: string;

  switch (insulationType) {
    case 'blown': {
      insulationThickness = blownThickness[targetR] ?? 8.25;
      const coverage = blownCoverage[targetR] ?? 17;
      materialQuantity = Math.ceil(totalArea / coverage);
      materialUnit = 'bags';
      break;
    }
    case 'spray-foam': {
      insulationThickness = sprayFoamThickness[targetR] ?? 4.6;
      // Board feet = area × thickness / 12 (convert inches to feet)
      materialQuantity = parseFloat((totalArea * insulationThickness / 12).toFixed(2));
      materialUnit = 'board feet';
      break;
    }
    case 'rigid-board': {
      insulationThickness = rigidBoardThickness[targetR] ?? 4.5;
      const sheetSize = 32; // 4×8 ft = 32 sq ft per sheet
      materialQuantity = Math.ceil(totalArea / sheetSize);
      materialUnit = 'sheets';
      break;
    }
    case 'batt':
    default: {
      insulationThickness = battThickness[targetR] ?? 9.5;
      const coverage = battCoverage[targetR] ?? 31.25;
      materialQuantity = Math.ceil(totalArea / coverage);
      materialUnit = 'batts';
      break;
    }
  }

  // ── Waste recommendation ──────────────────────────────
  const wasteRecommendation = parseFloat((totalArea * 0.10).toFixed(2));

  // ── Cost estimate ─────────────────────────────────────
  const [lowRate, highRate] = costPerSqFt[insulationType] ?? [0.50, 1.50];
  const costLow = parseFloat((totalArea * lowRate).toFixed(2));
  const costHigh = parseFloat((totalArea * highRate).toFixed(2));
  const costMid = parseFloat(((costLow + costHigh) / 2).toFixed(2));

  const costEstimate = [
    { label: 'Low Estimate', value: costLow },
    { label: 'Mid Estimate', value: costMid },
    { label: 'High Estimate', value: costHigh },
  ];

  return {
    totalArea,
    effectiveRValue,
    insulationThickness,
    materialQuantity,
    materialUnit,
    costEstimate,
    wasteRecommendation,
    totalCoverage: totalArea,
  };
}

function getUnitLabel(type: string): string {
  switch (type) {
    case 'blown': return 'bags';
    case 'spray-foam': return 'board feet';
    case 'rigid-board': return 'sheets';
    case 'batt':
    default: return 'batts';
  }
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'insulation': calculateInsulation,
};
