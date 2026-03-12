/**
 * Payroll Calculator — Gross to Net Pay
 *
 * Net Pay = Gross Pay - Federal Tax - State Tax - Social Security - Medicare - Other Deductions
 * Taxable Gross = Gross Pay - Pre-Tax Deductions
 * Social Security = Taxable Gross * 6.2% (capped at $168,600 annual wage base for 2024)
 * Medicare = Taxable Gross * 1.45% (additional 0.9% on annual income over $200,000)
 * Federal Tax = Taxable Gross * Federal Tax Rate
 * State Tax = Taxable Gross * State Tax Rate
 *
 * Source: IRS Publication 15 (Circular E), Employer's Tax Guide (2024).
 */

// ===============================================
// Interfaces
// ===============================================

export interface PayrollInput {
  grossPay: number;
  payFrequency: 'weekly' | 'biweekly' | 'semi-monthly' | 'monthly';
  federalTaxRate: number;
  stateTaxRate: number;
  preTaxDeductions: number;
  postTaxDeductions: number;
}

export interface DeductionBreakdownItem {
  name: string;
  value: number;
}

export interface PayrollOutput {
  netPay: number;
  totalDeductions: number;
  effectiveTaxRate: number;
  annualGross: number;
  annualNet: number;
  federalTax: number;
  stateTax: number;
  socialSecurity: number;
  medicare: number;
  deductionBreakdown: DeductionBreakdownItem[];
  summary: { label: string; value: number }[];
}

// ===============================================
// Constants
// ===============================================

const SS_RATE = 0.062;
const SS_WAGE_BASE = 168600;
const MEDICARE_RATE = 0.0145;
const MEDICARE_ADDITIONAL_RATE = 0.009;
const MEDICARE_ADDITIONAL_THRESHOLD = 200000;

const PAY_PERIODS: Record<string, number> = {
  weekly: 52,
  biweekly: 26,
  'semi-monthly': 24,
  monthly: 12,
};

// ===============================================
// Main function: Payroll Calculator
// ===============================================

/**
 * Calculates net pay from gross pay after federal tax, state tax,
 * Social Security, Medicare, and other deductions.
 *
 * Net Pay = Gross - Federal Tax - State Tax - SS - Medicare - Pre-Tax Ded. - Post-Tax Ded.
 *
 * Taxable income for federal/state tax is reduced by pre-tax deductions (401k, health insurance).
 * Social Security is capped at $168,600 annual wage base (2024).
 * Medicare has an additional 0.9% surtax on income over $200,000/year.
 *
 * @param inputs - Record with grossPay, payFrequency, federalTaxRate, stateTaxRate, preTaxDeductions, postTaxDeductions
 * @returns Record with netPay, totalDeductions, effectiveTaxRate, annualGross, annualNet, deductionBreakdown, summary
 */
export function calculatePayroll(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs with safe defaults
  const grossPay = Math.max(0, Number(inputs.grossPay) || 0);
  const payFrequency = (inputs.payFrequency as string) || 'biweekly';
  const federalTaxRate = Math.max(0, Math.min(100, Number(inputs.federalTaxRate) || 0));
  const stateTaxRate = Math.max(0, Math.min(100, Number(inputs.stateTaxRate) || 0));
  const preTaxDeductions = Math.max(0, Number(inputs.preTaxDeductions) || 0);
  const postTaxDeductions = Math.max(0, Number(inputs.postTaxDeductions) || 0);

  // 2. Determine pay periods per year
  const periodsPerYear = PAY_PERIODS[payFrequency] || 26;

  // 3. Calculate annual gross
  const annualGross = Math.round(grossPay * periodsPerYear * 100) / 100;

  // 4. Calculate taxable gross (pre-tax deductions reduce taxable income)
  const taxableGross = Math.max(0, grossPay - preTaxDeductions);

  // 5. Calculate federal and state taxes (per pay period)
  const federalTax = Math.round(taxableGross * (federalTaxRate / 100) * 100) / 100;
  const stateTax = Math.round(taxableGross * (stateTaxRate / 100) * 100) / 100;

  // 6. Calculate Social Security (6.2%, capped at annual wage base)
  const annualTaxableGross = taxableGross * periodsPerYear;
  const ssWageBasePerPeriod = SS_WAGE_BASE / periodsPerYear;
  const ssTaxableAmount = Math.min(taxableGross, ssWageBasePerPeriod);
  // If annual taxable exceeds the cap, prorate the cap across periods
  let socialSecurity: number;
  if (annualTaxableGross <= SS_WAGE_BASE) {
    socialSecurity = Math.round(taxableGross * SS_RATE * 100) / 100;
  } else {
    // Pro-rate: only tax up to the cap portion per period
    const cappedPerPeriod = SS_WAGE_BASE / periodsPerYear;
    socialSecurity = Math.round(Math.min(taxableGross, cappedPerPeriod) * SS_RATE * 100) / 100;
  }

  // 7. Calculate Medicare (1.45% + additional 0.9% over $200k annual)
  let medicare = Math.round(taxableGross * MEDICARE_RATE * 100) / 100;

  // Additional Medicare tax: 0.9% on income over $200,000 annually
  if (annualTaxableGross > MEDICARE_ADDITIONAL_THRESHOLD) {
    const additionalThresholdPerPeriod = MEDICARE_ADDITIONAL_THRESHOLD / periodsPerYear;
    const additionalTaxableAmount = Math.max(0, taxableGross - additionalThresholdPerPeriod);
    const additionalMedicare = Math.round(additionalTaxableAmount * MEDICARE_ADDITIONAL_RATE * 100) / 100;
    medicare = Math.round((medicare + additionalMedicare) * 100) / 100;
  }

  // 8. Calculate total deductions and net pay
  const totalDeductions = Math.round(
    (federalTax + stateTax + socialSecurity + medicare + preTaxDeductions + postTaxDeductions) * 100
  ) / 100;
  const netPay = Math.round((grossPay - totalDeductions) * 100) / 100;

  // 9. Calculate annual net
  const annualNet = Math.round(netPay * periodsPerYear * 100) / 100;

  // 10. Calculate effective tax rate (total deductions as % of gross)
  const effectiveTaxRate = grossPay > 0
    ? Math.round((totalDeductions / grossPay) * 10000) / 100
    : 0;

  // 11. Build deduction breakdown for pie chart
  const deductionBreakdown: DeductionBreakdownItem[] = [
    { name: 'Federal Tax', value: Math.round(federalTax * 100) / 100 },
    { name: 'State Tax', value: Math.round(stateTax * 100) / 100 },
    { name: 'Social Security', value: socialSecurity },
    { name: 'Medicare', value: medicare },
    { name: 'Pre-Tax Deductions', value: Math.round(preTaxDeductions * 100) / 100 },
    { name: 'Post-Tax Deductions', value: Math.round(postTaxDeductions * 100) / 100 },
    { name: 'Take-Home Pay', value: Math.max(0, Math.round(netPay * 100) / 100) },
  ];

  // 12. Summary value group
  const summary: { label: string; value: number }[] = [
    { label: 'Gross Pay', value: Math.round(grossPay * 100) / 100 },
    { label: 'Federal Tax', value: federalTax },
    { label: 'State Tax', value: stateTax },
    { label: 'Social Security', value: socialSecurity },
    { label: 'Medicare', value: medicare },
    { label: 'Pre-Tax Deductions', value: Math.round(preTaxDeductions * 100) / 100 },
    { label: 'Post-Tax Deductions', value: Math.round(postTaxDeductions * 100) / 100 },
    { label: 'Net Pay', value: netPay },
  ];

  return {
    netPay,
    totalDeductions,
    effectiveTaxRate,
    annualGross,
    annualNet,
    federalTax,
    stateTax,
    socialSecurity,
    medicare,
    deductionBreakdown,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'payroll': calculatePayroll,
};
