/**
 * Profit Calculator — Gross and Net Profit
 *
 * Formulas:
 *   Gross Profit = Revenue - Cost of Goods Sold
 *   Operating Profit = Gross Profit - Operating Expenses
 *   Net Profit = Operating Profit - Taxes
 *   Tax Amount = Operating Profit * (Tax Rate / 100)
 *   Profit per Unit = Net Profit / Units Sold
 *
 * Source: U.S. Small Business Administration (SBA) — Profit calculation guidelines (2024).
 */

// ═══════════════════════════════════════════════════════
// Interfaces
// ═══════════════════════════════════════════════════════

export interface ProfitInput {
  revenue: number;
  costOfGoodsSold: number;
  operatingExpenses: number;
  taxRate: number;
  unitsSold: number;
}

export interface ProfitBreakdownSlice {
  label: string;
  value: number;
}

export interface ProfitOutput {
  netProfit: number;
  grossProfit: number;
  operatingProfit: number;
  taxAmount: number;
  profitPerUnit: number;
  profitBreakdown: ProfitBreakdownSlice[];
  summary: { label: string; value: number }[];
}

// ═══════════════════════════════════════════════════════
// Main function: Profit Calculator
// ═══════════════════════════════════════════════════════

/**
 * Calculates gross profit, operating profit, net profit (after taxes),
 * and optional profit per unit. Generates a pie chart breakdown showing
 * how revenue is allocated across COGS, operating expenses, taxes, and net profit.
 *
 * Gross Profit = Revenue − COGS
 * Operating Profit = Gross Profit − Operating Expenses
 * Net Profit = Operating Profit × (1 − Tax Rate / 100)
 *
 * @param inputs - Record with revenue, costOfGoodsSold, operatingExpenses, taxRate, unitsSold
 * @returns Record with netProfit, grossProfit, operatingProfit, taxAmount, profitPerUnit, profitBreakdown, summary
 */
export function calculateProfit(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs with safe defaults
  const revenue = Math.max(0, Number(inputs.revenue) || 0);
  const costOfGoodsSold = Math.max(0, Number(inputs.costOfGoodsSold) || 0);
  const operatingExpenses = Math.max(0, Number(inputs.operatingExpenses) || 0);
  const taxRate = Math.max(0, Math.min(100, Number(inputs.taxRate) || 0));
  const unitsSold = Math.max(0, Number(inputs.unitsSold) || 0);

  // 2. Calculate gross profit
  const grossProfit = Math.round((revenue - costOfGoodsSold) * 100) / 100;

  // 3. Calculate operating profit
  const operatingProfit = Math.round((grossProfit - operatingExpenses) * 100) / 100;

  // 4. Calculate taxes (only on positive operating profit)
  const taxableProfit = Math.max(0, operatingProfit);
  const taxAmount = Math.round(taxableProfit * (taxRate / 100) * 100) / 100;

  // 5. Calculate net profit
  const netProfit = Math.round((operatingProfit - taxAmount) * 100) / 100;

  // 6. Calculate profit per unit
  const profitPerUnit = unitsSold > 0
    ? Math.round((netProfit / unitsSold) * 100) / 100
    : 0;

  // 7. Generate profit breakdown pie chart data
  // Show how revenue is distributed: COGS, OpEx, Taxes, Net Profit
  const profitBreakdown: ProfitBreakdownSlice[] = [];

  if (revenue > 0) {
    profitBreakdown.push(
      { label: 'Cost of Goods Sold', value: Math.round(Math.max(0, costOfGoodsSold) * 100) / 100 },
      { label: 'Operating Expenses', value: Math.round(Math.max(0, operatingExpenses) * 100) / 100 },
      { label: 'Taxes', value: Math.round(Math.max(0, taxAmount) * 100) / 100 },
      { label: 'Net Profit', value: Math.round(Math.max(0, netProfit) * 100) / 100 }
    );
  }

  // 8. Summary value group
  const summary: { label: string; value: number }[] = [
    { label: 'Revenue', value: Math.round(revenue * 100) / 100 },
    { label: 'Cost of Goods Sold', value: Math.round(costOfGoodsSold * 100) / 100 },
    { label: 'Gross Profit', value: grossProfit },
    { label: 'Operating Expenses', value: Math.round(operatingExpenses * 100) / 100 },
    { label: 'Operating Profit', value: operatingProfit },
    { label: 'Taxes', value: taxAmount },
    { label: 'Net Profit', value: netProfit },
    { label: 'Profit per Unit', value: profitPerUnit },
  ];

  return {
    netProfit,
    grossProfit,
    operatingProfit,
    taxAmount,
    profitPerUnit,
    profitBreakdown,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'profit': calculateProfit,
};
