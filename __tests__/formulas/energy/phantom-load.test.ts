import { calculatePhantomLoad } from '@/lib/formulas/energy/phantom-load';

describe('calculatePhantomLoad', () => {
  it('calculates cost for default device set', () => {
    const result = calculatePhantomLoad({ ratePerKwh: 0.1724 });
    expect(Number(result.totalAnnualCost)).toBeGreaterThan(0);
    expect(Number(result.deviceCount)).toBeGreaterThan(0);
  });

  it('cable box is the most expensive standby device (25W)', () => {
    const result = calculatePhantomLoad({ devices: 'cable-box', ratePerKwh: 0.16 });
    // 25W × 24 × 365 / 1000 = 219 kWh × $0.16 = $35
    expect(Number(result.totalAnnualCost)).toBeCloseTo(35, 0);
  });

  it('handles multiple devices as comma-separated string', () => {
    const result = calculatePhantomLoad({ devices: 'cable-box,smart-tv,game-console', ratePerKwh: 0.16 });
    expect(result.deviceCount).toBe(3);
    // 25 + 3 + 10 = 38W
    expect(result.totalStandbyWatts).toBe(38);
  });

  it('handles devices as array', () => {
    const result = calculatePhantomLoad({ devices: ['cable-box', 'smart-tv'], ratePerKwh: 0.16 });
    expect(result.deviceCount).toBe(2);
  });

  it('returns device breakdown with per-device costs', () => {
    const result = calculatePhantomLoad({ devices: 'cable-box,smart-tv', ratePerKwh: 0.16 });
    const breakdown = result.deviceBreakdown as { device: string; annualCost: number }[];
    expect(breakdown.length).toBe(2);
    expect(breakdown[0].device).toBe('cable-box');
    expect(breakdown[0].annualCost).toBeGreaterThan(0);
  });

  it('custom standby watts add to total', () => {
    const without = calculatePhantomLoad({ devices: 'cable-box', ratePerKwh: 0.16, customStandbyWatts: 0 });
    const withCustom = calculatePhantomLoad({ devices: 'cable-box', ratePerKwh: 0.16, customStandbyWatts: 20 });
    expect(Number(withCustom.totalStandbyWatts)).toBe(Number(without.totalStandbyWatts) + 20);
  });

  it('monthly cost = annual / 12', () => {
    const result = calculatePhantomLoad({ devices: 'cable-box,dvr,game-console', ratePerKwh: 0.16 });
    expect(Number(result.totalMonthlyCost)).toBeCloseTo(Number(result.totalAnnualCost) / 12, 0);
  });

  it('returns average US home phantom cost for context', () => {
    const result = calculatePhantomLoad({ ratePerKwh: 0.1724 });
    expect(Number(result.avgHomeCost)).toBeGreaterThan(50);
  });

  it('handles empty device list', () => {
    const result = calculatePhantomLoad({ devices: '', ratePerKwh: 0.16 });
    // Falls back to default device set
    expect(Number(result.deviceCount)).toBeGreaterThan(0);
  });

  it('ignores unknown device names', () => {
    const result = calculatePhantomLoad({ devices: 'cable-box,fake-device', ratePerKwh: 0.16 });
    expect(result.deviceCount).toBe(1);
  });

  it('handles missing inputs with defaults', () => {
    const result = calculatePhantomLoad({});
    expect(typeof result.totalAnnualCost).toBe('number');
  });
});
