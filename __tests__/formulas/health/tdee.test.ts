import { calculateTDEE, TDEEInput } from '@/lib/formulas/health/tdee';

const defaultMale: TDEEInput = {
  age: 30, gender: 'male', weight: 170, height: 70,
  unitSystem: 'imperial', activityLevel: 'moderate', formula: 'mifflin', goal: 'maintain',
};

const defaultFemale: TDEEInput = {
  age: 30, gender: 'female', weight: 140, height: 65,
  unitSystem: 'imperial', activityLevel: 'moderate', formula: 'mifflin', goal: 'maintain',
};

describe('calculateTDEE', () => {
  // ───────────── BMR calculations ─────────────

  it('calculates Mifflin BMR for standard male (imperial)', () => {
    // 170 lb = 77.111 kg, 70 in = 177.8 cm
    // (10 × 77.111) + (6.25 × 177.8) - (5 × 30) + 5
    // = 771.11 + 1111.25 - 150 + 5 = 1737.36 → 1737
    const result = calculateTDEE(defaultMale);
    expect(result.bmr).toBeCloseTo(1737, 0);
  });

  it('calculates Mifflin BMR for standard female (imperial)', () => {
    // 140 lb = 63.503 kg, 65 in = 165.1 cm
    // (10 × 63.503) + (6.25 × 165.1) - (5 × 30) - 161
    // = 635.03 + 1031.88 - 150 - 161 = 1355.91 → 1356
    const result = calculateTDEE(defaultFemale);
    expect(result.bmr).toBeCloseTo(1356, 0);
  });

  it('calculates Harris-Benedict BMR for male (imperial)', () => {
    // 170 lb = 77.111 kg, 70 in = 177.8 cm
    // (13.397 × 77.111) + (4.799 × 177.8) - (5.677 × 30) + 88.362
    // = 1032.87 + 853.26 - 170.31 + 88.362 = 1804.18 → 1804
    const result = calculateTDEE({ ...defaultMale, formula: 'harris' });
    expect(result.bmr).toBeCloseTo(1804, 0);
  });

  it('calculates Harris-Benedict BMR for female (imperial)', () => {
    // 140 lb = 63.503 kg, 65 in = 165.1 cm
    // (9.247 × 63.503) + (3.098 × 165.1) - (4.330 × 30) + 447.593
    // = 587.15 + 511.48 - 129.90 + 447.593 = 1416.32 → 1416
    const result = calculateTDEE({ ...defaultFemale, formula: 'harris' });
    expect(result.bmr).toBeCloseTo(1416, 0);
  });

  // ───────────── TDEE by activity level ─────────────

  it('calculates TDEE for sedentary (1.2x)', () => {
    const result = calculateTDEE({ ...defaultMale, activityLevel: 'sedentary' });
    // Allow ±1 for rounding (TDEE computed from unrounded BMR, result.bmr is rounded)
    expect(Math.abs(result.tdee - Math.round(result.bmr * 1.2))).toBeLessThanOrEqual(1);
    expect(result.activityMultiplier).toBe(1.2);
  });

  it('calculates TDEE for light activity (1.375x)', () => {
    const result = calculateTDEE({ ...defaultMale, activityLevel: 'light' });
    expect(Math.abs(result.tdee - Math.round(result.bmr * 1.375))).toBeLessThanOrEqual(1);
    expect(result.activityMultiplier).toBe(1.375);
  });

  it('calculates TDEE for moderate activity (1.55x)', () => {
    const result = calculateTDEE(defaultMale);
    expect(Math.abs(result.tdee - Math.round(result.bmr * 1.55))).toBeLessThanOrEqual(1);
    expect(result.activityMultiplier).toBe(1.55);
  });

  it('calculates TDEE for active (1.725x)', () => {
    const result = calculateTDEE({ ...defaultMale, activityLevel: 'active' });
    expect(Math.abs(result.tdee - Math.round(result.bmr * 1.725))).toBeLessThanOrEqual(1);
    expect(result.activityMultiplier).toBe(1.725);
  });

  it('calculates TDEE for very active (1.9x)', () => {
    const result = calculateTDEE({ ...defaultMale, activityLevel: 'veryActive' });
    expect(Math.abs(result.tdee - Math.round(result.bmr * 1.9))).toBeLessThanOrEqual(1);
    expect(result.activityMultiplier).toBe(1.9);
  });

  // ───────────── Goal adjustments ─────────────

  it('maintain goal has zero adjustment', () => {
    const result = calculateTDEE(defaultMale);
    expect(result.goalAdjustment).toBe(0);
    expect(result.goalCalories).toBe(result.tdee);
  });

  it('mild loss subtracts 250 calories', () => {
    const result = calculateTDEE({ ...defaultMale, goal: 'mildLoss' });
    expect(result.goalAdjustment).toBe(-250);
    expect(result.goalCalories).toBe(result.tdee - 250);
  });

  it('loss subtracts 500 calories', () => {
    const result = calculateTDEE({ ...defaultMale, goal: 'loss' });
    expect(result.goalAdjustment).toBe(-500);
    expect(result.goalCalories).toBe(result.tdee - 500);
  });

  it('extreme loss subtracts 1000 calories', () => {
    const result = calculateTDEE({ ...defaultMale, goal: 'extremeLoss' });
    expect(result.goalAdjustment).toBe(-1000);
    // Should still be well above 1200 floor for average male
    expect(result.goalCalories).toBe(result.tdee - 1000);
  });

  it('mild gain adds 250 calories', () => {
    const result = calculateTDEE({ ...defaultMale, goal: 'mildGain' });
    expect(result.goalAdjustment).toBe(250);
    expect(result.goalCalories).toBe(result.tdee + 250);
  });

  it('gain adds 500 calories', () => {
    const result = calculateTDEE({ ...defaultMale, goal: 'gain' });
    expect(result.goalAdjustment).toBe(500);
    expect(result.goalCalories).toBe(result.tdee + 500);
  });

  // ───────────── 1200 calorie floor ─────────────

  it('floors goalCalories at 1200 for extreme loss on small person', () => {
    // Light, sedentary female — low TDEE
    // 100 lb = 45.36 kg, 60 in = 152.4 cm, age 65
    // Mifflin female: (10 × 45.36) + (6.25 × 152.4) - (5 × 65) - 161
    //   = 453.6 + 952.5 - 325 - 161 = 920.1 → BMR ~920
    // Sedentary TDEE: 920 × 1.2 = 1104
    // Extreme loss: 1104 - 1000 = 104 → floor at 1200
    const result = calculateTDEE({
      age: 65, gender: 'female', weight: 100, height: 60,
      unitSystem: 'imperial', activityLevel: 'sedentary', formula: 'mifflin', goal: 'extremeLoss',
    });
    expect(result.goalCalories).toBe(1200);
  });

  // ───────────── Metric inputs ─────────────

  it('handles metric inputs (kg/cm) correctly', () => {
    // 80 kg, 180 cm, age 30, male, mifflin
    // BMR = (10 × 80) + (6.25 × 180) - (5 × 30) + 5
    //     = 800 + 1125 - 150 + 5 = 1780
    const result = calculateTDEE({
      age: 30, gender: 'male', weight: 80, height: 180,
      unitSystem: 'metric', activityLevel: 'moderate', formula: 'mifflin', goal: 'maintain',
    });
    expect(result.bmr).toBe(1780);
    expect(result.tdee).toBe(Math.round(1780 * 1.55));
  });

  // ───────────── Age edge cases ─────────────

  it('handles young person (age 18)', () => {
    const result = calculateTDEE({
      age: 18, gender: 'male', weight: 70, height: 175,
      unitSystem: 'metric', activityLevel: 'active', formula: 'mifflin', goal: 'maintain',
    });
    // BMR = (10 × 70) + (6.25 × 175) - (5 × 18) + 5
    //     = 700 + 1093.75 - 90 + 5 = 1708.75 → 1709
    expect(result.bmr).toBeCloseTo(1709, 0);
    expect(result.tdee).toBe(Math.round(result.bmr * 1.725));
  });

  it('handles older person (age 65)', () => {
    const result = calculateTDEE({
      age: 65, gender: 'female', weight: 60, height: 160,
      unitSystem: 'metric', activityLevel: 'light', formula: 'mifflin', goal: 'maintain',
    });
    // BMR = (10 × 60) + (6.25 × 160) - (5 × 65) - 161
    //     = 600 + 1000 - 325 - 161 = 1114
    expect(result.bmr).toBe(1114);
    expect(result.tdee).toBe(Math.round(1114 * 1.375));
  });

  // ───────────── Weight edge cases ─────────────

  it('handles very heavy person (300 lb male)', () => {
    const result = calculateTDEE({
      age: 40, gender: 'male', weight: 300, height: 72,
      unitSystem: 'imperial', activityLevel: 'sedentary', formula: 'mifflin', goal: 'loss',
    });
    // 300 lb = 136.08 kg, 72 in = 182.88 cm
    // BMR = (10 × 136.08) + (6.25 × 182.88) - (5 × 40) + 5
    //     = 1360.8 + 1143.0 - 200 + 5 = 2308.8 → 2309
    expect(result.bmr).toBeCloseTo(2309, 0);
    expect(result.goalCalories).toBe(result.tdee - 500);
  });

  it('handles very light person (90 lb female)', () => {
    const result = calculateTDEE({
      age: 25, gender: 'female', weight: 90, height: 60,
      unitSystem: 'imperial', activityLevel: 'sedentary', formula: 'mifflin', goal: 'maintain',
    });
    // 90 lb = 40.82 kg, 60 in = 152.4 cm
    // BMR = (10 × 40.82) + (6.25 × 152.4) - (5 × 25) - 161
    //     = 408.2 + 952.5 - 125 - 161 = 1074.7 → 1075
    expect(result.bmr).toBeCloseTo(1075, 0);
    expect(result.tdee).toBe(Math.round(result.bmr * 1.2));
  });

  // ───────────── Macro breakdown accuracy ─────────────

  it('calculates macro breakdown with correct ratios', () => {
    const result = calculateTDEE(defaultMale);
    const cals = result.goalCalories;

    const protein = result.macroBreakdown[0];
    const carbs = result.macroBreakdown[1];
    const fat = result.macroBreakdown[2];

    // Percentages
    expect(protein.percentage).toBe(30);
    expect(carbs.percentage).toBe(40);
    expect(fat.percentage).toBe(30);

    // Grams
    expect(protein.grams).toBe(Math.round(cals * 0.30 / 4));
    expect(carbs.grams).toBe(Math.round(cals * 0.40 / 4));
    expect(fat.grams).toBe(Math.round(cals * 0.30 / 9));

    // Calories
    expect(protein.calories).toBe(Math.round(cals * 0.30));
    expect(carbs.calories).toBe(Math.round(cals * 0.40));
    expect(fat.calories).toBe(Math.round(cals * 0.30));
  });

  // ───────────── Meal breakdown ─────────────

  it('calculates meal breakdown with correct percentages', () => {
    const result = calculateTDEE(defaultMale);
    const cals = result.goalCalories;

    expect(result.caloriesByMeal).toHaveLength(4);
    expect(result.caloriesByMeal[0]).toEqual({ label: 'Breakfast (25%)', value: Math.round(cals * 0.25) });
    expect(result.caloriesByMeal[1]).toEqual({ label: 'Lunch (35%)', value: Math.round(cals * 0.35) });
    expect(result.caloriesByMeal[2]).toEqual({ label: 'Dinner (30%)', value: Math.round(cals * 0.30) });
    expect(result.caloriesByMeal[3]).toEqual({ label: 'Snacks (10%)', value: Math.round(cals * 0.10) });
  });

  // ───────────── Weekly deficit / monthly weight change ─────────────

  it('calculates weekly deficit correctly for loss goal', () => {
    const result = calculateTDEE({ ...defaultMale, goal: 'loss' });
    expect(result.weeklyDeficit).toBe(-500 * 7);
  });

  it('calculates monthly weight change correctly', () => {
    const result = calculateTDEE({ ...defaultMale, goal: 'loss' });
    // (-500 × 30) / 3500 = -4.2857... → rounded to 2 decimal places
    expect(result.monthlyWeightChange).toBeCloseTo(-4.29, 2);
  });

  it('monthly weight change is zero for maintain', () => {
    const result = calculateTDEE(defaultMale);
    expect(result.monthlyWeightChange).toBe(0);
  });

  it('monthly weight change is positive for gain goal', () => {
    const result = calculateTDEE({ ...defaultMale, goal: 'gain' });
    // (500 × 30) / 3500 = 4.2857... → 4.29
    expect(result.monthlyWeightChange).toBeCloseTo(4.29, 2);
  });

  // ───────────── Output structure ─────────────

  it('returns all expected output fields', () => {
    const result = calculateTDEE(defaultMale);

    expect(result).toHaveProperty('bmr');
    expect(result).toHaveProperty('tdee');
    expect(result).toHaveProperty('goalCalories');
    expect(result).toHaveProperty('activityMultiplier');
    expect(result).toHaveProperty('goalAdjustment');
    expect(result).toHaveProperty('macroBreakdown');
    expect(result).toHaveProperty('weeklyDeficit');
    expect(result).toHaveProperty('monthlyWeightChange');
    expect(result).toHaveProperty('caloriesByMeal');

    expect(result.macroBreakdown).toHaveLength(3);
    expect(result.caloriesByMeal).toHaveLength(4);
  });

  // ───────────── Mifflin vs Harris-Benedict comparison ─────────────

  it('Harris-Benedict BMR typically higher than Mifflin for males', () => {
    const mifflin = calculateTDEE({ ...defaultMale, formula: 'mifflin' });
    const harris = calculateTDEE({ ...defaultMale, formula: 'harris' });
    expect(harris.bmr).toBeGreaterThan(mifflin.bmr);
  });

  it('Harris-Benedict BMR typically higher than Mifflin for females', () => {
    const mifflin = calculateTDEE({ ...defaultFemale, formula: 'mifflin' });
    const harris = calculateTDEE({ ...defaultFemale, formula: 'harris' });
    expect(harris.bmr).toBeGreaterThan(mifflin.bmr);
  });

  // ───────────── Imperial vs metric consistency ─────────────

  it('produces consistent results between imperial and metric for same person', () => {
    const imperial = calculateTDEE({
      age: 30, gender: 'male', weight: 176.37, height: 70.87,
      unitSystem: 'imperial', activityLevel: 'moderate', formula: 'mifflin', goal: 'maintain',
    });
    const metric = calculateTDEE({
      age: 30, gender: 'male', weight: 80, height: 180,
      unitSystem: 'metric', activityLevel: 'moderate', formula: 'mifflin', goal: 'maintain',
    });
    expect(Math.abs(imperial.bmr - metric.bmr)).toBeLessThanOrEqual(2);
    expect(Math.abs(imperial.tdee - metric.tdee)).toBeLessThanOrEqual(3);
  });

  // ───────────── Full worked example from spec ─────────────

  it('matches the BLUF worked example: 30yo male, 170 lbs, 70in, moderate', () => {
    // 170 lb = 77.111 kg, 70 in = 177.8 cm
    // Mifflin male: (10 × 77.111) + (6.25 × 177.8) - (5 × 30) + 5
    //   = 771.11 + 1111.25 - 150 + 5 = 1737.36 → 1737
    // TDEE = 1737 × 1.55 = 2692.35 → 2693 (from rounded BMR) or 2692.9 → 2693
    const result = calculateTDEE(defaultMale);
    expect(result.bmr).toBeCloseTo(1737, 0);
    // TDEE from raw: 1737.36 * 1.55 = 2692.908 → 2693
    expect(result.tdee).toBeCloseTo(2693, 0);
  });
});
