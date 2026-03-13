import { calculateConcreteSlab } from '@/lib/formulas/construction/concrete-slab';

describe('calculateConcreteSlab', () => {
  // ─── Test 1: Standard 20×10 slab at 4 inches thick, 10% waste ───
  it('calculates a standard 20×10 patio slab with 10% waste', () => {
    const result = calculateConcreteSlab({
      length: 20,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      thickness: 4,
      thicknessUnit: 'in',
      wasteFactor: 10,
    });
    // Base: 20 × 10 × (4/12) = 66.667 cu ft = 2.469 cu yd
    // With 10% waste: 2.469 × 1.1 = 2.716 cu yd ≈ 2.72
    expect(result.cubicYards).toBeCloseTo(2.72, 1);
    expect(result.yardWithoutWaste).toBeCloseTo(2.47, 1);
    expect(result.area).toBeCloseTo(200, 0);
  });

  // ─── Test 2: Thick slab (6 inches) — driveway ───
  it('calculates a 20×10 slab at 6 inches correctly', () => {
    const result = calculateConcreteSlab({
      length: 20,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      thickness: 6,
      thicknessUnit: 'in',
      wasteFactor: 0,
    });
    // 20 × 10 × 0.5 = 100 cu ft = 3.70 cu yd
    expect(result.cubicYards).toBeCloseTo(3.70, 1);
    expect(result.cubicFeet).toBeCloseTo(100, 0);
  });

  // ─── Test 3: Thin slab (2 inches) ───
  it('calculates a thin 2-inch slab correctly', () => {
    const result = calculateConcreteSlab({
      length: 10,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      thickness: 2,
      thicknessUnit: 'in',
      wasteFactor: 0,
    });
    // 10 × 10 × (2/12) = 16.667 cu ft = 0.617 cu yd
    expect(result.cubicYards).toBeCloseTo(0.62, 1);
    expect(result.cubicFeet).toBeCloseTo(16.67, 0);
  });

  // ─── Test 4: Large driveway 40×20 at 5 inches ───
  it('calculates a large 40×20 driveway at 5 inches', () => {
    const result = calculateConcreteSlab({
      length: 40,
      lengthUnit: 'ft',
      width: 20,
      widthUnit: 'ft',
      thickness: 5,
      thicknessUnit: 'in',
      wasteFactor: 10,
    });
    // Base: 40 × 20 × (5/12) = 333.333 cu ft = 12.346 cu yd
    // With 10%: 12.346 × 1.1 = 13.58 cu yd
    expect(result.cubicYards).toBeCloseTo(13.58, 0);
    expect(result.area).toBeCloseTo(800, 0);
  });

  // ─── Test 5: Sidewalk — 50×4 at 4 inches ───
  it('calculates a 50×4 sidewalk at 4 inches', () => {
    const result = calculateConcreteSlab({
      length: 50,
      lengthUnit: 'ft',
      width: 4,
      widthUnit: 'ft',
      thickness: 4,
      thicknessUnit: 'in',
      wasteFactor: 10,
    });
    // Base: 50 × 4 × (4/12) = 66.667 cu ft = 2.469 cu yd
    // With 10%: 2.716 cu yd
    expect(result.cubicYards).toBeCloseTo(2.72, 1);
    expect(result.area).toBeCloseTo(200, 0);
  });

  // ─── Test 6: Zero dimensions → 0 ───
  it('returns zero for zero dimensions', () => {
    const result = calculateConcreteSlab({
      length: 0,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      thickness: 4,
      thicknessUnit: 'in',
      wasteFactor: 10,
    });
    expect(result.cubicYards).toBe(0);
    expect(result.cubicFeet).toBe(0);
    expect(result.bags60lb).toBe(0);
    expect(result.bags80lb).toBe(0);
  });

  // ─── Test 7: Metric inputs ───
  it('converts metric inputs correctly', () => {
    const result = calculateConcreteSlab({
      length: 6,       // 6 meters ≈ 19.685 ft
      lengthUnit: 'm',
      width: 3,        // 3 meters ≈ 9.843 ft
      widthUnit: 'm',
      thickness: 10,   // 10 cm ≈ 3.937 in
      thicknessUnit: 'cm',
      wasteFactor: 0,
    });
    // 19.685 × 9.843 × (3.937/12) = 19.685 × 9.843 × 0.3281 = 63.54 cu ft
    const expectedLFt = 6 * 3.28084;
    const expectedWFt = 3 * 3.28084;
    const expectedTFt = (10 * 0.393701) / 12;
    const expectedCuFt = expectedLFt * expectedWFt * expectedTFt;
    const expectedCuYd = expectedCuFt / 27;
    expect(result.cubicFeet).toBeCloseTo(expectedCuFt, 0);
    expect(result.cubicYards).toBeCloseTo(expectedCuYd, 1);
  });

  // ─── Test 8: 10% waste vs 0% waste ───
  it('10% waste adds exactly 10% more volume', () => {
    const noWaste = calculateConcreteSlab({
      length: 10,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      thickness: 4,
      thicknessUnit: 'in',
      wasteFactor: 0,
    });
    const withWaste = calculateConcreteSlab({
      length: 10,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      thickness: 4,
      thicknessUnit: 'in',
      wasteFactor: 10,
    });
    expect(withWaste.cubicFeet).toBeCloseTo((noWaste.cubicFeet as number) * 1.1, 1);
    expect(withWaste.cubicYards).toBeCloseTo((noWaste.cubicYards as number) * 1.1, 1);
  });

  // ─── Test 9: Bag count accuracy — 60-lb bags ───
  it('calculates 60-lb bag count correctly', () => {
    const result = calculateConcreteSlab({
      length: 20,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      thickness: 4,
      thicknessUnit: 'in',
      wasteFactor: 10,
    });
    // Total cu ft with waste: 66.667 × 1.1 = 73.333
    // 73.333 / 0.45 = 162.96 → 163 bags
    const expectedCuFt = 20 * 10 * (4 / 12) * 1.1;
    const expectedBags = Math.ceil(expectedCuFt / 0.45);
    expect(result.bags60lb).toBe(expectedBags);
  });

  // ─── Test 10: Bag count accuracy — 80-lb bags ───
  it('calculates 80-lb bag count correctly', () => {
    const result = calculateConcreteSlab({
      length: 20,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      thickness: 4,
      thicknessUnit: 'in',
      wasteFactor: 10,
    });
    // 73.333 / 0.60 = 122.22 → 123 bags
    const expectedCuFt = 20 * 10 * (4 / 12) * 1.1;
    const expectedBags = Math.ceil(expectedCuFt / 0.60);
    expect(result.bags80lb).toBe(expectedBags);
  });

  // ─── Test 11: Cost estimate ordering ───
  it('returns cost estimates in correct order with valid values', () => {
    const result = calculateConcreteSlab({
      length: 20,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      thickness: 4,
      thicknessUnit: 'in',
      wasteFactor: 10,
    });
    const costs = result.costEstimate as Array<{ label: string; value: number }>;
    expect(costs).toHaveLength(3);
    expect(costs[0].label).toBe('Ready-Mix Delivery');
    expect(costs[1].label).toBe('60-lb Bags');
    expect(costs[2].label).toBe('80-lb Bags');
    expect(costs[0].value).toBeGreaterThan(0);
    expect(costs[1].value).toBeGreaterThan(0);
    expect(costs[2].value).toBeGreaterThan(0);
  });

  // ─── Test 12: Rebar estimate ───
  it('calculates rebar needed as area / 2', () => {
    const result = calculateConcreteSlab({
      length: 20,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      thickness: 4,
      thicknessUnit: 'in',
      wasteFactor: 10,
    });
    // Area = 200 sq ft, rebar = 200 / 2 = 100 linear feet
    expect(result.rebarNeeded).toBe(100);
  });

  // ─── Test 13: Cubic meters conversion ───
  it('converts cubic yards to cubic meters correctly', () => {
    const result = calculateConcreteSlab({
      length: 20,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      thickness: 4,
      thicknessUnit: 'in',
      wasteFactor: 10,
    });
    // cubicMeters = cubicYards × 0.764555
    const expectedMeters = (result.cubicYards as number) * 0.764555;
    expect(result.cubicMeters).toBeCloseTo(expectedMeters, 2);
  });

  // ─── Test 14: Area calculation ───
  it('calculates area in square feet correctly', () => {
    const result = calculateConcreteSlab({
      length: 15,
      lengthUnit: 'ft',
      width: 8,
      widthUnit: 'ft',
      thickness: 4,
      thicknessUnit: 'in',
      wasteFactor: 0,
    });
    expect(result.area).toBe(120);
  });

  // ─── Test 15: Very small slab ───
  it('handles a very small 2×2 slab at 4 inches', () => {
    const result = calculateConcreteSlab({
      length: 2,
      lengthUnit: 'ft',
      width: 2,
      widthUnit: 'ft',
      thickness: 4,
      thicknessUnit: 'in',
      wasteFactor: 0,
    });
    // 2 × 2 × (4/12) = 1.333 cu ft = 0.049 cu yd
    expect(result.cubicFeet).toBeCloseTo(1.33, 1);
    expect(result.cubicYards).toBeCloseTo(0.05, 1);
    expect(result.bags60lb).toBeGreaterThanOrEqual(1);
    expect(result.bags80lb).toBeGreaterThanOrEqual(1);
  });

  // ─── Test 16: Output structure has all expected keys ───
  it('returns all expected output fields', () => {
    const result = calculateConcreteSlab({
      length: 10,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      thickness: 4,
      thicknessUnit: 'in',
      wasteFactor: 10,
    });
    expect(result).toHaveProperty('cubicYards');
    expect(result).toHaveProperty('cubicFeet');
    expect(result).toHaveProperty('cubicMeters');
    expect(result).toHaveProperty('bags60lb');
    expect(result).toHaveProperty('bags80lb');
    expect(result).toHaveProperty('area');
    expect(result).toHaveProperty('costEstimate');
    expect(result).toHaveProperty('rebarNeeded');
    expect(result).toHaveProperty('yardWithoutWaste');
  });

  // ─── Test 17: Thick garage slab (12 inches) ───
  it('calculates a 12-inch thick garage slab', () => {
    const result = calculateConcreteSlab({
      length: 24,
      lengthUnit: 'ft',
      width: 24,
      widthUnit: 'ft',
      thickness: 12,
      thicknessUnit: 'in',
      wasteFactor: 10,
    });
    // Base: 24 × 24 × 1 = 576 cu ft = 21.33 cu yd
    // With 10%: 23.47 cu yd
    expect(result.cubicFeet).toBeCloseTo(633.6, 0);
    expect(result.cubicYards).toBeCloseTo(23.47, 0);
  });

  // ─── Test 18: Ready-mix cost estimate accuracy ───
  it('calculates ready-mix cost at $150/yard', () => {
    const result = calculateConcreteSlab({
      length: 10,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      thickness: 4,
      thicknessUnit: 'in',
      wasteFactor: 0,
    });
    const costs = result.costEstimate as Array<{ label: string; value: number }>;
    const readyMix = costs.find(c => c.label === 'Ready-Mix Delivery');
    // Cost is calculated from the precise volume before rounding
    // 10 × 10 × (4/12) = 33.333 cu ft / 27 = 1.2346 cu yd × $150 = $185.19
    expect(readyMix).toBeDefined();
    const expectedCost = (10 * 10 * (4 / 12)) / 27 * 150;
    expect(readyMix!.value).toBeCloseTo(expectedCost, 0);
  });

  // ─── Test 19: Waste factor clamped at 25% ───
  it('clamps waste factor at 25% maximum', () => {
    const result = calculateConcreteSlab({
      length: 10,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      thickness: 4,
      thicknessUnit: 'in',
      wasteFactor: 50,  // Should be clamped to 25
    });
    const result25 = calculateConcreteSlab({
      length: 10,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      thickness: 4,
      thicknessUnit: 'in',
      wasteFactor: 25,
    });
    expect(result.cubicYards).toBe(result25.cubicYards);
  });

  // ─── Test 20: 1-inch thin overlay slab ───
  it('handles a very thin 1-inch overlay', () => {
    const result = calculateConcreteSlab({
      length: 20,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      thickness: 1,
      thicknessUnit: 'in',
      wasteFactor: 0,
    });
    // 20 × 10 × (1/12) = 16.667 cu ft = 0.617 cu yd
    expect(result.cubicFeet).toBeCloseTo(16.67, 0);
    expect(result.cubicYards).toBeCloseTo(0.62, 1);
  });
});
