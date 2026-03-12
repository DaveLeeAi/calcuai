/**
 * Simple Interest Calculator
 *
 * Calculates interest earned using the simple interest formula,
 * where interest is computed only on the original principal (no compounding).
 *
 * Formula:
 *   I = P × r × t
 *   A = P + I = P(1 + r × t)
 *
 * Where:
 *   I = interest earned (dollars)
 *   A = total amount (principal + interest)
 *   P = principal (initial amount)
 *   r = annual interest rate (decimal)
 *   t = time in years
 *
 * Source: Standard simple interest formula per the Consumer Financial
 *         Protection Bureau (CFPB) and Truth in Lending Act (Regulation Z).
 */

export interface SimpleInterestInput {
  principal: number;
  annualRate: number; // percentage, e.g. 5 for 5%
  years: number;
  months?: number; // additional months beyond full years
}

export interface SimpleInterestOutput {
  totalInterest: number;
  totalAmount: number;
  principal: number;
  effectiveTime: number; // total time in years (including months)
  monthlyInterest: number;
  dailyInterest: number;
  summary: { label: string; value: number }[];
  growthOverTime: { year: number; balance: number; interest: number }[];
  breakdown: { name: string; value: number }[];
}

export function calculateSimpleInterest(inputs: Record<string, unknown>): Record<string, unknown> {
  const principal = Number(inputs.principal) || 0;
  const annualRate = (Number(inputs.annualRate) || 0) / 100;
  const years = Number(inputs.years) || 0;
  const additionalMonths = Number(inputs.months) || 0;

  // Total time in years (years + fractional months)
  const effectiveTime = years + additionalMonths / 12;

  // Core formula: I = P × r × t
  const totalInterest = parseFloat((principal * annualRate * effectiveTime).toFixed(2));
  const totalAmount = parseFloat((principal + totalInterest).toFixed(2));

  // Derived values
  const monthlyInterest = annualRate > 0
    ? parseFloat((principal * annualRate / 12).toFixed(2))
    : 0;
  const dailyInterest = annualRate > 0
    ? parseFloat((principal * annualRate / 365).toFixed(2))
    : 0;

  // Summary value group
  const summary = [
    { label: 'Total Amount', value: totalAmount },
    { label: 'Principal', value: principal },
    { label: 'Total Interest', value: totalInterest },
    { label: 'Monthly Interest', value: monthlyInterest },
  ];

  // Growth over time — one entry per year (plus year 0)
  const totalYearsCeil = Math.ceil(effectiveTime);
  const growthOverTime: { year: number; balance: number; interest: number }[] = [];
  for (let y = 0; y <= totalYearsCeil; y++) {
    const t = Math.min(y, effectiveTime);
    const interestAtYear = parseFloat((principal * annualRate * t).toFixed(2));
    const balanceAtYear = parseFloat((principal + interestAtYear).toFixed(2));
    growthOverTime.push({
      year: y,
      balance: balanceAtYear,
      interest: interestAtYear,
    });
  }

  // Breakdown pie chart
  const breakdown: { name: string; value: number }[] = [];
  if (principal > 0) {
    breakdown.push({ name: 'Principal', value: principal });
  }
  if (totalInterest > 0) {
    breakdown.push({ name: 'Interest Earned', value: totalInterest });
  }

  return {
    totalInterest,
    totalAmount,
    principal,
    effectiveTime: parseFloat(effectiveTime.toFixed(4)),
    monthlyInterest,
    dailyInterest,
    summary,
    growthOverTime,
    breakdown,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'simple-interest': calculateSimpleInterest,
};
