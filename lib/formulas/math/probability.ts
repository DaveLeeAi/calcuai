export type ProbabilityMode =
  | 'single'
  | 'complement'
  | 'union'
  | 'intersection-independent'
  | 'conditional'
  | 'permutation'
  | 'combination';

export interface ProbabilityInput {
  mode: ProbabilityMode;
  favorableOutcomes?: number;
  totalOutcomes?: number;
  probabilityA?: number;
  probabilityB?: number;
  probabilityBoth?: number;
  n?: number;
  r?: number;
}

export interface ProbabilityOutput {
  result: number;
  resultPercentage: number;
  resultFraction: string;
  expression: string;
}

/**
 * Iterative factorial function. Capped at n = 170 to avoid
 * exceeding JavaScript's Number.MAX_VALUE (~1.7976e+308).
 * 170! ≈ 7.257e+306 fits; 171! ≈ 1.241e+309 overflows.
 *
 * Source: Factorial definition, n! = 1 × 2 × 3 × … × n, with 0! = 1 by convention.
 */
export function factorial(n: number): number {
  if (!Number.isInteger(n) || n < 0) {
    throw new Error('Factorial requires a non-negative integer');
  }
  if (n > 170) {
    throw new Error('Factorial overflow: n must be 170 or less');
  }
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

/**
 * Permutation: nPr = n! / (n - r)!
 * The number of ordered arrangements of r items chosen from n items.
 *
 * Source: Combinatorics, Blaise Pascal & Pierre de Fermat (17th century).
 */
export function permutation(n: number, r: number): number {
  if (!Number.isInteger(n) || !Number.isInteger(r) || n < 0 || r < 0) {
    throw new Error('n and r must be non-negative integers');
  }
  if (r > n) {
    throw new Error('r cannot be greater than n for permutations');
  }
  // Compute n! / (n-r)! iteratively to avoid overflow for large n
  let result = 1;
  for (let i = n; i > n - r; i--) {
    result *= i;
  }
  return result;
}

/**
 * Combination: nCr = n! / (r!(n - r)!)
 * The number of unordered selections of r items from n items.
 *
 * Source: Combinatorics, Blaise Pascal & Pierre de Fermat (17th century).
 */
export function combination(n: number, r: number): number {
  if (!Number.isInteger(n) || !Number.isInteger(r) || n < 0 || r < 0) {
    throw new Error('n and r must be non-negative integers');
  }
  if (r > n) {
    throw new Error('r cannot be greater than n for combinations');
  }
  // Use the smaller of r and n-r for efficiency
  const k = Math.min(r, n - r);
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = (result * (n - i)) / (i + 1);
  }
  return Math.round(result);
}

/**
 * Attempt to express a decimal probability as a simplified fraction string.
 * Returns "N/A" for irrational results or overly complex fractions.
 */
function toFraction(decimal: number, maxDenom: number = 10000): string {
  if (decimal === 0) return '0';
  if (decimal === 1) return '1';
  if (!isFinite(decimal)) return 'N/A';

  // Try to find best rational approximation using Stern-Brocot approach
  let bestNum = 0;
  let bestDen = 1;
  let bestError = Math.abs(decimal);

  for (let den = 1; den <= maxDenom; den++) {
    const num = Math.round(decimal * den);
    const error = Math.abs(decimal - num / den);
    if (error < bestError) {
      bestError = error;
      bestNum = num;
      bestDen = den;
      if (error < 1e-10) break;
    }
  }

  if (bestDen === 1) return String(bestNum);
  return `${bestNum}/${bestDen}`;
}

/**
 * Probability calculator — computes probabilities for single events, complements,
 * unions, intersections, conditional probability, permutations, and combinations.
 *
 * Formulas:
 *   Single event:           P(A) = favorable / total
 *   Complement:             P(A') = 1 - P(A)
 *   Union:                  P(A ∪ B) = P(A) + P(B) - P(A ∩ B)
 *   Independent intersection: P(A ∩ B) = P(A) × P(B)
 *   Conditional:            P(A|B) = P(A ∩ B) / P(B)
 *   Permutation:            nPr = n! / (n - r)!
 *   Combination:            nCr = n! / (r!(n - r)!)
 *
 * Source: Classical probability definitions from Blaise Pascal and Pierre de Fermat
 *         (17th century). Combinatorics formulas from Pascal's Traité du triangle
 *         arithmétique (1654). Formalized in Kolmogorov's axioms (1933).
 */
export function calculateProbability(inputs: Record<string, unknown>): Record<string, unknown> {
  const mode = String(inputs.mode || 'single') as ProbabilityMode;

  let result: number;
  let expression: string;

  switch (mode) {
    case 'single': {
      const favorable = Number(inputs.favorableOutcomes);
      const total = Number(inputs.totalOutcomes);

      if (isNaN(favorable) || isNaN(total)) {
        throw new Error('Favorable outcomes and total outcomes must be valid numbers');
      }
      if (total === 0) {
        throw new Error('Total outcomes cannot be zero');
      }
      if (favorable < 0 || total < 0) {
        throw new Error('Outcomes must be non-negative');
      }
      if (favorable > total) {
        throw new Error('Favorable outcomes cannot exceed total outcomes');
      }

      result = favorable / total;
      expression = `P(A) = ${favorable} / ${total}`;
      break;
    }

    case 'complement': {
      const probA = Number(inputs.probabilityA);

      if (isNaN(probA)) {
        throw new Error('Probability of A must be a valid number');
      }
      if (probA < 0 || probA > 1) {
        throw new Error('Probability must be between 0 and 1');
      }

      result = 1 - probA;
      expression = `P(A') = 1 - ${probA}`;
      break;
    }

    case 'union': {
      const probA = Number(inputs.probabilityA);
      const probB = Number(inputs.probabilityB);
      const probBoth = Number(inputs.probabilityBoth);

      if (isNaN(probA) || isNaN(probB) || isNaN(probBoth)) {
        throw new Error('All probabilities must be valid numbers');
      }
      if (probA < 0 || probA > 1 || probB < 0 || probB > 1 || probBoth < 0 || probBoth > 1) {
        throw new Error('Probabilities must be between 0 and 1');
      }

      result = probA + probB - probBoth;
      expression = `P(A ∪ B) = ${probA} + ${probB} - ${probBoth}`;
      break;
    }

    case 'intersection-independent': {
      const probA = Number(inputs.probabilityA);
      const probB = Number(inputs.probabilityB);

      if (isNaN(probA) || isNaN(probB)) {
        throw new Error('Both probabilities must be valid numbers');
      }
      if (probA < 0 || probA > 1 || probB < 0 || probB > 1) {
        throw new Error('Probabilities must be between 0 and 1');
      }

      result = probA * probB;
      expression = `P(A ∩ B) = ${probA} × ${probB}`;
      break;
    }

    case 'conditional': {
      const probBoth = Number(inputs.probabilityBoth);
      const probB = Number(inputs.probabilityB);

      if (isNaN(probBoth) || isNaN(probB)) {
        throw new Error('Both probabilities must be valid numbers');
      }
      if (probB === 0) {
        throw new Error('P(B) cannot be zero for conditional probability');
      }
      if (probBoth < 0 || probBoth > 1 || probB < 0 || probB > 1) {
        throw new Error('Probabilities must be between 0 and 1');
      }

      result = probBoth / probB;
      expression = `P(A|B) = ${probBoth} / ${probB}`;
      break;
    }

    case 'permutation': {
      const n = Number(inputs.n);
      const r = Number(inputs.r);

      if (isNaN(n) || isNaN(r)) {
        throw new Error('n and r must be valid numbers');
      }

      const perm = permutation(n, r);
      result = perm;
      expression = `${n}P${r} = ${n}! / (${n}-${r})! = ${perm}`;
      break;
    }

    case 'combination': {
      const n = Number(inputs.n);
      const r = Number(inputs.r);

      if (isNaN(n) || isNaN(r)) {
        throw new Error('n and r must be valid numbers');
      }

      const comb = combination(n, r);
      result = comb;
      expression = `${n}C${r} = ${n}! / (${r}!(${n}-${r})!) = ${comb}`;
      break;
    }

    default:
      throw new Error(`Unknown mode: ${mode}`);
  }

  const resultPercentage = parseFloat((result * 100).toFixed(6));
  const resultFraction = (mode === 'permutation' || mode === 'combination')
    ? String(result)
    : toFraction(result);

  return {
    result: parseFloat(result.toFixed(10)),
    resultPercentage,
    resultFraction,
    expression,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'probability': calculateProbability,
};
