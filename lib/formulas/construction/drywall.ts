/**
 * Drywall Calculator Formula Module
 *
 * Calculates drywall sheets, joint compound, tape, and screws needed.
 *
 * Wall Area Formula:
 *   Wall Area = Perimeter × Height - (Doors × 21) - (Windows × 15)
 *   Ceiling Area = Length × Width (if included)
 *   Total Area = Wall Area + Ceiling Area
 *
 * Sheets:
 *   Sheets = ⌈Total Area ÷ Sheet Area⌉
 *   Standard sheet: 4 ft × 8 ft = 32 sq ft
 *   Common sizes: 4×8 (32), 4×10 (40), 4×12 (48)
 *
 * Joint Compound:
 *   ~0.053 gallons per sq ft (industry average)
 *   1 gallon covers ~19 sq ft (three coats: tape, fill, finish)
 *
 * Tape:
 *   Linear feet of joints ≈ perimeter of each sheet edge
 *   ~375 ft per roll, estimate 1 roll per 8-10 sheets
 *
 * Screws:
 *   ~32 screws per sheet (16" OC framing, screws every 12" on edges, 16" in field)
 *   ~1 lb of screws per 8 sheets
 *
 * Source: Gypsum Association — Application and Finishing of Gypsum Panel
 * Products (GA-216). US Gypsum (USG) installation guidelines.
 */

export interface DrywallInput {
  roomLength: number;
  roomLengthUnit: string;
  roomWidth: number;
  roomWidthUnit: string;
  wallHeight: number;
  wallHeightUnit: string;
  doors: number;
  windows: number;
  includeCeiling: boolean;
  sheetSize: string;          // '4x8' | '4x10' | '4x12'
  rooms: number;
}

export interface DrywallOutput {
  sheets: number;
  totalArea: number;
  wallArea: number;
  ceilingArea: number;
  jointCompoundGallons: number;
  tapeRolls: number;
  screwsLbs: number;
  cornerBeadFt: number;
  costEstimate: { label: string; value: number }[];
  materialBreakdown: { label: string; value: number }[];
}

const lengthToFeet: Record<string, number> = {
  ft: 1,
  in: 1 / 12,
  m: 3.28084,
};

/** Standard opening sizes (sq ft) */
const DOOR_AREA = 21;       // 3 ft × 7 ft
const WINDOW_AREA = 15;     // 3 ft × 5 ft

/** Sheet areas in sq ft by size code */
const sheetArea: Record<string, number> = {
  '4x8': 32,
  '4x10': 40,
  '4x12': 48,
};

/**
 * Drywall calculator — sheets, compound, tape, screws, and cost.
 *
 * Wall Area = 2(L+W) × H − Openings
 * Ceiling = L × W (if included)
 * Sheets = ⌈Total Area ÷ Sheet Area⌉
 * Compound = Total Area × 0.053 gal/sq ft
 * Tape = 1 roll per 8 sheets (375 ft rolls)
 * Screws = ~1 lb per 8 sheets
 *
 * Source: Gypsum Association GA-216, USG installation guidelines.
 */
export function calculateDrywall(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const rawLength = Number(inputs.roomLength) || 0;
  const rawWidth = Number(inputs.roomWidth) || 0;
  const rawHeight = Number(inputs.wallHeight) || 0;
  const lengthUnit = String(inputs.roomLengthUnit || 'ft');
  const widthUnit = String(inputs.roomWidthUnit || 'ft');
  const heightUnit = String(inputs.wallHeightUnit || 'ft');
  const doors = Math.max(0, Math.round(Number(inputs.doors) || 0));
  const windows = Math.max(0, Math.round(Number(inputs.windows) || 0));
  const includeCeiling = inputs.includeCeiling === true || inputs.includeCeiling === 'true';
  const sheetSizeKey = String(inputs.sheetSize || '4x8');
  const rooms = Math.max(1, Math.round(Number(inputs.rooms) || 1));

  // ── Convert to feet ───────────────────────────────────
  const lengthFt = rawLength * (lengthToFeet[lengthUnit] ?? 1);
  const widthFt = rawWidth * (lengthToFeet[widthUnit] ?? 1);
  const heightFt = rawHeight * (lengthToFeet[heightUnit] ?? 1);

  // ── Calculate areas (per room) ────────────────────────
  const perimeter = 2 * (lengthFt + widthFt);
  const grossWallArea = perimeter * heightFt;
  const openingsArea = (doors * DOOR_AREA) + (windows * WINDOW_AREA);
  const netWallArea = Math.max(0, grossWallArea - openingsArea);

  const ceilingAreaPerRoom = includeCeiling ? lengthFt * widthFt : 0;
  const totalAreaPerRoom = netWallArea + ceilingAreaPerRoom;

  // ── Apply room multiplier ─────────────────────────────
  const totalWallArea = netWallArea * rooms;
  const totalCeilingArea = ceilingAreaPerRoom * rooms;
  const totalArea = totalAreaPerRoom * rooms;

  // ── Sheets ────────────────────────────────────────────
  const sqFtPerSheet = sheetArea[sheetSizeKey] ?? 32;
  const sheets = totalArea > 0 ? Math.ceil(totalArea / sqFtPerSheet) : 0;

  // ── Joint compound ────────────────────────────────────
  // ~0.053 gallons per sq ft for three coats (tape, fill, finish)
  // Sold in 3.5 gal buckets (round up to nearest 0.5 gal for estimate)
  const compoundGallonsExact = totalArea * 0.053;
  const jointCompoundGallons = parseFloat(compoundGallonsExact.toFixed(1));

  // ── Tape rolls ────────────────────────────────────────
  // ~1 roll (375 ft) per 8 sheets; or ~1 roll per 256 sq ft of 4x8 sheets
  const tapeRolls = sheets > 0 ? Math.ceil(sheets / 8) : 0;

  // ── Screws ────────────────────────────────────────────
  // ~32 screws per 4x8 sheet; ~1 lb per 8 sheets (1-5/8" drywall screws)
  const screwsLbs = sheets > 0 ? Math.ceil(sheets / 8) : 0;

  // ── Corner bead ───────────────────────────────────────
  // Estimate: 4 vertical corners per room × wall height × rooms
  const cornersPerRoom = 4;
  const cornerBeadFt = parseFloat((cornersPerRoom * heightFt * rooms).toFixed(0));

  // ── Cost estimate ─────────────────────────────────────
  // 4×8 sheet: $10-$15; compound: $12-$18 per 3.5 gal; tape: $3-$5 per roll
  const sheetCostLow = sheets * 10;
  const sheetCostHigh = sheets * 15;
  const compoundBuckets = Math.ceil(compoundGallonsExact / 3.5);
  const compoundCostLow = compoundBuckets * 12;
  const compoundCostHigh = compoundBuckets * 18;
  const tapeCost = tapeRolls * 4; // average
  const screwCost = screwsLbs * 8; // ~$8/lb for 1-5/8" screws
  const cornerBeadCost = Math.ceil(cornerBeadFt / 8) * 4; // ~$4 per 8-ft piece

  const costLow = sheetCostLow + compoundCostLow + tapeCost + screwCost + cornerBeadCost;
  const costHigh = sheetCostHigh + compoundCostHigh + tapeCost + screwCost + cornerBeadCost;
  const costMid = (costLow + costHigh) / 2;

  const costEstimate = [
    { label: 'Low Estimate', value: parseFloat(costLow.toFixed(2)) },
    { label: 'Mid Estimate', value: parseFloat(costMid.toFixed(2)) },
    { label: 'High Estimate', value: parseFloat(costHigh.toFixed(2)) },
  ];

  const materialBreakdown = [
    { label: 'Gross Wall Area (sq ft)', value: parseFloat((grossWallArea * rooms).toFixed(2)) },
    { label: 'Openings Deducted (sq ft)', value: parseFloat((openingsArea * rooms).toFixed(2)) },
    { label: 'Net Wall Area (sq ft)', value: parseFloat(totalWallArea.toFixed(2)) },
    { label: 'Ceiling Area (sq ft)', value: parseFloat(totalCeilingArea.toFixed(2)) },
    { label: 'Total Drywall Area (sq ft)', value: parseFloat(totalArea.toFixed(2)) },
    { label: 'Compound Buckets (3.5 gal)', value: compoundBuckets },
  ];

  return {
    sheets,
    totalArea: parseFloat(totalArea.toFixed(2)),
    wallArea: parseFloat(totalWallArea.toFixed(2)),
    ceilingArea: parseFloat(totalCeilingArea.toFixed(2)),
    jointCompoundGallons,
    tapeRolls,
    screwsLbs,
    cornerBeadFt,
    costEstimate,
    materialBreakdown,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'drywall': calculateDrywall,
};
