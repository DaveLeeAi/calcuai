import { calculateLogarithm } from '@/lib/formulas/math/logarithm';

describe('calculateLogarithm', () => {
  // ═══════════════════════════════════════════════════════
  // Common Logarithm (base 10)
  // ═══════════════════════════════════════════════════════

  // ─── Test 1: log₁₀(100) = 2 ───
  it('calculates log₁₀(100) = 2', () => {
    const result = calculateLogarithm({
      mode: 'common',
      value: 100,
    });
    expect(result.result).toBeCloseTo(2, 6);
    expect(result.baseUsed).toBeCloseTo(10, 6);
  });

  // ─── Test 2: log₁₀(1000) = 3 ───
  it('calculates log₁₀(1000) = 3', () => {
    const result = calculateLogarithm({
      mode: 'common',
      value: 1000,
    });
    expect(result.result).toBeCloseTo(3, 6);
  });

  // ─── Test 3: log₁₀(1) = 0 ───
  it('calculates log₁₀(1) = 0 (log of 1 is always 0)', () => {
    const result = calculateLogarithm({
      mode: 'common',
      value: 1,
    });
    expect(result.result).toBe(0);
  });

  // ─── Test 4: log₁₀(50) ≈ 1.69897 ───
  it('calculates log₁₀(50) ≈ 1.69897 (fractional result)', () => {
    const result = calculateLogarithm({
      mode: 'common',
      value: 50,
    });
    expect(result.result).toBeCloseTo(1.69897, 4);
  });

  // ═══════════════════════════════════════════════════════
  // Natural Logarithm (base e)
  // ═══════════════════════════════════════════════════════

  // ─── Test 5: ln(e) = 1 ───
  it('calculates ln(e) = 1', () => {
    const result = calculateLogarithm({
      mode: 'natural',
      value: Math.E,
    });
    expect(result.result).toBeCloseTo(1, 6);
  });

  // ─── Test 6: ln(1) = 0 ───
  it('calculates ln(1) = 0', () => {
    const result = calculateLogarithm({
      mode: 'natural',
      value: 1,
    });
    expect(result.result).toBe(0);
  });

  // ═══════════════════════════════════════════════════════
  // Custom Base Logarithm
  // ═══════════════════════════════════════════════════════

  // ─── Test 7: log₂(8) = 3 ───
  it('calculates log₂(8) = 3', () => {
    const result = calculateLogarithm({
      mode: 'custom',
      value: 8,
      base: 2,
    });
    expect(result.result).toBeCloseTo(3, 6);
  });

  // ─── Test 8: log₂(1024) = 10 ───
  it('calculates log₂(1024) = 10', () => {
    const result = calculateLogarithm({
      mode: 'custom',
      value: 1024,
      base: 2,
    });
    expect(result.result).toBeCloseTo(10, 6);
  });

  // ─── Test 9: log₅(125) = 3 ───
  it('calculates log₅(125) = 3', () => {
    const result = calculateLogarithm({
      mode: 'custom',
      value: 125,
      base: 5,
    });
    expect(result.result).toBeCloseTo(3, 6);
  });

  // ─── Test 10: log of 1 in custom base = 0 ───
  it('calculates log₇(1) = 0 (log of 1 is 0 in any base)', () => {
    const result = calculateLogarithm({
      mode: 'custom',
      value: 1,
      base: 7,
    });
    expect(result.result).toBe(0);
  });

  // ═══════════════════════════════════════════════════════
  // Edge Cases
  // ═══════════════════════════════════════════════════════

  // ─── Test 11: log of 0 returns -Infinity ───
  it('returns -Infinity for log of 0', () => {
    const result = calculateLogarithm({
      mode: 'common',
      value: 0,
    });
    expect(result.result).toBe(-Infinity);
    expect(result.antilog).toBe(0);
  });

  // ─── Test 12: log of negative returns NaN ───
  it('returns NaN for log of a negative number', () => {
    const result = calculateLogarithm({
      mode: 'common',
      value: -5,
    });
    expect(result.result).toBeNaN();
    expect(result.error).toBeDefined();
  });

  // ─── Test 13: base 1 is undefined ───
  it('returns NaN for base 1 (undefined — division by zero)', () => {
    const result = calculateLogarithm({
      mode: 'custom',
      value: 100,
      base: 1,
    });
    expect(result.result).toBeNaN();
    expect(result.error).toBeDefined();
  });

  // ─── Test 14: base 0 returns error ───
  it('returns NaN for base 0', () => {
    const result = calculateLogarithm({
      mode: 'custom',
      value: 100,
      base: 0,
    });
    expect(result.result).toBeNaN();
    expect(result.error).toBeDefined();
  });

  // ─── Test 15: antilog verification ───
  it('antilog verification: 10^(log₁₀(500)) ≈ 500', () => {
    const result = calculateLogarithm({
      mode: 'common',
      value: 500,
    });
    expect(result.antilog).toBeCloseTo(500, 4);
  });

  // ─── Test 16: antilog verification for custom base ───
  it('antilog verification: 2^(log₂(1024)) = 1024', () => {
    const result = calculateLogarithm({
      mode: 'custom',
      value: 1024,
      base: 2,
    });
    expect(result.antilog).toBeCloseTo(1024, 4);
  });

  // ─── Test 17: very small positive number ───
  it('handles very small positive number log₁₀(0.001) = -3', () => {
    const result = calculateLogarithm({
      mode: 'common',
      value: 0.001,
    });
    expect(result.result).toBeCloseTo(-3, 6);
  });

  // ─── Test 18: unknown mode throws error ───
  it('throws error for unknown mode', () => {
    expect(() =>
      calculateLogarithm({
        mode: 'invalid',
        value: 100,
      })
    ).toThrow('Unknown logarithm mode');
  });
});
