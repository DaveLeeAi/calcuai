import { calculateAOV } from '@/lib/formulas/ecommerce/average-order-value';

describe('calculateAOV', () => {
  it('calculates AOV correctly from revenue and orders', () => {
    const result = calculateAOV({ totalRevenue: 50000, numberOfOrders: 500, targetAOV: 120, monthlyOrders: 500 });
    expect(result.aov).toBeCloseTo(100, 2);
  });

  it('calculates AOV = $150 from $75,000 / 500 orders', () => {
    const result = calculateAOV({ totalRevenue: 75000, numberOfOrders: 500, targetAOV: 0, monthlyOrders: 500 });
    expect(result.aov).toBeCloseTo(150, 2);
  });

  it('calculates projected revenue at target AOV', () => {
    const result = calculateAOV({ totalRevenue: 50000, numberOfOrders: 500, targetAOV: 120, monthlyOrders: 500 });
    // 500 orders × $120 = $60,000
    expect(result.projectedRevenueAtTargetAOV).toBeCloseTo(60000, 0);
  });

  it('calculates annual AOV lift correctly', () => {
    // Current AOV = $100, target = $120, delta = $20, 500 monthly orders
    // Annual lift = $20 × 500 × 12 = $120,000
    const result = calculateAOV({ totalRevenue: 50000, numberOfOrders: 500, targetAOV: 120, monthlyOrders: 500 });
    expect(result.annualAOVLift).toBeCloseTo(120000, 0);
  });

  it('annual lift is 0 when no target AOV is set', () => {
    const result = calculateAOV({ totalRevenue: 50000, numberOfOrders: 500, targetAOV: 0, monthlyOrders: 500 });
    expect(result.annualAOVLift).toBe(0);
  });

  it('generates benchmark table with at least 4 scenarios', () => {
    const result = calculateAOV({ totalRevenue: 10000, numberOfOrders: 100, targetAOV: 0, monthlyOrders: 100 });
    const table = result.aovBenchmarkTable as unknown[];
    expect(table.length).toBeGreaterThanOrEqual(4);
  });

  it('benchmark table includes +10%, +20%, +30% rows', () => {
    const result = calculateAOV({ totalRevenue: 10000, numberOfOrders: 100, targetAOV: 0, monthlyOrders: 100 });
    const table = result.aovBenchmarkTable as { scenario: string }[];
    const scenarios = table.map((r) => r.scenario);
    expect(scenarios).toContain('+10%');
    expect(scenarios).toContain('+20%');
    expect(scenarios).toContain('+30%');
  });

  it('adds target row when target AOV differs from current', () => {
    const result = calculateAOV({ totalRevenue: 10000, numberOfOrders: 100, targetAOV: 200, monthlyOrders: 100 });
    const table = result.aovBenchmarkTable as { scenario: string }[];
    expect(table.some((r) => r.scenario === 'Target')).toBe(true);
  });

  it('handles single order edge case', () => {
    const result = calculateAOV({ totalRevenue: 250, numberOfOrders: 1, targetAOV: 0, monthlyOrders: 1 });
    expect(result.aov).toBe(250);
  });

  it('annual revenue in benchmark table is 12x monthly', () => {
    const result = calculateAOV({ totalRevenue: 10000, numberOfOrders: 100, targetAOV: 0, monthlyOrders: 100 });
    const table = result.aovBenchmarkTable as { monthlyRevenue: number; annualRevenue: number }[];
    const current = table.find((_, i) => i === 0)!;
    expect(current.annualRevenue).toBeCloseTo(current.monthlyRevenue * 12, 0);
  });

  it('summary contains 5 entries', () => {
    const result = calculateAOV({ totalRevenue: 50000, numberOfOrders: 500, targetAOV: 120, monthlyOrders: 500 });
    expect((result.summary as unknown[]).length).toBe(5);
  });
});
