import { calculateHeloc } from '@/lib/formulas/finance/heloc';

describe('calculateHeloc', () => {
  // ─── Test 1: Standard scenario — $400K home, $200K mortgage, $50K draw, 8.5% ───
  it('calculates standard HELOC with interest-only draw period', () => {
    const result = calculateHeloc({
      homeValue: 400000,
      mortgageBalance: 200000,
      creditLimit: 80,
      drawAmount: 50000,
      interestRate: 8.5,
      drawPeriod: 10,
      repaymentPeriod: 20,
      interestOnly: true,
    });
    expect(result.homeEquity).toBe(200000);
    expect(result.maxCreditLine).toBe(160000); // 200K equity * 80%
    expect(result.availableCredit).toBe(50000); // draw < max
    expect(result.combinedLTV).toBeCloseTo(62.5, 1); // (200K + 50K) / 400K
  });

  // ─── Test 2: Interest-only draw period payment ───
  it('calculates interest-only monthly payment during draw period', () => {
    const result = calculateHeloc({
      homeValue: 400000,
      mortgageBalance: 200000,
      creditLimit: 80,
      drawAmount: 50000,
      interestRate: 8.5,
      drawPeriod: 10,
      repaymentPeriod: 20,
      interestOnly: true,
    });
    // Monthly = 50000 * (0.085/12) = $354.17
    const drawPayment = result.drawPeriodMonthlyPayment as number;
    expect(drawPayment).toBeCloseTo(354.17, 0);
  });

  // ─── Test 3: Fully amortized draw period ───
  it('calculates fully amortized payments during draw period', () => {
    const result = calculateHeloc({
      homeValue: 400000,
      mortgageBalance: 200000,
      creditLimit: 80,
      drawAmount: 50000,
      interestRate: 8.5,
      drawPeriod: 10,
      repaymentPeriod: 20,
      interestOnly: false,
    });
    const drawPayment = result.drawPeriodMonthlyPayment as number;
    // Amortized over 10 years = higher than interest-only
    expect(drawPayment).toBeGreaterThan(354); // more than interest-only
    expect(drawPayment).toBeLessThan(700);
    // After full draw amortization, repayment should be 0 or near 0
    const repaymentPayment = result.repaymentMonthlyPayment as number;
    expect(repaymentPayment).toBeLessThan(1); // balance is ~0 after full amortization
  });

  // ─── Test 4: Negative equity — mortgage exceeds home value ───
  it('returns zero credit when mortgage exceeds home value', () => {
    const result = calculateHeloc({
      homeValue: 200000,
      mortgageBalance: 250000,
      creditLimit: 80,
      drawAmount: 50000,
      interestRate: 8.5,
      drawPeriod: 10,
      repaymentPeriod: 20,
      interestOnly: true,
    });
    expect(result.homeEquity).toBe(0);
    expect(result.maxCreditLine).toBe(0);
    expect(result.availableCredit).toBe(0);
    expect(result.drawPeriodMonthlyPayment).toBe(0);
    expect(result.repaymentMonthlyPayment).toBe(0);
    expect(result.totalInterest).toBe(0);
  });

  // ─── Test 5: Draw amount exceeds max credit line — capped ───
  it('caps available credit at max credit line when draw exceeds it', () => {
    const result = calculateHeloc({
      homeValue: 300000,
      mortgageBalance: 200000,
      creditLimit: 80,
      drawAmount: 200000, // wants 200K but max is 80K
      interestRate: 8.5,
      drawPeriod: 10,
      repaymentPeriod: 20,
      interestOnly: true,
    });
    expect(result.maxCreditLine).toBe(80000); // (300K - 200K) * 80%
    expect(result.availableCredit).toBe(80000); // capped at max
  });

  // ─── Test 6: Zero interest rate ───
  it('handles zero interest rate correctly', () => {
    const result = calculateHeloc({
      homeValue: 400000,
      mortgageBalance: 200000,
      creditLimit: 80,
      drawAmount: 50000,
      interestRate: 0,
      drawPeriod: 10,
      repaymentPeriod: 20,
      interestOnly: true,
    });
    // Interest-only at 0% = $0/month draw period
    expect(result.drawPeriodMonthlyPayment).toBe(0);
    // Repayment: 50000 / (20*12) = $208.33
    const repayment = result.repaymentMonthlyPayment as number;
    expect(repayment).toBeCloseTo(208.33, 0);
    expect(result.totalInterest).toBe(0);
  });

  // ─── Test 7: 100% credit limit ───
  it('calculates with 100% credit limit', () => {
    const result = calculateHeloc({
      homeValue: 400000,
      mortgageBalance: 100000,
      creditLimit: 100,
      drawAmount: 300000,
      interestRate: 8.5,
      drawPeriod: 10,
      repaymentPeriod: 20,
      interestOnly: true,
    });
    expect(result.maxCreditLine).toBe(300000); // full equity
    expect(result.availableCredit).toBe(300000);
  });

  // ─── Test 8: Repayment period payment — interest only draw ───
  it('calculates repayment period payment after interest-only draw', () => {
    const result = calculateHeloc({
      homeValue: 400000,
      mortgageBalance: 200000,
      creditLimit: 80,
      drawAmount: 50000,
      interestRate: 8.5,
      drawPeriod: 10,
      repaymentPeriod: 20,
      interestOnly: true,
    });
    // Full $50K balance remains after interest-only draw
    // Amortized over 20 years at 8.5%
    const repayment = result.repaymentMonthlyPayment as number;
    expect(repayment).toBeGreaterThan(400);
    expect(repayment).toBeLessThan(500);
  });

  // ─── Test 9: LTV calculation ───
  it('calculates combined LTV correctly', () => {
    const result = calculateHeloc({
      homeValue: 500000,
      mortgageBalance: 300000,
      creditLimit: 80,
      drawAmount: 100000,
      interestRate: 8,
      drawPeriod: 10,
      repaymentPeriod: 20,
      interestOnly: true,
    });
    // CLTV = (300K + 100K) / 500K = 80%
    expect(result.combinedLTV).toBeCloseTo(80, 0);
  });

  // ─── Test 10: Total interest calculation — interest only draw ───
  it('calculates total interest across both periods', () => {
    const result = calculateHeloc({
      homeValue: 400000,
      mortgageBalance: 200000,
      creditLimit: 80,
      drawAmount: 50000,
      interestRate: 8.5,
      drawPeriod: 10,
      repaymentPeriod: 20,
      interestOnly: true,
    });
    const totalDraw = result.totalInterestDraw as number;
    const totalRepayment = result.totalInterestRepayment as number;
    const total = result.totalInterest as number;
    expect(total).toBeCloseTo(totalDraw + totalRepayment, 0);
    // Draw interest: 354.17 * 120 = $42,500
    expect(totalDraw).toBeCloseTo(42500, -2);
    expect(totalRepayment).toBeGreaterThan(0);
  });

  // ─── Test 11: Total cost = available credit + total interest ───
  it('total cost equals available credit plus total interest', () => {
    const result = calculateHeloc({
      homeValue: 400000,
      mortgageBalance: 200000,
      creditLimit: 80,
      drawAmount: 50000,
      interestRate: 8.5,
      drawPeriod: 10,
      repaymentPeriod: 20,
      interestOnly: true,
    });
    const available = result.availableCredit as number;
    const interest = result.totalInterest as number;
    const cost = result.totalCost as number;
    expect(cost).toBeCloseTo(available + interest, 0);
  });

  // ─── Test 12: Zero draw amount ───
  it('handles zero draw amount', () => {
    const result = calculateHeloc({
      homeValue: 400000,
      mortgageBalance: 200000,
      creditLimit: 80,
      drawAmount: 0,
      interestRate: 8.5,
      drawPeriod: 10,
      repaymentPeriod: 20,
      interestOnly: true,
    });
    expect(result.availableCredit).toBe(0);
    expect(result.drawPeriodMonthlyPayment).toBe(0);
    expect(result.repaymentMonthlyPayment).toBe(0);
    expect(result.totalInterest).toBe(0);
  });

  // ─── Test 13: High interest rate (15%) ───
  it('handles high interest rate', () => {
    const result = calculateHeloc({
      homeValue: 400000,
      mortgageBalance: 200000,
      creditLimit: 80,
      drawAmount: 50000,
      interestRate: 15,
      drawPeriod: 10,
      repaymentPeriod: 20,
      interestOnly: true,
    });
    // Monthly = 50000 * 0.15/12 = $625
    const drawPayment = result.drawPeriodMonthlyPayment as number;
    expect(drawPayment).toBeCloseTo(625, 0);
    // Total draw interest: 625 * 120 = $75,000
    expect(result.totalInterestDraw).toBeCloseTo(75000, -2);
  });

  // ─── Test 14: Max credit line calculation ───
  it('calculates max credit line based on equity and limit percentage', () => {
    const result = calculateHeloc({
      homeValue: 600000,
      mortgageBalance: 200000,
      creditLimit: 85,
      drawAmount: 100000,
      interestRate: 8,
      drawPeriod: 10,
      repaymentPeriod: 20,
      interestOnly: true,
    });
    // Equity = 400K, 85% = 340K
    expect(result.maxCreditLine).toBe(340000);
    expect(result.availableCredit).toBe(100000); // draw < max
  });

  // ─── Test 15: Monthly payment breakdown structure ───
  it('returns monthly payment breakdown with correct structure', () => {
    const result = calculateHeloc({
      homeValue: 400000,
      mortgageBalance: 200000,
      creditLimit: 80,
      drawAmount: 50000,
      interestRate: 8.5,
      drawPeriod: 10,
      repaymentPeriod: 20,
      interestOnly: true,
    });
    const breakdown = result.monthlyPaymentBreakdown as Array<{ label: string; value: number }>;
    expect(breakdown).toHaveLength(2);
    expect(breakdown[0].label).toBe('Draw Period Payment');
    expect(breakdown[1].label).toBe('Repayment Period Payment');
    expect(typeof breakdown[0].value).toBe('number');
    expect(typeof breakdown[1].value).toBe('number');
  });

  // ─── Test 16: Home equity calculation ───
  it('calculates home equity correctly', () => {
    const result = calculateHeloc({
      homeValue: 500000,
      mortgageBalance: 150000,
      creditLimit: 80,
      drawAmount: 50000,
      interestRate: 8,
      drawPeriod: 10,
      repaymentPeriod: 20,
      interestOnly: true,
    });
    expect(result.homeEquity).toBe(350000);
  });

  // ─── Test 17: Short repayment period (5 years) vs long (30 years) ───
  it('shorter repayment period has higher monthly payment but less total interest', () => {
    const base = {
      homeValue: 400000,
      mortgageBalance: 200000,
      creditLimit: 80,
      drawAmount: 50000,
      interestRate: 8.5,
      drawPeriod: 10,
      interestOnly: true,
    };
    const short = calculateHeloc({ ...base, repaymentPeriod: 5 });
    const long = calculateHeloc({ ...base, repaymentPeriod: 30 });

    const shortPayment = short.repaymentMonthlyPayment as number;
    const longPayment = long.repaymentMonthlyPayment as number;
    expect(shortPayment).toBeGreaterThan(longPayment);

    const shortInterest = short.totalInterestRepayment as number;
    const longInterest = long.totalInterestRepayment as number;
    expect(shortInterest).toBeLessThan(longInterest);
  });

  // ─── Test 18: Zero home value ───
  it('handles zero home value gracefully', () => {
    const result = calculateHeloc({
      homeValue: 0,
      mortgageBalance: 0,
      creditLimit: 80,
      drawAmount: 50000,
      interestRate: 8.5,
      drawPeriod: 10,
      repaymentPeriod: 20,
      interestOnly: true,
    });
    expect(result.homeEquity).toBe(0);
    expect(result.maxCreditLine).toBe(0);
    expect(result.availableCredit).toBe(0);
    expect(result.totalInterest).toBe(0);
    expect(result.totalCost).toBe(0);
  });
});
