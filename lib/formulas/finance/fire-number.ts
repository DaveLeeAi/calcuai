/**
 * FIRE (Financial Independence, Retire Early) Calculator
 *
 * Calculates the portfolio size needed to sustain your annual expenses indefinitely
 * via a safe withdrawal rate, and projects how many years until you reach that number.
 *
 * Core formulas:
 *   fireNumber = annualExpenses / (safeWithdrawalRate / 100)
 *   annualSavings = annualIncome - annualExpenses
 *   savingsRate = (annualSavings / annualIncome) * 100
 *
 * Years to FIRE (iterative):
 *   portfolio_{t+1} = portfolio_t * (1 + annualReturn) + annualSavings
 *   Stop when portfolio >= fireNumber
 *
 * Closed-form approximation:
 *   yearsToFire = ln((fireNumber * r + s) / (current * r + s)) / ln(1 + r)
 *   where r = annualReturn, s = annualSavings
 *
 * Source: Vicki Robin, "Your Money or Your Life" (1992);
 * Trinity Study safe withdrawal rate research
 */
export function calculateFireNumber(inputs: Record<string, unknown>): Record<string, unknown> {
  const annualExpenses = inputs.annualExpenses != null ? Number(inputs.annualExpenses) : 40000;
  const annualIncome = inputs.annualIncome != null ? Number(inputs.annualIncome) : 80000;
  const currentSavings = inputs.currentSavings != null ? Number(inputs.currentSavings) : 100000;
  const annualReturn = (inputs.annualReturn != null ? Number(inputs.annualReturn) : 7) / 100;
  const safeWithdrawalRate = inputs.safeWithdrawalRate != null ? Number(inputs.safeWithdrawalRate) : 4;

  // ─── Core Calculations ───
  const fireNumber = safeWithdrawalRate > 0
    ? parseFloat((annualExpenses / (safeWithdrawalRate / 100)).toFixed(2))
    : -1; // 0% SWR means FIRE is unreachable

  const annualSavings = parseFloat((annualIncome - annualExpenses).toFixed(2));
  const monthlySavings = parseFloat((annualSavings / 12).toFixed(2));

  const savingsRate = annualIncome > 0
    ? parseFloat(((annualSavings / annualIncome) * 100).toFixed(1))
    : 0;

  const monthlyExpenses = parseFloat((annualExpenses / 12).toFixed(2));

  // ─── Years to FIRE (iterative) ───
  let yearsToFire: number;
  const MAX_YEARS = 100;

  if (currentSavings >= fireNumber && fireNumber > 0) {
    // Already financially independent
    yearsToFire = 0;
  } else if (annualSavings <= 0) {
    // Can never reach FIRE with zero or negative savings
    yearsToFire = -1; // signals impossible
  } else if (annualReturn === 0) {
    // Zero return: linear savings
    const needed = fireNumber - currentSavings;
    yearsToFire = needed > 0 ? Math.ceil(needed / annualSavings) : 0;
    if (yearsToFire > MAX_YEARS) yearsToFire = -1;
  } else {
    // Iterative approach — more reliable than closed-form for edge cases
    let portfolio = currentSavings;
    yearsToFire = -1;
    for (let year = 1; year <= MAX_YEARS; year++) {
      portfolio = portfolio * (1 + annualReturn) + annualSavings;
      if (portfolio >= fireNumber) {
        yearsToFire = year;
        break;
      }
    }
  }

  // ─── Progress Chart ───
  const chartYears = yearsToFire > 0 ? yearsToFire + 5 : (yearsToFire === 0 ? 10 : 50);
  const progressChart: { year: number; portfolio: number; fireTarget: number }[] = [];
  let portfolio = currentSavings;

  progressChart.push({
    year: 0,
    portfolio: parseFloat(currentSavings.toFixed(2)),
    fireTarget: fireNumber,
  });

  for (let year = 1; year <= chartYears; year++) {
    portfolio = portfolio * (1 + annualReturn) + annualSavings;
    progressChart.push({
      year,
      portfolio: parseFloat(portfolio.toFixed(2)),
      fireTarget: fireNumber,
    });
  }

  // ─── Summary ───
  const summary = [
    { label: 'FIRE Number', value: fireNumber },
    { label: 'Years to FIRE', value: yearsToFire >= 0 ? yearsToFire : 'Never' },
    { label: 'Annual Savings', value: annualSavings },
    { label: 'Monthly Savings', value: monthlySavings },
    { label: 'Savings Rate', value: savingsRate },
    { label: 'Monthly Expenses', value: monthlyExpenses },
  ];

  return {
    fireNumber,
    yearsToFire: yearsToFire >= 0 ? yearsToFire : -1,
    savingsRate,
    annualSavings,
    monthlySavings,
    monthlyExpenses,
    summary,
    progressChart,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'fire-number': calculateFireNumber,
};
