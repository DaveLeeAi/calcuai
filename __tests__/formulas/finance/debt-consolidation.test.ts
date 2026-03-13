import { calculateDebtConsolidation } from '@/lib/formulas/finance/debt-consolidation';

describe('calculateDebtConsolidation', () => {
  // ─── Test 1: Typical credit card consolidation ───
  it('calculates $25K at 18% → 8% for 5 years correctly', () => {
    const result = calculateDebtConsolidation({
      totalDebtBalance: 25000,
      currentAvgRate: 18,
      currentMonthlyPayment: 750,
      newRate: 8,
      newTerm: '60',
    });
    // New payment should be lower than $750
    expect(Number(result.newMonthlyPayment)).toBeLessThan(750);
    // New payment for $25K at 8% for 60 months ≈ $506.91
    expect(result.newMonthlyPayment).toBeCloseTo(506.91, 0);
    // Monthly savings > 0
    expect(Number(result.monthlySavings)).toBeGreaterThan(0);
    // Total interest saved > 0
    expect(Number(result.totalInterestSaved)).toBeGreaterThan(0);
  });

  // ─── Test 2: Same rate (no interest advantage, only term) ───
  it('calculates correctly when new rate equals current rate', () => {
    const result = calculateDebtConsolidation({
      totalDebtBalance: 20000,
      currentAvgRate: 10,
      currentMonthlyPayment: 500,
      newRate: 10,
      newTerm: '60',
    });
    // New monthly payment at 10% for 60 months on $20K ≈ $424.94
    expect(result.newMonthlyPayment).toBeCloseTo(424.94, 0);
    // The payoff timing might differ but interest rates are the same
    expect(Number(result.newMonthlyPayment)).toBeGreaterThan(0);
  });

  // ─── Test 3: New rate higher than current (consolidation is worse) ───
  it('shows negative savings when consolidation rate is higher', () => {
    const result = calculateDebtConsolidation({
      totalDebtBalance: 15000,
      currentAvgRate: 6,
      currentMonthlyPayment: 500,
      newRate: 12,
      newTerm: '60',
    });
    // Consolidation total interest should exceed current total interest
    expect(Number(result.consolidationTotalInterest)).toBeGreaterThan(0);
    // Total interest saved could be negative (consolidation costs more)
    expect(Number(result.totalInterestSaved)).toBeLessThan(0);
  });

  // ─── Test 4: Short consolidation term (2 years) ───
  it('calculates 2-year consolidation correctly', () => {
    const result = calculateDebtConsolidation({
      totalDebtBalance: 10000,
      currentAvgRate: 20,
      currentMonthlyPayment: 400,
      newRate: 7,
      newTerm: '24',
    });
    // $10K at 7% for 24 months ≈ $448.13
    expect(result.newMonthlyPayment).toBeCloseTo(448.13, 0);
    // Interest saved should be significant due to rate drop
    expect(Number(result.totalInterestSaved)).toBeGreaterThan(0);
  });

  // ─── Test 5: Long consolidation term (7 years) ───
  it('calculates 7-year consolidation correctly', () => {
    const result = calculateDebtConsolidation({
      totalDebtBalance: 50000,
      currentAvgRate: 22,
      currentMonthlyPayment: 1500,
      newRate: 9,
      newTerm: '84',
    });
    // Should produce valid payment
    expect(Number(result.newMonthlyPayment)).toBeGreaterThan(0);
    expect(Number(result.newMonthlyPayment)).toBeLessThan(1500);
    expect(Number(result.totalInterestSaved)).toBeGreaterThan(0);
  });

  // ─── Test 6: Small balance ($5K) ───
  it('calculates correctly for small $5K balance', () => {
    const result = calculateDebtConsolidation({
      totalDebtBalance: 5000,
      currentAvgRate: 18,
      currentMonthlyPayment: 200,
      newRate: 6,
      newTerm: '36',
    });
    // $5K at 6% for 36 months ≈ $152.11
    expect(result.newMonthlyPayment).toBeCloseTo(152.11, 0);
    expect(Number(result.monthlySavings)).toBeGreaterThan(0);
  });

  // ─── Test 7: Large balance ($100K) ───
  it('calculates correctly for large $100K balance', () => {
    const result = calculateDebtConsolidation({
      totalDebtBalance: 100000,
      currentAvgRate: 15,
      currentMonthlyPayment: 2500,
      newRate: 7,
      newTerm: '60',
    });
    // $100K at 7% for 60 months ≈ $1980.12
    expect(result.newMonthlyPayment).toBeCloseTo(1980.12, 0);
    expect(Number(result.monthlySavings)).toBeGreaterThan(0);
  });

  // ─── Test 8: Very high current rate (25%) ───
  it('handles very high current rate of 25%', () => {
    const result = calculateDebtConsolidation({
      totalDebtBalance: 20000,
      currentAvgRate: 25,
      currentMonthlyPayment: 600,
      newRate: 8,
      newTerm: '60',
    });
    expect(Number(result.totalInterestSaved)).toBeGreaterThan(0);
    // Current path at 25% with $600/mo takes ~58 months
    expect(Number(result.currentMonths)).toBeGreaterThan(50);
    // Consolidation at 60 months is slightly longer, but interest is much lower
    expect(Number(result.currentTotalInterest)).toBeGreaterThan(Number(result.consolidationTotalInterest));
  });

  // ─── Test 9: Zero balance (edge case) ───
  it('handles zero balance gracefully', () => {
    const result = calculateDebtConsolidation({
      totalDebtBalance: 0,
      currentAvgRate: 18,
      currentMonthlyPayment: 500,
      newRate: 8,
      newTerm: '60',
    });
    expect(result.newMonthlyPayment).toBe(0);
    expect(result.monthlySavings).toBe(0);
    expect(result.totalInterestSaved).toBe(0);
  });

  // ─── Test 10: Verify monthly savings sign ───
  it('monthly savings is positive when consolidation payment is lower', () => {
    const result = calculateDebtConsolidation({
      totalDebtBalance: 25000,
      currentAvgRate: 18,
      currentMonthlyPayment: 750,
      newRate: 8,
      newTerm: '60',
    });
    // monthlySavings = currentMonthlyPayment - newMonthlyPayment
    expect(Number(result.monthlySavings)).toBeGreaterThan(0);
    expect(result.monthlySavings).toBeCloseTo(750 - (result.newMonthlyPayment as number), 0);
  });

  // ─── Test 11: Verify total paid calculations ───
  it('total paid equals balance plus total interest for consolidation path', () => {
    const result = calculateDebtConsolidation({
      totalDebtBalance: 30000,
      currentAvgRate: 16,
      currentMonthlyPayment: 800,
      newRate: 7,
      newTerm: '60',
    });
    const consolidationTotalPaid = Number(result.consolidationTotalPaid);
    const consolidationTotalInterest = Number(result.consolidationTotalInterest);
    expect(consolidationTotalPaid).toBeCloseTo(30000 + consolidationTotalInterest, 0);
  });

  // ─── Test 12: Summary labels check ───
  it('returns summary with all required labels', () => {
    const result = calculateDebtConsolidation({
      totalDebtBalance: 25000,
      currentAvgRate: 18,
      currentMonthlyPayment: 750,
      newRate: 8,
      newTerm: '60',
    });
    const summary = result.summary as Array<{ label: string; value: number | string }>;
    const labels = summary.map(s => s.label);
    expect(labels).toContain('Total Debt Balance');
    expect(labels).toContain('Current Monthly Payment');
    expect(labels).toContain('New Monthly Payment');
    expect(labels).toContain('Monthly Savings');
    expect(labels).toContain('Total Interest Saved');
    expect(labels).toContain('Months Saved');
  });

  // ─── Test 13: Comparison array structure ───
  it('returns comparison array with current vs consolidation data', () => {
    const result = calculateDebtConsolidation({
      totalDebtBalance: 25000,
      currentAvgRate: 18,
      currentMonthlyPayment: 750,
      newRate: 8,
      newTerm: '60',
    });
    const comparison = result.comparison as Array<{ label: string; value: number | string }>;
    const labels = comparison.map(c => c.label);
    expect(labels).toContain('Current Monthly Payment');
    expect(labels).toContain('Consolidation Monthly Payment');
    expect(labels).toContain('Current Total Interest');
    expect(labels).toContain('Consolidation Total Interest');
  });

  // ─── Test 14: Zero interest consolidation ───
  it('handles 0% consolidation rate', () => {
    const result = calculateDebtConsolidation({
      totalDebtBalance: 10000,
      currentAvgRate: 15,
      currentMonthlyPayment: 400,
      newRate: 0,
      newTerm: '36',
    });
    // 0% rate: payment = 10000/36 ≈ 277.78
    expect(result.newMonthlyPayment).toBeCloseTo(277.78, 0);
    expect(Number(result.consolidationTotalInterest)).toBeCloseTo(0, 0);
    expect(Number(result.totalInterestSaved)).toBeGreaterThan(0);
  });
});
