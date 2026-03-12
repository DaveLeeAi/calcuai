import { calculateInvestmentGrowth } from '@/lib/formulas/finance/investment-growth';

describe('calculateInvestmentGrowth', () => {
  // ─── Test 1: Basic growth, no contributions ───
  it('calculates lump sum growth with no monthly contributions', () => {
    const result = calculateInvestmentGrowth({
      initialInvestment: 10000,
      monthlyContribution: 0,
      annualReturn: 7,
      investmentPeriod: 20,
      inflationRate: 3,
    });
    // $10,000 at 7% monthly compounding for 20 years
    // FV = 10000 × (1 + 0.07/12)^(240) ≈ $40,387.39
    expect(result.futureValue).toBeCloseTo(40387.39, 0);
  });

  // ─── Test 2: Growth with monthly contributions ───
  it('calculates growth with initial investment and monthly contributions', () => {
    const result = calculateInvestmentGrowth({
      initialInvestment: 10000,
      monthlyContribution: 500,
      annualReturn: 7,
      investmentPeriod: 20,
      inflationRate: 3,
    });
    // FV = 10000 × (1 + 0.07/12)^240 + 500 × ((1 + 0.07/12)^240 - 1) / (0.07/12)
    // ≈ $40,387 + $260,464 ≈ $300,851 (monthly compounding)
    expect(result.futureValue).toBeCloseTo(300851, -2);
  });

  // ─── Test 3: Inflation adjustment ───
  it('calculates inflation-adjusted real value correctly', () => {
    const result = calculateInvestmentGrowth({
      initialInvestment: 10000,
      monthlyContribution: 500,
      annualReturn: 7,
      investmentPeriod: 20,
      inflationRate: 3,
    });
    const futureValue = result.futureValue as number;
    const realValue = result.realValue as number;
    // realValue = futureValue / (1.03)^20
    const expectedReal = futureValue / Math.pow(1.03, 20);
    expect(realValue).toBeCloseTo(expectedReal, 0);
  });

  // ─── Test 4: Zero return — just contributions ───
  it('handles zero return rate correctly (no growth)', () => {
    const result = calculateInvestmentGrowth({
      initialInvestment: 10000,
      monthlyContribution: 500,
      annualReturn: 0,
      investmentPeriod: 10,
      inflationRate: 3,
    });
    // $10,000 + $500 × 120 months = $70,000
    expect(result.futureValue).toBeCloseTo(70000, 0);
    expect(result.totalContributed).toBeCloseTo(70000, 0);
    expect(result.totalEarnings).toBeCloseTo(0, 0);
  });

  // ─── Test 5: Zero initial investment ───
  it('handles zero initial investment with monthly contributions only', () => {
    const result = calculateInvestmentGrowth({
      initialInvestment: 0,
      monthlyContribution: 1000,
      annualReturn: 7,
      investmentPeriod: 20,
      inflationRate: 3,
    });
    // FV = 0 + 1000 × ((1.005833)^240 - 1) / 0.005833 ≈ $520,927
    expect(result.futureValue).toBeCloseTo(520927, -2);
    expect(result.totalContributed).toBeCloseTo(240000, 0);
  });

  // ─── Test 6: Zero contributions, lump sum only ───
  it('handles zero contributions with lump sum only', () => {
    const result = calculateInvestmentGrowth({
      initialInvestment: 50000,
      monthlyContribution: 0,
      annualReturn: 8,
      investmentPeriod: 30,
      inflationRate: 3,
    });
    // FV = 50000 × (1 + 0.08/12)^360 ≈ $543,397
    const monthlyRate = 0.08 / 12;
    const expected = 50000 * Math.pow(1 + monthlyRate, 360);
    expect(result.futureValue).toBeCloseTo(expected, 0);
    expect(result.totalContributed).toBeCloseTo(50000, 0);
  });

  // ─── Test 7: Short period — 1 year ───
  it('calculates correctly for a 1-year period', () => {
    const result = calculateInvestmentGrowth({
      initialInvestment: 10000,
      monthlyContribution: 0,
      annualReturn: 7,
      investmentPeriod: 1,
      inflationRate: 3,
    });
    // FV = 10000 × (1 + 0.07/12)^12 ≈ $10,722.90
    const monthlyRate = 0.07 / 12;
    const expected = 10000 * Math.pow(1 + monthlyRate, 12);
    expect(result.futureValue).toBeCloseTo(expected, 0);
  });

  // ─── Test 8: Total contributed = initial + (monthly × 12 × years) ───
  it('calculates total contributed correctly', () => {
    const result = calculateInvestmentGrowth({
      initialInvestment: 5000,
      monthlyContribution: 300,
      annualReturn: 6,
      investmentPeriod: 15,
      inflationRate: 2,
    });
    // Total contributed = 5000 + (300 × 12 × 15) = 5000 + 54000 = 59000
    expect(result.totalContributed).toBeCloseTo(59000, 0);
  });

  // ─── Test 9: Total earnings = futureValue - totalContributed ───
  it('calculates total earnings as futureValue minus totalContributed', () => {
    const result = calculateInvestmentGrowth({
      initialInvestment: 20000,
      monthlyContribution: 400,
      annualReturn: 8,
      investmentPeriod: 25,
      inflationRate: 3,
    });
    const futureValue = result.futureValue as number;
    const totalContributed = result.totalContributed as number;
    const totalEarnings = result.totalEarnings as number;
    expect(totalEarnings).toBeCloseTo(futureValue - totalContributed, 0);
  });

  // ─── Test 10: Growth chart has correct number of data points ───
  it('generates growth chart with years + 1 data points', () => {
    const result = calculateInvestmentGrowth({
      initialInvestment: 10000,
      monthlyContribution: 500,
      annualReturn: 7,
      investmentPeriod: 20,
      inflationRate: 3,
    });
    const growthOverTime = result.growthOverTime as Array<{ year: number }>;
    // Should have year 0 through year 20 = 21 data points
    expect(growthOverTime).toHaveLength(21);
    expect(growthOverTime[0].year).toBe(0);
    expect(growthOverTime[20].year).toBe(20);
  });

  // ─── Test 11: Year-by-year table has correct number of rows ───
  it('generates year-by-year table with correct number of rows', () => {
    const result = calculateInvestmentGrowth({
      initialInvestment: 10000,
      monthlyContribution: 500,
      annualReturn: 7,
      investmentPeriod: 15,
      inflationRate: 3,
    });
    const yearByYear = result.yearByYear as Array<{ year: number }>;
    expect(yearByYear).toHaveLength(15);
    expect(yearByYear[0].year).toBe(1);
    expect(yearByYear[14].year).toBe(15);
  });

  // ─── Test 12: Summary contains all required labels ───
  it('includes all required labels in summary output', () => {
    const result = calculateInvestmentGrowth({
      initialInvestment: 10000,
      monthlyContribution: 500,
      annualReturn: 7,
      investmentPeriod: 20,
      inflationRate: 3,
    });
    const summary = result.summary as Array<{ label: string; value: number }>;
    const labels = summary.map(s => s.label);
    expect(labels).toContain('Future Value');
    expect(labels).toContain('Inflation-Adjusted Value');
    expect(labels).toContain('Total Contributed');
    expect(labels).toContain('Investment Earnings');
    expect(labels).toContain('Real Rate of Return');
  });

  // ─── Test 13: High return rate ───
  it('calculates correctly with high return rate (20%)', () => {
    const result = calculateInvestmentGrowth({
      initialInvestment: 1000,
      monthlyContribution: 0,
      annualReturn: 20,
      investmentPeriod: 10,
      inflationRate: 3,
    });
    // FV = 1000 × (1 + 0.20/12)^120
    const monthlyRate = 0.20 / 12;
    const expected = 1000 * Math.pow(1 + monthlyRate, 120);
    expect(result.futureValue).toBeCloseTo(expected, 0);
  });

  // ─── Test 14: Negative return rate ───
  it('handles negative return rate correctly', () => {
    const result = calculateInvestmentGrowth({
      initialInvestment: 10000,
      monthlyContribution: 500,
      annualReturn: -5,
      investmentPeriod: 5,
      inflationRate: 3,
    });
    const futureValue = result.futureValue as number;
    const totalContributed = result.totalContributed as number;
    // With negative returns, future value should be less than total contributed
    expect(futureValue).toBeLessThan(totalContributed);
    // Total contributed = 10000 + 500 × 60 = 40000
    expect(totalContributed).toBeCloseTo(40000, 0);
    // Earnings should be negative
    const totalEarnings = result.totalEarnings as number;
    expect(totalEarnings).toBeLessThan(0);
  });

  // ─── Test 15: Breakdown pie chart has 3 segments ───
  it('returns breakdown with three segments for pie chart', () => {
    const result = calculateInvestmentGrowth({
      initialInvestment: 10000,
      monthlyContribution: 500,
      annualReturn: 7,
      investmentPeriod: 20,
      inflationRate: 3,
    });
    const breakdown = result.breakdown as Array<{ name: string; value: number }>;
    expect(breakdown).toHaveLength(3);
    const names = breakdown.map(b => b.name);
    expect(names).toContain('Initial Investment');
    expect(names).toContain('Monthly Contributions');
    expect(names).toContain('Investment Earnings');
  });

  // ─── Test 16: Year-by-year end balance matches next year start balance ───
  it('year-by-year table has consistent start/end balances between rows', () => {
    const result = calculateInvestmentGrowth({
      initialInvestment: 10000,
      monthlyContribution: 500,
      annualReturn: 7,
      investmentPeriod: 5,
      inflationRate: 3,
    });
    const yearByYear = result.yearByYear as Array<{
      year: number;
      startBalance: number;
      endBalance: number;
    }>;
    // Each year's end balance should equal next year's start balance
    for (let i = 0; i < yearByYear.length - 1; i++) {
      expect(yearByYear[i].endBalance).toBeCloseTo(yearByYear[i + 1].startBalance, 0);
    }
  });
});
