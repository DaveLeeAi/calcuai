/**
 * GPA Calculator
 * GPA = Σ(credit hours × grade points) / Σ(credit hours)
 *
 * Where:
 *   GPA         = Grade Point Average (weighted mean)
 *   credit hours = the credit weight of each course
 *   grade points = numeric value assigned to a letter grade
 *
 * The formula computes a weighted average: each course contributes
 * proportionally to its credit hours. A 4-credit A (16 quality points)
 * influences the GPA more than a 1-credit A (4 quality points).
 *
 * For cumulative GPA with prior history:
 *   Cumulative GPA = (previous quality points + new quality points) /
 *                     (previous credits + new credits)
 *
 * Source: American Association of Collegiate Registrars and Admissions
 *         Officers (AACRAO) grading practices and GPA calculation standards.
 */

/** Grade point values for the standard 4.0 scale (no A+) */
const GRADE_POINTS_4_0: Record<string, number> = {
  'A':  4.0,
  'A-': 3.7,
  'B+': 3.3,
  'B':  3.0,
  'B-': 2.7,
  'C+': 2.3,
  'C':  2.0,
  'C-': 1.7,
  'D+': 1.3,
  'D':  1.0,
  'D-': 0.7,
  'F':  0.0,
};

/** Grade point values for the 4.3 scale (includes A+ = 4.3) */
const GRADE_POINTS_4_3: Record<string, number> = {
  'A+': 4.3,
  'A':  4.0,
  'A-': 3.7,
  'B+': 3.3,
  'B':  3.0,
  'B-': 2.7,
  'C+': 2.3,
  'C':  2.0,
  'C-': 1.7,
  'D+': 1.3,
  'D':  1.0,
  'D-': 0.7,
  'F':  0.0,
};

export interface CourseEntry {
  name: string;
  credits: number;
  grade: string;
}

export interface CourseBreakdownRow {
  course: string;
  credits: number;
  grade: string;
  gradePoints: number;
  qualityPoints: number;
}

export interface GPAOutput {
  semesterGPA: number;
  totalCredits: number;
  totalGradePoints: number;
  cumulativeGPA: number;
  courseBreakdown: CourseBreakdownRow[];
}

/**
 * Looks up the grade point value for a given letter grade on the specified scale.
 * Returns undefined if the grade is not recognized.
 */
export function getGradePointValue(grade: string, scale: '4.0' | '4.3'): number | undefined {
  const gradeMap = scale === '4.3' ? GRADE_POINTS_4_3 : GRADE_POINTS_4_0;
  return gradeMap[grade];
}

/**
 * Returns all valid letter grades for the specified scale.
 */
export function getValidGrades(scale: '4.0' | '4.3'): string[] {
  const gradeMap = scale === '4.3' ? GRADE_POINTS_4_3 : GRADE_POINTS_4_0;
  return Object.keys(gradeMap);
}

/**
 * GPA = Σ(credit hours × grade points) / Σ(credit hours)
 *
 * Accepts a Record<string, unknown> for compatibility with the formula registry.
 * Expected keys:
 *   - courses: CourseEntry[] — array of {name, credits, grade}
 *   - gradeScale: '4.0' | '4.3'
 *   - currentGPA?: number — existing cumulative GPA (for College tab)
 *   - currentCredits?: number — existing total credits (for College tab)
 */
export function calculateGPA(inputs: Record<string, unknown>): Record<string, unknown> {
  const rawCourses = inputs.courses;
  const gradeScale = (String(inputs.gradeScale) === '4.3' ? '4.3' : '4.0') as '4.0' | '4.3';
  const currentGPA = inputs.currentGPA !== undefined && inputs.currentGPA !== null
    ? Number(inputs.currentGPA)
    : undefined;
  const currentCredits = inputs.currentCredits !== undefined && inputs.currentCredits !== null
    ? Number(inputs.currentCredits)
    : undefined;

  // Parse courses
  const courses: CourseEntry[] = [];
  if (Array.isArray(rawCourses)) {
    for (const entry of rawCourses) {
      if (
        entry &&
        typeof entry === 'object' &&
        'name' in entry &&
        'credits' in entry &&
        'grade' in entry
      ) {
        const credits = Number((entry as Record<string, unknown>).credits);
        const grade = String((entry as Record<string, unknown>).grade);
        const name = String((entry as Record<string, unknown>).name);
        if (credits > 0 && getGradePointValue(grade, gradeScale) !== undefined) {
          courses.push({ name, credits, grade });
        }
      }
    }
  }

  // Handle empty courses — return zeroed output
  if (courses.length === 0) {
    return {
      semesterGPA: 0,
      totalCredits: 0,
      totalGradePoints: 0,
      cumulativeGPA: currentGPA !== undefined && currentCredits !== undefined && currentCredits > 0
        ? parseFloat(currentGPA.toFixed(2))
        : 0,
      courseBreakdown: [],
    };
  }

  // Build course breakdown and compute totals
  const courseBreakdown: CourseBreakdownRow[] = [];
  let totalCredits = 0;
  let totalQualityPoints = 0;

  for (const course of courses) {
    const gradePointValue = getGradePointValue(course.grade, gradeScale) ?? 0;
    const qualityPoints = parseFloat((course.credits * gradePointValue).toFixed(1));

    courseBreakdown.push({
      course: course.name,
      credits: course.credits,
      grade: course.grade,
      gradePoints: gradePointValue,
      qualityPoints,
    });

    totalCredits += course.credits;
    totalQualityPoints += course.credits * gradePointValue;
  }

  // Semester GPA = total quality points / total credits
  const semesterGPA = totalCredits > 0
    ? parseFloat((totalQualityPoints / totalCredits).toFixed(2))
    : 0;

  // Cumulative GPA calculation
  let cumulativeGPA: number;
  if (
    currentGPA !== undefined &&
    currentCredits !== undefined &&
    currentCredits > 0 &&
    !isNaN(currentGPA) &&
    !isNaN(currentCredits)
  ) {
    const previousQualityPoints = currentGPA * currentCredits;
    const combinedCredits = currentCredits + totalCredits;
    const combinedQualityPoints = previousQualityPoints + totalQualityPoints;
    cumulativeGPA = combinedCredits > 0
      ? parseFloat((combinedQualityPoints / combinedCredits).toFixed(2))
      : 0;
  } else {
    // No previous GPA — cumulative equals semester
    cumulativeGPA = semesterGPA;
  }

  return {
    semesterGPA,
    totalCredits,
    totalGradePoints: parseFloat(totalQualityPoints.toFixed(1)),
    cumulativeGPA,
    courseBreakdown,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'gpa': calculateGPA,
};
