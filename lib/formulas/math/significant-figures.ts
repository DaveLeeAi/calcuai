/**
 * Significant Figures Calculator
 *
 * Counts and rounds numbers to a specified number of significant figures.
 *
 * Rules for counting significant figures:
 * 1. All non-zero digits are significant.
 * 2. Zeros between non-zero digits are significant.
 * 3. Leading zeros are NOT significant.
 * 4. Trailing zeros after a decimal point ARE significant.
 * 5. Trailing zeros in a whole number are ambiguous (treated as NOT significant
 *    unless indicated by a decimal point or scientific notation).
 *
 * Source: NIST Guide for the Use of the International System of Units (SI), Appendix B
 */

export interface SigFigInput {
  number: string;
  mode: 'count' | 'round';
  roundTo?: number;
}

export interface SigFigOutput {
  significantFigures: number;
  scientificNotation: string;
  roundedValue: string | null;
  inputNumber: string;
  isExact: boolean;
  digits: SigFigDigit[];
}

interface SigFigDigit {
  digit: string;
  isSignificant: boolean;
  position: number;
}

/**
 * Count significant figures in a number string.
 */
function countSigFigs(numStr: string): { count: number; digits: SigFigDigit[] } {
  // Normalize: remove leading/trailing whitespace, handle negative
  let cleaned = numStr.trim().replace(/^[+-]/, '');

  // Remove any commas
  cleaned = cleaned.replace(/,/g, '');

  // Check for scientific notation (e.g., "3.00e5")
  const sciMatch = cleaned.match(/^([0-9]*\.?[0-9]+)[eE][+-]?[0-9]+$/);
  if (sciMatch) {
    cleaned = sciMatch[1];
  }

  // Split into integer and decimal parts
  const hasDecimal = cleaned.includes('.');
  const parts = cleaned.split('.');
  const intPart = parts[0] || '';
  const decPart = parts[1] || '';

  const allDigits = intPart + decPart;
  const digits: SigFigDigit[] = [];

  // Find first non-zero digit position
  let firstNonZero = -1;
  for (let i = 0; i < allDigits.length; i++) {
    if (allDigits[i] !== '0') {
      firstNonZero = i;
      break;
    }
  }

  // If all zeros
  if (firstNonZero === -1) {
    // Special case: "0", "0.0", "0.00" etc.
    // "0" has 1 sig fig; "0.0" has 1 sig fig; "0.00" has 1 sig fig
    // But trailing zeros after decimal in "0.0" indicate precision
    const count = hasDecimal && decPart.length > 0 ? decPart.length : 1;
    for (let i = 0; i < allDigits.length; i++) {
      const posInStr = i < intPart.length ? i : intPart.length + 1 + (i - intPart.length);
      digits.push({
        digit: allDigits[i],
        isSignificant: hasDecimal ? i >= intPart.length || i === intPart.length - 1 : i === allDigits.length - 1,
        position: posInStr,
      });
    }
    return { count, digits };
  }

  // Find last significant digit
  let lastSigDigit: number;
  if (hasDecimal) {
    // With decimal: all trailing zeros are significant
    lastSigDigit = allDigits.length - 1;
  } else {
    // Without decimal: trailing zeros in integer are NOT significant (ambiguous)
    lastSigDigit = allDigits.length - 1;
    for (let i = allDigits.length - 1; i >= firstNonZero; i--) {
      if (allDigits[i] !== '0') {
        lastSigDigit = i;
        break;
      }
    }
  }

  let count = 0;
  for (let i = 0; i < allDigits.length; i++) {
    const isSig = i >= firstNonZero && i <= lastSigDigit;
    digits.push({
      digit: allDigits[i],
      isSignificant: isSig,
      position: i,
    });
    if (isSig) count++;
  }

  return { count, digits };
}

/**
 * Convert a number to scientific notation string.
 */
function toScientificNotation(num: number, sigFigs: number): string {
  if (num === 0) return '0';
  if (!isFinite(num)) return String(num);

  const absNum = Math.abs(num);
  const exponent = Math.floor(Math.log10(absNum));
  const coefficient = num / Math.pow(10, exponent);

  // Format coefficient to sigFigs - 1 decimal places
  const decimals = Math.max(0, sigFigs - 1);
  const coeffStr = coefficient.toFixed(decimals);

  if (exponent === 0) return coeffStr;
  return `${coeffStr} x 10^${exponent}`;
}

/**
 * Round a number to n significant figures.
 */
function roundToSigFigs(num: number, n: number): string {
  if (n < 1) n = 1;
  if (num === 0) return '0';
  if (!isFinite(num)) return String(num);

  const sign = num < 0 ? -1 : 1;
  const absNum = Math.abs(num);
  const magnitude = Math.floor(Math.log10(absNum));
  const factor = Math.pow(10, n - 1 - magnitude);
  const rounded = Math.round(absNum * factor) / factor;

  // Determine decimal places needed
  const decPlaces = Math.max(0, n - 1 - magnitude);
  const result = (sign * rounded).toFixed(decPlaces);

  return result;
}

export function calculateSignificantFigures(inputs: Record<string, unknown>): Record<string, unknown> {
  const numStr = String(inputs.number || '0').trim();
  const mode = String(inputs.mode || 'count');
  const roundTo = Number(inputs.roundTo) || 3;

  // Parse the number
  const numValue = parseFloat(numStr.replace(/,/g, ''));

  if (isNaN(numValue)) {
    return {
      significantFigures: 0,
      scientificNotation: 'Invalid number',
      roundedValue: null,
      inputNumber: numStr,
      isExact: false,
      digits: [],
      error: 'Please enter a valid number.',
    };
  }

  const { count, digits } = countSigFigs(numStr);
  const sciNotation = toScientificNotation(numValue, count);

  let roundedValue: string | null = null;
  if (mode === 'round' && roundTo >= 1) {
    roundedValue = roundToSigFigs(numValue, roundTo);
  }

  return {
    significantFigures: count,
    scientificNotation: sciNotation,
    roundedValue,
    inputNumber: numStr,
    isExact: false,
    digits,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'significant-figures': calculateSignificantFigures,
};
