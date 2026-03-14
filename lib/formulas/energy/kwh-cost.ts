/**
 * kWh Cost Calculator (Appliance Running Cost)
 *
 * Formulas:
 *   Daily kWh = (Watts / 1000) × Hours Per Day
 *   Monthly kWh = Daily kWh × 30
 *   Annual kWh = Daily kWh × 365
 *   Daily Cost = Daily kWh × Rate per kWh
 *   Monthly Cost = Monthly kWh × Rate per kWh
 *   Annual Cost = Annual kWh × Rate per kWh
 *
 * Source: U.S. Energy Information Administration — Residential Electricity Use (2025).
 * Source: ENERGY STAR — Appliance Energy Use Guidelines (2025).
 */

export interface KwhCostInput {
  watts: number;
  hoursPerDay: number;
  ratePerKwh: number;
  daysPerMonth: number;
}

export interface KwhCostOutput {
  dailyKwh: number;
  monthlyKwh: number;
  annualKwh: number;
  dailyCost: number;
  monthlyCost: number;
  annualCost: number;
  summary: { label: string; value: number }[];
}

/**
 * Calculates the electricity cost of running an appliance.
 *
 * Daily kWh = Watts / 1000 × Hours Per Day
 * Cost = kWh × Rate ($/kWh)
 *
 * @param inputs - Record with watts, hoursPerDay, ratePerKwh, daysPerMonth
 * @returns Record with dailyKwh, monthlyKwh, annualKwh, dailyCost, monthlyCost, annualCost, summary
 */
export function calculateKwhCost(inputs: Record<string, unknown>): Record<string, unknown> {
  const watts = Math.max(0, Number(inputs.watts) || 0);
  const hoursPerDay = Math.min(24, Math.max(0, Number(inputs.hoursPerDay) || 0));
  const ratePerKwh = Math.max(0, Number(inputs.ratePerKwh) || 0.16);
  const daysPerMonth = Math.min(31, Math.max(1, Number(inputs.daysPerMonth) || 30));

  const dailyKwh = parseFloat(((watts / 1000) * hoursPerDay).toFixed(4));
  const monthlyKwh = parseFloat((dailyKwh * daysPerMonth).toFixed(4));
  const annualKwh = parseFloat((dailyKwh * 365).toFixed(2));

  const dailyCost = parseFloat((dailyKwh * ratePerKwh).toFixed(4));
  const monthlyCost = parseFloat((monthlyKwh * ratePerKwh).toFixed(2));
  const annualCost = parseFloat((annualKwh * ratePerKwh).toFixed(2));

  const summary: { label: string; value: number }[] = [
    { label: 'Power (Watts)', value: watts },
    { label: 'Daily Usage (kWh)', value: dailyKwh },
    { label: 'Monthly Usage (kWh)', value: monthlyKwh },
    { label: 'Annual Usage (kWh)', value: annualKwh },
    { label: 'Daily Cost ($)', value: dailyCost },
    { label: 'Monthly Cost ($)', value: monthlyCost },
    { label: 'Annual Cost ($)', value: annualCost },
  ];

  return { dailyKwh, monthlyKwh, annualKwh, dailyCost, monthlyCost, annualCost, summary };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'kwh-cost': calculateKwhCost,
};
