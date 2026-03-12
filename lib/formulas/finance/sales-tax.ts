/**
 * Sales Tax Calculator Formula
 *
 * Add Tax Mode:
 *   Tax = Price × (Rate / 100)
 *   Total = Price + Tax
 *
 * Extract Tax Mode (reverse):
 *   Price = Total / (1 + Rate / 100)
 *   Tax = Total - Price
 *
 * Where:
 *   Price = pre-tax purchase price
 *   Rate = sales tax percentage (e.g., 8.25 for 8.25%)
 *   Total = final price including tax
 *
 * Source: State revenue departments; sales tax calculation is a standard
 * percentage computation codified in state and local tax codes.
 */
export function calculateSalesTax(inputs: Record<string, unknown>): Record<string, unknown> {
  const purchasePrice = Number(inputs.purchasePrice) || 0;
  const taxRate = (Number(inputs.taxRate) || 0) / 100;
  const calculationMode = String(inputs.calculationMode || 'add-tax');

  if (purchasePrice <= 0 || taxRate < 0) {
    return {
      taxAmount: 0,
      totalPrice: 0,
      effectivePrice: 0,
      summary: [],
    };
  }

  let taxAmount: number;
  let totalPrice: number;
  let effectivePrice: number;

  if (calculationMode === 'extract-tax') {
    // purchasePrice is actually the total (tax-inclusive) price
    const totalInclusive = purchasePrice;
    effectivePrice = parseFloat((totalInclusive / (1 + taxRate)).toFixed(2));
    taxAmount = parseFloat((totalInclusive - effectivePrice).toFixed(2));
    totalPrice = parseFloat(totalInclusive.toFixed(2));
  } else {
    // add-tax mode (default)
    taxAmount = parseFloat((purchasePrice * taxRate).toFixed(2));
    totalPrice = parseFloat((purchasePrice + taxAmount).toFixed(2));
    effectivePrice = parseFloat(purchasePrice.toFixed(2));
  }

  const taxRatePercent = parseFloat((taxRate * 100).toFixed(4));

  const summary: { label: string; value: number | string }[] = [
    { label: 'Pre-Tax Price', value: effectivePrice },
    { label: 'Tax Rate', value: `${taxRatePercent}%` },
    { label: 'Sales Tax', value: taxAmount },
    { label: 'Total Price', value: totalPrice },
  ];

  return {
    taxAmount,
    totalPrice,
    effectivePrice,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'sales-tax': calculateSalesTax,
};
