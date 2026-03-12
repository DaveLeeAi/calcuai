import { calculateHomeAffordability } from '@/lib/formulas/finance/home-affordability';

describe('calculateHomeAffordability', () => {
  // ─── Test 1: Default scenario — $100k income, $500/mo debts, $60k down ───
  it('calculates default scenario correctly', () => {
    const result = calculateHomeAffordability({
      annualIncome: 100000,
      monthlyDebts: 500,
      downPayment: 60000,
      interestRate: 6.5,
      loanTerm: '30',
      propertyTaxRate: 1.2,
      annualInsurance: 1500,
      includePMI: true,
    });
    const maxPrice = result.maxHomePrice as number;
    // Should afford approximately $330k-$400k
    expect(maxPrice).toBeGreaterThan(300000);
    expect(maxPrice).toBeLessThan(420000);
    // DTI ratios should be within 28/36 limits
    expect(result.frontEndDTI as number).toBeLessThanOrEqual(28.1);
    expect(result.backEndDTI as number).toBeLessThanOrEqual(36.1);
  });

  // ─── Test 2: Zero income returns only down payment ───
  it('returns down payment as max home price when income is zero', () => {
    const result = calculateHomeAffordability({
      annualIncome: 0,
      monthlyDebts: 0,
      downPayment: 50000,
      interestRate: 6.5,
      loanTerm: '30',
      propertyTaxRate: 1.2,
      annualInsurance: 1500,
      includePMI: true,
    });
    const maxPrice = result.maxHomePrice as number;
    // With zero income, max housing payment is $0, so max price = down payment
    expect(maxPrice).toBeCloseTo(50000, -2);
  });

  // ─── Test 3: High debts reduce affordability (back-end binds) ───
  it('reduces affordability when monthly debts are high', () => {
    const lowDebt = calculateHomeAffordability({
      annualIncome: 100000,
      monthlyDebts: 200,
      downPayment: 60000,
      interestRate: 6.5,
      loanTerm: '30',
      propertyTaxRate: 1.2,
      annualInsurance: 1500,
      includePMI: true,
    });
    const highDebt = calculateHomeAffordability({
      annualIncome: 100000,
      monthlyDebts: 1500,
      downPayment: 60000,
      interestRate: 6.5,
      loanTerm: '30',
      propertyTaxRate: 1.2,
      annualInsurance: 1500,
      includePMI: true,
    });
    expect(highDebt.maxHomePrice as number).toBeLessThan(lowDebt.maxHomePrice as number);
  });

  // ─── Test 4: Larger down payment increases max home price ───
  it('larger down payment increases max home price', () => {
    const smallDown = calculateHomeAffordability({
      annualIncome: 100000,
      monthlyDebts: 500,
      downPayment: 20000,
      interestRate: 6.5,
      loanTerm: '30',
      propertyTaxRate: 1.2,
      annualInsurance: 1500,
      includePMI: true,
    });
    const largeDown = calculateHomeAffordability({
      annualIncome: 100000,
      monthlyDebts: 500,
      downPayment: 100000,
      interestRate: 6.5,
      loanTerm: '30',
      propertyTaxRate: 1.2,
      annualInsurance: 1500,
      includePMI: true,
    });
    expect(largeDown.maxHomePrice as number).toBeGreaterThan(smallDown.maxHomePrice as number);
  });

  // ─── Test 5: Zero interest rate ───
  it('handles zero interest rate correctly', () => {
    const result = calculateHomeAffordability({
      annualIncome: 100000,
      monthlyDebts: 0,
      downPayment: 50000,
      interestRate: 0,
      loanTerm: '30',
      propertyTaxRate: 0,
      annualInsurance: 0,
      includePMI: false,
    });
    const maxPrice = result.maxHomePrice as number;
    // At 0% rate with no taxes/insurance/PMI, max P&I = 28% of $8,333 = $2,333
    // Max loan = $2,333 × 360 = $839,880
    // Max price = $839,880 + $50,000 ≈ $890,000
    expect(maxPrice).toBeGreaterThan(880000);
    expect(maxPrice).toBeLessThan(900000);
  });

  // ─── Test 6: 15-year term vs 30-year term ───
  it('15-year term reduces max home price vs 30-year term', () => {
    const term30 = calculateHomeAffordability({
      annualIncome: 100000,
      monthlyDebts: 500,
      downPayment: 60000,
      interestRate: 6.5,
      loanTerm: '30',
      propertyTaxRate: 1.2,
      annualInsurance: 1500,
      includePMI: true,
    });
    const term15 = calculateHomeAffordability({
      annualIncome: 100000,
      monthlyDebts: 500,
      downPayment: 60000,
      interestRate: 6.5,
      loanTerm: '15',
      propertyTaxRate: 1.2,
      annualInsurance: 1500,
      includePMI: true,
    });
    expect(term15.maxHomePrice as number).toBeLessThan(term30.maxHomePrice as number);
  });

  // ─── Test 7: PMI toggle affects affordability ───
  it('disabling PMI increases affordability when down payment < 20%', () => {
    const withPMI = calculateHomeAffordability({
      annualIncome: 100000,
      monthlyDebts: 500,
      downPayment: 20000,
      interestRate: 6.5,
      loanTerm: '30',
      propertyTaxRate: 1.2,
      annualInsurance: 1500,
      includePMI: true,
    });
    const noPMI = calculateHomeAffordability({
      annualIncome: 100000,
      monthlyDebts: 500,
      downPayment: 20000,
      interestRate: 6.5,
      loanTerm: '30',
      propertyTaxRate: 1.2,
      annualInsurance: 1500,
      includePMI: false,
    });
    // Without PMI, more of the budget goes to P&I, increasing affordability
    expect(noPMI.maxHomePrice as number).toBeGreaterThan(withPMI.maxHomePrice as number);
  });

  // ─── Test 8: Higher interest rate reduces affordability ───
  it('higher interest rate reduces max home price', () => {
    const lowRate = calculateHomeAffordability({
      annualIncome: 100000,
      monthlyDebts: 500,
      downPayment: 60000,
      interestRate: 5,
      loanTerm: '30',
      propertyTaxRate: 1.2,
      annualInsurance: 1500,
      includePMI: true,
    });
    const highRate = calculateHomeAffordability({
      annualIncome: 100000,
      monthlyDebts: 500,
      downPayment: 60000,
      interestRate: 8,
      loanTerm: '30',
      propertyTaxRate: 1.2,
      annualInsurance: 1500,
      includePMI: true,
    });
    expect(highRate.maxHomePrice as number).toBeLessThan(lowRate.maxHomePrice as number);
  });

  // ─── Test 9: Payment breakdown pie chart contains correct entries ───
  it('returns payment breakdown with correct entries', () => {
    const result = calculateHomeAffordability({
      annualIncome: 100000,
      monthlyDebts: 500,
      downPayment: 30000,
      interestRate: 6.5,
      loanTerm: '30',
      propertyTaxRate: 1.2,
      annualInsurance: 1500,
      includePMI: true,
    });
    const breakdown = result.paymentBreakdown as Array<{ name: string; value: number }>;
    const names = breakdown.map(b => b.name);
    expect(names).toContain('Principal & Interest');
    expect(names).toContain('Property Tax');
    expect(names).toContain('Insurance');
    // PMI should be present when down payment < 20%
    expect(names).toContain('PMI');
  });

  // ─── Test 10: Summary contains all required labels ───
  it('returns summary with all required labels', () => {
    const result = calculateHomeAffordability({
      annualIncome: 100000,
      monthlyDebts: 500,
      downPayment: 60000,
      interestRate: 6.5,
      loanTerm: '30',
      propertyTaxRate: 1.2,
      annualInsurance: 1500,
      includePMI: true,
    });
    const summary = result.summary as Array<{ label: string; value: number }>;
    const labels = summary.map(s => s.label);
    expect(labels).toContain('Max Home Price');
    expect(labels).toContain('Max Loan Amount');
    expect(labels).toContain('Max Monthly Payment');
    expect(labels).toContain('Down Payment');
    expect(labels).toContain('Front-End DTI');
    expect(labels).toContain('Back-End DTI');
    expect(summary).toHaveLength(6);
  });

  // ─── Test 11: Max loan amount = max home price minus down payment ───
  it('max loan amount equals max home price minus down payment', () => {
    const result = calculateHomeAffordability({
      annualIncome: 100000,
      monthlyDebts: 500,
      downPayment: 60000,
      interestRate: 6.5,
      loanTerm: '30',
      propertyTaxRate: 1.2,
      annualInsurance: 1500,
      includePMI: true,
    });
    const maxPrice = result.maxHomePrice as number;
    const maxLoan = result.maxLoanAmount as number;
    expect(maxLoan).toBeCloseTo(maxPrice - 60000, -1);
  });

  // ─── Test 12: Very high income produces large affordability ───
  it('handles high income correctly', () => {
    const result = calculateHomeAffordability({
      annualIncome: 500000,
      monthlyDebts: 1000,
      downPayment: 200000,
      interestRate: 6.5,
      loanTerm: '30',
      propertyTaxRate: 1.2,
      annualInsurance: 1500,
      includePMI: true,
    });
    const maxPrice = result.maxHomePrice as number;
    expect(maxPrice).toBeGreaterThan(1000000);
  });

  // ─── Test 13: Debts exceeding 36% threshold — very limited affordability ───
  it('handles excessive debts that consume back-end DTI', () => {
    const result = calculateHomeAffordability({
      annualIncome: 60000,
      monthlyDebts: 1800,
      downPayment: 30000,
      interestRate: 6.5,
      loanTerm: '30',
      propertyTaxRate: 1.2,
      annualInsurance: 1500,
      includePMI: true,
    });
    // Gross monthly income = $5,000
    // Back-end max = $5,000 × 0.36 = $1,800; minus $1,800 debts = $0 for housing
    // Max home price should be approximately the down payment only
    const maxPrice = result.maxHomePrice as number;
    expect(maxPrice).toBeLessThanOrEqual(40000);
  });

  // ─── Test 14: No PMI when down payment >= 20% of home price ───
  it('does not include PMI when down payment is 20% or more', () => {
    const result = calculateHomeAffordability({
      annualIncome: 100000,
      monthlyDebts: 0,
      downPayment: 200000,
      interestRate: 6.5,
      loanTerm: '30',
      propertyTaxRate: 1.2,
      annualInsurance: 1500,
      includePMI: true,
    });
    const breakdown = result.paymentBreakdown as Array<{ name: string; value: number }>;
    const names = breakdown.map(b => b.name);
    // With $200k down on a ~$500k home, down payment is ~40%, no PMI
    expect(names).not.toContain('PMI');
  });

  // ─── Test 15: High property tax rate reduces affordability ───
  it('higher property tax rate reduces max home price', () => {
    const lowTax = calculateHomeAffordability({
      annualIncome: 100000,
      monthlyDebts: 500,
      downPayment: 60000,
      interestRate: 6.5,
      loanTerm: '30',
      propertyTaxRate: 0.5,
      annualInsurance: 1500,
      includePMI: true,
    });
    const highTax = calculateHomeAffordability({
      annualIncome: 100000,
      monthlyDebts: 500,
      downPayment: 60000,
      interestRate: 6.5,
      loanTerm: '30',
      propertyTaxRate: 2.5,
      annualInsurance: 1500,
      includePMI: true,
    });
    expect(highTax.maxHomePrice as number).toBeLessThan(lowTax.maxHomePrice as number);
  });
});
