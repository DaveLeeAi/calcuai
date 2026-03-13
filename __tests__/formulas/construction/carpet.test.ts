import { calculateCarpet } from '@/lib/formulas/construction/carpet';

describe('calculateCarpet', () => {
  // ─── Test 1: Standard 15×12 room ───
  it('calculates a standard 15×12 room correctly', () => {
    const result = calculateCarpet({
      roomLength: 15,
      roomLengthUnit: 'ft',
      roomWidth: 12,
      roomWidthUnit: 'ft',
      carpetWidth: '12',
      closets: 0,
      closetArea: 6,
      wasteFactor: 10,
    });
    // Room area = 15 × 12 = 180 sq ft
    expect(result.roomArea).toBe(180);
    // Total with waste = 180 × 1.10 = 198 sq ft
    expect(result.squareFeet).toBe(198);
    // Square yards = 198 / 9 = 22
    expect(result.squareYards).toBe(22);
  });

  // ─── Test 2: Large room (25×20) ───
  it('handles a large room', () => {
    const result = calculateCarpet({
      roomLength: 25,
      roomLengthUnit: 'ft',
      roomWidth: 20,
      roomWidthUnit: 'ft',
      carpetWidth: '12',
      closets: 0,
      closetArea: 6,
      wasteFactor: 10,
    });
    // Room area = 25 × 20 = 500
    expect(result.roomArea).toBe(500);
    // With waste = 500 × 1.1 = 550
    expect(result.squareFeet).toBe(550);
    // Sq yd = 550 / 9 ≈ 61.11
    expect(result.squareYards).toBeCloseTo(61.11, 1);
  });

  // ─── Test 3: Small room (10×10) ───
  it('handles a small square room', () => {
    const result = calculateCarpet({
      roomLength: 10,
      roomLengthUnit: 'ft',
      roomWidth: 10,
      roomWidthUnit: 'ft',
      carpetWidth: '12',
      closets: 0,
      closetArea: 6,
      wasteFactor: 10,
    });
    expect(result.roomArea).toBe(100);
    expect(result.squareFeet).toBe(110);
    expect(result.squareYards).toBeCloseTo(12.22, 1);
  });

  // ─── Test 4: With 2 closets ───
  it('adds closet area to total', () => {
    const result = calculateCarpet({
      roomLength: 15,
      roomLengthUnit: 'ft',
      roomWidth: 12,
      roomWidthUnit: 'ft',
      carpetWidth: '12',
      closets: 2,
      closetArea: 6,
      wasteFactor: 10,
    });
    // Room area = 180, closets = 2 × 6 = 12, total = 192
    // With waste = 192 × 1.1 = 211.2
    expect(result.roomArea).toBe(180);
    expect(result.squareFeet).toBe(211.2);
  });

  // ─── Test 5: 15ft roll width ───
  it('adjusts linear feet for 15ft roll width', () => {
    const result12 = calculateCarpet({
      roomLength: 15, roomLengthUnit: 'ft', roomWidth: 12, roomWidthUnit: 'ft',
      carpetWidth: '12', closets: 0, closetArea: 6, wasteFactor: 10,
    });
    const result15 = calculateCarpet({
      roomLength: 15, roomLengthUnit: 'ft', roomWidth: 12, roomWidthUnit: 'ft',
      carpetWidth: '15', closets: 0, closetArea: 6, wasteFactor: 10,
    });
    // Different roll widths produce different linear feet
    expect(result12.linearFeet).not.toBe(result15.linearFeet);
  });

  // ─── Test 6: No waste factor ───
  it('calculates correctly with zero waste', () => {
    const result = calculateCarpet({
      roomLength: 15, roomLengthUnit: 'ft', roomWidth: 12, roomWidthUnit: 'ft',
      carpetWidth: '12', closets: 0, closetArea: 6, wasteFactor: 0,
    });
    // No waste: squareFeet should equal roomArea
    expect(result.squareFeet).toBe(180);
    expect(result.roomArea).toBe(180);
  });

  // ─── Test 7: Metric inputs ───
  it('converts meters to feet correctly', () => {
    const result = calculateCarpet({
      roomLength: 4.572,       // 15 ft
      roomLengthUnit: 'm',
      roomWidth: 3.6576,       // 12 ft
      roomWidthUnit: 'm',
      carpetWidth: '12',
      closets: 0,
      closetArea: 6,
      wasteFactor: 10,
    });
    // Should be close to 15 × 12 = 180 sq ft room
    expect(result.roomArea).toBeCloseTo(180, 0);
  });

  // ─── Test 8: Zero dimensions ───
  it('returns zeros for zero dimensions', () => {
    const result = calculateCarpet({
      roomLength: 0, roomLengthUnit: 'ft', roomWidth: 12, roomWidthUnit: 'ft',
      carpetWidth: '12', closets: 0, closetArea: 6, wasteFactor: 10,
    });
    expect(result.squareFeet).toBe(0);
    expect(result.squareYards).toBe(0);
    expect(result.linearFeet).toBe(0);
    expect(result.seams).toBe(0);
    expect(result.roomArea).toBe(0);
  });

  // ─── Test 9: Square yard conversion accuracy ───
  it('converts square feet to square yards correctly', () => {
    const result = calculateCarpet({
      roomLength: 9, roomLengthUnit: 'ft', roomWidth: 9, roomWidthUnit: 'ft',
      carpetWidth: '12', closets: 0, closetArea: 6, wasteFactor: 0,
    });
    // 81 sq ft / 9 = 9 sq yd exactly
    expect(result.squareFeet).toBe(81);
    expect(result.squareYards).toBe(9);
  });

  // ─── Test 10: Linear feet calculation ───
  it('calculates linear feet based on roll width', () => {
    const result = calculateCarpet({
      roomLength: 15, roomLengthUnit: 'ft', roomWidth: 12, roomWidthUnit: 'ft',
      carpetWidth: '12', closets: 0, closetArea: 6, wasteFactor: 10,
    });
    // totalWithWaste = 198, carpetWidth = 12
    // rollStrips = ceil(198 / 12) = 17
    // linearFeet = 17 × 12 = 204
    expect(result.linearFeet).toBe(204);
  });

  // ─── Test 11: Seam count — room wider than roll ───
  it('calculates seams when room wider than carpet roll', () => {
    const result = calculateCarpet({
      roomLength: 15, roomLengthUnit: 'ft', roomWidth: 18, roomWidthUnit: 'ft',
      carpetWidth: '12', closets: 0, closetArea: 6, wasteFactor: 10,
    });
    // Width 18 ft, carpet 12 ft: ceil(18/12) - 1 = 2 - 1 = 1 seam
    expect(result.seams).toBe(1);
  });

  // ─── Test 12: No seams — room narrower than roll ───
  it('returns zero seams when room fits in one roll width', () => {
    const result = calculateCarpet({
      roomLength: 15, roomLengthUnit: 'ft', roomWidth: 10, roomWidthUnit: 'ft',
      carpetWidth: '12', closets: 0, closetArea: 6, wasteFactor: 10,
    });
    // Width 10 ft, carpet 12 ft: ceil(10/12) - 1 = 1 - 1 = 0 seams
    expect(result.seams).toBe(0);
  });

  // ─── Test 13: Padding matches carpet ───
  it('padding square yards equals carpet square yards', () => {
    const result = calculateCarpet({
      roomLength: 15, roomLengthUnit: 'ft', roomWidth: 12, roomWidthUnit: 'ft',
      carpetWidth: '12', closets: 0, closetArea: 6, wasteFactor: 10,
    });
    expect(result.paddingSqYd).toBe(result.squareYards);
  });

  // ─── Test 14: Cost tiers ordering ───
  it('cost estimates are in ascending order', () => {
    const result = calculateCarpet({
      roomLength: 15, roomLengthUnit: 'ft', roomWidth: 12, roomWidthUnit: 'ft',
      carpetWidth: '12', closets: 0, closetArea: 6, wasteFactor: 10,
    });
    const cost = result.costEstimate as Array<{ label: string; value: number }>;
    expect(cost).toHaveLength(5);
    // Budget < Mid-Range < Premium
    expect(cost[0].value).toBeLessThan(cost[1].value);
    expect(cost[1].value).toBeLessThan(cost[2].value);
  });

  // ─── Test 15: Room area vs total area with closets ───
  it('distinguishes room area from total area with closets', () => {
    const result = calculateCarpet({
      roomLength: 15, roomLengthUnit: 'ft', roomWidth: 12, roomWidthUnit: 'ft',
      carpetWidth: '12', closets: 3, closetArea: 8, wasteFactor: 10,
    });
    // Room = 180, closets = 3 × 8 = 24, total = 204
    // With waste = 204 × 1.1 = 224.4
    expect(result.roomArea).toBe(180);
    expect(result.squareFeet).toBe(224.4);
  });

  // ─── Test 16: Output structure ───
  it('returns all expected output keys', () => {
    const result = calculateCarpet({
      roomLength: 15, roomLengthUnit: 'ft', roomWidth: 12, roomWidthUnit: 'ft',
      carpetWidth: '12', closets: 0, closetArea: 6, wasteFactor: 10,
    });
    expect(result).toHaveProperty('squareFeet');
    expect(result).toHaveProperty('squareYards');
    expect(result).toHaveProperty('linearFeet');
    expect(result).toHaveProperty('seams');
    expect(result).toHaveProperty('paddingSqYd');
    expect(result).toHaveProperty('roomArea');
    expect(result).toHaveProperty('costEstimate');
  });

  // ─── Test 17: Very large room with multiple seams ───
  it('handles a very wide room requiring multiple seams', () => {
    const result = calculateCarpet({
      roomLength: 20, roomLengthUnit: 'ft', roomWidth: 30, roomWidthUnit: 'ft',
      carpetWidth: '12', closets: 0, closetArea: 6, wasteFactor: 10,
    });
    // Width 30 ft, carpet 12 ft: ceil(30/12) - 1 = 3 - 1 = 2 seams
    expect(result.seams).toBe(2);
  });

  // ─── Test 18: Zero closets has no effect ───
  it('zero closets adds nothing to area', () => {
    const withClosets = calculateCarpet({
      roomLength: 15, roomLengthUnit: 'ft', roomWidth: 12, roomWidthUnit: 'ft',
      carpetWidth: '12', closets: 0, closetArea: 6, wasteFactor: 10,
    });
    const noClosets = calculateCarpet({
      roomLength: 15, roomLengthUnit: 'ft', roomWidth: 12, roomWidthUnit: 'ft',
      carpetWidth: '12', closets: 0, closetArea: 0, wasteFactor: 10,
    });
    expect(withClosets.squareFeet).toBe(noClosets.squareFeet);
  });
});
