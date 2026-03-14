/**
 * eBay Fee Calculator
 *
 * Formulas:
 *   Buyer Total = Selling Price + Buyer Shipping
 *   Final Value Fee = Buyer Total × Category Rate (tiered at threshold)
 *   Payment Processing = Buyer Total × 2.9% + $0.30 (eBay Managed Payments)
 *   Promoted Listings Fee = Selling Price × Promoted Rate%
 *   Net Profit = Selling Price − Final Value Fee − Payment Processing
 *                − Promoted Fee − Actual Shipping Cost − COGS
 *   Profit Margin = Net Profit / Selling Price × 100
 *
 * Source: eBay — Selling fees for private sellers (2025).
 * Source: eBay — Managed Payments processing rates (2025).
 */

// ─────────────────────────────────────────────
// Fee tables (eBay US, 2025)
// ─────────────────────────────────────────────

interface FVFRate {
  rate: number;       // primary rate
  threshold: number;  // threshold where rate changes
  rateAbove: number;  // rate above the threshold
}

const FINAL_VALUE_RATES: Record<string, FVFRate> = {
  'most-categories':       { rate: 0.1325, threshold: 7500,  rateAbove: 0.0235 },
  'electronics':           { rate: 0.087,  threshold: 7500,  rateAbove: 0.0235 },
  'fashion-under-100':     { rate: 0.15,   threshold: 100,   rateAbove: 0.09   },
  'fashion-over-100':      { rate: 0.09,   threshold: 7500,  rateAbove: 0.0235 },
  'media':                 { rate: 0.1435, threshold: 7500,  rateAbove: 0.0235 },
  'coins-stamps':          { rate: 0.1235, threshold: 7500,  rateAbove: 0.0235 },
  'motors-parts':          { rate: 0.115,  threshold: 7500,  rateAbove: 0.0235 },
  'jewelry-under-5k':      { rate: 0.15,   threshold: 5000,  rateAbove: 0.09   },
  'jewelry-over-5k':       { rate: 0.09,   threshold: 7500,  rateAbove: 0.0235 },
};

// Managed Payments processing: 2.9% + $0.30 per order
const PAYMENT_PROCESSING_RATE = 0.029;
const PAYMENT_PROCESSING_FIXED = 0.30;

// ─────────────────────────────────────────────
// Interfaces
// ─────────────────────────────────────────────

export interface EbayFeeRow {
  item: string;
  amount: number;
  pctOfSale: number;
}

export interface EbayFeeOutput {
  netProfitPerOrder: number;
  profitMargin: number;
  monthlyProfit: number;
  feeBreakdownTable: EbayFeeRow[];
  summary: { label: string; value: number }[];
}

// ─────────────────────────────────────────────
// Helper — tiered final value fee
// ─────────────────────────────────────────────

function calcFinalValueFee(buyerTotal: number, config: FVFRate): number {
  if (buyerTotal <= config.threshold) {
    return buyerTotal * config.rate;
  }
  return config.threshold * config.rate + (buyerTotal - config.threshold) * config.rateAbove;
}

// ─────────────────────────────────────────────
// Main function
// ─────────────────────────────────────────────

/**
 * Calculates eBay net profit after final value fee, Managed Payments processing,
 * promoted listings fee, actual shipping cost, and COGS.
 *
 * Final Value Fee = Buyer Total × Category Rate (tiered)
 * Buyer Total = Selling Price + Buyer Shipping
 * Net Profit = Selling Price − FVF − Processing − Promoted − Actual Shipping − COGS
 *
 * @param inputs - Record with sellingPrice, productCost, productCategory, buyerShipping,
 *                 actualShippingCost, promotedListingsRate, monthlyOrders
 * @returns Record with netProfitPerOrder, profitMargin, monthlyProfit, feeBreakdownTable, summary
 */
export function calculateEbayFee(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs
  const sellingPrice       = Math.max(0.01, Number(inputs.sellingPrice) || 0);
  const productCost        = Math.max(0, Number(inputs.productCost) || 0);
  const category           = (inputs.productCategory as string) || 'most-categories';
  const buyerShipping      = Math.max(0, Number(inputs.buyerShipping) || 0);
  const actualShipping     = Math.max(0, Number(inputs.actualShippingCost) || 0);
  const promotedRate       = Math.min(20, Math.max(0, Number(inputs.promotedListingsRate) || 0));
  const monthlyOrders      = Math.max(1, Number(inputs.monthlyOrders) || 1);

  // 2. eBay charges FVF on the full amount buyer pays (item + shipping)
  const buyerTotal         = sellingPrice + buyerShipping;
  const fvfConfig          = FINAL_VALUE_RATES[category] ?? FINAL_VALUE_RATES['most-categories'];
  const finalValueFee      = Math.round(calcFinalValueFee(buyerTotal, fvfConfig) * 100) / 100;

  // 3. Managed Payments processing (on buyer total)
  const paymentProcessing  = Math.round((buyerTotal * PAYMENT_PROCESSING_RATE + PAYMENT_PROCESSING_FIXED) * 100) / 100;

  // 4. Promoted listings (on selling price only, not shipping)
  const promotedFee        = Math.round(sellingPrice * (promotedRate / 100) * 100) / 100;

  // 5. Net profit (selling price minus all costs — shipping collected from buyer offsets actual cost)
  const totalDeductions    = finalValueFee + paymentProcessing + promotedFee + actualShipping + productCost - buyerShipping;
  const netProfitPerOrder  = Math.round((sellingPrice - totalDeductions) * 100) / 100;
  const profitMargin       = sellingPrice > 0
    ? Math.round((netProfitPerOrder / sellingPrice) * 10000) / 100
    : 0;
  const monthlyProfit      = Math.round(netProfitPerOrder * monthlyOrders * 100) / 100;

  // 6. Fee breakdown table
  const pct = (amt: number) => sellingPrice > 0 ? Math.round((amt / sellingPrice) * 10000) / 100 : 0;

  const feeBreakdownTable: EbayFeeRow[] = [
    { item: 'Product Cost (COGS)',        amount: productCost,         pctOfSale: pct(productCost) },
    { item: 'Final Value Fee',            amount: finalValueFee,        pctOfSale: pct(finalValueFee) },
    { item: 'Payment Processing (2.9%+)', amount: paymentProcessing,    pctOfSale: pct(paymentProcessing) },
    { item: 'Promoted Listings Fee',      amount: promotedFee,          pctOfSale: promotedRate },
    { item: 'Actual Shipping Cost',       amount: actualShipping,       pctOfSale: pct(actualShipping) },
    { item: 'Buyer Shipping Collected',   amount: -buyerShipping,       pctOfSale: -pct(buyerShipping) },
    { item: 'Net Profit',                 amount: netProfitPerOrder,    pctOfSale: profitMargin },
  ];

  // 7. Summary
  const summary: { label: string; value: number }[] = [
    { label: 'Selling Price',          value: sellingPrice },
    { label: 'Final Value Fee',        value: finalValueFee },
    { label: 'Payment Processing',     value: paymentProcessing },
    { label: 'Promoted Listings Fee',  value: promotedFee },
    { label: 'Net Profit per Order',   value: netProfitPerOrder },
    { label: 'Profit Margin',          value: profitMargin },
    { label: 'Monthly Profit',         value: monthlyProfit },
  ];

  return { netProfitPerOrder, profitMargin, monthlyProfit, feeBreakdownTable, summary };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'ebay-fee': calculateEbayFee,
};
