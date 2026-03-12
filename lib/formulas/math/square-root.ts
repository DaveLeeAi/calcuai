/**
 * Square Root / Nth Root Calculator
 *
 * Computes:
 *   sqrt(x) = x^(1/2)
 *   nth_root(x) = x^(1/n)
 *
 * Also determines if the result is a perfect root and provides
 * a simplified radical form when possible.
 *
 * Source: Standard mathematical root extraction (Newton's method converges to x^(1/n))
 */

export interface SquareRootInput {
  number: number;
  nthRoot: number; // default 2 for square root
}

export interface SquareRootOutput {
  result: number;
  isPerfect: boolean;
  simplified: string;
  inputNumber: number;
  rootIndex: number;
  squared: number;
  cubed: number;
}

/**
 * Check if a number is a perfect nth power.
 */
function isPerfectNthPower(num: number, n: number): boolean {
  if (n < 1 || !Number.isInteger(n)) return false;
  if (num < 0 && n % 2 === 0) return false;

  const absNum = Math.abs(num);
  const root = Math.round(Math.pow(absNum, 1 / n));

  // Check both root and root+/-1 due to floating-point
  for (const candidate of [root - 1, root, root + 1]) {
    if (candidate >= 0 && Math.pow(candidate, n) === absNum) {
      return true;
    }
  }
  return false;
}

/**
 * Get the integer nth root if it's a perfect power, otherwise null.
 */
function getExactNthRoot(num: number, n: number): number | null {
  if (num < 0 && n % 2 === 0) return null;

  const sign = num < 0 ? -1 : 1;
  const absNum = Math.abs(num);
  const root = Math.round(Math.pow(absNum, 1 / n));

  for (const candidate of [root - 1, root, root + 1]) {
    if (candidate >= 0 && Math.pow(candidate, n) === absNum) {
      return sign * candidate;
    }
  }
  return null;
}

/**
 * Simplify a square root: sqrt(n) = a * sqrt(b) where b has no perfect square factors.
 */
function simplifySquareRoot(n: number): { coefficient: number; radicand: number } {
  if (n <= 0 || !Number.isInteger(n)) {
    return { coefficient: 1, radicand: Math.abs(n) };
  }

  let coefficient = 1;
  let radicand = n;

  // Extract perfect square factors
  for (let i = 2; i * i <= radicand; i++) {
    while (radicand % (i * i) === 0) {
      coefficient *= i;
      radicand /= i * i;
    }
  }

  return { coefficient, radicand };
}

export function calculateSquareRoot(inputs: Record<string, unknown>): Record<string, unknown> {
  const number = Number(inputs.number);
  const rootIndex = Number(inputs.nthRoot) || 2;

  if (isNaN(number)) {
    return {
      result: null,
      isPerfect: false,
      simplified: 'Invalid input',
      inputNumber: null,
      rootIndex,
      squared: null,
      cubed: null,
      error: 'Please enter a valid number.',
    };
  }

  if (rootIndex < 1 || rootIndex === 0) {
    return {
      result: null,
      isPerfect: false,
      simplified: 'Invalid root index',
      inputNumber: number,
      rootIndex,
      squared: null,
      cubed: null,
      error: 'Root index must be a positive integer.',
    };
  }

  // Even roots of negative numbers are not real
  if (number < 0 && rootIndex % 2 === 0) {
    return {
      result: null,
      isPerfect: false,
      simplified: 'No real root (even root of negative number)',
      inputNumber: number,
      rootIndex,
      squared: number * number,
      cubed: number * number * number,
      error: 'Even roots of negative numbers are not real.',
    };
  }

  // Compute the root
  let result: number;
  if (number < 0) {
    // Odd root of negative number
    result = -Math.pow(Math.abs(number), 1 / rootIndex);
  } else {
    result = Math.pow(number, 1 / rootIndex);
  }

  const isPerfect = isPerfectNthPower(number, rootIndex);
  const exactRoot = getExactNthRoot(number, rootIndex);

  // Format result
  const resultRounded = isPerfect && exactRoot !== null
    ? exactRoot
    : parseFloat(result.toFixed(10));

  // Simplified radical form (only for square roots of positive integers)
  let simplified: string;
  if (rootIndex === 2 && number >= 0 && Number.isInteger(number)) {
    if (isPerfect && exactRoot !== null) {
      simplified = String(exactRoot);
    } else {
      const { coefficient, radicand } = simplifySquareRoot(number);
      if (coefficient === 1) {
        simplified = `sqrt(${radicand})`;
      } else if (radicand === 1) {
        simplified = String(coefficient);
      } else {
        simplified = `${coefficient} * sqrt(${radicand})`;
      }
    }
  } else if (isPerfect && exactRoot !== null) {
    simplified = String(exactRoot);
  } else {
    simplified = parseFloat(result.toFixed(10)).toString();
  }

  return {
    result: resultRounded,
    isPerfect,
    simplified,
    inputNumber: number,
    rootIndex,
    squared: parseFloat((number * number).toPrecision(15)),
    cubed: parseFloat((number * number * number).toPrecision(15)),
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'square-root': calculateSquareRoot,
};
