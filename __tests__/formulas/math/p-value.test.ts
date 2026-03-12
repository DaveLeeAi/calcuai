import { calculatePValue } from '@/lib/formulas/math/p-value';

describe('calculatePValue', () => {
  // ═══════════════════════════════════════════════════════
  // Z-test (Standard Normal Distribution)
  // ═══════════════════════════════════════════════════════

  it('z = 1.96, two-tailed → p ≈ 0.05', () => {
    const result = calculatePValue({
      testStatistic: 1.96,
      distribution: 'z',
      testType: 'two-tailed',
    });
    expect(result.pValue).toBeCloseTo(0.05, 2);
  });

  it('z = 2.576, two-tailed → p ≈ 0.01', () => {
    const result = calculatePValue({
      testStatistic: 2.576,
      distribution: 'z',
      testType: 'two-tailed',
    });
    expect(result.pValue).toBeCloseTo(0.01, 2);
  });

  it('z = 1.645, right-tailed → p ≈ 0.05', () => {
    const result = calculatePValue({
      testStatistic: 1.645,
      distribution: 'z',
      testType: 'right-tailed',
    });
    expect(result.pValue).toBeCloseTo(0.05, 2);
  });

  it('z = -1.645, left-tailed → p ≈ 0.05', () => {
    const result = calculatePValue({
      testStatistic: -1.645,
      distribution: 'z',
      testType: 'left-tailed',
    });
    expect(result.pValue).toBeCloseTo(0.05, 2);
  });

  it('z = 0, two-tailed → p = 1.0', () => {
    const result = calculatePValue({
      testStatistic: 0,
      distribution: 'z',
      testType: 'two-tailed',
    });
    expect(result.pValue).toBeCloseTo(1.0, 4);
  });

  it('z = 3.29, two-tailed → p ≈ 0.001', () => {
    const result = calculatePValue({
      testStatistic: 3.29,
      distribution: 'z',
      testType: 'two-tailed',
    });
    expect(result.pValue).toBeCloseTo(0.001, 2);
  });

  it('z = -2.33, right-tailed → p ≈ 0.99', () => {
    const result = calculatePValue({
      testStatistic: -2.33,
      distribution: 'z',
      testType: 'right-tailed',
    });
    expect(Number(result.pValue)).toBeGreaterThan(0.98);
  });

  // ═══════════════════════════════════════════════════════
  // T-test (Student's t-distribution)
  // ═══════════════════════════════════════════════════════

  it('t = 2.0, df = 10, two-tailed → p ≈ 0.0736', () => {
    const result = calculatePValue({
      testStatistic: 2.0,
      degreesOfFreedom: 10,
      distribution: 't',
      testType: 'two-tailed',
    });
    expect(result.pValue).toBeCloseTo(0.0736, 2);
  });

  it('t = 2.228, df = 10, two-tailed → p ≈ 0.05', () => {
    const result = calculatePValue({
      testStatistic: 2.228,
      degreesOfFreedom: 10,
      distribution: 't',
      testType: 'two-tailed',
    });
    expect(result.pValue).toBeCloseTo(0.05, 1);
  });

  it('t = 0, df = 5, two-tailed → p = 1.0', () => {
    const result = calculatePValue({
      testStatistic: 0,
      degreesOfFreedom: 5,
      distribution: 't',
      testType: 'two-tailed',
    });
    expect(result.pValue).toBeCloseTo(1.0, 4);
  });

  it('t = 3.169, df = 30, right-tailed → p ≈ 0.0018', () => {
    const result = calculatePValue({
      testStatistic: 3.169,
      degreesOfFreedom: 30,
      distribution: 't',
      testType: 'right-tailed',
    });
    expect(result.pValue).toBeCloseTo(0.0018, 2);
  });

  it('t-test with df < 1 returns error', () => {
    const result = calculatePValue({
      testStatistic: 2.0,
      degreesOfFreedom: 0,
      distribution: 't',
      testType: 'two-tailed',
    });
    expect(result.pValue).toBeNull();
  });

  // ═══════════════════════════════════════════════════════
  // Chi-square test
  // ═══════════════════════════════════════════════════════

  it('chi2 = 3.841, df = 1, right-tailed → p ≈ 0.05', () => {
    const result = calculatePValue({
      testStatistic: 3.841,
      degreesOfFreedom: 1,
      distribution: 'chi-square',
      testType: 'right-tailed',
    });
    expect(result.pValue).toBeCloseTo(0.05, 2);
  });

  it('chi2 = 9.488, df = 4, right-tailed → p ≈ 0.05', () => {
    const result = calculatePValue({
      testStatistic: 9.488,
      degreesOfFreedom: 4,
      distribution: 'chi-square',
      testType: 'right-tailed',
    });
    expect(result.pValue).toBeCloseTo(0.05, 2);
  });

  it('chi2 = 0, df = 5, right-tailed → p = 1.0', () => {
    const result = calculatePValue({
      testStatistic: 0,
      degreesOfFreedom: 5,
      distribution: 'chi-square',
      testType: 'right-tailed',
    });
    expect(result.pValue).toBeCloseTo(1.0, 4);
  });

  it('negative chi2 statistic returns error', () => {
    const result = calculatePValue({
      testStatistic: -5,
      degreesOfFreedom: 3,
      distribution: 'chi-square',
      testType: 'right-tailed',
    });
    expect(result.pValue).toBeNull();
  });

  // ═══════════════════════════════════════════════════════
  // Significance flags
  // ═══════════════════════════════════════════════════════

  it('p < 0.05 flags significant at 5% but not 1%', () => {
    const result = calculatePValue({
      testStatistic: 2.1,
      distribution: 'z',
      testType: 'two-tailed',
    });
    expect(result.significantAt05).toBe(true);
    expect(result.significantAt01).toBe(false);
  });

  it('large z-value flags significant at all levels', () => {
    const result = calculatePValue({
      testStatistic: 5.0,
      distribution: 'z',
      testType: 'two-tailed',
    });
    expect(result.significantAt10).toBe(true);
    expect(result.significantAt05).toBe(true);
    expect(result.significantAt01).toBe(true);
    expect(result.significantAt001).toBe(true);
  });

  it('small z-value is not significant at any level', () => {
    const result = calculatePValue({
      testStatistic: 0.5,
      distribution: 'z',
      testType: 'two-tailed',
    });
    expect(result.significantAt10).toBe(false);
    expect(result.significantAt05).toBe(false);
  });

  // ═══════════════════════════════════════════════════════
  // Edge cases
  // ═══════════════════════════════════════════════════════

  it('very large z returns p near 0', () => {
    const result = calculatePValue({
      testStatistic: 10,
      distribution: 'z',
      testType: 'two-tailed',
    });
    expect(Number(result.pValue)).toBeLessThan(0.0001);
  });

  it('z-test df is null', () => {
    const result = calculatePValue({
      testStatistic: 1.96,
      distribution: 'z',
      testType: 'two-tailed',
    });
    expect(result.degreesOfFreedom).toBeNull();
  });

  it('t-test with large df approaches z-test', () => {
    const tResult = calculatePValue({
      testStatistic: 1.96,
      degreesOfFreedom: 1000,
      distribution: 't',
      testType: 'two-tailed',
    });
    const zResult = calculatePValue({
      testStatistic: 1.96,
      distribution: 'z',
      testType: 'two-tailed',
    });
    expect(Number(tResult.pValue)).toBeCloseTo(Number(zResult.pValue), 2);
  });
});
