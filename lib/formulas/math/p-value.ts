/**
 * P-Value Calculator
 *
 * Computes p-values from test statistics using three distributions:
 *
 * 1. Z-test (Standard Normal):
 *    p = 1 - Phi(z)                  [right-tailed]
 *    p = Phi(z)                      [left-tailed]
 *    p = 2 * (1 - Phi(|z|))         [two-tailed]
 *    where Phi is the standard normal CDF
 *
 * 2. T-test (Student's t-distribution):
 *    p = 1 - CDF_t(t, df)           [right-tailed]
 *    p = CDF_t(t, df)               [left-tailed]
 *    p = 2 * (1 - CDF_t(|t|, df))  [two-tailed]
 *
 * 3. Chi-square test:
 *    p = 1 - CDF_chi2(x, df)        [right-tailed, standard]
 *    p = CDF_chi2(x, df)            [left-tailed]
 *    p = 2 * min(CDF, 1-CDF)        [two-tailed]
 *
 * Sources:
 * - Abramowitz & Stegun, Handbook of Mathematical Functions (1964), eq. 26.2.17
 * - Press et al., Numerical Recipes in C, 2nd ed., Ch. 6
 * - NIST/SEMATECH e-Handbook of Statistical Methods
 */

// ─── Numerical Helpers ───────────────────────────────────────────────

/**
 * Standard normal CDF using Abramowitz & Stegun approximation (26.2.17).
 * Maximum absolute error: 7.5e-8.
 *
 * For x >= 0: Phi(x) = 1 - phi(x) * (b1*t + b2*t^2 + b3*t^3 + b4*t^4 + b5*t^5)
 * where t = 1/(1 + p*x), phi(x) = (1/sqrt(2*pi)) * exp(-x^2/2)
 * For x < 0: Phi(x) = 1 - Phi(-x)
 */
function normalCDF(x: number): number {
  if (x < -8) return 0;
  if (x > 8) return 1;

  const b1 = 0.319381530;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;
  const p = 0.2316419;

  const absX = Math.abs(x);
  const t = 1.0 / (1.0 + p * absX);
  const pdf = Math.exp(-absX * absX / 2) / Math.sqrt(2 * Math.PI);
  const poly = ((((b5 * t + b4) * t + b3) * t + b2) * t + b1) * t;
  const tailProb = pdf * poly; // Q(|x|) = P(Z > |x|) = 1 - Phi(|x|)

  return x >= 0 ? 1.0 - tailProb : tailProb;
}

/**
 * Natural log of the Gamma function using the Lanczos approximation.
 * Accurate to ~15 decimal places.
 */
function logGamma(z: number): number {
  if (z <= 0) return Infinity;
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

  const x = z - 1;
  let sum = c[0];
  for (let i = 1; i < g + 2; i++) {
    sum += c[i] / (x + i);
  }

  const t = x + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(sum);
}

/**
 * Regularized lower incomplete gamma function P(a, x) using
 * series expansion (for x < a+1) and continued fraction (for x >= a+1).
 */
function regularizedGammaP(a: number, x: number): number {
  if (x < 0) return 0;
  if (x === 0) return 0;
  if (a <= 0) return 1;

  if (x < a + 1) {
    // Series expansion: P(a,x) = e^(-x) * x^a * sum_{n=0}^{inf} x^n / Gamma(a+n+1)
    let sum = 1.0 / a;
    let term = 1.0 / a;
    for (let n = 1; n < 200; n++) {
      term *= x / (a + n);
      sum += term;
      if (Math.abs(term) < Math.abs(sum) * 1e-14) break;
    }
    return sum * Math.exp(-x + a * Math.log(x) - logGamma(a));
  } else {
    return 1.0 - regularizedGammaQ(a, x);
  }
}

/**
 * Regularized upper incomplete gamma function Q(a, x) using continued fraction.
 * Uses the Numerical Recipes approach (Lentz's method).
 */
function regularizedGammaQ(a: number, x: number): number {
  if (x < 0) return 1;
  if (x === 0) return 1;

  if (x < a + 1) {
    return 1.0 - regularizedGammaP(a, x);
  }

  const FPMIN = 1e-30;

  let b = x + 1.0 - a;
  let c = 1.0 / FPMIN;
  let d = 1.0 / b;
  let h = d;

  for (let i = 1; i <= 200; i++) {
    const an = -i * (i - a);
    b += 2.0;
    d = an * d + b;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = b + an / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1.0 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1.0) < 1e-14) break;
  }

  return Math.exp(-x + a * Math.log(x) - logGamma(a)) * h;
}

/**
 * Chi-square CDF: P(X <= x) where X ~ chi-square(df).
 * Uses the relationship: CDF_chi2(x, k) = P(k/2, x/2)
 */
function chiSquareCDF(x: number, df: number): number {
  if (x <= 0) return 0;
  if (df <= 0) return 0;
  return regularizedGammaP(df / 2, x / 2);
}

/**
 * Continued fraction for the regularized incomplete beta function.
 * Uses the Numerical Recipes "betacf" algorithm (Lentz's method).
 */
function betacf(a: number, b: number, x: number): number {
  const MAXIT = 200;
  const EPS = 3.0e-12;
  const FPMIN = 1.0e-30;

  const qab = a + b;
  const qap = a + 1.0;
  const qam = a - 1.0;

  let c = 1.0;
  let d = 1.0 - qab * x / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1.0 / d;
  let h = d;

  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;

    // Even step
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1.0 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1.0 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1.0 / d;
    h *= d * c;

    // Odd step
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1.0 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1.0 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1.0 / d;
    const del = d * c;
    h *= del;

    if (Math.abs(del - 1.0) <= EPS) break;
  }

  return h;
}

/**
 * Regularized incomplete beta function I_x(a, b).
 * Uses the continued fraction representation from Numerical Recipes.
 */
function regularizedBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;

  const lnBeta = logGamma(a) + logGamma(b) - logGamma(a + b);
  const front = Math.exp(Math.log(x) * a + Math.log(1 - x) * b - lnBeta);

  if (x < (a + 1) / (a + b + 2)) {
    return front * betacf(a, b, x) / a;
  } else {
    return 1.0 - front * betacf(b, a, 1 - x) / b;
  }
}

/**
 * Student's t-distribution CDF: P(X <= t) where X ~ t(df).
 * Uses the regularized incomplete beta function.
 */
function tCDF(t: number, df: number): number {
  if (df <= 0) return NaN;
  if (t === 0) return 0.5;

  const x = df / (df + t * t);
  const ibeta = regularizedBeta(x, df / 2, 0.5);

  if (t > 0) {
    return 1.0 - 0.5 * ibeta;
  } else {
    return 0.5 * ibeta;
  }
}

// ─── Main Calculator ─────────────────────────────────────────────────

export interface PValueInput {
  testStatistic: number;
  degreesOfFreedom: number;
  testType: 'right-tailed' | 'left-tailed' | 'two-tailed';
  distribution: 'z' | 't' | 'chi-square';
}

export interface PValueOutput {
  pValue: number;
  testStatistic: number;
  degreesOfFreedom: number | null;
  significantAt10: boolean;
  significantAt05: boolean;
  significantAt01: boolean;
  significantAt001: boolean;
  interpretation: string;
}

export function calculatePValue(inputs: Record<string, unknown>): Record<string, unknown> {
  const testStat = Number(inputs.testStatistic) || 0;
  const rawDf = Number(inputs.degreesOfFreedom);
  const df = isNaN(rawDf) ? 1 : rawDf;
  const testType = String(inputs.testType || 'two-tailed');
  const distribution = String(inputs.distribution || 'z');

  let pValue: number;

  if (distribution === 'z') {
    switch (testType) {
      case 'right-tailed':
        pValue = 1 - normalCDF(testStat);
        break;
      case 'left-tailed':
        pValue = normalCDF(testStat);
        break;
      case 'two-tailed':
      default:
        pValue = 2 * (1 - normalCDF(Math.abs(testStat)));
        break;
    }
  } else if (distribution === 't') {
    if (df < 1) {
      return {
        pValue: null,
        testStatistic: testStat,
        degreesOfFreedom: df,
        significantAt10: false,
        significantAt05: false,
        significantAt01: false,
        significantAt001: false,
        interpretation: 'Degrees of freedom must be at least 1 for the t-distribution.',
      };
    }
    switch (testType) {
      case 'right-tailed':
        pValue = 1 - tCDF(testStat, df);
        break;
      case 'left-tailed':
        pValue = tCDF(testStat, df);
        break;
      case 'two-tailed':
      default:
        pValue = 2 * (1 - tCDF(Math.abs(testStat), df));
        break;
    }
  } else if (distribution === 'chi-square') {
    if (df < 1) {
      return {
        pValue: null,
        testStatistic: testStat,
        degreesOfFreedom: df,
        significantAt10: false,
        significantAt05: false,
        significantAt01: false,
        significantAt001: false,
        interpretation: 'Degrees of freedom must be at least 1 for the chi-square distribution.',
      };
    }
    if (testStat < 0) {
      return {
        pValue: null,
        testStatistic: testStat,
        degreesOfFreedom: df,
        significantAt10: false,
        significantAt05: false,
        significantAt01: false,
        significantAt001: false,
        interpretation: 'Chi-square test statistic cannot be negative.',
      };
    }
    switch (testType) {
      case 'right-tailed':
        pValue = 1 - chiSquareCDF(testStat, df);
        break;
      case 'left-tailed':
        pValue = chiSquareCDF(testStat, df);
        break;
      case 'two-tailed':
      default: {
        const pRight = 1 - chiSquareCDF(testStat, df);
        const pLeft = chiSquareCDF(testStat, df);
        pValue = 2 * Math.min(pLeft, pRight);
        break;
      }
    }
  } else {
    return {
      pValue: null,
      testStatistic: testStat,
      degreesOfFreedom: df,
      significantAt10: false,
      significantAt05: false,
      significantAt01: false,
      significantAt001: false,
      interpretation: `Unknown distribution: ${distribution}`,
    };
  }

  // Clamp to [0, 1]
  pValue = Math.max(0, Math.min(1, pValue));

  // Round to 6 significant figures
  const pRounded = pValue === 0 ? 0 : parseFloat(pValue.toPrecision(6));

  const significantAt10 = pRounded < 0.10;
  const significantAt05 = pRounded < 0.05;
  const significantAt01 = pRounded < 0.01;
  const significantAt001 = pRounded < 0.001;

  let interpretation: string;
  if (pRounded < 0.001) {
    interpretation = 'Extremely strong evidence against the null hypothesis (p < 0.001). The result is highly statistically significant.';
  } else if (pRounded < 0.01) {
    interpretation = 'Strong evidence against the null hypothesis (p < 0.01). The result is statistically significant.';
  } else if (pRounded < 0.05) {
    interpretation = 'Moderate evidence against the null hypothesis (p < 0.05). The result is statistically significant at the 5% level.';
  } else if (pRounded < 0.10) {
    interpretation = 'Weak evidence against the null hypothesis (p < 0.10). The result is marginally significant.';
  } else {
    interpretation = 'Insufficient evidence to reject the null hypothesis (p >= 0.10). The result is not statistically significant.';
  }

  return {
    pValue: pRounded,
    testStatistic: testStat,
    degreesOfFreedom: distribution === 'z' ? null : df,
    significantAt10,
    significantAt05,
    significantAt01,
    significantAt001,
    interpretation,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'p-value': calculatePValue,
};
