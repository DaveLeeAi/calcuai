import { calculateSidingReplacementCost } from '@/lib/formulas/construction/siding-replacement-cost';

describe('calculateSidingReplacementCost', () => {
  // ─── Test 1: Vinyl 1500 sqft, 1-story, no removal, no wrap, national ───
  it('calculates vinyl siding on 1500 sqft 1-story home, national', () => {
    const result = calculateSidingReplacementCost({
      wallArea: 1500, sidingType: 'vinyl', stories: '1-story',
      oldSidingRemoval: 'none', housewrap: 'none', region: 'national',
    });
    // Material low: 1500 × 1.20 = 1800, high: 1500 × 2.80 = 4200
    // Labor low: 1500 × 1.80 × 1.0 × 1.0 = 2700, high: 1500 × 4.20 × 1.0 × 1.0 = 6300
    // Trim: 1500 × 0.75 = 1125
    // totalLow: 1800 + 2700 + 0 + 0 + 1125 = 5625
    // totalHigh: 4200 + 6300 + 0 + 0 + 1125 = 11625
    expect(result.wallArea).toBe(1500);
    expect(result.totalLow).toBe(5625);
    expect(result.totalHigh).toBe(11625);
    expect(result.totalMid).toBe(8625);
  });

  // ─── Test 2: Fiber cement siding ───
  it('calculates fiber cement siding cost', () => {
    const result = calculateSidingReplacementCost({
      wallArea: 1500, sidingType: 'fiber-cement', stories: '1-story',
      oldSidingRemoval: 'none', housewrap: 'none', region: 'national',
    });
    // Material low: 1500 × 2.40 = 3600, high: 1500 × 5.20 = 7800
    // Labor low: 1500 × 3.60 = 5400, high: 1500 × 7.80 = 11700
    // Trim: 1125
    // totalLow: 3600 + 5400 + 1125 = 10125
    // totalHigh: 7800 + 11700 + 1125 = 20625
    expect(result.totalLow).toBe(10125);
    expect(result.totalHigh).toBe(20625);
  });

  // ─── Test 3: Wood siding ───
  it('calculates wood siding cost', () => {
    const result = calculateSidingReplacementCost({
      wallArea: 1500, sidingType: 'wood', stories: '1-story',
      oldSidingRemoval: 'none', housewrap: 'none', region: 'national',
    });
    // Material low: 1500 × 2.40 = 3600, high: 1500 × 4.80 = 7200
    // Labor low: 1500 × 3.60 = 5400, high: 1500 × 7.20 = 10800
    // Trim: 1125
    // totalLow: 3600 + 5400 + 1125 = 10125
    // totalHigh: 7200 + 10800 + 1125 = 19125
    expect(result.totalLow).toBe(10125);
    expect(result.totalHigh).toBe(19125);
  });

  // ─── Test 4: Engineered wood siding ───
  it('calculates engineered wood siding cost', () => {
    const result = calculateSidingReplacementCost({
      wallArea: 1500, sidingType: 'engineered-wood', stories: '1-story',
      oldSidingRemoval: 'none', housewrap: 'none', region: 'national',
    });
    // Material low: 1500 × 2 = 3000, high: 1500 × 4 = 6000
    // Labor low: 1500 × 3 = 4500, high: 1500 × 6 = 9000
    // Trim: 1125
    // totalLow: 3000 + 4500 + 1125 = 8625
    // totalHigh: 6000 + 9000 + 1125 = 16125
    expect(result.totalLow).toBe(8625);
    expect(result.totalHigh).toBe(16125);
  });

  // ─── Test 5: Aluminum siding ───
  it('calculates aluminum siding cost', () => {
    const result = calculateSidingReplacementCost({
      wallArea: 1500, sidingType: 'aluminum', stories: '1-story',
      oldSidingRemoval: 'none', housewrap: 'none', region: 'national',
    });
    // Material low: 1500 × 1.20 = 1800, high: 1500 × 2.40 = 3600
    // Labor low: 1500 × 1.80 = 2700, high: 1500 × 3.60 = 5400
    // Trim: 1125
    // totalLow: 1800 + 2700 + 1125 = 5625
    // totalHigh: 3600 + 5400 + 1125 = 10125
    expect(result.totalLow).toBe(5625);
    expect(result.totalHigh).toBe(10125);
  });

  // ─── Test 6: Stone veneer siding ───
  it('calculates stone veneer siding cost', () => {
    const result = calculateSidingReplacementCost({
      wallArea: 1500, sidingType: 'stone-veneer', stories: '1-story',
      oldSidingRemoval: 'none', housewrap: 'none', region: 'national',
    });
    // Material low: 1500 × 4.80 = 7200, high: 1500 × 12 = 18000
    // Labor low: 1500 × 7.20 = 10800, high: 1500 × 18 = 27000
    // Trim: 1125
    // totalLow: 7200 + 10800 + 1125 = 19125
    // totalHigh: 18000 + 27000 + 1125 = 46125
    expect(result.totalLow).toBe(19125);
    expect(result.totalHigh).toBe(46125);
  });

  // ─── Test 7: 2-story multiplier ───
  it('applies 2-story labor multiplier (1.20x)', () => {
    const oneStory = calculateSidingReplacementCost({
      wallArea: 1500, sidingType: 'vinyl', stories: '1-story',
      oldSidingRemoval: 'none', housewrap: 'none', region: 'national',
    });
    const twoStory = calculateSidingReplacementCost({
      wallArea: 1500, sidingType: 'vinyl', stories: '2-story',
      oldSidingRemoval: 'none', housewrap: 'none', region: 'national',
    });
    // 1-story labor low: 2700, 2-story labor low: 2700 × 1.20 = 3240
    // diff = 3240 - 2700 = 540
    // totalLow 2-story: 1800 + 3240 + 1125 = 6165
    expect(twoStory.totalLow).toBe(6165);
    // Material same
    expect(twoStory.trimCost).toBe(oneStory.trimCost);
  });

  // ─── Test 8: 3-story multiplier ───
  it('applies 3-story labor multiplier (1.40x)', () => {
    const result = calculateSidingReplacementCost({
      wallArea: 1500, sidingType: 'vinyl', stories: '3-story',
      oldSidingRemoval: 'none', housewrap: 'none', region: 'national',
    });
    // Labor low: 1500 × 1.80 × 1.40 = 3780
    // totalLow: 1800 + 3780 + 1125 = 6705
    expect(result.totalLow).toBe(6705);
  });

  // ─── Test 9: Standard removal ───
  it('adds standard siding removal cost', () => {
    const result = calculateSidingReplacementCost({
      wallArea: 1500, sidingType: 'vinyl', stories: '1-story',
      oldSidingRemoval: 'standard-removal', housewrap: 'none', region: 'national',
    });
    // Removal low: 1500 × 1.50 = 2250, high: 1500 × 3 = 4500
    // totalLow: 5625 + 2250 = 7875
    // totalHigh: 11625 + 4500 = 16125
    expect(result.totalLow).toBe(7875);
    expect(result.totalHigh).toBe(16125);
  });

  // ─── Test 10: Asbestos abatement ───
  it('adds asbestos abatement removal cost', () => {
    const result = calculateSidingReplacementCost({
      wallArea: 1500, sidingType: 'vinyl', stories: '1-story',
      oldSidingRemoval: 'asbestos-abatement', housewrap: 'none', region: 'national',
    });
    // Removal low: 1500 × 5 = 7500, high: 1500 × 15 = 22500
    // totalLow: 5625 + 7500 = 13125
    // totalHigh: 11625 + 22500 = 34125
    expect(result.totalLow).toBe(13125);
    expect(result.totalHigh).toBe(34125);
  });

  // ─── Test 11: Housewrap ───
  it('adds housewrap cost', () => {
    const result = calculateSidingReplacementCost({
      wallArea: 1500, sidingType: 'vinyl', stories: '1-story',
      oldSidingRemoval: 'none', housewrap: 'standard', region: 'national',
    });
    // Housewrap low: 1500 × 0.50 = 750, high: 1500 × 1.50 = 2250
    // totalLow: 5625 + 750 = 6375
    // totalHigh: 11625 + 2250 = 13875
    expect(result.totalLow).toBe(6375);
    expect(result.totalHigh).toBe(13875);
  });

  // ─── Test 12: Northeast regional multiplier ───
  it('applies northeast regional multiplier to labor only', () => {
    const national = calculateSidingReplacementCost({
      wallArea: 1500, sidingType: 'vinyl', stories: '1-story',
      oldSidingRemoval: 'none', housewrap: 'none', region: 'national',
    });
    const northeast = calculateSidingReplacementCost({
      wallArea: 1500, sidingType: 'vinyl', stories: '1-story',
      oldSidingRemoval: 'none', housewrap: 'none', region: 'northeast',
    });
    // Labor low northeast: 1500 × 1.80 × 1.0 × 1.20 = 3240
    // totalLow: 1800 + 3240 + 1125 = 6165
    expect(northeast.totalLow).toBe(6165);
    // Trim same
    expect(northeast.trimCost).toBe(national.trimCost);
  });

  // ─── Test 13: South regional multiplier ───
  it('applies south regional multiplier (0.85)', () => {
    const result = calculateSidingReplacementCost({
      wallArea: 1500, sidingType: 'vinyl', stories: '1-story',
      oldSidingRemoval: 'none', housewrap: 'none', region: 'south',
    });
    // Labor low: 1500 × 1.80 × 1.0 × 0.85 = 2295
    // totalLow: 1800 + 2295 + 1125 = 5220
    expect(result.totalLow).toBe(5220);
  });

  // ─── Test 14: West Coast regional multiplier ───
  it('applies west-coast regional multiplier (1.25)', () => {
    const result = calculateSidingReplacementCost({
      wallArea: 1500, sidingType: 'vinyl', stories: '1-story',
      oldSidingRemoval: 'none', housewrap: 'none', region: 'west-coast',
    });
    // Labor low: 1500 × 1.80 × 1.0 × 1.25 = 3375
    // totalLow: 1800 + 3375 + 1125 = 6300
    expect(result.totalLow).toBe(6300);
  });

  // ─── Test 15: Combined story × region multipliers ───
  it('applies both 2-story and northeast multipliers to labor', () => {
    const result = calculateSidingReplacementCost({
      wallArea: 1500, sidingType: 'vinyl', stories: '2-story',
      oldSidingRemoval: 'none', housewrap: 'none', region: 'northeast',
    });
    // Labor low: 1500 × 1.80 × 1.20 × 1.20 = 3888
    expect(result.totalLow).toBeCloseTo(1800 + 3888 + 1125, 0);
  });

  // ─── Test 16: Zero wall area ───
  it('returns zero for zero wall area', () => {
    const result = calculateSidingReplacementCost({
      wallArea: 0, sidingType: 'vinyl', stories: '1-story',
      oldSidingRemoval: 'none', housewrap: 'none', region: 'national',
    });
    expect(result.wallArea).toBe(0);
    expect(result.totalLow).toBe(0);
    expect(result.totalHigh).toBe(0);
    expect(result.totalMid).toBe(0);
    expect(result.costPerSqFt).toBe(0);
  });

  // ─── Test 17: Output structure ───
  it('returns all expected output fields', () => {
    const result = calculateSidingReplacementCost({
      wallArea: 1500, sidingType: 'vinyl', stories: '1-story',
      oldSidingRemoval: 'none', housewrap: 'none', region: 'national',
    });
    expect(result).toHaveProperty('wallArea');
    expect(result).toHaveProperty('materialCost');
    expect(result).toHaveProperty('laborCost');
    expect(result).toHaveProperty('removalCost');
    expect(result).toHaveProperty('housewrapCost');
    expect(result).toHaveProperty('trimCost');
    expect(result).toHaveProperty('totalLow');
    expect(result).toHaveProperty('totalHigh');
    expect(result).toHaveProperty('totalMid');
    expect(result).toHaveProperty('costPerSqFt');
    expect(result).toHaveProperty('sidingComparison');
    expect(result).toHaveProperty('timeline');
  });

  // ─── Test 18: Siding comparison has all 6 materials ───
  it('returns siding comparison with all 6 siding materials', () => {
    const result = calculateSidingReplacementCost({
      wallArea: 1500, sidingType: 'vinyl', stories: '1-story',
      oldSidingRemoval: 'none', housewrap: 'none', region: 'national',
    });
    const comparison = result.sidingComparison as Array<{ label: string; value: number }>;
    expect(comparison).toHaveLength(6);
    comparison.forEach(item => {
      expect(item.value).toBeGreaterThan(0);
      expect(item.label).toBeTruthy();
    });
    // Vinyl/aluminum cheapest, stone veneer most expensive
    const vinyl = comparison.find(c => c.label.includes('Vinyl'));
    const stone = comparison.find(c => c.label.includes('Stone Veneer'));
    expect(vinyl!.value).toBeLessThan(stone!.value);
  });

  // ─── Test 19: Cost ordering ───
  it('cost ordering: aluminum/vinyl < engineered < wood/fiber < stone', () => {
    const materials = ['vinyl', 'aluminum', 'engineered-wood', 'wood', 'fiber-cement', 'stone-veneer'];
    const costs = materials.map(mat => {
      const r = calculateSidingReplacementCost({
        wallArea: 1500, sidingType: mat, stories: '1-story',
        oldSidingRemoval: 'none', housewrap: 'none', region: 'national',
      });
      return { material: mat, mid: r.totalMid as number };
    });
    const vinyl = costs.find(c => c.material === 'vinyl')!;
    const eng = costs.find(c => c.material === 'engineered-wood')!;
    const stone = costs.find(c => c.material === 'stone-veneer')!;
    expect(vinyl.mid).toBeLessThan(eng.mid);
    expect(eng.mid).toBeLessThan(stone.mid);
  });

  // ─── Test 20: Timeline text returned ───
  it('returns appropriate timeline for each material', () => {
    const vinyl = calculateSidingReplacementCost({
      wallArea: 1500, sidingType: 'vinyl', stories: '1-story',
      oldSidingRemoval: 'none', housewrap: 'none', region: 'national',
    });
    const stone = calculateSidingReplacementCost({
      wallArea: 1500, sidingType: 'stone-veneer', stories: '1-story',
      oldSidingRemoval: 'none', housewrap: 'none', region: 'national',
    });
    expect(typeof vinyl.timeline).toBe('string');
    expect(typeof stone.timeline).toBe('string');
    expect(vinyl.timeline).not.toBe(stone.timeline);
  });

  // ─── Test 21: Trim cost calculation ───
  it('calculates trim cost at $0.75/sqft', () => {
    const result = calculateSidingReplacementCost({
      wallArea: 2000, sidingType: 'vinyl', stories: '1-story',
      oldSidingRemoval: 'none', housewrap: 'none', region: 'national',
    });
    expect(result.trimCost).toBe(1500); // 2000 × 0.75
  });

  // ─── Test 22: Cost per sq ft accuracy ───
  it('calculates cost per sq ft as totalMid / wallArea', () => {
    const result = calculateSidingReplacementCost({
      wallArea: 1500, sidingType: 'vinyl', stories: '1-story',
      oldSidingRemoval: 'none', housewrap: 'none', region: 'national',
    });
    // totalMid = 8625, wallArea = 1500
    // costPerSqFt = 8625 / 1500 = 5.75
    expect(result.costPerSqFt).toBe(5.75);
  });

  // ─── Test 23: Full scenario — fiber cement, 2-story, standard removal, housewrap, northeast ───
  it('calculates full scenario: fiber cement + 2-story + removal + wrap + northeast', () => {
    const result = calculateSidingReplacementCost({
      wallArea: 1500, sidingType: 'fiber-cement', stories: '2-story',
      oldSidingRemoval: 'standard-removal', housewrap: 'standard', region: 'northeast',
    });
    // Material low: 1500 × 2.40 = 3600, high: 1500 × 5.20 = 7800
    // Labor low: 1500 × 3.60 × 1.20 × 1.20 = 7776, high: 1500 × 7.80 × 1.20 × 1.20 = 16848
    // Removal low: 1500 × 1.50 = 2250, high: 1500 × 3 = 4500
    // Housewrap low: 1500 × 0.50 = 750, high: 1500 × 1.50 = 2250
    // Trim: 1125
    // totalLow: 3600 + 7776 + 2250 + 750 + 1125 = 15501
    // totalHigh: 7800 + 16848 + 4500 + 2250 + 1125 = 32523
    expect(result.totalLow).toBe(15501);
    expect(result.totalHigh).toBe(32523);
  });

  // ─── Test 24: Mountain-west regional multiplier ───
  it('applies mountain-west regional multiplier (0.95)', () => {
    const result = calculateSidingReplacementCost({
      wallArea: 1500, sidingType: 'vinyl', stories: '1-story',
      oldSidingRemoval: 'none', housewrap: 'none', region: 'mountain-west',
    });
    // Labor low: 1500 × 1.80 × 1.0 × 0.95 = 2565
    // totalLow: 1800 + 2565 + 1125 = 5490
    expect(result.totalLow).toBe(5490);
  });

  // ─── Test 25: Large home 2500 sqft ───
  it('handles large 2500 sqft home', () => {
    const result = calculateSidingReplacementCost({
      wallArea: 2500, sidingType: 'vinyl', stories: '1-story',
      oldSidingRemoval: 'none', housewrap: 'none', region: 'national',
    });
    // Material low: 2500 × 1.20 = 3000, high: 2500 × 2.80 = 7000
    // Labor low: 2500 × 1.80 = 4500, high: 2500 × 4.20 = 10500
    // Trim: 2500 × 0.75 = 1875
    // totalLow: 3000 + 4500 + 1875 = 9375
    // totalHigh: 7000 + 10500 + 1875 = 19375
    expect(result.totalLow).toBe(9375);
    expect(result.totalHigh).toBe(19375);
  });
});
