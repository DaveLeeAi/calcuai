/**
 * Revenue Calculator — Sales Revenue Projection
 *
 * Formulas:
 *   Total Revenue = Price per Unit * Units Sold
 *   Annual Revenue = Total Revenue * periods-per-year multiplier
 *   Revenue per Day = Annual Revenue / 365
 *   Projected Revenue = Current Period Revenue * (1 + Growth Rate / 100) ^ projectionPeriods
 *
 * Source: Harvard Business Review — Revenue forecasting fundamentals (2023).
 */

// ═══════════════════════════════════════════════════════
// Interfaces
// ═══════════════════════════════════════════════════════

export interface RevenueInput {
  pricePerUnit: number;
  unitsSold: number;
  timePeriod: 'monthly' | 'quarterly' | 'annual';
  growthRate: number;
  projectionPeriods: number;
}

export interface RevenueProjectionPoint {
  period: number;
  revenue: number;
}

export interface RevenueOutput {
  totalRevenue: number;
  annualRevenue: number;
  revenuePerDay: number;
  projectedRevenue: number;
  revenueProjection: RevenueProjectionPoint[];
  summary: { label: string; value: number }[];
}

// ═══════════════════════════════════════════════════════
// Main function: Revenue Calculator
// ═══════════════════════════════════════════════════════

/**
 * Calculates total revenue from price and units sold, projects future
 * revenue with a growth rate, and generates a projection chart.
 *
 * Total Revenue = Price per Unit × Units Sold
 * Projected Revenue = Revenue × (1 + Growth Rate / 100) ^ periods
 *
 * @param inputs - Record with pricePerUnit, unitsSold, timePeriod, growthRate, projectionPeriods
 * @returns Record with totalRevenue, annualRevenue, revenuePerDay, projectedRevenue, revenueProjection, summary
 */
export function calculateRevenue(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs with safe defaults
  const pricePerUnit = Math.max(0, Number(inputs.pricePerUnit) || 0);
  const unitsSold = Math.max(0, Number(inputs.unitsSold) || 0);
  const timePeriod = (inputs.timePeriod as string) || 'monthly';
  const growthRate = Number(inputs.growthRate) || 0;
  const projectionPeriods = Math.max(1, Math.min(60, Number(inputs.projectionPeriods) || 12));

  // 2. Calculate total revenue for the given period
  const totalRevenue = Math.round(pricePerUnit * unitsSold * 100) / 100;

  // 3. Calculate annual revenue based on time period
  let periodsPerYear: number;
  switch (timePeriod) {
    case 'quarterly':
      periodsPerYear = 4;
      break;
    case 'annual':
      periodsPerYear = 1;
      break;
    case 'monthly':
    default:
      periodsPerYear = 12;
      break;
  }
  const annualRevenue = Math.round(totalRevenue * periodsPerYear * 100) / 100;

  // 4. Calculate revenue per day
  const revenuePerDay = Math.round((annualRevenue / 365) * 100) / 100;

  // 5. Calculate projected revenue after growth
  const growthMultiplier = Math.pow(1 + growthRate / 100, projectionPeriods);
  const projectedRevenue = Math.round(totalRevenue * growthMultiplier * 100) / 100;

  // 6. Generate revenue projection chart data
  const revenueProjection: RevenueProjectionPoint[] = [];
  for (let period = 0; period <= projectionPeriods; period++) {
    const periodRevenue = Math.round(
      totalRevenue * Math.pow(1 + growthRate / 100, period) * 100
    ) / 100;
    revenueProjection.push({ period, revenue: periodRevenue });
  }

  // 7. Summary value group
  const summary: { label: string; value: number }[] = [
    { label: 'Total Revenue (per period)', value: totalRevenue },
    { label: 'Annual Revenue', value: annualRevenue },
    { label: 'Revenue per Day', value: revenuePerDay },
    { label: 'Projected Revenue', value: projectedRevenue },
    { label: 'Growth Rate', value: Math.round(growthRate * 100) / 100 },
    { label: 'Projection Periods', value: projectionPeriods },
  ];

  return {
    totalRevenue,
    annualRevenue,
    revenuePerDay,
    projectedRevenue,
    revenueProjection,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'revenue': calculateRevenue,
};
