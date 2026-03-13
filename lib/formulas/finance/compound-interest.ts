export interface CompoundInterestInput {
  initialDeposit: number;
  monthlyContribution: number;
  annualRate: number;           // As percentage (e.g. 7)
  compoundingFrequency: string; // "1", "2", "4", "12", "365"
  years: number;
}

export interface GrowthRow {
  year: number;
  balance: number;
  contributions: number;
  interest: number;
}

export interface CompoundInterestOutput {
  futureValue: number;
  totalContributions: number;
  totalInterest: number;
  breakdown: { name: string; value: number }[];
  growthOverTime: GrowthRow[];
  summary: { label: string; value: number }[];
}

/**
 * Compound interest formula with periodic contributions:
 * A = P(1 + r/n)^(nt) + PMT × [((1 + r/n)^(nt) - 1) / (r/n)]
 *
 * Where:
 *   A   = future value (total amount at end)
 *   P   = principal (initial deposit)
 *   r   = annual interest rate (decimal)
 *   n   = compounding frequency per year
 *   t   = time in years
 *   PMT = contribution per compounding period
 *
 * When the user enters a monthly contribution but compounding is not monthly,
 * the monthly contribution is converted to a per-compounding-period amount:
 *   PMT = monthlyContribution × (12 / n)
 *
 * Source: Standard compound interest formula per the CFA Institute
 *         and SEC Investor Education resources.
 */
export function calculateCompoundInterest(inputs: Record<string, unknown>): Record<string, unknown> {
  const principal = Number(inputs.initialDeposit) || 0;
  const monthlyContribution = Number(inputs.monthlyContribution) || 0;
  const annualRate = (Number(inputs.annualRate) || 0) / 100;
  const compFreq = Math.max(1, parseInt(String(inputs.compoundingFrequency) || '12', 10) || 1);
  const years = Number(inputs.years) || 0;

  // Convert monthly contribution to per-compounding-period contribution
  const periodsPerYear = compFreq;
  const contributionPerPeriod = monthlyContribution * (12 / periodsPerYear);
  const totalPeriods = periodsPerYear * years;
  const ratePerPeriod = annualRate / periodsPerYear;

  // Calculate future value
  let futureValue: number;
  if (annualRate === 0) {
    // Simple addition when rate is zero
    futureValue = principal + contributionPerPeriod * totalPeriods;
  } else {
    const compoundFactor = Math.pow(1 + ratePerPeriod, totalPeriods);
    const principalGrowth = principal * compoundFactor;
    const contributionGrowth = contributionPerPeriod * ((compoundFactor - 1) / ratePerPeriod);
    futureValue = principalGrowth + contributionGrowth;
  }

  futureValue = parseFloat(futureValue.toFixed(2));

  // Total contributions = initial deposit + all periodic contributions
  const totalPeriodicContributions = monthlyContribution * 12 * years;
  const totalContributions = parseFloat((principal + totalPeriodicContributions).toFixed(2));
  const totalInterest = parseFloat((futureValue - totalContributions).toFixed(2));

  // Breakdown pie chart data
  const breakdown: { name: string; value: number }[] = [];
  if (principal > 0) {
    breakdown.push({ name: 'Initial Deposit', value: principal });
  }
  if (totalPeriodicContributions > 0) {
    breakdown.push({ name: 'Contributions', value: parseFloat(totalPeriodicContributions.toFixed(2)) });
  }
  if (totalInterest > 0) {
    breakdown.push({ name: 'Interest Earned', value: totalInterest });
  }

  // Growth over time chart data — one entry per year (plus year 0)
  const growthOverTime: GrowthRow[] = [];
  for (let y = 0; y <= years; y++) {
    const periodsAtYear = periodsPerYear * y;
    let balanceAtYear: number;
    if (annualRate === 0) {
      balanceAtYear = principal + contributionPerPeriod * periodsAtYear;
    } else {
      const compFactor = Math.pow(1 + ratePerPeriod, periodsAtYear);
      balanceAtYear = principal * compFactor + contributionPerPeriod * ((compFactor - 1) / ratePerPeriod);
    }
    const contribAtYear = principal + monthlyContribution * 12 * y;
    const interestAtYear = balanceAtYear - contribAtYear;

    growthOverTime.push({
      year: y,
      balance: parseFloat(balanceAtYear.toFixed(2)),
      contributions: parseFloat(contribAtYear.toFixed(2)),
      interest: parseFloat(interestAtYear.toFixed(2)),
    });
  }

  // ROI calculation
  const roi = totalContributions > 0
    ? parseFloat(((totalInterest / totalContributions) * 100).toFixed(2))
    : 0;

  // Summary value group
  const summary = [
    { label: 'Future Value', value: futureValue },
    { label: 'Total Contributions', value: totalContributions },
    { label: 'Total Interest Earned', value: totalInterest },
    { label: 'Return on Investment', value: roi },
  ];

  return {
    futureValue,
    totalContributions,
    totalInterest,
    breakdown,
    growthOverTime,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'compound-interest': calculateCompoundInterest,
};
