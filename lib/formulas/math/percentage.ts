export interface PercentOfInput {
  mode: 'percent-of';
  percentValue: number;
  baseValue: number;
}

export interface PercentChangeInput {
  mode: 'percent-change';
  originalValue: number;
  newValue: number;
}

export interface PercentDifferenceInput {
  mode: 'percent-difference';
  value1: number;
  value2: number;
}

export type PercentageInput = PercentOfInput | PercentChangeInput | PercentDifferenceInput;

export interface PercentOfOutput {
  result: number;
}

export interface PercentChangeOutput {
  percentChange: number;
  absoluteChange: number;
}

export interface PercentDifferenceOutput {
  percentDifference: number;
  absoluteDifference: number;
  average: number;
}

export type PercentageOutput = PercentOfOutput | PercentChangeOutput | PercentDifferenceOutput;

/**
 * Standard percentage formulas:
 *
 * 1. Percentage of a number:
 *    Result = (P / 100) × V
 *    Where P = percentage, V = base value
 *
 * 2. Percentage change:
 *    % Change = ((V_new − V_old) / |V_old|) × 100
 *    Where V_new = new value, V_old = original value
 *
 * 3. Percentage difference:
 *    % Difference = (|V1 − V2| / ((V1 + V2) / 2)) × 100
 *    Where V1, V2 = the two values being compared
 *
 * Source: Standard arithmetic operations on ratios, as defined
 * in mathematical reference texts (e.g., CRC Standard Mathematical
 * Tables and Formulae, 33rd Edition).
 */
export function calculatePercentage(inputs: Record<string, unknown>): Record<string, unknown> {
  const mode = String(inputs.mode || 'percent-of');

  // Base output with all fields (inactive fields use null so OutputDisplay shows '—')
  const base: Record<string, unknown> = {
    result: null,
    percentChange: null,
    absoluteChange: null,
    percentDifference: null,
    absoluteDifference: null,
    average: null,
  };

  switch (mode) {
    case 'percent-of': {
      const percentValue = Number(inputs.percentValue) || 0;
      const baseValue = Number(inputs.baseValue) || 0;

      const result = (percentValue / 100) * baseValue;

      return {
        ...base,
        result: parseFloat(result.toFixed(10)),
      };
    }

    case 'percent-change': {
      const originalValue = Number(inputs.originalValue) || 0;
      const newValue = Number(inputs.newValue) || 0;

      const absoluteChange = newValue - originalValue;

      // Division by zero guard: if original is 0, percentage change is undefined
      if (originalValue === 0) {
        return {
          ...base,
          percentChange: newValue === 0 ? 0 : (newValue > 0 ? Infinity : -Infinity),
          absoluteChange: parseFloat(absoluteChange.toFixed(10)),
        };
      }

      const percentChange = (absoluteChange / Math.abs(originalValue)) * 100;

      return {
        ...base,
        percentChange: parseFloat(percentChange.toFixed(10)),
        absoluteChange: parseFloat(absoluteChange.toFixed(10)),
      };
    }

    case 'percent-difference': {
      const value1 = Number(inputs.value1) || 0;
      const value2 = Number(inputs.value2) || 0;

      const absoluteDifference = Math.abs(value1 - value2);
      const average = (value1 + value2) / 2;

      // Division by zero guard: if average is 0, percentage difference is undefined
      if (average === 0) {
        return {
          ...base,
          percentDifference: value1 === value2 ? 0 : Infinity,
          absoluteDifference: parseFloat(absoluteDifference.toFixed(10)),
          average: 0,
        };
      }

      const percentDifference = (absoluteDifference / Math.abs(average)) * 100;

      return {
        ...base,
        percentDifference: parseFloat(percentDifference.toFixed(10)),
        absoluteDifference: parseFloat(absoluteDifference.toFixed(10)),
        average: parseFloat(average.toFixed(10)),
      };
    }

    default:
      throw new Error(`Unknown percentage mode: ${mode}. Expected "percent-of", "percent-change", or "percent-difference".`);
  }
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'percentage': calculatePercentage,
};
