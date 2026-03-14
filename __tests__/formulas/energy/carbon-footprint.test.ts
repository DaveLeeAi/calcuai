import { calculateCarbonFootprint } from '@/lib/formulas/energy/carbon-footprint';

describe('calculateCarbonFootprint', () => {
  const defaults = { monthlyElectricity: 863, electricitySource: 'grid', monthlyGas: 40, monthlyOil: 0 };

  it('calculates electricity CO2 at grid average', () => {
    const result = calculateCarbonFootprint(defaults);
    expect(Number(result.electricityCO2)).toBeCloseTo(863 * 1.03, 0);
  });

  it('partial solar reduces electricity CO2 by ~50%', () => {
    const grid = calculateCarbonFootprint(defaults);
    const partial = calculateCarbonFootprint({ ...defaults, electricitySource: 'partial-solar' });
    expect(Number(partial.electricityCO2)).toBeLessThan(Number(grid.electricityCO2) * 0.6);
  });

  it('full solar has near-zero electricity CO2', () => {
    const result = calculateCarbonFootprint({ ...defaults, electricitySource: 'full-solar' });
    expect(Number(result.electricityCO2)).toBeLessThan(50);
  });

  it('calculates gas CO2 at 11.7 lbs/therm', () => {
    const result = calculateCarbonFootprint(defaults);
    expect(Number(result.gasCO2)).toBeCloseTo(40 * 11.7, 0);
  });

  it('calculates oil CO2 at 22.4 lbs/gallon', () => {
    const result = calculateCarbonFootprint({ ...defaults, monthlyOil: 50 });
    expect(Number(result.oilCO2)).toBeCloseTo(50 * 22.4, 0);
  });

  it('total monthly CO2 = electricity + gas + oil', () => {
    const result = calculateCarbonFootprint({ ...defaults, monthlyOil: 10 });
    expect(Number(result.totalMonthlyCO2)).toBeCloseTo(
      Number(result.electricityCO2) + Number(result.gasCO2) + Number(result.oilCO2), 0
    );
  });

  it('calculates annual CO2 in tons correctly', () => {
    const result = calculateCarbonFootprint(defaults);
    expect(Number(result.annualCO2Tons)).toBeCloseTo((Number(result.totalMonthlyCO2) * 12) / 2000, 1);
  });

  it('calculates trees equivalent', () => {
    const result = calculateCarbonFootprint(defaults);
    expect(Number(result.treesEquivalent)).toBeGreaterThan(0);
  });

  it('returns pie chart data with 3 segments', () => {
    const result = calculateCarbonFootprint(defaults);
    expect(Array.isArray(result.pieData)).toBe(true);
    expect((result.pieData as unknown[]).length).toBe(3);
  });

  it('handles zero everything', () => {
    const result = calculateCarbonFootprint({ monthlyElectricity: 0, electricitySource: 'grid', monthlyGas: 0, monthlyOil: 0 });
    expect(result.totalMonthlyCO2).toBe(0);
    expect(result.annualCO2Tons).toBe(0);
  });

  it('handles missing inputs with defaults', () => {
    const result = calculateCarbonFootprint({});
    expect(typeof result.totalMonthlyCO2).toBe('number');
    expect(Number(result.annualCO2Tons)).toBeGreaterThan(0);
  });
});
