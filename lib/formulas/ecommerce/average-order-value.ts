/**
 * Average Order Value (AOV) Calculator
 *
 * Formulas:
 *   AOV = Total Revenue / Number of Orders
 *   Projected Revenue = Target AOV × Number of Orders
 *   Annual Revenue Lift = (Target AOV − Current AOV) × Monthly Orders × 12
 *
 * Source: Shopify — Average Order Value: Definition and How to Increase It (2025).
 * Source: BigCommerce — Ecommerce Metrics Guide (2024).
 */

// ===============================================
// Interfaces
// ===============================================

export interface AOVInput {
  totalRevenue: number;
  numberOfOrders: number;
  targetAOV: number;
  monthlyOrders: number;
}

export interface AOVBenchmarkRow {
  scenario: string;
  aov: number;
  monthlyRevenue: number;
  annualRevenue: number;
}

export interface AOVOutput {
  aov: number;
  projectedRevenueAtTargetAOV: number;
  annualAOVLift: number;
  aovBenchmarkTable: AOVBenchmarkRow[];
  summary: { label: string; value: number }[];
}

// ===============================================
// Main function
// ===============================================

/**
 * Calculates current AOV and models revenue impact of hitting a target AOV.
 *
 * AOV = Total Revenue / Number of Orders
 * Annual Revenue Lift = (Target AOV − Current AOV) × Monthly Orders × 12
 *
 * @param inputs - Record with totalRevenue, numberOfOrders, targetAOV, monthlyOrders
 * @returns Record with aov, projectedRevenueAtTargetAOV, annualAOVLift, aovBenchmarkTable, summary
 */
export function calculateAOV(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs
  const totalRevenue = Math.max(0, Number(inputs.totalRevenue) || 0);
  const numberOfOrders = Math.max(1, Number(inputs.numberOfOrders) || 1);
  const targetAOV = Math.max(0, Number(inputs.targetAOV) || 0);
  const monthlyOrders = Math.max(1, Number(inputs.monthlyOrders) || numberOfOrders);

  // 2. Current AOV
  const aov = Math.round((totalRevenue / numberOfOrders) * 100) / 100;

  // 3. Projected revenue if target AOV is hit (same order count)
  const projectedRevenueAtTargetAOV = targetAOV > 0
    ? Math.round(targetAOV * numberOfOrders * 100) / 100
    : Math.round(aov * numberOfOrders * 100) / 100;

  // 4. Annual lift from AOV improvement
  const aovDelta = targetAOV > 0 ? targetAOV - aov : 0;
  const annualAOVLift = Math.round(aovDelta * monthlyOrders * 12 * 100) / 100;

  // 5. Benchmark table: current, +10%, +20%, +30%, target
  const scenarios: { label: string; aovValue: number }[] = [
    { label: 'Current', aovValue: aov },
    { label: '+10%', aovValue: aov * 1.1 },
    { label: '+20%', aovValue: aov * 1.2 },
    { label: '+30%', aovValue: aov * 1.3 },
    ...(targetAOV > 0 && Math.abs(targetAOV - aov) > 0.01
      ? [{ label: 'Target', aovValue: targetAOV }]
      : []),
  ];

  const aovBenchmarkTable: AOVBenchmarkRow[] = scenarios.map(({ label, aovValue }) => {
    const rounded = Math.round(aovValue * 100) / 100;
    const monthly = Math.round(rounded * monthlyOrders * 100) / 100;
    return {
      scenario: label,
      aov: rounded,
      monthlyRevenue: monthly,
      annualRevenue: Math.round(monthly * 12 * 100) / 100,
    };
  });

  // 6. Summary
  const summary: { label: string; value: number }[] = [
    { label: 'Total Revenue', value: totalRevenue },
    { label: 'Number of Orders', value: numberOfOrders },
    { label: 'Current AOV', value: aov },
    { label: 'Target AOV', value: targetAOV > 0 ? targetAOV : aov },
    { label: 'Annual Revenue Lift', value: annualAOVLift },
  ];

  return {
    aov,
    projectedRevenueAtTargetAOV,
    annualAOVLift,
    aovBenchmarkTable,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'average-order-value': calculateAOV,
};
