/**
 * Advertising Break-Even Calculator
 *
 * Formulas:
 *   Contribution Margin per Order = AOV × (1 − COGS% / 100 − Fees% / 100)
 *   Break-Even Orders = Ad Budget / Contribution Margin per Order
 *   Break-Even CPA = Contribution Margin per Order   (max allowable CPA)
 *   Break-Even ROAS = 1 / Gross Margin (as decimal)
 *   Traffic Needed = Break-Even Orders / (Conversion Rate% / 100)
 *
 * Source: Shopify — How to Calculate Your Ecommerce Break-Even Point (2025).
 */

// ===============================================
// Interfaces
// ===============================================

export interface AdBreakEvenInput {
  adBudget: number;
  averageOrderValue: number;
  cogsPercent: number;
  additionalCostsPercent: number;
  currentConversionRate: number;
}

export interface ProfitScenarioRow {
  orders: number;
  revenue: number;
  grossProfit: number;
  netAfterAds: number;
}

export interface AdBreakEvenOutput {
  breakEvenOrders: number;
  breakEvenCPA: number;
  breakEvenROAS: number;
  trafficNeeded: number;
  profitScenarioTable: ProfitScenarioRow[];
  summary: { label: string; value: number }[];
}

// ===============================================
// Main function
// ===============================================

/**
 * Calculates how many orders are needed to break even on an ad budget,
 * the maximum allowable cost per acquisition, break-even ROAS,
 * and website traffic needed given a conversion rate.
 *
 * Contribution Margin = AOV × (1 − COGS% − Fees%)
 * Break-Even Orders = Ad Budget / Contribution Margin
 * Break-Even CPA = Contribution Margin
 * Break-Even ROAS = 1 / Gross Margin (decimal)
 *
 * @param inputs - Record with adBudget, averageOrderValue, cogsPercent, additionalCostsPercent, currentConversionRate
 * @returns Record with breakEvenOrders, breakEvenCPA, breakEvenROAS, trafficNeeded, profitScenarioTable, summary
 */
export function calculateAdBreakEven(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs
  const adBudget = Math.max(1, Number(inputs.adBudget) || 0);
  const averageOrderValue = Math.max(0.01, Number(inputs.averageOrderValue) || 1);
  const cogsPercent = Math.min(99, Math.max(1, Number(inputs.cogsPercent) || 40));
  const additionalCostsPercent = Math.min(50, Math.max(0, Number(inputs.additionalCostsPercent) || 0));
  const currentConversionRate = Math.min(100, Math.max(0.01, Number(inputs.currentConversionRate) || 2));

  // 2. Contribution margin per order (what's left after COGS and fees)
  const netMarginDecimal = 1 - cogsPercent / 100 - additionalCostsPercent / 100;
  const contributionMargin = Math.round(averageOrderValue * netMarginDecimal * 100) / 100;

  // 3. Break-even orders (round up — must sell at least this many)
  const breakEvenOrdersExact = contributionMargin > 0 ? adBudget / contributionMargin : 0;
  const breakEvenOrders = Math.ceil(breakEvenOrdersExact);

  // 4. Max allowable CPA = contribution margin per order
  const breakEvenCPA = contributionMargin;

  // 5. Break-even ROAS
  const grossMarginDecimal = netMarginDecimal;
  const breakEvenROAS = grossMarginDecimal > 0
    ? Math.round((1 / grossMarginDecimal) * 100) / 100
    : 0;

  // 6. Traffic needed to convert break-even orders
  const trafficNeeded = currentConversionRate > 0
    ? Math.ceil(breakEvenOrders / (currentConversionRate / 100))
    : 0;

  // 7. Profit scenario table: 50%, 75%, 100%, 125%, 150% of break-even orders
  const multipliers = [0.5, 0.75, 1, 1.25, 1.5];
  const profitScenarioTable: ProfitScenarioRow[] = multipliers.map((m) => {
    const orders = Math.round(breakEvenOrders * m);
    const revenue = Math.round(orders * averageOrderValue * 100) / 100;
    const grossProfit = Math.round(orders * contributionMargin * 100) / 100;
    const netAfterAds = Math.round((grossProfit - adBudget) * 100) / 100;
    return { orders, revenue, grossProfit, netAfterAds };
  });

  // 8. Summary
  const summary: { label: string; value: number }[] = [
    { label: 'Ad Budget', value: adBudget },
    { label: 'Average Order Value', value: averageOrderValue },
    { label: 'Contribution Margin / Order', value: contributionMargin },
    { label: 'Break-Even Orders', value: breakEvenOrders },
    { label: 'Max CPA', value: breakEvenCPA },
    { label: 'Break-Even ROAS', value: breakEvenROAS },
    { label: 'Traffic Needed', value: trafficNeeded },
  ];

  return {
    breakEvenOrders,
    breakEvenCPA: Math.round(breakEvenCPA * 100) / 100,
    breakEvenROAS,
    trafficNeeded,
    profitScenarioTable,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'advertising-break-even': calculateAdBreakEven,
};
