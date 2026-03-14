import { calculateShopifyFee } from '@/lib/formulas/ecommerce/shopify-fee';

describe('calculateShopifyFee', () => {
  const base = {
    shopifyPlan: 'basic',
    monthlyRevenue: 25000,
    averageOrderValue: 65,
    paymentMethod: 'shopify-payments',
    internationalRevenuePct: 10,
  };

  it('includes $39 subscription for basic plan', () => {
    const result = calculateShopifyFee(base);
    const summary = result.summary as { label: string; value: number }[];
    const subRow = summary.find((r) => r.label === 'Subscription Fee');
    expect(subRow?.value).toBe(39);
  });

  it('total monthly cost is greater than subscription alone', () => {
    const result = calculateShopifyFee(base);
    expect(result.totalMonthlyCost).toBeGreaterThan(39);
  });

  it('effective fee rate is positive', () => {
    const result = calculateShopifyFee(base);
    expect(result.effectiveFeeRate).toBeGreaterThan(0);
  });

  it('effective fee rate is less than 20%', () => {
    const result = calculateShopifyFee(base);
    expect(result.effectiveFeeRate).toBeLessThan(20);
  });

  it('generates comparison table with 4 rows (all plans)', () => {
    const result = calculateShopifyFee(base);
    expect((result.planComparisonTable as unknown[]).length).toBe(4);
  });

  it('Plus plan has highest subscription fee', () => {
    const result = calculateShopifyFee(base);
    const table = result.planComparisonTable as { plan: string; subscription: number }[];
    const plus = table.find((r) => r.plan === 'Plus');
    expect(plus?.subscription).toBe(2300);
  });

  it('third-party payment adds transaction fee', () => {
    const sp = calculateShopifyFee(base); // Shopify Payments
    const tp = calculateShopifyFee({ ...base, paymentMethod: 'third-party' }); // third-party
    // Third-party: no processing fee from Shopify, but adds 2% transaction fee on $25k = $500
    const spSummary = sp.summary as { label: string; value: number }[];
    const tpSummary = tp.summary as { label: string; value: number }[];
    const spTx = spSummary.find((r) => r.label === 'Transaction Fees')?.value ?? 0;
    const tpTx = tpSummary.find((r) => r.label === 'Transaction Fees')?.value ?? 0;
    expect(tpTx).toBeGreaterThan(spTx);
  });

  it('higher revenue increases total cost', () => {
    const low = calculateShopifyFee({ ...base, monthlyRevenue: 5000 });
    const high = calculateShopifyFee({ ...base, monthlyRevenue: 100000 });
    expect(high.totalMonthlyCost).toBeGreaterThan(low.totalMonthlyCost as number);
  });

  it('advanced plan has lower effective rate than basic at high revenue', () => {
    const basic = calculateShopifyFee({ ...base, shopifyPlan: 'basic', monthlyRevenue: 200000 });
    const advanced = calculateShopifyFee({ ...base, shopifyPlan: 'advanced', monthlyRevenue: 200000 });
    expect(advanced.effectiveFeeRate).toBeLessThan(basic.effectiveFeeRate as number);
  });

  it('zero international revenue has zero currency conversion fees', () => {
    const result = calculateShopifyFee({ ...base, internationalRevenuePct: 0 });
    const summary = result.summary as { label: string; value: number }[];
    const ccRow = summary.find((r) => r.label === 'Currency Conversion');
    expect(ccRow?.value).toBe(0);
  });

  it('higher international revenue increases total cost', () => {
    const low = calculateShopifyFee({ ...base, internationalRevenuePct: 0 });
    const high = calculateShopifyFee({ ...base, internationalRevenuePct: 50 });
    expect(high.totalMonthlyCost).toBeGreaterThan(low.totalMonthlyCost as number);
  });

  it('summary has 7 entries', () => {
    const result = calculateShopifyFee(base);
    expect((result.summary as unknown[]).length).toBe(7);
  });
});
