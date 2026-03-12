export interface CentralTendencyInput {
  dataSet: string;  // Comma-separated values (e.g., "3, 7, 7, 2, 9")
}

export interface CentralTendencyOutput {
  mean: number;
  median: number;
  mode: string;
  count: number;
  sum: number;
  range: number;
  min: number;
  max: number;
  sortedData: string;
}

/**
 * Central tendency calculator: mean, median, and mode.
 *
 * **Mean (Arithmetic Average):**
 *   μ = Σxᵢ / n
 *   Sum all values and divide by the count.
 *
 * **Median:**
 *   Sort values in ascending order.
 *   If n is odd: median = middle value = x[(n+1)/2]
 *   If n is even: median = average of the two middle values = (x[n/2] + x[n/2 + 1]) / 2
 *
 * **Mode:**
 *   The value(s) that appear most frequently.
 *   If all values appear with equal frequency, there is no mode.
 *   A data set can be unimodal (1 mode), bimodal (2 modes), or multimodal (3+ modes).
 *
 * Source: NIST/SEMATECH e-Handbook of Statistical Methods (Section 1.3.5.4);
 *         standard introductory statistics references (e.g., Wackerly, Mendenhall, Scheaffer).
 */
export function calculateCentralTendency(inputs: Record<string, unknown>): Record<string, unknown> {
  const rawData = String(inputs.dataSet || '');
  const values = parseDataSet(rawData);

  // Edge case: empty data set
  if (values.length === 0) {
    return {
      mean: 0,
      median: 0,
      mode: 'No data',
      count: 0,
      sum: 0,
      range: 0,
      min: 0,
      max: 0,
      sortedData: '',
    };
  }

  const n = values.length;

  // Sum
  const sum = values.reduce((acc, val) => acc + val, 0);

  // Mean
  const mean = sum / n;

  // Sort for median and range
  const sorted = [...values].sort((a, b) => a - b);

  // Median
  let median: number;
  if (n % 2 === 1) {
    // Odd count: middle value
    median = sorted[Math.floor(n / 2)];
  } else {
    // Even count: average of two middle values
    const midHigh = n / 2;
    const midLow = midHigh - 1;
    median = (sorted[midLow] + sorted[midHigh]) / 2;
  }

  // Mode: find value(s) with highest frequency
  const frequencyMap = new Map<number, number>();
  for (const val of values) {
    frequencyMap.set(val, (frequencyMap.get(val) || 0) + 1);
  }

  let maxFrequency = 0;
  Array.from(frequencyMap.values()).forEach((freq) => {
    if (freq > maxFrequency) {
      maxFrequency = freq;
    }
  });

  let modeString: string;
  if (maxFrequency === 1) {
    // Every value appears exactly once — no mode
    modeString = 'No mode';
  } else {
    // Collect all values with the maximum frequency
    const modeValues: number[] = [];
    Array.from(frequencyMap.entries()).forEach(([val, freq]) => {
      if (freq === maxFrequency) {
        modeValues.push(val);
      }
    });

    // Check if all values have the same frequency (e.g., {1,1,2,2,3,3})
    const allSameFrequency = frequencyMap.size === modeValues.length && maxFrequency > 1;

    if (allSameFrequency && frequencyMap.size > 1) {
      modeString = 'No mode';
    } else {
      modeValues.sort((a, b) => a - b);
      modeString = modeValues.map((v) => formatNumber(v)).join(', ');
    }
  }

  // Range, min, max
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const range = max - min;

  // Sorted data string for display
  const sortedDataStr = sorted.map((v) => formatNumber(v)).join(', ');

  return {
    mean: parseFloat(mean.toFixed(10)),
    median: parseFloat(median.toFixed(10)),
    mode: modeString,
    count: n,
    sum: parseFloat(sum.toFixed(10)),
    range: parseFloat(range.toFixed(10)),
    min: parseFloat(min.toFixed(10)),
    max: parseFloat(max.toFixed(10)),
    sortedData: sortedDataStr,
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
  if (Number.isInteger(value)) return value.toString();
  return parseFloat(value.toFixed(4)).toString();
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'central-tendency': calculateCentralTendency,
};
