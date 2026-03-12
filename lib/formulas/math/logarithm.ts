export interface LogarithmInput {
  mode: 'common' | 'natural' | 'custom';
  value: number;
  base?: number;
}

export interface LogarithmOutput {
  result: number;
  antilog: number;
  baseUsed: number;
}

/**
 * Logarithm calculation using the change of base formula:
 *
 *   log_b(x) = ln(x) / ln(b)
 *
 * Where:
 *   b = base of the logarithm (10 for common, e for natural, or any positive number != 1)
 *   x = the value (argument) of the logarithm (must be > 0)
 *
 * The antilog (verification) is computed as:
 *   antilog = b^result
 *
 * Source: Change of base formula — standard logarithmic identity documented in
 * Abramowitz & Stegun, "Handbook of Mathematical Functions" (Dover, 1965), Section 4.1.
 */
export function calculateLogarithm(inputs: Record<string, unknown>): Record<string, unknown> {
  const mode = String(inputs.mode || 'common');
  const value = Number(inputs.value);

  if (isNaN(value)) {
    return {
      result: NaN,
      antilog: NaN,
      baseUsed: NaN,
      error: 'Value must be a number.',
    };
  }

  // log of negative numbers is NaN (in the reals)
  if (value < 0) {
    return {
      result: NaN,
      antilog: NaN,
      baseUsed: NaN,
      error: 'Logarithm of a negative number is undefined in the real number system.',
    };
  }

  // log of 0 is -Infinity
  if (value === 0) {
    let baseUsed: number;
    switch (mode) {
      case 'common':
        baseUsed = 10;
        break;
      case 'natural':
        baseUsed = Math.E;
        break;
      case 'custom':
        baseUsed = Number(inputs.base) || 2;
        break;
      default:
        baseUsed = 10;
    }
    return {
      result: -Infinity,
      antilog: 0,
      baseUsed: parseFloat(baseUsed.toFixed(10)),
    };
  }

  let result: number;
  let baseUsed: number;

  switch (mode) {
    case 'common': {
      baseUsed = 10;
      result = Math.log10(value);
      break;
    }

    case 'natural': {
      baseUsed = Math.E;
      result = Math.log(value);
      break;
    }

    case 'custom': {
      baseUsed = Number(inputs.base);

      if (isNaN(baseUsed) || baseUsed <= 0) {
        return {
          result: NaN,
          antilog: NaN,
          baseUsed: NaN,
          error: 'Base must be a positive number.',
        };
      }

      if (baseUsed === 1) {
        return {
          result: NaN,
          antilog: NaN,
          baseUsed: 1,
          error: 'Logarithm base 1 is undefined (division by zero in change of base formula).',
        };
      }

      // Change of base formula: log_b(x) = ln(x) / ln(b)
      result = Math.log(value) / Math.log(baseUsed);
      break;
    }

    default:
      throw new Error(`Unknown logarithm mode: ${mode}. Expected "common", "natural", or "custom".`);
  }

  // Antilog verification: b^result should equal the original value
  const antilog = Math.pow(baseUsed, result);

  return {
    result: parseFloat(result.toFixed(10)),
    antilog: parseFloat(antilog.toFixed(10)),
    baseUsed: parseFloat(baseUsed.toFixed(10)),
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'logarithm': calculateLogarithm,
};
