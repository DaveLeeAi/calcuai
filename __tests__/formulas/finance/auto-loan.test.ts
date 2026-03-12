import { calculateAutoLoan } from '@/lib/formulas/finance/auto-loan';

describe('calculateAutoLoan', () => {
  // ─── Test 1: Standard auto loan — $35,000 vehicle, $5k down, 6% for 60 months ───
  it('calculates standard auto loan correctly', () => {
    const result = calculateAutoLoan({
      vehiclePrice: 35000,
      tradeInValue: 0,
      downPayment: 5000,
      annualRate: 6,
      loanTerm: 60,
      salesTaxRate: 0,
    });
    // Loan amount = $30,000
    expect(result.loanAmount).toBe(30000);
    // M = 30000 × [0.005×(1.005)^60] / [(1.005)^60 - 1] ≈ $579.98
    expect(result.monthlyPayment).toBeCloseTo(579.98, 0);
    expect(result.totalInterest).toBeCloseTo(4799, -1);
  });

  // ─── Test 2: With trade-in value ───
  it('subtracts trade-in from vehicle price', () => {
    const result = calculateAutoLoan({
      vehiclePrice: 40000,
      tradeInValue: 10000,
      downPayment: 5000,
      annualRate: 5,
      loanTerm: 60,
      salesTaxRate: 0,
    });
    // Loan = 40000 - 10000 - 5000 = $25,000
    expect(result.loanAmount).toBe(25000);
    const payment = result.monthlyPayment as number;
    expect(payment).toBeCloseTo(471.78, 0);
  });

  // ─── Test 3: With sales tax ───
  it('calculates sales tax on price after trade-in', () => {
    const result = calculateAutoLoan({
      vehiclePrice: 30000,
      tradeInValue: 5000,
      downPayment: 3000,
      annualRate: 6,
      loanTerm: 60,
      salesTaxRate: 7,
    });
    // Taxable = 30000 - 5000 = $25,000
    // Sales tax = 25000 × 0.07 = $1,750
    expect(result.salesTaxAmount).toBe(1750);
    // Loan = 30000 - 5000 - 3000 + 1750 = $23,750
    expect(result.loanAmount).toBe(23750);
  });

  // ─── Test 4: Zero interest rate ───
  it('handles zero interest rate (0% APR promo)', () => {
    const result = calculateAutoLoan({
      vehiclePrice: 24000,
      tradeInValue: 0,
      downPayment: 0,
      annualRate: 0,
      loanTerm: 48,
      salesTaxRate: 0,
    });
    // $24,000 / 48 = $500/month exactly
    expect(result.monthlyPayment).toBe(500);
    expect(result.totalInterest).toBe(0);
    expect(result.totalPayment).toBe(24000);
  });

  // ─── Test 5: Zero loan amount (down payment covers everything) ───
  it('handles zero loan amount gracefully', () => {
    const result = calculateAutoLoan({
      vehiclePrice: 20000,
      tradeInValue: 10000,
      downPayment: 12000,
      annualRate: 5,
      loanTerm: 60,
      salesTaxRate: 0,
    });
    expect(result.monthlyPayment).toBe(0);
    expect(result.loanAmount).toBe(0);
    expect(result.totalInterest).toBe(0);
  });

  // ─── Test 6: Short-term loan (36 months) ───
  it('calculates 36-month loan correctly', () => {
    const result = calculateAutoLoan({
      vehiclePrice: 25000,
      tradeInValue: 0,
      downPayment: 5000,
      annualRate: 4.5,
      loanTerm: 36,
      salesTaxRate: 0,
    });
    // Loan = $20,000
    expect(result.loanAmount).toBe(20000);
    const payment = result.monthlyPayment as number;
    // M ≈ $595.05
    expect(payment).toBeCloseTo(595.05, 0);
    expect(result.payoffDate).toBe('3 years');
  });

  // ─── Test 7: Long-term loan (84 months) ───
  it('calculates 84-month loan correctly', () => {
    const result = calculateAutoLoan({
      vehiclePrice: 45000,
      tradeInValue: 0,
      downPayment: 5000,
      annualRate: 7,
      loanTerm: 84,
      salesTaxRate: 0,
    });
    expect(result.loanAmount).toBe(40000);
    const payment = result.monthlyPayment as number;
    expect(payment).toBeGreaterThan(550);
    expect(payment).toBeLessThan(650);
    expect(result.payoffDate).toBe('7 years');
  });

  // ─── Test 8: Amortization schedule length ───
  it('generates amortization schedule with correct length', () => {
    const result = calculateAutoLoan({
      vehiclePrice: 30000,
      tradeInValue: 0,
      downPayment: 5000,
      annualRate: 5,
      loanTerm: 60,
      salesTaxRate: 0,
    });
    const schedule = result.amortizationSchedule as Array<{ month: number }>;
    expect(schedule).toHaveLength(60);
    expect(schedule[0].month).toBe(1);
    expect(schedule[59].month).toBe(60);
  });

  // ─── Test 9: Amortization ends near zero balance ───
  it('amortization schedule ends at zero balance', () => {
    const result = calculateAutoLoan({
      vehiclePrice: 30000,
      tradeInValue: 0,
      downPayment: 5000,
      annualRate: 5,
      loanTerm: 60,
      salesTaxRate: 0,
    });
    const schedule = result.amortizationSchedule as Array<{ balance: number }>;
    expect(schedule[59].balance).toBeCloseTo(0, 0);
  });

  // ─── Test 10: Balance over time chart data ───
  it('generates balanceOverTime with correct length', () => {
    const result = calculateAutoLoan({
      vehiclePrice: 30000,
      tradeInValue: 0,
      downPayment: 5000,
      annualRate: 5,
      loanTerm: 60,
      salesTaxRate: 0,
    });
    const balanceData = result.balanceOverTime as Array<{ month: number; balance: number }>;
    // Month 0 + 60 months = 61 entries
    expect(balanceData).toHaveLength(61);
    expect(balanceData[0].month).toBe(0);
    expect(balanceData[0].balance).toBe(25000);
  });

  // ─── Test 11: Summary labels ───
  it('returns summary with all required labels', () => {
    const result = calculateAutoLoan({
      vehiclePrice: 30000,
      tradeInValue: 0,
      downPayment: 5000,
      annualRate: 5,
      loanTerm: 60,
      salesTaxRate: 6,
    });
    const summary = result.summary as Array<{ label: string; value: number | string }>;
    const labels = summary.map(s => s.label);
    expect(labels).toContain('Monthly Payment');
    expect(labels).toContain('Loan Amount');
    expect(labels).toContain('Sales Tax');
    expect(labels).toContain('Total Interest');
    expect(labels).toContain('Total of Payments');
    expect(labels).toContain('Payoff Time');
  });

  // ─── Test 12: Payment breakdown pie chart ───
  it('returns payment breakdown with tax when present', () => {
    const result = calculateAutoLoan({
      vehiclePrice: 30000,
      tradeInValue: 0,
      downPayment: 5000,
      annualRate: 5,
      loanTerm: 60,
      salesTaxRate: 6,
    });
    const breakdown = result.paymentBreakdown as Array<{ name: string; value: number }>;
    const names = breakdown.map(b => b.name);
    expect(names).toContain('Principal');
    expect(names).toContain('Interest');
    expect(names).toContain('Sales Tax');
  });

  // ─── Test 13: Total payment = loan amount + total interest ───
  it('total payment equals loan amount plus total interest', () => {
    const result = calculateAutoLoan({
      vehiclePrice: 28000,
      tradeInValue: 3000,
      downPayment: 2000,
      annualRate: 5.5,
      loanTerm: 48,
      salesTaxRate: 0,
    });
    const totalPayment = result.totalPayment as number;
    const loanAmount = result.loanAmount as number;
    const totalInterest = result.totalInterest as number;
    expect(totalPayment).toBeCloseTo(loanAmount + totalInterest, 0);
  });

  // ─── Test 14: Payoff date formatting — months only ───
  it('formats payoff date correctly for partial years', () => {
    const result = calculateAutoLoan({
      vehiclePrice: 15000,
      tradeInValue: 0,
      downPayment: 0,
      annualRate: 5,
      loanTerm: 6,
      salesTaxRate: 0,
    });
    expect(result.payoffDate).toBe('6 months');
  });

  // ─── Test 15: Payoff date formatting — years and months ───
  it('formats payoff date with years and months', () => {
    const result = calculateAutoLoan({
      vehiclePrice: 30000,
      tradeInValue: 0,
      downPayment: 5000,
      annualRate: 5,
      loanTerm: 42,
      salesTaxRate: 0,
    });
    expect(result.payoffDate).toBe('3 years, 6 months');
  });

  // ─── Test 16: High interest rate ───
  it('handles high interest rate correctly', () => {
    const result = calculateAutoLoan({
      vehiclePrice: 20000,
      tradeInValue: 0,
      downPayment: 2000,
      annualRate: 15,
      loanTerm: 60,
      salesTaxRate: 0,
    });
    expect(result.loanAmount).toBe(18000);
    const totalInterest = result.totalInterest as number;
    // At 15% over 5 years, interest should be substantial (>$7,000)
    expect(totalInterest).toBeGreaterThan(7000);
  });
});
