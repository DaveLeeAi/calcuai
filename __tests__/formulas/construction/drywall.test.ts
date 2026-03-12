import { calculateDrywall } from '@/lib/formulas/construction/drywall';

describe('calculateDrywall', () => {
  // ─── Test 1: Standard room — 14×12, 8 ft walls, 2 doors, 2 windows ───
  it('calculates a standard bedroom correctly', () => {
    const result = calculateDrywall({
      roomLength: 14,
      roomLengthUnit: 'ft',
      roomWidth: 12,
      roomWidthUnit: 'ft',
      wallHeight: 8,
      wallHeightUnit: 'ft',
      doors: 2,
      windows: 2,
      includeCeiling: false,
      sheetSize: '4x8',
      rooms: 1,
    });
    // Perimeter = 2(14+12) = 52 ft
    // Gross wall = 52 × 8 = 416 sq ft
    // Openings = 2×21 + 2×15 = 72
    // Net wall = 416 - 72 = 344 sq ft
    expect(result.wallArea).toBe(344);
    expect(result.totalArea).toBe(344);
    // Sheets = ceil(344 / 32) = 11
    expect(result.sheets).toBe(11);
  });

  // ─── Test 2: Include ceiling ───
  it('adds ceiling area when includeCeiling is true', () => {
    const wallsOnly = calculateDrywall({
      roomLength: 14,
      roomLengthUnit: 'ft',
      roomWidth: 12,
      roomWidthUnit: 'ft',
      wallHeight: 8,
      wallHeightUnit: 'ft',
      doors: 2,
      windows: 2,
      includeCeiling: false,
      sheetSize: '4x8',
      rooms: 1,
    });
    const withCeiling = calculateDrywall({
      roomLength: 14,
      roomLengthUnit: 'ft',
      roomWidth: 12,
      roomWidthUnit: 'ft',
      wallHeight: 8,
      wallHeightUnit: 'ft',
      doors: 2,
      windows: 2,
      includeCeiling: true,
      sheetSize: '4x8',
      rooms: 1,
    });
    // Ceiling = 14 × 12 = 168 sq ft
    expect(withCeiling.ceilingArea).toBe(168);
    expect(withCeiling.totalArea).toBe((wallsOnly.totalArea as number) + 168);
    expect(withCeiling.sheets).toBeGreaterThan(wallsOnly.sheets as number);
  });

  // ─── Test 3: No openings ───
  it('returns full wall area when no openings', () => {
    const result = calculateDrywall({
      roomLength: 10,
      roomLengthUnit: 'ft',
      roomWidth: 10,
      roomWidthUnit: 'ft',
      wallHeight: 8,
      wallHeightUnit: 'ft',
      doors: 0,
      windows: 0,
      includeCeiling: false,
      sheetSize: '4x8',
      rooms: 1,
    });
    // Wall area = 2(10+10)×8 = 320 sq ft
    expect(result.wallArea).toBe(320);
    expect(result.totalArea).toBe(320);
    // Sheets = ceil(320/32) = 10
    expect(result.sheets).toBe(10);
  });

  // ─── Test 4: 4×12 sheets — fewer sheets needed ───
  it('uses fewer 4×12 sheets than 4×8', () => {
    const small = calculateDrywall({
      roomLength: 14,
      roomLengthUnit: 'ft',
      roomWidth: 12,
      roomWidthUnit: 'ft',
      wallHeight: 8,
      wallHeightUnit: 'ft',
      doors: 2,
      windows: 2,
      includeCeiling: false,
      sheetSize: '4x8',
      rooms: 1,
    });
    const large = calculateDrywall({
      roomLength: 14,
      roomLengthUnit: 'ft',
      roomWidth: 12,
      roomWidthUnit: 'ft',
      wallHeight: 8,
      wallHeightUnit: 'ft',
      doors: 2,
      windows: 2,
      includeCeiling: false,
      sheetSize: '4x12',
      rooms: 1,
    });
    expect(large.sheets).toBeLessThan(small.sheets as number);
  });

  // ─── Test 5: Joint compound scales with area ───
  it('calculates joint compound proportional to area', () => {
    const small = calculateDrywall({
      roomLength: 10,
      roomLengthUnit: 'ft',
      roomWidth: 10,
      roomWidthUnit: 'ft',
      wallHeight: 8,
      wallHeightUnit: 'ft',
      doors: 1,
      windows: 1,
      includeCeiling: false,
      sheetSize: '4x8',
      rooms: 1,
    });
    const large = calculateDrywall({
      roomLength: 20,
      roomLengthUnit: 'ft',
      roomWidth: 20,
      roomWidthUnit: 'ft',
      wallHeight: 8,
      wallHeightUnit: 'ft',
      doors: 1,
      windows: 1,
      includeCeiling: false,
      sheetSize: '4x8',
      rooms: 1,
    });
    expect(large.jointCompoundGallons).toBeGreaterThan(small.jointCompoundGallons as number);
  });

  // ─── Test 6: Tape rolls scale with sheets ───
  it('calculates tape rolls proportional to sheet count', () => {
    const result = calculateDrywall({
      roomLength: 20,
      roomLengthUnit: 'ft',
      roomWidth: 20,
      roomWidthUnit: 'ft',
      wallHeight: 8,
      wallHeightUnit: 'ft',
      doors: 2,
      windows: 4,
      includeCeiling: true,
      sheetSize: '4x8',
      rooms: 1,
    });
    // 1 roll per 8 sheets
    expect(result.tapeRolls).toBe(Math.ceil((result.sheets as number) / 8));
  });

  // ─── Test 7: Multiple rooms ───
  it('multiplies all materials by room count', () => {
    const single = calculateDrywall({
      roomLength: 14,
      roomLengthUnit: 'ft',
      roomWidth: 12,
      roomWidthUnit: 'ft',
      wallHeight: 8,
      wallHeightUnit: 'ft',
      doors: 2,
      windows: 2,
      includeCeiling: false,
      sheetSize: '4x8',
      rooms: 1,
    });
    const triple = calculateDrywall({
      roomLength: 14,
      roomLengthUnit: 'ft',
      roomWidth: 12,
      roomWidthUnit: 'ft',
      wallHeight: 8,
      wallHeightUnit: 'ft',
      doors: 2,
      windows: 2,
      includeCeiling: false,
      sheetSize: '4x8',
      rooms: 3,
    });
    expect(triple.totalArea).toBe((single.totalArea as number) * 3);
    expect(triple.sheets).toBeGreaterThanOrEqual((single.sheets as number) * 3 - 1);
  });

  // ─── Test 8: Cost estimate range ───
  it('returns cost estimate with low < mid < high', () => {
    const result = calculateDrywall({
      roomLength: 14,
      roomLengthUnit: 'ft',
      roomWidth: 12,
      roomWidthUnit: 'ft',
      wallHeight: 8,
      wallHeightUnit: 'ft',
      doors: 2,
      windows: 2,
      includeCeiling: false,
      sheetSize: '4x8',
      rooms: 1,
    });
    const cost = result.costEstimate as Array<{ label: string; value: number }>;
    expect(cost).toHaveLength(3);
    expect(cost[0].value).toBeLessThan(cost[1].value);
    expect(cost[1].value).toBeLessThan(cost[2].value);
  });

  // ─── Test 9: Corner bead calculation ───
  it('calculates corner bead footage based on height and rooms', () => {
    const result = calculateDrywall({
      roomLength: 14,
      roomLengthUnit: 'ft',
      roomWidth: 12,
      roomWidthUnit: 'ft',
      wallHeight: 8,
      wallHeightUnit: 'ft',
      doors: 2,
      windows: 2,
      includeCeiling: false,
      sheetSize: '4x8',
      rooms: 1,
    });
    // 4 corners × 8 ft = 32 ft
    expect(result.cornerBeadFt).toBe(32);
  });

  // ─── Test 10: Unit conversion — meters ───
  it('converts meters to feet correctly', () => {
    const result = calculateDrywall({
      roomLength: 4.2672,    // 14 ft
      roomLengthUnit: 'm',
      roomWidth: 3.6576,     // 12 ft
      roomWidthUnit: 'm',
      wallHeight: 2.4384,    // 8 ft
      wallHeightUnit: 'm',
      doors: 2,
      windows: 2,
      includeCeiling: false,
      sheetSize: '4x8',
      rooms: 1,
    });
    expect(result.wallArea).toBeCloseTo(344, -1);
  });

  // ─── Test 11: Screws scale with sheets ───
  it('calculates screws proportional to sheet count', () => {
    const result = calculateDrywall({
      roomLength: 14,
      roomLengthUnit: 'ft',
      roomWidth: 12,
      roomWidthUnit: 'ft',
      wallHeight: 8,
      wallHeightUnit: 'ft',
      doors: 2,
      windows: 2,
      includeCeiling: false,
      sheetSize: '4x8',
      rooms: 1,
    });
    expect(result.screwsLbs).toBe(Math.ceil((result.sheets as number) / 8));
  });

  // ─── Test 12: Material breakdown includes all components ───
  it('returns complete material breakdown', () => {
    const result = calculateDrywall({
      roomLength: 14,
      roomLengthUnit: 'ft',
      roomWidth: 12,
      roomWidthUnit: 'ft',
      wallHeight: 8,
      wallHeightUnit: 'ft',
      doors: 2,
      windows: 2,
      includeCeiling: true,
      sheetSize: '4x8',
      rooms: 1,
    });
    const breakdown = result.materialBreakdown as Array<{ label: string; value: number }>;
    expect(breakdown.length).toBeGreaterThanOrEqual(5);
    const ceilingEntry = breakdown.find(b => b.label.includes('Ceiling'));
    expect(ceilingEntry).toBeDefined();
    expect(ceilingEntry!.value).toBe(168);
  });
});
