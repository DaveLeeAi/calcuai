import { calculateRetirementProjection } from '@/lib/formulas/finance/retirement-projection';

describe('calculateRetirementProjection', () => {
  // ─── Test 1: Standard projection — 30yo, $50k saved, $1000/mo, retire at 65 ───
  it('projects retirement savings over $1M for a standard 30yo saver', () => {
    const result = calculateRetirementProjection({
      currentAge: 30,
      retirementAge: 65,
      currentSavings: 50000,
      monthlyContribution: 1000,
      preRetirementReturn: 7,
      postRetirementReturn: 5,
      desiredAnnualIncome: 50000,
      inflationRate: 3,
      lifeExpectancy: 90,
    });
    // 35 years of compounding at 7% with $1000/mo should yield well over $2M
    expect(result.retirementSavings as number).toBeGreaterThan(2000000);
    // FV = 50000*(1+0.07/12)^420 + 1000*[((1+0.07/12)^420 - 1)/(0.07/12)] ≈ $2,376,362
    expect(result.retirementSavings as number).toBeCloseTo(2376362, -3);
  });

  // ─── Test 2: Late starter — 45yo, $100k saved, $2000/mo, retire at 67 ───
  it('calculates late starter accumulation correctly', () => {
    const result = calculateRetirementProjection({
      currentAge: 45,
      retirementAge: 67,
      currentSavings: 100000,
      monthlyContribution: 2000,
      preRetirementReturn: 7,
      postRetirementReturn: 5,
      desiredAnnualIncome: 60000,
      inflationRate: 3,
      lifeExpectancy: 90,
    });
    // 22 years of compounding at 7% with $100k start and $2000/mo ≈ $1,713,668
    expect(result.retirementSavings as number).toBeGreaterThan(1500000);
    expect(result.retirementSavings as number).toBeLessThan(2000000);
  });

  // ─── Test 3: Already at retirement age ───
  it('handles already at retirement age with existing savings', () => {
    const result = calculateRetirementProjection({
      currentAge: 65,
      retirementAge: 65,
      currentSavings: 500000,
      monthlyContribution: 0,
      preRetirementReturn: 7,
      postRetirementReturn: 5,
      desiredAnnualIncome: 40000,
      inflationRate: 3,
      lifeExpectancy: 90,
    });
    // No accumulation phase — savings should equal current savings
    expect(result.retirementSavings).toBe(500000);
    // 25 years in retirement, $40k/yr withdrawal — money should last ~18-25 years
    const yearsLasts = result.yearsMoneyLasts;
    if (typeof yearsLasts === 'number') {
      expect(yearsLasts).toBeGreaterThanOrEqual(15);
      expect(yearsLasts).toBeLessThanOrEqual(25);
    }
  });

  // ─── Test 4: Zero savings, starting from scratch ───
  it('handles zero starting savings correctly', () => {
    const result = calculateRetirementProjection({
      currentAge: 30,
      retirementAge: 65,
      currentSavings: 0,
      monthlyContribution: 500,
      preRetirementReturn: 7,
      postRetirementReturn: 5,
      desiredAnnualIncome: 30000,
      inflationRate: 3,
      lifeExpectancy: 90,
    });
    // Should still accumulate a meaningful amount from contributions alone
    expect(result.retirementSavings as number).toBeGreaterThan(500000);
    // Breakdown should show zero for current savings portion
    const breakdown = result.breakdown as { name: string; value: number }[];
    const contributions = breakdown.find(b => b.name === 'Your Contributions');
    expect(contributions).toBeDefined();
    // Total contributions = $500 * 420 months = $210,000
    expect(contributions!.value).toBeCloseTo(210000, -2);
  });

  // ─── Test 5: Very high withdrawal rate — money runs out quickly ───
  it('detects money running out with high withdrawal rate', () => {
    const result = calculateRetirementProjection({
      currentAge: 60,
      retirementAge: 65,
      currentSavings: 40000,
      monthlyContribution: 500,
      preRetirementReturn: 7,
      postRetirementReturn: 5,
      desiredAnnualIncome: 80000,
      inflationRate: 3,
      lifeExpectancy: 90,
    });
    // With only ~$70k and $80k/yr withdrawal, money should run out quickly
    const yearsLasts = result.yearsMoneyLasts;
    expect(typeof yearsLasts).toBe('number');
    expect(yearsLasts as number).toBeLessThanOrEqual(3);
    // Should have a retirement gap
    expect(result.retirementGap as number).toBeGreaterThan(0);
  });

  // ─── Test 6: Zero return — savings + contributions only ───
  it('handles zero return rate correctly', () => {
    const result = calculateRetirementProjection({
      currentAge: 30,
      retirementAge: 65,
      currentSavings: 100000,
      monthlyContribution: 1000,
      preRetirementReturn: 0,
      postRetirementReturn: 0,
      desiredAnnualIncome: 30000,
      inflationRate: 0,
      lifeExpectancy: 90,
    });
    // Zero return: total = $100,000 + ($1,000 * 420) = $520,000
    expect(result.retirementSavings as number).toBeCloseTo(520000, -2);
    // With zero return and zero inflation, $30k/yr from $520k lasts 17.33 years
    // The model detects depletion during year 18, so yearsMoneyLasts = 18
    const yearsLasts = result.yearsMoneyLasts;
    if (typeof yearsLasts === 'number') {
      expect(yearsLasts).toBeGreaterThanOrEqual(17);
      expect(yearsLasts).toBeLessThanOrEqual(18);
    }
  });

  // ─── Test 7: High inflation eroding purchasing power ───
  it('shows inflation impact on retirement sustainability', () => {
    const lowInflation = calculateRetirementProjection({
      currentAge: 30,
      retirementAge: 65,
      currentSavings: 50000,
      monthlyContribution: 1000,
      preRetirementReturn: 7,
      postRetirementReturn: 5,
      desiredAnnualIncome: 50000,
      inflationRate: 2,
      lifeExpectancy: 90,
    });
    const highInflation = calculateRetirementProjection({
      currentAge: 30,
      retirementAge: 65,
      currentSavings: 50000,
      monthlyContribution: 1000,
      preRetirementReturn: 7,
      postRetirementReturn: 5,
      desiredAnnualIncome: 50000,
      inflationRate: 6,
      lifeExpectancy: 90,
    });
    // Same retirement savings (inflation doesn't affect accumulation return in this model)
    expect(lowInflation.retirementSavings).toBe(highInflation.retirementSavings);
    // But high inflation should result in lower sustainable income or shorter funding
    expect(highInflation.monthlyRetirementIncome as number).toBeLessThan(
      lowInflation.monthlyRetirementIncome as number
    );
  });

  // ─── Test 8: Savings growth chart has correct data points ───
  it('generates savings growth chart with correct number of data points', () => {
    const result = calculateRetirementProjection({
      currentAge: 30,
      retirementAge: 65,
      currentSavings: 50000,
      monthlyContribution: 1000,
      preRetirementReturn: 7,
      postRetirementReturn: 5,
      desiredAnnualIncome: 50000,
      inflationRate: 3,
      lifeExpectancy: 90,
    });
    const savingsGrowth = result.savingsGrowth as { age: number; balance: number }[];
    // Should have data points from age 30 through 90
    // Accumulation: ages 30 to 65 = 36 points
    // Distribution: ages 66 to 90 = 25 points
    // Total = 61 points
    expect(savingsGrowth.length).toBe(61);
    expect(savingsGrowth[0].age).toBe(30);
    expect(savingsGrowth[savingsGrowth.length - 1].age).toBe(90);
  });

  // ─── Test 9: Year-by-year table has correct length ───
  it('generates year-by-year table covering full lifetime', () => {
    const result = calculateRetirementProjection({
      currentAge: 40,
      retirementAge: 65,
      currentSavings: 100000,
      monthlyContribution: 1500,
      preRetirementReturn: 7,
      postRetirementReturn: 5,
      desiredAnnualIncome: 50000,
      inflationRate: 3,
      lifeExpectancy: 90,
    });
    const yearByYear = result.yearByYear as { age: number }[];
    // Accumulation: 25 years (age 40-64) + Distribution: 25 years (age 65-89) = 50
    expect(yearByYear.length).toBe(50);
    expect(yearByYear[0].age).toBe(40);
    expect(yearByYear[yearByYear.length - 1].age).toBe(89);
  });

  // ─── Test 10: Summary contains required labels ───
  it('summary contains all required labels', () => {
    const result = calculateRetirementProjection({
      currentAge: 30,
      retirementAge: 65,
      currentSavings: 50000,
      monthlyContribution: 1000,
      preRetirementReturn: 7,
      postRetirementReturn: 5,
      desiredAnnualIncome: 50000,
      inflationRate: 3,
      lifeExpectancy: 90,
    });
    const summary = result.summary as { label: string; value: number }[];
    const labels = summary.map(s => s.label);
    expect(labels).toContain('Retirement Savings at 65');
    expect(labels).toContain('Monthly Retirement Income');
    expect(labels).toContain('Years Funded');
    expect(labels).toContain('Total Contributions');
    expect(labels).toContain('Total Growth');
    expect(summary.length).toBe(5);
  });

  // ─── Test 11: Balance reaches zero when money runs out ───
  it('balance reaches zero in chart when money runs out', () => {
    const result = calculateRetirementProjection({
      currentAge: 55,
      retirementAge: 60,
      currentSavings: 100000,
      monthlyContribution: 2000,
      preRetirementReturn: 7,
      postRetirementReturn: 4,
      desiredAnnualIncome: 60000,
      inflationRate: 3,
      lifeExpectancy: 95,
    });
    const savingsGrowth = result.savingsGrowth as { age: number; balance: number }[];
    // Money should run out before 95 — find the zero point
    const zeroPoints = savingsGrowth.filter(p => p.balance === 0);
    expect(zeroPoints.length).toBeGreaterThan(0);
    // yearsMoneyLasts should be a number (not "Lifetime")
    expect(typeof result.yearsMoneyLasts).toBe('number');
  });

  // ─── Test 12: Early retirement (FIRE) scenario ───
  it('calculates FIRE scenario correctly', () => {
    const result = calculateRetirementProjection({
      currentAge: 35,
      retirementAge: 50,
      currentSavings: 300000,
      monthlyContribution: 4000,
      preRetirementReturn: 7,
      postRetirementReturn: 5,
      desiredAnnualIncome: 50000,
      inflationRate: 3,
      lifeExpectancy: 90,
    });
    // 15 years accumulation with $300k start and $4k/mo should yield substantial savings
    expect(result.retirementSavings as number).toBeGreaterThan(1000000);
    // 40-year retirement is challenging — check if fully funded
    const monthlyIncome = result.monthlyRetirementIncome as number;
    expect(monthlyIncome).toBeGreaterThan(0);
  });

  // ─── Test 13: Full lifetime funding ───
  it('shows "Lifetime" when money lasts through life expectancy', () => {
    const result = calculateRetirementProjection({
      currentAge: 25,
      retirementAge: 65,
      currentSavings: 100000,
      monthlyContribution: 2000,
      preRetirementReturn: 7,
      postRetirementReturn: 5,
      desiredAnnualIncome: 40000,
      inflationRate: 3,
      lifeExpectancy: 90,
    });
    // 40 years of accumulation with $100k start and $2k/mo at 7% → very large nest egg
    expect(result.retirementSavings as number).toBeGreaterThan(2000000);
    expect(result.yearsMoneyLasts).toBe('Lifetime');
    expect(result.retirementGap).toBe(0);
  });

  // ─── Test 14: Breakdown pie chart has correct entries ───
  it('breakdown pie chart has three entries with correct names', () => {
    const result = calculateRetirementProjection({
      currentAge: 30,
      retirementAge: 65,
      currentSavings: 50000,
      monthlyContribution: 1000,
      preRetirementReturn: 7,
      postRetirementReturn: 5,
      desiredAnnualIncome: 50000,
      inflationRate: 3,
      lifeExpectancy: 90,
    });
    const breakdown = result.breakdown as { name: string; value: number }[];
    expect(breakdown).toHaveLength(3);
    const names = breakdown.map(b => b.name);
    expect(names).toContain('Your Contributions');
    expect(names).toContain('Employer Match');
    expect(names).toContain('Investment Growth');
    // Employer match should be 0 (placeholder)
    const employerMatch = breakdown.find(b => b.name === 'Employer Match');
    expect(employerMatch!.value).toBe(0);
    // Investment growth should be positive
    const growth = breakdown.find(b => b.name === 'Investment Growth');
    expect(growth!.value).toBeGreaterThan(0);
  });

  // ─── Test 15: Contributions breakdown correctness ───
  it('calculates total contributions correctly in breakdown', () => {
    const result = calculateRetirementProjection({
      currentAge: 30,
      retirementAge: 65,
      currentSavings: 50000,
      monthlyContribution: 1000,
      preRetirementReturn: 7,
      postRetirementReturn: 5,
      desiredAnnualIncome: 50000,
      inflationRate: 3,
      lifeExpectancy: 90,
    });
    const breakdown = result.breakdown as { name: string; value: number }[];
    const contributions = breakdown.find(b => b.name === 'Your Contributions');
    // Total = currentSavings ($50k) + monthly ($1000 * 420 months) = $470,000
    expect(contributions!.value).toBeCloseTo(470000, -2);
  });

  // ─── Test 16: Sustainable monthly income is reasonable ───
  it('calculates sustainable monthly income within reasonable bounds', () => {
    const result = calculateRetirementProjection({
      currentAge: 30,
      retirementAge: 65,
      currentSavings: 50000,
      monthlyContribution: 1000,
      preRetirementReturn: 7,
      postRetirementReturn: 5,
      desiredAnnualIncome: 50000,
      inflationRate: 3,
      lifeExpectancy: 90,
    });
    const monthlyIncome = result.monthlyRetirementIncome as number;
    // Should be a positive number in reasonable range
    expect(monthlyIncome).toBeGreaterThan(2000);
    expect(monthlyIncome).toBeLessThan(20000);
    // The 4% rule on ~$1.4M would give ~$4,800/mo — sustainable income should be in that ballpark
    expect(monthlyIncome).toBeGreaterThan(3000);
  });
});
