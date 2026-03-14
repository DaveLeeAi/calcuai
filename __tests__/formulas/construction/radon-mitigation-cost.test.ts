import { calculateRadonMitigationCost } from '../../../lib/formulas/construction/radon-mitigation-cost';

describe('calculateRadonMitigationCost', () => {
  // ─── Test 1: Default inputs ───
  // Defaults: slab-on-grade ($800–$1500), sub-slab-depressurization (1.0x),
  //           medium-1500-2500 (1.1x), interior-closet (1.0x), standard (1.0x), national (1.0x)
  it('calculates default radon mitigation at national average', () => {
    const result = calculateRadonMitigationCost({}) as Record<string, number | string | Array<{ label: string; value: number }>>;
    // adjustedLow: 800×1.0×1.1×1.0×1.0=880, adjustedHigh: 1500×1.0×1.1×1.0×1.0=1650
    // equipLow: 880×0.45=396, laborLow: 880×0.55×1.0=484
    // totalLow: 396+484=880
    // equipHigh: 1650×0.45=742.5, laborHigh: 1650×0.55×1.0=907.5
    // totalHigh: 742.5+907.5=1650
    expect(result.totalLow).toBeCloseTo(880, 0);
    expect(result.totalHigh).toBeCloseTo(1650, 0);
    expect(result.totalMid).toBeCloseTo(1265, 0);
    expect(result.timeline).toBe('4-8 hours');
    expect(result.annualFanCost).toBeTruthy();
  });

  // ─── Test 2: All required output fields present ───
  it('returns all expected output fields', () => {
    const result = calculateRadonMitigationCost({
      foundationType: 'slab-on-grade',
      mitigationMethod: 'sub-slab-depressurization',
      homeSize: 'medium-1500-2500',
      pipingRoute: 'interior-closet',
      fanType: 'standard',
      region: 'national',
    });
    expect(result).toHaveProperty('equipmentCost');
    expect(result).toHaveProperty('laborCost');
    expect(result).toHaveProperty('subtotalLow');
    expect(result).toHaveProperty('subtotalHigh');
    expect(result).toHaveProperty('subtotal');
    expect(result).toHaveProperty('totalLow');
    expect(result).toHaveProperty('totalHigh');
    expect(result).toHaveProperty('totalMid');
    expect(result).toHaveProperty('methodComparison');
    expect(result).toHaveProperty('annualFanCost');
    expect(result).toHaveProperty('timeline');
  });

  // ─── Test 3: Basement-unfinished foundation ($900–$1800 base) ───
  it('calculates basement-unfinished foundation correctly', () => {
    const result = calculateRadonMitigationCost({
      foundationType: 'basement-unfinished',
      mitigationMethod: 'sub-slab-depressurization',
      homeSize: 'small-under-1500',
      pipingRoute: 'interior-closet',
      fanType: 'standard',
      region: 'national',
    }) as Record<string, number | string | Array<{ label: string; value: number }>>;
    // adjustedLow: 900×1.0×1.0×1.0×1.0=900, adjustedHigh: 1800
    // totalLow: 900 (equip+labor=full adjusted), totalHigh: 1800
    expect(result.totalLow).toBeCloseTo(900, 0);
    expect(result.totalHigh).toBeCloseTo(1800, 0);
  });

  // ─── Test 4: Finished basement foundation ($1200–$2500 base) ───
  it('calculates basement-finished foundation correctly', () => {
    const result = calculateRadonMitigationCost({
      foundationType: 'basement-finished',
      mitigationMethod: 'sub-slab-depressurization',
      homeSize: 'small-under-1500',
      pipingRoute: 'interior-closet',
      fanType: 'standard',
      region: 'national',
    }) as Record<string, number | string | Array<{ label: string; value: number }>>;
    // adjustedLow: 1200, adjustedHigh: 2500
    expect(result.totalLow).toBeCloseTo(1200, 0);
    expect(result.totalHigh).toBeCloseTo(2500, 0);
  });

  // ─── Test 5: Crawl space foundation ($1000–$2000 base) ───
  it('calculates crawl-space foundation correctly', () => {
    const result = calculateRadonMitigationCost({
      foundationType: 'crawl-space',
      mitigationMethod: 'sub-slab-depressurization',
      homeSize: 'small-under-1500',
      pipingRoute: 'interior-closet',
      fanType: 'standard',
      region: 'national',
    }) as Record<string, number | string | Array<{ label: string; value: number }>>;
    expect(result.totalLow).toBeCloseTo(1000, 0);
    expect(result.totalHigh).toBeCloseTo(2000, 0);
  });

  // ─── Test 6: Mixed foundation ($1500–$3000 base) ───
  it('calculates mixed-foundation correctly', () => {
    const result = calculateRadonMitigationCost({
      foundationType: 'mixed-foundation',
      mitigationMethod: 'sub-slab-depressurization',
      homeSize: 'small-under-1500',
      pipingRoute: 'interior-closet',
      fanType: 'standard',
      region: 'national',
    }) as Record<string, number | string | Array<{ label: string; value: number }>>;
    expect(result.totalLow).toBeCloseTo(1500, 0);
    expect(result.totalHigh).toBeCloseTo(3000, 0);
  });

  // ─── Test 7: Sub-membrane-depressurization method (1.10x) ───
  it('applies sub-membrane-depressurization method multiplier (1.10x)', () => {
    const ssd = calculateRadonMitigationCost({
      foundationType: 'slab-on-grade',
      mitigationMethod: 'sub-slab-depressurization',
      homeSize: 'small-under-1500',
      pipingRoute: 'interior-closet',
      fanType: 'standard',
      region: 'national',
    }) as Record<string, number>;
    const smd = calculateRadonMitigationCost({
      foundationType: 'slab-on-grade',
      mitigationMethod: 'sub-membrane-depressurization',
      homeSize: 'small-under-1500',
      pipingRoute: 'interior-closet',
      fanType: 'standard',
      region: 'national',
    }) as Record<string, number>;
    // SSD baseline: 800–1500
    // SMD: 800×1.1=880–1500×1.1=1650
    expect(smd.totalLow).toBeCloseTo(880, 0);
    expect(smd.totalHigh).toBeCloseTo(1650, 0);
    expect(smd.totalLow).toBeGreaterThan(ssd.totalLow);
  });

  // ─── Test 8: Heat recovery ventilator method (1.75x) ───
  it('applies heat-recovery-ventilator method multiplier (1.75x)', () => {
    const result = calculateRadonMitigationCost({
      foundationType: 'slab-on-grade',
      mitigationMethod: 'heat-recovery-ventilator',
      homeSize: 'small-under-1500',
      pipingRoute: 'interior-closet',
      fanType: 'standard',
      region: 'national',
    }) as Record<string, number>;
    // adjustedLow: 800×1.75=1400, adjustedHigh: 1500×1.75=2625
    expect(result.totalLow).toBeCloseTo(1400, 0);
    expect(result.totalHigh).toBeCloseTo(2625, 0);
  });

  // ─── Test 9: Large home size multiplier (1.35x) ───
  it('applies large home size multiplier (1.35x)', () => {
    const small = calculateRadonMitigationCost({
      foundationType: 'slab-on-grade',
      mitigationMethod: 'sub-slab-depressurization',
      homeSize: 'small-under-1500',
      pipingRoute: 'interior-closet',
      fanType: 'standard',
      region: 'national',
    }) as Record<string, number>;
    const large = calculateRadonMitigationCost({
      foundationType: 'slab-on-grade',
      mitigationMethod: 'sub-slab-depressurization',
      homeSize: 'large-over-3500',
      pipingRoute: 'interior-closet',
      fanType: 'standard',
      region: 'national',
    }) as Record<string, number>;
    // Small: 800–1500, Large: 800×1.35=1080–1500×1.35=2025
    expect(large.totalLow).toBeCloseTo(1080, 0);
    expect(large.totalHigh).toBeCloseTo(2025, 0);
    expect(large.totalLow).toBeGreaterThan(small.totalLow);
  });

  // ─── Test 10: Exterior wall piping route (1.10x) ───
  it('applies exterior wall piping multiplier (1.10x)', () => {
    const interior = calculateRadonMitigationCost({
      foundationType: 'slab-on-grade',
      mitigationMethod: 'sub-slab-depressurization',
      homeSize: 'small-under-1500',
      pipingRoute: 'interior-closet',
      fanType: 'standard',
      region: 'national',
    }) as Record<string, number>;
    const exterior = calculateRadonMitigationCost({
      foundationType: 'slab-on-grade',
      mitigationMethod: 'sub-slab-depressurization',
      homeSize: 'small-under-1500',
      pipingRoute: 'exterior-wall',
      fanType: 'standard',
      region: 'national',
    }) as Record<string, number>;
    // exterior: 800×1.1=880–1500×1.1=1650
    expect(exterior.totalLow).toBeCloseTo(880, 0);
    expect(exterior.totalHigh).toBeCloseTo(1650, 0);
    expect(exterior.totalLow).toBeGreaterThan(interior.totalLow);
  });

  // ─── Test 11: Garage route piping (0.95x) ───
  it('applies garage route piping multiplier (0.95x)', () => {
    const result = calculateRadonMitigationCost({
      foundationType: 'slab-on-grade',
      mitigationMethod: 'sub-slab-depressurization',
      homeSize: 'small-under-1500',
      pipingRoute: 'garage-route',
      fanType: 'standard',
      region: 'national',
    }) as Record<string, number>;
    // garage: 800×0.95=760–1500×0.95=1425
    expect(result.totalLow).toBeCloseTo(760, 0);
    expect(result.totalHigh).toBeCloseTo(1425, 0);
  });

  // ─── Test 12: High-suction fan (1.15x) ───
  it('applies high-suction fan multiplier (1.15x)', () => {
    const standard = calculateRadonMitigationCost({
      foundationType: 'slab-on-grade',
      mitigationMethod: 'sub-slab-depressurization',
      homeSize: 'small-under-1500',
      pipingRoute: 'interior-closet',
      fanType: 'standard',
      region: 'national',
    }) as Record<string, number>;
    const highSuction = calculateRadonMitigationCost({
      foundationType: 'slab-on-grade',
      mitigationMethod: 'sub-slab-depressurization',
      homeSize: 'small-under-1500',
      pipingRoute: 'interior-closet',
      fanType: 'high-suction',
      region: 'national',
    }) as Record<string, number>;
    // high-suction: 800×1.15=920–1500×1.15=1725
    expect(highSuction.totalLow).toBeCloseTo(920, 0);
    expect(highSuction.totalHigh).toBeCloseTo(1725, 0);
    expect(highSuction.totalLow).toBeGreaterThan(standard.totalLow);
  });

  // ─── Test 13: Ultra-quiet fan (1.25x) ───
  it('applies ultra-quiet fan multiplier (1.25x)', () => {
    const result = calculateRadonMitigationCost({
      foundationType: 'slab-on-grade',
      mitigationMethod: 'sub-slab-depressurization',
      homeSize: 'small-under-1500',
      pipingRoute: 'interior-closet',
      fanType: 'ultra-quiet',
      region: 'national',
    }) as Record<string, number>;
    // ultra-quiet: 800×1.25=1000–1500×1.25=1875
    expect(result.totalLow).toBeCloseTo(1000, 0);
    expect(result.totalHigh).toBeCloseTo(1875, 0);
  });

  // ─── Test 14: Northeast region (1.20x labor, 55% of adjusted) ───
  it('applies northeast regional labor multiplier (1.20x)', () => {
    const national = calculateRadonMitigationCost({
      foundationType: 'slab-on-grade',
      mitigationMethod: 'sub-slab-depressurization',
      homeSize: 'small-under-1500',
      pipingRoute: 'interior-closet',
      fanType: 'standard',
      region: 'national',
    }) as Record<string, number>;
    const northeast = calculateRadonMitigationCost({
      foundationType: 'slab-on-grade',
      mitigationMethod: 'sub-slab-depressurization',
      homeSize: 'small-under-1500',
      pipingRoute: 'interior-closet',
      fanType: 'standard',
      region: 'northeast',
    }) as Record<string, number>;
    // national: equip=360 (45%), labor=440 (55%), total=800
    // northeast: equip=360 (same), labor=440×1.20=528, total=888
    expect(northeast.totalLow).toBeCloseTo(888, 0); // 360+528
    expect(northeast.laborCost).toBeGreaterThan(national.laborCost);
  });

  // ─── Test 15: West Coast region (1.25x labor) ───
  it('applies west coast regional labor multiplier (1.25x)', () => {
    const result = calculateRadonMitigationCost({
      foundationType: 'slab-on-grade',
      mitigationMethod: 'sub-slab-depressurization',
      homeSize: 'small-under-1500',
      pipingRoute: 'interior-closet',
      fanType: 'standard',
      region: 'west-coast',
    }) as Record<string, number>;
    // equip: 800×0.45=360, labor: 800×0.55×1.25=550, total: 910
    expect(result.totalLow).toBeCloseTo(910, 0);
  });

  // ─── Test 16: South region (0.85x labor) ───
  it('applies south regional labor multiplier (0.85x)', () => {
    const result = calculateRadonMitigationCost({
      foundationType: 'slab-on-grade',
      mitigationMethod: 'sub-slab-depressurization',
      homeSize: 'small-under-1500',
      pipingRoute: 'interior-closet',
      fanType: 'standard',
      region: 'south',
    }) as Record<string, number>;
    // equip: 360, labor: 800×0.55×0.85=374, total: 734
    expect(result.totalLow).toBeCloseTo(734, 0);
  });

  // ─── Test 17: Midwest region (0.90x labor) ───
  it('applies midwest regional labor multiplier (0.90x)', () => {
    const result = calculateRadonMitigationCost({
      foundationType: 'slab-on-grade',
      mitigationMethod: 'sub-slab-depressurization',
      homeSize: 'small-under-1500',
      pipingRoute: 'interior-closet',
      fanType: 'standard',
      region: 'midwest',
    }) as Record<string, number>;
    // equip: 360, labor: 800×0.55×0.90=396, total: 756
    expect(result.totalLow).toBeCloseTo(756, 0);
  });

  // ─── Test 18: Mid-Atlantic region (1.15x labor) ───
  it('applies mid-atlantic regional labor multiplier (1.15x)', () => {
    const result = calculateRadonMitigationCost({
      foundationType: 'slab-on-grade',
      mitigationMethod: 'sub-slab-depressurization',
      homeSize: 'small-under-1500',
      pipingRoute: 'interior-closet',
      fanType: 'standard',
      region: 'mid-atlantic',
    }) as Record<string, number>;
    // equip: 360, labor: 800×0.55×1.15=506, total: 866
    expect(result.totalLow).toBeCloseTo(866, 0);
  });

  // ─── Test 19: Mountain West region (0.95x labor) ───
  it('applies mountain-west regional labor multiplier (0.95x)', () => {
    const result = calculateRadonMitigationCost({
      foundationType: 'slab-on-grade',
      mitigationMethod: 'sub-slab-depressurization',
      homeSize: 'small-under-1500',
      pipingRoute: 'interior-closet',
      fanType: 'standard',
      region: 'mountain-west',
    }) as Record<string, number>;
    // equip: 360, labor: 800×0.55×0.95=418, total: 778
    expect(result.totalLow).toBeCloseTo(778, 0);
  });

  // ─── Test 20: Method comparison array structure ───
  it('returns methodComparison with all 5 methods', () => {
    const result = calculateRadonMitigationCost({
      foundationType: 'slab-on-grade',
      mitigationMethod: 'sub-slab-depressurization',
      homeSize: 'medium-1500-2500',
      pipingRoute: 'interior-closet',
      fanType: 'standard',
      region: 'national',
    });
    const comparison = result.methodComparison as Array<{ label: string; value: number }>;
    expect(comparison).toHaveLength(5);
    comparison.forEach(item => {
      expect(item.value).toBeGreaterThan(0);
      expect(item.label).toBeTruthy();
    });
    // SSD should be cheapest, HRV most expensive
    const ssd = comparison.find(c => c.label.includes('SSD') || c.label.includes('Sub-Slab'));
    const hrv = comparison.find(c => c.label.includes('HRV') || c.label.includes('Heat Recovery'));
    expect(ssd!.value).toBeLessThan(hrv!.value);
  });

  // ─── Test 21: Equipment cost is 45% of adjusted base ───
  it('calculates equipment cost as 45% of adjusted base (mid-point)', () => {
    const result = calculateRadonMitigationCost({
      foundationType: 'slab-on-grade',
      mitigationMethod: 'sub-slab-depressurization',
      homeSize: 'small-under-1500',
      pipingRoute: 'interior-closet',
      fanType: 'standard',
      region: 'national',
    }) as Record<string, number>;
    // adjustedMid: (800+1500)/2=1150
    // equipMid: 1150×0.45=517.5
    expect(result.equipmentCost).toBeCloseTo(517.5, 0);
  });

  // ─── Test 22: totalMid = (totalLow + totalHigh) / 2 ───
  it('totalMid equals average of totalLow and totalHigh', () => {
    const result = calculateRadonMitigationCost({
      foundationType: 'basement-finished',
      mitigationMethod: 'drain-tile-suction',
      homeSize: 'standard-2500-3500',
      pipingRoute: 'exterior-wall',
      fanType: 'high-suction',
      region: 'northeast',
    }) as Record<string, number>;
    expect(result.totalMid).toBeCloseTo((result.totalLow + result.totalHigh) / 2, 0);
  });

  // ─── Test 23: Annual fan cost is a string ───
  it('returns annualFanCost as a string', () => {
    const result = calculateRadonMitigationCost({
      foundationType: 'slab-on-grade',
      mitigationMethod: 'sub-slab-depressurization',
      homeSize: 'small-under-1500',
      pipingRoute: 'interior-closet',
      fanType: 'standard',
      region: 'national',
    });
    expect(typeof result.annualFanCost).toBe('string');
    expect(result.annualFanCost).toContain('$');
  });

  // ─── Test 24: Full premium build ───
  it('calculates fully loaded premium radon mitigation project', () => {
    const result = calculateRadonMitigationCost({
      foundationType: 'mixed-foundation',
      mitigationMethod: 'heat-recovery-ventilator',
      homeSize: 'large-over-3500',
      pipingRoute: 'exterior-wall',
      fanType: 'ultra-quiet',
      region: 'west-coast',
    }) as Record<string, number>;
    // adjustedLow: 1500×1.75×1.35×1.10×1.25=5459.0625
    // adjustedHigh: 3000×1.75×1.35×1.10×1.25=10918.125
    // equipLow: 5459.0625×0.45=2456.578, laborLow: 5459.0625×0.55×1.25=3753.98
    // totalLow ≈ 6210.56
    expect(result.totalLow).toBeGreaterThan(5000);
    expect(result.totalHigh).toBeGreaterThan(result.totalLow);
    expect(result.totalMid).toBeCloseTo((result.totalLow + result.totalHigh) / 2, 0);
  });
});
