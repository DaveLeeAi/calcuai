/**
 * Present Value Calculator
 *
 * Calculates the present value of a future sum and/or a series of periodic payments
 * (annuity) discounted at a given rate.
 *
 * Formulas:
 *   PV of lump sum:    PV = FV / (1 + r/n)^(n×t)
 *   PV of annuity:     PV = PMT × [(1 - (1 + r/n)^(-n×t)) / (r/n)]
 *   Total PV:          PV_total = PV_lumpsum + PV_annuity
 *
 * Where:
 *   PV  = present value (today's equivalent value)
 *   FV  = future value (the lump sum received in the future)
 *   PMT = periodic payment amount
 *   r   = annual discount/interest rate (decimal)
 *   n   = compounding periods per year
 *   t   = time in years
 *
 * Source: CFA Institute, Time Value of Money (TVM) framework;
 *         Corporate Finance Institute discounted cash flow methodology.
 */

export function calculatePresentValue(inputs: Record<string, unknown>): Record<string, unknown> {
  const futureValue = Number(inputs.futureValue) || 0;
  const periodicPayment = Number(inputs.periodicPayment) || 0;
  const annualRate = (Number(inputs.annualRate) || 0) / 100;
  const years = Number(inputs.years) || 0;
  const compoundingFrequency = parseInt(String(inputs.compoundingFrequency) || '1', 10);

  const n = compoundingFrequency;
  const ratePerPeriod = annualRate / n;
  const totalPeriods = n * years;

  // PV of lump sum: FV / (1 + r/n)^(nt)
  let pvLumpSum = 0;
  if (futureValue > 0 && totalPeriods > 0) {
    if (annualRate === 0) {
      pvLumpSum = futureValue; // no discounting at 0%
    } else {
      pvLumpSum = futureValue / Math.pow(1 + ratePerPeriod, totalPeriods);
    }
  } else if (futureValue > 0 && totalPeriods === 0) {
    pvLumpSum = futureValue;
  }

  // PV of annuity: PMT × [(1 - (1 + r/n)^(-nt)) / (r/n)]
  let pvAnnuity = 0;
  if (periodicPayment > 0 && totalPeriods > 0) {
    if (annualRate === 0) {
      pvAnnuity = periodicPayment * totalPeriods;
    } else {
      pvAnnuity = periodicPayment * ((1 - Math.pow(1 + ratePerPeriod, -totalPeriods)) / ratePerPeriod);
    }
  }

  const totalPresentValue = parseFloat((pvLumpSum + pvAnnuity).toFixed(2));
  pvLumpSum = parseFloat(pvLumpSum.toFixed(2));
  pvAnnuity = parseFloat(pvAnnuity.toFixed(2));

  // Total future payments received
  const totalFuturePayments = parseFloat((futureValue + periodicPayment * totalPeriods).toFixed(2));
  const totalDiscount = parseFloat((totalFuturePayments - totalPresentValue).toFixed(2));

  // Discount factor
  const discountFactor = totalPeriods > 0 && annualRate > 0
    ? parseFloat((1 / Math.pow(1 + ratePerPeriod, totalPeriods)).toFixed(6))
    : 1;

  // Summary
  const summary = [
    { label: 'Present Value', value: totalPresentValue },
    { label: 'PV of Lump Sum', value: pvLumpSum },
    { label: 'PV of Payments', value: pvAnnuity },
    { label: 'Total Discount', value: totalDiscount },
  ];

  // Breakdown pie chart
  const breakdown: { name: string; value: number }[] = [];
  if (pvLumpSum > 0) {
    breakdown.push({ name: 'PV of Lump Sum', value: pvLumpSum });
  }
  if (pvAnnuity > 0) {
    breakdown.push({ name: 'PV of Payments', value: pvAnnuity });
  }

  // PV over time — shows how PV changes as you move closer to the future date
  const pvOverTime: { year: number; presentValue: number }[] = [];
  for (let y = 0; y <= years; y++) {
    const remainingYears = years - y;
    const remainingPeriods = n * remainingYears;

    let pvAtYear = 0;
    // PV of remaining lump sum
    if (futureValue > 0) {
      if (annualRate === 0 || remainingPeriods === 0) {
        pvAtYear += futureValue;
      } else {
        pvAtYear += futureValue / Math.pow(1 + ratePerPeriod, remainingPeriods);
      }
    }
    // PV of remaining annuity payments
    if (periodicPayment > 0 && remainingPeriods > 0) {
      if (annualRate === 0) {
        pvAtYear += periodicPayment * remainingPeriods;
      } else {
        pvAtYear += periodicPayment * ((1 - Math.pow(1 + ratePerPeriod, -remainingPeriods)) / ratePerPeriod);
      }
    }

    pvOverTime.push({
      year: y,
      presentValue: parseFloat(pvAtYear.toFixed(2)),
    });
  }

  return {
    totalPresentValue,
    pvLumpSum,
    pvAnnuity,
    totalFuturePayments,
    totalDiscount,
    discountFactor,
    summary,
    breakdown,
    pvOverTime,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'present-value': calculatePresentValue,
};
