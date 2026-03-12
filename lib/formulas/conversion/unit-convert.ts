/**
 * Unit Converter — Universal unit conversion module
 *
 * Pattern: All conversion units are defined relative to a "base unit" per category.
 *   - Length: base unit = meter
 *   - Weight: base unit = kilogram
 *   - Area: base unit = square meter
 *   - Volume: base unit = liter
 *   - Data Storage: base unit = byte
 *   - Temperature: base unit = Celsius (uses function-based conversion, not multiplicative)
 *
 * Formula (multiplicative categories):
 *   result = value × (fromFactor / toFactor)
 *
 * Where fromFactor converts the input to base unit, and toFactor converts
 * base unit to target unit.
 *
 * Temperature uses functional conversion:
 *   result = toUnit.fromBase(fromUnit.toBase(value))
 *
 * Source: National Institute of Standards and Technology (NIST) — "The International
 * System of Units (SI)" Special Publication 330 (2019 Edition).
 */

// ═══════════════════════════════════════════════════════
// Unit definition: each unit maps to its conversion factor relative to base
// ═══════════════════════════════════════════════════════

export interface UnitDefinition {
  id: string;
  name: string;
  abbreviation: string;
  toBase: number; // multiply input by this to get base unit
  category: string;
}

export interface TemperatureUnit {
  id: string;
  name: string;
  abbreviation: string;
  toBase: (value: number) => number;   // converts to Celsius
  fromBase: (value: number) => number; // converts from Celsius
  category: string;
}

// ═══════════════════════════════════════════════════════
// Length units — base unit: meters
// ═══════════════════════════════════════════════════════

export const LENGTH_UNITS: UnitDefinition[] = [
  // Metric
  { id: 'kilometer', name: 'Kilometer', abbreviation: 'km', toBase: 1000, category: 'metric' },
  { id: 'meter', name: 'Meter', abbreviation: 'm', toBase: 1, category: 'metric' },
  { id: 'centimeter', name: 'Centimeter', abbreviation: 'cm', toBase: 0.01, category: 'metric' },
  { id: 'millimeter', name: 'Millimeter', abbreviation: 'mm', toBase: 0.001, category: 'metric' },
  { id: 'micrometer', name: 'Micrometer', abbreviation: '\u00b5m', toBase: 0.000001, category: 'metric' },
  { id: 'nanometer', name: 'Nanometer', abbreviation: 'nm', toBase: 0.000000001, category: 'metric' },

  // Imperial / US
  { id: 'mile', name: 'Mile', abbreviation: 'mi', toBase: 1609.344, category: 'imperial' },
  { id: 'yard', name: 'Yard', abbreviation: 'yd', toBase: 0.9144, category: 'imperial' },
  { id: 'foot', name: 'Foot', abbreviation: 'ft', toBase: 0.3048, category: 'imperial' },
  { id: 'inch', name: 'Inch', abbreviation: 'in', toBase: 0.0254, category: 'imperial' },

  // Nautical / Astronomy
  { id: 'nautical-mile', name: 'Nautical Mile', abbreviation: 'nmi', toBase: 1852, category: 'other' },
  { id: 'light-year', name: 'Light Year', abbreviation: 'ly', toBase: 9.461e15, category: 'other' },
];

// ═══════════════════════════════════════════════════════
// Weight units — base unit: kilogram
// ═══════════════════════════════════════════════════════

export const WEIGHT_UNITS: UnitDefinition[] = [
  // Metric
  { id: 'kilogram', name: 'Kilogram', abbreviation: 'kg', toBase: 1, category: 'metric' },
  { id: 'gram', name: 'Gram', abbreviation: 'g', toBase: 0.001, category: 'metric' },
  { id: 'milligram', name: 'Milligram', abbreviation: 'mg', toBase: 0.000001, category: 'metric' },
  { id: 'metric-ton', name: 'Metric Ton', abbreviation: 't', toBase: 1000, category: 'metric' },

  // Imperial / US
  { id: 'pound', name: 'Pound', abbreviation: 'lb', toBase: 0.45359237, category: 'imperial' },
  { id: 'ounce', name: 'Ounce', abbreviation: 'oz', toBase: 0.028349523125, category: 'imperial' },
  { id: 'stone', name: 'Stone', abbreviation: 'st', toBase: 6.35029318, category: 'imperial' },
  { id: 'short-ton', name: 'Short Ton', abbreviation: 'US ton', toBase: 907.18474, category: 'imperial' },
  { id: 'long-ton', name: 'Long Ton', abbreviation: 'Imperial ton', toBase: 1016.0469088, category: 'imperial' },
];

// ═══════════════════════════════════════════════════════
// Area units — base unit: square meter
// ═══════════════════════════════════════════════════════

export const AREA_UNITS: UnitDefinition[] = [
  // Metric
  { id: 'square-meter', name: 'Square Meter', abbreviation: 'm²', toBase: 1, category: 'metric' },
  { id: 'square-kilometer', name: 'Square Kilometer', abbreviation: 'km²', toBase: 1000000, category: 'metric' },
  { id: 'square-centimeter', name: 'Square Centimeter', abbreviation: 'cm²', toBase: 0.0001, category: 'metric' },
  { id: 'square-millimeter', name: 'Square Millimeter', abbreviation: 'mm²', toBase: 0.000001, category: 'metric' },
  { id: 'hectare', name: 'Hectare', abbreviation: 'ha', toBase: 10000, category: 'metric' },

  // Imperial / US
  { id: 'acre', name: 'Acre', abbreviation: 'ac', toBase: 4046.8564224, category: 'imperial' },
  { id: 'square-foot', name: 'Square Foot', abbreviation: 'ft²', toBase: 0.09290304, category: 'imperial' },
  { id: 'square-yard', name: 'Square Yard', abbreviation: 'yd²', toBase: 0.83612736, category: 'imperial' },
  { id: 'square-inch', name: 'Square Inch', abbreviation: 'in²', toBase: 0.00064516, category: 'imperial' },
  { id: 'square-mile', name: 'Square Mile', abbreviation: 'mi²', toBase: 2589988.110336, category: 'imperial' },
];

// ═══════════════════════════════════════════════════════
// Volume units — base unit: liter
// ═══════════════════════════════════════════════════════

export const VOLUME_UNITS: UnitDefinition[] = [
  // Metric
  { id: 'liter', name: 'Liter', abbreviation: 'L', toBase: 1, category: 'metric' },
  { id: 'milliliter', name: 'Milliliter', abbreviation: 'mL', toBase: 0.001, category: 'metric' },
  { id: 'cubic-meter', name: 'Cubic Meter', abbreviation: 'm³', toBase: 1000, category: 'metric' },
  { id: 'cubic-centimeter', name: 'Cubic Centimeter', abbreviation: 'cm³', toBase: 0.001, category: 'metric' },

  // US Customary
  { id: 'us-gallon', name: 'US Gallon', abbreviation: 'gal', toBase: 3.785411784, category: 'imperial' },
  { id: 'us-quart', name: 'US Quart', abbreviation: 'qt', toBase: 0.946352946, category: 'imperial' },
  { id: 'us-pint', name: 'US Pint', abbreviation: 'pt', toBase: 0.473176473, category: 'imperial' },
  { id: 'us-cup', name: 'US Cup', abbreviation: 'cup', toBase: 0.2365882365, category: 'imperial' },
  { id: 'us-fluid-ounce', name: 'US Fluid Ounce', abbreviation: 'fl oz', toBase: 0.0295735295625, category: 'imperial' },
  { id: 'tablespoon', name: 'Tablespoon', abbreviation: 'tbsp', toBase: 0.01478676478125, category: 'imperial' },
  { id: 'teaspoon', name: 'Teaspoon', abbreviation: 'tsp', toBase: 0.00492892159375, category: 'imperial' },

  // Imperial
  { id: 'imperial-gallon', name: 'Imperial Gallon', abbreviation: 'imp gal', toBase: 4.54609, category: 'imperial' },

  // Cubic
  { id: 'cubic-foot', name: 'Cubic Foot', abbreviation: 'ft³', toBase: 28.316846592, category: 'imperial' },
  { id: 'cubic-inch', name: 'Cubic Inch', abbreviation: 'in³', toBase: 0.016387064, category: 'imperial' },
];

// ═══════════════════════════════════════════════════════
// Data storage units — base unit: byte
// ═══════════════════════════════════════════════════════

export const DATA_STORAGE_UNITS: UnitDefinition[] = [
  // Decimal (SI) prefixes
  { id: 'byte', name: 'Byte', abbreviation: 'B', toBase: 1, category: 'decimal' },
  { id: 'kilobyte', name: 'Kilobyte', abbreviation: 'KB', toBase: 1000, category: 'decimal' },
  { id: 'megabyte', name: 'Megabyte', abbreviation: 'MB', toBase: 1000000, category: 'decimal' },
  { id: 'gigabyte', name: 'Gigabyte', abbreviation: 'GB', toBase: 1000000000, category: 'decimal' },
  { id: 'terabyte', name: 'Terabyte', abbreviation: 'TB', toBase: 1000000000000, category: 'decimal' },
  { id: 'petabyte', name: 'Petabyte', abbreviation: 'PB', toBase: 1000000000000000, category: 'decimal' },

  // Binary (IEC) prefixes
  { id: 'kibibyte', name: 'Kibibyte', abbreviation: 'KiB', toBase: 1024, category: 'binary' },
  { id: 'mebibyte', name: 'Mebibyte', abbreviation: 'MiB', toBase: 1048576, category: 'binary' },
  { id: 'gibibyte', name: 'Gibibyte', abbreviation: 'GiB', toBase: 1073741824, category: 'binary' },
  { id: 'tebibyte', name: 'Tebibyte', abbreviation: 'TiB', toBase: 1099511627776, category: 'binary' },

  // Sub-byte
  { id: 'bit', name: 'Bit', abbreviation: 'bit', toBase: 0.125, category: 'decimal' },
];

// ═══════════════════════════════════════════════════════
// Temperature units — base unit: Celsius (function-based)
// ═══════════════════════════════════════════════════════

export const TEMPERATURE_UNITS: TemperatureUnit[] = [
  {
    id: 'celsius', name: 'Celsius', abbreviation: '°C', category: 'metric',
    toBase: (v) => v,
    fromBase: (v) => v,
  },
  {
    id: 'fahrenheit', name: 'Fahrenheit', abbreviation: '°F', category: 'imperial',
    toBase: (v) => (v - 32) * 5 / 9,
    fromBase: (v) => v * 9 / 5 + 32,
  },
  {
    id: 'kelvin', name: 'Kelvin', abbreviation: 'K', category: 'scientific',
    toBase: (v) => v - 273.15,
    fromBase: (v) => v + 273.15,
  },
  {
    id: 'rankine', name: 'Rankine', abbreviation: '°R', category: 'imperial',
    toBase: (v) => (v - 491.67) * 5 / 9,
    fromBase: (v) => v * 9 / 5 + 491.67,
  },
];

// ═══════════════════════════════════════════════════════
// Unit category lookup — maps unit categories to their arrays
// ═══════════════════════════════════════════════════════

const UNIT_CATEGORIES: { name: string; units: UnitDefinition[]; isTemperature?: boolean; tempUnits?: TemperatureUnit[] }[] = [
  { name: 'length', units: LENGTH_UNITS },
  { name: 'weight', units: WEIGHT_UNITS },
  { name: 'area', units: AREA_UNITS },
  { name: 'volume', units: VOLUME_UNITS },
  { name: 'data', units: DATA_STORAGE_UNITS },
  { name: 'temperature', units: [], isTemperature: true, tempUnits: TEMPERATURE_UNITS },
];

// ═══════════════════════════════════════════════════════
// Interfaces
// ═══════════════════════════════════════════════════════

export interface ConversionResult {
  fromValue: number;
  fromUnit: string;
  fromUnitName: string;
  toValue: number;
  toUnit: string;
  toUnitName: string;
  conversionFactor: number;
  formula: string;
}

export interface ConversionTableRow {
  unit: string;
  abbreviation: string;
  value: number;
}

export interface UnitConvertOutput {
  result: number;
  conversionDetail: ConversionResult;
  conversionTable: ConversionTableRow[];
  summary: { label: string; value: number | string }[];
}

// ═══════════════════════════════════════════════════════
// Core conversion function (reusable for all unit types)
// ═══════════════════════════════════════════════════════

/**
 * Converts a value from one unit to another using base-unit intermediary.
 * result = value × (fromUnit.toBase / toUnit.toBase)
 */
export function convert(
  value: number,
  fromUnit: UnitDefinition,
  toUnit: UnitDefinition
): number {
  if (toUnit.toBase === 0) return 0;
  return value * (fromUnit.toBase / toUnit.toBase);
}

/**
 * Find a unit definition by its ID in a given unit array.
 */
export function findUnit(unitId: string, unitList: UnitDefinition[]): UnitDefinition | undefined {
  return unitList.find((u) => u.id === unitId);
}

// ═══════════════════════════════════════════════════════
// Temperature conversion helpers
// ═══════════════════════════════════════════════════════

/**
 * Find a temperature unit definition by its ID.
 */
export function findTemperatureUnit(unitId: string): TemperatureUnit | undefined {
  return TEMPERATURE_UNITS.find((u) => u.id === unitId);
}

/**
 * Converts a temperature value between two temperature units via Celsius intermediary.
 * result = toUnit.fromBase(fromUnit.toBase(value))
 */
export function convertTemperature(value: number, from: TemperatureUnit, to: TemperatureUnit): number {
  const celsius = from.toBase(value);
  return to.fromBase(celsius);
}

// ═══════════════════════════════════════════════════════
// Main function: Universal Unit Converter
// ═══════════════════════════════════════════════════════

/**
 * Converts a value between any two supported units across all categories:
 * length, weight, area, volume, data storage, and temperature.
 *
 * Auto-detects the unit category based on the fromUnit ID.
 * Temperature uses function-based conversion; all others use multiplicative conversion.
 *
 * Formula (multiplicative): result = value × (fromUnit.toBase / toUnit.toBase)
 * Formula (temperature):    result = toUnit.fromBase(fromUnit.toBase(value))
 *
 * @param inputs - Record with value, fromUnit (unit ID), toUnit (unit ID)
 * @returns Record with result, conversionDetail, conversionTable, summary
 */
export function calculateUnitConvert(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs
  const value = Number(inputs.value) || 0;
  const fromUnitId = String(inputs.fromUnit || 'meter');
  const toUnitId = String(inputs.toUnit || 'foot');

  // 2. Check if this is a temperature conversion
  const fromTempUnit = findTemperatureUnit(fromUnitId);
  if (fromTempUnit) {
    return calculateTemperatureConvert(value, fromUnitId, toUnitId, fromTempUnit);
  }

  // 3. Find which category the fromUnit belongs to
  let matchedUnits: UnitDefinition[] | undefined;
  for (const category of UNIT_CATEGORIES) {
    if (category.isTemperature) continue;
    if (findUnit(fromUnitId, category.units)) {
      matchedUnits = category.units;
      break;
    }
  }

  // Fall back to LENGTH_UNITS if unit not found in any category
  if (!matchedUnits) {
    matchedUnits = LENGTH_UNITS;
  }

  // 4. Find unit definitions within the matched category
  // When falling back to LENGTH_UNITS (unknown unit), default to meter→foot for backward compatibility
  const isLengthFallback = matchedUnits === LENGTH_UNITS && !findUnit(fromUnitId, matchedUnits);
  const fromUnitDef = findUnit(fromUnitId, matchedUnits)
    || (isLengthFallback ? findUnit('meter', LENGTH_UNITS)! : matchedUnits[0]);
  const toUnitDef = findUnit(toUnitId, matchedUnits)
    || (isLengthFallback ? findUnit('foot', LENGTH_UNITS)! : matchedUnits[1] || matchedUnits[0]);

  // 5. Perform conversion
  const result = convert(value, fromUnitDef, toUnitDef);

  // 6. Calculate conversion factor (1 fromUnit = X toUnit)
  const conversionFactor = convert(1, fromUnitDef, toUnitDef);

  // 7. Build conversion detail
  const conversionDetail: ConversionResult = {
    fromValue: value,
    fromUnit: fromUnitDef.id,
    fromUnitName: fromUnitDef.name,
    toValue: roundSmart(result),
    toUnit: toUnitDef.id,
    toUnitName: toUnitDef.name,
    conversionFactor: roundSmart(conversionFactor),
    formula: `${value} ${fromUnitDef.abbreviation} \u00d7 ${roundSmart(conversionFactor)} = ${roundSmart(result)} ${toUnitDef.abbreviation}`,
  };

  // 8. Build full conversion table (convert value to ALL units in the matched category)
  const conversionTable: ConversionTableRow[] = matchedUnits.map((unit) => ({
    unit: unit.name,
    abbreviation: unit.abbreviation,
    value: roundSmart(convert(value, fromUnitDef, unit)),
  }));

  // 9. Summary
  const summary: { label: string; value: number | string }[] = [
    { label: 'Input', value: `${value} ${fromUnitDef.abbreviation}` },
    { label: 'Result', value: `${roundSmart(result)} ${toUnitDef.abbreviation}` },
    { label: 'Factor', value: `1 ${fromUnitDef.abbreviation} = ${roundSmart(conversionFactor)} ${toUnitDef.abbreviation}` },
  ];

  return {
    result: roundSmart(result),
    conversionDetail,
    conversionTable,
    summary,
  };
}

/**
 * Handles temperature conversions separately due to non-multiplicative formulas.
 * Converts via Celsius as the intermediary base unit.
 */
function calculateTemperatureConvert(
  value: number,
  fromUnitId: string,
  toUnitId: string,
  fromTempUnit: TemperatureUnit
): Record<string, unknown> {
  const toTempUnit = findTemperatureUnit(toUnitId) || TEMPERATURE_UNITS[0]; // default: celsius

  // Perform conversion
  const result = convertTemperature(value, fromTempUnit, toTempUnit);

  // Build formula string (temperature doesn't have a simple multiplicative factor)
  let formulaStr: string;
  if (fromTempUnit.id === 'celsius' && toTempUnit.id === 'fahrenheit') {
    formulaStr = `(${value} °C × 9/5) + 32 = ${roundSmart(result)} °F`;
  } else if (fromTempUnit.id === 'fahrenheit' && toTempUnit.id === 'celsius') {
    formulaStr = `(${value} °F − 32) × 5/9 = ${roundSmart(result)} °C`;
  } else if (fromTempUnit.id === 'celsius' && toTempUnit.id === 'kelvin') {
    formulaStr = `${value} °C + 273.15 = ${roundSmart(result)} K`;
  } else if (fromTempUnit.id === 'kelvin' && toTempUnit.id === 'celsius') {
    formulaStr = `${value} K − 273.15 = ${roundSmart(result)} °C`;
  } else {
    formulaStr = `${value} ${fromTempUnit.abbreviation} → ${roundSmart(result)} ${toTempUnit.abbreviation}`;
  }

  // Build conversion detail (conversionFactor is 0 for temperature since it's non-multiplicative)
  const conversionDetail: ConversionResult = {
    fromValue: value,
    fromUnit: fromTempUnit.id,
    fromUnitName: fromTempUnit.name,
    toValue: roundSmart(result),
    toUnit: toTempUnit.id,
    toUnitName: toTempUnit.name,
    conversionFactor: 0,
    formula: formulaStr,
  };

  // Build conversion table showing value in all temperature units
  const conversionTable: ConversionTableRow[] = TEMPERATURE_UNITS.map((unit) => ({
    unit: unit.name,
    abbreviation: unit.abbreviation,
    value: roundSmart(convertTemperature(value, fromTempUnit, unit)),
  }));

  // Summary
  const summary: { label: string; value: number | string }[] = [
    { label: 'Input', value: `${value} ${fromTempUnit.abbreviation}` },
    { label: 'Result', value: `${roundSmart(result)} ${toTempUnit.abbreviation}` },
    { label: 'Formula', value: formulaStr },
  ];

  return {
    result: roundSmart(result),
    conversionDetail,
    conversionTable,
    summary,
  };
}

// ═══════════════════════════════════════════════════════
// Helper: smart rounding to avoid floating point noise
// ═══════════════════════════════════════════════════════

/**
 * Rounds a number to an appropriate number of significant digits.
 * Large numbers get fewer decimal places; small numbers get more.
 */
function roundSmart(n: number): number {
  if (n === 0) return 0;
  const absN = Math.abs(n);

  if (absN >= 1_000_000) return Math.round(n * 100) / 100;
  if (absN >= 1000) return Math.round(n * 1000) / 1000;
  if (absN >= 1) return Math.round(n * 10000) / 10000;
  if (absN >= 0.001) return Math.round(n * 1000000) / 1000000;

  // Very small numbers: use full precision
  return Number(n.toPrecision(10));
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'unit-convert': calculateUnitConvert,
};
