import { calculateEstimatedTax } from '@/lib/formulas/finance/estimated-tax';

describe('calculateEstimatedTax', () => {
  // ─── Test 1: Standard freelancer ($80k SE income, single) ───
  it('calculates quarterly payments for standard freelancer', () => {
    const result = calculateEstimatedTax({
      annualIncome: 80000,
      incomeType: 'self-employment',
      filingStatus: 'single',
      taxWithheld: 0,
      deductions: 'standard',
      itemizedAmount: 0,
      selfEmploymentIncome: 80000,
      quartersPaid: 0,
      amountPaid: 0,
    });
    // SE tax: 80000 × 0.9235 × 0.153 = $11,303.72 (rounded)
    // SE deduction: 11303.72 × 0.5 = 5651.86
    // Taxable: 80000 - 15000 - 5651.86 = 59348.14
    // Income tax: progressive brackets on 59348.14
    expect(result.selfEmploymentTax).toBeGreaterThan(11000);
    expect(result.selfEmploymentTax).toBeLessThan(11500);
    expect(result.totalTaxLiability).toBeGreaterThan(18000);
    expect((result.quarterlyPayment as number)).toBeGreaterThan(4500);
  });

  // ─── Test 2: Investor (no SE income) ───
  it('calculates for investor with no self-employment income', () => {
    const result = calculateEstimatedTax({
      annualIncome: 80000,
      incomeType: 'investment',
      filingStatus: 'single',
      taxWithheld: 0,
      deductions: 'standard',
      itemizedAmount: 0,
      selfEmploymentIncome: 0,
      quartersPaid: 0,
      amountPaid: 0,
    });
    expect(result.selfEmploymentTax).toBe(0);
    expect(result.federalIncomeTax).toBeGreaterThan(0);
    // Taxable: 80000 - 15000 = 65000
    // Income tax on 65000 (single brackets)
    expect(result.taxableIncome).toBe(65000);
  });

  // ─── Test 3: Mixed income type ───
  it('calculates SE tax for mixed income type', () => {
    const result = calculateEstimatedTax({
      annualIncome: 100000,
      incomeType: 'mixed',
      filingStatus: 'single',
      taxWithheld: 5000,
      deductions: 'standard',
      itemizedAmount: 0,
      selfEmploymentIncome: 50000,
      quartersPaid: 0,
      amountPaid: 0,
    });
    // SE tax on 50000: 50000 × 0.9235 × 0.153 = $7,064.78 (approx)
    expect(result.selfEmploymentTax).toBeGreaterThan(7000);
    expect(result.selfEmploymentTax).toBeLessThan(7200);
    // Total owed reduced by $5000 withheld
    expect((result.totalOwed as number)).toBeLessThan(result.totalTaxLiability as number);
  });

  // ─── Test 4: Married filing jointly ───
  it('uses married-jointly brackets and deduction', () => {
    const result = calculateEstimatedTax({
      annualIncome: 80000,
      incomeType: 'investment',
      filingStatus: 'married-jointly',
      taxWithheld: 0,
      deductions: 'standard',
      itemizedAmount: 0,
      selfEmploymentIncome: 0,
      quartersPaid: 0,
      amountPaid: 0,
    });
    // Standard deduction for MFJ = $30,000
    // Taxable: 80000 - 30000 = 50000
    expect(result.taxableIncome).toBe(50000);
    // MFJ 10% on 23850, 12% on remaining 26150
    // = 2385 + 3138 = $5,523
    expect(result.federalIncomeTax).toBe(5523);
  });

  // ─── Test 5: Head of household filing status ───
  it('uses head-of-household brackets and deduction', () => {
    const result = calculateEstimatedTax({
      annualIncome: 80000,
      incomeType: 'investment',
      filingStatus: 'head-of-household',
      taxWithheld: 0,
      deductions: 'standard',
      itemizedAmount: 0,
      selfEmploymentIncome: 0,
      quartersPaid: 0,
      amountPaid: 0,
    });
    // Standard deduction for HoH = $22,500
    // Taxable: 80000 - 22500 = 57500
    expect(result.taxableIncome).toBe(57500);
  });

  // ─── Test 6: Standard vs itemized deductions ───
  it('applies itemized deductions when selected', () => {
    const resultStandard = calculateEstimatedTax({
      annualIncome: 80000,
      incomeType: 'investment',
      filingStatus: 'single',
      taxWithheld: 0,
      deductions: 'standard',
      itemizedAmount: 0,
      selfEmploymentIncome: 0,
      quartersPaid: 0,
      amountPaid: 0,
    });
    const resultItemized = calculateEstimatedTax({
      annualIncome: 80000,
      incomeType: 'investment',
      filingStatus: 'single',
      taxWithheld: 0,
      deductions: 'itemized',
      itemizedAmount: 25000,
      selfEmploymentIncome: 0,
      quartersPaid: 0,
      amountPaid: 0,
    });
    // Itemized $25k > standard $15k → lower tax
    expect(resultItemized.federalIncomeTax).toBeLessThan(resultStandard.federalIncomeTax as number);
    expect(resultItemized.taxableIncome).toBe(55000);
    expect(resultStandard.taxableIncome).toBe(65000);
  });

  // ─── Test 7: With W-2 withholding ───
  it('reduces total owed by withholding amount', () => {
    const result = calculateEstimatedTax({
      annualIncome: 80000,
      incomeType: 'investment',
      filingStatus: 'single',
      taxWithheld: 8000,
      deductions: 'standard',
      itemizedAmount: 0,
      selfEmploymentIncome: 0,
      quartersPaid: 0,
      amountPaid: 0,
    });
    // Total owed = totalTaxLiability - 8000
    expect(result.totalOwed).toBe(
      Math.round(((result.totalTaxLiability as number) - 8000) * 100) / 100
    );
  });

  // ─── Test 8: With quarterly payments already made ───
  it('divides remaining owed by remaining quarters', () => {
    const result = calculateEstimatedTax({
      annualIncome: 80000,
      incomeType: 'self-employment',
      filingStatus: 'single',
      taxWithheld: 0,
      deductions: 'standard',
      itemizedAmount: 0,
      selfEmploymentIncome: 80000,
      quartersPaid: 2,
      amountPaid: 10000,
    });
    // remainingQuarters = 4 - 2 = 2
    // quarterlyPayment = max(0, totalOwed / 2)
    const totalOwed = (result.totalTaxLiability as number) - 10000;
    expect(result.quarterlyPayment).toBe(
      Math.round(Math.max(0, totalOwed) / 2 * 100) / 100
    );
  });

  // ─── Test 9: Zero income ───
  it('returns zero tax for zero income', () => {
    const result = calculateEstimatedTax({
      annualIncome: 0,
      incomeType: 'self-employment',
      filingStatus: 'single',
      taxWithheld: 0,
      deductions: 'standard',
      itemizedAmount: 0,
      selfEmploymentIncome: 0,
      quartersPaid: 0,
      amountPaid: 0,
    });
    expect(result.totalTaxLiability).toBe(0);
    expect(result.quarterlyPayment).toBe(0);
    expect(result.selfEmploymentTax).toBe(0);
    expect(result.federalIncomeTax).toBe(0);
    expect(result.effectiveRate).toBe(0);
  });

  // ─── Test 10: High income ($250k SE) ───
  it('calculates for high-income freelancer', () => {
    const result = calculateEstimatedTax({
      annualIncome: 250000,
      incomeType: 'self-employment',
      filingStatus: 'single',
      taxWithheld: 0,
      deductions: 'standard',
      itemizedAmount: 0,
      selfEmploymentIncome: 250000,
      quartersPaid: 0,
      amountPaid: 0,
    });
    // SE tax on 250k: 250000 × 0.9235 × 0.153 = ~$35,319
    expect(result.selfEmploymentTax).toBeGreaterThan(35000);
    expect(result.totalTaxLiability).toBeGreaterThan(75000);
    expect(result.effectiveRate).toBeGreaterThan(30);
  });

  // ─── Test 11: Low income ($25k) ───
  it('calculates for low-income freelancer', () => {
    const result = calculateEstimatedTax({
      annualIncome: 25000,
      incomeType: 'self-employment',
      filingStatus: 'single',
      taxWithheld: 0,
      deductions: 'standard',
      itemizedAmount: 0,
      selfEmploymentIncome: 25000,
      quartersPaid: 0,
      amountPaid: 0,
    });
    // SE tax: 25000 × 0.9235 × 0.153 = ~$3,532
    expect(result.selfEmploymentTax).toBeGreaterThan(3500);
    expect(result.selfEmploymentTax).toBeLessThan(3600);
    // Taxable income after standard deduction ($15k) and SE deduction (~$1,766)
    // = 25000 - 15000 - 1766 = ~$8,234 → 10% bracket
    expect(result.federalIncomeTax).toBeLessThan(1000);
  });

  // ─── Test 12: Effective rate calculation ───
  it('calculates effective rate correctly', () => {
    const result = calculateEstimatedTax({
      annualIncome: 100000,
      incomeType: 'investment',
      filingStatus: 'single',
      taxWithheld: 0,
      deductions: 'standard',
      itemizedAmount: 0,
      selfEmploymentIncome: 0,
      quartersPaid: 0,
      amountPaid: 0,
    });
    // effectiveRate = (totalTaxLiability / annualIncome) × 100
    const expected = Math.round(((result.totalTaxLiability as number) / 100000) * 10000) / 100;
    expect(result.effectiveRate).toBe(expected);
  });

  // ─── Test 13: Penalty risk levels ───
  it('returns "Low" penalty risk when owed <= $1,000', () => {
    const result = calculateEstimatedTax({
      annualIncome: 20000,
      incomeType: 'investment',
      filingStatus: 'single',
      taxWithheld: 0,
      deductions: 'standard',
      itemizedAmount: 0,
      selfEmploymentIncome: 0,
      quartersPaid: 0,
      amountPaid: 0,
    });
    // Taxable: 20000 - 15000 = 5000 → 10% = $500 owed
    expect(result.totalOwed).toBe(500);
    expect(result.penaltyRisk).toBe('Low');
  });

  it('returns "High" penalty risk for large amounts owed', () => {
    const result = calculateEstimatedTax({
      annualIncome: 150000,
      incomeType: 'self-employment',
      filingStatus: 'single',
      taxWithheld: 0,
      deductions: 'standard',
      itemizedAmount: 0,
      selfEmploymentIncome: 150000,
      quartersPaid: 0,
      amountPaid: 0,
    });
    expect(result.penaltyRisk).toBe('High');
    expect((result.totalOwed as number)).toBeGreaterThan(5000);
  });

  // ─── Test 14: Quarterly schedule structure ───
  it('returns quarterly schedule with 4 entries', () => {
    const result = calculateEstimatedTax({
      annualIncome: 80000,
      incomeType: 'self-employment',
      filingStatus: 'single',
      taxWithheld: 0,
      deductions: 'standard',
      itemizedAmount: 0,
      selfEmploymentIncome: 80000,
      quartersPaid: 0,
      amountPaid: 0,
    });
    const schedule = result.quarterlySchedule as { label: string; value: string }[];
    expect(schedule).toHaveLength(4);
    expect(schedule[0].label).toContain('Q1');
    expect(schedule[0].value).toContain('April 15');
    expect(schedule[3].label).toContain('Q4');
    expect(schedule[3].value).toContain('January 15');
  });

  // ─── Test 15: Refund scenario (overpaid) ───
  it('returns zero quarterly payment when overpaid', () => {
    const result = calculateEstimatedTax({
      annualIncome: 50000,
      incomeType: 'investment',
      filingStatus: 'single',
      taxWithheld: 10000,
      deductions: 'standard',
      itemizedAmount: 0,
      selfEmploymentIncome: 0,
      quartersPaid: 0,
      amountPaid: 10000,
    });
    // Taxable: 50000 - 15000 = 35000
    // Income tax ~ $4,158 (well under $20,000 withheld + paid)
    expect(result.quarterlyPayment).toBe(0);
    expect((result.totalOwed as number)).toBeLessThan(0);
  });

  // ─── Test 16: SE tax accuracy (direct calculation) ───
  it('calculates SE tax with correct formula', () => {
    const result = calculateEstimatedTax({
      annualIncome: 100000,
      incomeType: 'self-employment',
      filingStatus: 'single',
      taxWithheld: 0,
      deductions: 'standard',
      itemizedAmount: 0,
      selfEmploymentIncome: 100000,
      quartersPaid: 0,
      amountPaid: 0,
    });
    // SE tax: round2(100000 × 0.9235) = 92350, round2(92350 × 0.153) = 14129.55
    expect(result.selfEmploymentTax).toBe(14129.55);
    expect(result.seTaxDeduction).toBe(7064.78);
  });

  // ─── Test 17: Safe harbor calculation ───
  it('calculates safe harbor at 90% of current year', () => {
    const result = calculateEstimatedTax({
      annualIncome: 80000,
      incomeType: 'self-employment',
      filingStatus: 'single',
      taxWithheld: 0,
      deductions: 'standard',
      itemizedAmount: 0,
      selfEmploymentIncome: 80000,
      quartersPaid: 0,
      amountPaid: 0,
    });
    // safeHarbor90 = totalTaxLiability × 0.90 / 4
    const expected = Math.round(((result.totalTaxLiability as number) * 0.90 / 4) * 100) / 100;
    expect(result.safeHarbor90).toBe(expected);
  });

  // ─── Test 18: Tax breakdown structure ───
  it('returns correct tax breakdown structure', () => {
    const result = calculateEstimatedTax({
      annualIncome: 80000,
      incomeType: 'self-employment',
      filingStatus: 'single',
      taxWithheld: 2000,
      deductions: 'standard',
      itemizedAmount: 0,
      selfEmploymentIncome: 80000,
      quartersPaid: 0,
      amountPaid: 1000,
    });
    const breakdown = result.taxBreakdown as { label: string; value: number }[];
    expect(breakdown).toHaveLength(6);
    expect(breakdown[0].label).toBe('Federal Income Tax');
    expect(breakdown[1].label).toBe('Self-Employment Tax');
    expect(breakdown[2].label).toBe('Total Tax Liability');
    expect(breakdown[3].label).toBe('Tax Withheld (W-2)');
    expect(breakdown[3].value).toBe(2000);
    expect(breakdown[4].label).toBe('Estimated Tax Paid');
    expect(breakdown[4].value).toBe(1000);
    expect(breakdown[5].label).toBe('Remaining Owed');
  });

  // ─── Test 19: Output structure validation ───
  it('returns all expected output fields', () => {
    const result = calculateEstimatedTax({
      annualIncome: 80000,
      incomeType: 'self-employment',
      filingStatus: 'single',
      taxWithheld: 0,
      deductions: 'standard',
      itemizedAmount: 0,
      selfEmploymentIncome: 80000,
      quartersPaid: 0,
      amountPaid: 0,
    });
    expect(result).toHaveProperty('totalTaxLiability');
    expect(result).toHaveProperty('quarterlyPayment');
    expect(result).toHaveProperty('totalOwed');
    expect(result).toHaveProperty('effectiveRate');
    expect(result).toHaveProperty('selfEmploymentTax');
    expect(result).toHaveProperty('federalIncomeTax');
    expect(result).toHaveProperty('safeHarbor90');
    expect(result).toHaveProperty('penaltyRisk');
    expect(result).toHaveProperty('quarterlySchedule');
    expect(result).toHaveProperty('taxBreakdown');
    expect(result).toHaveProperty('taxableIncome');
    expect(result).toHaveProperty('seTaxDeduction');
    expect(Array.isArray(result.quarterlySchedule)).toBe(true);
    expect(Array.isArray(result.taxBreakdown)).toBe(true);
  });

  // ─── Test 20: Married separately filing status ───
  it('uses married-separately brackets and deduction', () => {
    const result = calculateEstimatedTax({
      annualIncome: 80000,
      incomeType: 'investment',
      filingStatus: 'married-separately',
      taxWithheld: 0,
      deductions: 'standard',
      itemizedAmount: 0,
      selfEmploymentIncome: 0,
      quartersPaid: 0,
      amountPaid: 0,
    });
    // Standard deduction for MFS = $15,000
    // Taxable: 80000 - 15000 = 65000
    expect(result.taxableIncome).toBe(65000);
    // Same brackets as single for MFS
  });

  // ─── Test 21: All 3 quarters paid ───
  it('calculates for 3 quarters already paid', () => {
    const result = calculateEstimatedTax({
      annualIncome: 80000,
      incomeType: 'self-employment',
      filingStatus: 'single',
      taxWithheld: 0,
      deductions: 'standard',
      itemizedAmount: 0,
      selfEmploymentIncome: 80000,
      quartersPaid: 3,
      amountPaid: 15000,
    });
    // remainingQuarters = 1
    // quarterlyPayment = totalOwed / 1
    const totalOwed = (result.totalTaxLiability as number) - 15000;
    expect(result.quarterlyPayment).toBe(
      Math.round(Math.max(0, totalOwed) * 100) / 100
    );
  });

  // ─── Test 22: Moderate penalty risk ───
  it('returns "Moderate" penalty risk for $1,001-$5,000 owed', () => {
    // We need totalOwed between $1,001 and $5,000
    // Taxable: 35000 - 15000 = 20000 → tax ~$2,207
    const result = calculateEstimatedTax({
      annualIncome: 35000,
      incomeType: 'investment',
      filingStatus: 'single',
      taxWithheld: 0,
      deductions: 'standard',
      itemizedAmount: 0,
      selfEmploymentIncome: 0,
      quartersPaid: 0,
      amountPaid: 0,
    });
    // 10% on 11925 = 1192.50, 12% on 8075 = 969 → total = $2,161.50
    expect(result.penaltyRisk).toBe('Moderate');
  });
});
