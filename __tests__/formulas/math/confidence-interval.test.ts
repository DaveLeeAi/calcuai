import { calculateConfidenceInterval } from '@/lib/formulas/math/confidence-interval';

describe('calculateConfidenceInterval', () => {
  // ═══════════════════════════════════════════════════════
  // Standard 95% CI calculations
  // ═══════════════════════════════════════════════════════

  it('95% CI: mean=100, sd=15, n=25 → CI = [94.12, 105.88]', () => {
    const result = calculateConfidenceInterval({
      sampleMean: 100,
      standardDeviation: 15,
      sampleSize: 25,
      confidenceLevel: '95',
    });
    expect(result.lowerBound).toBeCloseTo(94.12, 1);
    expect(result.upperBound).toBeCloseTo(105.88, 1);
    expect(result.marginOfError).toBeCloseTo(5.88, 1);
    expect(result.standardError).toBeCloseTo(3.0, 4);
    expect(result.zScore).toBeCloseTo(1.96, 1);
  });

  it('95% CI: mean=50, sd=10, n=100 → margin ≈ 1.96', () => {
    const result = calculateConfidenceInterval({
      sampleMean: 50,
      standardDeviation: 10,
      sampleSize: 100,
      confidenceLevel: '95',
    });
    expect(result.standardError).toBeCloseTo(1.0, 4);
    expect(result.marginOfError).toBeCloseTo(1.96, 1);
    expect(result.lowerBound).toBeCloseTo(48.04, 1);
    expect(result.upperBound).toBeCloseTo(51.96, 1);
  });

  // ═══════════════════════════════════════════════════════
  // Different confidence levels
  // ═══════════════════════════════════════════════════════

  it('90% CI: mean=100, sd=15, n=25 → narrower than 95%', () => {
    const result = calculateConfidenceInterval({
      sampleMean: 100,
      standardDeviation: 15,
      sampleSize: 25,
      confidenceLevel: '90',
    });
    expect(result.zScore).toBeCloseTo(1.645, 2);
    expect(result.marginOfError).toBeCloseTo(4.935, 1);
    expect(Number(result.intervalWidth)).toBeLessThan(12); // narrower than 95%
  });

  it('99% CI: mean=100, sd=15, n=25 → wider than 95%', () => {
    const result = calculateConfidenceInterval({
      sampleMean: 100,
      standardDeviation: 15,
      sampleSize: 25,
      confidenceLevel: '99',
    });
    expect(result.zScore).toBeCloseTo(2.576, 2);
    expect(Number(result.intervalWidth)).toBeGreaterThan(12); // wider than 95%
  });

  it('80% CI uses correct z-score of 1.282', () => {
    const result = calculateConfidenceInterval({
      sampleMean: 50,
      standardDeviation: 10,
      sampleSize: 100,
      confidenceLevel: '80',
    });
    expect(result.zScore).toBeCloseTo(1.282, 2);
  });

  // ═══════════════════════════════════════════════════════
  // Sample size effects
  // ═══════════════════════════════════════════════════════

  it('larger sample size → narrower CI', () => {
    const small = calculateConfidenceInterval({
      sampleMean: 100,
      standardDeviation: 15,
      sampleSize: 10,
      confidenceLevel: '95',
    });
    const large = calculateConfidenceInterval({
      sampleMean: 100,
      standardDeviation: 15,
      sampleSize: 1000,
      confidenceLevel: '95',
    });
    expect(Number(large.marginOfError)).toBeLessThan(Number(small.marginOfError));
  });

  it('n=1 gives large margin of error', () => {
    const result = calculateConfidenceInterval({
      sampleMean: 100,
      standardDeviation: 15,
      sampleSize: 1,
      confidenceLevel: '95',
    });
    expect(result.standardError).toBeCloseTo(15.0, 4);
    expect(result.marginOfError).toBeCloseTo(29.4, 0);
  });

  // ═══════════════════════════════════════════════════════
  // Edge cases
  // ═══════════════════════════════════════════════════════

  it('standard deviation of 0 → CI is just the mean', () => {
    const result = calculateConfidenceInterval({
      sampleMean: 42,
      standardDeviation: 0,
      sampleSize: 30,
      confidenceLevel: '95',
    });
    expect(result.lowerBound).toBe(42);
    expect(result.upperBound).toBe(42);
    expect(result.marginOfError).toBe(0);
  });

  it('negative standard deviation returns error', () => {
    const result = calculateConfidenceInterval({
      sampleMean: 100,
      standardDeviation: -5,
      sampleSize: 25,
      confidenceLevel: '95',
    });
    expect(result.lowerBound).toBeNull();
    expect(result.error).toBeDefined();
  });

  it('sample size 0 returns error', () => {
    const result = calculateConfidenceInterval({
      sampleMean: 100,
      standardDeviation: 15,
      sampleSize: 0,
      confidenceLevel: '95',
    });
    expect(result.lowerBound).toBeNull();
    expect(result.error).toBeDefined();
  });

  it('confidence level 0 returns error', () => {
    const result = calculateConfidenceInterval({
      sampleMean: 100,
      standardDeviation: 15,
      sampleSize: 25,
      confidenceLevel: '0',
    });
    expect(result.lowerBound).toBeNull();
  });

  it('confidence level 100 returns error', () => {
    const result = calculateConfidenceInterval({
      sampleMean: 100,
      standardDeviation: 15,
      sampleSize: 25,
      confidenceLevel: '100',
    });
    expect(result.lowerBound).toBeNull();
  });

  it('negative mean works correctly', () => {
    const result = calculateConfidenceInterval({
      sampleMean: -20,
      standardDeviation: 5,
      sampleSize: 50,
      confidenceLevel: '95',
    });
    expect(Number(result.lowerBound)).toBeLessThan(-20);
    expect(Number(result.upperBound)).toBeGreaterThan(-20);
    expect(result.sampleMean).toBe(-20);
  });

  // ═══════════════════════════════════════════════════════
  // Interval width = 2 × margin of error
  // ═══════════════════════════════════════════════════════

  it('interval width equals 2x margin of error', () => {
    const result = calculateConfidenceInterval({
      sampleMean: 100,
      standardDeviation: 15,
      sampleSize: 25,
      confidenceLevel: '95',
    });
    expect(result.intervalWidth).toBeCloseTo(Number(result.marginOfError) * 2, 4);
  });

  it('CI is symmetric around the mean', () => {
    const result = calculateConfidenceInterval({
      sampleMean: 100,
      standardDeviation: 15,
      sampleSize: 25,
      confidenceLevel: '95',
    });
    const midpoint = (Number(result.lowerBound) + Number(result.upperBound)) / 2;
    expect(midpoint).toBeCloseTo(100, 4);
  });
});
