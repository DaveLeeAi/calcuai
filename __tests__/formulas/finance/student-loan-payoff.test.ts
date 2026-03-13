import { calculateStudentLoanPayoff } from '@/lib/formulas/finance/student-loan-payoff';

describe('calculateStudentLoanPayoff', () => {
  // ─── Test 1: Standard plan $35K at 5.5% — payment ≈ $380 ───
  it('calculates standard 10-year plan correctly', () => {
    const result = calculateStudentLoanPayoff({
      loanBalance: 35000,
      interestRate: 5.5,
      repaymentPlan: 'standard',
      extraPayment: 0,
      incomeForIBR: 50000,
    });
    const payment = result.monthlyPayment as number;
    // Standard 10-year: $35K at 5.5% → ~$379.85/month
    expect(payment).toBeGreaterThan(375);
    expect(payment).toBeLessThan(385);
  });

  // ─── Test 2: Graduated plan starts lower than standard ───
  it('graduated plan starts with lower payment than standard', () => {
    const standard = calculateStudentLoanPayoff({
      loanBalance: 35000,
      interestRate: 5.5,
      repaymentPlan: 'standard',
      extraPayment: 0,
    });
    const graduated = calculateStudentLoanPayoff({
      loanBalance: 35000,
      interestRate: 5.5,
      repaymentPlan: 'graduated',
      extraPayment: 0,
    });
    // Graduated starts at 60% of standard
    expect(graduated.monthlyPayment as number).toBeLessThan(standard.monthlyPayment as number);
  });

  // ─── Test 3: Extended plan has lower monthly but more total interest ───
  it('extended plan has lower payment but higher total interest', () => {
    const standard = calculateStudentLoanPayoff({
      loanBalance: 35000,
      interestRate: 5.5,
      repaymentPlan: 'standard',
      extraPayment: 0,
    });
    const extended = calculateStudentLoanPayoff({
      loanBalance: 35000,
      interestRate: 5.5,
      repaymentPlan: 'extended',
      extraPayment: 0,
    });
    expect(extended.monthlyPayment as number).toBeLessThan(standard.monthlyPayment as number);
    expect(extended.totalInterest as number).toBeGreaterThan(standard.totalInterest as number);
  });

  // ─── Test 4: Custom payment of $500 ───
  it('uses custom payment amount when plan is custom', () => {
    const result = calculateStudentLoanPayoff({
      loanBalance: 35000,
      interestRate: 5.5,
      repaymentPlan: 'custom',
      customPayment: 500,
      extraPayment: 0,
    });
    expect(result.monthlyPayment).toBe(500);
  });

  // ─── Test 5: Extra payment of $100 reduces timeline ───
  it('extra payment reduces payoff timeline', () => {
    const without = calculateStudentLoanPayoff({
      loanBalance: 35000,
      interestRate: 5.5,
      repaymentPlan: 'standard',
      extraPayment: 0,
    });
    const withExtra = calculateStudentLoanPayoff({
      loanBalance: 35000,
      interestRate: 5.5,
      repaymentPlan: 'standard',
      extraPayment: 100,
    });
    // timeSaved should be positive when extra > 0
    const timeSaved = withExtra.timeSaved as string;
    expect(timeSaved).not.toBe('0 months');
  });

  // ─── Test 6: Zero balance returns zeros ───
  it('returns zeros for zero balance', () => {
    const result = calculateStudentLoanPayoff({
      loanBalance: 0,
      interestRate: 5.5,
      repaymentPlan: 'standard',
      extraPayment: 0,
    });
    expect(result.monthlyPayment).toBe(0);
    expect(result.totalInterest).toBe(0);
    expect(result.totalPaid).toBe(0);
    expect(result.payoffDate).toBe('Already paid off');
  });

  // ─── Test 7: Zero interest rate (subsidized period) ───
  it('handles zero interest rate correctly', () => {
    const result = calculateStudentLoanPayoff({
      loanBalance: 35000,
      interestRate: 0,
      repaymentPlan: 'standard',
      extraPayment: 0,
    });
    const payment = result.monthlyPayment as number;
    // 35000 / 120 = 291.67
    expect(payment).toBeCloseTo(291.67, 0);
    expect(result.totalInterest).toBe(0);
  });

  // ─── Test 8: High balance ($100K) ───
  it('handles high balance loans', () => {
    const result = calculateStudentLoanPayoff({
      loanBalance: 100000,
      interestRate: 6.8,
      repaymentPlan: 'standard',
      extraPayment: 0,
    });
    const payment = result.monthlyPayment as number;
    expect(payment).toBeGreaterThan(1100);
    expect(payment).toBeLessThan(1200);
    expect(result.totalInterest as number).toBeGreaterThan(30000);
  });

  // ─── Test 9: Low balance ($5K) ───
  it('handles low balance loans', () => {
    const result = calculateStudentLoanPayoff({
      loanBalance: 5000,
      interestRate: 4.5,
      repaymentPlan: 'standard',
      extraPayment: 0,
    });
    const payment = result.monthlyPayment as number;
    expect(payment).toBeGreaterThan(50);
    expect(payment).toBeLessThan(60);
  });

  // ─── Test 10: High interest rate (8%) ───
  it('calculates correctly at 8% interest', () => {
    const result = calculateStudentLoanPayoff({
      loanBalance: 35000,
      interestRate: 8,
      repaymentPlan: 'standard',
      extraPayment: 0,
    });
    const payment = result.monthlyPayment as number;
    // Higher rate → higher payment
    expect(payment).toBeGreaterThan(420);
    expect(payment).toBeLessThan(430);
  });

  // ─── Test 11: Low interest rate (3%) ───
  it('calculates correctly at 3% interest', () => {
    const result = calculateStudentLoanPayoff({
      loanBalance: 35000,
      interestRate: 3,
      repaymentPlan: 'standard',
      extraPayment: 0,
    });
    const payment = result.monthlyPayment as number;
    expect(payment).toBeGreaterThan(335);
    expect(payment).toBeLessThan(345);
  });

  // ─── Test 12: Extra payment equal to regular payment (doubles payment) ───
  it('doubled payment significantly reduces timeline and interest', () => {
    const standard = calculateStudentLoanPayoff({
      loanBalance: 35000,
      interestRate: 5.5,
      repaymentPlan: 'standard',
      extraPayment: 0,
    });
    const doubled = calculateStudentLoanPayoff({
      loanBalance: 35000,
      interestRate: 5.5,
      repaymentPlan: 'standard',
      extraPayment: standard.monthlyPayment as number,
    });
    expect(doubled.monthlyWithExtra as number).toBeCloseTo(
      (standard.monthlyPayment as number) * 2, 0
    );
    expect(doubled.totalInterest as number).toBeLessThan(standard.totalInterest as number);
  });

  // ─── Test 13: Very high extra payment pays off quickly ───
  it('very high extra payment results in fast payoff', () => {
    const result = calculateStudentLoanPayoff({
      loanBalance: 35000,
      interestRate: 5.5,
      repaymentPlan: 'standard',
      extraPayment: 5000,
    });
    // With ~$5,380/month total, should pay off in ~7 months
    const payoffMonths = result.payoffMonths as string;
    expect(payoffMonths).toContain('month');
    expect(result.totalInterest as number).toBeLessThan(1200);
  });

  // ─── Test 14: IBR estimate is reasonable ───
  it('calculates IBR estimate correctly', () => {
    const result = calculateStudentLoanPayoff({
      loanBalance: 35000,
      interestRate: 5.5,
      repaymentPlan: 'standard',
      extraPayment: 0,
      incomeForIBR: 50000,
    });
    // discretionary = 50000 - 15060*1.5 = 50000 - 22590 = 27410
    // IBR = 27410 * 0.10 / 12 = 228.42
    const ibr = result.ibrEstimate as number;
    expect(ibr).toBeCloseTo(228.42, 0);
  });

  // ─── Test 15: Standard plan always 120 months or less ───
  it('standard plan payoff is 120 months or less', () => {
    const result = calculateStudentLoanPayoff({
      loanBalance: 35000,
      interestRate: 5.5,
      repaymentPlan: 'standard',
      extraPayment: 0,
    });
    const payoff = result.payoffMonths as string;
    // Standard is exactly 10 years
    expect(payoff).toContain('10 year');
  });

  // ─── Test 16: Extended plan up to 300 months ───
  it('extended plan payoff is longer than standard', () => {
    const standard = calculateStudentLoanPayoff({
      loanBalance: 35000,
      interestRate: 5.5,
      repaymentPlan: 'standard',
      extraPayment: 0,
    });
    const extended = calculateStudentLoanPayoff({
      loanBalance: 35000,
      interestRate: 5.5,
      repaymentPlan: 'extended',
      extraPayment: 0,
    });
    // Extended should take longer
    expect(extended.totalPaid as number).toBeGreaterThan(standard.totalPaid as number);
  });

  // ─── Test 17: interestSaved >= 0 ───
  it('interest saved is always non-negative', () => {
    const result = calculateStudentLoanPayoff({
      loanBalance: 35000,
      interestRate: 5.5,
      repaymentPlan: 'standard',
      extraPayment: 200,
    });
    expect(result.interestSaved as number).toBeGreaterThanOrEqual(0);
  });

  // ─── Test 18: timeSaved >= 0 when extra > 0 ───
  it('time saved is non-empty when extra payments are made', () => {
    const result = calculateStudentLoanPayoff({
      loanBalance: 35000,
      interestRate: 5.5,
      repaymentPlan: 'standard',
      extraPayment: 100,
    });
    const timeSaved = result.timeSaved as string;
    // Should save some time
    expect(timeSaved).toBeDefined();
    expect(typeof timeSaved).toBe('string');
  });

  // ─── Test 19: Output has all expected keys ───
  it('returns all expected output keys', () => {
    const result = calculateStudentLoanPayoff({
      loanBalance: 35000,
      interestRate: 5.5,
      repaymentPlan: 'standard',
      extraPayment: 0,
      incomeForIBR: 50000,
    });
    expect(result).toHaveProperty('monthlyPayment');
    expect(result).toHaveProperty('payoffMonths');
    expect(result).toHaveProperty('totalInterest');
    expect(result).toHaveProperty('totalPaid');
    expect(result).toHaveProperty('payoffDate');
    expect(result).toHaveProperty('interestSaved');
    expect(result).toHaveProperty('timeSaved');
    expect(result).toHaveProperty('monthlyWithExtra');
    expect(result).toHaveProperty('ibrEstimate');
  });

  // ─── Test 20: totalPaid = balance + totalInterest ───
  it('total paid equals balance plus total interest', () => {
    const result = calculateStudentLoanPayoff({
      loanBalance: 35000,
      interestRate: 5.5,
      repaymentPlan: 'standard',
      extraPayment: 0,
    });
    const totalPaid = result.totalPaid as number;
    const totalInterest = result.totalInterest as number;
    expect(totalPaid).toBeCloseTo(35000 + totalInterest, 0);
  });

  // ─── Test 21: payoffDate is a string ───
  it('payoff date is a formatted date string', () => {
    const result = calculateStudentLoanPayoff({
      loanBalance: 35000,
      interestRate: 5.5,
      repaymentPlan: 'standard',
      extraPayment: 0,
    });
    expect(typeof result.payoffDate).toBe('string');
    const dateStr = result.payoffDate as string;
    // Should contain a year
    expect(dateStr).toMatch(/\d{4}/);
  });

  // ─── Test 22: Custom payment below interest-only doesn't infinite loop ───
  it('caps at max months when payment is insufficient', () => {
    const result = calculateStudentLoanPayoff({
      loanBalance: 100000,
      interestRate: 10,
      repaymentPlan: 'custom',
      customPayment: 50, // Way below interest-only amount (~$833/month)
      extraPayment: 0,
    });
    // Should not hang; months should be capped
    const payoff = result.payoffMonths as string;
    expect(payoff).toBeDefined();
    expect(typeof result.totalInterest).toBe('number');
  });

  // ─── Test 23: IBR with low income returns zero ───
  it('IBR estimate is zero when income is below 150% FPL', () => {
    const result = calculateStudentLoanPayoff({
      loanBalance: 35000,
      interestRate: 5.5,
      repaymentPlan: 'standard',
      extraPayment: 0,
      incomeForIBR: 20000,
    });
    // 150% FPL = 22590, income 20000 < 22590 → discretionary = 0
    expect(result.ibrEstimate).toBe(0);
  });

  // ─── Test 24: Graduated plan initial payment is ~60% of standard ───
  it('graduated plan initial payment is approximately 60% of standard', () => {
    const standard = calculateStudentLoanPayoff({
      loanBalance: 35000,
      interestRate: 5.5,
      repaymentPlan: 'standard',
      extraPayment: 0,
    });
    const graduated = calculateStudentLoanPayoff({
      loanBalance: 35000,
      interestRate: 5.5,
      repaymentPlan: 'graduated',
      extraPayment: 0,
    });
    const ratio = (graduated.monthlyPayment as number) / (standard.monthlyPayment as number);
    expect(ratio).toBeCloseTo(0.6, 1);
  });
});
