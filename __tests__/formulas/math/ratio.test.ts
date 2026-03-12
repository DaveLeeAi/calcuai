import { calculateRatio, gcd } from '@/lib/formulas/math/ratio';

// ═══════════════════════════════════════════════════════
// GCD helper tests
// ═══════════════════════════════════════════════════════

describe('gcd (ratio module)', () => {
  it('computes GCD of two positive integers', () => {
    expect(gcd(12, 8)).toBe(4);
    expect(gcd(15, 20)).toBe(5);
    expect(gcd(100, 75)).toBe(25);
  });

  it('handles coprime numbers (GCD = 1)', () => {
    expect(gcd(17, 5)).toBe(1);
    expect(gcd(7, 13)).toBe(1);
  });

  it('handles zero', () => {
    expect(gcd(0, 5)).toBe(5);
    expect(gcd(7, 0)).toBe(7);
  });

  it('handles negative numbers', () => {
    expect(gcd(-12, 8)).toBe(4);
    expect(gcd(12, -8)).toBe(4);
    expect(gcd(-12, -8)).toBe(4);
  });
});

// ═══════════════════════════════════════════════════════
// Simplify mode tests
// ═══════════════════════════════════════════════════════

describe('calculateRatio — simplify mode', () => {
  it('simplifies 15:20 to 3:4', () => {
    const result = calculateRatio({ mode: 'simplify', valueA: 15, valueB: 20 });
    expect(result.ratioA).toBe(3);
    expect(result.ratioB).toBe(4);
    expect(result.ratioString).toBe('3:4');
    expect(result.gcdUsed).toBe(5);
    expect(result.decimal).toBeCloseTo(0.75, 6);
  });

  it('returns already simplified ratio unchanged: 3:4', () => {
    const result = calculateRatio({ mode: 'simplify', valueA: 3, valueB: 4 });
    expect(result.ratioA).toBe(3);
    expect(result.ratioB).toBe(4);
    expect(result.ratioString).toBe('3:4');
    expect(result.gcdUsed).toBe(1);
  });

  it('simplifies large numbers: 250:150 → 5:3', () => {
    const result = calculateRatio({ mode: 'simplify', valueA: 250, valueB: 150 });
    expect(result.ratioA).toBe(5);
    expect(result.ratioB).toBe(3);
    expect(result.ratioString).toBe('5:3');
    expect(result.gcdUsed).toBe(50);
  });

  it('simplifies equal values to 1:1', () => {
    const result = calculateRatio({ mode: 'simplify', valueA: 42, valueB: 42 });
    expect(result.ratioA).toBe(1);
    expect(result.ratioB).toBe(1);
    expect(result.ratioString).toBe('1:1');
    expect(result.gcdUsed).toBe(42);
  });

  it('handles negative values: -6:3 → -2:1', () => {
    const result = calculateRatio({ mode: 'simplify', valueA: -6, valueB: 3 });
    expect(result.ratioA).toBe(-2);
    expect(result.ratioB).toBe(1);
    expect(result.ratioString).toBe('-2:1');
  });

  it('handles zero first value: 0:5 → 0:1', () => {
    const result = calculateRatio({ mode: 'simplify', valueA: 0, valueB: 5 });
    expect(result.ratioA).toBe(0);
    expect(result.ratioB).toBe(1);
    expect(result.ratioString).toBe('0:1');
  });

  it('handles zero second value: 5:0 → 1:0', () => {
    const result = calculateRatio({ mode: 'simplify', valueA: 5, valueB: 0 });
    expect(result.ratioA).toBe(1);
    expect(result.ratioB).toBe(0);
    expect(result.ratioString).toBe('1:0');
  });

  it('handles both values zero: 0:0', () => {
    const result = calculateRatio({ mode: 'simplify', valueA: 0, valueB: 0 });
    expect(result.ratioA).toBe(0);
    expect(result.ratioB).toBe(0);
    expect(result.ratioString).toBe('0:0');
  });

  it('simplifies very large coprime numbers (GCD = 1)', () => {
    const result = calculateRatio({ mode: 'simplify', valueA: 97, valueB: 89 });
    expect(result.ratioA).toBe(97);
    expect(result.ratioB).toBe(89);
    expect(result.gcdUsed).toBe(1);
  });
});

// ═══════════════════════════════════════════════════════
// Solve mode tests
// ═══════════════════════════════════════════════════════

describe('calculateRatio — solve mode', () => {
  it('solves 3:4 = 6:x → x = 8', () => {
    const result = calculateRatio({ mode: 'solve', valueA: 3, valueB: 4, valueC: 6 });
    expect(result.missingValue).toBe(8);
  });

  it('solves 1:50000 = 8.5:x → x = 425000', () => {
    const result = calculateRatio({ mode: 'solve', valueA: 1, valueB: 50000, valueC: 8.5 });
    expect(result.missingValue).toBe(425000);
  });

  it('solves 5:8 = 15:x → x = 24', () => {
    const result = calculateRatio({ mode: 'solve', valueA: 5, valueB: 8, valueC: 15 });
    expect(result.missingValue).toBe(24);
  });

  it('handles zero valueA (division by zero)', () => {
    const result = calculateRatio({ mode: 'solve', valueA: 0, valueB: 4, valueC: 6 });
    expect(result.missingValue).toBe(0);
    const steps = result.stepByStep as Array<{ label: string; value: string }>;
    expect(steps.some((s) => s.label === 'Error')).toBe(true);
  });

  it('handles zero valueC → x = 0', () => {
    const result = calculateRatio({ mode: 'solve', valueA: 3, valueB: 4, valueC: 0 });
    expect(result.missingValue).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════
// Scale mode tests
// ═══════════════════════════════════════════════════════

describe('calculateRatio — scale mode', () => {
  it('scales 2:3 by factor 5 → 10:15', () => {
    const result = calculateRatio({ mode: 'scale', valueA: 2, valueB: 3, scaleFactor: 5 });
    expect(result.scaledA).toBe(10);
    expect(result.scaledB).toBe(15);
  });

  it('scales 1:4 by decimal factor 2.5 → 2.5:10', () => {
    const result = calculateRatio({ mode: 'scale', valueA: 1, valueB: 4, scaleFactor: 2.5 });
    expect(result.scaledA).toBeCloseTo(2.5, 4);
    expect(result.scaledB).toBeCloseTo(10, 4);
  });

  it('scales with factor of 1 (identity)', () => {
    const result = calculateRatio({ mode: 'scale', valueA: 7, valueB: 3, scaleFactor: 1 });
    expect(result.scaledA).toBe(7);
    expect(result.scaledB).toBe(3);
  });

  it('defaults to scale factor 1 when not provided', () => {
    const result = calculateRatio({ mode: 'scale', valueA: 7, valueB: 3 });
    expect(result.scaledA).toBe(7);
    expect(result.scaledB).toBe(3);
  });
});

// ═══════════════════════════════════════════════════════
// Edge case and default behavior tests
// ═══════════════════════════════════════════════════════

describe('calculateRatio — defaults and edge cases', () => {
  it('defaults to simplify mode when mode is not specified', () => {
    const result = calculateRatio({ valueA: 10, valueB: 4 });
    expect(result.ratioString).toBe('5:2');
  });

  it('produces step-by-step output', () => {
    const result = calculateRatio({ mode: 'simplify', valueA: 24, valueB: 36 });
    const steps = result.stepByStep as Array<{ label: string; value: string }>;
    expect(steps.length).toBeGreaterThanOrEqual(3);
    expect(steps[0].label).toBe('Input ratio');
    expect(steps[0].value).toBe('24:36');
  });
});
