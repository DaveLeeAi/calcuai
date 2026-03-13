/**
 * Pressure Converter — convert between units of pressure
 *
 * Core formula:
 *   valueInPascal = value × fromFactor
 *   convertedValue = valueInPascal / toFactor
 *   conversionRate = fromFactor / toFactor
 *   inverseRate = toFactor / fromFactor
 *
 * Base unit: pascal (Pa)
 * Factors: 1 kPa = 1,000 Pa, 1 bar = 100,000 Pa,
 *          1 atm = 101,325 Pa, 1 psi = 6,894.757 Pa,
 *          1 mmHg = 133.3224 Pa, 1 inHg = 3,386.389 Pa.
 *
 * Source: NIST Special Publication 330, The International System of Units
 * (SI), 2019 Edition — defines the pascal (Pa = N/m^2) as the SI derived
 * unit of pressure and provides conversion factors; NIST SP 811.
 */

const PRESSURE_TO_PASCAL: Record<string, number> = {
  pascal: 1,
  kilopascal: 1000,
  bar: 100000,
  atmosphere: 101325,
  psi: 6894.757,
  mmhg: 133.3224,
  inhg: 3386.389,
};

/**
 * Converts a pressure value from one unit to another.
 *
 * convertedValue = value × (fromFactor / toFactor)
 *
 * @param inputs - Record with value, fromUnit, toUnit
 * @returns Record with convertedValue, conversionDisplay, conversionRate,
 *          inverseRate, conversionTable
 */
export function calculatePressureConvert(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs
  const value = Math.max(0, Number(inputs.value) || 0);
  const fromUnit = String(inputs.fromUnit || 'atmosphere');
  const toUnit = String(inputs.toUnit || 'psi');

  const fromFactor = PRESSURE_TO_PASCAL[fromUnit] || 1;
  const toFactor = PRESSURE_TO_PASCAL[toUnit] || 1;

  // 2. Core conversion
  const valueInPascal = value * fromFactor;
  const convertedValue = parseFloat((valueInPascal / toFactor).toFixed(6));

  // 3. Rates
  const conversionRate = parseFloat((fromFactor / toFactor).toFixed(6));
  const inverseRate = parseFloat((toFactor / fromFactor).toFixed(6));

  // 4. Display string
  const conversionDisplay = `${value} ${fromUnit} = ${convertedValue} ${toUnit}`;

  // 5. Conversion table: show value in all units
  const conversionTable = Object.entries(PRESSURE_TO_PASCAL).map(([unit, factor]) => ({
    label: unit.charAt(0).toUpperCase() + unit.slice(1),
    value: parseFloat((valueInPascal / factor).toFixed(6)),
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
  'pressure-convert': calculatePressureConvert,
};
