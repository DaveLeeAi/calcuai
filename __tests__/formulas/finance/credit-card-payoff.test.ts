import { calculateCreditCardPayoff } from '@/lib/formulas/finance/credit-card-payoff';

describe('calculateCreditCardPayoff', () => {
  // ─── Test 1: Standard case — $5,000 at 22% APR, $200/month ───
  it('calculates standard credit card payoff correctly', () => {
    const result = calculateCreditCardPayoff({
      balance: 5000,
      annualRate: 22,
      monthlyPayment: 200,
    });
    // Iterative calculation: ~34 months, ~$1,686 in interest
    const months = result.monthsToPayoff as number;
    expect(months).toBeGreaterThanOrEqual(32);
    expect(months).toBeLessThanOrEqual(36);
    const totalInterest = result.totalInterest as number;
    expect(totalInterest).toBeGreaterThan(1500);
    expect(totalInterest).toBeLessThan(1900);
  });

  // ─── Test 2: High balance — $25,000 at 24% APR, $600/month ───
  it('calculates high balance payoff correctly', () => {
    const result = calculateCreditCardPayoff({
      balance: 25000,
      annualRate: 24,
      monthlyPayment: 600,
    });
    const months = result.monthsToPayoff as number;
    // $25K at 24%, $600/month (monthly interest $500, so $100 principal first month)
    expect(months).toBeGreaterThan(50);
    expect(months).toBeLessThan(120);
    const totalInterest = result.totalInterest as number;
    expect(totalInterest).toBeGreaterThan(10000);
  });

  // ─── Test 3: Zero APR — $3,000 at 0%, $100/month ───
  it('handles zero APR correctly', () => {
    const result = calculateCreditCardPayoff({
      balance: 3000,
      annualRate: 0,
      monthlyPayment: 100,
    });
    expect(result.monthsToPayoff).toBe(30);
    expect(result.totalInterest).toBe(0);
    expect(result.totalPaid).toBe(3000);
  });

  // ─── Test 4: Payment just covers interest — never pays off ───
  it('returns never when payment equals monthly interest', () => {
    const result = calculateCreditCardPayoff({
      balance: 10000,
      annualRate: 24,
      monthlyPayment: 200, // 10000 × 0.24/12 = $200 exactly
    });
    expect(result.monthsToPayoff).toBe(-1);
  });

  // ─── Test 5: Payment exceeds balance — 1 month payoff ───
  it('handles payment exceeding balance', () => {
    const result = calculateCreditCardPayoff({
      balance: 100,
      annualRate: 20,
      monthlyPayment: 500,
    });
    expect(result.monthsToPayoff).toBe(1);
    const totalPaid = result.totalPaid as number;
    // Should pay balance + 1 month of interest (~$1.67)
    expect(totalPaid).toBeCloseTo(101.67, 0);
  });

  // ─── Test 6: Zero balance ───
  it('handles zero balance', () => {
    const result = calculateCreditCardPayoff({
      balance: 0,
      annualRate: 22,
      monthlyPayment: 200,
    });
    expect(result.monthsToPayoff).toBe(0);
    expect(result.totalPaid).toBe(0);
    expect(result.totalInterest).toBe(0);
  });

  // ─── Test 7: Zero payment ───
  it('handles zero payment', () => {
    const result = calculateCreditCardPayoff({
      balance: 5000,
      annualRate: 22,
      monthlyPayment: 0,
    });
    expect(result.monthsToPayoff).toBe(-1);
  });

  // ─── Test 8: Large payment relative to balance ───
  it('handles large payment relative to balance', () => {
    const result = calculateCreditCardPayoff({
      balance: 1000,
      annualRate: 18,
      monthlyPayment: 1000,
    });
    // Month 1: $15 interest, $985 principal, $15 remaining. Month 2: pays $15 + tiny interest.
    expect(result.monthsToPayoff).toBe(2);
    const totalInterest = result.totalInterest as number;
    // ~$15 interest (first month) + tiny second month interest
    expect(totalInterest).toBeCloseTo(15.22, 0);
  });

  // ─── Test 9: Schedule structure — first and last rows ───
  it('generates correct schedule structure', () => {
    const result = calculateCreditCardPayoff({
      balance: 5000,
      annualRate: 22,
      monthlyPayment: 200,
    });
    const schedule = result.payoffSchedule as Array<{
      month: number;
      payment: number;
      principal: number;
      interest: number;
      balance: number;
    }>;
    expect(schedule.length).toBeGreaterThan(0);
    expect(schedule[0].month).toBe(1);
    // First month interest: 5000 × 0.22/12 ≈ $91.67
    expect(schedule[0].interest).toBeCloseTo(91.67, 0);
    expect(schedule[0].payment).toBeCloseTo(200, 0);
    // Last row balance should be 0 or near 0
    const lastRow = schedule[schedule.length - 1];
    expect(lastRow.balance).toBeCloseTo(0, 0);
  });

  // ─── Test 10: Balance over time — starts at balance, ends near 0 ───
  it('generates balance over time from balance to zero', () => {
    const result = calculateCreditCardPayoff({
      balance: 5000,
      annualRate: 22,
      monthlyPayment: 200,
    });
    const balanceData = result.balanceOverTime as Array<{ month: number; balance: number }>;
    expect(balanceData[0].month).toBe(0);
    expect(balanceData[0].balance).toBe(5000);
    const lastPoint = balanceData[balanceData.length - 1];
    expect(lastPoint.balance).toBeCloseTo(0, 0);
  });

  // ─── Test 11: Summary labels present ───
  it('returns summary with all required labels', () => {
    const result = calculateCreditCardPayoff({
      balance: 5000,
      annualRate: 22,
      monthlyPayment: 200,
    });
    const summary = result.summary as Array<{ label: string; value: number | string }>;
    const labels = summary.map(s => s.label);
    expect(labels).toContain('Starting Balance');
    expect(labels).toContain('Monthly Payment');
    expect(labels).toContain('APR');
    expect(labels).toContain('Months to Pay Off');
    expect(labels).toContain('Total Paid');
    expect(labels).toContain('Total Interest');
    expect(labels).toContain('Interest-to-Principal Ratio');
  });

  // ─── Test 12: Very high APR — $5,000 at 36%, $200/month ───
  it('handles very high APR correctly', () => {
    const result = calculateCreditCardPayoff({
      balance: 5000,
      annualRate: 36,
      monthlyPayment: 200,
    });
    const months = result.monthsToPayoff as number;
    // At 36% APR, payoff takes longer than at 22%
    expect(months).toBeGreaterThan(30);
    const totalInterest = result.totalInterest as number;
    // Significantly more interest than the 22% case
    expect(totalInterest).toBeGreaterThan(1500);
  });

  // ─── Test 13: Payment below interest — never pays off ───
  it('returns never when payment is below monthly interest', () => {
    const result = calculateCreditCardPayoff({
      balance: 10000,
      annualRate: 24,
      monthlyPayment: 150, // Monthly interest = $200, payment < interest
    });
    expect(result.monthsToPayoff).toBe(-1);
  });

  // ─── Test 14: Total paid = total interest + original balance ───
  it('total paid equals balance plus total interest', () => {
    const result = calculateCreditCardPayoff({
      balance: 8000,
      annualRate: 19,
      monthlyPayment: 300,
    });
    const totalPaid = result.totalPaid as number;
    const totalInterest = result.totalInterest as number;
    // Total paid should approximately equal balance + interest
    expect(totalPaid).toBeCloseTo(8000 + totalInterest, 0);
  });
});
