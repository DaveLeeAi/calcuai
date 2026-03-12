import { calculateInflation } from '@/lib/formulas/finance/inflation';

describe('calculateInflation', () => {
  // ─── Test 1: Buying power — $100 at 3% for 10 years ───
  it('calculates $100 buying power at 3% for 10 years', () => {
    const result = calculateInflation({
      amount: 100,
      inflationRate: 3,
      years: 10,
      calculationMode: 'buying-power',
    });
    // $100 / (1.03)^10 = $100 / 1.34392 = $74.41
    expect(result.resultAmount).toBeCloseTo(74.41, 1);
  });

  // ─── Test 2: Future cost — $100 at 3% for 10 years ───
  it('calculates $100 future cost at 3% for 10 years', () => {
    const result = calculateInflation({
      amount: 100,
      inflationRate: 3,
      years: 10,
      calculationMode: 'future-cost',
    });
    // $100 × (1.03)^10 = $100 × 1.34392 = $134.39
    expect(result.resultAmount).toBeCloseTo(134.39, 1);
  });

  // ─── Test 3: Percentage change — buying power mode ───
  it('shows correct percentage change for buying power erosion', () => {
    const result = calculateInflation({
      amount: 100,
      inflationRate: 3,
      years: 10,
      calculationMode: 'buying-power',
    });
    // ($74.41 - $100) / $100 × 100 = -25.59%
    expect(result.percentageChange).toBeCloseTo(-25.59, 0);
  });

  // ─── Test 4: Percentage change — future cost mode ───
  it('shows correct percentage change for future cost', () => {
    const result = calculateInflation({
      amount: 100,
      inflationRate: 3,
      years: 10,
      calculationMode: 'future-cost',
    });
    // ($134.39 - $100) / $100 × 100 = 34.39%
    expect(result.percentageChange).toBeCloseTo(34.39, 0);
  });

  // ─── Test 5: Zero inflation rate ───
  it('returns same amount when inflation rate is 0%', () => {
    const result = calculateInflation({
      amount: 1000,
      inflationRate: 0,
      years: 20,
      calculationMode: 'buying-power',
    });
    expect(result.resultAmount).toBe(1000);
    expect(result.totalChange).toBe(0);
    expect(result.percentageChange).toBe(0);
  });

  // ─── Test 6: Zero amount returns zeros ───
  it('returns zeros for zero amount', () => {
    const result = calculateInflation({
      amount: 0,
      inflationRate: 3,
      years: 10,
      calculationMode: 'buying-power',
    });
    expect(result.resultAmount).toBe(0);
    expect(result.totalChange).toBe(0);
    expect(result.percentageChange).toBe(0);
  });

  // ─── Test 7: Zero years returns zeros ───
  it('returns zeros for zero years', () => {
    const result = calculateInflation({
      amount: 100,
      inflationRate: 3,
      years: 0,
      calculationMode: 'buying-power',
    });
    expect(result.resultAmount).toBe(0);
    expect(result.totalChange).toBe(0);
  });

  // ─── Test 8: High inflation (8%) for 5 years ───
  it('calculates future cost at high inflation of 8% for 5 years', () => {
    const result = calculateInflation({
      amount: 50000,
      inflationRate: 8,
      years: 5,
      calculationMode: 'future-cost',
    });
    // $50,000 × (1.08)^5 = $50,000 × 1.46933 = $73,466.40
    expect(result.resultAmount).toBeCloseTo(73466.40, 0);
  });

  // ─── Test 9: Large amount — $1,000,000 for 30 years ───
  it('calculates buying power of $1M at 3% over 30 years', () => {
    const result = calculateInflation({
      amount: 1000000,
      inflationRate: 3,
      years: 30,
      calculationMode: 'buying-power',
    });
    // $1,000,000 / (1.03)^30 = $1,000,000 / 2.42726 = $411,987
    expect(result.resultAmount).toBeCloseTo(411987, -1);
  });

  // ─── Test 10: Chart data has correct number of points ───
  it('generates year-by-year chart data with n+1 entries', () => {
    const result = calculateInflation({
      amount: 100,
      inflationRate: 3,
      years: 10,
      calculationMode: 'buying-power',
    });
    const chartData = result.inflationOverTime as Array<{ year: number; value: number }>;
    // Should have 11 entries: year 0 through year 10
    expect(chartData).toHaveLength(11);
    expect(chartData[0].year).toBe(0);
    expect(chartData[0].value).toBe(100);
    expect(chartData[10].year).toBe(10);
  });

  // ─── Test 11: Chart data first and last values match results ───
  it('chart data endpoints match calculated values', () => {
    const result = calculateInflation({
      amount: 500,
      inflationRate: 4,
      years: 15,
      calculationMode: 'future-cost',
    });
    const chartData = result.inflationOverTime as Array<{ year: number; value: number }>;
    expect(chartData[0].value).toBe(500);
    expect(chartData[15].value).toBeCloseTo(result.resultAmount as number, 1);
  });

  // ─── Test 12: 1 year at 5% future cost ───
  it('calculates 1-year future cost correctly', () => {
    const result = calculateInflation({
      amount: 200,
      inflationRate: 5,
      years: 1,
      calculationMode: 'future-cost',
    });
    // $200 × 1.05 = $210
    expect(result.resultAmount).toBe(210);
    expect(result.totalChange).toBe(10);
  });

  // ─── Test 13: Buying power total change is negative ───
  it('total change is negative in buying-power mode', () => {
    const result = calculateInflation({
      amount: 100,
      inflationRate: 3,
      years: 10,
      calculationMode: 'buying-power',
    });
    expect(result.totalChange as number).toBeLessThan(0);
  });

  // ─── Test 14: Default mode is buying-power ───
  it('defaults to buying-power mode when not specified', () => {
    const result = calculateInflation({
      amount: 100,
      inflationRate: 3,
      years: 10,
    });
    // Buying power: $100 / (1.03)^10 ≈ $74.41
    expect(result.resultAmount).toBeCloseTo(74.41, 1);
  });

  // ─── Test 15: Summary has 6 entries ───
  it('returns summary with 6 items', () => {
    const result = calculateInflation({
      amount: 100,
      inflationRate: 3,
      years: 10,
      calculationMode: 'buying-power',
    });
    const summary = result.summary as Array<{ label: string; value: number | string }>;
    expect(summary).toHaveLength(6);
    expect(summary[0].label).toBe('Starting Amount');
  });

  // ─── Test 16: Very small inflation rate (0.5%) ───
  it('handles very small inflation rate of 0.5% over 50 years', () => {
    const result = calculateInflation({
      amount: 10000,
      inflationRate: 0.5,
      years: 50,
      calculationMode: 'future-cost',
    });
    // $10,000 × (1.005)^50 = $10,000 × 1.2832 = $12,832.26
    expect(result.resultAmount).toBeCloseTo(12832.26, 0);
  });
});
