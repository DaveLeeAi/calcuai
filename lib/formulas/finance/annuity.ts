/**
 * Annuity Calculator
 *
 * Calculates annuity payment amounts, present value, or future value
 * for ordinary annuities and annuities due.
 *
 * Modes:
 *   1. Payment from PV:  PMT = PV × [r / (1 - (1+r)^-n)]
 *   2. Payment from FV:  PMT = FV × [r / ((1+r)^n - 1)]
 *   3. PV from PMT:      PV  = PMT × [(1 - (1+r)^-n) / r]
 *   4. FV from PMT:      FV  = PMT × [((1+r)^n - 1) / r]
 *
 * For annuity due (payments at start of period):
 *   Multiply result by (1 + r)
 *
 * Where:
 *   PMT = periodic payment amount
 *   PV  = present value of the annuity
 *   FV  = future value of the annuity
 *   r   = interest rate per period
 *   n   = total number of payment periods
 *
 * Source: CFA Institute, Annuity Mathematics;
 *         Actuarial Standards Board, present value of annuity calculations.
 */

type AnnuityMode = 'pv-to-payment' | 'fv-to-payment' | 'payment-to-pv' | 'payment-to-fv';
type AnnuityTiming = 'ordinary' | 'due';

export function calculateAnnuity(inputs: Record<string, unknown>): Record<string, unknown> {
  const mode = (String(inputs.mode) || 'pv-to-payment') as AnnuityMode;
  const timing = (String(inputs.timing) || 'ordinary') as AnnuityTiming;
  const annualRate = (Number(inputs.annualRate) || 0) / 100;
  const years = Number(inputs.years) || 0;
  const paymentsPerYear = parseInt(String(inputs.paymentsPerYear) || '12', 10);

  const ratePerPeriod = annualRate / paymentsPerYear;
  const totalPeriods = paymentsPerYear * years;

  // Input values for each mode
  const presentValue = Number(inputs.presentValue) || 0;
  const futureValue = Number(inputs.futureValue) || 0;
  const paymentAmount = Number(inputs.paymentAmount) || 0;

  let payment = 0;
  let pv = 0;
  let fv = 0;

  if (totalPeriods <= 0) {
    return {
      payment: 0,
      presentValue: presentValue || 0,
      futureValue: futureValue || 0,
      totalPayments: 0,
      totalInterest: 0,
      summary: [],
      paymentSchedule: [],
      balanceOverTime: [],
      breakdown: [],
    };
  }

  switch (mode) {
    case 'pv-to-payment': {
      // PMT = PV × [r / (1 - (1+r)^-n)]
      pv = presentValue;
      if (annualRate === 0) {
        payment = pv / totalPeriods;
      } else {
        payment = pv * (ratePerPeriod / (1 - Math.pow(1 + ratePerPeriod, -totalPeriods)));
      }
      if (timing === 'due') {
        payment = payment / (1 + ratePerPeriod);
      }
      fv = 0;
      break;
    }
    case 'fv-to-payment': {
      // PMT = FV × [r / ((1+r)^n - 1)]
      fv = futureValue;
      if (annualRate === 0) {
        payment = fv / totalPeriods;
      } else {
        payment = fv * (ratePerPeriod / (Math.pow(1 + ratePerPeriod, totalPeriods) - 1));
      }
      if (timing === 'due') {
        payment = payment / (1 + ratePerPeriod);
      }
      pv = 0;
      break;
    }
    case 'payment-to-pv': {
      // PV = PMT × [(1 - (1+r)^-n) / r]
      payment = paymentAmount;
      if (annualRate === 0) {
        pv = payment * totalPeriods;
      } else {
        pv = payment * ((1 - Math.pow(1 + ratePerPeriod, -totalPeriods)) / ratePerPeriod);
      }
      if (timing === 'due') {
        pv = pv * (1 + ratePerPeriod);
      }
      fv = 0;
      break;
    }
    case 'payment-to-fv': {
      // FV = PMT × [((1+r)^n - 1) / r]
      payment = paymentAmount;
      if (annualRate === 0) {
        fv = payment * totalPeriods;
      } else {
        fv = payment * ((Math.pow(1 + ratePerPeriod, totalPeriods) - 1) / ratePerPeriod);
      }
      if (timing === 'due') {
        fv = fv * (1 + ratePerPeriod);
      }
      pv = 0;
      break;
    }
  }

  payment = parseFloat(payment.toFixed(2));
  pv = parseFloat(pv.toFixed(2));
  fv = parseFloat(fv.toFixed(2));

  const totalPayments = parseFloat((payment * totalPeriods).toFixed(2));

  // Total interest depends on mode
  let totalInterest = 0;
  if (mode === 'pv-to-payment') {
    totalInterest = parseFloat((totalPayments - pv).toFixed(2));
  } else if (mode === 'fv-to-payment') {
    totalInterest = parseFloat((fv - totalPayments).toFixed(2));
  } else if (mode === 'payment-to-pv') {
    totalInterest = parseFloat((totalPayments - pv).toFixed(2));
  } else if (mode === 'payment-to-fv') {
    totalInterest = parseFloat((fv - totalPayments).toFixed(2));
  }

  // Summary
  const summary: { label: string; value: number | string }[] = [
    { label: 'Payment Amount', value: payment },
    { label: 'Present Value', value: pv },
    { label: 'Future Value', value: fv },
    { label: 'Total Payments', value: totalPayments },
    { label: 'Total Interest', value: totalInterest },
    { label: 'Annuity Type', value: timing === 'due' ? 'Annuity Due' : 'Ordinary Annuity' },
  ];

  // Breakdown
  const breakdown: { name: string; value: number }[] = [];
  if (mode === 'pv-to-payment' || mode === 'payment-to-pv') {
    // Loan-like: breakdown of total payments into principal and interest
    if (pv > 0) breakdown.push({ name: 'Principal', value: pv });
    if (totalInterest > 0) breakdown.push({ name: 'Interest', value: totalInterest });
  } else {
    // Savings-like: breakdown of FV into contributions and interest
    if (totalPayments > 0) breakdown.push({ name: 'Contributions', value: totalPayments });
    if (totalInterest > 0) breakdown.push({ name: 'Interest Earned', value: totalInterest });
  }

  // Balance over time — show balance at each year point
  const balanceOverTime: { year: number; balance: number }[] = [];
  if (mode === 'pv-to-payment' || mode === 'payment-to-pv') {
    // Declining balance (loan amortization style)
    let balance = pv;
    balanceOverTime.push({ year: 0, balance: parseFloat(balance.toFixed(2)) });
    for (let y = 1; y <= years; y++) {
      const periodsThisYear = paymentsPerYear;
      for (let p = 0; p < periodsThisYear; p++) {
        const interestCharge = balance * ratePerPeriod;
        balance = balance + interestCharge - payment;
      }
      balanceOverTime.push({ year: y, balance: parseFloat(Math.max(0, balance).toFixed(2)) });
    }
  } else {
    // Growing balance (savings style)
    let balance = 0;
    balanceOverTime.push({ year: 0, balance: 0 });
    for (let y = 1; y <= years; y++) {
      const periodsThisYear = paymentsPerYear;
      for (let p = 0; p < periodsThisYear; p++) {
        if (timing === 'due') {
          balance += payment;
          balance *= (1 + ratePerPeriod);
        } else {
          balance *= (1 + ratePerPeriod);
          balance += payment;
        }
      }
      balanceOverTime.push({ year: y, balance: parseFloat(balance.toFixed(2)) });
    }
  }

  return {
    payment,
    presentValue: pv,
    futureValue: fv,
    totalPayments,
    totalInterest,
    summary,
    breakdown,
    balanceOverTime,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'annuity': calculateAnnuity,
};
