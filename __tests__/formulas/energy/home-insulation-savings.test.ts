import { calculateHomeInsulationSavings } from '@/lib/formulas/energy/home-insulation-savings';

describe('calculateHomeInsulationSavings', () => {
  const defaults = { homeSize: 2000, currentR: 13, targetR: 49, climateZone: 'cold', fuelType: 'gas', energyPrice: 1.50, projectCost: 2500 };

  it('calculates positive annual savings when upgrading R-value', () => {
    const result = calculateHomeInsulationSavings(defaults);
    expect(Number(result.annualSavings)).toBeGreaterThan(0);
  });

  it('larger R-value gap means more savings', () => {
    const small = calculateHomeInsulationSavings({ ...defaults, currentR: 30, targetR: 49 });
    const large = calculateHomeInsulationSavings({ ...defaults, currentR: 10, targetR: 49 });
    expect(Number(large.annualSavings)).toBeGreaterThan(Number(small.annualSavings));
  });

  it('cold climate saves more than hot climate', () => {
    const cold = calculateHomeInsulationSavings(defaults);
    const hot = calculateHomeInsulationSavings({ ...defaults, climateZone: 'hot' });
    expect(Number(cold.annualSavings)).toBeGreaterThan(Number(hot.annualSavings));
  });

  it('larger home saves more than smaller home', () => {
    const small = calculateHomeInsulationSavings({ ...defaults, homeSize: 1000 });
    const large = calculateHomeInsulationSavings({ ...defaults, homeSize: 3000 });
    expect(Number(large.annualSavings)).toBeGreaterThan(Number(small.annualSavings));
  });

  it('no savings when current R equals target R', () => {
    const result = calculateHomeInsulationSavings({ ...defaults, currentR: 49, targetR: 49 });
    expect(result.annualSavings).toBe(0);
  });

  it('handles target R less than current R (clamps to 0 savings)', () => {
    const result = calculateHomeInsulationSavings({ ...defaults, currentR: 49, targetR: 19 });
    expect(result.annualSavings).toBe(0);
  });

  it('calculates payback period', () => {
    const result = calculateHomeInsulationSavings(defaults);
    expect(Number(result.paybackPeriod)).toBeGreaterThan(0);
    expect(Number(result.paybackPeriod)).toBeCloseTo(2500 / Number(result.annualSavings), 0);
  });

  it('20-year savings accounts for project cost', () => {
    const result = calculateHomeInsulationSavings(defaults);
    expect(Number(result.twentyYearSavings)).toBeCloseTo(Number(result.annualSavings) * 20 - 2500, 0);
  });

  it('heating savings is larger than cooling savings', () => {
    const result = calculateHomeInsulationSavings(defaults);
    expect(Number(result.heatingSavings)).toBeGreaterThan(Number(result.coolingSavings));
  });

  it('returns reduction percentage', () => {
    const result = calculateHomeInsulationSavings(defaults);
    // R-13 to R-49: reduction = 1 - (13/49) = 73.5%
    expect(Number(result.reductionPercent)).toBeCloseTo(73.5, 0);
  });

  it('handles missing inputs with defaults', () => {
    const result = calculateHomeInsulationSavings({});
    expect(typeof result.annualSavings).toBe('number');
    expect(Number(result.annualSavings)).toBeGreaterThan(0);
  });
});
