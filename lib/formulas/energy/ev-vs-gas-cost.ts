/**
 * EV vs Gas Cost Calculator
 *
 * Formulas:
 *   EV annual fuel cost = (annual miles / EV efficiency mi/kWh) × electricity rate
 *   Gas annual fuel cost = (annual miles / MPG) × gas price
 *   5-yr EV total = (EV fuel × 5) + EV maintenance × 5 + EV price
 *   5-yr Gas total = (Gas fuel × 5) + Gas maintenance × 5 + Gas price
 *   Breakeven years = (EV price - Gas price) / (Gas annual cost - EV annual cost)
 *
 * Source: U.S. Department of Energy Alternative Fuels Data Center, 2026.
 */

export function calculateEvVsGas(inputs: Record<string, unknown>): Record<string, unknown> {
  const num = (v: unknown, d: number) => v !== undefined && v !== null && v !== '' ? Number(v) : d;
  const annualMiles = Math.max(0, num(inputs.annualMiles, 12000));
  const evEfficiency = Math.max(0.1, num(inputs.evEfficiency, 3.5));
  const electricityRate = Math.max(0, num(inputs.electricityRate, 0.1724));
  const gasPrice = Math.max(0, num(inputs.gasPrice, 3.50));
  const gasMpg = Math.max(0.1, num(inputs.gasMpg, 27));
  const evPrice = Math.max(0, num(inputs.evPrice, 35000));
  const gasCarPrice = Math.max(0, num(inputs.gasCarPrice, 30000));
  const evMaintenance = Math.max(0, num(inputs.evMaintenance, 600));
  const gasMaintenance = Math.max(0, num(inputs.gasMaintenance, 1200));

  const evAnnualFuel = parseFloat(((annualMiles / evEfficiency) * electricityRate).toFixed(2));
  const gasAnnualFuel = parseFloat(((annualMiles / gasMpg) * gasPrice).toFixed(2));
  const annualFuelSavings = parseFloat((gasAnnualFuel - evAnnualFuel).toFixed(2));

  const fiveYrEvTotal = parseFloat((evPrice + (evAnnualFuel + evMaintenance) * 5).toFixed(2));
  const fiveYrGasTotal = parseFloat((gasCarPrice + (gasAnnualFuel + gasMaintenance) * 5).toFixed(2));
  const fiveYrSavings = parseFloat((fiveYrGasTotal - fiveYrEvTotal).toFixed(2));

  const annualEvTotal = evAnnualFuel + evMaintenance;
  const annualGasTotal = gasAnnualFuel + gasMaintenance;
  const annualSavingsDiff = annualGasTotal - annualEvTotal;
  const priceDiff = evPrice - gasCarPrice;
  const breakevenYears = annualSavingsDiff > 0 && priceDiff > 0
    ? parseFloat((priceDiff / annualSavingsDiff).toFixed(1))
    : annualSavingsDiff > 0 ? 0 : -1;

  // Cumulative cost over 10 years for chart
  const cumulativeCost: { year: number; evCost: number; gasCost: number }[] = [];
  for (let y = 0; y <= 10; y++) {
    cumulativeCost.push({
      year: y,
      evCost: parseFloat((evPrice + (evAnnualFuel + evMaintenance) * y).toFixed(2)),
      gasCost: parseFloat((gasCarPrice + (gasAnnualFuel + gasMaintenance) * y).toFixed(2)),
    });
  }

  return {
    fiveYrEvTotal,
    fiveYrGasTotal,
    fiveYrSavings,
    annualFuelSavings,
    breakevenYears,
    evAnnualFuel,
    gasAnnualFuel,
    cumulativeCost,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'ev-vs-gas-cost': calculateEvVsGas,
};
