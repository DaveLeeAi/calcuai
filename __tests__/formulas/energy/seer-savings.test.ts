import { calculateSeerSavings } from '@/lib/formulas/energy/seer-savings';

describe('calculateSeerSavings', () => {
  const defaults = { currentSeer: 10, newSeer: 16, homeSize: 2000, usageProfile: 'moderate', electricityRate: 0.1724, systemCost: 8000, annualCoolingHours: 1200 };

  it('new system costs less annually than old system', () => {
    const result = calculateSeerSavings(defaults);
    expect(Number(result.newAnnualCost)).toBeLessThan(Number(result.currentAnnualCost));
  });

  it('calculates positive annual savings for SEER upgrade', () => {
    const result = calculateSeerSavings(defaults);
    expect(Number(result.annualSavings)).toBeGreaterThan(0);
  });

  it('savings increase with larger SEER gap', () => {
    const small = calculateSeerSavings({ ...defaults, newSeer: 12 });
    const large = calculateSeerSavings({ ...defaults, newSeer: 20 });
    expect(Number(large.annualSavings)).toBeGreaterThan(Number(small.annualSavings));
  });

  it('larger home means more savings', () => {
    const small = calculateSeerSavings({ ...defaults, homeSize: 1000 });
    const large = calculateSeerSavings({ ...defaults, homeSize: 3000 });
    expect(Number(large.annualSavings)).toBeGreaterThan(Number(small.annualSavings));
  });

  it('heavy usage profile costs more than light', () => {
    const light = calculateSeerSavings({ ...defaults, usageProfile: 'light' });
    const heavy = calculateSeerSavings({ ...defaults, usageProfile: 'heavy' });
    expect(Number(heavy.currentAnnualCost)).toBeGreaterThan(Number(light.currentAnnualCost));
  });

  it('calculates payback period', () => {
    const result = calculateSeerSavings(defaults);
    expect(Number(result.paybackPeriod)).toBeGreaterThan(0);
    expect(Number(result.paybackPeriod)).toBeCloseTo(8000 / Number(result.annualSavings), 0);
  });

  it('prevents new SEER below current (no negative savings)', () => {
    const result = calculateSeerSavings({ ...defaults, newSeer: 8 });
    expect(Number(result.annualSavings)).toBeGreaterThanOrEqual(0);
  });

  it('rejects unrealistic SEER values by clamping', () => {
    const result = calculateSeerSavings({ ...defaults, currentSeer: 50, newSeer: 60 });
    expect(typeof result.currentAnnualCost).toBe('number');
  });

  it('higher electricity rate means more savings', () => {
    const low = calculateSeerSavings({ ...defaults, electricityRate: 0.10 });
    const high = calculateSeerSavings({ ...defaults, electricityRate: 0.30 });
    expect(Number(high.annualSavings)).toBeGreaterThan(Number(low.annualSavings));
  });

  it('handles missing inputs with defaults', () => {
    const result = calculateSeerSavings({});
    expect(typeof result.currentAnnualCost).toBe('number');
    expect(typeof result.annualSavings).toBe('number');
  });

  it('returns efficiency gain percentage', () => {
    const result = calculateSeerSavings(defaults);
    expect(Number(result.efficiencyGainPercent)).toBeCloseTo(60, 0); // (16-10)/10 × 100
  });

  it('15-year savings accounts for system cost', () => {
    const result = calculateSeerSavings(defaults);
    expect(Number(result.fifteenYearSavings)).toBeCloseTo(Number(result.annualSavings) * 15 - 8000, 0);
  });
});
