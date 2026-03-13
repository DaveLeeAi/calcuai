import { calculateLoanComparison } from '@/lib/formulas/finance/loan-comparison';

describe('calculateLoanComparison', () => {
  // ─── Test 1: Same rate, different terms (30 vs 15 year) ───
  it('compares 30-year vs 15-year at same rate correctly', () => {
    const result = calculateLoanComparison({
      loanAmount: 250000,
      rateA: 6.5,
      termA: '360',
      rateB: 6.5,
      termB: '180',
    });
    // 30-year payment ≈ $1,580.17, 15-year ≈ $2,177.77
    expect(result.paymentA).toBeCloseTo(1580.17, 0);
    expect(result.paymentB).toBeCloseTo(2177.77, 0);
    // 15-year has much lower total interest
    expect(Number(result.totalInterestB)).toBeLessThan(Number(result.totalInterestA));
    expect(result.cheaperLoan).toBe('Loan B');
  });

  // ─── Test 2: Same term, different rates ───
  it('compares same term at different rates', () => {
    const result = calculateLoanComparison({
      loanAmount: 250000,
      rateA: 7.0,
      termA: '360',
      rateB: 5.5,
      termB: '360',
    });
    // Lower rate = lower payment and total interest
    expect(Number(result.paymentB)).toBeLessThan(Number(result.paymentA));
    expect(Number(result.totalInterestB)).toBeLessThan(Number(result.totalInterestA));
    expect(result.cheaperLoan).toBe('Loan B');
  });

  // ─── Test 3: Both identical (savings = 0) ───
  it('returns zero savings when both loans are identical', () => {
    const result = calculateLoanComparison({
      loanAmount: 200000,
      rateA: 6.0,
      termA: '360',
      rateB: 6.0,
      termB: '360',
    });
    expect(result.monthlySavings).toBe(0);
    expect(result.totalSavings).toBe(0);
    expect(result.cheaperLoan).toBe('Equal');
  });

  // ─── Test 4: Low amount ($10K personal loan) ───
  it('calculates correctly for small $10K personal loan', () => {
    const result = calculateLoanComparison({
      loanAmount: 10000,
      rateA: 12,
      termA: '60',
      rateB: 8,
      termB: '60',
    });
    expect(Number(result.paymentB)).toBeLessThan(Number(result.paymentA));
    expect(Number(result.totalSavings)).toBeGreaterThan(0);
  });

  // ─── Test 5: High amount ($500K mortgage) ───
  it('calculates correctly for $500K mortgage comparison', () => {
    const result = calculateLoanComparison({
      loanAmount: 500000,
      rateA: 6.5,
      termA: '360',
      rateB: 5.75,
      termB: '180',
    });
    // Both should have valid payments
    expect(Number(result.paymentA)).toBeGreaterThan(0);
    expect(Number(result.paymentB)).toBeGreaterThan(0);
    // 15-year at lower rate: much less total interest
    expect(Number(result.totalInterestB)).toBeLessThan(Number(result.totalInterestA));
  });

  // ─── Test 6: Very different rates (3% vs 8%) ───
  it('handles very different rates (3% vs 8%)', () => {
    const result = calculateLoanComparison({
      loanAmount: 200000,
      rateA: 3,
      termA: '360',
      rateB: 8,
      termB: '360',
    });
    expect(Number(result.paymentA)).toBeLessThan(Number(result.paymentB));
    expect(Number(result.totalInterestA)).toBeLessThan(Number(result.totalInterestB));
    expect(result.cheaperLoan).toBe('Loan A');
  });

  // ─── Test 7: Short terms (5 years) ───
  it('handles short 5-year terms correctly', () => {
    const result = calculateLoanComparison({
      loanAmount: 30000,
      rateA: 5,
      termA: '60',
      rateB: 7,
      termB: '60',
    });
    // Loan A at 5% should be cheaper
    expect(Number(result.paymentA)).toBeLessThan(Number(result.paymentB));
    expect(result.cheaperLoan).toBe('Loan A');
  });

  // ─── Test 8: Zero interest rate on one loan ───
  it('handles zero interest rate on one loan', () => {
    const result = calculateLoanComparison({
      loanAmount: 20000,
      rateA: 0,
      termA: '60',
      rateB: 6,
      termB: '60',
    });
    // 0% loan: payment = 20000/60 ≈ 333.33
    expect(result.paymentA).toBeCloseTo(333.33, 0);
    expect(result.totalInterestA).toBeCloseTo(0, 0);
    expect(Number(result.totalInterestB)).toBeGreaterThan(0);
    expect(result.cheaperLoan).toBe('Loan A');
  });

  // ─── Test 9: Verify comparison object structure ───
  it('returns comparison array with correct structure', () => {
    const result = calculateLoanComparison({
      loanAmount: 100000,
      rateA: 5,
      termA: '360',
      rateB: 6,
      termB: '180',
    });
    const comparison = result.comparison as Array<{ label: string; value: number | string }>;
    expect(comparison.length).toBeGreaterThanOrEqual(6);
    const labels = comparison.map(c => c.label);
    expect(labels).toContain('Loan A Monthly Payment');
    expect(labels).toContain('Loan B Monthly Payment');
    expect(labels).toContain('Loan A Total Interest');
    expect(labels).toContain('Loan B Total Interest');
    expect(labels).toContain('Loan A Total Cost');
    expect(labels).toContain('Loan B Total Cost');
  });

  // ─── Test 10: Verify balanceComparison has correct number of years ───
  it('returns balanceComparison with year 0 through max term in years', () => {
    const result = calculateLoanComparison({
      loanAmount: 200000,
      rateA: 6,
      termA: '360', // 30 years
      rateB: 6,
      termB: '180', // 15 years
    });
    const balData = result.balanceComparison as Array<{ year: number; loanA: number; loanB: number }>;
    // Should have year 0 through year 30 = 31 entries
    expect(balData.length).toBe(31);
    expect(balData[0].year).toBe(0);
    expect(balData[0].loanA).toBe(200000);
    expect(balData[0].loanB).toBe(200000);
    // At year 15, loan B should be ~0
    expect(balData[15].loanB).toBeCloseTo(0, 0);
    // At year 30, loan A should be ~0
    expect(balData[30].loanA).toBeCloseTo(0, 0);
  });

  // ─── Test 11: Verify cheaper loan identification ───
  it('correctly identifies the cheaper loan by total cost', () => {
    // Loan A: lower rate but longer term → more total cost
    const result = calculateLoanComparison({
      loanAmount: 200000,
      rateA: 5,
      termA: '360', // 30 years at 5%
      rateB: 6,
      termB: '120', // 10 years at 6%
    });
    // 10-year at 6% should have less total cost than 30-year at 5%
    expect(result.cheaperLoan).toBe('Loan B');
  });

  // ─── Test 12: Edge — 0% rate on both ───
  it('handles 0% rate on both loans', () => {
    const result = calculateLoanComparison({
      loanAmount: 50000,
      rateA: 0,
      termA: '120',
      rateB: 0,
      termB: '60',
    });
    // Loan A: 50000/120 ≈ 416.67, Loan B: 50000/60 ≈ 833.33
    expect(result.paymentA).toBeCloseTo(416.67, 0);
    expect(result.paymentB).toBeCloseTo(833.33, 0);
    expect(result.totalInterestA).toBeCloseTo(0, 0);
    expect(result.totalInterestB).toBeCloseTo(0, 0);
    expect(result.totalSavings).toBe(0);
    // Both total cost = $50,000, so Equal
    expect(result.cheaperLoan).toBe('Equal');
  });

  // ─── Test 13: Summary labels check ───
  it('returns summary with all required labels', () => {
    const result = calculateLoanComparison({
      loanAmount: 100000,
      rateA: 5,
      termA: '360',
      rateB: 6,
      termB: '180',
    });
    const summary = result.summary as Array<{ label: string; value: number | string }>;
    const labels = summary.map(s => s.label);
    expect(labels).toContain('Loan Amount');
    expect(labels).toContain('Loan A Rate');
    expect(labels).toContain('Loan A Payment');
    expect(labels).toContain('Loan B Payment');
    expect(labels).toContain('Monthly Payment Difference');
    expect(labels).toContain('Total Interest Saved');
    expect(labels).toContain('Lower Total Cost');
  });

  // ─── Test 14: Zero loan amount returns zeros ───
  it('handles zero loan amount gracefully', () => {
    const result = calculateLoanComparison({
      loanAmount: 0,
      rateA: 6,
      termA: '360',
      rateB: 5,
      termB: '180',
    });
    expect(result.paymentA).toBe(0);
    expect(result.paymentB).toBe(0);
    expect(result.monthlySavings).toBe(0);
    expect(result.totalSavings).toBe(0);
    expect(result.cheaperLoan).toBe('N/A');
  });

  // ─── Test 15: monthlySavings is absolute value ───
  it('monthlySavings is always a positive number (absolute difference)', () => {
    const result = calculateLoanComparison({
      loanAmount: 100000,
      rateA: 3,
      termA: '360',
      rateB: 7,
      termB: '360',
    });
    expect(Number(result.monthlySavings)).toBeGreaterThanOrEqual(0);
  });

  // ─── Test 16: totalSavings is absolute value ───
  it('totalSavings is always a positive number (absolute difference)', () => {
    const result = calculateLoanComparison({
      loanAmount: 150000,
      rateA: 8,
      termA: '360',
      rateB: 4,
      termB: '360',
    });
    expect(Number(result.totalSavings)).toBeGreaterThanOrEqual(0);
  });
});
