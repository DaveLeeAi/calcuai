/**
 * Phantom Load / Energy Vampire Calculator
 *
 * Calculates annual cost of standby power draw from devices that consume
 * electricity while "off" or in standby mode.
 *
 * Formula: Annual cost = (standby watts × 24 × 365) / 1000 × rate
 *
 * Source: Lawrence Berkeley National Laboratory — Standby Power Summary (2024);
 *         NRDC — Home Idle Load Study (2023).
 */

const DEVICE_STANDBY_WATTS: Record<string, number> = {
  'cable-box':        25,
  'dvr':              30,
  'game-console':     10,
  'smart-tv':         3,
  'older-tv':         12,
  'computer-desktop': 8,
  'computer-monitor': 3,
  'laptop-charger':   4,
  'phone-charger':    2,
  'microwave':        3,
  'coffee-maker':     2,
  'printer':          5,
  'smart-speaker':    3,
  'wifi-router':      6,
  'cable-modem':      5,
  'soundbar':         5,
  'garage-door':      4,
  'washer':           3,
  'dryer':            3,
  'dishwasher':       2,
};

export function calculatePhantomLoad(inputs: Record<string, unknown>): Record<string, unknown> {
  const num = (v: unknown, d: number) => v !== undefined && v !== null && v !== '' ? Number(v) : d;
  const ratePerKwh = Math.max(0, num(inputs.ratePerKwh, 0.1724));

  // Parse selected devices — expect a comma-separated string or array
  let selectedDevices: string[] = [];
  if (Array.isArray(inputs.devices)) {
    selectedDevices = inputs.devices.map(String);
  } else if (typeof inputs.devices === 'string' && inputs.devices) {
    selectedDevices = inputs.devices.split(',').map((s: string) => s.trim());
  } else {
    // Default: typical living room + office
    selectedDevices = ['cable-box', 'smart-tv', 'game-console', 'computer-desktop', 'computer-monitor', 'phone-charger', 'wifi-router', 'microwave'];
  }

  const customStandbyWatts = Math.max(0, num(inputs.customStandbyWatts, 0));

  const deviceBreakdown = selectedDevices
    .filter(d => DEVICE_STANDBY_WATTS[d] !== undefined)
    .map(d => {
      const watts = DEVICE_STANDBY_WATTS[d];
      const annualKwh = parseFloat(((watts * 24 * 365) / 1000).toFixed(1));
      const annualCost = parseFloat((annualKwh * ratePerKwh).toFixed(2));
      return { device: d, standbyWatts: watts, annualKwh, annualCost };
    });

  const totalStandbyWatts = deviceBreakdown.reduce((s, d) => s + d.standbyWatts, 0) + customStandbyWatts;
  const totalAnnualKwh = parseFloat(((totalStandbyWatts * 24 * 365) / 1000).toFixed(1));
  const totalAnnualCost = parseFloat((totalAnnualKwh * ratePerKwh).toFixed(2));
  const totalMonthlyCost = parseFloat((totalAnnualCost / 12).toFixed(2));

  // Context: average US home phantom load
  const avgHomePhantomWatts = 50; // LBNL estimate
  const avgHomeCost = parseFloat(((avgHomePhantomWatts * 24 * 365 / 1000) * ratePerKwh).toFixed(2));

  return {
    totalStandbyWatts,
    totalAnnualKwh,
    totalAnnualCost,
    totalMonthlyCost,
    deviceBreakdown,
    avgHomeCost,
    deviceCount: deviceBreakdown.length,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'phantom-load': calculatePhantomLoad,
};
