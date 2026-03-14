import { calculateDoorReplacementCost } from '@/lib/formulas/construction/door-replacement-cost';

describe('calculateDoorReplacementCost', () => {
  // ─── Test 1: Interior hollow-core, standard hardware, door-only, no trim, national ───
  it('calculates a single interior hollow-core door at national average', () => {
    const result = calculateDoorReplacementCost({
      doorType: 'interior-hollow',
      quantity: 1,
      hardware: 'standard',
      frame: 'door-only',
      trimWork: 'none',
      region: 'national',
    });
    // Door: $75–$200 × 1.0 = $75–$200
    // Hardware: $0, Trim: $0
    // Labor: $150–$300 × 1.0 = $150–$300
    // TotalLow: 75 + 0 + 0 + 150 = $225
    // TotalHigh: 200 + 0 + 0 + 300 = $500
    // TotalMid: (225 + 500) / 2 = $362.50
    expect(result.totalLow).toBe(225);
    expect(result.totalHigh).toBe(500);
    expect(result.totalMid).toBe(362.5);
    expect(result.doorCost).toBe(137.5);
    expect(result.laborCost).toBe(225);
    expect(result.hardwareCost).toBe(0);
    expect(result.trimCost).toBe(0);
  });

  // ─── Test 2: Interior solid-core, national ───
  it('calculates a single interior solid-core door', () => {
    const result = calculateDoorReplacementCost({
      doorType: 'interior-solid',
      quantity: 1,
      hardware: 'standard',
      frame: 'door-only',
      trimWork: 'none',
      region: 'national',
    });
    // Door: $150–$500, Labor: $150–$300
    // TotalLow: 150 + 150 = $300
    // TotalHigh: 500 + 300 = $800
    expect(result.totalLow).toBe(300);
    expect(result.totalHigh).toBe(800);
    expect(result.totalMid).toBe(550);
  });

  // ─── Test 3: Exterior steel, national ───
  it('calculates a single exterior steel door', () => {
    const result = calculateDoorReplacementCost({
      doorType: 'exterior-steel',
      quantity: 1,
      hardware: 'standard',
      frame: 'door-only',
      trimWork: 'none',
      region: 'national',
    });
    // Door: $250–$600, Labor: $250–$500
    // TotalLow: 250 + 250 = $500
    // TotalHigh: 600 + 500 = $1100
    expect(result.totalLow).toBe(500);
    expect(result.totalHigh).toBe(1100);
    expect(result.totalMid).toBe(800);
  });

  // ─── Test 4: Exterior fiberglass, national ───
  it('calculates a single exterior fiberglass door', () => {
    const result = calculateDoorReplacementCost({
      doorType: 'exterior-fiberglass',
      quantity: 1,
      hardware: 'standard',
      frame: 'door-only',
      trimWork: 'none',
      region: 'national',
    });
    // Door: $400–$1000, Labor: $250–$500
    // TotalLow: 400 + 250 = $650
    // TotalHigh: 1000 + 500 = $1500
    expect(result.totalLow).toBe(650);
    expect(result.totalHigh).toBe(1500);
    expect(result.totalMid).toBe(1075);
  });

  // ─── Test 5: Exterior wood, national ───
  it('calculates a single exterior wood door', () => {
    const result = calculateDoorReplacementCost({
      doorType: 'exterior-wood',
      quantity: 1,
      hardware: 'standard',
      frame: 'door-only',
      trimWork: 'none',
      region: 'national',
    });
    // Door: $500–$1500, Labor: $250–$500
    // TotalLow: 500 + 250 = $750
    // TotalHigh: 1500 + 500 = $2000
    expect(result.totalLow).toBe(750);
    expect(result.totalHigh).toBe(2000);
    expect(result.totalMid).toBe(1375);
  });

  // ─── Test 6: French door, national ───
  it('calculates a single french door', () => {
    const result = calculateDoorReplacementCost({
      doorType: 'french-door',
      quantity: 1,
      hardware: 'standard',
      frame: 'door-only',
      trimWork: 'none',
      region: 'national',
    });
    // Door: $800–$2500, Labor: $300–$600
    // TotalLow: 800 + 300 = $1100
    // TotalHigh: 2500 + 600 = $3100
    expect(result.totalLow).toBe(1100);
    expect(result.totalHigh).toBe(3100);
    expect(result.totalMid).toBe(2100);
  });

  // ─── Test 7: Sliding glass, national ───
  it('calculates a single sliding glass door', () => {
    const result = calculateDoorReplacementCost({
      doorType: 'sliding-glass',
      quantity: 1,
      hardware: 'standard',
      frame: 'door-only',
      trimWork: 'none',
      region: 'national',
    });
    // Door: $1000–$3000, Labor: $300–$600
    // TotalLow: 1000 + 300 = $1300
    // TotalHigh: 3000 + 600 = $3600
    expect(result.totalLow).toBe(1300);
    expect(result.totalHigh).toBe(3600);
    expect(result.totalMid).toBe(2450);
  });

  // ─── Test 8: Upgraded hardware add-on ($50–$150) ───
  it('adds upgraded hardware cost ($50–$150)', () => {
    const noHardware = calculateDoorReplacementCost({
      doorType: 'interior-hollow', quantity: 1, hardware: 'standard',
      frame: 'door-only', trimWork: 'none', region: 'national',
    });
    const upgraded = calculateDoorReplacementCost({
      doorType: 'interior-hollow', quantity: 1, hardware: 'upgraded',
      frame: 'door-only', trimWork: 'none', region: 'national',
    });
    expect(upgraded.hardwareCost).toBe(100); // (50 + 150) / 2
    expect((upgraded.totalLow as number)).toBe((noHardware.totalLow as number) + 50);
    expect((upgraded.totalHigh as number)).toBe((noHardware.totalHigh as number) + 150);
  });

  // ─── Test 9: Smart-lock hardware add-on ($150–$400) ───
  it('adds smart-lock hardware cost ($150–$400)', () => {
    const result = calculateDoorReplacementCost({
      doorType: 'interior-hollow', quantity: 1, hardware: 'smart-lock',
      frame: 'door-only', trimWork: 'none', region: 'national',
    });
    expect(result.hardwareCost).toBe(275); // (150 + 400) / 2
    // TotalLow: 75 + 150 + 0 + 150 = $375
    // TotalHigh: 200 + 400 + 0 + 300 = $900
    expect(result.totalLow).toBe(375);
    expect(result.totalHigh).toBe(900);
  });

  // ─── Test 10: With-frame multiplier (1.35x on door cost) ───
  it('applies with-frame multiplier (1.35x) to door cost only', () => {
    const doorOnly = calculateDoorReplacementCost({
      doorType: 'interior-hollow', quantity: 1, hardware: 'standard',
      frame: 'door-only', trimWork: 'none', region: 'national',
    });
    const withFrame = calculateDoorReplacementCost({
      doorType: 'interior-hollow', quantity: 1, hardware: 'standard',
      frame: 'with-frame', trimWork: 'none', region: 'national',
    });
    // Door-only: $75–$200, With-frame: $101.25–$270
    // Labor stays the same
    expect(withFrame.laborCost).toBe(doorOnly.laborCost);
    // TotalLow: 101.25 + 150 = $251.25
    expect(withFrame.totalLow).toBeCloseTo(251.25, 1);
    // TotalHigh: 270 + 300 = $570
    expect(withFrame.totalHigh).toBe(570);
  });

  // ─── Test 11: Standard trim add-on ($50–$150) ───
  it('adds standard trim cost ($50–$150)', () => {
    const noTrim = calculateDoorReplacementCost({
      doorType: 'interior-hollow', quantity: 1, hardware: 'standard',
      frame: 'door-only', trimWork: 'none', region: 'national',
    });
    const withTrim = calculateDoorReplacementCost({
      doorType: 'interior-hollow', quantity: 1, hardware: 'standard',
      frame: 'door-only', trimWork: 'standard-trim', region: 'national',
    });
    expect(withTrim.trimCost).toBe(100); // (50 + 150) / 2
    expect((withTrim.totalLow as number)).toBe((noTrim.totalLow as number) + 50);
    expect((withTrim.totalHigh as number)).toBe((noTrim.totalHigh as number) + 150);
  });

  // ─── Test 12: Decorative trim add-on ($150–$400) ───
  it('adds decorative trim cost ($150–$400)', () => {
    const result = calculateDoorReplacementCost({
      doorType: 'interior-hollow', quantity: 1, hardware: 'standard',
      frame: 'door-only', trimWork: 'decorative-trim', region: 'national',
    });
    expect(result.trimCost).toBe(275); // (150 + 400) / 2
    // TotalLow: 75 + 0 + 150 + 150 = $375
    // TotalHigh: 200 + 0 + 400 + 300 = $900
    expect(result.totalLow).toBe(375);
    expect(result.totalHigh).toBe(900);
  });

  // ─── Test 13: Quantity multiplier (3 doors) ───
  it('multiplies per-door cost by quantity', () => {
    const single = calculateDoorReplacementCost({
      doorType: 'interior-hollow', quantity: 1, hardware: 'standard',
      frame: 'door-only', trimWork: 'none', region: 'national',
    });
    const triple = calculateDoorReplacementCost({
      doorType: 'interior-hollow', quantity: 3, hardware: 'standard',
      frame: 'door-only', trimWork: 'none', region: 'national',
    });
    expect(triple.totalLow).toBe((single.totalLow as number) * 3);
    expect(triple.totalHigh).toBe((single.totalHigh as number) * 3);
  });

  // ─── Test 14: Northeast region multiplier (1.20x labor) ───
  it('applies northeast regional labor multiplier (1.20x)', () => {
    const national = calculateDoorReplacementCost({
      doorType: 'interior-hollow', quantity: 1, hardware: 'standard',
      frame: 'door-only', trimWork: 'none', region: 'national',
    });
    const northeast = calculateDoorReplacementCost({
      doorType: 'interior-hollow', quantity: 1, hardware: 'standard',
      frame: 'door-only', trimWork: 'none', region: 'northeast',
    });
    // Door cost stays the same
    expect(northeast.doorCost).toBe(national.doorCost);
    // Labor: national $150–$300, northeast $180–$360
    expect((northeast.laborCost as number)).toBeCloseTo((national.laborCost as number) * 1.20, 1);
    // TotalLow: 75 + 180 = $255
    expect(northeast.totalLow).toBe(255);
    // TotalHigh: 200 + 360 = $560
    expect(northeast.totalHigh).toBe(560);
  });

  // ─── Test 15: South region multiplier (0.85x labor) ───
  it('applies south regional labor multiplier (0.85x)', () => {
    const result = calculateDoorReplacementCost({
      doorType: 'interior-hollow', quantity: 1, hardware: 'standard',
      frame: 'door-only', trimWork: 'none', region: 'south',
    });
    // Labor: $150 × 0.85 = $127.50 low, $300 × 0.85 = $255 high
    // TotalLow: 75 + 127.50 = $202.50
    // TotalHigh: 200 + 255 = $455
    expect(result.totalLow).toBe(202.5);
    expect(result.totalHigh).toBe(455);
  });

  // ─── Test 16: West Coast region multiplier (1.25x) ───
  it('applies west coast regional labor multiplier (1.25x)', () => {
    const result = calculateDoorReplacementCost({
      doorType: 'interior-hollow', quantity: 1, hardware: 'standard',
      frame: 'door-only', trimWork: 'none', region: 'west-coast',
    });
    // Labor: $150 × 1.25 = $187.50 low, $300 × 1.25 = $375 high
    // TotalLow: 75 + 187.50 = $262.50
    // TotalHigh: 200 + 375 = $575
    expect(result.totalLow).toBe(262.5);
    expect(result.totalHigh).toBe(575);
  });

  // ─── Test 17: Midwest region multiplier (0.90x) ───
  it('applies midwest regional labor multiplier (0.90x)', () => {
    const result = calculateDoorReplacementCost({
      doorType: 'interior-hollow', quantity: 1, hardware: 'standard',
      frame: 'door-only', trimWork: 'none', region: 'midwest',
    });
    // Labor: $150 × 0.90 = $135 low, $300 × 0.90 = $270 high
    // TotalLow: 75 + 135 = $210
    // TotalHigh: 200 + 270 = $470
    expect(result.totalLow).toBe(210);
    expect(result.totalHigh).toBe(470);
  });

  // ─── Test 18: Mid-Atlantic region multiplier (1.15x) ───
  it('applies mid-atlantic regional labor multiplier (1.15x)', () => {
    const result = calculateDoorReplacementCost({
      doorType: 'interior-hollow', quantity: 1, hardware: 'standard',
      frame: 'door-only', trimWork: 'none', region: 'mid-atlantic',
    });
    // Labor: $150 × 1.15 = $172.50 low, $300 × 1.15 = $345 high
    // TotalLow: 75 + 172.50 = $247.50
    // TotalHigh: 200 + 345 = $545
    expect(result.totalLow).toBe(247.5);
    expect(result.totalHigh).toBe(545);
  });

  // ─── Test 19: Mountain West region multiplier (0.95x) ───
  it('applies mountain west regional labor multiplier (0.95x)', () => {
    const result = calculateDoorReplacementCost({
      doorType: 'interior-hollow', quantity: 1, hardware: 'standard',
      frame: 'door-only', trimWork: 'none', region: 'mountain-west',
    });
    // Labor: $150 × 0.95 = $142.50 low, $300 × 0.95 = $285 high
    // TotalLow: 75 + 142.50 = $217.50
    // TotalHigh: 200 + 285 = $485
    expect(result.totalLow).toBe(217.5);
    expect(result.totalHigh).toBe(485);
  });

  // ─── Test 20: Full build — french door, smart-lock, with-frame, decorative-trim, northeast, qty 2 ───
  it('calculates fully loaded french doors with all extras', () => {
    const result = calculateDoorReplacementCost({
      doorType: 'french-door',
      quantity: 2,
      hardware: 'smart-lock',
      frame: 'with-frame',
      trimWork: 'decorative-trim',
      region: 'northeast',
    });
    // Door: $800 × 1.35 = $1080 low, $2500 × 1.35 = $3375 high
    // Hardware: $150 low, $400 high
    // Trim: $150 low, $400 high
    // Labor: $300 × 1.20 = $360 low, $600 × 1.20 = $720 high
    // PerDoorLow: 1080 + 150 + 150 + 360 = $1740
    // PerDoorHigh: 3375 + 400 + 400 + 720 = $4895
    // TotalLow: 1740 × 2 = $3480
    // TotalHigh: 4895 × 2 = $9790
    expect(result.totalLow).toBe(3480);
    expect(result.totalHigh).toBe(9790);
    expect(result.totalMid).toBe(6635);
  });

  // ─── Test 21: Regional multiplier only affects labor ───
  it('regional multiplier changes labor but not door, hardware, or trim cost', () => {
    const national = calculateDoorReplacementCost({
      doorType: 'exterior-steel', quantity: 1, hardware: 'upgraded',
      frame: 'door-only', trimWork: 'standard-trim', region: 'national',
    });
    const westCoast = calculateDoorReplacementCost({
      doorType: 'exterior-steel', quantity: 1, hardware: 'upgraded',
      frame: 'door-only', trimWork: 'standard-trim', region: 'west-coast',
    });
    expect(westCoast.doorCost).toBe(national.doorCost);
    expect(westCoast.hardwareCost).toBe(national.hardwareCost);
    expect(westCoast.trimCost).toBe(national.trimCost);
    expect((westCoast.laborCost as number)).toBeGreaterThan((national.laborCost as number));
  });

  // ─── Test 22: Door type comparison structure ───
  it('returns door type comparison with all 7 types', () => {
    const result = calculateDoorReplacementCost({
      doorType: 'interior-hollow', quantity: 1, hardware: 'standard',
      frame: 'door-only', trimWork: 'none', region: 'national',
    });
    const comparison = result.doorTypeComparison as Array<{ label: string; value: number }>;
    expect(comparison).toHaveLength(7);
    comparison.forEach(item => {
      expect(item.value).toBeGreaterThan(0);
      expect(item.label).toBeTruthy();
    });
    // Interior hollow should be cheapest, sliding glass most expensive
    const hollow = comparison.find(c => c.label.includes('Interior Hollow'));
    const sliding = comparison.find(c => c.label.includes('Sliding Glass'));
    expect(hollow!.value).toBeLessThan(sliding!.value);
  });

  // ─── Test 23: Timeline output ───
  it('returns correct timeline for each door type', () => {
    const interior = calculateDoorReplacementCost({
      doorType: 'interior-hollow', quantity: 1, hardware: 'standard',
      frame: 'door-only', trimWork: 'none', region: 'national',
    });
    expect(interior.timeline).toBe('1–2 hours per door');

    const exterior = calculateDoorReplacementCost({
      doorType: 'exterior-steel', quantity: 1, hardware: 'standard',
      frame: 'door-only', trimWork: 'none', region: 'national',
    });
    expect(exterior.timeline).toBe('2–4 hours per door');

    const sliding = calculateDoorReplacementCost({
      doorType: 'sliding-glass', quantity: 1, hardware: 'standard',
      frame: 'door-only', trimWork: 'none', region: 'national',
    });
    expect(sliding.timeline).toBe('4–8 hours per door');
  });

  // ─── Test 24: Timeline includes quantity note when > 1 ───
  it('appends quantity note to timeline for multiple doors', () => {
    const result = calculateDoorReplacementCost({
      doorType: 'interior-hollow', quantity: 5, hardware: 'standard',
      frame: 'door-only', trimWork: 'none', region: 'national',
    });
    expect(result.timeline).toBe('1–2 hours per door (5 doors total)');
  });

  // ─── Test 25: Output structure — all expected fields present ───
  it('returns all expected output fields', () => {
    const result = calculateDoorReplacementCost({
      doorType: 'interior-hollow', quantity: 1, hardware: 'standard',
      frame: 'door-only', trimWork: 'none', region: 'national',
    });
    expect(result).toHaveProperty('doorCost');
    expect(result).toHaveProperty('laborCost');
    expect(result).toHaveProperty('hardwareCost');
    expect(result).toHaveProperty('frameCost');
    expect(result).toHaveProperty('trimCost');
    expect(result).toHaveProperty('totalPerDoor');
    expect(result).toHaveProperty('totalLow');
    expect(result).toHaveProperty('totalHigh');
    expect(result).toHaveProperty('totalMid');
    expect(result).toHaveProperty('costPerDoor');
    expect(result).toHaveProperty('doorTypeComparison');
    expect(result).toHaveProperty('timeline');
  });

  // ─── Test 26: Default inputs produce valid output ───
  it('uses default inputs when values are missing', () => {
    const result = calculateDoorReplacementCost({});
    // Defaults: interior-hollow, qty 1, standard hardware, door-only, no trim, national
    expect(result.totalLow).toBe(225);
    expect(result.totalHigh).toBe(500);
  });

  // ─── Test 27: Quantity clamped to 1–20 ───
  it('clamps quantity to minimum 1 and maximum 20', () => {
    const zero = calculateDoorReplacementCost({
      doorType: 'interior-hollow', quantity: 0, hardware: 'standard',
      frame: 'door-only', trimWork: 'none', region: 'national',
    });
    expect(zero.totalLow).toBe(225); // qty = 1 (clamped)

    const negative = calculateDoorReplacementCost({
      doorType: 'interior-hollow', quantity: -5, hardware: 'standard',
      frame: 'door-only', trimWork: 'none', region: 'national',
    });
    expect(negative.totalLow).toBe(225); // qty = 1 (clamped)

    const tooMany = calculateDoorReplacementCost({
      doorType: 'interior-hollow', quantity: 50, hardware: 'standard',
      frame: 'door-only', trimWork: 'none', region: 'national',
    });
    // qty clamped to 20
    expect(tooMany.totalLow).toBe(225 * 20);
  });

  // ─── Test 28: Sliding glass + with-frame + smart-lock + decorative-trim + west-coast ───
  it('calculates premium sliding glass door with all upgrades', () => {
    const result = calculateDoorReplacementCost({
      doorType: 'sliding-glass',
      quantity: 1,
      hardware: 'smart-lock',
      frame: 'with-frame',
      trimWork: 'decorative-trim',
      region: 'west-coast',
    });
    // Door: $1000 × 1.35 = $1350 low, $3000 × 1.35 = $4050 high
    // Hardware: $150 low, $400 high
    // Trim: $150 low, $400 high
    // Labor: $300 × 1.25 = $375 low, $600 × 1.25 = $750 high
    // TotalLow: 1350 + 150 + 150 + 375 = $2025
    // TotalHigh: 4050 + 400 + 400 + 750 = $5600
    expect(result.totalLow).toBe(2025);
    expect(result.totalHigh).toBe(5600);
    expect(result.totalMid).toBe(3812.5);
  });
});
