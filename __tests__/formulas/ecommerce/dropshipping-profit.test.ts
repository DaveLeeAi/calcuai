import { calculateDropshippingProfit } from '@/lib/formulas/ecommerce/dropshipping-profit';

describe('calculateDropshippingProfit', () => {
  const base = {
    sellingPrice: 39.99,
    supplierCost: 12,
    shippingCost: 3.5,
    platformType: 'shopify-payments',
    customPlatformRate: 5,
    adSpendPerOrder: 5,
    monthlyOrders: 100,
  };

  it('net profit is positive for typical dropship product', () => {
    const result = calculateDropshippingProfit(base);
    expect(result.netProfitPerOrder).toBeGreaterThan(0);
  });

  it('Shopify Payments fee = 2.9% + $0.30', () => {
    const result = calculateDropshippingProfit({ ...base, adSpendPerOrder: 0 });
    const expectedFee = 39.99 * 0.029 + 0.30;
    const expectedProfit = 39.99 - 12 - 3.5 - expectedFee;
    expect(result.netProfitPerOrder).toBeCloseTo(expectedProfit, 1);
  });

  it('Amazon platform uses 15% referral rate', () => {
    const shopify = calculateDropshippingProfit({ ...base, platformType: 'shopify-payments' });
    const amazon = calculateDropshippingProfit({ ...base, platformType: 'amazon' });
    // Amazon takes 15% vs Shopify's ~3.1% → Amazon has lower profit
    expect(amazon.netProfitPerOrder).toBeLessThan(shopify.netProfitPerOrder as number);
  });

  it('custom platform uses customPlatformRate', () => {
    const result = calculateDropshippingProfit({ ...base, platformType: 'custom', customPlatformRate: 10 });
    const expectedFee = 39.99 * 0.10;
    const expectedProfit = 39.99 - 12 - 3.5 - expectedFee - 5;
    expect(result.netProfitPerOrder).toBeCloseTo(expectedProfit, 1);
  });

  it('ROI is positive when profitable', () => {
    const result = calculateDropshippingProfit(base);
    expect(result.roi).toBeGreaterThan(0);
  });

  it('break-even price is less than selling price when profitable', () => {
    const result = calculateDropshippingProfit(base);
    expect(result.breakEvenPrice).toBeLessThan(base.sellingPrice);
  });

  it('higher ad spend reduces profit', () => {
    const low = calculateDropshippingProfit({ ...base, adSpendPerOrder: 2 });
    const high = calculateDropshippingProfit({ ...base, adSpendPerOrder: 15 });
    expect(high.netProfitPerOrder).toBeLessThan(low.netProfitPerOrder as number);
  });

  it('monthly profit scales with order volume', () => {
    const result = calculateDropshippingProfit({ ...base, monthlyOrders: 200 });
    expect(result.monthlyProfit).toBeCloseTo((result.netProfitPerOrder as number) * 200, 1);
  });

  it('profit margin is between 0 and 100 for typical item', () => {
    const result = calculateDropshippingProfit(base);
    expect(result.profitMargin).toBeGreaterThan(0);
    expect(result.profitMargin).toBeLessThan(100);
  });

  it('cost breakdown table has 5 rows', () => {
    const result = calculateDropshippingProfit(base);
    expect((result.costBreakdownTable as unknown[]).length).toBe(5);
  });

  it('summary has 7 entries', () => {
    const result = calculateDropshippingProfit(base);
    expect((result.summary as unknown[]).length).toBe(7);
  });

  it('returns negative profit when supplier cost exceeds selling price', () => {
    const result = calculateDropshippingProfit({ ...base, supplierCost: 50 });
    expect(result.netProfitPerOrder).toBeLessThan(0);
  });
});
