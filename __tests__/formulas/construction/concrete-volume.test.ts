import { calculateConcreteVolume } from '@/lib/formulas/construction/concrete-volume';

describe('calculateConcreteVolume', () => {
  // ─── Test 1: Standard 10×10 slab at 4 inches deep ───
  it('calculates a standard 10×10 ft slab at 4 in depth correctly', () => {
    const result = calculateConcreteVolume({
      projectType: 'slab',
      length: 10,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      depth: 4,
      depthUnit: 'in',
      quantity: 1,
      wastePercent: 0,
      bagSize: '80',
    });
    // 10 × 10 × (4/12) = 33.333 cu ft = 1.235 cu yd
    expect(result.cubicYards).toBeCloseTo(1.23, 1);
    expect(result.cubicFeet).toBeCloseTo(33.33, 1);
  });

  // ─── Test 2: Large driveway — 20×50 ft at 6 inches ───
  it('calculates a large driveway slab correctly', () => {
    const result = calculateConcreteVolume({
      projectType: 'slab',
      length: 20,
      lengthUnit: 'ft',
      width: 50,
      widthUnit: 'ft',
      depth: 6,
      depthUnit: 'in',
      quantity: 1,
      wastePercent: 0,
      bagSize: '80',
    });
    // 20 × 50 × 0.5 = 500 cu ft = 18.52 cu yd
    expect(result.cubicYards).toBeCloseTo(18.52, 1);
    expect(result.cubicFeet).toBeCloseTo(500, 0);
  });

  // ─── Test 3: Column / cylinder — 12 in diameter × 4 ft height ───
  it('calculates a cylindrical column correctly', () => {
    const result = calculateConcreteVolume({
      projectType: 'column',
      length: 4,         // height = 4 ft
      lengthUnit: 'ft',
      width: 12,         // diameter = 12 in
      widthUnit: 'in',
      depth: 4,          // depth not used for column; formula uses length as height
      depthUnit: 'in',
      quantity: 1,
      wastePercent: 0,
      bagSize: '80',
    });
    // diameter = 12 in = 1 ft, radius = 0.5 ft, height = 4 ft
    // V = π × 0.5² × 4 = π × 0.25 × 4 = π = 3.1416 cu ft
    // 3.1416 / 27 = 0.1164 cu yd
    expect(result.cubicFeet).toBeCloseTo(3.14, 1);
    expect(result.cubicYards).toBeCloseTo(0.12, 1);
  });

  // ─── Test 4: Multiple identical sections (quantity = 3) ───
  it('multiplies volume by quantity for identical sections', () => {
    const single = calculateConcreteVolume({
      projectType: 'footing',
      length: 8,
      lengthUnit: 'ft',
      width: 2,
      widthUnit: 'ft',
      depth: 12,
      depthUnit: 'in',
      quantity: 1,
      wastePercent: 0,
      bagSize: '80',
    });
    const triple = calculateConcreteVolume({
      projectType: 'footing',
      length: 8,
      lengthUnit: 'ft',
      width: 2,
      widthUnit: 'ft',
      depth: 12,
      depthUnit: 'in',
      quantity: 3,
      wastePercent: 0,
      bagSize: '80',
    });
    expect(triple.cubicFeet).toBeCloseTo((single.cubicFeet as number) * 3, 1);
    expect(triple.cubicYards).toBeCloseTo((single.cubicYards as number) * 3, 1);
  });

  // ─── Test 5: Waste factor 10% applied correctly ───
  it('applies 10% waste factor correctly', () => {
    const result = calculateConcreteVolume({
      projectType: 'slab',
      length: 10,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      depth: 4,
      depthUnit: 'in',
      quantity: 1,
      wastePercent: 10,
      bagSize: '80',
    });
    // Base: 33.333 cu ft × 1.10 = 36.667 cu ft = 1.358 cu yd
    expect(result.cubicFeet).toBeCloseTo(36.67, 1);
    expect(result.cubicYards).toBeCloseTo(1.36, 1);
  });

  // ─── Test 6: Waste factor 0% returns base volume ───
  it('returns base volume when waste factor is 0%', () => {
    const result = calculateConcreteVolume({
      projectType: 'slab',
      length: 10,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      depth: 4,
      depthUnit: 'in',
      quantity: 1,
      wastePercent: 0,
      bagSize: '80',
    });
    const breakdown = result.projectBreakdown as Array<{ label: string; value: number }>;
    const baseVol = breakdown.find(b => b.label === 'Base Volume (cu ft)');
    const wasteVol = breakdown.find(b => b.label === 'Waste Volume (cu ft)');
    expect(wasteVol!.value).toBe(0);
    expect(baseVol!.value).toBeCloseTo(result.cubicFeet as number, 2);
  });

  // ─── Test 7: Unit conversion — meters to feet ───
  it('converts meters to feet correctly for length and width', () => {
    const result = calculateConcreteVolume({
      projectType: 'slab',
      length: 3,            // 3 meters ≈ 9.84252 ft
      lengthUnit: 'm',
      width: 3,             // 3 meters ≈ 9.84252 ft
      widthUnit: 'm',
      depth: 4,
      depthUnit: 'in',
      quantity: 1,
      wastePercent: 0,
      bagSize: '80',
    });
    // 9.84252 × 9.84252 × (4/12) = 32.29 cu ft ≈ 1.20 cu yd
    const expectedCuFt = (3 * 3.28084) * (3 * 3.28084) * (4 / 12);
    expect(result.cubicFeet).toBeCloseTo(expectedCuFt, 0);
  });

  // ─── Test 8: Unit conversion — inches for all dimensions ───
  it('converts inches to feet for length and width', () => {
    const result = calculateConcreteVolume({
      projectType: 'slab',
      length: 120,          // 120 in = 10 ft
      lengthUnit: 'in',
      width: 120,           // 120 in = 10 ft
      widthUnit: 'in',
      depth: 4,
      depthUnit: 'in',
      quantity: 1,
      wastePercent: 0,
      bagSize: '80',
    });
    // 10 × 10 × (4/12) = 33.33 cu ft
    expect(result.cubicFeet).toBeCloseTo(33.33, 0);
  });

  // ─── Test 9: 80 lb bag count for ~1 cubic yard ───
  it('calculates approximately 45 bags of 80 lb for 1 cubic yard', () => {
    const result = calculateConcreteVolume({
      projectType: 'slab',
      length: 10,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      depth: 4,
      depthUnit: 'in',
      quantity: 1,
      wastePercent: 0,
      bagSize: '80',
    });
    // 33.333 cu ft ÷ 0.60 cu ft/bag = 55.56 → 56 bags
    expect(result.numberOfBags).toBe(56);
  });

  // ─── Test 10: 60 lb bag count ───
  it('calculates correct number of 60 lb bags', () => {
    const result = calculateConcreteVolume({
      projectType: 'slab',
      length: 10,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      depth: 4,
      depthUnit: 'in',
      quantity: 1,
      wastePercent: 0,
      bagSize: '60',
    });
    // 33.333 cu ft ÷ 0.45 cu ft/bag = 74.07 → 75 bags
    expect(result.numberOfBags).toBe(75);
  });

  // ─── Test 11: 40 lb bag count ───
  it('calculates correct number of 40 lb bags', () => {
    const result = calculateConcreteVolume({
      projectType: 'slab',
      length: 10,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      depth: 4,
      depthUnit: 'in',
      quantity: 1,
      wastePercent: 0,
      bagSize: '40',
    });
    // 33.333 cu ft ÷ 0.30 cu ft/bag = 111.11 → 112 bags
    expect(result.numberOfBags).toBe(112);
  });

  // ─── Test 12: Small project — single post hole (column) ───
  it('calculates a small post hole correctly', () => {
    const result = calculateConcreteVolume({
      projectType: 'column',
      length: 36,           // 36 inches = 3 ft height
      lengthUnit: 'in',
      width: 10,            // 10 in diameter
      widthUnit: 'in',
      depth: 4,             // unused for column
      depthUnit: 'in',
      quantity: 1,
      wastePercent: 10,
      bagSize: '80',
    });
    // height = 36 in = 3 ft, diameter = 10 in ≈ 0.8333 ft, radius = 0.4167 ft
    // V = π × 0.4167² × 3 = π × 0.1736 × 3 = 1.636 cu ft
    // With 10% waste: 1.636 × 1.1 = 1.80 cu ft
    // Bags: 1.80 / 0.60 = 3 bags
    expect(result.cubicFeet).toBeCloseTo(1.80, 0);
    expect(result.numberOfBags).toBe(3);
  });

  // ─── Test 13: Large parking pad ───
  it('calculates a large parking pad correctly', () => {
    const result = calculateConcreteVolume({
      projectType: 'slab',
      length: 40,
      lengthUnit: 'ft',
      width: 20,
      widthUnit: 'ft',
      depth: 6,
      depthUnit: 'in',
      quantity: 1,
      wastePercent: 10,
      bagSize: '80',
    });
    // 40 × 20 × 0.5 = 400 cu ft × 1.1 = 440 cu ft = 16.30 cu yd
    expect(result.cubicFeet).toBeCloseTo(440, 0);
    expect(result.cubicYards).toBeCloseTo(16.30, 0);
  });

  // ─── Test 14: Edge case — small but realistic dimensions ───
  it('handles small dimensions without errors', () => {
    const result = calculateConcreteVolume({
      projectType: 'slab',
      length: 2,
      lengthUnit: 'ft',
      width: 2,
      widthUnit: 'ft',
      depth: 4,
      depthUnit: 'in',
      quantity: 1,
      wastePercent: 0,
      bagSize: '80',
    });
    // 2 × 2 × (4/12) = 1.333 cu ft = 0.05 cu yd
    expect(result.cubicFeet).toBeCloseTo(1.33, 1);
    expect(result.cubicYards).toBeCloseTo(0.05, 1);
    expect(result.numberOfBags).toBeGreaterThanOrEqual(1);
    // 1.333 / 0.60 = 2.22 → 3 bags
    expect(result.numberOfBags).toBe(3);
  });

  // ─── Test 15: Cost estimation range ───
  it('returns a cost estimate range with low, mid, and high values', () => {
    const result = calculateConcreteVolume({
      projectType: 'slab',
      length: 10,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      depth: 4,
      depthUnit: 'in',
      quantity: 1,
      wastePercent: 10,
      bagSize: '80',
    });
    const cost = result.preMixCost as Array<{ label: string; value: number }>;
    expect(cost).toHaveLength(3);
    const low = cost.find(c => c.label === 'Low Estimate');
    const mid = cost.find(c => c.label === 'Mid Estimate');
    const high = cost.find(c => c.label === 'High Estimate');
    expect(low).toBeDefined();
    expect(mid).toBeDefined();
    expect(high).toBeDefined();
    expect(low!.value).toBeLessThan(mid!.value);
    expect(mid!.value).toBeLessThan(high!.value);
    expect(low!.value).toBeGreaterThan(0);
  });

  // ─── Test 16: Weight total calculation ───
  it('calculates total weight correctly based on bag count and bag size', () => {
    const result = calculateConcreteVolume({
      projectType: 'slab',
      length: 10,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      depth: 4,
      depthUnit: 'in',
      quantity: 1,
      wastePercent: 0,
      bagSize: '80',
    });
    // 56 bags × 80 lbs = 4,480 lbs
    expect(result.weightTotal).toBe((result.numberOfBags as number) * 80);
  });

  // ─── Test 17: Steps / stairs — triangular approximation ───
  it('calculates steps volume using triangular prism approximation', () => {
    const result = calculateConcreteVolume({
      projectType: 'steps',
      length: 4,           // total run = 4 ft
      lengthUnit: 'ft',
      width: 3,            // stair width = 3 ft
      widthUnit: 'ft',
      depth: 36,           // total rise = 36 in = 3 ft
      depthUnit: 'in',
      quantity: 1,
      wastePercent: 0,
      bagSize: '80',
    });
    // V = (4 × 3 × 3) / 2 = 18 cu ft = 0.667 cu yd
    expect(result.cubicFeet).toBeCloseTo(18, 0);
    expect(result.cubicYards).toBeCloseTo(0.67, 1);
  });

  // ─── Test 18: Depth in centimeters ───
  it('converts depth from centimeters correctly', () => {
    const result = calculateConcreteVolume({
      projectType: 'slab',
      length: 10,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      depth: 10.16,        // 10.16 cm ≈ 4 inches
      depthUnit: 'cm',
      quantity: 1,
      wastePercent: 0,
      bagSize: '80',
    });
    // 10.16 cm × 0.393701 = 4.0 in → depth in feet = 4/12 = 0.333
    // V = 10 × 10 × 0.333 = 33.33 cu ft
    expect(result.cubicFeet).toBeCloseTo(33.33, 0);
  });

  // ─── Test 19: Multiple columns (fence post footings) ───
  it('calculates 10 fence post footings correctly', () => {
    const result = calculateConcreteVolume({
      projectType: 'column',
      length: 36,           // 36 in = 3 ft height
      lengthUnit: 'in',
      width: 12,            // 12 in = 1 ft diameter
      widthUnit: 'in',
      depth: 4,
      depthUnit: 'in',
      quantity: 10,
      wastePercent: 10,
      bagSize: '80',
    });
    // Per hole: π × 0.5² × 3 = 2.356 cu ft
    // 10 holes: 23.56 cu ft × 1.1 = 25.92 cu ft = 0.96 cu yd
    expect(result.cubicFeet).toBeCloseTo(25.92, 0);
    expect(result.cubicYards).toBeCloseTo(0.96, 1);
  });

  // ─── Test 20: Footing type matches slab calculation ───
  it('calculates footing type identically to slab (both rectangular)', () => {
    const slabResult = calculateConcreteVolume({
      projectType: 'slab',
      length: 8,
      lengthUnit: 'ft',
      width: 2,
      widthUnit: 'ft',
      depth: 12,
      depthUnit: 'in',
      quantity: 1,
      wastePercent: 0,
      bagSize: '80',
    });
    const footingResult = calculateConcreteVolume({
      projectType: 'footing',
      length: 8,
      lengthUnit: 'ft',
      width: 2,
      widthUnit: 'ft',
      depth: 12,
      depthUnit: 'in',
      quantity: 1,
      wastePercent: 0,
      bagSize: '80',
    });
    expect(footingResult.cubicFeet).toBe(slabResult.cubicFeet);
    expect(footingResult.cubicYards).toBe(slabResult.cubicYards);
    expect(footingResult.numberOfBags).toBe(slabResult.numberOfBags);
  });
});
