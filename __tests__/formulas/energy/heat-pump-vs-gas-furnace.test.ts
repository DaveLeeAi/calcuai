import { calculateHeatPumpVsGas } from '@/lib/formulas/energy/heat-pump-vs-gas-furnace';

describe('calculateHeatPumpVsGas', () => {
  const defaults = { homeSize: 2000, climateZone: 'mixed', electricityRate: 0.1724, gasPrice: 1.50, heatPumpCost: 12000, gasFurnaceCost: 5000, systemLifespan: 20 };

  it('calculates annual heat pump cost for mixed climate', () => {
    const result = calculateHeatPumpVsGas(defaults);
    expect(Number(result.annualHeatPumpCost)).toBeGreaterThan(0);
  });

  it('calculates annual gas cost for mixed climate', () => {
    const result = calculateHeatPumpVsGas(defaults);
    expect(Number(result.annualGasCost)).toBeGreaterThan(0);
  });

  it('heat pump is cheaper annually than gas in mixed climate at default rates', () => {
    const result = calculateHeatPumpVsGas(defaults);
    expect(Number(result.annualHeatPumpCost)).toBeLessThan(Number(result.annualGasCost));
  });

  it('cold climate costs more than mixed climate', () => {
    const cold = calculateHeatPumpVsGas({ ...defaults, climateZone: 'cold' });
    const mixed = calculateHeatPumpVsGas(defaults);
    expect(Number(cold.annualHeatPumpCost)).toBeGreaterThan(Number(mixed.annualHeatPumpCost));
  });

  it('hot climate costs less than mixed climate', () => {
    const hot = calculateHeatPumpVsGas({ ...defaults, climateZone: 'hot' });
    const mixed = calculateHeatPumpVsGas(defaults);
    expect(Number(hot.annualHeatPumpCost)).toBeLessThan(Number(mixed.annualHeatPumpCost));
  });

  it('calculates positive breakeven years when heat pump costs more upfront', () => {
    const result = calculateHeatPumpVsGas(defaults);
    expect(Number(result.breakevenYears)).toBeGreaterThan(0);
  });

  it('calculates 20-year comparison chart data with 21 points', () => {
    const result = calculateHeatPumpVsGas(defaults);
    expect(Array.isArray(result.yearlyComparison)).toBe(true);
    expect((result.yearlyComparison as unknown[]).length).toBe(21);
  });

  it('larger home costs more', () => {
    const large = calculateHeatPumpVsGas({ ...defaults, homeSize: 4000 });
    const small = calculateHeatPumpVsGas({ ...defaults, homeSize: 1000 });
    expect(Number(large.annualHeatPumpCost)).toBeGreaterThan(Number(small.annualHeatPumpCost));
  });

  it('handles missing inputs with defaults', () => {
    const result = calculateHeatPumpVsGas({});
    expect(typeof result.annualHeatPumpCost).toBe('number');
    expect(typeof result.annualGasCost).toBe('number');
  });

  it('higher electricity rate reduces heat pump advantage', () => {
    const expensive = calculateHeatPumpVsGas({ ...defaults, electricityRate: 0.35 });
    expect(Number(expensive.annualSavings)).toBeLessThan(Number(calculateHeatPumpVsGas(defaults).annualSavings));
  });

  it('higher gas price increases heat pump advantage', () => {
    const expensiveGas = calculateHeatPumpVsGas({ ...defaults, gasPrice: 3.00 });
    expect(Number(expensiveGas.annualSavings)).toBeGreaterThan(Number(calculateHeatPumpVsGas(defaults).annualSavings));
  });
});
