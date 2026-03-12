export interface BodyFatInput {
  sex: 'male' | 'female';
  unitSystem: 'metric' | 'imperial';
  waist: number;
  neck: number;
  height: number;
  hip?: number; // required for female
}

export interface BodyFatOutput {
  bodyFatPercentage: number;
  category: string;
  bodyFatGauge: number;
  composition: { name: string; value: number }[];
  fatMass: number;
  leanMass: number;
  bodyFatMassNote: string;
}

/**
 * US Navy body fat estimation method:
 *
 * Male:
 *   %BF = 86.010 × log10(waist − neck) − 70.041 × log10(height) + 36.76
 *
 * Female:
 *   %BF = 163.205 × log10(waist + hip − neck) − 97.684 × log10(height) − 78.387
 *
 * All measurements converted to inches for the formula. Metric inputs are converted first.
 *
 * Categories (ACE fitness classification):
 *   Male:   Essential 2-5%, Athletes 6-13%, Fitness 14-17%, Average 18-24%, Obese 25%+
 *   Female: Essential 10-13%, Athletes 14-20%, Fitness 21-24%, Average 25-31%, Obese 32%+
 *
 * Source: Hodgdon JA, Beckett MB (1984). "Prediction of percent body fat for
 * U.S. Navy men and women from body circumferences and height." Naval Health
 * Research Center, Report No. 84-29 & 84-11.
 */
export function calculateBodyFat(input: BodyFatInput): BodyFatOutput {
  const { sex } = input;

  // Formula coefficients are calibrated for inches
  let waistIn: number;
  let neckIn: number;
  let heightIn: number;
  let hipIn: number;

  if (input.unitSystem === 'imperial') {
    waistIn = input.waist;
    neckIn = input.neck;
    heightIn = input.height;
    hipIn = input.hip ?? 0;
  } else {
    // Convert cm to inches
    waistIn = input.waist / 2.54;
    neckIn = input.neck / 2.54;
    heightIn = input.height / 2.54;
    hipIn = (input.hip ?? 0) / 2.54;
  }

  let bodyFatPercentage: number;

  if (sex === 'male') {
    const circumferenceValue = waistIn - neckIn;
    if (circumferenceValue <= 0) {
      bodyFatPercentage = 0;
    } else {
      bodyFatPercentage =
        86.010 * Math.log10(circumferenceValue) -
        70.041 * Math.log10(heightIn) +
        36.76;
    }
  } else {
    const circumferenceValue = waistIn + hipIn - neckIn;
    if (circumferenceValue <= 0) {
      bodyFatPercentage = 0;
    } else {
      bodyFatPercentage =
        163.205 * Math.log10(circumferenceValue) -
        97.684 * Math.log10(heightIn) -
        78.387;
    }
  }

  bodyFatPercentage = Math.max(0, bodyFatPercentage);

  const category = getBodyFatCategory(bodyFatPercentage, sex);

  // Estimate body weight from height (rough estimate for fat/lean mass display)
  // We don't have weight input, so express as percentage-based note
  const bodyFatMassNote = `At ${Math.round(bodyFatPercentage * 10) / 10}% body fat, for every 100 lbs of body weight, approximately ${Math.round(bodyFatPercentage)} lbs is fat mass and ${Math.round(100 - bodyFatPercentage)} lbs is lean mass.`;

  const bfRounded = Math.round(bodyFatPercentage * 10) / 10;
  const fatMass = Math.round(bodyFatPercentage * 10) / 10;
  const leanMass = Math.round((100 - bodyFatPercentage) * 10) / 10;

  return {
    bodyFatPercentage: bfRounded,
    category,
    bodyFatGauge: bfRounded,
    composition: [
      { name: 'Fat Mass', value: fatMass },
      { name: 'Lean Mass', value: leanMass },
    ],
    fatMass,
    leanMass,
    bodyFatMassNote,
  };
}

function getBodyFatCategory(bf: number, sex: 'male' | 'female'): string {
  if (sex === 'male') {
    if (bf < 2) return 'Below Essential';
    if (bf <= 5) return 'Essential Fat';
    if (bf <= 13) return 'Athletes';
    if (bf <= 17) return 'Fitness';
    if (bf <= 24) return 'Average';
    return 'Obese';
  } else {
    if (bf < 10) return 'Below Essential';
    if (bf <= 13) return 'Essential Fat';
    if (bf <= 20) return 'Athletes';
    if (bf <= 24) return 'Fitness';
    if (bf <= 31) return 'Average';
    return 'Obese';
  }
}

// Wrapper for the formula registry
export function calculateBodyFatFromInputs(inputs: Record<string, unknown>): Record<string, unknown> {
  const result = calculateBodyFat({
    sex: (inputs.sex as string) === 'male' ? 'male' : 'female',
    unitSystem: (inputs.unitSystem as string) === 'imperial' ? 'imperial' : 'metric',
    waist: inputs.waist as number,
    neck: inputs.neck as number,
    height: inputs.height as number,
    hip: inputs.hip as number | undefined,
  });
  return result as unknown as Record<string, unknown>;
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'body-fat': calculateBodyFatFromInputs,
};
