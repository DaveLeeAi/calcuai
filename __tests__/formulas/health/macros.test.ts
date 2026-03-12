import { calculateMacros } from '@/lib/formulas/health/macros';

describe('calculateMacros', () => {
  const baseMaleInput = {
    age: 30,
    sex: 'male' as const,
    weight: 180,
    height: 70,
    unitSystem: 'imperial' as const,
    activityLevel: 'moderate' as const,
    goal: 'maintain' as const,
    dietPreference: 'balanced' as const,
  };

  const baseFemaleInput = {
    age: 30,
    sex: 'female' as const,
    weight: 140,
    height: 65,
    unitSystem: 'imperial' as const,
    activityLevel: 'moderate' as const,
    goal: 'maintain' as const,
    dietPreference: 'balanced' as const,
  };

  // Balanced diet — male maintain
  it('calculates balanced macros for male on maintenance', () => {
    const result = calculateMacros(baseMaleInput);
    // BMR ≈ 1783, TDEE = 1783 × 1.55 ≈ 2762
    expect(result.totalCalories).toBeCloseTo(2762, -1);
    // Balanced: 30% protein, 40% carbs, 30% fat
    expect(result.macroSplit.protein.percentage).toBe(30);
    expect(result.macroSplit.carbs.percentage).toBe(40);
    expect(result.macroSplit.fat.percentage).toBe(30);
    // Protein grams = 2762 × 0.30 / 4 ≈ 207
    expect(result.proteinGrams).toBeCloseTo(207, -1);
    // Carb grams = 2762 × 0.40 / 4 ≈ 276
    expect(result.carbGrams).toBeCloseTo(276, -1);
    // Fat grams = 2762 × 0.30 / 9 ≈ 92
    expect(result.fatGrams).toBeCloseTo(92, -1);
  });

  // Weight loss goal
  it('applies 500 calorie deficit for weight loss goal', () => {
    const result = calculateMacros({ ...baseMaleInput, goal: 'lose' });
    const maintainResult = calculateMacros(baseMaleInput);
    expect(result.totalCalories).toBe(maintainResult.totalCalories - 500);
  });

  // Weight gain goal
  it('applies 500 calorie surplus for weight gain goal', () => {
    const result = calculateMacros({ ...baseMaleInput, goal: 'gain' });
    const maintainResult = calculateMacros(baseMaleInput);
    expect(result.totalCalories).toBe(maintainResult.totalCalories + 500);
  });

  // High-protein diet
  it('calculates high-protein macro split correctly', () => {
    const result = calculateMacros({ ...baseMaleInput, dietPreference: 'high-protein' });
    expect(result.macroSplit.protein.percentage).toBe(40);
    expect(result.macroSplit.carbs.percentage).toBe(30);
    expect(result.macroSplit.fat.percentage).toBe(30);
    // Verify gram conversion: protein = cals × 0.40 / 4
    const expectedProtein = Math.round(result.totalCalories * 0.40 / 4);
    expect(result.proteinGrams).toBe(expectedProtein);
  });

  // Low-carb diet
  it('calculates low-carb macro split correctly', () => {
    const result = calculateMacros({ ...baseMaleInput, dietPreference: 'low-carb' });
    expect(result.macroSplit.protein.percentage).toBe(35);
    expect(result.macroSplit.carbs.percentage).toBe(25);
    expect(result.macroSplit.fat.percentage).toBe(40);
  });

  // Keto diet
  it('calculates keto macro split correctly', () => {
    const result = calculateMacros({ ...baseMaleInput, dietPreference: 'keto' });
    expect(result.macroSplit.protein.percentage).toBe(25);
    expect(result.macroSplit.carbs.percentage).toBe(5);
    expect(result.macroSplit.fat.percentage).toBe(70);
    // Keto carbs should be very low
    // Carb grams = cals × 0.05 / 4
    const expectedCarbs = Math.round(result.totalCalories * 0.05 / 4);
    expect(result.carbGrams).toBe(expectedCarbs);
  });

  // Female balanced
  it('calculates balanced macros for female on maintenance', () => {
    const result = calculateMacros(baseFemaleInput);
    // BMR ≈ 1356, TDEE = 1356 × 1.55 ≈ 2102
    expect(result.totalCalories).toBeCloseTo(2102, -1);
    expect(result.proteinGrams).toBeCloseTo(Math.round(result.totalCalories * 0.30 / 4), 0);
  });

  // Activity levels
  it('sedentary activity produces lower TDEE than active', () => {
    const sedentary = calculateMacros({ ...baseMaleInput, activityLevel: 'sedentary' });
    const active = calculateMacros({ ...baseMaleInput, activityLevel: 'active' });
    expect(sedentary.totalCalories).toBeLessThan(active.totalCalories);
    expect(Math.abs(sedentary.tdee - sedentary.bmr * 1.2)).toBeLessThanOrEqual(1);
    expect(Math.abs(active.tdee - active.bmr * 1.725)).toBeLessThanOrEqual(1);
  });

  // Very active
  it('calculates correct TDEE for very active level', () => {
    const result = calculateMacros({ ...baseMaleInput, activityLevel: 'veryActive' });
    expect(Math.abs(result.tdee - result.bmr * 1.9)).toBeLessThanOrEqual(1);
  });

  // Meal breakdown
  it('distributes macros across 4 meals correctly', () => {
    const result = calculateMacros(baseMaleInput);
    expect(result.mealBreakdown).toHaveLength(4);
    expect(result.mealBreakdown[0].meal).toBe('Breakfast');
    expect(result.mealBreakdown[1].meal).toBe('Lunch');
    expect(result.mealBreakdown[2].meal).toBe('Dinner');
    expect(result.mealBreakdown[3].meal).toBe('Snack');

    // Verify meal splits sum approximately to totals
    const totalMealCals = result.mealBreakdown.reduce((sum, m) => sum + m.calories, 0);
    expect(totalMealCals).toBeCloseTo(result.totalCalories, -1);

    const totalMealProtein = result.mealBreakdown.reduce((sum, m) => sum + m.protein, 0);
    expect(totalMealProtein).toBeCloseTo(result.proteinGrams, -1);
  });

  // Metric inputs
  it('calculates correctly with metric inputs', () => {
    const result = calculateMacros({
      age: 30, sex: 'male', weight: 80, height: 178,
      unitSystem: 'metric', activityLevel: 'moderate',
      goal: 'maintain', dietPreference: 'balanced',
    });
    // BMR = (10 × 80) + (6.25 × 178) - (5 × 30) + 5 = 800 + 1112.5 - 150 + 5 = 1767.5 → 1768
    expect(result.bmr).toBeCloseTo(1768, 0);
    expect(result.tdee).toBeCloseTo(Math.round(1767.5 * 1.55), 0);
  });

  // BMR and TDEE are included in output
  it('includes BMR and TDEE in output', () => {
    const result = calculateMacros(baseMaleInput);
    expect(result.bmr).toBeGreaterThan(0);
    expect(result.tdee).toBeGreaterThan(result.bmr);
    expect(Math.abs(result.tdee - result.bmr * 1.55)).toBeLessThanOrEqual(1);
  });

  // Female weight loss with keto
  it('calculates female weight loss on keto diet', () => {
    const result = calculateMacros({
      ...baseFemaleInput, goal: 'lose', dietPreference: 'keto',
    });
    // Should be TDEE - 500, with keto ratios
    const maintainResult = calculateMacros(baseFemaleInput);
    expect(result.totalCalories).toBe(maintainResult.tdee - 500);
    expect(result.macroSplit.fat.percentage).toBe(70);
    // Fat should be the dominant macro in grams for keto
    expect(result.fatGrams).toBeGreaterThan(result.proteinGrams);
    expect(result.fatGrams).toBeGreaterThan(result.carbGrams);
  });

  // Snack is smallest meal
  it('snack is the smallest meal in breakdown', () => {
    const result = calculateMacros(baseMaleInput);
    const snack = result.mealBreakdown[3];
    const breakfast = result.mealBreakdown[0];
    expect(snack.calories).toBeLessThan(breakfast.calories);
    // Snack should be 10% of total
    expect(snack.calories).toBe(Math.round(result.totalCalories * 0.10));
  });
});
