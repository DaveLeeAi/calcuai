import { calculateRefinanceBreakeven } from '@/lib/formulas/finance/refinance-breakeven';

describe('calculateRefinanceBreakeven', () => {
  // ─── Test 1: Default scenario — 7% to 5.5%, 30-year term ───
  it('calculates default refinance scenario correctly', () => {
    const result = calculateRefinanceBreakeven({
      currentLoanBalance: 280000,
      currentRate: 7,
      currentTermRemaining: 300,
      newRate: 5.5,
      newTerm: '30',
      closingCosts: 5000,
      cashOut: 0,
    });
    const savings = result.monthlySavings as number;
    // Current payment on $280k at 7% for 300 months ≈ $1,979
    // New payment on $280k at 5.5% for 360 months ≈ $1,590
    // Monthly savings ≈ $389
    expect(savings).toBeGreaterThan(350);
    expect(savings).toBeLessThan(420);
    expect(result.currentMonthlyPayment as number).toBeGreaterThan(1900);
    expect(result.currentMonthlyPayment as number).toBeLessThan(2050);
    expect(result.newMonthlyPayment as number).toBeGreaterThan(1550);
    expect(result.newMonthlyPayment as number).toBeLessThan(1620);
    // Break-even: $5,000 / ~$389 ≈ 13 months
    const breakEven = result.breakEvenMonths as number;
    expect(breakEven).toBeGreaterThan(10);
    expect(breakEven).toBeLessThan(20);
  });

  // ─── Test 2: No monthly savings (new rate is higher) ───
  it('handles scenario where refinancing costs more (no savings)', () => {
    const result = calculateRefinanceBreakeven({
      currentLoanBalance: 200000,
      currentRate: 5,
      currentTermRemaining: 300,
      newRate: 6,
      newTerm: '30',
      closingCosts: 5000,
      cashOut: 0,
    });
    const savings = result.monthlySavings as number;
    // New rate is higher, so monthly savings should be negative
    expect(savings).toBeLessThan(0);
    // Break-even should be 0 (never breaks even)
    expect(result.breakEvenMonths).toBe(0);
  });

  // ─── Test 3: Zero closing costs — instant break-even ───
  it('handles zero closing costs (instant break-even)', () => {
    const result = calculateRefinanceBreakeven({
      currentLoanBalance: 280000,
      currentRate: 7,
      currentTermRemaining: 300,
      newRate: 5.5,
      newTerm: '30',
      closingCosts: 0,
      cashOut: 0,
    });
    expect(result.breakEvenMonths).toBe(0);
    expect(result.monthlySavings as number).toBeGreaterThan(0);
  });

  // ─── Test 4: Cash-out refinance increases loan balance ───
  it('adds cash-out amount to new loan balance', () => {
    const noCashOut = calculateRefinanceBreakeven({
      currentLoanBalance: 280000,
      currentRate: 7,
      currentTermRemaining: 300,
      newRate: 5.5,
      newTerm: '30',
      closingCosts: 5000,
      cashOut: 0,
    });
    const withCashOut = calculateRefinanceBreakeven({
      currentLoanBalance: 280000,
      currentRate: 7,
      currentTermRemaining: 300,
      newRate: 5.5,
      newTerm: '30',
      closingCosts: 5000,
      cashOut: 50000,
    });
    // Cash-out increases the new monthly payment
    expect(withCashOut.newMonthlyPayment as number).toBeGreaterThan(noCashOut.newMonthlyPayment as number);
    // Monthly savings are lower with cash-out
    expect(withCashOut.monthlySavings as number).toBeLessThan(noCashOut.monthlySavings as number);
  });

  // ─── Test 5: 15-year refinance increases payment but saves total interest ───
  it('calculates 15-year refinance correctly (higher payment, more total savings)', () => {
    const result30 = calculateRefinanceBreakeven({
      currentLoanBalance: 280000,
      currentRate: 7,
      currentTermRemaining: 300,
      newRate: 5.5,
      newTerm: '30',
      closingCosts: 5000,
      cashOut: 0,
    });
    const result15 = calculateRefinanceBreakeven({
      currentLoanBalance: 280000,
      currentRate: 7,
      currentTermRemaining: 300,
      newRate: 5.5,
      newTerm: '15',
      closingCosts: 5000,
      cashOut: 0,
    });
    // 15-year has higher monthly payment
    expect(result15.newMonthlyPayment as number).toBeGreaterThan(result30.newMonthlyPayment as number);
    // 15-year should save more in total interest
    expect(result15.totalSavings as number).toBeGreaterThan(result30.totalSavings as number);
  });

  // ─── Test 6: Zero interest rate on both loans ───
  it('handles zero interest rate correctly', () => {
    const result = calculateRefinanceBreakeven({
      currentLoanBalance: 120000,
      currentRate: 0,
      currentTermRemaining: 120,
      newRate: 0,
      newTerm: '30',
      closingCosts: 3000,
      cashOut: 0,
    });
    // Current payment: $120,000 / 120 = $1,000
    expect(result.currentMonthlyPayment).toBeCloseTo(1000, 0);
    // New payment: $120,000 / 360 = $333.33
    expect(result.newMonthlyPayment).toBeCloseTo(333.33, 0);
    const savings = result.monthlySavings as number;
    expect(savings).toBeCloseTo(666.67, 0);
  });

  // ─── Test 7: Small loan balance ───
  it('calculates correctly for small loan balance', () => {
    const result = calculateRefinanceBreakeven({
      currentLoanBalance: 50000,
      currentRate: 8,
      currentTermRemaining: 240,
      newRate: 6,
      newTerm: '20',
      closingCosts: 2000,
      cashOut: 0,
    });
    const savings = result.monthlySavings as number;
    expect(savings).toBeGreaterThan(0);
    expect(result.breakEvenMonths as number).toBeGreaterThan(0);
  });

  // ─── Test 8: Large loan balance amplifies savings ───
  it('larger loan balance produces larger monthly savings', () => {
    const small = calculateRefinanceBreakeven({
      currentLoanBalance: 100000,
      currentRate: 7,
      currentTermRemaining: 300,
      newRate: 5.5,
      newTerm: '30',
      closingCosts: 3000,
      cashOut: 0,
    });
    const large = calculateRefinanceBreakeven({
      currentLoanBalance: 500000,
      currentRate: 7,
      currentTermRemaining: 300,
      newRate: 5.5,
      newTerm: '30',
      closingCosts: 3000,
      cashOut: 0,
    });
    expect(large.monthlySavings as number).toBeGreaterThan(small.monthlySavings as number);
  });

  // ─── Test 9: Summary contains all required labels ───
  it('returns summary with all required labels', () => {
    const result = calculateRefinanceBreakeven({
      currentLoanBalance: 280000,
      currentRate: 7,
      currentTermRemaining: 300,
      newRate: 5.5,
      newTerm: '30',
      closingCosts: 5000,
      cashOut: 0,
    });
    const summary = result.summary as Array<{ label: string; value: number }>;
    const labels = summary.map(s => s.label);
    expect(labels).toContain('Monthly Savings');
    expect(labels).toContain('Break-Even Point');
    expect(labels).toContain('Total Savings');
    expect(labels).toContain('New Monthly Payment');
    expect(labels).toContain('Current Monthly Payment');
    expect(labels).toContain('Closing Costs');
    expect(summary).toHaveLength(6);
  });

  // ─── Test 10: Comparison chart has correct entries ───
  it('returns comparison chart with 3 data points', () => {
    const result = calculateRefinanceBreakeven({
      currentLoanBalance: 280000,
      currentRate: 7,
      currentTermRemaining: 300,
      newRate: 5.5,
      newTerm: '30',
      closingCosts: 5000,
      cashOut: 0,
    });
    const chart = result.comparisonChart as Array<{ name: string; current: number; new: number }>;
    expect(chart).toHaveLength(3);
    const names = chart.map(c => c.name);
    expect(names).toContain('Monthly Payment');
    expect(names).toContain('Total Interest');
    expect(names).toContain('Total Cost');
  });

  // ─── Test 11: Same rate — no savings ───
  it('handles same rate refinance (zero savings minus closing costs)', () => {
    const result = calculateRefinanceBreakeven({
      currentLoanBalance: 200000,
      currentRate: 6,
      currentTermRemaining: 360,
      newRate: 6,
      newTerm: '30',
      closingCosts: 5000,
      cashOut: 0,
    });
    // Same rate, same term → monthly savings ≈ $0
    expect(Math.abs(result.monthlySavings as number)).toBeLessThan(1);
    // Total savings should be negative (lost the closing costs)
    expect(result.totalSavings as number).toBeLessThan(0);
  });

  // ─── Test 12: Very short remaining term — current payment is high ───
  it('handles short remaining term correctly', () => {
    const result = calculateRefinanceBreakeven({
      currentLoanBalance: 50000,
      currentRate: 6,
      currentTermRemaining: 24,
      newRate: 5,
      newTerm: '30',
      closingCosts: 2000,
      cashOut: 0,
    });
    // Current payment on $50k at 6% for 24 months is very high (≈$2,219)
    // New payment on $50k at 5% for 360 months is very low (≈$268)
    expect(result.currentMonthlyPayment as number).toBeGreaterThan(2000);
    expect(result.newMonthlyPayment as number).toBeLessThan(300);
    expect(result.monthlySavings as number).toBeGreaterThan(1900);
  });

  // ─── Test 13: Zero loan balance ───
  it('handles zero loan balance', () => {
    const result = calculateRefinanceBreakeven({
      currentLoanBalance: 0,
      currentRate: 7,
      currentTermRemaining: 300,
      newRate: 5.5,
      newTerm: '30',
      closingCosts: 5000,
      cashOut: 0,
    });
    expect(result.currentMonthlyPayment).toBe(0);
    expect(result.newMonthlyPayment).toBe(0);
    expect(result.monthlySavings).toBe(0);
  });
});
