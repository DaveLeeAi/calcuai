/**
 * Rental Yield Calculator
 *
 * Formulas:
 *   Gross Rental Yield = (Annual Rent / Property Value) × 100
 *   Net Rental Yield = ((Annual Rent − Annual Expenses) / Property Value) × 100
 *   Annual Rent = Monthly Rent × 12
 *   Annual Expenses = (Property Tax + Insurance + Maintenance + Management Fees) / year
 *
 * Source: Investopedia — Rental Yield Definition (2025).
 * Source: National Association of Realtors — Rental Property Analysis Guide (2025).
 */

export interface RentalYieldInput {
  propertyValue: number;
  monthlyRent: number;
  annualPropertyTax: number;
  annualInsurance: number;
  annualMaintenance: number;
  managementFeePercent: number;
}

export interface RentalYieldOutput {
  grossYield: number;
  netYield: number;
  annualRent: number;
  annualExpenses: number;
  annualNetIncome: number;
  summary: { label: string; value: number }[];
}

/**
 * Calculates gross and net rental yield for an investment property.
 *
 * Gross Yield = (Annual Rent / Property Value) × 100
 * Net Yield = ((Annual Rent − Annual Expenses) / Property Value) × 100
 *
 * @param inputs - Record with propertyValue, monthlyRent, annualPropertyTax, annualInsurance, annualMaintenance, managementFeePercent
 * @returns Record with grossYield, netYield, annualRent, annualExpenses, annualNetIncome, summary
 */
export function calculateRentalYield(inputs: Record<string, unknown>): Record<string, unknown> {
  const propertyValue = Math.max(1, Number(inputs.propertyValue) || 0);
  const monthlyRent = Math.max(0, Number(inputs.monthlyRent) || 0);
  const annualPropertyTax = Math.max(0, Number(inputs.annualPropertyTax) || 0);
  const annualInsurance = Math.max(0, Number(inputs.annualInsurance) || 0);
  const annualMaintenance = Math.max(0, Number(inputs.annualMaintenance) || 0);
  const managementFeePercent = Math.min(50, Math.max(0, Number(inputs.managementFeePercent) || 0));

  const annualRent = parseFloat((monthlyRent * 12).toFixed(2));
  const managementFees = parseFloat((annualRent * (managementFeePercent / 100)).toFixed(2));
  const annualExpenses = parseFloat((annualPropertyTax + annualInsurance + annualMaintenance + managementFees).toFixed(2));
  const annualNetIncome = parseFloat((annualRent - annualExpenses).toFixed(2));

  const grossYield = parseFloat(((annualRent / propertyValue) * 100).toFixed(2));
  const netYield = parseFloat(((annualNetIncome / propertyValue) * 100).toFixed(2));

  const summary: { label: string; value: number }[] = [
    { label: 'Property Value', value: propertyValue },
    { label: 'Monthly Rent', value: monthlyRent },
    { label: 'Annual Rent', value: annualRent },
    { label: 'Annual Expenses', value: annualExpenses },
    { label: 'Annual Net Income', value: annualNetIncome },
    { label: 'Gross Yield %', value: grossYield },
    { label: 'Net Yield %', value: netYield },
  ];

  return { grossYield, netYield, annualRent, annualExpenses, annualNetIncome, summary };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'rental-yield': calculateRentalYield,
};
