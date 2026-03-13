/**
 * Z-Score Calculator
 *
 * Core formula:
 *   z = (x - μ) / σ
 *
 * Two modes:
 *   Calculate Z:  z = (x - μ) / σ   (value → z-score)
 *   Calculate X:  x = μ + z × σ     (z-score → value)
 *
 * Also computes cumulative probability (area to left) using
 * the Abramowitz & Stegun approximation (Handbook of Mathematical
 * Functions, 1964, equation 26.2.17).
 *
 * Source: Carl Friedrich Gauss, Theoria motus corporum coelestium (1809);
 * standard normal distribution tables by Karl Pearson (1900).
 */

/**
 * Normal CDF approximation via the error function.
 * Uses Abramowitz & Stegun 7.1.26 erf approximation.
 * Φ(z) = 0.5 × (1 + erf(z / √2))
 * Accuracy: |error| < 1.5 × 10⁻⁷
 */
function normalCDF(z: number): number {
  if (z === 0) return 0.5;

  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.SQRT2; // erf argument
  const t = 1.0 / (1.0 + p * x);
  const erf = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * erf);
}

export interface ZScoreInput {
  mode?: string;
  value?: number;
  mean?: number;
  standardDeviation?: number;
  zScore?: number;
}

export interface ZScoreOutput {
  zScore: number;
  value: number;
  mean: number;
  standardDeviation: number;
  cumulativeProbability: number;
  percentile: number;
  probabilityAbove: number;
  mode: string;
  allValues: { label: string; value: number; unit: string }[];
  breakdown: { step: string; expression: string }[];
}

export function calculateZScore(inputs: Record<string, unknown>): Record<string, unknown> {
  const mode = inputs.mode !== undefined && inputs.mode !== null && inputs.mode !== ''
    ? String(inputs.mode).toLowerCase()
    : 'calculate-z';
  const value = inputs.value !== undefined && inputs.value !== null && inputs.value !== ''
    ? Number(inputs.value)
    : undefined;
  const mean = inputs.mean !== undefined && inputs.mean !== null && inputs.mean !== ''
    ? Number(inputs.mean)
    : undefined;
  const standardDeviation = inputs.standardDeviation !== undefined && inputs.standardDeviation !== null && inputs.standardDeviation !== ''
    ? Number(inputs.standardDeviation)
    : undefined;
  const zScoreIn = inputs.zScore !== undefined && inputs.zScore !== null && inputs.zScore !== ''
    ? Number(inputs.zScore)
    : undefined;

  if (mode !== 'calculate-z' && mode !== 'calculate-x') {
    throw new Error('Mode must be either "calculate-z" or "calculate-x".');
  }

  if (mean === undefined || !isFinite(mean)) {
    throw new Error('Mean (μ) is required.');
  }
  if (standardDeviation === undefined || !isFinite(standardDeviation) || standardDeviation <= 0) {
    throw new Error('Standard deviation (σ) must be a positive number.');
  }

  let z: number;
  let x: number;
  let breakdown: { step: string; expression: string }[];

  if (mode === 'calculate-z') {
    if (value === undefined || !isFinite(value)) {
      throw new Error('Value (x) is required for calculating z-score.');
    }

    x = value;
    z = (x - mean) / standardDeviation;

    breakdown = [
      { step: 'Formula', expression: 'z = (x - μ) / σ' },
      { step: 'Substitute', expression: `z = (${x} - ${mean}) / ${standardDeviation}` },
      { step: 'Numerator', expression: `z = ${parseFloat((x - mean).toFixed(10))} / ${standardDeviation}` },
      { step: 'Result', expression: `z = ${parseFloat(z.toFixed(6))}` },
    ];
  } else {
    if (zScoreIn === undefined || !isFinite(zScoreIn)) {
      throw new Error('Z-score is required for calculating value.');
    }

    z = zScoreIn;
    x = mean + z * standardDeviation;

    breakdown = [
      { step: 'Formula', expression: 'x = μ + z × σ' },
      { step: 'Substitute', expression: `x = ${mean} + ${z} × ${standardDeviation}` },
      { step: 'Result', expression: `x = ${parseFloat(x.toFixed(6))}` },
    ];
  }

  z = parseFloat(z.toFixed(10));
  x = parseFloat(x.toFixed(10));

  const cumulativeProbability = parseFloat(normalCDF(z).toFixed(6));
  const percentile = parseFloat((cumulativeProbability * 100).toFixed(4));
  const probabilityAbove = parseFloat((1 - cumulativeProbability).toFixed(6));

  const allValues = [
    { label: 'Z-Score', value: z, unit: '' },
    { label: 'Value', value: x, unit: '' },
    { label: 'Mean', value: mean, unit: '' },
    { label: 'Standard Deviation', value: standardDeviation, unit: '' },
    { label: 'Cumulative Probability', value: cumulativeProbability, unit: '' },
    { label: 'Percentile', value: percentile, unit: '%' },
  ];

  return {
    zScore: z,
    value: x,
    mean,
    standardDeviation,
    cumulativeProbability,
    percentile,
    probabilityAbove,
    mode,
    allValues,
    breakdown,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'z-score': calculateZScore,
};
