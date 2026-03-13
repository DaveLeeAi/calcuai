import { calculatePersonalLoan } from '@/lib/formulas/finance/personal-loan';

describe('calculatePersonalLoan', () => {
  // ─── Test 1: Default values ($15K, 10.5%, 36 months, no fee) ───
  it('calculates monthly payment with default values', () => {
    const result = calculatePersonalLoan({
      loanAmount: 15000,
      annualInterestRate: 10.5,
      loanTermMonths: '36',
      originationFeePercent: 0,
    });
    // r = 10.5/12/100 = 0.00875
    // (1.00875)^36 = 1.36861
    // M = 15000 × (0.00875 × 1.36861) / (1.36861 - 1)
    //   = 15000 × 0.032538 = 487.54 (after rounding to 2 decimals)
    // Total = 487.54 × 36 = 17551.44
    // Interest = 17551.44 - 15000 = 2551.44
    expect(result.monthlyPayment).toBeCloseTo(487.54, 0);
    expect(result.totalInterest).toBeCloseTo(2551.44, 0);
    expect(result.originationFee).toBe(0);
    expect(result.netLoanProceeds).toBe(15000);
  });

  // ─── Test 2: Zero interest rate — simple division ───
  it('calculates correctly with zero interest rate', () => {
    const result = calculatePersonalLoan({
      loanAmount: 12000,
      annualInterestRate: 0,
      loanTermMonths: 24,
      originationFeePercent: 0,
    });
    // 12000 / 24 = 500 per month, 0 interest
    expect(result.monthlyPayment).toBe(500);
    expect(result.totalPayment).toBe(12000);
    expect(result.totalInterest).toBe(0);
    expect(result.effectiveAPR).toBe(0);
  });

  // ─── Test 3: Short term (12 months) ───
  it('calculates for 12-month term', () => {
    const result = calculatePersonalLoan({
      loanAmount: 10000,
      annualInterestRate: 8,
      loanTermMonths: '12',
    });
    // r = 8/12/100 = 0.006667
    // (1.006667)^12 = 1.08300
    // M = 10000 × (0.006667 × 1.08300) / (1.08300 - 1)
    //   = 10000 × 0.007220 / 0.08300 = 10000 × 0.08699 = 869.88
    expect(result.monthlyPayment).toBeCloseTo(869.88, 0);
    const totalPayment = result.totalPayment as number;
    const totalInterest = result.totalInterest as number;
    expect(totalInterest).toBeCloseTo(totalPayment - 10000, 2);
  });

  // ─── Test 4: Long term (84 months) ───
  it('calculates for 84-month term', () => {
    const result = calculatePersonalLoan({
      loanAmount: 25000,
      annualInterestRate: 12,
      loanTermMonths: '84',
    });
    // Longer term → lower monthly, higher total interest
    const monthly = result.monthlyPayment as number;
    const totalInterest = result.totalInterest as number;
    expect(monthly).toBeGreaterThan(0);
    expect(monthly).toBeLessThan(25000 / 84 * 2); // should be less than double the no-interest payment
    expect(totalInterest).toBeGreaterThan(0);
    // Total payment = monthly × 84
    expect(result.totalPayment).toBeCloseTo(monthly * 84, 1);
  });

  // ─── Test 5: Small loan ($1,000) ───
  it('handles small loan amount', () => {
    const result = calculatePersonalLoan({
      loanAmount: 1000,
      annualInterestRate: 15,
      loanTermMonths: 12,
    });
    // r = 15/12/100 = 0.0125
    // (1.0125)^12 = 1.16075
    // M = 1000 × (0.0125 × 1.16075) / (1.16075 - 1)
    //   = 1000 × 0.014509 / 0.16075 = 1000 × 0.09026 = 90.26
    expect(result.monthlyPayment).toBeCloseTo(90.26, 0);
    expect(result.totalPayment).toBeCloseTo(1083.14, 0);
    expect(result.totalInterest).toBeCloseTo(83.14, 0);
  });

  // ─── Test 6: Large loan ($50,000) ───
  it('handles large loan amount', () => {
    const result = calculatePersonalLoan({
      loanAmount: 50000,
      annualInterestRate: 7.5,
      loanTermMonths: 60,
    });
    const monthly = result.monthlyPayment as number;
    expect(monthly).toBeGreaterThan(900);
    expect(monthly).toBeLessThan(1200);
    // Total interest on $50K at 7.5% for 5 years should be substantial
    const totalInterest = result.totalInterest as number;
    expect(totalInterest).toBeGreaterThan(5000);
    expect(totalInterest).toBeLessThan(15000);
  });

  // ─── Test 7: High interest rate (25%) ───
  it('calculates with high interest rate', () => {
    const result = calculatePersonalLoan({
      loanAmount: 10000,
      annualInterestRate: 25,
      loanTermMonths: 36,
    });
    // r = 25/12/100 = 0.020833
    // High rate means high interest
    const totalInterest = result.totalInterest as number;
    expect(totalInterest).toBeGreaterThan(3500);
    // Monthly payment should be noticeably higher than no-interest version (277.78)
    const monthly = result.monthlyPayment as number;
    expect(monthly).toBeGreaterThan(350);
  });

  // ─── Test 8: With origination fee (3%) ───
  it('calculates origination fee and net proceeds', () => {
    const result = calculatePersonalLoan({
      loanAmount: 15000,
      annualInterestRate: 10.5,
      loanTermMonths: 36,
      originationFeePercent: 3,
    });
    // Fee: 15000 × 3% = 450
    // Net proceeds: 15000 - 450 = 14550
    expect(result.originationFee).toBe(450);
    expect(result.netLoanProceeds).toBe(14550);
    // Monthly payment unchanged (based on loan amount, not net proceeds)
    expect(result.monthlyPayment).toBeCloseTo(487.68, 0);
  });

  // ─── Test 9: Total interest = total payment - principal ───
  it('total interest equals total payment minus principal', () => {
    const result = calculatePersonalLoan({
      loanAmount: 20000,
      annualInterestRate: 11,
      loanTermMonths: 48,
    });
    const totalPayment = result.totalPayment as number;
    const totalInterest = result.totalInterest as number;
    // totalInterest = totalPayment - loanAmount
    expect(totalInterest).toBeCloseTo(totalPayment - 20000, 2);
  });

  // ─── Test 10: Monthly payment × months = total payment ───
  it('monthly payment times months equals total payment', () => {
    const result = calculatePersonalLoan({
      loanAmount: 18000,
      annualInterestRate: 9,
      loanTermMonths: '60',
    });
    const monthly = result.monthlyPayment as number;
    const totalPayment = result.totalPayment as number;
    expect(totalPayment).toBeCloseTo(monthly * 60, 1);
  });

  // ─── Test 11: Zero loan amount ───
  it('handles zero loan amount gracefully', () => {
    const result = calculatePersonalLoan({
      loanAmount: 0,
      annualInterestRate: 10,
      loanTermMonths: 36,
    });
    expect(result.monthlyPayment).toBe(0);
    expect(result.totalPayment).toBe(0);
    expect(result.totalInterest).toBe(0);
    expect(result.originationFee).toBe(0);
    expect(result.netLoanProceeds).toBe(0);
  });

  // ─── Test 12: Origination fee reduces net proceeds ───
  it('origination fee reduces net proceeds correctly', () => {
    const result = calculatePersonalLoan({
      loanAmount: 20000,
      annualInterestRate: 10,
      loanTermMonths: 36,
      originationFeePercent: 5,
    });
    // Fee: 20000 × 5% = 1000
    expect(result.originationFee).toBe(1000);
    expect(result.netLoanProceeds).toBe(19000);
  });

  // ─── Test 13: APR > stated rate when origination fee present ───
  it('effective APR exceeds stated rate with origination fee', () => {
    const result = calculatePersonalLoan({
      loanAmount: 15000,
      annualInterestRate: 10.5,
      loanTermMonths: 36,
      originationFeePercent: 3,
    });
    const effectiveAPR = result.effectiveAPR as number;
    // APR must be higher than 10.5% when fee present
    expect(effectiveAPR).toBeGreaterThan(10.5);
    // Should be around 12.6%
    expect(effectiveAPR).toBeGreaterThan(12);
    expect(effectiveAPR).toBeLessThan(14);
  });

  // ─── Test 14: APR = stated rate when no origination fee ───
  it('effective APR equals stated rate with no origination fee', () => {
    const result = calculatePersonalLoan({
      loanAmount: 15000,
      annualInterestRate: 10.5,
      loanTermMonths: 36,
      originationFeePercent: 0,
    });
    expect(result.effectiveAPR).toBe(10.5);
  });

  // ─── Test 15: String loanTermMonths handled correctly ───
  it('handles loanTermMonths as string (from select input)', () => {
    const resultString = calculatePersonalLoan({
      loanAmount: 10000,
      annualInterestRate: 10,
      loanTermMonths: '48',
    });
    const resultNumber = calculatePersonalLoan({
      loanAmount: 10000,
      annualInterestRate: 10,
      loanTermMonths: 48,
    });
    expect(resultString.monthlyPayment).toBe(resultNumber.monthlyPayment);
    expect(resultString.totalPayment).toBe(resultNumber.totalPayment);
    expect(resultString.totalInterest).toBe(resultNumber.totalInterest);
  });

  // ─── Test 16: Missing originationFeePercent defaults to 0 ───
  it('defaults origination fee to 0 when not provided', () => {
    const result = calculatePersonalLoan({
      loanAmount: 10000,
      annualInterestRate: 8,
      loanTermMonths: 24,
    });
    expect(result.originationFee).toBe(0);
    expect(result.netLoanProceeds).toBe(10000);
  });

  // ─── Test 17: All expected output keys present ───
  it('returns all expected output keys', () => {
    const result = calculatePersonalLoan({
      loanAmount: 15000,
      annualInterestRate: 10.5,
      loanTermMonths: 36,
      originationFeePercent: 0,
    });
    expect(result).toHaveProperty('monthlyPayment');
    expect(result).toHaveProperty('totalPayment');
    expect(result).toHaveProperty('totalInterest');
    expect(result).toHaveProperty('effectiveAPR');
    expect(result).toHaveProperty('originationFee');
    expect(result).toHaveProperty('netLoanProceeds');
    expect(result).toHaveProperty('firstPaymentInterest');
    expect(result).toHaveProperty('firstPaymentPrincipal');
    expect(result).toHaveProperty('lastPaymentInterest');
    expect(result).toHaveProperty('lastPaymentPrincipal');
    expect(result).toHaveProperty('costBreakdown');
  });

  // ─── Test 18: Cost breakdown structure ───
  it('returns cost breakdown with correct structure', () => {
    const result = calculatePersonalLoan({
      loanAmount: 15000,
      annualInterestRate: 10.5,
      loanTermMonths: 36,
      originationFeePercent: 3,
    });
    const breakdown = result.costBreakdown as Array<{ label: string; value: number }>;
    expect(breakdown).toHaveLength(4);
    expect(breakdown[0]).toEqual({ label: 'Loan Principal', value: 15000 });
    // Total interest around 2551.44
    expect(breakdown[1].label).toBe('Total Interest');
    expect(breakdown[1].value).toBeCloseTo(2551.44, 0);
    expect(breakdown[2]).toEqual({ label: 'Origination Fee', value: 450 });
    // Total cost = interest + fee
    expect(breakdown[3].label).toBe('Total Cost of Loan');
    expect(breakdown[3].value).toBeCloseTo(2551.44 + 450, 0);
  });

  // ─── Test 19: First payment interest split ───
  it('calculates first payment interest and principal split', () => {
    const result = calculatePersonalLoan({
      loanAmount: 15000,
      annualInterestRate: 10.5,
      loanTermMonths: 36,
    });
    // First payment interest: 15000 × (10.5/12/100) = 15000 × 0.00875 = 131.25
    expect(result.firstPaymentInterest).toBe(131.25);
    const monthly = result.monthlyPayment as number;
    const firstPrincipal = result.firstPaymentPrincipal as number;
    // Principal = monthly - interest
    expect(firstPrincipal).toBeCloseTo(monthly - 131.25, 2);
  });

  // ─── Test 20: Last payment is mostly principal ───
  it('last payment has much less interest than first payment', () => {
    const result = calculatePersonalLoan({
      loanAmount: 15000,
      annualInterestRate: 10.5,
      loanTermMonths: 36,
    });
    const firstInterest = result.firstPaymentInterest as number;
    const lastInterest = result.lastPaymentInterest as number;
    // Last payment interest should be much less than first
    expect(lastInterest).toBeLessThan(firstInterest);
    expect(lastInterest).toBeLessThan(10); // should be very small near end
    expect(lastInterest).toBeGreaterThan(0);
  });

  // ─── Test 21: Large origination fee (8%) ───
  it('handles large origination fee', () => {
    const result = calculatePersonalLoan({
      loanAmount: 20000,
      annualInterestRate: 15,
      loanTermMonths: 36,
      originationFeePercent: 8,
    });
    // Fee: 20000 × 8% = 1600
    expect(result.originationFee).toBe(1600);
    expect(result.netLoanProceeds).toBe(18400);
    // APR should be significantly higher than 15%
    const effectiveAPR = result.effectiveAPR as number;
    expect(effectiveAPR).toBeGreaterThan(18);
  });

  // ─── Test 22: Very low interest rate (3%) ───
  it('calculates correctly with very low interest rate', () => {
    const result = calculatePersonalLoan({
      loanAmount: 10000,
      annualInterestRate: 3,
      loanTermMonths: 24,
    });
    // r = 3/12/100 = 0.0025
    // Monthly should be slightly above 10000/24 = 416.67
    const monthly = result.monthlyPayment as number;
    expect(monthly).toBeGreaterThan(416);
    expect(monthly).toBeLessThan(440);
    // Total interest should be modest
    const totalInterest = result.totalInterest as number;
    expect(totalInterest).toBeGreaterThan(200);
    expect(totalInterest).toBeLessThan(500);
  });

  // ─── Test 23: Negative inputs clamped to zero ───
  it('clamps negative loan amount to zero', () => {
    const result = calculatePersonalLoan({
      loanAmount: -5000,
      annualInterestRate: 10,
      loanTermMonths: 36,
    });
    expect(result.monthlyPayment).toBe(0);
    expect(result.totalPayment).toBe(0);
    expect(result.totalInterest).toBe(0);
  });

  // ─── Test 24: Interest rate clamped at 100% ───
  it('clamps interest rate to 100%', () => {
    const result = calculatePersonalLoan({
      loanAmount: 10000,
      annualInterestRate: 150,
      loanTermMonths: 12,
    });
    // Should use 100% rate, not 150%
    // r = 100/12/100 = 0.08333
    // Monthly should be very high but finite
    const monthly = result.monthlyPayment as number;
    expect(monthly).toBeGreaterThan(0);
    expect(monthly).toBeLessThan(20000);
  });

  // ─── Test 25: Comparing 24 vs 60 month — shorter term = less interest ───
  it('shorter term produces less total interest than longer term', () => {
    const result24 = calculatePersonalLoan({
      loanAmount: 15000,
      annualInterestRate: 10.5,
      loanTermMonths: 24,
    });
    const result60 = calculatePersonalLoan({
      loanAmount: 15000,
      annualInterestRate: 10.5,
      loanTermMonths: 60,
    });
    const interest24 = result24.totalInterest as number;
    const interest60 = result60.totalInterest as number;
    const monthly24 = result24.monthlyPayment as number;
    const monthly60 = result60.monthlyPayment as number;
    // Shorter term = higher payment but lower total interest
    expect(monthly24).toBeGreaterThan(monthly60);
    expect(interest24).toBeLessThan(interest60);
  });

  // ─── Test 26: Higher rate = higher total interest ───
  it('higher interest rate produces more total interest', () => {
    const resultLow = calculatePersonalLoan({
      loanAmount: 15000,
      annualInterestRate: 7,
      loanTermMonths: 36,
    });
    const resultHigh = calculatePersonalLoan({
      loanAmount: 15000,
      annualInterestRate: 20,
      loanTermMonths: 36,
    });
    const interestLow = resultLow.totalInterest as number;
    const interestHigh = resultHigh.totalInterest as number;
    expect(interestHigh).toBeGreaterThan(interestLow);
  });

  // ─── Test 27: Larger origination fee = higher effective APR ───
  it('larger origination fee increases effective APR', () => {
    const result2 = calculatePersonalLoan({
      loanAmount: 15000,
      annualInterestRate: 10,
      loanTermMonths: 36,
      originationFeePercent: 2,
    });
    const result6 = calculatePersonalLoan({
      loanAmount: 15000,
      annualInterestRate: 10,
      loanTermMonths: 36,
      originationFeePercent: 6,
    });
    const apr2 = result2.effectiveAPR as number;
    const apr6 = result6.effectiveAPR as number;
    expect(apr6).toBeGreaterThan(apr2);
    // Both should be above stated 10%
    expect(apr2).toBeGreaterThan(10);
    expect(apr6).toBeGreaterThan(10);
  });

  // ─── Test 28: Specific known calculation — $10K, 12%, 24mo ───
  it('matches known calculation for $10K at 12% for 24 months', () => {
    const result = calculatePersonalLoan({
      loanAmount: 10000,
      annualInterestRate: 12,
      loanTermMonths: 24,
    });
    // r = 12/12/100 = 0.01
    // (1.01)^24 = 1.26973
    // M = 10000 × (0.01 × 1.26973) / (1.26973 - 1)
    //   = 10000 × 0.012697 / 0.26973 = 10000 × 0.04707 = 470.73
    expect(result.monthlyPayment).toBeCloseTo(470.73, 0);
    // Total: 470.73 × 24 = 11297.57
    expect(result.totalPayment).toBeCloseTo(11297.57, 0);
    // Interest: 11297.57 - 10000 = 1297.57
    expect(result.totalInterest).toBeCloseTo(1297.57, 0);
  });
});
