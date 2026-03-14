/**
 * Solar Battery Storage Calculator
 *
 * Formulas:
 *   Daily solar production = system size (kW) × peak sun hours
 *   Net daily deficit = daily use - solar production (if positive)
 *   Storage needed = deficit × days of autonomy / DoD
 *   Self-sufficiency % = min(100, (solar production / daily use) × 100)
 *
 * Source: NREL — PVWatts Methodology (2025); EnergySage Battery Storage Guide (2026).
 */

export function calculateSolarBatteryStorage(inputs: Record<string, unknown>): Record<string, unknown> {
  const num = (v: unknown, d: number) => v !== undefined && v !== null && v !== '' ? Number(v) : d;
  const dailyEnergyUse = Math.max(0.01, num(inputs.dailyEnergyUse, 30));
  const solarSystemSize = Math.max(0, num(inputs.solarSystemSize, 8));
  const peakSunHours = Math.max(0.5, num(inputs.peakSunHours, 5));
  const batteryDoD = Math.min(1, Math.max(0.1, num(inputs.batteryDoD, 0.9)));
  const daysOfAutonomy = Math.max(0.5, num(inputs.daysOfAutonomy, 1));

  const dailySolarProduction = parseFloat((solarSystemSize * peakSunHours).toFixed(2));
  const dailyDeficit = Math.max(0, dailyEnergyUse - dailySolarProduction);
  const storageNeeded = parseFloat((dailyDeficit * daysOfAutonomy / batteryDoD).toFixed(2));
  const recommendedBatteryKwh = parseFloat((Math.ceil(storageNeeded / 5) * 5).toFixed(2));
  const selfSufficiency = parseFloat((Math.min(100, (dailySolarProduction / dailyEnergyUse) * 100)).toFixed(1));

  const pieData = [
    { label: 'Solar Production', value: Math.min(dailySolarProduction, dailyEnergyUse) },
    { label: 'Grid Needed', value: dailyDeficit },
  ];

  return {
    dailySolarProduction,
    storageNeeded,
    recommendedBatteryKwh,
    selfSufficiency,
    dailyDeficit,
    pieData,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'solar-battery-storage': calculateSolarBatteryStorage,
};
