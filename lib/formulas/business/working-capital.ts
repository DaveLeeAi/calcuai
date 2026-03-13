/**
 * Working Capital Calculator
 *
 * Formulas:
 *   Working Capital = Current Assets - Current Liabilities
 *   Current Ratio = Current Assets / Current Liabilities
 *   Quick Ratio = (Cash + Receivables + Short-term Investments) / Current Liabilities
 *   Working Capital Ratio = (Working Capital / Revenue) x 100
 *   Days Working Capital = (Working Capital / Revenue) x 365
 *
 * Source: Brealey, Myers & Allen — "Principles of Corporate Finance" (13th ed.).
 */

// ═══════════════════════════════════════════════════════
// Main function
// ═══════════════════════════════════════════════════════

/**
 * Calculates working capital, current ratio, quick ratio,
 * working capital ratio, days working capital, and health status.
 *
 * Working Capital = Current Assets - Current Liabilities
 * Current Ratio = Current Assets / Current Liabilities
 * Quick Ratio = Quick Assets / Current Liabilities
 *
 * @param inputs - Record with cash, accountsReceivable, inventory,
 *   shortTermInvestments, otherCurrentAssets, accountsPayable,
 *   shortTermDebt, accruedExpenses, otherCurrentLiabilities, annualRevenue
 * @returns Record with workingCapital, currentRatio, quickRatio,
 *   workingCapitalRatio, daysWorkingCapital, healthStatus, summary
 */
export function calculateWorkingCapital(
  inputs: Record<string, unknown>
): Record<string, unknown> {
  // 1. Parse inputs
  const cash = Math.max(0, Number(inputs.cash) || 0);
  const accountsReceivable = Math.max(0, Number(inputs.accountsReceivable) || 0);
  const inventory = Math.max(0, Number(inputs.inventory) || 0);
  const shortTermInvestments = Math.max(0, Number(inputs.shortTermInvestments) || 0);
  const otherCurrentAssets = Math.max(0, Number(inputs.otherCurrentAssets) || 0);
  const accountsPayable = Math.max(0, Number(inputs.accountsPayable) || 0);
  const shortTermDebt = Math.max(0, Number(inputs.shortTermDebt) || 0);
  const accruedExpenses = Math.max(0, Number(inputs.accruedExpenses) || 0);
  const otherCurrentLiabilities = Math.max(0, Number(inputs.otherCurrentLiabilities) || 0);
  const annualRevenue = Math.max(0, Number(inputs.annualRevenue) || 0);

  // 2. Aggregate totals
  const currentAssets = cash + accountsReceivable + inventory + shortTermInvestments + otherCurrentAssets;
  const currentLiabilities = accountsPayable + shortTermDebt + accruedExpenses + otherCurrentLiabilities;
  const quickAssets = cash + accountsReceivable + shortTermInvestments;

  // 3. Working Capital
  const workingCapital = Math.round((currentAssets - currentLiabilities) * 100) / 100;

  // 4. Current Ratio
  const currentRatio = currentLiabilities > 0
    ? Math.round((currentAssets / currentLiabilities) * 100) / 100
    : 0;

  // 5. Quick Ratio
  const quickRatio = currentLiabilities > 0
    ? Math.round((quickAssets / currentLiabilities) * 100) / 100
    : 0;

  // 6. Working Capital Ratio (% of revenue)
  const workingCapitalRatio = annualRevenue > 0
    ? Math.round((workingCapital / annualRevenue) * 10000) / 100
    : 0;

  // 7. Days Working Capital
  const daysWorkingCapital = annualRevenue > 0
    ? Math.round((workingCapital / annualRevenue) * 365 * 100) / 100
    : 0;

  // 8. Health Status
  let healthStatus: string;
  if (currentRatio >= 1.5) {
    healthStatus = 'Healthy';
  } else if (currentRatio >= 1.0) {
    healthStatus = 'Tight';
  } else {
    healthStatus = 'Negative';
  }

  // 9. Summary
  const summary: { label: string; value: number | string }[] = [
    { label: 'Working Capital', value: workingCapital },
    { label: 'Current Ratio', value: `${currentRatio}:1` },
    { label: 'Quick Ratio', value: `${quickRatio}:1` },
    { label: 'Working Capital Ratio', value: `${workingCapitalRatio}%` },
    { label: 'Days Working Capital', value: `${daysWorkingCapital} days` },
    { label: 'Health Status', value: healthStatus },
    { label: 'Total Current Assets', value: currentAssets },
    { label: 'Total Current Liabilities', value: currentLiabilities },
  ];

  return {
    workingCapital,
    currentRatio,
    quickRatio,
    workingCapitalRatio,
    daysWorkingCapital,
    healthStatus,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<
  string,
  (inputs: Record<string, unknown>) => Record<string, unknown>
> = {
  'working-capital': calculateWorkingCapital,
};
