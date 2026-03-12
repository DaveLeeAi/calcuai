/**
 * Markup Calculator — Cost-Plus Pricing
 *
 * Markup formulas:
 *   Selling Price = Cost * (1 + Markup% / 100)
 *   Markup % = ((Selling Price - Cost) / Cost) * 100
 *   Gross Profit = Selling Price - Cost
 *   Margin % = ((Selling Price - Cost) / Selling Price) * 100
 *
 * Source: Corporate Finance Institute (CFI), "Markup" (2024).
 */

// ===============================================
// Interfaces
// ===============================================

export interface MarkupInput {
  cost: number;
  markupPercent: number;
  calculationMode: 'cost-to-price' | 'price-to-markup';
  sellingPrice: number;
}

export interface MarkupToMarginRow {
  markup: number;
  margin: number;
  sellAt: number;
}

export interface MarkupOutput {
  sellingPrice: number;
  markupPercent: number;
  grossProfit: number;
  marginPercent: number;
  markupToMarginTable: MarkupToMarginRow[];
  summary: { label: string; value: number }[];
}

// ===============================================
// Main function: Markup Calculator
// ===============================================

/**
 * Calculates selling price from cost and markup, or finds markup from
 * cost and selling price. Also provides margin equivalent and a
 * markup-to-margin reference table.
 *
 * Cost-to-Price mode:
 *   Selling Price = Cost * (1 + Markup% / 100)
 *
 * Price-to-Markup mode:
 *   Markup % = ((Selling Price - Cost) / Cost) * 100
 *
 * In both modes:
 *   Gross Profit = Selling Price - Cost
 *   Margin % = (Gross Profit / Selling Price) * 100
 *
 * @param inputs - Record with cost, markupPercent, calculationMode, sellingPrice
 * @returns Record with sellingPrice, markupPercent, grossProfit, marginPercent, markupToMarginTable, summary
 */
export function calculateMarkup(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs with safe defaults
  const cost = Math.max(0, Number(inputs.cost) || 0);
  const mode = (inputs.calculationMode as string) || 'cost-to-price';
  const inputMarkupPercent = Number(inputs.markupPercent) || 0;
  const inputSellingPrice = Math.max(0, Number(inputs.sellingPrice) || 0);

  let sellingPrice: number;
  let markupPercent: number;

  // 2. Calculate based on mode
  if (mode === 'price-to-markup') {
    // Given cost + selling price, find markup%
    sellingPrice = inputSellingPrice;
    markupPercent = cost > 0
      ? Math.round(((sellingPrice - cost) / cost) * 10000) / 100
      : 0;
  } else {
    // cost-to-price: Given cost + markup%, find selling price
    markupPercent = inputMarkupPercent;
    sellingPrice = Math.round(cost * (1 + markupPercent / 100) * 100) / 100;
  }

  // 3. Calculate gross profit
  const grossProfit = Math.round((sellingPrice - cost) * 100) / 100;

  // 4. Calculate equivalent margin percentage
  const marginPercent = sellingPrice > 0
    ? Math.round((grossProfit / sellingPrice) * 10000) / 100
    : 0;

  // 5. Build markup-to-margin reference table
  const markupLevels = [10, 20, 25, 33.33, 50, 75, 100, 150, 200];
  const markupToMarginTable: MarkupToMarginRow[] = markupLevels.map((mu) => {
    const sell = Math.round((1 + mu / 100) * 100) / 100;
    const mar = Math.round((mu / (100 + mu)) * 10000) / 100;
    return {
      markup: mu,
      margin: mar,
      sellAt: sell,
    };
  });

  // 6. Summary value group
  const summary: { label: string; value: number }[] = [
    { label: 'Cost', value: Math.round(cost * 100) / 100 },
    { label: 'Selling Price', value: Math.round(sellingPrice * 100) / 100 },
    { label: 'Gross Profit', value: grossProfit },
    { label: 'Markup %', value: markupPercent },
    { label: 'Margin %', value: marginPercent },
  ];

  return {
    sellingPrice: Math.round(sellingPrice * 100) / 100,
    markupPercent,
    grossProfit,
    marginPercent,
    markupToMarginTable,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'markup': calculateMarkup,
};
