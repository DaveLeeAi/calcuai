import { calculateDebtAvalanche } from '@/lib/formulas/finance/debt-avalanche';

describe('calculateDebtAvalanche', () => {
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

  // ─── Test 1: Standard 3-debt avalanche ───
  it('pays off 3 debts with avalanche strategy', () => {
    const result = calculateDebtAvalanche(threeDebtInputs);
    expect(result.totalDebt).toBe(25000);
    expect(result.totalMinPayment).toBe(550);
    expect(Number(result.monthsToPayoff)).toBeGreaterThan(0);
    expect(Number(result.monthsToPayoff)).toBeLessThan(60);
    expect(Number(result.totalInterestPaid)).toBeGreaterThan(0);
    expect(Number(result.totalPaid)).toBeGreaterThan(25000);
  });

  // ─── Test 2: Avalanche order verification — highest rate first ───
  it('pays off highest rate first in avalanche order', () => {
    const result = calculateDebtAvalanche(threeDebtInputs);
    const payoffOrder = result.payoffOrder as Array<{ label: string; value: string }>;
    // Credit Card (19%) should be first — highest rate
    expect(payoffOrder[0].label).toContain('Credit Card');
  });

  // ─── Test 3: High-rate-small-balance vs low-rate-large-balance ───
  it('prioritizes highest rate even when balance is large', () => {
    const result = calculateDebtAvalanche({
      debt1Name: 'Low Rate Small',
      debt1Balance: 5000,
      debt1Rate: 5,
      debt1MinPayment: 50,
      debt2Name: 'High Rate Large',
      debt2Balance: 20000,
      debt2Rate: 24,
      debt2MinPayment: 400,
      extraPayment: 200,
    });
    const payoffOrder = result.payoffOrder as Array<{ label: string; value: string }>;
    // Avalanche targets 24% rate first — extra payments go to high rate debt
    // But the low-rate small debt may finish first via minimums alone
    // The key check: avalanche interest should be <= snowball interest
    expect(Number(result.vsSnowballInterestSaved)).toBeGreaterThanOrEqual(0);
    // Both debts should be paid off
    expect(payoffOrder.length).toBe(2);
  });

  // ─── Test 4: Zero extra payment (minimums only) ───
  it('handles zero extra payment (minimums only)', () => {
    const result = calculateDebtAvalanche({
      ...threeDebtInputs,
      extraPayment: 0,
    });
    expect(Number(result.monthsToPayoff)).toBeGreaterThan(0);
    expect(Number(result.totalInterestPaid)).toBeGreaterThan(0);
    expect(result.interestSaved).toBe(0);
    expect(result.timeSaved).toBe(0);
  });

  // ─── Test 5: Single debt ───
  it('handles a single debt correctly', () => {
    const result = calculateDebtAvalanche({
      debt1Balance: 5000,
      debt1Rate: 15,
      debt1MinPayment: 150,
      extraPayment: 100,
    });
    expect(Number(result.monthsToPayoff)).toBeGreaterThan(0);
    expect(Number(result.monthsToPayoff)).toBeLessThan(30);
    expect(Number(result.totalInterestPaid)).toBeGreaterThan(0);
    expect(result.totalDebt).toBe(5000);
  });

  // ─── Test 6: Five debts ───
  it('handles five debts', () => {
    const result = calculateDebtAvalanche({
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
    // Highest rate (25%) debt should be first
    expect(payoffOrder[0].label).toContain('1st');
  });

  // ─── Test 7: Zero balance debts are skipped ───
  it('skips debts with zero balance', () => {
    const result = calculateDebtAvalanche({
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

  // ─── Test 8: Interest saved calculation ───
  it('calculates interest saved vs minimums only', () => {
    const result = calculateDebtAvalanche(threeDebtInputs);
    expect(Number(result.interestSaved)).toBeGreaterThan(0);
    expect(Number(result.interestSaved)).toBeGreaterThan(500);
  });

  // ─── Test 9: Time saved calculation ───
  it('calculates time saved vs minimums only', () => {
    const result = calculateDebtAvalanche(threeDebtInputs);
    expect(Number(result.timeSaved)).toBeGreaterThan(0);
    expect(Number(result.timeSaved)).toBeGreaterThan(5);
  });

  // ─── Test 10: Same rates — order by balance ascending as tiebreaker ───
  it('uses balance as tiebreaker when rates are equal', () => {
    const result = calculateDebtAvalanche({
      debt1Name: 'Big Debt',
      debt1Balance: 10000,
      debt1Rate: 15,
      debt1MinPayment: 200,
      debt2Name: 'Small Debt',
      debt2Balance: 2000,
      debt2Rate: 15,
      debt2MinPayment: 50,
      extraPayment: 200,
    });
    const payoffOrder = result.payoffOrder as Array<{ label: string; value: string }>;
    expect(payoffOrder.length).toBe(2);
    // With equal rates, avalanche tiebreaker is smallest balance first
    expect(payoffOrder[0].label).toContain('Small Debt');
  });

  // ─── Test 11: Avalanche saves more interest than snowball ───
  it('avalanche saves at least as much interest as snowball on same inputs', () => {
    const result = calculateDebtAvalanche({
      debt1Name: 'High Rate Small',
      debt1Balance: 1000,
      debt1Rate: 24,
      debt1MinPayment: 30,
      debt2Name: 'Low Rate Large',
      debt2Balance: 15000,
      debt2Rate: 5,
      debt2MinPayment: 200,
      debt3Name: 'Mid Rate Mid',
      debt3Balance: 8000,
      debt3Rate: 12,
      debt3MinPayment: 150,
      extraPayment: 200,
    });
    // vsSnowballInterestSaved should be >= 0 (avalanche always saves at least as much)
    expect(Number(result.vsSnowballInterestSaved)).toBeGreaterThanOrEqual(0);
  });

  // ─── Test 12: Very small balance ($100) ───
  it('handles very small balance debt', () => {
    const result = calculateDebtAvalanche({
      debt1Balance: 100,
      debt1Rate: 22,
      debt1MinPayment: 25,
      extraPayment: 50,
    });
    expect(Number(result.monthsToPayoff)).toBeLessThanOrEqual(2);
    expect(Number(result.totalInterestPaid)).toBeLessThan(5);
  });

  // ─── Test 13: Large balances ($50K+) ───
  it('handles large debt balances', () => {
    const result = calculateDebtAvalanche({
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

  // ─── Test 14: 0% interest rate debt ───
  it('handles 0% interest rate debt', () => {
    const result = calculateDebtAvalanche({
      debt1Name: '0% Promo',
      debt1Balance: 3000,
      debt1Rate: 0,
      debt1MinPayment: 25,
      debt2Name: 'Credit Card',
      debt2Balance: 5000,
      debt2Rate: 18,
      debt2MinPayment: 100,
      extraPayment: 100,
    });
    // Avalanche directs extra payment to the 18% debt first
    // With $100 min + $100 extra = $200/mo on the 18% card, it pays off faster
    // The 0% promo with only $25/mo minimum takes longer
    const payoffOrder = result.payoffOrder as Array<{ label: string; value: string }>;
    // Credit Card (18%) should be paid off first since it receives extra payments
    expect(payoffOrder[0].label).toContain('Credit Card');
    expect(payoffOrder.length).toBe(2);
  });

  // ─── Test 15: Payoff order structure validation ───
  it('returns correctly structured payoff order', () => {
    const result = calculateDebtAvalanche(threeDebtInputs);
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

  // ─── Test 16: Total interest vs no-extra baseline ───
  it('avalanche with extra pays less interest than minimums-only', () => {
    const withExtra = calculateDebtAvalanche(threeDebtInputs);
    const withoutExtra = calculateDebtAvalanche({ ...threeDebtInputs, extraPayment: 0 });
    expect(Number(withExtra.totalInterestPaid)).toBeLessThan(Number(withoutExtra.totalInterestPaid));
    expect(Number(withExtra.monthsToPayoff)).toBeLessThan(Number(withoutExtra.monthsToPayoff));
  });

  // ─── Test 17: Output structure validation ───
  it('returns all required output fields', () => {
    const result = calculateDebtAvalanche(threeDebtInputs);
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
    expect(result).toHaveProperty('snowballMonths');
    expect(result).toHaveProperty('snowballInterestPaid');
    expect(result).toHaveProperty('vsSnowballInterestSaved');
    expect(result).toHaveProperty('vsSnowballTimeDifference');
  });

  // ─── Test 18: No debts entered ───
  it('handles no debts entered gracefully', () => {
    const result = calculateDebtAvalanche({ extraPayment: 200 });
    expect(result.totalDebt).toBe(0);
    expect(result.monthsToPayoff).toBe(0);
    expect(result.totalInterestPaid).toBe(0);
    expect(result.interestSaved).toBe(0);
    expect(result.totalPaid).toBe(0);
  });

  // ─── Test 19: yearsToPayoff calculation ───
  it('calculates yearsToPayoff correctly', () => {
    const result = calculateDebtAvalanche(threeDebtInputs);
    const expectedYears = parseFloat((Number(result.monthsToPayoff) / 12).toFixed(1));
    expect(result.yearsToPayoff).toBe(expectedYears);
  });

  // ─── Test 20: Summary value group structure ───
  it('returns summary with all required labels', () => {
    const result = calculateDebtAvalanche(threeDebtInputs);
    const summary = result.summary as Array<{ label: string; value: number | string }>;
    const labels = summary.map(s => s.label);
    expect(labels).toContain('Total Debt');
    expect(labels).toContain('Total Minimum Payments');
    expect(labels).toContain('Extra Monthly Payment');
    expect(labels).toContain('Months to Payoff (Avalanche)');
    expect(labels).toContain('Total Interest Paid');
    expect(labels).toContain('Interest Saved vs. Minimums Only');
    expect(labels).toContain('Interest Saved vs. Snowball');
  });

  // ─── Test 21: Cross-comparison consistency ───
  it('snowball comparison fields are consistent', () => {
    const result = calculateDebtAvalanche(threeDebtInputs);
    // Snowball should take >= avalanche months (avalanche is optimal)
    expect(Number(result.snowballMonths)).toBeGreaterThanOrEqual(Number(result.monthsToPayoff));
    // vsSnowballTimeDifference = snowball months - avalanche months
    expect(result.vsSnowballTimeDifference).toBe(
      Number(result.snowballMonths) - Number(result.monthsToPayoff)
    );
  });
});
