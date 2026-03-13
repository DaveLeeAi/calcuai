/**
 * HELOC (Home Equity Line of Credit) Calculator
 *
 * Calculates borrowing power, monthly payments, and total interest cost
 * for a home equity line of credit with distinct draw and repayment periods.
 *
 * During the draw period, payments can be interest-only or fully amortized.
 * During the repayment period, the remaining balance is amortized over
 * the repayment term using the standard fixed-rate formula:
 *
 *   M = P × [r(1+r)^n] / [(1+r)^n - 1]
 *
 * Where:
 *   M = monthly payment
 *   P = remaining principal balance
 *   r = monthly interest rate (annual rate / 12)
 *   n = number of monthly payments in the repayment period
 *
 * Source: Federal Reserve — Home Equity Lines of Credit: Consumer Handbook
 */
export function calculateHeloc(inputs: Record<string, unknown>): Record<string, unknown> {
  const homeValue = Number(inputs.homeValue) || 0;
  const mortgageBalance = Number(inputs.mortgageBalance) || 0;
  const creditLimitPercent = Number(inputs.creditLimit) || 80;
  const drawAmount = Number(inputs.drawAmount) || 0;
  const annualRate = (Number(inputs.interestRate) || 0) / 100;
  const drawPeriodYears = Number(inputs.drawPeriod) || 10;
  const repaymentPeriodYears = Number(inputs.repaymentPeriod) || 20;
  const interestOnly = inputs.interestOnly !== false && inputs.interestOnly !== 'false';

  const homeEquity = Math.max(0, homeValue - mortgageBalance);
  const maxCreditLine = parseFloat((homeEquity * (creditLimitPercent / 100)).toFixed(2));
  const availableCredit = parseFloat(Math.min(Math.max(0, drawAmount), maxCreditLine).toFixed(2));

  // Edge case: no borrowing power or zero draw
  if (availableCredit <= 0 || homeValue <= 0) {
    return {
      homeEquity: parseFloat(homeEquity.toFixed(2)),
      maxCreditLine,
      availableCredit: 0,
      ltvRatio: homeValue > 0 ? parseFloat(((mortgageBalance / homeValue) * 100).toFixed(2)) : 0,
      combinedLTV: homeValue > 0 ? parseFloat(((mortgageBalance / homeValue) * 100).toFixed(2)) : 0,
      drawPeriodMonthlyPayment: 0,
      repaymentMonthlyPayment: 0,
      totalInterestDraw: 0,
      totalInterestRepayment: 0,
      totalInterest: 0,
      totalCost: 0,
      monthlyPaymentBreakdown: [
        { label: 'Draw Period Payment', value: 0 },
        { label: 'Repayment Period Payment', value: 0 },
      ],
    };
  }

  const combinedLTV = parseFloat((((mortgageBalance + availableCredit) / homeValue) * 100).toFixed(2));
  const monthlyRate = annualRate / 12;
  const drawMonths = drawPeriodYears * 12;
  const repaymentMonths = repaymentPeriodYears * 12;

  // ── Draw Period ──
  let drawPeriodMonthlyPayment: number;
  let balanceAfterDraw: number;
  let totalInterestDraw: number;

  if (interestOnly) {
    // Interest-only payments during draw period
    if (monthlyRate === 0) {
      drawPeriodMonthlyPayment = 0;
    } else {
      drawPeriodMonthlyPayment = availableCredit * monthlyRate;
    }
    balanceAfterDraw = availableCredit;
    totalInterestDraw = drawPeriodMonthlyPayment * drawMonths;
  } else {
    // Fully amortized during draw period (principal + interest)
    if (monthlyRate === 0) {
      drawPeriodMonthlyPayment = availableCredit / drawMonths;
      balanceAfterDraw = 0;
      totalInterestDraw = 0;
    } else {
      const factor = Math.pow(1 + monthlyRate, drawMonths);
      drawPeriodMonthlyPayment = availableCredit * (monthlyRate * factor) / (factor - 1);

      // Calculate remaining balance after draw period amortization
      let balance = availableCredit;
      totalInterestDraw = 0;
      for (let m = 1; m <= drawMonths; m++) {
        const interestPayment = balance * monthlyRate;
        const principalPayment = drawPeriodMonthlyPayment - interestPayment;
        totalInterestDraw += interestPayment;
        balance = Math.max(0, balance - principalPayment);
      }
      balanceAfterDraw = balance;
    }
  }

  drawPeriodMonthlyPayment = parseFloat(drawPeriodMonthlyPayment.toFixed(2));
  totalInterestDraw = parseFloat(totalInterestDraw.toFixed(2));

  // ── Repayment Period ──
  let repaymentMonthlyPayment: number;
  let totalInterestRepayment: number;

  if (balanceAfterDraw <= 0.005) {
    repaymentMonthlyPayment = 0;
    totalInterestRepayment = 0;
  } else if (monthlyRate === 0) {
    repaymentMonthlyPayment = balanceAfterDraw / repaymentMonths;
    totalInterestRepayment = 0;
  } else {
    const factor = Math.pow(1 + monthlyRate, repaymentMonths);
    repaymentMonthlyPayment = balanceAfterDraw * (monthlyRate * factor) / (factor - 1);
    const totalRepaymentPaid = repaymentMonthlyPayment * repaymentMonths;
    totalInterestRepayment = totalRepaymentPaid - balanceAfterDraw;
  }

  repaymentMonthlyPayment = parseFloat(repaymentMonthlyPayment.toFixed(2));
  totalInterestRepayment = parseFloat(totalInterestRepayment.toFixed(2));

  const totalInterest = parseFloat((totalInterestDraw + totalInterestRepayment).toFixed(2));
  const totalCost = parseFloat((availableCredit + totalInterest).toFixed(2));

  const monthlyPaymentBreakdown = [
    { label: 'Draw Period Payment', value: drawPeriodMonthlyPayment },
    { label: 'Repayment Period Payment', value: repaymentMonthlyPayment },
  ];

  return {
    homeEquity: parseFloat(homeEquity.toFixed(2)),
    maxCreditLine,
    availableCredit,
    ltvRatio: combinedLTV,
    combinedLTV,
    drawPeriodMonthlyPayment,
    repaymentMonthlyPayment,
    totalInterestDraw,
    totalInterestRepayment,
    totalInterest,
    totalCost,
    monthlyPaymentBreakdown,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'heloc': calculateHeloc,
};
