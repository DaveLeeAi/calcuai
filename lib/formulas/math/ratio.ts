export interface RatioInput {
  mode: 'simplify' | 'solve' | 'scale';
  valueA: number;
  valueB: number;
  valueC?: number;
  scaleFactor?: number;
}

export interface StepDetail {
  label: string;
  value: string;
}

export interface RatioOutput {
  ratioA: number;
  ratioB: number;
  ratioString: string;
  gcdUsed: number;
  decimal: number;
  missingValue: number;
  scaledA: number;
  scaledB: number;
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
 * Ratio calculator supporting three modes:
 *
 * **Simplify:** Reduce a ratio a:b to its simplest form by dividing both
 * terms by their GCD.
 *   Simplified ratio = (a / GCD(a, b)) : (b / GCD(a, b))
 *
 * **Solve proportion:** Given a:b = c:x, solve for x using cross-multiplication.
 *   x = (b × c) / a
 *
 * **Scale:** Multiply both terms of a ratio by a scale factor.
 *   Scaled ratio = (a × factor) : (b × factor)
 *
 * Source: Ratio simplification via the Euclidean algorithm (GCD);
 *         cross-multiplication for solving proportions —
 *         standard methods from elementary number theory and algebra.
 */
export function calculateRatio(inputs: Record<string, unknown>): Record<string, unknown> {
  const mode = String(inputs.mode || 'simplify') as RatioInput['mode'];
  const valueA = Number(inputs.valueA) || 0;
  const valueB = Number(inputs.valueB) || 0;

  const steps: StepDetail[] = [];

  switch (mode) {
    case 'simplify': {
      return simplifyRatio(valueA, valueB, steps);
    }
    case 'solve': {
      const valueC = Number(inputs.valueC) || 0;
      return solveRatio(valueA, valueB, valueC, steps);
    }
    case 'scale': {
      const scaleFactor = Number(inputs.scaleFactor) || 1;
      return scaleRatio(valueA, valueB, scaleFactor, steps);
    }
    default:
      throw new Error(`Unknown mode: ${mode}`);
  }
}

/**
 * Simplify a ratio a:b by dividing both terms by their GCD.
 */
function simplifyRatio(a: number, b: number, steps: StepDetail[]): Record<string, unknown> {
  if (a === 0 && b === 0) {
    steps.push({ label: 'Input ratio', value: '0:0' });
    steps.push({ label: 'Note', value: 'Both values are zero — the ratio is undefined' });
    return {
      ratioA: 0,
      ratioB: 0,
      ratioString: '0:0',
      gcdUsed: 0,
      decimal: 0,
      missingValue: 0,
      scaledA: 0,
      scaledB: 0,
      stepByStep: steps,
    };
  }

  if (b === 0) {
    steps.push({ label: 'Input ratio', value: `${a}:0` });
    steps.push({ label: 'Note', value: 'Second value is zero — the ratio simplifies to 1:0' });
    return {
      ratioA: 1,
      ratioB: 0,
      ratioString: '1:0',
      gcdUsed: Math.abs(a),
      decimal: Infinity,
      missingValue: 0,
      scaledA: 0,
      scaledB: 0,
      stepByStep: steps,
    };
  }

  if (a === 0) {
    steps.push({ label: 'Input ratio', value: `0:${b}` });
    steps.push({ label: 'Note', value: 'First value is zero — the ratio simplifies to 0:1' });
    return {
      ratioA: 0,
      ratioB: 1,
      ratioString: '0:1',
      gcdUsed: Math.abs(b),
      decimal: 0,
      missingValue: 0,
      scaledA: 0,
      scaledB: 0,
      stepByStep: steps,
    };
  }

  // Handle negative values: preserve the sign pattern
  const absA = Math.abs(a);
  const absB = Math.abs(b);
  const divisor = gcd(absA, absB);

  const signA = a < 0 ? -1 : 1;
  const signB = b < 0 ? -1 : 1;

  const simplifiedA = (absA / divisor) * signA;
  const simplifiedB = (absB / divisor) * signB;
  const decimal = parseFloat((simplifiedA / simplifiedB).toFixed(6));

  steps.push({ label: 'Input ratio', value: `${a}:${b}` });
  steps.push({ label: 'Find GCD', value: `GCD(${absA}, ${absB}) = ${divisor}` });
  steps.push({ label: 'Divide both terms by GCD', value: `${a} ÷ ${divisor} = ${simplifiedA}, ${b} ÷ ${divisor} = ${simplifiedB}` });
  steps.push({ label: 'Simplified ratio', value: `${simplifiedA}:${simplifiedB}` });
  steps.push({ label: 'Decimal equivalent', value: `${simplifiedA} ÷ ${simplifiedB} = ${decimal}` });

  return {
    ratioA: simplifiedA,
    ratioB: simplifiedB,
    ratioString: `${simplifiedA}:${simplifiedB}`,
    gcdUsed: divisor,
    decimal,
    missingValue: 0,
    scaledA: 0,
    scaledB: 0,
    stepByStep: steps,
  };
}

/**
 * Solve a proportion: a:b = c:x → x = (b × c) / a
 */
function solveRatio(a: number, b: number, c: number, steps: StepDetail[]): Record<string, unknown> {
  steps.push({ label: 'Proportion', value: `${a}:${b} = ${c}:x` });

  if (a === 0) {
    steps.push({ label: 'Error', value: 'Cannot solve — first value (a) is zero, division by zero' });
    return {
      ratioA: 0,
      ratioB: 0,
      ratioString: '0:0',
      gcdUsed: 0,
      decimal: 0,
      missingValue: 0,
      scaledA: 0,
      scaledB: 0,
      stepByStep: steps,
    };
  }

  steps.push({ label: 'Cross-multiply', value: `a × x = b × c` });
  steps.push({ label: 'Substitute', value: `${a} × x = ${b} × ${c}` });
  steps.push({ label: 'Compute right side', value: `${a} × x = ${b * c}` });

  const missingValue = parseFloat(((b * c) / a).toFixed(6));
  steps.push({ label: 'Solve for x', value: `x = ${b * c} ÷ ${a} = ${missingValue}` });
  steps.push({ label: 'Verified proportion', value: `${a}:${b} = ${c}:${missingValue}` });

  return {
    ratioA: a,
    ratioB: b,
    ratioString: `${a}:${b}`,
    gcdUsed: 0,
    decimal: parseFloat((a / b).toFixed(6)),
    missingValue,
    scaledA: 0,
    scaledB: 0,
    stepByStep: steps,
  };
}

/**
 * Scale a ratio by multiplying both terms by a factor.
 */
function scaleRatio(a: number, b: number, factor: number, steps: StepDetail[]): Record<string, unknown> {
  steps.push({ label: 'Input ratio', value: `${a}:${b}` });
  steps.push({ label: 'Scale factor', value: `${factor}` });

  const scaledA = parseFloat((a * factor).toFixed(6));
  const scaledB = parseFloat((b * factor).toFixed(6));

  steps.push({ label: 'Scale first term', value: `${a} × ${factor} = ${scaledA}` });
  steps.push({ label: 'Scale second term', value: `${b} × ${factor} = ${scaledB}` });
  steps.push({ label: 'Scaled ratio', value: `${scaledA}:${scaledB}` });

  const decimal = b !== 0 ? parseFloat((a / b).toFixed(6)) : 0;

  return {
    ratioA: a,
    ratioB: b,
    ratioString: `${a}:${b}`,
    gcdUsed: 0,
    decimal,
    missingValue: 0,
    scaledA,
    scaledB,
    stepByStep: steps,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'ratio': calculateRatio,
};
