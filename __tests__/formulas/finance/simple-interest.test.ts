import { calculateSimpleInterest } from '@/lib/formulas/finance/simple-interest';

describe('calculateSimpleInterest', () => {
  // ─── Test 1: Standard scenario — $10,000 at 5% for 3 years ───
  it('calculates standard simple interest correctly', () => {
    const result = calculateSimpleInterest({
      principal: 10000,
      annualRate: 5,
      years: 3,
    });
    // I = 10000 × 0.05 × 3 = $1,500
    expect(result.totalInterest).toBe(1500);
    expect(result.totalAmount).toBe(11500);
    expect(result.principal).toBe(10000);
  });

  // ─── Test 2: Zero interest rate ───
  it('handles zero interest rate correctly', () => {
    const result = calculateSimpleInterest({
      principal: 5000,
      annualRate: 0,
      years: 10,
    });
    expect(result.totalInterest).toBe(0);
    expect(result.totalAmount).toBe(5000);
    expect(result.monthlyInterest).toBe(0);
    expect(result.dailyInterest).toBe(0);
  });

  // ─── Test 3: Zero principal ───
  it('handles zero principal correctly', () => {
    const result = calculateSimpleInterest({
      principal: 0,
      annualRate: 5,
      years: 5,
    });
    expect(result.totalInterest).toBe(0);
    expect(result.totalAmount).toBe(0);
  });

  // ─── Test 4: Zero time period ───
  it('handles zero time period correctly', () => {
    const result = calculateSimpleInterest({
      principal: 10000,
      annualRate: 5,
      years: 0,
    });
    expect(result.totalInterest).toBe(0);
    expect(result.totalAmount).toBe(10000);
  });

  // ─── Test 5: With additional months ───
  it('calculates correctly with years and additional months', () => {
    const result = calculateSimpleInterest({
      principal: 10000,
      annualRate: 6,
      years: 2,
      months: 6,
    });
    // I = 10000 × 0.06 × 2.5 = $1,500
    expect(result.totalInterest).toBe(1500);
    expect(result.totalAmount).toBe(11500);
    expect(result.effectiveTime).toBe(2.5);
  });

  // ─── Test 6: Months only (no full years) ───
  it('calculates correctly with months only', () => {
    const result = calculateSimpleInterest({
      principal: 12000,
      annualRate: 4,
      years: 0,
      months: 6,
    });
    // I = 12000 × 0.04 × 0.5 = $240
    expect(result.totalInterest).toBe(240);
    expect(result.totalAmount).toBe(12240);
  });

  // ─── Test 7: Monthly interest calculation ───
  it('calculates monthly interest correctly', () => {
    const result = calculateSimpleInterest({
      principal: 24000,
      annualRate: 6,
      years: 1,
    });
    // Monthly = 24000 × 0.06 / 12 = $120
    expect(result.monthlyInterest).toBe(120);
  });

  // ─── Test 8: Daily interest calculation ───
  it('calculates daily interest correctly', () => {
    const result = calculateSimpleInterest({
      principal: 36500,
      annualRate: 10,
      years: 1,
    });
    // Daily = 36500 × 0.10 / 365 = $10.00
    expect(result.dailyInterest).toBe(10);
  });

  // ─── Test 9: Growth over time chart length ───
  it('generates growthOverTime with correct number of entries', () => {
    const result = calculateSimpleInterest({
      principal: 10000,
      annualRate: 5,
      years: 5,
    });
    const growthData = result.growthOverTime as Array<{ year: number; balance: number }>;
    // Year 0 through Year 5 = 6 entries
    expect(growthData).toHaveLength(6);
    expect(growthData[0].year).toBe(0);
    expect(growthData[5].year).toBe(5);
  });

  // ─── Test 10: Growth over time starts at principal ───
  it('growthOverTime starts at principal with zero interest', () => {
    const result = calculateSimpleInterest({
      principal: 10000,
      annualRate: 5,
      years: 5,
    });
    const growthData = result.growthOverTime as Array<{ year: number; balance: number; interest: number }>;
    expect(growthData[0].balance).toBe(10000);
    expect(growthData[0].interest).toBe(0);
  });

  // ─── Test 11: Linear growth (simple interest grows linearly, unlike compound) ───
  it('shows linear interest growth over time', () => {
    const result = calculateSimpleInterest({
      principal: 10000,
      annualRate: 10,
      years: 4,
    });
    const growthData = result.growthOverTime as Array<{ year: number; interest: number }>;
    // Year 1: $1000, Year 2: $2000, Year 3: $3000, Year 4: $4000
    expect(growthData[1].interest).toBe(1000);
    expect(growthData[2].interest).toBe(2000);
    expect(growthData[3].interest).toBe(3000);
    expect(growthData[4].interest).toBe(4000);
    // Verify constant increment (linear, not exponential)
    const increment1 = growthData[2].interest - growthData[1].interest;
    const increment2 = growthData[3].interest - growthData[2].interest;
    expect(increment1).toBe(increment2);
  });

  // ─── Test 12: Summary contains all required labels ───
  it('returns summary with all required labels', () => {
    const result = calculateSimpleInterest({
      principal: 10000,
      annualRate: 5,
      years: 3,
    });
    const summary = result.summary as Array<{ label: string; value: number }>;
    const labels = summary.map(s => s.label);
    expect(labels).toContain('Total Amount');
    expect(labels).toContain('Principal');
    expect(labels).toContain('Total Interest');
    expect(labels).toContain('Monthly Interest');
  });

  // ─── Test 13: Breakdown pie chart entries ───
  it('returns breakdown with principal and interest', () => {
    const result = calculateSimpleInterest({
      principal: 10000,
      annualRate: 5,
      years: 3,
    });
    const breakdown = result.breakdown as Array<{ name: string; value: number }>;
    expect(breakdown).toHaveLength(2);
    expect(breakdown[0]).toEqual({ name: 'Principal', value: 10000 });
    expect(breakdown[1]).toEqual({ name: 'Interest Earned', value: 1500 });
  });

  // ─── Test 14: Breakdown omits interest when zero ───
  it('omits interest from breakdown when zero', () => {
    const result = calculateSimpleInterest({
      principal: 10000,
      annualRate: 0,
      years: 5,
    });
    const breakdown = result.breakdown as Array<{ name: string; value: number }>;
    expect(breakdown).toHaveLength(1);
    expect(breakdown[0].name).toBe('Principal');
  });

  // ─── Test 15: Large principal ───
  it('handles large principal correctly', () => {
    const result = calculateSimpleInterest({
      principal: 1000000,
      annualRate: 3.5,
      years: 10,
    });
    // I = 1,000,000 × 0.035 × 10 = $350,000
    expect(result.totalInterest).toBe(350000);
    expect(result.totalAmount).toBe(1350000);
  });

  // ─── Test 16: Fractional rate ───
  it('handles fractional interest rates correctly', () => {
    const result = calculateSimpleInterest({
      principal: 5000,
      annualRate: 2.75,
      years: 4,
    });
    // I = 5000 × 0.0275 × 4 = $550
    expect(result.totalInterest).toBe(550);
    expect(result.totalAmount).toBe(5550);
  });

  // ─── Test 17: Total amount = principal + interest identity ───
  it('total amount equals principal plus interest', () => {
    const result = calculateSimpleInterest({
      principal: 7500,
      annualRate: 4.25,
      years: 6,
      months: 3,
    });
    const totalAmount = result.totalAmount as number;
    const principal = result.principal as number;
    const interest = result.totalInterest as number;
    expect(totalAmount).toBeCloseTo(principal + interest, 2);
  });

  // ─── Test 18: Effective time with months ───
  it('calculates effective time correctly with months', () => {
    const result = calculateSimpleInterest({
      principal: 10000,
      annualRate: 5,
      years: 1,
      months: 3,
    });
    expect(result.effectiveTime).toBe(1.25);
  });
});
