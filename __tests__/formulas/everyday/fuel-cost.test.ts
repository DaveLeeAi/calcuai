import { calculateFuelCost } from '@/lib/formulas/everyday/fuel-cost';

describe('calculateFuelCost', () => {
  // ─── Test 1: Standard road trip ───
  it('calculates 300 miles at 25 MPG and $3.50/gal = $42.00', () => {
    const result = calculateFuelCost({
      distance: 300,
      fuelEfficiency: 25,
      fuelPrice: 3.50,
      unitSystem: 'us',
    });
    expect(result.totalCost).toBe(42);
    expect(result.fuelUsed).toBe(12);
    expect(result.costPerMile).toBeCloseTo(0.14, 2);
    expect(result.roundTripCost).toBe(84);
  });

  // ─── Test 2: Short commute ───
  it('calculates 28-mile commute at 32 MPG and $3.60/gal', () => {
    const result = calculateFuelCost({
      distance: 28,
      fuelEfficiency: 32,
      fuelPrice: 3.60,
      unitSystem: 'us',
    });
    expect(result.fuelUsed).toBeCloseTo(0.88, 2);
    expect(result.totalCost).toBeCloseTo(3.15, 2);
  });

  // ─── Test 3: High MPG vehicle ───
  it('calculates costs for a 50 MPG hybrid', () => {
    const result = calculateFuelCost({
      distance: 500,
      fuelEfficiency: 50,
      fuelPrice: 3.25,
      unitSystem: 'us',
    });
    expect(result.fuelUsed).toBe(10);
    expect(result.totalCost).toBe(32.50);
  });

  // ─── Test 4: Low MPG truck ───
  it('calculates costs for a 15 MPG truck', () => {
    const result = calculateFuelCost({
      distance: 200,
      fuelEfficiency: 15,
      fuelPrice: 4.00,
      unitSystem: 'us',
    });
    expect(result.fuelUsed).toBeCloseTo(13.33, 2);
    expect(result.totalCost).toBeCloseTo(53.33, 2);
  });

  // ─── Test 5: Zero distance ───
  it('returns zero cost for zero distance', () => {
    const result = calculateFuelCost({
      distance: 0,
      fuelEfficiency: 25,
      fuelPrice: 3.50,
      unitSystem: 'us',
    });
    expect(result.totalCost).toBe(0);
    expect(result.fuelUsed).toBe(0);
    expect(result.costPerMile).toBe(0);
  });

  // ─── Test 6: Very long trip ───
  it('handles a 3000-mile cross-country trip', () => {
    const result = calculateFuelCost({
      distance: 3000,
      fuelEfficiency: 28,
      fuelPrice: 3.45,
      unitSystem: 'us',
    });
    expect(result.fuelUsed).toBeCloseTo(107.14, 1);
    expect(result.totalCost).toBeCloseTo(369.64, 0);
    expect(result.roundTripFuel).toBeCloseTo(214.29, 0);
  });

  // ─── Test 7: Metric system (L/100km) ───
  it('calculates costs in metric (L/100km)', () => {
    const result = calculateFuelCost({
      distance: 500,
      fuelEfficiency: 8, // 8 L/100km
      fuelPrice: 1.50,   // $1.50/liter
      unitSystem: 'metric',
    });
    // liters = (500/100) * 8 = 40 liters
    // cost = 40 * 1.50 = $60
    expect(result.fuelUsed).toBe(40);
    expect(result.totalCost).toBe(60);
    expect(result.fuelUnit).toBe('liters');
    expect(result.distanceUnit).toBe('km');
  });

  // ─── Test 8: Metric cost per km ───
  it('returns correct cost per km in metric', () => {
    const result = calculateFuelCost({
      distance: 100,
      fuelEfficiency: 10, // 10 L/100km
      fuelPrice: 2.00,
      unitSystem: 'metric',
    });
    // liters = (100/100) * 10 = 10 liters, cost = 20
    expect(result.costPerKm).toBeCloseTo(0.20, 2);
    expect(result.totalCost).toBe(20);
  });

  // ─── Test 9: Round trip calculation ───
  it('calculates round trip as exactly 2x one-way', () => {
    const result = calculateFuelCost({
      distance: 150,
      fuelEfficiency: 30,
      fuelPrice: 3.00,
      unitSystem: 'us',
    });
    expect(result.roundTripCost).toBe(result.totalCost * 2);
    expect(result.roundTripFuel).toBe(result.fuelUsed * 2);
  });

  // ─── Test 10: Default unit system is US ───
  it('defaults to US units', () => {
    const result = calculateFuelCost({
      distance: 100,
      fuelEfficiency: 25,
      fuelPrice: 3.50,
    });
    expect(result.fuelUnit).toBe('gallons');
    expect(result.distanceUnit).toBe('miles');
    expect(result.efficiencyUnit).toBe('MPG');
  });

  // ─── Test 11: Expensive gas ───
  it('calculates correctly with $5.00/gallon gas', () => {
    const result = calculateFuelCost({
      distance: 100,
      fuelEfficiency: 25,
      fuelPrice: 5.00,
      unitSystem: 'us',
    });
    expect(result.fuelUsed).toBe(4);
    expect(result.totalCost).toBe(20);
    expect(result.costPerMile).toBe(0.20);
  });

  // ─── Test 12: Very efficient vehicle ───
  it('handles 100+ MPG (electric equivalent)', () => {
    const result = calculateFuelCost({
      distance: 200,
      fuelEfficiency: 120,
      fuelPrice: 3.50,
      unitSystem: 'us',
    });
    expect(result.fuelUsed).toBeCloseTo(1.67, 1);
    expect(result.totalCost).toBeCloseTo(5.83, 1);
  });
});
