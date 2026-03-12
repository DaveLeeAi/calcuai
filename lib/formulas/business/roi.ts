/**
 * ROI Calculator — Return on Investment with Timeline
 *
 * Formulas:
 *   Simple ROI = ((Final Value − Initial Investment) / Initial Investment) × 100
 *   Net Profit = Final Value − Initial Investment
 *   Annualized ROI = ((Final Value / Initial Investment) ^ (1 / Years)) − 1) × 100
 *   Total Return Multiple = Final Value / Initial Investment
 *
 * Source: CFA Institute — "Return on Investment" (Standards of Practice Handbook, 2023).
 */

// ═══════════════════════════════════════════════════════
// Interfaces
// ═══════════════════════════════════════════════════════

export interface ROIInput {
  initialInvestment: number;
  finalValue: number;
  investmentPeriodYears: number;
}

export interface ROIGrowthPoint {
  year: number;
  value: number;
}

export interface ROIOutput {
  roiPercent: number;
  netProfit: number;
  annualizedROI: number;
  totalReturnMultiple: number;
  growthOverTime: ROIGrowthPoint[];
  summary: { label: string; value: number }[];
}

// ═══════════════════════════════════════════════════════
// Main function: ROI Calculator
// ═══════════════════════════════════════════════════════

/**
 * Calculates simple ROI, annualized ROI, net profit, and generates
 * a growth-over-time chart assuming steady annualized growth.
 *
 * ROI % = ((Final Value − Initial Investment) / Initial Investment) × 100
 * Annualized ROI = ((Final Value / Initial Investment) ^ (1/years) − 1) × 100
 *
 * @param inputs - Record with initialInvestment, finalValue, investmentPeriodYears
 * @returns Record with roiPercent, netProfit, annualizedROI, totalReturnMultiple, growthOverTime, summary
 */
export function calculateROI(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs with safe defaults
  const initialInvestment = Math.max(0, Number(inputs.initialInvestment) || 0);
  const finalValue = Math.max(0, Number(inputs.finalValue) || 0);
  const investmentPeriodYears = Math.max(0, Number(inputs.investmentPeriodYears) || 1);

  // 2. Calculate simple ROI
  const netProfit = finalValue - initialInvestment;
  const roiPercent = initialInvestment > 0
    ? Math.round((netProfit / initialInvestment) * 10000) / 100
    : 0;

  // 3. Calculate total return multiple
  const totalReturnMultiple = initialInvestment > 0
    ? Math.round((finalValue / initialInvestment) * 1000) / 1000
    : 0;

  // 4. Calculate annualized ROI (CAGR)
  let annualizedROI = 0;
  if (initialInvestment > 0 && finalValue > 0 && investmentPeriodYears > 0) {
    const ratio = finalValue / initialInvestment;
    annualizedROI = Math.round(
      (Math.pow(ratio, 1 / investmentPeriodYears) - 1) * 10000
    ) / 100;
  }

  // 5. Generate growth over time chart (assuming steady annualized growth)
  const growthOverTime: ROIGrowthPoint[] = [];
  if (initialInvestment > 0 && investmentPeriodYears > 0) {
    const annualGrowthRate = annualizedROI / 100;
    const years = Math.ceil(investmentPeriodYears);

    for (let year = 0; year <= years; year++) {
      const value = Math.round(
        initialInvestment * Math.pow(1 + annualGrowthRate, year) * 100
      ) / 100;
      growthOverTime.push({ year, value });
    }
  } else {
    growthOverTime.push({ year: 0, value: initialInvestment });
  }

  // 6. Summary value group
  const summary: { label: string; value: number }[] = [
    { label: 'Initial Investment', value: Math.round(initialInvestment * 100) / 100 },
    { label: 'Final Value', value: Math.round(finalValue * 100) / 100 },
    { label: 'Net Profit', value: Math.round(netProfit * 100) / 100 },
    { label: 'ROI', value: roiPercent },
    { label: 'Annualized ROI', value: annualizedROI },
    { label: 'Return Multiple', value: totalReturnMultiple },
  ];

  return {
    roiPercent,
    netProfit: Math.round(netProfit * 100) / 100,
    annualizedROI,
    totalReturnMultiple,
    growthOverTime,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'roi': calculateROI,
};
