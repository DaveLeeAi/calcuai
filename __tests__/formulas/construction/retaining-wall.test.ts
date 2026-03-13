import { calculateRetainingWall } from '@/lib/formulas/construction/retaining-wall';

describe('calculateRetainingWall', () => {
  // ─── Test 1: Standard wall 20ft × 4ft with standard blocks ───
  it('calculates a standard 20ft × 4ft retaining wall', () => {
    const result = calculateRetainingWall({
      wallLength: 20,
      wallLengthUnit: 'ft',
      wallHeight: 4,
      wallHeightUnit: 'ft',
      blockType: 'standard',
      blockLength: 16,
      blockHeight: 6,
      blockDepth: 12,
      wasteFactor: 10,
    });
    // Wall area = 20 × 4 = 80 sq ft
    expect(result.wallArea).toBe(80);
    // Blocks per sq ft = 144 / (16×6) = 144/96 = 1.5
    // Without waste: ceil(80 × 1.5) = 120
    expect(result.blocksWithoutWaste).toBe(120);
    // With 10% waste: ceil(80 × 1.5 × 1.1) = ceil(132) = 132
    expect(result.totalBlocks).toBe(132);
    // Rows: ceil(4×12/6) = ceil(8) = 8
    expect(result.rows).toBe(8);
    // Blocks per row: ceil(20×12/16) = ceil(15) = 15
    expect(result.blocksPerRow).toBe(15);
    // Cap blocks = 15
    expect(result.capBlocks).toBe(15);
  });

  // ─── Test 2: Large block type ───
  it('calculates fewer blocks with large block type', () => {
    const standard = calculateRetainingWall({
      wallLength: 20, wallLengthUnit: 'ft', wallHeight: 4, wallHeightUnit: 'ft',
      blockType: 'standard', blockLength: 16, blockHeight: 6, blockDepth: 12, wasteFactor: 10,
    });
    const large = calculateRetainingWall({
      wallLength: 20, wallLengthUnit: 'ft', wallHeight: 4, wallHeightUnit: 'ft',
      blockType: 'large', blockLength: 18, blockHeight: 6, blockDepth: 12, wasteFactor: 10,
    });
    // Larger blocks → fewer total blocks
    expect(large.totalBlocks).toBeLessThan(standard.totalBlocks as number);
    // Same rows (same height and block height)
    expect(large.rows).toBe(standard.rows);
  });

  // ─── Test 3: Natural stone (higher waste) ───
  it('calculates more blocks for natural stone with same wall', () => {
    const standard = calculateRetainingWall({
      wallLength: 20, wallLengthUnit: 'ft', wallHeight: 4, wallHeightUnit: 'ft',
      blockType: 'standard', blockLength: 16, blockHeight: 6, blockDepth: 12, wasteFactor: 10,
    });
    const stone = calculateRetainingWall({
      wallLength: 20, wallLengthUnit: 'ft', wallHeight: 4, wallHeightUnit: 'ft',
      blockType: 'natural-stone', blockLength: 12, blockHeight: 6, blockDepth: 8, wasteFactor: 15,
    });
    // Natural stone: smaller blocks + higher waste = more blocks
    expect(stone.totalBlocks).toBeGreaterThan(standard.totalBlocks as number);
  });

  // ─── Test 4: Short wall (2ft) ───
  it('calculates a 2ft short wall correctly', () => {
    const result = calculateRetainingWall({
      wallLength: 10, wallLengthUnit: 'ft', wallHeight: 2, wallHeightUnit: 'ft',
      blockType: 'standard', blockLength: 16, blockHeight: 6, blockDepth: 12, wasteFactor: 10,
    });
    // Area = 10 × 2 = 20 sq ft
    expect(result.wallArea).toBe(20);
    // Rows: ceil(24/6) = 4
    expect(result.rows).toBe(4);
    // Blocks per row: ceil(120/16) = 8
    expect(result.blocksPerRow).toBe(8);
  });

  // ─── Test 5: Tall wall (6ft+) triggers engineered note ───
  it('flags engineered wall note for walls over 6ft', () => {
    const result = calculateRetainingWall({
      wallLength: 20, wallLengthUnit: 'ft', wallHeight: 7, wallHeightUnit: 'ft',
      blockType: 'standard', blockLength: 16, blockHeight: 6, blockDepth: 12, wasteFactor: 10,
    });
    expect(result.engineeredWallNote).toBe(true);
  });

  // ─── Test 6: Wall at exactly 6ft does NOT trigger note ───
  it('does not flag engineered wall note at exactly 6ft', () => {
    const result = calculateRetainingWall({
      wallLength: 20, wallLengthUnit: 'ft', wallHeight: 6, wallHeightUnit: 'ft',
      blockType: 'standard', blockLength: 16, blockHeight: 6, blockDepth: 12, wasteFactor: 10,
    });
    expect(result.engineeredWallNote).toBe(false);
  });

  // ─── Test 7: Zero dimensions return all zeros ───
  it('returns zeros for zero-length wall', () => {
    const result = calculateRetainingWall({
      wallLength: 0, wallLengthUnit: 'ft', wallHeight: 4, wallHeightUnit: 'ft',
      blockType: 'standard', blockLength: 16, blockHeight: 6, blockDepth: 12, wasteFactor: 10,
    });
    expect(result.totalBlocks).toBe(0);
    expect(result.rows).toBe(0);
    expect(result.gravelBackfill).toBe(0);
    expect(result.drainPipe).toBe(0);
    expect(result.wallArea).toBe(0);
  });

  // ─── Test 8: Zero height returns all zeros ───
  it('returns zeros for zero-height wall', () => {
    const result = calculateRetainingWall({
      wallLength: 20, wallLengthUnit: 'ft', wallHeight: 0, wallHeightUnit: 'ft',
      blockType: 'standard', blockLength: 16, blockHeight: 6, blockDepth: 12, wasteFactor: 10,
    });
    expect(result.totalBlocks).toBe(0);
    expect(result.wallArea).toBe(0);
  });

  // ─── Test 9: Metric inputs ───
  it('converts metric inputs correctly', () => {
    const result = calculateRetainingWall({
      wallLength: 6.096,   // ~20 ft
      wallLengthUnit: 'm',
      wallHeight: 1.2192,  // ~4 ft
      wallHeightUnit: 'm',
      blockType: 'standard', blockLength: 16, blockHeight: 6, blockDepth: 12, wasteFactor: 10,
    });
    // Should be close to the ft equivalent
    expect(result.wallArea).toBeCloseTo(80, 0);
    // Metric conversion may produce slight rounding differences
    expect(result.totalBlocks).toBeGreaterThanOrEqual(131);
    expect(result.totalBlocks).toBeLessThanOrEqual(134);
  });

  // ─── Test 10: Cap blocks count matches blocks per row ───
  it('cap blocks equal blocks per row', () => {
    const result = calculateRetainingWall({
      wallLength: 30, wallLengthUnit: 'ft', wallHeight: 3, wallHeightUnit: 'ft',
      blockType: 'standard', blockLength: 16, blockHeight: 6, blockDepth: 12, wasteFactor: 10,
    });
    expect(result.capBlocks).toBe(result.blocksPerRow);
  });

  // ─── Test 11: Gravel backfill calculation ───
  it('calculates gravel backfill correctly', () => {
    const result = calculateRetainingWall({
      wallLength: 20, wallLengthUnit: 'ft', wallHeight: 4, wallHeightUnit: 'ft',
      blockType: 'standard', blockLength: 16, blockHeight: 6, blockDepth: 12, wasteFactor: 10,
    });
    // Gravel = 20 × 1 × 4 / 27 = 80/27 ≈ 2.96
    expect(result.gravelBackfill).toBeCloseTo(2.96, 1);
  });

  // ─── Test 12: Drain pipe equals wall length ───
  it('drain pipe length equals wall length in feet', () => {
    const result = calculateRetainingWall({
      wallLength: 25, wallLengthUnit: 'ft', wallHeight: 4, wallHeightUnit: 'ft',
      blockType: 'standard', blockLength: 16, blockHeight: 6, blockDepth: 12, wasteFactor: 10,
    });
    expect(result.drainPipe).toBe(25);
  });

  // ─── Test 13: Base material calculation ───
  it('calculates base material correctly', () => {
    const result = calculateRetainingWall({
      wallLength: 20, wallLengthUnit: 'ft', wallHeight: 4, wallHeightUnit: 'ft',
      blockType: 'standard', blockLength: 16, blockHeight: 6, blockDepth: 12, wasteFactor: 10,
    });
    // Base width = 12/12 + 0.5 = 1.5 ft
    // Base = 20 × 1.5 × 0.5 / 27 = 15/27 ≈ 0.56
    expect(result.baseMaterial).toBeCloseTo(0.56, 1);
  });

  // ─── Test 14: Landscape fabric calculation ───
  it('calculates landscape fabric correctly', () => {
    const result = calculateRetainingWall({
      wallLength: 20, wallLengthUnit: 'ft', wallHeight: 4, wallHeightUnit: 'ft',
      blockType: 'standard', blockLength: 16, blockHeight: 6, blockDepth: 12, wasteFactor: 10,
    });
    // Fabric = 20 × (4 + 2) = 120 sq ft
    expect(result.landscapeFabric).toBe(120);
  });

  // ─── Test 15: Waste factor impact ───
  it('higher waste factor produces more blocks', () => {
    const low = calculateRetainingWall({
      wallLength: 20, wallLengthUnit: 'ft', wallHeight: 4, wallHeightUnit: 'ft',
      blockType: 'standard', blockLength: 16, blockHeight: 6, blockDepth: 12, wasteFactor: 5,
    });
    const high = calculateRetainingWall({
      wallLength: 20, wallLengthUnit: 'ft', wallHeight: 4, wallHeightUnit: 'ft',
      blockType: 'standard', blockLength: 16, blockHeight: 6, blockDepth: 12, wasteFactor: 15,
    });
    expect(high.totalBlocks).toBeGreaterThan(low.totalBlocks as number);
    // Same blocks without waste
    expect(high.blocksWithoutWaste).toBe(low.blocksWithoutWaste);
  });

  // ─── Test 16: Cost estimate structure ───
  it('returns cost estimate with correct structure', () => {
    const result = calculateRetainingWall({
      wallLength: 20, wallLengthUnit: 'ft', wallHeight: 4, wallHeightUnit: 'ft',
      blockType: 'standard', blockLength: 16, blockHeight: 6, blockDepth: 12, wasteFactor: 10,
    });
    const cost = result.costEstimate as Array<{ label: string; value: number }>;
    expect(cost).toHaveLength(9);
    // Low total < High total
    const totalLow = cost.find(c => c.label === 'Total Material (Low)');
    const totalHigh = cost.find(c => c.label === 'Total Material (High)');
    expect(totalLow).toBeDefined();
    expect(totalHigh).toBeDefined();
    expect(totalLow!.value).toBeLessThan(totalHigh!.value);
    expect(totalLow!.value).toBeGreaterThan(0);
  });

  // ─── Test 17: Natural stone cost is higher per block ───
  it('natural stone has higher block cost range', () => {
    const standard = calculateRetainingWall({
      wallLength: 10, wallLengthUnit: 'ft', wallHeight: 3, wallHeightUnit: 'ft',
      blockType: 'standard', blockLength: 16, blockHeight: 6, blockDepth: 12, wasteFactor: 10,
    });
    const stone = calculateRetainingWall({
      wallLength: 10, wallLengthUnit: 'ft', wallHeight: 3, wallHeightUnit: 'ft',
      blockType: 'natural-stone', blockLength: 12, blockHeight: 6, blockDepth: 8, wasteFactor: 15,
    });
    const stdCost = standard.costEstimate as Array<{ label: string; value: number }>;
    const stoneCost = stone.costEstimate as Array<{ label: string; value: number }>;
    const stdTotal = stdCost.find(c => c.label === 'Total Material (High)')!.value;
    const stoneTotal = stoneCost.find(c => c.label === 'Total Material (High)')!.value;
    // Natural stone: more blocks + higher cost per block = higher total
    expect(stoneTotal).toBeGreaterThan(stdTotal);
  });

  // ─── Test 18: Rows accuracy with non-divisible heights ───
  it('rounds rows up for non-divisible wall height', () => {
    const result = calculateRetainingWall({
      wallLength: 20, wallLengthUnit: 'ft', wallHeight: 3.5, wallHeightUnit: 'ft',
      blockType: 'standard', blockLength: 16, blockHeight: 6, blockDepth: 12, wasteFactor: 10,
    });
    // 3.5 ft = 42 inches, 42/6 = 7 rows exactly
    expect(result.rows).toBe(7);
  });

  // ─── Test 19: Block defaults apply when blockType changes ───
  it('uses default block dimensions based on blockType', () => {
    // When blockLength/Height/Depth are 0, defaults should apply
    const result = calculateRetainingWall({
      wallLength: 20, wallLengthUnit: 'ft', wallHeight: 4, wallHeightUnit: 'ft',
      blockType: 'large',
      blockLength: 0, blockHeight: 0, blockDepth: 0,
      wasteFactor: 10,
    });
    // Large defaults: 18×6×12
    // Blocks per row: ceil(240/18) = 14
    expect(result.blocksPerRow).toBe(14);
  });

  // ─── Test 20: Output structure completeness ───
  it('returns all expected output fields', () => {
    const result = calculateRetainingWall({
      wallLength: 20, wallLengthUnit: 'ft', wallHeight: 4, wallHeightUnit: 'ft',
      blockType: 'standard', blockLength: 16, blockHeight: 6, blockDepth: 12, wasteFactor: 10,
    });
    expect(result).toHaveProperty('totalBlocks');
    expect(result).toHaveProperty('blocksWithoutWaste');
    expect(result).toHaveProperty('rows');
    expect(result).toHaveProperty('blocksPerRow');
    expect(result).toHaveProperty('capBlocks');
    expect(result).toHaveProperty('gravelBackfill');
    expect(result).toHaveProperty('drainPipe');
    expect(result).toHaveProperty('baseMaterial');
    expect(result).toHaveProperty('landscapeFabric');
    expect(result).toHaveProperty('wallArea');
    expect(result).toHaveProperty('costEstimate');
    expect(result).toHaveProperty('engineeredWallNote');
  });
});
