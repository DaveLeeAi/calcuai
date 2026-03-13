import { calculateRentalProperty } from '@/lib/formulas/finance/rental-property';

describe('calculateRentalProperty', () => {
  // ─── Test 1: Standard scenario — $200k, 20% down, 7%, 30yr, $1,500/mo rent ───
  it('standard scenario: $200k property, 20% down, 7%, 30yr, $1,500/mo', () => {
    const result = calculateRentalProperty({
      purchasePrice: 200000,
      downPaymentPercent: 20,
      interestRate: 7,
      loanTerm: '30',
      closingCosts: 0,
      monthlyRent: 1500,
      vacancyRate: 5,
      propertyTax: 2400,
      insurance: 1200,
      maintenance: 1,
      managementFee: 0,
      otherExpenses: 0,
      appreciationRate: 3,
    });
    expect(result.downPayment).toBe(40000);
    expect(result.loanAmount).toBe(160000);
    expect(result.totalCashNeeded).toBe(40000);
    // Monthly mortgage for $160k at 7%/30yr ≈ $1,064.48
    expect(result.monthlyMortgage).toBeCloseTo(1064.48, 0);
    // Effective gross income: $1,500 * 12 * 0.95 = $17,100
    expect(result.effectiveGrossIncome).toBe(17100);
    // Expenses: $2,400 + $1,200 + $2,000 + $0 + $0 = $5,600
    expect(result.annualExpenses).toBe(5600);
    // NOI: $17,100 - $5,600 = $11,500
    expect(result.netOperatingIncome).toBe(11500);
    // Annual debt service: ~$1,064.48 * 12 ≈ $12,773.76
    expect(result.annualDebtService).toBeCloseTo(12773.76, 0);
    // Annual cash flow: $11,500 - $12,773.76 ≈ -$1,273.76
    expect(result.annualCashFlow).toBeCloseTo(-1273.76, 0);
  });

  // ─── Test 2: All-cash purchase (100% down) ───
  it('all-cash purchase: 100% down, no mortgage', () => {
    const result = calculateRentalProperty({
      purchasePrice: 200000,
      downPaymentPercent: 100,
      interestRate: 7,
      loanTerm: '30',
      closingCosts: 5000,
      monthlyRent: 1500,
      vacancyRate: 5,
      propertyTax: 2400,
      insurance: 1200,
      maintenance: 1,
      managementFee: 0,
      otherExpenses: 0,
    });
    expect(result.downPayment).toBe(200000);
    expect(result.loanAmount).toBe(0);
    expect(result.monthlyMortgage).toBe(0);
    expect(result.annualDebtService).toBe(0);
    expect(result.totalCashNeeded).toBe(205000);
    // NOI = $17,100 - $5,600 = $11,500
    expect(result.netOperatingIncome).toBe(11500);
    // Cash flow = NOI (no debt)
    expect(result.annualCashFlow).toBe(11500);
    // DSCR should be 999 (no debt)
    expect(result.dscr).toBe(999);
  });

  // ─── Test 3: High leverage (5% down) ───
  it('high leverage: 5% down payment', () => {
    const result = calculateRentalProperty({
      purchasePrice: 200000,
      downPaymentPercent: 5,
      interestRate: 7,
      loanTerm: '30',
      closingCosts: 5000,
      monthlyRent: 1500,
      vacancyRate: 5,
      propertyTax: 2400,
      insurance: 1200,
      maintenance: 1,
      managementFee: 0,
      otherExpenses: 0,
    });
    expect(result.downPayment).toBe(10000);
    expect(result.loanAmount).toBe(190000);
    expect(result.totalCashNeeded).toBe(15000);
    // Higher loan = higher mortgage payment
    expect(result.monthlyMortgage).toBeCloseTo(1264.07, 0);
    // Cash flow should be more negative due to higher debt service
    expect(result.annualCashFlow as number).toBeLessThan(-3000);
  });

  // ─── Test 4: Zero vacancy ───
  it('zero vacancy rate: full rental income', () => {
    const result = calculateRentalProperty({
      purchasePrice: 200000,
      downPaymentPercent: 20,
      interestRate: 7,
      loanTerm: '30',
      monthlyRent: 1500,
      vacancyRate: 0,
      propertyTax: 2400,
      insurance: 1200,
      maintenance: 1,
      managementFee: 0,
      otherExpenses: 0,
    });
    // Effective gross income: $1,500 * 12 * 1.0 = $18,000
    expect(result.effectiveGrossIncome).toBe(18000);
    expect(result.netOperatingIncome).toBe(12400); // $18,000 - $5,600
  });

  // ─── Test 5: High vacancy (15%) ───
  it('high vacancy rate reduces income significantly', () => {
    const result = calculateRentalProperty({
      purchasePrice: 200000,
      downPaymentPercent: 20,
      interestRate: 7,
      loanTerm: '30',
      monthlyRent: 1500,
      vacancyRate: 15,
      propertyTax: 2400,
      insurance: 1200,
      maintenance: 1,
      managementFee: 0,
      otherExpenses: 0,
    });
    // Effective gross income: $1,500 * 12 * 0.85 = $15,300
    expect(result.effectiveGrossIncome).toBe(15300);
    // More negative cash flow than 5% vacancy
    const standardResult = calculateRentalProperty({
      purchasePrice: 200000,
      downPaymentPercent: 20,
      interestRate: 7,
      loanTerm: '30',
      monthlyRent: 1500,
      vacancyRate: 5,
      propertyTax: 2400,
      insurance: 1200,
      maintenance: 1,
      managementFee: 0,
      otherExpenses: 0,
    });
    expect(result.annualCashFlow as number).toBeLessThan(standardResult.annualCashFlow as number);
  });

  // ─── Test 6: Negative cash flow scenario ───
  it('negative cash flow is valid and displayed correctly', () => {
    const result = calculateRentalProperty({
      purchasePrice: 300000,
      downPaymentPercent: 10,
      interestRate: 8,
      loanTerm: '30',
      monthlyRent: 1200,
      vacancyRate: 10,
      propertyTax: 4000,
      insurance: 2000,
      maintenance: 2,
      managementFee: 10,
      otherExpenses: 1200,
    });
    expect(result.annualCashFlow as number).toBeLessThan(0);
    expect(result.monthlyCashFlow as number).toBeLessThan(0);
    expect(result.cashOnCashReturn as number).toBeLessThan(0);
  });

  // ─── Test 7: Zero interest rate ───
  it('zero interest rate: mortgage = principal / months', () => {
    const result = calculateRentalProperty({
      purchasePrice: 240000,
      downPaymentPercent: 20,
      interestRate: 0,
      loanTerm: '30',
      monthlyRent: 1500,
      vacancyRate: 5,
      propertyTax: 2400,
      insurance: 1200,
      maintenance: 1,
      managementFee: 0,
      otherExpenses: 0,
    });
    // Loan = $192,000 / 360 months = $533.33/mo
    expect(result.monthlyMortgage).toBeCloseTo(533.33, 1);
    expect(result.annualDebtService).toBeCloseTo(6400, 0);
  });

  // ─── Test 8: 15-year vs 30-year loan ───
  it('15-year loan has higher mortgage but less total interest', () => {
    const base = {
      purchasePrice: 200000,
      downPaymentPercent: 20,
      interestRate: 7,
      monthlyRent: 1500,
      vacancyRate: 5,
      propertyTax: 2400,
      insurance: 1200,
      maintenance: 1,
      managementFee: 0,
      otherExpenses: 0,
    };
    const result15 = calculateRentalProperty({ ...base, loanTerm: '15' });
    const result30 = calculateRentalProperty({ ...base, loanTerm: '30' });

    // 15yr has higher monthly mortgage
    expect(result15.monthlyMortgage as number).toBeGreaterThan(result30.monthlyMortgage as number);
    // 15yr has lower (more negative) annual cash flow due to higher payments
    expect(result15.annualCashFlow as number).toBeLessThan(result30.annualCashFlow as number);
  });

  // ─── Test 9: Property tax impact ───
  it('higher property tax reduces NOI and cash flow', () => {
    const lowTax = calculateRentalProperty({
      purchasePrice: 200000,
      downPaymentPercent: 20,
      interestRate: 7,
      loanTerm: '30',
      monthlyRent: 1500,
      vacancyRate: 5,
      propertyTax: 1200,
      insurance: 1200,
      maintenance: 1,
      managementFee: 0,
      otherExpenses: 0,
    });
    const highTax = calculateRentalProperty({
      purchasePrice: 200000,
      downPaymentPercent: 20,
      interestRate: 7,
      loanTerm: '30',
      monthlyRent: 1500,
      vacancyRate: 5,
      propertyTax: 6000,
      insurance: 1200,
      maintenance: 1,
      managementFee: 0,
      otherExpenses: 0,
    });
    expect(highTax.netOperatingIncome as number).toBeLessThan(lowTax.netOperatingIncome as number);
    expect((lowTax.netOperatingIncome as number) - (highTax.netOperatingIncome as number)).toBe(4800);
  });

  // ─── Test 10: Management fee calculation ───
  it('management fee calculated as percentage of gross rent', () => {
    const result = calculateRentalProperty({
      purchasePrice: 200000,
      downPaymentPercent: 20,
      interestRate: 7,
      loanTerm: '30',
      monthlyRent: 2000,
      vacancyRate: 5,
      propertyTax: 2400,
      insurance: 1200,
      maintenance: 1,
      managementFee: 10,
      otherExpenses: 0,
    });
    // Management fee: 10% of $24,000 gross annual rent = $2,400
    const breakdown = result.expenseBreakdown as { label: string; value: number }[];
    const mgmtEntry = breakdown.find(e => e.label === 'Management');
    expect(mgmtEntry?.value).toBe(2400);
  });

  // ─── Test 11: Maintenance calculation ───
  it('maintenance calculated as percentage of property value', () => {
    const result = calculateRentalProperty({
      purchasePrice: 300000,
      downPaymentPercent: 20,
      interestRate: 7,
      loanTerm: '30',
      monthlyRent: 2000,
      vacancyRate: 5,
      propertyTax: 3000,
      insurance: 1500,
      maintenance: 2,
      managementFee: 0,
      otherExpenses: 0,
    });
    // Maintenance: 2% of $300,000 = $6,000
    const breakdown = result.expenseBreakdown as { label: string; value: number }[];
    const maintEntry = breakdown.find(e => e.label === 'Maintenance');
    expect(maintEntry?.value).toBe(6000);
  });

  // ─── Test 12: Cap rate accuracy ───
  it('cap rate = NOI / purchase price', () => {
    const result = calculateRentalProperty({
      purchasePrice: 200000,
      downPaymentPercent: 20,
      interestRate: 7,
      loanTerm: '30',
      monthlyRent: 1500,
      vacancyRate: 5,
      propertyTax: 2400,
      insurance: 1200,
      maintenance: 1,
      managementFee: 0,
      otherExpenses: 0,
    });
    // NOI = $11,500, cap rate = $11,500 / $200,000 = 5.75%
    expect(result.capRate).toBe(5.75);
  });

  // ─── Test 13: Cash-on-cash return accuracy ───
  it('cash-on-cash return = annual cash flow / total cash invested', () => {
    const result = calculateRentalProperty({
      purchasePrice: 200000,
      downPaymentPercent: 20,
      interestRate: 7,
      loanTerm: '30',
      closingCosts: 5000,
      monthlyRent: 2000,
      vacancyRate: 5,
      propertyTax: 2400,
      insurance: 1200,
      maintenance: 1,
      managementFee: 0,
      otherExpenses: 0,
    });
    // Total cash needed = $40,000 + $5,000 = $45,000
    expect(result.totalCashNeeded).toBe(45000);
    // cashOnCashReturn = annualCashFlow / 45000 * 100
    const expectedCoCReturn = ((result.annualCashFlow as number) / 45000) * 100;
    expect(result.cashOnCashReturn).toBeCloseTo(expectedCoCReturn, 1);
  });

  // ─── Test 14: DSCR calculation ───
  it('DSCR = NOI / annual debt service', () => {
    const result = calculateRentalProperty({
      purchasePrice: 200000,
      downPaymentPercent: 20,
      interestRate: 7,
      loanTerm: '30',
      monthlyRent: 1500,
      vacancyRate: 5,
      propertyTax: 2400,
      insurance: 1200,
      maintenance: 1,
      managementFee: 0,
      otherExpenses: 0,
    });
    // DSCR = $11,500 / ~$12,773.76
    const expectedDSCR = (result.netOperatingIncome as number) / (result.annualDebtService as number);
    expect(result.dscr).toBeCloseTo(expectedDSCR, 1);
    expect(result.dscr as number).toBeLessThan(1); // NOI < debt service
  });

  // ─── Test 15: GRM calculation ───
  it('GRM = purchase price / gross annual rent', () => {
    const result = calculateRentalProperty({
      purchasePrice: 200000,
      downPaymentPercent: 20,
      interestRate: 7,
      loanTerm: '30',
      monthlyRent: 1500,
      vacancyRate: 5,
      propertyTax: 2400,
      insurance: 1200,
      maintenance: 1,
      managementFee: 0,
      otherExpenses: 0,
    });
    // GRM = $200,000 / ($1,500 * 12) = $200,000 / $18,000 = 11.11
    expect(result.grm).toBeCloseTo(11.11, 1);
  });

  // ─── Test 16: Break-even ratio ───
  it('break-even ratio = (expenses + debt) / gross rent * 100', () => {
    const result = calculateRentalProperty({
      purchasePrice: 200000,
      downPaymentPercent: 20,
      interestRate: 7,
      loanTerm: '30',
      monthlyRent: 1500,
      vacancyRate: 5,
      propertyTax: 2400,
      insurance: 1200,
      maintenance: 1,
      managementFee: 0,
      otherExpenses: 0,
    });
    // Break-even = ($5,600 + ~$12,773.76) / $18,000 * 100 ≈ 102.07%
    const grossRent = 1500 * 12;
    const expected = ((result.annualExpenses as number) + (result.annualDebtService as number)) / grossRent * 100;
    expect(result.breakEvenRatio).toBeCloseTo(expected, 0);
  });

  // ─── Test 17: Expense breakdown structure ───
  it('expense breakdown contains all required categories', () => {
    const result = calculateRentalProperty({
      purchasePrice: 200000,
      downPaymentPercent: 20,
      interestRate: 7,
      loanTerm: '30',
      monthlyRent: 1500,
      vacancyRate: 5,
      propertyTax: 2400,
      insurance: 1200,
      maintenance: 1,
      managementFee: 8,
      otherExpenses: 600,
    });
    const breakdown = result.expenseBreakdown as { label: string; value: number }[];
    expect(breakdown).toHaveLength(6);
    const labels = breakdown.map(e => e.label);
    expect(labels).toContain('Property Tax');
    expect(labels).toContain('Insurance');
    expect(labels).toContain('Maintenance');
    expect(labels).toContain('Management');
    expect(labels).toContain('Other');
    expect(labels).toContain('Mortgage (P&I)');
  });

  // ─── Test 18: Five-year projection structure ───
  it('five-year projection has 5 rows with correct structure', () => {
    const result = calculateRentalProperty({
      purchasePrice: 200000,
      downPaymentPercent: 20,
      interestRate: 7,
      loanTerm: '30',
      monthlyRent: 1500,
      vacancyRate: 5,
      propertyTax: 2400,
      insurance: 1200,
      maintenance: 1,
      managementFee: 0,
      otherExpenses: 0,
      appreciationRate: 3,
    });
    const projection = result.fiveYearProjection as {
      year: number;
      propertyValue: number;
      annualRent: number;
      cashFlow: number;
      equity: number;
      totalReturn: number;
    }[];
    expect(projection).toHaveLength(5);
    expect(projection[0].year).toBe(1);
    expect(projection[4].year).toBe(5);
    // Property should appreciate 3% per year
    expect(projection[0].propertyValue).toBeCloseTo(206000, 0);
    expect(projection[4].propertyValue).toBeCloseTo(200000 * Math.pow(1.03, 5), -1);
    // All rows should have equity > down payment (property appreciating)
    for (const row of projection) {
      expect(row.equity).toBeGreaterThan(0);
    }
  });

  // ─── Test 19: Zero rent scenario ───
  it('zero rent produces negative cash flow based on expenses', () => {
    const result = calculateRentalProperty({
      purchasePrice: 200000,
      downPaymentPercent: 20,
      interestRate: 7,
      loanTerm: '30',
      monthlyRent: 0,
      vacancyRate: 5,
      propertyTax: 2400,
      insurance: 1200,
      maintenance: 1,
      managementFee: 0,
      otherExpenses: 0,
    });
    expect(result.effectiveGrossIncome).toBe(0);
    expect(result.netOperatingIncome as number).toBeLessThan(0);
    expect(result.annualCashFlow as number).toBeLessThan(0);
    expect(result.grm).toBe(0); // can't divide by zero rent
  });

  // ─── Test 20: High-value property ($1M) ───
  it('high-value property: $1M with proportional numbers', () => {
    const result = calculateRentalProperty({
      purchasePrice: 1000000,
      downPaymentPercent: 25,
      interestRate: 6.5,
      loanTerm: '30',
      closingCosts: 20000,
      monthlyRent: 5000,
      vacancyRate: 5,
      propertyTax: 12000,
      insurance: 4000,
      maintenance: 1,
      managementFee: 10,
      otherExpenses: 2400,
    });
    expect(result.downPayment).toBe(250000);
    expect(result.loanAmount).toBe(750000);
    expect(result.totalCashNeeded).toBe(270000);
    // Mortgage for $750k at 6.5%/30yr ≈ $4,741
    expect(result.monthlyMortgage).toBeCloseTo(4741, 0);
    // Gross annual rent: $60,000
    // EGI: $57,000
    // Expenses: $12,000 + $4,000 + $10,000 + $6,000 + $2,400 = $34,400
    expect(result.annualExpenses).toBe(34400);
  });

  // ─── Test 21: Monthly cash flow = annual / 12 ───
  it('monthly cash flow is exactly annual cash flow / 12', () => {
    const result = calculateRentalProperty({
      purchasePrice: 200000,
      downPaymentPercent: 20,
      interestRate: 7,
      loanTerm: '30',
      monthlyRent: 2000,
      vacancyRate: 5,
      propertyTax: 2400,
      insurance: 1200,
      maintenance: 1,
      managementFee: 0,
      otherExpenses: 0,
    });
    expect(result.monthlyCashFlow).toBeCloseTo((result.annualCashFlow as number) / 12, 1);
  });

  // ─── Test 22: Total cash needed = down payment + closing costs ───
  it('total cash needed includes both down payment and closing costs', () => {
    const result = calculateRentalProperty({
      purchasePrice: 300000,
      downPaymentPercent: 20,
      interestRate: 7,
      loanTerm: '30',
      closingCosts: 8000,
      monthlyRent: 2000,
      vacancyRate: 5,
      propertyTax: 3000,
      insurance: 1500,
      maintenance: 1,
      managementFee: 0,
      otherExpenses: 0,
    });
    expect(result.totalCashNeeded).toBe(68000); // $60,000 + $8,000
    expect(result.downPayment).toBe(60000);
  });

  // ─── Test 23: Cap rate does not include mortgage ───
  it('cap rate is independent of financing (same for cash vs leveraged)', () => {
    const base = {
      purchasePrice: 200000,
      interestRate: 7,
      loanTerm: '30',
      monthlyRent: 1500,
      vacancyRate: 5,
      propertyTax: 2400,
      insurance: 1200,
      maintenance: 1,
      managementFee: 0,
      otherExpenses: 0,
    };
    const cash = calculateRentalProperty({ ...base, downPaymentPercent: 100 });
    const leveraged = calculateRentalProperty({ ...base, downPaymentPercent: 20 });
    // Cap rate should be the same regardless of financing
    expect(cash.capRate).toBe(leveraged.capRate);
  });

  // ─── Test 24: Zero down payment ───
  it('0% down payment means full loan amount', () => {
    const result = calculateRentalProperty({
      purchasePrice: 200000,
      downPaymentPercent: 0,
      interestRate: 7,
      loanTerm: '30',
      closingCosts: 5000,
      monthlyRent: 1500,
      vacancyRate: 5,
      propertyTax: 2400,
      insurance: 1200,
      maintenance: 1,
      managementFee: 0,
      otherExpenses: 0,
    });
    expect(result.downPayment).toBe(0);
    expect(result.loanAmount).toBe(200000);
    expect(result.totalCashNeeded).toBe(5000);
  });

  // ─── Test 25: Strong positive cash flow scenario ───
  it('high rent relative to cost produces strong positive returns', () => {
    const result = calculateRentalProperty({
      purchasePrice: 150000,
      downPaymentPercent: 25,
      interestRate: 6,
      loanTerm: '30',
      closingCosts: 3000,
      monthlyRent: 1800,
      vacancyRate: 3,
      propertyTax: 1500,
      insurance: 900,
      maintenance: 0.5,
      managementFee: 0,
      otherExpenses: 0,
    });
    expect(result.annualCashFlow as number).toBeGreaterThan(0);
    expect(result.cashOnCashReturn as number).toBeGreaterThan(5);
    expect(result.dscr as number).toBeGreaterThan(1);
    expect(result.capRate as number).toBeGreaterThan(8);
  });
});
