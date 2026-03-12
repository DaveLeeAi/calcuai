import { calculateTaxBrackets } from '@/lib/formulas/finance/tax-brackets';

describe('calculateTaxBrackets', () => {
  // ─── Test 1: Single filer at $85,000 — matches MDX worked example ───
  it('calculates correct tax for single filer at $85,000', () => {
    const result = calculateTaxBrackets({
      taxableIncome: 85000,
      filingStatus: 'single',
    });
    // 10%: $11,925 * 0.10 = $1,192.50
    // 12%: $36,550 * 0.12 = $4,386.00
    // 22%: $36,525 * 0.22 = $8,035.50
    // Total: $13,614.00
    expect(result.totalTax).toBeCloseTo(13614, 0);
    expect(result.marginalBracket).toBe(22);
    expect(result.effectiveRate).toBeCloseTo(16.02, 1);
    expect(result.afterTaxIncome).toBeCloseTo(71386, 0);
  });

  // ─── Test 2: Zero income ───
  it('returns zero tax for zero income', () => {
    const result = calculateTaxBrackets({
      taxableIncome: 0,
      filingStatus: 'single',
    });
    expect(result.totalTax).toBe(0);
    expect(result.effectiveRate).toBe(0);
    expect(result.marginalBracket).toBe(10);
    expect(result.afterTaxIncome).toBe(0);
  });

  // ─── Test 3: Income in 10% bracket only ───
  it('calculates tax for income entirely in 10% bracket', () => {
    const result = calculateTaxBrackets({
      taxableIncome: 10000,
      filingStatus: 'single',
    });
    expect(result.totalTax).toBeCloseTo(1000, 0);
    expect(result.marginalBracket).toBe(10);
    expect(result.effectiveRate).toBeCloseTo(10, 1);
  });

  // ─── Test 4: Married filing jointly at $175,000 ───
  it('calculates correct tax for married filing jointly at $175,000', () => {
    const result = calculateTaxBrackets({
      taxableIncome: 175000,
      filingStatus: 'married-jointly',
    });
    // 10%: $23,850 * 0.10 = $2,385.00
    // 12%: $73,100 * 0.12 = $8,772.00
    // 22%: $78,050 * 0.22 = $17,171.00
    // Total: $28,328.00
    expect(result.totalTax).toBeCloseTo(28328, 0);
    expect(result.marginalBracket).toBe(22);
  });

  // ─── Test 5: Head of household at $80,000 ───
  it('calculates correct tax for head of household at $80,000', () => {
    const result = calculateTaxBrackets({
      taxableIncome: 80000,
      filingStatus: 'head-of-household',
    });
    // 10%: $17,000 * 0.10 = $1,700.00
    // 12%: $47,850 * 0.12 = $5,742.00
    // 22%: $15,150 * 0.22 = $3,333.00
    // Total: $10,775.00
    expect(result.totalTax).toBeCloseTo(10775, 0);
    expect(result.marginalBracket).toBe(22);
  });

  // ─── Test 6: Married filing separately uses same brackets as single ───
  it('married filing separately matches single filer brackets', () => {
    const single = calculateTaxBrackets({
      taxableIncome: 100000,
      filingStatus: 'single',
    });
    const separate = calculateTaxBrackets({
      taxableIncome: 100000,
      filingStatus: 'married-separately',
    });
    expect(single.totalTax).toBe(separate.totalTax);
    expect(single.marginalBracket).toBe(separate.marginalBracket);
    expect(single.effectiveRate).toBe(separate.effectiveRate);
  });

  // ─── Test 7: Effective rate is always less than marginal rate ───
  it('effective rate is less than marginal rate for all positive incomes', () => {
    const incomes = [15000, 50000, 100000, 250000, 500000, 700000];
    for (const income of incomes) {
      const result = calculateTaxBrackets({
        taxableIncome: income,
        filingStatus: 'single',
      });
      expect(Number(result.effectiveRate)).toBeLessThan(Number(result.marginalBracket));
    }
  });

  // ─── Test 8: Bracket breakdown table has 7 rows ───
  it('returns bracket breakdown with 7 entries', () => {
    const result = calculateTaxBrackets({
      taxableIncome: 85000,
      filingStatus: 'single',
    });
    const breakdown = result.bracketBreakdown as Array<{
      bracket: string;
      taxableAmount: number;
      taxOwed: number;
    }>;
    expect(breakdown).toHaveLength(7);
    // First three brackets have positive amounts
    expect(breakdown[0].taxableAmount).toBe(11925);
    expect(breakdown[0].taxOwed).toBeCloseTo(1192.50, 2);
    expect(breakdown[1].taxableAmount).toBe(36550);
    expect(breakdown[1].taxOwed).toBeCloseTo(4386, 2);
    expect(breakdown[2].taxableAmount).toBe(36525);
    expect(breakdown[2].taxOwed).toBeCloseTo(8035.50, 2);
    // Remaining brackets should be zero
    expect(breakdown[3].taxableAmount).toBe(0);
    expect(breakdown[4].taxableAmount).toBe(0);
    expect(breakdown[5].taxableAmount).toBe(0);
    expect(breakdown[6].taxableAmount).toBe(0);
  });

  // ─── Test 9: Bracket visualization chart data ───
  it('returns bracket visualization data with correct structure', () => {
    const result = calculateTaxBrackets({
      taxableIncome: 85000,
      filingStatus: 'single',
    });
    const viz = result.bracketVisualization as Array<{ bracket: string; taxOwed: number }>;
    expect(viz).toHaveLength(7);
    expect(viz[0].bracket).toBe('10%');
    expect(viz[6].bracket).toBe('37%');
    // Sum of taxOwed should equal totalTax
    const sum = viz.reduce((acc, row) => acc + row.taxOwed, 0);
    expect(sum).toBeCloseTo(Number(result.totalTax), 1);
  });

  // ─── Test 10: Summary contains all expected labels ───
  it('returns summary with all required labels', () => {
    const result = calculateTaxBrackets({
      taxableIncome: 85000,
      filingStatus: 'single',
    });
    const summary = result.summary as Array<{ label: string; value: number | string }>;
    const labels = summary.map(s => s.label);
    expect(labels).toContain('Taxable Income');
    expect(labels).toContain('Marginal Tax Bracket');
    expect(labels).toContain('Effective Tax Rate');
    expect(labels).toContain('Total Federal Tax');
    expect(labels).toContain('After-Tax Income');
  });

  // ─── Test 11: Very high income — $1,000,000 single ───
  it('calculates correctly for $1,000,000 single filer', () => {
    const result = calculateTaxBrackets({
      taxableIncome: 1000000,
      filingStatus: 'single',
    });
    // 10%: $1,192.50 + 12%: $4,386.00 + 22%: $12,072.50
    // + 24%: $22,548.00 + 32%: $17,032.00 + 35%: $131,538.75
    // + 37%: ($1,000,000 - $626,350) * 0.37 = $138,250.50
    // Total ≈ $327,020.25
    expect(result.marginalBracket).toBe(37);
    expect(Number(result.totalTax)).toBeGreaterThan(320000);
    expect(Number(result.totalTax)).toBeLessThan(335000);
  });

  // ─── Test 12: Exact bracket boundary — single at $11,925 ───
  it('handles exact bracket boundary correctly', () => {
    const result = calculateTaxBrackets({
      taxableIncome: 11925,
      filingStatus: 'single',
    });
    // Exactly at 10% bracket limit
    expect(result.totalTax).toBeCloseTo(1192.50, 2);
    expect(result.marginalBracket).toBe(10);
  });

  // ─── Test 13: One dollar into next bracket ───
  it('applies next bracket rate on income $1 over boundary', () => {
    const result = calculateTaxBrackets({
      taxableIncome: 11926,
      filingStatus: 'single',
    });
    // $11,925 * 0.10 + $1 * 0.12 = $1,192.50 + $0.12 = $1,192.62
    expect(result.totalTax).toBeCloseTo(1192.62, 1);
    expect(result.marginalBracket).toBe(12);
  });

  // ─── Test 14: Negative income is floored at zero ───
  it('floors negative income at zero', () => {
    const result = calculateTaxBrackets({
      taxableIncome: -5000,
      filingStatus: 'single',
    });
    expect(result.totalTax).toBe(0);
    expect(result.effectiveRate).toBe(0);
    expect(result.afterTaxIncome).toBe(0);
  });

  // ─── Test 15: Default filing status to single ───
  it('defaults to single filing status when not specified', () => {
    const result = calculateTaxBrackets({
      taxableIncome: 85000,
    });
    const explicit = calculateTaxBrackets({
      taxableIncome: 85000,
      filingStatus: 'single',
    });
    expect(result.totalTax).toBe(explicit.totalTax);
  });
});
