import { calculateEnergyConvert } from '@/lib/formulas/conversion/energy-convert';

describe('calculateEnergyConvert', () => {
  // ─── Test 1: 1 joule = 1 joule (identity) ───
  it('returns same value for same-unit conversion', () => {
    const result = calculateEnergyConvert({ value: 42, fromUnit: 'joule', toUnit: 'joule' });
    expect(result.convertedValue).toBe(42);
  });

  // ─── Test 2: 1 kJ = 1000 J ───
  it('converts 1 kilojoule to 1000 joules', () => {
    const result = calculateEnergyConvert({ value: 1, fromUnit: 'kilojoule', toUnit: 'joule' });
    expect(result.convertedValue).toBe(1000);
  });

  // ─── Test 3: 1000 J = 1 kJ ───
  it('converts 1000 joules to 1 kilojoule', () => {
    const result = calculateEnergyConvert({ value: 1000, fromUnit: 'joule', toUnit: 'kilojoule' });
    expect(result.convertedValue).toBe(1);
  });

  // ─── Test 4: 1 calorie = 4.184 J ───
  it('converts 1 calorie to 4.184 joules', () => {
    const result = calculateEnergyConvert({ value: 1, fromUnit: 'calorie', toUnit: 'joule' });
    expect(result.convertedValue).toBe(4.184);
  });

  // ─── Test 5: 1 kcal = 4184 J ───
  it('converts 1 kilocalorie to 4184 joules', () => {
    const result = calculateEnergyConvert({ value: 1, fromUnit: 'kilocalorie', toUnit: 'joule' });
    expect(result.convertedValue).toBe(4184);
  });

  // ─── Test 6: 1 kcal = 1000 cal ───
  it('converts 1 kilocalorie to 1000 calories', () => {
    const result = calculateEnergyConvert({ value: 1, fromUnit: 'kilocalorie', toUnit: 'calorie' });
    expect(result.convertedValue).toBe(1000);
  });

  // ─── Test 7: 1 Wh = 3600 J ───
  it('converts 1 watt-hour to 3600 joules', () => {
    const result = calculateEnergyConvert({ value: 1, fromUnit: 'watt-hour', toUnit: 'joule' });
    expect(result.convertedValue).toBe(3600);
  });

  // ─── Test 8: 1 kWh = 3,600,000 J ───
  it('converts 1 kilowatt-hour to 3600000 joules', () => {
    const result = calculateEnergyConvert({ value: 1, fromUnit: 'kilowatt-hour', toUnit: 'joule' });
    expect(result.convertedValue).toBe(3600000);
  });

  // ─── Test 9: 1 kWh = 1000 Wh ───
  it('converts 1 kilowatt-hour to 1000 watt-hours', () => {
    const result = calculateEnergyConvert({ value: 1, fromUnit: 'kilowatt-hour', toUnit: 'watt-hour' });
    expect(result.convertedValue).toBe(1000);
  });

  // ─── Test 10: 1 BTU = 1055.06 J ───
  it('converts 1 BTU to 1055.06 joules', () => {
    const result = calculateEnergyConvert({ value: 1, fromUnit: 'btu', toUnit: 'joule' });
    expect(result.convertedValue).toBe(1055.06);
  });

  // ─── Test 11: 1 BTU ≈ 0.252164 kcal ───
  it('converts 1 BTU to approximately 0.252 kilocalories', () => {
    const result = calculateEnergyConvert({ value: 1, fromUnit: 'btu', toUnit: 'kilocalorie' });
    expect(result.convertedValue).toBeCloseTo(0.252164, 4);
  });

  // ─── Test 12: 1 kWh ≈ 3412.14 BTU ───
  it('converts 1 kWh to approximately 3412.14 BTU', () => {
    const result = calculateEnergyConvert({ value: 1, fromUnit: 'kilowatt-hour', toUnit: 'btu' });
    expect(result.convertedValue).toBeCloseTo(3412.14, 1);
  });

  // ─── Test 13: 1 ft-lbf = 1.355818 J ───
  it('converts 1 foot-pound to 1.355818 joules', () => {
    const result = calculateEnergyConvert({ value: 1, fromUnit: 'foot-pound', toUnit: 'joule' });
    expect(result.convertedValue).toBe(1.355818);
  });

  // ─── Test 14: 1 J = 10,000,000 erg ───
  it('converts 1 joule to 10000000 erg', () => {
    const result = calculateEnergyConvert({ value: 1, fromUnit: 'joule', toUnit: 'erg' });
    expect(result.convertedValue).toBe(10000000);
  });

  // ─── Test 15: 1e7 erg = 1 J ───
  it('converts 10000000 erg to 1 joule', () => {
    const result = calculateEnergyConvert({ value: 10000000, fromUnit: 'erg', toUnit: 'joule' });
    expect(result.convertedValue).toBe(1);
  });

  // ─── Test 16: Zero value ───
  it('returns zero for zero value', () => {
    const result = calculateEnergyConvert({ value: 0, fromUnit: 'joule', toUnit: 'btu' });
    expect(result.convertedValue).toBe(0);
  });

  // ─── Test 17: Negative value treated as zero ───
  it('treats negative value as zero', () => {
    const result = calculateEnergyConvert({ value: -500, fromUnit: 'joule', toUnit: 'calorie' });
    expect(result.convertedValue).toBe(0);
  });

  // ─── Test 18: Large value — 1,000,000 J ───
  it('handles large values: 1000000 J to kWh', () => {
    const result = calculateEnergyConvert({ value: 1000000, fromUnit: 'joule', toUnit: 'kilowatt-hour' });
    expect(result.convertedValue).toBeCloseTo(0.277778, 4);
  });

  // ─── Test 19: Round-trip A→B→A ───
  it('round-trip conversion returns original value', () => {
    const forward = calculateEnergyConvert({ value: 100, fromUnit: 'btu', toUnit: 'kilocalorie' });
    const back = calculateEnergyConvert({ value: forward.convertedValue, fromUnit: 'kilocalorie', toUnit: 'btu' });
    expect(back.convertedValue).toBeCloseTo(100, 3);
  });

  // ─── Test 20: Conversion rate kJ to cal ───
  it('conversionRate for kilojoule to calorie is approximately 239.006', () => {
    const result = calculateEnergyConvert({ value: 1, fromUnit: 'kilojoule', toUnit: 'calorie' });
    expect(result.conversionRate).toBeCloseTo(239.006, 2);
  });

  // ─── Test 21: Inverse rate kJ to cal ───
  it('inverseRate for kilojoule to calorie is approximately 0.004184', () => {
    const result = calculateEnergyConvert({ value: 1, fromUnit: 'kilojoule', toUnit: 'calorie' });
    expect(result.inverseRate).toBeCloseTo(0.004184, 4);
  });

  // ─── Test 22: conversionDisplay formatted correctly ───
  it('conversionDisplay is formatted correctly', () => {
    const result = calculateEnergyConvert({ value: 1, fromUnit: 'kilowatt-hour', toUnit: 'btu' });
    const display = result.conversionDisplay as string;
    expect(display).toContain('1 kilowatt-hour =');
    expect(display).toContain('btu');
  });

  // ─── Test 23: conversionTable has 10 entries ───
  it('conversionTable contains 10 entries (one per unit)', () => {
    const result = calculateEnergyConvert({ value: 1, fromUnit: 'joule', toUnit: 'calorie' });
    const table = result.conversionTable as Array<{ label: string; value: number }>;
    expect(table).toHaveLength(10);
  });

  // ─── Test 24: Output has all expected keys ───
  it('returns all expected output keys', () => {
    const result = calculateEnergyConvert({ value: 1, fromUnit: 'joule', toUnit: 'calorie' });
    expect(result).toHaveProperty('convertedValue');
    expect(result).toHaveProperty('fromUnit');
    expect(result).toHaveProperty('toUnit');
    expect(result).toHaveProperty('conversionRate');
    expect(result).toHaveProperty('inverseRate');
    expect(result).toHaveProperty('conversionDisplay');
    expect(result).toHaveProperty('conversionTable');
  });

  // ─── Test 25: Defaults to joule → kilocalorie when units omitted ───
  it('defaults to joule → kilocalorie when units omitted', () => {
    const result = calculateEnergyConvert({ value: 4184 });
    expect(result.fromUnit).toBe('joule');
    expect(result.toUnit).toBe('kilocalorie');
    expect(result.convertedValue).toBe(1);
  });

  // ─── Test 26: 1e19 eV to joules ───
  it('converts 1e19 electronvolts to approximately 1.602 joules', () => {
    const result = calculateEnergyConvert({ value: 1e19, fromUnit: 'electronvolt', toUnit: 'joule' });
    expect(result.convertedValue).toBeCloseTo(1.602177, 4);
  });

  // ─── Test 27: conversionTable structure ───
  it('conversionTable entries have correct structure', () => {
    const result = calculateEnergyConvert({ value: 1, fromUnit: 'joule', toUnit: 'calorie' });
    const table = result.conversionTable as Array<{ label: string; value: number }>;
    expect(table[0]).toHaveProperty('label');
    expect(table[0]).toHaveProperty('value');
    expect(table[0].label).toBe('Joule');
    expect(table[0].value).toBe(1);
  });

  // ─── Test 28: String input coercion ───
  it('handles string input values correctly', () => {
    const result = calculateEnergyConvert({ value: '3600', fromUnit: 'joule', toUnit: 'watt-hour' });
    expect(result.convertedValue).toBe(1);
  });
});
