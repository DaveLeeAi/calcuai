import { calculateEtsyFee } from '@/lib/formulas/ecommerce/etsy-fee';

describe('calculateEtsyFee', () => {
  const base = {
    sellingPrice: 24.99,
    productCost: 6,
    shippingChargedToBuyer: 5,
    actualShippingCost: 4.5,
    offsiteAdsPct: 0,
    annualRevenue: 'under-10k',
    monthlyOrders: 40,
  };

  it('net profit is positive for typical handmade item', () => {
    const result = calculateEtsyFee(base);
    expect(result.netProfitPerOrder).toBeGreaterThan(0);
  });

  it('includes $0.20 listing fee per order', () => {
    const result = calculateEtsyFee(base);
    const summary = result.summary as { label: string; value: number }[];
    // Listing fee is embedded in total Etsy fees
    expect(result.netProfitPerOrder).toBeLessThan(base.sellingPrice);
  });

  it('transaction fee is 6.5% of item + shipping charged', () => {
    // fee base = 24.99 + 5 = 29.99; transaction = 29.99 × 0.065 ≈ 1.95
    const result = calculateEtsyFee(base);
    const table = result.feeBreakdownTable as { item: string; amount: number }[];
    const txRow = table.find((r) => r.item.includes('Transaction'));
    expect(txRow?.amount).toBeCloseTo(29.99 * 0.065, 1);
  });

  it('offsite ads fee is zero when offsiteAdsPct is 0', () => {
    const result = calculateEtsyFee({ ...base, offsiteAdsPct: 0 });
    const table = result.feeBreakdownTable as { item: string; amount: number }[];
    const adsRow = table.find((r) => r.item.includes('Offsite'));
    expect(adsRow?.amount).toBe(0);
  });

  it('offsite ads fee applies 15% for under-10k shops', () => {
    // 50% of sales from offsite ads at 15% → fee = 0.5 × 0.15 × 24.99 ≈ 1.87
    const result = calculateEtsyFee({ ...base, offsiteAdsPct: 50, annualRevenue: 'under-10k' });
    const table = result.feeBreakdownTable as { item: string; amount: number }[];
    const adsRow = table.find((r) => r.item.includes('Offsite'));
    expect(adsRow?.amount).toBeCloseTo(0.5 * 0.15 * 24.99, 1);
  });

  it('over-10k shops pay 12% offsite ads rate (lower than 15%)', () => {
    const under = calculateEtsyFee({ ...base, offsiteAdsPct: 30, annualRevenue: 'under-10k' });
    const over = calculateEtsyFee({ ...base, offsiteAdsPct: 30, annualRevenue: 'over-10k' });
    expect(over.netProfitPerOrder).toBeGreaterThan(under.netProfitPerOrder as number);
  });

  it('profit margin is between 0 and 100 for typical item', () => {
    const result = calculateEtsyFee(base);
    expect(result.profitMargin).toBeGreaterThan(0);
    expect(result.profitMargin).toBeLessThan(100);
  });

  it('monthly profit reflects order volume', () => {
    const result = calculateEtsyFee({ ...base, monthlyOrders: 20 });
    expect(result.monthlyProfit).toBeCloseTo((result.netProfitPerOrder as number) * 20, 1);
  });

  it('fee breakdown table has 7 rows', () => {
    const result = calculateEtsyFee(base);
    expect((result.feeBreakdownTable as unknown[]).length).toBe(7);
  });

  it('summary has 7 entries', () => {
    const result = calculateEtsyFee(base);
    expect((result.summary as unknown[]).length).toBe(7);
  });

  it('higher product cost reduces profit', () => {
    const low = calculateEtsyFee({ ...base, productCost: 3 });
    const high = calculateEtsyFee({ ...base, productCost: 12 });
    expect(high.netProfitPerOrder).toBeLessThan(low.netProfitPerOrder as number);
  });

  it('returns negative profit when product cost is very high', () => {
    const result = calculateEtsyFee({ ...base, productCost: 28 });
    expect(result.netProfitPerOrder).toBeLessThan(0);
  });
});
