import { calculateFlooring } from '@/lib/formulas/construction/flooring';

describe('calculateFlooring', () => {
  // ─── Test 1: Standard hardwood room — 14×12 ft, 10% waste ───
  it('calculates a standard hardwood room correctly', () => {
    const result = calculateFlooring({
      length: 14,
      lengthUnit: 'ft',
      width: 12,
      widthUnit: 'ft',
      materialType: 'hardwood',
      wastePercent: 10,
      boxSize: 20,
      rooms: 1,
    });
    // Area = 168 sq ft
    expect(result.totalArea).toBe(168);
    // Material = 168 × 1.10 = 184.8 sq ft
    expect(result.materialNeeded).toBeCloseTo(184.8, 1);
    // Boxes = ceil(184.8 / 20) = 10
    expect(result.boxesNeeded).toBe(10);
    // Waste = 184.8 - 168 = 16.8
    expect(result.wasteArea).toBeCloseTo(16.8, 1);
  });

  // ─── Test 2: Multiple rooms ───
  it('multiplies area by number of rooms', () => {
    const single = calculateFlooring({
      length: 14,
      lengthUnit: 'ft',
      width: 12,
      widthUnit: 'ft',
      materialType: 'laminate',
      wastePercent: 10,
      boxSize: 25,
      rooms: 1,
    });
    const triple = calculateFlooring({
      length: 14,
      lengthUnit: 'ft',
      width: 12,
      widthUnit: 'ft',
      materialType: 'laminate',
      wastePercent: 10,
      boxSize: 25,
      rooms: 3,
    });
    expect(triple.totalArea).toBe((single.totalArea as number) * 3);
    expect(triple.materialNeeded).toBeCloseTo((single.materialNeeded as number) * 3, 1);
  });

  // ─── Test 3: Different waste percentages ───
  it('applies different waste percentages correctly', () => {
    const low = calculateFlooring({
      length: 20,
      lengthUnit: 'ft',
      width: 15,
      widthUnit: 'ft',
      materialType: 'tile',
      wastePercent: 5,
      boxSize: 15,
      rooms: 1,
    });
    const high = calculateFlooring({
      length: 20,
      lengthUnit: 'ft',
      width: 15,
      widthUnit: 'ft',
      materialType: 'tile',
      wastePercent: 20,
      boxSize: 15,
      rooms: 1,
    });
    expect(low.totalArea).toBe(high.totalArea);
    expect(high.materialNeeded).toBeGreaterThan(low.materialNeeded as number);
    expect(high.boxesNeeded).toBeGreaterThanOrEqual(low.boxesNeeded as number);
  });

  // ─── Test 4: Zero waste ───
  it('returns exact area when waste is 0%', () => {
    const result = calculateFlooring({
      length: 10,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      materialType: 'vinyl-plank',
      wastePercent: 0,
      boxSize: 24,
      rooms: 1,
    });
    expect(result.totalArea).toBe(100);
    expect(result.materialNeeded).toBe(100);
    expect(result.wasteArea).toBe(0);
  });

  // ─── Test 5: Box rounding — always rounds up ───
  it('rounds boxes up to next whole number', () => {
    const result = calculateFlooring({
      length: 10,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      materialType: 'hardwood',
      wastePercent: 10,
      boxSize: 20,
      rooms: 1,
    });
    // Material = 100 × 1.1 = 110 sq ft → 110/20 = 5.5 → 6 boxes
    expect(result.boxesNeeded).toBe(6);
  });

  // ─── Test 6: Cost estimate varies by material type ───
  it('returns different cost ranges for hardwood vs laminate', () => {
    const hardwood = calculateFlooring({
      length: 14,
      lengthUnit: 'ft',
      width: 12,
      widthUnit: 'ft',
      materialType: 'hardwood',
      wastePercent: 10,
      boxSize: 20,
      rooms: 1,
    });
    const laminate = calculateFlooring({
      length: 14,
      lengthUnit: 'ft',
      width: 12,
      widthUnit: 'ft',
      materialType: 'laminate',
      wastePercent: 10,
      boxSize: 25,
      rooms: 1,
    });
    const hwCost = hardwood.costEstimate as Array<{ label: string; value: number }>;
    const lamCost = laminate.costEstimate as Array<{ label: string; value: number }>;
    // Hardwood is more expensive per sq ft
    expect(hwCost[0].value).toBeGreaterThan(lamCost[0].value);
  });

  // ─── Test 7: Cost estimate low < mid < high ───
  it('returns cost estimate with low < mid < high', () => {
    const result = calculateFlooring({
      length: 14,
      lengthUnit: 'ft',
      width: 12,
      widthUnit: 'ft',
      materialType: 'hardwood',
      wastePercent: 10,
      boxSize: 20,
      rooms: 1,
    });
    const cost = result.costEstimate as Array<{ label: string; value: number }>;
    expect(cost).toHaveLength(3);
    expect(cost[0].value).toBeLessThan(cost[1].value);
    expect(cost[1].value).toBeLessThan(cost[2].value);
  });

  // ─── Test 8: Unit conversion — meters ───
  it('converts meters to feet correctly', () => {
    const result = calculateFlooring({
      length: 4.2672,    // 14 ft
      lengthUnit: 'm',
      width: 3.6576,     // 12 ft
      widthUnit: 'm',
      materialType: 'hardwood',
      wastePercent: 10,
      boxSize: 20,
      rooms: 1,
    });
    expect(result.totalArea).toBeCloseTo(168, -1);
  });

  // ─── Test 9: Natural stone uses higher default waste ───
  it('uses 15% default waste for natural stone if not specified', () => {
    const result = calculateFlooring({
      length: 10,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      materialType: 'stone',
      boxSize: 10,
      rooms: 1,
    });
    // Default stone waste = 15%
    // Material = 100 × 1.15 = 115
    expect(result.materialNeeded).toBeCloseTo(115, 0);
  });

  // ─── Test 10: Large area — whole house ───
  it('handles a large multi-room calculation', () => {
    const result = calculateFlooring({
      length: 20,
      lengthUnit: 'ft',
      width: 15,
      widthUnit: 'ft',
      materialType: 'vinyl-plank',
      wastePercent: 10,
      boxSize: 24,
      rooms: 5,
    });
    // Total area = 20 × 15 × 5 = 1500 sq ft
    expect(result.totalArea).toBe(1500);
    // Material = 1500 × 1.10 = 1650
    expect(result.materialNeeded).toBe(1650);
    // Boxes = ceil(1650 / 24) = 69
    expect(result.boxesNeeded).toBe(69);
  });

  // ─── Test 11: Breakdown includes all fields ───
  it('returns complete flooring breakdown', () => {
    const result = calculateFlooring({
      length: 14,
      lengthUnit: 'ft',
      width: 12,
      widthUnit: 'ft',
      materialType: 'hardwood',
      wastePercent: 10,
      boxSize: 20,
      rooms: 1,
    });
    const breakdown = result.flooringBreakdown as Array<{ label: string; value: number }>;
    expect(breakdown.length).toBeGreaterThanOrEqual(4);
    const materialEntry = breakdown.find(b => b.label.includes('Material'));
    expect(materialEntry).toBeDefined();
  });
});
