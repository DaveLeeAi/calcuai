/**
 * Landlord ROI Calculator
 *
 * Formulas:
 *   Total Return = Cash Flow + Principal Paydown + Appreciation Gain + Tax Benefits
 *   Total ROI = Total Return / Total Cash Invested × 100
 *   Cash-on-Cash ROI = Annual Cash Flow / Total Cash Invested × 100
 *   Annualized Total ROI = (Total ROI / holdingYears)
 *
 * Source: Investopedia — Return on Investment (ROI) for Real Estate (2025).
 * Source: National Association of Realtors — Real Estate Investment Returns (2025).
 */

export interface LandlordROIInput {
  totalCashInvested: number;
  annualCashFlow: number;
  annualPrincipalPaydown: number;
  currentPropertyValue: number;
  purchasePrice: number;
  annualTaxBenefits: number;
  holdingYears: number;
}

export interface LandlordROIOutput {
  totalROI: number;
  cashOnCashROI: number;
  annualizedROI: number;
  appreciationGain: number;
  totalCumulativeReturn: number;
  roiBreakdown: { label: string; value: number; percent: number }[];
  summary: { label: string; value: number }[];
}

/**
 * Calculates comprehensive landlord ROI across all return components.
 *
 * Total Return = Cash Flow + Principal Paydown + Appreciation + Tax Benefits
 * Total ROI = Total Return / Cash Invested × 100
 *
 * @param inputs - Record with totalCashInvested, annualCashFlow, annualPrincipalPaydown, property values, tax benefits, holdingYears
 * @returns Record with totalROI, cashOnCashROI, annualizedROI, appreciationGain, roiBreakdown, summary
 */
export function calculateLandlordROI(inputs: Record<string, unknown>): Record<string, unknown> {
  const totalCashInvested = Math.max(1, Number(inputs.totalCashInvested) || 1);
  const annualCashFlow = Number(inputs.annualCashFlow) || 0;
  const annualPrincipalPaydown = Math.max(0, Number(inputs.annualPrincipalPaydown) || 0);
  const currentPropertyValue = Math.max(0, Number(inputs.currentPropertyValue) || 0);
  const purchasePrice = Math.max(1, Number(inputs.purchasePrice) || 1);
  const annualTaxBenefits = Math.max(0, Number(inputs.annualTaxBenefits) || 0);
  const holdingYears = Math.max(1, Math.round(Number(inputs.holdingYears) || 5));

  const appreciationGain = parseFloat(Math.max(0, currentPropertyValue - purchasePrice).toFixed(2));
  const cumulativeCashFlow = parseFloat((annualCashFlow * holdingYears).toFixed(2));
  const cumulativePrincipalPaydown = parseFloat((annualPrincipalPaydown * holdingYears).toFixed(2));
  const cumulativeTaxBenefits = parseFloat((annualTaxBenefits * holdingYears).toFixed(2));

  const totalCumulativeReturn = parseFloat((cumulativeCashFlow + cumulativePrincipalPaydown + appreciationGain + cumulativeTaxBenefits).toFixed(2));
  const totalROI = parseFloat(((totalCumulativeReturn / totalCashInvested) * 100).toFixed(2));
  const cashOnCashROI = parseFloat(((annualCashFlow / totalCashInvested) * 100).toFixed(2));
  const annualizedROI = parseFloat((totalROI / holdingYears).toFixed(2));

  const roiBreakdown = [
    {
      label: 'Cash Flow',
      value: cumulativeCashFlow,
      percent: totalCumulativeReturn !== 0 ? parseFloat(((cumulativeCashFlow / totalCumulativeReturn) * 100).toFixed(1)) : 0,
    },
    {
      label: 'Principal Paydown',
      value: cumulativePrincipalPaydown,
      percent: totalCumulativeReturn !== 0 ? parseFloat(((cumulativePrincipalPaydown / totalCumulativeReturn) * 100).toFixed(1)) : 0,
    },
    {
      label: 'Appreciation',
      value: appreciationGain,
      percent: totalCumulativeReturn !== 0 ? parseFloat(((appreciationGain / totalCumulativeReturn) * 100).toFixed(1)) : 0,
    },
    {
      label: 'Tax Benefits',
      value: cumulativeTaxBenefits,
      percent: totalCumulativeReturn !== 0 ? parseFloat(((cumulativeTaxBenefits / totalCumulativeReturn) * 100).toFixed(1)) : 0,
    },
  ];

  const summary: { label: string; value: number }[] = [
    { label: 'Total Cash Invested', value: totalCashInvested },
    { label: 'Total Return', value: totalCumulativeReturn },
    { label: 'Total ROI (%)', value: totalROI },
    { label: 'Cash-on-Cash ROI (%)', value: cashOnCashROI },
    { label: 'Annualized ROI (%)', value: annualizedROI },
    { label: 'Appreciation Gain', value: appreciationGain },
  ];

  return { totalROI, cashOnCashROI, annualizedROI, appreciationGain, totalCumulativeReturn, roiBreakdown, summary };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'landlord-roi': calculateLandlordROI,
};
