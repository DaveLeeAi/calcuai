/**
 * Future Value Calculator
 *
 * Calculates the future value of a present sum and/or periodic payments
 * with compound interest.
 *
 * Formulas:
 *   FV of lump sum:    FV = PV × (1 + r/n)^(n×t)
 *   FV of annuity:     FV = PMT × [((1 + r/n)^(n×t) - 1) / (r/n)]
 *   Total FV:          FV_total = FV_lumpsum + FV_annuity
 *
 * Where:
 *   FV  = future value
 *   PV  = present value (initial investment)
 *   PMT = periodic contribution per compounding period
 *   r   = annual interest rate (decimal)
 *   n   = compounding periods per year
 *   t   = time in years
 *
 * Source: CFA Institute, Time Value of Money (TVM) framework;
 *         SEC Investor Education resources on compound growth.
 */

export function calculateFutureValue(inputs: Record<string, unknown>): Record<string, unknown> {
  const presentValue = Number(inputs.presentValue) || 0;
  const periodicPayment = Number(inputs.periodicPayment) || 0;
  const annualRate = (Number(inputs.annualRate) || 0) / 100;
  const years = Number(inputs.years) || 0;
  const compoundingFrequency = parseInt(String(inputs.compoundingFrequency) || '1', 10);

  const n = compoundingFrequency;
  const ratePerPeriod = annualRate / n;
  const totalPeriods = n * years;

  // FV of lump sum: PV × (1 + r/n)^(nt)
  let fvLumpSum = 0;
  if (presentValue > 0) {
    if (annualRate === 0 || totalPeriods === 0) {
      fvLumpSum = presentValue;
    } else {
      fvLumpSum = presentValue * Math.pow(1 + ratePerPeriod, totalPeriods);
    }
  }

  // FV of annuity: PMT × [((1 + r/n)^(nt) - 1) / (r/n)]
  let fvAnnuity = 0;
  if (periodicPayment > 0 && totalPeriods > 0) {
    if (annualRate === 0) {
      fvAnnuity = periodicPayment * totalPeriods;
    } else {
      fvAnnuity = periodicPayment * ((Math.pow(1 + ratePerPeriod, totalPeriods) - 1) / ratePerPeriod);
    }
  }

  const totalFutureValue = parseFloat((fvLumpSum + fvAnnuity).toFixed(2));
  fvLumpSum = parseFloat(fvLumpSum.toFixed(2));
  fvAnnuity = parseFloat(fvAnnuity.toFixed(2));

  // Total contributions
  const totalContributions = parseFloat((presentValue + periodicPayment * totalPeriods).toFixed(2));
  const totalInterest = parseFloat((totalFutureValue - totalContributions).toFixed(2));

  // Growth multiplier
  const growthMultiplier = totalContributions > 0
    ? parseFloat((totalFutureValue / totalContributions).toFixed(4))
    : 0;

  // Summary
  const summary = [
    { label: 'Future Value', value: totalFutureValue },
    { label: 'FV of Initial Investment', value: fvLumpSum },
    { label: 'FV of Contributions', value: fvAnnuity },
    { label: 'Total Interest Earned', value: totalInterest },
  ];

  // Breakdown pie chart
  const breakdown: { name: string; value: number }[] = [];
  if (presentValue > 0) {
    breakdown.push({ name: 'Initial Investment', value: presentValue });
  }
  const totalPeriodicContribs = parseFloat((periodicPayment * totalPeriods).toFixed(2));
  if (totalPeriodicContribs > 0) {
    breakdown.push({ name: 'Contributions', value: totalPeriodicContribs });
  }
  if (totalInterest > 0) {
    breakdown.push({ name: 'Interest Earned', value: totalInterest });
  }

  // Growth over time — one entry per year (plus year 0)
  const growthOverTime: { year: number; balance: number; contributions: number; interest: number }[] = [];
  for (let y = 0; y <= years; y++) {
    const periodsAtYear = n * y;
    let balanceAtYear = 0;

    // FV of lump sum at this point
    if (presentValue > 0) {
      if (annualRate === 0 || periodsAtYear === 0) {
        balanceAtYear += presentValue;
      } else {
        balanceAtYear += presentValue * Math.pow(1 + ratePerPeriod, periodsAtYear);
      }
    }

    // FV of contributions at this point
    if (periodicPayment > 0 && periodsAtYear > 0) {
      if (annualRate === 0) {
        balanceAtYear += periodicPayment * periodsAtYear;
      } else {
        balanceAtYear += periodicPayment * ((Math.pow(1 + ratePerPeriod, periodsAtYear) - 1) / ratePerPeriod);
      }
    }

    const contribsAtYear = presentValue + periodicPayment * n * y;
    const interestAtYear = balanceAtYear - contribsAtYear;

    growthOverTime.push({
      year: y,
      balance: parseFloat(balanceAtYear.toFixed(2)),
      contributions: parseFloat(contribsAtYear.toFixed(2)),
      interest: parseFloat(interestAtYear.toFixed(2)),
    });
  }

  return {
    totalFutureValue,
    fvLumpSum,
    fvAnnuity,
    totalContributions,
    totalInterest,
    growthMultiplier,
    summary,
    breakdown,
    growthOverTime,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'future-value': calculateFutureValue,
};
