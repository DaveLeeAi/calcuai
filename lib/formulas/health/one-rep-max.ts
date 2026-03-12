export interface OneRepMaxInput {
  weight: number;
  reps: number;
  weightUnit: 'lbs' | 'kg';
}

export interface PercentageChartEntry {
  percentage: number;
  weight: number;
  estimatedReps: number;
}

export interface OneRepMaxOutput {
  epley1RM: number;
  brzycki1RM: number;
  average1RM: number;
  percentageChart: PercentageChartEntry[];
  weightUnit: string;
}

/**
 * One Rep Max (1RM) estimation formulas:
 *
 * Epley formula (1985):
 *   1RM = weight × (1 + reps / 30)
 *
 * Brzycki formula (1993):
 *   1RM = weight × (36 / (37 − reps))
 *
 * Special case: if reps = 1, 1RM = weight (already a max attempt)
 *
 * Both formulas are most accurate for rep counts ≤ 10.
 *
 * Percentage chart uses the Epley formula reversed to estimate reps:
 *   reps = 30 × (1RM / weight − 1)
 *
 * Source: Epley B (1985). "Poundage Chart." Boyd Epley Workout.
 * Brzycki M (1993). "Strength testing: predicting a one-rep max from
 * repetitions to fatigue." JOHPERD, 64(1), 88-90.
 */
export function calculateOneRepMax(input: OneRepMaxInput): OneRepMaxOutput {
  const { weight, reps, weightUnit } = input;

  let epley1RM: number;
  let brzycki1RM: number;

  // Special case: 1 rep = already a max
  if (reps === 1) {
    epley1RM = weight;
    brzycki1RM = weight;
  } else {
    // Epley: 1RM = weight × (1 + reps/30)
    epley1RM = weight * (1 + reps / 30);

    // Brzycki: 1RM = weight × (36 / (37 − reps))
    brzycki1RM = weight * (36 / (37 - reps));
  }

  // Round to 1 decimal
  epley1RM = Math.round(epley1RM * 10) / 10;
  brzycki1RM = Math.round(brzycki1RM * 10) / 10;

  const average1RM = Math.round(((epley1RM + brzycki1RM) / 2) * 10) / 10;

  // Percentage chart based on average 1RM
  const percentages = [100, 95, 90, 85, 80, 75, 70, 65, 60];
  const percentageChart: PercentageChartEntry[] = percentages.map((pct) => {
    const pctWeight = Math.round((average1RM * pct) / 100 * 10) / 10;

    // Estimated reps from Epley reversed: reps = 30 × (1RM / weight − 1)
    // Using average1RM as the true 1RM and pctWeight as the working weight
    let estimatedReps: number;
    if (pct === 100) {
      estimatedReps = 1;
    } else if (pctWeight > 0) {
      estimatedReps = Math.round(30 * (average1RM / pctWeight - 1));
    } else {
      estimatedReps = 0;
    }

    return {
      percentage: pct,
      weight: pctWeight,
      estimatedReps: Math.max(1, estimatedReps),
    };
  });

  return {
    epley1RM,
    brzycki1RM,
    average1RM,
    percentageChart,
    weightUnit,
  };
}

// Wrapper for the formula registry
export function calculateOneRepMaxFromInputs(
  inputs: Record<string, unknown>
): Record<string, unknown> {
  const result = calculateOneRepMax({
    weight: inputs.weight as number,
    reps: inputs.reps as number,
    weightUnit: (inputs.weightUnit as string) === 'kg' ? 'kg' : 'lbs',
  });
  return result as unknown as Record<string, unknown>;
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'one-rep-max': calculateOneRepMaxFromInputs,
};
