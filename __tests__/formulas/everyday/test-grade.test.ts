import { calculateTestGrade } from '@/lib/formulas/everyday/test-grade';

describe('calculateTestGrade', () => {
  // ═══════════════════════════════════════════════════════
  // Basic grade calculations (plus-minus scale)
  // ═══════════════════════════════════════════════════════

  it('42/50 = 84% → B (plus-minus)', () => {
    const result = calculateTestGrade({ correctAnswers: 42, totalQuestions: 50 });
    expect(result.percentage).toBe(84);
    expect(result.letterGrade).toBe('B');
    expect(result.gpaPoints).toBe(3.0);
  });

  it('perfect score: 100/100 = 100% → A+', () => {
    const result = calculateTestGrade({ correctAnswers: 100, totalQuestions: 100 });
    expect(result.percentage).toBe(100);
    expect(result.letterGrade).toBe('A+');
    expect(result.gpaPoints).toBe(4.0);
  });

  it('95/100 = 95% → A', () => {
    const result = calculateTestGrade({ correctAnswers: 95, totalQuestions: 100 });
    expect(result.percentage).toBe(95);
    expect(result.letterGrade).toBe('A');
  });

  it('91/100 = 91% → A-', () => {
    const result = calculateTestGrade({ correctAnswers: 91, totalQuestions: 100 });
    expect(result.percentage).toBe(91);
    expect(result.letterGrade).toBe('A-');
    expect(result.gpaPoints).toBe(3.7);
  });

  it('50/100 = 50% → F', () => {
    const result = calculateTestGrade({ correctAnswers: 50, totalQuestions: 100 });
    expect(result.percentage).toBe(50);
    expect(result.letterGrade).toBe('F');
    expect(result.gpaPoints).toBe(0.0);
    expect(result.isPassing).toBe(false);
  });

  it('60/100 = 60% → D- (passing)', () => {
    const result = calculateTestGrade({ correctAnswers: 60, totalQuestions: 100 });
    expect(result.percentage).toBe(60);
    expect(result.letterGrade).toBe('D-');
    expect(result.isPassing).toBe(true);
  });

  it('0/100 = 0% → F', () => {
    const result = calculateTestGrade({ correctAnswers: 0, totalQuestions: 100 });
    expect(result.percentage).toBe(0);
    expect(result.letterGrade).toBe('F');
  });

  // ═══════════════════════════════════════════════════════
  // Standard scale (no plus/minus)
  // ═══════════════════════════════════════════════════════

  it('85/100 on standard scale → B', () => {
    const result = calculateTestGrade({
      correctAnswers: 85,
      totalQuestions: 100,
      gradingScale: 'standard',
    });
    expect(result.letterGrade).toBe('B');
    expect(result.gpaPoints).toBe(3.0);
  });

  it('92/100 on standard scale → A', () => {
    const result = calculateTestGrade({
      correctAnswers: 92,
      totalQuestions: 100,
      gradingScale: 'standard',
    });
    expect(result.letterGrade).toBe('A');
  });

  // ═══════════════════════════════════════════════════════
  // Pass/fail scale
  // ═══════════════════════════════════════════════════════

  it('70/100 on pass-fail → P', () => {
    const result = calculateTestGrade({
      correctAnswers: 70,
      totalQuestions: 100,
      gradingScale: 'pass-fail',
    });
    expect(result.letterGrade).toBe('P');
  });

  it('55/100 on pass-fail → F', () => {
    const result = calculateTestGrade({
      correctAnswers: 55,
      totalQuestions: 100,
      gradingScale: 'pass-fail',
    });
    expect(result.letterGrade).toBe('F');
  });

  // ═══════════════════════════════════════════════════════
  // Incorrect answers tracking
  // ═══════════════════════════════════════════════════════

  it('tracks incorrect answers: 38/50 → 12 incorrect', () => {
    const result = calculateTestGrade({ correctAnswers: 38, totalQuestions: 50 });
    expect(result.incorrectAnswers).toBe(12);
  });

  // ═══════════════════════════════════════════════════════
  // Odd question counts
  // ═══════════════════════════════════════════════════════

  it('handles 7/9 = 77.78% → C+', () => {
    const result = calculateTestGrade({ correctAnswers: 7, totalQuestions: 9 });
    expect(result.percentage).toBeCloseTo(77.78, 1);
    expect(result.letterGrade).toBe('C+');
  });

  it('handles 1/3 = 33.33% → F', () => {
    const result = calculateTestGrade({ correctAnswers: 1, totalQuestions: 3 });
    expect(result.percentage).toBeCloseTo(33.33, 1);
    expect(result.letterGrade).toBe('F');
  });

  // ═══════════════════════════════════════════════════════
  // Error cases
  // ═══════════════════════════════════════════════════════

  it('total = 0 returns error', () => {
    const result = calculateTestGrade({ correctAnswers: 5, totalQuestions: 0 });
    expect(result.percentage).toBeNull();
    expect(result.error).toBeDefined();
  });

  it('negative correct returns error', () => {
    const result = calculateTestGrade({ correctAnswers: -1, totalQuestions: 10 });
    expect(result.percentage).toBeNull();
    expect(result.error).toBeDefined();
  });

  it('correct > total returns error', () => {
    const result = calculateTestGrade({ correctAnswers: 11, totalQuestions: 10 });
    expect(result.percentage).toBeNull();
    expect(result.error).toBeDefined();
  });

  // ═══════════════════════════════════════════════════════
  // Boundary grades (plus-minus scale)
  // ═══════════════════════════════════════════════════════

  it('97/100 = A+', () => {
    const result = calculateTestGrade({ correctAnswers: 97, totalQuestions: 100 });
    expect(result.letterGrade).toBe('A+');
  });

  it('87/100 = B+', () => {
    const result = calculateTestGrade({ correctAnswers: 87, totalQuestions: 100 });
    expect(result.letterGrade).toBe('B+');
    expect(result.gpaPoints).toBe(3.3);
  });

  it('59/100 = F (just below passing)', () => {
    const result = calculateTestGrade({ correctAnswers: 59, totalQuestions: 100 });
    expect(result.letterGrade).toBe('F');
    expect(result.isPassing).toBe(false);
  });
});
