/**
 * Angle Converter — convert between units of angular measurement
 *
 * Core formula:
 *   valueInDegrees = value × fromFactor
 *   convertedValue = valueInDegrees / toFactor
 *   conversionRate = fromFactor / toFactor
 *   inverseRate = toFactor / fromFactor
 *
 * Base unit: degrees
 * Factors: 1 radian = 180/pi degrees, 1 gradian = 0.9 degrees,
 *          1 turn = 360 degrees, 1 arcminute = 1/60 degree,
 *          1 arcsecond = 1/3600 degree.
 *
 * Source: NIST Special Publication 330, The International System of Units
 * (SI), 2019 Edition — defines the radian as the SI derived unit of
 * plane angle and provides conversion factors.
 */

const ANGLE_TO_DEGREES: Record<string, number> = {
  degrees: 1,
  radians: 180 / Math.PI,   // ~57.29577951
  gradians: 0.9,             // 1 gradian = 0.9 degrees
  turns: 360,                // 1 turn = 360 degrees
  arcminutes: 1 / 60,        // 1 arcminute = 1/60 degree
  arcseconds: 1 / 3600,      // 1 arcsecond = 1/3600 degree
};

/**
 * Converts an angle value from one unit to another.
 *
 * convertedValue = value × (fromFactor / toFactor)
 *
 * @param inputs - Record with value, fromUnit, toUnit
 * @returns Record with convertedValue, conversionDisplay, conversionRate,
 *          inverseRate, conversionTable
 */
export function calculateAngleConvert(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs
  const value = Math.max(0, Number(inputs.value) || 0);
  const fromUnit = String(inputs.fromUnit || 'degrees');
  const toUnit = String(inputs.toUnit || 'radians');

  const fromFactor = ANGLE_TO_DEGREES[fromUnit] || 1;
  const toFactor = ANGLE_TO_DEGREES[toUnit] || 1;

  // 2. Core conversion
  const valueInDegrees = value * fromFactor;
  const convertedValue = parseFloat((valueInDegrees / toFactor).toFixed(6));

  // 3. Rates
  const conversionRate = parseFloat((fromFactor / toFactor).toFixed(6));
  const inverseRate = parseFloat((toFactor / fromFactor).toFixed(6));

  // 4. Display string
  const conversionDisplay = `${value} ${fromUnit} = ${convertedValue} ${toUnit}`;

  // 5. Conversion table: show value in all units
  const conversionTable = Object.entries(ANGLE_TO_DEGREES).map(([unit, factor]) => ({
    label: unit.charAt(0).toUpperCase() + unit.slice(1),
    value: parseFloat((valueInDegrees / factor).toFixed(6)),
  }));

  return {
    convertedValue,
    fromUnit,
    toUnit,
    conversionRate,
    inverseRate,
    conversionDisplay,
    conversionTable,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'angle-convert': calculateAngleConvert,
};
