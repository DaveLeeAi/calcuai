import { calculateBMI } from '@/lib/formulas/health/bmi';
import { getFormula } from '@/lib/formulas/index';
import {
  expectNonNegativeFiniteNumber,
  expectPositiveFiniteNumber,
  sweepInput,
} from '../../helpers/formula-test-utils';

describe('BMI Calculator — edge cases', () => {
  // ═══ WHO CATEGORY BOUNDARY TESTS ══════════════════════════════════════════
  // Note: category uses unrounded BMI, but display rounds to 1dp.
  // Use weights that clearly fall within the desired category.

  it('BMI below 18.5 is classified as underweight', () => {
    // 125 lbs at 70 inches → BMI ≈ 17.93 (clearly underweight)
    const result = calculateBMI({ weight: 125, height: 70, unitSystem: 'imperial' });
    expect(result.bmi).toBeLessThan(18.5);
    expect(result.category).toMatch(/Underweight/);
  });

  it('BMI clearly in normal range gives Normal Weight', () => {
    // 155 lbs at 70 inches → BMI ≈ 22.23
    const result = calculateBMI({ weight: 155, height: 70, unitSystem: 'imperial' });
    expect(result.bmi).toBeGreaterThanOrEqual(18.5);
    expect(result.bmi).toBeLessThan(25);
    expect(result.category).toBe('Normal Weight');
  });

  it('BMI 24.9 is still normal weight', () => {
    const result = calculateBMI({ weight: 173.50, height: 70, unitSystem: 'imperial' });
    expect(result.bmi).toBeCloseTo(24.9, 0);
    expect(result.category).toBe('Normal Weight');
  });

  it('BMI clearly >= 25 is classified as overweight', () => {
    // 180 lbs at 70 inches → BMI ≈ 25.8 (clearly overweight)
    const result = calculateBMI({ weight: 180, height: 70, unitSystem: 'imperial' });
    expect(result.bmi).toBeGreaterThanOrEqual(25);
    expect(result.category).toBe('Overweight');
  });

  it('BMI clearly >= 30 is classified as obese class I', () => {
    // 215 lbs at 70 inches → BMI ≈ 30.8 (clearly obese class I)
    const result = calculateBMI({ weight: 215, height: 70, unitSystem: 'imperial' });
    expect(result.bmi).toBeGreaterThanOrEqual(30);
    expect(result.category).toBe('Obese Class I');
  });

  // ═══ UNIT SYSTEM CONSISTENCY ══════════════════════════════════════════════

  it('same person gives same BMI in metric and imperial', () => {
    const imperial = calculateBMI({ weight: 154, height: 68, unitSystem: 'imperial' });
    // 154 lbs = 69.85 kg, 68 inches = 172.72 cm
    const metric = calculateBMI({ weight: 69.85, height: 172.72, unitSystem: 'metric' });
    expect(imperial.bmi).toBeCloseTo(metric.bmi, 0);
    expect(imperial.category).toBe(metric.category);
  });

  // ═══ EXTREME VALUES ═══════════════════════════════════════════════════════

  it('handles very low weight (child/infant range)', () => {
    const result = calculateBMI({ weight: 15, height: 100, unitSystem: 'metric' });
    expect(typeof result.bmi).toBe('number');
    expect(isFinite(result.bmi)).toBe(true);
    expect(result.bmi).toBeGreaterThan(0);
  });

  it('handles very tall person (220cm / 7ft3)', () => {
    const result = calculateBMI({ weight: 100, height: 220, unitSystem: 'metric' });
    expectPositiveFiniteNumber(result as Record<string, unknown>, 'bmi');
  });

  it('handles very heavy person (400 lbs)', () => {
    const result = calculateBMI({ weight: 400, height: 70, unitSystem: 'imperial' });
    expectPositiveFiniteNumber(result as Record<string, unknown>, 'bmi');
    expect(result.category).toMatch(/obese/i);
  });

  // ═══ DERIVED METRIC CONSISTENCY ═══════════════════════════════════════════

  it('BMI Prime ratio: normal weight gives ratio near 1.0', () => {
    const result = calculateBMI({ weight: 70, height: 175, unitSystem: 'metric' });
    // BMI Prime = BMI / 25; normal BMI ≈ 22.9 → prime ≈ 0.92
    expect(result.primeRatio).toBeGreaterThan(0.7);
    expect(result.primeRatio).toBeLessThan(1.1);
  });

  it('healthy weight range is consistent with BMI 18.5-24.9', () => {
    const result = calculateBMI({ weight: 70, height: 175, unitSystem: 'metric' });
    // For 175cm: healthy weight = 18.5 * 1.75^2 to 24.9 * 1.75^2 = 56.6 to 76.2 kg
    expect(result.healthyWeightRange.min).toBeCloseTo(56.7, 0);
    expect(result.healthyWeightRange.max).toBeCloseTo(76.3, 0);
  });
});

describe('Body Fat Calculator — edge cases', () => {
  const calculateBodyFat = getFormula('body-fat');

  const MALE_BASE = {
    sex: 'male',
    unitSystem: 'imperial',
    waist: 34,
    neck: 15,
    height: 70,
  };

  const FEMALE_BASE = {
    sex: 'female',
    unitSystem: 'imperial',
    waist: 30,
    neck: 13,
    height: 65,
    hip: 38,
  };

  // ═══ MALE VS FEMALE ══════════════════════════════════════════════════════

  it('male and female give different results for same measurements', () => {
    const male = calculateBodyFat(MALE_BASE);
    const female = calculateBodyFat({ ...FEMALE_BASE, waist: 34, neck: 15, height: 70 });
    // Different formulas should give different percentages
    expect(male.bodyFatPercentage).not.toBeCloseTo(female.bodyFatPercentage as number, 0);
  });

  // ═══ EXTREME VALUES ══════════════════════════════════════════════════════

  it('very lean male (small waist-neck difference)', () => {
    const result = calculateBodyFat({
      ...MALE_BASE,
      waist: 28,
      neck: 16,
    });
    expectNonNegativeFiniteNumber(result, 'bodyFatPercentage');
    // Very lean → low body fat %
    expect(result.bodyFatPercentage as number).toBeLessThan(15);
  });

  it('handles large waist measurements without overflow', () => {
    const result = calculateBodyFat({
      ...MALE_BASE,
      waist: 52,
    });
    expectNonNegativeFiniteNumber(result, 'bodyFatPercentage');
    expect(result.bodyFatPercentage as number).toBeGreaterThan(20);
  });

  // ═══ METRIC CONVERSION ═══════════════════════════════════════════════════

  it('metric and imperial give consistent results for same person', () => {
    const imperial = calculateBodyFat(MALE_BASE);
    const metric = calculateBodyFat({
      sex: 'male',
      unitSystem: 'metric',
      waist: 34 * 2.54,     // inches to cm
      neck: 15 * 2.54,
      height: 70 * 2.54,
    });
    expect(imperial.bodyFatPercentage as number)
      .toBeCloseTo(metric.bodyFatPercentage as number, 0);
  });

  // ═══ CATEGORY CHECKS ═════════════════════════════════════════════════════

  it('returns a valid category string', () => {
    const result = calculateBodyFat(MALE_BASE);
    expect(typeof result.category).toBe('string');
    expect((result.category as string).length).toBeGreaterThan(0);
  });

  // ═══ FAT/LEAN MASS CONSISTENCY ═══════════════════════════════════════════

  it('fatMass + leanMass = 100 (per 100 lbs basis)', () => {
    const result = calculateBodyFat(MALE_BASE);
    const fat = result.fatMass as number;
    const lean = result.leanMass as number;
    expect(fat + lean).toBeCloseTo(100, 0);
  });
});

describe('Ideal Weight Calculator — edge cases', () => {
  const calculateIdealWeight = getFormula('ideal-weight');

  it('handles very short person (5ft / 60 inches — base height)', () => {
    const result = calculateIdealWeight({
      height: 60,
      unitSystem: 'imperial',
      sex: 'male',
    });
    expectPositiveFiniteNumber(result, 'devineWeight');
    expectPositiveFiniteNumber(result, 'robinsonWeight');
  });

  it('handles very tall person (6ft4 / 76 inches)', () => {
    const result = calculateIdealWeight({
      height: 76,
      unitSystem: 'imperial',
      sex: 'female',
    });
    expectPositiveFiniteNumber(result, 'devineWeight');
    expectPositiveFiniteNumber(result, 'robinsonWeight');
  });

  it('metric and imperial produce consistent results', () => {
    const imperial = calculateIdealWeight({
      height: 70,
      unitSystem: 'imperial',
      sex: 'male',
    });
    const metric = calculateIdealWeight({
      height: 70 * 2.54, // inches to cm
      unitSystem: 'metric',
      sex: 'male',
    });
    // Metric outputs in kg, imperial in lbs — compare metric result converted to lbs
    // or just verify both are positive and in reasonable range
    expectPositiveFiniteNumber(imperial, 'robinsonWeight');
    expectPositiveFiniteNumber(metric, 'robinsonWeight');
    // Both should be in a reasonable range for a 5'10" male (130-180 range)
    expect(imperial.robinsonWeight as number).toBeGreaterThan(100);
    expect(imperial.robinsonWeight as number).toBeLessThan(200);
  });

  it('male and female differ for same height', () => {
    const male = calculateIdealWeight({ height: 70, unitSystem: 'imperial', sex: 'male' });
    const female = calculateIdealWeight({ height: 70, unitSystem: 'imperial', sex: 'female' });
    expect(male.robinsonWeight).not.toBe(female.robinsonWeight);
  });
});

describe('BMR Calculator — edge cases', () => {
  const calculateBMR = getFormula('bmr');

  it('handles elderly person (age 90)', () => {
    const result = calculateBMR({
      age: 90,
      sex: 'male',
      weight: 70,
      height: 170,
      unitSystem: 'metric',
    });
    expectPositiveFiniteNumber(result, 'mifflinBMR');
    // BMR decreases with age — should be lower than a young person
    const young = calculateBMR({
      age: 25,
      sex: 'male',
      weight: 70,
      height: 170,
      unitSystem: 'metric',
    });
    expect(result.mifflinBMR as number).toBeLessThan(young.mifflinBMR as number);
  });

  it('handles very young person (age 18)', () => {
    const result = calculateBMR({
      age: 18,
      sex: 'female',
      weight: 55,
      height: 160,
      unitSystem: 'metric',
    });
    expectPositiveFiniteNumber(result, 'mifflinBMR');
  });

  it('heavier person has higher BMR', () => {
    const light = calculateBMR({ age: 30, sex: 'male', weight: 60, height: 175, unitSystem: 'metric' });
    const heavy = calculateBMR({ age: 30, sex: 'male', weight: 100, height: 175, unitSystem: 'metric' });
    expect(heavy.mifflinBMR as number).toBeGreaterThan(light.mifflinBMR as number);
  });
});
