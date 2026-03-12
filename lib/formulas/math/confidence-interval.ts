/**
 * Confidence Interval Calculator
 *
 * Computes a confidence interval for a population mean:
 *
 *   CI = x-bar +/- z * (sigma / sqrt(n))
 *
 * Where:
 *   x-bar = sample mean
 *   z     = z-score for the chosen confidence level
 *   sigma = standard deviation (of sample)
 *   n     = sample size
 *
 * Margin of Error = z * (sigma / sqrt(n))
 * Standard Error  = sigma / sqrt(n)
 *
 * Source: NIST/SEMATECH e-Handbook of Statistical Methods, Section 7.1.4
 */

/** Z-scores for common confidence levels */
const Z_SCORES: Record<string, number> = {
  '80': 1.28155,
  '85': 1.43953,
  '90': 1.64485,
  '95': 1.95996,
  '99': 2.57583,
  '99.5': 2.80703,
  '99.9': 3.29053,
};

export interface ConfidenceIntervalInput {
  sampleMean: number;
  standardDeviation: number;
  sampleSize: number;
  confidenceLevel: string; // "80", "90", "95", "99", or custom number
}

export interface ConfidenceIntervalOutput {
  lowerBound: number;
  upperBound: number;
  marginOfError: number;
  standardError: number;
  zScore: number;
  sampleMean: number;
  confidenceLevel: number;
  intervalWidth: number;
}

export function calculateConfidenceInterval(inputs: Record<string, unknown>): Record<string, unknown> {
  const sampleMean = Number(inputs.sampleMean) || 0;
  const stdDev = Number(inputs.standardDeviation);
  const sampleSize = Number(inputs.sampleSize);
  const confidenceStr = String(inputs.confidenceLevel || '95');

  // Validate inputs
  if (isNaN(stdDev) || stdDev < 0) {
    return {
      lowerBound: null,
      upperBound: null,
      marginOfError: null,
      standardError: null,
      zScore: null,
      sampleMean,
      confidenceLevel: null,
      intervalWidth: null,
      error: 'Standard deviation must be a non-negative number.',
    };
  }

  if (isNaN(sampleSize) || sampleSize < 1) {
    return {
      lowerBound: null,
      upperBound: null,
      marginOfError: null,
      standardError: null,
      zScore: null,
      sampleMean,
      confidenceLevel: null,
      intervalWidth: null,
      error: 'Sample size must be at least 1.',
    };
  }

  const confidenceLevel = parseFloat(confidenceStr);
  if (isNaN(confidenceLevel) || confidenceLevel <= 0 || confidenceLevel >= 100) {
    return {
      lowerBound: null,
      upperBound: null,
      marginOfError: null,
      standardError: null,
      zScore: null,
      sampleMean,
      confidenceLevel: null,
      intervalWidth: null,
      error: 'Confidence level must be between 0 and 100 (exclusive).',
    };
  }

  // Get z-score: look up table first, then compute via inverse normal approximation
  let zScore: number;
  const roundedConf = String(confidenceLevel);
  if (Z_SCORES[roundedConf] !== undefined) {
    zScore = Z_SCORES[roundedConf];
  } else {
    // Rational approximation for the inverse normal CDF (Beasley-Springer-Moro algorithm)
    zScore = inverseNormalCDF(1 - (1 - confidenceLevel / 100) / 2);
  }

  const standardError = stdDev / Math.sqrt(sampleSize);
  const marginOfError = zScore * standardError;
  const lowerBound = sampleMean - marginOfError;
  const upperBound = sampleMean + marginOfError;
  const intervalWidth = upperBound - lowerBound;

  return {
    lowerBound: parseFloat(lowerBound.toFixed(6)),
    upperBound: parseFloat(upperBound.toFixed(6)),
    marginOfError: parseFloat(marginOfError.toFixed(6)),
    standardError: parseFloat(standardError.toFixed(6)),
    zScore: parseFloat(zScore.toFixed(5)),
    sampleMean,
    confidenceLevel,
    intervalWidth: parseFloat(intervalWidth.toFixed(6)),
  };
}

/**
 * Inverse standard normal CDF using the rational approximation
 * from Peter Acklam (accurate to ~1.15e-9).
 */
function inverseNormalCDF(p: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  if (p === 0.5) return 0;

  const a1 = -3.969683028665376e+01;
  const a2 = 2.209460984245205e+02;
  const a3 = -2.759285104469687e+02;
  const a4 = 1.383577518672690e+02;
  const a5 = -3.066479806614716e+01;
  const a6 = 2.506628277459239e+00;

  const b1 = -5.447609879822406e+01;
  const b2 = 1.615858368580409e+02;
  const b3 = -1.556989798598866e+02;
  const b4 = 6.680131188771972e+01;
  const b5 = -1.328068155288572e+01;

  const c1 = -7.784894002430293e-03;
  const c2 = -3.223964580411365e-01;
  const c3 = -2.400758277161838e+00;
  const c4 = -2.549732539343734e+00;
  const c5 = 4.374664141464968e+00;
  const c6 = 2.938163982698783e+00;

  const d1 = 7.784695709041462e-03;
  const d2 = 3.224671290700398e-01;
  const d3 = 2.445134137142996e+00;
  const d4 = 3.754408661907416e+00;

  const pLow = 0.02425;
  const pHigh = 1 - pLow;

  let q: number, r: number;

  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
      ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
  } else if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q /
      (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
      ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
  }
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'confidence-interval': calculateConfidenceInterval,
};
