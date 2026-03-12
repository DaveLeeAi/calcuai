import { calculateFence } from '@/lib/formulas/construction/fence';

describe('calculateFence', () => {
  // ─── Test 1: Standard 100 ft privacy fence, 6 ft high, 8 ft spacing ───
  it('calculates a standard privacy fence correctly', () => {
    const result = calculateFence({
      fenceLength: 100,
      fenceLengthUnit: 'ft',
      fenceHeight: 6,
      fenceType: 'privacy',
      postSpacing: 8,
      gateCount: 0,
      gateWidth: 4,
      boardWidth: 5.5,
    });
    // Posts = ceil(100/8) + 1 = 13 + 1 = 14
    expect(result.posts).toBe(14);
    // Rails = 13 sections × 2 rails = 26
    expect(result.rails).toBe(26);
    // Boards = ceil(100 / (5.5/12)) = ceil(100 / 0.4583) = ceil(218.18) = 219
    expect(result.boards).toBe(219);
  });

  // ─── Test 2: Fence with gate ───
  it('accounts for gate openings in fenced length', () => {
    const noGate = calculateFence({
      fenceLength: 100,
      fenceLengthUnit: 'ft',
      fenceHeight: 6,
      fenceType: 'privacy',
      postSpacing: 8,
      gateCount: 0,
      gateWidth: 4,
      boardWidth: 5.5,
    });
    const withGate = calculateFence({
      fenceLength: 100,
      fenceLengthUnit: 'ft',
      fenceHeight: 6,
      fenceType: 'privacy',
      postSpacing: 8,
      gateCount: 1,
      gateWidth: 4,
      boardWidth: 5.5,
    });
    // Gate subtracts 4 ft from fenced length but adds 2 gate posts
    expect(withGate.posts).toBeGreaterThanOrEqual(noGate.posts as number);
    // Boards should be fewer (less fenced length)
    expect(withGate.boards).toBeLessThan(noGate.boards as number);
  });

  // ─── Test 3: Picket fence — boards with gaps ───
  it('calculates fewer pickets due to gaps', () => {
    const privacy = calculateFence({
      fenceLength: 100,
      fenceLengthUnit: 'ft',
      fenceHeight: 4,
      fenceType: 'privacy',
      postSpacing: 8,
      gateCount: 0,
      gateWidth: 4,
      boardWidth: 3.5,
    });
    const picket = calculateFence({
      fenceLength: 100,
      fenceLengthUnit: 'ft',
      fenceHeight: 4,
      fenceType: 'picket',
      postSpacing: 8,
      gateCount: 0,
      gateWidth: 4,
      boardWidth: 3.5,
    });
    // Picket has gaps → fewer boards than privacy
    expect(picket.boards).toBeLessThan(privacy.boards as number);
  });

  // ─── Test 4: Board-on-board has ~1.5× more boards ───
  it('calculates more boards for board-on-board vs privacy', () => {
    const privacy = calculateFence({
      fenceLength: 100,
      fenceLengthUnit: 'ft',
      fenceHeight: 6,
      fenceType: 'privacy',
      postSpacing: 8,
      gateCount: 0,
      gateWidth: 4,
      boardWidth: 5.5,
    });
    const bob = calculateFence({
      fenceLength: 100,
      fenceLengthUnit: 'ft',
      fenceHeight: 6,
      fenceType: 'board-on-board',
      postSpacing: 8,
      gateCount: 0,
      gateWidth: 4,
      boardWidth: 5.5,
    });
    // Board-on-board ≈ 1.5× privacy boards
    expect(bob.boards).toBeGreaterThan(privacy.boards as number);
    expect(bob.boards).toBeCloseTo((privacy.boards as number) * 1.5, -1);
  });

  // ─── Test 5: Split rail has no boards ───
  it('returns 0 boards for split rail fence', () => {
    const result = calculateFence({
      fenceLength: 100,
      fenceLengthUnit: 'ft',
      fenceHeight: 4,
      fenceType: 'split-rail',
      postSpacing: 8,
      gateCount: 0,
      gateWidth: 4,
      boardWidth: 5.5,
    });
    expect(result.boards).toBe(0);
    expect(result.posts).toBeGreaterThan(0);
    expect(result.rails).toBeGreaterThan(0);
  });

  // ─── Test 6: 8 ft fence gets 3 rails per section ───
  it('uses 3 rails per section for fences over 6 ft', () => {
    const sixFt = calculateFence({
      fenceLength: 100,
      fenceLengthUnit: 'ft',
      fenceHeight: 6,
      fenceType: 'privacy',
      postSpacing: 8,
      gateCount: 0,
      gateWidth: 4,
      boardWidth: 5.5,
    });
    const eightFt = calculateFence({
      fenceLength: 100,
      fenceLengthUnit: 'ft',
      fenceHeight: 8,
      fenceType: 'privacy',
      postSpacing: 8,
      gateCount: 0,
      gateWidth: 4,
      boardWidth: 5.5,
    });
    // Same sections (12+1), but 8 ft gets 3 rails vs 2
    // 6 ft: 12 × 2 = 24 rails; 8 ft: 12 × 3 = 36 rails
    expect(eightFt.rails).toBeGreaterThan(sixFt.rails as number);
    const breakdown = eightFt.materialBreakdown as Array<{ label: string; value: number }>;
    const rps = breakdown.find(b => b.label === 'Rails per Section');
    expect(rps!.value).toBe(3);
  });

  // ─── Test 7: Concrete bags scale with post height ───
  it('calculates more concrete bags for taller fences', () => {
    const short = calculateFence({
      fenceLength: 100,
      fenceLengthUnit: 'ft',
      fenceHeight: 4,
      fenceType: 'privacy',
      postSpacing: 8,
      gateCount: 0,
      gateWidth: 4,
      boardWidth: 5.5,
    });
    const tall = calculateFence({
      fenceLength: 100,
      fenceLengthUnit: 'ft',
      fenceHeight: 8,
      fenceType: 'privacy',
      postSpacing: 8,
      gateCount: 0,
      gateWidth: 4,
      boardWidth: 5.5,
    });
    // More concrete per post for taller fence (deeper holes)
    expect(tall.concreteBags).toBeGreaterThan(short.concreteBags as number);
  });

  // ─── Test 8: 6 ft post spacing uses more posts ───
  it('calculates more posts with 6 ft spacing vs 8 ft', () => {
    const eight = calculateFence({
      fenceLength: 100,
      fenceLengthUnit: 'ft',
      fenceHeight: 6,
      fenceType: 'privacy',
      postSpacing: 8,
      gateCount: 0,
      gateWidth: 4,
      boardWidth: 5.5,
    });
    const six = calculateFence({
      fenceLength: 100,
      fenceLengthUnit: 'ft',
      fenceHeight: 6,
      fenceType: 'privacy',
      postSpacing: 6,
      gateCount: 0,
      gateWidth: 4,
      boardWidth: 5.5,
    });
    expect(six.posts).toBeGreaterThan(eight.posts as number);
  });

  // ─── Test 9: Cost estimate range ───
  it('returns cost estimate with low < mid < high', () => {
    const result = calculateFence({
      fenceLength: 100,
      fenceLengthUnit: 'ft',
      fenceHeight: 6,
      fenceType: 'privacy',
      postSpacing: 8,
      gateCount: 1,
      gateWidth: 4,
      boardWidth: 5.5,
    });
    const cost = result.costEstimate as Array<{ label: string; value: number }>;
    expect(cost).toHaveLength(3);
    expect(cost[0].value).toBeLessThan(cost[1].value);
    expect(cost[1].value).toBeLessThan(cost[2].value);
  });

  // ─── Test 10: Chain link measured in rolls ───
  it('calculates chain link fabric in rolls', () => {
    const result = calculateFence({
      fenceLength: 200,
      fenceLengthUnit: 'ft',
      fenceHeight: 6,
      fenceType: 'chain-link',
      postSpacing: 8,
      gateCount: 1,
      gateWidth: 4,
      boardWidth: 5.5,
    });
    // "boards" for chain link = rolls (50 ft per roll)
    // Fenced length = 200 - 4 = 196 → ceil(196/50) = 4 rolls
    expect(result.boards).toBe(4);
  });

  // ─── Test 11: Post caps equal total posts ───
  it('returns post caps matching total post count', () => {
    const result = calculateFence({
      fenceLength: 100,
      fenceLengthUnit: 'ft',
      fenceHeight: 6,
      fenceType: 'privacy',
      postSpacing: 8,
      gateCount: 1,
      gateWidth: 4,
      boardWidth: 5.5,
    });
    expect(result.postCaps).toBe(result.posts);
  });

  // ─── Test 12: Unit conversion — meters ───
  it('converts meters to feet correctly', () => {
    const result = calculateFence({
      fenceLength: 30.48,   // 100 ft
      fenceLengthUnit: 'm',
      fenceHeight: 6,
      fenceType: 'privacy',
      postSpacing: 8,
      gateCount: 0,
      gateWidth: 4,
      boardWidth: 5.5,
    });
    const breakdown = result.materialBreakdown as Array<{ label: string; value: number }>;
    const totalLength = breakdown.find(b => b.label.includes('Total Fence Length'));
    expect(totalLength!.value).toBeCloseTo(100, 0);
  });
});
