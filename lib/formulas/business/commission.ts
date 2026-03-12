/**
 * Commission Calculator — Flat Rate and Tiered Commission Structures
 *
 * Flat Commission:
 *   Commission = Sales Amount × Commission Rate
 *   Total Earnings = Base Pay + Commission
 *
 * Tiered Commission:
 *   Each tier applies its rate only to the portion within that bracket.
 *   Tier 1: $0 – Tier 1 Threshold at Tier 1 Rate
 *   Tier 2: Tier 1 Threshold – Tier 2 Threshold at Tier 2 Rate
 *   Tier 3: Above Tier 2 Threshold at Tier 3 Rate
 *   Commission = Sum of all tier commissions
 *
 * Effective Commission Rate = Commission / Sales Amount × 100
 *
 * Source: U.S. Bureau of Labor Statistics — "Sales Occupations" compensation structures (2024).
 */

// ═══════════════════════════════════════════════════════
// Interfaces
// ═══════════════════════════════════════════════════════

export interface CommissionInput {
  salesAmount: number;
  commissionStructure: string;
  flatRate: number;
  basePay: number;
  tier1Threshold: number;
  tier1Rate: number;
  tier2Threshold: number;
  tier2Rate: number;
  tier3Rate: number;
}

export interface TierBreakdownRow {
  tier: string;
  salesRange: string;
  rate: number;
  commissionEarned: number;
}

export interface EarningsBreakdownSegment {
  label: string;
  value: number;
}

export interface CommissionOutput {
  totalEarnings: number;
  commissionAmount: number;
  effectiveCommissionRate: number;
  earningsBreakdown: EarningsBreakdownSegment[];
  tierBreakdown: TierBreakdownRow[];
  summary: { label: string; value: number }[];
}

// ═══════════════════════════════════════════════════════
// Main function: Commission Calculator
// ═══════════════════════════════════════════════════════

/**
 * Calculates flat or tiered commission, total earnings, effective rate,
 * and generates breakdown data for visualization.
 *
 * Flat: Commission = salesAmount × (flatRate / 100)
 * Tiered: Commission = sum of (portion in each tier × tier rate)
 *
 * @param inputs - Record with salesAmount, commissionStructure, flatRate, basePay, tier thresholds and rates
 * @returns Record with totalEarnings, commissionAmount, effectiveCommissionRate, earningsBreakdown, tierBreakdown, summary
 */
export function calculateCommission(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs with safe defaults
  const salesAmount = Math.max(0, Number(inputs.salesAmount) || 0);
  const commissionStructure = String(inputs.commissionStructure || 'flat');
  const flatRate = Math.max(0, Math.min(100, Number(inputs.flatRate) || 0));
  const basePay = Math.max(0, Number(inputs.basePay) || 0);
  const tier1Threshold = Math.max(0, Number(inputs.tier1Threshold) || 0);
  const tier1Rate = Math.max(0, Math.min(100, Number(inputs.tier1Rate) || 0));
  const tier2Threshold = Math.max(tier1Threshold, Number(inputs.tier2Threshold) || 0);
  const tier2Rate = Math.max(0, Math.min(100, Number(inputs.tier2Rate) || 0));
  const tier3Rate = Math.max(0, Math.min(100, Number(inputs.tier3Rate) || 0));

  let commissionAmount = 0;
  const tierBreakdown: TierBreakdownRow[] = [];

  if (commissionStructure === 'tiered') {
    // 2a. Tiered commission calculation
    // Tier 1: $0 to tier1Threshold
    const tier1Sales = Math.min(salesAmount, tier1Threshold);
    const tier1Commission = Math.round(tier1Sales * (tier1Rate / 100) * 100) / 100;
    tierBreakdown.push({
      tier: 'Tier 1',
      salesRange: `$0 – $${tier1Threshold.toLocaleString()}`,
      rate: tier1Rate,
      commissionEarned: tier1Commission,
    });

    // Tier 2: tier1Threshold to tier2Threshold
    const tier2Sales = Math.max(0, Math.min(salesAmount, tier2Threshold) - tier1Threshold);
    const tier2Commission = Math.round(tier2Sales * (tier2Rate / 100) * 100) / 100;
    tierBreakdown.push({
      tier: 'Tier 2',
      salesRange: `$${tier1Threshold.toLocaleString()} – $${tier2Threshold.toLocaleString()}`,
      rate: tier2Rate,
      commissionEarned: tier2Commission,
    });

    // Tier 3: above tier2Threshold
    const tier3Sales = Math.max(0, salesAmount - tier2Threshold);
    const tier3Commission = Math.round(tier3Sales * (tier3Rate / 100) * 100) / 100;
    tierBreakdown.push({
      tier: 'Tier 3',
      salesRange: `$${tier2Threshold.toLocaleString()}+`,
      rate: tier3Rate,
      commissionEarned: tier3Commission,
    });

    commissionAmount = Math.round((tier1Commission + tier2Commission + tier3Commission) * 100) / 100;
  } else {
    // 2b. Flat commission calculation
    commissionAmount = Math.round(salesAmount * (flatRate / 100) * 100) / 100;
  }

  // 3. Calculate total earnings
  const totalEarnings = Math.round((basePay + commissionAmount) * 100) / 100;

  // 4. Calculate effective commission rate
  const effectiveCommissionRate = salesAmount > 0
    ? Math.round((commissionAmount / salesAmount) * 10000) / 100
    : 0;

  // 5. Earnings breakdown for pie chart
  const earningsBreakdown: EarningsBreakdownSegment[] = [
    { label: 'Base Pay', value: basePay },
    { label: 'Commission', value: commissionAmount },
  ];

  // 6. Summary value group
  const summary: { label: string; value: number }[] = [
    { label: 'Commission Amount', value: commissionAmount },
    { label: 'Base Pay', value: basePay },
    { label: 'Total Earnings', value: totalEarnings },
    { label: 'Effective Commission Rate', value: effectiveCommissionRate },
    { label: 'Sales Amount', value: salesAmount },
  ];

  return {
    totalEarnings,
    commissionAmount,
    effectiveCommissionRate,
    earningsBreakdown,
    tierBreakdown,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'commission': calculateCommission,
};
