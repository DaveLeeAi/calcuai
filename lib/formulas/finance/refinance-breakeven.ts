/**
 * Mortgage Refinance Break-Even Calculator
 *
 * Calculates the monthly savings, break-even point, and total lifetime savings
 * from refinancing a mortgage at a lower interest rate.
 *
 * Formulas:
 *   Monthly Payment = P × [r(1+r)^n] / [(1+r)^n - 1]
 *     (standard fixed-rate mortgage payment formula)
 *
 *   Monthly Savings = Current Payment - New Payment
 *   Break-Even Months = Closing Costs / Monthly Savings
 *   Total Savings = (Monthly Savings × New Term Months) - Closing Costs
 *
 * Where:
 *   P = loan principal
 *   r = monthly interest rate (annual rate / 12)
 *   n = number of monthly payments
 *
 * For cash-out refinance, the new loan balance = current balance + cash out amount.
 *
 * Source: Consumer Financial Protection Bureau (CFPB) refinancing guidelines;
 *         Freddie Mac refinancing analysis methodology.
 */
export function calculateRefinanceBreakeven(inputs: Record<string, unknown>): Record<string, unknown> {
  const currentLoanBalance = Number(inputs.currentLoanBalance) || 0;
  const currentRate = (Number(inputs.currentRate) || 0) / 100;
  const currentTermRemaining = Number(inputs.currentTermRemaining) || 0; // months
  const newRate = (Number(inputs.newRate) || 0) / 100;
  const newTermYears = parseInt(String(inputs.newTerm) || '30', 10);
  const newTermMonths = newTermYears * 12;
  const closingCosts = Number(inputs.closingCosts) || 0;
  const cashOut = Number(inputs.cashOut) || 0;

  // Helper: calculate monthly P&I payment
  function monthlyPayment(principal: number, monthlyRate: number, months: number): number {
    if (monthlyRate === 0) {
      return months > 0 ? principal / months : 0;
    }
    const factor = Math.pow(1 + monthlyRate, months);
    return principal * (monthlyRate * factor) / (factor - 1);
  }

  // Current monthly payment (P&I only on remaining term)
  const currentMonthlyRate = currentRate / 12;
  const currentMonthlyPayment = monthlyPayment(currentLoanBalance, currentMonthlyRate, currentTermRemaining);

  // New loan balance includes cash-out amount
  const newLoanBalance = currentLoanBalance + cashOut;

  // New monthly payment
  const newMonthlyRate = newRate / 12;
  const newMonthlyPayment = monthlyPayment(newLoanBalance, newMonthlyRate, newTermMonths);

  // Monthly savings (positive = you save money)
  const monthlySavings = parseFloat((currentMonthlyPayment - newMonthlyPayment).toFixed(2));

  // Break-even months (how long to recoup closing costs)
  let breakEvenMonths: number;
  if (monthlySavings <= 0) {
    breakEvenMonths = -1; // Never breaks even — refinancing costs more
  } else {
    breakEvenMonths = Math.ceil(closingCosts / monthlySavings);
  }

  // Total interest on current loan for remaining term
  const totalCurrentPayments = currentMonthlyPayment * currentTermRemaining;
  const totalCurrentInterest = totalCurrentPayments - currentLoanBalance;

  // Total interest on new loan
  const totalNewPayments = newMonthlyPayment * newTermMonths;
  const totalNewInterest = totalNewPayments - newLoanBalance;

  // Total savings = interest saved - closing costs
  // (comparing total cost of keeping current loan vs. refinancing)
  const totalSavings = parseFloat((totalCurrentInterest - totalNewInterest - closingCosts + cashOut).toFixed(2));

  // Comparison chart data: current vs new loan costs
  const comparisonChart = [
    {
      name: 'Monthly Payment',
      current: parseFloat(currentMonthlyPayment.toFixed(2)),
      new: parseFloat(newMonthlyPayment.toFixed(2)),
    },
    {
      name: 'Total Interest',
      current: parseFloat(totalCurrentInterest.toFixed(2)),
      new: parseFloat(totalNewInterest.toFixed(2)),
    },
    {
      name: 'Total Cost',
      current: parseFloat(totalCurrentPayments.toFixed(2)),
      new: parseFloat((totalNewPayments + closingCosts).toFixed(2)),
    },
  ];

  // Summary value group
  const summary = [
    { label: 'Monthly Savings', value: monthlySavings },
    { label: 'Break-Even Point', value: breakEvenMonths > 0 ? breakEvenMonths : 0 },
    { label: 'Total Savings', value: totalSavings },
    { label: 'New Monthly Payment', value: parseFloat(newMonthlyPayment.toFixed(2)) },
    { label: 'Current Monthly Payment', value: parseFloat(currentMonthlyPayment.toFixed(2)) },
    { label: 'Closing Costs', value: closingCosts },
  ];

  return {
    monthlySavings,
    breakEvenMonths: breakEvenMonths > 0 ? breakEvenMonths : 0,
    totalSavings,
    newMonthlyPayment: parseFloat(newMonthlyPayment.toFixed(2)),
    currentMonthlyPayment: parseFloat(currentMonthlyPayment.toFixed(2)),
    summary,
    comparisonChart,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'refinance-breakeven': calculateRefinanceBreakeven,
};
