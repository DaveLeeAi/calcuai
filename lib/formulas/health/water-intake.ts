export interface WaterIntakeInput {
  weight: number;        // lbs
  activityLevel: string; // sedentary | light | moderate | active | extreme
  climate: string;       // cold | temperate | hot
  pregnant?: boolean;
  breastfeeding?: boolean;
}

export interface WaterIntakeOutput {
  dailyOunces: number;
  dailyLiters: number;
  dailyCups: number;
  dailyBottles: number;
  summary: { label: string; value: string | number }[];
}

/**
 * Water Intake Calculator
 *
 * Base formula: bodyweight (lbs) x 0.5 = base ounces per day
 *
 * Activity multipliers:
 *   sedentary: 1.0x
 *   light:     1.12x
 *   moderate:  1.24x
 *   active:    1.36x
 *   extreme:   1.5x
 *
 * Climate adjustments:
 *   cold:      -4 oz
 *   temperate:  0 oz
 *   hot:       +16 oz
 *
 * Additional:
 *   Pregnancy:      +10 oz (~300 mL per IOM)
 *   Breastfeeding:  +32 oz (~1 L per IOM)
 *
 * Source: National Academies of Sciences, Engineering, and Medicine —
 *         Dietary Reference Intakes for Water, Potassium, Sodium, Chloride,
 *         and Sulfate (2005).
 */
export function calculateWaterIntake(input: WaterIntakeInput): WaterIntakeOutput {
  const weight = input.weight != null ? Number(input.weight) : 160;
  const activityLevel = String(input.activityLevel || 'moderate');
  const climate = String(input.climate || 'temperate');
  const pregnant = Boolean(input.pregnant);
  const breastfeeding = Boolean(input.breastfeeding);

  if (weight <= 0) {
    return {
      dailyOunces: 0,
      dailyLiters: 0,
      dailyCups: 0,
      dailyBottles: 0,
      summary: [],
    };
  }

  // Base formula: half your body weight in ounces
  const baseOunces = weight * 0.5;

  // Activity multiplier
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.0,
    light: 1.12,
    moderate: 1.24,
    active: 1.36,
    extreme: 1.5,
  };
  const multiplier = activityMultipliers[activityLevel] ?? 1.24;

  // Climate adjustment (oz)
  const climateAdjustments: Record<string, number> = {
    cold: -4,
    temperate: 0,
    hot: 16,
  };
  const adjustment = climateAdjustments[climate] ?? 0;

  // Calculate total
  let totalOunces = baseOunces * multiplier + adjustment;

  // Pregnancy and breastfeeding additions
  if (pregnant) {
    totalOunces += 10;
  }
  if (breastfeeding) {
    totalOunces += 32;
  }

  totalOunces = Math.round(totalOunces);
  const dailyLiters = parseFloat((totalOunces * 0.0295735).toFixed(1));
  const dailyCups = Math.round(totalOunces / 8);
  const dailyBottles = parseFloat((totalOunces / 16.9).toFixed(1));

  const summary: { label: string; value: string | number }[] = [
    { label: 'Daily Water Intake', value: totalOunces + ' oz' },
    { label: 'In Liters', value: dailyLiters + ' L' },
    { label: '8-oz Glasses', value: dailyCups },
    { label: 'Water Bottles (16.9 oz)', value: dailyBottles },
    { label: 'Body Weight', value: weight + ' lbs' },
    { label: 'Activity Level', value: activityLevel },
    { label: 'Climate', value: climate },
  ];

  return {
    dailyOunces: totalOunces,
    dailyLiters,
    dailyCups,
    dailyBottles,
    summary,
  };
}

// Wrapper for the formula registry
export function calculateWaterIntakeFromInputs(inputs: Record<string, unknown>): Record<string, unknown> {
  const result = calculateWaterIntake({
    weight: inputs.weight != null ? Number(inputs.weight) : 160,
    activityLevel: String(inputs.activityLevel || 'moderate'),
    climate: String(inputs.climate || 'temperate'),
    pregnant: Boolean(inputs.pregnant),
    breastfeeding: Boolean(inputs.breastfeeding),
  });
  return result as unknown as Record<string, unknown>;
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'water-intake': calculateWaterIntakeFromInputs,
};
