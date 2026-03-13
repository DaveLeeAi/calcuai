import { calculateFlooringInstallationCost } from '@/lib/formulas/construction/flooring-installation-cost';

describe('calculateFlooringInstallationCost', () => {
  // ─── Test 1: Standard hardwood 15×12, national ───
  it('calculates hardwood flooring for 15×12 room', () => {
    const result = calculateFlooringInstallationCost({
      roomLength: 15,
      roomLengthUnit: 'ft',
      roomWidth: 12,
      roomWidthUnit: 'ft',
      flooringType: 'hardwood',
      removeOldFloor: 'none',
      subfloorPrep: 'none',
      underlayment: 'none',
      wasteFactor: 10,
      region: 'national',
    });
    // Area = 180 sq ft, materialArea = 180 × 1.10 = 198
    // Material: 198 × $2.70 = $534.60 low, 198 × $8.10 = $1603.80 high
    // Labor: 198 × $3.30 = $653.40 low, 198 × $9.90 = $1960.20 high
    // Trim: 2 × (15 + 12) × $3 = $162
    // Total low: 534.60 + 653.40 + 0 + 0 + 0 + 162 = 1350
    // Total high: 1603.80 + 1960.20 + 0 + 0 + 0 + 162 = 3726
    expect(result.area).toBe(180);
    expect(result.materialArea).toBe(198);
    expect(result.totalLow).toBe(1350);
    expect(result.totalHigh).toBe(3726);
    expect(result.totalMid).toBe(2538);
  });

  // ─── Test 2: Laminate flooring ───
  it('calculates laminate flooring cost', () => {
    const result = calculateFlooringInstallationCost({
      roomLength: 15,
      roomLengthUnit: 'ft',
      roomWidth: 12,
      roomWidthUnit: 'ft',
      flooringType: 'laminate',
      removeOldFloor: 'none',
      subfloorPrep: 'none',
      underlayment: 'none',
      wasteFactor: 10,
      region: 'national',
    });
    // materialArea = 198
    // Material: 198 × $1.35 = $267.30 low, 198 × $3.60 = $712.80 high
    // Labor: 198 × $1.65 = $326.70 low, 198 × $4.40 = $871.20 high
    // Trim: 162
    // Total low: 267.30 + 326.70 + 162 = 756
    // Total high: 712.80 + 871.20 + 162 = 1746
    expect(result.totalLow).toBe(756);
    expect(result.totalHigh).toBe(1746);
  });

  // ─── Test 3: Vinyl plank flooring ───
  it('calculates vinyl plank flooring cost', () => {
    const result = calculateFlooringInstallationCost({
      roomLength: 15,
      roomLengthUnit: 'ft',
      roomWidth: 12,
      roomWidthUnit: 'ft',
      flooringType: 'vinyl-plank',
      removeOldFloor: 'none',
      subfloorPrep: 'none',
      underlayment: 'none',
      wasteFactor: 10,
      region: 'national',
    });
    // Material: 198 × $1.80 = $356.40 low, 198 × $4.50 = $891 high
    // Labor: 198 × $2.20 = $435.60 low, 198 × $5.50 = $1089 high
    // Trim: 162
    // Total low: 356.40 + 435.60 + 162 = 954
    // Total high: 891 + 1089 + 162 = 2142
    expect(result.totalLow).toBe(954);
    expect(result.totalHigh).toBe(2142);
  });

  // ─── Test 4: Tile flooring ───
  it('calculates tile flooring cost', () => {
    const result = calculateFlooringInstallationCost({
      roomLength: 15,
      roomLengthUnit: 'ft',
      roomWidth: 12,
      roomWidthUnit: 'ft',
      flooringType: 'tile',
      removeOldFloor: 'none',
      subfloorPrep: 'none',
      underlayment: 'none',
      wasteFactor: 10,
      region: 'national',
    });
    // Material: 198 × $3.15 = $623.70 low, 198 × $7.20 = $1425.60 high
    // Labor: 198 × $3.85 = $762.30 low, 198 × $8.80 = $1742.40 high
    // Trim: 162
    // Total low: 623.70 + 762.30 + 162 = 1548
    // Total high: 1425.60 + 1742.40 + 162 = 3330
    expect(result.totalLow).toBe(1548);
    expect(result.totalHigh).toBe(3330);
  });

  // ─── Test 5: Carpet flooring ───
  it('calculates carpet flooring cost', () => {
    const result = calculateFlooringInstallationCost({
      roomLength: 15,
      roomLengthUnit: 'ft',
      roomWidth: 12,
      roomWidthUnit: 'ft',
      flooringType: 'carpet',
      removeOldFloor: 'none',
      subfloorPrep: 'none',
      underlayment: 'none',
      wasteFactor: 10,
      region: 'national',
    });
    // Material: 198 × $1.35 = $267.30 low, 198 × $3.60 = $712.80 high
    // Labor: 198 × $1.65 = $326.70 low, 198 × $4.40 = $871.20 high
    // Trim: 162
    // Total low: 267.30 + 326.70 + 162 = 756
    // Total high: 712.80 + 871.20 + 162 = 1746
    expect(result.totalLow).toBe(756);
    expect(result.totalHigh).toBe(1746);
  });

  // ─── Test 6: Engineered hardwood flooring ───
  it('calculates engineered hardwood flooring cost', () => {
    const result = calculateFlooringInstallationCost({
      roomLength: 15,
      roomLengthUnit: 'ft',
      roomWidth: 12,
      roomWidthUnit: 'ft',
      flooringType: 'engineered-hardwood',
      removeOldFloor: 'none',
      subfloorPrep: 'none',
      underlayment: 'none',
      wasteFactor: 10,
      region: 'national',
    });
    // Material: 198 × $2.25 = $445.50 low, 198 × $6.30 = $1247.40 high
    // Labor: 198 × $2.75 = $544.50 low, 198 × $7.70 = $1524.60 high
    // Trim: 162
    // Total low: 445.50 + 544.50 + 162 = 1152
    // Total high: 1247.40 + 1524.60 + 162 = 2934
    expect(result.totalLow).toBe(1152);
    expect(result.totalHigh).toBe(2934);
  });

  // ─── Test 7: Carpet removal ───
  it('adds carpet removal cost using raw area', () => {
    const noRemoval = calculateFlooringInstallationCost({
      roomLength: 15, roomLengthUnit: 'ft', roomWidth: 12, roomWidthUnit: 'ft',
      flooringType: 'hardwood', removeOldFloor: 'none', subfloorPrep: 'none',
      underlayment: 'none', wasteFactor: 10, region: 'national',
    });
    const carpetRemoval = calculateFlooringInstallationCost({
      roomLength: 15, roomLengthUnit: 'ft', roomWidth: 12, roomWidthUnit: 'ft',
      flooringType: 'hardwood', removeOldFloor: 'carpet-removal', subfloorPrep: 'none',
      underlayment: 'none', wasteFactor: 10, region: 'national',
    });
    // Carpet removal: 180 × $1 = $180 low, 180 × $2 = $360 high
    expect((carpetRemoval.totalLow as number) - (noRemoval.totalLow as number)).toBe(180);
    expect((carpetRemoval.totalHigh as number) - (noRemoval.totalHigh as number)).toBe(360);
    expect(carpetRemoval.removalCost).toBe(270); // mid = (180+360)/2
  });

  // ─── Test 8: Tile removal (most expensive) ───
  it('adds tile removal cost', () => {
    const noRemoval = calculateFlooringInstallationCost({
      roomLength: 15, roomLengthUnit: 'ft', roomWidth: 12, roomWidthUnit: 'ft',
      flooringType: 'hardwood', removeOldFloor: 'none', subfloorPrep: 'none',
      underlayment: 'none', wasteFactor: 10, region: 'national',
    });
    const tileRemoval = calculateFlooringInstallationCost({
      roomLength: 15, roomLengthUnit: 'ft', roomWidth: 12, roomWidthUnit: 'ft',
      flooringType: 'hardwood', removeOldFloor: 'tile-removal', subfloorPrep: 'none',
      underlayment: 'none', wasteFactor: 10, region: 'national',
    });
    // Tile removal: 180 × $3 = $540 low, 180 × $5 = $900 high
    expect((tileRemoval.totalLow as number) - (noRemoval.totalLow as number)).toBe(540);
    expect((tileRemoval.totalHigh as number) - (noRemoval.totalHigh as number)).toBe(900);
  });

  // ─── Test 9: Hardwood removal ───
  it('adds hardwood removal cost', () => {
    const result = calculateFlooringInstallationCost({
      roomLength: 10, roomLengthUnit: 'ft', roomWidth: 10, roomWidthUnit: 'ft',
      flooringType: 'laminate', removeOldFloor: 'hardwood-removal', subfloorPrep: 'none',
      underlayment: 'none', wasteFactor: 10, region: 'national',
    });
    // Hardwood removal: 100 × $2 = $200 low, 100 × $4 = $400 high
    expect(result.removalCost).toBe(300); // mid
  });

  // ─── Test 10: Minor subfloor repair ───
  it('adds minor subfloor repair cost', () => {
    const noPrep = calculateFlooringInstallationCost({
      roomLength: 15, roomLengthUnit: 'ft', roomWidth: 12, roomWidthUnit: 'ft',
      flooringType: 'hardwood', removeOldFloor: 'none', subfloorPrep: 'none',
      underlayment: 'none', wasteFactor: 10, region: 'national',
    });
    const minorPrep = calculateFlooringInstallationCost({
      roomLength: 15, roomLengthUnit: 'ft', roomWidth: 12, roomWidthUnit: 'ft',
      flooringType: 'hardwood', removeOldFloor: 'none', subfloorPrep: 'minor-repair',
      underlayment: 'none', wasteFactor: 10, region: 'national',
    });
    // Minor: 180 × $1.50 = $270 low, 180 × $3.00 = $540 high
    expect((minorPrep.totalLow as number) - (noPrep.totalLow as number)).toBe(270);
    expect((minorPrep.totalHigh as number) - (noPrep.totalHigh as number)).toBe(540);
    expect(minorPrep.subfloorCost).toBe(405); // mid
  });

  // ─── Test 11: Full leveling subfloor prep ───
  it('adds full leveling subfloor cost', () => {
    const result = calculateFlooringInstallationCost({
      roomLength: 10, roomLengthUnit: 'ft', roomWidth: 10, roomWidthUnit: 'ft',
      flooringType: 'hardwood', removeOldFloor: 'none', subfloorPrep: 'full-leveling',
      underlayment: 'none', wasteFactor: 10, region: 'national',
    });
    // Full leveling: 100 × $3.00 = $300 low, 100 × $6.00 = $600 high
    expect(result.subfloorCost).toBe(450); // mid
  });

  // ─── Test 12: Standard underlayment ───
  it('adds standard underlayment cost', () => {
    const noUnder = calculateFlooringInstallationCost({
      roomLength: 15, roomLengthUnit: 'ft', roomWidth: 12, roomWidthUnit: 'ft',
      flooringType: 'hardwood', removeOldFloor: 'none', subfloorPrep: 'none',
      underlayment: 'none', wasteFactor: 10, region: 'national',
    });
    const stdUnder = calculateFlooringInstallationCost({
      roomLength: 15, roomLengthUnit: 'ft', roomWidth: 12, roomWidthUnit: 'ft',
      flooringType: 'hardwood', removeOldFloor: 'none', subfloorPrep: 'none',
      underlayment: 'standard', wasteFactor: 10, region: 'national',
    });
    // Standard: 180 × $0.50 = $90 low, 180 × $1.50 = $270 high
    expect((stdUnder.totalLow as number) - (noUnder.totalLow as number)).toBe(90);
    expect((stdUnder.totalHigh as number) - (noUnder.totalHigh as number)).toBe(270);
    expect(stdUnder.underlaymentCost).toBe(180); // mid
  });

  // ─── Test 13: Premium underlayment ───
  it('adds premium underlayment cost', () => {
    const result = calculateFlooringInstallationCost({
      roomLength: 10, roomLengthUnit: 'ft', roomWidth: 10, roomWidthUnit: 'ft',
      flooringType: 'hardwood', removeOldFloor: 'none', subfloorPrep: 'none',
      underlayment: 'premium', wasteFactor: 10, region: 'national',
    });
    // Premium: 100 × $1.50 = $150 low, 100 × $3.00 = $300 high
    expect(result.underlaymentCost).toBe(225); // mid
  });

  // ─── Test 14: Waste factor 5% ───
  it('applies 5% waste factor', () => {
    const result = calculateFlooringInstallationCost({
      roomLength: 10, roomLengthUnit: 'ft', roomWidth: 10, roomWidthUnit: 'ft',
      flooringType: 'hardwood', removeOldFloor: 'none', subfloorPrep: 'none',
      underlayment: 'none', wasteFactor: 5, region: 'national',
    });
    // area = 100, materialArea = 100 × 1.05 = 105
    expect(result.area).toBe(100);
    expect(result.materialArea).toBe(105);
  });

  // ─── Test 15: Waste factor 20% ───
  it('applies 20% waste factor', () => {
    const result = calculateFlooringInstallationCost({
      roomLength: 10, roomLengthUnit: 'ft', roomWidth: 10, roomWidthUnit: 'ft',
      flooringType: 'hardwood', removeOldFloor: 'none', subfloorPrep: 'none',
      underlayment: 'none', wasteFactor: 20, region: 'national',
    });
    // area = 100, materialArea = 100 × 1.20 = 120
    expect(result.materialArea).toBe(120);
  });

  // ─── Test 16: Northeast regional multiplier ───
  it('applies northeast regional multiplier to labor only', () => {
    const national = calculateFlooringInstallationCost({
      roomLength: 10, roomLengthUnit: 'ft', roomWidth: 10, roomWidthUnit: 'ft',
      flooringType: 'hardwood', removeOldFloor: 'none', subfloorPrep: 'none',
      underlayment: 'none', wasteFactor: 10, region: 'national',
    });
    const northeast = calculateFlooringInstallationCost({
      roomLength: 10, roomLengthUnit: 'ft', roomWidth: 10, roomWidthUnit: 'ft',
      flooringType: 'hardwood', removeOldFloor: 'none', subfloorPrep: 'none',
      underlayment: 'none', wasteFactor: 10, region: 'northeast',
    });
    // area=100, matArea=110, trim=2×(10+10)×3=120
    // National: mat low=110×2.70=297, lab low=110×3.30=363, total low=297+363+120=780
    // Northeast: mat low=297 (same), lab low=110×3.30×1.20=435.60, total low=297+435.60+120=852.60
    // Difference: labor diff = 110 × 3.30 × 0.20 = 72.60 low
    const diffLow = (northeast.totalLow as number) - (national.totalLow as number);
    expect(diffLow).toBeCloseTo(72.6, 1);
  });

  // ─── Test 17: South regional multiplier ───
  it('applies south regional multiplier (0.85) to labor only', () => {
    const result = calculateFlooringInstallationCost({
      roomLength: 10, roomLengthUnit: 'ft', roomWidth: 10, roomWidthUnit: 'ft',
      flooringType: 'hardwood', removeOldFloor: 'none', subfloorPrep: 'none',
      underlayment: 'none', wasteFactor: 10, region: 'south',
    });
    // matArea=110, trim=120
    // Material low: 110 × 2.70 = 297
    // Labor low: 110 × 3.30 × 0.85 = 308.55
    // Total low: 297 + 308.55 + 120 = 725.55
    expect(result.totalLow).toBe(725.55);
  });

  // ─── Test 18: Metric inputs ───
  it('converts metric inputs correctly', () => {
    const result = calculateFlooringInstallationCost({
      roomLength: 4.572,   // ~15 ft
      roomLengthUnit: 'm',
      roomWidth: 3.6576,   // ~12 ft
      roomWidthUnit: 'm',
      flooringType: 'hardwood',
      removeOldFloor: 'none',
      subfloorPrep: 'none',
      underlayment: 'none',
      wasteFactor: 10,
      region: 'national',
    });
    // 4.572m × 3.28084 ≈ 15.0 ft, 3.6576m × 3.28084 ≈ 12.0 ft
    // Area ≈ 180 sq ft
    expect(result.area).toBeCloseTo(180, 0);
  });

  // ─── Test 19: Zero dimensions ───
  it('returns zero for zero dimensions', () => {
    const result = calculateFlooringInstallationCost({
      roomLength: 0,
      roomLengthUnit: 'ft',
      roomWidth: 12,
      roomWidthUnit: 'ft',
      flooringType: 'hardwood',
      removeOldFloor: 'none',
      subfloorPrep: 'none',
      underlayment: 'none',
      wasteFactor: 10,
      region: 'national',
    });
    // Trim cost still applies: 2 × (0 + 12) × $3 = $72
    expect(result.area).toBe(0);
    expect(result.materialArea).toBe(0);
    expect(result.totalLow).toBe(72);
    expect(result.totalHigh).toBe(72);
    expect(result.totalMid).toBe(72);
    expect(result.costPerSqFt).toBe(0);
  });

  // ─── Test 20: Output structure ───
  it('returns all expected output fields', () => {
    const result = calculateFlooringInstallationCost({
      roomLength: 15, roomLengthUnit: 'ft', roomWidth: 12, roomWidthUnit: 'ft',
      flooringType: 'hardwood', removeOldFloor: 'none', subfloorPrep: 'none',
      underlayment: 'none', wasteFactor: 10, region: 'national',
    });
    expect(result).toHaveProperty('area');
    expect(result).toHaveProperty('materialArea');
    expect(result).toHaveProperty('materialCost');
    expect(result).toHaveProperty('laborCost');
    expect(result).toHaveProperty('removalCost');
    expect(result).toHaveProperty('subfloorCost');
    expect(result).toHaveProperty('underlaymentCost');
    expect(result).toHaveProperty('trimCost');
    expect(result).toHaveProperty('totalLow');
    expect(result).toHaveProperty('totalHigh');
    expect(result).toHaveProperty('totalMid');
    expect(result).toHaveProperty('costPerSqFt');
    expect(result).toHaveProperty('flooringComparison');
    expect(result).toHaveProperty('timeline');
  });

  // ─── Test 21: Flooring comparison structure ───
  it('returns flooring comparison with all 6 types', () => {
    const result = calculateFlooringInstallationCost({
      roomLength: 15, roomLengthUnit: 'ft', roomWidth: 12, roomWidthUnit: 'ft',
      flooringType: 'hardwood', removeOldFloor: 'none', subfloorPrep: 'none',
      underlayment: 'none', wasteFactor: 10, region: 'national',
    });
    const comparison = result.flooringComparison as Array<{ label: string; value: number }>;
    expect(comparison).toHaveLength(6);
    comparison.forEach(item => {
      expect(item.value).toBeGreaterThan(0);
      expect(item.label).toBeTruthy();
    });
    // Laminate/carpet should be cheapest, hardwood most expensive
    const laminate = comparison.find(c => c.label.includes('Laminate'));
    const hardwood = comparison.find(c => c.label.includes('Hardwood') && !c.label.includes('Engineered'));
    expect(laminate!.value).toBeLessThan(hardwood!.value);
  });

  // ─── Test 22: Cost per sq ft accuracy ───
  it('calculates cost per sq ft as totalMid / area', () => {
    const result = calculateFlooringInstallationCost({
      roomLength: 15, roomLengthUnit: 'ft', roomWidth: 12, roomWidthUnit: 'ft',
      flooringType: 'hardwood', removeOldFloor: 'none', subfloorPrep: 'none',
      underlayment: 'none', wasteFactor: 10, region: 'national',
    });
    const expected = parseFloat(((result.totalMid as number) / (result.area as number)).toFixed(2));
    expect(result.costPerSqFt).toBe(expected);
  });

  // ─── Test 23: Trim cost calculation ───
  it('calculates trim cost from perimeter', () => {
    const result = calculateFlooringInstallationCost({
      roomLength: 15, roomLengthUnit: 'ft', roomWidth: 12, roomWidthUnit: 'ft',
      flooringType: 'hardwood', removeOldFloor: 'none', subfloorPrep: 'none',
      underlayment: 'none', wasteFactor: 10, region: 'national',
    });
    // Perimeter: 2 × (15 + 12) = 54 linft, trimCost = 54 × $3 = $162
    expect(result.trimCost).toBe(162);
  });

  // ─── Test 24: Combined effects — removal + subfloor + underlayment + region ───
  it('combines all add-ons correctly', () => {
    const result = calculateFlooringInstallationCost({
      roomLength: 10, roomLengthUnit: 'ft', roomWidth: 10, roomWidthUnit: 'ft',
      flooringType: 'laminate', removeOldFloor: 'carpet-removal',
      subfloorPrep: 'minor-repair', underlayment: 'standard',
      wasteFactor: 10, region: 'northeast',
    });
    // area=100, matArea=110, trim=2×(10+10)×3=120
    // Material: 110 × $1.35 = $148.50 low, 110 × $3.60 = $396 high
    // Labor: 110 × $1.65 × 1.20 = $217.80 low, 110 × $4.40 × 1.20 = $580.80 high
    // Removal: 100 × $1 = $100 low, 100 × $2 = $200 high
    // Subfloor: 100 × $1.50 = $150 low, 100 × $3.00 = $300 high
    // Underlay: 100 × $0.50 = $50 low, 100 × $1.50 = $150 high
    // Total low: 148.50 + 217.80 + 100 + 150 + 50 + 120 = 786.30
    // Total high: 396 + 580.80 + 200 + 300 + 150 + 120 = 1746.80
    expect(result.totalLow).toBe(786.3);
    expect(result.totalHigh).toBe(1746.8);
  });

  // ─── Test 25: Timeline text returned ───
  it('returns appropriate timeline for each flooring type', () => {
    const hardwood = calculateFlooringInstallationCost({
      roomLength: 15, roomLengthUnit: 'ft', roomWidth: 12, roomWidthUnit: 'ft',
      flooringType: 'hardwood', removeOldFloor: 'none', subfloorPrep: 'none',
      underlayment: 'none', wasteFactor: 10, region: 'national',
    });
    const carpet = calculateFlooringInstallationCost({
      roomLength: 15, roomLengthUnit: 'ft', roomWidth: 12, roomWidthUnit: 'ft',
      flooringType: 'carpet', removeOldFloor: 'none', subfloorPrep: 'none',
      underlayment: 'none', wasteFactor: 10, region: 'national',
    });
    expect(typeof hardwood.timeline).toBe('string');
    expect(typeof carpet.timeline).toBe('string');
    expect(hardwood.timeline).not.toBe(carpet.timeline);
    expect((carpet.timeline as string)).toContain('1 day');
  });

  // ─── Test 26: Flooring cost ordering ───
  it('flooring costs order: carpet/laminate < vinyl < eng-hardwood < tile < hardwood', () => {
    const types = ['carpet', 'laminate', 'vinyl-plank', 'engineered-hardwood', 'tile', 'hardwood'];
    const costs = types.map(t => {
      const r = calculateFlooringInstallationCost({
        roomLength: 15, roomLengthUnit: 'ft', roomWidth: 12, roomWidthUnit: 'ft',
        flooringType: t, removeOldFloor: 'none', subfloorPrep: 'none',
        underlayment: 'none', wasteFactor: 10, region: 'national',
      });
      return { type: t, mid: r.totalMid as number };
    });
    // carpet and laminate have same rates, so mid is equal
    expect(costs[0].mid).toBe(costs[1].mid); // carpet = laminate
    expect(costs[1].mid).toBeLessThan(costs[2].mid); // laminate < vinyl
    expect(costs[2].mid).toBeLessThan(costs[3].mid); // vinyl < eng-hardwood
    // Hardwood ($6-$18 mid=$12) > tile ($7-$16 mid=$11.50) at midpoint
    expect(costs[3].mid).toBeLessThan(costs[4].mid); // eng-hardwood < tile
    expect(costs[4].mid).toBeLessThan(costs[5].mid); // tile < hardwood
  });
});
