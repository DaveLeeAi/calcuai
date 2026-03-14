import { calculatePropertyAppreciation } from '@/lib/formulas/real-estate/property-appreciation';

describe('calculatePropertyAppreciation', () => {
  it('calculates future value with 3% annual appreciation', () => {
    const result = calculatePropertyAppreciation({ currentValue: 300000, annualAppreciationRate: 3, years: 10, remainingMortgage: 0 });
    const expected = 300000 * Math.pow(1.03, 10);
    expect(Number(result.futureValue)).toBeCloseTo(expected, 0);
  });

  it('calculates total appreciation amount', () => {
    const result = calculatePropertyAppreciation({ currentValue: 200000, annualAppreciationRate: 5, years: 5, remainingMortgage: 0 });
    const fv = 200000 * Math.pow(1.05, 5);
    expect(Number(result.totalAppreciation)).toBeCloseTo(fv - 200000, 0);
  });

  it('calculates projected equity correctly', () => {
    const result = calculatePropertyAppreciation({ currentValue: 400000, annualAppreciationRate: 4, years: 10, remainingMortgage: 200000 });
    const fv = 400000 * Math.pow(1.04, 10);
    expect(Number(result.projectedEquity)).toBeCloseTo(fv - 200000, 0);
  });

  it('equity is zero when mortgage exceeds future value', () => {
    const result = calculatePropertyAppreciation({ currentValue: 100000, annualAppreciationRate: -5, years: 10, remainingMortgage: 200000 });
    expect(Number(result.projectedEquity)).toBe(0);
  });

  it('generates year-by-year table', () => {
    const result = calculatePropertyAppreciation({ currentValue: 300000, annualAppreciationRate: 3, years: 10, remainingMortgage: 0 });
    const table = result.yearByYearTable as unknown[];
    expect(Array.isArray(table)).toBe(true);
    expect(table.length).toBe(10);
  });

  it('limits year-by-year table to 30 rows even for 50-year projection', () => {
    const result = calculatePropertyAppreciation({ currentValue: 300000, annualAppreciationRate: 3, years: 50, remainingMortgage: 0 });
    const table = result.yearByYearTable as unknown[];
    expect(table.length).toBe(30);
  });

  it('handles zero appreciation rate (no change)', () => {
    const result = calculatePropertyAppreciation({ currentValue: 250000, annualAppreciationRate: 0, years: 10, remainingMortgage: 0 });
    expect(Number(result.futureValue)).toBeCloseTo(250000, 0);
    expect(Number(result.totalAppreciation)).toBeCloseTo(0, 0);
  });

  it('handles negative appreciation (declining market)', () => {
    const result = calculatePropertyAppreciation({ currentValue: 300000, annualAppreciationRate: -3, years: 5, remainingMortgage: 0 });
    expect(Number(result.futureValue)).toBeLessThan(300000);
    expect(Number(result.totalAppreciation)).toBeLessThan(0);
  });

  it('calculates totalAppreciationPercent correctly', () => {
    const result = calculatePropertyAppreciation({ currentValue: 200000, annualAppreciationRate: 5, years: 10, remainingMortgage: 0 });
    const fv = 200000 * Math.pow(1.05, 10);
    const expectedPct = ((fv - 200000) / 200000) * 100;
    expect(Number(result.totalAppreciationPercent)).toBeCloseTo(expectedPct, 1);
  });

  it('returns summary array', () => {
    const result = calculatePropertyAppreciation({ currentValue: 300000, annualAppreciationRate: 3, years: 10, remainingMortgage: 0 });
    expect(Array.isArray(result.summary)).toBe(true);
    expect((result.summary as unknown[]).length).toBeGreaterThan(0);
  });

  it('handles missing inputs gracefully', () => {
    const result = calculatePropertyAppreciation({});
    expect(typeof result.futureValue).toBe('number');
    expect(typeof result.totalROI === 'undefined' || typeof result.totalAppreciation === 'number').toBe(true);
  });
});
