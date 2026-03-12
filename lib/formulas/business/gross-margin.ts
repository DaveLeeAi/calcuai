/**
 * Margin Calculator — Gross Margin & Net Margin
 *
 * Gross Margin formulas:
 *   Gross Profit = Revenue − Cost of Goods Sold (COGS)
 *   Gross Margin % = (Gross Profit / Revenue) × 100
 *   Markup % = (Gross Profit / COGS) × 100
 *
 * Net Margin formulas:
 *   Net Profit = Revenue − COGS − Operating Expenses
 *   Net Margin % = (Net Profit / Revenue) × 100
 *
 * Source: Corporate Finance Institute (CFI), "Profit Margin" (2024).
 */

// ═══════════════════════════════════════════════════════
// Interfaces
// ═══════════════════════════════════════════════════════

export interface MarginInput {
  revenue: number;
  costOfGoods: number;
  operatingExpenses: number;
}

export interface MarginBreakdownRow {
  label: string;
  amount: number;
  percentage: number;
}

export interface MarginOutput {
  grossProfit: number;
  grossMarginPercent: number;
  markupPercent: number;
  netProfit: number;
  netMarginPercent: number;
  profitBreakdown: { name: string; value: number }[];
  marginComparison: MarginBreakdownRow[];
  summary: { label: string; value: number }[];
}

// ═══════════════════════════════════════════════════════
// Main function: Margin Calculator
// ═══════════════════════════════════════════════════════

/**
 * Calculates gross margin, net margin, markup, and provides
 * a breakdown of profit components.
 *
 * Gross Margin % = ((Revenue − COGS) / Revenue) × 100
 * Net Margin % = ((Revenue − COGS − OpEx) / Revenue) × 100
 * Markup % = ((Revenue − COGS) / COGS) × 100
 *
 * @param inputs - Record with revenue, costOfGoods, operatingExpenses
 * @returns Record with grossProfit, grossMarginPercent, markupPercent, netProfit, netMarginPercent, profitBreakdown, marginComparison, summary
 */
export function calculateMargin(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs with safe defaults
  const revenue = Math.max(0, Number(inputs.revenue) || 0);
  const costOfGoods = Math.max(0, Number(inputs.costOfGoods) || 0);
  const operatingExpenses = Math.max(0, Number(inputs.operatingExpenses) || 0);

  // 2. Calculate gross profit and margin
  const grossProfit = revenue - costOfGoods;
  const grossMarginPercent = revenue > 0
    ? Math.round((grossProfit / revenue) * 10000) / 100
    : 0;

  // 3. Calculate markup percentage
  const markupPercent = costOfGoods > 0
    ? Math.round((grossProfit / costOfGoods) * 10000) / 100
    : 0;

  // 4. Calculate net profit and margin
  const netProfit = revenue - costOfGoods - operatingExpenses;
  const netMarginPercent = revenue > 0
    ? Math.round((netProfit / revenue) * 10000) / 100
    : 0;

  // 5. Pie chart: profit breakdown (what each dollar of revenue goes to)
  const profitBreakdown: { name: string; value: number }[] = [
    { name: 'Cost of Goods', value: Math.round(costOfGoods * 100) / 100 },
    { name: 'Operating Expenses', value: Math.round(operatingExpenses * 100) / 100 },
    { name: 'Net Profit', value: Math.round(netProfit * 100) / 100 },
  ];

  // 6. Margin comparison table: gross vs net at various revenue levels
  const revenueMultiples = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
  const marginComparison: MarginBreakdownRow[] = revenueMultiples.map((mult) => {
    const projRevenue = Math.round(revenue * mult * 100) / 100;
    const projGross = projRevenue - costOfGoods;
    const projNet = projRevenue - costOfGoods - operatingExpenses;
    const projGrossMargin = projRevenue > 0
      ? Math.round((projGross / projRevenue) * 10000) / 100
      : 0;
    const projNetMargin = projRevenue > 0
      ? Math.round((projNet / projRevenue) * 10000) / 100
      : 0;
    return {
      label: `$${projRevenue.toLocaleString('en-US', { minimumFractionDigits: 0 })}`,
      amount: Math.round(projNet * 100) / 100,
      percentage: projNetMargin,
    };
  });

  // 7. Summary value group
  const summary: { label: string; value: number }[] = [
    { label: 'Revenue', value: Math.round(revenue * 100) / 100 },
    { label: 'Gross Profit', value: Math.round(grossProfit * 100) / 100 },
    { label: 'Gross Margin', value: grossMarginPercent },
    { label: 'Markup', value: markupPercent },
    { label: 'Net Profit', value: Math.round(netProfit * 100) / 100 },
    { label: 'Net Margin', value: netMarginPercent },
  ];

  return {
    grossProfit: Math.round(grossProfit * 100) / 100,
    grossMarginPercent,
    markupPercent,
    netProfit: Math.round(netProfit * 100) / 100,
    netMarginPercent,
    profitBreakdown,
    marginComparison,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'gross-margin': calculateMargin,
};
