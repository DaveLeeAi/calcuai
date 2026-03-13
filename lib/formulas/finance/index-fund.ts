/**
 * Index Fund Calculator
 *
 * Calculates future value of index fund investments with regular contributions,
 * showing the impact of expense ratios by comparing a low-cost fund against
 * a higher-cost alternative.
 *
 * Formula:
 *   Effective annual return = gross return - expense ratio
 *   Monthly rate r_m = (1 + effectiveReturn)^(1/12) - 1
 *   FV = P × (1 + r_m)^n + PMT × ((1 + r_m)^n - 1) / r_m
 *
 * Where:
 *   P   = initial investment
 *   PMT = monthly contribution
 *   n   = total months
 *   r_m = effective monthly return after fees
 *
 * The comparison fund uses the same formula with comparisonExpenseRatio
 * substituted to show how higher fees erode returns over time.
 *
 * Sources:
 *   Bogle, J. "The Little Book of Common Sense Investing" (2007)
 *   Vanguard research on expense ratio impact
 *   Standard compound growth formula (CFA Institute)
 */
export function calculateIndexFund(inputs: Record<string, unknown>): Record<string, unknown> {
  const initialInvestment = Math.max(0, Number(inputs.initialInvestment) || 0);
  const monthlyContribution = Math.max(0, Number(inputs.monthlyContribution) || 0);
  const annualReturn = (Number(inputs.annualReturn) || 0) / 100;
  const expenseRatio = (Number(inputs.expenseRatio) || 0) / 100;
  const investmentYears = Math.max(0, Number(inputs.investmentYears) || 0);
  const comparisonExpenseRatio = (Number(inputs.comparisonExpenseRatio) || 0) / 100;

  const totalMonths = investmentYears * 12;

  // ── Helper: compute FV given an effective annual return ──
  function computeFV(effectiveAnnual: number, months: number): number {
    if (months <= 0) return initialInvestment;
    if (effectiveAnnual <= 0) {
      return initialInvestment + monthlyContribution * months;
    }
    const monthlyRate = Math.pow(1 + effectiveAnnual, 1 / 12) - 1;
    const compoundFactor = Math.pow(1 + monthlyRate, months);
    const fvPrincipal = initialInvestment * compoundFactor;
    const fvContrib = monthlyContribution * ((compoundFactor - 1) / monthlyRate);
    return fvPrincipal + fvContrib;
  }

  // ── Helper: compute total fees paid over time ──
  function computeTotalFees(er: number, months: number): number {
    if (er <= 0 || months <= 0) return 0;
    const effectiveAnnual = annualReturn - er;
    // Approximate fees: difference between gross FV and net FV
    const grossFV = computeFV(annualReturn, months);
    const netFV = computeFV(Math.max(0, effectiveAnnual), months);
    return Math.max(0, grossFV - netFV);
  }

  // ── Primary fund (low expense ratio) ──
  const effectiveReturn = Math.max(0, annualReturn - expenseRatio);
  const futureValue = parseFloat(computeFV(effectiveReturn, totalMonths).toFixed(2));

  // ── Total contributions ──
  const totalContributions = parseFloat((initialInvestment + monthlyContribution * totalMonths).toFixed(2));

  // ── Total earnings ──
  const totalEarnings = parseFloat((futureValue - totalContributions).toFixed(2));

  // ── Expense ratio cost (total fees paid) ──
  const expenseRatioCost = parseFloat(computeTotalFees(expenseRatio, totalMonths).toFixed(2));

  // ── Comparison fund (higher expense ratio) ──
  const comparisonEffective = Math.max(0, annualReturn - comparisonExpenseRatio);
  const comparisonFutureValue = parseFloat(computeFV(comparisonEffective, totalMonths).toFixed(2));

  // ── Savings from choosing low-cost fund ──
  const expenseRatioSavings = parseFloat(Math.max(0, futureValue - comparisonFutureValue).toFixed(2));

  // ── Growth chart — both funds year by year ──
  const growthChart: { year: number; lowCostBalance: number; highCostBalance: number; contributions: number }[] = [];
  for (let y = 0; y <= investmentYears; y++) {
    const months = y * 12;
    const lowCostBal = parseFloat(computeFV(effectiveReturn, months).toFixed(2));
    const highCostBal = parseFloat(computeFV(comparisonEffective, months).toFixed(2));
    const contribs = parseFloat((initialInvestment + monthlyContribution * months).toFixed(2));
    growthChart.push({
      year: y,
      lowCostBalance: lowCostBal,
      highCostBalance: highCostBal,
      contributions: contribs,
    });
  }

  // ── Summary value group ──
  const summary = [
    { label: 'Future Value (Low-Cost Fund)', value: futureValue },
    { label: 'Future Value (High-Cost Fund)', value: comparisonFutureValue },
    { label: 'Total Contributions', value: totalContributions },
    { label: 'Total Earnings (Low-Cost)', value: totalEarnings },
    { label: 'Fee Savings (Low vs High)', value: expenseRatioSavings },
    { label: 'Total Fees Paid (Low-Cost)', value: expenseRatioCost },
  ];

  return {
    futureValue,
    totalContributions,
    totalEarnings,
    expenseRatioCost,
    comparisonFutureValue,
    expenseRatioSavings,
    growthChart,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'index-fund': calculateIndexFund,
};
