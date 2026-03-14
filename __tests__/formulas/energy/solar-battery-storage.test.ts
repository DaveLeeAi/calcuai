import { calculateSolarBatteryStorage } from '@/lib/formulas/energy/solar-battery-storage';

describe('calculateSolarBatteryStorage', () => {
  const defaults = { dailyEnergyUse: 30, solarSystemSize: 8, peakSunHours: 5, batteryDoD: 0.9, daysOfAutonomy: 1 };

  it('calculates daily solar production = kW × sun hours', () => {
    const result = calculateSolarBatteryStorage(defaults);
    expect(result.dailySolarProduction).toBe(40);
  });

  it('no storage needed when solar exceeds usage', () => {
    const result = calculateSolarBatteryStorage(defaults);
    expect(result.storageNeeded).toBe(0);
  });

  it('calculates storage needed when usage exceeds solar', () => {
    const result = calculateSolarBatteryStorage({ ...defaults, dailyEnergyUse: 50 });
    // deficit = 50 - 40 = 10 kWh, storage = 10 / 0.9 = 11.11 kWh
    expect(Number(result.storageNeeded)).toBeCloseTo(11.11, 1);
  });

  it('more days of autonomy increases storage needed', () => {
    const oneDay = calculateSolarBatteryStorage({ ...defaults, dailyEnergyUse: 50, daysOfAutonomy: 1 });
    const twoDays = calculateSolarBatteryStorage({ ...defaults, dailyEnergyUse: 50, daysOfAutonomy: 2 });
    expect(Number(twoDays.storageNeeded)).toBeGreaterThan(Number(oneDay.storageNeeded));
  });

  it('self-sufficiency is 100% when solar covers all usage', () => {
    const result = calculateSolarBatteryStorage(defaults);
    expect(result.selfSufficiency).toBe(100);
  });

  it('self-sufficiency below 100% when solar is insufficient', () => {
    const result = calculateSolarBatteryStorage({ ...defaults, solarSystemSize: 3 });
    expect(Number(result.selfSufficiency)).toBeLessThan(100);
  });

  it('recommended battery rounds up to nearest 5 kWh', () => {
    const result = calculateSolarBatteryStorage({ ...defaults, dailyEnergyUse: 50 });
    expect(Number(result.recommendedBatteryKwh) % 5).toBe(0);
  });

  it('returns pie chart data', () => {
    const result = calculateSolarBatteryStorage({ ...defaults, dailyEnergyUse: 50 });
    expect(Array.isArray(result.pieData)).toBe(true);
    expect((result.pieData as unknown[]).length).toBe(2);
  });

  it('handles zero solar system size', () => {
    const result = calculateSolarBatteryStorage({ ...defaults, solarSystemSize: 0 });
    expect(result.dailySolarProduction).toBe(0);
    expect(result.selfSufficiency).toBe(0);
  });

  it('handles missing inputs with defaults', () => {
    const result = calculateSolarBatteryStorage({});
    expect(typeof result.dailySolarProduction).toBe('number');
    expect(typeof result.storageNeeded).toBe('number');
  });

  it('lower DoD requires larger storage', () => {
    const high = calculateSolarBatteryStorage({ ...defaults, dailyEnergyUse: 50, batteryDoD: 0.9 });
    const low = calculateSolarBatteryStorage({ ...defaults, dailyEnergyUse: 50, batteryDoD: 0.5 });
    expect(Number(low.storageNeeded)).toBeGreaterThan(Number(high.storageNeeded));
  });
});
