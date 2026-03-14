import { calculateProductPricing } from '@/lib/formulas/ecommerce/product-pricing';

describe('calculateProductPricing', () => {
  // Basic margin-based pricing
  it('calculates base price at 50% margin for $20 cost', () => {
    const result = calculateProductPricing({ productCost: 20, targetMargin: 50, overheadPerUnit: 0, discountTier1Qty: 10, discountTier1Pct: 5, discountTier2Qty: 50, discountTier2Pct: 10 });
    expect(result.basePrice).toBeCloseTo(40, 2);
    expect(result.grossProfit).toBeCloseTo(20, 2);
  });

  it('calculates base price at 40% margin for $30 cost', () => {
    const result = calculateProductPricing({ productCost: 30, targetMargin: 40, overheadPerUnit: 0, discountTier1Qty: 10, discountTier1Pct: 5, discountTier2Qty: 50, discountTier2Pct: 10 });
    expect(result.basePrice).toBeCloseTo(50, 2);
    expect(result.grossProfit).toBeCloseTo(20, 2);
  });

  it('includes overhead in price calculation', () => {
    const result = calculateProductPricing({ productCost: 20, targetMargin: 50, overheadPerUnit: 5, discountTier1Qty: 10, discountTier1Pct: 5, discountTier2Qty: 50, discountTier2Pct: 10 });
    // total cost = 25, price = 25 / 0.5 = 50
    expect(result.basePrice).toBeCloseTo(50, 2);
  });

  it('generates 3 pricing tiers', () => {
    const result = calculateProductPricing({ productCost: 20, targetMargin: 50, overheadPerUnit: 0, discountTier1Qty: 10, discountTier1Pct: 5, discountTier2Qty: 50, discountTier2Pct: 10 });
    const tiers = result.pricingTiers as { tier: string; minQty: number; price: number }[];
    expect(tiers).toHaveLength(3);
    expect(tiers[0].tier).toBe('Base');
    expect(tiers[0].minQty).toBe(1);
  });

  it('tier 1 price is base price minus discount', () => {
    const result = calculateProductPricing({ productCost: 20, targetMargin: 50, overheadPerUnit: 0, discountTier1Qty: 10, discountTier1Pct: 10, discountTier2Qty: 50, discountTier2Pct: 20 });
    const tiers = result.pricingTiers as { price: number }[];
    const base = result.basePrice as number;
    expect(tiers[1].price).toBeCloseTo(base * 0.9, 2);
  });

  it('tier 2 price is base price minus larger discount', () => {
    const result = calculateProductPricing({ productCost: 20, targetMargin: 50, overheadPerUnit: 0, discountTier1Qty: 10, discountTier1Pct: 5, discountTier2Qty: 50, discountTier2Pct: 15 });
    const tiers = result.pricingTiers as { price: number }[];
    const base = result.basePrice as number;
    expect(tiers[2].price).toBeCloseTo(base * 0.85, 2);
  });

  it('summary contains 6 entries', () => {
    const result = calculateProductPricing({ productCost: 20, targetMargin: 50, overheadPerUnit: 2, discountTier1Qty: 10, discountTier1Pct: 5, discountTier2Qty: 50, discountTier2Pct: 10 });
    expect((result.summary as unknown[]).length).toBe(6);
  });

  it('handles zero overhead correctly', () => {
    const result = calculateProductPricing({ productCost: 100, targetMargin: 60, overheadPerUnit: 0, discountTier1Qty: 5, discountTier1Pct: 5, discountTier2Qty: 20, discountTier2Pct: 10 });
    // price = 100 / 0.4 = 250
    expect(result.basePrice).toBeCloseTo(250, 2);
  });

  it('gross profit equals base price minus total costs', () => {
    const overhead = 3;
    const cost = 25;
    const result = calculateProductPricing({ productCost: cost, targetMargin: 50, overheadPerUnit: overhead, discountTier1Qty: 10, discountTier1Pct: 5, discountTier2Qty: 50, discountTier2Pct: 10 });
    const base = result.basePrice as number;
    expect(result.grossProfit).toBeCloseTo(base - cost - overhead, 1);
  });

  it('handles high margin (75%) correctly', () => {
    const result = calculateProductPricing({ productCost: 10, targetMargin: 75, overheadPerUnit: 0, discountTier1Qty: 10, discountTier1Pct: 5, discountTier2Qty: 50, discountTier2Pct: 10 });
    // price = 10 / 0.25 = 40
    expect(result.basePrice).toBeCloseTo(40, 2);
  });

  it('uses default values for missing inputs', () => {
    const result = calculateProductPricing({ productCost: 50 });
    expect(result.basePrice).toBeGreaterThan(0);
  });

  it('tier 1 min qty is reflected in pricing tiers', () => {
    const result = calculateProductPricing({ productCost: 20, targetMargin: 50, overheadPerUnit: 0, discountTier1Qty: 25, discountTier1Pct: 5, discountTier2Qty: 100, discountTier2Pct: 10 });
    const tiers = result.pricingTiers as { minQty: number }[];
    expect(tiers[1].minQty).toBe(25);
    expect(tiers[2].minQty).toBe(100);
  });

  it('effective margin at base tier matches target margin', () => {
    const result = calculateProductPricing({ productCost: 20, targetMargin: 50, overheadPerUnit: 0, discountTier1Qty: 10, discountTier1Pct: 5, discountTier2Qty: 50, discountTier2Pct: 10 });
    const tiers = result.pricingTiers as { margin: number }[];
    expect(tiers[0].margin).toBeCloseTo(50, 1);
  });
});
