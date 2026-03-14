/**
 * Etsy Fee Calculator
 *
 * Formulas:
 *   Fee Base = Item Price + Shipping Charged to Buyer
 *   Transaction Fee = Fee Base × 6.5%
 *   Payment Processing = Fee Base × 3% + $0.25
 *   Listing Fee = $0.20 per sale (auto-renewal)
 *   Offsite Ads Fee = Item Price × Offsite Ads% × Rate (12% or 15%)
 *   Net Profit = Item Price − Transaction Fee − Processing Fee − Listing Fee
 *                − Offsite Ads Fee − Actual Shipping − COGS
 *
 * Source: Etsy — Fees & Payments Policy (2025).
 * Source: Etsy — Offsite Ads policy and fee rates (2025).
 */

// ─────────────────────────────────────────────
// Fee constants (Etsy US, 2025)
// ─────────────────────────────────────────────

const LISTING_FEE           = 0.20;   // per sale auto-renewal
const TRANSACTION_RATE      = 0.065;  // 6.5% of item + shipping
const PROCESSING_RATE       = 0.03;   // 3%
const PROCESSING_FIXED      = 0.25;   // $0.25 per order
const OFFSITE_ADS_STANDARD  = 0.15;   // 15% for shops < $10K/year
const OFFSITE_ADS_HIGH      = 0.12;   // 12% for shops ≥ $10K/year (mandatory)

// ─────────────────────────────────────────────
// Interfaces
// ─────────────────────────────────────────────

export interface EtsyFeeRow {
  item: string;
  amount: number;
  pctOfSale: number;
}

export interface EtsyFeeOutput {
  netProfitPerOrder: number;
  profitMargin: number;
  monthlyProfit: number;
  feeBreakdownTable: EtsyFeeRow[];
  summary: { label: string; value: number }[];
}

// ─────────────────────────────────────────────
// Main function
// ─────────────────────────────────────────────

/**
 * Calculates Etsy net profit after transaction fee, payment processing,
 * listing fee, offsite ads fee, shipping, and COGS.
 *
 * Transaction Fee = (Item Price + Shipping Charged) × 6.5%
 * Processing Fee = (Item Price + Shipping Charged) × 3% + $0.25
 * Net Profit = Item Price − Transaction − Processing − Listing − Offsite Ads − Actual Shipping − COGS
 *
 * @param inputs - Record with sellingPrice, productCost, shippingChargedToBuyer,
 *                 actualShippingCost, offsiteAdsPct, annualRevenue, monthlyOrders
 * @returns Record with netProfitPerOrder, profitMargin, monthlyProfit, feeBreakdownTable, summary
 */
export function calculateEtsyFee(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs
  const sellingPrice       = Math.max(0.01, Number(inputs.sellingPrice) || 0);
  const productCost        = Math.max(0, Number(inputs.productCost) || 0);
  const shippingCharged    = Math.max(0, Number(inputs.shippingChargedToBuyer) || 0);
  const actualShipping     = Math.max(0, Number(inputs.actualShippingCost) || 0);
  const offsiteAdsPct      = Math.min(100, Math.max(0, Number(inputs.offsiteAdsPct) || 0));
  const annualRevenue      = (inputs.annualRevenue as string) || 'under-10k';
  const monthlyOrders      = Math.max(1, Number(inputs.monthlyOrders) || 1);

  // 2. Fee base includes item + shipping charged
  const feeBase            = sellingPrice + shippingCharged;

  // 3. Transaction and processing fees
  const transactionFee     = Math.round(feeBase * TRANSACTION_RATE * 100) / 100;
  const processingFee      = Math.round((feeBase * PROCESSING_RATE + PROCESSING_FIXED) * 100) / 100;
  const listingFee         = LISTING_FEE;

  // 4. Offsite ads fee (only on the portion of sales from offsite ads)
  const offsiteRate        = annualRevenue === 'over-10k' ? OFFSITE_ADS_HIGH : OFFSITE_ADS_STANDARD;
  const offsiteAdsFee      = Math.round(sellingPrice * (offsiteAdsPct / 100) * offsiteRate * 100) / 100;

  // 5. Net profit: selling price + shipping collected - all costs
  const totalCosts         = transactionFee + processingFee + listingFee + offsiteAdsFee + actualShipping + productCost;
  const netRevenue         = sellingPrice + shippingCharged - totalCosts - shippingCharged;
  // Simplify: net = sellingPrice - fees (shipping collected covers actual shipping approximately)
  const netProfitPerOrder  = Math.round((sellingPrice - transactionFee - processingFee - listingFee - offsiteAdsFee - actualShipping - productCost) * 100) / 100;
  const profitMargin       = sellingPrice > 0
    ? Math.round((netProfitPerOrder / sellingPrice) * 10000) / 100
    : 0;
  const monthlyProfit      = Math.round(netProfitPerOrder * monthlyOrders * 100) / 100;

  // 6. Fee breakdown
  const pct = (amt: number) => sellingPrice > 0 ? Math.round((amt / sellingPrice) * 10000) / 100 : 0;

  const feeBreakdownTable: EtsyFeeRow[] = [
    { item: 'Product Cost (COGS)',        amount: productCost,      pctOfSale: pct(productCost) },
    { item: 'Transaction Fee (6.5%)',     amount: transactionFee,   pctOfSale: pct(transactionFee) },
    { item: 'Payment Processing (3%)',    amount: processingFee,    pctOfSale: pct(processingFee) },
    { item: 'Listing Fee',                amount: listingFee,       pctOfSale: pct(listingFee) },
    { item: 'Offsite Ads Fee',            amount: offsiteAdsFee,    pctOfSale: pct(offsiteAdsFee) },
    { item: 'Shipping Cost',              amount: actualShipping,   pctOfSale: pct(actualShipping) },
    { item: 'Net Profit',                 amount: netProfitPerOrder, pctOfSale: profitMargin },
  ];

  // 7. Summary
  const totalEtsyFees = Math.round((transactionFee + processingFee + listingFee + offsiteAdsFee) * 100) / 100;
  const summary: { label: string; value: number }[] = [
    { label: 'Item Price',             value: sellingPrice },
    { label: 'Transaction Fee',        value: transactionFee },
    { label: 'Payment Processing',     value: processingFee },
    { label: 'Total Etsy Fees',        value: totalEtsyFees },
    { label: 'Net Profit per Order',   value: netProfitPerOrder },
    { label: 'Profit Margin',          value: profitMargin },
    { label: 'Monthly Profit',         value: monthlyProfit },
  ];

  return { netProfitPerOrder, profitMargin, monthlyProfit, feeBreakdownTable, summary };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'etsy-fee': calculateEtsyFee,
};
