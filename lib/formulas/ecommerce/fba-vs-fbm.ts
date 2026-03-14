/**
 * FBA vs FBM Calculator
 *
 * Compares Amazon FBA (Fulfilled by Amazon) vs FBM (Fulfilled by Merchant)
 * net profit, margin, and cost structure for the same product and selling price.
 *
 * Formulas:
 *   Referral Fee (both) = Selling Price × Category Referral Rate
 *   FBA Total Cost = Referral Fee + FBA Fulfillment Fee + Inbound Shipping + COGS
 *   FBM Total Cost = Referral Fee + FBM Shipping to Customer + Packaging + COGS
 *   Net Profit (FBA) = Selling Price − FBA Total Cost
 *   Net Profit (FBM) = Selling Price − FBM Total Cost
 *
 * Source: Amazon Seller Central — 2026 FBA fulfillment fee schedule (effective January 15, 2026).
 * Source: Amazon — Referral fee schedule by category (2026).
 */

// ─────────────────────────────────────────────
// Fee tables (reused from amazon-fba-profit.ts)
// ─────────────────────────────────────────────

const REFERRAL_RATES: Record<string, number> = {
  'beauty':     0.08,
  'clothing':   0.17,
  'electronics':0.08,
  'health':     0.08,
  'home-garden':0.15,
  'kitchen':    0.15,
  'pet':        0.15,
  'sports':     0.15,
  'tools':      0.15,
  'toys':       0.15,
};

const FBA_FEES: Record<string, number> = {
  'small-standard-4oz':  3.22,
  'small-standard-8oz':  3.40,
  'large-standard-4oz':  3.86,
  'large-standard-8oz':  4.08,
  'large-standard-12oz': 4.24,
  'large-standard-16oz': 4.75,
  'large-standard-1.5lb':5.09,
  'large-standard-2lb':  5.37,
  'small-oversize':      9.73,
};

// ─────────────────────────────────────────────
// Interfaces
// ─────────────────────────────────────────────

export interface FBAFBMRow {
  item: string;
  fba: number;
  fbm: number;
}

export interface FBAFBMOutput {
  fbaProfitPerUnit: number;
  fbmProfitPerUnit: number;
  recommendation: string;
  comparisonTable: FBAFBMRow[];
  summary: { label: string; value: number }[];
}

// ─────────────────────────────────────────────
// Main function
// ─────────────────────────────────────────────

/**
 * Compares FBA vs FBM net profit for the same product on Amazon.
 *
 * FBA Net Profit = Price − Referral Fee − FBA Fee − Inbound Shipping − COGS
 * FBM Net Profit = Price − Referral Fee − FBM Shipping − Packaging − COGS
 *
 * @param inputs - Record with sellingPrice, productCost, productCategory, sizeTier,
 *                 inboundShipping, fbmShippingCost, fbmPackagingCost
 * @returns Record with fbaProfitPerUnit, fbmProfitPerUnit, recommendation, comparisonTable, summary
 */
export function calculateFBAVsFBM(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs
  const sellingPrice     = Math.max(0.01, Number(inputs.sellingPrice) || 0);
  const productCost      = Math.max(0, Number(inputs.productCost) || 0);
  const category         = (inputs.productCategory as string) || 'home-garden';
  const sizeTier         = (inputs.sizeTier as string) || 'large-standard-8oz';
  const inboundShipping  = Math.max(0, Number(inputs.inboundShipping) || 0);
  const fbmShipping      = Math.max(0, Number(inputs.fbmShippingCost) || 0);
  const fbmPackaging     = Math.max(0, Number(inputs.fbmPackagingCost) || 0);

  // 2. Shared referral fee
  const referralRate     = REFERRAL_RATES[category] ?? 0.15;
  const referralFee      = Math.round(sellingPrice * referralRate * 100) / 100;

  // 3. FBA-specific costs
  const fbaFulfillmentFee = FBA_FEES[sizeTier] ?? 4.08;
  const fbaTotalCost      = Math.round((referralFee + fbaFulfillmentFee + inboundShipping + productCost) * 100) / 100;
  const fbaProfitPerUnit  = Math.round((sellingPrice - fbaTotalCost) * 100) / 100;
  const fbaMargin         = sellingPrice > 0 ? Math.round((fbaProfitPerUnit / sellingPrice) * 10000) / 100 : 0;

  // 4. FBM-specific costs
  const fbmFulfillmentCost = Math.round((fbmShipping + fbmPackaging) * 100) / 100;
  const fbmTotalCost       = Math.round((referralFee + fbmFulfillmentCost + productCost) * 100) / 100;
  const fbmProfitPerUnit   = Math.round((sellingPrice - fbmTotalCost) * 100) / 100;
  const fbmMargin          = sellingPrice > 0 ? Math.round((fbmProfitPerUnit / sellingPrice) * 10000) / 100 : 0;

  // 5. Recommendation
  const profitDiff         = Math.round((fbaProfitPerUnit - fbmProfitPerUnit) * 100) / 100;
  let recommendation: string;
  if (Math.abs(profitDiff) < 0.50) {
    recommendation = 'Similar profit — evaluate on Buy Box eligibility and storage cost';
  } else if (fbaProfitPerUnit > fbmProfitPerUnit) {
    recommendation = `FBA — earns $${profitDiff.toFixed(2)} more per unit`;
  } else {
    recommendation = `FBM — earns $${Math.abs(profitDiff).toFixed(2)} more per unit`;
  }

  // 6. Comparison table
  const comparisonTable: FBAFBMRow[] = [
    { item: 'Product Cost (COGS)',         fba: productCost,         fbm: productCost },
    { item: 'Amazon Referral Fee',         fba: referralFee,         fbm: referralFee },
    { item: 'Fulfillment Fee',             fba: fbaFulfillmentFee,   fbm: fbmFulfillmentCost },
    { item: 'Inbound / Packaging',         fba: inboundShipping,     fbm: fbmPackaging },
    { item: 'Total Costs',                 fba: fbaTotalCost,        fbm: fbmTotalCost },
    { item: 'Net Profit per Unit',         fba: fbaProfitPerUnit,    fbm: fbmProfitPerUnit },
    { item: 'Profit Margin (%)',           fba: fbaMargin,           fbm: fbmMargin },
  ];

  // 7. Summary
  const summary: { label: string; value: number }[] = [
    { label: 'Selling Price',             value: sellingPrice },
    { label: 'FBA Net Profit',            value: fbaProfitPerUnit },
    { label: 'FBM Net Profit',            value: fbmProfitPerUnit },
    { label: 'FBA Margin %',              value: fbaMargin },
    { label: 'FBM Margin %',              value: fbmMargin },
    { label: 'Profit Difference (FBA−FBM)', value: profitDiff },
  ];

  return { fbaProfitPerUnit, fbmProfitPerUnit, recommendation, comparisonTable, summary };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'fba-vs-fbm': calculateFBAVsFBM,
};
