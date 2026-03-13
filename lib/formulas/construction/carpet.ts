/**
 * Carpet Calculator Formula Module
 *
 * Calculates carpet quantity needed for a room, including closets,
 * waste factor, square yards (purchase unit), linear feet of roll,
 * seam count, and padding.
 *
 * Room Area:
 *   roomArea = roomLength × roomWidth (sq ft)
 *
 * Total Area:
 *   totalArea = roomArea + (closets × closetArea)
 *
 * Total with Waste:
 *   totalWithWaste = totalArea × (1 + wasteFactor / 100)
 *
 * Square Yards:
 *   squareYards = totalWithWaste / 9
 *
 * Linear Feet:
 *   linearFeet = ⌈totalWithWaste / carpetWidth⌉ × carpetWidth
 *   (rounds up to full roll widths)
 *
 * Seams:
 *   seams = max(0, ⌈roomWidth / carpetWidth⌉ - 1)
 *   (number of seams needed across room width)
 *
 * Source: Carpet and Rug Institute (CRI) — Carpet Installation Standard
 * (CRI 104/105). Carpet sold by square yard per US industry convention.
 */

export interface CarpetInput {
  roomLength: number;
  roomLengthUnit: string;
  roomWidth: number;
  roomWidthUnit: string;
  carpetWidth: string;        // '12' | '15' (feet)
  closets: number;
  closetArea: number;         // sq ft per closet
  wasteFactor: number;        // percentage (e.g. 10 = 10%)
}

export interface CarpetOutput {
  squareFeet: number;
  squareYards: number;
  linearFeet: number;
  seams: number;
  paddingSqYd: number;
  roomArea: number;
  costEstimate: { label: string; value: number }[];
}

const lengthToFeet: Record<string, number> = {
  ft: 1,
  in: 1 / 12,
  m: 3.28084,
  yd: 3,
};

/**
 * Carpet calculator — square yards, linear feet, seams, padding, and cost.
 *
 * Total Area = (L × W) + (closets × closetArea)
 * With Waste = Total Area × (1 + waste%)
 * Square Yards = With Waste / 9
 * Linear Feet = ⌈With Waste / carpetWidth⌉ × carpetWidth
 * Seams = max(0, ⌈roomWidth / carpetWidth⌉ - 1)
 *
 * Source: Carpet and Rug Institute (CRI) installation standards.
 */
export function calculateCarpet(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const rawLength = Number(inputs.roomLength) || 0;
  const rawWidth = Number(inputs.roomWidth) || 0;
  const lengthUnit = String(inputs.roomLengthUnit || 'ft');
  const widthUnit = String(inputs.roomWidthUnit || 'ft');
  const carpetWidthFt = parseFloat(String(inputs.carpetWidth || '12'));
  const closets = Math.max(0, Math.round(Number(inputs.closets) || 0));
  const closetArea = Math.max(0, Number(inputs.closetArea) || 6);
  const wasteRaw = inputs.wasteFactor !== undefined ? Number(inputs.wasteFactor) : 10;
  const wastePercent = Math.min(20, Math.max(0, wasteRaw || 0));

  // ── Convert to feet ───────────────────────────────────
  const lengthFt = rawLength * (lengthToFeet[lengthUnit] ?? 1);
  const widthFt = rawWidth * (lengthToFeet[widthUnit] ?? 1);

  // ── Guard: zero or negative dimensions ────────────────
  if (lengthFt <= 0 || widthFt <= 0) {
    return {
      squareFeet: 0,
      squareYards: 0,
      linearFeet: 0,
      seams: 0,
      paddingSqYd: 0,
      roomArea: 0,
      costEstimate: [
        { label: 'Budget ($2-4/sq ft)', value: 0 },
        { label: 'Mid-Range ($4-8/sq ft)', value: 0 },
        { label: 'Premium ($8-15/sq ft)', value: 0 },
        { label: 'Padding ($0.50-1.50/sq yd)', value: 0 },
        { label: 'Installation ($1-3/sq ft)', value: 0 },
      ],
    };
  }

  // ── Calculate areas ───────────────────────────────────
  const roomArea = parseFloat((lengthFt * widthFt).toFixed(2));
  const closetTotal = closets * closetArea;
  const totalArea = roomArea + closetTotal;
  const wasteFactor = 1 + wastePercent / 100;
  const totalWithWaste = parseFloat((totalArea * wasteFactor).toFixed(2));

  // ── Square yards (standard purchase unit) ─────────────
  const squareYards = parseFloat((totalWithWaste / 9).toFixed(2));

  // ── Linear feet of carpet roll ────────────────────────
  // Rounds up to full roll widths
  const rollStrips = carpetWidthFt > 0 ? Math.ceil(totalWithWaste / carpetWidthFt) : 0;
  const linearFeet = parseFloat((rollStrips * carpetWidthFt).toFixed(2));

  // ── Seams (across room width) ─────────────────────────
  // If the room width is wider than one carpet roll, seams are needed
  const seams = carpetWidthFt > 0
    ? Math.max(0, Math.ceil(widthFt / carpetWidthFt) - 1)
    : 0;

  // ── Padding (same as carpet sq yd) ────────────────────
  const paddingSqYd = squareYards;

  // ── Cost estimates ────────────────────────────────────
  const budgetLow = totalWithWaste * 2;
  const budgetHigh = totalWithWaste * 4;
  const midLow = totalWithWaste * 4;
  const midHigh = totalWithWaste * 8;
  const premiumLow = totalWithWaste * 8;
  const premiumHigh = totalWithWaste * 15;
  const paddingLow = squareYards * 0.50;
  const paddingHigh = squareYards * 1.50;
  const installLow = totalWithWaste * 1;
  const installHigh = totalWithWaste * 3;

  const costEstimate = [
    { label: 'Budget ($2-4/sq ft)', value: parseFloat(((budgetLow + budgetHigh) / 2).toFixed(2)) },
    { label: 'Mid-Range ($4-8/sq ft)', value: parseFloat(((midLow + midHigh) / 2).toFixed(2)) },
    { label: 'Premium ($8-15/sq ft)', value: parseFloat(((premiumLow + premiumHigh) / 2).toFixed(2)) },
    { label: 'Padding ($0.50-1.50/sq yd)', value: parseFloat(((paddingLow + paddingHigh) / 2).toFixed(2)) },
    { label: 'Installation ($1-3/sq ft)', value: parseFloat(((installLow + installHigh) / 2).toFixed(2)) },
  ];

  return {
    squareFeet: totalWithWaste,
    squareYards,
    linearFeet,
    seams,
    paddingSqYd,
    roomArea,
    costEstimate,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'carpet': calculateCarpet,
};
