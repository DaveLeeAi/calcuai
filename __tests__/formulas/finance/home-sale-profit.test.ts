import { calculateHomeSaleProfit } from '@/lib/formulas/finance/home-sale-profit';

describe('calculateHomeSaleProfit', () => {
  // ─── Test 1: Default values produce reasonable net proceeds ───
  it('calculates net proceeds with default values', () => {
    const result = calculateHomeSaleProfit({
      salePrice: 400000,
      purchasePrice: 300000,
      mortgageBalance: 220000,
      agentCommissionRate: 5,
      closingCostRate: 2,
      improvementsCost: 15000,
      yearsOwned: 7,
      filingStatus: 'single',
    });
    // Commission: 400K × 5% = 20K
    // Closing: 400K × 2% = 8K
    // Capital gain: 400K - 300K - 15K = 85K → under $250K exclusion → $0 tax
    // Net: 400K - 20K - 8K - 220K - 0 = 152K
    expect(result.netProceeds).toBe(152000);
    expect(result.agentCommission).toBe(20000);
    expect(result.closingCosts).toBe(8000);
    expect(result.estimatedTax).toBe(0);
  });

  // ─── Test 2: No mortgage balance (paid off home) ───
  it('calculates for a paid-off home with zero mortgage', () => {
    const result = calculateHomeSaleProfit({
      salePrice: 400000,
      purchasePrice: 300000,
      mortgageBalance: 0,
      agentCommissionRate: 5,
      closingCostRate: 2,
      improvementsCost: 0,
      yearsOwned: 10,
      filingStatus: 'single',
    });
    // Commission: 20K, Closing: 8K, Gain: 100K (under 250K exclusion), Tax: 0
    // Net: 400K - 20K - 8K - 0 - 0 = 372K
    expect(result.netProceeds).toBe(372000);
    expect(result.grossProfit).toBe(100000);
  });

  // ─── Test 3: Short ownership (<2 years) — no Section 121 exclusion ───
  it('applies no exclusion when owned less than 2 years', () => {
    const result = calculateHomeSaleProfit({
      salePrice: 400000,
      purchasePrice: 300000,
      mortgageBalance: 220000,
      agentCommissionRate: 5,
      closingCostRate: 2,
      improvementsCost: 0,
      yearsOwned: 1.5,
      filingStatus: 'single',
    });
    // Capital gain: 400K - 300K = 100K, no exclusion
    // yearsOwned >= 1, so long-term rate 15%
    // Tax: 100K × 0.15 = 15K
    expect(result.capitalGainExclusion).toBe(0);
    expect(result.taxableGain).toBe(100000);
    expect(result.estimatedTax).toBe(15000);
  });

  // ─── Test 4: Single filer $250K exclusion ───
  it('applies $250K exclusion for single filer owned 2+ years', () => {
    const result = calculateHomeSaleProfit({
      salePrice: 600000,
      purchasePrice: 300000,
      mortgageBalance: 200000,
      agentCommissionRate: 5,
      closingCostRate: 2,
      improvementsCost: 0,
      yearsOwned: 5,
      filingStatus: 'single',
    });
    // Capital gain: 600K - 300K = 300K
    // Exclusion: 250K → Taxable: 50K
    // Tax: 50K × 0.15 = 7,500
    expect(result.capitalGain).toBe(300000);
    expect(result.capitalGainExclusion).toBe(250000);
    expect(result.taxableGain).toBe(50000);
    expect(result.estimatedTax).toBe(7500);
  });

  // ─── Test 5: Married filer $500K exclusion ───
  it('applies $500K exclusion for married filer owned 2+ years', () => {
    const result = calculateHomeSaleProfit({
      salePrice: 600000,
      purchasePrice: 300000,
      mortgageBalance: 200000,
      agentCommissionRate: 5,
      closingCostRate: 2,
      improvementsCost: 0,
      yearsOwned: 5,
      filingStatus: 'married',
    });
    // Capital gain: 300K, under $500K exclusion → $0 tax
    expect(result.capitalGainExclusion).toBe(500000);
    expect(result.taxableGain).toBe(0);
    expect(result.estimatedTax).toBe(0);
  });

  // ─── Test 6: Large gain exceeding exclusion ───
  it('taxes gain exceeding married exclusion', () => {
    const result = calculateHomeSaleProfit({
      salePrice: 1200000,
      purchasePrice: 400000,
      mortgageBalance: 300000,
      agentCommissionRate: 5,
      closingCostRate: 2,
      improvementsCost: 50000,
      yearsOwned: 10,
      filingStatus: 'married',
    });
    // Cost basis: 400K + 50K = 450K
    // Capital gain: 1.2M - 450K = 750K
    // Exclusion: 500K → Taxable: 250K
    // Tax: 250K × 0.15 = 37,500
    expect(result.capitalGain).toBe(750000);
    expect(result.taxableGain).toBe(250000);
    expect(result.estimatedTax).toBe(37500);
  });

  // ─── Test 7: No gain (sale at purchase price) ───
  it('handles sale at purchase price with no gain', () => {
    const result = calculateHomeSaleProfit({
      salePrice: 300000,
      purchasePrice: 300000,
      mortgageBalance: 200000,
      agentCommissionRate: 5,
      closingCostRate: 2,
      improvementsCost: 0,
      yearsOwned: 5,
      filingStatus: 'single',
    });
    expect(result.capitalGain).toBe(0);
    expect(result.taxableGain).toBe(0);
    expect(result.estimatedTax).toBe(0);
    expect(result.grossProfit).toBe(0);
  });

  // ─── Test 8: Loss on sale (sale below purchase) ───
  it('handles loss on sale with no tax', () => {
    const result = calculateHomeSaleProfit({
      salePrice: 250000,
      purchasePrice: 300000,
      mortgageBalance: 200000,
      agentCommissionRate: 5,
      closingCostRate: 2,
      improvementsCost: 0,
      yearsOwned: 5,
      filingStatus: 'single',
    });
    expect(result.capitalGain).toBe(-50000);
    expect(result.taxableGain).toBe(0);
    expect(result.estimatedTax).toBe(0);
    expect(result.grossProfit).toBe(-50000);
  });

  // ─── Test 9: Zero agent commission ───
  it('handles zero agent commission', () => {
    const result = calculateHomeSaleProfit({
      salePrice: 400000,
      purchasePrice: 300000,
      mortgageBalance: 220000,
      agentCommissionRate: 0,
      closingCostRate: 2,
      improvementsCost: 0,
      yearsOwned: 5,
      filingStatus: 'single',
    });
    expect(result.agentCommission).toBe(0);
    // Net: 400K - 0 - 8K - 220K - 0 = 172K
    expect(result.netProceeds).toBe(172000);
  });

  // ─── Test 10: High commission rate (6%) ───
  it('calculates with high commission rate', () => {
    const result = calculateHomeSaleProfit({
      salePrice: 400000,
      purchasePrice: 300000,
      mortgageBalance: 220000,
      agentCommissionRate: 6,
      closingCostRate: 2,
      improvementsCost: 0,
      yearsOwned: 5,
      filingStatus: 'single',
    });
    // Commission: 400K × 6% = 24K
    expect(result.agentCommission).toBe(24000);
  });

  // ─── Test 11: Zero closing costs ───
  it('handles zero closing costs', () => {
    const result = calculateHomeSaleProfit({
      salePrice: 400000,
      purchasePrice: 300000,
      mortgageBalance: 220000,
      agentCommissionRate: 5,
      closingCostRate: 0,
      improvementsCost: 0,
      yearsOwned: 5,
      filingStatus: 'single',
    });
    expect(result.closingCosts).toBe(0);
  });

  // ─── Test 12: No improvements ───
  it('handles zero improvements', () => {
    const result = calculateHomeSaleProfit({
      salePrice: 400000,
      purchasePrice: 300000,
      mortgageBalance: 220000,
      agentCommissionRate: 5,
      closingCostRate: 2,
      improvementsCost: 0,
      yearsOwned: 5,
      filingStatus: 'single',
    });
    // Capital gain: 400K - 300K - 0 = 100K (under exclusion)
    expect(result.capitalGain).toBe(100000);
    expect(result.taxableGain).toBe(0);
  });

  // ─── Test 13: Large improvements reduce capital gain ───
  it('reduces capital gain by improvements cost', () => {
    const result = calculateHomeSaleProfit({
      salePrice: 500000,
      purchasePrice: 300000,
      mortgageBalance: 200000,
      agentCommissionRate: 5,
      closingCostRate: 2,
      improvementsCost: 100000,
      yearsOwned: 5,
      filingStatus: 'single',
    });
    // Cost basis: 300K + 100K = 400K
    // Capital gain: 500K - 400K = 100K (under exclusion)
    expect(result.capitalGain).toBe(100000);
    expect(result.taxableGain).toBe(0);
  });

  // ─── Test 14: Very expensive home ($2M) ───
  it('handles expensive property correctly', () => {
    const result = calculateHomeSaleProfit({
      salePrice: 2000000,
      purchasePrice: 1000000,
      mortgageBalance: 800000,
      agentCommissionRate: 5,
      closingCostRate: 2,
      improvementsCost: 100000,
      yearsOwned: 8,
      filingStatus: 'married',
    });
    // Commission: 2M × 5% = 100K
    // Closing: 2M × 2% = 40K
    // Capital gain: 2M - 1M - 100K = 900K
    // Married exclusion: 500K → Taxable: 400K
    // Tax: 400K × 0.15 = 60K
    // Net: 2M - 100K - 40K - 800K - 60K = 1,000,000
    expect(result.agentCommission).toBe(100000);
    expect(result.closingCosts).toBe(40000);
    expect(result.capitalGain).toBe(900000);
    expect(result.taxableGain).toBe(400000);
    expect(result.estimatedTax).toBe(60000);
    expect(result.netProceeds).toBe(1000000);
  });

  // ─── Test 15: Recently purchased (0 years) — short-term rate ───
  it('applies short-term tax rate for 0 years ownership', () => {
    const result = calculateHomeSaleProfit({
      salePrice: 400000,
      purchasePrice: 350000,
      mortgageBalance: 300000,
      agentCommissionRate: 5,
      closingCostRate: 2,
      improvementsCost: 0,
      yearsOwned: 0,
      filingStatus: 'single',
    });
    // Capital gain: 400K - 350K = 50K, no exclusion (0 years)
    // Short-term rate: 22%
    // Tax: 50K × 0.22 = 11,000
    expect(result.capitalGainExclusion).toBe(0);
    expect(result.taxableGain).toBe(50000);
    expect(result.estimatedTax).toBe(11000);
  });

  // ─── Test 16: Long ownership (30 years) ───
  it('handles very long ownership period', () => {
    const result = calculateHomeSaleProfit({
      salePrice: 800000,
      purchasePrice: 150000,
      mortgageBalance: 0,
      agentCommissionRate: 5,
      closingCostRate: 2,
      improvementsCost: 50000,
      yearsOwned: 30,
      filingStatus: 'married',
    });
    // Capital gain: 800K - 150K - 50K = 600K
    // Married exclusion: 500K → Taxable: 100K
    // Tax: 100K × 0.15 = 15K
    expect(result.capitalGain).toBe(600000);
    expect(result.taxableGain).toBe(100000);
    expect(result.estimatedTax).toBe(15000);
  });

  // ─── Test 17: Net proceeds = sale minus all deductions ───
  it('net proceeds equals sale price minus all deductions', () => {
    const result = calculateHomeSaleProfit({
      salePrice: 500000,
      purchasePrice: 300000,
      mortgageBalance: 200000,
      agentCommissionRate: 6,
      closingCostRate: 3,
      improvementsCost: 0,
      yearsOwned: 1.5,
      filingStatus: 'single',
    });
    // Commission: 30K, Closing: 15K, Gain: 200K, no exclusion, Tax: 200K × 0.15 = 30K
    // Net: 500K - 30K - 15K - 200K - 30K = 225K
    const commission = result.agentCommission as number;
    const closing = result.closingCosts as number;
    const mortgage = 200000;
    const tax = result.estimatedTax as number;
    expect(result.netProceeds).toBe(500000 - commission - closing - mortgage - tax);
  });

  // ─── Test 18: Capital gain = sale price - purchase price - improvements ───
  it('capital gain equals sale price minus cost basis', () => {
    const result = calculateHomeSaleProfit({
      salePrice: 450000,
      purchasePrice: 300000,
      mortgageBalance: 200000,
      agentCommissionRate: 5,
      closingCostRate: 2,
      improvementsCost: 25000,
      yearsOwned: 5,
      filingStatus: 'single',
    });
    // Capital gain = 450K - 300K - 25K = 125K
    expect(result.capitalGain).toBe(125000);
  });

  // ─── Test 19: Output structure has all expected keys ───
  it('returns all expected output keys', () => {
    const result = calculateHomeSaleProfit({
      salePrice: 400000,
      purchasePrice: 300000,
      mortgageBalance: 220000,
      agentCommissionRate: 5,
      closingCostRate: 2,
      improvementsCost: 15000,
      yearsOwned: 7,
      filingStatus: 'single',
    });
    expect(result).toHaveProperty('netProceeds');
    expect(result).toHaveProperty('grossProfit');
    expect(result).toHaveProperty('agentCommission');
    expect(result).toHaveProperty('closingCosts');
    expect(result).toHaveProperty('capitalGain');
    expect(result).toHaveProperty('capitalGainExclusion');
    expect(result).toHaveProperty('taxableGain');
    expect(result).toHaveProperty('estimatedTax');
    expect(result).toHaveProperty('costBreakdown');
  });

  // ─── Test 20: Cost breakdown array is present and correct ───
  it('returns cost breakdown with correct structure', () => {
    const result = calculateHomeSaleProfit({
      salePrice: 400000,
      purchasePrice: 300000,
      mortgageBalance: 220000,
      agentCommissionRate: 5,
      closingCostRate: 2,
      improvementsCost: 0,
      yearsOwned: 5,
      filingStatus: 'single',
    });
    const breakdown = result.costBreakdown as Array<{ label: string; value: number }>;
    expect(breakdown).toHaveLength(5);
    expect(breakdown[0]).toEqual({ label: 'Agent Commission', value: 20000 });
    expect(breakdown[1]).toEqual({ label: 'Closing Costs', value: 8000 });
    expect(breakdown[2]).toEqual({ label: 'Mortgage Payoff', value: 220000 });
    expect(breakdown[3]).toEqual({ label: 'Estimated Tax', value: 0 });
    expect(breakdown[4]).toEqual({ label: 'Total Deductions', value: 248000 });
  });

  // ─── Test 21: Zero sale price returns appropriate values ───
  it('handles zero sale price gracefully', () => {
    const result = calculateHomeSaleProfit({
      salePrice: 0,
      purchasePrice: 300000,
      mortgageBalance: 220000,
      agentCommissionRate: 5,
      closingCostRate: 2,
      improvementsCost: 0,
      yearsOwned: 5,
      filingStatus: 'single',
    });
    expect(result.agentCommission).toBe(0);
    expect(result.closingCosts).toBe(0);
    expect(result.capitalGain).toBe(-300000);
    expect(result.taxableGain).toBe(0);
    expect(result.estimatedTax).toBe(0);
    expect(result.netProceeds).toBe(-220000); // owes mortgage payoff
  });

  // ─── Test 22: Ownership exactly 2 years gets exclusion ───
  it('applies exclusion at exactly 2 years ownership', () => {
    const result = calculateHomeSaleProfit({
      salePrice: 400000,
      purchasePrice: 300000,
      mortgageBalance: 200000,
      agentCommissionRate: 5,
      closingCostRate: 2,
      improvementsCost: 0,
      yearsOwned: 2,
      filingStatus: 'single',
    });
    expect(result.capitalGainExclusion).toBe(250000);
    expect(result.taxableGain).toBe(0);
    expect(result.estimatedTax).toBe(0);
  });

  // ─── Test 23: Ownership 0.5 years — short-term rate ───
  it('applies short-term rate for less than 1 year', () => {
    const result = calculateHomeSaleProfit({
      salePrice: 350000,
      purchasePrice: 300000,
      mortgageBalance: 250000,
      agentCommissionRate: 5,
      closingCostRate: 2,
      improvementsCost: 0,
      yearsOwned: 0.5,
      filingStatus: 'single',
    });
    // Gain: 50K, no exclusion, short-term: 22%
    // Tax: 50K × 0.22 = 11,000
    expect(result.estimatedTax).toBe(11000);
  });

  // ─── Test 24: Improvements exceeding gain eliminate tax ───
  it('improvements exceeding appreciation eliminate taxable gain', () => {
    const result = calculateHomeSaleProfit({
      salePrice: 400000,
      purchasePrice: 300000,
      mortgageBalance: 200000,
      agentCommissionRate: 5,
      closingCostRate: 2,
      improvementsCost: 120000,
      yearsOwned: 1.5,
      filingStatus: 'single',
    });
    // Cost basis: 300K + 120K = 420K
    // Capital gain: 400K - 420K = -20K (loss)
    expect(result.capitalGain).toBe(-20000);
    expect(result.taxableGain).toBe(0);
    expect(result.estimatedTax).toBe(0);
  });
});
