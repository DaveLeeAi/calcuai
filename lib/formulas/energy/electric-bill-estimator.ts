/**
 * Electric Bill Estimator
 *
 * Formulas:
 *   Monthly Bill = (Monthly kWh × Rate per kWh) + Fixed Monthly Charge
 *   Annual Bill = Monthly Bill × 12
 *   Daily Cost = Monthly Bill / 30
 *
 * Source: U.S. Energy Information Administration (EIA), Electric Power Monthly, December 2025.
 */

export interface ElectricBillInput {
  monthlyKwh: number;
  ratePerKwh: number;
  fixedCharge: number;
}

export interface ElectricBillOutput {
  monthlyBill: number;
  annualBill: number;
  dailyCost: number;
  breakdown: { label: string; value: number }[];
}

/**
 * Calculates the estimated monthly and annual electric bill.
 *
 * Monthly Bill = (kWh × Rate) + Fixed Charge
 *
 * @param inputs - Record with monthlyKwh, ratePerKwh, fixedCharge
 * @returns Record with monthlyBill, annualBill, dailyCost, breakdown
 */
export function calculateElectricBill(inputs: Record<string, unknown>): Record<string, unknown> {
  const num = (v: unknown, d: number) => v !== undefined && v !== null && v !== '' ? Number(v) : d;
  const monthlyKwh = Math.max(0, num(inputs.monthlyKwh, 863));
  const ratePerKwh = Math.max(0, num(inputs.ratePerKwh, 0.1724));
  const fixedCharge = Math.max(0, num(inputs.fixedCharge, 0));

  const energyCost = parseFloat((monthlyKwh * ratePerKwh).toFixed(2));
  const monthlyBill = parseFloat((energyCost + fixedCharge).toFixed(2));
  const annualBill = parseFloat((monthlyBill * 12).toFixed(2));
  const dailyCost = parseFloat((monthlyBill / 30).toFixed(2));

  const breakdown: { label: string; value: number }[] = [
    { label: 'Energy Cost (kWh × Rate)', value: energyCost },
    { label: 'Fixed Monthly Charge', value: fixedCharge },
    { label: 'Monthly Bill', value: monthlyBill },
    { label: 'Annual Bill', value: annualBill },
    { label: 'Daily Cost', value: dailyCost },
  ];

  return { monthlyBill, annualBill, dailyCost, breakdown };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'electric-bill-estimator': calculateElectricBill,
};
