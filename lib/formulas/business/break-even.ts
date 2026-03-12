/**
 * Break Even Calculator — Units & Revenue to Break Even
 *
 * Formulas:
 *   Break-Even Units = Fixed Costs / (Price per Unit − Variable Cost per Unit)
 *   Break-Even Revenue = Fixed Costs / (1 − (Variable Cost per Unit / Price per Unit))
 *   Contribution Margin = Price per Unit − Variable Cost per Unit
 *   Contribution Margin Ratio = Contribution Margin / Price per Unit
 *
 * With profit target:
 *   Units for Target Profit = (Fixed Costs + Target Profit) / Contribution Margin
 *
 * Source: Horngren, Datar & Rajan — "Cost Accounting: A Managerial Emphasis" (Pearson, 16th ed.)
 */

// ═══════════════════════════════════════════════════════
// Interfaces
// ═══════════════════════════════════════════════════════

export interface BreakEvenInput {
  fixedCosts: number;
  pricePerUnit: number;
  variableCostPerUnit: number;
  targetProfit: number;
}

export interface BreakEvenChartPoint {
  units: number;
  totalRevenue: number;
  totalCost: number;
  profit: number;
}

export interface BreakEvenOutput {
  breakEvenUnits: number;
  breakEvenRevenue: number;
  contributionMargin: number;
  contributionMarginRatio: number;
  unitsForTargetProfit: number;
  revenueForTargetProfit: number;
  chartData: BreakEvenChartPoint[];
  summary: { label: string; value: number }[];
}

// ═══════════════════════════════════════════════════════
// Main function: Break Even Calculator
// ═══════════════════════════════════════════════════════

/**
 * Calculates break-even units, break-even revenue, contribution margin,
 * and generates chart data for cost-revenue visualization.
 *
 * Break-Even Units = Fixed Costs / (Price − Variable Cost)
 * Break-Even Revenue = Break-Even Units × Price
 *
 * @param inputs - Record with fixedCosts, pricePerUnit, variableCostPerUnit, targetProfit
 * @returns Record with breakEvenUnits, breakEvenRevenue, contributionMargin, etc.
 */
export function calculateBreakEven(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs with safe defaults
  const fixedCosts = Math.max(0, Number(inputs.fixedCosts) || 0);
  const pricePerUnit = Math.max(0, Number(inputs.pricePerUnit) || 0);
  const variableCostPerUnit = Math.max(0, Number(inputs.variableCostPerUnit) || 0);
  const targetProfit = Math.max(0, Number(inputs.targetProfit) || 0);

  // 2. Calculate contribution margin
  const contributionMargin = pricePerUnit - variableCostPerUnit;
  const contributionMarginRatio = pricePerUnit > 0
    ? Math.round((contributionMargin / pricePerUnit) * 10000) / 100
    : 0;

  // 3. Calculate break-even point
  let breakEvenUnits = 0;
  let breakEvenRevenue = 0;

  if (contributionMargin > 0) {
    breakEvenUnits = Math.ceil(fixedCosts / contributionMargin);
    breakEvenRevenue = Math.round(breakEvenUnits * pricePerUnit * 100) / 100;
  }

  // 4. Calculate units for target profit
  let unitsForTargetProfit = 0;
  let revenueForTargetProfit = 0;

  if (contributionMargin > 0) {
    unitsForTargetProfit = Math.ceil((fixedCosts + targetProfit) / contributionMargin);
    revenueForTargetProfit = Math.round(unitsForTargetProfit * pricePerUnit * 100) / 100;
  }

  // 5. Generate chart data (revenue vs cost lines)
  const maxUnits = Math.max(breakEvenUnits * 2, unitsForTargetProfit * 1.2, 100);
  const stepSize = Math.max(1, Math.round(maxUnits / 20));
  const chartData: BreakEvenChartPoint[] = [];

  for (let units = 0; units <= maxUnits; units += stepSize) {
    const totalRevenue = Math.round(units * pricePerUnit * 100) / 100;
    const totalCost = Math.round((fixedCosts + units * variableCostPerUnit) * 100) / 100;
    const profit = Math.round((totalRevenue - totalCost) * 100) / 100;
    chartData.push({ units, totalRevenue, totalCost, profit });
  }

  // Ensure break-even point is in chart data
  if (contributionMargin > 0 && !chartData.some((p) => p.units === breakEvenUnits)) {
    const totalRevenue = Math.round(breakEvenUnits * pricePerUnit * 100) / 100;
    const totalCost = Math.round((fixedCosts + breakEvenUnits * variableCostPerUnit) * 100) / 100;
    const profit = Math.round((totalRevenue - totalCost) * 100) / 100;
    chartData.push({ units: breakEvenUnits, totalRevenue, totalCost, profit });
    chartData.sort((a, b) => a.units - b.units);
  }

  // 6. Summary value group
  const summary: { label: string; value: number }[] = [
    { label: 'Break-Even Units', value: breakEvenUnits },
    { label: 'Break-Even Revenue', value: breakEvenRevenue },
    { label: 'Contribution Margin', value: Math.round(contributionMargin * 100) / 100 },
    { label: 'CM Ratio', value: contributionMarginRatio },
    { label: 'Units for Target Profit', value: unitsForTargetProfit },
    { label: 'Revenue for Target Profit', value: revenueForTargetProfit },
  ];

  return {
    breakEvenUnits,
    breakEvenRevenue,
    contributionMargin: Math.round(contributionMargin * 100) / 100,
    contributionMarginRatio,
    unitsForTargetProfit,
    revenueForTargetProfit,
    chartData,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'break-even': calculateBreakEven,
};
