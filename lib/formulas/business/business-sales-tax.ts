/**
 * Business Sales Tax Calculator — Merchant Tax Pricing
 *
 * Tax-Exclusive Pricing (customer pays tax on top):
 *   List Price = Cost x (1 + Margin% / 100)
 *   Tax Amount = List Price x (Tax Rate / 100)
 *   Customer Pays = List Price + Tax Amount
 *
 * Tax-Inclusive Pricing (tax built into sticker price):
 *   Customer Pays = Sticker Price
 *   Pre-Tax Price = Sticker Price / (1 + Tax Rate / 100)
 *   Tax Amount = Sticker Price - Pre-Tax Price
 *   Your Revenue = Pre-Tax Price
 *
 * Monthly Tax Liability = Tax Amount per Unit x Units Sold per Month
 *
 * Source: State revenue departments — standard sales tax computation (2024).
 */

// ===============================================
// Interfaces
// ===============================================

export interface BusinessSalesTaxInput {
  pricingStrategy: 'tax-exclusive' | 'tax-inclusive';
  unitCost: number;
  desiredMarginPercent: number;
  taxRate: number;
  monthlySalesVolume: number;
  stickerPrice: number;
}

export interface PriceBreakdownSlice {
  label: string;
  value: number;
}

export interface BusinessSalesTaxOutput {
  customerPays: number;
  listPrice: number;
  taxPerUnit: number;
  yourRevenuePerUnit: number;
  profitPerUnit: number;
  marginPercent: number;
  monthlyTaxLiability: number;
  monthlyRevenue: number;
  monthlyProfit: number;
  priceBreakdown: PriceBreakdownSlice[];
  summary: { label: string; value: number }[];
}

// ===============================================
// Main function: Business Sales Tax Calculator
// ===============================================

/**
 * Calculates sales tax from the merchant/business perspective, including
 * tax-exclusive and tax-inclusive pricing strategies, monthly tax liability,
 * and profit impact.
 *
 * Tax-Exclusive:
 *   List Price = Unit Cost x (1 + Desired Margin / 100)
 *   Tax Amount = List Price x (Tax Rate / 100)
 *   Customer Pays = List Price + Tax Amount
 *
 * Tax-Inclusive:
 *   Customer Pays = Sticker Price
 *   Pre-Tax Price = Sticker Price / (1 + Tax Rate / 100)
 *   Tax Amount = Sticker Price - Pre-Tax Price
 *
 * @param inputs - Record with pricingStrategy, unitCost, desiredMarginPercent, taxRate, monthlySalesVolume, stickerPrice
 * @returns Record with customerPays, listPrice, taxPerUnit, yourRevenuePerUnit, profitPerUnit, marginPercent, monthlyTaxLiability, monthlyRevenue, monthlyProfit, priceBreakdown, summary
 */
export function calculateBusinessSalesTax(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs with safe defaults
  const strategy = (inputs.pricingStrategy as string) || 'tax-exclusive';
  const unitCost = Math.max(0, Number(inputs.unitCost) || 0);
  const desiredMarginPercent = Math.max(0, Number(inputs.desiredMarginPercent) || 0);
  const taxRate = Math.max(0, Number(inputs.taxRate) || 0);
  const monthlySalesVolume = Math.max(0, Number(inputs.monthlySalesVolume) || 0);
  const stickerPrice = Math.max(0, Number(inputs.stickerPrice) || 0);

  let customerPays: number;
  let listPrice: number;
  let taxPerUnit: number;
  let yourRevenuePerUnit: number;
  let profitPerUnit: number;
  let marginPercent: number;

  if (strategy === 'tax-inclusive') {
    // 2a. Tax-Inclusive: sticker price is what the customer pays
    customerPays = Math.round(stickerPrice * 100) / 100;
    // Pre-tax price (what the business keeps before profit split)
    const preTaxPrice = taxRate > 0
      ? Math.round((stickerPrice / (1 + taxRate / 100)) * 100) / 100
      : stickerPrice;
    taxPerUnit = Math.round((customerPays - preTaxPrice) * 100) / 100;
    listPrice = Math.round(preTaxPrice * 100) / 100;
    yourRevenuePerUnit = Math.round(preTaxPrice * 100) / 100;
    profitPerUnit = Math.round((preTaxPrice - unitCost) * 100) / 100;
    marginPercent = preTaxPrice > 0
      ? Math.round(((preTaxPrice - unitCost) / preTaxPrice) * 10000) / 100
      : 0;
  } else {
    // 2b. Tax-Exclusive: customer pays list price + tax
    listPrice = Math.round(unitCost * (1 + desiredMarginPercent / 100) * 100) / 100;
    taxPerUnit = Math.round(listPrice * (taxRate / 100) * 100) / 100;
    customerPays = Math.round((listPrice + taxPerUnit) * 100) / 100;
    yourRevenuePerUnit = Math.round(listPrice * 100) / 100;
    profitPerUnit = Math.round((listPrice - unitCost) * 100) / 100;
    marginPercent = listPrice > 0
      ? Math.round(((listPrice - unitCost) / listPrice) * 10000) / 100
      : 0;
  }

  // 3. Monthly calculations
  const monthlyTaxLiability = Math.round(taxPerUnit * monthlySalesVolume * 100) / 100;
  const monthlyRevenue = Math.round(yourRevenuePerUnit * monthlySalesVolume * 100) / 100;
  const monthlyProfit = Math.round(profitPerUnit * monthlySalesVolume * 100) / 100;

  // 4. Price breakdown pie chart data (portions of customer price)
  const priceBreakdown: PriceBreakdownSlice[] = [
    { label: 'Cost', value: Math.round(unitCost * 100) / 100 },
    { label: 'Profit', value: Math.max(0, profitPerUnit) },
    { label: 'Sales Tax', value: taxPerUnit },
  ];

  // 5. Summary value group
  const summary: { label: string; value: number }[] = [
    { label: 'Customer Pays', value: customerPays },
    { label: 'List Price (Pre-Tax)', value: listPrice },
    { label: 'Tax per Unit', value: taxPerUnit },
    { label: 'Your Revenue per Unit', value: yourRevenuePerUnit },
    { label: 'Profit per Unit', value: profitPerUnit },
    { label: 'Actual Margin %', value: marginPercent },
    { label: 'Monthly Tax Liability', value: monthlyTaxLiability },
    { label: 'Monthly Revenue', value: monthlyRevenue },
    { label: 'Monthly Profit', value: monthlyProfit },
  ];

  return {
    customerPays,
    listPrice,
    taxPerUnit,
    yourRevenuePerUnit,
    profitPerUnit,
    marginPercent,
    monthlyTaxLiability,
    monthlyRevenue,
    monthlyProfit,
    priceBreakdown,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'business-sales-tax': calculateBusinessSalesTax,
};
