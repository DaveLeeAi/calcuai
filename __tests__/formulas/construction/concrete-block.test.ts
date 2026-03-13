import { calculateConcreteBlock } from '@/lib/formulas/construction/concrete-block';

describe('calculateConcreteBlock', () => {
  // ─── Test 1: Standard wall — 20×8 with 8x8x16 blocks, 3/8" joint, 5% waste ───
  it('calculates a standard 20×8 wall with 8x8x16 blocks', () => {
    const result = calculateConcreteBlock({
      wallLength: 20,
      wallHeight: 8,
      blockSize: '8x8x16',
      mortarJoint: 0.375,
      openings: 0,
      openingArea: 15,
      wasteFactor: 5,
    });
    expect(result.wallArea).toBe(160);
    // Effective face: (16 + 0.375) × (8 + 0.375) / 144 = 16.375 × 8.375 / 144 = 0.95182 sq ft
    // Blocks per sq ft = 1 / 0.95182 ≈ 1.0506
    // Blocks without waste: ceil(160 × 1.0506) = ceil(168.1) = 169
    expect(result.blocksWithoutWaste).toBeGreaterThan(165);
    expect(result.blocksWithoutWaste).toBeLessThan(175);
    // With 5% waste
    expect(result.totalBlocks).toBeGreaterThan(result.blocksWithoutWaste as number);
  });

  // ─── Test 2: Half-height blocks (8x4x16) ───
  it('calculates with half-height 8x4x16 blocks', () => {
    const result = calculateConcreteBlock({
      wallLength: 10,
      wallHeight: 8,
      blockSize: '8x4x16',
      mortarJoint: 0.375,
      openings: 0,
      openingArea: 15,
      wasteFactor: 5,
    });
    expect(result.wallArea).toBe(80);
    // 8x4x16: height=8, depth=4, length=16 (same face area as standard — only depth differs)
    // Face area same as 8x8x16 → same blocks per sq ft
    expect(result.blocksWithoutWaste).toBeGreaterThan(80);
    expect(result.blocksWithoutWaste).toBeLessThan(90);
  });

  // ─── Test 3: Thick wall blocks (12x8x16) ───
  it('calculates with 12x8x16 thick wall blocks', () => {
    const result = calculateConcreteBlock({
      wallLength: 10,
      wallHeight: 8,
      blockSize: '12x8x16',
      mortarJoint: 0.375,
      openings: 0,
      openingArea: 15,
      wasteFactor: 5,
    });
    expect(result.wallArea).toBe(80);
    // 12x8x16 has same face dimensions as 8x8x16 (H=8, L=16)
    // Only depth differs (12" vs 8") — block count same, but fill concrete larger
    expect(result.fillConcrete).toBeGreaterThan(0);
  });

  // ─── Test 4: Thin wall blocks (6x8x16) ───
  it('calculates with 6x8x16 thin wall blocks', () => {
    const result = calculateConcreteBlock({
      wallLength: 10,
      wallHeight: 8,
      blockSize: '6x8x16',
      mortarJoint: 0.375,
      openings: 0,
      openingArea: 15,
      wasteFactor: 5,
    });
    expect(result.wallArea).toBe(80);
    // Fill concrete should be smaller than standard 8" blocks
    const standardResult = calculateConcreteBlock({
      wallLength: 10,
      wallHeight: 8,
      blockSize: '8x8x16',
      mortarJoint: 0.375,
      openings: 0,
      openingArea: 15,
      wasteFactor: 5,
    });
    expect(result.fillConcrete).toBeLessThan(standardResult.fillConcrete as number);
  });

  // ─── Test 5: Wall with openings ───
  it('deducts area for 2 openings', () => {
    const result = calculateConcreteBlock({
      wallLength: 20,
      wallHeight: 8,
      blockSize: '8x8x16',
      mortarJoint: 0.375,
      openings: 2,
      openingArea: 15,
      wasteFactor: 5,
    });
    // Gross: 160, deduct 2 × 15 = 30, net = 130
    expect(result.wallArea).toBe(130);
    expect(result.blocksWithoutWaste).toBeGreaterThan(130);
    expect(result.blocksWithoutWaste).toBeLessThan(142);
  });

  // ─── Test 6: Many openings exceeding wall area (clamp to 0) ───
  it('clamps wall area to 0 when openings exceed area', () => {
    const result = calculateConcreteBlock({
      wallLength: 10,
      wallHeight: 4,
      blockSize: '8x8x16',
      mortarJoint: 0.375,
      openings: 5,
      openingArea: 15,
      wasteFactor: 5,
    });
    // Gross: 40, deduct 5 × 15 = 75, net = max(0, -35) = 0
    expect(result.wallArea).toBe(0);
    expect(result.totalBlocks).toBe(0);
    expect(result.blocksWithoutWaste).toBe(0);
    expect(result.mortarBags).toBe(0);
  });

  // ─── Test 7: Zero wall height returns zeros ───
  it('returns all zeros for zero wall height', () => {
    const result = calculateConcreteBlock({
      wallLength: 20,
      wallHeight: 0,
      blockSize: '8x8x16',
      mortarJoint: 0.375,
      openings: 0,
      openingArea: 15,
      wasteFactor: 5,
    });
    expect(result.wallArea).toBe(0);
    expect(result.totalBlocks).toBe(0);
    expect(result.blocksWithoutWaste).toBe(0);
    expect(result.courses).toBe(0);
    expect(result.blocksPerCourse).toBe(0);
  });

  // ─── Test 8: Zero wall length returns zeros ───
  it('returns all zeros for zero wall length', () => {
    const result = calculateConcreteBlock({
      wallLength: 0,
      wallHeight: 8,
      blockSize: '8x8x16',
      mortarJoint: 0.375,
      openings: 0,
      openingArea: 15,
      wasteFactor: 5,
    });
    expect(result.wallArea).toBe(0);
    expect(result.totalBlocks).toBe(0);
    expect(result.blocksWithoutWaste).toBe(0);
  });

  // ─── Test 9: Metric inputs (meters) ───
  it('handles metric wall dimensions', () => {
    const result = calculateConcreteBlock({
      wallLength: 6,
      wallHeight: 2.5,
      wallLengthUnit: 'm',
      wallHeightUnit: 'm',
      blockSize: '8x8x16',
      mortarJoint: 0.375,
      openings: 0,
      openingArea: 15,
      wasteFactor: 5,
    });
    // 6m ≈ 19.685 ft, 2.5m ≈ 8.202 ft → area ≈ 161.5 sq ft
    expect(result.wallArea).toBeGreaterThan(155);
    expect(result.wallArea).toBeLessThan(170);
    expect(result.totalBlocks).toBeGreaterThan(0);
  });

  // ─── Test 10: Mortar bags calculation ───
  it('calculates mortar bags correctly', () => {
    const result = calculateConcreteBlock({
      wallLength: 20,
      wallHeight: 8,
      blockSize: '8x8x16',
      mortarJoint: 0.375,
      openings: 0,
      openingArea: 15,
      wasteFactor: 5,
    });
    // totalBlocks ≈ 177, mortar = ceil(177 × 3.5 / 100) = ceil(6.195) = 7
    expect(result.mortarBags).toBeGreaterThan(5);
    expect(result.mortarBags).toBeLessThan(10);
  });

  // ─── Test 11: Fill concrete calculation ───
  it('calculates fill concrete in cubic yards', () => {
    const result = calculateConcreteBlock({
      wallLength: 20,
      wallHeight: 8,
      blockSize: '8x8x16',
      mortarJoint: 0.375,
      openings: 0,
      openingArea: 15,
      wasteFactor: 5,
    });
    // ~177 blocks × 0.8 cu ft / 27 = ~5.24 cu yd
    expect(result.fillConcrete).toBeGreaterThan(4);
    expect(result.fillConcrete).toBeLessThan(7);
  });

  // ─── Test 12: Rebar count ───
  it('calculates rebar bars correctly', () => {
    const result = calculateConcreteBlock({
      wallLength: 20,
      wallHeight: 8,
      blockSize: '8x8x16',
      mortarJoint: 0.375,
      openings: 0,
      openingArea: 15,
      wasteFactor: 5,
    });
    // 20 ft × 12 = 240 inches / 48 = 5 bars
    expect(result.rebarBars).toBe(5);
  });

  // ─── Test 13: Courses accuracy ───
  it('calculates courses (rows) correctly', () => {
    const result = calculateConcreteBlock({
      wallLength: 20,
      wallHeight: 8,
      blockSize: '8x8x16',
      mortarJoint: 0.375,
      openings: 0,
      openingArea: 15,
      wasteFactor: 5,
    });
    // 8 ft × 12 = 96 inches / (8 + 0.375) = 96 / 8.375 = 11.46 → ceil = 12
    expect(result.courses).toBe(12);
  });

  // ─── Test 14: Blocks per course ───
  it('calculates blocks per course correctly', () => {
    const result = calculateConcreteBlock({
      wallLength: 20,
      wallHeight: 8,
      blockSize: '8x8x16',
      mortarJoint: 0.375,
      openings: 0,
      openingArea: 15,
      wasteFactor: 5,
    });
    // 20 ft × 12 = 240 inches / (16 + 0.375) = 240 / 16.375 = 14.66 → ceil = 15
    expect(result.blocksPerCourse).toBe(15);
  });

  // ─── Test 15: Cost structure ───
  it('returns cost estimate with expected labels', () => {
    const result = calculateConcreteBlock({
      wallLength: 20,
      wallHeight: 8,
      blockSize: '8x8x16',
      mortarJoint: 0.375,
      openings: 0,
      openingArea: 15,
      wasteFactor: 5,
    });
    const costs = result.costEstimate as Array<{ label: string; value: string | number }>;
    expect(costs.length).toBe(5);
    const labels = costs.map(c => c.label);
    expect(labels).toContain('Blocks (Low @ $1.50/ea)');
    expect(labels).toContain('Blocks (High @ $3.00/ea)');
    expect(labels).toContain('Mortar (80-lb bags)');
    expect(labels).toContain('Total Material (Low)');
    expect(labels).toContain('Total Material (High)');
  });

  // ─── Test 16: Waste factor impact ───
  it('higher waste factor produces more blocks', () => {
    const base = {
      wallLength: 20,
      wallHeight: 8,
      blockSize: '8x8x16',
      mortarJoint: 0.375,
      openings: 0,
      openingArea: 15,
    };
    const low = calculateConcreteBlock({ ...base, wasteFactor: 3 });
    const high = calculateConcreteBlock({ ...base, wasteFactor: 15 });
    expect(high.totalBlocks).toBeGreaterThan(low.totalBlocks as number);
    // Both should have same blocksWithoutWaste
    expect(low.blocksWithoutWaste).toBe(high.blocksWithoutWaste);
  });

  // ─── Test 17: Small wall (4×4) ───
  it('calculates a small 4×4 wall', () => {
    const result = calculateConcreteBlock({
      wallLength: 4,
      wallHeight: 4,
      blockSize: '8x8x16',
      mortarJoint: 0.375,
      openings: 0,
      openingArea: 15,
      wasteFactor: 5,
    });
    expect(result.wallArea).toBe(16);
    expect(result.blocksWithoutWaste).toBeGreaterThan(15);
    expect(result.blocksWithoutWaste).toBeLessThan(20);
  });

  // ─── Test 18: Large wall (50×10) ───
  it('calculates a large 50×10 wall', () => {
    const result = calculateConcreteBlock({
      wallLength: 50,
      wallHeight: 10,
      blockSize: '8x8x16',
      mortarJoint: 0.375,
      openings: 0,
      openingArea: 15,
      wasteFactor: 5,
    });
    expect(result.wallArea).toBe(500);
    // ~1.05 blocks/sq ft × 500 = 525 → with 5% ≈ 552
    expect(result.totalBlocks).toBeGreaterThan(530);
    expect(result.totalBlocks).toBeLessThan(570);
  });

  // ─── Test 19: Output structure ───
  it('returns all expected output fields', () => {
    const result = calculateConcreteBlock({
      wallLength: 20,
      wallHeight: 8,
      blockSize: '8x8x16',
      mortarJoint: 0.375,
      openings: 0,
      openingArea: 15,
      wasteFactor: 5,
    });
    expect(result).toHaveProperty('totalBlocks');
    expect(result).toHaveProperty('blocksWithoutWaste');
    expect(result).toHaveProperty('wallArea');
    expect(result).toHaveProperty('courses');
    expect(result).toHaveProperty('blocksPerCourse');
    expect(result).toHaveProperty('mortarBags');
    expect(result).toHaveProperty('fillConcrete');
    expect(result).toHaveProperty('rebarBars');
    expect(result).toHaveProperty('costEstimate');
    expect(result).toHaveProperty('blockSummary');
    expect(result).toHaveProperty('summary');
  });

  // ─── Test 20: Block summary contains size details ───
  it('returns block summary with size details', () => {
    const result = calculateConcreteBlock({
      wallLength: 20,
      wallHeight: 8,
      blockSize: '8x8x16',
      mortarJoint: 0.375,
      openings: 0,
      openingArea: 15,
      wasteFactor: 5,
    });
    const blockSummary = result.blockSummary as Array<{ label: string; value: string | number }>;
    expect(blockSummary.length).toBe(4);
    const labels = blockSummary.map(s => s.label);
    expect(labels).toContain('Block Type');
    expect(labels).toContain('Block Height');
    expect(labels).toContain('Block Depth');
    expect(labels).toContain('Block Length');
  });

  // ─── Test 21: Zero mortar joint ───
  it('handles zero mortar joint', () => {
    const result = calculateConcreteBlock({
      wallLength: 10,
      wallHeight: 8,
      blockSize: '8x8x16',
      mortarJoint: 0,
      openings: 0,
      openingArea: 15,
      wasteFactor: 5,
    });
    expect(result.wallArea).toBe(80);
    // No mortar → 0 mortar bags
    expect(result.mortarBags).toBe(0);
    // Effective face without mortar: (16 × 8) / 144 = 0.8889 sq ft → 1.125 blocks/sq ft
    expect(result.blocksWithoutWaste).toBeGreaterThan(88);
    expect(result.blocksWithoutWaste).toBeLessThan(95);
  });

  // ─── Test 22: Single opening deducted ───
  it('deducts a single opening correctly', () => {
    const noOpening = calculateConcreteBlock({
      wallLength: 20,
      wallHeight: 8,
      blockSize: '8x8x16',
      mortarJoint: 0.375,
      openings: 0,
      openingArea: 15,
      wasteFactor: 5,
    });
    const withOpening = calculateConcreteBlock({
      wallLength: 20,
      wallHeight: 8,
      blockSize: '8x8x16',
      mortarJoint: 0.375,
      openings: 1,
      openingArea: 15,
      wasteFactor: 5,
    });
    expect(withOpening.wallArea).toBe(145); // 160 - 15
    expect(withOpening.totalBlocks).toBeLessThan(noOpening.totalBlocks as number);
  });

  // ─── Test 23: Fill concrete scales with block depth ───
  it('fill concrete is larger for 12-inch blocks than 8-inch', () => {
    const standard = calculateConcreteBlock({
      wallLength: 20,
      wallHeight: 8,
      blockSize: '8x8x16',
      mortarJoint: 0.375,
      openings: 0,
      openingArea: 15,
      wasteFactor: 5,
    });
    const thick = calculateConcreteBlock({
      wallLength: 20,
      wallHeight: 8,
      blockSize: '12x8x16',
      mortarJoint: 0.375,
      openings: 0,
      openingArea: 15,
      wasteFactor: 5,
    });
    expect(thick.fillConcrete).toBeGreaterThan(standard.fillConcrete as number);
  });
});
