/**
 * Real Estate Cash Flow Calculator
 *
 * Formulas:
 *   Gross Rental Income = Monthly Rent × 12
 *   Effective Gross Income = Gross Income × (1 − Vacancy Rate%)
 *   Net Operating Income (NOI) = Effective Gross Income − Operating Expenses
 *   Cash Flow = NOI − Annual Debt Service (mortgage payments)
 *   Cash-on-Cash Return = Annual Cash Flow / Total Cash Invested × 100
 *
 * Source: Investopedia — Net Operating Income (NOI) Definition (2025).
 * Source: BiggerPockets — Cash Flow Analysis for Rental Properties (2025).
 */

export interface RealEstateCashFlowInput {
  monthlyRent: number;
  vacancyRatePercent: number;
  propertyTaxMonthly: number;
  insuranceMonthly: number;
  maintenanceMonthly: number;
  propertyManagementPercent: number;
  otherExpensesMonthly: number;
  monthlyMortgagePayment: number;
  totalCashInvested: number;
}

export interface RealEstateCashFlowOutput {
  monthlyCashFlow: number;
  annualCashFlow: number;
  noi: number;
  cashOnCashReturn: number;
  grossRentalIncome: number;
  effectiveGrossIncome: number;
  totalOperatingExpenses: number;
  expenseRatio: number;
  summary: { label: string; value: number }[];
}

/**
 * Calculates monthly/annual cash flow and cash-on-cash return for a rental property.
 *
 * NOI = Effective Gross Income − Operating Expenses
 * Cash Flow = NOI − Annual Debt Service
 * CoC Return = Annual Cash Flow / Total Cash Invested × 100
 *
 * @param inputs - Record with monthlyRent, vacancyRatePercent, expenses, monthlyMortgagePayment, totalCashInvested
 * @returns Record with monthlyCashFlow, annualCashFlow, noi, cashOnCashReturn, summary
 */
export function calculateRealEstateCashFlow(inputs: Record<string, unknown>): Record<string, unknown> {
  const monthlyRent = Math.max(0, Number(inputs.monthlyRent) || 0);
  const vacancyRatePercent = inputs.vacancyRatePercent !== undefined
    ? Math.min(50, Math.max(0, Number(inputs.vacancyRatePercent)))
    : 5;
  const propertyTaxMonthly = Math.max(0, Number(inputs.propertyTaxMonthly) || 0);
  const insuranceMonthly = Math.max(0, Number(inputs.insuranceMonthly) || 0);
  const maintenanceMonthly = Math.max(0, Number(inputs.maintenanceMonthly) || 0);
  const propertyManagementPercent = Math.min(30, Math.max(0, Number(inputs.propertyManagementPercent) || 0));
  const otherExpensesMonthly = Math.max(0, Number(inputs.otherExpensesMonthly) || 0);
  const monthlyMortgagePayment = Math.max(0, Number(inputs.monthlyMortgagePayment) || 0);
  const totalCashInvested = Math.max(1, Number(inputs.totalCashInvested) || 1);

  const grossRentalIncome = parseFloat((monthlyRent * 12).toFixed(2));
  const vacancyLoss = parseFloat((grossRentalIncome * (vacancyRatePercent / 100)).toFixed(2));
  const effectiveGrossIncome = parseFloat((grossRentalIncome - vacancyLoss).toFixed(2));

  const monthlyManagement = parseFloat((monthlyRent * (propertyManagementPercent / 100)).toFixed(2));
  const monthlyOperatingExpenses = parseFloat((propertyTaxMonthly + insuranceMonthly + maintenanceMonthly + monthlyManagement + otherExpensesMonthly).toFixed(2));
  const totalOperatingExpenses = parseFloat((monthlyOperatingExpenses * 12).toFixed(2));

  const noi = parseFloat((effectiveGrossIncome - totalOperatingExpenses).toFixed(2));
  const annualDebtService = parseFloat((monthlyMortgagePayment * 12).toFixed(2));
  const annualCashFlow = parseFloat((noi - annualDebtService).toFixed(2));
  const monthlyCashFlow = parseFloat((annualCashFlow / 12).toFixed(2));

  const cashOnCashReturn = parseFloat(((annualCashFlow / totalCashInvested) * 100).toFixed(2));
  const expenseRatio = effectiveGrossIncome > 0
    ? parseFloat(((totalOperatingExpenses / effectiveGrossIncome) * 100).toFixed(2))
    : 0;

  const summary: { label: string; value: number }[] = [
    { label: 'Gross Rental Income', value: grossRentalIncome },
    { label: 'Effective Gross Income', value: effectiveGrossIncome },
    { label: 'Operating Expenses', value: totalOperatingExpenses },
    { label: 'NOI', value: noi },
    { label: 'Annual Debt Service', value: annualDebtService },
    { label: 'Annual Cash Flow', value: annualCashFlow },
    { label: 'Monthly Cash Flow', value: monthlyCashFlow },
    { label: 'Cash-on-Cash Return %', value: cashOnCashReturn },
  ];

  return { monthlyCashFlow, annualCashFlow, noi, cashOnCashReturn, grossRentalIncome, effectiveGrossIncome, totalOperatingExpenses, expenseRatio, summary };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'real-estate-cash-flow': calculateRealEstateCashFlow,
};
