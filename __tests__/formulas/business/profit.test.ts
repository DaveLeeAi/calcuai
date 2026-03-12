import { calculateProfit } from '@/lib/formulas/business/profit';

describe('calculateProfit', () => {
  // ─── Test 1: Basic profit calculation ───
  it('calculates net profit with all deductions', () => {
    const result = calculateProfit({
      revenue: 75000,
      costOfGoodsSold: 30000,
      operatingExpenses: 20000,
      taxRate: 25,
      unitsSold: 1000,
    });
    // Gross = 75000 - 30000 = 45000
    // Operating = 45000 - 20000 = 25000
    // Tax = 25000 × 0.25 = 6250
    // Net = 25000 - 6250 = 18750
    expect(result.netProfit).toBe(18750);
  });

  // ─── Test 2: Gross profit only (no OpEx, no tax) ───
  it('calculates gross profit with zero OpEx and zero tax', () => {
    const result = calculateProfit({
      revenue: 100000,
      costOfGoodsSold: 40000,
      operatingExpenses: 0,
      taxRate: 0,
      unitsSold: 0,
    });
    expect(result.grossProfit).toBe(60000);
    expect(result.operatingProfit).toBe(60000);
    expect(result.netProfit).toBe(60000);
  });

  // ─── Test 3: Operating profit (no tax) ───
  it('calculates operating profit with zero tax rate', () => {
    const result = calculateProfit({
      revenue: 100000,
      costOfGoodsSold: 40000,
      operatingExpenses: 25000,
      taxRate: 0,
      unitsSold: 500,
    });
    // Gross = 60000, Operating = 35000, Tax = 0, Net = 35000
    expect(result.operatingProfit).toBe(35000);
    expect(result.taxAmount).toBe(0);
    expect(result.netProfit).toBe(35000);
  });

  // ─── Test 4: Full net profit with all deductions ───
  it('calculates all profit stages correctly', () => {
    const result = calculateProfit({
      revenue: 200000,
      costOfGoodsSold: 80000,
      operatingExpenses: 50000,
      taxRate: 30,
      unitsSold: 2000,
    });
    expect(result.grossProfit).toBe(120000);
    expect(result.operatingProfit).toBe(70000);
    expect(result.taxAmount).toBe(21000);
    expect(result.netProfit).toBe(49000);
  });

  // ─── Test 5: Profit per unit ───
  it('calculates profit per unit correctly', () => {
    const result = calculateProfit({
      revenue: 75000,
      costOfGoodsSold: 30000,
      operatingExpenses: 20000,
      taxRate: 25,
      unitsSold: 1000,
    });
    // Net profit = 18750, units = 1000
    expect(result.profitPerUnit).toBe(18.75);
  });

  // ─── Test 6: Zero revenue (loss) ───
  it('handles zero revenue gracefully', () => {
    const result = calculateProfit({
      revenue: 0,
      costOfGoodsSold: 5000,
      operatingExpenses: 10000,
      taxRate: 25,
      unitsSold: 0,
    });
    // Gross = 0 - 5000 = -5000
    // Operating = -5000 - 10000 = -15000
    // Tax on negative = 0 (no tax on losses)
    // Net = -15000
    expect(result.grossProfit).toBe(-5000);
    expect(result.operatingProfit).toBe(-15000);
    expect(result.taxAmount).toBe(0);
    expect(result.netProfit).toBe(-15000);
  });

  // ─── Test 7: Revenue equals costs (zero profit) ───
  it('returns zero net profit when revenue equals total costs', () => {
    const result = calculateProfit({
      revenue: 50000,
      costOfGoodsSold: 30000,
      operatingExpenses: 20000,
      taxRate: 25,
      unitsSold: 500,
    });
    // Gross = 20000, Operating = 0, Tax = 0, Net = 0
    expect(result.operatingProfit).toBe(0);
    expect(result.taxAmount).toBe(0);
    expect(result.netProfit).toBe(0);
  });

  // ─── Test 8: No units sold (profitPerUnit should be 0) ───
  it('returns zero profit per unit when no units sold', () => {
    const result = calculateProfit({
      revenue: 75000,
      costOfGoodsSold: 30000,
      operatingExpenses: 20000,
      taxRate: 25,
      unitsSold: 0,
    });
    expect(result.profitPerUnit).toBe(0);
    expect(result.netProfit).toBe(18750);
  });

  // ─── Test 9: 0% tax rate ───
  it('calculates profit with zero tax rate', () => {
    const result = calculateProfit({
      revenue: 100000,
      costOfGoodsSold: 40000,
      operatingExpenses: 20000,
      taxRate: 0,
      unitsSold: 1000,
    });
    // Gross = 60000, Operating = 40000, Tax = 0, Net = 40000
    expect(result.taxAmount).toBe(0);
    expect(result.netProfit).toBe(40000);
    expect(result.profitPerUnit).toBe(40);
  });

  // ─── Test 10: 100% tax rate ───
  it('calculates profit with 100% tax rate', () => {
    const result = calculateProfit({
      revenue: 100000,
      costOfGoodsSold: 40000,
      operatingExpenses: 20000,
      taxRate: 100,
      unitsSold: 500,
    });
    // Operating = 40000, Tax = 40000, Net = 0
    expect(result.taxAmount).toBe(40000);
    expect(result.netProfit).toBe(0);
  });

  // ─── Test 11: Large revenue ($10M) ───
  it('handles large revenue amounts correctly', () => {
    const result = calculateProfit({
      revenue: 10000000,
      costOfGoodsSold: 4000000,
      operatingExpenses: 2500000,
      taxRate: 21,
      unitsSold: 100000,
    });
    // Gross = 6,000,000
    // Operating = 3,500,000
    // Tax = 3,500,000 × 0.21 = 735,000
    // Net = 3,500,000 - 735,000 = 2,765,000
    expect(result.grossProfit).toBe(6000000);
    expect(result.operatingProfit).toBe(3500000);
    expect(result.taxAmount).toBe(735000);
    expect(result.netProfit).toBe(2765000);
    expect(result.profitPerUnit).toBe(27.65);
  });

  // ─── Test 12: Profit breakdown pie chart data ───
  it('generates profit breakdown pie chart data', () => {
    const result = calculateProfit({
      revenue: 75000,
      costOfGoodsSold: 30000,
      operatingExpenses: 20000,
      taxRate: 25,
      unitsSold: 1000,
    });
    const breakdown = result.profitBreakdown as { label: string; value: number }[];
    expect(breakdown.length).toBe(4);
    const labels = breakdown.map((s) => s.label);
    expect(labels).toContain('Cost of Goods Sold');
    expect(labels).toContain('Operating Expenses');
    expect(labels).toContain('Taxes');
    expect(labels).toContain('Net Profit');

    // Values should add up to revenue
    const total = breakdown.reduce((sum, s) => sum + s.value, 0);
    expect(total).toBeCloseTo(75000, 0);
  });

  // ─── Test 13: Summary contains correct labels ───
  it('returns summary with all expected labels', () => {
    const result = calculateProfit({
      revenue: 75000,
      costOfGoodsSold: 30000,
      operatingExpenses: 20000,
      taxRate: 25,
      unitsSold: 1000,
    });
    const summary = result.summary as { label: string; value: number }[];
    const labels = summary.map((s) => s.label);
    expect(labels).toContain('Revenue');
    expect(labels).toContain('Cost of Goods Sold');
    expect(labels).toContain('Gross Profit');
    expect(labels).toContain('Operating Expenses');
    expect(labels).toContain('Operating Profit');
    expect(labels).toContain('Taxes');
    expect(labels).toContain('Net Profit');
    expect(labels).toContain('Profit per Unit');
  });

  // ─── Test 14: Missing inputs default to safe values ───
  it('uses defaults for missing inputs', () => {
    const result = calculateProfit({});
    expect(result.netProfit).toBe(0);
    expect(result.grossProfit).toBe(0);
    expect(result.operatingProfit).toBe(0);
    expect(result.taxAmount).toBe(0);
    expect(result.profitPerUnit).toBe(0);
  });

  // ─── Test 15: COGS exceeds revenue (gross loss) ───
  it('handles COGS exceeding revenue correctly', () => {
    const result = calculateProfit({
      revenue: 50000,
      costOfGoodsSold: 60000,
      operatingExpenses: 10000,
      taxRate: 25,
      unitsSold: 500,
    });
    // Gross = -10000, Operating = -20000, Tax = 0 (loss), Net = -20000
    expect(result.grossProfit).toBe(-10000);
    expect(result.operatingProfit).toBe(-20000);
    expect(result.taxAmount).toBe(0);
    expect(result.netProfit).toBe(-20000);
    expect(result.profitPerUnit).toBe(-40);
  });
});
