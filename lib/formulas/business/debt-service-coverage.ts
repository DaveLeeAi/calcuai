/**
 * Debt Service Coverage Ratio (DSCR) Calculator
 *
 * Formulas:
 *   DSCR = Net Operating Income / Total Debt Service
 *   Excess Cash Flow = NOI - Total Debt Service
 *   Maximum Loan Payment = NOI / Required DSCR
 *
 * Source: Federal Reserve — "Commercial Real Estate Lending Standards" (SR 15-17);
 *         FDIC risk management guidance.
 */

// ═══════════════════════════════════════════════════════
// Main function
// ═══════════════════════════════════════════════════════

/**
 * Calculates DSCR, excess cash flow, maximum affordable loan payment,
 * and qualification status based on a lender's required DSCR.
 *
 * DSCR = NOI / Annual Debt Service
 * Excess Cash Flow = NOI - Annual Debt Service
 * Max Loan Payment = NOI / Required DSCR
 *
 * @param inputs - Record with netOperatingIncome, annualDebtService, requiredDSCR
 * @returns Record with dscr, excessCashFlow, maxLoanPayment,
 *   qualificationStatus, summary
 */
export function calculateDebtServiceCoverage(
  inputs: Record<string, unknown>
): Record<string, unknown> {
  // 1. Parse inputs
  const netOperatingIncome = Number(inputs.netOperatingIncome) || 0;
  const annualDebtService = Math.max(0, Number(inputs.annualDebtService) || 0);
  const requiredDSCR = Math.max(1, Math.min(3, Number(inputs.requiredDSCR) || 1.25));

  // 2. DSCR
  const dscr = annualDebtService > 0
    ? Math.round((netOperatingIncome / annualDebtService) * 100) / 100
    : 0;

  // 3. Excess Cash Flow
  const excessCashFlow = Math.round(
    (netOperatingIncome - annualDebtService) * 100
  ) / 100;

  // 4. Maximum Loan Payment at required DSCR
  const maxLoanPayment = requiredDSCR > 0
    ? Math.round((netOperatingIncome / requiredDSCR) * 100) / 100
    : 0;

  // 5. Qualification Status
  let qualificationStatus: string;
  if (dscr >= requiredDSCR) {
    qualificationStatus = 'Qualifies';
  } else if (dscr >= 1.0) {
    qualificationStatus = 'Borderline';
  } else {
    qualificationStatus = 'Does Not Qualify';
  }

  // 6. Summary
  const summary: { label: string; value: number | string }[] = [
    { label: 'DSCR', value: `${dscr}x` },
    { label: 'Required DSCR', value: `${requiredDSCR}x` },
    { label: 'Excess Cash Flow', value: excessCashFlow },
    { label: 'Max Affordable Debt Service', value: maxLoanPayment },
    { label: 'Net Operating Income', value: netOperatingIncome },
    { label: 'Annual Debt Service', value: annualDebtService },
    { label: 'Qualification', value: qualificationStatus },
  ];

  return {
    dscr,
    excessCashFlow,
    maxLoanPayment,
    qualificationStatus,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<
  string,
  (inputs: Record<string, unknown>) => Record<string, unknown>
> = {
  'debt-service-coverage': calculateDebtServiceCoverage,
};
