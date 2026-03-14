import { calculateCrownMoldingCost } from '../../../lib/formulas/construction/crown-molding-cost';

describe('calculateCrownMoldingCost', () => {
  // ─── Test 1: Default inputs ───
  // Defaults: standard-80ft (80), mdf-paint-grade (1–3/ft), simple-cove (1.0x),
  //           standard-8ft (1.0x labor), unfinished (0/ft), national (1.0x)
  it('calculates default crown molding at national average', () => {
    const result = calculateCrownMoldingCost({}) as Record<string, number | string | Array<{ label: string; value: number }>>;
    // materialPerFt: 1–3 × 1.0 = 1–3
    // paintPerFt: 0–0
    // laborPerFt: 3–8 × 1.0 × 1.0 × 1.0 = 3–8
    // totalLow: (1+0+3) × 80 = 320
    // totalHigh: (3+0+8) × 80 = 880
    expect(result.totalLow).toBeCloseTo(320, 0);
    expect(result.totalHigh).toBeCloseTo(880, 0);
    expect(result.totalMid).toBeCloseTo(600, 0);
    expect(result.timeline).toBe('1-3 days');
  });

  // ─── Test 2: All required output fields present ───
  it('returns all expected output fields', () => {
    const result = calculateCrownMoldingCost({
      roomPerimeter: 'standard-80ft',
      moldingMaterial: 'mdf-paint-grade',
      moldingProfile: 'simple-cove',
      ceilingHeight: 'standard-8ft',
      paintFinish: 'unfinished',
      region: 'national',
    });
    expect(result).toHaveProperty('materialCost');
    expect(result).toHaveProperty('paintCost');
    expect(result).toHaveProperty('laborCost');
    expect(result).toHaveProperty('subtotalLow');
    expect(result).toHaveProperty('subtotalHigh');
    expect(result).toHaveProperty('subtotal');
    expect(result).toHaveProperty('totalLow');
    expect(result).toHaveProperty('totalHigh');
    expect(result).toHaveProperty('totalMid');
    expect(result).toHaveProperty('materialComparison');
    expect(result).toHaveProperty('timeline');
  });

  // ─── Test 3: Small-40ft room ───
  it('scales correctly to small 40 linear foot room', () => {
    const result = calculateCrownMoldingCost({
      roomPerimeter: 'small-40ft',
      moldingMaterial: 'mdf-paint-grade',
      moldingProfile: 'simple-cove',
      ceilingHeight: 'standard-8ft',
      paintFinish: 'unfinished',
      region: 'national',
    }) as Record<string, number | string | Array<{ label: string; value: number }>>;
    // totalLow: (1+0+3) × 40 = 160
    // totalHigh: (3+0+8) × 40 = 440
    expect(result.totalLow).toBeCloseTo(160, 0);
    expect(result.totalHigh).toBeCloseTo(440, 0);
  });

  // ─── Test 4: Large-120ft room ───
  it('scales correctly to large 120 linear foot room', () => {
    const result = calculateCrownMoldingCost({
      roomPerimeter: 'large-120ft',
      moldingMaterial: 'mdf-paint-grade',
      moldingProfile: 'simple-cove',
      ceilingHeight: 'standard-8ft',
      paintFinish: 'unfinished',
      region: 'national',
    }) as Record<string, number | string | Array<{ label: string; value: number }>>;
    // totalLow: (1+0+3) × 120 = 480
    // totalHigh: (3+0+8) × 120 = 1320
    expect(result.totalLow).toBeCloseTo(480, 0);
    expect(result.totalHigh).toBeCloseTo(1320, 0);
  });

  // ─── Test 5: XLarge-200ft (open floor plan) ───
  it('scales correctly to xlarge 200 linear foot plan', () => {
    const result = calculateCrownMoldingCost({
      roomPerimeter: 'xlarge-200ft',
      moldingMaterial: 'mdf-paint-grade',
      moldingProfile: 'simple-cove',
      ceilingHeight: 'standard-8ft',
      paintFinish: 'unfinished',
      region: 'national',
    }) as Record<string, number | string | Array<{ label: string; value: number }>>;
    // totalLow: (1+0+3) × 200 = 800
    // totalHigh: (3+0+8) × 200 = 2200
    expect(result.totalLow).toBeCloseTo(800, 0);
    expect(result.totalHigh).toBeCloseTo(2200, 0);
  });

  // ─── Test 6: Pine finger joint material ($2–$5/ft) ───
  it('calculates pine finger joint material correctly', () => {
    const result = calculateCrownMoldingCost({
      roomPerimeter: 'standard-80ft',
      moldingMaterial: 'pine-finger-joint',
      moldingProfile: 'simple-cove',
      ceilingHeight: 'standard-8ft',
      paintFinish: 'unfinished',
      region: 'national',
    }) as Record<string, number | string | Array<{ label: string; value: number }>>;
    // materialPerFt: 2–5 × 1.0=2–5, labor: 3–8
    // totalLow: (2+0+3) × 80 = 400
    // totalHigh: (5+0+8) × 80 = 1040
    expect(result.totalLow).toBeCloseTo(400, 0);
    expect(result.totalHigh).toBeCloseTo(1040, 0);
    expect(result.materialCost).toBeCloseTo(280, 0); // (2×80+5×80)/2=(160+400)/2=280
  });

  // ─── Test 7: Solid oak material ($5–$12/ft) ───
  it('calculates solid oak material correctly', () => {
    const result = calculateCrownMoldingCost({
      roomPerimeter: 'standard-80ft',
      moldingMaterial: 'solid-oak',
      moldingProfile: 'simple-cove',
      ceilingHeight: 'standard-8ft',
      paintFinish: 'unfinished',
      region: 'national',
    }) as Record<string, number | string | Array<{ label: string; value: number }>>;
    // materialPerFt: 5–12 × 1.0=5–12, labor: 3–8
    // totalLow: (5+0+3) × 80 = 640
    // totalHigh: (12+0+8) × 80 = 1600
    expect(result.totalLow).toBeCloseTo(640, 0);
    expect(result.totalHigh).toBeCloseTo(1600, 0);
  });

  // ─── Test 8: Standard 3-piece profile (1.4x) ───
  it('applies standard-3-piece profile multiplier (1.4x)', () => {
    const result = calculateCrownMoldingCost({
      roomPerimeter: 'standard-80ft',
      moldingMaterial: 'mdf-paint-grade',
      moldingProfile: 'standard-3-piece',
      ceilingHeight: 'standard-8ft',
      paintFinish: 'unfinished',
      region: 'national',
    }) as Record<string, number | string | Array<{ label: string; value: number }>>;
    // materialPerFt: 1×1.4=1.4–3×1.4=4.2, laborPerFt: 3×1.4×1.0×1.0=4.2–8×1.4×1.0=11.2
    // totalLow: (1.4+0+4.2) × 80 = 448
    // totalHigh: (4.2+0+11.2) × 80 = 1232
    expect(result.totalLow).toBeCloseTo(448, 0);
    expect(result.totalHigh).toBeCloseTo(1232, 0);
  });

  // ─── Test 9: Elaborate 5-piece profile (2.0x) ───
  it('applies elaborate-5-piece profile multiplier (2.0x)', () => {
    const result = calculateCrownMoldingCost({
      roomPerimeter: 'standard-80ft',
      moldingMaterial: 'mdf-paint-grade',
      moldingProfile: 'elaborate-5-piece',
      ceilingHeight: 'standard-8ft',
      paintFinish: 'unfinished',
      region: 'national',
    }) as Record<string, number | string | Array<{ label: string; value: number }>>;
    // materialPerFt: 1×2=2–3×2=6, laborPerFt: 3×2=6–8×2=16
    // totalLow: (2+0+6) × 80 = 640
    // totalHigh: (6+0+16) × 80 = 1760
    expect(result.totalLow).toBeCloseTo(640, 0);
    expect(result.totalHigh).toBeCloseTo(1760, 0);
  });

  // ─── Test 10: Custom built-up profile (2.75x) ───
  it('applies custom-built-up profile multiplier (2.75x)', () => {
    const result = calculateCrownMoldingCost({
      roomPerimeter: 'standard-80ft',
      moldingMaterial: 'mdf-paint-grade',
      moldingProfile: 'custom-built-up',
      ceilingHeight: 'standard-8ft',
      paintFinish: 'unfinished',
      region: 'national',
    }) as Record<string, number | string | Array<{ label: string; value: number }>>;
    // materialPerFt: 1×2.75=2.75–3×2.75=8.25, laborPerFt: 3×2.75=8.25–8×2.75=22
    // totalLow: (2.75+0+8.25) × 80 = 880
    // totalHigh: (8.25+0+22) × 80 = 2420
    expect(result.totalLow).toBeCloseTo(880, 0);
    expect(result.totalHigh).toBeCloseTo(2420, 0);
  });

  // ─── Test 11: Raised 9ft ceiling (1.1x labor) ───
  it('applies raised-9ft ceiling multiplier (1.1x to labor)', () => {
    const standard = calculateCrownMoldingCost({
      roomPerimeter: 'standard-80ft',
      moldingMaterial: 'mdf-paint-grade',
      moldingProfile: 'simple-cove',
      ceilingHeight: 'standard-8ft',
      paintFinish: 'unfinished',
      region: 'national',
    }) as Record<string, number>;
    const raised = calculateCrownMoldingCost({
      roomPerimeter: 'standard-80ft',
      moldingMaterial: 'mdf-paint-grade',
      moldingProfile: 'simple-cove',
      ceilingHeight: 'raised-9ft',
      paintFinish: 'unfinished',
      region: 'national',
    }) as Record<string, number>;
    // laborPerFtLow: 3×1.0×1.1×1.0=3.3, totalLow: (1+0+3.3)×80=344
    expect(raised.totalLow).toBeCloseTo(344, 0);
    expect(raised.totalLow).toBeGreaterThan(standard.totalLow);
    expect(raised.materialCost).toBeCloseTo(standard.materialCost, 0);
  });

  // ─── Test 12: Vaulted-over-10ft ceiling (1.5x labor) ───
  it('applies vaulted-over-10ft ceiling multiplier (1.5x to labor)', () => {
    const result = calculateCrownMoldingCost({
      roomPerimeter: 'standard-80ft',
      moldingMaterial: 'mdf-paint-grade',
      moldingProfile: 'simple-cove',
      ceilingHeight: 'vaulted-over-10ft',
      paintFinish: 'unfinished',
      region: 'national',
    }) as Record<string, number>;
    // laborPerFtLow: 3×1.0×1.5×1.0=4.5, totalLow: (1+0+4.5)×80=440
    // laborPerFtHigh: 8×1.5=12, totalHigh: (3+0+12)×80=1200
    expect(result.totalLow).toBeCloseTo(440, 0);
    expect(result.totalHigh).toBeCloseTo(1200, 0);
  });

  // ─── Test 13: One-coat paint finish (+$1.00–$2.00/ft) ───
  it('adds one-coat paint finish correctly', () => {
    const none = calculateCrownMoldingCost({
      roomPerimeter: 'standard-80ft',
      moldingMaterial: 'mdf-paint-grade',
      moldingProfile: 'simple-cove',
      ceilingHeight: 'standard-8ft',
      paintFinish: 'unfinished',
      region: 'national',
    }) as Record<string, number>;
    const oneCoat = calculateCrownMoldingCost({
      roomPerimeter: 'standard-80ft',
      moldingMaterial: 'mdf-paint-grade',
      moldingProfile: 'simple-cove',
      ceilingHeight: 'standard-8ft',
      paintFinish: 'one-coat',
      region: 'national',
    }) as Record<string, number>;
    expect(oneCoat.paintCost).toBeCloseTo(120, 0); // (1.00+2.00)/2 × 80 = 120
    expect(oneCoat.totalLow).toBeCloseTo(none.totalLow + 80, 0); // +1.00×80
    expect(oneCoat.totalHigh).toBeCloseTo(none.totalHigh + 160, 0); // +2.00×80
  });

  // ─── Test 14: Two-coat premium paint (+$1.50–$3.00/ft) ───
  it('adds two-coat premium paint finish correctly', () => {
    const result = calculateCrownMoldingCost({
      roomPerimeter: 'standard-80ft',
      moldingMaterial: 'mdf-paint-grade',
      moldingProfile: 'simple-cove',
      ceilingHeight: 'standard-8ft',
      paintFinish: 'two-coat-premium',
      region: 'national',
    }) as Record<string, number>;
    expect(result.paintCost).toBeCloseTo(180, 0); // (1.50+3.00)/2 × 80 = 180
    expect(result.totalLow).toBeCloseTo(320 + 120, 0); // +1.50×80
    expect(result.totalHigh).toBeCloseTo(880 + 240, 0); // +3.00×80
  });

  // ─── Test 15: Northeast region (1.20x labor) ───
  it('applies northeast regional labor multiplier (1.20x)', () => {
    const national = calculateCrownMoldingCost({
      roomPerimeter: 'standard-80ft',
      moldingMaterial: 'mdf-paint-grade',
      moldingProfile: 'simple-cove',
      ceilingHeight: 'standard-8ft',
      paintFinish: 'unfinished',
      region: 'national',
    }) as Record<string, number>;
    const northeast = calculateCrownMoldingCost({
      roomPerimeter: 'standard-80ft',
      moldingMaterial: 'mdf-paint-grade',
      moldingProfile: 'simple-cove',
      ceilingHeight: 'standard-8ft',
      paintFinish: 'unfinished',
      region: 'northeast',
    }) as Record<string, number>;
    // laborPerFtLow: 3×1.0×1.0×1.20=3.6, totalLow: (1+0+3.6)×80=368
    expect(northeast.totalLow).toBeCloseTo(368, 0);
    expect(northeast.materialCost).toBeCloseTo(national.materialCost, 0);
    expect(northeast.laborCost).toBeGreaterThan(national.laborCost);
  });

  // ─── Test 16: West Coast region (1.25x labor) ───
  it('applies west coast regional labor multiplier (1.25x)', () => {
    const result = calculateCrownMoldingCost({
      roomPerimeter: 'standard-80ft',
      moldingMaterial: 'mdf-paint-grade',
      moldingProfile: 'simple-cove',
      ceilingHeight: 'standard-8ft',
      paintFinish: 'unfinished',
      region: 'west-coast',
    }) as Record<string, number>;
    // laborPerFtLow: 3×1.25=3.75, totalLow: (1+0+3.75)×80=380
    // laborPerFtHigh: 8×1.25=10, totalHigh: (3+0+10)×80=1040
    expect(result.totalLow).toBeCloseTo(380, 0);
    expect(result.totalHigh).toBeCloseTo(1040, 0);
  });

  // ─── Test 17: South region (0.85x labor) ───
  it('applies south regional labor multiplier (0.85x)', () => {
    const result = calculateCrownMoldingCost({
      roomPerimeter: 'standard-80ft',
      moldingMaterial: 'mdf-paint-grade',
      moldingProfile: 'simple-cove',
      ceilingHeight: 'standard-8ft',
      paintFinish: 'unfinished',
      region: 'south',
    }) as Record<string, number>;
    // laborPerFtLow: 3×0.85=2.55, totalLow: (1+0+2.55)×80=284
    // laborPerFtHigh: 8×0.85=6.8, totalHigh: (3+0+6.8)×80=784
    expect(result.totalLow).toBeCloseTo(284, 0);
    expect(result.totalHigh).toBeCloseTo(784, 0);
  });

  // ─── Test 18: Midwest region (0.90x labor) ───
  it('applies midwest regional labor multiplier (0.90x)', () => {
    const result = calculateCrownMoldingCost({
      roomPerimeter: 'standard-80ft',
      moldingMaterial: 'mdf-paint-grade',
      moldingProfile: 'simple-cove',
      ceilingHeight: 'standard-8ft',
      paintFinish: 'unfinished',
      region: 'midwest',
    }) as Record<string, number>;
    // laborPerFtLow: 3×0.90=2.7, totalLow: (1+0+2.7)×80=296
    expect(result.totalLow).toBeCloseTo(296, 0);
  });

  // ─── Test 19: Material comparison returns all 5 materials ───
  it('returns materialComparison with all 5 materials', () => {
    const result = calculateCrownMoldingCost({
      roomPerimeter: 'standard-80ft',
      moldingMaterial: 'mdf-paint-grade',
      moldingProfile: 'simple-cove',
      ceilingHeight: 'standard-8ft',
      paintFinish: 'unfinished',
      region: 'national',
    });
    const comparison = result.materialComparison as Array<{ label: string; value: number }>;
    expect(comparison).toHaveLength(5);
    comparison.forEach(item => {
      expect(item.value).toBeGreaterThan(0);
      expect(item.label).toBeTruthy();
    });
    // MDF should be cheapest, solid oak most expensive
    const mdf = comparison.find(c => c.label.includes('MDF'));
    const oak = comparison.find(c => c.label.includes('Oak'));
    expect(mdf!.value).toBeLessThan(oak!.value);
  });

  // ─── Test 20: totalMid = (totalLow + totalHigh) / 2 ───
  it('totalMid equals average of totalLow and totalHigh', () => {
    const result = calculateCrownMoldingCost({
      roomPerimeter: 'large-120ft',
      moldingMaterial: 'solid-poplar',
      moldingProfile: 'standard-3-piece',
      ceilingHeight: 'tall-10ft',
      paintFinish: 'one-coat',
      region: 'northeast',
    }) as Record<string, number>;
    expect(result.totalMid).toBeCloseTo((result.totalLow + result.totalHigh) / 2, 0);
  });

  // ─── Test 21: Material cost is independent of ceiling height ───
  it('material cost does not change with ceiling height', () => {
    const standard = calculateCrownMoldingCost({
      roomPerimeter: 'standard-80ft',
      moldingMaterial: 'solid-oak',
      moldingProfile: 'simple-cove',
      ceilingHeight: 'standard-8ft',
      paintFinish: 'unfinished',
      region: 'national',
    }) as Record<string, number>;
    const vaulted = calculateCrownMoldingCost({
      roomPerimeter: 'standard-80ft',
      moldingMaterial: 'solid-oak',
      moldingProfile: 'simple-cove',
      ceilingHeight: 'vaulted-over-10ft',
      paintFinish: 'unfinished',
      region: 'national',
    }) as Record<string, number>;
    expect(vaulted.materialCost).toBeCloseTo(standard.materialCost, 0);
    expect(vaulted.laborCost).toBeGreaterThan(standard.laborCost);
  });

  // ─── Test 22: Material cost is independent of region ───
  it('material cost does not change with region', () => {
    const national = calculateCrownMoldingCost({
      roomPerimeter: 'standard-80ft',
      moldingMaterial: 'pine-finger-joint',
      moldingProfile: 'simple-cove',
      ceilingHeight: 'standard-8ft',
      paintFinish: 'unfinished',
      region: 'national',
    }) as Record<string, number>;
    const westCoast = calculateCrownMoldingCost({
      roomPerimeter: 'standard-80ft',
      moldingMaterial: 'pine-finger-joint',
      moldingProfile: 'simple-cove',
      ceilingHeight: 'standard-8ft',
      paintFinish: 'unfinished',
      region: 'west-coast',
    }) as Record<string, number>;
    expect(westCoast.materialCost).toBeCloseTo(national.materialCost, 0);
  });

  // ─── Test 23: Medium-60ft room with polyurethane foam ───
  it('calculates polyurethane foam at medium room correctly', () => {
    const result = calculateCrownMoldingCost({
      roomPerimeter: 'medium-60ft',
      moldingMaterial: 'polyurethane-foam',
      moldingProfile: 'simple-cove',
      ceilingHeight: 'standard-8ft',
      paintFinish: 'unfinished',
      region: 'national',
    }) as Record<string, number>;
    // materialPerFt: 2–6 × 1.0=2–6, laborPerFt: 3–8
    // totalLow: (2+0+3) × 60 = 300
    // totalHigh: (6+0+8) × 60 = 840
    expect(result.totalLow).toBeCloseTo(300, 0);
    expect(result.totalHigh).toBeCloseTo(840, 0);
  });

  // ─── Test 24: Full premium build — solid oak, custom built-up, vaulted, two-coat, west-coast ───
  it('calculates fully loaded premium crown molding project', () => {
    const result = calculateCrownMoldingCost({
      roomPerimeter: 'xlarge-200ft',
      moldingMaterial: 'solid-oak',
      moldingProfile: 'custom-built-up',
      ceilingHeight: 'vaulted-over-10ft',
      paintFinish: 'two-coat-premium',
      region: 'west-coast',
    }) as Record<string, number>;
    // materialPerFt: 5×2.75=13.75–12×2.75=33
    // paintPerFt: 1.5–3
    // laborPerFt: 3×2.75×1.5×1.25=15.469–8×2.75×1.5×1.25=41.25
    // totalLow: (13.75+1.5+15.469) × 200 ≈ 6143.75
    // totalHigh: (33+3+41.25) × 200 = 15450
    expect(result.totalLow).toBeGreaterThan(5000);
    expect(result.totalHigh).toBeGreaterThan(10000);
    expect(result.totalHigh).toBeGreaterThan(result.totalLow);
    expect(result.totalMid).toBeCloseTo((result.totalLow + result.totalHigh) / 2, 0);
  });
});
