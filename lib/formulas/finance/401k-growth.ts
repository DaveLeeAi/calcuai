/**
 * 401(k) Retirement Growth Calculator
 *
 * Calculates projected 401(k) balance at retirement, incorporating:
 * - Employee contributions as a percentage of salary
 * - Employer matching contributions (up to a match limit)
 * - Annual salary increases
 * - Compound growth on all contributions
 * - 2025 IRS contribution limits ($23,500 under 50; $31,000 for 50+)
 *
 * Core formula (per year):
 *   Employee Contribution = min(salary * contributionPercent, IRS limit)
 *   Employer Match = min(salary * employerMatchLimit, Employee Contribution) * employerMatchPercent
 *   Year-End Balance = (Previous Balance + Employee + Employer) * (1 + annualReturn)
 *
 * The model iterates year by year, applying salary increases and compounding growth
 * on the accumulated balance plus new contributions (mid-year contribution assumption
 * simplified to end-of-year for clarity).
 *
 * Source: IRS Publication 560; IRS.gov 401(k) contribution limits (2025);
 *         Department of Labor Employee Benefits Security Administration.
 */
export function calculate401kGrowth(inputs: Record<string, unknown>): Record<string, unknown> {
  const currentAge = Number(inputs.currentAge) || 30;
  const retirementAge = Number(inputs.retirementAge) || 65;
  const currentBalance = Number(inputs.currentBalance) || 0;
  const annualSalary = Number(inputs.annualSalary) || 0;
  const contributionPercent = (Number(inputs.contributionPercent) || 0) / 100;
  const employerMatchPercent = (Number(inputs.employerMatchPercent) || 0) / 100;
  const employerMatchLimit = (Number(inputs.employerMatchLimit) || 0) / 100;
  const annualReturn = (Number(inputs.annualReturn) || 0) / 100;
  const annualSalaryIncrease = (Number(inputs.annualSalaryIncrease) || 0) / 100;

  const years = retirementAge - currentAge;

  if (years <= 0) {
    return {
      projectedBalance: parseFloat(currentBalance.toFixed(2)),
      totalContributions: 0,
      totalEmployerMatch: 0,
      totalGrowth: 0,
      summary: [
        { label: 'Projected Balance', value: parseFloat(currentBalance.toFixed(2)) },
        { label: 'Your Contributions', value: 0 },
        { label: 'Employer Match', value: 0 },
        { label: 'Investment Growth', value: 0 },
      ],
      breakdown: [],
      growthOverTime: [{ year: 0, age: currentAge, balance: parseFloat(currentBalance.toFixed(2)) }],
      yearByYear: [],
    };
  }

  // 2025 IRS 401(k) contribution limits
  const LIMIT_UNDER_50 = 23500;
  const LIMIT_50_PLUS = 31000;

  let balance = currentBalance;
  let salary = annualSalary;
  let totalContributions = 0;
  let totalEmployerMatch = 0;

  const yearByYear: {
    age: number;
    salary: number;
    contribution: number;
    match: number;
    growth: number;
    balance: number;
  }[] = [];

  const growthOverTime: {
    year: number;
    age: number;
    balance: number;
    contributions: number;
    employerMatch: number;
    growth: number;
  }[] = [
    {
      year: 0,
      age: currentAge,
      balance: parseFloat(currentBalance.toFixed(2)),
      contributions: 0,
      employerMatch: 0,
      growth: 0,
    },
  ];

  for (let y = 1; y <= years; y++) {
    const age = currentAge + y;
    const irsLimit = age >= 50 ? LIMIT_50_PLUS : LIMIT_UNDER_50;

    // Employee contribution: percentage of salary, capped at IRS limit
    const rawContribution = salary * contributionPercent;
    const employeeContribution = Math.min(rawContribution, irsLimit);

    // Employer match: employer matches a percentage of employee contribution,
    // but only on the first employerMatchLimit% of salary
    const matchableAmount = Math.min(employeeContribution, salary * employerMatchLimit);
    const employerMatch = matchableAmount * employerMatchPercent;

    totalContributions += employeeContribution;
    totalEmployerMatch += employerMatch;

    // Growth on balance + contributions (simplified: contributions added at start of year)
    const yearStartBalance = balance + employeeContribution + employerMatch;
    const growthAmount = yearStartBalance * annualReturn;
    balance = yearStartBalance + growthAmount;

    yearByYear.push({
      age,
      salary: parseFloat(salary.toFixed(2)),
      contribution: parseFloat(employeeContribution.toFixed(2)),
      match: parseFloat(employerMatch.toFixed(2)),
      growth: parseFloat(growthAmount.toFixed(2)),
      balance: parseFloat(balance.toFixed(2)),
    });

    growthOverTime.push({
      year: y,
      age,
      balance: parseFloat(balance.toFixed(2)),
      contributions: parseFloat((currentBalance + totalContributions).toFixed(2)),
      employerMatch: parseFloat(totalEmployerMatch.toFixed(2)),
      growth: parseFloat((balance - currentBalance - totalContributions - totalEmployerMatch).toFixed(2)),
    });

    // Apply salary increase for next year
    salary = salary * (1 + annualSalaryIncrease);
  }

  const projectedBalance = parseFloat(balance.toFixed(2));
  totalContributions = parseFloat(totalContributions.toFixed(2));
  totalEmployerMatch = parseFloat(totalEmployerMatch.toFixed(2));
  const totalGrowth = parseFloat((projectedBalance - currentBalance - totalContributions - totalEmployerMatch).toFixed(2));

  // Breakdown pie chart data
  const breakdown: { name: string; value: number }[] = [];
  if (currentBalance > 0) {
    breakdown.push({ name: 'Current Balance', value: currentBalance });
  }
  if (totalContributions > 0) {
    breakdown.push({ name: 'Your Contributions', value: totalContributions });
  }
  if (totalEmployerMatch > 0) {
    breakdown.push({ name: 'Employer Match', value: totalEmployerMatch });
  }
  if (totalGrowth > 0) {
    breakdown.push({ name: 'Investment Growth', value: totalGrowth });
  }

  // Summary value group
  const summary = [
    { label: 'Projected Balance', value: projectedBalance },
    { label: 'Your Contributions', value: totalContributions },
    { label: 'Employer Match', value: totalEmployerMatch },
    { label: 'Investment Growth', value: totalGrowth },
  ];

  return {
    projectedBalance,
    totalContributions,
    totalEmployerMatch,
    totalGrowth,
    summary,
    breakdown,
    growthOverTime,
    yearByYear,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  '401k-growth': calculate401kGrowth,
};
