import { calculateWorkingCapital } from '@/lib/formulas/business/working-capital';

describe('calculateWorkingCapital', () => {
  // ─── Test 1: Basic working capital with defaults ───
  it('calculates working capital with default-like values', () => {
    const result = calculateWorkingCapital({
      cash: 50000,
      accountsReceivable: 75000,
      inventory: 40000,
      shortTermInvestments: 10000,
      otherCurrentAssets: 5000,
      accountsPayable: 45000,
      shortTermDebt: 20000,
      accruedExpenses: 15000,
      otherCurrentLiabilities: 5000,
      annualRevenue: 500000,
    });
    // CA = 50000+75000+40000+10000+5000 = 180000
    // CL = 45000+20000+15000+5000 = 85000
    // WC = 180000 - 85000 = 95000
    expect(result.workingCapital).toBe(95000);
  });

  // ─── Test 2: Current ratio ───
  it('calculates current ratio correctly', () => {
    const result = calculateWorkingCapital({
      cash: 50000,
      accountsReceivable: 75000,
      inventory: 40000,
      shortTermInvestments: 10000,
      otherCurrentAssets: 5000,
      accountsPayable: 45000,
      shortTermDebt: 20000,
      accruedExpenses: 15000,
      otherCurrentLiabilities: 5000,
      annualRevenue: 500000,
    });
    // Current Ratio = 180000 / 85000 = 2.117... ≈ 2.12
    expect(result.currentRatio).toBe(2.12);
  });

  // ─── Test 3: Quick ratio excludes inventory and other current assets ───
  it('calculates quick ratio correctly', () => {
    const result = calculateWorkingCapital({
      cash: 50000,
      accountsReceivable: 75000,
      inventory: 40000,
      shortTermInvestments: 10000,
      otherCurrentAssets: 5000,
      accountsPayable: 45000,
      shortTermDebt: 20000,
      accruedExpenses: 15000,
      otherCurrentLiabilities: 5000,
      annualRevenue: 500000,
    });
    // Quick Assets = 50000+75000+10000 = 135000
    // Quick Ratio = 135000 / 85000 = 1.588... ≈ 1.59
    expect(result.quickRatio).toBe(1.59);
  });

  // ─── Test 4: Working capital ratio (% of revenue) ───
  it('calculates working capital ratio correctly', () => {
    const result = calculateWorkingCapital({
      cash: 50000,
      accountsReceivable: 75000,
      inventory: 40000,
      shortTermInvestments: 10000,
      otherCurrentAssets: 5000,
      accountsPayable: 45000,
      shortTermDebt: 20000,
      accruedExpenses: 15000,
      otherCurrentLiabilities: 5000,
      annualRevenue: 500000,
    });
    // WC Ratio = (95000 / 500000) x 100 = 19%
    expect(result.workingCapitalRatio).toBe(19);
  });

  // ─── Test 5: Days working capital ───
  it('calculates days working capital correctly', () => {
    const result = calculateWorkingCapital({
      cash: 50000,
      accountsReceivable: 75000,
      inventory: 40000,
      shortTermInvestments: 10000,
      otherCurrentAssets: 5000,
      accountsPayable: 45000,
      shortTermDebt: 20000,
      accruedExpenses: 15000,
      otherCurrentLiabilities: 5000,
      annualRevenue: 500000,
    });
    // Days WC = (95000 / 500000) x 365 = 69.35
    expect(result.daysWorkingCapital).toBe(69.35);
  });

  // ─── Test 6: Healthy status when current ratio >= 1.5 ───
  it('returns Healthy when current ratio >= 1.5', () => {
    const result = calculateWorkingCapital({
      cash: 100000,
      accountsReceivable: 0,
      inventory: 0,
      shortTermInvestments: 0,
      otherCurrentAssets: 0,
      accountsPayable: 50000,
      shortTermDebt: 0,
      accruedExpenses: 0,
      otherCurrentLiabilities: 0,
      annualRevenue: 100000,
    });
    // Current Ratio = 100000 / 50000 = 2.0
    expect(result.healthStatus).toBe('Healthy');
  });

  // ─── Test 7: Tight status when 1.0 <= current ratio < 1.5 ───
  it('returns Tight when current ratio is between 1.0 and 1.49', () => {
    const result = calculateWorkingCapital({
      cash: 60000,
      accountsReceivable: 0,
      inventory: 0,
      shortTermInvestments: 0,
      otherCurrentAssets: 0,
      accountsPayable: 50000,
      shortTermDebt: 0,
      accruedExpenses: 0,
      otherCurrentLiabilities: 0,
      annualRevenue: 100000,
    });
    // Current Ratio = 60000 / 50000 = 1.2
    expect(result.healthStatus).toBe('Tight');
  });

  // ─── Test 8: Negative status when current ratio < 1.0 ───
  it('returns Negative when current ratio < 1.0', () => {
    const result = calculateWorkingCapital({
      cash: 30000,
      accountsReceivable: 0,
      inventory: 0,
      shortTermInvestments: 0,
      otherCurrentAssets: 0,
      accountsPayable: 50000,
      shortTermDebt: 0,
      accruedExpenses: 0,
      otherCurrentLiabilities: 0,
      annualRevenue: 100000,
    });
    // Current Ratio = 30000 / 50000 = 0.6
    expect(result.healthStatus).toBe('Negative');
  });

  // ─── Test 9: Negative working capital ───
  it('returns negative working capital when liabilities exceed assets', () => {
    const result = calculateWorkingCapital({
      cash: 10000,
      accountsReceivable: 5000,
      inventory: 5000,
      shortTermInvestments: 0,
      otherCurrentAssets: 0,
      accountsPayable: 30000,
      shortTermDebt: 10000,
      accruedExpenses: 5000,
      otherCurrentLiabilities: 0,
      annualRevenue: 200000,
    });
    // CA = 20000, CL = 45000
    // WC = 20000 - 45000 = -25000
    expect(result.workingCapital).toBe(-25000);
  });

  // ─── Test 10: Zero liabilities gives zero ratios ───
  it('returns 0 for ratios when liabilities are zero', () => {
    const result = calculateWorkingCapital({
      cash: 50000,
      accountsReceivable: 0,
      inventory: 0,
      shortTermInvestments: 0,
      otherCurrentAssets: 0,
      accountsPayable: 0,
      shortTermDebt: 0,
      accruedExpenses: 0,
      otherCurrentLiabilities: 0,
      annualRevenue: 100000,
    });
    expect(result.currentRatio).toBe(0);
    expect(result.quickRatio).toBe(0);
  });

  // ─── Test 11: Zero revenue gives zero ratio and days ───
  it('returns 0 for WC ratio and days when revenue is zero', () => {
    const result = calculateWorkingCapital({
      cash: 50000,
      accountsReceivable: 25000,
      inventory: 10000,
      shortTermInvestments: 0,
      otherCurrentAssets: 0,
      accountsPayable: 20000,
      shortTermDebt: 0,
      accruedExpenses: 0,
      otherCurrentLiabilities: 0,
      annualRevenue: 0,
    });
    expect(result.workingCapitalRatio).toBe(0);
    expect(result.daysWorkingCapital).toBe(0);
  });

  // ─── Test 12: Missing inputs default to zero ───
  it('defaults missing inputs to safe values', () => {
    const result = calculateWorkingCapital({});
    expect(result.workingCapital).toBe(0);
    expect(result.currentRatio).toBe(0);
    expect(result.quickRatio).toBe(0);
    expect(result.workingCapitalRatio).toBe(0);
    expect(result.daysWorkingCapital).toBe(0);
  });

  // ─── Test 13: String input coercion ───
  it('coerces string inputs to numbers', () => {
    const result = calculateWorkingCapital({
      cash: '50000',
      accountsReceivable: '25000',
      inventory: '10000',
      shortTermInvestments: '5000',
      otherCurrentAssets: '0',
      accountsPayable: '30000',
      shortTermDebt: '10000',
      accruedExpenses: '5000',
      otherCurrentLiabilities: '0',
      annualRevenue: '200000',
    });
    // CA = 90000, CL = 45000
    // WC = 45000
    expect(result.workingCapital).toBe(45000);
  });

  // ─── Test 14: Negative inputs coerced to zero ───
  it('coerces negative inputs to zero', () => {
    const result = calculateWorkingCapital({
      cash: -10000,
      accountsReceivable: 50000,
      inventory: 0,
      shortTermInvestments: 0,
      otherCurrentAssets: 0,
      accountsPayable: 20000,
      shortTermDebt: 0,
      accruedExpenses: 0,
      otherCurrentLiabilities: 0,
      annualRevenue: 100000,
    });
    // Cash forced to 0, CA = 50000, CL = 20000, WC = 30000
    expect(result.workingCapital).toBe(30000);
  });

  // ─── Test 15: Exact 1.5 ratio is Healthy ───
  it('classifies exactly 1.5 ratio as Healthy', () => {
    const result = calculateWorkingCapital({
      cash: 75000,
      accountsReceivable: 0,
      inventory: 0,
      shortTermInvestments: 0,
      otherCurrentAssets: 0,
      accountsPayable: 50000,
      shortTermDebt: 0,
      accruedExpenses: 0,
      otherCurrentLiabilities: 0,
      annualRevenue: 100000,
    });
    expect(result.currentRatio).toBe(1.5);
    expect(result.healthStatus).toBe('Healthy');
  });

  // ─── Test 16: Exact 1.0 ratio is Tight ───
  it('classifies exactly 1.0 ratio as Tight', () => {
    const result = calculateWorkingCapital({
      cash: 50000,
      accountsReceivable: 0,
      inventory: 0,
      shortTermInvestments: 0,
      otherCurrentAssets: 0,
      accountsPayable: 50000,
      shortTermDebt: 0,
      accruedExpenses: 0,
      otherCurrentLiabilities: 0,
      annualRevenue: 100000,
    });
    expect(result.currentRatio).toBe(1);
    expect(result.healthStatus).toBe('Tight');
  });

  // ─── Test 17: Large values ───
  it('handles large enterprise-scale values', () => {
    const result = calculateWorkingCapital({
      cash: 5000000,
      accountsReceivable: 8000000,
      inventory: 3000000,
      shortTermInvestments: 2000000,
      otherCurrentAssets: 500000,
      accountsPayable: 6000000,
      shortTermDebt: 2000000,
      accruedExpenses: 1000000,
      otherCurrentLiabilities: 500000,
      annualRevenue: 50000000,
    });
    // CA = 18500000, CL = 9500000
    // WC = 9000000
    expect(result.workingCapital).toBe(9000000);
  });

  // ─── Test 18: All output fields present ───
  it('returns all expected output fields', () => {
    const result = calculateWorkingCapital({
      cash: 50000,
      accountsReceivable: 25000,
      inventory: 10000,
      shortTermInvestments: 5000,
      otherCurrentAssets: 0,
      accountsPayable: 30000,
      shortTermDebt: 0,
      accruedExpenses: 0,
      otherCurrentLiabilities: 0,
      annualRevenue: 200000,
    });
    expect(result).toHaveProperty('workingCapital');
    expect(result).toHaveProperty('currentRatio');
    expect(result).toHaveProperty('quickRatio');
    expect(result).toHaveProperty('workingCapitalRatio');
    expect(result).toHaveProperty('daysWorkingCapital');
    expect(result).toHaveProperty('healthStatus');
    expect(result).toHaveProperty('summary');
  });

  // ─── Test 19: Summary contains expected labels ───
  it('returns summary with expected labels', () => {
    const result = calculateWorkingCapital({
      cash: 50000,
      accountsReceivable: 25000,
      inventory: 10000,
      shortTermInvestments: 5000,
      otherCurrentAssets: 0,
      accountsPayable: 30000,
      shortTermDebt: 0,
      accruedExpenses: 0,
      otherCurrentLiabilities: 0,
      annualRevenue: 200000,
    });
    const summary = result.summary as { label: string; value: number | string }[];
    const labels = summary.map((s) => s.label);
    expect(labels).toContain('Working Capital');
    expect(labels).toContain('Current Ratio');
    expect(labels).toContain('Quick Ratio');
    expect(labels).toContain('Working Capital Ratio');
    expect(labels).toContain('Days Working Capital');
    expect(labels).toContain('Health Status');
    expect(labels).toContain('Total Current Assets');
    expect(labels).toContain('Total Current Liabilities');
  });

  // ─── Test 20: Quick ratio lower than current ratio ───
  it('produces quick ratio lower than current ratio when inventory is high', () => {
    const result = calculateWorkingCapital({
      cash: 20000,
      accountsReceivable: 30000,
      inventory: 100000,
      shortTermInvestments: 0,
      otherCurrentAssets: 0,
      accountsPayable: 50000,
      shortTermDebt: 0,
      accruedExpenses: 0,
      otherCurrentLiabilities: 0,
      annualRevenue: 300000,
    });
    // CA = 150000, CL = 50000
    // Current Ratio = 3.0
    // Quick Assets = 20000+30000 = 50000
    // Quick Ratio = 50000/50000 = 1.0
    expect(Number(result.currentRatio)).toBeGreaterThan(Number(result.quickRatio));
  });

  // ─── Test 21: Negative days working capital ───
  it('returns negative days when working capital is negative', () => {
    const result = calculateWorkingCapital({
      cash: 5000,
      accountsReceivable: 5000,
      inventory: 0,
      shortTermInvestments: 0,
      otherCurrentAssets: 0,
      accountsPayable: 30000,
      shortTermDebt: 0,
      accruedExpenses: 0,
      otherCurrentLiabilities: 0,
      annualRevenue: 100000,
    });
    // WC = 10000 - 30000 = -20000
    // Days = (-20000 / 100000) x 365 = -73
    expect(result.daysWorkingCapital).toBe(-73);
    expect(result.workingCapital).toBe(-20000);
  });

  // ─── Test 22: Balanced assets and liabilities ───
  it('handles equal assets and liabilities (zero working capital)', () => {
    const result = calculateWorkingCapital({
      cash: 25000,
      accountsReceivable: 25000,
      inventory: 0,
      shortTermInvestments: 0,
      otherCurrentAssets: 0,
      accountsPayable: 25000,
      shortTermDebt: 25000,
      accruedExpenses: 0,
      otherCurrentLiabilities: 0,
      annualRevenue: 200000,
    });
    expect(result.workingCapital).toBe(0);
    expect(result.currentRatio).toBe(1);
    expect(result.healthStatus).toBe('Tight');
  });
});
