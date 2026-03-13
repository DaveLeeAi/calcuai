/**
 * Customer Lifetime Value Calculator
 *
 * Formulas:
 *   Simple CLV = Average Purchase Value × Purchase Frequency × Customer Lifespan
 *   Subscription CLV = (ARPU × Gross Margin %) / Churn Rate
 *   Net CLV = CLV − Acquisition Cost
 *   CLV:CAC Ratio = CLV / Acquisition Cost
 *   Annual Value (simple) = Average Purchase Value × Purchase Frequency
 *   Annual Value (subscription) = Monthly Revenue × 12
 *
 * Source: Harvard Business Review — "The Value of Keeping the Right Customers" (2014).
 */

// ═══════════════════════════════════════════════════════
// Main function
// ═══════════════════════════════════════════════════════

/**
 * Calculates customer lifetime value using simple or subscription model.
 *
 * Simple: CLV = Avg Purchase Value × Purchase Frequency × Customer Lifespan
 * Subscription: CLV = (ARPU × Gross Margin%) / Churn Rate
 *
 * @param inputs - Record with calculationMode, avgPurchaseValue, purchaseFrequency,
 *   customerLifespan, monthlyRevenue, grossMarginPercent, monthlyChurnRate, acquisitionCost
 * @returns Record with clv, netCLV, clvToCAC, annualValue, summary
 */
export function calculateCustomerLifetimeValue(
  inputs: Record<string, unknown>
): Record<string, unknown> {
  // 1. Parse inputs
  const mode = String(inputs.calculationMode || 'simple');
  const avgPurchaseValue = Math.max(0, Number(inputs.avgPurchaseValue) || 0);
  const purchaseFrequency = Math.max(0, Number(inputs.purchaseFrequency) || 0);
  const customerLifespan = Math.max(0, Number(inputs.customerLifespan) || 0);
  const monthlyRevenue = Math.max(0, Number(inputs.monthlyRevenue) || 0);
  const grossMarginPercent = Math.min(100, Math.max(0, Number(inputs.grossMarginPercent) || 0));
  const monthlyChurnRate = Math.min(100, Math.max(0, Number(inputs.monthlyChurnRate) || 0));
  const acquisitionCost = Math.max(0, Number(inputs.acquisitionCost) || 0);

  let clv = 0;
  let annualValue = 0;

  if (mode === 'subscription') {
    // 2a. Subscription CLV = (ARPU × Gross Margin%) / Monthly Churn Rate
    // Both margin and churn are percentages, so: (ARPU × margin/100) / (churn/100)
    if (monthlyChurnRate > 0) {
      const monthlyGrossProfit = monthlyRevenue * (grossMarginPercent / 100);
      clv = monthlyGrossProfit / (monthlyChurnRate / 100);
    }
    annualValue = monthlyRevenue * 12;
  } else {
    // 2b. Simple CLV = Average Purchase Value × Purchase Frequency × Customer Lifespan
    clv = avgPurchaseValue * purchaseFrequency * customerLifespan;
    annualValue = avgPurchaseValue * purchaseFrequency;
  }

  // 3. Net CLV
  const netCLV = clv - acquisitionCost;

  // 4. CLV:CAC ratio
  const clvToCAC = acquisitionCost > 0
    ? Math.round((clv / acquisitionCost) * 10) / 10
    : 0;

  // 5. Round currency values
  clv = Math.round(clv * 100) / 100;
  annualValue = Math.round(annualValue * 100) / 100;
  const netCLVRounded = Math.round(netCLV * 100) / 100;

  // 6. Summary
  const summary: { label: string; value: number | string }[] = [
    { label: 'Customer Lifetime Value', value: clv },
    { label: 'Acquisition Cost (CAC)', value: acquisitionCost },
    { label: 'Net CLV', value: netCLVRounded },
    { label: 'CLV:CAC Ratio', value: `${clvToCAC}:1` },
    { label: 'Annual Customer Value', value: annualValue },
  ];

  if (mode === 'subscription') {
    const avgLifespanMonths = monthlyChurnRate > 0
      ? Math.round((1 / (monthlyChurnRate / 100)) * 10) / 10
      : 0;
    summary.push({ label: 'Avg Customer Lifespan', value: `${avgLifespanMonths} months` });
  }

  return {
    clv,
    netCLV: netCLVRounded,
    clvToCAC,
    annualValue,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<
  string,
  (inputs: Record<string, unknown>) => Record<string, unknown>
> = {
  'customer-lifetime-value': calculateCustomerLifetimeValue,
};
