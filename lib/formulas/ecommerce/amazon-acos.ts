/**
 * Amazon ACoS, TACoS & Break-Even ACoS Calculator
 *
 * Formulas:
 *   ACoS = (Ad Spend / Ad-Attributed Sales) × 100
 *   TACoS = (Ad Spend / Total Store Sales) × 100
 *   ROAS = Ad-Attributed Sales / Ad Spend
 *   Break-Even ACoS = Gross Margin %  (at this ACoS, ad profit exactly equals 0)
 *   Profit ACoS = Gross Margin % − Target Net Profit %
 *
 * Source: Amazon Advertising — Campaign performance metrics guide (2025).
 * Source: Canopy Management — Amazon ACoS Benchmarks by Category (2025).
 */

// ─────────────────────────────────────────────
// Interfaces
// ─────────────────────────────────────────────

export interface ACoSStatusRow {
  metric: string;
  value: string;
  benchmark: string;
  status: string;
}

export interface ACoSOutput {
  acos: number;
  tacos: number;
  breakEvenAcos: number;
  roas: number;
  acosStatusTable: ACoSStatusRow[];
  summary: { label: string; value: number }[];
}

// ─────────────────────────────────────────────
// Main function
// ─────────────────────────────────────────────

/**
 * Calculates ACoS, TACoS, ROAS, and break-even ACoS for Amazon PPC campaigns.
 *
 * ACoS = Ad Spend / Ad Sales × 100
 * TACoS = Ad Spend / Total Sales × 100
 * Break-Even ACoS = Gross Margin% (the margin where ad profit = 0)
 * ROAS = Ad Sales / Ad Spend
 *
 * @param inputs - Record with adSpend, adAttributedSales, totalStoreSales, grossMargin
 * @returns Record with acos, tacos, breakEvenAcos, roas, acosStatusTable, summary
 */
export function calculateACoS(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs
  const adSpend = Math.max(0.01, Number(inputs.adSpend) || 0);
  const adSales = Math.max(0, Number(inputs.adAttributedSales) || 0);
  const totalSales = Math.max(0, Number(inputs.totalStoreSales) || 0);
  const grossMargin = Math.min(99, Math.max(1, Number(inputs.grossMargin) || 35));

  // 2. Core metrics
  const acos = adSales > 0 ? Math.round((adSpend / adSales) * 10000) / 100 : 0;
  const tacos = totalSales > 0 ? Math.round((adSpend / totalSales) * 10000) / 100 : 0;
  const roas = adSpend > 0 ? Math.round((adSales / adSpend) * 100) / 100 : 0;
  const breakEvenAcos = grossMargin; // ACoS % = Margin % → profit = 0

  // 3. Status assessment helpers
  const acosStatus = acos <= breakEvenAcos
    ? (acos <= breakEvenAcos * 0.7 ? '✅ Profitable' : '⚠️ Tight margin')
    : '❌ Unprofitable';

  const tacosStatus = tacos <= 10
    ? '✅ Healthy (<10%)'
    : tacos <= 15
    ? '⚠️ Elevated (10–15%)'
    : '❌ High (>15%)';

  const roasStatus = roas >= (100 / breakEvenAcos)
    ? '✅ Above break-even'
    : '❌ Below break-even';

  // 4. Status table
  const acosStatusTable: ACoSStatusRow[] = [
    {
      metric: 'ACoS',
      value: `${acos.toFixed(1)}%`,
      benchmark: `<${breakEvenAcos.toFixed(0)}% (break-even)`,
      status: acosStatus,
    },
    {
      metric: 'TACoS',
      value: `${tacos.toFixed(1)}%`,
      benchmark: '5–15% (healthy)',
      status: tacosStatus,
    },
    {
      metric: 'ROAS',
      value: `${roas.toFixed(2)}×`,
      benchmark: `>${(100 / breakEvenAcos).toFixed(1)}× (break-even)`,
      status: roasStatus,
    },
    {
      metric: 'Break-Even ACoS',
      value: `${breakEvenAcos.toFixed(1)}%`,
      benchmark: 'Equal to gross margin',
      status: acos < breakEvenAcos ? '✅ You have headroom' : '❌ Over limit',
    },
  ];

  // 5. Summary
  const adProfit = Math.round((adSales * (grossMargin / 100) - adSpend) * 100) / 100;
  const summary: { label: string; value: number }[] = [
    { label: 'Ad Spend', value: adSpend },
    { label: 'Ad-Attributed Sales', value: adSales },
    { label: 'Total Store Sales', value: totalSales },
    { label: 'ACoS', value: acos },
    { label: 'TACoS', value: tacos },
    { label: 'ROAS', value: roas },
    { label: 'Break-Even ACoS', value: breakEvenAcos },
    { label: 'Ad Profit/Loss', value: adProfit },
  ];

  return { acos, tacos, breakEvenAcos, roas, acosStatusTable, summary };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'amazon-acos': calculateACoS,
};
