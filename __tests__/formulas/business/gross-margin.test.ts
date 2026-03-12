import { calculateMargin } from '@/lib/formulas/business/gross-margin';

describe('calculateMargin', () => {
  // ─── Test 1: Basic gross margin — $100k revenue, $60k COGS ───
  it('calculates gross margin correctly for standard case', () => {
    const result = calculateMargin({
      revenue: 100000,
      costOfGoods: 60000,
      operatingExpenses: 0,
    });
    expect(result.grossProfit).toBe(40000);
    expect(result.grossMarginPercent).toBe(40);
  });

  // ─── Test 2: Gross margin with 50% COGS ───
  it('calculates 50% gross margin when COGS is half of revenue', () => {
    const result = calculateMargin({
      revenue: 200000,
      costOfGoods: 100000,
      operatingExpenses: 0,
    });
    expect(result.grossProfit).toBe(100000);
    expect(result.grossMarginPercent).toBe(50);
  });

  // ─── Test 3: Net margin calculation ───
  it('calculates net margin correctly', () => {
    const result = calculateMargin({
      revenue: 100000,
      costOfGoods: 60000,
      operatingExpenses: 15000,
    });
    expect(result.netProfit).toBe(25000);
    expect(result.netMarginPercent).toBe(25);
  });

  // ─── Test 4: Markup calculation ───
  it('calculates markup percentage correctly', () => {
    const result = calculateMargin({
      revenue: 100000,
      costOfGoods: 60000,
      operatingExpenses: 0,
    });
    // Markup = 40000 / 60000 × 100 = 66.67%
    expect(result.markupPercent).toBeCloseTo(66.67, 1);
  });

  // ─── Test 5: 100% markup (revenue = 2× COGS) ───
  it('calculates 100% markup when revenue is double COGS', () => {
    const result = calculateMargin({
      revenue: 120000,
      costOfGoods: 60000,
      operatingExpenses: 0,
    });
    expect(result.markupPercent).toBe(100);
    expect(result.grossMarginPercent).toBe(50);
  });

  // ─── Test 6: Negative net profit (loss) ───
  it('handles negative net profit when expenses exceed revenue', () => {
    const result = calculateMargin({
      revenue: 100000,
      costOfGoods: 70000,
      operatingExpenses: 40000,
    });
    expect(result.netProfit).toBe(-10000);
    expect(result.netMarginPercent).toBe(-10);
  });

  // ─── Test 7: Zero revenue ───
  it('handles zero revenue gracefully', () => {
    const result = calculateMargin({
      revenue: 0,
      costOfGoods: 5000,
      operatingExpenses: 2000,
    });
    expect(result.grossProfit).toBe(-5000);
    expect(result.grossMarginPercent).toBe(0);
    expect(result.netMarginPercent).toBe(0);
    // Markup = (-5000 / 5000) × 100 = -100% (valid: zero revenue, full loss on COGS)
    expect(result.markupPercent).toBe(-100);
  });

  // ─── Test 8: Zero COGS (pure service) ───
  it('handles zero COGS for pure service business', () => {
    const result = calculateMargin({
      revenue: 100000,
      costOfGoods: 0,
      operatingExpenses: 30000,
    });
    expect(result.grossProfit).toBe(100000);
    expect(result.grossMarginPercent).toBe(100);
    expect(result.markupPercent).toBe(0); // COGS is 0, markup is 0
    expect(result.netProfit).toBe(70000);
    expect(result.netMarginPercent).toBe(70);
  });

  // ─── Test 9: Summary contains correct labels ───
  it('returns summary with all expected labels', () => {
    const result = calculateMargin({
      revenue: 100000,
      costOfGoods: 60000,
      operatingExpenses: 15000,
    });
    const summary = result.summary as { label: string; value: number }[];
    const labels = summary.map((item) => item.label);
    expect(labels).toContain('Revenue');
    expect(labels).toContain('Gross Profit');
    expect(labels).toContain('Gross Margin');
    expect(labels).toContain('Markup');
    expect(labels).toContain('Net Profit');
    expect(labels).toContain('Net Margin');
  });

  // ─── Test 10: Profit breakdown pie chart data ───
  it('returns correct profit breakdown for pie chart', () => {
    const result = calculateMargin({
      revenue: 100000,
      costOfGoods: 60000,
      operatingExpenses: 15000,
    });
    const breakdown = result.profitBreakdown as { name: string; value: number }[];
    expect(breakdown).toHaveLength(3);
    const cogs = breakdown.find((b) => b.name === 'Cost of Goods');
    const opex = breakdown.find((b) => b.name === 'Operating Expenses');
    const net = breakdown.find((b) => b.name === 'Net Profit');
    expect(cogs!.value).toBe(60000);
    expect(opex!.value).toBe(15000);
    expect(net!.value).toBe(25000);
  });

  // ─── Test 11: Margin comparison table exists with multiple rows ───
  it('returns margin comparison table with revenue multiples', () => {
    const result = calculateMargin({
      revenue: 100000,
      costOfGoods: 60000,
      operatingExpenses: 15000,
    });
    const comparison = result.marginComparison as { label: string; amount: number; percentage: number }[];
    expect(comparison.length).toBeGreaterThanOrEqual(5);
  });

  // ─── Test 12: Small numbers — $10 revenue, $7 COGS ───
  it('handles small dollar amounts correctly', () => {
    const result = calculateMargin({
      revenue: 10,
      costOfGoods: 7,
      operatingExpenses: 1,
    });
    expect(result.grossProfit).toBe(3);
    expect(result.grossMarginPercent).toBe(30);
    expect(result.netProfit).toBe(2);
    expect(result.netMarginPercent).toBe(20);
  });

  // ─── Test 13: Very high margin business ───
  it('calculates high margins correctly (SaaS-like)', () => {
    const result = calculateMargin({
      revenue: 500000,
      costOfGoods: 50000,
      operatingExpenses: 150000,
    });
    expect(result.grossMarginPercent).toBe(90);
    expect(result.netMarginPercent).toBe(60);
  });

  // ─── Test 14: Missing inputs use defaults ───
  it('uses defaults for missing inputs', () => {
    const result = calculateMargin({});
    expect(result.grossProfit).toBe(0);
    expect(result.grossMarginPercent).toBe(0);
    expect(result.netProfit).toBe(0);
    expect(result.netMarginPercent).toBe(0);
  });

  // ─── Test 15: Decimal precision ───
  it('handles decimal revenue and costs correctly', () => {
    const result = calculateMargin({
      revenue: 99.99,
      costOfGoods: 45.50,
      operatingExpenses: 12.25,
    });
    expect(result.grossProfit).toBeCloseTo(54.49, 2);
    expect(result.netProfit).toBeCloseTo(42.24, 2);
  });
});
