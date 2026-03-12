import { calculatePresentValue } from '@/lib/formulas/finance/present-value';

describe('calculatePresentValue', () => {
  // ─── Test 1: Standard lump sum PV — $10,000 in 5 years at 5% annually ───
  it('calculates PV of a lump sum correctly', () => {
    const result = calculatePresentValue({
      futureValue: 10000,
      periodicPayment: 0,
      annualRate: 5,
      years: 5,
      compoundingFrequency: '1',
    });
    // PV = 10000 / (1.05)^5 = $7,835.26
    expect(result.totalPresentValue).toBeCloseTo(7835.26, 0);
    expect(result.pvLumpSum).toBeCloseTo(7835.26, 0);
    expect(result.pvAnnuity).toBe(0);
  });

  // ─── Test 2: PV of annuity only — $1,000/year for 10 years at 6% ───
  it('calculates PV of an annuity correctly', () => {
    const result = calculatePresentValue({
      futureValue: 0,
      periodicPayment: 1000,
      annualRate: 6,
      years: 10,
      compoundingFrequency: '1',
    });
    // PV = 1000 × [(1 - (1.06)^-10) / 0.06] = $7,360.09
    expect(result.totalPresentValue).toBeCloseTo(7360.09, 0);
    expect(result.pvLumpSum).toBe(0);
    expect(result.pvAnnuity).toBeCloseTo(7360.09, 0);
  });

  // ─── Test 3: Combined lump sum + annuity ───
  it('calculates combined PV of lump sum and annuity', () => {
    const result = calculatePresentValue({
      futureValue: 50000,
      periodicPayment: 2000,
      annualRate: 5,
      years: 10,
      compoundingFrequency: '1',
    });
    // PV lump = 50000 / (1.05)^10 ≈ $30,695.66
    // PV annuity = 2000 × [(1-(1.05)^-10)/0.05] ≈ $15,443.47
    // Total ≈ $46,139.13
    expect(result.pvLumpSum).toBeCloseTo(30695.66, 0);
    expect(result.pvAnnuity).toBeCloseTo(15443.47, 0);
    expect(result.totalPresentValue).toBeCloseTo(46139.13, -1);
  });

  // ─── Test 4: Zero interest rate — no discounting ───
  it('handles zero interest rate (no discounting)', () => {
    const result = calculatePresentValue({
      futureValue: 10000,
      periodicPayment: 500,
      annualRate: 0,
      years: 5,
      compoundingFrequency: '1',
    });
    // At 0%, PV = FV + PMT×periods
    expect(result.pvLumpSum).toBe(10000);
    expect(result.pvAnnuity).toBe(2500);
    expect(result.totalPresentValue).toBe(12500);
  });

  // ─── Test 5: Zero time period ───
  it('handles zero time period', () => {
    const result = calculatePresentValue({
      futureValue: 10000,
      periodicPayment: 0,
      annualRate: 5,
      years: 0,
      compoundingFrequency: '1',
    });
    expect(result.totalPresentValue).toBe(10000);
  });

  // ─── Test 6: Monthly compounding ───
  it('calculates PV with monthly compounding', () => {
    const result = calculatePresentValue({
      futureValue: 10000,
      periodicPayment: 0,
      annualRate: 6,
      years: 5,
      compoundingFrequency: '12',
    });
    // PV = 10000 / (1 + 0.06/12)^(60) = 10000 / (1.005)^60 ≈ $7,413.72
    expect(result.totalPresentValue).toBeCloseTo(7413.72, 0);
  });

  // ─── Test 7: Quarterly compounding ───
  it('calculates PV with quarterly compounding', () => {
    const result = calculatePresentValue({
      futureValue: 10000,
      periodicPayment: 0,
      annualRate: 8,
      years: 3,
      compoundingFrequency: '4',
    });
    // PV = 10000 / (1.02)^12 ≈ $7,884.93
    expect(result.totalPresentValue).toBeCloseTo(7884.93, 0);
  });

  // ─── Test 8: Discount factor ───
  it('calculates discount factor correctly', () => {
    const result = calculatePresentValue({
      futureValue: 10000,
      periodicPayment: 0,
      annualRate: 5,
      years: 5,
      compoundingFrequency: '1',
    });
    // Discount factor = 1 / (1.05)^5 ≈ 0.783526
    const df = result.discountFactor as number;
    expect(df).toBeCloseTo(0.783526, 4);
  });

  // ─── Test 9: Total discount calculation ───
  it('calculates total discount (difference from future value)', () => {
    const result = calculatePresentValue({
      futureValue: 10000,
      periodicPayment: 0,
      annualRate: 5,
      years: 5,
      compoundingFrequency: '1',
    });
    const totalDiscount = result.totalDiscount as number;
    // Discount = 10000 - 7835.26 ≈ $2,164.74
    expect(totalDiscount).toBeCloseTo(2164.74, 0);
  });

  // ─── Test 10: PV over time chart data ───
  it('generates pvOverTime with correct number of entries', () => {
    const result = calculatePresentValue({
      futureValue: 10000,
      periodicPayment: 0,
      annualRate: 5,
      years: 5,
      compoundingFrequency: '1',
    });
    const pvData = result.pvOverTime as Array<{ year: number; presentValue: number }>;
    expect(pvData).toHaveLength(6); // year 0 through 5
    expect(pvData[0].year).toBe(0);
    expect(pvData[5].year).toBe(5);
    // At year 5, PV should equal FV (no remaining discounting)
    expect(pvData[5].presentValue).toBe(10000);
    // At year 0, PV should equal the calculated PV
    expect(pvData[0].presentValue).toBeCloseTo(7835.26, 0);
  });

  // ─── Test 11: PV increases as years remaining decreases ───
  it('PV increases monotonically as time passes', () => {
    const result = calculatePresentValue({
      futureValue: 10000,
      periodicPayment: 0,
      annualRate: 5,
      years: 5,
      compoundingFrequency: '1',
    });
    const pvData = result.pvOverTime as Array<{ year: number; presentValue: number }>;
    for (let i = 1; i < pvData.length; i++) {
      expect(pvData[i].presentValue).toBeGreaterThanOrEqual(pvData[i - 1].presentValue);
    }
  });

  // ─── Test 12: Summary labels ───
  it('returns summary with all required labels', () => {
    const result = calculatePresentValue({
      futureValue: 10000,
      periodicPayment: 500,
      annualRate: 5,
      years: 5,
      compoundingFrequency: '1',
    });
    const summary = result.summary as Array<{ label: string; value: number }>;
    const labels = summary.map(s => s.label);
    expect(labels).toContain('Present Value');
    expect(labels).toContain('PV of Lump Sum');
    expect(labels).toContain('PV of Payments');
    expect(labels).toContain('Total Discount');
  });

  // ─── Test 13: Breakdown pie chart ───
  it('returns breakdown with both components when both present', () => {
    const result = calculatePresentValue({
      futureValue: 10000,
      periodicPayment: 500,
      annualRate: 5,
      years: 5,
      compoundingFrequency: '1',
    });
    const breakdown = result.breakdown as Array<{ name: string; value: number }>;
    expect(breakdown).toHaveLength(2);
    expect(breakdown[0].name).toBe('PV of Lump Sum');
    expect(breakdown[1].name).toBe('PV of Payments');
  });

  // ─── Test 14: High discount rate ───
  it('handles high discount rate correctly', () => {
    const result = calculatePresentValue({
      futureValue: 100000,
      periodicPayment: 0,
      annualRate: 20,
      years: 10,
      compoundingFrequency: '1',
    });
    // PV = 100000 / (1.2)^10 ≈ $16,150.56
    expect(result.totalPresentValue).toBeCloseTo(16150.56, 0);
  });

  // ─── Test 15: Long time horizon ───
  it('handles long time horizons', () => {
    const result = calculatePresentValue({
      futureValue: 1000000,
      periodicPayment: 0,
      annualRate: 7,
      years: 30,
      compoundingFrequency: '1',
    });
    // PV = 1000000 / (1.07)^30 ≈ $131,367.12
    expect(result.totalPresentValue).toBeCloseTo(131367, -1);
  });

  // ─── Test 16: Total PV = PV lump sum + PV annuity identity ───
  it('total PV equals sum of lump sum PV and annuity PV', () => {
    const result = calculatePresentValue({
      futureValue: 25000,
      periodicPayment: 1000,
      annualRate: 4,
      years: 8,
      compoundingFrequency: '4',
    });
    const total = result.totalPresentValue as number;
    const pvLump = result.pvLumpSum as number;
    const pvAnn = result.pvAnnuity as number;
    expect(total).toBeCloseTo(pvLump + pvAnn, 1);
  });
});
