/**
 * Energy Converter — convert between units of energy
 *
 * Core formula:
 *   valueInJoule = value × fromFactor
 *   convertedValue = valueInJoule / toFactor
 *   conversionRate = fromFactor / toFactor
 *   inverseRate = toFactor / fromFactor
 *
 * Base unit: joule (J)
 * Factors: 1 kJ = 1,000 J, 1 cal = 4.184 J, 1 kcal = 4,184 J,
 *          1 Wh = 3,600 J, 1 kWh = 3,600,000 J, 1 BTU = 1,055.06 J,
 *          1 eV = 1.602176634e-19 J, 1 erg = 1e-7 J,
 *          1 ft·lbf = 1.355818 J.
 *
 * Source: NIST Special Publication 330, The International System of Units
 * (SI), 2019 Edition — defines the joule (J = kg·m²/s²) as the SI derived
 * unit of energy and provides conversion factors.
 */

const ENERGY_TO_JOULE: Record<string, number> = {
  joule: 1,
  kilojoule: 1000,
  calorie: 4.184,
  kilocalorie: 4184,
  'watt-hour': 3600,
  'kilowatt-hour': 3600000,
  btu: 1055.06,
  electronvolt: 1.602176634e-19,
  erg: 1e-7,
  'foot-pound': 1.355818,
};

/**
 * Converts an energy value from one unit to another.
 *
 * convertedValue = value × (fromFactor / toFactor)
 *
 * @param inputs - Record with value, fromUnit, toUnit
 * @returns Record with convertedValue, conversionDisplay, conversionRate,
 *          inverseRate, conversionTable
 */
export function calculateEnergyConvert(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs
  const value = Math.max(0, Number(inputs.value) || 0);
  const fromUnit = String(inputs.fromUnit || 'joule');
  const toUnit = String(inputs.toUnit || 'kilocalorie');

  const fromFactor = ENERGY_TO_JOULE[fromUnit] || 1;
  const toFactor = ENERGY_TO_JOULE[toUnit] || 1;

  // 2. Core conversion
  const valueInJoule = value * fromFactor;
  const convertedValue = parseFloat((valueInJoule / toFactor).toFixed(6));

  // 3. Rates
  const conversionRate = parseFloat((fromFactor / toFactor).toFixed(6));
  const inverseRate = parseFloat((toFactor / fromFactor).toFixed(6));

  // 4. Display string
  const conversionDisplay = `${value} ${fromUnit} = ${convertedValue} ${toUnit}`;

  // 5. Conversion table: show value in all units
  const conversionTable = Object.entries(ENERGY_TO_JOULE).map(([unit, factor]) => ({
    label: unit.charAt(0).toUpperCase() + unit.slice(1),
    value: parseFloat((valueInJoule / factor).toFixed(6)),
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
  'energy-convert': calculateEnergyConvert,
};
