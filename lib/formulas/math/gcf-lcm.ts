export interface GcfLcmInput {
  valueA: number;
  valueB: number;
  valueC?: number;
}

export interface GcfLcmOutput {
  gcf: number;
  lcm: number;
  primeFactorsA: string;
  primeFactorsB: string;
  primeFactorsC: string;
  product: string;
}

/**
 * Greatest Common Factor using the Euclidean algorithm.
 *
 * gcd(a, b) = gcd(b, a mod b), repeating until b = 0, then gcd = a.
 * Handles negatives via absolute value. GCF(0, n) = n. GCF(0, 0) = 0.
 *
 * Source: Euclid's Elements, Book VII, Propositions 1-2 (circa 300 BC).
 */
export function gcf(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

/**
 * Least Common Multiple.
 *
 * LCM(a, b) = |a × b| / GCF(a, b)
 * Returns 0 if either value is 0.
 *
 * Source: Relationship between GCF and LCM, a standard identity
 *         from number theory. Documented in Hardy & Wright,
 *         An Introduction to the Theory of Numbers.
 */
export function lcm(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  if (a === 0 || b === 0) return 0;
  return (a * b) / gcf(a, b);
}

/**
 * GCF for three numbers: GCF(a, b, c) = GCF(GCF(a, b), c)
 */
export function gcfThree(a: number, b: number, c: number): number {
  return gcf(gcf(a, b), c);
}

/**
 * LCM for three numbers: LCM(a, b, c) = LCM(LCM(a, b), c)
 */
export function lcmThree(a: number, b: number, c: number): number {
  return lcm(lcm(a, b), c);
}

/**
 * Prime factorization via trial division.
 * Returns a map of prime factor → exponent.
 * For n = 1, returns {1: 1}.
 * For n = 0, returns {0: 1}.
 *
 * Source: Fundamental Theorem of Arithmetic — every integer greater than 1
 *         has a unique prime factorization. Trial division is the simplest
 *         factoring algorithm, sufficient for numbers up to ~10^12.
 */
export function primeFactorize(n: number): Map<number, number> {
  n = Math.abs(Math.round(n));
  const factors = new Map<number, number>();

  if (n === 0) {
    factors.set(0, 1);
    return factors;
  }

  if (n === 1) {
    factors.set(1, 1);
    return factors;
  }

  let remaining = n;

  // Divide out all 2s
  while (remaining % 2 === 0) {
    factors.set(2, (factors.get(2) || 0) + 1);
    remaining = remaining / 2;
  }

  // Check odd factors from 3 up to sqrt(remaining)
  for (let i = 3; i * i <= remaining; i += 2) {
    while (remaining % i === 0) {
      factors.set(i, (factors.get(i) || 0) + 1);
      remaining = remaining / i;
    }
  }

  // If remaining > 1, it is a prime factor
  if (remaining > 1) {
    factors.set(remaining, 1);
  }

  return factors;
}

/**
 * Format a prime factorization map as a product string.
 * Examples:
 *   {2: 2, 3: 1} → "2² × 3"
 *   {17: 1}       → "17"
 *   {1: 1}        → "1"
 */
export function formatPrimeFactors(factors: Map<number, number>): string {
  if (factors.size === 0) return '1';

  const parts: string[] = [];
  // Sort by factor value for consistent output
  const sortedEntries = Array.from(factors.entries()).sort((a, b) => a[0] - b[0]);

  const superscripts: Record<number, string> = {
    0: '\u2070', 1: '\u00B9', 2: '\u00B2', 3: '\u00B3',
    4: '\u2074', 5: '\u2075', 6: '\u2076', 7: '\u2077',
    8: '\u2078', 9: '\u2079',
  };

  function toSuperscript(num: number): string {
    return String(num).split('').map(d => superscripts[parseInt(d)] || d).join('');
  }

  for (const [prime, exp] of sortedEntries) {
    if (exp === 1) {
      parts.push(String(prime));
    } else {
      parts.push(`${prime}${toSuperscript(exp)}`);
    }
  }

  return parts.join(' \u00D7 ');
}

/**
 * GCF & LCM calculator — computes the greatest common factor, least common
 * multiple, and prime factorization for two or three numbers.
 *
 * Formulas:
 *   GCF via Euclidean algorithm: gcd(a, b) = gcd(b, a mod b)
 *   LCM via GCF relationship:   LCM(a, b) = |a × b| / GCF(a, b)
 *   For three numbers:           GCF(a,b,c) = GCF(GCF(a,b), c)
 *                                LCM(a,b,c) = LCM(LCM(a,b), c)
 *   Verification:                a × b = GCF(a,b) × LCM(a,b)
 *
 * Source: Euclidean algorithm from Euclid's Elements, Book VII (circa 300 BC).
 *         GCF-LCM product identity from elementary number theory.
 */
export function calculateGcfLcm(inputs: Record<string, unknown>): Record<string, unknown> {
  const rawA = Number(inputs.valueA);
  const rawB = Number(inputs.valueB);
  const rawC = inputs.valueC !== undefined && inputs.valueC !== '' && inputs.valueC !== null
    ? Number(inputs.valueC)
    : null;

  if (isNaN(rawA) || isNaN(rawB)) {
    throw new Error('Values A and B must be valid numbers');
  }
  if (rawC !== null && isNaN(rawC)) {
    throw new Error('Value C must be a valid number if provided');
  }

  // Use absolute values for negative numbers
  const a = Math.abs(Math.round(rawA));
  const b = Math.abs(Math.round(rawB));
  const c = rawC !== null && rawC !== 0 ? Math.abs(Math.round(rawC)) : null;

  // Compute GCF and LCM
  let resultGcf: number;
  let resultLcm: number;

  if (c !== null) {
    resultGcf = gcfThree(a, b, c);
    resultLcm = lcmThree(a, b, c);
  } else {
    resultGcf = gcf(a, b);
    resultLcm = lcm(a, b);
  }

  // Prime factorizations
  const factorsA = primeFactorize(a);
  const factorsB = primeFactorize(b);
  const primeFactorsA = formatPrimeFactors(factorsA);
  const primeFactorsB = formatPrimeFactors(factorsB);

  let primeFactorsC = '';
  if (c !== null) {
    const factorsC = primeFactorize(c);
    primeFactorsC = formatPrimeFactors(factorsC);
  }

  // Product verification: a × b = GCF × LCM (only for two numbers)
  let product = '';
  if (c === null) {
    product = `${a} \u00D7 ${b} = ${a * b} = ${resultGcf} \u00D7 ${resultLcm} = ${resultGcf * resultLcm}`;
  } else {
    product = `GCF(${a}, ${b}, ${c}) = ${resultGcf}, LCM(${a}, ${b}, ${c}) = ${resultLcm}`;
  }

  return {
    gcf: resultGcf,
    lcm: resultLcm,
    primeFactorsA,
    primeFactorsB,
    primeFactorsC,
    product,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'gcf-lcm': calculateGcfLcm,
};
