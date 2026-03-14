import { calculateBackupGeneratorCost } from '@/lib/formulas/construction/backup-generator-cost';

describe('calculateBackupGeneratorCost', () => {
  // ─── Test 1: Default inputs (large 20-24kw, natural gas, auto-whole-home, new pad, permit, national) ───
  it('calculates defaults — large 20-24kw natural gas generator with all standard options', () => {
    const result = calculateBackupGeneratorCost({});
    // Generator: $5000–$10000 x 1.0 = $5000–$10000
    // Labor: $5000 x 0.30 x 1.0 = $1500 low, $10000 x 0.30 x 1.0 = $3000 high
    // Transfer switch (auto-whole-home): $1500–$3000
    // Pad (new): $300–$800
    // Permit (yes): $100–$400
    // TotalLow: 5000 + 1500 + 1500 + 300 + 100 = $8400
    // TotalHigh: 10000 + 3000 + 3000 + 800 + 400 = $17200
    // TotalMid: (8400 + 17200) / 2 = $12800
    expect(result.totalLow).toBe(8400);
    expect(result.totalHigh).toBe(17200);
    expect(result.totalMid).toBe(12800);
  });

  // ─── Test 2: Small 7-10kw, natural gas, manual switch, existing pad, no permit, national ───
  it('calculates small generator with minimal options', () => {
    const result = calculateBackupGeneratorCost({
      generatorSize: 'small-7-10kw',
      fuelType: 'natural-gas',
      transferSwitch: 'manual',
      pad: 'existing',
      permitRequired: 'no',
      region: 'national',
    });
    // Generator: $2500–$4000 x 1.0
    // Labor: $2500 x 0.30 = $750 low, $4000 x 0.30 = $1200 high
    // Transfer switch (manual): $300–$600
    // Pad: $0, Permit: $0
    // TotalLow: 2500 + 750 + 300 + 0 + 0 = $3550
    // TotalHigh: 4000 + 1200 + 600 + 0 + 0 = $5800
    expect(result.totalLow).toBe(3550);
    expect(result.totalHigh).toBe(5800);
    expect(result.totalMid).toBe(4675);
  });

  // ─── Test 3: Medium 12-16kw, natural gas, national ───
  it('calculates medium generator at national average', () => {
    const result = calculateBackupGeneratorCost({
      generatorSize: 'medium-12-16kw',
      fuelType: 'natural-gas',
      transferSwitch: 'automatic-load-shedding',
      pad: 'new-concrete-pad',
      permitRequired: 'yes',
      region: 'national',
    });
    // Generator: $3500–$6000 x 1.0
    // Labor: $3500 x 0.30 = $1050, $6000 x 0.30 = $1800
    // Transfer switch (auto-load-shedding): $800–$1500
    // Pad: $300–$800, Permit: $100–$400
    // TotalLow: 3500 + 1050 + 800 + 300 + 100 = $5750
    // TotalHigh: 6000 + 1800 + 1500 + 800 + 400 = $10500
    expect(result.totalLow).toBe(5750);
    expect(result.totalHigh).toBe(10500);
    expect(result.totalMid).toBe(8125);
  });

  // ─── Test 4: XLarge 30-48kw, natural gas, national ───
  it('calculates xlarge generator at national average', () => {
    const result = calculateBackupGeneratorCost({
      generatorSize: 'xlarge-30-48kw',
      fuelType: 'natural-gas',
      transferSwitch: 'automatic-whole-home',
      pad: 'new-concrete-pad',
      permitRequired: 'yes',
      region: 'national',
    });
    // Generator: $10000–$18000 x 1.0
    // Labor: $10000 x 0.30 = $3000, $18000 x 0.30 = $5400
    // Transfer switch: $1500–$3000
    // Pad: $300–$800, Permit: $100–$400
    // TotalLow: 10000 + 3000 + 1500 + 300 + 100 = $14900
    // TotalHigh: 18000 + 5400 + 3000 + 800 + 400 = $27600
    expect(result.totalLow).toBe(14900);
    expect(result.totalHigh).toBe(27600);
    expect(result.totalMid).toBe(21250);
  });

  // ─── Test 5: Propane fuel multiplier (1.05x) ───
  it('applies propane fuel multiplier (1.05x) to generator cost', () => {
    const natGas = calculateBackupGeneratorCost({
      generatorSize: 'large-20-24kw', fuelType: 'natural-gas',
      transferSwitch: 'manual', pad: 'existing', permitRequired: 'no', region: 'national',
    });
    const propane = calculateBackupGeneratorCost({
      generatorSize: 'large-20-24kw', fuelType: 'propane',
      transferSwitch: 'manual', pad: 'existing', permitRequired: 'no', region: 'national',
    });
    // Generator nat gas: mid = (5000+10000)/2 = 7500
    // Generator propane: mid = (5250+10500)/2 = 7875
    expect((propane.generatorCost as number)).toBeCloseTo((natGas.generatorCost as number) * 1.05, 1);
    // Labor also increases since it's 30% of generator cost
    expect((propane.laborCost as number)).toBeCloseTo((natGas.laborCost as number) * 1.05, 1);
  });

  // ─── Test 6: Diesel fuel multiplier (1.15x) ───
  it('applies diesel fuel multiplier (1.15x) to generator cost', () => {
    const natGas = calculateBackupGeneratorCost({
      generatorSize: 'large-20-24kw', fuelType: 'natural-gas',
      transferSwitch: 'manual', pad: 'existing', permitRequired: 'no', region: 'national',
    });
    const diesel = calculateBackupGeneratorCost({
      generatorSize: 'large-20-24kw', fuelType: 'diesel',
      transferSwitch: 'manual', pad: 'existing', permitRequired: 'no', region: 'national',
    });
    expect((diesel.generatorCost as number)).toBeCloseTo((natGas.generatorCost as number) * 1.15, 1);
    expect((diesel.laborCost as number)).toBeCloseTo((natGas.laborCost as number) * 1.15, 1);
  });

  // ─── Test 7: Transfer switch — manual ($300–$600) ───
  it('calculates manual transfer switch cost', () => {
    const result = calculateBackupGeneratorCost({
      generatorSize: 'small-7-10kw', fuelType: 'natural-gas',
      transferSwitch: 'manual', pad: 'existing', permitRequired: 'no', region: 'national',
    });
    expect(result.transferSwitchCost).toBe(450); // (300 + 600) / 2
  });

  // ─── Test 8: Transfer switch — automatic load-shedding ($800–$1500) ───
  it('calculates automatic load-shedding transfer switch cost', () => {
    const result = calculateBackupGeneratorCost({
      generatorSize: 'small-7-10kw', fuelType: 'natural-gas',
      transferSwitch: 'automatic-load-shedding', pad: 'existing', permitRequired: 'no', region: 'national',
    });
    expect(result.transferSwitchCost).toBe(1150); // (800 + 1500) / 2
  });

  // ─── Test 9: Transfer switch — automatic whole-home ($1500–$3000) ───
  it('calculates automatic whole-home transfer switch cost', () => {
    const result = calculateBackupGeneratorCost({
      generatorSize: 'small-7-10kw', fuelType: 'natural-gas',
      transferSwitch: 'automatic-whole-home', pad: 'existing', permitRequired: 'no', region: 'national',
    });
    expect(result.transferSwitchCost).toBe(2250); // (1500 + 3000) / 2
  });

  // ─── Test 10: New concrete pad add-on ($300–$800) ───
  it('adds new concrete pad cost', () => {
    const noPad = calculateBackupGeneratorCost({
      generatorSize: 'small-7-10kw', fuelType: 'natural-gas',
      transferSwitch: 'manual', pad: 'existing', permitRequired: 'no', region: 'national',
    });
    const withPad = calculateBackupGeneratorCost({
      generatorSize: 'small-7-10kw', fuelType: 'natural-gas',
      transferSwitch: 'manual', pad: 'new-concrete-pad', permitRequired: 'no', region: 'national',
    });
    expect(withPad.padCost).toBe(550); // (300 + 800) / 2
    expect(noPad.padCost).toBe(0);
    expect((withPad.totalLow as number)).toBe((noPad.totalLow as number) + 300);
    expect((withPad.totalHigh as number)).toBe((noPad.totalHigh as number) + 800);
  });

  // ─── Test 11: Permit add-on ($100–$400) ───
  it('adds permit cost when required', () => {
    const noPermit = calculateBackupGeneratorCost({
      generatorSize: 'small-7-10kw', fuelType: 'natural-gas',
      transferSwitch: 'manual', pad: 'existing', permitRequired: 'no', region: 'national',
    });
    const withPermit = calculateBackupGeneratorCost({
      generatorSize: 'small-7-10kw', fuelType: 'natural-gas',
      transferSwitch: 'manual', pad: 'existing', permitRequired: 'yes', region: 'national',
    });
    expect(withPermit.permitCost).toBe(250); // (100 + 400) / 2
    expect(noPermit.permitCost).toBe(0);
    expect((withPermit.totalLow as number)).toBe((noPermit.totalLow as number) + 100);
    expect((withPermit.totalHigh as number)).toBe((noPermit.totalHigh as number) + 400);
  });

  // ─── Test 12: Northeast region multiplier (1.20x labor) ───
  it('applies northeast regional labor multiplier (1.20x)', () => {
    const national = calculateBackupGeneratorCost({
      generatorSize: 'small-7-10kw', fuelType: 'natural-gas',
      transferSwitch: 'manual', pad: 'existing', permitRequired: 'no', region: 'national',
    });
    const northeast = calculateBackupGeneratorCost({
      generatorSize: 'small-7-10kw', fuelType: 'natural-gas',
      transferSwitch: 'manual', pad: 'existing', permitRequired: 'no', region: 'northeast',
    });
    expect(northeast.generatorCost).toBe(national.generatorCost); // equipment unchanged
    expect((northeast.laborCost as number)).toBeCloseTo((national.laborCost as number) * 1.20, 1);
    // TotalLow: 2500 + (750 x 1.20 = 900) + 300 = $3700
    expect(northeast.totalLow).toBe(3700);
    // TotalHigh: 4000 + (1200 x 1.20 = 1440) + 600 = $6040
    expect(northeast.totalHigh).toBe(6040);
  });

  // ─── Test 13: South region multiplier (0.85x labor) ───
  it('applies south regional labor multiplier (0.85x)', () => {
    const result = calculateBackupGeneratorCost({
      generatorSize: 'small-7-10kw', fuelType: 'natural-gas',
      transferSwitch: 'manual', pad: 'existing', permitRequired: 'no', region: 'south',
    });
    // Labor low: 750 x 0.85 = $637.50, high: 1200 x 0.85 = $1020
    // TotalLow: 2500 + 637.50 + 300 = $3437.50
    expect(result.totalLow).toBeCloseTo(3437.50, 1);
    // TotalHigh: 4000 + 1020 + 600 = $5620
    expect(result.totalHigh).toBe(5620);
  });

  // ─── Test 14: West Coast region multiplier (1.25x — highest) ───
  it('applies west coast regional labor multiplier (1.25x)', () => {
    const result = calculateBackupGeneratorCost({
      generatorSize: 'small-7-10kw', fuelType: 'natural-gas',
      transferSwitch: 'manual', pad: 'existing', permitRequired: 'no', region: 'west-coast',
    });
    // Labor low: 750 x 1.25 = $937.50, high: 1200 x 1.25 = $1500
    // TotalLow: 2500 + 937.50 + 300 = $3737.50
    expect(result.totalLow).toBeCloseTo(3737.50, 1);
    // TotalHigh: 4000 + 1500 + 600 = $6100
    expect(result.totalHigh).toBe(6100);
  });

  // ─── Test 15: Midwest region multiplier (0.90x) ───
  it('applies midwest regional labor multiplier (0.90x)', () => {
    const result = calculateBackupGeneratorCost({
      generatorSize: 'small-7-10kw', fuelType: 'natural-gas',
      transferSwitch: 'manual', pad: 'existing', permitRequired: 'no', region: 'midwest',
    });
    // Labor low: 750 x 0.90 = $675, high: 1200 x 0.90 = $1080
    // TotalLow: 2500 + 675 + 300 = $3475
    expect(result.totalLow).toBe(3475);
    // TotalHigh: 4000 + 1080 + 600 = $5680
    expect(result.totalHigh).toBe(5680);
  });

  // ─── Test 16: Mid-Atlantic region multiplier (1.15x) ───
  it('applies mid-atlantic regional labor multiplier (1.15x)', () => {
    const result = calculateBackupGeneratorCost({
      generatorSize: 'small-7-10kw', fuelType: 'natural-gas',
      transferSwitch: 'manual', pad: 'existing', permitRequired: 'no', region: 'mid-atlantic',
    });
    // Labor low: 750 x 1.15 = $862.50, high: 1200 x 1.15 = $1380
    // TotalLow: 2500 + 862.50 + 300 = $3662.50
    expect(result.totalLow).toBeCloseTo(3662.50, 1);
    expect(result.totalHigh).toBe(5980);
  });

  // ─── Test 17: Mountain West region multiplier (0.95x) ───
  it('applies mountain west regional labor multiplier (0.95x)', () => {
    const result = calculateBackupGeneratorCost({
      generatorSize: 'small-7-10kw', fuelType: 'natural-gas',
      transferSwitch: 'manual', pad: 'existing', permitRequired: 'no', region: 'mountain-west',
    });
    // Labor low: 750 x 0.95 = $712.50, high: 1200 x 0.95 = $1140
    // TotalLow: 2500 + 712.50 + 300 = $3512.50
    expect(result.totalLow).toBeCloseTo(3512.50, 1);
    expect(result.totalHigh).toBe(5740);
  });

  // ─── Test 18: Regional multiplier only affects labor ───
  it('regional multiplier changes labor but not generator, switch, pad, or permit', () => {
    const national = calculateBackupGeneratorCost({
      generatorSize: 'medium-12-16kw', fuelType: 'propane',
      transferSwitch: 'automatic-load-shedding', pad: 'new-concrete-pad', permitRequired: 'yes', region: 'national',
    });
    const westCoast = calculateBackupGeneratorCost({
      generatorSize: 'medium-12-16kw', fuelType: 'propane',
      transferSwitch: 'automatic-load-shedding', pad: 'new-concrete-pad', permitRequired: 'yes', region: 'west-coast',
    });
    expect(westCoast.generatorCost).toBe(national.generatorCost);
    expect(westCoast.transferSwitchCost).toBe(national.transferSwitchCost);
    expect(westCoast.padCost).toBe(national.padCost);
    expect(westCoast.permitCost).toBe(national.permitCost);
    expect((westCoast.laborCost as number)).toBeGreaterThan((national.laborCost as number));
  });

  // ─── Test 19: Full build — xlarge diesel, auto-whole-home, new pad, permit, west coast ───
  it('calculates a fully loaded xlarge diesel generator on west coast', () => {
    const result = calculateBackupGeneratorCost({
      generatorSize: 'xlarge-30-48kw',
      fuelType: 'diesel',
      transferSwitch: 'automatic-whole-home',
      pad: 'new-concrete-pad',
      permitRequired: 'yes',
      region: 'west-coast',
    });
    // Generator: $10000 x 1.15 = $11500 low, $18000 x 1.15 = $20700 high
    // Labor: $11500 x 0.30 x 1.25 = $4312.50 low, $20700 x 0.30 x 1.25 = $7762.50 high
    // Transfer switch: $1500–$3000
    // Pad: $300–$800
    // Permit: $100–$400
    // TotalLow: 11500 + 4312.50 + 1500 + 300 + 100 = $17712.50
    // TotalHigh: 20700 + 7762.50 + 3000 + 800 + 400 = $32662.50
    expect(result.totalLow).toBeCloseTo(17712.50, 1);
    expect(result.totalHigh).toBeCloseTo(32662.50, 1);
    expect(result.totalMid).toBeCloseTo(25187.50, 1);
  });

  // ─── Test 20: Size comparison structure ───
  it('returns size comparison with all 4 generator sizes', () => {
    const result = calculateBackupGeneratorCost({
      generatorSize: 'small-7-10kw', fuelType: 'natural-gas',
      transferSwitch: 'manual', pad: 'existing', permitRequired: 'no', region: 'national',
    });
    const comparison = result.sizeComparison as Array<{ label: string; value: number }>;
    expect(comparison).toHaveLength(4);
    comparison.forEach(item => {
      expect(item.value).toBeGreaterThan(0);
      expect(item.label).toBeTruthy();
    });
    // Small should be cheapest, xlarge most expensive
    const small = comparison.find(c => c.label.includes('7–10 kW'));
    const xlarge = comparison.find(c => c.label.includes('30–48 kW'));
    expect(small!.value).toBeLessThan(xlarge!.value);
  });

  // ─── Test 21: Weekly fuel cost output ───
  it('returns appropriate weekly fuel cost string', () => {
    const natGas = calculateBackupGeneratorCost({
      generatorSize: 'large-20-24kw', fuelType: 'natural-gas',
      transferSwitch: 'manual', pad: 'existing', permitRequired: 'no', region: 'national',
    });
    expect(natGas.weeklyFuelCost).toBe('$35–$55/week at 50% load');

    const propane = calculateBackupGeneratorCost({
      generatorSize: 'small-7-10kw', fuelType: 'propane',
      transferSwitch: 'manual', pad: 'existing', permitRequired: 'no', region: 'national',
    });
    expect(propane.weeklyFuelCost).toBe('$20–$35/week at 50% load');

    const diesel = calculateBackupGeneratorCost({
      generatorSize: 'xlarge-30-48kw', fuelType: 'diesel',
      transferSwitch: 'manual', pad: 'existing', permitRequired: 'no', region: 'national',
    });
    expect(diesel.weeklyFuelCost).toBe('$85–$140/week at 50% load');
  });

  // ─── Test 22: Timeline output ───
  it('returns correct timeline for each size', () => {
    const large = calculateBackupGeneratorCost({
      generatorSize: 'large-20-24kw', fuelType: 'natural-gas',
      transferSwitch: 'manual', pad: 'existing', permitRequired: 'no', region: 'national',
    });
    expect(large.timeline).toBe('1–2 days');

    const xlarge = calculateBackupGeneratorCost({
      generatorSize: 'xlarge-30-48kw', fuelType: 'natural-gas',
      transferSwitch: 'manual', pad: 'existing', permitRequired: 'no', region: 'national',
    });
    expect(xlarge.timeline).toBe('2–3 days');
  });

  // ─── Test 23: Output structure — all expected fields present ───
  it('returns all expected output fields', () => {
    const result = calculateBackupGeneratorCost({});
    expect(result).toHaveProperty('generatorCost');
    expect(result).toHaveProperty('laborCost');
    expect(result).toHaveProperty('transferSwitchCost');
    expect(result).toHaveProperty('padCost');
    expect(result).toHaveProperty('permitCost');
    expect(result).toHaveProperty('totalLow');
    expect(result).toHaveProperty('totalHigh');
    expect(result).toHaveProperty('totalMid');
    expect(result).toHaveProperty('sizeComparison');
    expect(result).toHaveProperty('weeklyFuelCost');
    expect(result).toHaveProperty('timeline');
  });

  // ─── Test 24: Small cheapest, xlarge most expensive ───
  it('small is cheapest and xlarge is most expensive for same config', () => {
    const sizes = ['small-7-10kw', 'medium-12-16kw', 'large-20-24kw', 'xlarge-30-48kw'];
    const costs = sizes.map(s => {
      const r = calculateBackupGeneratorCost({
        generatorSize: s, fuelType: 'natural-gas',
        transferSwitch: 'manual', pad: 'existing', permitRequired: 'no', region: 'national',
      });
      return { size: s, mid: r.totalMid as number };
    });
    // Verify ascending order
    for (let i = 1; i < costs.length; i++) {
      expect(costs[i].mid).toBeGreaterThan(costs[i - 1].mid);
    }
  });
});
