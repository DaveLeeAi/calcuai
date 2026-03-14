import { calculateGasVsElectricCost } from '@/lib/formulas/energy/gas-vs-electric-cost';

describe('calculateGasVsElectricCost', () => {
  it('calculates annual gas cost with 80% efficiency', () => {
    const result = calculateGasVsElectricCost({ annualThermsGas: 700, gasCostPerTherm: 1.50, furnaceEfficiencyPercent: 80, annualKwhElectric: 0, electricCostPerKwh: 0.16, heatPumpHspf: 0 });
    const expected = 700 * 1.50 * (100 / 80);
    expect(Number(result.annualGasCost)).toBeCloseTo(expected, 1);
  });

  it('calculates annual electric cost without heat pump', () => {
    const result = calculateGasVsElectricCost({ annualThermsGas: 0, gasCostPerTherm: 1.50, furnaceEfficiencyPercent: 80, annualKwhElectric: 10000, electricCostPerKwh: 0.16, heatPumpHspf: 0 });
    expect(Number(result.annualElectricCost)).toBeCloseTo(10000 * 0.16, 1);
  });

  it('reduces effective kWh with heat pump HSPF', () => {
    const result = calculateGasVsElectricCost({ annualThermsGas: 0, gasCostPerTherm: 1.50, furnaceEfficiencyPercent: 80, annualKwhElectric: 10000, electricCostPerKwh: 0.16, heatPumpHspf: 9 });
    const effectiveKwh = 10000 / 9;
    expect(Number(result.annualElectricCost)).toBeCloseTo(effectiveKwh * 0.16, 1);
  });

  it('identifies cheaper fuel correctly (gas cheaper)', () => {
    const result = calculateGasVsElectricCost({ annualThermsGas: 700, gasCostPerTherm: 1.20, furnaceEfficiencyPercent: 95, annualKwhElectric: 8000, electricCostPerKwh: 0.25, heatPumpHspf: 0 });
    expect(result.cheaperFuel).toBe('Natural Gas');
  });

  it('identifies cheaper fuel correctly (electric cheaper)', () => {
    const result = calculateGasVsElectricCost({ annualThermsGas: 700, gasCostPerTherm: 3.00, furnaceEfficiencyPercent: 80, annualKwhElectric: 8000, electricCostPerKwh: 0.10, heatPumpHspf: 9 });
    expect(result.cheaperFuel).toBe('Electric');
  });

  it('calculates annual savings as absolute difference', () => {
    const result = calculateGasVsElectricCost({ annualThermsGas: 700, gasCostPerTherm: 1.50, furnaceEfficiencyPercent: 80, annualKwhElectric: 6000, electricCostPerKwh: 0.20, heatPumpHspf: 0 });
    const expected = Math.abs(Number(result.annualGasCost) - Number(result.annualElectricCost));
    expect(Number(result.annualSavings)).toBeCloseTo(expected, 1);
  });

  it('calculates 10-year savings as 10 × annual savings', () => {
    const result = calculateGasVsElectricCost({ annualThermsGas: 700, gasCostPerTherm: 1.50, furnaceEfficiencyPercent: 80, annualKwhElectric: 6000, electricCostPerKwh: 0.20, heatPumpHspf: 0 });
    expect(Number(result.tenYearSavings)).toBeCloseTo(Number(result.annualSavings) * 10, 1);
  });

  it('returns comparison table with 2 rows', () => {
    const result = calculateGasVsElectricCost({ annualThermsGas: 700, gasCostPerTherm: 1.50, furnaceEfficiencyPercent: 80, annualKwhElectric: 6000, electricCostPerKwh: 0.20, heatPumpHspf: 0 });
    const table = result.comparisonTable as unknown[];
    expect(Array.isArray(table)).toBe(true);
    expect(table.length).toBe(2);
  });

  it('95% efficiency AFUE reduces effective gas cost vs 80%', () => {
    const r80 = calculateGasVsElectricCost({ annualThermsGas: 700, gasCostPerTherm: 1.50, furnaceEfficiencyPercent: 80, annualKwhElectric: 0, electricCostPerKwh: 0.16, heatPumpHspf: 0 });
    const r95 = calculateGasVsElectricCost({ annualThermsGas: 700, gasCostPerTherm: 1.50, furnaceEfficiencyPercent: 95, annualKwhElectric: 0, electricCostPerKwh: 0.16, heatPumpHspf: 0 });
    expect(Number(r95.annualGasCost)).toBeLessThan(Number(r80.annualGasCost));
  });

  it('returns summary array with 6 items', () => {
    const result = calculateGasVsElectricCost({ annualThermsGas: 700, gasCostPerTherm: 1.50, furnaceEfficiencyPercent: 80, annualKwhElectric: 6000, electricCostPerKwh: 0.20, heatPumpHspf: 0 });
    expect(Array.isArray(result.summary)).toBe(true);
    expect((result.summary as unknown[]).length).toBe(6);
  });

  it('handles missing inputs gracefully', () => {
    const result = calculateGasVsElectricCost({});
    expect(typeof result.annualGasCost).toBe('number');
    expect(typeof result.annualElectricCost).toBe('number');
  });
});
