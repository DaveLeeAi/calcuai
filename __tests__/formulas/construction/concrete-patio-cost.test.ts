import { calculateConcretePatioCost } from '@/lib/formulas/construction/concrete-patio-cost';

describe('calculateConcretePatioCost', () => {
  // ─── Test 1: Standard broom-finish 16×12, 4-inch, no demo, no extras, national ───
  it('calculates a 16×12 broom-finish patio at national average', () => {
    const result = calculateConcretePatioCost({
      length: 16,
      lengthUnit: 'ft',
      width: 12,
      widthUnit: 'ft',
      thickness: '4-inch',
      finishType: 'broom-finish',
      demolition: 'none',
      extras: 'none',
      region: 'national',
    });
    // Area = 192 sq ft
    // Material: 192 × $2.40 = $460.80 low, 192 × $4.80 = $921.60 high
    // Labor: 192 × $3.60 × 1.0 = $691.20 low, 192 × $7.20 × 1.0 = $1382.40 high
    // totalLow: 460.80 + 691.20 + 0 + 0 = 1152
    // totalHigh: 921.60 + 1382.40 + 0 + 0 = 2304
    expect(result.area).toBe(192);
    expect(result.totalLow).toBe(1152);
    expect(result.totalHigh).toBe(2304);
    expect(result.totalMid).toBe(1728);
  });

  // ─── Test 2: Stamped concrete ───
  it('calculates stamped concrete patio cost', () => {
    const result = calculateConcretePatioCost({
      length: 16, lengthUnit: 'ft', width: 12, widthUnit: 'ft',
      thickness: '4-inch', finishType: 'stamped',
      demolition: 'none', extras: 'none', region: 'national',
    });
    // Material: 192 × $4.80 = $921.60 low, 192 × $8.00 = $1536 high
    // Labor: 192 × $7.20 = $1382.40 low, 192 × $12.00 = $2304 high
    // totalLow: 921.60 + 1382.40 = 2304
    // totalHigh: 1536 + 2304 = 3840
    expect(result.totalLow).toBe(2304);
    expect(result.totalHigh).toBe(3840);
  });

  // ─── Test 3: Exposed aggregate ───
  it('calculates exposed aggregate patio cost', () => {
    const result = calculateConcretePatioCost({
      length: 16, lengthUnit: 'ft', width: 12, widthUnit: 'ft',
      thickness: '4-inch', finishType: 'exposed-aggregate',
      demolition: 'none', extras: 'none', region: 'national',
    });
    // Material: 192 × $4.00 = $768 low, 192 × $7.20 = $1382.40 high
    // Labor: 192 × $6.00 = $1152 low, 192 × $10.80 = $2073.60 high
    // totalLow: 768 + 1152 = 1920
    // totalHigh: 1382.40 + 2073.60 = 3456
    expect(result.totalLow).toBe(1920);
    expect(result.totalHigh).toBe(3456);
  });

  // ─── Test 4: Colored/stained ───
  it('calculates colored/stained patio cost', () => {
    const result = calculateConcretePatioCost({
      length: 16, lengthUnit: 'ft', width: 12, widthUnit: 'ft',
      thickness: '4-inch', finishType: 'colored-stained',
      demolition: 'none', extras: 'none', region: 'national',
    });
    // Material: 192 × $3.20 = $614.40 low, 192 × $6.40 = $1228.80 high
    // Labor: 192 × $4.80 = $921.60 low, 192 × $9.60 = $1843.20 high
    // totalLow: 614.40 + 921.60 = 1536
    // totalHigh: 1228.80 + 1843.20 = 3072
    expect(result.totalLow).toBe(1536);
    expect(result.totalHigh).toBe(3072);
  });

  // ─── Test 5: Polished ───
  it('calculates polished concrete patio cost', () => {
    const result = calculateConcretePatioCost({
      length: 16, lengthUnit: 'ft', width: 12, widthUnit: 'ft',
      thickness: '4-inch', finishType: 'polished',
      demolition: 'none', extras: 'none', region: 'national',
    });
    // Material: 192 × $4.00 = $768 low, 192 × $8.00 = $1536 high
    // Labor: 192 × $6.00 = $1152 low, 192 × $12.00 = $2304 high
    // totalLow: 768 + 1152 = 1920
    // totalHigh: 1536 + 2304 = 3840
    expect(result.totalLow).toBe(1920);
    expect(result.totalHigh).toBe(3840);
  });

  // ─── Test 6: 6-inch thickness adds $1/sqft to material ───
  it('6-inch thickness adds $1/sqft to material cost', () => {
    const thin = calculateConcretePatioCost({
      length: 16, lengthUnit: 'ft', width: 12, widthUnit: 'ft',
      thickness: '4-inch', finishType: 'broom-finish',
      demolition: 'none', extras: 'none', region: 'national',
    });
    const thick = calculateConcretePatioCost({
      length: 16, lengthUnit: 'ft', width: 12, widthUnit: 'ft',
      thickness: '6-inch', finishType: 'broom-finish',
      demolition: 'none', extras: 'none', region: 'national',
    });
    const thinMat = thin.materialCost as { low: number; high: number };
    const thickMat = thick.materialCost as { low: number; high: number };
    // 6-inch adds $1 × 192 = $192 to material cost
    expect(thickMat.low).toBe(thinMat.low + 192);
    expect(thickMat.high).toBe(thinMat.high + 192);
    // Labor unchanged
    const thinLab = thin.laborCost as { low: number; high: number };
    const thickLab = thick.laborCost as { low: number; high: number };
    expect(thickLab.low).toBe(thinLab.low);
    expect(thickLab.high).toBe(thinLab.high);
  });

  // ─── Test 7: Demolition cost ───
  it('adds demolition cost for remove-old-patio', () => {
    const noDemo = calculateConcretePatioCost({
      length: 16, lengthUnit: 'ft', width: 12, widthUnit: 'ft',
      thickness: '4-inch', finishType: 'broom-finish',
      demolition: 'none', extras: 'none', region: 'national',
    });
    const withDemo = calculateConcretePatioCost({
      length: 16, lengthUnit: 'ft', width: 12, widthUnit: 'ft',
      thickness: '4-inch', finishType: 'broom-finish',
      demolition: 'remove-old-patio', extras: 'none', region: 'national',
    });
    // Demo: low = 192 × $3 = $576, high = 192 × $6 = $1152
    // demoCost (midpoint) = (576 + 1152) / 2 = $864
    expect(withDemo.demoCost).toBe(864);
    expect((withDemo.totalLow as number)).toBe((noDemo.totalLow as number) + 576);
    expect((withDemo.totalHigh as number)).toBe((noDemo.totalHigh as number) + 1152);
  });

  // ─── Test 8: Extras — 1 step ───
  it('adds 1 step extra ($400)', () => {
    const noExtras = calculateConcretePatioCost({
      length: 16, lengthUnit: 'ft', width: 12, widthUnit: 'ft',
      thickness: '4-inch', finishType: 'broom-finish',
      demolition: 'none', extras: 'none', region: 'national',
    });
    const withStep = calculateConcretePatioCost({
      length: 16, lengthUnit: 'ft', width: 12, widthUnit: 'ft',
      thickness: '4-inch', finishType: 'broom-finish',
      demolition: 'none', extras: 'steps-1', region: 'national',
    });
    expect(withStep.extrasCost).toBe(400);
    expect((withStep.totalLow as number)).toBe((noExtras.totalLow as number) + 400);
    expect((withStep.totalHigh as number)).toBe((noExtras.totalHigh as number) + 400);
  });

  // ─── Test 9: Extras — 2 steps ───
  it('adds 2 steps extra ($750)', () => {
    const result = calculateConcretePatioCost({
      length: 16, lengthUnit: 'ft', width: 12, widthUnit: 'ft',
      thickness: '4-inch', finishType: 'broom-finish',
      demolition: 'none', extras: 'steps-2', region: 'national',
    });
    expect(result.extrasCost).toBe(750);
  });

  // ─── Test 10: Extras — seating wall ───
  it('adds seating wall extra ($1,500)', () => {
    const result = calculateConcretePatioCost({
      length: 16, lengthUnit: 'ft', width: 12, widthUnit: 'ft',
      thickness: '4-inch', finishType: 'broom-finish',
      demolition: 'none', extras: 'seating-wall', region: 'national',
    });
    expect(result.extrasCost).toBe(1500);
  });

  // ─── Test 11: Northeast region (1.20x labor) ───
  it('applies northeast regional multiplier to labor only', () => {
    const result = calculateConcretePatioCost({
      length: 16, lengthUnit: 'ft', width: 12, widthUnit: 'ft',
      thickness: '4-inch', finishType: 'broom-finish',
      demolition: 'none', extras: 'none', region: 'northeast',
    });
    // Labor: 192 × $3.60 × 1.20 = $829.44 low, 192 × $7.20 × 1.20 = $1658.88 high
    const laborCost = result.laborCost as { low: number; high: number };
    expect(laborCost.low).toBeCloseTo(829.44, 2);
    expect(laborCost.high).toBeCloseTo(1658.88, 2);
    // Material unchanged
    const materialCost = result.materialCost as { low: number; high: number };
    expect(materialCost.low).toBe(460.8);
    expect(materialCost.high).toBe(921.6);
  });

  // ─── Test 12: South region (0.85x labor) ───
  it('applies south regional multiplier to labor only', () => {
    const result = calculateConcretePatioCost({
      length: 16, lengthUnit: 'ft', width: 12, widthUnit: 'ft',
      thickness: '4-inch', finishType: 'broom-finish',
      demolition: 'none', extras: 'none', region: 'south',
    });
    // Labor: 192 × $3.60 × 0.85 = $587.52 low, 192 × $7.20 × 0.85 = $1175.04 high
    const laborCost = result.laborCost as { low: number; high: number };
    expect(laborCost.low).toBeCloseTo(587.52, 2);
    expect(laborCost.high).toBeCloseTo(1175.04, 2);
  });

  // ─── Test 13: West Coast region (1.25x labor) ───
  it('applies west coast regional multiplier', () => {
    const result = calculateConcretePatioCost({
      length: 16, lengthUnit: 'ft', width: 12, widthUnit: 'ft',
      thickness: '4-inch', finishType: 'broom-finish',
      demolition: 'none', extras: 'none', region: 'west-coast',
    });
    // Labor: 192 × $3.60 × 1.25 = $864 low, 192 × $7.20 × 1.25 = $1728 high
    const laborCost = result.laborCost as { low: number; high: number };
    expect(laborCost.low).toBe(864);
    expect(laborCost.high).toBe(1728);
  });

  // ─── Test 14: Zero dimensions ───
  it('returns zero for zero dimensions', () => {
    const result = calculateConcretePatioCost({
      length: 0, lengthUnit: 'ft', width: 12, widthUnit: 'ft',
      thickness: '4-inch', finishType: 'broom-finish',
      demolition: 'none', extras: 'none', region: 'national',
    });
    expect(result.area).toBe(0);
    expect(result.totalLow).toBe(0);
    expect(result.totalHigh).toBe(0);
    expect(result.costPerSqFt).toBe(0);
  });

  // ─── Test 15: Metric inputs ───
  it('converts metric inputs correctly', () => {
    const result = calculateConcretePatioCost({
      length: 5,       // 5 m ≈ 16.40 ft
      lengthUnit: 'm',
      width: 3.6,      // 3.6 m ≈ 11.81 ft
      widthUnit: 'm',
      thickness: '4-inch',
      finishType: 'broom-finish',
      demolition: 'none',
      extras: 'none',
      region: 'national',
    });
    // Area ≈ 16.40 × 11.81 ≈ 193.72 sq ft
    expect(result.area).toBeCloseTo(193.72, 0);
    expect((result.totalLow as number)).toBeGreaterThan(1000);
  });

  // ─── Test 16: Large patio 30×20 ───
  it('handles large 30×20 patio', () => {
    const result = calculateConcretePatioCost({
      length: 30, lengthUnit: 'ft', width: 20, widthUnit: 'ft',
      thickness: '4-inch', finishType: 'broom-finish',
      demolition: 'none', extras: 'none', region: 'national',
    });
    // Area = 600 sq ft
    // Material: 600 × $2.40 = $1440 low, 600 × $4.80 = $2880 high
    // Labor: 600 × $3.60 = $2160 low, 600 × $7.20 = $4320 high
    // totalLow: 1440 + 2160 = 3600
    // totalHigh: 2880 + 4320 = 7200
    expect(result.area).toBe(600);
    expect(result.totalLow).toBe(3600);
    expect(result.totalHigh).toBe(7200);
  });

  // ─── Test 17: Cost per sqft accuracy ───
  it('calculates cost per sqft correctly', () => {
    const result = calculateConcretePatioCost({
      length: 16, lengthUnit: 'ft', width: 12, widthUnit: 'ft',
      thickness: '4-inch', finishType: 'broom-finish',
      demolition: 'none', extras: 'none', region: 'national',
    });
    // totalMid = 1728, area = 192, costPerSqFt = 1728 / 192 = 9.0
    expect(result.costPerSqFt).toBe(9);
  });

  // ─── Test 18: Finish comparison structure ───
  it('returns finish comparison with all 5 finishes', () => {
    const result = calculateConcretePatioCost({
      length: 16, lengthUnit: 'ft', width: 12, widthUnit: 'ft',
      thickness: '4-inch', finishType: 'broom-finish',
      demolition: 'none', extras: 'none', region: 'national',
    });
    const comparison = result.finishComparison as Array<{ label: string; value: number }>;
    expect(comparison).toHaveLength(5);
    comparison.forEach(item => {
      expect(item.value).toBeGreaterThan(0);
      expect(item.label).toBeTruthy();
    });
  });

  // ─── Test 19: Broom cheapest, stamped/polished most expensive ───
  it('broom finish is cheapest', () => {
    const finishTypes = ['broom-finish', 'stamped', 'exposed-aggregate', 'colored-stained', 'polished'];
    const costs = finishTypes.map(ft => {
      const r = calculateConcretePatioCost({
        length: 16, lengthUnit: 'ft', width: 12, widthUnit: 'ft',
        thickness: '4-inch', finishType: ft,
        demolition: 'none', extras: 'none', region: 'national',
      });
      return { finishType: ft, mid: r.totalMid as number };
    });
    const broom = costs.find(c => c.finishType === 'broom-finish')!;
    const stamped = costs.find(c => c.finishType === 'stamped')!;
    expect(broom.mid).toBeLessThan(stamped.mid);
  });

  // ─── Test 20: Output structure ───
  it('returns all expected output fields', () => {
    const result = calculateConcretePatioCost({
      length: 16, lengthUnit: 'ft', width: 12, widthUnit: 'ft',
      thickness: '4-inch', finishType: 'broom-finish',
      demolition: 'none', extras: 'none', region: 'national',
    });
    expect(result).toHaveProperty('area');
    expect(result).toHaveProperty('materialCost');
    expect(result).toHaveProperty('laborCost');
    expect(result).toHaveProperty('demoCost');
    expect(result).toHaveProperty('extrasCost');
    expect(result).toHaveProperty('totalLow');
    expect(result).toHaveProperty('totalHigh');
    expect(result).toHaveProperty('totalMid');
    expect(result).toHaveProperty('costPerSqFt');
    expect(result).toHaveProperty('finishComparison');
    expect(result).toHaveProperty('timeline');
  });

  // ─── Test 21: Timeline text by finish type ───
  it('returns appropriate timeline for each finish', () => {
    const broom = calculateConcretePatioCost({
      length: 16, lengthUnit: 'ft', width: 12, widthUnit: 'ft',
      thickness: '4-inch', finishType: 'broom-finish',
      demolition: 'none', extras: 'none', region: 'national',
    });
    const polished = calculateConcretePatioCost({
      length: 16, lengthUnit: 'ft', width: 12, widthUnit: 'ft',
      thickness: '4-inch', finishType: 'polished',
      demolition: 'none', extras: 'none', region: 'national',
    });
    expect(typeof broom.timeline).toBe('string');
    expect(typeof polished.timeline).toBe('string');
    expect(broom.timeline).not.toBe(polished.timeline);
  });

  // ─── Test 22: Combination — stamped + 6-inch + demo + seating wall + northeast ───
  it('handles all options combined', () => {
    const result = calculateConcretePatioCost({
      length: 20, lengthUnit: 'ft', width: 15, widthUnit: 'ft',
      thickness: '6-inch', finishType: 'stamped',
      demolition: 'remove-old-patio', extras: 'seating-wall', region: 'northeast',
    });
    // Area = 300 sq ft
    // Material: 300 × ($4.80 + $1) = 300 × $5.80 = $1740 low, 300 × ($8 + $1) = 300 × $9 = $2700 high
    // Labor: 300 × $7.20 × 1.20 = $2592 low, 300 × $12.00 × 1.20 = $4320 high
    // Demo: 300 × $3 = $900 low, 300 × $6 = $1800 high
    // Extras: $1500
    // totalLow: 1740 + 2592 + 900 + 1500 = 6732
    // totalHigh: 2700 + 4320 + 1800 + 1500 = 10320
    expect(result.area).toBe(300);
    expect(result.totalLow).toBe(6732);
    expect(result.totalHigh).toBe(10320);
    expect(result.extrasCost).toBe(1500);
  });

  // ─── Test 23: Midwest region (0.90x labor) ───
  it('applies midwest regional multiplier', () => {
    const result = calculateConcretePatioCost({
      length: 16, lengthUnit: 'ft', width: 12, widthUnit: 'ft',
      thickness: '4-inch', finishType: 'broom-finish',
      demolition: 'none', extras: 'none', region: 'midwest',
    });
    // Labor: 192 × $3.60 × 0.90 = $622.08 low, 192 × $7.20 × 0.90 = $1244.16 high
    const laborCost = result.laborCost as { low: number; high: number };
    expect(laborCost.low).toBeCloseTo(622.08, 2);
    expect(laborCost.high).toBeCloseTo(1244.16, 2);
  });

  // ─── Test 24: Small patio 8×8 ───
  it('handles small 8×8 patio', () => {
    const result = calculateConcretePatioCost({
      length: 8, lengthUnit: 'ft', width: 8, widthUnit: 'ft',
      thickness: '4-inch', finishType: 'broom-finish',
      demolition: 'none', extras: 'none', region: 'national',
    });
    // Area = 64 sq ft
    // Material: 64 × $2.40 = $153.60 low, 64 × $4.80 = $307.20 high
    // Labor: 64 × $3.60 = $230.40 low, 64 × $7.20 = $460.80 high
    // totalLow: 153.60 + 230.40 = 384
    // totalHigh: 307.20 + 460.80 = 768
    expect(result.area).toBe(64);
    expect(result.totalLow).toBe(384);
    expect(result.totalHigh).toBe(768);
  });
});
