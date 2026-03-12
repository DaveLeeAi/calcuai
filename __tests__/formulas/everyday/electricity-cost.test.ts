import { calculateElectricityCost } from '@/lib/formulas/everyday/electricity-cost';

describe('calculateElectricityCost', () => {
  // ─── Test 1: Space heater baseline ───
  it('calculates 1000W for 8 hours at $0.16/kWh = $1.28/day', () => {
    const result = calculateElectricityCost({
      watts: 1000,
      hoursPerDay: 8,
      ratePerKWh: 0.16,
      daysPerMonth: 30,
    });
    expect(result.dailyKWh).toBe(8);
    expect(result.dailyCost).toBeCloseTo(1.28, 2);
    expect(result.monthlyCost).toBeCloseTo(38.40, 2);
    expect(result.yearlyCost).toBeCloseTo(467.20, 2);
  });

  // ─── Test 2: LED light bulb ───
  it('calculates 10W LED for 5 hours', () => {
    const result = calculateElectricityCost({
      watts: 10,
      hoursPerDay: 5,
      ratePerKWh: 0.16,
      daysPerMonth: 30,
    });
    expect(result.dailyKWh).toBe(0.05);
    expect(result.dailyCost).toBeCloseTo(0.008, 3);
    expect(result.monthlyCost).toBeCloseTo(0.24, 2);
  });

  // ─── Test 3: High wattage appliance ───
  it('calculates 1500W space heater 12 hours/day', () => {
    const result = calculateElectricityCost({
      watts: 1500,
      hoursPerDay: 12,
      ratePerKWh: 0.18,
      daysPerMonth: 30,
    });
    expect(result.dailyKWh).toBe(18);
    expect(result.dailyCost).toBeCloseTo(3.24, 2);
    expect(result.monthlyCost).toBeCloseTo(97.20, 2);
  });

  // ─── Test 4: Zero watts ───
  it('returns zero costs for 0 watts', () => {
    const result = calculateElectricityCost({
      watts: 0,
      hoursPerDay: 24,
      ratePerKWh: 0.16,
    });
    expect(result.dailyKWh).toBe(0);
    expect(result.dailyCost).toBe(0);
    expect(result.monthlyCost).toBe(0);
    expect(result.yearlyCost).toBe(0);
  });

  // ─── Test 5: Zero hours ───
  it('returns zero costs for 0 hours', () => {
    const result = calculateElectricityCost({
      watts: 1000,
      hoursPerDay: 0,
      ratePerKWh: 0.16,
    });
    expect(result.dailyKWh).toBe(0);
    expect(result.dailyCost).toBe(0);
  });

  // ─── Test 6: 24 hours (always on) ───
  it('calculates 24/7 refrigerator (~150W)', () => {
    const result = calculateElectricityCost({
      watts: 150,
      hoursPerDay: 24,
      ratePerKWh: 0.16,
      daysPerMonth: 30,
    });
    expect(result.dailyKWh).toBe(3.6);
    expect(result.yearlyCost).toBeCloseTo(210.24, 2);
  });

  // ─── Test 7: High electricity rate ───
  it('calculates with high rate ($0.36/kWh Hawaii)', () => {
    const result = calculateElectricityCost({
      watts: 1000,
      hoursPerDay: 8,
      ratePerKWh: 0.36,
      daysPerMonth: 30,
    });
    expect(result.dailyCost).toBeCloseTo(2.88, 2);
    expect(result.monthlyCost).toBeCloseTo(86.40, 2);
  });

  // ─── Test 8: Low electricity rate ───
  it('calculates with low rate ($0.10/kWh Idaho)', () => {
    const result = calculateElectricityCost({
      watts: 1000,
      hoursPerDay: 8,
      ratePerKWh: 0.10,
      daysPerMonth: 30,
    });
    expect(result.dailyCost).toBeCloseTo(0.80, 2);
    expect(result.monthlyCost).toBeCloseTo(24.00, 2);
  });

  // ─── Test 9: Cost per hour ───
  it('returns correct cost per hour of operation', () => {
    const result = calculateElectricityCost({
      watts: 500,
      hoursPerDay: 4,
      ratePerKWh: 0.16,
    });
    // costPerHour = (500/1000) * 0.16 = 0.08
    expect(result.costPerHour).toBeCloseTo(0.08, 4);
  });

  // ─── Test 10: Custom days per month ───
  it('uses custom days per month for seasonal appliances', () => {
    const result = calculateElectricityCost({
      watts: 1200,
      hoursPerDay: 10,
      ratePerKWh: 0.18,
      daysPerMonth: 25,
    });
    expect(result.daysPerMonth).toBe(25);
    // monthlyKWh = 12 * 25 = 300
    expect(result.monthlyKWh).toBe(300);
    expect(result.monthlyCost).toBeCloseTo(54, 0);
  });

  // ─── Test 11: Gaming PC example ───
  it('calculates gaming PC at 450W for 4 hours at $0.14/kWh', () => {
    const result = calculateElectricityCost({
      watts: 450,
      hoursPerDay: 4,
      ratePerKWh: 0.14,
      daysPerMonth: 30,
    });
    expect(result.dailyKWh).toBe(1.8);
    expect(result.dailyCost).toBeCloseTo(0.252, 3);
    expect(result.monthlyCost).toBeCloseTo(7.56, 2);
    expect(result.yearlyCost).toBeCloseTo(91.98, 2);
  });

  // ─── Test 12: Default rate and days ───
  it('uses default rate 0.16 and 30 days when not specified', () => {
    const result = calculateElectricityCost({
      watts: 1000,
      hoursPerDay: 1,
    });
    expect(result.ratePerKWh).toBe(0.16);
    expect(result.daysPerMonth).toBe(30);
    expect(result.dailyKWh).toBe(1);
    expect(result.dailyCost).toBeCloseTo(0.16, 2);
  });

  // ─── Test 13: Yearly uses 365 days regardless of monthly setting ───
  it('yearly cost uses 365 days, not daysPerMonth * 12', () => {
    const result = calculateElectricityCost({
      watts: 1000,
      hoursPerDay: 1,
      ratePerKWh: 1.00, // $1/kWh for easy math
      daysPerMonth: 28,
    });
    // daily = 1 kWh, monthly = 28, yearly = 365
    expect(result.monthlyKWh).toBe(28);
    expect(result.yearlyCost).toBe(365);
  });
});
