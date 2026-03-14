import { calculatePrintOnDemandProfit } from '@/lib/formulas/ecommerce/print-on-demand-profit';

describe('calculatePrintOnDemandProfit', () => {
  const base = {
    sellingPrice: 34.99,
    podCost: 14,
    shippingCost: 4.5,
    platform: 'etsy',
    customPlatformRate: 9.5,
    adSpendPerOrder: 0,
    monthlyOrders: 60,
  };

  it('net profit is positive for typical Etsy POD sale', () => {
    const result = calculatePrintOnDemandProfit(base);
    expect(result.netProfitPerOrder).toBeGreaterThan(0);
  });

  it('Shopify Payments has lower fees than Etsy', () => {
    const etsy = calculatePrintOnDemandProfit(base);
    const shopify = calculatePrintOnDemandProfit({ ...base, platform: 'shopify-payments' });
    expect(shopify.netProfitPerOrder).toBeGreaterThan(etsy.netProfitPerOrder as number);
  });

  it('royalty model (Amazon Merch) returns less revenue at low royalty %', () => {
    // At 20% royalty, seller gets 20% of selling price; rest is Amazon's
    const result = calculatePrintOnDemandProfit({
      ...base,
      platform: 'amazon-merch',
      customPlatformRate: 20,
      shippingCost: 0,
    });
    // royaltyAmount = 34.99 × 0.20 = 6.998; netProfit = 6.998 - 14 - 0 = negative
    expect(result.netProfitPerOrder).toBeLessThan(0);
  });

  it('royalty model at high % returns positive profit', () => {
    // At 60% royalty on $34.99 = $20.99; minus $14 POD cost = $6.99
    const result = calculatePrintOnDemandProfit({
      ...base,
      platform: 'amazon-merch',
      customPlatformRate: 60,
      shippingCost: 0,
    });
    expect(result.netProfitPerOrder).toBeGreaterThan(0);
  });

  it('ad spend reduces net profit', () => {
    const noAds = calculatePrintOnDemandProfit(base);
    const withAds = calculatePrintOnDemandProfit({ ...base, adSpendPerOrder: 5 });
    expect(withAds.netProfitPerOrder).toBeLessThan(noAds.netProfitPerOrder as number);
  });

  it('profit margin is between 0 and 100 for profitable item', () => {
    const result = calculatePrintOnDemandProfit(base);
    expect(result.profitMargin).toBeGreaterThan(0);
    expect(result.profitMargin).toBeLessThan(100);
  });

  it('monthly profit equals per-order profit × orders', () => {
    const result = calculatePrintOnDemandProfit({ ...base, monthlyOrders: 50 });
    expect(result.monthlyProfit).toBeCloseTo((result.netProfitPerOrder as number) * 50, 1);
  });

  it('cost breakdown table has 5 rows', () => {
    const result = calculatePrintOnDemandProfit(base);
    expect((result.costBreakdownTable as unknown[]).length).toBe(5);
  });

  it('summary has 6 entries', () => {
    const result = calculatePrintOnDemandProfit(base);
    expect((result.summary as unknown[]).length).toBe(6);
  });

  it('higher POD cost reduces profit', () => {
    const low = calculatePrintOnDemandProfit({ ...base, podCost: 10 });
    const high = calculatePrintOnDemandProfit({ ...base, podCost: 20 });
    expect(high.netProfitPerOrder).toBeLessThan(low.netProfitPerOrder as number);
  });

  it('custom platform with 0% fee gives maximum profit', () => {
    const result = calculatePrintOnDemandProfit({
      ...base,
      platform: 'custom',
      customPlatformRate: 0,
    });
    const expected = 34.99 - 14 - 4.5 - 0 - 0;
    expect(result.netProfitPerOrder).toBeCloseTo(expected, 1);
  });
});
