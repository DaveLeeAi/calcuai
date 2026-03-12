import { calculateMarkup } from '@/lib/formulas/business/markup';

describe('calculateMarkup', () => {
  // --- Test 1: Basic cost-to-price (cost $50, markup 50% -> price $75) ---
  it('calculates selling price from cost and markup percentage', () => {
    const result = calculateMarkup({
      cost: 50,
      markupPercent: 50,
      calculationMode: 'cost-to-price',
      sellingPrice: 0,
    });
    expect(result.sellingPrice).toBe(75);
    expect(result.grossProfit).toBe(25);
  });

  // --- Test 2: Price-to-markup (cost $50, price $75 -> markup 50%) ---
  it('calculates markup percentage from cost and selling price', () => {
    const result = calculateMarkup({
      cost: 50,
      markupPercent: 0,
      calculationMode: 'price-to-markup',
      sellingPrice: 75,
    });
    expect(result.markupPercent).toBe(50);
    expect(result.grossProfit).toBe(25);
  });

  // --- Test 3: 100% markup (price = 2x cost) ---
  it('calculates 100% markup correctly — price equals double the cost', () => {
    const result = calculateMarkup({
      cost: 40,
      markupPercent: 100,
      calculationMode: 'cost-to-price',
      sellingPrice: 0,
    });
    expect(result.sellingPrice).toBe(80);
    expect(result.grossProfit).toBe(40);
    expect(result.markupPercent).toBe(100);
  });

  // --- Test 4: 0% markup (price = cost) ---
  it('handles 0% markup — selling price equals cost', () => {
    const result = calculateMarkup({
      cost: 60,
      markupPercent: 0,
      calculationMode: 'cost-to-price',
      sellingPrice: 0,
    });
    expect(result.sellingPrice).toBe(60);
    expect(result.grossProfit).toBe(0);
    expect(result.marginPercent).toBe(0);
  });

  // --- Test 5: Very high markup (300%) ---
  it('handles very high markup percentages', () => {
    const result = calculateMarkup({
      cost: 25,
      markupPercent: 300,
      calculationMode: 'cost-to-price',
      sellingPrice: 0,
    });
    expect(result.sellingPrice).toBe(100);
    expect(result.grossProfit).toBe(75);
    expect(result.markupPercent).toBe(300);
  });

  // --- Test 6: Zero cost edge case ---
  it('handles zero cost gracefully', () => {
    const result = calculateMarkup({
      cost: 0,
      markupPercent: 50,
      calculationMode: 'cost-to-price',
      sellingPrice: 0,
    });
    expect(result.sellingPrice).toBe(0);
    expect(result.grossProfit).toBe(0);
    expect(result.markupPercent).toBe(50);
  });

  // --- Test 7: Cost exceeds price (negative markup) ---
  it('calculates negative markup when cost exceeds selling price', () => {
    const result = calculateMarkup({
      cost: 100,
      markupPercent: 0,
      calculationMode: 'price-to-markup',
      sellingPrice: 80,
    });
    expect(result.markupPercent).toBe(-20);
    expect(result.grossProfit).toBe(-20);
  });

  // --- Test 8: Small numbers (cost $1.50) ---
  it('handles small dollar amounts with decimal precision', () => {
    const result = calculateMarkup({
      cost: 1.50,
      markupPercent: 100,
      calculationMode: 'cost-to-price',
      sellingPrice: 0,
    });
    expect(result.sellingPrice).toBe(3);
    expect(result.grossProfit).toBe(1.5);
  });

  // --- Test 9: Large numbers (cost $1,000,000) ---
  it('handles large dollar amounts correctly', () => {
    const result = calculateMarkup({
      cost: 1000000,
      markupPercent: 25,
      calculationMode: 'cost-to-price',
      sellingPrice: 0,
    });
    expect(result.sellingPrice).toBe(1250000);
    expect(result.grossProfit).toBe(250000);
  });

  // --- Test 10: Margin equivalent check (50% markup = 33.33% margin) ---
  it('calculates correct margin equivalent for 50% markup', () => {
    const result = calculateMarkup({
      cost: 100,
      markupPercent: 50,
      calculationMode: 'cost-to-price',
      sellingPrice: 0,
    });
    expect(result.sellingPrice).toBe(150);
    expect(result.marginPercent).toBeCloseTo(33.33, 1);
  });

  // --- Test 11: Summary output contains expected labels ---
  it('returns summary with all expected labels', () => {
    const result = calculateMarkup({
      cost: 50,
      markupPercent: 50,
      calculationMode: 'cost-to-price',
      sellingPrice: 0,
    });
    const summary = result.summary as { label: string; value: number }[];
    const labels = summary.map((item) => item.label);
    expect(labels).toContain('Cost');
    expect(labels).toContain('Selling Price');
    expect(labels).toContain('Gross Profit');
    expect(labels).toContain('Markup %');
    expect(labels).toContain('Margin %');
  });

  // --- Test 12: Markup-to-margin table has correct entries ---
  it('returns markup-to-margin reference table with correct data', () => {
    const result = calculateMarkup({
      cost: 50,
      markupPercent: 50,
      calculationMode: 'cost-to-price',
      sellingPrice: 0,
    });
    const table = result.markupToMarginTable as { markup: number; margin: number; sellAt: number }[];
    expect(table.length).toBe(9);

    // Check 50% markup = 33.33% margin, sell $1 at $1.50
    const row50 = table.find((r) => r.markup === 50);
    expect(row50).toBeDefined();
    expect(row50!.margin).toBeCloseTo(33.33, 1);
    expect(row50!.sellAt).toBe(1.5);

    // Check 100% markup = 50% margin, sell $1 at $2.00
    const row100 = table.find((r) => r.markup === 100);
    expect(row100).toBeDefined();
    expect(row100!.margin).toBe(50);
    expect(row100!.sellAt).toBe(2);
  });

  // --- Test 13: Price-to-markup with zero cost returns 0 ---
  it('returns 0% markup when cost is zero in price-to-markup mode', () => {
    const result = calculateMarkup({
      cost: 0,
      markupPercent: 0,
      calculationMode: 'price-to-markup',
      sellingPrice: 100,
    });
    expect(result.markupPercent).toBe(0);
  });

  // --- Test 14: Missing inputs default safely ---
  it('handles missing inputs with safe defaults', () => {
    const result = calculateMarkup({});
    expect(result.sellingPrice).toBe(0);
    expect(result.grossProfit).toBe(0);
    expect(result.markupPercent).toBe(0);
    expect(result.marginPercent).toBe(0);
  });

  // --- Test 15: Margin and markup consistency check ---
  it('ensures margin% = markup% / (100 + markup%) * 100', () => {
    const result = calculateMarkup({
      cost: 200,
      markupPercent: 75,
      calculationMode: 'cost-to-price',
      sellingPrice: 0,
    });
    // 75% markup -> margin = 75 / 175 * 100 = 42.86%
    const expectedMargin = Math.round((75 / 175) * 10000) / 100;
    expect(result.marginPercent).toBeCloseTo(expectedMargin, 1);
    expect(result.sellingPrice).toBe(350);
    expect(result.grossProfit).toBe(150);
  });
});
