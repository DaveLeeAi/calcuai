import { calculateAngleConvert } from '@/lib/formulas/conversion/angle-convert';

describe('calculateAngleConvert', () => {
  // ─── Test 1: 180° = π radians ───
  it('converts 180 degrees to π radians', () => {
    const result = calculateAngleConvert({ value: 180, fromUnit: 'degrees', toUnit: 'radians' });
    expect(result.convertedValue).toBeCloseTo(Math.PI, 5);
  });

  // ─── Test 2: π radians = 180° ───
  it('converts π radians to 180 degrees', () => {
    const result = calculateAngleConvert({ value: Math.PI, fromUnit: 'radians', toUnit: 'degrees' });
    expect(result.convertedValue).toBeCloseTo(180, 4);
  });

  // ─── Test 3: 360° = 2π radians ───
  it('converts 360 degrees to 2π radians', () => {
    const result = calculateAngleConvert({ value: 360, fromUnit: 'degrees', toUnit: 'radians' });
    expect(result.convertedValue).toBeCloseTo(2 * Math.PI, 4);
  });

  // ─── Test 4: 90° = 100 gradians ───
  it('converts 90 degrees to 100 gradians', () => {
    const result = calculateAngleConvert({ value: 90, fromUnit: 'degrees', toUnit: 'gradians' });
    expect(result.convertedValue).toBe(100);
  });

  // ─── Test 5: 200 gradians = 180° ───
  it('converts 200 gradians to 180 degrees', () => {
    const result = calculateAngleConvert({ value: 200, fromUnit: 'gradians', toUnit: 'degrees' });
    expect(result.convertedValue).toBe(180);
  });

  // ─── Test 6: 1 turn = 360° ───
  it('converts 1 turn to 360 degrees', () => {
    const result = calculateAngleConvert({ value: 1, fromUnit: 'turns', toUnit: 'degrees' });
    expect(result.convertedValue).toBe(360);
  });

  // ─── Test 7: 360° = 1 turn ───
  it('converts 360 degrees to 1 turn', () => {
    const result = calculateAngleConvert({ value: 360, fromUnit: 'degrees', toUnit: 'turns' });
    expect(result.convertedValue).toBe(1);
  });

  // ─── Test 8: 180° = 0.5 turns ───
  it('converts 180 degrees to 0.5 turns', () => {
    const result = calculateAngleConvert({ value: 180, fromUnit: 'degrees', toUnit: 'turns' });
    expect(result.convertedValue).toBe(0.5);
  });

  // ─── Test 9: 1° = 60 arcminutes ───
  it('converts 1 degree to 60 arcminutes', () => {
    const result = calculateAngleConvert({ value: 1, fromUnit: 'degrees', toUnit: 'arcminutes' });
    expect(result.convertedValue).toBe(60);
  });

  // ─── Test 10: 60 arcminutes = 1° ───
  it('converts 60 arcminutes to 1 degree', () => {
    const result = calculateAngleConvert({ value: 60, fromUnit: 'arcminutes', toUnit: 'degrees' });
    expect(result.convertedValue).toBe(1);
  });

  // ─── Test 11: 1° = 3600 arcseconds ───
  it('converts 1 degree to 3600 arcseconds', () => {
    const result = calculateAngleConvert({ value: 1, fromUnit: 'degrees', toUnit: 'arcseconds' });
    expect(result.convertedValue).toBe(3600);
  });

  // ─── Test 12: 3600 arcseconds = 1° ───
  it('converts 3600 arcseconds to 1 degree', () => {
    const result = calculateAngleConvert({ value: 3600, fromUnit: 'arcseconds', toUnit: 'degrees' });
    expect(result.convertedValue).toBe(1);
  });

  // ─── Test 13: 1 turn = 2π radians ───
  it('converts 1 turn to 2π radians', () => {
    const result = calculateAngleConvert({ value: 1, fromUnit: 'turns', toUnit: 'radians' });
    expect(result.convertedValue).toBeCloseTo(2 * Math.PI, 4);
  });

  // ─── Test 14: Same unit returns same value ───
  it('returns same value for same-unit conversion', () => {
    const result = calculateAngleConvert({ value: 45, fromUnit: 'degrees', toUnit: 'degrees' });
    expect(result.convertedValue).toBe(45);
  });

  // ─── Test 15: Zero value ───
  it('returns zero for zero value', () => {
    const result = calculateAngleConvert({ value: 0, fromUnit: 'degrees', toUnit: 'radians' });
    expect(result.convertedValue).toBe(0);
  });

  // ─── Test 16: Negative value treated as zero ───
  it('treats negative value as zero', () => {
    const result = calculateAngleConvert({ value: -90, fromUnit: 'degrees', toUnit: 'radians' });
    expect(result.convertedValue).toBe(0);
  });

  // ─── Test 17: Conversion rate degrees to radians ───
  it('conversionRate for degrees to radians is π/180', () => {
    const result = calculateAngleConvert({ value: 1, fromUnit: 'degrees', toUnit: 'radians' });
    expect(result.conversionRate).toBeCloseTo(Math.PI / 180, 5);
  });

  // ─── Test 18: Inverse rate degrees to radians ───
  it('inverseRate for degrees to radians is 180/π', () => {
    const result = calculateAngleConvert({ value: 1, fromUnit: 'degrees', toUnit: 'radians' });
    expect(result.inverseRate).toBeCloseTo(180 / Math.PI, 4);
  });

  // ─── Test 19: conversionDisplay formatted correctly ───
  it('conversionDisplay is formatted correctly', () => {
    const result = calculateAngleConvert({ value: 90, fromUnit: 'degrees', toUnit: 'gradians' });
    expect(result.conversionDisplay).toBe('90 degrees = 100 gradians');
  });

  // ─── Test 20: conversionTable has 6 entries ───
  it('conversionTable contains 6 entries (one per unit)', () => {
    const result = calculateAngleConvert({ value: 180, fromUnit: 'degrees', toUnit: 'radians' });
    const table = result.conversionTable as Array<{ label: string; value: number }>;
    expect(table).toHaveLength(6);
  });

  // ─── Test 21: conversionTable entry structure ───
  it('conversionTable entries have correct structure', () => {
    const result = calculateAngleConvert({ value: 180, fromUnit: 'degrees', toUnit: 'radians' });
    const table = result.conversionTable as Array<{ label: string; value: number }>;
    expect(table[0]).toHaveProperty('label');
    expect(table[0]).toHaveProperty('value');
    // First entry is Degrees: 180 degrees in degrees = 180
    expect(table[0].label).toBe('Degrees');
    expect(table[0].value).toBe(180);
  });

  // ─── Test 22: Output has all expected keys ───
  it('returns all expected output keys', () => {
    const result = calculateAngleConvert({ value: 90, fromUnit: 'degrees', toUnit: 'radians' });
    expect(result).toHaveProperty('convertedValue');
    expect(result).toHaveProperty('fromUnit');
    expect(result).toHaveProperty('toUnit');
    expect(result).toHaveProperty('conversionRate');
    expect(result).toHaveProperty('inverseRate');
    expect(result).toHaveProperty('conversionDisplay');
    expect(result).toHaveProperty('conversionTable');
  });

  // ─── Test 23: Large angle: 720° = 2 turns ───
  it('converts 720 degrees to 2 turns', () => {
    const result = calculateAngleConvert({ value: 720, fromUnit: 'degrees', toUnit: 'turns' });
    expect(result.convertedValue).toBe(2);
  });

  // ─── Test 24: Defaults to degrees → radians when units omitted ───
  it('defaults to degrees → radians when units omitted', () => {
    const result = calculateAngleConvert({ value: 180 });
    expect(result.fromUnit).toBe('degrees');
    expect(result.toUnit).toBe('radians');
    expect(result.convertedValue).toBeCloseTo(Math.PI, 5);
  });
});
