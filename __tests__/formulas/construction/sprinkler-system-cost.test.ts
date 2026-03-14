import { calculateSprinklerSystemCost } from '../../../lib/formulas/construction/sprinkler-system-cost';

describe('calculateSprinklerSystemCost', () => {
  // ─── Test 1: Default inputs — medium lawn, in-ground automatic, 4 zones, normal soil, no backflow, national ───
  it('calculates default sprinkler system at national average', () => {
    const result = calculateSprinklerSystemCost({
      lawnSize: 'medium-2500-5000',
      systemType: 'in-ground-automatic',
      zones: 4,
      soilType: 'normal',
      backflowPreventer: 'none',
      region: 'national',
    });
    // System: $2500–$4500 × 1.0 = $2500–$4500
    // Material (40%): $1000 low, $1800 high
    // Labor (60% × 1.0 soil × 1.0 region): $1500 low, $2700 high
    // Zones: 4 included for medium, 0 extra = $0
    // Backflow: $0
    // TotalLow: 1000 + 1500 + 0 + 0 = $2500
    // TotalHigh: 1800 + 2700 + 0 + 0 = $4500
    expect(result.totalLow).toBeCloseTo(2500, 0);
    expect(result.totalHigh).toBeCloseTo(4500, 0);
    expect(result.totalMid).toBeCloseTo(3500, 0);
    expect(result.materialCost).toBeCloseTo(1400, 0); // (1000+1800)/2
    expect(result.laborCost).toBeCloseTo(2100, 0); // (1500+2700)/2
    expect(result.backflowCost).toBe(0);
    expect(result.zoneAdjustment).toBe(0);
  });

  // ─── Test 2: Small lawn size ───
  it('calculates small lawn sprinkler costs', () => {
    const result = calculateSprinklerSystemCost({
      lawnSize: 'small-under-2500',
      systemType: 'in-ground-automatic',
      zones: 3,
      soilType: 'normal',
      backflowPreventer: 'none',
      region: 'national',
    });
    // System: $1500–$2500 × 1.0
    // Material: $600–$1000, Labor: $900–$1500
    // Zones: 3 included for small, 0 extra
    expect(result.totalLow).toBeCloseTo(1500, 0);
    expect(result.totalHigh).toBeCloseTo(2500, 0);
  });

  // ─── Test 3: Large lawn size ───
  it('calculates large lawn sprinkler costs', () => {
    const result = calculateSprinklerSystemCost({
      lawnSize: 'large-5000-10000',
      systemType: 'in-ground-automatic',
      zones: 6,
      soilType: 'normal',
      backflowPreventer: 'none',
      region: 'national',
    });
    // System: $4500–$7500 × 1.0
    // Material: $1800–$3000, Labor: $2700–$4500
    // Zones: 6 included for large, 0 extra
    expect(result.totalLow).toBeCloseTo(4500, 0);
    expect(result.totalHigh).toBeCloseTo(7500, 0);
  });

  // ─── Test 4: Extra large lawn size ───
  it('calculates xlarge lawn sprinkler costs', () => {
    const result = calculateSprinklerSystemCost({
      lawnSize: 'xlarge-over-10000',
      systemType: 'in-ground-automatic',
      zones: 8,
      soilType: 'normal',
      backflowPreventer: 'none',
      region: 'national',
    });
    // System: $7500–$12000 × 1.0
    // Material: $3000–$4800, Labor: $4500–$7200
    expect(result.totalLow).toBeCloseTo(7500, 0);
    expect(result.totalHigh).toBeCloseTo(12000, 0);
  });

  // ─── Test 5: Above-ground system type (0.40x) ───
  it('applies above-ground system multiplier (0.40x)', () => {
    const result = calculateSprinklerSystemCost({
      lawnSize: 'medium-2500-5000',
      systemType: 'above-ground',
      zones: 4,
      soilType: 'normal',
      backflowPreventer: 'none',
      region: 'national',
    });
    // System: $2500×0.40=$1000 low, $4500×0.40=$1800 high
    // Material: $400 low, $720 high
    // Labor: $600 low, $1080 high
    expect(result.totalLow).toBeCloseTo(1000, 0);
    expect(result.totalHigh).toBeCloseTo(1800, 0);
  });

  // ─── Test 6: In-ground manual system type (0.85x) ───
  it('applies in-ground manual system multiplier (0.85x)', () => {
    const result = calculateSprinklerSystemCost({
      lawnSize: 'medium-2500-5000',
      systemType: 'in-ground-manual',
      zones: 4,
      soilType: 'normal',
      backflowPreventer: 'none',
      region: 'national',
    });
    // System: $2500×0.85=$2125 low, $4500×0.85=$3825 high
    // Material: $850 low, $1530 high
    // Labor: $1275 low, $2295 high
    expect(result.totalLow).toBeCloseTo(2125, 0);
    expect(result.totalHigh).toBeCloseTo(3825, 0);
  });

  // ─── Test 7: Drip irrigation system type (0.70x) ───
  it('applies drip irrigation system multiplier (0.70x)', () => {
    const result = calculateSprinklerSystemCost({
      lawnSize: 'medium-2500-5000',
      systemType: 'drip-irrigation',
      zones: 4,
      soilType: 'normal',
      backflowPreventer: 'none',
      region: 'national',
    });
    // System: $2500×0.70=$1750 low, $4500×0.70=$3150 high
    // Material: $700 low, $1260 high
    // Labor: $1050 low, $1890 high
    expect(result.totalLow).toBeCloseTo(1750, 0);
    expect(result.totalHigh).toBeCloseTo(3150, 0);
  });

  // ─── Test 8: Extra zones add $200–$400 each ───
  it('adds zone adjustment for extra zones beyond included', () => {
    const result = calculateSprinklerSystemCost({
      lawnSize: 'medium-2500-5000',
      systemType: 'in-ground-automatic',
      zones: 7, // medium includes 4, so 3 extra
      soilType: 'normal',
      backflowPreventer: 'none',
      region: 'national',
    });
    // Base: $2500–$4500
    // Zone adj: 3 × $200=$600 low, 3 × $400=$1200 high
    expect(result.totalLow).toBeCloseTo(2500 + 600, 0);
    expect(result.totalHigh).toBeCloseTo(4500 + 1200, 0);
    expect(result.zoneAdjustment).toBeCloseTo(900, 0); // (600+1200)/2
  });

  // ─── Test 9: No extra zones when at or below included count ───
  it('does not add zone adjustment when zones <= included', () => {
    const result = calculateSprinklerSystemCost({
      lawnSize: 'medium-2500-5000',
      systemType: 'in-ground-automatic',
      zones: 2, // medium includes 4, so 0 extra
      soilType: 'normal',
      backflowPreventer: 'none',
      region: 'national',
    });
    expect(result.zoneAdjustment).toBe(0);
    expect(result.totalLow).toBeCloseTo(2500, 0);
  });

  // ─── Test 10: Clay soil multiplier (1.15x on labor) ───
  it('applies clay soil multiplier (1.15x) on labor', () => {
    const national = calculateSprinklerSystemCost({
      lawnSize: 'medium-2500-5000',
      systemType: 'in-ground-automatic',
      zones: 4,
      soilType: 'normal',
      backflowPreventer: 'none',
      region: 'national',
    });
    const clay = calculateSprinklerSystemCost({
      lawnSize: 'medium-2500-5000',
      systemType: 'in-ground-automatic',
      zones: 4,
      soilType: 'clay',
      backflowPreventer: 'none',
      region: 'national',
    });
    // Material stays same, labor increases by 1.15x
    expect(clay.materialCost).toBeCloseTo(national.materialCost as number, 0);
    expect(clay.laborCost as number).toBeCloseTo((national.laborCost as number) * 1.15, 0);
  });

  // ─── Test 11: Rocky soil multiplier (1.30x on labor) ───
  it('applies rocky soil multiplier (1.30x) on labor', () => {
    const result = calculateSprinklerSystemCost({
      lawnSize: 'medium-2500-5000',
      systemType: 'in-ground-automatic',
      zones: 4,
      soilType: 'rocky',
      backflowPreventer: 'none',
      region: 'national',
    });
    // Labor low: 2500 × 0.60 × 1.30 = 1950, high: 4500 × 0.60 × 1.30 = 3510
    // Material: 1000 low, 1800 high
    expect(result.totalLow).toBeCloseTo(1000 + 1950, 0);
    expect(result.totalHigh).toBeCloseTo(1800 + 3510, 0);
  });

  // ─── Test 12: Standard backflow preventer ($100–$300) ───
  it('adds standard backflow preventer cost ($100–$300)', () => {
    const none = calculateSprinklerSystemCost({
      lawnSize: 'medium-2500-5000',
      systemType: 'in-ground-automatic',
      zones: 4,
      soilType: 'normal',
      backflowPreventer: 'none',
      region: 'national',
    });
    const standard = calculateSprinklerSystemCost({
      lawnSize: 'medium-2500-5000',
      systemType: 'in-ground-automatic',
      zones: 4,
      soilType: 'normal',
      backflowPreventer: 'standard',
      region: 'national',
    });
    expect(standard.backflowCost).toBeCloseTo(200, 0); // (100+300)/2
    expect(standard.totalLow as number).toBeCloseTo((none.totalLow as number) + 100, 0);
    expect(standard.totalHigh as number).toBeCloseTo((none.totalHigh as number) + 300, 0);
  });

  // ─── Test 13: RPZ valve backflow preventer ($300–$600) ───
  it('adds RPZ valve backflow preventer cost ($300–$600)', () => {
    const result = calculateSprinklerSystemCost({
      lawnSize: 'medium-2500-5000',
      systemType: 'in-ground-automatic',
      zones: 4,
      soilType: 'normal',
      backflowPreventer: 'rpz-valve',
      region: 'national',
    });
    expect(result.backflowCost).toBeCloseTo(450, 0); // (300+600)/2
    expect(result.totalLow).toBeCloseTo(2500 + 300, 0);
    expect(result.totalHigh).toBeCloseTo(4500 + 600, 0);
  });

  // ─── Test 14: Northeast region multiplier (1.20x labor) ───
  it('applies northeast regional labor multiplier (1.20x)', () => {
    const national = calculateSprinklerSystemCost({
      lawnSize: 'medium-2500-5000',
      systemType: 'in-ground-automatic',
      zones: 4,
      soilType: 'normal',
      backflowPreventer: 'none',
      region: 'national',
    });
    const northeast = calculateSprinklerSystemCost({
      lawnSize: 'medium-2500-5000',
      systemType: 'in-ground-automatic',
      zones: 4,
      soilType: 'normal',
      backflowPreventer: 'none',
      region: 'northeast',
    });
    expect(northeast.materialCost).toBeCloseTo(national.materialCost as number, 0);
    expect(northeast.laborCost as number).toBeCloseTo((national.laborCost as number) * 1.20, 0);
  });

  // ─── Test 15: South region multiplier (0.85x labor) ───
  it('applies south regional labor multiplier (0.85x)', () => {
    const result = calculateSprinklerSystemCost({
      lawnSize: 'medium-2500-5000',
      systemType: 'in-ground-automatic',
      zones: 4,
      soilType: 'normal',
      backflowPreventer: 'none',
      region: 'south',
    });
    // Labor low: 1500 × 0.85 = 1275, high: 2700 × 0.85 = 2295
    // Material: 1000 low, 1800 high
    expect(result.totalLow).toBeCloseTo(1000 + 1275, 0);
    expect(result.totalHigh).toBeCloseTo(1800 + 2295, 0);
  });

  // ─── Test 16: West Coast region multiplier (1.25x labor) ───
  it('applies west coast regional labor multiplier (1.25x)', () => {
    const result = calculateSprinklerSystemCost({
      lawnSize: 'medium-2500-5000',
      systemType: 'in-ground-automatic',
      zones: 4,
      soilType: 'normal',
      backflowPreventer: 'none',
      region: 'west-coast',
    });
    // Labor low: 1500 × 1.25 = 1875, high: 2700 × 1.25 = 3375
    expect(result.totalLow).toBeCloseTo(1000 + 1875, 0);
    expect(result.totalHigh).toBeCloseTo(1800 + 3375, 0);
  });

  // ─── Test 17: Midwest region multiplier (0.90x labor) ───
  it('applies midwest regional labor multiplier (0.90x)', () => {
    const result = calculateSprinklerSystemCost({
      lawnSize: 'medium-2500-5000',
      systemType: 'in-ground-automatic',
      zones: 4,
      soilType: 'normal',
      backflowPreventer: 'none',
      region: 'midwest',
    });
    // Labor low: 1500 × 0.90 = 1350, high: 2700 × 0.90 = 2430
    expect(result.totalLow).toBeCloseTo(1000 + 1350, 0);
    expect(result.totalHigh).toBeCloseTo(1800 + 2430, 0);
  });

  // ─── Test 18: Mid-Atlantic region multiplier (1.15x labor) ───
  it('applies mid-atlantic regional labor multiplier (1.15x)', () => {
    const result = calculateSprinklerSystemCost({
      lawnSize: 'medium-2500-5000',
      systemType: 'in-ground-automatic',
      zones: 4,
      soilType: 'normal',
      backflowPreventer: 'none',
      region: 'mid-atlantic',
    });
    // Labor low: 1500 × 1.15 = 1725, high: 2700 × 1.15 = 3105
    expect(result.totalLow).toBeCloseTo(1000 + 1725, 0);
    expect(result.totalHigh).toBeCloseTo(1800 + 3105, 0);
  });

  // ─── Test 19: Mountain West region multiplier (0.95x labor) ───
  it('applies mountain west regional labor multiplier (0.95x)', () => {
    const result = calculateSprinklerSystemCost({
      lawnSize: 'medium-2500-5000',
      systemType: 'in-ground-automatic',
      zones: 4,
      soilType: 'normal',
      backflowPreventer: 'none',
      region: 'mountain-west',
    });
    // Labor low: 1500 × 0.95 = 1425, high: 2700 × 0.95 = 2565
    expect(result.totalLow).toBeCloseTo(1000 + 1425, 0);
    expect(result.totalHigh).toBeCloseTo(1800 + 2565, 0);
  });

  // ─── Test 20: Full build — xlarge, in-ground auto, 12 zones, rocky, RPZ valve, northeast ───
  it('calculates a fully loaded premium sprinkler system', () => {
    const result = calculateSprinklerSystemCost({
      lawnSize: 'xlarge-over-10000',
      systemType: 'in-ground-automatic',
      zones: 12,
      soilType: 'rocky',
      backflowPreventer: 'rpz-valve',
      region: 'northeast',
    });
    // System: $7500–$12000 × 1.0
    // Material: $3000 low, $4800 high
    // Labor: $7500×0.60×1.30×1.20 = $7020 low, $12000×0.60×1.30×1.20 = $11232 high
    // Zones: 12 - 8 = 4 extra × $200=$800 low, 4 × $400=$1600 high
    // Backflow: $300 low, $600 high
    // TotalLow: 3000 + 7020 + 800 + 300 = $11120
    // TotalHigh: 4800 + 11232 + 1600 + 600 = $18232
    expect(result.totalLow).toBeCloseTo(11120, 0);
    expect(result.totalHigh).toBeCloseTo(18232, 0);
    expect(result.totalMid).toBeCloseTo(14676, 0);
  });

  // ─── Test 21: Cost per zone calculation ───
  it('calculates cost per zone correctly', () => {
    const result = calculateSprinklerSystemCost({
      lawnSize: 'medium-2500-5000',
      systemType: 'in-ground-automatic',
      zones: 4,
      soilType: 'normal',
      backflowPreventer: 'none',
      region: 'national',
    });
    // costPerZone = totalMid / zones = 3500 / 4 = 875
    expect(result.costPerZone).toBeCloseTo(875, 0);
  });

  // ─── Test 22: System comparison returns all 4 system types ───
  it('returns system comparison with all 4 types', () => {
    const result = calculateSprinklerSystemCost({
      lawnSize: 'medium-2500-5000',
      systemType: 'in-ground-automatic',
      zones: 4,
      soilType: 'normal',
      backflowPreventer: 'none',
      region: 'national',
    });
    const comparison = result.systemComparison as Array<{ label: string; value: number }>;
    expect(comparison).toHaveLength(4);
    comparison.forEach(item => {
      expect(item.value).toBeGreaterThan(0);
      expect(item.label).toBeTruthy();
    });
    // Above-ground should be cheapest, in-ground automatic most expensive
    const aboveGround = comparison.find(c => c.label.includes('Above-Ground'));
    const automatic = comparison.find(c => c.label.includes('Automatic'));
    expect(aboveGround!.value).toBeLessThan(automatic!.value);
  });

  // ─── Test 23: Timeline output ───
  it('returns correct timeline for each lawn size', () => {
    const small = calculateSprinklerSystemCost({
      lawnSize: 'small-under-2500', systemType: 'in-ground-automatic', zones: 3,
      soilType: 'normal', backflowPreventer: 'none', region: 'national',
    });
    expect(small.timeline).toBe('1-2 days');

    const xlarge = calculateSprinklerSystemCost({
      lawnSize: 'xlarge-over-10000', systemType: 'in-ground-automatic', zones: 8,
      soilType: 'normal', backflowPreventer: 'none', region: 'national',
    });
    expect(xlarge.timeline).toBe('5-7 days');
  });

  // ─── Test 24: Output structure — all expected fields present ───
  it('returns all expected output fields', () => {
    const result = calculateSprinklerSystemCost({
      lawnSize: 'medium-2500-5000',
      systemType: 'in-ground-automatic',
      zones: 4,
      soilType: 'normal',
      backflowPreventer: 'none',
      region: 'national',
    });
    expect(result).toHaveProperty('materialCost');
    expect(result).toHaveProperty('laborCost');
    expect(result).toHaveProperty('backflowCost');
    expect(result).toHaveProperty('zoneAdjustment');
    expect(result).toHaveProperty('totalLow');
    expect(result).toHaveProperty('totalHigh');
    expect(result).toHaveProperty('totalMid');
    expect(result).toHaveProperty('costPerZone');
    expect(result).toHaveProperty('systemComparison');
    expect(result).toHaveProperty('timeline');
  });

  // ─── Test 25: Default inputs produce valid output ───
  it('uses default inputs when values are missing', () => {
    const result = calculateSprinklerSystemCost({});
    // Defaults: medium, in-ground-automatic, 4 zones, normal, none, national
    expect(result.totalLow).toBeCloseTo(2500, 0);
    expect(result.totalHigh).toBeCloseTo(4500, 0);
  });

  // ─── Test 26: Clay soil + rocky soil combined with region ───
  it('compounds soil and region multipliers on labor', () => {
    const result = calculateSprinklerSystemCost({
      lawnSize: 'medium-2500-5000',
      systemType: 'in-ground-automatic',
      zones: 4,
      soilType: 'clay',
      backflowPreventer: 'none',
      region: 'northeast',
    });
    // Labor low: 2500 × 0.60 × 1.15 × 1.20 = 2070
    // Labor high: 4500 × 0.60 × 1.15 × 1.20 = 3726
    // Material: 1000 low, 1800 high
    expect(result.totalLow).toBeCloseTo(1000 + 2070, 0);
    expect(result.totalHigh).toBeCloseTo(1800 + 3726, 0);
  });
});
