/**
 * Discount Calculator
 *
 * Calculates the discounted price and savings from an original price
 * and a percentage discount.
 *
 * Formula:
 *   savingsAmount = originalPrice × (discountPercent / 100)
 *   finalPrice = originalPrice - savingsAmount
 *
 * With optional additional discount (stacked):
 *   priceAfterFirst = originalPrice × (1 - discount1/100)
 *   finalPrice = priceAfterFirst × (1 - discount2/100)
 *
 * With sales tax applied after discount:
 *   totalWithTax = finalPrice × (1 + taxRate/100)
 *
 * Source: Standard percentage arithmetic. Retail discount stacking
 *         follows multiplicative (not additive) convention per
 *         Federal Trade Commission (FTC) pricing guidelines.
 */

// ═══════════════════════════════════════════════════════
// Interfaces
// ═══════════════════════════════════════════════════════

export interface DiscountOutput {
  originalPrice: number;
  discountPercent: number;
  savingsAmount: number;
  finalPrice: number;
  additionalDiscount: number;
  additionalSavings: number;
  totalSavings: number;
  totalSavingsPercent: number;
  taxRate: number;
  taxAmount: number;
  totalWithTax: number;
  pricePerUnit: number;
  quantity: number;
  totalForQuantity: number;
}

// ═══════════════════════════════════════════════════════
// Main function: Discount Calculator
// ═══════════════════════════════════════════════════════

/**
 * Calculates discounted price, savings, optional stacked discount, and sales tax.
 *
 * savingsAmount = originalPrice × (discountPercent / 100)
 * finalPrice = originalPrice - savingsAmount
 *
 * @param inputs - Record with originalPrice, discountPercent, additionalDiscount, taxRate, quantity
 * @returns Record with pricing breakdown
 */
export function calculateDiscount(inputs: Record<string, unknown>): Record<string, unknown> {
  const originalPrice = Math.max(0, Number(inputs.originalPrice) || 0);
  const discountPercent = Math.max(0, Math.min(100, Number(inputs.discountPercent) || 0));
  const additionalDiscount = Math.max(0, Math.min(100, Number(inputs.additionalDiscount) || 0));
  const taxRate = Math.max(0, Math.min(50, Number(inputs.taxRate) || 0));
  const quantity = Math.max(1, Math.floor(Number(inputs.quantity) || 1));

  // First discount
  const savingsAmount = parseFloat((originalPrice * (discountPercent / 100)).toFixed(2));
  let finalPrice = parseFloat((originalPrice - savingsAmount).toFixed(2));

  // Stacked second discount (multiplicative, not additive)
  let additionalSavings = 0;
  if (additionalDiscount > 0) {
    additionalSavings = parseFloat((finalPrice * (additionalDiscount / 100)).toFixed(2));
    finalPrice = parseFloat((finalPrice - additionalSavings).toFixed(2));
  }

  const totalSavings = parseFloat((savingsAmount + additionalSavings).toFixed(2));
  const totalSavingsPercent = originalPrice > 0
    ? parseFloat(((totalSavings / originalPrice) * 100).toFixed(2))
    : 0;

  // Sales tax on discounted price
  const taxAmount = parseFloat((finalPrice * (taxRate / 100)).toFixed(2));
  const totalWithTax = parseFloat((finalPrice + taxAmount).toFixed(2));

  // Quantity
  const pricePerUnit = finalPrice;
  const totalForQuantity = parseFloat((totalWithTax * quantity).toFixed(2));

  return {
    originalPrice,
    discountPercent,
    savingsAmount,
    finalPrice,
    additionalDiscount,
    additionalSavings,
    totalSavings,
    totalSavingsPercent,
    taxRate,
    taxAmount,
    totalWithTax,
    pricePerUnit,
    quantity,
    totalForQuantity,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'discount': calculateDiscount,
};
