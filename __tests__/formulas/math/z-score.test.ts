import { calculateZScore } from '@/lib/formulas/math/z-score';

describe('calculateZScore', () => {
  // ═══════════════════════════════════════════════════════
  // Calculate Z Mode: z = (x - μ) / σ
  // ═══════════════════════════════════════════════════════

  it('calculates z-score for value at the mean (z=0)', () => {
    const result = calculateZScore({ mode: 'calculate-z', value: 100, mean: 100, standardDeviation: 15 });
    expect(result.zScore).toBeCloseTo(0, 4);
    expect(result.percentile).toBeCloseTo(50, 0);
  });

  it('calculates z-score one standard deviation above mean (z=1)', () => {
    const result = calculateZScore({ mode: 'calculate-z', value: 115, mean: 100, standardDeviation: 15 });
    expect(result.zScore).toBeCloseTo(1, 4);
    expect(result.cumulativeProbability).toBeCloseTo(0.8413, 2);
    expect(result.percentile).toBeCloseTo(84.13, 0);
  });

  it('calculates z-score one SD below mean (z=-1)', () => {
    const result = calculateZScore({ mode: 'calculate-z', value: 85, mean: 100, standardDeviation: 15 });
    expect(result.zScore).toBeCloseTo(-1, 4);
    expect(result.cumulativeProbability).toBeCloseTo(0.1587, 2);
  });

  it('calculates z-score two SDs above mean (z=2)', () => {
    const result = calculateZScore({ mode: 'calculate-z', value: 130, mean: 100, standardDeviation: 15 });
    expect(result.zScore).toBeCloseTo(2, 4);
    expect(result.cumulativeProbability).toBeCloseTo(0.9772, 2);
  });

  it('calculates z-score for IQ test (value=145, μ=100, σ=15)', () => {
    const result = calculateZScore({ mode: 'calculate-z', value: 145, mean: 100, standardDeviation: 15 });
    expect(result.zScore).toBeCloseTo(3, 4);
    expect(result.percentile).toBeCloseTo(99.87, 0);
  });

  it('calculates z-score for SAT (value=1200, μ=1059, σ=210)', () => {
    const result = calculateZScore({ mode: 'calculate-z', value: 1200, mean: 1059, standardDeviation: 210 });
    expect(result.zScore).toBeCloseTo(0.6714, 2);
  });

  it('calculates negative z-score', () => {
    const result = calculateZScore({ mode: 'calculate-z', value: 70, mean: 100, standardDeviation: 15 });
    expect(result.zScore).toBeCloseTo(-2, 4);
    expect(result.cumulativeProbability).toBeCloseTo(0.0228, 2);
  });

  // ═══════════════════════════════════════════════════════
  // Calculate X Mode: x = μ + z × σ
  // ═══════════════════════════════════════════════════════

  it('calculates value from z=0 (returns the mean)', () => {
    const result = calculateZScore({ mode: 'calculate-x', zScore: 0, mean: 100, standardDeviation: 15 });
    expect(result.value).toBeCloseTo(100, 4);
  });

  it('calculates value from z=1 (one SD above mean)', () => {
    const result = calculateZScore({ mode: 'calculate-x', zScore: 1, mean: 100, standardDeviation: 15 });
    expect(result.value).toBeCloseTo(115, 4);
  });

  it('calculates value from z=-2 (two SDs below mean)', () => {
    const result = calculateZScore({ mode: 'calculate-x', zScore: -2, mean: 100, standardDeviation: 15 });
    expect(result.value).toBeCloseTo(70, 4);
  });

  it('calculates 95th percentile value (z≈1.645)', () => {
    const result = calculateZScore({ mode: 'calculate-x', zScore: 1.645, mean: 100, standardDeviation: 15 });
    expect(result.value).toBeCloseTo(124.675, 2);
  });

  // ═══════════════════════════════════════════════════════
  // Cumulative Probability & Percentile
  // ═══════════════════════════════════════════════════════

  it('z=0 gives 50th percentile', () => {
    const result = calculateZScore({ mode: 'calculate-z', value: 100, mean: 100, standardDeviation: 15 });
    expect(result.cumulativeProbability).toBeCloseTo(0.5, 4);
    expect(result.probabilityAbove).toBeCloseTo(0.5, 4);
  });

  it('z=1.96 gives ~97.5th percentile', () => {
    const result = calculateZScore({ mode: 'calculate-z', value: 129.4, mean: 100, standardDeviation: 15 });
    expect(result.zScore).toBeCloseTo(1.96, 1);
    expect(result.cumulativeProbability).toBeCloseTo(0.975, 1);
  });

  it('probabilityAbove = 1 - cumulativeProbability', () => {
    const result = calculateZScore({ mode: 'calculate-z', value: 115, mean: 100, standardDeviation: 15 });
    const cumProb = result.cumulativeProbability as number;
    const probAbove = result.probabilityAbove as number;
    expect(cumProb + probAbove).toBeCloseTo(1, 4);
  });

  // ═══════════════════════════════════════════════════════
  // Round-Trip Consistency
  // ═══════════════════════════════════════════════════════

  it('calculate-z then calculate-x returns original value', () => {
    const zResult = calculateZScore({ mode: 'calculate-z', value: 120, mean: 100, standardDeviation: 15 });
    const xResult = calculateZScore({ mode: 'calculate-x', zScore: zResult.zScore, mean: 100, standardDeviation: 15 });
    expect(xResult.value).toBeCloseTo(120, 2);
  });

  // ═══════════════════════════════════════════════════════
  // Error Cases
  // ═══════════════════════════════════════════════════════

  it('throws for invalid mode', () => {
    expect(() => calculateZScore({ mode: 'invalid', value: 100, mean: 100, standardDeviation: 15 })).toThrow('Mode must be either "calculate-z" or "calculate-x".');
  });

  it('throws when mean is missing', () => {
    expect(() => calculateZScore({ mode: 'calculate-z', value: 100, standardDeviation: 15 })).toThrow('Mean (μ) is required.');
  });

  it('throws when standard deviation is zero', () => {
    expect(() => calculateZScore({ mode: 'calculate-z', value: 100, mean: 100, standardDeviation: 0 })).toThrow('Standard deviation (σ) must be a positive number.');
  });

  it('throws when standard deviation is negative', () => {
    expect(() => calculateZScore({ mode: 'calculate-z', value: 100, mean: 100, standardDeviation: -5 })).toThrow('Standard deviation (σ) must be a positive number.');
  });

  it('throws when value missing in calculate-z mode', () => {
    expect(() => calculateZScore({ mode: 'calculate-z', mean: 100, standardDeviation: 15 })).toThrow('Value (x) is required');
  });

  it('throws when zScore missing in calculate-x mode', () => {
    expect(() => calculateZScore({ mode: 'calculate-x', mean: 100, standardDeviation: 15 })).toThrow('Z-score is required');
  });

  // ═══════════════════════════════════════════════════════
  // Defaults & String Inputs
  // ═══════════════════════════════════════════════════════

  it('defaults to calculate-z mode', () => {
    const result = calculateZScore({ value: 115, mean: 100, standardDeviation: 15 });
    expect(result.mode).toBe('calculate-z');
    expect(result.zScore).toBeCloseTo(1, 4);
  });

  it('handles string inputs', () => {
    const result = calculateZScore({ mode: 'calculate-z', value: '115', mean: '100', standardDeviation: '15' });
    expect(result.zScore).toBeCloseTo(1, 4);
  });
});
