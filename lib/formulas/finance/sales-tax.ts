/**
 * Sales Tax Calculator Formula — Flagship
 *
 * Three calculation modes:
 *
 * 1. Add Tax (Net → Gross):
 *    Tax = netPrice × (Rate / 100)
 *    grossPrice = netPrice + Tax
 *
 * 2. Extract Tax (Gross → Net):
 *    netPrice = grossPrice / (1 + Rate / 100)
 *    Tax = grossPrice − netPrice
 *
 * 3. Find Rate:
 *    taxRate = ((grossPrice − netPrice) / netPrice) × 100
 *
 * State lookup: imports 2026 state data and returns full state info
 * when a state code is selected.
 *
 * Source: State revenue departments — standard sales tax computation
 * as codified in state tax codes. Rate data from Tax Foundation,
 * "State and Local Sales Tax Rates, 2026."
 */

import salesTaxData from '@/content/data/us-sales-tax-2026.json';

/** State record from the 2026 dataset */
export interface StateTaxRecord {
  stateCode: string;
  stateName: string;
  fips: string;
  stateTaxRate: number;
  avgLocalTaxRate: number;
  combinedRate: number;
  groceryTaxStatus: string;
  groceryTaxRate: number | null;
  clothingTaxStatus: string;
  clothingTaxNote?: string;
  changedFrom2025: boolean;
  changeNote: string | null;
}

/** Look up a state by its 2-letter code */
export function getStateTaxData(stateCode: string): StateTaxRecord | null {
  const record = salesTaxData.states.find(
    (s) => s.stateCode.toUpperCase() === stateCode.toUpperCase()
  );
  return (record as StateTaxRecord) ?? null;
}

/** Get all state tax records */
export function getAllStateTaxData(): StateTaxRecord[] {
  return salesTaxData.states as StateTaxRecord[];
}

/** Main calculation function */
export function calculateSalesTax(inputs: Record<string, unknown>): Record<string, unknown> {
  const calculationMode = String(inputs.calculationMode || 'add-tax');
  const stateCode = inputs.stateCode ? String(inputs.stateCode) : null;

  // State lookup — return state data when a state is selected
  let stateInfo: StateTaxRecord | null = null;
  if (stateCode && stateCode !== '' && stateCode !== 'custom') {
    stateInfo = getStateTaxData(stateCode);
  }

  // Use state combined rate if selected, otherwise use manual taxRate
  const taxRatePercent = stateInfo
    ? stateInfo.combinedRate
    : Number(inputs.taxRate) || 0;
  const taxRate = taxRatePercent / 100;

  // Find Rate mode: both prices are required, no rate needed
  if (calculationMode === 'find-rate') {
    const netPrice = Number(inputs.netPrice) || 0;
    const grossPrice = Number(inputs.grossPrice) || 0;

    if (netPrice <= 0 || grossPrice <= 0 || grossPrice <= netPrice) {
      return {
        taxAmount: 0,
        totalPrice: 0,
        effectivePrice: 0,
        calculatedRate: 0,
        stateInfo,
        summary: [],
        taxBreakdown: [],
      };
    }

    const taxAmount = parseFloat((grossPrice - netPrice).toFixed(2));
    const calculatedRate = parseFloat(
      (((grossPrice - netPrice) / netPrice) * 100).toFixed(2)
    );

    const summary: { label: string; value: number | string }[] = [
      { label: 'Pre-Tax Price', value: netPrice },
      { label: 'Total Paid', value: grossPrice },
      { label: 'Sales Tax', value: taxAmount },
      { label: 'Effective Tax Rate', value: `${calculatedRate}%` },
    ];

    return {
      taxAmount,
      totalPrice: grossPrice,
      effectivePrice: netPrice,
      calculatedRate,
      stateInfo,
      summary,
      taxBreakdown: [
        { name: 'Pre-Tax Price', value: netPrice },
        { name: 'Sales Tax', value: taxAmount },
      ],
    };
  }

  // Add Tax and Extract Tax modes use purchasePrice
  const purchasePrice = Number(inputs.purchasePrice) || 0;

  if (purchasePrice <= 0 || taxRate < 0) {
    return {
      taxAmount: 0,
      totalPrice: 0,
      effectivePrice: 0,
      calculatedRate: taxRatePercent,
      stateInfo,
      summary: [],
      taxBreakdown: [],
    };
  }

  let taxAmount: number;
  let totalPrice: number;
  let effectivePrice: number;

  if (calculationMode === 'extract-tax') {
    // purchasePrice is actually the gross (tax-inclusive) price
    const grossInclusive = purchasePrice;
    effectivePrice = parseFloat((grossInclusive / (1 + taxRate)).toFixed(2));
    taxAmount = parseFloat((grossInclusive - effectivePrice).toFixed(2));
    totalPrice = parseFloat(grossInclusive.toFixed(2));
  } else {
    // add-tax mode (default)
    taxAmount = parseFloat((purchasePrice * taxRate).toFixed(2));
    totalPrice = parseFloat((purchasePrice + taxAmount).toFixed(2));
    effectivePrice = parseFloat(purchasePrice.toFixed(2));
  }

  const summary: { label: string; value: number | string }[] = [
    { label: 'Pre-Tax Price', value: effectivePrice },
    { label: 'Tax Rate', value: `${taxRatePercent}%` },
    { label: 'Sales Tax', value: taxAmount },
    { label: 'Total Price', value: totalPrice },
  ];

  // Add state-specific info to summary when state is selected
  if (stateInfo) {
    summary.push(
      { label: 'State Rate', value: `${stateInfo.stateTaxRate}%` },
      { label: 'Avg. Local Rate', value: `${stateInfo.avgLocalTaxRate}%` }
    );
  }

  return {
    taxAmount,
    totalPrice,
    effectivePrice,
    calculatedRate: taxRatePercent,
    stateInfo,
    summary,
    taxBreakdown: [
      { name: 'Pre-Tax Price', value: effectivePrice },
      { name: 'Sales Tax', value: taxAmount },
    ],
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'sales-tax': calculateSalesTax,
};
