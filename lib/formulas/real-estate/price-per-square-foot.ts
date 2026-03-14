/**
 * Price Per Square Foot Calculator
 *
 * Formulas:
 *   Price Per Sq Ft = Total Price / Square Footage
 *   Estimated Value = Comparable PSF × Subject Square Footage
 *   Price Premium/Discount = ((Subject PSF − Comp PSF) / Comp PSF) × 100
 *
 * Source: Zillow Research — Price Per Square Foot Methodology (2025).
 * Source: National Association of Realtors — Comparable Sales Analysis (2025).
 */

export interface PricePerSqFtInput {
  propertyPrice: number;
  squareFootage: number;
  comp1Price: number;
  comp1SqFt: number;
  comp2Price: number;
  comp2SqFt: number;
  comp3Price: number;
  comp3SqFt: number;
}

export interface ComparableRow {
  label: string;
  price: number;
  sqft: number;
  psfValue: number;
}

export interface PricePerSqFtOutput {
  subjectPSF: number;
  avgCompPSF: number;
  estimatedValue: number;
  premiumDiscountPercent: number;
  comparablesTable: ComparableRow[];
  summary: { label: string; value: number }[];
}

/**
 * Calculates price per square foot and compares subject property to comparable sales.
 *
 * PSF = Price / SqFt
 * Estimated Value = Avg Comp PSF × Subject SqFt
 *
 * @param inputs - Record with propertyPrice, squareFootage, and up to 3 comparables
 * @returns Record with subjectPSF, avgCompPSF, estimatedValue, premiumDiscountPercent, comparablesTable, summary
 */
export function calculatePricePerSqFt(inputs: Record<string, unknown>): Record<string, unknown> {
  const propertyPrice = Math.max(0, Number(inputs.propertyPrice) || 0);
  const squareFootage = Math.max(1, Number(inputs.squareFootage) || 1);
  const comp1Price = Math.max(0, Number(inputs.comp1Price) || 0);
  const comp1SqFt = Math.max(1, Number(inputs.comp1SqFt) || 1);
  const comp2Price = Math.max(0, Number(inputs.comp2Price) || 0);
  const comp2SqFt = Math.max(1, Number(inputs.comp2SqFt) || 1);
  const comp3Price = Math.max(0, Number(inputs.comp3Price) || 0);
  const comp3SqFt = Math.max(1, Number(inputs.comp3SqFt) || 1);

  const subjectPSF = parseFloat((propertyPrice / squareFootage).toFixed(2));

  const comparablesTable: ComparableRow[] = [];
  if (comp1Price > 0) comparablesTable.push({ label: 'Comp 1', price: comp1Price, sqft: comp1SqFt, psfValue: parseFloat((comp1Price / comp1SqFt).toFixed(2)) });
  if (comp2Price > 0) comparablesTable.push({ label: 'Comp 2', price: comp2Price, sqft: comp2SqFt, psfValue: parseFloat((comp2Price / comp2SqFt).toFixed(2)) });
  if (comp3Price > 0) comparablesTable.push({ label: 'Comp 3', price: comp3Price, sqft: comp3SqFt, psfValue: parseFloat((comp3Price / comp3SqFt).toFixed(2)) });

  const avgCompPSF = comparablesTable.length > 0
    ? parseFloat((comparablesTable.reduce((sum, c) => sum + c.psfValue, 0) / comparablesTable.length).toFixed(2))
    : 0;

  const estimatedValue = parseFloat((avgCompPSF * squareFootage).toFixed(2));
  const premiumDiscountPercent = avgCompPSF > 0
    ? parseFloat((((subjectPSF - avgCompPSF) / avgCompPSF) * 100).toFixed(2))
    : 0;

  comparablesTable.push({ label: 'Subject Property', price: propertyPrice, sqft: squareFootage, psfValue: subjectPSF });

  const summary: { label: string; value: number }[] = [
    { label: 'Subject Property PSF', value: subjectPSF },
    { label: 'Average Comp PSF', value: avgCompPSF },
    { label: 'Estimated Value', value: estimatedValue },
    { label: 'Premium/Discount (%)', value: premiumDiscountPercent },
    { label: 'Square Footage', value: squareFootage },
  ];

  return { subjectPSF, avgCompPSF, estimatedValue, premiumDiscountPercent, comparablesTable, summary };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'price-per-square-foot': calculatePricePerSqFt,
};
