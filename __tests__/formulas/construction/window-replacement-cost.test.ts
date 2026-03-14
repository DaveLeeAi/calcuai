import { calculateWindowReplacementCost } from '@/lib/formulas/construction/window-replacement-cost';

describe('calculateWindowReplacementCost', () => {
  // ─── Test 1: Standard 10 double-hung vinyl windows, national, replacement-in-frame ───
  it('calculates 10 double-hung vinyl replacement-in-frame windows at national average', () => {
    const result = calculateWindowReplacementCost({
      windowCount: 10,
      windowType: 'double-hung',
      frameMaterial: 'vinyl',
      glassType: 'double-pane',
      windowSize: 'standard-3x4',
      installation: 'replacement-in-frame',
      region: 'national',
    });
    // Material per window: $250–$500 × 1.0 × 1.0 × 1.0 = $250–$500
    // Labor per window: $150–$300 × 1.0 = $150–$300
    // Total low: (250 + 150) × 10 = $4,000
    // Total high: (500 + 300) × 10 = $8,000
    // Total mid: (4000 + 8000) / 2 = $6,000
    expect(result.totalLow).toBe(4000);
    expect(result.totalHigh).toBe(8000);
    expect(result.totalMid).toBe(6000);
    expect(result.windowCount).toBe(10);
  });

  // ─── Test 2: Single-hung windows ───
  it('calculates single-hung window costs', () => {
    const result = calculateWindowReplacementCost({
      windowCount: 10,
      windowType: 'single-hung',
      frameMaterial: 'vinyl',
      glassType: 'double-pane',
      windowSize: 'standard-3x4',
      installation: 'replacement-in-frame',
      region: 'national',
    });
    // Material: $200–$400 per window
    // Labor: $150–$300
    // Total low: (200 + 150) × 10 = $3,500
    // Total high: (400 + 300) × 10 = $7,000
    expect(result.totalLow).toBe(3500);
    expect(result.totalHigh).toBe(7000);
    expect(result.totalMid).toBe(5250);
  });

  // ─── Test 3: Casement windows ───
  it('calculates casement window costs', () => {
    const result = calculateWindowReplacementCost({
      windowCount: 10,
      windowType: 'casement',
      frameMaterial: 'vinyl',
      glassType: 'double-pane',
      windowSize: 'standard-3x4',
      installation: 'replacement-in-frame',
      region: 'national',
    });
    // Material: $300–$600
    // Total low: (300 + 150) × 10 = $4,500
    // Total high: (600 + 300) × 10 = $9,000
    expect(result.totalLow).toBe(4500);
    expect(result.totalHigh).toBe(9000);
  });

  // ─── Test 4: Sliding windows ───
  it('calculates sliding window costs', () => {
    const result = calculateWindowReplacementCost({
      windowCount: 10,
      windowType: 'sliding',
      frameMaterial: 'vinyl',
      glassType: 'double-pane',
      windowSize: 'standard-3x4',
      installation: 'replacement-in-frame',
      region: 'national',
    });
    // Material: $200–$450
    // Total low: (200 + 150) × 10 = $3,500
    // Total high: (450 + 300) × 10 = $7,500
    expect(result.totalLow).toBe(3500);
    expect(result.totalHigh).toBe(7500);
  });

  // ─── Test 5: Bay/Bow windows ───
  it('calculates bay/bow window costs', () => {
    const result = calculateWindowReplacementCost({
      windowCount: 2,
      windowType: 'bay-bow',
      frameMaterial: 'vinyl',
      glassType: 'double-pane',
      windowSize: 'standard-3x4',
      installation: 'replacement-in-frame',
      region: 'national',
    });
    // Material: $800–$2500
    // Total low: (800 + 150) × 2 = $1,900
    // Total high: (2500 + 300) × 2 = $5,600
    expect(result.totalLow).toBe(1900);
    expect(result.totalHigh).toBe(5600);
  });

  // ─── Test 6: Picture windows ───
  it('calculates picture window costs', () => {
    const result = calculateWindowReplacementCost({
      windowCount: 5,
      windowType: 'picture',
      frameMaterial: 'vinyl',
      glassType: 'double-pane',
      windowSize: 'standard-3x4',
      installation: 'replacement-in-frame',
      region: 'national',
    });
    // Material: $250–$600
    // Total low: (250 + 150) × 5 = $2,000
    // Total high: (600 + 300) × 5 = $4,500
    expect(result.totalLow).toBe(2000);
    expect(result.totalHigh).toBe(4500);
  });

  // ─── Test 7: Awning windows ───
  it('calculates awning window costs', () => {
    const result = calculateWindowReplacementCost({
      windowCount: 4,
      windowType: 'awning',
      frameMaterial: 'vinyl',
      glassType: 'double-pane',
      windowSize: 'standard-3x4',
      installation: 'replacement-in-frame',
      region: 'national',
    });
    // Material: $300–$650
    // Total low: (300 + 150) × 4 = $1,800
    // Total high: (650 + 300) × 4 = $3,800
    expect(result.totalLow).toBe(1800);
    expect(result.totalHigh).toBe(3800);
  });

  // ─── Test 8: Wood frame material multiplier (1.35x) ───
  it('applies wood frame material multiplier (1.35x)', () => {
    const vinyl = calculateWindowReplacementCost({
      windowCount: 10,
      windowType: 'double-hung',
      frameMaterial: 'vinyl',
      glassType: 'double-pane',
      windowSize: 'standard-3x4',
      installation: 'replacement-in-frame',
      region: 'national',
    });
    const wood = calculateWindowReplacementCost({
      windowCount: 10,
      windowType: 'double-hung',
      frameMaterial: 'wood',
      glassType: 'double-pane',
      windowSize: 'standard-3x4',
      installation: 'replacement-in-frame',
      region: 'national',
    });
    // Wood material: $250×1.35=$337.50 low, $500×1.35=$675 high per window
    // Labor unchanged
    expect((wood.totalMaterialCost as number)).toBeCloseTo((vinyl.totalMaterialCost as number) * 1.35, 0);
    expect(wood.totalLaborCost).toBe(vinyl.totalLaborCost);
  });

  // ─── Test 9: Fiberglass frame material multiplier (1.25x) ───
  it('applies fiberglass frame material multiplier (1.25x)', () => {
    const vinyl = calculateWindowReplacementCost({
      windowCount: 10,
      windowType: 'double-hung',
      frameMaterial: 'vinyl',
      glassType: 'double-pane',
      windowSize: 'standard-3x4',
      installation: 'replacement-in-frame',
      region: 'national',
    });
    const fiberglass = calculateWindowReplacementCost({
      windowCount: 10,
      windowType: 'double-hung',
      frameMaterial: 'fiberglass',
      glassType: 'double-pane',
      windowSize: 'standard-3x4',
      installation: 'replacement-in-frame',
      region: 'national',
    });
    expect((fiberglass.totalMaterialCost as number)).toBeCloseTo((vinyl.totalMaterialCost as number) * 1.25, 0);
    expect(fiberglass.totalLaborCost).toBe(vinyl.totalLaborCost);
  });

  // ─── Test 10: Aluminum frame material multiplier (0.90x) ───
  it('applies aluminum frame material multiplier (0.90x)', () => {
    const vinyl = calculateWindowReplacementCost({
      windowCount: 10,
      windowType: 'double-hung',
      frameMaterial: 'vinyl',
      glassType: 'double-pane',
      windowSize: 'standard-3x4',
      installation: 'replacement-in-frame',
      region: 'national',
    });
    const aluminum = calculateWindowReplacementCost({
      windowCount: 10,
      windowType: 'double-hung',
      frameMaterial: 'aluminum',
      glassType: 'double-pane',
      windowSize: 'standard-3x4',
      installation: 'replacement-in-frame',
      region: 'national',
    });
    expect((aluminum.totalMaterialCost as number)).toBeCloseTo((vinyl.totalMaterialCost as number) * 0.90, 0);
  });

  // ─── Test 11: Triple-pane glass multiplier (1.30x) ───
  it('applies triple-pane glass multiplier (1.30x)', () => {
    const doublePaneResult = calculateWindowReplacementCost({
      windowCount: 10,
      windowType: 'double-hung',
      frameMaterial: 'vinyl',
      glassType: 'double-pane',
      windowSize: 'standard-3x4',
      installation: 'replacement-in-frame',
      region: 'national',
    });
    const triplePaneResult = calculateWindowReplacementCost({
      windowCount: 10,
      windowType: 'double-hung',
      frameMaterial: 'vinyl',
      glassType: 'triple-pane',
      windowSize: 'standard-3x4',
      installation: 'replacement-in-frame',
      region: 'national',
    });
    expect((triplePaneResult.totalMaterialCost as number)).toBeCloseTo((doublePaneResult.totalMaterialCost as number) * 1.30, 0);
    expect(triplePaneResult.totalLaborCost).toBe(doublePaneResult.totalLaborCost);
  });

  // ─── Test 12: Low-E double glass multiplier (1.15x) ───
  it('applies low-e double glass multiplier (1.15x)', () => {
    const base = calculateWindowReplacementCost({
      windowCount: 10,
      windowType: 'double-hung',
      frameMaterial: 'vinyl',
      glassType: 'double-pane',
      windowSize: 'standard-3x4',
      installation: 'replacement-in-frame',
      region: 'national',
    });
    const lowE = calculateWindowReplacementCost({
      windowCount: 10,
      windowType: 'double-hung',
      frameMaterial: 'vinyl',
      glassType: 'low-e-double',
      windowSize: 'standard-3x4',
      installation: 'replacement-in-frame',
      region: 'national',
    });
    expect((lowE.totalMaterialCost as number)).toBeCloseTo((base.totalMaterialCost as number) * 1.15, 0);
  });

  // ─── Test 13: Low-E triple glass multiplier (1.45x) ───
  it('applies low-e triple glass multiplier (1.45x)', () => {
    const base = calculateWindowReplacementCost({
      windowCount: 10,
      windowType: 'double-hung',
      frameMaterial: 'vinyl',
      glassType: 'double-pane',
      windowSize: 'standard-3x4',
      installation: 'replacement-in-frame',
      region: 'national',
    });
    const lowETriple = calculateWindowReplacementCost({
      windowCount: 10,
      windowType: 'double-hung',
      frameMaterial: 'vinyl',
      glassType: 'low-e-triple',
      windowSize: 'standard-3x4',
      installation: 'replacement-in-frame',
      region: 'national',
    });
    expect((lowETriple.totalMaterialCost as number)).toBeCloseTo((base.totalMaterialCost as number) * 1.45, 0);
  });

  // ─── Test 14: Large window size multiplier (1.35x) ───
  it('applies large window size multiplier (1.35x)', () => {
    const standard = calculateWindowReplacementCost({
      windowCount: 10,
      windowType: 'double-hung',
      frameMaterial: 'vinyl',
      glassType: 'double-pane',
      windowSize: 'standard-3x4',
      installation: 'replacement-in-frame',
      region: 'national',
    });
    const large = calculateWindowReplacementCost({
      windowCount: 10,
      windowType: 'double-hung',
      frameMaterial: 'vinyl',
      glassType: 'double-pane',
      windowSize: 'large-4x5',
      installation: 'replacement-in-frame',
      region: 'national',
    });
    expect((large.totalMaterialCost as number)).toBeCloseTo((standard.totalMaterialCost as number) * 1.35, 0);
    expect(large.totalLaborCost).toBe(standard.totalLaborCost);
  });

  // ─── Test 15: Oversized window size multiplier (1.75x) ───
  it('applies oversized window size multiplier (1.75x)', () => {
    const standard = calculateWindowReplacementCost({
      windowCount: 10,
      windowType: 'double-hung',
      frameMaterial: 'vinyl',
      glassType: 'double-pane',
      windowSize: 'standard-3x4',
      installation: 'replacement-in-frame',
      region: 'national',
    });
    const oversized = calculateWindowReplacementCost({
      windowCount: 10,
      windowType: 'double-hung',
      frameMaterial: 'vinyl',
      glassType: 'double-pane',
      windowSize: 'oversized-5x6',
      installation: 'replacement-in-frame',
      region: 'national',
    });
    expect((oversized.totalMaterialCost as number)).toBeCloseTo((standard.totalMaterialCost as number) * 1.75, 0);
  });

  // ─── Test 16: Full-frame installation ───
  it('calculates full-frame installation costs', () => {
    const result = calculateWindowReplacementCost({
      windowCount: 10,
      windowType: 'double-hung',
      frameMaterial: 'vinyl',
      glassType: 'double-pane',
      windowSize: 'standard-3x4',
      installation: 'full-frame',
      region: 'national',
    });
    // Labor: $300–$600 per window
    // Total low: (250 + 300) × 10 = $5,500
    // Total high: (500 + 600) × 10 = $11,000
    expect(result.totalLow).toBe(5500);
    expect(result.totalHigh).toBe(11000);
  });

  // ─── Test 17: New-opening installation ───
  it('calculates new-opening installation costs', () => {
    const result = calculateWindowReplacementCost({
      windowCount: 10,
      windowType: 'double-hung',
      frameMaterial: 'vinyl',
      glassType: 'double-pane',
      windowSize: 'standard-3x4',
      installation: 'new-opening',
      region: 'national',
    });
    // Labor: $500–$1000 per window
    // Total low: (250 + 500) × 10 = $7,500
    // Total high: (500 + 1000) × 10 = $15,000
    expect(result.totalLow).toBe(7500);
    expect(result.totalHigh).toBe(15000);
  });

  // ─── Test 18: Northeast region multiplier (1.20x on labor) ───
  it('applies northeast regional labor multiplier (1.20x)', () => {
    const national = calculateWindowReplacementCost({
      windowCount: 10,
      windowType: 'double-hung',
      frameMaterial: 'vinyl',
      glassType: 'double-pane',
      windowSize: 'standard-3x4',
      installation: 'replacement-in-frame',
      region: 'national',
    });
    const northeast = calculateWindowReplacementCost({
      windowCount: 10,
      windowType: 'double-hung',
      frameMaterial: 'vinyl',
      glassType: 'double-pane',
      windowSize: 'standard-3x4',
      installation: 'replacement-in-frame',
      region: 'northeast',
    });
    expect((northeast.totalLaborCost as number)).toBeCloseTo((national.totalLaborCost as number) * 1.20, 0);
    expect(northeast.totalMaterialCost).toBe(national.totalMaterialCost);
  });

  // ─── Test 19: West Coast region multiplier (1.25x) ───
  it('applies west coast regional labor multiplier (1.25x)', () => {
    const national = calculateWindowReplacementCost({
      windowCount: 10,
      windowType: 'double-hung',
      frameMaterial: 'vinyl',
      glassType: 'double-pane',
      windowSize: 'standard-3x4',
      installation: 'replacement-in-frame',
      region: 'national',
    });
    const westCoast = calculateWindowReplacementCost({
      windowCount: 10,
      windowType: 'double-hung',
      frameMaterial: 'vinyl',
      glassType: 'double-pane',
      windowSize: 'standard-3x4',
      installation: 'replacement-in-frame',
      region: 'west-coast',
    });
    expect((westCoast.totalLaborCost as number)).toBeCloseTo((national.totalLaborCost as number) * 1.25, 0);
    expect(westCoast.totalMaterialCost).toBe(national.totalMaterialCost);
  });

  // ─── Test 20: South region multiplier (0.85x) ───
  it('applies south regional labor multiplier (0.85x)', () => {
    const national = calculateWindowReplacementCost({
      windowCount: 10,
      windowType: 'double-hung',
      frameMaterial: 'vinyl',
      glassType: 'double-pane',
      windowSize: 'standard-3x4',
      installation: 'replacement-in-frame',
      region: 'national',
    });
    const south = calculateWindowReplacementCost({
      windowCount: 10,
      windowType: 'double-hung',
      frameMaterial: 'vinyl',
      glassType: 'double-pane',
      windowSize: 'standard-3x4',
      installation: 'replacement-in-frame',
      region: 'south',
    });
    expect((south.totalLaborCost as number)).toBeCloseTo((national.totalLaborCost as number) * 0.85, 0);
    expect((south.totalMid as number)).toBeLessThan((national.totalMid as number));
  });

  // ─── Test 21: Midwest region multiplier (0.90x) ───
  it('applies midwest regional labor multiplier (0.90x)', () => {
    const national = calculateWindowReplacementCost({
      windowCount: 10,
      windowType: 'double-hung',
      frameMaterial: 'vinyl',
      glassType: 'double-pane',
      windowSize: 'standard-3x4',
      installation: 'replacement-in-frame',
      region: 'national',
    });
    const midwest = calculateWindowReplacementCost({
      windowCount: 10,
      windowType: 'double-hung',
      frameMaterial: 'vinyl',
      glassType: 'double-pane',
      windowSize: 'standard-3x4',
      installation: 'replacement-in-frame',
      region: 'midwest',
    });
    expect((midwest.totalLaborCost as number)).toBeCloseTo((national.totalLaborCost as number) * 0.90, 0);
  });

  // ─── Test 22: Zero window count → zero costs ───
  it('returns zero for zero window count', () => {
    const result = calculateWindowReplacementCost({
      windowCount: 0,
      windowType: 'double-hung',
      frameMaterial: 'vinyl',
      glassType: 'double-pane',
      windowSize: 'standard-3x4',
      installation: 'replacement-in-frame',
      region: 'national',
    });
    expect(result.totalLow).toBe(0);
    expect(result.totalHigh).toBe(0);
    expect(result.totalMid).toBe(0);
    expect(result.costPerWindow).toBe(0);
    expect(result.windowCount).toBe(0);
  });

  // ─── Test 23: Single window ───
  it('calculates cost for a single window', () => {
    const result = calculateWindowReplacementCost({
      windowCount: 1,
      windowType: 'double-hung',
      frameMaterial: 'vinyl',
      glassType: 'double-pane',
      windowSize: 'standard-3x4',
      installation: 'replacement-in-frame',
      region: 'national',
    });
    // Total low: 250 + 150 = $400
    // Total high: 500 + 300 = $800
    expect(result.totalLow).toBe(400);
    expect(result.totalHigh).toBe(800);
    expect(result.costPerWindow).toBe(600);
  });

  // ─── Test 24: Combined multipliers — wood frame + triple-pane + large size ───
  it('stacks frame, glass, and size multipliers correctly', () => {
    const result = calculateWindowReplacementCost({
      windowCount: 1,
      windowType: 'double-hung',
      frameMaterial: 'wood',
      glassType: 'triple-pane',
      windowSize: 'large-4x5',
      installation: 'replacement-in-frame',
      region: 'national',
    });
    // Material low: $250 × 1.35 × 1.30 × 1.35 = $250 × 2.36925 = $592.31
    // Material high: $500 × 1.35 × 1.30 × 1.35 = $500 × 2.36925 = $1184.63
    const expectedMaterialLow = parseFloat((250 * 1.35 * 1.30 * 1.35).toFixed(2));
    const expectedMaterialHigh = parseFloat((500 * 1.35 * 1.30 * 1.35).toFixed(2));
    expect(result.totalLow).toBeCloseTo(expectedMaterialLow + 150, 1);
    expect(result.totalHigh).toBeCloseTo(expectedMaterialHigh + 300, 1);
  });

  // ─── Test 25: Window type comparison has all 7 types ───
  it('returns window type comparison with all 7 types', () => {
    const result = calculateWindowReplacementCost({
      windowCount: 10,
      windowType: 'double-hung',
      frameMaterial: 'vinyl',
      glassType: 'double-pane',
      windowSize: 'standard-3x4',
      installation: 'replacement-in-frame',
      region: 'national',
    });
    const comparison = result.windowTypeComparison as Array<{ label: string; value: number }>;
    expect(comparison).toHaveLength(7);
    comparison.forEach(item => {
      expect(item.value).toBeGreaterThan(0);
      expect(item.label).toBeTruthy();
    });
  });

  // ─── Test 26: Bay/bow most expensive in comparison, single-hung/sliding cheapest ───
  it('bay/bow is most expensive in comparison, single-hung among cheapest', () => {
    const result = calculateWindowReplacementCost({
      windowCount: 10,
      windowType: 'double-hung',
      frameMaterial: 'vinyl',
      glassType: 'double-pane',
      windowSize: 'standard-3x4',
      installation: 'replacement-in-frame',
      region: 'national',
    });
    const comparison = result.windowTypeComparison as Array<{ label: string; value: number }>;
    const bayBow = comparison.find(c => c.label.includes('Bay/Bow'));
    const singleHung = comparison.find(c => c.label.includes('Single-Hung'));
    expect(bayBow!.value).toBeGreaterThan(singleHung!.value);
  });

  // ─── Test 27: Output structure ───
  it('returns all expected output fields', () => {
    const result = calculateWindowReplacementCost({
      windowCount: 10,
      windowType: 'double-hung',
      frameMaterial: 'vinyl',
      glassType: 'double-pane',
      windowSize: 'standard-3x4',
      installation: 'replacement-in-frame',
      region: 'national',
    });
    expect(result).toHaveProperty('windowCount');
    expect(result).toHaveProperty('materialCostPerWindow');
    expect(result).toHaveProperty('laborCostPerWindow');
    expect(result).toHaveProperty('totalMaterialCost');
    expect(result).toHaveProperty('totalLaborCost');
    expect(result).toHaveProperty('totalLow');
    expect(result).toHaveProperty('totalHigh');
    expect(result).toHaveProperty('totalMid');
    expect(result).toHaveProperty('costPerWindow');
    expect(result).toHaveProperty('windowTypeComparison');
    expect(result).toHaveProperty('estimatedEnergySavings');
  });

  // ─── Test 28: Energy savings text changes by glass type ───
  it('returns correct energy savings text for each glass type', () => {
    const doublePane = calculateWindowReplacementCost({
      windowCount: 1, windowType: 'double-hung', frameMaterial: 'vinyl',
      glassType: 'double-pane', windowSize: 'standard-3x4',
      installation: 'replacement-in-frame', region: 'national',
    });
    const triplePane = calculateWindowReplacementCost({
      windowCount: 1, windowType: 'double-hung', frameMaterial: 'vinyl',
      glassType: 'triple-pane', windowSize: 'standard-3x4',
      installation: 'replacement-in-frame', region: 'national',
    });
    const lowETriple = calculateWindowReplacementCost({
      windowCount: 1, windowType: 'double-hung', frameMaterial: 'vinyl',
      glassType: 'low-e-triple', windowSize: 'standard-3x4',
      installation: 'replacement-in-frame', region: 'national',
    });
    expect(doublePane.estimatedEnergySavings).toContain('10–15%');
    expect(triplePane.estimatedEnergySavings).toContain('15–25%');
    expect(lowETriple.estimatedEnergySavings).toContain('20–30%');
  });

  // ─── Test 29: Default inputs produce valid output ───
  it('uses default inputs when values are missing', () => {
    const result = calculateWindowReplacementCost({});
    expect(result.windowCount).toBe(0);
    expect(result.totalMid).toBe(0);
    expect(result.totalLow).toBe(0);
    expect(result.totalHigh).toBe(0);
  });

  // ─── Test 30: Composite frame multiplier (1.30x) ───
  it('applies composite frame material multiplier (1.30x)', () => {
    const vinyl = calculateWindowReplacementCost({
      windowCount: 10,
      windowType: 'double-hung',
      frameMaterial: 'vinyl',
      glassType: 'double-pane',
      windowSize: 'standard-3x4',
      installation: 'replacement-in-frame',
      region: 'national',
    });
    const composite = calculateWindowReplacementCost({
      windowCount: 10,
      windowType: 'double-hung',
      frameMaterial: 'composite',
      glassType: 'double-pane',
      windowSize: 'standard-3x4',
      installation: 'replacement-in-frame',
      region: 'national',
    });
    expect((composite.totalMaterialCost as number)).toBeCloseTo((vinyl.totalMaterialCost as number) * 1.30, 0);
  });

  // ─── Test 31: Regional multiplier only affects labor, not materials ───
  it('regional multiplier changes labor but not material cost', () => {
    const national = calculateWindowReplacementCost({
      windowCount: 10,
      windowType: 'double-hung',
      frameMaterial: 'vinyl',
      glassType: 'double-pane',
      windowSize: 'standard-3x4',
      installation: 'replacement-in-frame',
      region: 'national',
    });
    const northeast = calculateWindowReplacementCost({
      windowCount: 10,
      windowType: 'double-hung',
      frameMaterial: 'vinyl',
      glassType: 'double-pane',
      windowSize: 'standard-3x4',
      installation: 'replacement-in-frame',
      region: 'northeast',
    });
    const south = calculateWindowReplacementCost({
      windowCount: 10,
      windowType: 'double-hung',
      frameMaterial: 'vinyl',
      glassType: 'double-pane',
      windowSize: 'standard-3x4',
      installation: 'replacement-in-frame',
      region: 'south',
    });
    expect(national.totalMaterialCost).toBe(northeast.totalMaterialCost);
    expect(national.totalMaterialCost).toBe(south.totalMaterialCost);
    expect((northeast.totalLaborCost as number)).toBeGreaterThan((national.totalLaborCost as number));
    expect((south.totalLaborCost as number)).toBeLessThan((national.totalLaborCost as number));
  });

  // ─── Test 32: Cost per window calculation ───
  it('calculates cost per window correctly', () => {
    const result = calculateWindowReplacementCost({
      windowCount: 10,
      windowType: 'double-hung',
      frameMaterial: 'vinyl',
      glassType: 'double-pane',
      windowSize: 'standard-3x4',
      installation: 'replacement-in-frame',
      region: 'national',
    });
    // totalMid = 6000, 10 windows → $600/window
    expect(result.costPerWindow).toBe(600);
  });

  // ─── Test 33: Mid-Atlantic region multiplier (1.15x) ───
  it('applies mid-atlantic regional labor multiplier (1.15x)', () => {
    const national = calculateWindowReplacementCost({
      windowCount: 10,
      windowType: 'double-hung',
      frameMaterial: 'vinyl',
      glassType: 'double-pane',
      windowSize: 'standard-3x4',
      installation: 'replacement-in-frame',
      region: 'national',
    });
    const midAtlantic = calculateWindowReplacementCost({
      windowCount: 10,
      windowType: 'double-hung',
      frameMaterial: 'vinyl',
      glassType: 'double-pane',
      windowSize: 'standard-3x4',
      installation: 'replacement-in-frame',
      region: 'mid-atlantic',
    });
    expect((midAtlantic.totalLaborCost as number)).toBeCloseTo((national.totalLaborCost as number) * 1.15, 0);
  });

  // ─── Test 34: Mountain-West region multiplier (0.95x) ───
  it('applies mountain-west regional labor multiplier (0.95x)', () => {
    const national = calculateWindowReplacementCost({
      windowCount: 10,
      windowType: 'double-hung',
      frameMaterial: 'vinyl',
      glassType: 'double-pane',
      windowSize: 'standard-3x4',
      installation: 'replacement-in-frame',
      region: 'national',
    });
    const mountainWest = calculateWindowReplacementCost({
      windowCount: 10,
      windowType: 'double-hung',
      frameMaterial: 'vinyl',
      glassType: 'double-pane',
      windowSize: 'standard-3x4',
      installation: 'replacement-in-frame',
      region: 'mountain-west',
    });
    expect((mountainWest.totalLaborCost as number)).toBeCloseTo((national.totalLaborCost as number) * 0.95, 0);
  });
});
