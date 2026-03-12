export interface MacroInput {
  age: number;
  sex: 'male' | 'female';
  weight: number;
  height: number;
  unitSystem: 'metric' | 'imperial';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
  goal: 'lose' | 'maintain' | 'gain';
  dietPreference: 'balanced' | 'high-protein' | 'low-carb' | 'keto';
}

export interface MacroOutput {
  totalCalories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  macroSplit: {
    protein: { grams: number; calories: number; percentage: number };
    carbs: { grams: number; calories: number; percentage: number };
    fat: { grams: number; calories: number; percentage: number };
  };
  mealBreakdown: {
    meal: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }[];
  bmr: number;
  tdee: number;
}

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

const MACRO_RATIOS: Record<string, { protein: number; carbs: number; fat: number }> = {
  balanced: { protein: 0.30, carbs: 0.40, fat: 0.30 },
  'high-protein': { protein: 0.40, carbs: 0.30, fat: 0.30 },
  'low-carb': { protein: 0.35, carbs: 0.25, fat: 0.40 },
  keto: { protein: 0.25, carbs: 0.05, fat: 0.70 },
};

const MEAL_SPLITS = [
  { meal: 'Breakfast', ratio: 0.30 },
  { meal: 'Lunch', ratio: 0.30 },
  { meal: 'Dinner', ratio: 0.30 },
  { meal: 'Snack', ratio: 0.10 },
];

/**
 * Calculates daily macronutrient targets based on TDEE and fitness goals.
 *
 * Step 1: Calculate BMR using Mifflin-St Jeor equation:
 *   Male:   BMR = (10 × weight_kg) + (6.25 × height_cm) − (5 × age) + 5
 *   Female: BMR = (10 × weight_kg) + (6.25 × height_cm) − (5 × age) − 161
 *
 * Step 2: Calculate TDEE = BMR × Activity Factor
 *
 * Step 3: Adjust for goal:
 *   Lose:     TDEE − 500 kcal/day
 *   Maintain: TDEE
 *   Gain:     TDEE + 500 kcal/day
 *
 * Step 4: Apply macro ratios based on diet preference:
 *   Balanced:     30% protein, 40% carbs, 30% fat
 *   High-Protein: 40% protein, 30% carbs, 30% fat
 *   Low-Carb:     35% protein, 25% carbs, 40% fat
 *   Keto:         25% protein, 5% carbs, 70% fat
 *
 * Step 5: Convert to grams:
 *   Protein grams = (calories × ratio) / 4
 *   Carb grams    = (calories × ratio) / 4
 *   Fat grams     = (calories × ratio) / 9
 *
 * Step 6: Distribute across meals (40%/30%/20%/10% split → corrected to 30/30/30/10)
 *
 * Sources:
 * - Mifflin MD, St Jeor ST, et al. "A new predictive equation for resting energy
 *   expenditure in healthy individuals." American Journal of Clinical Nutrition,
 *   1990;51(2):241–247.
 * - American College of Sports Medicine. ACSM's Guidelines for Exercise Testing and
 *   Prescription, 11th ed. Wolters Kluwer, 2021.
 * - Jäger R, et al. "International Society of Sports Nutrition Position Stand: protein
 *   and exercise." Journal of the International Society of Sports Nutrition, 2017;14:20.
 */
export function calculateMacros(input: MacroInput): MacroOutput {
  const { age, sex, activityLevel, goal, dietPreference } = input;

  let weightKg: number;
  let heightCm: number;

  if (input.unitSystem === 'metric') {
    weightKg = input.weight;
    heightCm = input.height;
  } else {
    weightKg = input.weight * 0.453592;
    heightCm = input.height * 2.54;
  }

  // Step 1: Calculate BMR via Mifflin-St Jeor
  let bmr: number;
  if (sex === 'male') {
    bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
  } else {
    bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
  }

  // Step 2: Calculate TDEE
  const activityMultiplier = ACTIVITY_MULTIPLIERS[activityLevel];
  const tdee = bmr * activityMultiplier;

  // Step 3: Adjust for goal
  let totalCalories: number;
  switch (goal) {
    case 'lose':
      totalCalories = tdee - 500;
      break;
    case 'gain':
      totalCalories = tdee + 500;
      break;
    default:
      totalCalories = tdee;
  }

  // Step 4: Apply macro ratios
  const ratios = MACRO_RATIOS[dietPreference];

  const proteinCals = totalCalories * ratios.protein;
  const carbCals = totalCalories * ratios.carbs;
  const fatCals = totalCalories * ratios.fat;

  // Step 5: Convert to grams
  const proteinGrams = Math.round(proteinCals / 4);
  const carbGrams = Math.round(carbCals / 4);
  const fatGrams = Math.round(fatCals / 9);

  const macroSplit = {
    protein: {
      grams: proteinGrams,
      calories: Math.round(proteinCals),
      percentage: Math.round(ratios.protein * 100),
    },
    carbs: {
      grams: carbGrams,
      calories: Math.round(carbCals),
      percentage: Math.round(ratios.carbs * 100),
    },
    fat: {
      grams: fatGrams,
      calories: Math.round(fatCals),
      percentage: Math.round(ratios.fat * 100),
    },
  };

  // Step 6: Distribute across meals
  const mealBreakdown = MEAL_SPLITS.map(({ meal, ratio }) => ({
    meal,
    calories: Math.round(totalCalories * ratio),
    protein: Math.round(proteinGrams * ratio),
    carbs: Math.round(carbGrams * ratio),
    fat: Math.round(fatGrams * ratio),
  }));

  return {
    totalCalories: Math.round(totalCalories),
    proteinGrams,
    carbGrams,
    fatGrams,
    macroSplit,
    mealBreakdown,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
  };
}

// Wrapper for the formula registry
export function calculateMacrosFromInputs(inputs: Record<string, unknown>): Record<string, unknown> {
  const result = calculateMacros({
    age: inputs.age as number,
    sex: (inputs.sex as string) === 'male' ? 'male' : 'female',
    weight: inputs.weight as number,
    height: inputs.height as number,
    unitSystem: (inputs.unitSystem as string) === 'imperial' ? 'imperial' : 'metric',
    activityLevel: inputs.activityLevel as MacroInput['activityLevel'],
    goal: inputs.goal as MacroInput['goal'],
    dietPreference: inputs.dietPreference as MacroInput['dietPreference'],
  });
  return result as unknown as Record<string, unknown>;
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'macros': calculateMacrosFromInputs,
};
