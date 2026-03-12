import { calculateVolumeMaterial } from '@/lib/formulas/construction/volume-material';

describe('calculateVolumeMaterial', () => {
  // ─── Test 1: Standard mulch bed — 20×10 ft at 3 inches ───
  it('calculates a standard mulch bed correctly', () => {
    const result = calculateVolumeMaterial({
      length: 20,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      depth: 3,
      depthUnit: 'in',
      materialType: 'hardwood-mulch',
      bagSize: '2',
    });
    // Area = 200 sq ft
    expect(result.area).toBe(200);
    // Volume = 200 × (3/12) = 50 cu ft
    expect(result.cubicFeet).toBe(50);
    // Cubic yards = 50 / 27 = 1.85
    expect(result.cubicYards).toBeCloseTo(1.85, 1);
    // Bags (2 cu ft) = 50 / 2 = 25
    expect(result.numberOfBags).toBe(25);
  });

  // ─── Test 2: Gravel driveway — 30×12 ft at 4 inches ───
  it('calculates gravel for a driveway correctly', () => {
    const result = calculateVolumeMaterial({
      length: 30,
      lengthUnit: 'ft',
      width: 12,
      widthUnit: 'ft',
      depth: 4,
      depthUnit: 'in',
      materialType: 'pea-gravel',
      bagSize: '0.5',
    });
    // Volume = 360 × (4/12) = 120 cu ft = 4.44 cu yd
    expect(result.cubicFeet).toBe(120);
    expect(result.cubicYards).toBeCloseTo(4.44, 1);
    // Bags (0.5 cu ft) = 120 / 0.5 = 240
    expect(result.numberOfBags).toBe(240);
  });

  // ─── Test 3: Weight calculation — hardwood mulch ───
  it('calculates weight correctly for hardwood mulch', () => {
    const result = calculateVolumeMaterial({
      length: 10,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      depth: 3,
      depthUnit: 'in',
      materialType: 'hardwood-mulch',
      bagSize: '2',
    });
    // Volume = 25 cu ft = 0.926 cu yd
    // Weight = 0.926 × 800 lbs/cu yd = 740.7 lbs
    expect(result.cubicYards).toBeCloseTo(0.93, 1);
    const weightLbs = result.weightLbs as number;
    expect(weightLbs).toBeCloseTo(741, -1);
  });

  // ─── Test 4: Weight calculation — pea gravel (much heavier) ───
  it('calculates heavier weight for gravel vs mulch', () => {
    const mulch = calculateVolumeMaterial({
      length: 10,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      depth: 3,
      depthUnit: 'in',
      materialType: 'hardwood-mulch',
      bagSize: '2',
    });
    const gravel = calculateVolumeMaterial({
      length: 10,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      depth: 3,
      depthUnit: 'in',
      materialType: 'pea-gravel',
      bagSize: '0.5',
    });
    // Same volume, gravel is ~3.375× heavier
    expect(gravel.cubicYards).toBe(mulch.cubicYards);
    expect(gravel.weightLbs).toBeGreaterThan(mulch.weightLbs as number);
  });

  // ─── Test 5: Tons conversion ───
  it('converts weight to tons correctly', () => {
    const result = calculateVolumeMaterial({
      length: 20,
      lengthUnit: 'ft',
      width: 20,
      widthUnit: 'ft',
      depth: 4,
      depthUnit: 'in',
      materialType: 'crushed-stone',
      bagSize: '1',
    });
    // Volume = 400 × (4/12) = 133.33 cu ft = 4.94 cu yd
    // Weight = 4.94 × 2700 = 13,338 lbs = 6.67 tons
    expect(result.weightTons).toBeCloseTo(6.67, 0);
    expect(result.weightLbs).toBeCloseTo(13333, -2);
  });

  // ─── Test 6: Cost estimate range ───
  it('returns cost estimate with low < mid < high', () => {
    const result = calculateVolumeMaterial({
      length: 20,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      depth: 3,
      depthUnit: 'in',
      materialType: 'cedar-mulch',
      bagSize: '2',
    });
    const cost = result.costEstimate as Array<{ label: string; value: number }>;
    expect(cost).toHaveLength(3);
    const low = cost[0].value;
    const mid = cost[1].value;
    const high = cost[2].value;
    expect(low).toBeLessThan(mid);
    expect(mid).toBeLessThan(high);
    expect(low).toBeGreaterThan(0);
  });

  // ─── Test 7: Unit conversion — meters ───
  it('converts meters to feet correctly', () => {
    const result = calculateVolumeMaterial({
      length: 3.048,    // 10 ft
      lengthUnit: 'm',
      width: 3.048,     // 10 ft
      widthUnit: 'm',
      depth: 3,
      depthUnit: 'in',
      materialType: 'hardwood-mulch',
      bagSize: '2',
    });
    expect(result.area).toBeCloseTo(100, -1);
    expect(result.cubicFeet).toBeCloseTo(25, 0);
  });

  // ─── Test 8: Depth in centimeters ───
  it('converts depth from centimeters correctly', () => {
    const result = calculateVolumeMaterial({
      length: 10,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      depth: 7.62,      // 3 inches = 7.62 cm
      depthUnit: 'cm',
      materialType: 'hardwood-mulch',
      bagSize: '2',
    });
    // 7.62 cm × 0.393701 = ~3.0 inches → depth in ft = 3/12 = 0.25
    // Volume = 100 × 0.25 = 25 cu ft
    expect(result.cubicFeet).toBeCloseTo(25, 0);
  });

  // ─── Test 9: Rubber mulch — different density ───
  it('uses correct density for rubber mulch', () => {
    const result = calculateVolumeMaterial({
      length: 10,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      depth: 3,
      depthUnit: 'in',
      materialType: 'rubber-mulch',
      bagSize: '2',
    });
    // Volume = 25 cu ft = 0.926 cu yd
    // Weight = 0.926 × 1200 = 1111 lbs
    expect(result.weightLbs).toBeCloseTo(1111, -2);
  });

  // ─── Test 10: Small area — ceiling on bag count ───
  it('handles a small 5×5 area at 2 inches without errors', () => {
    const result = calculateVolumeMaterial({
      length: 5,
      lengthUnit: 'ft',
      width: 5,
      widthUnit: 'ft',
      depth: 2,
      depthUnit: 'in',
      materialType: 'hardwood-mulch',
      bagSize: '2',
    });
    // Volume = 25 × (2/12) = 4.17 cu ft
    expect(result.cubicFeet).toBeCloseTo(4.17, 0);
    // Bags = ceil(4.17 / 2) = 3
    expect(result.numberOfBags).toBe(3);
  });

  // ─── Test 11: Different bag sizes ───
  it('calculates different bag counts for different bag sizes', () => {
    const small = calculateVolumeMaterial({
      length: 20,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      depth: 3,
      depthUnit: 'in',
      materialType: 'hardwood-mulch',
      bagSize: '1',
    });
    const large = calculateVolumeMaterial({
      length: 20,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      depth: 3,
      depthUnit: 'in',
      materialType: 'hardwood-mulch',
      bagSize: '3',
    });
    // Same volume, smaller bags = more bags
    expect(small.numberOfBags).toBeGreaterThan(large.numberOfBags as number);
    // Volume should be identical
    expect(small.cubicFeet).toBe(large.cubicFeet);
  });

  // ─── Test 12: Decomposed granite density ───
  it('uses correct density for decomposed granite', () => {
    const result = calculateVolumeMaterial({
      length: 10,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      depth: 2,
      depthUnit: 'in',
      materialType: 'decomposed-granite',
      bagSize: '0.5',
    });
    // Volume = 100 × (2/12) = 16.67 cu ft = 0.617 cu yd
    // DG density = 3000 lbs/cu yd → weight = 0.617 × 3000 = 1852 lbs
    expect(result.weightLbs).toBeCloseTo(1852, -2);
  });
});
