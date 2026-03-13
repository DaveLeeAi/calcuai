/**
 * Wallpaper Calculator Formula Module
 *
 * Calculates the number of wallpaper rolls needed for a room,
 * accounting for doors, windows, pattern repeats, and waste.
 *
 * Total Wall Area:
 *   A = 2 × (L + W) × H
 *
 * Net Wall Area:
 *   A_net = A - (doors × 21) - (windows × 15)
 *
 * Usable Roll Area:
 *   A_roll = (rollWidth / 12) × rollLength  (sq ft per roll)
 *
 * Pattern Adjustment:
 *   If patternRepeat > 0: A_adjusted = A_roll × 0.85  (15% waste for matching)
 *   Otherwise: A_adjusted = A_roll
 *
 * Rolls Needed:
 *   rolls = ⌈A_net × (1 + wasteFactor/100) / A_adjusted⌉
 *
 * Source: Wallcovering Association — Wallpaper Estimation Guidelines.
 */

export interface WallpaperInput {
  roomLength: number;
  roomLengthUnit: string;
  roomWidth: number;
  roomWidthUnit: string;
  wallHeight: number;
  wallHeightUnit: string;
  doors: number;
  windows: number;
  rollWidth: string;        // '20.5' | '27' | '36' (inches)
  rollLength: string;       // '33' | '56' (feet — single/double roll)
  patternRepeat: number;    // pattern repeat in inches (0 for no pattern)
  wasteFactor: number;      // percentage (e.g. 10 = 10%)
}

export interface WallpaperOutput {
  rollsNeeded: number;
  netWallArea: number;
  totalWallArea: number;
  doorArea: number;
  windowArea: number;
  usableRollArea: number;
  patternAdjustment: number;
  costEstimate: { label: string; value: number }[];
  totalStrips: number;
  stripsPerRoll: number;
}

const lengthToFeet: Record<string, number> = {
  ft: 1,
  in: 1 / 12,
  m: 3.28084,
  cm: 0.0328084,
};

/** Standard opening sizes (sq ft) */
const DOOR_AREA = 21;       // 3 ft × 7 ft
const WINDOW_AREA = 15;     // 3 ft × 5 ft

/**
 * Wallpaper calculator — rolls, strips, net area, and cost estimate.
 *
 * Wall Area = 2(L+W) × H
 * Net Area = Wall Area - Doors - Windows
 * Rolls = ⌈Net Area × (1 + waste%) / adjusted roll area⌉
 *
 * Source: Wallcovering Association estimation guidelines.
 */
export function calculateWallpaper(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const rawLength = Number(inputs.roomLength) || 0;
  const rawWidth = Number(inputs.roomWidth) || 0;
  const rawHeight = Number(inputs.wallHeight) || 0;
  const lengthUnit = String(inputs.roomLengthUnit || 'ft');
  const widthUnit = String(inputs.roomWidthUnit || 'ft');
  const heightUnit = String(inputs.wallHeightUnit || 'ft');
  const doors = Math.max(0, Math.round(Number(inputs.doors) || 0));
  const windows = Math.max(0, Math.round(Number(inputs.windows) || 0));
  const rollWidthIn = parseFloat(String(inputs.rollWidth || '20.5'));
  const rollLengthFt = parseFloat(String(inputs.rollLength || '33'));
  const patternRepeat = Math.max(0, Math.min(36, Number(inputs.patternRepeat) || 0));
  const wastePercent = Math.min(30, Math.max(0, Number(inputs.wasteFactor) || 0));

  // ── Convert to feet ───────────────────────────────────
  const lengthFt = rawLength * (lengthToFeet[lengthUnit] ?? 1);
  const widthFt = rawWidth * (lengthToFeet[widthUnit] ?? 1);
  const heightFt = rawHeight * (lengthToFeet[heightUnit] ?? 1);

  // ── Guard: zero dimensions ────────────────────────────
  if (lengthFt <= 0 || widthFt <= 0 || heightFt <= 0) {
    return {
      rollsNeeded: 0,
      netWallArea: 0,
      totalWallArea: 0,
      doorArea: 0,
      windowArea: 0,
      usableRollArea: 0,
      patternAdjustment: 0,
      costEstimate: [
        { label: 'Budget ($15-25/roll)', value: 0 },
        { label: 'Mid-Range ($30-60/roll)', value: 0 },
        { label: 'Premium ($75-150/roll)', value: 0 },
      ],
      totalStrips: 0,
      stripsPerRoll: 0,
    };
  }

  // ── Calculate wall areas ──────────────────────────────
  const perimeter = 2 * (lengthFt + widthFt);
  const totalWallArea = parseFloat((perimeter * heightFt).toFixed(2));
  const doorArea = doors * DOOR_AREA;
  const windowArea = windows * WINDOW_AREA;
  const netWallArea = parseFloat(Math.max(0, totalWallArea - doorArea - windowArea).toFixed(2));

  // ── Roll coverage ─────────────────────────────────────
  const rollWidthFt = rollWidthIn / 12;
  const usableRollArea = parseFloat((rollWidthFt * rollLengthFt).toFixed(2));

  // ── Pattern adjustment ────────────────────────────────
  // If there is a pattern repeat, reduce usable coverage by 15%
  const patternAdjustment = patternRepeat > 0
    ? parseFloat((usableRollArea * 0.85).toFixed(2))
    : usableRollArea;

  // ── Rolls needed ──────────────────────────────────────
  const wasteFactor = 1 + wastePercent / 100;
  const adjustedArea = netWallArea * wasteFactor;
  const rollsNeeded = patternAdjustment > 0
    ? Math.ceil(adjustedArea / patternAdjustment)
    : 0;

  // ── Strips calculation ────────────────────────────────
  // Total strips around room perimeter
  const totalStrips = rollWidthFt > 0
    ? Math.ceil(perimeter / rollWidthFt)
    : 0;

  // Strips per roll: how many full-height strips fit in one roll
  const stripHeight = heightFt + (patternRepeat > 0 ? patternRepeat / 12 : 0);
  const stripsPerRoll = stripHeight > 0
    ? Math.floor(rollLengthFt / stripHeight)
    : 0;

  // ── Cost estimate (per roll pricing tiers) ────────────
  const budgetLow = rollsNeeded * 15;
  const budgetHigh = rollsNeeded * 25;
  const midLow = rollsNeeded * 30;
  const midHigh = rollsNeeded * 60;
  const premiumLow = rollsNeeded * 75;
  const premiumHigh = rollsNeeded * 150;

  const costEstimate = [
    { label: 'Budget ($15-25/roll)', value: parseFloat(((budgetLow + budgetHigh) / 2).toFixed(2)) },
    { label: 'Mid-Range ($30-60/roll)', value: parseFloat(((midLow + midHigh) / 2).toFixed(2)) },
    { label: 'Premium ($75-150/roll)', value: parseFloat(((premiumLow + premiumHigh) / 2).toFixed(2)) },
  ];

  return {
    rollsNeeded,
    netWallArea,
    totalWallArea,
    doorArea,
    windowArea,
    usableRollArea,
    patternAdjustment,
    costEstimate,
    totalStrips,
    stripsPerRoll,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'wallpaper': calculateWallpaper,
};
