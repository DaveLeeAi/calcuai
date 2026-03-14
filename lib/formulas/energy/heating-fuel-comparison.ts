/**
 * Heating Fuel Comparison Calculator
 *
 * Compares cost per million BTU and annual heating cost across
 * natural gas, propane, heating oil, electric resistance, and heat pump.
 *
 * Formula: Cost per MMBTU = (fuel_price / BTU_per_unit) × 1,000,000 / efficiency
 * Annual cost = heating_load_BTU / (efficiency × BTU_per_unit) × fuel_price
 *
 * Source: U.S. EIA — Heating Fuel Comparison (2025);
 *         Penn State Extension — Home Heating Cost Calculator.
 */

interface FuelSpec {
  btuPerUnit: number;
  unitLabel: string;
  defaultPrice: number;
  defaultEfficiency: number;
}

const FUELS: Record<string, FuelSpec> = {
  'natural-gas':       { btuPerUnit: 100000,  unitLabel: 'therm',  defaultPrice: 1.50, defaultEfficiency: 0.85 },
  propane:             { btuPerUnit: 91500,   unitLabel: 'gallon', defaultPrice: 2.80, defaultEfficiency: 0.85 },
  'heating-oil':       { btuPerUnit: 138500,  unitLabel: 'gallon', defaultPrice: 3.40, defaultEfficiency: 0.83 },
  'electric-resistance':{ btuPerUnit: 3412,   unitLabel: 'kWh',   defaultPrice: 0.1724, defaultEfficiency: 1.00 },
  'heat-pump':         { btuPerUnit: 3412,    unitLabel: 'kWh',   defaultPrice: 0.1724, defaultEfficiency: 2.80 }, // COP 2.8
};

export function calculateHeatingFuelComparison(inputs: Record<string, unknown>): Record<string, unknown> {
  const num = (v: unknown, d: number) => v !== undefined && v !== null && v !== '' ? Number(v) : d;
  const homeSize = Math.max(100, num(inputs.homeSize, 2000));
  const hdd = Math.max(100, num(inputs.heatingDegreeDays, 5000));

  // Estimate annual BTU load: homeSize × HDD × 24 × heat_loss_factor / 1e6 × 1e6
  // Simplified: ~20 BTU/sq ft per HDD for average insulation
  const annualBtu = homeSize * hdd * 4.5; // simplified factor

  const gasPrice = Math.max(0, num(inputs.gasPrice, FUELS['natural-gas'].defaultPrice));
  const propanePrice = Math.max(0, num(inputs.propanePrice, FUELS.propane.defaultPrice));
  const oilPrice = Math.max(0, num(inputs.oilPrice, FUELS['heating-oil'].defaultPrice));
  const electricRate = Math.max(0, num(inputs.electricRate, 0.1724));

  const prices: Record<string, number> = {
    'natural-gas': gasPrice,
    propane: propanePrice,
    'heating-oil': oilPrice,
    'electric-resistance': electricRate,
    'heat-pump': electricRate,
  };

  const comparison = Object.entries(FUELS).map(([fuelId, spec]) => {
    const price = prices[fuelId] || spec.defaultPrice;
    const costPerMmbtu = parseFloat(((price / spec.btuPerUnit) * 1000000 / spec.defaultEfficiency).toFixed(2));
    const annualUnits = parseFloat((annualBtu / (spec.defaultEfficiency * spec.btuPerUnit)).toFixed(1));
    const annualCost = parseFloat((annualUnits * price).toFixed(2));
    const monthlyCost = parseFloat((annualCost / 12).toFixed(2));

    return {
      fuel: fuelId,
      unitLabel: spec.unitLabel,
      price,
      efficiency: spec.defaultEfficiency,
      costPerMmbtu,
      annualUnits,
      annualCost,
      monthlyCost,
    };
  });

  comparison.sort((a, b) => a.annualCost - b.annualCost);
  const cheapest = comparison[0];
  const mostExpensive = comparison[comparison.length - 1];

  return {
    comparison,
    cheapestFuel: cheapest.fuel,
    cheapestAnnualCost: cheapest.annualCost,
    mostExpensiveFuel: mostExpensive.fuel,
    mostExpensiveAnnualCost: mostExpensive.annualCost,
    annualBtu: Math.round(annualBtu),
    savingsVsMostExpensive: parseFloat((mostExpensive.annualCost - cheapest.annualCost).toFixed(2)),
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'heating-fuel-comparison': calculateHeatingFuelComparison,
};
