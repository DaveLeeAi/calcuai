import { calculateElectricBill } from '@/lib/formulas/energy/electric-bill-estimator';

describe('calculateElectricBill', () => {
  it('calculates monthly bill at national average (863 kWh, $0.1724/kWh, $12 fixed)', () => {
    const result = calculateElectricBill({ monthlyKwh: 863, ratePerKwh: 0.1724, fixedCharge: 12 });
    expect(result.monthlyBill).toBeCloseTo(160.78, 0);
  });

  it('calculates annual bill as monthly × 12', () => {
    const result = calculateElectricBill({ monthlyKwh: 1000, ratePerKwh: 0.15, fixedCharge: 10 });
    const expectedMonthly = 1000 * 0.15 + 10;
    expect(result.annualBill).toBeCloseTo(expectedMonthly * 12, 1);
  });

  it('calculates daily cost as monthly / 30', () => {
    const result = calculateElectricBill({ monthlyKwh: 900, ratePerKwh: 0.20, fixedCharge: 15 });
    const expectedMonthly = 900 * 0.20 + 15;
    expect(result.dailyCost).toBeCloseTo(expectedMonthly / 30, 1);
  });

  it('handles zero kWh usage', () => {
    const result = calculateElectricBill({ monthlyKwh: 0, ratePerKwh: 0.16, fixedCharge: 12 });
    expect(result.monthlyBill).toBe(12);
  });

  it('handles zero fixed charge', () => {
    const result = calculateElectricBill({ monthlyKwh: 500, ratePerKwh: 0.10, fixedCharge: 0 });
    expect(result.monthlyBill).toBe(50);
  });

  it('calculates Hawaii high-rate scenario ($0.4162/kWh)', () => {
    const result = calculateElectricBill({ monthlyKwh: 863, ratePerKwh: 0.4162, fixedCharge: 12 });
    expect(result.monthlyBill).toBeCloseTo(371.18, 0);
  });

  it('calculates North Dakota low-rate scenario ($0.1102/kWh)', () => {
    const result = calculateElectricBill({ monthlyKwh: 863, ratePerKwh: 0.1102, fixedCharge: 8 });
    expect(result.monthlyBill).toBeCloseTo(103.10, 0);
  });

  it('handles high usage (2000 kWh) at California rate', () => {
    const result = calculateElectricBill({ monthlyKwh: 2000, ratePerKwh: 0.3471, fixedCharge: 15 });
    expect(result.monthlyBill).toBeCloseTo(709.20, 0);
  });

  it('handles missing inputs with defaults', () => {
    const result = calculateElectricBill({});
    expect(typeof result.monthlyBill).toBe('number');
    expect(Number(result.monthlyBill)).toBeGreaterThan(0);
  });

  it('returns breakdown array with 5 items', () => {
    const result = calculateElectricBill({ monthlyKwh: 500, ratePerKwh: 0.16, fixedCharge: 10 });
    expect(Array.isArray(result.breakdown)).toBe(true);
    expect((result.breakdown as unknown[]).length).toBe(5);
  });

  it('handles negative inputs by clamping to zero', () => {
    const result = calculateElectricBill({ monthlyKwh: -100, ratePerKwh: -0.10, fixedCharge: -5 });
    expect(Number(result.monthlyBill)).toBe(0);
  });

  it('handles very small usage (1 kWh)', () => {
    const result = calculateElectricBill({ monthlyKwh: 1, ratePerKwh: 0.16, fixedCharge: 0 });
    expect(result.monthlyBill).toBeCloseTo(0.16, 2);
  });
});
