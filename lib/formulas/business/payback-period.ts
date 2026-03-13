/**
 * Payback Period Calculator
 *
 * Formulas:
 *   Simple Payback Period = Initial Investment / Annual Cash Flow
 *   Discounted Payback: find year where cumulative discounted cash flow ≥ investment
 *   Discounted Cash Flow (year n) = Annual Cash Flow / (1 + r)^n
 *
 * Source: Brealey, Myers & Allen, Principles of Corporate Finance (13th ed., 2020).
 */

// ═══════════════════════════════════════════════════════
// Interfaces
// ═══════════════════════════════════════════════════════

export interface PaybackYearRow {
  year: number;
  cashFlow: number;
  discountedCashFlow: number;
  cumulative: number;
}

// ═══════════════════════════════════════════════════════
// Main function
// ═══════════════════════════════════════════════════════

/**
 * Calculates simple and discounted payback period with year-by-year table.
 *
 * Simple Payback = Initial Investment / Annual Cash Flow
 * Discounted Payback = year where cumulative PV of cash flows ≥ investment
 *
 * @param inputs - Record with initialInvestment, annualCashFlow, discountRate
 * @returns Record with paybackPeriod, discountedPaybackPeriod, totalReturn, yearByYearTable, summary
 */
export function calculatePaybackPeriod(
  inputs: Record<string, unknown>
): Record<string, unknown> {
  // 1. Parse inputs
  const initialInvestment = Math.max(0, Number(inputs.initialInvestment) || 0);
  const annualCashFlow = Math.max(0, Number(inputs.annualCashFlow) || 0);
  const discountRate = Math.min(50, Math.max(0, Number(inputs.discountRate) || 0)) / 100;

  // 2. Simple payback period
  let paybackPeriod = 0;
  if (annualCashFlow > 0 && initialInvestment > 0) {
    paybackPeriod = Math.round((initialInvestment / annualCashFlow) * 100) / 100;
  }

  // 3. Build year-by-year table (up to max 50 years or until payback)
  const maxYears = Math.min(50, Math.ceil(paybackPeriod) + 5 || 20);
  const yearByYearTable: PaybackYearRow[] = [];
  let cumulativeDiscounted = 0;
  let discountedPaybackPeriod = 0;
  let discountedPaybackFound = false;

  for (let year = 1; year <= maxYears; year++) {
    const discountedCF = discountRate > 0
      ? annualCashFlow / Math.pow(1 + discountRate, year)
      : annualCashFlow;
    cumulativeDiscounted += discountedCF;

    yearByYearTable.push({
      year,
      cashFlow: Math.round(annualCashFlow * 100) / 100,
      discountedCashFlow: Math.round(discountedCF * 100) / 100,
      cumulative: Math.round(cumulativeDiscounted * 100) / 100,
    });

    // Find discounted payback year (interpolate within the year)
    if (!discountedPaybackFound && cumulativeDiscounted >= initialInvestment) {
      const prevCumulative = cumulativeDiscounted - discountedCF;
      const remaining = initialInvestment - prevCumulative;
      const fraction = discountedCF > 0 ? remaining / discountedCF : 0;
      discountedPaybackPeriod = Math.round((year - 1 + fraction) * 100) / 100;
      discountedPaybackFound = true;
    }
  }

  // If discounted payback was never reached within maxYears
  if (!discountedPaybackFound && discountRate > 0) {
    discountedPaybackPeriod = -1; // indicates never pays back
  }

  // If no discount rate, discounted payback equals simple payback
  if (discountRate === 0) {
    discountedPaybackPeriod = paybackPeriod;
  }

  // 4. Total return over simple payback period
  const paybackYears = Math.ceil(paybackPeriod) || 0;
  const totalReturn = Math.round(annualCashFlow * paybackYears * 100) / 100;

  // 5. Summary
  const summary: { label: string; value: number | string }[] = [
    { label: 'Initial Investment', value: initialInvestment },
    { label: 'Annual Cash Flow', value: annualCashFlow },
    { label: 'Simple Payback Period', value: `${paybackPeriod} years` },
  ];

  if (discountRate > 0) {
    summary.push({
      label: 'Discounted Payback Period',
      value: discountedPaybackPeriod >= 0
        ? `${discountedPaybackPeriod} years`
        : 'Never (exceeds 50 years)',
    });
    summary.push({ label: 'Discount Rate', value: `${(discountRate * 100).toFixed(1)}%` });
  }

  summary.push({ label: 'Total Return (over payback)', value: totalReturn });

  return {
    paybackPeriod,
    discountedPaybackPeriod: discountRate > 0 ? discountedPaybackPeriod : paybackPeriod,
    totalReturn,
    yearByYearTable,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<
  string,
  (inputs: Record<string, unknown>) => Record<string, unknown>
> = {
  'payback-period': calculatePaybackPeriod,
};
