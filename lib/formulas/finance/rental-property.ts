/**
 * Rental Property Investment Calculator
 *
 * Analyzes rental property cash flow, returns, and projections.
 *
 * Core formulas:
 *   monthlyMortgage = P * [r(1+r)^n] / [(1+r)^n - 1]
 *     where P = loanAmount, r = monthlyRate, n = totalMonths
 *
 *   netOperatingIncome (NOI) = effectiveGrossIncome - operatingExpenses
 *   capRate = (NOI / purchasePrice) * 100
 *   cashOnCashReturn = (annualCashFlow / totalCashNeeded) * 100
 *   DSCR = NOI / annualDebtService
 *   GRM = purchasePrice / grossAnnualRent
 *   breakEvenRatio = ((operatingExpenses + debtService) / grossRent) * 100
 *
 * Source: National Association of Realtors — Real Estate Investment Analysis;
 * Freddie Mac — Rental Income Guidelines
 */
export function calculateRentalProperty(inputs: Record<string, unknown>): Record<string, unknown> {
  const purchasePrice = Number(inputs.purchasePrice) || 0;
  const downPaymentPercent = inputs.downPaymentPercent != null ? Number(inputs.downPaymentPercent) : 20;
  const annualRate = (inputs.interestRate != null ? Number(inputs.interestRate) : 7) / 100;
  const termYears = parseInt(String(inputs.loanTerm) || '30', 10);
  const termMonths = termYears * 12;
  const closingCosts = Number(inputs.closingCosts) || 0;
  const monthlyRent = Number(inputs.monthlyRent) || 0;
  const vacancyRate = inputs.vacancyRate != null ? Number(inputs.vacancyRate) : 5;
  const propertyTax = Number(inputs.propertyTax) || 0;
  const insurance = Number(inputs.insurance) || 0;
  const maintenancePct = inputs.maintenance != null ? Number(inputs.maintenance) : 1;
  const managementFeePct = inputs.managementFee != null ? Number(inputs.managementFee) : 0;
  const otherExpenses = Number(inputs.otherExpenses) || 0;
  const appreciationRate = inputs.appreciationRate != null ? Number(inputs.appreciationRate) : 3;

  // ─── Down Payment & Loan ───
  const downPayment = parseFloat((purchasePrice * downPaymentPercent / 100).toFixed(2));
  const loanAmount = parseFloat(Math.max(0, purchasePrice - downPayment).toFixed(2));
  const totalCashNeeded = parseFloat((downPayment + closingCosts).toFixed(2));

  // ─── Monthly Mortgage (P&I) ───
  const monthlyRate = annualRate / 12;
  let monthlyMortgage: number;

  if (loanAmount <= 0) {
    // All-cash purchase — no mortgage
    monthlyMortgage = 0;
  } else if (monthlyRate === 0) {
    // 0% interest rate
    monthlyMortgage = loanAmount / termMonths;
  } else {
    const factor = Math.pow(1 + monthlyRate, termMonths);
    monthlyMortgage = loanAmount * (monthlyRate * factor) / (factor - 1);
  }
  monthlyMortgage = parseFloat(monthlyMortgage.toFixed(2));

  // ─── Income ───
  const grossAnnualRent = monthlyRent * 12;
  const effectiveGrossIncome = parseFloat((grossAnnualRent * (1 - vacancyRate / 100)).toFixed(2));

  // ─── Operating Expenses (excludes debt service) ───
  const maintenanceCost = parseFloat((purchasePrice * maintenancePct / 100).toFixed(2));
  const managementCost = parseFloat((grossAnnualRent * managementFeePct / 100).toFixed(2));
  const annualExpenses = parseFloat((propertyTax + insurance + maintenanceCost + managementCost + otherExpenses).toFixed(2));

  // ─── NOI & Cash Flow ───
  const netOperatingIncome = parseFloat((effectiveGrossIncome - annualExpenses).toFixed(2));
  const annualDebtService = parseFloat((monthlyMortgage * 12).toFixed(2));
  const annualCashFlow = parseFloat((netOperatingIncome - annualDebtService).toFixed(2));
  const monthlyCashFlow = parseFloat((annualCashFlow / 12).toFixed(2));

  // ─── Return Metrics ───
  const capRate = purchasePrice > 0
    ? parseFloat(((netOperatingIncome / purchasePrice) * 100).toFixed(2))
    : 0;

  const cashOnCashReturn = totalCashNeeded > 0
    ? parseFloat(((annualCashFlow / totalCashNeeded) * 100).toFixed(2))
    : 0;

  const dscr = annualDebtService > 0
    ? parseFloat((netOperatingIncome / annualDebtService).toFixed(2))
    : netOperatingIncome >= 0 ? 999 : 0; // No debt = infinite coverage (capped display)

  const grm = grossAnnualRent > 0
    ? parseFloat((purchasePrice / grossAnnualRent).toFixed(2))
    : 0;

  const breakEvenRatio = grossAnnualRent > 0
    ? parseFloat((((annualExpenses + annualDebtService) / grossAnnualRent) * 100).toFixed(2))
    : 0;

  // ─── Expense Breakdown (for pie chart / value-group) ───
  const expenseBreakdown = [
    { label: 'Property Tax', value: propertyTax },
    { label: 'Insurance', value: insurance },
    { label: 'Maintenance', value: maintenanceCost },
    { label: 'Management', value: managementCost },
    { label: 'Other', value: otherExpenses },
    { label: 'Mortgage (P&I)', value: annualDebtService },
  ];

  // ─── Five-Year Projection ───
  const fiveYearProjection: {
    year: number;
    propertyValue: number;
    annualRent: number;
    cashFlow: number;
    equity: number;
    totalReturn: number;
  }[] = [];

  let currentPropertyValue = purchasePrice;
  let remainingBalance = loanAmount;
  let cumulativeCashFlow = 0;

  for (let year = 1; year <= 5; year++) {
    // Property appreciates
    currentPropertyValue = parseFloat((currentPropertyValue * (1 + appreciationRate / 100)).toFixed(2));

    // Annual rent (assumed to grow at same rate as appreciation for projection)
    const projectedAnnualRent = parseFloat((grossAnnualRent * Math.pow(1 + appreciationRate / 100, year)).toFixed(2));

    // Principal paid down in this year (amortization)
    let principalPaidThisYear = 0;
    for (let m = 0; m < 12; m++) {
      if (remainingBalance <= 0) break;
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = monthlyMortgage - interestPayment;
      principalPaidThisYear += Math.min(principalPayment, remainingBalance);
      remainingBalance = Math.max(0, remainingBalance - principalPayment);
    }

    // Equity = property value - remaining loan balance
    const equity = parseFloat((currentPropertyValue - remainingBalance).toFixed(2));

    // Cash flow for projection uses year-1 figures (simplified)
    cumulativeCashFlow += annualCashFlow;

    // Total return = equity gain + cumulative cash flow - total cash invested
    const equityGain = equity - totalCashNeeded;
    const totalReturn = parseFloat((equityGain + cumulativeCashFlow).toFixed(2));

    fiveYearProjection.push({
      year,
      propertyValue: currentPropertyValue,
      annualRent: projectedAnnualRent,
      cashFlow: annualCashFlow,
      equity,
      totalReturn,
    });
  }

  return {
    downPayment,
    loanAmount,
    monthlyMortgage,
    totalCashNeeded,
    effectiveGrossIncome,
    annualExpenses,
    netOperatingIncome,
    annualDebtService,
    annualCashFlow,
    monthlyCashFlow,
    capRate,
    cashOnCashReturn,
    dscr,
    grm,
    breakEvenRatio,
    expenseBreakdown,
    fiveYearProjection,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'rental-property': calculateRentalProperty,
};
