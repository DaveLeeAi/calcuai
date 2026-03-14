import { calculateWaterHeaterCost } from '@/lib/formulas/energy/water-heater-energy-cost';

describe('calculateWaterHeaterCost', () => {
  const defaults = { heaterType: 'electric-resistance', hotWaterUsage: 64, electricityRate: 0.1724, gasRate: 1.50, unitCost: 1200, installationCost: 800, lifespan: 12 };

  it('calculates annual energy cost for electric resistance', () => {
    const result = calculateWaterHeaterCost(defaults);
    expect(Number(result.annualEnergyCost)).toBeGreaterThan(300);
    expect(Number(result.annualEnergyCost)).toBeLessThan(800);
  });

  it('heat pump costs less than electric resistance annually', () => {
    const resistance = calculateWaterHeaterCost(defaults);
    const heatPump = calculateWaterHeaterCost({ ...defaults, heaterType: 'heat-pump' });
    expect(Number(heatPump.annualEnergyCost)).toBeLessThan(Number(resistance.annualEnergyCost));
  });

  it('gas water heater uses gas rate', () => {
    const result = calculateWaterHeaterCost({ ...defaults, heaterType: 'gas' });
    expect(Number(result.annualEnergyCost)).toBeGreaterThan(0);
  });

  it('10-year total includes unit + install + 10 years of energy', () => {
    const result = calculateWaterHeaterCost(defaults);
    const expected = Number(result.annualEnergyCost) * 10 + 1200 + 800;
    expect(Number(result.tenYearTotal)).toBeCloseTo(expected, 0);
  });

  it('higher usage means higher cost', () => {
    const low = calculateWaterHeaterCost({ ...defaults, hotWaterUsage: 30 });
    const high = calculateWaterHeaterCost({ ...defaults, hotWaterUsage: 100 });
    expect(Number(high.annualEnergyCost)).toBeGreaterThan(Number(low.annualEnergyCost));
  });

  it('savings vs resistance is zero for resistance type', () => {
    const result = calculateWaterHeaterCost(defaults);
    expect(result.annualSavingsVsResistance).toBe(0);
  });

  it('heat pump shows positive savings vs resistance', () => {
    const result = calculateWaterHeaterCost({ ...defaults, heaterType: 'heat-pump' });
    expect(Number(result.annualSavingsVsResistance)).toBeGreaterThan(0);
  });

  it('returns breakdown array with 5 items', () => {
    const result = calculateWaterHeaterCost(defaults);
    expect(Array.isArray(result.breakdown)).toBe(true);
    expect((result.breakdown as unknown[]).length).toBe(5);
  });

  it('handles missing inputs with defaults', () => {
    const result = calculateWaterHeaterCost({});
    expect(typeof result.annualEnergyCost).toBe('number');
    expect(typeof result.tenYearTotal).toBe('number');
  });

  it('lifetime total uses lifespan parameter', () => {
    const result = calculateWaterHeaterCost({ ...defaults, lifespan: 15 });
    const expected = Number(result.annualEnergyCost) * 15 + 1200 + 800;
    expect(Number(result.lifetimeTotal)).toBeCloseTo(expected, 0);
  });

  it('solar heater costs less than resistance annually', () => {
    const resistance = calculateWaterHeaterCost(defaults);
    const solar = calculateWaterHeaterCost({ ...defaults, heaterType: 'solar' });
    expect(Number(solar.annualEnergyCost)).toBeLessThan(Number(resistance.annualEnergyCost));
  });
});
