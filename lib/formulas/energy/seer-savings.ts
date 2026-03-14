/**
 * SEER2 HVAC Savings Calculator
 *
 * Formulas:
 *   Annual cooling kWh = (home_size × cooling_factor × cooling_hours) / (SEER2 × 1000)
 *   Annual cooling cost = kWh × electricity_rate
 *   Savings = old_cost - new_cost
 *   Payback = system_cost / annual_savings
 *
 * SEER2 (Seasonal Energy Efficiency Ratio 2) became the DOE test/rating
 * framework effective January 1, 2023 — replacing the original SEER standard.
 * SEER2 values are typically 0.5-1.0 points lower than SEER for the same unit
 * due to the updated M1 testing conditions with higher external static pressure.
 *
 * Source: DOE SEER2 / HSPF2 framework (effective 2023);
 *         AHRI — Air Conditioning Rating Standards (2024).
 *
 * NOTE: Installation quality, duct leakage, refrigerant charge, and actual
 * runtime hours significantly affect real-world savings.
 */

const COOLING_BTU_PER_SQFT: Record<string, number> = {
  light: 20,     // mild climate, well-insulated
  moderate: 28,  // mixed climate, average home
  heavy: 38,     // hot climate, poor insulation
};

export function calculateSeerSavings(inputs: Record<string, unknown>): Record<string, unknown> {
  const num = (v: unknown, d: number) => v !== undefined && v !== null && v !== '' ? Number(v) : d;
  const currentSeer = Math.max(1, Math.min(30, num(inputs.currentSeer, 10)));
  const newSeer = Math.max(1, Math.min(30, num(inputs.newSeer, 16)));
  const homeSize = Math.max(100, num(inputs.homeSize, 2000));
  const usageProfile = String(inputs.usageProfile || 'moderate');
  const electricityRate = Math.max(0, num(inputs.electricityRate, 0.1724));
  const systemCost = Math.max(0, num(inputs.systemCost, 8000));
  const annualCoolingHours = Math.max(0, num(inputs.annualCoolingHours, 1200));

  // Validate: new SEER should be >= current
  const effectiveNewSeer = Math.max(newSeer, currentSeer);

  const btuPerSqft = COOLING_BTU_PER_SQFT[usageProfile] || COOLING_BTU_PER_SQFT.moderate;
  const totalBtu = homeSize * btuPerSqft;

  // Annual kWh = (BTU/hr × hours) / (SEER2 × 1000)
  // SEER2 = BTU / Wh, so kWh = BTU × hours / (SEER2 × 1000)
  const currentAnnualKwh = parseFloat(((totalBtu * annualCoolingHours) / (currentSeer * 1000)).toFixed(2));
  const newAnnualKwh = parseFloat(((totalBtu * annualCoolingHours) / (effectiveNewSeer * 1000)).toFixed(2));

  const currentAnnualCost = parseFloat((currentAnnualKwh * electricityRate).toFixed(2));
  const newAnnualCost = parseFloat((newAnnualKwh * electricityRate).toFixed(2));
  const annualSavings = parseFloat((currentAnnualCost - newAnnualCost).toFixed(2));

  const paybackPeriod = annualSavings > 0
    ? parseFloat((systemCost / annualSavings).toFixed(1))
    : -1;

  const fifteenYearSavings = parseFloat((annualSavings * 15 - systemCost).toFixed(2));

  return {
    currentAnnualCost,
    newAnnualCost,
    annualSavings,
    paybackPeriod,
    fifteenYearSavings,
    currentAnnualKwh,
    newAnnualKwh,
    efficiencyGainPercent: parseFloat((((effectiveNewSeer - currentSeer) / currentSeer) * 100).toFixed(1)),
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'seer-savings': calculateSeerSavings,
};
