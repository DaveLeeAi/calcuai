/**
 * Generator Size Calculator
 *
 * Formulas:
 *   Running Watts = Sum of all appliance running wattages
 *   Starting Watts Needed = Running Watts + Highest Single Appliance Starting Surge
 *   Recommended Generator Size = Starting Watts × 1.25 (25% headroom)
 *
 * Source: Generac — Generator Sizing Guide (2025).
 * Source: U.S. Department of Energy — Standby Generator Selection Guidelines (2025).
 */

interface ApplianceItem {
  name: string;
  runningWatts: number;
  startingSurge: number;
  quantity: number;
}

export interface GeneratorSizeInput {
  refrigerator: number;
  airConditioner: number;
  furnaceBlower: number;
  wellPump: number;
  sumpPump: number;
  lights: number;
  television: number;
  computer: number;
  microwave: number;
  otherWatts: number;
  includeStartingSurge: boolean;
}

export interface ApplianceRow {
  appliance: string;
  runningWatts: number;
  startingWatts: number;
}

export interface GeneratorSizeOutput {
  totalRunningWatts: number;
  totalStartingWatts: number;
  recommendedKw: number;
  recommendedSizeLabel: string;
  applianceBreakdown: ApplianceRow[];
  summary: { label: string; value: number }[];
}

/**
 * Calculates the required generator size based on appliance loads.
 *
 * Running Watts = Sum of all loads
 * Starting Watts = Running + highest surge
 * Recommended = Starting × 1.25 for 25% headroom
 *
 * @param inputs - Record with individual appliance wattages and flags
 * @returns Record with totalRunningWatts, totalStartingWatts, recommendedKw, applianceBreakdown, summary
 */
export function calculateGeneratorSize(inputs: Record<string, unknown>): Record<string, unknown> {
  const appliances: ApplianceItem[] = [
    { name: 'Refrigerator', runningWatts: Math.max(0, Number(inputs.refrigerator) || 0), startingSurge: 800, quantity: 1 },
    { name: 'Air Conditioner', runningWatts: Math.max(0, Number(inputs.airConditioner) || 0), startingSurge: 2200, quantity: 1 },
    { name: 'Furnace Blower', runningWatts: Math.max(0, Number(inputs.furnaceBlower) || 0), startingSurge: 1000, quantity: 1 },
    { name: 'Well Pump', runningWatts: Math.max(0, Number(inputs.wellPump) || 0), startingSurge: 2100, quantity: 1 },
    { name: 'Sump Pump', runningWatts: Math.max(0, Number(inputs.sumpPump) || 0), startingSurge: 1300, quantity: 1 },
    { name: 'Lights', runningWatts: Math.max(0, Number(inputs.lights) || 0), startingSurge: 0, quantity: 1 },
    { name: 'Television', runningWatts: Math.max(0, Number(inputs.television) || 0), startingSurge: 0, quantity: 1 },
    { name: 'Computer', runningWatts: Math.max(0, Number(inputs.computer) || 0), startingSurge: 0, quantity: 1 },
    { name: 'Microwave', runningWatts: Math.max(0, Number(inputs.microwave) || 0), startingSurge: 600, quantity: 1 },
    { name: 'Other', runningWatts: Math.max(0, Number(inputs.otherWatts) || 0), startingSurge: 0, quantity: 1 },
  ];

  const activeAppliances = appliances.filter(a => a.runningWatts > 0);

  const totalRunningWatts = activeAppliances.reduce((sum, a) => sum + a.runningWatts, 0);
  const highestSurge = activeAppliances.length > 0 ? Math.max(...activeAppliances.map(a => a.startingSurge)) : 0;
  const totalStartingWatts = totalRunningWatts + highestSurge;

  const baseWatts = inputs.includeStartingSurge !== false ? totalStartingWatts : totalRunningWatts;
  const recommendedWatts = Math.ceil(baseWatts * 1.25 / 500) * 500; // round up to nearest 500W
  const recommendedKw = parseFloat((recommendedWatts / 1000).toFixed(1));

  const sizeLabels: [number, string][] = [
    [3, '3 kW — Small portable (lights, fridge, phone chargers)'],
    [5, '5 kW — Portable (essential appliances)'],
    [7.5, '7.5 kW — Mid-range portable (most essentials + 1 AC)'],
    [10, '10 kW — Portable/standby (most home needs)'],
    [14, '14 kW — Standby (whole house, moderate load)'],
    [20, '20 kW — Whole home standby (large home)'],
    [Infinity, '22+ kW — Commercial/large estate standby'],
  ];
  const recommendedSizeLabel = sizeLabels.find(([kw]) => recommendedKw <= kw)?.[1] ?? '22+ kW — Large standby';

  const applianceBreakdown: ApplianceRow[] = activeAppliances.map(a => ({
    appliance: a.name,
    runningWatts: a.runningWatts,
    startingWatts: a.runningWatts + a.startingSurge,
  }));

  const summary: { label: string; value: number }[] = [
    { label: 'Total Running Watts', value: totalRunningWatts },
    { label: 'Total Starting Watts', value: totalStartingWatts },
    { label: 'Recommended Size (kW)', value: recommendedKw },
    { label: 'Highest Surge (W)', value: highestSurge },
  ];

  return { totalRunningWatts, totalStartingWatts, recommendedKw, recommendedSizeLabel, applianceBreakdown, summary };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'generator-size': calculateGeneratorSize,
};
