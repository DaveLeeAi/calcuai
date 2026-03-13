/**
 * Retirement Withdrawal Calculator
 *
 * Models how long a retirement portfolio lasts given a fixed (or inflation-adjusted)
 * annual withdrawal, expected investment return, and inflation rate.
 *
 * Core formula (year-by-year iteration):
 *   withdrawal_t = adjustForInflation ? annualWithdrawal * (1 + inflationRate)^t : annualWithdrawal
 *   growth_t = (startBalance_t - withdrawal_t) * expectedReturn
 *   endBalance_t = startBalance_t - withdrawal_t + growth_t
 *
 * The portfolio is depleted when endBalance <= 0.
 *
 * withdrawalRate = (annualWithdrawal / portfolioBalance) * 100
 *
 * Source: William Bengen, "Determining Withdrawal Rates Using Historical Data,"
 * Journal of Financial Planning (1994); Trinity Study
 */
export function calculateRetirementWithdrawal(inputs: Record<string, unknown>): Record<string, unknown> {
  const portfolioBalance = inputs.portfolioBalance != null ? Number(inputs.portfolioBalance) : 1000000;
  const annualWithdrawal = inputs.annualWithdrawal != null ? Number(inputs.annualWithdrawal) : 40000;
  const expectedReturn = (inputs.expectedReturn != null ? Number(inputs.expectedReturn) : 6) / 100;
  const inflationRate = (inputs.inflationRate != null ? Number(inputs.inflationRate) : 3) / 100;
  const adjustForInflation = inputs.adjustForInflation != null ? Boolean(inputs.adjustForInflation) : true;

  const MAX_YEARS = 100;

  // ─── Withdrawal Rate ───
  const withdrawalRate = portfolioBalance > 0
    ? parseFloat(((annualWithdrawal / portfolioBalance) * 100).toFixed(1))
    : 0;

  // ─── Year-by-Year Simulation ───
  let balance = portfolioBalance;
  let totalWithdrawn = 0;
  let yearsPortfolioLasts = MAX_YEARS;
  let depleted = false;

  const yearByYear: { year: number; startBalance: number; withdrawal: number; growth: number; endBalance: number }[] = [];
  const balanceOverTime: { year: number; balance: number }[] = [{ year: 0, balance: parseFloat(portfolioBalance.toFixed(2)) }];

  for (let year = 1; year <= MAX_YEARS; year++) {
    const startBalance = balance;

    if (startBalance <= 0) {
      if (!depleted) {
        yearsPortfolioLasts = year - 1;
        depleted = true;
      }
      break;
    }

    // Calculate this year's withdrawal
    const yearWithdrawal = adjustForInflation
      ? annualWithdrawal * Math.pow(1 + inflationRate, year - 1)
      : annualWithdrawal;

    // If withdrawal exceeds balance, only withdraw what's left
    const actualWithdrawal = Math.min(yearWithdrawal, startBalance);

    // Growth on remaining balance after withdrawal
    const remainingAfterWithdrawal = startBalance - actualWithdrawal;
    const growth = remainingAfterWithdrawal * expectedReturn;
    const endBalance = remainingAfterWithdrawal + growth;

    totalWithdrawn += actualWithdrawal;

    yearByYear.push({
      year,
      startBalance: parseFloat(startBalance.toFixed(2)),
      withdrawal: parseFloat(actualWithdrawal.toFixed(2)),
      growth: parseFloat(growth.toFixed(2)),
      endBalance: parseFloat(Math.max(0, endBalance).toFixed(2)),
    });

    balanceOverTime.push({
      year,
      balance: parseFloat(Math.max(0, endBalance).toFixed(2)),
    });

    if (endBalance <= 0) {
      yearsPortfolioLasts = year;
      depleted = true;
      break;
    }

    balance = endBalance;
  }

  // If portfolio survived all 100 years
  if (!depleted) {
    yearsPortfolioLasts = MAX_YEARS;
  }

  // ─── Summary ───
  const summary = [
    { label: 'Starting Portfolio', value: parseFloat(portfolioBalance.toFixed(2)) },
    { label: 'Annual Withdrawal', value: parseFloat(annualWithdrawal.toFixed(2)) },
    { label: 'Initial Withdrawal Rate', value: withdrawalRate },
    { label: 'Total Withdrawn', value: parseFloat(totalWithdrawn.toFixed(2)) },
    { label: 'Years Portfolio Lasts', value: yearsPortfolioLasts >= MAX_YEARS ? 100 : yearsPortfolioLasts },
  ];

  return {
    yearsPortfolioLasts: yearsPortfolioLasts >= MAX_YEARS ? 100 : parseFloat(yearsPortfolioLasts.toFixed(1)),
    totalWithdrawn: parseFloat(totalWithdrawn.toFixed(2)),
    withdrawalRate,
    summary,
    balanceOverTime,
    yearByYear,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'retirement-withdrawal': calculateRetirementWithdrawal,
};
