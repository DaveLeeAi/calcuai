import { calculateInsulationCost } from '@/lib/formulas/construction/insulation-cost';

describe('calculateInsulationCost', () => {
  // ─── Test 1: Standard fiberglass batt 1000 sqft, attic, R-30, national, no removal ───
  it('calculates a standard 1000 sqft fiberglass batt attic job', () => {
    const result = calculateInsulationCost({
      area: 1000,
      areaUnit: 'sqft',
      insulationType: 'fiberglass-batt',
      applicationArea: 'attic',
      rValueTarget: 'R-30',
      removalOfOld: 'none',
      region: 'national',
    });
    // Material: 1000 × $1.50 × 1.0 = $1500 low, 1000 × $3.50 × 1.0 = $3500 high
    // Labor: 1000 × $0.75 × 1.0 × 1.0 = $750 low, 1000 × $1.50 × 1.0 × 1.0 = $1500 high
    // Removal: $0
    // TotalLow: 1500 + 750 + 0 = $2250
    // TotalHigh: 3500 + 1500 + 0 = $5000
    // TotalMid: (2250 + 5000) / 2 = $3625
    expect(result.area).toBe(1000);
    expect(result.totalLow).toBe(2250);
    expect(result.totalHigh).toBe(5000);
    expect(result.totalMid).toBe(3625);
    expect(result.removalCost).toBe(0);
    expect(result.costPerSqFt).toBe(3.63);
  });

  // ─── Test 2: Blown-in cellulose ───
  it('calculates blown-in cellulose attic insulation cost', () => {
    const result = calculateInsulationCost({
      area: 1000,
      areaUnit: 'sqft',
      insulationType: 'blown-cellulose',
      applicationArea: 'attic',
      rValueTarget: 'R-30',
      removalOfOld: 'none',
      region: 'national',
    });
    // Material: 1000 × $1.50 = $1500 low, 1000 × $3.00 = $3000 high
    // Labor: 1000 × $1.00 = $1000 low, 1000 × $2.00 = $2000 high
    // TotalLow: 1500 + 1000 = $2500
    // TotalHigh: 3000 + 2000 = $5000
    expect(result.totalLow).toBe(2500);
    expect(result.totalHigh).toBe(5000);
    expect(result.totalMid).toBe(3750);
  });

  // ─── Test 3: Open-cell spray foam ───
  it('calculates open-cell spray foam insulation cost', () => {
    const result = calculateInsulationCost({
      area: 1000,
      areaUnit: 'sqft',
      insulationType: 'spray-foam-open',
      applicationArea: 'attic',
      rValueTarget: 'R-30',
      removalOfOld: 'none',
      region: 'national',
    });
    // Material: 1000 × $2.50 = $2500 low, 1000 × $5.50 = $5500 high
    // Labor: 1000 × $1.50 = $1500 low, 1000 × $3.00 = $3000 high
    // TotalLow: 2500 + 1500 = $4000
    // TotalHigh: 5500 + 3000 = $8500
    expect(result.totalLow).toBe(4000);
    expect(result.totalHigh).toBe(8500);
    expect(result.totalMid).toBe(6250);
  });

  // ─── Test 4: Closed-cell spray foam ───
  it('calculates closed-cell spray foam insulation cost', () => {
    const result = calculateInsulationCost({
      area: 1000,
      areaUnit: 'sqft',
      insulationType: 'spray-foam-closed',
      applicationArea: 'attic',
      rValueTarget: 'R-30',
      removalOfOld: 'none',
      region: 'national',
    });
    // Material: 1000 × $4.00 = $4000 low, 1000 × $8.00 = $8000 high
    // Labor: 1000 × $2.00 = $2000 low, 1000 × $4.00 = $4000 high
    // TotalLow: 4000 + 2000 = $6000
    // TotalHigh: 8000 + 4000 = $12000
    expect(result.totalLow).toBe(6000);
    expect(result.totalHigh).toBe(12000);
    expect(result.totalMid).toBe(9000);
  });

  // ─── Test 5: Rigid board ───
  it('calculates rigid board insulation cost', () => {
    const result = calculateInsulationCost({
      area: 1000,
      areaUnit: 'sqft',
      insulationType: 'rigid-board',
      applicationArea: 'attic',
      rValueTarget: 'R-30',
      removalOfOld: 'none',
      region: 'national',
    });
    // Material: 1000 × $2.00 = $2000 low, 1000 × $4.50 = $4500 high
    // Labor: 1000 × $1.00 = $1000 low, 1000 × $2.00 = $2000 high
    // TotalLow: 2000 + 1000 = $3000
    // TotalHigh: 4500 + 2000 = $6500
    expect(result.totalLow).toBe(3000);
    expect(result.totalHigh).toBe(6500);
    expect(result.totalMid).toBe(4750);
  });

  // ─── Test 6: Mineral wool ───
  it('calculates mineral wool insulation cost', () => {
    const result = calculateInsulationCost({
      area: 1000,
      areaUnit: 'sqft',
      insulationType: 'mineral-wool',
      applicationArea: 'attic',
      rValueTarget: 'R-30',
      removalOfOld: 'none',
      region: 'national',
    });
    // Material: 1000 × $3.00 = $3000 low, 1000 × $5.50 = $5500 high
    // Labor: 1000 × $1.50 = $1500 low, 1000 × $2.50 = $2500 high
    // TotalLow: 3000 + 1500 = $4500
    // TotalHigh: 5500 + 2500 = $8000
    expect(result.totalLow).toBe(4500);
    expect(result.totalHigh).toBe(8000);
    expect(result.totalMid).toBe(6250);
  });

  // ─── Test 7: With old insulation removal ───
  it('adds removal cost when removalOfOld is yes', () => {
    const noRemoval = calculateInsulationCost({
      area: 1000, areaUnit: 'sqft',
      insulationType: 'fiberglass-batt', applicationArea: 'attic',
      rValueTarget: 'R-30', removalOfOld: 'none', region: 'national',
    });
    const withRemoval = calculateInsulationCost({
      area: 1000, areaUnit: 'sqft',
      insulationType: 'fiberglass-batt', applicationArea: 'attic',
      rValueTarget: 'R-30', removalOfOld: 'yes', region: 'national',
    });
    // Removal: 1000 × $1.00 = $1000 low, 1000 × $2.50 = $2500 high, mid = $1750
    expect(withRemoval.removalCost).toBe(1750);
    expect((withRemoval.totalLow as number)).toBe((noRemoval.totalLow as number) + 1000);
    expect((withRemoval.totalHigh as number)).toBe((noRemoval.totalHigh as number) + 2500);
  });

  // ─── Test 8: R-13 multiplier (0.80x material) ───
  it('applies R-13 multiplier to material cost', () => {
    const r30 = calculateInsulationCost({
      area: 1000, areaUnit: 'sqft',
      insulationType: 'fiberglass-batt', applicationArea: 'attic',
      rValueTarget: 'R-30', removalOfOld: 'none', region: 'national',
    });
    const r13 = calculateInsulationCost({
      area: 1000, areaUnit: 'sqft',
      insulationType: 'fiberglass-batt', applicationArea: 'attic',
      rValueTarget: 'R-13', removalOfOld: 'none', region: 'national',
    });
    // R-30: material mid = (1500+3500)/2 = 2500
    // R-13: material mid = (1000×1.50×0.80 + 1000×3.50×0.80)/2 = (1200+2800)/2 = 2000
    expect(r13.materialCost).toBe(2000);
    expect((r13.materialCost as number)).toBeLessThan((r30.materialCost as number));
    // Labor should be the same (R-value doesn't affect labor)
    expect(r13.laborCost).toBe(r30.laborCost);
  });

  // ─── Test 9: R-49 multiplier (1.30x material) ───
  it('applies R-49 multiplier to material cost', () => {
    const result = calculateInsulationCost({
      area: 1000, areaUnit: 'sqft',
      insulationType: 'fiberglass-batt', applicationArea: 'attic',
      rValueTarget: 'R-49', removalOfOld: 'none', region: 'national',
    });
    // Material low: 1000 × 1.50 × 1.30 = $1950
    // Material high: 1000 × 3.50 × 1.30 = $4550
    // Material mid: (1950 + 4550) / 2 = $3250
    expect(result.materialCost).toBe(3250);
  });

  // ─── Test 10: R-38 multiplier (1.15x material) ───
  it('applies R-38 multiplier to material cost', () => {
    const result = calculateInsulationCost({
      area: 1000, areaUnit: 'sqft',
      insulationType: 'blown-cellulose', applicationArea: 'attic',
      rValueTarget: 'R-38', removalOfOld: 'none', region: 'national',
    });
    // Material low: 1000 × 1.50 × 1.15 = $1725
    // Material high: 1000 × 3.00 × 1.15 = $3450
    // Material mid: (1725 + 3450) / 2 = $2587.50
    expect(result.materialCost).toBe(2587.5);
  });

  // ─── Test 11: Walls application area (+15% labor) ───
  it('applies walls application area multiplier (1.15x labor)', () => {
    const attic = calculateInsulationCost({
      area: 1000, areaUnit: 'sqft',
      insulationType: 'fiberglass-batt', applicationArea: 'attic',
      rValueTarget: 'R-30', removalOfOld: 'none', region: 'national',
    });
    const walls = calculateInsulationCost({
      area: 1000, areaUnit: 'sqft',
      insulationType: 'fiberglass-batt', applicationArea: 'walls',
      rValueTarget: 'R-30', removalOfOld: 'none', region: 'national',
    });
    // Attic labor mid: (750 + 1500) / 2 = 1125
    // Walls labor mid: (750×1.15 + 1500×1.15) / 2 = (862.5 + 1725) / 2 = 1293.75
    expect((walls.laborCost as number)).toBeCloseTo(1293.75, 1);
    expect((walls.laborCost as number)).toBeGreaterThan((attic.laborCost as number));
    // Material should be the same
    expect(walls.materialCost).toBe(attic.materialCost);
  });

  // ─── Test 12: Basement application area (+20% labor) ───
  it('applies basement application area multiplier (1.20x labor)', () => {
    const attic = calculateInsulationCost({
      area: 1000, areaUnit: 'sqft',
      insulationType: 'fiberglass-batt', applicationArea: 'attic',
      rValueTarget: 'R-30', removalOfOld: 'none', region: 'national',
    });
    const basement = calculateInsulationCost({
      area: 1000, areaUnit: 'sqft',
      insulationType: 'fiberglass-batt', applicationArea: 'basement',
      rValueTarget: 'R-30', removalOfOld: 'none', region: 'national',
    });
    // Basement labor mid: (750×1.20 + 1500×1.20) / 2 = (900 + 1800) / 2 = 1350
    expect((basement.laborCost as number)).toBeCloseTo(1350, 1);
    expect((basement.laborCost as number)).toBeGreaterThan((attic.laborCost as number));
  });

  // ─── Test 13: Crawlspace application area (+10% labor) ───
  it('applies crawlspace application area multiplier (1.10x labor)', () => {
    const result = calculateInsulationCost({
      area: 1000, areaUnit: 'sqft',
      insulationType: 'fiberglass-batt', applicationArea: 'crawlspace',
      rValueTarget: 'R-30', removalOfOld: 'none', region: 'national',
    });
    // Labor low: 1000 × 0.75 × 1.10 = $825
    // Labor high: 1000 × 1.50 × 1.10 = $1650
    // Labor mid: (825 + 1650) / 2 = $1237.50
    expect((result.laborCost as number)).toBeCloseTo(1237.5, 1);
  });

  // ─── Test 14: Northeast region multiplier (1.20x labor) ───
  it('applies northeast regional labor multiplier (1.20x)', () => {
    const national = calculateInsulationCost({
      area: 1000, areaUnit: 'sqft',
      insulationType: 'fiberglass-batt', applicationArea: 'attic',
      rValueTarget: 'R-30', removalOfOld: 'none', region: 'national',
    });
    const northeast = calculateInsulationCost({
      area: 1000, areaUnit: 'sqft',
      insulationType: 'fiberglass-batt', applicationArea: 'attic',
      rValueTarget: 'R-30', removalOfOld: 'none', region: 'northeast',
    });
    expect((northeast.laborCost as number)).toBeGreaterThan((national.laborCost as number));
    expect(northeast.materialCost).toBe(national.materialCost);
    // National labor mid: 1125; Northeast: 1125 × 1.20 = 1350
    expect((northeast.laborCost as number)).toBeCloseTo(1350, 1);
  });

  // ─── Test 15: South region multiplier (0.85x labor) ───
  it('applies south regional labor multiplier (0.85x)', () => {
    const national = calculateInsulationCost({
      area: 1000, areaUnit: 'sqft',
      insulationType: 'fiberglass-batt', applicationArea: 'attic',
      rValueTarget: 'R-30', removalOfOld: 'none', region: 'national',
    });
    const south = calculateInsulationCost({
      area: 1000, areaUnit: 'sqft',
      insulationType: 'fiberglass-batt', applicationArea: 'attic',
      rValueTarget: 'R-30', removalOfOld: 'none', region: 'south',
    });
    expect((south.laborCost as number)).toBeLessThan((national.laborCost as number));
    // National labor mid: 1125; South: (750×0.85 + 1500×0.85)/2 = (637.5 + 1275)/2 = 956.25
    expect((south.laborCost as number)).toBeCloseTo(956.25, 1);
  });

  // ─── Test 16: West Coast region multiplier (1.25x) ───
  it('applies west coast regional labor multiplier (1.25x)', () => {
    const result = calculateInsulationCost({
      area: 1000, areaUnit: 'sqft',
      insulationType: 'fiberglass-batt', applicationArea: 'attic',
      rValueTarget: 'R-30', removalOfOld: 'none', region: 'west-coast',
    });
    // Labor low: 1000 × 0.75 × 1.25 = $937.50
    // Labor high: 1000 × 1.50 × 1.25 = $1875
    // Labor mid: (937.5 + 1875) / 2 = $1406.25
    expect((result.laborCost as number)).toBeCloseTo(1406.25, 1);
  });

  // ─── Test 17: Zero area returns zero costs ───
  it('returns zero for zero area', () => {
    const result = calculateInsulationCost({
      area: 0, areaUnit: 'sqft',
      insulationType: 'fiberglass-batt', applicationArea: 'attic',
      rValueTarget: 'R-30', removalOfOld: 'none', region: 'national',
    });
    expect(result.area).toBe(0);
    expect(result.totalLow).toBe(0);
    expect(result.totalHigh).toBe(0);
    expect(result.totalMid).toBe(0);
    expect(result.costPerSqFt).toBe(0);
  });

  // ─── Test 18: Metric input conversion ───
  it('converts square meter inputs correctly', () => {
    const result = calculateInsulationCost({
      area: 100,               // 100 sq m ≈ 1076.39 sq ft
      areaUnit: 'sqm',
      insulationType: 'fiberglass-batt',
      applicationArea: 'attic',
      rValueTarget: 'R-30',
      removalOfOld: 'none',
      region: 'national',
    });
    // Area ≈ 1076.39 sq ft
    expect(result.area).toBeCloseTo(1076.39, 0);
    expect((result.totalLow as number)).toBeGreaterThan(0);
  });

  // ─── Test 19: Insulation comparison returns all 6 types ───
  it('returns insulation comparison with all 6 types', () => {
    const result = calculateInsulationCost({
      area: 1000, areaUnit: 'sqft',
      insulationType: 'fiberglass-batt', applicationArea: 'attic',
      rValueTarget: 'R-30', removalOfOld: 'none', region: 'national',
    });
    const comparison = result.insulationComparison as Array<{ label: string; value: number }>;
    expect(comparison).toHaveLength(6);
    comparison.forEach(item => {
      expect(item.value).toBeGreaterThan(0);
      expect(item.label).toBeTruthy();
    });
    // Fiberglass batt should be cheapest, closed-cell spray foam most expensive
    const fiberglass = comparison.find(c => c.label.includes('Fiberglass'));
    const closedCell = comparison.find(c => c.label.includes('Closed-Cell'));
    expect(fiberglass!.value).toBeLessThan(closedCell!.value);
  });

  // ─── Test 20: Fiberglass cheapest, closed-cell most expensive ───
  it('fiberglass batt is cheapest and closed-cell spray foam most expensive', () => {
    const types = ['fiberglass-batt', 'blown-cellulose', 'spray-foam-open', 'spray-foam-closed', 'rigid-board', 'mineral-wool'];
    const costs = types.map(t => {
      const r = calculateInsulationCost({
        area: 1000, areaUnit: 'sqft',
        insulationType: t, applicationArea: 'attic',
        rValueTarget: 'R-30', removalOfOld: 'none', region: 'national',
      });
      return { type: t, mid: r.totalMid as number };
    });
    const fiberglass = costs.find(c => c.type === 'fiberglass-batt')!;
    const closedCell = costs.find(c => c.type === 'spray-foam-closed')!;
    expect(fiberglass.mid).toBeLessThan(closedCell.mid);
    // Verify fiberglass is cheapest overall
    costs.forEach(c => {
      if (c.type !== 'fiberglass-batt') {
        expect(fiberglass.mid).toBeLessThanOrEqual(c.mid);
      }
    });
  });

  // ─── Test 21: Removal cost is the same regardless of insulation type ───
  it('removal cost is the same regardless of insulation type', () => {
    const fiberglassRemoval = calculateInsulationCost({
      area: 1000, areaUnit: 'sqft',
      insulationType: 'fiberglass-batt', applicationArea: 'attic',
      rValueTarget: 'R-30', removalOfOld: 'yes', region: 'national',
    });
    const sprayRemoval = calculateInsulationCost({
      area: 1000, areaUnit: 'sqft',
      insulationType: 'spray-foam-closed', applicationArea: 'attic',
      rValueTarget: 'R-30', removalOfOld: 'yes', region: 'national',
    });
    expect(fiberglassRemoval.removalCost).toBe(sprayRemoval.removalCost);
    // Removal: 1000 × ($1.00 + $2.50)/2 = $1750
    expect(fiberglassRemoval.removalCost).toBe(1750);
  });

  // ─── Test 22: Cost per sq ft accuracy ───
  it('calculates cost per sq ft correctly', () => {
    const result = calculateInsulationCost({
      area: 1000, areaUnit: 'sqft',
      insulationType: 'fiberglass-batt', applicationArea: 'attic',
      rValueTarget: 'R-30', removalOfOld: 'none', region: 'national',
    });
    // totalMid = 3625, area = 1000, costPerSqFt = 3.625 → 3.63
    const expectedCost = parseFloat(((result.totalMid as number) / (result.area as number)).toFixed(2));
    expect(result.costPerSqFt).toBe(expectedCost);
  });

  // ─── Test 23: Output structure has all expected fields ───
  it('returns all expected output fields', () => {
    const result = calculateInsulationCost({
      area: 1000, areaUnit: 'sqft',
      insulationType: 'fiberglass-batt', applicationArea: 'attic',
      rValueTarget: 'R-30', removalOfOld: 'none', region: 'national',
    });
    expect(result).toHaveProperty('area');
    expect(result).toHaveProperty('materialCost');
    expect(result).toHaveProperty('laborCost');
    expect(result).toHaveProperty('removalCost');
    expect(result).toHaveProperty('totalLow');
    expect(result).toHaveProperty('totalHigh');
    expect(result).toHaveProperty('totalMid');
    expect(result).toHaveProperty('costPerSqFt');
    expect(result).toHaveProperty('insulationComparison');
    expect(result).toHaveProperty('rValueAchieved');
    expect(result).toHaveProperty('timeline');
  });

  // ─── Test 24: R-value achieved text output ───
  it('returns correct R-value achieved text', () => {
    const r30 = calculateInsulationCost({
      area: 1000, areaUnit: 'sqft',
      insulationType: 'fiberglass-batt', applicationArea: 'attic',
      rValueTarget: 'R-30', removalOfOld: 'none', region: 'national',
    });
    expect(r30.rValueAchieved).toBe('R-30 (attic, standard recommendation)');

    const r49 = calculateInsulationCost({
      area: 1000, areaUnit: 'sqft',
      insulationType: 'fiberglass-batt', applicationArea: 'attic',
      rValueTarget: 'R-49', removalOfOld: 'none', region: 'national',
    });
    expect(r49.rValueAchieved).toBe('R-49 (attic, very cold climate / DOE Zone 5+)');
  });

  // ─── Test 25: Timeline output by insulation type ───
  it('returns correct timeline for each insulation type', () => {
    const batt = calculateInsulationCost({
      area: 1000, areaUnit: 'sqft',
      insulationType: 'fiberglass-batt', applicationArea: 'attic',
      rValueTarget: 'R-30', removalOfOld: 'none', region: 'national',
    });
    expect(batt.timeline).toBe('1\u20132 days');

    const blown = calculateInsulationCost({
      area: 1000, areaUnit: 'sqft',
      insulationType: 'blown-cellulose', applicationArea: 'attic',
      rValueTarget: 'R-30', removalOfOld: 'none', region: 'national',
    });
    expect(blown.timeline).toBe('1 day (machine-blown)');

    const closedCell = calculateInsulationCost({
      area: 1000, areaUnit: 'sqft',
      insulationType: 'spray-foam-closed', applicationArea: 'attic',
      rValueTarget: 'R-30', removalOfOld: 'none', region: 'national',
    });
    expect(closedCell.timeline).toBe('1\u20133 days (cure 24h)');
  });

  // ─── Test 26: Combined multipliers (walls + northeast + R-38) ───
  it('applies combined multipliers correctly (walls, northeast, R-38)', () => {
    const result = calculateInsulationCost({
      area: 500, areaUnit: 'sqft',
      insulationType: 'blown-cellulose', applicationArea: 'walls',
      rValueTarget: 'R-38', removalOfOld: 'none', region: 'northeast',
    });
    // Material low: 500 × 1.50 × 1.15 = $862.50
    // Material high: 500 × 3.00 × 1.15 = $1725
    // Material mid: (862.5 + 1725) / 2 = $1293.75
    expect(result.materialCost).toBe(1293.75);

    // Labor low: 500 × 1.00 × 1.15 × 1.20 = $690
    // Labor high: 500 × 2.00 × 1.15 × 1.20 = $1380
    // Labor mid: (690 + 1380) / 2 = $1035
    expect(result.laborCost).toBe(1035);
  });

  // ─── Test 27: Default inputs when values are missing ───
  it('uses default inputs when values are missing', () => {
    const result = calculateInsulationCost({});
    expect(result.area).toBe(0);
    expect(result.totalMid).toBe(0);
  });

  // ─── Test 28: Regional multiplier only affects labor, not materials ───
  it('regional multiplier changes labor but not material cost', () => {
    const national = calculateInsulationCost({
      area: 1000, areaUnit: 'sqft',
      insulationType: 'spray-foam-open', applicationArea: 'attic',
      rValueTarget: 'R-30', removalOfOld: 'none', region: 'national',
    });
    const northeast = calculateInsulationCost({
      area: 1000, areaUnit: 'sqft',
      insulationType: 'spray-foam-open', applicationArea: 'attic',
      rValueTarget: 'R-30', removalOfOld: 'none', region: 'northeast',
    });
    expect(national.materialCost).toBe(northeast.materialCost);
    expect((northeast.laborCost as number)).toBeCloseTo((national.laborCost as number) * 1.20, 1);
  });

  // ─── Test 29: Midwest region multiplier (0.90x) ───
  it('applies midwest regional labor multiplier (0.90x)', () => {
    const result = calculateInsulationCost({
      area: 1000, areaUnit: 'sqft',
      insulationType: 'fiberglass-batt', applicationArea: 'attic',
      rValueTarget: 'R-30', removalOfOld: 'none', region: 'midwest',
    });
    // Labor low: 1000 × 0.75 × 0.90 = $675
    // Labor high: 1000 × 1.50 × 0.90 = $1350
    // Labor mid: (675 + 1350) / 2 = $1012.50
    expect((result.laborCost as number)).toBeCloseTo(1012.5, 1);
  });

  // ─── Test 30: R-19 multiplier (0.90x material) ───
  it('applies R-19 multiplier to material cost', () => {
    const result = calculateInsulationCost({
      area: 1000, areaUnit: 'sqft',
      insulationType: 'fiberglass-batt', applicationArea: 'attic',
      rValueTarget: 'R-19', removalOfOld: 'none', region: 'national',
    });
    // Material low: 1000 × 1.50 × 0.90 = $1350
    // Material high: 1000 × 3.50 × 0.90 = $3150
    // Material mid: (1350 + 3150) / 2 = $2250
    expect(result.materialCost).toBe(2250);
  });

  // ─── Test 31: Small area (50 sqft minimum) ───
  it('handles small 50 sqft area correctly', () => {
    const result = calculateInsulationCost({
      area: 50, areaUnit: 'sqft',
      insulationType: 'fiberglass-batt', applicationArea: 'attic',
      rValueTarget: 'R-30', removalOfOld: 'none', region: 'national',
    });
    // Material: 50 × 1.50 = $75 low, 50 × 3.50 = $175 high
    // Labor: 50 × 0.75 = $37.50 low, 50 × 1.50 = $75 high
    // TotalLow: 75 + 37.5 = $112.50
    // TotalHigh: 175 + 75 = $250
    expect(result.area).toBe(50);
    expect(result.totalLow).toBe(112.5);
    expect(result.totalHigh).toBe(250);
  });

  // ─── Test 32: Large area (3000 sqft) ───
  it('handles large 3000 sqft area correctly', () => {
    const result = calculateInsulationCost({
      area: 3000, areaUnit: 'sqft',
      insulationType: 'blown-cellulose', applicationArea: 'attic',
      rValueTarget: 'R-30', removalOfOld: 'none', region: 'national',
    });
    // Material: 3000 × 1.50 = $4500 low, 3000 × 3.00 = $9000 high
    // Labor: 3000 × 1.00 = $3000 low, 3000 × 2.00 = $6000 high
    // TotalLow: 4500 + 3000 = $7500
    // TotalHigh: 9000 + 6000 = $15000
    expect(result.totalLow).toBe(7500);
    expect(result.totalHigh).toBe(15000);
    expect(result.totalMid).toBe(11250);
  });
});
