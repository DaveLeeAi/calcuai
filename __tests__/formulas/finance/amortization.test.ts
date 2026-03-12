import { calculateAmortization } from '@/lib/formulas/finance/amortization';

describe('calculateAmortization', () => {
  // ─── Test 1: Standard 30-year mortgage payment ───
  it('calculates $300,000 at 6.5% for 30 years correctly', () => {
    const result = calculateAmortization({
      loanAmount: 300000,
      interestRate: 6.5,
      loanTerm: 30,
      extraPayment: 0,
    });
    // M = 300000 × [0.005417 × (1.005417)^360] / [(1.005417)^360 - 1] ≈ $1,896.20
    expect(result.monthlyPayment).toBeCloseTo(1896.20, 0);
  });

  // ─── Test 2: Total interest over 30 years ───
  it('calculates total interest on $300,000 at 6.5% for 30 years', () => {
    const result = calculateAmortization({
      loanAmount: 300000,
      interestRate: 6.5,
      loanTerm: 30,
      extraPayment: 0,
    });
    // Total interest ≈ $382,633
    expect(result.totalInterest).toBeCloseTo(382633, -2);
  });

  // ─── Test 3: 15-year mortgage payment ───
  it('calculates $300,000 at 6.5% for 15 years correctly', () => {
    const result = calculateAmortization({
      loanAmount: 300000,
      interestRate: 6.5,
      loanTerm: 15,
      extraPayment: 0,
    });
    // 15-year payment ≈ $2,613.32
    expect(result.monthlyPayment).toBeCloseTo(2613.32, 0);
  });

  // ─── Test 4: Schedule has correct length ───
  it('generates 360 rows for a 30-year mortgage', () => {
    const result = calculateAmortization({
      loanAmount: 300000,
      interestRate: 6.5,
      loanTerm: 30,
      extraPayment: 0,
    });
    const schedule = result.amortizationSchedule as Array<{ month: number }>;
    expect(schedule).toHaveLength(360);
  });

  // ─── Test 5: Schedule ends at zero balance ───
  it('amortization schedule ends with balance near zero', () => {
    const result = calculateAmortization({
      loanAmount: 300000,
      interestRate: 6.5,
      loanTerm: 30,
      extraPayment: 0,
    });
    const schedule = result.amortizationSchedule as Array<{ balance: number }>;
    expect(schedule[schedule.length - 1].balance).toBeCloseTo(0, 0);
  });

  // ─── Test 6: Yearly breakdown has 30 rows ───
  it('generates 30 yearly breakdown rows for a 30-year loan', () => {
    const result = calculateAmortization({
      loanAmount: 300000,
      interestRate: 6.5,
      loanTerm: 30,
      extraPayment: 0,
    });
    const yearly = result.yearlyBreakdown as Array<{ year: number }>;
    expect(yearly).toHaveLength(30);
  });

  // ─── Test 7: First month interest is correct ───
  it('calculates first month interest correctly', () => {
    const result = calculateAmortization({
      loanAmount: 300000,
      interestRate: 6.5,
      loanTerm: 30,
      extraPayment: 0,
    });
    const schedule = result.amortizationSchedule as Array<{ interest: number }>;
    // First month: $300,000 × 0.065/12 = $1,625.00
    expect(schedule[0].interest).toBeCloseTo(1625, 0);
  });

  // ─── Test 8: Extra payments shorten the loan ───
  it('extra payments reduce the number of months', () => {
    const result = calculateAmortization({
      loanAmount: 300000,
      interestRate: 6.5,
      loanTerm: 30,
      extraPayment: 200,
    });
    const schedule = result.amortizationSchedule as Array<{ month: number }>;
    // $200 extra should cut about 74 months off
    expect(schedule.length).toBeLessThan(360);
    expect(schedule.length).toBeGreaterThan(250);
  });

  // ─── Test 9: Extra payments reduce total interest ───
  it('extra payments save interest', () => {
    const without = calculateAmortization({
      loanAmount: 300000,
      interestRate: 6.5,
      loanTerm: 30,
      extraPayment: 0,
    });
    const withExtra = calculateAmortization({
      loanAmount: 300000,
      interestRate: 6.5,
      loanTerm: 30,
      extraPayment: 200,
    });
    expect(Number(withExtra.totalInterest)).toBeLessThan(Number(without.totalInterest));
  });

  // ─── Test 10: Zero interest rate ───
  it('handles zero interest rate correctly', () => {
    const result = calculateAmortization({
      loanAmount: 120000,
      interestRate: 0,
      loanTerm: 10,
      extraPayment: 0,
    });
    // $120,000 / 120 months = $1,000/month
    expect(result.monthlyPayment).toBeCloseTo(1000, 0);
    expect(result.totalInterest).toBeCloseTo(0, 0);
  });

  // ─── Test 11: Zero loan amount returns zeros ───
  it('returns zeros for zero loan amount', () => {
    const result = calculateAmortization({
      loanAmount: 0,
      interestRate: 6.5,
      loanTerm: 30,
      extraPayment: 0,
    });
    expect(result.monthlyPayment).toBe(0);
    expect(result.totalInterest).toBe(0);
    const schedule = result.amortizationSchedule as Array<unknown>;
    expect(schedule).toHaveLength(0);
  });

  // ─── Test 12: Balance over time starts at loan amount ───
  it('balance over time chart starts at loan amount', () => {
    const result = calculateAmortization({
      loanAmount: 300000,
      interestRate: 6.5,
      loanTerm: 30,
      extraPayment: 0,
    });
    const balanceData = result.balanceOverTime as Array<{ month: number; balance: number }>;
    expect(balanceData[0].month).toBe(0);
    expect(balanceData[0].balance).toBe(300000);
  });

  // ─── Test 13: Interest vs. Principal chart data exists ───
  it('generates interest vs principal bar chart data', () => {
    const result = calculateAmortization({
      loanAmount: 300000,
      interestRate: 6.5,
      loanTerm: 30,
      extraPayment: 0,
    });
    const chartData = result.interestVsPrincipal as Array<{ year: string; principal: number; interest: number }>;
    expect(chartData.length).toBe(30);
    // Year 1 should have more interest than principal
    expect(chartData[0].interest).toBeGreaterThan(chartData[0].principal);
  });

  // ─── Test 14: 10-year term generates 120 schedule rows ───
  it('generates 120 rows for a 10-year mortgage', () => {
    const result = calculateAmortization({
      loanAmount: 200000,
      interestRate: 5.0,
      loanTerm: 10,
      extraPayment: 0,
    });
    const schedule = result.amortizationSchedule as Array<{ month: number }>;
    expect(schedule).toHaveLength(120);
  });

  // ─── Test 15: Summary includes payoff info ───
  it('summary includes payoff time label', () => {
    const result = calculateAmortization({
      loanAmount: 300000,
      interestRate: 6.5,
      loanTerm: 30,
      extraPayment: 0,
    });
    const summary = result.summary as Array<{ label: string; value: number | string }>;
    const payoff = summary.find(s => s.label === 'Payoff');
    expect(payoff).toBeDefined();
    expect(payoff!.value).toContain('30 years');
  });
});
