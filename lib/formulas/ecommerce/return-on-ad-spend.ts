/**
 * Return on Ad Spend (ROAS) Calculator
 *
 * Formulas:
 *   ROAS = Revenue from Ads / Ad Spend
 *   Break-Even ROAS = 1 / Gross Margin (as decimal)
 *   Net Profit = Ad Revenue × (Gross Margin% / 100) − Ad Spend − (Ad Revenue × Fees% / 100)
 *   Profit ROAS = Net Profit / Ad Spend
 *
 * Source: Google Ads Help — Understanding ROAS (2025).
 * Source: Meta Business — Ad Performance Metrics (2025).
 */

// ===============================================
// Interfaces
// ===============================================

export interface ROASInput {
  adSpend: number;
  adRevenue: number;
  grossMarginPercent: number;
  additionalCostsPercent: number;
}

export interface ROASScenarioRow {
  scenario: string;
  roas: number;
  revenue: number;
  netProfit: number;
}

export interface ROASOutput {
  roas: number;
  breakEvenROAS: number;
  netProfitFromAds: number;
  roasScenarioTable: ROASScenarioRow[];
  summary: { label: string; value: number }[];
}

// ===============================================
// Main function
// ===============================================

/**
 * Calculates ROAS, break-even ROAS, and net profit from ad spend.
 *
 * ROAS = Revenue / Ad Spend
 * Break-Even ROAS = 1 / (Gross Margin − Fees) expressed as decimal
 * Net Profit = Revenue × (Gross Margin% − Fees%) / 100 − Ad Spend
 *
 * @param inputs - Record with adSpend, adRevenue, grossMarginPercent, additionalCostsPercent
 * @returns Record with roas, breakEvenROAS, netProfitFromAds, roasScenarioTable, summary
 */
export function calculateROAS(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs
  const adSpend = Math.max(0.01, Number(inputs.adSpend) || 0);
  const adRevenue = Math.max(0, Number(inputs.adRevenue) || 0);
  const grossMarginPercent = Math.min(99, Math.max(1, Number(inputs.grossMarginPercent) || 50));
  const additionalCostsPercent = Math.min(50, Math.max(0, Number(inputs.additionalCostsPercent) || 0));

  // 2. Calculate ROAS
  const roas = Math.round((adRevenue / adSpend) * 100) / 100;

  // 3. Net contribution margin (gross margin minus fees)
  const netMarginDecimal = (grossMarginPercent - additionalCostsPercent) / 100;

  // 4. Break-even ROAS: the ROAS at which ad profit exactly equals 0
  //    net profit = revenue × netMargin − adSpend = 0
  //    revenue = adSpend / netMargin
  //    breakEvenROAS = revenue / adSpend = 1 / netMargin
  const breakEvenROAS = netMarginDecimal > 0
    ? Math.round((1 / netMarginDecimal) * 100) / 100
    : 0;

  // 5. Net profit
  const netProfitFromAds = Math.round((adRevenue * netMarginDecimal - adSpend) * 100) / 100;

  // 6. Scenario table: half spend, current, 2x, 3x, break-even
  const generateScenario = (label: string, revenue: number): ROASScenarioRow => {
    const scenarioROAS = Math.round((revenue / adSpend) * 100) / 100;
    const scenarioProfit = Math.round((revenue * netMarginDecimal - adSpend) * 100) / 100;
    return { scenario: label, roas: scenarioROAS, revenue: Math.round(revenue * 100) / 100, netProfit: scenarioProfit };
  };

  const breakEvenRevenue = adSpend / (netMarginDecimal > 0 ? netMarginDecimal : 1);
  const roasScenarioTable: ROASScenarioRow[] = [
    generateScenario('Break-Even', breakEvenRevenue),
    generateScenario('Current', adRevenue),
    generateScenario('2× Spend ROI', adRevenue * 1.5),
    generateScenario('3× Spend ROI', adRevenue * 2),
  ];

  // 7. Summary
  const summary: { label: string; value: number }[] = [
    { label: 'Ad Spend', value: adSpend },
    { label: 'Ad Revenue', value: adRevenue },
    { label: 'ROAS', value: roas },
    { label: 'Break-Even ROAS', value: breakEvenROAS },
    { label: 'Net Profit', value: netProfitFromAds },
    { label: 'Gross Margin %', value: grossMarginPercent },
  ];

  return {
    roas,
    breakEvenROAS,
    netProfitFromAds,
    roasScenarioTable,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'return-on-ad-spend': calculateROAS,
};
