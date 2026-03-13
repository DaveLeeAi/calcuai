import { calculateRegroutingCost } from '@/lib/formulas/construction/regrouting-cost';

describe('calculateRegroutingCost', () => {
  // ─── Test 1: Standard sanded, manual removal, no sealing, national ───
  it('calculates 60 sqft standard sanded with manual removal', () => {
    const result = calculateRegroutingCost({
      area: 60,
      groutType: 'standard-sanded',
      groutRemoval: 'manual',
      groutSealing: 'none',
      region: 'national',
    });
    // Material: 60 × $1.50 = $90 low, 60 × $3.00 = $180 high
    // Labor: 60 × $3.50 × 1.0 = $210 low, 60 × $7.00 × 1.0 = $420 high
    // Removal: 60 × $3.00 = $180
    // Sealing: $0
    // totalLow: 90 + 210 + 180 + 0 = 480
    // totalHigh: 180 + 420 + 180 + 0 = 780
    expect(result.area).toBe(60);
    expect(result.totalLow).toBe(480);
    expect(result.totalHigh).toBe(780);
    expect(result.totalMid).toBe(630);
  });

  // ─── Test 2: Epoxy grout ───
  it('calculates epoxy grout cost', () => {
    const result = calculateRegroutingCost({
      area: 60,
      groutType: 'epoxy',
      groutRemoval: 'manual',
      groutSealing: 'none',
      region: 'national',
    });
    // Material: 60 × $2.40 = $144 low, 60 × $4.50 = $270 high
    // Labor: 60 × $5.60 = $336 low, 60 × $10.50 = $630 high
    // Removal: 60 × $3.00 = $180
    // totalLow: 144 + 336 + 180 = 660
    // totalHigh: 270 + 630 + 180 = 1080
    expect(result.totalLow).toBe(660);
    expect(result.totalHigh).toBe(1080);
    expect(result.totalMid).toBe(870);
  });

  // ─── Test 3: Urethane grout ───
  it('calculates urethane grout cost', () => {
    const result = calculateRegroutingCost({
      area: 60,
      groutType: 'urethane',
      groutRemoval: 'manual',
      groutSealing: 'none',
      region: 'national',
    });
    // Material: 60 × $3.00 = $180 low, 60 × $5.40 = $324 high
    // Labor: 60 × $7.00 = $420 low, 60 × $12.60 = $756 high
    // Removal: 60 × $3.00 = $180
    // totalLow: 180 + 420 + 180 = 780
    // totalHigh: 324 + 756 + 180 = 1260
    expect(result.totalLow).toBe(780);
    expect(result.totalHigh).toBe(1260);
    expect(result.totalMid).toBe(1020);
  });

  // ─── Test 4: Power-tool removal ───
  it('calculates power-tool removal cost', () => {
    const result = calculateRegroutingCost({
      area: 60,
      groutType: 'standard-sanded',
      groutRemoval: 'power-tool',
      groutSealing: 'none',
      region: 'national',
    });
    // Removal: 60 × $1.50 = $90 (vs $180 for manual)
    // totalLow: 90 + 210 + 90 + 0 = 390
    // totalHigh: 180 + 420 + 90 + 0 = 690
    expect(result.removalCost).toBe(90);
    expect(result.totalLow).toBe(390);
    expect(result.totalHigh).toBe(690);
  });

  // ─── Test 5: No removal (overlay) ───
  it('calculates with no removal', () => {
    const result = calculateRegroutingCost({
      area: 60,
      groutType: 'standard-sanded',
      groutRemoval: 'none',
      groutSealing: 'none',
      region: 'national',
    });
    // Removal: $0
    // totalLow: 90 + 210 + 0 + 0 = 300
    // totalHigh: 180 + 420 + 0 + 0 = 600
    expect(result.removalCost).toBe(0);
    expect(result.totalLow).toBe(300);
    expect(result.totalHigh).toBe(600);
  });

  // ─── Test 6: Standard sealer ───
  it('adds standard sealing cost', () => {
    const result = calculateRegroutingCost({
      area: 60,
      groutType: 'standard-sanded',
      groutRemoval: 'manual',
      groutSealing: 'standard-sealer',
      region: 'national',
    });
    // Sealing: 60 × $1.50 = $90
    // totalLow: 90 + 210 + 180 + 90 = 570
    // totalHigh: 180 + 420 + 180 + 90 = 870
    expect(result.sealingCost).toBe(90);
    expect(result.totalLow).toBe(570);
    expect(result.totalHigh).toBe(870);
  });

  // ─── Test 7: Premium sealer ───
  it('adds premium sealing cost', () => {
    const result = calculateRegroutingCost({
      area: 60,
      groutType: 'standard-sanded',
      groutRemoval: 'manual',
      groutSealing: 'premium-sealer',
      region: 'national',
    });
    // Sealing: 60 × $2.50 = $150
    // totalLow: 90 + 210 + 180 + 150 = 630
    // totalHigh: 180 + 420 + 180 + 150 = 930
    expect(result.sealingCost).toBe(150);
    expect(result.totalLow).toBe(630);
    expect(result.totalHigh).toBe(930);
  });

  // ─── Test 8: Northeast region (1.20x labor) ───
  it('applies northeast regional multiplier to labor only', () => {
    const result = calculateRegroutingCost({
      area: 60,
      groutType: 'standard-sanded',
      groutRemoval: 'manual',
      groutSealing: 'none',
      region: 'northeast',
    });
    // Material: $90 low, $180 high (unchanged)
    // Labor: 60 × $3.50 × 1.20 = $252 low, 60 × $7.00 × 1.20 = $504 high
    // Removal: $180
    // totalLow: 90 + 252 + 180 = 522
    // totalHigh: 180 + 504 + 180 = 864
    const laborCost = result.laborCost as { low: number; high: number };
    expect(laborCost.low).toBe(252);
    expect(laborCost.high).toBe(504);
    expect(result.totalLow).toBe(522);
    expect(result.totalHigh).toBe(864);
  });

  // ─── Test 9: West Coast region (1.25x labor) ───
  it('applies west coast regional multiplier to labor only', () => {
    const result = calculateRegroutingCost({
      area: 60,
      groutType: 'standard-sanded',
      groutRemoval: 'manual',
      groutSealing: 'none',
      region: 'west-coast',
    });
    // Labor: 60 × $3.50 × 1.25 = $262.50 low, 60 × $7.00 × 1.25 = $525 high
    const laborCost = result.laborCost as { low: number; high: number };
    expect(laborCost.low).toBe(262.5);
    expect(laborCost.high).toBe(525);
  });

  // ─── Test 10: South region (0.85x labor) ───
  it('applies south regional multiplier to labor only', () => {
    const result = calculateRegroutingCost({
      area: 60,
      groutType: 'standard-sanded',
      groutRemoval: 'manual',
      groutSealing: 'none',
      region: 'south',
    });
    // Labor: 60 × $3.50 × 0.85 = $178.50 low, 60 × $7.00 × 0.85 = $357 high
    const laborCost = result.laborCost as { low: number; high: number };
    expect(laborCost.low).toBe(178.5);
    expect(laborCost.high).toBe(357);
  });

  // ─── Test 11: Midwest region (0.90x labor) ───
  it('applies midwest regional multiplier to labor only', () => {
    const result = calculateRegroutingCost({
      area: 60,
      groutType: 'standard-sanded',
      groutRemoval: 'none',
      groutSealing: 'none',
      region: 'midwest',
    });
    // Labor: 60 × $3.50 × 0.90 = $189 low, 60 × $7.00 × 0.90 = $378 high
    const laborCost = result.laborCost as { low: number; high: number };
    expect(laborCost.low).toBe(189);
    expect(laborCost.high).toBe(378);
  });

  // ─── Test 12: Mountain West region (0.95x labor) ───
  it('applies mountain-west regional multiplier to labor only', () => {
    const result = calculateRegroutingCost({
      area: 100,
      groutType: 'standard-sanded',
      groutRemoval: 'none',
      groutSealing: 'none',
      region: 'mountain-west',
    });
    // Labor: 100 × $3.50 × 0.95 = $332.50 low, 100 × $7.00 × 0.95 = $665 high
    const laborCost = result.laborCost as { low: number; high: number };
    expect(laborCost.low).toBe(332.5);
    expect(laborCost.high).toBe(665);
  });

  // ─── Test 13: Mid-Atlantic region (1.15x labor) ───
  it('applies mid-atlantic regional multiplier to labor only', () => {
    const result = calculateRegroutingCost({
      area: 100,
      groutType: 'standard-sanded',
      groutRemoval: 'none',
      groutSealing: 'none',
      region: 'mid-atlantic',
    });
    // Labor: 100 × $3.50 × 1.15 = $402.50 low, 100 × $7.00 × 1.15 = $805 high
    const laborCost = result.laborCost as { low: number; high: number };
    expect(laborCost.low).toBe(402.5);
    expect(laborCost.high).toBe(805);
  });

  // ─── Test 14: Zero area ───
  it('returns zero for zero area', () => {
    const result = calculateRegroutingCost({
      area: 0,
      groutType: 'standard-sanded',
      groutRemoval: 'manual',
      groutSealing: 'none',
      region: 'national',
    });
    expect(result.area).toBe(0);
    expect(result.totalLow).toBe(0);
    expect(result.totalHigh).toBe(0);
    expect(result.totalMid).toBe(0);
    expect(result.costPerSqFt).toBe(0);
  });

  // ─── Test 15: Large area (500 sqft) ───
  it('handles large area (500 sqft)', () => {
    const result = calculateRegroutingCost({
      area: 500,
      groutType: 'standard-sanded',
      groutRemoval: 'manual',
      groutSealing: 'none',
      region: 'national',
    });
    // Material: 500 × $1.50 = $750 low, 500 × $3.00 = $1500 high
    // Labor: 500 × $3.50 = $1750 low, 500 × $7.00 = $3500 high
    // Removal: 500 × $3.00 = $1500
    // totalLow: 750 + 1750 + 1500 = 4000
    // totalHigh: 1500 + 3500 + 1500 = 6500
    expect(result.area).toBe(500);
    expect(result.totalLow).toBe(4000);
    expect(result.totalHigh).toBe(6500);
  });

  // ─── Test 16: Cost per sqft accuracy ───
  it('calculates cost per sqft correctly', () => {
    const result = calculateRegroutingCost({
      area: 60,
      groutType: 'standard-sanded',
      groutRemoval: 'manual',
      groutSealing: 'none',
      region: 'national',
    });
    // totalMid = 630, area = 60, costPerSqFt = 630 / 60 = 10.50
    expect(result.costPerSqFt).toBe(10.5);
  });

  // ─── Test 17: Material cost unchanged by region ───
  it('material cost is not affected by region', () => {
    const national = calculateRegroutingCost({
      area: 60,
      groutType: 'epoxy',
      groutRemoval: 'none',
      groutSealing: 'none',
      region: 'national',
    });
    const northeast = calculateRegroutingCost({
      area: 60,
      groutType: 'epoxy',
      groutRemoval: 'none',
      groutSealing: 'none',
      region: 'northeast',
    });
    const natMat = national.materialCost as { low: number; high: number };
    const neMat = northeast.materialCost as { low: number; high: number };
    expect(natMat.low).toBe(neMat.low);
    expect(natMat.high).toBe(neMat.high);
  });

  // ─── Test 18: Grout comparison structure ───
  it('returns grout comparison with all 3 types', () => {
    const result = calculateRegroutingCost({
      area: 60,
      groutType: 'standard-sanded',
      groutRemoval: 'manual',
      groutSealing: 'none',
      region: 'national',
    });
    const comparison = result.groutComparison as Array<{ label: string; value: number }>;
    expect(comparison).toHaveLength(3);
    comparison.forEach(item => {
      expect(item.value).toBeGreaterThan(0);
      expect(item.label).toBeTruthy();
    });
  });

  // ─── Test 19: Standard cheapest, urethane most expensive ───
  it('standard sanded is cheapest and urethane most expensive', () => {
    const groutTypes = ['standard-sanded', 'epoxy', 'urethane'];
    const costs = groutTypes.map(gt => {
      const r = calculateRegroutingCost({
        area: 60,
        groutType: gt,
        groutRemoval: 'manual',
        groutSealing: 'none',
        region: 'national',
      });
      return { groutType: gt, mid: r.totalMid as number };
    });
    const standard = costs.find(c => c.groutType === 'standard-sanded')!;
    const epoxy = costs.find(c => c.groutType === 'epoxy')!;
    const urethane = costs.find(c => c.groutType === 'urethane')!;
    expect(standard.mid).toBeLessThan(epoxy.mid);
    expect(epoxy.mid).toBeLessThan(urethane.mid);
  });

  // ─── Test 20: Output structure ───
  it('returns all expected output fields', () => {
    const result = calculateRegroutingCost({
      area: 60,
      groutType: 'standard-sanded',
      groutRemoval: 'manual',
      groutSealing: 'none',
      region: 'national',
    });
    expect(result).toHaveProperty('area');
    expect(result).toHaveProperty('materialCost');
    expect(result).toHaveProperty('laborCost');
    expect(result).toHaveProperty('removalCost');
    expect(result).toHaveProperty('sealingCost');
    expect(result).toHaveProperty('totalLow');
    expect(result).toHaveProperty('totalHigh');
    expect(result).toHaveProperty('totalMid');
    expect(result).toHaveProperty('costPerSqFt');
    expect(result).toHaveProperty('groutComparison');
    expect(result).toHaveProperty('timeline');
  });

  // ─── Test 21: Timeline text returned ───
  it('returns appropriate timeline for each grout type', () => {
    const standard = calculateRegroutingCost({
      area: 60, groutType: 'standard-sanded', groutRemoval: 'manual', groutSealing: 'none', region: 'national',
    });
    const epoxy = calculateRegroutingCost({
      area: 60, groutType: 'epoxy', groutRemoval: 'manual', groutSealing: 'none', region: 'national',
    });
    expect(typeof standard.timeline).toBe('string');
    expect(typeof epoxy.timeline).toBe('string');
    expect(standard.timeline).not.toBe(epoxy.timeline);
  });

  // ─── Test 22: All options combined ───
  it('handles all options combined (epoxy + power-tool + premium sealer + northeast)', () => {
    const result = calculateRegroutingCost({
      area: 100,
      groutType: 'epoxy',
      groutRemoval: 'power-tool',
      groutSealing: 'premium-sealer',
      region: 'northeast',
    });
    // Material: 100 × $2.40 = $240 low, 100 × $4.50 = $450 high
    // Labor: 100 × $5.60 × 1.20 = $672 low, 100 × $10.50 × 1.20 = $1260 high
    // Removal: 100 × $1.50 = $150
    // Sealing: 100 × $2.50 = $250
    // totalLow: 240 + 672 + 150 + 250 = 1312
    // totalHigh: 450 + 1260 + 150 + 250 = 2110
    expect(result.totalLow).toBe(1312);
    expect(result.totalHigh).toBe(2110);
    expect(result.totalMid).toBe(1711);
  });

  // ─── Test 23: Negative area treated as zero ───
  it('treats negative area as zero', () => {
    const result = calculateRegroutingCost({
      area: -10,
      groutType: 'standard-sanded',
      groutRemoval: 'manual',
      groutSealing: 'none',
      region: 'national',
    });
    expect(result.area).toBe(0);
    expect(result.totalLow).toBe(0);
    expect(result.totalHigh).toBe(0);
  });

  // ─── Test 24: Default inputs ───
  it('handles default/missing inputs gracefully', () => {
    const result = calculateRegroutingCost({});
    expect(result.area).toBe(0);
    expect(result.totalLow).toBe(0);
    expect(result.totalHigh).toBe(0);
    expect(result).toHaveProperty('groutComparison');
    expect(result).toHaveProperty('timeline');
  });
});
