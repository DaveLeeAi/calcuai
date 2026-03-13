/**
 * Emergency Fund Calculator
 *
 * Calculates the target emergency fund amount, current gap,
 * and time to reach the goal with regular monthly savings.
 *
 * Formula:
 *   Target = Monthly Expenses × Months of Coverage
 *   Gap = max(0, Target - Current Savings)
 *   Months to Goal = ceil(Gap / Monthly Savings Contribution)
 *   Percent Funded = min(100, (Current Savings / Target) × 100)
 *
 * Where:
 *   Monthly Expenses = essential monthly spending (housing, food, utilities, etc.)
 *   Months of Coverage = desired safety net duration (3–12 months)
 *   Current Savings = existing emergency fund balance
 *   Monthly Savings = amount saved each month toward the fund
 *
 * Source: Federal Reserve — Report on the Economic Well-Being of U.S. Households (2023);
 *         CFPB emergency savings guidelines.
 */

export function calculateEmergencyFund(inputs: Record<string, unknown>): Record<string, unknown> {
  const monthlyExpenses = Number(inputs.monthlyExpenses) || 0;
  const monthsOfCoverage = Number(inputs.monthsOfCoverage) || 6;
  const currentSavings = Number(inputs.currentSavings) || 0;
  const monthlySavings = Number(inputs.monthlySavingsContribution) || 0;

  const targetFund = parseFloat((monthlyExpenses * monthsOfCoverage).toFixed(2));
  const currentGap = parseFloat(Math.max(0, targetFund - currentSavings).toFixed(2));
  const percentFunded = targetFund > 0
    ? parseFloat(Math.min(100, (currentSavings / targetFund) * 100).toFixed(1))
    : 0;

  // Months to goal
  let monthsToGoal: number;
  if (currentGap <= 0) {
    monthsToGoal = 0;
  } else if (monthlySavings <= 0) {
    monthsToGoal = -1; // indicates not saving
  } else {
    monthsToGoal = Math.ceil(currentGap / monthlySavings);
  }

  // Savings progress projection
  const savingsProgress: { month: number; savings: number; target: number }[] = [];
  if (monthlySavings > 0 && currentGap > 0) {
    const projectionMonths = Math.min(monthsToGoal + 3, 600); // show a few months past goal
    for (let m = 0; m <= projectionMonths; m++) {
      const projected = Math.min(currentSavings + monthlySavings * m, targetFund);
      savingsProgress.push({
        month: m,
        savings: parseFloat(projected.toFixed(2)),
        target: targetFund,
      });
      if (projected >= targetFund) break;
    }
  } else if (currentGap <= 0) {
    // Already funded — show single point
    savingsProgress.push({
      month: 0,
      savings: parseFloat(currentSavings.toFixed(2)),
      target: targetFund,
    });
  }

  // Months-to-goal display value
  let monthsToGoalDisplay: string;
  if (monthsToGoal === 0) {
    monthsToGoalDisplay = 'Already funded';
  } else if (monthsToGoal === -1) {
    monthsToGoalDisplay = 'Not saving';
  } else {
    monthsToGoalDisplay = String(monthsToGoal);
  }

  const summary: { label: string; value: number | string }[] = [
    { label: 'Target Emergency Fund', value: targetFund },
    { label: 'Monthly Expenses', value: parseFloat(monthlyExpenses.toFixed(2)) },
    { label: 'Months of Coverage', value: monthsOfCoverage },
    { label: 'Current Savings', value: parseFloat(currentSavings.toFixed(2)) },
    { label: 'Amount Needed', value: currentGap },
    { label: 'Progress', value: `${percentFunded}%` },
    { label: 'Monthly Savings', value: parseFloat(monthlySavings.toFixed(2)) },
    { label: 'Months to Goal', value: monthsToGoalDisplay },
  ];

  return {
    targetFund,
    currentGap,
    monthsToGoal,
    percentFunded,
    summary,
    savingsProgress,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'emergency-fund': calculateEmergencyFund,
};
