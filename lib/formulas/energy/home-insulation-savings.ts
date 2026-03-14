/**
 * Home Insulation Savings Calculator
 *
 * Formulas:
 *   Heat loss reduction factor = 1 - (current_R / target_R)
 *   Estimated annual savings = annual_energy_cost × heating_fraction × reduction_factor × climate_weight
 *   Payback = project_cost / annual_savings
 *   20-year savings = annual_savings × 20 - project_cost
 *
 * This uses a simplified envelope improvement model. Actual savings depend on
 * home geometry, air sealing, duct condition, HVAC sizing, and occupant behavior.
 * Outputs are estimates, not guaranteed performance.
 *
 * Source: U.S. DOE Building Technologies Office — Insulation Fact Sheet (2024);
 *         Oak Ridge National Laboratory — Building Envelope Research (2023);
 *         IRS — Energy Efficient Home Improvement Credit (25C) guidance.
 */

const CLIMATE_WEIGHT: Record<string, number> = {
  'very-cold': 1.25,  // zones 6-7: Minneapolis, Anchorage
  cold: 1.10,         // zones 4-5: Chicago, Denver
  mixed: 0.90,        // zone 3: Atlanta, Dallas
  hot: 0.65,          // zones 1-2: Miami, Houston
};

const HEATING_FRACTION = 0.45; // ~45% of home energy goes to heating/cooling (DOE estimate)

export function calculateHomeInsulationSavings(inputs: Record<string, unknown>): Record<string, unknown> {
  const num = (v: unknown, d: number) => v !== undefined && v !== null && v !== '' ? Number(v) : d;
  const homeSize = Math.max(100, num(inputs.homeSize, 2000));
  const currentR = Math.max(1, num(inputs.currentR, 13));
  const targetR = Math.max(1, num(inputs.targetR, 49));
  const climateZone = String(inputs.climateZone || 'cold');
  const fuelType = String(inputs.fuelType || 'gas');
  const energyPrice = Math.max(0, num(inputs.energyPrice, 1.50));
  const projectCost = Math.max(0, num(inputs.projectCost, 2500));

  // Effective target R must be >= current R
  const effectiveTargetR = Math.max(targetR, currentR);

  // Estimate annual energy cost based on home size and fuel type
  // These are simplified national-average estimates per sq ft
  const costPerSqft: Record<string, number> = {
    gas: 0.65,       // ~$1,300/yr for 2,000 sq ft
    electric: 0.85,  // ~$1,700/yr
    oil: 0.95,       // ~$1,900/yr
    propane: 0.90,   // ~$1,800/yr
  };
  const annualEnergyCost = homeSize * (costPerSqft[fuelType] || costPerSqft.gas);

  const reductionFactor = effectiveTargetR > currentR
    ? 1 - (currentR / effectiveTargetR)
    : 0;

  const weight = CLIMATE_WEIGHT[climateZone] || 1.0;
  const annualSavings = parseFloat((annualEnergyCost * HEATING_FRACTION * reductionFactor * weight).toFixed(2));

  // Split: roughly 65% heating savings, 35% cooling savings
  const heatingSavings = parseFloat((annualSavings * 0.65).toFixed(2));
  const coolingSavings = parseFloat((annualSavings * 0.35).toFixed(2));

  const paybackPeriod = annualSavings > 0
    ? parseFloat((projectCost / annualSavings).toFixed(1))
    : -1;

  const twentyYearSavings = parseFloat((annualSavings * 20 - projectCost).toFixed(2));

  return {
    annualSavings,
    paybackPeriod,
    twentyYearSavings,
    heatingSavings,
    coolingSavings,
    reductionPercent: parseFloat((reductionFactor * 100).toFixed(1)),
    estimatedAnnualEnergyCost: parseFloat(annualEnergyCost.toFixed(2)),
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'home-insulation-savings': calculateHomeInsulationSavings,
};
