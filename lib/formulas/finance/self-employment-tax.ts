/**
 * Self-Employment Tax Calculator — Estimate SE tax (Social Security + Medicare) for freelancers and 1099 contractors
 *
 * Formulas:
 *   Net SE Income = Net Earnings - Business Expenses
 *   Taxable SE Income = Net SE Income × 0.9235 (92.35% IRS adjustment)
 *   Social Security Tax = min(Taxable SE Income, $168,600 - Other Income) × 12.4%
 *   Medicare Tax = Taxable SE Income × 2.9%
 *   Additional Medicare Tax = max(0, Total Income - Threshold) × 0.9%
 *   Total SE Tax = SS Tax + Medicare Tax + Additional Medicare Tax
 *   SE Tax Deduction = Total SE Tax × 50%
 *   Quarterly Estimate = Total Tax Liability / 4
 *
 * Source: IRS Publication 334 — Tax Guide for Small Business;
 *         IRS Schedule SE (Form 1040);
 *         SSA 2025 wage base: $168,600
 */

// ═══════════════════════════════════════════════════════
// Constants (2025 Tax Year)
// ═══════════════════════════════════════════════════════

const SE_ADJUSTMENT = 0.9235; // 92.35% of net SE income is taxable
const SS_RATE = 0.124;        // 12.4% Social Security (employer + employee share)
const MEDICARE_RATE = 0.029;  // 2.9% Medicare (employer + employee share)
const ADDITIONAL_MEDICARE_RATE = 0.009; // 0.9% Additional Medicare Tax
const SS_WAGE_BASE_2025 = 168600;

const ADDITIONAL_MEDICARE_THRESHOLDS: Record<string, number> = {
  single: 200000,
  'married-jointly': 250000,
  'married-separately': 125000,
  'head-of-household': 200000,
};

// ═══════════════════════════════════════════════════════
// Federal Income Tax Brackets (2025)
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
  'married-jointly': [
    { min: 0, max: 23850, rate: 0.10 },
    { min: 23850, max: 96950, rate: 0.12 },
    { min: 96950, max: 206700, rate: 0.22 },
    { min: 206700, max: 394600, rate: 0.24 },
    { min: 394600, max: 501050, rate: 0.32 },
    { min: 501050, max: 751600, rate: 0.35 },
    { min: 751600, max: Infinity, rate: 0.37 },
  ],
  'married-separately': [
    { min: 0, max: 11925, rate: 0.10 },
    { min: 11925, max: 48475, rate: 0.12 },
    { min: 48475, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250525, rate: 0.32 },
    { min: 250525, max: 626350, rate: 0.35 },
    { min: 626350, max: Infinity, rate: 0.37 },
  ],
  'head-of-household': [
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
  'married-jointly': 30000,
  'married-separately': 15000,
  'head-of-household': 22500,
};

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
// Main function: Self-Employment Tax Calculator
// ═══════════════════════════════════════════════════════

/**
 * Calculates self-employment tax (Social Security + Medicare) for freelancers
 * and independent contractors, plus estimated income tax and quarterly payments.
 *
 * SE Tax = (Net SE Income × 0.9235) × (12.4% SS + 2.9% Medicare) + Additional Medicare
 * SE Tax Deduction = SE Tax × 50%
 * Quarterly Estimate = Total Tax Liability / 4
 *
 * @param inputs - Record with netEarnings, filingStatus, otherIncome, businessExpenses, quarterlyPayments
 * @returns Record with SE tax components, income tax estimate, quarterly payments, and breakdown
 */
export function calculateSelfEmploymentTax(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs
  const netEarnings = Math.max(0, Number(inputs.netEarnings) || 0);
  const filingStatus = String(inputs.filingStatus || 'single');
  const otherIncome = Math.max(0, Number(inputs.otherIncome) || 0);
  const businessExpenses = Math.max(0, Number(inputs.businessExpenses) || 0);
  const quarterlyPayments = Math.max(0, Number(inputs.quarterlyPayments) || 0);

  // 2. Calculate net SE income after additional business expenses
  const netSEIncome = Math.max(0, netEarnings - businessExpenses);

  // 3. Apply the 92.35% IRS adjustment
  const taxableSEIncome = round2(netSEIncome * SE_ADJUSTMENT);

  // 4. Social Security tax — 12.4% up to wage base, reduced by other W-2 income
  const remainingSSWageBase = Math.max(0, SS_WAGE_BASE_2025 - otherIncome);
  const ssTaxableIncome = Math.min(taxableSEIncome, remainingSSWageBase);
  const socialSecurityTax = round2(ssTaxableIncome * SS_RATE);

  // 5. Medicare tax — 2.9% on all taxable SE income (no cap)
  const medicareTax = round2(taxableSEIncome * MEDICARE_RATE);

  // 6. Additional Medicare tax — 0.9% on combined income above threshold
  const additionalMedicareThreshold = ADDITIONAL_MEDICARE_THRESHOLDS[filingStatus]
    || ADDITIONAL_MEDICARE_THRESHOLDS.single;
  const totalIncome = netSEIncome + otherIncome;
  const additionalMedicareTax = round2(
    Math.max(0, totalIncome - additionalMedicareThreshold) * ADDITIONAL_MEDICARE_RATE
  );

  // 7. Total SE tax
  const selfEmploymentTax = round2(socialSecurityTax + medicareTax + additionalMedicareTax);

  // 8. SE tax deduction (deductible half)
  const seTaxDeduction = round2(selfEmploymentTax * 0.5);

  // 9. Estimated income tax (simplified — using standard deduction)
  const standardDeduction = STANDARD_DEDUCTIONS[filingStatus] || STANDARD_DEDUCTIONS.single;
  const brackets = BRACKETS[filingStatus] || BRACKETS.single;

  // AGI = total income - SE tax deduction (the deductible half is an above-the-line deduction)
  const adjustedGrossIncome = Math.max(0, totalIncome - seTaxDeduction);
  const taxableIncome = Math.max(0, adjustedGrossIncome - standardDeduction);
  const estimatedIncomeTax = round2(calculateProgressiveTax(taxableIncome, brackets));

  // 10. Total tax liability
  const totalTaxLiability = round2(selfEmploymentTax + estimatedIncomeTax);

  // 11. Effective rates
  const effectiveSERate = netEarnings > 0
    ? round2((selfEmploymentTax / netEarnings) * 100)
    : 0;
  const effectiveTotalRate = netEarnings > 0
    ? round2((totalTaxLiability / netEarnings) * 100)
    : 0;

  // 12. Quarterly estimate and remaining due
  const quarterlyEstimate = round2(totalTaxLiability / 4);
  const remainingDue = round2(Math.max(0, totalTaxLiability - quarterlyPayments));

  // 13. Build tax breakdown (pie chart data)
  const taxBreakdown: { name: string; value: number }[] = [
    { name: 'Social Security Tax', value: socialSecurityTax },
    { name: 'Medicare Tax', value: medicareTax },
  ];
  if (additionalMedicareTax > 0) {
    taxBreakdown.push({ name: 'Additional Medicare Tax', value: additionalMedicareTax });
  }
  taxBreakdown.push({ name: 'Income Tax', value: estimatedIncomeTax });

  // 14. Build summary value group
  const summary: { label: string; value: number; format?: string }[] = [
    { label: 'Net SE Income', value: netSEIncome, format: 'currency' },
    { label: 'Taxable SE Income (92.35%)', value: taxableSEIncome, format: 'currency' },
    { label: 'Social Security Tax (12.4%)', value: socialSecurityTax, format: 'currency' },
    { label: 'Medicare Tax (2.9%)', value: medicareTax, format: 'currency' },
    { label: 'Additional Medicare Tax (0.9%)', value: additionalMedicareTax, format: 'currency' },
    { label: 'Total SE Tax', value: selfEmploymentTax, format: 'currency' },
    { label: 'SE Tax Deduction (50%)', value: seTaxDeduction, format: 'currency' },
    { label: 'Taxable Income', value: taxableIncome, format: 'currency' },
    { label: 'Estimated Income Tax', value: estimatedIncomeTax, format: 'currency' },
    { label: 'Total Tax Liability', value: totalTaxLiability, format: 'currency' },
    { label: 'Effective SE Rate', value: effectiveSERate, format: 'percentage' },
    { label: 'Effective Total Rate', value: effectiveTotalRate, format: 'percentage' },
    { label: 'Quarterly Estimate', value: quarterlyEstimate, format: 'currency' },
    { label: 'Remaining Due', value: remainingDue, format: 'currency' },
  ];

  return {
    selfEmploymentTax,
    socialSecurityTax,
    medicareTax,
    additionalMedicareTax,
    seTaxDeduction,
    taxableIncome,
    estimatedIncomeTax,
    totalTaxLiability,
    effectiveSERate,
    effectiveTotalRate,
    quarterlyEstimate,
    remainingDue,
    taxBreakdown,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'self-employment-tax': calculateSelfEmploymentTax,
};
