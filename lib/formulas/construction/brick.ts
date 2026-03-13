/**
 * Brick Calculator Formula Module
 *
 * Calculates the number of bricks needed for a wall, accounting for
 * brick size, mortar joint width, openings, and waste factor.
 *
 * Wall area:
 *   wallArea = (wallLength × wallHeight) - (openings × openingArea)
 *
 * Effective brick face:
 *   effectiveBrickFace = ((brickLength + mortarJoint) × (brickHeight + mortarJoint)) / 144  (sq ft)
 *
 * Bricks per sq ft:
 *   bricksPerSqFt = 1 / effectiveBrickFace
 *
 * Bricks needed:
 *   bricksNeeded = ⌈wallArea × bricksPerSqFt × (1 + wasteFactor)⌉
 *
 * Mortar:
 *   mortarBags = ⌈wallArea × 7 / 100⌉  (60-lb bags, ~7 per 100 sq ft)
 *
 * Source: Brick Industry Association (BIA) Technical Note 10 —
 * Dimensioning and Estimating Brick Masonry.
 */

export interface BrickInput {
  wallLength: number;       // feet (or meters)
  wallHeight: number;       // feet (or meters)
  wallLengthUnit?: string;  // 'ft' | 'm'
  wallHeightUnit?: string;  // 'ft' | 'm'
  brickSize: string;        // 'standard' | 'modular' | 'queen' | 'king'
  mortarJoint: number;      // inches
  openings: number;         // number of openings
  openingArea: number;      // sq ft per opening
  wasteFactor: number;      // percentage (e.g. 5 = 5%)
}

export interface BrickOutput {
  bricksNeeded: number;
  bricksWithoutWaste: number;
  wallArea: number;
  bricksPerSqFt: number;
  mortarBags: number;
  costEstimate: { label: string; value: string | number }[];
  brickSummary: { label: string; value: string | number }[];
  summary: { label: string; value: string | number }[];
}

/**
 * Brick size lookup (Length × Height × Width in inches).
 * Source: BIA Technical Note 10.
 */
const BRICK_SIZES: Record<string, { length: number; height: number; width: number; label: string }> = {
  'standard':  { length: 8,     height: 2.25, width: 3.625, label: 'Standard (8" × 2¼" × 3⅝")' },
  'modular':   { length: 7.625, height: 2.25, width: 3.625, label: 'Modular (7⅝" × 2¼" × 3⅝")' },
  'queen':     { length: 7.625, height: 2.75, width: 3.125, label: 'Queen (7⅝" × 2¾" × 3⅛")' },
  'king':      { length: 9.625, height: 2.75, width: 3.625, label: 'King (9⅝" × 2¾" × 3⅝")' },
};

/** Length unit conversion to feet */
const LENGTH_TO_FEET: Record<string, number> = {
  ft: 1,
  m: 3.28084,
};

/**
 * Brick calculator — brick count, mortar, and cost estimate.
 *
 * Bricks = ⌈wallArea × bricksPerSqFt × (1 + waste%)⌉
 *
 * Source: Brick Industry Association (BIA) Technical Note 10.
 */
export function calculateBrick(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const rawLength = Number(inputs.wallLength) || 0;
  const rawHeight = Number(inputs.wallHeight) || 0;
  const wallLengthUnit = String(inputs.wallLengthUnit || 'ft');
  const wallHeightUnit = String(inputs.wallHeightUnit || 'ft');
  const brickSizeKey = String(inputs.brickSize || 'modular');
  const mortarJoint = Math.max(0, Number(inputs.mortarJoint) ?? 0.375);
  const openings = Math.max(0, Math.round(Number(inputs.openings) || 0));
  const openingAreaEach = Math.max(0, Number(inputs.openingArea) || 15);
  const wasteRaw = inputs.wasteFactor !== undefined ? Number(inputs.wasteFactor) : 5;
  const wasteFactor = Math.max(0, wasteRaw || 0) / 100;

  // ── Convert to feet ───────────────────────────────────
  const wallLengthFt = rawLength * (LENGTH_TO_FEET[wallLengthUnit] ?? 1);
  const wallHeightFt = rawHeight * (LENGTH_TO_FEET[wallHeightUnit] ?? 1);

  // ── Get brick dimensions ──────────────────────────────
  const brick = BRICK_SIZES[brickSizeKey] ?? BRICK_SIZES['modular'];

  // ── Guard: invalid dimensions ─────────────────────────
  if (wallLengthFt <= 0 || wallHeightFt <= 0) {
    return {
      bricksNeeded: 0,
      bricksWithoutWaste: 0,
      wallArea: 0,
      bricksPerSqFt: 0,
      mortarBags: 0,
      costEstimate: [],
      brickSummary: [],
      summary: [],
    };
  }

  // ── Wall area (deduct openings) ───────────────────────
  const grossArea = wallLengthFt * wallHeightFt;
  const openingsDeduction = openings * openingAreaEach;
  const wallArea = parseFloat(Math.max(0, grossArea - openingsDeduction).toFixed(1));

  // ── Guard: zero wall area after openings ──────────────
  if (wallArea <= 0) {
    return {
      bricksNeeded: 0,
      bricksWithoutWaste: 0,
      wallArea: 0,
      bricksPerSqFt: parseFloat((1 / ((brick.length + mortarJoint) * (brick.height + mortarJoint) / 144)).toFixed(1)),
      mortarBags: 0,
      costEstimate: [],
      brickSummary: [
        { label: 'Brick Type', value: brick.label },
        { label: 'Brick Length', value: brick.length + '"' },
        { label: 'Brick Height', value: brick.height + '"' },
        { label: 'Brick Width (Depth)', value: brick.width + '"' },
      ],
      summary: [],
    };
  }

  // ── Bricks per square foot ────────────────────────────
  const effectiveBrickFace = ((brick.length + mortarJoint) * (brick.height + mortarJoint)) / 144;
  const bricksPerSqFt = parseFloat((1 / effectiveBrickFace).toFixed(1));

  // ── Bricks needed (without waste) ─────────────────────
  const bricksWithoutWaste = Math.ceil(
    parseFloat((wallArea * bricksPerSqFt).toFixed(6))
  );

  // ── Bricks with waste ─────────────────────────────────
  const bricksNeeded = Math.ceil(
    parseFloat((bricksWithoutWaste * (1 + wasteFactor)).toFixed(6))
  );

  // ── Mortar bags (60 lb) ───────────────────────────────
  // Approximately 7 bags per 100 sq ft for standard 3/8" joints
  // Scale proportionally for different joint widths
  const mortarScale = mortarJoint / 0.375;
  const mortarBags = Math.ceil(wallArea * 7 * mortarScale / 100);

  // ── Cost estimate ─────────────────────────────────────
  const brickCostLow = parseFloat((bricksNeeded * 0.50).toFixed(2));
  const brickCostHigh = parseFloat((bricksNeeded * 1.50).toFixed(2));
  const mortarCost = parseFloat((mortarBags * 8).toFixed(2)); // ~$8 per 60-lb bag
  const totalLow = parseFloat((brickCostLow + mortarCost).toFixed(2));
  const totalHigh = parseFloat((brickCostHigh + mortarCost).toFixed(2));

  const costEstimate: { label: string; value: string | number }[] = [
    { label: 'Bricks (Low @ $0.50/ea)', value: '$' + brickCostLow.toFixed(2) },
    { label: 'Bricks (High @ $1.50/ea)', value: '$' + brickCostHigh.toFixed(2) },
    { label: 'Mortar (60-lb bags)', value: '$' + mortarCost.toFixed(2) },
    { label: 'Total Material (Low)', value: '$' + totalLow.toFixed(2) },
    { label: 'Total Material (High)', value: '$' + totalHigh.toFixed(2) },
  ];

  // ── Brick summary ─────────────────────────────────────
  const brickSummary: { label: string; value: string | number }[] = [
    { label: 'Brick Type', value: brick.label },
    { label: 'Brick Length', value: brick.length + '"' },
    { label: 'Brick Height', value: brick.height + '"' },
    { label: 'Brick Width (Depth)', value: brick.width + '"' },
  ];

  // ── Summary breakdown ─────────────────────────────────
  const wastePercent = Math.round(wasteFactor * 100);
  const summary: { label: string; value: string | number }[] = [
    { label: 'Wall Area (Net)', value: wallArea + ' sq ft' },
    { label: 'Bricks Per Sq Ft', value: bricksPerSqFt },
    { label: 'Bricks (No Waste)', value: bricksWithoutWaste },
    { label: 'Bricks (With ' + wastePercent + '% Waste)', value: bricksNeeded },
    { label: 'Mortar Bags (60 lb)', value: mortarBags },
    { label: 'Openings Deducted', value: openings + ' (' + openingsDeduction + ' sq ft)' },
  ];

  return {
    bricksNeeded,
    bricksWithoutWaste,
    wallArea,
    bricksPerSqFt,
    mortarBags,
    costEstimate,
    brickSummary,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'brick': calculateBrick,
};
