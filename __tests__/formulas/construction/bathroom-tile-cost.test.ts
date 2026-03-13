import { calculateBathroomTileCost } from '@/lib/formulas/construction/bathroom-tile-cost';

describe('calculateBathroomTileCost', () => {
  // ─── Test 1: Standard ceramic shower walls, 80 sqft, national ───
  it('calculates ceramic shower walls at 80 sq ft', () => {
    const result = calculateBathroomTileCost({
      projectType: 'shower-walls',
      area: 80,
      tileType: 'ceramic',
      demoOldTile: 'none',
      waterproofing: 'none',
      wasteFactor: 10,
      region: 'national',
    });
    // effectiveArea = 80 × 1.10 = 88
    // Material: 88 × $4 = $352 low, 88 × $8 = $704 high
    // Labor: 88 × $6 × 1.0 = $528 low, 88 × $12 × 1.0 = $1056 high
    // Supplies: 80 × $3 = $240
    // TotalLow: 352 + 528 + 0 + 0 + 240 = $1120
    // TotalHigh: 704 + 1056 + 0 + 0 + 240 = $2000
    expect(result.area).toBe(80);
    expect(result.effectiveArea).toBe(88);
    expect(result.totalLow).toBe(1120);
    expect(result.totalHigh).toBe(2000);
    expect(result.totalMid).toBe(1560);
    expect(result.suppliesCost).toBe(240);
  });

  // ─── Test 2: Porcelain tile ───
  it('calculates porcelain tile cost', () => {
    const result = calculateBathroomTileCost({
      projectType: 'shower-walls',
      area: 80,
      tileType: 'porcelain',
      demoOldTile: 'none',
      waterproofing: 'none',
      wasteFactor: 10,
      region: 'national',
    });
    // Material: 88 × $5 = $440 low, 88 × $10 = $880 high
    // Labor: 88 × $7 = $616 low, 88 × $15 = $1320 high
    // TotalLow: 440 + 616 + 240 = $1296
    // TotalHigh: 880 + 1320 + 240 = $2440
    expect(result.totalLow).toBe(1296);
    expect(result.totalHigh).toBe(2440);
  });

  // ─── Test 3: Natural stone tile ───
  it('calculates natural stone tile cost', () => {
    const result = calculateBathroomTileCost({
      projectType: 'shower-walls',
      area: 80,
      tileType: 'natural-stone',
      demoOldTile: 'none',
      waterproofing: 'none',
      wasteFactor: 10,
      region: 'national',
    });
    // Material: 88 × $8 = $704 low, 88 × $16 = $1408 high
    // Labor: 88 × $12 = $1056 low, 88 × $24 = $2112 high
    // TotalLow: 704 + 1056 + 240 = $2000
    // TotalHigh: 1408 + 2112 + 240 = $3760
    expect(result.totalLow).toBe(2000);
    expect(result.totalHigh).toBe(3760);
  });

  // ─── Test 4: Glass tile ───
  it('calculates glass tile cost', () => {
    const result = calculateBathroomTileCost({
      projectType: 'shower-walls',
      area: 80,
      tileType: 'glass',
      demoOldTile: 'none',
      waterproofing: 'none',
      wasteFactor: 10,
      region: 'national',
    });
    // Material: 88 × $7 = $616 low, 88 × $14 = $1232 high
    // Labor: 88 × $11 = $968 low, 88 × $21 = $1848 high
    // TotalLow: 616 + 968 + 240 = $1824
    // TotalHigh: 1232 + 1848 + 240 = $3320
    expect(result.totalLow).toBe(1824);
    expect(result.totalHigh).toBe(3320);
  });

  // ─── Test 5: Large-format tile ───
  it('calculates large-format tile cost', () => {
    const result = calculateBathroomTileCost({
      projectType: 'shower-walls',
      area: 80,
      tileType: 'large-format',
      demoOldTile: 'none',
      waterproofing: 'none',
      wasteFactor: 10,
      region: 'national',
    });
    // Material: 88 × $6 = $528 low, 88 × $12 = $1056 high
    // Labor: 88 × $9 = $792 low, 88 × $18 = $1584 high
    // TotalLow: 528 + 792 + 240 = $1560
    // TotalHigh: 1056 + 1584 + 240 = $2880
    expect(result.totalLow).toBe(1560);
    expect(result.totalHigh).toBe(2880);
  });

  // ─── Test 6: With demolition ───
  it('adds demolition cost when demoOldTile is yes', () => {
    const noDemo = calculateBathroomTileCost({
      projectType: 'shower-walls', area: 80, tileType: 'ceramic',
      demoOldTile: 'none', waterproofing: 'none', wasteFactor: 10, region: 'national',
    });
    const withDemo = calculateBathroomTileCost({
      projectType: 'shower-walls', area: 80, tileType: 'ceramic',
      demoOldTile: 'yes', waterproofing: 'none', wasteFactor: 10, region: 'national',
    });
    // Demo: 80 × $4 = $320 low, 80 × $8 = $640 high, mid = $480
    expect(withDemo.demoCost).toBe(480);
    expect((withDemo.totalLow as number)).toBe((noDemo.totalLow as number) + 320);
    expect((withDemo.totalHigh as number)).toBe((noDemo.totalHigh as number) + 640);
  });

  // ─── Test 7: Standard waterproofing ───
  it('adds standard waterproofing cost', () => {
    const noWP = calculateBathroomTileCost({
      projectType: 'shower-walls', area: 80, tileType: 'ceramic',
      demoOldTile: 'none', waterproofing: 'none', wasteFactor: 10, region: 'national',
    });
    const stdWP = calculateBathroomTileCost({
      projectType: 'shower-walls', area: 80, tileType: 'ceramic',
      demoOldTile: 'none', waterproofing: 'standard', wasteFactor: 10, region: 'national',
    });
    // WP: 80 × $2 = $160 low, 80 × $4 = $320 high, mid = $240
    expect(stdWP.waterproofingCost).toBe(240);
    expect((stdWP.totalLow as number)).toBe((noWP.totalLow as number) + 160);
    expect((stdWP.totalHigh as number)).toBe((noWP.totalHigh as number) + 320);
  });

  // ─── Test 8: Premium waterproofing ───
  it('adds premium waterproofing cost', () => {
    const result = calculateBathroomTileCost({
      projectType: 'shower-walls', area: 80, tileType: 'ceramic',
      demoOldTile: 'none', waterproofing: 'premium', wasteFactor: 10, region: 'national',
    });
    // WP: 80 × $4 = $320 low, 80 × $7 = $560 high, mid = $440
    expect(result.waterproofingCost).toBe(440);
  });

  // ─── Test 9: Shower floor project (small area) ───
  it('calculates shower floor at 15 sq ft', () => {
    const result = calculateBathroomTileCost({
      projectType: 'shower-floor',
      area: 15,
      tileType: 'ceramic',
      demoOldTile: 'none',
      waterproofing: 'none',
      wasteFactor: 10,
      region: 'national',
    });
    // effectiveArea = 15 × 1.10 = 16.5
    // Material: 16.5 × $4 = $66 low, 16.5 × $8 = $132 high
    // Labor: 16.5 × $6 = $99 low, 16.5 × $12 = $198 high
    // Supplies: 15 × $3 = $45
    // TotalLow: 66 + 99 + 45 = $210
    // TotalHigh: 132 + 198 + 45 = $375
    expect(result.area).toBe(15);
    expect(result.effectiveArea).toBe(16.5);
    expect(result.totalLow).toBe(210);
    expect(result.totalHigh).toBe(375);
  });

  // ─── Test 10: Full bathroom project (large area) ───
  it('calculates full bathroom at 180 sq ft', () => {
    const result = calculateBathroomTileCost({
      projectType: 'full-bathroom',
      area: 180,
      tileType: 'ceramic',
      demoOldTile: 'none',
      waterproofing: 'none',
      wasteFactor: 10,
      region: 'national',
    });
    // effectiveArea = 180 × 1.10 = 198
    // Material: 198 × $4 = $792 low, 198 × $8 = $1584 high
    // Labor: 198 × $6 = $1188 low, 198 × $12 = $2376 high
    // Supplies: 180 × $3 = $540
    // TotalLow: 792 + 1188 + 540 = $2520
    // TotalHigh: 1584 + 2376 + 540 = $4500
    expect(result.area).toBe(180);
    expect(result.effectiveArea).toBe(198);
    expect(result.totalLow).toBe(2520);
    expect(result.totalHigh).toBe(4500);
  });

  // ─── Test 11: Northeast region multiplier ───
  it('applies northeast regional labor multiplier (1.20x)', () => {
    const national = calculateBathroomTileCost({
      projectType: 'shower-walls', area: 80, tileType: 'ceramic',
      demoOldTile: 'none', waterproofing: 'none', wasteFactor: 10, region: 'national',
    });
    const northeast = calculateBathroomTileCost({
      projectType: 'shower-walls', area: 80, tileType: 'ceramic',
      demoOldTile: 'none', waterproofing: 'none', wasteFactor: 10, region: 'northeast',
    });
    expect((northeast.laborCost as number)).toBeGreaterThan((national.laborCost as number));
    expect((northeast.materialCost as number)).toBe((national.materialCost as number));
  });

  // ─── Test 12: South region multiplier ───
  it('applies south regional labor multiplier (0.85x)', () => {
    const national = calculateBathroomTileCost({
      projectType: 'shower-walls', area: 80, tileType: 'ceramic',
      demoOldTile: 'none', waterproofing: 'none', wasteFactor: 10, region: 'national',
    });
    const south = calculateBathroomTileCost({
      projectType: 'shower-walls', area: 80, tileType: 'ceramic',
      demoOldTile: 'none', waterproofing: 'none', wasteFactor: 10, region: 'south',
    });
    expect((south.laborCost as number)).toBeLessThan((national.laborCost as number));
    expect((south.totalMid as number)).toBeLessThan((national.totalMid as number));
  });

  // ─── Test 13: West Coast region (most expensive labor) ───
  it('applies west coast regional labor multiplier (1.25x)', () => {
    const result = calculateBathroomTileCost({
      projectType: 'shower-walls', area: 80, tileType: 'ceramic',
      demoOldTile: 'none', waterproofing: 'none', wasteFactor: 10, region: 'west-coast',
    });
    // effectiveArea=88, laborLow: 88×6×1.25=660, laborHigh: 88×12×1.25=1320
    // laborMid = (660+1320)/2 = 990
    expect((result.laborCost as number)).toBeCloseTo(990, 1);
  });

  // ─── Test 14: Waste factor 15% ───
  it('applies 15% waste factor correctly', () => {
    const result = calculateBathroomTileCost({
      projectType: 'shower-walls', area: 80, tileType: 'ceramic',
      demoOldTile: 'none', waterproofing: 'none', wasteFactor: 15, region: 'national',
    });
    // effectiveArea = 80 × 1.15 = 92
    expect(result.effectiveArea).toBe(92);
  });

  // ─── Test 15: Zero area uses default for project type ───
  it('uses default area when area is 0', () => {
    const result = calculateBathroomTileCost({
      projectType: 'tub-surround',
      area: 0,
      tileType: 'ceramic',
      demoOldTile: 'none',
      waterproofing: 'none',
      wasteFactor: 10,
      region: 'national',
    });
    // Default area for tub-surround is 60
    expect(result.area).toBe(60);
  });

  // ─── Test 16: Bathroom floor project ───
  it('calculates bathroom floor at 50 sq ft', () => {
    const result = calculateBathroomTileCost({
      projectType: 'bathroom-floor',
      area: 50,
      tileType: 'porcelain',
      demoOldTile: 'none',
      waterproofing: 'none',
      wasteFactor: 10,
      region: 'national',
    });
    // effectiveArea = 50 × 1.10 = 55
    // Material: 55 × $5 = $275 low, 55 × $10 = $550 high
    // Labor: 55 × $7 = $385 low, 55 × $15 = $825 high
    // Supplies: 50 × $3 = $150
    // TotalLow: 275 + 385 + 150 = $810
    // TotalHigh: 550 + 825 + 150 = $1525
    expect(result.area).toBe(50);
    expect(result.totalLow).toBe(810);
    expect(result.totalHigh).toBe(1525);
  });

  // ─── Test 17: Cost per sq ft accuracy ───
  it('calculates cost per sq ft correctly', () => {
    const result = calculateBathroomTileCost({
      projectType: 'shower-walls', area: 80, tileType: 'ceramic',
      demoOldTile: 'none', waterproofing: 'none', wasteFactor: 10, region: 'national',
    });
    // totalMid = 1560, area = 80
    // costPerSqFt = 1560 / 80 = 19.5
    expect(result.costPerSqFt).toBe(19.5);
  });

  // ─── Test 18: Tile comparison structure ───
  it('returns tile comparison with all 5 types', () => {
    const result = calculateBathroomTileCost({
      projectType: 'shower-walls', area: 80, tileType: 'ceramic',
      demoOldTile: 'none', waterproofing: 'none', wasteFactor: 10, region: 'national',
    });
    const comparison = result.tileComparison as Array<{ label: string; value: number }>;
    expect(comparison).toHaveLength(5);
    comparison.forEach(item => {
      expect(item.value).toBeGreaterThan(0);
      expect(item.label).toBeTruthy();
    });
    // Ceramic should be cheapest, natural stone most expensive
    const ceramic = comparison.find(c => c.label.includes('Ceramic'));
    const naturalStone = comparison.find(c => c.label.includes('Natural Stone'));
    expect(ceramic!.value).toBeLessThan(naturalStone!.value);
  });

  // ─── Test 19: Project note returned ───
  it('returns appropriate project note', () => {
    const shower = calculateBathroomTileCost({
      projectType: 'shower-walls', area: 80, tileType: 'ceramic',
      demoOldTile: 'none', waterproofing: 'none', wasteFactor: 10, region: 'national',
    });
    const full = calculateBathroomTileCost({
      projectType: 'full-bathroom', area: 180, tileType: 'ceramic',
      demoOldTile: 'none', waterproofing: 'none', wasteFactor: 10, region: 'national',
    });
    expect(typeof shower.projectNote).toBe('string');
    expect((shower.projectNote as string)).toContain('Shower wall');
    expect((full.projectNote as string)).toContain('Full bathroom');
  });

  // ─── Test 20: Output structure ───
  it('returns all expected output fields', () => {
    const result = calculateBathroomTileCost({
      projectType: 'shower-walls', area: 80, tileType: 'ceramic',
      demoOldTile: 'none', waterproofing: 'none', wasteFactor: 10, region: 'national',
    });
    expect(result).toHaveProperty('area');
    expect(result).toHaveProperty('effectiveArea');
    expect(result).toHaveProperty('materialCost');
    expect(result).toHaveProperty('laborCost');
    expect(result).toHaveProperty('demoCost');
    expect(result).toHaveProperty('waterproofingCost');
    expect(result).toHaveProperty('suppliesCost');
    expect(result).toHaveProperty('totalLow');
    expect(result).toHaveProperty('totalHigh');
    expect(result).toHaveProperty('totalMid');
    expect(result).toHaveProperty('costPerSqFt');
    expect(result).toHaveProperty('tileComparison');
    expect(result).toHaveProperty('projectNote');
  });

  // ─── Test 21: Ceramic cheapest, natural stone most expensive ───
  it('ceramic is cheapest and natural stone most expensive for same area', () => {
    const types = ['ceramic', 'porcelain', 'natural-stone', 'glass', 'large-format'];
    const costs = types.map(t => {
      const r = calculateBathroomTileCost({
        projectType: 'shower-walls', area: 80, tileType: t,
        demoOldTile: 'none', waterproofing: 'none', wasteFactor: 10, region: 'national',
      });
      return { type: t, mid: r.totalMid as number };
    });
    const ceramic = costs.find(c => c.type === 'ceramic')!;
    const naturalStone = costs.find(c => c.type === 'natural-stone')!;
    expect(ceramic.mid).toBeLessThan(naturalStone.mid);
  });

  // ─── Test 22: Demo + waterproofing + region combined ───
  it('combines demo, waterproofing, and region correctly', () => {
    const result = calculateBathroomTileCost({
      projectType: 'shower-walls', area: 80, tileType: 'ceramic',
      demoOldTile: 'yes', waterproofing: 'standard', wasteFactor: 10, region: 'northeast',
    });
    // effectiveArea = 88
    // Material low: 88 × 4 = 352, high: 88 × 8 = 704
    // Labor low: 88 × 6 × 1.20 = 633.6, high: 88 × 12 × 1.20 = 1267.2
    // Demo low: 80 × 4 = 320, high: 80 × 8 = 640
    // WP low: 80 × 2 = 160, high: 80 × 4 = 320
    // Supplies: 80 × 3 = 240
    // TotalLow: 352 + 633.6 + 320 + 160 + 240 = 1705.6
    // TotalHigh: 704 + 1267.2 + 640 + 320 + 240 = 3171.2
    expect(result.totalLow).toBeCloseTo(1705.6, 1);
    expect(result.totalHigh).toBeCloseTo(3171.2, 1);
  });

  // ─── Test 23: Midwest region cheapest labor ───
  it('applies midwest regional labor multiplier (0.90x)', () => {
    const result = calculateBathroomTileCost({
      projectType: 'shower-walls', area: 80, tileType: 'ceramic',
      demoOldTile: 'none', waterproofing: 'none', wasteFactor: 10, region: 'midwest',
    });
    // Labor low: 88 × 6 × 0.9 = 475.2, high: 88 × 12 × 0.9 = 950.4
    // laborMid = (475.2 + 950.4) / 2 = 712.8
    expect((result.laborCost as number)).toBeCloseTo(712.8, 1);
  });

  // ─── Test 24: Tub surround project ───
  it('calculates tub surround at 60 sq ft', () => {
    const result = calculateBathroomTileCost({
      projectType: 'tub-surround',
      area: 60,
      tileType: 'ceramic',
      demoOldTile: 'none',
      waterproofing: 'none',
      wasteFactor: 10,
      region: 'national',
    });
    // effectiveArea = 60 × 1.10 = 66
    // Material: 66 × 4 = 264 low, 66 × 8 = 528 high
    // Labor: 66 × 6 = 396 low, 66 × 12 = 792 high
    // Supplies: 60 × 3 = 180
    // TotalLow: 264 + 396 + 180 = 840
    // TotalHigh: 528 + 792 + 180 = 1500
    expect(result.area).toBe(60);
    expect(result.totalLow).toBe(840);
    expect(result.totalHigh).toBe(1500);
  });

  // ─── Test 25: Regional multiplier only affects labor ───
  it('regional multiplier changes labor but not material cost', () => {
    const national = calculateBathroomTileCost({
      projectType: 'shower-walls', area: 80, tileType: 'porcelain',
      demoOldTile: 'none', waterproofing: 'none', wasteFactor: 10, region: 'national',
    });
    const northeast = calculateBathroomTileCost({
      projectType: 'shower-walls', area: 80, tileType: 'porcelain',
      demoOldTile: 'none', waterproofing: 'none', wasteFactor: 10, region: 'northeast',
    });
    expect(national.materialCost).toBe(northeast.materialCost);
    expect((northeast.laborCost as number)).toBeCloseTo((national.laborCost as number) * 1.20, 1);
  });
});
