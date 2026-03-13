/**
 * Real Estate Commission Calculator
 *
 * Calculates total agent commission, buyer/seller agent splits,
 * agent take-home after brokerage cut, and seller net proceeds.
 *
 * Core formulas:
 *   Total Commission = Sale Price × (Total Commission Rate / 100)
 *   Listing Agent Commission = Total Commission × (Listing Agent Split / 100)
 *   Buyer Agent Commission = Total Commission - Listing Agent Commission
 *   Agent Take-Home = Agent Commission × (Brokerage Split / 100)
 *   Seller Net Proceeds = Sale Price - Total Commission
 *   Effective Rate = (Total Commission / Sale Price) × 100
 *
 * Source: National Association of Realtors (NAR) — Member Profile & Commission Data;
 *         Bureau of Labor Statistics (BLS) real estate agent compensation data
 */

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calculateRealEstateCommission(inputs: Record<string, unknown>): Record<string, unknown> {
  const salePrice = Math.max(0, Number(inputs.salePrice) || 0);
  const totalCommissionRate = Math.max(0, Math.min(100, Number(inputs.totalCommissionRate) || 0));
  const rawListingAgentSplit = inputs.listingAgentSplit;
  const listingAgentSplit = Math.max(0, Math.min(100,
    rawListingAgentSplit !== undefined && rawListingAgentSplit !== null && rawListingAgentSplit !== ''
      ? Number(rawListingAgentSplit)
      : 50
  ));
  const rawBrokerageSplit = inputs.brokerageSplit;
  const brokerageSplit = Math.max(0, Math.min(100,
    rawBrokerageSplit !== undefined && rawBrokerageSplit !== null && rawBrokerageSplit !== ''
      ? Number(rawBrokerageSplit)
      : 70
  ));

  // Total commission
  const totalCommission = round2(salePrice * (totalCommissionRate / 100));

  // Split between listing and buyer agent
  const listingAgentCommission = round2(totalCommission * (listingAgentSplit / 100));
  const buyerAgentCommission = round2(totalCommission - listingAgentCommission);

  // Agent take-home after brokerage cut
  const listingAgentTakeHome = round2(listingAgentCommission * (brokerageSplit / 100));
  const buyerAgentTakeHome = round2(buyerAgentCommission * (brokerageSplit / 100));

  // Seller net proceeds after commission
  const sellerNetProceeds = round2(salePrice - totalCommission);

  // Effective commission rate (should match totalCommissionRate, but shown for clarity)
  const effectiveRate = salePrice > 0
    ? round2((totalCommission / salePrice) * 100)
    : 0;

  // Commission breakdown for value-group output
  const commissionBreakdown = [
    { label: 'Total Commission', value: totalCommission },
    { label: 'Listing Agent Share', value: listingAgentCommission },
    { label: "Buyer's Agent Share", value: buyerAgentCommission },
    { label: 'Listing Agent Take-Home', value: listingAgentTakeHome },
    { label: "Buyer's Agent Take-Home", value: buyerAgentTakeHome },
  ];

  return {
    totalCommission,
    listingAgentCommission,
    buyerAgentCommission,
    listingAgentTakeHome,
    buyerAgentTakeHome,
    sellerNetProceeds,
    effectiveRate,
    commissionBreakdown,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'real-estate-commission': calculateRealEstateCommission,
};
