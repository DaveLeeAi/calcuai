import { calculateGPA } from '@/lib/formulas/everyday/gpa';

describe('calculateGPA', () => {
  // ─── Test 1: Perfect 4.0 GPA (all A's) ───
  it('calculates perfect 4.0 GPA when all grades are A', () => {
    const result = calculateGPA({
      courses: [
        { name: 'English 101', credits: 3, grade: 'A' },
        { name: 'Math 201', credits: 4, grade: 'A' },
        { name: 'History 101', credits: 3, grade: 'A' },
        { name: 'Biology 101', credits: 4, grade: 'A' },
      ],
      gradeScale: '4.0',
    });
    expect(result.semesterGPA).toBe(4.0);
    expect(result.totalCredits).toBe(14);
    expect(result.totalGradePoints).toBeCloseTo(56.0, 1);
    expect(result.cumulativeGPA).toBe(4.0);
  });

  // ─── Test 2: Mixed grades (A, B+, C, etc.) ───
  it('calculates correct GPA with mixed grades', () => {
    const result = calculateGPA({
      courses: [
        { name: 'English 101', credits: 3, grade: 'A' },    // 3 × 4.0 = 12.0
        { name: 'Math 201', credits: 4, grade: 'B+' },      // 4 × 3.3 = 13.2
        { name: 'History 101', credits: 3, grade: 'C' },     // 3 × 2.0 = 6.0
        { name: 'Biology 101', credits: 3, grade: 'B' },     // 3 × 3.0 = 9.0
        { name: 'Art 101', credits: 2, grade: 'A-' },        // 2 × 3.7 = 7.4
      ],
      gradeScale: '4.0',
    });
    // Total quality points = 12.0 + 13.2 + 6.0 + 9.0 + 7.4 = 47.6
    // Total credits = 15
    // GPA = 47.6 / 15 = 3.17 (rounded to 2 decimal places)
    expect(result.semesterGPA).toBeCloseTo(3.17, 2);
    expect(result.totalCredits).toBe(15);
    expect(result.totalGradePoints).toBeCloseTo(47.6, 1);
  });

  // ─── Test 3: 4.3 scale with A+ ───
  it('calculates GPA on 4.3 scale with A+ grade', () => {
    const result = calculateGPA({
      courses: [
        { name: 'English 101', credits: 3, grade: 'A+' },   // 3 × 4.3 = 12.9
        { name: 'Math 201', credits: 3, grade: 'A' },       // 3 × 4.0 = 12.0
        { name: 'History 101', credits: 3, grade: 'B+' },   // 3 × 3.3 = 9.9
      ],
      gradeScale: '4.3',
    });
    // Total quality points = 12.9 + 12.0 + 9.9 = 34.8
    // Total credits = 9
    // GPA = 34.8 / 9 = 3.87
    expect(result.semesterGPA).toBeCloseTo(3.87, 2);
    expect(result.totalCredits).toBe(9);
    expect(result.totalGradePoints).toBeCloseTo(34.8, 1);
  });

  // ─── Test 4: Single course ───
  it('calculates GPA correctly for a single course', () => {
    const result = calculateGPA({
      courses: [
        { name: 'Music 101', credits: 3, grade: 'B' },
      ],
      gradeScale: '4.0',
    });
    expect(result.semesterGPA).toBe(3.0);
    expect(result.totalCredits).toBe(3);
    expect(result.totalGradePoints).toBeCloseTo(9.0, 1);
    expect(result.cumulativeGPA).toBe(3.0);
  });

  // ─── Test 5: All F's = 0.0 ───
  it('returns 0.0 GPA when all grades are F', () => {
    const result = calculateGPA({
      courses: [
        { name: 'English 101', credits: 3, grade: 'F' },
        { name: 'Math 201', credits: 4, grade: 'F' },
        { name: 'History 101', credits: 3, grade: 'F' },
      ],
      gradeScale: '4.0',
    });
    expect(result.semesterGPA).toBe(0);
    expect(result.totalCredits).toBe(10);
    expect(result.totalGradePoints).toBeCloseTo(0, 1);
  });

  // ─── Test 6: Different credit weights (1-credit vs 4-credit) ───
  it('weights higher-credit courses more heavily', () => {
    const result = calculateGPA({
      courses: [
        { name: 'Lab 101', credits: 1, grade: 'F' },     // 1 × 0.0 = 0.0
        { name: 'Calc 301', credits: 4, grade: 'A' },    // 4 × 4.0 = 16.0
      ],
      gradeScale: '4.0',
    });
    // Total quality points = 0 + 16.0 = 16.0
    // Total credits = 5
    // GPA = 16.0 / 5 = 3.20
    expect(result.semesterGPA).toBeCloseTo(3.20, 2);
    expect(result.totalCredits).toBe(5);
  });

  // ─── Test 7: Cumulative GPA with existing record ───
  it('calculates cumulative GPA with previous GPA and credits', () => {
    const result = calculateGPA({
      courses: [
        { name: 'English 201', credits: 3, grade: 'A' },   // 3 × 4.0 = 12.0
        { name: 'Math 301', credits: 3, grade: 'B' },      // 3 × 3.0 = 9.0
        { name: 'Physics 201', credits: 4, grade: 'B+' },  // 4 × 3.3 = 13.2
      ],
      gradeScale: '4.0',
      currentGPA: 3.5,
      currentCredits: 60,
    });
    // New quality points = 12.0 + 9.0 + 13.2 = 34.2
    // New credits = 10
    // Previous quality points = 3.5 × 60 = 210.0
    // Combined = (210.0 + 34.2) / (60 + 10) = 244.2 / 70 = 3.49
    expect(result.semesterGPA).toBeCloseTo(3.42, 2);
    expect(result.cumulativeGPA).toBeCloseTo(3.49, 2);
    expect(result.totalCredits).toBe(10);
  });

  // ─── Test 8: Cumulative GPA with no previous (equals semester) ───
  it('sets cumulative GPA equal to semester GPA when no previous record exists', () => {
    const result = calculateGPA({
      courses: [
        { name: 'English 101', credits: 3, grade: 'B+' },
        { name: 'Math 101', credits: 3, grade: 'A-' },
      ],
      gradeScale: '4.0',
    });
    expect(result.semesterGPA).toBe(result.cumulativeGPA);
  });

  // ─── Test 9: Empty courses array ───
  it('returns zeroed output for empty courses array', () => {
    const result = calculateGPA({
      courses: [],
      gradeScale: '4.0',
    });
    expect(result.semesterGPA).toBe(0);
    expect(result.totalCredits).toBe(0);
    expect(result.totalGradePoints).toBe(0);
    expect(result.cumulativeGPA).toBe(0);
    const breakdown = result.courseBreakdown as unknown[];
    expect(breakdown).toHaveLength(0);
  });

  // ─── Test 10: Empty courses with existing cumulative preserves previous GPA ───
  it('preserves existing cumulative GPA when no new courses are entered', () => {
    const result = calculateGPA({
      courses: [],
      gradeScale: '4.0',
      currentGPA: 3.75,
      currentCredits: 90,
    });
    expect(result.semesterGPA).toBe(0);
    expect(result.cumulativeGPA).toBeCloseTo(3.75, 2);
  });

  // ─── Test 11: All same grade ───
  it('returns exactly the grade point value when all courses have the same grade', () => {
    const result = calculateGPA({
      courses: [
        { name: 'Course A', credits: 3, grade: 'B' },
        { name: 'Course B', credits: 4, grade: 'B' },
        { name: 'Course C', credits: 2, grade: 'B' },
      ],
      gradeScale: '4.0',
    });
    expect(result.semesterGPA).toBe(3.0);
  });

  // ─── Test 12: Heavy credit course dominates GPA ───
  it('shows that a heavy-credit course dominates the GPA', () => {
    const result = calculateGPA({
      courses: [
        { name: 'Senior Thesis', credits: 12, grade: 'A' },   // 12 × 4.0 = 48.0
        { name: 'Elective', credits: 1, grade: 'C' },         // 1 × 2.0 = 2.0
      ],
      gradeScale: '4.0',
    });
    // Total = 50.0 / 13 = 3.85
    expect(result.semesterGPA).toBeCloseTo(3.85, 2);
  });

  // ─── Test 13: D-range grades ───
  it('correctly handles D+, D, and D- grades', () => {
    const result = calculateGPA({
      courses: [
        { name: 'Course A', credits: 3, grade: 'D+' },  // 3 × 1.3 = 3.9
        { name: 'Course B', credits: 3, grade: 'D' },   // 3 × 1.0 = 3.0
        { name: 'Course C', credits: 3, grade: 'D-' },  // 3 × 0.7 = 2.1
      ],
      gradeScale: '4.0',
    });
    // Total quality points = 3.9 + 3.0 + 2.1 = 9.0
    // GPA = 9.0 / 9 = 1.0
    expect(result.semesterGPA).toBe(1.0);
    expect(result.totalGradePoints).toBeCloseTo(9.0, 1);
  });

  // ─── Test 14: A+ on 4.0 scale is treated as A (not available) ───
  it('ignores A+ grade on 4.0 scale (not a valid grade)', () => {
    const result = calculateGPA({
      courses: [
        { name: 'Course A', credits: 3, grade: 'A+' },   // invalid on 4.0 scale
        { name: 'Course B', credits: 3, grade: 'A' },    // 3 × 4.0 = 12.0
      ],
      gradeScale: '4.0',
    });
    // A+ is not in 4.0 scale, so only Course B counts
    expect(result.totalCredits).toBe(3);
    expect(result.semesterGPA).toBe(4.0);
  });

  // ─── Test 15: Course breakdown table output ───
  it('returns correct course breakdown table', () => {
    const result = calculateGPA({
      courses: [
        { name: 'Biology 101', credits: 4, grade: 'A-' },
        { name: 'English 102', credits: 3, grade: 'B+' },
      ],
      gradeScale: '4.0',
    });
    const breakdown = result.courseBreakdown as Array<{
      course: string;
      credits: number;
      grade: string;
      gradePoints: number;
      qualityPoints: number;
    }>;
    expect(breakdown).toHaveLength(2);

    // Biology 101: 4 credits × 3.7 = 14.8 quality points
    expect(breakdown[0].course).toBe('Biology 101');
    expect(breakdown[0].credits).toBe(4);
    expect(breakdown[0].grade).toBe('A-');
    expect(breakdown[0].gradePoints).toBe(3.7);
    expect(breakdown[0].qualityPoints).toBeCloseTo(14.8, 1);

    // English 102: 3 credits × 3.3 = 9.9 quality points
    expect(breakdown[1].course).toBe('English 102');
    expect(breakdown[1].credits).toBe(3);
    expect(breakdown[1].grade).toBe('B+');
    expect(breakdown[1].gradePoints).toBe(3.3);
    expect(breakdown[1].qualityPoints).toBeCloseTo(9.9, 1);
  });

  // ─── Test 16: Cumulative GPA pulled down by bad semester ───
  it('cumulative GPA drops when new semester GPA is below current', () => {
    const result = calculateGPA({
      courses: [
        { name: 'Course A', credits: 3, grade: 'C' },   // 3 × 2.0 = 6.0
        { name: 'Course B', credits: 3, grade: 'C-' },  // 3 × 1.7 = 5.1
        { name: 'Course C', credits: 3, grade: 'D+' },  // 3 × 1.3 = 3.9
      ],
      gradeScale: '4.0',
      currentGPA: 3.8,
      currentCredits: 90,
    });
    // New quality points = 6.0 + 5.1 + 3.9 = 15.0
    // New credits = 9
    // Previous quality points = 3.8 × 90 = 342.0
    // Combined = (342.0 + 15.0) / (90 + 9) = 357.0 / 99 = 3.61 (rounded)
    expect(result.semesterGPA).toBeCloseTo(1.67, 2);
    expect(result.cumulativeGPA).toBeCloseTo(3.61, 2);
    // Cumulative must be below original 3.8
    expect(result.cumulativeGPA as number).toBeLessThan(3.8);
  });

  // ─── Test 17: The BLUF example from the MDX intro ───
  it('matches the BLUF example: 15 credits, three As + B+ + B = 3.66', () => {
    const result = calculateGPA({
      courses: [
        { name: 'Course 1', credits: 3, grade: 'A' },   // 3 × 4.0 = 12.0
        { name: 'Course 2', credits: 3, grade: 'A' },   // 3 × 4.0 = 12.0
        { name: 'Course 3', credits: 3, grade: 'A' },   // 3 × 4.0 = 12.0
        { name: 'Course 4', credits: 3, grade: 'B+' },  // 3 × 3.3 = 9.9
        { name: 'Course 5', credits: 3, grade: 'B' },   // 3 × 3.0 = 9.0
      ],
      gradeScale: '4.0',
    });
    // Total quality points = 12.0 + 12.0 + 12.0 + 9.9 + 9.0 = 54.9
    // GPA = 54.9 / 15 = 3.66
    expect(result.semesterGPA).toBeCloseTo(3.66, 2);
    expect(result.totalCredits).toBe(15);
    expect(result.totalGradePoints).toBeCloseTo(54.9, 1);
  });

  // ─── Test 18: Zero-credit course is ignored ───
  it('ignores courses with zero credits', () => {
    const result = calculateGPA({
      courses: [
        { name: 'Real Course', credits: 3, grade: 'A' },
        { name: 'Zero Credit', credits: 0, grade: 'A' },
      ],
      gradeScale: '4.0',
    });
    expect(result.totalCredits).toBe(3);
    const breakdown = result.courseBreakdown as unknown[];
    expect(breakdown).toHaveLength(1);
  });

  // ─── Test 19: Mixed plus/minus on 4.3 scale ───
  it('handles full plus/minus spread on 4.3 scale', () => {
    const result = calculateGPA({
      courses: [
        { name: 'Course A', credits: 3, grade: 'A+' },  // 3 × 4.3 = 12.9
        { name: 'Course B', credits: 3, grade: 'B-' },  // 3 × 2.7 = 8.1
        { name: 'Course C', credits: 3, grade: 'C+' },  // 3 × 2.3 = 6.9
      ],
      gradeScale: '4.3',
    });
    // Total quality points = 12.9 + 8.1 + 6.9 = 27.9
    // GPA = 27.9 / 9 = 3.10
    expect(result.semesterGPA).toBeCloseTo(3.10, 2);
    expect(result.totalGradePoints).toBeCloseTo(27.9, 1);
  });

  // ─── Test 20: Cumulative with high existing GPA and one new course ───
  it('calculates cumulative correctly with large prior credit base', () => {
    const result = calculateGPA({
      courses: [
        { name: 'Final Elective', credits: 3, grade: 'A' },  // 3 × 4.0 = 12.0
      ],
      gradeScale: '4.0',
      currentGPA: 3.2,
      currentCredits: 120,
    });
    // Previous quality points = 3.2 × 120 = 384.0
    // Combined = (384.0 + 12.0) / (120 + 3) = 396.0 / 123 = 3.22
    expect(result.semesterGPA).toBe(4.0);
    expect(result.cumulativeGPA).toBeCloseTo(3.22, 2);
  });
});
