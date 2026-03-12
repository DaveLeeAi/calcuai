import { calculateCdReturn } from '@/lib/formulas/finance/cd-return';

describe('calculateCdReturn', () => {
  // ─── Test 1: 12-month CD at 5% with daily compounding ───
  it('calculates 12-month CD at 5% with daily compounding', () => {
    const result = calculateCdReturn({
      depositAmount: 10000,
      annualRate: 5,
      termMonths: 12,
      compoundingFrequency: '365',
    });
    // A = 10000 × (1 + 0.05/365)^365 ≈ $10,512.67
    expect(result.totalValue).toBeCloseTo(10512.67, 0);
    expect(result.interestEarned).toBeCloseTo(512.67, 0);
    // APY = (1 + 0.05/365)^365 - 1 ≈ 5.13%
    expect(result.apy).toBeCloseTo(5.13, 1);
  });

  // ─── Test 2: 12-month CD at 5% with monthly compounding ───
  it('calculates 12-month CD at 5% with monthly compounding', () => {
    const result = calculateCdReturn({
      depositAmount: 10000,
      annualRate: 5,
      termMonths: 12,
      compoundingFrequency: '12',
    });
    // A = 10000 × (1 + 0.05/12)^12 ≈ $10,511.62
    expect(result.totalValue).toBeCloseTo(10511.62, 0);
    expect(result.interestEarned).toBeCloseTo(511.62, 0);
    // APY ≈ 5.12%
    expect(result.apy).toBeCloseTo(5.12, 1);
  });

  // ─── Test 3: 5-year CD at 4.25% with monthly compounding ───
  it('calculates 5-year CD at 4.25% with monthly compounding', () => {
    const result = calculateCdReturn({
      depositAmount: 25000,
      annualRate: 4.25,
      termMonths: 60,
      compoundingFrequency: '12',
    });
    // A = 25000 × (1 + 0.0425/12)^60 ≈ $30,903
    expect(result.totalValue).toBeCloseTo(30903, -1);
    expect(result.interestEarned).toBeCloseTo(5903, -1);
    // APY = (1 + 0.0425/12)^12 - 1 ≈ 4.33%
    expect(result.apy).toBeCloseTo(4.33, 0);
  });

  // ─── Test 4: Zero interest rate ───
  it('handles zero interest rate correctly', () => {
    const result = calculateCdReturn({
      depositAmount: 10000,
      annualRate: 0,
      termMonths: 12,
      compoundingFrequency: '365',
    });
    expect(result.totalValue).toBe(10000);
    expect(result.interestEarned).toBe(0);
    expect(result.apy).toBe(0);
  });

  // ─── Test 5: Zero deposit amount ───
  it('handles zero deposit amount correctly', () => {
    const result = calculateCdReturn({
      depositAmount: 0,
      annualRate: 5,
      termMonths: 12,
      compoundingFrequency: '12',
    });
    expect(result.totalValue).toBe(0);
    expect(result.interestEarned).toBe(0);
  });

  // ─── Test 6: Short-term CD (3 months) ───
  it('calculates 3-month CD correctly', () => {
    const result = calculateCdReturn({
      depositAmount: 10000,
      annualRate: 5,
      termMonths: 3,
      compoundingFrequency: '365',
    });
    // 3 months = 0.25 years
    // A = 10000 × (1 + 0.05/365)^(365*0.25) ≈ $10,125.78
    expect(result.totalValue).toBeCloseTo(10125.78, 0);
    expect(result.interestEarned).toBeCloseTo(125.78, 0);
  });

  // ─── Test 7: Quarterly compounding ───
  it('calculates correctly with quarterly compounding', () => {
    const result = calculateCdReturn({
      depositAmount: 10000,
      annualRate: 5,
      termMonths: 12,
      compoundingFrequency: '4',
    });
    // A = 10000 × (1 + 0.05/4)^4 ≈ $10,509.45
    expect(result.totalValue).toBeCloseTo(10509.45, 0);
    // APY = (1 + 0.05/4)^4 - 1 ≈ 5.09%
    expect(result.apy).toBeCloseTo(5.09, 1);
  });

  // ─── Test 8: Daily compounding produces higher yield than monthly ───
  it('daily compounding produces higher APY than monthly', () => {
    const daily = calculateCdReturn({
      depositAmount: 10000,
      annualRate: 5,
      termMonths: 12,
      compoundingFrequency: '365',
    });
    const monthly = calculateCdReturn({
      depositAmount: 10000,
      annualRate: 5,
      termMonths: 12,
      compoundingFrequency: '12',
    });
    expect(daily.apy as number).toBeGreaterThan(monthly.apy as number);
    expect(daily.totalValue as number).toBeGreaterThan(monthly.totalValue as number);
  });

  // ─── Test 9: Large deposit ($100,000) ───
  it('handles large deposits correctly', () => {
    const result = calculateCdReturn({
      depositAmount: 100000,
      annualRate: 5,
      termMonths: 60,
      compoundingFrequency: '365',
    });
    // A = 100000 × (1 + 0.05/365)^(365*5) ≈ $128,402
    expect(result.totalValue).toBeCloseTo(128402, -1);
    expect(result.interestEarned).toBeCloseTo(28402, -1);
  });

  // ─── Test 10: Summary contains all required labels ───
  it('returns summary with all required labels', () => {
    const result = calculateCdReturn({
      depositAmount: 10000,
      annualRate: 5,
      termMonths: 12,
      compoundingFrequency: '365',
    });
    const summary = result.summary as Array<{ label: string; value: number }>;
    const labels = summary.map(s => s.label);
    expect(labels).toContain('Maturity Value');
    expect(labels).toContain('Interest Earned');
    expect(labels).toContain('APY');
    expect(labels).toContain('Deposit Amount');
    expect(summary).toHaveLength(4);
  });

  // ─── Test 11: Interest earned equals totalValue minus deposit ───
  it('interest earned equals maturity value minus deposit', () => {
    const result = calculateCdReturn({
      depositAmount: 15000,
      annualRate: 4.75,
      termMonths: 24,
      compoundingFrequency: '12',
    });
    const total = result.totalValue as number;
    const interest = result.interestEarned as number;
    expect(interest).toBeCloseTo(total - 15000, 1);
  });

  // ─── Test 12: 18-month term (non-standard) ───
  it('calculates 18-month term correctly', () => {
    const result = calculateCdReturn({
      depositAmount: 10000,
      annualRate: 5,
      termMonths: 18,
      compoundingFrequency: '12',
    });
    // 18 months = 1.5 years
    // A = 10000 × (1 + 0.05/12)^18 ≈ $10,777
    expect(result.totalValue).toBeCloseTo(10777, -1);
  });

  // ─── Test 13: High interest rate ───
  it('calculates correctly with a high interest rate', () => {
    const result = calculateCdReturn({
      depositAmount: 5000,
      annualRate: 10,
      termMonths: 12,
      compoundingFrequency: '12',
    });
    // A = 5000 × (1 + 0.10/12)^12 ≈ $5,523.57
    expect(result.totalValue).toBeCloseTo(5523.57, 0);
    // APY = (1 + 0.10/12)^12 - 1 ≈ 10.47%
    expect(result.apy).toBeCloseTo(10.47, 0);
  });
});
