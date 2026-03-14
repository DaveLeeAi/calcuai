/**
 * TikTok Shop Profit Calculator
 *
 * Formulas:
 *   Platform Commission = Selling Price × Category Rate
 *   Affiliate Commission = Selling Price × Affiliate Rate
 *   Small Order Fee = $2.00 if Selling Price < $10 (waived ≥ $10)
 *   Transaction Fee = Selling Price × 0.03 (3% payment processing)
 *   Net Profit = Selling Price − Platform Commission − Affiliate Commission
 *                − Small Order Fee − Transaction Fee − Shipping Cost − Product Cost
 *   Profit Margin = Net Profit / Selling Price × 100
 *   Monthly Profit = Net Profit × Monthly Orders
 *
 * Source: TikTok Shop — US Seller Fee Policy (2025).
 * Source: TikTok Shop — Commission Rate Schedule by Category (2025).
 */

// ─────────────────────────────────────────────
// Fee tables (TikTok Shop US, 2025 policy)
// ─────────────────────────────────────────────

const CATEGORY_RATES: Record<string, number> = {
  'beauty': 0.08,
  'electronics': 0.05,
  'fashion': 0.08,
  'health': 0.08,
  'home': 0.08,
  'food': 0.08,
  'sports': 0.08,
  'toys': 0.08,
  'pets': 0.08,
  'other': 0.08,
};

const TRANSACTION_FEE_RATE = 0.03; // 3% payment processing
const SMALL_ORDER_FEE = 2.00;      // applied when selling price < $10
const SMALL_ORDER_THRESHOLD = 10;

// ─────────────────────────────────────────────
// Interfaces
// ─────────────────────────────────────────────

export interface TikTokFeeRow {
  item: string;
  amount: number;
  pctOfSale: number;
}

export interface TikTokProfitOutput {
  netProfitPerOrder: number;
  profitMargin: number;
  monthlyProfit: number;
  feeBreakdownTable: TikTokFeeRow[];
  summary: { label: string; value: number }[];
}

// ─────────────────────────────────────────────
// Main function
// ─────────────────────────────────────────────

/**
 * Calculates TikTok Shop net profit after platform commission, affiliate commission,
 * small order fee, transaction fee, shipping, and COGS.
 *
 * Net Profit = Price − Commission − Affiliate − SmallOrderFee − TransactionFee − Shipping − COGS
 *
 * @param inputs - Record with sellingPrice, productCost, productCategory, affiliateCommission,
 *                 shippingCost, monthlyOrders
 * @returns Record with netProfitPerOrder, profitMargin, monthlyProfit, feeBreakdownTable, summary
 */
export function calculateTikTokShopProfit(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs
  const sellingPrice = Math.max(0.01, Number(inputs.sellingPrice) || 0);
  const productCost = Math.max(0, Number(inputs.productCost) || 0);
  const category = (inputs.productCategory as string) || 'other';
  const affiliatePct = Math.min(50, Math.max(0, Number(inputs.affiliateCommission) || 0));
  const shippingCost = Math.max(0, Number(inputs.shippingCost) || 0);
  const monthlyOrders = Math.max(1, Number(inputs.monthlyOrders) || 1);

  // 2. Calculate fees
  const commissionRate = CATEGORY_RATES[category] ?? 0.08;
  const platformCommission = Math.round(sellingPrice * commissionRate * 100) / 100;
  const affiliateFee = Math.round(sellingPrice * (affiliatePct / 100) * 100) / 100;
  const smallOrderFee = sellingPrice < SMALL_ORDER_THRESHOLD ? SMALL_ORDER_FEE : 0;
  const transactionFee = Math.round(sellingPrice * TRANSACTION_FEE_RATE * 100) / 100;

  // 3. Net profit
  const totalDeductions = platformCommission + affiliateFee + smallOrderFee + transactionFee + shippingCost + productCost;
  const netProfitPerOrder = Math.round((sellingPrice - totalDeductions) * 100) / 100;
  const profitMargin = sellingPrice > 0
    ? Math.round((netProfitPerOrder / sellingPrice) * 10000) / 100
    : 0;
  const monthlyProfit = Math.round(netProfitPerOrder * monthlyOrders * 100) / 100;

  // 4. Fee breakdown table
  const pct = (amt: number) => Math.round((amt / sellingPrice) * 10000) / 100;
  const feeBreakdownTable: TikTokFeeRow[] = [
    { item: 'Product Cost (COGS)', amount: Math.round(productCost * 100) / 100, pctOfSale: pct(productCost) },
    { item: 'Platform Commission', amount: platformCommission, pctOfSale: Math.round(commissionRate * 10000) / 100 },
    { item: 'Affiliate Commission', amount: affiliateFee, pctOfSale: affiliatePct },
    { item: 'Transaction Fee (3%)', amount: transactionFee, pctOfSale: Math.round(TRANSACTION_FEE_RATE * 10000) / 100 },
    { item: 'Small Order Fee', amount: smallOrderFee, pctOfSale: pct(smallOrderFee) },
    { item: 'Shipping Cost', amount: Math.round(shippingCost * 100) / 100, pctOfSale: pct(shippingCost) },
    { item: 'Net Profit', amount: netProfitPerOrder, pctOfSale: profitMargin },
  ];

  // 5. Summary
  const summary: { label: string; value: number }[] = [
    { label: 'Selling Price', value: sellingPrice },
    { label: 'Platform Commission', value: platformCommission },
    { label: 'Affiliate Commission', value: affiliateFee },
    { label: 'Total TikTok Fees', value: Math.round((platformCommission + transactionFee + smallOrderFee) * 100) / 100 },
    { label: 'Net Profit per Order', value: netProfitPerOrder },
    { label: 'Profit Margin', value: profitMargin },
    { label: 'Monthly Profit', value: monthlyProfit },
  ];

  return { netProfitPerOrder, profitMargin, monthlyProfit, feeBreakdownTable, summary };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'tiktok-shop-profit': calculateTikTokShopProfit,
};
