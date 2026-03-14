import { calculateAccessibilityRemodelCost } from '../../../lib/formulas/construction/accessibility-remodel-cost';

describe('calculateAccessibilityRemodelCost', () => {
  // ─── Test 1: Default inputs — bathroom-ada, ambulatory-assist, no add-ons, national ───
  it('calculates default accessibility remodel at national average', () => {
    const result = calculateAccessibilityRemodelCost({}) as Record<string, number | string | Array<{ label: string; value: number }>>;
    // Default: bathroom-ada ($5000–$15000), ambulatory-assist (1.0x), no add-ons, national (1.0x)
    // adjustedBase: 5000–15000
    // labor (45% × 1.0): 2250–6750
    // totalLow: 5000 + 0 + 0 + 0 + 2250 = 7250
    // totalHigh: 15000 + 0 + 0 + 0 + 6750 = 21750
    expect(result.totalLow).toBeCloseTo(7250, 0);
    expect(result.totalHigh).toBeCloseTo(21750, 0);
    expect(result.totalMid).toBeCloseTo(14500, 0);
    expect(result.timeline).toBeTruthy();
  });

  // ─── Test 2: All required output fields present ───
  it('returns all expected output fields', () => {
    const result = calculateAccessibilityRemodelCost({
      projectScope: 'bathroom-ada',
      mobilityLevel: 'ambulatory-assist',
      bathroomMods: 'none',
      doorwayWidening: 'none',
      flooringChanges: 'none',
      region: 'national',
    });
    expect(result).toHaveProperty('baseCost');
    expect(result).toHaveProperty('bathroomCost');
    expect(result).toHaveProperty('doorwayCost');
    expect(result).toHaveProperty('flooringCost');
    expect(result).toHaveProperty('laborCost');
    expect(result).toHaveProperty('subtotalLow');
    expect(result).toHaveProperty('subtotalHigh');
    expect(result).toHaveProperty('subtotal');
    expect(result).toHaveProperty('totalLow');
    expect(result).toHaveProperty('totalHigh');
    expect(result).toHaveProperty('totalMid');
    expect(result).toHaveProperty('scopeComparison');
    expect(result).toHaveProperty('timeline');
  });

  // ─── Test 3: basic-grab-bars scope ($500–$1500) ───
  it('calculates basic grab bars scope correctly', () => {
    const result = calculateAccessibilityRemodelCost({
      projectScope: 'basic-grab-bars',
      mobilityLevel: 'ambulatory-assist',
      bathroomMods: 'none',
      doorwayWidening: 'none',
      flooringChanges: 'none',
      region: 'national',
    }) as Record<string, number | string | Array<{ label: string; value: number }>>;
    // base: $500–$1500, labor (45%): $225–$675
    // totalLow: 500 + 225 = 725
    // totalHigh: 1500 + 675 = 2175
    expect(result.totalLow).toBeCloseTo(725, 0);
    expect(result.totalHigh).toBeCloseTo(2175, 0);
    expect(result.timeline).toBe('1-2 hours');
  });

  // ─── Test 4: kitchen-ada scope ($8000–$20000) ───
  it('calculates kitchen ADA remodel scope correctly', () => {
    const result = calculateAccessibilityRemodelCost({
      projectScope: 'kitchen-ada',
      mobilityLevel: 'ambulatory-assist',
      bathroomMods: 'none',
      doorwayWidening: 'none',
      flooringChanges: 'none',
      region: 'national',
    }) as Record<string, number | string | Array<{ label: string; value: number }>>;
    // base: $8000–$20000, labor (45%): $3600–$9000
    // totalLow: 8000 + 3600 = 11600
    // totalHigh: 20000 + 9000 = 29000
    expect(result.totalLow).toBeCloseTo(11600, 0);
    expect(result.totalHigh).toBeCloseTo(29000, 0);
    expect(result.timeline).toBe('2-4 weeks');
  });

  // ─── Test 5: entrance-ramp scope ($2000–$8000) ───
  it('calculates entrance ramp scope correctly', () => {
    const result = calculateAccessibilityRemodelCost({
      projectScope: 'entrance-ramp',
      mobilityLevel: 'ambulatory-assist',
      bathroomMods: 'none',
      doorwayWidening: 'none',
      flooringChanges: 'none',
      region: 'national',
    }) as Record<string, number | string | Array<{ label: string; value: number }>>;
    // base: $2000–$8000, labor (45%): $900–$3600
    // totalLow: 2000 + 900 = 2900
    // totalHigh: 8000 + 3600 = 11600
    expect(result.totalLow).toBeCloseTo(2900, 0);
    expect(result.totalHigh).toBeCloseTo(11600, 0);
    expect(result.timeline).toBe('2-5 days');
  });

  // ─── Test 6: whole-home scope ($20000–$100000) ───
  it('calculates whole-home accessibility scope correctly', () => {
    const result = calculateAccessibilityRemodelCost({
      projectScope: 'whole-home',
      mobilityLevel: 'ambulatory-assist',
      bathroomMods: 'none',
      doorwayWidening: 'none',
      flooringChanges: 'none',
      region: 'national',
    }) as Record<string, number | string | Array<{ label: string; value: number }>>;
    // base: $20000–$100000, labor (45%): $9000–$45000
    // totalLow: 20000 + 9000 = 29000
    // totalHigh: 100000 + 45000 = 145000
    expect(result.totalLow).toBeCloseTo(29000, 0);
    expect(result.totalHigh).toBeCloseTo(145000, 0);
    expect(result.timeline).toBe('4-12 weeks');
  });

  // ─── Test 7: wheelchair-partial mobility multiplier (1.25x) ───
  it('applies wheelchair-partial mobility multiplier (1.25x to base)', () => {
    const ambulatory = calculateAccessibilityRemodelCost({
      projectScope: 'bathroom-ada',
      mobilityLevel: 'ambulatory-assist',
      bathroomMods: 'none',
      doorwayWidening: 'none',
      flooringChanges: 'none',
      region: 'national',
    }) as Record<string, number>;
    const partial = calculateAccessibilityRemodelCost({
      projectScope: 'bathroom-ada',
      mobilityLevel: 'wheelchair-partial',
      bathroomMods: 'none',
      doorwayWidening: 'none',
      flooringChanges: 'none',
      region: 'national',
    }) as Record<string, number>;
    // wheelchair-partial adjustedBase = base × 1.25; labor stays on original base
    // totalLow: (5000×1.25) + (5000×0.45) = 6250 + 2250 = 8500
    // totalHigh: (15000×1.25) + (15000×0.45) = 18750 + 6750 = 25500
    expect(partial.totalLow).toBeCloseTo(8500, 0);
    expect(partial.totalHigh).toBeCloseTo(25500, 0);
    expect(partial.baseCost).toBeGreaterThan(ambulatory.baseCost);
  });

  // ─── Test 8: wheelchair-full mobility multiplier (1.50x) ───
  it('applies wheelchair-full mobility multiplier (1.50x to base)', () => {
    const result = calculateAccessibilityRemodelCost({
      projectScope: 'bathroom-ada',
      mobilityLevel: 'wheelchair-full',
      bathroomMods: 'none',
      doorwayWidening: 'none',
      flooringChanges: 'none',
      region: 'national',
    }) as Record<string, number>;
    // totalLow: (5000×1.5) + (5000×0.45) = 7500 + 2250 = 9750
    // totalHigh: (15000×1.5) + (15000×0.45) = 22500 + 6750 = 29250
    expect(result.totalLow).toBeCloseTo(9750, 0);
    expect(result.totalHigh).toBeCloseTo(29250, 0);
  });

  // ─── Test 9: grab-bars-only bathroom modification (+$200–$600) ───
  it('adds grab-bars-only bathroom modification cost', () => {
    const none = calculateAccessibilityRemodelCost({
      projectScope: 'bathroom-ada',
      mobilityLevel: 'ambulatory-assist',
      bathroomMods: 'none',
      doorwayWidening: 'none',
      flooringChanges: 'none',
      region: 'national',
    }) as Record<string, number>;
    const grabBars = calculateAccessibilityRemodelCost({
      projectScope: 'bathroom-ada',
      mobilityLevel: 'ambulatory-assist',
      bathroomMods: 'grab-bars-only',
      doorwayWidening: 'none',
      flooringChanges: 'none',
      region: 'national',
    }) as Record<string, number>;
    expect(grabBars.bathroomCost).toBeCloseTo(400, 0); // (200+600)/2
    expect(grabBars.totalLow).toBeCloseTo(none.totalLow + 200, 0);
    expect(grabBars.totalHigh).toBeCloseTo(none.totalHigh + 600, 0);
  });

  // ─── Test 10: roll-in-shower bathroom modification (+$3000–$8000) ───
  it('adds roll-in-shower bathroom modification cost', () => {
    const result = calculateAccessibilityRemodelCost({
      projectScope: 'bathroom-ada',
      mobilityLevel: 'ambulatory-assist',
      bathroomMods: 'roll-in-shower',
      doorwayWidening: 'none',
      flooringChanges: 'none',
      region: 'national',
    }) as Record<string, number>;
    expect(result.bathroomCost).toBeCloseTo(5500, 0); // (3000+8000)/2
    expect(result.totalLow).toBeCloseTo(7250 + 3000, 0);
    expect(result.totalHigh).toBeCloseTo(21750 + 8000, 0);
  });

  // ─── Test 11: full-ada-bathroom modification (+$8000–$20000) ───
  it('adds full-ada-bathroom modification cost', () => {
    const result = calculateAccessibilityRemodelCost({
      projectScope: 'bathroom-ada',
      mobilityLevel: 'ambulatory-assist',
      bathroomMods: 'full-ada-bathroom',
      doorwayWidening: 'none',
      flooringChanges: 'none',
      region: 'national',
    }) as Record<string, number>;
    expect(result.bathroomCost).toBeCloseTo(14000, 0); // (8000+20000)/2
    expect(result.totalLow).toBeCloseTo(7250 + 8000, 0);
    expect(result.totalHigh).toBeCloseTo(21750 + 20000, 0);
  });

  // ─── Test 12: doorway widening 1-2 doorways (+$500–$1500) ───
  it('adds 1-2 doorway widening cost', () => {
    const none = calculateAccessibilityRemodelCost({
      projectScope: 'bathroom-ada',
      mobilityLevel: 'ambulatory-assist',
      bathroomMods: 'none',
      doorwayWidening: 'none',
      flooringChanges: 'none',
      region: 'national',
    }) as Record<string, number>;
    const doors = calculateAccessibilityRemodelCost({
      projectScope: 'bathroom-ada',
      mobilityLevel: 'ambulatory-assist',
      bathroomMods: 'none',
      doorwayWidening: '1-2-doorways',
      flooringChanges: 'none',
      region: 'national',
    }) as Record<string, number>;
    expect(doors.doorwayCost).toBeCloseTo(1000, 0); // (500+1500)/2
    expect(doors.totalLow).toBeCloseTo(none.totalLow + 500, 0);
    expect(doors.totalHigh).toBeCloseTo(none.totalHigh + 1500, 0);
  });

  // ─── Test 13: 6-plus-doorways widening (+$3000–$8000) ───
  it('adds 6-plus doorway widening cost', () => {
    const result = calculateAccessibilityRemodelCost({
      projectScope: 'bathroom-ada',
      mobilityLevel: 'ambulatory-assist',
      bathroomMods: 'none',
      doorwayWidening: '6-plus-doorways',
      flooringChanges: 'none',
      region: 'national',
    }) as Record<string, number>;
    expect(result.doorwayCost).toBeCloseTo(5500, 0); // (3000+8000)/2
    expect(result.totalLow).toBeCloseTo(7250 + 3000, 0);
    expect(result.totalHigh).toBeCloseTo(21750 + 8000, 0);
  });

  // ─── Test 14: full-non-slip flooring (+$2000–$6000) ───
  it('adds full non-slip flooring cost', () => {
    const result = calculateAccessibilityRemodelCost({
      projectScope: 'bathroom-ada',
      mobilityLevel: 'ambulatory-assist',
      bathroomMods: 'none',
      doorwayWidening: 'none',
      flooringChanges: 'full-non-slip',
      region: 'national',
    }) as Record<string, number>;
    expect(result.flooringCost).toBeCloseTo(4000, 0); // (2000+6000)/2
    expect(result.totalLow).toBeCloseTo(7250 + 2000, 0);
    expect(result.totalHigh).toBeCloseTo(21750 + 6000, 0);
  });

  // ─── Test 15: Northeast region (1.20x labor) ───
  it('applies northeast regional labor multiplier (1.20x)', () => {
    const national = calculateAccessibilityRemodelCost({
      projectScope: 'bathroom-ada',
      mobilityLevel: 'ambulatory-assist',
      bathroomMods: 'none',
      doorwayWidening: 'none',
      flooringChanges: 'none',
      region: 'national',
    }) as Record<string, number>;
    const northeast = calculateAccessibilityRemodelCost({
      projectScope: 'bathroom-ada',
      mobilityLevel: 'ambulatory-assist',
      bathroomMods: 'none',
      doorwayWidening: 'none',
      flooringChanges: 'none',
      region: 'northeast',
    }) as Record<string, number>;
    // laborLow northeast: 5000×0.45×1.20 = 2700 vs national 2250
    // totalLow northeast: 5000 + 2700 = 7700 vs national 7250
    expect(northeast.laborCost).toBeGreaterThan(national.laborCost);
    expect(northeast.totalLow).toBeCloseTo(7700, 0);
    expect(northeast.totalHigh).toBeCloseTo(23100, 0);
  });

  // ─── Test 16: West Coast region (1.25x labor) ───
  it('applies west coast regional labor multiplier (1.25x)', () => {
    const result = calculateAccessibilityRemodelCost({
      projectScope: 'bathroom-ada',
      mobilityLevel: 'ambulatory-assist',
      bathroomMods: 'none',
      doorwayWidening: 'none',
      flooringChanges: 'none',
      region: 'west-coast',
    }) as Record<string, number>;
    // laborLow: 5000×0.45×1.25 = 2812.5, totalLow: 5000 + 2812.5 = 7812.5
    // laborHigh: 15000×0.45×1.25 = 8437.5, totalHigh: 15000 + 8437.5 = 23437.5
    expect(result.totalLow).toBeCloseTo(7812.5, 0);
    expect(result.totalHigh).toBeCloseTo(23437.5, 0);
  });

  // ─── Test 17: South region (0.85x labor) ───
  it('applies south regional labor multiplier (0.85x)', () => {
    const result = calculateAccessibilityRemodelCost({
      projectScope: 'bathroom-ada',
      mobilityLevel: 'ambulatory-assist',
      bathroomMods: 'none',
      doorwayWidening: 'none',
      flooringChanges: 'none',
      region: 'south',
    }) as Record<string, number>;
    // laborLow: 5000×0.45×0.85 = 1912.5
    // totalLow: 5000 + 1912.5 = 6912.5
    expect(result.totalLow).toBeCloseTo(6912.5, 0);
    expect(result.totalHigh).toBeCloseTo(20737.5, 0);
  });

  // ─── Test 18: Midwest region (0.90x labor) ───
  it('applies midwest regional labor multiplier (0.90x)', () => {
    const result = calculateAccessibilityRemodelCost({
      projectScope: 'bathroom-ada',
      mobilityLevel: 'ambulatory-assist',
      bathroomMods: 'none',
      doorwayWidening: 'none',
      flooringChanges: 'none',
      region: 'midwest',
    }) as Record<string, number>;
    // laborLow: 5000×0.45×0.90 = 2025
    // totalLow: 5000 + 2025 = 7025
    expect(result.totalLow).toBeCloseTo(7025, 0);
    expect(result.totalHigh).toBeCloseTo(21075, 0);
  });

  // ─── Test 19: Mid-Atlantic region (1.15x labor) ───
  it('applies mid-atlantic regional labor multiplier (1.15x)', () => {
    const result = calculateAccessibilityRemodelCost({
      projectScope: 'bathroom-ada',
      mobilityLevel: 'ambulatory-assist',
      bathroomMods: 'none',
      doorwayWidening: 'none',
      flooringChanges: 'none',
      region: 'mid-atlantic',
    }) as Record<string, number>;
    // laborLow: 5000×0.45×1.15 = 2587.5
    // totalLow: 5000 + 2587.5 = 7587.5
    expect(result.totalLow).toBeCloseTo(7587.5, 0);
    expect(result.totalHigh).toBeCloseTo(22762.5, 0);
  });

  // ─── Test 20: Mountain West region (0.95x labor) ───
  it('applies mountain-west regional labor multiplier (0.95x)', () => {
    const result = calculateAccessibilityRemodelCost({
      projectScope: 'bathroom-ada',
      mobilityLevel: 'ambulatory-assist',
      bathroomMods: 'none',
      doorwayWidening: 'none',
      flooringChanges: 'none',
      region: 'mountain-west',
    }) as Record<string, number>;
    // laborLow: 5000×0.45×0.95 = 2137.5
    // totalLow: 5000 + 2137.5 = 7137.5
    expect(result.totalLow).toBeCloseTo(7137.5, 0);
    expect(result.totalHigh).toBeCloseTo(21412.5, 0);
  });

  // ─── Test 21: Scope comparison array structure ───
  it('returns scopeComparison with all 5 project scopes', () => {
    const result = calculateAccessibilityRemodelCost({
      projectScope: 'bathroom-ada',
      mobilityLevel: 'ambulatory-assist',
      bathroomMods: 'none',
      doorwayWidening: 'none',
      flooringChanges: 'none',
      region: 'national',
    });
    const comparison = result.scopeComparison as Array<{ label: string; value: number }>;
    expect(comparison).toHaveLength(5);
    comparison.forEach(item => {
      expect(item.value).toBeGreaterThan(0);
      expect(item.label).toBeTruthy();
    });
    // basic-grab-bars should be cheapest, whole-home most expensive
    const basic = comparison.find(c => c.label.includes('Basic Grab Bars'));
    const wholeHome = comparison.find(c => c.label.includes('Whole-Home'));
    expect(basic!.value).toBeLessThan(wholeHome!.value);
  });

  // ─── Test 22: Multiple add-ons stack correctly ───
  it('stacks all add-ons correctly', () => {
    const none = calculateAccessibilityRemodelCost({
      projectScope: 'bathroom-ada',
      mobilityLevel: 'ambulatory-assist',
      bathroomMods: 'none',
      doorwayWidening: 'none',
      flooringChanges: 'none',
      region: 'national',
    }) as Record<string, number>;
    const all = calculateAccessibilityRemodelCost({
      projectScope: 'bathroom-ada',
      mobilityLevel: 'ambulatory-assist',
      bathroomMods: 'grab-bars-only',
      doorwayWidening: '1-2-doorways',
      flooringChanges: 'threshold-removal',
      region: 'national',
    }) as Record<string, number>;
    // bathroom: +200–600, doorway: +500–1500, flooring: +300–800
    expect(all.totalLow).toBeCloseTo(none.totalLow + 200 + 500 + 300, 0);
    expect(all.totalHigh).toBeCloseTo(none.totalHigh + 600 + 1500 + 800, 0);
  });

  // ─── Test 23: totalMid = (totalLow + totalHigh) / 2 ───
  it('totalMid equals average of totalLow and totalHigh', () => {
    const result = calculateAccessibilityRemodelCost({
      projectScope: 'kitchen-ada',
      mobilityLevel: 'wheelchair-partial',
      bathroomMods: 'grab-bars-only',
      doorwayWidening: '3-5-doorways',
      flooringChanges: 'threshold-removal',
      region: 'northeast',
    }) as Record<string, number>;
    expect(result.totalMid).toBeCloseTo((result.totalLow + result.totalHigh) / 2, 0);
  });

  // ─── Test 24: Full premium build — whole-home, full wheelchair, all add-ons, west-coast ───
  it('calculates a fully loaded premium accessibility project', () => {
    const result = calculateAccessibilityRemodelCost({
      projectScope: 'whole-home',
      mobilityLevel: 'wheelchair-full',
      bathroomMods: 'full-ada-bathroom',
      doorwayWidening: '6-plus-doorways',
      flooringChanges: 'full-non-slip',
      region: 'west-coast',
    }) as Record<string, number>;
    // adjustedBase: 20000×1.5=30000 low, 100000×1.5=150000 high
    // labor: 20000×0.45×1.25=11250 low, 100000×0.45×1.25=56250 high
    // bathroom: 8000–20000, doorway: 3000–8000, flooring: 2000–6000
    // totalLow: 30000 + 8000 + 3000 + 2000 + 11250 = 54250
    // totalHigh: 150000 + 20000 + 8000 + 6000 + 56250 = 240250
    expect(result.totalLow).toBeCloseTo(54250, 0);
    expect(result.totalHigh).toBeCloseTo(240250, 0);
    expect(result.totalLow).toBeGreaterThan(0);
    expect(result.totalHigh).toBeGreaterThan(result.totalLow);
  });
});
