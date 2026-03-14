/**
 * Appliance Energy Cost Calculator
 *
 * Calculates running cost for specific household appliances using
 * pre-loaded typical wattages or custom input.
 *
 * Formula: Cost = (Watts × Hours/Day × Days/Year) / 1000 × Rate
 *
 * Source: U.S. DOE — Estimating Appliance Energy Use (2025);
 *         ENERGY STAR — Appliance Energy Database (2025).
 */

const APPLIANCE_WATTAGES: Record<string, { watts: number; typicalHours: number }> = {
  refrigerator:     { watts: 150,  typicalHours: 24  },
  'chest-freezer':  { watts: 100,  typicalHours: 24  },
  dishwasher:       { watts: 1800, typicalHours: 1   },
  'washing-machine':{ watts: 500,  typicalHours: 1   },
  'clothes-dryer':  { watts: 5000, typicalHours: 1   },
  'electric-oven':  { watts: 2500, typicalHours: 1   },
  microwave:        { watts: 1200, typicalHours: 0.25 },
  'coffee-maker':   { watts: 900,  typicalHours: 0.5 },
  'space-heater':   { watts: 1500, typicalHours: 4   },
  'window-ac':      { watts: 1200, typicalHours: 8   },
  'central-ac':     { watts: 3500, typicalHours: 8   },
  'ceiling-fan':    { watts: 75,   typicalHours: 12  },
  'led-tv-55':      { watts: 100,  typicalHours: 5   },
  'gaming-console': { watts: 150,  typicalHours: 3   },
  'desktop-pc':     { watts: 200,  typicalHours: 6   },
  laptop:           { watts: 50,   typicalHours: 6   },
  'hair-dryer':     { watts: 1500, typicalHours: 0.25 },
  'pool-pump':      { watts: 1500, typicalHours: 8   },
  dehumidifier:     { watts: 500,  typicalHours: 12  },
  'led-bulb':       { watts: 10,   typicalHours: 5   },
  custom:           { watts: 0,    typicalHours: 0   },
};

export function calculateApplianceEnergyCost(inputs: Record<string, unknown>): Record<string, unknown> {
  const num = (v: unknown, d: number) => v !== undefined && v !== null && v !== '' ? Number(v) : d;
  const appliance = String(inputs.appliance || 'refrigerator');
  const preset = APPLIANCE_WATTAGES[appliance] || APPLIANCE_WATTAGES.refrigerator;

  const watts = Math.max(0, num(inputs.watts, preset.watts));
  const hoursPerDay = Math.min(24, Math.max(0, num(inputs.hoursPerDay, preset.typicalHours)));
  const daysPerYear = Math.min(365, Math.max(1, num(inputs.daysPerYear, 365)));
  const ratePerKwh = Math.max(0, num(inputs.ratePerKwh, 0.1724));
  const quantity = Math.max(1, Math.round(num(inputs.quantity, 1)));

  const dailyKwh = parseFloat(((watts * hoursPerDay) / 1000).toFixed(3));
  const annualKwh = parseFloat((dailyKwh * daysPerYear * quantity).toFixed(1));
  const monthlyCost = parseFloat(((annualKwh / 12) * ratePerKwh).toFixed(2));
  const annualCost = parseFloat((annualKwh * ratePerKwh).toFixed(2));
  const dailyCost = parseFloat((dailyKwh * ratePerKwh * quantity).toFixed(4));

  const applianceList = Object.entries(APPLIANCE_WATTAGES)
    .filter(([k]) => k !== 'custom')
    .map(([key, val]) => {
      const aKwh = (val.watts * val.typicalHours * 365) / 1000;
      return { appliance: key, watts: val.watts, annualKwh: parseFloat(aKwh.toFixed(1)), annualCost: parseFloat((aKwh * ratePerKwh).toFixed(2)) };
    })
    .sort((a, b) => b.annualCost - a.annualCost);

  return { dailyKwh, annualKwh, dailyCost, monthlyCost, annualCost, presetWatts: preset.watts, presetHours: preset.typicalHours, applianceList };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'appliance-energy-cost': calculateApplianceEnergyCost,
};
