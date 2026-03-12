import { calculateExponent } from '@/lib/formulas/math/exponents';

// ═══════════════════════════════════════════════════════
// Power mode tests
// ═══════════════════════════════════════════════════════

describe('calculateExponent — power mode', () => {
  // ─── Test 1: Basic power ───
  it('computes 2^10 = 1024', () => {
    const result = calculateExponent({ mode: 'power', base: 2, exponent: 10 });
    expect(result.result).toBe(1024);
  });

  // ─── Test 2: Small power ───
  it('computes 3^4 = 81', () => {
    const result = calculateExponent({ mode: 'power', base: 3, exponent: 4 });
    expect(result.result).toBe(81);
  });

  // ─── Test 3: Zero exponent ───
  it('computes 5^0 = 1', () => {
    const result = calculateExponent({ mode: 'power', base: 5, exponent: 0 });
    expect(result.result).toBe(1);
  });

  // ─── Test 4: 0^0 = 1 by convention ───
  it('computes 0^0 = 1 by convention', () => {
    const result = calculateExponent({ mode: 'power', base: 0, exponent: 0 });
    expect(result.result).toBe(1);
  });

  // ─── Test 5: Exponent of 1 ───
  it('computes 7^1 = 7', () => {
    const result = calculateExponent({ mode: 'power', base: 7, exponent: 1 });
    expect(result.result).toBe(7);
  });

  // ─── Test 6: Negative exponent ───
  it('computes 2^(-3) = 0.125', () => {
    const result = calculateExponent({ mode: 'power', base: 2, exponent: -3 });
    expect(result.result).toBeCloseTo(0.125, 6);
  });

  // ─── Test 7: Fractional exponent ───
  it('computes 8^(1/3) = 2 (cube root of 8)', () => {
    const result = calculateExponent({ mode: 'power', base: 8, exponent: 1 / 3 });
    expect(result.result).toBeCloseTo(2, 4);
  });

  // ─── Test 8: Negative base, even exponent ───
  it('computes (-3)^2 = 9', () => {
    const result = calculateExponent({ mode: 'power', base: -3, exponent: 2 });
    expect(result.result).toBe(9);
  });

  // ─── Test 9: Negative base, odd exponent ───
  it('computes (-2)^3 = -8', () => {
    const result = calculateExponent({ mode: 'power', base: -2, exponent: 3 });
    expect(result.result).toBe(-8);
  });

  // ─── Test 10: Large exponent ───
  it('computes 2^20 = 1048576', () => {
    const result = calculateExponent({ mode: 'power', base: 2, exponent: 20 });
    expect(result.result).toBe(1048576);
  });

  // ─── Test 11: Negative base with fractional exponent → NaN ───
  it('returns NaN for (-4)^(0.5) — even root of negative number', () => {
    const result = calculateExponent({ mode: 'power', base: -4, exponent: 0.5 });
    expect(result.result).toBeNaN();
  });

  // ─── Test 12: 0 to positive power ───
  it('computes 0^5 = 0', () => {
    const result = calculateExponent({ mode: 'power', base: 0, exponent: 5 });
    expect(result.result).toBe(0);
  });

  // ─── Test 13: 0 to negative power → NaN ───
  it('returns NaN for 0^(-2) (division by zero)', () => {
    const result = calculateExponent({ mode: 'power', base: 0, exponent: -2 });
    expect(result.result).toBeNaN();
  });

  // ─── Test 14: 1 to any power ───
  it('computes 1^100 = 1', () => {
    const result = calculateExponent({ mode: 'power', base: 1, exponent: 100 });
    expect(result.result).toBe(1);
  });
});

// ═══════════════════════════════════════════════════════
// Root mode tests
// ═══════════════════════════════════════════════════════

describe('calculateExponent — root mode', () => {
  // ─── Test 15: Square root ───
  it('computes square root of 16 = 4', () => {
    const result = calculateExponent({ mode: 'root', value: 16, rootIndex: 2 });
    expect(result.result).toBeCloseTo(4, 6);
  });

  // ─── Test 16: Cube root ───
  it('computes cube root of 27 = 3', () => {
    const result = calculateExponent({ mode: 'root', value: 27, rootIndex: 3 });
    expect(result.result).toBeCloseTo(3, 6);
  });

  // ─── Test 17: 4th root ───
  it('computes 4th root of 81 = 3', () => {
    const result = calculateExponent({ mode: 'root', value: 81, rootIndex: 4 });
    expect(result.result).toBeCloseTo(3, 6);
  });

  // ─── Test 18: Square root of non-perfect square ───
  it('computes square root of 2 ≈ 1.414214', () => {
    const result = calculateExponent({ mode: 'root', value: 2, rootIndex: 2 });
    expect(result.result).toBeCloseTo(1.414214, 4);
  });

  // ─── Test 19: Even root of negative number → NaN ───
  it('returns NaN for square root of -4', () => {
    const result = calculateExponent({ mode: 'root', value: -4, rootIndex: 2 });
    expect(result.result).toBeNaN();
  });

  // ─── Test 20: Odd root of negative number ───
  it('computes cube root of -8 = -2', () => {
    const result = calculateExponent({ mode: 'root', value: -8, rootIndex: 3 });
    expect(result.result).toBeCloseTo(-2, 6);
  });

  // ─── Test 21: Root of 0 ───
  it('computes square root of 0 = 0', () => {
    const result = calculateExponent({ mode: 'root', value: 0, rootIndex: 2 });
    expect(result.result).toBeCloseTo(0, 6);
  });

  // ─── Test 22: Root of 1 ───
  it('computes any root of 1 = 1', () => {
    const result = calculateExponent({ mode: 'root', value: 1, rootIndex: 7 });
    expect(result.result).toBeCloseTo(1, 6);
  });

  // ─── Test 23: 0th root → NaN ───
  it('returns NaN for 0th root (undefined)', () => {
    const result = calculateExponent({ mode: 'root', value: 8, rootIndex: 0 });
    expect(result.result).toBeNaN();
  });
});

// ═══════════════════════════════════════════════════════
// Step-by-step output verification
// ═══════════════════════════════════════════════════════

describe('calculateExponent — step-by-step output', () => {
  it('produces step-by-step output for power calculation', () => {
    const result = calculateExponent({ mode: 'power', base: 2, exponent: 3 });
    const steps = result.intermediateSteps as Array<{ label: string; value: string }>;
    expect(steps.length).toBeGreaterThanOrEqual(2);
    expect(steps[0].label).toBe('Expression');
    expect(steps[0].value).toBe('2^3');
  });

  it('produces step-by-step output for root calculation', () => {
    const result = calculateExponent({ mode: 'root', value: 27, rootIndex: 3 });
    const steps = result.intermediateSteps as Array<{ label: string; value: string }>;
    expect(steps.length).toBeGreaterThanOrEqual(2);
    expect(steps[0].label).toBe('Expression');
    expect(steps[0].value).toContain('cube root');
  });

  it('defaults to power mode when mode is not specified', () => {
    const result = calculateExponent({ base: 3, exponent: 2 });
    expect(result.result).toBe(9);
  });
});
