export interface LeanBodyMassInput {
  unitSystem: 'imperial' | 'metric';
  sex: 'male' | 'female';
  weight: number;
  height: number;
}

export interface LeanBodyMassOutput {
  leanBodyMass: number;
  bodyFatMass: number;
  bodyFatPercentage: number;
  leanToFatRatio: number;
  composition: { label: string; value: number }[];
  unitLabel: string;
}

/**
 * Lean Body Mass (LBM) estimation using the Boer formula (1984):
 *
 * Male:
 *   LBM (kg) = (0.407 × weight_kg) + (0.267 × height_cm) − 19.2
 *
 * Female:
 *   LBM (kg) = (0.252 × weight_kg) + (0.473 × height_cm) − 48.3
 *
 * Derived values:
 *   Body Fat Mass = Total Weight − LBM
 *   Body Fat Percentage = (Body Fat Mass / Total Weight) × 100
 *   Lean-to-Fat Ratio = LBM / Body Fat Mass
 *
 * Unit conversions:
 *   1 lb = 0.453592 kg
 *   1 inch = 2.54 cm
 *
 * Source: Boer P (1984). "Estimated lean body mass as an index for
 * normalization of body fluid volumes in humans." American Journal
 * of Physiology, 247(4), F632-F636.
 */
export function calculateLeanBodyMass(input: LeanBodyMassInput): LeanBodyMassOutput {
  const { unitSystem, sex, weight, height } = input;

  // Convert to metric for formula
  let weightKg: number;
  let heightCm: number;

  if (unitSystem === 'imperial') {
    weightKg = weight * 0.453592;
    heightCm = height * 2.54;
  } else {
    weightKg = weight;
    heightCm = height;
  }

  // Boer formula
  let lbmKg: number;
  if (sex === 'male') {
    lbmKg = 0.407 * weightKg + 0.267 * heightCm - 19.2;
  } else {
    lbmKg = 0.252 * weightKg + 0.473 * heightCm - 48.3;
  }

  // Ensure LBM is not negative or greater than total weight
  lbmKg = Math.max(0, Math.min(lbmKg, weightKg));

  const bodyFatMassKg = weightKg - lbmKg;
  const bodyFatPercentage = (bodyFatMassKg / weightKg) * 100;
  const leanToFatRatio = bodyFatMassKg > 0 ? lbmKg / bodyFatMassKg : 0;

  // Convert output to user's unit system
  let leanBodyMass: number;
  let bodyFatMass: number;
  let unitLabel: string;

  if (unitSystem === 'imperial') {
    leanBodyMass = lbmKg / 0.453592;
    bodyFatMass = bodyFatMassKg / 0.453592;
    unitLabel = 'lbs';
  } else {
    leanBodyMass = lbmKg;
    bodyFatMass = bodyFatMassKg;
    unitLabel = 'kg';
  }

  return {
    leanBodyMass: Math.round(leanBodyMass * 10) / 10,
    bodyFatMass: Math.round(bodyFatMass * 10) / 10,
    bodyFatPercentage: Math.round(bodyFatPercentage * 10) / 10,
    leanToFatRatio: Math.round(leanToFatRatio * 100) / 100,
    composition: [
      { label: 'Lean Mass', value: Math.round(bodyFatPercentage * 10) / 10 > 0 ? Math.round((100 - bodyFatPercentage) * 10) / 10 : 100 },
      { label: 'Body Fat', value: Math.round(bodyFatPercentage * 10) / 10 },
    ],
    unitLabel,
  };
}

// Wrapper for the formula registry
export function calculateLeanBodyMassFromInputs(
  inputs: Record<string, unknown>
): Record<string, unknown> {
  const result = calculateLeanBodyMass({
    unitSystem: (inputs.unitSystem as string) === 'metric' ? 'metric' : 'imperial',
    sex: (inputs.sex as string) === 'female' ? 'female' : 'male',
    weight: inputs.weight as number,
    height: inputs.height as number,
  });
  return result as unknown as Record<string, unknown>;
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'lean-body-mass': calculateLeanBodyMassFromInputs,
};
