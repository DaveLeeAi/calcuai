/**
 * Debt Consolidation Calculator
 *
 * Compares your current debt situation (multiple debts at a weighted average rate
 * with a given monthly payment) against a single consolidation loan.
 *
 * Current path: iterates monthly at currentAvgRate until balance reaches zero
 * using the currentMonthlyPayment.
 *
 * Consolidation path: standard amortization formula:
 * M = P × [r(1+r)^n] / [(1+r)^n - 1]
 *
 * Source: Consumer Financial Protection Bureau (CFPB)
 */

export function calculateDebtConsolidation(inputs: Record<string, unknown>): Record<string, unknown> {
  const totalDebtBalance = Number(inputs.totalDebtBalance) || 0;
  const currentAvgRate = (Number(inputs.currentAvgRate) || 0) / 100;
  const currentMonthlyPayment = Number(inputs.currentMonthlyPayment) || 0;
  const newRate = (Number(inputs.newRate) || 0) / 100;
  const newTerm = Number(inputs.newTerm) || 0; // months

  if (totalDebtBalance <= 0 || newTerm <= 0) {
    return {
      newMonthlyPayment: 0,
      monthlySavings: 0,
      totalInterestSaved: 0,
      currentTotalInterest: 0,
      consolidationTotalInterest: 0,
      currentMonths: 0,
      monthsSaved: 0,
      summary: [],
      comparison: [],
    };
  }

  // ── Current debt path: iterate monthly until balance = 0 ──
  const currentMonthlyRate = currentAvgRate / 12;
  let currentBalance = totalDebtBalance;
  let currentTotalInterest = 0;
  let currentMonths = 0;
  const maxMonths = 600; // 50-year safety cap

  if (currentMonthlyPayment <= 0) {
    // Cannot pay off current debt with $0 payments
    currentMonths = maxMonths;
    currentTotalInterest = 0; // indeterminate, but set to 0 for safety
  } else {
    while (currentBalance > 0.005 && currentMonths < maxMonths) {
      currentMonths++;
      const interestCharge = currentBalance * currentMonthlyRate;
      currentTotalInterest += interestCharge;
      const payment = Math.min(currentMonthlyPayment, currentBalance + interestCharge);
      currentBalance = currentBalance + interestCharge - payment;
      if (currentBalance < 0) currentBalance = 0;

      // Minimum payment check: if payment barely covers interest, cap at max months
      if (currentMonthlyPayment <= interestCharge && currentMonths >= maxMonths) {
        break;
      }
    }
  }

  currentTotalInterest = parseFloat(currentTotalInterest.toFixed(2));
  const currentTotalPaid = parseFloat((totalDebtBalance + currentTotalInterest).toFixed(2));

  // ── Consolidation path: standard loan formula ──
  const newMonthlyRate = newRate / 12;
  let newMonthlyPayment: number;

  if (newMonthlyRate === 0) {
    newMonthlyPayment = totalDebtBalance / newTerm;
  } else {
    const factor = Math.pow(1 + newMonthlyRate, newTerm);
    newMonthlyPayment = totalDebtBalance * (newMonthlyRate * factor) / (factor - 1);
  }

  newMonthlyPayment = parseFloat(newMonthlyPayment.toFixed(2));
  const consolidationTotalPaid = parseFloat((newMonthlyPayment * newTerm).toFixed(2));
  const consolidationTotalInterest = parseFloat((consolidationTotalPaid - totalDebtBalance).toFixed(2));

  // ── Savings calculations ──
  const monthlySavings = parseFloat((currentMonthlyPayment - newMonthlyPayment).toFixed(2));
  const totalInterestSaved = parseFloat((currentTotalInterest - consolidationTotalInterest).toFixed(2));
  const monthsSaved = currentMonths - newTerm;

  // ── Summary value group ──
  const summary: { label: string; value: number | string }[] = [
    { label: 'Total Debt Balance', value: parseFloat(totalDebtBalance.toFixed(2)) },
    { label: 'Current Monthly Payment', value: parseFloat(currentMonthlyPayment.toFixed(2)) },
    { label: 'Current Avg Rate', value: `${(currentAvgRate * 100).toFixed(1)}%` },
    { label: 'Current Months to Payoff', value: currentMonths },
    { label: 'Current Total Interest', value: currentTotalInterest },
    { label: 'New Monthly Payment', value: newMonthlyPayment },
    { label: 'New Rate', value: `${(newRate * 100).toFixed(1)}%` },
    { label: 'New Term', value: `${newTerm} months` },
    { label: 'Consolidation Total Interest', value: consolidationTotalInterest },
    { label: 'Monthly Savings', value: monthlySavings },
    { label: 'Total Interest Saved', value: totalInterestSaved },
    { label: 'Months Saved', value: monthsSaved },
  ];

  // ── Comparison value group ──
  const comparison: { label: string; value: number | string }[] = [
    { label: 'Current Monthly Payment', value: parseFloat(currentMonthlyPayment.toFixed(2)) },
    { label: 'Consolidation Monthly Payment', value: newMonthlyPayment },
    { label: 'Current Months to Payoff', value: currentMonths },
    { label: 'Consolidation Term', value: newTerm },
    { label: 'Current Total Interest', value: currentTotalInterest },
    { label: 'Consolidation Total Interest', value: consolidationTotalInterest },
    { label: 'Current Total Paid', value: currentTotalPaid },
    { label: 'Consolidation Total Paid', value: consolidationTotalPaid },
  ];

  return {
    newMonthlyPayment,
    monthlySavings,
    totalInterestSaved,
    currentTotalInterest,
    consolidationTotalInterest,
    currentMonths,
    monthsSaved,
    currentTotalPaid,
    consolidationTotalPaid,
    summary,
    comparison,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'debt-consolidation': calculateDebtConsolidation,
};
