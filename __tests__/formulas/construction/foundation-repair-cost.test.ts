import { calculateFoundationRepairCost } from '@/lib/formulas/construction/foundation-repair-cost';

describe('calculateFoundationRepairCost', () => {
  // ─── Test 1: Crack sealing, defaults (4 units, slab, moderate, easy, national) ───
  it('calculates crack sealing at default settings', () => {
    const result = calculateFoundationRepairCost({
      repairType: 'crack-sealing',
      quantity: 4,
      foundationType: 'slab-on-grade',
      severity: 'moderate-structural',
      accessDifficulty: 'easy',
      region: 'national',
    });
    // Base per unit: $250–$800
    // Adjusted: × 1.0 × 1.0 × 1.0 = $250–$800
    // Material (40%): $100–$320
    // Labor (60% × 1.0): $150–$480
    // CostPerUnit: $250–$800, mid $525
    // Total: $1,000–$3,200, mid $2,100
    expect(result.totalLow).toBe(1000);
    expect(result.totalHigh).toBe(3200);
    expect(result.totalMid).toBe(2100);
    expect(result.costPerUnit).toBe(525);
  });

  // ─── Test 2: Steel piers, 8 piers ───
  it('calculates steel piers for 8 piers', () => {
    const result = calculateFoundationRepairCost({
      repairType: 'steel-piers',
      quantity: 8,
      foundationType: 'slab-on-grade',
      severity: 'moderate-structural',
      accessDifficulty: 'easy',
      region: 'national',
    });
    // Base: $1,000–$2,000 per pier
    // CostPerUnit: $1,000–$2,000, mid $1,500
    // Total: $8,000–$16,000, mid $12,000
    expect(result.totalLow).toBe(8000);
    expect(result.totalHigh).toBe(16000);
    expect(result.totalMid).toBe(12000);
  });

  // ─── Test 3: Helical piers ───
  it('calculates helical piers cost', () => {
    const result = calculateFoundationRepairCost({
      repairType: 'helical-piers',
      quantity: 6,
      foundationType: 'slab-on-grade',
      severity: 'moderate-structural',
      accessDifficulty: 'easy',
      region: 'national',
    });
    // Base: $1,500–$3,000 per pier
    // Total: $9,000–$18,000, mid $13,500
    expect(result.totalLow).toBe(9000);
    expect(result.totalHigh).toBe(18000);
    expect(result.totalMid).toBe(13500);
  });

  // ─── Test 4: Carbon fiber straps ───
  it('calculates carbon fiber straps cost', () => {
    const result = calculateFoundationRepairCost({
      repairType: 'carbon-fiber-straps',
      quantity: 2,
      foundationType: 'slab-on-grade',
      severity: 'moderate-structural',
      accessDifficulty: 'easy',
      region: 'national',
    });
    // Base: $5,000–$10,000 per wall
    // Total: $10,000–$20,000, mid $15,000
    expect(result.totalLow).toBe(10000);
    expect(result.totalHigh).toBe(20000);
    expect(result.totalMid).toBe(15000);
  });

  // ─── Test 5: Mudjacking ───
  it('calculates mudjacking cost', () => {
    const result = calculateFoundationRepairCost({
      repairType: 'mudjacking',
      quantity: 3,
      foundationType: 'slab-on-grade',
      severity: 'moderate-structural',
      accessDifficulty: 'easy',
      region: 'national',
    });
    // Base: $500–$1,300 per section
    // Total: $1,500–$3,900, mid $2,700
    expect(result.totalLow).toBe(1500);
    expect(result.totalHigh).toBe(3900);
    expect(result.totalMid).toBe(2700);
  });

  // ─── Test 6: Polyurethane foam ───
  it('calculates polyurethane foam injection cost', () => {
    const result = calculateFoundationRepairCost({
      repairType: 'polyurethane-foam',
      quantity: 2,
      foundationType: 'slab-on-grade',
      severity: 'moderate-structural',
      accessDifficulty: 'easy',
      region: 'national',
    });
    // Base: $1,000–$2,500 per section
    // Total: $2,000–$5,000, mid $3,500
    expect(result.totalLow).toBe(2000);
    expect(result.totalHigh).toBe(5000);
    expect(result.totalMid).toBe(3500);
  });

  // ─── Test 7: Wall anchors ───
  it('calculates wall anchors cost', () => {
    const result = calculateFoundationRepairCost({
      repairType: 'wall-anchors',
      quantity: 1,
      foundationType: 'slab-on-grade',
      severity: 'moderate-structural',
      accessDifficulty: 'easy',
      region: 'national',
    });
    // Base: $3,000–$7,000 per wall
    // Total: $3,000–$7,000, mid $5,000
    expect(result.totalLow).toBe(3000);
    expect(result.totalHigh).toBe(7000);
    expect(result.totalMid).toBe(5000);
  });

  // ─── Test 8: Underpinning ───
  it('calculates underpinning cost', () => {
    const result = calculateFoundationRepairCost({
      repairType: 'underpinning',
      quantity: 10,
      foundationType: 'slab-on-grade',
      severity: 'moderate-structural',
      accessDifficulty: 'easy',
      region: 'national',
    });
    // Base: $1,000–$3,000 per pier
    // Total: $10,000–$30,000, mid $20,000
    expect(result.totalLow).toBe(10000);
    expect(result.totalHigh).toBe(30000);
    expect(result.totalMid).toBe(20000);
  });

  // ─── Test 9: Basement foundation multiplier (1.25x) ───
  it('applies basement foundation multiplier (1.25x)', () => {
    const slab = calculateFoundationRepairCost({
      repairType: 'steel-piers',
      quantity: 4,
      foundationType: 'slab-on-grade',
      severity: 'moderate-structural',
      accessDifficulty: 'easy',
      region: 'national',
    });
    const basement = calculateFoundationRepairCost({
      repairType: 'steel-piers',
      quantity: 4,
      foundationType: 'basement',
      severity: 'moderate-structural',
      accessDifficulty: 'easy',
      region: 'national',
    });
    // Basement is 1.25x slab
    expect(basement.totalMid).toBe(parseFloat(((slab.totalMid as number) * 1.25).toFixed(2)));
    expect((basement.totalLow as number)).toBeGreaterThan((slab.totalLow as number));
  });

  // ─── Test 10: Pier-and-beam foundation multiplier (1.10x) ───
  it('applies pier-and-beam foundation multiplier (1.10x)', () => {
    const slab = calculateFoundationRepairCost({
      repairType: 'crack-sealing',
      quantity: 4,
      foundationType: 'slab-on-grade',
      severity: 'moderate-structural',
      accessDifficulty: 'easy',
      region: 'national',
    });
    const pierBeam = calculateFoundationRepairCost({
      repairType: 'crack-sealing',
      quantity: 4,
      foundationType: 'pier-and-beam',
      severity: 'moderate-structural',
      accessDifficulty: 'easy',
      region: 'national',
    });
    expect((pierBeam.totalMid as number)).toBeCloseTo((slab.totalMid as number) * 1.10, 0);
  });

  // ─── Test 11: Crawl-space foundation multiplier (1.15x) ───
  it('applies crawl-space foundation multiplier (1.15x)', () => {
    const slab = calculateFoundationRepairCost({
      repairType: 'mudjacking',
      quantity: 2,
      foundationType: 'slab-on-grade',
      severity: 'moderate-structural',
      accessDifficulty: 'easy',
      region: 'national',
    });
    const crawl = calculateFoundationRepairCost({
      repairType: 'mudjacking',
      quantity: 2,
      foundationType: 'crawl-space',
      severity: 'moderate-structural',
      accessDifficulty: 'easy',
      region: 'national',
    });
    expect((crawl.totalMid as number)).toBeCloseTo((slab.totalMid as number) * 1.15, 0);
  });

  // ─── Test 12: Minor severity multiplier (0.75x) ───
  it('applies minor-cosmetic severity multiplier (0.75x)', () => {
    const moderate = calculateFoundationRepairCost({
      repairType: 'crack-sealing',
      quantity: 4,
      foundationType: 'slab-on-grade',
      severity: 'moderate-structural',
      accessDifficulty: 'easy',
      region: 'national',
    });
    const minor = calculateFoundationRepairCost({
      repairType: 'crack-sealing',
      quantity: 4,
      foundationType: 'slab-on-grade',
      severity: 'minor-cosmetic',
      accessDifficulty: 'easy',
      region: 'national',
    });
    // Minor is 0.75x moderate
    expect((minor.totalMid as number)).toBeLessThan((moderate.totalMid as number));
    expect((minor.totalMid as number)).toBeCloseTo((moderate.totalMid as number) * 0.75, 0);
  });

  // ─── Test 13: Severe severity multiplier (1.50x) ───
  it('applies severe-critical severity multiplier (1.50x)', () => {
    const moderate = calculateFoundationRepairCost({
      repairType: 'steel-piers',
      quantity: 4,
      foundationType: 'slab-on-grade',
      severity: 'moderate-structural',
      accessDifficulty: 'easy',
      region: 'national',
    });
    const severe = calculateFoundationRepairCost({
      repairType: 'steel-piers',
      quantity: 4,
      foundationType: 'slab-on-grade',
      severity: 'severe-critical',
      accessDifficulty: 'easy',
      region: 'national',
    });
    expect((severe.totalMid as number)).toBeCloseTo((moderate.totalMid as number) * 1.50, 0);
  });

  // ─── Test 14: Moderate access difficulty (1.15x) ───
  it('applies moderate access difficulty multiplier (1.15x)', () => {
    const easy = calculateFoundationRepairCost({
      repairType: 'helical-piers',
      quantity: 4,
      foundationType: 'slab-on-grade',
      severity: 'moderate-structural',
      accessDifficulty: 'easy',
      region: 'national',
    });
    const modAccess = calculateFoundationRepairCost({
      repairType: 'helical-piers',
      quantity: 4,
      foundationType: 'slab-on-grade',
      severity: 'moderate-structural',
      accessDifficulty: 'moderate',
      region: 'national',
    });
    expect((modAccess.totalMid as number)).toBeCloseTo((easy.totalMid as number) * 1.15, 0);
  });

  // ─── Test 15: Difficult access (1.30x) ───
  it('applies difficult access multiplier (1.30x)', () => {
    const easy = calculateFoundationRepairCost({
      repairType: 'wall-anchors',
      quantity: 1,
      foundationType: 'slab-on-grade',
      severity: 'moderate-structural',
      accessDifficulty: 'easy',
      region: 'national',
    });
    const difficult = calculateFoundationRepairCost({
      repairType: 'wall-anchors',
      quantity: 1,
      foundationType: 'slab-on-grade',
      severity: 'moderate-structural',
      accessDifficulty: 'difficult',
      region: 'national',
    });
    expect((difficult.totalMid as number)).toBeCloseTo((easy.totalMid as number) * 1.30, 0);
  });

  // ─── Test 16: Northeast regional multiplier (1.20x on labor) ───
  it('applies northeast regional labor multiplier (1.20x)', () => {
    const national = calculateFoundationRepairCost({
      repairType: 'steel-piers',
      quantity: 4,
      foundationType: 'slab-on-grade',
      severity: 'moderate-structural',
      accessDifficulty: 'easy',
      region: 'national',
    });
    const northeast = calculateFoundationRepairCost({
      repairType: 'steel-piers',
      quantity: 4,
      foundationType: 'slab-on-grade',
      severity: 'moderate-structural',
      accessDifficulty: 'easy',
      region: 'northeast',
    });
    // Material stays same, labor increases
    expect((northeast.totalMaterialCost as number)).toBe((national.totalMaterialCost as number));
    expect((northeast.totalLaborCost as number)).toBeGreaterThan((national.totalLaborCost as number));
    expect((northeast.totalMid as number)).toBeGreaterThan((national.totalMid as number));
  });

  // ─── Test 17: South regional multiplier (0.85x on labor) ───
  it('applies south regional labor multiplier (0.85x)', () => {
    const national = calculateFoundationRepairCost({
      repairType: 'crack-sealing',
      quantity: 4,
      foundationType: 'slab-on-grade',
      severity: 'moderate-structural',
      accessDifficulty: 'easy',
      region: 'national',
    });
    const south = calculateFoundationRepairCost({
      repairType: 'crack-sealing',
      quantity: 4,
      foundationType: 'slab-on-grade',
      severity: 'moderate-structural',
      accessDifficulty: 'easy',
      region: 'south',
    });
    expect((south.totalLaborCost as number)).toBeLessThan((national.totalLaborCost as number));
    expect((south.totalMaterialCost as number)).toBe((national.totalMaterialCost as number));
  });

  // ─── Test 18: West Coast regional multiplier (1.25x — most expensive) ───
  it('applies west coast regional labor multiplier (1.25x)', () => {
    const national = calculateFoundationRepairCost({
      repairType: 'helical-piers',
      quantity: 4,
      foundationType: 'slab-on-grade',
      severity: 'moderate-structural',
      accessDifficulty: 'easy',
      region: 'national',
    });
    const westCoast = calculateFoundationRepairCost({
      repairType: 'helical-piers',
      quantity: 4,
      foundationType: 'slab-on-grade',
      severity: 'moderate-structural',
      accessDifficulty: 'easy',
      region: 'west-coast',
    });
    // National labor mid: (1500+3000)/2 * 0.60 * 4 = 2700 * 4 = $5,400
    // West Coast labor mid: (1500+3000)/2 * 0.60 * 1.25 * 4 = 3375 * 4 = $6,750 — wait, per-unit calc
    // Actually: laborMidPerUnit = ((1500*0.60*1.0) + (3000*0.60*1.0))/2 = (900+1800)/2 = 1350 national
    // WC: ((1500*0.60*1.25) + (3000*0.60*1.25))/2 = (1125+2250)/2 = 1687.50
    expect((westCoast.totalLaborCost as number)).toBeCloseTo((national.totalLaborCost as number) * 1.25, 0);
  });

  // ─── Test 19: Quantity 1 (minimum) ───
  it('handles quantity of 1', () => {
    const result = calculateFoundationRepairCost({
      repairType: 'crack-sealing',
      quantity: 1,
      foundationType: 'slab-on-grade',
      severity: 'moderate-structural',
      accessDifficulty: 'easy',
      region: 'national',
    });
    // costPerUnit should equal totalMid since quantity = 1
    expect(result.totalLow).toBe(250);
    expect(result.totalHigh).toBe(800);
    expect(result.totalMid).toBe(525);
    expect(result.costPerUnit).toBe(525);
  });

  // ─── Test 20: Quantity clamped to max 50 ───
  it('clamps quantity to maximum of 50', () => {
    const result = calculateFoundationRepairCost({
      repairType: 'crack-sealing',
      quantity: 100,
      foundationType: 'slab-on-grade',
      severity: 'moderate-structural',
      accessDifficulty: 'easy',
      region: 'national',
    });
    // Should be clamped to 50
    // Total: 250 × 50 = $12,500 low, 800 × 50 = $40,000 high
    expect(result.totalLow).toBe(12500);
    expect(result.totalHigh).toBe(40000);
  });

  // ─── Test 21: Quantity=0 falls back to default of 4 ───
  it('uses default quantity of 4 when 0 is passed (falsy fallback)', () => {
    const result = calculateFoundationRepairCost({
      repairType: 'crack-sealing',
      quantity: 0,
      foundationType: 'slab-on-grade',
      severity: 'moderate-structural',
      accessDifficulty: 'easy',
      region: 'national',
    });
    // 0 is falsy → falls back to default 4 via `|| 4`
    // costPerUnit: 250 × 1.0 × 1.0 × 1.0 = 250 → mat 100 + lab 150 = 250
    // totalLow = 250 × 4 = 1000
    expect(result.totalLow).toBe(1000);
    expect(result.totalHigh).toBe(3200);
  });

  // ─── Test 22: Output structure ───
  it('returns all expected output fields', () => {
    const result = calculateFoundationRepairCost({
      repairType: 'steel-piers',
      quantity: 4,
      foundationType: 'slab-on-grade',
      severity: 'moderate-structural',
      accessDifficulty: 'easy',
      region: 'national',
    });
    expect(result).toHaveProperty('repairCostPerUnit');
    expect(result).toHaveProperty('totalMaterialCost');
    expect(result).toHaveProperty('totalLaborCost');
    expect(result).toHaveProperty('totalLow');
    expect(result).toHaveProperty('totalHigh');
    expect(result).toHaveProperty('totalMid');
    expect(result).toHaveProperty('costPerUnit');
    expect(result).toHaveProperty('repairComparison');
    expect(result).toHaveProperty('timeline');
    expect(result).toHaveProperty('permitNote');
  });

  // ─── Test 23: Repair comparison has all 8 types ───
  it('returns repair comparison with all 8 types', () => {
    const result = calculateFoundationRepairCost({
      repairType: 'crack-sealing',
      quantity: 4,
      foundationType: 'slab-on-grade',
      severity: 'moderate-structural',
      accessDifficulty: 'easy',
      region: 'national',
    });
    const comparison = result.repairComparison as Array<{ label: string; value: number }>;
    expect(comparison).toHaveLength(8);
    comparison.forEach(item => {
      expect(item.value).toBeGreaterThan(0);
      expect(item.label).toBeTruthy();
    });
    // Crack sealing should be cheapest, carbon fiber straps or wall anchors most expensive
    const crackSealing = comparison.find(c => c.label.includes('Crack Sealing'));
    const wallAnchors = comparison.find(c => c.label.includes('Wall Anchors'));
    expect(crackSealing!.value).toBeLessThan(wallAnchors!.value);
  });

  // ─── Test 24: Material/labor split is 40/60 ───
  it('splits costs 40% material / 60% labor', () => {
    const result = calculateFoundationRepairCost({
      repairType: 'steel-piers',
      quantity: 4,
      foundationType: 'slab-on-grade',
      severity: 'moderate-structural',
      accessDifficulty: 'easy',
      region: 'national',
    });
    const totalMaterial = result.totalMaterialCost as number;
    const totalLabor = result.totalLaborCost as number;
    // At national (1.0x), material = 40%, labor = 60%
    const total = totalMaterial + totalLabor;
    expect(totalMaterial / total).toBeCloseTo(0.4, 2);
    expect(totalLabor / total).toBeCloseTo(0.6, 2);
  });

  // ─── Test 25: Combined multipliers stack correctly ───
  it('stacks foundation, severity, and access multipliers', () => {
    const base = calculateFoundationRepairCost({
      repairType: 'crack-sealing',
      quantity: 1,
      foundationType: 'slab-on-grade',
      severity: 'moderate-structural',
      accessDifficulty: 'easy',
      region: 'national',
    });
    const stacked = calculateFoundationRepairCost({
      repairType: 'crack-sealing',
      quantity: 1,
      foundationType: 'basement',          // 1.25x
      severity: 'severe-critical',         // 1.50x
      accessDifficulty: 'difficult',       // 1.30x
      region: 'national',
    });
    // Combined multiplier: 1.25 × 1.50 × 1.30 = 2.4375
    const expectedMultiplier = 1.25 * 1.50 * 1.30;
    expect((stacked.totalMid as number)).toBeCloseTo((base.totalMid as number) * expectedMultiplier, 0);
  });

  // ─── Test 26: Default inputs produce valid output ───
  it('uses defaults when values are missing', () => {
    const result = calculateFoundationRepairCost({});
    // Defaults: crack-sealing, 4 units, slab, moderate, easy, national
    expect(result.totalLow).toBe(1000);
    expect(result.totalHigh).toBe(3200);
    expect(typeof result.timeline).toBe('string');
    expect(typeof result.permitNote).toBe('string');
  });

  // ─── Test 27: Timeline text returned for each repair type ───
  it('returns correct timeline text per repair type', () => {
    const crackResult = calculateFoundationRepairCost({
      repairType: 'crack-sealing', quantity: 1, foundationType: 'slab-on-grade',
      severity: 'moderate-structural', accessDifficulty: 'easy', region: 'national',
    });
    const pierResult = calculateFoundationRepairCost({
      repairType: 'steel-piers', quantity: 1, foundationType: 'slab-on-grade',
      severity: 'moderate-structural', accessDifficulty: 'easy', region: 'national',
    });
    expect(crackResult.timeline).toContain('hour');
    expect(pierResult.timeline).toContain('day');
  });

  // ─── Test 28: Permit note returned for structural repairs ───
  it('returns permit note mentioning permit for structural repairs', () => {
    const steelPiers = calculateFoundationRepairCost({
      repairType: 'steel-piers', quantity: 4, foundationType: 'slab-on-grade',
      severity: 'moderate-structural', accessDifficulty: 'easy', region: 'national',
    });
    const crackSeal = calculateFoundationRepairCost({
      repairType: 'crack-sealing', quantity: 4, foundationType: 'slab-on-grade',
      severity: 'moderate-structural', accessDifficulty: 'easy', region: 'national',
    });
    expect((steelPiers.permitNote as string).toLowerCase()).toContain('permit');
    expect((crackSeal.permitNote as string).toLowerCase()).toContain('not required');
  });

  // ─── Test 29: Mid-Atlantic regional multiplier (1.15x) ───
  it('applies mid-atlantic regional labor multiplier (1.15x)', () => {
    const national = calculateFoundationRepairCost({
      repairType: 'mudjacking', quantity: 2, foundationType: 'slab-on-grade',
      severity: 'moderate-structural', accessDifficulty: 'easy', region: 'national',
    });
    const midAtlantic = calculateFoundationRepairCost({
      repairType: 'mudjacking', quantity: 2, foundationType: 'slab-on-grade',
      severity: 'moderate-structural', accessDifficulty: 'easy', region: 'mid-atlantic',
    });
    expect((midAtlantic.totalLaborCost as number)).toBeCloseTo((national.totalLaborCost as number) * 1.15, 0);
    expect((midAtlantic.totalMaterialCost as number)).toBe((national.totalMaterialCost as number));
  });

  // ─── Test 30: Mountain West regional multiplier (0.95x) ───
  it('applies mountain-west regional labor multiplier (0.95x)', () => {
    const national = calculateFoundationRepairCost({
      repairType: 'underpinning', quantity: 4, foundationType: 'slab-on-grade',
      severity: 'moderate-structural', accessDifficulty: 'easy', region: 'national',
    });
    const mountainWest = calculateFoundationRepairCost({
      repairType: 'underpinning', quantity: 4, foundationType: 'slab-on-grade',
      severity: 'moderate-structural', accessDifficulty: 'easy', region: 'mountain-west',
    });
    expect((mountainWest.totalLaborCost as number)).toBeCloseTo((national.totalLaborCost as number) * 0.95, 0);
  });

  // ─── Test 31: Crack sealing is cheapest in comparison, wall anchors among most expensive ───
  it('crack sealing cheapest, carbon fiber straps or wall anchors most expensive in comparison', () => {
    const result = calculateFoundationRepairCost({
      repairType: 'crack-sealing', quantity: 1, foundationType: 'slab-on-grade',
      severity: 'moderate-structural', accessDifficulty: 'easy', region: 'national',
    });
    const comparison = result.repairComparison as Array<{ label: string; value: number }>;
    const values = comparison.map(c => c.value);
    const crackSealing = comparison.find(c => c.label.includes('Crack Sealing'))!;
    expect(crackSealing.value).toBe(Math.min(...values));
  });

  // ─── Test 32: Midwest regional multiplier (0.90x) ───
  it('applies midwest regional labor multiplier (0.90x)', () => {
    const national = calculateFoundationRepairCost({
      repairType: 'polyurethane-foam', quantity: 2, foundationType: 'slab-on-grade',
      severity: 'moderate-structural', accessDifficulty: 'easy', region: 'national',
    });
    const midwest = calculateFoundationRepairCost({
      repairType: 'polyurethane-foam', quantity: 2, foundationType: 'slab-on-grade',
      severity: 'moderate-structural', accessDifficulty: 'easy', region: 'midwest',
    });
    expect((midwest.totalLaborCost as number)).toBeCloseTo((national.totalLaborCost as number) * 0.90, 0);
    expect((midwest.totalMaterialCost as number)).toBe((national.totalMaterialCost as number));
  });
});
