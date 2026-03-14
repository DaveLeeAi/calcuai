import { calculateWaterHeaterCost } from '@/lib/formulas/construction/water-heater-cost';

describe('calculateWaterHeaterCost', () => {
  // ─── Test 1: Standard tank-gas, 40-gallon, national, no extras ───
  it('calculates a standard tank-gas 40-gallon installation', () => {
    const result = calculateWaterHeaterCost({
      heaterType: 'tank-gas',
      tankSize: '40-gallon',
      fuelConversion: 'none',
      ventingUpgrade: 'none',
      permitRequired: 'no',
      region: 'national',
    });
    // Unit: $800–$1500, size adj $0
    // Labor: $300–$600 × 1.0
    // TotalLow: 800 + 300 = $1100
    // TotalHigh: 1500 + 600 = $2100
    // TotalMid: (1100 + 2100) / 2 = $1600
    expect(result.totalLow).toBe(1100);
    expect(result.totalHigh).toBe(2100);
    expect(result.totalMid).toBe(1600);
    expect(result.unitCost).toBe(1150);
    expect(result.laborCost).toBe(450);
    expect(result.fuelConversionCost).toBe(0);
    expect(result.ventingCost).toBe(0);
    expect(result.permitCost).toBe(0);
  });

  // ─── Test 2: Tank-electric, 50-gallon ───
  it('calculates tank-electric with 50-gallon size adjustment', () => {
    const result = calculateWaterHeaterCost({
      heaterType: 'tank-electric',
      tankSize: '50-gallon',
      fuelConversion: 'none',
      ventingUpgrade: 'none',
      permitRequired: 'no',
      region: 'national',
    });
    // Unit: $600+100=700 low, $1200+200=1400 high
    // Labor: $250–$500
    // TotalLow: 700 + 250 = $950
    // TotalHigh: 1400 + 500 = $1900
    expect(result.totalLow).toBe(950);
    expect(result.totalHigh).toBe(1900);
    expect(result.unitCost).toBe(1050);
    expect(result.annualOperatingCost).toBe(500);
  });

  // ─── Test 3: Tankless-gas, tankless-standard ───
  it('calculates tankless-gas installation', () => {
    const result = calculateWaterHeaterCost({
      heaterType: 'tankless-gas',
      tankSize: 'tankless-standard',
      fuelConversion: 'none',
      ventingUpgrade: 'none',
      permitRequired: 'no',
      region: 'national',
    });
    // Unit: $1500–$3000, size adj $0
    // Labor: $600–$1200
    // TotalLow: 1500 + 600 = $2100
    // TotalHigh: 3000 + 1200 = $4200
    expect(result.totalLow).toBe(2100);
    expect(result.totalHigh).toBe(4200);
    expect(result.totalMid).toBe(3150);
    expect(result.annualOperatingCost).toBe(200);
  });

  // ─── Test 4: Tankless-electric, tankless-high-flow ───
  it('calculates tankless-electric with high-flow adjustment', () => {
    const result = calculateWaterHeaterCost({
      heaterType: 'tankless-electric',
      tankSize: 'tankless-high-flow',
      fuelConversion: 'none',
      ventingUpgrade: 'none',
      permitRequired: 'no',
      region: 'national',
    });
    // Unit: $800+300=1100 low, $1500+500=2000 high
    // Labor: $400–$800
    // TotalLow: 1100 + 400 = $1500
    // TotalHigh: 2000 + 800 = $2800
    expect(result.totalLow).toBe(1500);
    expect(result.totalHigh).toBe(2800);
    expect(result.unitCost).toBe(1550);
    expect(result.annualOperatingCost).toBe(350);
  });

  // ─── Test 5: Heat pump ───
  it('calculates heat pump water heater cost', () => {
    const result = calculateWaterHeaterCost({
      heaterType: 'heat-pump',
      tankSize: '50-gallon',
      fuelConversion: 'none',
      ventingUpgrade: 'none',
      permitRequired: 'no',
      region: 'national',
    });
    // Unit: $1500+100=1600 low, $3500+200=3700 high
    // Labor: $500–$1000
    // TotalLow: 1600 + 500 = $2100
    // TotalHigh: 3700 + 1000 = $4700
    expect(result.totalLow).toBe(2100);
    expect(result.totalHigh).toBe(4700);
    expect(result.annualOperatingCost).toBe(150);
  });

  // ─── Test 6: Solar water heater ───
  it('calculates solar water heater cost', () => {
    const result = calculateWaterHeaterCost({
      heaterType: 'solar',
      tankSize: '40-gallon',
      fuelConversion: 'none',
      ventingUpgrade: 'none',
      permitRequired: 'no',
      region: 'national',
    });
    // Unit: $3000–$6000, size adj $0
    // Labor: $1000–$2000
    // TotalLow: 3000 + 1000 = $4000
    // TotalHigh: 6000 + 2000 = $8000
    expect(result.totalLow).toBe(4000);
    expect(result.totalHigh).toBe(8000);
    expect(result.totalMid).toBe(6000);
    expect(result.annualOperatingCost).toBe(50);
  });

  // ─── Test 7: 75-gallon tank-gas ───
  it('applies 75-gallon size adjustment correctly', () => {
    const result = calculateWaterHeaterCost({
      heaterType: 'tank-gas',
      tankSize: '75-gallon',
      fuelConversion: 'none',
      ventingUpgrade: 'none',
      permitRequired: 'no',
      region: 'national',
    });
    // Unit: $800+200=1000 low, $1500+400=1900 high
    // Labor: $300–$600
    // TotalLow: 1000 + 300 = $1300
    // TotalHigh: 1900 + 600 = $2500
    expect(result.totalLow).toBe(1300);
    expect(result.totalHigh).toBe(2500);
    expect(result.unitCost).toBe(1450);
  });

  // ─── Test 8: Gas-to-electric fuel conversion ───
  it('adds gas-to-electric fuel conversion cost', () => {
    const noConv = calculateWaterHeaterCost({
      heaterType: 'tank-electric',
      tankSize: '40-gallon',
      fuelConversion: 'none',
      ventingUpgrade: 'none',
      permitRequired: 'no',
      region: 'national',
    });
    const withConv = calculateWaterHeaterCost({
      heaterType: 'tank-electric',
      tankSize: '40-gallon',
      fuelConversion: 'gas-to-electric',
      ventingUpgrade: 'none',
      permitRequired: 'no',
      region: 'national',
    });
    // Fuel conv: $500–$1200
    expect(withConv.fuelConversionCost).toBe(850);
    expect((withConv.totalLow as number)).toBe((noConv.totalLow as number) + 500);
    expect((withConv.totalHigh as number)).toBe((noConv.totalHigh as number) + 1200);
  });

  // ─── Test 9: Electric-to-gas fuel conversion ───
  it('adds electric-to-gas fuel conversion cost', () => {
    const result = calculateWaterHeaterCost({
      heaterType: 'tank-gas',
      tankSize: '40-gallon',
      fuelConversion: 'electric-to-gas',
      ventingUpgrade: 'none',
      permitRequired: 'no',
      region: 'national',
    });
    // Fuel conv: $800–$1500, mid $1150
    expect(result.fuelConversionCost).toBe(1150);
    // TotalLow: 800 + 300 + 800 = $1900
    // TotalHigh: 1500 + 600 + 1500 = $3600
    expect(result.totalLow).toBe(1900);
    expect(result.totalHigh).toBe(3600);
  });

  // ─── Test 10: Standard vent upgrade ───
  it('adds standard vent upgrade cost', () => {
    const result = calculateWaterHeaterCost({
      heaterType: 'tank-gas',
      tankSize: '40-gallon',
      fuelConversion: 'none',
      ventingUpgrade: 'standard-vent',
      permitRequired: 'no',
      region: 'national',
    });
    // Venting: $200–$500, mid $350
    expect(result.ventingCost).toBe(350);
    // TotalLow: 800 + 300 + 0 + 200 = $1300
    // TotalHigh: 1500 + 600 + 0 + 500 = $2600
    expect(result.totalLow).toBe(1300);
    expect(result.totalHigh).toBe(2600);
  });

  // ─── Test 11: Power vent upgrade ───
  it('adds power vent upgrade cost', () => {
    const result = calculateWaterHeaterCost({
      heaterType: 'tank-gas',
      tankSize: '40-gallon',
      fuelConversion: 'none',
      ventingUpgrade: 'power-vent',
      permitRequired: 'no',
      region: 'national',
    });
    // Venting: $400–$800, mid $600
    expect(result.ventingCost).toBe(600);
    expect(result.totalLow).toBe(1500);
    expect(result.totalHigh).toBe(2900);
  });

  // ─── Test 12: Direct vent upgrade ───
  it('adds direct vent upgrade cost', () => {
    const result = calculateWaterHeaterCost({
      heaterType: 'tank-gas',
      tankSize: '40-gallon',
      fuelConversion: 'none',
      ventingUpgrade: 'direct-vent',
      permitRequired: 'no',
      region: 'national',
    });
    // Venting: $300–$600, mid $450
    expect(result.ventingCost).toBe(450);
    expect(result.totalLow).toBe(1400);
    expect(result.totalHigh).toBe(2700);
  });

  // ─── Test 13: Permit required ───
  it('adds permit cost when permit is required', () => {
    const noPermit = calculateWaterHeaterCost({
      heaterType: 'tank-gas',
      tankSize: '40-gallon',
      fuelConversion: 'none',
      ventingUpgrade: 'none',
      permitRequired: 'no',
      region: 'national',
    });
    const withPermit = calculateWaterHeaterCost({
      heaterType: 'tank-gas',
      tankSize: '40-gallon',
      fuelConversion: 'none',
      ventingUpgrade: 'none',
      permitRequired: 'yes',
      region: 'national',
    });
    // Permit: $100–$300, mid $200
    expect(withPermit.permitCost).toBe(200);
    expect((withPermit.totalLow as number)).toBe((noPermit.totalLow as number) + 100);
    expect((withPermit.totalHigh as number)).toBe((noPermit.totalHigh as number) + 300);
  });

  // ─── Test 14: Northeast region multiplier ───
  it('applies northeast regional labor multiplier (1.20x)', () => {
    const national = calculateWaterHeaterCost({
      heaterType: 'tank-gas',
      tankSize: '40-gallon',
      fuelConversion: 'none',
      ventingUpgrade: 'none',
      permitRequired: 'no',
      region: 'national',
    });
    const northeast = calculateWaterHeaterCost({
      heaterType: 'tank-gas',
      tankSize: '40-gallon',
      fuelConversion: 'none',
      ventingUpgrade: 'none',
      permitRequired: 'no',
      region: 'northeast',
    });
    // Labor increases by 20%, unit cost stays same
    expect((northeast.laborCost as number)).toBeGreaterThan((national.laborCost as number));
    expect(northeast.unitCost).toBe(national.unitCost);
    // National labor mid: 450, Northeast: 450 × 1.20 = 540
    expect((northeast.laborCost as number)).toBeCloseTo(540, 1);
  });

  // ─── Test 15: South region multiplier (cheapest labor) ───
  it('applies south regional labor multiplier (0.85x)', () => {
    const national = calculateWaterHeaterCost({
      heaterType: 'tank-gas',
      tankSize: '40-gallon',
      fuelConversion: 'none',
      ventingUpgrade: 'none',
      permitRequired: 'no',
      region: 'national',
    });
    const south = calculateWaterHeaterCost({
      heaterType: 'tank-gas',
      tankSize: '40-gallon',
      fuelConversion: 'none',
      ventingUpgrade: 'none',
      permitRequired: 'no',
      region: 'south',
    });
    expect((south.laborCost as number)).toBeLessThan((national.laborCost as number));
    expect((south.totalMid as number)).toBeLessThan((national.totalMid as number));
    // National labor mid: 450, South: 450 × 0.85 = 382.50
    expect((south.laborCost as number)).toBeCloseTo(382.5, 1);
  });

  // ─── Test 16: West Coast region multiplier (most expensive) ───
  it('applies west coast regional labor multiplier (1.25x)', () => {
    const result = calculateWaterHeaterCost({
      heaterType: 'tank-gas',
      tankSize: '40-gallon',
      fuelConversion: 'none',
      ventingUpgrade: 'none',
      permitRequired: 'no',
      region: 'west-coast',
    });
    // Labor low: 300 × 1.25 = 375, high: 600 × 1.25 = 750, mid: 562.5
    expect((result.laborCost as number)).toBeCloseTo(562.5, 1);
    // TotalLow: 800 + 375 = 1175
    expect(result.totalLow).toBe(1175);
    // TotalHigh: 1500 + 750 = 2250
    expect(result.totalHigh).toBe(2250);
  });

  // ─── Test 17: Midwest region multiplier ───
  it('applies midwest regional labor multiplier (0.90x)', () => {
    const result = calculateWaterHeaterCost({
      heaterType: 'tank-gas',
      tankSize: '40-gallon',
      fuelConversion: 'none',
      ventingUpgrade: 'none',
      permitRequired: 'no',
      region: 'midwest',
    });
    // Labor low: 300 × 0.90 = 270, high: 600 × 0.90 = 540, mid: 405
    expect((result.laborCost as number)).toBeCloseTo(405, 1);
  });

  // ─── Test 18: Mid-Atlantic region multiplier ───
  it('applies mid-atlantic regional labor multiplier (1.15x)', () => {
    const result = calculateWaterHeaterCost({
      heaterType: 'tank-gas',
      tankSize: '40-gallon',
      fuelConversion: 'none',
      ventingUpgrade: 'none',
      permitRequired: 'no',
      region: 'mid-atlantic',
    });
    // Labor low: 300 × 1.15 = 345, high: 600 × 1.15 = 690, mid: 517.5
    expect((result.laborCost as number)).toBeCloseTo(517.5, 1);
  });

  // ─── Test 19: Mountain-West region multiplier ───
  it('applies mountain-west regional labor multiplier (0.95x)', () => {
    const result = calculateWaterHeaterCost({
      heaterType: 'tank-gas',
      tankSize: '40-gallon',
      fuelConversion: 'none',
      ventingUpgrade: 'none',
      permitRequired: 'no',
      region: 'mountain-west',
    });
    // Labor low: 300 × 0.95 = 285, high: 600 × 0.95 = 570, mid: 427.5
    expect((result.laborCost as number)).toBeCloseTo(427.5, 1);
  });

  // ─── Test 20: All extras combined ───
  it('calculates total with all extras: conversion + venting + permit', () => {
    const result = calculateWaterHeaterCost({
      heaterType: 'tankless-gas',
      tankSize: 'tankless-high-flow',
      fuelConversion: 'electric-to-gas',
      ventingUpgrade: 'power-vent',
      permitRequired: 'yes',
      region: 'northeast',
    });
    // Unit: $1500+300=1800 low, $3000+500=3500 high
    // Labor: $600×1.20=720 low, $1200×1.20=1440 high
    // Fuel conv: $800–$1500
    // Venting: $400–$800
    // Permit: $100–$300
    // TotalLow: 1800 + 720 + 800 + 400 + 100 = $3820
    // TotalHigh: 3500 + 1440 + 1500 + 800 + 300 = $7540
    expect(result.totalLow).toBe(3820);
    expect(result.totalHigh).toBe(7540);
    expect(result.totalMid).toBe(5680);
  });

  // ─── Test 21: Output structure ───
  it('returns all expected output fields', () => {
    const result = calculateWaterHeaterCost({
      heaterType: 'tank-gas',
      tankSize: '40-gallon',
      fuelConversion: 'none',
      ventingUpgrade: 'none',
      permitRequired: 'no',
      region: 'national',
    });
    expect(result).toHaveProperty('unitCost');
    expect(result).toHaveProperty('laborCost');
    expect(result).toHaveProperty('fuelConversionCost');
    expect(result).toHaveProperty('ventingCost');
    expect(result).toHaveProperty('permitCost');
    expect(result).toHaveProperty('totalLow');
    expect(result).toHaveProperty('totalHigh');
    expect(result).toHaveProperty('totalMid');
    expect(result).toHaveProperty('annualOperatingCost');
    expect(result).toHaveProperty('heaterComparison');
    expect(result).toHaveProperty('paybackPeriod');
    expect(result).toHaveProperty('timeline');
  });

  // ─── Test 22: Heater comparison structure ───
  it('returns heater comparison with all 6 types', () => {
    const result = calculateWaterHeaterCost({
      heaterType: 'tank-gas',
      tankSize: '40-gallon',
      fuelConversion: 'none',
      ventingUpgrade: 'none',
      permitRequired: 'no',
      region: 'national',
    });
    const comparison = result.heaterComparison as Array<{ label: string; value: number }>;
    expect(comparison).toHaveLength(6);
    comparison.forEach(item => {
      expect(item.value).toBeGreaterThan(0);
      expect(item.label).toBeTruthy();
    });
    // Tank-electric should be cheapest, solar most expensive
    const tankElectric = comparison.find(c => c.label.includes('Tank Electric'));
    const solar = comparison.find(c => c.label.includes('Solar'));
    expect(tankElectric!.value).toBeLessThan(solar!.value);
  });

  // ─── Test 23: Payback period — tank-gas baseline ───
  it('returns baseline message for tank-gas payback', () => {
    const result = calculateWaterHeaterCost({
      heaterType: 'tank-gas',
      tankSize: '40-gallon',
      fuelConversion: 'none',
      ventingUpgrade: 'none',
      permitRequired: 'no',
      region: 'national',
    });
    expect(result.paybackPeriod).toContain('Baseline');
  });

  // ─── Test 24: Payback period — heat pump shows years ───
  it('calculates payback period for heat pump vs tank-gas', () => {
    const result = calculateWaterHeaterCost({
      heaterType: 'heat-pump',
      tankSize: '40-gallon',
      fuelConversion: 'none',
      ventingUpgrade: 'none',
      permitRequired: 'no',
      region: 'national',
    });
    // Heat pump saves $200/yr ($350 - $150), costs more upfront
    // Heat pump mid: (2000+4500)/2=3250, Tank-gas mid: 1600
    // Upfront diff: 3250 - 1600 = 1650
    // Payback: 1650 / 200 = 8.2 years
    expect(result.paybackPeriod).toContain('years');
    expect(result.paybackPeriod).toContain('$200/yr');
  });

  // ─── Test 25: Payback period — tank-electric (no payback) ───
  it('returns no-payback message for tank-electric', () => {
    const result = calculateWaterHeaterCost({
      heaterType: 'tank-electric',
      tankSize: '40-gallon',
      fuelConversion: 'none',
      ventingUpgrade: 'none',
      permitRequired: 'no',
      region: 'national',
    });
    // Tank-electric costs $500/yr vs tank-gas $350/yr — more expensive to operate
    expect(result.paybackPeriod).toContain('No payback');
  });

  // ─── Test 26: Timeline by heater type ───
  it('returns correct timeline for each heater type', () => {
    const tankGas = calculateWaterHeaterCost({ heaterType: 'tank-gas', tankSize: '40-gallon', fuelConversion: 'none', ventingUpgrade: 'none', permitRequired: 'no', region: 'national' });
    const solar = calculateWaterHeaterCost({ heaterType: 'solar', tankSize: '40-gallon', fuelConversion: 'none', ventingUpgrade: 'none', permitRequired: 'no', region: 'national' });
    expect(tankGas.timeline).toBe('2–4 hours');
    expect(solar.timeline).toBe('1–3 days');
  });

  // ─── Test 27: Default inputs produce valid output ───
  it('uses default inputs when values are missing', () => {
    const result = calculateWaterHeaterCost({});
    // Defaults to tank-gas, 40-gallon, no extras, national
    expect(result.totalLow).toBe(1100);
    expect(result.totalHigh).toBe(2100);
  });

  // ─── Test 28: Regional multiplier only affects labor ───
  it('regional multiplier changes labor but not unit cost', () => {
    const national = calculateWaterHeaterCost({
      heaterType: 'tankless-gas',
      tankSize: 'tankless-standard',
      fuelConversion: 'none',
      ventingUpgrade: 'none',
      permitRequired: 'no',
      region: 'national',
    });
    const northeast = calculateWaterHeaterCost({
      heaterType: 'tankless-gas',
      tankSize: 'tankless-standard',
      fuelConversion: 'none',
      ventingUpgrade: 'none',
      permitRequired: 'no',
      region: 'northeast',
    });
    expect(national.unitCost).toBe(northeast.unitCost);
    expect((northeast.laborCost as number)).toBeGreaterThan((national.laborCost as number));
  });

  // ─── Test 29: Annual operating cost by type ───
  it('returns correct annual operating costs for all types', () => {
    const types = ['tank-gas', 'tank-electric', 'tankless-gas', 'tankless-electric', 'heat-pump', 'solar'];
    const expected = [350, 500, 200, 350, 150, 50];
    types.forEach((type, i) => {
      const result = calculateWaterHeaterCost({
        heaterType: type,
        tankSize: '40-gallon',
        fuelConversion: 'none',
        ventingUpgrade: 'none',
        permitRequired: 'no',
        region: 'national',
      });
      expect(result.annualOperatingCost).toBe(expected[i]);
    });
  });

  // ─── Test 30: Solar is most expensive, tank-electric cheapest upfront ───
  it('solar is most expensive and tank-electric cheapest upfront', () => {
    const types = ['tank-gas', 'tank-electric', 'tankless-gas', 'tankless-electric', 'heat-pump', 'solar'];
    const mids = types.map(t => {
      const r = calculateWaterHeaterCost({
        heaterType: t,
        tankSize: '40-gallon',
        fuelConversion: 'none',
        ventingUpgrade: 'none',
        permitRequired: 'no',
        region: 'national',
      });
      return { type: t, mid: r.totalMid as number };
    });
    const tankElectric = mids.find(c => c.type === 'tank-electric')!;
    const solar = mids.find(c => c.type === 'solar')!;
    expect(tankElectric.mid).toBeLessThan(solar.mid);
  });
});
