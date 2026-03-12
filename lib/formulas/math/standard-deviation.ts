export interface StandardDeviationInput {
  dataSet: string;          // Comma-separated values (e.g., "2, 4, 4, 4, 5, 5, 7, 9")
  calculationType: string;  // "population" | "sample"
}

export interface DeviationRow {
  value: number;
  deviation: number;
  deviationSquared: number;
}

export interface StandardDeviationOutput {
  standardDeviation: number;
  variance: number;
  mean: number;
  count: number;
  sum: number;
  range: number;
  stepByStep: DeviationRow[];
  sortedData: { label: string; value: string }[];
}

/**
 * Standard deviation formulas:
 *
 * Population standard deviation:
 *   σ = √[ Σ(xᵢ − μ)² / N ]
 *
 * Sample standard deviation (Bessel's correction):
 *   s = √[ Σ(xᵢ − x̄)² / (n − 1) ]
 *
 * Where:
 *   xᵢ = each data value
 *   μ (or x̄) = arithmetic mean of the data set
 *   N = population size (total number of values)
 *   n = sample size
 *   Σ = summation across all values
 *
 * Bessel's correction (dividing by n−1 instead of n) corrects the bias
 * in the estimation of population variance from a sample. When we use
 * a sample mean instead of the true population mean, we systematically
 * underestimate the variance; dividing by n−1 compensates for this.
 *
 * Source: CFA Institute quantitative methods curriculum; standard
 * introductory statistics references (e.g., Wackerly, Mendenhall, Scheaffer).
 */
export function calculateStandardDeviation(inputs: Record<string, unknown>): Record<string, unknown> {
  const rawData = String(inputs.dataSet || '');
  const calculationType = String(inputs.calculationType || 'sample');

  // Parse comma-separated values into number array, filtering out non-numeric entries
  const values = parseDataSet(rawData);

  // Edge case: empty data set
  if (values.length === 0) {
    return {
      standardDeviation: 0,
      variance: 0,
      mean: 0,
      count: 0,
      sum: 0,
      range: 0,
      stepByStep: [],
      sortedData: [],
    };
  }

  const n = values.length;

  // Sum
  const sum = values.reduce((acc, val) => acc + val, 0);

  // Mean (arithmetic average)
  const mean = sum / n;

  // Deviations and squared deviations
  const deviationRows: DeviationRow[] = values.map((value) => {
    const deviation = value - mean;
    const deviationSquared = deviation * deviation;
    return {
      value: parseFloat(value.toFixed(10)),
      deviation: parseFloat(deviation.toFixed(10)),
      deviationSquared: parseFloat(deviationSquared.toFixed(10)),
    };
  });

  // Sum of squared deviations
  const sumOfSquaredDeviations = deviationRows.reduce(
    (acc, row) => acc + (row.value - mean) * (row.value - mean),
    0
  );

  // Variance: population divides by N, sample divides by (n-1)
  let variance: number;
  if (calculationType === 'population') {
    variance = sumOfSquaredDeviations / n;
  } else {
    // Sample: Bessel's correction
    // Edge case: single value means n-1 = 0, variance is 0
    variance = n > 1 ? sumOfSquaredDeviations / (n - 1) : 0;
  }

  // Standard deviation is the square root of variance
  const standardDeviation = Math.sqrt(variance);

  // Range: max - min
  const sortedValues = [...values].sort((a, b) => a - b);
  const min = sortedValues[0];
  const max = sortedValues[sortedValues.length - 1];
  const range = max - min;

  // Sorted data for display
  const sortedData = [
    { label: 'Sorted Values', value: sortedValues.map((v) => formatNumber(v)).join(', ') },
    { label: 'Minimum', value: formatNumber(min) },
    { label: 'Maximum', value: formatNumber(max) },
  ];

  return {
    standardDeviation: parseFloat(standardDeviation.toFixed(10)),
    variance: parseFloat(variance.toFixed(10)),
    mean: parseFloat(mean.toFixed(10)),
    count: n,
    sum: parseFloat(sum.toFixed(10)),
    range: parseFloat(range.toFixed(10)),
    stepByStep: deviationRows,
    sortedData,
  };
}

/**
 * Parse a comma-separated string of numbers into a clean number array.
 * Filters out empty strings, whitespace-only entries, and non-numeric values.
 */
export function parseDataSet(raw: string): number[] {
  if (!raw || raw.trim() === '') return [];

  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s !== '' && !isNaN(Number(s)))
    .map((s) => Number(s));
}

/**
 * Format a number for display: remove unnecessary trailing zeros.
 */
function formatNumber(value: number): string {
  // If it's an integer, show without decimals
  if (Number.isInteger(value)) return value.toString();
  // Otherwise show up to 4 decimal places
  return parseFloat(value.toFixed(4)).toString();
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'standard-deviation': calculateStandardDeviation,
};
