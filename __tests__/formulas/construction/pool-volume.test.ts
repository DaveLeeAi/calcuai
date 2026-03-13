import { calculatePoolVolume } from '@/lib/formulas/construction/pool-volume';

describe('calculatePoolVolume', () => {
  // ─── Test 1: Standard rectangular pool 30×15 with 3-8ft depth ───
  it('calculates a standard 30×15 rectangular pool (3ft shallow, 8ft deep)', () => {
    const result = calculatePoolVolume({
      poolShape: 'rectangular',
      length: 30,
      lengthUnit: 'ft',
      width: 15,
      widthUnit: 'ft',
      shallowDepth: 3,
      shallowDepthUnit: 'ft',
      deepDepth: 8,
      deepDepthUnit: 'ft',
      diameter: 20,
      diameterUnit: 'ft',
    });
    // avgDepth = (3+8)/2 = 5.5, volume = 30*15*5.5 = 2475 cu ft
    // gallons = 2475 * 7.48052 = 18,514.29
    expect(result.averageDepth).toBe(5.5);
    expect(result.cubicFeet).toBe(2475);
    expect(result.surfaceArea).toBe(450);
    expect(result.gallons).toBeCloseTo(18514.29, 0);
  });

  // ─── Test 2: Circular pool 20ft diameter ───
  it('calculates a circular pool 20ft diameter, 4ft uniform depth', () => {
    const result = calculatePoolVolume({
      poolShape: 'circular',
      length: 30,
      lengthUnit: 'ft',
      width: 15,
      widthUnit: 'ft',
      shallowDepth: 4,
      shallowDepthUnit: 'ft',
      deepDepth: 4,
      deepDepthUnit: 'ft',
      diameter: 20,
      diameterUnit: 'ft',
    });
    // avgDepth = 4, radius = 10, area = pi*100 = 314.159
    // volume = 314.159 * 4 = 1256.637 cu ft
    // gallons = 1256.637 * 7.48052 = 9400.67
    expect(result.averageDepth).toBe(4);
    expect(result.surfaceArea).toBeCloseTo(314.16, 0);
    expect(result.cubicFeet).toBeCloseTo(1256.64, 0);
    expect(result.gallons).toBeCloseTo(9401, -1);
  });

  // ─── Test 3: Oval pool ───
  it('calculates an oval pool 25×12 with varying depth', () => {
    const result = calculatePoolVolume({
      poolShape: 'oval',
      length: 25,
      lengthUnit: 'ft',
      width: 12,
      widthUnit: 'ft',
      shallowDepth: 3,
      shallowDepthUnit: 'ft',
      deepDepth: 7,
      deepDepthUnit: 'ft',
      diameter: 20,
      diameterUnit: 'ft',
    });
    // avgDepth = 5, area = pi * 12.5 * 6 = 235.619
    // volume = 235.619 * 5 = 1178.10 cu ft
    expect(result.averageDepth).toBe(5);
    expect(result.surfaceArea).toBeCloseTo(235.62, 0);
    expect(result.cubicFeet).toBeCloseTo(1178.10, 0);
    expect(result.gallons).toBeCloseTo(8812, -1);
  });

  // ─── Test 4: Kidney pool ───
  it('calculates a kidney pool 30×15 with 3-8ft depth', () => {
    const result = calculatePoolVolume({
      poolShape: 'kidney',
      length: 30,
      lengthUnit: 'ft',
      width: 15,
      widthUnit: 'ft',
      shallowDepth: 3,
      shallowDepthUnit: 'ft',
      deepDepth: 8,
      deepDepthUnit: 'ft',
      diameter: 20,
      diameterUnit: 'ft',
    });
    // avgDepth = 5.5, area = 0.45 * (30+15) * 30 = 0.45 * 45 * 30 = 607.5
    // volume = 607.5 * 5.5 = 3341.25 cu ft
    expect(result.averageDepth).toBe(5.5);
    expect(result.surfaceArea).toBe(607.5);
    expect(result.cubicFeet).toBe(3341.25);
    expect(result.gallons).toBeCloseTo(24994.29, 0);
  });

  // ─── Test 5: Uniform depth (shallow = deep) ───
  it('handles uniform depth correctly (shallow = deep)', () => {
    const result = calculatePoolVolume({
      poolShape: 'rectangular',
      length: 20,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      shallowDepth: 5,
      shallowDepthUnit: 'ft',
      deepDepth: 5,
      deepDepthUnit: 'ft',
      diameter: 20,
      diameterUnit: 'ft',
    });
    // avgDepth = 5, volume = 20*10*5 = 1000 cu ft
    expect(result.averageDepth).toBe(5);
    expect(result.cubicFeet).toBe(1000);
    expect(result.gallons).toBeCloseTo(7480.52, 0);
  });

  // ─── Test 6: Zero dimensions produce zero volume ───
  it('returns zero for zero dimensions', () => {
    const result = calculatePoolVolume({
      poolShape: 'rectangular',
      length: 0,
      lengthUnit: 'ft',
      width: 0,
      widthUnit: 'ft',
      shallowDepth: 0,
      shallowDepthUnit: 'ft',
      deepDepth: 0,
      deepDepthUnit: 'ft',
      diameter: 0,
      diameterUnit: 'ft',
    });
    expect(result.cubicFeet).toBe(0);
    expect(result.gallons).toBe(0);
    expect(result.liters).toBe(0);
  });

  // ─── Test 7: Gallon conversion accuracy ───
  it('converts cubic feet to gallons with correct factor (7.48052)', () => {
    const result = calculatePoolVolume({
      poolShape: 'rectangular',
      length: 10,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      shallowDepth: 1,
      shallowDepthUnit: 'ft',
      deepDepth: 1,
      deepDepthUnit: 'ft',
      diameter: 20,
      diameterUnit: 'ft',
    });
    // 100 cu ft * 7.48052 = 748.052
    expect(result.cubicFeet).toBe(100);
    expect(result.gallons).toBeCloseTo(748.05, 1);
  });

  // ─── Test 8: Liter conversion accuracy ───
  it('converts gallons to liters with correct factor (3.78541)', () => {
    const result = calculatePoolVolume({
      poolShape: 'rectangular',
      length: 10,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      shallowDepth: 1,
      shallowDepthUnit: 'ft',
      deepDepth: 1,
      deepDepthUnit: 'ft',
      diameter: 20,
      diameterUnit: 'ft',
    });
    const expectedLiters = (result.gallons as number) * 3.78541;
    expect(result.liters).toBeCloseTo(expectedLiters, 0);
  });

  // ─── Test 9: Cubic meters conversion ───
  it('converts cubic feet to cubic meters correctly', () => {
    const result = calculatePoolVolume({
      poolShape: 'rectangular',
      length: 30,
      lengthUnit: 'ft',
      width: 15,
      widthUnit: 'ft',
      shallowDepth: 3,
      shallowDepthUnit: 'ft',
      deepDepth: 8,
      deepDepthUnit: 'ft',
      diameter: 20,
      diameterUnit: 'ft',
    });
    // 2475 cu ft * 0.0283168 = 70.084
    expect(result.cubicMeters).toBeCloseTo(70.084, 1);
  });

  // ─── Test 10: Surface area for rectangular ───
  it('calculates surface area for rectangular pool', () => {
    const result = calculatePoolVolume({
      poolShape: 'rectangular',
      length: 40,
      lengthUnit: 'ft',
      width: 20,
      widthUnit: 'ft',
      shallowDepth: 3,
      shallowDepthUnit: 'ft',
      deepDepth: 8,
      deepDepthUnit: 'ft',
      diameter: 20,
      diameterUnit: 'ft',
    });
    expect(result.surfaceArea).toBe(800);
  });

  // ─── Test 11: Fill time estimation ───
  it('estimates fill time based on garden hose flow rate', () => {
    const result = calculatePoolVolume({
      poolShape: 'rectangular',
      length: 30,
      lengthUnit: 'ft',
      width: 15,
      widthUnit: 'ft',
      shallowDepth: 3,
      shallowDepthUnit: 'ft',
      deepDepth: 8,
      deepDepthUnit: 'ft',
      diameter: 20,
      diameterUnit: 'ft',
    });
    const chem = result.chemicalEstimate as Array<{ label: string; value: number }>;
    const fillTime = chem.find(c => c.label.includes('Fill Time'));
    // ~18514 gallons / 540 GPH = ~34.3 hours → ceil = 35
    expect(fillTime!.value).toBe(Math.ceil(18514.29 / 540));
  });

  // ─── Test 12: Chemical estimates ───
  it('calculates chlorine and pH estimates', () => {
    const result = calculatePoolVolume({
      poolShape: 'rectangular',
      length: 30,
      lengthUnit: 'ft',
      width: 15,
      widthUnit: 'ft',
      shallowDepth: 3,
      shallowDepthUnit: 'ft',
      deepDepth: 8,
      deepDepthUnit: 'ft',
      diameter: 20,
      diameterUnit: 'ft',
    });
    const chem = result.chemicalEstimate as Array<{ label: string; value: number }>;
    expect(chem).toHaveLength(3);
    const chlorine = chem.find(c => c.label.includes('Chlorine'));
    const ph = chem.find(c => c.label.includes('pH'));
    // ~18514 gal / 10000 * 2 = ~3.70
    expect(chlorine!.value).toBeCloseTo(3.70, 1);
    // ~18514 gal / 10000 * 1.5 = ~2.78
    expect(ph!.value).toBeCloseTo(2.78, 1);
  });

  // ─── Test 13: Average depth calculation ───
  it('calculates average depth correctly', () => {
    const result = calculatePoolVolume({
      poolShape: 'rectangular',
      length: 20,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      shallowDepth: 3,
      shallowDepthUnit: 'ft',
      deepDepth: 9,
      deepDepthUnit: 'ft',
      diameter: 20,
      diameterUnit: 'ft',
    });
    expect(result.averageDepth).toBe(6);
  });

  // ─── Test 14: Small above-ground pool (15ft round, 4ft deep) ───
  it('calculates a small above-ground circular pool (15ft, 4ft)', () => {
    const result = calculatePoolVolume({
      poolShape: 'circular',
      length: 30,
      lengthUnit: 'ft',
      width: 15,
      widthUnit: 'ft',
      shallowDepth: 4,
      shallowDepthUnit: 'ft',
      deepDepth: 4,
      deepDepthUnit: 'ft',
      diameter: 15,
      diameterUnit: 'ft',
    });
    // radius = 7.5, area = pi*56.25 = 176.715
    // volume = 176.715 * 4 = 706.858 cu ft
    // gallons = 706.858 * 7.48052 = 5289.36
    expect(result.surfaceArea).toBeCloseTo(176.71, 0);
    expect(result.gallons).toBeCloseTo(5289, -1);
  });

  // ─── Test 15: Large commercial pool ───
  it('handles a large commercial pool (75×25, 4-12ft depth)', () => {
    const result = calculatePoolVolume({
      poolShape: 'rectangular',
      length: 75,
      lengthUnit: 'ft',
      width: 25,
      widthUnit: 'ft',
      shallowDepth: 4,
      shallowDepthUnit: 'ft',
      deepDepth: 12,
      deepDepthUnit: 'ft',
      diameter: 20,
      diameterUnit: 'ft',
    });
    // avgDepth = 8, volume = 75*25*8 = 15000 cu ft
    // gallons = 15000 * 7.48052 = 112207.8
    expect(result.averageDepth).toBe(8);
    expect(result.cubicFeet).toBe(15000);
    expect(result.gallons).toBeCloseTo(112207.8, 0);
  });

  // ─── Test 16: Metric inputs ───
  it('converts metric inputs correctly', () => {
    const result = calculatePoolVolume({
      poolShape: 'rectangular',
      length: 9.144,     // ~30 ft
      lengthUnit: 'm',
      width: 4.572,      // ~15 ft
      widthUnit: 'm',
      shallowDepth: 0.9144,   // ~3 ft
      shallowDepthUnit: 'm',
      deepDepth: 2.4384,       // ~8 ft
      deepDepthUnit: 'm',
      diameter: 20,
      diameterUnit: 'ft',
    });
    // Should approximate the standard 30x15 pool
    expect(result.cubicFeet).toBeCloseTo(2475, -1);
    expect(result.gallons).toBeCloseTo(18514, -2);
  });

  // ─── Test 17: Water cost estimate ───
  it('calculates water cost at $0.005/gal', () => {
    const result = calculatePoolVolume({
      poolShape: 'rectangular',
      length: 30,
      lengthUnit: 'ft',
      width: 15,
      widthUnit: 'ft',
      shallowDepth: 3,
      shallowDepthUnit: 'ft',
      deepDepth: 8,
      deepDepthUnit: 'ft',
      diameter: 20,
      diameterUnit: 'ft',
    });
    const cost = result.waterCost as Array<{ label: string; value: number }>;
    expect(cost).toHaveLength(1);
    // ~18514 * 0.005 = ~92.57
    expect(cost[0].value).toBeCloseTo(92.57, 0);
  });

  // ─── Test 18: Output structure ───
  it('returns all expected output fields', () => {
    const result = calculatePoolVolume({
      poolShape: 'rectangular',
      length: 20,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      shallowDepth: 3,
      shallowDepthUnit: 'ft',
      deepDepth: 8,
      deepDepthUnit: 'ft',
      diameter: 20,
      diameterUnit: 'ft',
    });
    expect(result).toHaveProperty('gallons');
    expect(result).toHaveProperty('liters');
    expect(result).toHaveProperty('cubicFeet');
    expect(result).toHaveProperty('cubicMeters');
    expect(result).toHaveProperty('averageDepth');
    expect(result).toHaveProperty('surfaceArea');
    expect(result).toHaveProperty('chemicalEstimate');
    expect(result).toHaveProperty('waterCost');
    expect(result).toHaveProperty('poolSummary');
    expect(typeof result.gallons).toBe('number');
    expect(typeof result.liters).toBe('number');
  });

  // ─── Test 19: Very shallow pool ───
  it('handles a very shallow pool (1ft uniform depth)', () => {
    const result = calculatePoolVolume({
      poolShape: 'rectangular',
      length: 20,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      shallowDepth: 1,
      shallowDepthUnit: 'ft',
      deepDepth: 1,
      deepDepthUnit: 'ft',
      diameter: 20,
      diameterUnit: 'ft',
    });
    expect(result.averageDepth).toBe(1);
    expect(result.cubicFeet).toBe(200);
    expect(result.gallons).toBeCloseTo(1496.10, 0);
  });

  // ─── Test 20: Very deep pool ───
  it('handles a very deep pool (3-15ft depth)', () => {
    const result = calculatePoolVolume({
      poolShape: 'rectangular',
      length: 40,
      lengthUnit: 'ft',
      width: 20,
      widthUnit: 'ft',
      shallowDepth: 3,
      shallowDepthUnit: 'ft',
      deepDepth: 15,
      deepDepthUnit: 'ft',
      diameter: 20,
      diameterUnit: 'ft',
    });
    // avgDepth = 9, volume = 40*20*9 = 7200 cu ft
    expect(result.averageDepth).toBe(9);
    expect(result.cubicFeet).toBe(7200);
    expect(result.gallons).toBeCloseTo(53859.74, 0);
  });

  // ─── Test 21: Circular pool ignores length/width ───
  it('uses diameter (not length/width) for circular shape', () => {
    const small = calculatePoolVolume({
      poolShape: 'circular',
      length: 100,      // Should be ignored
      lengthUnit: 'ft',
      width: 100,       // Should be ignored
      widthUnit: 'ft',
      shallowDepth: 4,
      shallowDepthUnit: 'ft',
      deepDepth: 4,
      deepDepthUnit: 'ft',
      diameter: 10,
      diameterUnit: 'ft',
    });
    // area = pi * 25 = 78.54, volume = 78.54 * 4 = 314.16
    expect(small.surfaceArea).not.toBe(10000);
    expect(small.surfaceArea).toBeCloseTo(78.54, 0);
    expect(small.cubicFeet).toBeCloseTo(314.16, 0);
  });

  // ─── Test 22: Pool summary value group ───
  it('returns pool summary with surface area, average depth, and volume', () => {
    const result = calculatePoolVolume({
      poolShape: 'rectangular',
      length: 20,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      shallowDepth: 4,
      shallowDepthUnit: 'ft',
      deepDepth: 6,
      deepDepthUnit: 'ft',
      diameter: 20,
      diameterUnit: 'ft',
    });
    const summary = result.poolSummary as Array<{ label: string; value: number }>;
    expect(summary).toHaveLength(3);
    const area = summary.find(s => s.label.includes('Surface Area'));
    const depth = summary.find(s => s.label.includes('Average Depth'));
    const vol = summary.find(s => s.label.includes('Volume'));
    expect(area!.value).toBe(200);
    expect(depth!.value).toBe(5);
    expect(vol!.value).toBe(1000);
  });
});
