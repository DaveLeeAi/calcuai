import { calculateBacksplashTileCost } from '@/lib/formulas/construction/backsplash-tile-cost';

describe('calculateBacksplashTileCost', () => {
  // ─── Test 1: Standard ceramic subway 10×1.5 ft, national, no demo ───
  it('calculates a standard 10×1.5 ceramic subway backsplash', () => {
    const result = calculateBacksplashTileCost({
      backsplashLength: 10,
      backsplashLengthUnit: 'ft',
      backsplashHeight: 1.5,
      backsplashHeightUnit: 'ft',
      tileType: 'ceramic-subway',
      demoOldBacksplash: 'none',
      wasteFactor: 10,
      region: 'national',
    });
    // Area = 10 × 1.5 = 15 sq ft
    // MaterialArea = 15 × 1.10 = 16.5 sq ft
    // Material: 16.5 × $4 = $66 low, 16.5 × $8 = $132 high
    // Labor: 16.5 × $6 × 1.0 = $99 low, 16.5 × $12 × 1.0 = $198 high
    // Demo: $0
    // Supplies: 15 × $2.50 = $37.50
    // TotalLow: 66 + 99 + 0 + 37.5 = $202.50
    // TotalHigh: 132 + 198 + 0 + 37.5 = $367.50
    expect(result.area).toBe(15);
    expect(result.materialArea).toBe(16.5);
    expect(result.totalLow).toBe(202.5);
    expect(result.totalHigh).toBe(367.5);
    expect(result.totalMid).toBe(285);
    expect(result.suppliesCost).toBe(37.5);
    expect(result.demoCost).toBe(0);
  });

  // ─── Test 2: Glass mosaic tile ───
  it('calculates glass mosaic backsplash cost', () => {
    const result = calculateBacksplashTileCost({
      backsplashLength: 10,
      backsplashLengthUnit: 'ft',
      backsplashHeight: 1.5,
      backsplashHeightUnit: 'ft',
      tileType: 'glass-mosaic',
      demoOldBacksplash: 'none',
      wasteFactor: 10,
      region: 'national',
    });
    // MaterialArea = 16.5
    // Material: 16.5 × $7 = $115.50 low, 16.5 × $14 = $231 high
    // Labor: 16.5 × $11 = $181.50 low, 16.5 × $21 = $346.50 high
    // Supplies: $37.50
    // TotalLow: 115.5 + 181.5 + 0 + 37.5 = $334.50
    // TotalHigh: 231 + 346.5 + 0 + 37.5 = $615
    expect(result.totalLow).toBe(334.5);
    expect(result.totalHigh).toBe(615);
  });

  // ─── Test 3: Natural stone tile ───
  it('calculates natural stone backsplash cost', () => {
    const result = calculateBacksplashTileCost({
      backsplashLength: 10,
      backsplashLengthUnit: 'ft',
      backsplashHeight: 1.5,
      backsplashHeightUnit: 'ft',
      tileType: 'natural-stone',
      demoOldBacksplash: 'none',
      wasteFactor: 10,
      region: 'national',
    });
    // Material: 16.5 × $9 = $148.50 low, 16.5 × $16 = $264 high
    // Labor: 16.5 × $13 = $214.50 low, 16.5 × $24 = $396 high
    // TotalLow: 148.5 + 214.5 + 0 + 37.5 = $400.50
    // TotalHigh: 264 + 396 + 0 + 37.5 = $697.50
    expect(result.totalLow).toBe(400.5);
    expect(result.totalHigh).toBe(697.5);
  });

  // ─── Test 4: Porcelain tile ───
  it('calculates porcelain backsplash cost', () => {
    const result = calculateBacksplashTileCost({
      backsplashLength: 10,
      backsplashLengthUnit: 'ft',
      backsplashHeight: 1.5,
      backsplashHeightUnit: 'ft',
      tileType: 'porcelain',
      demoOldBacksplash: 'none',
      wasteFactor: 10,
      region: 'national',
    });
    // Material: 16.5 × $5 = $82.50 low, 16.5 × $11 = $181.50 high
    // Labor: 16.5 × $7 = $115.50 low, 16.5 × $17 = $280.50 high
    // TotalLow: 82.5 + 115.5 + 0 + 37.5 = $235.50
    // TotalHigh: 181.5 + 280.5 + 0 + 37.5 = $499.50
    expect(result.totalLow).toBe(235.5);
    expect(result.totalHigh).toBe(499.5);
  });

  // ─── Test 5: Peel-and-stick tile ───
  it('calculates peel-and-stick backsplash cost', () => {
    const result = calculateBacksplashTileCost({
      backsplashLength: 10,
      backsplashLengthUnit: 'ft',
      backsplashHeight: 1.5,
      backsplashHeightUnit: 'ft',
      tileType: 'peel-and-stick',
      demoOldBacksplash: 'none',
      wasteFactor: 10,
      region: 'national',
    });
    // Material: 16.5 × $2 = $33 low, 16.5 × $5 = $82.50 high
    // Labor: 16.5 × $3 = $49.50 low, 16.5 × $7 = $115.50 high
    // TotalLow: 33 + 49.5 + 0 + 37.5 = $120
    // TotalHigh: 82.5 + 115.5 + 0 + 37.5 = $235.50
    expect(result.totalLow).toBe(120);
    expect(result.totalHigh).toBe(235.5);
  });

  // ─── Test 6: With demolition ───
  it('adds demolition cost when demoOldBacksplash is yes', () => {
    const noDemo = calculateBacksplashTileCost({
      backsplashLength: 10, backsplashLengthUnit: 'ft',
      backsplashHeight: 1.5, backsplashHeightUnit: 'ft',
      tileType: 'ceramic-subway', demoOldBacksplash: 'none',
      wasteFactor: 10, region: 'national',
    });
    const withDemo = calculateBacksplashTileCost({
      backsplashLength: 10, backsplashLengthUnit: 'ft',
      backsplashHeight: 1.5, backsplashHeightUnit: 'ft',
      tileType: 'ceramic-subway', demoOldBacksplash: 'yes',
      wasteFactor: 10, region: 'national',
    });
    // Demo: area=15, $3-$6/sqft → low $45, high $90, mid $67.50
    expect(withDemo.demoCost).toBe(67.5);
    expect((withDemo.totalLow as number)).toBe((noDemo.totalLow as number) + 45);
    expect((withDemo.totalHigh as number)).toBe((noDemo.totalHigh as number) + 90);
  });

  // ─── Test 7: Waste factor 15% ───
  it('applies 15% waste factor correctly', () => {
    const result = calculateBacksplashTileCost({
      backsplashLength: 10, backsplashLengthUnit: 'ft',
      backsplashHeight: 1.5, backsplashHeightUnit: 'ft',
      tileType: 'ceramic-subway', demoOldBacksplash: 'none',
      wasteFactor: 15, region: 'national',
    });
    // Area = 15, materialArea = 15 × 1.15 = 17.25
    expect(result.area).toBe(15);
    expect(result.materialArea).toBe(17.25);
  });

  // ─── Test 8: Waste factor 5% (minimum) ───
  it('applies 5% waste factor correctly', () => {
    const result = calculateBacksplashTileCost({
      backsplashLength: 10, backsplashLengthUnit: 'ft',
      backsplashHeight: 1.5, backsplashHeightUnit: 'ft',
      tileType: 'ceramic-subway', demoOldBacksplash: 'none',
      wasteFactor: 5, region: 'national',
    });
    // materialArea = 15 × 1.05 = 15.75
    expect(result.materialArea).toBe(15.75);
  });

  // ─── Test 9: Northeast region multiplier ───
  it('applies northeast regional labor multiplier (1.20x)', () => {
    const national = calculateBacksplashTileCost({
      backsplashLength: 10, backsplashLengthUnit: 'ft',
      backsplashHeight: 1.5, backsplashHeightUnit: 'ft',
      tileType: 'ceramic-subway', demoOldBacksplash: 'none',
      wasteFactor: 10, region: 'national',
    });
    const northeast = calculateBacksplashTileCost({
      backsplashLength: 10, backsplashLengthUnit: 'ft',
      backsplashHeight: 1.5, backsplashHeightUnit: 'ft',
      tileType: 'ceramic-subway', demoOldBacksplash: 'none',
      wasteFactor: 10, region: 'northeast',
    });
    // Labor increases by 20%, material stays same
    expect((northeast.laborCost as number)).toBeGreaterThan((national.laborCost as number));
    expect((northeast.materialCost as number)).toBe((national.materialCost as number));
    expect((northeast.totalMid as number)).toBeGreaterThan((national.totalMid as number));
  });

  // ─── Test 10: South region multiplier (cheapest labor) ───
  it('applies south regional labor multiplier (0.85x)', () => {
    const national = calculateBacksplashTileCost({
      backsplashLength: 10, backsplashLengthUnit: 'ft',
      backsplashHeight: 1.5, backsplashHeightUnit: 'ft',
      tileType: 'ceramic-subway', demoOldBacksplash: 'none',
      wasteFactor: 10, region: 'national',
    });
    const south = calculateBacksplashTileCost({
      backsplashLength: 10, backsplashLengthUnit: 'ft',
      backsplashHeight: 1.5, backsplashHeightUnit: 'ft',
      tileType: 'ceramic-subway', demoOldBacksplash: 'none',
      wasteFactor: 10, region: 'south',
    });
    expect((south.laborCost as number)).toBeLessThan((national.laborCost as number));
    expect((south.totalMid as number)).toBeLessThan((national.totalMid as number));
  });

  // ─── Test 11: West Coast region multiplier (most expensive) ───
  it('applies west coast regional labor multiplier (1.25x)', () => {
    const national = calculateBacksplashTileCost({
      backsplashLength: 10, backsplashLengthUnit: 'ft',
      backsplashHeight: 1.5, backsplashHeightUnit: 'ft',
      tileType: 'ceramic-subway', demoOldBacksplash: 'none',
      wasteFactor: 10, region: 'national',
    });
    const westCoast = calculateBacksplashTileCost({
      backsplashLength: 10, backsplashLengthUnit: 'ft',
      backsplashHeight: 1.5, backsplashHeightUnit: 'ft',
      tileType: 'ceramic-subway', demoOldBacksplash: 'none',
      wasteFactor: 10, region: 'west-coast',
    });
    // West coast has highest multiplier (1.25x)
    expect((westCoast.laborCost as number)).toBeGreaterThan((national.laborCost as number));
    // Verify exact labor calculation: materialArea=16.5, laborRateMid=(6+12)/2=9
    // National: 16.5 × 9 = 148.50
    // West Coast: 16.5 × 6 × 1.25 = 123.75 low, 16.5 × 12 × 1.25 = 247.5 high, mid = 185.625
    expect((westCoast.laborCost as number)).toBeCloseTo(185.63, 1);
  });

  // ─── Test 12: Zero length → zero costs ───
  it('returns zero for zero length', () => {
    const result = calculateBacksplashTileCost({
      backsplashLength: 0, backsplashLengthUnit: 'ft',
      backsplashHeight: 1.5, backsplashHeightUnit: 'ft',
      tileType: 'ceramic-subway', demoOldBacksplash: 'none',
      wasteFactor: 10, region: 'national',
    });
    expect(result.area).toBe(0);
    expect(result.totalLow).toBe(0);
    expect(result.totalHigh).toBe(0);
    expect(result.totalMid).toBe(0);
    expect(result.costPerSqFt).toBe(0);
  });

  // ─── Test 13: Zero height → zero costs ───
  it('returns zero for zero height', () => {
    const result = calculateBacksplashTileCost({
      backsplashLength: 10, backsplashLengthUnit: 'ft',
      backsplashHeight: 0, backsplashHeightUnit: 'ft',
      tileType: 'ceramic-subway', demoOldBacksplash: 'none',
      wasteFactor: 10, region: 'national',
    });
    expect(result.area).toBe(0);
    expect(result.totalMid).toBe(0);
  });

  // ─── Test 14: Metric inputs ───
  it('converts metric inputs correctly', () => {
    const result = calculateBacksplashTileCost({
      backsplashLength: 3,          // 3 m ≈ 9.84 ft
      backsplashLengthUnit: 'm',
      backsplashHeight: 0.45,       // 0.45 m ≈ 1.48 ft
      backsplashHeightUnit: 'm',
      tileType: 'ceramic-subway',
      demoOldBacksplash: 'none',
      wasteFactor: 10,
      region: 'national',
    });
    // Area ≈ 9.84 × 1.48 ≈ 14.53 sq ft
    expect(result.area).toBeCloseTo(14.53, 0);
    expect((result.totalLow as number)).toBeGreaterThan(0);
  });

  // ─── Test 15: Large backsplash 20×2 ft ───
  it('handles large 20×2 backsplash', () => {
    const result = calculateBacksplashTileCost({
      backsplashLength: 20, backsplashLengthUnit: 'ft',
      backsplashHeight: 2, backsplashHeightUnit: 'ft',
      tileType: 'ceramic-subway', demoOldBacksplash: 'none',
      wasteFactor: 10, region: 'national',
    });
    // Area = 40, materialArea = 44
    expect(result.area).toBe(40);
    expect(result.materialArea).toBe(44);
    // TotalLow: 44×4 + 44×6 + 0 + 40×2.5 = 176 + 264 + 100 = $540
    // TotalHigh: 44×8 + 44×12 + 0 + 100 = 352 + 528 + 100 = $980
    expect(result.totalLow).toBe(540);
    expect(result.totalHigh).toBe(980);
  });

  // ─── Test 16: Cost per sq ft accuracy ───
  it('calculates cost per sq ft correctly', () => {
    const result = calculateBacksplashTileCost({
      backsplashLength: 10, backsplashLengthUnit: 'ft',
      backsplashHeight: 1.5, backsplashHeightUnit: 'ft',
      tileType: 'ceramic-subway', demoOldBacksplash: 'none',
      wasteFactor: 10, region: 'national',
    });
    // totalMid = 285, area = 15
    // costPerSqFt = 285 / 15 = 19
    expect(result.costPerSqFt).toBe(19);
  });

  // ─── Test 17: Tile comparison structure ───
  it('returns tile comparison with all 5 types', () => {
    const result = calculateBacksplashTileCost({
      backsplashLength: 10, backsplashLengthUnit: 'ft',
      backsplashHeight: 1.5, backsplashHeightUnit: 'ft',
      tileType: 'ceramic-subway', demoOldBacksplash: 'none',
      wasteFactor: 10, region: 'national',
    });
    const comparison = result.tileComparison as Array<{ label: string; value: number }>;
    expect(comparison).toHaveLength(5);
    comparison.forEach(item => {
      expect(item.value).toBeGreaterThan(0);
      expect(item.label).toBeTruthy();
    });
    // Peel-and-stick should be cheapest, natural stone most expensive
    const peelAndStick = comparison.find(c => c.label.includes('Peel-and-Stick'));
    const naturalStone = comparison.find(c => c.label.includes('Natural Stone'));
    expect(peelAndStick!.value).toBeLessThan(naturalStone!.value);
  });

  // ─── Test 18: Output structure ───
  it('returns all expected output fields', () => {
    const result = calculateBacksplashTileCost({
      backsplashLength: 10, backsplashLengthUnit: 'ft',
      backsplashHeight: 1.5, backsplashHeightUnit: 'ft',
      tileType: 'ceramic-subway', demoOldBacksplash: 'none',
      wasteFactor: 10, region: 'national',
    });
    expect(result).toHaveProperty('area');
    expect(result).toHaveProperty('materialArea');
    expect(result).toHaveProperty('materialCost');
    expect(result).toHaveProperty('laborCost');
    expect(result).toHaveProperty('demoCost');
    expect(result).toHaveProperty('suppliesCost');
    expect(result).toHaveProperty('totalLow');
    expect(result).toHaveProperty('totalHigh');
    expect(result).toHaveProperty('totalMid');
    expect(result).toHaveProperty('costPerSqFt');
    expect(result).toHaveProperty('tileComparison');
  });

  // ─── Test 19: Peel-and-stick cheapest, natural stone most expensive ───
  it('peel-and-stick is cheapest and natural stone most expensive', () => {
    const types = ['ceramic-subway', 'glass-mosaic', 'natural-stone', 'porcelain', 'peel-and-stick'];
    const costs = types.map(t => {
      const r = calculateBacksplashTileCost({
        backsplashLength: 10, backsplashLengthUnit: 'ft',
        backsplashHeight: 1.5, backsplashHeightUnit: 'ft',
        tileType: t, demoOldBacksplash: 'none',
        wasteFactor: 10, region: 'national',
      });
      return { type: t, mid: r.totalMid as number };
    });
    const peelAndStick = costs.find(c => c.type === 'peel-and-stick')!;
    const naturalStone = costs.find(c => c.type === 'natural-stone')!;
    const ceramic = costs.find(c => c.type === 'ceramic-subway')!;
    expect(peelAndStick.mid).toBeLessThan(ceramic.mid);
    expect(ceramic.mid).toBeLessThan(naturalStone.mid);
  });

  // ─── Test 20: Demo with all tile types ───
  it('demo cost is the same regardless of tile type', () => {
    const ceramicDemo = calculateBacksplashTileCost({
      backsplashLength: 10, backsplashLengthUnit: 'ft',
      backsplashHeight: 1.5, backsplashHeightUnit: 'ft',
      tileType: 'ceramic-subway', demoOldBacksplash: 'yes',
      wasteFactor: 10, region: 'national',
    });
    const stoneDemo = calculateBacksplashTileCost({
      backsplashLength: 10, backsplashLengthUnit: 'ft',
      backsplashHeight: 1.5, backsplashHeightUnit: 'ft',
      tileType: 'natural-stone', demoOldBacksplash: 'yes',
      wasteFactor: 10, region: 'national',
    });
    expect(ceramicDemo.demoCost).toBe(stoneDemo.demoCost);
    // Demo: 15 × ($3+$6)/2 = 15 × $4.50 = $67.50
    expect(ceramicDemo.demoCost).toBe(67.5);
  });

  // ─── Test 21: Midwest region multiplier ───
  it('applies midwest regional labor multiplier (0.90x)', () => {
    const result = calculateBacksplashTileCost({
      backsplashLength: 10, backsplashLengthUnit: 'ft',
      backsplashHeight: 1.5, backsplashHeightUnit: 'ft',
      tileType: 'ceramic-subway', demoOldBacksplash: 'none',
      wasteFactor: 10, region: 'midwest',
    });
    // Labor low: 16.5 × 6 × 0.90 = 89.10
    // Labor high: 16.5 × 12 × 0.90 = 178.20
    // Labor mid: (89.1 + 178.2) / 2 = 133.65
    expect((result.laborCost as number)).toBeCloseTo(133.65, 1);
  });

  // ─── Test 22: Supplies cost scales with area ───
  it('supplies cost scales with area at $2.50/sqft', () => {
    const small = calculateBacksplashTileCost({
      backsplashLength: 5, backsplashLengthUnit: 'ft',
      backsplashHeight: 1.5, backsplashHeightUnit: 'ft',
      tileType: 'ceramic-subway', demoOldBacksplash: 'none',
      wasteFactor: 10, region: 'national',
    });
    const large = calculateBacksplashTileCost({
      backsplashLength: 20, backsplashLengthUnit: 'ft',
      backsplashHeight: 1.5, backsplashHeightUnit: 'ft',
      tileType: 'ceramic-subway', demoOldBacksplash: 'none',
      wasteFactor: 10, region: 'national',
    });
    // small area = 7.5, supplies = 7.5 × 2.5 = $18.75
    // large area = 30, supplies = 30 × 2.5 = $75
    expect(small.suppliesCost).toBe(18.75);
    expect(large.suppliesCost).toBe(75);
  });

  // ─── Test 23: Default inputs produce valid output ───
  it('uses default inputs when values are missing', () => {
    const result = calculateBacksplashTileCost({});
    expect(result.area).toBe(0);
    expect(result.totalMid).toBe(0);
  });

  // ─── Test 24: Regional multiplier only affects labor, not materials ───
  it('regional multiplier changes labor but not material cost', () => {
    const national = calculateBacksplashTileCost({
      backsplashLength: 10, backsplashLengthUnit: 'ft',
      backsplashHeight: 2, backsplashHeightUnit: 'ft',
      tileType: 'porcelain', demoOldBacksplash: 'none',
      wasteFactor: 10, region: 'national',
    });
    const northeast = calculateBacksplashTileCost({
      backsplashLength: 10, backsplashLengthUnit: 'ft',
      backsplashHeight: 2, backsplashHeightUnit: 'ft',
      tileType: 'porcelain', demoOldBacksplash: 'none',
      wasteFactor: 10, region: 'northeast',
    });
    expect(national.materialCost).toBe(northeast.materialCost);
    expect((northeast.laborCost as number)).toBeCloseTo((national.laborCost as number) * 1.20, 1);
  });
});
