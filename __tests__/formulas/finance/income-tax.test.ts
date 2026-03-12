import { calculateIncomeTax } from '@/lib/formulas/finance/income-tax';

describe('calculateIncomeTax', () => {
  // ─── Test 1: Single filer, $75,000 gross, standard deduction ───
  it('calculates federal tax correctly for single filer at $75,000', () => {
    const result = calculateIncomeTax({
      grossIncome: 75000,
      filingStatus: 'single',
      deductionType: 'standard',
      preTaxDeductions: 0,
      taxCredits: 0,
    });
    // Taxable = $60,000. 10% on $11,925 + 12% on $36,550 + 22% on $11,525
    // = $1,192.50 + $4,386.00 + $2,535.50 = $8,114.00
    expect(result.federalTax).toBeCloseTo(8114, 0);
    expect(result.effectiveRate).toBeCloseTo(10.82, 1);
    expect(result.marginalRate).toBe(22);
  });

  // ─── Test 2: Zero income → tax = $0 ───
  it('returns zero tax for zero income', () => {
    const result = calculateIncomeTax({
      grossIncome: 0,
      filingStatus: 'single',
      deductionType: 'standard',
    });
    expect(result.federalTax).toBe(0);
    expect(result.effectiveRate).toBe(0);
    expect(result.afterTaxIncome).toBe(0);
  });

  // ─── Test 3: Income below standard deduction → tax = $0 ───
  it('returns zero tax when income is below standard deduction', () => {
    const result = calculateIncomeTax({
      grossIncome: 10000,
      filingStatus: 'single',
      deductionType: 'standard',
    });
    // $10,000 - $15,000 standard deduction = $0 taxable (floored)
    expect(result.federalTax).toBe(0);
    expect(result.effectiveRate).toBe(0);
    expect(result.afterTaxIncome).toBe(10000);
  });

  // ─── Test 4: Single filer, $200,000 ───
  it('calculates correctly for single filer at $200,000', () => {
    const result = calculateIncomeTax({
      grossIncome: 200000,
      filingStatus: 'single',
      deductionType: 'standard',
      preTaxDeductions: 0,
      taxCredits: 0,
    });
    // Taxable = $185,000
    // 10%: $1,192.50 + 12%: $4,386.00 + 22%: $12,072.50 + 24%: $19,596.00 = $37,247.00
    expect(result.federalTax).toBeCloseTo(37247, 0);
    expect(result.marginalRate).toBe(24);
  });

  // ─── Test 5: Married filing jointly, $150,000 ───
  it('calculates correctly for married filing jointly at $150,000', () => {
    const result = calculateIncomeTax({
      grossIncome: 150000,
      filingStatus: 'married-jointly',
      deductionType: 'standard',
      preTaxDeductions: 0,
      taxCredits: 0,
    });
    // Standard deduction $30,000, taxable = $120,000
    // 10%: $2,385 + 12%: $8,772 + 22%: $5,071 = $16,228
    expect(result.federalTax).toBeCloseTo(16228, 0);
    expect(result.marginalRate).toBe(22);
  });

  // ─── Test 6: Married filing jointly, $50,000 ───
  it('calculates correctly for married filing jointly at $50,000', () => {
    const result = calculateIncomeTax({
      grossIncome: 50000,
      filingStatus: 'married-jointly',
      deductionType: 'standard',
      preTaxDeductions: 0,
      taxCredits: 0,
    });
    // Standard deduction $30,000, taxable = $20,000
    // All in 10% bracket (10% bracket goes to $23,850): $2,000
    expect(result.federalTax).toBeCloseTo(2000, 0);
    expect(result.marginalRate).toBe(10);
  });

  // ─── Test 7: Head of household, $80,000 ───
  it('calculates correctly for head of household at $80,000', () => {
    const result = calculateIncomeTax({
      grossIncome: 80000,
      filingStatus: 'head-of-household',
      deductionType: 'standard',
      preTaxDeductions: 0,
      taxCredits: 0,
    });
    // Standard deduction $22,500, taxable = $57,500
    // 10% on $17,000 = $1,700 + 12% on $40,500 = $4,860 = $6,560
    expect(result.federalTax).toBeCloseTo(6560, 0);
    expect(result.marginalRate).toBe(12);
  });

  // ─── Test 8: Itemized deductions vs standard ───
  it('applies itemized deductions correctly and produces lower tax', () => {
    const standardResult = calculateIncomeTax({
      grossIncome: 75000,
      filingStatus: 'single',
      deductionType: 'standard',
    });
    const itemizedResult = calculateIncomeTax({
      grossIncome: 75000,
      filingStatus: 'single',
      deductionType: 'itemized',
      itemizedDeductions: 25000,
    });
    // Itemized $25,000 > standard $15,000 → taxable = $50,000
    // 10%: $1,192.50 + 12%: $4,386.00 + 22%: $335.50 = $5,914.00
    expect(itemizedResult.federalTax).toBeCloseTo(5914, 0);
    expect(itemizedResult.federalTax).toBeLessThan(standardResult.federalTax as number);
  });

  // ─── Test 9: With pre-tax deductions (401k) ───
  it('reduces taxable income by pre-tax deductions', () => {
    const result = calculateIncomeTax({
      grossIncome: 100000,
      filingStatus: 'single',
      deductionType: 'standard',
      preTaxDeductions: 20500,
      taxCredits: 0,
    });
    // AGI = $79,500, taxable = $79,500 - $15,000 = $64,500
    // 10%: $1,192.50 + 12%: $4,386.00 + 22%: $3,525.50 = $9,104.00
    expect(result.federalTax).toBeCloseTo(9104, 0);
  });

  // ─── Test 10: With tax credits ───
  it('reduces tax owed by tax credits dollar-for-dollar', () => {
    const resultNoCredits = calculateIncomeTax({
      grossIncome: 75000,
      filingStatus: 'single',
      deductionType: 'standard',
      taxCredits: 0,
    });
    const resultWithCredits = calculateIncomeTax({
      grossIncome: 75000,
      filingStatus: 'single',
      deductionType: 'standard',
      taxCredits: 2000,
    });
    // Tax before credits = $8,114, after $2,000 credit = $6,114
    expect(resultWithCredits.federalTax).toBeCloseTo(6114, 0);
    expect((resultNoCredits.federalTax as number) - (resultWithCredits.federalTax as number)).toBeCloseTo(2000, 0);
  });

  // ─── Test 11: Tax credits don't go below zero ───
  it('floors federal tax at zero when credits exceed tax', () => {
    const result = calculateIncomeTax({
      grossIncome: 20000,
      filingStatus: 'single',
      deductionType: 'standard',
      taxCredits: 5000,
    });
    // Taxable = $5,000, tax = $500 (10%), credits = $5,000 → tax = $0
    expect(result.federalTax).toBe(0);
    expect(result.afterTaxIncome).toBe(20000);
  });

  // ─── Test 12: Effective rate < marginal rate for all positive incomes ───
  it('effective rate is always less than marginal rate for positive income', () => {
    const incomes = [30000, 60000, 100000, 200000, 500000, 1000000];
    for (const income of incomes) {
      const result = calculateIncomeTax({
        grossIncome: income,
        filingStatus: 'single',
        deductionType: 'standard',
      });
      expect(result.effectiveRate).toBeLessThan(result.marginalRate as number);
    }
  });

  // ─── Test 13: Marginal rate is correct for given income ───
  it('returns correct marginal rate for each bracket', () => {
    // Single filer, taxable income in the 10% bracket
    const result10 = calculateIncomeTax({
      grossIncome: 20000, // taxable = $5,000
      filingStatus: 'single',
      deductionType: 'standard',
    });
    expect(result10.marginalRate).toBe(10);

    // Single filer, taxable income in the 12% bracket
    const result12 = calculateIncomeTax({
      grossIncome: 40000, // taxable = $25,000
      filingStatus: 'single',
      deductionType: 'standard',
    });
    expect(result12.marginalRate).toBe(12);

    // Single filer, taxable income in the 22% bracket
    const result22 = calculateIncomeTax({
      grossIncome: 75000, // taxable = $60,000
      filingStatus: 'single',
      deductionType: 'standard',
    });
    expect(result22.marginalRate).toBe(22);

    // Single filer, taxable income in the 24% bracket
    const result24 = calculateIncomeTax({
      grossIncome: 200000, // taxable = $185,000
      filingStatus: 'single',
      deductionType: 'standard',
    });
    expect(result24.marginalRate).toBe(24);
  });

  // ─── Test 14: Summary contains all required labels ───
  it('returns summary with all required labels', () => {
    const result = calculateIncomeTax({
      grossIncome: 75000,
      filingStatus: 'single',
      deductionType: 'standard',
    });
    const summary = result.summary as Array<{ label: string; value: number }>;
    const labels = summary.map(s => s.label);
    expect(labels).toContain('Gross Income');
    expect(labels).toContain('Taxable Income');
    expect(labels).toContain('Federal Tax');
    expect(labels).toContain('Effective Rate');
    expect(labels).toContain('Marginal Rate');
    expect(labels).toContain('After-Tax Income');
    expect(summary).toHaveLength(6);
  });

  // ─── Test 15: Bracket breakdown table has 7 rows ───
  it('returns bracket breakdown table with 7 rows', () => {
    const result = calculateIncomeTax({
      grossIncome: 75000,
      filingStatus: 'single',
      deductionType: 'standard',
    });
    const breakdown = result.bracketBreakdown as Array<{
      bracket: string;
      taxableInBracket: number;
      taxFromBracket: number;
    }>;
    expect(breakdown).toHaveLength(7);
    // First 3 brackets have positive amounts, rest are $0
    expect(breakdown[0].taxableInBracket).toBe(11925);
    expect(breakdown[0].taxFromBracket).toBeCloseTo(1192.50, 2);
    expect(breakdown[1].taxableInBracket).toBe(36550);
    expect(breakdown[1].taxFromBracket).toBeCloseTo(4386, 2);
    expect(breakdown[2].taxableInBracket).toBe(11525);
    expect(breakdown[2].taxFromBracket).toBeCloseTo(2535.50, 2);
    expect(breakdown[3].taxableInBracket).toBe(0);
  });

  // ─── Test 16: Very high income — $1,000,000 single ───
  it('calculates correctly for very high income ($1,000,000 single)', () => {
    const result = calculateIncomeTax({
      grossIncome: 1000000,
      filingStatus: 'single',
      deductionType: 'standard',
      preTaxDeductions: 0,
      taxCredits: 0,
    });
    // Taxable = $985,000
    // 10%: $1,192.50 + 12%: $4,386.00 + 22%: $12,072.50
    // + 24%: $22,548.00 + 32%: $17,032.00 + 35%: $131,538.75
    // + 37%: $132,700.50 = $321,470.25
    expect(result.federalTax).toBeCloseTo(321470.25, 0);
    expect(result.marginalRate).toBe(37);
  });

  // ─── Test 17: Married filing separately uses single brackets ───
  it('married filing separately uses same brackets as single', () => {
    const singleResult = calculateIncomeTax({
      grossIncome: 100000,
      filingStatus: 'single',
      deductionType: 'standard',
    });
    const separateResult = calculateIncomeTax({
      grossIncome: 100000,
      filingStatus: 'married-separately',
      deductionType: 'standard',
    });
    expect(singleResult.federalTax).toBe(separateResult.federalTax);
    expect(singleResult.marginalRate).toBe(separateResult.marginalRate);
    expect(singleResult.effectiveRate).toBe(separateResult.effectiveRate);
  });

  // ─── Test 18: Pie chart data structure ───
  it('returns pie chart data with correct segments', () => {
    const result = calculateIncomeTax({
      grossIncome: 100000,
      filingStatus: 'single',
      deductionType: 'standard',
      preTaxDeductions: 5000,
    });
    const pieData = result.taxBreakdown as Array<{ name: string; value: number }>;
    const names = pieData.map(d => d.name);
    expect(names).toContain('Federal Tax');
    expect(names).toContain('After-Tax Income');
    expect(names).toContain('Pre-Tax Deductions');
    // Sum should equal gross income
    const total = pieData.reduce((sum, d) => sum + d.value, 0);
    expect(total).toBeCloseTo(100000, 0);
  });

  // ─── Test 19: Pie chart omits pre-tax deductions when zero ───
  it('omits pre-tax deductions from pie chart when zero', () => {
    const result = calculateIncomeTax({
      grossIncome: 75000,
      filingStatus: 'single',
      deductionType: 'standard',
      preTaxDeductions: 0,
    });
    const pieData = result.taxBreakdown as Array<{ name: string; value: number }>;
    const names = pieData.map(d => d.name);
    expect(names).not.toContain('Pre-Tax Deductions');
    expect(pieData).toHaveLength(2);
  });

  // ─── Test 20: After-tax income calculation ───
  it('calculates after-tax income correctly with pre-tax deductions', () => {
    const result = calculateIncomeTax({
      grossIncome: 100000,
      filingStatus: 'single',
      deductionType: 'standard',
      preTaxDeductions: 20500,
      taxCredits: 0,
    });
    // After-tax = grossIncome - federalTax - preTaxDeductions
    // = $100,000 - $9,104 - $20,500 = $70,396
    expect(result.afterTaxIncome).toBeCloseTo(70396, 0);
  });

  // ─── Test 21: Bar chart data structure ───
  it('returns marginal rate chart with 7 bracket entries', () => {
    const result = calculateIncomeTax({
      grossIncome: 75000,
      filingStatus: 'single',
      deductionType: 'standard',
    });
    const barData = result.marginalRateChart as Array<{ bracket: string; amount: number }>;
    expect(barData).toHaveLength(7);
    expect(barData[0].bracket).toBe('10%');
    expect(barData[6].bracket).toBe('37%');
  });
});
