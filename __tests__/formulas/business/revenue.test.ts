import { calculateRevenue } from '@/lib/formulas/business/revenue';

describe('calculateRevenue', () => {
  // ─── Test 1: Basic monthly revenue (500 × $29.99) ───
  it('calculates basic monthly revenue correctly', () => {
    const result = calculateRevenue({
      pricePerUnit: 29.99,
      unitsSold: 500,
      timePeriod: 'monthly',
      growthRate: 0,
      projectionPeriods: 12,
    });
    // 29.99 × 500 = 14995
    expect(result.totalRevenue).toBe(14995);
  });

  // ─── Test 2: Annual revenue calculation ───
  it('calculates annual revenue from monthly period', () => {
    const result = calculateRevenue({
      pricePerUnit: 29.99,
      unitsSold: 500,
      timePeriod: 'monthly',
      growthRate: 0,
      projectionPeriods: 12,
    });
    // 14995 × 12 = 179940
    expect(result.annualRevenue).toBe(179940);
  });

  // ─── Test 3: Revenue per day ───
  it('calculates revenue per day correctly', () => {
    const result = calculateRevenue({
      pricePerUnit: 29.99,
      unitsSold: 500,
      timePeriod: 'monthly',
      growthRate: 0,
      projectionPeriods: 12,
    });
    // 179940 / 365 = 493.01...
    expect(result.revenuePerDay).toBeCloseTo(493.01, 0);
  });

  // ─── Test 4: Revenue projection with growth ───
  it('calculates projected revenue with 5% monthly growth', () => {
    const result = calculateRevenue({
      pricePerUnit: 29.99,
      unitsSold: 500,
      timePeriod: 'monthly',
      growthRate: 5,
      projectionPeriods: 12,
    });
    // 14995 × (1.05)^12 = 14995 × 1.795856... ≈ 26,928.87
    expect(result.projectedRevenue).toBeCloseTo(26928.87, 0);
  });

  // ─── Test 5: Zero units sold ───
  it('returns zero revenue for zero units sold', () => {
    const result = calculateRevenue({
      pricePerUnit: 29.99,
      unitsSold: 0,
      timePeriod: 'monthly',
      growthRate: 5,
      projectionPeriods: 12,
    });
    expect(result.totalRevenue).toBe(0);
    expect(result.annualRevenue).toBe(0);
    expect(result.revenuePerDay).toBe(0);
    expect(result.projectedRevenue).toBe(0);
  });

  // ─── Test 6: Zero price ───
  it('returns zero revenue for zero price per unit', () => {
    const result = calculateRevenue({
      pricePerUnit: 0,
      unitsSold: 500,
      timePeriod: 'monthly',
      growthRate: 5,
      projectionPeriods: 12,
    });
    expect(result.totalRevenue).toBe(0);
    expect(result.annualRevenue).toBe(0);
  });

  // ─── Test 7: High volume (1,000,000 units) ───
  it('handles high volume correctly', () => {
    const result = calculateRevenue({
      pricePerUnit: 9.99,
      unitsSold: 1000000,
      timePeriod: 'monthly',
      growthRate: 0,
      projectionPeriods: 1,
    });
    // 9.99 × 1,000,000 = 9,990,000
    expect(result.totalRevenue).toBe(9990000);
    expect(result.annualRevenue).toBe(119880000);
  });

  // ─── Test 8: No growth (0%) ───
  it('projected revenue equals total revenue with 0% growth', () => {
    const result = calculateRevenue({
      pricePerUnit: 50,
      unitsSold: 200,
      timePeriod: 'monthly',
      growthRate: 0,
      projectionPeriods: 12,
    });
    // With 0% growth, projected = total
    expect(result.projectedRevenue).toBe(result.totalRevenue);
  });

  // ─── Test 9: Negative growth (-5%) ───
  it('handles negative growth rate correctly', () => {
    const result = calculateRevenue({
      pricePerUnit: 100,
      unitsSold: 100,
      timePeriod: 'monthly',
      growthRate: -5,
      projectionPeriods: 12,
    });
    // 10000 × (0.95)^12 = 10000 × 0.54036... = 5403.65
    expect(result.projectedRevenue).toBeCloseTo(5403.65, 0);
    expect(result.projectedRevenue).toBeLessThan(result.totalRevenue as number);
  });

  // ─── Test 10: Quarterly time period ───
  it('calculates annual revenue correctly for quarterly period', () => {
    const result = calculateRevenue({
      pricePerUnit: 100,
      unitsSold: 1000,
      timePeriod: 'quarterly',
      growthRate: 0,
      projectionPeriods: 4,
    });
    // Total per quarter = 100,000
    expect(result.totalRevenue).toBe(100000);
    // Annual = 100,000 × 4 = 400,000
    expect(result.annualRevenue).toBe(400000);
  });

  // ─── Test 11: Annual time period ───
  it('calculates annual revenue correctly for annual period', () => {
    const result = calculateRevenue({
      pricePerUnit: 50,
      unitsSold: 10000,
      timePeriod: 'annual',
      growthRate: 0,
      projectionPeriods: 5,
    });
    // Total = 500,000
    expect(result.totalRevenue).toBe(500000);
    // Annual = total × 1 = 500,000
    expect(result.annualRevenue).toBe(500000);
  });

  // ─── Test 12: Revenue projection chart data exists ───
  it('generates revenue projection chart data with correct length', () => {
    const result = calculateRevenue({
      pricePerUnit: 29.99,
      unitsSold: 500,
      timePeriod: 'monthly',
      growthRate: 5,
      projectionPeriods: 12,
    });
    const chart = result.revenueProjection as { period: number; revenue: number }[];
    // Should have 13 points (period 0 through 12)
    expect(chart.length).toBe(13);
    expect(chart[0].period).toBe(0);
    expect(chart[0].revenue).toBe(14995);
    expect(chart[12].period).toBe(12);
    // Last period should match projectedRevenue
    expect(chart[12].revenue).toBe(result.projectedRevenue);
  });

  // ─── Test 13: Summary contains correct labels ───
  it('returns summary with all expected labels', () => {
    const result = calculateRevenue({
      pricePerUnit: 29.99,
      unitsSold: 500,
      timePeriod: 'monthly',
      growthRate: 5,
      projectionPeriods: 12,
    });
    const summary = result.summary as { label: string; value: number }[];
    const labels = summary.map((s) => s.label);
    expect(labels).toContain('Total Revenue (per period)');
    expect(labels).toContain('Annual Revenue');
    expect(labels).toContain('Revenue per Day');
    expect(labels).toContain('Projected Revenue');
    expect(labels).toContain('Growth Rate');
    expect(labels).toContain('Projection Periods');
  });

  // ─── Test 14: Missing inputs default to safe values ───
  it('uses defaults for missing inputs', () => {
    const result = calculateRevenue({});
    expect(result.totalRevenue).toBe(0);
    expect(result.annualRevenue).toBe(0);
    expect(result.revenuePerDay).toBe(0);
    expect(result.projectedRevenue).toBe(0);
  });

  // ─── Test 15: Projection periods clamped to valid range ───
  it('clamps projection periods to max 60', () => {
    const result = calculateRevenue({
      pricePerUnit: 10,
      unitsSold: 100,
      timePeriod: 'monthly',
      growthRate: 1,
      projectionPeriods: 100,
    });
    const chart = result.revenueProjection as { period: number; revenue: number }[];
    // Should be clamped to 60 + 1 (period 0) = 61 points
    expect(chart.length).toBe(61);
  });
});
