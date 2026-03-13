import { calculateBrick } from '@/lib/formulas/construction/brick';

describe('calculateBrick', () => {
  // ─── Test 1: Standard wall — 20×8 modular bricks, 3/8" joint, 5% waste ───
  it('calculates a standard 20×8 wall with modular bricks', () => {
    const result = calculateBrick({
      wallLength: 20,
      wallHeight: 8,
      brickSize: 'modular',
      mortarJoint: 0.375,
      openings: 0,
      openingArea: 15,
      wasteFactor: 5,
    });
    expect(result.wallArea).toBe(160);
    // Effective: (7.625 + 0.375) × (2.25 + 0.375) / 144 = 8 × 2.625 / 144 = 0.14583 sq ft
    // Bricks per sq ft = 1 / 0.14583 = 6.9 (rounded to 1 dp)
    expect(result.bricksPerSqFt).toBeCloseTo(6.9, 0);
    // Bricks without waste: ceil(160 × 6.857) ≈ 1098
    expect(result.bricksWithoutWaste).toBeGreaterThan(1090);
    expect(result.bricksWithoutWaste).toBeLessThan(1110);
    // With 5% waste
    expect(result.bricksNeeded).toBeGreaterThan(result.bricksWithoutWaste as number);
  });

  // ─── Test 2: Standard size bricks ───
  it('calculates with standard size bricks', () => {
    const result = calculateBrick({
      wallLength: 10,
      wallHeight: 8,
      brickSize: 'standard',
      mortarJoint: 0.375,
      openings: 0,
      openingArea: 15,
      wasteFactor: 5,
    });
    expect(result.wallArea).toBe(80);
    // Standard: 8" × 2.25" → effective = (8.375 × 2.625) / 144 = 0.15267 sq ft
    // Bricks per sq ft = 1/0.15267 = 6.6
    expect(result.bricksPerSqFt).toBeCloseTo(6.6, 0);
    expect(result.bricksWithoutWaste).toBeGreaterThan(500);
  });

  // ─── Test 3: Queen size bricks ───
  it('calculates with queen size bricks', () => {
    const result = calculateBrick({
      wallLength: 10,
      wallHeight: 8,
      brickSize: 'queen',
      mortarJoint: 0.375,
      openings: 0,
      openingArea: 15,
      wasteFactor: 5,
    });
    expect(result.wallArea).toBe(80);
    // Queen: 7.625" × 2.75" → effective = (8 × 3.125) / 144 = 0.17361 sq ft
    // Bricks per sq ft = 1/0.17361 = 5.8
    expect(result.bricksPerSqFt).toBeCloseTo(5.8, 0);
  });

  // ─── Test 4: King size bricks ───
  it('calculates with king size bricks', () => {
    const result = calculateBrick({
      wallLength: 10,
      wallHeight: 8,
      brickSize: 'king',
      mortarJoint: 0.375,
      openings: 0,
      openingArea: 15,
      wasteFactor: 5,
    });
    expect(result.wallArea).toBe(80);
    // King: 9.625" × 2.75" → effective = (10 × 3.125) / 144 = 0.21701 sq ft
    // Bricks per sq ft = 1/0.21701 = 4.6
    expect(result.bricksPerSqFt).toBeCloseTo(4.6, 0);
  });

  // ─── Test 5: Wall with 2 openings ───
  it('deducts area for 2 openings', () => {
    const result = calculateBrick({
      wallLength: 20,
      wallHeight: 8,
      brickSize: 'modular',
      mortarJoint: 0.375,
      openings: 2,
      openingArea: 15,
      wasteFactor: 5,
    });
    // Gross: 160, deduct 2 × 15 = 30, net = 130
    expect(result.wallArea).toBe(130);
    expect(result.bricksWithoutWaste).toBeGreaterThan(880);
    expect(result.bricksWithoutWaste).toBeLessThan(910);
  });

  // ─── Test 6: Many openings exceeding wall area (clamp to 0) ───
  it('clamps wall area to 0 when openings exceed area', () => {
    const result = calculateBrick({
      wallLength: 10,
      wallHeight: 4,
      brickSize: 'modular',
      mortarJoint: 0.375,
      openings: 5,
      openingArea: 15,
      wasteFactor: 5,
    });
    // Gross: 40, deduct 5 × 15 = 75, net = max(0, -35) = 0
    expect(result.wallArea).toBe(0);
    expect(result.bricksNeeded).toBe(0);
    expect(result.bricksWithoutWaste).toBe(0);
    expect(result.mortarBags).toBe(0);
  });

  // ─── Test 7: Zero height returns zeros ───
  it('returns all zeros for zero wall height', () => {
    const result = calculateBrick({
      wallLength: 20,
      wallHeight: 0,
      brickSize: 'modular',
      mortarJoint: 0.375,
      openings: 0,
      openingArea: 15,
      wasteFactor: 5,
    });
    expect(result.wallArea).toBe(0);
    expect(result.bricksNeeded).toBe(0);
    expect(result.bricksWithoutWaste).toBe(0);
  });

  // ─── Test 8: Metric inputs (meters) ───
  it('handles metric wall dimensions', () => {
    const result = calculateBrick({
      wallLength: 6,
      wallHeight: 2.5,
      wallLengthUnit: 'm',
      wallHeightUnit: 'm',
      brickSize: 'modular',
      mortarJoint: 0.375,
      openings: 0,
      openingArea: 15,
      wasteFactor: 5,
    });
    // 6m ≈ 19.685 ft, 2.5m ≈ 8.202 ft → area ≈ 161.5 sq ft
    expect(result.wallArea).toBeGreaterThan(155);
    expect(result.wallArea).toBeLessThan(170);
    expect(result.bricksNeeded).toBeGreaterThan(0);
  });

  // ─── Test 9: No mortar joint (zero) ───
  it('handles zero mortar joint', () => {
    const result = calculateBrick({
      wallLength: 10,
      wallHeight: 8,
      brickSize: 'modular',
      mortarJoint: 0,
      openings: 0,
      openingArea: 15,
      wasteFactor: 5,
    });
    expect(result.wallArea).toBe(80);
    // Effective face = (7.625 × 2.25) / 144 = 0.11914 sq ft
    // Bricks per sq ft = 1 / 0.11914 = 8.4
    expect(result.bricksPerSqFt).toBeCloseTo(8.4, 0);
    // Zero mortar → mortarBags should be 0 (0 × 7/100 scaled by 0)
    expect(result.mortarBags).toBe(0);
  });

  // ─── Test 10: Wide mortar joint (0.5") ───
  it('handles wide 0.5 inch mortar joint', () => {
    const result = calculateBrick({
      wallLength: 10,
      wallHeight: 8,
      brickSize: 'modular',
      mortarJoint: 0.5,
      openings: 0,
      openingArea: 15,
      wasteFactor: 5,
    });
    expect(result.wallArea).toBe(80);
    // Wider joints → fewer bricks per sq ft
    // Effective: (8.125 × 2.75) / 144 = 0.15517 sq ft → 6.4 per sq ft
    expect(result.bricksPerSqFt).toBeCloseTo(6.4, 0);
    // More mortar needed with wider joints
    expect(result.mortarBags).toBeGreaterThan(0);
  });

  // ─── Test 11: Mortar bags accuracy ───
  it('calculates mortar bags correctly for standard wall', () => {
    const result = calculateBrick({
      wallLength: 20,
      wallHeight: 8,
      brickSize: 'modular',
      mortarJoint: 0.375,
      openings: 0,
      openingArea: 15,
      wasteFactor: 5,
    });
    // 160 sq ft × 7 bags/100 sq ft × (0.375/0.375) = 11.2 → ceil = 12
    expect(result.mortarBags).toBe(12);
  });

  // ─── Test 12: Cost structure ───
  it('returns cost estimate with expected labels', () => {
    const result = calculateBrick({
      wallLength: 20,
      wallHeight: 8,
      brickSize: 'modular',
      mortarJoint: 0.375,
      openings: 0,
      openingArea: 15,
      wasteFactor: 5,
    });
    const costs = result.costEstimate as Array<{ label: string; value: string | number }>;
    expect(costs.length).toBe(5);
    const labels = costs.map(c => c.label);
    expect(labels).toContain('Bricks (Low @ $0.50/ea)');
    expect(labels).toContain('Bricks (High @ $1.50/ea)');
    expect(labels).toContain('Mortar (60-lb bags)');
    expect(labels).toContain('Total Material (Low)');
    expect(labels).toContain('Total Material (High)');
  });

  // ─── Test 13: Small wall (4×4) ───
  it('calculates a small 4×4 wall', () => {
    const result = calculateBrick({
      wallLength: 4,
      wallHeight: 4,
      brickSize: 'modular',
      mortarJoint: 0.375,
      openings: 0,
      openingArea: 15,
      wasteFactor: 5,
    });
    expect(result.wallArea).toBe(16);
    // ~6.9 bricks per sq ft × 16 = 110.4 → ceil = 111 without waste
    expect(result.bricksWithoutWaste).toBeGreaterThan(105);
    expect(result.bricksWithoutWaste).toBeLessThan(115);
  });

  // ─── Test 14: Large wall (50×10) ───
  it('calculates a large 50×10 wall', () => {
    const result = calculateBrick({
      wallLength: 50,
      wallHeight: 10,
      brickSize: 'modular',
      mortarJoint: 0.375,
      openings: 0,
      openingArea: 15,
      wasteFactor: 5,
    });
    expect(result.wallArea).toBe(500);
    // ~6.9 × 500 = 3450 → with 5% = ~3623
    expect(result.bricksNeeded).toBeGreaterThan(3500);
    expect(result.bricksNeeded).toBeLessThan(3700);
  });

  // ─── Test 15: Bricks per sq ft varies by size ───
  it('different brick sizes yield different bricks per sq ft', () => {
    const base = {
      wallLength: 10,
      wallHeight: 8,
      mortarJoint: 0.375,
      openings: 0,
      openingArea: 15,
      wasteFactor: 5,
    };
    const modular = calculateBrick({ ...base, brickSize: 'modular' });
    const king = calculateBrick({ ...base, brickSize: 'king' });
    // King bricks are larger → fewer per sq ft
    expect(king.bricksPerSqFt).toBeLessThan(modular.bricksPerSqFt as number);
    // Therefore fewer total bricks
    expect(king.bricksNeeded).toBeLessThan(modular.bricksNeeded as number);
  });

  // ─── Test 16: Waste factor impact ───
  it('higher waste factor produces more bricks', () => {
    const base = {
      wallLength: 20,
      wallHeight: 8,
      brickSize: 'modular',
      mortarJoint: 0.375,
      openings: 0,
      openingArea: 15,
    };
    const low = calculateBrick({ ...base, wasteFactor: 3 });
    const high = calculateBrick({ ...base, wasteFactor: 15 });
    expect(high.bricksNeeded).toBeGreaterThan(low.bricksNeeded as number);
    // Both should have same bricksWithoutWaste
    expect(low.bricksWithoutWaste).toBe(high.bricksWithoutWaste);
  });

  // ─── Test 17: Output structure ───
  it('returns all expected output fields', () => {
    const result = calculateBrick({
      wallLength: 20,
      wallHeight: 8,
      brickSize: 'modular',
      mortarJoint: 0.375,
      openings: 0,
      openingArea: 15,
      wasteFactor: 5,
    });
    expect(result).toHaveProperty('bricksNeeded');
    expect(result).toHaveProperty('bricksWithoutWaste');
    expect(result).toHaveProperty('wallArea');
    expect(result).toHaveProperty('bricksPerSqFt');
    expect(result).toHaveProperty('mortarBags');
    expect(result).toHaveProperty('costEstimate');
    expect(result).toHaveProperty('brickSummary');
    expect(result).toHaveProperty('summary');
  });

  // ─── Test 18: Brick summary contains size details ───
  it('returns brick summary with size details', () => {
    const result = calculateBrick({
      wallLength: 20,
      wallHeight: 8,
      brickSize: 'modular',
      mortarJoint: 0.375,
      openings: 0,
      openingArea: 15,
      wasteFactor: 5,
    });
    const brickSummary = result.brickSummary as Array<{ label: string; value: string | number }>;
    expect(brickSummary.length).toBe(4);
    const labels = brickSummary.map(s => s.label);
    expect(labels).toContain('Brick Type');
    expect(labels).toContain('Brick Length');
    expect(labels).toContain('Brick Height');
    expect(labels).toContain('Brick Width (Depth)');
  });

  // ─── Test 19: Zero length returns zeros ───
  it('returns all zeros for zero wall length', () => {
    const result = calculateBrick({
      wallLength: 0,
      wallHeight: 8,
      brickSize: 'modular',
      mortarJoint: 0.375,
      openings: 0,
      openingArea: 15,
      wasteFactor: 5,
    });
    expect(result.wallArea).toBe(0);
    expect(result.bricksNeeded).toBe(0);
    expect(result.bricksWithoutWaste).toBe(0);
    expect(result.mortarBags).toBe(0);
  });

  // ─── Test 20: Single opening deducted ───
  it('deducts a single opening correctly', () => {
    const noOpening = calculateBrick({
      wallLength: 20,
      wallHeight: 8,
      brickSize: 'modular',
      mortarJoint: 0.375,
      openings: 0,
      openingArea: 15,
      wasteFactor: 5,
    });
    const withOpening = calculateBrick({
      wallLength: 20,
      wallHeight: 8,
      brickSize: 'modular',
      mortarJoint: 0.375,
      openings: 1,
      openingArea: 15,
      wasteFactor: 5,
    });
    expect(withOpening.wallArea).toBe(145); // 160 - 15
    expect(withOpening.bricksNeeded).toBeLessThan(noOpening.bricksNeeded as number);
  });
});
