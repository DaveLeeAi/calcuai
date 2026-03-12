/**
 * Final Grade Calculator
 *
 * Calculates your final course grade given individual assignment/category
 * scores and their weights. Unlike the Grade Calculator (which asks
 * "what do I need on the final?"), this calculator asks "what IS my
 * final grade given all these scores?"
 *
 * Formula:
 *   finalGrade = Σ(score_i × weight_i) / Σ(weight_i)
 *
 * Where:
 *   score_i  = the percentage score for category i (0-100)
 *   weight_i = the weight of category i (as a percentage of total)
 *
 * Source: Standard weighted average formula used in educational grading systems.
 *         Reference: AACRAO grading calculation standards.
 */

// ═══════════════════════════════════════════════════════
// Interfaces
// ═══════════════════════════════════════════════════════

export interface GradeCategory {
  name: string;
  score: number;
  weight: number;
}

export interface CategoryBreakdown {
  name: string;
  score: number;
  weight: number;
  weightedScore: number;
  contribution: number; // percentage of total weighted score
}

export interface FinalGradeOutput {
  finalGrade: number;
  letterGrade: string;
  totalWeight: number;
  isWeightComplete: boolean;
  categoryBreakdown: CategoryBreakdown[];
  highestCategory: string;
  lowestCategory: string;
  passFail: string;
}

// ═══════════════════════════════════════════════════════
// Helper functions
// ═══════════════════════════════════════════════════════

/**
 * Converts a numeric grade (0-100) to a standard letter grade.
 */
export function toLetterGrade(numericGrade: number): string {
  if (numericGrade >= 97) return 'A+';
  if (numericGrade >= 93) return 'A';
  if (numericGrade >= 90) return 'A-';
  if (numericGrade >= 87) return 'B+';
  if (numericGrade >= 83) return 'B';
  if (numericGrade >= 80) return 'B-';
  if (numericGrade >= 77) return 'C+';
  if (numericGrade >= 73) return 'C';
  if (numericGrade >= 70) return 'C-';
  if (numericGrade >= 67) return 'D+';
  if (numericGrade >= 63) return 'D';
  if (numericGrade >= 60) return 'D-';
  return 'F';
}

// ═══════════════════════════════════════════════════════
// Main function: Final Grade Calculator
// ═══════════════════════════════════════════════════════

/**
 * Calculates the final weighted course grade from category scores and weights.
 *
 * finalGrade = Σ(score_i × weight_i) / Σ(weight_i)
 *
 * @param inputs - Record with categories array of {name, score, weight}
 * @returns Record with final grade, letter grade, and category breakdown
 */
export function calculateFinalGrade(inputs: Record<string, unknown>): Record<string, unknown> {
  const rawCategories = inputs.categories;

  // Parse categories
  const categories: GradeCategory[] = [];
  if (Array.isArray(rawCategories)) {
    for (const entry of rawCategories) {
      if (
        entry &&
        typeof entry === 'object' &&
        'name' in entry &&
        'score' in entry &&
        'weight' in entry
      ) {
        const rec = entry as Record<string, unknown>;
        const name = String(rec.name || 'Category');
        const score = Math.max(0, Math.min(200, Number(rec.score) || 0));
        const weight = Math.max(0, Math.min(100, Number(rec.weight) || 0));
        if (weight > 0) {
          categories.push({ name, score, weight });
        }
      }
    }
  }

  // Handle empty categories
  if (categories.length === 0) {
    return {
      finalGrade: 0,
      letterGrade: 'F',
      totalWeight: 0,
      isWeightComplete: false,
      categoryBreakdown: [],
      highestCategory: 'N/A',
      lowestCategory: 'N/A',
      passFail: 'Fail',
    };
  }

  // Calculate weighted scores
  const totalWeight = categories.reduce((sum, cat) => sum + cat.weight, 0);
  let totalWeightedScore = 0;

  const categoryBreakdown: CategoryBreakdown[] = categories.map(cat => {
    const weightDecimal = cat.weight / 100;
    const weightedScore = parseFloat((cat.score * weightDecimal).toFixed(2));
    totalWeightedScore += cat.score * weightDecimal;

    return {
      name: cat.name,
      score: cat.score,
      weight: cat.weight,
      weightedScore,
      contribution: 0, // set below after total is known
    };
  });

  // Normalize if weights don't sum to 100
  const finalGrade = totalWeight > 0
    ? parseFloat(((totalWeightedScore / totalWeight) * 100).toFixed(2))
    : 0;

  // Set contribution percentages
  for (const row of categoryBreakdown) {
    row.contribution = totalWeightedScore > 0
      ? parseFloat(((row.weightedScore / totalWeightedScore) * 100).toFixed(1))
      : 0;
  }

  // Find highest and lowest categories
  const sorted = [...categories].sort((a, b) => b.score - a.score);
  const highestCategory = sorted[0].name;
  const lowestCategory = sorted[sorted.length - 1].name;

  const isWeightComplete = Math.abs(totalWeight - 100) < 0.01;
  const passFail = finalGrade >= 60 ? 'Pass' : 'Fail';

  return {
    finalGrade,
    letterGrade: toLetterGrade(finalGrade),
    totalWeight,
    isWeightComplete,
    categoryBreakdown,
    highestCategory,
    lowestCategory,
    passFail,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'final-grade': calculateFinalGrade,
};
