import { calculateMortgagePoints } from '@/lib/formulas/finance/mortgage-points';

describe('calculateMortgagePoints', () => {
  // ─── Test 1: Standard 1 point on $300k at 7% / 30yr ───
  it('calculates 1 point on $300,000 at 7% over 30 years', () => {
    const result = calculateMortgagePoints({
      loanAmount: 300000,
      interestRate: 7,
      pointsPurchased: 1,
      rateReductionPerPoint: 0.25,
      loanTerm: '30',
    });
    expect(result.pointsCost).toBe(3000);
    expect(result.newRate).toBe(6.75);
    expect(result.originalPayment).toBeCloseTo(1995.91, 0);
    expect(result.newPayment).toBeCloseTo(1946.10, 0);
    expect(Number(result.monthlySavings)).toBeGreaterThan(0);
    expect(Number(result.breakEvenMonths)).toBeGreaterThan(0);
  });

  // ─── Test 2: 2 points on $300k at 7% ───
  it('calculates 2 points on $300,000 at 7%', () => {
    const result = calculateMortgagePoints({
      loanAmount: 300000,
      interestRate: 7,
      pointsPurchased: 2,
      rateReductionPerPoint: 0.25,
      loanTerm: '30',
    });
    expect(result.pointsCost).toBe(6000);
    expect(result.newRate).toBe(6.5);
    // 2 points should save more per month than 1 point
    expect(Number(result.monthlySavings)).toBeGreaterThan(90);
  });

  // ─── Test 3: 0.5 points (fractional) ───
  it('calculates 0.5 points correctly', () => {
    const result = calculateMortgagePoints({
      loanAmount: 300000,
      interestRate: 7,
      pointsPurchased: 0.5,
      rateReductionPerPoint: 0.25,
      loanTerm: '30',
    });
    expect(result.pointsCost).toBe(1500);
    expect(result.newRate).toBe(6.875);
    expect(Number(result.monthlySavings)).toBeGreaterThan(0);
  });

  // ─── Test 4: Zero points — no savings ───
  it('returns no savings when 0 points purchased', () => {
    const result = calculateMortgagePoints({
      loanAmount: 300000,
      interestRate: 7,
      pointsPurchased: 0,
      rateReductionPerPoint: 0.25,
      loanTerm: '30',
    });
    expect(result.pointsCost).toBe(0);
    expect(result.newRate).toBe(7);
    expect(result.monthlySavings).toBe(0);
    expect(result.breakEvenMonths).toBe(0);
    expect(result.totalSavingsOverLoan).toBe(0);
    expect(result.roi).toBe(0);
  });

  // ─── Test 5: 15-year loan ───
  it('calculates correctly for a 15-year loan', () => {
    const result = calculateMortgagePoints({
      loanAmount: 300000,
      interestRate: 6.5,
      pointsPurchased: 1,
      rateReductionPerPoint: 0.25,
      loanTerm: '15',
    });
    expect(result.pointsCost).toBe(3000);
    expect(result.newRate).toBe(6.25);
    // 15-year loan has higher payments
    expect(Number(result.originalPayment)).toBeGreaterThan(2500);
    expect(Number(result.monthlySavings)).toBeGreaterThan(0);
    // Break-even should be reasonable
    expect(Number(result.breakEvenMonths)).toBeGreaterThan(0);
    expect(Number(result.breakEvenMonths)).toBeLessThan(180);
  });

  // ─── Test 6: High rate (9%) ───
  it('calculates correctly at a high interest rate (9%)', () => {
    const result = calculateMortgagePoints({
      loanAmount: 300000,
      interestRate: 9,
      pointsPurchased: 2,
      rateReductionPerPoint: 0.25,
      loanTerm: '30',
    });
    expect(result.pointsCost).toBe(6000);
    expect(result.newRate).toBe(8.5);
    expect(Number(result.monthlySavings)).toBeGreaterThan(0);
    expect(Number(result.interestSaved)).toBeGreaterThan(0);
  });

  // ─── Test 7: Low rate (4%) ───
  it('calculates correctly at a low interest rate (4%)', () => {
    const result = calculateMortgagePoints({
      loanAmount: 300000,
      interestRate: 4,
      pointsPurchased: 1,
      rateReductionPerPoint: 0.25,
      loanTerm: '30',
    });
    expect(result.pointsCost).toBe(3000);
    expect(result.newRate).toBe(3.75);
    expect(Number(result.monthlySavings)).toBeGreaterThan(0);
  });

  // ─── Test 8: Different rate reduction per point ───
  it('handles different rateReductionPerPoint values', () => {
    const result = calculateMortgagePoints({
      loanAmount: 300000,
      interestRate: 7,
      pointsPurchased: 1,
      rateReductionPerPoint: 0.5,
      loanTerm: '30',
    });
    expect(result.newRate).toBe(6.5);
    // Larger rate reduction = more savings
    expect(Number(result.monthlySavings)).toBeGreaterThan(90);
  });

  // ─── Test 9: Break-even accuracy ───
  it('break-even months times monthly savings approximately equals points cost', () => {
    const result = calculateMortgagePoints({
      loanAmount: 300000,
      interestRate: 7,
      pointsPurchased: 1,
      rateReductionPerPoint: 0.25,
      loanTerm: '30',
    });
    const monthlySavings = Number(result.monthlySavings);
    const breakEvenMonths = Number(result.breakEvenMonths);
    const pointsCost = Number(result.pointsCost);
    // Break-even is ceiling, so product should be >= pointsCost
    expect(monthlySavings * breakEvenMonths).toBeGreaterThanOrEqual(pointsCost);
    // But not much more than pointsCost (within 1 month of savings)
    expect(monthlySavings * breakEvenMonths).toBeLessThan(pointsCost + monthlySavings + 0.01);
  });

  // ─── Test 10: Total savings = interest saved minus cost ───
  it('totalSavingsOverLoan equals interestSaved minus pointsCost', () => {
    const result = calculateMortgagePoints({
      loanAmount: 400000,
      interestRate: 7,
      pointsPurchased: 2,
      rateReductionPerPoint: 0.25,
      loanTerm: '30',
    });
    const interestSaved = Number(result.interestSaved);
    const pointsCost = Number(result.pointsCost);
    const totalSavings = Number(result.totalSavingsOverLoan);
    expect(totalSavings).toBeCloseTo(interestSaved - pointsCost, 1);
  });

  // ─── Test 11: Interest saved is positive ───
  it('interestSaved is positive when points are purchased', () => {
    const result = calculateMortgagePoints({
      loanAmount: 300000,
      interestRate: 7,
      pointsPurchased: 1,
      rateReductionPerPoint: 0.25,
      loanTerm: '30',
    });
    expect(Number(result.interestSaved)).toBeGreaterThan(0);
    expect(Number(result.originalTotalInterest)).toBeGreaterThan(Number(result.newTotalInterest));
  });

  // ─── Test 12: ROI calculation ───
  it('calculates ROI correctly', () => {
    const result = calculateMortgagePoints({
      loanAmount: 300000,
      interestRate: 7,
      pointsPurchased: 1,
      rateReductionPerPoint: 0.25,
      loanTerm: '30',
    });
    const interestSaved = Number(result.interestSaved);
    const pointsCost = Number(result.pointsCost);
    const expectedROI = ((interestSaved - pointsCost) / pointsCost) * 100;
    expect(Number(result.roi)).toBeCloseTo(expectedROI, 0);
    // ROI should be significantly positive for a full 30-year hold
    expect(Number(result.roi)).toBeGreaterThan(100);
  });

  // ─── Test 13: Zero loan amount ───
  it('handles zero loan amount gracefully', () => {
    const result = calculateMortgagePoints({
      loanAmount: 0,
      interestRate: 7,
      pointsPurchased: 1,
      rateReductionPerPoint: 0.25,
      loanTerm: '30',
    });
    expect(result.pointsCost).toBe(0);
    expect(result.originalPayment).toBe(0);
    expect(result.newPayment).toBe(0);
    expect(result.monthlySavings).toBe(0);
    expect(result.breakEvenMonths).toBe(0);
  });

  // ─── Test 14: Original vs new payment relationship ───
  it('original payment is always >= new payment', () => {
    const result = calculateMortgagePoints({
      loanAmount: 500000,
      interestRate: 7.5,
      pointsPurchased: 3,
      rateReductionPerPoint: 0.25,
      loanTerm: '30',
    });
    expect(Number(result.originalPayment)).toBeGreaterThanOrEqual(Number(result.newPayment));
  });

  // ─── Test 15: Large loan ($750k) ───
  it('handles large loan amounts correctly ($750,000)', () => {
    const result = calculateMortgagePoints({
      loanAmount: 750000,
      interestRate: 7,
      pointsPurchased: 1,
      rateReductionPerPoint: 0.25,
      loanTerm: '30',
    });
    expect(result.pointsCost).toBe(7500);
    // Monthly savings should scale proportionally to $300k case
    expect(Number(result.monthlySavings)).toBeGreaterThan(100);
    expect(Number(result.totalSavingsOverLoan)).toBeGreaterThan(0);
  });

  // ─── Test 16: Comparison table structure ───
  it('returns comparisonTable with correct structure', () => {
    const result = calculateMortgagePoints({
      loanAmount: 300000,
      interestRate: 7,
      pointsPurchased: 1,
      rateReductionPerPoint: 0.25,
      loanTerm: '30',
    });
    const table = result.comparisonTable as Array<{ label: string; value: number }>;
    expect(table).toHaveLength(3);
    expect(table[0].label).toBe('Without Points');
    expect(table[1].label).toBe('With Points');
    expect(table[2].label).toBe('Monthly Savings');
    expect(table[0].value).toBe(result.originalPayment);
    expect(table[1].value).toBe(result.newPayment);
    expect(table[2].value).toBe(result.monthlySavings);
  });

  // ─── Test 17: Output structure has all required fields ───
  it('returns all expected output fields', () => {
    const result = calculateMortgagePoints({
      loanAmount: 300000,
      interestRate: 7,
      pointsPurchased: 1,
      rateReductionPerPoint: 0.25,
      loanTerm: '30',
    });
    expect(result).toHaveProperty('pointsCost');
    expect(result).toHaveProperty('newRate');
    expect(result).toHaveProperty('originalPayment');
    expect(result).toHaveProperty('newPayment');
    expect(result).toHaveProperty('monthlySavings');
    expect(result).toHaveProperty('breakEvenMonths');
    expect(result).toHaveProperty('breakEvenYears');
    expect(result).toHaveProperty('totalSavingsOverLoan');
    expect(result).toHaveProperty('originalTotalInterest');
    expect(result).toHaveProperty('newTotalInterest');
    expect(result).toHaveProperty('interestSaved');
    expect(result).toHaveProperty('roi');
    expect(result).toHaveProperty('comparisonTable');
  });

  // ─── Test 18: Rate reduction exceeding original rate caps at 0% ───
  it('caps new rate at 0% when reduction exceeds original rate', () => {
    const result = calculateMortgagePoints({
      loanAmount: 300000,
      interestRate: 3,
      pointsPurchased: 5,
      rateReductionPerPoint: 0.25,
      loanTerm: '30',
    });
    // 3% - (5 × 0.25%) = 3% - 1.25% = 1.75% — still positive
    expect(result.newRate).toBe(1.75);

    // Edge case: rate reduction exceeds rate
    const result2 = calculateMortgagePoints({
      loanAmount: 300000,
      interestRate: 1,
      pointsPurchased: 5,
      rateReductionPerPoint: 0.5,
      loanTerm: '30',
    });
    // 1% - (5 × 0.5%) = 1% - 2.5% → capped at 0%
    expect(result2.newRate).toBe(0);
  });

  // ─── Test 19: Break-even years matches months ───
  it('breakEvenYears equals breakEvenMonths / 12', () => {
    const result = calculateMortgagePoints({
      loanAmount: 300000,
      interestRate: 7,
      pointsPurchased: 1,
      rateReductionPerPoint: 0.25,
      loanTerm: '30',
    });
    const months = Number(result.breakEvenMonths);
    const years = Number(result.breakEvenYears);
    expect(years).toBeCloseTo(months / 12, 1);
  });

  // ─── Test 20: 5 points maximum ───
  it('calculates correctly with 5 points', () => {
    const result = calculateMortgagePoints({
      loanAmount: 400000,
      interestRate: 8,
      pointsPurchased: 5,
      rateReductionPerPoint: 0.25,
      loanTerm: '30',
    });
    expect(result.pointsCost).toBe(20000);
    expect(result.newRate).toBe(6.75);
    expect(Number(result.monthlySavings)).toBeGreaterThan(200);
    expect(Number(result.roi)).toBeGreaterThan(0);
  });
});
