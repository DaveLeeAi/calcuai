import { calculatePercentage } from '@/lib/formulas/math/percentage';

describe('calculatePercentage', () => {
  // ═══════════════════════════════════════════════════════
  // Mode 1: Percentage of a number (percent-of)
  // ═══════════════════════════════════════════════════════

  // ─── Test 1: Basic percentage of a number ───
  it('calculates 25% of 200 = 50', () => {
    const result = calculatePercentage({
      mode: 'percent-of',
      percentValue: 25,
      baseValue: 200,
    });
    expect(result.result).toBeCloseTo(50, 4);
  });

  // ─── Test 2: 100% of a number equals itself ───
  it('calculates 100% of 450 = 450', () => {
    const result = calculatePercentage({
      mode: 'percent-of',
      percentValue: 100,
      baseValue: 450,
    });
    expect(result.result).toBeCloseTo(450, 4);
  });

  // ─── Test 3: 0% of any number is 0 ───
  it('calculates 0% of 999 = 0', () => {
    const result = calculatePercentage({
      mode: 'percent-of',
      percentValue: 0,
      baseValue: 999,
    });
    expect(result.result).toBe(0);
  });

  // ─── Test 4: Decimal percentage ───
  it('calculates 7.5% of 1250 = 93.75', () => {
    const result = calculatePercentage({
      mode: 'percent-of',
      percentValue: 7.5,
      baseValue: 1250,
    });
    expect(result.result).toBeCloseTo(93.75, 4);
  });

  // ─── Test 5: Large numbers ───
  it('calculates 15% of 1000000 = 150000', () => {
    const result = calculatePercentage({
      mode: 'percent-of',
      percentValue: 15,
      baseValue: 1000000,
    });
    expect(result.result).toBeCloseTo(150000, 4);
  });

  // ─── Test 6: Percentage greater than 100% ───
  it('calculates 250% of 40 = 100', () => {
    const result = calculatePercentage({
      mode: 'percent-of',
      percentValue: 250,
      baseValue: 40,
    });
    expect(result.result).toBeCloseTo(100, 4);
  });

  // ─── Test 7: Negative base value ───
  it('calculates 20% of -500 = -100', () => {
    const result = calculatePercentage({
      mode: 'percent-of',
      percentValue: 20,
      baseValue: -500,
    });
    expect(result.result).toBeCloseTo(-100, 4);
  });

  // ═══════════════════════════════════════════════════════
  // Mode 2: Percentage change (percent-change)
  // ═══════════════════════════════════════════════════════

  // ─── Test 8: Positive percentage change (increase) ───
  it('calculates percentage change from 80 to 100 = 25%', () => {
    const result = calculatePercentage({
      mode: 'percent-change',
      originalValue: 80,
      newValue: 100,
    });
    expect(result.percentChange).toBeCloseTo(25, 4);
    expect(result.absoluteChange).toBeCloseTo(20, 4);
  });

  // ─── Test 9: Negative percentage change (decrease) ───
  it('calculates percentage change from 100 to 75 = -25%', () => {
    const result = calculatePercentage({
      mode: 'percent-change',
      originalValue: 100,
      newValue: 75,
    });
    expect(result.percentChange).toBeCloseTo(-25, 4);
    expect(result.absoluteChange).toBeCloseTo(-25, 4);
  });

  // ─── Test 10: Same values produce 0% change ───
  it('calculates percentage change from 50 to 50 = 0%', () => {
    const result = calculatePercentage({
      mode: 'percent-change',
      originalValue: 50,
      newValue: 50,
    });
    expect(result.percentChange).toBe(0);
    expect(result.absoluteChange).toBe(0);
  });

  // ─── Test 11: Zero original value (edge case) ───
  it('handles zero original value returning Infinity', () => {
    const result = calculatePercentage({
      mode: 'percent-change',
      originalValue: 0,
      newValue: 50,
    });
    expect(result.percentChange).toBe(Infinity);
    expect(result.absoluteChange).toBeCloseTo(50, 4);
  });

  // ─── Test 12: Both zero returns 0% ───
  it('handles both values zero returning 0%', () => {
    const result = calculatePercentage({
      mode: 'percent-change',
      originalValue: 0,
      newValue: 0,
    });
    expect(result.percentChange).toBe(0);
    expect(result.absoluteChange).toBe(0);
  });

  // ─── Test 13: Percentage change with negative original ───
  it('calculates percentage change from -50 to -30 = 40%', () => {
    const result = calculatePercentage({
      mode: 'percent-change',
      originalValue: -50,
      newValue: -30,
    });
    // Change = -30 - (-50) = 20; |originalValue| = 50; 20/50 * 100 = 40%
    expect(result.percentChange).toBeCloseTo(40, 4);
    expect(result.absoluteChange).toBeCloseTo(20, 4);
  });

  // ─── Test 14: Large percentage change ───
  it('calculates percentage change from 10 to 1000 = 9900%', () => {
    const result = calculatePercentage({
      mode: 'percent-change',
      originalValue: 10,
      newValue: 1000,
    });
    expect(result.percentChange).toBeCloseTo(9900, 4);
  });

  // ═══════════════════════════════════════════════════════
  // Mode 3: Percentage difference (percent-difference)
  // ═══════════════════════════════════════════════════════

  // ─── Test 15: Basic percentage difference ───
  it('calculates percentage difference between 78 and 92', () => {
    const result = calculatePercentage({
      mode: 'percent-difference',
      value1: 78,
      value2: 92,
    });
    // |78 - 92| = 14; avg = (78 + 92) / 2 = 85; 14 / 85 * 100 = 16.4706%
    expect(result.percentDifference).toBeCloseTo(16.4706, 2);
    expect(result.absoluteDifference).toBeCloseTo(14, 4);
    expect(result.average).toBeCloseTo(85, 4);
  });

  // ─── Test 16: Equal values produce 0% difference ───
  it('calculates percentage difference between equal values = 0%', () => {
    const result = calculatePercentage({
      mode: 'percent-difference',
      value1: 100,
      value2: 100,
    });
    expect(result.percentDifference).toBe(0);
    expect(result.absoluteDifference).toBe(0);
    expect(result.average).toBeCloseTo(100, 4);
  });

  // ─── Test 17: Order independence ───
  it('produces the same percentage difference regardless of input order', () => {
    const result1 = calculatePercentage({
      mode: 'percent-difference',
      value1: 30,
      value2: 50,
    });
    const result2 = calculatePercentage({
      mode: 'percent-difference',
      value1: 50,
      value2: 30,
    });
    expect(result1.percentDifference).toBeCloseTo(result2.percentDifference as number, 4);
    expect(result1.absoluteDifference).toBeCloseTo(result2.absoluteDifference as number, 4);
  });

  // ─── Test 18: Very different values ───
  it('calculates percentage difference between 5 and 500', () => {
    const result = calculatePercentage({
      mode: 'percent-difference',
      value1: 5,
      value2: 500,
    });
    // |5 - 500| = 495; avg = 252.5; 495 / 252.5 * 100 = 196.0396%
    expect(result.percentDifference).toBeCloseTo(196.0396, 2);
    expect(result.absoluteDifference).toBeCloseTo(495, 4);
    expect(result.average).toBeCloseTo(252.5, 4);
  });

  // ─── Test 19: Both values zero ───
  it('handles both values zero in percentage difference', () => {
    const result = calculatePercentage({
      mode: 'percent-difference',
      value1: 0,
      value2: 0,
    });
    expect(result.percentDifference).toBe(0);
    expect(result.absoluteDifference).toBe(0);
    expect(result.average).toBe(0);
  });

  // ─── Test 20: Very small numbers ───
  it('handles very small decimal values', () => {
    const result = calculatePercentage({
      mode: 'percent-of',
      percentValue: 0.001,
      baseValue: 0.001,
    });
    // 0.001% of 0.001 = 0.00000001
    expect(result.result).toBeCloseTo(0.00000001, 10);
  });

  // ─── Test 21: Unknown mode throws error ───
  it('throws error for unknown mode', () => {
    expect(() =>
      calculatePercentage({
        mode: 'invalid-mode',
        percentValue: 10,
        baseValue: 100,
      })
    ).toThrow('Unknown percentage mode');
  });
});
