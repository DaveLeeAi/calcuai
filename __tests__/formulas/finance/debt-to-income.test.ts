import { calculateDebtToIncome } from '@/lib/formulas/finance/debt-to-income';

describe('calculateDebtToIncome', () => {
  // ─── Test 1: Standard case — $6,000 income, mixed debts ───
  it('calculates standard DTI correctly', () => {
    const result = calculateDebtToIncome({
      monthlyIncome: 6000,
      mortgageRent: 1500,
      carPayment: 400,
      studentLoanPayment: 300,
      creditCardPayment: 150,
      otherDebt: 0,
    });
    // Total debt = 1500 + 400 + 300 + 150 = 2350
    // DTI = 2350 / 6000 × 100 = 39.2%
    expect(result.dtiRatio).toBeCloseTo(39.2, 1);
    expect(result.rating).toBe('Acceptable');
    expect(result.totalMonthlyDebt).toBe(2350);
  });

  // ─── Test 2: Excellent DTI — low debt relative to income ───
  it('rates excellent DTI correctly', () => {
    const result = calculateDebtToIncome({
      monthlyIncome: 10000,
      mortgageRent: 1500,
      carPayment: 300,
      studentLoanPayment: 200,
      creditCardPayment: 0,
      otherDebt: 0,
    });
    // DTI = 2000 / 10000 × 100 = 20%
    expect(result.dtiRatio).toBeCloseTo(20, 1);
    expect(result.rating).toBe('Excellent');
  });

  // ─── Test 3: Good DTI — between 28% and 36% ───
  it('rates good DTI correctly', () => {
    const result = calculateDebtToIncome({
      monthlyIncome: 8000,
      mortgageRent: 1800,
      carPayment: 400,
      studentLoanPayment: 300,
      creditCardPayment: 0,
      otherDebt: 0,
    });
    // DTI = 2500 / 8000 × 100 = 31.25%
    expect(result.dtiRatio).toBeCloseTo(31.3, 1);
    expect(result.rating).toBe('Good');
  });

  // ─── Test 4: High DTI — between 43% and 50% ───
  it('rates high DTI correctly', () => {
    const result = calculateDebtToIncome({
      monthlyIncome: 5000,
      mortgageRent: 1500,
      carPayment: 400,
      studentLoanPayment: 300,
      creditCardPayment: 200,
      otherDebt: 0,
    });
    // DTI = 2400 / 5000 × 100 = 48%
    expect(result.dtiRatio).toBeCloseTo(48, 1);
    expect(result.rating).toBe('High');
  });

  // ─── Test 5: Very High DTI — above 50% ───
  it('rates very high DTI correctly', () => {
    const result = calculateDebtToIncome({
      monthlyIncome: 4000,
      mortgageRent: 1500,
      carPayment: 400,
      studentLoanPayment: 300,
      creditCardPayment: 200,
      otherDebt: 100,
    });
    // DTI = 2500 / 4000 × 100 = 62.5%
    expect(result.dtiRatio).toBeCloseTo(62.5, 1);
    expect(result.rating).toBe('Very High');
  });

  // ─── Test 6: Zero income ───
  it('handles zero income gracefully', () => {
    const result = calculateDebtToIncome({
      monthlyIncome: 0,
      mortgageRent: 1500,
      carPayment: 400,
      studentLoanPayment: 0,
      creditCardPayment: 0,
      otherDebt: 0,
    });
    expect(result.dtiRatio).toBe(0);
    expect(result.rating).toBe('N/A');
  });

  // ─── Test 7: Zero debt ───
  it('handles zero debt correctly', () => {
    const result = calculateDebtToIncome({
      monthlyIncome: 6000,
      mortgageRent: 0,
      carPayment: 0,
      studentLoanPayment: 0,
      creditCardPayment: 0,
      otherDebt: 0,
    });
    expect(result.dtiRatio).toBe(0);
    expect(result.rating).toBe('Excellent');
    expect(result.totalMonthlyDebt).toBe(0);
  });

  // ─── Test 8: Only housing debt ───
  it('calculates with only housing debt', () => {
    const result = calculateDebtToIncome({
      monthlyIncome: 6000,
      mortgageRent: 1500,
      carPayment: 0,
      studentLoanPayment: 0,
      creditCardPayment: 0,
      otherDebt: 0,
    });
    // DTI = 1500 / 6000 × 100 = 25%
    expect(result.dtiRatio).toBeCloseTo(25, 1);
    expect(result.totalMonthlyDebt).toBe(1500);
    // Front-end should equal back-end when only housing debt
    expect(result.frontEndRatio).toBeCloseTo(25, 1);
  });

  // ─── Test 9: All debt types populated ───
  it('calculates with all debt types', () => {
    const result = calculateDebtToIncome({
      monthlyIncome: 7000,
      mortgageRent: 1800,
      carPayment: 450,
      studentLoanPayment: 350,
      creditCardPayment: 200,
      otherDebt: 100,
    });
    // Total = 1800 + 450 + 350 + 200 + 100 = 2900
    expect(result.totalMonthlyDebt).toBe(2900);
    // DTI = 2900 / 7000 × 100 ≈ 41.4%
    expect(result.dtiRatio).toBeCloseTo(41.4, 1);
    expect(result.rating).toBe('Acceptable');
  });

  // ─── Test 10: Pie chart — verify non-zero items present ───
  it('returns debt breakdown with only non-zero items', () => {
    const result = calculateDebtToIncome({
      monthlyIncome: 6000,
      mortgageRent: 1500,
      carPayment: 400,
      studentLoanPayment: 0,
      creditCardPayment: 150,
      otherDebt: 0,
    });
    const breakdown = result.debtBreakdown as Array<{ name: string; value: number }>;
    const names = breakdown.map(b => b.name);
    expect(names).toContain('Housing');
    expect(names).toContain('Car');
    expect(names).toContain('Credit Cards');
    expect(names).not.toContain('Student Loans');
    expect(names).not.toContain('Other');
  });

  // ─── Test 11: Front-end ratio calculation ───
  it('calculates front-end ratio correctly', () => {
    const result = calculateDebtToIncome({
      monthlyIncome: 8000,
      mortgageRent: 2000,
      carPayment: 500,
      studentLoanPayment: 300,
      creditCardPayment: 100,
      otherDebt: 0,
    });
    // Front-end = 2000 / 8000 × 100 = 25%
    expect(result.frontEndRatio).toBeCloseTo(25, 1);
    // Back-end = 2900 / 8000 × 100 = 36.25%
    expect(result.dtiRatio).toBeCloseTo(36.3, 1);
  });

  // ─── Test 12: Summary labels present ───
  it('returns summary with all required labels', () => {
    const result = calculateDebtToIncome({
      monthlyIncome: 6000,
      mortgageRent: 1500,
      carPayment: 400,
      studentLoanPayment: 300,
      creditCardPayment: 150,
      otherDebt: 0,
    });
    const summary = result.summary as Array<{ label: string; value: number | string }>;
    const labels = summary.map(s => s.label);
    expect(labels).toContain('DTI Ratio');
    expect(labels).toContain('Rating');
    expect(labels).toContain('Total Monthly Debt');
    expect(labels).toContain('Front-End Ratio (Housing)');
    expect(labels).toContain('Annual Income');
  });

  // ─── Test 13: Max mortgage at 36% DTI ───
  it('calculates max mortgage at 36% DTI correctly', () => {
    const result = calculateDebtToIncome({
      monthlyIncome: 8000,
      mortgageRent: 0,
      carPayment: 500,
      studentLoanPayment: 300,
      creditCardPayment: 100,
      otherDebt: 0,
    });
    // At 36% DTI: 8000 × 0.36 = 2880 max total debt
    // Non-housing debt = 900
    // Max mortgage = 2880 - 900 = 1980
    expect(result.maxMortgageAt36).toBeCloseTo(1980, 0);
  });

  // ─── Test 14: DTI at exact boundary — 28% ───
  it('rates exactly 28% as Excellent', () => {
    const result = calculateDebtToIncome({
      monthlyIncome: 10000,
      mortgageRent: 2800,
      carPayment: 0,
      studentLoanPayment: 0,
      creditCardPayment: 0,
      otherDebt: 0,
    });
    expect(result.dtiRatio).toBeCloseTo(28, 1);
    expect(result.rating).toBe('Excellent');
  });
});
