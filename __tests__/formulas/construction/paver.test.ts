import { calculatePaver } from '@/lib/formulas/construction/paver';

describe('calculatePaver', () => {
  // ─── Test 1: Standard 20×15 patio with 8×4 pavers, 0.25" joint, running bond, 10% waste ───
  it('calculates a standard 20×15 patio with 8×4 pavers', () => {
    const result = calculatePaver({
      areaLength: 20,
      areaWidth: 15,
      paverLength: 8,
      paverWidth: 4,
      jointWidth: 0.25,
      pattern: 'running-bond',
      wasteFactor: 10,
    });
    expect(result.totalArea).toBe(300);
    // Effective paver area = (8.25/12) × (4.25/12) = 0.6875 × 0.354167 = 0.24349 sq ft
    // Pavers (no waste) = ceil(300 / 0.24349 × 1.0) = ceil(1232.01) ≈ 1232
    expect(result.paversWithoutWaste).toBeGreaterThan(1200);
    expect(result.paversWithoutWaste).toBeLessThan(1250);
    // With 10% waste: paversNeeded > paversWithoutWaste
    expect(result.paversNeeded).toBeGreaterThan(result.paversWithoutWaste as number);
    expect(result.paverAreaEach).toBe(32); // 8 × 4 = 32 sq in
  });

  // ─── Test 2: Large driveway — 40×20 with 12×12 pavers ───
  it('calculates a large driveway with 12×12 pavers', () => {
    const result = calculatePaver({
      areaLength: 40,
      areaWidth: 20,
      paverLength: 12,
      paverWidth: 12,
      jointWidth: 0.25,
      pattern: 'running-bond',
      wasteFactor: 10,
    });
    expect(result.totalArea).toBe(800);
    expect(result.paverAreaEach).toBe(144); // 12×12
    expect(result.paversWithoutWaste).toBeGreaterThan(750);
    expect(result.paversNeeded).toBeGreaterThan(result.paversWithoutWaste as number);
  });

  // ─── Test 3: Small walkway — 3×20 with 6×6 pavers ───
  it('calculates a small walkway with 6×6 pavers', () => {
    const result = calculatePaver({
      areaLength: 20,
      areaWidth: 3,
      paverLength: 6,
      paverWidth: 6,
      jointWidth: 0.25,
      pattern: 'stack-bond',
      wasteFactor: 5,
    });
    expect(result.totalArea).toBe(60);
    expect(result.paverAreaEach).toBe(36); // 6×6
    // Effective: (6.25/12)² = 0.52083² ≈ 0.27127
    // Pavers = ceil(60 / 0.27127) = ceil(221.1) = 222
    expect(result.paversWithoutWaste).toBeGreaterThan(200);
    expect(result.paversWithoutWaste).toBeLessThan(230);
  });

  // ─── Test 4: Herringbone pattern adds ~5% extra ───
  it('applies herringbone pattern multiplier', () => {
    const baseInputs = {
      areaLength: 20,
      areaWidth: 15,
      paverLength: 8,
      paverWidth: 4,
      jointWidth: 0.25,
      wasteFactor: 10,
    };
    const runningBond = calculatePaver({ ...baseInputs, pattern: 'running-bond' });
    const herringbone = calculatePaver({ ...baseInputs, pattern: 'herringbone' });
    // Herringbone should have more pavers (5% pattern multiplier)
    expect(herringbone.paversWithoutWaste).toBeGreaterThan(runningBond.paversWithoutWaste as number);
    expect(herringbone.paversNeeded).toBeGreaterThan(runningBond.paversNeeded as number);
  });

  // ─── Test 5: Zero joint width ───
  it('handles zero joint width correctly', () => {
    const result = calculatePaver({
      areaLength: 10,
      areaWidth: 10,
      paverLength: 12,
      paverWidth: 12,
      jointWidth: 0,
      pattern: 'running-bond',
      wasteFactor: 10,
    });
    expect(result.totalArea).toBe(100);
    // No joint: effective paver area = (12/12)² = 1 sq ft
    // Pavers = ceil(100/1) = 100
    expect(result.paversWithoutWaste).toBe(100);
    // With 10% waste: ceil(100 × 1.10) = 110
    expect(result.paversNeeded).toBe(110);
  });

  // ─── Test 6: Wide joints — 1 inch ───
  it('handles wide 1-inch joints', () => {
    const result = calculatePaver({
      areaLength: 10,
      areaWidth: 10,
      paverLength: 8,
      paverWidth: 4,
      jointWidth: 1,
      pattern: 'running-bond',
      wasteFactor: 10,
    });
    expect(result.totalArea).toBe(100);
    // Effective: (9/12) × (5/12) = 0.75 × 0.41667 = 0.3125 sq ft
    // Pavers = ceil(100 / 0.3125) = 320
    expect(result.paversWithoutWaste).toBe(320);
  });

  // ─── Test 7: Metric input (meters) ───
  it('handles metric area input', () => {
    const result = calculatePaver({
      areaLength: 6,
      areaWidth: 4.5,
      areaLengthUnit: 'm',
      areaWidthUnit: 'm',
      paverLength: 8,
      paverWidth: 4,
      jointWidth: 0.25,
      pattern: 'running-bond',
      wasteFactor: 10,
    });
    // 6m = 19.685 ft, 4.5m = 14.764 ft → area ≈ 290.6 sq ft
    expect(result.totalArea).toBeGreaterThan(280);
    expect(result.totalArea).toBeLessThan(300);
    expect(result.paversNeeded).toBeGreaterThan(0);
  });

  // ─── Test 8: Zero area returns all zeros ───
  it('returns all zeros for zero area dimensions', () => {
    const result = calculatePaver({
      areaLength: 0,
      areaWidth: 15,
      paverLength: 8,
      paverWidth: 4,
      jointWidth: 0.25,
      pattern: 'running-bond',
      wasteFactor: 10,
    });
    expect(result.totalArea).toBe(0);
    expect(result.paversNeeded).toBe(0);
    expect(result.paversWithoutWaste).toBe(0);
    expect(result.sandBase).toBe(0);
    expect(result.gravelBase).toBe(0);
    expect(result.polymericSand).toBe(0);
  });

  // ─── Test 9: Zero paver dimensions returns zeros ───
  it('returns all zeros for zero paver dimensions', () => {
    const result = calculatePaver({
      areaLength: 20,
      areaWidth: 15,
      paverLength: 0,
      paverWidth: 4,
      jointWidth: 0.25,
      pattern: 'running-bond',
      wasteFactor: 10,
    });
    expect(result.totalArea).toBe(0);
    expect(result.paversNeeded).toBe(0);
  });

  // ─── Test 10: 12×12 pavers on 10×10 area ───
  it('calculates 12×12 pavers on a 10×10 area', () => {
    const result = calculatePaver({
      areaLength: 10,
      areaWidth: 10,
      paverLength: 12,
      paverWidth: 12,
      jointWidth: 0.25,
      pattern: 'running-bond',
      wasteFactor: 10,
    });
    expect(result.totalArea).toBe(100);
    expect(result.paverAreaEach).toBe(144);
    // Effective: (12.25/12)² = 1.02083² ≈ 1.04210
    // Pavers (no waste): ceil(100/1.04210) = ceil(95.96) = 96
    expect(result.paversWithoutWaste).toBe(96);
  });

  // ─── Test 11: 6×6 pavers ───
  it('calculates 6×6 pavers correctly', () => {
    const result = calculatePaver({
      areaLength: 10,
      areaWidth: 10,
      paverLength: 6,
      paverWidth: 6,
      jointWidth: 0.25,
      pattern: 'running-bond',
      wasteFactor: 10,
    });
    expect(result.totalArea).toBe(100);
    expect(result.paverAreaEach).toBe(36);
    // Effective: (6.25/12)² = 0.52083² = 0.27127
    // Pavers = ceil(100/0.27127) = ceil(368.6) = 369
    expect(result.paversWithoutWaste).toBeGreaterThan(360);
    expect(result.paversWithoutWaste).toBeLessThan(375);
  });

  // ─── Test 12: Sand base volume ───
  it('calculates sand base volume correctly', () => {
    const result = calculatePaver({
      areaLength: 20,
      areaWidth: 15,
      paverLength: 8,
      paverWidth: 4,
      jointWidth: 0.25,
      pattern: 'running-bond',
      wasteFactor: 10,
    });
    // Sand base = 300 × (1/12) / 27 = 300 × 0.08333 / 27 = 0.926
    expect(result.sandBase).toBeCloseTo(0.93, 1);
  });

  // ─── Test 13: Gravel base volume ───
  it('calculates gravel base volume correctly', () => {
    const result = calculatePaver({
      areaLength: 20,
      areaWidth: 15,
      paverLength: 8,
      paverWidth: 4,
      jointWidth: 0.25,
      pattern: 'running-bond',
      wasteFactor: 10,
    });
    // Gravel base = 300 × (4/12) / 27 = 300 × 0.3333 / 27 = 3.704
    expect(result.gravelBase).toBeCloseTo(3.70, 1);
  });

  // ─── Test 14: Polymeric sand bags ───
  it('calculates polymeric sand bags correctly', () => {
    const result = calculatePaver({
      areaLength: 20,
      areaWidth: 15,
      paverLength: 8,
      paverWidth: 4,
      jointWidth: 0.25,
      pattern: 'running-bond',
      wasteFactor: 10,
    });
    // 300 sq ft / 75 = 4 bags
    expect(result.polymericSand).toBe(4);
  });

  // ─── Test 15: Cost estimate structure ───
  it('returns cost estimate with expected labels', () => {
    const result = calculatePaver({
      areaLength: 20,
      areaWidth: 15,
      paverLength: 8,
      paverWidth: 4,
      jointWidth: 0.25,
      pattern: 'running-bond',
      wasteFactor: 10,
    });
    const costs = result.costEstimate as Array<{ label: string; value: string | number }>;
    expect(costs.length).toBe(5);
    const labels = costs.map(c => c.label);
    expect(labels).toContain('Pavers (Low @ $0.50/ea)');
    expect(labels).toContain('Pavers (High @ $2.00/ea)');
    expect(labels).toContain('Leveling Sand');
    expect(labels).toContain('Gravel Base');
    expect(labels).toContain('Polymeric Sand');
  });

  // ─── Test 16: Waste factor impact ───
  it('higher waste factor produces more pavers', () => {
    const base = {
      areaLength: 20,
      areaWidth: 15,
      paverLength: 8,
      paverWidth: 4,
      jointWidth: 0.25,
      pattern: 'running-bond',
    };
    const low = calculatePaver({ ...base, wasteFactor: 5 });
    const high = calculatePaver({ ...base, wasteFactor: 20 });
    expect(high.paversNeeded).toBeGreaterThan(low.paversNeeded as number);
    // Both should have same paversWithoutWaste
    expect(low.paversWithoutWaste).toBe(high.paversWithoutWaste);
  });

  // ─── Test 17: Output structure ───
  it('returns all expected output fields', () => {
    const result = calculatePaver({
      areaLength: 20,
      areaWidth: 15,
      paverLength: 8,
      paverWidth: 4,
      jointWidth: 0.25,
      pattern: 'running-bond',
      wasteFactor: 10,
    });
    expect(result).toHaveProperty('paversNeeded');
    expect(result).toHaveProperty('paversWithoutWaste');
    expect(result).toHaveProperty('totalArea');
    expect(result).toHaveProperty('paverAreaEach');
    expect(result).toHaveProperty('sandBase');
    expect(result).toHaveProperty('gravelBase');
    expect(result).toHaveProperty('polymericSand');
    expect(result).toHaveProperty('costEstimate');
    expect(result).toHaveProperty('summary');
  });

  // ─── Test 18: Basketweave pattern — same as running bond multiplier ───
  it('basketweave pattern uses 1.0 multiplier (same as running bond)', () => {
    const base = {
      areaLength: 10,
      areaWidth: 10,
      paverLength: 8,
      paverWidth: 4,
      jointWidth: 0.25,
      wasteFactor: 10,
    };
    const runningBond = calculatePaver({ ...base, pattern: 'running-bond' });
    const basketweave = calculatePaver({ ...base, pattern: 'basketweave' });
    expect(basketweave.paversWithoutWaste).toBe(runningBond.paversWithoutWaste);
    expect(basketweave.paversNeeded).toBe(runningBond.paversNeeded);
  });

  // ─── Test 19: Metric paver dimensions (cm) ───
  it('handles metric paver dimensions in cm', () => {
    const result = calculatePaver({
      areaLength: 10,
      areaWidth: 10,
      paverLength: 20,     // 20 cm ≈ 7.87 in
      paverWidth: 10,      // 10 cm ≈ 3.94 in
      paverLengthUnit: 'cm',
      paverWidthUnit: 'cm',
      jointWidth: 0.25,
      pattern: 'running-bond',
      wasteFactor: 10,
    });
    expect(result.totalArea).toBe(100);
    // Paver area ≈ 7.87 × 3.94 = 31 sq in
    expect(result.paverAreaEach).toBeGreaterThan(30);
    expect(result.paverAreaEach).toBeLessThan(32);
    expect(result.paversNeeded).toBeGreaterThan(0);
  });

  // ─── Test 20: Summary labels present ───
  it('returns summary with expected labels', () => {
    const result = calculatePaver({
      areaLength: 20,
      areaWidth: 15,
      paverLength: 8,
      paverWidth: 4,
      jointWidth: 0.25,
      pattern: 'running-bond',
      wasteFactor: 10,
    });
    const summary = result.summary as Array<{ label: string; value: string | number }>;
    expect(summary.length).toBeGreaterThanOrEqual(9);
    const labels = summary.map(s => s.label);
    expect(labels).toContain('Total Area');
    expect(labels).toContain('Paver Size');
    expect(labels).toContain('Pattern');
    expect(labels).toContain('Gravel Base');
    expect(labels).toContain('Leveling Sand');
    expect(labels).toContain('Polymeric Sand Bags');
  });
});
