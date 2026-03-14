import { calculateNetMetering } from '@/lib/formulas/energy/net-metering';

describe('calculateNetMetering', () => {
  it('calculates excess solar when production > usage', () => {
    const result = calculateNetMetering({ monthlyProduction: 1000, monthlyUsage: 800, buyRate: 0.17, creditRate: 0.17 });
    expect(result.excessSolar).toBe(200);
  });

  it('no excess when usage > production', () => {
    const result = calculateNetMetering({ monthlyProduction: 600, monthlyUsage: 800, buyRate: 0.17, creditRate: 0.17 });
    expect(result.excessSolar).toBe(0);
  });

  it('calculates grid credit at full retail rate', () => {
    const result = calculateNetMetering({ monthlyProduction: 1000, monthlyUsage: 800, buyRate: 0.17, creditRate: 0.17 });
    expect(result.gridCredit).toBeCloseTo(34, 0);
  });

  it('calculates grid credit at reduced rate (NEM 3.0 style)', () => {
    const result = calculateNetMetering({ monthlyProduction: 1000, monthlyUsage: 800, buyRate: 0.30, creditRate: 0.06 });
    expect(result.gridCredit).toBeCloseTo(12, 0);
  });

  it('net bill is zero when production covers everything and credit covers rest', () => {
    const result = calculateNetMetering({ monthlyProduction: 1500, monthlyUsage: 800, buyRate: 0.17, creditRate: 0.17 });
    expect(result.netMonthlyBill).toBe(0);
  });

  it('calculates net bill when usage exceeds production', () => {
    const result = calculateNetMetering({ monthlyProduction: 500, monthlyUsage: 1000, buyRate: 0.17, creditRate: 0.17 });
    expect(Number(result.netMonthlyBill)).toBeCloseTo(500 * 0.17, 0);
  });

  it('calculates annual savings correctly', () => {
    const result = calculateNetMetering({ monthlyProduction: 900, monthlyUsage: 863, buyRate: 0.1724, creditRate: 0.1724 });
    expect(Number(result.annualSavings)).toBeGreaterThan(0);
  });

  it('handles equal production and usage', () => {
    const result = calculateNetMetering({ monthlyProduction: 863, monthlyUsage: 863, buyRate: 0.17, creditRate: 0.17 });
    expect(result.excessSolar).toBe(0);
    expect(result.netMonthlyBill).toBe(0);
  });

  it('handles zero production', () => {
    const result = calculateNetMetering({ monthlyProduction: 0, monthlyUsage: 863, buyRate: 0.17, creditRate: 0.17 });
    expect(Number(result.netMonthlyBill)).toBeCloseTo(863 * 0.17, 0);
  });

  it('handles missing inputs with defaults', () => {
    const result = calculateNetMetering({});
    expect(typeof result.netMonthlyBill).toBe('number');
    expect(typeof result.annualSavings).toBe('number');
  });

  it('monthly savings equals bill without solar minus net bill', () => {
    const result = calculateNetMetering({ monthlyProduction: 900, monthlyUsage: 863, buyRate: 0.17, creditRate: 0.17 });
    expect(Number(result.monthlySavings)).toBeCloseTo(Number(result.monthlyWithoutSolar) - Number(result.netMonthlyBill), 1);
  });
});
