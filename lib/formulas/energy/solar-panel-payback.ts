/**
 * Solar Panel Payback Period Calculator
 *
 * Formulas:
 *   Net System Cost = Gross Cost − Federal Tax Credit (30%) − State Incentives
 *   Annual Savings = Annual kWh Production × Rate per kWh
 *   Simple Payback Years = Net System Cost / Annual Savings
 *   Lifetime Savings = (Annual Savings × System Lifetime) − Net System Cost
 *   ROI = Lifetime Savings / Net System Cost × 100
 *
 * Source: U.S. Department of Energy — Solar Investment Tax Credit (ITC) Guide (2025).
 * Source: National Renewable Energy Laboratory (NREL) — PVWatts Methodology (2025).
 */

export interface SolarPaybackInput {
  systemCostDollars: number;
  annualKwhProduction: number;
  electricityRatePerKwh: number;
  annualRateIncrease: number;
  stateIncentives: number;
  systemLifetimeYears: number;
  applyFederalCredit: boolean;
}

export interface SolarPaybackYearRow {
  year: number;
  cumulativeSavings: number;
  netPosition: number;
}

export interface SolarPaybackOutput {
  netSystemCost: number;
  federalTaxCredit: number;
  simplePaybackYears: number;
  annualSavingsYear1: number;
  lifetimeSavings: number;
  roi: number;
  paybackTable: SolarPaybackYearRow[];
  summary: { label: string; value: number }[];
}

/**
 * Calculates solar panel payback period, lifetime savings, and ROI.
 *
 * Net Cost = Gross − Tax Credit (30%) − State Incentives
 * Payback = Net Cost / Year 1 Savings
 * Lifetime Savings = Sum of savings over system life − Net Cost
 *
 * @param inputs - Record with systemCostDollars, annualKwhProduction, electricityRatePerKwh, annualRateIncrease, stateIncentives, systemLifetimeYears, applyFederalCredit
 * @returns Record with netSystemCost, simplePaybackYears, lifetimeSavings, roi, paybackTable, summary
 */
export function calculateSolarPayback(inputs: Record<string, unknown>): Record<string, unknown> {
  const systemCostDollars = Math.max(0, Number(inputs.systemCostDollars) || 0);
  const annualKwhProduction = Math.max(0, Number(inputs.annualKwhProduction) || 0);
  const electricityRatePerKwh = Math.max(0.01, Number(inputs.electricityRatePerKwh) || 0.16);
  const annualRateIncrease = Math.min(10, Math.max(0, Number(inputs.annualRateIncrease) || 3));
  const stateIncentives = Math.max(0, Number(inputs.stateIncentives) || 0);
  const systemLifetimeYears = Math.min(30, Math.max(5, Math.round(Number(inputs.systemLifetimeYears) || 25)));
  const applyFederalCredit = inputs.applyFederalCredit !== false;

  const federalTaxCredit = applyFederalCredit ? parseFloat((systemCostDollars * 0.30).toFixed(2)) : 0;
  const netSystemCost = parseFloat(Math.max(0, systemCostDollars - federalTaxCredit - stateIncentives).toFixed(2));

  const annualSavingsYear1 = parseFloat((annualKwhProduction * electricityRatePerKwh).toFixed(2));

  // Simple payback (no rate escalation)
  const simplePaybackYears = annualSavingsYear1 > 0
    ? parseFloat((netSystemCost / annualSavingsYear1).toFixed(1))
    : Infinity;

  // Lifetime savings with rate escalation
  let cumulativeSavings = 0;
  const paybackTable: SolarPaybackYearRow[] = [];
  const rateMultiplier = 1 + annualRateIncrease / 100;

  for (let y = 1; y <= systemLifetimeYears; y++) {
    const yearSavings = annualKwhProduction * electricityRatePerKwh * Math.pow(rateMultiplier, y - 1);
    cumulativeSavings += yearSavings;
    const netPosition = parseFloat((cumulativeSavings - netSystemCost).toFixed(2));
    paybackTable.push({ year: y, cumulativeSavings: parseFloat(cumulativeSavings.toFixed(2)), netPosition });
  }

  const lifetimeSavings = parseFloat((cumulativeSavings - netSystemCost).toFixed(2));
  const roi = netSystemCost > 0 ? parseFloat(((lifetimeSavings / netSystemCost) * 100).toFixed(1)) : 0;

  const summary: { label: string; value: number }[] = [
    { label: 'Gross System Cost', value: systemCostDollars },
    { label: 'Federal Tax Credit (30%)', value: federalTaxCredit },
    { label: 'Net System Cost', value: netSystemCost },
    { label: 'Year 1 Annual Savings', value: annualSavingsYear1 },
    { label: 'Simple Payback (Years)', value: simplePaybackYears === Infinity ? 0 : simplePaybackYears },
    { label: 'Lifetime Savings', value: lifetimeSavings },
    { label: 'Lifetime ROI (%)', value: roi },
  ];

  return { netSystemCost, federalTaxCredit, simplePaybackYears: simplePaybackYears === Infinity ? 0 : simplePaybackYears, annualSavingsYear1, lifetimeSavings, roi, paybackTable, summary };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'solar-panel-payback': calculateSolarPayback,
};
