import { calculateStandardError } from '@/lib/formulas/math/standard-error';

describe('calculateStandardError', () => {
  // ═══════════════════════════════════════════════════════
  // Summary Mode — Core SE Calculation
  // ═══════════════════════════════════════════════════════

  it('calculates SE with default values (s=15, n=30, mean=100)', () => {
    const result = calculateStandardError({ sampleStdDev: 15, sampleSize: 30, sampleMean: 100 });
    // SE = 15 / √30 = 15 / 5.4772 = 2.7386
    expect(result.standardError).toBeCloseTo(2.7386, 3);
    expect(result.sampleSize).toBe(30);
    expect(result.standardDeviation).toBe(15);
    expect(result.mean).toBe(100);
  });

  it('SE = σ/√n verification (s=10, n=25)', () => {
    const result = calculateStandardError({ sampleStdDev: 10, sampleSize: 25, sampleMean: 50 });
    // SE = 10 / √25 = 10 / 5 = 2.0
    expect(result.standardError).toBeCloseTo(2.0, 6);
  });

  it('SE = σ/√n with perfect square n (s=20, n=100)', () => {
    const result = calculateStandardError({ sampleStdDev: 20, sampleSize: 100, sampleMean: 500 });
    // SE = 20 / √100 = 20 / 10 = 2.0
    expect(result.standardError).toBeCloseTo(2.0, 6);
  });

  it('large sample size reduces SE significantly (n=10000)', () => {
    const result = calculateStandardError({ sampleStdDev: 15, sampleSize: 10000, sampleMean: 100 });
    // SE = 15 / √10000 = 15 / 100 = 0.15
    expect(result.standardError).toBeCloseTo(0.15, 6);
  });

  it('small sample size n=2 gives large SE', () => {
    const result = calculateStandardError({ sampleStdDev: 10, sampleSize: 2, sampleMean: 50 });
    // SE = 10 / √2 = 7.0711
    expect(result.standardError).toBeCloseTo(7.0711, 3);
  });

  it('zero standard deviation gives SE = 0', () => {
    const result = calculateStandardError({ sampleStdDev: 0, sampleSize: 30, sampleMean: 100 });
    expect(result.standardError).toBe(0);
    expect(result.marginOfError95).toBe(0);
  });

  // ═══════════════════════════════════════════════════════
  // Margin of Error (95% CI) = 1.96 × SE
  // ═══════════════════════════════════════════════════════

  it('margin of error = 1.96 × SE', () => {
    const result = calculateStandardError({ sampleStdDev: 10, sampleSize: 25, sampleMean: 50 });
    const se = result.standardError as number;
    const me = result.marginOfError95 as number;
    expect(me).toBeCloseTo(1.96 * se, 4);
  });

  it('confidence interval bounds are symmetric around mean', () => {
    const result = calculateStandardError({ sampleStdDev: 15, sampleSize: 30, sampleMean: 100 });
    const me = result.marginOfError95 as number;
    const lower = result.confidenceIntervalLower as number;
    const upper = result.confidenceIntervalUpper as number;
    expect(lower).toBeCloseTo(100 - me, 3);
    expect(upper).toBeCloseTo(100 + me, 3);
  });

  it('CI with default values: [94.63, 105.37] approx', () => {
    const result = calculateStandardError({ sampleStdDev: 15, sampleSize: 30, sampleMean: 100 });
    // SE ≈ 2.7386, ME ≈ 5.368
    expect(result.confidenceIntervalLower).toBeCloseTo(94.63, 0);
    expect(result.confidenceIntervalUpper).toBeCloseTo(105.37, 0);
  });

  // ═══════════════════════════════════════════════════════
  // Relative SE
  // ═══════════════════════════════════════════════════════

  it('relative SE = (SE / |mean|) × 100', () => {
    const result = calculateStandardError({ sampleStdDev: 10, sampleSize: 25, sampleMean: 50 });
    // SE = 2.0, relative = (2.0 / 50) × 100 = 4.0%
    expect(result.relativeSE).toBeCloseTo(4.0, 2);
  });

  it('relative SE is null when mean = 0', () => {
    const result = calculateStandardError({ sampleStdDev: 10, sampleSize: 25, sampleMean: 0 });
    expect(result.relativeSE).toBeNull();
  });

  it('relative SE uses absolute value of negative mean', () => {
    const result = calculateStandardError({ sampleStdDev: 10, sampleSize: 25, sampleMean: -50 });
    // SE = 2.0, relative = (2.0 / 50) × 100 = 4.0%
    expect(result.relativeSE).toBeCloseTo(4.0, 2);
  });

  // ═══════════════════════════════════════════════════════
  // Data Mode — Parse & Calculate
  // ═══════════════════════════════════════════════════════

  it('data mode: calculates from comma-separated values', () => {
    const result = calculateStandardError({ mode: 'data', dataInput: '10, 12, 14, 16, 18' });
    // mean = 14, sample std dev = √(Σ(xi-14)²/4) = √(40/4) = √10 ≈ 3.1623
    // SE = 3.1623 / √5 ≈ 1.4142
    expect(result.mean).toBeCloseTo(14, 4);
    expect(result.standardDeviation).toBeCloseTo(3.1623, 3);
    expect(result.standardError).toBeCloseTo(1.4142, 3);
    expect(result.sampleSize).toBe(5);
  });

  it('data mode: known dataset [2, 4, 4, 4, 5, 5, 7, 9]', () => {
    const result = calculateStandardError({ mode: 'data', dataInput: '2, 4, 4, 4, 5, 5, 7, 9' });
    // mean = 5, sample variance = Σ(xi-5)²/7 = 32/7 ≈ 4.5714
    // sample std dev ≈ 2.1381, SE = 2.1381 / √8 ≈ 0.7559
    expect(result.mean).toBeCloseTo(5, 4);
    expect(result.sampleSize).toBe(8);
    expect(result.standardError).toBeCloseTo(0.7559, 3);
  });

  it('data mode: two data points', () => {
    const result = calculateStandardError({ mode: 'data', dataInput: '10, 20' });
    // mean = 15, sample variance = (10-15)² + (20-15)² / 1 = 50
    // sample std dev = √50 ≈ 7.0711, SE = 7.0711 / √2 ≈ 5.0
    expect(result.mean).toBeCloseTo(15, 4);
    expect(result.standardError).toBeCloseTo(5.0, 3);
  });

  it('data mode: identical values give SE = 0', () => {
    const result = calculateStandardError({ mode: 'data', dataInput: '5, 5, 5, 5, 5' });
    expect(result.standardDeviation).toBeCloseTo(0, 6);
    expect(result.standardError).toBeCloseTo(0, 6);
  });

  // ═══════════════════════════════════════════════════════
  // Error Cases
  // ═══════════════════════════════════════════════════════

  it('throws for single data point', () => {
    expect(() => calculateStandardError({ mode: 'data', dataInput: '42' })).toThrow('At least 2 data points required.');
  });

  it('throws for empty data input', () => {
    expect(() => calculateStandardError({ mode: 'data', dataInput: '' })).toThrow('At least 2 data points required.');
  });

  it('throws for negative standard deviation in summary mode', () => {
    expect(() => calculateStandardError({ sampleStdDev: -5, sampleSize: 30 })).toThrow('Standard deviation must be non-negative.');
  });

  it('throws for sample size less than 2', () => {
    expect(() => calculateStandardError({ sampleStdDev: 10, sampleSize: 1 })).toThrow('Sample size must be at least 2.');
  });

  it('throws when sample std dev is missing', () => {
    expect(() => calculateStandardError({ sampleSize: 30, sampleMean: 100 })).toThrow('Sample standard deviation is required.');
  });

  it('throws when sample size is missing', () => {
    expect(() => calculateStandardError({ sampleStdDev: 15, sampleMean: 100 })).toThrow('Sample size is required.');
  });

  it('throws for invalid mode', () => {
    expect(() => calculateStandardError({ mode: 'invalid' })).toThrow('Mode must be either "summary" or "data".');
  });

  // ═══════════════════════════════════════════════════════
  // Output Structure
  // ═══════════════════════════════════════════════════════

  it('returns all expected output fields in summary mode', () => {
    const result = calculateStandardError({ sampleStdDev: 15, sampleSize: 30, sampleMean: 100 });
    expect(result).toHaveProperty('standardError');
    expect(result).toHaveProperty('sampleSize');
    expect(result).toHaveProperty('standardDeviation');
    expect(result).toHaveProperty('mean');
    expect(result).toHaveProperty('marginOfError95');
    expect(result).toHaveProperty('confidenceIntervalLower');
    expect(result).toHaveProperty('confidenceIntervalUpper');
    expect(result).toHaveProperty('relativeSE');
    expect(result).toHaveProperty('mode');
    expect(result).toHaveProperty('allValues');
    expect(result).toHaveProperty('breakdown');
    expect(result.mode).toBe('summary');
  });

  it('returns all expected output fields in data mode', () => {
    const result = calculateStandardError({ mode: 'data', dataInput: '10, 20, 30' });
    expect(result).toHaveProperty('standardError');
    expect(result).toHaveProperty('sampleSize');
    expect(result).toHaveProperty('standardDeviation');
    expect(result).toHaveProperty('mean');
    expect(result).toHaveProperty('marginOfError95');
    expect(result).toHaveProperty('confidenceIntervalLower');
    expect(result).toHaveProperty('confidenceIntervalUpper');
    expect(result).toHaveProperty('allValues');
    expect(result).toHaveProperty('breakdown');
    expect(result.mode).toBe('data');
  });

  it('breakdown includes step-by-step entries', () => {
    const result = calculateStandardError({ sampleStdDev: 15, sampleSize: 30, sampleMean: 100 });
    const breakdown = result.breakdown as { step: string; expression: string }[];
    expect(breakdown.length).toBeGreaterThanOrEqual(4);
    expect(breakdown.find(b => b.step === 'Formula')).toBeDefined();
    expect(breakdown.find(b => b.step === 'Result')).toBeDefined();
  });

  // ═══════════════════════════════════════════════════════
  // Defaults & String Inputs
  // ═══════════════════════════════════════════════════════

  it('defaults to summary mode', () => {
    const result = calculateStandardError({ sampleStdDev: 15, sampleSize: 30, sampleMean: 100 });
    expect(result.mode).toBe('summary');
  });

  it('defaults sampleMean to 0 when not provided', () => {
    const result = calculateStandardError({ sampleStdDev: 10, sampleSize: 25 });
    expect(result.mean).toBe(0);
  });

  it('handles string inputs', () => {
    const result = calculateStandardError({ sampleStdDev: '15', sampleSize: '30', sampleMean: '100' });
    expect(result.standardError).toBeCloseTo(2.7386, 3);
  });
});
