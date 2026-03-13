import { calculateVo2Max, calculateVo2MaxFromInputs } from '@/lib/formulas/health/vo2-max';

describe('calculateVo2Max', () => {
  // ═══ COOPER METHOD TESTS ═══

  // ─── Test 1: Basic Cooper calculation with 2400m ───
  it('calculates VO2max for 2400m Cooper test', () => {
    // (2400 - 504.9) / 44.73 = 1895.1 / 44.73 = 42.4
    const result = calculateVo2Max({ testMethod: 'cooper', distanceMeters: 2400 });
    expect(result.vo2Max).toBeCloseTo(42.4, 1);
    expect(result.methodUsed).toBe('Cooper 12-Minute Run Test');
  });

  // ─── Test 2: Excellent runner — 3000m ───
  it('calculates VO2max for 3000m (excellent runner)', () => {
    // (3000 - 504.9) / 44.73 = 2495.1 / 44.73 = 55.8
    const result = calculateVo2Max({ testMethod: 'cooper', distanceMeters: 3000 });
    expect(result.vo2Max).toBeCloseTo(55.8, 1);
    expect(result.fitnessLevel).toBe('Superior');
  });

  // ─── Test 3: Moderate runner — 2000m ───
  it('calculates VO2max for 2000m (moderate runner)', () => {
    // (2000 - 504.9) / 44.73 = 1495.1 / 44.73 = 33.4
    const result = calculateVo2Max({ testMethod: 'cooper', distanceMeters: 2000 });
    expect(result.vo2Max).toBeCloseTo(33.4, 1);
    expect(result.fitnessLevel).toBe('Good');
  });

  // ─── Test 4: Low distance — 1200m ───
  it('calculates VO2max for 1200m (low fitness)', () => {
    // (1200 - 504.9) / 44.73 = 695.1 / 44.73 = 15.5
    const result = calculateVo2Max({ testMethod: 'cooper', distanceMeters: 1200 });
    expect(result.vo2Max).toBeCloseTo(15.5, 1);
    expect(result.fitnessLevel).toBe('Poor');
  });

  // ─── Test 5: Miles input conversion ───
  it('converts miles to meters for Cooper method', () => {
    // 1.5 miles = 1.5 × 1609.34 = 2414.01 meters
    // (2414.01 - 504.9) / 44.73 = 42.7
    const result = calculateVo2Max({ testMethod: 'cooper', distanceMeters: 1.5, distanceUnit: 'miles' });
    expect(result.vo2Max).toBeCloseTo(42.7, 1);
  });

  // ─── Test 6: 1 mile conversion ───
  it('handles 1-mile distance correctly', () => {
    // 1 mile = 1609.34m → (1609.34 - 504.9) / 44.73 = 24.7
    const result = calculateVo2Max({ testMethod: 'cooper', distanceMeters: 1, distanceUnit: 'miles' });
    expect(result.vo2Max).toBeCloseTo(24.7, 1);
    expect(result.fitnessLevel).toBe('Poor');
  });

  // ─── Test 7: Zero distance ───
  it('returns zero VO2max for zero distance', () => {
    const result = calculateVo2Max({ testMethod: 'cooper', distanceMeters: 0 });
    expect(result.vo2Max).toBe(0);
    expect(result.fitnessLevel).toBe('N/A');
    expect(result.summary).toHaveLength(0);
  });

  // ─── Test 8: Negative distance clamped ───
  it('handles negative distance (clamped to 0)', () => {
    const result = calculateVo2Max({ testMethod: 'cooper', distanceMeters: -500 });
    expect(result.vo2Max).toBe(0);
    expect(result.fitnessLevel).toBe('N/A');
  });

  // ─── Test 9: Very short distance produces negative VO2 clamped to 0 ───
  it('clamps negative VO2max to 0 for very short distance', () => {
    // (200 - 504.9) / 44.73 = -304.9 / 44.73 = -6.8 → clamped to 0
    const result = calculateVo2Max({ testMethod: 'cooper', distanceMeters: 200 });
    expect(result.vo2Max).toBe(0);
    expect(result.fitnessLevel).toBe('N/A');
  });

  // ═══ HEART RATE METHOD TESTS ═══

  // ─── Test 10: Basic heart rate method (age 30, resting HR 65) ───
  it('calculates VO2max using heart rate method (age 30, HR 65)', () => {
    // maxHR = 220 - 30 = 190; VO2max = 15.3 × (190 / 65) = 15.3 × 2.923 = 44.7
    const result = calculateVo2Max({ testMethod: 'heart-rate', age: 30, restingHeartRate: 65 });
    expect(result.vo2Max).toBeCloseTo(44.7, 1);
    expect(result.methodUsed).toBe('Uth et al. Heart Rate Ratio');
  });

  // ─── Test 11: Young athlete (age 20, resting HR 50) ───
  it('calculates VO2max for young athlete', () => {
    // maxHR = 200; VO2max = 15.3 × (200 / 50) = 15.3 × 4 = 61.2
    const result = calculateVo2Max({ testMethod: 'heart-rate', age: 20, restingHeartRate: 50 });
    expect(result.vo2Max).toBeCloseTo(61.2, 1);
    expect(result.fitnessLevel).toBe('Superior');
  });

  // ─── Test 12: Older sedentary adult (age 60, resting HR 80) ───
  it('calculates VO2max for older sedentary adult', () => {
    // maxHR = 160; VO2max = 15.3 × (160 / 80) = 15.3 × 2 = 30.6
    const result = calculateVo2Max({ testMethod: 'heart-rate', age: 60, restingHeartRate: 80 });
    expect(result.vo2Max).toBeCloseTo(30.6, 1);
    expect(result.fitnessLevel).toBe('Fair');
  });

  // ─── Test 13: Resting HR at boundary (age 40, HR 100) ───
  it('calculates VO2max with high resting HR', () => {
    // maxHR = 180; VO2max = 15.3 × (180 / 100) = 15.3 × 1.8 = 27.5
    const result = calculateVo2Max({ testMethod: 'heart-rate', age: 40, restingHeartRate: 100 });
    expect(result.vo2Max).toBeCloseTo(27.5, 1);
    expect(result.fitnessLevel).toBe('Fair');
  });

  // ─── Test 14: Zero age returns empty ───
  it('returns zero VO2max for zero age', () => {
    const result = calculateVo2Max({ testMethod: 'heart-rate', age: 0, restingHeartRate: 65 });
    expect(result.vo2Max).toBe(0);
    expect(result.fitnessLevel).toBe('N/A');
  });

  // ─── Test 15: Zero resting HR returns empty ───
  it('returns zero VO2max for zero resting HR', () => {
    const result = calculateVo2Max({ testMethod: 'heart-rate', age: 30, restingHeartRate: 0 });
    expect(result.vo2Max).toBe(0);
    expect(result.fitnessLevel).toBe('N/A');
  });

  // ─── Test 16: Negative age clamped ───
  it('handles negative age (clamped to 0, returns empty)', () => {
    const result = calculateVo2Max({ testMethod: 'heart-rate', age: -5, restingHeartRate: 65 });
    expect(result.vo2Max).toBe(0);
  });

  // ═══ FITNESS CLASSIFICATION TESTS ═══

  // ─── Test 17: Superior classification ───
  it('classifies VO2max >= 52 as Superior', () => {
    const result = calculateVo2Max({ testMethod: 'cooper', distanceMeters: 2840 });
    // (2840 - 504.9) / 44.73 = 52.2
    expect(result.fitnessLevel).toBe('Superior');
  });

  // ─── Test 18: Excellent classification ───
  it('classifies VO2max 42-51.9 as Excellent', () => {
    const result = calculateVo2Max({ testMethod: 'cooper', distanceMeters: 2400 });
    // VO2max ≈ 42.4
    expect(result.fitnessLevel).toBe('Excellent');
  });

  // ─── Test 19: Good classification ───
  it('classifies VO2max 33-41.9 as Good', () => {
    const result = calculateVo2Max({ testMethod: 'cooper', distanceMeters: 2000 });
    // VO2max ≈ 33.4
    expect(result.fitnessLevel).toBe('Good');
  });

  // ─── Test 20: Fair classification ───
  it('classifies VO2max 25-32.9 as Fair', () => {
    const result = calculateVo2Max({ testMethod: 'cooper', distanceMeters: 1650 });
    // (1650 - 504.9) / 44.73 = 25.6
    expect(result.fitnessLevel).toBe('Fair');
  });

  // ═══ PERCENTILE TESTS ═══

  // ─── Test 21: Top 5% percentile ───
  it('returns Top 5% for VO2max >= 56', () => {
    const result = calculateVo2Max({ testMethod: 'cooper', distanceMeters: 3100 });
    expect(result.percentile).toBe('Top 5%');
  });

  // ─── Test 22: Top 50% percentile ───
  it('returns Top 50% for VO2max 33-37', () => {
    const result = calculateVo2Max({ testMethod: 'cooper', distanceMeters: 2000 });
    // VO2max ≈ 33.4
    expect(result.percentile).toBe('Top 50%');
  });

  // ═══ SUMMARY AND OUTPUT TESTS ═══

  // ─── Test 23: Summary structure for Cooper method ───
  it('returns summary with correct fields for Cooper method', () => {
    const result = calculateVo2Max({ testMethod: 'cooper', distanceMeters: 2400 });
    expect(result.summary.length).toBeGreaterThanOrEqual(4);
    expect(result.summary[0].label).toBe('VO2 Max');
    expect(result.summary[1].label).toBe('Fitness Level');
    expect(result.summary[2].label).toBe('Percentile');
    expect(result.summary[3].label).toBe('Method');
  });

  // ─── Test 24: Summary structure for heart rate method ───
  it('returns summary with heart rate fields for HR method', () => {
    const result = calculateVo2Max({ testMethod: 'heart-rate', age: 30, restingHeartRate: 65 });
    expect(result.summary.length).toBeGreaterThanOrEqual(5);
    const labels = result.summary.map(s => s.label);
    expect(labels).toContain('Max Heart Rate (est.)');
    expect(labels).toContain('Resting Heart Rate');
  });

  // ─── Test 25: VO2max rounded to 1 decimal place ───
  it('rounds VO2max to 1 decimal place', () => {
    const result = calculateVo2Max({ testMethod: 'cooper', distanceMeters: 2400 });
    const decimalPlaces = result.vo2Max.toString().split('.')[1]?.length || 0;
    expect(decimalPlaces).toBeLessThanOrEqual(1);
  });

  // ═══ REGISTRY WRAPPER TESTS ═══

  // ─── Test 26: Registry wrapper handles string inputs ───
  it('registry wrapper handles string inputs for Cooper method', () => {
    const result = calculateVo2MaxFromInputs({ testMethod: 'cooper', distanceMeters: '2400', distanceUnit: 'meters' });
    expect((result as { vo2Max: number }).vo2Max).toBeCloseTo(42.4, 1);
  });

  // ─── Test 27: Registry wrapper handles heart rate strings ───
  it('registry wrapper handles string inputs for HR method', () => {
    const result = calculateVo2MaxFromInputs({ testMethod: 'heart-rate', age: '30', restingHeartRate: '65' });
    expect((result as { vo2Max: number }).vo2Max).toBeCloseTo(44.7, 1);
  });

  // ─── Test 28: Registry wrapper defaults ───
  it('registry wrapper uses defaults for missing inputs', () => {
    const result = calculateVo2MaxFromInputs({});
    // Default: cooper method, 2400m
    expect((result as { vo2Max: number }).vo2Max).toBeCloseTo(42.4, 1);
    expect((result as { methodUsed: string }).methodUsed).toBe('Cooper 12-Minute Run Test');
  });

  // ─── Test 29: Default distance unit is meters ───
  it('defaults to meters when distanceUnit is not specified', () => {
    const result = calculateVo2Max({ testMethod: 'cooper', distanceMeters: 2400 });
    // No unit conversion applied — should use raw 2400
    expect(result.vo2Max).toBeCloseTo(42.4, 1);
  });

  // ─── Test 30: Unknown test method defaults to cooper ───
  it('defaults to Cooper method for unknown testMethod', () => {
    const result = calculateVo2Max({ testMethod: 'unknown', distanceMeters: 2400 });
    expect(result.methodUsed).toBe('Cooper 12-Minute Run Test');
    expect(result.vo2Max).toBeCloseTo(42.4, 1);
  });

  // ─── Test 31: Very high age (age 220+) ───
  it('returns zero VO2max when maxHR would be zero or negative', () => {
    // age 220: maxHR = 220 - 220 = 0 → edge case
    const result = calculateVo2Max({ testMethod: 'heart-rate', age: 220, restingHeartRate: 65 });
    expect(result.vo2Max).toBe(0);
  });

  // ─── Test 32: Elite athlete Cooper distance (3500m) ───
  it('calculates VO2max for elite athlete (3500m)', () => {
    // (3500 - 504.9) / 44.73 = 66.955... → rounded to 1 decimal = 67.0
    const result = calculateVo2Max({ testMethod: 'cooper', distanceMeters: 3500 });
    expect(result.vo2Max).toBeCloseTo(67.0, 1);
    expect(result.fitnessLevel).toBe('Superior');
    expect(result.percentile).toBe('Top 5%');
  });
});
