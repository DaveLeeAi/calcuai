import { calculateSalesTax } from '@/lib/formulas/finance/sales-tax';

describe('calculateSalesTax', () => {
  // ─── Test 1: Standard add-tax calculation ───
  it('calculates tax on $100 at 8.25% correctly', () => {
    const result = calculateSalesTax({
      purchasePrice: 100,
      taxRate: 8.25,
      calculationMode: 'add-tax',
    });
    expect(result.taxAmount).toBe(8.25);
    expect(result.totalPrice).toBe(108.25);
    expect(result.effectivePrice).toBe(100);
  });

  // ─── Test 2: Texas rate on $500 purchase ───
  it('calculates $500 purchase at 8.25% Texas rate', () => {
    const result = calculateSalesTax({
      purchasePrice: 500,
      taxRate: 8.25,
      calculationMode: 'add-tax',
    });
    expect(result.taxAmount).toBe(41.25);
    expect(result.totalPrice).toBe(541.25);
  });

  // ─── Test 3: Extract tax from total ───
  it('extracts tax from $108.25 total at 8.25%', () => {
    const result = calculateSalesTax({
      purchasePrice: 108.25,
      taxRate: 8.25,
      calculationMode: 'extract-tax',
    });
    expect(result.effectivePrice).toBeCloseTo(100, 1);
    expect(result.taxAmount).toBeCloseTo(8.25, 1);
    expect(result.totalPrice).toBeCloseTo(108.25, 1);
  });

  // ─── Test 4: Zero tax rate ───
  it('handles zero tax rate (Delaware, Oregon, etc.)', () => {
    const result = calculateSalesTax({
      purchasePrice: 250,
      taxRate: 0,
      calculationMode: 'add-tax',
    });
    expect(result.taxAmount).toBe(0);
    expect(result.totalPrice).toBe(250);
    expect(result.effectivePrice).toBe(250);
  });

  // ─── Test 5: High tax rate (Louisiana max ~12.95%) ───
  it('calculates correctly at high combined rate of 12.95%', () => {
    const result = calculateSalesTax({
      purchasePrice: 1000,
      taxRate: 12.95,
      calculationMode: 'add-tax',
    });
    expect(result.taxAmount).toBe(129.50);
    expect(result.totalPrice).toBe(1129.50);
  });

  // ─── Test 6: Small purchase amount ───
  it('handles small purchase of $1.50', () => {
    const result = calculateSalesTax({
      purchasePrice: 1.50,
      taxRate: 7,
      calculationMode: 'add-tax',
    });
    expect(result.taxAmount).toBeCloseTo(0.11, 1);
    expect(result.totalPrice).toBeCloseTo(1.61, 1);
  });

  // ─── Test 7: Large purchase amount ───
  it('handles large purchase of $50,000', () => {
    const result = calculateSalesTax({
      purchasePrice: 50000,
      taxRate: 6,
      calculationMode: 'add-tax',
    });
    expect(result.taxAmount).toBe(3000);
    expect(result.totalPrice).toBe(53000);
  });

  // ─── Test 8: Extract tax from a large total ───
  it('extracts tax from $53,000 total at 6%', () => {
    const result = calculateSalesTax({
      purchasePrice: 53000,
      taxRate: 6,
      calculationMode: 'extract-tax',
    });
    expect(result.effectivePrice).toBeCloseTo(50000, 0);
    expect(result.taxAmount).toBeCloseTo(3000, 0);
  });

  // ─── Test 9: Zero purchase price ───
  it('returns zeros for zero purchase price', () => {
    const result = calculateSalesTax({
      purchasePrice: 0,
      taxRate: 8.25,
      calculationMode: 'add-tax',
    });
    expect(result.taxAmount).toBe(0);
    expect(result.totalPrice).toBe(0);
    expect(result.effectivePrice).toBe(0);
  });

  // ─── Test 10: Summary has 4 entries ───
  it('returns summary with 4 items', () => {
    const result = calculateSalesTax({
      purchasePrice: 100,
      taxRate: 8.25,
      calculationMode: 'add-tax',
    });
    const summary = result.summary as Array<{ label: string; value: number | string }>;
    expect(summary).toHaveLength(4);
    expect(summary[0].label).toBe('Pre-Tax Price');
    expect(summary[2].label).toBe('Sales Tax');
  });

  // ─── Test 11: Fractional tax rate ───
  it('handles fractional tax rate of 8.375%', () => {
    const result = calculateSalesTax({
      purchasePrice: 200,
      taxRate: 8.375,
      calculationMode: 'add-tax',
    });
    expect(result.taxAmount).toBe(16.75);
    expect(result.totalPrice).toBe(216.75);
  });

  // ─── Test 12: Add then extract round-trip consistency ───
  it('round-trips: add tax then extract yields original price', () => {
    const addResult = calculateSalesTax({
      purchasePrice: 299.99,
      taxRate: 9.5,
      calculationMode: 'add-tax',
    });
    const total = addResult.totalPrice as number;
    const extractResult = calculateSalesTax({
      purchasePrice: total,
      taxRate: 9.5,
      calculationMode: 'extract-tax',
    });
    expect(extractResult.effectivePrice).toBeCloseTo(299.99, 1);
  });

  // ─── Test 13: Negative purchase price returns zeros ───
  it('handles negative purchase price gracefully', () => {
    const result = calculateSalesTax({
      purchasePrice: -50,
      taxRate: 8,
      calculationMode: 'add-tax',
    });
    expect(result.taxAmount).toBe(0);
    expect(result.totalPrice).toBe(0);
  });

  // ─── Test 14: Default mode is add-tax ───
  it('defaults to add-tax mode when mode is not specified', () => {
    const result = calculateSalesTax({
      purchasePrice: 100,
      taxRate: 10,
    });
    expect(result.taxAmount).toBe(10);
    expect(result.totalPrice).toBe(110);
  });
});
