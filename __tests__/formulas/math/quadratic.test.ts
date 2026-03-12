import { calculateQuadratic } from '@/lib/formulas/math/quadratic';

describe('calculateQuadratic', () => {
  // ═══════════════════════════════════════════════════════
  // Two Distinct Real Roots (discriminant > 0)
  // ═══════════════════════════════════════════════════════

  // ─── Test 1: x² − 5x + 6 = 0 → x = 3, x = 2 ───
  it('solves x² − 5x + 6 = 0 → x = 3 and x = 2', () => {
    const result = calculateQuadratic({ a: 1, b: -5, c: 6 });
    expect(result.x1).toBeCloseTo(3, 6);
    expect(result.x2).toBeCloseTo(2, 6);
    expect(result.discriminant).toBeCloseTo(1, 6);
    expect(result.rootType).toBe('two distinct real roots');
  });

  // ─── Test 2: 2x² − 7x + 3 = 0 → x = 3, x = 0.5 ───
  it('solves 2x² − 7x + 3 = 0 → x = 3 and x = 0.5', () => {
    const result = calculateQuadratic({ a: 2, b: -7, c: 3 });
    expect(result.x1).toBeCloseTo(3, 6);
    expect(result.x2).toBeCloseTo(0.5, 6);
    expect(result.discriminant).toBeCloseTo(25, 6);
    expect(result.rootType).toBe('two distinct real roots');
  });

  // ─── Test 3: x² − 2x − 8 = 0 → x = 4, x = -2 ───
  it('solves x² − 2x − 8 = 0 → x = 4 and x = -2', () => {
    const result = calculateQuadratic({ a: 1, b: -2, c: -8 });
    expect(result.x1).toBeCloseTo(4, 6);
    expect(result.x2).toBeCloseTo(-2, 6);
    expect(result.discriminant).toBeCloseTo(36, 6);
  });

  // ─── Test 4: c = 0 case: x² − 3x = 0 → x(x − 3) = 0 → x = 3, x = 0 ───
  it('solves x² − 3x = 0 → x = 3 and x = 0', () => {
    const result = calculateQuadratic({ a: 1, b: -3, c: 0 });
    expect(result.x1).toBeCloseTo(3, 6);
    expect(result.x2).toBeCloseTo(0, 6);
  });

  // ─── Test 5: b = 0 case: x² − 9 = 0 → x = ±3 ───
  it('solves x² − 9 = 0 → x = 3 and x = -3', () => {
    const result = calculateQuadratic({ a: 1, b: 0, c: -9 });
    expect(result.x1).toBeCloseTo(3, 6);
    expect(result.x2).toBeCloseTo(-3, 6);
  });

  // ═══════════════════════════════════════════════════════
  // One Repeated Real Root (discriminant = 0)
  // ═══════════════════════════════════════════════════════

  // ─── Test 6: x² − 4x + 4 = 0 → x = 2 (repeated) ───
  it('solves x² − 4x + 4 = 0 → x = 2 (one repeated root)', () => {
    const result = calculateQuadratic({ a: 1, b: -4, c: 4 });
    expect(result.x1).toBeCloseTo(2, 6);
    expect(result.x2).toBeCloseTo(2, 6);
    expect(result.discriminant).toBe(0);
    expect(result.rootType).toBe('one repeated real root');
  });

  // ═══════════════════════════════════════════════════════
  // Complex Roots (discriminant < 0)
  // ═══════════════════════════════════════════════════════

  // ─── Test 7: x² + 1 = 0 → x = ±i ───
  it('solves x² + 1 = 0 → complex roots ±i', () => {
    const result = calculateQuadratic({ a: 1, b: 0, c: 1 });
    expect(result.discriminant).toBeCloseTo(-4, 6);
    expect(result.rootType).toBe('two complex conjugate roots');
    expect(result.realPart).toBeCloseTo(0, 6);
    expect(result.imaginaryPart).toBeCloseTo(1, 6);
  });

  // ─── Test 8: x² + 2x + 5 = 0 → x = -1 ± 2i ───
  it('solves x² + 2x + 5 = 0 → x = -1 ± 2i', () => {
    const result = calculateQuadratic({ a: 1, b: 2, c: 5 });
    expect(result.discriminant).toBeCloseTo(-16, 6);
    expect(result.rootType).toBe('two complex conjugate roots');
    expect(result.realPart).toBeCloseTo(-1, 6);
    expect(result.imaginaryPart).toBeCloseTo(2, 6);
  });

  // ═══════════════════════════════════════════════════════
  // Linear Case (a = 0)
  // ═══════════════════════════════════════════════════════

  // ─── Test 9: a = 0 → 5x + 10 = 0 → x = -2 ───
  it('solves linear equation 5x + 10 = 0 → x = -2 when a = 0', () => {
    const result = calculateQuadratic({ a: 0, b: 5, c: 10 });
    expect(result.x1).toBeCloseTo(-2, 6);
    expect(result.rootType).toBe('linear (one solution)');
    expect(result.isLinear).toBe(true);
  });

  // ─── Test 10: a = 0, b = 0 → contradiction or identity ───
  it('handles a = 0, b = 0, c = 5 → no solution (contradiction)', () => {
    const result = calculateQuadratic({ a: 0, b: 0, c: 5 });
    expect(result.rootType).toContain('no solution');
    expect(result.isLinear).toBe(true);
  });

  // ─── Test 11: a = 0, b = 0, c = 0 → infinite solutions ───
  it('handles a = 0, b = 0, c = 0 → infinite solutions', () => {
    const result = calculateQuadratic({ a: 0, b: 0, c: 0 });
    expect(result.rootType).toContain('identity');
    expect(result.isLinear).toBe(true);
  });

  // ═══════════════════════════════════════════════════════
  // Vertex Calculations
  // ═══════════════════════════════════════════════════════

  // ─── Test 12: Vertex of x² − 5x + 6 ───
  it('calculates vertex of x² − 5x + 6 at (2.5, -0.25)', () => {
    const result = calculateQuadratic({ a: 1, b: -5, c: 6 });
    expect(result.vertexX).toBeCloseTo(2.5, 6);
    expect(result.vertexY).toBeCloseTo(-0.25, 6);
    expect(result.axisOfSymmetry).toBeCloseTo(2.5, 6);
  });

  // ─── Test 13: Vertex of -x² + 4x − 3 ───
  it('calculates vertex of -x² + 4x − 3 at (2, 1)', () => {
    const result = calculateQuadratic({ a: -1, b: 4, c: -3 });
    expect(result.vertexX).toBeCloseTo(2, 6);
    expect(result.vertexY).toBeCloseTo(1, 6);
  });

  // ═══════════════════════════════════════════════════════
  // Additional Edge Cases
  // ═══════════════════════════════════════════════════════

  // ─── Test 14: Large coefficients ───
  it('handles large coefficients: 100x² − 500x + 600 = 0', () => {
    const result = calculateQuadratic({ a: 100, b: -500, c: 600 });
    expect(result.x1).toBeCloseTo(3, 6);
    expect(result.x2).toBeCloseTo(2, 6);
    expect(result.discriminant).toBeCloseTo(10000, 0);
  });

  // ─── Test 15: Fractional coefficients ───
  it('handles fractional coefficients: 0.5x² − 1.5x + 1 = 0', () => {
    const result = calculateQuadratic({ a: 0.5, b: -1.5, c: 1 });
    expect(result.x1).toBeCloseTo(2, 6);
    expect(result.x2).toBeCloseTo(1, 6);
    expect(result.discriminant).toBeCloseTo(0.25, 6);
  });

  // ─── Test 16: Negative leading coefficient ───
  it('handles negative a: -x² + 5x − 6 = 0 → x = 2, x = 3', () => {
    const result = calculateQuadratic({ a: -1, b: 5, c: -6 });
    // x = (-5 ± √(25-24)) / (-2) = (-5 ± 1) / (-2)
    // x₁ = (-5 + 1) / (-2) = 2, x₂ = (-5 - 1) / (-2) = 3
    expect(result.x1).toBeCloseTo(2, 6);
    expect(result.x2).toBeCloseTo(3, 6);
  });
});
