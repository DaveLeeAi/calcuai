import { calculateRoofing } from '@/lib/formulas/construction/roofing';

describe('calculateRoofing', () => {
  // ─── Test 1: Standard gable roof, 4/12 pitch ───
  it('calculates a standard 40×30 gable roof at 4/12 pitch', () => {
    const result = calculateRoofing({
      length: 40,
      lengthUnit: 'ft',
      width: 30,
      widthUnit: 'ft',
      pitch: 4,
      roofType: 'gable',
      material: 'architectural',
      wastePercent: 0,
      layers: 1,
    });
    // Ground area = 40 × 30 = 1200 sq ft
    expect(result.groundArea).toBe(1200);
    // Pitch factor for 4/12 = √(16+144)/12 = √160/12 = 12.649/12 = 1.0541
    expect(result.pitchFactor).toBeCloseTo(1.0541, 3);
    // Roof area = 1200 × 1.0541 = 1264.9 sq ft
    expect(result.roofArea).toBeCloseTo(1265, -1);
    // Squares = ~12.65
    expect(result.squares).toBeCloseTo(12.65, 0);
  });

  // ─── Test 2: Flat roof — pitch factor should be 1.0 ───
  it('uses pitch factor of 1.0 for flat roofs', () => {
    const result = calculateRoofing({
      length: 20,
      lengthUnit: 'ft',
      width: 20,
      widthUnit: 'ft',
      pitch: 0,
      roofType: 'flat',
      material: '3tab',
      wastePercent: 0,
      layers: 1,
    });
    expect(result.pitchFactor).toBe(1.0);
    expect(result.roofArea).toBe(400);
    expect(result.squares).toBe(4);
  });

  // ─── Test 3: Steep 12/12 pitch (45°) ───
  it('calculates correct pitch factor for 12/12 pitch', () => {
    const result = calculateRoofing({
      length: 30,
      lengthUnit: 'ft',
      width: 30,
      widthUnit: 'ft',
      pitch: 12,
      roofType: 'gable',
      material: 'architectural',
      wastePercent: 0,
      layers: 1,
    });
    // 12/12 pitch factor = √(144+144)/12 = √288/12 = 16.97/12 = 1.4142
    expect(result.pitchFactor).toBeCloseTo(1.4142, 3);
    // Roof area = 900 × 1.4142 = 1272.8
    expect(result.roofArea).toBeCloseTo(1272.8, 0);
  });

  // ─── Test 4: Waste factor applied correctly ───
  it('applies 15% waste factor correctly', () => {
    const noWaste = calculateRoofing({
      length: 40,
      lengthUnit: 'ft',
      width: 30,
      widthUnit: 'ft',
      pitch: 4,
      roofType: 'gable',
      material: 'architectural',
      wastePercent: 0,
      layers: 1,
    });
    const withWaste = calculateRoofing({
      length: 40,
      lengthUnit: 'ft',
      width: 30,
      widthUnit: 'ft',
      pitch: 4,
      roofType: 'gable',
      material: 'architectural',
      wastePercent: 15,
      layers: 1,
    });
    expect(withWaste.roofArea).toBeCloseTo((noWaste.roofArea as number) * 1.15, 0);
  });

  // ─── Test 5: Bundles — architectural shingles at 3 per square ───
  it('calculates 3 bundles per square for architectural shingles', () => {
    const result = calculateRoofing({
      length: 50,
      lengthUnit: 'ft',
      width: 30,
      widthUnit: 'ft',
      pitch: 4,
      roofType: 'gable',
      material: 'architectural',
      wastePercent: 10,
      layers: 1,
    });
    // Squares × 3 = bundles, rounded up
    const expectedBundles = Math.ceil((result.squares as number) * 3);
    expect(result.bundlesOrPanels).toBe(expectedBundles);
  });

  // ─── Test 6: Metal panels ───
  it('calculates panel count for metal roofing', () => {
    const result = calculateRoofing({
      length: 40,
      lengthUnit: 'ft',
      width: 30,
      widthUnit: 'ft',
      pitch: 4,
      roofType: 'gable',
      material: 'metal',
      wastePercent: 10,
      layers: 1,
    });
    // Metal: 3.57 panels per square
    const expectedPanels = Math.ceil((result.squares as number) * 3.57);
    expect(result.bundlesOrPanels).toBe(expectedPanels);
  });

  // ─── Test 7: Underlayment rolls — 400 sq ft per roll ───
  it('calculates underlayment rolls correctly', () => {
    const result = calculateRoofing({
      length: 40,
      lengthUnit: 'ft',
      width: 30,
      widthUnit: 'ft',
      pitch: 4,
      roofType: 'gable',
      material: 'architectural',
      wastePercent: 0,
      layers: 1,
    });
    const expectedRolls = Math.ceil((result.roofArea as number) / 400);
    expect(result.underlaymentRolls).toBe(expectedRolls);
  });

  // ─── Test 8: Ridge cap for gable roof ───
  it('calculates ridge cap bundles for gable roof', () => {
    const result = calculateRoofing({
      length: 50,
      lengthUnit: 'ft',
      width: 30,
      widthUnit: 'ft',
      pitch: 6,
      roofType: 'gable',
      material: 'architectural',
      wastePercent: 10,
      layers: 1,
    });
    // Gable ridge = length / 25, rounded up
    expect(result.ridgeCap).toBe(Math.ceil(50 / 25));
  });

  // ─── Test 9: Hip roof has more ridge cap ───
  it('calculates more ridge cap for hip roof than gable', () => {
    const gable = calculateRoofing({
      length: 50,
      lengthUnit: 'ft',
      width: 30,
      widthUnit: 'ft',
      pitch: 6,
      roofType: 'gable',
      material: 'architectural',
      wastePercent: 10,
      layers: 1,
    });
    const hip = calculateRoofing({
      length: 50,
      lengthUnit: 'ft',
      width: 30,
      widthUnit: 'ft',
      pitch: 6,
      roofType: 'hip',
      material: 'architectural',
      wastePercent: 10,
      layers: 1,
    });
    expect(hip.ridgeCap).toBeGreaterThan(gable.ridgeCap as number);
  });

  // ─── Test 10: Cost estimate has low < mid < high ───
  it('returns cost estimate with low < mid < high', () => {
    const result = calculateRoofing({
      length: 40,
      lengthUnit: 'ft',
      width: 30,
      widthUnit: 'ft',
      pitch: 4,
      roofType: 'gable',
      material: 'architectural',
      wastePercent: 10,
      layers: 1,
    });
    const cost = result.costEstimate as Array<{ label: string; value: number }>;
    expect(cost).toHaveLength(3);
    const low = cost.find(c => c.label === 'Low Estimate');
    const mid = cost.find(c => c.label === 'Mid Estimate');
    const high = cost.find(c => c.label === 'High Estimate');
    expect(low!.value).toBeLessThan(mid!.value);
    expect(mid!.value).toBeLessThan(high!.value);
  });

  // ─── Test 11: Unit conversion — meters ───
  it('converts meters to feet correctly', () => {
    const result = calculateRoofing({
      length: 12.192,   // 40 ft
      lengthUnit: 'm',
      width: 9.144,     // 30 ft
      widthUnit: 'm',
      pitch: 4,
      roofType: 'gable',
      material: 'architectural',
      wastePercent: 0,
      layers: 1,
    });
    expect(result.groundArea).toBeCloseTo(1200, -1);
  });

  // ─── Test 12: Small roof — no zero results ───
  it('handles a small 10×10 roof without errors', () => {
    const result = calculateRoofing({
      length: 10,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      pitch: 4,
      roofType: 'gable',
      material: '3tab',
      wastePercent: 10,
      layers: 1,
    });
    expect(result.squares).toBeGreaterThan(0);
    expect(result.bundlesOrPanels).toBeGreaterThanOrEqual(1);
    expect(result.underlaymentRolls).toBeGreaterThanOrEqual(1);
  });

  // ─── Test 13: Flat roof has 0 ridge cap ───
  it('returns 0 ridge cap for flat roof', () => {
    const result = calculateRoofing({
      length: 40,
      lengthUnit: 'ft',
      width: 30,
      widthUnit: 'ft',
      pitch: 0,
      roofType: 'flat',
      material: '3tab',
      wastePercent: 10,
      layers: 1,
    });
    expect(result.ridgeCap).toBe(0);
  });
});
