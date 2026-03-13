import { calculateRetirementWithdrawal } from '@/lib/formulas/finance/retirement-withdrawal';

describe('calculateRetirementWithdrawal', () => {
  // ─── Test 1: Classic 4% rule — $1M, $40K withdrawal, 6% return, 3% inflation ───
  it('classic 4% rule scenario lasts approximately 30 years', () => {
    const result = calculateRetirementWithdrawal({
      portfolioBalance: 1000000,
      annualWithdrawal: 40000,
      expectedReturn: 6,
      inflationRate: 3,
      adjustForInflation: true,
    });
    const years = result.yearsPortfolioLasts as number;
    // With 6% return on remaining balance after withdrawal and 3% inflation,
    // the effective real return is ~3%, portfolio lasts ~40-45 years
    expect(years).toBeGreaterThanOrEqual(35);
    expect(years).toBeLessThanOrEqual(50);
    expect(result.withdrawalRate).toBe(4);
  });

  // ─── Test 2: Zero inflation — withdrawals stay flat ───
  it('zero inflation makes portfolio last longer', () => {
    const withInflation = calculateRetirementWithdrawal({
      portfolioBalance: 1000000,
      annualWithdrawal: 50000,
      expectedReturn: 5,
      inflationRate: 3,
      adjustForInflation: true,
    });
    const noInflation = calculateRetirementWithdrawal({
      portfolioBalance: 1000000,
      annualWithdrawal: 50000,
      expectedReturn: 5,
      inflationRate: 0,
      adjustForInflation: true,
    });
    expect(noInflation.yearsPortfolioLasts as number).toBeGreaterThan(
      withInflation.yearsPortfolioLasts as number
    );
  });

  // ─── Test 3: No inflation adjustment — flat withdrawals despite inflation setting ───
  it('no inflation adjustment keeps withdrawals constant', () => {
    const result = calculateRetirementWithdrawal({
      portfolioBalance: 500000,
      annualWithdrawal: 25000,
      expectedReturn: 5,
      inflationRate: 3,
      adjustForInflation: false,
    });
    const yearByYear = result.yearByYear as { withdrawal: number }[];
    // All withdrawals should be $25,000 (or less if balance runs low)
    const fullWithdrawals = yearByYear.filter(y => y.withdrawal === 25000);
    expect(fullWithdrawals.length).toBeGreaterThan(5);
    // First and fifth year withdrawals should be identical
    expect(yearByYear[0].withdrawal).toBe(25000);
    expect(yearByYear[4].withdrawal).toBe(25000);
  });

  // ─── Test 4: Return equals withdrawal rate — lasts very long ───
  it('return matching withdrawal rate makes portfolio last a very long time', () => {
    const result = calculateRetirementWithdrawal({
      portfolioBalance: 1000000,
      annualWithdrawal: 40000,
      expectedReturn: 4,
      inflationRate: 0,
      adjustForInflation: false,
    });
    // 4% withdrawal with 4% return and no inflation — should last a very long time
    // Growth exactly replaces withdrawal in early years (growth on remaining balance)
    const years = result.yearsPortfolioLasts as number;
    expect(years).toBeGreaterThanOrEqual(50);
  });

  // ─── Test 5: Return less than withdrawal rate — depletes ───
  it('low return with high withdrawal depletes portfolio', () => {
    const result = calculateRetirementWithdrawal({
      portfolioBalance: 500000,
      annualWithdrawal: 40000,
      expectedReturn: 2,
      inflationRate: 3,
      adjustForInflation: true,
    });
    const years = result.yearsPortfolioLasts as number;
    // 8% withdrawal rate with only 2% return and 3% inflation — depletes fast
    expect(years).toBeLessThan(20);
    expect(years).toBeGreaterThan(5);
  });

  // ─── Test 6: Zero return — simple division ───
  it('zero return depletes based on simple withdrawal arithmetic', () => {
    const result = calculateRetirementWithdrawal({
      portfolioBalance: 200000,
      annualWithdrawal: 20000,
      expectedReturn: 0,
      inflationRate: 0,
      adjustForInflation: false,
    });
    // $200K / $20K per year = exactly 10 years
    expect(result.yearsPortfolioLasts).toBe(10);
    expect(result.totalWithdrawn).toBe(200000);
  });

  // ─── Test 7: Very high withdrawal — depletes fast ───
  it('very high withdrawal depletes in just a few years', () => {
    const result = calculateRetirementWithdrawal({
      portfolioBalance: 100000,
      annualWithdrawal: 50000,
      expectedReturn: 5,
      inflationRate: 2,
      adjustForInflation: true,
    });
    const years = result.yearsPortfolioLasts as number;
    expect(years).toBeLessThanOrEqual(3);
  });

  // ─── Test 8: Very low withdrawal — lasts 100 years ───
  it('very low withdrawal rate lasts 100 years', () => {
    const result = calculateRetirementWithdrawal({
      portfolioBalance: 2000000,
      annualWithdrawal: 20000,
      expectedReturn: 7,
      inflationRate: 2,
      adjustForInflation: true,
    });
    // 1% withdrawal rate with 7% return — should last the full 100 years
    expect(result.yearsPortfolioLasts).toBe(100);
  });

  // ─── Test 9: Large portfolio ($5M) ───
  it('large portfolio with moderate withdrawal lasts very long', () => {
    const result = calculateRetirementWithdrawal({
      portfolioBalance: 5000000,
      annualWithdrawal: 150000,
      expectedReturn: 6,
      inflationRate: 3,
      adjustForInflation: true,
    });
    const years = result.yearsPortfolioLasts as number;
    // 3% withdrawal rate with 6% return — should last 50+ years
    expect(years).toBeGreaterThanOrEqual(50);
    expect(result.withdrawalRate).toBe(3);
  });

  // ─── Test 10: Small portfolio ($100K) ───
  it('small portfolio depletes quickly with moderate withdrawal', () => {
    const result = calculateRetirementWithdrawal({
      portfolioBalance: 100000,
      annualWithdrawal: 10000,
      expectedReturn: 4,
      inflationRate: 3,
      adjustForInflation: true,
    });
    const years = result.yearsPortfolioLasts as number;
    // 10% withdrawal rate — depletes relatively fast
    expect(years).toBeGreaterThan(5);
    expect(years).toBeLessThan(25);
  });

  // ─── Test 11: High inflation (8%) ───
  it('high inflation drastically reduces portfolio longevity', () => {
    const normalInflation = calculateRetirementWithdrawal({
      portfolioBalance: 1000000,
      annualWithdrawal: 40000,
      expectedReturn: 6,
      inflationRate: 3,
      adjustForInflation: true,
    });
    const highInflation = calculateRetirementWithdrawal({
      portfolioBalance: 1000000,
      annualWithdrawal: 40000,
      expectedReturn: 6,
      inflationRate: 8,
      adjustForInflation: true,
    });
    expect(highInflation.yearsPortfolioLasts as number).toBeLessThan(
      normalInflation.yearsPortfolioLasts as number
    );
  });

  // ─── Test 12: Withdrawal exceeds portfolio — depletes year 1 ───
  it('withdrawal exceeding portfolio depletes in year 1', () => {
    const result = calculateRetirementWithdrawal({
      portfolioBalance: 30000,
      annualWithdrawal: 50000,
      expectedReturn: 5,
      inflationRate: 2,
      adjustForInflation: true,
    });
    const years = result.yearsPortfolioLasts as number;
    expect(years).toBe(1);
    // Total withdrawn should be at most the portfolio balance
    expect(result.totalWithdrawn as number).toBeLessThanOrEqual(30000);
  });

  // ─── Test 13: Verify yearByYear array length matches years portfolio lasts ───
  it('yearByYear array length matches depletion timeline', () => {
    const result = calculateRetirementWithdrawal({
      portfolioBalance: 200000,
      annualWithdrawal: 20000,
      expectedReturn: 0,
      inflationRate: 0,
      adjustForInflation: false,
    });
    const yearByYear = result.yearByYear as { year: number }[];
    expect(yearByYear.length).toBe(10);
    expect(yearByYear[0].year).toBe(1);
    expect(yearByYear[yearByYear.length - 1].year).toBe(10);
  });

  // ─── Test 14: Verify summary contains required labels ───
  it('summary contains all required labels', () => {
    const result = calculateRetirementWithdrawal({
      portfolioBalance: 1000000,
      annualWithdrawal: 40000,
      expectedReturn: 6,
      inflationRate: 3,
      adjustForInflation: true,
    });
    const summary = result.summary as { label: string; value: number }[];
    const labels = summary.map(s => s.label);
    expect(labels).toContain('Starting Portfolio');
    expect(labels).toContain('Annual Withdrawal');
    expect(labels).toContain('Initial Withdrawal Rate');
    expect(labels).toContain('Total Withdrawn');
    expect(labels).toContain('Years Portfolio Lasts');
    expect(summary.length).toBe(5);
  });

  // ─── Test 15: Balance over time chart starts at portfolio balance ───
  it('balanceOverTime chart starts at initial portfolio balance', () => {
    const result = calculateRetirementWithdrawal({
      portfolioBalance: 750000,
      annualWithdrawal: 30000,
      expectedReturn: 5,
      inflationRate: 2,
      adjustForInflation: true,
    });
    const chart = result.balanceOverTime as { year: number; balance: number }[];
    expect(chart[0].year).toBe(0);
    expect(chart[0].balance).toBe(750000);
    // Last entry should be 0 or positive
    const lastBalance = chart[chart.length - 1].balance;
    expect(lastBalance).toBeGreaterThanOrEqual(0);
  });

  // ─── Test 16: Total withdrawn never exceeds starting balance when zero return ───
  it('total withdrawn with zero return equals portfolio balance', () => {
    const result = calculateRetirementWithdrawal({
      portfolioBalance: 300000,
      annualWithdrawal: 30000,
      expectedReturn: 0,
      inflationRate: 0,
      adjustForInflation: false,
    });
    expect(result.totalWithdrawn).toBe(300000);
    expect(result.yearsPortfolioLasts).toBe(10);
  });
});
