/**
 * Property Tax Calculator — Estimate Annual Property Tax
 *
 * Formulas:
 *   Assessed Value = Home Value × (Assessment Rate / 100)
 *   Taxable Value = max(0, Assessed Value − Exemptions)
 *   Base Tax = Taxable Value × (Tax Rate / 100)
 *   Annual Tax = Base Tax + Special Assessments
 *   Monthly Tax = Annual Tax / 12
 *   Daily Tax = Annual Tax / 365
 *   Effective Rate = (Annual Tax / Home Value) × 100
 *   Mill Rate = Tax Rate × 10
 *
 * Source: Tax Foundation — Property Tax Collections and Rates by State.
 */

// ═══════════════════════════════════════════════════════
// Interfaces
// ═══════════════════════════════════════════════════════

export interface PropertyTaxInput {
  homeValue: number;
  assessmentRate: number;
  taxRate: number;
  exemptions: number;
  specialAssessments: number;
}

export interface PropertyTaxOutput {
  assessedValue: number;
  taxableValue: number;
  annualTax: number;
  monthlyTax: number;
  dailyTax: number;
  effectiveRate: number;
  millRate: number;
  taxBreakdown: { label: string; value: number }[];
}

// ═══════════════════════════════════════════════════════
// Main function: Property Tax Calculator
// ═══════════════════════════════════════════════════════

/**
 * Calculates annual property tax, monthly/daily amounts, effective rate,
 * mill rate, and a breakdown of tax components.
 *
 * Annual Tax = (Taxable Value × Tax Rate / 100) + Special Assessments
 * Taxable Value = max(0, Home Value × Assessment Rate / 100 − Exemptions)
 *
 * @param inputs - Record with homeValue, assessmentRate, taxRate, exemptions, specialAssessments
 * @returns Record with assessedValue, taxableValue, annualTax, monthlyTax, dailyTax, effectiveRate, millRate, taxBreakdown
 */
export function calculatePropertyTax(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs with safe defaults
  const homeValue = Math.max(0, Number(inputs.homeValue) || 0);
  const assessmentRate = Math.max(0, Math.min(100, Number(inputs.assessmentRate) || 0));
  const taxRate = Math.max(0, Math.min(10, Number(inputs.taxRate) || 0));
  const exemptions = Math.max(0, Number(inputs.exemptions) || 0);
  const specialAssessments = Math.max(0, Number(inputs.specialAssessments) || 0);

  // 2. Calculate assessed value
  const assessedValue = Math.round(homeValue * (assessmentRate / 100) * 100) / 100;

  // 3. Calculate taxable value (after exemptions, floored at 0)
  const taxableValue = Math.max(0, Math.round((assessedValue - exemptions) * 100) / 100);

  // 4. Calculate base property tax
  const baseTax = Math.round((taxableValue * taxRate / 100) * 100) / 100;

  // 5. Calculate annual tax (base + special assessments)
  const annualTax = Math.round((baseTax + specialAssessments) * 100) / 100;

  // 6. Calculate monthly and daily tax
  const monthlyTax = Math.round((annualTax / 12) * 100) / 100;
  const dailyTax = Math.round((annualTax / 365) * 100) / 100;

  // 7. Calculate effective rate
  const effectiveRate = homeValue > 0
    ? Math.round((annualTax / homeValue) * 10000) / 100
    : 0;

  // 8. Calculate mill rate
  const millRate = Math.round(taxRate * 100) / 10;

  // 9. Tax breakdown value group
  const taxBreakdown: { label: string; value: number }[] = [
    { label: 'Base Property Tax', value: baseTax },
    { label: 'Special Assessments', value: specialAssessments },
    { label: 'Total Annual', value: annualTax },
  ];

  return {
    assessedValue,
    taxableValue,
    annualTax,
    monthlyTax,
    dailyTax,
    effectiveRate,
    millRate,
    taxBreakdown,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'property-tax': calculatePropertyTax,
};
