/**
 * Amazon FBA Profit Calculator — 2026 Fee Tables
 *
 * Formulas:
 *   Referral Fee = Selling Price × Category Referral Rate
 *   FBA Fulfillment Fee = fixed fee by size tier (Jan 15, 2026 schedule)
 *   Net Profit = Selling Price − Referral Fee − FBA Fee − Product Cost − Inbound Shipping − PPC Cost
 *   Profit Margin = Net Profit / Selling Price × 100
 *   ROI = Net Profit / (Product Cost + Inbound Shipping + PPC Cost) × 100
 *   Break-Even Price = (Product Cost + Inbound Shipping + PPC Cost + FBA Fee) / (1 − Referral Rate)
 *
 * Source: Amazon Seller Central — 2026 FBA fulfillment fee schedule (effective January 15, 2026).
 * Source: Amazon — Referral fee schedule by category (2026).
 */

// ─────────────────────────────────────────────
// Fee tables (source: Amazon Seller Central, Jan 15 2026 effective)
// ─────────────────────────────────────────────

const REFERRAL_RATES: Record<string, number> = {
  'automotive': 0.12,
  'baby': 0.08,
  'beauty': 0.08,
  'books': 0.15,
  'camera': 0.08,
  'cell-phones': 0.08,
  'clothing': 0.17,
  'electronics': 0.08,
  'grocery': 0.08,
  'health': 0.08,
  'home-garden': 0.15,
  'kitchen': 0.15,
  'office': 0.15,
  'pet': 0.15,
  'shoes': 0.17,
  'sports': 0.15,
  'tools': 0.15,
  'toys': 0.15,
  'video-games': 0.15,
};

/** FBA fulfillment fees effective January 15, 2026 (Amazon Seller Central) */
const FBA_FEES: Record<string, number> = {
  'small-standard-4oz': 3.22,
  'small-standard-8oz': 3.40,
  'small-standard-12oz': 3.58,
  'small-standard-16oz': 3.77,
  'large-standard-4oz': 3.86,
  'large-standard-8oz': 4.08,
  'large-standard-12oz': 4.24,
  'large-standard-16oz': 4.75,
  'large-standard-1.5lb': 5.09,
  'large-standard-2lb': 5.37,
  'large-standard-2.5lb': 5.85,
  'large-standard-3lb': 6.08,
  'small-oversize': 9.73,
  'medium-oversize': 19.05,
};

// ─────────────────────────────────────────────
// Interfaces
// ─────────────────────────────────────────────

export interface FBAFeeBreakdownRow {
  item: string;
  amount: number;
  pctOfSale: number;
}

export interface FBAProfitOutput {
  netProfit: number;
  profitMargin: number;
  roi: number;
  breakEvenPrice: number;
  feeBreakdownTable: FBAFeeBreakdownRow[];
  summary: { label: string; value: number }[];
}

// ─────────────────────────────────────────────
// Main function
// ─────────────────────────────────────────────

/**
 * Calculates Amazon FBA net profit, margin, ROI, and break-even price
 * using the 2026 FBA fulfillment fee schedule effective January 15, 2026.
 *
 * Net Profit = Selling Price − Referral Fee − FBA Fee − Product Cost − Inbound Shipping − PPC Cost
 * ROI = Net Profit / Total Variable Costs × 100
 * Break-Even Price = (Variable Costs + FBA Fee) / (1 − Referral Rate)
 *
 * @param inputs - Record with sellingPrice, productCost, productCategory, sizeTier, inboundShippingPerUnit, ppcCostPerUnit
 * @returns Record with netProfit, profitMargin, roi, breakEvenPrice, feeBreakdownTable, summary
 */
export function calculateFBAProfit(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs
  const sellingPrice = Math.max(0.01, Number(inputs.sellingPrice) || 0);
  const productCost = Math.max(0, Number(inputs.productCost) || 0);
  const productCategory = (inputs.productCategory as string) || 'home-garden';
  const sizeTier = (inputs.sizeTier as string) || 'large-standard-8oz';
  const inboundShipping = Math.max(0, Number(inputs.inboundShippingPerUnit) || 0);
  const ppcCost = Math.max(0, Number(inputs.ppcCostPerUnit) || 0);

  // 2. Look up fees
  const referralRate = REFERRAL_RATES[productCategory] ?? 0.15;
  const fbaFee = FBA_FEES[sizeTier] ?? 4.08;

  // 3. Calculate fees
  const referralFee = Math.round(sellingPrice * referralRate * 100) / 100;
  const totalCosts = productCost + inboundShipping + ppcCost + fbaFee + referralFee;
  const netProfit = Math.round((sellingPrice - totalCosts) * 100) / 100;

  // 4. Metrics
  const profitMargin = sellingPrice > 0
    ? Math.round((netProfit / sellingPrice) * 10000) / 100
    : 0;

  const variableCosts = productCost + inboundShipping + ppcCost;
  const roi = variableCosts > 0
    ? Math.round((netProfit / variableCosts) * 10000) / 100
    : 0;

  // 5. Break-even price: solve for price where net profit = 0
  // price = (variableCosts + fbaFee) / (1 − referralRate)
  const breakEvenPrice = (1 - referralRate) > 0
    ? Math.round(((variableCosts + fbaFee) / (1 - referralRate)) * 100) / 100
    : 0;

  // 6. Fee breakdown table
  const feeBreakdownTable: FBAFeeBreakdownRow[] = [
    { item: 'Product Cost (COGS)', amount: Math.round(productCost * 100) / 100, pctOfSale: Math.round((productCost / sellingPrice) * 10000) / 100 },
    { item: 'Referral Fee', amount: referralFee, pctOfSale: Math.round(referralRate * 10000) / 100 },
    { item: 'FBA Fulfillment Fee', amount: Math.round(fbaFee * 100) / 100, pctOfSale: Math.round((fbaFee / sellingPrice) * 10000) / 100 },
    { item: 'Inbound Shipping', amount: Math.round(inboundShipping * 100) / 100, pctOfSale: Math.round((inboundShipping / sellingPrice) * 10000) / 100 },
    { item: 'PPC Ad Cost', amount: Math.round(ppcCost * 100) / 100, pctOfSale: Math.round((ppcCost / sellingPrice) * 10000) / 100 },
    { item: 'Net Profit', amount: netProfit, pctOfSale: profitMargin },
  ];

  // 7. Summary
  const summary: { label: string; value: number }[] = [
    { label: 'Selling Price', value: sellingPrice },
    { label: 'Total Fees (Amazon)', value: Math.round((referralFee + fbaFee) * 100) / 100 },
    { label: 'Total Costs', value: Math.round(totalCosts * 100) / 100 },
    { label: 'Net Profit', value: netProfit },
    { label: 'Profit Margin', value: profitMargin },
    { label: 'ROI', value: roi },
    { label: 'Break-Even Price', value: breakEvenPrice },
  ];

  return { netProfit, profitMargin, roi, breakEvenPrice, feeBreakdownTable, summary };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'amazon-fba-profit': calculateFBAProfit,
};
