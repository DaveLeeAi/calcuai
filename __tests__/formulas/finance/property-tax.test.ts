import { calculatePropertyTax } from '@/lib/formulas/finance/property-tax';

describe('calculatePropertyTax', () => {
  // ─── Test 1: Standard home ($300k, 100% assessment, 1.1% rate) ───
  it('calculates property tax for a standard home', () => {
    const result = calculatePropertyTax({
      homeValue: 300000,
      assessmentRate: 100,
      taxRate: 1.1,
      exemptions: 0,
      specialAssessments: 0,
    });
    // Assessed: $300,000 × 1.0 = $300,000
    // Taxable: $300,000 − $0 = $300,000
    // Annual: $300,000 × 0.011 = $3,300
    expect(result.assessedValue).toBe(300000);
    expect(result.taxableValue).toBe(300000);
    expect(result.annualTax).toBe(3300);
  });

  // ─── Test 2: Partial assessment (80%) ───
  it('calculates with partial assessment rate', () => {
    const result = calculatePropertyTax({
      homeValue: 300000,
      assessmentRate: 80,
      taxRate: 1.1,
      exemptions: 0,
      specialAssessments: 0,
    });
    // Assessed: $300,000 × 0.80 = $240,000
    // Annual: $240,000 × 0.011 = $2,640
    expect(result.assessedValue).toBe(240000);
    expect(result.taxableValue).toBe(240000);
    expect(result.annualTax).toBe(2640);
  });

  // ─── Test 3: With homestead exemption ($50k) ───
  it('applies homestead exemption correctly', () => {
    const result = calculatePropertyTax({
      homeValue: 300000,
      assessmentRate: 100,
      taxRate: 1.1,
      exemptions: 50000,
      specialAssessments: 0,
    });
    // Assessed: $300,000
    // Taxable: $300,000 − $50,000 = $250,000
    // Annual: $250,000 × 0.011 = $2,750
    expect(result.taxableValue).toBe(250000);
    expect(result.annualTax).toBe(2750);
  });

  // ─── Test 4: With special assessments ───
  it('adds special assessments to annual tax', () => {
    const result = calculatePropertyTax({
      homeValue: 300000,
      assessmentRate: 100,
      taxRate: 1.1,
      exemptions: 0,
      specialAssessments: 500,
    });
    // Base: $3,300 + Special: $500 = $3,800
    expect(result.annualTax).toBe(3800);
  });

  // ─── Test 5: Zero home value ───
  it('returns all zeros for zero home value', () => {
    const result = calculatePropertyTax({
      homeValue: 0,
      assessmentRate: 100,
      taxRate: 1.1,
      exemptions: 0,
      specialAssessments: 0,
    });
    expect(result.assessedValue).toBe(0);
    expect(result.taxableValue).toBe(0);
    expect(result.annualTax).toBe(0);
    expect(result.monthlyTax).toBe(0);
    expect(result.effectiveRate).toBe(0);
  });

  // ─── Test 6: High-value home ($1M) ───
  it('calculates for a high-value home', () => {
    const result = calculatePropertyTax({
      homeValue: 1000000,
      assessmentRate: 100,
      taxRate: 1.5,
      exemptions: 0,
      specialAssessments: 0,
    });
    // Annual: $1,000,000 × 0.015 = $15,000
    // Monthly: $15,000 / 12 = $1,250
    expect(result.annualTax).toBe(15000);
    expect(result.monthlyTax).toBe(1250);
  });

  // ─── Test 7: High tax rate (3%) ───
  it('calculates with a high tax rate', () => {
    const result = calculatePropertyTax({
      homeValue: 300000,
      assessmentRate: 100,
      taxRate: 3,
      exemptions: 0,
      specialAssessments: 0,
    });
    // Annual: $300,000 × 0.03 = $9,000
    expect(result.annualTax).toBe(9000);
  });

  // ─── Test 8: Zero tax rate ───
  it('handles zero tax rate with only special assessments', () => {
    const result = calculatePropertyTax({
      homeValue: 300000,
      assessmentRate: 100,
      taxRate: 0,
      exemptions: 0,
      specialAssessments: 200,
    });
    // Base tax: $0, Annual: $0 + $200 = $200
    expect(result.annualTax).toBe(200);
  });

  // ─── Test 9: Exemption exceeds assessed value ───
  it('floors taxable value at zero when exemption exceeds assessed value', () => {
    const result = calculatePropertyTax({
      homeValue: 100000,
      assessmentRate: 100,
      taxRate: 1.1,
      exemptions: 150000,
      specialAssessments: 0,
    });
    // Assessed: $100,000
    // Taxable: max(0, $100,000 − $150,000) = $0
    // Annual: $0
    expect(result.taxableValue).toBe(0);
    expect(result.annualTax).toBe(0);
  });

  // ─── Test 10: Monthly tax accuracy ───
  it('calculates monthly tax correctly', () => {
    const result = calculatePropertyTax({
      homeValue: 300000,
      assessmentRate: 100,
      taxRate: 1.1,
      exemptions: 0,
      specialAssessments: 0,
    });
    // Monthly: $3,300 / 12 = $275
    expect(result.monthlyTax).toBe(275);
  });

  // ─── Test 11: Effective rate calculation ───
  it('calculates effective rate correctly', () => {
    const result = calculatePropertyTax({
      homeValue: 300000,
      assessmentRate: 100,
      taxRate: 1.1,
      exemptions: 0,
      specialAssessments: 0,
    });
    // Effective: ($3,300 / $300,000) × 100 = 1.1%
    expect(result.effectiveRate).toBe(1.1);
  });

  // ─── Test 12: Mill rate conversion ───
  it('converts tax rate to mill rate correctly', () => {
    const result = calculatePropertyTax({
      homeValue: 300000,
      assessmentRate: 100,
      taxRate: 1.1,
      exemptions: 0,
      specialAssessments: 0,
    });
    // Mill rate: 1.1 × 10 = 11.0
    expect(result.millRate).toBe(11);
  });

  // ─── Test 13: Daily tax calculation ───
  it('calculates daily tax correctly', () => {
    const result = calculatePropertyTax({
      homeValue: 300000,
      assessmentRate: 100,
      taxRate: 1.1,
      exemptions: 0,
      specialAssessments: 0,
    });
    // Daily: $3,300 / 365 = $9.04
    expect(result.dailyTax).toBe(9.04);
  });

  // ─── Test 14: Tax breakdown structure ───
  it('returns correct tax breakdown structure', () => {
    const result = calculatePropertyTax({
      homeValue: 300000,
      assessmentRate: 100,
      taxRate: 1.1,
      exemptions: 0,
      specialAssessments: 500,
    });
    const breakdown = result.taxBreakdown as { label: string; value: number }[];
    expect(breakdown).toHaveLength(3);
    expect(breakdown[0]).toEqual({ label: 'Base Property Tax', value: 3300 });
    expect(breakdown[1]).toEqual({ label: 'Special Assessments', value: 500 });
    expect(breakdown[2]).toEqual({ label: 'Total Annual', value: 3800 });
  });

  // ─── Test 15: Low value home ($100k) ───
  it('calculates for a low-value home', () => {
    const result = calculatePropertyTax({
      homeValue: 100000,
      assessmentRate: 100,
      taxRate: 1.1,
      exemptions: 0,
      specialAssessments: 0,
    });
    // Annual: $100,000 × 0.011 = $1,100
    // Monthly: $1,100 / 12 = $91.67
    expect(result.annualTax).toBe(1100);
    expect(result.monthlyTax).toBe(91.67);
  });

  // ─── Test 16: Output structure validation ───
  it('returns all expected output fields', () => {
    const result = calculatePropertyTax({
      homeValue: 300000,
      assessmentRate: 100,
      taxRate: 1.1,
      exemptions: 0,
      specialAssessments: 0,
    });
    expect(result).toHaveProperty('assessedValue');
    expect(result).toHaveProperty('taxableValue');
    expect(result).toHaveProperty('annualTax');
    expect(result).toHaveProperty('monthlyTax');
    expect(result).toHaveProperty('dailyTax');
    expect(result).toHaveProperty('effectiveRate');
    expect(result).toHaveProperty('millRate');
    expect(result).toHaveProperty('taxBreakdown');
    expect(Array.isArray(result.taxBreakdown)).toBe(true);
  });

  // ─── Test 17: Effective rate with special assessments ───
  it('includes special assessments in effective rate', () => {
    const result = calculatePropertyTax({
      homeValue: 200000,
      assessmentRate: 100,
      taxRate: 1.0,
      exemptions: 0,
      specialAssessments: 500,
    });
    // Base: $2,000, Annual: $2,500
    // Effective: ($2,500 / $200,000) × 100 = 1.25%
    expect(result.annualTax).toBe(2500);
    expect(result.effectiveRate).toBe(1.25);
  });

  // ─── Test 18: Partial assessment + exemption combined ───
  it('combines partial assessment and exemption correctly', () => {
    const result = calculatePropertyTax({
      homeValue: 350000,
      assessmentRate: 85,
      taxRate: 1.2,
      exemptions: 25000,
      specialAssessments: 0,
    });
    // Assessed: $350,000 × 0.85 = $297,500
    // Taxable: $297,500 − $25,000 = $272,500
    // Annual: $272,500 × 0.012 = $3,270
    expect(result.assessedValue).toBe(297500);
    expect(result.taxableValue).toBe(272500);
    expect(result.annualTax).toBe(3270);
  });

  // ─── Test 19: Zero tax rate and zero special assessments ───
  it('returns zero annual tax when rate and assessments are both zero', () => {
    const result = calculatePropertyTax({
      homeValue: 300000,
      assessmentRate: 100,
      taxRate: 0,
      exemptions: 0,
      specialAssessments: 0,
    });
    expect(result.annualTax).toBe(0);
    expect(result.monthlyTax).toBe(0);
    expect(result.dailyTax).toBe(0);
    expect(result.effectiveRate).toBe(0);
  });

  // ─── Test 20: Mill rate for various tax rates ───
  it('calculates mill rate for 2.5% tax rate', () => {
    const result = calculatePropertyTax({
      homeValue: 300000,
      assessmentRate: 100,
      taxRate: 2.5,
      exemptions: 0,
      specialAssessments: 0,
    });
    // Mill rate: 2.5 × 10 = 25.0
    expect(result.millRate).toBe(25);
  });
});
