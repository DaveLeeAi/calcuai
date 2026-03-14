import { calculateTreeRemovalCost } from '@/lib/formulas/construction/tree-removal-cost';

describe('calculateTreeRemovalCost', () => {
  // ─── Test 1: Default medium tree, national (no stump, no cleanup) ───
  it('calculates default medium tree at national average', () => {
    const result = calculateTreeRemovalCost({});
    // Defaults: medium-25-50ft, thin-under-12in, healthy, open-yard, none, leave-debris, national
    // Base: $500–$1200 × 1.0 × 1.0 × 1.0 = $500–$1200
    // Material (30%): 500×0.30=$150 low, 1200×0.30=$360 high
    // Labor (70%×1.0): 500×0.70=$350 low, 1200×0.70=$840 high
    // treeCostLow: 150+350=$500, treeCostHigh: 360+840=$1200
    // totalLow: $500, totalHigh: $1200, totalMid: $850
    expect(result.totalLow).toBeCloseTo(500, 0);
    expect(result.totalHigh).toBeCloseTo(1200, 0);
    expect(result.totalMid).toBeCloseTo(850, 0);
    expect(result.treeCost).toBeCloseTo(850, 0); // (500+1200)/2
    expect(result.stumpCost).toBe(0);
    expect(result.cleanupCost).toBe(0);
    expect(result.costPerTree).toBeCloseTo(850, 0);
  });

  // ─── Test 2: Small tree (under 25 ft) ───
  it('calculates small tree removal costs', () => {
    const result = calculateTreeRemovalCost({
      treeHeight: 'small-under-25ft', trunkDiameter: 'thin-under-12in',
      condition: 'healthy', proximity: 'open-yard',
      stumpRemoval: 'none', cleanup: 'leave-debris', region: 'national',
    });
    // Base: $200–$500
    expect(result.totalLow).toBeCloseTo(200, 0);
    expect(result.totalHigh).toBeCloseTo(500, 0);
    expect(result.totalMid).toBeCloseTo(350, 0);
  });

  // ─── Test 3: Medium tree (25-50 ft) ───
  it('calculates medium tree removal costs', () => {
    const result = calculateTreeRemovalCost({
      treeHeight: 'medium-25-50ft', trunkDiameter: 'thin-under-12in',
      condition: 'healthy', proximity: 'open-yard',
      stumpRemoval: 'none', cleanup: 'leave-debris', region: 'national',
    });
    // Base: $500–$1200
    expect(result.totalLow).toBeCloseTo(500, 0);
    expect(result.totalHigh).toBeCloseTo(1200, 0);
    expect(result.totalMid).toBeCloseTo(850, 0);
  });

  // ─── Test 4: Large tree (50-75 ft) ───
  it('calculates large tree removal costs', () => {
    const result = calculateTreeRemovalCost({
      treeHeight: 'large-50-75ft', trunkDiameter: 'thin-under-12in',
      condition: 'healthy', proximity: 'open-yard',
      stumpRemoval: 'none', cleanup: 'leave-debris', region: 'national',
    });
    // Base: $1200–$2500
    expect(result.totalLow).toBeCloseTo(1200, 0);
    expect(result.totalHigh).toBeCloseTo(2500, 0);
    expect(result.totalMid).toBeCloseTo(1850, 0);
  });

  // ─── Test 5: Extra-large tree (over 75 ft) ───
  it('calculates extra-large tree removal costs', () => {
    const result = calculateTreeRemovalCost({
      treeHeight: 'xlarge-over-75ft', trunkDiameter: 'thin-under-12in',
      condition: 'healthy', proximity: 'open-yard',
      stumpRemoval: 'none', cleanup: 'leave-debris', region: 'national',
    });
    // Base: $2500–$5000
    expect(result.totalLow).toBeCloseTo(2500, 0);
    expect(result.totalHigh).toBeCloseTo(5000, 0);
    expect(result.totalMid).toBeCloseTo(3750, 0);
  });

  // ─── Test 6: Thin trunk diameter baseline (1.0x) ───
  it('applies thin trunk diameter baseline (1.0x)', () => {
    const result = calculateTreeRemovalCost({
      treeHeight: 'large-50-75ft', trunkDiameter: 'thin-under-12in',
      condition: 'healthy', proximity: 'open-yard',
      stumpRemoval: 'none', cleanup: 'leave-debris', region: 'national',
    });
    // Base: 1200×1.0=$1200, 2500×1.0=$2500
    expect(result.totalLow).toBeCloseTo(1200, 0);
    expect(result.totalHigh).toBeCloseTo(2500, 0);
  });

  // ─── Test 7: Medium trunk diameter multiplier (1.20x) ───
  it('applies medium trunk diameter multiplier (1.20x)', () => {
    const result = calculateTreeRemovalCost({
      treeHeight: 'medium-25-50ft', trunkDiameter: 'medium-12-24in',
      condition: 'healthy', proximity: 'open-yard',
      stumpRemoval: 'none', cleanup: 'leave-debris', region: 'national',
    });
    // Base: 500×1.20=$600 low, 1200×1.20=$1440 high
    // Material: 600×0.30=$180, 1440×0.30=$432
    // Labor: 600×0.70=$420, 1440×0.70=$1008
    // treeCostLow: 180+420=$600, treeCostHigh: 432+1008=$1440
    expect(result.totalLow).toBeCloseTo(600, 0);
    expect(result.totalHigh).toBeCloseTo(1440, 0);
    expect(result.totalMid).toBeCloseTo(1020, 0);
  });

  // ─── Test 8: Thick trunk diameter multiplier (1.50x) ───
  it('applies thick trunk diameter multiplier (1.50x)', () => {
    const result = calculateTreeRemovalCost({
      treeHeight: 'medium-25-50ft', trunkDiameter: 'thick-over-24in',
      condition: 'healthy', proximity: 'open-yard',
      stumpRemoval: 'none', cleanup: 'leave-debris', region: 'national',
    });
    // Base: 500×1.50=$750 low, 1200×1.50=$1800 high
    expect(result.totalLow).toBeCloseTo(750, 0);
    expect(result.totalHigh).toBeCloseTo(1800, 0);
    expect(result.totalMid).toBeCloseTo(1275, 0);
  });

  // ─── Test 9: Healthy condition baseline (1.0x) ───
  it('applies healthy condition baseline (1.0x)', () => {
    const result = calculateTreeRemovalCost({
      treeHeight: 'medium-25-50ft', trunkDiameter: 'thin-under-12in',
      condition: 'healthy', proximity: 'open-yard',
      stumpRemoval: 'none', cleanup: 'leave-debris', region: 'national',
    });
    expect(result.totalLow).toBeCloseTo(500, 0);
    expect(result.totalHigh).toBeCloseTo(1200, 0);
  });

  // ─── Test 10: Dead/diseased condition multiplier (1.15x) ───
  it('applies dead-diseased condition multiplier (1.15x)', () => {
    const result = calculateTreeRemovalCost({
      treeHeight: 'medium-25-50ft', trunkDiameter: 'thin-under-12in',
      condition: 'dead-diseased', proximity: 'open-yard',
      stumpRemoval: 'none', cleanup: 'leave-debris', region: 'national',
    });
    // Base: 500×1.15=$575 low, 1200×1.15=$1380 high
    expect(result.totalLow).toBeCloseTo(575, 0);
    expect(result.totalHigh).toBeCloseTo(1380, 0);
    expect(result.totalMid).toBeCloseTo(977.5, 0);
  });

  // ─── Test 11: Storm-damaged condition multiplier (1.30x) ───
  it('applies storm-damaged condition multiplier (1.30x)', () => {
    const result = calculateTreeRemovalCost({
      treeHeight: 'medium-25-50ft', trunkDiameter: 'thin-under-12in',
      condition: 'storm-damaged', proximity: 'open-yard',
      stumpRemoval: 'none', cleanup: 'leave-debris', region: 'national',
    });
    // Base: 500×1.30=$650 low, 1200×1.30=$1560 high
    expect(result.totalLow).toBeCloseTo(650, 0);
    expect(result.totalHigh).toBeCloseTo(1560, 0);
    expect(result.totalMid).toBeCloseTo(1105, 0);
  });

  // ─── Test 12: Open-yard proximity baseline (1.0x) ───
  it('applies open-yard proximity baseline (1.0x)', () => {
    const result = calculateTreeRemovalCost({
      treeHeight: 'medium-25-50ft', trunkDiameter: 'thin-under-12in',
      condition: 'healthy', proximity: 'open-yard',
      stumpRemoval: 'none', cleanup: 'leave-debris', region: 'national',
    });
    expect(result.totalLow).toBeCloseTo(500, 0);
    expect(result.totalHigh).toBeCloseTo(1200, 0);
  });

  // ─── Test 13: Near-structure proximity multiplier (1.25x) ───
  it('applies near-structure proximity multiplier (1.25x)', () => {
    const result = calculateTreeRemovalCost({
      treeHeight: 'medium-25-50ft', trunkDiameter: 'thin-under-12in',
      condition: 'healthy', proximity: 'near-structure',
      stumpRemoval: 'none', cleanup: 'leave-debris', region: 'national',
    });
    // Base: 500×1.25=$625 low, 1200×1.25=$1500 high
    expect(result.totalLow).toBeCloseTo(625, 0);
    expect(result.totalHigh).toBeCloseTo(1500, 0);
    expect(result.totalMid).toBeCloseTo(1062.5, 0);
  });

  // ─── Test 14: Near-power-lines proximity multiplier (1.50x) ───
  it('applies near-power-lines proximity multiplier (1.50x)', () => {
    const result = calculateTreeRemovalCost({
      treeHeight: 'medium-25-50ft', trunkDiameter: 'thin-under-12in',
      condition: 'healthy', proximity: 'near-power-lines',
      stumpRemoval: 'none', cleanup: 'leave-debris', region: 'national',
    });
    // Base: 500×1.50=$750 low, 1200×1.50=$1800 high
    expect(result.totalLow).toBeCloseTo(750, 0);
    expect(result.totalHigh).toBeCloseTo(1800, 0);
    expect(result.totalMid).toBeCloseTo(1275, 0);
  });

  // ─── Test 15: Stump grinding add-on ($150-$400) ───
  it('adds stump grinding cost ($150-$400)', () => {
    const noStump = calculateTreeRemovalCost({
      treeHeight: 'medium-25-50ft', trunkDiameter: 'thin-under-12in',
      condition: 'healthy', proximity: 'open-yard',
      stumpRemoval: 'none', cleanup: 'leave-debris', region: 'national',
    });
    const grinding = calculateTreeRemovalCost({
      treeHeight: 'medium-25-50ft', trunkDiameter: 'thin-under-12in',
      condition: 'healthy', proximity: 'open-yard',
      stumpRemoval: 'grinding', cleanup: 'leave-debris', region: 'national',
    });
    expect(grinding.stumpCost).toBeCloseTo(275, 0); // (150+400)/2
    expect(grinding.totalLow as number).toBeCloseTo((noStump.totalLow as number) + 150, 0);
    expect(grinding.totalHigh as number).toBeCloseTo((noStump.totalHigh as number) + 400, 0);
    // totalLow: 500+150=$650, totalHigh: 1200+400=$1600
    expect(grinding.totalLow).toBeCloseTo(650, 0);
    expect(grinding.totalHigh).toBeCloseTo(1600, 0);
  });

  // ─── Test 16: Full stump removal add-on ($300-$700) ───
  it('adds full stump removal cost ($300-$700)', () => {
    const result = calculateTreeRemovalCost({
      treeHeight: 'medium-25-50ft', trunkDiameter: 'thin-under-12in',
      condition: 'healthy', proximity: 'open-yard',
      stumpRemoval: 'full-removal', cleanup: 'leave-debris', region: 'national',
    });
    expect(result.stumpCost).toBeCloseTo(500, 0); // (300+700)/2
    // totalLow: 500+300=$800, totalHigh: 1200+700=$1900
    expect(result.totalLow).toBeCloseTo(800, 0);
    expect(result.totalHigh).toBeCloseTo(1900, 0);
    expect(result.totalMid).toBeCloseTo(1350, 0);
  });

  // ─── Test 17: Chip-and-haul cleanup add-on ($75-$200) ───
  it('adds chip-and-haul cleanup cost ($75-$200)', () => {
    const noClean = calculateTreeRemovalCost({
      treeHeight: 'medium-25-50ft', trunkDiameter: 'thin-under-12in',
      condition: 'healthy', proximity: 'open-yard',
      stumpRemoval: 'none', cleanup: 'leave-debris', region: 'national',
    });
    const chipHaul = calculateTreeRemovalCost({
      treeHeight: 'medium-25-50ft', trunkDiameter: 'thin-under-12in',
      condition: 'healthy', proximity: 'open-yard',
      stumpRemoval: 'none', cleanup: 'chip-and-haul', region: 'national',
    });
    expect(chipHaul.cleanupCost).toBeCloseTo(137.5, 0); // (75+200)/2
    expect(chipHaul.totalLow as number).toBeCloseTo((noClean.totalLow as number) + 75, 0);
    expect(chipHaul.totalHigh as number).toBeCloseTo((noClean.totalHigh as number) + 200, 0);
    // totalLow: 500+75=$575, totalHigh: 1200+200=$1400
    expect(chipHaul.totalMid).toBeCloseTo(987.5, 0);
  });

  // ─── Test 18: Northeast regional multiplier (1.20x on labor) ───
  it('applies northeast regional labor multiplier (1.20x)', () => {
    const national = calculateTreeRemovalCost({
      treeHeight: 'medium-25-50ft', trunkDiameter: 'thin-under-12in',
      condition: 'healthy', proximity: 'open-yard',
      stumpRemoval: 'none', cleanup: 'leave-debris', region: 'national',
    });
    const northeast = calculateTreeRemovalCost({
      treeHeight: 'medium-25-50ft', trunkDiameter: 'thin-under-12in',
      condition: 'healthy', proximity: 'open-yard',
      stumpRemoval: 'none', cleanup: 'leave-debris', region: 'northeast',
    });
    // Material (30%) stays same: $150 low, $360 high
    // Labor (70%): 500×0.70×1.20=$420 low, 1200×0.70×1.20=$1008 high
    // treeCostLow: 150+420=$570, treeCostHigh: 360+1008=$1368
    expect(northeast.totalLow).toBeCloseTo(570, 0);
    expect(northeast.totalHigh).toBeCloseTo(1368, 0);
    expect((northeast.totalMid as number)).toBeGreaterThan((national.totalMid as number));
  });

  // ─── Test 19: South regional multiplier (0.85x on labor) ───
  it('applies south regional labor multiplier (0.85x)', () => {
    const national = calculateTreeRemovalCost({
      treeHeight: 'medium-25-50ft', trunkDiameter: 'thin-under-12in',
      condition: 'healthy', proximity: 'open-yard',
      stumpRemoval: 'none', cleanup: 'leave-debris', region: 'national',
    });
    const south = calculateTreeRemovalCost({
      treeHeight: 'medium-25-50ft', trunkDiameter: 'thin-under-12in',
      condition: 'healthy', proximity: 'open-yard',
      stumpRemoval: 'none', cleanup: 'leave-debris', region: 'south',
    });
    // Labor south: 350×0.85=$297.50, 840×0.85=$714
    // treeCostLow: 150+297.50=$447.50, treeCostHigh: 360+714=$1074
    expect(south.totalLow).toBeCloseTo(447.50, 0);
    expect(south.totalHigh).toBeCloseTo(1074, 0);
    expect((south.totalMid as number)).toBeLessThan((national.totalMid as number));
  });

  // ─── Test 20: All worst-case options combined ───
  it('calculates worst-case scenario (xlarge, thick, storm-damaged, near-power-lines, full-removal, chip-and-haul, west-coast)', () => {
    const result = calculateTreeRemovalCost({
      treeHeight: 'xlarge-over-75ft',
      trunkDiameter: 'thick-over-24in',
      condition: 'storm-damaged',
      proximity: 'near-power-lines',
      stumpRemoval: 'full-removal',
      cleanup: 'chip-and-haul',
      region: 'west-coast',
    });
    // Base low:  2500 × 1.50 × 1.30 × 1.50 = 7312.50
    // Base high: 5000 × 1.50 × 1.30 × 1.50 = 14625
    // Material (30%): 7312.50×0.30=2193.75, 14625×0.30=4387.50
    // Labor (70%×1.25): 7312.50×0.70×1.25=6398.44, 14625×0.70×1.25=12796.88
    // treeCostLow: 2193.75+6398.44=8592.19, treeCostHigh: 4387.50+12796.88=17184.38
    // stump: $300–$700, cleanup: $75–$200
    // totalLow: 8592.19+300+75=8967.19
    // totalHigh: 17184.38+700+200=18084.38
    expect(result.totalLow).toBeCloseTo(8967.19, 0);
    expect(result.totalHigh).toBeCloseTo(18084.38, 0);
    expect((result.totalMid as number)).toBeGreaterThan(13000);
    expect(result.stumpCost).toBeCloseTo(500, 0);
    expect(result.cleanupCost).toBeCloseTo(137.5, 0);
  });

  // ─── Test 21: sizeComparison array has 4 entries ───
  it('returns sizeComparison array with 4 entries', () => {
    const result = calculateTreeRemovalCost({});
    const sizeComparison = result.sizeComparison as Array<{ label: string; value: number }>;
    expect(sizeComparison).toHaveLength(4);
    sizeComparison.forEach(item => {
      expect(item.label).toBeTruthy();
      expect(item.value).toBeGreaterThan(0);
    });
    // Small should be cheapest, xlarge most expensive
    expect(sizeComparison[0].value).toBeLessThan(sizeComparison[3].value);
  });

  // ─── Test 22: Timeline string exists for each height ───
  it('returns correct timeline string for each tree height', () => {
    const small = calculateTreeRemovalCost({ treeHeight: 'small-under-25ft' });
    const medium = calculateTreeRemovalCost({ treeHeight: 'medium-25-50ft' });
    const large = calculateTreeRemovalCost({ treeHeight: 'large-50-75ft' });
    const xlarge = calculateTreeRemovalCost({ treeHeight: 'xlarge-over-75ft' });
    expect(small.timeline).toBe('2-4 hours');
    expect(medium.timeline).toBe('4-8 hours (half day to full day)');
    expect(large.timeline).toBe('1-2 days');
    expect(xlarge.timeline).toBe('2-3 days');
  });

  // ─── Test 23: Permit note exists ───
  it('returns a permit note string', () => {
    const result = calculateTreeRemovalCost({});
    expect(typeof result.permitNote).toBe('string');
    expect((result.permitNote as string).length).toBeGreaterThan(0);
    expect((result.permitNote as string)).toContain('permit');
  });

  // ─── Test 24: Invalid inputs default gracefully ───
  it('uses default values for invalid inputs', () => {
    const result = calculateTreeRemovalCost({
      treeHeight: 'nonexistent',
      trunkDiameter: 'bogus',
      condition: 'unknown',
      proximity: 'invalid',
      stumpRemoval: 'nope',
      cleanup: 'bad-value',
      region: 'mars',
    });
    // Should fall back to medium height, thin trunk (1.0), healthy (1.0), open-yard (1.0),
    // no stump, leave-debris, national (1.0) — same as defaults
    expect(result.totalLow).toBeCloseTo(500, 0);
    expect(result.totalHigh).toBeCloseTo(1200, 0);
    expect(result.totalMid).toBeCloseTo(850, 0);
  });

  // ─── Test 25: costPerTree equals totalMid ───
  it('sets costPerTree equal to totalMid', () => {
    const result = calculateTreeRemovalCost({
      treeHeight: 'large-50-75ft',
      trunkDiameter: 'medium-12-24in',
      condition: 'healthy',
      proximity: 'open-yard',
      stumpRemoval: 'grinding',
      cleanup: 'chip-and-haul',
      region: 'national',
    });
    expect(result.costPerTree).toBe(result.totalMid);
  });

  // ─── Test 26: Regional multiplier only affects labor, not material ───
  it('regional multiplier changes labor but not material portion', () => {
    const national = calculateTreeRemovalCost({
      treeHeight: 'medium-25-50ft', trunkDiameter: 'thin-under-12in',
      condition: 'healthy', proximity: 'open-yard',
      stumpRemoval: 'none', cleanup: 'leave-debris', region: 'national',
    });
    const westCoast = calculateTreeRemovalCost({
      treeHeight: 'medium-25-50ft', trunkDiameter: 'thin-under-12in',
      condition: 'healthy', proximity: 'open-yard',
      stumpRemoval: 'none', cleanup: 'leave-debris', region: 'west-coast',
    });
    // West coast: mat=150, lab=350×1.25=437.50, treeCostLow=587.50
    // West coast: mat=360, lab=840×1.25=1050, treeCostHigh=1410
    expect(westCoast.totalLow).toBeCloseTo(587.5, 0);
    expect(westCoast.totalHigh).toBeCloseTo(1410, 0);
    expect((westCoast.totalMid as number)).toBeGreaterThan((national.totalMid as number));
  });

  // ─── Test 27: Mid-atlantic regional multiplier (1.15x) ───
  it('applies mid-atlantic regional labor multiplier (1.15x)', () => {
    const result = calculateTreeRemovalCost({
      treeHeight: 'medium-25-50ft', trunkDiameter: 'thin-under-12in',
      condition: 'healthy', proximity: 'open-yard',
      stumpRemoval: 'none', cleanup: 'leave-debris', region: 'mid-atlantic',
    });
    // Material low: 150, Labor low: 350×1.15=402.50, treeCostLow: 552.50
    // Material high: 360, Labor high: 840×1.15=966, treeCostHigh: 1326
    expect(result.totalLow).toBeCloseTo(552.5, 0);
    expect(result.totalHigh).toBeCloseTo(1326, 0);
  });

  // ─── Test 28: Midwest regional multiplier (0.90x) ───
  it('applies midwest regional labor multiplier (0.90x)', () => {
    const result = calculateTreeRemovalCost({
      treeHeight: 'medium-25-50ft', trunkDiameter: 'thin-under-12in',
      condition: 'healthy', proximity: 'open-yard',
      stumpRemoval: 'none', cleanup: 'leave-debris', region: 'midwest',
    });
    // Material low: 150, Labor low: 350×0.90=315, treeCostLow: 465
    // Material high: 360, Labor high: 840×0.90=756, treeCostHigh: 1116
    expect(result.totalLow).toBeCloseTo(465, 0);
    expect(result.totalHigh).toBeCloseTo(1116, 0);
  });

  // ─── Test 29: Mountain-west regional multiplier (0.95x) ───
  it('applies mountain-west regional labor multiplier (0.95x)', () => {
    const result = calculateTreeRemovalCost({
      treeHeight: 'medium-25-50ft', trunkDiameter: 'thin-under-12in',
      condition: 'healthy', proximity: 'open-yard',
      stumpRemoval: 'none', cleanup: 'leave-debris', region: 'mountain-west',
    });
    // Material low: 150, Labor low: 350×0.95=332.50, treeCostLow: 482.50
    // Material high: 360, Labor high: 840×0.95=798, treeCostHigh: 1158
    expect(result.totalLow).toBeCloseTo(482.5, 0);
    expect(result.totalHigh).toBeCloseTo(1158, 0);
  });

  // ─── Test 30: Material/labor split is 30/70 at national ───
  it('splits cost 30% material and 70% labor at national rate', () => {
    const result = calculateTreeRemovalCost({
      treeHeight: 'large-50-75ft', trunkDiameter: 'thin-under-12in',
      condition: 'healthy', proximity: 'open-yard',
      stumpRemoval: 'none', cleanup: 'leave-debris', region: 'national',
    });
    // Base: $1200–$2500 at national (1.0x labor)
    // At national, 30%+70% = 100%, so treeCost = base
    // treeCost mid: (1200+2500)/2 = 1850
    expect(result.treeCost).toBeCloseTo(1850, 0);
    expect(result.totalLow).toBeCloseTo(1200, 0);
    expect(result.totalHigh).toBeCloseTo(2500, 0);
  });

  // ─── Test 31: Combined multipliers (large, medium trunk, dead-diseased, near-structure, grinding, chip-and-haul, northeast) ───
  it('applies combined multipliers correctly', () => {
    const result = calculateTreeRemovalCost({
      treeHeight: 'large-50-75ft',
      trunkDiameter: 'medium-12-24in',
      condition: 'dead-diseased',
      proximity: 'near-structure',
      stumpRemoval: 'grinding',
      cleanup: 'chip-and-haul',
      region: 'northeast',
    });
    // Base low: 1200 × 1.20 × 1.15 × 1.25 = 2070
    // Base high: 2500 × 1.20 × 1.15 × 1.25 = 4312.50
    // Material low: 2070×0.30=621, Material high: 4312.50×0.30=1293.75
    // Labor low: 2070×0.70×1.20=1738.80, Labor high: 4312.50×0.70×1.20=3622.50
    // treeCostLow: 621+1738.80=2359.80, treeCostHigh: 1293.75+3622.50=4916.25
    // stump: $150–$400, cleanup: $75–$200
    // totalLow: 2359.80+150+75=2584.80
    // totalHigh: 4916.25+400+200=5516.25
    expect(result.totalLow).toBeCloseTo(2584.8, 0);
    expect(result.totalHigh).toBeCloseTo(5516.25, 0);
  });

  // ─── Test 32: sizeComparison values match expected national baseline mid-points ───
  it('sizeComparison values match expected national baseline mid-points', () => {
    const result = calculateTreeRemovalCost({});
    const sizeComparison = result.sizeComparison as Array<{ label: string; value: number }>;
    // For each height at national baseline (thin, healthy, open-yard):
    // Small: (200+500)/2 = 350
    // Medium: (500+1200)/2 = 850
    // Large: (1200+2500)/2 = 1850
    // XLarge: (2500+5000)/2 = 3750
    expect(sizeComparison[0].value).toBeCloseTo(350, 0);
    expect(sizeComparison[1].value).toBeCloseTo(850, 0);
    expect(sizeComparison[2].value).toBeCloseTo(1850, 0);
    expect(sizeComparison[3].value).toBeCloseTo(3750, 0);
  });

  // ─── Test 33: Output structure has all expected fields ───
  it('returns all expected output fields', () => {
    const result = calculateTreeRemovalCost({});
    expect(result).toHaveProperty('treeCost');
    expect(result).toHaveProperty('stumpCost');
    expect(result).toHaveProperty('cleanupCost');
    expect(result).toHaveProperty('totalLow');
    expect(result).toHaveProperty('totalHigh');
    expect(result).toHaveProperty('totalMid');
    expect(result).toHaveProperty('costPerTree');
    expect(result).toHaveProperty('sizeComparison');
    expect(result).toHaveProperty('timeline');
    expect(result).toHaveProperty('permitNote');
  });

  // ─── Test 34: Stacked trunk + condition multipliers without region ───
  it('stacks trunk and condition multipliers correctly', () => {
    const result = calculateTreeRemovalCost({
      treeHeight: 'medium-25-50ft', trunkDiameter: 'thick-over-24in',
      condition: 'storm-damaged', proximity: 'open-yard',
      stumpRemoval: 'none', cleanup: 'leave-debris', region: 'national',
    });
    // Base: $500 × 1.50 × 1.30 = $975 low, $1200 × 1.50 × 1.30 = $2340 high
    expect(result.totalLow).toBeCloseTo(975, 0);
    expect(result.totalHigh).toBeCloseTo(2340, 0);
  });
});
