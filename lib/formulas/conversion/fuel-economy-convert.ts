/**
 * Fuel Economy Converter — convert between units of fuel economy
 *
 * Core formula:
 *   For standard units: valueInMpgUs = value × fromFactor
 *   convertedValue = valueInMpgUs / toFactor
 *
 *   Special handling for liters-per-100km (inverse unit):
 *   - FROM L/100km: mpgUs = 235.215 / value
 *   - TO L/100km: result = 235.215 / mpgUs
 *
 * Base unit: miles per gallon (US)
 * Factors (to mpg-us): mpg-us = 1, mpg-imperial = 1.20095,
 *   km-per-liter = 2.352145 (1 km/L = 2.352145 mpg-us)
 *   liters-per-100km: inverse (235.215 / mpg-us)
 *
 * Source: US EPA Fuel Economy Guide, 2024. Conversion factors from
 * NIST Handbook 44 and the Federal Register fuel economy standards.
 */

/** Factors to convert TO mpg-us. L/100km handled separately.
 *  1 mpg-imperial = 0.832674 mpg-us (imperial gallon is larger)
 *  1 km/L = 2.352145 mpg-us
 */
const FUEL_ECONOMY_TO_MPG_US: Record<string, number> = {
  'mpg-us': 1,
  'mpg-imperial': 0.832674,
  'km-per-liter': 2.352145,
};

const INVERSE_UNIT = 'liters-per-100km';
const L100KM_CONSTANT = 235.215;

/**
 * Converts a fuel economy value from one unit to another.
 *
 * Handles the special inverse relationship of liters-per-100km
 * where lower values mean better fuel economy.
 *
 * @param inputs - Record with value, fromUnit, toUnit
 * @returns Record with convertedValue, conversionDisplay, conversionRate,
 *          inverseRate, conversionTable
 */
export function calculateFuelEconomyConvert(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs
  const value = Math.max(0, Number(inputs.value) || 0);
  const fromUnit = String(inputs.fromUnit || 'mpg-us');
  const toUnit = String(inputs.toUnit || 'km-per-liter');

  // 2. Convert input to mpg-us (base unit)
  let valueInMpgUs: number;
  if (fromUnit === INVERSE_UNIT) {
    // L/100km is inverse: higher L/100km = lower mpg
    valueInMpgUs = value > 0 ? L100KM_CONSTANT / value : 0;
  } else {
    const fromFactor = FUEL_ECONOMY_TO_MPG_US[fromUnit] || 1;
    valueInMpgUs = value * fromFactor;
  }

  // 3. Convert from mpg-us to target unit
  let convertedValue: number;
  if (toUnit === INVERSE_UNIT) {
    convertedValue = valueInMpgUs > 0 ? parseFloat((L100KM_CONSTANT / valueInMpgUs).toFixed(6)) : 0;
  } else {
    const toFactor = FUEL_ECONOMY_TO_MPG_US[toUnit] || 1;
    convertedValue = parseFloat((valueInMpgUs / toFactor).toFixed(6));
  }

  // 4. Conversion rate (meaningful for non-inverse pairs only)
  let conversionRate: number;
  let inverseRate: number;
  if (fromUnit === INVERSE_UNIT || toUnit === INVERSE_UNIT) {
    // For inverse units, rate is not a simple multiplier — show effective rate at this value
    conversionRate = value > 0 ? parseFloat((convertedValue / value).toFixed(6)) : 0;
    inverseRate = convertedValue > 0 ? parseFloat((value / convertedValue).toFixed(6)) : 0;
  } else {
    const fromFactor = FUEL_ECONOMY_TO_MPG_US[fromUnit] || 1;
    const toFactor = FUEL_ECONOMY_TO_MPG_US[toUnit] || 1;
    conversionRate = parseFloat((fromFactor / toFactor).toFixed(6));
    inverseRate = parseFloat((toFactor / fromFactor).toFixed(6));
  }

  // 5. Display string
  const conversionDisplay = `${value} ${fromUnit} = ${convertedValue} ${toUnit}`;

  // 6. Conversion table: show value in all units
  const conversionTable: Array<{ label: string; value: number }> = [];

  // Standard units
  for (const [unit, factor] of Object.entries(FUEL_ECONOMY_TO_MPG_US)) {
    conversionTable.push({
      label: unit,
      value: parseFloat((valueInMpgUs / factor).toFixed(6)),
    });
  }

  // L/100km (inverse)
  conversionTable.push({
    label: INVERSE_UNIT,
    value: valueInMpgUs > 0 ? parseFloat((L100KM_CONSTANT / valueInMpgUs).toFixed(6)) : 0,
  });

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
  'fuel-economy-convert': calculateFuelEconomyConvert,
};
