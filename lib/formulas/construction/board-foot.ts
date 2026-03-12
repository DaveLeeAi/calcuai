/**
 * Board Foot Calculator Formula Module
 *
 * Calculates lumber volume in board feet and total cost.
 *
 * Board Foot Formula:
 *   Board Feet = (Thickness in inches × Width in inches × Length in inches) ÷ 144
 *   Alternatively: (Thickness × Width × Length in feet) ÷ 12
 *
 * One board foot = 144 cubic inches = a piece 1" thick × 12" wide × 12" long.
 *
 * Source: National Hardwood Lumber Association (NHLA) grading rules
 * and the American Lumber Standard Committee (ALSC).
 */

export interface BoardFootInput {
  thickness: number;          // inches (nominal or actual)
  width: number;              // inches
  length: number;             // raw value
  lengthUnit: string;         // 'ft' | 'in'
  quantity: number;           // number of identical pieces
  pricePerBdFt: number;       // USD per board foot
  useNominal: boolean;        // true = nominal, false = actual dimensions
}

export interface BoardFootOutput {
  boardFeetPerPiece: number;
  totalBoardFeet: number;
  totalCost: number;
  cubicFeet: number;
  pieceBreakdown: { label: string; value: number }[];
}

/**
 * Nominal to actual lumber dimensions (inches).
 * Source: ALSC — American Softwood Lumber Standard PS 20-20.
 */
const nominalToActual: Record<string, number> = {
  '1': 0.75,
  '2': 1.5,
  '3': 2.5,
  '4': 3.5,
  '5': 4.5,
  '6': 5.5,
  '8': 7.25,
  '10': 9.25,
  '12': 11.25,
};

/**
 * Board foot calculator for lumber pricing.
 *
 * BF per piece = (T × W × L) ÷ 144   (all dimensions in inches)
 * Total BF = BF per piece × Quantity
 * Total Cost = Total BF × Price per BF
 *
 * Source: NHLA grading rules, ALSC PS 20-20.
 */
export function calculateBoardFoot(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const rawThickness = Number(inputs.thickness) || 1;
  const rawWidth = Number(inputs.width) || 6;
  const rawLength = Number(inputs.length) || 8;
  const lengthUnit = String(inputs.lengthUnit || 'ft');
  const quantity = Math.max(1, Math.round(Number(inputs.quantity) || 1));
  const pricePerBdFt = Math.max(0, Number(inputs.pricePerBdFt) || 0);
  const useNominal = inputs.useNominal === true || inputs.useNominal === 'true';

  // ── Apply nominal-to-actual conversion if needed ──────
  let thicknessIn = rawThickness;
  let widthIn = rawWidth;

  if (useNominal) {
    const thicknessKey = String(Math.round(rawThickness));
    const widthKey = String(Math.round(rawWidth));
    thicknessIn = nominalToActual[thicknessKey] ?? rawThickness;
    widthIn = nominalToActual[widthKey] ?? rawWidth;
  }

  // ── Convert length to inches ──────────────────────────
  let lengthIn: number;
  if (lengthUnit === 'ft') {
    lengthIn = rawLength * 12;
  } else {
    lengthIn = rawLength;
  }

  // ── Calculate board feet ──────────────────────────────
  // BF = (T × W × L) ÷ 144 (all in inches)
  // Note: Board foot pricing uses NOMINAL dimensions by industry convention
  // for softwood. We calculate with the dimensions as-entered and let the
  // user toggle nominal/actual.
  const nominalBfPerPiece = (rawThickness * rawWidth * lengthIn) / 144;
  const boardFeetPerPiece = parseFloat(nominalBfPerPiece.toFixed(4));

  const totalBoardFeet = boardFeetPerPiece * quantity;
  const totalCost = totalBoardFeet * pricePerBdFt;

  // ── Cubic feet (actual dimensions) ────────────────────
  const cubicInches = thicknessIn * widthIn * lengthIn * quantity;
  const cubicFeet = cubicInches / 1728; // 12³ = 1728

  const pieceBreakdown = [
    { label: 'Thickness (in)', value: useNominal ? rawThickness : thicknessIn },
    { label: 'Width (in)', value: useNominal ? rawWidth : widthIn },
    { label: 'Length (in)', value: parseFloat(lengthIn.toFixed(2)) },
    { label: 'BF per Piece', value: boardFeetPerPiece },
    { label: 'Quantity', value: quantity },
    { label: 'Total Board Feet', value: parseFloat(totalBoardFeet.toFixed(2)) },
  ];

  return {
    boardFeetPerPiece,
    totalBoardFeet: parseFloat(totalBoardFeet.toFixed(2)),
    totalCost: parseFloat(totalCost.toFixed(2)),
    cubicFeet: parseFloat(cubicFeet.toFixed(4)),
    pieceBreakdown,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'board-foot': calculateBoardFoot,
};
