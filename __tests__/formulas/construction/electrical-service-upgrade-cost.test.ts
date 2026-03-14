import { calculateElectricalServiceUpgradeCost } from '@/lib/formulas/construction/electrical-service-upgrade-cost';

describe('calculateElectricalServiceUpgradeCost', () => {
  // ─── Test 1: Default inputs (100-to-200, same-location, standard, modern, permit, national) ───
  it('calculates defaults — 100 to 200 amp service upgrade with standard options', () => {
    const result = calculateElectricalServiceUpgradeCost({});
    // Base: $3000–$5000
    // Material: $3000 x 0.35 = $1050 low, $5000 x 0.35 = $1750 high
    // Labor: $3000 x 0.65 x 1.0 x 1.0 x 1.0 x 1.0 = $1950 low, $5000 x 0.65 = $3250 high
    // Permit: $200–$600
    // TotalLow: 1050 + 1950 + 200 = $3200
    // TotalHigh: 1750 + 3250 + 600 = $5600
    // TotalMid: (3200 + 5600) / 2 = $4400
    expect(result.totalLow).toBe(3200);
    expect(result.totalHigh).toBe(5600);
    expect(result.totalMid).toBe(4400);
  });

  // ─── Test 2: 200-to-400 upgrade, all defaults ───
  it('calculates 200 to 400 amp service upgrade at national average', () => {
    const result = calculateElectricalServiceUpgradeCost({
      upgradeType: '200-to-400',
      meterLocation: 'same-location',
      weatherhead: 'standard',
      homeAge: 'modern-post-2000',
      permitRequired: 'yes',
      region: 'national',
    });
    // Base: $5000–$10000
    // Material: $1750–$3500
    // Labor: $3250–$6500
    // Permit: $200–$600
    // TotalLow: 1750 + 3250 + 200 = $5200
    // TotalHigh: 3500 + 6500 + 600 = $10600
    expect(result.totalLow).toBe(5200);
    expect(result.totalHigh).toBe(10600);
    expect(result.totalMid).toBe(7900);
  });

  // ─── Test 3: 100-to-400 upgrade, all defaults ───
  it('calculates 100 to 400 amp service upgrade at national average', () => {
    const result = calculateElectricalServiceUpgradeCost({
      upgradeType: '100-to-400',
      meterLocation: 'same-location',
      weatherhead: 'standard',
      homeAge: 'modern-post-2000',
      permitRequired: 'yes',
      region: 'national',
    });
    // Base: $7000–$14000
    // Material: $2450–$4900
    // Labor: $4550–$9100
    // Permit: $200–$600
    // TotalLow: 2450 + 4550 + 200 = $7200
    // TotalHigh: 4900 + 9100 + 600 = $14600
    expect(result.totalLow).toBe(7200);
    expect(result.totalHigh).toBe(14600);
    expect(result.totalMid).toBe(10900);
  });

  // ─── Test 4: Material/labor split is 35/65 ───
  it('splits base cost into 35% material and 65% labor', () => {
    const result = calculateElectricalServiceUpgradeCost({
      upgradeType: '100-to-200',
      meterLocation: 'same-location',
      weatherhead: 'standard',
      homeAge: 'modern-post-2000',
      permitRequired: 'no',
      region: 'national',
    });
    // No permit, national, all 1.0x multipliers
    // Material mid: (1050 + 1750) / 2 = $1400
    // Labor mid: (1950 + 3250) / 2 = $2600
    expect(result.materialCost).toBe(1400);
    expect(result.laborCost).toBe(2600);
    // material + labor = 1400 + 2600 = 4000 = base mid (3000+5000)/2
    expect((result.materialCost as number) + (result.laborCost as number)).toBe(4000);
  });

  // ─── Test 5: Meter relocation multiplier (1.20x on labor) ───
  it('applies meter relocation multiplier (1.20x) to labor only', () => {
    const same = calculateElectricalServiceUpgradeCost({
      upgradeType: '100-to-200', meterLocation: 'same-location',
      weatherhead: 'standard', homeAge: 'modern-post-2000', permitRequired: 'no', region: 'national',
    });
    const relocate = calculateElectricalServiceUpgradeCost({
      upgradeType: '100-to-200', meterLocation: 'relocate',
      weatherhead: 'standard', homeAge: 'modern-post-2000', permitRequired: 'no', region: 'national',
    });
    // Material stays the same
    expect(relocate.materialCost).toBe(same.materialCost);
    // Labor increases by 1.20x
    expect((relocate.laborCost as number)).toBeCloseTo((same.laborCost as number) * 1.20, 1);
    // TotalLow: 1050 + (1950 x 1.20 = 2340) = $3390
    expect(relocate.totalLow).toBe(3390);
    // TotalHigh: 1750 + (3250 x 1.20 = 3900) = $5650
    expect(relocate.totalHigh).toBe(5650);
  });

  // ─── Test 6: Underground conversion multiplier (1.30x on labor) ───
  it('applies underground conversion multiplier (1.30x) to labor only', () => {
    const standard = calculateElectricalServiceUpgradeCost({
      upgradeType: '100-to-200', meterLocation: 'same-location',
      weatherhead: 'standard', homeAge: 'modern-post-2000', permitRequired: 'no', region: 'national',
    });
    const underground = calculateElectricalServiceUpgradeCost({
      upgradeType: '100-to-200', meterLocation: 'same-location',
      weatherhead: 'underground-conversion', homeAge: 'modern-post-2000', permitRequired: 'no', region: 'national',
    });
    expect(underground.materialCost).toBe(standard.materialCost);
    expect((underground.laborCost as number)).toBeCloseTo((standard.laborCost as number) * 1.30, 1);
    // TotalLow: 1050 + (1950 x 1.30 = 2535) = $3585
    expect(underground.totalLow).toBe(3585);
  });

  // ─── Test 7: Home age — mid (1960-2000) multiplier (1.10x on labor) ───
  it('applies mid-age home multiplier (1.10x) to labor only', () => {
    const modern = calculateElectricalServiceUpgradeCost({
      upgradeType: '100-to-200', meterLocation: 'same-location',
      weatherhead: 'standard', homeAge: 'modern-post-2000', permitRequired: 'no', region: 'national',
    });
    const mid = calculateElectricalServiceUpgradeCost({
      upgradeType: '100-to-200', meterLocation: 'same-location',
      weatherhead: 'standard', homeAge: 'mid-1960-2000', permitRequired: 'no', region: 'national',
    });
    expect(mid.materialCost).toBe(modern.materialCost);
    expect((mid.laborCost as number)).toBeCloseTo((modern.laborCost as number) * 1.10, 1);
  });

  // ─── Test 8: Home age — old (pre-1960) multiplier (1.25x on labor) ───
  it('applies old home multiplier (1.25x) to labor only', () => {
    const modern = calculateElectricalServiceUpgradeCost({
      upgradeType: '100-to-200', meterLocation: 'same-location',
      weatherhead: 'standard', homeAge: 'modern-post-2000', permitRequired: 'no', region: 'national',
    });
    const old = calculateElectricalServiceUpgradeCost({
      upgradeType: '100-to-200', meterLocation: 'same-location',
      weatherhead: 'standard', homeAge: 'old-pre-1960', permitRequired: 'no', region: 'national',
    });
    expect(old.materialCost).toBe(modern.materialCost);
    expect((old.laborCost as number)).toBeCloseTo((modern.laborCost as number) * 1.25, 1);
    // TotalLow: 1050 + (1950 x 1.25 = 2437.50) = $3487.50
    expect(old.totalLow).toBeCloseTo(3487.50, 1);
  });

  // ─── Test 9: Permit cost ($200–$600) ───
  it('adds permit cost when required', () => {
    const noPermit = calculateElectricalServiceUpgradeCost({
      upgradeType: '100-to-200', meterLocation: 'same-location',
      weatherhead: 'standard', homeAge: 'modern-post-2000', permitRequired: 'no', region: 'national',
    });
    const withPermit = calculateElectricalServiceUpgradeCost({
      upgradeType: '100-to-200', meterLocation: 'same-location',
      weatherhead: 'standard', homeAge: 'modern-post-2000', permitRequired: 'yes', region: 'national',
    });
    expect(withPermit.permitCost).toBe(400); // (200 + 600) / 2
    expect(noPermit.permitCost).toBe(0);
    expect((withPermit.totalLow as number)).toBe((noPermit.totalLow as number) + 200);
    expect((withPermit.totalHigh as number)).toBe((noPermit.totalHigh as number) + 600);
  });

  // ─── Test 10: Northeast region multiplier (1.20x labor) ───
  it('applies northeast regional labor multiplier (1.20x)', () => {
    const national = calculateElectricalServiceUpgradeCost({
      upgradeType: '100-to-200', meterLocation: 'same-location',
      weatherhead: 'standard', homeAge: 'modern-post-2000', permitRequired: 'no', region: 'national',
    });
    const northeast = calculateElectricalServiceUpgradeCost({
      upgradeType: '100-to-200', meterLocation: 'same-location',
      weatherhead: 'standard', homeAge: 'modern-post-2000', permitRequired: 'no', region: 'northeast',
    });
    expect(northeast.materialCost).toBe(national.materialCost);
    expect((northeast.laborCost as number)).toBeCloseTo((national.laborCost as number) * 1.20, 1);
    // TotalLow: 1050 + (1950 x 1.20 = 2340) = $3390
    expect(northeast.totalLow).toBe(3390);
    // TotalHigh: 1750 + (3250 x 1.20 = 3900) = $5650
    expect(northeast.totalHigh).toBe(5650);
  });

  // ─── Test 11: South region multiplier (0.85x labor) ───
  it('applies south regional labor multiplier (0.85x)', () => {
    const result = calculateElectricalServiceUpgradeCost({
      upgradeType: '100-to-200', meterLocation: 'same-location',
      weatherhead: 'standard', homeAge: 'modern-post-2000', permitRequired: 'no', region: 'south',
    });
    // Labor low: 1950 x 0.85 = $1657.50, high: 3250 x 0.85 = $2762.50
    // TotalLow: 1050 + 1657.50 = $2707.50
    expect(result.totalLow).toBeCloseTo(2707.50, 1);
    // TotalHigh: 1750 + 2762.50 = $4512.50
    expect(result.totalHigh).toBeCloseTo(4512.50, 1);
  });

  // ─── Test 12: West Coast region multiplier (1.25x — highest) ───
  it('applies west coast regional labor multiplier (1.25x)', () => {
    const result = calculateElectricalServiceUpgradeCost({
      upgradeType: '100-to-200', meterLocation: 'same-location',
      weatherhead: 'standard', homeAge: 'modern-post-2000', permitRequired: 'no', region: 'west-coast',
    });
    // Labor low: 1950 x 1.25 = $2437.50, high: 3250 x 1.25 = $4062.50
    // TotalLow: 1050 + 2437.50 = $3487.50
    expect(result.totalLow).toBeCloseTo(3487.50, 1);
    // TotalHigh: 1750 + 4062.50 = $5812.50
    expect(result.totalHigh).toBeCloseTo(5812.50, 1);
  });

  // ─── Test 13: Midwest region multiplier (0.90x) ───
  it('applies midwest regional labor multiplier (0.90x)', () => {
    const result = calculateElectricalServiceUpgradeCost({
      upgradeType: '100-to-200', meterLocation: 'same-location',
      weatherhead: 'standard', homeAge: 'modern-post-2000', permitRequired: 'no', region: 'midwest',
    });
    // Labor low: 1950 x 0.90 = $1755, high: 3250 x 0.90 = $2925
    // TotalLow: 1050 + 1755 = $2805
    expect(result.totalLow).toBe(2805);
    expect(result.totalHigh).toBe(4675); // 1750 + 2925
  });

  // ─── Test 14: Mid-Atlantic region multiplier (1.15x) ───
  it('applies mid-atlantic regional labor multiplier (1.15x)', () => {
    const result = calculateElectricalServiceUpgradeCost({
      upgradeType: '100-to-200', meterLocation: 'same-location',
      weatherhead: 'standard', homeAge: 'modern-post-2000', permitRequired: 'no', region: 'mid-atlantic',
    });
    // Labor low: 1950 x 1.15 = $2242.50, high: 3250 x 1.15 = $3737.50
    // TotalLow: 1050 + 2242.50 = $3292.50
    expect(result.totalLow).toBeCloseTo(3292.50, 1);
    expect(result.totalHigh).toBeCloseTo(5487.50, 1);
  });

  // ─── Test 15: Mountain West region multiplier (0.95x) ───
  it('applies mountain west regional labor multiplier (0.95x)', () => {
    const result = calculateElectricalServiceUpgradeCost({
      upgradeType: '100-to-200', meterLocation: 'same-location',
      weatherhead: 'standard', homeAge: 'modern-post-2000', permitRequired: 'no', region: 'mountain-west',
    });
    // Labor low: 1950 x 0.95 = $1852.50, high: 3250 x 0.95 = $3087.50
    // TotalLow: 1050 + 1852.50 = $2902.50
    expect(result.totalLow).toBeCloseTo(2902.50, 1);
    expect(result.totalHigh).toBeCloseTo(4837.50, 1);
  });

  // ─── Test 16: Stacked multipliers — relocate + underground + old home + northeast ───
  it('stacks all labor multipliers correctly', () => {
    const result = calculateElectricalServiceUpgradeCost({
      upgradeType: '100-to-200', meterLocation: 'relocate',
      weatherhead: 'underground-conversion', homeAge: 'old-pre-1960', permitRequired: 'no', region: 'northeast',
    });
    // Combined mult: 1.20 x 1.30 x 1.25 x 1.20 = 2.34
    const combinedMult = 1.20 * 1.30 * 1.25 * 1.20;
    // Labor low: 1950 x 2.34 = $4563
    // Labor high: 3250 x 2.34 = $7605
    // Material low: $1050, high: $1750
    // TotalLow: 1050 + 4563 = $5613
    expect(result.totalLow).toBeCloseTo(1050 + 1950 * combinedMult, 0);
    expect(result.totalHigh).toBeCloseTo(1750 + 3250 * combinedMult, 0);
  });

  // ─── Test 17: Cost per amp — 100-to-200 ───
  it('calculates cost per amp for 100-to-200 upgrade', () => {
    const result = calculateElectricalServiceUpgradeCost({
      upgradeType: '100-to-200', meterLocation: 'same-location',
      weatherhead: 'standard', homeAge: 'modern-post-2000', permitRequired: 'yes', region: 'national',
    });
    // TotalMid: $4400, target amps: 200
    // CostPerAmp: 4400 / 200 = $22
    expect(result.costPerAmp).toBe(22);
  });

  // ─── Test 18: Cost per amp — 200-to-400 ───
  it('calculates cost per amp for 200-to-400 upgrade', () => {
    const result = calculateElectricalServiceUpgradeCost({
      upgradeType: '200-to-400', meterLocation: 'same-location',
      weatherhead: 'standard', homeAge: 'modern-post-2000', permitRequired: 'yes', region: 'national',
    });
    // TotalMid: $7900, target amps: 400
    // CostPerAmp: 7900 / 400 = $19.75
    expect(result.costPerAmp).toBe(19.75);
  });

  // ─── Test 19: Upgrade comparison structure ───
  it('returns upgrade comparison with all 3 upgrade types', () => {
    const result = calculateElectricalServiceUpgradeCost({
      upgradeType: '100-to-200', meterLocation: 'same-location',
      weatherhead: 'standard', homeAge: 'modern-post-2000', permitRequired: 'yes', region: 'national',
    });
    const comparison = result.upgradeComparison as Array<{ label: string; value: number }>;
    expect(comparison).toHaveLength(3);
    comparison.forEach(item => {
      expect(item.value).toBeGreaterThan(0);
      expect(item.label).toBeTruthy();
    });
    // 100-to-200 should be cheapest, 100-to-400 most expensive
    const low = comparison.find(c => c.label.includes('100A to 200A'));
    const high = comparison.find(c => c.label.includes('100A to 400A'));
    expect(low!.value).toBeLessThan(high!.value);
  });

  // ─── Test 20: Timeline output ───
  it('returns correct timeline for each upgrade type', () => {
    const u100to200 = calculateElectricalServiceUpgradeCost({
      upgradeType: '100-to-200', meterLocation: 'same-location',
      weatherhead: 'standard', homeAge: 'modern-post-2000', permitRequired: 'no', region: 'national',
    });
    expect(u100to200.timeline).toBe('1–2 days (plus utility scheduling)');

    const u200to400 = calculateElectricalServiceUpgradeCost({
      upgradeType: '200-to-400', meterLocation: 'same-location',
      weatherhead: 'standard', homeAge: 'modern-post-2000', permitRequired: 'no', region: 'national',
    });
    expect(u200to400.timeline).toBe('2–3 days (plus utility scheduling)');

    const u100to400 = calculateElectricalServiceUpgradeCost({
      upgradeType: '100-to-400', meterLocation: 'same-location',
      weatherhead: 'standard', homeAge: 'modern-post-2000', permitRequired: 'no', region: 'national',
    });
    expect(u100to400.timeline).toBe('2–4 days (plus utility scheduling)');
  });

  // ─── Test 21: Utility note present ───
  it('returns utility note string', () => {
    const result = calculateElectricalServiceUpgradeCost({});
    expect(typeof result.utilityNote).toBe('string');
    expect((result.utilityNote as string).length).toBeGreaterThan(0);
    expect((result.utilityNote as string)).toContain('utility');
  });

  // ─── Test 22: Output structure — all expected fields present ───
  it('returns all expected output fields', () => {
    const result = calculateElectricalServiceUpgradeCost({});
    expect(result).toHaveProperty('upgradeCost');
    expect(result).toHaveProperty('materialCost');
    expect(result).toHaveProperty('laborCost');
    expect(result).toHaveProperty('permitCost');
    expect(result).toHaveProperty('totalLow');
    expect(result).toHaveProperty('totalHigh');
    expect(result).toHaveProperty('totalMid');
    expect(result).toHaveProperty('costPerAmp');
    expect(result).toHaveProperty('upgradeComparison');
    expect(result).toHaveProperty('timeline');
    expect(result).toHaveProperty('utilityNote');
  });

  // ─── Test 23: Regional multiplier only affects labor, not materials or permit ───
  it('regional multiplier changes labor but not material or permit cost', () => {
    const national = calculateElectricalServiceUpgradeCost({
      upgradeType: '200-to-400', meterLocation: 'same-location',
      weatherhead: 'standard', homeAge: 'modern-post-2000', permitRequired: 'yes', region: 'national',
    });
    const westCoast = calculateElectricalServiceUpgradeCost({
      upgradeType: '200-to-400', meterLocation: 'same-location',
      weatherhead: 'standard', homeAge: 'modern-post-2000', permitRequired: 'yes', region: 'west-coast',
    });
    expect(westCoast.materialCost).toBe(national.materialCost);
    expect(westCoast.permitCost).toBe(national.permitCost);
    expect((westCoast.laborCost as number)).toBeGreaterThan((national.laborCost as number));
  });

  // ─── Test 24: 100-to-200 cheapest, 100-to-400 most expensive ───
  it('100-to-200 is cheapest and 100-to-400 is most expensive for same config', () => {
    const types = ['100-to-200', '200-to-400', '100-to-400'];
    const costs = types.map(t => {
      const r = calculateElectricalServiceUpgradeCost({
        upgradeType: t, meterLocation: 'same-location',
        weatherhead: 'standard', homeAge: 'modern-post-2000', permitRequired: 'yes', region: 'national',
      });
      return { type: t, mid: r.totalMid as number };
    });
    // Verify ascending order
    for (let i = 1; i < costs.length; i++) {
      expect(costs[i].mid).toBeGreaterThan(costs[i - 1].mid);
    }
  });
});
