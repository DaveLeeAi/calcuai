/**
 * Net Metering Calculator
 *
 * Formulas:
 *   Excess solar = max(0, production - usage)
 *   Grid credit = excess × credit rate
 *   Grid draw = max(0, usage - production)
 *   Net monthly bill = (grid draw × buy rate) - grid credit
 *   Annual savings = (usage × buy rate × 12) - (net monthly bill × 12)
 *
 * Source: U.S. DOE — Net Metering Policy Overview (2026); DSIRE Database.
 */

export function calculateNetMetering(inputs: Record<string, unknown>): Record<string, unknown> {
  const num = (v: unknown, d: number) => v !== undefined && v !== null && v !== '' ? Number(v) : d;
  const monthlyProduction = Math.max(0, num(inputs.monthlyProduction, 900));
  const monthlyUsage = Math.max(0, num(inputs.monthlyUsage, 863));
  const buyRate = Math.max(0, num(inputs.buyRate, 0.1724));
  const creditRate = Math.max(0, num(inputs.creditRate, 0.1724));

  const excessSolar = parseFloat(Math.max(0, monthlyProduction - monthlyUsage).toFixed(2));
  const gridDraw = parseFloat(Math.max(0, monthlyUsage - monthlyProduction).toFixed(2));
  const gridCredit = parseFloat((excessSolar * creditRate).toFixed(2));
  const gridCost = parseFloat((gridDraw * buyRate).toFixed(2));
  const netMonthlyBill = parseFloat(Math.max(0, gridCost - gridCredit).toFixed(2));
  const monthlyWithoutSolar = parseFloat((monthlyUsage * buyRate).toFixed(2));
  const monthlySavings = parseFloat((monthlyWithoutSolar - netMonthlyBill).toFixed(2));
  const annualSavings = parseFloat((monthlySavings * 12).toFixed(2));

  return {
    excessSolar,
    gridCredit,
    netMonthlyBill,
    annualSavings,
    gridDraw,
    monthlySavings,
    monthlyWithoutSolar,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'net-metering': calculateNetMetering,
};
