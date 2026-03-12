export interface InvestmentInput {
  initialInvestment: number;
  monthlyContribution: number;
  annualReturn: number;       // As percentage (e.g. 7)
  investmentPeriod: number;   // Years
  inflationRate: number;      // As percentage (e.g. 3)
}

export interface GrowthChartPoint {
  year: number;
  nominalBalance: number;
  realBalance: number;
  totalContributed: number;
}

export interface YearByYearRow {
  year: number;
  startBalance: number;
  contributions: number;
  earnings: number;
  endBalance: number;
}

export interface InvestmentOutput {
  futureValue: number;
  realValue: number;
  totalContributed: number;
  totalEarnings: number;
  summary: { label: string; value: number }[];
  breakdown: { name: string; value: number }[];
  growthOverTime: GrowthChartPoint[];
  yearByYear: YearByYearRow[];
}

/**
 * Future Value of a lump sum with regular contributions (monthly compounding):
 * FV = PV × (1 + r)^n + PMT × [((1 + r)^n - 1) / r]
 *
 * Where:
 *   PV  = initial investment (present value)
 *   PMT = monthly contribution
 *   r   = monthly interest rate (annual return / 12)
 *   n   = total number of months (years × 12)
 *
 * Inflation-adjusted (real) value:
 * Real FV = FV / (1 + inflation)^years
 *
 * Real rate of return:
 * realRate = ((1 + nominalRate) / (1 + inflationRate)) - 1
 *
 * Source: CFA Institute — Time Value of Money and Discounted Cash Flow Analysis
 */
export function calculateInvestmentGrowth(inputs: Record<string, unknown>): Record<string, unknown> {
  const initialInvestment = Number(inputs.initialInvestment) || 0;
  const monthlyContribution = Number(inputs.monthlyContribution) || 0;
  const annualReturn = (Number(inputs.annualReturn) ?? 7) / 100;
  const investmentPeriod = Number(inputs.investmentPeriod) || 20;
  const inflationRate = (Number(inputs.inflationRate) ?? 3) / 100;

  const monthlyRate = annualReturn / 12;
  const totalMonths = investmentPeriod * 12;

  // Calculate future value with monthly compounding
  let futureValue: number;
  if (monthlyRate === 0) {
    futureValue = initialInvestment + monthlyContribution * totalMonths;
  } else {
    const compoundFactor = Math.pow(1 + monthlyRate, totalMonths);
    const lumpSumFV = initialInvestment * compoundFactor;
    const annuityFV = monthlyContribution * ((compoundFactor - 1) / monthlyRate);
    futureValue = lumpSumFV + annuityFV;
  }

  // Inflation-adjusted (real) value
  const inflationFactor = Math.pow(1 + inflationRate, investmentPeriod);
  const realValue = futureValue / inflationFactor;

  // Total contributed
  const totalContributed = initialInvestment + monthlyContribution * totalMonths;

  // Total earnings
  const totalEarnings = futureValue - totalContributed;

  // Real rate of return (annualized)
  const realRateOfReturn = ((1 + annualReturn) / (1 + inflationRate)) - 1;

  // Summary value-group
  const summary = [
    { label: 'Future Value', value: parseFloat(futureValue.toFixed(2)) },
    { label: 'Inflation-Adjusted Value', value: parseFloat(realValue.toFixed(2)) },
    { label: 'Total Contributed', value: parseFloat(totalContributed.toFixed(2)) },
    { label: 'Investment Earnings', value: parseFloat(totalEarnings.toFixed(2)) },
    { label: 'Real Rate of Return', value: parseFloat((realRateOfReturn * 100).toFixed(2)) },
  ];

  // Breakdown for pie chart
  const totalMonthlyContributions = monthlyContribution * totalMonths;
  const breakdown = [
    { name: 'Initial Investment', value: parseFloat(initialInvestment.toFixed(2)) },
    { name: 'Monthly Contributions', value: parseFloat(totalMonthlyContributions.toFixed(2)) },
    { name: 'Investment Earnings', value: parseFloat(totalEarnings.toFixed(2)) },
  ];

  // Growth over time — year-by-year chart data
  const growthOverTime: GrowthChartPoint[] = [];
  for (let year = 0; year <= investmentPeriod; year++) {
    const months = year * 12;
    let nominalBalance: number;
    if (monthlyRate === 0) {
      nominalBalance = initialInvestment + monthlyContribution * months;
    } else {
      const cf = Math.pow(1 + monthlyRate, months);
      nominalBalance = initialInvestment * cf + monthlyContribution * ((cf - 1) / monthlyRate);
    }
    const yearInflationFactor = Math.pow(1 + inflationRate, year);
    const realBalance = nominalBalance / yearInflationFactor;
    const contributed = initialInvestment + monthlyContribution * months;

    growthOverTime.push({
      year,
      nominalBalance: parseFloat(nominalBalance.toFixed(2)),
      realBalance: parseFloat(realBalance.toFixed(2)),
      totalContributed: parseFloat(contributed.toFixed(2)),
    });
  }

  // Year-by-year table
  const yearByYear: YearByYearRow[] = [];
  let runningBalance = initialInvestment;

  for (let year = 1; year <= investmentPeriod; year++) {
    const startBalance = runningBalance;
    const yearContributions = monthlyContribution * 12;

    // Calculate end balance for this year using monthly compounding
    let endBalance: number;
    if (monthlyRate === 0) {
      endBalance = startBalance + yearContributions;
    } else {
      // Compound the start balance for 12 months and add monthly contributions
      let balance = startBalance;
      for (let month = 1; month <= 12; month++) {
        balance = balance * (1 + monthlyRate) + monthlyContribution;
      }
      endBalance = balance;
    }

    const earnings = endBalance - startBalance - yearContributions;

    yearByYear.push({
      year,
      startBalance: parseFloat(startBalance.toFixed(2)),
      contributions: parseFloat(yearContributions.toFixed(2)),
      earnings: parseFloat(earnings.toFixed(2)),
      endBalance: parseFloat(endBalance.toFixed(2)),
    });

    runningBalance = endBalance;
  }

  return {
    futureValue: parseFloat(futureValue.toFixed(2)),
    realValue: parseFloat(realValue.toFixed(2)),
    totalContributed: parseFloat(totalContributed.toFixed(2)),
    totalEarnings: parseFloat(totalEarnings.toFixed(2)),
    summary,
    breakdown,
    growthOverTime,
    yearByYear,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'investment-growth': calculateInvestmentGrowth,
};
