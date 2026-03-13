/**
 * Rent Increase Calculator
 *
 * Compound growth model for annual rent increases:
 *   Future Rent = Current Rent × (1 + rate)^years
 *
 * Total rent paid = sum of (monthly rent for each year × 12)
 *   Year 1: currentRent × 12
 *   Year 2: currentRent × (1 + rate) × 12
 *   Year N: currentRent × (1 + rate)^(N-1) × 12
 *
 * Inflation-adjusted total = sum of each year's rent discounted:
 *   Year N cost / (1 + inflationRate)^(N-1)
 *
 * Source: Bureau of Labor Statistics (BLS) — CPI Rent of Primary Residence;
 *         Census Bureau — American Community Survey rental data
 */

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calculateRentIncrease(inputs: Record<string, unknown>): Record<string, unknown> {
  const currentRent = Math.max(0, Number(inputs.currentRent) || 0);
  const annualIncrease = (Number(inputs.annualIncrease) || 0) / 100;
  const years = Math.max(0, Math.floor(Number(inputs.years) || 0));
  const inflationRate = (Number(inputs.inflationRate) || 0) / 100;

  // Handle edge cases
  if (currentRent <= 0 || years <= 0) {
    return {
      futureRent: currentRent,
      totalRentPaid: 0,
      totalIncrease: 0,
      percentIncrease: 0,
      averageMonthlyRent: currentRent,
      realCostTotal: 0,
      yearByYear: [],
    };
  }

  // Future rent at end of the period
  const futureRent = round2(currentRent * Math.pow(1 + annualIncrease, years));

  // Total rent paid and year-by-year breakdown
  let totalRentPaid = 0;
  let realCostTotal = 0;
  const yearByYear: { label: string; value: number }[] = [];

  for (let y = 0; y < years; y++) {
    const yearRent = round2(currentRent * Math.pow(1 + annualIncrease, y));
    const yearTotal = round2(yearRent * 12);
    totalRentPaid += yearTotal;

    // Inflation-adjusted: discount by inflation rate
    const inflationDiscount = inflationRate > 0 ? Math.pow(1 + inflationRate, y) : 1;
    realCostTotal += round2(yearTotal / inflationDiscount);

    yearByYear.push({
      label: `Year ${y + 1}`,
      value: yearRent,
    });
  }

  totalRentPaid = round2(totalRentPaid);
  realCostTotal = round2(realCostTotal);

  const totalIncrease = round2(futureRent - currentRent);
  const percentIncrease = currentRent > 0
    ? round2(((futureRent / currentRent) - 1) * 100)
    : 0;
  const averageMonthlyRent = years > 0
    ? round2(totalRentPaid / (years * 12))
    : currentRent;

  return {
    futureRent,
    totalRentPaid,
    totalIncrease,
    percentIncrease,
    averageMonthlyRent,
    realCostTotal,
    yearByYear,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'rent-increase': calculateRentIncrease,
};
