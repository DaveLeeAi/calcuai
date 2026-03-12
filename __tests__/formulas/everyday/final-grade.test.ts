import { calculateFinalGrade, toLetterGrade } from '@/lib/formulas/everyday/final-grade';

describe('toLetterGrade (final-grade module)', () => {
  it('maps boundary values correctly', () => {
    expect(toLetterGrade(97)).toBe('A+');
    expect(toLetterGrade(93)).toBe('A');
    expect(toLetterGrade(90)).toBe('A-');
    expect(toLetterGrade(87)).toBe('B+');
    expect(toLetterGrade(83)).toBe('B');
    expect(toLetterGrade(60)).toBe('D-');
    expect(toLetterGrade(59)).toBe('F');
  });
});

describe('calculateFinalGrade', () => {
  // ─── Test 1: Standard 4-category course ───
  it('calculates weighted final grade for a 4-category course', () => {
    const result = calculateFinalGrade({
      categories: [
        { name: 'Homework', score: 95, weight: 20 },
        { name: 'Midterms', score: 82, weight: 30 },
        { name: 'Project', score: 88, weight: 20 },
        { name: 'Final', score: 79, weight: 30 },
      ],
    });
    // (95*0.2 + 82*0.3 + 88*0.2 + 79*0.3) = 19 + 24.6 + 17.6 + 23.7 = 84.9
    // Normalize: 84.9 / 1.0 * 100 = 84.9
    expect(result.finalGrade).toBeCloseTo(84.9, 1);
    expect(result.letterGrade).toBe('B');
    expect(result.passFail).toBe('Pass');
    expect(result.isWeightComplete).toBe(true);
  });

  // ─── Test 2: Single category ───
  it('returns the score directly for a single 100% weighted category', () => {
    const result = calculateFinalGrade({
      categories: [
        { name: 'Final Exam', score: 78, weight: 100 },
      ],
    });
    expect(result.finalGrade).toBeCloseTo(78, 1);
    expect(result.letterGrade).toBe('C+');
  });

  // ─── Test 3: Equal weights ───
  it('calculates simple average when all weights are equal', () => {
    const result = calculateFinalGrade({
      categories: [
        { name: 'A', score: 90, weight: 25 },
        { name: 'B', score: 80, weight: 25 },
        { name: 'C', score: 70, weight: 25 },
        { name: 'D', score: 60, weight: 25 },
      ],
    });
    expect(result.finalGrade).toBeCloseTo(75, 1);
    expect(result.letterGrade).toBe('C');
  });

  // ─── Test 4: Weights not summing to 100% ───
  it('normalizes when weights do not sum to 100%', () => {
    const result = calculateFinalGrade({
      categories: [
        { name: 'Homework', score: 90, weight: 20 },
        { name: 'Midterm', score: 80, weight: 30 },
      ],
    });
    // weighted sum = 90*0.2 + 80*0.3 = 18 + 24 = 42
    // total weight = 50, normalize = (42/50)*100 = 84
    expect(result.finalGrade).toBeCloseTo(84, 1);
    expect(result.isWeightComplete).toBe(false);
    expect(result.totalWeight).toBe(50);
  });

  // ─── Test 5: Perfect scores ───
  it('handles all perfect scores', () => {
    const result = calculateFinalGrade({
      categories: [
        { name: 'A', score: 100, weight: 50 },
        { name: 'B', score: 100, weight: 50 },
      ],
    });
    expect(result.finalGrade).toBeCloseTo(100, 1);
    expect(result.letterGrade).toBe('A+');
  });

  // ─── Test 6: All zeros ───
  it('handles all zero scores', () => {
    const result = calculateFinalGrade({
      categories: [
        { name: 'A', score: 0, weight: 50 },
        { name: 'B', score: 0, weight: 50 },
      ],
    });
    expect(result.finalGrade).toBe(0);
    expect(result.letterGrade).toBe('F');
    expect(result.passFail).toBe('Fail');
  });

  // ─── Test 7: Empty categories ───
  it('returns zeroed output for empty categories', () => {
    const result = calculateFinalGrade({ categories: [] });
    expect(result.finalGrade).toBe(0);
    expect(result.letterGrade).toBe('F');
    expect(result.categoryBreakdown).toEqual([]);
    expect(result.highestCategory).toBe('N/A');
  });

  // ─── Test 8: Category breakdown structure ───
  it('returns correct category breakdown', () => {
    const result = calculateFinalGrade({
      categories: [
        { name: 'Quizzes', score: 90, weight: 30 },
        { name: 'Final', score: 70, weight: 70 },
      ],
    });
    const breakdown = result.categoryBreakdown as { name: string; weightedScore: number }[];
    expect(breakdown).toHaveLength(2);
    expect(breakdown[0].name).toBe('Quizzes');
    expect(breakdown[0].weightedScore).toBeCloseTo(27, 0);
    expect(breakdown[1].name).toBe('Final');
    expect(breakdown[1].weightedScore).toBeCloseTo(49, 0);
  });

  // ─── Test 9: Highest and lowest category ───
  it('identifies highest and lowest categories', () => {
    const result = calculateFinalGrade({
      categories: [
        { name: 'Homework', score: 95, weight: 20 },
        { name: 'Midterm', score: 65, weight: 40 },
        { name: 'Final', score: 80, weight: 40 },
      ],
    });
    expect(result.highestCategory).toBe('Homework');
    expect(result.lowestCategory).toBe('Midterm');
  });

  // ─── Test 10: Failing grade ───
  it('correctly identifies failing grade', () => {
    const result = calculateFinalGrade({
      categories: [
        { name: 'Everything', score: 55, weight: 100 },
      ],
    });
    expect(result.finalGrade).toBeCloseTo(55, 1);
    expect(result.passFail).toBe('Fail');
    expect(result.letterGrade).toBe('F');
  });

  // ─── Test 11: Extra credit (score > 100) ───
  it('handles extra credit scores above 100', () => {
    const result = calculateFinalGrade({
      categories: [
        { name: 'Homework', score: 105, weight: 30 },
        { name: 'Exams', score: 85, weight: 70 },
      ],
    });
    // weighted = 105*0.3 + 85*0.7 = 31.5 + 59.5 = 91
    expect(result.finalGrade).toBeCloseTo(91, 1);
  });

  // ─── Test 12: Zero weight categories are filtered ───
  it('filters out categories with zero weight', () => {
    const result = calculateFinalGrade({
      categories: [
        { name: 'Valid', score: 80, weight: 100 },
        { name: 'ZeroWeight', score: 100, weight: 0 },
      ],
    });
    expect(result.finalGrade).toBeCloseTo(80, 1);
    const breakdown = result.categoryBreakdown as { name: string }[];
    expect(breakdown).toHaveLength(1);
  });
});
