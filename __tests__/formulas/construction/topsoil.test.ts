import { calculateTopsoil } from '@/lib/formulas/construction/topsoil';

describe('calculateTopsoil', () => {
  // ─── Test 1: Standard 10×10 at 4 inches ───
  it('calculates a standard 10×10 garden bed at 4 inches depth', () => {
    const result = calculateTopsoil({
      length: 10,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      depth: 4,
      depthUnit: 'in',
    });
    // Area = 100 sq ft
    expect(result.coverage).toBe(100);
    // Volume = 100 × (4/12) = 33.333 cu ft
    expect(result.cubicFeet).toBeCloseTo(33.3, 0);
    // Cubic yards = 33.333 / 27 = 1.2346
    expect(result.cubicYards).toBeCloseTo(1.23, 1);
    // Tons = 1.2346 × 1.1 = 1.358
    expect(result.tons).toBeCloseTo(1.36, 1);
  });

  // ─── Test 2: Large area — 100×50 at 4 inches ───
  it('calculates a large 100×50 area correctly', () => {
    const result = calculateTopsoil({
      length: 100,
      lengthUnit: 'ft',
      width: 50,
      widthUnit: 'ft',
      depth: 4,
      depthUnit: 'in',
    });
    // Area = 5000 sq ft
    expect(result.coverage).toBe(5000);
    // Volume = 5000 × (4/12) = 1666.67 cu ft = 61.73 cu yd
    expect(result.cubicYards).toBeCloseTo(61.73, 0);
    // Tons = 61.73 × 1.1 = 67.90
    expect(result.tons).toBeCloseTo(67.9, 0);
  });

  // ─── Test 3: Thin depth — 1 inch ───
  it('handles a thin 1-inch depth', () => {
    const result = calculateTopsoil({
      length: 10,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      depth: 1,
      depthUnit: 'in',
    });
    // Volume = 100 × (1/12) = 8.333 cu ft = 0.309 cu yd
    expect(result.cubicFeet).toBeCloseTo(8.3, 0);
    expect(result.cubicYards).toBeCloseTo(0.31, 1);
    expect(result.depthInInches).toBe(1);
  });

  // ─── Test 4: Deep fill — 12 inches ───
  it('handles a deep 12-inch fill', () => {
    const result = calculateTopsoil({
      length: 10,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      depth: 12,
      depthUnit: 'in',
    });
    // Volume = 100 × (12/12) = 100 cu ft = 3.70 cu yd
    expect(result.cubicFeet).toBeCloseTo(100.0, 0);
    expect(result.cubicYards).toBeCloseTo(3.70, 1);
    // Tons = 3.70 × 1.1 = 4.07
    expect(result.tons).toBeCloseTo(4.07, 1);
  });

  // ─── Test 5: Unit conversion — meters ───
  it('converts meters to feet correctly', () => {
    const result = calculateTopsoil({
      length: 3.048,     // ~10 ft
      lengthUnit: 'm',
      width: 3.048,      // ~10 ft
      widthUnit: 'm',
      depth: 4,
      depthUnit: 'in',
    });
    // 3.048 m × 3.28084 ≈ 10.0 ft
    expect(result.coverage).toBeCloseTo(100, -1);
    expect(result.cubicFeet).toBeCloseTo(33.3, 0);
  });

  // ─── Test 6: Unit conversion — depth in centimeters ───
  it('converts depth from centimeters correctly', () => {
    const result = calculateTopsoil({
      length: 10,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      depth: 10.16,      // 4 inches = 10.16 cm
      depthUnit: 'cm',
    });
    // 10.16 cm × 0.393701 = ~4.0 inches
    expect(result.depthInInches).toBeCloseTo(4.0, 0);
    expect(result.cubicFeet).toBeCloseTo(33.3, 0);
  });

  // ─── Test 7: Zero dimensions ───
  it('returns zero outputs for zero dimensions', () => {
    const result = calculateTopsoil({
      length: 0,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      depth: 4,
      depthUnit: 'in',
    });
    expect(result.cubicYards).toBe(0);
    expect(result.cubicFeet).toBe(0);
    expect(result.tons).toBe(0);
    expect(result.bags40lb).toBe(0);
    expect(result.coverage).toBe(0);
  });

  // ─── Test 8: Cubic yards accuracy ───
  it('calculates cubic yards with correct precision', () => {
    const result = calculateTopsoil({
      length: 20,
      lengthUnit: 'ft',
      width: 15,
      widthUnit: 'ft',
      depth: 6,
      depthUnit: 'in',
    });
    // Volume = 300 × 0.5 = 150 cu ft = 5.556 cu yd
    expect(result.cubicYards).toBe(5.56);
    expect(result.cubicFeet).toBe(150.0);
  });

  // ─── Test 9: Tons calculation — 1.1 factor ───
  it('applies the 1.1 tons per cubic yard factor correctly', () => {
    const result = calculateTopsoil({
      length: 27,        // produces exactly 1 cu yd at 12" depth
      lengthUnit: 'ft',
      width: 1,
      widthUnit: 'ft',
      depth: 12,
      depthUnit: 'in',
    });
    // 27 × 1 × 1 = 27 cu ft = 1.00 cu yd
    expect(result.cubicYards).toBe(1);
    // Tons = 1.0 × 1.1 = 1.1
    expect(result.tons).toBe(1.1);
  });

  // ─── Test 10: Bag count ───
  it('calculates bag count based on weight', () => {
    const result = calculateTopsoil({
      length: 27,
      lengthUnit: 'ft',
      width: 1,
      widthUnit: 'ft',
      depth: 12,
      depthUnit: 'in',
    });
    // 1 cu yd → 1.1 tons → 2200 lbs → ceil(2200/40) = 55 bags
    expect(result.bags40lb).toBe(55);
  });

  // ─── Test 11: Cost ordering ───
  it('returns cost estimates in ascending order with bagged highest', () => {
    const result = calculateTopsoil({
      length: 10,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      depth: 4,
      depthUnit: 'in',
    });
    const cost = result.costEstimate as Array<{ label: string; value: number }>;
    expect(cost).toHaveLength(4);
    // Bulk Low < Bulk Mid < Bulk High
    expect(cost[0].value).toBeLessThan(cost[1].value);
    expect(cost[1].value).toBeLessThan(cost[2].value);
    // All bulk should be > 0
    expect(cost[0].value).toBeGreaterThan(0);
    // Bagged is the fourth entry
    expect(cost[3].label).toContain('Bagged');
  });

  // ─── Test 12: Coverage area ───
  it('returns the correct coverage area in square feet', () => {
    const result = calculateTopsoil({
      length: 25,
      lengthUnit: 'ft',
      width: 12,
      widthUnit: 'ft',
      depth: 4,
      depthUnit: 'in',
    });
    expect(result.coverage).toBe(300);
  });

  // ─── Test 13: Very small area ───
  it('handles a very small 2×2 area at 2 inches', () => {
    const result = calculateTopsoil({
      length: 2,
      lengthUnit: 'ft',
      width: 2,
      widthUnit: 'ft',
      depth: 2,
      depthUnit: 'in',
    });
    // Volume = 4 × (2/12) = 0.667 cu ft = 0.0247 cu yd
    expect(result.cubicFeet).toBeCloseTo(0.7, 0);
    expect(result.cubicYards).toBeCloseTo(0.02, 1);
    // Even small amounts produce at least 1 bag
    expect(result.bags40lb).toBeGreaterThanOrEqual(1);
  });

  // ─── Test 14: Output structure ───
  it('returns all expected output fields', () => {
    const result = calculateTopsoil({
      length: 10,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      depth: 4,
      depthUnit: 'in',
    });
    expect(result).toHaveProperty('cubicYards');
    expect(result).toHaveProperty('cubicFeet');
    expect(result).toHaveProperty('tons');
    expect(result).toHaveProperty('bags40lb');
    expect(result).toHaveProperty('costEstimate');
    expect(result).toHaveProperty('coverage');
    expect(result).toHaveProperty('depthInInches');
  });

  // ─── Test 15: Cost estimates present and positive ───
  it('returns positive cost estimates for non-zero input', () => {
    const result = calculateTopsoil({
      length: 10,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      depth: 4,
      depthUnit: 'in',
    });
    const cost = result.costEstimate as Array<{ label: string; value: number }>;
    for (const item of cost) {
      expect(item.value).toBeGreaterThan(0);
    }
    // Verify cost labels
    expect(cost[0].label).toBe('Bulk Delivery (Low)');
    expect(cost[1].label).toBe('Bulk Delivery (Mid)');
    expect(cost[2].label).toBe('Bulk Delivery (High)');
    expect(cost[3].label).toBe('Bagged (approx)');
  });

  // ─── Test 16: Depth in feet ───
  it('handles depth specified in feet', () => {
    const result = calculateTopsoil({
      length: 10,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      depth: 1,
      depthUnit: 'ft',
    });
    // 1 ft = 12 inches → volume = 100 × 1 = 100 cu ft
    expect(result.depthInInches).toBe(12);
    expect(result.cubicFeet).toBe(100.0);
    expect(result.cubicYards).toBeCloseTo(3.70, 1);
  });
});
