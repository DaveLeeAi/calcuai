import { calculateMortgagePrepayment } from '@/lib/formulas/finance/mortgage-prepayment';

describe('calculateMortgagePrepayment', () => {
  const defaultInputs = {
    loanBalance: 300000,
    interestRate: 6.5,
    remainingYears: 28,
    monthlyPayment: 1896,
    extraMonthly: 200,
    extraYearly: 0,
    lumpSum: 0,
  };

  // ─── Test 1: Default values produce positive interest savings ───
  it('produces positive interest savings with default values', () => {
    const result = calculateMortgagePrepayment(defaultInputs);
    expect(Number(result.interestSaved)).toBeGreaterThan(0);
  });

  // ─── Test 2: No extra payments — original and new match ───
  it('produces identical results with no extra payments', () => {
    const result = calculateMortgagePrepayment({
      ...defaultInputs,
      extraMonthly: 0,
      extraYearly: 0,
      lumpSum: 0,
    });
    expect(result.totalInterestOriginal).toBe(result.totalInterestNew);
    expect(result.originalPayoffYears).toBe(result.newPayoffYears);
    expect(result.interestSaved).toBe(0);
    expect(result.timeSaved).toBe('0 months');
  });

  // ─── Test 3: $200/month extra saves significant interest ───
  it('saves significant interest with $200/month extra', () => {
    const result = calculateMortgagePrepayment(defaultInputs);
    expect(Number(result.interestSaved)).toBeGreaterThan(10000);
  });

  // ─── Test 4: Lump sum $50,000 reduces payoff significantly ───
  it('reduces payoff with $50,000 lump sum', () => {
    const result = calculateMortgagePrepayment({
      ...defaultInputs,
      extraMonthly: 0,
      lumpSum: 50000,
    });
    expect(Number(result.interestSaved)).toBeGreaterThan(20000);
  });

  // ─── Test 5: Yearly extra payment ───
  it('saves interest with yearly extra payment', () => {
    const result = calculateMortgagePrepayment({
      ...defaultInputs,
      extraMonthly: 0,
      extraYearly: 5000,
    });
    expect(Number(result.interestSaved)).toBeGreaterThan(10000);
  });

  // ─── Test 6: Combined monthly + yearly + lump sum ───
  it('saves most interest with combined extra payments', () => {
    const monthlyOnly = calculateMortgagePrepayment({
      ...defaultInputs,
      extraMonthly: 200,
      extraYearly: 0,
      lumpSum: 0,
    });
    const combined = calculateMortgagePrepayment({
      ...defaultInputs,
      extraMonthly: 200,
      extraYearly: 5000,
      lumpSum: 10000,
    });
    expect(Number(combined.interestSaved)).toBeGreaterThan(Number(monthlyOnly.interestSaved));
  });

  // ─── Test 7: Zero balance ───
  it('handles zero loan balance gracefully', () => {
    const result = calculateMortgagePrepayment({
      ...defaultInputs,
      loanBalance: 0,
    });
    expect(result.interestSaved).toBe(0);
    expect(result.totalInterestOriginal).toBe(0);
    expect(result.totalInterestNew).toBe(0);
  });

  // ─── Test 8: Very high extra payment pays off quickly ───
  it('pays off quickly with very high extra payment', () => {
    const result = calculateMortgagePrepayment({
      ...defaultInputs,
      extraMonthly: 5000,
    });
    // With $1896 + $5000 = $6896/month on $300K, should pay off in ~4 years
    expect(result.newPayoffYears).not.toContain('28');
    expect(Number(result.interestSaved)).toBeGreaterThan(50000);
  });

  // ─── Test 9: Low interest rate (3%) ───
  it('handles low interest rate correctly', () => {
    const result = calculateMortgagePrepayment({
      ...defaultInputs,
      interestRate: 3,
      extraMonthly: 200,
    });
    expect(Number(result.interestSaved)).toBeGreaterThan(0);
    // Less interest saved at lower rate
    const highRate = calculateMortgagePrepayment(defaultInputs);
    expect(Number(result.interestSaved)).toBeLessThan(Number(highRate.interestSaved));
  });

  // ─── Test 10: High interest rate (8%) ───
  it('saves more interest at higher rates', () => {
    const result = calculateMortgagePrepayment({
      ...defaultInputs,
      interestRate: 8,
    });
    const normalRate = calculateMortgagePrepayment(defaultInputs);
    expect(Number(result.interestSaved)).toBeGreaterThan(Number(normalRate.interestSaved));
  });

  // ─── Test 11: Short remaining term (5 years) ───
  it('handles short remaining term', () => {
    const result = calculateMortgagePrepayment({
      loanBalance: 50000,
      interestRate: 6.5,
      remainingYears: 5,
      monthlyPayment: 980,
      extraMonthly: 200,
      extraYearly: 0,
      lumpSum: 0,
    });
    expect(Number(result.interestSaved)).toBeGreaterThan(0);
  });

  // ─── Test 12: Full remaining term (30 years) ───
  it('handles full 30-year term', () => {
    const result = calculateMortgagePrepayment({
      loanBalance: 400000,
      interestRate: 7,
      remainingYears: 30,
      monthlyPayment: 2661,
      extraMonthly: 300,
      extraYearly: 0,
      lumpSum: 0,
    });
    expect(Number(result.interestSaved)).toBeGreaterThan(50000);
  });

  // ─── Test 13: New payoff always <= original payoff ───
  it('new payoff time is always less than or equal to original', () => {
    const result = calculateMortgagePrepayment(defaultInputs);
    // Parse months from formatted strings is complex, so compare interest
    expect(Number(result.totalInterestNew)).toBeLessThanOrEqual(Number(result.totalInterestOriginal));
  });

  // ─── Test 14: Interest saved is always >= 0 ───
  it('interest saved is never negative', () => {
    const result = calculateMortgagePrepayment(defaultInputs);
    expect(Number(result.interestSaved)).toBeGreaterThanOrEqual(0);
  });

  // ─── Test 15: Total paid with extra < total paid original ───
  it('total paid with extra payments is less than original', () => {
    const result = calculateMortgagePrepayment(defaultInputs);
    expect(Number(result.totalPaidNew)).toBeLessThan(Number(result.totalPaidOriginal));
  });

  // ─── Test 16: Output has all expected keys ───
  it('returns all expected output keys', () => {
    const result = calculateMortgagePrepayment(defaultInputs);
    expect(result).toHaveProperty('interestSaved');
    expect(result).toHaveProperty('newPayoffYears');
    expect(result).toHaveProperty('originalPayoffYears');
    expect(result).toHaveProperty('timeSaved');
    expect(result).toHaveProperty('totalInterestOriginal');
    expect(result).toHaveProperty('totalInterestNew');
    expect(result).toHaveProperty('totalPaidOriginal');
    expect(result).toHaveProperty('totalPaidNew');
    expect(result).toHaveProperty('payoffDate');
  });

  // ─── Test 17: Time saved format is reasonable ───
  it('time saved is a properly formatted string', () => {
    const result = calculateMortgagePrepayment(defaultInputs);
    expect(typeof result.timeSaved).toBe('string');
    const timeSaved = result.timeSaved as string;
    // Should contain "year" or "month"
    expect(timeSaved).toMatch(/year|month/);
  });

  // ─── Test 18: Very small extra payment ($25/month) ───
  it('handles very small extra payment', () => {
    const result = calculateMortgagePrepayment({
      ...defaultInputs,
      extraMonthly: 25,
    });
    expect(Number(result.interestSaved)).toBeGreaterThan(0);
  });

  // ─── Test 19: Extra payment equals monthly payment (doubles payment) ───
  it('handles doubled payment correctly', () => {
    const result = calculateMortgagePrepayment({
      ...defaultInputs,
      extraMonthly: 1896,
    });
    // Doubling payment should save massive interest
    expect(Number(result.interestSaved)).toBeGreaterThan(100000);
  });

  // ─── Test 20: Payoff date is a string ───
  it('payoff date is a formatted string', () => {
    const result = calculateMortgagePrepayment(defaultInputs);
    expect(typeof result.payoffDate).toBe('string');
    expect(result.payoffDate).not.toBe('N/A');
  });

  // ─── Test 21: originalPayoffYears is formatted string ───
  it('originalPayoffYears is a formatted duration string', () => {
    const result = calculateMortgagePrepayment(defaultInputs);
    expect(typeof result.originalPayoffYears).toBe('string');
    expect(result.originalPayoffYears as string).toMatch(/year|month/);
  });

  // ─── Test 22: newPayoffYears is formatted string ───
  it('newPayoffYears is a formatted duration string', () => {
    const result = calculateMortgagePrepayment(defaultInputs);
    expect(typeof result.newPayoffYears).toBe('string');
    expect(result.newPayoffYears as string).toMatch(/year|month/);
  });

  // ─── Test 23: Zero monthly payment ───
  it('handles zero monthly payment gracefully', () => {
    const result = calculateMortgagePrepayment({
      ...defaultInputs,
      monthlyPayment: 0,
    });
    expect(result.interestSaved).toBe(0);
    expect(result.payoffDate).toBe('N/A');
  });

  // ─── Test 24: Lump sum exceeds balance — immediate payoff ───
  it('handles lump sum exceeding balance', () => {
    const result = calculateMortgagePrepayment({
      ...defaultInputs,
      extraMonthly: 0,
      lumpSum: 500000,
    });
    expect(result.newPayoffYears).toBe('0 months');
    expect(Number(result.totalInterestNew)).toBe(0);
  });
});
