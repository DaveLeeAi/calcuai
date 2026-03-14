/**
 * Home Energy Carbon Footprint Calculator
 *
 * Formulas:
 *   Electricity CO2 = monthly kWh × grid carbon intensity (lbs CO2/kWh)
 *   Gas CO2 = monthly therms × 11.7 lbs CO2/therm
 *   Oil CO2 = monthly gallons × 22.4 lbs CO2/gallon
 *   Total monthly CO2 = electricity + gas + oil
 *   Annual CO2 (tons) = total monthly × 12 / 2000
 *   Trees equivalent = annual lbs / 48.1 lbs per tree per year
 *
 * Source: EPA eGRID 2024; EIA Carbon Dioxide Emission Factors 2025.
 */

const GRID_INTENSITY: Record<string, number> = {
  grid:          1.03,  // US average lbs CO2 per kWh (EPA eGRID 2024)
  'partial-solar': 0.52, // ~50% solar offset
  'full-solar':    0.05, // near-zero with minor grid backup
};

export function calculateCarbonFootprint(inputs: Record<string, unknown>): Record<string, unknown> {
  const num = (v: unknown, d: number) => v !== undefined && v !== null && v !== '' ? Number(v) : d;
  const monthlyElectricity = Math.max(0, num(inputs.monthlyElectricity, 863));
  const electricitySource = String(inputs.electricitySource || 'grid');
  const monthlyGas = Math.max(0, num(inputs.monthlyGas, 40));
  const monthlyOil = Math.max(0, num(inputs.monthlyOil, 0));

  const gridIntensity = GRID_INTENSITY[electricitySource] || GRID_INTENSITY.grid;

  const electricityCO2 = parseFloat((monthlyElectricity * gridIntensity).toFixed(1));
  const gasCO2 = parseFloat((monthlyGas * 11.7).toFixed(1));
  const oilCO2 = parseFloat((monthlyOil * 22.4).toFixed(1));
  const totalMonthlyCO2 = parseFloat((electricityCO2 + gasCO2 + oilCO2).toFixed(1));
  const annualCO2Tons = parseFloat(((totalMonthlyCO2 * 12) / 2000).toFixed(2));
  const treesEquivalent = Math.ceil((totalMonthlyCO2 * 12) / 48.1);

  const pieData = [
    { label: 'Electricity', value: electricityCO2 },
    { label: 'Natural Gas', value: gasCO2 },
    { label: 'Heating Oil', value: oilCO2 },
  ];

  return {
    electricityCO2,
    gasCO2,
    oilCO2,
    totalMonthlyCO2,
    annualCO2Tons,
    treesEquivalent,
    pieData,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'carbon-footprint': calculateCarbonFootprint,
};
