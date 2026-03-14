import { calculateSolarPayback } from '@/lib/formulas/energy/solar-panel-payback';

describe('calculateSolarPayback', () => {
  it('calculates 30% federal tax credit', () => {
    const result = calculateSolarPayback({ systemCostDollars: 20000, annualKwhProduction: 8000, electricityRatePerKwh: 0.16, annualRateIncrease: 3, stateIncentives: 0, systemLifetimeYears: 25, applyFederalCredit: true });
    expect(result.federalTaxCredit).toBe(6000);
    expect(result.netSystemCost).toBe(14000);
  });

  it('skips federal credit when disabled', () => {
    const result = calculateSolarPayback({ systemCostDollars: 20000, annualKwhProduction: 8000, electricityRatePerKwh: 0.16, annualRateIncrease: 3, stateIncentives: 0, systemLifetimeYears: 25, applyFederalCredit: false });
    expect(result.federalTaxCredit).toBe(0);
    expect(result.netSystemCost).toBe(20000);
  });

  it('subtracts state incentives from net cost', () => {
    const result = calculateSolarPayback({ systemCostDollars: 20000, annualKwhProduction: 8000, electricityRatePerKwh: 0.16, annualRateIncrease: 3, stateIncentives: 2000, systemLifetimeYears: 25, applyFederalCredit: true });
    expect(Number(result.netSystemCost)).toBe(12000);
  });

  it('calculates year 1 annual savings', () => {
    const result = calculateSolarPayback({ systemCostDollars: 20000, annualKwhProduction: 8000, electricityRatePerKwh: 0.16, annualRateIncrease: 0, stateIncentives: 0, systemLifetimeYears: 25, applyFederalCredit: true });
    expect(Number(result.annualSavingsYear1)).toBeCloseTo(8000 * 0.16, 2);
  });

  it('calculates simple payback period', () => {
    const result = calculateSolarPayback({ systemCostDollars: 14000, annualKwhProduction: 8000, electricityRatePerKwh: 0.16, annualRateIncrease: 0, stateIncentives: 0, systemLifetimeYears: 25, applyFederalCredit: false });
    const annualSavings = 8000 * 0.16;
    expect(Number(result.simplePaybackYears)).toBeCloseTo(14000 / annualSavings, 1);
  });

  it('generates payback table for system lifetime years', () => {
    const result = calculateSolarPayback({ systemCostDollars: 20000, annualKwhProduction: 8000, electricityRatePerKwh: 0.16, annualRateIncrease: 3, stateIncentives: 0, systemLifetimeYears: 25, applyFederalCredit: true });
    const table = result.paybackTable as unknown[];
    expect(Array.isArray(table)).toBe(true);
    expect(table.length).toBe(25);
  });

  it('lifetime savings is positive for typical residential system', () => {
    const result = calculateSolarPayback({ systemCostDollars: 25000, annualKwhProduction: 9000, electricityRatePerKwh: 0.18, annualRateIncrease: 3, stateIncentives: 0, systemLifetimeYears: 25, applyFederalCredit: true });
    expect(Number(result.lifetimeSavings)).toBeGreaterThan(0);
  });

  it('calculates ROI as positive for typical scenario', () => {
    const result = calculateSolarPayback({ systemCostDollars: 25000, annualKwhProduction: 9000, electricityRatePerKwh: 0.18, annualRateIncrease: 3, stateIncentives: 0, systemLifetimeYears: 25, applyFederalCredit: true });
    expect(Number(result.roi)).toBeGreaterThan(0);
  });

  it('handles zero production (no output)', () => {
    const result = calculateSolarPayback({ systemCostDollars: 20000, annualKwhProduction: 0, electricityRatePerKwh: 0.16, annualRateIncrease: 3, stateIncentives: 0, systemLifetimeYears: 25, applyFederalCredit: true });
    expect(Number(result.annualSavingsYear1)).toBe(0);
    expect(Number(result.simplePaybackYears)).toBe(0);
  });

  it('returns summary array with 7 items', () => {
    const result = calculateSolarPayback({ systemCostDollars: 20000, annualKwhProduction: 8000, electricityRatePerKwh: 0.16, annualRateIncrease: 3, stateIncentives: 0, systemLifetimeYears: 25, applyFederalCredit: true });
    expect(Array.isArray(result.summary)).toBe(true);
    expect((result.summary as unknown[]).length).toBe(7);
  });

  it('handles missing inputs gracefully', () => {
    const result = calculateSolarPayback({});
    expect(typeof result.netSystemCost).toBe('number');
  });
});
