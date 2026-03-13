import { calculateAsphalt } from '@/lib/formulas/construction/asphalt';

describe('calculateAsphalt', () => {
  // ─── Test 1: Standard driveway 40×12 at 3 inches, 10% waste ───
  it('calculates a standard 40×12 driveway at 3 inches with 10% waste', () => {
    const result = calculateAsphalt({
      length: 40,
      lengthUnit: 'ft',
      width: 12,
      widthUnit: 'ft',
      thickness: 3,
      thicknessUnit: 'in',
      asphaltType: 'hot-mix',
      wasteFactor: 10,
    });
    // Base volume: 40 × 12 × (3/12) = 120 cu ft
    // Base tons: 120 × 145 / 2000 = 8.7 tons
    // With 10% waste: 8.7 × 1.1 = 9.57 tons
    expect(result.tons).toBeCloseTo(9.57, 1);
    expect(result.squareFeet).toBe(480);
    expect(result.squareYards).toBeCloseTo(53.33, 1);
  });

  // ─── Test 2: Parking lot 100×60 at 4 inches ───
  it('calculates a 100×60 parking lot at 4 inches', () => {
    const result = calculateAsphalt({
      length: 100,
      lengthUnit: 'ft',
      width: 60,
      widthUnit: 'ft',
      thickness: 4,
      thicknessUnit: 'in',
      asphaltType: 'hot-mix',
      wasteFactor: 10,
    });
    // Base volume: 100 × 60 × (4/12) = 2000 cu ft
    // Base tons: 2000 × 145 / 2000 = 145 tons
    // With 10%: 159.5 tons
    expect(result.tons).toBeCloseTo(159.5, 0);
    expect(result.squareFeet).toBe(6000);
  });

  // ─── Test 3: Thin overlay 1.5 inches ───
  it('calculates a thin 1.5-inch overlay', () => {
    const result = calculateAsphalt({
      length: 40,
      lengthUnit: 'ft',
      width: 12,
      widthUnit: 'ft',
      thickness: 1.5,
      thicknessUnit: 'in',
      asphaltType: 'hot-mix',
      wasteFactor: 10,
    });
    // Base volume: 40 × 12 × (1.5/12) = 60 cu ft
    // Base tons: 60 × 145 / 2000 = 4.35
    // With 10%: 4.785
    expect(result.tons).toBeCloseTo(4.79, 1);
  });

  // ─── Test 4: Thick base layer 6 inches ───
  it('calculates a thick 6-inch base layer', () => {
    const result = calculateAsphalt({
      length: 40,
      lengthUnit: 'ft',
      width: 12,
      widthUnit: 'ft',
      thickness: 6,
      thicknessUnit: 'in',
      asphaltType: 'hot-mix',
      wasteFactor: 10,
    });
    // Base volume: 40 × 12 × (6/12) = 240 cu ft
    // Base tons: 240 × 145 / 2000 = 17.4
    // With 10%: 19.14
    expect(result.tons).toBeCloseTo(19.14, 1);
    expect(result.cubicFeet).toBeCloseTo(264, 0);
  });

  // ─── Test 5: Zero dimensions → 0 ───
  it('returns zero for zero dimensions', () => {
    const result = calculateAsphalt({
      length: 0,
      lengthUnit: 'ft',
      width: 12,
      widthUnit: 'ft',
      thickness: 3,
      thicknessUnit: 'in',
      asphaltType: 'hot-mix',
      wasteFactor: 10,
    });
    expect(result.tons).toBe(0);
    expect(result.cubicFeet).toBe(0);
    expect(result.cubicYards).toBe(0);
    expect(result.squareFeet).toBe(0);
  });

  // ─── Test 6: Zero width → 0 ───
  it('returns zero for zero width', () => {
    const result = calculateAsphalt({
      length: 40,
      lengthUnit: 'ft',
      width: 0,
      widthUnit: 'ft',
      thickness: 3,
      thicknessUnit: 'in',
      asphaltType: 'hot-mix',
      wasteFactor: 10,
    });
    expect(result.tons).toBe(0);
    expect(result.squareFeet).toBe(0);
  });

  // ─── Test 7: Metric inputs ───
  it('converts metric inputs correctly', () => {
    const result = calculateAsphalt({
      length: 12,       // 12 m ≈ 39.37 ft
      lengthUnit: 'm',
      width: 3.6,       // 3.6 m ≈ 11.81 ft
      widthUnit: 'm',
      thickness: 7.62,  // 7.62 cm ≈ 3 in
      thicknessUnit: 'cm',
      asphaltType: 'hot-mix',
      wasteFactor: 10,
    });
    // Approximately similar to 40×12 at 3"
    expect(result.tons).toBeGreaterThan(8);
    expect(result.tons).toBeLessThan(11);
    expect(result.squareFeet).toBeGreaterThan(400);
  });

  // ─── Test 8: Tons accuracy with no waste ───
  it('calculates exact tonnage without waste', () => {
    const result = calculateAsphalt({
      length: 40,
      lengthUnit: 'ft',
      width: 12,
      widthUnit: 'ft',
      thickness: 3,
      thicknessUnit: 'in',
      asphaltType: 'hot-mix',
      wasteFactor: 5, // minimum
    });
    // Base tons: 120 × 145 / 2000 = 8.7
    // With 5%: 8.7 × 1.05 = 9.135
    expect(result.tons).toBeCloseTo(9.14, 1);
    expect(result.tonsWithoutWaste).toBeCloseTo(8.7, 1);
  });

  // ─── Test 9: Cost estimate structure ───
  it('returns cost estimates in correct order with valid values', () => {
    const result = calculateAsphalt({
      length: 40,
      lengthUnit: 'ft',
      width: 12,
      widthUnit: 'ft',
      thickness: 3,
      thicknessUnit: 'in',
      asphaltType: 'hot-mix',
      wasteFactor: 10,
    });
    const costs = result.costEstimate as Array<{ label: string; value: number }>;
    expect(costs).toHaveLength(4);
    expect(costs[0].label).toContain('Material Only');
    expect(costs[0].label).toContain('Low');
    expect(costs[1].label).toContain('Material Only');
    expect(costs[1].label).toContain('High');
    expect(costs[2].label).toContain('Installed');
    expect(costs[2].label).toContain('Low');
    expect(costs[3].label).toContain('Installed');
    expect(costs[3].label).toContain('High');
    // Material low < material high
    expect(costs[0].value).toBeLessThan(costs[1].value);
    // Installed low < installed high
    expect(costs[2].value).toBeLessThan(costs[3].value);
  });

  // ─── Test 10: Waste impact — 10% adds exactly 10% ───
  it('10% waste adds exactly 10% more tonnage', () => {
    const min = calculateAsphalt({
      length: 40, lengthUnit: 'ft', width: 12, widthUnit: 'ft',
      thickness: 3, thicknessUnit: 'in', asphaltType: 'hot-mix', wasteFactor: 5,
    });
    const mid = calculateAsphalt({
      length: 40, lengthUnit: 'ft', width: 12, widthUnit: 'ft',
      thickness: 3, thicknessUnit: 'in', asphaltType: 'hot-mix', wasteFactor: 10,
    });
    // Both share same tonsWithoutWaste
    expect(min.tonsWithoutWaste).toBe(mid.tonsWithoutWaste);
    // 10% waste vs 5% waste
    const baseTons = mid.tonsWithoutWaste as number;
    expect(mid.tons).toBeCloseTo(baseTons * 1.1, 1);
    expect(min.tons).toBeCloseTo(baseTons * 1.05, 1);
  });

  // ─── Test 11: Square yards ───
  it('calculates square yards correctly', () => {
    const result = calculateAsphalt({
      length: 27,
      lengthUnit: 'ft',
      width: 9,
      widthUnit: 'ft',
      thickness: 3,
      thicknessUnit: 'in',
      asphaltType: 'hot-mix',
      wasteFactor: 10,
    });
    // Area: 27 × 9 = 243 sq ft, sq yd = 243 / 9 = 27
    expect(result.squareFeet).toBe(243);
    expect(result.squareYards).toBe(27);
  });

  // ─── Test 12: Cubic yards ───
  it('calculates cubic yards correctly', () => {
    const result = calculateAsphalt({
      length: 40,
      lengthUnit: 'ft',
      width: 12,
      widthUnit: 'ft',
      thickness: 3,
      thicknessUnit: 'in',
      asphaltType: 'hot-mix',
      wasteFactor: 10,
    });
    // Base vol: 120 cu ft, with 10% = 132 cu ft, / 27 = 4.89 cu yd
    expect(result.cubicYards).toBeCloseTo(4.89, 1);
    expect(result.cubicFeet).toBeCloseTo(132, 0);
  });

  // ─── Test 13: Cold-patch same density ───
  it('cold-patch uses same density calculation', () => {
    const hotMix = calculateAsphalt({
      length: 40, lengthUnit: 'ft', width: 12, widthUnit: 'ft',
      thickness: 3, thicknessUnit: 'in', asphaltType: 'hot-mix', wasteFactor: 10,
    });
    const coldPatch = calculateAsphalt({
      length: 40, lengthUnit: 'ft', width: 12, widthUnit: 'ft',
      thickness: 3, thicknessUnit: 'in', asphaltType: 'cold-patch', wasteFactor: 10,
    });
    // Same density for planning purposes
    expect(hotMix.tons).toBe(coldPatch.tons);
  });

  // ─── Test 14: Very large area — commercial lot ───
  it('handles very large commercial parking lot', () => {
    const result = calculateAsphalt({
      length: 500,
      lengthUnit: 'ft',
      width: 200,
      widthUnit: 'ft',
      thickness: 4,
      thicknessUnit: 'in',
      asphaltType: 'hot-mix',
      wasteFactor: 10,
    });
    // Base: 500 × 200 × (4/12) = 33333.33 cu ft
    // Base tons: 33333.33 × 145 / 2000 = 2416.67
    // With 10%: 2658.33
    expect(result.tons).toBeCloseTo(2658.33, 0);
    expect(result.squareFeet).toBe(100000);
  });

  // ─── Test 15: Small patch ───
  it('handles a small 5×5 patch at 2 inches', () => {
    const result = calculateAsphalt({
      length: 5,
      lengthUnit: 'ft',
      width: 5,
      widthUnit: 'ft',
      thickness: 2,
      thicknessUnit: 'in',
      asphaltType: 'cold-patch',
      wasteFactor: 10,
    });
    // Base: 5 × 5 × (2/12) = 4.167 cu ft
    // Base tons: 4.167 × 145 / 2000 = 0.302
    // With 10%: 0.332
    expect(result.tons).toBeCloseTo(0.33, 1);
    expect(result.squareFeet).toBe(25);
  });

  // ─── Test 16: Output structure ───
  it('returns all expected output fields', () => {
    const result = calculateAsphalt({
      length: 40,
      lengthUnit: 'ft',
      width: 12,
      widthUnit: 'ft',
      thickness: 3,
      thicknessUnit: 'in',
      asphaltType: 'hot-mix',
      wasteFactor: 10,
    });
    expect(result).toHaveProperty('tons');
    expect(result).toHaveProperty('cubicYards');
    expect(result).toHaveProperty('cubicFeet');
    expect(result).toHaveProperty('squareFeet');
    expect(result).toHaveProperty('squareYards');
    expect(result).toHaveProperty('costEstimate');
    expect(result).toHaveProperty('tonsWithoutWaste');
  });

  // ─── Test 17: Waste clamped at minimum 5% ───
  it('clamps waste factor at 5% minimum', () => {
    const result = calculateAsphalt({
      length: 40, lengthUnit: 'ft', width: 12, widthUnit: 'ft',
      thickness: 3, thicknessUnit: 'in', asphaltType: 'hot-mix', wasteFactor: 0,
    });
    const result5 = calculateAsphalt({
      length: 40, lengthUnit: 'ft', width: 12, widthUnit: 'ft',
      thickness: 3, thicknessUnit: 'in', asphaltType: 'hot-mix', wasteFactor: 5,
    });
    expect(result.tons).toBe(result5.tons);
  });

  // ─── Test 18: Waste clamped at maximum 20% ───
  it('clamps waste factor at 20% maximum', () => {
    const result = calculateAsphalt({
      length: 40, lengthUnit: 'ft', width: 12, widthUnit: 'ft',
      thickness: 3, thicknessUnit: 'in', asphaltType: 'hot-mix', wasteFactor: 30,
    });
    const result20 = calculateAsphalt({
      length: 40, lengthUnit: 'ft', width: 12, widthUnit: 'ft',
      thickness: 3, thicknessUnit: 'in', asphaltType: 'hot-mix', wasteFactor: 20,
    });
    expect(result.tons).toBe(result20.tons);
  });

  // ─── Test 19: Installed cost accuracy ───
  it('calculates installed cost as area × rate', () => {
    const result = calculateAsphalt({
      length: 40,
      lengthUnit: 'ft',
      width: 12,
      widthUnit: 'ft',
      thickness: 3,
      thicknessUnit: 'in',
      asphaltType: 'hot-mix',
      wasteFactor: 10,
    });
    const costs = result.costEstimate as Array<{ label: string; value: number }>;
    // Installed low = 480 × $3 = $1440
    expect(costs[2].value).toBe(1440);
    // Installed high = 480 × $7 = $3360
    expect(costs[3].value).toBe(3360);
  });

  // ─── Test 20: Recycled type works the same ───
  it('recycled asphalt uses same tonnage calculation', () => {
    const hotMix = calculateAsphalt({
      length: 40, lengthUnit: 'ft', width: 12, widthUnit: 'ft',
      thickness: 3, thicknessUnit: 'in', asphaltType: 'hot-mix', wasteFactor: 10,
    });
    const recycled = calculateAsphalt({
      length: 40, lengthUnit: 'ft', width: 12, widthUnit: 'ft',
      thickness: 3, thicknessUnit: 'in', asphaltType: 'recycled', wasteFactor: 10,
    });
    expect(hotMix.tons).toBe(recycled.tons);
  });
});
