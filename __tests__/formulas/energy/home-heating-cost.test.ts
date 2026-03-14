import { calculateHomeHeatingCost } from '@/lib/formulas/energy/home-heating-cost';

describe('calculateHomeHeatingCost', () => {
  it('calculates annual heating cost for natural gas', () => {
    const result = calculateHomeHeatingCost({ homeAreaSqFt: 1500, insultationLevel: 'average', heatingDegreeDays: 4500, fuelType: 'natural-gas', fuelRate: 1.50, systemEfficiencyPercent: 80 });
    expect(Number(result.annualHeatingCost)).toBeGreaterThan(0);
    expect(typeof result.annualHeatingCost).toBe('number');
  });

  it('uses higher BTU factor for poor insulation', () => {
    const good = calculateHomeHeatingCost({ homeAreaSqFt: 1500, insultationLevel: 'excellent', heatingDegreeDays: 4500, fuelType: 'natural-gas', fuelRate: 1.50, systemEfficiencyPercent: 80 });
    const poor = calculateHomeHeatingCost({ homeAreaSqFt: 1500, insultationLevel: 'poor', heatingDegreeDays: 4500, fuelType: 'natural-gas', fuelRate: 1.50, systemEfficiencyPercent: 80 });
    expect(Number(poor.annualHeatingCost)).toBeGreaterThan(Number(good.annualHeatingCost));
  });

  it('larger home costs more to heat than smaller home', () => {
    const small = calculateHomeHeatingCost({ homeAreaSqFt: 800, insultationLevel: 'average', heatingDegreeDays: 4500, fuelType: 'natural-gas', fuelRate: 1.50, systemEfficiencyPercent: 80 });
    const large = calculateHomeHeatingCost({ homeAreaSqFt: 3000, insultationLevel: 'average', heatingDegreeDays: 4500, fuelType: 'natural-gas', fuelRate: 1.50, systemEfficiencyPercent: 80 });
    expect(Number(large.annualHeatingCost)).toBeGreaterThan(Number(small.annualHeatingCost));
  });

  it('higher HDD means higher annual cost', () => {
    const mild = calculateHomeHeatingCost({ homeAreaSqFt: 1500, insultationLevel: 'average', heatingDegreeDays: 2000, fuelType: 'natural-gas', fuelRate: 1.50, systemEfficiencyPercent: 80 });
    const cold = calculateHomeHeatingCost({ homeAreaSqFt: 1500, insultationLevel: 'average', heatingDegreeDays: 7000, fuelType: 'natural-gas', fuelRate: 1.50, systemEfficiencyPercent: 80 });
    expect(Number(cold.annualHeatingCost)).toBeGreaterThan(Number(mild.annualHeatingCost));
  });

  it('higher system efficiency reduces cost', () => {
    const low = calculateHomeHeatingCost({ homeAreaSqFt: 1500, insultationLevel: 'average', heatingDegreeDays: 4500, fuelType: 'natural-gas', fuelRate: 1.50, systemEfficiencyPercent: 60 });
    const high = calculateHomeHeatingCost({ homeAreaSqFt: 1500, insultationLevel: 'average', heatingDegreeDays: 4500, fuelType: 'natural-gas', fuelRate: 1.50, systemEfficiencyPercent: 97 });
    expect(Number(high.annualHeatingCost)).toBeLessThan(Number(low.annualHeatingCost));
  });

  it('returns correct fuelUnit for each fuel type', () => {
    const gas = calculateHomeHeatingCost({ homeAreaSqFt: 1500, insultationLevel: 'average', heatingDegreeDays: 4500, fuelType: 'natural-gas', fuelRate: 1.50, systemEfficiencyPercent: 80 });
    expect(gas.fuelUnit).toBe('Therms');

    const electric = calculateHomeHeatingCost({ homeAreaSqFt: 1500, insultationLevel: 'average', heatingDegreeDays: 4500, fuelType: 'electricity', fuelRate: 0.16, systemEfficiencyPercent: 100 });
    expect(electric.fuelUnit).toBe('kWh');
  });

  it('returns monthly estimates array with 12 items', () => {
    const result = calculateHomeHeatingCost({ homeAreaSqFt: 1500, insultationLevel: 'average', heatingDegreeDays: 4500, fuelType: 'natural-gas', fuelRate: 1.50, systemEfficiencyPercent: 80 });
    const monthly = result.monthlyEstimates as unknown[];
    expect(Array.isArray(monthly)).toBe(true);
    expect(monthly.length).toBe(12);
  });

  it('monthlyAverage = annualCost / 12', () => {
    const result = calculateHomeHeatingCost({ homeAreaSqFt: 1500, insultationLevel: 'average', heatingDegreeDays: 4500, fuelType: 'natural-gas', fuelRate: 1.50, systemEfficiencyPercent: 80 });
    expect(Number(result.monthlyAverage)).toBeCloseTo(Number(result.annualHeatingCost) / 12, 1);
  });

  it('returns summary array with 6 items', () => {
    const result = calculateHomeHeatingCost({ homeAreaSqFt: 1500, insultationLevel: 'average', heatingDegreeDays: 4500, fuelType: 'natural-gas', fuelRate: 1.50, systemEfficiencyPercent: 80 });
    expect(Array.isArray(result.summary)).toBe(true);
    expect((result.summary as unknown[]).length).toBe(6);
  });

  it('handles missing inputs gracefully with defaults', () => {
    const result = calculateHomeHeatingCost({});
    expect(typeof result.annualHeatingCost).toBe('number');
  });

  it('returns zero BTU for zero HDD location', () => {
    const result = calculateHomeHeatingCost({ homeAreaSqFt: 1500, insultationLevel: 'average', heatingDegreeDays: 0, fuelType: 'natural-gas', fuelRate: 1.50, systemEfficiencyPercent: 80 });
    expect(result.annualBtuNeeded).toBe(0);
    expect(result.annualHeatingCost).toBe(0);
  });
});
