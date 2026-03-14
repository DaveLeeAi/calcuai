/**
 * Home Heating Cost Calculator
 *
 * Formulas:
 *   Heat Loss (BTU/hr) = Home Area × U-Factor × ΔT (indoor − outdoor temp)
 *   Heating Degree Days (HDD) = sum of (65°F − daily avg temp) for cold days
 *   Annual BTU Needed = Home Area × Heat Loss Factor × HDD × 24
 *   Annual Fuel Needed = Annual BTU / (Fuel BTU Content × Efficiency)
 *   Annual Cost = Annual Fuel Needed × Fuel Rate
 *
 * Source: U.S. Energy Information Administration — Heating Fuel Comparison (2025).
 * Source: U.S. DOE Building Technologies — Residential Energy Consumption Survey (2025).
 */

export interface HomeHeatingCostInput {
  homeAreaSqFt: number;
  insultationLevel: string;
  heatingDegreeDays: number;
  fuelType: string;
  fuelRate: number;
  systemEfficiencyPercent: number;
}

export interface MonthlyHeatingRow {
  month: string;
  estimatedCost: number;
  percentOfAnnual: number;
}

export interface HomeHeatingCostOutput {
  annualHeatingCost: number;
  monthlyAverage: number;
  annualBtuNeeded: number;
  annualFuelUnits: number;
  fuelUnit: string;
  monthlyEstimates: MonthlyHeatingRow[];
  summary: { label: string; value: number }[];
}

/**
 * Estimates annual and monthly home heating costs by fuel type.
 *
 * Annual BTU = Area × BTU/sq ft/HDD × HDD × 24
 * Annual Cost = BTU Needed / (Fuel BTU Content × Efficiency) × Rate
 *
 * @param inputs - Record with homeAreaSqFt, insulationLevel, heatingDegreeDays, fuelType, fuelRate, systemEfficiencyPercent
 * @returns Record with annualHeatingCost, monthlyAverage, annualFuelUnits, monthlyEstimates, summary
 */
export function calculateHomeHeatingCost(inputs: Record<string, unknown>): Record<string, unknown> {
  const homeAreaSqFt = Math.max(100, Number(inputs.homeAreaSqFt) || 1500);
  const insulationLevel = String(inputs.insultationLevel || 'average');
  const heatingDegreeDays = inputs.heatingDegreeDays !== undefined
    ? Math.max(0, Number(inputs.heatingDegreeDays))
    : 4500;
  const fuelType = String(inputs.fuelType || 'natural-gas');
  const fuelRate = Math.max(0, Number(inputs.fuelRate) || 0);
  const systemEfficiencyPercent = Math.min(99, Math.max(50, Number(inputs.systemEfficiencyPercent) || 80));

  // BTU loss factor per sq ft per degree day (varies by insulation)
  const insulationFactors: Record<string, number> = {
    'poor': 0.75,
    'average': 0.55,
    'good': 0.40,
    'excellent': 0.28,
  };
  const btuFactor = insulationFactors[insulationLevel] ?? 0.55;

  // Annual BTU needed = area × factor × HDD × 24 hours
  const annualBtuNeeded = parseFloat((homeAreaSqFt * btuFactor * heatingDegreeDays * 24).toFixed(0));

  // Fuel energy content (BTU per unit) and unit name
  const fuelData: Record<string, { btuPerUnit: number; unit: string; defaultRate: number }> = {
    'natural-gas':    { btuPerUnit: 100000, unit: 'Therms', defaultRate: 1.50 },
    'electricity':    { btuPerUnit: 3412,   unit: 'kWh',    defaultRate: 0.16 },
    'heating-oil':    { btuPerUnit: 138500, unit: 'Gallons', defaultRate: 3.80 },
    'propane':        { btuPerUnit: 91500,  unit: 'Gallons', defaultRate: 2.50 },
    'wood-pellets':   { btuPerUnit: 16400000, unit: 'Tons',  defaultRate: 350 },
  };

  const fuel = fuelData[fuelType] ?? fuelData['natural-gas'];
  const effectiveRate = fuelRate > 0 ? fuelRate : fuel.defaultRate;
  const efficiency = systemEfficiencyPercent / 100;

  const annualFuelUnits = parseFloat((annualBtuNeeded / (fuel.btuPerUnit * efficiency)).toFixed(2));
  const annualHeatingCost = parseFloat((annualFuelUnits * effectiveRate).toFixed(2));
  const monthlyAverage = parseFloat((annualHeatingCost / 12).toFixed(2));

  // Monthly distribution (approximate seasonal pattern for northern US)
  const monthlyWeights: [string, number][] = [
    ['January', 0.18], ['February', 0.16], ['March', 0.13], ['April', 0.07],
    ['May', 0.02], ['June', 0.00], ['July', 0.00], ['August', 0.00],
    ['September', 0.02], ['October', 0.07], ['November', 0.13], ['December', 0.17],
  ];
  const monthlyEstimates: MonthlyHeatingRow[] = monthlyWeights.map(([month, weight]) => ({
    month,
    estimatedCost: parseFloat((annualHeatingCost * weight).toFixed(2)),
    percentOfAnnual: parseFloat((weight * 100).toFixed(0)),
  }));

  const summary: { label: string; value: number }[] = [
    { label: 'Annual BTU Needed', value: annualBtuNeeded },
    { label: `Annual ${fuel.unit} Used`, value: annualFuelUnits },
    { label: 'Annual Heating Cost', value: annualHeatingCost },
    { label: 'Monthly Average', value: monthlyAverage },
    { label: 'System Efficiency (%)', value: systemEfficiencyPercent },
    { label: 'Heating Degree Days', value: heatingDegreeDays },
  ];

  return { annualHeatingCost, monthlyAverage, annualBtuNeeded, annualFuelUnits, fuelUnit: fuel.unit, monthlyEstimates, summary };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'home-heating-cost': calculateHomeHeatingCost,
};
