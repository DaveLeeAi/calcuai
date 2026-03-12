import { calculateCompoundInterest } from '@/lib/formulas/finance/compound-interest';

describe('calculateCompoundInterest', () => {
  // ─── Test 1: Basic compound interest, no contributions ───
  it('calculates basic compound interest with no contributions', () => {
    const result = calculateCompoundInterest({
      initialDeposit: 10000,
      monthlyContribution: 0,
      annualRate: 5,
      compoundingFrequency: '12',
      years: 10,
    });
    // $10,000 at 5% for 10 years, monthly compounding → $16,470.09
    expect(result.futureValue).toBeCloseTo(16470.09, 0);
    expect(result.totalContributions).toBeCloseTo(10000, 0);
    expect(result.totalInterest).toBeCloseTo(6470.09, 0);
  });

  // ─── Test 2: With monthly contributions ───
  it('calculates compound interest with monthly contributions', () => {
    const result = calculateCompoundInterest({
      initialDeposit: 10000,
      monthlyContribution: 500,
      annualRate: 7,
      compoundingFrequency: '12',
      years: 20,
    });
    // $10,000 + $500/mo at 7% for 20 years → $300,850.72
    expect(result.futureValue).toBeCloseTo(300850.72, 0);
    expect(result.totalContributions).toBeCloseTo(130000, 0);
    expect(result.totalInterest).toBeCloseTo(170850.72, 0);
  });

  // ─── Test 3: Annual compounding ───
  it('calculates correctly with annual compounding', () => {
    const result = calculateCompoundInterest({
      initialDeposit: 10000,
      monthlyContribution: 0,
      annualRate: 5,
      compoundingFrequency: '1',
      years: 10,
    });
    // $10,000 at 5% for 10 years, annual compounding → $16,288.95
    expect(result.futureValue).toBeCloseTo(16288.95, 0);
  });

  // ─── Test 4: Daily compounding ───
  it('calculates correctly with daily compounding', () => {
    const result = calculateCompoundInterest({
      initialDeposit: 10000,
      monthlyContribution: 0,
      annualRate: 5,
      compoundingFrequency: '365',
      years: 10,
    });
    // $10,000 at 5% for 10 years, daily compounding → $16,486.65
    expect(result.futureValue).toBeCloseTo(16486.65, 0);
  });

  // ─── Test 5: Zero interest rate ───
  it('handles zero interest rate correctly (simple addition)', () => {
    const result = calculateCompoundInterest({
      initialDeposit: 10000,
      monthlyContribution: 500,
      annualRate: 0,
      compoundingFrequency: '12',
      years: 10,
    });
    // $10,000 + $500 × 120 = $70,000
    expect(result.futureValue).toBeCloseTo(70000, 0);
    expect(result.totalContributions).toBeCloseTo(70000, 0);
    expect(result.totalInterest).toBeCloseTo(0, 0);
  });

  // ─── Test 6: Zero principal, only contributions ───
  it('calculates correctly with zero initial deposit', () => {
    const result = calculateCompoundInterest({
      initialDeposit: 0,
      monthlyContribution: 1000,
      annualRate: 6,
      compoundingFrequency: '12',
      years: 10,
    });
    // $0 + $1,000/mo at 6% for 10 years → $163,879.35
    expect(result.futureValue).toBeCloseTo(163879.35, 0);
    expect(result.totalContributions).toBeCloseTo(120000, 0);
    expect(result.totalInterest).toBeCloseTo(43879.35, 0);
  });

  // ─── Test 7: Zero contributions, only principal ───
  it('calculates correctly with zero monthly contribution', () => {
    const result = calculateCompoundInterest({
      initialDeposit: 50000,
      monthlyContribution: 0,
      annualRate: 8,
      compoundingFrequency: '12',
      years: 30,
    });
    // $50,000 at 8% for 30 years → $546,786.48
    expect(result.futureValue).toBeCloseTo(546786.48, 0);
    expect(result.totalContributions).toBeCloseTo(50000, 0);
    expect(result.totalInterest).toBeCloseTo(496786.48, 0);
  });

  // ─── Test 8: Short term (1 year) ───
  it('calculates correctly for a 1-year period', () => {
    const result = calculateCompoundInterest({
      initialDeposit: 10000,
      monthlyContribution: 0,
      annualRate: 5,
      compoundingFrequency: '12',
      years: 1,
    });
    // $10,000 at 5% for 1 year, monthly → $10,511.62
    expect(result.futureValue).toBeCloseTo(10511.62, 0);
  });

  // ─── Test 9: High rate ───
  it('calculates correctly with a high interest rate', () => {
    const result = calculateCompoundInterest({
      initialDeposit: 1000,
      monthlyContribution: 0,
      annualRate: 20,
      compoundingFrequency: '12',
      years: 5,
    });
    // $1,000 at 20% for 5 years, monthly → $2,695.97
    expect(result.futureValue).toBeCloseTo(2695.97, 0);
  });

  // ─── Test 10: Growth over time chart data has correct length ───
  it('generates growth over time data with correct number of entries', () => {
    const result = calculateCompoundInterest({
      initialDeposit: 10000,
      monthlyContribution: 500,
      annualRate: 7,
      compoundingFrequency: '12',
      years: 20,
    });
    const growthData = result.growthOverTime as Array<{ year: number }>;
    // Should have year 0 through year 20 = 21 entries
    expect(growthData).toHaveLength(21);
    expect(growthData[0].year).toBe(0);
    expect(growthData[20].year).toBe(20);
  });

  // ─── Test 11: Summary contains all required labels ───
  it('returns summary with all required labels', () => {
    const result = calculateCompoundInterest({
      initialDeposit: 10000,
      monthlyContribution: 500,
      annualRate: 7,
      compoundingFrequency: '12',
      years: 20,
    });
    const summary = result.summary as Array<{ label: string; value: number }>;
    const labels = summary.map(s => s.label);
    expect(labels).toContain('Future Value');
    expect(labels).toContain('Total Contributions');
    expect(labels).toContain('Total Interest Earned');
    expect(labels).toContain('Return on Investment');
    expect(summary).toHaveLength(4);
  });

  // ─── Test 12: Breakdown pie chart data has correct entries ───
  it('returns breakdown pie chart with 3 entries when all values are positive', () => {
    const result = calculateCompoundInterest({
      initialDeposit: 10000,
      monthlyContribution: 500,
      annualRate: 7,
      compoundingFrequency: '12',
      years: 20,
    });
    const breakdown = result.breakdown as Array<{ name: string; value: number }>;
    const names = breakdown.map(b => b.name);
    expect(names).toContain('Initial Deposit');
    expect(names).toContain('Contributions');
    expect(names).toContain('Interest Earned');
    expect(breakdown).toHaveLength(3);
  });

  // ─── Test 13: Breakdown omits zero-value slices ───
  it('omits initial deposit from breakdown when it is zero', () => {
    const result = calculateCompoundInterest({
      initialDeposit: 0,
      monthlyContribution: 500,
      annualRate: 7,
      compoundingFrequency: '12',
      years: 10,
    });
    const breakdown = result.breakdown as Array<{ name: string; value: number }>;
    const names = breakdown.map(b => b.name);
    expect(names).not.toContain('Initial Deposit');
    expect(names).toContain('Contributions');
    expect(names).toContain('Interest Earned');
    expect(breakdown).toHaveLength(2);
  });

  // ─── Test 14: Future value equals totalContributions + totalInterest ───
  it('future value equals total contributions plus total interest', () => {
    const result = calculateCompoundInterest({
      initialDeposit: 25000,
      monthlyContribution: 750,
      annualRate: 6.5,
      compoundingFrequency: '12',
      years: 15,
    });
    const futureValue = result.futureValue as number;
    const totalContributions = result.totalContributions as number;
    const totalInterest = result.totalInterest as number;
    expect(futureValue).toBeCloseTo(totalContributions + totalInterest, 0);
  });

  // ─── Test 15: Very large numbers ───
  it('handles very large principal amounts correctly', () => {
    const result = calculateCompoundInterest({
      initialDeposit: 1000000,
      monthlyContribution: 0,
      annualRate: 10,
      compoundingFrequency: '12',
      years: 50,
    });
    // $1,000,000 at 10% for 50 years → $145,369,923.30
    expect(result.futureValue).toBeCloseTo(145369923.30, 0);
  });

  // ─── Test 16: Growth over time first and last entries are correct ───
  it('growth over time starts at initial deposit and ends at future value', () => {
    const result = calculateCompoundInterest({
      initialDeposit: 10000,
      monthlyContribution: 500,
      annualRate: 7,
      compoundingFrequency: '12',
      years: 20,
    });
    const growthData = result.growthOverTime as Array<{
      year: number;
      balance: number;
      contributions: number;
      interest: number;
    }>;
    // Year 0: balance = initial deposit, contributions = initial deposit, interest = 0
    expect(growthData[0].balance).toBeCloseTo(10000, 0);
    expect(growthData[0].contributions).toBeCloseTo(10000, 0);
    expect(growthData[0].interest).toBeCloseTo(0, 0);
    // Last entry should match future value
    const lastEntry = growthData[growthData.length - 1];
    expect(lastEntry.balance).toBeCloseTo(result.futureValue as number, 0);
  });

  // ─── Test 17: ROI calculation in summary ───
  it('calculates return on investment percentage correctly', () => {
    const result = calculateCompoundInterest({
      initialDeposit: 10000,
      monthlyContribution: 0,
      annualRate: 5,
      compoundingFrequency: '12',
      years: 10,
    });
    const summary = result.summary as Array<{ label: string; value: number }>;
    const roi = summary.find(s => s.label === 'Return on Investment');
    expect(roi).toBeDefined();
    // Interest is $6,470.09 on $10,000 contributions → 64.70%
    expect(roi!.value).toBeCloseTo(64.70, 0);
  });
});
