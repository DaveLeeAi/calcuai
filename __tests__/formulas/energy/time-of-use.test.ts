import { calculateTimeOfUse } from '@/lib/formulas/energy/time-of-use';

describe('calculateTimeOfUse', () => {
  const defaults = { peakKwh: 10, offPeakKwh: 20, peakRate: 0.30, offPeakRate: 0.10, daysPerMonth: 30 };

  it('calculates monthly peak cost correctly', () => {
    const result = calculateTimeOfUse(defaults);
    expect(result.monthlyPeakCost).toBe(90); // 10 × 0.30 × 30
  });

  it('calculates monthly off-peak cost correctly', () => {
    const result = calculateTimeOfUse(defaults);
    expect(result.monthlyOffPeakCost).toBe(60); // 20 × 0.10 × 30
  });

  it('calculates total monthly bill as peak + off-peak', () => {
    const result = calculateTimeOfUse(defaults);
    expect(result.totalMonthlyBill).toBe(150);
  });

  it('calculates flat rate comparison bill', () => {
    const result = calculateTimeOfUse(defaults);
    const flatRate = (0.30 + 0.10) / 2;
    expect(result.flatRateBill).toBeCloseTo(30 * flatRate * 30, 0);
  });

  it('savings potential is flat rate minus TOU bill', () => {
    const result = calculateTimeOfUse(defaults);
    expect(Number(result.savingsPotential)).toBeCloseTo(Number(result.flatRateBill) - Number(result.totalMonthlyBill), 1);
  });

  it('annual bill is monthly × 12', () => {
    const result = calculateTimeOfUse(defaults);
    expect(result.annualBill).toBe(1800);
  });

  it('handles all usage in off-peak (maximum savings)', () => {
    const result = calculateTimeOfUse({ ...defaults, peakKwh: 0, offPeakKwh: 30 });
    expect(result.monthlyPeakCost).toBe(0);
    expect(Number(result.savingsPotential)).toBeGreaterThan(0);
  });

  it('handles all usage in peak (no savings from TOU)', () => {
    const result = calculateTimeOfUse({ ...defaults, peakKwh: 30, offPeakKwh: 0 });
    expect(result.monthlyOffPeakCost).toBe(0);
  });

  it('handles equal peak and off-peak rates (flat rate equivalent)', () => {
    const result = calculateTimeOfUse({ ...defaults, peakRate: 0.15, offPeakRate: 0.15 });
    expect(result.savingsPotential).toBe(0);
  });

  it('handles zero usage', () => {
    const result = calculateTimeOfUse({ peakKwh: 0, offPeakKwh: 0, peakRate: 0.30, offPeakRate: 0.10, daysPerMonth: 30 });
    expect(result.totalMonthlyBill).toBe(0);
  });

  it('handles missing inputs with defaults', () => {
    const result = calculateTimeOfUse({});
    expect(typeof result.totalMonthlyBill).toBe('number');
  });
});
