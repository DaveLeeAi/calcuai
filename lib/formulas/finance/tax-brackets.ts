/**
 * Tax Bracket Calculator — 2025 U.S. Federal Income Tax Bracket Visualization
 *
 * Progressive marginal tax system:
 *   Tax = sum over brackets of: rate_i * min(taxableIncome - bracket_i_min, bracket_i_width)
 *
 * Uses the same 2025 brackets as income-tax.ts but focused on bracket
 * education and visualization rather than full return estimation.
 *
 * Source: IRS Revenue Procedure 2024-40
 */

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
    { min: 197300, max: 250500, rate: 0.32 },
    { min: 250500, max: 626350, rate: 0.35 },
    { min: 626350, max: Infinity, rate: 0.37 },
  ],
};

function formatCurrency(value: number): string {
  return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function calculateTaxBrackets(inputs: Record<string, unknown>): Record<string, unknown> {
  const taxableIncome = Math.max(0, Number(inputs.taxableIncome) || 0);
  const filingStatus = String(inputs.filingStatus || 'single');

  const brackets = BRACKETS[filingStatus] || BRACKETS.single;

  let totalTax = 0;
  let marginalBracketRate = 0.10;

  const bracketBreakdown: {
    bracket: string;
    range: string;
    taxableAmount: number;
    taxOwed: number;
  }[] = [];

  const bracketVisualization: {
    bracket: string;
    taxOwed: number;
  }[] = [];

  for (const bracket of brackets) {
    const bracketWidth = bracket.max === Infinity ? Infinity : bracket.max - bracket.min;
    const taxableInBracket = Math.max(0, Math.min(taxableIncome - bracket.min, bracketWidth));
    const taxFromBracket = taxableInBracket * bracket.rate;

    if (taxableInBracket > 0) {
      marginalBracketRate = bracket.rate;
    }

    const bracketLabel = `${(bracket.rate * 100).toFixed(0)}%`;
    const rangeLabel = bracket.max === Infinity
      ? `${formatCurrency(bracket.min)}+`
      : `${formatCurrency(bracket.min)} - ${formatCurrency(bracket.max)}`;

    bracketBreakdown.push({
      bracket: bracketLabel,
      range: rangeLabel,
      taxableAmount: parseFloat(taxableInBracket.toFixed(2)),
      taxOwed: parseFloat(taxFromBracket.toFixed(2)),
    });

    bracketVisualization.push({
      bracket: bracketLabel,
      taxOwed: parseFloat(taxFromBracket.toFixed(2)),
    });

    totalTax += taxFromBracket;
  }

  const marginalBracket = parseFloat((marginalBracketRate * 100).toFixed(2));
  const effectiveRate = taxableIncome > 0
    ? parseFloat(((totalTax / taxableIncome) * 100).toFixed(2))
    : 0;
  const totalTaxRounded = parseFloat(totalTax.toFixed(2));
  const afterTaxIncome = parseFloat((taxableIncome - totalTax).toFixed(2));

  // Summary
  const summary: { label: string; value: number | string; format?: string }[] = [
    { label: 'Taxable Income', value: parseFloat(taxableIncome.toFixed(2)), format: 'currency' },
    { label: 'Marginal Tax Bracket', value: `${marginalBracket}%` },
    { label: 'Effective Tax Rate', value: `${effectiveRate}%` },
    { label: 'Total Federal Tax', value: totalTaxRounded, format: 'currency' },
    { label: 'After-Tax Income', value: afterTaxIncome, format: 'currency' },
  ];

  return {
    marginalBracket,
    effectiveRate,
    totalTax: totalTaxRounded,
    afterTaxIncome,
    summary,
    bracketBreakdown,
    bracketVisualization,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'tax-brackets': calculateTaxBrackets,
};
