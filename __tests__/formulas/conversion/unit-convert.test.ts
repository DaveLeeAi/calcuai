import {
  calculateUnitConvert,
  convert,
  findUnit,
  convertTemperature,
  findTemperatureUnit,
  LENGTH_UNITS,
  WEIGHT_UNITS,
  AREA_UNITS,
  VOLUME_UNITS,
  DATA_STORAGE_UNITS,
  TEMPERATURE_UNITS,
} from '@/lib/formulas/conversion/unit-convert';

// ═══════════════════════════════════════════════════════
// Section 1: Length Conversions (original 15 tests)
// ═══════════════════════════════════════════════════════

describe('calculateUnitConvert — Length', () => {
  // ─── Test 1: Meters to feet ───
  it('converts 1 meter to feet correctly', () => {
    const result = calculateUnitConvert({
      value: 1,
      fromUnit: 'meter',
      toUnit: 'foot',
    });
    // 1 meter = 3.28084 feet
    expect(result.result).toBeCloseTo(3.2808, 3);
  });

  // ─── Test 2: Feet to meters ───
  it('converts 10 feet to meters correctly', () => {
    const result = calculateUnitConvert({
      value: 10,
      fromUnit: 'foot',
      toUnit: 'meter',
    });
    // 10 feet = 3.048 meters
    expect(result.result).toBeCloseTo(3.048, 3);
  });

  // ─── Test 3: Miles to kilometers ───
  it('converts 1 mile to kilometers correctly', () => {
    const result = calculateUnitConvert({
      value: 1,
      fromUnit: 'mile',
      toUnit: 'kilometer',
    });
    // 1 mile = 1.609344 km
    expect(result.result).toBeCloseTo(1.6093, 3);
  });

  // ─── Test 4: Inches to centimeters ───
  it('converts 12 inches to centimeters correctly', () => {
    const result = calculateUnitConvert({
      value: 12,
      fromUnit: 'inch',
      toUnit: 'centimeter',
    });
    // 12 inches = 30.48 cm
    expect(result.result).toBeCloseTo(30.48, 2);
  });

  // ─── Test 5: Kilometers to miles ───
  it('converts 5 kilometers to miles correctly', () => {
    const result = calculateUnitConvert({
      value: 5,
      fromUnit: 'kilometer',
      toUnit: 'mile',
    });
    // 5 km = 3.10686 mi
    expect(result.result).toBeCloseTo(3.1069, 3);
  });

  // ─── Test 6: Yards to meters ───
  it('converts 100 yards to meters correctly', () => {
    const result = calculateUnitConvert({
      value: 100,
      fromUnit: 'yard',
      toUnit: 'meter',
    });
    // 100 yards = 91.44 meters
    expect(result.result).toBeCloseTo(91.44, 2);
  });

  // ─── Test 7: Same unit conversion ───
  it('returns same value when converting to same unit', () => {
    const result = calculateUnitConvert({
      value: 42,
      fromUnit: 'meter',
      toUnit: 'meter',
    });
    expect(result.result).toBe(42);
  });

  // ─── Test 8: Zero value ───
  it('handles zero value correctly', () => {
    const result = calculateUnitConvert({
      value: 0,
      fromUnit: 'mile',
      toUnit: 'kilometer',
    });
    expect(result.result).toBe(0);
  });

  // ─── Test 9: Conversion table contains all length units ───
  it('generates conversion table with all length units', () => {
    const result = calculateUnitConvert({
      value: 1,
      fromUnit: 'meter',
      toUnit: 'foot',
    });
    const table = result.conversionTable as { unit: string; abbreviation: string; value: number }[];
    expect(table.length).toBe(LENGTH_UNITS.length);
    // Meter row should show 1
    const meterRow = table.find((r) => r.abbreviation === 'm');
    expect(meterRow!.value).toBe(1);
  });

  // ─── Test 10: Millimeters to inches ───
  it('converts 25.4 millimeters to 1 inch', () => {
    const result = calculateUnitConvert({
      value: 25.4,
      fromUnit: 'millimeter',
      toUnit: 'inch',
    });
    // 25.4 mm = 1 inch exactly
    expect(result.result).toBeCloseTo(1, 4);
  });

  // ─── Test 11: Centimeters to inches ───
  it('converts 2.54 centimeters to 1 inch', () => {
    const result = calculateUnitConvert({
      value: 2.54,
      fromUnit: 'centimeter',
      toUnit: 'inch',
    });
    expect(result.result).toBeCloseTo(1, 4);
  });

  // ─── Test 12: Nautical miles to kilometers ───
  it('converts 1 nautical mile to 1.852 km', () => {
    const result = calculateUnitConvert({
      value: 1,
      fromUnit: 'nautical-mile',
      toUnit: 'kilometer',
    });
    expect(result.result).toBeCloseTo(1.852, 3);
  });

  // ─── Test 13: Conversion detail structure ───
  it('returns correct conversionDetail structure', () => {
    const result = calculateUnitConvert({
      value: 5,
      fromUnit: 'foot',
      toUnit: 'meter',
    });
    const detail = result.conversionDetail as {
      fromValue: number;
      fromUnit: string;
      fromUnitName: string;
      toValue: number;
      toUnit: string;
      toUnitName: string;
      conversionFactor: number;
    };
    expect(detail.fromValue).toBe(5);
    expect(detail.fromUnit).toBe('foot');
    expect(detail.fromUnitName).toBe('Foot');
    expect(detail.toUnit).toBe('meter');
    expect(detail.toUnitName).toBe('Meter');
  });

  // ─── Test 14: Invalid unit defaults to meter/foot ───
  it('defaults to meter→foot when invalid units provided', () => {
    const result = calculateUnitConvert({
      value: 1,
      fromUnit: 'invalid',
      toUnit: 'alsobad',
    });
    // Should default to meter → foot
    expect(result.result).toBeCloseTo(3.2808, 3);
  });

  // ─── Test 15: Large distance conversion (marathon in km) ───
  it('converts marathon distance 42.195 km to miles', () => {
    const result = calculateUnitConvert({
      value: 42.195,
      fromUnit: 'kilometer',
      toUnit: 'mile',
    });
    // 42.195 km = 26.2188 miles
    expect(result.result).toBeCloseTo(26.2188, 2);
  });
});

// ═══════════════════════════════════════════════════════
// Section 2: Weight Conversions (12 tests)
// ═══════════════════════════════════════════════════════

describe('calculateUnitConvert — Weight', () => {
  it('converts 1 kg to pounds', () => {
    const result = calculateUnitConvert({ value: 1, fromUnit: 'kilogram', toUnit: 'pound' });
    // 1 kg = 2.20462 lb
    expect(result.result).toBeCloseTo(2.2046, 3);
  });

  it('converts 1 pound to kilograms', () => {
    const result = calculateUnitConvert({ value: 1, fromUnit: 'pound', toUnit: 'kilogram' });
    // 1 lb = 0.45359 kg
    expect(result.result).toBeCloseTo(0.4536, 3);
  });

  it('converts 1 kg to ounces', () => {
    const result = calculateUnitConvert({ value: 1, fromUnit: 'kilogram', toUnit: 'ounce' });
    // 1 kg = 35.274 oz
    expect(result.result).toBeCloseTo(35.274, 2);
  });

  it('converts 1 stone to pounds', () => {
    const result = calculateUnitConvert({ value: 1, fromUnit: 'stone', toUnit: 'pound' });
    // 1 stone = 14 lb
    expect(result.result).toBeCloseTo(14, 1);
  });

  it('converts 1 stone to kilograms', () => {
    const result = calculateUnitConvert({ value: 1, fromUnit: 'stone', toUnit: 'kilogram' });
    // 1 stone = 6.35029 kg
    expect(result.result).toBeCloseTo(6.3503, 3);
  });

  it('converts 1 metric ton to kilograms', () => {
    const result = calculateUnitConvert({ value: 1, fromUnit: 'metric-ton', toUnit: 'kilogram' });
    // 1 metric ton = 1000 kg
    expect(result.result).toBeCloseTo(1000, 0);
  });

  it('converts 1 short ton to pounds', () => {
    const result = calculateUnitConvert({ value: 1, fromUnit: 'short-ton', toUnit: 'pound' });
    // 1 short ton = 2000 lb
    expect(result.result).toBeCloseTo(2000, 0);
  });

  it('converts 1 short ton to kilograms', () => {
    const result = calculateUnitConvert({ value: 1, fromUnit: 'short-ton', toUnit: 'kilogram' });
    // 1 short ton = 907.185 kg
    expect(result.result).toBeCloseTo(907.185, 1);
  });

  it('returns same value for same-unit weight conversion (kg → kg)', () => {
    const result = calculateUnitConvert({ value: 75.5, fromUnit: 'kilogram', toUnit: 'kilogram' });
    expect(result.result).toBe(75.5);
  });

  it('handles zero weight value', () => {
    const result = calculateUnitConvert({ value: 0, fromUnit: 'pound', toUnit: 'kilogram' });
    expect(result.result).toBe(0);
  });

  it('generates conversion table with all 9 weight units', () => {
    const result = calculateUnitConvert({ value: 1, fromUnit: 'kilogram', toUnit: 'pound' });
    const table = result.conversionTable as { unit: string; abbreviation: string; value: number }[];
    expect(table.length).toBe(WEIGHT_UNITS.length);
    expect(table.length).toBe(9);
  });

  it('returns correct conversionDetail structure for weight', () => {
    const result = calculateUnitConvert({ value: 10, fromUnit: 'pound', toUnit: 'kilogram' });
    const detail = result.conversionDetail as {
      fromValue: number;
      fromUnit: string;
      fromUnitName: string;
      toValue: number;
      toUnit: string;
      toUnitName: string;
      conversionFactor: number;
    };
    expect(detail.fromValue).toBe(10);
    expect(detail.fromUnit).toBe('pound');
    expect(detail.fromUnitName).toBe('Pound');
    expect(detail.toUnit).toBe('kilogram');
    expect(detail.toUnitName).toBe('Kilogram');
    expect(detail.conversionFactor).toBeCloseTo(0.4536, 3);
  });
});

// ═══════════════════════════════════════════════════════
// Section 3: Temperature Conversions (18 tests)
// ═══════════════════════════════════════════════════════

describe('calculateUnitConvert — Temperature', () => {
  it('converts 0°C to 32°F', () => {
    const result = calculateUnitConvert({ value: 0, fromUnit: 'celsius', toUnit: 'fahrenheit' });
    expect(result.result).toBeCloseTo(32, 2);
  });

  it('converts 100°C to 212°F (boiling point of water)', () => {
    const result = calculateUnitConvert({ value: 100, fromUnit: 'celsius', toUnit: 'fahrenheit' });
    expect(result.result).toBeCloseTo(212, 2);
  });

  it('converts 32°F to 0°C (freezing point of water)', () => {
    const result = calculateUnitConvert({ value: 32, fromUnit: 'fahrenheit', toUnit: 'celsius' });
    expect(result.result).toBeCloseTo(0, 2);
  });

  it('converts 212°F to 100°C', () => {
    const result = calculateUnitConvert({ value: 212, fromUnit: 'fahrenheit', toUnit: 'celsius' });
    expect(result.result).toBeCloseTo(100, 2);
  });

  it('converts 0°C to 273.15 K', () => {
    const result = calculateUnitConvert({ value: 0, fromUnit: 'celsius', toUnit: 'kelvin' });
    expect(result.result).toBeCloseTo(273.15, 2);
  });

  it('converts -40°C to -40°F (the crossover point)', () => {
    const result = calculateUnitConvert({ value: -40, fromUnit: 'celsius', toUnit: 'fahrenheit' });
    expect(result.result).toBeCloseTo(-40, 2);
  });

  it('converts -40°F to -40°C (the crossover point, reverse)', () => {
    const result = calculateUnitConvert({ value: -40, fromUnit: 'fahrenheit', toUnit: 'celsius' });
    expect(result.result).toBeCloseTo(-40, 2);
  });

  it('converts 98.6°F to 37°C (body temperature)', () => {
    const result = calculateUnitConvert({ value: 98.6, fromUnit: 'fahrenheit', toUnit: 'celsius' });
    expect(result.result).toBeCloseTo(37, 1);
  });

  it('converts 0 K to -273.15°C (absolute zero)', () => {
    const result = calculateUnitConvert({ value: 0, fromUnit: 'kelvin', toUnit: 'celsius' });
    expect(result.result).toBeCloseTo(-273.15, 2);
  });

  it('converts 0°C to 0°C (same unit)', () => {
    const result = calculateUnitConvert({ value: 0, fromUnit: 'celsius', toUnit: 'celsius' });
    expect(result.result).toBe(0);
  });

  it('converts 451°F to 232.778°C (Fahrenheit 451)', () => {
    const result = calculateUnitConvert({ value: 451, fromUnit: 'fahrenheit', toUnit: 'celsius' });
    expect(result.result).toBeCloseTo(232.778, 1);
  });

  it('generates conversion table with all 4 temperature units', () => {
    const result = calculateUnitConvert({ value: 100, fromUnit: 'celsius', toUnit: 'fahrenheit' });
    const table = result.conversionTable as { unit: string; abbreviation: string; value: number }[];
    expect(table.length).toBe(TEMPERATURE_UNITS.length);
    expect(table.length).toBe(4);
  });

  it('sets conversionFactor to 0 for temperature (non-multiplicative)', () => {
    const result = calculateUnitConvert({ value: 100, fromUnit: 'celsius', toUnit: 'fahrenheit' });
    const detail = result.conversionDetail as { conversionFactor: number };
    expect(detail.conversionFactor).toBe(0);
  });

  it('converts Kelvin to Fahrenheit via Celsius intermediary', () => {
    // 373.15 K = 100°C = 212°F
    const result = calculateUnitConvert({ value: 373.15, fromUnit: 'kelvin', toUnit: 'fahrenheit' });
    expect(result.result).toBeCloseTo(212, 1);
  });

  it('converts Fahrenheit to Kelvin', () => {
    // 32°F = 0°C = 273.15 K
    const result = calculateUnitConvert({ value: 32, fromUnit: 'fahrenheit', toUnit: 'kelvin' });
    expect(result.result).toBeCloseTo(273.15, 2);
  });

  it('converts Rankine to Celsius', () => {
    // 491.67°R = 0°C
    const result = calculateUnitConvert({ value: 491.67, fromUnit: 'rankine', toUnit: 'celsius' });
    expect(result.result).toBeCloseTo(0, 1);
  });
});

describe('convertTemperature helper', () => {
  it('converts Celsius to Fahrenheit directly', () => {
    const c = findTemperatureUnit('celsius')!;
    const f = findTemperatureUnit('fahrenheit')!;
    expect(convertTemperature(100, c, f)).toBeCloseTo(212, 2);
  });

  it('converts Fahrenheit to Celsius directly', () => {
    const f = findTemperatureUnit('fahrenheit')!;
    const c = findTemperatureUnit('celsius')!;
    expect(convertTemperature(32, f, c)).toBeCloseTo(0, 2);
  });

  it('converts Celsius to Kelvin directly', () => {
    const c = findTemperatureUnit('celsius')!;
    const k = findTemperatureUnit('kelvin')!;
    expect(convertTemperature(0, c, k)).toBeCloseTo(273.15, 2);
  });

  it('converts Kelvin to Fahrenheit directly', () => {
    const k = findTemperatureUnit('kelvin')!;
    const f = findTemperatureUnit('fahrenheit')!;
    // 0 K = -273.15°C = -459.67°F
    expect(convertTemperature(0, k, f)).toBeCloseTo(-459.67, 1);
  });

  it('handles Rankine to Kelvin', () => {
    const r = findTemperatureUnit('rankine')!;
    const k = findTemperatureUnit('kelvin')!;
    // 0°R = -273.15°C = 0 K ... actually:
    // 491.67°R = 0°C = 273.15 K
    expect(convertTemperature(491.67, r, k)).toBeCloseTo(273.15, 1);
  });
});

// ═══════════════════════════════════════════════════════
// Section 4: Area Conversions (12 tests)
// ═══════════════════════════════════════════════════════

describe('calculateUnitConvert — Area', () => {
  it('converts 1 acre to square feet', () => {
    const result = calculateUnitConvert({ value: 1, fromUnit: 'acre', toUnit: 'square-foot' });
    // 1 acre = 43,560 sq ft
    expect(result.result).toBeCloseTo(43560, 0);
  });

  it('converts 1 hectare to square meters', () => {
    const result = calculateUnitConvert({ value: 1, fromUnit: 'hectare', toUnit: 'square-meter' });
    // 1 hectare = 10,000 sq m
    expect(result.result).toBeCloseTo(10000, 0);
  });

  it('converts 1 square foot to square meters', () => {
    const result = calculateUnitConvert({ value: 1, fromUnit: 'square-foot', toUnit: 'square-meter' });
    // 1 sq ft = 0.0929 sq m
    expect(result.result).toBeCloseTo(0.0929, 3);
  });

  it('converts 1 square mile to acres', () => {
    const result = calculateUnitConvert({ value: 1, fromUnit: 'square-mile', toUnit: 'acre' });
    // 1 sq mi = 640 acres
    expect(result.result).toBeCloseTo(640, 0);
  });

  it('converts 1 square meter to square feet', () => {
    const result = calculateUnitConvert({ value: 1, fromUnit: 'square-meter', toUnit: 'square-foot' });
    // 1 sq m = 10.7639 sq ft
    expect(result.result).toBeCloseTo(10.7639, 2);
  });

  it('converts 1 square yard to square feet', () => {
    const result = calculateUnitConvert({ value: 1, fromUnit: 'square-yard', toUnit: 'square-foot' });
    // 1 sq yd = 9 sq ft
    expect(result.result).toBeCloseTo(9, 1);
  });

  it('converts 1 square inch to square centimeters', () => {
    const result = calculateUnitConvert({ value: 1, fromUnit: 'square-inch', toUnit: 'square-centimeter' });
    // 1 sq in = 6.4516 sq cm
    expect(result.result).toBeCloseTo(6.4516, 3);
  });

  it('converts 1 hectare to acres', () => {
    const result = calculateUnitConvert({ value: 1, fromUnit: 'hectare', toUnit: 'acre' });
    // 1 hectare = 2.47105 acres
    expect(result.result).toBeCloseTo(2.4711, 3);
  });

  it('returns same value for same-unit area conversion (sq m → sq m)', () => {
    const result = calculateUnitConvert({ value: 250, fromUnit: 'square-meter', toUnit: 'square-meter' });
    expect(result.result).toBe(250);
  });

  it('handles zero area value', () => {
    const result = calculateUnitConvert({ value: 0, fromUnit: 'acre', toUnit: 'hectare' });
    expect(result.result).toBe(0);
  });

  it('generates conversion table with all area units', () => {
    const result = calculateUnitConvert({ value: 1, fromUnit: 'acre', toUnit: 'square-foot' });
    const table = result.conversionTable as { unit: string; abbreviation: string; value: number }[];
    expect(table.length).toBe(AREA_UNITS.length);
    expect(table.length).toBe(10);
  });

  it('converts square kilometers to square miles', () => {
    const result = calculateUnitConvert({ value: 1, fromUnit: 'square-kilometer', toUnit: 'square-mile' });
    // 1 sq km = 0.386102 sq mi
    expect(result.result).toBeCloseTo(0.3861, 3);
  });
});

// ═══════════════════════════════════════════════════════
// Section 5: Volume Conversions (13 tests)
// ═══════════════════════════════════════════════════════

describe('calculateUnitConvert — Volume', () => {
  it('converts 1 US gallon to liters', () => {
    const result = calculateUnitConvert({ value: 1, fromUnit: 'us-gallon', toUnit: 'liter' });
    // 1 US gallon = 3.78541 liters
    expect(result.result).toBeCloseTo(3.7854, 3);
  });

  it('converts 1 liter to milliliters', () => {
    const result = calculateUnitConvert({ value: 1, fromUnit: 'liter', toUnit: 'milliliter' });
    // 1 liter = 1000 mL
    expect(result.result).toBeCloseTo(1000, 0);
  });

  it('converts 1 US cup to milliliters', () => {
    const result = calculateUnitConvert({ value: 1, fromUnit: 'us-cup', toUnit: 'milliliter' });
    // 1 US cup = 236.588 mL
    expect(result.result).toBeCloseTo(236.588, 1);
  });

  it('converts 1 cubic meter to liters', () => {
    const result = calculateUnitConvert({ value: 1, fromUnit: 'cubic-meter', toUnit: 'liter' });
    // 1 cubic meter = 1000 liters
    expect(result.result).toBeCloseTo(1000, 0);
  });

  it('converts 1 US gallon to US fluid ounces', () => {
    const result = calculateUnitConvert({ value: 1, fromUnit: 'us-gallon', toUnit: 'us-fluid-ounce' });
    // 1 US gallon = 128 fl oz
    expect(result.result).toBeCloseTo(128, 0);
  });

  it('converts 1 tablespoon to teaspoons', () => {
    const result = calculateUnitConvert({ value: 1, fromUnit: 'tablespoon', toUnit: 'teaspoon' });
    // 1 tbsp = 3 tsp
    expect(result.result).toBeCloseTo(3, 1);
  });

  it('converts 1 imperial gallon to liters', () => {
    const result = calculateUnitConvert({ value: 1, fromUnit: 'imperial-gallon', toUnit: 'liter' });
    // 1 imperial gallon = 4.54609 liters
    expect(result.result).toBeCloseTo(4.5461, 3);
  });

  it('converts 1 cubic foot to liters', () => {
    const result = calculateUnitConvert({ value: 1, fromUnit: 'cubic-foot', toUnit: 'liter' });
    // 1 cubic foot = 28.3168 liters
    expect(result.result).toBeCloseTo(28.3168, 2);
  });

  it('converts US quart to US pint', () => {
    const result = calculateUnitConvert({ value: 1, fromUnit: 'us-quart', toUnit: 'us-pint' });
    // 1 quart = 2 pints
    expect(result.result).toBeCloseTo(2, 1);
  });

  it('returns same value for same-unit volume conversion (liter → liter)', () => {
    const result = calculateUnitConvert({ value: 3.5, fromUnit: 'liter', toUnit: 'liter' });
    expect(result.result).toBe(3.5);
  });

  it('handles zero volume value', () => {
    const result = calculateUnitConvert({ value: 0, fromUnit: 'us-gallon', toUnit: 'liter' });
    expect(result.result).toBe(0);
  });

  it('generates conversion table with all volume units', () => {
    const result = calculateUnitConvert({ value: 1, fromUnit: 'liter', toUnit: 'milliliter' });
    const table = result.conversionTable as { unit: string; abbreviation: string; value: number }[];
    expect(table.length).toBe(VOLUME_UNITS.length);
    expect(table.length).toBe(14);
  });

  it('converts cubic inch to milliliters', () => {
    const result = calculateUnitConvert({ value: 1, fromUnit: 'cubic-inch', toUnit: 'milliliter' });
    // 1 cubic inch = 16.387 mL
    expect(result.result).toBeCloseTo(16.387, 2);
  });
});

// ═══════════════════════════════════════════════════════
// Section 6: Data Storage Conversions (13 tests)
// ═══════════════════════════════════════════════════════

describe('calculateUnitConvert — Data Storage', () => {
  it('converts 1 GB to MB (decimal)', () => {
    const result = calculateUnitConvert({ value: 1, fromUnit: 'gigabyte', toUnit: 'megabyte' });
    // 1 GB = 1000 MB
    expect(result.result).toBeCloseTo(1000, 0);
  });

  it('converts 1 GiB to MiB (binary)', () => {
    const result = calculateUnitConvert({ value: 1, fromUnit: 'gibibyte', toUnit: 'mebibyte' });
    // 1 GiB = 1024 MiB
    expect(result.result).toBeCloseTo(1024, 0);
  });

  it('converts 1 TB to GB', () => {
    const result = calculateUnitConvert({ value: 1, fromUnit: 'terabyte', toUnit: 'gigabyte' });
    // 1 TB = 1000 GB
    expect(result.result).toBeCloseTo(1000, 0);
  });

  it('converts 1 TiB to GiB', () => {
    const result = calculateUnitConvert({ value: 1, fromUnit: 'tebibyte', toUnit: 'gibibyte' });
    // 1 TiB = 1024 GiB
    expect(result.result).toBeCloseTo(1024, 0);
  });

  it('converts 1 byte to bits', () => {
    const result = calculateUnitConvert({ value: 1, fromUnit: 'byte', toUnit: 'bit' });
    // 1 byte = 8 bits
    expect(result.result).toBeCloseTo(8, 0);
  });

  it('converts 1 GB to GiB (the famous discrepancy)', () => {
    const result = calculateUnitConvert({ value: 1, fromUnit: 'gigabyte', toUnit: 'gibibyte' });
    // 1 GB = 1,000,000,000 bytes / 1,073,741,824 bytes per GiB = 0.931323 GiB
    expect(result.result).toBeCloseTo(0.931323, 4);
  });

  it('converts 1 KB to bytes', () => {
    const result = calculateUnitConvert({ value: 1, fromUnit: 'kilobyte', toUnit: 'byte' });
    // 1 KB = 1000 bytes
    expect(result.result).toBeCloseTo(1000, 0);
  });

  it('converts 1 KiB to bytes', () => {
    const result = calculateUnitConvert({ value: 1, fromUnit: 'kibibyte', toUnit: 'byte' });
    // 1 KiB = 1024 bytes
    expect(result.result).toBeCloseTo(1024, 0);
  });

  it('converts 1 PB to TB', () => {
    const result = calculateUnitConvert({ value: 1, fromUnit: 'petabyte', toUnit: 'terabyte' });
    // 1 PB = 1000 TB
    expect(result.result).toBeCloseTo(1000, 0);
  });

  it('returns same value for same-unit data storage conversion (byte → byte)', () => {
    const result = calculateUnitConvert({ value: 512, fromUnit: 'byte', toUnit: 'byte' });
    expect(result.result).toBe(512);
  });

  it('handles zero data storage value', () => {
    const result = calculateUnitConvert({ value: 0, fromUnit: 'gigabyte', toUnit: 'megabyte' });
    expect(result.result).toBe(0);
  });

  it('generates conversion table with all data storage units', () => {
    const result = calculateUnitConvert({ value: 1, fromUnit: 'gigabyte', toUnit: 'megabyte' });
    const table = result.conversionTable as { unit: string; abbreviation: string; value: number }[];
    expect(table.length).toBe(DATA_STORAGE_UNITS.length);
    expect(table.length).toBe(11);
  });

  it('converts MB to KiB (cross decimal/binary)', () => {
    const result = calculateUnitConvert({ value: 1, fromUnit: 'megabyte', toUnit: 'kibibyte' });
    // 1 MB = 1,000,000 bytes / 1024 bytes per KiB = 976.5625 KiB
    expect(result.result).toBeCloseTo(976.5625, 2);
  });
});

// ═══════════════════════════════════════════════════════
// Section 7: Auto-Detection Tests (7 tests)
// ═══════════════════════════════════════════════════════

describe('auto-detection across categories', () => {
  it('auto-detects weight when fromUnit is kilogram', () => {
    const result = calculateUnitConvert({ value: 1, fromUnit: 'kilogram', toUnit: 'pound' });
    expect(result.result).toBeCloseTo(2.2046, 3);
  });

  it('auto-detects area when fromUnit is acre', () => {
    const result = calculateUnitConvert({ value: 1, fromUnit: 'acre', toUnit: 'square-foot' });
    expect(result.result).toBeCloseTo(43560, 0);
  });

  it('auto-detects temperature when fromUnit is fahrenheit', () => {
    const result = calculateUnitConvert({ value: 212, fromUnit: 'fahrenheit', toUnit: 'celsius' });
    expect(result.result).toBeCloseTo(100, 2);
  });

  it('auto-detects volume when fromUnit is us-gallon', () => {
    const result = calculateUnitConvert({ value: 1, fromUnit: 'us-gallon', toUnit: 'liter' });
    expect(result.result).toBeCloseTo(3.7854, 3);
  });

  it('auto-detects data storage when fromUnit is gigabyte', () => {
    const result = calculateUnitConvert({ value: 1, fromUnit: 'gigabyte', toUnit: 'megabyte' });
    expect(result.result).toBeCloseTo(1000, 0);
  });

  it('auto-detects length when fromUnit is meter', () => {
    const result = calculateUnitConvert({ value: 1, fromUnit: 'meter', toUnit: 'foot' });
    expect(result.result).toBeCloseTo(3.2808, 3);
  });

  it('falls back to length for unknown units', () => {
    const result = calculateUnitConvert({ value: 1, fromUnit: 'invalid', toUnit: 'also-invalid' });
    // Should default to meter → foot
    expect(result.result).toBeCloseTo(3.2808, 3);
  });
});

// ═══════════════════════════════════════════════════════
// Section 8: Helper Function Tests (12 tests)
// ═══════════════════════════════════════════════════════

describe('convert helper', () => {
  it('converts between two length units using base factors', () => {
    const foot = findUnit('foot', LENGTH_UNITS)!;
    const meter = findUnit('meter', LENGTH_UNITS)!;
    expect(convert(1, meter, foot)).toBeCloseTo(3.28084, 4);
  });

  it('converts between weight units', () => {
    const kg = findUnit('kilogram', WEIGHT_UNITS)!;
    const lb = findUnit('pound', WEIGHT_UNITS)!;
    expect(convert(1, kg, lb)).toBeCloseTo(2.20462, 4);
  });

  it('converts between area units', () => {
    const sqm = findUnit('square-meter', AREA_UNITS)!;
    const sqft = findUnit('square-foot', AREA_UNITS)!;
    expect(convert(1, sqm, sqft)).toBeCloseTo(10.7639, 3);
  });

  it('converts between volume units', () => {
    const liter = findUnit('liter', VOLUME_UNITS)!;
    const ml = findUnit('milliliter', VOLUME_UNITS)!;
    expect(convert(1, liter, ml)).toBeCloseTo(1000, 0);
  });

  it('converts between data storage units', () => {
    const gb = findUnit('gigabyte', DATA_STORAGE_UNITS)!;
    const mb = findUnit('megabyte', DATA_STORAGE_UNITS)!;
    expect(convert(1, gb, mb)).toBeCloseTo(1000, 0);
  });

  it('returns 0 when toUnit has toBase of 0', () => {
    const meter = findUnit('meter', LENGTH_UNITS)!;
    // Create a fake unit with toBase = 0
    const zeroUnit = { id: 'zero', name: 'Zero', abbreviation: 'z', toBase: 0, category: 'test' };
    expect(convert(100, meter, zeroUnit)).toBe(0);
  });
});

describe('findUnit', () => {
  it('finds an existing unit by ID in LENGTH_UNITS', () => {
    const unit = findUnit('mile', LENGTH_UNITS);
    expect(unit).toBeDefined();
    expect(unit!.name).toBe('Mile');
  });

  it('returns undefined for non-existent unit', () => {
    const unit = findUnit('nonexistent', LENGTH_UNITS);
    expect(unit).toBeUndefined();
  });

  it('finds units in WEIGHT_UNITS', () => {
    const unit = findUnit('kilogram', WEIGHT_UNITS);
    expect(unit).toBeDefined();
    expect(unit!.abbreviation).toBe('kg');
  });

  it('finds units in AREA_UNITS', () => {
    const unit = findUnit('acre', AREA_UNITS);
    expect(unit).toBeDefined();
    expect(unit!.abbreviation).toBe('ac');
  });

  it('finds units in VOLUME_UNITS', () => {
    const unit = findUnit('us-gallon', VOLUME_UNITS);
    expect(unit).toBeDefined();
    expect(unit!.abbreviation).toBe('gal');
  });

  it('finds units in DATA_STORAGE_UNITS', () => {
    const unit = findUnit('gibibyte', DATA_STORAGE_UNITS);
    expect(unit).toBeDefined();
    expect(unit!.abbreviation).toBe('GiB');
  });
});

describe('findTemperatureUnit', () => {
  it('finds celsius', () => {
    const unit = findTemperatureUnit('celsius');
    expect(unit).toBeDefined();
    expect(unit!.abbreviation).toBe('°C');
  });

  it('finds fahrenheit', () => {
    const unit = findTemperatureUnit('fahrenheit');
    expect(unit).toBeDefined();
    expect(unit!.abbreviation).toBe('°F');
  });

  it('finds kelvin', () => {
    const unit = findTemperatureUnit('kelvin');
    expect(unit).toBeDefined();
    expect(unit!.abbreviation).toBe('K');
  });

  it('finds rankine', () => {
    const unit = findTemperatureUnit('rankine');
    expect(unit).toBeDefined();
    expect(unit!.abbreviation).toBe('°R');
  });

  it('returns undefined for non-existent temperature unit', () => {
    const unit = findTemperatureUnit('nonexistent');
    expect(unit).toBeUndefined();
  });
});
