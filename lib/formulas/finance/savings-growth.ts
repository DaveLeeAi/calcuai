/**
 * Savings Growth Calculator
 *
 * Calculates the future value of regular savings deposits with compound interest,
 * including optional goal tracking.
 *
 * Formula:
 *   FV = P(1 + r/n)^(nt) + PMT × [((1 + r/n)^(nt) - 1) / (r/n)]
 *
 * Where:
 *   FV  = future value
 *   P   = initial deposit (principal)
 *   PMT = monthly deposit amount
 *   r   = annual interest rate (decimal)
 *   n   = compounding frequency per year (12 for monthly)
 *   t   = time in years
 *
 * When a savings goal is set, the calculator also determines how many months
 * it takes to reach that goal using iterative month-by-month simulation.
 *
 * Source: FDIC deposit insurance and savings account disclosures;
 *         Federal Reserve consumer education resources;
 *         Truth in Savings Act (Regulation DD) APY calculation standards.
 */
export function calculateSavingsGrowth(inputs: Record<string, unknown>): Record<string, unknown> {
  const initialDeposit = Number(inputs.initialDeposit) || 0;
  const monthlyDeposit = Number(inputs.monthlyDeposit) || 0;
  const annualRate = (Number(inputs.annualRate) || 0) / 100;
  const years = Number(inputs.years) || 0;
  const savingsGoal = Number(inputs.savingsGoal) || 0;

  const n = 12; // monthly compounding
  const ratePerPeriod = annualRate / n;
  const totalPeriods = n * years;

  // Calculate future value
  let futureValue: number;
  if (annualRate === 0) {
    futureValue = initialDeposit + monthlyDeposit * totalPeriods;
  } else {
    const compoundFactor = Math.pow(1 + ratePerPeriod, totalPeriods);
    const principalGrowth = initialDeposit * compoundFactor;
    const contributionGrowth = monthlyDeposit * ((compoundFactor - 1) / ratePerPeriod);
    futureValue = principalGrowth + contributionGrowth;
  }

  futureValue = parseFloat(futureValue.toFixed(2));

  const totalDeposits = parseFloat((initialDeposit + monthlyDeposit * 12 * years).toFixed(2));
  const totalInterest = parseFloat((futureValue - totalDeposits).toFixed(2));

  // Months to reach goal (if goal is set and achievable)
  let monthsToGoal: number | null = null;
  let monthsToGoalText = '';
  if (savingsGoal > 0) {
    if (initialDeposit >= savingsGoal) {
      monthsToGoal = 0;
      monthsToGoalText = 'Already reached';
    } else if (monthlyDeposit === 0 && annualRate === 0) {
      monthsToGoalText = 'Not reachable without deposits';
    } else {
      // Iterate month by month to find when goal is reached
      let balance = initialDeposit;
      let month = 0;
      const maxMonths = years * 12 * 2; // search up to 2x the time period
      while (balance < savingsGoal && month < maxMonths) {
        month++;
        if (annualRate === 0) {
          balance += monthlyDeposit;
        } else {
          balance = balance * (1 + ratePerPeriod) + monthlyDeposit;
        }
      }
      if (balance >= savingsGoal) {
        monthsToGoal = month;
        const goalYears = Math.floor(month / 12);
        const goalMonths = month % 12;
        if (goalYears > 0 && goalMonths > 0) {
          monthsToGoalText = `${goalYears} year${goalYears !== 1 ? 's' : ''}, ${goalMonths} month${goalMonths !== 1 ? 's' : ''}`;
        } else if (goalYears > 0) {
          monthsToGoalText = `${goalYears} year${goalYears !== 1 ? 's' : ''}`;
        } else {
          monthsToGoalText = `${goalMonths} month${goalMonths !== 1 ? 's' : ''}`;
        }
      } else {
        monthsToGoalText = `More than ${Math.floor(maxMonths / 12)} years`;
      }
    }
  }

  // Breakdown pie chart data
  const breakdown: { name: string; value: number }[] = [];
  if (initialDeposit > 0) {
    breakdown.push({ name: 'Initial Deposit', value: initialDeposit });
  }
  const periodicDeposits = parseFloat((monthlyDeposit * 12 * years).toFixed(2));
  if (periodicDeposits > 0) {
    breakdown.push({ name: 'Monthly Deposits', value: periodicDeposits });
  }
  if (totalInterest > 0) {
    breakdown.push({ name: 'Interest Earned', value: totalInterest });
  }

  // Growth over time chart data — one entry per year (plus year 0)
  const growthOverTime: { year: number; balance: number; deposits: number; interest: number }[] = [];
  for (let y = 0; y <= years; y++) {
    const periodsAtYear = n * y;
    let balanceAtYear: number;
    if (annualRate === 0) {
      balanceAtYear = initialDeposit + monthlyDeposit * periodsAtYear;
    } else {
      const compFactor = Math.pow(1 + ratePerPeriod, periodsAtYear);
      balanceAtYear = initialDeposit * compFactor + monthlyDeposit * ((compFactor - 1) / ratePerPeriod);
    }
    const depositsAtYear = initialDeposit + monthlyDeposit * 12 * y;
    const interestAtYear = balanceAtYear - depositsAtYear;

    growthOverTime.push({
      year: y,
      balance: parseFloat(balanceAtYear.toFixed(2)),
      deposits: parseFloat(depositsAtYear.toFixed(2)),
      interest: parseFloat(interestAtYear.toFixed(2)),
    });
  }

  // Summary value group
  const summary = [
    { label: 'Future Value', value: futureValue },
    { label: 'Total Deposits', value: totalDeposits },
    { label: 'Interest Earned', value: totalInterest },
  ];

  return {
    futureValue,
    totalDeposits,
    totalInterest,
    monthsToGoal,
    monthsToGoalText: savingsGoal > 0 ? monthsToGoalText : 'No goal set',
    summary,
    breakdown,
    growthOverTime,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'savings-growth': calculateSavingsGrowth,
};
