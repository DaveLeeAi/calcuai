/**
 * Net Income Calculator — Estimate annual and periodic take-home pay
 *
 * Calculates net income after federal tax, state tax, local tax,
 * Social Security, Medicare, 401(k) contributions, and health insurance.
 *
 * Formulas:
 *   Annual Gross = input gross income (converted to annual if needed)
 *   Federal Tax = Annual Gross × Federal Tax Rate
 *   State Tax = Annual Gross × State Tax Rate
 *   Local Tax = Annual Gross × Local Tax Rate
 *   Social Security = min(Annual Gross, $168,600) × SS Rate
 *   Medicare = Annual Gross × Medicare Rate
 *   401(k) = Annual Gross × Retirement %
 *   Health Insurance = Monthly Premium × 12
 *   Net Income = Annual Gross - All Deductions
 *
 * Source: IRS Publication 15-T (2025); SSA FICA wage base for 2025;
 *         Bureau of Labor Statistics — Employer Costs for Employee Compensation
 */

const SS_WAGE_BASE = 168600;

const PAY_PERIODS: Record<string, number> = {
  annual: 1,
  monthly: 12,
  biweekly: 26,
  weekly: 52,
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calculateNetIncome(inputs: Record<string, unknown>): Record<string, unknown> {
  // Parse inputs
  const grossInput = Math.max(0, Number(inputs.grossIncome) || 0);
  const payFrequency = String(inputs.payFrequency || 'annual');
  const federalTaxRate = Math.max(0, Math.min(37, Number(inputs.federalTaxRate) || 0));
  const stateTaxRate = Math.max(0, Math.min(13.3, Number(inputs.stateTaxRate) || 0));
  const localTaxRate = Math.max(0, Math.min(5, Number(inputs.localTaxRate) || 0));
  const ssRate = Math.max(0, Math.min(100, Number(inputs.socialSecurity) || 6.2));
  const medicareRate = Math.max(0, Math.min(100, Number(inputs.medicare) || 1.45));
  const retirement401kPct = Math.max(0, Math.min(100, Number(inputs.retirement401k) || 0));
  const healthInsuranceMonthly = Math.max(0, Number(inputs.healthInsurance) || 0);

  // Convert to annual
  const periods = PAY_PERIODS[payFrequency] || 1;
  const annualGross = round2(grossInput * periods);

  // Calculate each deduction (annual)
  const federalTax = round2(annualGross * (federalTaxRate / 100));
  const stateTax = round2(annualGross * (stateTaxRate / 100));
  const localTax = round2(annualGross * (localTaxRate / 100));
  const ssTax = round2(Math.min(annualGross, SS_WAGE_BASE) * (ssRate / 100));
  const medicareTax = round2(annualGross * (medicareRate / 100));
  const retirement401k = round2(annualGross * (retirement401kPct / 100));
  const healthInsuranceAnnual = round2(healthInsuranceMonthly * 12);

  // Totals
  const totalTaxes = round2(federalTax + stateTax + localTax + ssTax + medicareTax);
  const totalDeductions = round2(totalTaxes + retirement401k + healthInsuranceAnnual);

  // Net income
  const annualNet = round2(annualGross - totalDeductions);
  const monthlyNet = round2(annualNet / 12);
  const biweeklyNet = round2(annualNet / 26);
  const weeklyNet = round2(annualNet / 52);

  // Rates
  const effectiveTaxRate = annualGross > 0
    ? round2((totalTaxes / annualGross) * 100)
    : 0;
  const takeHomePercent = annualGross > 0
    ? round2((annualNet / annualGross) * 100)
    : 0;

  // Deduction breakdown value group
  const deductionBreakdown = [
    { label: 'Federal Income Tax', value: federalTax },
    { label: 'State Income Tax', value: stateTax },
    { label: 'Local Income Tax', value: localTax },
    { label: 'Social Security', value: ssTax },
    { label: 'Medicare', value: medicareTax },
    { label: '401(k) Contribution', value: retirement401k },
    { label: 'Health Insurance', value: healthInsuranceAnnual },
    { label: 'Total Deductions', value: totalDeductions },
    { label: 'Annual Net Income', value: annualNet },
  ];

  return {
    annualGross,
    annualNet,
    monthlyNet,
    biweeklyNet,
    weeklyNet,
    federalTax,
    stateTax,
    localTax,
    ssTax,
    medicareTax,
    retirement401k,
    healthInsuranceAnnual,
    totalTaxes,
    totalDeductions,
    effectiveTaxRate,
    takeHomePercent,
    deductionBreakdown,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'net-income': calculateNetIncome,
};
