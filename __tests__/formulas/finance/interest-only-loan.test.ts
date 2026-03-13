import { calculateInterestOnlyLoan } from '@/lib/formulas/finance/interest-only-loan';

describe('calculateInterestOnlyLoan', () => {
  const defaultInputs = {
    loanAmount: 300000,
    annualInterestRate: 7,
    totalTermYears: '30',
    interestOnlyYears: '10',
  };

  // ─── Test 1: IO payment on $300K at 7% ───
  it('calculates correct IO payment for default values', () => {
    const result = calculateInterestOnlyLoan(defaultInputs);
    // $300,000 × (0.07 / 12) = $1,750.00
    expect(result.interestOnlyPayment).toBe(1750);
  });

  // ─── Test 2: IO payment = principal × monthly rate exactly ───
  it('IO payment equals principal times monthly rate', () => {
    const result = calculateInterestOnlyLoan({
      loanAmount: 200000,
      annualInterestRate: 6,
      totalTermYears: '30',
      interestOnlyYears: '5',
    });
    // $200,000 × (0.06 / 12) = $1,000.00
    expect(result.interestOnlyPayment).toBe(1000);
  });

  // ─── Test 3: Payment jump after IO period is positive ───
  it('payment increases after IO period ends', () => {
    const result = calculateInterestOnlyLoan(defaultInputs);
    expect(Number(result.paymentIncrease)).toBeGreaterThan(0);
    expect(Number(result.fullyAmortizingPayment)).toBeGreaterThan(Number(result.interestOnlyPayment));
  });

  // ─── Test 4: Compare with standard fully amortizing ───
  it('standard payment falls between IO and post-IO payment', () => {
    const result = calculateInterestOnlyLoan(defaultInputs);
    // Standard 30-year payment should be higher than IO payment
    expect(Number(result.standardPayment)).toBeGreaterThan(Number(result.interestOnlyPayment));
    // Standard 30-year payment should be lower than compressed amortizing payment
    expect(Number(result.standardPayment)).toBeLessThan(Number(result.fullyAmortizingPayment));
  });

  // ─── Test 5: Short IO period (3 years) ───
  it('handles 3-year IO period correctly', () => {
    const result = calculateInterestOnlyLoan({
      ...defaultInputs,
      interestOnlyYears: '3',
    });
    // IO payment is the same regardless of IO period length
    expect(result.interestOnlyPayment).toBe(1750);
    // Amortizing period is 27 years = 324 months, less compressed than 20-year
    const result10yr = calculateInterestOnlyLoan(defaultInputs);
    expect(Number(result.fullyAmortizingPayment)).toBeLessThan(Number(result10yr.fullyAmortizingPayment));
  });

  // ─── Test 6: Long IO period (10 years on 30-year) ───
  it('calculates total interest during IO period for 10-year IO', () => {
    const result = calculateInterestOnlyLoan(defaultInputs);
    // IO interest = $1,750 × 120 months = $210,000
    const costBreakdown = result.costBreakdown as Record<string, number>;
    expect(costBreakdown.interestDuringIOPeriod).toBe(210000);
  });

  // ─── Test 7: 15-year total term with 5-year IO ───
  it('handles 15-year total term with 5-year IO', () => {
    const result = calculateInterestOnlyLoan({
      loanAmount: 300000,
      annualInterestRate: 7,
      totalTermYears: '15',
      interestOnlyYears: '5',
    });
    // IO payment is the same: $1,750
    expect(result.interestOnlyPayment).toBe(1750);
    // Amortizing over 10 years = 120 months → much higher payment
    expect(Number(result.fullyAmortizingPayment)).toBeGreaterThan(3000);
  });

  // ─── Test 8: Low interest rate (3%) ───
  it('handles low interest rate correctly', () => {
    const result = calculateInterestOnlyLoan({
      ...defaultInputs,
      annualInterestRate: 3,
    });
    // $300,000 × (0.03 / 12) = $750.00
    expect(result.interestOnlyPayment).toBe(750);
    expect(Number(result.totalInterest)).toBeGreaterThan(0);
  });

  // ─── Test 9: High interest rate (12%) ───
  it('handles high interest rate correctly', () => {
    const result = calculateInterestOnlyLoan({
      ...defaultInputs,
      annualInterestRate: 12,
    });
    // $300,000 × (0.12 / 12) = $3,000.00
    expect(result.interestOnlyPayment).toBe(3000);
    // Total interest should be very large
    expect(Number(result.totalInterest)).toBeGreaterThan(500000);
  });

  // ─── Test 10: Small loan ($50K) ───
  it('handles small loan amount', () => {
    const result = calculateInterestOnlyLoan({
      ...defaultInputs,
      loanAmount: 50000,
    });
    // $50,000 × (0.07 / 12) ≈ $291.67
    expect(result.interestOnlyPayment).toBeCloseTo(291.67, 1);
  });

  // ─── Test 11: Large loan ($1M) ───
  it('handles large loan amount', () => {
    const result = calculateInterestOnlyLoan({
      ...defaultInputs,
      loanAmount: 1000000,
    });
    // $1,000,000 × (0.07 / 12) ≈ $5,833.33
    expect(result.interestOnlyPayment).toBeCloseTo(5833.33, 1);
    expect(Number(result.fullyAmortizingPayment)).toBeGreaterThan(Number(result.interestOnlyPayment));
  });

  // ─── Test 12: IO period equals total term (edge case) ───
  it('handles IO period equal to total term gracefully', () => {
    const result = calculateInterestOnlyLoan({
      ...defaultInputs,
      totalTermYears: '10',
      interestOnlyYears: '10',
    });
    // No amortizing period — payment after IO should be 0 or handled gracefully
    expect(result.fullyAmortizingPayment).toBe(0);
    expect(result.amortizingMonths).toBe(0);
    // Full principal remains as balloon balance
    const costBreakdown = result.costBreakdown as Record<string, number>;
    expect(costBreakdown.balloonBalance).toBe(300000);
  });

  // ─── Test 13: Total interest IO > standard loan total interest ───
  it('IO loan has higher total interest than standard loan', () => {
    const result = calculateInterestOnlyLoan(defaultInputs);
    expect(Number(result.totalInterest)).toBeGreaterThan(Number(result.totalInterestStandard));
    expect(Number(result.interestDifference)).toBeGreaterThan(0);
  });

  // ─── Test 14: Cost breakdown structure ───
  it('returns properly structured cost breakdown', () => {
    const result = calculateInterestOnlyLoan(defaultInputs);
    const costBreakdown = result.costBreakdown as Record<string, number>;
    expect(costBreakdown).toHaveProperty('interestDuringIOPeriod');
    expect(costBreakdown).toHaveProperty('interestDuringAmortizingPeriod');
    expect(costBreakdown).toHaveProperty('principalRepaid');
    expect(costBreakdown.interestDuringIOPeriod).toBeGreaterThan(0);
    expect(costBreakdown.interestDuringAmortizingPeriod).toBeGreaterThan(0);
    expect(costBreakdown.principalRepaid).toBe(300000);
  });

  // ─── Test 15: String inputs work (select fields pass strings) ───
  it('handles string inputs for totalTermYears and interestOnlyYears', () => {
    const resultStrings = calculateInterestOnlyLoan({
      loanAmount: 300000,
      annualInterestRate: 7,
      totalTermYears: '30',
      interestOnlyYears: '10',
    });
    const resultNumbers = calculateInterestOnlyLoan({
      loanAmount: 300000,
      annualInterestRate: 7,
      totalTermYears: 30,
      interestOnlyYears: 10,
    });
    expect(resultStrings.interestOnlyPayment).toBe(resultNumbers.interestOnlyPayment);
    expect(resultStrings.fullyAmortizingPayment).toBe(resultNumbers.fullyAmortizingPayment);
    expect(resultStrings.totalInterest).toBe(resultNumbers.totalInterest);
  });

  // ─── Test 16: Payment increase percent is correct ───
  it('payment increase percentage is mathematically correct', () => {
    const result = calculateInterestOnlyLoan(defaultInputs);
    const ioPayment = Number(result.interestOnlyPayment);
    const increase = Number(result.paymentIncrease);
    const percent = Number(result.paymentIncreasePercent);
    // percent = (increase / ioPayment) * 100
    const expectedPercent = Math.round((increase / ioPayment) * 100 * 100) / 100;
    expect(percent).toBeCloseTo(expectedPercent, 1);
  });

  // ─── Test 17: Total cost IO includes principal + interest ───
  it('total cost includes both principal and interest', () => {
    const result = calculateInterestOnlyLoan(defaultInputs);
    const totalCostIO = Number(result.totalCostIO);
    const totalInterest = Number(result.totalInterest);
    // Total cost = interest + principal
    expect(totalCostIO).toBeCloseTo(totalInterest + 300000, 0);
  });

  // ─── Test 18: Zero interest rate ───
  it('handles zero interest rate gracefully', () => {
    const result = calculateInterestOnlyLoan({
      ...defaultInputs,
      annualInterestRate: 0,
    });
    expect(result.interestOnlyPayment).toBe(0);
    expect(result.totalInterest).toBe(0);
    // Amortizing payment at 0% = principal / months
    // $300,000 / 240 months = $1,250
    expect(Number(result.fullyAmortizingPayment)).toBe(1250);
  });

  // ─── Test 19: Zero loan amount ───
  it('handles zero loan amount', () => {
    const result = calculateInterestOnlyLoan({
      ...defaultInputs,
      loanAmount: 0,
    });
    expect(result.interestOnlyPayment).toBe(0);
    expect(result.fullyAmortizingPayment).toBe(0);
    expect(result.standardPayment).toBe(0);
    expect(result.totalInterest).toBe(0);
  });

  // ─── Test 20: 20-year term with 7-year IO ───
  it('handles 20-year term with 7-year IO correctly', () => {
    const result = calculateInterestOnlyLoan({
      loanAmount: 400000,
      annualInterestRate: 6.5,
      totalTermYears: '20',
      interestOnlyYears: '7',
    });
    // IO payment: $400,000 × (0.065 / 12) ≈ $2,166.67
    expect(result.interestOnlyPayment).toBeCloseTo(2166.67, 0);
    // Amortizing over 13 years = 156 months
    expect(result.amortizingMonths).toBe(156);
    expect(Number(result.fullyAmortizingPayment)).toBeGreaterThan(Number(result.interestOnlyPayment));
  });

  // ─── Test 21: IO interest breakdown sums to total interest ───
  it('IO period interest + amortizing period interest = total interest', () => {
    const result = calculateInterestOnlyLoan(defaultInputs);
    const costBreakdown = result.costBreakdown as Record<string, number>;
    const summedInterest = costBreakdown.interestDuringIOPeriod + costBreakdown.interestDuringAmortizingPeriod;
    expect(summedInterest).toBeCloseTo(Number(result.totalInterest), 0);
  });

  // ─── Test 22: All expected output keys present ───
  it('returns all expected output keys', () => {
    const result = calculateInterestOnlyLoan(defaultInputs);
    expect(result).toHaveProperty('interestOnlyPayment');
    expect(result).toHaveProperty('fullyAmortizingPayment');
    expect(result).toHaveProperty('standardPayment');
    expect(result).toHaveProperty('paymentIncrease');
    expect(result).toHaveProperty('paymentIncreasePercent');
    expect(result).toHaveProperty('totalInterest');
    expect(result).toHaveProperty('totalInterestStandard');
    expect(result).toHaveProperty('interestDifference');
    expect(result).toHaveProperty('totalCostIO');
    expect(result).toHaveProperty('totalCostStandard');
    expect(result).toHaveProperty('ioMonths');
    expect(result).toHaveProperty('amortizingMonths');
    expect(result).toHaveProperty('costBreakdown');
  });

  // ─── Test 23: IO months and amortizing months sum to total months ───
  it('IO months + amortizing months = total months', () => {
    const result = calculateInterestOnlyLoan(defaultInputs);
    expect(Number(result.ioMonths) + Number(result.amortizingMonths)).toBe(360);
  });

  // ─── Test 24: 25-year term with 5-year IO ───
  it('handles 25-year term with 5-year IO', () => {
    const result = calculateInterestOnlyLoan({
      loanAmount: 250000,
      annualInterestRate: 5.5,
      totalTermYears: '25',
      interestOnlyYears: '5',
    });
    // IO payment: $250,000 × (0.055 / 12) ≈ $1,145.83
    expect(result.interestOnlyPayment).toBeCloseTo(1145.83, 0);
    expect(result.ioMonths).toBe(60);
    expect(result.amortizingMonths).toBe(240);
  });

  // ─── Test 25: Interest difference is non-negative ───
  it('interest difference is always non-negative', () => {
    const scenarios = [
      { ...defaultInputs },
      { ...defaultInputs, annualInterestRate: 3 },
      { ...defaultInputs, interestOnlyYears: '3' },
      { ...defaultInputs, totalTermYears: '15', interestOnlyYears: '5' },
    ];
    for (const scenario of scenarios) {
      const result = calculateInterestOnlyLoan(scenario);
      expect(Number(result.interestDifference)).toBeGreaterThanOrEqual(0);
    }
  });
});
