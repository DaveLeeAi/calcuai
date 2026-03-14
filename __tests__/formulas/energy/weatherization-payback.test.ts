import { calculateWeatherizationPayback } from '@/lib/formulas/energy/weatherization-payback';

describe('calculateWeatherizationPayback', () => {
  const defaults = { annualHeatingCoolingCost: 2000 };

  it('calculates positive annual savings with default items', () => {
    const result = calculateWeatherizationPayback(defaults);
    expect(Number(result.annualSavings)).toBeGreaterThan(100);
  });

  it('project cost is low (DIY weatherization)', () => {
    const result = calculateWeatherizationPayback(defaults);
    expect(Number(result.projectCostMid)).toBeLessThan(500);
  });

  it('payback period is under 2 years for basic items', () => {
    const result = calculateWeatherizationPayback(defaults);
    expect(Number(result.paybackYears)).toBeLessThan(2);
  });

  it('caps combined savings at 25%', () => {
    const allItems = 'caulking-windows,weatherstrip-doors,door-sweeps,outlet-gaskets,attic-hatch-seal,rim-joist-foam,pipe-insulation,window-film,fireplace-damper,recessed-light-covers';
    const result = calculateWeatherizationPayback({ ...defaults, items: allItems });
    expect(Number(result.effectiveSavingsPct)).toBeLessThanOrEqual(25);
  });

  it('more items = more savings (up to cap)', () => {
    const few = calculateWeatherizationPayback({ ...defaults, items: 'caulking-windows' });
    const many = calculateWeatherizationPayback({ ...defaults, items: 'caulking-windows,weatherstrip-doors,door-sweeps,attic-hatch-seal,rim-joist-foam' });
    expect(Number(many.annualSavings)).toBeGreaterThan(Number(few.annualSavings));
  });

  it('returns per-item breakdown', () => {
    const result = calculateWeatherizationPayback(defaults);
    const breakdown = result.breakdown as { label: string; annualSavings: number }[];
    expect(breakdown.length).toBeGreaterThan(0);
    expect(breakdown[0].label).toBeDefined();
    expect(breakdown[0].annualSavings).toBeGreaterThan(0);
  });

  it('5-year net savings is positive', () => {
    const result = calculateWeatherizationPayback(defaults);
    expect(Number(result.fiveYearNet)).toBeGreaterThan(0);
  });

  it('higher heating cost = higher savings', () => {
    const low = calculateWeatherizationPayback({ annualHeatingCoolingCost: 1000 });
    const high = calculateWeatherizationPayback({ annualHeatingCoolingCost: 4000 });
    expect(Number(high.annualSavings)).toBeGreaterThan(Number(low.annualSavings));
  });

  it('returns cost range (low and high)', () => {
    const result = calculateWeatherizationPayback(defaults);
    expect(Number(result.totalCostLow)).toBeLessThan(Number(result.totalCostHigh));
  });

  it('handles missing inputs with defaults', () => {
    const result = calculateWeatherizationPayback({});
    expect(typeof result.annualSavings).toBe('number');
    expect(Number(result.paybackYears)).toBeGreaterThan(0);
  });
});
