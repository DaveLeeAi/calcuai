import { calculateInsulation } from '@/lib/formulas/construction/insulation';

describe('calculateInsulation', () => {
  // ─── Test 1: Standard attic batt R-30 (30×20 ft) ───
  it('calculates standard attic batt R-30 correctly', () => {
    const result = calculateInsulation({
      areaLength: 30,
      areaLengthUnit: 'ft',
      areaWidth: 20,
      areaWidthUnit: 'ft',
      insulationType: 'batt',
      rValue: 'R-30',
      applicationArea: 'attic',
      existingInsulation: false,
      existingRValue: 0,
    });
    // Area = 30 × 20 = 600 sq ft
    expect(result.totalArea).toBe(600);
    expect(result.materialUnit).toBe('batts');
    expect(result.insulationThickness).toBe(9.5);
    expect(result.effectiveRValue).toBe(30);
    // batts = ceil(600 / 31.25) = ceil(19.2) = 20
    expect(result.materialQuantity).toBe(20);
  });

  // ─── Test 2: Blown-in R-38 ───
  it('calculates blown-in R-38 correctly', () => {
    const result = calculateInsulation({
      areaLength: 30,
      areaLengthUnit: 'ft',
      areaWidth: 20,
      areaWidthUnit: 'ft',
      insulationType: 'blown',
      rValue: 'R-38',
      applicationArea: 'attic',
      existingInsulation: false,
      existingRValue: 0,
    });
    expect(result.materialUnit).toBe('bags');
    expect(result.insulationThickness).toBe(10.5);
    // bags = ceil(600 / 13) = ceil(46.15) = 47
    expect(result.materialQuantity).toBe(47);
  });

  // ─── Test 3: Spray foam R-19 ───
  it('calculates spray foam R-19 correctly', () => {
    const result = calculateInsulation({
      areaLength: 20,
      areaLengthUnit: 'ft',
      areaWidth: 10,
      areaWidthUnit: 'ft',
      insulationType: 'spray-foam',
      rValue: 'R-19',
      applicationArea: 'walls',
      existingInsulation: false,
      existingRValue: 0,
    });
    expect(result.totalArea).toBe(200);
    expect(result.materialUnit).toBe('board feet');
    expect(result.insulationThickness).toBe(3);
    // board feet = 200 × 3 / 12 = 50
    expect(result.materialQuantity).toBe(50);
  });

  // ─── Test 4: Rigid board R-13 ───
  it('calculates rigid board R-13 correctly', () => {
    const result = calculateInsulation({
      areaLength: 20,
      areaLengthUnit: 'ft',
      areaWidth: 10,
      areaWidthUnit: 'ft',
      insulationType: 'rigid-board',
      rValue: 'R-13',
      applicationArea: 'floor',
      existingInsulation: false,
      existingRValue: 0,
    });
    expect(result.totalArea).toBe(200);
    expect(result.materialUnit).toBe('sheets');
    expect(result.insulationThickness).toBe(2);
    // sheets = ceil(200 / 32) = ceil(6.25) = 7
    expect(result.materialQuantity).toBe(7);
  });

  // ─── Test 5: Unit conversion — meters ───
  it('converts meters to feet correctly', () => {
    const result = calculateInsulation({
      areaLength: 9.144,     // 30 ft
      areaLengthUnit: 'm',
      areaWidth: 6.096,      // 20 ft
      areaWidthUnit: 'm',
      insulationType: 'batt',
      rValue: 'R-30',
      applicationArea: 'attic',
      existingInsulation: false,
      existingRValue: 0,
    });
    expect(result.totalArea).toBeCloseTo(600, -1);
  });

  // ─── Test 6: Zero area returns zeros ───
  it('returns zeros for zero area', () => {
    const result = calculateInsulation({
      areaLength: 0,
      areaLengthUnit: 'ft',
      areaWidth: 20,
      areaWidthUnit: 'ft',
      insulationType: 'batt',
      rValue: 'R-30',
      applicationArea: 'attic',
      existingInsulation: false,
      existingRValue: 0,
    });
    expect(result.totalArea).toBe(0);
    expect(result.materialQuantity).toBe(0);
    expect(result.wasteRecommendation).toBe(0);
  });

  // ─── Test 7: Existing insulation adjustment ───
  it('adds existing R-value to effective R-value', () => {
    const result = calculateInsulation({
      areaLength: 20,
      areaLengthUnit: 'ft',
      areaWidth: 20,
      areaWidthUnit: 'ft',
      insulationType: 'batt',
      rValue: 'R-19',
      applicationArea: 'attic',
      existingInsulation: true,
      existingRValue: 11,
    });
    // effective = 19 + 11 = 30
    expect(result.effectiveRValue).toBe(30);
  });

  // ─── Test 8: No existing insulation — effective equals target ───
  it('returns target R-value when no existing insulation', () => {
    const result = calculateInsulation({
      areaLength: 20,
      areaLengthUnit: 'ft',
      areaWidth: 20,
      areaWidthUnit: 'ft',
      insulationType: 'batt',
      rValue: 'R-49',
      applicationArea: 'attic',
      existingInsulation: false,
      existingRValue: 0,
    });
    expect(result.effectiveRValue).toBe(49);
  });

  // ─── Test 9: Cost estimate ordering (low < mid < high) ───
  it('returns cost estimate with low < mid < high', () => {
    const result = calculateInsulation({
      areaLength: 30,
      areaLengthUnit: 'ft',
      areaWidth: 20,
      areaWidthUnit: 'ft',
      insulationType: 'batt',
      rValue: 'R-30',
      applicationArea: 'attic',
      existingInsulation: false,
      existingRValue: 0,
    });
    const cost = result.costEstimate as Array<{ label: string; value: number }>;
    expect(cost).toHaveLength(3);
    expect(cost[0].value).toBeLessThan(cost[1].value);
    expect(cost[1].value).toBeLessThan(cost[2].value);
  });

  // ─── Test 10: Various R-values produce different thicknesses ───
  it('produces different thicknesses for different R-values', () => {
    const r13 = calculateInsulation({
      areaLength: 20, areaLengthUnit: 'ft', areaWidth: 20, areaWidthUnit: 'ft',
      insulationType: 'batt', rValue: 'R-13', applicationArea: 'walls',
      existingInsulation: false, existingRValue: 0,
    });
    const r49 = calculateInsulation({
      areaLength: 20, areaLengthUnit: 'ft', areaWidth: 20, areaWidthUnit: 'ft',
      insulationType: 'batt', rValue: 'R-49', applicationArea: 'attic',
      existingInsulation: false, existingRValue: 0,
    });
    expect(r13.insulationThickness).toBeLessThan(r49.insulationThickness as number);
  });

  // ─── Test 11: Wall application ───
  it('works for wall application area', () => {
    const result = calculateInsulation({
      areaLength: 40,
      areaLengthUnit: 'ft',
      areaWidth: 8,
      areaWidthUnit: 'ft',
      insulationType: 'batt',
      rValue: 'R-13',
      applicationArea: 'walls',
      existingInsulation: false,
      existingRValue: 0,
    });
    // Area = 40 × 8 = 320 sq ft
    expect(result.totalArea).toBe(320);
    expect(result.insulationThickness).toBe(3.5);
  });

  // ─── Test 12: Small area ───
  it('handles small area correctly', () => {
    const result = calculateInsulation({
      areaLength: 5,
      areaLengthUnit: 'ft',
      areaWidth: 5,
      areaWidthUnit: 'ft',
      insulationType: 'rigid-board',
      rValue: 'R-13',
      applicationArea: 'crawlspace',
      existingInsulation: false,
      existingRValue: 0,
    });
    expect(result.totalArea).toBe(25);
    // sheets = ceil(25/32) = 1
    expect(result.materialQuantity).toBe(1);
  });

  // ─── Test 13: Large area (2000 sq ft) ───
  it('handles large area correctly', () => {
    const result = calculateInsulation({
      areaLength: 100,
      areaLengthUnit: 'ft',
      areaWidth: 20,
      areaWidthUnit: 'ft',
      insulationType: 'blown',
      rValue: 'R-30',
      applicationArea: 'attic',
      existingInsulation: false,
      existingRValue: 0,
    });
    expect(result.totalArea).toBe(2000);
    // bags = ceil(2000 / 17) = ceil(117.6) = 118
    expect(result.materialQuantity).toBe(118);
  });

  // ─── Test 14: Waste recommendation is 10% of area ───
  it('recommends 10% waste', () => {
    const result = calculateInsulation({
      areaLength: 30,
      areaLengthUnit: 'ft',
      areaWidth: 20,
      areaWidthUnit: 'ft',
      insulationType: 'batt',
      rValue: 'R-30',
      applicationArea: 'attic',
      existingInsulation: false,
      existingRValue: 0,
    });
    expect(result.wasteRecommendation).toBe(60); // 600 × 0.10
  });

  // ─── Test 15: Material quantity for each type ───
  it('returns correct material units for each insulation type', () => {
    const types = ['batt', 'blown', 'spray-foam', 'rigid-board'];
    const expectedUnits = ['batts', 'bags', 'board feet', 'sheets'];

    types.forEach((type, i) => {
      const result = calculateInsulation({
        areaLength: 20, areaLengthUnit: 'ft', areaWidth: 20, areaWidthUnit: 'ft',
        insulationType: type, rValue: 'R-30', applicationArea: 'attic',
        existingInsulation: false, existingRValue: 0,
      });
      expect(result.materialUnit).toBe(expectedUnits[i]);
    });
  });

  // ─── Test 16: Output structure contains all expected keys ───
  it('returns all expected output keys', () => {
    const result = calculateInsulation({
      areaLength: 30,
      areaLengthUnit: 'ft',
      areaWidth: 20,
      areaWidthUnit: 'ft',
      insulationType: 'batt',
      rValue: 'R-30',
      applicationArea: 'attic',
      existingInsulation: false,
      existingRValue: 0,
    });
    expect(result).toHaveProperty('totalArea');
    expect(result).toHaveProperty('effectiveRValue');
    expect(result).toHaveProperty('insulationThickness');
    expect(result).toHaveProperty('materialQuantity');
    expect(result).toHaveProperty('materialUnit');
    expect(result).toHaveProperty('costEstimate');
    expect(result).toHaveProperty('wasteRecommendation');
    expect(result).toHaveProperty('totalCoverage');
  });

  // ─── Test 17: Spray foam cost is higher than batt ───
  it('spray foam cost is higher than batt for same area', () => {
    const batt = calculateInsulation({
      areaLength: 30, areaLengthUnit: 'ft', areaWidth: 20, areaWidthUnit: 'ft',
      insulationType: 'batt', rValue: 'R-30', applicationArea: 'attic',
      existingInsulation: false, existingRValue: 0,
    });
    const spray = calculateInsulation({
      areaLength: 30, areaLengthUnit: 'ft', areaWidth: 20, areaWidthUnit: 'ft',
      insulationType: 'spray-foam', rValue: 'R-30', applicationArea: 'attic',
      existingInsulation: false, existingRValue: 0,
    });
    const battCost = (batt.costEstimate as Array<{ label: string; value: number }>)[1].value;
    const sprayCost = (spray.costEstimate as Array<{ label: string; value: number }>)[1].value;
    expect(sprayCost).toBeGreaterThan(battCost);
  });

  // ─── Test 18: R-49 batt thickness ───
  it('returns correct thickness for R-49 batt', () => {
    const result = calculateInsulation({
      areaLength: 20, areaLengthUnit: 'ft', areaWidth: 20, areaWidthUnit: 'ft',
      insulationType: 'batt', rValue: 'R-49', applicationArea: 'attic',
      existingInsulation: false, existingRValue: 0,
    });
    expect(result.insulationThickness).toBe(15.5);
  });
});
