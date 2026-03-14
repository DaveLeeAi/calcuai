/**
 * Gas vs. Electric Cost Comparison Calculator
 *
 * Formulas:
 *   Annual Gas Cost = (BTU Needed / Furnace Efficiency) / BTU per Therm × Gas Rate
 *   Annual Electric Cost = (BTU Needed / (HSPF × 3.412)) / 1000 × Electric Rate × Operating Hours
 *   Simplified: Annual Gas Cost = Therms Used × Gas Rate per Therm
 *   Annual Electric Cost = kWh Used × Electric Rate
 *   10-Year Total = Annual Cost × 10
 *   Savings = More Expensive Annual Cost − Less Expensive Annual Cost
 *
 * Source: U.S. Energy Information Administration — Natural Gas and Electricity Prices (2025).
 * Source: ENERGY STAR — Heating System Efficiency Ratings (2025).
 */

export interface GasVsElectricInput {
  annualThermsGas: number;
  gasCostPerTherm: number;
  furnaceEfficiencyPercent: number;
  annualKwhElectric: number;
  electricCostPerKwh: number;
  heatPumpHspf: number;
}

export interface FuelComparisonRow {
  fuel: string;
  annualCost: number;
  tenYearCost: number;
  efficiencyRating: string;
}

export interface GasVsElectricOutput {
  annualGasCost: number;
  annualElectricCost: number;
  annualSavings: number;
  cheaperFuel: string;
  tenYearSavings: number;
  comparisonTable: FuelComparisonRow[];
  summary: { label: string; value: number }[];
}

/**
 * Compares annual heating costs between natural gas and electric/heat pump systems.
 *
 * Annual Gas Cost = Therms Used × Rate × (100 / Efficiency%)
 * Annual Electric Cost = kWh Used × Rate
 *
 * @param inputs - Record with annualThermsGas, gasCostPerTherm, furnaceEfficiencyPercent, annualKwhElectric, electricCostPerKwh, heatPumpHspf
 * @returns Record with annualGasCost, annualElectricCost, annualSavings, cheaperFuel, comparisonTable, summary
 */
export function calculateGasVsElectricCost(inputs: Record<string, unknown>): Record<string, unknown> {
  const annualThermsGas = Math.max(0, Number(inputs.annualThermsGas) || 0);
  const gasCostPerTherm = Math.max(0, Number(inputs.gasCostPerTherm) || 1.50);
  const furnaceEfficiencyPercent = Math.min(99, Math.max(50, Number(inputs.furnaceEfficiencyPercent) || 80));
  const annualKwhElectric = Math.max(0, Number(inputs.annualKwhElectric) || 0);
  const electricCostPerKwh = Math.max(0.01, Number(inputs.electricCostPerKwh) || 0.16);
  const heatPumpHspf = Math.max(0, Number(inputs.heatPumpHspf) || 0); // 0 = resistance heat

  // Effective gas cost accounting for furnace efficiency
  const annualGasCost = parseFloat((annualThermsGas * gasCostPerTherm * (100 / furnaceEfficiencyPercent)).toFixed(2));

  // Electric cost - if HSPF provided, heat pump is more efficient
  const effectiveKwh = heatPumpHspf > 0
    ? parseFloat((annualKwhElectric / heatPumpHspf).toFixed(2))
    : annualKwhElectric;
  const annualElectricCost = parseFloat((effectiveKwh * electricCostPerKwh).toFixed(2));

  const cheaperFuel = annualGasCost <= annualElectricCost ? 'Natural Gas' : 'Electric';
  const annualSavings = parseFloat(Math.abs(annualGasCost - annualElectricCost).toFixed(2));
  const tenYearSavings = parseFloat((annualSavings * 10).toFixed(2));

  const comparisonTable: FuelComparisonRow[] = [
    {
      fuel: 'Natural Gas',
      annualCost: annualGasCost,
      tenYearCost: parseFloat((annualGasCost * 10).toFixed(2)),
      efficiencyRating: `${furnaceEfficiencyPercent}% AFUE`,
    },
    {
      fuel: heatPumpHspf > 0 ? `Electric Heat Pump (HSPF ${heatPumpHspf})` : 'Electric Resistance',
      annualCost: annualElectricCost,
      tenYearCost: parseFloat((annualElectricCost * 10).toFixed(2)),
      efficiencyRating: heatPumpHspf > 0 ? `${heatPumpHspf} HSPF` : '100% COP',
    },
  ];

  const summary: { label: string; value: number }[] = [
    { label: 'Annual Gas Cost', value: annualGasCost },
    { label: 'Annual Electric Cost', value: annualElectricCost },
    { label: 'Annual Savings', value: annualSavings },
    { label: '10-Year Savings', value: tenYearSavings },
    { label: 'Gas Rate ($/Therm)', value: gasCostPerTherm },
    { label: 'Electric Rate ($/kWh)', value: electricCostPerKwh },
  ];

  return { annualGasCost, annualElectricCost, annualSavings, cheaperFuel, tenYearSavings, comparisonTable, summary };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'gas-vs-electric-cost': calculateGasVsElectricCost,
};
