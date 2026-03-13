import { calculateCapitalGainsTax } from '@/lib/formulas/finance/capital-gains-tax';

describe('calculateCapitalGainsTax', () => {
  // ─── Test 1: Long-term, single, $80K income, $30K gain → mostly 15% ───
  it('calculates long-term gain for single filer at $80K income with $30K gain', () => {
    const result = calculateCapitalGainsTax({
      purchasePrice: 50000,
      salePrice: 80000,
      holdingPeriod: 'long',
      annualIncome: 80000,
      filingStatus: 'single',
    });
    // Taxable ordinary income = $80,000 - $15,000 = $65,000
    // Gain stacks from $65,000 to $95,000
    // LTCG single: 0% up to $48,350; 15% from $48,351 to $533,400
    // Ordinary income already past $48,350, so entire $30K gain at 15%
    expect(result.capitalGain).toBe(30000);
    expect(result.taxOwed).toBeCloseTo(4500, 0); // 30,000 * 0.15
    expect(result.effectiveRate).toBeCloseTo(15, 0);
    expect(result.netProceeds).toBeCloseTo(75500, 0);
  });

  // ─── Test 2: Short-term, single, $80K income, $30K gain ───
  it('calculates short-term gain at ordinary rates for single filer', () => {
    const result = calculateCapitalGainsTax({
      purchasePrice: 50000,
      salePrice: 80000,
      holdingPeriod: 'short',
      annualIncome: 80000,
      filingStatus: 'single',
    });
    // Taxable without gain = $80K - $15K = $65K (in 22% bracket)
    // Taxable with gain = $110K - $15K = $95K (still 22% bracket, barely)
    // Tax on $95K: 10%:$1,192.50 + 12%:$4,386 + 22%:$10,235.50 = $15,814
    // Tax on $65K: 10%:$1,192.50 + 12%:$4,386 + 22%:$3,635.50 = $9,214
    // Incremental tax = $15,814 - $9,214 = $6,600
    expect(result.capitalGain).toBe(30000);
    expect(result.taxOwed).toBeCloseTo(6600, 0);
    // Short-term effective rate should be higher than long-term
    expect(result.effectiveRate).toBeGreaterThan(15);
  });

  // ─── Test 3: Long-term, low income ($30K) → 0% bracket for some/all gain ───
  it('applies 0% rate for low-income long-term gains', () => {
    const result = calculateCapitalGainsTax({
      purchasePrice: 50000,
      salePrice: 60000,
      holdingPeriod: 'long',
      annualIncome: 30000,
      filingStatus: 'single',
    });
    // Taxable ordinary = $30K - $15K = $15K
    // LTCG: 0% up to $48,350. Gain stacks from $15K to $25K
    // Entire $10K gain is in 0% bracket
    expect(result.capitalGain).toBe(10000);
    expect(result.taxOwed).toBe(0);
    expect(result.effectiveRate).toBe(0);
    expect(result.netProceeds).toBe(60000);
  });

  // ─── Test 4: Long-term, high income ($500K) → hits 20% bracket ───
  it('applies 20% rate for high-income long-term gains', () => {
    const result = calculateCapitalGainsTax({
      purchasePrice: 100000,
      salePrice: 200000,
      holdingPeriod: 'long',
      annualIncome: 500000,
      filingStatus: 'single',
    });
    // Taxable ordinary = $500K - $15K = $485K
    // Gain stacks from $485K to $585K
    // LTCG single: 15% up to $533,400; 20% above
    // $533,400 - $485,000 = $48,400 at 15% = $7,260
    // $585,000 - $533,400 = $51,600 at 20% = $10,320
    // Total ≈ $17,580
    expect(result.capitalGain).toBe(100000);
    expect(result.taxOwed).toBeCloseTo(17580, 0);
    expect(result.effectiveRate).toBeCloseTo(17.58, 0);
  });

  // ─── Test 5: Married Filing Jointly ───
  it('uses MFJ brackets for married filing status', () => {
    const result = calculateCapitalGainsTax({
      purchasePrice: 50000,
      salePrice: 80000,
      holdingPeriod: 'long',
      annualIncome: 80000,
      filingStatus: 'married',
    });
    // Taxable ordinary = $80K - $30K = $50K
    // LTCG MFJ: 0% up to $96,700
    // Gain stacks from $50K to $80K — still in 0% bracket
    expect(result.capitalGain).toBe(30000);
    expect(result.taxOwed).toBe(0);
    expect(result.effectiveRate).toBe(0);
  });

  // ─── Test 6: Head of Household ───
  it('uses HOH brackets for Head of Household status', () => {
    const result = calculateCapitalGainsTax({
      purchasePrice: 50000,
      salePrice: 80000,
      holdingPeriod: 'long',
      annualIncome: 80000,
      filingStatus: 'head',
    });
    // Taxable ordinary = $80K - $22.5K = $57.5K
    // LTCG HOH: 0% up to $64,750
    // Gain stacks from $57.5K to $87.5K
    // $64,750 - $57,500 = $7,250 at 0% = $0
    // $87,500 - $64,750 = $22,750 at 15% = $3,412.50
    expect(result.capitalGain).toBe(30000);
    expect(result.taxOwed).toBeCloseTo(3412.50, 0);
  });

  // ─── Test 7: Capital loss (sale < purchase) → $0 tax ───
  it('returns zero tax for a capital loss', () => {
    const result = calculateCapitalGainsTax({
      purchasePrice: 80000,
      salePrice: 50000,
      holdingPeriod: 'long',
      annualIncome: 80000,
      filingStatus: 'single',
    });
    expect(result.capitalGain).toBe(-30000);
    expect(result.taxOwed).toBe(0);
    expect(result.effectiveRate).toBe(0);
    expect(result.netProceeds).toBe(50000);
  });

  // ─── Test 8: Break-even (sale = purchase) → $0 tax ───
  it('returns zero tax when sale equals purchase price', () => {
    const result = calculateCapitalGainsTax({
      purchasePrice: 50000,
      salePrice: 50000,
      holdingPeriod: 'long',
      annualIncome: 80000,
      filingStatus: 'single',
    });
    expect(result.capitalGain).toBe(0);
    expect(result.taxOwed).toBe(0);
    expect(result.effectiveRate).toBe(0);
    expect(result.netProceeds).toBe(50000);
  });

  // ─── Test 9: Very large gain ($1M) ───
  it('calculates correctly for a very large gain ($1M)', () => {
    const result = calculateCapitalGainsTax({
      purchasePrice: 100000,
      salePrice: 1100000,
      holdingPeriod: 'long',
      annualIncome: 100000,
      filingStatus: 'single',
    });
    // Taxable ordinary = $85K
    // $1M gain stacks from $85K to $1,085,000
    // 0% on ($48,350 - $85,000) = $0 (already past 0% bracket)
    // 15% on ($533,400 - $85,000) = $448,400 * 0.15 = $67,260
    // 20% on ($1,085,000 - $533,400) = $551,600 * 0.20 = $110,320
    // Total ≈ $177,580
    expect(result.capitalGain).toBe(1000000);
    expect(result.taxOwed).toBeCloseTo(177580, 0);
    expect(result.netProceeds).toBeCloseTo(1100000 - 177580, 0);
  });

  // ─── Test 10: Small gain ($100) ───
  it('calculates correctly for a small gain ($100)', () => {
    const result = calculateCapitalGainsTax({
      purchasePrice: 1000,
      salePrice: 1100,
      holdingPeriod: 'long',
      annualIncome: 80000,
      filingStatus: 'single',
    });
    expect(result.capitalGain).toBe(100);
    // $80K income → past 0% bracket → gain at 15%
    expect(result.taxOwed).toBe(15);
    expect(result.effectiveRate).toBe(15);
  });

  // ─── Test 11: Zero annual income → gain taxed from bottom ───
  it('taxes gain from bottom brackets when annual income is zero', () => {
    const result = calculateCapitalGainsTax({
      purchasePrice: 0,
      salePrice: 40000,
      holdingPeriod: 'long',
      annualIncome: 0,
      filingStatus: 'single',
    });
    // Taxable ordinary = $0, gain stacks from $0 to $40K
    // LTCG: 0% up to $48,350 → entire $40K at 0%
    expect(result.capitalGain).toBe(40000);
    expect(result.taxOwed).toBe(0);
    expect(result.effectiveRate).toBe(0);
  });

  // ─── Test 12: Verify effective rate calculation ───
  it('calculates effective rate as taxOwed / capitalGain * 100', () => {
    const result = calculateCapitalGainsTax({
      purchasePrice: 50000,
      salePrice: 80000,
      holdingPeriod: 'long',
      annualIncome: 80000,
      filingStatus: 'single',
    });
    const expectedRate = ((result.taxOwed as number) / (result.capitalGain as number)) * 100;
    expect(result.effectiveRate).toBeCloseTo(expectedRate, 1);
  });

  // ─── Test 13: Verify net proceeds = salePrice - taxOwed ───
  it('calculates net proceeds as salePrice minus taxOwed', () => {
    const result = calculateCapitalGainsTax({
      purchasePrice: 50000,
      salePrice: 80000,
      holdingPeriod: 'long',
      annualIncome: 80000,
      filingStatus: 'single',
    });
    expect(result.netProceeds).toBe(80000 - (result.taxOwed as number));
  });

  // ─── Test 14: Summary labels check ───
  it('returns summary with all required labels', () => {
    const result = calculateCapitalGainsTax({
      purchasePrice: 50000,
      salePrice: 80000,
      holdingPeriod: 'long',
      annualIncome: 80000,
      filingStatus: 'single',
    });
    const summary = result.summary as Array<{ label: string; value: number }>;
    const labels = summary.map(s => s.label);
    expect(labels).toContain('Purchase Price (Cost Basis)');
    expect(labels).toContain('Sale Price');
    expect(labels).toContain('Capital Gain');
    expect(labels).toContain('Tax Owed');
    expect(labels).toContain('Effective Tax Rate');
    expect(labels).toContain('Net Proceeds');
  });

  // ─── Test 15: Pie chart data structure ───
  it('returns pie chart data with correct segments', () => {
    const result = calculateCapitalGainsTax({
      purchasePrice: 50000,
      salePrice: 80000,
      holdingPeriod: 'long',
      annualIncome: 80000,
      filingStatus: 'single',
    });
    const pieData = result.taxBreakdown as Array<{ name: string; value: number }>;
    const names = pieData.map(d => d.name);
    expect(names).toContain('Net Proceeds');
    expect(names).toContain('Tax Owed');
    expect(names).toContain('Cost Basis');
  });

  // ─── Test 16: Short-term vs long-term comparison ───
  it('short-term tax is higher than long-term for same gain', () => {
    const longResult = calculateCapitalGainsTax({
      purchasePrice: 50000,
      salePrice: 80000,
      holdingPeriod: 'long',
      annualIncome: 80000,
      filingStatus: 'single',
    });
    const shortResult = calculateCapitalGainsTax({
      purchasePrice: 50000,
      salePrice: 80000,
      holdingPeriod: 'short',
      annualIncome: 80000,
      filingStatus: 'single',
    });
    expect(shortResult.taxOwed).toBeGreaterThan(longResult.taxOwed as number);
    expect(shortResult.effectiveRate).toBeGreaterThan(longResult.effectiveRate as number);
  });
});
