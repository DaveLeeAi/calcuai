export interface PermutationCombinationInput {
  n: number;
  r: number;
  mode: 'permutation' | 'combination' | 'both';
  repetition: boolean;
}

export interface PermutationCombinationOutput {
  permutation: number;
  combination: number;
  permutationFormula: string;
  combinationFormula: string;
  summary: { label: string; value: string | number }[];
}

/**
 * Iterative factorial. Capped at n = 170 to stay within
 * JavaScript's Number.MAX_VALUE (~1.7976e+308).
 * 170! ≈ 7.257e+306 fits; 171! ≈ 1.241e+309 overflows.
 *
 * Source: n! = 1 × 2 × 3 × … × n, with 0! = 1 by convention.
 */
function factorial(n: number): number {
  if (n < 0) return 0;
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

/**
 * Partial factorial: n × (n-1) × … × (n-r+1) = n! / (n-r)!
 * Avoids computing full factorials to reduce overflow risk.
 */
function partialFactorial(n: number, r: number): number {
  if (r === 0) return 1;
  let result = 1;
  for (let i = n; i > n - r; i--) {
    result *= i;
  }
  return result;
}

/**
 * Combination using the multiplicative formula for numerical stability:
 * C(n, r) = (n × (n-1) × … × (n-r+1)) / r!
 * Uses the smaller of r and n-r for efficiency.
 */
function combinationValue(n: number, r: number): number {
  if (r === 0 || r === n) return 1;
  const k = Math.min(r, n - r);
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = (result * (n - i)) / (i + 1);
  }
  return Math.round(result);
}

/**
 * Permutation & Combination calculator.
 *
 * Without repetition:
 *   P(n,r) = n! / (n-r)!
 *   C(n,r) = n! / (r!(n-r)!)
 *
 * With repetition:
 *   P_rep(n,r) = n^r
 *   C_rep(n,r) = C(n+r-1, r) = (n+r-1)! / (r!(n-1)!)
 *
 * Source: Kenneth H. Rosen, Discrete Mathematics and Its Applications (8th ed.),
 *         McGraw-Hill, Chapters 6.1–6.3. Combinatorial formulas trace to
 *         Blaise Pascal's Traité du triangle arithmétique (1654).
 */
export function calculatePermutationCombination(inputs: Record<string, unknown>): Record<string, unknown> {
  const n = Math.floor(Number(inputs.n) || 0);
  const r = Math.floor(Number(inputs.r) || 0);
  const mode = String(inputs.mode || 'both');
  const repetition = Boolean(inputs.repetition);

  // Validation
  if (n < 0 || r < 0) {
    return {
      permutation: 0,
      combination: 0,
      permutationFormula: 'n and r must be non-negative',
      combinationFormula: 'n and r must be non-negative',
      summary: [
        { label: 'Error', value: 'n and r must be non-negative integers' },
      ],
    };
  }

  if (!repetition && r > n) {
    return {
      permutation: 0,
      combination: 0,
      permutationFormula: 'r cannot exceed n without repetition',
      combinationFormula: 'r cannot exceed n without repetition',
      summary: [
        { label: 'Error', value: 'r cannot exceed n when repetition is not allowed' },
      ],
    };
  }

  let perm = 0;
  let comb = 0;
  let permFormula = '';
  let combFormula = '';

  if (repetition) {
    // With repetition
    // Permutations = n^r
    perm = Math.pow(n, r);
    permFormula = `${n}^${r} = ${perm}`;

    // Combinations = C(n+r-1, r)
    comb = combinationValue(n + r - 1, r);
    combFormula = `C(${n + r - 1}, ${r}) = ${comb}`;
  } else {
    // Without repetition
    // Permutations = n! / (n-r)!
    perm = partialFactorial(n, r);
    permFormula = `P(${n}, ${r}) = ${n}! / ${n - r}! = ${perm}`;

    // Combinations = n! / (r!(n-r)!)
    comb = combinationValue(n, r);
    combFormula = `C(${n}, ${r}) = ${n}! / (${r}! × ${n - r}!) = ${comb}`;
  }

  const summary = [
    { label: 'n (total items)', value: n },
    { label: 'r (items chosen)', value: r },
    { label: 'Repetition', value: repetition ? 'Allowed' : 'Not allowed' },
    { label: 'Permutations P(n,r)', value: perm },
    { label: 'Combinations C(n,r)', value: comb },
    { label: 'Permutation Formula', value: permFormula },
    { label: 'Combination Formula', value: combFormula },
  ];

  return {
    permutation: perm,
    combination: comb,
    permutationFormula: permFormula,
    combinationFormula: combFormula,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'permutation-combination': calculatePermutationCombination,
};
