/**
 * Time-of-Use Rate Calculator
 *
 * Formulas:
 *   Monthly peak cost = peak kWh/day × peak rate × days
 *   Monthly off-peak cost = off-peak kWh/day × off-peak rate × days
 *   Total monthly bill = peak cost + off-peak cost
 *   Flat rate comparison = (peak kWh + off-peak kWh) × days × flat rate
 *   Savings = flat rate bill - TOU bill
 *
 * Source: U.S. EIA — Time-of-Use Rate Structures (2025); OpenEI Utility Rate Database.
 */

export function calculateTimeOfUse(inputs: Record<string, unknown>): Record<string, unknown> {
  const num = (v: unknown, d: number) => v !== undefined && v !== null && v !== '' ? Number(v) : d;
  const peakKwh = Math.max(0, num(inputs.peakKwh, 10));
  const offPeakKwh = Math.max(0, num(inputs.offPeakKwh, 20));
  const peakRate = Math.max(0, num(inputs.peakRate, 0.30));
  const offPeakRate = Math.max(0, num(inputs.offPeakRate, 0.10));
  const daysPerMonth = Math.min(31, Math.max(1, num(inputs.daysPerMonth, 30)));

  const monthlyPeakCost = parseFloat((peakKwh * peakRate * daysPerMonth).toFixed(2));
  const monthlyOffPeakCost = parseFloat((offPeakKwh * offPeakRate * daysPerMonth).toFixed(2));
  const totalMonthlyBill = parseFloat((monthlyPeakCost + monthlyOffPeakCost).toFixed(2));

  // Compare to flat rate (weighted average of peak/off-peak)
  const totalDailyKwh = peakKwh + offPeakKwh;
  const flatRate = parseFloat(((peakRate + offPeakRate) / 2).toFixed(4));
  const flatRateBill = parseFloat((totalDailyKwh * flatRate * daysPerMonth).toFixed(2));
  const savingsPotential = parseFloat((flatRateBill - totalMonthlyBill).toFixed(2));

  return {
    monthlyPeakCost,
    monthlyOffPeakCost,
    totalMonthlyBill,
    flatRateBill,
    savingsPotential,
    totalDailyKwh,
    annualBill: parseFloat((totalMonthlyBill * 12).toFixed(2)),
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'time-of-use': calculateTimeOfUse,
};
