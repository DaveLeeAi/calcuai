import { calculateAdBreakEven } from '@/lib/formulas/ecommerce/advertising-break-even';

describe('calculateAdBreakEven', () => {
  it('calculates break-even orders for $3k budget, $85 AOV, 40% COGS, 5% fees', () => {
    // Contribution margin = $85 × (1 - 0.4 - 0.05) = $85 × 0.55 = $46.75
    // Break-even orders = ceil($3000 / $46.75) = ceil(64.17) = 65
    const result = calculateAdBreakEven({ adBudget: 3000, averageOrderValue: 85, cogsPercent: 40, additionalCostsPercent: 5, currentConversionRate: 2.5 });
    expect(result.breakEvenOrders).toBe(65);
  });

  it('break-even CPA equals contribution margin', () => {
    // contribution margin = $85 × 0.55 = $46.75
    const result = calculateAdBreakEven({ adBudget: 3000, averageOrderValue: 85, cogsPercent: 40, additionalCostsPercent: 5, currentConversionRate: 2.5 });
    expect(result.breakEvenCPA).toBeCloseTo(46.75, 2);
  });

  it('break-even ROAS = 1 / net margin', () => {
    // net margin = 0.55 → ROAS = 1/0.55 ≈ 1.82
    const result = calculateAdBreakEven({ adBudget: 3000, averageOrderValue: 85, cogsPercent: 40, additionalCostsPercent: 5, currentConversionRate: 2.5 });
    expect(result.breakEvenROAS).toBeCloseTo(1 / 0.55, 1);
  });

  it('calculates traffic needed from conversion rate', () => {
    // break-even orders = 65, CVR = 2.5% → traffic = ceil(65/0.025) = 2600
    const result = calculateAdBreakEven({ adBudget: 3000, averageOrderValue: 85, cogsPercent: 40, additionalCostsPercent: 5, currentConversionRate: 2.5 });
    expect(result.trafficNeeded).toBe(2600);
  });

  it('generates scenario table with 5 rows', () => {
    const result = calculateAdBreakEven({ adBudget: 3000, averageOrderValue: 85, cogsPercent: 40, additionalCostsPercent: 5, currentConversionRate: 2.5 });
    expect((result.profitScenarioTable as unknown[]).length).toBe(5);
  });

  it('net after ads is negative at 50% of break-even orders', () => {
    const result = calculateAdBreakEven({ adBudget: 3000, averageOrderValue: 85, cogsPercent: 40, additionalCostsPercent: 5, currentConversionRate: 2.5 });
    const table = result.profitScenarioTable as { netAfterAds: number }[];
    expect(table[0].netAfterAds).toBeLessThan(0); // 50% of break-even → still losing money
  });

  it('net after ads is approximately zero at 100% of break-even orders', () => {
    const result = calculateAdBreakEven({ adBudget: 3000, averageOrderValue: 85, cogsPercent: 40, additionalCostsPercent: 5, currentConversionRate: 2.5 });
    const table = result.profitScenarioTable as { netAfterAds: number }[];
    // At 100% of break-even, net should be ≥ 0 (ceiling rounding means slightly positive)
    expect(table[2].netAfterAds).toBeGreaterThanOrEqual(-5);
  });

  it('net after ads is positive at 150% of break-even orders', () => {
    const result = calculateAdBreakEven({ adBudget: 3000, averageOrderValue: 85, cogsPercent: 40, additionalCostsPercent: 5, currentConversionRate: 2.5 });
    const table = result.profitScenarioTable as { netAfterAds: number }[];
    expect(table[4].netAfterAds).toBeGreaterThan(0);
  });

  it('higher COGS increases break-even orders', () => {
    const low = calculateAdBreakEven({ adBudget: 3000, averageOrderValue: 85, cogsPercent: 30, additionalCostsPercent: 0, currentConversionRate: 2 });
    const high = calculateAdBreakEven({ adBudget: 3000, averageOrderValue: 85, cogsPercent: 60, additionalCostsPercent: 0, currentConversionRate: 2 });
    expect(high.breakEvenOrders).toBeGreaterThan(low.breakEvenOrders as number);
  });

  it('higher AOV decreases break-even orders', () => {
    const low = calculateAdBreakEven({ adBudget: 3000, averageOrderValue: 50, cogsPercent: 40, additionalCostsPercent: 5, currentConversionRate: 2 });
    const high = calculateAdBreakEven({ adBudget: 3000, averageOrderValue: 150, cogsPercent: 40, additionalCostsPercent: 5, currentConversionRate: 2 });
    expect(high.breakEvenOrders).toBeLessThan(low.breakEvenOrders as number);
  });

  it('summary contains 7 entries', () => {
    const result = calculateAdBreakEven({ adBudget: 3000, averageOrderValue: 85, cogsPercent: 40, additionalCostsPercent: 5, currentConversionRate: 2.5 });
    expect((result.summary as unknown[]).length).toBe(7);
  });

  it('zero fees still calculates correctly', () => {
    // Contribution margin = $100 × (1 - 0.5) = $50; break-even = 3000/50 = 60
    const result = calculateAdBreakEven({ adBudget: 3000, averageOrderValue: 100, cogsPercent: 50, additionalCostsPercent: 0, currentConversionRate: 2 });
    expect(result.breakEvenOrders).toBe(60);
  });
});
