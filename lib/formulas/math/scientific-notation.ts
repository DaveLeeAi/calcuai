/**
 * Scientific Notation Calculator
 *
 * Converts between decimal numbers and scientific notation (a x 10^n).
 *
 * Scientific notation: a x 10^n where 1 <= |a| < 10
 * Engineering notation: a x 10^n where n is a multiple of 3
 *
 * Source: IEEE 754 floating-point standard; NIST SI notation guidelines
 */

export interface ScientificNotationInput {
  mode: 'to-scientific' | 'from-scientific';
  decimalNumber?: number;
  coefficient?: number;
  exponent?: number;
}

export interface ScientificNotationOutput {
  scientificNotation: string;
  decimalForm: string;
  coefficient: number;
  exponent: number;
  engineeringNotation: string;
  ePlusNotation: string;
  significantFigures: number;
}

function countSignificantDigits(numStr: string): number {
  const cleaned = numStr.replace(/^[+-]/, '').replace(/,/g, '');
  const hasDecimal = cleaned.includes('.');
  const withoutDecimal = cleaned.replace('.', '');

  // Find first non-zero
  let start = 0;
  while (start < withoutDecimal.length && withoutDecimal[start] === '0') start++;

  if (start === withoutDecimal.length) return 1; // all zeros

  if (hasDecimal) {
    // All digits from first non-zero to end are significant
    return withoutDecimal.length - start;
  } else {
    // Trailing zeros in whole numbers are ambiguous - treat as not significant
    let end = withoutDecimal.length - 1;
    while (end > start && withoutDecimal[end] === '0') end--;
    return end - start + 1;
  }
}

export function calculateScientificNotation(inputs: Record<string, unknown>): Record<string, unknown> {
  const mode = String(inputs.mode || 'to-scientific');

  let decimalValue: number;
  let coefficient: number;
  let exponent: number;

  if (mode === 'to-scientific') {
    decimalValue = Number(inputs.decimalNumber);
    if (isNaN(decimalValue)) {
      return {
        scientificNotation: 'Invalid input',
        decimalForm: 'Invalid input',
        coefficient: null,
        exponent: null,
        engineeringNotation: 'Invalid input',
        ePlusNotation: 'Invalid input',
        significantFigures: 0,
        error: 'Please enter a valid number.',
      };
    }

    if (decimalValue === 0) {
      return {
        scientificNotation: '0 x 10^0',
        decimalForm: '0',
        coefficient: 0,
        exponent: 0,
        engineeringNotation: '0 x 10^0',
        ePlusNotation: '0e+0',
        significantFigures: 1,
      };
    }

    exponent = Math.floor(Math.log10(Math.abs(decimalValue)));
    coefficient = decimalValue / Math.pow(10, exponent);

    // Fix floating-point edge cases (e.g., 999.999... → coefficient should be exactly some value)
    coefficient = parseFloat(coefficient.toPrecision(15));
  } else {
    // from-scientific: given coefficient and exponent
    coefficient = Number(inputs.coefficient);
    exponent = Number(inputs.exponent) || 0;

    if (isNaN(coefficient)) {
      return {
        scientificNotation: 'Invalid input',
        decimalForm: 'Invalid input',
        coefficient: null,
        exponent: null,
        engineeringNotation: 'Invalid input',
        ePlusNotation: 'Invalid input',
        significantFigures: 0,
        error: 'Please enter a valid coefficient.',
      };
    }

    decimalValue = coefficient * Math.pow(10, exponent);

    // Normalize to standard scientific notation (1 <= |a| < 10)
    if (coefficient !== 0) {
      const normExp = Math.floor(Math.log10(Math.abs(coefficient)));
      coefficient = coefficient / Math.pow(10, normExp);
      coefficient = parseFloat(coefficient.toPrecision(15));
      exponent = exponent + normExp;
    }
  }

  // Engineering notation: exponent is multiple of 3
  let engExponent = Math.floor(exponent / 3) * 3;
  if (exponent < 0 && exponent % 3 !== 0) {
    engExponent = engExponent - 3;
  }
  const engCoefficient = decimalValue / Math.pow(10, engExponent);

  // Format decimal form
  let decimalForm: string;
  if (Math.abs(decimalValue) >= 1e-6 && Math.abs(decimalValue) < 1e15) {
    // Use standard decimal for reasonable ranges
    decimalForm = String(decimalValue);
    // Avoid scientific notation in the string representation
    if (decimalForm.includes('e') || decimalForm.includes('E')) {
      decimalForm = decimalValue.toFixed(Math.max(0, -exponent + 10));
      // Trim trailing zeros after decimal
      if (decimalForm.includes('.')) {
        decimalForm = decimalForm.replace(/0+$/, '').replace(/\.$/, '');
      }
    }
  } else if (decimalValue === 0) {
    decimalForm = '0';
  } else {
    decimalForm = decimalValue.toExponential();
  }

  // Count sig figs from original input
  let sigFigs: number;
  if (mode === 'to-scientific' && inputs.decimalNumber !== undefined) {
    sigFigs = countSignificantDigits(String(inputs.decimalNumber));
  } else {
    sigFigs = countSignificantDigits(String(inputs.coefficient || '0'));
  }

  // Format outputs
  const coeffStr = parseFloat(coefficient.toPrecision(sigFigs));
  const engCoeffStr = parseFloat(engCoefficient.toPrecision(sigFigs));

  return {
    scientificNotation: `${coeffStr} x 10^${exponent}`,
    decimalForm,
    coefficient: parseFloat(coefficient.toPrecision(15)),
    exponent,
    engineeringNotation: `${engCoeffStr} x 10^${engExponent}`,
    ePlusNotation: `${coeffStr}e${exponent >= 0 ? '+' : ''}${exponent}`,
    significantFigures: sigFigs,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'scientific-notation': calculateScientificNotation,
};
