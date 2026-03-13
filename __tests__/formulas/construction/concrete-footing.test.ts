import { calculateConcreteFooting } from '@/lib/formulas/construction/concrete-footing';

describe('calculateConcreteFooting', () => {
  // ─── Test 1: Continuous footing — 40 ft × 20 in wide × 12 in deep ───
  it('calculates a continuous strip footing correctly', () => {
    const result = calculateConcreteFooting({
      footingType: 'continuous',
      length: 40,
      lengthUnit: 'ft',
      width: 20,
      widthUnit: 'in',
      depth: 12,
      depthUnit: 'in',
      diameter: 0,
      diameterUnit: 'in',
      quantity: 1,
      wasteFactor: 10,
    });
    // 40 × (20/12) × (12/12) = 40 × 1.6667 × 1 = 66.667 cu ft
    // 66.667 / 27 = 2.469 cu yd × 1.1 = 2.716 cu yd
    expect(result.cubicYards).toBeCloseTo(2.72, 1);
    expect(result.yardWithoutWaste).toBeCloseTo(2.47, 1);
  });

  // ─── Test 2: Rectangular pad footings — 3×3×12, qty 4 ───
  it('calculates rectangular pad footings with quantity', () => {
    const result = calculateConcreteFooting({
      footingType: 'rectangular',
      length: 3,
      lengthUnit: 'ft',
      width: 3,
      widthUnit: 'ft',
      depth: 12,
      depthUnit: 'in',
      diameter: 0,
      diameterUnit: 'in',
      quantity: 4,
      wasteFactor: 10,
    });
    // Per footing: 3 × 3 × 1 = 9 cu ft
    // 4 footings: 36 cu ft × 1.1 = 39.6 cu ft = 1.467 cu yd
    expect(result.cubicFeet).toBeCloseTo(39.6, 0);
    expect(result.cubicYards).toBeCloseTo(1.47, 1);
  });

  // ─── Test 3: Round pier footings — 12" dia × 36" deep, qty 8 ───
  it('calculates round pier footings correctly', () => {
    const result = calculateConcreteFooting({
      footingType: 'round',
      length: 0,
      lengthUnit: 'ft',
      width: 0,
      widthUnit: 'in',
      depth: 36,
      depthUnit: 'in',
      diameter: 12,
      diameterUnit: 'in',
      quantity: 8,
      wasteFactor: 10,
    });
    // Per pier: π × (0.5)² × 3 = π × 0.25 × 3 = 2.356 cu ft
    // 8 piers: 18.85 cu ft × 1.1 = 20.74 cu ft = 0.768 cu yd
    const perPier = Math.PI * 0.25 * 3;
    const totalBase = perPier * 8;
    const totalWithWaste = totalBase * 1.1;
    expect(result.cubicFeet).toBeCloseTo(totalWithWaste, 0);
    expect(result.cubicYards).toBeCloseTo(totalWithWaste / 27, 1);
  });

  // ─── Test 4: Zero dimensions return zero ───
  it('returns zero for zero dimensions', () => {
    const result = calculateConcreteFooting({
      footingType: 'continuous',
      length: 0,
      lengthUnit: 'ft',
      width: 20,
      widthUnit: 'in',
      depth: 12,
      depthUnit: 'in',
      diameter: 0,
      diameterUnit: 'in',
      quantity: 1,
      wasteFactor: 10,
    });
    expect(result.cubicYards).toBe(0);
    expect(result.cubicFeet).toBe(0);
    expect(result.bags60lb).toBe(0);
    expect(result.bags80lb).toBe(0);
  });

  // ─── Test 5: Round footing with zero diameter ───
  it('returns zero for round footing with zero diameter', () => {
    const result = calculateConcreteFooting({
      footingType: 'round',
      length: 0,
      lengthUnit: 'ft',
      width: 0,
      widthUnit: 'in',
      depth: 36,
      depthUnit: 'in',
      diameter: 0,
      diameterUnit: 'in',
      quantity: 4,
      wasteFactor: 10,
    });
    expect(result.cubicYards).toBe(0);
    expect(result.bags80lb).toBe(0);
  });

  // ─── Test 6: Metric inputs ───
  it('handles metric inputs correctly', () => {
    const result = calculateConcreteFooting({
      footingType: 'continuous',
      length: 12,        // 12 meters ≈ 39.37 ft
      lengthUnit: 'm',
      width: 50,         // 50 cm ≈ 19.69 in → 1.64 ft
      widthUnit: 'in',   // Actually passing 50 as inches for this test
      depth: 30,         // 30 cm ≈ 11.81 in
      depthUnit: 'cm',
      diameter: 0,
      diameterUnit: 'in',
      quantity: 1,
      wasteFactor: 0,
    });
    // length: 12 × 3.28084 = 39.37 ft
    // width: 50 in = 4.167 ft
    // depth: 30 × 0.393701 = 11.81 in = 0.984 ft
    const expectedLFt = 12 * 3.28084;
    const expectedWFt = 50 / 12;
    const expectedDFt = (30 * 0.393701) / 12;
    const expectedCuFt = expectedLFt * expectedWFt * expectedDFt;
    expect(result.cubicFeet).toBeCloseTo(expectedCuFt, 0);
  });

  // ─── Test 7: Waste factor comparison 0% vs 10% ───
  it('waste factor adds exactly 10% more volume', () => {
    const noWaste = calculateConcreteFooting({
      footingType: 'continuous',
      length: 40,
      lengthUnit: 'ft',
      width: 20,
      widthUnit: 'in',
      depth: 12,
      depthUnit: 'in',
      diameter: 0,
      diameterUnit: 'in',
      quantity: 1,
      wasteFactor: 0,
    });
    const withWaste = calculateConcreteFooting({
      footingType: 'continuous',
      length: 40,
      lengthUnit: 'ft',
      width: 20,
      widthUnit: 'in',
      depth: 12,
      depthUnit: 'in',
      diameter: 0,
      diameterUnit: 'in',
      quantity: 1,
      wasteFactor: 10,
    });
    expect(withWaste.cubicFeet).toBeCloseTo((noWaste.cubicFeet as number) * 1.1, 1);
  });

  // ─── Test 8: Bag counts for continuous footing ───
  it('calculates bag counts correctly for continuous footing', () => {
    const result = calculateConcreteFooting({
      footingType: 'continuous',
      length: 40,
      lengthUnit: 'ft',
      width: 20,
      widthUnit: 'in',
      depth: 12,
      depthUnit: 'in',
      diameter: 0,
      diameterUnit: 'in',
      quantity: 1,
      wasteFactor: 10,
    });
    // Total cu ft ≈ 73.33
    const totalCuFt = 40 * (20 / 12) * 1 * 1.1;
    expect(result.bags60lb).toBe(Math.ceil(totalCuFt / 0.45));
    expect(result.bags80lb).toBe(Math.ceil(totalCuFt / 0.60));
  });

  // ─── Test 9: Single rectangular footing vs multiple ───
  it('quantity multiplies volume for rectangular footings', () => {
    const single = calculateConcreteFooting({
      footingType: 'rectangular',
      length: 2,
      lengthUnit: 'ft',
      width: 2,
      widthUnit: 'ft',
      depth: 12,
      depthUnit: 'in',
      diameter: 0,
      diameterUnit: 'in',
      quantity: 1,
      wasteFactor: 0,
    });
    const four = calculateConcreteFooting({
      footingType: 'rectangular',
      length: 2,
      lengthUnit: 'ft',
      width: 2,
      widthUnit: 'ft',
      depth: 12,
      depthUnit: 'in',
      diameter: 0,
      diameterUnit: 'in',
      quantity: 4,
      wasteFactor: 0,
    });
    expect(four.cubicFeet).toBeCloseTo((single.cubicFeet as number) * 4, 1);
    expect(four.cubicYards).toBeCloseTo((single.cubicYards as number) * 4, 1);
  });

  // ─── Test 10: Large continuous footing — 100 ft ───
  it('calculates a large 100-ft continuous footing', () => {
    const result = calculateConcreteFooting({
      footingType: 'continuous',
      length: 100,
      lengthUnit: 'ft',
      width: 24,
      widthUnit: 'in',
      depth: 12,
      depthUnit: 'in',
      diameter: 0,
      diameterUnit: 'in',
      quantity: 1,
      wasteFactor: 10,
    });
    // 100 × 2 × 1 = 200 cu ft × 1.1 = 220 cu ft = 8.15 cu yd
    expect(result.cubicFeet).toBeCloseTo(220, 0);
    expect(result.cubicYards).toBeCloseTo(8.15, 0);
  });

  // ─── Test 11: Very deep footing (48 inches) ───
  it('handles very deep 48-inch footings', () => {
    const result = calculateConcreteFooting({
      footingType: 'rectangular',
      length: 3,
      lengthUnit: 'ft',
      width: 3,
      widthUnit: 'ft',
      depth: 48,
      depthUnit: 'in',
      diameter: 0,
      diameterUnit: 'in',
      quantity: 1,
      wasteFactor: 0,
    });
    // 3 × 3 × 4 = 36 cu ft = 1.333 cu yd
    expect(result.cubicFeet).toBeCloseTo(36, 0);
    expect(result.cubicYards).toBeCloseTo(1.33, 1);
  });

  // ─── Test 12: Very small footing ───
  it('handles a very small 12×12×8 footing', () => {
    const result = calculateConcreteFooting({
      footingType: 'rectangular',
      length: 1,
      lengthUnit: 'ft',
      width: 12,
      widthUnit: 'in',
      depth: 8,
      depthUnit: 'in',
      diameter: 0,
      diameterUnit: 'in',
      quantity: 1,
      wasteFactor: 0,
    });
    // 1 × 1 × (8/12) = 0.667 cu ft = 0.025 cu yd
    expect(result.cubicFeet).toBeCloseTo(0.67, 1);
    expect(result.cubicYards).toBeCloseTo(0.02, 1);
    expect(result.bags80lb).toBeGreaterThanOrEqual(1);
  });

  // ─── Test 13: Cost estimate structure ───
  it('returns cost estimates with correct labels', () => {
    const result = calculateConcreteFooting({
      footingType: 'continuous',
      length: 40,
      lengthUnit: 'ft',
      width: 20,
      widthUnit: 'in',
      depth: 12,
      depthUnit: 'in',
      diameter: 0,
      diameterUnit: 'in',
      quantity: 1,
      wasteFactor: 10,
    });
    const costs = result.costEstimate as Array<{ label: string; value: number }>;
    expect(costs).toHaveLength(3);
    expect(costs[0].label).toBe('Ready-Mix Delivery');
    expect(costs[1].label).toBe('60-lb Bags');
    expect(costs[2].label).toBe('80-lb Bags');
    expect(costs[0].value).toBeGreaterThan(0);
  });

  // ─── Test 14: Volume per footing output ───
  it('outputs volume per footing for rectangular type', () => {
    const result = calculateConcreteFooting({
      footingType: 'rectangular',
      length: 3,
      lengthUnit: 'ft',
      width: 3,
      widthUnit: 'ft',
      depth: 12,
      depthUnit: 'in',
      diameter: 0,
      diameterUnit: 'in',
      quantity: 4,
      wasteFactor: 0,
    });
    // Per footing: 3 × 3 × 1 = 9 cu ft = 0.333 cu yd
    expect(result.volumePerFooting).toBeCloseTo(0.333, 2);
  });

  // ─── Test 15: Output structure has all expected keys ───
  it('returns all expected output fields', () => {
    const result = calculateConcreteFooting({
      footingType: 'continuous',
      length: 40,
      lengthUnit: 'ft',
      width: 20,
      widthUnit: 'in',
      depth: 12,
      depthUnit: 'in',
      diameter: 0,
      diameterUnit: 'in',
      quantity: 1,
      wasteFactor: 10,
    });
    expect(result).toHaveProperty('cubicYards');
    expect(result).toHaveProperty('cubicFeet');
    expect(result).toHaveProperty('bags80lb');
    expect(result).toHaveProperty('bags60lb');
    expect(result).toHaveProperty('volumePerFooting');
    expect(result).toHaveProperty('costEstimate');
    expect(result).toHaveProperty('yardWithoutWaste');
  });

  // ─── Test 16: Round footing π verification ───
  it('round footing uses correct π × r² formula', () => {
    const result = calculateConcreteFooting({
      footingType: 'round',
      length: 0,
      lengthUnit: 'ft',
      width: 0,
      widthUnit: 'in',
      depth: 12,
      depthUnit: 'in',
      diameter: 24,     // 24" dia = 2 ft, r = 1 ft
      diameterUnit: 'in',
      quantity: 1,
      wasteFactor: 0,
    });
    // V = π × 1² × 1 = π = 3.14159 cu ft = 0.1164 cu yd
    expect(result.cubicFeet).toBeCloseTo(Math.PI, 1);
    expect(result.cubicYards).toBeCloseTo(Math.PI / 27, 2);
  });

  // ─── Test 17: Continuous footing ignores quantity ───
  it('continuous footing ignores quantity (length IS the total)', () => {
    const qty1 = calculateConcreteFooting({
      footingType: 'continuous',
      length: 40,
      lengthUnit: 'ft',
      width: 20,
      widthUnit: 'in',
      depth: 12,
      depthUnit: 'in',
      diameter: 0,
      diameterUnit: 'in',
      quantity: 1,
      wasteFactor: 0,
    });
    const qty5 = calculateConcreteFooting({
      footingType: 'continuous',
      length: 40,
      lengthUnit: 'ft',
      width: 20,
      widthUnit: 'in',
      depth: 12,
      depthUnit: 'in',
      diameter: 0,
      diameterUnit: 'in',
      quantity: 5,
      wasteFactor: 0,
    });
    // Continuous footing: quantity is ignored, length defines the run
    expect(qty1.cubicFeet).toBe(qty5.cubicFeet);
  });

  // ─── Test 18: Round pier single vs multiple ───
  it('multiplies round pier volume by quantity', () => {
    const single = calculateConcreteFooting({
      footingType: 'round',
      length: 0,
      lengthUnit: 'ft',
      width: 0,
      widthUnit: 'in',
      depth: 36,
      depthUnit: 'in',
      diameter: 12,
      diameterUnit: 'in',
      quantity: 1,
      wasteFactor: 0,
    });
    const eight = calculateConcreteFooting({
      footingType: 'round',
      length: 0,
      lengthUnit: 'ft',
      width: 0,
      widthUnit: 'in',
      depth: 36,
      depthUnit: 'in',
      diameter: 12,
      diameterUnit: 'in',
      quantity: 8,
      wasteFactor: 0,
    });
    expect(eight.cubicFeet).toBeCloseTo((single.cubicFeet as number) * 8, 1);
  });

  // ─── Test 19: Waste factor clamped at 25% ───
  it('clamps waste factor at 25% maximum', () => {
    const result50 = calculateConcreteFooting({
      footingType: 'continuous',
      length: 40,
      lengthUnit: 'ft',
      width: 20,
      widthUnit: 'in',
      depth: 12,
      depthUnit: 'in',
      diameter: 0,
      diameterUnit: 'in',
      quantity: 1,
      wasteFactor: 50,
    });
    const result25 = calculateConcreteFooting({
      footingType: 'continuous',
      length: 40,
      lengthUnit: 'ft',
      width: 20,
      widthUnit: 'in',
      depth: 12,
      depthUnit: 'in',
      diameter: 0,
      diameterUnit: 'in',
      quantity: 1,
      wasteFactor: 25,
    });
    expect(result50.cubicYards).toBe(result25.cubicYards);
  });

  // ─── Test 20: Depth in cm for round footing ───
  it('converts depth from cm for round footings', () => {
    const result = calculateConcreteFooting({
      footingType: 'round',
      length: 0,
      lengthUnit: 'ft',
      width: 0,
      widthUnit: 'in',
      depth: 91.44,     // 91.44 cm = 36 in = 3 ft
      depthUnit: 'cm',
      diameter: 12,
      diameterUnit: 'in',
      quantity: 1,
      wasteFactor: 0,
    });
    // diameter 12 in = 1 ft, r = 0.5 ft
    // depth 91.44 cm × 0.393701 = 36 in = 3 ft
    // V = π × 0.25 × 3 = 2.356 cu ft
    const expectedDepthFt = (91.44 * 0.393701) / 12;
    const expectedCuFt = Math.PI * 0.25 * expectedDepthFt;
    expect(result.cubicFeet).toBeCloseTo(expectedCuFt, 0);
  });
});
