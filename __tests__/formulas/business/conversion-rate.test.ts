import { calculateConversionRate } from '@/lib/formulas/business/conversion-rate';

describe('calculateConversionRate', () => {
  // ─── Test 1: Basic conversion rate ───
  it('calculates basic conversion rate', () => {
    const result = calculateConversionRate({
      totalVisitors: 10000,
      conversions: 250,
    });
    // 250/10000 × 100 = 2.5%
    expect(result.conversionRate).toBe(2.5);
  });

  // ─── Test 2: Non-conversion rate ───
  it('calculates non-conversion rate', () => {
    const result = calculateConversionRate({
      totalVisitors: 10000,
      conversions: 250,
    });
    expect(result.nonConversionRate).toBe(97.5);
  });

  // ─── Test 3: Visitors per conversion ───
  it('calculates visitors per conversion', () => {
    const result = calculateConversionRate({
      totalVisitors: 10000,
      conversions: 250,
    });
    // 10000 / 250 = 40
    expect(result.visitorsPerConversion).toBe(40);
  });

  // ─── Test 4: 100% conversion rate ───
  it('handles 100% conversion rate', () => {
    const result = calculateConversionRate({
      totalVisitors: 500,
      conversions: 500,
    });
    expect(result.conversionRate).toBe(100);
    expect(result.nonConversionRate).toBe(0);
    expect(result.visitorsPerConversion).toBe(1);
  });

  // ─── Test 5: Zero conversions ───
  it('handles zero conversions', () => {
    const result = calculateConversionRate({
      totalVisitors: 5000,
      conversions: 0,
    });
    expect(result.conversionRate).toBe(0);
    expect(result.nonConversionRate).toBe(100);
    expect(result.visitorsPerConversion).toBe(0);
  });

  // ─── Test 6: Zero visitors ───
  it('handles zero visitors gracefully', () => {
    const result = calculateConversionRate({
      totalVisitors: 0,
      conversions: 0,
    });
    expect(result.conversionRate).toBe(0);
    expect(result.nonConversionRate).toBe(100);
  });

  // ─── Test 7: Low conversion rate ───
  it('calculates low conversion rate accurately', () => {
    const result = calculateConversionRate({
      totalVisitors: 100000,
      conversions: 50,
    });
    // 50/100000 × 100 = 0.05%
    expect(result.conversionRate).toBe(0.05);
  });

  // ─── Test 8: High conversion rate ───
  it('calculates high conversion rate', () => {
    const result = calculateConversionRate({
      totalVisitors: 200,
      conversions: 150,
    });
    // 150/200 × 100 = 75%
    expect(result.conversionRate).toBe(75);
    expect(result.nonConversionRate).toBe(25);
  });

  // ─── Test 9: Single visitor, single conversion ───
  it('handles single visitor with conversion', () => {
    const result = calculateConversionRate({
      totalVisitors: 1,
      conversions: 1,
    });
    expect(result.conversionRate).toBe(100);
    expect(result.visitorsPerConversion).toBe(1);
  });

  // ─── Test 10: Large numbers ───
  it('handles very large visitor counts', () => {
    const result = calculateConversionRate({
      totalVisitors: 10000000,
      conversions: 300000,
    });
    // 300000/10000000 × 100 = 3%
    expect(result.conversionRate).toBe(3);
  });

  // ─── Test 11: String coercion ───
  it('coerces string inputs to numbers', () => {
    const result = calculateConversionRate({
      totalVisitors: '5000',
      conversions: '100',
    });
    expect(result.conversionRate).toBe(2);
  });

  // ─── Test 12: Missing inputs ───
  it('handles missing inputs gracefully', () => {
    const result = calculateConversionRate({});
    expect(result.conversionRate).toBe(0);
    expect(result.nonConversionRate).toBe(100);
  });

  // ─── Test 13: Fractional conversion rate precision ───
  it('handles fractional percentages with 2 decimal precision', () => {
    const result = calculateConversionRate({
      totalVisitors: 3000,
      conversions: 7,
    });
    // 7/3000 × 100 = 0.2333... → rounds to 0.23
    expect(result.conversionRate).toBeCloseTo(0.23, 2);
  });

  // ─── Test 14: Visitors per conversion with rounding ───
  it('rounds visitors per conversion to 1 decimal', () => {
    const result = calculateConversionRate({
      totalVisitors: 1000,
      conversions: 3,
    });
    // 1000 / 3 = 333.33... → 333.3
    expect(result.visitorsPerConversion).toBe(333.3);
  });

  // ─── Test 15: Summary contains expected fields ───
  it('returns summary with expected labels', () => {
    const result = calculateConversionRate({
      totalVisitors: 10000,
      conversions: 250,
    });
    const summary = result.summary as { label: string; value: number | string }[];
    const labels = summary.map((s) => s.label);
    expect(labels).toContain('Total Visitors');
    expect(labels).toContain('Conversions');
    expect(labels).toContain('Conversion Rate');
    expect(labels).toContain('Non-Conversion Rate');
    expect(labels).toContain('Visitors per Conversion');
  });

  // ─── Test 16: All output fields present ───
  it('returns all expected output fields', () => {
    const result = calculateConversionRate({
      totalVisitors: 10000,
      conversions: 250,
    });
    expect(result).toHaveProperty('conversionRate');
    expect(result).toHaveProperty('nonConversionRate');
    expect(result).toHaveProperty('visitorsPerConversion');
    expect(result).toHaveProperty('summary');
  });

  // ─── Test 17: Negative inputs clamped to zero ───
  it('clamps negative inputs to zero', () => {
    const result = calculateConversionRate({
      totalVisitors: -100,
      conversions: -5,
    });
    expect(result.conversionRate).toBe(0);
  });

  // ─── Test 18: Conversions greater than visitors ───
  it('handles conversions exceeding visitors (over 100%)', () => {
    const result = calculateConversionRate({
      totalVisitors: 100,
      conversions: 150,
    });
    // Some businesses count multiple conversions per visitor
    expect(result.conversionRate).toBe(150);
  });

  // ─── Test 19: E-commerce typical scenario ───
  it('calculates typical e-commerce conversion rate', () => {
    const result = calculateConversionRate({
      totalVisitors: 45000,
      conversions: 1125,
    });
    // 1125/45000 × 100 = 2.5%
    expect(result.conversionRate).toBe(2.5);
    expect(result.visitorsPerConversion).toBe(40);
  });

  // ─── Test 20: Email marketing scenario ───
  it('calculates email click-to-conversion rate', () => {
    const result = calculateConversionRate({
      totalVisitors: 2500,
      conversions: 375,
    });
    // 375/2500 × 100 = 15%
    expect(result.conversionRate).toBe(15);
    expect(result.nonConversionRate).toBe(85);
  });

  // ─── Test 21: One conversion from many visitors ───
  it('handles 1 conversion from many visitors', () => {
    const result = calculateConversionRate({
      totalVisitors: 50000,
      conversions: 1,
    });
    expect(result.conversionRate).toBe(0);
    expect(result.visitorsPerConversion).toBe(50000);
  });
});
