import { calculateEvVsGas } from '@/lib/formulas/energy/ev-vs-gas-cost';

describe('calculateEvVsGas', () => {
  const defaults = { annualMiles: 12000, evEfficiency: 3.5, electricityRate: 0.1724, gasPrice: 3.50, gasMpg: 27, evPrice: 35000, gasCarPrice: 30000, evMaintenance: 600, gasMaintenance: 1200 };

  it('calculates EV annual fuel cost correctly', () => {
    const result = calculateEvVsGas(defaults);
    const expected = (12000 / 3.5) * 0.1724;
    expect(result.evAnnualFuel).toBeCloseTo(expected, 0);
  });

  it('calculates gas annual fuel cost correctly', () => {
    const result = calculateEvVsGas(defaults);
    const expected = (12000 / 27) * 3.50;
    expect(result.gasAnnualFuel).toBeCloseTo(expected, 0);
  });

  it('calculates 5-year EV total correctly', () => {
    const result = calculateEvVsGas(defaults);
    const evFuel = (12000 / 3.5) * 0.1724;
    const expected = 35000 + (evFuel + 600) * 5;
    expect(result.fiveYrEvTotal).toBeCloseTo(expected, 0);
  });

  it('calculates 5-year gas total correctly', () => {
    const result = calculateEvVsGas(defaults);
    const gasFuel = (12000 / 27) * 3.50;
    const expected = 30000 + (gasFuel + 1200) * 5;
    expect(result.fiveYrGasTotal).toBeCloseTo(expected, 0);
  });

  it('calculates positive annual fuel savings for EV', () => {
    const result = calculateEvVsGas(defaults);
    expect(Number(result.annualFuelSavings)).toBeGreaterThan(0);
  });

  it('calculates breakeven years', () => {
    const result = calculateEvVsGas(defaults);
    expect(Number(result.breakevenYears)).toBeGreaterThan(0);
  });

  it('handles high gas price ($5/gal) — EV wins more', () => {
    const result = calculateEvVsGas({ ...defaults, gasPrice: 5.00 });
    expect(Number(result.annualFuelSavings)).toBeGreaterThan(Number(calculateEvVsGas(defaults).annualFuelSavings));
  });

  it('handles very efficient gas car (50 MPG) — smaller savings', () => {
    const result = calculateEvVsGas({ ...defaults, gasMpg: 50 });
    expect(Number(result.annualFuelSavings)).toBeLessThan(Number(calculateEvVsGas(defaults).annualFuelSavings));
  });

  it('returns cumulative cost chart data with 11 points (years 0-10)', () => {
    const result = calculateEvVsGas(defaults);
    expect(Array.isArray(result.cumulativeCost)).toBe(true);
    expect((result.cumulativeCost as unknown[]).length).toBe(11);
  });

  it('handles zero annual miles', () => {
    const result = calculateEvVsGas({ ...defaults, annualMiles: 0 });
    expect(result.evAnnualFuel).toBe(0);
    expect(result.gasAnnualFuel).toBe(0);
  });

  it('handles missing inputs with defaults', () => {
    const result = calculateEvVsGas({});
    expect(typeof result.fiveYrEvTotal).toBe('number');
    expect(typeof result.fiveYrGasTotal).toBe('number');
  });

  it('breakeven is 0 when EV is cheaper upfront and to operate', () => {
    const result = calculateEvVsGas({ ...defaults, evPrice: 25000, gasCarPrice: 30000 });
    expect(Number(result.breakevenYears)).toBe(0);
  });
});
