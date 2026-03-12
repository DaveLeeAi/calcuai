export interface BMIInput {
  weight: number;
  height: number;
  unitSystem: 'metric' | 'imperial';
}

export interface BMIOutput {
  bmi: number;
  category: string;
  bmiGauge: number;
  healthyWeightRange: { min: number; max: number };
  weightToHealthyMin: number;
  weightToHealthyMax: number;
  primeRatio: number;
  ponderal: number;
}

/**
 * Body Mass Index (BMI) formula:
 *
 * Metric:   BMI = weight(kg) / height(m)²
 * Imperial: BMI = 703 × weight(lb) / height(in)²
 *
 * Categories per WHO classification:
 *   < 16.0  = Severely Underweight
 *   16.0–16.9 = Moderately Underweight
 *   17.0–18.4 = Mildly Underweight
 *   18.5–24.9 = Normal Weight
 *   25.0–29.9 = Overweight
 *   30.0–34.9 = Obese Class I
 *   35.0–39.9 = Obese Class II
 *   ≥ 40.0    = Obese Class III
 *
 * Source: World Health Organization (WHO) and CDC
 */
export function calculateBMI(input: BMIInput): BMIOutput {
  const { weight, height, unitSystem } = input;

  let bmi: number;
  let weightKg: number;
  let heightM: number;

  if (unitSystem === 'metric') {
    weightKg = weight;
    heightM = height / 100; // cm to m
    bmi = weightKg / (heightM * heightM);
  } else {
    // Imperial: weight in lbs, height in inches
    bmi = (703 * weight) / (height * height);
    weightKg = weight * 0.453592;
    heightM = height * 0.0254;
  }

  const category = getBMICategory(bmi);

  // Healthy weight range (BMI 18.5–24.9)
  const healthyMin = 18.5 * (heightM * heightM);
  const healthyMax = 24.9 * (heightM * heightM);

  let healthyMinDisplay: number;
  let healthyMaxDisplay: number;

  if (unitSystem === 'imperial') {
    healthyMinDisplay = healthyMin / 0.453592; // kg to lbs
    healthyMaxDisplay = healthyMax / 0.453592;
  } else {
    healthyMinDisplay = healthyMin;
    healthyMaxDisplay = healthyMax;
  }

  const currentWeight = unitSystem === 'imperial' ? weight : weightKg;
  const weightToHealthyMin = currentWeight - (unitSystem === 'imperial' ? healthyMaxDisplay : healthyMax);
  const weightToHealthyMax = (unitSystem === 'imperial' ? healthyMinDisplay : healthyMin) - currentWeight;

  // BMI Prime: ratio of actual BMI to upper limit of normal (25)
  const primeRatio = bmi / 25;

  // Ponderal Index: weight(kg) / height(m)³
  const ponderal = weightKg / (heightM * heightM * heightM);

  const bmiRounded = Math.round(bmi * 10) / 10;

  return {
    bmi: bmiRounded,
    category,
    bmiGauge: bmiRounded,
    healthyWeightRange: {
      min: Math.round(healthyMinDisplay * 10) / 10,
      max: Math.round(healthyMaxDisplay * 10) / 10,
    },
    weightToHealthyMin: Math.round(weightToHealthyMin * 10) / 10,
    weightToHealthyMax: Math.round(weightToHealthyMax * 10) / 10,
    primeRatio: Math.round(primeRatio * 100) / 100,
    ponderal: Math.round(ponderal * 10) / 10,
  };
}

function getBMICategory(bmi: number): string {
  if (bmi < 16.0) return 'Severely Underweight';
  if (bmi < 17.0) return 'Moderately Underweight';
  if (bmi < 18.5) return 'Mildly Underweight';
  if (bmi < 25.0) return 'Normal Weight';
  if (bmi < 30.0) return 'Overweight';
  if (bmi < 35.0) return 'Obese Class I';
  if (bmi < 40.0) return 'Obese Class II';
  return 'Obese Class III';
}

// Wrapper for the formula registry (takes Record<string, unknown>)
export function calculateBMIFromInputs(inputs: Record<string, unknown>): Record<string, unknown> {
  const result = calculateBMI({
    weight: inputs.weight as number,
    height: inputs.height as number,
    unitSystem: (inputs.unitSystem as string) === 'imperial' ? 'imperial' : 'metric',
  });
  return result as unknown as Record<string, unknown>;
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'bmi': calculateBMIFromInputs,
};
