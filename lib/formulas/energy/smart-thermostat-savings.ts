/**
 * Smart Thermostat Savings Calculator
 *
 * Formulas:
 *   Estimated savings % = base_savings_pct × climate_factor × upgrade_factor
 *   Annual savings = monthly_bill × 12 × savings_pct
 *   Payback period = (device_cost - rebate) / annual_savings
 *   10-year net savings = (annual_savings × 10) - (device_cost - rebate)
 *
 * Savings estimates are based on ENERGY STAR and DOE studies showing 8-12%
 * typical HVAC savings for smart thermostats, varying by climate, occupancy,
 * and previous thermostat type.
 *
 * Source: ENERGY STAR — Smart Thermostat Savings Estimates (2024);
 *         U.S. DOE — Programmable Thermostat Energy Savings (2023).
 *
 * IMPORTANT: Actual savings depend on occupancy patterns, HVAC runtime,
 * setpoint behavior, climate zone, and home insulation quality.
 */

const CLIMATE_FACTOR: Record<string, number> = {
  cold: 1.15,   // more heating runtime = more savings opportunity
  mixed: 1.0,   // baseline
  hot: 1.10,    // high cooling runtime = moderate savings
};

const UPGRADE_FACTOR: Record<string, number> = {
  'manual-to-programmable': 0.75,  // ~7.5% savings
  'manual-to-smart': 1.0,         // ~10% savings (baseline)
  'programmable-to-smart': 0.45,  // ~4.5% incremental savings
};

const BASE_SAVINGS_PCT = 0.10; // 10% baseline (ENERGY STAR estimate)

export function calculateSmartThermostatSavings(inputs: Record<string, unknown>): Record<string, unknown> {
  const num = (v: unknown, d: number) => v !== undefined && v !== null && v !== '' ? Number(v) : d;
  const monthlyBill = Math.max(0, num(inputs.monthlyBill, 150));
  const climateZone = String(inputs.climateZone || 'mixed');
  const upgradeType = String(inputs.upgradeType || 'manual-to-smart');
  const deviceCost = Math.max(0, num(inputs.deviceCost, 250));
  const utilityRebate = Math.max(0, num(inputs.utilityRebate, 0));

  const climateFactor = CLIMATE_FACTOR[climateZone] || 1.0;
  const upgradeFactor = UPGRADE_FACTOR[upgradeType] || 1.0;

  const baseSavingsPct = BASE_SAVINGS_PCT * climateFactor * upgradeFactor;
  const lowSavingsPct = parseFloat((baseSavingsPct * 0.7).toFixed(4));  // conservative
  const highSavingsPct = parseFloat((baseSavingsPct * 1.3).toFixed(4)); // optimistic

  const annualBill = monthlyBill * 12;
  const annualSavingsLow = parseFloat((annualBill * lowSavingsPct).toFixed(2));
  const annualSavingsBase = parseFloat((annualBill * baseSavingsPct).toFixed(2));
  const annualSavingsHigh = parseFloat((annualBill * highSavingsPct).toFixed(2));

  const netCost = parseFloat(Math.max(0, deviceCost - utilityRebate).toFixed(2));
  const paybackPeriod = annualSavingsBase > 0
    ? parseFloat((netCost / annualSavingsBase).toFixed(1))
    : -1;

  const tenYearGross = parseFloat((annualSavingsBase * 10).toFixed(2));
  const tenYearNet = parseFloat((tenYearGross - netCost).toFixed(2));

  return {
    annualSavingsLow,
    annualSavingsBase,
    annualSavingsHigh,
    paybackPeriod,
    tenYearGross,
    netCost,
    tenYearNet,
    savingsPercentBase: parseFloat((baseSavingsPct * 100).toFixed(1)),
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'smart-thermostat-savings': calculateSmartThermostatSavings,
};
