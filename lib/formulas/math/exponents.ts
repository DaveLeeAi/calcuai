export interface ExponentInput {
  mode: 'power' | 'root';
  base: number;
  exponent: number;
  value: number;
  rootIndex: number;
}

export interface StepDetail {
  label: string;
  value: string;
}

export interface ExponentOutput {
  result: number;
  intermediateSteps: StepDetail[];
}

/**
 * Exponent calculator supporting two modes:
 *
 * **Power:** Computes base^exponent.
 *   result = base^exponent
 *
 *   Special cases:
 *   - x^0 = 1 for any x (including 0^0 = 1 by convention)
 *   - x^1 = x
 *   - x^(-n) = 1 / x^n
 *   - Negative base with fractional exponent → NaN (complex number result)
 *
 * **Root:** Computes the nth root of a value.
 *   result = value^(1/n)
 *
 *   Special cases:
 *   - Even root of a negative number → NaN (not real)
 *   - Odd root of a negative number → negative result: -(|value|^(1/n))
 *   - 0th root is undefined
 *
 * Source: Standard exponentiation rules from algebra and real analysis.
 *         Laws of exponents as defined in pre-calculus and calculus textbooks
 *         (e.g., Stewart's Calculus, Blitzer's Precalculus).
 */
export function calculateExponent(inputs: Record<string, unknown>): Record<string, unknown> {
  const mode = String(inputs.mode || 'power') as ExponentInput['mode'];

  const steps: StepDetail[] = [];

  switch (mode) {
    case 'power': {
      const base = Number(inputs.base);
      const exponent = Number(inputs.exponent);

      if (isNaN(base) || isNaN(exponent)) {
        throw new Error('Base and exponent must be valid numbers');
      }

      return computePower(base, exponent, steps);
    }
    case 'root': {
      const value = Number(inputs.value);
      const rootIndex = Number(inputs.rootIndex);

      if (isNaN(value) || isNaN(rootIndex)) {
        throw new Error('Value and root index must be valid numbers');
      }

      return computeRoot(value, rootIndex, steps);
    }
    default:
      throw new Error(`Unknown mode: ${mode}`);
  }
}

/**
 * Compute base^exponent with detailed steps.
 */
function computePower(base: number, exponent: number, steps: StepDetail[]): Record<string, unknown> {
  steps.push({ label: 'Expression', value: `${base}^${exponent}` });

  // Special case: 0^0 = 1 by convention
  if (base === 0 && exponent === 0) {
    steps.push({ label: 'Convention', value: '0^0 = 1 by mathematical convention' });
    return { result: 1, intermediateSteps: steps };
  }

  // Special case: any base to the power of 0
  if (exponent === 0) {
    steps.push({ label: 'Rule', value: 'Any nonzero number raised to the power of 0 equals 1' });
    steps.push({ label: 'Result', value: `${base}^0 = 1` });
    return { result: 1, intermediateSteps: steps };
  }

  // Special case: any base to the power of 1
  if (exponent === 1) {
    steps.push({ label: 'Rule', value: 'Any number raised to the power of 1 equals itself' });
    steps.push({ label: 'Result', value: `${base}^1 = ${base}` });
    return { result: base, intermediateSteps: steps };
  }

  // Negative exponent
  if (exponent < 0) {
    steps.push({ label: 'Negative exponent rule', value: `${base}^(${exponent}) = 1 / ${base}^${Math.abs(exponent)}` });
    if (base === 0) {
      steps.push({ label: 'Error', value: 'Cannot raise 0 to a negative power (division by zero)' });
      return { result: NaN, intermediateSteps: steps };
    }
    const positiveResult = Math.pow(base, Math.abs(exponent));
    steps.push({ label: 'Compute positive power', value: `${base}^${Math.abs(exponent)} = ${positiveResult}` });
    const result = 1 / positiveResult;
    steps.push({ label: 'Take reciprocal', value: `1 / ${positiveResult} = ${parseFloat(result.toFixed(10))}` });
    return { result: parseFloat(result.toFixed(10)), intermediateSteps: steps };
  }

  // Fractional exponent with negative base
  if (base < 0 && !Number.isInteger(exponent)) {
    // Check if the denominator of the fractional exponent is even (complex result)
    steps.push({ label: 'Warning', value: 'Negative base with fractional exponent may produce a complex number' });
    const result = Math.pow(base, exponent);
    if (isNaN(result)) {
      steps.push({ label: 'Result', value: 'Not a real number (complex result)' });
      return { result: NaN, intermediateSteps: steps };
    }
    steps.push({ label: 'Result', value: `${parseFloat(result.toFixed(10))}` });
    return { result: parseFloat(result.toFixed(10)), intermediateSteps: steps };
  }

  // Standard computation
  const result = Math.pow(base, exponent);

  if (Number.isInteger(exponent) && exponent > 0 && exponent <= 5) {
    // Show expanded multiplication for small integer exponents
    const factors = Array(exponent).fill(base).join(' × ');
    steps.push({ label: 'Expand', value: `${factors}` });
  }

  steps.push({ label: 'Result', value: `${base}^${exponent} = ${parseFloat(result.toFixed(10))}` });

  return { result: parseFloat(result.toFixed(10)), intermediateSteps: steps };
}

/**
 * Compute the nth root of a value: value^(1/n)
 */
function computeRoot(value: number, rootIndex: number, steps: StepDetail[]): Record<string, unknown> {
  if (rootIndex === 0) {
    steps.push({ label: 'Error', value: '0th root is undefined' });
    return { result: NaN, intermediateSteps: steps };
  }

  const rootName = rootIndex === 2 ? 'square' : rootIndex === 3 ? 'cube' : `${rootIndex}th`;
  steps.push({ label: 'Expression', value: `${rootName} root of ${value}` });
  steps.push({ label: 'Equivalent exponent', value: `${value}^(1/${rootIndex})` });

  // Even root of a negative number is not real
  if (value < 0 && rootIndex % 2 === 0) {
    steps.push({ label: 'Error', value: `Even root of a negative number is not a real number` });
    return { result: NaN, intermediateSteps: steps };
  }

  // Odd root of a negative number
  if (value < 0 && rootIndex % 2 !== 0) {
    const absResult = Math.pow(Math.abs(value), 1 / rootIndex);
    const result = -absResult;
    steps.push({ label: 'Odd root of negative', value: `−(|${value}|^(1/${rootIndex}))` });
    steps.push({ label: 'Compute', value: `|${value}|^(1/${rootIndex}) = ${parseFloat(absResult.toFixed(10))}` });
    steps.push({ label: 'Apply sign', value: `Result = ${parseFloat(result.toFixed(10))}` });
    return { result: parseFloat(result.toFixed(10)), intermediateSteps: steps };
  }

  // Standard root computation
  const result = Math.pow(value, 1 / rootIndex);
  steps.push({ label: 'Compute', value: `${value}^(1/${rootIndex}) = ${parseFloat(result.toFixed(10))}` });

  // Verify by raising back to the power
  const verification = Math.pow(result, rootIndex);
  steps.push({ label: 'Verify', value: `${parseFloat(result.toFixed(10))}^${rootIndex} = ${parseFloat(verification.toFixed(6))}` });

  return { result: parseFloat(result.toFixed(10)), intermediateSteps: steps };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'exponents': calculateExponent,
};
