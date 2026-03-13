import { calculateCreditUtilization } from '@/lib/formulas/finance/credit-utilization';

describe('calculateCreditUtilization', () => {
  // ─── Test 1: Typical usage — $20K limit, $5K balance ───
  it('calculates 25% utilization as Good', () => {
    const result = calculateCreditUtilization({
      totalCreditLimit: 20000,
      totalBalances: 5000,
      targetUtilization: 30,
    });
    expect(result.utilizationRatio).toBe(25);
    expect(result.ratingCategory).toBe('Good');
    expect(result.availableCredit).toBe(15000);
  });

  // ─── Test 2: Zero balance → 0% Excellent ───
  it('returns 0% Excellent for zero balance', () => {
    const result = calculateCreditUtilization({
      totalCreditLimit: 30000,
      totalBalances: 0,
      targetUtilization: 30,
    });
    expect(result.utilizationRatio).toBe(0);
    expect(result.ratingCategory).toBe('Excellent');
    expect(result.availableCredit).toBe(30000);
    expect(result.amountToPayDown).toBe(0);
  });

  // ─── Test 3: Maxed out → 100% Very Poor ───
  it('returns 100% Very Poor for maxed-out cards', () => {
    const result = calculateCreditUtilization({
      totalCreditLimit: 10000,
      totalBalances: 10000,
      targetUtilization: 30,
    });
    expect(result.utilizationRatio).toBe(100);
    expect(result.ratingCategory).toBe('Very Poor');
    expect(result.availableCredit).toBe(0);
  });

  // ─── Test 4: Over limit (balance > limit) ───
  it('handles over-limit balances correctly', () => {
    const result = calculateCreditUtilization({
      totalCreditLimit: 10000,
      totalBalances: 12000,
      targetUtilization: 30,
    });
    expect(result.utilizationRatio).toBe(120);
    expect(result.ratingCategory).toBe('Very Poor');
    expect(result.availableCredit).toBe(0);
    // Should need to pay down to target: 10000 * 0.30 = 3000, so pay 12000 - 3000 = 9000
    expect(result.amountToPayDown).toBe(9000);
  });

  // ─── Test 5: Exact boundary — 10% ───
  it('returns Good at exactly 10% utilization', () => {
    const result = calculateCreditUtilization({
      totalCreditLimit: 10000,
      totalBalances: 1000,
      targetUtilization: 30,
    });
    expect(result.utilizationRatio).toBe(10);
    expect(result.ratingCategory).toBe('Good');
  });

  // ─── Test 6: Exact boundary — 30% ───
  it('returns Fair at exactly 30% utilization', () => {
    const result = calculateCreditUtilization({
      totalCreditLimit: 10000,
      totalBalances: 3000,
      targetUtilization: 30,
    });
    expect(result.utilizationRatio).toBe(30);
    expect(result.ratingCategory).toBe('Fair');
  });

  // ─── Test 7: Exact boundary — 50% ───
  it('returns Poor at exactly 50% utilization', () => {
    const result = calculateCreditUtilization({
      totalCreditLimit: 10000,
      totalBalances: 5000,
      targetUtilization: 30,
    });
    expect(result.utilizationRatio).toBe(50);
    expect(result.ratingCategory).toBe('Poor');
  });

  // ─── Test 8: Exact boundary — 75% ───
  it('returns Very Poor at exactly 75% utilization', () => {
    const result = calculateCreditUtilization({
      totalCreditLimit: 10000,
      totalBalances: 7500,
      targetUtilization: 30,
    });
    expect(result.utilizationRatio).toBe(75);
    expect(result.ratingCategory).toBe('Very Poor');
  });

  // ─── Test 9: Target utilization calculation ───
  it('calculates target balance and pay-down amount correctly', () => {
    const result = calculateCreditUtilization({
      totalCreditLimit: 20000,
      totalBalances: 8000,
      targetUtilization: 30,
    });
    // Target balance = 20000 * 0.30 = $6,000
    expect(result.targetBalance).toBe(6000);
    // Amount to pay down = 8000 - 6000 = $2,000
    expect(result.amountToPayDown).toBe(2000);
  });

  // ─── Test 10: Zero credit limit (division by zero edge case) ───
  it('handles zero credit limit gracefully', () => {
    const result = calculateCreditUtilization({
      totalCreditLimit: 0,
      totalBalances: 5000,
      targetUtilization: 30,
    });
    expect(result.utilizationRatio).toBe(0);
    expect(result.ratingCategory).toBe('N/A');
    expect(result.availableCredit).toBe(0);
  });

  // ─── Test 11: Large limits ($100K+) ───
  it('handles large credit limits correctly', () => {
    const result = calculateCreditUtilization({
      totalCreditLimit: 150000,
      totalBalances: 12000,
      targetUtilization: 10,
    });
    expect(result.utilizationRatio).toBe(8);
    expect(result.ratingCategory).toBe('Excellent');
    expect(result.availableCredit).toBe(138000);
    // Target balance = 150000 * 0.10 = 15000
    expect(result.targetBalance).toBe(15000);
    // Already below target, so no pay-down needed
    expect(result.amountToPayDown).toBe(0);
  });

  // ─── Test 12: Verify ratingCategory categories ───
  it('assigns correct categories across the full range', () => {
    const check = (limit: number, balance: number) => {
      const r = calculateCreditUtilization({ totalCreditLimit: limit, totalBalances: balance, targetUtilization: 30 });
      return r.ratingCategory;
    };
    expect(check(10000, 500)).toBe('Excellent');   // 5%
    expect(check(10000, 1500)).toBe('Good');       // 15%
    expect(check(10000, 3500)).toBe('Fair');       // 35%
    expect(check(10000, 6000)).toBe('Poor');       // 60%
    expect(check(10000, 9000)).toBe('Very Poor');  // 90%
  });

  // ─── Test 13: Verify amountToPayDown is non-negative ───
  it('amountToPayDown is never negative', () => {
    // Balance already below target
    const result = calculateCreditUtilization({
      totalCreditLimit: 20000,
      totalBalances: 2000,
      targetUtilization: 30,
    });
    expect(Number(result.amountToPayDown)).toBeGreaterThanOrEqual(0);
    expect(result.amountToPayDown).toBe(0);
  });

  // ─── Test 14: Pie chart breakdown ───
  it('returns utilizationBreakdown with Used and Available', () => {
    const result = calculateCreditUtilization({
      totalCreditLimit: 20000,
      totalBalances: 5000,
      targetUtilization: 30,
    });
    const breakdown = result.utilizationBreakdown as Array<{ name: string; value: number }>;
    expect(breakdown).toHaveLength(2);
    expect(breakdown[0].name).toBe('Used');
    expect(breakdown[0].value).toBe(5000);
    expect(breakdown[1].name).toBe('Available');
    expect(breakdown[1].value).toBe(15000);
  });

  // ─── Test 15: Summary labels check ───
  it('returns summary with all required labels', () => {
    const result = calculateCreditUtilization({
      totalCreditLimit: 20000,
      totalBalances: 5000,
      targetUtilization: 30,
    });
    const summary = result.summary as Array<{ label: string; value: number | string }>;
    const labels = summary.map(s => s.label);
    expect(labels).toContain('Total Credit Limit');
    expect(labels).toContain('Total Balances');
    expect(labels).toContain('Utilization Ratio');
    expect(labels).toContain('Credit Impact Rating');
    expect(labels).toContain('Available Credit');
    expect(labels).toContain('Target Balance');
    expect(labels).toContain('Amount to Pay Down');
  });

  // ─── Test 16: Just under Excellent boundary (9.9%) ───
  it('returns Excellent at 9.9% utilization', () => {
    const result = calculateCreditUtilization({
      totalCreditLimit: 10000,
      totalBalances: 990,
      targetUtilization: 30,
    });
    expect(result.utilizationRatio).toBe(9.9);
    expect(result.ratingCategory).toBe('Excellent');
  });
});
