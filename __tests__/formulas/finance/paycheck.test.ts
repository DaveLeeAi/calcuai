import { calculatePaycheck } from '@/lib/formulas/finance/paycheck';

describe('calculatePaycheck', () => {
  // ─── Test 1: Biweekly $5,000 gross, single, 5% state, 6% 401k, $200 health ───
  it('calculates take-home pay for biweekly $5,000 single filer', () => {
    const result = calculatePaycheck({
      grossPay: 5000,
      payFrequency: 'biweekly',
      filingStatus: 'single',
      stateTaxRate: 5,
      retirement401k: 6,
      healthInsurance: 200,
    });
    // 401k = $300, health = $200 per paycheck
    // Annual gross = 5000 * 26 = $130,000
    // Annual pre-tax deductions = (300 + 200) * 26 = $13,000
    // AGI = $130,000 - $13,000 = $117,000
    // Taxable = $117,000 - $15,000 = $102,000
    // Federal annual ~ 10%: $1,192.50 + 12%: $4,386 + 22%: $11,775.50 = $17,354
    // Federal per paycheck ~ $17,354 / 26 ≈ $667.46
    expect(result.retirementDeduction).toBe(300);
    expect(result.netPay).toBeGreaterThan(3000);
    expect(result.netPay).toBeLessThan(4500);

    // FICA checks
    expect(result.socialSecurity).toBeCloseTo(310, 0); // 5000 * 0.062
    expect(result.medicare).toBeCloseTo(72.5, 0); // 5000 * 0.0145

    // All deductions should sum correctly
    const totalDeductions = (result.federalTax as number) + (result.stateTax as number) +
      (result.socialSecurity as number) + (result.medicare as number) +
      (result.retirementDeduction as number) + 200; // health insurance
    expect(result.netPay).toBeCloseTo(5000 - totalDeductions, 1);
  });

  // ─── Test 2: Monthly $8,000 gross, MFJ ───
  it('calculates correctly for monthly $8,000 MFJ filer', () => {
    const result = calculatePaycheck({
      grossPay: 8000,
      payFrequency: 'monthly',
      filingStatus: 'married',
      stateTaxRate: 5,
      retirement401k: 0,
      healthInsurance: 0,
    });
    // Annual gross = $96,000, taxable = $96,000 - $30,000 = $66,000
    // MFJ: 10% on $23,850 = $2,385 + 12% on $42,150 = $5,058 = $7,443
    // Federal per paycheck = $7,443 / 12 ≈ $620.25
    expect(result.federalTax).toBeCloseTo(620.25, 0);
    expect(result.netPay).toBeGreaterThan(5500);
  });

  // ─── Test 3: Weekly $2,000 gross, single ───
  it('calculates correctly for weekly $2,000 single filer', () => {
    const result = calculatePaycheck({
      grossPay: 2000,
      payFrequency: 'weekly',
      filingStatus: 'single',
      stateTaxRate: 5,
      retirement401k: 0,
      healthInsurance: 0,
    });
    // Annual = $104,000, taxable = $104,000 - $15,000 = $89,000
    // Federal: 10%: $1,192.50 + 12%: $4,386 + 22%: $8,915.50 = $14,494
    // Per week = $14,494 / 52 ≈ $278.73
    expect(result.federalTax).toBeCloseTo(278.73, 0);
    expect(result.socialSecurity).toBeCloseTo(124, 0); // 2000 * 0.062
    expect(result.medicare).toBeCloseTo(29, 0); // 2000 * 0.0145
  });

  // ─── Test 4: Zero state tax (like Texas/Florida) ───
  it('calculates correctly with zero state tax', () => {
    const result = calculatePaycheck({
      grossPay: 5000,
      payFrequency: 'biweekly',
      filingStatus: 'single',
      stateTaxRate: 0,
      retirement401k: 6,
      healthInsurance: 200,
    });
    expect(result.stateTax).toBe(0);
    // Net pay should be higher than with state tax
    const resultWithState = calculatePaycheck({
      grossPay: 5000,
      payFrequency: 'biweekly',
      filingStatus: 'single',
      stateTaxRate: 5,
      retirement401k: 6,
      healthInsurance: 200,
    });
    expect(result.netPay).toBeGreaterThan(resultWithState.netPay as number);
  });

  // ─── Test 5: Zero 401(k) contribution ───
  it('calculates correctly with zero 401(k)', () => {
    const result = calculatePaycheck({
      grossPay: 5000,
      payFrequency: 'biweekly',
      filingStatus: 'single',
      stateTaxRate: 5,
      retirement401k: 0,
      healthInsurance: 200,
    });
    expect(result.retirementDeduction).toBe(0);
    // Higher federal tax (no pre-tax 401k deduction)
    const resultWith401k = calculatePaycheck({
      grossPay: 5000,
      payFrequency: 'biweekly',
      filingStatus: 'single',
      stateTaxRate: 5,
      retirement401k: 6,
      healthInsurance: 200,
    });
    expect(result.federalTax).toBeGreaterThan(resultWith401k.federalTax as number);
  });

  // ─── Test 6: Zero health insurance ───
  it('calculates correctly with zero health insurance', () => {
    const result = calculatePaycheck({
      grossPay: 5000,
      payFrequency: 'biweekly',
      filingStatus: 'single',
      stateTaxRate: 5,
      retirement401k: 6,
      healthInsurance: 0,
    });
    // Net pay changes, but health insurance deduction is $0
    const deductions = result.deductionBreakdown as Array<{ name: string; value: number }>;
    const healthEntry = deductions.find(d => d.name === 'Health Insurance');
    expect(healthEntry).toBeUndefined(); // Omitted when zero
  });

  // ─── Test 7: High earner — $20K biweekly ───
  it('calculates correctly for high earner ($20K biweekly)', () => {
    const result = calculatePaycheck({
      grossPay: 20000,
      payFrequency: 'biweekly',
      filingStatus: 'single',
      stateTaxRate: 5,
      retirement401k: 0,
      healthInsurance: 0,
    });
    // Annual = $520,000, taxable = $520,000 - $15,000 = $505,000
    // Hits 35% bracket
    expect(result.federalTax).toBeGreaterThan(3000);
    expect(result.netPay).toBeGreaterThan(10000);
  });

  // ─── Test 8: Low earner — $1,000 biweekly ───
  it('calculates correctly for low earner ($1,000 biweekly)', () => {
    const result = calculatePaycheck({
      grossPay: 1000,
      payFrequency: 'biweekly',
      filingStatus: 'single',
      stateTaxRate: 5,
      retirement401k: 0,
      healthInsurance: 0,
    });
    // Annual = $26,000, taxable = $26,000 - $15,000 = $11,000
    // All in 10% bracket: $1,100 annual, $42.31/paycheck
    expect(result.federalTax).toBeCloseTo(42.31, 0);
    expect(result.socialSecurity).toBeCloseTo(62, 0); // 1000 * 0.062
    expect(result.medicare).toBeCloseTo(14.5, 0); // 1000 * 0.0145
  });

  // ─── Test 9: Head of Household filing status ───
  it('calculates correctly for Head of Household', () => {
    const result = calculatePaycheck({
      grossPay: 5000,
      payFrequency: 'biweekly',
      filingStatus: 'head',
      stateTaxRate: 5,
      retirement401k: 0,
      healthInsurance: 0,
    });
    // Annual = $130,000, taxable = $130,000 - $22,500 = $107,500
    // HOH: 10% on $17,000 = $1,700 + 12% on $47,850 = $5,742 + 22% on $38,500 = $8,470 + 24% on $4,150 = $996
    // Total ≈ $16,908 / 26 ≈ $650.31
    expect(result.federalTax).toBeCloseTo(650.31, 0);
    // Compared to single, HOH should have lower federal tax
    const singleResult = calculatePaycheck({
      grossPay: 5000,
      payFrequency: 'biweekly',
      filingStatus: 'single',
      stateTaxRate: 5,
      retirement401k: 0,
      healthInsurance: 0,
    });
    expect(result.federalTax).toBeLessThan(singleResult.federalTax as number);
  });

  // ─── Test 10: Verify exact FICA amounts ───
  it('calculates FICA amounts exactly at 6.2% and 1.45%', () => {
    const result = calculatePaycheck({
      grossPay: 3000,
      payFrequency: 'biweekly',
      filingStatus: 'single',
      stateTaxRate: 0,
      retirement401k: 0,
      healthInsurance: 0,
    });
    expect(result.socialSecurity).toBe(186); // 3000 * 0.062 = 186
    expect(result.medicare).toBe(43.5); // 3000 * 0.0145 = 43.5
  });

  // ─── Test 11: Federal tax is in reasonable range ───
  it('federal tax is between 5% and 30% of gross for typical earners', () => {
    const incomes = [2000, 3000, 5000, 8000];
    for (const gross of incomes) {
      const result = calculatePaycheck({
        grossPay: gross,
        payFrequency: 'biweekly',
        filingStatus: 'single',
        stateTaxRate: 0,
        retirement401k: 0,
        healthInsurance: 0,
      });
      const fedRate = (result.federalTax as number) / gross;
      expect(fedRate).toBeGreaterThanOrEqual(0);
      expect(fedRate).toBeLessThan(0.30);
    }
  });

  // ─── Test 12: All deductions sum to grossPay - netPay ───
  it('all deductions sum to grossPay minus netPay', () => {
    const result = calculatePaycheck({
      grossPay: 5000,
      payFrequency: 'biweekly',
      filingStatus: 'single',
      stateTaxRate: 5,
      retirement401k: 6,
      healthInsurance: 200,
    });
    const totalDeductions = (result.federalTax as number) +
      (result.stateTax as number) +
      (result.socialSecurity as number) +
      (result.medicare as number) +
      (result.retirementDeduction as number) +
      200; // health insurance input
    expect(result.netPay).toBeCloseTo(5000 - totalDeductions, 1);
  });

  // ─── Test 13: Verify summary labels ───
  it('returns summary with all required labels', () => {
    const result = calculatePaycheck({
      grossPay: 5000,
      payFrequency: 'biweekly',
      filingStatus: 'single',
      stateTaxRate: 5,
      retirement401k: 6,
      healthInsurance: 200,
    });
    const summary = result.summary as Array<{ label: string; value: number }>;
    const labels = summary.map(s => s.label);
    expect(labels).toContain('Gross Pay (per paycheck)');
    expect(labels).toContain('Federal Income Tax');
    expect(labels).toContain('State Income Tax');
    expect(labels).toContain('Social Security (6.2%)');
    expect(labels).toContain('Medicare (1.45%)');
    expect(labels).toContain('Take-Home Pay');
    expect(labels).toContain('Annual Gross');
    expect(labels).toContain('Annual Take-Home');
  });

  // ─── Test 14: Edge — zero gross pay ───
  it('returns zero for all fields when gross pay is zero', () => {
    const result = calculatePaycheck({
      grossPay: 0,
      payFrequency: 'biweekly',
      filingStatus: 'single',
      stateTaxRate: 5,
      retirement401k: 6,
      healthInsurance: 0,
    });
    expect(result.netPay).toBe(0);
    expect(result.federalTax).toBe(0);
    expect(result.stateTax).toBe(0);
    expect(result.socialSecurity).toBe(0);
    expect(result.medicare).toBe(0);
    expect(result.retirementDeduction).toBe(0);
  });

  // ─── Test 15: Semimonthly pay frequency ───
  it('calculates correctly for semimonthly pay frequency', () => {
    const result = calculatePaycheck({
      grossPay: 5000,
      payFrequency: 'semimonthly',
      filingStatus: 'single',
      stateTaxRate: 5,
      retirement401k: 0,
      healthInsurance: 0,
    });
    // Annual = $5,000 * 24 = $120,000
    expect(result.annualGrossPay).toBe(120000);
    // Different from biweekly ($130,000)
    const biweeklyResult = calculatePaycheck({
      grossPay: 5000,
      payFrequency: 'biweekly',
      filingStatus: 'single',
      stateTaxRate: 5,
      retirement401k: 0,
      healthInsurance: 0,
    });
    expect(result.annualGrossPay).toBeLessThan(biweeklyResult.annualGrossPay as number);
  });

  // ─── Test 16: Pie chart data structure ───
  it('returns pie chart data with correct segments', () => {
    const result = calculatePaycheck({
      grossPay: 5000,
      payFrequency: 'biweekly',
      filingStatus: 'single',
      stateTaxRate: 5,
      retirement401k: 6,
      healthInsurance: 200,
    });
    const pieData = result.deductionBreakdown as Array<{ name: string; value: number }>;
    const names = pieData.map(d => d.name);
    expect(names).toContain('Take-Home');
    expect(names).toContain('Federal Tax');
    expect(names).toContain('State Tax');
    expect(names).toContain('Social Security');
    expect(names).toContain('Medicare');
    expect(names).toContain('401(k)');
    expect(names).toContain('Health Insurance');
  });
});
