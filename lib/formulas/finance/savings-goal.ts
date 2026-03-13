/**
 * Savings Goal Calculator
 *
 * Calculates the required monthly contribution to reach a savings target,
 * given current savings, a target amount, timeframe, expected return, and
 * compounding frequency.
 *
 * Formula:
 *   FV_current = currentSavings * (1 + r/n)^(n*t)
 *   Remaining  = targetAmount - FV_current
 *   PMT        = Remaining * (r_eff) / ((1 + r_eff)^(totalMonths) - 1)
 *
 * Where:
 *   r_eff = effective monthly rate = (1 + r/n)^(n/12) - 1
 *   r     = annual return rate (decimal)
 *   n     = compounding frequency per year
 *   t     = timeframe in years
 *
 * If Remaining <= 0, no additional savings are needed.
 *
 * Source: Standard future value annuity formula;
 *         FINRA Investor Education Foundation;
 *         CFA Institute financial mathematics.
 */
export function calculateSavingsGoal(inputs: Record<string, unknown>): Record<string, unknown> {
  const targetAmount = Number(inputs.targetAmount) || 0;
  const currentSavings = Number(inputs.currentSavings) || 0;
  const timeframeYears = Number(inputs.timeframeYears) || 0;
  const annualReturn = (Number(inputs.annualReturn) || 0) / 100;
  const compFreqStr = String(inputs.compoundingFrequency || '12');
  const compoundingFrequency = Math.max(1, parseInt(compFreqStr, 10) || 1);

  const totalMonths = Math.max(0, timeframeYears * 12);

  // Future value of current savings at end of timeframe
  let fvCurrentSavings: number;
  if (annualReturn === 0) {
    fvCurrentSavings = currentSavings;
  } else {
    const ratePerPeriod = annualReturn / compoundingFrequency;
    const totalPeriods = compoundingFrequency * timeframeYears;
    fvCurrentSavings = currentSavings * Math.pow(1 + ratePerPeriod, totalPeriods);
  }

  const remaining = targetAmount - fvCurrentSavings;

  // Effective monthly rate
  let effectiveMonthlyRate: number;
  if (annualReturn === 0) {
    effectiveMonthlyRate = 0;
  } else {
    effectiveMonthlyRate = Math.pow(1 + annualReturn / compoundingFrequency, compoundingFrequency / 12) - 1;
  }

  // Required monthly contribution
  let monthlyContribution: number;
  if (remaining <= 0) {
    // Current savings already grow to meet/exceed the target
    monthlyContribution = 0;
  } else if (totalMonths <= 0) {
    // No time: need all remaining right now
    monthlyContribution = remaining;
  } else if (effectiveMonthlyRate === 0) {
    // No return: simply divide remaining by months
    monthlyContribution = remaining / totalMonths;
  } else {
    // PMT = Remaining * r_eff / ((1 + r_eff)^totalMonths - 1)
    const compoundFactor = Math.pow(1 + effectiveMonthlyRate, totalMonths);
    const denominator = compoundFactor - 1;
    monthlyContribution = denominator === 0 ? remaining / totalMonths : remaining * effectiveMonthlyRate / denominator;
  }

  monthlyContribution = parseFloat(monthlyContribution.toFixed(2));

  const totalContributions = parseFloat((monthlyContribution * totalMonths).toFixed(2));
  const totalInterestEarned = parseFloat((targetAmount - currentSavings - totalContributions).toFixed(2));
  const finalBalance = parseFloat(targetAmount.toFixed(2));

  // Summary value group
  const summary = [
    { label: 'Monthly Savings Needed', value: monthlyContribution },
    { label: 'Total Contributions', value: totalContributions },
    { label: 'Interest Earned', value: totalInterestEarned },
    { label: 'Current Savings', value: currentSavings },
    { label: 'Savings Goal', value: targetAmount },
  ];

  // Growth over time chart data — one entry per year (plus year 0)
  const growthOverTime: { year: number; balance: number; contributions: number }[] = [];
  for (let y = 0; y <= timeframeYears; y++) {
    const monthsElapsed = y * 12;
    let balanceAtYear: number;

    if (annualReturn === 0) {
      balanceAtYear = currentSavings + monthlyContribution * monthsElapsed;
    } else {
      // FV of current savings at year y
      const periodsAtYear = compoundingFrequency * y;
      const ratePerPeriod = annualReturn / compoundingFrequency;
      const fvPrincipal = currentSavings * Math.pow(1 + ratePerPeriod, periodsAtYear);

      // FV of monthly contributions at year y using effective monthly rate
      let fvContrib: number;
      if (monthsElapsed === 0) {
        fvContrib = 0;
      } else {
        const compoundFactorMonths = Math.pow(1 + effectiveMonthlyRate, monthsElapsed);
        fvContrib = monthlyContribution * ((compoundFactorMonths - 1) / effectiveMonthlyRate);
      }

      balanceAtYear = fvPrincipal + fvContrib;
    }

    const contributionsAtYear = currentSavings + monthlyContribution * monthsElapsed;

    growthOverTime.push({
      year: y,
      balance: parseFloat(balanceAtYear.toFixed(2)),
      contributions: parseFloat(contributionsAtYear.toFixed(2)),
    });
  }

  return {
    monthlyContribution,
    totalContributions,
    totalInterestEarned,
    finalBalance,
    summary,
    growthOverTime,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'savings-goal': calculateSavingsGoal,
};
