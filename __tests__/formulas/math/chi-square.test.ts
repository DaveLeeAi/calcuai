import { calculateChiSquare } from '@/lib/formulas/math/chi-square';

describe('calculateChiSquare', () => {
  // ═══════════════════════════════════════════════════════
  // Core Calculation — Uniform Distribution
  // ═══════════════════════════════════════════════════════

  it('calculates chi-square with default values (50,30,20 uniform)', () => {
    const result = calculateChiSquare({ observedValues: '50,30,20', significanceLevel: '0.05' });
    // Expected uniform: 100/3 = 33.333 each
    // χ² = (50-33.33)²/33.33 + (30-33.33)²/33.33 + (20-33.33)²/33.33
    //     = 8.333 + 0.333 + 5.333 = 14.0
    expect(result.chiSquareStatistic).toBeCloseTo(14.0, 0);
    expect(result.degreesOfFreedom).toBe(2);
  });

  it('uniform distribution: significant at α=0.05 for (50,30,20)', () => {
    const result = calculateChiSquare({ observedValues: '50,30,20', significanceLevel: '0.05' });
    expect(result.isSignificant).toBe(true);
    expect(result.pValue as number).toBeLessThan(0.05);
  });

  it('p-value for (50,30,20) is approximately 0.0009', () => {
    const result = calculateChiSquare({ observedValues: '50,30,20' });
    // Known: χ²=14.0, df=2, p ≈ 0.0009
    expect(result.pValue).toBeCloseTo(0.0009, 3);
  });

  // ═══════════════════════════════════════════════════════
  // Custom Expected Values
  // ═══════════════════════════════════════════════════════

  it('calculates with custom expected values', () => {
    const result = calculateChiSquare({ observedValues: '50,30,20', expectedValues: '40,35,25' });
    // χ² = (50-40)²/40 + (30-35)²/35 + (20-25)²/25
    //     = 100/40 + 25/35 + 25/25 = 2.5 + 0.7143 + 1.0 = 4.2143
    expect(result.chiSquareStatistic).toBeCloseTo(4.2143, 3);
    expect(result.degreesOfFreedom).toBe(2);
  });

  // ═══════════════════════════════════════════════════════
  // Known Textbook Example: Dice Roll
  // ═══════════════════════════════════════════════════════

  it('dice roll fairness test (textbook example)', () => {
    // Roll a die 60 times; expected: 10 per face
    const result = calculateChiSquare({
      observedValues: '8,12,11,9,10,10',
      significanceLevel: '0.05',
    });
    // Expected uniform: 10 each
    // χ² = (8-10)²/10 + (12-10)²/10 + (11-10)²/10 + (9-10)²/10 + (10-10)²/10 + (10-10)²/10
    //     = 0.4 + 0.4 + 0.1 + 0.1 + 0 + 0 = 1.0
    expect(result.chiSquareStatistic).toBeCloseTo(1.0, 4);
    expect(result.degreesOfFreedom).toBe(5);
    // p-value for χ²=1.0, df=5 ≈ 0.9626 (not significant)
    expect(result.isSignificant).toBe(false);
    expect(result.pValue as number).toBeGreaterThan(0.05);
  });

  it('six categories: degrees of freedom = 5', () => {
    const result = calculateChiSquare({ observedValues: '10,10,10,10,10,10' });
    expect(result.degreesOfFreedom).toBe(5);
  });

  // ═══════════════════════════════════════════════════════
  // Perfect Fit
  // ═══════════════════════════════════════════════════════

  it('perfect fit gives χ² = 0', () => {
    const result = calculateChiSquare({ observedValues: '25,25,25,25', expectedValues: '25,25,25,25' });
    expect(result.chiSquareStatistic).toBe(0);
    expect(result.pValue).toBeCloseTo(1.0, 4);
    expect(result.isSignificant).toBe(false);
  });

  it('perfect uniform fit gives χ² = 0', () => {
    const result = calculateChiSquare({ observedValues: '20,20,20,20,20' });
    // Expected = 20 each (uniform), all diffs = 0
    expect(result.chiSquareStatistic).toBe(0);
  });

  // ═══════════════════════════════════════════════════════
  // Significance Level Variations
  // ═══════════════════════════════════════════════════════

  it('significant at α=0.05 but not at α=0.01', () => {
    // Need a χ² between the two critical values for appropriate df
    // df=2: critical 0.05 = 5.991, critical 0.01 = 9.210
    const result05 = calculateChiSquare({ observedValues: '40,35,25', significanceLevel: '0.05' });
    const result01 = calculateChiSquare({ observedValues: '40,35,25', significanceLevel: '0.01' });
    // χ² = (40-33.33)²/33.33 + (35-33.33)²/33.33 + (25-33.33)²/33.33
    //     ≈ 1.333 + 0.083 + 2.083 = 3.5
    // p ≈ 0.174, not significant at either level for this data
    // Let's use a case where it IS significant at 0.05 but not 0.01
    const r05 = calculateChiSquare({ observedValues: '45,30,25', significanceLevel: '0.05' });
    const r01 = calculateChiSquare({ observedValues: '45,30,25', significanceLevel: '0.01' });
    // χ² ≈ (45-33.33)²/33.33 + (30-33.33)²/33.33 + (25-33.33)²/33.33
    //     ≈ 4.083 + 0.333 + 2.083 = 6.5
    expect(r05.chiSquareStatistic).toBeCloseTo(6.5, 0);
    expect(r05.isSignificant).toBe(true); // 6.5 > 5.991
    expect(r01.isSignificant).toBe(false); // 6.5 < 9.210
  });

  it('significance at α=0.10', () => {
    const result = calculateChiSquare({ observedValues: '50,30,20', significanceLevel: '0.10' });
    expect(result.isSignificant).toBe(true);
    expect(result.significanceLevel).toBe(0.10);
  });

  // ═══════════════════════════════════════════════════════
  // Degrees of Freedom
  // ═══════════════════════════════════════════════════════

  it('degrees of freedom = k - 1 for 2 categories', () => {
    const result = calculateChiSquare({ observedValues: '60,40' });
    expect(result.degreesOfFreedom).toBe(1);
  });

  it('degrees of freedom = k - 1 for 3 categories', () => {
    const result = calculateChiSquare({ observedValues: '50,30,20' });
    expect(result.degreesOfFreedom).toBe(2);
  });

  it('degrees of freedom = k - 1 for 10 categories', () => {
    const result = calculateChiSquare({ observedValues: '10,10,10,10,10,10,10,10,10,10' });
    expect(result.degreesOfFreedom).toBe(9);
  });

  // ═══════════════════════════════════════════════════════
  // Critical Value
  // ═══════════════════════════════════════════════════════

  it('critical value for df=2, α=0.05 is approximately 5.991', () => {
    const result = calculateChiSquare({ observedValues: '50,30,20', significanceLevel: '0.05' });
    expect(result.criticalValue).toBeCloseTo(5.991, 2);
  });

  it('critical value for df=1, α=0.05 is approximately 3.841', () => {
    const result = calculateChiSquare({ observedValues: '60,40', significanceLevel: '0.05' });
    expect(result.criticalValue).toBeCloseTo(3.841, 2);
  });

  it('critical value for df=5, α=0.05 is approximately 11.07', () => {
    const result = calculateChiSquare({ observedValues: '10,10,10,10,10,10', significanceLevel: '0.05' });
    expect(result.criticalValue).toBeCloseTo(11.07, 1);
  });

  // ═══════════════════════════════════════════════════════
  // Per-Category Contributions
  // ═══════════════════════════════════════════════════════

  it('contributions sum to chi-square statistic', () => {
    const result = calculateChiSquare({ observedValues: '50,30,20' });
    const contributions = result.contributions as { contribution: number }[];
    const sum = contributions.reduce((acc, c) => acc + c.contribution, 0);
    expect(sum).toBeCloseTo(result.chiSquareStatistic as number, 4);
  });

  it('contributions have correct category count', () => {
    const result = calculateChiSquare({ observedValues: '50,30,20' });
    const contributions = result.contributions as { category: number }[];
    expect(contributions.length).toBe(3);
    expect(contributions[0].category).toBe(1);
    expect(contributions[2].category).toBe(3);
  });

  // ═══════════════════════════════════════════════════════
  // Large Chi-Square Value
  // ═══════════════════════════════════════════════════════

  it('large chi-square value with extreme deviation', () => {
    const result = calculateChiSquare({ observedValues: '100,0,0' });
    // Expected uniform: 33.33 each
    // χ² = (100-33.33)²/33.33 + (0-33.33)²/33.33 + (0-33.33)²/33.33
    //     = 133.33 + 33.33 + 33.33 = 200.0
    expect(result.chiSquareStatistic).toBeCloseTo(200.0, 0);
    expect(result.isSignificant).toBe(true);
    expect(result.pValue as number).toBeLessThan(0.001);
  });

  // ═══════════════════════════════════════════════════════
  // Error Cases
  // ═══════════════════════════════════════════════════════

  it('throws for fewer than 2 observed categories', () => {
    expect(() => calculateChiSquare({ observedValues: '50' })).toThrow('At least 2 observed categories are required.');
  });

  it('throws for empty observed values', () => {
    expect(() => calculateChiSquare({ observedValues: '' })).toThrow('At least 2 observed categories are required.');
  });

  it('throws for mismatched observed and expected lengths', () => {
    expect(() => calculateChiSquare({ observedValues: '50,30,20', expectedValues: '40,60' }))
      .toThrow('Expected values count (2) must match observed values count (3).');
  });

  it('throws for zero expected value', () => {
    expect(() => calculateChiSquare({ observedValues: '50,30', expectedValues: '0,80' }))
      .toThrow('Expected values must be positive');
  });

  it('throws for negative expected value', () => {
    expect(() => calculateChiSquare({ observedValues: '50,30', expectedValues: '-10,90' }))
      .toThrow('Expected values must be positive');
  });

  it('throws for negative observed value', () => {
    expect(() => calculateChiSquare({ observedValues: '-5,30,20' }))
      .toThrow('Observed values must be non-negative.');
  });

  // ═══════════════════════════════════════════════════════
  // Output Structure
  // ═══════════════════════════════════════════════════════

  it('returns all expected output fields', () => {
    const result = calculateChiSquare({ observedValues: '50,30,20' });
    expect(result).toHaveProperty('chiSquareStatistic');
    expect(result).toHaveProperty('degreesOfFreedom');
    expect(result).toHaveProperty('pValue');
    expect(result).toHaveProperty('isSignificant');
    expect(result).toHaveProperty('significanceLevel');
    expect(result).toHaveProperty('criticalValue');
    expect(result).toHaveProperty('contributions');
    expect(result).toHaveProperty('allValues');
    expect(result).toHaveProperty('breakdown');
  });

  it('breakdown includes step-by-step entries', () => {
    const result = calculateChiSquare({ observedValues: '50,30,20' });
    const breakdown = result.breakdown as { step: string; expression: string }[];
    expect(breakdown.length).toBeGreaterThanOrEqual(6);
    expect(breakdown.find(b => b.step === 'Formula')).toBeDefined();
    expect(breakdown.find(b => b.step === 'Chi-square statistic')).toBeDefined();
    expect(breakdown.find(b => b.step === 'p-value')).toBeDefined();
    expect(breakdown.find(b => b.step === 'Decision')).toBeDefined();
  });

  // ═══════════════════════════════════════════════════════
  // Defaults & String Inputs
  // ═══════════════════════════════════════════════════════

  it('defaults significance level to 0.05', () => {
    const result = calculateChiSquare({ observedValues: '50,30,20' });
    expect(result.significanceLevel).toBe(0.05);
  });

  it('handles string significance level', () => {
    const result = calculateChiSquare({ observedValues: '50,30,20', significanceLevel: '0.01' });
    expect(result.significanceLevel).toBe(0.01);
  });
});
