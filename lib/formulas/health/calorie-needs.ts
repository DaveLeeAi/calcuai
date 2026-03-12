export interface CalorieInput {
  age: number;
  sex: 'male' | 'female';
  weight: number;
  height: number;
  unitSystem: 'metric' | 'imperial';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
  goal: 'lose' | 'maintain' | 'gain';
}

export interface CalorieOutput {
  bmr: number;
  tdee: number;
  targetCalories: number;
  macros: {
    protein: { grams: number; calories: number; percentage: number };
    carbs: { grams: number; calories: number; percentage: number };
    fat: { grams: number; calories: number; percentage: number };
  };
  tdeeByActivity: {
    sedentary: number;
    light: number;
    moderate: number;
    active: number;
    veryActive: number;
  };
  weightChangePerWeek: number;
}

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

/**
 * Mifflin-St Jeor equation for Basal Metabolic Rate (BMR):
 *
 * Male:   BMR = (10 × weight_kg) + (6.25 × height_cm) − (5 × age) + 5
 * Female: BMR = (10 × weight_kg) + (6.25 × height_cm) − (5 × age) − 161
 *
 * TDEE = BMR × Activity Factor
 *
 * Activity Factors:
 *   Sedentary (little/no exercise):      1.2
 *   Lightly active (1-3 days/week):      1.375
 *   Moderately active (3-5 days/week):   1.55
 *   Very active (6-7 days/week):         1.725
 *   Extra active (2× per day):           1.9
 *
 * Source: Mifflin MD, St Jeor ST, et al. (1990). "A new predictive equation for
 * resting energy expenditure in healthy individuals." American Journal of
 * Clinical Nutrition, 51(2), 241-247.
 */
export function calculateCalorieNeeds(input: CalorieInput): CalorieOutput {
  const { age, sex, activityLevel, goal } = input;

  let weightKg: number;
  let heightCm: number;

  if (input.unitSystem === 'metric') {
    weightKg = input.weight;
    heightCm = input.height;
  } else {
    weightKg = input.weight * 0.453592;
    heightCm = input.height * 2.54;
  }

  // Mifflin-St Jeor BMR
  let bmr: number;
  if (sex === 'male') {
    bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
  } else {
    bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
  }

  const activityMultiplier = ACTIVITY_MULTIPLIERS[activityLevel];
  const tdee = bmr * activityMultiplier;

  // TDEE by all activity levels
  const tdeeByActivity = {
    sedentary: Math.round(bmr * ACTIVITY_MULTIPLIERS.sedentary),
    light: Math.round(bmr * ACTIVITY_MULTIPLIERS.light),
    moderate: Math.round(bmr * ACTIVITY_MULTIPLIERS.moderate),
    active: Math.round(bmr * ACTIVITY_MULTIPLIERS.active),
    veryActive: Math.round(bmr * ACTIVITY_MULTIPLIERS.veryActive),
  };

  // Calorie adjustment based on goal
  let targetCalories: number;
  let weightChangePerWeek: number; // in kg

  switch (goal) {
    case 'lose':
      targetCalories = tdee - 500; // ~0.45 kg/week loss
      weightChangePerWeek = -0.45;
      break;
    case 'gain':
      targetCalories = tdee + 500; // ~0.45 kg/week gain
      weightChangePerWeek = 0.45;
      break;
    default:
      targetCalories = tdee;
      weightChangePerWeek = 0;
  }

  // Macro split based on goal
  const macros = calculateMacros(targetCalories, weightKg, goal);

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories: Math.round(targetCalories),
    macros,
    tdeeByActivity,
    weightChangePerWeek,
  };
}

function calculateMacros(
  calories: number,
  weightKg: number,
  goal: 'lose' | 'maintain' | 'gain'
): CalorieOutput['macros'] {
  let proteinRatio: number;
  let fatRatio: number;

  switch (goal) {
    case 'lose':
      proteinRatio = 0.30;
      fatRatio = 0.25;
      break;
    case 'gain':
      proteinRatio = 0.25;
      fatRatio = 0.25;
      break;
    default:
      proteinRatio = 0.25;
      fatRatio = 0.30;
  }

  const carbRatio = 1 - proteinRatio - fatRatio;

  const proteinCals = calories * proteinRatio;
  const fatCals = calories * fatRatio;
  const carbCals = calories * carbRatio;

  return {
    protein: {
      grams: Math.round(proteinCals / 4),
      calories: Math.round(proteinCals),
      percentage: Math.round(proteinRatio * 100),
    },
    carbs: {
      grams: Math.round(carbCals / 4),
      calories: Math.round(carbCals),
      percentage: Math.round(carbRatio * 100),
    },
    fat: {
      grams: Math.round(fatCals / 9),
      calories: Math.round(fatCals),
      percentage: Math.round(fatRatio * 100),
    },
  };
}

// Wrapper for the formula registry
export function calculateCalorieNeedsFromInputs(inputs: Record<string, unknown>): Record<string, unknown> {
  const result = calculateCalorieNeeds({
    age: inputs.age as number,
    sex: (inputs.sex as string) === 'male' ? 'male' : 'female',
    weight: inputs.weight as number,
    height: inputs.height as number,
    unitSystem: (inputs.unitSystem as string) === 'imperial' ? 'imperial' : 'metric',
    activityLevel: inputs.activityLevel as CalorieInput['activityLevel'],
    goal: inputs.goal as CalorieInput['goal'],
  });
  return result as unknown as Record<string, unknown>;
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'calorie-needs': calculateCalorieNeedsFromInputs,
};
