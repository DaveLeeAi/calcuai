import { calculateTip } from '@/lib/formulas/everyday/tip-calc';

describe('calculateTip', () => {
  // ─── Test 1: Standard 20% tip on $100 bill ───
  it('calculates 20% tip on $100 correctly', () => {
    const result = calculateTip({
      billAmount: 100,
      tipPercentage: 20,
      numberOfPeople: 1,
      roundUp: false,
    });
    expect(result.tipAmount).toBe(20);
    expect(result.totalAmount).toBe(120);
    expect(result.perPersonAmount).toBe(120);
  });

  // ─── Test 2: 15% tip on $85.50 ───
  it('calculates 15% tip on $85.50 correctly', () => {
    const result = calculateTip({
      billAmount: 85.50,
      tipPercentage: 15,
      numberOfPeople: 1,
      roundUp: false,
    });
    // 85.50 × 0.15 = 12.825 → rounded to 12.83
    expect(result.tipAmount).toBeCloseTo(12.83, 2);
    expect(result.totalAmount).toBeCloseTo(98.33, 2);
  });

  // ─── Test 3: 18% tip on $50 ───
  it('calculates 18% tip on $50 correctly', () => {
    const result = calculateTip({
      billAmount: 50,
      tipPercentage: 18,
      numberOfPeople: 1,
      roundUp: false,
    });
    expect(result.tipAmount).toBe(9);
    expect(result.totalAmount).toBe(59);
  });

  // ─── Test 4: 25% tip on $200 ───
  it('calculates 25% tip on $200 correctly', () => {
    const result = calculateTip({
      billAmount: 200,
      tipPercentage: 25,
      numberOfPeople: 1,
      roundUp: false,
    });
    expect(result.tipAmount).toBe(50);
    expect(result.totalAmount).toBe(250);
  });

  // ─── Test 5: Split bill — $100, 20% tip, 4 people ───
  it('splits $100 bill with 20% tip among 4 people', () => {
    const result = calculateTip({
      billAmount: 100,
      tipPercentage: 20,
      numberOfPeople: 4,
      roundUp: false,
    });
    expect(result.tipAmount).toBe(20);
    expect(result.totalAmount).toBe(120);
    expect(result.perPersonAmount).toBe(30);
  });

  // ─── Test 6: Split bill — $85, 18%, 3 people ───
  it('splits $85 bill with 18% tip among 3 people', () => {
    const result = calculateTip({
      billAmount: 85,
      tipPercentage: 18,
      numberOfPeople: 3,
      roundUp: false,
    });
    // Tip: 85 × 0.18 = 15.30, Total: 100.30, Per person: 100.30 / 3 = 33.43
    expect(result.tipAmount).toBeCloseTo(15.30, 2);
    expect(result.totalAmount).toBeCloseTo(100.30, 2);
    expect(result.perPersonAmount).toBeCloseTo(33.43, 2);
  });

  // ─── Test 7: Round up — total already exact dollar ───
  it('handles round up when total is already a whole dollar', () => {
    const result = calculateTip({
      billAmount: 85,
      tipPercentage: 20,
      numberOfPeople: 1,
      roundUp: true,
    });
    // 85 × 0.20 = 17.00, total = 102.00 → ceil(102.00) = 102
    expect(result.totalAmount).toBe(102);
    expect(result.tipAmount).toBe(17);
  });

  // ─── Test 8: Round up — total with cents rounds up ───
  it('rounds up total to next dollar when there are cents', () => {
    const result = calculateTip({
      billAmount: 47.83,
      tipPercentage: 20,
      numberOfPeople: 1,
      roundUp: true,
    });
    // 47.83 × 0.20 = 9.566 → 9.57, total = 57.40 → ceil = 58
    // Recalculated tip: 58 - 47.83 = 10.17
    expect(result.totalAmount).toBe(58);
    expect(result.tipAmount).toBeCloseTo(10.17, 2);
  });

  // ─── Test 9: Zero tip (0%) ───
  it('handles 0% tip correctly', () => {
    const result = calculateTip({
      billAmount: 75,
      tipPercentage: 0,
      numberOfPeople: 1,
      roundUp: false,
    });
    expect(result.tipAmount).toBe(0);
    expect(result.totalAmount).toBe(75);
    expect(result.perPersonAmount).toBe(75);
  });

  // ─── Test 10: 100% tip ───
  it('handles 100% tip correctly', () => {
    const result = calculateTip({
      billAmount: 50,
      tipPercentage: 100,
      numberOfPeople: 1,
      roundUp: false,
    });
    expect(result.tipAmount).toBe(50);
    expect(result.totalAmount).toBe(100);
  });

  // ─── Test 11: Single person — perPerson equals total ───
  it('returns perPerson equal to total when numberOfPeople is 1', () => {
    const result = calculateTip({
      billAmount: 120,
      tipPercentage: 20,
      numberOfPeople: 1,
      roundUp: false,
    });
    expect(result.perPersonAmount).toBe(result.totalAmount);
  });

  // ─── Test 12: Tip breakdown contains standard percentages ───
  it('includes 15%, 18%, 20%, 25% in tip breakdown', () => {
    const result = calculateTip({
      billAmount: 100,
      tipPercentage: 20,
      numberOfPeople: 1,
      roundUp: false,
    });
    const breakdown = result.tipBreakdown as { percentage: number; tipAmount: number; total: number; perPerson: number }[];
    const percentages = breakdown.map((row) => row.percentage);
    expect(percentages).toContain(15);
    expect(percentages).toContain(18);
    expect(percentages).toContain(20);
    expect(percentages).toContain(25);
  });

  // ─── Test 13: Custom percentage appears in breakdown ───
  it('includes custom percentage in breakdown when not standard', () => {
    const result = calculateTip({
      billAmount: 100,
      tipPercentage: 22,
      numberOfPeople: 1,
      roundUp: false,
    });
    const breakdown = result.tipBreakdown as { percentage: number; tipAmount: number; total: number; perPerson: number }[];
    const percentages = breakdown.map((row) => row.percentage);
    expect(percentages).toContain(22);
    // Should still have the standard ones too
    expect(percentages).toContain(15);
    expect(percentages).toContain(18);
    expect(percentages).toContain(20);
    expect(percentages).toContain(25);
    // 5 entries total: 15, 18, 20, 22, 25
    expect(breakdown).toHaveLength(5);
  });

  // ─── Test 14: Very small bill ($1) ───
  it('handles very small bill of $1', () => {
    const result = calculateTip({
      billAmount: 1,
      tipPercentage: 20,
      numberOfPeople: 1,
      roundUp: false,
    });
    expect(result.tipAmount).toBe(0.20);
    expect(result.totalAmount).toBe(1.20);
  });

  // ─── Test 15: Very large bill ($10,000) ───
  it('handles very large bill of $10,000', () => {
    const result = calculateTip({
      billAmount: 10000,
      tipPercentage: 20,
      numberOfPeople: 1,
      roundUp: false,
    });
    expect(result.tipAmount).toBe(2000);
    expect(result.totalAmount).toBe(12000);
  });

  // ─── Test 16: Summary value group contains correct labels ───
  it('returns summary with correct labels', () => {
    const result = calculateTip({
      billAmount: 100,
      tipPercentage: 20,
      numberOfPeople: 2,
      roundUp: false,
    });
    const summary = result.summary as { label: string; value: number }[];
    const labels = summary.map((item) => item.label);
    expect(labels).toContain('Bill Amount');
    expect(labels).toContain('Tip Amount');
    expect(labels).toContain('Total');
    expect(labels).toContain('Per Person');
    expect(labels).toContain('Effective Tip %');
  });

  // ─── Test 17: Standard percentage not duplicated in breakdown ───
  it('does not duplicate standard percentage in breakdown', () => {
    const result = calculateTip({
      billAmount: 100,
      tipPercentage: 18,
      numberOfPeople: 1,
      roundUp: false,
    });
    const breakdown = result.tipBreakdown as { percentage: number; tipAmount: number; total: number; perPerson: number }[];
    // 18 is already standard, so should appear exactly once
    const eighteenRows = breakdown.filter((row) => row.percentage === 18);
    expect(eighteenRows).toHaveLength(1);
    // Total should be 4 entries: 15, 18, 20, 25
    expect(breakdown).toHaveLength(4);
  });

  // ─── Test 18: Breakdown row values are correct ───
  it('calculates correct values in breakdown rows', () => {
    const result = calculateTip({
      billAmount: 200,
      tipPercentage: 20,
      numberOfPeople: 4,
      roundUp: false,
    });
    const breakdown = result.tipBreakdown as { percentage: number; tipAmount: number; total: number; perPerson: number }[];
    const row15 = breakdown.find((r) => r.percentage === 15);
    expect(row15).toBeDefined();
    expect(row15!.tipAmount).toBe(30);
    expect(row15!.total).toBe(230);
    expect(row15!.perPerson).toBe(57.5);

    const row25 = breakdown.find((r) => r.percentage === 25);
    expect(row25).toBeDefined();
    expect(row25!.tipAmount).toBe(50);
    expect(row25!.total).toBe(250);
    expect(row25!.perPerson).toBe(62.5);
  });

  // ─── Test 19: Round up with split bill ───
  it('rounds up and splits correctly', () => {
    const result = calculateTip({
      billAmount: 83.47,
      tipPercentage: 18,
      numberOfPeople: 3,
      roundUp: true,
    });
    // 83.47 × 0.18 = 15.0246 → 15.02, total = 98.49 → ceil = 99
    // Recalculated tip = 99 - 83.47 = 15.53
    // Per person = 99 / 3 = 33
    expect(result.totalAmount).toBe(99);
    expect(result.tipAmount).toBeCloseTo(15.53, 2);
    expect(result.perPersonAmount).toBe(33);
  });

  // ─── Test 20: Effective tip percentage in summary ───
  it('calculates correct effective tip percentage', () => {
    const result = calculateTip({
      billAmount: 100,
      tipPercentage: 20,
      numberOfPeople: 1,
      roundUp: false,
    });
    const summary = result.summary as { label: string; value: number }[];
    const effectivePct = summary.find((s) => s.label === 'Effective Tip %');
    expect(effectivePct).toBeDefined();
    expect(effectivePct!.value).toBe(20);
  });

  // ─── Test 21: Effective tip percentage changes with round up ───
  it('adjusts effective tip percentage when rounding up', () => {
    const result = calculateTip({
      billAmount: 47.83,
      tipPercentage: 20,
      numberOfPeople: 1,
      roundUp: true,
    });
    const summary = result.summary as { label: string; value: number }[];
    const effectivePct = summary.find((s) => s.label === 'Effective Tip %');
    expect(effectivePct).toBeDefined();
    // Tip is 10.17 on 47.83 → 10.17/47.83 = 21.26%
    expect(effectivePct!.value).toBeCloseTo(21.26, 1);
  });

  // ─── Test 22: Zero bill amount ───
  it('handles zero bill amount gracefully', () => {
    const result = calculateTip({
      billAmount: 0,
      tipPercentage: 20,
      numberOfPeople: 2,
      roundUp: false,
    });
    expect(result.tipAmount).toBe(0);
    expect(result.totalAmount).toBe(0);
    expect(result.perPersonAmount).toBe(0);
  });

  // ─── Test 23: Missing inputs use defaults ───
  it('uses defaults for missing inputs', () => {
    const result = calculateTip({});
    expect(result.tipAmount).toBe(0);
    expect(result.totalAmount).toBe(0);
    expect(result.perPersonAmount).toBe(0);
  });

  // ─── Test 24: Breakdown is sorted ascending by percentage ───
  it('sorts breakdown rows in ascending percentage order', () => {
    const result = calculateTip({
      billAmount: 100,
      tipPercentage: 10,
      numberOfPeople: 1,
      roundUp: false,
    });
    const breakdown = result.tipBreakdown as { percentage: number }[];
    for (let i = 1; i < breakdown.length; i++) {
      expect(breakdown[i].percentage).toBeGreaterThan(breakdown[i - 1].percentage);
    }
  });
});
