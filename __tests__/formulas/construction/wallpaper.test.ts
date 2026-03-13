import { calculateWallpaper } from '@/lib/formulas/construction/wallpaper';

describe('calculateWallpaper', () => {
  // ─── Test 1: Standard room (12×10×8, 1 door, 2 windows) ───
  it('calculates a standard room correctly', () => {
    const result = calculateWallpaper({
      roomLength: 12,
      roomLengthUnit: 'ft',
      roomWidth: 10,
      roomWidthUnit: 'ft',
      wallHeight: 8,
      wallHeightUnit: 'ft',
      doors: 1,
      windows: 2,
      rollWidth: '20.5',
      rollLength: '33',
      patternRepeat: 0,
      wasteFactor: 10,
    });
    // Perimeter = 2(12+10) = 44 ft
    // Total wall area = 44 × 8 = 352 sq ft
    expect(result.totalWallArea).toBe(352);
    // Door area = 1 × 21 = 21, Window area = 2 × 15 = 30
    expect(result.doorArea).toBe(21);
    expect(result.windowArea).toBe(30);
    // Net wall area = 352 - 21 - 30 = 301 sq ft
    expect(result.netWallArea).toBe(301);
    // Roll area = (20.5/12) × 33 = 1.7083 × 33 = 56.375 sq ft
    expect(result.rollsNeeded).toBeGreaterThan(0);
  });

  // ─── Test 2: No pattern repeat ───
  it('uses full roll area when no pattern repeat', () => {
    const result = calculateWallpaper({
      roomLength: 12, roomLengthUnit: 'ft', roomWidth: 10, roomWidthUnit: 'ft',
      wallHeight: 8, wallHeightUnit: 'ft', doors: 1, windows: 2,
      rollWidth: '20.5', rollLength: '33', patternRepeat: 0, wasteFactor: 10,
    });
    // usableRollArea = (20.5/12) × 33 ≈ 56.38
    expect(result.patternAdjustment).toBe(result.usableRollArea);
  });

  // ─── Test 3: Large pattern repeat (24") ───
  it('reduces usable area with pattern repeat', () => {
    const noPattern = calculateWallpaper({
      roomLength: 12, roomLengthUnit: 'ft', roomWidth: 10, roomWidthUnit: 'ft',
      wallHeight: 8, wallHeightUnit: 'ft', doors: 1, windows: 2,
      rollWidth: '20.5', rollLength: '33', patternRepeat: 0, wasteFactor: 10,
    });
    const withPattern = calculateWallpaper({
      roomLength: 12, roomLengthUnit: 'ft', roomWidth: 10, roomWidthUnit: 'ft',
      wallHeight: 8, wallHeightUnit: 'ft', doors: 1, windows: 2,
      rollWidth: '20.5', rollLength: '33', patternRepeat: 24, wasteFactor: 10,
    });
    // Pattern repeat reduces usable area by 15%
    expect(withPattern.patternAdjustment).toBeLessThan(noPattern.patternAdjustment as number);
    // More rolls needed with pattern repeat
    expect(withPattern.rollsNeeded).toBeGreaterThan(noPattern.rollsNeeded as number);
  });

  // ─── Test 4: Different roll widths ───
  it('wider rolls require fewer rolls', () => {
    const narrow = calculateWallpaper({
      roomLength: 12, roomLengthUnit: 'ft', roomWidth: 10, roomWidthUnit: 'ft',
      wallHeight: 8, wallHeightUnit: 'ft', doors: 1, windows: 2,
      rollWidth: '20.5', rollLength: '33', patternRepeat: 0, wasteFactor: 10,
    });
    const wide = calculateWallpaper({
      roomLength: 12, roomLengthUnit: 'ft', roomWidth: 10, roomWidthUnit: 'ft',
      wallHeight: 8, wallHeightUnit: 'ft', doors: 1, windows: 2,
      rollWidth: '36', rollLength: '33', patternRepeat: 0, wasteFactor: 10,
    });
    expect(wide.rollsNeeded).toBeLessThanOrEqual(narrow.rollsNeeded as number);
  });

  // ─── Test 5: Double roll (56 ft) requires fewer rolls ───
  it('double rolls require fewer rolls than single', () => {
    const single = calculateWallpaper({
      roomLength: 12, roomLengthUnit: 'ft', roomWidth: 10, roomWidthUnit: 'ft',
      wallHeight: 8, wallHeightUnit: 'ft', doors: 1, windows: 2,
      rollWidth: '20.5', rollLength: '33', patternRepeat: 0, wasteFactor: 10,
    });
    const double = calculateWallpaper({
      roomLength: 12, roomLengthUnit: 'ft', roomWidth: 10, roomWidthUnit: 'ft',
      wallHeight: 8, wallHeightUnit: 'ft', doors: 1, windows: 2,
      rollWidth: '20.5', rollLength: '56', patternRepeat: 0, wasteFactor: 10,
    });
    expect(double.rollsNeeded).toBeLessThan(single.rollsNeeded as number);
  });

  // ─── Test 6: Zero doors and windows ───
  it('uses full wall area when no openings', () => {
    const result = calculateWallpaper({
      roomLength: 12, roomLengthUnit: 'ft', roomWidth: 10, roomWidthUnit: 'ft',
      wallHeight: 8, wallHeightUnit: 'ft', doors: 0, windows: 0,
      rollWidth: '20.5', rollLength: '33', patternRepeat: 0, wasteFactor: 10,
    });
    expect(result.netWallArea).toBe(result.totalWallArea);
    expect(result.doorArea).toBe(0);
    expect(result.windowArea).toBe(0);
  });

  // ─── Test 7: Large room ───
  it('handles a large room', () => {
    const result = calculateWallpaper({
      roomLength: 30, roomLengthUnit: 'ft', roomWidth: 20, roomWidthUnit: 'ft',
      wallHeight: 10, wallHeightUnit: 'ft', doors: 3, windows: 6,
      rollWidth: '20.5', rollLength: '33', patternRepeat: 0, wasteFactor: 10,
    });
    // Perimeter = 2(30+20) = 100 ft
    // Total = 100 × 10 = 1000 sq ft
    expect(result.totalWallArea).toBe(1000);
    // Net = 1000 - 63 - 90 = 847
    expect(result.netWallArea).toBe(847);
    expect(result.rollsNeeded).toBeGreaterThan(0);
  });

  // ─── Test 8: Small room ───
  it('handles a small room', () => {
    const result = calculateWallpaper({
      roomLength: 6, roomLengthUnit: 'ft', roomWidth: 5, roomWidthUnit: 'ft',
      wallHeight: 8, wallHeightUnit: 'ft', doors: 1, windows: 0,
      rollWidth: '20.5', rollLength: '33', patternRepeat: 0, wasteFactor: 10,
    });
    // Perimeter = 2(6+5) = 22 ft
    // Total = 22 × 8 = 176
    // Net = 176 - 21 = 155
    expect(result.totalWallArea).toBe(176);
    expect(result.netWallArea).toBe(155);
    expect(result.rollsNeeded).toBeGreaterThan(0);
  });

  // ─── Test 9: Unit conversion — meters ───
  it('converts meters to feet correctly', () => {
    const result = calculateWallpaper({
      roomLength: 3.6576,    // 12 ft
      roomLengthUnit: 'm',
      roomWidth: 3.048,      // 10 ft
      roomWidthUnit: 'm',
      wallHeight: 2.4384,    // 8 ft
      wallHeightUnit: 'm',
      doors: 1,
      windows: 2,
      rollWidth: '20.5',
      rollLength: '33',
      patternRepeat: 0,
      wasteFactor: 10,
    });
    expect(result.totalWallArea).toBeCloseTo(352, -1);
  });

  // ─── Test 10: Net wall area accuracy ───
  it('correctly subtracts openings from total wall area', () => {
    const result = calculateWallpaper({
      roomLength: 15, roomLengthUnit: 'ft', roomWidth: 12, roomWidthUnit: 'ft',
      wallHeight: 9, wallHeightUnit: 'ft', doors: 2, windows: 4,
      rollWidth: '20.5', rollLength: '33', patternRepeat: 0, wasteFactor: 10,
    });
    // Perimeter = 2(15+12) = 54 ft
    // Total = 54 × 9 = 486
    // Doors = 2 × 21 = 42, Windows = 4 × 15 = 60
    // Net = 486 - 42 - 60 = 384
    expect(result.totalWallArea).toBe(486);
    expect(result.netWallArea).toBe(384);
  });

  // ─── Test 11: Cost estimate ordering ───
  it('returns cost estimates with budget < mid < premium', () => {
    const result = calculateWallpaper({
      roomLength: 12, roomLengthUnit: 'ft', roomWidth: 10, roomWidthUnit: 'ft',
      wallHeight: 8, wallHeightUnit: 'ft', doors: 1, windows: 2,
      rollWidth: '20.5', rollLength: '33', patternRepeat: 0, wasteFactor: 10,
    });
    const cost = result.costEstimate as Array<{ label: string; value: number }>;
    expect(cost).toHaveLength(3);
    expect(cost[0].value).toBeLessThan(cost[1].value);
    expect(cost[1].value).toBeLessThan(cost[2].value);
  });

  // ─── Test 12: Waste factor impact ───
  it('higher waste factor requires more rolls', () => {
    const low = calculateWallpaper({
      roomLength: 12, roomLengthUnit: 'ft', roomWidth: 10, roomWidthUnit: 'ft',
      wallHeight: 8, wallHeightUnit: 'ft', doors: 1, windows: 2,
      rollWidth: '20.5', rollLength: '33', patternRepeat: 0, wasteFactor: 5,
    });
    const high = calculateWallpaper({
      roomLength: 12, roomLengthUnit: 'ft', roomWidth: 10, roomWidthUnit: 'ft',
      wallHeight: 8, wallHeightUnit: 'ft', doors: 1, windows: 2,
      rollWidth: '20.5', rollLength: '33', patternRepeat: 0, wasteFactor: 20,
    });
    expect(high.rollsNeeded).toBeGreaterThanOrEqual(low.rollsNeeded as number);
  });

  // ─── Test 13: Zero height returns zeros ───
  it('returns zeros for zero height', () => {
    const result = calculateWallpaper({
      roomLength: 12, roomLengthUnit: 'ft', roomWidth: 10, roomWidthUnit: 'ft',
      wallHeight: 0, wallHeightUnit: 'ft', doors: 1, windows: 2,
      rollWidth: '20.5', rollLength: '33', patternRepeat: 0, wasteFactor: 10,
    });
    expect(result.totalWallArea).toBe(0);
    expect(result.rollsNeeded).toBe(0);
  });

  // ─── Test 14: Output structure ───
  it('returns all expected output keys', () => {
    const result = calculateWallpaper({
      roomLength: 12, roomLengthUnit: 'ft', roomWidth: 10, roomWidthUnit: 'ft',
      wallHeight: 8, wallHeightUnit: 'ft', doors: 1, windows: 2,
      rollWidth: '20.5', rollLength: '33', patternRepeat: 0, wasteFactor: 10,
    });
    expect(result).toHaveProperty('rollsNeeded');
    expect(result).toHaveProperty('netWallArea');
    expect(result).toHaveProperty('totalWallArea');
    expect(result).toHaveProperty('doorArea');
    expect(result).toHaveProperty('windowArea');
    expect(result).toHaveProperty('usableRollArea');
    expect(result).toHaveProperty('patternAdjustment');
    expect(result).toHaveProperty('costEstimate');
    expect(result).toHaveProperty('totalStrips');
    expect(result).toHaveProperty('stripsPerRoll');
  });

  // ─── Test 15: Strips per roll accuracy ───
  it('calculates strips per roll based on height', () => {
    const result = calculateWallpaper({
      roomLength: 12, roomLengthUnit: 'ft', roomWidth: 10, roomWidthUnit: 'ft',
      wallHeight: 8, wallHeightUnit: 'ft', doors: 1, windows: 2,
      rollWidth: '20.5', rollLength: '33', patternRepeat: 0, wasteFactor: 10,
    });
    // strips per roll = floor(33 / 8) = 4
    expect(result.stripsPerRoll).toBe(4);
  });

  // ─── Test 16: Pattern repeat reduces strips per roll ───
  it('pattern repeat reduces strips per roll', () => {
    const noPattern = calculateWallpaper({
      roomLength: 12, roomLengthUnit: 'ft', roomWidth: 10, roomWidthUnit: 'ft',
      wallHeight: 8, wallHeightUnit: 'ft', doors: 1, windows: 2,
      rollWidth: '20.5', rollLength: '33', patternRepeat: 0, wasteFactor: 10,
    });
    const withPattern = calculateWallpaper({
      roomLength: 12, roomLengthUnit: 'ft', roomWidth: 10, roomWidthUnit: 'ft',
      wallHeight: 8, wallHeightUnit: 'ft', doors: 1, windows: 2,
      rollWidth: '20.5', rollLength: '33', patternRepeat: 24, wasteFactor: 10,
    });
    // No pattern: floor(33/8) = 4 strips
    // With 24" pattern: floor(33/(8+2)) = floor(33/10) = 3 strips
    expect(withPattern.stripsPerRoll).toBeLessThan(noPattern.stripsPerRoll as number);
  });
});
