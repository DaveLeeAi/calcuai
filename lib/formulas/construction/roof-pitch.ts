/**
 * Roof Pitch Calculator Formula Module
 *
 * Calculates roof pitch from rise and run measurements, or from an angle.
 *
 * Pitch (X:12):
 *   pitch = (rise / run) × 12
 *
 * Angle (degrees):
 *   angleDegrees = atan(rise / run) × (180 / π)
 *
 * Percent grade:
 *   percentGrade = (rise / run) × 100
 *
 * Roof area multiplier:
 *   roofMultiplier = 1 / cos(angle)
 *
 * Angle mode (reverse):
 *   rise = tan(angle × π / 180) × 12
 *   run = 12
 *
 * Source: International Residential Code (IRC) — Roof Slope Requirements.
 */

export interface RoofPitchInput {
  rise: number;             // inches (or cm via unit-pair)
  run: number;              // inches (or ft/cm/m via unit-pair)
  calculationMode: string;  // 'rise-run' | 'angle'
  roofAngle: number;        // degrees — used in angle mode
}

export interface RoofPitchOutput {
  pitch: string;
  pitchRatio: number;
  angleDegrees: number;
  percentGrade: number;
  pitchDescription: string;
  roofMultiplier: number;
  walkable: string;
  commonUse: string;
  pitchFraction: string;
  summary: { label: string; value: string | number }[];
}

/**
 * Get a descriptive name for the pitch based on angle in degrees.
 */
function getPitchDescription(angleDeg: number): string {
  if (angleDeg <= 0) return 'Flat';
  if (angleDeg < 15) return 'Low Slope';
  if (angleDeg < 25) return 'Moderate Slope';
  if (angleDeg < 35) return 'Standard Slope';
  if (angleDeg < 45) return 'Steep Slope';
  return 'Very Steep';
}

/**
 * Get common use description based on pitch (X:12).
 */
function getCommonUse(pitchPer12: number): string {
  if (pitchPer12 <= 0) return 'Flat or nearly flat — commercial membranes, built-up roofing';
  if (pitchPer12 < 2) return 'Low slope — modified bitumen, TPO, EPDM membranes';
  if (pitchPer12 < 4) return 'Low-to-moderate — minimum slope for most shingles';
  if (pitchPer12 < 7) return 'Standard residential — asphalt shingles, metal panels';
  if (pitchPer12 < 10) return 'Steep residential — architectural shingles, cedar shakes, slate';
  if (pitchPer12 < 13) return 'Very steep — decorative/architectural, requires special fastening';
  return 'Extreme pitch — steeple, tower, or specialty applications';
}

/**
 * Get the closest common fraction representation of the pitch ratio.
 */
function getPitchFraction(ratio: number): string {
  if (ratio <= 0) return '0';
  const fractions: [number, string][] = [
    [1 / 12, '1/12'],
    [1 / 6, '1/6'],
    [1 / 4, '1/4'],
    [1 / 3, '1/3'],
    [5 / 12, '5/12'],
    [1 / 2, '1/2'],
    [7 / 12, '7/12'],
    [2 / 3, '2/3'],
    [3 / 4, '3/4'],
    [5 / 6, '5/6'],
    [1, '1'],
    [1.5, '3/2'],
    [2, '2'],
  ];

  let closest = fractions[0];
  let minDiff = Math.abs(ratio - fractions[0][0]);

  for (const frac of fractions) {
    const diff = Math.abs(ratio - frac[0]);
    if (diff < minDiff) {
      minDiff = diff;
      closest = frac;
    }
  }
  return closest[1];
}

/**
 * Roof pitch calculator — pitch ratio, angle, grade, and roof area multiplier.
 *
 * pitch = (rise / run) × 12
 * angleDegrees = atan(rise / run) × (180 / π)
 * roofMultiplier = 1 / cos(angle)
 *
 * Source: International Residential Code (IRC).
 */
export function calculateRoofPitch(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const calculationMode = String(inputs.calculationMode || 'rise-run');
  let rise = Number(inputs.rise) || 0;
  let run = Number(inputs.run) || 0;
  const roofAngle = Number(inputs.roofAngle) || 0;

  // ── Angle mode: derive rise/run from angle ────────────
  if (calculationMode === 'angle') {
    const clampedAngle = Math.min(Math.max(roofAngle, 0), 89);
    if (clampedAngle <= 0) {
      rise = 0;
      run = 12;
    } else {
      const radians = clampedAngle * (Math.PI / 180);
      rise = parseFloat((Math.tan(radians) * 12).toFixed(4));
      run = 12;
    }
  }

  // ── Guard: zero/negative run or both zero ─────────────
  if (run <= 0) {
    // Special case: if rise > 0 but run is 0, treat as vertical (90°)
    if (rise > 0) {
      return {
        pitch: 'Vertical',
        pitchRatio: Infinity,
        angleDegrees: 90,
        percentGrade: Infinity,
        pitchDescription: 'Very Steep',
        roofMultiplier: Infinity,
        walkable: 'No — requires safety equipment',
        commonUse: 'Vertical wall — not a roof slope',
        pitchFraction: 'Vertical',
        summary: [
          { label: 'Pitch', value: 'Vertical (90°)' },
          { label: 'Angle', value: '90°' },
          { label: 'Description', value: 'Vertical — not a roofable slope' },
        ],
      };
    }
    // Both zero
    return {
      pitch: '0:12',
      pitchRatio: 0,
      angleDegrees: 0,
      percentGrade: 0,
      pitchDescription: 'Flat',
      roofMultiplier: 1,
      walkable: 'Yes — generally walkable',
      commonUse: 'Flat or nearly flat — commercial membranes, built-up roofing',
      pitchFraction: '0',
      summary: [],
    };
  }

  // ── Guard: negative rise → treat as 0 ────────────────
  if (rise < 0) {
    rise = 0;
  }

  // ── Calculations ──────────────────────────────────────
  const pitchRatio = parseFloat((rise / run).toFixed(4));
  const pitchPer12 = parseFloat(((rise / run) * 12).toFixed(2));
  const angleRadians = Math.atan(rise / run);
  const angleDegrees = parseFloat((angleRadians * (180 / Math.PI)).toFixed(1));
  const percentGrade = parseFloat(((rise / run) * 100).toFixed(1));

  // Roof area multiplier: 1 / cos(angle)
  const cosAngle = Math.cos(angleRadians);
  const roofMultiplier = cosAngle > 0
    ? parseFloat((1 / cosAngle).toFixed(3))
    : Infinity;

  const pitchDescription = getPitchDescription(angleDegrees);
  const walkable = angleDegrees < 35
    ? 'Yes — generally walkable'
    : 'No — requires safety equipment';
  const commonUse = getCommonUse(pitchPer12);
  const pitchFraction = getPitchFraction(pitchRatio);

  // Format pitch string
  const pitch = pitchPer12.toFixed(0) + ':12';

  // ── Summary breakdown ─────────────────────────────────
  const summary: { label: string; value: string | number }[] = [
    { label: 'Roof Pitch', value: pitch },
    { label: 'Pitch Ratio', value: pitchRatio },
    { label: 'Angle', value: angleDegrees + '°' },
    { label: 'Percent Grade', value: percentGrade + '%' },
    { label: 'Roof Multiplier', value: roofMultiplier },
    { label: 'Pitch Category', value: pitchDescription },
    { label: 'Walkable', value: walkable },
    { label: 'Common Use', value: commonUse },
  ];

  return {
    pitch,
    pitchRatio,
    angleDegrees,
    percentGrade,
    pitchDescription,
    roofMultiplier,
    walkable,
    commonUse,
    pitchFraction,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'roof-pitch': calculateRoofPitch,
};
