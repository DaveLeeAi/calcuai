import { calculateProbability, factorial, permutation, combination } from '@/lib/formulas/math/probability';

// ═══════════════════════════════════════════════════════
// Helper function tests
// ═══════════════════════════════════════════════════════

describe('factorial', () => {
  it('computes 0! = 1', () => {
    expect(factorial(0)).toBe(1);
  });

  it('computes 1! = 1', () => {
    expect(factorial(1)).toBe(1);
  });

  it('computes 5! = 120', () => {
    expect(factorial(5)).toBe(120);
  });

  it('computes 10! = 3628800', () => {
    expect(factorial(10)).toBe(3628800);
  });

  it('throws on negative input', () => {
    expect(() => factorial(-1)).toThrow('non-negative integer');
  });

  it('throws on n > 170', () => {
    expect(() => factorial(171)).toThrow('Factorial overflow');
  });
});

describe('permutation', () => {
  it('computes 5P3 = 60', () => {
    expect(permutation(5, 3)).toBe(60);
  });

  it('computes nPn = n!', () => {
    expect(permutation(5, 5)).toBe(120);
  });

  it('computes nP0 = 1', () => {
    expect(permutation(5, 0)).toBe(1);
  });

  it('throws when r > n', () => {
    expect(() => permutation(3, 5)).toThrow('r cannot be greater than n');
  });
});

describe('combination', () => {
  it('computes 5C3 = 10', () => {
    expect(combination(5, 3)).toBe(10);
  });

  it('computes nC0 = 1', () => {
    expect(combination(10, 0)).toBe(1);
  });

  it('computes nCn = 1', () => {
    expect(combination(10, 10)).toBe(1);
  });

  it('computes 10C5 = 252', () => {
    expect(combination(10, 5)).toBe(252);
  });

  it('computes 20C10 = 184756', () => {
    expect(combination(20, 10)).toBe(184756);
  });

  it('throws when r > n', () => {
    expect(() => combination(3, 5)).toThrow('r cannot be greater than n');
  });
});

// ═══════════════════════════════════════════════════════
// Main calculateProbability tests
// ═══════════════════════════════════════════════════════

describe('calculateProbability', () => {
  // ─── Single Event Tests ───

  it('calculates P(ace from deck) = 4/52', () => {
    const result = calculateProbability({
      mode: 'single',
      favorableOutcomes: 4,
      totalOutcomes: 52,
    });
    expect(result.result).toBeCloseTo(4 / 52, 8);
    expect(result.resultPercentage).toBeCloseTo(7.692308, 3);
  });

  it('calculates P(heads on fair coin) = 1/2', () => {
    const result = calculateProbability({
      mode: 'single',
      favorableOutcomes: 1,
      totalOutcomes: 2,
    });
    expect(result.result).toBeCloseTo(0.5, 8);
    expect(result.resultPercentage).toBeCloseTo(50, 3);
  });

  it('throws on zero total outcomes', () => {
    expect(() => calculateProbability({
      mode: 'single',
      favorableOutcomes: 1,
      totalOutcomes: 0,
    })).toThrow('Total outcomes cannot be zero');
  });

  it('throws when favorable > total', () => {
    expect(() => calculateProbability({
      mode: 'single',
      favorableOutcomes: 10,
      totalOutcomes: 5,
    })).toThrow('Favorable outcomes cannot exceed total outcomes');
  });

  // ─── Complement Tests ───

  it('calculates complement: 1 - 0.3 = 0.7', () => {
    const result = calculateProbability({
      mode: 'complement',
      probabilityA: 0.3,
    });
    expect(result.result).toBeCloseTo(0.7, 8);
    expect(result.resultPercentage).toBeCloseTo(70, 3);
  });

  it('throws on probability > 1 in complement mode', () => {
    expect(() => calculateProbability({
      mode: 'complement',
      probabilityA: 1.5,
    })).toThrow('Probability must be between 0 and 1');
  });

  // ─── Union Tests ───

  it('calculates union: P(A)=0.5, P(B)=0.3, P(A∩B)=0.1 → 0.7', () => {
    const result = calculateProbability({
      mode: 'union',
      probabilityA: 0.5,
      probabilityB: 0.3,
      probabilityBoth: 0.1,
    });
    expect(result.result).toBeCloseTo(0.7, 8);
    expect(result.resultPercentage).toBeCloseTo(70, 3);
  });

  // ─── Independent Intersection Tests ───

  it('calculates independent intersection: P(A)=0.5, P(B)=0.3 → 0.15', () => {
    const result = calculateProbability({
      mode: 'intersection-independent',
      probabilityA: 0.5,
      probabilityB: 0.3,
    });
    expect(result.result).toBeCloseTo(0.15, 8);
    expect(result.resultPercentage).toBeCloseTo(15, 3);
  });

  // ─── Conditional Tests ───

  it('calculates conditional: P(A∩B)=0.1, P(B)=0.4 → 0.25', () => {
    const result = calculateProbability({
      mode: 'conditional',
      probabilityBoth: 0.1,
      probabilityB: 0.4,
    });
    expect(result.result).toBeCloseTo(0.25, 8);
    expect(result.resultPercentage).toBeCloseTo(25, 3);
  });

  it('throws when P(B) = 0 in conditional mode', () => {
    expect(() => calculateProbability({
      mode: 'conditional',
      probabilityBoth: 0.1,
      probabilityB: 0,
    })).toThrow('P(B) cannot be zero');
  });

  // ─── Permutation Tests ───

  it('calculates 5P3 = 60', () => {
    const result = calculateProbability({
      mode: 'permutation',
      n: 5,
      r: 3,
    });
    expect(result.result).toBe(60);
  });

  it('throws when r > n for permutation', () => {
    expect(() => calculateProbability({
      mode: 'permutation',
      n: 3,
      r: 5,
    })).toThrow('r cannot be greater than n');
  });

  // ─── Combination Tests ───

  it('calculates 5C3 = 10', () => {
    const result = calculateProbability({
      mode: 'combination',
      n: 5,
      r: 3,
    });
    expect(result.result).toBe(10);
  });

  it('calculates 10C5 = 252', () => {
    const result = calculateProbability({
      mode: 'combination',
      n: 10,
      r: 5,
    });
    expect(result.result).toBe(252);
  });

  it('calculates 20C10 = 184756', () => {
    const result = calculateProbability({
      mode: 'combination',
      n: 20,
      r: 10,
    });
    expect(result.result).toBe(184756);
  });

  it('calculates nC0 = 1', () => {
    const result = calculateProbability({
      mode: 'combination',
      n: 15,
      r: 0,
    });
    expect(result.result).toBe(1);
  });

  it('calculates nCn = 1', () => {
    const result = calculateProbability({
      mode: 'combination',
      n: 15,
      r: 15,
    });
    expect(result.result).toBe(1);
  });
});
