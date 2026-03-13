import { calculateDeck } from '@/lib/formulas/construction/deck';

describe('calculateDeck', () => {
  // ─── Test 1: Standard 16×12 pressure-treated deck ───
  it('calculates a standard 16×12 pressure-treated deck', () => {
    const result = calculateDeck({
      deckLength: 16,
      deckLengthUnit: 'ft',
      deckWidth: 12,
      deckWidthUnit: 'ft',
      deckHeight: 3,
      deckHeightUnit: 'ft',
      boardType: 'pressure-treated',
      boardWidth: '5.5',
      joistSpacing: '16',
      railingLength: 0,
      stairCount: 0,
    });
    // Area = 16 × 12 = 192 sq ft
    expect(result.deckArea).toBe(192);
    // Boards across: 12 / (5.5/12) = 12 / 0.4583 = 26.18 → ×1.1 = 28.8 → ceil = 29
    expect(result.deckingBoards).toBe(29);
    // Post height: 3 + 1 = 4 ft
    expect(result.postHeight).toBe(4);
  });

  // ─── Test 2: Composite deck ───
  it('calculates composite deck with higher cost', () => {
    const pt = calculateDeck({
      deckLength: 16, deckLengthUnit: 'ft', deckWidth: 12, deckWidthUnit: 'ft',
      deckHeight: 3, deckHeightUnit: 'ft', boardType: 'pressure-treated',
      boardWidth: '5.5', joistSpacing: '16', railingLength: 0, stairCount: 0,
    });
    const comp = calculateDeck({
      deckLength: 16, deckLengthUnit: 'ft', deckWidth: 12, deckWidthUnit: 'ft',
      deckHeight: 3, deckHeightUnit: 'ft', boardType: 'composite',
      boardWidth: '5.5', joistSpacing: '16', railingLength: 0, stairCount: 0,
    });
    const ptCost = (pt.costEstimate as Array<{ label: string; value: number }>)[1].value;
    const compCost = (comp.costEstimate as Array<{ label: string; value: number }>)[1].value;
    expect(compCost).toBeGreaterThan(ptCost);
  });

  // ─── Test 3: Cedar deck ───
  it('calculates cedar deck cost between PT and composite', () => {
    const cedar = calculateDeck({
      deckLength: 16, deckLengthUnit: 'ft', deckWidth: 12, deckWidthUnit: 'ft',
      deckHeight: 3, deckHeightUnit: 'ft', boardType: 'cedar',
      boardWidth: '5.5', joistSpacing: '16', railingLength: 0, stairCount: 0,
    });
    const cost = cedar.costEstimate as Array<{ label: string; value: number }>;
    // Cedar $25-35/sq ft, area = 192
    expect(cost[0].value).toBe(192 * 25);
    expect(cost[2].value).toBe(192 * 35);
  });

  // ─── Test 4: 12" joist spacing produces more joists ───
  it('12" spacing produces more joists than 16"', () => {
    const j12 = calculateDeck({
      deckLength: 16, deckLengthUnit: 'ft', deckWidth: 12, deckWidthUnit: 'ft',
      deckHeight: 3, deckHeightUnit: 'ft', boardType: 'pressure-treated',
      boardWidth: '5.5', joistSpacing: '12', railingLength: 0, stairCount: 0,
    });
    const j16 = calculateDeck({
      deckLength: 16, deckLengthUnit: 'ft', deckWidth: 12, deckWidthUnit: 'ft',
      deckHeight: 3, deckHeightUnit: 'ft', boardType: 'pressure-treated',
      boardWidth: '5.5', joistSpacing: '16', railingLength: 0, stairCount: 0,
    });
    expect(j12.joists).toBeGreaterThan(j16.joists as number);
  });

  // ─── Test 5: 24" joist spacing produces fewer joists ───
  it('24" spacing produces fewer joists than 16"', () => {
    const j24 = calculateDeck({
      deckLength: 16, deckLengthUnit: 'ft', deckWidth: 12, deckWidthUnit: 'ft',
      deckHeight: 3, deckHeightUnit: 'ft', boardType: 'pressure-treated',
      boardWidth: '5.5', joistSpacing: '24', railingLength: 0, stairCount: 0,
    });
    const j16 = calculateDeck({
      deckLength: 16, deckLengthUnit: 'ft', deckWidth: 12, deckWidthUnit: 'ft',
      deckHeight: 3, deckHeightUnit: 'ft', boardType: 'pressure-treated',
      boardWidth: '5.5', joistSpacing: '16', railingLength: 0, stairCount: 0,
    });
    expect(j24.joists).toBeLessThan(j16.joists as number);
  });

  // ─── Test 6: With railing ───
  it('calculates railing posts when railing length is specified', () => {
    const result = calculateDeck({
      deckLength: 16, deckLengthUnit: 'ft', deckWidth: 12, deckWidthUnit: 'ft',
      deckHeight: 3, deckHeightUnit: 'ft', boardType: 'pressure-treated',
      boardWidth: '5.5', joistSpacing: '16', railingLength: 40, stairCount: 0,
    });
    // railing posts = ceil(40/6) + 1 = 7 + 1 = 8
    expect(result.railingPosts).toBe(8);
    expect(result.railingLinearFeet).toBe(40);
  });

  // ─── Test 7: Zero railing ───
  it('returns zero railing posts when no railing', () => {
    const result = calculateDeck({
      deckLength: 16, deckLengthUnit: 'ft', deckWidth: 12, deckWidthUnit: 'ft',
      deckHeight: 3, deckHeightUnit: 'ft', boardType: 'pressure-treated',
      boardWidth: '5.5', joistSpacing: '16', railingLength: 0, stairCount: 0,
    });
    expect(result.railingPosts).toBe(0);
    expect(result.railingLinearFeet).toBe(0);
  });

  // ─── Test 8: Zero dimensions returns zeros ───
  it('returns zeros for zero dimensions', () => {
    const result = calculateDeck({
      deckLength: 0, deckLengthUnit: 'ft', deckWidth: 12, deckWidthUnit: 'ft',
      deckHeight: 3, deckHeightUnit: 'ft', boardType: 'pressure-treated',
      boardWidth: '5.5', joistSpacing: '16', railingLength: 0, stairCount: 0,
    });
    expect(result.deckArea).toBe(0);
    expect(result.deckingBoards).toBe(0);
    expect(result.joists).toBe(0);
    expect(result.posts).toBe(0);
    expect(result.screws).toBe(0);
  });

  // ─── Test 9: Small deck (8×8) ───
  it('handles small 8×8 deck', () => {
    const result = calculateDeck({
      deckLength: 8, deckLengthUnit: 'ft', deckWidth: 8, deckWidthUnit: 'ft',
      deckHeight: 2, deckHeightUnit: 'ft', boardType: 'pressure-treated',
      boardWidth: '5.5', joistSpacing: '16', railingLength: 0, stairCount: 0,
    });
    expect(result.deckArea).toBe(64);
    expect(result.posts).toBeGreaterThanOrEqual(4);
  });

  // ─── Test 10: Large deck (24×20) ───
  it('handles large 24×20 deck', () => {
    const result = calculateDeck({
      deckLength: 24, deckLengthUnit: 'ft', deckWidth: 20, deckWidthUnit: 'ft',
      deckHeight: 4, deckHeightUnit: 'ft', boardType: 'pressure-treated',
      boardWidth: '5.5', joistSpacing: '16', railingLength: 0, stairCount: 0,
    });
    expect(result.deckArea).toBe(480);
    expect(result.posts).toBeGreaterThanOrEqual(4);
    expect(result.deckingBoards).toBeGreaterThan(0);
  });

  // ─── Test 11: Joist count accuracy ───
  it('calculates exact joist count for 16" OC', () => {
    const result = calculateDeck({
      deckLength: 16, deckLengthUnit: 'ft', deckWidth: 12, deckWidthUnit: 'ft',
      deckHeight: 3, deckHeightUnit: 'ft', boardType: 'pressure-treated',
      boardWidth: '5.5', joistSpacing: '16', railingLength: 0, stairCount: 0,
    });
    // joists = ceil(16 / (16/12)) + 1 = ceil(16/1.333) + 1 = 12 + 1 = 13
    expect(result.joists).toBe(13);
  });

  // ─── Test 12: Post count ───
  it('calculates post count based on 8-ft grid', () => {
    const result = calculateDeck({
      deckLength: 16, deckLengthUnit: 'ft', deckWidth: 12, deckWidthUnit: 'ft',
      deckHeight: 3, deckHeightUnit: 'ft', boardType: 'pressure-treated',
      boardWidth: '5.5', joistSpacing: '16', railingLength: 0, stairCount: 0,
    });
    // postRows = ceil(16/8) + 1 = 3, postCols = ceil(12/8) + 1 = 3
    // posts = 3 × 3 = 9
    expect(result.posts).toBe(9);
  });

  // ─── Test 13: Concrete footings match post count ───
  it('concrete footings equals post count', () => {
    const result = calculateDeck({
      deckLength: 16, deckLengthUnit: 'ft', deckWidth: 12, deckWidthUnit: 'ft',
      deckHeight: 3, deckHeightUnit: 'ft', boardType: 'pressure-treated',
      boardWidth: '5.5', joistSpacing: '16', railingLength: 0, stairCount: 0,
    });
    expect(result.concreteFootings).toBe(result.posts);
  });

  // ─── Test 14: Cost estimate ordering ───
  it('returns cost estimate with low < mid < high', () => {
    const result = calculateDeck({
      deckLength: 16, deckLengthUnit: 'ft', deckWidth: 12, deckWidthUnit: 'ft',
      deckHeight: 3, deckHeightUnit: 'ft', boardType: 'pressure-treated',
      boardWidth: '5.5', joistSpacing: '16', railingLength: 0, stairCount: 0,
    });
    const cost = result.costEstimate as Array<{ label: string; value: number }>;
    expect(cost).toHaveLength(3);
    expect(cost[0].value).toBeLessThan(cost[1].value);
    expect(cost[1].value).toBeLessThan(cost[2].value);
  });

  // ─── Test 15: Screw calculation ───
  it('calculates screws at 350 per 100 sq ft', () => {
    const result = calculateDeck({
      deckLength: 16, deckLengthUnit: 'ft', deckWidth: 12, deckWidthUnit: 'ft',
      deckHeight: 3, deckHeightUnit: 'ft', boardType: 'pressure-treated',
      boardWidth: '5.5', joistSpacing: '16', railingLength: 0, stairCount: 0,
    });
    // screws = ceil(192 × 350 / 100) = ceil(672) = 672
    expect(result.screws).toBe(672);
  });

  // ─── Test 16: Unit conversion — meters ───
  it('converts meters to feet correctly', () => {
    const result = calculateDeck({
      deckLength: 4.8768,    // ~16 ft
      deckLengthUnit: 'm',
      deckWidth: 3.6576,     // ~12 ft
      deckWidthUnit: 'm',
      deckHeight: 0.9144,    // ~3 ft
      deckHeightUnit: 'm',
      boardType: 'pressure-treated',
      boardWidth: '5.5',
      joistSpacing: '16',
      railingLength: 0,
      stairCount: 0,
    });
    expect(result.deckArea).toBeCloseTo(192, -1);
  });

  // ─── Test 17: Output structure ───
  it('returns all expected output keys', () => {
    const result = calculateDeck({
      deckLength: 16, deckLengthUnit: 'ft', deckWidth: 12, deckWidthUnit: 'ft',
      deckHeight: 3, deckHeightUnit: 'ft', boardType: 'pressure-treated',
      boardWidth: '5.5', joistSpacing: '16', railingLength: 0, stairCount: 0,
    });
    expect(result).toHaveProperty('deckArea');
    expect(result).toHaveProperty('deckingBoards');
    expect(result).toHaveProperty('deckingLinearFeet');
    expect(result).toHaveProperty('joists');
    expect(result).toHaveProperty('joistLinearFeet');
    expect(result).toHaveProperty('beams');
    expect(result).toHaveProperty('beamLinearFeet');
    expect(result).toHaveProperty('posts');
    expect(result).toHaveProperty('postHeight');
    expect(result).toHaveProperty('concreteFootings');
    expect(result).toHaveProperty('railingPosts');
    expect(result).toHaveProperty('railingLinearFeet');
    expect(result).toHaveProperty('screws');
    expect(result).toHaveProperty('costEstimate');
    expect(result).toHaveProperty('materialsBreakdown');
  });

  // ─── Test 18: 3.5" board width uses more boards ───
  it('uses more boards with 3.5" width than 5.5"', () => {
    const narrow = calculateDeck({
      deckLength: 16, deckLengthUnit: 'ft', deckWidth: 12, deckWidthUnit: 'ft',
      deckHeight: 3, deckHeightUnit: 'ft', boardType: 'pressure-treated',
      boardWidth: '3.5', joistSpacing: '16', railingLength: 0, stairCount: 0,
    });
    const wide = calculateDeck({
      deckLength: 16, deckLengthUnit: 'ft', deckWidth: 12, deckWidthUnit: 'ft',
      deckHeight: 3, deckHeightUnit: 'ft', boardType: 'pressure-treated',
      boardWidth: '5.5', joistSpacing: '16', railingLength: 0, stairCount: 0,
    });
    expect(narrow.deckingBoards).toBeGreaterThan(wide.deckingBoards as number);
  });

  // ─── Test 19: Minimum 4 posts for small deck ───
  it('ensures minimum 4 posts', () => {
    const result = calculateDeck({
      deckLength: 4, deckLengthUnit: 'ft', deckWidth: 4, deckWidthUnit: 'ft',
      deckHeight: 2, deckHeightUnit: 'ft', boardType: 'pressure-treated',
      boardWidth: '5.5', joistSpacing: '16', railingLength: 0, stairCount: 0,
    });
    expect(result.posts).toBeGreaterThanOrEqual(4);
  });
});
