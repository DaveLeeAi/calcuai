import { calculateIndexFund } from '@/lib/formulas/finance/index-fund';

describe('calculateIndexFund', () => {
  // ─── Test 1: Basic case — $10K initial, $500/mo, 10% return, 0.03% ER, 30 years ───
  it('calculates future value for a standard S&P 500 index fund scenario', () => {
    const result = calculateIndexFund({
      initialInvestment: 10000,
      monthlyContribution: 500,
      annualReturn: 10,
      expenseRatio: 0.03,
      investmentYears: 30,
      comparisonExpenseRatio: 1.0,
    });
    const fv = result.futureValue as number;
    // At ~9.97% effective, $10K + $500/mo for 30 years should be ~$1.06M+
    expect(fv).toBeGreaterThan(1000000);
    expect(result.totalContributions).toBe(190000); // 10K + 500*360
    expect(result.totalEarnings as number).toBeGreaterThan(800000);
  });

  // ─── Test 2: Zero expense ratio — full gross return ───
  it('calculates correctly with zero expense ratio', () => {
    const result = calculateIndexFund({
      initialInvestment: 10000,
      monthlyContribution: 500,
      annualReturn: 10,
      expenseRatio: 0,
      investmentYears: 30,
      comparisonExpenseRatio: 1.0,
    });
    const fv = result.futureValue as number;
    expect(fv).toBeGreaterThan(1000000);
    // Zero ER means no fees
    expect(result.expenseRatioCost).toBe(0);
  });

  // ─── Test 3: High expense ratio (3%) significantly reduces returns ───
  it('high expense ratio dramatically reduces future value', () => {
    const lowER = calculateIndexFund({
      initialInvestment: 10000,
      monthlyContribution: 500,
      annualReturn: 10,
      expenseRatio: 0.03,
      investmentYears: 30,
      comparisonExpenseRatio: 1.0,
    });
    const highER = calculateIndexFund({
      initialInvestment: 10000,
      monthlyContribution: 500,
      annualReturn: 10,
      expenseRatio: 3.0,
      investmentYears: 30,
      comparisonExpenseRatio: 1.0,
    });
    expect(lowER.futureValue as number).toBeGreaterThan(highER.futureValue as number);
    // The difference should be very large over 30 years
    expect((lowER.futureValue as number) - (highER.futureValue as number)).toBeGreaterThan(400000);
  });

  // ─── Test 4: Zero return rate — savings are just contributions ───
  it('calculates correctly with zero return rate', () => {
    const result = calculateIndexFund({
      initialInvestment: 10000,
      monthlyContribution: 500,
      annualReturn: 0,
      expenseRatio: 0.03,
      investmentYears: 10,
      comparisonExpenseRatio: 1.0,
    });
    // 0% return: FV = initial + monthly * months
    expect(result.futureValue).toBe(70000); // 10K + 500*120
    expect(result.totalEarnings).toBe(0);
    expect(result.totalContributions).toBe(70000);
  });

  // ─── Test 5: Zero monthly contribution — initial investment only ───
  it('calculates correctly with no monthly contributions', () => {
    const result = calculateIndexFund({
      initialInvestment: 10000,
      monthlyContribution: 0,
      annualReturn: 10,
      expenseRatio: 0.03,
      investmentYears: 30,
      comparisonExpenseRatio: 1.0,
    });
    // $10K at ~9.97% for 30 years ≈ $172K
    const fv = result.futureValue as number;
    expect(fv).toBeGreaterThan(150000);
    expect(fv).toBeLessThan(200000);
    expect(result.totalContributions).toBe(10000);
  });

  // ─── Test 6: Zero initial investment — contributions only ───
  it('calculates correctly with no initial investment', () => {
    const result = calculateIndexFund({
      initialInvestment: 0,
      monthlyContribution: 500,
      annualReturn: 10,
      expenseRatio: 0.03,
      investmentYears: 30,
      comparisonExpenseRatio: 1.0,
    });
    const fv = result.futureValue as number;
    expect(fv).toBeGreaterThan(900000);
    expect(result.totalContributions).toBe(180000); // 500*360
  });

  // ─── Test 7: Comparison fund shows lower FV than primary ───
  it('comparison fund with higher ER has lower future value', () => {
    const result = calculateIndexFund({
      initialInvestment: 10000,
      monthlyContribution: 500,
      annualReturn: 10,
      expenseRatio: 0.03,
      investmentYears: 30,
      comparisonExpenseRatio: 1.0,
    });
    expect(result.futureValue as number).toBeGreaterThan(result.comparisonFutureValue as number);
    expect(result.expenseRatioSavings as number).toBeGreaterThan(0);
  });

  // ─── Test 8: Same expense ratio on both — no savings ───
  it('shows zero savings when both expense ratios are equal', () => {
    const result = calculateIndexFund({
      initialInvestment: 10000,
      monthlyContribution: 500,
      annualReturn: 10,
      expenseRatio: 0.5,
      investmentYears: 20,
      comparisonExpenseRatio: 0.5,
    });
    expect(result.expenseRatioSavings).toBe(0);
    expect(result.futureValue).toBe(result.comparisonFutureValue);
  });

  // ─── Test 9: Short time horizon (1 year) ───
  it('calculates correctly for 1-year investment', () => {
    const result = calculateIndexFund({
      initialInvestment: 10000,
      monthlyContribution: 500,
      annualReturn: 10,
      expenseRatio: 0.03,
      investmentYears: 1,
      comparisonExpenseRatio: 1.0,
    });
    // $10K + $500*12 = $16K contributions, modest growth in 1 year
    expect(result.futureValue as number).toBeGreaterThan(16000);
    expect(result.futureValue as number).toBeLessThan(20000);
    expect(result.totalContributions).toBe(16000);
  });

  // ─── Test 10: Very long time horizon (60 years) ───
  it('handles very long investment horizons', () => {
    const result = calculateIndexFund({
      initialInvestment: 1000,
      monthlyContribution: 100,
      annualReturn: 10,
      expenseRatio: 0.03,
      investmentYears: 60,
      comparisonExpenseRatio: 1.0,
    });
    const fv = result.futureValue as number;
    // Compounding over 60 years should be massive
    expect(fv).toBeGreaterThan(1000000);
  });

  // ─── Test 11: String coercion on all inputs ───
  it('handles string inputs correctly via Number() coercion', () => {
    const result = calculateIndexFund({
      initialInvestment: '10000',
      monthlyContribution: '500',
      annualReturn: '10',
      expenseRatio: '0.03',
      investmentYears: '30',
      comparisonExpenseRatio: '1.0',
    });
    expect(typeof result.futureValue).toBe('number');
    expect(result.futureValue as number).toBeGreaterThan(1000000);
  });

  // ─── Test 12: Missing/undefined inputs default to safe values ───
  it('handles missing inputs gracefully', () => {
    const result = calculateIndexFund({});
    expect(result.futureValue).toBe(0);
    expect(result.totalContributions).toBe(0);
    expect(result.totalEarnings).toBe(0);
    expect(result.expenseRatioCost).toBe(0);
  });

  // ─── Test 13: Expense ratio cost is meaningful over 30 years ───
  it('expense ratio cost is significant over long periods', () => {
    const result = calculateIndexFund({
      initialInvestment: 10000,
      monthlyContribution: 500,
      annualReturn: 10,
      expenseRatio: 0.03,
      investmentYears: 30,
      comparisonExpenseRatio: 1.0,
    });
    const feeCost = result.expenseRatioCost as number;
    // Even 0.03% ER costs thousands over 30 years
    expect(feeCost).toBeGreaterThan(0);
  });

  // ─── Test 14: 1% ER savings vs 0.03% over 30 years is $200K+ ───
  it('fee savings between 0.03% and 1% ER are substantial over 30 years', () => {
    const result = calculateIndexFund({
      initialInvestment: 10000,
      monthlyContribution: 500,
      annualReturn: 10,
      expenseRatio: 0.03,
      investmentYears: 30,
      comparisonExpenseRatio: 1.0,
    });
    const savings = result.expenseRatioSavings as number;
    // Classic Bogle argument: ~0.97% difference over 30 years on 6-figure portfolio
    expect(savings).toBeGreaterThan(150000);
  });

  // ─── Test 15: Growth chart has correct length ───
  it('returns growth chart with correct length', () => {
    const result = calculateIndexFund({
      initialInvestment: 10000,
      monthlyContribution: 500,
      annualReturn: 10,
      expenseRatio: 0.03,
      investmentYears: 30,
      comparisonExpenseRatio: 1.0,
    });
    const chart = result.growthChart as Array<{ year: number }>;
    expect(chart).toHaveLength(31); // year 0 through year 30
    expect(chart[0].year).toBe(0);
    expect(chart[30].year).toBe(30);
  });

  // ─── Test 16: Growth chart shows low-cost balance >= high-cost balance ───
  it('growth chart shows low-cost fund always >= high-cost fund', () => {
    const result = calculateIndexFund({
      initialInvestment: 10000,
      monthlyContribution: 500,
      annualReturn: 10,
      expenseRatio: 0.03,
      investmentYears: 20,
      comparisonExpenseRatio: 1.0,
    });
    const chart = result.growthChart as Array<{ lowCostBalance: number; highCostBalance: number }>;
    for (let i = 1; i < chart.length; i++) {
      expect(chart[i].lowCostBalance).toBeGreaterThanOrEqual(chart[i].highCostBalance);
    }
  });

  // ─── Test 17: Summary contains all required labels ───
  it('returns summary with all required labels', () => {
    const result = calculateIndexFund({
      initialInvestment: 10000,
      monthlyContribution: 500,
      annualReturn: 10,
      expenseRatio: 0.03,
      investmentYears: 30,
      comparisonExpenseRatio: 1.0,
    });
    const summary = result.summary as Array<{ label: string; value: number }>;
    const labels = summary.map(s => s.label);
    expect(labels).toContain('Future Value (Low-Cost Fund)');
    expect(labels).toContain('Future Value (High-Cost Fund)');
    expect(labels).toContain('Total Contributions');
    expect(labels).toContain('Total Earnings (Low-Cost)');
    expect(labels).toContain('Fee Savings (Low vs High)');
    expect(labels).toContain('Total Fees Paid (Low-Cost)');
    expect(summary).toHaveLength(6);
  });

  // ─── Test 18: All output fields present ───
  it('returns all expected output fields', () => {
    const result = calculateIndexFund({
      initialInvestment: 10000,
      monthlyContribution: 500,
      annualReturn: 10,
      expenseRatio: 0.03,
      investmentYears: 30,
      comparisonExpenseRatio: 1.0,
    });
    expect(result).toHaveProperty('futureValue');
    expect(result).toHaveProperty('totalContributions');
    expect(result).toHaveProperty('totalEarnings');
    expect(result).toHaveProperty('expenseRatioCost');
    expect(result).toHaveProperty('comparisonFutureValue');
    expect(result).toHaveProperty('expenseRatioSavings');
    expect(result).toHaveProperty('growthChart');
    expect(result).toHaveProperty('summary');
  });

  // ─── Test 19: Zero investment years returns initial investment ───
  it('returns initial investment when investment years is zero', () => {
    const result = calculateIndexFund({
      initialInvestment: 10000,
      monthlyContribution: 500,
      annualReturn: 10,
      expenseRatio: 0.03,
      investmentYears: 0,
      comparisonExpenseRatio: 1.0,
    });
    expect(result.futureValue).toBe(10000);
    expect(result.totalContributions).toBe(10000);
    expect(result.totalEarnings).toBe(0);
  });

  // ─── Test 20: Values are rounded to 2 decimal places ───
  it('returns values rounded to 2 decimal places', () => {
    const result = calculateIndexFund({
      initialInvestment: 10000,
      monthlyContribution: 500,
      annualReturn: 10,
      expenseRatio: 0.03,
      investmentYears: 30,
      comparisonExpenseRatio: 1.0,
    });
    const fv = result.futureValue as number;
    const contrib = result.totalContributions as number;
    const earnings = result.totalEarnings as number;
    expect(fv).toBe(parseFloat(fv.toFixed(2)));
    expect(contrib).toBe(parseFloat(contrib.toFixed(2)));
    expect(earnings).toBe(parseFloat(earnings.toFixed(2)));
  });

  // ─── Test 21: Expense ratio equal to return rate means zero growth ───
  it('expense ratio equal to return rate yields zero growth', () => {
    const result = calculateIndexFund({
      initialInvestment: 10000,
      monthlyContribution: 500,
      annualReturn: 5,
      expenseRatio: 5.0,
      investmentYears: 10,
      comparisonExpenseRatio: 1.0,
    });
    // Effective return = 0% → just contributions
    expect(result.futureValue).toBe(70000); // 10K + 500*120
    expect(result.totalEarnings).toBe(0);
  });

  // ─── Test 22: Chart year-0 values match initial investment ───
  it('chart year 0 shows initial investment for both funds', () => {
    const result = calculateIndexFund({
      initialInvestment: 25000,
      monthlyContribution: 1000,
      annualReturn: 8,
      expenseRatio: 0.1,
      investmentYears: 20,
      comparisonExpenseRatio: 1.5,
    });
    const chart = result.growthChart as Array<{ year: number; lowCostBalance: number; highCostBalance: number; contributions: number }>;
    expect(chart[0].lowCostBalance).toBe(25000);
    expect(chart[0].highCostBalance).toBe(25000);
    expect(chart[0].contributions).toBe(25000);
  });

  // ─── Test 23: Total earnings = future value minus total contributions ───
  it('total earnings equals future value minus total contributions', () => {
    const result = calculateIndexFund({
      initialInvestment: 10000,
      monthlyContribution: 500,
      annualReturn: 8,
      expenseRatio: 0.2,
      investmentYears: 15,
      comparisonExpenseRatio: 1.0,
    });
    const fv = result.futureValue as number;
    const contrib = result.totalContributions as number;
    const earnings = result.totalEarnings as number;
    expect(earnings).toBeCloseTo(fv - contrib, 1);
  });

  // ─── Test 24: Large initial investment ($1M) with no contributions ───
  it('handles large initial investment correctly', () => {
    const result = calculateIndexFund({
      initialInvestment: 1000000,
      monthlyContribution: 0,
      annualReturn: 7,
      expenseRatio: 0.03,
      investmentYears: 20,
      comparisonExpenseRatio: 1.0,
    });
    const fv = result.futureValue as number;
    // $1M at ~6.97% for 20 years ≈ $3.8M
    expect(fv).toBeGreaterThan(3500000);
    expect(result.totalContributions).toBe(1000000);
  });
});
