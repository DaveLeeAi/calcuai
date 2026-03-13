import { calculateCapRate } from '@/lib/formulas/finance/cap-rate';

describe('calculateCapRate', () => {
  // ─── Test 1: Standard property (~7.8% cap rate) ───
  it('calculates cap rate for a standard rental property', () => {
    const result = calculateCapRate({
      propertyValue: 200000,
      grossRentalIncome: 24000,
      vacancyRate: 5,
      operatingExpenses: 0,
      propertyTax: 2400,
      insurance: 1200,
      maintenance: 1200,
      management: 0,
    });
    // EGI: $24,000 × 0.95 = $22,800
    // Total expenses: $4,800
    // NOI: $22,800 − $4,800 = $18,000
    // Cap rate: ($18,000 / $200,000) × 100 = 9.0%
    expect(result.netOperatingIncome).toBe(18000);
    expect(result.capRate).toBe(9);
    expect(result.effectiveGrossIncome).toBe(22800);
    expect(result.totalExpenses).toBe(4800);
  });

  // ─── Test 2: High-value property ($1M) ───
  it('calculates cap rate for a high-value property', () => {
    const result = calculateCapRate({
      propertyValue: 1000000,
      grossRentalIncome: 80000,
      vacancyRate: 5,
      operatingExpenses: 10000,
      propertyTax: 12000,
      insurance: 4000,
      maintenance: 5000,
      management: 6000,
    });
    // EGI: $80,000 × 0.95 = $76,000
    // Total expenses: $37,000
    // NOI: $76,000 − $37,000 = $39,000
    // Cap rate: ($39,000 / $1,000,000) × 100 = 3.9%
    expect(result.netOperatingIncome).toBe(39000);
    expect(result.capRate).toBe(3.9);
  });

  // ─── Test 3: Low cap rate scenario (expensive market) ───
  it('calculates a low cap rate for an expensive market', () => {
    const result = calculateCapRate({
      propertyValue: 500000,
      grossRentalIncome: 30000,
      vacancyRate: 3,
      operatingExpenses: 2000,
      propertyTax: 6000,
      insurance: 2000,
      maintenance: 3000,
      management: 2000,
    });
    // EGI: $30,000 × 0.97 = $29,100
    // Expenses: $15,000
    // NOI: $29,100 − $15,000 = $14,100
    // Cap rate: ($14,100 / $500,000) × 100 = 2.82%
    expect(result.capRate).toBe(2.82);
    expect(result.netOperatingIncome).toBe(14100);
  });

  // ─── Test 4: High cap rate scenario ───
  it('calculates a high cap rate in a cheap market', () => {
    const result = calculateCapRate({
      propertyValue: 80000,
      grossRentalIncome: 14400,
      vacancyRate: 8,
      operatingExpenses: 0,
      propertyTax: 1000,
      insurance: 600,
      maintenance: 800,
      management: 0,
    });
    // EGI: $14,400 × 0.92 = $13,248
    // Expenses: $2,400
    // NOI: $13,248 − $2,400 = $10,848
    // Cap rate: ($10,848 / $80,000) × 100 = 13.56%
    expect(result.capRate).toBe(13.56);
    expect(result.netOperatingIncome).toBe(10848);
  });

  // ─── Test 5: Zero vacancy rate ───
  it('handles zero vacancy rate', () => {
    const result = calculateCapRate({
      propertyValue: 200000,
      grossRentalIncome: 24000,
      vacancyRate: 0,
      operatingExpenses: 0,
      propertyTax: 2400,
      insurance: 1200,
      maintenance: 1200,
      management: 0,
    });
    // EGI: $24,000 (no vacancy)
    // NOI: $24,000 − $4,800 = $19,200
    // Cap rate: ($19,200 / $200,000) × 100 = 9.6%
    expect(result.effectiveGrossIncome).toBe(24000);
    expect(result.netOperatingIncome).toBe(19200);
    expect(result.capRate).toBe(9.6);
  });

  // ─── Test 6: 10% vacancy rate ───
  it('handles 10% vacancy rate', () => {
    const result = calculateCapRate({
      propertyValue: 200000,
      grossRentalIncome: 24000,
      vacancyRate: 10,
      operatingExpenses: 0,
      propertyTax: 2400,
      insurance: 1200,
      maintenance: 1200,
      management: 0,
    });
    // EGI: $24,000 × 0.90 = $21,600
    // NOI: $21,600 − $4,800 = $16,800
    // Cap rate: ($16,800 / $200,000) × 100 = 8.4%
    expect(result.effectiveGrossIncome).toBe(21600);
    expect(result.capRate).toBe(8.4);
  });

  // ─── Test 7: High expense ratio ───
  it('calculates with a high expense ratio', () => {
    const result = calculateCapRate({
      propertyValue: 200000,
      grossRentalIncome: 24000,
      vacancyRate: 5,
      operatingExpenses: 5000,
      propertyTax: 4000,
      insurance: 2000,
      maintenance: 3000,
      management: 2000,
    });
    // EGI: $22,800
    // Total expenses: $16,000
    // Expense ratio: ($16,000 / $22,800) × 100 = 70.18%
    expect(result.totalExpenses).toBe(16000);
    expect(result.expenseRatio).toBe(70.18);
  });

  // ─── Test 8: Zero property value ───
  it('handles zero property value (cap rate = 0)', () => {
    const result = calculateCapRate({
      propertyValue: 0,
      grossRentalIncome: 24000,
      vacancyRate: 5,
      operatingExpenses: 0,
      propertyTax: 2400,
      insurance: 1200,
      maintenance: 1200,
      management: 0,
    });
    expect(result.capRate).toBe(0);
    expect(result.netOperatingIncome).toBe(18000);
  });

  // ─── Test 9: Zero income ───
  it('handles zero gross rental income', () => {
    const result = calculateCapRate({
      propertyValue: 200000,
      grossRentalIncome: 0,
      vacancyRate: 5,
      operatingExpenses: 0,
      propertyTax: 2400,
      insurance: 1200,
      maintenance: 1200,
      management: 0,
    });
    // EGI: $0
    // NOI: $0 − $4,800 = −$4,800
    expect(result.effectiveGrossIncome).toBe(0);
    expect(result.netOperatingIncome).toBe(-4800);
    expect(result.capRate).toBe(-2.4);
  });

  // ─── Test 10: All output fields present ───
  it('returns all expected output fields', () => {
    const result = calculateCapRate({
      propertyValue: 200000,
      grossRentalIncome: 24000,
      vacancyRate: 5,
      operatingExpenses: 0,
      propertyTax: 2400,
      insurance: 1200,
      maintenance: 1200,
      management: 0,
    });
    expect(result).toHaveProperty('capRate');
    expect(result).toHaveProperty('netOperatingIncome');
    expect(result).toHaveProperty('effectiveGrossIncome');
    expect(result).toHaveProperty('totalExpenses');
    expect(result).toHaveProperty('expenseRatio');
    expect(result).toHaveProperty('monthlyNOI');
    expect(result).toHaveProperty('grm');
    expect(result).toHaveProperty('summary');
    expect(Array.isArray(result.summary)).toBe(true);
  });

  // ─── Test 11: Monthly NOI accuracy ───
  it('calculates monthly NOI correctly', () => {
    const result = calculateCapRate({
      propertyValue: 200000,
      grossRentalIncome: 24000,
      vacancyRate: 5,
      operatingExpenses: 0,
      propertyTax: 2400,
      insurance: 1200,
      maintenance: 1200,
      management: 0,
    });
    // NOI: $18,000; Monthly: $18,000 / 12 = $1,500
    expect(result.monthlyNOI).toBe(1500);
  });

  // ─── Test 12: GRM calculation ───
  it('calculates gross rent multiplier correctly', () => {
    const result = calculateCapRate({
      propertyValue: 200000,
      grossRentalIncome: 24000,
      vacancyRate: 5,
      operatingExpenses: 0,
      propertyTax: 0,
      insurance: 0,
      maintenance: 0,
      management: 0,
    });
    // GRM: $200,000 / $24,000 = 8.3
    expect(result.grm).toBe(8.3);
  });

  // ─── Test 13: Expense breakdown with all categories ───
  it('sums all expense categories correctly', () => {
    const result = calculateCapRate({
      propertyValue: 300000,
      grossRentalIncome: 36000,
      vacancyRate: 5,
      operatingExpenses: 1000,
      propertyTax: 3600,
      insurance: 1800,
      maintenance: 2400,
      management: 1800,
    });
    // Total: 1000 + 3600 + 1800 + 2400 + 1800 = $10,600
    expect(result.totalExpenses).toBe(10600);
  });

  // ─── Test 14: Negative NOI (expenses > income) ───
  it('handles negative NOI when expenses exceed income', () => {
    const result = calculateCapRate({
      propertyValue: 200000,
      grossRentalIncome: 12000,
      vacancyRate: 10,
      operatingExpenses: 5000,
      propertyTax: 4000,
      insurance: 2000,
      maintenance: 3000,
      management: 1000,
    });
    // EGI: $12,000 × 0.90 = $10,800
    // Total expenses: $15,000
    // NOI: $10,800 − $15,000 = −$4,200
    expect(result.netOperatingIncome).toBe(-4200);
    expect(result.capRate).toBe(-2.1);
  });

  // ─── Test 15: Expense ratio > 100% ───
  it('calculates expense ratio above 100%', () => {
    const result = calculateCapRate({
      propertyValue: 200000,
      grossRentalIncome: 12000,
      vacancyRate: 10,
      operatingExpenses: 5000,
      propertyTax: 4000,
      insurance: 2000,
      maintenance: 3000,
      management: 1000,
    });
    // EGI: $10,800; Expenses: $15,000
    // Expense ratio: ($15,000 / $10,800) × 100 = 138.89%
    expect(result.expenseRatio).toBe(138.89);
  });

  // ─── Test 16: Summary contains expected labels ───
  it('summary includes correct label/value pairs', () => {
    const result = calculateCapRate({
      propertyValue: 200000,
      grossRentalIncome: 24000,
      vacancyRate: 5,
      operatingExpenses: 0,
      propertyTax: 2400,
      insurance: 1200,
      maintenance: 1200,
      management: 0,
    });
    const summary = result.summary as { label: string; value: number }[];
    const labels = summary.map((s) => s.label);
    expect(labels).toContain('Cap Rate');
    expect(labels).toContain('Net Operating Income');
    expect(labels).toContain('Effective Gross Income');
    expect(labels).toContain('Total Expenses');
    expect(labels).toContain('Expense Ratio');
    expect(labels).toContain('Monthly NOI');
    expect(labels).toContain('Gross Rent Multiplier');
  });

  // ─── Test 17: Zero gross rental income gives GRM of 0 ───
  it('returns GRM of 0 when gross income is zero', () => {
    const result = calculateCapRate({
      propertyValue: 200000,
      grossRentalIncome: 0,
      vacancyRate: 0,
      operatingExpenses: 0,
      propertyTax: 0,
      insurance: 0,
      maintenance: 0,
      management: 0,
    });
    expect(result.grm).toBe(0);
  });

  // ─── Test 18: No expenses at all ───
  it('calculates with zero expenses', () => {
    const result = calculateCapRate({
      propertyValue: 200000,
      grossRentalIncome: 24000,
      vacancyRate: 5,
      operatingExpenses: 0,
      propertyTax: 0,
      insurance: 0,
      maintenance: 0,
      management: 0,
    });
    // EGI: $22,800; Expenses: $0; NOI: $22,800
    // Cap rate: ($22,800 / $200,000) × 100 = 11.4%
    expect(result.totalExpenses).toBe(0);
    expect(result.netOperatingIncome).toBe(22800);
    expect(result.capRate).toBe(11.4);
    expect(result.expenseRatio).toBe(0);
  });
});
