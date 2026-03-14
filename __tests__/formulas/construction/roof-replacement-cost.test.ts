import { calculateRoofReplacementCost } from '@/lib/formulas/construction/roof-replacement-cost';

describe('calculateRoofReplacementCost', () => {
  // ─── Test 1: Standard asphalt 3-tab, 2000 sqft, 1-story, simple, no tear-off, national ───
  it('calculates a standard 2000 sqft asphalt 3-tab roof', () => {
    const result = calculateRoofReplacementCost({
      roofArea: 2000,
      roofAreaUnit: 'sqft',
      roofingMaterial: 'asphalt-3tab',
      stories: '1-story',
      roofComplexity: 'simple-gable',
      tearOff: 'none',
      region: 'national',
    });
    // Area = 2000 sq ft
    // Material: 2000 × $3 = $6,000 low, 2000 × $5 = $10,000 high
    // Labor: 2000 × $2 × 1.0 × 1.0 × 1.0 = $4,000 low, 2000 × $4 × 1.0 × 1.0 × 1.0 = $8,000 high
    // Tear-off: $0
    // TotalLow: 6000 + 4000 + 0 = $10,000
    // TotalHigh: 10000 + 8000 + 0 = $18,000
    // TotalMid: (10000 + 18000) / 2 = $14,000
    expect(result.area).toBe(2000);
    expect(result.totalLow).toBe(10000);
    expect(result.totalHigh).toBe(18000);
    expect(result.totalMid).toBe(14000);
    expect(result.tearOffCost).toBe(0);
  });

  // ─── Test 2: Architectural shingle ───
  it('calculates architectural shingle roof cost', () => {
    const result = calculateRoofReplacementCost({
      roofArea: 2000,
      roofAreaUnit: 'sqft',
      roofingMaterial: 'architectural-shingle',
      stories: '1-story',
      roofComplexity: 'simple-gable',
      tearOff: 'none',
      region: 'national',
    });
    // Material: 2000 × $4 = $8,000 low, 2000 × $7 = $14,000 high
    // Labor: 2000 × $2.50 = $5,000 low, 2000 × $4.50 = $9,000 high
    // TotalLow: 8000 + 5000 = $13,000
    // TotalHigh: 14000 + 9000 = $23,000
    expect(result.totalLow).toBe(13000);
    expect(result.totalHigh).toBe(23000);
    expect(result.totalMid).toBe(18000);
  });

  // ─── Test 3: Metal standing seam ───
  it('calculates metal standing seam roof cost', () => {
    const result = calculateRoofReplacementCost({
      roofArea: 2000,
      roofAreaUnit: 'sqft',
      roofingMaterial: 'metal-standing-seam',
      stories: '1-story',
      roofComplexity: 'simple-gable',
      tearOff: 'none',
      region: 'national',
    });
    // Material: 2000 × $8 = $16,000 low, 2000 × $14 = $28,000 high
    // Labor: 2000 × $4 = $8,000 low, 2000 × $7 = $14,000 high
    // TotalLow: 16000 + 8000 = $24,000
    // TotalHigh: 28000 + 14000 = $42,000
    expect(result.totalLow).toBe(24000);
    expect(result.totalHigh).toBe(42000);
    expect(result.totalMid).toBe(33000);
  });

  // ─── Test 4: Metal corrugated ───
  it('calculates metal corrugated roof cost', () => {
    const result = calculateRoofReplacementCost({
      roofArea: 2000,
      roofAreaUnit: 'sqft',
      roofingMaterial: 'metal-corrugated',
      stories: '1-story',
      roofComplexity: 'simple-gable',
      tearOff: 'none',
      region: 'national',
    });
    // Material: 2000 × $5 = $10,000 low, 2000 × $9 = $18,000 high
    // Labor: 2000 × $3 = $6,000 low, 2000 × $5 = $10,000 high
    // TotalLow: 10000 + 6000 = $16,000
    // TotalHigh: 18000 + 10000 = $28,000
    expect(result.totalLow).toBe(16000);
    expect(result.totalHigh).toBe(28000);
    expect(result.totalMid).toBe(22000);
  });

  // ─── Test 5: Clay tile ───
  it('calculates clay tile roof cost', () => {
    const result = calculateRoofReplacementCost({
      roofArea: 2000,
      roofAreaUnit: 'sqft',
      roofingMaterial: 'tile-clay',
      stories: '1-story',
      roofComplexity: 'simple-gable',
      tearOff: 'none',
      region: 'national',
    });
    // Material: 2000 × $10 = $20,000 low, 2000 × $18 = $36,000 high
    // Labor: 2000 × $5 = $10,000 low, 2000 × $9 = $18,000 high
    // TotalLow: 20000 + 10000 = $30,000
    // TotalHigh: 36000 + 18000 = $54,000
    expect(result.totalLow).toBe(30000);
    expect(result.totalHigh).toBe(54000);
    expect(result.totalMid).toBe(42000);
  });

  // ─── Test 6: Concrete tile ───
  it('calculates concrete tile roof cost', () => {
    const result = calculateRoofReplacementCost({
      roofArea: 2000,
      roofAreaUnit: 'sqft',
      roofingMaterial: 'tile-concrete',
      stories: '1-story',
      roofComplexity: 'simple-gable',
      tearOff: 'none',
      region: 'national',
    });
    // Material: 2000 × $8 = $16,000 low, 2000 × $14 = $28,000 high
    // Labor: 2000 × $4 = $8,000 low, 2000 × $7 = $14,000 high
    // TotalLow: 16000 + 8000 = $24,000
    // TotalHigh: 28000 + 14000 = $42,000
    expect(result.totalLow).toBe(24000);
    expect(result.totalHigh).toBe(42000);
    expect(result.totalMid).toBe(33000);
  });

  // ─── Test 7: Slate ───
  it('calculates slate roof cost', () => {
    const result = calculateRoofReplacementCost({
      roofArea: 2000,
      roofAreaUnit: 'sqft',
      roofingMaterial: 'slate',
      stories: '1-story',
      roofComplexity: 'simple-gable',
      tearOff: 'none',
      region: 'national',
    });
    // Material: 2000 × $15 = $30,000 low, 2000 × $30 = $60,000 high
    // Labor: 2000 × $7 = $14,000 low, 2000 × $12 = $24,000 high
    // TotalLow: 30000 + 14000 = $44,000
    // TotalHigh: 60000 + 24000 = $84,000
    expect(result.totalLow).toBe(44000);
    expect(result.totalHigh).toBe(84000);
    expect(result.totalMid).toBe(64000);
  });

  // ─── Test 8: Wood shake ───
  it('calculates wood shake roof cost', () => {
    const result = calculateRoofReplacementCost({
      roofArea: 2000,
      roofAreaUnit: 'sqft',
      roofingMaterial: 'wood-shake',
      stories: '1-story',
      roofComplexity: 'simple-gable',
      tearOff: 'none',
      region: 'national',
    });
    // Material: 2000 × $6 = $12,000 low, 2000 × $10 = $20,000 high
    // Labor: 2000 × $3.50 = $7,000 low, 2000 × $6 = $12,000 high
    // TotalLow: 12000 + 7000 = $19,000
    // TotalHigh: 20000 + 12000 = $32,000
    expect(result.totalLow).toBe(19000);
    expect(result.totalHigh).toBe(32000);
    expect(result.totalMid).toBe(25500);
  });

  // ─── Test 9: 2-story multiplier (1.10x) ───
  it('applies 2-story multiplier to labor', () => {
    const oneStory = calculateRoofReplacementCost({
      roofArea: 2000, roofAreaUnit: 'sqft',
      roofingMaterial: 'asphalt-3tab', stories: '1-story',
      roofComplexity: 'simple-gable', tearOff: 'none', region: 'national',
    });
    const twoStory = calculateRoofReplacementCost({
      roofArea: 2000, roofAreaUnit: 'sqft',
      roofingMaterial: 'asphalt-3tab', stories: '2-story',
      roofComplexity: 'simple-gable', tearOff: 'none', region: 'national',
    });
    // Labor increases by 10%, material stays same
    expect((twoStory.laborCost as number)).toBeGreaterThan((oneStory.laborCost as number));
    expect((twoStory.materialCost as number)).toBe((oneStory.materialCost as number));
    // Labor mid 1-story: (4000+8000)/2 = 6000
    // Labor mid 2-story: 2000×2×1.1 = 4400 low, 2000×4×1.1 = 8800 high → mid 6600
    expect((twoStory.laborCost as number)).toBeCloseTo(6600, 1);
  });

  // ─── Test 10: 3-story multiplier (1.20x) ───
  it('applies 3-story multiplier to labor', () => {
    const result = calculateRoofReplacementCost({
      roofArea: 2000, roofAreaUnit: 'sqft',
      roofingMaterial: 'asphalt-3tab', stories: '3-story',
      roofComplexity: 'simple-gable', tearOff: 'none', region: 'national',
    });
    // Labor low: 2000 × 2 × 1.20 = $4,800
    // Labor high: 2000 × 4 × 1.20 = $9,600
    // Labor mid: (4800 + 9600) / 2 = $7,200
    expect((result.laborCost as number)).toBeCloseTo(7200, 1);
  });

  // ─── Test 11: Moderate hip complexity (1.10x) ───
  it('applies moderate hip complexity multiplier', () => {
    const simple = calculateRoofReplacementCost({
      roofArea: 2000, roofAreaUnit: 'sqft',
      roofingMaterial: 'asphalt-3tab', stories: '1-story',
      roofComplexity: 'simple-gable', tearOff: 'none', region: 'national',
    });
    const hip = calculateRoofReplacementCost({
      roofArea: 2000, roofAreaUnit: 'sqft',
      roofingMaterial: 'asphalt-3tab', stories: '1-story',
      roofComplexity: 'moderate-hip', tearOff: 'none', region: 'national',
    });
    expect((hip.laborCost as number)).toBeGreaterThan((simple.laborCost as number));
    expect((hip.materialCost as number)).toBe((simple.materialCost as number));
    // Labor mid hip: (2000×2×1.10 + 2000×4×1.10) / 2 = (4400+8800)/2 = 6600
    expect((hip.laborCost as number)).toBeCloseTo(6600, 1);
  });

  // ─── Test 12: Complex multi-level complexity (1.25x) ───
  it('applies complex multi-level complexity multiplier', () => {
    const result = calculateRoofReplacementCost({
      roofArea: 2000, roofAreaUnit: 'sqft',
      roofingMaterial: 'asphalt-3tab', stories: '1-story',
      roofComplexity: 'complex-multi-level', tearOff: 'none', region: 'national',
    });
    // Labor low: 2000 × 2 × 1.25 = $5,000
    // Labor high: 2000 × 4 × 1.25 = $10,000
    // Labor mid: (5000 + 10000) / 2 = $7,500
    expect((result.laborCost as number)).toBeCloseTo(7500, 1);
  });

  // ─── Test 13: Single-layer tear-off ───
  it('adds single-layer tear-off cost', () => {
    const noTearOff = calculateRoofReplacementCost({
      roofArea: 2000, roofAreaUnit: 'sqft',
      roofingMaterial: 'asphalt-3tab', stories: '1-story',
      roofComplexity: 'simple-gable', tearOff: 'none', region: 'national',
    });
    const singleLayer = calculateRoofReplacementCost({
      roofArea: 2000, roofAreaUnit: 'sqft',
      roofingMaterial: 'asphalt-3tab', stories: '1-story',
      roofComplexity: 'simple-gable', tearOff: 'single-layer', region: 'national',
    });
    // Tear-off: 2000 × $1-$2 → low $2000, high $4000, mid $3000
    expect(singleLayer.tearOffCost).toBe(3000);
    expect((singleLayer.totalLow as number)).toBe((noTearOff.totalLow as number) + 2000);
    expect((singleLayer.totalHigh as number)).toBe((noTearOff.totalHigh as number) + 4000);
  });

  // ─── Test 14: Double-layer tear-off ───
  it('adds double-layer tear-off cost', () => {
    const result = calculateRoofReplacementCost({
      roofArea: 2000, roofAreaUnit: 'sqft',
      roofingMaterial: 'asphalt-3tab', stories: '1-story',
      roofComplexity: 'simple-gable', tearOff: 'double-layer', region: 'national',
    });
    // Tear-off: 2000 × $2-$3.50 → low $4000, high $7000, mid $5500
    expect(result.tearOffCost).toBe(5500);
    // Total low: 6000 + 4000 + 4000 = $14,000
    // Total high: 10000 + 8000 + 7000 = $25,000
    expect(result.totalLow).toBe(14000);
    expect(result.totalHigh).toBe(25000);
  });

  // ─── Test 15: Northeast regional multiplier (1.20x) ───
  it('applies northeast regional labor multiplier (1.20x)', () => {
    const national = calculateRoofReplacementCost({
      roofArea: 2000, roofAreaUnit: 'sqft',
      roofingMaterial: 'asphalt-3tab', stories: '1-story',
      roofComplexity: 'simple-gable', tearOff: 'none', region: 'national',
    });
    const northeast = calculateRoofReplacementCost({
      roofArea: 2000, roofAreaUnit: 'sqft',
      roofingMaterial: 'asphalt-3tab', stories: '1-story',
      roofComplexity: 'simple-gable', tearOff: 'none', region: 'northeast',
    });
    expect((northeast.laborCost as number)).toBeGreaterThan((national.laborCost as number));
    expect((northeast.materialCost as number)).toBe((national.materialCost as number));
    // Labor mid northeast: (2000×2×1.20 + 2000×4×1.20) / 2 = (4800+9600)/2 = 7200
    expect((northeast.laborCost as number)).toBeCloseTo(7200, 1);
  });

  // ─── Test 16: South regional multiplier (0.85x) ───
  it('applies south regional labor multiplier (0.85x)', () => {
    const national = calculateRoofReplacementCost({
      roofArea: 2000, roofAreaUnit: 'sqft',
      roofingMaterial: 'asphalt-3tab', stories: '1-story',
      roofComplexity: 'simple-gable', tearOff: 'none', region: 'national',
    });
    const south = calculateRoofReplacementCost({
      roofArea: 2000, roofAreaUnit: 'sqft',
      roofingMaterial: 'asphalt-3tab', stories: '1-story',
      roofComplexity: 'simple-gable', tearOff: 'none', region: 'south',
    });
    expect((south.laborCost as number)).toBeLessThan((national.laborCost as number));
    expect((south.totalMid as number)).toBeLessThan((national.totalMid as number));
    // Labor mid south: (2000×2×0.85 + 2000×4×0.85) / 2 = (3400+6800)/2 = 5100
    expect((south.laborCost as number)).toBeCloseTo(5100, 1);
  });

  // ─── Test 17: West Coast regional multiplier (1.25x) ───
  it('applies west coast regional labor multiplier (1.25x)', () => {
    const result = calculateRoofReplacementCost({
      roofArea: 2000, roofAreaUnit: 'sqft',
      roofingMaterial: 'asphalt-3tab', stories: '1-story',
      roofComplexity: 'simple-gable', tearOff: 'none', region: 'west-coast',
    });
    // Labor low: 2000 × 2 × 1.25 = $5,000
    // Labor high: 2000 × 4 × 1.25 = $10,000
    // Labor mid: (5000 + 10000) / 2 = $7,500
    expect((result.laborCost as number)).toBeCloseTo(7500, 1);
  });

  // ─── Test 18: Midwest regional multiplier (0.90x) ───
  it('applies midwest regional labor multiplier (0.90x)', () => {
    const result = calculateRoofReplacementCost({
      roofArea: 2000, roofAreaUnit: 'sqft',
      roofingMaterial: 'asphalt-3tab', stories: '1-story',
      roofComplexity: 'simple-gable', tearOff: 'none', region: 'midwest',
    });
    // Labor mid: (2000×2×0.90 + 2000×4×0.90) / 2 = (3600+7200)/2 = 5400
    expect((result.laborCost as number)).toBeCloseTo(5400, 1);
  });

  // ─── Test 19: Mid-Atlantic regional multiplier (1.15x) ───
  it('applies mid-atlantic regional labor multiplier (1.15x)', () => {
    const result = calculateRoofReplacementCost({
      roofArea: 2000, roofAreaUnit: 'sqft',
      roofingMaterial: 'asphalt-3tab', stories: '1-story',
      roofComplexity: 'simple-gable', tearOff: 'none', region: 'mid-atlantic',
    });
    // Labor mid: (2000×2×1.15 + 2000×4×1.15) / 2 = (4600+9200)/2 = 6900
    expect((result.laborCost as number)).toBeCloseTo(6900, 1);
  });

  // ─── Test 20: Mountain West regional multiplier (0.95x) ───
  it('applies mountain west regional labor multiplier (0.95x)', () => {
    const result = calculateRoofReplacementCost({
      roofArea: 2000, roofAreaUnit: 'sqft',
      roofingMaterial: 'asphalt-3tab', stories: '1-story',
      roofComplexity: 'simple-gable', tearOff: 'none', region: 'mountain-west',
    });
    // Labor mid: (2000×2×0.95 + 2000×4×0.95) / 2 = (3800+7600)/2 = 5700
    expect((result.laborCost as number)).toBeCloseTo(5700, 1);
  });

  // ─── Test 21: Combined story + complexity + region multipliers ───
  it('stacks story, complexity, and region multipliers on labor', () => {
    const result = calculateRoofReplacementCost({
      roofArea: 2000, roofAreaUnit: 'sqft',
      roofingMaterial: 'asphalt-3tab', stories: '2-story',
      roofComplexity: 'complex-multi-level', tearOff: 'none', region: 'west-coast',
    });
    // Labor low: 2000 × 2 × 1.10 × 1.25 × 1.25 = 2000 × 2 × 1.71875 = $6,875
    // Labor high: 2000 × 4 × 1.10 × 1.25 × 1.25 = 2000 × 4 × 1.71875 = $13,750
    // Labor mid: ($6,875 + $13,750) / 2 = $10,312.50
    expect((result.laborCost as number)).toBeCloseTo(10312.5, 0);
    // Material stays same: (6000+10000)/2 = 8000
    expect((result.materialCost as number)).toBe(8000);
  });

  // ─── Test 22: Zero area returns zero costs ───
  it('returns zero for zero area', () => {
    const result = calculateRoofReplacementCost({
      roofArea: 0,
      roofAreaUnit: 'sqft',
      roofingMaterial: 'asphalt-3tab',
      stories: '1-story',
      roofComplexity: 'simple-gable',
      tearOff: 'none',
      region: 'national',
    });
    expect(result.area).toBe(0);
    expect(result.totalLow).toBe(0);
    expect(result.totalHigh).toBe(0);
    expect(result.totalMid).toBe(0);
    expect(result.costPerSquare).toBe(0);
  });

  // ─── Test 23: Metric input conversion ───
  it('converts square meters to square feet correctly', () => {
    const result = calculateRoofReplacementCost({
      roofArea: 186,          // ~186 sqm ≈ 2002 sqft
      roofAreaUnit: 'sqm',
      roofingMaterial: 'asphalt-3tab',
      stories: '1-story',
      roofComplexity: 'simple-gable',
      tearOff: 'none',
      region: 'national',
    });
    // 186 × 10.7639 ≈ 2002.09 sq ft
    expect(result.area).toBeCloseTo(2002.09, 0);
    expect((result.totalLow as number)).toBeGreaterThan(0);
  });

  // ─── Test 24: Cost per square (100 sqft) calculation ───
  it('calculates cost per roofing square correctly', () => {
    const result = calculateRoofReplacementCost({
      roofArea: 2000, roofAreaUnit: 'sqft',
      roofingMaterial: 'asphalt-3tab', stories: '1-story',
      roofComplexity: 'simple-gable', tearOff: 'none', region: 'national',
    });
    // totalMid = 14000, area = 2000
    // costPerSquare = (14000 / 2000) × 100 = $700
    expect(result.costPerSquare).toBe(700);
  });

  // ─── Test 25: Material comparison returns all 8 types ───
  it('returns material comparison with all 8 roofing types', () => {
    const result = calculateRoofReplacementCost({
      roofArea: 2000, roofAreaUnit: 'sqft',
      roofingMaterial: 'asphalt-3tab', stories: '1-story',
      roofComplexity: 'simple-gable', tearOff: 'none', region: 'national',
    });
    const comparison = result.materialComparison as Array<{ label: string; value: number }>;
    expect(comparison).toHaveLength(8);
    comparison.forEach(item => {
      expect(item.value).toBeGreaterThan(0);
      expect(item.label).toBeTruthy();
    });
  });

  // ─── Test 26: Asphalt cheapest, slate most expensive ───
  it('asphalt 3-tab is cheapest and slate is most expensive', () => {
    const types = ['asphalt-3tab', 'architectural-shingle', 'metal-standing-seam', 'metal-corrugated', 'tile-clay', 'tile-concrete', 'slate', 'wood-shake'];
    const costs = types.map(t => {
      const r = calculateRoofReplacementCost({
        roofArea: 2000, roofAreaUnit: 'sqft',
        roofingMaterial: t, stories: '1-story',
        roofComplexity: 'simple-gable', tearOff: 'none', region: 'national',
      });
      return { type: t, mid: r.totalMid as number };
    });
    const asphalt3tab = costs.find(c => c.type === 'asphalt-3tab')!;
    const slate = costs.find(c => c.type === 'slate')!;
    expect(asphalt3tab.mid).toBeLessThan(slate.mid);
    // Asphalt should be the cheapest overall
    costs.forEach(c => {
      if (c.type !== 'asphalt-3tab') {
        expect(asphalt3tab.mid).toBeLessThanOrEqual(c.mid);
      }
    });
  });

  // ─── Test 27: Output structure ───
  it('returns all expected output fields', () => {
    const result = calculateRoofReplacementCost({
      roofArea: 2000, roofAreaUnit: 'sqft',
      roofingMaterial: 'asphalt-3tab', stories: '1-story',
      roofComplexity: 'simple-gable', tearOff: 'none', region: 'national',
    });
    expect(result).toHaveProperty('area');
    expect(result).toHaveProperty('materialCost');
    expect(result).toHaveProperty('laborCost');
    expect(result).toHaveProperty('tearOffCost');
    expect(result).toHaveProperty('totalLow');
    expect(result).toHaveProperty('totalHigh');
    expect(result).toHaveProperty('totalMid');
    expect(result).toHaveProperty('costPerSquare');
    expect(result).toHaveProperty('materialComparison');
    expect(result).toHaveProperty('timeline');
  });

  // ─── Test 28: Timeline output ───
  it('returns correct timeline per material', () => {
    const asphalt = calculateRoofReplacementCost({
      roofArea: 2000, roofAreaUnit: 'sqft',
      roofingMaterial: 'asphalt-3tab', stories: '1-story',
      roofComplexity: 'simple-gable', tearOff: 'none', region: 'national',
    });
    const slate = calculateRoofReplacementCost({
      roofArea: 2000, roofAreaUnit: 'sqft',
      roofingMaterial: 'slate', stories: '1-story',
      roofComplexity: 'simple-gable', tearOff: 'none', region: 'national',
    });
    expect(asphalt.timeline).toBe('2–4 days');
    expect(slate.timeline).toBe('2–3 weeks');
  });

  // ─── Test 29: Regional multiplier only affects labor, not materials ───
  it('regional multiplier changes labor but not material cost', () => {
    const national = calculateRoofReplacementCost({
      roofArea: 2000, roofAreaUnit: 'sqft',
      roofingMaterial: 'architectural-shingle', stories: '1-story',
      roofComplexity: 'simple-gable', tearOff: 'none', region: 'national',
    });
    const northeast = calculateRoofReplacementCost({
      roofArea: 2000, roofAreaUnit: 'sqft',
      roofingMaterial: 'architectural-shingle', stories: '1-story',
      roofComplexity: 'simple-gable', tearOff: 'none', region: 'northeast',
    });
    expect(national.materialCost).toBe(northeast.materialCost);
    expect((northeast.laborCost as number)).toBeCloseTo((national.laborCost as number) * 1.20, 1);
  });

  // ─── Test 30: Default inputs produce valid output ───
  it('uses default inputs when values are missing', () => {
    const result = calculateRoofReplacementCost({});
    expect(result.area).toBe(0);
    expect(result.totalMid).toBe(0);
  });

  // ─── Test 31: Small roof area (100 sqft) ───
  it('handles small 100 sqft roof area', () => {
    const result = calculateRoofReplacementCost({
      roofArea: 100, roofAreaUnit: 'sqft',
      roofingMaterial: 'asphalt-3tab', stories: '1-story',
      roofComplexity: 'simple-gable', tearOff: 'none', region: 'national',
    });
    // TotalLow: 100×3 + 100×2 = $500
    // TotalHigh: 100×5 + 100×4 = $900
    expect(result.totalLow).toBe(500);
    expect(result.totalHigh).toBe(900);
    expect(result.totalMid).toBe(700);
  });

  // ─── Test 32: Large roof area (5000 sqft) ───
  it('handles large 5000 sqft roof area', () => {
    const result = calculateRoofReplacementCost({
      roofArea: 5000, roofAreaUnit: 'sqft',
      roofingMaterial: 'asphalt-3tab', stories: '1-story',
      roofComplexity: 'simple-gable', tearOff: 'none', region: 'national',
    });
    // TotalLow: 5000×3 + 5000×2 = $25,000
    // TotalHigh: 5000×5 + 5000×4 = $45,000
    expect(result.totalLow).toBe(25000);
    expect(result.totalHigh).toBe(45000);
    expect(result.totalMid).toBe(35000);
  });

  // ─── Test 33: Tear-off cost same regardless of material ───
  it('tear-off cost is the same regardless of roofing material', () => {
    const asphalt = calculateRoofReplacementCost({
      roofArea: 2000, roofAreaUnit: 'sqft',
      roofingMaterial: 'asphalt-3tab', stories: '1-story',
      roofComplexity: 'simple-gable', tearOff: 'single-layer', region: 'national',
    });
    const slate = calculateRoofReplacementCost({
      roofArea: 2000, roofAreaUnit: 'sqft',
      roofingMaterial: 'slate', stories: '1-story',
      roofComplexity: 'simple-gable', tearOff: 'single-layer', region: 'national',
    });
    expect(asphalt.tearOffCost).toBe(slate.tearOffCost);
    expect(asphalt.tearOffCost).toBe(3000);
  });

  // ─── Test 34: Material comparison ordering ───
  it('material comparison has asphalt cheapest and slate most expensive', () => {
    const result = calculateRoofReplacementCost({
      roofArea: 2000, roofAreaUnit: 'sqft',
      roofingMaterial: 'asphalt-3tab', stories: '1-story',
      roofComplexity: 'simple-gable', tearOff: 'none', region: 'national',
    });
    const comparison = result.materialComparison as Array<{ label: string; value: number }>;
    const asphalt = comparison.find(c => c.label.includes('Asphalt 3-Tab'));
    const slate = comparison.find(c => c.label.includes('Slate'));
    expect(asphalt!.value).toBeLessThan(slate!.value);
  });
});
