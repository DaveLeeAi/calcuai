import { calculateBasementWaterproofingCost } from '../../../lib/formulas/construction/basement-waterproofing-cost';

describe('calculateBasementWaterproofingCost', () => {
  // ─── Test 1: Default inputs — medium basement, interior drainage, 100 ft wall, no crack, no sump, national ───
  it('calculates default basement waterproofing at national average', () => {
    const result = calculateBasementWaterproofingCost({
      basementSize: 'medium-500-1000',
      method: 'interior-drainage',
      wallLength: 100,
      crackRepair: 'none',
      sumpPump: 'none',
      region: 'national',
    });
    // Waterproofing: 100 × $50–$100 = $5000–$10000
    // Material (30%): $1500 low, $3000 high
    // Labor (70% × 1.0): $3500 low, $7000 high
    // Crack: $0, Sump: $0
    // TotalLow: 1500 + 3500 = $5000
    // TotalHigh: 3000 + 7000 = $10000
    expect(result.totalLow).toBeCloseTo(5000, 0);
    expect(result.totalHigh).toBeCloseTo(10000, 0);
    expect(result.totalMid).toBeCloseTo(7500, 0);
    expect(result.materialCost).toBeCloseTo(2250, 0); // (1500+3000)/2
    expect(result.laborCost).toBeCloseTo(5250, 0); // (3500+7000)/2
    expect(result.crackRepairCost).toBe(0);
    expect(result.sumpPumpCost).toBe(0);
  });

  // ─── Test 2: Interior sealant method ($3–$7/lf) ───
  it('calculates interior sealant method costs', () => {
    const result = calculateBasementWaterproofingCost({
      basementSize: 'medium-500-1000',
      method: 'interior-sealant',
      wallLength: 100,
      crackRepair: 'none',
      sumpPump: 'none',
      region: 'national',
    });
    // Waterproofing: 100 × $3–$7 = $300–$700
    // Material (30%): $90 low, $210 high
    // Labor (70%): $210 low, $490 high
    expect(result.totalLow).toBeCloseTo(300, 0);
    expect(result.totalHigh).toBeCloseTo(700, 0);
    expect(result.totalMid).toBeCloseTo(500, 0);
  });

  // ─── Test 3: Exterior excavation method ($100–$200/lf) ───
  it('calculates exterior excavation method costs', () => {
    const result = calculateBasementWaterproofingCost({
      basementSize: 'medium-500-1000',
      method: 'exterior-excavation',
      wallLength: 100,
      crackRepair: 'none',
      sumpPump: 'none',
      region: 'national',
    });
    // Waterproofing: 100 × $100–$200 = $10000–$20000
    // Material (30%): $3000 low, $6000 high
    // Labor (70%): $7000 low, $14000 high
    expect(result.totalLow).toBeCloseTo(10000, 0);
    expect(result.totalHigh).toBeCloseTo(20000, 0);
  });

  // ─── Test 4: Combination method ($80–$150/lf) ───
  it('calculates combination method costs', () => {
    const result = calculateBasementWaterproofingCost({
      basementSize: 'medium-500-1000',
      method: 'combination',
      wallLength: 100,
      crackRepair: 'none',
      sumpPump: 'none',
      region: 'national',
    });
    // Waterproofing: 100 × $80–$150 = $8000–$15000
    // Material (30%): $2400 low, $4500 high
    // Labor (70%): $5600 low, $10500 high
    expect(result.totalLow).toBeCloseTo(8000, 0);
    expect(result.totalHigh).toBeCloseTo(15000, 0);
  });

  // ─── Test 5: Different wall length (150 lf) ───
  it('scales cost with wall length', () => {
    const result = calculateBasementWaterproofingCost({
      basementSize: 'large-1000-1500',
      method: 'interior-drainage',
      wallLength: 150,
      crackRepair: 'none',
      sumpPump: 'none',
      region: 'national',
    });
    // Waterproofing: 150 × $50–$100 = $7500–$15000
    // Material: $2250–$4500, Labor: $5250–$10500
    expect(result.totalLow).toBeCloseTo(7500, 0);
    expect(result.totalHigh).toBeCloseTo(15000, 0);
  });

  // ─── Test 6: Minor crack repair ($250–$800) ───
  it('adds minor crack repair cost ($250–$800)', () => {
    const none = calculateBasementWaterproofingCost({
      basementSize: 'medium-500-1000',
      method: 'interior-drainage',
      wallLength: 100,
      crackRepair: 'none',
      sumpPump: 'none',
      region: 'national',
    });
    const minor = calculateBasementWaterproofingCost({
      basementSize: 'medium-500-1000',
      method: 'interior-drainage',
      wallLength: 100,
      crackRepair: 'minor',
      sumpPump: 'none',
      region: 'national',
    });
    expect(minor.crackRepairCost).toBeCloseTo(525, 0); // (250+800)/2
    expect(minor.totalLow as number).toBeCloseTo((none.totalLow as number) + 250, 0);
    expect(minor.totalHigh as number).toBeCloseTo((none.totalHigh as number) + 800, 0);
  });

  // ─── Test 7: Major crack repair ($1000–$3000) ───
  it('adds major crack repair cost ($1000–$3000)', () => {
    const result = calculateBasementWaterproofingCost({
      basementSize: 'medium-500-1000',
      method: 'interior-drainage',
      wallLength: 100,
      crackRepair: 'major',
      sumpPump: 'none',
      region: 'national',
    });
    expect(result.crackRepairCost).toBeCloseTo(2000, 0); // (1000+3000)/2
    expect(result.totalLow).toBeCloseTo(5000 + 1000, 0);
    expect(result.totalHigh).toBeCloseTo(10000 + 3000, 0);
  });

  // ─── Test 8: Standard sump pump ($500–$1500) ───
  it('adds standard sump pump cost ($500–$1500)', () => {
    const none = calculateBasementWaterproofingCost({
      basementSize: 'medium-500-1000',
      method: 'interior-drainage',
      wallLength: 100,
      crackRepair: 'none',
      sumpPump: 'none',
      region: 'national',
    });
    const standard = calculateBasementWaterproofingCost({
      basementSize: 'medium-500-1000',
      method: 'interior-drainage',
      wallLength: 100,
      crackRepair: 'none',
      sumpPump: 'standard',
      region: 'national',
    });
    expect(standard.sumpPumpCost).toBeCloseTo(1000, 0); // (500+1500)/2
    expect(standard.totalLow as number).toBeCloseTo((none.totalLow as number) + 500, 0);
    expect(standard.totalHigh as number).toBeCloseTo((none.totalHigh as number) + 1500, 0);
  });

  // ─── Test 9: Battery-backup sump pump ($1000–$3000) ───
  it('adds battery-backup sump pump cost ($1000–$3000)', () => {
    const result = calculateBasementWaterproofingCost({
      basementSize: 'medium-500-1000',
      method: 'interior-drainage',
      wallLength: 100,
      crackRepair: 'none',
      sumpPump: 'battery-backup',
      region: 'national',
    });
    expect(result.sumpPumpCost).toBeCloseTo(2000, 0); // (1000+3000)/2
    expect(result.totalLow).toBeCloseTo(5000 + 1000, 0);
    expect(result.totalHigh).toBeCloseTo(10000 + 3000, 0);
  });

  // ─── Test 10: Northeast region multiplier (1.20x labor) ───
  it('applies northeast regional labor multiplier (1.20x)', () => {
    const national = calculateBasementWaterproofingCost({
      basementSize: 'medium-500-1000',
      method: 'interior-drainage',
      wallLength: 100,
      crackRepair: 'none',
      sumpPump: 'none',
      region: 'national',
    });
    const northeast = calculateBasementWaterproofingCost({
      basementSize: 'medium-500-1000',
      method: 'interior-drainage',
      wallLength: 100,
      crackRepair: 'none',
      sumpPump: 'none',
      region: 'northeast',
    });
    expect(northeast.materialCost).toBeCloseTo(national.materialCost as number, 0);
    expect(northeast.laborCost as number).toBeCloseTo((national.laborCost as number) * 1.20, 0);
  });

  // ─── Test 11: South region multiplier (0.85x labor) ───
  it('applies south regional labor multiplier (0.85x)', () => {
    const result = calculateBasementWaterproofingCost({
      basementSize: 'medium-500-1000',
      method: 'interior-drainage',
      wallLength: 100,
      crackRepair: 'none',
      sumpPump: 'none',
      region: 'south',
    });
    // Labor low: 3500 × 0.85 = 2975, high: 7000 × 0.85 = 5950
    // Material: 1500 low, 3000 high
    expect(result.totalLow).toBeCloseTo(1500 + 2975, 0);
    expect(result.totalHigh).toBeCloseTo(3000 + 5950, 0);
  });

  // ─── Test 12: West Coast region multiplier (1.25x labor) ───
  it('applies west coast regional labor multiplier (1.25x)', () => {
    const result = calculateBasementWaterproofingCost({
      basementSize: 'medium-500-1000',
      method: 'interior-drainage',
      wallLength: 100,
      crackRepair: 'none',
      sumpPump: 'none',
      region: 'west-coast',
    });
    // Labor low: 3500 × 1.25 = 4375, high: 7000 × 1.25 = 8750
    expect(result.totalLow).toBeCloseTo(1500 + 4375, 0);
    expect(result.totalHigh).toBeCloseTo(3000 + 8750, 0);
  });

  // ─── Test 13: Midwest region multiplier (0.90x labor) ───
  it('applies midwest regional labor multiplier (0.90x)', () => {
    const result = calculateBasementWaterproofingCost({
      basementSize: 'medium-500-1000',
      method: 'interior-drainage',
      wallLength: 100,
      crackRepair: 'none',
      sumpPump: 'none',
      region: 'midwest',
    });
    // Labor low: 3500 × 0.90 = 3150, high: 7000 × 0.90 = 6300
    expect(result.totalLow).toBeCloseTo(1500 + 3150, 0);
    expect(result.totalHigh).toBeCloseTo(3000 + 6300, 0);
  });

  // ─── Test 14: Mid-Atlantic region multiplier (1.15x labor) ───
  it('applies mid-atlantic regional labor multiplier (1.15x)', () => {
    const result = calculateBasementWaterproofingCost({
      basementSize: 'medium-500-1000',
      method: 'interior-drainage',
      wallLength: 100,
      crackRepair: 'none',
      sumpPump: 'none',
      region: 'mid-atlantic',
    });
    // Labor low: 3500 × 1.15 = 4025, high: 7000 × 1.15 = 8050
    expect(result.totalLow).toBeCloseTo(1500 + 4025, 0);
    expect(result.totalHigh).toBeCloseTo(3000 + 8050, 0);
  });

  // ─── Test 15: Mountain West region multiplier (0.95x labor) ───
  it('applies mountain west regional labor multiplier (0.95x)', () => {
    const result = calculateBasementWaterproofingCost({
      basementSize: 'medium-500-1000',
      method: 'interior-drainage',
      wallLength: 100,
      crackRepair: 'none',
      sumpPump: 'none',
      region: 'mountain-west',
    });
    // Labor low: 3500 × 0.95 = 3325, high: 7000 × 0.95 = 6650
    expect(result.totalLow).toBeCloseTo(1500 + 3325, 0);
    expect(result.totalHigh).toBeCloseTo(3000 + 6650, 0);
  });

  // ─── Test 16: Full build — xlarge, exterior excavation, 180 lf, major cracks, battery-backup sump, northeast ───
  it('calculates a fully loaded premium waterproofing project', () => {
    const result = calculateBasementWaterproofingCost({
      basementSize: 'xlarge-over-1500',
      method: 'exterior-excavation',
      wallLength: 180,
      crackRepair: 'major',
      sumpPump: 'battery-backup',
      region: 'northeast',
    });
    // Waterproofing: 180 × $100–$200 = $18000–$36000
    // Material (30%): $5400 low, $10800 high
    // Labor (70% × 1.20): 180×100×0.70×1.20=$15120 low, 180×200×0.70×1.20=$30240 high
    // Crack: $1000–$3000
    // Sump: $1000–$3000
    // TotalLow: 5400 + 15120 + 1000 + 1000 = $22520
    // TotalHigh: 10800 + 30240 + 3000 + 3000 = $47040
    expect(result.totalLow).toBeCloseTo(22520, 0);
    expect(result.totalHigh).toBeCloseTo(47040, 0);
    expect(result.totalMid).toBeCloseTo(34780, 0);
  });

  // ─── Test 17: Cost per linear foot calculation ───
  it('calculates cost per linear foot correctly', () => {
    const result = calculateBasementWaterproofingCost({
      basementSize: 'medium-500-1000',
      method: 'interior-drainage',
      wallLength: 100,
      crackRepair: 'none',
      sumpPump: 'none',
      region: 'national',
    });
    // costPerLinearFoot = totalMid / wallLength = 7500 / 100 = 75
    expect(result.costPerLinearFoot).toBeCloseTo(75, 0);
  });

  // ─── Test 18: Method comparison returns all 4 methods ───
  it('returns method comparison with all 4 methods', () => {
    const result = calculateBasementWaterproofingCost({
      basementSize: 'medium-500-1000',
      method: 'interior-drainage',
      wallLength: 100,
      crackRepair: 'none',
      sumpPump: 'none',
      region: 'national',
    });
    const comparison = result.methodComparison as Array<{ label: string; value: number }>;
    expect(comparison).toHaveLength(4);
    comparison.forEach(item => {
      expect(item.value).toBeGreaterThan(0);
      expect(item.label).toBeTruthy();
    });
    // Interior sealant should be cheapest, exterior excavation most expensive
    const sealant = comparison.find(c => c.label.includes('Sealant'));
    const exterior = comparison.find(c => c.label.includes('Exterior'));
    expect(sealant!.value).toBeLessThan(exterior!.value);
  });

  // ─── Test 19: Timeline output ───
  it('returns correct timeline for each method', () => {
    const sealant = calculateBasementWaterproofingCost({
      basementSize: 'medium-500-1000', method: 'interior-sealant', wallLength: 100,
      crackRepair: 'none', sumpPump: 'none', region: 'national',
    });
    expect(sealant.timeline).toBe('1-2 days');

    const exterior = calculateBasementWaterproofingCost({
      basementSize: 'medium-500-1000', method: 'exterior-excavation', wallLength: 100,
      crackRepair: 'none', sumpPump: 'none', region: 'national',
    });
    expect(exterior.timeline).toBe('5-10 days');

    const combo = calculateBasementWaterproofingCost({
      basementSize: 'medium-500-1000', method: 'combination', wallLength: 100,
      crackRepair: 'none', sumpPump: 'none', region: 'national',
    });
    expect(combo.timeline).toBe('7-14 days');
  });

  // ─── Test 20: Output structure — all expected fields present ───
  it('returns all expected output fields', () => {
    const result = calculateBasementWaterproofingCost({
      basementSize: 'medium-500-1000',
      method: 'interior-drainage',
      wallLength: 100,
      crackRepair: 'none',
      sumpPump: 'none',
      region: 'national',
    });
    expect(result).toHaveProperty('waterproofingCost');
    expect(result).toHaveProperty('crackRepairCost');
    expect(result).toHaveProperty('sumpPumpCost');
    expect(result).toHaveProperty('materialCost');
    expect(result).toHaveProperty('laborCost');
    expect(result).toHaveProperty('totalLow');
    expect(result).toHaveProperty('totalHigh');
    expect(result).toHaveProperty('totalMid');
    expect(result).toHaveProperty('costPerLinearFoot');
    expect(result).toHaveProperty('methodComparison');
    expect(result).toHaveProperty('timeline');
  });

  // ─── Test 21: Default inputs produce valid output ───
  it('uses default inputs when values are missing', () => {
    const result = calculateBasementWaterproofingCost({});
    // Defaults: medium, interior-drainage, wallLength=120 (medium default), none, none, national
    // Waterproofing: 120 × $50–$100 = $6000–$12000
    expect(result.totalLow).toBeCloseTo(6000, 0);
    expect(result.totalHigh).toBeCloseTo(12000, 0);
  });

  // ─── Test 22: Small basement uses default wall length 80 ───
  it('uses default wall length for small basement when not provided', () => {
    const result = calculateBasementWaterproofingCost({
      basementSize: 'small-under-500',
      method: 'interior-sealant',
      crackRepair: 'none',
      sumpPump: 'none',
      region: 'national',
    });
    // Default wall for small: 80 lf
    // Waterproofing: 80 × $3–$7 = $240–$560
    expect(result.totalLow).toBeCloseTo(240, 0);
    expect(result.totalHigh).toBeCloseTo(560, 0);
  });

  // ─── Test 23: Crack repair + sump pump stacking ───
  it('stacks crack repair and sump pump add-ons correctly', () => {
    const result = calculateBasementWaterproofingCost({
      basementSize: 'medium-500-1000',
      method: 'interior-drainage',
      wallLength: 100,
      crackRepair: 'minor',
      sumpPump: 'standard',
      region: 'national',
    });
    // Base: $5000–$10000
    // Crack minor: $250–$800
    // Sump standard: $500–$1500
    expect(result.totalLow).toBeCloseTo(5000 + 250 + 500, 0);
    expect(result.totalHigh).toBeCloseTo(10000 + 800 + 1500, 0);
  });

  // ─── Test 24: Wall length clamped at minimum 20 ───
  it('clamps wall length to minimum 20 linear feet', () => {
    const result = calculateBasementWaterproofingCost({
      basementSize: 'small-under-500',
      method: 'interior-sealant',
      wallLength: 5,
      crackRepair: 'none',
      sumpPump: 'none',
      region: 'national',
    });
    // Clamped to 20 lf
    // Waterproofing: 20 × $3–$7 = $60–$140
    expect(result.totalLow).toBeCloseTo(60, 0);
    expect(result.totalHigh).toBeCloseTo(140, 0);
  });
});
