import { calculateCubicYard } from '@/lib/formulas/construction/cubic-yard';

describe('calculateCubicYard', () => {
  // ─── Test 1: Standard rectangular 10×10 at 4" ───
  it('calculates a standard 10×10 rectangular area at 4 inches', () => {
    const result = calculateCubicYard({
      shape: 'rectangular',
      length: 10, lengthUnit: 'ft',
      width: 10, widthUnit: 'ft',
      depth: 4, depthUnit: 'in',
      diameter: 0, diameterUnit: 'ft',
    });
    // V = 10 × 10 × (4/12) = 33.333 cu ft
    // Cu yd = 33.333/27 = 1.2346 → 1.23
    expect(result.cubicYards).toBeCloseTo(1.23, 1);
    expect(result.cubicFeet).toBeCloseTo(33.33, 0);
    expect(result.area).toBe(100);
  });

  // ─── Test 2: Circular area ───
  it('calculates circular area correctly', () => {
    const result = calculateCubicYard({
      shape: 'circular',
      length: 0, lengthUnit: 'ft',
      width: 0, widthUnit: 'ft',
      depth: 4, depthUnit: 'in',
      diameter: 10, diameterUnit: 'ft',
    });
    // Area = π × 5² = 78.54 sq ft
    // V = 78.54 × (4/12) = 26.18 cu ft
    // Cu yd = 26.18/27 = 0.97
    expect(result.area).toBeCloseTo(78.54, 1);
    expect(result.cubicYards).toBeCloseTo(0.97, 1);
  });

  // ─── Test 3: Triangular area ───
  it('calculates triangular area correctly', () => {
    const result = calculateCubicYard({
      shape: 'triangular',
      length: 10, lengthUnit: 'ft',
      width: 10, widthUnit: 'ft',
      depth: 4, depthUnit: 'in',
      diameter: 0, diameterUnit: 'ft',
    });
    // Area = 0.5 × 10 × 10 = 50 sq ft
    // V = 50 × (4/12) = 16.667 cu ft
    // Cu yd = 16.667/27 = 0.617 → 0.62
    expect(result.area).toBe(50);
    expect(result.cubicYards).toBeCloseTo(0.62, 1);
    // Should be half the rectangular result
    const rect = calculateCubicYard({
      shape: 'rectangular',
      length: 10, lengthUnit: 'ft', width: 10, widthUnit: 'ft',
      depth: 4, depthUnit: 'in', diameter: 0, diameterUnit: 'ft',
    });
    expect(result.cubicFeet).toBeCloseTo((rect.cubicFeet as number) / 2, 1);
  });

  // ─── Test 4: Deep depth (12 inches = 1 ft) ───
  it('handles 12-inch (1 foot) depth correctly', () => {
    const result = calculateCubicYard({
      shape: 'rectangular',
      length: 10, lengthUnit: 'ft', width: 10, widthUnit: 'ft',
      depth: 12, depthUnit: 'in', diameter: 0, diameterUnit: 'ft',
    });
    // V = 10 × 10 × 1 = 100 cu ft = 3.70 cu yd
    expect(result.cubicFeet).toBe(100);
    expect(result.cubicYards).toBeCloseTo(3.70, 1);
  });

  // ─── Test 5: Shallow depth (1 inch) ───
  it('handles 1-inch depth correctly', () => {
    const result = calculateCubicYard({
      shape: 'rectangular',
      length: 10, lengthUnit: 'ft', width: 10, widthUnit: 'ft',
      depth: 1, depthUnit: 'in', diameter: 0, diameterUnit: 'ft',
    });
    // V = 10 × 10 × (1/12) = 8.333 cu ft
    expect(result.cubicFeet).toBeCloseTo(8.33, 0);
    expect(result.cubicYards).toBeCloseTo(0.31, 1);
  });

  // ─── Test 6: Large area (100×100) ───
  it('calculates a large 100×100 area', () => {
    const result = calculateCubicYard({
      shape: 'rectangular',
      length: 100, lengthUnit: 'ft', width: 100, widthUnit: 'ft',
      depth: 6, depthUnit: 'in', diameter: 0, diameterUnit: 'ft',
    });
    // V = 100 × 100 × 0.5 = 5000 cu ft = 185.19 cu yd
    expect(result.cubicFeet).toBe(5000);
    expect(result.cubicYards).toBeCloseTo(185.19, 0);
  });

  // ─── Test 7: Zero dimensions return all zeros ───
  it('returns zeros for zero dimensions', () => {
    const result = calculateCubicYard({
      shape: 'rectangular',
      length: 0, lengthUnit: 'ft', width: 0, widthUnit: 'ft',
      depth: 0, depthUnit: 'in', diameter: 0, diameterUnit: 'ft',
    });
    expect(result.cubicYards).toBe(0);
    expect(result.cubicFeet).toBe(0);
    expect(result.cubicMeters).toBe(0);
    expect(result.cubicInches).toBe(0);
    expect(result.area).toBe(0);
  });

  // ─── Test 8: Circular with zero diameter ───
  it('returns zeros for circular area with zero diameter', () => {
    const result = calculateCubicYard({
      shape: 'circular',
      length: 10, lengthUnit: 'ft', width: 10, widthUnit: 'ft',
      depth: 4, depthUnit: 'in', diameter: 0, diameterUnit: 'ft',
    });
    expect(result.cubicYards).toBe(0);
    expect(result.area).toBe(0);
  });

  // ─── Test 9: Metric inputs ───
  it('converts metric inputs correctly', () => {
    const result = calculateCubicYard({
      shape: 'rectangular',
      length: 3.048,    // 10 ft
      lengthUnit: 'm',
      width: 3.048,     // 10 ft
      widthUnit: 'm',
      depth: 10.16,     // 4 inches
      depthUnit: 'cm',
      diameter: 0, diameterUnit: 'ft',
    });
    // Should be close to the 10×10 at 4" result
    expect(result.cubicYards).toBeCloseTo(1.23, 0);
  });

  // ─── Test 10: Cubic feet conversion ───
  it('cubic feet = cubic yards × 27', () => {
    const result = calculateCubicYard({
      shape: 'rectangular',
      length: 10, lengthUnit: 'ft', width: 10, widthUnit: 'ft',
      depth: 4, depthUnit: 'in', diameter: 0, diameterUnit: 'ft',
    });
    expect(result.cubicFeet).toBeCloseTo((result.cubicYards as number) * 27, 0);
  });

  // ─── Test 11: Cubic meters conversion ───
  it('cubic meters = cubic yards × 0.764555', () => {
    const result = calculateCubicYard({
      shape: 'rectangular',
      length: 10, lengthUnit: 'ft', width: 10, widthUnit: 'ft',
      depth: 12, depthUnit: 'in', diameter: 0, diameterUnit: 'ft',
    });
    expect(result.cubicMeters).toBeCloseTo((result.cubicYards as number) * 0.764555, 2);
  });

  // ─── Test 12: Weight estimates — concrete at 150 lb/cu ft ───
  it('calculates concrete weight correctly', () => {
    const result = calculateCubicYard({
      shape: 'rectangular',
      length: 10, lengthUnit: 'ft', width: 10, widthUnit: 'ft',
      depth: 12, depthUnit: 'in', diameter: 0, diameterUnit: 'ft',
    });
    const weights = result.weightEstimate as Array<{ label: string; value: number }>;
    const concrete = weights.find(w => w.label.includes('Concrete'));
    // 100 cu ft × 150 = 15,000 lbs
    expect(concrete!.value).toBe(15000);
  });

  // ─── Test 13: Weight estimates — all 5 materials present ───
  it('returns weight estimates for 5 materials', () => {
    const result = calculateCubicYard({
      shape: 'rectangular',
      length: 10, lengthUnit: 'ft', width: 10, widthUnit: 'ft',
      depth: 4, depthUnit: 'in', diameter: 0, diameterUnit: 'ft',
    });
    const weights = result.weightEstimate as Array<{ label: string; value: number }>;
    expect(weights).toHaveLength(5);
    expect(weights.some(w => w.label.includes('Concrete'))).toBe(true);
    expect(weights.some(w => w.label.includes('Gravel'))).toBe(true);
    expect(weights.some(w => w.label.includes('Topsoil'))).toBe(true);
    expect(weights.some(w => w.label.includes('Mulch'))).toBe(true);
    expect(weights.some(w => w.label.includes('Sand'))).toBe(true);
  });

  // ─── Test 14: Wheelbarrow loads ───
  it('calculates wheelbarrow loads correctly', () => {
    const result = calculateCubicYard({
      shape: 'rectangular',
      length: 10, lengthUnit: 'ft', width: 10, widthUnit: 'ft',
      depth: 4, depthUnit: 'in', diameter: 0, diameterUnit: 'ft',
    });
    const loads = result.loads as Array<{ label: string; value: number }>;
    const wheelbarrow = loads.find(l => l.label.includes('Wheelbarrow'));
    // 33.33 cu ft / 3 = 11.11 → ceil = 12
    expect(wheelbarrow!.value).toBe(12);
  });

  // ─── Test 15: Pickup truck loads ───
  it('calculates pickup truck loads correctly', () => {
    const result = calculateCubicYard({
      shape: 'rectangular',
      length: 10, lengthUnit: 'ft', width: 10, widthUnit: 'ft',
      depth: 4, depthUnit: 'in', diameter: 0, diameterUnit: 'ft',
    });
    const loads = result.loads as Array<{ label: string; value: number }>;
    const pickup = loads.find(l => l.label.includes('Pickup'));
    // 1.23 cu yd / 1.5 = 0.82 → ceil = 1
    expect(pickup!.value).toBe(1);
  });

  // ─── Test 16: Dump truck loads ───
  it('calculates dump truck loads for large volume', () => {
    const result = calculateCubicYard({
      shape: 'rectangular',
      length: 100, lengthUnit: 'ft', width: 100, widthUnit: 'ft',
      depth: 6, depthUnit: 'in', diameter: 0, diameterUnit: 'ft',
    });
    const loads = result.loads as Array<{ label: string; value: number }>;
    const dump = loads.find(l => l.label.includes('Dump'));
    // 185.19 cu yd / 10 = 18.52 → ceil = 19
    expect(dump!.value).toBe(19);
  });

  // ─── Test 17: Depth in feet ───
  it('handles depth in feet correctly', () => {
    const result = calculateCubicYard({
      shape: 'rectangular',
      length: 10, lengthUnit: 'ft', width: 10, widthUnit: 'ft',
      depth: 1, depthUnit: 'ft', diameter: 0, diameterUnit: 'ft',
    });
    // Same as 12 inches
    expect(result.cubicFeet).toBe(100);
    expect(result.cubicYards).toBeCloseTo(3.70, 1);
  });

  // ─── Test 18: Cubic inches conversion ───
  it('calculates cubic inches correctly', () => {
    const result = calculateCubicYard({
      shape: 'rectangular',
      length: 1, lengthUnit: 'ft', width: 1, widthUnit: 'ft',
      depth: 12, depthUnit: 'in', diameter: 0, diameterUnit: 'ft',
    });
    // 1 cu ft = 1728 cu inches
    expect(result.cubicInches).toBe(1728);
  });

  // ─── Test 19: Output structure completeness ───
  it('returns all expected output fields', () => {
    const result = calculateCubicYard({
      shape: 'rectangular',
      length: 10, lengthUnit: 'ft', width: 10, widthUnit: 'ft',
      depth: 4, depthUnit: 'in', diameter: 0, diameterUnit: 'ft',
    });
    expect(result).toHaveProperty('cubicYards');
    expect(result).toHaveProperty('cubicFeet');
    expect(result).toHaveProperty('cubicMeters');
    expect(result).toHaveProperty('cubicInches');
    expect(result).toHaveProperty('area');
    expect(result).toHaveProperty('weightEstimate');
    expect(result).toHaveProperty('loads');
  });

  // ─── Test 20: Zero volume weight and loads are zero ───
  it('returns zero weights and zero loads for zero volume', () => {
    const result = calculateCubicYard({
      shape: 'rectangular',
      length: 10, lengthUnit: 'ft', width: 10, widthUnit: 'ft',
      depth: 0, depthUnit: 'in', diameter: 0, diameterUnit: 'ft',
    });
    const weights = result.weightEstimate as Array<{ label: string; value: number }>;
    const loads = result.loads as Array<{ label: string; value: number }>;
    weights.forEach(w => expect(w.value).toBe(0));
    loads.forEach(l => expect(l.value).toBe(0));
  });
});
