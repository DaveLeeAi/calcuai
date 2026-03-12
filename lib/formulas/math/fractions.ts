export interface FractionInput {
  numerator1: number;
  denominator1: number;
  operation: 'add' | 'subtract' | 'multiply' | 'divide';
  numerator2: number;
  denominator2: number;
}

export interface StepDetail {
  label: string;
  value: string;
}

export interface FractionOutput {
  result: string;
  simplifiedResult: string;
  decimalResult: number;
  mixedNumber: string;
  stepByStep: StepDetail[];
}

/**
 * Greatest Common Divisor using the Euclidean algorithm.
 *
 * gcd(a, b) = gcd(b, a mod b) until b = 0, then gcd = a.
 *
 * Handles negative numbers by operating on absolute values.
 *
 * Source: Euclid's Elements, Book VII, Propositions 1–2.
 */
export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
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
 * lcm(a, b) = |a * b| / gcd(a, b)
 *
 * Returns 0 if either value is 0.
 */
export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a * b) / gcd(a, b);
}

/**
 * Simplify a fraction by dividing numerator and denominator by their GCD.
 * Normalizes sign so the denominator is always positive.
 * Returns [numerator, denominator].
 */
export function simplifyFraction(numerator: number, denominator: number): [number, number] {
  if (denominator === 0) {
    throw new Error('Denominator cannot be zero');
  }
  if (numerator === 0) {
    return [0, 1];
  }

  const divisor = gcd(numerator, denominator);
  let simplifiedNum = numerator / divisor;
  let simplifiedDen = denominator / divisor;

  // Normalize sign: denominator should always be positive
  if (simplifiedDen < 0) {
    simplifiedNum = -simplifiedNum;
    simplifiedDen = -simplifiedDen;
  }

  return [simplifiedNum, simplifiedDen];
}

/**
 * Convert an improper fraction to mixed number string.
 * Returns the fraction string if it is a proper fraction or zero.
 *
 * Examples:
 *   7/4 → "1 3/4"
 *   -7/4 → "-1 3/4"
 *   5/5 → "1"
 *   3/4 → "3/4"
 *   0/5 → "0"
 */
export function toMixedNumber(numerator: number, denominator: number): string {
  if (denominator === 0) {
    throw new Error('Denominator cannot be zero');
  }

  const [simpNum, simpDen] = simplifyFraction(numerator, denominator);

  if (simpNum === 0) return '0';
  if (simpDen === 1) return String(simpNum);

  const absNum = Math.abs(simpNum);
  if (absNum < simpDen) {
    // Proper fraction — no mixed number form
    return `${simpNum}/${simpDen}`;
  }

  const wholeNumber = Math.floor(absNum / simpDen);
  const remainder = absNum % simpDen;
  const sign = simpNum < 0 ? '-' : '';

  if (remainder === 0) {
    return `${sign}${wholeNumber}`;
  }

  return `${sign}${wholeNumber} ${remainder}/${simpDen}`;
}

/**
 * Format a fraction as a string "numerator/denominator".
 * Special case: if denominator is 1, returns just the numerator.
 * Special case: if numerator is 0, returns "0".
 */
function formatFraction(numerator: number, denominator: number): string {
  if (numerator === 0) return '0';
  if (denominator === 1) return String(numerator);
  return `${numerator}/${denominator}`;
}

/**
 * Fraction arithmetic: add, subtract, multiply, and divide fractions.
 *
 * Formulas:
 *   Addition:       a/b + c/d = (ad + bc) / bd
 *   Subtraction:    a/b - c/d = (ad - bc) / bd
 *   Multiplication: a/b × c/d = ac / bd
 *   Division:       a/b ÷ c/d = ad / bc
 *
 * Results are simplified using the GCD (Euclidean algorithm).
 *
 * Source: Standard arithmetic operations on rational numbers.
 *         GCD simplification per Euclid's Elements, Book VII.
 */
export function calculateFractions(inputs: Record<string, unknown>): Record<string, unknown> {
  const n1 = Number(inputs.numerator1) || 0;
  const d1 = Number(inputs.denominator1);
  const n2 = Number(inputs.numerator2) || 0;
  const d2 = Number(inputs.denominator2);
  const operation = String(inputs.operation || 'add') as FractionInput['operation'];

  // Validate denominators
  if (!d1 || d1 === 0) {
    throw new Error('Denominator 1 cannot be zero');
  }
  if (!d2 || d2 === 0) {
    throw new Error('Denominator 2 cannot be zero');
  }

  let resultNum: number;
  let resultDen: number;
  const steps: StepDetail[] = [];

  switch (operation) {
    case 'add': {
      // a/b + c/d = (ad + bc) / bd
      resultNum = n1 * d2 + n2 * d1;
      resultDen = d1 * d2;

      steps.push({ label: 'Operation', value: `${n1}/${d1} + ${n2}/${d2}` });
      steps.push({ label: 'Find common denominator', value: `${d1} × ${d2} = ${resultDen}` });
      steps.push({ label: 'Convert numerators', value: `(${n1} × ${d2}) + (${n2} × ${d1}) = ${n1 * d2} + ${n2 * d1} = ${resultNum}` });
      steps.push({ label: 'Unsimplified result', value: `${resultNum}/${resultDen}` });
      break;
    }
    case 'subtract': {
      // a/b - c/d = (ad - bc) / bd
      resultNum = n1 * d2 - n2 * d1;
      resultDen = d1 * d2;

      steps.push({ label: 'Operation', value: `${n1}/${d1} − ${n2}/${d2}` });
      steps.push({ label: 'Find common denominator', value: `${d1} × ${d2} = ${resultDen}` });
      steps.push({ label: 'Convert numerators', value: `(${n1} × ${d2}) − (${n2} × ${d1}) = ${n1 * d2} − ${n2 * d1} = ${resultNum}` });
      steps.push({ label: 'Unsimplified result', value: `${resultNum}/${resultDen}` });
      break;
    }
    case 'multiply': {
      // a/b × c/d = ac / bd
      resultNum = n1 * n2;
      resultDen = d1 * d2;

      steps.push({ label: 'Operation', value: `${n1}/${d1} × ${n2}/${d2}` });
      steps.push({ label: 'Multiply numerators', value: `${n1} × ${n2} = ${resultNum}` });
      steps.push({ label: 'Multiply denominators', value: `${d1} × ${d2} = ${resultDen}` });
      steps.push({ label: 'Unsimplified result', value: `${resultNum}/${resultDen}` });
      break;
    }
    case 'divide': {
      // a/b ÷ c/d = ad / bc
      if (n2 === 0) {
        throw new Error('Cannot divide by zero (second fraction numerator is zero)');
      }
      resultNum = n1 * d2;
      resultDen = d1 * n2;

      steps.push({ label: 'Operation', value: `${n1}/${d1} ÷ ${n2}/${d2}` });
      steps.push({ label: 'Flip the second fraction', value: `${n1}/${d1} × ${d2}/${n2}` });
      steps.push({ label: 'Multiply numerators', value: `${n1} × ${d2} = ${resultNum}` });
      steps.push({ label: 'Multiply denominators', value: `${d1} × ${n2} = ${resultDen}` });
      steps.push({ label: 'Unsimplified result', value: `${resultNum}/${resultDen}` });
      break;
    }
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  // Simplify the result
  const [simpNum, simpDen] = simplifyFraction(resultNum, resultDen);
  const simplified = formatFraction(simpNum, simpDen);
  const unsimplified = formatFraction(resultNum, resultDen);

  if (unsimplified !== simplified) {
    const divisor = gcd(Math.abs(resultNum), Math.abs(resultDen));
    steps.push({ label: 'GCD', value: `gcd(${Math.abs(resultNum)}, ${Math.abs(resultDen)}) = ${divisor}` });
    steps.push({ label: 'Simplified result', value: simplified });
  } else {
    steps.push({ label: 'Already simplified', value: simplified });
  }

  // Decimal result
  const decimal = parseFloat((simpNum / simpDen).toFixed(6));

  // Mixed number
  const mixed = toMixedNumber(simpNum, simpDen);

  if (mixed !== simplified && mixed !== String(simpNum)) {
    steps.push({ label: 'Mixed number', value: mixed });
  }

  return {
    result: unsimplified,
    simplifiedResult: simplified,
    decimalResult: decimal,
    mixedNumber: mixed,
    stepByStep: steps,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'fractions': calculateFractions,
};
