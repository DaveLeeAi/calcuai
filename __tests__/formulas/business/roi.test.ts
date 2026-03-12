import { calculateROI } from '@/lib/formulas/business/roi';

describe('calculateROI', () => {
  // ─── Test 1: Simple 100% ROI (doubled investment) ───
  it('calculates 100% ROI when investment doubles', () => {
    const result = calculateROI({
      initialInvestment: 10000,
      finalValue: 20000,
      investmentPeriodYears: 5,
    });
    expect(result.roiPercent).toBe(100);
    expect(result.netProfit).toBe(10000);
  });

  // ─── Test 2: Net profit calculation ───
  it('calculates net profit correctly', () => {
    const result = calculateROI({
      initialInvestment: 25000,
      finalValue: 32000,
      investmentPeriodYears: 3,
    });
    expect(result.netProfit).toBe(7000);
  });

  // ─── Test 3: ROI percentage ───
  it('calculates ROI percentage for typical investment', () => {
    const result = calculateROI({
      initialInvestment: 50000,
      finalValue: 65000,
      investmentPeriodYears: 2,
    });
    // ROI = (65000 - 50000) / 50000 × 100 = 30%
    expect(result.roiPercent).toBe(30);
  });

  // ─── Test 4: Annualized ROI (CAGR) ───
  it('calculates annualized ROI correctly', () => {
    const result = calculateROI({
      initialInvestment: 10000,
      finalValue: 20000,
      investmentPeriodYears: 7,
    });
    // CAGR = (20000/10000)^(1/7) - 1 = 10.41%
    expect(result.annualizedROI).toBeCloseTo(10.41, 0);
  });

  // ─── Test 5: Total return multiple ───
  it('calculates total return multiple correctly', () => {
    const result = calculateROI({
      initialInvestment: 10000,
      finalValue: 35000,
      investmentPeriodYears: 5,
    });
    expect(result.totalReturnMultiple).toBe(3.5);
  });

  // ─── Test 6: Negative ROI (loss) ───
  it('handles negative ROI when investment loses value', () => {
    const result = calculateROI({
      initialInvestment: 50000,
      finalValue: 30000,
      investmentPeriodYears: 3,
    });
    expect(result.roiPercent).toBe(-40);
    expect(result.netProfit).toBe(-20000);
  });

  // ─── Test 7: Zero investment ───
  it('handles zero initial investment gracefully', () => {
    const result = calculateROI({
      initialInvestment: 0,
      finalValue: 10000,
      investmentPeriodYears: 5,
    });
    expect(result.roiPercent).toBe(0);
    expect(result.totalReturnMultiple).toBe(0);
  });

  // ─── Test 8: Zero final value (total loss) ───
  it('handles total loss of investment', () => {
    const result = calculateROI({
      initialInvestment: 10000,
      finalValue: 0,
      investmentPeriodYears: 2,
    });
    expect(result.roiPercent).toBe(-100);
    expect(result.netProfit).toBe(-10000);
  });

  // ─── Test 9: One-year investment period ───
  it('calculates 1-year ROI where annual = simple ROI', () => {
    const result = calculateROI({
      initialInvestment: 10000,
      finalValue: 11200,
      investmentPeriodYears: 1,
    });
    expect(result.roiPercent).toBe(12);
    expect(result.annualizedROI).toBe(12);
  });

  // ─── Test 10: Growth over time chart ───
  it('generates growth over time chart data', () => {
    const result = calculateROI({
      initialInvestment: 10000,
      finalValue: 20000,
      investmentPeriodYears: 5,
    });
    const chart = result.growthOverTime as { year: number; value: number }[];
    expect(chart.length).toBe(6); // years 0 through 5
    expect(chart[0].year).toBe(0);
    expect(chart[0].value).toBe(10000);
    expect(chart[5].year).toBe(5);
    // Final year should be close to 20000 (based on annualized rate)
    expect(chart[5].value).toBeCloseTo(20000, -2);
  });

  // ─── Test 11: Summary contains correct labels ───
  it('returns summary with all expected labels', () => {
    const result = calculateROI({
      initialInvestment: 10000,
      finalValue: 15000,
      investmentPeriodYears: 3,
    });
    const summary = result.summary as { label: string; value: number }[];
    const labels = summary.map((s) => s.label);
    expect(labels).toContain('Initial Investment');
    expect(labels).toContain('Final Value');
    expect(labels).toContain('Net Profit');
    expect(labels).toContain('ROI');
    expect(labels).toContain('Annualized ROI');
    expect(labels).toContain('Return Multiple');
  });

  // ─── Test 12: Very large investment ───
  it('handles very large investment amounts', () => {
    const result = calculateROI({
      initialInvestment: 1000000,
      finalValue: 1500000,
      investmentPeriodYears: 10,
    });
    expect(result.roiPercent).toBe(50);
    expect(result.netProfit).toBe(500000);
  });

  // ─── Test 13: Short time period (high annualized) ───
  it('calculates high annualized ROI for short period', () => {
    const result = calculateROI({
      initialInvestment: 10000,
      finalValue: 15000,
      investmentPeriodYears: 1,
    });
    expect(result.annualizedROI).toBe(50);
  });

  // ─── Test 14: Missing inputs ───
  it('uses defaults for missing inputs', () => {
    const result = calculateROI({});
    expect(result.roiPercent).toBe(0);
    expect(result.netProfit).toBe(0);
  });

  // ─── Test 15: Break-even (final = initial) ───
  it('returns 0% ROI when final value equals initial investment', () => {
    const result = calculateROI({
      initialInvestment: 10000,
      finalValue: 10000,
      investmentPeriodYears: 5,
    });
    expect(result.roiPercent).toBe(0);
    expect(result.netProfit).toBe(0);
    expect(result.totalReturnMultiple).toBe(1);
  });
});
