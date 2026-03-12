export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

export interface BracketBreakdownRow {
  bracket: string;
  range: string;
  taxableInBracket: number;
  taxFromBracket: number;
}

export interface IncomeTaxOutput {
  federalTax: number;
  effectiveRate: number;
  marginalRate: number;
  afterTaxIncome: number;
  summary: { label: string; value: number; format?: string }[];
  bracketBreakdown: BracketBreakdownRow[];
  taxBreakdown: { name: string; value: number }[];
  marginalRateChart: { bracket: string; amount: number }[];
}

/**
 * 2025 U.S. Federal Income Tax Brackets (Progressive Marginal Rate System)
 *
 * Tax = sum over brackets of: rate_i * min(taxableIncome - bracket_i_min, bracket_i_max - bracket_i_min)
 *
 * Source: IRS Revenue Procedure 2024-40
 */

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
    { min: 197300, max: 250500, rate: 0.32 },
    { min: 250500, max: 626350, rate: 0.35 },
    { min: 626350, max: Infinity, rate: 0.37 },
  ],
};

const STANDARD_DEDUCTIONS: Record<string, number> = {
  single: 15000,
  'married-jointly': 30000,
  'married-separately': 15000,
  'head-of-household': 22500,
};

function formatCurrency(value: number): string {
  return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function getBracketLabel(rate: number): string {
  return `${(rate * 100).toFixed(0)}%`;
}

function getBracketRange(bracket: TaxBracket): string {
  if (bracket.max === Infinity) {
    return `${formatCurrency(bracket.min)}+`;
  }
  return `${formatCurrency(bracket.min)} – ${formatCurrency(bracket.max)}`;
}

export function calculateIncomeTax(inputs: Record<string, unknown>): Record<string, unknown> {
  const grossIncome = Math.max(0, Number(inputs.grossIncome) || 0);
  const filingStatus = String(inputs.filingStatus || 'single');
  const deductionType = String(inputs.deductionType || 'standard');
  const itemizedDeductions = Math.max(0, Number(inputs.itemizedDeductions) || 0);
  const preTaxDeductions = Math.max(0, Number(inputs.preTaxDeductions) || 0);
  const taxCredits = Math.max(0, Number(inputs.taxCredits) || 0);

  // Step 1: Get brackets and standard deduction for filing status
  const brackets = BRACKETS[filingStatus] || BRACKETS.single;
  const standardDeduction = STANDARD_DEDUCTIONS[filingStatus] || STANDARD_DEDUCTIONS.single;

  // Step 2: Calculate adjusted gross income (after pre-tax deductions)
  const adjustedGrossIncome = Math.max(0, grossIncome - preTaxDeductions);

  // Step 3: Apply deduction (standard or itemized)
  const deductionAmount = deductionType === 'itemized' ? itemizedDeductions : standardDeduction;
  const taxableIncome = Math.max(0, adjustedGrossIncome - deductionAmount);

  // Step 4: Apply progressive brackets to taxable income
  let totalTax = 0;
  let marginalRate = 0.10; // Default to lowest bracket
  const bracketBreakdown: BracketBreakdownRow[] = [];
  const marginalRateChart: { bracket: string; amount: number }[] = [];

  for (const bracket of brackets) {
    const bracketWidth = bracket.max === Infinity
      ? Infinity
      : bracket.max - bracket.min;

    const taxableInBracket = Math.max(0, Math.min(
      taxableIncome - bracket.min,
      bracketWidth
    ));

    const taxFromBracket = taxableInBracket * bracket.rate;

    if (taxableInBracket > 0) {
      marginalRate = bracket.rate;
    }

    bracketBreakdown.push({
      bracket: getBracketLabel(bracket.rate),
      range: getBracketRange(bracket),
      taxableInBracket: parseFloat(taxableInBracket.toFixed(2)),
      taxFromBracket: parseFloat(taxFromBracket.toFixed(2)),
    });

    marginalRateChart.push({
      bracket: getBracketLabel(bracket.rate),
      amount: parseFloat(taxFromBracket.toFixed(2)),
    });

    totalTax += taxFromBracket;
  }

  // Step 5: Apply tax credits (floor at $0)
  const federalTax = parseFloat(Math.max(0, totalTax - taxCredits).toFixed(2));

  // Step 6: Calculate rates
  const effectiveRate = grossIncome > 0
    ? parseFloat(((federalTax / grossIncome) * 100).toFixed(2))
    : 0;
  const marginalRatePercent = parseFloat((marginalRate * 100).toFixed(2));

  // Step 7: After-tax income
  const afterTaxIncome = parseFloat((grossIncome - federalTax - preTaxDeductions).toFixed(2));

  // Build summary value group
  const summary = [
    { label: 'Gross Income', value: parseFloat(grossIncome.toFixed(2)), format: 'currency' },
    { label: 'Taxable Income', value: parseFloat(taxableIncome.toFixed(2)), format: 'currency' },
    { label: 'Federal Tax', value: federalTax, format: 'currency' },
    { label: 'Effective Rate', value: effectiveRate, format: 'percentage' },
    { label: 'Marginal Rate', value: marginalRatePercent, format: 'percentage' },
    { label: 'After-Tax Income', value: afterTaxIncome, format: 'currency' },
  ];

  // Build pie chart data
  const taxBreakdown: { name: string; value: number }[] = [
    { name: 'Federal Tax', value: federalTax },
    { name: 'After-Tax Income', value: parseFloat(Math.max(0, grossIncome - federalTax - preTaxDeductions).toFixed(2)) },
  ];
  if (preTaxDeductions > 0) {
    taxBreakdown.push({ name: 'Pre-Tax Deductions', value: parseFloat(preTaxDeductions.toFixed(2)) });
  }

  return {
    federalTax,
    effectiveRate,
    marginalRate: marginalRatePercent,
    afterTaxIncome,
    summary,
    bracketBreakdown,
    taxBreakdown,
    marginalRateChart,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'income-tax': calculateIncomeTax,
};
