/**
 * Test Grade Calculator
 *
 * Calculates a test/quiz grade from correct and total answers:
 *
 *   Percentage = (correct / total) x 100
 *   Letter Grade = lookup(percentage)
 *
 * Standard US letter grade scale:
 *   A+  = 97-100    A  = 93-96.99    A- = 90-92.99
 *   B+  = 87-89.99  B  = 83-86.99    B- = 80-82.99
 *   C+  = 77-79.99  C  = 73-76.99    C- = 70-72.99
 *   D+  = 67-69.99  D  = 63-66.99    D- = 60-62.99
 *   F   = below 60
 *
 * GPA scale: A=4.0, B=3.0, C=2.0, D=1.0, F=0.0 (with +/- adjustments of 0.3)
 *
 * Source: Standard US academic grading scale
 */

export interface TestGradeInput {
  correctAnswers: number;
  totalQuestions: number;
  gradingScale?: 'standard' | 'plus-minus' | 'pass-fail';
}

export interface TestGradeOutput {
  percentage: number;
  letterGrade: string;
  gpaPoints: number;
  correctAnswers: number;
  totalQuestions: number;
  incorrectAnswers: number;
  isPassing: boolean;
}

interface GradeEntry {
  minPercent: number;
  letter: string;
  gpa: number;
}

const PLUS_MINUS_SCALE: GradeEntry[] = [
  { minPercent: 97, letter: 'A+', gpa: 4.0 },
  { minPercent: 93, letter: 'A', gpa: 4.0 },
  { minPercent: 90, letter: 'A-', gpa: 3.7 },
  { minPercent: 87, letter: 'B+', gpa: 3.3 },
  { minPercent: 83, letter: 'B', gpa: 3.0 },
  { minPercent: 80, letter: 'B-', gpa: 2.7 },
  { minPercent: 77, letter: 'C+', gpa: 2.3 },
  { minPercent: 73, letter: 'C', gpa: 2.0 },
  { minPercent: 70, letter: 'C-', gpa: 1.7 },
  { minPercent: 67, letter: 'D+', gpa: 1.3 },
  { minPercent: 63, letter: 'D', gpa: 1.0 },
  { minPercent: 60, letter: 'D-', gpa: 0.7 },
  { minPercent: 0, letter: 'F', gpa: 0.0 },
];

const STANDARD_SCALE: GradeEntry[] = [
  { minPercent: 90, letter: 'A', gpa: 4.0 },
  { minPercent: 80, letter: 'B', gpa: 3.0 },
  { minPercent: 70, letter: 'C', gpa: 2.0 },
  { minPercent: 60, letter: 'D', gpa: 1.0 },
  { minPercent: 0, letter: 'F', gpa: 0.0 },
];

function lookupGrade(percentage: number, scale: GradeEntry[]): GradeEntry {
  for (const entry of scale) {
    if (percentage >= entry.minPercent) {
      return entry;
    }
  }
  return scale[scale.length - 1];
}

export function calculateTestGrade(inputs: Record<string, unknown>): Record<string, unknown> {
  const correct = Number(inputs.correctAnswers);
  const total = Number(inputs.totalQuestions);
  const gradingScale = String(inputs.gradingScale || 'plus-minus');

  // Validation
  if (isNaN(correct) || isNaN(total)) {
    return {
      percentage: null,
      letterGrade: null,
      gpaPoints: null,
      correctAnswers: correct || 0,
      totalQuestions: total || 0,
      incorrectAnswers: null,
      isPassing: false,
      error: 'Please enter valid numbers for correct answers and total questions.',
    };
  }

  if (total <= 0) {
    return {
      percentage: null,
      letterGrade: null,
      gpaPoints: null,
      correctAnswers: correct,
      totalQuestions: total,
      incorrectAnswers: null,
      isPassing: false,
      error: 'Total questions must be greater than 0.',
    };
  }

  if (correct < 0) {
    return {
      percentage: null,
      letterGrade: null,
      gpaPoints: null,
      correctAnswers: correct,
      totalQuestions: total,
      incorrectAnswers: null,
      isPassing: false,
      error: 'Correct answers cannot be negative.',
    };
  }

  if (correct > total) {
    return {
      percentage: null,
      letterGrade: null,
      gpaPoints: null,
      correctAnswers: correct,
      totalQuestions: total,
      incorrectAnswers: null,
      isPassing: false,
      error: 'Correct answers cannot exceed total questions.',
    };
  }

  const percentage = (correct / total) * 100;
  const percentRounded = parseFloat(percentage.toFixed(2));

  let letterGrade: string;
  let gpaPoints: number;

  if (gradingScale === 'pass-fail') {
    letterGrade = percentage >= 60 ? 'P' : 'F';
    gpaPoints = percentage >= 60 ? 1.0 : 0.0;
  } else {
    const scale = gradingScale === 'standard' ? STANDARD_SCALE : PLUS_MINUS_SCALE;
    const grade = lookupGrade(percentRounded, scale);
    letterGrade = grade.letter;
    gpaPoints = grade.gpa;
  }

  return {
    percentage: percentRounded,
    letterGrade,
    gpaPoints,
    correctAnswers: correct,
    totalQuestions: total,
    incorrectAnswers: total - correct,
    isPassing: percentRounded >= 60,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'test-grade': calculateTestGrade,
};
