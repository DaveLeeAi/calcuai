/**
 * Roth Conversion Calculator
 *
 * Compares the after-tax value of converting a Traditional IRA/401(k) balance
 * to a Roth IRA versus leaving it in the Traditional account.
 *
 * Core formulas:
 *   taxCostNow = conversionAmount * (currentTaxRate / 100)
 *
 *   If payTaxFromOutside:
 *     rothStarting = conversionAmount
 *     opportunityCost = taxCostNow * (1 + expectedReturn)^years
 *   Else:
 *     rothStarting = conversionAmount - taxCostNow
 *     opportunityCost = 0
 *
 *   rothValueAtRetirement = rothStarting * (1 + expectedReturn)^years
 *   traditionalGrowth = conversionAmount * (1 + expectedReturn)^years
 *   traditionalAfterTax = traditionalGrowth * (1 - retirementTaxRate / 100)
 *   netBenefit = rothValueAtRetirement - traditionalAfterTax - opportunityCost
 *
 * Source: IRS Publication 590-A (Contributions to IRAs); Roth IRA conversion rules
 */
export function calculateRothConversion(inputs: Record<string, unknown>): Record<string, unknown> {
  const conversionAmount = inputs.conversionAmount != null ? Number(inputs.conversionAmount) : 100000;
  const currentTaxRate = inputs.currentTaxRate != null ? Number(inputs.currentTaxRate) : 24;
  const retirementTaxRate = inputs.retirementTaxRate != null ? Number(inputs.retirementTaxRate) : 22;
  const yearsUntilRetirement = inputs.yearsUntilRetirement != null ? Number(inputs.yearsUntilRetirement) : 20;
  const expectedReturn = (inputs.expectedReturn != null ? Number(inputs.expectedReturn) : 7) / 100;
  const payTaxFromOutside = inputs.payTaxFromOutside != null ? Boolean(inputs.payTaxFromOutside) : true;

  // ─── Tax Cost ───
  const taxCostNow = parseFloat((conversionAmount * (currentTaxRate / 100)).toFixed(2));

  // ─── Roth Path ───
  let rothStarting: number;
  let opportunityCost: number;

  if (payTaxFromOutside) {
    // Full amount goes into Roth; tax paid from separate funds
    rothStarting = conversionAmount;
    // The opportunity cost is what that tax money would have grown to
    opportunityCost = parseFloat((taxCostNow * Math.pow(1 + expectedReturn, yearsUntilRetirement)).toFixed(2));
  } else {
    // Tax paid from the conversion itself — less goes into Roth
    rothStarting = conversionAmount - taxCostNow;
    opportunityCost = 0;
  }

  const rothValueAtRetirement = parseFloat(
    (rothStarting * Math.pow(1 + expectedReturn, yearsUntilRetirement)).toFixed(2)
  );

  // ─── Traditional Path ───
  const traditionalGrowth = parseFloat(
    (conversionAmount * Math.pow(1 + expectedReturn, yearsUntilRetirement)).toFixed(2)
  );
  const traditionalAfterTax = parseFloat(
    (traditionalGrowth * (1 - retirementTaxRate / 100)).toFixed(2)
  );

  // ─── Net Benefit ───
  const netBenefit = parseFloat(
    (rothValueAtRetirement - traditionalAfterTax - opportunityCost).toFixed(2)
  );

  // ─── Year-by-Year Growth Comparison ───
  const growthComparison: { year: number; rothValue: number; traditionalAfterTax: number }[] = [];

  for (let year = 0; year <= yearsUntilRetirement; year++) {
    const rothGrowth = rothStarting * Math.pow(1 + expectedReturn, year);
    const tradGrowth = conversionAmount * Math.pow(1 + expectedReturn, year);
    const tradAfterTax = tradGrowth * (1 - retirementTaxRate / 100);

    growthComparison.push({
      year,
      rothValue: parseFloat(rothGrowth.toFixed(2)),
      traditionalAfterTax: parseFloat(tradAfterTax.toFixed(2)),
    });
  }

  // ─── Summary ───
  const summary = [
    { label: 'Roth Value at Retirement', value: rothValueAtRetirement },
    { label: 'Traditional After Tax', value: traditionalAfterTax },
    { label: 'Tax Cost Now', value: taxCostNow },
    { label: 'Net Benefit of Converting', value: netBenefit },
    { label: 'Opportunity Cost of Tax', value: opportunityCost },
  ];

  return {
    rothValueAtRetirement,
    traditionalAfterTax,
    taxCostNow,
    netBenefit,
    summary,
    growthComparison,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'roth-conversion': calculateRothConversion,
};
