import { calculatePayroll } from '@/lib/formulas/business/payroll';

describe('calculatePayroll', () => {
  // --- Test 1: Basic biweekly paycheck ---
  it('calculates net pay for a standard biweekly paycheck', () => {
    const result = calculatePayroll({
      grossPay: 5000,
      payFrequency: 'biweekly',
      federalTaxRate: 22,
      stateTaxRate: 5,
      preTaxDeductions: 0,
      postTaxDeductions: 0,
    });
    // Federal: 5000 * 0.22 = 1100
    // State: 5000 * 0.05 = 250
    // SS: 5000 * 0.062 = 310
    // Medicare: 5000 * 0.0145 = 72.50
    // Total deductions: 1732.50
    // Net: 5000 - 1732.50 = 3267.50
    expect(result.federalTax).toBe(1100);
    expect(result.stateTax).toBe(250);
    expect(result.socialSecurity).toBe(310);
    expect(result.medicare).toBe(72.5);
    expect(result.netPay).toBe(3267.5);
  });

  // --- Test 2: Weekly paycheck ---
  it('calculates net pay for a weekly paycheck', () => {
    const result = calculatePayroll({
      grossPay: 2000,
      payFrequency: 'weekly',
      federalTaxRate: 22,
      stateTaxRate: 5,
      preTaxDeductions: 0,
      postTaxDeductions: 0,
    });
    // Federal: 2000 * 0.22 = 440
    // State: 2000 * 0.05 = 100
    // SS: 2000 * 0.062 = 124
    // Medicare: 2000 * 0.0145 = 29
    // Net: 2000 - 693 = 1307
    expect(result.federalTax).toBe(440);
    expect(result.stateTax).toBe(100);
    expect(result.socialSecurity).toBe(124);
    expect(result.medicare).toBe(29);
    expect(result.netPay).toBe(1307);
    // Annual: 2000 * 52 = 104000
    expect(result.annualGross).toBe(104000);
  });

  // --- Test 3: Monthly paycheck ---
  it('calculates net pay for a monthly paycheck', () => {
    const result = calculatePayroll({
      grossPay: 10000,
      payFrequency: 'monthly',
      federalTaxRate: 24,
      stateTaxRate: 6,
      preTaxDeductions: 0,
      postTaxDeductions: 0,
    });
    // Federal: 10000 * 0.24 = 2400
    // State: 10000 * 0.06 = 600
    // SS: 10000 * 0.062 = 620
    // Medicare: 10000 * 0.0145 = 145
    // Net: 10000 - 3765 = 6235
    expect(result.federalTax).toBe(2400);
    expect(result.stateTax).toBe(600);
    expect(result.socialSecurity).toBe(620);
    expect(result.medicare).toBe(145);
    expect(result.netPay).toBe(6235);
    // Annual: 10000 * 12 = 120000
    expect(result.annualGross).toBe(120000);
  });

  // --- Test 4: Semi-monthly paycheck ---
  it('calculates net pay for a semi-monthly paycheck', () => {
    const result = calculatePayroll({
      grossPay: 4500,
      payFrequency: 'semi-monthly',
      federalTaxRate: 22,
      stateTaxRate: 4,
      preTaxDeductions: 0,
      postTaxDeductions: 0,
    });
    // Federal: 4500 * 0.22 = 990
    // State: 4500 * 0.04 = 180
    // SS: 4500 * 0.062 = 279
    // Medicare: 4500 * 0.0145 = 65.25
    // Net: 4500 - 1514.25 = 2985.75
    expect(result.federalTax).toBe(990);
    expect(result.stateTax).toBe(180);
    expect(result.socialSecurity).toBe(279);
    expect(result.medicare).toBe(65.25);
    expect(result.netPay).toBe(2985.75);
    // Annual: 4500 * 24 = 108000
    expect(result.annualGross).toBe(108000);
  });

  // --- Test 5: High income (Medicare additional tax kicks in) ---
  it('applies additional Medicare tax for high earners over $200k annual', () => {
    // $10,000 biweekly = $260,000/year -> exceeds $200k threshold
    const result = calculatePayroll({
      grossPay: 10000,
      payFrequency: 'biweekly',
      federalTaxRate: 32,
      stateTaxRate: 9,
      preTaxDeductions: 0,
      postTaxDeductions: 0,
    });
    // Annual: 10000 * 26 = 260000 -> exceeds $200k
    expect(result.annualGross).toBe(260000);
    // Additional Medicare threshold per period: 200000/26 = 7692.31
    // Additional taxable: 10000 - 7692.31 = 2307.69
    // Additional Medicare: 2307.69 * 0.009 = ~20.77
    // Base Medicare: 10000 * 0.0145 = 145
    // Total Medicare > 145 (has additional component)
    expect(Number(result.medicare)).toBeGreaterThan(145);
  });

  // --- Test 6: With pre-tax deductions (401k reduces taxable income) ---
  it('reduces taxable income when pre-tax deductions are present', () => {
    const result = calculatePayroll({
      grossPay: 5000,
      payFrequency: 'biweekly',
      federalTaxRate: 22,
      stateTaxRate: 5,
      preTaxDeductions: 500,
      postTaxDeductions: 0,
    });
    // Taxable: 5000 - 500 = 4500
    // Federal: 4500 * 0.22 = 990
    // State: 4500 * 0.05 = 225
    // SS: 4500 * 0.062 = 279
    // Medicare: 4500 * 0.0145 = 65.25
    // Total deductions: 990 + 225 + 279 + 65.25 + 500 + 0 = 2059.25
    // Net: 5000 - 2059.25 = 2940.75
    expect(result.federalTax).toBe(990);
    expect(result.stateTax).toBe(225);
    expect(result.socialSecurity).toBe(279);
    expect(result.netPay).toBe(2940.75);
  });

  // --- Test 7: With post-tax deductions ---
  it('applies post-tax deductions without reducing taxable income', () => {
    const result = calculatePayroll({
      grossPay: 5000,
      payFrequency: 'biweekly',
      federalTaxRate: 22,
      stateTaxRate: 5,
      preTaxDeductions: 0,
      postTaxDeductions: 200,
    });
    // Federal: 5000 * 0.22 = 1100 (not reduced by post-tax)
    // State: 5000 * 0.05 = 250
    // SS: 5000 * 0.062 = 310
    // Medicare: 5000 * 0.0145 = 72.50
    // Total: 1100 + 250 + 310 + 72.50 + 0 + 200 = 1932.50
    // Net: 5000 - 1932.50 = 3067.50
    expect(result.federalTax).toBe(1100);
    expect(result.netPay).toBe(3067.5);
  });

  // --- Test 8: Zero gross pay ---
  it('handles zero gross pay gracefully', () => {
    const result = calculatePayroll({
      grossPay: 0,
      payFrequency: 'biweekly',
      federalTaxRate: 22,
      stateTaxRate: 5,
      preTaxDeductions: 0,
      postTaxDeductions: 0,
    });
    expect(result.netPay).toBe(0);
    expect(result.federalTax).toBe(0);
    expect(result.stateTax).toBe(0);
    expect(result.socialSecurity).toBe(0);
    expect(result.medicare).toBe(0);
    expect(result.effectiveTaxRate).toBe(0);
  });

  // --- Test 9: Very high gross pay (SS cap hit) ---
  it('caps Social Security at the annual wage base', () => {
    // $15,000 biweekly = $390,000/year -> well above $168,600 SS cap
    // SS cap per period: 168600/26 = 6484.62
    // Since grossPay $15000 > cap per period, SS = 6484.62 * 0.062
    const result = calculatePayroll({
      grossPay: 15000,
      payFrequency: 'biweekly',
      federalTaxRate: 35,
      stateTaxRate: 10,
      preTaxDeductions: 0,
      postTaxDeductions: 0,
    });
    // SS should be capped: min(15000, 168600/26) * 0.062
    const expectedSSCap = Math.round(Math.min(15000, 168600 / 26) * 0.062 * 100) / 100;
    expect(result.socialSecurity).toBe(expectedSSCap);
    // SS should be less than uncapped: 15000 * 0.062 = 930
    expect(Number(result.socialSecurity)).toBeLessThan(930);
  });

  // --- Test 10: Zero tax rates (tax-free state like Texas) ---
  it('handles zero state tax rate correctly', () => {
    const result = calculatePayroll({
      grossPay: 5000,
      payFrequency: 'biweekly',
      federalTaxRate: 22,
      stateTaxRate: 0,
      preTaxDeductions: 0,
      postTaxDeductions: 0,
    });
    expect(result.stateTax).toBe(0);
    // Federal: 1100, SS: 310, Medicare: 72.50
    // Net: 5000 - 1482.50 = 3517.50
    expect(result.netPay).toBe(3517.5);
  });

  // --- Test 11: Deduction breakdown pie chart data ---
  it('returns deduction breakdown with all expected categories', () => {
    const result = calculatePayroll({
      grossPay: 5000,
      payFrequency: 'biweekly',
      federalTaxRate: 22,
      stateTaxRate: 5,
      preTaxDeductions: 300,
      postTaxDeductions: 100,
    });
    const breakdown = result.deductionBreakdown as { name: string; value: number }[];
    const names = breakdown.map((b) => b.name);
    expect(names).toContain('Federal Tax');
    expect(names).toContain('State Tax');
    expect(names).toContain('Social Security');
    expect(names).toContain('Medicare');
    expect(names).toContain('Pre-Tax Deductions');
    expect(names).toContain('Post-Tax Deductions');
    expect(names).toContain('Take-Home Pay');
    expect(breakdown.length).toBe(7);
  });

  // --- Test 12: Annual calculations correct ---
  it('calculates annual gross and net correctly for biweekly', () => {
    const result = calculatePayroll({
      grossPay: 3000,
      payFrequency: 'biweekly',
      federalTaxRate: 12,
      stateTaxRate: 3,
      preTaxDeductions: 0,
      postTaxDeductions: 0,
    });
    expect(result.annualGross).toBe(78000); // 3000 * 26
    // Net * 26 = annualNet
    expect(result.annualNet).toBe(Number(result.netPay) * 26);
  });

  // --- Test 13: Effective tax rate calculation ---
  it('calculates effective tax rate as total deductions / gross', () => {
    const result = calculatePayroll({
      grossPay: 4000,
      payFrequency: 'biweekly',
      federalTaxRate: 22,
      stateTaxRate: 5,
      preTaxDeductions: 0,
      postTaxDeductions: 0,
    });
    // Federal: 880, State: 200, SS: 248, Medicare: 58
    // Total: 1386 / 4000 = 34.65%
    const totalDed = Number(result.totalDeductions);
    const expectedRate = Math.round((totalDed / 4000) * 10000) / 100;
    expect(result.effectiveTaxRate).toBe(expectedRate);
  });

  // --- Test 14: Missing inputs default safely ---
  it('handles missing inputs with safe defaults', () => {
    const result = calculatePayroll({});
    expect(result.netPay).toBe(0);
    expect(result.totalDeductions).toBe(0);
    expect(result.annualGross).toBe(0);
    expect(result.effectiveTaxRate).toBe(0);
  });

  // --- Test 15: Summary contains expected labels ---
  it('returns summary with all expected pay stub labels', () => {
    const result = calculatePayroll({
      grossPay: 5000,
      payFrequency: 'biweekly',
      federalTaxRate: 22,
      stateTaxRate: 5,
      preTaxDeductions: 0,
      postTaxDeductions: 0,
    });
    const summary = result.summary as { label: string; value: number }[];
    const labels = summary.map((item) => item.label);
    expect(labels).toContain('Gross Pay');
    expect(labels).toContain('Federal Tax');
    expect(labels).toContain('State Tax');
    expect(labels).toContain('Social Security');
    expect(labels).toContain('Medicare');
    expect(labels).toContain('Net Pay');
  });
});
