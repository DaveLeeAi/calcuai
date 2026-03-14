import { calculateGarageDoorCost } from '@/lib/formulas/construction/garage-door-cost';

describe('calculateGarageDoorCost', () => {
  // ─── Test 1: Single standard, steel, no insulation, no opener, no removal, national ───
  it('calculates a single standard steel garage door at national average', () => {
    const result = calculateGarageDoorCost({
      doorType: 'single-standard',
      material: 'steel',
      insulation: 'none',
      opener: 'none',
      oldDoorRemoval: 'none',
      region: 'national',
    });
    // Door: $600–$1200 × 1.0 × 1.0 = $600–$1200
    // Labor: $200–$400 × 1.0 = $200–$400
    // Opener: $0, Removal: $0
    // TotalLow: 600 + 200 + 0 + 0 = $800
    // TotalHigh: 1200 + 400 + 0 + 0 = $1600
    // TotalMid: (800 + 1600) / 2 = $1200
    expect(result.totalLow).toBe(800);
    expect(result.totalHigh).toBe(1600);
    expect(result.totalMid).toBe(1200);
    expect(result.doorCost).toBe(900);
    expect(result.laborCost).toBe(300);
    expect(result.openerCost).toBe(0);
    expect(result.removalCost).toBe(0);
  });

  // ─── Test 2: Single insulated, steel, no extras, national ───
  it('calculates a single insulated steel garage door', () => {
    const result = calculateGarageDoorCost({
      doorType: 'single-insulated',
      material: 'steel',
      insulation: 'none',
      opener: 'none',
      oldDoorRemoval: 'none',
      region: 'national',
    });
    // Door: $800–$1600 × 1.0 × 1.0
    // Labor: $200–$400 × 1.0
    // TotalLow: 800 + 200 = $1000
    // TotalHigh: 1600 + 400 = $2000
    expect(result.totalLow).toBe(1000);
    expect(result.totalHigh).toBe(2000);
    expect(result.totalMid).toBe(1500);
  });

  // ─── Test 3: Double standard, steel, national ───
  it('calculates a double standard steel garage door', () => {
    const result = calculateGarageDoorCost({
      doorType: 'double-standard',
      material: 'steel',
      insulation: 'none',
      opener: 'none',
      oldDoorRemoval: 'none',
      region: 'national',
    });
    // Door: $800–$1800, Labor: $300–$500
    // TotalLow: 800 + 300 = $1100
    // TotalHigh: 1800 + 500 = $2300
    expect(result.totalLow).toBe(1100);
    expect(result.totalHigh).toBe(2300);
    expect(result.totalMid).toBe(1700);
  });

  // ─── Test 4: Double insulated, steel, national ───
  it('calculates a double insulated steel garage door', () => {
    const result = calculateGarageDoorCost({
      doorType: 'double-insulated',
      material: 'steel',
      insulation: 'none',
      opener: 'none',
      oldDoorRemoval: 'none',
      region: 'national',
    });
    // Door: $1200–$2500, Labor: $300–$500
    // TotalLow: 1200 + 300 = $1500
    // TotalHigh: 2500 + 500 = $3000
    expect(result.totalLow).toBe(1500);
    expect(result.totalHigh).toBe(3000);
    expect(result.totalMid).toBe(2250);
  });

  // ─── Test 5: Custom carriage, steel, national ───
  it('calculates a custom carriage steel garage door', () => {
    const result = calculateGarageDoorCost({
      doorType: 'custom-carriage',
      material: 'steel',
      insulation: 'none',
      opener: 'none',
      oldDoorRemoval: 'none',
      region: 'national',
    });
    // Door: $2000–$5000, Labor: $400–$500
    // TotalLow: 2000 + 400 = $2400
    // TotalHigh: 5000 + 500 = $5500
    expect(result.totalLow).toBe(2400);
    expect(result.totalHigh).toBe(5500);
    expect(result.totalMid).toBe(3950);
  });

  // ─── Test 6: Wood material multiplier (1.40x) ───
  it('applies wood material multiplier (1.40x) to door cost', () => {
    const steel = calculateGarageDoorCost({
      doorType: 'single-standard', material: 'steel', insulation: 'none',
      opener: 'none', oldDoorRemoval: 'none', region: 'national',
    });
    const wood = calculateGarageDoorCost({
      doorType: 'single-standard', material: 'wood', insulation: 'none',
      opener: 'none', oldDoorRemoval: 'none', region: 'national',
    });
    // Steel door: $600–$1200, Wood door: $840–$1680
    // Labor stays the same
    expect((wood.doorCost as number)).toBeCloseTo((steel.doorCost as number) * 1.40, 1);
    expect(wood.laborCost).toBe(steel.laborCost);
    // TotalLow: 840 + 200 = $1040
    expect(wood.totalLow).toBe(1040);
    // TotalHigh: 1680 + 400 = $2080
    expect(wood.totalHigh).toBe(2080);
  });

  // ─── Test 7: Aluminum material multiplier (0.85x) ───
  it('applies aluminum material multiplier (0.85x) to door cost', () => {
    const result = calculateGarageDoorCost({
      doorType: 'single-standard', material: 'aluminum', insulation: 'none',
      opener: 'none', oldDoorRemoval: 'none', region: 'national',
    });
    // Door: $600 × 0.85 = $510 low, $1200 × 0.85 = $1020 high
    // TotalLow: 510 + 200 = $710
    // TotalHigh: 1020 + 400 = $1420
    expect(result.totalLow).toBe(710);
    expect(result.totalHigh).toBe(1420);
    expect(result.doorCost).toBe(765); // (510 + 1020) / 2
  });

  // ─── Test 8: Fiberglass material multiplier (1.15x) ───
  it('applies fiberglass material multiplier (1.15x) to door cost', () => {
    const result = calculateGarageDoorCost({
      doorType: 'single-standard', material: 'fiberglass', insulation: 'none',
      opener: 'none', oldDoorRemoval: 'none', region: 'national',
    });
    // Door: $600 × 1.15 = $690 low, $1200 × 1.15 = $1380 high
    expect(result.totalLow).toBe(890);  // 690 + 200
    expect(result.totalHigh).toBe(1780); // 1380 + 400
  });

  // ─── Test 9: Composite material multiplier (1.25x) ───
  it('applies composite material multiplier (1.25x) to door cost', () => {
    const result = calculateGarageDoorCost({
      doorType: 'single-standard', material: 'composite', insulation: 'none',
      opener: 'none', oldDoorRemoval: 'none', region: 'national',
    });
    // Door: $600 × 1.25 = $750 low, $1200 × 1.25 = $1500 high
    expect(result.totalLow).toBe(950);  // 750 + 200
    expect(result.totalHigh).toBe(1900); // 1500 + 400
  });

  // ─── Test 10: Polystyrene insulation multiplier (1.10x) ───
  it('applies polystyrene insulation multiplier (1.10x)', () => {
    const result = calculateGarageDoorCost({
      doorType: 'single-standard', material: 'steel', insulation: 'polystyrene',
      opener: 'none', oldDoorRemoval: 'none', region: 'national',
    });
    // Door: $600 × 1.0 × 1.10 = $660 low, $1200 × 1.0 × 1.10 = $1320 high
    expect(result.totalLow).toBe(860);   // 660 + 200
    expect(result.totalHigh).toBe(1720); // 1320 + 400
  });

  // ─── Test 11: Polyurethane insulation multiplier (1.20x) ───
  it('applies polyurethane insulation multiplier (1.20x)', () => {
    const result = calculateGarageDoorCost({
      doorType: 'single-standard', material: 'steel', insulation: 'polyurethane',
      opener: 'none', oldDoorRemoval: 'none', region: 'national',
    });
    // Door: $600 × 1.0 × 1.20 = $720 low, $1200 × 1.0 × 1.20 = $1440 high
    expect(result.totalLow).toBe(920);   // 720 + 200
    expect(result.totalHigh).toBe(1840); // 1440 + 400
  });

  // ─── Test 12: Stacked multipliers — wood + polyurethane ───
  it('stacks material and insulation multipliers correctly', () => {
    const result = calculateGarageDoorCost({
      doorType: 'single-standard', material: 'wood', insulation: 'polyurethane',
      opener: 'none', oldDoorRemoval: 'none', region: 'national',
    });
    // Door: $600 × 1.40 × 1.20 = $1008 low, $1200 × 1.40 × 1.20 = $2016 high
    expect(result.totalLow).toBe(1208);  // 1008 + 200
    expect(result.totalHigh).toBe(2416); // 2016 + 400
  });

  // ─── Test 13: Chain-drive opener add-on ───
  it('adds chain-drive opener cost ($200–$350)', () => {
    const noOpener = calculateGarageDoorCost({
      doorType: 'single-standard', material: 'steel', insulation: 'none',
      opener: 'none', oldDoorRemoval: 'none', region: 'national',
    });
    const chainDrive = calculateGarageDoorCost({
      doorType: 'single-standard', material: 'steel', insulation: 'none',
      opener: 'chain-drive', oldDoorRemoval: 'none', region: 'national',
    });
    expect(chainDrive.openerCost).toBe(275); // (200 + 350) / 2
    expect((chainDrive.totalLow as number)).toBe((noOpener.totalLow as number) + 200);
    expect((chainDrive.totalHigh as number)).toBe((noOpener.totalHigh as number) + 350);
  });

  // ─── Test 14: Belt-drive opener add-on ───
  it('adds belt-drive opener cost ($300–$500)', () => {
    const result = calculateGarageDoorCost({
      doorType: 'single-standard', material: 'steel', insulation: 'none',
      opener: 'belt-drive', oldDoorRemoval: 'none', region: 'national',
    });
    expect(result.openerCost).toBe(400); // (300 + 500) / 2
    expect(result.totalLow).toBe(1100);  // 600 + 200 + 300
    expect(result.totalHigh).toBe(2100); // 1200 + 400 + 500
  });

  // ─── Test 15: Smart WiFi opener add-on ───
  it('adds smart-wifi opener cost ($400–$700)', () => {
    const result = calculateGarageDoorCost({
      doorType: 'single-standard', material: 'steel', insulation: 'none',
      opener: 'smart-wifi', oldDoorRemoval: 'none', region: 'national',
    });
    expect(result.openerCost).toBe(550); // (400 + 700) / 2
    expect(result.totalLow).toBe(1200);  // 600 + 200 + 400
    expect(result.totalHigh).toBe(2300); // 1200 + 400 + 700
  });

  // ─── Test 16: Old door removal add-on ───
  it('adds old door removal cost ($100–$200)', () => {
    const noRemoval = calculateGarageDoorCost({
      doorType: 'single-standard', material: 'steel', insulation: 'none',
      opener: 'none', oldDoorRemoval: 'none', region: 'national',
    });
    const withRemoval = calculateGarageDoorCost({
      doorType: 'single-standard', material: 'steel', insulation: 'none',
      opener: 'none', oldDoorRemoval: 'yes', region: 'national',
    });
    expect(withRemoval.removalCost).toBe(150); // (100 + 200) / 2
    expect((withRemoval.totalLow as number)).toBe((noRemoval.totalLow as number) + 100);
    expect((withRemoval.totalHigh as number)).toBe((noRemoval.totalHigh as number) + 200);
  });

  // ─── Test 17: Northeast region multiplier (1.20x labor) ───
  it('applies northeast regional labor multiplier (1.20x)', () => {
    const national = calculateGarageDoorCost({
      doorType: 'single-standard', material: 'steel', insulation: 'none',
      opener: 'none', oldDoorRemoval: 'none', region: 'national',
    });
    const northeast = calculateGarageDoorCost({
      doorType: 'single-standard', material: 'steel', insulation: 'none',
      opener: 'none', oldDoorRemoval: 'none', region: 'northeast',
    });
    // Door cost stays the same
    expect(northeast.doorCost).toBe(national.doorCost);
    // Labor: national mid $300, northeast mid = $300 × 1.20 = $360
    expect((northeast.laborCost as number)).toBeCloseTo((national.laborCost as number) * 1.20, 1);
    // TotalLow: 600 + 240 = 840
    expect(northeast.totalLow).toBe(840);
    // TotalHigh: 1200 + 480 = 1680
    expect(northeast.totalHigh).toBe(1680);
  });

  // ─── Test 18: South region multiplier (0.85x labor) ───
  it('applies south regional labor multiplier (0.85x)', () => {
    const national = calculateGarageDoorCost({
      doorType: 'single-standard', material: 'steel', insulation: 'none',
      opener: 'none', oldDoorRemoval: 'none', region: 'national',
    });
    const south = calculateGarageDoorCost({
      doorType: 'single-standard', material: 'steel', insulation: 'none',
      opener: 'none', oldDoorRemoval: 'none', region: 'south',
    });
    expect((south.laborCost as number)).toBeLessThan((national.laborCost as number));
    // Labor low: 200 × 0.85 = $170, high: 400 × 0.85 = $340
    // TotalLow: 600 + 170 = $770
    expect(south.totalLow).toBe(770);
    // TotalHigh: 1200 + 340 = $1540
    expect(south.totalHigh).toBe(1540);
  });

  // ─── Test 19: West Coast region multiplier (1.25x — highest) ───
  it('applies west coast regional labor multiplier (1.25x)', () => {
    const result = calculateGarageDoorCost({
      doorType: 'single-standard', material: 'steel', insulation: 'none',
      opener: 'none', oldDoorRemoval: 'none', region: 'west-coast',
    });
    // Labor low: 200 × 1.25 = $250, high: 400 × 1.25 = $500
    // TotalLow: 600 + 250 = $850
    // TotalHigh: 1200 + 500 = $1700
    expect(result.totalLow).toBe(850);
    expect(result.totalHigh).toBe(1700);
  });

  // ─── Test 20: Midwest region multiplier (0.90x) ───
  it('applies midwest regional labor multiplier (0.90x)', () => {
    const result = calculateGarageDoorCost({
      doorType: 'single-standard', material: 'steel', insulation: 'none',
      opener: 'none', oldDoorRemoval: 'none', region: 'midwest',
    });
    // Labor low: 200 × 0.90 = $180, high: 400 × 0.90 = $360
    expect(result.totalLow).toBe(780);  // 600 + 180
    expect(result.totalHigh).toBe(1560); // 1200 + 360
  });

  // ─── Test 21: Mid-Atlantic region multiplier (1.15x) ───
  it('applies mid-atlantic regional labor multiplier (1.15x)', () => {
    const result = calculateGarageDoorCost({
      doorType: 'single-standard', material: 'steel', insulation: 'none',
      opener: 'none', oldDoorRemoval: 'none', region: 'mid-atlantic',
    });
    // Labor low: 200 × 1.15 = $230, high: 400 × 1.15 = $460
    expect(result.totalLow).toBe(830);  // 600 + 230
    expect(result.totalHigh).toBe(1660); // 1200 + 460
  });

  // ─── Test 22: Mountain West region multiplier (0.95x) ───
  it('applies mountain west regional labor multiplier (0.95x)', () => {
    const result = calculateGarageDoorCost({
      doorType: 'single-standard', material: 'steel', insulation: 'none',
      opener: 'none', oldDoorRemoval: 'none', region: 'mountain-west',
    });
    // Labor low: 200 × 0.95 = $190, high: 400 × 0.95 = $380
    expect(result.totalLow).toBe(790);  // 600 + 190
    expect(result.totalHigh).toBe(1580); // 1200 + 380
  });

  // ─── Test 23: Full build — double insulated, wood, polyurethane, smart-wifi, removal, northeast ───
  it('calculates a fully loaded double insulated wood door with all extras', () => {
    const result = calculateGarageDoorCost({
      doorType: 'double-insulated', material: 'wood', insulation: 'polyurethane',
      opener: 'smart-wifi', oldDoorRemoval: 'yes', region: 'northeast',
    });
    // Door: $1200 × 1.40 × 1.20 = $2016 low, $2500 × 1.40 × 1.20 = $4200 high
    // Labor: $300 × 1.20 = $360 low, $500 × 1.20 = $600 high
    // Opener: $400 low, $700 high
    // Removal: $100 low, $200 high
    // TotalLow: 2016 + 360 + 400 + 100 = $2876
    // TotalHigh: 4200 + 600 + 700 + 200 = $5700
    expect(result.totalLow).toBe(2876);
    expect(result.totalHigh).toBe(5700);
    expect(result.totalMid).toBe(4288);
  });

  // ─── Test 24: Door type comparison structure ───
  it('returns door type comparison with all 5 types', () => {
    const result = calculateGarageDoorCost({
      doorType: 'single-standard', material: 'steel', insulation: 'none',
      opener: 'none', oldDoorRemoval: 'none', region: 'national',
    });
    const comparison = result.doorTypeComparison as Array<{ label: string; value: number }>;
    expect(comparison).toHaveLength(5);
    comparison.forEach(item => {
      expect(item.value).toBeGreaterThan(0);
      expect(item.label).toBeTruthy();
    });
    // Single standard should be cheapest, custom carriage most expensive
    const singleStd = comparison.find(c => c.label.includes('Single Standard'));
    const customCarriage = comparison.find(c => c.label.includes('Custom Carriage'));
    expect(singleStd!.value).toBeLessThan(customCarriage!.value);
  });

  // ─── Test 25: Timeline output ───
  it('returns correct timeline for each door type', () => {
    const singleStd = calculateGarageDoorCost({
      doorType: 'single-standard', material: 'steel', insulation: 'none',
      opener: 'none', oldDoorRemoval: 'none', region: 'national',
    });
    expect(singleStd.timeline).toBe('3–5 hours (same-day installation)');

    const doubleIns = calculateGarageDoorCost({
      doorType: 'double-insulated', material: 'steel', insulation: 'none',
      opener: 'none', oldDoorRemoval: 'none', region: 'national',
    });
    expect(doubleIns.timeline).toBe('4–6 hours (same-day installation)');

    const custom = calculateGarageDoorCost({
      doorType: 'custom-carriage', material: 'steel', insulation: 'none',
      opener: 'none', oldDoorRemoval: 'none', region: 'national',
    });
    expect(custom.timeline).toBe('1–2 days (custom fit and finishing)');
  });

  // ─── Test 26: Output structure — all expected fields present ───
  it('returns all expected output fields', () => {
    const result = calculateGarageDoorCost({
      doorType: 'single-standard', material: 'steel', insulation: 'none',
      opener: 'none', oldDoorRemoval: 'none', region: 'national',
    });
    expect(result).toHaveProperty('doorCost');
    expect(result).toHaveProperty('laborCost');
    expect(result).toHaveProperty('openerCost');
    expect(result).toHaveProperty('removalCost');
    expect(result).toHaveProperty('totalLow');
    expect(result).toHaveProperty('totalHigh');
    expect(result).toHaveProperty('totalMid');
    expect(result).toHaveProperty('doorTypeComparison');
    expect(result).toHaveProperty('timeline');
  });

  // ─── Test 27: Default inputs produce valid output ───
  it('uses default inputs when values are missing', () => {
    const result = calculateGarageDoorCost({});
    // Defaults: single-standard, steel, no insulation, no opener, no removal, national
    expect(result.totalLow).toBe(800);
    expect(result.totalHigh).toBe(1600);
  });

  // ─── Test 28: Regional multiplier only affects labor, not door/opener/removal ───
  it('regional multiplier changes labor but not door, opener, or removal cost', () => {
    const national = calculateGarageDoorCost({
      doorType: 'double-standard', material: 'steel', insulation: 'none',
      opener: 'belt-drive', oldDoorRemoval: 'yes', region: 'national',
    });
    const westCoast = calculateGarageDoorCost({
      doorType: 'double-standard', material: 'steel', insulation: 'none',
      opener: 'belt-drive', oldDoorRemoval: 'yes', region: 'west-coast',
    });
    // Door, opener, removal stay the same
    expect(westCoast.doorCost).toBe(national.doorCost);
    expect(westCoast.openerCost).toBe(national.openerCost);
    expect(westCoast.removalCost).toBe(national.removalCost);
    // Labor changes
    expect((westCoast.laborCost as number)).toBeGreaterThan((national.laborCost as number));
  });

  // ─── Test 29: Custom carriage + wood + polyurethane (premium build) ───
  it('calculates premium custom carriage wood door with polyurethane', () => {
    const result = calculateGarageDoorCost({
      doorType: 'custom-carriage', material: 'wood', insulation: 'polyurethane',
      opener: 'smart-wifi', oldDoorRemoval: 'yes', region: 'west-coast',
    });
    // Door: $2000 × 1.40 × 1.20 = $3360 low, $5000 × 1.40 × 1.20 = $8400 high
    // Labor: $400 × 1.25 = $500 low, $500 × 1.25 = $625 high
    // Opener: $400 low, $700 high
    // Removal: $100 low, $200 high
    // TotalLow: 3360 + 500 + 400 + 100 = $4360
    // TotalHigh: 8400 + 625 + 700 + 200 = $9925
    expect(result.totalLow).toBe(4360);
    expect(result.totalHigh).toBe(9925);
    expect(result.totalMid).toBe(7142.5);
  });

  // ─── Test 30: Single standard cheapest, custom carriage most expensive ───
  it('single standard is cheapest and custom carriage is most expensive for same material', () => {
    const types = ['single-standard', 'single-insulated', 'double-standard', 'double-insulated', 'custom-carriage'];
    const costs = types.map(t => {
      const r = calculateGarageDoorCost({
        doorType: t, material: 'steel', insulation: 'none',
        opener: 'none', oldDoorRemoval: 'none', region: 'national',
      });
      return { type: t, mid: r.totalMid as number };
    });
    const singleStd = costs.find(c => c.type === 'single-standard')!;
    const customCarriage = costs.find(c => c.type === 'custom-carriage')!;
    expect(singleStd.mid).toBeLessThan(customCarriage.mid);
    // Verify ascending order
    for (let i = 1; i < costs.length; i++) {
      expect(costs[i].mid).toBeGreaterThanOrEqual(costs[i - 1].mid);
    }
  });
});
