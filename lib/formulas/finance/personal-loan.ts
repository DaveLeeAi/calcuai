/**
 * Personal Loan Calculator
 *
 * Calculates monthly payment, total interest, effective APR, and cost breakdown
 * for an unsecured personal loan with optional origination fee.
 *
 * Core formula (standard amortization):
 *   M = P × [r(1+r)^n] / [(1+r)^n - 1]
 *
 * Where:
 *   P = loan principal (amount borrowed)
 *   r = monthly interest rate (annual rate / 12 / 100)
 *   n = number of monthly payments (term in months)
 *   M = fixed monthly payment
 *
 * Total Payment = M × n
 * Total Interest = Total Payment - P
 * Origination Fee = P × (originationFeePercent / 100)
 * Net Loan Proceeds = P - Origination Fee
 * Effective APR = solved iteratively such that PV of payments at APR/12 equals net proceeds
 *
 * Source: Consumer Financial Protection Bureau (CFPB) — Loan Estimate explainer;
 *         Truth in Lending Act (TILA) Regulation Z
 */

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Compute the effective APR using Newton's method.
 * APR is the rate r_eff such that:
 *   netProceeds = M × [(1 - (1 + r_eff/12)^(-n)) / (r_eff/12)]
 *
 * When origination fee is 0, APR equals the stated rate.
 */
function computeEffectiveAPR(
  monthlyPayment: number,
  netProceeds: number,
  termMonths: number,
  statedAnnualRate: number
): number {
  if (netProceeds <= 0 || monthlyPayment <= 0 || termMonths <= 0) return 0;
  if (statedAnnualRate === 0) return 0;

  // Start guess at stated rate
  let apr = statedAnnualRate / 100;
  const maxIter = 100;
  const tolerance = 1e-10;

  for (let i = 0; i < maxIter; i++) {
    const r = apr / 12;
    if (r <= -1) {
      apr = statedAnnualRate / 100;
      break;
    }

    // PV of annuity at rate r for n periods
    const factor = Math.pow(1 + r, -termMonths);
    const pv = monthlyPayment * (1 - factor) / r;
    const f = pv - netProceeds;

    // Derivative of PV with respect to apr (chain rule: dr/dapr = 1/12)
    // dPV/dr = M × [n × (1+r)^(-n-1) / r - (1 - (1+r)^(-n)) / r^2]
    const dpv_dr =
      monthlyPayment * (
        (termMonths * Math.pow(1 + r, -termMonths - 1)) / r -
        (1 - factor) / (r * r)
      );
    const df = dpv_dr / 12; // chain rule: dapr → dr = 1/12

    if (Math.abs(df) < 1e-20) break;

    const newApr = apr - f / df;
    if (Math.abs(newApr - apr) < tolerance) {
      apr = newApr;
      break;
    }
    apr = newApr;
  }

  return round2(apr * 100);
}

export function calculatePersonalLoan(inputs: Record<string, unknown>): Record<string, unknown> {
  const loanAmount = Math.max(0, Number(inputs.loanAmount) || 0);
  const annualInterestRate = Math.max(0, Math.min(100, Number(inputs.annualInterestRate) || 0));
  const loanTermMonths = Math.max(1, Math.round(Number(inputs.loanTermMonths) || 36));
  const originationFeePercent = Math.max(0, Math.min(100, Number(inputs.originationFeePercent) || 0));

  // Monthly interest rate
  const monthlyRate = annualInterestRate / 100 / 12;

  // Monthly payment using standard amortization formula
  let monthlyPayment: number;
  if (loanAmount === 0) {
    monthlyPayment = 0;
  } else if (annualInterestRate === 0) {
    // Zero interest: simple division
    monthlyPayment = round2(loanAmount / loanTermMonths);
  } else {
    const factor = Math.pow(1 + monthlyRate, loanTermMonths);
    monthlyPayment = round2(loanAmount * (monthlyRate * factor) / (factor - 1));
  }

  // Total payment and interest
  const totalPayment = round2(monthlyPayment * loanTermMonths);
  const totalInterest = round2(totalPayment - loanAmount);

  // Origination fee and net proceeds
  const originationFee = round2(loanAmount * (originationFeePercent / 100));
  const netLoanProceeds = round2(loanAmount - originationFee);

  // Effective APR (accounts for origination fee)
  let effectiveAPR: number;
  if (originationFeePercent === 0) {
    effectiveAPR = round2(annualInterestRate);
  } else {
    effectiveAPR = computeEffectiveAPR(monthlyPayment, netLoanProceeds, loanTermMonths, annualInterestRate);
  }

  // Amortization summary: first and last payment interest split
  let firstPaymentInterest = 0;
  let firstPaymentPrincipal = 0;
  let lastPaymentInterest = 0;
  let lastPaymentPrincipal = 0;

  if (loanAmount > 0 && monthlyPayment > 0) {
    firstPaymentInterest = round2(loanAmount * monthlyRate);
    firstPaymentPrincipal = round2(monthlyPayment - firstPaymentInterest);

    // Simulate to find last payment split
    let balance = loanAmount;
    for (let m = 0; m < loanTermMonths; m++) {
      const interest = balance * monthlyRate;
      const principal = monthlyPayment - interest;
      if (m === loanTermMonths - 1) {
        lastPaymentInterest = round2(interest);
        lastPaymentPrincipal = round2(Math.min(monthlyPayment, balance));
      }
      balance = balance - principal;
    }
  }

  // Cost breakdown (value-group)
  const costBreakdown = [
    { label: 'Loan Principal', value: loanAmount },
    { label: 'Total Interest', value: totalInterest },
    { label: 'Origination Fee', value: originationFee },
    { label: 'Total Cost of Loan', value: round2(totalInterest + originationFee) },
  ];

  // Cost breakdown chart — {name, value}[] for pie chart rendering
  const costBreakdownChart = [
    { name: 'Principal', value: loanAmount },
    { name: 'Total Interest', value: totalInterest },
    { name: 'Origination Fee', value: originationFee },
  ].filter(item => item.value > 0);

  return {
    monthlyPayment,
    totalPayment,
    totalInterest,
    effectiveAPR,
    originationFee,
    netLoanProceeds,
    firstPaymentInterest,
    firstPaymentPrincipal,
    lastPaymentInterest,
    lastPaymentPrincipal,
    costBreakdown,
    costBreakdownChart,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'personal-loan': calculatePersonalLoan,
};
