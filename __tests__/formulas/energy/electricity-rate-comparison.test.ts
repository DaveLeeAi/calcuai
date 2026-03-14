import { calculateElectricityRateComparison } from '@/lib/formulas/energy/electricity-rate-comparison';

describe('calculateElectricityRateComparison', () => {
  const defaults = { currentRate: 0.1724, monthlyUsage: 863, competitorRate: 0.14, fixedFee: 10, contractLength: 12 };

  it('calculates current annual cost correctly', () => {
    const result = calculateElectricityRateComparison(defaults);
    expect(Number(result.currentAnnualCost)).toBeCloseTo(0.1724 * 863 * 12, 0);
  });

  it('calculates competitor annual cost including fixed fee', () => {
    const result = calculateElectricityRateComparison(defaults);
    expect(Number(result.competitorAnnualCost)).toBeCloseTo((0.14 * 863 + 10) * 12, 0);
  });

  it('annual savings is positive when competitor is cheaper', () => {
    const result = calculateElectricityRateComparison(defaults);
    expect(Number(result.annualSavings)).toBeGreaterThan(0);
  });

  it('annual savings is negative when competitor is more expensive', () => {
    const result = calculateElectricityRateComparison({ ...defaults, competitorRate: 0.25, fixedFee: 20 });
    expect(Number(result.annualSavings)).toBeLessThan(0);
  });

  it('total contract savings scales with contract length', () => {
    const oneYear = calculateElectricityRateComparison(defaults);
    const twoYear = calculateElectricityRateComparison({ ...defaults, contractLength: 24 });
    expect(Number(twoYear.totalContractSavings)).toBeCloseTo(Number(oneYear.totalContractSavings) * 2, 0);
  });

  it('breakeven month is calculated when competitor has fixed fee', () => {
    const result = calculateElectricityRateComparison(defaults);
    expect(Number(result.breakevenMonth)).toBeGreaterThan(0);
  });

  it('breakeven is 0 when competitor has no fixed fee and is cheaper', () => {
    const result = calculateElectricityRateComparison({ ...defaults, fixedFee: 0 });
    expect(result.breakevenMonth).toBe(0);
  });

  it('handles equal rates (no savings)', () => {
    const result = calculateElectricityRateComparison({ ...defaults, competitorRate: 0.1724, fixedFee: 0 });
    expect(result.annualSavings).toBe(0);
  });

  it('handles zero usage', () => {
    const result = calculateElectricityRateComparison({ ...defaults, monthlyUsage: 0 });
    expect(result.currentAnnualCost).toBe(0);
  });

  it('handles missing inputs with defaults', () => {
    const result = calculateElectricityRateComparison({});
    expect(typeof result.currentAnnualCost).toBe('number');
    expect(typeof result.competitorAnnualCost).toBe('number');
  });

  it('monthly costs are consistent with annual', () => {
    const result = calculateElectricityRateComparison(defaults);
    expect(Number(result.currentAnnualCost)).toBeCloseTo(Number(result.currentMonthlyCost) * 12, 0);
  });
});
