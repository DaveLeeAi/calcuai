/**
 * Cash Flow Calculator
 *
 * Formulas:
 *   Operating Cash Flow = Net Income + Depreciation + Changes in Working Capital
 *   Free Cash Flow = Operating Cash Flow - Capital Expenditures
 *   Cash Flow Margin = (Operating Cash Flow / Revenue) x 100
 *   Net Cash Position = Beginning Cash + Operating CF - CapEx + Financing Activities
 *
 * Source: CFA Institute — "Financial Reporting and Analysis" (CFA Program Curriculum).
 */

// ═══════════════════════════════════════════════════════
// Main function
// ═══════════════════════════════════════════════════════

/**
 * Calculates operating cash flow, free cash flow, cash flow margin,
 * and net cash position from income statement and balance sheet items.
 *
 * OCF = Net Income + Depreciation + Working Capital Change
 * FCF = OCF - CapEx
 * CF Margin = OCF / Revenue x 100
 * Net Cash = Beginning Cash + OCF - CapEx + Financing
 *
 * @param inputs - Record with revenue, netIncome, depreciation,
 *   workingCapitalChange, capitalExpenditures, financingActivities, beginningCash
 * @returns Record with operatingCashFlow, freeCashFlow, cashFlowMargin,
 *   netCashPosition, summary
 */
export function calculateCashFlow(
  inputs: Record<string, unknown>
): Record<string, unknown> {
  // 1. Parse inputs
  const revenue = Math.max(0, Number(inputs.revenue) || 0);
  const netIncome = Number(inputs.netIncome) || 0;
  const depreciation = Math.max(0, Number(inputs.depreciation) || 0);
  // workingCapitalChange can be negative (positive = cash outflow)
  const workingCapitalChange = Number(inputs.workingCapitalChange) || 0;
  const capitalExpenditures = Math.max(0, Number(inputs.capitalExpenditures) || 0);
  const financingActivities = Number(inputs.financingActivities) || 0;
  const beginningCash = Math.max(0, Number(inputs.beginningCash) || 0);

  // 2. Operating Cash Flow
  // Note: an increase in working capital is a cash outflow, so we subtract it
  const operatingCashFlow = Math.round(
    (netIncome + depreciation - workingCapitalChange) * 100
  ) / 100;

  // 3. Free Cash Flow
  const freeCashFlow = Math.round(
    (operatingCashFlow - capitalExpenditures) * 100
  ) / 100;

  // 4. Cash Flow Margin
  const cashFlowMargin = revenue > 0
    ? Math.round((operatingCashFlow / revenue) * 10000) / 100
    : 0;

  // 5. Net Cash Position
  const netCashPosition = Math.round(
    (beginningCash + operatingCashFlow - capitalExpenditures + financingActivities) * 100
  ) / 100;

  // 6. Summary
  const summary: { label: string; value: number | string }[] = [
    { label: 'Operating Cash Flow', value: operatingCashFlow },
    { label: 'Free Cash Flow', value: freeCashFlow },
    { label: 'Cash Flow Margin', value: `${cashFlowMargin}%` },
    { label: 'Net Cash Position', value: netCashPosition },
    { label: 'Beginning Cash', value: beginningCash },
    { label: 'Capital Expenditures', value: capitalExpenditures },
  ];

  return {
    operatingCashFlow,
    freeCashFlow,
    cashFlowMargin,
    netCashPosition,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<
  string,
  (inputs: Record<string, unknown>) => Record<string, unknown>
> = {
  'cash-flow': calculateCashFlow,
};
