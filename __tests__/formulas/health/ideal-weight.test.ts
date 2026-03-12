import { calculateIdealWeight } from '@/lib/formulas/health/ideal-weight';

describe('calculateIdealWeight', () => {
  // Standard male 5'10" (70 inches)
  it('calculates Devine ideal weight for 5\'10" male (imperial)', () => {
    // Devine: 50 + 2.3 × (70 - 60) = 50 + 23 = 73 kg = 160.9 lbs
    const result = calculateIdealWeight({ sex: 'male', height: 70, unitSystem: 'imperial' });
    expect(result.devineWeight).toBeCloseTo(160.9, 0);
  });

  it('calculates Robinson ideal weight for 5\'10" male (imperial)', () => {
    // Robinson: 52 + 1.9 × (70 - 60) = 52 + 19 = 71 kg = 156.5 lbs
    const result = calculateIdealWeight({ sex: 'male', height: 70, unitSystem: 'imperial' });
    expect(result.robinsonWeight).toBeCloseTo(156.5, 0);
  });

  it('calculates Miller ideal weight for 5\'10" male (imperial)', () => {
    // Miller: 56.2 + 1.41 × (70 - 60) = 56.2 + 14.1 = 70.3 kg = 154.9 lbs
    const result = calculateIdealWeight({ sex: 'male', height: 70, unitSystem: 'imperial' });
    expect(result.millerWeight).toBeCloseTo(155.0, 0);
  });

  it('calculates Hamwi ideal weight for 5\'10" male (imperial)', () => {
    // Hamwi: 48 + 2.7 × (70 - 60) = 48 + 27 = 75 kg = 165.3 lbs
    const result = calculateIdealWeight({ sex: 'male', height: 70, unitSystem: 'imperial' });
    expect(result.hamwiWeight).toBeCloseTo(165.3, 0);
  });

  // Standard female 5'5" (65 inches)
  it('calculates Devine ideal weight for 5\'5" female (imperial)', () => {
    // Devine: 45.5 + 2.3 × (65 - 60) = 45.5 + 11.5 = 57.0 kg = 125.7 lbs
    const result = calculateIdealWeight({ sex: 'female', height: 65, unitSystem: 'imperial' });
    expect(result.devineWeight).toBeCloseTo(125.7, 0);
  });

  it('calculates Robinson ideal weight for 5\'5" female (imperial)', () => {
    // Robinson: 49 + 1.7 × (65 - 60) = 49 + 8.5 = 57.5 kg = 126.8 lbs
    const result = calculateIdealWeight({ sex: 'female', height: 65, unitSystem: 'imperial' });
    expect(result.robinsonWeight).toBeCloseTo(126.8, 0);
  });

  it('calculates average ideal weight correctly', () => {
    const result = calculateIdealWeight({ sex: 'male', height: 70, unitSystem: 'imperial' });
    // Average of all 4 formula results
    const avgLbs = (result.devineWeight + result.robinsonWeight + result.millerWeight + result.hamwiWeight) / 4;
    expect(result.averageIdealWeight).toBeCloseTo(avgLbs, 0);
  });

  // Exactly 60 inches (5'0")
  it('calculates ideal weight at base height of 60 inches (male)', () => {
    // All formulas at base: Devine = 50, Robinson = 52, Miller = 56.2, Hamwi = 48 kg
    const result = calculateIdealWeight({ sex: 'male', height: 60, unitSystem: 'imperial' });
    expect(result.devineWeight).toBeCloseTo(50 * 2.20462, 0);
    expect(result.robinsonWeight).toBeCloseTo(52 * 2.20462, 0);
    expect(result.millerWeight).toBeCloseTo(56.2 * 2.20462, 0);
    expect(result.hamwiWeight).toBeCloseTo(48 * 2.20462, 0);
  });

  it('calculates ideal weight at base height of 60 inches (female)', () => {
    // Devine = 45.5, Robinson = 49, Miller = 53.1, Hamwi = 45.5 kg
    const result = calculateIdealWeight({ sex: 'female', height: 60, unitSystem: 'imperial' });
    expect(result.devineWeight).toBeCloseTo(45.5 * 2.20462, 0);
    expect(result.robinsonWeight).toBeCloseTo(49 * 2.20462, 0);
    expect(result.millerWeight).toBeCloseTo(53.1 * 2.20462, 0);
    expect(result.hamwiWeight).toBeCloseTo(45.5 * 2.20462, 0);
  });

  // Tall person 6'4" (76 inches)
  it('calculates ideal weight for tall male 6\'4" (imperial)', () => {
    // Devine: 50 + 2.3 × 16 = 50 + 36.8 = 86.8 kg = 191.3 lbs
    const result = calculateIdealWeight({ sex: 'male', height: 76, unitSystem: 'imperial' });
    expect(result.devineWeight).toBeCloseTo(191.4, 0);
  });

  // Metric inputs
  it('calculates ideal weight using metric inputs', () => {
    // 175 cm = 68.9 inches, so inchesOver60 = 8.9
    // Devine male: 50 + 2.3 × 8.9 = 50 + 20.47 = 70.47 kg
    const result = calculateIdealWeight({ sex: 'male', height: 175, unitSystem: 'metric' });
    expect(result.devineWeight).toBeCloseTo(70.5, 0);
  });

  // BMI healthy range
  it('calculates BMI-based healthy weight range (imperial)', () => {
    // 70 in = 1.778 m, BMI 18.5 → 58.47 kg = 128.9 lbs, BMI 24.9 → 78.70 kg = 173.5 lbs
    const result = calculateIdealWeight({ sex: 'male', height: 70, unitSystem: 'imperial' });
    expect(result.bmiHealthyRange.min).toBeCloseTo(128.9, 0);
    expect(result.bmiHealthyRange.max).toBeCloseTo(173.5, 0);
  });

  it('calculates BMI-based healthy weight range (metric)', () => {
    // 175 cm = 1.75 m, BMI 18.5 → 56.66 kg, BMI 24.9 → 76.24 kg
    const result = calculateIdealWeight({ sex: 'female', height: 175, unitSystem: 'metric' });
    expect(result.bmiHealthyRange.min).toBeCloseTo(56.7, 0);
    expect(result.bmiHealthyRange.max).toBeCloseTo(76.2, 0);
  });

  // Comparison table
  it('returns comparison table with all 4 formulas', () => {
    const result = calculateIdealWeight({ sex: 'male', height: 70, unitSystem: 'imperial' });
    expect(result.comparisonTable).toHaveLength(4);
    expect(result.comparisonTable[0].formula).toBe('Devine (1974)');
    expect(result.comparisonTable[1].formula).toBe('Robinson (1983)');
    expect(result.comparisonTable[2].formula).toBe('Miller (1983)');
    expect(result.comparisonTable[3].formula).toBe('Hamwi (1964)');
    // Each entry should have both kg and lbs
    result.comparisonTable.forEach((row) => {
      expect(row.weightKg).toBeGreaterThan(0);
      expect(row.weightLbs).toBeGreaterThan(0);
    });
  });

  // Imperial vs metric consistency
  it('produces consistent results between imperial and metric for same height', () => {
    const imperial = calculateIdealWeight({ sex: 'female', height: 65, unitSystem: 'imperial' });
    const metric = calculateIdealWeight({ sex: 'female', height: 165.1, unitSystem: 'metric' });
    // Metric returns kg, imperial returns lbs. Compare via comparison table kg values.
    expect(Math.abs(imperial.comparisonTable[0].weightKg - metric.comparisonTable[0].weightKg)).toBeLessThan(0.5);
  });
});
