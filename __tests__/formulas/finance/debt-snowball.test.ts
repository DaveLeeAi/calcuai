import { calculateDebtSnowball } from '@/lib/formulas/finance/debt-snowball';

describe('calculateDebtSnowball', () => {
  // ─── Standard 3-debt scenario ───
  const threeDebtInputs = {
    debt1Name: 'Credit Card',
    debt1Balance: 2000,
    debt1Rate: 19,
    debt1MinPayment: 50,
    debt2Name: 'Car Loan',
    debt2Balance: 8000,
    debt2Rate: 6,
    debt2MinPayment: 200,
    debt3Name: 'Student Loan',
    debt3Balance: 15000,
    debt3Rate: 5,
    debt3MinPayment: 300,
    extraPayment: 200,
  };

  // ─── Test 1: Standard 3-debt snowball ───
  it('pays off 3 debts with snowball strategy', () => {
    const result = calculateDebtSnowball(threeDebtInputs);
    expect(result.totalDebt).toBe(25000);
    expect(result.totalMinPayment).toBe(550);
    expect(Number(result.monthsToPayoff)).toBeGreaterThan(0);
    expect(Number(result.monthsToPayoff)).toBeLessThan(60);
    expect(Number(result.totalInterestPaid)).toBeGreaterThan(0);
    expect(Number(result.totalPaid)).toBeGreaterThan(25000);
  });

  // ─── Test 2: Snowball order verification — smallest balance first ───
  it('pays off smallest balance first in snowball order', () => {
    const result = calculateDebtSnowball(threeDebtInputs);
    const payoffOrder = result.payoffOrder as Array<{ label: string; value: string }>;
    // Credit Card ($2,000) should be first — smallest balance
    expect(payoffOrder[0].label).toContain('Credit Card');
    // Car Loan ($8,000) should be second
    expect(payoffOrder[1].label).toContain('Car Loan');
    // Student Loan ($15,000) should be third
    expect(payoffOrder[2].label).toContain('Student Loan');
  });

  // ─── Test 3: Zero extra payment (minimums only) ───
  it('handles zero extra payment (minimums only)', () => {
    const result = calculateDebtSnowball({
      ...threeDebtInputs,
      extraPayment: 0,
    });
    expect(Number(result.monthsToPayoff)).toBeGreaterThan(0);
    expect(Number(result.totalInterestPaid)).toBeGreaterThan(0);
    // No extra payment means no interest saved
    expect(result.interestSaved).toBe(0);
    expect(result.timeSaved).toBe(0);
  });

  // ─── Test 4: Single debt ───
  it('handles a single debt correctly', () => {
    const result = calculateDebtSnowball({
      debt1Balance: 5000,
      debt1Rate: 15,
      debt1MinPayment: 150,
      extraPayment: 100,
    });
    expect(Number(result.monthsToPayoff)).toBeGreaterThan(0);
    expect(Number(result.monthsToPayoff)).toBeLessThan(30);
    expect(Number(result.totalInterestPaid)).toBeGreaterThan(0);
    expect(result.totalDebt).toBe(5000);
    expect(result.totalMinPayment).toBe(150);
  });

  // ─── Test 5: Five debts ───
  it('handles five debts', () => {
    const result = calculateDebtSnowball({
      debt1Balance: 500,
      debt1Rate: 25,
      debt1MinPayment: 25,
      debt2Balance: 2000,
      debt2Rate: 18,
      debt2MinPayment: 50,
      debt3Balance: 5000,
      debt3Rate: 12,
      debt3MinPayment: 100,
      debt4Balance: 10000,
      debt4Rate: 7,
      debt4MinPayment: 200,
      debt5Balance: 20000,
      debt5Rate: 5,
      debt5MinPayment: 350,
      extraPayment: 300,
    });
    expect(result.totalDebt).toBe(37500);
    const payoffOrder = result.payoffOrder as Array<{ label: string; value: string }>;
    expect(payoffOrder.length).toBe(5);
    // Smallest balance ($500) should be first
    expect(payoffOrder[0].label).toContain('1st');
  });

  // ─── Test 6: Zero balance debts are skipped ───
  it('skips debts with zero balance', () => {
    const result = calculateDebtSnowball({
      debt1Balance: 3000,
      debt1Rate: 18,
      debt1MinPayment: 75,
      debt2Balance: 0,
      debt2Rate: 10,
      debt2MinPayment: 50,
      debt3Balance: 7000,
      debt3Rate: 8,
      debt3MinPayment: 150,
      extraPayment: 100,
    });
    expect(result.totalDebt).toBe(10000);
    const payoffOrder = result.payoffOrder as Array<{ label: string; value: string }>;
    expect(payoffOrder.length).toBe(2);
  });

  // ─── Test 7: High extra payment exceeds smallest debt ───
  it('handles extra payment larger than smallest debt', () => {
    const result = calculateDebtSnowball({
      debt1Balance: 100,
      debt1Rate: 20,
      debt1MinPayment: 25,
      debt2Balance: 10000,
      debt2Rate: 10,
      debt2MinPayment: 200,
      extraPayment: 500,
    });
    // $100 debt should be paid off in month 1
    const payoffOrder = result.payoffOrder as Array<{ label: string; value: string }>;
    expect(payoffOrder[0].value).toContain('Month 1');
  });

  // ─── Test 8: Interest saved calculation ───
  it('calculates interest saved vs minimums only', () => {
    const result = calculateDebtSnowball(threeDebtInputs);
    expect(Number(result.interestSaved)).toBeGreaterThan(0);
    // Interest saved should be reasonable (extra $200/mo on $25K debt)
    expect(Number(result.interestSaved)).toBeGreaterThan(500);
  });

  // ─── Test 9: Time saved calculation ───
  it('calculates time saved vs minimums only', () => {
    const result = calculateDebtSnowball(threeDebtInputs);
    expect(Number(result.timeSaved)).toBeGreaterThan(0);
    // Should save multiple months with $200 extra
    expect(Number(result.timeSaved)).toBeGreaterThan(5);
  });

  // ─── Test 10: All same balance — order stability ───
  it('handles all same balances gracefully', () => {
    const result = calculateDebtSnowball({
      debt1Name: 'Debt A',
      debt1Balance: 5000,
      debt1Rate: 10,
      debt1MinPayment: 100,
      debt2Name: 'Debt B',
      debt2Balance: 5000,
      debt2Rate: 15,
      debt2MinPayment: 100,
      debt3Name: 'Debt C',
      debt3Balance: 5000,
      debt3Rate: 20,
      debt3MinPayment: 100,
      extraPayment: 200,
    });
    expect(Number(result.monthsToPayoff)).toBeGreaterThan(0);
    const payoffOrder = result.payoffOrder as Array<{ label: string; value: string }>;
    expect(payoffOrder.length).toBe(3);
    // With same balances, snowball tiebreaker is highest rate first
    // After minimums reduce balances, the one with highest rate may have higher
    // balance due to interest — but on equal starting balance the tiebreaker sorts by rate desc
  });

  // ─── Test 11: Very small balance ($100) ───
  it('handles very small balance debt', () => {
    const result = calculateDebtSnowball({
      debt1Balance: 100,
      debt1Rate: 22,
      debt1MinPayment: 25,
      extraPayment: 50,
    });
    expect(Number(result.monthsToPayoff)).toBeLessThanOrEqual(2);
    expect(Number(result.totalInterestPaid)).toBeLessThan(5);
  });

  // ─── Test 12: Large balances ($50K+) ───
  it('handles large debt balances', () => {
    const result = calculateDebtSnowball({
      debt1Balance: 50000,
      debt1Rate: 6,
      debt1MinPayment: 500,
      debt2Balance: 75000,
      debt2Rate: 4.5,
      debt2MinPayment: 700,
      extraPayment: 500,
    });
    expect(Number(result.monthsToPayoff)).toBeGreaterThan(50);
    expect(Number(result.totalPaid)).toBeGreaterThan(125000);
    expect(result.totalDebt).toBe(125000);
  });

  // ─── Test 13: 0% interest rate debt ───
  it('handles 0% interest rate debt', () => {
    const result = calculateDebtSnowball({
      debt1Balance: 3000,
      debt1Rate: 0,
      debt1MinPayment: 100,
      debt2Balance: 5000,
      debt2Rate: 18,
      debt2MinPayment: 100,
      extraPayment: 100,
    });
    expect(Number(result.monthsToPayoff)).toBeGreaterThan(0);
    // Snowball targets $3K (0% rate) first since it has smaller balance
    const payoffOrder = result.payoffOrder as Array<{ label: string; value: string }>;
    expect(payoffOrder[0].label).toContain('1st');
  });

  // ─── Test 14: Payoff order structure validation ───
  it('returns correctly structured payoff order', () => {
    const result = calculateDebtSnowball(threeDebtInputs);
    const payoffOrder = result.payoffOrder as Array<{ label: string; value: string }>;
    expect(Array.isArray(payoffOrder)).toBe(true);
    expect(payoffOrder.length).toBe(3);
    for (const item of payoffOrder) {
      expect(item).toHaveProperty('label');
      expect(item).toHaveProperty('value');
      expect(typeof item.label).toBe('string');
      expect(typeof item.value).toBe('string');
    }
  });

  // ─── Test 15: Total interest vs no-extra baseline ───
  it('snowball with extra pays less interest than minimums-only', () => {
    const withExtra = calculateDebtSnowball(threeDebtInputs);
    const withoutExtra = calculateDebtSnowball({ ...threeDebtInputs, extraPayment: 0 });
    expect(Number(withExtra.totalInterestPaid)).toBeLessThan(Number(withoutExtra.totalInterestPaid));
    expect(Number(withExtra.monthsToPayoff)).toBeLessThan(Number(withoutExtra.monthsToPayoff));
  });

  // ─── Test 16: Output structure validation ───
  it('returns all required output fields', () => {
    const result = calculateDebtSnowball(threeDebtInputs);
    expect(result).toHaveProperty('totalDebt');
    expect(result).toHaveProperty('totalMinPayment');
    expect(result).toHaveProperty('monthsToPayoff');
    expect(result).toHaveProperty('yearsToPayoff');
    expect(result).toHaveProperty('totalInterestPaid');
    expect(result).toHaveProperty('totalPaid');
    expect(result).toHaveProperty('interestSaved');
    expect(result).toHaveProperty('timeSaved');
    expect(result).toHaveProperty('payoffOrder');
    expect(result).toHaveProperty('debtSummary');
    expect(result).toHaveProperty('summary');
    expect(result).toHaveProperty('avalancheMonths');
    expect(result).toHaveProperty('avalancheInterestPaid');
    expect(result).toHaveProperty('avalancheInterestDifference');
    expect(result).toHaveProperty('avalancheTimeDifference');
  });

  // ─── Test 17: No debts entered ───
  it('handles no debts entered gracefully', () => {
    const result = calculateDebtSnowball({ extraPayment: 200 });
    expect(result.totalDebt).toBe(0);
    expect(result.monthsToPayoff).toBe(0);
    expect(result.totalInterestPaid).toBe(0);
    expect(result.interestSaved).toBe(0);
    expect(result.totalPaid).toBe(0);
  });

  // ─── Test 18: Comparison fields with avalanche ───
  it('provides avalanche comparison data', () => {
    const result = calculateDebtSnowball(threeDebtInputs);
    expect(Number(result.avalancheMonths)).toBeGreaterThan(0);
    expect(Number(result.avalancheInterestPaid)).toBeGreaterThan(0);
    // Avalanche should save at least as much interest as snowball (typically more)
    expect(Number(result.avalancheInterestPaid)).toBeLessThanOrEqual(Number(result.totalInterestPaid));
  });

  // ─── Test 19: yearsToPayoff calculation ───
  it('calculates yearsToPayoff correctly', () => {
    const result = calculateDebtSnowball(threeDebtInputs);
    const expectedYears = parseFloat((Number(result.monthsToPayoff) / 12).toFixed(1));
    expect(result.yearsToPayoff).toBe(expectedYears);
  });

  // ─── Test 20: Summary value group structure ───
  it('returns summary with all required labels', () => {
    const result = calculateDebtSnowball(threeDebtInputs);
    const summary = result.summary as Array<{ label: string; value: number | string }>;
    const labels = summary.map(s => s.label);
    expect(labels).toContain('Total Debt');
    expect(labels).toContain('Total Minimum Payments');
    expect(labels).toContain('Extra Monthly Payment');
    expect(labels).toContain('Months to Payoff (Snowball)');
    expect(labels).toContain('Total Interest Paid');
    expect(labels).toContain('Interest Saved vs. Minimums Only');
    expect(labels).toContain('Avalanche Interest Difference');
  });
});
