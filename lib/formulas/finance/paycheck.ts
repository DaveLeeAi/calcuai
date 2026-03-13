/**
 * Paycheck Calculator — Estimate take-home pay after federal/state tax, FICA, and deductions
 *
 * Formulas:
 *   Annual Gross = Gross Pay × Periods per Year
 *   Pre-Tax Deductions = 401(k) + Health Insurance (per paycheck)
 *   Taxable Income = (Gross Pay - Pre-Tax Deductions) × Periods per Year - Standard Deduction
 *   Federal Tax = Progressive bracket calculation / Periods per Year
 *   FICA: Social Security = 6.2% of gross (up to $176,100 annual cap)
 *         Medicare = 1.45% of gross
 *   State Tax = Taxable per paycheck × State Rate
 *   Net Pay = Gross - Federal - State - SS - Medicare - 401(k) - Health Insurance
 *
 * Source: IRS Publication 15-T (2025 Federal Income Tax Withholding Methods);
 *         SSA FICA rates for 2025; IRS Revenue Procedure 2024-40
 */

// ═══════════════════════════════════════════════════════
// Tax Bracket Definitions (2025)
// ═══════════════════════════════════════════════════════

interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

const BRACKETS: Record<string, TaxBracket[]> = {
  single: [
    { min: 0, max: 11925, rate: 0.10 },
    { min: 11925, max: 48475, rate: 0.12 },
    { min: 48475, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250525, rate: 0.32 },
    { min: 250525, max: 626350, rate: 0.35 },
    { min: 626350, max: Infinity, rate: 0.37 },
  ],
  married: [
    { min: 0, max: 23850, rate: 0.10 },
    { min: 23850, max: 96950, rate: 0.12 },
    { min: 96950, max: 206700, rate: 0.22 },
    { min: 206700, max: 394600, rate: 0.24 },
    { min: 394600, max: 501050, rate: 0.32 },
    { min: 501050, max: 751600, rate: 0.35 },
    { min: 751600, max: Infinity, rate: 0.37 },
  ],
  head: [
    { min: 0, max: 17000, rate: 0.10 },
    { min: 17000, max: 64850, rate: 0.12 },
    { min: 64850, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250525, rate: 0.32 },
    { min: 250525, max: 626350, rate: 0.35 },
    { min: 626350, max: Infinity, rate: 0.37 },
  ],
};

const STANDARD_DEDUCTIONS: Record<string, number> = {
  single: 15000,
  married: 30000,
  head: 22500,
};

const PAY_PERIODS: Record<string, number> = {
  weekly: 52,
  biweekly: 26,
  semimonthly: 24,
  monthly: 12,
};

const SS_RATE = 0.062;
const SS_WAGE_CAP = 176100;
const MEDICARE_RATE = 0.0145;

// ═══════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function calculateProgressiveTax(taxableIncome: number, brackets: TaxBracket[]): number {
  let totalTax = 0;
  for (const bracket of brackets) {
    const bracketWidth = bracket.max === Infinity ? Infinity : bracket.max - bracket.min;
    const taxableInBracket = Math.max(0, Math.min(taxableIncome - bracket.min, bracketWidth));
    totalTax += taxableInBracket * bracket.rate;
  }
  return totalTax;
}

// ═══════════════════════════════════════════════════════
// Main function: Paycheck Calculator
// ═══════════════════════════════════════════════════════

/**
 * Estimates take-home pay per paycheck after federal tax, state tax, FICA,
 * 401(k), and health insurance deductions.
 *
 * Net Pay = Gross Pay - Federal Tax - State Tax - Social Security - Medicare - 401(k) - Health Insurance
 *
 * @param inputs - Record with grossPay, payFrequency, filingStatus, stateTaxRate, retirement401k, healthInsurance
 * @returns Record with net pay, individual deductions, summary, and pie chart data
 */
export function calculatePaycheck(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs
  const grossPay = Math.max(0, Number(inputs.grossPay) || 0);
  const payFrequency = String(inputs.payFrequency || 'biweekly');
  const filingStatus = String(inputs.filingStatus || 'single');
  const stateTaxRate = Math.max(0, Math.min(15, Number(inputs.stateTaxRate) || 0));
  const retirement401kPct = Math.max(0, Math.min(100, Number(inputs.retirement401k) || 0));
  const healthInsurance = Math.max(0, Number(inputs.healthInsurance) || 0);

  // 2. Determine periods per year
  const periodsPerYear = PAY_PERIODS[payFrequency] || 26;

  // 3. Pre-tax deductions per paycheck
  const retirementDeduction = round2(grossPay * (retirement401kPct / 100));

  // 4. Annualize for federal tax calculation
  const annualGross = grossPay * periodsPerYear;
  const annualPreTaxDeductions = (retirementDeduction + healthInsurance) * periodsPerYear;
  const annualAGI = Math.max(0, annualGross - annualPreTaxDeductions);

  // 5. Apply standard deduction
  const standardDeduction = STANDARD_DEDUCTIONS[filingStatus] || STANDARD_DEDUCTIONS.single;
  const annualTaxableIncome = Math.max(0, annualAGI - standardDeduction);

  // 6. Calculate annual federal tax using progressive brackets
  const brackets = BRACKETS[filingStatus] || BRACKETS.single;
  const annualFederalTax = calculateProgressiveTax(annualTaxableIncome, brackets);

  // 7. Per-paycheck federal tax
  const federalTax = round2(annualFederalTax / periodsPerYear);

  // 8. FICA per paycheck
  // Social Security: 6.2% of gross pay, capped at annual wage base
  const annualSSWages = Math.min(annualGross, SS_WAGE_CAP);
  const annualSS = annualSSWages * SS_RATE;
  const socialSecurity = round2(annualSS / periodsPerYear);

  // Medicare: 1.45% of gross pay (no cap)
  const medicare = round2(grossPay * MEDICARE_RATE);

  // 9. State tax: applied to taxable pay per paycheck (gross - pre-tax deductions)
  const taxablePayPerCheck = Math.max(0, grossPay - retirementDeduction - healthInsurance);
  const stateTax = round2(taxablePayPerCheck * (stateTaxRate / 100));

  // 10. Net pay
  const totalDeductions = round2(federalTax + stateTax + socialSecurity + medicare + retirementDeduction + healthInsurance);
  const netPay = round2(grossPay - totalDeductions);

  // 11. Annual totals
  const annualGrossPay = round2(annualGross);
  const annualNetPay = round2(netPay * periodsPerYear);
  const annualFederalTaxTotal = round2(federalTax * periodsPerYear);
  const annualStateTax = round2(stateTax * periodsPerYear);
  const annualSocialSecurity = round2(socialSecurity * periodsPerYear);
  const annualMedicare = round2(medicare * periodsPerYear);
  const annualRetirement = round2(retirementDeduction * periodsPerYear);
  const annualHealthInsurance = round2(healthInsurance * periodsPerYear);

  // 12. Build pie chart data
  const deductionBreakdown: { name: string; value: number }[] = [
    { name: 'Take-Home', value: netPay },
    { name: 'Federal Tax', value: federalTax },
    { name: 'State Tax', value: stateTax },
    { name: 'Social Security', value: socialSecurity },
    { name: 'Medicare', value: medicare },
  ];
  if (retirementDeduction > 0) {
    deductionBreakdown.push({ name: '401(k)', value: retirementDeduction });
  }
  if (healthInsurance > 0) {
    deductionBreakdown.push({ name: 'Health Insurance', value: healthInsurance });
  }

  // 13. Build summary value group
  const summary: { label: string; value: number; format?: string }[] = [
    { label: 'Gross Pay (per paycheck)', value: grossPay, format: 'currency' },
    { label: 'Federal Income Tax', value: federalTax, format: 'currency' },
    { label: 'State Income Tax', value: stateTax, format: 'currency' },
    { label: 'Social Security (6.2%)', value: socialSecurity, format: 'currency' },
    { label: 'Medicare (1.45%)', value: medicare, format: 'currency' },
    { label: '401(k) Contribution', value: retirementDeduction, format: 'currency' },
    { label: 'Health Insurance', value: healthInsurance, format: 'currency' },
    { label: 'Total Deductions', value: totalDeductions, format: 'currency' },
    { label: 'Take-Home Pay', value: netPay, format: 'currency' },
    { label: 'Annual Gross', value: annualGrossPay, format: 'currency' },
    { label: 'Annual Take-Home', value: annualNetPay, format: 'currency' },
  ];

  return {
    netPay,
    federalTax,
    stateTax,
    socialSecurity,
    medicare,
    retirementDeduction,
    totalDeductions,
    annualGrossPay,
    annualNetPay,
    annualFederalTax: annualFederalTaxTotal,
    annualStateTax,
    annualSocialSecurity,
    annualMedicare,
    annualRetirement,
    annualHealthInsurance,
    deductionBreakdown,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'paycheck': calculatePaycheck,
};
