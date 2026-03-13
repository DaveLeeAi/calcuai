/**
 * Mortgage Points Calculator
 *
 * Calculates the cost and benefit of buying mortgage discount points.
 * Each discount point costs 1% of the loan amount and typically reduces
 * the interest rate by 0.25%. The calculator computes break-even timeline,
 * monthly savings, total interest saved, and ROI.
 *
 * Uses standard fixed-rate amortization formula:
 * M = P × [r(1+r)^n] / [(1+r)^n - 1]
 *
 * Where:
 *   M = monthly payment (principal + interest)
 *   P = loan amount
 *   r = monthly interest rate (annual rate / 12)
 *   n = total number of payments (term in years × 12)
 *
 * Source: Consumer Financial Protection Bureau (CFPB)
 */
export function calculateMortgagePoints(inputs: Record<string, unknown>): Record<string, unknown> {
  const loanAmount = Number(inputs.loanAmount) || 0;
  const interestRate = Number(inputs.interestRate) || 0;
  const pointsPurchased = Number(inputs.pointsPurchased) || 0;
  const rateReductionPerPoint = Number(inputs.rateReductionPerPoint) || 0.25;
  const termYears = parseInt(String(inputs.loanTerm) || '30', 10);
  const termMonths = termYears * 12;

  // Cost of buying points: each point = 1% of loan amount
  const pointsCost = parseFloat((loanAmount * (pointsPurchased / 100)).toFixed(2));

  // New rate after buying points — cap at 0%
  const totalReduction = pointsPurchased * rateReductionPerPoint;
  const newRate = parseFloat(Math.max(0, interestRate - totalReduction).toFixed(3));

  // Calculate monthly payment using amortization formula
  const calcMonthly = (principal: number, annualRatePercent: number, months: number): number => {
    if (principal <= 0 || months <= 0) return 0;
    const monthlyRate = (annualRatePercent / 100) / 12;
    if (monthlyRate === 0) {
      return principal / months;
    }
    const factor = Math.pow(1 + monthlyRate, months);
    return principal * (monthlyRate * factor) / (factor - 1);
  };

  const originalPayment = parseFloat(calcMonthly(loanAmount, interestRate, termMonths).toFixed(2));
  const newPayment = parseFloat(calcMonthly(loanAmount, newRate, termMonths).toFixed(2));
  const monthlySavings = parseFloat((originalPayment - newPayment).toFixed(2));

  // Break-even calculation
  let breakEvenMonths: number;
  if (monthlySavings <= 0 || pointsCost <= 0) {
    breakEvenMonths = 0;
  } else {
    breakEvenMonths = Math.ceil(pointsCost / monthlySavings);
  }
  const breakEvenYears = parseFloat((breakEvenMonths / 12).toFixed(1));

  // Total interest over life of loan
  const originalTotalInterest = parseFloat(((originalPayment * termMonths) - loanAmount).toFixed(2));
  const newTotalInterest = parseFloat(((newPayment * termMonths) - loanAmount).toFixed(2));
  const interestSaved = parseFloat((originalTotalInterest - newTotalInterest).toFixed(2));

  // Total savings = interest saved minus cost of points
  const totalSavingsOverLoan = parseFloat((interestSaved - pointsCost).toFixed(2));

  // ROI
  let roi: number;
  if (pointsCost <= 0) {
    roi = 0;
  } else {
    roi = parseFloat((((interestSaved - pointsCost) / pointsCost) * 100).toFixed(1));
  }

  // Comparison table
  const comparisonTable = [
    { label: 'Without Points', value: originalPayment },
    { label: 'With Points', value: newPayment },
    { label: 'Monthly Savings', value: monthlySavings },
  ];

  return {
    pointsCost,
    newRate,
    originalPayment,
    newPayment,
    monthlySavings,
    breakEvenMonths,
    breakEvenYears,
    totalSavingsOverLoan,
    originalTotalInterest,
    newTotalInterest,
    interestSaved,
    roi,
    comparisonTable,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'mortgage-points': calculateMortgagePoints,
};
