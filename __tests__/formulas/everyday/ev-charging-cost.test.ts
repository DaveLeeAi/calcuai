import { calculateEvChargingCost } from '@/lib/formulas/everyday/ev-charging-cost';

describe('calculateEvChargingCost', () => {
  // ─── Test 1: Default values produce reasonable costs ───
  it('produces reasonable costs at default values', () => {
    const result = calculateEvChargingCost({
      batteryCapacity: 75,
      currentCharge: 20,
      targetCharge: 80,
      electricityRate: 0.14,
      chargingEfficiency: 85,
      milesPerKwh: 3.5,
      weeklyMiles: 250,
      gasPrice: 3.50,
      gasMPG: 28,
    });
    expect(result.costPerCharge).toBeGreaterThan(0);
    expect(result.costPerCharge).toBeLessThan(20);
    expect(result.monthlyChargingCost).toBeGreaterThan(0);
    expect(result.monthlyChargingCost).toBeLessThan(200);
  });

  // ─── Test 2: Full charge (0% to 100%) ───
  it('calculates full charge from 0% to 100%', () => {
    const result = calculateEvChargingCost({
      batteryCapacity: 75,
      currentCharge: 0,
      targetCharge: 100,
      electricityRate: 0.14,
      chargingEfficiency: 85,
      milesPerKwh: 3.5,
      weeklyMiles: 250,
      gasPrice: 3.50,
      gasMPG: 28,
    });
    // kWhNeeded = 75, kWhFromWall = 75 / 0.85 = 88.24, cost = 88.24 × 0.14 = 12.35
    expect(result.costPerCharge).toBeCloseTo(12.35, 1);
    // milesPerCharge = 75 × 3.5 = 262.5
    expect(result.milesPerCharge).toBeCloseTo(262.5, 0);
  });

  // ─── Test 3: Small top-up (70% to 80%) ───
  it('calculates a small top-up charge', () => {
    const result = calculateEvChargingCost({
      batteryCapacity: 75,
      currentCharge: 70,
      targetCharge: 80,
      electricityRate: 0.14,
      chargingEfficiency: 85,
      milesPerKwh: 3.5,
      weeklyMiles: 250,
      gasPrice: 3.50,
      gasMPG: 28,
    });
    // kWhNeeded = 75 × 0.10 = 7.5, kWhFromWall = 7.5 / 0.85 = 8.82, cost = 8.82 × 0.14 = 1.24
    expect(result.costPerCharge).toBeCloseTo(1.24, 1);
    expect(result.milesPerCharge).toBeCloseTo(26.25, 0);
  });

  // ─── Test 4: High electricity rate ($0.30/kWh) ───
  it('increases costs with higher electricity rate', () => {
    const defaultResult = calculateEvChargingCost({
      batteryCapacity: 75,
      currentCharge: 20,
      targetCharge: 80,
      electricityRate: 0.14,
      chargingEfficiency: 85,
      milesPerKwh: 3.5,
      weeklyMiles: 250,
      gasPrice: 3.50,
      gasMPG: 28,
    });
    const highRateResult = calculateEvChargingCost({
      batteryCapacity: 75,
      currentCharge: 20,
      targetCharge: 80,
      electricityRate: 0.30,
      chargingEfficiency: 85,
      milesPerKwh: 3.5,
      weeklyMiles: 250,
      gasPrice: 3.50,
      gasMPG: 28,
    });
    expect(highRateResult.costPerCharge).toBeGreaterThan(defaultResult.costPerCharge as number);
    expect(highRateResult.monthlyChargingCost).toBeGreaterThan(defaultResult.monthlyChargingCost as number);
  });

  // ─── Test 5: Low electricity rate ($0.08/kWh) ───
  it('decreases costs with lower electricity rate', () => {
    const result = calculateEvChargingCost({
      batteryCapacity: 75,
      currentCharge: 20,
      targetCharge: 80,
      electricityRate: 0.08,
      chargingEfficiency: 85,
      milesPerKwh: 3.5,
      weeklyMiles: 250,
      gasPrice: 3.50,
      gasMPG: 28,
    });
    // kWhFromWall = 45 / 0.85 = 52.94, cost = 52.94 × 0.08 = 4.24
    expect(result.costPerCharge).toBeCloseTo(4.24, 1);
  });

  // ─── Test 6: Small battery (40 kWh — Nissan Leaf) ───
  it('calculates for small battery EV', () => {
    const result = calculateEvChargingCost({
      batteryCapacity: 40,
      currentCharge: 20,
      targetCharge: 80,
      electricityRate: 0.14,
      chargingEfficiency: 85,
      milesPerKwh: 3.5,
      weeklyMiles: 250,
      gasPrice: 3.50,
      gasMPG: 28,
    });
    // kWhNeeded = 40 × 0.60 = 24, kWhFromWall = 24/0.85 = 28.24, cost = 28.24 × 0.14 = 3.95
    expect(result.costPerCharge).toBeCloseTo(3.95, 1);
    expect(result.milesPerCharge).toBeCloseTo(84.0, 0);
  });

  // ─── Test 7: Large battery (100 kWh — Tesla Model S) ───
  it('calculates for large battery EV', () => {
    const result = calculateEvChargingCost({
      batteryCapacity: 100,
      currentCharge: 20,
      targetCharge: 80,
      electricityRate: 0.14,
      chargingEfficiency: 85,
      milesPerKwh: 3.5,
      weeklyMiles: 250,
      gasPrice: 3.50,
      gasMPG: 28,
    });
    // kWhNeeded = 100 × 0.60 = 60, kWhFromWall = 60/0.85 = 70.59, cost = 70.59 × 0.14 = 9.88
    expect(result.costPerCharge).toBeCloseTo(9.88, 1);
  });

  // ─── Test 8: High efficiency EV (4 mi/kWh) ───
  it('reduces cost per mile with higher efficiency', () => {
    const result = calculateEvChargingCost({
      batteryCapacity: 75,
      currentCharge: 20,
      targetCharge: 80,
      electricityRate: 0.14,
      chargingEfficiency: 85,
      milesPerKwh: 4.0,
      weeklyMiles: 250,
      gasPrice: 3.50,
      gasMPG: 28,
    });
    // costPerMile = 0.14 / (4.0 × 0.85) = 0.0412
    expect(result.costPerMile).toBeCloseTo(0.0412, 3);
  });

  // ─── Test 9: Low efficiency EV (2.5 mi/kWh) ───
  it('increases cost per mile with lower efficiency', () => {
    const result = calculateEvChargingCost({
      batteryCapacity: 75,
      currentCharge: 20,
      targetCharge: 80,
      electricityRate: 0.14,
      chargingEfficiency: 85,
      milesPerKwh: 2.5,
      weeklyMiles: 250,
      gasPrice: 3.50,
      gasMPG: 28,
    });
    // costPerMile = 0.14 / (2.5 × 0.85) = 0.0659
    expect(result.costPerMile).toBeCloseTo(0.0659, 3);
  });

  // ─── Test 10: Low weekly miles (50) ───
  it('produces lower monthly cost with fewer weekly miles', () => {
    const result = calculateEvChargingCost({
      batteryCapacity: 75,
      currentCharge: 20,
      targetCharge: 80,
      electricityRate: 0.14,
      chargingEfficiency: 85,
      milesPerKwh: 3.5,
      weeklyMiles: 50,
      gasPrice: 3.50,
      gasMPG: 28,
    });
    expect(result.monthlyChargingCost).toBeLessThan(20);
  });

  // ─── Test 11: High weekly miles (500) ───
  it('produces higher monthly cost with more weekly miles', () => {
    const result = calculateEvChargingCost({
      batteryCapacity: 75,
      currentCharge: 20,
      targetCharge: 80,
      electricityRate: 0.14,
      chargingEfficiency: 85,
      milesPerKwh: 3.5,
      weeklyMiles: 500,
      gasPrice: 3.50,
      gasMPG: 28,
    });
    expect(result.monthlyChargingCost).toBeGreaterThan(50);
  });

  // ─── Test 12: 100% charging efficiency ───
  it('costs less with 100% charging efficiency', () => {
    const result = calculateEvChargingCost({
      batteryCapacity: 75,
      currentCharge: 20,
      targetCharge: 80,
      electricityRate: 0.14,
      chargingEfficiency: 100,
      milesPerKwh: 3.5,
      weeklyMiles: 250,
      gasPrice: 3.50,
      gasMPG: 28,
    });
    // kWhFromWall = 45 / 1.0 = 45, cost = 45 × 0.14 = 6.30
    expect(result.costPerCharge).toBeCloseTo(6.30, 2);
  });

  // ─── Test 13: Low charging efficiency (70%) ───
  it('costs more with lower charging efficiency', () => {
    const result = calculateEvChargingCost({
      batteryCapacity: 75,
      currentCharge: 20,
      targetCharge: 80,
      electricityRate: 0.14,
      chargingEfficiency: 70,
      milesPerKwh: 3.5,
      weeklyMiles: 250,
      gasPrice: 3.50,
      gasMPG: 28,
    });
    // kWhFromWall = 45 / 0.70 = 64.29, cost = 64.29 × 0.14 = 9.00
    expect(result.costPerCharge).toBeCloseTo(9.00, 1);
  });

  // ─── Test 14: Current charge >= target charge = 0 cost ───
  it('returns zero cost per charge when current >= target', () => {
    const result = calculateEvChargingCost({
      batteryCapacity: 75,
      currentCharge: 80,
      targetCharge: 80,
      electricityRate: 0.14,
      chargingEfficiency: 85,
      milesPerKwh: 3.5,
      weeklyMiles: 250,
      gasPrice: 3.50,
      gasMPG: 28,
    });
    expect(result.costPerCharge).toBe(0);
    expect(result.milesPerCharge).toBe(0);
  });

  // ─── Test 15: EV cost per mile is less than gas at defaults ───
  it('EV costs less per mile than gas at default values', () => {
    const result = calculateEvChargingCost({
      batteryCapacity: 75,
      currentCharge: 20,
      targetCharge: 80,
      electricityRate: 0.14,
      chargingEfficiency: 85,
      milesPerKwh: 3.5,
      weeklyMiles: 250,
      gasPrice: 3.50,
      gasMPG: 28,
    });
    expect(result.costPerMile).toBeLessThan(result.gasCostPerMile as number);
  });

  // ─── Test 16: Monthly savings is positive at defaults ───
  it('shows positive monthly savings at default values', () => {
    const result = calculateEvChargingCost({
      batteryCapacity: 75,
      currentCharge: 20,
      targetCharge: 80,
      electricityRate: 0.14,
      chargingEfficiency: 85,
      milesPerKwh: 3.5,
      weeklyMiles: 250,
      gasPrice: 3.50,
      gasMPG: 28,
    });
    expect(result.monthlySavings).toBeGreaterThan(0);
    expect(result.yearlySavings).toBeGreaterThan(0);
  });

  // ─── Test 17: Zero weekly miles = zero monthly cost ───
  it('returns zero monthly cost with zero weekly miles', () => {
    const result = calculateEvChargingCost({
      batteryCapacity: 75,
      currentCharge: 20,
      targetCharge: 80,
      electricityRate: 0.14,
      chargingEfficiency: 85,
      milesPerKwh: 3.5,
      weeklyMiles: 0,
      gasPrice: 3.50,
      gasMPG: 28,
    });
    expect(result.monthlyChargingCost).toBe(0);
    expect(result.yearlyChargingCost).toBe(0);
    expect(result.monthlyGasCost).toBe(0);
  });

  // ─── Test 18: High gas price increases savings ───
  it('increases savings with higher gas price', () => {
    const defaultResult = calculateEvChargingCost({
      batteryCapacity: 75,
      currentCharge: 20,
      targetCharge: 80,
      electricityRate: 0.14,
      chargingEfficiency: 85,
      milesPerKwh: 3.5,
      weeklyMiles: 250,
      gasPrice: 3.50,
      gasMPG: 28,
    });
    const highGasResult = calculateEvChargingCost({
      batteryCapacity: 75,
      currentCharge: 20,
      targetCharge: 80,
      electricityRate: 0.14,
      chargingEfficiency: 85,
      milesPerKwh: 3.5,
      weeklyMiles: 250,
      gasPrice: 5.50,
      gasMPG: 28,
    });
    expect(highGasResult.monthlySavings).toBeGreaterThan(defaultResult.monthlySavings as number);
  });

  // ─── Test 19: Low gas MPG increases savings ───
  it('increases savings when comparing against a gas guzzler', () => {
    const defaultResult = calculateEvChargingCost({
      batteryCapacity: 75,
      currentCharge: 20,
      targetCharge: 80,
      electricityRate: 0.14,
      chargingEfficiency: 85,
      milesPerKwh: 3.5,
      weeklyMiles: 250,
      gasPrice: 3.50,
      gasMPG: 28,
    });
    const guzzlerResult = calculateEvChargingCost({
      batteryCapacity: 75,
      currentCharge: 20,
      targetCharge: 80,
      electricityRate: 0.14,
      chargingEfficiency: 85,
      milesPerKwh: 3.5,
      weeklyMiles: 250,
      gasPrice: 3.50,
      gasMPG: 15,
    });
    expect(guzzlerResult.monthlySavings).toBeGreaterThan(defaultResult.monthlySavings as number);
  });

  // ─── Test 20: Output has all expected keys ───
  it('returns all expected output fields', () => {
    const result = calculateEvChargingCost({
      batteryCapacity: 75,
      currentCharge: 20,
      targetCharge: 80,
      electricityRate: 0.14,
      chargingEfficiency: 85,
      milesPerKwh: 3.5,
      weeklyMiles: 250,
      gasPrice: 3.50,
      gasMPG: 28,
    });
    expect(result).toHaveProperty('costPerCharge');
    expect(result).toHaveProperty('costPerMile');
    expect(result).toHaveProperty('monthlyChargingCost');
    expect(result).toHaveProperty('yearlyChargingCost');
    expect(result).toHaveProperty('milesPerCharge');
    expect(result).toHaveProperty('gasCostPerMile');
    expect(result).toHaveProperty('monthlyGasCost');
    expect(result).toHaveProperty('monthlySavings');
    expect(result).toHaveProperty('yearlySavings');
  });

  // ─── Test 21: Yearly = monthly × 12 ───
  it('yearly cost equals monthly cost times 12', () => {
    const result = calculateEvChargingCost({
      batteryCapacity: 75,
      currentCharge: 20,
      targetCharge: 80,
      electricityRate: 0.14,
      chargingEfficiency: 85,
      milesPerKwh: 3.5,
      weeklyMiles: 250,
      gasPrice: 3.50,
      gasMPG: 28,
    });
    expect(result.yearlyChargingCost).toBeCloseTo(
      (result.monthlyChargingCost as number) * 12, 1
    );
    expect(result.yearlySavings).toBeCloseTo(
      (result.monthlySavings as number) * 12, 1
    );
  });

  // ─── Test 22: Cost per mile is reasonable ───
  it('cost per mile is between $0.01 and $0.20 at typical rates', () => {
    const result = calculateEvChargingCost({
      batteryCapacity: 75,
      currentCharge: 20,
      targetCharge: 80,
      electricityRate: 0.14,
      chargingEfficiency: 85,
      milesPerKwh: 3.5,
      weeklyMiles: 250,
      gasPrice: 3.50,
      gasMPG: 28,
    });
    expect(result.costPerMile).toBeGreaterThan(0.01);
    expect(result.costPerMile).toBeLessThan(0.20);
  });

  // ─── Test 23: Current charge above target charge ───
  it('returns zero cost when current charge exceeds target', () => {
    const result = calculateEvChargingCost({
      batteryCapacity: 75,
      currentCharge: 90,
      targetCharge: 80,
      electricityRate: 0.14,
      chargingEfficiency: 85,
      milesPerKwh: 3.5,
      weeklyMiles: 250,
      gasPrice: 3.50,
      gasMPG: 28,
    });
    expect(result.costPerCharge).toBe(0);
    expect(result.milesPerCharge).toBe(0);
    // Monthly costs still calculated based on weekly miles
    expect(result.monthlyChargingCost).toBeGreaterThan(0);
  });

  // ─── Test 24: Gas cost per mile calculation ───
  it('calculates gas cost per mile correctly', () => {
    const result = calculateEvChargingCost({
      batteryCapacity: 75,
      currentCharge: 20,
      targetCharge: 80,
      electricityRate: 0.14,
      chargingEfficiency: 85,
      milesPerKwh: 3.5,
      weeklyMiles: 250,
      gasPrice: 3.50,
      gasMPG: 28,
    });
    // gasCostPerMile = 3.50 / 28 = 0.125
    expect(result.gasCostPerMile).toBeCloseTo(0.125, 3);
  });
});
