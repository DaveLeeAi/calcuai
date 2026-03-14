/**
 * Product Pricing Calculator — Margin-Based Pricing with Volume Tiers
 *
 * Formulas:
 *   Base Price = Product Cost / (1 − Target Margin% / 100)
 *   Overhead-Adjusted Price = (Product Cost + Overhead) / (1 − Target Margin% / 100)
 *   Tier Price = Base Price × (1 − Discount% / 100)
 *   Effective Margin% = (Price − COGS − Overhead) / Price × 100
 *
 * Source: Corporate Finance Institute — Gross Margin and Cost-Plus Pricing (2024).
 * Source: Shopify — Ecommerce Pricing Strategies Guide (2025).
 */

// ===============================================
// Interfaces
// ===============================================

export interface ProductPricingInput {
  productCost: number;
  targetMargin: number;
  overheadPerUnit: number;
  discountTier1Qty: number;
  discountTier1Pct: number;
  discountTier2Qty: number;
  discountTier2Pct: number;
}

export interface PricingTierRow {
  tier: string;
  minQty: number;
  price: number;
  margin: number;
  profitPerUnit: number;
}

export interface ProductPricingOutput {
  basePrice: number;
  grossProfit: number;
  pricingTiers: PricingTierRow[];
  summary: { label: string; value: number }[];
}

// ===============================================
// Main function
// ===============================================

/**
 * Calculates selling price from landed cost and target gross margin,
 * then generates volume tier discounts and their effective margins.
 *
 * Base Price = (Product Cost + Overhead) / (1 − Target Margin% / 100)
 * Effective Margin = (Price − COGS − Overhead) / Price × 100
 *
 * @param inputs - Record containing productCost, targetMargin, overheadPerUnit, tier params
 * @returns Record with basePrice, grossProfit, pricingTiers, summary
 */
export function calculateProductPricing(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs
  const productCost = Math.max(0, Number(inputs.productCost) || 0);
  const targetMargin = Math.min(99, Math.max(1, Number(inputs.targetMargin) || 50));
  const overheadPerUnit = Math.max(0, Number(inputs.overheadPerUnit) || 0);
  const discountTier1Qty = Math.max(2, Number(inputs.discountTier1Qty) || 10);
  const discountTier1Pct = Math.max(0, Math.min(50, Number(inputs.discountTier1Pct) || 5));
  const discountTier2Qty = Math.max(2, Number(inputs.discountTier2Qty) || 50);
  const discountTier2Pct = Math.max(0, Math.min(50, Number(inputs.discountTier2Pct) || 10));

  // 2. Calculate base price from margin target
  const totalCostPerUnit = productCost + overheadPerUnit;
  const basePrice = totalCostPerUnit / (1 - targetMargin / 100);
  const roundedBase = Math.round(basePrice * 100) / 100;

  // 3. Gross profit at base price
  const grossProfit = Math.round((roundedBase - productCost - overheadPerUnit) * 100) / 100;

  // 4. Effective margin at base
  const effectiveMargin = roundedBase > 0
    ? Math.round((grossProfit / roundedBase) * 10000) / 100
    : 0;

  // 5. Build pricing tiers
  const calcTier = (price: number, discountPct: number): PricingTierRow | null => {
    const tieredPrice = Math.round(price * (1 - discountPct / 100) * 100) / 100;
    const tieredProfit = Math.round((tieredPrice - productCost - overheadPerUnit) * 100) / 100;
    const tieredMargin = tieredPrice > 0
      ? Math.round((tieredProfit / tieredPrice) * 10000) / 100
      : 0;
    return { price: tieredPrice, profitPerUnit: tieredProfit, margin: tieredMargin } as PricingTierRow;
  };

  const tier1 = calcTier(roundedBase, discountTier1Pct);
  const tier2 = calcTier(roundedBase, discountTier2Pct);

  const pricingTiers: PricingTierRow[] = [
    {
      tier: 'Base',
      minQty: 1,
      price: roundedBase,
      margin: effectiveMargin,
      profitPerUnit: grossProfit,
    },
    {
      tier: `Tier 1 (${discountTier1Pct}% off)`,
      minQty: discountTier1Qty,
      price: tier1!.price,
      margin: tier1!.margin,
      profitPerUnit: tier1!.profitPerUnit,
    },
    {
      tier: `Tier 2 (${discountTier2Pct}% off)`,
      minQty: discountTier2Qty,
      price: tier2!.price,
      margin: tier2!.margin,
      profitPerUnit: tier2!.profitPerUnit,
    },
  ];

  // 6. Summary
  const summary: { label: string; value: number }[] = [
    { label: 'Product Cost', value: productCost },
    { label: 'Overhead per Unit', value: overheadPerUnit },
    { label: 'Total Cost per Unit', value: Math.round(totalCostPerUnit * 100) / 100 },
    { label: 'Base Selling Price', value: roundedBase },
    { label: 'Gross Profit per Unit', value: grossProfit },
    { label: 'Effective Margin', value: effectiveMargin },
  ];

  return {
    basePrice: roundedBase,
    grossProfit,
    pricingTiers,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'product-pricing': calculateProductPricing,
};
