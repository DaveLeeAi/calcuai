export interface IdealWeightInput {
  sex: 'male' | 'female';
  height: number;
  unitSystem: 'metric' | 'imperial';
}

export interface IdealWeightOutput {
  devineWeight: number;
  robinsonWeight: number;
  millerWeight: number;
  hamwiWeight: number;
  averageIdealWeight: number;
  bmiHealthyRange: {
    min: number;
    max: number;
  };
  comparisonTable: {
    formula: string;
    weightKg: number;
    weightLbs: number;
  }[];
}

/**
 * Calculates ideal body weight using four established clinical formulas.
 * All formulas use height in inches with a base of 60 inches (5 feet).
 *
 * Devine (1974):
 *   Male:   IBW = 50 + 2.3 × (height_in − 60) kg
 *   Female: IBW = 45.5 + 2.3 × (height_in − 60) kg
 *
 * Robinson (1983):
 *   Male:   IBW = 52 + 1.9 × (height_in − 60) kg
 *   Female: IBW = 49 + 1.7 × (height_in − 60) kg
 *
 * Miller (1983):
 *   Male:   IBW = 56.2 + 1.41 × (height_in − 60) kg
 *   Female: IBW = 53.1 + 1.36 × (height_in − 60) kg
 *
 * Hamwi (1964):
 *   Male:   IBW = 48 + 2.7 × (height_in − 60) kg
 *   Female: IBW = 45.5 + 2.2 × (height_in − 60) kg
 *
 * Sources:
 * - Devine BJ. "Gentamicin therapy." Drug Intelligence & Clinical Pharmacy,
 *   1974;8:650–655.
 * - Robinson JD, et al. "Determination of ideal body weight for drug dosage
 *   calculations." American Journal of Hospital Pharmacy, 1983;40:1016–1019.
 * - Miller DR, et al. "Estimation of ideal body weight." American Journal of
 *   Hospital Pharmacy, 1983;40:1622.
 * - Hamwi GJ. "Therapy: changing dietary concepts." In: Danowski TS, ed.
 *   Diabetes Mellitus: Diagnosis and Treatment, 1964:73–78.
 */
export function calculateIdealWeight(input: IdealWeightInput): IdealWeightOutput {
  const { sex } = input;

  // Convert height to inches
  let heightInches: number;
  if (input.unitSystem === 'imperial') {
    heightInches = input.height;
  } else {
    // Convert cm to inches
    heightInches = input.height / 2.54;
  }

  const inchesOver60 = heightInches - 60;

  // Calculate ideal weights in kg using each formula
  let devineKg: number;
  let robinsonKg: number;
  let millerKg: number;
  let hamwiKg: number;

  if (sex === 'male') {
    devineKg = 50 + 2.3 * inchesOver60;
    robinsonKg = 52 + 1.9 * inchesOver60;
    millerKg = 56.2 + 1.41 * inchesOver60;
    hamwiKg = 48 + 2.7 * inchesOver60;
  } else {
    devineKg = 45.5 + 2.3 * inchesOver60;
    robinsonKg = 49 + 1.7 * inchesOver60;
    millerKg = 53.1 + 1.36 * inchesOver60;
    hamwiKg = 45.5 + 2.2 * inchesOver60;
  }

  const averageKg = (devineKg + robinsonKg + millerKg + hamwiKg) / 4;

  // BMI-based healthy weight range (BMI 18.5–24.9)
  const heightM = heightInches * 0.0254;
  const heightMSquared = heightM * heightM;
  const bmiMinKg = 18.5 * heightMSquared;
  const bmiMaxKg = 24.9 * heightMSquared;

  // Convert to output units
  const kgToLbs = 2.20462;

  const toOutputWeight = (kg: number): number => {
    if (input.unitSystem === 'imperial') {
      return Math.round(kg * kgToLbs * 10) / 10;
    }
    return Math.round(kg * 10) / 10;
  };

  const devineWeight = toOutputWeight(devineKg);
  const robinsonWeight = toOutputWeight(robinsonKg);
  const millerWeight = toOutputWeight(millerKg);
  const hamwiWeight = toOutputWeight(hamwiKg);
  const averageIdealWeight = toOutputWeight(averageKg);

  const bmiHealthyRange = {
    min: toOutputWeight(bmiMinKg),
    max: toOutputWeight(bmiMaxKg),
  };

  const comparisonTable = [
    {
      formula: 'Devine (1974)',
      weightKg: Math.round(devineKg * 10) / 10,
      weightLbs: Math.round(devineKg * kgToLbs * 10) / 10,
    },
    {
      formula: 'Robinson (1983)',
      weightKg: Math.round(robinsonKg * 10) / 10,
      weightLbs: Math.round(robinsonKg * kgToLbs * 10) / 10,
    },
    {
      formula: 'Miller (1983)',
      weightKg: Math.round(millerKg * 10) / 10,
      weightLbs: Math.round(millerKg * kgToLbs * 10) / 10,
    },
    {
      formula: 'Hamwi (1964)',
      weightKg: Math.round(hamwiKg * 10) / 10,
      weightLbs: Math.round(hamwiKg * kgToLbs * 10) / 10,
    },
  ];

  return {
    devineWeight,
    robinsonWeight,
    millerWeight,
    hamwiWeight,
    averageIdealWeight,
    bmiHealthyRange,
    comparisonTable,
  };
}

// Wrapper for the formula registry
export function calculateIdealWeightFromInputs(inputs: Record<string, unknown>): Record<string, unknown> {
  const result = calculateIdealWeight({
    sex: (inputs.sex as string) === 'male' ? 'male' : 'female',
    height: inputs.height as number,
    unitSystem: (inputs.unitSystem as string) === 'imperial' ? 'imperial' : 'metric',
  });
  return result as unknown as Record<string, unknown>;
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'ideal-weight': calculateIdealWeightFromInputs,
};
