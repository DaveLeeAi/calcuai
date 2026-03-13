import { calculateFireNumber } from '@/lib/formulas/finance/fire-number';

describe('calculateFireNumber', () => {
  // ─── Test 1: Classic FIRE — $40K expenses, 4% SWR → $1M FIRE number ───
  it('classic FIRE scenario: $40K expenses at 4% SWR = $1M', () => {
    const result = calculateFireNumber({
      annualExpenses: 40000,
      annualIncome: 80000,
      currentSavings: 100000,
      annualReturn: 7,
      safeWithdrawalRate: 4,
    });
    expect(result.fireNumber).toBe(1000000);
    expect(result.annualSavings).toBe(40000);
    expect(result.savingsRate).toBe(50);
  });

  // ─── Test 2: Already FIRE — savings exceed fire number ───
  it('already FIRE when savings exceed fire number', () => {
    const result = calculateFireNumber({
      annualExpenses: 30000,
      annualIncome: 80000,
      currentSavings: 1000000,
      annualReturn: 7,
      safeWithdrawalRate: 4,
    });
    // FIRE number = 30000 / 0.04 = $750,000
    expect(result.fireNumber).toBe(750000);
    expect(result.yearsToFire).toBe(0);
  });

  // ─── Test 3: Zero savings start ───
  it('calculates years to FIRE from zero savings', () => {
    const result = calculateFireNumber({
      annualExpenses: 40000,
      annualIncome: 80000,
      currentSavings: 0,
      annualReturn: 7,
      safeWithdrawalRate: 4,
    });
    expect(result.fireNumber).toBe(1000000);
    const years = result.yearsToFire as number;
    // $40K/year savings at 7% to reach $1M from $0 — should take ~14-16 years
    expect(years).toBeGreaterThanOrEqual(13);
    expect(years).toBeLessThanOrEqual(17);
  });

  // ─── Test 4: Zero return — linear savings ───
  it('zero return means linear accumulation', () => {
    const result = calculateFireNumber({
      annualExpenses: 20000,
      annualIncome: 60000,
      currentSavings: 0,
      annualReturn: 0,
      safeWithdrawalRate: 4,
    });
    // FIRE number = $500,000, savings = $40K/year, years = 500000/40000 = 12.5 → ceil to 13
    expect(result.fireNumber).toBe(500000);
    expect(result.yearsToFire).toBe(13);
  });

  // ─── Test 5: Expenses equal income — never reaches FIRE ───
  it('expenses equal income means FIRE is impossible', () => {
    const result = calculateFireNumber({
      annualExpenses: 80000,
      annualIncome: 80000,
      currentSavings: 0,
      annualReturn: 7,
      safeWithdrawalRate: 4,
    });
    expect(result.annualSavings).toBe(0);
    expect(result.savingsRate).toBe(0);
    expect(result.yearsToFire).toBe(-1); // impossible
  });

  // ─── Test 6: Expenses exceed income — negative savings ───
  it('expenses exceeding income means FIRE is impossible', () => {
    const result = calculateFireNumber({
      annualExpenses: 90000,
      annualIncome: 70000,
      currentSavings: 50000,
      annualReturn: 7,
      safeWithdrawalRate: 4,
    });
    expect(result.annualSavings).toBe(-20000);
    expect(result.yearsToFire).toBe(-1);
  });

  // ─── Test 7: Very high income vs expenses — fast FIRE ───
  it('high savings rate leads to fast FIRE', () => {
    const result = calculateFireNumber({
      annualExpenses: 30000,
      annualIncome: 200000,
      currentSavings: 200000,
      annualReturn: 8,
      safeWithdrawalRate: 4,
    });
    // FIRE number = $750,000, saving $170K/year at 8% from $200K
    const years = result.yearsToFire as number;
    expect(years).toBeLessThanOrEqual(4);
    expect(result.savingsRate).toBe(85);
  });

  // ─── Test 8: 3% SWR yields higher FIRE number ───
  it('lower SWR increases FIRE number', () => {
    const result3 = calculateFireNumber({
      annualExpenses: 40000,
      annualIncome: 80000,
      currentSavings: 100000,
      annualReturn: 7,
      safeWithdrawalRate: 3,
    });
    const result4 = calculateFireNumber({
      annualExpenses: 40000,
      annualIncome: 80000,
      currentSavings: 100000,
      annualReturn: 7,
      safeWithdrawalRate: 4,
    });
    // 3% SWR: $40K/0.03 = $1,333,333 vs 4% SWR: $1,000,000
    expect(result3.fireNumber as number).toBeGreaterThan(result4.fireNumber as number);
    expect(result3.fireNumber).toBeCloseTo(1333333.33, 0);
  });

  // ─── Test 9: 5% SWR yields lower FIRE number ───
  it('higher SWR decreases FIRE number', () => {
    const result = calculateFireNumber({
      annualExpenses: 40000,
      annualIncome: 80000,
      currentSavings: 100000,
      annualReturn: 7,
      safeWithdrawalRate: 5,
    });
    // 5% SWR: $40K/0.05 = $800,000
    expect(result.fireNumber).toBe(800000);
  });

  // ─── Test 10: Large expenses ($200K) ───
  it('high expenses require large FIRE number', () => {
    const result = calculateFireNumber({
      annualExpenses: 200000,
      annualIncome: 300000,
      currentSavings: 500000,
      annualReturn: 7,
      safeWithdrawalRate: 4,
    });
    // FIRE number = $5,000,000
    expect(result.fireNumber).toBe(5000000);
    const years = result.yearsToFire as number;
    expect(years).toBeGreaterThan(10);
  });

  // ─── Test 11: Verify progressChart is generated ───
  it('generates progressChart with correct structure', () => {
    const result = calculateFireNumber({
      annualExpenses: 40000,
      annualIncome: 80000,
      currentSavings: 100000,
      annualReturn: 7,
      safeWithdrawalRate: 4,
    });
    const chart = result.progressChart as { year: number; portfolio: number; fireTarget: number }[];
    expect(chart.length).toBeGreaterThan(1);
    expect(chart[0].year).toBe(0);
    expect(chart[0].portfolio).toBe(100000);
    expect(chart[0].fireTarget).toBe(1000000);
    // All entries should have fireTarget = FIRE number
    for (const point of chart) {
      expect(point.fireTarget).toBe(1000000);
    }
  });

  // ─── Test 12: Verify summary labels ───
  it('summary contains all required labels', () => {
    const result = calculateFireNumber({
      annualExpenses: 40000,
      annualIncome: 80000,
      currentSavings: 100000,
      annualReturn: 7,
      safeWithdrawalRate: 4,
    });
    const summary = result.summary as { label: string; value: number | string }[];
    const labels = summary.map(s => s.label);
    expect(labels).toContain('FIRE Number');
    expect(labels).toContain('Years to FIRE');
    expect(labels).toContain('Annual Savings');
    expect(labels).toContain('Monthly Savings');
    expect(labels).toContain('Savings Rate');
    expect(labels).toContain('Monthly Expenses');
    expect(summary.length).toBe(6);
  });

  // ─── Test 13: Monthly expenses calculation ───
  it('calculates monthly expenses correctly', () => {
    const result = calculateFireNumber({
      annualExpenses: 48000,
      annualIncome: 100000,
      currentSavings: 0,
      annualReturn: 7,
      safeWithdrawalRate: 4,
    });
    expect(result.monthlyExpenses).toBe(4000);
    expect(result.monthlySavings).toBeCloseTo(4333.33, 0);
  });

  // ─── Test 14: Savings rate precision ───
  it('savings rate calculated with correct precision', () => {
    const result = calculateFireNumber({
      annualExpenses: 33000,
      annualIncome: 100000,
      currentSavings: 0,
      annualReturn: 7,
      safeWithdrawalRate: 4,
    });
    // savingsRate = (67000 / 100000) * 100 = 67.0%
    expect(result.savingsRate).toBe(67);
    expect(result.annualSavings).toBe(67000);
  });

  // ─── Test 15: Already FIRE with large surplus still returns 0 years ───
  it('large surplus still returns 0 years to FIRE', () => {
    const result = calculateFireNumber({
      annualExpenses: 20000,
      annualIncome: 50000,
      currentSavings: 5000000,
      annualReturn: 7,
      safeWithdrawalRate: 4,
    });
    // FIRE number = $500,000 — already well past it
    expect(result.yearsToFire).toBe(0);
    expect(result.fireNumber).toBe(500000);
  });
});
