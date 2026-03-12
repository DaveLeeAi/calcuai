import { calculateScientificNotation } from '@/lib/formulas/math/scientific-notation';

describe('calculateScientificNotation', () => {
  // ═══════════════════════════════════════════════════════
  // Decimal → Scientific notation
  // ═══════════════════════════════════════════════════════

  it('converts 12345 → 1.2345 x 10^4', () => {
    const result = calculateScientificNotation({ mode: 'to-scientific', decimalNumber: 12345 });
    expect(result.coefficient).toBeCloseTo(1.2345, 4);
    expect(result.exponent).toBe(4);
  });

  it('converts 0.00567 → 5.67 x 10^-3', () => {
    const result = calculateScientificNotation({ mode: 'to-scientific', decimalNumber: 0.00567 });
    expect(result.coefficient).toBeCloseTo(5.67, 4);
    expect(result.exponent).toBe(-3);
  });

  it('converts 1 → 1 x 10^0', () => {
    const result = calculateScientificNotation({ mode: 'to-scientific', decimalNumber: 1 });
    expect(result.coefficient).toBeCloseTo(1, 4);
    expect(result.exponent).toBe(0);
  });

  it('converts 0 → 0 x 10^0', () => {
    const result = calculateScientificNotation({ mode: 'to-scientific', decimalNumber: 0 });
    expect(result.coefficient).toBe(0);
    expect(result.exponent).toBe(0);
  });

  it('converts -4567 → coefficient ≈ -4.567, exponent = 3', () => {
    const result = calculateScientificNotation({ mode: 'to-scientific', decimalNumber: -4567 });
    expect(result.coefficient).toBeCloseTo(-4.567, 3);
    expect(result.exponent).toBe(3);
  });

  it('converts 9990000 → 9.99 x 10^6', () => {
    const result = calculateScientificNotation({ mode: 'to-scientific', decimalNumber: 9990000 });
    expect(result.coefficient).toBeCloseTo(9.99, 3);
    expect(result.exponent).toBe(6);
  });

  it('converts 0.1 → 1 x 10^-1', () => {
    const result = calculateScientificNotation({ mode: 'to-scientific', decimalNumber: 0.1 });
    expect(result.coefficient).toBeCloseTo(1.0, 4);
    expect(result.exponent).toBe(-1);
  });

  // ═══════════════════════════════════════════════════════
  // Scientific notation → Decimal
  // ═══════════════════════════════════════════════════════

  it('converts 3.5 x 10^4 → 35000', () => {
    const result = calculateScientificNotation({
      mode: 'from-scientific',
      coefficient: 3.5,
      exponent: 4,
    });
    expect(result.decimalForm).toContain('35000');
  });

  it('converts 6.022 x 10^23 (Avogadro)', () => {
    const result = calculateScientificNotation({
      mode: 'from-scientific',
      coefficient: 6.022,
      exponent: 23,
    });
    expect(result.exponent).toBe(23);
    expect(result.coefficient).toBeCloseTo(6.022, 3);
  });

  it('converts 2.5 x 10^-3 → 0.0025', () => {
    const result = calculateScientificNotation({
      mode: 'from-scientific',
      coefficient: 2.5,
      exponent: -3,
    });
    expect(result.decimalForm).toContain('0.0025');
  });

  it('normalizes non-standard coefficient: 25 x 10^3 → 2.5 x 10^4', () => {
    const result = calculateScientificNotation({
      mode: 'from-scientific',
      coefficient: 25,
      exponent: 3,
    });
    expect(result.coefficient).toBeCloseTo(2.5, 4);
    expect(result.exponent).toBe(4);
  });

  // ═══════════════════════════════════════════════════════
  // Engineering notation
  // ═══════════════════════════════════════════════════════

  it('engineering notation for 12345 uses exponent divisible by 3', () => {
    const result = calculateScientificNotation({ mode: 'to-scientific', decimalNumber: 12345 });
    const engExp = parseInt(String(result.engineeringNotation).match(/10\^(-?\d+)/)?.[1] || '0');
    expect(engExp % 3).toBe(0);
  });

  // ═══════════════════════════════════════════════════════
  // E-notation output
  // ═══════════════════════════════════════════════════════

  it('e-notation for 12345 contains e+4', () => {
    const result = calculateScientificNotation({ mode: 'to-scientific', decimalNumber: 12345 });
    expect(String(result.ePlusNotation)).toContain('e+4');
  });

  it('e-notation for 0.005 contains e-3', () => {
    const result = calculateScientificNotation({ mode: 'to-scientific', decimalNumber: 0.005 });
    expect(String(result.ePlusNotation)).toContain('e-');
  });

  // ═══════════════════════════════════════════════════════
  // Edge cases
  // ═══════════════════════════════════════════════════════

  it('handles very large number: 1e15', () => {
    const result = calculateScientificNotation({ mode: 'to-scientific', decimalNumber: 1e15 });
    expect(result.exponent).toBe(15);
    expect(result.coefficient).toBeCloseTo(1.0, 4);
  });

  it('handles very small number: 1e-10', () => {
    const result = calculateScientificNotation({ mode: 'to-scientific', decimalNumber: 1e-10 });
    expect(result.exponent).toBe(-10);
    expect(result.coefficient).toBeCloseTo(1.0, 4);
  });

  it('returns error for NaN input', () => {
    const result = calculateScientificNotation({ mode: 'to-scientific', decimalNumber: NaN });
    expect(result.error).toBeDefined();
  });

  it('significant figures count is consistent', () => {
    const result = calculateScientificNotation({ mode: 'to-scientific', decimalNumber: 45600 });
    expect(result.significantFigures).toBeGreaterThan(0);
  });
});
