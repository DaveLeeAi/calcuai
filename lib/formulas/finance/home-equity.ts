/**
 * Home Equity Calculator
 *
 * Calculates home equity, equity percentage, LTV, borrowable equity,
 * appreciation, and return on initial investment.
 *
 * Core formula:
 *   Equity = Home Value - Mortgage Balance - Second Mortgage - Other Liens
 *   Equity % = (Equity / Home Value) × 100
 *   LTV = ((Total Debt) / Home Value) × 100
 *   Borrowable Equity (80%) = max(0, Home Value × 0.80 - Total Debt)
 *   Appreciation = Home Value - Original Purchase Price
 *   Return on Equity = ((Equity - Down Payment) / Down Payment) × 100
 *
 * Source: Federal Housing Finance Agency (FHFA); Freddie Mac Home Equity Guidelines;
 *         Consumer Financial Protection Bureau (CFPB) — Home Equity Resources
 */

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calculateHomeEquity(inputs: Record<string, unknown>): Record<string, unknown> {
  const homeValue = Math.max(0, Number(inputs.homeValue) || 0);
  const mortgageBalance = Math.max(0, Number(inputs.mortgageBalance) || 0);
  const secondMortgage = Math.max(0, Number(inputs.secondMortgage) || 0);
  const otherLiens = Math.max(0, Number(inputs.otherLiens) || 0);
  const originalPrice = Math.max(0, Number(inputs.originalPrice) || 0);
  const downPaymentOriginal = Math.max(0, Number(inputs.downPaymentOriginal) || 0);

  const totalDebt = mortgageBalance + secondMortgage + otherLiens;

  // Core equity calculation — can be negative (underwater)
  const equity = round2(homeValue - totalDebt);

  // Equity percentage — handle zero home value
  const equityPercent = homeValue > 0
    ? round2((equity / homeValue) * 100)
    : 0;

  // Loan-to-value ratios
  const ltv = homeValue > 0
    ? round2((totalDebt / homeValue) * 100)
    : 0;

  // Combined LTV is the same as LTV when all liens are included
  const cltv = ltv;

  // Borrowable equity at various LTV thresholds
  const borrowableEquity80 = round2(Math.max(0, homeValue * 0.80 - totalDebt));
  const borrowableEquity90 = round2(Math.max(0, homeValue * 0.90 - totalDebt));

  // Appreciation
  const appreciation = round2(homeValue - originalPrice);
  const appreciationPercent = originalPrice > 0
    ? round2(((homeValue - originalPrice) / originalPrice) * 100)
    : 0;

  // Total invested: down payment + principal paid so far
  // Principal paid ≈ original loan amount - remaining balance
  // Original loan = originalPrice - downPaymentOriginal
  const originalLoan = Math.max(0, originalPrice - downPaymentOriginal);
  const principalPaid = Math.max(0, originalLoan - mortgageBalance);
  const totalInvested = round2(downPaymentOriginal + principalPaid);

  // Return on equity — ROI on initial down payment
  const returnOnEquity = downPaymentOriginal > 0
    ? round2(((equity - downPaymentOriginal) / downPaymentOriginal) * 100)
    : 0;

  // Equity breakdown value group
  const equityBreakdown = [
    { label: 'Home Value', value: homeValue },
    { label: 'Total Debt', value: totalDebt },
    { label: 'Net Equity', value: equity },
    { label: 'Equity %', value: equityPercent },
  ];

  return {
    equity,
    equityPercent,
    ltv,
    cltv,
    borrowableEquity80,
    borrowableEquity90,
    appreciation,
    appreciationPercent,
    totalInvested,
    returnOnEquity,
    equityBreakdown,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'home-equity': calculateHomeEquity,
};
