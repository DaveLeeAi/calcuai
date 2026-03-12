import { calculateSavingsGrowth } from '@/lib/formulas/finance/savings-growth';

describe('calculateSavingsGrowth', () => {
  // ─── Test 1: Default scenario — $5,000 initial + $500/month at 4.5% for 5 years ───
  it('calculates default scenario correctly', () => {
    const result = calculateSavingsGrowth({
      initialDeposit: 5000,
      monthlyDeposit: 500,
      annualRate: 4.5,
      years: 5,
    });
    const fv = result.futureValue as number;
    // $5,000 + $500/mo at 4.5% monthly compounding for 5 years ≈ $39,832
    expect(fv).toBeCloseTo(39832, -1);
    expect(result.totalDeposits).toBeCloseTo(35000, 0);
    const interest = result.totalInterest as number;
    expect(interest).toBeCloseTo(4832, -1);
  });

  // ─── Test 2: Zero interest rate — pure accumulation ───
  it('handles zero interest rate correctly (simple addition)', () => {
    const result = calculateSavingsGrowth({
      initialDeposit: 10000,
      monthlyDeposit: 500,
      annualRate: 0,
      years: 10,
    });
    // $10,000 + $500 × 120 = $70,000
    expect(result.futureValue).toBe(70000);
    expect(result.totalDeposits).toBe(70000);
    expect(result.totalInterest).toBe(0);
  });

  // ─── Test 3: Zero monthly deposits — principal growth only ───
  it('calculates correctly with zero monthly deposits', () => {
    const result = calculateSavingsGrowth({
      initialDeposit: 10000,
      monthlyDeposit: 0,
      annualRate: 5,
      years: 10,
    });
    // $10,000 at 5% monthly compounding for 10 years ≈ $16,470
    expect(result.futureValue).toBeCloseTo(16470, -1);
    expect(result.totalDeposits).toBe(10000);
  });

  // ─── Test 4: Zero initial deposit — contributions only ───
  it('calculates correctly with zero initial deposit', () => {
    const result = calculateSavingsGrowth({
      initialDeposit: 0,
      monthlyDeposit: 1000,
      annualRate: 4.5,
      years: 5,
    });
    const fv = result.futureValue as number;
    expect(fv).toBeGreaterThan(66000);
    expect(fv).toBeLessThan(68000);
    expect(result.totalDeposits).toBe(60000);
  });

  // ─── Test 5: Savings goal — already reached ───
  it('reports goal already reached when initial deposit exceeds goal', () => {
    const result = calculateSavingsGrowth({
      initialDeposit: 50000,
      monthlyDeposit: 500,
      annualRate: 4.5,
      years: 5,
      savingsGoal: 30000,
    });
    expect(result.monthsToGoal).toBe(0);
    expect(result.monthsToGoalText).toBe('Already reached');
  });

  // ─── Test 6: Savings goal — achievable ───
  it('calculates months to reach a savings goal', () => {
    const result = calculateSavingsGrowth({
      initialDeposit: 10000,
      monthlyDeposit: 1000,
      annualRate: 4.5,
      years: 10,
      savingsGoal: 50000,
    });
    const months = result.monthsToGoal as number;
    // Should take approximately 37 months to reach $50,000
    expect(months).toBeGreaterThan(35);
    expect(months).toBeLessThan(42);
    expect(result.monthsToGoalText).toContain('year');
  });

  // ─── Test 7: Savings goal — not reachable without deposits ───
  it('reports not reachable when no deposits and zero rate', () => {
    const result = calculateSavingsGrowth({
      initialDeposit: 1000,
      monthlyDeposit: 0,
      annualRate: 0,
      years: 5,
      savingsGoal: 50000,
    });
    expect(result.monthsToGoalText).toBe('Not reachable without deposits');
  });

  // ─── Test 8: Growth over time chart has correct length ───
  it('generates growthOverTime data with correct number of entries', () => {
    const result = calculateSavingsGrowth({
      initialDeposit: 5000,
      monthlyDeposit: 500,
      annualRate: 4.5,
      years: 10,
    });
    const growthData = result.growthOverTime as Array<{ year: number; balance: number }>;
    // Year 0 through Year 10 = 11 entries
    expect(growthData).toHaveLength(11);
    expect(growthData[0].year).toBe(0);
    expect(growthData[10].year).toBe(10);
  });

  // ─── Test 9: Growth over time first entry matches initial deposit ───
  it('growthOverTime starts at initial deposit with zero interest', () => {
    const result = calculateSavingsGrowth({
      initialDeposit: 5000,
      monthlyDeposit: 500,
      annualRate: 4.5,
      years: 5,
    });
    const growthData = result.growthOverTime as Array<{
      year: number;
      balance: number;
      deposits: number;
      interest: number;
    }>;
    expect(growthData[0].balance).toBe(5000);
    expect(growthData[0].deposits).toBe(5000);
    expect(growthData[0].interest).toBe(0);
  });

  // ─── Test 10: Future value equals totalDeposits + totalInterest ───
  it('future value equals total deposits plus total interest', () => {
    const result = calculateSavingsGrowth({
      initialDeposit: 8000,
      monthlyDeposit: 750,
      annualRate: 3.8,
      years: 7,
    });
    const fv = result.futureValue as number;
    const deposits = result.totalDeposits as number;
    const interest = result.totalInterest as number;
    expect(fv).toBeCloseTo(deposits + interest, 1);
  });

  // ─── Test 11: Summary contains correct labels ───
  it('returns summary with all required labels', () => {
    const result = calculateSavingsGrowth({
      initialDeposit: 5000,
      monthlyDeposit: 500,
      annualRate: 4.5,
      years: 5,
    });
    const summary = result.summary as Array<{ label: string; value: number }>;
    const labels = summary.map(s => s.label);
    expect(labels).toContain('Future Value');
    expect(labels).toContain('Total Deposits');
    expect(labels).toContain('Interest Earned');
    expect(summary).toHaveLength(3);
  });

  // ─── Test 12: Breakdown pie chart entries ───
  it('returns breakdown pie chart with correct entries', () => {
    const result = calculateSavingsGrowth({
      initialDeposit: 5000,
      monthlyDeposit: 500,
      annualRate: 4.5,
      years: 5,
    });
    const breakdown = result.breakdown as Array<{ name: string; value: number }>;
    const names = breakdown.map(b => b.name);
    expect(names).toContain('Initial Deposit');
    expect(names).toContain('Monthly Deposits');
    expect(names).toContain('Interest Earned');
    expect(breakdown).toHaveLength(3);
  });

  // ─── Test 13: Breakdown omits zero-value entries ───
  it('omits initial deposit from breakdown when zero', () => {
    const result = calculateSavingsGrowth({
      initialDeposit: 0,
      monthlyDeposit: 500,
      annualRate: 4.5,
      years: 5,
    });
    const breakdown = result.breakdown as Array<{ name: string; value: number }>;
    const names = breakdown.map(b => b.name);
    expect(names).not.toContain('Initial Deposit');
    expect(breakdown).toHaveLength(2);
  });

  // ─── Test 14: Short period (1 year) ───
  it('calculates correctly for a 1-year period', () => {
    const result = calculateSavingsGrowth({
      initialDeposit: 10000,
      monthlyDeposit: 0,
      annualRate: 5,
      years: 1,
    });
    // $10,000 at 5% monthly compounding for 1 year ≈ $10,511.62
    expect(result.futureValue).toBeCloseTo(10511.62, 0);
  });

  // ─── Test 15: Large deposit, high rate, long term ───
  it('handles large numbers correctly', () => {
    const result = calculateSavingsGrowth({
      initialDeposit: 100000,
      monthlyDeposit: 2000,
      annualRate: 5,
      years: 30,
    });
    const fv = result.futureValue as number;
    // Should be a very large number (>$2M)
    expect(fv).toBeGreaterThan(2000000);
  });
});
