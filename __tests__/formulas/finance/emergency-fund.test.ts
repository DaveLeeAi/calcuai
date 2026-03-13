import { calculateEmergencyFund } from '@/lib/formulas/finance/emergency-fund';

describe('calculateEmergencyFund', () => {
  // ─── Test 1: Standard case — $4,500/month, 6 months, $5,000 saved, $500/month ───
  it('calculates standard emergency fund correctly', () => {
    const result = calculateEmergencyFund({
      monthlyExpenses: 4500,
      monthsOfCoverage: '6',
      currentSavings: 5000,
      monthlySavingsContribution: 500,
    });
    // Target = 4500 × 6 = $27,000
    expect(result.targetFund).toBe(27000);
    // Gap = 27000 - 5000 = $22,000
    expect(result.currentGap).toBe(22000);
    // Months = ceil(22000 / 500) = 44
    expect(result.monthsToGoal).toBe(44);
  });

  // ─── Test 2: Already funded ───
  it('handles already funded case', () => {
    const result = calculateEmergencyFund({
      monthlyExpenses: 3000,
      monthsOfCoverage: '3',
      currentSavings: 10000,
      monthlySavingsContribution: 500,
    });
    // Target = 3000 × 3 = $9,000
    expect(result.targetFund).toBe(9000);
    expect(result.currentGap).toBe(0);
    expect(result.monthsToGoal).toBe(0);
    const percentFunded = result.percentFunded as number;
    expect(percentFunded).toBe(100);
  });

  // ─── Test 3: No savings, starting from zero ───
  it('calculates from zero savings', () => {
    const result = calculateEmergencyFund({
      monthlyExpenses: 4000,
      monthsOfCoverage: '6',
      currentSavings: 0,
      monthlySavingsContribution: 400,
    });
    // Target = 4000 × 6 = $24,000
    expect(result.targetFund).toBe(24000);
    // Gap = $24,000
    expect(result.currentGap).toBe(24000);
    // Months = ceil(24000 / 400) = 60
    expect(result.monthsToGoal).toBe(60);
  });

  // ─── Test 4: No monthly contribution ───
  it('handles zero monthly contribution', () => {
    const result = calculateEmergencyFund({
      monthlyExpenses: 4000,
      monthsOfCoverage: '6',
      currentSavings: 5000,
      monthlySavingsContribution: 0,
    });
    expect(result.currentGap).toBe(19000);
    // monthsToGoal = -1 (not saving)
    expect(result.monthsToGoal).toBe(-1);
  });

  // ─── Test 5: 3 months coverage ───
  it('calculates 3-month coverage target', () => {
    const result = calculateEmergencyFund({
      monthlyExpenses: 5000,
      monthsOfCoverage: '3',
      currentSavings: 0,
      monthlySavingsContribution: 1000,
    });
    expect(result.targetFund).toBe(15000);
    expect(result.monthsToGoal).toBe(15);
  });

  // ─── Test 6: 12 months coverage ───
  it('calculates 12-month coverage target', () => {
    const result = calculateEmergencyFund({
      monthlyExpenses: 5000,
      monthsOfCoverage: '12',
      currentSavings: 0,
      monthlySavingsContribution: 1000,
    });
    expect(result.targetFund).toBe(60000);
    expect(result.monthsToGoal).toBe(60);
  });

  // ─── Test 7: Zero expenses ───
  it('handles zero expenses', () => {
    const result = calculateEmergencyFund({
      monthlyExpenses: 0,
      monthsOfCoverage: '6',
      currentSavings: 5000,
      monthlySavingsContribution: 500,
    });
    expect(result.targetFund).toBe(0);
    expect(result.currentGap).toBe(0);
    expect(result.monthsToGoal).toBe(0);
  });

  // ─── Test 8: Percent funded calculation ───
  it('calculates percent funded correctly', () => {
    const result = calculateEmergencyFund({
      monthlyExpenses: 5000,
      monthsOfCoverage: '6',
      currentSavings: 15000,
      monthlySavingsContribution: 500,
    });
    // Target = $30,000, savings = $15,000
    // Percent = 15000 / 30000 × 100 = 50%
    expect(result.percentFunded).toBeCloseTo(50, 1);
  });

  // ─── Test 9: Over-funded — savings exceed target ───
  it('handles over-funded case', () => {
    const result = calculateEmergencyFund({
      monthlyExpenses: 3000,
      monthsOfCoverage: '3',
      currentSavings: 20000,
      monthlySavingsContribution: 500,
    });
    // Target = $9,000, savings = $20,000
    expect(result.currentGap).toBe(0);
    expect(result.monthsToGoal).toBe(0);
    expect(result.percentFunded).toBe(100);
  });

  // ─── Test 10: Savings progress array ───
  it('generates savings progress starting at current savings', () => {
    const result = calculateEmergencyFund({
      monthlyExpenses: 2000,
      monthsOfCoverage: '3',
      currentSavings: 1000,
      monthlySavingsContribution: 500,
    });
    // Target = $6,000, gap = $5,000, months = 10
    const progress = result.savingsProgress as Array<{
      month: number;
      savings: number;
      target: number;
    }>;
    expect(progress.length).toBeGreaterThan(0);
    expect(progress[0].month).toBe(0);
    expect(progress[0].savings).toBe(1000);
    // Last entry should reach the target
    const lastEntry = progress[progress.length - 1];
    expect(lastEntry.savings).toBe(6000);
  });

  // ─── Test 11: Summary labels present ───
  it('returns summary with all required labels', () => {
    const result = calculateEmergencyFund({
      monthlyExpenses: 4500,
      monthsOfCoverage: '6',
      currentSavings: 5000,
      monthlySavingsContribution: 500,
    });
    const summary = result.summary as Array<{ label: string; value: number | string }>;
    const labels = summary.map(s => s.label);
    expect(labels).toContain('Target Emergency Fund');
    expect(labels).toContain('Monthly Expenses');
    expect(labels).toContain('Months of Coverage');
    expect(labels).toContain('Current Savings');
    expect(labels).toContain('Amount Needed');
    expect(labels).toContain('Progress');
    expect(labels).toContain('Monthly Savings');
    expect(labels).toContain('Months to Goal');
  });

  // ─── Test 12: Large numbers — $15,000/month, 12 months ───
  it('handles large expense amounts', () => {
    const result = calculateEmergencyFund({
      monthlyExpenses: 15000,
      monthsOfCoverage: '12',
      currentSavings: 10000,
      monthlySavingsContribution: 2000,
    });
    // Target = 15000 × 12 = $180,000
    expect(result.targetFund).toBe(180000);
    // Gap = 180000 - 10000 = $170,000
    expect(result.currentGap).toBe(170000);
    // Months = ceil(170000 / 2000) = 85
    expect(result.monthsToGoal).toBe(85);
  });

  // ─── Test 13: 9 months coverage ───
  it('calculates 9-month coverage target', () => {
    const result = calculateEmergencyFund({
      monthlyExpenses: 4000,
      monthsOfCoverage: '9',
      currentSavings: 0,
      monthlySavingsContribution: 1000,
    });
    expect(result.targetFund).toBe(36000);
    expect(result.monthsToGoal).toBe(36);
  });

  // ─── Test 14: Gap exactly equals one month of savings ───
  it('handles gap equal to one monthly contribution', () => {
    const result = calculateEmergencyFund({
      monthlyExpenses: 1000,
      monthsOfCoverage: '3',
      currentSavings: 2500,
      monthlySavingsContribution: 500,
    });
    // Target = $3,000, gap = $500, months = 1
    expect(result.targetFund).toBe(3000);
    expect(result.currentGap).toBe(500);
    expect(result.monthsToGoal).toBe(1);
  });
});
