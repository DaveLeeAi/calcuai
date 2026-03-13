import { calculatePaybackPeriod } from '@/lib/formulas/business/payback-period';

describe('calculatePaybackPeriod', () => {
  // ─── Test 1: Simple payback period ───
  it('calculates simple payback period', () => {
    const result = calculatePaybackPeriod({
      initialInvestment: 50000,
      annualCashFlow: 15000,
      discountRate: 0,
    });
    // 50000 / 15000 = 3.33 years
    expect(result.paybackPeriod).toBeCloseTo(3.33, 2);
  });

  // ─── Test 2: Exact year payback ───
  it('handles exact year payback', () => {
    const result = calculatePaybackPeriod({
      initialInvestment: 60000,
      annualCashFlow: 20000,
      discountRate: 0,
    });
    // 60000 / 20000 = 3.0
    expect(result.paybackPeriod).toBe(3);
  });

  // ─── Test 3: One-year payback ───
  it('calculates one-year payback', () => {
    const result = calculatePaybackPeriod({
      initialInvestment: 10000,
      annualCashFlow: 10000,
      discountRate: 0,
    });
    expect(result.paybackPeriod).toBe(1);
  });

  // ─── Test 4: Discounted payback is longer than simple ───
  it('discounted payback is longer than simple payback', () => {
    const result = calculatePaybackPeriod({
      initialInvestment: 50000,
      annualCashFlow: 15000,
      discountRate: 10,
    });
    expect(result.discountedPaybackPeriod).toBeGreaterThan(result.paybackPeriod as number);
  });

  // ─── Test 5: Discounted payback calculation ───
  it('calculates discounted payback period', () => {
    const result = calculatePaybackPeriod({
      initialInvestment: 30000,
      annualCashFlow: 10000,
      discountRate: 8,
    });
    // Simple = 3.0 years. Discounted should be around 3.6 years
    expect(result.paybackPeriod).toBe(3);
    expect(result.discountedPaybackPeriod).toBeGreaterThan(3);
    expect(result.discountedPaybackPeriod).toBeLessThan(5);
  });

  // ─── Test 6: Zero discount rate equals simple payback ───
  it('discounted payback equals simple when rate is 0', () => {
    const result = calculatePaybackPeriod({
      initialInvestment: 40000,
      annualCashFlow: 10000,
      discountRate: 0,
    });
    expect(result.discountedPaybackPeriod).toBe(result.paybackPeriod);
  });

  // ─── Test 7: Year-by-year table generated ───
  it('generates year-by-year table', () => {
    const result = calculatePaybackPeriod({
      initialInvestment: 50000,
      annualCashFlow: 15000,
      discountRate: 10,
    });
    const table = result.yearByYearTable as { year: number; cashFlow: number; discountedCashFlow: number; cumulative: number }[];
    expect(table.length).toBeGreaterThan(0);
    expect(table[0].year).toBe(1);
    expect(table[0].cashFlow).toBe(15000);
  });

  // ─── Test 8: Discounted cash flows decrease over time ───
  it('discounted cash flows decrease each year', () => {
    const result = calculatePaybackPeriod({
      initialInvestment: 50000,
      annualCashFlow: 15000,
      discountRate: 10,
    });
    const table = result.yearByYearTable as { year: number; discountedCashFlow: number }[];
    expect(table[0].discountedCashFlow).toBeGreaterThan(table[1].discountedCashFlow);
    expect(table[1].discountedCashFlow).toBeGreaterThan(table[2].discountedCashFlow);
  });

  // ─── Test 9: Cumulative increases each year ───
  it('cumulative cash flow increases each year', () => {
    const result = calculatePaybackPeriod({
      initialInvestment: 50000,
      annualCashFlow: 15000,
      discountRate: 10,
    });
    const table = result.yearByYearTable as { cumulative: number }[];
    for (let i = 1; i < table.length; i++) {
      expect(table[i].cumulative).toBeGreaterThan(table[i - 1].cumulative);
    }
  });

  // ─── Test 10: Total return calculation ───
  it('calculates total return over payback period', () => {
    const result = calculatePaybackPeriod({
      initialInvestment: 50000,
      annualCashFlow: 15000,
      discountRate: 0,
    });
    // Payback ~3.33, ceil = 4, total = 15000 × 4 = 60000
    expect(result.totalReturn).toBe(60000);
  });

  // ─── Test 11: Zero annual cash flow ───
  it('handles zero annual cash flow', () => {
    const result = calculatePaybackPeriod({
      initialInvestment: 50000,
      annualCashFlow: 0,
      discountRate: 0,
    });
    expect(result.paybackPeriod).toBe(0);
  });

  // ─── Test 12: Zero investment ───
  it('handles zero investment', () => {
    const result = calculatePaybackPeriod({
      initialInvestment: 0,
      annualCashFlow: 15000,
      discountRate: 0,
    });
    expect(result.paybackPeriod).toBe(0);
  });

  // ─── Test 13: Very large investment with small cash flow ───
  it('handles very long payback periods', () => {
    const result = calculatePaybackPeriod({
      initialInvestment: 1000000,
      annualCashFlow: 5000,
      discountRate: 0,
    });
    // 1000000 / 5000 = 200 years
    expect(result.paybackPeriod).toBe(200);
  });

  // ─── Test 14: String input coercion ───
  it('coerces string inputs to numbers', () => {
    const result = calculatePaybackPeriod({
      initialInvestment: '30000',
      annualCashFlow: '10000',
      discountRate: '0',
    });
    expect(result.paybackPeriod).toBe(3);
  });

  // ─── Test 15: Missing inputs ───
  it('handles missing inputs gracefully', () => {
    const result = calculatePaybackPeriod({});
    expect(result.paybackPeriod).toBe(0);
    expect(result.totalReturn).toBe(0);
  });

  // ─── Test 16: High discount rate extends payback ───
  it('high discount rate significantly extends payback', () => {
    const low = calculatePaybackPeriod({
      initialInvestment: 50000,
      annualCashFlow: 15000,
      discountRate: 5,
    });
    const high = calculatePaybackPeriod({
      initialInvestment: 50000,
      annualCashFlow: 15000,
      discountRate: 20,
    });
    expect(Number(high.discountedPaybackPeriod)).toBeGreaterThan(
      Number(low.discountedPaybackPeriod)
    );
  });

  // ─── Test 17: Summary contains expected labels ───
  it('returns summary with expected labels', () => {
    const result = calculatePaybackPeriod({
      initialInvestment: 50000,
      annualCashFlow: 15000,
      discountRate: 10,
    });
    const summary = result.summary as { label: string; value: number | string }[];
    const labels = summary.map((s) => s.label);
    expect(labels).toContain('Initial Investment');
    expect(labels).toContain('Annual Cash Flow');
    expect(labels).toContain('Simple Payback Period');
    expect(labels).toContain('Discounted Payback Period');
  });

  // ─── Test 18: No discount rate omits discounted from summary ───
  it('omits discounted payback from summary when rate is 0', () => {
    const result = calculatePaybackPeriod({
      initialInvestment: 50000,
      annualCashFlow: 15000,
      discountRate: 0,
    });
    const summary = result.summary as { label: string; value: number | string }[];
    const labels = summary.map((s) => s.label);
    expect(labels).not.toContain('Discounted Payback Period');
  });

  // ─── Test 19: All output fields present ───
  it('returns all expected output fields', () => {
    const result = calculatePaybackPeriod({
      initialInvestment: 50000,
      annualCashFlow: 15000,
      discountRate: 10,
    });
    expect(result).toHaveProperty('paybackPeriod');
    expect(result).toHaveProperty('discountedPaybackPeriod');
    expect(result).toHaveProperty('totalReturn');
    expect(result).toHaveProperty('yearByYearTable');
    expect(result).toHaveProperty('summary');
  });

  // ─── Test 20: Cash flow exactly matches investment ───
  it('handles cash flow exactly matching investment', () => {
    const result = calculatePaybackPeriod({
      initialInvestment: 15000,
      annualCashFlow: 15000,
      discountRate: 0,
    });
    expect(result.paybackPeriod).toBe(1);
    expect(result.totalReturn).toBe(15000);
  });

  // ─── Test 21: Discounted payback with 50% rate ───
  it('handles maximum discount rate', () => {
    const result = calculatePaybackPeriod({
      initialInvestment: 10000,
      annualCashFlow: 5000,
      discountRate: 50,
    });
    // Simple = 2 years; At 50% discount rate, PV of perpetuity = 5000/0.50 = 10000
    // It barely pays back. The discounted payback is very long or never.
    expect(result.paybackPeriod).toBe(2);
    // At 50% rate, discounted payback either exceeds 50 years (-1) or is very long
    expect(Number(result.discountedPaybackPeriod)).not.toBe(0);
  });

  // ─── Test 22: Small investment quick payback ───
  it('handles sub-year payback', () => {
    const result = calculatePaybackPeriod({
      initialInvestment: 5000,
      annualCashFlow: 20000,
      discountRate: 0,
    });
    // 5000 / 20000 = 0.25 years
    expect(result.paybackPeriod).toBe(0.25);
  });

  // ─── Test 23: Verify first-year discounted cash flow ───
  it('correctly discounts first year cash flow', () => {
    const result = calculatePaybackPeriod({
      initialInvestment: 50000,
      annualCashFlow: 15000,
      discountRate: 10,
    });
    const table = result.yearByYearTable as { year: number; discountedCashFlow: number }[];
    // Year 1 DCF = 15000 / 1.10 = 13636.36
    expect(table[0].discountedCashFlow).toBeCloseTo(13636.36, 0);
  });

  // ─── Test 24: Negative inputs clamped ───
  it('clamps negative values to zero', () => {
    const result = calculatePaybackPeriod({
      initialInvestment: -10000,
      annualCashFlow: -5000,
      discountRate: -5,
    });
    expect(result.paybackPeriod).toBe(0);
  });
});
