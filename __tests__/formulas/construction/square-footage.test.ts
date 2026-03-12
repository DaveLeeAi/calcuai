import { calculateSquareFootage } from '@/lib/formulas/construction/square-footage';

describe('calculateSquareFootage', () => {
  // ─── Test 1: Standard rectangle ───
  it('calculates a 12 x 10 ft rectangle as 120 sq ft', () => {
    const result = calculateSquareFootage({
      shape: 'rectangle',
      length: 12,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
    });
    expect(result.squareFeet).toBe(120);
  });

  // ─── Test 2: Square ───
  it('calculates a 15 x 15 ft square as 225 sq ft', () => {
    const result = calculateSquareFootage({
      shape: 'rectangle',
      length: 15,
      lengthUnit: 'ft',
      width: 15,
      widthUnit: 'ft',
    });
    expect(result.squareFeet).toBe(225);
  });

  // ─── Test 3: Triangle ───
  it('calculates a triangle with base 10 and height 8 as 40 sq ft', () => {
    const result = calculateSquareFootage({
      shape: 'triangle',
      base: 10,
      baseUnit: 'ft',
      triangleHeight: 8,
      triangleHeightUnit: 'ft',
    });
    expect(result.squareFeet).toBe(40);
  });

  // ─── Test 4: Circle ───
  it('calculates a circle with radius 5 ft as ~78.54 sq ft', () => {
    const result = calculateSquareFootage({
      shape: 'circle',
      radius: 5,
      radiusUnit: 'ft',
    });
    expect(result.squareFeet).toBeCloseTo(78.54, 1);
  });

  // ─── Test 5: Trapezoid ───
  it('calculates a trapezoid with sides 10, 6 and height 8 as 64 sq ft', () => {
    const result = calculateSquareFootage({
      shape: 'trapezoid',
      parallelSide1: 10,
      parallelSide1Unit: 'ft',
      parallelSide2: 6,
      parallelSide2Unit: 'ft',
      trapezoidHeight: 8,
      trapezoidHeightUnit: 'ft',
    });
    expect(result.squareFeet).toBe(64);
  });

  // ─── Test 6: Meters to square feet ───
  it('converts meters to square feet correctly (3m x 4m = ~129.17 sq ft)', () => {
    const result = calculateSquareFootage({
      shape: 'rectangle',
      length: 3,
      lengthUnit: 'm',
      width: 4,
      widthUnit: 'm',
    });
    // 3m = 9.84252 ft, 4m = 13.12336 ft → 9.84252 * 13.12336 ≈ 129.17
    expect(result.squareFeet).toBeCloseTo(129.17, 0);
  });

  // ─── Test 7: Inches to square feet ───
  it('converts inches to square feet correctly (120in x 96in = 80 sq ft)', () => {
    const result = calculateSquareFootage({
      shape: 'rectangle',
      length: 120,
      lengthUnit: 'in',
      width: 96,
      widthUnit: 'in',
    });
    // 120in = 10ft, 96in = 8ft → 10 * 8 = 80 sq ft
    expect(result.squareFeet).toBeCloseTo(80, 0);
  });

  // ─── Test 8: Multiple rooms ───
  it('multiplies area by number of identical rooms (3 rooms of 10x12 = 360 sq ft)', () => {
    const result = calculateSquareFootage({
      shape: 'rectangle',
      length: 12,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      numberOfRooms: 3,
    });
    expect(result.squareFeet).toBe(360);
  });

  // ─── Test 9: Square feet to square meters conversion ───
  it('converts square feet to square meters correctly', () => {
    const result = calculateSquareFootage({
      shape: 'rectangle',
      length: 10,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
    });
    // 100 sq ft * 0.092903 = 9.2903 sq m
    expect(result.squareMeters).toBeCloseTo(9.29, 1);
  });

  // ─── Test 10: Square feet to square yards conversion ───
  it('converts square feet to square yards correctly', () => {
    const result = calculateSquareFootage({
      shape: 'rectangle',
      length: 12,
      lengthUnit: 'ft',
      width: 12,
      widthUnit: 'ft',
    });
    // 144 sq ft / 9 = 16 sq yd
    expect(result.squareYards).toBe(16);
  });

  // ─── Test 11: Square feet to acres conversion ───
  it('converts square feet to acres correctly', () => {
    const result = calculateSquareFootage({
      shape: 'rectangle',
      length: 208.71,
      lengthUnit: 'ft',
      width: 208.71,
      widthUnit: 'ft',
    });
    // 208.71^2 = 43,559.86 sq ft ≈ 1 acre
    expect(result.acres).toBeCloseTo(1, 1);
  });

  // ─── Test 12: Perimeter of rectangle ───
  it('calculates perimeter of a 12 x 10 rectangle as 44 ft', () => {
    const result = calculateSquareFootage({
      shape: 'rectangle',
      length: 12,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
    });
    expect(result.perimeter).toBe(44);
  });

  // ─── Test 13: Perimeter of circle (circumference) ───
  it('calculates circumference of a circle with radius 5 as ~31.42 ft', () => {
    const result = calculateSquareFootage({
      shape: 'circle',
      radius: 5,
      radiusUnit: 'ft',
    });
    expect(result.perimeter).toBeCloseTo(31.42, 1);
  });

  // ─── Test 14: Cost estimates at different price points ───
  it('returns correct cost estimates for 120 sq ft area', () => {
    const result = calculateSquareFootage({
      shape: 'rectangle',
      length: 12,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
    });
    const costs = result.costEstimate as Array<{ label: string; value: number }>;
    // Budget at $3/sq ft: 120 * 3 = $360
    const budget = costs.find(c => c.label.includes('Budget'));
    expect(budget).toBeDefined();
    expect(budget!.value).toBe(360);
    // Mid-range at $6/sq ft: 120 * 6 = $720
    const midRange = costs.find(c => c.label.includes('Mid-Range'));
    expect(midRange).toBeDefined();
    expect(midRange!.value).toBe(720);
    // Premium at $12/sq ft: 120 * 12 = $1440
    const premium = costs.find(c => c.label.includes('Premium'));
    expect(premium).toBeDefined();
    expect(premium!.value).toBe(1440);
  });

  // ─── Test 15: Very small area ───
  it('handles very small area correctly (1 x 1 ft = 1 sq ft)', () => {
    const result = calculateSquareFootage({
      shape: 'rectangle',
      length: 1,
      lengthUnit: 'ft',
      width: 1,
      widthUnit: 'ft',
    });
    expect(result.squareFeet).toBe(1);
    expect(result.squareMeters).toBeCloseTo(0.09, 1);
  });

  // ─── Test 16: Very large area (lot size) ───
  it('handles very large area correctly (200 x 300 ft = 60,000 sq ft)', () => {
    const result = calculateSquareFootage({
      shape: 'rectangle',
      length: 200,
      lengthUnit: 'ft',
      width: 300,
      widthUnit: 'ft',
    });
    expect(result.squareFeet).toBe(60000);
    expect(result.acres).toBeCloseTo(1.3774, 3);
  });

  // ─── Test 17: Yards as input unit ───
  it('converts yards to square feet correctly (5yd x 4yd = 540 sq ft)', () => {
    const result = calculateSquareFootage({
      shape: 'rectangle',
      length: 5,
      lengthUnit: 'yd',
      width: 4,
      widthUnit: 'yd',
    });
    // 5yd = 15ft, 4yd = 12ft → 15 * 12 = 180 sq ft
    expect(result.squareFeet).toBe(180);
  });

  // ─── Test 18: Default shape fallback ───
  it('defaults to rectangle when no shape specified', () => {
    const result = calculateSquareFootage({
      length: 10,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
    });
    expect(result.squareFeet).toBe(100);
  });

  // ─── Test 19: Trapezoid perimeter approximation ───
  it('calculates trapezoid perimeter as a + b + 2h', () => {
    const result = calculateSquareFootage({
      shape: 'trapezoid',
      parallelSide1: 10,
      parallelSide1Unit: 'ft',
      parallelSide2: 6,
      parallelSide2Unit: 'ft',
      trapezoidHeight: 8,
      trapezoidHeightUnit: 'ft',
    });
    // 10 + 6 + 2*8 = 32
    expect(result.perimeter).toBe(32);
  });

  // ─── Test 20: Triangle perimeter (right triangle approx) ───
  it('calculates triangle perimeter using right triangle approximation', () => {
    const result = calculateSquareFootage({
      shape: 'triangle',
      base: 3,
      baseUnit: 'ft',
      triangleHeight: 4,
      triangleHeightUnit: 'ft',
    });
    // 3 + 4 + sqrt(9+16) = 3 + 4 + 5 = 12
    expect(result.perimeter).toBeCloseTo(12, 1);
  });

  // ─── Test 21: Multiple rooms with circle ───
  it('multiplies circle area by number of rooms', () => {
    const result = calculateSquareFootage({
      shape: 'circle',
      radius: 5,
      radiusUnit: 'ft',
      numberOfRooms: 2,
    });
    // pi * 25 * 2 ≈ 157.08
    expect(result.squareFeet).toBeCloseTo(157.08, 0);
  });
});
