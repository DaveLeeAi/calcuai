/**
 * Rafter Length Calculator Formula Module
 *
 * Calculates common rafter length from building span and roof pitch using
 * the Pythagorean theorem.
 *
 * Run (half span minus half ridge board):
 *   run = (buildingSpan / 2) - (ridgeBoard / 2 / 12)
 *
 * Rise:
 *   rise = run × (roofPitch / 12)
 *
 * Rafter length (hypotenuse):
 *   rafterLength = √(run² + rise²)
 *
 * Total length (rafter + overhang):
 *   totalLength = rafterLength + overhangFt
 *
 * Plumb cut angle:
 *   rafterAngle = atan(rise / run) × (180 / π)
 *
 * Seat cut angle:
 *   seatCutAngle = 90 - rafterAngle
 *
 * Source: American Wood Council — Span Tables for Joists and Rafters.
 */

export interface RafterLengthInput {
  buildingSpan: number;   // feet (or meters via unit-pair)
  roofPitch: string;      // pitch per 12 inches of run (e.g. "6")
  overhang: number;       // inches (or ft/cm via unit-pair)
  ridgeBoard: number;     // inches (thickness of ridge board)
}

export interface RafterLengthOutput {
  run: number;
  rise: number;
  rafterLength: number;
  totalLength: number;
  rafterAngle: number;
  seatCutAngle: number;
  birdsmouth: string;
  commonLumber: string;
  pitchAngle: number;
  summary: { label: string; value: string | number }[];
}

/**
 * Standard lumber lengths in feet.
 */
const STANDARD_LUMBER_LENGTHS = [8, 10, 12, 14, 16, 18, 20, 22, 24];

/**
 * Round up to the nearest standard lumber length.
 */
function getRecommendedLumber(lengthFt: number): string {
  for (const size of STANDARD_LUMBER_LENGTHS) {
    if (lengthFt <= size) {
      return size + '-foot';
    }
  }
  return STANDARD_LUMBER_LENGTHS[STANDARD_LUMBER_LENGTHS.length - 1] + '-foot (may require special order)';
}

/**
 * Get birdsmouth cut description based on pitch and rafter depth.
 */
function getBirdsmouthDescription(pitchPer12: number): string {
  if (pitchPer12 <= 0) return 'No birdsmouth needed for flat rafters';
  if (pitchPer12 <= 4) return 'Shallow birdsmouth — typical seat cut depth 1.5" to 2.5" on a 2×6 rafter';
  if (pitchPer12 <= 8) return 'Standard birdsmouth — typical seat cut depth 2.5" to 3.5" on a 2×8 or 2×10 rafter';
  return 'Deep birdsmouth — typical seat cut depth 3" to 4" on a 2×10 or 2×12 rafter; do not exceed 1/3 of rafter depth';
}

/**
 * Rafter length calculator — rafter length, cut angles, and lumber size.
 *
 * rafterLength = √(run² + rise²)
 * totalLength = rafterLength + overhang
 *
 * Source: American Wood Council.
 */
export function calculateRafterLength(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const buildingSpan = Number(inputs.buildingSpan) || 0;
  const roofPitch = Number(inputs.roofPitch) || 0;
  const overhang = Number(inputs.overhang) || 0;
  const ridgeBoard = inputs.ridgeBoard !== undefined && inputs.ridgeBoard !== null && inputs.ridgeBoard !== ''
    ? Number(inputs.ridgeBoard)
    : 1.5;

  // ── Guard: zero/negative span ─────────────────────────
  if (buildingSpan <= 0) {
    return {
      run: 0,
      rise: 0,
      rafterLength: 0,
      totalLength: 0,
      rafterAngle: 0,
      seatCutAngle: 90,
      birdsmouth: '',
      commonLumber: '',
      pitchAngle: 0,
      summary: [],
    };
  }

  // ── Run = half span minus half ridge board ────────────
  // ridgeBoard is in inches, convert to feet for subtraction
  const halfRidgeFt = (ridgeBoard / 2) / 12;
  const run = parseFloat(Math.max(0, (buildingSpan / 2) - halfRidgeFt).toFixed(4));

  // ── Rise from pitch ───────────────────────────────────
  const rise = parseFloat((run * (roofPitch / 12)).toFixed(4));

  // ── Rafter length (Pythagorean theorem) ───────────────
  const rafterLength = parseFloat(Math.sqrt(run * run + rise * rise).toFixed(2));

  // ── Overhang in feet ──────────────────────────────────
  const overhangFt = overhang / 12;

  // ── Total length (rafter + overhang) ──────────────────
  const totalLength = parseFloat((rafterLength + overhangFt).toFixed(2));

  // ── Cut angles ────────────────────────────────────────
  let rafterAngle = 0;
  let seatCutAngle = 90;
  let pitchAngle = 0;

  if (run > 0 && rise > 0) {
    const radians = Math.atan(rise / run);
    rafterAngle = parseFloat((radians * (180 / Math.PI)).toFixed(1));
    seatCutAngle = parseFloat((90 - rafterAngle).toFixed(1));
    pitchAngle = rafterAngle;
  } else if (run > 0 && rise <= 0) {
    // Flat pitch — rafter is horizontal
    rafterAngle = 0;
    seatCutAngle = 90;
    pitchAngle = 0;
  }

  // ── Birdsmouth description ────────────────────────────
  const birdsmouth = getBirdsmouthDescription(roofPitch);

  // ── Recommended lumber size ───────────────────────────
  const commonLumber = totalLength > 0 ? getRecommendedLumber(totalLength) : '';

  // ── Summary breakdown ─────────────────────────────────
  const summary: { label: string; value: string | number }[] = [
    { label: 'Building Span', value: buildingSpan + ' ft' },
    { label: 'Roof Pitch', value: roofPitch + ':12' },
    { label: 'Run (half span)', value: run.toFixed(2) + ' ft' },
    { label: 'Rise', value: rise.toFixed(2) + ' ft' },
    { label: 'Rafter Length', value: rafterLength.toFixed(2) + ' ft' },
    { label: 'Overhang', value: overhang + ' in (' + overhangFt.toFixed(2) + ' ft)' },
    { label: 'Total Rafter Length', value: totalLength.toFixed(2) + ' ft' },
    { label: 'Plumb Cut Angle', value: rafterAngle + '°' },
    { label: 'Seat Cut Angle', value: seatCutAngle + '°' },
    { label: 'Recommended Lumber', value: commonLumber },
    { label: 'Birdsmouth Cut', value: birdsmouth },
  ];

  return {
    run,
    rise,
    rafterLength,
    totalLength,
    rafterAngle,
    seatCutAngle,
    birdsmouth,
    commonLumber,
    pitchAngle,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'rafter-length': calculateRafterLength,
};
