import { calculateCircle } from '@/lib/formulas/math/circle';

describe('calculateCircle', () => {
  // ─── From Radius Tests ───

  it('computes circle properties from radius = 5', () => {
    const result = calculateCircle({ mode: 'from-radius', value: 5 });
    expect(result.radius).toBe(5);
    expect(result.diameter).toBe(10);
    expect(result.circumference).toBeCloseTo(31.415927, 4);
    expect(result.area).toBeCloseTo(78.539816, 4);
  });

  it('computes unit circle from radius = 1', () => {
    const result = calculateCircle({ mode: 'from-radius', value: 1 });
    expect(result.radius).toBe(1);
    expect(result.diameter).toBe(2);
    expect(result.circumference).toBeCloseTo(2 * Math.PI, 4);
    expect(result.area).toBeCloseTo(Math.PI, 4);
  });

  it('handles decimal radius of 2.5', () => {
    const result = calculateCircle({ mode: 'from-radius', value: 2.5 });
    expect(result.radius).toBe(2.5);
    expect(result.diameter).toBe(5);
    expect(result.circumference).toBeCloseTo(2 * Math.PI * 2.5, 4);
    expect(result.area).toBeCloseTo(Math.PI * 2.5 * 2.5, 4);
  });

  // ─── From Diameter Tests ───

  it('computes circle properties from diameter = 10', () => {
    const result = calculateCircle({ mode: 'from-diameter', value: 10 });
    expect(result.radius).toBe(5);
    expect(result.diameter).toBe(10);
    expect(result.circumference).toBeCloseTo(31.415927, 4);
    expect(result.area).toBeCloseTo(78.539816, 4);
  });

  // ─── From Area Tests ───

  it('computes circle properties from area = 100', () => {
    const result = calculateCircle({ mode: 'from-area', value: 100 });
    const expectedRadius = Math.sqrt(100 / Math.PI);
    expect(result.radius).toBeCloseTo(expectedRadius, 4);
    expect(result.diameter).toBeCloseTo(2 * expectedRadius, 4);
    expect(result.circumference).toBeCloseTo(2 * Math.PI * expectedRadius, 4);
    expect(result.area).toBeCloseTo(100, 4);
  });

  it('computes radius = 1 from area = π', () => {
    const result = calculateCircle({ mode: 'from-area', value: Math.PI });
    expect(result.radius).toBeCloseTo(1, 4);
    expect(result.diameter).toBeCloseTo(2, 4);
    expect(result.circumference).toBeCloseTo(2 * Math.PI, 4);
    expect(result.area).toBeCloseTo(Math.PI, 4);
  });

  // ─── From Circumference Tests ───

  it('computes circle properties from circumference ≈ 31.4159', () => {
    const result = calculateCircle({ mode: 'from-circumference', value: 2 * Math.PI * 5 });
    expect(result.radius).toBeCloseTo(5, 4);
    expect(result.diameter).toBeCloseTo(10, 4);
    expect(result.circumference).toBeCloseTo(2 * Math.PI * 5, 4);
    expect(result.area).toBeCloseTo(Math.PI * 25, 4);
  });

  it('computes radius = 1 from circumference = 2π', () => {
    const result = calculateCircle({ mode: 'from-circumference', value: 2 * Math.PI });
    expect(result.radius).toBeCloseTo(1, 4);
    expect(result.diameter).toBeCloseTo(2, 4);
    expect(result.area).toBeCloseTo(Math.PI, 4);
  });

  // ─── Edge Cases ───

  it('returns all zeros when value is 0', () => {
    const result = calculateCircle({ mode: 'from-radius', value: 0 });
    expect(result.radius).toBe(0);
    expect(result.diameter).toBe(0);
    expect(result.circumference).toBe(0);
    expect(result.area).toBe(0);
  });

  it('handles negative value by using absolute value', () => {
    const result = calculateCircle({ mode: 'from-radius', value: -5 });
    expect(result.radius).toBe(5);
    expect(result.diameter).toBe(10);
    expect(result.circumference).toBeCloseTo(31.415927, 4);
    expect(result.area).toBeCloseTo(78.539816, 4);
  });

  it('handles very large radius (1000000)', () => {
    const result = calculateCircle({ mode: 'from-radius', value: 1000000 });
    expect(result.radius).toBe(1000000);
    expect(result.diameter).toBe(2000000);
    expect(result.circumference).toBeCloseTo(2 * Math.PI * 1000000, -1);
    expect(result.area).toBeCloseTo(Math.PI * 1e12, -1);
  });

  it('handles very small radius (0.001)', () => {
    const result = calculateCircle({ mode: 'from-radius', value: 0.001 });
    expect(result.radius).toBeCloseTo(0.001, 6);
    expect(result.diameter).toBeCloseTo(0.002, 6);
    expect(result.circumference).toBeCloseTo(2 * Math.PI * 0.001, 6);
    expect(result.area).toBeCloseTo(Math.PI * 0.000001, 6);
  });

  it('defaults to from-radius mode when mode is not specified', () => {
    const result = calculateCircle({ value: 5 });
    expect(result.radius).toBe(5);
    expect(result.diameter).toBe(10);
  });

  it('throws on invalid value (NaN)', () => {
    expect(() => calculateCircle({ mode: 'from-radius', value: 'abc' })).toThrow('Value must be a valid number');
  });
});
