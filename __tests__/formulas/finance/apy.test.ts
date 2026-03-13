import { calculateApy } from '@/lib/formulas/finance/apy';

describe('calculateApy', () => {
  // ─── Test 1: 5% monthly compounding ───
  it('calculates APY for 5% with monthly compounding', () => {
    const result = calculateApy({
      nominalRate: 5,
      compoundingFrequency: '12',
    });
    // APY = (1 + 0.05/12)^12 - 1 ≈ 5.1162%
    expect(result.apy).toBeCloseTo(5.1162, 2);
    expect(result.differenceFromAPR as number).toBeGreaterThan(0);
  });

  // ─── Test 2: 5% daily compounding ───
  it('calculates APY for 5% with daily compounding', () => {
    const result = calculateApy({
      nominalRate: 5,
      compoundingFrequency: '365',
    });
    // APY = (1 + 0.05/365)^365 - 1 ≈ 5.1267%
    expect(result.apy).toBeCloseTo(5.1267, 2);
  });

  // ─── Test 3: Zero rate ───
  it('returns zero APY for zero nominal rate', () => {
    const result = calculateApy({
      nominalRate: 0,
      compoundingFrequency: '12',
    });
    expect(result.apy).toBe(0);
    expect(result.effectiveMonthlyRate).toBe(0);
    expect(result.differenceFromAPR).toBe(0);
  });

  // ─── Test 4: Annual compounding (APY equals APR) ───
  it('APY equals APR when compounding is annual', () => {
    const result = calculateApy({
      nominalRate: 5,
      compoundingFrequency: '1',
    });
    // (1 + 0.05/1)^1 - 1 = 0.05 = 5%
    expect(result.apy).toBeCloseTo(5, 2);
    expect(result.differenceFromAPR).toBeCloseTo(0, 2);
  });

  // ─── Test 5: Continuous compounding (approximated by hourly) ───
  it('calculates APY for continuous compounding', () => {
    const result = calculateApy({
      nominalRate: 5,
      compoundingFrequency: '8760',
    });
    // APY = e^0.05 - 1 ≈ 5.1271%
    expect(result.apy).toBeCloseTo(5.1271, 2);
  });

  // ─── Test 6: Semi-annual compounding ───
  it('calculates APY for semi-annual compounding', () => {
    const result = calculateApy({
      nominalRate: 6,
      compoundingFrequency: '2',
    });
    // APY = (1 + 0.06/2)^2 - 1 = (1.03)^2 - 1 = 0.0609 = 6.09%
    expect(result.apy).toBeCloseTo(6.09, 2);
  });

  // ─── Test 7: Quarterly compounding ───
  it('calculates APY for quarterly compounding', () => {
    const result = calculateApy({
      nominalRate: 8,
      compoundingFrequency: '4',
    });
    // APY = (1 + 0.08/4)^4 - 1 = (1.02)^4 - 1 ≈ 8.2432%
    expect(result.apy).toBeCloseTo(8.2432, 2);
  });

  // ─── Test 8: High rate (15%) ───
  it('calculates correctly with high nominal rate', () => {
    const result = calculateApy({
      nominalRate: 15,
      compoundingFrequency: '12',
    });
    // APY = (1 + 0.15/12)^12 - 1 ≈ 16.0755%
    expect(result.apy).toBeCloseTo(16.0755, 1);
    expect(result.differenceFromAPR as number).toBeGreaterThan(1);
  });

  // ─── Test 9: Daily compounding yields higher APY than monthly ───
  it('daily compounding produces higher APY than monthly', () => {
    const daily = calculateApy({
      nominalRate: 5,
      compoundingFrequency: '365',
    });
    const monthly = calculateApy({
      nominalRate: 5,
      compoundingFrequency: '12',
    });
    expect(daily.apy as number).toBeGreaterThan(monthly.apy as number);
  });

  // ─── Test 10: Effective monthly rate ───
  it('calculates effective monthly rate correctly', () => {
    const result = calculateApy({
      nominalRate: 12,
      compoundingFrequency: '12',
    });
    // APY = (1 + 0.12/12)^12 - 1 = (1.01)^12 - 1 ≈ 12.6825%
    // Monthly rate = (1 + APY)^(1/12) - 1 = (1.126825)^(1/12) - 1 = 0.01 = 1%
    expect(result.effectiveMonthlyRate).toBeCloseTo(1, 1);
  });

  // ─── Test 11: Summary contains all required labels ───
  it('returns summary with all required labels', () => {
    const result = calculateApy({
      nominalRate: 5,
      compoundingFrequency: '12',
    });
    const summary = result.summary as Array<{ label: string; value: number }>;
    const labels = summary.map(s => s.label);
    expect(labels).toContain('APY');
    expect(labels).toContain('APR (Nominal Rate)');
    expect(labels).toContain('APY - APR Difference');
    expect(labels).toContain('Effective Monthly Rate');
    expect(summary).toHaveLength(4);
  });

  // ─── Test 12: Very low rate (0.01%) ───
  it('handles very low nominal rates', () => {
    const result = calculateApy({
      nominalRate: 0.01,
      compoundingFrequency: '365',
    });
    // APY should be very close to APR at such low rates
    expect(result.apy).toBeCloseTo(0.01, 2);
    expect(result.differenceFromAPR as number).toBeCloseTo(0, 3);
  });

  // ─── Test 13: 100% rate for stress test ───
  it('handles 100% nominal rate', () => {
    const result = calculateApy({
      nominalRate: 100,
      compoundingFrequency: '12',
    });
    // APY = (1 + 1/12)^12 - 1 ≈ 161.3035%
    expect(result.apy).toBeCloseTo(161.3, 0);
  });
});
