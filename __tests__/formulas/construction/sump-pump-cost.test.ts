import { calculateSumpPumpCost } from '../../../lib/formulas/construction/sump-pump-cost';

describe('calculateSumpPumpCost', () => {
  // ─── Test 1: Default inputs — submersible primary, 1/3-hp, existing basin, existing discharge, no valve, national ───
  it('calculates default sump pump installation at national average', () => {
    const result = calculateSumpPumpCost({
      pumpType: 'submersible-primary',
      horsePower: '1/3-hp',
      basinType: 'existing-basin',
      dischargeLine: 'existing',
      checkValve: 'none',
      region: 'national',
    });
    // Pump: 150–400 × 1.0 = 150–400
    // Basin: 0, Discharge: 0, CheckValve: 0
    // Labor: 300–600 × 1.0 = 300–600
    // TotalLow: 150+0+0+0+300=450
    // TotalHigh: 400+0+0+0+600=1000
    expect(result.totalLow).toBeCloseTo(450, 0);
    expect(result.totalHigh).toBeCloseTo(1000, 0);
    expect(result.totalMid).toBeCloseTo(725, 0);
    expect(result.basinCost).toBe(0);
    expect(result.dischargeCost).toBe(0);
    expect(result.checkValveCost).toBe(0);
  });

  // ─── Test 2: Pedestal primary pump ($100–$300) ───
  it('calculates pedestal primary pump costs ($100–$300)', () => {
    const result = calculateSumpPumpCost({
      pumpType: 'pedestal-primary',
      horsePower: '1/3-hp',
      basinType: 'existing-basin',
      dischargeLine: 'existing',
      checkValve: 'none',
      region: 'national',
    });
    // Pump: 100–300, Labor: 300–600
    // Total: 100+300=400 low, 300+600=900 high
    expect(result.totalLow).toBeCloseTo(400, 0);
    expect(result.totalHigh).toBeCloseTo(900, 0);
    expect(result.pumpCost).toBeCloseTo(200, 0); // (100+300)/2
  });

  // ─── Test 3: Battery backup pump ($300–$800) ───
  it('calculates battery backup pump costs ($300–$800)', () => {
    const result = calculateSumpPumpCost({
      pumpType: 'battery-backup',
      horsePower: '1/3-hp',
      basinType: 'existing-basin',
      dischargeLine: 'existing',
      checkValve: 'none',
      region: 'national',
    });
    // Pump: 300–800, Labor: 300–600
    // Total: 300+300=600 low, 800+600=1400 high
    expect(result.totalLow).toBeCloseTo(600, 0);
    expect(result.totalHigh).toBeCloseTo(1400, 0);
    expect(result.pumpCost).toBeCloseTo(550, 0); // (300+800)/2
  });

  // ─── Test 4: Water-powered backup ($200–$500) ───
  it('calculates water-powered backup costs ($200–$500)', () => {
    const result = calculateSumpPumpCost({
      pumpType: 'water-powered-backup',
      horsePower: '1/3-hp',
      basinType: 'existing-basin',
      dischargeLine: 'existing',
      checkValve: 'none',
      region: 'national',
    });
    // Pump: 200–500, Labor: 300–600
    // Total: 200+300=500 low, 500+600=1100 high
    expect(result.totalLow).toBeCloseTo(500, 0);
    expect(result.totalHigh).toBeCloseTo(1100, 0);
    expect(result.pumpCost).toBeCloseTo(350, 0); // (200+500)/2
  });

  // ─── Test 5: Combination primary + backup ($500–$1200) ───
  it('calculates combination primary + backup costs ($500–$1200)', () => {
    const result = calculateSumpPumpCost({
      pumpType: 'combination-primary-backup',
      horsePower: '1/3-hp',
      basinType: 'existing-basin',
      dischargeLine: 'existing',
      checkValve: 'none',
      region: 'national',
    });
    // Pump: 500–1200, Labor: 300–600
    // Total: 500+300=800 low, 1200+600=1800 high
    expect(result.totalLow).toBeCloseTo(800, 0);
    expect(result.totalHigh).toBeCloseTo(1800, 0);
    expect(result.pumpCost).toBeCloseTo(850, 0); // (500+1200)/2
  });

  // ─── Test 6: 1/2 HP multiplier (1.15x) ───
  it('applies 1/2 HP multiplier (1.15x) to pump cost', () => {
    const oneThird = calculateSumpPumpCost({
      pumpType: 'submersible-primary',
      horsePower: '1/3-hp',
      basinType: 'existing-basin',
      dischargeLine: 'existing',
      checkValve: 'none',
      region: 'national',
    });
    const half = calculateSumpPumpCost({
      pumpType: 'submersible-primary',
      horsePower: '1/2-hp',
      basinType: 'existing-basin',
      dischargeLine: 'existing',
      checkValve: 'none',
      region: 'national',
    });
    // Pump: 150×1.15=172.5 low, 400×1.15=460 high
    expect(half.totalLow).toBeCloseTo(172.5 + 300, 0);
    expect(half.totalHigh).toBeCloseTo(460 + 600, 0);
    expect(half.pumpCost as number).toBeGreaterThan(oneThird.pumpCost as number);
  });

  // ─── Test 7: 3/4 HP multiplier (1.35x) ───
  it('applies 3/4 HP multiplier (1.35x) to pump cost', () => {
    const result = calculateSumpPumpCost({
      pumpType: 'submersible-primary',
      horsePower: '3/4-hp',
      basinType: 'existing-basin',
      dischargeLine: 'existing',
      checkValve: 'none',
      region: 'national',
    });
    // Pump: 150×1.35=202.5 low, 400×1.35=540 high
    expect(result.totalLow).toBeCloseTo(202.5 + 300, 0);
    expect(result.totalHigh).toBeCloseTo(540 + 600, 0);
  });

  // ─── Test 8: 1 HP multiplier (1.55x) ───
  it('applies 1 HP multiplier (1.55x) to pump cost', () => {
    const result = calculateSumpPumpCost({
      pumpType: 'submersible-primary',
      horsePower: '1-hp',
      basinType: 'existing-basin',
      dischargeLine: 'existing',
      checkValve: 'none',
      region: 'national',
    });
    // Pump: 150×1.55=232.5 low, 400×1.55=620 high
    expect(result.totalLow).toBeCloseTo(232.5 + 300, 0);
    expect(result.totalHigh).toBeCloseTo(620 + 600, 0);
  });

  // ─── Test 9: New plastic basin ($75–$200) ───
  it('adds new plastic basin cost ($75–$200)', () => {
    const existing = calculateSumpPumpCost({
      pumpType: 'submersible-primary',
      horsePower: '1/3-hp',
      basinType: 'existing-basin',
      dischargeLine: 'existing',
      checkValve: 'none',
      region: 'national',
    });
    const newPlastic = calculateSumpPumpCost({
      pumpType: 'submersible-primary',
      horsePower: '1/3-hp',
      basinType: 'new-plastic',
      dischargeLine: 'existing',
      checkValve: 'none',
      region: 'national',
    });
    expect(newPlastic.basinCost).toBeCloseTo(137.5, 0); // (75+200)/2
    expect(newPlastic.totalLow as number).toBeCloseTo((existing.totalLow as number) + 75, 0);
    expect(newPlastic.totalHigh as number).toBeCloseTo((existing.totalHigh as number) + 200, 0);
  });

  // ─── Test 10: New fiberglass basin ($150–$350) ───
  it('adds new fiberglass basin cost ($150–$350)', () => {
    const result = calculateSumpPumpCost({
      pumpType: 'submersible-primary',
      horsePower: '1/3-hp',
      basinType: 'new-fiberglass',
      dischargeLine: 'existing',
      checkValve: 'none',
      region: 'national',
    });
    expect(result.basinCost).toBeCloseTo(250, 0); // (150+350)/2
    expect(result.totalLow).toBeCloseTo(450 + 150, 0);
    expect(result.totalHigh).toBeCloseTo(1000 + 350, 0);
  });

  // ─── Test 11: New interior discharge line ($100–$300) ───
  it('adds new interior discharge line cost ($100–$300)', () => {
    const existing = calculateSumpPumpCost({
      pumpType: 'submersible-primary',
      horsePower: '1/3-hp',
      basinType: 'existing-basin',
      dischargeLine: 'existing',
      checkValve: 'none',
      region: 'national',
    });
    const interior = calculateSumpPumpCost({
      pumpType: 'submersible-primary',
      horsePower: '1/3-hp',
      basinType: 'existing-basin',
      dischargeLine: 'new-interior',
      checkValve: 'none',
      region: 'national',
    });
    expect(interior.dischargeCost).toBeCloseTo(200, 0); // (100+300)/2
    expect(interior.totalLow as number).toBeCloseTo((existing.totalLow as number) + 100, 0);
    expect(interior.totalHigh as number).toBeCloseTo((existing.totalHigh as number) + 300, 0);
  });

  // ─── Test 12: New exterior discharge with burial ($300–$800) ───
  it('adds new exterior discharge burial cost ($300–$800)', () => {
    const result = calculateSumpPumpCost({
      pumpType: 'submersible-primary',
      horsePower: '1/3-hp',
      basinType: 'existing-basin',
      dischargeLine: 'new-exterior-with-burial',
      checkValve: 'none',
      region: 'national',
    });
    expect(result.dischargeCost).toBeCloseTo(550, 0); // (300+800)/2
    expect(result.totalLow).toBeCloseTo(450 + 300, 0);
    expect(result.totalHigh).toBeCloseTo(1000 + 800, 0);
  });

  // ─── Test 13: Standard check valve ($30–$60) ───
  it('adds standard check valve cost ($30–$60)', () => {
    const none = calculateSumpPumpCost({
      pumpType: 'submersible-primary',
      horsePower: '1/3-hp',
      basinType: 'existing-basin',
      dischargeLine: 'existing',
      checkValve: 'none',
      region: 'national',
    });
    const standard = calculateSumpPumpCost({
      pumpType: 'submersible-primary',
      horsePower: '1/3-hp',
      basinType: 'existing-basin',
      dischargeLine: 'existing',
      checkValve: 'standard',
      region: 'national',
    });
    expect(standard.checkValveCost).toBeCloseTo(45, 0); // (30+60)/2
    expect(standard.totalLow as number).toBeCloseTo((none.totalLow as number) + 30, 0);
    expect(standard.totalHigh as number).toBeCloseTo((none.totalHigh as number) + 60, 0);
  });

  // ─── Test 14: Quiet check valve ($60–$120) ───
  it('adds quiet check valve cost ($60–$120)', () => {
    const result = calculateSumpPumpCost({
      pumpType: 'submersible-primary',
      horsePower: '1/3-hp',
      basinType: 'existing-basin',
      dischargeLine: 'existing',
      checkValve: 'quiet-check',
      region: 'national',
    });
    expect(result.checkValveCost).toBeCloseTo(90, 0); // (60+120)/2
    expect(result.totalLow).toBeCloseTo(450 + 60, 0);
    expect(result.totalHigh).toBeCloseTo(1000 + 120, 0);
  });

  // ─── Test 15: Northeast regional multiplier (1.20x labor) ───
  it('applies northeast regional labor multiplier (1.20x)', () => {
    const national = calculateSumpPumpCost({
      pumpType: 'submersible-primary',
      horsePower: '1/3-hp',
      basinType: 'existing-basin',
      dischargeLine: 'existing',
      checkValve: 'none',
      region: 'national',
    });
    const northeast = calculateSumpPumpCost({
      pumpType: 'submersible-primary',
      horsePower: '1/3-hp',
      basinType: 'existing-basin',
      dischargeLine: 'existing',
      checkValve: 'none',
      region: 'northeast',
    });
    // Labor: 300×1.20=360 low, 600×1.20=720 high
    expect(northeast.laborCost as number).toBeCloseTo((national.laborCost as number) * 1.20, 0);
    expect(northeast.totalLow).toBeCloseTo(150 + 360, 0);
    expect(northeast.totalHigh).toBeCloseTo(400 + 720, 0);
  });

  // ─── Test 16: West Coast regional multiplier (1.25x labor) ───
  it('applies west coast regional labor multiplier (1.25x)', () => {
    const result = calculateSumpPumpCost({
      pumpType: 'submersible-primary',
      horsePower: '1/3-hp',
      basinType: 'existing-basin',
      dischargeLine: 'existing',
      checkValve: 'none',
      region: 'west-coast',
    });
    // Labor: 300×1.25=375 low, 600×1.25=750 high
    expect(result.totalLow).toBeCloseTo(150 + 375, 0);
    expect(result.totalHigh).toBeCloseTo(400 + 750, 0);
  });

  // ─── Test 17: South regional multiplier (0.85x labor) ───
  it('applies south regional labor multiplier (0.85x)', () => {
    const result = calculateSumpPumpCost({
      pumpType: 'submersible-primary',
      horsePower: '1/3-hp',
      basinType: 'existing-basin',
      dischargeLine: 'existing',
      checkValve: 'none',
      region: 'south',
    });
    // Labor: 300×0.85=255 low, 600×0.85=510 high
    expect(result.totalLow).toBeCloseTo(150 + 255, 0);
    expect(result.totalHigh).toBeCloseTo(400 + 510, 0);
  });

  // ─── Test 18: Midwest regional multiplier (0.90x labor) ───
  it('applies midwest regional labor multiplier (0.90x)', () => {
    const result = calculateSumpPumpCost({
      pumpType: 'submersible-primary',
      horsePower: '1/3-hp',
      basinType: 'existing-basin',
      dischargeLine: 'existing',
      checkValve: 'none',
      region: 'midwest',
    });
    // Labor: 300×0.90=270 low, 600×0.90=540 high
    expect(result.totalLow).toBeCloseTo(150 + 270, 0);
    expect(result.totalHigh).toBeCloseTo(400 + 540, 0);
  });

  // ─── Test 19: Mountain West regional multiplier (0.95x labor) ───
  it('applies mountain west regional labor multiplier (0.95x)', () => {
    const result = calculateSumpPumpCost({
      pumpType: 'submersible-primary',
      horsePower: '1/3-hp',
      basinType: 'existing-basin',
      dischargeLine: 'existing',
      checkValve: 'none',
      region: 'mountain-west',
    });
    // Labor: 300×0.95=285 low, 600×0.95=570 high
    expect(result.totalLow).toBeCloseTo(150 + 285, 0);
    expect(result.totalHigh).toBeCloseTo(400 + 570, 0);
  });

  // ─── Test 20: Full build — combination, 1 HP, new fiberglass, exterior burial, quiet check, northeast ───
  it('calculates fully loaded premium sump pump project', () => {
    const result = calculateSumpPumpCost({
      pumpType: 'combination-primary-backup',
      horsePower: '1-hp',
      basinType: 'new-fiberglass',
      dischargeLine: 'new-exterior-with-burial',
      checkValve: 'quiet-check',
      region: 'northeast',
    });
    // Pump: 500×1.55=775 low, 1200×1.55=1860 high
    // Basin: 150–350
    // Discharge: 300–800
    // CheckValve: 60–120
    // Labor: 300×1.20=360 low, 600×1.20=720 high
    // Total low: 775+150+300+60+360 = 1645
    // Total high: 1860+350+800+120+720 = 3850
    expect(result.totalLow).toBeCloseTo(1645, 0);
    expect(result.totalHigh).toBeCloseTo(3850, 0);
    expect(result.totalMid).toBeCloseTo((1645 + 3850) / 2, 0);
  });

  // ─── Test 21: Pump type comparison returns all 5 types ───
  it('returns pump type comparison with all 5 pump types', () => {
    const result = calculateSumpPumpCost({
      pumpType: 'submersible-primary',
      horsePower: '1/3-hp',
      basinType: 'existing-basin',
      dischargeLine: 'existing',
      checkValve: 'none',
      region: 'national',
    });
    const comparison = result.pumpTypeComparison as Array<{ label: string; value: number }>;
    expect(comparison).toHaveLength(5);
    comparison.forEach(item => {
      expect(item.value).toBeGreaterThan(0);
      expect(item.label).toBeTruthy();
    });
    // Combination should be most expensive
    const combo = comparison.find(c => c.label.includes('Combination'));
    const pedestal = comparison.find(c => c.label.includes('Pedestal'));
    expect(combo!.value).toBeGreaterThan(pedestal!.value);
  });

  // ─── Test 22: Timeline output ───
  it('returns correct project timeline', () => {
    const result = calculateSumpPumpCost({
      pumpType: 'submersible-primary',
      horsePower: '1/3-hp',
      basinType: 'existing-basin',
      dischargeLine: 'existing',
      checkValve: 'none',
      region: 'national',
    });
    expect(result.timeline).toBe('3-6 hours');
  });

  // ─── Test 23: Output structure — all expected fields present ───
  it('returns all expected output fields', () => {
    const result = calculateSumpPumpCost({
      pumpType: 'submersible-primary',
      horsePower: '1/3-hp',
      basinType: 'existing-basin',
      dischargeLine: 'existing',
      checkValve: 'none',
      region: 'national',
    });
    expect(result).toHaveProperty('pumpCost');
    expect(result).toHaveProperty('basinCost');
    expect(result).toHaveProperty('dischargeCost');
    expect(result).toHaveProperty('checkValveCost');
    expect(result).toHaveProperty('laborCost');
    expect(result).toHaveProperty('subtotalLow');
    expect(result).toHaveProperty('subtotalHigh');
    expect(result).toHaveProperty('subtotal');
    expect(result).toHaveProperty('totalLow');
    expect(result).toHaveProperty('totalHigh');
    expect(result).toHaveProperty('totalMid');
    expect(result).toHaveProperty('pumpTypeComparison');
    expect(result).toHaveProperty('timeline');
  });

  // ─── Test 24: Default inputs produce valid output ───
  it('uses default inputs when values are missing', () => {
    const result = calculateSumpPumpCost({});
    // Defaults: submersible-primary, 1/3-hp, existing-basin, existing, none, national
    expect(result.totalLow).toBeCloseTo(450, 0);
    expect(result.totalHigh).toBeCloseTo(1000, 0);
  });

  // ─── Test 25: Mid-Atlantic regional multiplier (1.15x labor) ───
  it('applies mid-atlantic regional labor multiplier (1.15x)', () => {
    const result = calculateSumpPumpCost({
      pumpType: 'submersible-primary',
      horsePower: '1/3-hp',
      basinType: 'existing-basin',
      dischargeLine: 'existing',
      checkValve: 'none',
      region: 'mid-atlantic',
    });
    // Labor: 300×1.15=345 low, 600×1.15=690 high
    expect(result.totalLow).toBeCloseTo(150 + 345, 0);
    expect(result.totalHigh).toBeCloseTo(400 + 690, 0);
  });
});
