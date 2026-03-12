import { calculateDiscount } from '@/lib/formulas/everyday/discount';

describe('calculateDiscount', () => {
  // ─── Test 1: Basic 25% discount ───
  it('calculates 25% off $200 = $150 saved $50', () => {
    const result = calculateDiscount({
      originalPrice: 200,
      discountPercent: 25,
    });
    expect(result.finalPrice).toBe(150);
    expect(result.savingsAmount).toBe(50);
    expect(result.totalSavingsPercent).toBe(25);
  });

  // ─── Test 2: 50% discount ───
  it('calculates 50% off $99.99', () => {
    const result = calculateDiscount({
      originalPrice: 99.99,
      discountPercent: 50,
    });
    // 99.99 * 0.50 = 49.995 → toFixed(2) due to floating point = "49.99"
    // savingsAmount = 49.99, finalPrice = 99.99 - 49.99 = 50.00
    expect(result.savingsAmount).toBeCloseTo(49.99, 2);
    expect(result.finalPrice).toBeCloseTo(50.00, 2);
  });

  // ─── Test 3: Stacked discounts (multiplicative) ───
  it('applies stacked 30% + 15% = 40.5% total, not 45%', () => {
    const result = calculateDiscount({
      originalPrice: 349.99,
      discountPercent: 30,
      additionalDiscount: 15,
    });
    // First: 349.99 * 0.70 = 245.00 (rounded)
    // Second: 245.00 * 0.85 = 208.25
    expect(result.finalPrice).toBeCloseTo(208.25, 1);
    expect(result.totalSavingsPercent).toBeCloseTo(40.5, 0);
  });

  // ─── Test 4: With sales tax ───
  it('applies 8% tax after discount', () => {
    const result = calculateDiscount({
      originalPrice: 100,
      discountPercent: 20,
      taxRate: 8,
    });
    // Final: 80, Tax: 80 * 0.08 = 6.40, Total: 86.40
    expect(result.finalPrice).toBe(80);
    expect(result.taxAmount).toBe(6.40);
    expect(result.totalWithTax).toBe(86.40);
  });

  // ─── Test 5: Zero discount ───
  it('returns original price with 0% discount', () => {
    const result = calculateDiscount({
      originalPrice: 50,
      discountPercent: 0,
    });
    expect(result.finalPrice).toBe(50);
    expect(result.savingsAmount).toBe(0);
    expect(result.totalSavingsPercent).toBe(0);
  });

  // ─── Test 6: 100% discount ───
  it('handles 100% discount (free item)', () => {
    const result = calculateDiscount({
      originalPrice: 100,
      discountPercent: 100,
    });
    expect(result.finalPrice).toBe(0);
    expect(result.savingsAmount).toBe(100);
    expect(result.totalSavingsPercent).toBe(100);
  });

  // ─── Test 7: Zero price ───
  it('handles zero original price', () => {
    const result = calculateDiscount({
      originalPrice: 0,
      discountPercent: 25,
    });
    expect(result.finalPrice).toBe(0);
    expect(result.savingsAmount).toBe(0);
  });

  // ─── Test 8: Large price ───
  it('handles large prices correctly', () => {
    const result = calculateDiscount({
      originalPrice: 15000,
      discountPercent: 10,
    });
    expect(result.finalPrice).toBe(13500);
    expect(result.savingsAmount).toBe(1500);
  });

  // ─── Test 9: Decimal discount percentage ───
  it('handles decimal discount like 12.5%', () => {
    const result = calculateDiscount({
      originalPrice: 80,
      discountPercent: 12.5,
    });
    expect(result.savingsAmount).toBe(10);
    expect(result.finalPrice).toBe(70);
  });

  // ─── Test 10: Quantity calculation ───
  it('calculates total for quantity > 1', () => {
    const result = calculateDiscount({
      originalPrice: 100,
      discountPercent: 20,
      quantity: 3,
      taxRate: 5,
    });
    // Final: 80, Tax: 4, With tax: 84, Quantity: 84 * 3 = 252
    expect(result.totalWithTax).toBe(84);
    expect(result.totalForQuantity).toBe(252);
  });

  // ─── Test 11: Default quantity is 1 ───
  it('defaults quantity to 1', () => {
    const result = calculateDiscount({
      originalPrice: 100,
      discountPercent: 10,
    });
    expect(result.quantity).toBe(1);
  });

  // ─── Test 12: Additional savings tracked separately ───
  it('tracks first and second discount savings separately', () => {
    const result = calculateDiscount({
      originalPrice: 200,
      discountPercent: 25,
      additionalDiscount: 10,
    });
    expect(result.savingsAmount).toBe(50); // First discount: 200 * 0.25
    expect(result.additionalSavings).toBe(15); // Second: 150 * 0.10
    expect(result.totalSavings).toBe(65); // Total saved
    expect(result.finalPrice).toBe(135);
  });

  // ─── Test 13: Stacked discount with tax ───
  it('applies tax after both discounts', () => {
    const result = calculateDiscount({
      originalPrice: 100,
      discountPercent: 20,
      additionalDiscount: 10,
      taxRate: 10,
    });
    // After first: 80, after second: 72, tax: 7.20, total: 79.20
    expect(result.finalPrice).toBe(72);
    expect(result.taxAmount).toBe(7.20);
    expect(result.totalWithTax).toBe(79.20);
  });
});
