import { calculateHeatPumpWaterHeaterPayback } from '@/lib/formulas/energy/heat-pump-water-heater-payback';

describe('calculateHeatPumpWaterHeaterPayback', () => {
  const defaults = { currentType: 'electric-tank', householdSize: 3, electricityRate: 0.1724, gasRate: 1.50, hpwhCost: 3500, currentWhCost: 1200, federalCredit: 2000, stateRebate: 0 };

  it('HPWH annual cost is lower than electric tank', () => {
    const result = calculateHeatPumpWaterHeaterPayback(defaults);
    expect(Number(result.hpwhAnnualCost)).toBeLessThan(Number(result.currentAnnualCost));
  });

  it('annual savings is positive switching from electric tank', () => {
    const result = calculateHeatPumpWaterHeaterPayback(defaults);
    expect(Number(result.annualSavings)).toBeGreaterThan(200);
  });

  it('federal credit reduces incremental cost', () => {
    const noCredit = calculateHeatPumpWaterHeaterPayback({ ...defaults, federalCredit: 0 });
    const withCredit = calculateHeatPumpWaterHeaterPayback(defaults);
    expect(Number(withCredit.incrementalCost)).toBeLessThan(Number(noCredit.incrementalCost));
  });

  it('calculates payback period', () => {
    const result = calculateHeatPumpWaterHeaterPayback(defaults);
    expect(Number(result.paybackYears)).toBeGreaterThan(0);
    expect(Number(result.paybackYears)).toBeLessThan(10);
  });

  it('larger household uses more hot water', () => {
    const small = calculateHeatPumpWaterHeaterPayback({ ...defaults, householdSize: 1 });
    const large = calculateHeatPumpWaterHeaterPayback({ ...defaults, householdSize: 5 });
    expect(Number(large.annualSavings)).toBeGreaterThan(Number(small.annualSavings));
  });

  it('switching from gas tank still saves money', () => {
    const result = calculateHeatPumpWaterHeaterPayback({ ...defaults, currentType: 'gas-tank' });
    expect(Number(result.annualSavings)).toBeGreaterThan(0);
  });

  it('federal credit capped at 30% of HPWH cost', () => {
    const result = calculateHeatPumpWaterHeaterPayback({ ...defaults, hpwhCost: 3000, federalCredit: 2000 });
    // 30% of $3000 = $900, which is less than $2000 cap
    expect(Number(result.effectiveFederalCredit)).toBeCloseTo(900, 0);
  });

  it('state rebate further reduces cost', () => {
    const noRebate = calculateHeatPumpWaterHeaterPayback(defaults);
    const withRebate = calculateHeatPumpWaterHeaterPayback({ ...defaults, stateRebate: 500 });
    expect(Number(withRebate.incrementalCost)).toBeLessThan(Number(noRebate.incrementalCost));
  });

  it('15-year savings is positive', () => {
    const result = calculateHeatPumpWaterHeaterPayback(defaults);
    expect(Number(result.fifteenYearSavings)).toBeGreaterThan(0);
  });

  it('handles missing inputs with defaults', () => {
    const result = calculateHeatPumpWaterHeaterPayback({});
    expect(typeof result.annualSavings).toBe('number');
    expect(typeof result.paybackYears).toBe('number');
  });

  it('returns gallons per day based on household size', () => {
    const result = calculateHeatPumpWaterHeaterPayback({ ...defaults, householdSize: 4 });
    expect(result.gallonsPerDay).toBe(80); // 4 × 20
  });
});
