import { calculatePermutationCombination } from '@/lib/formulas/math/permutation-combination';

describe('calculatePermutationCombination', () => {
  // ─── Without Repetition — Permutations ───

  it('calculates P(5,3) = 60', () => {
    const result = calculatePermutationCombination({ n: 5, r: 3, mode: 'both', repetition: false });
    expect(result.permutation).toBe(60);
  });

  it('calculates P(10,2) = 90', () => {
    const result = calculatePermutationCombination({ n: 10, r: 2, mode: 'both', repetition: false });
    expect(result.permutation).toBe(90);
  });

  it('calculates P(n,0) = 1 (selecting nothing)', () => {
    const result = calculatePermutationCombination({ n: 7, r: 0, mode: 'both', repetition: false });
    expect(result.permutation).toBe(1);
  });

  it('calculates P(n,n) = n! (selecting all) — P(5,5) = 120', () => {
    const result = calculatePermutationCombination({ n: 5, r: 5, mode: 'both', repetition: false });
    expect(result.permutation).toBe(120);
  });

  it('calculates P(20,5) = 1,860,480', () => {
    const result = calculatePermutationCombination({ n: 20, r: 5, mode: 'both', repetition: false });
    expect(result.permutation).toBe(1860480);
  });

  // ─── Without Repetition — Combinations ───

  it('calculates C(5,3) = 10', () => {
    const result = calculatePermutationCombination({ n: 5, r: 3, mode: 'both', repetition: false });
    expect(result.combination).toBe(10);
  });

  it('calculates C(10,2) = 45', () => {
    const result = calculatePermutationCombination({ n: 10, r: 2, mode: 'both', repetition: false });
    expect(result.combination).toBe(45);
  });

  it('calculates C(n,0) = 1', () => {
    const result = calculatePermutationCombination({ n: 12, r: 0, mode: 'both', repetition: false });
    expect(result.combination).toBe(1);
  });

  it('calculates C(n,n) = 1', () => {
    const result = calculatePermutationCombination({ n: 8, r: 8, mode: 'both', repetition: false });
    expect(result.combination).toBe(1);
  });

  it('calculates C(20,5) = 15,504', () => {
    const result = calculatePermutationCombination({ n: 20, r: 5, mode: 'both', repetition: false });
    expect(result.combination).toBe(15504);
  });

  it('calculates C(52,5) = 2,598,960 (poker hands)', () => {
    const result = calculatePermutationCombination({ n: 52, r: 5, mode: 'both', repetition: false });
    expect(result.combination).toBe(2598960);
  });

  // ─── With Repetition ───

  it('calculates P(5,3) with repetition = 5^3 = 125', () => {
    const result = calculatePermutationCombination({ n: 5, r: 3, mode: 'both', repetition: true });
    expect(result.permutation).toBe(125);
  });

  it('calculates C(5,3) with repetition = C(7,3) = 35', () => {
    const result = calculatePermutationCombination({ n: 5, r: 3, mode: 'both', repetition: true });
    expect(result.combination).toBe(35);
  });

  // ─── Edge Cases ───

  it('returns P=1, C=1 when n=0, r=0', () => {
    const result = calculatePermutationCombination({ n: 0, r: 0, mode: 'both', repetition: false });
    expect(result.permutation).toBe(1);
    expect(result.combination).toBe(1);
  });

  it('returns 0 with error message when r > n without repetition', () => {
    const result = calculatePermutationCombination({ n: 3, r: 5, mode: 'both', repetition: false });
    expect(result.permutation).toBe(0);
    expect(result.combination).toBe(0);
  });

  it('allows r > n with repetition (e.g., n=3, r=5)', () => {
    const result = calculatePermutationCombination({ n: 3, r: 5, mode: 'both', repetition: true });
    // P_rep(3,5) = 3^5 = 243
    expect(result.permutation).toBe(243);
    // C_rep(3,5) = C(7,5) = 21
    expect(result.combination).toBe(21);
  });

  // ─── Formula String Verification ───

  it('produces correct formula strings without repetition', () => {
    const result = calculatePermutationCombination({ n: 10, r: 3, mode: 'both', repetition: false });
    expect(result.permutationFormula).toBe('P(10, 3) = 10! / 7! = 720');
    expect(result.combinationFormula).toBe('C(10, 3) = 10! / (3! × 7!) = 120');
  });

  it('produces correct formula strings with repetition', () => {
    const result = calculatePermutationCombination({ n: 4, r: 2, mode: 'both', repetition: true });
    expect(result.permutationFormula).toBe('4^2 = 16');
    expect(result.combinationFormula).toBe('C(5, 2) = 10');
  });

  // ─── Summary Output ───

  it('includes correct summary entries', () => {
    const result = calculatePermutationCombination({ n: 6, r: 2, mode: 'both', repetition: false });
    const summary = result.summary as { label: string; value: string | number }[];
    expect(summary).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'n (total items)', value: 6 }),
        expect.objectContaining({ label: 'r (items chosen)', value: 2 }),
        expect.objectContaining({ label: 'Repetition', value: 'Not allowed' }),
        expect.objectContaining({ label: 'Permutations P(n,r)', value: 30 }),
        expect.objectContaining({ label: 'Combinations C(n,r)', value: 15 }),
      ])
    );
  });

  // ─── Large Values ───

  it('handles large n: P(100,3) and C(100,3)', () => {
    const result = calculatePermutationCombination({ n: 100, r: 3, mode: 'both', repetition: false });
    // P(100,3) = 100 × 99 × 98 = 970200
    expect(result.permutation).toBe(970200);
    // C(100,3) = 970200 / 6 = 161700
    expect(result.combination).toBe(161700);
  });

  // ─── Mode Parameter ───

  it('returns both values regardless of mode setting', () => {
    const permOnly = calculatePermutationCombination({ n: 5, r: 2, mode: 'permutation', repetition: false });
    expect(permOnly.permutation).toBe(20);
    expect(permOnly.combination).toBe(10);

    const combOnly = calculatePermutationCombination({ n: 5, r: 2, mode: 'combination', repetition: false });
    expect(combOnly.permutation).toBe(20);
    expect(combOnly.combination).toBe(10);
  });

  // ─── Negative Input Guard ───

  it('returns 0 with error for negative n', () => {
    const result = calculatePermutationCombination({ n: -5, r: 3, mode: 'both', repetition: false });
    expect(result.permutation).toBe(0);
    expect(result.combination).toBe(0);
  });
});
