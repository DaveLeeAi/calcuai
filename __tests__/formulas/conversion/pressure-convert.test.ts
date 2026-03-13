import { calculatePressureConvert } from '@/lib/formulas/conversion/pressure-convert';

describe('calculatePressureConvert', () => {
  // ─── Test 1: 1 atm = 14.696 psi ───
  it('converts 1 atmosphere to approximately 14.696 psi', () => {
    const result = calculatePressureConvert({ value: 1, fromUnit: 'atmosphere', toUnit: 'psi' });
    expect(result.convertedValue).toBeCloseTo(14.696, 2);
  });

  // ─── Test 2: 1 atm = 101,325 Pa ───
  it('converts 1 atmosphere to 101325 pascal', () => {
    const result = calculatePressureConvert({ value: 1, fromUnit: 'atmosphere', toUnit: 'pascal' });
    expect(result.convertedValue).toBe(101325);
  });

  // ─── Test 3: 1 atm = 101.325 kPa ───
  it('converts 1 atmosphere to 101.325 kilopascal', () => {
    const result = calculatePressureConvert({ value: 1, fromUnit: 'atmosphere', toUnit: 'kilopascal' });
    expect(result.convertedValue).toBe(101.325);
  });

  // ─── Test 4: 1 atm = 1.01325 bar ───
  it('converts 1 atmosphere to approximately 1.01325 bar', () => {
    const result = calculatePressureConvert({ value: 1, fromUnit: 'atmosphere', toUnit: 'bar' });
    expect(result.convertedValue).toBe(1.01325);
  });

  // ─── Test 5: 1 bar = 100,000 Pa ───
  it('converts 1 bar to 100000 pascal', () => {
    const result = calculatePressureConvert({ value: 1, fromUnit: 'bar', toUnit: 'pascal' });
    expect(result.convertedValue).toBe(100000);
  });

  // ─── Test 6: 1 bar to psi ───
  it('converts 1 bar to approximately 14.504 psi', () => {
    const result = calculatePressureConvert({ value: 1, fromUnit: 'bar', toUnit: 'psi' });
    expect(result.convertedValue).toBeCloseTo(14.504, 2);
  });

  // ─── Test 7: 760 mmHg = 1 atm ───
  it('converts 760 mmHg to approximately 1 atmosphere', () => {
    const result = calculatePressureConvert({ value: 760, fromUnit: 'mmhg', toUnit: 'atmosphere' });
    expect(result.convertedValue).toBeCloseTo(1, 2);
  });

  // ─── Test 8: 1 atm to mmHg ───
  it('converts 1 atmosphere to approximately 760 mmHg', () => {
    const result = calculatePressureConvert({ value: 1, fromUnit: 'atmosphere', toUnit: 'mmhg' });
    expect(result.convertedValue).toBeCloseTo(760, 0);
  });

  // ─── Test 9: 1 atm to inHg ───
  it('converts 1 atmosphere to approximately 29.921 inHg', () => {
    const result = calculatePressureConvert({ value: 1, fromUnit: 'atmosphere', toUnit: 'inhg' });
    expect(result.convertedValue).toBeCloseTo(29.921, 1);
  });

  // ─── Test 10: psi to kPa ───
  it('converts 1 psi to approximately 6.895 kPa', () => {
    const result = calculatePressureConvert({ value: 1, fromUnit: 'psi', toUnit: 'kilopascal' });
    expect(result.convertedValue).toBeCloseTo(6.895, 2);
  });

  // ─── Test 11: Zero value ───
  it('returns zero for zero value', () => {
    const result = calculatePressureConvert({ value: 0, fromUnit: 'atmosphere', toUnit: 'psi' });
    expect(result.convertedValue).toBe(0);
  });

  // ─── Test 12: Same unit returns same value ───
  it('returns same value for same-unit conversion', () => {
    const result = calculatePressureConvert({ value: 42, fromUnit: 'psi', toUnit: 'psi' });
    expect(result.convertedValue).toBe(42);
  });

  // ─── Test 13: Negative value treated as zero ───
  it('treats negative value as zero', () => {
    const result = calculatePressureConvert({ value: -100, fromUnit: 'pascal', toUnit: 'psi' });
    expect(result.convertedValue).toBe(0);
  });

  // ─── Test 14: Large value — 1,000,000 Pa ───
  it('handles large values: 1,000,000 Pa to atm', () => {
    const result = calculatePressureConvert({ value: 1000000, fromUnit: 'pascal', toUnit: 'atmosphere' });
    expect(result.convertedValue).toBeCloseTo(9.8692, 3);
  });

  // ─── Test 15: Conversion rate atm to psi ───
  it('conversionRate for atm to psi is approximately 14.696', () => {
    const result = calculatePressureConvert({ value: 1, fromUnit: 'atmosphere', toUnit: 'psi' });
    expect(result.conversionRate).toBeCloseTo(14.696, 2);
  });

  // ─── Test 16: Inverse rate atm to psi ───
  it('inverseRate for atm to psi is approximately 0.068', () => {
    const result = calculatePressureConvert({ value: 1, fromUnit: 'atmosphere', toUnit: 'psi' });
    expect(result.inverseRate).toBeCloseTo(0.068, 2);
  });

  // ─── Test 17: conversionDisplay formatted correctly ───
  it('conversionDisplay is formatted correctly', () => {
    const result = calculatePressureConvert({ value: 1, fromUnit: 'atmosphere', toUnit: 'bar' });
    expect(result.conversionDisplay).toBe('1 atmosphere = 1.01325 bar');
  });

  // ─── Test 18: conversionTable has 7 entries ───
  it('conversionTable contains 7 entries (one per unit)', () => {
    const result = calculatePressureConvert({ value: 1, fromUnit: 'atmosphere', toUnit: 'psi' });
    const table = result.conversionTable as Array<{ label: string; value: number }>;
    expect(table).toHaveLength(7);
  });

  // ─── Test 19: conversionTable structure ───
  it('conversionTable entries have correct structure', () => {
    const result = calculatePressureConvert({ value: 1, fromUnit: 'atmosphere', toUnit: 'psi' });
    const table = result.conversionTable as Array<{ label: string; value: number }>;
    expect(table[0]).toHaveProperty('label');
    expect(table[0]).toHaveProperty('value');
    // First entry is Pascal: 1 atm = 101325 Pa
    expect(table[0].label).toBe('Pascal');
    expect(table[0].value).toBe(101325);
  });

  // ─── Test 20: Output has all expected keys ───
  it('returns all expected output keys', () => {
    const result = calculatePressureConvert({ value: 1, fromUnit: 'atmosphere', toUnit: 'psi' });
    expect(result).toHaveProperty('convertedValue');
    expect(result).toHaveProperty('fromUnit');
    expect(result).toHaveProperty('toUnit');
    expect(result).toHaveProperty('conversionRate');
    expect(result).toHaveProperty('inverseRate');
    expect(result).toHaveProperty('conversionDisplay');
    expect(result).toHaveProperty('conversionTable');
  });

  // ─── Test 21: inHg to mmHg ───
  it('converts 29.92 inHg to approximately 760 mmHg', () => {
    const result = calculatePressureConvert({ value: 29.92, fromUnit: 'inhg', toUnit: 'mmhg' });
    expect(result.convertedValue).toBeCloseTo(760, 0);
  });

  // ─── Test 22: kPa to bar ───
  it('converts 100 kPa to 1 bar', () => {
    const result = calculatePressureConvert({ value: 100, fromUnit: 'kilopascal', toUnit: 'bar' });
    expect(result.convertedValue).toBe(1);
  });

  // ─── Test 23: Defaults to atm → psi when units omitted ───
  it('defaults to atmosphere → psi when units omitted', () => {
    const result = calculatePressureConvert({ value: 1 });
    expect(result.fromUnit).toBe('atmosphere');
    expect(result.toUnit).toBe('psi');
    expect(result.convertedValue).toBeCloseTo(14.696, 2);
  });

  // ─── Test 24: Small value — 0.001 atm ───
  it('handles small values: 0.001 atm to pascal', () => {
    const result = calculatePressureConvert({ value: 0.001, fromUnit: 'atmosphere', toUnit: 'pascal' });
    expect(result.convertedValue).toBe(101.325);
  });
});
