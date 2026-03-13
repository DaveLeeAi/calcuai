/**
 * Chi-Square Goodness of Fit Calculator
 *
 * Core formula:
 *   χ² = Σ[(Oᵢ − Eᵢ)² / Eᵢ]
 *
 * Where:
 *   Oᵢ = observed frequency for category i
 *   Eᵢ = expected frequency for category i
 *   k  = number of categories
 *   df = k − 1 (degrees of freedom)
 *
 * Also computes:
 *   p-value from chi-square CDF
 *   Critical value at given significance level
 *   Per-category contribution to χ²
 *
 * If expected values not provided, assumes uniform distribution (total/k).
 *
 * Source: Karl Pearson, "On the criterion that a given system of deviations
 * from the probable in the case of a correlated system of variables is such
 * that it can be reasonably supposed to have arisen from random sampling"
 * (1900); NIST/SEMATECH e-Handbook of Statistical Methods.
 */

/**
 * Lower incomplete gamma function via series expansion.
 * γ(s, x) = x^s × e^(-x) × Σ[ x^n / (s × (s+1) × ... × (s+n)) ]
 */
function lowerIncompleteGamma(s: number, x: number): number {
  if (x < 0) return 0;
  if (x === 0) return 0;

  let sum = 0;
  let term = 1 / s;
  sum = term;

  for (let n = 1; n < 200; n++) {
    term *= x / (s + n);
    sum += term;
    if (Math.abs(term) < 1e-14 * Math.abs(sum)) break;
  }

  return Math.pow(x, s) * Math.exp(-x) * sum;
}

/**
 * Log-gamma function (Stirling / Lanczos approximation).
 * Uses Lanczos approximation with g=7.
 */
function logGamma(z: number): number {
  if (z < 0.5) {
    // Reflection formula
    return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z);
  }
  z -= 1;
  const g = 7;
  const c = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];

  let x = c[0];
  for (let i = 1; i < g + 2; i++) {
    x += c[i] / (z + i);
  }

  const t = z + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

/**
 * Gamma function via exp(logGamma(z)).
 */
function gamma(z: number): number {
  return Math.exp(logGamma(z));
}

/**
 * Regularized lower incomplete gamma function: P(s, x) = γ(s, x) / Γ(s).
 * This is the chi-square CDF: P(k/2, χ²/2).
 */
function regularizedGammaP(s: number, x: number): number {
  if (x < 0) return 0;
  if (x === 0) return 0;

  // For x < s+1, use series expansion
  if (x < s + 1) {
    return lowerIncompleteGamma(s, x) / gamma(s);
  }

  // For x >= s+1, use continued fraction (upper incomplete) for better convergence
  // P(s,x) = 1 - Q(s,x), where Q uses the continued fraction
  return 1 - upperIncompleteGammaQ(s, x);
}

/**
 * Regularized upper incomplete gamma function via continued fraction.
 * Q(s, x) = 1 - P(s, x)
 * Uses modified Lentz's method.
 */
function upperIncompleteGammaQ(s: number, x: number): number {
  // Continued fraction: Γ(s,x)/Γ(s)
  // Using Lentz's algorithm
  const tiny = 1e-30;
  let f = x - s + 1;
  if (Math.abs(f) < tiny) f = tiny;
  let C = f;
  let D = 0;

  for (let i = 1; i < 200; i++) {
    const a = i * (s - i);
    const b = (x - s + 1) + 2 * i;

    D = b + a * D;
    if (Math.abs(D) < tiny) D = tiny;
    D = 1 / D;

    C = b + a / C;
    if (Math.abs(C) < tiny) C = tiny;

    const delta = C * D;
    f *= delta;

    if (Math.abs(delta - 1) < 1e-14) break;
  }

  return Math.exp(-x + s * Math.log(x) - logGamma(s)) / f;
}

/**
 * Chi-square CDF: P(X ≤ x) for X ~ χ²(df).
 * CDF = regularized gamma P(df/2, x/2).
 */
function chiSquareCDF(x: number, df: number): number {
  if (x <= 0) return 0;
  return regularizedGammaP(df / 2, x / 2);
}

/**
 * Inverse chi-square CDF using bisection.
 * Finds x such that P(X ≤ x) = p for X ~ χ²(df).
 */
function chiSquareInvCDF(p: number, df: number): number {
  if (p <= 0) return 0;
  if (p >= 1) return Infinity;

  // Initial bracket
  let lo = 0;
  let hi = df + 10 * Math.sqrt(2 * df); // generous upper bound
  // Widen upper bracket if needed
  while (chiSquareCDF(hi, df) < p) {
    hi *= 2;
  }

  // Bisection
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    const cdf = chiSquareCDF(mid, df);
    if (Math.abs(cdf - p) < 1e-10) return mid;
    if (cdf < p) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return (lo + hi) / 2;
}

export function calculateChiSquare(inputs: Record<string, unknown>): Record<string, unknown> {
  // Parse observed values
  const observedStr = inputs.observedValues !== undefined && inputs.observedValues !== null && inputs.observedValues !== ''
    ? String(inputs.observedValues)
    : '';
  const observed = observedStr
    .split(',')
    .map(s => parseFloat(s.trim()))
    .filter(v => !isNaN(v));

  if (observed.length < 2) {
    throw new Error('At least 2 observed categories are required.');
  }

  for (let i = 0; i < observed.length; i++) {
    if (observed[i] < 0) {
      throw new Error('Observed values must be non-negative.');
    }
  }

  const k = observed.length;
  const totalObserved = observed.reduce((a, b) => a + b, 0);

  // Parse expected values (optional — defaults to uniform)
  const expectedStr = inputs.expectedValues !== undefined && inputs.expectedValues !== null && inputs.expectedValues !== ''
    ? String(inputs.expectedValues).trim()
    : '';

  let expected: number[];
  let isUniform: boolean;

  if (expectedStr === '') {
    // Uniform distribution
    const uniformValue = totalObserved / k;
    expected = new Array(k).fill(uniformValue);
    isUniform = true;
  } else {
    expected = expectedStr
      .split(',')
      .map(s => parseFloat(s.trim()))
      .filter(v => !isNaN(v));
    isUniform = false;

    if (expected.length !== k) {
      throw new Error(`Expected values count (${expected.length}) must match observed values count (${k}).`);
    }
  }

  // Validate expected values
  for (let i = 0; i < expected.length; i++) {
    if (expected[i] <= 0) {
      throw new Error('Expected values must be positive (greater than 0).');
    }
  }

  // Parse significance level
  const sigLevelStr = inputs.significanceLevel !== undefined && inputs.significanceLevel !== null && inputs.significanceLevel !== ''
    ? String(inputs.significanceLevel)
    : '0.05';
  const significanceLevel = parseFloat(sigLevelStr);
  if (!isFinite(significanceLevel) || significanceLevel <= 0 || significanceLevel >= 1) {
    throw new Error('Significance level must be between 0 and 1.');
  }

  // Calculate chi-square statistic
  let chiSquare = 0;
  const contributions: { category: number; observed: number; expected: number; contribution: number }[] = [];

  for (let i = 0; i < k; i++) {
    const diff = observed[i] - expected[i];
    const contribution = (diff * diff) / expected[i];
    chiSquare += contribution;
    contributions.push({
      category: i + 1,
      observed: observed[i],
      expected: parseFloat(expected[i].toFixed(4)),
      contribution: parseFloat(contribution.toFixed(6)),
    });
  }

  chiSquare = parseFloat(chiSquare.toFixed(6));

  // Degrees of freedom
  const df = k - 1;

  // p-value: P(X ≥ χ²) = 1 - CDF(χ², df)
  const pValue = parseFloat((1 - chiSquareCDF(chiSquare, df)).toFixed(6));

  // Critical value at significance level
  const criticalValue = parseFloat(chiSquareInvCDF(1 - significanceLevel, df).toFixed(4));

  // Significance determination
  const isSignificant = pValue < significanceLevel;

  // Build breakdown
  const breakdown: { step: string; expression: string }[] = [
    { step: 'Formula', expression: 'χ² = Σ[(Oᵢ − Eᵢ)² / Eᵢ]' },
    { step: 'Categories', expression: `k = ${k}` },
    { step: 'Total observed', expression: `N = ${totalObserved}` },
  ];

  if (isUniform) {
    breakdown.push({ step: 'Expected (uniform)', expression: `Eᵢ = ${totalObserved} / ${k} = ${parseFloat((totalObserved / k).toFixed(4))}` });
  }

  for (let i = 0; i < k; i++) {
    breakdown.push({
      step: `Category ${i + 1}`,
      expression: `(${observed[i]} − ${parseFloat(expected[i].toFixed(4))})² / ${parseFloat(expected[i].toFixed(4))} = ${contributions[i].contribution}`,
    });
  }

  breakdown.push(
    { step: 'Chi-square statistic', expression: `χ² = ${chiSquare}` },
    { step: 'Degrees of freedom', expression: `df = k − 1 = ${k} − 1 = ${df}` },
    { step: 'p-value', expression: `P(χ² ≥ ${chiSquare}) = ${pValue}` },
    { step: 'Critical value', expression: `χ²(${significanceLevel}, ${df}) = ${criticalValue}` },
    { step: 'Decision', expression: isSignificant
      ? `p = ${pValue} < α = ${significanceLevel} → Reject H₀ (statistically significant)`
      : `p = ${pValue} ≥ α = ${significanceLevel} → Fail to reject H₀ (not significant)` },
  );

  const allValues: { label: string; value: number; unit: string }[] = [
    { label: 'Chi-Square Statistic', value: chiSquare, unit: '' },
    { label: 'Degrees of Freedom', value: df, unit: '' },
    { label: 'p-value', value: pValue, unit: '' },
    { label: 'Critical Value', value: criticalValue, unit: '' },
    { label: 'Significance Level', value: significanceLevel, unit: '' },
  ];

  return {
    chiSquareStatistic: chiSquare,
    degreesOfFreedom: df,
    pValue,
    isSignificant,
    significanceLevel,
    criticalValue,
    contributions,
    allValues,
    breakdown,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'chi-square': calculateChiSquare,
};
