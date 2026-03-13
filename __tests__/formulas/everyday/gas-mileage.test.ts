import { calculateGasMileage } from '@/lib/formulas/everyday/gas-mileage';

describe('calculateGasMileage', () => {
  // ─── Test 1: Standard MPG calculation ───
  it('calculates 300 miles on 10 gallons = 30 MPG', () => {
    const result = calculateGasMileage({
      distanceDriven: 300,
      distanceUnit: 'miles',
      fuelUsed: 10,
      fuelUnit: 'gallons',
      fuelPrice: 3.50,
    });
    expect(result.mpg).toBe(30);
    expect(result.mpgUS).toBe(30);
  });

  // ─── Test 2: Metric input (km/liters) ───
  it('calculates km/liters input correctly', () => {
    const result = calculateGasMileage({
      distanceDriven: 500,
      distanceUnit: 'km',
      fuelUsed: 40,
      fuelUnit: 'liters',
      fuelPrice: 1.50,
    });
    // 500 km / 40 liters = 12.5 kpl
    expect(result.kpl).toBe(12.5);
    // L/100km = (40/500)*100 = 8.0
    expect(result.lper100km).toBe(8.0);
  });

  // ─── Test 3: High efficiency vehicle (50 MPG) ───
  it('rates 50 MPG as Excellent', () => {
    const result = calculateGasMileage({
      distanceDriven: 500,
      distanceUnit: 'miles',
      fuelUsed: 10,
      fuelUnit: 'gallons',
      fuelPrice: 3.50,
    });
    expect(result.mpg).toBe(50);
    expect(result.fuelEfficiencyRating).toBe('Excellent');
  });

  // ─── Test 4: Low efficiency vehicle (12 MPG) ───
  it('rates 12 MPG as Poor', () => {
    const result = calculateGasMileage({
      distanceDriven: 120,
      distanceUnit: 'miles',
      fuelUsed: 10,
      fuelUnit: 'gallons',
      fuelPrice: 3.50,
    });
    expect(result.mpg).toBe(12);
    expect(result.fuelEfficiencyRating).toBe('Poor — consider a more fuel-efficient vehicle');
  });

  // ─── Test 5: Zero fuel used (handle gracefully) ───
  it('caps efficiency at 999 when zero fuel used with positive distance', () => {
    const result = calculateGasMileage({
      distanceDriven: 100,
      distanceUnit: 'miles',
      fuelUsed: 0,
      fuelUnit: 'gallons',
      fuelPrice: 3.50,
    });
    expect(result.mpg).toBe(999);
    expect(result.mpgUS).toBe(999);
  });

  // ─── Test 6: Zero distance ───
  it('returns 0 MPG for zero distance', () => {
    const result = calculateGasMileage({
      distanceDriven: 0,
      distanceUnit: 'miles',
      fuelUsed: 10,
      fuelUnit: 'gallons',
      fuelPrice: 3.50,
    });
    expect(result.mpg).toBe(0);
    expect(result.mpgUS).toBe(0);
    expect(result.costPerMile).toBe(0);
  });

  // ─── Test 7: Metric conversion accuracy ───
  it('converts metric input to correct US MPG', () => {
    const result = calculateGasMileage({
      distanceDriven: 482.803, // ~300 miles in km
      distanceUnit: 'km',
      fuelUsed: 37.8541, // ~10 gallons in liters
      fuelUnit: 'liters',
      fuelPrice: 1.00,
    });
    // Should be approximately 30 US MPG
    expect(result.mpgUS).toBeCloseTo(30, 0);
  });

  // ─── Test 8: Cost per mile ───
  it('calculates cost per mile correctly', () => {
    const result = calculateGasMileage({
      distanceDriven: 300,
      distanceUnit: 'miles',
      fuelUsed: 10,
      fuelUnit: 'gallons',
      fuelPrice: 3.50,
    });
    // costPerMile = 3.50 / 30 = 0.1167
    expect(result.costPerMile).toBeCloseTo(0.117, 3);
  });

  // ─── Test 9: Annual fuel cost ───
  it('calculates annual fuel cost based on 12,000 miles', () => {
    const result = calculateGasMileage({
      distanceDriven: 300,
      distanceUnit: 'miles',
      fuelUsed: 10,
      fuelUnit: 'gallons',
      fuelPrice: 3.50,
    });
    // costPerMile ~= 0.1167, annual = 0.1167 * 12000 = ~1400
    expect(result.annualFuelCost).toBeCloseTo(1400, 0);
  });

  // ─── Test 10: Monthly fuel cost ───
  it('calculates monthly fuel cost as annual / 12', () => {
    const result = calculateGasMileage({
      distanceDriven: 300,
      distanceUnit: 'miles',
      fuelUsed: 10,
      fuelUnit: 'gallons',
      fuelPrice: 3.50,
    });
    expect(result.monthlyFuelCost).toBeCloseTo((result.annualFuelCost as number) / 12, 2);
  });

  // ─── Test 11: CO2 emissions (gallons) ───
  it('calculates CO2 emissions at 19.6 lbs per gallon', () => {
    const result = calculateGasMileage({
      distanceDriven: 300,
      distanceUnit: 'miles',
      fuelUsed: 10,
      fuelUnit: 'gallons',
      fuelPrice: 3.50,
    });
    // 10 gallons × 19.6 lbs/gallon = 196 lbs
    expect(result.co2Emissions).toBe(196);
  });

  // ─── Test 12: Efficiency rating thresholds ───
  it('returns correct efficiency ratings at threshold boundaries', () => {
    // 14 MPG → Poor
    let result = calculateGasMileage({
      distanceDriven: 140, distanceUnit: 'miles',
      fuelUsed: 10, fuelUnit: 'gallons', fuelPrice: 3.00,
    });
    expect(result.fuelEfficiencyRating).toBe('Poor — consider a more fuel-efficient vehicle');

    // 20 MPG → Below Average
    result = calculateGasMileage({
      distanceDriven: 200, distanceUnit: 'miles',
      fuelUsed: 10, fuelUnit: 'gallons', fuelPrice: 3.00,
    });
    expect(result.fuelEfficiencyRating).toBe('Below Average');

    // 30 MPG → Average
    result = calculateGasMileage({
      distanceDriven: 300, distanceUnit: 'miles',
      fuelUsed: 10, fuelUnit: 'gallons', fuelPrice: 3.00,
    });
    expect(result.fuelEfficiencyRating).toBe('Average');

    // 40 MPG → Good
    result = calculateGasMileage({
      distanceDriven: 400, distanceUnit: 'miles',
      fuelUsed: 10, fuelUnit: 'gallons', fuelPrice: 3.00,
    });
    expect(result.fuelEfficiencyRating).toBe('Good');

    // 55 MPG → Excellent
    result = calculateGasMileage({
      distanceDriven: 550, distanceUnit: 'miles',
      fuelUsed: 10, fuelUnit: 'gallons', fuelPrice: 3.00,
    });
    expect(result.fuelEfficiencyRating).toBe('Excellent');
  });

  // ─── Test 13: UK MPG conversion ───
  it('converts US MPG to UK MPG with 1.20095 factor', () => {
    const result = calculateGasMileage({
      distanceDriven: 300,
      distanceUnit: 'miles',
      fuelUsed: 10,
      fuelUnit: 'gallons',
      fuelPrice: 3.50,
    });
    // 30 US MPG × 1.20095 = 36.0285 UK MPG
    expect(result.mpgUK).toBeCloseTo(36.03, 1);
  });

  // ─── Test 14: L/100km calculation ───
  it('calculates L/100km from US inputs correctly', () => {
    const result = calculateGasMileage({
      distanceDriven: 300,
      distanceUnit: 'miles',
      fuelUsed: 10,
      fuelUnit: 'gallons',
      fuelPrice: 3.50,
    });
    // 30 MPG → 235.215 / 30 = 7.84 L/100km
    expect(result.lper100km).toBeCloseTo(7.8, 0);
  });

  // ─── Test 15: Cost breakdown structure ───
  it('returns a cost breakdown value-group with all fields', () => {
    const result = calculateGasMileage({
      distanceDriven: 300,
      distanceUnit: 'miles',
      fuelUsed: 10,
      fuelUnit: 'gallons',
      fuelPrice: 3.50,
    });
    const breakdown = result.costBreakdown as { label: string; items: { label: string; value: string }[] };
    expect(breakdown.label).toBe('Cost Breakdown');
    expect(breakdown.items).toHaveLength(4);
    expect(breakdown.items[0].label).toBe('Cost Per Mile');
    expect(breakdown.items[1].label).toBe('Cost Per 100 Miles');
    expect(breakdown.items[2].label).toBe('Monthly Fuel Cost');
    expect(breakdown.items[3].label).toContain('Annual Fuel Cost');
  });

  // ─── Test 16: Output structure completeness ───
  it('returns all expected output fields', () => {
    const result = calculateGasMileage({
      distanceDriven: 300,
      distanceUnit: 'miles',
      fuelUsed: 10,
      fuelUnit: 'gallons',
      fuelPrice: 3.50,
    });
    expect(result).toHaveProperty('mpg');
    expect(result).toHaveProperty('kpl');
    expect(result).toHaveProperty('lper100km');
    expect(result).toHaveProperty('mpgUS');
    expect(result).toHaveProperty('mpgUK');
    expect(result).toHaveProperty('costPerMile');
    expect(result).toHaveProperty('costPerKm');
    expect(result).toHaveProperty('costPer100Miles');
    expect(result).toHaveProperty('annualFuelCost');
    expect(result).toHaveProperty('monthlyFuelCost');
    expect(result).toHaveProperty('co2Emissions');
    expect(result).toHaveProperty('fuelEfficiencyRating');
    expect(result).toHaveProperty('costBreakdown');
  });

  // ─── Test 17: Zero fuel price → costs are 0 ───
  it('returns zero costs when fuel price is zero', () => {
    const result = calculateGasMileage({
      distanceDriven: 300,
      distanceUnit: 'miles',
      fuelUsed: 10,
      fuelUnit: 'gallons',
      fuelPrice: 0,
    });
    expect(result.costPerMile).toBe(0);
    expect(result.annualFuelCost).toBe(0);
    expect(result.monthlyFuelCost).toBe(0);
    // MPG should still be calculated
    expect(result.mpg).toBe(30);
  });

  // ─── Test 18: Cost per 100 miles ───
  it('calculates cost per 100 miles correctly', () => {
    const result = calculateGasMileage({
      distanceDriven: 300,
      distanceUnit: 'miles',
      fuelUsed: 10,
      fuelUnit: 'gallons',
      fuelPrice: 3.50,
    });
    // costPerMile ~= 0.1167, × 100 = ~11.67
    expect(result.costPer100Miles).toBeCloseTo(11.67, 1);
  });

  // ─── Test 19: Both zero distance and zero fuel ───
  it('handles both zero distance and zero fuel gracefully', () => {
    const result = calculateGasMileage({
      distanceDriven: 0,
      distanceUnit: 'miles',
      fuelUsed: 0,
      fuelUnit: 'gallons',
      fuelPrice: 3.50,
    });
    expect(result.mpg).toBe(0);
    expect(result.mpgUS).toBe(0);
    expect(result.costPerMile).toBe(0);
    expect(result.co2Emissions).toBe(0);
  });

  // ─── Test 20: CO2 emissions with liters ───
  it('calculates CO2 emissions for liters input', () => {
    const result = calculateGasMileage({
      distanceDriven: 500,
      distanceUnit: 'km',
      fuelUsed: 40,
      fuelUnit: 'liters',
      fuelPrice: 1.50,
    });
    // 40 liters × 2.31 kg/liter = 92.4 kg → × 2.20462 = ~203.7 lbs
    expect(result.co2Emissions).toBeCloseTo(203.7, 0);
  });
});
