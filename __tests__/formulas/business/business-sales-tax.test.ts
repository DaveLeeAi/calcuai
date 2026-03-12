import { calculateBusinessSalesTax } from '@/lib/formulas/business/business-sales-tax';

describe('calculateBusinessSalesTax', () => {
  // ─── Test 1: Tax-exclusive basic calculation ───
  it('calculates tax-exclusive pricing correctly', () => {
    const result = calculateBusinessSalesTax({
      pricingStrategy: 'tax-exclusive',
      unitCost: 20,
      desiredMarginPercent: 40,
      taxRate: 8.25,
      monthlySalesVolume: 500,
      stickerPrice: 0,
    });
    // List Price = 20 * (1 + 40/100) = 20 * 1.4 = $28.00
    expect(result.listPrice).toBe(28);
    // Tax = 28 * 0.0825 = $2.31
    expect(result.taxPerUnit).toBe(2.31);
    // Customer Pays = 28 + 2.31 = $30.31
    expect(result.customerPays).toBe(30.31);
  });

  // ─── Test 2: Tax-inclusive basic calculation ───
  it('calculates tax-inclusive pricing correctly', () => {
    const result = calculateBusinessSalesTax({
      pricingStrategy: 'tax-inclusive',
      unitCost: 20,
      desiredMarginPercent: 40,
      taxRate: 8.25,
      monthlySalesVolume: 500,
      stickerPrice: 50,
    });
    // Customer Pays = $50.00 (sticker price)
    expect(result.customerPays).toBe(50);
    // Pre-tax = 50 / 1.0825 = $46.19 (rounded)
    expect(result.listPrice).toBe(46.19);
    // Tax = 50 - 46.19 = $3.81
    expect(result.taxPerUnit).toBe(3.81);
    // Revenue = pre-tax price
    expect(result.yourRevenuePerUnit).toBe(46.19);
  });

  // ─── Test 3: Tax-exclusive customer pays total ───
  it('returns correct customer total in tax-exclusive mode', () => {
    const result = calculateBusinessSalesTax({
      pricingStrategy: 'tax-exclusive',
      unitCost: 10,
      desiredMarginPercent: 50,
      taxRate: 10,
      monthlySalesVolume: 100,
      stickerPrice: 0,
    });
    // List Price = 10 * 1.5 = $15
    // Tax = 15 * 0.10 = $1.50
    // Customer = 15 + 1.50 = $16.50
    expect(result.customerPays).toBe(16.50);
    expect(result.listPrice).toBe(15);
    expect(result.taxPerUnit).toBe(1.50);
  });

  // ─── Test 4: Tax-inclusive revenue extraction ───
  it('extracts correct revenue from tax-inclusive sticker price', () => {
    const result = calculateBusinessSalesTax({
      pricingStrategy: 'tax-inclusive',
      unitCost: 30,
      desiredMarginPercent: 0,
      taxRate: 10,
      monthlySalesVolume: 200,
      stickerPrice: 100,
    });
    // Pre-tax = 100 / 1.10 = $90.91 (rounded)
    expect(result.listPrice).toBe(90.91);
    expect(result.taxPerUnit).toBe(9.09);
    expect(result.yourRevenuePerUnit).toBe(90.91);
    // Profit = 90.91 - 30 = $60.91
    expect(result.profitPerUnit).toBe(60.91);
  });

  // ─── Test 5: Monthly tax liability ───
  it('calculates monthly tax liability correctly', () => {
    const result = calculateBusinessSalesTax({
      pricingStrategy: 'tax-exclusive',
      unitCost: 20,
      desiredMarginPercent: 40,
      taxRate: 8.25,
      monthlySalesVolume: 500,
      stickerPrice: 0,
    });
    // Tax per unit = $2.31, volume = 500
    // Monthly tax = 2.31 * 500 = $1,155.00
    expect(result.monthlyTaxLiability).toBe(1155);
  });

  // ─── Test 6: Monthly profit ───
  it('calculates monthly profit correctly', () => {
    const result = calculateBusinessSalesTax({
      pricingStrategy: 'tax-exclusive',
      unitCost: 20,
      desiredMarginPercent: 40,
      taxRate: 8.25,
      monthlySalesVolume: 500,
      stickerPrice: 0,
    });
    // List Price = $28, Profit per unit = 28 - 20 = $8
    expect(result.profitPerUnit).toBe(8);
    // Monthly profit = 8 * 500 = $4,000
    expect(result.monthlyProfit).toBe(4000);
  });

  // ─── Test 7: Zero tax rate (no sales tax state) ───
  it('handles zero tax rate correctly', () => {
    const result = calculateBusinessSalesTax({
      pricingStrategy: 'tax-exclusive',
      unitCost: 25,
      desiredMarginPercent: 50,
      taxRate: 0,
      monthlySalesVolume: 1000,
      stickerPrice: 0,
    });
    // List Price = 25 * 1.5 = $37.50
    expect(result.listPrice).toBe(37.50);
    expect(result.taxPerUnit).toBe(0);
    expect(result.customerPays).toBe(37.50);
    expect(result.monthlyTaxLiability).toBe(0);
  });

  // ─── Test 8: High tax rate (10.25%) ───
  it('handles high tax rate correctly', () => {
    const result = calculateBusinessSalesTax({
      pricingStrategy: 'tax-exclusive',
      unitCost: 100,
      desiredMarginPercent: 30,
      taxRate: 10.25,
      monthlySalesVolume: 50,
      stickerPrice: 0,
    });
    // List Price = 100 * 1.3 = $130
    expect(result.listPrice).toBe(130);
    // Tax = 130 * 0.1025 = $13.33 (rounded)
    expect(result.taxPerUnit).toBe(13.33);
    // Customer = 130 + 13.33 = $143.33 (rounded)
    expect(result.customerPays).toBe(143.33);
  });

  // ─── Test 9: Zero cost (free product with tax) ───
  it('handles zero cost correctly', () => {
    const result = calculateBusinessSalesTax({
      pricingStrategy: 'tax-exclusive',
      unitCost: 0,
      desiredMarginPercent: 100,
      taxRate: 8,
      monthlySalesVolume: 100,
      stickerPrice: 0,
    });
    // List Price = 0 * 2 = $0
    expect(result.listPrice).toBe(0);
    expect(result.taxPerUnit).toBe(0);
    expect(result.customerPays).toBe(0);
    expect(result.profitPerUnit).toBe(0);
  });

  // ─── Test 10: Zero margin ───
  it('handles zero margin correctly', () => {
    const result = calculateBusinessSalesTax({
      pricingStrategy: 'tax-exclusive',
      unitCost: 50,
      desiredMarginPercent: 0,
      taxRate: 7,
      monthlySalesVolume: 200,
      stickerPrice: 0,
    });
    // List Price = 50 * 1.0 = $50
    expect(result.listPrice).toBe(50);
    expect(result.profitPerUnit).toBe(0);
    // Tax = 50 * 0.07 = $3.50
    expect(result.taxPerUnit).toBe(3.50);
    expect(result.customerPays).toBe(53.50);
  });

  // ─── Test 11: Price breakdown pie chart has correct slices ───
  it('returns price breakdown with cost, profit, and tax slices', () => {
    const result = calculateBusinessSalesTax({
      pricingStrategy: 'tax-exclusive',
      unitCost: 20,
      desiredMarginPercent: 40,
      taxRate: 8.25,
      monthlySalesVolume: 500,
      stickerPrice: 0,
    });
    const breakdown = result.priceBreakdown as { label: string; value: number }[];
    expect(breakdown).toHaveLength(3);
    const labels = breakdown.map((s) => s.label);
    expect(labels).toContain('Cost');
    expect(labels).toContain('Profit');
    expect(labels).toContain('Sales Tax');
    const costSlice = breakdown.find((s) => s.label === 'Cost');
    expect(costSlice?.value).toBe(20);
  });

  // ─── Test 12: Profit per unit correct ───
  it('calculates profit per unit correctly in tax-exclusive mode', () => {
    const result = calculateBusinessSalesTax({
      pricingStrategy: 'tax-exclusive',
      unitCost: 15,
      desiredMarginPercent: 100,
      taxRate: 5,
      monthlySalesVolume: 300,
      stickerPrice: 0,
    });
    // List Price = 15 * 2.0 = $30
    // Profit = 30 - 15 = $15
    expect(result.profitPerUnit).toBe(15);
    expect(result.yourRevenuePerUnit).toBe(30);
  });

  // ─── Test 13: Large volume (100,000 units) ───
  it('handles large sales volume correctly', () => {
    const result = calculateBusinessSalesTax({
      pricingStrategy: 'tax-exclusive',
      unitCost: 5,
      desiredMarginPercent: 60,
      taxRate: 9,
      monthlySalesVolume: 100000,
      stickerPrice: 0,
    });
    // List Price = 5 * 1.6 = $8
    // Tax = 8 * 0.09 = $0.72
    expect(result.taxPerUnit).toBe(0.72);
    // Monthly tax liability = 0.72 * 100000 = $72,000
    expect(result.monthlyTaxLiability).toBe(72000);
    // Monthly revenue = 8 * 100000 = $800,000
    expect(result.monthlyRevenue).toBe(800000);
  });

  // ─── Test 14: Margin percent in tax-exclusive mode ───
  it('calculates actual margin percent correctly in tax-exclusive mode', () => {
    const result = calculateBusinessSalesTax({
      pricingStrategy: 'tax-exclusive',
      unitCost: 20,
      desiredMarginPercent: 40,
      taxRate: 8.25,
      monthlySalesVolume: 500,
      stickerPrice: 0,
    });
    // List Price = $28, Profit = $8
    // Margin = (8 / 28) * 100 = 28.57%
    expect(result.marginPercent).toBe(28.57);
  });

  // ─── Test 15: Tax-inclusive margin percent ───
  it('calculates margin percent correctly in tax-inclusive mode', () => {
    const result = calculateBusinessSalesTax({
      pricingStrategy: 'tax-inclusive',
      unitCost: 20,
      desiredMarginPercent: 0,
      taxRate: 10,
      monthlySalesVolume: 100,
      stickerPrice: 44,
    });
    // Pre-tax = 44 / 1.10 = $40
    // Profit = 40 - 20 = $20
    // Margin = (20 / 40) * 100 = 50%
    expect(result.marginPercent).toBe(50);
  });

  // ─── Test 16: Summary value group has all labels ───
  it('returns summary with expected labels', () => {
    const result = calculateBusinessSalesTax({
      pricingStrategy: 'tax-exclusive',
      unitCost: 20,
      desiredMarginPercent: 40,
      taxRate: 8.25,
      monthlySalesVolume: 500,
      stickerPrice: 0,
    });
    const summary = result.summary as { label: string; value: number }[];
    const labels = summary.map((s) => s.label);
    expect(labels).toContain('Customer Pays');
    expect(labels).toContain('List Price (Pre-Tax)');
    expect(labels).toContain('Tax per Unit');
    expect(labels).toContain('Your Revenue per Unit');
    expect(labels).toContain('Profit per Unit');
    expect(labels).toContain('Actual Margin %');
    expect(labels).toContain('Monthly Tax Liability');
    expect(labels).toContain('Monthly Revenue');
    expect(labels).toContain('Monthly Profit');
  });

  // ─── Test 17: Default/missing inputs ───
  it('uses defaults for missing inputs', () => {
    const result = calculateBusinessSalesTax({});
    expect(result.customerPays).toBe(0);
    expect(result.listPrice).toBe(0);
    expect(result.taxPerUnit).toBe(0);
    expect(result.monthlyTaxLiability).toBe(0);
  });
});
