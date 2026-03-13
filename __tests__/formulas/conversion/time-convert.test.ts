import { calculateTimeConvert } from '@/lib/formulas/conversion/time-convert';

describe('calculateTimeConvert', () => {
  // ─── Test 1: Hours to minutes (1 hr = 60 min) ───
  it('converts 1 hour to 60 minutes', () => {
    const result = calculateTimeConvert({ value: 1, fromUnit: 'hours', toUnit: 'minutes' });
    expect(result.convertedValue).toBe(60);
  });

  // ─── Test 2: Minutes to seconds (1 min = 60 s) ───
  it('converts 1 minute to 60 seconds', () => {
    const result = calculateTimeConvert({ value: 1, fromUnit: 'minutes', toUnit: 'seconds' });
    expect(result.convertedValue).toBe(60);
  });

  // ─── Test 3: Days to hours (1 day = 24 hr) ───
  it('converts 1 day to 24 hours', () => {
    const result = calculateTimeConvert({ value: 1, fromUnit: 'days', toUnit: 'hours' });
    expect(result.convertedValue).toBe(24);
  });

  // ─── Test 4: Weeks to days (1 week = 7 days) ───
  it('converts 1 week to 7 days', () => {
    const result = calculateTimeConvert({ value: 1, fromUnit: 'weeks', toUnit: 'days' });
    expect(result.convertedValue).toBe(7);
  });

  // ─── Test 5: Years to days (1 year = 365.25 days) ───
  it('converts 1 year to 365.25 days', () => {
    const result = calculateTimeConvert({ value: 1, fromUnit: 'years', toUnit: 'days' });
    expect(result.convertedValue).toBe(365.25);
  });

  // ─── Test 6: Months to days (1 month = 30.44 avg days) ───
  it('converts 1 month to approximately 30.44 days', () => {
    const result = calculateTimeConvert({ value: 1, fromUnit: 'months', toUnit: 'days' });
    // 2629746 / 86400 = 30.436875
    expect(result.convertedValue).toBeCloseTo(30.4369, 3);
  });

  // ─── Test 7: Hours to seconds (1 hr = 3600 s) ───
  it('converts 1 hour to 3600 seconds', () => {
    const result = calculateTimeConvert({ value: 1, fromUnit: 'hours', toUnit: 'seconds' });
    expect(result.convertedValue).toBe(3600);
  });

  // ─── Test 8: Days to minutes (1 day = 1440 min) ───
  it('converts 1 day to 1440 minutes', () => {
    const result = calculateTimeConvert({ value: 1, fromUnit: 'days', toUnit: 'minutes' });
    expect(result.convertedValue).toBe(1440);
  });

  // ─── Test 9: Reverse — minutes to hours ───
  it('converts 120 minutes to 2 hours', () => {
    const result = calculateTimeConvert({ value: 120, fromUnit: 'minutes', toUnit: 'hours' });
    expect(result.convertedValue).toBe(2);
  });

  // ─── Test 10: Reverse — seconds to minutes ───
  it('converts 300 seconds to 5 minutes', () => {
    const result = calculateTimeConvert({ value: 300, fromUnit: 'seconds', toUnit: 'minutes' });
    expect(result.convertedValue).toBe(5);
  });

  // ─── Test 11: Same unit returns 1:1 ───
  it('returns same value for same-unit conversion', () => {
    const result = calculateTimeConvert({ value: 42, fromUnit: 'hours', toUnit: 'hours' });
    expect(result.convertedValue).toBe(42);
  });

  // ─── Test 12: Zero value ───
  it('returns zero for zero value', () => {
    const result = calculateTimeConvert({ value: 0, fromUnit: 'hours', toUnit: 'minutes' });
    expect(result.convertedValue).toBe(0);
  });

  // ─── Test 13: Large value — 1,000,000 seconds ───
  it('handles large values: 1,000,000 seconds to hours', () => {
    const result = calculateTimeConvert({ value: 1000000, fromUnit: 'seconds', toUnit: 'hours' });
    // 1000000 / 3600 = 277.777...
    expect(result.convertedValue).toBeCloseTo(277.7778, 3);
  });

  // ─── Test 14: Weeks to hours ───
  it('converts 2 weeks to 336 hours', () => {
    const result = calculateTimeConvert({ value: 2, fromUnit: 'weeks', toUnit: 'hours' });
    expect(result.convertedValue).toBe(336);
  });

  // ─── Test 15: Years to months ───
  it('converts 1 year to approximately 12 months', () => {
    const result = calculateTimeConvert({ value: 1, fromUnit: 'years', toUnit: 'months' });
    // 31557600 / 2629746 = ~12.0007
    expect(result.convertedValue).toBeCloseTo(12, 0);
  });

  // ─── Test 16: Conversion rate is correct ───
  it('conversionRate for hours to minutes is 60', () => {
    const result = calculateTimeConvert({ value: 1, fromUnit: 'hours', toUnit: 'minutes' });
    expect(result.conversionRate).toBe(60);
  });

  // ─── Test 17: Inverse rate is correct ───
  it('inverseRate for hours to minutes is 1/60', () => {
    const result = calculateTimeConvert({ value: 1, fromUnit: 'hours', toUnit: 'minutes' });
    expect(result.inverseRate).toBeCloseTo(0.016667, 5);
  });

  // ─── Test 18: conversionDisplay is a formatted string ───
  it('conversionDisplay is formatted correctly', () => {
    const result = calculateTimeConvert({ value: 5, fromUnit: 'hours', toUnit: 'minutes' });
    expect(result.conversionDisplay).toBe('5 hours = 300 minutes');
  });

  // ─── Test 19: conversionTable has 7 entries ───
  it('conversionTable contains 7 entries (one per unit)', () => {
    const result = calculateTimeConvert({ value: 1, fromUnit: 'hours', toUnit: 'minutes' });
    const table = result.conversionTable as Array<{ label: string; value: number }>;
    expect(table).toHaveLength(7);
  });

  // ─── Test 20: conversionTable structure ───
  it('conversionTable entries have correct structure', () => {
    const result = calculateTimeConvert({ value: 1, fromUnit: 'hours', toUnit: 'minutes' });
    const table = result.conversionTable as Array<{ label: string; value: number }>;
    expect(table[0]).toHaveProperty('label');
    expect(table[0]).toHaveProperty('value');
    // First entry is Seconds: 1 hour = 3600 seconds
    expect(table[0].label).toBe('Seconds');
    expect(table[0].value).toBe(3600);
  });

  // ─── Test 21: Negative value treated as zero ───
  it('treats negative value as zero', () => {
    const result = calculateTimeConvert({ value: -10, fromUnit: 'hours', toUnit: 'minutes' });
    expect(result.convertedValue).toBe(0);
  });

  // ─── Test 22: Output has all expected keys ───
  it('returns all expected output keys', () => {
    const result = calculateTimeConvert({ value: 1, fromUnit: 'hours', toUnit: 'minutes' });
    expect(result).toHaveProperty('convertedValue');
    expect(result).toHaveProperty('fromUnit');
    expect(result).toHaveProperty('toUnit');
    expect(result).toHaveProperty('conversionRate');
    expect(result).toHaveProperty('inverseRate');
    expect(result).toHaveProperty('conversionDisplay');
    expect(result).toHaveProperty('conversionTable');
  });

  // ─── Test 23: Decimal input ───
  it('handles decimal values: 2.5 hours to minutes', () => {
    const result = calculateTimeConvert({ value: 2.5, fromUnit: 'hours', toUnit: 'minutes' });
    expect(result.convertedValue).toBe(150);
  });

  // ─── Test 24: Defaults when fromUnit/toUnit missing ───
  it('defaults to hours → minutes when units omitted', () => {
    const result = calculateTimeConvert({ value: 1 });
    expect(result.fromUnit).toBe('hours');
    expect(result.toUnit).toBe('minutes');
    expect(result.convertedValue).toBe(60);
  });
});
