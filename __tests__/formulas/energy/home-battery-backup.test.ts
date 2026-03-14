import { calculateHomeBatteryBackup } from '@/lib/formulas/energy/home-battery-backup';

describe('calculateHomeBatteryBackup', () => {
  it('calculates capacity for 3000W load over 12 hours', () => {
    const result = calculateHomeBatteryBackup({ totalWatts: 3000, backupHours: 12, depthOfDischarge: 0.9, inverterEfficiency: 0.95 });
    // 3000 × 12 = 36000 Wh / 0.95 / 0.9 = 42105 Wh = 42.1 kWh → rounded to 45 kWh
    expect(result.recommendedKwh).toBe(45);
  });

  it('calculates capacity for small load (500W, 8 hours)', () => {
    const result = calculateHomeBatteryBackup({ totalWatts: 500, backupHours: 8, depthOfDischarge: 0.9, inverterEfficiency: 0.95 });
    expect(Number(result.totalCapacityKwh)).toBeGreaterThan(4);
    expect(Number(result.recommendedKwh)).toBeGreaterThanOrEqual(5);
  });

  it('lower DoD requires larger battery', () => {
    const high = calculateHomeBatteryBackup({ totalWatts: 2000, backupHours: 10, depthOfDischarge: 0.9, inverterEfficiency: 0.95 });
    const low = calculateHomeBatteryBackup({ totalWatts: 2000, backupHours: 10, depthOfDischarge: 0.5, inverterEfficiency: 0.95 });
    expect(Number(low.totalCapacityKwh)).toBeGreaterThan(Number(high.totalCapacityKwh));
  });

  it('lower inverter efficiency requires larger battery', () => {
    const high = calculateHomeBatteryBackup({ totalWatts: 2000, backupHours: 10, depthOfDischarge: 0.9, inverterEfficiency: 0.95 });
    const low = calculateHomeBatteryBackup({ totalWatts: 2000, backupHours: 10, depthOfDischarge: 0.9, inverterEfficiency: 0.80 });
    expect(Number(low.totalCapacityKwh)).toBeGreaterThan(Number(high.totalCapacityKwh));
  });

  it('returns estimated cost range', () => {
    const result = calculateHomeBatteryBackup({ totalWatts: 3000, backupHours: 12, depthOfDischarge: 0.9, inverterEfficiency: 0.95 });
    expect(Number(result.estimatedCostLow)).toBeGreaterThan(0);
    expect(Number(result.estimatedCostHigh)).toBeGreaterThan(Number(result.estimatedCostLow));
  });

  it('recommended kWh is rounded up to nearest 5', () => {
    const result = calculateHomeBatteryBackup({ totalWatts: 1000, backupHours: 6, depthOfDischarge: 0.9, inverterEfficiency: 0.95 });
    expect(Number(result.recommendedKwh) % 5).toBe(0);
  });

  it('handles zero watts', () => {
    const result = calculateHomeBatteryBackup({ totalWatts: 0, backupHours: 12, depthOfDischarge: 0.9, inverterEfficiency: 0.95 });
    expect(result.totalCapacityKwh).toBe(0);
  });

  it('handles 24-hour backup', () => {
    const result = calculateHomeBatteryBackup({ totalWatts: 5000, backupHours: 24, depthOfDischarge: 0.9, inverterEfficiency: 0.95 });
    expect(Number(result.totalCapacityKwh)).toBeGreaterThan(100);
  });

  it('returns breakdown array', () => {
    const result = calculateHomeBatteryBackup({ totalWatts: 3000, backupHours: 12, depthOfDischarge: 0.9, inverterEfficiency: 0.95 });
    expect(Array.isArray(result.breakdown)).toBe(true);
    expect((result.breakdown as unknown[]).length).toBe(6);
  });

  it('handles missing inputs with defaults', () => {
    const result = calculateHomeBatteryBackup({});
    expect(typeof result.totalCapacityKwh).toBe('number');
    expect(Number(result.recommendedKwh)).toBeGreaterThan(0);
  });
});
