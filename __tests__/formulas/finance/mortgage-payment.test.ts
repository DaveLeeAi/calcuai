import { calculateMortgage } from '@/lib/formulas/finance/mortgage-payment';

describe('calculateMortgage', () => {
  // ─── Test 1: Standard 30-year fixed ───
  it('calculates standard 30-year fixed mortgage P&I correctly', () => {
    const result = calculateMortgage({
      homePrice: 350000,
      downPayment: 70000,
      interestRate: 6.5,
      loanTerm: '30',
    });
    // $280,000 at 6.5% for 30 years → P&I ≈ $1,769.79/mo
    // Down payment is exactly 20%, so PMI = 0
    expect(result.monthlyPayment).toBeCloseTo(1769.79, 0);
  });

  // ─── Test 2: 15-year fixed ───
  it('calculates 15-year fixed mortgage correctly', () => {
    const result = calculateMortgage({
      homePrice: 350000,
      downPayment: 70000,
      interestRate: 6.0,
      loanTerm: '15',
    });
    // $280,000 at 6.0% for 15 years → P&I ≈ $2,362.80/mo
    expect(result.monthlyPayment).toBeCloseTo(2362.80, 0);
  });

  // ─── Test 3: 10-year fixed ───
  it('calculates 10-year fixed mortgage correctly', () => {
    const result = calculateMortgage({
      homePrice: 250000,
      downPayment: 50000,
      interestRate: 5.5,
      loanTerm: '10',
    });
    // $200,000 at 5.5% for 10 years → P&I ≈ $2,170.53/mo
    expect(result.monthlyPayment).toBeCloseTo(2170.53, 0);
  });

  // ─── Test 4: Zero interest rate ───
  it('handles zero interest rate correctly', () => {
    const result = calculateMortgage({
      homePrice: 360000,
      downPayment: 0,
      interestRate: 0,
      loanTerm: '30',
      includePMI: false,
    });
    // $360,000 / 360 months = $1,000/mo
    expect(result.monthlyPayment).toBeCloseTo(1000, 0);
  });

  // ─── Test 5: With property tax and insurance ───
  it('includes property tax and insurance in monthly payment', () => {
    const result = calculateMortgage({
      homePrice: 350000,
      downPayment: 70000,
      interestRate: 6.5,
      loanTerm: '30',
      propertyTax: 4200,
      homeInsurance: 1440,
    });
    // P&I ≈ $1,769.79 + tax ($350/mo) + insurance ($120/mo) = ~$2,239.79
    expect(result.monthlyPayment).toBeCloseTo(2239.79, 0);
  });

  // ─── Test 6: PMI applied when down payment < 20% ───
  it('applies PMI when down payment is less than 20%', () => {
    const result = calculateMortgage({
      homePrice: 300000,
      downPayment: 15000, // 5% down
      interestRate: 7.0,
      loanTerm: '30',
      includePMI: true,
    });
    // Principal = $285,000, PMI = 285000 * 0.005 / 12 ≈ $118.75/mo
    const principal = 285000;
    const monthlyRate = 0.07 / 12;
    const factor = Math.pow(1 + monthlyRate, 360);
    const pAndI = principal * (monthlyRate * factor) / (factor - 1);
    const pmi = principal * 0.005 / 12;
    expect(result.monthlyPayment).toBeCloseTo(pAndI + pmi, 0);
  });

  // ─── Test 7: No PMI when down payment >= 20% ───
  it('does not apply PMI when down payment is 20% or more', () => {
    const result = calculateMortgage({
      homePrice: 400000,
      downPayment: 80000, // exactly 20%
      interestRate: 6.5,
      loanTerm: '30',
      includePMI: true,
    });
    // Principal = $320,000, no PMI since down payment = 20%
    const principal = 320000;
    const monthlyRate = 0.065 / 12;
    const factor = Math.pow(1 + monthlyRate, 360);
    const pAndI = principal * (monthlyRate * factor) / (factor - 1);
    expect(result.monthlyPayment).toBeCloseTo(pAndI, 0);
  });

  // ─── Test 8: PMI toggle disabled ───
  it('skips PMI when includePMI is false even with low down payment', () => {
    const result = calculateMortgage({
      homePrice: 300000,
      downPayment: 15000, // 5% down
      interestRate: 7.0,
      loanTerm: '30',
      includePMI: false,
    });
    const principal = 285000;
    const monthlyRate = 0.07 / 12;
    const factor = Math.pow(1 + monthlyRate, 360);
    const pAndI = principal * (monthlyRate * factor) / (factor - 1);
    // No PMI component
    expect(result.monthlyPayment).toBeCloseTo(pAndI, 0);
  });

  // ─── Test 9: Amortization schedule has correct length ───
  it('generates amortization schedule with correct number of rows', () => {
    const result = calculateMortgage({
      homePrice: 200000,
      downPayment: 40000,
      interestRate: 5.0,
      loanTerm: '30',
    });
    const schedule = result.amortizationSchedule as Array<{ month: number }>;
    expect(schedule).toHaveLength(360);
  });

  // ─── Test 10: Amortization ends near zero ───
  it('amortization schedule ends with balance near zero', () => {
    const result = calculateMortgage({
      homePrice: 350000,
      downPayment: 70000,
      interestRate: 6.5,
      loanTerm: '30',
    });
    const schedule = result.amortizationSchedule as Array<{ balance: number }>;
    const lastRow = schedule[schedule.length - 1];
    expect(lastRow.balance).toBeCloseTo(0, 0);
  });

  // ─── Test 11: First month interest > principal in early payments ───
  it('first month has more interest than principal on a 30-year loan', () => {
    const result = calculateMortgage({
      homePrice: 400000,
      downPayment: 80000,
      interestRate: 7.0,
      loanTerm: '30',
    });
    const schedule = result.amortizationSchedule as Array<{
      month: number;
      principal: number;
      interest: number;
    }>;
    const firstMonth = schedule[0];
    // At 7% on $320k, first month interest = 320000 * 0.07/12 ≈ $1,866.67
    expect(firstMonth.interest).toBeGreaterThan(firstMonth.principal);
    expect(firstMonth.interest).toBeCloseTo(1866.67, 0);
  });

  // ─── Test 12: Loan summary contains correct total interest ───
  it('calculates total interest over the life of the loan', () => {
    const result = calculateMortgage({
      homePrice: 350000,
      downPayment: 70000,
      interestRate: 6.5,
      loanTerm: '30',
    });
    const summary = result.loanSummary as Array<{ label: string; value: number }>;
    const totalInterest = summary.find(s => s.label === 'Total Interest');
    // $280,000 at 6.5% for 30yr: total interest ≈ $357,125
    expect(totalInterest).toBeDefined();
    expect(totalInterest!.value).toBeCloseTo(357125, -2);
  });

  // ─── Test 13: Payment breakdown pie chart data ───
  it('returns payment breakdown with correct components', () => {
    const result = calculateMortgage({
      homePrice: 300000,
      downPayment: 30000,
      interestRate: 6.5,
      loanTerm: '30',
      propertyTax: 3600,
      homeInsurance: 1200,
      includePMI: true,
    });
    const breakdown = result.paymentBreakdown as Array<{ name: string; value: number }>;
    const names = breakdown.map(b => b.name);
    expect(names).toContain('Principal & Interest');
    expect(names).toContain('Property Tax');
    expect(names).toContain('Insurance');
    expect(names).toContain('PMI');
    expect(breakdown.length).toBe(4);
  });

  // ─── Test 14: Balance over time data for chart ───
  it('generates balance over time data points for each year', () => {
    const result = calculateMortgage({
      homePrice: 200000,
      downPayment: 40000,
      interestRate: 5.0,
      loanTerm: '15',
    });
    const balanceData = result.balanceOverTime as Array<{ year: number; balance: number }>;
    // Should have year 0 + 15 yearly data points = 16 entries
    expect(balanceData).toHaveLength(16);
    expect(balanceData[0].year).toBe(0);
    expect(balanceData[0].balance).toBe(160000);
    expect(balanceData[balanceData.length - 1].balance).toBeCloseTo(0, -1);
  });

  // ─── Test 15: Very small loan amount ───
  it('handles very small loan amounts correctly', () => {
    const result = calculateMortgage({
      homePrice: 15000,
      downPayment: 5000,
      interestRate: 5.0,
      loanTerm: '10',
    });
    // $10,000 at 5% for 10 years → P&I ≈ $106.07/mo
    expect(result.monthlyPayment).toBeCloseTo(106.07, 0);
  });

  // ─── Test 16: 20-year term ───
  it('calculates 20-year mortgage correctly', () => {
    const result = calculateMortgage({
      homePrice: 500000,
      downPayment: 100000,
      interestRate: 6.0,
      loanTerm: '20',
    });
    // $400,000 at 6% for 20 years → P&I ≈ $2,865.72/mo
    expect(result.monthlyPayment).toBeCloseTo(2865.72, 0);
  });

  // ─── Test 17: Full down payment equals home price → zero loan ───
  it('handles full down payment (zero loan amount) gracefully', () => {
    const result = calculateMortgage({
      homePrice: 200000,
      downPayment: 200000,
      interestRate: 6.5,
      loanTerm: '30',
    });
    expect(result.monthlyPayment).toBe(0);
  });
});
