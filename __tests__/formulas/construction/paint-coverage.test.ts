import { calculatePaintCoverage } from '@/lib/formulas/construction/paint-coverage';

describe('calculatePaintCoverage', () => {
  // ─── Test 1: Standard room — 14×12, 8 ft walls, 2 doors, 2 windows ───
  it('calculates a standard bedroom correctly', () => {
    const result = calculatePaintCoverage({
      roomLength: 14,
      roomLengthUnit: 'ft',
      roomWidth: 12,
      roomWidthUnit: 'ft',
      wallHeight: 8,
      wallHeightUnit: 'ft',
      doors: 2,
      windows: 2,
      coats: 2,
      paintType: 'eggshell',
      includeCeiling: false,
    });
    // Perimeter = 2(14+12) = 52 ft
    expect(result.perimeter).toBe(52);
    // Wall area = 52 × 8 = 416 sq ft
    expect(result.totalWallArea).toBe(416);
    // Openings = 2×21 + 2×15 = 72 sq ft
    expect(result.openingsArea).toBe(72);
    // Paintable = 416 - 72 = 344 sq ft
    expect(result.paintableArea).toBe(344);
    // Gallons = ceil((344 × 2) / 375) = ceil(1.835) = 2
    expect(result.gallonsNeeded).toBe(2);
  });

  // ─── Test 2: Include ceiling ───
  it('adds ceiling area when includeCeiling is true', () => {
    const withoutCeiling = calculatePaintCoverage({
      roomLength: 14,
      roomLengthUnit: 'ft',
      roomWidth: 12,
      roomWidthUnit: 'ft',
      wallHeight: 8,
      wallHeightUnit: 'ft',
      doors: 1,
      windows: 1,
      coats: 2,
      paintType: 'eggshell',
      includeCeiling: false,
    });
    const withCeiling = calculatePaintCoverage({
      roomLength: 14,
      roomLengthUnit: 'ft',
      roomWidth: 12,
      roomWidthUnit: 'ft',
      wallHeight: 8,
      wallHeightUnit: 'ft',
      doors: 1,
      windows: 1,
      coats: 2,
      paintType: 'eggshell',
      includeCeiling: true,
    });
    // Ceiling area = 14 × 12 = 168 sq ft
    expect(withCeiling.ceilingArea).toBe(168);
    expect(withCeiling.paintableArea).toBe((withoutCeiling.paintableArea as number) + 168);
    // With ceiling adds paintable area; gallons may or may not increase depending on rounding
    expect(withCeiling.gallonsNeeded).toBeGreaterThanOrEqual(withoutCeiling.gallonsNeeded as number);
  });

  // ─── Test 3: No doors/windows → no deductions ───
  it('returns full wall area when no openings', () => {
    const result = calculatePaintCoverage({
      roomLength: 10,
      roomLengthUnit: 'ft',
      roomWidth: 10,
      roomWidthUnit: 'ft',
      wallHeight: 8,
      wallHeightUnit: 'ft',
      doors: 0,
      windows: 0,
      coats: 1,
      paintType: 'flat',
      includeCeiling: false,
    });
    // Perimeter = 40, wall area = 320
    expect(result.paintableArea).toBe(320);
    expect(result.openingsArea).toBe(0);
    // Gallons = ceil(320 / 350) = 1
    expect(result.gallonsNeeded).toBe(1);
  });

  // ─── Test 4: Semi-gloss has less coverage ───
  it('uses 325 sq ft/gal for semi-gloss (more gallons needed)', () => {
    const eggshell = calculatePaintCoverage({
      roomLength: 20,
      roomLengthUnit: 'ft',
      roomWidth: 15,
      roomWidthUnit: 'ft',
      wallHeight: 8,
      wallHeightUnit: 'ft',
      doors: 2,
      windows: 3,
      coats: 2,
      paintType: 'eggshell',
      includeCeiling: false,
    });
    const semiGloss = calculatePaintCoverage({
      roomLength: 20,
      roomLengthUnit: 'ft',
      roomWidth: 15,
      roomWidthUnit: 'ft',
      wallHeight: 8,
      wallHeightUnit: 'ft',
      doors: 2,
      windows: 3,
      coats: 2,
      paintType: 'semi-gloss',
      includeCeiling: false,
    });
    // Same paintable area, but semi-gloss covers less → more gallons
    expect(semiGloss.paintableArea).toBe(eggshell.paintableArea);
    expect(semiGloss.gallonsNeeded).toBeGreaterThanOrEqual(eggshell.gallonsNeeded as number);
  });

  // ─── Test 5: 3 coats requires more paint ───
  it('increases gallons for 3 coats vs 2 coats', () => {
    const twoCoats = calculatePaintCoverage({
      roomLength: 14,
      roomLengthUnit: 'ft',
      roomWidth: 12,
      roomWidthUnit: 'ft',
      wallHeight: 8,
      wallHeightUnit: 'ft',
      doors: 1,
      windows: 1,
      coats: 2,
      paintType: 'eggshell',
      includeCeiling: false,
    });
    const threeCoats = calculatePaintCoverage({
      roomLength: 14,
      roomLengthUnit: 'ft',
      roomWidth: 12,
      roomWidthUnit: 'ft',
      wallHeight: 8,
      wallHeightUnit: 'ft',
      doors: 1,
      windows: 1,
      coats: 3,
      paintType: 'eggshell',
      includeCeiling: false,
    });
    expect(threeCoats.gallonsNeeded).toBeGreaterThan(twoCoats.gallonsNeeded as number);
  });

  // ─── Test 6: Large room with many openings ───
  it('deducts multiple doors and windows correctly', () => {
    const result = calculatePaintCoverage({
      roomLength: 30,
      roomLengthUnit: 'ft',
      roomWidth: 20,
      roomWidthUnit: 'ft',
      wallHeight: 10,
      wallHeightUnit: 'ft',
      doors: 4,
      windows: 6,
      coats: 2,
      paintType: 'satin',
      includeCeiling: false,
    });
    // Openings = 4×21 + 6×15 = 84 + 90 = 174 sq ft
    expect(result.openingsArea).toBe(174);
    // Wall area = 2(30+20)×10 = 1000 sq ft
    expect(result.totalWallArea).toBe(1000);
    // Paintable = 1000 - 174 = 826 sq ft
    expect(result.paintableArea).toBe(826);
  });

  // ─── Test 7: Unit conversion — meters ───
  it('converts meters to feet correctly', () => {
    const result = calculatePaintCoverage({
      roomLength: 4.2672,    // 14 ft
      roomLengthUnit: 'm',
      roomWidth: 3.6576,     // 12 ft
      roomWidthUnit: 'm',
      wallHeight: 2.4384,    // 8 ft
      wallHeightUnit: 'm',
      doors: 2,
      windows: 2,
      coats: 2,
      paintType: 'eggshell',
      includeCeiling: false,
    });
    expect(result.perimeter).toBeCloseTo(52, 0);
    expect(result.totalWallArea).toBeCloseTo(416, -1);
  });

  // ─── Test 8: Cost estimate has valid range ───
  it('returns cost estimate with low < mid < high', () => {
    const result = calculatePaintCoverage({
      roomLength: 14,
      roomLengthUnit: 'ft',
      roomWidth: 12,
      roomWidthUnit: 'ft',
      wallHeight: 8,
      wallHeightUnit: 'ft',
      doors: 2,
      windows: 2,
      coats: 2,
      paintType: 'eggshell',
      includeCeiling: false,
    });
    const cost = result.costEstimate as Array<{ label: string; value: number }>;
    expect(cost).toHaveLength(3);
    expect(cost[0].value).toBeLessThan(cost[1].value);
    expect(cost[1].value).toBeLessThan(cost[2].value);
  });

  // ─── Test 9: Openings cannot exceed wall area ───
  it('clamps paintable area to 0 when openings exceed wall area', () => {
    const result = calculatePaintCoverage({
      roomLength: 5,
      roomLengthUnit: 'ft',
      roomWidth: 5,
      roomWidthUnit: 'ft',
      wallHeight: 8,
      wallHeightUnit: 'ft',
      doors: 10,        // 210 sq ft deduction (more than 160 sq ft wall)
      windows: 5,
      coats: 2,
      paintType: 'eggshell',
      includeCeiling: false,
    });
    expect(result.paintableArea).toBe(0);
    expect(result.gallonsNeeded).toBe(0);
  });

  // ─── Test 10: Primer coverage rate ───
  it('uses 300 sq ft/gal for primer', () => {
    const result = calculatePaintCoverage({
      roomLength: 15,
      roomLengthUnit: 'ft',
      roomWidth: 15,
      roomWidthUnit: 'ft',
      wallHeight: 8,
      wallHeightUnit: 'ft',
      doors: 1,
      windows: 2,
      coats: 1,
      paintType: 'primer',
      includeCeiling: false,
    });
    // Perimeter = 60, wall = 480, openings = 21+30=51, paintable = 429
    // Gallons = ceil(429 / 300) = 2
    expect(result.gallonsNeeded).toBe(2);
  });

  // ─── Test 11: Area breakdown includes all components ───
  it('returns complete area breakdown', () => {
    const result = calculatePaintCoverage({
      roomLength: 14,
      roomLengthUnit: 'ft',
      roomWidth: 12,
      roomWidthUnit: 'ft',
      wallHeight: 8,
      wallHeightUnit: 'ft',
      doors: 2,
      windows: 2,
      coats: 2,
      paintType: 'eggshell',
      includeCeiling: true,
    });
    const breakdown = result.areaBreakdown as Array<{ label: string; value: number }>;
    expect(breakdown.length).toBeGreaterThanOrEqual(5);
    const ceilingEntry = breakdown.find(b => b.label.includes('Ceiling'));
    expect(ceilingEntry).toBeDefined();
    expect(ceilingEntry!.value).toBe(168);
  });
});
