import { calculateFractions, gcd, lcm, simplifyFraction, toMixedNumber } from '@/lib/formulas/math/fractions';

// ═══════════════════════════════════════════════════════
// Helper function tests
// ═══════════════════════════════════════════════════════

describe('gcd', () => {
  it('computes gcd of two positive integers', () => {
    expect(gcd(12, 8)).toBe(4);
    expect(gcd(17, 5)).toBe(1);
    expect(gcd(100, 75)).toBe(25);
  });

  it('handles zero', () => {
    expect(gcd(0, 5)).toBe(5);
    expect(gcd(7, 0)).toBe(7);
  });

  it('handles negative numbers', () => {
    expect(gcd(-12, 8)).toBe(4);
    expect(gcd(12, -8)).toBe(4);
  });
});

describe('lcm', () => {
  it('computes lcm of two positive integers', () => {
    expect(lcm(4, 6)).toBe(12);
    expect(lcm(3, 7)).toBe(21);
  });

  it('returns 0 when either input is 0', () => {
    expect(lcm(0, 5)).toBe(0);
    expect(lcm(5, 0)).toBe(0);
  });
});

describe('simplifyFraction', () => {
  it('simplifies a reducible fraction', () => {
    expect(simplifyFraction(6, 8)).toEqual([3, 4]);
  });

  it('normalizes negative denominator', () => {
    expect(simplifyFraction(3, -4)).toEqual([-3, 4]);
  });

  it('returns [0, 1] for zero numerator', () => {
    expect(simplifyFraction(0, 7)).toEqual([0, 1]);
  });

  it('throws on zero denominator', () => {
    expect(() => simplifyFraction(3, 0)).toThrow('Denominator cannot be zero');
  });
});

describe('toMixedNumber', () => {
  it('converts improper fraction to mixed number', () => {
    expect(toMixedNumber(7, 4)).toBe('1 3/4');
  });

  it('converts negative improper fraction', () => {
    expect(toMixedNumber(-7, 4)).toBe('-1 3/4');
  });

  it('returns whole number when evenly divisible', () => {
    expect(toMixedNumber(5, 5)).toBe('1');
    expect(toMixedNumber(10, 5)).toBe('2');
  });

  it('returns proper fraction as-is', () => {
    expect(toMixedNumber(3, 4)).toBe('3/4');
  });

  it('returns "0" for zero numerator', () => {
    expect(toMixedNumber(0, 5)).toBe('0');
  });
});

// ═══════════════════════════════════════════════════════
// Main calculateFractions tests
// ═══════════════════════════════════════════════════════

describe('calculateFractions', () => {
  // ─── Addition Tests ───

  it('adds fractions with same denominator: 1/4 + 1/4 = 1/2', () => {
    const result = calculateFractions({
      numerator1: 1, denominator1: 4,
      operation: 'add',
      numerator2: 1, denominator2: 4,
    });
    expect(result.simplifiedResult).toBe('1/2');
    expect(result.decimalResult).toBeCloseTo(0.5, 6);
    expect(result.mixedNumber).toBe('1/2');
  });

  it('adds fractions with different denominators: 1/3 + 1/6 = 1/2', () => {
    const result = calculateFractions({
      numerator1: 1, denominator1: 3,
      operation: 'add',
      numerator2: 1, denominator2: 6,
    });
    expect(result.simplifiedResult).toBe('1/2');
    expect(result.decimalResult).toBeCloseTo(0.5, 6);
  });

  it('adds fractions producing improper result: 2/3 + 3/4 = 17/12', () => {
    const result = calculateFractions({
      numerator1: 2, denominator1: 3,
      operation: 'add',
      numerator2: 3, denominator2: 4,
    });
    expect(result.simplifiedResult).toBe('17/12');
    expect(result.mixedNumber).toBe('1 5/12');
    expect(result.decimalResult).toBeCloseTo(1.416667, 5);
  });

  // ─── Subtraction Tests ───

  it('subtracts fractions with same denominator: 3/4 - 1/4 = 1/2', () => {
    const result = calculateFractions({
      numerator1: 3, denominator1: 4,
      operation: 'subtract',
      numerator2: 1, denominator2: 4,
    });
    expect(result.simplifiedResult).toBe('1/2');
    expect(result.decimalResult).toBeCloseTo(0.5, 6);
  });

  it('subtracts yielding negative result: 1/2 - 2/3 = -1/6', () => {
    const result = calculateFractions({
      numerator1: 1, denominator1: 2,
      operation: 'subtract',
      numerator2: 2, denominator2: 3,
    });
    expect(result.simplifiedResult).toBe('-1/6');
    expect(result.decimalResult).toBeCloseTo(-0.166667, 5);
  });

  // ─── Multiplication Tests ───

  it('multiplies fractions: 2/3 × 3/4 = 1/2', () => {
    const result = calculateFractions({
      numerator1: 2, denominator1: 3,
      operation: 'multiply',
      numerator2: 3, denominator2: 4,
    });
    expect(result.simplifiedResult).toBe('1/2');
    expect(result.decimalResult).toBeCloseTo(0.5, 6);
  });

  it('multiplies fractions: 1/2 × 1/2 = 1/4', () => {
    const result = calculateFractions({
      numerator1: 1, denominator1: 2,
      operation: 'multiply',
      numerator2: 1, denominator2: 2,
    });
    expect(result.simplifiedResult).toBe('1/4');
    expect(result.decimalResult).toBeCloseTo(0.25, 6);
  });

  // ─── Division Tests ───

  it('divides fractions: 3/4 ÷ 1/2 = 3/2 = 1 1/2', () => {
    const result = calculateFractions({
      numerator1: 3, denominator1: 4,
      operation: 'divide',
      numerator2: 1, denominator2: 2,
    });
    expect(result.simplifiedResult).toBe('3/2');
    expect(result.mixedNumber).toBe('1 1/2');
    expect(result.decimalResult).toBeCloseTo(1.5, 6);
  });

  it('divides fractions: 1/3 ÷ 2/3 = 1/2', () => {
    const result = calculateFractions({
      numerator1: 1, denominator1: 3,
      operation: 'divide',
      numerator2: 2, denominator2: 3,
    });
    expect(result.simplifiedResult).toBe('1/2');
    expect(result.decimalResult).toBeCloseTo(0.5, 6);
  });

  // ─── Edge Cases ───

  it('handles zero numerator: 0/5 + 3/4 = 3/4', () => {
    const result = calculateFractions({
      numerator1: 0, denominator1: 5,
      operation: 'add',
      numerator2: 3, denominator2: 4,
    });
    expect(result.simplifiedResult).toBe('3/4');
    expect(result.decimalResult).toBeCloseTo(0.75, 6);
  });

  it('handles negative numerator: -3/4 + 1/4 = -1/2', () => {
    const result = calculateFractions({
      numerator1: -3, denominator1: 4,
      operation: 'add',
      numerator2: 1, denominator2: 4,
    });
    expect(result.simplifiedResult).toBe('-1/2');
    expect(result.decimalResult).toBeCloseTo(-0.5, 6);
  });

  it('handles identity multiplication (× 1): 5/7 × 1/1 = 5/7', () => {
    const result = calculateFractions({
      numerator1: 5, denominator1: 7,
      operation: 'multiply',
      numerator2: 1, denominator2: 1,
    });
    expect(result.simplifiedResult).toBe('5/7');
  });

  it('handles identity division (÷ 1): 5/7 ÷ 1/1 = 5/7', () => {
    const result = calculateFractions({
      numerator1: 5, denominator1: 7,
      operation: 'divide',
      numerator2: 1, denominator2: 1,
    });
    expect(result.simplifiedResult).toBe('5/7');
  });

  it('handles identity addition (+ 0): 3/8 + 0/1 = 3/8', () => {
    const result = calculateFractions({
      numerator1: 3, denominator1: 8,
      operation: 'add',
      numerator2: 0, denominator2: 1,
    });
    expect(result.simplifiedResult).toBe('3/8');
  });

  it('handles already-simplified result: 1/2 + 1/2 = 1', () => {
    const result = calculateFractions({
      numerator1: 1, denominator1: 2,
      operation: 'add',
      numerator2: 1, denominator2: 2,
    });
    expect(result.simplifiedResult).toBe('1');
    expect(result.decimalResult).toBe(1);
    expect(result.mixedNumber).toBe('1');
  });

  it('handles large numbers: 999/1000 + 1/1000 = 1', () => {
    const result = calculateFractions({
      numerator1: 999, denominator1: 1000,
      operation: 'add',
      numerator2: 1, denominator2: 1000,
    });
    expect(result.simplifiedResult).toBe('1');
    expect(result.decimalResult).toBe(1);
  });

  it('mixed number conversion: 7/4 → 1 3/4', () => {
    const result = calculateFractions({
      numerator1: 7, denominator1: 4,
      operation: 'multiply',
      numerator2: 1, denominator2: 1,
    });
    expect(result.simplifiedResult).toBe('7/4');
    expect(result.mixedNumber).toBe('1 3/4');
  });

  it('throws on division by zero fraction (0/d)', () => {
    expect(() => calculateFractions({
      numerator1: 1, denominator1: 2,
      operation: 'divide',
      numerator2: 0, denominator2: 3,
    })).toThrow('Cannot divide by zero');
  });

  it('throws on zero denominator1', () => {
    expect(() => calculateFractions({
      numerator1: 1, denominator1: 0,
      operation: 'add',
      numerator2: 1, denominator2: 2,
    })).toThrow('Denominator 1 cannot be zero');
  });

  it('throws on zero denominator2', () => {
    expect(() => calculateFractions({
      numerator1: 1, denominator1: 2,
      operation: 'add',
      numerator2: 1, denominator2: 0,
    })).toThrow('Denominator 2 cannot be zero');
  });

  // ─── Step-by-step output verification ───

  it('produces step-by-step solution for addition', () => {
    const result = calculateFractions({
      numerator1: 1, denominator1: 3,
      operation: 'add',
      numerator2: 1, denominator2: 4,
    });
    const steps = result.stepByStep as Array<{ label: string; value: string }>;
    expect(steps.length).toBeGreaterThanOrEqual(4);
    expect(steps[0].label).toBe('Operation');
    expect(steps[0].value).toBe('1/3 + 1/4');
  });
});
