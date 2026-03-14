import { calculatePoolHeatingCost } from '@/lib/formulas/energy/pool-heating-cost';

describe('calculatePoolHeatingCost', () => {
  const defaults = { poolVolume: 15000, currentTemp: 65, targetTemp: 82, heaterType: 'gas', gasPrice: 1.50, electricityRate: 0.1724, seasonMonths: 6, coverUsed: false };

  it('calculates positive seasonal cost for gas heater', () => {
    const result = calculatePoolHeatingCost(defaults);
    expect(Number(result.seasonalCost)).toBeGreaterThan(500);
  });

  it('heat pump is cheaper than gas seasonally', () => {
    const result = calculatePoolHeatingCost(defaults);
    expect(Number(result.heatPumpSeasonalCost)).toBeLessThan(Number(result.gasSeasonalCost));
  });

  it('pool cover reduces costs (80% heat loss reduction)', () => {
    const noCover = calculatePoolHeatingCost(defaults);
    const withCover = calculatePoolHeatingCost({ ...defaults, coverUsed: true });
    expect(Number(withCover.seasonalCost)).toBeLessThan(Number(noCover.seasonalCost));
  });

  it('larger pool costs more', () => {
    const small = calculatePoolHeatingCost({ ...defaults, poolVolume: 10000 });
    const large = calculatePoolHeatingCost({ ...defaults, poolVolume: 25000 });
    expect(Number(large.seasonalCost)).toBeGreaterThan(Number(small.seasonalCost));
  });

  it('higher temp rise costs more', () => {
    const low = calculatePoolHeatingCost({ ...defaults, targetTemp: 75 });
    const high = calculatePoolHeatingCost({ ...defaults, targetTemp: 90 });
    expect(Number(high.initialCost)).toBeGreaterThan(Number(low.initialCost));
  });

  it('solar heater has zero fuel cost', () => {
    const result = calculatePoolHeatingCost({ ...defaults, heaterType: 'solar' });
    expect(result.seasonalCost).toBe(0);
  });

  it('returns initial BTU needed', () => {
    const result = calculatePoolHeatingCost(defaults);
    // 15000 × 8.34 × 17 = ~2,126,700 BTU
    expect(Number(result.initialBtu)).toBeGreaterThan(2000000);
  });

  it('returns annual heat pump savings vs gas', () => {
    const result = calculatePoolHeatingCost(defaults);
    expect(Number(result.annualSavingsHeatPump)).toBeGreaterThan(0);
  });

  it('longer season costs more', () => {
    const short = calculatePoolHeatingCost({ ...defaults, seasonMonths: 3 });
    const long = calculatePoolHeatingCost({ ...defaults, seasonMonths: 9 });
    expect(Number(long.seasonalCost)).toBeGreaterThan(Number(short.seasonalCost));
  });

  it('handles missing inputs with defaults', () => {
    const result = calculatePoolHeatingCost({});
    expect(typeof result.seasonalCost).toBe('number');
  });
});
