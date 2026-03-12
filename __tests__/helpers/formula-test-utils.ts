/**
 * Shared test utilities for formula unit tests.
 *
 * These helpers enforce consistent assertion patterns across all formula tests.
 * They are pure test utilities — no formula logic is mocked or altered.
 *
 * Usage:
 *   import { expectPositiveFiniteNumber, expectSummaryLabels } from '../helpers/formula-test-utils';
 */

/** Formula function signature used throughout the registry. */
type FormulaFn = (inputs: Record<string, unknown>) => Record<string, unknown>;

// ─── Numeric assertions ──────────────────────────────────────────────────────

/**
 * Assert a result field is a positive finite number.
 * Fails with a descriptive message identifying the field name.
 */
export function expectPositiveFiniteNumber(
  result: Record<string, unknown>,
  key: string
): void {
  const value = result[key];
  if (typeof value !== 'number') {
    throw new Error(
      `Expected result.${key} to be a number, got ${typeof value}: ${JSON.stringify(value)}`
    );
  }
  if (!isFinite(value)) {
    throw new Error(`Expected result.${key} to be finite, got ${value}`);
  }
  if (value <= 0) {
    throw new Error(`Expected result.${key} to be positive, got ${value}`);
  }
}

/**
 * Assert a result field is a non-negative finite number (allows zero).
 */
export function expectNonNegativeFiniteNumber(
  result: Record<string, unknown>,
  key: string
): void {
  const value = result[key];
  if (typeof value !== 'number') {
    throw new Error(
      `Expected result.${key} to be a number, got ${typeof value}: ${JSON.stringify(value)}`
    );
  }
  if (!isFinite(value)) {
    throw new Error(`Expected result.${key} to be finite, got ${value}`);
  }
  if (value < 0) {
    throw new Error(`Expected result.${key} to be non-negative, got ${value}`);
  }
}

/**
 * Assert a numeric value is within an absolute tolerance of the expected value.
 * More readable than toBeCloseTo when the tolerance needs to be explicit.
 *
 * @example
 *   expectWithinTolerance(result.monthlyPayment, 1769.79, 1.0, 'monthlyPayment');
 */
export function expectWithinTolerance(
  actual: number,
  expected: number,
  tolerance: number,
  label = 'value'
): void {
  const diff = Math.abs(actual - expected);
  if (diff > tolerance) {
    throw new Error(
      `${label}: expected ${expected} ± ${tolerance}, got ${actual} (diff ${diff.toFixed(6)})`
    );
  }
}

// ─── Structure assertions ────────────────────────────────────────────────────

/**
 * Assert a summary array (label/value pairs) contains all required labels.
 * Throws with the full label list if any are missing.
 */
export function expectSummaryLabels(
  summary: unknown,
  requiredLabels: string[]
): void {
  if (!Array.isArray(summary)) {
    throw new Error(`Expected summary to be an array, got ${typeof summary}`);
  }
  const found = (summary as Array<{ label: string }>).map((s) => s.label);
  const missing = requiredLabels.filter((l) => !found.includes(l));
  if (missing.length > 0) {
    throw new Error(
      `Summary missing labels: [${missing.join(', ')}]. Found: [${found.join(', ')}]`
    );
  }
}

/**
 * Assert a breakdown array (name/value pairs) contains all required names.
 */
export function expectBreakdownNames(
  breakdown: unknown,
  requiredNames: string[]
): void {
  if (!Array.isArray(breakdown)) {
    throw new Error(`Expected breakdown to be an array, got ${typeof breakdown}`);
  }
  const found = (breakdown as Array<{ name: string }>).map((b) => b.name);
  const missing = requiredNames.filter((n) => !found.includes(n));
  if (missing.length > 0) {
    throw new Error(
      `Breakdown missing names: [${missing.join(', ')}]. Found: [${found.join(', ')}]`
    );
  }
}

/**
 * Assert a result field is an array of at least `minLength` items.
 */
export function expectArray(
  result: Record<string, unknown>,
  key: string,
  minLength = 1
): unknown[] {
  const value = result[key];
  if (!Array.isArray(value)) {
    throw new Error(`Expected result.${key} to be an array, got ${typeof value}`);
  }
  if (value.length < minLength) {
    throw new Error(
      `Expected result.${key} to have at least ${minLength} items, got ${value.length}`
    );
  }
  return value;
}

// ─── Safety assertions ───────────────────────────────────────────────────────

/**
 * Assert that calling a formula with the given inputs does NOT throw.
 * Returns the result for further assertions.
 *
 * @example
 *   const result = expectNoThrow(calculateBMI, { weight: 70, height: 175, unitSystem: 'metric' });
 *   expect(result.bmi).toBeCloseTo(22.9, 1);
 */
export function expectNoThrow(
  formulaFn: FormulaFn,
  inputs: Record<string, unknown>
): Record<string, unknown> {
  let result: Record<string, unknown> | undefined;
  expect(() => {
    result = formulaFn(inputs);
  }).not.toThrow();
  if (result === undefined) {
    throw new Error('Formula returned undefined instead of a result object');
  }
  return result;
}

/**
 * Assert that calling a formula with the given inputs DOES throw.
 * Optionally assert the error message contains `expectedMessage`.
 */
export function expectThrows(
  formulaFn: FormulaFn,
  inputs: Record<string, unknown>,
  expectedMessage?: string
): void {
  expect(() => formulaFn(inputs)).toThrow(expectedMessage);
}

// ─── Rounding helpers ────────────────────────────────────────────────────────

/**
 * Round a number to the given number of decimal places — same precision
 * used internally by many formula modules.
 */
export function round(value: number, decimals: number): number {
  return parseFloat(value.toFixed(decimals));
}

/**
 * Assert two numbers are equal after rounding to the same decimal place.
 * Mirrors the parseFloat(x.toFixed(n)) pattern used in formula modules.
 */
export function expectRoundedEqual(
  actual: number,
  expected: number,
  decimals: number,
  label = 'value'
): void {
  const roundedActual = round(actual, decimals);
  const roundedExpected = round(expected, decimals);
  if (roundedActual !== roundedExpected) {
    throw new Error(
      `${label}: expected ${roundedExpected} (rounded to ${decimals}dp), got ${roundedActual}`
    );
  }
}

// ─── Currency precision helpers ─────────────────────────────────────────────

/**
 * Assert a result field is a valid currency value (finite number, 2 decimal places).
 * Use for YMYL finance formulas where rounding drift matters.
 *
 * @example
 *   expectCurrencyPrecision(result, 'monthlyPayment', 1769.79);
 */
export function expectCurrencyPrecision(
  result: Record<string, unknown>,
  key: string,
  expected: number
): void {
  const value = result[key];
  if (typeof value !== 'number') {
    throw new Error(
      `Expected result.${key} to be a number, got ${typeof value}: ${JSON.stringify(value)}`
    );
  }
  if (!isFinite(value)) {
    throw new Error(`Expected result.${key} to be finite, got ${value}`);
  }
  // Check 2dp precision (currency standard)
  const rounded = parseFloat(value.toFixed(2));
  if (value !== rounded) {
    throw new Error(
      `result.${key} has more than 2 decimal places: ${value} (expected ${rounded})`
    );
  }
  // Check value matches expected
  if (rounded !== expected) {
    throw new Error(
      `result.${key}: expected ${expected}, got ${rounded} (diff ${Math.abs(rounded - expected).toFixed(4)})`
    );
  }
}

// ─── Invariant helpers ──────────────────────────────────────────────────────

/**
 * Assert that a set of breakdown/pie-chart values sum to a total (within tolerance).
 * Verifies cross-field consistency — catches rounding drift between parts and whole.
 *
 * @example
 *   expectPartsEqualTotal(result, ['principal', 'interest'], 'totalPayment', 0.02);
 */
export function expectPartsEqualTotal(
  result: Record<string, unknown>,
  partKeys: string[],
  totalKey: string,
  tolerance = 0.01
): void {
  const total = result[totalKey];
  if (typeof total !== 'number') {
    throw new Error(`Expected result.${totalKey} to be a number, got ${typeof total}`);
  }
  let partsSum = 0;
  for (const key of partKeys) {
    const val = result[key];
    if (typeof val !== 'number') {
      throw new Error(`Expected result.${key} to be a number, got ${typeof val}`);
    }
    partsSum += val;
  }
  const diff = Math.abs(partsSum - total);
  if (diff > tolerance) {
    throw new Error(
      `Parts [${partKeys.join('+')}] = ${partsSum.toFixed(4)} but ${totalKey} = ${total} (diff ${diff.toFixed(4)}, tolerance ${tolerance})`
    );
  }
}

/**
 * Assert that a summary-style array of {label, value} entries sums to a given total.
 *
 * @example
 *   expectSummaryValuesSum(result.breakdown, 'futureValue', result.futureValue as number, 1.0);
 */
export function expectSummaryValuesSum(
  items: unknown,
  totalLabel: string,
  expectedTotal: number,
  tolerance = 0.01
): void {
  if (!Array.isArray(items)) {
    throw new Error(`Expected array for sum check, got ${typeof items}`);
  }
  const sum = (items as Array<{ value: number }>).reduce((acc, item) => acc + item.value, 0);
  const diff = Math.abs(sum - expectedTotal);
  if (diff > tolerance) {
    throw new Error(
      `Sum of items (${sum.toFixed(4)}) does not match ${totalLabel} (${expectedTotal}) — diff ${diff.toFixed(4)}, tolerance ${tolerance}`
    );
  }
}

// ─── Invalid input helpers ──────────────────────────────────────────────────

/**
 * Standard invalid input values to test formula robustness.
 * Formulas using `Number(x) || 0` coercion should handle all of these gracefully.
 */
export const INVALID_INPUTS = {
  undefined: undefined,
  null: null,
  emptyString: '',
  nonNumericString: 'abc',
  NaN: NaN,
  Infinity: Infinity,
  negativeInfinity: -Infinity,
  object: {},
  array: [],
  boolean: true,
} as const;

/**
 * Run a formula with each invalid value substituted for a given input key.
 * Asserts the formula does NOT throw for any invalid input.
 * Returns all results for further assertions.
 *
 * @example
 *   const results = testInvalidInputs(calculateMortgage, baseInputs, 'homePrice');
 *   results.forEach(({ label, result }) => {
 *     expect(typeof result.monthlyPayment).toBe('number');
 *   });
 */
export function testInvalidInputs(
  formulaFn: FormulaFn,
  baseInputs: Record<string, unknown>,
  targetKey: string
): Array<{ label: string; result: Record<string, unknown> }> {
  const results: Array<{ label: string; result: Record<string, unknown> }> = [];
  for (const [label, invalidValue] of Object.entries(INVALID_INPUTS)) {
    const inputs = { ...baseInputs, [targetKey]: invalidValue };
    let result: Record<string, unknown>;
    try {
      result = formulaFn(inputs);
    } catch (e) {
      throw new Error(
        `Formula threw when ${targetKey}=${label} (${JSON.stringify(invalidValue)}): ${e}`
      );
    }
    results.push({ label, result });
  }
  return results;
}

/**
 * Assert a formula handles missing keys gracefully (no throw).
 * Removes each key from inputs one at a time and verifies the formula still runs.
 */
export function testMissingInputs(
  formulaFn: FormulaFn,
  baseInputs: Record<string, unknown>,
  requiredKeys: string[]
): void {
  for (const key of requiredKeys) {
    const inputs = { ...baseInputs };
    delete inputs[key];
    try {
      formulaFn(inputs);
    } catch (e) {
      throw new Error(
        `Formula threw when key "${key}" was missing from inputs: ${e}`
      );
    }
  }
}

// ─── Boundary value helpers ─────────────────────────────────────────────────

/**
 * Generate boundary test values around a given point.
 * Useful for testing rate thresholds (e.g., 20% down payment PMI cutoff).
 *
 * @example
 *   const values = boundaryValues(20, 0.01);
 *   // Returns [19.99, 20, 20.01]
 */
export function boundaryValues(point: number, delta = 0.01): [number, number, number] {
  return [
    parseFloat((point - delta).toFixed(10)),
    point,
    parseFloat((point + delta).toFixed(10)),
  ];
}

/**
 * Run a formula across a range of values for a single input field.
 * Returns all results — useful for monotonicity checks and regression pinning.
 *
 * @example
 *   const results = sweepInput(calculateMortgage, baseInputs, 'interestRate', [0, 1, 3, 5, 7, 10]);
 *   // Verify monthlyPayment increases with rate
 *   for (let i = 1; i < results.length; i++) {
 *     expect(results[i].result.monthlyPayment).toBeGreaterThan(results[i-1].result.monthlyPayment);
 *   }
 */
export function sweepInput(
  formulaFn: FormulaFn,
  baseInputs: Record<string, unknown>,
  sweepKey: string,
  values: number[]
): Array<{ input: number; result: Record<string, unknown> }> {
  return values.map((val) => {
    const result = formulaFn({ ...baseInputs, [sweepKey]: val });
    return { input: val, result };
  });
}
