import { calculateDownPayment } from '@/lib/formulas/finance/down-payment';

describe('calculateDownPayment', () => {
  // ─── Test 1: Standard 20% down payment calculation ───
  it('calculates 20% down payment amount correctly', () => {
    const result = calculateDownPayment({
      homePrice: 400000,
      downPaymentPercent: 20,
      currentSavings: 15000,
      monthlySavings: 1000,
      savingsRate: 4.5,
    });
    expect(result.downPaymentAmount).toBe(80000);
    expect(result.amountStillNeeded).toBe(65000);
  });

  // ─── Test 2: Months to goal with interest ───
  it('calculates months to goal with savings growth', () => {
    const result = calculateDownPayment({
      homePrice: 400000,
      downPaymentPercent: 20,
      currentSavings: 15000,
      monthlySavings: 1000,
      savingsRate: 4.5,
    });
    // ~56 months to save $80k from $15k at $1k/mo with 4.5% APY
    expect(result.monthsToGoal).toBeGreaterThan(50);
    expect(result.monthsToGoal).toBeLessThan(65);
  });

  // ─── Test 3: Goal already reached ───
  it('returns zero months when current savings exceed target', () => {
    const result = calculateDownPayment({
      homePrice: 200000,
      downPaymentPercent: 10,
      currentSavings: 25000,
      monthlySavings: 500,
      savingsRate: 4,
    });
    // Target: $20,000 — already have $25,000
    expect(result.downPaymentAmount).toBe(20000);
    expect(result.amountStillNeeded).toBe(0);
    expect(result.monthsToGoal).toBe(0);
    expect(result.estimatedDate).toBe('Goal already reached');
  });

  // ─── Test 4: Zero home price returns empty results ───
  it('returns zeros for zero home price', () => {
    const result = calculateDownPayment({
      homePrice: 0,
      downPaymentPercent: 20,
      currentSavings: 10000,
      monthlySavings: 500,
      savingsRate: 4,
    });
    expect(result.downPaymentAmount).toBe(0);
    expect(result.monthsToGoal).toBe(0);
    expect(result.estimatedDate).toBe('N/A');
  });

  // ─── Test 5: PMI impact when down payment < 20% ───
  it('calculates PMI when down payment is below 20%', () => {
    const result = calculateDownPayment({
      homePrice: 400000,
      downPaymentPercent: 10,
      currentSavings: 40000,
      monthlySavings: 0,
      savingsRate: 0,
    });
    // Loan = $360,000, PMI at 0.7%/year = $360,000 * 0.007 / 12 = $210/month
    expect(result.downPaymentAmount).toBe(40000);
    expect(result.pmiImpact).toBeCloseTo(210, 0);
  });

  // ─── Test 6: No PMI when down payment >= 20% ───
  it('shows zero PMI when down payment is 20% or more', () => {
    const result = calculateDownPayment({
      homePrice: 400000,
      downPaymentPercent: 20,
      currentSavings: 80000,
      monthlySavings: 0,
      savingsRate: 0,
    });
    expect(result.pmiImpact).toBe(0);
  });

  // ─── Test 7: Zero savings rate — simple division ───
  it('calculates months correctly with zero savings rate', () => {
    const result = calculateDownPayment({
      homePrice: 300000,
      downPaymentPercent: 20,
      currentSavings: 0,
      monthlySavings: 1000,
      savingsRate: 0,
    });
    // $60,000 target / $1,000/month = 60 months
    expect(result.downPaymentAmount).toBe(60000);
    expect(result.monthsToGoal).toBe(60);
  });

  // ─── Test 8: Savings projection chart data ───
  it('returns savings projection chart data starting from month 0', () => {
    const result = calculateDownPayment({
      homePrice: 200000,
      downPaymentPercent: 20,
      currentSavings: 10000,
      monthlySavings: 1000,
      savingsRate: 4,
    });
    const projection = result.savingsProjection as Array<{
      month: number;
      balance: number;
      target: number;
    }>;
    expect(projection.length).toBeGreaterThan(1);
    expect(projection[0].month).toBe(0);
    expect(projection[0].balance).toBe(10000);
    expect(projection[0].target).toBe(40000);
  });

  // ─── Test 9: Zero monthly savings with savings rate — interest only ───
  it('calculates months using interest only when no monthly contribution', () => {
    const result = calculateDownPayment({
      homePrice: 200000,
      downPaymentPercent: 20,
      currentSavings: 30000,
      monthlySavings: 0,
      savingsRate: 5,
    });
    // Target: $40,000. $30,000 at 5% APY needs interest growth only.
    // n = ln(40000/30000) / ln(1 + 0.05/12) ≈ 69 months
    expect(result.monthsToGoal).toBeGreaterThan(60);
    expect(result.monthsToGoal).toBeLessThan(80);
  });

  // ─── Test 10: No savings and no contributions — unreachable ───
  it('returns zero months for unreachable goal (no savings, no contributions)', () => {
    const result = calculateDownPayment({
      homePrice: 300000,
      downPaymentPercent: 20,
      currentSavings: 0,
      monthlySavings: 0,
      savingsRate: 5,
    });
    // Can't reach $60,000 from $0 with no contributions, even with interest
    expect(result.monthsToGoal).toBe(0);
    expect(result.estimatedDate).toBe('Not reachable with current savings rate');
  });

  // ─── Test 11: Summary contains all required labels ───
  it('returns summary with all expected labels', () => {
    const result = calculateDownPayment({
      homePrice: 400000,
      downPaymentPercent: 20,
      currentSavings: 15000,
      monthlySavings: 1000,
      savingsRate: 4.5,
    });
    const summary = result.summary as Array<{ label: string; value: number | string }>;
    const labels = summary.map(s => s.label);
    expect(labels).toContain('Home Price');
    expect(labels).toContain('Down Payment Required');
    expect(labels).toContain('Down Payment Percentage');
    expect(labels).toContain('Current Savings');
    expect(labels).toContain('Amount Still Needed');
    expect(labels).toContain('Loan Amount');
  });

  // ─── Test 12: FHA minimum 3.5% down payment ───
  it('calculates 3.5% FHA down payment correctly', () => {
    const result = calculateDownPayment({
      homePrice: 400000,
      downPaymentPercent: 3.5,
      currentSavings: 15000,
      monthlySavings: 1000,
      savingsRate: 4.5,
    });
    // Target: $14,000 — already have $15,000
    expect(result.downPaymentAmount).toBe(14000);
    expect(result.amountStillNeeded).toBe(0);
    expect(result.monthsToGoal).toBe(0);
    // PMI should be applied since < 20%
    expect(result.pmiImpact).toBeGreaterThan(0);
  });

  // ─── Test 13: Estimated date format ───
  it('returns a valid estimated date when goal is reachable', () => {
    const result = calculateDownPayment({
      homePrice: 300000,
      downPaymentPercent: 20,
      currentSavings: 10000,
      monthlySavings: 2000,
      savingsRate: 4,
    });
    const estimatedDate = result.estimatedDate as string;
    // Should be a month + year string like "March 2028"
    expect(estimatedDate).toMatch(
      /^(January|February|March|April|May|June|July|August|September|October|November|December) \d{4}$/
    );
  });

  // ─── Test 14: Higher savings rate reduces months to goal ───
  it('higher savings rate reduces the time to goal', () => {
    const baseInputs = {
      homePrice: 400000,
      downPaymentPercent: 20,
      currentSavings: 15000,
      monthlySavings: 1000,
    };

    const lowRate = calculateDownPayment({ ...baseInputs, savingsRate: 1 });
    const highRate = calculateDownPayment({ ...baseInputs, savingsRate: 5 });

    expect(Number(highRate.monthsToGoal)).toBeLessThan(Number(lowRate.monthsToGoal));
  });

  // ─── Test 15: 100% down payment ───
  it('handles 100% down payment correctly', () => {
    const result = calculateDownPayment({
      homePrice: 300000,
      downPaymentPercent: 100,
      currentSavings: 50000,
      monthlySavings: 5000,
      savingsRate: 4,
    });
    expect(result.downPaymentAmount).toBe(300000);
    expect(result.amountStillNeeded).toBe(250000);
    expect(result.pmiImpact).toBe(0); // no loan, no PMI
  });
});
