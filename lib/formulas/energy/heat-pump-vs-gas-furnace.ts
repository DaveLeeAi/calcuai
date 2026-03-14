/**
 * Heat Pump vs Gas Furnace Calculator
 *
 * Formulas:
 *   Heating load (BTU) = home_size × heating_factor(climate_zone)
 *   Annual heat pump cost = (load / (COP × 3412)) × electricity_rate
 *   Annual gas cost = (load / (AFUE × 100000)) × gas_price
 *   Breakeven years = abs(heat_pump_cost - furnace_cost) / annual_savings
 *
 * Source: U.S. DOE Office of Energy Efficiency, ENERGY STAR 2026.
 */

const CLIMATE_FACTORS: Record<string, { heatingBtuPerSqft: number; cop: number }> = {
  cold:  { heatingBtuPerSqft: 45, cop: 2.5 },
  mixed: { heatingBtuPerSqft: 30, cop: 3.2 },
  hot:   { heatingBtuPerSqft: 15, cop: 3.8 },
};

export function calculateHeatPumpVsGas(inputs: Record<string, unknown>): Record<string, unknown> {
  const homeSize = Math.max(100, Number(inputs.homeSize) || 2000);
  const climateZone = String(inputs.climateZone || 'mixed');
  const electricityRate = Math.max(0, Number(inputs.electricityRate) || 0.1724);
  const gasPrice = Math.max(0, Number(inputs.gasPrice) || 1.50);
  const heatPumpCost = Math.max(0, Number(inputs.heatPumpCost) || 12000);
  const gasFurnaceCost = Math.max(0, Number(inputs.gasFurnaceCost) || 5000);
  const systemLifespan = Math.max(1, Number(inputs.systemLifespan) || 20);

  const climate = CLIMATE_FACTORS[climateZone] || CLIMATE_FACTORS.mixed;
  const annualBtu = homeSize * climate.heatingBtuPerSqft * 1000;

  // Heat pump: BTU / (COP × 3412 BTU/kWh) = kWh needed
  const heatPumpKwh = annualBtu / (climate.cop * 3412);
  const annualHeatPumpCost = parseFloat((heatPumpKwh * electricityRate).toFixed(2));

  // Gas furnace: BTU / (AFUE × BTU/therm) = therms needed (assume 80% AFUE)
  const afue = 0.80;
  const thermsNeeded = annualBtu / (afue * 100000);
  const annualGasCost = parseFloat((thermsNeeded * gasPrice).toFixed(2));

  const annualSavings = parseFloat((annualGasCost - annualHeatPumpCost).toFixed(2));
  const equipmentDiff = Math.abs(heatPumpCost - gasFurnaceCost);
  const breakevenYears = annualSavings > 0
    ? parseFloat((equipmentDiff / annualSavings).toFixed(1))
    : -1;

  const lifetimeSavings = parseFloat((annualSavings * systemLifespan - equipmentDiff).toFixed(2));

  // 20-year chart data
  const yearlyComparison: { year: number; heatPumpTotal: number; gasTotal: number }[] = [];
  for (let y = 0; y <= 20; y++) {
    yearlyComparison.push({
      year: y,
      heatPumpTotal: parseFloat((heatPumpCost + annualHeatPumpCost * y).toFixed(2)),
      gasTotal: parseFloat((gasFurnaceCost + annualGasCost * y).toFixed(2)),
    });
  }

  return {
    annualHeatPumpCost,
    annualGasCost,
    annualSavings,
    breakevenYears,
    lifetimeSavings,
    yearlyComparison,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'heat-pump-vs-gas-furnace': calculateHeatPumpVsGas,
};
