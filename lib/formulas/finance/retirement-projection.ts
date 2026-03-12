export interface RetirementInput {
  currentAge: number;
  retirementAge: number;
  currentSavings: number;
  monthlyContribution: number;
  preRetirementReturn: number;     // As percentage (e.g. 7)
  postRetirementReturn: number;    // As percentage (e.g. 5)
  desiredAnnualIncome: number;
  inflationRate: number;           // As percentage (e.g. 3)
  lifeExpectancy: number;
}

export interface SavingsGrowthPoint {
  age: number;
  balance: number;
}

export interface YearByYearRow {
  age: number;
  yearStart: number;
  contributionOrWithdrawal: number;
  growth: number;
  yearEnd: number;
}

export interface RetirementOutput {
  retirementSavings: number;
  monthlyRetirementIncome: number;
  yearsMoneyLasts: number | string;
  retirementGap: number;
  summary: { label: string; value: number }[];
  savingsGrowth: SavingsGrowthPoint[];
  yearByYear: YearByYearRow[];
  breakdown: { name: string; value: number }[];
}

/**
 * Two-phase retirement projection model:
 *
 * Phase 1 — Accumulation (current age to retirement age):
 *   FV = currentSavings * (1 + r1)^n1 + monthlyContribution * [((1 + r1)^n1 - 1) / r1]
 *   Where r1 = preRetirementReturn / 12, n1 = yearsToRetirement * 12
 *
 * Phase 2 — Distribution (retirement age to life expectancy):
 *   Each year: withdraw inflation-adjusted income, grow remainder at postRetirementReturn
 *   annualWithdrawal = desiredAnnualIncome * (1 + inflation)^(year - retirementYear)
 *   balance = (balance + growth) - annualWithdrawal
 *
 * Sustainable monthly income calculated by solving for the level annuity payment
 * that exactly depletes the fund over the retirement horizon at the real rate of return.
 *
 * Source: Financial Planning Standards Board (FPSB)
 */
export function calculateRetirementProjection(inputs: Record<string, unknown>): Record<string, unknown> {
  const currentAge = inputs.currentAge != null ? Number(inputs.currentAge) : 30;
  const retirementAge = inputs.retirementAge != null ? Number(inputs.retirementAge) : 65;
  const currentSavings = inputs.currentSavings != null ? Number(inputs.currentSavings) : 0;
  const monthlyContribution = inputs.monthlyContribution != null ? Number(inputs.monthlyContribution) : 0;
  const preRetirementReturn = (inputs.preRetirementReturn != null ? Number(inputs.preRetirementReturn) : 7) / 100;
  const postRetirementReturn = (inputs.postRetirementReturn != null ? Number(inputs.postRetirementReturn) : 5) / 100;
  const desiredAnnualIncome = inputs.desiredAnnualIncome != null ? Number(inputs.desiredAnnualIncome) : 50000;
  const inflationRate = (inputs.inflationRate != null ? Number(inputs.inflationRate) : 3) / 100;
  const lifeExpectancy = inputs.lifeExpectancy != null ? Number(inputs.lifeExpectancy) : 90;

  const yearsToRetirement = Math.max(0, retirementAge - currentAge);
  const yearsInRetirement = Math.max(0, lifeExpectancy - retirementAge);
  const monthsToRetirement = yearsToRetirement * 12;

  // ─── Phase 1: Accumulation ───
  const monthlyPreReturn = preRetirementReturn / 12;
  let retirementSavings: number;
  let totalContributions: number;

  if (yearsToRetirement === 0) {
    // Already at or past retirement age
    retirementSavings = currentSavings;
    totalContributions = currentSavings;
  } else if (monthlyPreReturn === 0) {
    // Zero return: simple addition
    retirementSavings = currentSavings + monthlyContribution * monthsToRetirement;
    totalContributions = currentSavings + monthlyContribution * monthsToRetirement;
  } else {
    const compoundFactor = Math.pow(1 + monthlyPreReturn, monthsToRetirement);
    const savingsGrowth = currentSavings * compoundFactor;
    const contributionGrowth = monthlyContribution * ((compoundFactor - 1) / monthlyPreReturn);
    retirementSavings = savingsGrowth + contributionGrowth;
    totalContributions = currentSavings + monthlyContribution * monthsToRetirement;
  }

  const totalGrowthAccumulation = retirementSavings - totalContributions;

  // ─── Phase 2: Distribution ───
  // Track year-by-year drawdown
  let balance = retirementSavings;
  let moneyRunsOutAge = -1;
  const distributionData: { age: number; startBalance: number; withdrawal: number; growth: number; endBalance: number }[] = [];

  for (let year = 0; year < yearsInRetirement; year++) {
    const age = retirementAge + year;
    const startBalance = balance;

    if (balance <= 0) {
      if (moneyRunsOutAge === -1) {
        moneyRunsOutAge = age;
      }
      distributionData.push({
        age,
        startBalance: 0,
        withdrawal: 0,
        growth: 0,
        endBalance: 0,
      });
      continue;
    }

    const inflationMultiplier = Math.pow(1 + inflationRate, year);
    const annualWithdrawal = desiredAnnualIncome * inflationMultiplier;
    const growth = balance * postRetirementReturn;
    balance = balance + growth - annualWithdrawal;

    if (balance < 0) {
      if (moneyRunsOutAge === -1) {
        moneyRunsOutAge = age + 1;
      }
      balance = 0;
    }

    distributionData.push({
      age,
      startBalance,
      withdrawal: annualWithdrawal,
      growth,
      endBalance: Math.max(0, balance),
    });
  }

  // ─── Calculate years money lasts ───
  let yearsMoneyLasts: number | string;
  if (yearsInRetirement === 0) {
    yearsMoneyLasts = 0;
  } else if (moneyRunsOutAge === -1) {
    // Money lasts through life expectancy
    yearsMoneyLasts = 'Lifetime';
  } else {
    yearsMoneyLasts = moneyRunsOutAge - retirementAge;
  }

  // ─── Calculate retirement gap ───
  let retirementGap = 0;
  if (moneyRunsOutAge !== -1 && yearsInRetirement > 0) {
    // The gap is the annual shortfall: desired income minus what savings can support
    const remainingYears = lifeExpectancy - moneyRunsOutAge;
    const inflationAtGapStart = Math.pow(1 + inflationRate, moneyRunsOutAge - retirementAge);
    retirementGap = parseFloat((desiredAnnualIncome * inflationAtGapStart).toFixed(2));
    if (remainingYears <= 0) {
      retirementGap = 0;
    }
  }

  // ─── Calculate sustainable monthly income ───
  // Using the present value of annuity formula solved for payment
  // with real rate of return (adjusted for inflation)
  let monthlyRetirementIncome: number;
  if (yearsInRetirement === 0 || retirementSavings <= 0) {
    monthlyRetirementIncome = 0;
  } else {
    const realReturn = (1 + postRetirementReturn) / (1 + inflationRate) - 1;
    const monthlyRealReturn = realReturn / 12;
    const totalRetirementMonths = yearsInRetirement * 12;

    if (monthlyRealReturn === 0) {
      monthlyRetirementIncome = retirementSavings / totalRetirementMonths;
    } else {
      // PMT = PV * r / (1 - (1+r)^-n)
      const factor = Math.pow(1 + monthlyRealReturn, totalRetirementMonths);
      monthlyRetirementIncome = retirementSavings * (monthlyRealReturn * factor) / (factor - 1);
    }
  }

  // ─── Build savings growth chart data ───
  const savingsGrowthData: SavingsGrowthPoint[] = [];

  // Accumulation phase: compute balance at end of each year
  for (let age = currentAge; age <= retirementAge; age++) {
    const yearsElapsed = age - currentAge;
    const monthsElapsed = yearsElapsed * 12;

    let balanceAtAge: number;
    if (monthsElapsed === 0) {
      balanceAtAge = currentSavings;
    } else if (monthlyPreReturn === 0) {
      balanceAtAge = currentSavings + monthlyContribution * monthsElapsed;
    } else {
      const compoundFactor = Math.pow(1 + monthlyPreReturn, monthsElapsed);
      balanceAtAge = currentSavings * compoundFactor + monthlyContribution * ((compoundFactor - 1) / monthlyPreReturn);
    }
    savingsGrowthData.push({
      age,
      balance: parseFloat(balanceAtAge.toFixed(0)),
    });
  }

  // Distribution phase: add year-end balances from distribution data
  for (const row of distributionData) {
    // Only add if not already present (retirement age is added in accumulation)
    if (row.age > retirementAge) {
      savingsGrowthData.push({
        age: row.age,
        balance: parseFloat(row.endBalance.toFixed(0)),
      });
    }
  }
  // Add final age if distribution covers it
  if (yearsInRetirement > 0 && savingsGrowthData[savingsGrowthData.length - 1].age < lifeExpectancy) {
    savingsGrowthData.push({
      age: lifeExpectancy,
      balance: parseFloat(Math.max(0, balance).toFixed(0)),
    });
  }

  // ─── Build year-by-year table ───
  const yearByYear: YearByYearRow[] = [];

  // Accumulation years
  for (let year = 0; year < yearsToRetirement; year++) {
    const age = currentAge + year;
    const monthsStart = year * 12;
    const monthsEnd = (year + 1) * 12;

    let balanceStart: number;
    let balanceEnd: number;

    if (monthlyPreReturn === 0) {
      balanceStart = currentSavings + monthlyContribution * monthsStart;
      balanceEnd = currentSavings + monthlyContribution * monthsEnd;
    } else {
      const factorStart = Math.pow(1 + monthlyPreReturn, monthsStart);
      balanceStart = monthsStart === 0
        ? currentSavings
        : currentSavings * factorStart + monthlyContribution * ((factorStart - 1) / monthlyPreReturn);

      const factorEnd = Math.pow(1 + monthlyPreReturn, monthsEnd);
      balanceEnd = currentSavings * factorEnd + monthlyContribution * ((factorEnd - 1) / monthlyPreReturn);
    }

    const annualContribution = monthlyContribution * 12;
    const growthThisYear = balanceEnd - balanceStart - annualContribution;

    yearByYear.push({
      age,
      yearStart: parseFloat(balanceStart.toFixed(2)),
      contributionOrWithdrawal: parseFloat(annualContribution.toFixed(2)),
      growth: parseFloat(growthThisYear.toFixed(2)),
      yearEnd: parseFloat(balanceEnd.toFixed(2)),
    });
  }

  // Distribution years
  for (const row of distributionData) {
    yearByYear.push({
      age: row.age,
      yearStart: parseFloat(row.startBalance.toFixed(2)),
      contributionOrWithdrawal: parseFloat((-row.withdrawal).toFixed(2)),
      growth: parseFloat(row.growth.toFixed(2)),
      yearEnd: parseFloat(row.endBalance.toFixed(2)),
    });
  }

  // ─── Build summary value group ───
  const summary = [
    { label: `Retirement Savings at ${retirementAge}`, value: parseFloat(retirementSavings.toFixed(2)) },
    { label: 'Monthly Retirement Income', value: parseFloat(monthlyRetirementIncome.toFixed(2)) },
    { label: 'Years Funded', value: typeof yearsMoneyLasts === 'string' ? yearsInRetirement : yearsMoneyLasts },
    { label: 'Total Contributions', value: parseFloat(totalContributions.toFixed(2)) },
    { label: 'Total Growth', value: parseFloat(totalGrowthAccumulation.toFixed(2)) },
  ];

  // ─── Build breakdown pie chart ───
  const employerMatch = 0; // Placeholder for future employer match feature
  const personalContributions = monthlyContribution * monthsToRetirement;
  const breakdown = [
    { name: 'Your Contributions', value: parseFloat((currentSavings + personalContributions).toFixed(2)) },
    { name: 'Employer Match', value: employerMatch },
    { name: 'Investment Growth', value: parseFloat(Math.max(0, totalGrowthAccumulation).toFixed(2)) },
  ];

  return {
    retirementSavings: parseFloat(retirementSavings.toFixed(2)),
    monthlyRetirementIncome: parseFloat(monthlyRetirementIncome.toFixed(2)),
    yearsMoneyLasts,
    retirementGap,
    summary,
    savingsGrowth: savingsGrowthData,
    yearByYear,
    breakdown,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'retirement-projection': calculateRetirementProjection,
};
