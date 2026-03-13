import { calculateInventoryTurnover } from '@/lib/formulas/business/inventory-turnover';

describe('calculateInventoryTurnover', () => {
  // ─── Test 1: Basic turnover ratio ───
  it('calculates inventory turnover ratio', () => {
    const result = calculateInventoryTurnover({
      cogs: 500000,
      beginningInventory: 100000,
      endingInventory: 80000,
    });
    // Avg = (100000 + 80000) / 2 = 90000
    // Turnover = 500000 / 90000 = 5.56
    expect(result.turnoverRatio).toBeCloseTo(5.56, 2);
  });

  // ─── Test 2: Average inventory ───
  it('calculates average inventory', () => {
    const result = calculateInventoryTurnover({
      cogs: 500000,
      beginningInventory: 100000,
      endingInventory: 80000,
    });
    expect(result.averageInventory).toBe(90000);
  });

  // ─── Test 3: Days Sales of Inventory ───
  it('calculates days sales of inventory', () => {
    const result = calculateInventoryTurnover({
      cogs: 500000,
      beginningInventory: 100000,
      endingInventory: 80000,
    });
    // DSI = 365 / 5.56 = ~65.7 days
    expect(result.daysSalesOfInventory).toBeCloseTo(65.7, 0);
  });

  // ─── Test 4: Turns per month ───
  it('calculates inventory turns per month', () => {
    const result = calculateInventoryTurnover({
      cogs: 500000,
      beginningInventory: 100000,
      endingInventory: 80000,
    });
    // 5.56 / 12 = 0.46
    expect(result.inventoryTurnsPerMonth).toBeCloseTo(0.46, 2);
  });

  // ─── Test 5: Equal beginning and ending inventory ───
  it('handles equal beginning and ending inventory', () => {
    const result = calculateInventoryTurnover({
      cogs: 300000,
      beginningInventory: 50000,
      endingInventory: 50000,
    });
    // Avg = 50000; Turnover = 300000/50000 = 6
    expect(result.averageInventory).toBe(50000);
    expect(result.turnoverRatio).toBe(6);
  });

  // ─── Test 6: High turnover ratio ───
  it('calculates high turnover (fast-moving goods)', () => {
    const result = calculateInventoryTurnover({
      cogs: 1000000,
      beginningInventory: 40000,
      endingInventory: 60000,
    });
    // Avg = 50000; Turnover = 1000000/50000 = 20
    expect(result.turnoverRatio).toBe(20);
    // DSI = 365/20 = 18.25 days
    expect(result.daysSalesOfInventory).toBe(18.3);
  });

  // ─── Test 7: Low turnover ratio ───
  it('calculates low turnover (slow-moving goods)', () => {
    const result = calculateInventoryTurnover({
      cogs: 100000,
      beginningInventory: 200000,
      endingInventory: 200000,
    });
    // Avg = 200000; Turnover = 100000/200000 = 0.5
    expect(result.turnoverRatio).toBe(0.5);
    // DSI = 365/0.5 = 730 days
    expect(result.daysSalesOfInventory).toBe(730);
  });

  // ─── Test 8: Zero COGS ───
  it('handles zero COGS', () => {
    const result = calculateInventoryTurnover({
      cogs: 0,
      beginningInventory: 100000,
      endingInventory: 80000,
    });
    expect(result.turnoverRatio).toBe(0);
    expect(result.daysSalesOfInventory).toBe(0);
  });

  // ─── Test 9: Zero inventory ───
  it('handles zero inventory (division by zero)', () => {
    const result = calculateInventoryTurnover({
      cogs: 500000,
      beginningInventory: 0,
      endingInventory: 0,
    });
    expect(result.averageInventory).toBe(0);
    expect(result.turnoverRatio).toBe(0);
    expect(result.daysSalesOfInventory).toBe(0);
  });

  // ─── Test 10: Very large COGS ───
  it('handles very large COGS values', () => {
    const result = calculateInventoryTurnover({
      cogs: 50000000,
      beginningInventory: 5000000,
      endingInventory: 5000000,
    });
    // Turnover = 50M / 5M = 10
    expect(result.turnoverRatio).toBe(10);
    expect(result.daysSalesOfInventory).toBe(36.5);
  });

  // ─── Test 11: String input coercion ───
  it('coerces string inputs to numbers', () => {
    const result = calculateInventoryTurnover({
      cogs: '300000',
      beginningInventory: '50000',
      endingInventory: '50000',
    });
    expect(result.turnoverRatio).toBe(6);
  });

  // ─── Test 12: Missing inputs ───
  it('handles missing inputs gracefully', () => {
    const result = calculateInventoryTurnover({});
    expect(result.turnoverRatio).toBe(0);
    expect(result.averageInventory).toBe(0);
    expect(result.daysSalesOfInventory).toBe(0);
  });

  // ─── Test 13: Grocery store scenario ───
  it('calculates typical grocery store turnover', () => {
    const result = calculateInventoryTurnover({
      cogs: 2000000,
      beginningInventory: 150000,
      endingInventory: 130000,
    });
    // Avg = 140000; Turnover = 2M/140K = 14.29
    expect(result.turnoverRatio).toBeCloseTo(14.29, 2);
    // DSI = 365/14.29 = ~25.5 days
    expect(result.daysSalesOfInventory).toBeCloseTo(25.5, 0);
  });

  // ─── Test 14: Manufacturing scenario ───
  it('calculates typical manufacturing turnover', () => {
    const result = calculateInventoryTurnover({
      cogs: 800000,
      beginningInventory: 250000,
      endingInventory: 350000,
    });
    // Avg = 300000; Turnover = 800000/300000 = 2.67
    expect(result.turnoverRatio).toBeCloseTo(2.67, 2);
  });

  // ─── Test 15: Summary contains expected labels ───
  it('returns summary with expected labels', () => {
    const result = calculateInventoryTurnover({
      cogs: 500000,
      beginningInventory: 100000,
      endingInventory: 80000,
    });
    const summary = result.summary as { label: string; value: number | string }[];
    const labels = summary.map((s) => s.label);
    expect(labels).toContain('Cost of Goods Sold');
    expect(labels).toContain('Beginning Inventory');
    expect(labels).toContain('Ending Inventory');
    expect(labels).toContain('Average Inventory');
    expect(labels).toContain('Turnover Ratio');
    expect(labels).toContain('Days Sales of Inventory');
    expect(labels).toContain('Turns per Month');
  });

  // ─── Test 16: All output fields present ───
  it('returns all expected output fields', () => {
    const result = calculateInventoryTurnover({
      cogs: 500000,
      beginningInventory: 100000,
      endingInventory: 80000,
    });
    expect(result).toHaveProperty('turnoverRatio');
    expect(result).toHaveProperty('averageInventory');
    expect(result).toHaveProperty('daysSalesOfInventory');
    expect(result).toHaveProperty('inventoryTurnsPerMonth');
    expect(result).toHaveProperty('summary');
  });

  // ─── Test 17: Turnover ratio of exactly 1 ───
  it('handles turnover ratio of exactly 1', () => {
    const result = calculateInventoryTurnover({
      cogs: 100000,
      beginningInventory: 100000,
      endingInventory: 100000,
    });
    expect(result.turnoverRatio).toBe(1);
    expect(result.daysSalesOfInventory).toBe(365);
  });

  // ─── Test 18: Very small inventory relative to COGS ───
  it('handles very high turnover ratio', () => {
    const result = calculateInventoryTurnover({
      cogs: 10000000,
      beginningInventory: 10000,
      endingInventory: 10000,
    });
    // Turnover = 10M/10K = 1000
    expect(result.turnoverRatio).toBe(1000);
    // DSI = 365/1000 = 0.4 days
    expect(result.daysSalesOfInventory).toBe(0.4);
  });

  // ─── Test 19: Inventory grew over period ───
  it('handles growing inventory', () => {
    const result = calculateInventoryTurnover({
      cogs: 400000,
      beginningInventory: 50000,
      endingInventory: 150000,
    });
    // Avg = (50000+150000)/2 = 100000
    // Turnover = 400000/100000 = 4
    expect(result.averageInventory).toBe(100000);
    expect(result.turnoverRatio).toBe(4);
  });

  // ─── Test 20: Inventory shrank over period ───
  it('handles shrinking inventory', () => {
    const result = calculateInventoryTurnover({
      cogs: 600000,
      beginningInventory: 200000,
      endingInventory: 50000,
    });
    // Avg = (200000+50000)/2 = 125000
    // Turnover = 600000/125000 = 4.8
    expect(result.averageInventory).toBe(125000);
    expect(result.turnoverRatio).toBe(4.8);
  });

  // ─── Test 21: Negative inputs clamped ───
  it('clamps negative inputs to zero', () => {
    const result = calculateInventoryTurnover({
      cogs: -100000,
      beginningInventory: -50000,
      endingInventory: -50000,
    });
    expect(result.turnoverRatio).toBe(0);
    expect(result.averageInventory).toBe(0);
  });

  // ─── Test 22: Retail benchmark scenario ───
  it('calculates retail industry benchmark scenario', () => {
    const result = calculateInventoryTurnover({
      cogs: 1200000,
      beginningInventory: 180000,
      endingInventory: 220000,
    });
    // Avg = 200000; Turnover = 1.2M/200K = 6
    expect(result.turnoverRatio).toBe(6);
    // DSI = 365/6 = 60.8 days
    expect(result.daysSalesOfInventory).toBeCloseTo(60.8, 1);
    // Monthly = 6/12 = 0.5
    expect(result.inventoryTurnsPerMonth).toBe(0.5);
  });
});
