import { calculateSavingsGoal } from '@/lib/formulas/finance/savings-goal';

describe('calculateSavingsGoal', () => {
  // ─── Test 1: Basic case — $50K target, $5K saved, 10 years, 6% monthly ───
  it('calculates monthly contribution for $50K goal with $5K saved over 10 years at 6%', () => {
    const result = calculateSavingsGoal({
      targetAmount: 50000,
      currentSavings: 5000,
      timeframeYears: 10,
      annualReturn: 6,
      compoundingFrequency: '12',
    });
    // FV of $5K at 6% monthly for 10 years = 5000 * (1.005)^120 ≈ $9,096.98
    // Remaining ≈ $50,000 - $9,096.98 = $40,903.02
    // PMT = 40903.02 * 0.005 / ((1.005)^120 - 1) ≈ $249.59
    const monthly = result.monthlyContribution as number;
    expect(monthly).toBeCloseTo(249.59, 0);
    expect(result.totalContributions).toBeCloseTo(monthly * 120, 0);
    expect(result.finalBalance).toBe(50000);
  });

  // ─── Test 2: Zero current savings ───
  it('calculates correctly when starting from zero', () => {
    const result = calculateSavingsGoal({
      targetAmount: 10000,
      currentSavings: 0,
      timeframeYears: 5,
      annualReturn: 5,
      compoundingFrequency: '12',
    });
    // FV of $0 = $0, so need full $10K from contributions
    // PMT = 10000 * (0.05/12) / ((1+0.05/12)^60 - 1) ≈ $147.05
    expect(result.monthlyContribution).toBeCloseTo(147.05, 0);
    expect(result.totalContributions).toBeCloseTo(147.05 * 60, -1);
    expect(typeof result.totalInterestEarned).toBe('number');
  });

  // ─── Test 3: Target already met by current savings growth ───
  it('returns zero monthly contribution when current savings already meet the goal', () => {
    const result = calculateSavingsGoal({
      targetAmount: 10000,
      currentSavings: 10000,
      timeframeYears: 5,
      annualReturn: 5,
      compoundingFrequency: '12',
    });
    // $10K at 5% grows well past $10K → no additional savings needed
    expect(result.monthlyContribution).toBe(0);
    expect(result.totalContributions).toBe(0);
  });

  // ─── Test 4: Zero return rate ───
  it('calculates correctly with zero return rate', () => {
    const result = calculateSavingsGoal({
      targetAmount: 12000,
      currentSavings: 0,
      timeframeYears: 10,
      annualReturn: 0,
      compoundingFrequency: '12',
    });
    // No interest: $12,000 / 120 months = $100/month
    expect(result.monthlyContribution).toBe(100);
    expect(result.totalContributions).toBe(12000);
    expect(result.totalInterestEarned).toBe(0);
  });

  // ─── Test 5: Short timeframe (1 year) ───
  it('calculates correctly for a 1-year timeframe', () => {
    const result = calculateSavingsGoal({
      targetAmount: 6000,
      currentSavings: 0,
      timeframeYears: 1,
      annualReturn: 5,
      compoundingFrequency: '12',
    });
    // PMT = 6000 * (0.05/12) / ((1+0.05/12)^12 - 1) ≈ $488.87
    expect(result.monthlyContribution).toBeCloseTo(488.87, 0);
    const totalContrib = result.totalContributions as number;
    expect(totalContrib).toBeCloseTo(488.87 * 12, -1);
  });

  // ─── Test 6: Long timeframe (30 years) ───
  it('calculates correctly for a 30-year timeframe', () => {
    const result = calculateSavingsGoal({
      targetAmount: 1000000,
      currentSavings: 0,
      timeframeYears: 30,
      annualReturn: 7,
      compoundingFrequency: '12',
    });
    // PMT = 1000000 * (0.07/12) / ((1+0.07/12)^360 - 1) ≈ $819.87
    expect(result.monthlyContribution).toBeCloseTo(819.87, -1);
    const totalContrib = result.totalContributions as number;
    const totalInterest = result.totalInterestEarned as number;
    // Interest should be significant over 30 years
    expect(totalInterest).toBeGreaterThan(totalContrib);
  });

  // ─── Test 7: High return rate (12%) ───
  it('calculates correctly with high return rate', () => {
    const result = calculateSavingsGoal({
      targetAmount: 100000,
      currentSavings: 10000,
      timeframeYears: 10,
      annualReturn: 12,
      compoundingFrequency: '12',
    });
    // FV of $10K at 12% monthly for 10y = 10000 * (1.01)^120 ≈ $33,003.87
    // Remaining ≈ $66,996.13
    // PMT = 66996.13 * 0.01 / ((1.01)^120 - 1) ≈ $290.61
    const monthly = result.monthlyContribution as number;
    expect(monthly).toBeCloseTo(290.61, -1);
    expect(monthly).toBeGreaterThan(0);
  });

  // ─── Test 8: Daily compounding ───
  it('calculates correctly with daily compounding', () => {
    const result = calculateSavingsGoal({
      targetAmount: 50000,
      currentSavings: 5000,
      timeframeYears: 10,
      annualReturn: 6,
      compoundingFrequency: '365',
    });
    const monthly = result.monthlyContribution as number;
    // Daily compounding yields slightly more than monthly, so contribution slightly less
    expect(monthly).toBeGreaterThan(0);
    expect(monthly).toBeLessThan(260); // less than a non-compounding estimate
  });

  // ─── Test 9: Annual compounding ───
  it('calculates correctly with annual compounding', () => {
    const result = calculateSavingsGoal({
      targetAmount: 50000,
      currentSavings: 5000,
      timeframeYears: 10,
      annualReturn: 6,
      compoundingFrequency: '1',
    });
    const monthly = result.monthlyContribution as number;
    // Annual compounding yields less than monthly → need higher contribution
    expect(monthly).toBeGreaterThan(0);
  });

  // ─── Test 10: Daily compounding requires less than annual ───
  it('daily compounding requires less monthly savings than annual compounding', () => {
    const daily = calculateSavingsGoal({
      targetAmount: 50000,
      currentSavings: 5000,
      timeframeYears: 10,
      annualReturn: 6,
      compoundingFrequency: '365',
    });
    const annual = calculateSavingsGoal({
      targetAmount: 50000,
      currentSavings: 5000,
      timeframeYears: 10,
      annualReturn: 6,
      compoundingFrequency: '1',
    });
    expect(daily.monthlyContribution as number).toBeLessThan(annual.monthlyContribution as number);
  });

  // ─── Test 11: Large target ($1M) ───
  it('handles large target amounts correctly', () => {
    const result = calculateSavingsGoal({
      targetAmount: 1000000,
      currentSavings: 50000,
      timeframeYears: 20,
      annualReturn: 8,
      compoundingFrequency: '12',
    });
    const monthly = result.monthlyContribution as number;
    expect(monthly).toBeGreaterThan(0);
    expect(monthly).toBeLessThan(5000); // reasonable monthly amount
    expect(result.finalBalance).toBe(1000000);
  });

  // ─── Test 12: Small target ($1K) ───
  it('handles small target amounts correctly', () => {
    const result = calculateSavingsGoal({
      targetAmount: 1000,
      currentSavings: 0,
      timeframeYears: 2,
      annualReturn: 3,
      compoundingFrequency: '12',
    });
    const monthly = result.monthlyContribution as number;
    expect(monthly).toBeGreaterThan(0);
    expect(monthly).toBeLessThan(50); // less than $42/mo without interest
  });

  // ─── Test 13: Very high current savings exceeds goal with growth ───
  it('returns zero contribution when current savings grow beyond target', () => {
    const result = calculateSavingsGoal({
      targetAmount: 20000,
      currentSavings: 18000,
      timeframeYears: 5,
      annualReturn: 8,
      compoundingFrequency: '12',
    });
    // $18K at 8% for 5 years ≈ $26,800 — well above $20K
    expect(result.monthlyContribution).toBe(0);
    expect(result.totalContributions).toBe(0);
  });

  // ─── Test 14: Summary contains all required labels ───
  it('returns summary with all required labels', () => {
    const result = calculateSavingsGoal({
      targetAmount: 50000,
      currentSavings: 5000,
      timeframeYears: 10,
      annualReturn: 6,
      compoundingFrequency: '12',
    });
    const summary = result.summary as Array<{ label: string; value: number }>;
    const labels = summary.map(s => s.label);
    expect(labels).toContain('Monthly Savings Needed');
    expect(labels).toContain('Total Contributions');
    expect(labels).toContain('Interest Earned');
    expect(labels).toContain('Current Savings');
    expect(labels).toContain('Savings Goal');
    expect(summary).toHaveLength(5);
  });

  // ─── Test 15: Growth over time chart data ───
  it('returns growth over time array with correct length', () => {
    const result = calculateSavingsGoal({
      targetAmount: 50000,
      currentSavings: 5000,
      timeframeYears: 10,
      annualReturn: 6,
      compoundingFrequency: '12',
    });
    const growthOverTime = result.growthOverTime as Array<{ year: number; balance: number; contributions: number }>;
    expect(growthOverTime).toHaveLength(11); // year 0 through year 10
    expect(growthOverTime[0].year).toBe(0);
    expect(growthOverTime[0].balance).toBe(5000);
    expect(growthOverTime[10].year).toBe(10);
    // Final balance should be close to target
    expect(growthOverTime[10].balance).toBeCloseTo(50000, -2);
  });

  // ─── Test 16: Total interest = target - currentSavings - totalContributions ───
  it('total interest equals target minus current savings minus contributions', () => {
    const result = calculateSavingsGoal({
      targetAmount: 50000,
      currentSavings: 5000,
      timeframeYears: 10,
      annualReturn: 6,
      compoundingFrequency: '12',
    });
    const totalInterest = result.totalInterestEarned as number;
    const totalContrib = result.totalContributions as number;
    expect(totalInterest).toBeCloseTo(50000 - 5000 - totalContrib, 0);
  });
});
