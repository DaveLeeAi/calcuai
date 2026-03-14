import { calculateROAS } from '@/lib/formulas/ecommerce/return-on-ad-spend';

describe('calculateROAS', () => {
  it('calculates ROAS of 4 from $5k spend and $20k revenue', () => {
    const result = calculateROAS({ adSpend: 5000, adRevenue: 20000, grossMarginPercent: 50, additionalCostsPercent: 3 });
    expect(result.roas).toBeCloseTo(4, 2);
  });

  it('calculates break-even ROAS = 1 / net margin', () => {
    // margin = 50%, fees = 0% → break-even ROAS = 1/0.5 = 2.0
    const result = calculateROAS({ adSpend: 5000, adRevenue: 20000, grossMarginPercent: 50, additionalCostsPercent: 0 });
    expect(result.breakEvenROAS).toBeCloseTo(2.0, 2);
  });

  it('break-even ROAS accounts for platform fees', () => {
    // margin = 50%, fees = 10% → net = 40% → break-even ROAS = 1/0.4 = 2.5
    const result = calculateROAS({ adSpend: 1000, adRevenue: 5000, grossMarginPercent: 50, additionalCostsPercent: 10 });
    expect(result.breakEvenROAS).toBeCloseTo(2.5, 2);
  });

  it('calculates net profit correctly', () => {
    // revenue=$20k, margin=50%, fees=0%, spend=$5k → profit = 20k×0.5 − 5k = $5k
    const result = calculateROAS({ adSpend: 5000, adRevenue: 20000, grossMarginPercent: 50, additionalCostsPercent: 0 });
    expect(result.netProfitFromAds).toBeCloseTo(5000, 0);
  });

  it('net profit is negative when ROAS is below break-even', () => {
    const result = calculateROAS({ adSpend: 5000, adRevenue: 6000, grossMarginPercent: 50, additionalCostsPercent: 0 });
    expect(result.netProfitFromAds).toBeLessThan(0);
  });

  it('net profit is positive when ROAS exceeds break-even', () => {
    const result = calculateROAS({ adSpend: 1000, adRevenue: 10000, grossMarginPercent: 50, additionalCostsPercent: 0 });
    expect(result.netProfitFromAds).toBeGreaterThan(0);
  });

  it('generates scenario table with 4 rows', () => {
    const result = calculateROAS({ adSpend: 5000, adRevenue: 20000, grossMarginPercent: 50, additionalCostsPercent: 3 });
    expect((result.roasScenarioTable as unknown[]).length).toBe(4);
  });

  it('scenario table has break-even scenario', () => {
    const result = calculateROAS({ adSpend: 5000, adRevenue: 20000, grossMarginPercent: 50, additionalCostsPercent: 0 });
    const table = result.roasScenarioTable as { scenario: string; netProfit: number }[];
    const be = table.find((r) => r.scenario === 'Break-Even');
    expect(be).toBeDefined();
    expect(be!.netProfit).toBeCloseTo(0, 0);
  });

  it('ROAS of 1 means revenue equals spend', () => {
    const result = calculateROAS({ adSpend: 10000, adRevenue: 10000, grossMarginPercent: 60, additionalCostsPercent: 0 });
    expect(result.roas).toBeCloseTo(1, 2);
  });

  it('summary contains 6 entries', () => {
    const result = calculateROAS({ adSpend: 5000, adRevenue: 20000, grossMarginPercent: 50, additionalCostsPercent: 3 });
    expect((result.summary as unknown[]).length).toBe(6);
  });

  it('uses defaults for missing inputs', () => {
    const result = calculateROAS({ adSpend: 1000, adRevenue: 4000 });
    expect(result.roas).toBeCloseTo(4, 2);
  });
});
