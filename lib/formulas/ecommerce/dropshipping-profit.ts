/**
 * Dropshipping Profit Calculator
 *
 * Formulas:
 *   Platform Fee = Selling Price × Platform Rate% + Fixed Fee
 *   Net Profit = Selling Price − Supplier Cost − Shipping − Platform Fee − Ad Spend
 *   Profit Margin = Net Profit / Selling Price × 100
 *   ROI = Net Profit / (Supplier Cost + Shipping + Ad Spend) × 100
 *   Break-Even Price = (Supplier + Shipping + Ad Spend + Fixed Fee) / (1 − Platform Rate)
 *
 * Source: Shopify — Payments Processing Rates (2026).
 * Source: eBay — Seller Fees (2025).
 * Source: Amazon Seller Central — Referral Fee Schedule (2026).
 */

// ─────────────────────────────────────────────
// Platform fee configurations
// ─────────────────────────────────────────────

interface PlatformConfig {
  label: string;
  rate: number;       // percentage of selling price
  fixedFee: number;   // fixed per-order fee
}

const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  'shopify-payments': { label: 'Shopify Payments',      rate: 0.029,          fixedFee: 0.30 },
  'shopify-stripe':   { label: 'Shopify + Stripe',      rate: 0.029 + 0.01,   fixedFee: 0.30 }, // 2.9% Stripe + 1% Shopify txn fee
  'woocommerce':      { label: 'WooCommerce + Stripe',   rate: 0.029,          fixedFee: 0.30 },
  'amazon':           { label: 'Amazon',                 rate: 0.15,           fixedFee: 0.00 }, // avg referral
  'ebay':             { label: 'eBay',                   rate: 0.1325 + 0.029, fixedFee: 0.30 }, // FVF + Managed Payments
  'custom':           { label: 'Custom',                 rate: 0,              fixedFee: 0.00 },
};

// ─────────────────────────────────────────────
// Interfaces
// ─────────────────────────────────────────────

export interface DropshippingCostRow {
  item: string;
  amount: number;
  pctOfSale: number;
}

export interface DropshippingOutput {
  netProfitPerOrder: number;
  profitMargin: number;
  roi: number;
  breakEvenPrice: number;
  monthlyProfit: number;
  costBreakdownTable: DropshippingCostRow[];
  summary: { label: string; value: number }[];
}

// ─────────────────────────────────────────────
// Main function
// ─────────────────────────────────────────────

/**
 * Calculates dropshipping net profit, margin, ROI, and break-even price.
 *
 * Net Profit = Selling Price − Platform Fee − Supplier Cost − Shipping − Ad Spend
 * ROI = Net Profit / (Supplier Cost + Shipping + Ad Spend) × 100
 * Break-Even Price = (Supplier + Shipping + Ad Spend + Fixed Fee) / (1 − Platform Rate)
 *
 * @param inputs - Record with sellingPrice, supplierCost, shippingCost, platformType,
 *                 customPlatformRate, adSpendPerOrder, monthlyOrders
 * @returns Record with netProfitPerOrder, profitMargin, roi, breakEvenPrice, monthlyProfit, etc.
 */
export function calculateDropshippingProfit(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs
  const sellingPrice      = Math.max(0.01, Number(inputs.sellingPrice) || 0);
  const supplierCost      = Math.max(0, Number(inputs.supplierCost) || 0);
  const shippingCost      = Math.max(0, Number(inputs.shippingCost) || 0);
  const platformType      = (inputs.platformType as string) || 'shopify-payments';
  const customRate        = Math.max(0, Number(inputs.customPlatformRate) || 0) / 100;
  const adSpend           = Math.max(0, Number(inputs.adSpendPerOrder) || 0);
  const monthlyOrders     = Math.max(1, Number(inputs.monthlyOrders) || 1);

  // 2. Platform fees
  const config            = PLATFORM_CONFIGS[platformType] ?? PLATFORM_CONFIGS['custom'];
  const effectiveRate     = platformType === 'custom' ? customRate : config.rate;
  const effectiveFixed    = platformType === 'custom' ? 0 : config.fixedFee;
  const platformFee       = Math.round((sellingPrice * effectiveRate + effectiveFixed) * 100) / 100;

  // 3. Net profit
  const totalCosts        = supplierCost + shippingCost + platformFee + adSpend;
  const netProfitPerOrder = Math.round((sellingPrice - totalCosts) * 100) / 100;
  const profitMargin      = sellingPrice > 0
    ? Math.round((netProfitPerOrder / sellingPrice) * 10000) / 100
    : 0;

  // 4. ROI on variable cash outlay (supplier + shipping + ad spend — excludes platform fee which is taken post-sale)
  const cashOutlay        = supplierCost + shippingCost + adSpend;
  const roi               = cashOutlay > 0
    ? Math.round((netProfitPerOrder / cashOutlay) * 10000) / 100
    : 0;

  // 5. Break-even selling price
  const breakEvenPrice    = effectiveRate < 1
    ? Math.round(((cashOutlay + effectiveFixed) / (1 - effectiveRate)) * 100) / 100
    : 0;

  // 6. Monthly
  const monthlyProfit     = Math.round(netProfitPerOrder * monthlyOrders * 100) / 100;

  // 7. Cost breakdown
  const pct = (amt: number) => sellingPrice > 0 ? Math.round((amt / sellingPrice) * 10000) / 100 : 0;

  const costBreakdownTable: DropshippingCostRow[] = [
    { item: 'Supplier Cost',          amount: supplierCost,       pctOfSale: pct(supplierCost) },
    { item: 'Shipping Cost',          amount: shippingCost,       pctOfSale: pct(shippingCost) },
    { item: 'Platform Fee',           amount: platformFee,        pctOfSale: pct(platformFee) },
    { item: 'Ad Spend per Order',     amount: adSpend,            pctOfSale: pct(adSpend) },
    { item: 'Net Profit',             amount: netProfitPerOrder,  pctOfSale: profitMargin },
  ];

  // 8. Summary
  const summary: { label: string; value: number }[] = [
    { label: 'Selling Price',         value: sellingPrice },
    { label: 'Total Costs',           value: Math.round(totalCosts * 100) / 100 },
    { label: 'Net Profit per Order',  value: netProfitPerOrder },
    { label: 'Profit Margin',         value: profitMargin },
    { label: 'ROI',                   value: roi },
    { label: 'Break-Even Price',      value: breakEvenPrice },
    { label: 'Monthly Profit',        value: monthlyProfit },
  ];

  return { netProfitPerOrder, profitMargin, roi, breakEvenPrice, monthlyProfit, costBreakdownTable, summary };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'dropshipping-profit': calculateDropshippingProfit,
};
