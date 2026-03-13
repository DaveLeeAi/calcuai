/**
 * Time Converter — convert between units of time
 *
 * Core formula:
 *   valueInSeconds = value × fromFactor
 *   convertedValue = valueInSeconds / toFactor
 *   conversionRate = fromFactor / toFactor
 *   inverseRate = toFactor / fromFactor
 *
 * Base unit: seconds
 * Factors: 1 minute = 60 s, 1 hour = 3,600 s, 1 day = 86,400 s,
 *          1 week = 604,800 s, 1 month = 2,629,746 s (30.44 days avg),
 *          1 year = 31,557,600 s (365.25 days).
 *
 * Source: NIST Special Publication 811, Guide for the Use of the
 * International System of Units (SI), 2008 Edition — defines the second
 * as the SI base unit of time and provides conversion factors.
 */

const TIME_TO_SECONDS: Record<string, number> = {
  seconds: 1,
  minutes: 60,
  hours: 3600,
  days: 86400,
  weeks: 604800,
  months: 2629746, // 30.44 days average (365.25 / 12)
  years: 31557600, // 365.25 days (Julian year)
};

/**
 * Converts a time value from one unit to another.
 *
 * convertedValue = value × (fromFactor / toFactor)
 *
 * @param inputs - Record with value, fromUnit, toUnit
 * @returns Record with convertedValue, conversionDisplay, conversionRate,
 *          inverseRate, conversionTable
 */
export function calculateTimeConvert(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs
  const value = Math.max(0, Number(inputs.value) || 0);
  const fromUnit = String(inputs.fromUnit || 'hours');
  const toUnit = String(inputs.toUnit || 'minutes');

  const fromFactor = TIME_TO_SECONDS[fromUnit] || 1;
  const toFactor = TIME_TO_SECONDS[toUnit] || 1;

  // 2. Core conversion
  const valueInSeconds = value * fromFactor;
  const convertedValue = parseFloat((valueInSeconds / toFactor).toFixed(6));

  // 3. Rates
  const conversionRate = parseFloat((fromFactor / toFactor).toFixed(6));
  const inverseRate = parseFloat((toFactor / fromFactor).toFixed(6));

  // 4. Display string
  const conversionDisplay = `${value} ${fromUnit} = ${convertedValue} ${toUnit}`;

  // 5. Conversion table: show value in all units
  const conversionTable = Object.entries(TIME_TO_SECONDS).map(([unit, factor]) => ({
    label: unit.charAt(0).toUpperCase() + unit.slice(1),
    value: parseFloat((valueInSeconds / factor).toFixed(6)),
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
  'time-convert': calculateTimeConvert,
};
