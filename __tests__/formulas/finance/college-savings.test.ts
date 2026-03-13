import { calculateCollegeSavings } from '@/lib/formulas/finance/college-savings';

describe('calculateCollegeSavings', () => {
  // ─── Test 1: Basic case — child age 5, college at 18, $25K/yr, 4 years ───
  it('calculates projected cost and monthly savings for a typical scenario', () => {
    const result = calculateCollegeSavings({
      childAge: 5,
      collegeStartAge: 18,
      annualCost: 25000,
      yearsInCollege: 4,
      currentSavings: 10000,
      monthlyContribution: 300,
      annualReturn: 7,
      collegeInflation: 5,
    });
    // 13 years until college, 4 years of inflated costs
    const cost = result.projectedTotalCost as number;
    expect(cost).toBeGreaterThan(100000); // costs inflate significantly
    expect(result.projectedSavings).toBeDefined();
    expect(result.savingsGap).toBeDefined();
    expect(result.monthlySavingsNeeded).toBeDefined();
    expect(typeof result.projectedTotalCost).toBe('number');
  });

  // ─── Test 2: Zero inflation — costs stay flat ───
  it('calculates correct cost when inflation is zero', () => {
    const result = calculateCollegeSavings({
      childAge: 14,
      collegeStartAge: 18,
      annualCost: 30000,
      yearsInCollege: 4,
      currentSavings: 0,
      monthlyContribution: 0,
      annualReturn: 0,
      collegeInflation: 0,
    });
    // No inflation, 4 years × $30K = $120K
    expect(result.projectedTotalCost).toBe(120000);
  });

  // ─── Test 3: Zero return rate — savings grow only from contributions ───
  it('calculates correctly with zero return rate', () => {
    const result = calculateCollegeSavings({
      childAge: 8,
      collegeStartAge: 18,
      annualCost: 20000,
      yearsInCollege: 4,
      currentSavings: 5000,
      monthlyContribution: 200,
      annualReturn: 0,
      collegeInflation: 0,
    });
    // 10 years, 120 months × $200 + $5K = $29,000
    expect(result.projectedSavings).toBe(29000);
    // Cost = 4 × $20K = $80K (no inflation)
    expect(result.projectedTotalCost).toBe(80000);
    // Gap = $80K - $29K = $51K
    expect(result.savingsGap).toBe(51000);
    // Monthly needed to close gap from current savings alone:
    // Remaining = $80K - $5K(FV of savings at 0%) = $75K, PMT = $75K / 120 = $625
    expect(result.monthlySavingsNeeded).toBe(625);
  });

  // ─── Test 4: Current savings already cover projected cost ───
  it('returns zero gap and zero monthly needed when savings exceed cost', () => {
    const result = calculateCollegeSavings({
      childAge: 0,
      collegeStartAge: 18,
      annualCost: 10000,
      yearsInCollege: 4,
      currentSavings: 200000,
      monthlyContribution: 500,
      annualReturn: 7,
      collegeInflation: 5,
    });
    expect(result.savingsGap).toBe(0);
    expect(result.monthlySavingsNeeded).toBe(0);
  });

  // ─── Test 5: Child already at college age (0 years until college) ───
  it('handles child already at college start age', () => {
    const result = calculateCollegeSavings({
      childAge: 18,
      collegeStartAge: 18,
      annualCost: 25000,
      yearsInCollege: 4,
      currentSavings: 50000,
      monthlyContribution: 0,
      annualReturn: 7,
      collegeInflation: 5,
    });
    // 0 years until college — costs are at year 0,1,2,3 from now
    // Year 0: 25000, Year 1: 25000*1.05, Year 2: 25000*1.05^2, Year 3: 25000*1.05^3
    const cost = result.projectedTotalCost as number;
    expect(cost).toBeGreaterThan(100000);
    // Projected savings = current (no time for growth)
    expect(result.projectedSavings).toBe(50000);
  });

  // ─── Test 6: Single year of college ───
  it('calculates correctly for 1 year of college', () => {
    const result = calculateCollegeSavings({
      childAge: 14,
      collegeStartAge: 18,
      annualCost: 40000,
      yearsInCollege: 1,
      currentSavings: 0,
      monthlyContribution: 0,
      annualReturn: 0,
      collegeInflation: 5,
    });
    // Cost = $40K × (1.05)^4 = $48,620.25
    expect(result.projectedTotalCost).toBeCloseTo(48620.25, 0);
  });

  // ─── Test 7: String coercion on all inputs ───
  it('handles string inputs correctly via Number() coercion', () => {
    const result = calculateCollegeSavings({
      childAge: '10',
      collegeStartAge: '18',
      annualCost: '25000',
      yearsInCollege: '4',
      currentSavings: '5000',
      monthlyContribution: '200',
      annualReturn: '7',
      collegeInflation: '5',
    });
    expect(typeof result.projectedTotalCost).toBe('number');
    expect(typeof result.monthlySavingsNeeded).toBe('number');
    expect(result.projectedTotalCost).toBeGreaterThan(0);
  });

  // ─── Test 8: Missing/undefined inputs default to safe values ───
  it('handles missing inputs gracefully', () => {
    const result = calculateCollegeSavings({});
    expect(result.projectedTotalCost).toBe(0);
    expect(result.projectedSavings).toBe(0);
    expect(result.savingsGap).toBe(0);
    expect(result.monthlySavingsNeeded).toBe(0);
  });

  // ─── Test 9: Negative values clamped to zero ───
  it('clamps negative inputs to zero', () => {
    const result = calculateCollegeSavings({
      childAge: -5,
      collegeStartAge: 18,
      annualCost: -1000,
      yearsInCollege: 4,
      currentSavings: -500,
      monthlyContribution: -100,
      annualReturn: 7,
      collegeInflation: 5,
    });
    // Negative cost/savings clamped → zero
    expect(result.projectedTotalCost).toBe(0);
    expect(result.projectedSavings).toBeGreaterThanOrEqual(0);
  });

  // ─── Test 10: High inflation dramatically increases cost ───
  it('high inflation rate significantly increases projected cost', () => {
    const lowInflation = calculateCollegeSavings({
      childAge: 0,
      collegeStartAge: 18,
      annualCost: 25000,
      yearsInCollege: 4,
      currentSavings: 0,
      monthlyContribution: 0,
      annualReturn: 0,
      collegeInflation: 3,
    });
    const highInflation = calculateCollegeSavings({
      childAge: 0,
      collegeStartAge: 18,
      annualCost: 25000,
      yearsInCollege: 4,
      currentSavings: 0,
      monthlyContribution: 0,
      annualReturn: 0,
      collegeInflation: 8,
    });
    expect(highInflation.projectedTotalCost as number).toBeGreaterThan(lowInflation.projectedTotalCost as number);
  });

  // ─── Test 11: Newborn (age 0) with 18 years to save ───
  it('calculates for a newborn with maximum time horizon', () => {
    const result = calculateCollegeSavings({
      childAge: 0,
      collegeStartAge: 18,
      annualCost: 25000,
      yearsInCollege: 4,
      currentSavings: 0,
      monthlyContribution: 300,
      annualReturn: 7,
      collegeInflation: 5,
    });
    const savings = result.projectedSavings as number;
    // $300/mo at 7% for 18 years should be substantial
    expect(savings).toBeGreaterThan(100000);
    expect(result.monthlySavingsNeeded).toBeDefined();
  });

  // ─── Test 12: 8 years of college (grad school) ───
  it('handles extended college duration (8 years)', () => {
    const result = calculateCollegeSavings({
      childAge: 10,
      collegeStartAge: 18,
      annualCost: 30000,
      yearsInCollege: 8,
      currentSavings: 0,
      monthlyContribution: 0,
      annualReturn: 0,
      collegeInflation: 0,
    });
    // 8 years × $30K = $240K
    expect(result.projectedTotalCost).toBe(240000);
  });

  // ─── Test 13: Very high annual cost ($100K/yr) ───
  it('handles high annual cost correctly', () => {
    const result = calculateCollegeSavings({
      childAge: 5,
      collegeStartAge: 18,
      annualCost: 100000,
      yearsInCollege: 4,
      currentSavings: 50000,
      monthlyContribution: 1000,
      annualReturn: 7,
      collegeInflation: 5,
    });
    const cost = result.projectedTotalCost as number;
    // $100K inflated 5%/yr over 13-16 years = very high
    expect(cost).toBeGreaterThan(400000);
  });

  // ─── Test 14: College start age 16 (early enrollment) ───
  it('handles early college start age', () => {
    const result = calculateCollegeSavings({
      childAge: 10,
      collegeStartAge: 16,
      annualCost: 25000,
      yearsInCollege: 4,
      currentSavings: 20000,
      monthlyContribution: 500,
      annualReturn: 7,
      collegeInflation: 5,
    });
    // Only 6 years until college
    const chart = result.savingsGrowthChart as Array<{ year: number }>;
    expect(chart).toHaveLength(7); // year 0 through year 6
  });

  // ─── Test 15: Summary contains all required labels ───
  it('returns summary with all required labels', () => {
    const result = calculateCollegeSavings({
      childAge: 5,
      collegeStartAge: 18,
      annualCost: 25000,
      yearsInCollege: 4,
      currentSavings: 10000,
      monthlyContribution: 300,
      annualReturn: 7,
      collegeInflation: 5,
    });
    const summary = result.summary as Array<{ label: string; value: number }>;
    const labels = summary.map(s => s.label);
    expect(labels).toContain('Projected Total Cost');
    expect(labels).toContain('Projected Savings');
    expect(labels).toContain('Savings Gap');
    expect(labels).toContain('Monthly Savings Needed');
    expect(labels).toContain('Current Savings');
    expect(labels).toContain('Years Until College');
    expect(summary).toHaveLength(6);
  });

  // ─── Test 16: Growth chart has correct length ───
  it('returns savings growth chart with correct length', () => {
    const result = calculateCollegeSavings({
      childAge: 8,
      collegeStartAge: 18,
      annualCost: 25000,
      yearsInCollege: 4,
      currentSavings: 5000,
      monthlyContribution: 300,
      annualReturn: 7,
      collegeInflation: 5,
    });
    const chart = result.savingsGrowthChart as Array<{ year: number; balance: number; contributions: number }>;
    // 10 years until college → year 0 through year 10 = 11 entries
    expect(chart).toHaveLength(11);
    expect(chart[0].year).toBe(0);
    expect(chart[0].balance).toBe(5000);
    expect(chart[10].year).toBe(10);
  });

  // ─── Test 17: Chart balance grows over time ───
  it('chart shows increasing balance over time', () => {
    const result = calculateCollegeSavings({
      childAge: 5,
      collegeStartAge: 18,
      annualCost: 25000,
      yearsInCollege: 4,
      currentSavings: 10000,
      monthlyContribution: 300,
      annualReturn: 7,
      collegeInflation: 5,
    });
    const chart = result.savingsGrowthChart as Array<{ year: number; balance: number }>;
    for (let i = 1; i < chart.length; i++) {
      expect(chart[i].balance).toBeGreaterThan(chart[i - 1].balance);
    }
  });

  // ─── Test 18: All output fields are present ───
  it('returns all expected output fields', () => {
    const result = calculateCollegeSavings({
      childAge: 5,
      collegeStartAge: 18,
      annualCost: 25000,
      yearsInCollege: 4,
      currentSavings: 10000,
      monthlyContribution: 300,
      annualReturn: 7,
      collegeInflation: 5,
    });
    expect(result).toHaveProperty('projectedTotalCost');
    expect(result).toHaveProperty('projectedSavings');
    expect(result).toHaveProperty('savingsGap');
    expect(result).toHaveProperty('monthlySavingsNeeded');
    expect(result).toHaveProperty('savingsGrowthChart');
    expect(result).toHaveProperty('summary');
  });

  // ─── Test 19: Higher return rate reduces monthly savings needed ───
  it('higher return rate reduces monthly savings needed', () => {
    const lowReturn = calculateCollegeSavings({
      childAge: 5,
      collegeStartAge: 18,
      annualCost: 25000,
      yearsInCollege: 4,
      currentSavings: 0,
      monthlyContribution: 0,
      annualReturn: 3,
      collegeInflation: 5,
    });
    const highReturn = calculateCollegeSavings({
      childAge: 5,
      collegeStartAge: 18,
      annualCost: 25000,
      yearsInCollege: 4,
      currentSavings: 0,
      monthlyContribution: 0,
      annualReturn: 10,
      collegeInflation: 5,
    });
    expect(highReturn.monthlySavingsNeeded as number).toBeLessThan(lowReturn.monthlySavingsNeeded as number);
  });

  // ─── Test 20: College start age 22 (late start) ───
  it('handles late college start age', () => {
    const result = calculateCollegeSavings({
      childAge: 5,
      collegeStartAge: 22,
      annualCost: 25000,
      yearsInCollege: 4,
      currentSavings: 10000,
      monthlyContribution: 200,
      annualReturn: 7,
      collegeInflation: 5,
    });
    // 17 years until college — more time = more savings
    const chart = result.savingsGrowthChart as Array<{ year: number }>;
    expect(chart).toHaveLength(18); // year 0 through year 17
    expect(result.projectedSavings).toBeDefined();
  });

  // ─── Test 21: Monthly savings needed is zero when contribution covers gap ───
  it('returns zero monthlySavingsNeeded when contributions close the gap', () => {
    const result = calculateCollegeSavings({
      childAge: 14,
      collegeStartAge: 18,
      annualCost: 10000,
      yearsInCollege: 2,
      currentSavings: 0,
      monthlyContribution: 1000,
      annualReturn: 5,
      collegeInflation: 3,
    });
    // 4 years, $1000/mo contributions at 5%, cost is ~$22K
    // FV of contributions = ~$53K, well above cost
    expect(result.monthlySavingsNeeded).toBe(0);
    expect(result.savingsGap).toBe(0);
  });

  // ─── Test 22: Savings gap equals cost minus projected savings ───
  it('savings gap equals projected cost minus projected savings', () => {
    const result = calculateCollegeSavings({
      childAge: 10,
      collegeStartAge: 18,
      annualCost: 30000,
      yearsInCollege: 4,
      currentSavings: 5000,
      monthlyContribution: 100,
      annualReturn: 6,
      collegeInflation: 4,
    });
    const cost = result.projectedTotalCost as number;
    const savings = result.projectedSavings as number;
    const gap = result.savingsGap as number;
    if (cost > savings) {
      expect(gap).toBeCloseTo(cost - savings, 0);
    } else {
      expect(gap).toBe(0);
    }
  });

  // ─── Test 23: Zero annual cost produces zero total cost ───
  it('returns zero cost when annual cost is zero', () => {
    const result = calculateCollegeSavings({
      childAge: 5,
      collegeStartAge: 18,
      annualCost: 0,
      yearsInCollege: 4,
      currentSavings: 10000,
      monthlyContribution: 300,
      annualReturn: 7,
      collegeInflation: 5,
    });
    expect(result.projectedTotalCost).toBe(0);
    expect(result.savingsGap).toBe(0);
    expect(result.monthlySavingsNeeded).toBe(0);
  });

  // ─── Test 24: Values are rounded to 2 decimal places ───
  it('returns values rounded to 2 decimal places', () => {
    const result = calculateCollegeSavings({
      childAge: 5,
      collegeStartAge: 18,
      annualCost: 25000,
      yearsInCollege: 4,
      currentSavings: 10000,
      monthlyContribution: 300,
      annualReturn: 7,
      collegeInflation: 5,
    });
    const cost = result.projectedTotalCost as number;
    const savings = result.projectedSavings as number;
    const monthly = result.monthlySavingsNeeded as number;
    expect(cost).toBe(parseFloat(cost.toFixed(2)));
    expect(savings).toBe(parseFloat(savings.toFixed(2)));
    expect(monthly).toBe(parseFloat(monthly.toFixed(2)));
  });
});
