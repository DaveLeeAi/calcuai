import { calculateFutureValue } from '@/lib/formulas/finance/future-value';

describe('calculateFutureValue', () => {
  // ─── Test 1: Standard lump sum — $10,000 at 7% annually for 10 years ───
  it('calculates FV of a lump sum correctly', () => {
    const result = calculateFutureValue({
      presentValue: 10000,
      periodicPayment: 0,
      annualRate: 7,
      years: 10,
      compoundingFrequency: '1',
    });
    // FV = 10000 × (1.07)^10 = $19,671.51
    expect(result.totalFutureValue).toBeCloseTo(19671.51, 0);
    expect(result.fvLumpSum).toBeCloseTo(19671.51, 0);
    expect(result.fvAnnuity).toBe(0);
  });

  // ─── Test 2: Annuity only — $500/year for 20 years at 6% ───
  it('calculates FV of an annuity correctly', () => {
    const result = calculateFutureValue({
      presentValue: 0,
      periodicPayment: 500,
      annualRate: 6,
      years: 20,
      compoundingFrequency: '1',
    });
    // FV = 500 × [((1.06)^20 - 1) / 0.06] ≈ $18,392.80
    expect(result.totalFutureValue).toBeCloseTo(18392.80, 0);
    expect(result.fvLumpSum).toBe(0);
    expect(result.fvAnnuity).toBeCloseTo(18392.80, 0);
  });

  // ─── Test 3: Combined lump sum + annuity ───
  it('calculates combined FV of lump sum and annuity', () => {
    const result = calculateFutureValue({
      presentValue: 5000,
      periodicPayment: 200,
      annualRate: 5,
      years: 15,
      compoundingFrequency: '1',
    });
    // FV lump = 5000 × (1.05)^15 ≈ $10,394.64
    // FV annuity = 200 × [((1.05)^15 - 1) / 0.05] ≈ $4,315.73
    // Total ≈ $14,710.37
    expect(result.fvLumpSum).toBeCloseTo(10394.64, 0);
    expect(result.fvAnnuity).toBeCloseTo(4315.73, 0);
    expect(result.totalFutureValue).toBeCloseTo(14710.37, -1);
  });

  // ─── Test 4: Zero interest rate ───
  it('handles zero interest rate correctly', () => {
    const result = calculateFutureValue({
      presentValue: 10000,
      periodicPayment: 1000,
      annualRate: 0,
      years: 5,
      compoundingFrequency: '1',
    });
    expect(result.fvLumpSum).toBe(10000);
    expect(result.fvAnnuity).toBe(5000);
    expect(result.totalFutureValue).toBe(15000);
    expect(result.totalInterest).toBe(0);
  });

  // ─── Test 5: Zero time period ───
  it('handles zero time period', () => {
    const result = calculateFutureValue({
      presentValue: 10000,
      periodicPayment: 0,
      annualRate: 5,
      years: 0,
      compoundingFrequency: '1',
    });
    expect(result.totalFutureValue).toBe(10000);
    expect(result.totalInterest).toBe(0);
  });

  // ─── Test 6: Monthly compounding ───
  it('calculates FV with monthly compounding', () => {
    const result = calculateFutureValue({
      presentValue: 10000,
      periodicPayment: 0,
      annualRate: 6,
      years: 5,
      compoundingFrequency: '12',
    });
    // FV = 10000 × (1.005)^60 ≈ $13,488.50
    expect(result.totalFutureValue).toBeCloseTo(13488.50, 0);
  });

  // ─── Test 7: Monthly contributions with monthly compounding ───
  it('calculates FV of monthly contributions with monthly compounding', () => {
    const result = calculateFutureValue({
      presentValue: 0,
      periodicPayment: 500,
      annualRate: 7,
      years: 30,
      compoundingFrequency: '12',
    });
    // FV = 500 × [((1 + 0.07/12)^360 - 1) / (0.07/12)] ≈ $609,986
    const fv = result.totalFutureValue as number;
    expect(fv).toBeGreaterThan(609000);
    expect(fv).toBeLessThan(611000);
    expect(result.totalContributions).toBe(180000);
  });

  // ─── Test 8: Quarterly compounding ───
  it('calculates FV with quarterly compounding', () => {
    const result = calculateFutureValue({
      presentValue: 10000,
      periodicPayment: 0,
      annualRate: 8,
      years: 3,
      compoundingFrequency: '4',
    });
    // FV = 10000 × (1.02)^12 ≈ $12,682.42
    expect(result.totalFutureValue).toBeCloseTo(12682.42, 0);
  });

  // ─── Test 9: Total interest calculation ───
  it('calculates total interest correctly', () => {
    const result = calculateFutureValue({
      presentValue: 10000,
      periodicPayment: 1000,
      annualRate: 5,
      years: 10,
      compoundingFrequency: '1',
    });
    const fv = result.totalFutureValue as number;
    const contribs = result.totalContributions as number;
    const interest = result.totalInterest as number;
    expect(fv).toBeCloseTo(contribs + interest, 1);
    expect(interest).toBeGreaterThan(0);
  });

  // ─── Test 10: Growth multiplier ───
  it('calculates growth multiplier', () => {
    const result = calculateFutureValue({
      presentValue: 10000,
      periodicPayment: 0,
      annualRate: 7,
      years: 10,
      compoundingFrequency: '1',
    });
    // Multiplier = 19671 / 10000 ≈ 1.9672
    const multiplier = result.growthMultiplier as number;
    expect(multiplier).toBeCloseTo(1.9672, 2);
  });

  // ─── Test 11: Growth over time chart length ───
  it('generates growthOverTime with correct number of entries', () => {
    const result = calculateFutureValue({
      presentValue: 5000,
      periodicPayment: 0,
      annualRate: 5,
      years: 10,
      compoundingFrequency: '1',
    });
    const growthData = result.growthOverTime as Array<{ year: number }>;
    expect(growthData).toHaveLength(11); // year 0 through 10
    expect(growthData[0].year).toBe(0);
    expect(growthData[10].year).toBe(10);
  });

  // ─── Test 12: Growth over time starts at present value ───
  it('growthOverTime starts at present value', () => {
    const result = calculateFutureValue({
      presentValue: 5000,
      periodicPayment: 0,
      annualRate: 5,
      years: 5,
      compoundingFrequency: '1',
    });
    const growthData = result.growthOverTime as Array<{ year: number; balance: number; interest: number }>;
    expect(growthData[0].balance).toBe(5000);
    expect(growthData[0].interest).toBe(0);
  });

  // ─── Test 13: Growth over time increases monotonically ───
  it('growthOverTime balance increases each year', () => {
    const result = calculateFutureValue({
      presentValue: 5000,
      periodicPayment: 100,
      annualRate: 5,
      years: 10,
      compoundingFrequency: '1',
    });
    const growthData = result.growthOverTime as Array<{ year: number; balance: number }>;
    for (let i = 1; i < growthData.length; i++) {
      expect(growthData[i].balance).toBeGreaterThan(growthData[i - 1].balance);
    }
  });

  // ─── Test 14: Summary labels ───
  it('returns summary with all required labels', () => {
    const result = calculateFutureValue({
      presentValue: 5000,
      periodicPayment: 200,
      annualRate: 5,
      years: 10,
      compoundingFrequency: '1',
    });
    const summary = result.summary as Array<{ label: string; value: number }>;
    const labels = summary.map(s => s.label);
    expect(labels).toContain('Future Value');
    expect(labels).toContain('FV of Initial Investment');
    expect(labels).toContain('FV of Contributions');
    expect(labels).toContain('Total Interest Earned');
  });

  // ─── Test 15: Breakdown pie chart entries ───
  it('returns breakdown with all three components', () => {
    const result = calculateFutureValue({
      presentValue: 5000,
      periodicPayment: 200,
      annualRate: 5,
      years: 10,
      compoundingFrequency: '1',
    });
    const breakdown = result.breakdown as Array<{ name: string; value: number }>;
    const names = breakdown.map(b => b.name);
    expect(names).toContain('Initial Investment');
    expect(names).toContain('Contributions');
    expect(names).toContain('Interest Earned');
  });

  // ─── Test 16: Large values — 30-year retirement projection ───
  it('handles large values correctly', () => {
    const result = calculateFutureValue({
      presentValue: 50000,
      periodicPayment: 6000,
      annualRate: 8,
      years: 30,
      compoundingFrequency: '1',
    });
    const fv = result.totalFutureValue as number;
    // Should be very large (>$1M)
    expect(fv).toBeGreaterThan(1000000);
  });

  // ─── Test 17: FV = contributions + interest identity ───
  it('total FV equals contributions plus interest', () => {
    const result = calculateFutureValue({
      presentValue: 8000,
      periodicPayment: 400,
      annualRate: 6.5,
      years: 12,
      compoundingFrequency: '4',
    });
    const fv = result.totalFutureValue as number;
    const contribs = result.totalContributions as number;
    const interest = result.totalInterest as number;
    expect(fv).toBeCloseTo(contribs + interest, 0);
  });

  // ─── Test 18: Daily compounding ───
  it('calculates FV with daily compounding', () => {
    const result = calculateFutureValue({
      presentValue: 10000,
      periodicPayment: 0,
      annualRate: 5,
      years: 1,
      compoundingFrequency: '365',
    });
    // FV = 10000 × (1 + 0.05/365)^365 ≈ $10,512.67
    expect(result.totalFutureValue).toBeCloseTo(10512.67, 0);
  });
});
