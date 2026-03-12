import { calculate401kGrowth } from '@/lib/formulas/finance/401k-growth';

describe('calculate401kGrowth', () => {
  // ─── Test 1: Default scenario — 30-year-old, $75k salary, 10% contribution, 50% match on 6% ───
  it('calculates default scenario correctly (30 to 65, $75k, 10%, 50% match on 6%)', () => {
    const result = calculate401kGrowth({
      currentAge: 30,
      retirementAge: 65,
      currentBalance: 25000,
      annualSalary: 75000,
      contributionPercent: 10,
      employerMatchPercent: 50,
      employerMatchLimit: 6,
      annualReturn: 7,
      annualSalaryIncrease: 2,
    });
    const projected = result.projectedBalance as number;
    // Should accumulate approximately $1.87M over 35 years
    expect(projected).toBeGreaterThan(1700000);
    expect(projected).toBeLessThan(2100000);
  });

  // ─── Test 2: Zero years to retirement returns current balance ───
  it('returns current balance when retirement age equals current age', () => {
    const result = calculate401kGrowth({
      currentAge: 65,
      retirementAge: 65,
      currentBalance: 500000,
      annualSalary: 100000,
      contributionPercent: 10,
      employerMatchPercent: 50,
      employerMatchLimit: 6,
      annualReturn: 7,
      annualSalaryIncrease: 2,
    });
    expect(result.projectedBalance).toBe(500000);
    expect(result.totalContributions).toBe(0);
    expect(result.totalEmployerMatch).toBe(0);
    expect(result.totalGrowth).toBe(0);
  });

  // ─── Test 3: Retirement age less than current age (negative years) ───
  it('returns current balance when retirement age is less than current age', () => {
    const result = calculate401kGrowth({
      currentAge: 65,
      retirementAge: 60,
      currentBalance: 250000,
      annualSalary: 80000,
      contributionPercent: 10,
      employerMatchPercent: 50,
      employerMatchLimit: 6,
      annualReturn: 7,
      annualSalaryIncrease: 0,
    });
    expect(result.projectedBalance).toBe(250000);
  });

  // ─── Test 4: Zero salary means zero contributions and zero match ───
  it('handles zero salary correctly (current balance grows only)', () => {
    const result = calculate401kGrowth({
      currentAge: 30,
      retirementAge: 65,
      currentBalance: 50000,
      annualSalary: 0,
      contributionPercent: 10,
      employerMatchPercent: 50,
      employerMatchLimit: 6,
      annualReturn: 7,
      annualSalaryIncrease: 0,
    });
    expect(result.totalContributions).toBe(0);
    expect(result.totalEmployerMatch).toBe(0);
    // $50,000 at 7% for 35 years ≈ $534,000+
    const projected = result.projectedBalance as number;
    expect(projected).toBeGreaterThan(500000);
    expect(projected).toBeLessThan(600000);
  });

  // ─── Test 5: No employer match ───
  it('handles zero employer match correctly', () => {
    const result = calculate401kGrowth({
      currentAge: 30,
      retirementAge: 65,
      currentBalance: 0,
      annualSalary: 75000,
      contributionPercent: 10,
      employerMatchPercent: 0,
      employerMatchLimit: 6,
      annualReturn: 7,
      annualSalaryIncrease: 0,
    });
    expect(result.totalEmployerMatch).toBe(0);
    const projected = result.projectedBalance as number;
    expect(projected).toBeGreaterThan(800000);
  });

  // ─── Test 6: IRS contribution limit cap ───
  it('caps employee contribution at IRS limit for high earners', () => {
    const result = calculate401kGrowth({
      currentAge: 30,
      retirementAge: 31,
      currentBalance: 0,
      annualSalary: 500000,
      contributionPercent: 100,
      employerMatchPercent: 100,
      employerMatchLimit: 100,
      annualReturn: 0,
      annualSalaryIncrease: 0,
    });
    // Under 50, IRS limit is $23,500. With 0% return:
    // contribution = $23,500, match = min($23,500, $500,000*100%) * 100% = $23,500
    // balance = $23,500 + $23,500 = $47,000
    expect(result.totalContributions).toBe(23500);
    expect(result.totalEmployerMatch).toBe(23500);
    expect(result.projectedBalance).toBe(47000);
  });

  // ─── Test 7: Catch-up contribution limit at age 50+ ───
  it('applies catch-up contribution limit for employees aged 50+', () => {
    const result = calculate401kGrowth({
      currentAge: 49,
      retirementAge: 51,
      currentBalance: 0,
      annualSalary: 500000,
      contributionPercent: 100,
      employerMatchPercent: 0,
      employerMatchLimit: 0,
      annualReturn: 0,
      annualSalaryIncrease: 0,
    });
    const yearByYear = result.yearByYear as Array<{ age: number; contribution: number }>;
    // Year 1: age 50 → $31,000 limit
    expect(yearByYear[0].age).toBe(50);
    expect(yearByYear[0].contribution).toBe(31000);
    // Year 2: age 51 → $31,000 limit
    expect(yearByYear[1].age).toBe(51);
    expect(yearByYear[1].contribution).toBe(31000);
    expect(result.totalContributions).toBe(62000);
  });

  // ─── Test 8: Zero return rate (no investment growth) ───
  it('handles zero return rate correctly (no growth, pure accumulation)', () => {
    const result = calculate401kGrowth({
      currentAge: 30,
      retirementAge: 35,
      currentBalance: 10000,
      annualSalary: 100000,
      contributionPercent: 10,
      employerMatchPercent: 50,
      employerMatchLimit: 6,
      annualReturn: 0,
      annualSalaryIncrease: 0,
    });
    // 5 years, $10,000/year contribution, $3,000/year match (50% of 6% of $100k)
    // total = $10,000 + $50,000 + $15,000 = $75,000
    expect(result.projectedBalance).toBe(75000);
    expect(result.totalContributions).toBe(50000);
    expect(result.totalEmployerMatch).toBe(15000);
    expect(result.totalGrowth).toBe(0);
  });

  // ─── Test 9: Salary growth effect ───
  it('models salary increases correctly over time', () => {
    const noRaise = calculate401kGrowth({
      currentAge: 30,
      retirementAge: 65,
      currentBalance: 0,
      annualSalary: 75000,
      contributionPercent: 10,
      employerMatchPercent: 50,
      employerMatchLimit: 6,
      annualReturn: 7,
      annualSalaryIncrease: 0,
    });
    const withRaise = calculate401kGrowth({
      currentAge: 30,
      retirementAge: 65,
      currentBalance: 0,
      annualSalary: 75000,
      contributionPercent: 10,
      employerMatchPercent: 50,
      employerMatchLimit: 6,
      annualReturn: 7,
      annualSalaryIncrease: 3,
    });
    // Salary growth should produce a significantly higher balance
    expect(withRaise.projectedBalance as number).toBeGreaterThan(noRaise.projectedBalance as number);
  });

  // ─── Test 10: Growth over time chart has correct length ───
  it('generates growthOverTime data with correct number of entries', () => {
    const result = calculate401kGrowth({
      currentAge: 30,
      retirementAge: 65,
      currentBalance: 25000,
      annualSalary: 75000,
      contributionPercent: 10,
      employerMatchPercent: 50,
      employerMatchLimit: 6,
      annualReturn: 7,
      annualSalaryIncrease: 2,
    });
    const growthData = result.growthOverTime as Array<{ year: number; age: number; balance: number }>;
    // Year 0 through Year 35 = 36 entries
    expect(growthData).toHaveLength(36);
    expect(growthData[0].year).toBe(0);
    expect(growthData[0].age).toBe(30);
    expect(growthData[0].balance).toBe(25000);
    expect(growthData[35].year).toBe(35);
    expect(growthData[35].age).toBe(65);
  });

  // ─── Test 11: Year-by-year table has correct entries ───
  it('generates yearByYear table with correct number of entries', () => {
    const result = calculate401kGrowth({
      currentAge: 30,
      retirementAge: 40,
      currentBalance: 0,
      annualSalary: 80000,
      contributionPercent: 10,
      employerMatchPercent: 100,
      employerMatchLimit: 4,
      annualReturn: 7,
      annualSalaryIncrease: 0,
    });
    const yearByYear = result.yearByYear as Array<{ age: number; salary: number; balance: number }>;
    // 10 years = 10 entries
    expect(yearByYear).toHaveLength(10);
    expect(yearByYear[0].age).toBe(31);
    expect(yearByYear[9].age).toBe(40);
  });

  // ─── Test 12: Summary contains all required labels ───
  it('returns summary with all required labels', () => {
    const result = calculate401kGrowth({
      currentAge: 30,
      retirementAge: 65,
      currentBalance: 25000,
      annualSalary: 75000,
      contributionPercent: 10,
      employerMatchPercent: 50,
      employerMatchLimit: 6,
      annualReturn: 7,
      annualSalaryIncrease: 2,
    });
    const summary = result.summary as Array<{ label: string; value: number }>;
    const labels = summary.map(s => s.label);
    expect(labels).toContain('Projected Balance');
    expect(labels).toContain('Your Contributions');
    expect(labels).toContain('Employer Match');
    expect(labels).toContain('Investment Growth');
    expect(summary).toHaveLength(4);
  });

  // ─── Test 13: Breakdown pie chart adds up to projected balance ───
  it('breakdown values sum to projected balance', () => {
    const result = calculate401kGrowth({
      currentAge: 30,
      retirementAge: 65,
      currentBalance: 25000,
      annualSalary: 75000,
      contributionPercent: 10,
      employerMatchPercent: 50,
      employerMatchLimit: 6,
      annualReturn: 7,
      annualSalaryIncrease: 2,
    });
    const breakdown = result.breakdown as Array<{ name: string; value: number }>;
    const breakdownTotal = breakdown.reduce((sum, item) => sum + item.value, 0);
    expect(breakdownTotal).toBeCloseTo(result.projectedBalance as number, 0);
  });

  // ─── Test 14: Employer match calculation is correct ───
  it('calculates employer match correctly — 50% on first 6% of salary', () => {
    const result = calculate401kGrowth({
      currentAge: 30,
      retirementAge: 31,
      currentBalance: 0,
      annualSalary: 100000,
      contributionPercent: 10,
      employerMatchPercent: 50,
      employerMatchLimit: 6,
      annualReturn: 0,
      annualSalaryIncrease: 0,
    });
    // Employee contribution: $100,000 * 10% = $10,000
    // Matchable: min($10,000, $100,000 * 6%) = $6,000
    // Employer match: $6,000 * 50% = $3,000
    expect(result.totalContributions).toBe(10000);
    expect(result.totalEmployerMatch).toBe(3000);
    expect(result.projectedBalance).toBe(13000);
  });

  // ─── Test 15: Low contribution that doesn't fully utilize match limit ───
  it('handles contribution below match limit — match based on contribution', () => {
    const result = calculate401kGrowth({
      currentAge: 30,
      retirementAge: 31,
      currentBalance: 0,
      annualSalary: 100000,
      contributionPercent: 3,
      employerMatchPercent: 100,
      employerMatchLimit: 6,
      annualReturn: 0,
      annualSalaryIncrease: 0,
    });
    // Employee contribution: $100,000 * 3% = $3,000
    // Matchable: min($3,000, $100,000 * 6%) = $3,000
    // Employer match: $3,000 * 100% = $3,000
    expect(result.totalContributions).toBe(3000);
    expect(result.totalEmployerMatch).toBe(3000);
    expect(result.projectedBalance).toBe(6000);
  });
});
