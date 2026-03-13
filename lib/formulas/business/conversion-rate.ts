/**
 * Conversion Rate Calculator
 *
 * Formulas:
 *   Conversion Rate = (Conversions / Total Visitors) × 100
 *   Non-Conversion Rate = 100 − Conversion Rate
 *   Visitors per Conversion = Total Visitors / Conversions
 *
 * Source: Google Analytics Help Center — Conversion Rate definition.
 */

// ═══════════════════════════════════════════════════════
// Main function
// ═══════════════════════════════════════════════════════

/**
 * Calculates conversion rate, non-conversion rate, and visitors per conversion.
 *
 * Conversion Rate = (Conversions / Total Visitors) × 100
 *
 * @param inputs - Record with totalVisitors, conversions
 * @returns Record with conversionRate, nonConversionRate, visitorsPerConversion, summary
 */
export function calculateConversionRate(
  inputs: Record<string, unknown>
): Record<string, unknown> {
  // 1. Parse inputs
  const totalVisitors = Math.max(0, Number(inputs.totalVisitors) || 0);
  const conversions = Math.max(0, Number(inputs.conversions) || 0);

  // 2. Validate
  if (totalVisitors === 0) {
    return {
      conversionRate: 0,
      nonConversionRate: 100,
      visitorsPerConversion: 0,
      summary: [
        { label: 'Total Visitors', value: 0 },
        { label: 'Conversions', value: 0 },
        { label: 'Conversion Rate', value: '0%' },
        { label: 'Non-Conversion Rate', value: '100%' },
      ],
    };
  }

  // 3. Calculate
  const conversionRate = Math.round((conversions / totalVisitors) * 10000) / 100;
  const nonConversionRate = Math.round((100 - conversionRate) * 100) / 100;
  const visitorsPerConversion = conversions > 0
    ? Math.round((totalVisitors / conversions) * 10) / 10
    : 0;

  // 4. Summary
  const summary: { label: string; value: number | string }[] = [
    { label: 'Total Visitors', value: totalVisitors },
    { label: 'Conversions', value: conversions },
    { label: 'Conversion Rate', value: `${conversionRate}%` },
    { label: 'Non-Conversion Rate', value: `${nonConversionRate}%` },
    { label: 'Visitors per Conversion', value: visitorsPerConversion },
  ];

  return {
    conversionRate,
    nonConversionRate,
    visitorsPerConversion,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<
  string,
  (inputs: Record<string, unknown>) => Record<string, unknown>
> = {
  'conversion-rate': calculateConversionRate,
};
