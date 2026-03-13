/**
 * APY (Annual Percentage Yield) Calculator
 *
 * Converts a nominal interest rate (APR) to the effective annual yield (APY)
 * based on the compounding frequency, per the Truth in Savings Act (Regulation DD).
 *
 * Formula:
 *   APY = (1 + r/n)^n - 1
 *
 * For continuous compounding (approximated with n=8760):
 *   APY = e^r - 1
 *
 * Where:
 *   r = nominal annual interest rate (decimal)
 *   n = number of compounding periods per year
 *
 * The effective monthly rate is derived from APY:
 *   Monthly Rate = (1 + APY)^(1/12) - 1
 *
 * Source: FDIC Truth in Savings Act (12 CFR Part 1030 — Regulation DD);
 *         Federal Reserve Board APY calculation methodology.
 */
export function calculateApy(inputs: Record<string, unknown>): Record<string, unknown> {
  const nominalRate = (Number(inputs.nominalRate) || 0) / 100;
  const compFreqStr = String(inputs.compoundingFrequency || '12');
  const compoundingFrequency = parseInt(compFreqStr, 10);

  let apy: number;
  // Treat 8760 (hourly) as continuous compounding
  if (compoundingFrequency >= 8760) {
    apy = Math.exp(nominalRate) - 1;
  } else {
    if (nominalRate === 0) {
      apy = 0;
    } else {
      apy = Math.pow(1 + nominalRate / compoundingFrequency, compoundingFrequency) - 1;
    }
  }

  // Convert APY to display percentage with 4 decimals of precision
  const apyPercent = parseFloat((apy * 100).toFixed(4));

  // Effective monthly rate from APY
  const effectiveMonthlyRate = Math.pow(1 + apy, 1 / 12) - 1;
  const effectiveMonthlyRatePercent = parseFloat((effectiveMonthlyRate * 100).toFixed(4));

  // Difference from APR
  const nominalRatePercent = Number(inputs.nominalRate) || 0;
  const differenceFromAPR = parseFloat((apyPercent - nominalRatePercent).toFixed(4));

  // Summary value group
  const summary = [
    { label: 'APY', value: apyPercent },
    { label: 'APR (Nominal Rate)', value: nominalRatePercent },
    { label: 'APY - APR Difference', value: differenceFromAPR },
    { label: 'Effective Monthly Rate', value: effectiveMonthlyRatePercent },
  ];

  return {
    apy: apyPercent,
    effectiveMonthlyRate: effectiveMonthlyRatePercent,
    differenceFromAPR,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'apy': calculateApy,
};
