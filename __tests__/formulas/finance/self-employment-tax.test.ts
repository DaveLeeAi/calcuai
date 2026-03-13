import { calculateSelfEmploymentTax } from '@/lib/formulas/finance/self-employment-tax';

describe('calculateSelfEmploymentTax', () => {
  // ─── Test 1: Standard freelancer ($75K net earnings, single) ───
  it('calculates SE tax for a standard $75K freelancer', () => {
    const result = calculateSelfEmploymentTax({
      netEarnings: 75000,
      filingStatus: 'single',
      otherIncome: 0,
      businessExpenses: 0,
      quarterlyPayments: 0,
    });
    // Taxable SE = 75,000 × 0.9235 = 69,262.50
    // SS = 69,262.50 × 0.124 = 8,588.55
    // Medicare = 69,262.50 × 0.029 = 2,008.61
    // No additional Medicare (75K < 200K)
    // Total SE = 10,597.16
    expect(result.socialSecurityTax).toBeCloseTo(8588.55, 0);
    expect(result.medicareTax).toBeCloseTo(2008.61, 0);
    expect(result.additionalMedicareTax).toBe(0);
    expect(result.selfEmploymentTax).toBeCloseTo(10597.16, 0);
  });

  // ─── Test 2: High earner ($200K, triggers additional Medicare) ───
  it('applies additional Medicare tax for high earner at $200K', () => {
    const result = calculateSelfEmploymentTax({
      netEarnings: 200000,
      filingStatus: 'single',
      otherIncome: 0,
      businessExpenses: 0,
      quarterlyPayments: 0,
    });
    // Taxable SE = 200,000 × 0.9235 = 184,700
    // SS = min(184,700, 168,600) × 0.124 = 168,600 × 0.124 = 20,906.40
    // Medicare = 184,700 × 0.029 = 5,356.30
    // Additional Medicare = max(0, 200,000 - 200,000) × 0.009 = 0 (exactly at threshold)
    expect(result.socialSecurityTax).toBeCloseTo(20906.40, 0);
    expect(result.medicareTax).toBeCloseTo(5356.30, 0);
    expect(result.additionalMedicareTax).toBe(0);
  });

  // ─── Test 3: Very high earner ($300K, above SS wage base + additional Medicare) ───
  it('caps SS at wage base and applies additional Medicare for $300K earner', () => {
    const result = calculateSelfEmploymentTax({
      netEarnings: 300000,
      filingStatus: 'single',
      otherIncome: 0,
      businessExpenses: 0,
      quarterlyPayments: 0,
    });
    // Taxable SE = 300,000 × 0.9235 = 277,050
    // SS = min(277,050, 168,600) × 0.124 = 168,600 × 0.124 = 20,906.40
    // Medicare = 277,050 × 0.029 = 8,034.45
    // Additional Medicare = max(0, 300,000 - 200,000) × 0.009 = 100,000 × 0.009 = 900
    expect(result.socialSecurityTax).toBeCloseTo(20906.40, 0);
    expect(result.medicareTax).toBeCloseTo(8034.45, 0);
    expect(result.additionalMedicareTax).toBeCloseTo(900, 0);
  });

  // ─── Test 4: Low earner ($20K) ───
  it('calculates correctly for low earner at $20K', () => {
    const result = calculateSelfEmploymentTax({
      netEarnings: 20000,
      filingStatus: 'single',
      otherIncome: 0,
      businessExpenses: 0,
      quarterlyPayments: 0,
    });
    // Taxable SE = 20,000 × 0.9235 = 18,470
    // SS = 18,470 × 0.124 = 2,290.28
    // Medicare = 18,470 × 0.029 = 535.63
    // No additional Medicare
    expect(result.socialSecurityTax).toBeCloseTo(2290.28, 0);
    expect(result.medicareTax).toBeCloseTo(535.63, 0);
    expect(result.selfEmploymentTax).toBeCloseTo(2825.91, 0);
  });

  // ─── Test 5: Zero earnings ───
  it('returns zero for all values when earnings are zero', () => {
    const result = calculateSelfEmploymentTax({
      netEarnings: 0,
      filingStatus: 'single',
      otherIncome: 0,
      businessExpenses: 0,
      quarterlyPayments: 0,
    });
    expect(result.selfEmploymentTax).toBe(0);
    expect(result.socialSecurityTax).toBe(0);
    expect(result.medicareTax).toBe(0);
    expect(result.additionalMedicareTax).toBe(0);
    expect(result.estimatedIncomeTax).toBe(0);
    expect(result.totalTaxLiability).toBe(0);
    expect(result.effectiveSERate).toBe(0);
    expect(result.effectiveTotalRate).toBe(0);
  });

  // ─── Test 6: W-2 income filling SS cap ───
  it('reduces SS tax when W-2 income fills the wage base', () => {
    const result = calculateSelfEmploymentTax({
      netEarnings: 75000,
      filingStatus: 'single',
      otherIncome: 150000,
      businessExpenses: 0,
      quarterlyPayments: 0,
    });
    // Remaining SS wage base = 168,600 - 150,000 = 18,600
    // Taxable SE = 75,000 × 0.9235 = 69,262.50
    // SS = min(69,262.50, 18,600) × 0.124 = 18,600 × 0.124 = 2,306.40
    // Medicare = 69,262.50 × 0.029 = 2,008.61
    // Additional Medicare = max(0, 75,000 + 150,000 - 200,000) × 0.009 = 25,000 × 0.009 = 225
    expect(result.socialSecurityTax).toBeCloseTo(2306.40, 0);
    expect(result.medicareTax).toBeCloseTo(2008.61, 0);
    expect(result.additionalMedicareTax).toBeCloseTo(225, 0);
  });

  // ─── Test 7: W-2 income exceeds SS wage base → SS portion = 0 ───
  it('returns zero SS tax when W-2 income exceeds wage base', () => {
    const result = calculateSelfEmploymentTax({
      netEarnings: 50000,
      filingStatus: 'single',
      otherIncome: 200000,
      businessExpenses: 0,
      quarterlyPayments: 0,
    });
    // Remaining SS wage base = max(0, 168,600 - 200,000) = 0
    // SS = 0
    expect(result.socialSecurityTax).toBe(0);
    // Medicare still applies
    const taxableSE = 50000 * 0.9235;
    expect(result.medicareTax).toBeCloseTo(taxableSE * 0.029, 0);
  });

  // ─── Test 8: With business expenses ───
  it('reduces taxable income by business expenses', () => {
    const result = calculateSelfEmploymentTax({
      netEarnings: 100000,
      filingStatus: 'single',
      otherIncome: 0,
      businessExpenses: 25000,
      quarterlyPayments: 0,
    });
    // Net SE = 100,000 - 25,000 = 75,000
    // Same as Test 1
    expect(result.socialSecurityTax).toBeCloseTo(8588.55, 0);
    expect(result.medicareTax).toBeCloseTo(2008.61, 0);
    expect(result.selfEmploymentTax).toBeCloseTo(10597.16, 0);
  });

  // ─── Test 9: With quarterly payments already made ───
  it('calculates remaining due after quarterly payments', () => {
    const result = calculateSelfEmploymentTax({
      netEarnings: 75000,
      filingStatus: 'single',
      otherIncome: 0,
      businessExpenses: 0,
      quarterlyPayments: 5000,
    });
    const totalLiability = result.totalTaxLiability as number;
    expect(result.remainingDue).toBeCloseTo(totalLiability - 5000, 0);
  });

  // ─── Test 10: Married filing jointly (higher additional Medicare threshold) ───
  it('uses $250K threshold for married filing jointly', () => {
    const result = calculateSelfEmploymentTax({
      netEarnings: 220000,
      filingStatus: 'married-jointly',
      otherIncome: 0,
      businessExpenses: 0,
      quarterlyPayments: 0,
    });
    // Total income = 220,000 < 250,000 threshold
    // No additional Medicare
    expect(result.additionalMedicareTax).toBe(0);
  });

  // ─── Test 11: Married filing separately ($125K threshold) ───
  it('uses $125K threshold for married filing separately', () => {
    const result = calculateSelfEmploymentTax({
      netEarnings: 150000,
      filingStatus: 'married-separately',
      otherIncome: 0,
      businessExpenses: 0,
      quarterlyPayments: 0,
    });
    // Total income = 150,000 > 125,000 threshold
    // Additional Medicare = (150,000 - 125,000) × 0.009 = 225
    expect(result.additionalMedicareTax).toBeCloseTo(225, 0);
  });

  // ─── Test 12: Head of household ($200K threshold) ───
  it('uses $200K threshold for head of household', () => {
    const result = calculateSelfEmploymentTax({
      netEarnings: 210000,
      filingStatus: 'head-of-household',
      otherIncome: 0,
      businessExpenses: 0,
      quarterlyPayments: 0,
    });
    // Total income = 210,000 > 200,000
    // Additional Medicare = (210,000 - 200,000) × 0.009 = 90
    expect(result.additionalMedicareTax).toBeCloseTo(90, 0);
  });

  // ─── Test 13: SE tax deduction is exactly half ───
  it('calculates SE tax deduction as exactly 50% of SE tax', () => {
    const result = calculateSelfEmploymentTax({
      netEarnings: 75000,
      filingStatus: 'single',
      otherIncome: 0,
      businessExpenses: 0,
      quarterlyPayments: 0,
    });
    const seTax = result.selfEmploymentTax as number;
    const deduction = result.seTaxDeduction as number;
    expect(deduction).toBeCloseTo(seTax / 2, 2);
  });

  // ─── Test 14: Quarterly estimate is total / 4 ───
  it('calculates quarterly estimate as total liability divided by 4', () => {
    const result = calculateSelfEmploymentTax({
      netEarnings: 100000,
      filingStatus: 'single',
      otherIncome: 0,
      businessExpenses: 0,
      quarterlyPayments: 0,
    });
    const total = result.totalTaxLiability as number;
    expect(result.quarterlyEstimate).toBeCloseTo(total / 4, 1);
  });

  // ─── Test 15: Effective SE rate ───
  it('calculates effective SE rate as SE tax / net earnings × 100', () => {
    const result = calculateSelfEmploymentTax({
      netEarnings: 75000,
      filingStatus: 'single',
      otherIncome: 0,
      businessExpenses: 0,
      quarterlyPayments: 0,
    });
    const seTax = result.selfEmploymentTax as number;
    const expectedRate = (seTax / 75000) * 100;
    expect(result.effectiveSERate).toBeCloseTo(expectedRate, 1);
  });

  // ─── Test 16: 92.35% adjustment is applied correctly ───
  it('applies the 92.35% adjustment to net SE income', () => {
    const result = calculateSelfEmploymentTax({
      netEarnings: 100000,
      filingStatus: 'single',
      otherIncome: 0,
      businessExpenses: 0,
      quarterlyPayments: 0,
    });
    // Taxable SE = 100,000 × 0.9235 = 92,350
    // SS = 92,350 × 0.124 = 11,451.40
    // Medicare = 92,350 × 0.029 = 2,678.15
    expect(result.socialSecurityTax).toBeCloseTo(11451.40, 0);
    expect(result.medicareTax).toBeCloseTo(2678.15, 0);
  });

  // ─── Test 17: Taxable income after SE deduction and standard deduction ───
  it('reduces taxable income by SE deduction and standard deduction', () => {
    const result = calculateSelfEmploymentTax({
      netEarnings: 75000,
      filingStatus: 'single',
      otherIncome: 0,
      businessExpenses: 0,
      quarterlyPayments: 0,
    });
    const seTax = result.selfEmploymentTax as number;
    const seDeduction = seTax / 2;
    // AGI = 75,000 - SE deduction
    // Taxable = AGI - 15,000 (standard deduction)
    const expectedTaxable = Math.max(0, 75000 - seDeduction - 15000);
    expect(result.taxableIncome).toBeCloseTo(expectedTaxable, 0);
  });

  // ─── Test 18: Output structure has all required keys ───
  it('returns all required output keys', () => {
    const result = calculateSelfEmploymentTax({
      netEarnings: 75000,
      filingStatus: 'single',
      otherIncome: 0,
      businessExpenses: 0,
      quarterlyPayments: 0,
    });
    expect(result).toHaveProperty('selfEmploymentTax');
    expect(result).toHaveProperty('socialSecurityTax');
    expect(result).toHaveProperty('medicareTax');
    expect(result).toHaveProperty('additionalMedicareTax');
    expect(result).toHaveProperty('seTaxDeduction');
    expect(result).toHaveProperty('taxableIncome');
    expect(result).toHaveProperty('estimatedIncomeTax');
    expect(result).toHaveProperty('totalTaxLiability');
    expect(result).toHaveProperty('effectiveSERate');
    expect(result).toHaveProperty('effectiveTotalRate');
    expect(result).toHaveProperty('quarterlyEstimate');
    expect(result).toHaveProperty('remainingDue');
    expect(result).toHaveProperty('taxBreakdown');
    expect(result).toHaveProperty('summary');
  });

  // ─── Test 19: Tax breakdown structure ───
  it('returns tax breakdown with correct segment names', () => {
    const result = calculateSelfEmploymentTax({
      netEarnings: 300000,
      filingStatus: 'single',
      otherIncome: 0,
      businessExpenses: 0,
      quarterlyPayments: 0,
    });
    const breakdown = result.taxBreakdown as Array<{ name: string; value: number }>;
    const names = breakdown.map(b => b.name);
    expect(names).toContain('Social Security Tax');
    expect(names).toContain('Medicare Tax');
    expect(names).toContain('Additional Medicare Tax');
    expect(names).toContain('Income Tax');
  });

  // ─── Test 20: Summary value group has all expected labels ───
  it('returns summary with all expected labels', () => {
    const result = calculateSelfEmploymentTax({
      netEarnings: 75000,
      filingStatus: 'single',
      otherIncome: 0,
      businessExpenses: 0,
      quarterlyPayments: 0,
    });
    const summary = result.summary as Array<{ label: string; value: number }>;
    const labels = summary.map(s => s.label);
    expect(labels).toContain('Net SE Income');
    expect(labels).toContain('Taxable SE Income (92.35%)');
    expect(labels).toContain('Social Security Tax (12.4%)');
    expect(labels).toContain('Medicare Tax (2.9%)');
    expect(labels).toContain('Total SE Tax');
    expect(labels).toContain('SE Tax Deduction (50%)');
    expect(labels).toContain('Quarterly Estimate');
    expect(labels).toContain('Remaining Due');
  });

  // ─── Test 21: Negative earnings treated as zero ───
  it('treats negative earnings as zero', () => {
    const result = calculateSelfEmploymentTax({
      netEarnings: -5000,
      filingStatus: 'single',
      otherIncome: 0,
      businessExpenses: 0,
      quarterlyPayments: 0,
    });
    expect(result.selfEmploymentTax).toBe(0);
    expect(result.totalTaxLiability).toBe(0);
  });

  // ─── Test 22: Business expenses exceeding earnings ───
  it('clamps to zero when business expenses exceed earnings', () => {
    const result = calculateSelfEmploymentTax({
      netEarnings: 30000,
      filingStatus: 'single',
      otherIncome: 0,
      businessExpenses: 50000,
      quarterlyPayments: 0,
    });
    // Net SE = max(0, 30,000 - 50,000) = 0
    expect(result.selfEmploymentTax).toBe(0);
    expect(result.socialSecurityTax).toBe(0);
    expect(result.medicareTax).toBe(0);
  });

  // ─── Test 23: Quarterly payments exceeding total liability → remaining due = 0 ───
  it('shows $0 remaining when quarterly payments exceed liability', () => {
    const result = calculateSelfEmploymentTax({
      netEarnings: 50000,
      filingStatus: 'single',
      otherIncome: 0,
      businessExpenses: 0,
      quarterlyPayments: 100000,
    });
    expect(result.remainingDue).toBe(0);
  });

  // ─── Test 24: SS wage base cap with partial SE income ───
  it('correctly caps SS when taxable SE income straddles the wage base', () => {
    const result = calculateSelfEmploymentTax({
      netEarnings: 200000,
      filingStatus: 'single',
      otherIncome: 0,
      businessExpenses: 0,
      quarterlyPayments: 0,
    });
    // Taxable SE = 200,000 × 0.9235 = 184,700
    // SS wage base = 168,600 (no other income)
    // SS = min(184,700, 168,600) × 0.124 = 168,600 × 0.124 = 20,906.40
    expect(result.socialSecurityTax).toBeCloseTo(20906.40, 0);
  });
});
