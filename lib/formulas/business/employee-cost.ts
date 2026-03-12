/**
 * Employee Cost Calculator — True Cost of Employment
 *
 * Total Employee Cost = Base Salary + Benefits + Employer Taxes + Additional Costs
 *
 * Employer Taxes:
 *   Social Security (employer share) = min(Salary, $168,600) x 6.2%
 *   Medicare (employer share) = Salary x 1.45%
 *   FUTA = min(Salary, $7,000) x 0.6% (effective rate after state credit)
 *   SUTA = min(Salary, State Wage Base) x SUTA Rate%
 *
 * Benefits:
 *   Health Insurance + Retirement Match + PTO Cost + Other Benefits
 *
 * PTO Cost = (Annual Salary / 260) x PTO Days
 *
 * Cost Multiplier = Total Cost / Base Salary
 *
 * Source: Bureau of Labor Statistics (BLS) — "Employer Costs for Employee Compensation" (2024).
 */

// ===============================================
// Constants
// ===============================================

const SS_RATE = 0.062;
const SS_WAGE_CAP = 168600;
const MEDICARE_RATE = 0.0145;
const FUTA_EFFECTIVE_RATE = 0.006;
const FUTA_WAGE_BASE = 7000;
const WORKING_DAYS_PER_YEAR = 260;
const WORKING_HOURS_PER_YEAR = 2080;

// ===============================================
// Interfaces
// ===============================================

export interface EmployeeCostInput {
  annualSalary: number;
  healthInsurance: number;
  retirementMatch: number;
  paidTimeOffDays: number;
  otherBenefits: number;
  stateUnemploymentRate: number;
  stateUnemploymentWageBase: number;
}

export interface CostBreakdownSlice {
  label: string;
  value: number;
}

export interface CostDetailRow {
  item: string;
  annualCost: number;
  percentOfTotal: number;
}

export interface EmployeeCostOutput {
  totalAnnualCost: number;
  costMultiplier: number;
  employerTaxes: number;
  totalBenefits: number;
  monthlyCost: number;
  hourlyCost: number;
  socialSecurity: number;
  medicare: number;
  futa: number;
  suta: number;
  retirementMatchAmount: number;
  ptoCost: number;
  costBreakdown: CostBreakdownSlice[];
  costDetailTable: CostDetailRow[];
  summary: { label: string; value: number }[];
}

// ===============================================
// Main function: Employee Cost Calculator
// ===============================================

/**
 * Calculates the true total cost of employing a full-time worker, including
 * base salary, employer payroll taxes (SS, Medicare, FUTA, SUTA), benefits
 * (health insurance, retirement match, PTO), and additional costs.
 *
 * Total Cost = Salary + SS + Medicare + FUTA + SUTA + Health + 401k Match + PTO Cost + Other
 * Cost Multiplier = Total Cost / Salary
 * Hourly Cost = Total Cost / 2,080
 *
 * @param inputs - Record with annualSalary, healthInsurance, retirementMatch, paidTimeOffDays, otherBenefits, stateUnemploymentRate, stateUnemploymentWageBase
 * @returns Record with totalAnnualCost, costMultiplier, employerTaxes, totalBenefits, monthlyCost, hourlyCost, costBreakdown, costDetailTable, summary
 */
export function calculateEmployeeCost(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs with safe defaults
  const annualSalary = Math.max(0, Number(inputs.annualSalary) || 0);
  const healthInsurance = Math.max(0, Number(inputs.healthInsurance) || 0);
  const retirementMatchPercent = Math.max(0, Number(inputs.retirementMatch) || 0);
  const paidTimeOffDays = Math.max(0, Number(inputs.paidTimeOffDays) || 0);
  const otherBenefits = Math.max(0, Number(inputs.otherBenefits) || 0);
  const sutaRate = Math.max(0, Number(inputs.stateUnemploymentRate) || 0);
  const sutaWageBase = Math.max(0, Number(inputs.stateUnemploymentWageBase) || 0);

  // 2. Calculate employer taxes
  const ssTaxableWages = Math.min(annualSalary, SS_WAGE_CAP);
  const socialSecurity = Math.round(ssTaxableWages * SS_RATE * 100) / 100;

  const medicare = Math.round(annualSalary * MEDICARE_RATE * 100) / 100;

  const futaTaxableWages = Math.min(annualSalary, FUTA_WAGE_BASE);
  const futa = Math.round(futaTaxableWages * FUTA_EFFECTIVE_RATE * 100) / 100;

  const sutaTaxableWages = Math.min(annualSalary, sutaWageBase);
  const suta = Math.round(sutaTaxableWages * (sutaRate / 100) * 100) / 100;

  const employerTaxes = Math.round((socialSecurity + medicare + futa + suta) * 100) / 100;

  // 3. Calculate benefits
  const retirementMatchAmount = Math.round(annualSalary * (retirementMatchPercent / 100) * 100) / 100;

  const dailyRate = annualSalary > 0
    ? annualSalary / WORKING_DAYS_PER_YEAR
    : 0;
  const ptoCost = Math.round(dailyRate * paidTimeOffDays * 100) / 100;

  const totalBenefits = Math.round((healthInsurance + retirementMatchAmount + ptoCost + otherBenefits) * 100) / 100;

  // 4. Total cost
  const totalAnnualCost = Math.round((annualSalary + employerTaxes + totalBenefits) * 100) / 100;

  // 5. Derived metrics
  const costMultiplier = annualSalary > 0
    ? Math.round((totalAnnualCost / annualSalary) * 100) / 100
    : 0;
  const monthlyCost = Math.round((totalAnnualCost / 12) * 100) / 100;
  const hourlyCost = Math.round((totalAnnualCost / WORKING_HOURS_PER_YEAR) * 100) / 100;

  // 6. Cost breakdown pie chart (3 slices)
  const costBreakdown: CostBreakdownSlice[] = [
    { label: 'Base Salary', value: Math.round(annualSalary * 100) / 100 },
    { label: 'Benefits', value: totalBenefits },
    { label: 'Employer Taxes', value: employerTaxes },
  ];

  // 7. Cost detail table (every line item)
  const costItems: { item: string; annualCost: number }[] = [
    { item: 'Base Salary', annualCost: Math.round(annualSalary * 100) / 100 },
    { item: 'Social Security (6.2%)', annualCost: socialSecurity },
    { item: 'Medicare (1.45%)', annualCost: medicare },
    { item: 'FUTA', annualCost: futa },
    { item: 'SUTA', annualCost: suta },
    { item: 'Health Insurance', annualCost: Math.round(healthInsurance * 100) / 100 },
    { item: 'Retirement Match', annualCost: retirementMatchAmount },
    { item: 'PTO Cost', annualCost: ptoCost },
    { item: 'Other Benefits', annualCost: Math.round(otherBenefits * 100) / 100 },
  ];

  const costDetailTable: CostDetailRow[] = costItems.map((row) => ({
    item: row.item,
    annualCost: row.annualCost,
    percentOfTotal: totalAnnualCost > 0
      ? Math.round((row.annualCost / totalAnnualCost) * 10000) / 100
      : 0,
  }));

  // 8. Summary value group
  const summary: { label: string; value: number }[] = [
    { label: 'Total Annual Cost', value: totalAnnualCost },
    { label: 'Cost Multiplier', value: costMultiplier },
    { label: 'Employer Taxes', value: employerTaxes },
    { label: 'Total Benefits', value: totalBenefits },
    { label: 'Monthly Cost', value: monthlyCost },
    { label: 'Hourly Cost', value: hourlyCost },
  ];

  return {
    totalAnnualCost,
    costMultiplier,
    employerTaxes,
    totalBenefits,
    monthlyCost,
    hourlyCost,
    socialSecurity,
    medicare,
    futa,
    suta,
    retirementMatchAmount,
    ptoCost,
    costBreakdown,
    costDetailTable,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'employee-cost': calculateEmployeeCost,
};
