/**
 * Heat Pump Water Heater Payback Calculator
 *
 * Compares operating cost of current water heater vs heat pump water heater,
 * including IRA federal tax credit and state rebates.
 *
 * Formula:
 *   Annual energy = (gallons/day × 8.34 × temp_rise × 365) / (3412 × efficiency)
 *   Payback = (HPWH cost - credit - rebate - current WH cost) / annual savings
 *
 * Source: U.S. DOE — Heat Pump Water Heater Savings (2025);
 *         IRS — Energy Efficient Home Improvement Credit (25C).
 */

const HEATER_EFFICIENCY: Record<string, { eff: number; fuelType: 'electric' | 'gas' }> = {
  'electric-tank':   { eff: 0.92,  fuelType: 'electric' },
  'gas-tank':        { eff: 0.60,  fuelType: 'gas' },
  'gas-tankless':    { eff: 0.82,  fuelType: 'gas' },
  'electric-tankless':{ eff: 0.99, fuelType: 'electric' },
};

export function calculateHeatPumpWaterHeaterPayback(inputs: Record<string, unknown>): Record<string, unknown> {
  const num = (v: unknown, d: number) => v !== undefined && v !== null && v !== '' ? Number(v) : d;
  const currentType = String(inputs.currentType || 'electric-tank');
  const householdSize = Math.max(1, num(inputs.householdSize, 3));
  const electricityRate = Math.max(0, num(inputs.electricityRate, 0.1724));
  const gasRate = Math.max(0, num(inputs.gasRate, 1.50));
  const hpwhCost = Math.max(0, num(inputs.hpwhCost, 3500)); // installed
  const currentWhCost = Math.max(0, num(inputs.currentWhCost, 1200)); // installed replacement
  const federalCredit = num(inputs.federalCredit, 2000); // 25C credit, max $2000
  const stateRebate = Math.max(0, num(inputs.stateRebate, 0));

  const gallonsPerDay = householdSize * 20; // ~20 gal/person/day
  const tempRise = 70; // 50°F cold → 120°F hot
  const annualBtu = gallonsPerDay * 8.34 * tempRise * 365;

  // Current system annual cost
  const current = HEATER_EFFICIENCY[currentType] || HEATER_EFFICIENCY['electric-tank'];
  let currentAnnualCost: number;
  if (current.fuelType === 'electric') {
    const kwh = annualBtu / (3412 * current.eff);
    currentAnnualCost = parseFloat((kwh * electricityRate).toFixed(2));
  } else {
    const therms = annualBtu / (100000 * current.eff);
    currentAnnualCost = parseFloat((therms * gasRate).toFixed(2));
  }

  // HPWH annual cost (COP 3.5)
  const hpwhCop = 3.5;
  const hpwhKwh = annualBtu / (3412 * hpwhCop);
  const hpwhAnnualCost = parseFloat((hpwhKwh * electricityRate).toFixed(2));

  const annualSavings = parseFloat((currentAnnualCost - hpwhAnnualCost).toFixed(2));
  const effectiveFederalCredit = Math.min(federalCredit, Math.max(0, hpwhCost * 0.30));
  const netUpfrontCost = parseFloat(Math.max(0, hpwhCost - effectiveFederalCredit - stateRebate - currentWhCost).toFixed(2));
  // If replacing anyway, compare incremental cost
  const incrementalCost = parseFloat(Math.max(0, hpwhCost - currentWhCost - effectiveFederalCredit - stateRebate).toFixed(2));

  const paybackYears = annualSavings > 0
    ? parseFloat((incrementalCost / annualSavings).toFixed(1))
    : -1;

  const fifteenYearSavings = parseFloat((annualSavings * 15 - incrementalCost).toFixed(2));

  return {
    currentAnnualCost,
    hpwhAnnualCost,
    annualSavings,
    effectiveFederalCredit: parseFloat(effectiveFederalCredit.toFixed(2)),
    incrementalCost,
    paybackYears,
    fifteenYearSavings,
    gallonsPerDay,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'heat-pump-water-heater-payback': calculateHeatPumpWaterHeaterPayback,
};
