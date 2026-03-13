import { calculateTile } from '@/lib/formulas/construction/tile';

describe('calculateTile', () => {
  // ─── Test 1: Standard 12×10 room with 12×12 tiles, 1/8" gap, 10% waste ───
  it('calculates a standard room with 12×12 tiles', () => {
    const result = calculateTile({
      roomLength: 12,
      roomWidth: 10,
      tileLength: 12,
      tileWidth: 12,
      gapSize: 0.125,
      wasteFactor: 10,
      costPerTile: 0,
    });
    expect(result.totalArea).toBe(120);
    // Effective tile area = (12.125/12) × (12.125/12) = 1.01042² ≈ 1.02093 sq ft
    // Tiles = ceil(120 / 1.02093) ≈ ceil(117.54) = 118
    expect(result.tilesNeeded).toBe(118);
    // With 10% waste: ceil(118 × 1.10) = ceil(129.8) = 130
    expect(result.tilesWithWaste).toBe(130);
    expect(result.tileAreaSqFt).toBe(1);  // 12×12 / 144 = 1.0000
    expect(result.estimatedCost).toBe(0);
  });

  // ─── Test 2: Small bathroom — 5×8 room, 6×6 tiles ───
  it('calculates a small bathroom with 6×6 tiles', () => {
    const result = calculateTile({
      roomLength: 5,
      roomWidth: 8,
      tileLength: 6,
      tileWidth: 6,
      gapSize: 0.125,
      wasteFactor: 10,
      costPerTile: 0,
    });
    expect(result.totalArea).toBe(40);
    // Tile area = 6×6/144 = 0.25 sq ft
    expect(result.tileAreaSqFt).toBe(0.25);
    // Effective: (6.125/12)² = 0.51042² = 0.26053 sq ft
    // Tiles = ceil(40/0.26053) = ceil(153.54) = 154
    expect(result.tilesNeeded).toBe(154);
    // With waste: ceil(154 × 1.10) = ceil(169.4) = 170
    expect(result.tilesWithWaste).toBe(170);
  });

  // ─── Test 3: Large room — 20×20, 24×24 tiles ───
  it('calculates a large room with 24×24 tiles', () => {
    const result = calculateTile({
      roomLength: 20,
      roomWidth: 20,
      tileLength: 24,
      tileWidth: 24,
      gapSize: 0.125,
      wasteFactor: 10,
      costPerTile: 0,
    });
    expect(result.totalArea).toBe(400);
    // Tile area = 24×24/144 = 4 sq ft
    expect(result.tileAreaSqFt).toBe(4);
    // Effective: (24.125/12)² = 2.01042² ≈ 4.04178
    // Tiles = ceil(400/4.04178) = ceil(98.97) = 99
    expect(result.tilesNeeded).toBe(99);
    expect(result.tilesWithWaste).toBe(Math.ceil(99 * 1.10));
  });

  // ─── Test 4: No gap — exact tile count ───
  it('calculates exact tiles with zero grout gap', () => {
    const result = calculateTile({
      roomLength: 12,
      roomWidth: 10,
      tileLength: 12,
      tileWidth: 12,
      gapSize: 0,
      wasteFactor: 10,
      costPerTile: 0,
    });
    expect(result.totalArea).toBe(120);
    // No gap: effective tile area = (12/12)² = 1 sq ft
    // Tiles = ceil(120/1) = 120
    expect(result.tilesNeeded).toBe(120);
    // With 10% waste: ceil(120 × 1.10) = ceil(132) = 132
    expect(result.tilesWithWaste).toBe(132);
  });

  // ─── Test 5: High waste factor — 15% ───
  it('applies a 15% waste factor correctly', () => {
    const result = calculateTile({
      roomLength: 10,
      roomWidth: 10,
      tileLength: 12,
      tileWidth: 12,
      gapSize: 0,
      wasteFactor: 15,
      costPerTile: 0,
    });
    // 100 sq ft / 1 sq ft per tile = 100 tiles
    expect(result.tilesNeeded).toBe(100);
    // With 15% waste: ceil(100 × 1.15) = 115
    expect(result.tilesWithWaste).toBe(115);
  });

  // ─── Test 6: With cost per tile ───
  it('calculates estimated cost when cost per tile is provided', () => {
    const result = calculateTile({
      roomLength: 10,
      roomWidth: 10,
      tileLength: 12,
      tileWidth: 12,
      gapSize: 0,
      wasteFactor: 10,
      costPerTile: 3.50,
    });
    expect(result.tilesWithWaste).toBe(110);
    // Cost = 110 × $3.50 = $385.00
    expect(result.estimatedCost).toBe(385.00);
  });

  // ─── Test 7: Zero room dimensions returns all zeros ───
  it('returns all zeros for zero room dimensions', () => {
    const result = calculateTile({
      roomLength: 0,
      roomWidth: 10,
      tileLength: 12,
      tileWidth: 12,
      gapSize: 0.125,
      wasteFactor: 10,
      costPerTile: 5,
    });
    expect(result.totalArea).toBe(0);
    expect(result.tilesNeeded).toBe(0);
    expect(result.tilesWithWaste).toBe(0);
    expect(result.estimatedCost).toBe(0);
  });

  // ─── Test 8: Zero tile dimensions returns all zeros ───
  it('returns all zeros for zero tile dimensions', () => {
    const result = calculateTile({
      roomLength: 12,
      roomWidth: 10,
      tileLength: 0,
      tileWidth: 12,
      gapSize: 0.125,
      wasteFactor: 10,
      costPerTile: 0,
    });
    expect(result.totalArea).toBe(0);
    expect(result.tilesNeeded).toBe(0);
    expect(result.tilesWithWaste).toBe(0);
  });

  // ─── Test 9: Large tiles — 24×24 on 12×10 room ───
  it('handles large tiles on a standard room', () => {
    const result = calculateTile({
      roomLength: 12,
      roomWidth: 10,
      tileLength: 24,
      tileWidth: 24,
      gapSize: 0.125,
      wasteFactor: 10,
      costPerTile: 0,
    });
    expect(result.totalArea).toBe(120);
    expect(result.tileAreaSqFt).toBe(4);
    // Effective: (24.125/12)² ≈ 4.04178
    // Tiles = ceil(120/4.04178) = ceil(29.69) = 30
    expect(result.tilesNeeded).toBe(30);
    // With waste: ceil(30 × 1.10) = 33
    expect(result.tilesWithWaste).toBe(33);
  });

  // ─── Test 10: Rectangular tiles — 12×24 ───
  it('handles rectangular tiles correctly', () => {
    const result = calculateTile({
      roomLength: 10,
      roomWidth: 10,
      tileLength: 12,
      tileWidth: 24,
      gapSize: 0.125,
      wasteFactor: 10,
      costPerTile: 0,
    });
    expect(result.totalArea).toBe(100);
    // Tile area = 12×24/144 = 2 sq ft
    expect(result.tileAreaSqFt).toBe(2);
    // Effective: (12.125/12) × (24.125/12) = 1.01042 × 2.01042 ≈ 2.03125
    // Tiles = ceil(100/2.03125) ≈ ceil(49.23) = 50
    expect(result.tilesNeeded).toBe(50);
  });

  // ─── Test 11: Tiny gap — 1/16" ───
  it('handles a 1/16 inch grout gap', () => {
    const result = calculateTile({
      roomLength: 10,
      roomWidth: 10,
      tileLength: 12,
      tileWidth: 12,
      gapSize: 0.0625,
      wasteFactor: 10,
      costPerTile: 0,
    });
    expect(result.totalArea).toBe(100);
    // Effective: (12.0625/12)² = 1.00521² ≈ 1.01044
    // Tiles = ceil(100/1.01044) = ceil(98.97) = 99
    expect(result.tilesNeeded).toBe(99);
  });

  // ─── Test 12: Cost calculation consistency ───
  it('cost equals tilesWithWaste times costPerTile', () => {
    const result = calculateTile({
      roomLength: 15,
      roomWidth: 12,
      tileLength: 18,
      tileWidth: 18,
      gapSize: 0.125,
      wasteFactor: 10,
      costPerTile: 4.25,
    });
    const expectedCost = parseFloat(
      ((result.tilesWithWaste as number) * 4.25).toFixed(2)
    );
    expect(result.estimatedCost).toBe(expectedCost);
  });

  // ─── Test 13: Summary labels present ───
  it('returns summary with expected labels', () => {
    const result = calculateTile({
      roomLength: 12,
      roomWidth: 10,
      tileLength: 12,
      tileWidth: 12,
      gapSize: 0.125,
      wasteFactor: 10,
      costPerTile: 2.00,
    });
    const summary = result.summary as Array<{ label: string; value: string | number }>;
    expect(summary.length).toBeGreaterThanOrEqual(6);
    const labels = summary.map(s => s.label);
    expect(labels).toContain('Room Area');
    expect(labels).toContain('Tile Size');
    expect(labels).toContain('Coverage Per Tile');
    expect(labels).toContain('Tiles (No Waste)');
    expect(labels).toContain('Extra Tiles for Waste');
    expect(labels).toContain('Estimated Cost');
  });

  // ─── Test 14: Summary omits cost when costPerTile is 0 ───
  it('omits estimated cost from summary when costPerTile is 0', () => {
    const result = calculateTile({
      roomLength: 12,
      roomWidth: 10,
      tileLength: 12,
      tileWidth: 12,
      gapSize: 0.125,
      wasteFactor: 10,
      costPerTile: 0,
    });
    const summary = result.summary as Array<{ label: string; value: string | number }>;
    const labels = summary.map(s => s.label);
    expect(labels).not.toContain('Estimated Cost');
  });
});
