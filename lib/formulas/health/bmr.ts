export interface BMRInput {
  age: number;
  sex: 'male' | 'female';
  weight: number;
  height: number;
  unitSystem: 'metric' | 'imperial';
}

export interface BMROutput {
  mifflinBMR: number;
  harrisBenedictBMR: number;
  averageBMR: number;
  dailyCalorieRange: {
    sedentary: number;
    active: number;
  };
  bmrComparison: {
    formula: string;
    bmr: number;
    sedentary: number;
    lightlyActive: number;
    moderatelyActive: number;
    veryActive: number;
  }[];
}

/**
 * Calculates Basal Metabolic Rate using two validated formulas:
 *
 * Mifflin-St Jeor (1990):
 *   Male:   BMR = (10 × weight_kg) + (6.25 × height_cm) − (5 × age) + 5
 *   Female: BMR = (10 × weight_kg) + (6.25 × height_cm) − (5 × age) − 161
 *
 * Harris-Benedict (Revised by Roza & Shizgal, 1984):
 *   Male:   BMR = (13.397 × weight_kg) + (4.799 × height_cm) − (5.677 × age) + 88.362
 *   Female: BMR = (9.247 × weight_kg) + (3.098 × height_cm) − (4.330 × age) + 447.593
 *
 * Sources:
 * - Mifflin MD, St Jeor ST, et al. "A new predictive equation for resting energy
 *   expenditure in healthy individuals." American Journal of Clinical Nutrition,
 *   1990;51(2):241–247.
 * - Roza AM, Shizgal HM. "The Harris Benedict equation reevaluated: resting energy
 *   requirements and the body cell mass." American Journal of Clinical Nutrition,
 *   1984;40(1):168–182.
 */
export function calculateBMR(input: BMRInput): BMROutput {
  const { age, sex } = input;

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
  let mifflinBMR: number;
  if (sex === 'male') {
    mifflinBMR = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
  } else {
    mifflinBMR = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
  }

  // Harris-Benedict (Revised 1984) BMR
  let harrisBenedictBMR: number;
  if (sex === 'male') {
    harrisBenedictBMR = (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * age) + 88.362;
  } else {
    harrisBenedictBMR = (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * age) + 447.593;
  }

  const averageBMR = (mifflinBMR + harrisBenedictBMR) / 2;

  // Daily calorie range using sedentary (1.2) and active (1.725) multipliers
  const dailyCalorieRange = {
    sedentary: Math.round(averageBMR * 1.2),
    active: Math.round(averageBMR * 1.725),
  };

  // Comparison table with both formulas across activity levels
  const activityMultipliers = {
    sedentary: 1.2,
    lightlyActive: 1.375,
    moderatelyActive: 1.55,
    veryActive: 1.725,
  };

  const bmrComparison = [
    {
      formula: 'Mifflin-St Jeor',
      bmr: Math.round(mifflinBMR),
      sedentary: Math.round(mifflinBMR * activityMultipliers.sedentary),
      lightlyActive: Math.round(mifflinBMR * activityMultipliers.lightlyActive),
      moderatelyActive: Math.round(mifflinBMR * activityMultipliers.moderatelyActive),
      veryActive: Math.round(mifflinBMR * activityMultipliers.veryActive),
    },
    {
      formula: 'Harris-Benedict',
      bmr: Math.round(harrisBenedictBMR),
      sedentary: Math.round(harrisBenedictBMR * activityMultipliers.sedentary),
      lightlyActive: Math.round(harrisBenedictBMR * activityMultipliers.lightlyActive),
      moderatelyActive: Math.round(harrisBenedictBMR * activityMultipliers.moderatelyActive),
      veryActive: Math.round(harrisBenedictBMR * activityMultipliers.veryActive),
    },
  ];

  return {
    mifflinBMR: Math.round(mifflinBMR),
    harrisBenedictBMR: Math.round(harrisBenedictBMR),
    averageBMR: Math.round(averageBMR),
    dailyCalorieRange,
    bmrComparison,
  };
}

// Wrapper for the formula registry
export function calculateBMRFromInputs(inputs: Record<string, unknown>): Record<string, unknown> {
  const result = calculateBMR({
    age: inputs.age as number,
    sex: (inputs.sex as string) === 'male' ? 'male' : 'female',
    weight: inputs.weight as number,
    height: inputs.height as number,
    unitSystem: (inputs.unitSystem as string) === 'imperial' ? 'imperial' : 'metric',
  });
  return result as unknown as Record<string, unknown>;
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'bmr': calculateBMRFromInputs,
};
