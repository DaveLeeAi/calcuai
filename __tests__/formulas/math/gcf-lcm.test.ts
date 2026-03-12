import { calculateGcfLcm, gcf, lcm, gcfThree, lcmThree, primeFactorize, formatPrimeFactors } from '@/lib/formulas/math/gcf-lcm';

// ═══════════════════════════════════════════════════════
// Helper function tests
// ═══════════════════════════════════════════════════════

describe('gcf', () => {
  it('computes GCF(12, 18) = 6', () => {
    expect(gcf(12, 18)).toBe(6);
  });

  it('computes GCF(7, 13) = 1 (coprime)', () => {
    expect(gcf(7, 13)).toBe(1);
  });

  it('computes GCF(0, 5) = 5', () => {
    expect(gcf(0, 5)).toBe(5);
  });

  it('computes GCF(5, 0) = 5', () => {
    expect(gcf(5, 0)).toBe(5);
  });

  it('computes GCF(n, n) = n', () => {
    expect(gcf(15, 15)).toBe(15);
  });

  it('handles negative numbers via absolute value', () => {
    expect(gcf(-12, 18)).toBe(6);
    expect(gcf(12, -18)).toBe(6);
  });
});

describe('lcm', () => {
  it('computes LCM(12, 18) = 36', () => {
    expect(lcm(12, 18)).toBe(36);
  });

  it('computes LCM(7, 13) = 91 (coprime)', () => {
    expect(lcm(7, 13)).toBe(91);
  });

  it('computes LCM(0, 5) = 0', () => {
    expect(lcm(0, 5)).toBe(0);
  });

  it('computes LCM(n, n) = n', () => {
    expect(lcm(15, 15)).toBe(15);
  });
});

describe('gcfThree', () => {
  it('computes GCF(12, 18, 24) = 6', () => {
    expect(gcfThree(12, 18, 24)).toBe(6);
  });
});

describe('lcmThree', () => {
  it('computes LCM(4, 6, 8) = 24', () => {
    expect(lcmThree(4, 6, 8)).toBe(24);
  });
});

describe('primeFactorize', () => {
  it('factorizes 12 = 2² × 3', () => {
    const factors = primeFactorize(12);
    expect(factors.get(2)).toBe(2);
    expect(factors.get(3)).toBe(1);
    expect(factors.size).toBe(2);
  });

  it('factorizes 17 as a prime', () => {
    const factors = primeFactorize(17);
    expect(factors.get(17)).toBe(1);
    expect(factors.size).toBe(1);
  });

  it('factorizes 1 as {1: 1}', () => {
    const factors = primeFactorize(1);
    expect(factors.get(1)).toBe(1);
  });

  it('factorizes 0 as {0: 1}', () => {
    const factors = primeFactorize(0);
    expect(factors.get(0)).toBe(1);
  });

  it('factorizes 360 = 2³ × 3² × 5', () => {
    const factors = primeFactorize(360);
    expect(factors.get(2)).toBe(3);
    expect(factors.get(3)).toBe(2);
    expect(factors.get(5)).toBe(1);
  });
});

describe('formatPrimeFactors', () => {
  it('formats 12 = 2² × 3', () => {
    const factors = primeFactorize(12);
    expect(formatPrimeFactors(factors)).toBe('2\u00B2 \u00D7 3');
  });

  it('formats prime number 17 as "17"', () => {
    const factors = primeFactorize(17);
    expect(formatPrimeFactors(factors)).toBe('17');
  });

  it('formats 1 as "1"', () => {
    const factors = primeFactorize(1);
    expect(formatPrimeFactors(factors)).toBe('1');
  });
});

// ═══════════════════════════════════════════════════════
// Main calculateGcfLcm tests
// ═══════════════════════════════════════════════════════

describe('calculateGcfLcm', () => {
  it('computes GCF and LCM of 12 and 18', () => {
    const result = calculateGcfLcm({ valueA: 12, valueB: 18 });
    expect(result.gcf).toBe(6);
    expect(result.lcm).toBe(36);
  });

  it('computes GCF and LCM of coprime numbers 7 and 13', () => {
    const result = calculateGcfLcm({ valueA: 7, valueB: 13 });
    expect(result.gcf).toBe(1);
    expect(result.lcm).toBe(91);
  });

  it('handles GCF(0, 5) = 5 and LCM(0, 5) = 0', () => {
    const result = calculateGcfLcm({ valueA: 0, valueB: 5 });
    expect(result.gcf).toBe(5);
    expect(result.lcm).toBe(0);
  });

  it('handles same number: GCF(n, n) = n, LCM(n, n) = n', () => {
    const result = calculateGcfLcm({ valueA: 20, valueB: 20 });
    expect(result.gcf).toBe(20);
    expect(result.lcm).toBe(20);
  });

  it('handles three numbers: GCF(12, 18, 24) = 6', () => {
    const result = calculateGcfLcm({ valueA: 12, valueB: 18, valueC: 24 });
    expect(result.gcf).toBe(6);
  });

  it('handles three numbers: LCM(4, 6, 8) = 24', () => {
    const result = calculateGcfLcm({ valueA: 4, valueB: 6, valueC: 8 });
    expect(result.lcm).toBe(24);
  });

  it('shows prime factorization of inputs', () => {
    const result = calculateGcfLcm({ valueA: 12, valueB: 18 });
    expect(result.primeFactorsA).toBe('2\u00B2 \u00D7 3');
    expect(result.primeFactorsB).toBe('2 \u00D7 3\u00B2');
  });

  it('shows prime factorization of a prime number', () => {
    const result = calculateGcfLcm({ valueA: 17, valueB: 13 });
    expect(result.primeFactorsA).toBe('17');
    expect(result.primeFactorsB).toBe('13');
    expect(result.gcf).toBe(1);
    expect(result.lcm).toBe(221);
  });

  it('handles negative numbers via absolute value', () => {
    const result = calculateGcfLcm({ valueA: -12, valueB: 18 });
    expect(result.gcf).toBe(6);
    expect(result.lcm).toBe(36);
  });

  it('verifies product identity: a × b = GCF × LCM', () => {
    const result = calculateGcfLcm({ valueA: 48, valueB: 36 });
    const gcfVal = result.gcf as number;
    const lcmVal = result.lcm as number;
    expect(48 * 36).toBe(gcfVal * lcmVal);
  });

  it('shows prime factorization of 1 as "1"', () => {
    const result = calculateGcfLcm({ valueA: 1, valueB: 7 });
    expect(result.primeFactorsA).toBe('1');
    expect(result.gcf).toBe(1);
    expect(result.lcm).toBe(7);
  });

  it('ignores valueC when it is 0 or empty', () => {
    const result = calculateGcfLcm({ valueA: 12, valueB: 18, valueC: 0 });
    expect(result.gcf).toBe(6);
    expect(result.lcm).toBe(36);
    expect(result.primeFactorsC).toBe('');
  });

  it('handles large numbers', () => {
    const result = calculateGcfLcm({ valueA: 123456, valueB: 789012 });
    expect(result.gcf).toBe(gcf(123456, 789012));
    expect(result.lcm).toBe(lcm(123456, 789012));
  });
});
