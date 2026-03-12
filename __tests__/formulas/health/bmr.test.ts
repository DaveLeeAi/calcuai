import { calculateBMR } from '@/lib/formulas/health/bmr';

describe('calculateBMR', () => {
  // Mifflin-St Jeor: Male
  it('calculates Mifflin-St Jeor BMR for 30-year-old male (imperial)', () => {
    // 180 lb = 81.647 kg, 70 in = 177.8 cm
    // (10 × 81.647) + (6.25 × 177.8) - (5 × 30) + 5
    // = 816.47 + 1111.25 - 150 + 5 = 1782.72 → 1783
    const result = calculateBMR({
      age: 30, sex: 'male', weight: 180, height: 70, unitSystem: 'imperial',
    });
    expect(result.mifflinBMR).toBeCloseTo(1783, 0);
  });

  // Mifflin-St Jeor: Female
  it('calculates Mifflin-St Jeor BMR for 30-year-old female (imperial)', () => {
    // 140 lb = 63.503 kg, 65 in = 165.1 cm
    // (10 × 63.503) + (6.25 × 165.1) - (5 × 30) - 161
    // = 635.03 + 1031.88 - 150 - 161 = 1355.91 → 1356
    const result = calculateBMR({
      age: 30, sex: 'female', weight: 140, height: 65, unitSystem: 'imperial',
    });
    expect(result.mifflinBMR).toBeCloseTo(1356, 0);
  });

  // Harris-Benedict: Male
  it('calculates Harris-Benedict BMR for 30-year-old male (imperial)', () => {
    // 180 lb = 81.647 kg, 70 in = 177.8 cm
    // (13.397 × 81.647) + (4.799 × 177.8) - (5.677 × 30) + 88.362
    // = 1093.80 + 853.46 - 170.31 + 88.362 = 1865.31 → 1865
    const result = calculateBMR({
      age: 30, sex: 'male', weight: 180, height: 70, unitSystem: 'imperial',
    });
    expect(result.harrisBenedictBMR).toBeCloseTo(1865, 0);
  });

  // Harris-Benedict: Female
  it('calculates Harris-Benedict BMR for 30-year-old female (imperial)', () => {
    // 140 lb = 63.503 kg, 65 in = 165.1 cm
    // (9.247 × 63.503) + (3.098 × 165.1) - (4.330 × 30) + 447.593
    // = 587.15 + 511.48 - 129.90 + 447.593 = 1416.32 → 1416
    const result = calculateBMR({
      age: 30, sex: 'female', weight: 140, height: 65, unitSystem: 'imperial',
    });
    expect(result.harrisBenedictBMR).toBeCloseTo(1416, 0);
  });

  // Metric male
  it('calculates BMR for male using metric inputs', () => {
    // 80 kg, 180 cm, age 25
    // Mifflin: (10 × 80) + (6.25 × 180) - (5 × 25) + 5 = 800 + 1125 - 125 + 5 = 1805
    // Harris: (13.397 × 80) + (4.799 × 180) - (5.677 × 25) + 88.362 = 1071.76 + 863.82 - 141.925 + 88.362 = 1882.02
    const result = calculateBMR({
      age: 25, sex: 'male', weight: 80, height: 180, unitSystem: 'metric',
    });
    expect(result.mifflinBMR).toBe(1805);
    expect(result.harrisBenedictBMR).toBeCloseTo(1882, 0);
  });

  // Metric female
  it('calculates BMR for female using metric inputs', () => {
    // 60 kg, 165 cm, age 28
    // Mifflin: (10 × 60) + (6.25 × 165) - (5 × 28) - 161 = 600 + 1031.25 - 140 - 161 = 1330.25 → 1330
    // Harris: (9.247 × 60) + (3.098 × 165) - (4.330 × 28) + 447.593 = 554.82 + 511.17 - 121.24 + 447.593 = 1392.34
    const result = calculateBMR({
      age: 28, sex: 'female', weight: 60, height: 165, unitSystem: 'metric',
    });
    expect(result.mifflinBMR).toBeCloseTo(1330, 0);
    expect(result.harrisBenedictBMR).toBeCloseTo(1392, 0);
  });

  // Average BMR
  it('calculates average BMR from both formulas', () => {
    const result = calculateBMR({
      age: 25, sex: 'male', weight: 80, height: 180, unitSystem: 'metric',
    });
    // Average of the two BMR values, allow ±1 for rounding
    const expectedAvg = (result.mifflinBMR + result.harrisBenedictBMR) / 2;
    expect(Math.abs(result.averageBMR - expectedAvg)).toBeLessThanOrEqual(1);
  });

  // Young person (age 15)
  it('handles young person at boundary age 15', () => {
    const result = calculateBMR({
      age: 15, sex: 'male', weight: 60, height: 170, unitSystem: 'metric',
    });
    // Mifflin: (10 × 60) + (6.25 × 170) - (5 × 15) + 5 = 600 + 1062.5 - 75 + 5 = 1592.5 → 1593
    expect(result.mifflinBMR).toBeCloseTo(1593, 0);
  });

  // Elderly person (age 80)
  it('handles elderly person at high age', () => {
    const result = calculateBMR({
      age: 80, sex: 'female', weight: 55, height: 155, unitSystem: 'metric',
    });
    // Mifflin: (10 × 55) + (6.25 × 155) - (5 × 80) - 161 = 550 + 968.75 - 400 - 161 = 957.75 → 958
    expect(result.mifflinBMR).toBeCloseTo(958, 0);
  });

  // Heavy male
  it('handles heavy male weight', () => {
    const result = calculateBMR({
      age: 35, sex: 'male', weight: 120, height: 185, unitSystem: 'metric',
    });
    // Mifflin: (10 × 120) + (6.25 × 185) - (5 × 35) + 5 = 1200 + 1156.25 - 175 + 5 = 2186.25 → 2186
    expect(result.mifflinBMR).toBeCloseTo(2186, 0);
  });

  // Light female
  it('handles light female weight', () => {
    const result = calculateBMR({
      age: 22, sex: 'female', weight: 45, height: 155, unitSystem: 'metric',
    });
    // Mifflin: (10 × 45) + (6.25 × 155) - (5 × 22) - 161 = 450 + 968.75 - 110 - 161 = 1147.75 → 1148
    expect(result.mifflinBMR).toBeCloseTo(1148, 0);
  });

  // Daily calorie range
  it('calculates daily calorie range using sedentary and active multipliers', () => {
    const result = calculateBMR({
      age: 30, sex: 'male', weight: 80, height: 178, unitSystem: 'metric',
    });
    // averageBMR × 1.2 for sedentary, averageBMR × 1.725 for active
    expect(result.dailyCalorieRange.sedentary).toBe(Math.round(result.averageBMR * 1.2));
    expect(result.dailyCalorieRange.active).toBe(Math.round(result.averageBMR * 1.725));
  });

  // Comparison table structure
  it('returns comparison table with both formulas and activity levels', () => {
    const result = calculateBMR({
      age: 30, sex: 'male', weight: 80, height: 178, unitSystem: 'metric',
    });
    expect(result.bmrComparison).toHaveLength(2);
    expect(result.bmrComparison[0].formula).toBe('Mifflin-St Jeor');
    expect(result.bmrComparison[1].formula).toBe('Harris-Benedict');

    // Verify activity level calculations for Mifflin row (allow ±1 for rounding differences)
    const mifflin = result.bmrComparison[0];
    expect(Math.abs(mifflin.sedentary - result.mifflinBMR * 1.2)).toBeLessThanOrEqual(1);
    expect(Math.abs(mifflin.lightlyActive - result.mifflinBMR * 1.375)).toBeLessThanOrEqual(1);
    expect(Math.abs(mifflin.moderatelyActive - result.mifflinBMR * 1.55)).toBeLessThanOrEqual(1);
    expect(Math.abs(mifflin.veryActive - result.mifflinBMR * 1.725)).toBeLessThanOrEqual(1);
  });

  // Mifflin is typically lower than Harris-Benedict for males
  it('Mifflin-St Jeor typically returns lower BMR than Harris-Benedict for males', () => {
    const result = calculateBMR({
      age: 30, sex: 'male', weight: 80, height: 178, unitSystem: 'metric',
    });
    expect(result.mifflinBMR).toBeLessThan(result.harrisBenedictBMR);
  });

  // Imperial vs metric consistency
  it('produces consistent results between imperial and metric for same person', () => {
    const imperial = calculateBMR({
      age: 30, sex: 'male', weight: 176.37, height: 70.87, unitSystem: 'imperial',
    });
    const metric = calculateBMR({
      age: 30, sex: 'male', weight: 80, height: 180, unitSystem: 'metric',
    });
    // Should be very close (within rounding)
    expect(Math.abs(imperial.mifflinBMR - metric.mifflinBMR)).toBeLessThanOrEqual(2);
    expect(Math.abs(imperial.harrisBenedictBMR - metric.harrisBenedictBMR)).toBeLessThanOrEqual(2);
  });
});
