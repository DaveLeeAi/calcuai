import { calculateSquareRoot } from '@/lib/formulas/math/square-root';

describe('calculateSquareRoot', () => {
  // ═══════════════════════════════════════════════════════
  // Perfect squares
  // ═══════════════════════════════════════════════════════

  it('sqrt(4) = 2 (perfect square)', () => {
    const result = calculateSquareRoot({ number: 4, nthRoot: 2 });
    expect(result.result).toBe(2);
    expect(result.isPerfect).toBe(true);
    expect(result.simplified).toBe('2');
  });

  it('sqrt(144) = 12 (perfect square)', () => {
    const result = calculateSquareRoot({ number: 144, nthRoot: 2 });
    expect(result.result).toBe(12);
    expect(result.isPerfect).toBe(true);
  });

  it('sqrt(1) = 1', () => {
    const result = calculateSquareRoot({ number: 1, nthRoot: 2 });
    expect(result.result).toBe(1);
    expect(result.isPerfect).toBe(true);
  });

  it('sqrt(0) = 0', () => {
    const result = calculateSquareRoot({ number: 0, nthRoot: 2 });
    expect(result.result).toBe(0);
  });

  // ═══════════════════════════════════════════════════════
  // Non-perfect squares with simplification
  // ═══════════════════════════════════════════════════════

  it('sqrt(2) ≈ 1.4142135624', () => {
    const result = calculateSquareRoot({ number: 2, nthRoot: 2 });
    expect(result.result).toBeCloseTo(1.4142135624, 8);
    expect(result.isPerfect).toBe(false);
    expect(result.simplified).toBe('sqrt(2)');
  });

  it('sqrt(50) simplifies to 5*sqrt(2)', () => {
    const result = calculateSquareRoot({ number: 50, nthRoot: 2 });
    expect(result.result).toBeCloseTo(7.0710678118, 8);
    expect(result.isPerfect).toBe(false);
    expect(result.simplified).toBe('5 * sqrt(2)');
  });

  it('sqrt(72) simplifies to 6*sqrt(2)', () => {
    const result = calculateSquareRoot({ number: 72, nthRoot: 2 });
    expect(result.result).toBeCloseTo(8.4852813742, 6);
    expect(result.simplified).toBe('6 * sqrt(2)');
  });

  it('sqrt(48) simplifies to 4*sqrt(3)', () => {
    const result = calculateSquareRoot({ number: 48, nthRoot: 2 });
    expect(result.simplified).toBe('4 * sqrt(3)');
  });

  // ═══════════════════════════════════════════════════════
  // Nth roots
  // ═══════════════════════════════════════════════════════

  it('cube root of 27 = 3', () => {
    const result = calculateSquareRoot({ number: 27, nthRoot: 3 });
    expect(result.result).toBeCloseTo(3, 8);
    expect(result.isPerfect).toBe(true);
  });

  it('cube root of 8 = 2', () => {
    const result = calculateSquareRoot({ number: 8, nthRoot: 3 });
    expect(result.result).toBeCloseTo(2, 8);
    expect(result.isPerfect).toBe(true);
  });

  it('4th root of 16 = 2', () => {
    const result = calculateSquareRoot({ number: 16, nthRoot: 4 });
    expect(result.result).toBeCloseTo(2, 8);
    expect(result.isPerfect).toBe(true);
  });

  it('cube root of 10 ≈ 2.15443', () => {
    const result = calculateSquareRoot({ number: 10, nthRoot: 3 });
    expect(result.result).toBeCloseTo(2.15443, 4);
    expect(result.isPerfect).toBe(false);
  });

  // ═══════════════════════════════════════════════════════
  // Negative numbers
  // ═══════════════════════════════════════════════════════

  it('sqrt(-4) returns error (even root of negative)', () => {
    const result = calculateSquareRoot({ number: -4, nthRoot: 2 });
    expect(result.result).toBeNull();
    expect(result.error).toBeDefined();
  });

  it('cube root of -8 = -2 (odd root of negative)', () => {
    const result = calculateSquareRoot({ number: -8, nthRoot: 3 });
    expect(result.result).toBeCloseTo(-2, 8);
  });

  it('cube root of -27 = -3', () => {
    const result = calculateSquareRoot({ number: -27, nthRoot: 3 });
    expect(result.result).toBeCloseTo(-3, 8);
  });

  // ═══════════════════════════════════════════════════════
  // Additional outputs
  // ═══════════════════════════════════════════════════════

  it('returns squared and cubed values', () => {
    const result = calculateSquareRoot({ number: 5, nthRoot: 2 });
    expect(result.squared).toBe(25);
    expect(result.cubed).toBe(125);
  });

  it('returns rootIndex in output', () => {
    const result = calculateSquareRoot({ number: 16, nthRoot: 4 });
    expect(result.rootIndex).toBe(4);
  });

  it('default nth root is 2 (square root)', () => {
    const result = calculateSquareRoot({ number: 9 });
    expect(result.result).toBe(3);
    expect(result.rootIndex).toBe(2);
  });

  // ═══════════════════════════════════════════════════════
  // Large numbers
  // ═══════════════════════════════════════════════════════

  it('sqrt(1000000) = 1000', () => {
    const result = calculateSquareRoot({ number: 1000000, nthRoot: 2 });
    expect(result.result).toBe(1000);
    expect(result.isPerfect).toBe(true);
  });

  it('sqrt(999999) is not a perfect square', () => {
    const result = calculateSquareRoot({ number: 999999, nthRoot: 2 });
    expect(result.isPerfect).toBe(false);
    expect(result.result).toBeCloseTo(999.9995, 3);
  });
});
