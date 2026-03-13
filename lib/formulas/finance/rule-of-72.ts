/**
 * Rule of 72 Calculator
 *
 * Estimates how long it takes for an investment to double using the Rule of 72,
 * and compares the approximation to the exact mathematical result.
 *
 * Rule of 72 (approximation):
 *   Years to Double ≈ 72 / rate
 *   Required Rate   ≈ 72 / years
 *
 * Exact formula:
 *   Years to Double = ln(2) / ln(1 + r)
 *   Required Rate   = 2^(1/years) - 1
 *
 * Where:
 *   r = annual interest rate (decimal)
 *
 * The Rule of 72 was popularized by Luca Pacioli in Summa de Arithmetica (1494)
 * and remains a standard mental-math shortcut in financial mathematics.
 *
 * Source: Luca Pacioli, Summa de Arithmetica (1494);
 *         CFA Institute financial mathematics references;
 *         Investopedia Rule of 72 methodology.
 */
export function calculateRuleOf72(inputs: Record<string, unknown>): Record<string, unknown> {
  const mode = String(inputs.mode || 'rate-to-years');
  const interestRate = Number(inputs.interestRate) || 0;
  const targetYears = Number(inputs.targetYears) || 10;

  let yearsToDouble: number;
  let exactYears: number;
  let requiredRate: number;
  let exactRate: number;

  if (mode === 'rate-to-years') {
    // Given rate, find years to double
    if (interestRate <= 0) {
      yearsToDouble = Infinity;
      exactYears = Infinity;
    } else {
      yearsToDouble = parseFloat((72 / interestRate).toFixed(1));
      exactYears = parseFloat((Math.log(2) / Math.log(1 + interestRate / 100)).toFixed(2));
    }
    requiredRate = 0;
    exactRate = 0;
  } else {
    // Given years, find required rate
    if (targetYears <= 0) {
      requiredRate = Infinity;
      exactRate = Infinity;
    } else {
      requiredRate = parseFloat((72 / targetYears).toFixed(2));
      exactRate = parseFloat(((Math.pow(2, 1 / targetYears) - 1) * 100).toFixed(2));
    }
    yearsToDouble = 0;
    exactYears = 0;
  }

  // Approximation error
  let approximationError: number;
  if (mode === 'rate-to-years') {
    if (exactYears === Infinity || exactYears === 0) {
      approximationError = 0;
    } else {
      approximationError = parseFloat((yearsToDouble - exactYears).toFixed(2));
    }
  } else {
    if (exactRate === Infinity || exactRate === 0) {
      approximationError = 0;
    } else {
      approximationError = parseFloat((requiredRate - exactRate).toFixed(2));
    }
  }

  // Summary value group
  const summary =
    mode === 'rate-to-years'
      ? [
          { label: 'Rule of 72 Estimate', value: yearsToDouble === Infinity ? 'Never' : `${yearsToDouble} years` },
          { label: 'Exact Calculation', value: exactYears === Infinity ? 'Never' : `${exactYears} years` },
          { label: 'Approximation Error', value: `${approximationError} years` },
          { label: 'Interest Rate', value: `${interestRate}%` },
        ]
      : [
          { label: 'Rule of 72 Estimate', value: `${requiredRate}%` },
          { label: 'Exact Calculation', value: `${exactRate}%` },
          { label: 'Approximation Error', value: `${approximationError}%` },
          { label: 'Target Years', value: `${targetYears} years` },
        ];

  return {
    yearsToDouble,
    exactYears,
    requiredRate,
    exactRate,
    approximationError,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'rule-of-72': calculateRuleOf72,
};
