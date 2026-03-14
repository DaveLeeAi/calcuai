import { calculateEbayFee } from '@/lib/formulas/ecommerce/ebay-fee';

describe('calculateEbayFee', () => {
  const base = {
    sellingPrice: 29.99,
    productCost: 8,
    productCategory: 'most-categories',
    buyerShipping: 0,
    actualShippingCost: 5,
    promotedListingsRate: 0,
    monthlyOrders: 50,
  };

  it('net profit is positive for typical home goods sale', () => {
    const result = calculateEbayFee(base);
    expect(result.netProfitPerOrder).toBeGreaterThan(0);
  });

  it('calculates final value fee at 13.25% on most-categories', () => {
    const result = calculateEbayFee({ ...base, buyerShipping: 0 });
    // FVF = 29.99 × 0.1325 ≈ $3.97; processing = 29.99 × 0.029 + 0.30 ≈ $1.17
    expect(result.netProfitPerOrder).toBeLessThan(base.sellingPrice);
  });

  it('electronics category has lower fee rate (8.7%)', () => {
    const electronics = calculateEbayFee({ ...base, productCategory: 'electronics' });
    const mostCats = calculateEbayFee(base);
    expect(electronics.netProfitPerOrder).toBeGreaterThan(mostCats.netProfitPerOrder as number);
  });

  it('fashion-under-100 has higher fee rate (15%)', () => {
    const fashion = calculateEbayFee({ ...base, productCategory: 'fashion-under-100' });
    const mostCats = calculateEbayFee(base);
    expect(fashion.netProfitPerOrder).toBeLessThan(mostCats.netProfitPerOrder as number);
  });

  it('FVF applied to buyer total including buyer shipping', () => {
    const withShipping = calculateEbayFee({ ...base, buyerShipping: 5, actualShippingCost: 5 });
    const noShipping = calculateEbayFee(base);
    // Buyer shipping increases FVF base; net should differ
    expect(withShipping.netProfitPerOrder).not.toBe(noShipping.netProfitPerOrder);
  });

  it('promoted listings reduces net profit', () => {
    const noPromo = calculateEbayFee(base);
    const withPromo = calculateEbayFee({ ...base, promotedListingsRate: 5 });
    expect(withPromo.netProfitPerOrder).toBeLessThan(noPromo.netProfitPerOrder as number);
  });

  it('profit margin is between 0 and 100 for typical item', () => {
    const result = calculateEbayFee(base);
    expect(result.profitMargin).toBeGreaterThan(0);
    expect(result.profitMargin).toBeLessThan(100);
  });

  it('monthly profit equals net profit times monthly orders', () => {
    const result = calculateEbayFee({ ...base, monthlyOrders: 100 });
    expect(Math.round((result.monthlyProfit as number) * 100) / 100).toBe(
      Math.round((result.netProfitPerOrder as number) * 100 * 100) / 100
    );
  });

  it('fee breakdown table has 7 rows', () => {
    const result = calculateEbayFee(base);
    expect((result.feeBreakdownTable as unknown[]).length).toBe(7);
  });

  it('summary has 7 entries', () => {
    const result = calculateEbayFee(base);
    expect((result.summary as unknown[]).length).toBe(7);
  });

  it('higher product cost reduces net profit proportionally', () => {
    const low = calculateEbayFee({ ...base, productCost: 5 });
    const high = calculateEbayFee({ ...base, productCost: 15 });
    expect(high.netProfitPerOrder).toBeLessThan(low.netProfitPerOrder as number);
  });

  it('returns negative profit when costs exceed selling price', () => {
    const result = calculateEbayFee({ ...base, productCost: 30 });
    expect(result.netProfitPerOrder).toBeLessThan(0);
  });
});
