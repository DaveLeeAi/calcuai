/**
 * Sample Size Calculator
 *
 * Core formula (for proportions):
 *   n = (Z² × p × (1 - p)) / E²
 *
 * With finite population correction:
 *   n_adj = n / (1 + (n - 1) / N)
 *
 * Where:
 *   n = required sample size
 *   Z = z-score for desired confidence level
 *   p = estimated population proportion (default 0.5)
 *   E = margin of error (as decimal, e.g. 0.05 for ±5%)
 *   N = population size (optional, for finite pop correction)
 *
 * Source: Cochran, W.G. (1977). Sampling Techniques, 3rd ed. Wiley.
 * Z-values from standard normal distribution tables.
 */

/** Z-scores for common confidence levels */
const Z_VALUES: Record<string, number> = {
  '80': 1.28155,
  '85': 1.43953,
  '90': 1.64485,
  '95': 1.95996,
  '99': 2.57583,
  '99.5': 2.80703,
  '99.9': 3.29053,
};

export interface SampleSizeInput {
  confidenceLevel?: string;
  marginOfError?: number;
  proportion?: number;
  populationSize?: number;
}

export interface SampleSizeOutput {
  sampleSize: number;
  adjustedSampleSize: number | null;
  zScore: number;
  confidenceLevel: number;
  marginOfError: number;
  proportion: number;
  populationSize: number | null;
  allValues: { label: string; value: number; unit: string }[];
  breakdown: { step: string; expression: string }[];
}

export function calculateSampleSize(inputs: Record<string, unknown>): Record<string, unknown> {
  const confidenceLevelStr = inputs.confidenceLevel !== undefined && inputs.confidenceLevel !== null && inputs.confidenceLevel !== ''
    ? String(inputs.confidenceLevel)
    : '95';
  const marginOfErrorRaw = inputs.marginOfError !== undefined && inputs.marginOfError !== null && inputs.marginOfError !== ''
    ? Number(inputs.marginOfError)
    : undefined;
  const proportionRaw = inputs.proportion !== undefined && inputs.proportion !== null && inputs.proportion !== ''
    ? Number(inputs.proportion)
    : 50;
  const populationSizeRaw = inputs.populationSize !== undefined && inputs.populationSize !== null && inputs.populationSize !== ''
    ? Number(inputs.populationSize)
    : undefined;

  // Parse confidence level
  const clKey = confidenceLevelStr.replace('%', '');
  const zScore = Z_VALUES[clKey];
  if (zScore === undefined) {
    throw new Error(`Unsupported confidence level: ${confidenceLevelStr}%. Supported: 80, 85, 90, 95, 99, 99.5, 99.9.`);
  }
  const confidenceLevel = Number(clKey);

  // Parse margin of error (entered as percentage, e.g. 5 for 5%)
  if (marginOfErrorRaw === undefined || !isFinite(marginOfErrorRaw) || marginOfErrorRaw <= 0 || marginOfErrorRaw >= 100) {
    throw new Error('Margin of error must be between 0 and 100 (as a percentage).');
  }
  const marginOfError = marginOfErrorRaw;
  const E = marginOfErrorRaw / 100; // Convert to decimal

  // Parse proportion (entered as percentage, e.g. 50 for 50%)
  if (!isFinite(proportionRaw) || proportionRaw <= 0 || proportionRaw >= 100) {
    throw new Error('Population proportion must be between 0 and 100 (as a percentage).');
  }
  const proportion = proportionRaw;
  const p = proportionRaw / 100; // Convert to decimal

  // Parse population size (optional)
  let populationSize: number | null = null;
  if (populationSizeRaw !== undefined && isFinite(populationSizeRaw)) {
    if (populationSizeRaw < 1) {
      throw new Error('Population size must be at least 1.');
    }
    populationSize = Math.round(populationSizeRaw);
  }

  // Calculate base sample size: n = (Z² × p × (1-p)) / E²
  const zSquared = zScore * zScore;
  const pq = p * (1 - p);
  const eSquared = E * E;
  const n = (zSquared * pq) / eSquared;
  const sampleSize = Math.ceil(n);

  // Build breakdown
  const breakdown: { step: string; expression: string }[] = [
    { step: 'Formula', expression: 'n = (Z² × p × (1-p)) / E²' },
    { step: 'Z-score', expression: `Z = ${zScore} (for ${confidenceLevel}% confidence)` },
    { step: 'Substitute', expression: `n = (${parseFloat(zSquared.toFixed(4))} × ${p} × ${parseFloat((1 - p).toFixed(4))}) / ${parseFloat(eSquared.toFixed(6))}` },
    { step: 'Numerator', expression: `n = ${parseFloat((zSquared * pq).toFixed(4))} / ${parseFloat(eSquared.toFixed(6))}` },
    { step: 'Result', expression: `n = ${parseFloat(n.toFixed(2))} → round up to ${sampleSize}` },
  ];

  // Apply finite population correction if population size is provided
  let adjustedSampleSize: number | null = null;
  if (populationSize !== null) {
    const nAdj = n / (1 + (n - 1) / populationSize);
    adjustedSampleSize = Math.ceil(nAdj);

    breakdown.push(
      { step: 'Finite correction', expression: `n_adj = n / (1 + (n-1) / N)` },
      { step: 'Substitute', expression: `n_adj = ${parseFloat(n.toFixed(2))} / (1 + ${parseFloat((n - 1).toFixed(2))} / ${populationSize})` },
      { step: 'Adjusted result', expression: `n_adj = ${parseFloat(nAdj.toFixed(2))} → round up to ${adjustedSampleSize}` },
    );
  }

  const allValues: { label: string; value: number; unit: string }[] = [
    { label: 'Sample Size', value: sampleSize, unit: '' },
  ];

  if (adjustedSampleSize !== null) {
    allValues.push({ label: 'Adjusted Sample Size', value: adjustedSampleSize, unit: '' });
  }

  allValues.push(
    { label: 'Confidence Level', value: confidenceLevel, unit: '%' },
    { label: 'Margin of Error', value: marginOfError, unit: '%' },
    { label: 'Proportion', value: proportion, unit: '%' },
    { label: 'Z-Score', value: parseFloat(zScore.toFixed(5)), unit: '' },
  );

  if (populationSize !== null) {
    allValues.push({ label: 'Population Size', value: populationSize, unit: '' });
  }

  return {
    sampleSize,
    adjustedSampleSize,
    zScore: parseFloat(zScore.toFixed(5)),
    confidenceLevel,
    marginOfError,
    proportion,
    populationSize,
    allValues,
    breakdown,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'sample-size': calculateSampleSize,
};
