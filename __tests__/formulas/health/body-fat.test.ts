import { calculateBodyFat } from '@/lib/formulas/health/body-fat';

describe('calculateBodyFat', () => {
  // Standard male cases — US Navy method (coefficients for inches)
  it('calculates body fat for average male (imperial)', () => {
    const result = calculateBodyFat({
      sex: 'male', unitSystem: 'imperial',
      waist: 34, neck: 15, height: 71,
    });
    // 86.010 * log10(34-15) - 70.041 * log10(71) + 36.76
    // = 86.010 * log10(19) - 70.041 * log10(71) + 36.76
    // = 86.010 * 1.27875 - 70.041 * 1.85126 + 36.76
    // = 109.98 - 129.65 + 36.76 = 17.09
    expect(result.bodyFatPercentage).toBeCloseTo(17.1, 0);
    expect(result.category).toBe('Average'); // 17.1% > 17 threshold
  });

  it('calculates lean male body fat (imperial)', () => {
    const result = calculateBodyFat({
      sex: 'male', unitSystem: 'imperial',
      waist: 30, neck: 16, height: 72,
    });
    // 86.010 * log10(14) - 70.041 * log10(72) + 36.76
    // = 86.010 * 1.14613 - 70.041 * 1.85733 + 36.76
    // = 98.58 - 130.08 + 36.76 = 5.26
    expect(result.bodyFatPercentage).toBeCloseTo(5.3, 0);
    expect(result.category).toBe('Athletes'); // 5.3% > 5 threshold
  });

  it('calculates overweight male body fat (imperial)', () => {
    const result = calculateBodyFat({
      sex: 'male', unitSystem: 'imperial',
      waist: 40, neck: 15, height: 70,
    });
    // 86.010 * log10(25) - 70.041 * log10(70) + 36.76
    // = 86.010 * 1.39794 - 70.041 * 1.84510 + 36.76
    // = 120.24 - 129.23 + 36.76 = 27.77
    expect(result.bodyFatPercentage).toBeCloseTo(27.8, 0);
    expect(result.category).toBe('Obese');
  });

  // Standard female cases
  it('calculates body fat for average female (imperial)', () => {
    const result = calculateBodyFat({
      sex: 'female', unitSystem: 'imperial',
      waist: 30, neck: 13, hip: 38, height: 65,
    });
    // 163.205 * log10(30+38-13) - 97.684 * log10(65) - 78.387
    // = 163.205 * log10(55) - 97.684 * log10(65) - 78.387
    // = 163.205 * 1.74036 - 97.684 * 1.81291 - 78.387
    // = 283.98 - 177.03 - 78.387 = 28.56
    expect(result.bodyFatPercentage).toBeCloseTo(28.6, 0);
    expect(result.category).toBe('Average');
  });

  it('calculates lean female body fat (imperial)', () => {
    const result = calculateBodyFat({
      sex: 'female', unitSystem: 'imperial',
      waist: 26, neck: 13, hip: 34, height: 66,
    });
    // 163.205 * log10(26+34-13) - 97.684 * log10(66) - 78.387
    // = 163.205 * log10(47) - 97.684 * log10(66) - 78.387
    // = 163.205 * 1.67210 - 97.684 * 1.81954 - 78.387
    // = 272.93 - 177.67 - 78.387 = 16.87
    expect(result.bodyFatPercentage).toBeCloseTo(16.9, 0);
    expect(result.category).toBe('Athletes');
  });

  // Metric cases (converted to inches internally)
  it('calculates body fat for male (metric)', () => {
    // 34 in = 86.36 cm, 15 in = 38.1 cm, 71 in = 180.34 cm
    const result = calculateBodyFat({
      sex: 'male', unitSystem: 'metric',
      waist: 86.36, neck: 38.1, height: 180.34,
    });
    expect(result.bodyFatPercentage).toBeCloseTo(17.1, 0);
  });

  it('calculates body fat for female (metric)', () => {
    // 30 in = 76.2 cm, 13 in = 33.02 cm, 38 in = 96.52 cm, 65 in = 165.1 cm
    const result = calculateBodyFat({
      sex: 'female', unitSystem: 'metric',
      waist: 76.2, neck: 33.02, hip: 96.52, height: 165.1,
    });
    expect(result.bodyFatPercentage).toBeCloseTo(28.6, 0);
  });

  // Category classification
  it('classifies male athlete body fat correctly', () => {
    const result = calculateBodyFat({
      sex: 'male', unitSystem: 'imperial',
      waist: 31, neck: 15.5, height: 72,
    });
    // waist-neck = 15.5
    // 86.010 * log10(15.5) - 70.041 * log10(72) + 36.76
    // ≈ 86.010*1.19033 - 70.041*1.85733 + 36.76 ≈ 102.37 - 130.08 + 36.76 = 9.05
    expect(result.bodyFatPercentage).toBeGreaterThan(5);
    expect(result.bodyFatPercentage).toBeLessThan(14);
    expect(result.category).toBe('Athletes');
  });

  it('classifies male obese body fat correctly', () => {
    const result = calculateBodyFat({
      sex: 'male', unitSystem: 'imperial',
      waist: 44, neck: 16, height: 69,
    });
    expect(result.bodyFatPercentage).toBeGreaterThan(25);
    expect(result.category).toBe('Obese');
  });

  // Fat mass / lean mass
  it('fat mass + lean mass equals 100', () => {
    const result = calculateBodyFat({
      sex: 'male', unitSystem: 'imperial',
      waist: 34, neck: 15, height: 71,
    });
    expect(result.fatMass + result.leanMass).toBeCloseTo(100, 0);
  });

  // Edge cases
  it('handles waist equal to neck (male) — returns zero', () => {
    const result = calculateBodyFat({
      sex: 'male', unitSystem: 'imperial',
      waist: 15, neck: 15, height: 70,
    });
    expect(result.bodyFatPercentage).toBe(0);
  });

  it('handles neck larger than waist (male) — clamps to zero', () => {
    const result = calculateBodyFat({
      sex: 'male', unitSystem: 'imperial',
      waist: 14, neck: 16, height: 70,
    });
    expect(result.bodyFatPercentage).toBe(0);
  });

  it('includes body fat mass note', () => {
    const result = calculateBodyFat({
      sex: 'male', unitSystem: 'imperial',
      waist: 34, neck: 15, height: 71,
    });
    expect(result.bodyFatMassNote).toContain('body fat');
    expect(result.bodyFatMassNote).toContain('fat mass');
  });

  // Consistency between unit systems
  it('imperial and metric give same result for equivalent measurements', () => {
    const imperial = calculateBodyFat({
      sex: 'male', unitSystem: 'imperial',
      waist: 34, neck: 15, height: 71,
    });
    const metric = calculateBodyFat({
      sex: 'male', unitSystem: 'metric',
      waist: 34 * 2.54, neck: 15 * 2.54, height: 71 * 2.54,
    });
    expect(metric.bodyFatPercentage).toBeCloseTo(imperial.bodyFatPercentage, 1);
  });

  it('imperial and metric female give same result', () => {
    const imperial = calculateBodyFat({
      sex: 'female', unitSystem: 'imperial',
      waist: 30, neck: 13, hip: 38, height: 65,
    });
    const metric = calculateBodyFat({
      sex: 'female', unitSystem: 'metric',
      waist: 30 * 2.54, neck: 13 * 2.54, hip: 38 * 2.54, height: 65 * 2.54,
    });
    expect(metric.bodyFatPercentage).toBeCloseTo(imperial.bodyFatPercentage, 1);
  });
});
