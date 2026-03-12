import { calculateCalorieNeeds } from '@/lib/formulas/health/calorie-needs';

describe('calculateCalorieNeeds', () => {
  // Standard BMR calculations (Mifflin-St Jeor)
  it('calculates BMR for average male (metric)', () => {
    const result = calculateCalorieNeeds({
      age: 30, sex: 'male', weight: 80, height: 180,
      unitSystem: 'metric', activityLevel: 'sedentary', goal: 'maintain',
    });
    // BMR = (10 × 80) + (6.25 × 180) − (5 × 30) + 5
    //     = 800 + 1125 - 150 + 5 = 1780
    expect(result.bmr).toBe(1780);
  });

  it('calculates BMR for average female (metric)', () => {
    const result = calculateCalorieNeeds({
      age: 30, sex: 'female', weight: 65, height: 165,
      unitSystem: 'metric', activityLevel: 'sedentary', goal: 'maintain',
    });
    // BMR = (10 × 65) + (6.25 × 165) − (5 × 30) − 161
    //     = 650 + 1031.25 - 150 - 161 = 1370
    expect(result.bmr).toBeCloseTo(1370, 0);
  });

  // TDEE calculations with activity levels
  it('calculates TDEE for sedentary activity (1.2x)', () => {
    const result = calculateCalorieNeeds({
      age: 30, sex: 'male', weight: 80, height: 180,
      unitSystem: 'metric', activityLevel: 'sedentary', goal: 'maintain',
    });
    // TDEE = 1780 × 1.2 = 2136
    expect(result.tdee).toBe(2136);
  });

  it('calculates TDEE for moderately active (1.55x)', () => {
    const result = calculateCalorieNeeds({
      age: 30, sex: 'male', weight: 80, height: 180,
      unitSystem: 'metric', activityLevel: 'moderate', goal: 'maintain',
    });
    // TDEE = 1780 × 1.55 = 2759
    expect(result.tdee).toBe(2759);
  });

  it('calculates TDEE for very active (1.9x)', () => {
    const result = calculateCalorieNeeds({
      age: 30, sex: 'male', weight: 80, height: 180,
      unitSystem: 'metric', activityLevel: 'veryActive', goal: 'maintain',
    });
    // TDEE = 1780 × 1.9 = 3382
    expect(result.tdee).toBe(3382);
  });

  // Goal-based calorie adjustments
  it('subtracts 500 calories for weight loss', () => {
    const result = calculateCalorieNeeds({
      age: 30, sex: 'male', weight: 80, height: 180,
      unitSystem: 'metric', activityLevel: 'moderate', goal: 'lose',
    });
    expect(result.targetCalories).toBe(result.tdee - 500);
    expect(result.weightChangePerWeek).toBe(-0.45);
  });

  it('adds 500 calories for weight gain', () => {
    const result = calculateCalorieNeeds({
      age: 30, sex: 'male', weight: 80, height: 180,
      unitSystem: 'metric', activityLevel: 'moderate', goal: 'gain',
    });
    expect(result.targetCalories).toBe(result.tdee + 500);
    expect(result.weightChangePerWeek).toBe(0.45);
  });

  it('maintains same calories for maintenance', () => {
    const result = calculateCalorieNeeds({
      age: 30, sex: 'male', weight: 80, height: 180,
      unitSystem: 'metric', activityLevel: 'moderate', goal: 'maintain',
    });
    expect(result.targetCalories).toBe(result.tdee);
    expect(result.weightChangePerWeek).toBe(0);
  });

  // Macro calculations
  it('calculates macros for weight loss (30/45/25 split)', () => {
    const result = calculateCalorieNeeds({
      age: 30, sex: 'male', weight: 80, height: 180,
      unitSystem: 'metric', activityLevel: 'moderate', goal: 'lose',
    });
    expect(result.macros.protein.percentage).toBe(30);
    expect(result.macros.fat.percentage).toBe(25);
    expect(result.macros.carbs.percentage).toBe(45);
    // Total macro calories should approximate target
    const totalMacroCals = result.macros.protein.calories + result.macros.carbs.calories + result.macros.fat.calories;
    expect(totalMacroCals).toBeCloseTo(result.targetCalories, -1);
  });

  it('calculates macros for maintenance (25/45/30 split)', () => {
    const result = calculateCalorieNeeds({
      age: 30, sex: 'male', weight: 80, height: 180,
      unitSystem: 'metric', activityLevel: 'moderate', goal: 'maintain',
    });
    expect(result.macros.protein.percentage).toBe(25);
    expect(result.macros.fat.percentage).toBe(30);
    expect(result.macros.carbs.percentage).toBe(45);
  });

  // Imperial unit conversion
  it('handles imperial units correctly', () => {
    const result = calculateCalorieNeeds({
      age: 30, sex: 'male', weight: 176, height: 71,
      unitSystem: 'imperial', activityLevel: 'sedentary', goal: 'maintain',
    });
    // 176 lbs = 79.8 kg, 71 in = 180.3 cm
    // BMR ≈ (10 × 79.8) + (6.25 × 180.3) - 150 + 5 ≈ 1778
    expect(result.bmr).toBeCloseTo(1780, -1);
  });

  // TDEE by activity table
  it('returns TDEE values for all activity levels', () => {
    const result = calculateCalorieNeeds({
      age: 30, sex: 'male', weight: 80, height: 180,
      unitSystem: 'metric', activityLevel: 'moderate', goal: 'maintain',
    });
    expect(result.tdeeByActivity.sedentary).toBe(Math.round(1780 * 1.2));
    expect(result.tdeeByActivity.light).toBe(Math.round(1780 * 1.375));
    expect(result.tdeeByActivity.moderate).toBe(Math.round(1780 * 1.55));
    expect(result.tdeeByActivity.active).toBe(Math.round(1780 * 1.725));
    expect(result.tdeeByActivity.veryActive).toBe(Math.round(1780 * 1.9));
  });

  // Age impact
  it('older age produces lower BMR', () => {
    const young = calculateCalorieNeeds({
      age: 25, sex: 'male', weight: 80, height: 180,
      unitSystem: 'metric', activityLevel: 'sedentary', goal: 'maintain',
    });
    const old = calculateCalorieNeeds({
      age: 55, sex: 'male', weight: 80, height: 180,
      unitSystem: 'metric', activityLevel: 'sedentary', goal: 'maintain',
    });
    expect(old.bmr).toBeLessThan(young.bmr);
    // Difference should be (55-25)*5 = 150 cal
    expect(young.bmr - old.bmr).toBe(150);
  });

  // Sex difference
  it('male has higher BMR than female with same stats', () => {
    const male = calculateCalorieNeeds({
      age: 30, sex: 'male', weight: 70, height: 170,
      unitSystem: 'metric', activityLevel: 'sedentary', goal: 'maintain',
    });
    const female = calculateCalorieNeeds({
      age: 30, sex: 'female', weight: 70, height: 170,
      unitSystem: 'metric', activityLevel: 'sedentary', goal: 'maintain',
    });
    expect(male.bmr).toBeGreaterThan(female.bmr);
    // Difference should be 5 - (-161) = 166
    expect(male.bmr - female.bmr).toBe(166);
  });
});
