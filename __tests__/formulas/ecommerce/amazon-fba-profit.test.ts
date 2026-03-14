import { calculateFBAProfit } from '@/lib/formulas/ecommerce/amazon-fba-profit';

describe('calculateFBAProfit', () => {
  const base = {
    sellingPrice: 29.99,
    productCost: 8,
    productCategory: 'home-garden',
    sizeTier: 'large-standard-8oz',
    inboundShippingPerUnit: 1.5,
    ppcCostPerUnit: 2,
  };

  it('calculates referral fee at 15% for home-garden', () => {
    const result = calculateFBAProfit(base);
    // referral = 29.99 × 0.15 = 4.4985 ≈ 4.50
    const table = result.feeBreakdownTable as { item: string; amount: number }[];
    const referralRow = table.find((r) => r.item === 'Referral Fee');
    expect(referralRow?.amount).toBeCloseTo(4.50, 1);
  });

  it('uses 2026 FBA fee $4.08 for large-standard-8oz', () => {
    const result = calculateFBAProfit(base);
    const table = result.feeBreakdownTable as { item: string; amount: number }[];
    const fbaRow = table.find((r) => r.item === 'FBA Fulfillment Fee');
    expect(fbaRow?.amount).toBeCloseTo(4.08, 2);
  });

  it('net profit = selling price minus all deductions', () => {
    const result = calculateFBAProfit(base);
    // 29.99 - 4.50 - 4.08 - 8 - 1.5 - 2 = ~9.91
    expect(result.netProfit).toBeGreaterThan(0);
    expect(result.netProfit).toBeLessThan(base.sellingPrice as number);
  });

  it('profit margin is between 0 and 100', () => {
    const result = calculateFBAProfit(base);
    expect(result.profitMargin).toBeGreaterThan(0);
    expect(result.profitMargin).toBeLessThan(100);
  });

  it('ROI is positive when profitable', () => {
    const result = calculateFBAProfit(base);
    expect(result.roi).toBeGreaterThan(0);
  });

  it('clothing category uses 17% referral fee', () => {
    const result = calculateFBAProfit({ ...base, productCategory: 'clothing' });
    const table = result.feeBreakdownTable as { item: string; amount: number }[];
    const referralRow = table.find((r) => r.item === 'Referral Fee');
    expect(referralRow?.amount).toBeCloseTo(29.99 * 0.17, 1);
  });

  it('electronics category uses 8% referral fee', () => {
    const result = calculateFBAProfit({ ...base, productCategory: 'electronics' });
    const table = result.feeBreakdownTable as { item: string; amount: number }[];
    const referralRow = table.find((r) => r.item === 'Referral Fee');
    expect(referralRow?.amount).toBeCloseTo(29.99 * 0.08, 1);
  });

  it('small-standard-4oz uses $3.22 FBA fee', () => {
    const result = calculateFBAProfit({ ...base, sizeTier: 'small-standard-4oz' });
    const table = result.feeBreakdownTable as { item: string; amount: number }[];
    const fbaRow = table.find((r) => r.item === 'FBA Fulfillment Fee');
    expect(fbaRow?.amount).toBeCloseTo(3.22, 2);
  });

  it('break-even price is lower than selling price when profitable', () => {
    const result = calculateFBAProfit(base);
    expect(result.breakEvenPrice).toBeLessThan(base.sellingPrice);
  });

  it('break-even price is positive', () => {
    const result = calculateFBAProfit(base);
    expect(result.breakEvenPrice).toBeGreaterThan(0);
  });

  it('returns 0 profit when cost equals selling price', () => {
    const result = calculateFBAProfit({
      ...base,
      sellingPrice: 15,
      productCost: 15,
      inboundShippingPerUnit: 0,
      ppcCostPerUnit: 0,
    });
    expect(result.netProfit).toBeLessThan(0); // fees on top make it negative
  });

  it('fee breakdown table has 6 rows', () => {
    const result = calculateFBAProfit(base);
    expect((result.feeBreakdownTable as unknown[]).length).toBe(6);
  });

  it('summary has 7 entries', () => {
    const result = calculateFBAProfit(base);
    expect((result.summary as unknown[]).length).toBe(7);
  });
});
