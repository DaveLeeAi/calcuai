/**
 * Cap Rate Calculator — Capitalization Rate for Real Estate Investment
 *
 * Formulas:
 *   Effective Gross Income = Gross Rental Income × (1 − Vacancy Rate / 100)
 *   Total Expenses = Operating Expenses + Property Tax + Insurance + Maintenance + Management
 *   Net Operating Income (NOI) = Effective Gross Income − Total Expenses
 *   Cap Rate = (NOI / Property Value) × 100
 *   Expense Ratio = (Total Expenses / Effective Gross Income) × 100
 *   Monthly NOI = NOI / 12
 *   Gross Rent Multiplier (GRM) = Property Value / Gross Rental Income
 *
 * Source: National Association of Realtors — Real Estate Investment Analysis Standards.
 */

// ═══════════════════════════════════════════════════════
// Interfaces
// ═══════════════════════════════════════════════════════

export interface CapRateInput {
  propertyValue: number;
  grossRentalIncome: number;
  vacancyRate: number;
  operatingExpenses: number;
  propertyTax: number;
  insurance: number;
  maintenance: number;
  management: number;
}

export interface CapRateOutput {
  capRate: number;
  netOperatingIncome: number;
  effectiveGrossIncome: number;
  totalExpenses: number;
  expenseRatio: number;
  monthlyNOI: number;
  grm: number;
  summary: { label: string; value: number }[];
}

// ═══════════════════════════════════════════════════════
// Main function: Cap Rate Calculator
// ═══════════════════════════════════════════════════════

/**
 * Calculates capitalization rate, NOI, expense ratio, GRM, and monthly NOI
 * for a rental property investment.
 *
 * Cap Rate = (NOI / Property Value) × 100
 * NOI = Effective Gross Income − Total Expenses
 *
 * @param inputs - Record with propertyValue, grossRentalIncome, vacancyRate, expense fields
 * @returns Record with capRate, netOperatingIncome, effectiveGrossIncome, totalExpenses, expenseRatio, monthlyNOI, grm, summary
 */
export function calculateCapRate(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs with safe defaults
  const propertyValue = Math.max(0, Number(inputs.propertyValue) || 0);
  const grossRentalIncome = Math.max(0, Number(inputs.grossRentalIncome) || 0);
  const vacancyRate = Math.max(0, Math.min(100, Number(inputs.vacancyRate) || 0));
  const operatingExpenses = Math.max(0, Number(inputs.operatingExpenses) || 0);
  const propertyTax = Math.max(0, Number(inputs.propertyTax) || 0);
  const insurance = Math.max(0, Number(inputs.insurance) || 0);
  const maintenance = Math.max(0, Number(inputs.maintenance) || 0);
  const management = Math.max(0, Number(inputs.management) || 0);

  // 2. Calculate effective gross income (after vacancy)
  const effectiveGrossIncome = Math.round(grossRentalIncome * (1 - vacancyRate / 100) * 100) / 100;

  // 3. Calculate total expenses
  const totalExpenses = Math.round((operatingExpenses + propertyTax + insurance + maintenance + management) * 100) / 100;

  // 4. Calculate net operating income
  const netOperatingIncome = Math.round((effectiveGrossIncome - totalExpenses) * 100) / 100;

  // 5. Calculate cap rate
  const capRate = propertyValue > 0
    ? Math.round((netOperatingIncome / propertyValue) * 10000) / 100
    : 0;

  // 6. Calculate expense ratio
  const expenseRatio = effectiveGrossIncome > 0
    ? Math.round((totalExpenses / effectiveGrossIncome) * 10000) / 100
    : 0;

  // 7. Calculate monthly NOI
  const monthlyNOI = Math.round((netOperatingIncome / 12) * 100) / 100;

  // 8. Calculate gross rent multiplier
  const grm = grossRentalIncome > 0
    ? Math.round((propertyValue / grossRentalIncome) * 10) / 10
    : 0;

  // 9. Summary value group
  const summary: { label: string; value: number }[] = [
    { label: 'Cap Rate', value: capRate },
    { label: 'Net Operating Income', value: netOperatingIncome },
    { label: 'Effective Gross Income', value: effectiveGrossIncome },
    { label: 'Total Expenses', value: totalExpenses },
    { label: 'Expense Ratio', value: expenseRatio },
    { label: 'Monthly NOI', value: monthlyNOI },
    { label: 'Gross Rent Multiplier', value: grm },
  ];

  return {
    capRate,
    netOperatingIncome,
    effectiveGrossIncome,
    totalExpenses,
    expenseRatio,
    monthlyNOI,
    grm,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'cap-rate': calculateCapRate,
};
