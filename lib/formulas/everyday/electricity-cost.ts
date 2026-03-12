/**
 * Electricity Cost Calculator
 *
 * Calculates the electricity cost of running an appliance based on
 * its wattage, hours of use, and electricity rate.
 *
 * Formulas:
 *   kWh = (watts × hoursPerDay) / 1000
 *   dailyCost = kWh × ratePerKWh
 *   monthlyCost = dailyCost × 30
 *   yearlyCost = dailyCost × 365
 *
 * Source: U.S. Energy Information Administration (EIA) —
 *         Average retail electricity rates and appliance energy
 *         consumption estimates. National average residential rate:
 *         $0.16/kWh (2024).
 */

// ═══════════════════════════════════════════════════════
// Interfaces
// ═══════════════════════════════════════════════════════

export interface ElectricityCostOutput {
  dailyKWh: number;
  monthlyKWh: number;
  yearlyKWh: number;
  dailyCost: number;
  monthlyCost: number;
  yearlyCost: number;
  watts: number;
  hoursPerDay: number;
  ratePerKWh: number;
  costPerHour: number;
  daysPerMonth: number;
}

// ═══════════════════════════════════════════════════════
// Main function: Electricity Cost Calculator
// ═══════════════════════════════════════════════════════

/**
 * Calculates electricity cost for an appliance over daily, monthly, and yearly periods.
 *
 * kWh = (watts × hours) / 1000
 * cost = kWh × rate
 *
 * @param inputs - Record with watts, hoursPerDay, ratePerKWh, daysPerMonth
 * @returns Record with cost breakdown across time periods
 */
export function calculateElectricityCost(inputs: Record<string, unknown>): Record<string, unknown> {
  const watts = Math.max(0, Number(inputs.watts) || 0);
  const hoursPerDay = Math.max(0, Math.min(24, Number(inputs.hoursPerDay) || 0));
  const ratePerKWh = Math.max(0, Number(inputs.ratePerKWh) || 0.16);
  const daysPerMonth = Math.max(1, Math.min(31, Number(inputs.daysPerMonth) || 30));

  // Daily energy consumption in kWh
  const dailyKWh = parseFloat(((watts * hoursPerDay) / 1000).toFixed(4));

  // Monthly and yearly kWh
  const monthlyKWh = parseFloat((dailyKWh * daysPerMonth).toFixed(2));
  const yearlyKWh = parseFloat((dailyKWh * 365).toFixed(2));

  // Cost calculations
  const dailyCost = parseFloat((dailyKWh * ratePerKWh).toFixed(4));
  const monthlyCost = parseFloat((monthlyKWh * ratePerKWh).toFixed(2));
  const yearlyCost = parseFloat((yearlyKWh * ratePerKWh).toFixed(2));

  // Cost per hour of operation
  const costPerHour = parseFloat(((watts / 1000) * ratePerKWh).toFixed(4));

  return {
    dailyKWh,
    monthlyKWh,
    yearlyKWh,
    dailyCost,
    monthlyCost,
    yearlyCost,
    watts,
    hoursPerDay,
    ratePerKWh,
    costPerHour,
    daysPerMonth,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'electricity-cost': calculateElectricityCost,
};
