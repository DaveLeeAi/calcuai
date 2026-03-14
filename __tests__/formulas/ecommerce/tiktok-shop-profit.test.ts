import { calculateTikTokShopProfit } from '@/lib/formulas/ecommerce/tiktok-shop-profit';

describe('calculateTikTokShopProfit', () => {
  const base = {
    sellingPrice: 29.99,
    productCost: 8,
    productCategory: 'beauty',
    affiliateCommission: 10,
    shippingCost: 4,
    monthlyOrders: 200,
  };

  it('deducts 8% platform commission for beauty', () => {
    const result = calculateTikTokShopProfit(base);
    const table = result.feeBreakdownTable as { item: string; amount: number }[];
    const commRow = table.find((r) => r.item === 'Platform Commission');
    expect(commRow?.amount).toBeCloseTo(29.99 * 0.08, 1);
  });

  it('electronics uses 5% commission rate', () => {
    const result = calculateTikTokShopProfit({ ...base, productCategory: 'electronics' });
    const table = result.feeBreakdownTable as { item: string; amount: number }[];
    const commRow = table.find((r) => r.item === 'Platform Commission');
    expect(commRow?.amount).toBeCloseTo(29.99 * 0.05, 1);
  });

  it('deducts 10% affiliate commission', () => {
    const result = calculateTikTokShopProfit(base);
    const table = result.feeBreakdownTable as { item: string; amount: number }[];
    const affRow = table.find((r) => r.item === 'Affiliate Commission');
    expect(affRow?.amount).toBeCloseTo(29.99 * 0.10, 1);
  });

  it('deducts 3% transaction fee', () => {
    const result = calculateTikTokShopProfit(base);
    const table = result.feeBreakdownTable as { item: string; amount: number }[];
    const txRow = table.find((r) => r.item === 'Transaction Fee (3%)');
    expect(txRow?.amount).toBeCloseTo(29.99 * 0.03, 2);
  });

  it('no small order fee when price >= $10', () => {
    const result = calculateTikTokShopProfit(base); // $29.99 >= $10
    const table = result.feeBreakdownTable as { item: string; amount: number }[];
    const smallRow = table.find((r) => r.item === 'Small Order Fee');
    expect(smallRow?.amount).toBe(0);
  });

  it('applies $2 small order fee when price < $10', () => {
    const result = calculateTikTokShopProfit({ ...base, sellingPrice: 7.99 });
    const table = result.feeBreakdownTable as { item: string; amount: number }[];
    const smallRow = table.find((r) => r.item === 'Small Order Fee');
    expect(smallRow?.amount).toBe(2.00);
  });

  it('monthly profit = net profit × monthly orders', () => {
    const result = calculateTikTokShopProfit(base);
    const net = result.netProfitPerOrder as number;
    const monthly = result.monthlyProfit as number;
    expect(monthly).toBeCloseTo(net * base.monthlyOrders, 1);
  });

  it('profit margin is between 0 and 100 for reasonable inputs', () => {
    const result = calculateTikTokShopProfit(base);
    expect(result.profitMargin).toBeGreaterThan(0);
    expect(result.profitMargin).toBeLessThan(100);
  });

  it('zero affiliate commission reduces total deductions', () => {
    const withAff = calculateTikTokShopProfit(base);
    const noAff = calculateTikTokShopProfit({ ...base, affiliateCommission: 0 });
    expect(noAff.netProfitPerOrder).toBeGreaterThan(withAff.netProfitPerOrder as number);
  });

  it('fee breakdown table has 7 rows', () => {
    const result = calculateTikTokShopProfit(base);
    expect((result.feeBreakdownTable as unknown[]).length).toBe(7);
  });

  it('summary has 7 entries', () => {
    const result = calculateTikTokShopProfit(base);
    expect((result.summary as unknown[]).length).toBe(7);
  });

  it('very high product cost produces negative profit', () => {
    const result = calculateTikTokShopProfit({ ...base, productCost: 29 });
    expect(result.netProfitPerOrder).toBeLessThan(0);
  });
});
