import { calculateReorderPoint } from '@/lib/formulas/ecommerce/reorder-point';

describe('calculateReorderPoint', () => {
  const base = {
    averageDailySales: 15,
    leadTimeDays: 30,
    safetyStockDays: 14,
    currentInventory: 750,
    unitCost: 8,
    targetStockDays: 60,
  };

  it('reorder point equals lead time demand plus safety stock', () => {
    const result = calculateReorderPoint(base);
    // Reorder Point = 15 × 30 + 15 × 14 = 450 + 210 = 660
    expect(result.reorderPoint).toBe(660);
  });

  it('safety stock equals daily sales times safety days', () => {
    const result = calculateReorderPoint(base);
    // Safety Stock = 15 × 14 = 210
    expect(result.safetyStock).toBe(210);
  });

  it('days of supply equals current inventory divided by daily sales', () => {
    const result = calculateReorderPoint(base);
    // Days of Supply = 750 / 15 = 50
    expect(result.daysOfSupply).toBeCloseTo(50, 1);
  });

  it('reorder quantity equals daily sales times target days', () => {
    const result = calculateReorderPoint(base);
    // Reorder Qty = 15 × 60 = 900
    expect(result.reorderQuantity).toBe(900);
  });

  it('reorder value equals reorder quantity times unit cost', () => {
    const result = calculateReorderPoint(base);
    // Reorder Value = 900 × $8 = $7,200
    expect(result.reorderValue).toBeCloseTo(7200, 2);
  });

  it('stockout risk is green (healthy) when inventory above reorder point', () => {
    // inventory 750, reorder point 660 → healthy
    const result = calculateReorderPoint(base);
    expect((result.stockoutRisk as string)).toContain('🟢');
  });

  it('stockout risk is yellow when inventory at reorder point', () => {
    const result = calculateReorderPoint({ ...base, currentInventory: 660 });
    expect((result.stockoutRisk as string)).toContain('🟡');
  });

  it('stockout risk is critical when at or below safety stock', () => {
    const result = calculateReorderPoint({ ...base, currentInventory: 100 });
    expect((result.stockoutRisk as string)).toContain('🔴');
  });

  it('longer lead time increases reorder point', () => {
    const short = calculateReorderPoint({ ...base, leadTimeDays: 15 });
    const long = calculateReorderPoint({ ...base, leadTimeDays: 45 });
    expect(long.reorderPoint).toBeGreaterThan(short.reorderPoint as number);
  });

  it('zero safety stock days gives safety stock of zero', () => {
    const result = calculateReorderPoint({ ...base, safetyStockDays: 0 });
    expect(result.safetyStock).toBe(0);
  });

  it('summary has 6 entries', () => {
    const result = calculateReorderPoint(base);
    expect((result.summary as unknown[]).length).toBe(6);
  });

  it('reorder value is zero when unit cost is zero', () => {
    const result = calculateReorderPoint({ ...base, unitCost: 0 });
    expect(result.reorderValue).toBe(0);
  });
});
