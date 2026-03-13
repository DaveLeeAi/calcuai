export interface Vo2MaxInput {
  testMethod: string;       // 'cooper' | 'heart-rate'
  distanceMeters?: number;  // distance run in 12 minutes (cooper method)
  distanceUnit?: string;    // 'meters' | 'miles'
  age?: number;             // years (heart-rate method)
  restingHeartRate?: number; // bpm (heart-rate method)
}

export interface Vo2MaxOutput {
  vo2Max: number;
  fitnessLevel: string;
  percentile: string;
  methodUsed: string;
  summary: { label: string; value: string | number }[];
}

/**
 * VO2 Max Calculator
 *
 * Two estimation methods:
 *
 * Cooper 12-Minute Run Test (1968):
 *   VO2max = (distance_meters − 504.9) / 44.73
 *
 * Uth et al. Heart Rate Ratio Method (2004):
 *   VO2max = 15.3 × (HRmax / HRrest)
 *   Where HRmax = 220 − age
 *
 * Fitness classification (simplified, general adult):
 *   Superior:  ≥ 52 mL/kg/min
 *   Excellent: 42–51.9
 *   Good:      33–41.9
 *   Fair:      25–32.9
 *   Poor:      < 25
 *
 * Sources:
 *   Cooper KH. A Means of Assessing Maximal Oxygen Intake.
 *     JAMA. 1968;203(3):201-204.
 *   Uth N, et al. Estimation of VO2max from the ratio between
 *     HRmax and HRrest. Eur J Appl Physiol. 2004;91(1):111-115.
 */
export function calculateVo2Max(input: Vo2MaxInput): Vo2MaxOutput {
  const testMethod = String(input.testMethod || 'cooper').toLowerCase();

  let vo2Max = 0;
  let methodUsed = '';

  if (testMethod === 'heart-rate') {
    // Heart rate ratio method (Uth et al. 2004)
    const age = input.age != null ? Math.max(0, Number(input.age)) : 30;
    const restingHR = input.restingHeartRate != null ? Math.max(0, Number(input.restingHeartRate)) : 65;

    if (age <= 0 || restingHR <= 0) {
      return buildEmptyResult('heart-rate');
    }

    const maxHR = 220 - age;

    if (maxHR <= 0) {
      return buildEmptyResult('heart-rate');
    }

    vo2Max = 15.3 * (maxHR / restingHR);
    methodUsed = 'Uth et al. Heart Rate Ratio';
  } else {
    // Cooper 12-Minute Run Test (default)
    let distanceMeters = input.distanceMeters != null ? Number(input.distanceMeters) : 2400;
    const distanceUnit = String(input.distanceUnit || 'meters').toLowerCase();

    // Convert miles to meters if needed
    if (distanceUnit === 'miles') {
      distanceMeters = distanceMeters * 1609.34;
    }

    distanceMeters = Math.max(0, distanceMeters);

    if (distanceMeters <= 0) {
      return buildEmptyResult('cooper');
    }

    vo2Max = (distanceMeters - 504.9) / 44.73;
    methodUsed = 'Cooper 12-Minute Run Test';
  }

  // Clamp VO2max to reasonable range
  vo2Max = Math.max(0, Math.round(vo2Max * 10) / 10);

  // Classify fitness level
  const fitnessLevel = classifyFitness(vo2Max);
  const percentile = getPercentile(vo2Max);

  const summary: { label: string; value: string | number }[] = [
    { label: 'VO2 Max', value: vo2Max + ' mL/kg/min' },
    { label: 'Fitness Level', value: fitnessLevel },
    { label: 'Percentile', value: percentile },
    { label: 'Method', value: methodUsed },
  ];

  if (testMethod === 'heart-rate') {
    const age = input.age != null ? Math.max(0, Number(input.age)) : 30;
    const restingHR = input.restingHeartRate != null ? Math.max(0, Number(input.restingHeartRate)) : 65;
    const maxHR = 220 - age;
    summary.push({ label: 'Max Heart Rate (est.)', value: maxHR + ' bpm' });
    summary.push({ label: 'Resting Heart Rate', value: restingHR + ' bpm' });
  } else {
    let distanceMeters = input.distanceMeters != null ? Number(input.distanceMeters) : 2400;
    const distanceUnit = String(input.distanceUnit || 'meters').toLowerCase();
    if (distanceUnit === 'miles') {
      distanceMeters = distanceMeters * 1609.34;
    }
    summary.push({ label: 'Distance (meters)', value: Math.round(distanceMeters) });
  }

  return {
    vo2Max,
    fitnessLevel,
    percentile,
    methodUsed,
    summary,
  };
}

function buildEmptyResult(method: string): Vo2MaxOutput {
  return {
    vo2Max: 0,
    fitnessLevel: 'N/A',
    percentile: 'N/A',
    methodUsed: method === 'heart-rate' ? 'Uth et al. Heart Rate Ratio' : 'Cooper 12-Minute Run Test',
    summary: [],
  };
}

/**
 * Classify VO2max into fitness categories.
 * Simplified general adult classification (male defaults).
 */
function classifyFitness(vo2Max: number): string {
  if (vo2Max >= 52) return 'Superior';
  if (vo2Max >= 42) return 'Excellent';
  if (vo2Max >= 33) return 'Good';
  if (vo2Max >= 25) return 'Fair';
  if (vo2Max > 0) return 'Poor';
  return 'N/A';
}

/**
 * Map VO2max to approximate population percentile (general adult).
 */
function getPercentile(vo2Max: number): string {
  if (vo2Max >= 56) return 'Top 5%';
  if (vo2Max >= 52) return 'Top 10%';
  if (vo2Max >= 47) return 'Top 20%';
  if (vo2Max >= 42) return 'Top 30%';
  if (vo2Max >= 38) return 'Top 40%';
  if (vo2Max >= 33) return 'Top 50%';
  if (vo2Max >= 29) return 'Top 60%';
  if (vo2Max >= 25) return 'Top 75%';
  if (vo2Max > 0) return 'Bottom 25%';
  return 'N/A';
}

// Wrapper for the formula registry
export function calculateVo2MaxFromInputs(inputs: Record<string, unknown>): Record<string, unknown> {
  const result = calculateVo2Max({
    testMethod: String(inputs.testMethod || 'cooper'),
    distanceMeters: inputs.distanceMeters != null ? Number(inputs.distanceMeters) : 2400,
    distanceUnit: String(inputs.distanceUnit || 'meters'),
    age: inputs.age != null ? Number(inputs.age) : 30,
    restingHeartRate: inputs.restingHeartRate != null ? Number(inputs.restingHeartRate) : 65,
  });
  return result as unknown as Record<string, unknown>;
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'vo2-max': calculateVo2MaxFromInputs,
};
