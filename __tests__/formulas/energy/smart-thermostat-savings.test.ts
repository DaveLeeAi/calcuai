import { calculateSmartThermostatSavings } from '@/lib/formulas/energy/smart-thermostat-savings';

describe('calculateSmartThermostatSavings', () => {
  const defaults = { monthlyBill: 150, climateZone: 'mixed', upgradeType: 'manual-to-smart', deviceCost: 250, utilityRebate: 0 };

  it('calculates base annual savings around 10% of HVAC bill', () => {
    const result = calculateSmartThermostatSavings(defaults);
    // 10% of $1800/yr = $180
    expect(Number(result.annualSavingsBase)).toBeCloseTo(180, 0);
  });

  it('low estimate is below base, high is above base', () => {
    const result = calculateSmartThermostatSavings(defaults);
    expect(Number(result.annualSavingsLow)).toBeLessThan(Number(result.annualSavingsBase));
    expect(Number(result.annualSavingsHigh)).toBeGreaterThan(Number(result.annualSavingsBase));
  });

  it('cold climate increases savings', () => {
    const cold = calculateSmartThermostatSavings({ ...defaults, climateZone: 'cold' });
    const mixed = calculateSmartThermostatSavings(defaults);
    expect(Number(cold.annualSavingsBase)).toBeGreaterThan(Number(mixed.annualSavingsBase));
  });

  it('programmable-to-smart has smaller savings than manual-to-smart', () => {
    const manual = calculateSmartThermostatSavings(defaults);
    const prog = calculateSmartThermostatSavings({ ...defaults, upgradeType: 'programmable-to-smart' });
    expect(Number(prog.annualSavingsBase)).toBeLessThan(Number(manual.annualSavingsBase));
  });

  it('calculates payback period correctly', () => {
    const result = calculateSmartThermostatSavings(defaults);
    const expected = 250 / Number(result.annualSavingsBase);
    expect(Number(result.paybackPeriod)).toBeCloseTo(expected, 0);
  });

  it('utility rebate reduces net cost and payback', () => {
    const noRebate = calculateSmartThermostatSavings(defaults);
    const withRebate = calculateSmartThermostatSavings({ ...defaults, utilityRebate: 100 });
    expect(Number(withRebate.netCost)).toBeLessThan(Number(noRebate.netCost));
    expect(Number(withRebate.paybackPeriod)).toBeLessThan(Number(noRebate.paybackPeriod));
  });

  it('10-year net savings = gross - net cost', () => {
    const result = calculateSmartThermostatSavings(defaults);
    expect(Number(result.tenYearNet)).toBeCloseTo(Number(result.tenYearGross) - Number(result.netCost), 0);
  });

  it('higher monthly bill means higher savings', () => {
    const low = calculateSmartThermostatSavings({ ...defaults, monthlyBill: 100 });
    const high = calculateSmartThermostatSavings({ ...defaults, monthlyBill: 300 });
    expect(Number(high.annualSavingsBase)).toBeGreaterThan(Number(low.annualSavingsBase));
  });

  it('handles zero monthly bill', () => {
    const result = calculateSmartThermostatSavings({ ...defaults, monthlyBill: 0 });
    expect(result.annualSavingsBase).toBe(0);
  });

  it('handles missing inputs with defaults', () => {
    const result = calculateSmartThermostatSavings({});
    expect(typeof result.annualSavingsBase).toBe('number');
    expect(Number(result.annualSavingsBase)).toBeGreaterThan(0);
  });

  it('returns savings percentage', () => {
    const result = calculateSmartThermostatSavings(defaults);
    expect(Number(result.savingsPercentBase)).toBeCloseTo(10, 0);
  });
});
