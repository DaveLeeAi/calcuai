/**
 * EV Charging Cost Calculator
 *
 * Calculates the cost of charging an electric vehicle at home,
 * cost per mile, monthly/yearly charging expenses, and savings
 * compared to a gasoline vehicle.
 *
 * Formulas:
 *   kWhNeeded = batteryCapacity × (targetCharge - currentCharge) / 100
 *   kWhFromWall = kWhNeeded / (chargingEfficiency / 100)
 *   costPerCharge = kWhFromWall × electricityRate
 *   milesPerCharge = kWhNeeded × milesPerKwh
 *   costPerMile = electricityRate / (milesPerKwh × (chargingEfficiency / 100))
 *   monthlyChargingCost = (weeklyMiles / milesPerKwh / (chargingEfficiency / 100)) × electricityRate × 4.333
 *   gasCostPerMile = gasPrice / gasMPG
 *   monthlySavings = monthlyGasCost - monthlyChargingCost
 *
 * Source: U.S. Department of Energy — Alternative Fuels Data Center;
 *         EPA fuel economy ratings; EIA — Average Retail Price of Electricity.
 */

// ═══════════════════════════════════════════════════════
// Interfaces
// ═══════════════════════════════════════════════════════

export interface EvChargingCostOutput {
  costPerCharge: number;
  costPerMile: number;
  monthlyChargingCost: number;
  yearlyChargingCost: number;
  milesPerCharge: number;
  gasCostPerMile: number;
  monthlyGasCost: number;
  monthlySavings: number;
  yearlySavings: number;
}

// ═══════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════

const WEEKS_PER_MONTH = 4.333;

// ═══════════════════════════════════════════════════════
// Main function: EV Charging Cost Calculator
// ═══════════════════════════════════════════════════════

/**
 * Calculates EV charging costs and savings vs gasoline.
 *
 * costPerCharge = (batteryCapacity × chargeDelta / efficiency) × electricityRate
 * costPerMile = electricityRate / (milesPerKwh × efficiency)
 *
 * @param inputs - Record with batteryCapacity, currentCharge, targetCharge, electricityRate,
 *                 chargingEfficiency, milesPerKwh, weeklyMiles, gasPrice, gasMPG
 * @returns Record with per-charge cost, per-mile cost, monthly/yearly costs, and gas comparison
 */
export function calculateEvChargingCost(inputs: Record<string, unknown>): Record<string, unknown> {
  // Helper: parse number with fallback that treats 0 as valid
  const num = (val: unknown, fallback: number): number => {
    const n = Number(val);
    return isNaN(n) ? fallback : n;
  };

  const batteryCapacity = Math.max(0, num(inputs.batteryCapacity, 75));
  const currentCharge = Math.max(0, Math.min(100, num(inputs.currentCharge, 20)));
  const targetCharge = Math.max(0, Math.min(100, num(inputs.targetCharge, 80)));
  const electricityRate = Math.max(0, num(inputs.electricityRate, 0.14));
  const chargingEfficiency = Math.max(1, Math.min(100, num(inputs.chargingEfficiency, 85)));
  const milesPerKwh = Math.max(0.01, num(inputs.milesPerKwh, 3.5));
  const weeklyMiles = Math.max(0, num(inputs.weeklyMiles, 250));
  const gasPrice = Math.max(0, num(inputs.gasPrice, 3.50));
  const gasMPG = Math.max(0.1, num(inputs.gasMPG, 28));

  const efficiencyFactor = chargingEfficiency / 100;

  // ── Per-charge session ──────────────────────────────
  let costPerCharge: number;
  let milesPerCharge: number;

  if (currentCharge >= targetCharge) {
    // No charging needed
    costPerCharge = 0;
    milesPerCharge = 0;
  } else {
    const chargeDelta = (targetCharge - currentCharge) / 100;
    const kWhNeeded = batteryCapacity * chargeDelta;
    const kWhFromWall = kWhNeeded / efficiencyFactor;
    costPerCharge = parseFloat((kWhFromWall * electricityRate).toFixed(2));
    milesPerCharge = parseFloat((kWhNeeded * milesPerKwh).toFixed(1));
  }

  // ── EV cost per mile ────────────────────────────────
  const costPerMile = parseFloat(
    (electricityRate / (milesPerKwh * efficiencyFactor)).toFixed(4)
  );

  // ── Weekly / monthly / yearly EV costs ──────────────
  const weeklyKwh = weeklyMiles / milesPerKwh;
  const weeklyKwhFromWall = weeklyKwh / efficiencyFactor;
  const monthlyChargingCost = parseFloat(
    (weeklyKwhFromWall * electricityRate * WEEKS_PER_MONTH).toFixed(2)
  );
  const yearlyChargingCost = parseFloat((monthlyChargingCost * 12).toFixed(2));

  // ── Gas comparison ──────────────────────────────────
  const gasCostPerMile = parseFloat((gasPrice / gasMPG).toFixed(4));
  const monthlyGasCost = parseFloat(
    (weeklyMiles * WEEKS_PER_MONTH * gasCostPerMile).toFixed(2)
  );
  const monthlySavings = parseFloat((monthlyGasCost - monthlyChargingCost).toFixed(2));
  const yearlySavings = parseFloat((monthlySavings * 12).toFixed(2));

  return {
    costPerCharge,
    costPerMile,
    monthlyChargingCost,
    yearlyChargingCost,
    milesPerCharge,
    gasCostPerMile,
    monthlyGasCost,
    monthlySavings,
    yearlySavings,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'ev-charging-cost': calculateEvChargingCost,
};
