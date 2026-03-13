/**
 * Credit Utilization Calculator
 *
 * Utilization Ratio = (Total Balances / Total Credit Limit) × 100
 *
 * Rating categories based on FICO scoring model:
 *   <10%  = Excellent
 *   10–29% = Good
 *   30–49% = Fair
 *   50–74% = Poor
 *   >=75% = Very Poor
 *
 * Source: FICO Score model; Experian, TransUnion, Equifax credit reporting standards
 */

function getRatingCategory(utilization: number): string {
  if (utilization < 10) return 'Excellent';
  if (utilization < 30) return 'Good';
  if (utilization < 50) return 'Fair';
  if (utilization < 75) return 'Poor';
  return 'Very Poor';
}

export function calculateCreditUtilization(inputs: Record<string, unknown>): Record<string, unknown> {
  const totalCreditLimit = Number(inputs.totalCreditLimit) || 0;
  const totalBalances = Number(inputs.totalBalances) || 0;
  const targetUtilization = Number(inputs.targetUtilization) || 30;

  if (totalCreditLimit <= 0) {
    return {
      utilizationRatio: 0,
      ratingCategory: 'N/A',
      availableCredit: 0,
      targetBalance: 0,
      amountToPayDown: 0,
      summary: [],
      utilizationBreakdown: [
        { name: 'Used', value: 0 },
        { name: 'Available', value: 0 },
      ],
    };
  }

  const utilizationRatio = parseFloat(((totalBalances / totalCreditLimit) * 100).toFixed(1));
  const ratingCategory = getRatingCategory(utilizationRatio);
  const availableCredit = parseFloat(Math.max(0, totalCreditLimit - totalBalances).toFixed(2));
  const targetBalance = parseFloat((totalCreditLimit * (targetUtilization / 100)).toFixed(2));
  const amountToPayDown = parseFloat(Math.max(0, totalBalances - targetBalance).toFixed(2));

  // Pie chart: used vs available (clamp available at 0 for over-limit scenarios)
  const usedForChart = Math.min(totalBalances, totalCreditLimit);
  const availableForChart = Math.max(0, totalCreditLimit - totalBalances);

  const utilizationBreakdown = [
    { name: 'Used', value: parseFloat(usedForChart.toFixed(2)) },
    { name: 'Available', value: parseFloat(availableForChart.toFixed(2)) },
  ];

  const summary: { label: string; value: number | string }[] = [
    { label: 'Total Credit Limit', value: parseFloat(totalCreditLimit.toFixed(2)) },
    { label: 'Total Balances', value: parseFloat(totalBalances.toFixed(2)) },
    { label: 'Utilization Ratio', value: `${utilizationRatio}%` },
    { label: 'Credit Impact Rating', value: ratingCategory },
    { label: 'Available Credit', value: availableCredit },
    { label: 'Target Utilization', value: `${targetUtilization}%` },
    { label: 'Target Balance', value: targetBalance },
    { label: 'Amount to Pay Down', value: amountToPayDown },
  ];

  return {
    utilizationRatio,
    ratingCategory,
    availableCredit,
    targetBalance,
    amountToPayDown,
    summary,
    utilizationBreakdown,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'credit-utilization': calculateCreditUtilization,
};
