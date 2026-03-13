/**
 * Customer Acquisition Cost Calculator
 *
 * Formulas:
 *   CAC = (Marketing Spend + Sales Spend) / New Customers Acquired
 *   CAC Payback Period = CAC / Monthly Revenue per Customer
 *
 * Source: SaaS Metrics 2.0 — David Skok, Matrix Partners (2023).
 */

// ═══════════════════════════════════════════════════════
// Main function
// ═══════════════════════════════════════════════════════

/**
 * Calculates customer acquisition cost and payback period.
 *
 * CAC = Total Spend / New Customers
 * Payback = CAC / Monthly Revenue per Customer
 *
 * @param inputs - Record with marketingSpend, salesSpend, newCustomers, monthlyRevenuePerCustomer
 * @returns Record with cac, cacPaybackMonths, costBreakdown, summary
 */
export function calculateCustomerAcquisitionCost(
  inputs: Record<string, unknown>
): Record<string, unknown> {
  // 1. Parse inputs
  const marketingSpend = Math.max(0, Number(inputs.marketingSpend) || 0);
  const salesSpend = Math.max(0, Number(inputs.salesSpend) || 0);
  const newCustomers = Math.max(1, Math.round(Number(inputs.newCustomers) || 1));
  const monthlyRevenuePerCustomer = Math.max(0, Number(inputs.monthlyRevenuePerCustomer) || 0);

  // 2. Calculate CAC
  const totalSpend = marketingSpend + salesSpend;
  const cac = Math.round((totalSpend / newCustomers) * 100) / 100;

  // 3. CAC Payback Period (months)
  const cacPaybackMonths = monthlyRevenuePerCustomer > 0
    ? Math.round((cac / monthlyRevenuePerCustomer) * 10) / 10
    : 0;

  // 4. Cost breakdown
  const marketingPercent = totalSpend > 0
    ? Math.round((marketingSpend / totalSpend) * 1000) / 10
    : 0;
  const salesPercent = totalSpend > 0
    ? Math.round((salesSpend / totalSpend) * 1000) / 10
    : 0;

  const costBreakdown: { label: string; value: number | string }[] = [
    { label: 'Marketing Spend', value: marketingSpend },
    { label: 'Sales Spend', value: salesSpend },
    { label: 'Total Spend', value: totalSpend },
    { label: 'Marketing %', value: `${marketingPercent}%` },
    { label: 'Sales %', value: `${salesPercent}%` },
  ];

  // 5. Summary
  const summary: { label: string; value: number | string }[] = [
    { label: 'Customer Acquisition Cost', value: cac },
    { label: 'Total Spend', value: totalSpend },
    { label: 'New Customers', value: newCustomers },
    { label: 'CAC Payback Period', value: `${cacPaybackMonths} months` },
    { label: 'Monthly Revenue/Customer', value: monthlyRevenuePerCustomer },
  ];

  return {
    cac,
    cacPaybackMonths,
    costBreakdown,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<
  string,
  (inputs: Record<string, unknown>) => Record<string, unknown>
> = {
  'customer-acquisition-cost': calculateCustomerAcquisitionCost,
};
