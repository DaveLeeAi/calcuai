import { calculateHomeEnergyUsage } from '@/lib/formulas/everyday/home-energy-usage';

describe('calculateHomeEnergyUsage', () => {
  // ─── Test 1: Default US average values ───
  it('calculates correct costs at US average (886 kWh, $0.16/kWh)', () => {
    const result = calculateHomeEnergyUsage({
      monthlyKwh: 886,
      electricityRate: 0.16,
      homeSizeSqFt: 1800,
      occupants: 3,
    });
    // annualKwh = 886 × 12 = 10632
    expect(result.annualKwh).toBeCloseTo(10632, 0);
    // annualCost = 10632 × 0.16 = 1701.12
    expect(result.annualCost).toBeCloseTo(1701.12, 1);
    // monthlyCost = 1701.12 / 12 = 141.76
    expect(result.monthlyCost).toBeCloseTo(141.76, 1);
    // dailyCost = 1701.12 / 365 = 4.66
    expect(result.dailyCost).toBeCloseTo(4.66, 1);
  });

  // ─── Test 2: Zero kWh usage ───
  it('returns zero costs for zero kWh usage', () => {
    const result = calculateHomeEnergyUsage({
      monthlyKwh: 0,
      electricityRate: 0.16,
      homeSizeSqFt: 1800,
      occupants: 3,
    });
    expect(result.annualKwh).toBe(0);
    expect(result.annualCost).toBe(0);
    expect(result.monthlyCost).toBe(0);
    expect(result.dailyCost).toBe(0);
    expect(result.annualCO2Lbs).toBe(0);
    expect(result.annualCO2Tons).toBe(0);
  });

  // ─── Test 3: High usage household (2000 kWh/month) ───
  it('calculates correctly for high usage household', () => {
    const result = calculateHomeEnergyUsage({
      monthlyKwh: 2000,
      electricityRate: 0.16,
      homeSizeSqFt: 3000,
      occupants: 5,
    });
    // annualKwh = 2000 × 12 = 24000
    expect(result.annualKwh).toBeCloseTo(24000, 0);
    // annualCost = 24000 × 0.16 = 3840
    expect(result.annualCost).toBeCloseTo(3840, 1);
    // vsUSAverage = (24000 / 10500) × 100 = 228.6%
    expect(result.vsUSAverage).toBeCloseTo(228.6, 0);
    expect(result.vsUSAverageLabel).toBe('above');
  });

  // ─── Test 4: Low electricity rate ($0.08/kWh) ───
  it('reduces costs with lower electricity rate', () => {
    const result = calculateHomeEnergyUsage({
      monthlyKwh: 886,
      electricityRate: 0.08,
      homeSizeSqFt: 1800,
      occupants: 3,
    });
    // annualCost = 10632 × 0.08 = 850.56
    expect(result.annualCost).toBeCloseTo(850.56, 1);
    expect(result.monthlyCost).toBeCloseTo(70.88, 1);
  });

  // ─── Test 5: High electricity rate ($0.33/kWh — Hawaii) ───
  it('increases costs with higher electricity rate', () => {
    const result = calculateHomeEnergyUsage({
      monthlyKwh: 886,
      electricityRate: 0.33,
      homeSizeSqFt: 1800,
      occupants: 3,
    });
    // annualCost = 10632 × 0.33 = 3508.56
    expect(result.annualCost).toBeCloseTo(3508.56, 1);
    expect(result.monthlyCost).toBeCloseTo(292.38, 1);
  });

  // ─── Test 6: CO2 calculation accuracy ───
  it('calculates CO2 emissions correctly using EPA factor', () => {
    const result = calculateHomeEnergyUsage({
      monthlyKwh: 886,
      electricityRate: 0.16,
      homeSizeSqFt: 1800,
      occupants: 3,
    });
    // annualCO2Lbs = 10632 × 0.92 = 9781.44
    expect(result.annualCO2Lbs).toBeCloseTo(9781.44, 0);
    // annualCO2Tons = 9781.44 / 2000 = 4.89
    expect(result.annualCO2Tons).toBeCloseTo(4.89, 1);
  });

  // ─── Test 7: CO2 for zero usage ───
  it('returns zero CO2 for zero kWh', () => {
    const result = calculateHomeEnergyUsage({
      monthlyKwh: 0,
      electricityRate: 0.16,
    });
    expect(result.annualCO2Lbs).toBe(0);
    expect(result.annualCO2Tons).toBe(0);
  });

  // ─── Test 8: vs US average — exactly at average ───
  it('shows 100% when usage equals US average', () => {
    const result = calculateHomeEnergyUsage({
      monthlyKwh: 875, // 875 × 12 = 10500
      electricityRate: 0.16,
    });
    expect(result.vsUSAverage).toBe(100);
    expect(result.vsUSAverageLabel).toBe('at');
  });

  // ─── Test 9: vs US average — below average ───
  it('shows below when usage is under US average', () => {
    const result = calculateHomeEnergyUsage({
      monthlyKwh: 500,
      electricityRate: 0.16,
    });
    // 6000 / 10500 × 100 = 57.1%
    expect(result.vsUSAverage).toBeCloseTo(57.1, 0);
    expect(result.vsUSAverageLabel).toBe('below');
  });

  // ─── Test 10: vs US average — above average ───
  it('shows above when usage exceeds US average', () => {
    const result = calculateHomeEnergyUsage({
      monthlyKwh: 1200,
      electricityRate: 0.16,
    });
    // 14400 / 10500 × 100 = 137.1%
    expect(result.vsUSAverage).toBeCloseTo(137.1, 0);
    expect(result.vsUSAverageLabel).toBe('above');
  });

  // ─── Test 11: Solar panel estimate at US average ───
  it('estimates solar panels correctly at US average', () => {
    const result = calculateHomeEnergyUsage({
      monthlyKwh: 886,
      electricityRate: 0.16,
    });
    // annualKwh = 10632, ceil(10632 / 500) = 22
    expect(result.solarPanelsNeeded).toBe(22);
  });

  // ─── Test 12: Solar panels for low usage ───
  it('estimates fewer solar panels for low usage', () => {
    const result = calculateHomeEnergyUsage({
      monthlyKwh: 200,
      electricityRate: 0.16,
    });
    // annualKwh = 2400, ceil(2400 / 500) = 5
    expect(result.solarPanelsNeeded).toBe(5);
  });

  // ─── Test 13: Solar panels for zero usage ───
  it('estimates zero solar panels for zero usage', () => {
    const result = calculateHomeEnergyUsage({
      monthlyKwh: 0,
      electricityRate: 0.16,
    });
    expect(result.solarPanelsNeeded).toBe(0);
  });

  // ─── Test 14: Per-occupant calculation ───
  it('calculates per-occupant kWh correctly', () => {
    const result = calculateHomeEnergyUsage({
      monthlyKwh: 886,
      electricityRate: 0.16,
      occupants: 3,
    });
    // kwhPerOccupant = 10632 / 3 = 3544
    expect(result.kwhPerOccupant).toBeCloseTo(3544, 0);
  });

  // ─── Test 15: Per-occupant with 1 person ───
  it('calculates per-occupant for single-person household', () => {
    const result = calculateHomeEnergyUsage({
      monthlyKwh: 886,
      electricityRate: 0.16,
      occupants: 1,
    });
    // kwhPerOccupant = 10632 / 1 = 10632
    expect(result.kwhPerOccupant).toBeCloseTo(10632, 0);
  });

  // ─── Test 16: Per-sqft with home size ───
  it('calculates per-sqft kWh when home size provided', () => {
    const result = calculateHomeEnergyUsage({
      monthlyKwh: 886,
      electricityRate: 0.16,
      homeSizeSqFt: 1800,
    });
    // kwhPerSqFt = 10632 / 1800 = 5.91
    expect(result.kwhPerSqFt).toBeCloseTo(5.91, 1);
  });

  // ─── Test 17: Per-sqft with no home size ───
  it('returns zero kwhPerSqFt when home size is zero or omitted', () => {
    const result = calculateHomeEnergyUsage({
      monthlyKwh: 886,
      electricityRate: 0.16,
      homeSizeSqFt: 0,
    });
    expect(result.kwhPerSqFt).toBe(0);
  });

  // ─── Test 18: Cost breakdown array structure ───
  it('returns cost breakdown with three entries', () => {
    const result = calculateHomeEnergyUsage({
      monthlyKwh: 886,
      electricityRate: 0.16,
    });
    const breakdown = result.costBreakdown as { label: string; value: number }[];
    expect(breakdown).toHaveLength(3);
    expect(breakdown[0].label).toBe('Daily Cost');
    expect(breakdown[1].label).toBe('Monthly Cost');
    expect(breakdown[2].label).toBe('Annual Cost');
    expect(breakdown[0].value).toBeLessThan(breakdown[1].value);
    expect(breakdown[1].value).toBeLessThan(breakdown[2].value);
  });

  // ─── Test 19: All expected output keys present ───
  it('returns all expected output fields', () => {
    const result = calculateHomeEnergyUsage({
      monthlyKwh: 886,
      electricityRate: 0.16,
      homeSizeSqFt: 1800,
      occupants: 3,
    });
    expect(result).toHaveProperty('monthlyCost');
    expect(result).toHaveProperty('annualCost');
    expect(result).toHaveProperty('dailyCost');
    expect(result).toHaveProperty('annualKwh');
    expect(result).toHaveProperty('monthlyKwh');
    expect(result).toHaveProperty('annualCO2Lbs');
    expect(result).toHaveProperty('annualCO2Tons');
    expect(result).toHaveProperty('vsUSAverage');
    expect(result).toHaveProperty('vsUSAverageLabel');
    expect(result).toHaveProperty('kwhPerOccupant');
    expect(result).toHaveProperty('kwhPerSqFt');
    expect(result).toHaveProperty('solarPanelsNeeded');
    expect(result).toHaveProperty('costBreakdown');
  });

  // ─── Test 20: Default fallbacks when inputs omitted ───
  it('uses default values when inputs are omitted', () => {
    const result = calculateHomeEnergyUsage({});
    // defaults: monthlyKwh=886, electricityRate=0.16, occupants=3
    expect(result.monthlyKwh).toBe(886);
    expect(result.annualKwh).toBeCloseTo(10632, 0);
    expect(result.annualCost).toBeCloseTo(1701.12, 1);
    expect(result.kwhPerOccupant).toBeCloseTo(3544, 0);
    expect(result.kwhPerSqFt).toBe(0); // no home size provided
  });

  // ─── Test 21: Negative monthly kWh clamps to zero ───
  it('clamps negative kWh to zero', () => {
    const result = calculateHomeEnergyUsage({
      monthlyKwh: -500,
      electricityRate: 0.16,
    });
    expect(result.annualKwh).toBe(0);
    expect(result.annualCost).toBe(0);
  });

  // ─── Test 22: Negative rate clamps to zero ───
  it('clamps negative electricity rate to zero', () => {
    const result = calculateHomeEnergyUsage({
      monthlyKwh: 886,
      electricityRate: -0.10,
    });
    expect(result.annualCost).toBe(0);
    expect(result.monthlyCost).toBe(0);
  });

  // ─── Test 23: Very small usage (1 kWh/month) ───
  it('handles very low usage correctly', () => {
    const result = calculateHomeEnergyUsage({
      monthlyKwh: 1,
      electricityRate: 0.16,
    });
    // annualKwh = 12, annualCost = 1.92
    expect(result.annualKwh).toBe(12);
    expect(result.annualCost).toBeCloseTo(1.92, 2);
    expect(result.solarPanelsNeeded).toBe(1);
  });

  // ─── Test 24: Very high usage (5000 kWh/month — large commercial-like) ───
  it('handles very high usage correctly', () => {
    const result = calculateHomeEnergyUsage({
      monthlyKwh: 5000,
      electricityRate: 0.16,
    });
    // annualKwh = 60000, annualCost = 9600
    expect(result.annualKwh).toBe(60000);
    expect(result.annualCost).toBeCloseTo(9600, 0);
    expect(result.solarPanelsNeeded).toBe(120);
    // vsUSAverage = (60000 / 10500) × 100 = 571.4%
    expect(result.vsUSAverage).toBeCloseTo(571.4, 0);
  });

  // ─── Test 25: Occupants floor to 1 ───
  it('floors occupants to minimum of 1', () => {
    const result = calculateHomeEnergyUsage({
      monthlyKwh: 886,
      electricityRate: 0.16,
      occupants: 0,
    });
    // occupants clamped to 1, so kwhPerOccupant = annualKwh / 1
    expect(result.kwhPerOccupant).toBeCloseTo(10632, 0);
  });

  // ─── Test 26: Fractional occupants floored ───
  it('floors fractional occupants', () => {
    const result = calculateHomeEnergyUsage({
      monthlyKwh: 886,
      electricityRate: 0.16,
      occupants: 2.7,
    });
    // floor(2.7) = 2, kwhPerOccupant = 10632 / 2 = 5316
    expect(result.kwhPerOccupant).toBeCloseTo(5316, 0);
  });

  // ─── Test 27: Annual cost equals monthly × 12 ───
  it('annual cost equals monthly cost times 12 (within rounding)', () => {
    const result = calculateHomeEnergyUsage({
      monthlyKwh: 750,
      electricityRate: 0.14,
    });
    const monthly = result.monthlyCost as number;
    const annual = result.annualCost as number;
    // Allow small rounding difference due to two-step rounding
    expect(Math.abs(annual - monthly * 12)).toBeLessThan(0.02);
  });

  // ─── Test 28: Large home per-sqft calculation ───
  it('calculates per-sqft for a large home', () => {
    const result = calculateHomeEnergyUsage({
      monthlyKwh: 2000,
      electricityRate: 0.16,
      homeSizeSqFt: 4000,
    });
    // kwhPerSqFt = 24000 / 4000 = 6.0
    expect(result.kwhPerSqFt).toBeCloseTo(6.0, 1);
  });
});
