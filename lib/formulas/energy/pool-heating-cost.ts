/**
 * Pool Heating Cost Calculator
 *
 * Formulas:
 *   BTU needed = pool_volume_gallons × 8.34 × temp_rise
 *   Gas heater cost = BTU / (efficiency × 100000) × price_per_therm
 *   Heat pump cost = BTU / (COP × 3412) × rate_per_kwh
 *   Seasonal cost = daily_heat_loss_BTU × season_days / efficiency × fuel_cost
 *
 * Source: U.S. DOE — Swimming Pool Heating (2025);
 *         ENERGY STAR — Pool Equipment Guide (2024).
 */

const HEATER_COP: Record<string, number> = {
  'gas':        0.85,  // 85% thermal efficiency (as fraction for gas)
  'heat-pump':  5.0,   // COP 5.0 typical for pool heat pumps
  'solar':      0,     // effectively free once installed
};

export function calculatePoolHeatingCost(inputs: Record<string, unknown>): Record<string, unknown> {
  const num = (v: unknown, d: number) => v !== undefined && v !== null && v !== '' ? Number(v) : d;
  const poolVolume = Math.max(100, num(inputs.poolVolume, 15000)); // gallons
  const currentTemp = Math.max(32, num(inputs.currentTemp, 65));
  const targetTemp = Math.max(32, num(inputs.targetTemp, 82));
  const heaterType = String(inputs.heaterType || 'gas');
  const gasPrice = Math.max(0, num(inputs.gasPrice, 1.50)); // per therm
  const electricityRate = Math.max(0, num(inputs.electricityRate, 0.1724));
  const seasonMonths = Math.max(1, Math.min(12, num(inputs.seasonMonths, 6)));
  const coverUsed = inputs.coverUsed === true || inputs.coverUsed === 'yes';

  const tempRise = Math.max(0, targetTemp - currentTemp);
  const initialBtu = poolVolume * 8.34 * tempRise;

  // Daily heat loss: ~10°F per day uncovered, ~2°F covered (simplified)
  const dailyHeatLossDegrees = coverUsed ? 2 : 10;
  const dailyHeatLossBtu = poolVolume * 8.34 * dailyHeatLossDegrees;
  const seasonDays = seasonMonths * 30;

  let initialCost = 0;
  let monthlyCost = 0;
  let seasonalCost = 0;

  if (heaterType === 'gas') {
    const eff = HEATER_COP.gas;
    const initialTherms = initialBtu / (eff * 100000);
    initialCost = parseFloat((initialTherms * gasPrice).toFixed(2));
    const dailyTherms = dailyHeatLossBtu / (eff * 100000);
    monthlyCost = parseFloat((dailyTherms * 30 * gasPrice).toFixed(2));
    seasonalCost = parseFloat((initialCost + dailyTherms * seasonDays * gasPrice).toFixed(2));
  } else if (heaterType === 'heat-pump') {
    const cop = HEATER_COP['heat-pump'];
    const initialKwh = initialBtu / (cop * 3412);
    initialCost = parseFloat((initialKwh * electricityRate).toFixed(2));
    const dailyKwh = dailyHeatLossBtu / (cop * 3412);
    monthlyCost = parseFloat((dailyKwh * 30 * electricityRate).toFixed(2));
    seasonalCost = parseFloat((initialCost + dailyKwh * seasonDays * electricityRate).toFixed(2));
  } else {
    // Solar — no fuel cost
    initialCost = 0;
    monthlyCost = 0;
    seasonalCost = 0;
  }

  // Comparison: gas vs heat pump
  const gasEff = 0.85;
  const hpCop = 5.0;
  const gasSeasonal = (initialBtu / (gasEff * 100000) * gasPrice) + (dailyHeatLossBtu * seasonDays / (gasEff * 100000) * gasPrice);
  const hpSeasonal = (initialBtu / (hpCop * 3412) * electricityRate) + (dailyHeatLossBtu * seasonDays / (hpCop * 3412) * electricityRate);

  return {
    initialCost,
    monthlyCost,
    seasonalCost,
    initialBtu: Math.round(initialBtu),
    gasSeasonalCost: parseFloat(gasSeasonal.toFixed(2)),
    heatPumpSeasonalCost: parseFloat(hpSeasonal.toFixed(2)),
    annualSavingsHeatPump: parseFloat((gasSeasonal - hpSeasonal).toFixed(2)),
    coverSavingsPercent: coverUsed ? 80 : 0,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'pool-heating-cost': calculatePoolHeatingCost,
};
