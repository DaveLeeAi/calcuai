import { calculateDebtPayoff } from '@/lib/formulas/finance/debt-payoff';

describe('calculateDebtPayoff', () => {
  // ─── Test 1: Single debt — basic payoff with extra payment ───
  it('calculates payoff for a single debt with extra payment', () => {
    const result = calculateDebtPayoff({
      debt1Name: 'Credit Card',
      debt1Balance: 5000,
      debt1Rate: 20,
      debt1MinPayment: 150,
      extraMonthlyPayment: 100,
      strategy: 'avalanche',
    });
    // $5,000 at 20% with $250/month total should pay off in ~24 months
    expect(result.totalMonths).toBeGreaterThan(0);
    expect(result.totalMonths).toBeLessThan(36);
    expect(Number(result.totalInterestPaid)).toBeGreaterThan(0);
    expect(Number(result.interestSaved)).toBeGreaterThan(0);
  });

  // ─── Test 2: No debts entered → zero results ───
  it('returns zero results when no debts are entered', () => {
    const result = calculateDebtPayoff({
      debt1Balance: 0,
      extraMonthlyPayment: 200,
      strategy: 'avalanche',
    });
    expect(result.totalMonths).toBe(0);
    expect(result.totalInterestPaid).toBe(0);
    expect(result.payoffDate).toBe('No debts entered');
  });

  // ─── Test 3: Avalanche vs Snowball — avalanche saves more interest ───
  it('avalanche method saves more interest than snowball when rates differ', () => {
    const baseInputs = {
      debt1Name: 'Credit Card',
      debt1Balance: 8000,
      debt1Rate: 22,
      debt1MinPayment: 200,
      debt2Name: 'Car Loan',
      debt2Balance: 15000,
      debt2Rate: 6.5,
      debt2MinPayment: 350,
      extraMonthlyPayment: 200,
    };

    const avalanche = calculateDebtPayoff({ ...baseInputs, strategy: 'avalanche' });
    const snowball = calculateDebtPayoff({ ...baseInputs, strategy: 'snowball' });

    // Avalanche should pay less total interest
    expect(Number(avalanche.totalInterestPaid)).toBeLessThanOrEqual(
      Number(snowball.totalInterestPaid)
    );
  });

  // ─── Test 4: Three debts — payoff order is correct for avalanche ───
  it('avalanche targets highest rate first', () => {
    const result = calculateDebtPayoff({
      debt1Name: 'Credit Card',
      debt1Balance: 8000,
      debt1Rate: 22,
      debt1MinPayment: 200,
      debt2Name: 'Car Loan',
      debt2Balance: 15000,
      debt2Rate: 6.5,
      debt2MinPayment: 350,
      debt3Name: 'Student Loan',
      debt3Balance: 25000,
      debt3Rate: 5,
      debt3MinPayment: 280,
      extraMonthlyPayment: 200,
      strategy: 'avalanche',
    });

    const payoffOrder = result.payoffOrder as Array<{ debtName: string; payoffMonth: number }>;
    expect(payoffOrder.length).toBe(3);
    // Credit Card (22%) should be first in payoff order
    expect(payoffOrder[0].debtName).toBe('Credit Card');
  });

  // ─── Test 5: Snowball targets lowest balance first ───
  it('snowball targets lowest balance first', () => {
    const result = calculateDebtPayoff({
      debt1Name: 'Small Card',
      debt1Balance: 2000,
      debt1Rate: 15,
      debt1MinPayment: 50,
      debt2Name: 'Medium Loan',
      debt2Balance: 10000,
      debt2Rate: 20,
      debt2MinPayment: 250,
      debt3Name: 'Big Loan',
      debt3Balance: 30000,
      debt3Rate: 8,
      debt3MinPayment: 400,
      extraMonthlyPayment: 200,
      strategy: 'snowball',
    });

    const payoffOrder = result.payoffOrder as Array<{ debtName: string; payoffMonth: number }>;
    expect(payoffOrder.length).toBe(3);
    // Small Card ($2,000) should be paid off first
    expect(payoffOrder[0].debtName).toBe('Small Card');
  });

  // ─── Test 6: Zero extra payment — still pays off with minimums ───
  it('pays off debts with minimum payments only when extra is zero', () => {
    const result = calculateDebtPayoff({
      debt1Name: 'Loan',
      debt1Balance: 5000,
      debt1Rate: 10,
      debt1MinPayment: 200,
      extraMonthlyPayment: 0,
      strategy: 'avalanche',
    });
    expect(result.totalMonths).toBeGreaterThan(0);
    expect(Number(result.interestSaved)).toBe(0); // no extra = no savings vs minimum
  });

  // ─── Test 7: Extra payment significantly reduces timeline ───
  it('extra payment reduces payoff months compared to minimums only', () => {
    const baseInputs = {
      debt1Name: 'Debt',
      debt1Balance: 10000,
      debt1Rate: 18,
      debt1MinPayment: 250,
      strategy: 'avalanche' as const,
    };

    const noExtra = calculateDebtPayoff({ ...baseInputs, extraMonthlyPayment: 0 });
    const withExtra = calculateDebtPayoff({ ...baseInputs, extraMonthlyPayment: 250 });

    expect(Number(withExtra.totalMonths)).toBeLessThan(Number(noExtra.totalMonths));
  });

  // ─── Test 8: Timeline chart data has correct structure ───
  it('returns timeline chart data with month 0 as initial balances', () => {
    const result = calculateDebtPayoff({
      debt1Name: 'Card',
      debt1Balance: 3000,
      debt1Rate: 18,
      debt1MinPayment: 100,
      extraMonthlyPayment: 50,
      strategy: 'avalanche',
    });
    const timeline = result.debtPayoffTimeline as Array<{ month: number; [key: string]: number }>;
    expect(timeline.length).toBeGreaterThan(1);
    expect(timeline[0].month).toBe(0);
    expect(timeline[0]['Card']).toBe(3000);
    // Last entry should have balance at or near zero
    const last = timeline[timeline.length - 1];
    expect(last['Card']).toBeCloseTo(0, 0);
  });

  // ─── Test 9: Payoff date string format ───
  it('formats payoff date string correctly', () => {
    const result = calculateDebtPayoff({
      debt1Name: 'Debt',
      debt1Balance: 12000,
      debt1Rate: 15,
      debt1MinPayment: 300,
      extraMonthlyPayment: 100,
      strategy: 'avalanche',
    });
    const payoffDate = result.payoffDate as string;
    // Should be in format like "2 years, 10 months" or "11 months"
    expect(payoffDate).not.toBe('No debts entered');
    expect(payoffDate).not.toBe('Already paid off');
    expect(payoffDate.length).toBeGreaterThan(0);
  });

  // ─── Test 10: Summary contains expected labels ───
  it('returns summary with all expected labels', () => {
    const result = calculateDebtPayoff({
      debt1Name: 'Card',
      debt1Balance: 5000,
      debt1Rate: 20,
      debt1MinPayment: 150,
      extraMonthlyPayment: 100,
      strategy: 'avalanche',
    });
    const summary = result.summary as Array<{ label: string; value: number | string }>;
    const labels = summary.map(s => s.label);
    expect(labels).toContain('Total Debt');
    expect(labels).toContain('Strategy');
    expect(labels).toContain('Extra Monthly Payment');
    expect(labels).toContain('Total Months to Payoff');
    expect(labels).toContain('Total Interest Paid');
    expect(labels).toContain('Interest Saved vs. Minimums Only');
  });

  // ─── Test 11: Multiple debts with same rate — avalanche uses balance as tiebreaker ───
  it('avalanche uses balance as tiebreaker when rates are equal', () => {
    const result = calculateDebtPayoff({
      debt1Name: 'Debt A',
      debt1Balance: 3000,
      debt1Rate: 15,
      debt1MinPayment: 100,
      debt2Name: 'Debt B',
      debt2Balance: 8000,
      debt2Rate: 15,
      debt2MinPayment: 200,
      extraMonthlyPayment: 150,
      strategy: 'avalanche',
    });
    const payoffOrder = result.payoffOrder as Array<{ debtName: string; payoffMonth: number }>;
    expect(payoffOrder.length).toBe(2);
    // With equal rates, avalanche sorts by balance ascending as tiebreaker
    expect(payoffOrder[0].debtName).toBe('Debt A');
  });

  // ─── Test 12: Very large extra payment pays off quickly ───
  it('very large extra payment pays off debts in minimal months', () => {
    const result = calculateDebtPayoff({
      debt1Name: 'Small Debt',
      debt1Balance: 1000,
      debt1Rate: 10,
      debt1MinPayment: 50,
      extraMonthlyPayment: 5000,
      strategy: 'avalanche',
    });
    // With $5,050/month on a $1,000 balance, should pay off in 1 month
    expect(result.totalMonths).toBe(1);
  });

  // ─── Test 13: Interest accumulates correctly on first month ───
  it('calculates first month interest correctly', () => {
    const result = calculateDebtPayoff({
      debt1Name: 'Loan',
      debt1Balance: 12000,
      debt1Rate: 12, // 12% annual = 1% monthly
      debt1MinPayment: 200,
      extraMonthlyPayment: 0,
      strategy: 'avalanche',
    });
    const timeline = result.debtPayoffTimeline as Array<{ month: number; Loan: number }>;
    // Month 0: balance = $12,000
    // Month 1: interest = $12,000 * 0.01 = $120, payment = $200
    // Balance = $12,000 + $120 - $200 = $11,920
    expect(timeline[0].Loan).toBe(12000);
    expect(timeline[1].Loan).toBeCloseTo(11920, 0);
  });

  // ─── Test 14: Payoff order table includes interest paid per debt ───
  it('payoff order includes interest paid per debt', () => {
    const result = calculateDebtPayoff({
      debt1Name: 'Card',
      debt1Balance: 5000,
      debt1Rate: 20,
      debt1MinPayment: 150,
      debt2Name: 'Loan',
      debt2Balance: 10000,
      debt2Rate: 8,
      debt2MinPayment: 250,
      extraMonthlyPayment: 100,
      strategy: 'avalanche',
    });
    const payoffOrder = result.payoffOrder as Array<{
      debtName: string;
      payoffMonth: number;
      interestPaid: number;
    }>;
    expect(payoffOrder.length).toBe(2);
    // Each entry should have a positive interestPaid value
    for (const row of payoffOrder) {
      expect(row.interestPaid).toBeGreaterThan(0);
      expect(row.payoffMonth).toBeGreaterThan(0);
    }
  });

  // ─── Test 15: Default debt names when not provided ───
  it('uses default debt names when names are not provided', () => {
    const result = calculateDebtPayoff({
      debt1Balance: 3000,
      debt1Rate: 18,
      debt1MinPayment: 100,
      extraMonthlyPayment: 50,
      strategy: 'avalanche',
    });
    const payoffOrder = result.payoffOrder as Array<{ debtName: string }>;
    expect(payoffOrder[0].debtName).toBe('Debt 1');
  });
});
