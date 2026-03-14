/**
 * Weatherization Payback Calculator
 *
 * Estimates savings from low-cost weatherization improvements:
 * caulking, weatherstripping, door sweeps, outlet gaskets, attic hatch seal.
 *
 * Formula: Annual savings = annual_heating_cooling_cost × reduction_pct
 *          Payback = project_cost / annual_savings
 *
 * Source: U.S. DOE — Weatherization Assistance Program Technical Memorandum (2024);
 *         ENERGY STAR — Seal and Insulate Guide (2025).
 */

const WEATHERIZATION_ITEMS: Record<string, { label: string; savingsPct: number; avgCostLow: number; avgCostHigh: number }> = {
  'caulking-windows':     { label: 'Caulk Windows & Trim',    savingsPct: 0.05, avgCostLow: 20,  avgCostHigh: 80   },
  'weatherstrip-doors':   { label: 'Weatherstrip Doors',       savingsPct: 0.03, avgCostLow: 15,  avgCostHigh: 50   },
  'door-sweeps':          { label: 'Door Sweeps',              savingsPct: 0.02, avgCostLow: 10,  avgCostHigh: 30   },
  'outlet-gaskets':       { label: 'Outlet/Switch Gaskets',    savingsPct: 0.01, avgCostLow: 5,   avgCostHigh: 15   },
  'attic-hatch-seal':     { label: 'Seal Attic Hatch',         savingsPct: 0.03, avgCostLow: 10,  avgCostHigh: 40   },
  'rim-joist-foam':       { label: 'Rim Joist Foam Board',     savingsPct: 0.04, avgCostLow: 50,  avgCostHigh: 200  },
  'pipe-insulation':      { label: 'Pipe Insulation',          savingsPct: 0.02, avgCostLow: 15,  avgCostHigh: 50   },
  'window-film':          { label: 'Window Insulation Film',   savingsPct: 0.04, avgCostLow: 30,  avgCostHigh: 80   },
  'fireplace-damper':     { label: 'Fireplace Damper Seal',    savingsPct: 0.03, avgCostLow: 30,  avgCostHigh: 100  },
  'recessed-light-covers':{ label: 'Recessed Light Covers',    savingsPct: 0.02, avgCostLow: 20,  avgCostHigh: 60   },
};

export function calculateWeatherizationPayback(inputs: Record<string, unknown>): Record<string, unknown> {
  const num = (v: unknown, d: number) => v !== undefined && v !== null && v !== '' ? Number(v) : d;
  const annualHeatingCoolingCost = Math.max(0, num(inputs.annualHeatingCoolingCost, 2000));

  let selected: string[] = [];
  if (Array.isArray(inputs.items)) {
    selected = inputs.items.map(String);
  } else if (typeof inputs.items === 'string' && inputs.items) {
    selected = inputs.items.split(',').map((s: string) => s.trim());
  } else {
    selected = ['caulking-windows', 'weatherstrip-doors', 'door-sweeps', 'outlet-gaskets', 'attic-hatch-seal'];
  }

  let totalSavingsPct = 0;
  let totalCostLow = 0;
  let totalCostHigh = 0;

  const breakdown = selected
    .filter(id => WEATHERIZATION_ITEMS[id])
    .map(id => {
      const item = WEATHERIZATION_ITEMS[id];
      totalSavingsPct += item.savingsPct;
      totalCostLow += item.avgCostLow;
      totalCostHigh += item.avgCostHigh;
      const savings = parseFloat((annualHeatingCoolingCost * item.savingsPct).toFixed(2));
      return { id, label: item.label, savingsPct: item.savingsPct * 100, costLow: item.avgCostLow, costHigh: item.avgCostHigh, annualSavings: savings };
    });

  // Cap combined savings at 25%
  const effectivePct = Math.min(totalSavingsPct, 0.25);
  const annualSavings = parseFloat((annualHeatingCoolingCost * effectivePct).toFixed(2));
  const projectCostMid = parseFloat(((totalCostLow + totalCostHigh) / 2).toFixed(2));
  const paybackYears = annualSavings > 0
    ? parseFloat((projectCostMid / annualSavings).toFixed(1))
    : -1;
  const fiveYearNet = parseFloat((annualSavings * 5 - projectCostMid).toFixed(2));
  const tenYearNet = parseFloat((annualSavings * 10 - projectCostMid).toFixed(2));

  return {
    annualSavings,
    totalCostLow,
    totalCostHigh,
    projectCostMid,
    paybackYears,
    fiveYearNet,
    tenYearNet,
    effectiveSavingsPct: parseFloat((effectivePct * 100).toFixed(1)),
    breakdown,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'weatherization-payback': calculateWeatherizationPayback,
};
