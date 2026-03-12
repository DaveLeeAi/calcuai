import { calculateBreakEven } from '@/lib/formulas/business/break-even';

describe('calculateBreakEven', () => {
  // ─── Test 1: Standard break-even calculation ───
  it('calculates break-even units for standard inputs', () => {
    const result = calculateBreakEven({
      fixedCosts: 10000,
      pricePerUnit: 50,
      variableCostPerUnit: 30,
      targetProfit: 0,
    });
    // BE = 10000 / (50 - 30) = 500 units
    expect(result.breakEvenUnits).toBe(500);
    expect(result.breakEvenRevenue).toBe(25000);
  });

  // ─── Test 2: Break-even revenue ───
  it('calculates break-even revenue correctly', () => {
    const result = calculateBreakEven({
      fixedCosts: 50000,
      pricePerUnit: 100,
      variableCostPerUnit: 60,
      targetProfit: 0,
    });
    // BE = 50000 / (100 - 60) = 1250 units, Revenue = 1250 × 100 = $125,000
    expect(result.breakEvenUnits).toBe(1250);
    expect(result.breakEvenRevenue).toBe(125000);
  });

  // ─── Test 3: Contribution margin ───
  it('calculates contribution margin correctly', () => {
    const result = calculateBreakEven({
      fixedCosts: 10000,
      pricePerUnit: 50,
      variableCostPerUnit: 30,
      targetProfit: 0,
    });
    expect(result.contributionMargin).toBe(20);
    expect(result.contributionMarginRatio).toBe(40);
  });

  // ─── Test 4: Units for target profit ───
  it('calculates units needed for target profit', () => {
    const result = calculateBreakEven({
      fixedCosts: 10000,
      pricePerUnit: 50,
      variableCostPerUnit: 30,
      targetProfit: 5000,
    });
    // Units = (10000 + 5000) / 20 = 750
    expect(result.unitsForTargetProfit).toBe(750);
    expect(result.revenueForTargetProfit).toBe(37500);
  });

  // ─── Test 5: Revenue for target profit ───
  it('calculates revenue for target profit correctly', () => {
    const result = calculateBreakEven({
      fixedCosts: 20000,
      pricePerUnit: 80,
      variableCostPerUnit: 40,
      targetProfit: 10000,
    });
    // Units = (20000 + 10000) / 40 = 750, Revenue = 750 × 80 = $60,000
    expect(result.unitsForTargetProfit).toBe(750);
    expect(result.revenueForTargetProfit).toBe(60000);
  });

  // ─── Test 6: Zero contribution margin (price = variable cost) ───
  it('handles zero contribution margin gracefully', () => {
    const result = calculateBreakEven({
      fixedCosts: 10000,
      pricePerUnit: 30,
      variableCostPerUnit: 30,
      targetProfit: 0,
    });
    expect(result.breakEvenUnits).toBe(0);
    expect(result.breakEvenRevenue).toBe(0);
    expect(result.contributionMargin).toBe(0);
  });

  // ─── Test 7: Price less than variable cost ───
  it('handles negative contribution margin (price < variable cost)', () => {
    const result = calculateBreakEven({
      fixedCosts: 10000,
      pricePerUnit: 20,
      variableCostPerUnit: 30,
      targetProfit: 0,
    });
    // Contribution margin is negative, break-even impossible
    expect(result.breakEvenUnits).toBe(0);
    expect(result.breakEvenRevenue).toBe(0);
  });

  // ─── Test 8: Zero fixed costs ───
  it('returns zero break-even units when fixed costs are zero', () => {
    const result = calculateBreakEven({
      fixedCosts: 0,
      pricePerUnit: 50,
      variableCostPerUnit: 30,
      targetProfit: 0,
    });
    expect(result.breakEvenUnits).toBe(0);
    expect(result.breakEvenRevenue).toBe(0);
  });

  // ─── Test 9: Contribution margin ratio ───
  it('calculates contribution margin ratio as percentage', () => {
    const result = calculateBreakEven({
      fixedCosts: 10000,
      pricePerUnit: 100,
      variableCostPerUnit: 25,
      targetProfit: 0,
    });
    // CM ratio = 75/100 = 75%
    expect(result.contributionMarginRatio).toBe(75);
  });

  // ─── Test 10: Chart data generation ───
  it('generates chart data with multiple points', () => {
    const result = calculateBreakEven({
      fixedCosts: 10000,
      pricePerUnit: 50,
      variableCostPerUnit: 30,
      targetProfit: 0,
    });
    const chartData = result.chartData as { units: number; totalRevenue: number; totalCost: number; profit: number }[];
    expect(chartData.length).toBeGreaterThan(5);
    // First point should be 0 units
    expect(chartData[0].units).toBe(0);
    expect(chartData[0].totalRevenue).toBe(0);
    expect(chartData[0].totalCost).toBe(10000); // fixed costs only
  });

  // ─── Test 11: Summary contains correct labels ───
  it('returns summary with expected labels', () => {
    const result = calculateBreakEven({
      fixedCosts: 10000,
      pricePerUnit: 50,
      variableCostPerUnit: 30,
      targetProfit: 5000,
    });
    const summary = result.summary as { label: string; value: number }[];
    const labels = summary.map((s) => s.label);
    expect(labels).toContain('Break-Even Units');
    expect(labels).toContain('Break-Even Revenue');
    expect(labels).toContain('Contribution Margin');
    expect(labels).toContain('CM Ratio');
    expect(labels).toContain('Units for Target Profit');
    expect(labels).toContain('Revenue for Target Profit');
  });

  // ─── Test 12: Non-integer break-even rounds up ───
  it('rounds break-even units up to next whole unit', () => {
    const result = calculateBreakEven({
      fixedCosts: 10000,
      pricePerUnit: 50,
      variableCostPerUnit: 33,
      targetProfit: 0,
    });
    // BE = 10000 / 17 = 588.24 → rounds up to 589
    expect(result.breakEvenUnits).toBe(589);
  });

  // ─── Test 13: Large fixed costs ───
  it('handles large fixed costs correctly', () => {
    const result = calculateBreakEven({
      fixedCosts: 1000000,
      pricePerUnit: 200,
      variableCostPerUnit: 50,
      targetProfit: 0,
    });
    // BE = 1000000 / 150 = 6666.67 → 6667
    expect(result.breakEvenUnits).toBe(6667);
  });

  // ─── Test 14: Missing inputs use defaults ───
  it('uses defaults for missing inputs', () => {
    const result = calculateBreakEven({});
    expect(result.breakEvenUnits).toBe(0);
    expect(result.breakEvenRevenue).toBe(0);
    expect(result.contributionMargin).toBe(0);
  });

  // ─── Test 15: Very small contribution margin ───
  it('handles very small contribution margin', () => {
    const result = calculateBreakEven({
      fixedCosts: 1000,
      pricePerUnit: 10.50,
      variableCostPerUnit: 10.00,
      targetProfit: 0,
    });
    // BE = 1000 / 0.50 = 2000 units
    expect(result.breakEvenUnits).toBe(2000);
  });
});
