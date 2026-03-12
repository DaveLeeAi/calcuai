import { calculateNetWorth } from '@/lib/formulas/finance/net-worth';

describe('calculateNetWorth', () => {
  // ─── Test 1: Basic positive net worth ───
  it('calculates positive net worth correctly', () => {
    const result = calculateNetWorth({
      cashSavings: 15000,
      investments: 50000,
      retirementAccounts: 75000,
      homeValue: 350000,
      vehicleValue: 25000,
      mortgageBalance: 250000,
      studentLoans: 30000,
      autoLoans: 15000,
      creditCardDebt: 5000,
    });
    // Assets: 15000 + 50000 + 75000 + 350000 + 25000 = 515000
    // Liabilities: 250000 + 30000 + 15000 + 5000 = 300000
    // Net worth: 515000 - 300000 = 215000
    expect(result.netWorth).toBe(215000);
    expect(result.totalAssets).toBe(515000);
    expect(result.totalLiabilities).toBe(300000);
  });

  // ─── Test 2: Negative net worth ───
  it('calculates negative net worth when liabilities exceed assets', () => {
    const result = calculateNetWorth({
      cashSavings: 5000,
      investments: 2000,
      retirementAccounts: 8000,
      vehicleValue: 15000,
      studentLoans: 45000,
      autoLoans: 10000,
      creditCardDebt: 2000,
    });
    // Assets: 5000 + 2000 + 8000 + 15000 = 30000
    // Liabilities: 45000 + 10000 + 2000 = 57000
    // Net worth: 30000 - 57000 = -27000
    expect(result.netWorth).toBe(-27000);
    expect(result.totalAssets).toBe(30000);
    expect(result.totalLiabilities).toBe(57000);
  });

  // ─── Test 3: Zero inputs — all empty ───
  it('returns zero net worth when no values are entered', () => {
    const result = calculateNetWorth({});
    expect(result.netWorth).toBe(0);
    expect(result.totalAssets).toBe(0);
    expect(result.totalLiabilities).toBe(0);
  });

  // ─── Test 4: Assets only, no liabilities ───
  it('calculates net worth with assets only', () => {
    const result = calculateNetWorth({
      cashSavings: 50000,
      investments: 100000,
      retirementAccounts: 200000,
    });
    expect(result.netWorth).toBe(350000);
    expect(result.totalAssets).toBe(350000);
    expect(result.totalLiabilities).toBe(0);
  });

  // ─── Test 5: Liabilities only, no assets ───
  it('calculates negative net worth with liabilities only', () => {
    const result = calculateNetWorth({
      studentLoans: 50000,
      creditCardDebt: 10000,
    });
    expect(result.netWorth).toBe(-60000);
    expect(result.totalAssets).toBe(0);
    expect(result.totalLiabilities).toBe(60000);
  });

  // ─── Test 6: Debt-to-asset ratio ───
  it('calculates debt-to-asset ratio correctly', () => {
    const result = calculateNetWorth({
      cashSavings: 50000,
      homeValue: 300000,
      mortgageBalance: 200000,
      creditCardDebt: 5000,
    });
    // Assets: 350000, Liabilities: 205000
    // Ratio: (205000 / 350000) * 100 = 58.57%
    expect(result.debtToAssetRatio).toBeCloseTo(58.57, 1);
  });

  // ─── Test 7: Debt-to-asset ratio is zero when no assets ───
  it('returns zero debt-to-asset ratio when there are no assets', () => {
    const result = calculateNetWorth({
      studentLoans: 30000,
    });
    expect(result.debtToAssetRatio).toBe(0);
  });

  // ─── Test 8: Asset breakdown pie chart — only non-zero entries ───
  it('only includes non-zero assets in breakdown', () => {
    const result = calculateNetWorth({
      cashSavings: 10000,
      investments: 0,
      retirementAccounts: 50000,
      homeValue: 0,
      vehicleValue: 20000,
      otherAssets: 0,
    });
    const breakdown = result.assetBreakdown as Array<{ name: string; value: number }>;
    expect(breakdown.length).toBe(3);
    const names = breakdown.map(b => b.name);
    expect(names).toContain('Cash & Savings');
    expect(names).toContain('Retirement Accounts');
    expect(names).toContain('Vehicles');
    expect(names).not.toContain('Investments');
    expect(names).not.toContain('Home Value');
  });

  // ─── Test 9: Liability breakdown pie chart — only non-zero entries ───
  it('only includes non-zero liabilities in breakdown', () => {
    const result = calculateNetWorth({
      cashSavings: 10000,
      mortgageBalance: 200000,
      studentLoans: 0,
      autoLoans: 15000,
      creditCardDebt: 0,
      otherDebts: 0,
    });
    const breakdown = result.liabilityBreakdown as Array<{ name: string; value: number }>;
    expect(breakdown.length).toBe(2);
    const names = breakdown.map(b => b.name);
    expect(names).toContain('Mortgage');
    expect(names).toContain('Auto Loans');
    expect(names).not.toContain('Student Loans');
  });

  // ─── Test 10: Summary contains all expected labels ───
  it('returns summary with all required labels', () => {
    const result = calculateNetWorth({
      cashSavings: 20000,
      investments: 30000,
      mortgageBalance: 100000,
    });
    const summary = result.summary as Array<{ label: string; value: number | string }>;
    const labels = summary.map(s => s.label);
    expect(labels).toContain('Total Assets');
    expect(labels).toContain('Total Liabilities');
    expect(labels).toContain('Net Worth');
    expect(labels).toContain('Debt-to-Asset Ratio');
    expect(labels).toContain('Assessment');
  });

  // ─── Test 11: Millionaire assessment ───
  it('returns millionaire assessment for net worth >= $1,000,000', () => {
    const result = calculateNetWorth({
      cashSavings: 200000,
      investments: 500000,
      retirementAccounts: 400000,
      mortgageBalance: 50000,
    });
    const summary = result.summary as Array<{ label: string; value: string }>;
    const assessment = summary.find(s => s.label === 'Assessment');
    expect(assessment).toBeDefined();
    expect(assessment!.value).toContain('Millionaire');
  });

  // ─── Test 12: Negative net worth assessment ───
  it('returns negative net worth assessment when liabilities exceed assets', () => {
    const result = calculateNetWorth({
      cashSavings: 1000,
      studentLoans: 50000,
    });
    const summary = result.summary as Array<{ label: string; value: string }>;
    const assessment = summary.find(s => s.label === 'Assessment');
    expect(assessment).toBeDefined();
    expect(assessment!.value).toContain('Negative net worth');
  });

  // ─── Test 13: Other real estate and other assets are included ───
  it('includes otherRealEstate and otherAssets in total', () => {
    const result = calculateNetWorth({
      otherRealEstate: 150000,
      otherAssets: 25000,
    });
    expect(result.totalAssets).toBe(175000);
    expect(result.netWorth).toBe(175000);
  });

  // ─── Test 14: Other debts are included in liabilities ───
  it('includes otherDebts in total liabilities', () => {
    const result = calculateNetWorth({
      cashSavings: 10000,
      otherDebts: 5000,
    });
    expect(result.totalLiabilities).toBe(5000);
    expect(result.netWorth).toBe(5000);
  });

  // ─── Test 15: Large values are handled without overflow ───
  it('handles very large asset values correctly', () => {
    const result = calculateNetWorth({
      cashSavings: 10000000,
      investments: 50000000,
      homeValue: 5000000,
    });
    expect(result.totalAssets).toBe(65000000);
    expect(result.netWorth).toBe(65000000);
  });
});
