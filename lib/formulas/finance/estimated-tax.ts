/**
 * Estimated Tax Calculator — Quarterly Estimated Tax Payments for Freelancers & Investors
 *
 * Formulas:
 *   Deduction = Standard Deduction (by filing status) OR Itemized Amount
 *   SE Tax = selfEmploymentIncome × 0.9235 × 0.153 (simplified)
 *   SE Tax Deduction = SE Tax × 0.5
 *   Taxable Income = Annual Income − Deduction − SE Tax Deduction
 *   Federal Income Tax = Progressive brackets (2025)
 *   Total Tax = Income Tax + SE Tax
 *   Total Owed = Total Tax − Tax Withheld − Amount Paid
 *   Quarterly Payment = max(0, Total Owed / (4 − Quarters Paid))
 *   Safe Harbor (90%) = Total Tax × 0.90 / 4
 *   Penalty Risk: High if owed > $1,000 and no safe harbor
 *
 * Source: IRS Form 1040-ES — Estimated Tax for Individuals (2025);
 *         IRS Publication 505 — Tax Withholding and Estimated Tax.
 */

// ═══════════════════════════════════════════════════════
// Constants (2025 Tax Year)
// ═══════════════════════════════════════════════════════

const SE_ADJUSTMENT = 0.9235;
const SE_RATE = 0.153; // combined 12.4% SS + 2.9% Medicare (simplified)

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

const QUARTERLY_DUE_DATES = [
  { quarter: 'Q1', period: 'Jan 1 – Mar 31', dueDate: 'April 15' },
  { quarter: 'Q2', period: 'Apr 1 – May 31', dueDate: 'June 15' },
  { quarter: 'Q3', period: 'Jun 1 – Aug 31', dueDate: 'September 15' },
  { quarter: 'Q4', period: 'Sep 1 – Dec 31', dueDate: 'January 15' },
];

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
// Main function: Estimated Tax Calculator
// ═══════════════════════════════════════════════════════

/**
 * Calculates quarterly estimated tax payments for freelancers, self-employed,
 * and investors based on income, filing status, deductions, and payments made.
 *
 * Quarterly Payment = max(0, (Total Tax − Withheld − Paid) / (4 − Quarters Paid))
 *
 * @param inputs - Record with annualIncome, incomeType, filingStatus, taxWithheld,
 *                 deductions, itemizedAmount, selfEmploymentIncome, quartersPaid, amountPaid
 * @returns Record with totalTaxLiability, quarterlyPayment, breakdown, schedule, penalty risk
 */
export function calculateEstimatedTax(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs with safe defaults
  const annualIncome = Math.max(0, Number(inputs.annualIncome) || 0);
  const incomeType = String(inputs.incomeType || 'self-employment');
  const filingStatus = String(inputs.filingStatus || 'single');
  const taxWithheld = Math.max(0, Number(inputs.taxWithheld) || 0);
  const deductions = String(inputs.deductions || 'standard');
  const itemizedAmount = Math.max(0, Number(inputs.itemizedAmount) || 0);
  const selfEmploymentIncome = Math.max(0, Number(inputs.selfEmploymentIncome) || 0);
  const quartersPaid = Math.max(0, Math.min(3, Math.floor(Number(inputs.quartersPaid) || 0)));
  const amountPaid = Math.max(0, Number(inputs.amountPaid) || 0);

  // 2. Calculate deduction
  const standardDeduction = STANDARD_DEDUCTIONS[filingStatus] ?? STANDARD_DEDUCTIONS.single;
  const deductionAmount = deductions === 'itemized' ? itemizedAmount : standardDeduction;

  // 3. Calculate SE tax if applicable
  const hasSE = incomeType === 'self-employment' || incomeType === 'mixed';
  const seIncome = hasSE ? selfEmploymentIncome : 0;
  const taxableSEIncome = round2(seIncome * SE_ADJUSTMENT);
  const selfEmploymentTax = round2(taxableSEIncome * SE_RATE);
  const seTaxDeduction = round2(selfEmploymentTax * 0.5);

  // 4. Calculate taxable income
  const taxableIncome = Math.max(0, round2(annualIncome - deductionAmount - seTaxDeduction));

  // 5. Calculate federal income tax using progressive brackets
  const brackets = BRACKETS[filingStatus] ?? BRACKETS.single;
  const federalIncomeTax = round2(calculateProgressiveTax(taxableIncome, brackets));

  // 6. Total tax liability
  const totalTaxLiability = round2(federalIncomeTax + selfEmploymentTax);

  // 7. Total owed after withholding and payments
  const totalOwed = round2(totalTaxLiability - taxWithheld - amountPaid);

  // 8. Quarterly payment for remaining quarters
  const remainingQuarters = Math.max(1, 4 - quartersPaid);
  const quarterlyPayment = round2(Math.max(0, totalOwed / remainingQuarters));

  // 9. Effective rate
  const effectiveRate = annualIncome > 0
    ? round2((totalTaxLiability / annualIncome) * 100)
    : 0;

  // 10. Safe harbor: 90% of current year / 4
  const safeHarbor90 = round2((totalTaxLiability * 0.90) / 4);

  // 11. Penalty risk assessment
  let penaltyRisk: string;
  if (totalOwed <= 1000) {
    penaltyRisk = 'Low';
  } else if (totalOwed <= 5000) {
    penaltyRisk = 'Moderate';
  } else {
    penaltyRisk = 'High';
  }

  // 12. Quarterly schedule value group
  const quarterlySchedule: { label: string; value: string }[] = QUARTERLY_DUE_DATES.map((q) => ({
    label: `${q.quarter} (${q.period})`,
    value: `${q.dueDate} — $${quarterlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
  }));

  // 13. Tax breakdown value group
  const taxBreakdown: { label: string; value: number }[] = [
    { label: 'Federal Income Tax', value: federalIncomeTax },
    { label: 'Self-Employment Tax', value: selfEmploymentTax },
    { label: 'Total Tax Liability', value: totalTaxLiability },
    { label: 'Tax Withheld (W-2)', value: taxWithheld },
    { label: 'Estimated Tax Paid', value: amountPaid },
    { label: 'Remaining Owed', value: Math.max(0, totalOwed) },
  ];

  // Tax breakdown chart — {name, value}[] for pie chart rendering
  const taxBreakdownChart = [
    { name: 'Federal Income Tax', value: federalIncomeTax },
    { name: 'Self-Employment Tax', value: selfEmploymentTax },
  ].filter(item => item.value > 0);

  return {
    totalTaxLiability,
    quarterlyPayment,
    totalOwed,
    effectiveRate,
    selfEmploymentTax,
    federalIncomeTax,
    safeHarbor90,
    penaltyRisk,
    quarterlySchedule,
    taxBreakdown,
    taxableIncome,
    seTaxDeduction,
    taxBreakdownChart,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'estimated-tax': calculateEstimatedTax,
};
