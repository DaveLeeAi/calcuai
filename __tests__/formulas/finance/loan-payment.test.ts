import { calculateLoanPayment } from '@/lib/formulas/finance/loan-payment';

describe('calculateLoanPayment', () => {
  // ─── Test 1: Standard personal loan ───
  it('calculates standard $25,000 loan at 6.5% for 60 months correctly', () => {
    const result = calculateLoanPayment({
      loanAmount: 25000,
      annualRate: 6.5,
      loanTerm: 60,
      extraPayment: 0,
    });
    // M = 25000 × [0.005417 × 1.3829] / [1.3829 - 1] ≈ $489.15
    expect(result.monthlyPayment).toBeCloseTo(489.15, 0);
  });

  // ─── Test 2: Auto loan ───
  it('calculates $35,000 auto loan at 5.5% for 72 months correctly', () => {
    const result = calculateLoanPayment({
      loanAmount: 35000,
      annualRate: 5.5,
      loanTerm: 72,
      extraPayment: 0,
    });
    // M = 35000 × [0.004583 × 1.3894] / [1.3894 - 1] ≈ $571.83
    expect(result.monthlyPayment).toBeCloseTo(571.83, 0);
  });

  // ─── Test 3: Short term loan ───
  it('calculates $10,000 at 8% for 24 months correctly', () => {
    const result = calculateLoanPayment({
      loanAmount: 10000,
      annualRate: 8,
      loanTerm: 24,
      extraPayment: 0,
    });
    // M ≈ $452.27
    expect(result.monthlyPayment).toBeCloseTo(452.27, 0);
  });

  // ─── Test 4: Zero interest rate ───
  it('handles zero interest rate correctly', () => {
    const result = calculateLoanPayment({
      loanAmount: 12000,
      annualRate: 0,
      loanTerm: 36,
      extraPayment: 0,
    });
    // $12,000 / 36 = $333.33
    expect(result.monthlyPayment).toBeCloseTo(333.33, 0);
    expect(result.totalInterest).toBeCloseTo(0, 0);
  });

  // ─── Test 5: Extra payments shorten the loan ───
  it('pays off early with extra payments — schedule shorter than original term', () => {
    const result = calculateLoanPayment({
      loanAmount: 25000,
      annualRate: 6.5,
      loanTerm: 60,
      extraPayment: 100,
    });
    const schedule = result.amortizationSchedule as Array<{ month: number }>;
    // With $100 extra, loan pays off in 49 months instead of 60
    expect(schedule.length).toBe(49);
    expect(schedule.length).toBeLessThan(60);
  });

  // ─── Test 6: Extra payment saves interest ───
  it('calculates interest savings with extra payments', () => {
    const withoutExtra = calculateLoanPayment({
      loanAmount: 25000,
      annualRate: 6.5,
      loanTerm: 60,
      extraPayment: 0,
    });
    const withExtra = calculateLoanPayment({
      loanAmount: 25000,
      annualRate: 6.5,
      loanTerm: 60,
      extraPayment: 100,
    });
    const interestWithout = withoutExtra.totalInterest as number;
    const interestWith = withExtra.totalInterest as number;
    // Should save approximately $865 in interest
    expect(interestWithout - interestWith).toBeCloseTo(865, -1);
    expect(interestWith).toBeLessThan(interestWithout);
  });

  // ─── Test 7: Amortization schedule correct length without extra payments ───
  it('generates amortization schedule with correct number of rows', () => {
    const result = calculateLoanPayment({
      loanAmount: 25000,
      annualRate: 6.5,
      loanTerm: 60,
      extraPayment: 0,
    });
    const schedule = result.amortizationSchedule as Array<{ month: number }>;
    expect(schedule).toHaveLength(60);
  });

  // ─── Test 8: Amortization ends at zero balance ───
  it('amortization schedule ends with balance at zero', () => {
    const result = calculateLoanPayment({
      loanAmount: 25000,
      annualRate: 6.5,
      loanTerm: 60,
      extraPayment: 0,
    });
    const schedule = result.amortizationSchedule as Array<{ balance: number }>;
    const lastRow = schedule[schedule.length - 1];
    expect(lastRow.balance).toBeCloseTo(0, 0);
  });

  // ─── Test 9: First month interest calculation ───
  it('calculates first month interest correctly', () => {
    const result = calculateLoanPayment({
      loanAmount: 25000,
      annualRate: 6.5,
      loanTerm: 60,
      extraPayment: 0,
    });
    const schedule = result.amortizationSchedule as Array<{ interest: number }>;
    // First month interest: $25,000 × 0.065/12 ≈ $135.42
    expect(schedule[0].interest).toBeCloseTo(135.42, 0);
  });

  // ─── Test 10: Total interest + principal = total payment ───
  it('total interest plus principal equals total payment', () => {
    const result = calculateLoanPayment({
      loanAmount: 25000,
      annualRate: 6.5,
      loanTerm: 60,
      extraPayment: 0,
    });
    const totalPayment = result.totalPayment as number;
    const totalInterest = result.totalInterest as number;
    expect(totalInterest + 25000).toBeCloseTo(totalPayment, 0);
  });

  // ─── Test 11: Payment breakdown pie chart has 2 entries ───
  it('returns payment breakdown with Principal and Interest entries', () => {
    const result = calculateLoanPayment({
      loanAmount: 25000,
      annualRate: 6.5,
      loanTerm: 60,
      extraPayment: 0,
    });
    const breakdown = result.paymentBreakdown as Array<{ name: string; value: number }>;
    expect(breakdown).toHaveLength(2);
    expect(breakdown[0].name).toBe('Principal');
    expect(breakdown[1].name).toBe('Interest');
    expect(breakdown[0].value).toBe(25000);
    expect(breakdown[1].value).toBeCloseTo(4349, 0);
  });

  // ─── Test 12: Balance over time starts at loan amount ───
  it('balance over time starts at the loan amount', () => {
    const result = calculateLoanPayment({
      loanAmount: 25000,
      annualRate: 6.5,
      loanTerm: 60,
      extraPayment: 0,
    });
    const balanceData = result.balanceOverTime as Array<{ month: number; balance: number }>;
    expect(balanceData[0].month).toBe(0);
    expect(balanceData[0].balance).toBe(25000);
  });

  // ─── Test 13: Very large loan ───
  it('handles large loan: $500,000 at 4% for 360 months', () => {
    const result = calculateLoanPayment({
      loanAmount: 500000,
      annualRate: 4,
      loanTerm: 360,
      extraPayment: 0,
    });
    // M ≈ $2,387.08
    expect(result.monthlyPayment).toBeCloseTo(2387.08, 0);
  });

  // ─── Test 14: Minimum loan ───
  it('handles minimum loan: $100 at 5% for 12 months', () => {
    const result = calculateLoanPayment({
      loanAmount: 100,
      annualRate: 5,
      loanTerm: 12,
      extraPayment: 0,
    });
    // M ≈ $8.56
    expect(result.monthlyPayment).toBeCloseTo(8.56, 0);
  });

  // ─── Test 15: Payoff date format ───
  it('formats payoff date correctly for 60-month loan', () => {
    const result = calculateLoanPayment({
      loanAmount: 25000,
      annualRate: 6.5,
      loanTerm: 60,
      extraPayment: 0,
    });
    expect(result.payoffDate).toBe('5 years');
  });

  // ─── Test 16: Payoff date with remaining months ───
  it('formats payoff date with years and months for non-round terms', () => {
    const result = calculateLoanPayment({
      loanAmount: 25000,
      annualRate: 6.5,
      loanTerm: 42,
      extraPayment: 0,
    });
    expect(result.payoffDate).toBe('3 years, 6 months');
  });

  // ─── Test 17: Summary includes extra payment savings ───
  it('includes months saved and interest saved in summary when extra payments are used', () => {
    const result = calculateLoanPayment({
      loanAmount: 25000,
      annualRate: 6.5,
      loanTerm: 60,
      extraPayment: 100,
    });
    const summary = result.summary as Array<{ label: string; value: number | string }>;
    const monthsSaved = summary.find(s => s.label === 'Months Saved');
    const interestSaved = summary.find(s => s.label === 'Interest Saved');
    expect(monthsSaved).toBeDefined();
    expect(interestSaved).toBeDefined();
    expect(monthsSaved!.value).toBe('11 months');
    expect(interestSaved!.value).toBeCloseTo(865, -1);
  });

  // ─── Test 18: Zero loan amount returns zeros ───
  it('handles zero loan amount gracefully', () => {
    const result = calculateLoanPayment({
      loanAmount: 0,
      annualRate: 6.5,
      loanTerm: 60,
      extraPayment: 0,
    });
    expect(result.monthlyPayment).toBe(0);
    expect(result.totalPayment).toBe(0);
    expect(result.totalInterest).toBe(0);
  });
});
