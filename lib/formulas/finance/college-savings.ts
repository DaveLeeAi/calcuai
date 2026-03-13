/**
 * College Savings Calculator
 *
 * Calculates the projected total cost of college, the future value of current
 * savings, the savings gap, and the monthly contribution needed to close it.
 *
 * Formulas:
 *   FV_cost = annualCost × yearsInCollege × (1 + inflationRate)^yearsUntilCollege
 *     (simplified: inflate the total sticker price to future dollars)
 *
 *   More precisely, total cost is the sum of each year's inflated tuition:
 *     totalCost = Σ annualCost × (1 + i)^(yearsUntil + k)  for k = 0..yearsInCollege-1
 *
 *   FV_savings = currentSavings × (1 + r/12)^(months)
 *
 *   savingsGap = totalCost - projectedSavings
 *     where projectedSavings = FV of current savings + FV of monthly contributions
 *
 *   Monthly savings needed (annuity payment):
 *     PMT = savingsGap × r_m / ((1 + r_m)^n - 1)
 *     where r_m = monthlyReturnRate, n = months until college
 *
 * Sources:
 *   College Board — "Trends in College Pricing and Student Aid" (2023)
 *   FINRA 529 Plan guidance
 *   Standard future value annuity formula (CFA Institute)
 */
export function calculateCollegeSavings(inputs: Record<string, unknown>): Record<string, unknown> {
  const childAge = Math.max(0, Number(inputs.childAge) || 0);
  const collegeStartAge = Math.max(1, Number(inputs.collegeStartAge) || 18);
  const annualCost = Math.max(0, Number(inputs.annualCost) || 0);
  const yearsInCollege = Math.max(1, Number(inputs.yearsInCollege) || 4);
  const currentSavings = Math.max(0, Number(inputs.currentSavings) || 0);
  const monthlyContribution = Math.max(0, Number(inputs.monthlyContribution) || 0);
  const annualReturn = (Number(inputs.annualReturn) || 0) / 100;
  const collegeInflation = (Number(inputs.collegeInflation) || 0) / 100;

  const yearsUntilCollege = Math.max(0, collegeStartAge - childAge);
  const monthsUntilCollege = yearsUntilCollege * 12;
  const monthlyReturn = annualReturn / 12;

  // ── Projected total cost: sum of each year's inflated annual cost ──
  let projectedTotalCost = 0;
  for (let k = 0; k < yearsInCollege; k++) {
    const yearOffset = yearsUntilCollege + k;
    projectedTotalCost += annualCost * Math.pow(1 + collegeInflation, yearOffset);
  }
  projectedTotalCost = parseFloat(projectedTotalCost.toFixed(2));

  // ── Future value of current savings ──
  let fvCurrentSavings: number;
  if (monthlyReturn === 0 || monthsUntilCollege === 0) {
    fvCurrentSavings = currentSavings;
  } else {
    fvCurrentSavings = currentSavings * Math.pow(1 + monthlyReturn, monthsUntilCollege);
  }

  // ── Future value of monthly contributions ──
  let fvContributions: number;
  if (monthlyReturn === 0) {
    fvContributions = monthlyContribution * monthsUntilCollege;
  } else if (monthsUntilCollege === 0) {
    fvContributions = 0;
  } else {
    const compoundFactor = Math.pow(1 + monthlyReturn, monthsUntilCollege);
    fvContributions = monthlyContribution * ((compoundFactor - 1) / monthlyReturn);
  }

  const projectedSavings = parseFloat((fvCurrentSavings + fvContributions).toFixed(2));

  // ── Savings gap ──
  const savingsGap = parseFloat(Math.max(0, projectedTotalCost - projectedSavings).toFixed(2));

  // ── Monthly savings needed to close the gap (if current plan is insufficient) ──
  let monthlySavingsNeeded: number;
  if (projectedTotalCost <= projectedSavings) {
    monthlySavingsNeeded = 0;
  } else if (monthsUntilCollege <= 0) {
    // No time left — need the entire gap now
    monthlySavingsNeeded = parseFloat((projectedTotalCost - currentSavings).toFixed(2));
    if (monthlySavingsNeeded < 0) monthlySavingsNeeded = 0;
  } else if (monthlyReturn === 0) {
    // Zero return: remaining gap after FV of current savings growth
    const remaining = projectedTotalCost - fvCurrentSavings;
    monthlySavingsNeeded = remaining > 0 ? parseFloat((remaining / monthsUntilCollege).toFixed(2)) : 0;
  } else {
    // PMT = remaining × r_m / ((1 + r_m)^n - 1)
    const remaining = projectedTotalCost - fvCurrentSavings;
    if (remaining <= 0) {
      monthlySavingsNeeded = 0;
    } else {
      const compoundFactor = Math.pow(1 + monthlyReturn, monthsUntilCollege);
      monthlySavingsNeeded = parseFloat((remaining * monthlyReturn / (compoundFactor - 1)).toFixed(2));
    }
  }

  // ── Summary value group ──
  const summary = [
    { label: 'Projected Total Cost', value: projectedTotalCost },
    { label: 'Projected Savings', value: projectedSavings },
    { label: 'Savings Gap', value: savingsGap },
    { label: 'Monthly Savings Needed', value: monthlySavingsNeeded },
    { label: 'Current Savings', value: currentSavings },
    { label: 'Years Until College', value: yearsUntilCollege },
  ];

  // ── Savings growth chart — yearly balance growth ──
  const savingsGrowthChart: { year: number; balance: number; contributions: number }[] = [];
  for (let y = 0; y <= yearsUntilCollege; y++) {
    const monthsElapsed = y * 12;
    let balance: number;
    if (monthlyReturn === 0) {
      balance = currentSavings + monthlyContribution * monthsElapsed;
    } else {
      const fvPrincipal = currentSavings * Math.pow(1 + monthlyReturn, monthsElapsed);
      let fvContrib: number;
      if (monthsElapsed === 0) {
        fvContrib = 0;
      } else {
        const cf = Math.pow(1 + monthlyReturn, monthsElapsed);
        fvContrib = monthlyContribution * ((cf - 1) / monthlyReturn);
      }
      balance = fvPrincipal + fvContrib;
    }
    const totalContrib = currentSavings + monthlyContribution * monthsElapsed;
    savingsGrowthChart.push({
      year: y,
      balance: parseFloat(balance.toFixed(2)),
      contributions: parseFloat(totalContrib.toFixed(2)),
    });
  }

  return {
    projectedTotalCost,
    projectedSavings,
    savingsGap,
    monthlySavingsNeeded,
    savingsGrowthChart,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'college-savings': calculateCollegeSavings,
};
