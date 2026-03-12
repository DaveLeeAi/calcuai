import { calculateBoardFoot } from '@/lib/formulas/construction/board-foot';

describe('calculateBoardFoot', () => {
  // ─── Test 1: Standard 2×6×8 board ───
  it('calculates board feet for a 2×6×8 correctly', () => {
    const result = calculateBoardFoot({
      thickness: 2,
      width: 6,
      length: 8,
      lengthUnit: 'ft',
      quantity: 1,
      pricePerBdFt: 5,
      useNominal: true,
    });
    // BF = (2 × 6 × 96) / 144 = 1152 / 144 = 8.0
    expect(result.boardFeetPerPiece).toBe(8);
    expect(result.totalBoardFeet).toBe(8);
    expect(result.totalCost).toBe(40); // 8 × $5
  });

  // ─── Test 2: Standard 2×4×8 board ───
  it('calculates board feet for a 2×4×8 correctly', () => {
    const result = calculateBoardFoot({
      thickness: 2,
      width: 4,
      length: 8,
      lengthUnit: 'ft',
      quantity: 1,
      pricePerBdFt: 4,
      useNominal: true,
    });
    // BF = (2 × 4 × 96) / 144 = 768 / 144 = 5.333
    expect(result.boardFeetPerPiece).toBeCloseTo(5.33, 1);
  });

  // ─── Test 3: Multiple pieces ───
  it('multiplies board feet by quantity', () => {
    const result = calculateBoardFoot({
      thickness: 2,
      width: 6,
      length: 8,
      lengthUnit: 'ft',
      quantity: 10,
      pricePerBdFt: 5,
      useNominal: true,
    });
    // BF per piece = 8, total = 80
    expect(result.totalBoardFeet).toBe(80);
    expect(result.totalCost).toBe(400);
  });

  // ─── Test 4: 1×12×12 board ───
  it('calculates board feet for a 1×12×12 correctly', () => {
    const result = calculateBoardFoot({
      thickness: 1,
      width: 12,
      length: 12,
      lengthUnit: 'ft',
      quantity: 1,
      pricePerBdFt: 6,
      useNominal: true,
    });
    // BF = (1 × 12 × 144) / 144 = 12.0
    expect(result.boardFeetPerPiece).toBe(12);
  });

  // ─── Test 5: Length in inches ───
  it('handles length in inches correctly', () => {
    const result = calculateBoardFoot({
      thickness: 2,
      width: 6,
      length: 96,        // 96 inches = 8 ft
      lengthUnit: 'in',
      quantity: 1,
      pricePerBdFt: 5,
      useNominal: true,
    });
    // BF = (2 × 6 × 96) / 144 = 8.0
    expect(result.boardFeetPerPiece).toBe(8);
  });

  // ─── Test 6: Price calculation ───
  it('calculates total cost correctly at different prices', () => {
    const result = calculateBoardFoot({
      thickness: 2,
      width: 6,
      length: 8,
      lengthUnit: 'ft',
      quantity: 5,
      pricePerBdFt: 8.50,
      useNominal: true,
    });
    // 5 pieces × 8 BF = 40 BF × $8.50 = $340
    expect(result.totalCost).toBe(340);
  });

  // ─── Test 7: Zero price → zero cost ───
  it('returns zero cost when price is 0', () => {
    const result = calculateBoardFoot({
      thickness: 2,
      width: 6,
      length: 8,
      lengthUnit: 'ft',
      quantity: 10,
      pricePerBdFt: 0,
      useNominal: true,
    });
    expect(result.totalCost).toBe(0);
    expect(result.totalBoardFeet).toBe(80); // volume still calculated
  });

  // ─── Test 8: Cubic feet calculation ───
  it('calculates cubic feet using actual dimensions', () => {
    const result = calculateBoardFoot({
      thickness: 2,
      width: 6,
      length: 8,
      lengthUnit: 'ft',
      quantity: 1,
      pricePerBdFt: 5,
      useNominal: true,
    });
    // Actual dims: 1.5 × 5.5 × 96 = 792 cu in / 1728 = 0.4583 cu ft
    expect(result.cubicFeet).toBeCloseTo(0.4583, 3);
  });

  // ─── Test 9: 4/4 hardwood (1 inch thick) ───
  it('calculates board feet for 4/4 hardwood correctly', () => {
    const result = calculateBoardFoot({
      thickness: 1,
      width: 8,
      length: 10,
      lengthUnit: 'ft',
      quantity: 1,
      pricePerBdFt: 10,
      useNominal: true,
    });
    // BF = (1 × 8 × 120) / 144 = 6.667
    expect(result.boardFeetPerPiece).toBeCloseTo(6.67, 1);
  });

  // ─── Test 10: Large order — deck framing ───
  it('handles a large lumber order correctly', () => {
    const result = calculateBoardFoot({
      thickness: 2,
      width: 10,
      length: 16,
      lengthUnit: 'ft',
      quantity: 24,
      pricePerBdFt: 6,
      useNominal: true,
    });
    // BF per piece = (2 × 10 × 192) / 144 = 26.667
    // Total = 26.667 × 24 = 640
    expect(result.boardFeetPerPiece).toBeCloseTo(26.67, 0);
    expect(result.totalBoardFeet).toBeCloseTo(640, 0);
    expect(result.totalCost).toBeCloseTo(3840, 0);
  });

  // ─── Test 11: Piece breakdown ───
  it('returns complete piece breakdown', () => {
    const result = calculateBoardFoot({
      thickness: 2,
      width: 6,
      length: 8,
      lengthUnit: 'ft',
      quantity: 5,
      pricePerBdFt: 5,
      useNominal: true,
    });
    const breakdown = result.pieceBreakdown as Array<{ label: string; value: number }>;
    expect(breakdown.length).toBeGreaterThanOrEqual(5);
    const quantityEntry = breakdown.find(b => b.label === 'Quantity');
    expect(quantityEntry!.value).toBe(5);
  });

  // ─── Test 12: Short piece — 2 ft board ───
  it('handles short lumber pieces', () => {
    const result = calculateBoardFoot({
      thickness: 1,
      width: 6,
      length: 2,
      lengthUnit: 'ft',
      quantity: 1,
      pricePerBdFt: 5,
      useNominal: true,
    });
    // BF = (1 × 6 × 24) / 144 = 1.0
    expect(result.boardFeetPerPiece).toBe(1);
  });
});
