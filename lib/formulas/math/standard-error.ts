/**
 * Standard Error of the Mean Calculator
 *
 * Core formula:
 *   SE = s / √n
 *
 * Where:
 *   SE = standard error of the mean
 *   s  = sample standard deviation
 *   n  = sample size
 *
 * Also computes:
 *   Margin of Error (95% CI): ME = 1.96 × SE
 *   Confidence Interval: [x̄ − ME, x̄ + ME]
 *   Relative SE: (SE / |x̄|) × 100  (when x̄ ≠ 0)
 *
 * Two modes:
 *   "summary" — user provides sampleStdDev, sampleSize, sampleMean
 *   "data"    — user provides comma-separated data points; stats auto-calculated
 *
 * Source: Central Limit Theorem; Casella & Berger, Statistical Inference (2002).
 */

export function calculateStandardError(inputs: Record<string, unknown>): Record<string, unknown> {
  const mode = inputs.mode !== undefined && inputs.mode !== null && inputs.mode !== ''
    ? String(inputs.mode).toLowerCase()
    : 'summary';

  if (mode !== 'summary' && mode !== 'data') {
    throw new Error('Mode must be either "summary" or "data".');
  }

  let n: number;
  let stdDev: number;
  let mean: number;
  let breakdown: { step: string; expression: string }[];

  if (mode === 'data') {
    // Parse comma-separated values
    const dataStr = String(inputs.dataInput || '');
    const values = dataStr
      .split(',')
      .map(s => parseFloat(s.trim()))
      .filter(v => !isNaN(v));

    if (values.length < 2) {
      throw new Error('At least 2 data points required.');
    }

    n = values.length;
    mean = values.reduce((a, b) => a + b, 0) / n;
    const variance = values.reduce((sum, x) => sum + (x - mean) ** 2, 0) / (n - 1); // sample variance
    stdDev = Math.sqrt(variance);

    const se = stdDev / Math.sqrt(n);
    const marginOfError95 = 1.96 * se;
    const ciLower = mean - marginOfError95;
    const ciUpper = mean + marginOfError95;
    const relativeSE = mean !== 0 ? (se / Math.abs(mean)) * 100 : null;

    breakdown = [
      { step: 'Data points', expression: `n = ${n} values` },
      { step: 'Sample mean', expression: `x̄ = Σx / n = ${parseFloat(mean.toFixed(6))}` },
      { step: 'Sample variance', expression: `s² = Σ(x − x̄)² / (n−1) = ${parseFloat(variance.toFixed(6))}` },
      { step: 'Sample std dev', expression: `s = √s² = ${parseFloat(stdDev.toFixed(6))}` },
      { step: 'Formula', expression: 'SE = s / √n' },
      { step: 'Substitute', expression: `SE = ${parseFloat(stdDev.toFixed(6))} / √${n}` },
      { step: 'Result', expression: `SE = ${parseFloat(se.toFixed(6))}` },
      { step: 'Margin of error (95%)', expression: `ME = 1.96 × ${parseFloat(se.toFixed(6))} = ${parseFloat(marginOfError95.toFixed(6))}` },
      { step: 'Confidence interval', expression: `[${parseFloat(ciLower.toFixed(4))}, ${parseFloat(ciUpper.toFixed(4))}]` },
    ];

    const allValues: { label: string; value: number; unit: string }[] = [
      { label: 'Standard Error', value: parseFloat(se.toFixed(6)), unit: '' },
      { label: 'Sample Size', value: n, unit: '' },
      { label: 'Sample Mean', value: parseFloat(mean.toFixed(6)), unit: '' },
      { label: 'Standard Deviation', value: parseFloat(stdDev.toFixed(6)), unit: '' },
      { label: 'Margin of Error (95%)', value: parseFloat(marginOfError95.toFixed(6)), unit: '' },
      { label: 'CI Lower Bound', value: parseFloat(ciLower.toFixed(4)), unit: '' },
      { label: 'CI Upper Bound', value: parseFloat(ciUpper.toFixed(4)), unit: '' },
    ];

    if (relativeSE !== null) {
      allValues.push({ label: 'Relative SE', value: parseFloat(relativeSE.toFixed(4)), unit: '%' });
    }

    return {
      standardError: parseFloat(se.toFixed(6)),
      sampleSize: n,
      standardDeviation: parseFloat(stdDev.toFixed(6)),
      mean: parseFloat(mean.toFixed(6)),
      marginOfError95: parseFloat(marginOfError95.toFixed(6)),
      confidenceIntervalLower: parseFloat(ciLower.toFixed(4)),
      confidenceIntervalUpper: parseFloat(ciUpper.toFixed(4)),
      relativeSE: relativeSE !== null ? parseFloat(relativeSE.toFixed(4)) : null,
      mode,
      allValues,
      breakdown,
    };
  }

  // Summary mode
  const stdDevRaw = inputs.sampleStdDev !== undefined && inputs.sampleStdDev !== null && inputs.sampleStdDev !== ''
    ? Number(inputs.sampleStdDev)
    : undefined;
  const nRaw = inputs.sampleSize !== undefined && inputs.sampleSize !== null && inputs.sampleSize !== ''
    ? Number(inputs.sampleSize)
    : undefined;
  const meanRaw = inputs.sampleMean !== undefined && inputs.sampleMean !== null && inputs.sampleMean !== ''
    ? Number(inputs.sampleMean)
    : 0;

  if (stdDevRaw === undefined || !isFinite(stdDevRaw)) {
    throw new Error('Sample standard deviation is required.');
  }
  if (stdDevRaw < 0) {
    throw new Error('Standard deviation must be non-negative.');
  }
  if (nRaw === undefined || !isFinite(nRaw)) {
    throw new Error('Sample size is required.');
  }
  if (nRaw < 2) {
    throw new Error('Sample size must be at least 2.');
  }
  if (!isFinite(meanRaw)) {
    throw new Error('Sample mean must be a finite number.');
  }

  stdDev = stdDevRaw;
  n = Math.round(nRaw);
  mean = meanRaw;

  const se = stdDev / Math.sqrt(n);
  const marginOfError95 = 1.96 * se;
  const ciLower = mean - marginOfError95;
  const ciUpper = mean + marginOfError95;
  const relativeSE = mean !== 0 ? (se / Math.abs(mean)) * 100 : null;

  breakdown = [
    { step: 'Formula', expression: 'SE = s / √n' },
    { step: 'Substitute', expression: `SE = ${stdDev} / √${n}` },
    { step: 'Denominator', expression: `√${n} = ${parseFloat(Math.sqrt(n).toFixed(6))}` },
    { step: 'Result', expression: `SE = ${parseFloat(se.toFixed(6))}` },
    { step: 'Margin of error (95%)', expression: `ME = 1.96 × ${parseFloat(se.toFixed(6))} = ${parseFloat(marginOfError95.toFixed(6))}` },
    { step: 'Confidence interval', expression: `[${mean} − ${parseFloat(marginOfError95.toFixed(4))}, ${mean} + ${parseFloat(marginOfError95.toFixed(4))}] = [${parseFloat(ciLower.toFixed(4))}, ${parseFloat(ciUpper.toFixed(4))}]` },
  ];

  const allValues: { label: string; value: number; unit: string }[] = [
    { label: 'Standard Error', value: parseFloat(se.toFixed(6)), unit: '' },
    { label: 'Sample Size', value: n, unit: '' },
    { label: 'Sample Mean', value: mean, unit: '' },
    { label: 'Standard Deviation', value: stdDev, unit: '' },
    { label: 'Margin of Error (95%)', value: parseFloat(marginOfError95.toFixed(6)), unit: '' },
    { label: 'CI Lower Bound', value: parseFloat(ciLower.toFixed(4)), unit: '' },
    { label: 'CI Upper Bound', value: parseFloat(ciUpper.toFixed(4)), unit: '' },
  ];

  if (relativeSE !== null) {
    allValues.push({ label: 'Relative SE', value: parseFloat(relativeSE.toFixed(4)), unit: '%' });
  }

  return {
    standardError: parseFloat(se.toFixed(6)),
    sampleSize: n,
    standardDeviation: stdDev,
    mean,
    marginOfError95: parseFloat(marginOfError95.toFixed(6)),
    confidenceIntervalLower: parseFloat(ciLower.toFixed(4)),
    confidenceIntervalUpper: parseFloat(ciUpper.toFixed(4)),
    relativeSE: relativeSE !== null ? parseFloat(relativeSE.toFixed(4)) : null,
    mode,
    allValues,
    breakdown,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'standard-error': calculateStandardError,
};
