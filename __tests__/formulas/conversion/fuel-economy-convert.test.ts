import { calculateFuelEconomyConvert } from '@/lib/formulas/conversion/fuel-economy-convert';

describe('calculateFuelEconomyConvert', () => {
  // ─── Test 1: Same unit returns same value ───
  it('returns same value for same-unit conversion (mpg-us)', () => {
    const result = calculateFuelEconomyConvert({ value: 30, fromUnit: 'mpg-us', toUnit: 'mpg-us' });
    expect(result.convertedValue).toBe(30);
  });

  // ─── Test 2: 25 mpg-us to mpg-imperial ───
  it('converts 25 mpg-us to approximately 30.024 mpg-imperial', () => {
    const result = calculateFuelEconomyConvert({ value: 25, fromUnit: 'mpg-us', toUnit: 'mpg-imperial' });
    expect(result.convertedValue).toBeCloseTo(30.024, 1);
  });

  // ─── Test 3: 30 mpg-imperial to mpg-us ───
  it('converts 30 mpg-imperial to approximately 24.98 mpg-us', () => {
    const result = calculateFuelEconomyConvert({ value: 30, fromUnit: 'mpg-imperial', toUnit: 'mpg-us' });
    expect(result.convertedValue).toBeCloseTo(24.98, 0);
  });

  // ─── Test 4: 25 mpg-us to km-per-liter ───
  it('converts 25 mpg-us to approximately 10.629 km/L', () => {
    const result = calculateFuelEconomyConvert({ value: 25, fromUnit: 'mpg-us', toUnit: 'km-per-liter' });
    expect(result.convertedValue).toBeCloseTo(10.629, 1);
  });

  // ─── Test 5: 10 km/L to mpg-us ───
  it('converts 10 km/L to approximately 23.521 mpg-us', () => {
    const result = calculateFuelEconomyConvert({ value: 10, fromUnit: 'km-per-liter', toUnit: 'mpg-us' });
    expect(result.convertedValue).toBeCloseTo(23.521, 1);
  });

  // ─── Test 6: 25 mpg-us to L/100km ───
  it('converts 25 mpg-us to approximately 9.409 L/100km', () => {
    const result = calculateFuelEconomyConvert({ value: 25, fromUnit: 'mpg-us', toUnit: 'liters-per-100km' });
    expect(result.convertedValue).toBeCloseTo(9.409, 1);
  });

  // ─── Test 7: 9.41 L/100km to mpg-us ───
  it('converts 9.41 L/100km to approximately 25 mpg-us', () => {
    const result = calculateFuelEconomyConvert({ value: 9.41, fromUnit: 'liters-per-100km', toUnit: 'mpg-us' });
    expect(result.convertedValue).toBeCloseTo(25, 0);
  });

  // ─── Test 8: 50 mpg-us to L/100km ───
  it('converts 50 mpg-us to approximately 4.704 L/100km', () => {
    const result = calculateFuelEconomyConvert({ value: 50, fromUnit: 'mpg-us', toUnit: 'liters-per-100km' });
    expect(result.convertedValue).toBeCloseTo(4.704, 1);
  });

  // ─── Test 9: 4.7 L/100km to mpg-us (efficient car) ───
  it('converts 4.7 L/100km to approximately 50.05 mpg-us', () => {
    const result = calculateFuelEconomyConvert({ value: 4.7, fromUnit: 'liters-per-100km', toUnit: 'mpg-us' });
    expect(result.convertedValue).toBeCloseTo(50.05, 0);
  });

  // ─── Test 10: L/100km to mpg-imperial ───
  it('converts 8 L/100km to approximately 35.31 mpg-imperial', () => {
    const result = calculateFuelEconomyConvert({ value: 8, fromUnit: 'liters-per-100km', toUnit: 'mpg-imperial' });
    expect(result.convertedValue).toBeCloseTo(35.31, 0);
  });

  // ─── Test 11: L/100km to km/L ───
  it('converts 10 L/100km to 10 km/L', () => {
    const result = calculateFuelEconomyConvert({ value: 10, fromUnit: 'liters-per-100km', toUnit: 'km-per-liter' });
    expect(result.convertedValue).toBeCloseTo(10, 0);
  });

  // ─── Test 12: km/L to L/100km ───
  it('converts 15 km/L to approximately 6.667 L/100km', () => {
    const result = calculateFuelEconomyConvert({ value: 15, fromUnit: 'km-per-liter', toUnit: 'liters-per-100km' });
    expect(result.convertedValue).toBeCloseTo(6.667, 1);
  });

  // ─── Test 13: Zero value ───
  it('returns zero for zero value', () => {
    const result = calculateFuelEconomyConvert({ value: 0, fromUnit: 'mpg-us', toUnit: 'km-per-liter' });
    expect(result.convertedValue).toBe(0);
  });

  // ─── Test 14: Zero value from L/100km ───
  it('returns zero for zero L/100km', () => {
    const result = calculateFuelEconomyConvert({ value: 0, fromUnit: 'liters-per-100km', toUnit: 'mpg-us' });
    expect(result.convertedValue).toBe(0);
  });

  // ─── Test 15: Negative value treated as zero ───
  it('treats negative value as zero', () => {
    const result = calculateFuelEconomyConvert({ value: -30, fromUnit: 'mpg-us', toUnit: 'km-per-liter' });
    expect(result.convertedValue).toBe(0);
  });

  // ─── Test 16: Round-trip mpg-us → L/100km → mpg-us ───
  it('round-trip mpg-us to L/100km and back returns original', () => {
    const forward = calculateFuelEconomyConvert({ value: 30, fromUnit: 'mpg-us', toUnit: 'liters-per-100km' });
    const back = calculateFuelEconomyConvert({ value: forward.convertedValue, fromUnit: 'liters-per-100km', toUnit: 'mpg-us' });
    expect(back.convertedValue).toBeCloseTo(30, 2);
  });

  // ─── Test 17: Round-trip mpg-us → km/L → mpg-us ───
  it('round-trip mpg-us to km/L and back returns original', () => {
    const forward = calculateFuelEconomyConvert({ value: 35, fromUnit: 'mpg-us', toUnit: 'km-per-liter' });
    const back = calculateFuelEconomyConvert({ value: forward.convertedValue, fromUnit: 'km-per-liter', toUnit: 'mpg-us' });
    expect(back.convertedValue).toBeCloseTo(35, 2);
  });

  // ─── Test 18: conversionDisplay formatted correctly ───
  it('conversionDisplay is formatted correctly', () => {
    const result = calculateFuelEconomyConvert({ value: 25, fromUnit: 'mpg-us', toUnit: 'liters-per-100km' });
    const display = result.conversionDisplay as string;
    expect(display).toContain('25 mpg-us =');
    expect(display).toContain('liters-per-100km');
  });

  // ─── Test 19: conversionTable has 4 entries ───
  it('conversionTable contains 4 entries (one per unit)', () => {
    const result = calculateFuelEconomyConvert({ value: 30, fromUnit: 'mpg-us', toUnit: 'km-per-liter' });
    const table = result.conversionTable as Array<{ label: string; value: number }>;
    expect(table).toHaveLength(4);
  });

  // ─── Test 20: Output has all expected keys ───
  it('returns all expected output keys', () => {
    const result = calculateFuelEconomyConvert({ value: 25, fromUnit: 'mpg-us', toUnit: 'km-per-liter' });
    expect(result).toHaveProperty('convertedValue');
    expect(result).toHaveProperty('fromUnit');
    expect(result).toHaveProperty('toUnit');
    expect(result).toHaveProperty('conversionRate');
    expect(result).toHaveProperty('inverseRate');
    expect(result).toHaveProperty('conversionDisplay');
    expect(result).toHaveProperty('conversionTable');
  });

  // ─── Test 21: mpg-imperial same-unit identity ───
  it('returns same value for mpg-imperial to mpg-imperial', () => {
    const result = calculateFuelEconomyConvert({ value: 40, fromUnit: 'mpg-imperial', toUnit: 'mpg-imperial' });
    expect(result.convertedValue).toBe(40);
  });

  // ─── Test 22: Large value — 100 mpg ───
  it('handles large values: 100 mpg-us to L/100km', () => {
    const result = calculateFuelEconomyConvert({ value: 100, fromUnit: 'mpg-us', toUnit: 'liters-per-100km' });
    expect(result.convertedValue).toBeCloseTo(2.352, 1);
  });

  // ─── Test 23: Defaults when units omitted ───
  it('defaults to mpg-us → km-per-liter when units omitted', () => {
    const result = calculateFuelEconomyConvert({ value: 25 });
    expect(result.fromUnit).toBe('mpg-us');
    expect(result.toUnit).toBe('km-per-liter');
  });

  // ─── Test 24: String input coercion ───
  it('handles string input values correctly', () => {
    const result = calculateFuelEconomyConvert({ value: '30', fromUnit: 'mpg-us', toUnit: 'mpg-us' });
    expect(result.convertedValue).toBe(30);
  });

  // ─── Test 25: High L/100km (gas guzzler) ───
  it('converts 20 L/100km to approximately 11.76 mpg-us', () => {
    const result = calculateFuelEconomyConvert({ value: 20, fromUnit: 'liters-per-100km', toUnit: 'mpg-us' });
    expect(result.convertedValue).toBeCloseTo(11.76, 1);
  });
});
