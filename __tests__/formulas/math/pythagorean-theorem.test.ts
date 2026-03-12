import { calculatePythagorean } from '@/lib/formulas/math/pythagorean-theorem';

describe('calculatePythagorean', () => {
  // ═══════════════════════════════════════════════════════
  // Classic right triangles — find hypotenuse
  // ═══════════════════════════════════════════════════════

  it('3-4-5 triangle: a=3, b=4 → c=5', () => {
    const result = calculatePythagorean({ mode: 'find-c', sideA: 3, sideB: 4 });
    expect(result.hypotenuse).toBe(5);
    expect(result.isValid).toBe(true);
  });

  it('5-12-13 triangle: a=5, b=12 → c=13', () => {
    const result = calculatePythagorean({ mode: 'find-c', sideA: 5, sideB: 12 });
    expect(result.hypotenuse).toBe(13);
  });

  it('8-15-17 triangle: a=8, b=15 → c=17', () => {
    const result = calculatePythagorean({ mode: 'find-c', sideA: 8, sideB: 15 });
    expect(result.hypotenuse).toBe(17);
  });

  it('7-24-25 triangle: a=7, b=24 → c=25', () => {
    const result = calculatePythagorean({ mode: 'find-c', sideA: 7, sideB: 24 });
    expect(result.hypotenuse).toBe(25);
  });

  it('a=1, b=1 → c = sqrt(2) ≈ 1.41421', () => {
    const result = calculatePythagorean({ mode: 'find-c', sideA: 1, sideB: 1 });
    expect(result.hypotenuse).toBeCloseTo(1.41421, 4);
  });

  // ═══════════════════════════════════════════════════════
  // Find missing leg
  // ═══════════════════════════════════════════════════════

  it('find-a: b=4, c=5 → a=3', () => {
    const result = calculatePythagorean({ mode: 'find-a', sideB: 4, hypotenuse: 5 });
    expect(result.sideA).toBeCloseTo(3, 8);
  });

  it('find-b: a=5, c=13 → b=12', () => {
    const result = calculatePythagorean({ mode: 'find-b', sideA: 5, hypotenuse: 13 });
    expect(result.sideB).toBeCloseTo(12, 8);
  });

  it('find-a: b=24, c=25 → a=7', () => {
    const result = calculatePythagorean({ mode: 'find-a', sideB: 24, hypotenuse: 25 });
    expect(result.sideA).toBeCloseTo(7, 8);
  });

  // ═══════════════════════════════════════════════════════
  // Area and perimeter
  // ═══════════════════════════════════════════════════════

  it('3-4-5 triangle: area = 6, perimeter = 12', () => {
    const result = calculatePythagorean({ mode: 'find-c', sideA: 3, sideB: 4 });
    expect(result.area).toBe(6);
    expect(result.perimeter).toBe(12);
  });

  it('5-12-13 triangle: area = 30, perimeter = 30', () => {
    const result = calculatePythagorean({ mode: 'find-c', sideA: 5, sideB: 12 });
    expect(result.area).toBe(30);
    expect(result.perimeter).toBe(30);
  });

  // ═══════════════════════════════════════════════════════
  // Angles
  // ═══════════════════════════════════════════════════════

  it('3-4-5: angle opposite a=3 ≈ 36.87°, opposite b=4 ≈ 53.13°', () => {
    const result = calculatePythagorean({ mode: 'find-c', sideA: 3, sideB: 4 });
    expect(result.angleA).toBeCloseTo(36.8699, 2);
    expect(result.angleB).toBeCloseTo(53.1301, 2);
  });

  it('isosceles right triangle: a=1, b=1 → both angles ≈ 45°', () => {
    const result = calculatePythagorean({ mode: 'find-c', sideA: 1, sideB: 1 });
    expect(result.angleA).toBeCloseTo(45, 4);
    expect(result.angleB).toBeCloseTo(45, 4);
  });

  // ═══════════════════════════════════════════════════════
  // Error cases
  // ═══════════════════════════════════════════════════════

  it('hypotenuse smaller than leg → error', () => {
    const result = calculatePythagorean({ mode: 'find-a', sideB: 10, hypotenuse: 5 });
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('negative side length → error', () => {
    const result = calculatePythagorean({ mode: 'find-c', sideA: -3, sideB: 4 });
    expect(result.isValid).toBe(false);
  });

  it('zero side length → error', () => {
    const result = calculatePythagorean({ mode: 'find-c', sideA: 0, sideB: 4 });
    expect(result.isValid).toBe(false);
  });

  it('hypotenuse equal to leg → error (degenerate)', () => {
    const result = calculatePythagorean({ mode: 'find-a', sideB: 5, hypotenuse: 5 });
    expect(result.isValid).toBe(false);
  });

  // ═══════════════════════════════════════════════════════
  // Decimal sides
  // ═══════════════════════════════════════════════════════

  it('a=2.5, b=6 → c ≈ 6.5', () => {
    const result = calculatePythagorean({ mode: 'find-c', sideA: 2.5, sideB: 6 });
    expect(result.hypotenuse).toBeCloseTo(6.5, 4);
  });

  it('large values: a=300, b=400 → c=500', () => {
    const result = calculatePythagorean({ mode: 'find-c', sideA: 300, sideB: 400 });
    expect(result.hypotenuse).toBe(500);
  });
});
