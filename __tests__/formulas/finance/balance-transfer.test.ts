import { calculateBalanceTransfer } from '@/lib/formulas/finance/balance-transfer';

describe('calculateBalanceTransfer', () => {
  // ─── Test 1: Standard transfer — $5,000 at 22% → 0% for 15 months, 3% fee ───
  it('calculates standard balance transfer correctly', () => {
    const result = calculateBalanceTransfer({
      currentBalance: 5000,
      currentAPR: 22,
      currentMonthlyPayment: 200,
      transferFee: 3,
      promoAPR: 0,
      promoMonths: 15,
      postPromoAPR: 22,
    });
    expect(result.transferFeeCost).toBe(150);
    expect(result.totalTransferred).toBe(5150);
    const months = result.monthsToPayoff_current as number;
    expect(months).toBeGreaterThanOrEqual(32);
    expect(months).toBeLessThanOrEqual(36);
    const netSavings = result.netSavings as number;
    expect(netSavings).toBeGreaterThan(500);
  });

  // ─── Test 2: Paid off during promo period ───
  it('handles balance paid off during promo period', () => {
    const result = calculateBalanceTransfer({
      currentBalance: 2000,
      currentAPR: 22,
      currentMonthlyPayment: 200,
      transferFee: 3,
      promoAPR: 0,
      promoMonths: 15,
      postPromoAPR: 22,
    });
    // $2,060 total at 0% with $200/month = ~11 months
    const transferMonths = result.monthsToPayoff_transfer as number;
    expect(transferMonths).toBeLessThanOrEqual(15);
    expect(result.remainingAfterPromo).toBe(0);
    expect(result.totalInterest_transfer).toBe(0);
  });

  // ─── Test 3: Not paid off during promo — balance carries to post-promo ───
  it('handles balance carrying past promo period', () => {
    const result = calculateBalanceTransfer({
      currentBalance: 10000,
      currentAPR: 22,
      currentMonthlyPayment: 200,
      transferFee: 3,
      promoAPR: 0,
      promoMonths: 15,
      postPromoAPR: 22,
    });
    const remaining = result.remainingAfterPromo as number;
    // $10,300 - (15 × $200) = $7,300 remaining
    expect(remaining).toBeGreaterThan(0);
    expect(remaining).toBeCloseTo(7300, 0);
    const transferMonths = result.monthsToPayoff_transfer as number;
    expect(transferMonths).toBeGreaterThan(15);
    // Should still have post-promo interest
    const transferInterest = result.totalInterest_transfer as number;
    expect(transferInterest).toBeGreaterThan(0);
  });

  // ─── Test 4: Zero transfer fee ───
  it('handles zero transfer fee', () => {
    const result = calculateBalanceTransfer({
      currentBalance: 5000,
      currentAPR: 22,
      currentMonthlyPayment: 200,
      transferFee: 0,
      promoAPR: 0,
      promoMonths: 15,
      postPromoAPR: 22,
    });
    expect(result.transferFeeCost).toBe(0);
    expect(result.totalTransferred).toBe(5000);
    expect(result.breakEvenMonths).toBe(0);
  });

  // ─── Test 5: High balance — $20,000 transfer ───
  it('handles high balance transfer', () => {
    const result = calculateBalanceTransfer({
      currentBalance: 20000,
      currentAPR: 24,
      currentMonthlyPayment: 500,
      transferFee: 3,
      promoAPR: 0,
      promoMonths: 21,
      postPromoAPR: 24,
    });
    expect(result.transferFeeCost).toBe(600);
    expect(result.totalTransferred).toBe(20600);
    const netSavings = result.netSavings as number;
    // With 21 months at 0%, should save significantly
    expect(netSavings).toBeGreaterThan(1000);
  });

  // ─── Test 6: Low payment barely covers interest — current never pays off ───
  it('handles payment below current interest threshold', () => {
    const result = calculateBalanceTransfer({
      currentBalance: 10000,
      currentAPR: 24,
      currentMonthlyPayment: 180, // Monthly interest = $200, too low
      transferFee: 3,
      promoAPR: 0,
      promoMonths: 15,
      postPromoAPR: 24,
    });
    expect(result.monthsToPayoff_current).toBe(-1);
    expect(result.totalCost_current).toBe(0);
  });

  // ─── Test 7: Zero promo APR — no interest during promo ───
  it('charges zero interest during 0% promo period', () => {
    const result = calculateBalanceTransfer({
      currentBalance: 3000,
      currentAPR: 20,
      currentMonthlyPayment: 250,
      transferFee: 3,
      promoAPR: 0,
      promoMonths: 15,
      postPromoAPR: 20,
    });
    // $3,090 at 0% for up to 15 months with $250/month
    // Should pay off in ceil(3090/250) = 13 months with 0 interest
    const transferMonths = result.monthsToPayoff_transfer as number;
    expect(transferMonths).toBeLessThanOrEqual(15);
    expect(result.totalInterest_transfer).toBe(0);
  });

  // ─── Test 8: Non-zero promo APR (5%) ───
  it('calculates correctly with 5% promo APR', () => {
    const result = calculateBalanceTransfer({
      currentBalance: 5000,
      currentAPR: 22,
      currentMonthlyPayment: 200,
      transferFee: 3,
      promoAPR: 5,
      promoMonths: 12,
      postPromoAPR: 22,
    });
    // 5% promo should accrue some interest but less than 22%
    const transferInterest = result.totalInterest_transfer as number;
    const currentInterest = result.totalInterest_current as number;
    if (result.monthsToPayoff_current !== -1 && result.monthsToPayoff_transfer !== -1) {
      expect(transferInterest).toBeLessThan(currentInterest);
    }
  });

  // ─── Test 9: 12-month promo period ───
  it('calculates correctly with 12-month promo', () => {
    const result = calculateBalanceTransfer({
      currentBalance: 5000,
      currentAPR: 22,
      currentMonthlyPayment: 200,
      transferFee: 3,
      promoAPR: 0,
      promoMonths: 12,
      postPromoAPR: 22,
    });
    const transferMonths = result.monthsToPayoff_transfer as number;
    expect(transferMonths).toBeGreaterThan(0);
    // Paid during promo: 12 × $200 = $2,400 against $5,150
    const paidDuringPromo = result.paidDuringPromo as number;
    expect(paidDuringPromo).toBeCloseTo(2400, 0);
  });

  // ─── Test 10: 21-month promo period ───
  it('calculates correctly with 21-month promo', () => {
    const result = calculateBalanceTransfer({
      currentBalance: 5000,
      currentAPR: 22,
      currentMonthlyPayment: 300,
      transferFee: 3,
      promoAPR: 0,
      promoMonths: 21,
      postPromoAPR: 22,
    });
    // $5,150 at 0% with $300/month = ceil(5150/300) ≈ 18 months, paid off during promo
    const transferMonths = result.monthsToPayoff_transfer as number;
    expect(transferMonths).toBeLessThanOrEqual(21);
    expect(result.remainingAfterPromo).toBe(0);
  });

  // ─── Test 11: Current payoff months matches expected range ───
  it('calculates current card payoff months correctly', () => {
    const result = calculateBalanceTransfer({
      currentBalance: 5000,
      currentAPR: 22,
      currentMonthlyPayment: 200,
      transferFee: 3,
      promoAPR: 0,
      promoMonths: 15,
      postPromoAPR: 22,
    });
    const months = result.monthsToPayoff_current as number;
    // Same as credit-card-payoff calculator: ~34 months
    expect(months).toBeGreaterThanOrEqual(32);
    expect(months).toBeLessThanOrEqual(36);
  });

  // ─── Test 12: Net savings is positive for good transfer ───
  it('shows positive net savings for beneficial transfer', () => {
    const result = calculateBalanceTransfer({
      currentBalance: 8000,
      currentAPR: 24,
      currentMonthlyPayment: 300,
      transferFee: 3,
      promoAPR: 0,
      promoMonths: 18,
      postPromoAPR: 24,
    });
    const netSavings = result.netSavings as number;
    expect(netSavings).toBeGreaterThan(0);
  });

  // ─── Test 13: Net savings negative for bad transfer (high fee, short promo) ───
  it('shows negative savings when transfer is not beneficial', () => {
    const result = calculateBalanceTransfer({
      currentBalance: 1000,
      currentAPR: 10,
      currentMonthlyPayment: 200,
      transferFee: 5,
      promoAPR: 0,
      promoMonths: 3,
      postPromoAPR: 22, // Post-promo rate is higher than current
    });
    // With only $1,000, 10% current APR, $200/month pays off in ~6 months
    // Transfer: $1,050, 0% for 3 months then 22% — likely costs more
    const netSavings = result.netSavings as number;
    // The transfer fee + higher post-promo rate makes this a bad deal
    expect(netSavings).toBeLessThan(50); // May be negative or very small positive
  });

  // ─── Test 14: Zero balance ───
  it('handles zero balance', () => {
    const result = calculateBalanceTransfer({
      currentBalance: 0,
      currentAPR: 22,
      currentMonthlyPayment: 200,
      transferFee: 3,
      promoAPR: 0,
      promoMonths: 15,
      postPromoAPR: 22,
    });
    expect(result.transferFeeCost).toBe(0);
    expect(result.totalTransferred).toBe(0);
    expect(result.monthsToPayoff_current).toBe(0);
    expect(result.monthsToPayoff_transfer).toBe(0);
    expect(result.netSavings).toBe(0);
  });

  // ─── Test 15: Break-even months calculation ───
  it('calculates break-even months correctly', () => {
    const result = calculateBalanceTransfer({
      currentBalance: 5000,
      currentAPR: 22,
      currentMonthlyPayment: 200,
      transferFee: 3,
      promoAPR: 0,
      promoMonths: 15,
      postPromoAPR: 22,
    });
    const breakEven = result.breakEvenMonths as number;
    // Fee is $150, monthly interest saving ≈ $91.67, so ~2 months
    expect(breakEven).toBeGreaterThan(0);
    expect(breakEven).toBeLessThanOrEqual(5);
  });

  // ─── Test 16: Comparison summary structure ───
  it('returns comparison summary with all required labels', () => {
    const result = calculateBalanceTransfer({
      currentBalance: 5000,
      currentAPR: 22,
      currentMonthlyPayment: 200,
      transferFee: 3,
      promoAPR: 0,
      promoMonths: 15,
      postPromoAPR: 22,
    });
    const summary = result.comparisonSummary as Array<{ label: string; value: number | string }>;
    const labels = summary.map(s => s.label);
    expect(labels).toContain('Current Card Total Cost');
    expect(labels).toContain('Balance Transfer Total Cost');
    expect(labels).toContain('Net Savings');
    expect(labels).toContain('Transfer Fee');
  });

  // ─── Test 17: Output structure contains all expected keys ───
  it('returns all expected output keys', () => {
    const result = calculateBalanceTransfer({
      currentBalance: 5000,
      currentAPR: 22,
      currentMonthlyPayment: 200,
      transferFee: 3,
      promoAPR: 0,
      promoMonths: 15,
      postPromoAPR: 22,
    });
    expect(result).toHaveProperty('transferFeeCost');
    expect(result).toHaveProperty('totalTransferred');
    expect(result).toHaveProperty('monthsToPayoff_current');
    expect(result).toHaveProperty('totalInterest_current');
    expect(result).toHaveProperty('totalCost_current');
    expect(result).toHaveProperty('monthsToPayoff_transfer');
    expect(result).toHaveProperty('totalInterest_transfer');
    expect(result).toHaveProperty('totalCost_transfer');
    expect(result).toHaveProperty('netSavings');
    expect(result).toHaveProperty('monthlySavings_promo');
    expect(result).toHaveProperty('breakEvenMonths');
    expect(result).toHaveProperty('paidDuringPromo');
    expect(result).toHaveProperty('remainingAfterPromo');
    expect(result).toHaveProperty('comparisonSummary');
  });

  // ─── Test 18: Zero current APR — no interest on current card ───
  it('handles zero current APR', () => {
    const result = calculateBalanceTransfer({
      currentBalance: 3000,
      currentAPR: 0,
      currentMonthlyPayment: 200,
      transferFee: 3,
      promoAPR: 0,
      promoMonths: 12,
      postPromoAPR: 15,
    });
    expect(result.totalInterest_current).toBe(0);
    // Current card at 0% costs $3,000. Transfer adds $90 fee = $3,090.
    // Transfer might actually cost more.
    const netSavings = result.netSavings as number;
    expect(netSavings).toBeLessThanOrEqual(0);
  });

  // ─── Test 19: Monthly savings during promo estimate ───
  it('calculates approximate monthly savings during promo', () => {
    const result = calculateBalanceTransfer({
      currentBalance: 5000,
      currentAPR: 22,
      currentMonthlyPayment: 200,
      transferFee: 3,
      promoAPR: 0,
      promoMonths: 15,
      postPromoAPR: 22,
    });
    const monthlySavings = result.monthlySavings_promo as number;
    // Current monthly interest: 5000 × 0.22/12 ≈ $91.67. Promo: $0
    expect(monthlySavings).toBeCloseTo(91.67, 0);
  });

  // ─── Test 20: Transfer with 0 promo months goes straight to post-promo ───
  it('handles zero promo months', () => {
    const result = calculateBalanceTransfer({
      currentBalance: 5000,
      currentAPR: 22,
      currentMonthlyPayment: 200,
      transferFee: 3,
      promoAPR: 0,
      promoMonths: 0,
      postPromoAPR: 22,
    });
    // No promo benefit, just paying $5,150 at 22%
    expect(result.paidDuringPromo).toBe(0);
    expect(result.remainingAfterPromo).toBe(5150);
    const transferMonths = result.monthsToPayoff_transfer as number;
    // Should take longer than current since balance is higher by fee amount
    const currentMonths = result.monthsToPayoff_current as number;
    expect(transferMonths).toBeGreaterThanOrEqual(currentMonths);
  });
});
