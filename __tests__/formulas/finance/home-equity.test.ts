import { calculateHomeEquity } from '@/lib/formulas/finance/home-equity';

describe('calculateHomeEquity', () => {
  // ─── Test 1: Standard scenario — $400K value, $250K mortgage ───
  it('calculates standard home equity correctly', () => {
    const result = calculateHomeEquity({
      homeValue: 400000,
      mortgageBalance: 250000,
      secondMortgage: 0,
      otherLiens: 0,
      originalPrice: 300000,
      downPaymentOriginal: 60000,
    });
    expect(result.equity).toBe(150000);
    expect(result.equityPercent).toBe(37.5);
    expect(result.ltv).toBe(62.5);
  });

  // ─── Test 2: Fully paid off home ───
  it('calculates 100% equity for paid-off home', () => {
    const result = calculateHomeEquity({
      homeValue: 500000,
      mortgageBalance: 0,
      secondMortgage: 0,
      otherLiens: 0,
      originalPrice: 300000,
      downPaymentOriginal: 300000,
    });
    expect(result.equity).toBe(500000);
    expect(result.equityPercent).toBe(100);
    expect(result.ltv).toBe(0);
    expect(result.borrowableEquity80).toBe(400000); // 500K × 0.80 - 0
    expect(result.borrowableEquity90).toBe(450000);
  });

  // ─── Test 3: Underwater mortgage (negative equity) ───
  it('handles underwater mortgage with negative equity', () => {
    const result = calculateHomeEquity({
      homeValue: 200000,
      mortgageBalance: 250000,
      secondMortgage: 0,
      otherLiens: 0,
      originalPrice: 280000,
      downPaymentOriginal: 30000,
    });
    expect(result.equity).toBe(-50000);
    expect(result.equityPercent).toBe(-25);
    expect(result.ltv).toBe(125);
    expect(result.borrowableEquity80).toBe(0);
    expect(result.borrowableEquity90).toBe(0);
  });

  // ─── Test 4: With HELOC / second mortgage ───
  it('includes second mortgage in debt calculations', () => {
    const result = calculateHomeEquity({
      homeValue: 400000,
      mortgageBalance: 200000,
      secondMortgage: 50000,
      otherLiens: 0,
      originalPrice: 300000,
      downPaymentOriginal: 60000,
    });
    expect(result.equity).toBe(150000); // 400K - 200K - 50K
    expect(result.ltv).toBe(62.5); // (200K + 50K) / 400K
  });

  // ─── Test 5: With other liens ───
  it('includes other liens in debt calculations', () => {
    const result = calculateHomeEquity({
      homeValue: 400000,
      mortgageBalance: 200000,
      secondMortgage: 0,
      otherLiens: 20000,
      originalPrice: 300000,
      downPaymentOriginal: 60000,
    });
    expect(result.equity).toBe(180000); // 400K - 200K - 20K
    expect(result.ltv).toBe(55); // 220K / 400K
  });

  // ─── Test 6: Zero home value ───
  it('handles zero home value gracefully', () => {
    const result = calculateHomeEquity({
      homeValue: 0,
      mortgageBalance: 200000,
      secondMortgage: 0,
      otherLiens: 0,
      originalPrice: 300000,
      downPaymentOriginal: 60000,
    });
    expect(result.equity).toBe(-200000);
    expect(result.equityPercent).toBe(0);
    expect(result.ltv).toBe(0);
    expect(result.borrowableEquity80).toBe(0);
    expect(result.borrowableEquity90).toBe(0);
  });

  // ─── Test 7: High appreciation ───
  it('calculates appreciation correctly', () => {
    const result = calculateHomeEquity({
      homeValue: 600000,
      mortgageBalance: 200000,
      secondMortgage: 0,
      otherLiens: 0,
      originalPrice: 300000,
      downPaymentOriginal: 60000,
    });
    expect(result.appreciation).toBe(300000);
    expect(result.appreciationPercent).toBe(100); // doubled in value
  });

  // ─── Test 8: No appreciation ───
  it('handles zero appreciation', () => {
    const result = calculateHomeEquity({
      homeValue: 300000,
      mortgageBalance: 200000,
      secondMortgage: 0,
      otherLiens: 0,
      originalPrice: 300000,
      downPaymentOriginal: 60000,
    });
    expect(result.appreciation).toBe(0);
    expect(result.appreciationPercent).toBe(0);
  });

  // ─── Test 9: Borrowable equity at 80% LTV ───
  it('calculates borrowable equity at 80% LTV correctly', () => {
    const result = calculateHomeEquity({
      homeValue: 400000,
      mortgageBalance: 250000,
      secondMortgage: 0,
      otherLiens: 0,
      originalPrice: 300000,
      downPaymentOriginal: 60000,
    });
    // 400K × 0.80 = 320K; 320K - 250K = 70K
    expect(result.borrowableEquity80).toBe(70000);
  });

  // ─── Test 10: Borrowable equity at 90% LTV ───
  it('calculates borrowable equity at 90% LTV correctly', () => {
    const result = calculateHomeEquity({
      homeValue: 400000,
      mortgageBalance: 250000,
      secondMortgage: 0,
      otherLiens: 0,
      originalPrice: 300000,
      downPaymentOriginal: 60000,
    });
    // 400K × 0.90 = 360K; 360K - 250K = 110K
    expect(result.borrowableEquity90).toBe(110000);
  });

  // ─── Test 11: LTV accuracy ───
  it('calculates LTV accurately', () => {
    const result = calculateHomeEquity({
      homeValue: 500000,
      mortgageBalance: 375000,
      secondMortgage: 0,
      otherLiens: 0,
      originalPrice: 500000,
      downPaymentOriginal: 125000,
    });
    expect(result.ltv).toBe(75); // 375K / 500K
  });

  // ─── Test 12: CLTV with multiple liens ───
  it('calculates CLTV with multiple liens', () => {
    const result = calculateHomeEquity({
      homeValue: 500000,
      mortgageBalance: 300000,
      secondMortgage: 50000,
      otherLiens: 10000,
      originalPrice: 400000,
      downPaymentOriginal: 80000,
    });
    // CLTV = (300K + 50K + 10K) / 500K = 72%
    expect(result.cltv).toBe(72);
  });

  // ─── Test 13: Equity percentage ───
  it('calculates equity percentage correctly', () => {
    const result = calculateHomeEquity({
      homeValue: 400000,
      mortgageBalance: 100000,
      secondMortgage: 0,
      otherLiens: 0,
      originalPrice: 300000,
      downPaymentOriginal: 60000,
    });
    expect(result.equityPercent).toBe(75); // 300K / 400K
  });

  // ─── Test 14: Return on equity ───
  it('calculates return on equity correctly', () => {
    const result = calculateHomeEquity({
      homeValue: 400000,
      mortgageBalance: 250000,
      secondMortgage: 0,
      otherLiens: 0,
      originalPrice: 300000,
      downPaymentOriginal: 60000,
    });
    // Equity = 150K, ROE = (150K - 60K) / 60K × 100 = 150%
    expect(result.returnOnEquity).toBe(150);
  });

  // ─── Test 15: New purchase (no appreciation, just bought) ───
  it('handles new purchase with no principal paid', () => {
    const result = calculateHomeEquity({
      homeValue: 350000,
      mortgageBalance: 280000,
      secondMortgage: 0,
      otherLiens: 0,
      originalPrice: 350000,
      downPaymentOriginal: 70000,
    });
    expect(result.equity).toBe(70000);
    expect(result.appreciation).toBe(0);
    // Principal paid = (350K - 70K) - 280K = 0
    expect(result.totalInvested).toBe(70000);
  });

  // ─── Test 16: Appreciation percent ───
  it('calculates appreciation percent from original price', () => {
    const result = calculateHomeEquity({
      homeValue: 450000,
      mortgageBalance: 200000,
      secondMortgage: 0,
      otherLiens: 0,
      originalPrice: 300000,
      downPaymentOriginal: 60000,
    });
    // (450K - 300K) / 300K × 100 = 50%
    expect(result.appreciationPercent).toBe(50);
  });

  // ─── Test 17: Equity breakdown structure ───
  it('returns equityBreakdown with correct structure', () => {
    const result = calculateHomeEquity({
      homeValue: 400000,
      mortgageBalance: 250000,
      secondMortgage: 0,
      otherLiens: 0,
      originalPrice: 300000,
      downPaymentOriginal: 60000,
    });
    const breakdown = result.equityBreakdown as Array<{ label: string; value: number }>;
    expect(breakdown).toHaveLength(4);
    expect(breakdown[0]).toEqual({ label: 'Home Value', value: 400000 });
    expect(breakdown[1]).toEqual({ label: 'Total Debt', value: 250000 });
    expect(breakdown[2]).toEqual({ label: 'Net Equity', value: 150000 });
    expect(breakdown[3]).toEqual({ label: 'Equity %', value: 37.5 });
  });

  // ─── Test 18: Output structure validation ───
  it('returns all expected output keys', () => {
    const result = calculateHomeEquity({
      homeValue: 400000,
      mortgageBalance: 250000,
      secondMortgage: 0,
      otherLiens: 0,
      originalPrice: 300000,
      downPaymentOriginal: 60000,
    });
    expect(result).toHaveProperty('equity');
    expect(result).toHaveProperty('equityPercent');
    expect(result).toHaveProperty('ltv');
    expect(result).toHaveProperty('cltv');
    expect(result).toHaveProperty('borrowableEquity80');
    expect(result).toHaveProperty('borrowableEquity90');
    expect(result).toHaveProperty('appreciation');
    expect(result).toHaveProperty('appreciationPercent');
    expect(result).toHaveProperty('totalInvested');
    expect(result).toHaveProperty('returnOnEquity');
    expect(result).toHaveProperty('equityBreakdown');
  });

  // ─── Test 19: Total invested calculation ───
  it('calculates total invested (down payment + principal paid)', () => {
    const result = calculateHomeEquity({
      homeValue: 400000,
      mortgageBalance: 200000,
      secondMortgage: 0,
      otherLiens: 0,
      originalPrice: 300000,
      downPaymentOriginal: 60000,
    });
    // Original loan = 300K - 60K = 240K
    // Principal paid = 240K - 200K = 40K
    // Total invested = 60K + 40K = 100K
    expect(result.totalInvested).toBe(100000);
  });

  // ─── Test 20: Zero down payment ───
  it('handles zero down payment (returnOnEquity = 0)', () => {
    const result = calculateHomeEquity({
      homeValue: 300000,
      mortgageBalance: 280000,
      secondMortgage: 0,
      otherLiens: 0,
      originalPrice: 300000,
      downPaymentOriginal: 0,
    });
    expect(result.returnOnEquity).toBe(0);
    expect(result.equity).toBe(20000);
  });
});
