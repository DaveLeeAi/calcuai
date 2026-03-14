/**
 * Print-on-Demand Profit Calculator
 *
 * Formulas:
 *   Platform Fee = Selling Price × Platform Rate% + Fixed Fee per Order
 *   Net Profit = Selling Price − POD Cost − Shipping − Platform Fee − Ad Spend
 *   Profit Margin = Net Profit / Selling Price × 100
 *   Monthly Profit = Net Profit × Monthly Orders
 *
 * Source: Printful — Pricing and Profit Calculator (2025).
 * Source: Etsy — Fees & Payments Policy (2025).
 * Source: Shopify — Payments Processing Rates (2026).
 */

// ─────────────────────────────────────────────
// Platform configurations
// ─────────────────────────────────────────────

interface PODPlatformConfig {
  label: string;
  feeRate: number;    // % of selling price
  fixedFee: number;   // per-order fixed fee
  royaltyModel: boolean; // true = platform pays you a % (Amazon Merch, Redbubble)
}

const POD_PLATFORMS: Record<string, PODPlatformConfig> = {
  'etsy':             { label: 'Etsy',              feeRate: 0.095, fixedFee: 0.45,  royaltyModel: false },
  // Etsy: 6.5% transaction + 3% processing + $0.20 listing + $0.25 processing fixed ≈ 9.5% + $0.45
  'shopify-payments': { label: 'Shopify Payments',  feeRate: 0.029, fixedFee: 0.30,  royaltyModel: false },
  'amazon-merch':     { label: 'Merch by Amazon',   feeRate: 0,     fixedFee: 0,     royaltyModel: true  },
  // Amazon Merch: user enters the royalty % they keep (customPlatformRate)
  'redbubble':        { label: 'Redbubble',         feeRate: 0,     fixedFee: 0,     royaltyModel: true  },
  // Redbubble: user enters their margin % (customPlatformRate)
  'custom':           { label: 'Custom',            feeRate: 0,     fixedFee: 0,     royaltyModel: false },
};

// ─────────────────────────────────────────────
// Interfaces
// ─────────────────────────────────────────────

export interface PODCostRow {
  item: string;
  amount: number;
  pctOfSale: number;
}

export interface PODOutput {
  netProfitPerOrder: number;
  profitMargin: number;
  monthlyProfit: number;
  costBreakdownTable: PODCostRow[];
  summary: { label: string; value: number }[];
}

// ─────────────────────────────────────────────
// Main function
// ─────────────────────────────────────────────

/**
 * Calculates print-on-demand net profit per order.
 *
 * Standard platforms: Net Profit = Price − POD Cost − Shipping − Platform Fee − Ad Spend
 * Royalty platforms (Amazon Merch, Redbubble): Net Profit = Price × royalty% − POD Cost − Shipping − Ad Spend
 *
 * @param inputs - Record with sellingPrice, podCost, shippingCost, platform,
 *                 customPlatformRate, adSpendPerOrder, monthlyOrders
 * @returns Record with netProfitPerOrder, profitMargin, monthlyProfit, costBreakdownTable, summary
 */
export function calculatePrintOnDemandProfit(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs
  const sellingPrice    = Math.max(0.01, Number(inputs.sellingPrice) || 0);
  const podCost         = Math.max(0, Number(inputs.podCost) || 0);
  const shippingCost    = Math.max(0, Number(inputs.shippingCost) || 0);
  const platformKey     = (inputs.platform as string) || 'etsy';
  const customRate      = Math.min(100, Math.max(0, Number(inputs.customPlatformRate) || 0));
  const adSpend         = Math.max(0, Number(inputs.adSpendPerOrder) || 0);
  const monthlyOrders   = Math.max(1, Number(inputs.monthlyOrders) || 1);

  // 2. Get platform config
  const config          = POD_PLATFORMS[platformKey] ?? POD_PLATFORMS['custom'];

  // 3. Calculate fees / revenue depending on model
  let platformFee: number;
  let netProfitPerOrder: number;
  let platformFeeLabel: string;

  if (config.royaltyModel) {
    // Royalty model: platform pays you a % of price; customRate = % you keep
    const royaltyRate   = customRate / 100;
    const royaltyAmount = Math.round(sellingPrice * royaltyRate * 100) / 100;
    platformFee         = Math.round((sellingPrice - royaltyAmount) * 100) / 100;
    platformFeeLabel    = `Platform Take (${(100 - customRate).toFixed(1)}%)`;
    netProfitPerOrder   = Math.round((royaltyAmount - podCost - shippingCost - adSpend) * 100) / 100;
  } else {
    // Standard fee model
    const effectiveRate = platformKey === 'custom' ? customRate / 100 : config.feeRate;
    const effectiveFixed = platformKey === 'custom' ? 0 : config.fixedFee;
    platformFee         = Math.round((sellingPrice * effectiveRate + effectiveFixed) * 100) / 100;
    platformFeeLabel    = 'Platform Fee';
    netProfitPerOrder   = Math.round((sellingPrice - podCost - shippingCost - platformFee - adSpend) * 100) / 100;
  }

  const profitMargin    = sellingPrice > 0
    ? Math.round((netProfitPerOrder / sellingPrice) * 10000) / 100
    : 0;
  const monthlyProfit   = Math.round(netProfitPerOrder * monthlyOrders * 100) / 100;

  // 4. Cost breakdown
  const pct = (amt: number) => sellingPrice > 0 ? Math.round((amt / sellingPrice) * 10000) / 100 : 0;

  const costBreakdownTable: PODCostRow[] = [
    { item: 'POD Cost (Base + Print)',  amount: podCost,            pctOfSale: pct(podCost) },
    { item: platformFeeLabel,           amount: platformFee,        pctOfSale: pct(platformFee) },
    { item: 'Shipping Cost',            amount: shippingCost,       pctOfSale: pct(shippingCost) },
    { item: 'Ad Spend per Order',       amount: adSpend,            pctOfSale: pct(adSpend) },
    { item: 'Net Profit',               amount: netProfitPerOrder,  pctOfSale: profitMargin },
  ];

  // 5. Summary
  const summary: { label: string; value: number }[] = [
    { label: 'Selling Price',         value: sellingPrice },
    { label: 'POD Cost',              value: podCost },
    { label: 'Platform Fee',          value: platformFee },
    { label: 'Net Profit per Order',  value: netProfitPerOrder },
    { label: 'Profit Margin',         value: profitMargin },
    { label: 'Monthly Profit',        value: monthlyProfit },
  ];

  return { netProfitPerOrder, profitMargin, monthlyProfit, costBreakdownTable, summary };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'print-on-demand-profit': calculatePrintOnDemandProfit,
};
