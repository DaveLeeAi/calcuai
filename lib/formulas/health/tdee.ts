export interface TDEEInput {
  age: number;
  gender: 'male' | 'female';
  weight: number;
  height: number;
  unitSystem: 'metric' | 'imperial';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
  formula: 'mifflin' | 'harris';
  goal: 'maintain' | 'mildLoss' | 'loss' | 'extremeLoss' | 'mildGain' | 'gain';
}

export interface MacroBreakdown {
  label: string;
  grams: number;
  calories: number;
  percentage: number;
}

export interface MealBreakdown {
  label: string;
  value: number;
}

export interface TDEEOutput {
  bmr: number;
  tdee: number;
  goalCalories: number;
  activityMultiplier: number;
  goalAdjustment: number;
  macroBreakdown: MacroBreakdown[];
  weeklyDeficit: number;
  monthlyWeightChange: number;
  caloriesByMeal: MealBreakdown[];
}

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

const GOAL_ADJUSTMENTS: Record<string, number> = {
  maintain: 0,
  mildLoss: -250,
  loss: -500,
  extremeLoss: -1000,
  mildGain: 250,
  gain: 500,
};

/** Minimum safe calorie floor */
const MIN_CALORIES = 1200;

/**
 * Calculates Total Daily Energy Expenditure (TDEE):
 *
 *   TDEE = BMR × Activity Multiplier
 *
 * BMR Formulas:
 *
 * Mifflin-St Jeor (1990):
 *   Male:   BMR = (10 × weight_kg) + (6.25 × height_cm) − (5 × age) + 5
 *   Female: BMR = (10 × weight_kg) + (6.25 × height_cm) − (5 × age) − 161
 *
 * Harris-Benedict (Revised by Roza & Shizgal, 1984):
 *   Male:   BMR = (13.397 × weight_kg) + (4.799 × height_cm) − (5.677 × age) + 88.362
 *   Female: BMR = (9.247 × weight_kg) + (3.098 × height_cm) − (4.330 × age) + 447.593
 *
 * Activity Multipliers:
 *   Sedentary (little/no exercise):      1.2
 *   Lightly active (1-3 days/week):      1.375
 *   Moderately active (3-5 days/week):   1.55
 *   Very active (6-7 days/week):         1.725
 *   Extra active (physical job / 2×/day): 1.9
 *
 * Goal Adjustments (kcal/day):
 *   Maintain:      0
 *   Mild loss:    −250 (~0.5 lb/week)
 *   Loss:         −500 (~1 lb/week)
 *   Extreme loss: −1000 (~2 lb/week)
 *   Mild gain:    +250 (~0.5 lb/week)
 *   Gain:         +500 (~1 lb/week)
 *
 * Macro split: 30% protein / 40% carbs / 30% fat
 *   Protein grams = goalCalories × 0.30 / 4
 *   Carb grams    = goalCalories × 0.40 / 4
 *   Fat grams     = goalCalories × 0.30 / 9
 *
 * Sources:
 * - Mifflin MD, St Jeor ST, et al. "A new predictive equation for resting energy
 *   expenditure in healthy individuals." American Journal of Clinical Nutrition,
 *   1990;51(2):241–247.
 * - Roza AM, Shizgal HM. "The Harris Benedict equation reevaluated: resting energy
 *   requirements and the body cell mass." American Journal of Clinical Nutrition,
 *   1984;40(1):168–182.
 * - ACSM. "ACSM's Guidelines for Exercise Testing and Prescription." 11th ed., 2021.
 */
export function calculateTDEE(input: TDEEInput): TDEEOutput {
  const { age, gender, activityLevel, formula, goal } = input;

  // Unit conversion
  let weightKg: number;
  let heightCm: number;

  if (input.unitSystem === 'metric') {
    weightKg = input.weight;
    heightCm = input.height;
  } else {
    weightKg = input.weight * 0.453592;
    heightCm = input.height * 2.54;
  }

  // Calculate BMR based on selected formula
  let bmr: number;

  if (formula === 'mifflin') {
    if (gender === 'male') {
      bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
    } else {
      bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
    }
  } else {
    // Harris-Benedict (revised 1984)
    if (gender === 'male') {
      bmr = (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * age) + 88.362;
    } else {
      bmr = (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * age) + 447.593;
    }
  }

  // TDEE = BMR × activity multiplier
  const activityMultiplier = ACTIVITY_MULTIPLIERS[activityLevel];
  const tdee = bmr * activityMultiplier;

  // Goal adjustment
  const goalAdjustment = GOAL_ADJUSTMENTS[goal];
  const goalCalories = Math.max(MIN_CALORIES, tdee + goalAdjustment);

  // Macro breakdown: 30% protein / 40% carbs / 30% fat
  const proteinCals = goalCalories * 0.30;
  const carbCals = goalCalories * 0.40;
  const fatCals = goalCalories * 0.30;

  const macroBreakdown: MacroBreakdown[] = [
    {
      label: 'Protein (30%)',
      grams: Math.round(proteinCals / 4),
      calories: Math.round(proteinCals),
      percentage: 30,
    },
    {
      label: 'Carbohydrates (40%)',
      grams: Math.round(carbCals / 4),
      calories: Math.round(carbCals),
      percentage: 40,
    },
    {
      label: 'Fat (30%)',
      grams: Math.round(fatCals / 9),
      calories: Math.round(fatCals),
      percentage: 30,
    },
  ];

  // Weekly deficit/surplus
  const weeklyDeficit = goalAdjustment * 7;

  // Monthly weight change in lbs (3500 kcal ≈ 1 lb of body weight)
  const monthlyWeightChange = (goalAdjustment * 30) / 3500;

  // Calories by meal: Breakfast 25%, Lunch 35%, Dinner 30%, Snacks 10%
  const caloriesByMeal: MealBreakdown[] = [
    { label: 'Breakfast (25%)', value: Math.round(goalCalories * 0.25) },
    { label: 'Lunch (35%)', value: Math.round(goalCalories * 0.35) },
    { label: 'Dinner (30%)', value: Math.round(goalCalories * 0.30) },
    { label: 'Snacks (10%)', value: Math.round(goalCalories * 0.10) },
  ];

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    goalCalories: Math.round(goalCalories),
    activityMultiplier,
    goalAdjustment,
    macroBreakdown,
    weeklyDeficit,
    monthlyWeightChange: Math.round(monthlyWeightChange * 100) / 100,
    caloriesByMeal,
  };
}

// Wrapper for the formula registry
export function calculateTDEEFromInputs(inputs: Record<string, unknown>): Record<string, unknown> {
  const genderRaw = inputs.gender as string;
  const formulaRaw = inputs.formula as string;
  const goalRaw = inputs.goal as string;
  const activityRaw = inputs.activityLevel as string;

  const result = calculateTDEE({
    age: inputs.age as number,
    gender: genderRaw === 'female' ? 'female' : 'male',
    weight: inputs.weight as number,
    height: inputs.height as number,
    unitSystem: (inputs.unitSystem as string) === 'imperial' ? 'imperial' : 'metric',
    activityLevel: (['sedentary', 'light', 'moderate', 'active', 'veryActive'].includes(activityRaw)
      ? activityRaw : 'moderate') as TDEEInput['activityLevel'],
    formula: formulaRaw === 'harris' ? 'harris' : 'mifflin',
    goal: (['maintain', 'mildLoss', 'loss', 'extremeLoss', 'mildGain', 'gain'].includes(goalRaw)
      ? goalRaw : 'maintain') as TDEEInput['goal'],
  });
  return result as unknown as Record<string, unknown>;
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'tdee': calculateTDEEFromInputs,
};
