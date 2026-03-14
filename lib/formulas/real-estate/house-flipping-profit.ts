/**
 * House Flipping Profit Calculator
 *
 * Formulas:
 *   Total Investment = Purchase Price + Rehab Cost + Holding Costs + Closing Costs In
 *   Net Profit = ARV − Total Investment − Selling Costs
 *   ROI = (Net Profit / Total Investment) × 100
 *   Annualized ROI = ((1 + ROI/100)^(12/holdingMonths) − 1) × 100
 *   Max Allowable Offer (70% Rule) = ARV × 0.70 − Rehab Cost
 *
 * Source: BiggerPockets — House Flipping Guide & 70% Rule (2025).
 * Source: National Association of Realtors — Investment Property Returns (2025).
 */

export interface HouseFlippingInput {
  arv: number;
  purchasePrice: number;
  rehabCost: number;
  holdingMonths: number;
  monthlyHoldingCost: number;
  buyingClosingCostPercent: number;
  sellingClosingCostPercent: number;
}

export interface HouseFlippingOutput {
  netProfit: number;
  roi: number;
  annualizedRoi: number;
  totalInvestment: number;
  totalSellingCosts: number;
  maxAllowableOffer: number;
  summary: { label: string; value: number }[];
}

/**
 * Calculates house flipping profit, ROI, and the 70% rule maximum offer.
 *
 * Net Profit = ARV − Purchase − Rehab − Holding Costs − Closing Costs (buy + sell)
 * ROI = Net Profit / Total Investment × 100
 * MAO = ARV × 0.70 − Rehab Cost
 *
 * @param inputs - Record with arv, purchasePrice, rehabCost, holdingMonths, monthlyHoldingCost, buyingClosingCostPercent, sellingClosingCostPercent
 * @returns Record with netProfit, roi, annualizedRoi, totalInvestment, totalSellingCosts, maxAllowableOffer, summary
 */
export function calculateHouseFlippingProfit(inputs: Record<string, unknown>): Record<string, unknown> {
  const arv = Math.max(0, Number(inputs.arv) || 0);
  const purchasePrice = Math.max(0, Number(inputs.purchasePrice) || 0);
  const rehabCost = Math.max(0, Number(inputs.rehabCost) || 0);
  const holdingMonths = Math.max(1, Number(inputs.holdingMonths) || 6);
  const monthlyHoldingCost = Math.max(0, Number(inputs.monthlyHoldingCost) || 0);
  const buyingClosingCostPercent = inputs.buyingClosingCostPercent !== undefined
    ? Math.min(10, Math.max(0, Number(inputs.buyingClosingCostPercent)))
    : 2;
  const sellingClosingCostPercent = inputs.sellingClosingCostPercent !== undefined
    ? Math.min(15, Math.max(0, Number(inputs.sellingClosingCostPercent)))
    : 8;

  const buyingClosingCosts = parseFloat((purchasePrice * (buyingClosingCostPercent / 100)).toFixed(2));
  const totalHoldingCosts = parseFloat((holdingMonths * monthlyHoldingCost).toFixed(2));
  const totalSellingCosts = parseFloat((arv * (sellingClosingCostPercent / 100)).toFixed(2));

  const totalInvestment = parseFloat((purchasePrice + rehabCost + totalHoldingCosts + buyingClosingCosts).toFixed(2));
  const netProfit = parseFloat((arv - totalInvestment - totalSellingCosts).toFixed(2));
  const roi = totalInvestment > 0 ? parseFloat(((netProfit / totalInvestment) * 100).toFixed(2)) : 0;

  // Annualized ROI using compound formula
  const annualizedRoi = holdingMonths > 0
    ? parseFloat(((Math.pow(1 + roi / 100, 12 / holdingMonths) - 1) * 100).toFixed(2))
    : roi;

  // 70% Rule: Maximum Allowable Offer
  const maxAllowableOffer = parseFloat(Math.max(0, arv * 0.70 - rehabCost).toFixed(2));

  const summary: { label: string; value: number }[] = [
    { label: 'ARV (After-Repair Value)', value: arv },
    { label: 'Total Investment', value: totalInvestment },
    { label: 'Selling Costs', value: totalSellingCosts },
    { label: 'Net Profit', value: netProfit },
    { label: 'ROI (%)', value: roi },
    { label: 'Annualized ROI (%)', value: annualizedRoi },
    { label: 'Max Allowable Offer (70%)', value: maxAllowableOffer },
  ];

  return { netProfit, roi, annualizedRoi, totalInvestment, totalSellingCosts, maxAllowableOffer, summary };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'house-flipping-profit': calculateHouseFlippingProfit,
};
