import { calculateBMI } from '@/lib/formulas/health/bmi';

describe('calculateBMI', () => {
  // Standard metric cases
  it('calculates normal BMI for average adult (metric)', () => {
    const result = calculateBMI({ weight: 70, height: 175, unitSystem: 'metric' });
    // 70 / (1.75)² = 70 / 3.0625 = 22.9
    expect(result.bmi).toBeCloseTo(22.9, 1);
    expect(result.category).toBe('Normal Weight');
  });

  it('calculates overweight BMI (metric)', () => {
    const result = calculateBMI({ weight: 85, height: 175, unitSystem: 'metric' });
    // 85 / 3.0625 = 27.8
    expect(result.bmi).toBeCloseTo(27.8, 1);
    expect(result.category).toBe('Overweight');
  });

  it('calculates obese class I BMI (metric)', () => {
    const result = calculateBMI({ weight: 100, height: 175, unitSystem: 'metric' });
    // 100 / 3.0625 = 32.7
    expect(result.bmi).toBeCloseTo(32.7, 0);
    expect(result.category).toBe('Obese Class I');
  });

  it('calculates underweight BMI (metric)', () => {
    const result = calculateBMI({ weight: 50, height: 175, unitSystem: 'metric' });
    // 50 / 3.0625 = 16.3
    expect(result.bmi).toBeCloseTo(16.3, 1);
    expect(result.category).toBe('Moderately Underweight');
  });

  it('calculates severely underweight BMI (metric)', () => {
    const result = calculateBMI({ weight: 40, height: 175, unitSystem: 'metric' });
    // 40 / 3.0625 = 13.1
    expect(result.bmi).toBeCloseTo(13.1, 0);
    expect(result.category).toBe('Severely Underweight');
  });

  it('calculates obese class III BMI (metric)', () => {
    const result = calculateBMI({ weight: 130, height: 170, unitSystem: 'metric' });
    // 130 / (1.70)² = 130 / 2.89 = 44.98
    expect(result.bmi).toBeCloseTo(45.0, 0);
    expect(result.category).toBe('Obese Class III');
  });

  // Imperial cases
  it('calculates normal BMI (imperial)', () => {
    const result = calculateBMI({ weight: 154, height: 69, unitSystem: 'imperial' });
    // 703 * 154 / (69)² = 108262 / 4761 = 22.7
    expect(result.bmi).toBeCloseTo(22.7, 0);
    expect(result.category).toBe('Normal Weight');
  });

  it('calculates overweight BMI (imperial)', () => {
    const result = calculateBMI({ weight: 200, height: 70, unitSystem: 'imperial' });
    // 703 * 200 / 4900 = 28.7
    expect(result.bmi).toBeCloseTo(28.7, 0);
    expect(result.category).toBe('Overweight');
  });

  // Healthy weight range
  it('returns correct healthy weight range (metric)', () => {
    const result = calculateBMI({ weight: 70, height: 175, unitSystem: 'metric' });
    // For 1.75m: min = 18.5 * 3.0625 = 56.7, max = 24.9 * 3.0625 = 76.3
    expect(result.healthyWeightRange.min).toBeCloseTo(56.7, 0);
    expect(result.healthyWeightRange.max).toBeCloseTo(76.3, 0);
  });

  it('returns correct healthy weight range (imperial)', () => {
    const result = calculateBMI({ weight: 154, height: 69, unitSystem: 'imperial' });
    // Height 69in = 175.26cm = 1.7526m
    // min = 18.5 * (1.7526)² / 0.453592 = 125.3 lbs
    // max = 24.9 * (1.7526)² / 0.453592 = 168.7 lbs
    expect(result.healthyWeightRange.min).toBeGreaterThan(120);
    expect(result.healthyWeightRange.max).toBeLessThan(175);
  });

  // BMI Prime
  it('calculates BMI Prime ratio correctly', () => {
    const result = calculateBMI({ weight: 70, height: 175, unitSystem: 'metric' });
    // BMI ~22.9, Prime = 22.9 / 25 = 0.916
    expect(result.primeRatio).toBeCloseTo(0.92, 1);
  });

  // Ponderal Index
  it('calculates ponderal index correctly', () => {
    const result = calculateBMI({ weight: 70, height: 175, unitSystem: 'metric' });
    // PI = 70 / (1.75)³ = 70 / 5.359 = 13.1
    expect(result.ponderal).toBeCloseTo(13.1, 0);
  });

  // Edge cases
  it('handles very short person', () => {
    const result = calculateBMI({ weight: 45, height: 140, unitSystem: 'metric' });
    // 45 / (1.40)² = 45 / 1.96 = 22.96
    expect(result.bmi).toBeCloseTo(23.0, 0);
    expect(result.category).toBe('Normal Weight');
  });

  it('handles very tall person', () => {
    const result = calculateBMI({ weight: 90, height: 200, unitSystem: 'metric' });
    // 90 / (2.0)² = 90 / 4 = 22.5
    expect(result.bmi).toBeCloseTo(22.5, 1);
    expect(result.category).toBe('Normal Weight');
  });

  // Category boundary tests
  it('classifies BMI of exactly 18.5 as Normal Weight', () => {
    // height = 180cm = 1.80m, weight = 18.5 * 3.24 = 59.94
    // Use 60.0 to ensure we're solidly at 18.5+ (60/3.24 = 18.52)
    const result = calculateBMI({ weight: 60.0, height: 180, unitSystem: 'metric' });
    expect(result.category).toBe('Normal Weight');
  });

  it('classifies BMI of exactly 25.0 as Overweight', () => {
    // height = 180cm, weight = 25 * 3.24 = 81.0
    const result = calculateBMI({ weight: 81.0, height: 180, unitSystem: 'metric' });
    expect(result.category).toBe('Overweight');
  });

  // ─── Edge case: height = 0 (division by zero guard) ───
  it('returns error when height is zero', () => {
    const result = calculateBMI({ weight: 70, height: 0, unitSystem: 'metric' });
    expect(result.error).toBe('Height must be greater than zero');
    expect(result.bmi).toBe(0);
    expect(result.category).toBe('Invalid');
  });

  // ─── Edge case: weight = 0 ───
  it('returns error when weight is zero', () => {
    const result = calculateBMI({ weight: 0, height: 175, unitSystem: 'metric' });
    expect(result.error).toBe('Weight must be greater than zero');
    expect(result.bmi).toBe(0);
    expect(result.category).toBe('Invalid');
  });

  // ─── Edge case: negative height ───
  it('returns error when height is negative', () => {
    const result = calculateBMI({ weight: 70, height: -10, unitSystem: 'metric' });
    expect(result.error).toBe('Height must be greater than zero');
    expect(result.bmi).toBe(0);
  });

  // ─── Edge case: both zero (imperial) ───
  it('returns error when both height and weight are zero (imperial)', () => {
    const result = calculateBMI({ weight: 0, height: 0, unitSystem: 'imperial' });
    expect(result.error).toBeDefined();
    expect(result.bmi).toBe(0);
    expect(result.category).toBe('Invalid');
  });
});
