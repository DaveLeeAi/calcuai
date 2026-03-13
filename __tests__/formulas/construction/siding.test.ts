import { calculateSiding } from '@/lib/formulas/construction/siding';

describe('calculateSiding', () => {
  // ─── Test 1: Standard house (40×9, 8 windows, 2 doors) ───
  it('calculates a standard house correctly', () => {
    const result = calculateSiding({
      wallLength: 40,
      wallLengthUnit: 'ft',
      wallHeight: 9,
      wallHeightUnit: 'ft',
      gableArea: 0,
      windows: 8,
      windowArea: 15,
      doors: 2,
      doorArea: 21,
      sidingType: 'vinyl',
      wasteFactor: 10,
    });
    // Gross = 40 × 9 = 360
    expect(result.grossArea).toBe(360);
    // Openings = (8 × 15) + (2 × 21) = 120 + 42 = 162
    expect(result.openingDeductions).toBe(162);
    // Net = 360 - 162 = 198
    expect(result.netArea).toBe(198);
    // With waste = 198 × 1.1 = 217.8
    expect(result.areaWithWaste).toBe(217.8);
    // Squares = 217.8 / 100 = 2.18
    expect(result.squares).toBe(2.18);
  });

  // ─── Test 2: Vinyl siding panel count ───
  it('calculates vinyl panel count correctly', () => {
    const result = calculateSiding({
      wallLength: 40, wallLengthUnit: 'ft', wallHeight: 9, wallHeightUnit: 'ft',
      gableArea: 0, windows: 8, windowArea: 15, doors: 2, doorArea: 21,
      sidingType: 'vinyl', wasteFactor: 10,
    });
    // areaWithWaste = 217.8, vinyl coverage = 16.8 sq ft/panel
    // panels = ceil(217.8 / 16.8) = ceil(12.96) = 13
    expect(result.panelsOrPlanks).toBe(13);
  });

  // ─── Test 3: Fiber-cement plank count ───
  it('calculates fiber-cement plank count correctly', () => {
    const result = calculateSiding({
      wallLength: 40, wallLengthUnit: 'ft', wallHeight: 9, wallHeightUnit: 'ft',
      gableArea: 0, windows: 8, windowArea: 15, doors: 2, doorArea: 21,
      sidingType: 'fiber-cement', wasteFactor: 10,
    });
    // areaWithWaste = 217.8, fiber-cement coverage = 5.33 sq ft/plank
    // planks = ceil(217.8 / 5.33) = ceil(40.86) = 41
    expect(result.panelsOrPlanks).toBe(41);
  });

  // ─── Test 4: Large house ───
  it('handles a large house', () => {
    const result = calculateSiding({
      wallLength: 160, wallLengthUnit: 'ft', wallHeight: 10, wallHeightUnit: 'ft',
      gableArea: 200, windows: 20, windowArea: 15, doors: 4, doorArea: 21,
      sidingType: 'vinyl', wasteFactor: 10,
    });
    // Gross = 160 × 10 + 200 = 1800
    expect(result.grossArea).toBe(1800);
    // Openings = (20 × 15) + (4 × 21) = 300 + 84 = 384
    expect(result.openingDeductions).toBe(384);
    // Net = 1800 - 384 = 1416
    expect(result.netArea).toBe(1416);
  });

  // ─── Test 5: Small wall ───
  it('handles a small wall section', () => {
    const result = calculateSiding({
      wallLength: 10, wallLengthUnit: 'ft', wallHeight: 8, wallHeightUnit: 'ft',
      gableArea: 0, windows: 1, windowArea: 15, doors: 0, doorArea: 21,
      sidingType: 'vinyl', wasteFactor: 10,
    });
    // Gross = 80, openings = 15, net = 65
    expect(result.grossArea).toBe(80);
    expect(result.netArea).toBe(65);
  });

  // ─── Test 6: No windows/doors ───
  it('uses full wall area when no openings', () => {
    const result = calculateSiding({
      wallLength: 40, wallLengthUnit: 'ft', wallHeight: 9, wallHeightUnit: 'ft',
      gableArea: 0, windows: 0, windowArea: 15, doors: 0, doorArea: 21,
      sidingType: 'vinyl', wasteFactor: 10,
    });
    expect(result.openingDeductions).toBe(0);
    expect(result.netArea).toBe(result.grossArea);
  });

  // ─── Test 7: With gable area ───
  it('adds gable area to gross area', () => {
    const noGable = calculateSiding({
      wallLength: 40, wallLengthUnit: 'ft', wallHeight: 9, wallHeightUnit: 'ft',
      gableArea: 0, windows: 0, windowArea: 15, doors: 0, doorArea: 21,
      sidingType: 'vinyl', wasteFactor: 10,
    });
    const withGable = calculateSiding({
      wallLength: 40, wallLengthUnit: 'ft', wallHeight: 9, wallHeightUnit: 'ft',
      gableArea: 120, windows: 0, windowArea: 15, doors: 0, doorArea: 21,
      sidingType: 'vinyl', wasteFactor: 10,
    });
    expect(withGable.grossArea).toBe((noGable.grossArea as number) + 120);
  });

  // ─── Test 8: Many openings (openings exceed wall) ───
  it('clamps net area to zero when openings exceed wall area', () => {
    const result = calculateSiding({
      wallLength: 10, wallLengthUnit: 'ft', wallHeight: 8, wallHeightUnit: 'ft',
      gableArea: 0, windows: 10, windowArea: 15, doors: 5, doorArea: 21,
      sidingType: 'vinyl', wasteFactor: 10,
    });
    // Gross = 80, openings = 150 + 105 = 255
    expect(result.netArea).toBe(0);
    expect(result.areaWithWaste).toBe(0);
    expect(result.squares).toBe(0);
  });

  // ─── Test 9: Zero wall height ───
  it('returns zeros for zero wall height', () => {
    const result = calculateSiding({
      wallLength: 40, wallLengthUnit: 'ft', wallHeight: 0, wallHeightUnit: 'ft',
      gableArea: 0, windows: 8, windowArea: 15, doors: 2, doorArea: 21,
      sidingType: 'vinyl', wasteFactor: 10,
    });
    expect(result.grossArea).toBe(0);
    expect(result.netArea).toBe(0);
    expect(result.panelsOrPlanks).toBe(0);
  });

  // ─── Test 10: Metric inputs ───
  it('converts meters to feet correctly', () => {
    const result = calculateSiding({
      wallLength: 12.192,       // 40 ft
      wallLengthUnit: 'm',
      wallHeight: 2.7432,       // 9 ft
      wallHeightUnit: 'm',
      gableArea: 0,
      windows: 0,
      windowArea: 15,
      doors: 0,
      doorArea: 21,
      sidingType: 'vinyl',
      wasteFactor: 10,
    });
    // Should be close to 40 × 9 = 360
    expect(result.grossArea).toBeCloseTo(360, 0);
  });

  // ─── Test 11: Squares calculation ───
  it('calculates squares correctly (1 square = 100 sq ft)', () => {
    const result = calculateSiding({
      wallLength: 100, wallLengthUnit: 'ft', wallHeight: 10, wallHeightUnit: 'ft',
      gableArea: 0, windows: 0, windowArea: 15, doors: 0, doorArea: 21,
      sidingType: 'vinyl', wasteFactor: 0,
    });
    // Net = 1000 sq ft, waste = 0%, squares = 1000 / 100 = 10
    expect(result.squares).toBe(10);
  });

  // ─── Test 12: J-channel estimate ───
  it('calculates J-channel for vinyl siding', () => {
    const result = calculateSiding({
      wallLength: 40, wallLengthUnit: 'ft', wallHeight: 9, wallHeightUnit: 'ft',
      gableArea: 0, windows: 8, windowArea: 15, doors: 2, doorArea: 21,
      sidingType: 'vinyl', wasteFactor: 10,
    });
    // J-channel = ceil(8 × 3 + 2 × 2) × 12.5 = ceil(28) × 12.5 = 28 × 12.5 = 350
    expect(result.jChannel).toBe(350);
  });

  // ─── Test 13: Starter strip ───
  it('starter strip equals wall length', () => {
    const result = calculateSiding({
      wallLength: 40, wallLengthUnit: 'ft', wallHeight: 9, wallHeightUnit: 'ft',
      gableArea: 0, windows: 0, windowArea: 15, doors: 0, doorArea: 21,
      sidingType: 'vinyl', wasteFactor: 10,
    });
    expect(result.starterStrip).toBe(40);
  });

  // ─── Test 14: Opening deductions accuracy ───
  it('correctly computes opening deductions', () => {
    const result = calculateSiding({
      wallLength: 40, wallLengthUnit: 'ft', wallHeight: 9, wallHeightUnit: 'ft',
      gableArea: 0, windows: 5, windowArea: 18, doors: 3, doorArea: 24,
      sidingType: 'vinyl', wasteFactor: 10,
    });
    // Openings = (5 × 18) + (3 × 24) = 90 + 72 = 162
    expect(result.openingDeductions).toBe(162);
  });

  // ─── Test 15: Net area accuracy ───
  it('net area is gross minus openings', () => {
    const result = calculateSiding({
      wallLength: 50, wallLengthUnit: 'ft', wallHeight: 10, wallHeightUnit: 'ft',
      gableArea: 50, windows: 6, windowArea: 15, doors: 2, doorArea: 21,
      sidingType: 'fiber-cement', wasteFactor: 10,
    });
    const expectedGross = 50 * 10 + 50; // 550
    const expectedOpenings = 6 * 15 + 2 * 21; // 132
    expect(result.grossArea).toBe(expectedGross);
    expect(result.netArea).toBe(expectedGross - expectedOpenings);
  });

  // ─── Test 16: Cost varies by siding type ───
  it('different siding types produce different cost estimates', () => {
    const vinyl = calculateSiding({
      wallLength: 40, wallLengthUnit: 'ft', wallHeight: 9, wallHeightUnit: 'ft',
      gableArea: 0, windows: 0, windowArea: 15, doors: 0, doorArea: 21,
      sidingType: 'vinyl', wasteFactor: 10,
    });
    const fiberCement = calculateSiding({
      wallLength: 40, wallLengthUnit: 'ft', wallHeight: 9, wallHeightUnit: 'ft',
      gableArea: 0, windows: 0, windowArea: 15, doors: 0, doorArea: 21,
      sidingType: 'fiber-cement', wasteFactor: 10,
    });
    const vinylCost = (vinyl.costEstimate as Array<{ label: string; value: number }>)[2].value;
    const fcCost = (fiberCement.costEstimate as Array<{ label: string; value: number }>)[2].value;
    expect(fcCost).toBeGreaterThan(vinylCost);
  });

  // ─── Test 17: Waste factor impact ───
  it('higher waste factor increases area with waste', () => {
    const low = calculateSiding({
      wallLength: 40, wallLengthUnit: 'ft', wallHeight: 9, wallHeightUnit: 'ft',
      gableArea: 0, windows: 0, windowArea: 15, doors: 0, doorArea: 21,
      sidingType: 'vinyl', wasteFactor: 5,
    });
    const high = calculateSiding({
      wallLength: 40, wallLengthUnit: 'ft', wallHeight: 9, wallHeightUnit: 'ft',
      gableArea: 0, windows: 0, windowArea: 15, doors: 0, doorArea: 21,
      sidingType: 'vinyl', wasteFactor: 20,
    });
    expect(high.areaWithWaste).toBeGreaterThan(low.areaWithWaste as number);
  });

  // ─── Test 18: Output structure ───
  it('returns all expected output keys', () => {
    const result = calculateSiding({
      wallLength: 40, wallLengthUnit: 'ft', wallHeight: 9, wallHeightUnit: 'ft',
      gableArea: 0, windows: 8, windowArea: 15, doors: 2, doorArea: 21,
      sidingType: 'vinyl', wasteFactor: 10,
    });
    expect(result).toHaveProperty('netArea');
    expect(result).toHaveProperty('grossArea');
    expect(result).toHaveProperty('areaWithWaste');
    expect(result).toHaveProperty('squares');
    expect(result).toHaveProperty('panelsOrPlanks');
    expect(result).toHaveProperty('jChannel');
    expect(result).toHaveProperty('starterStrip');
    expect(result).toHaveProperty('openingDeductions');
    expect(result).toHaveProperty('costEstimate');
  });

  // ─── Test 19: Wood siding coverage ───
  it('calculates wood siding units with generic coverage', () => {
    const result = calculateSiding({
      wallLength: 40, wallLengthUnit: 'ft', wallHeight: 9, wallHeightUnit: 'ft',
      gableArea: 0, windows: 0, windowArea: 15, doors: 0, doorArea: 21,
      sidingType: 'wood', wasteFactor: 10,
    });
    // Net = 360, with waste = 396, wood coverage = 8 sq ft/unit
    // units = ceil(396 / 8) = 50
    expect(result.panelsOrPlanks).toBe(50);
  });

  // ─── Test 20: Metal siding coverage ───
  it('calculates metal siding panels correctly', () => {
    const result = calculateSiding({
      wallLength: 40, wallLengthUnit: 'ft', wallHeight: 9, wallHeightUnit: 'ft',
      gableArea: 0, windows: 0, windowArea: 15, doors: 0, doorArea: 21,
      sidingType: 'metal', wasteFactor: 10,
    });
    // Net = 360, with waste = 396, metal coverage = 16 sq ft/panel
    // panels = ceil(396 / 16) = 25
    expect(result.panelsOrPlanks).toBe(25);
  });
});
