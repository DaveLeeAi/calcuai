/**
 * Electricity Rate Comparison Calculator
 *
 * Formulas:
 *   Current annual cost = current rate × monthly kWh × 12
 *   Competitor annual cost = (competitor rate × monthly kWh + fixed fee) × 12
 *   Annual savings = current annual - competitor annual
 *   Total contract savings = annual savings × (contract months / 12)
 *   Breakeven month = fixed fee / ((current rate - competitor rate) × monthly kWh)
 *
 * Source: U.S. EIA — Retail Electricity Rate Comparison Methodology (2025).
 */

export function calculateElectricityRateComparison(inputs: Record<string, unknown>): Record<string, unknown> {
  const num = (v: unknown, d: number) => v !== undefined && v !== null && v !== '' ? Number(v) : d;
  const currentRate = Math.max(0, num(inputs.currentRate, 0.1724));
  const monthlyUsage = Math.max(0, num(inputs.monthlyUsage, 863));
  const competitorRate = Math.max(0, num(inputs.competitorRate, 0.14));
  const fixedFee = Math.max(0, num(inputs.fixedFee, 10));
  const contractLength = Math.max(1, num(inputs.contractLength, 12));

  const currentMonthlyCost = parseFloat((currentRate * monthlyUsage).toFixed(2));
  const currentAnnualCost = parseFloat((currentMonthlyCost * 12).toFixed(2));
  const competitorMonthlyCost = parseFloat((competitorRate * monthlyUsage + fixedFee).toFixed(2));
  const competitorAnnualCost = parseFloat((competitorMonthlyCost * 12).toFixed(2));
  const annualSavings = parseFloat((currentAnnualCost - competitorAnnualCost).toFixed(2));
  const totalContractSavings = parseFloat((annualSavings * (contractLength / 12)).toFixed(2));

  const rateDiff = currentRate - competitorRate;
  const monthlySavingsFromRate = rateDiff * monthlyUsage;
  const breakevenMonth = monthlySavingsFromRate > 0 && fixedFee > 0
    ? parseFloat((fixedFee / monthlySavingsFromRate).toFixed(1))
    : monthlySavingsFromRate > 0 ? 0 : -1;

  return {
    currentAnnualCost,
    competitorAnnualCost,
    annualSavings,
    totalContractSavings,
    breakevenMonth,
    currentMonthlyCost,
    competitorMonthlyCost,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'electricity-rate-comparison': calculateElectricityRateComparison,
};
