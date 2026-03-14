import { calculateHeatingFuelComparison } from '@/lib/formulas/energy/heating-fuel-comparison';

describe('calculateHeatingFuelComparison', () => {
  const defaults = { homeSize: 2000, heatingDegreeDays: 5000, gasPrice: 1.50, propanePrice: 2.80, oilPrice: 3.40, electricRate: 0.1724 };

  it('returns comparison array with 5 fuel types', () => {
    const result = calculateHeatingFuelComparison(defaults);
    expect((result.comparison as unknown[]).length).toBe(5);
  });

  it('natural gas or heat pump is cheapest at default rates', () => {
    const result = calculateHeatingFuelComparison(defaults);
    expect(['natural-gas', 'heat-pump']).toContain(result.cheapestFuel);
  });

  it('electric resistance is typically most expensive', () => {
    const result = calculateHeatingFuelComparison(defaults);
    expect(result.mostExpensiveFuel).toBe('electric-resistance');
  });

  it('comparison is sorted cheapest first', () => {
    const result = calculateHeatingFuelComparison(defaults);
    const comp = result.comparison as { annualCost: number }[];
    expect(comp[0].annualCost).toBeLessThanOrEqual(comp[1].annualCost);
  });

  it('larger home costs more', () => {
    const small = calculateHeatingFuelComparison({ ...defaults, homeSize: 1000 });
    const large = calculateHeatingFuelComparison({ ...defaults, homeSize: 3000 });
    expect(Number(large.cheapestAnnualCost)).toBeGreaterThan(Number(small.cheapestAnnualCost));
  });

  it('more HDD costs more', () => {
    const mild = calculateHeatingFuelComparison({ ...defaults, heatingDegreeDays: 2000 });
    const cold = calculateHeatingFuelComparison({ ...defaults, heatingDegreeDays: 8000 });
    expect(Number(cold.cheapestAnnualCost)).toBeGreaterThan(Number(mild.cheapestAnnualCost));
  });

  it('savings vs most expensive is positive', () => {
    const result = calculateHeatingFuelComparison(defaults);
    expect(Number(result.savingsVsMostExpensive)).toBeGreaterThan(0);
  });

  it('very cheap gas makes gas the winner over heat pump', () => {
    const result = calculateHeatingFuelComparison({ ...defaults, gasPrice: 0.50, electricRate: 0.30 });
    expect(result.cheapestFuel).toBe('natural-gas');
  });

  it('each fuel has cost per MMBTU', () => {
    const result = calculateHeatingFuelComparison(defaults);
    const comp = result.comparison as { costPerMmbtu: number }[];
    comp.forEach(f => expect(f.costPerMmbtu).toBeGreaterThan(0));
  });

  it('handles missing inputs with defaults', () => {
    const result = calculateHeatingFuelComparison({});
    expect(typeof result.cheapestFuel).toBe('string');
    expect(typeof result.cheapestAnnualCost).toBe('number');
  });
});
