import { calculateDeckReplacementCost } from '@/lib/formulas/construction/deck-replacement-cost';

describe('calculateDeckReplacementCost', () => {
  // ─── Test 1: Pressure-treated 16×12, boards only, no railing/stairs, national ───
  it('calculates a 16×12 pressure-treated deck, boards only, national', () => {
    const result = calculateDeckReplacementCost({
      deckLength: 16, deckLengthUnit: 'ft',
      deckWidth: 12, deckWidthUnit: 'ft',
      deckingMaterial: 'pressure-treated',
      substructureWork: 'none-boards-only',
      railingLength: 0, railingType: 'wood',
      stairCount: 0, region: 'national',
    });
    // Area = 192 sq ft
    // Demo: 192 × $5 = $960
    // Material low: 192 × $6.75 = $1296, high: 192 × $11.25 = $2160
    // Labor low: 192 × $8.25 × 1.0 = $1584, high: 192 × $13.75 × 1.0 = $2640
    // Sub: $0, Railing: $0, Stairs: $0
    // totalLow: 960 + 1296 + 1584 + 0 + 0 + 0 = 3840
    // totalHigh: 960 + 2160 + 2640 + 0 + 0 + 0 = 5760
    expect(result.area).toBe(192);
    expect(result.demolitionCost).toBe(960);
    expect(result.totalLow).toBe(3840);
    expect(result.totalHigh).toBe(5760);
    expect(result.totalMid).toBe(4800);
  });

  // ─── Test 2: Cedar decking ───
  it('calculates cedar decking cost', () => {
    const result = calculateDeckReplacementCost({
      deckLength: 16, deckLengthUnit: 'ft',
      deckWidth: 12, deckWidthUnit: 'ft',
      deckingMaterial: 'cedar',
      substructureWork: 'none-boards-only',
      railingLength: 0, railingType: 'wood',
      stairCount: 0, region: 'national',
    });
    // Material low: 192 × $9 = $1728, high: 192 × $15.75 = $3024
    // Labor low: 192 × $11 = $2112, high: 192 × $19.25 = $3696
    // totalLow: 960 + 1728 + 2112 = 4800
    // totalHigh: 960 + 3024 + 3696 = 7680
    expect(result.totalLow).toBe(4800);
    expect(result.totalHigh).toBe(7680);
  });

  // ─── Test 3: Composite decking ───
  it('calculates composite decking cost', () => {
    const result = calculateDeckReplacementCost({
      deckLength: 16, deckLengthUnit: 'ft',
      deckWidth: 12, deckWidthUnit: 'ft',
      deckingMaterial: 'composite',
      substructureWork: 'none-boards-only',
      railingLength: 0, railingType: 'wood',
      stairCount: 0, region: 'national',
    });
    // Material low: 192 × $11.25 = $2160, high: 192 × $20.25 = $3888
    // Labor low: 192 × $13.75 = $2640, high: 192 × $24.75 = $4752
    // totalLow: 960 + 2160 + 2640 = 5760
    // totalHigh: 960 + 3888 + 4752 = 9600
    expect(result.totalLow).toBe(5760);
    expect(result.totalHigh).toBe(9600);
  });

  // ─── Test 4: PVC decking ───
  it('calculates PVC decking cost', () => {
    const result = calculateDeckReplacementCost({
      deckLength: 16, deckLengthUnit: 'ft',
      deckWidth: 12, deckWidthUnit: 'ft',
      deckingMaterial: 'pvc',
      substructureWork: 'none-boards-only',
      railingLength: 0, railingType: 'wood',
      stairCount: 0, region: 'national',
    });
    // Material low: 192 × $13.50 = $2592, high: 192 × $22.50 = $4320
    // Labor low: 192 × $16.50 = $3168, high: 192 × $27.50 = $5280
    // totalLow: 960 + 2592 + 3168 = 6720
    // totalHigh: 960 + 4320 + 5280 = 10560
    expect(result.totalLow).toBe(6720);
    expect(result.totalHigh).toBe(10560);
  });

  // ─── Test 5: Tropical hardwood decking ───
  it('calculates tropical hardwood decking cost', () => {
    const result = calculateDeckReplacementCost({
      deckLength: 16, deckLengthUnit: 'ft',
      deckWidth: 12, deckWidthUnit: 'ft',
      deckingMaterial: 'tropical-hardwood',
      substructureWork: 'none-boards-only',
      railingLength: 0, railingType: 'wood',
      stairCount: 0, region: 'national',
    });
    // Material low: 192 × $15.75 = $3024, high: 192 × $27 = $5184
    // Labor low: 192 × $19.25 = $3696, high: 192 × $33 = $6336
    // totalLow: 960 + 3024 + 3696 = 7680
    // totalHigh: 960 + 5184 + 6336 = 12480
    expect(result.totalLow).toBe(7680);
    expect(result.totalHigh).toBe(12480);
  });

  // ─── Test 6: Partial substructure repair ───
  it('adds partial substructure repair cost', () => {
    const result = calculateDeckReplacementCost({
      deckLength: 16, deckLengthUnit: 'ft',
      deckWidth: 12, deckWidthUnit: 'ft',
      deckingMaterial: 'pressure-treated',
      substructureWork: 'partial-repair',
      railingLength: 0, railingType: 'wood',
      stairCount: 0, region: 'national',
    });
    // Base totalLow (boards only): 3840
    // + sub low: 192 × $5 = $960, high: 192 × $10 = $1920
    // totalLow: 3840 + 960 = 4800
    // totalHigh: 5760 + 1920 = 7680
    expect(result.totalLow).toBe(4800);
    expect(result.totalHigh).toBe(7680);
  });

  // ─── Test 7: Full substructure replacement ───
  it('adds full substructure replacement cost', () => {
    const result = calculateDeckReplacementCost({
      deckLength: 16, deckLengthUnit: 'ft',
      deckWidth: 12, deckWidthUnit: 'ft',
      deckingMaterial: 'pressure-treated',
      substructureWork: 'full-replacement',
      railingLength: 0, railingType: 'wood',
      stairCount: 0, region: 'national',
    });
    // Sub low: 192 × $15 = $2880, high: 192 × $25 = $4800
    // totalLow: 3840 + 2880 = 6720
    // totalHigh: 5760 + 4800 = 10560
    expect(result.totalLow).toBe(6720);
    expect(result.totalHigh).toBe(10560);
  });

  // ─── Test 8: Wood railing ───
  it('adds wood railing cost', () => {
    const result = calculateDeckReplacementCost({
      deckLength: 16, deckLengthUnit: 'ft',
      deckWidth: 12, deckWidthUnit: 'ft',
      deckingMaterial: 'pressure-treated',
      substructureWork: 'none-boards-only',
      railingLength: 28, railingType: 'wood',
      stairCount: 0, region: 'national',
    });
    // Railing low: 28 × $20 = $560, high: 28 × $40 = $1120
    // totalLow: 3840 + 560 = 4400
    // totalHigh: 5760 + 1120 = 6880
    expect(result.totalLow).toBe(4400);
    expect(result.totalHigh).toBe(6880);
  });

  // ─── Test 9: Metal railing ───
  it('adds metal railing cost', () => {
    const result = calculateDeckReplacementCost({
      deckLength: 16, deckLengthUnit: 'ft',
      deckWidth: 12, deckWidthUnit: 'ft',
      deckingMaterial: 'pressure-treated',
      substructureWork: 'none-boards-only',
      railingLength: 28, railingType: 'metal',
      stairCount: 0, region: 'national',
    });
    // Railing low: 28 × $50 = $1400, high: 28 × $80 = $2240
    // totalLow: 3840 + 1400 = 5240
    // totalHigh: 5760 + 2240 = 8000
    expect(result.totalLow).toBe(5240);
    expect(result.totalHigh).toBe(8000);
  });

  // ─── Test 10: Cable railing ───
  it('adds cable railing cost', () => {
    const result = calculateDeckReplacementCost({
      deckLength: 16, deckLengthUnit: 'ft',
      deckWidth: 12, deckWidthUnit: 'ft',
      deckingMaterial: 'pressure-treated',
      substructureWork: 'none-boards-only',
      railingLength: 28, railingType: 'cable',
      stairCount: 0, region: 'national',
    });
    // Railing low: 28 × $60 = $1680, high: 28 × $100 = $2800
    // totalLow: 3840 + 1680 = 5520
    // totalHigh: 5760 + 2800 = 8560
    expect(result.totalLow).toBe(5520);
    expect(result.totalHigh).toBe(8560);
  });

  // ─── Test 11: Stairs ───
  it('adds stair costs', () => {
    const result = calculateDeckReplacementCost({
      deckLength: 16, deckLengthUnit: 'ft',
      deckWidth: 12, deckWidthUnit: 'ft',
      deckingMaterial: 'pressure-treated',
      substructureWork: 'none-boards-only',
      railingLength: 0, railingType: 'wood',
      stairCount: 4, region: 'national',
    });
    // Stairs low: 4 × $250 = $1000, high: 4 × $450 = $1800
    // totalLow: 3840 + 1000 = 4840
    // totalHigh: 5760 + 1800 = 7560
    expect(result.totalLow).toBe(4840);
    expect(result.totalHigh).toBe(7560);
  });

  // ─── Test 12: Northeast regional multiplier ───
  it('applies northeast regional multiplier to labor only', () => {
    const national = calculateDeckReplacementCost({
      deckLength: 16, deckLengthUnit: 'ft',
      deckWidth: 12, deckWidthUnit: 'ft',
      deckingMaterial: 'pressure-treated',
      substructureWork: 'none-boards-only',
      railingLength: 0, railingType: 'wood',
      stairCount: 0, region: 'national',
    });
    const northeast = calculateDeckReplacementCost({
      deckLength: 16, deckLengthUnit: 'ft',
      deckWidth: 12, deckWidthUnit: 'ft',
      deckingMaterial: 'pressure-treated',
      substructureWork: 'none-boards-only',
      railingLength: 0, railingType: 'wood',
      stairCount: 0, region: 'northeast',
    });
    // Labor low national: 192 × 8.25 = 1584. Northeast: 1584 × 1.20 = 1900.80
    // Material stays same: 1296 (low), demo stays same: 960
    // totalLow northeast: 960 + 1296 + 1900.80 = 4156.80
    expect(northeast.totalLow).toBeCloseTo(4156.80, 1);
    // Demo and material should be the same
    expect(northeast.demolitionCost).toBe(national.demolitionCost);
  });

  // ─── Test 13: South regional multiplier ───
  it('applies south regional multiplier to labor', () => {
    const result = calculateDeckReplacementCost({
      deckLength: 16, deckLengthUnit: 'ft',
      deckWidth: 12, deckWidthUnit: 'ft',
      deckingMaterial: 'pressure-treated',
      substructureWork: 'none-boards-only',
      railingLength: 0, railingType: 'wood',
      stairCount: 0, region: 'south',
    });
    // Labor low: 192 × 8.25 × 0.85 = 1346.40
    // totalLow: 960 + 1296 + 1346.40 = 3602.40
    expect(result.totalLow).toBeCloseTo(3602.40, 1);
  });

  // ─── Test 14: West Coast regional multiplier ───
  it('applies west-coast regional multiplier to labor', () => {
    const result = calculateDeckReplacementCost({
      deckLength: 16, deckLengthUnit: 'ft',
      deckWidth: 12, deckWidthUnit: 'ft',
      deckingMaterial: 'pressure-treated',
      substructureWork: 'none-boards-only',
      railingLength: 0, railingType: 'wood',
      stairCount: 0, region: 'west-coast',
    });
    // Labor low: 192 × 8.25 × 1.25 = 1980
    // totalLow: 960 + 1296 + 1980 = 4236
    expect(result.totalLow).toBe(4236);
  });

  // ─── Test 15: Zero dimensions returns zero ───
  it('returns zero for zero dimensions', () => {
    const result = calculateDeckReplacementCost({
      deckLength: 0, deckLengthUnit: 'ft',
      deckWidth: 12, deckWidthUnit: 'ft',
      deckingMaterial: 'composite',
      substructureWork: 'none-boards-only',
      railingLength: 0, railingType: 'wood',
      stairCount: 0, region: 'national',
    });
    expect(result.area).toBe(0);
    expect(result.demolitionCost).toBe(0);
    expect(result.totalLow).toBe(0);
    expect(result.totalHigh).toBe(0);
    expect(result.totalMid).toBe(0);
    expect(result.costPerSqFt).toBe(0);
  });

  // ─── Test 16: Metric inputs ───
  it('converts metric inputs correctly', () => {
    const result = calculateDeckReplacementCost({
      deckLength: 5,       // 5 m ≈ 16.40 ft
      deckLengthUnit: 'm',
      deckWidth: 3.6,      // 3.6 m ≈ 11.81 ft
      deckWidthUnit: 'm',
      deckingMaterial: 'pressure-treated',
      substructureWork: 'none-boards-only',
      railingLength: 0, railingType: 'wood',
      stairCount: 0, region: 'national',
    });
    // Area ≈ 16.40 × 11.81 ≈ 193.74 sq ft
    expect(result.area).toBeCloseTo(193.74, 0);
    expect(result.totalLow).toBeGreaterThan(3800);
  });

  // ─── Test 17: Output structure ───
  it('returns all expected output fields', () => {
    const result = calculateDeckReplacementCost({
      deckLength: 16, deckLengthUnit: 'ft',
      deckWidth: 12, deckWidthUnit: 'ft',
      deckingMaterial: 'composite',
      substructureWork: 'none-boards-only',
      railingLength: 0, railingType: 'wood',
      stairCount: 0, region: 'national',
    });
    expect(result).toHaveProperty('area');
    expect(result).toHaveProperty('demolitionCost');
    expect(result).toHaveProperty('deckingMaterialCost');
    expect(result).toHaveProperty('deckingLaborCost');
    expect(result).toHaveProperty('substructureCost');
    expect(result).toHaveProperty('railingCost');
    expect(result).toHaveProperty('stairCost');
    expect(result).toHaveProperty('totalLow');
    expect(result).toHaveProperty('totalHigh');
    expect(result).toHaveProperty('totalMid');
    expect(result).toHaveProperty('costPerSqFt');
    expect(result).toHaveProperty('materialComparison');
    expect(result).toHaveProperty('timeline');
  });

  // ─── Test 18: Material comparison has all 5 materials ───
  it('returns material comparison with all 5 decking materials', () => {
    const result = calculateDeckReplacementCost({
      deckLength: 16, deckLengthUnit: 'ft',
      deckWidth: 12, deckWidthUnit: 'ft',
      deckingMaterial: 'composite',
      substructureWork: 'none-boards-only',
      railingLength: 0, railingType: 'wood',
      stairCount: 0, region: 'national',
    });
    const comparison = result.materialComparison as Array<{ label: string; value: number }>;
    expect(comparison).toHaveLength(5);
    comparison.forEach(item => {
      expect(item.value).toBeGreaterThan(0);
      expect(item.label).toBeTruthy();
    });
    // Pressure-treated cheapest, tropical-hardwood most expensive
    const pt = comparison.find(c => c.label.includes('Pressure-Treated'));
    const th = comparison.find(c => c.label.includes('Tropical Hardwood'));
    expect(pt!.value).toBeLessThan(th!.value);
  });

  // ─── Test 19: Material cost ordering ───
  it('material costs increase: PT < cedar < composite < PVC < tropical', () => {
    const materials = ['pressure-treated', 'cedar', 'composite', 'pvc', 'tropical-hardwood'];
    const costs = materials.map(mat => {
      const r = calculateDeckReplacementCost({
        deckLength: 16, deckLengthUnit: 'ft', deckWidth: 12, deckWidthUnit: 'ft',
        deckingMaterial: mat, substructureWork: 'none-boards-only',
        railingLength: 0, railingType: 'wood', stairCount: 0, region: 'national',
      });
      return { material: mat, mid: r.totalMid as number };
    });
    for (let i = 0; i < costs.length - 1; i++) {
      expect(costs[i].mid).toBeLessThan(costs[i + 1].mid);
    }
  });

  // ─── Test 20: Timeline text returned ───
  it('returns appropriate timeline for each material', () => {
    const composite = calculateDeckReplacementCost({
      deckLength: 16, deckLengthUnit: 'ft', deckWidth: 12, deckWidthUnit: 'ft',
      deckingMaterial: 'composite', substructureWork: 'none-boards-only',
      railingLength: 0, railingType: 'wood', stairCount: 0, region: 'national',
    });
    const tropical = calculateDeckReplacementCost({
      deckLength: 16, deckLengthUnit: 'ft', deckWidth: 12, deckWidthUnit: 'ft',
      deckingMaterial: 'tropical-hardwood', substructureWork: 'none-boards-only',
      railingLength: 0, railingType: 'wood', stairCount: 0, region: 'national',
    });
    expect(typeof composite.timeline).toBe('string');
    expect(typeof tropical.timeline).toBe('string');
    expect(composite.timeline).not.toBe(tropical.timeline);
  });

  // ─── Test 21: Cost per sq ft accuracy ───
  it('calculates cost per sq ft as totalMid / area', () => {
    const result = calculateDeckReplacementCost({
      deckLength: 16, deckLengthUnit: 'ft',
      deckWidth: 12, deckWidthUnit: 'ft',
      deckingMaterial: 'pressure-treated',
      substructureWork: 'none-boards-only',
      railingLength: 0, railingType: 'wood',
      stairCount: 0, region: 'national',
    });
    // totalMid = 4800, area = 192
    // costPerSqFt = 4800 / 192 = 25
    expect(result.costPerSqFt).toBe(25);
  });

  // ─── Test 22: Combined scenario — composite, partial sub, wood railing, 4 stairs, national ───
  it('calculates full scenario: composite + partial sub + railing + stairs', () => {
    const result = calculateDeckReplacementCost({
      deckLength: 16, deckLengthUnit: 'ft',
      deckWidth: 12, deckWidthUnit: 'ft',
      deckingMaterial: 'composite',
      substructureWork: 'partial-repair',
      railingLength: 28, railingType: 'wood',
      stairCount: 4, region: 'national',
    });
    // Demo: 960
    // Material low: 2160, high: 3888
    // Labor low: 2640, high: 4752
    // Sub low: 192×5=960, high: 192×10=1920
    // Railing low: 28×20=560, high: 28×40=1120
    // Stairs low: 4×250=1000, high: 4×450=1800
    // totalLow: 960+2160+2640+960+560+1000 = 8280
    // totalHigh: 960+3888+4752+1920+1120+1800 = 14440
    expect(result.totalLow).toBe(8280);
    expect(result.totalHigh).toBe(14440);
    expect(result.totalMid).toBe(11360);
  });

  // ─── Test 23: Composite railing type ───
  it('adds composite railing cost', () => {
    const result = calculateDeckReplacementCost({
      deckLength: 16, deckLengthUnit: 'ft',
      deckWidth: 12, deckWidthUnit: 'ft',
      deckingMaterial: 'pressure-treated',
      substructureWork: 'none-boards-only',
      railingLength: 28, railingType: 'composite',
      stairCount: 0, region: 'national',
    });
    // Railing low: 28 × $35 = $980, high: 28 × $60 = $1680
    // totalLow: 3840 + 980 = 4820
    // totalHigh: 5760 + 1680 = 7440
    expect(result.totalLow).toBe(4820);
    expect(result.totalHigh).toBe(7440);
  });

  // ─── Test 24: Midwest regional multiplier ───
  it('applies midwest regional multiplier (0.90)', () => {
    const result = calculateDeckReplacementCost({
      deckLength: 16, deckLengthUnit: 'ft',
      deckWidth: 12, deckWidthUnit: 'ft',
      deckingMaterial: 'pressure-treated',
      substructureWork: 'none-boards-only',
      railingLength: 0, railingType: 'wood',
      stairCount: 0, region: 'midwest',
    });
    // Labor low: 192 × 8.25 × 0.90 = 1425.60
    // totalLow: 960 + 1296 + 1425.60 = 3681.60
    expect(result.totalLow).toBeCloseTo(3681.60, 1);
  });

  // ─── Test 25: Large deck 24×20 ───
  it('handles large 24×20 deck', () => {
    const result = calculateDeckReplacementCost({
      deckLength: 24, deckLengthUnit: 'ft',
      deckWidth: 20, deckWidthUnit: 'ft',
      deckingMaterial: 'composite',
      substructureWork: 'none-boards-only',
      railingLength: 0, railingType: 'wood',
      stairCount: 0, region: 'national',
    });
    // Area = 480 sq ft
    // Demo: 480 × 5 = 2400
    // Material low: 480 × 11.25 = 5400, high: 480 × 20.25 = 9720
    // Labor low: 480 × 13.75 = 6600, high: 480 × 24.75 = 11880
    // totalLow: 2400 + 5400 + 6600 = 14400
    // totalHigh: 2400 + 9720 + 11880 = 24000
    expect(result.area).toBe(480);
    expect(result.totalLow).toBe(14400);
    expect(result.totalHigh).toBe(24000);
  });
});
