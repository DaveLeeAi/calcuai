/**
 * Grade Calculator
 *
 * Calculates what grade you need on a final exam to achieve
 * a desired course grade, given your current grade and the
 * weight of the final exam.
 *
 * Formula:
 *   requiredFinalGrade = (desiredGrade - currentGrade × (1 - finalWeight)) / finalWeight
 *
 * Where:
 *   currentGrade  = your current course grade (0-100%)
 *   desiredGrade  = the course grade you want to achieve (0-100%)
 *   finalWeight   = the weight of the final exam as a decimal (e.g., 0.30 for 30%)
 *
 * Source: Standard weighted average formula used in educational grading systems.
 *         Reference: AACRAO (American Association of Collegiate Registrars
 *         and Admissions Officers) grading standards.
 */

// ═══════════════════════════════════════════════════════
// Interfaces
// ═══════════════════════════════════════════════════════

export interface GradeCalcOutput {
  requiredGrade: number;
  isPossible: boolean;
  isGuaranteed: boolean;
  currentGrade: number;
  desiredGrade: number;
  finalWeight: number;
  currentWeightedContribution: number;
  neededFromFinal: number;
  letterGradeNeeded: string;
  desiredLetterGrade: string;
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
// Main function: Grade Calculator
// ═══════════════════════════════════════════════════════

/**
 * Calculates the grade needed on a final exam to achieve
 * a desired overall course grade.
 *
 * requiredFinalGrade = (desiredGrade - currentGrade × (1 - finalWeight)) / finalWeight
 *
 * @param inputs - Record with currentGrade, desiredGrade, finalWeight
 * @returns Record with required final exam grade and feasibility flags
 */
export function calculateGradeNeeded(inputs: Record<string, unknown>): Record<string, unknown> {
  const currentGrade = Math.max(0, Math.min(100, Number(inputs.currentGrade) || 0));
  const desiredGrade = Math.max(0, Math.min(100, Number(inputs.desiredGrade) || 0));
  const finalWeightPercent = Math.max(1, Math.min(100, Number(inputs.finalWeight) || 30));
  const finalWeight = finalWeightPercent / 100;

  // requiredFinalGrade = (desiredGrade - currentGrade × (1 - finalWeight)) / finalWeight
  const currentWeightedContribution = currentGrade * (1 - finalWeight);
  const neededFromFinal = desiredGrade - currentWeightedContribution;
  const requiredGrade = parseFloat((neededFromFinal / finalWeight).toFixed(2));

  const isPossible = requiredGrade <= 100;
  const isGuaranteed = requiredGrade <= 0;

  return {
    requiredGrade: Math.max(0, requiredGrade),
    isPossible,
    isGuaranteed,
    currentGrade,
    desiredGrade,
    finalWeight: finalWeightPercent,
    currentWeightedContribution: parseFloat(currentWeightedContribution.toFixed(2)),
    neededFromFinal: parseFloat(neededFromFinal.toFixed(2)),
    letterGradeNeeded: isPossible ? toLetterGrade(Math.max(0, requiredGrade)) : 'Not possible',
    desiredLetterGrade: toLetterGrade(desiredGrade),
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'grade': calculateGradeNeeded,
};
