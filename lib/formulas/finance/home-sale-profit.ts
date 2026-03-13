/**
 * Home Sale Profit Calculator
 *
 * Calculates net proceeds from selling a home after all deductions:
 * agent commission, closing costs, mortgage payoff, and capital gains tax.
 *
 * Core formulas:
 *   Agent Commission = Sale Price × (Commission Rate / 100)
 *   Closing Costs = Sale Price × (Closing Cost Rate / 100)
 *   Cost Basis = Purchase Price + Improvements
 *   Capital Gain = Sale Price - Cost Basis
 *   Section 121 Exclusion = $250K (single) or $500K (married) if owned 2+ years
 *   Taxable Gain = max(0, Capital Gain - Exclusion)
 *   Estimated Tax = Taxable Gain × tax rate (15% long-term if owned 1+ yr, 22% short-term if <1 yr)
 *   Net Proceeds = Sale Price - Commission - Closing Costs - Mortgage Balance - Tax
 *
 * Source: IRS Publication 523 — Selling Your Home;
 *         National Association of Realtors (NAR) commission data;
 *         CFPB closing cost guidelines
 */

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calculateHomeSaleProfit(inputs: Record<string, unknown>): Record<string, unknown> {
  const salePrice = Math.max(0, Number(inputs.salePrice) || 0);
  const purchasePrice = Math.max(0, Number(inputs.purchasePrice) || 0);
  const mortgageBalance = Math.max(0, Number(inputs.mortgageBalance) || 0);
  const agentCommissionRate = Math.max(0, Math.min(100, Number(inputs.agentCommissionRate) || 0));
  const closingCostRate = Math.max(0, Math.min(100, Number(inputs.closingCostRate) || 0));
  const improvementsCost = Math.max(0, Number(inputs.improvementsCost) || 0);
  const yearsOwned = Math.max(0, Number(inputs.yearsOwned) || 0);
  const filingStatus = String(inputs.filingStatus || 'single');

  // Agent commission and closing costs
  const agentCommission = round2(salePrice * (agentCommissionRate / 100));
  const closingCosts = round2(salePrice * (closingCostRate / 100));

  // Cost basis for capital gains
  const costBasis = round2(purchasePrice + improvementsCost);

  // Capital gain calculation
  const capitalGain = round2(salePrice - costBasis);

  // Section 121 exclusion: $250K single / $500K married if owned 2+ years
  let capitalGainExclusion = 0;
  if (yearsOwned >= 2) {
    capitalGainExclusion = filingStatus === 'married' ? 500000 : 250000;
  }

  // Taxable gain (only on positive gains)
  const taxableGain = round2(Math.max(0, capitalGain - capitalGainExclusion));

  // Estimated tax
  let estimatedTax = 0;
  if (taxableGain > 0) {
    if (yearsOwned < 1) {
      // Short-term: estimated ordinary income rate
      estimatedTax = round2(taxableGain * 0.22);
    } else {
      // Long-term capital gains rate (most common bracket)
      estimatedTax = round2(taxableGain * 0.15);
    }
  }

  // Gross profit (simple sale price minus purchase price)
  const grossProfit = round2(salePrice - purchasePrice);

  // Net proceeds = what the seller walks away with
  const netProceeds = round2(salePrice - agentCommission - closingCosts - mortgageBalance - estimatedTax);

  // Cost breakdown for value-group output
  const costBreakdown = [
    { label: 'Agent Commission', value: agentCommission },
    { label: 'Closing Costs', value: closingCosts },
    { label: 'Mortgage Payoff', value: mortgageBalance },
    { label: 'Estimated Tax', value: estimatedTax },
    { label: 'Total Deductions', value: round2(agentCommission + closingCosts + mortgageBalance + estimatedTax) },
  ];

  return {
    netProceeds,
    grossProfit,
    agentCommission,
    closingCosts,
    capitalGain,
    capitalGainExclusion,
    taxableGain,
    estimatedTax,
    costBreakdown,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'home-sale-profit': calculateHomeSaleProfit,
};
