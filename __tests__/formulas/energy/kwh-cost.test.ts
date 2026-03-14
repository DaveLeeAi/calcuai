import { calculateKwhCost } from '@/lib/formulas/energy/kwh-cost';

describe('calculateKwhCost', () => {
  it('calculates daily kWh for a 1500W device running 4 hours', () => {
    const result = calculateKwhCost({ watts: 1500, hoursPerDay: 4, ratePerKwh: 0.16, daysPerMonth: 30 });
    expect(result.dailyKwh).toBe(6);
  });

  it('calculates monthly kWh correctly', () => {
    const result = calculateKwhCost({ watts: 1000, hoursPerDay: 8, ratePerKwh: 0.16, daysPerMonth: 30 });
    expect(result.monthlyKwh).toBe(240);
  });

  it('calculates annual kWh as dailyKwh × 365', () => {
    const result = calculateKwhCost({ watts: 100, hoursPerDay: 10, ratePerKwh: 0.16, daysPerMonth: 30 });
    expect(Number(result.annualKwh)).toBeCloseTo(1 * 365, 1);
  });

  it('calculates monthly cost correctly', () => {
    const result = calculateKwhCost({ watts: 1000, hoursPerDay: 8, ratePerKwh: 0.20, daysPerMonth: 30 });
    expect(Number(result.monthlyCost)).toBeCloseTo(240 * 0.20, 2);
  });

  it('calculates annual cost correctly', () => {
    const result = calculateKwhCost({ watts: 1000, hoursPerDay: 24, ratePerKwh: 0.12, daysPerMonth: 30 });
    const annualKwh = 24 * 365;
    expect(Number(result.annualCost)).toBeCloseTo(annualKwh * 0.12, 1);
  });

  it('handles 60W LED bulb running 5 hours at $0.15/kWh', () => {
    const result = calculateKwhCost({ watts: 60, hoursPerDay: 5, ratePerKwh: 0.15, daysPerMonth: 30 });
    const expectedDaily = (60 / 1000) * 5;
    expect(Number(result.dailyKwh)).toBeCloseTo(expectedDaily, 3);
    expect(Number(result.dailyCost)).toBeCloseTo(expectedDaily * 0.15, 4);
  });

  it('handles zero watts', () => {
    const result = calculateKwhCost({ watts: 0, hoursPerDay: 8, ratePerKwh: 0.16, daysPerMonth: 30 });
    expect(result.dailyKwh).toBe(0);
    expect(result.monthlyCost).toBe(0);
    expect(result.annualCost).toBe(0);
  });

  it('handles zero hours per day', () => {
    const result = calculateKwhCost({ watts: 1000, hoursPerDay: 0, ratePerKwh: 0.16, daysPerMonth: 30 });
    expect(result.dailyKwh).toBe(0);
  });

  it('caps hours at 24', () => {
    const result = calculateKwhCost({ watts: 1000, hoursPerDay: 48, ratePerKwh: 0.16, daysPerMonth: 30 });
    expect(result.dailyKwh).toBe(24);
  });

  it('returns summary array with 7 items', () => {
    const result = calculateKwhCost({ watts: 500, hoursPerDay: 6, ratePerKwh: 0.16, daysPerMonth: 30 });
    expect(Array.isArray(result.summary)).toBe(true);
    expect((result.summary as unknown[]).length).toBe(7);
  });

  it('handles missing inputs gracefully', () => {
    const result = calculateKwhCost({});
    expect(typeof result.dailyKwh).toBe('number');
    expect(typeof result.annualCost).toBe('number');
  });
});
