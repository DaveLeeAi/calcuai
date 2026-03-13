/**
 * Capital Gains Tax Calculator — Estimate federal capital gains tax on investment sales
 *
 * Formulas:
 *   Capital Gain = Sale Price - Purchase Price
 *   Short-term: taxed as ordinary income using progressive brackets
 *   Long-term: taxed at 0%, 15%, or 20% depending on total taxable income
 *   Effective Rate = Tax Owed / Capital Gain × 100
 *   Net Proceeds = Sale Price - Tax Owed
 *
 * Source: IRS Topic No. 409 — Capital Gains and Losses;
 *         IRS Revenue Procedure 2024-40 (2025 bracket thresholds)
 */

// ═══════════════════════════════════════════════════════
// Tax Bracket Definitions (2025)
// ═══════════════════════════════════════════════════════

interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

// Ordinary income brackets for short-term gains
const ORDINARY_BRACKETS: Record<string, TaxBracket[]> = {
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

// Long-term capital gains brackets (2025)
const LTCG_BRACKETS: Record<string, TaxBracket[]> = {
  single: [
    { min: 0, max: 48350, rate: 0.00 },
    { min: 48350, max: 533400, rate: 0.15 },
    { min: 533400, max: Infinity, rate: 0.20 },
  ],
  married: [
    { min: 0, max: 96700, rate: 0.00 },
    { min: 96700, max: 600050, rate: 0.15 },
    { min: 600050, max: Infinity, rate: 0.20 },
  ],
  head: [
    { min: 0, max: 64750, rate: 0.00 },
    { min: 64750, max: 566700, rate: 0.15 },
    { min: 566700, max: Infinity, rate: 0.20 },
  ],
};

const STANDARD_DEDUCTIONS: Record<string, number> = {
  single: 15000,
  married: 30000,
  head: 22500,
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
// Main function: Capital Gains Tax Calculator
// ═══════════════════════════════════════════════════════

/**
 * Calculates estimated federal capital gains tax on the sale of an asset.
 *
 * Short-term gains are taxed as ordinary income.
 * Long-term gains use preferential 0%/15%/20% brackets based on total taxable income.
 *
 * Capital Gain = Sale Price - Purchase Price
 * Effective Rate = Tax Owed / Capital Gain × 100
 * Net Proceeds = Sale Price - Tax Owed
 *
 * @param inputs - Record with purchasePrice, salePrice, holdingPeriod, annualIncome, filingStatus
 * @returns Record with taxOwed, capitalGain, effectiveRate, netProceeds, summary, pie chart
 */
export function calculateCapitalGainsTax(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs
  const purchasePrice = Math.max(0, Number(inputs.purchasePrice) || 0);
  const salePrice = Math.max(0, Number(inputs.salePrice) || 0);
  const holdingPeriod = String(inputs.holdingPeriod || 'long');
  const annualIncome = Math.max(0, Number(inputs.annualIncome) || 0);
  const filingStatus = String(inputs.filingStatus || 'single');

  // 2. Calculate capital gain
  const capitalGain = round2(salePrice - purchasePrice);

  // 3. If no gain or a loss, no tax
  if (capitalGain <= 0) {
    const summary: { label: string; value: number; format?: string }[] = [
      { label: 'Purchase Price', value: purchasePrice, format: 'currency' },
      { label: 'Sale Price', value: salePrice, format: 'currency' },
      { label: 'Capital Gain', value: capitalGain, format: 'currency' },
      { label: 'Tax Owed', value: 0, format: 'currency' },
      { label: 'Effective Tax Rate', value: 0, format: 'percentage' },
      { label: 'Net Proceeds', value: salePrice, format: 'currency' },
    ];

    const taxBreakdown: { name: string; value: number }[] = [
      { name: 'Net Proceeds', value: salePrice },
      { name: 'Tax Owed', value: 0 },
      { name: 'Cost Basis', value: purchasePrice },
    ];

    return {
      taxOwed: 0,
      capitalGain,
      effectiveRate: 0,
      netProceeds: salePrice,
      taxBreakdown,
      summary,
    };
  }

  // 4. Get standard deduction
  const standardDeduction = STANDARD_DEDUCTIONS[filingStatus] || STANDARD_DEDUCTIONS.single;

  let taxOwed: number;

  if (holdingPeriod === 'short') {
    // Short-term: taxed as ordinary income
    // Tax on (income + gain) minus tax on (income alone) = incremental tax from gain
    const brackets = ORDINARY_BRACKETS[filingStatus] || ORDINARY_BRACKETS.single;

    const taxableWithoutGain = Math.max(0, annualIncome - standardDeduction);
    const taxableWithGain = Math.max(0, annualIncome + capitalGain - standardDeduction);

    const taxWithGain = calculateProgressiveTax(taxableWithGain, brackets);
    const taxWithout = calculateProgressiveTax(taxableWithoutGain, brackets);

    taxOwed = round2(taxWithGain - taxWithout);
  } else {
    // Long-term: use LTCG brackets
    // LTCG brackets apply based on total taxable income (ordinary + gains)
    const ltcgBrackets = LTCG_BRACKETS[filingStatus] || LTCG_BRACKETS.single;

    // Taxable ordinary income determines starting point in LTCG brackets
    const taxableOrdinaryIncome = Math.max(0, annualIncome - standardDeduction);

    // The gain "stacks on top" of ordinary income for LTCG bracket purposes
    // Tax = LTCG tax on (ordinary + gain) - LTCG tax on (ordinary alone)
    const ltcgTaxTotal = calculateProgressiveTax(taxableOrdinaryIncome + capitalGain, ltcgBrackets);
    const ltcgTaxBase = calculateProgressiveTax(taxableOrdinaryIncome, ltcgBrackets);

    taxOwed = round2(ltcgTaxTotal - ltcgTaxBase);
  }

  // 5. Effective rate and net proceeds
  const effectiveRate = capitalGain > 0
    ? round2((taxOwed / capitalGain) * 100)
    : 0;
  const netProceeds = round2(salePrice - taxOwed);

  // 6. Build pie chart data
  const taxBreakdown: { name: string; value: number }[] = [
    { name: 'Net Proceeds', value: netProceeds },
    { name: 'Tax Owed', value: taxOwed },
    { name: 'Cost Basis', value: purchasePrice },
  ];

  // 7. Build summary value group
  const summary: { label: string; value: number; format?: string }[] = [
    { label: 'Purchase Price (Cost Basis)', value: purchasePrice, format: 'currency' },
    { label: 'Sale Price', value: salePrice, format: 'currency' },
    { label: 'Capital Gain', value: capitalGain, format: 'currency' },
    { label: 'Holding Period', value: holdingPeriod === 'long' ? 1 : 0, format: 'text' },
    { label: 'Tax Owed', value: taxOwed, format: 'currency' },
    { label: 'Effective Tax Rate', value: effectiveRate, format: 'percentage' },
    { label: 'Net Proceeds', value: netProceeds, format: 'currency' },
  ];

  return {
    taxOwed,
    capitalGain,
    effectiveRate,
    netProceeds,
    taxBreakdown,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'capital-gains-tax': calculateCapitalGainsTax,
};
