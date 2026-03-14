/**
 * Home Battery Backup Calculator
 *
 * Formulas:
 *   Total watts = sum of all selected appliance wattages
 *   Required Wh = total watts × backup hours
 *   Battery capacity (kWh) = required Wh / (DoD × inverter efficiency) / 1000
 *   Estimated cost = capacity × cost per kWh ($500–$800 avg)
 *
 * Source: NREL — Residential Battery Storage Technology Overview (2025).
 */

export function calculateHomeBatteryBackup(inputs: Record<string, unknown>): Record<string, unknown> {
  const num = (v: unknown, d: number) => v !== undefined && v !== null && v !== '' ? Number(v) : d;
  const totalWatts = Math.max(0, num(inputs.totalWatts, 3000));
  const backupHours = Math.max(1, num(inputs.backupHours, 12));
  const depthOfDischarge = Math.min(1, Math.max(0.1, num(inputs.depthOfDischarge, 0.9)));
  const inverterEfficiency = Math.min(1, Math.max(0.1, num(inputs.inverterEfficiency, 0.95)));

  const requiredWh = totalWatts * backupHours;
  const usableCapacityWh = requiredWh / inverterEfficiency;
  const totalCapacityWh = usableCapacityWh / depthOfDischarge;
  const totalCapacityKwh = parseFloat((totalCapacityWh / 1000).toFixed(2));
  const recommendedKwh = parseFloat((Math.ceil(totalCapacityKwh / 5) * 5).toFixed(2)); // round up to nearest 5 kWh
  const estimatedCostLow = parseFloat((recommendedKwh * 500).toFixed(2));
  const estimatedCostHigh = parseFloat((recommendedKwh * 800).toFixed(2));

  const breakdown: { label: string; value: number | string }[] = [
    { label: 'Total Load (Watts)', value: totalWatts },
    { label: 'Backup Duration (Hours)', value: backupHours },
    { label: 'Raw Energy Needed (kWh)', value: parseFloat((requiredWh / 1000).toFixed(2)) },
    { label: 'With Efficiency Losses (kWh)', value: totalCapacityKwh },
    { label: 'Recommended Battery Size (kWh)', value: recommendedKwh },
    { label: 'Estimated Cost Range', value: `$${estimatedCostLow.toLocaleString()}–$${estimatedCostHigh.toLocaleString()}` },
  ];

  return {
    totalWatts,
    totalCapacityKwh,
    recommendedKwh,
    estimatedCostLow,
    estimatedCostHigh,
    breakdown,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'home-battery-backup': calculateHomeBatteryBackup,
};
