/**
 * Certificate of Deposit (CD) Return Calculator
 *
 * Calculates the maturity value and interest earned on a certificate of deposit,
 * given a deposit amount, annual interest rate, term length, and compounding frequency.
 *
 * Formula:
 *   A = P × (1 + r/n)^(n × t)
 *
 * Where:
 *   A = maturity value (total amount at end of term)
 *   P = principal (initial deposit)
 *   r = annual interest rate (decimal)
 *   n = compounding frequency per year (365=daily, 12=monthly, 4=quarterly)
 *   t = term in years
 *
 * APY (Annual Percentage Yield):
 *   APY = (1 + r/n)^n - 1
 *
 * The APY represents the effective annual return accounting for compounding,
 * as required by the Truth in Savings Act (Regulation DD).
 *
 * Source: FDIC; Truth in Savings Act (12 CFR Part 1030 — Regulation DD);
 *         Federal Reserve Board APY calculation methodology.
 */
export function calculateCdReturn(inputs: Record<string, unknown>): Record<string, unknown> {
  const depositAmount = Number(inputs.depositAmount) || 0;
  const annualRate = (Number(inputs.annualRate) || 0) / 100;
  const termMonths = Number(inputs.termMonths) || 12;
  const compFreqStr = String(inputs.compoundingFrequency || '12');
  const compoundingFrequency = parseInt(compFreqStr, 10);

  const termYears = termMonths / 12;

  // Calculate total value at maturity
  let totalValue: number;
  if (annualRate === 0) {
    totalValue = depositAmount;
  } else {
    const ratePerPeriod = annualRate / compoundingFrequency;
    const totalPeriods = compoundingFrequency * termYears;
    totalValue = depositAmount * Math.pow(1 + ratePerPeriod, totalPeriods);
  }

  totalValue = parseFloat(totalValue.toFixed(2));
  const interestEarned = parseFloat((totalValue - depositAmount).toFixed(2));

  // Calculate APY
  let apy: number;
  if (annualRate === 0) {
    apy = 0;
  } else {
    apy = Math.pow(1 + annualRate / compoundingFrequency, compoundingFrequency) - 1;
  }
  apy = parseFloat((apy * 100).toFixed(2));

  // Summary value group
  const summary = [
    { label: 'Maturity Value', value: totalValue },
    { label: 'Interest Earned', value: interestEarned },
    { label: 'APY', value: apy },
    { label: 'Deposit Amount', value: depositAmount },
  ];

  return {
    totalValue,
    interestEarned,
    apy,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'cd-return': calculateCdReturn,
};
