import { calculateLoanPayment } from '@/lib/formulas/finance/loan-payment';

/**
 * Tests for the Payment Calculator, which reuses the loan-payment formula module.
 * These tests focus on the payment-calculator's default inputs and use cases
 * (personal loans, short terms, payment-focused queries).
 */
describe('Payment Calculator (via calculateLoanPayment)', () => {
  // ─── Test 1: Default $20,000 at 7% for 60 months ───
  it('calculates $20,000 at 7% for 60 months correctly', () => {
    const result = calculateLoanPayment({
      loanAmount: 20000,
      annualRate: 7,
      loanTerm: 60,
      extraPayment: 0,
    });
    // M ≈ $396.02
    expect(result.monthlyPayment).toBeCloseTo(396.02, 0);
  });

  // ─── Test 2: Total interest on default inputs ───
  it('calculates total interest on $20,000 at 7% for 60 months', () => {
    const result = calculateLoanPayment({
      loanAmount: 20000,
      annualRate: 7,
      loanTerm: 60,
      extraPayment: 0,
    });
    // Total = $396.02 × 60 = $23,761; Interest = $23,761 - $20,000 = $3,761
    expect(result.totalInterest).toBeCloseTo(3761, -1);
  });

  // ─── Test 3: Total payment ───
  it('total payment equals monthly × term', () => {
    const result = calculateLoanPayment({
      loanAmount: 20000,
      annualRate: 7,
      loanTerm: 60,
      extraPayment: 0,
    });
    const monthly = result.monthlyPayment as number;
    const total = result.totalPayment as number;
    expect(total).toBeCloseTo(monthly * 60, 0);
  });

  // ─── Test 4: Extra payments shorten payoff ───
  it('$50 extra payment shortens payoff from 60 months', () => {
    const result = calculateLoanPayment({
      loanAmount: 20000,
      annualRate: 7,
      loanTerm: 60,
      extraPayment: 50,
    });
    const schedule = result.amortizationSchedule as Array<{ month: number }>;
    expect(schedule.length).toBeLessThan(60);
    expect(schedule.length).toBeGreaterThan(45);
  });

  // ─── Test 5: Extra payments save interest ───
  it('$50 extra payment saves interest', () => {
    const withoutExtra = calculateLoanPayment({
      loanAmount: 20000,
      annualRate: 7,
      loanTerm: 60,
      extraPayment: 0,
    });
    const withExtra = calculateLoanPayment({
      loanAmount: 20000,
      annualRate: 7,
      loanTerm: 60,
      extraPayment: 50,
    });
    expect(Number(withExtra.totalInterest)).toBeLessThan(Number(withoutExtra.totalInterest));
  });

  // ─── Test 6: 36-month term yields higher payment ───
  it('36-month term has higher payment than 60-month', () => {
    const short = calculateLoanPayment({
      loanAmount: 20000,
      annualRate: 7,
      loanTerm: 36,
      extraPayment: 0,
    });
    const long = calculateLoanPayment({
      loanAmount: 20000,
      annualRate: 7,
      loanTerm: 60,
      extraPayment: 0,
    });
    expect(Number(short.monthlyPayment)).toBeGreaterThan(Number(long.monthlyPayment));
  });

  // ─── Test 7: 36-month term has less total interest ───
  it('36-month term pays less total interest than 60-month', () => {
    const short = calculateLoanPayment({
      loanAmount: 20000,
      annualRate: 7,
      loanTerm: 36,
      extraPayment: 0,
    });
    const long = calculateLoanPayment({
      loanAmount: 20000,
      annualRate: 7,
      loanTerm: 60,
      extraPayment: 0,
    });
    expect(Number(short.totalInterest)).toBeLessThan(Number(long.totalInterest));
  });

  // ─── Test 8: Payoff date format ───
  it('formats payoff date correctly for 60-month loan', () => {
    const result = calculateLoanPayment({
      loanAmount: 20000,
      annualRate: 7,
      loanTerm: 60,
      extraPayment: 0,
    });
    expect(result.payoffDate).toBe('5 years');
  });

  // ─── Test 9: Amortization schedule length matches term ───
  it('schedule has exactly 60 rows for 60-month term', () => {
    const result = calculateLoanPayment({
      loanAmount: 20000,
      annualRate: 7,
      loanTerm: 60,
      extraPayment: 0,
    });
    const schedule = result.amortizationSchedule as Array<{ month: number }>;
    expect(schedule).toHaveLength(60);
  });

  // ─── Test 10: Balance over time starts at loan amount ───
  it('balance chart starts at $20,000', () => {
    const result = calculateLoanPayment({
      loanAmount: 20000,
      annualRate: 7,
      loanTerm: 60,
      extraPayment: 0,
    });
    const balanceData = result.balanceOverTime as Array<{ month: number; balance: number }>;
    expect(balanceData[0].month).toBe(0);
    expect(balanceData[0].balance).toBe(20000);
  });

  // ─── Test 11: First month interest ───
  it('first month interest is correct', () => {
    const result = calculateLoanPayment({
      loanAmount: 20000,
      annualRate: 7,
      loanTerm: 60,
      extraPayment: 0,
    });
    const schedule = result.amortizationSchedule as Array<{ interest: number }>;
    // $20,000 × 0.07/12 = $116.67
    expect(schedule[0].interest).toBeCloseTo(116.67, 0);
  });

  // ─── Test 12: Zero interest loan ───
  it('handles zero interest rate', () => {
    const result = calculateLoanPayment({
      loanAmount: 20000,
      annualRate: 0,
      loanTerm: 60,
      extraPayment: 0,
    });
    expect(result.monthlyPayment).toBeCloseTo(333.33, 0);
    expect(result.totalInterest).toBeCloseTo(0, 0);
  });

  // ─── Test 13: Small loan $500 ───
  it('handles small $500 loan at 12% for 12 months', () => {
    const result = calculateLoanPayment({
      loanAmount: 500,
      annualRate: 12,
      loanTerm: 12,
      extraPayment: 0,
    });
    // M ≈ $44.42
    expect(result.monthlyPayment).toBeCloseTo(44.42, 0);
  });

  // ─── Test 14: Pie chart has principal and interest ───
  it('payment breakdown pie chart shows principal and interest', () => {
    const result = calculateLoanPayment({
      loanAmount: 20000,
      annualRate: 7,
      loanTerm: 60,
      extraPayment: 0,
    });
    const breakdown = result.paymentBreakdown as Array<{ name: string; value: number }>;
    expect(breakdown).toHaveLength(2);
    expect(breakdown[0].name).toBe('Principal');
    expect(breakdown[0].value).toBe(20000);
  });
});
