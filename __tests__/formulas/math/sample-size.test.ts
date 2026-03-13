import { calculateSampleSize } from '@/lib/formulas/math/sample-size';

describe('calculateSampleSize', () => {
  // ═══════════════════════════════════════════════════════
  // Standard Cases
  // ═══════════════════════════════════════════════════════

  it('calculates standard survey (95% CI, 5% MOE, 50% proportion)', () => {
    const result = calculateSampleSize({ confidenceLevel: '95', marginOfError: 5, proportion: 50 });
    // n = (1.96² × 0.5 × 0.5) / 0.05² = 384.16 → 385
    expect(result.sampleSize).toBe(385);
  });

  it('calculates 99% confidence, 5% MOE', () => {
    const result = calculateSampleSize({ confidenceLevel: '99', marginOfError: 5, proportion: 50 });
    // n = (2.576² × 0.25) / 0.0025 = 663.58 → 664
    expect(result.sampleSize).toBe(664);
  });

  it('calculates 90% confidence, 5% MOE', () => {
    const result = calculateSampleSize({ confidenceLevel: '90', marginOfError: 5, proportion: 50 });
    // n = (1.645² × 0.25) / 0.0025 = 270.60 → 271
    expect(result.sampleSize).toBe(271);
  });

  it('calculates with 3% margin of error (tighter precision)', () => {
    const result = calculateSampleSize({ confidenceLevel: '95', marginOfError: 3, proportion: 50 });
    // n = (1.96² × 0.25) / 0.0009 = 1067.11 → 1068
    expect(result.sampleSize).toBe(1068);
  });

  it('calculates with 1% margin of error (very tight)', () => {
    const result = calculateSampleSize({ confidenceLevel: '95', marginOfError: 1, proportion: 50 });
    // n = (3.8416 × 0.25) / 0.0001 = 9604 → 9604
    expect(result.sampleSize).toBe(9604);
  });

  // ═══════════════════════════════════════════════════════
  // Non-50% Proportions
  // ═══════════════════════════════════════════════════════

  it('smaller sample when proportion is skewed (10%)', () => {
    const result = calculateSampleSize({ confidenceLevel: '95', marginOfError: 5, proportion: 10 });
    // n = (1.96² × 0.1 × 0.9) / 0.0025 = 138.30 → 139
    expect(result.sampleSize).toBe(139);
  });

  it('50% proportion gives maximum sample size', () => {
    const at50 = calculateSampleSize({ confidenceLevel: '95', marginOfError: 5, proportion: 50 });
    const at20 = calculateSampleSize({ confidenceLevel: '95', marginOfError: 5, proportion: 20 });
    expect(at50.sampleSize).toBeGreaterThan(at20.sampleSize as number);
  });

  it('proportion of 80% gives same as 20% (p(1-p) is symmetric)', () => {
    const at20 = calculateSampleSize({ confidenceLevel: '95', marginOfError: 5, proportion: 20 });
    const at80 = calculateSampleSize({ confidenceLevel: '95', marginOfError: 5, proportion: 80 });
    expect(at20.sampleSize).toBe(at80.sampleSize);
  });

  // ═══════════════════════════════════════════════════════
  // Finite Population Correction
  // ═══════════════════════════════════════════════════════

  it('applies finite population correction (N=1000)', () => {
    const result = calculateSampleSize({ confidenceLevel: '95', marginOfError: 5, proportion: 50, populationSize: 1000 });
    expect(result.adjustedSampleSize).toBeLessThan(result.sampleSize as number);
    // n_adj = 385 / (1 + 384/1000) = 385 / 1.384 ≈ 278 → 279
    expect(result.adjustedSampleSize).toBeCloseTo(278, -1);
  });

  it('finite correction minimal for large populations (N=1000000)', () => {
    const result = calculateSampleSize({ confidenceLevel: '95', marginOfError: 5, proportion: 50, populationSize: 1000000 });
    // Very large population → adjusted ≈ unadjusted
    expect(result.adjustedSampleSize).toBeCloseTo(result.sampleSize as number, -1);
  });

  it('finite correction significant for small populations (N=200)', () => {
    const result = calculateSampleSize({ confidenceLevel: '95', marginOfError: 5, proportion: 50, populationSize: 200 });
    expect(result.adjustedSampleSize).toBeLessThan(200);
  });

  it('returns null adjustedSampleSize when no population given', () => {
    const result = calculateSampleSize({ confidenceLevel: '95', marginOfError: 5 });
    expect(result.adjustedSampleSize).toBeNull();
    expect(result.populationSize).toBeNull();
  });

  // ═══════════════════════════════════════════════════════
  // Z-Score Values
  // ═══════════════════════════════════════════════════════

  it('uses correct z-score for 80% confidence', () => {
    const result = calculateSampleSize({ confidenceLevel: '80', marginOfError: 5, proportion: 50 });
    expect(result.zScore).toBeCloseTo(1.28155, 3);
  });

  it('uses correct z-score for 95% confidence', () => {
    const result = calculateSampleSize({ confidenceLevel: '95', marginOfError: 5, proportion: 50 });
    expect(result.zScore).toBeCloseTo(1.95996, 3);
  });

  it('uses correct z-score for 99.9% confidence', () => {
    const result = calculateSampleSize({ confidenceLevel: '99.9', marginOfError: 5, proportion: 50 });
    expect(result.zScore).toBeCloseTo(3.29053, 3);
  });

  // ═══════════════════════════════════════════════════════
  // Breakdown Structure
  // ═══════════════════════════════════════════════════════

  it('includes finite correction steps when population provided', () => {
    const result = calculateSampleSize({ confidenceLevel: '95', marginOfError: 5, proportion: 50, populationSize: 1000 });
    const breakdown = result.breakdown as { step: string; expression: string }[];
    expect(breakdown.find(b => b.step === 'Finite correction')).toBeDefined();
  });

  it('does not include finite correction when no population', () => {
    const result = calculateSampleSize({ confidenceLevel: '95', marginOfError: 5, proportion: 50 });
    const breakdown = result.breakdown as { step: string; expression: string }[];
    expect(breakdown.find(b => b.step === 'Finite correction')).toBeUndefined();
  });

  // ═══════════════════════════════════════════════════════
  // Error Cases
  // ═══════════════════════════════════════════════════════

  it('throws for unsupported confidence level', () => {
    expect(() => calculateSampleSize({ confidenceLevel: '50', marginOfError: 5 })).toThrow('Unsupported confidence level');
  });

  it('throws for zero margin of error', () => {
    expect(() => calculateSampleSize({ confidenceLevel: '95', marginOfError: 0 })).toThrow('Margin of error must be between 0 and 100');
  });

  it('throws for MOE >= 100', () => {
    expect(() => calculateSampleSize({ confidenceLevel: '95', marginOfError: 100 })).toThrow('Margin of error must be between 0 and 100');
  });

  it('throws for negative margin of error', () => {
    expect(() => calculateSampleSize({ confidenceLevel: '95', marginOfError: -5 })).toThrow('Margin of error must be between 0 and 100');
  });

  it('throws for proportion = 0', () => {
    expect(() => calculateSampleSize({ confidenceLevel: '95', marginOfError: 5, proportion: 0 })).toThrow('Population proportion must be between 0 and 100');
  });

  it('throws for population size < 1', () => {
    expect(() => calculateSampleSize({ confidenceLevel: '95', marginOfError: 5, populationSize: 0 })).toThrow('Population size must be at least 1.');
  });

  // ═══════════════════════════════════════════════════════
  // Defaults & String Inputs
  // ═══════════════════════════════════════════════════════

  it('defaults to 95% confidence, 50% proportion', () => {
    const result = calculateSampleSize({ marginOfError: 5 });
    expect(result.confidenceLevel).toBe(95);
    expect(result.proportion).toBe(50);
  });

  it('handles confidence level with % sign', () => {
    const result = calculateSampleSize({ confidenceLevel: '95%', marginOfError: 5 });
    expect(result.sampleSize).toBe(385);
  });

  it('handles string inputs', () => {
    const result = calculateSampleSize({ confidenceLevel: '95', marginOfError: '5', proportion: '50' });
    expect(result.sampleSize).toBe(385);
  });
});
