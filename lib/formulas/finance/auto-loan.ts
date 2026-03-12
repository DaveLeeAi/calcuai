/**
 * Auto Loan Calculator
 *
 * Calculates monthly car payment, total cost, and amortization schedule
 * for a vehicle purchase with trade-in value, down payment, and sales tax.
 *
 * Formula (standard fixed-rate amortization):
 *   M = P × [r(1+r)^n] / [(1+r)^n - 1]
 *
 * Where:
 *   P = financed amount = vehiclePrice - tradeInValue - downPayment + salesTax
 *   r = monthly interest rate (annual rate / 12)
 *   n = loan term in months
 *   M = monthly payment
 *
 * Sales tax is calculated on the net vehicle price after trade-in:
 *   salesTaxAmount = (vehiclePrice - tradeInValue) × salesTaxRate
 *   (Most US states apply sales tax after trade-in deduction.)
 *
 * Source: Consumer Financial Protection Bureau (CFPB) auto lending disclosures;
 *         Federal Reserve consumer credit data.
 */

export interface AutoLoanAmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export function calculateAutoLoan(inputs: Record<string, unknown>): Record<string, unknown> {
  const vehiclePrice = Number(inputs.vehiclePrice) || 0;
  const tradeInValue = Number(inputs.tradeInValue) || 0;
  const downPayment = Number(inputs.downPayment) || 0;
  const annualRate = (Number(inputs.annualRate) || 0) / 100;
  const loanTerm = Number(inputs.loanTerm) || 60; // months
  const salesTaxRate = (Number(inputs.salesTaxRate) || 0) / 100;

  // Calculate sales tax (most states apply on price after trade-in)
  const taxableAmount = Math.max(0, vehiclePrice - tradeInValue);
  const salesTaxAmount = parseFloat((taxableAmount * salesTaxRate).toFixed(2));

  // Financed amount
  const loanAmount = Math.max(0, vehiclePrice - tradeInValue - downPayment + salesTaxAmount);

  if (loanAmount <= 0 || loanTerm <= 0) {
    return {
      monthlyPayment: 0,
      loanAmount: 0,
      salesTaxAmount,
      totalPayment: 0,
      totalInterest: 0,
      totalCostOfOwnership: parseFloat((vehiclePrice + salesTaxAmount).toFixed(2)),
      payoffDate: '0 months',
      summary: [],
      paymentBreakdown: [],
      amortizationSchedule: [],
      balanceOverTime: [],
    };
  }

  const monthlyRate = annualRate / 12;

  // Calculate monthly payment
  let monthlyPayment: number;
  if (monthlyRate === 0) {
    monthlyPayment = loanAmount / loanTerm;
  } else {
    const factor = Math.pow(1 + monthlyRate, loanTerm);
    monthlyPayment = loanAmount * (monthlyRate * factor) / (factor - 1);
  }
  monthlyPayment = parseFloat(monthlyPayment.toFixed(2));

  const totalPayment = parseFloat((monthlyPayment * loanTerm).toFixed(2));
  const totalInterest = parseFloat((totalPayment - loanAmount).toFixed(2));

  // Total cost of ownership = down payment + trade-in sacrifice + total loan payments
  const totalCostOfOwnership = parseFloat((downPayment + totalPayment).toFixed(2));

  // Payoff date formatting
  const years = Math.floor(loanTerm / 12);
  const remainingMonths = loanTerm % 12;
  let payoffDate: string;
  if (years === 0) {
    payoffDate = `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  } else if (remainingMonths === 0) {
    payoffDate = `${years} year${years !== 1 ? 's' : ''}`;
  } else {
    payoffDate = `${years} year${years !== 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  }

  // Amortization schedule
  const schedule: AutoLoanAmortizationRow[] = [];
  const balanceOverTime: { month: number; balance: number }[] = [{ month: 0, balance: parseFloat(loanAmount.toFixed(2)) }];
  let balance = loanAmount;

  for (let month = 1; month <= loanTerm; month++) {
    const interestPayment = balance * monthlyRate;
    let principalPayment = monthlyPayment - interestPayment;

    // Last payment adjustment
    if (principalPayment > balance) {
      principalPayment = balance;
    }
    balance = Math.max(0, balance - principalPayment);

    schedule.push({
      month,
      payment: parseFloat((principalPayment + interestPayment).toFixed(2)),
      principal: parseFloat(principalPayment.toFixed(2)),
      interest: parseFloat(interestPayment.toFixed(2)),
      balance: parseFloat(balance.toFixed(2)),
    });

    balanceOverTime.push({
      month,
      balance: parseFloat(balance.toFixed(2)),
    });
  }

  // Summary
  const summary: { label: string; value: number | string }[] = [
    { label: 'Monthly Payment', value: monthlyPayment },
    { label: 'Loan Amount', value: parseFloat(loanAmount.toFixed(2)) },
    { label: 'Sales Tax', value: salesTaxAmount },
    { label: 'Total Interest', value: totalInterest },
    { label: 'Total of Payments', value: totalPayment },
    { label: 'Payoff Time', value: payoffDate },
  ];

  // Payment breakdown pie chart
  const paymentBreakdown: { name: string; value: number }[] = [
    { name: 'Principal', value: parseFloat(loanAmount.toFixed(2)) },
  ];
  if (totalInterest > 0) {
    paymentBreakdown.push({ name: 'Interest', value: totalInterest });
  }
  if (salesTaxAmount > 0) {
    paymentBreakdown.push({ name: 'Sales Tax', value: salesTaxAmount });
  }

  return {
    monthlyPayment,
    loanAmount: parseFloat(loanAmount.toFixed(2)),
    salesTaxAmount,
    totalPayment,
    totalInterest,
    totalCostOfOwnership,
    payoffDate,
    summary,
    paymentBreakdown,
    amortizationSchedule: schedule,
    balanceOverTime,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'auto-loan': calculateAutoLoan,
};
