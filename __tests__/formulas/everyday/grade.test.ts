import { calculateGradeNeeded, toLetterGrade } from '@/lib/formulas/everyday/grade';

describe('toLetterGrade', () => {
  it('converts 95 to A', () => {
    expect(toLetterGrade(95)).toBe('A');
  });

  it('converts 90 to A-', () => {
    expect(toLetterGrade(90)).toBe('A-');
  });

  it('converts 85 to B', () => {
    expect(toLetterGrade(85)).toBe('B');
  });

  it('converts 73 to C', () => {
    expect(toLetterGrade(73)).toBe('C');
  });

  it('converts 59 to F', () => {
    expect(toLetterGrade(59)).toBe('F');
  });

  it('converts 100 to A+', () => {
    expect(toLetterGrade(100)).toBe('A+');
  });

  it('converts 0 to F', () => {
    expect(toLetterGrade(0)).toBe('F');
  });
});

describe('calculateGradeNeeded', () => {
  // ─── Test 1: Achievable target ───
  it('calculates 96% needed when current=88, desired=90, weight=25%', () => {
    const result = calculateGradeNeeded({
      currentGrade: 88,
      desiredGrade: 90,
      finalWeight: 25,
    });
    expect(result.requiredGrade).toBeCloseTo(96, 1);
    expect(result.isPossible).toBe(true);
    expect(result.isGuaranteed).toBe(false);
    expect(result.letterGradeNeeded).toBe('A');
  });

  // ─── Test 2: Impossible target ───
  it('flags impossible when required grade > 100', () => {
    const result = calculateGradeNeeded({
      currentGrade: 72,
      desiredGrade: 90,
      finalWeight: 20,
    });
    expect(result.isPossible).toBe(false);
    expect(result.letterGradeNeeded).toBe('Not possible');
  });

  // ─── Test 3: Guaranteed pass ───
  it('flags guaranteed when current grade already meets target', () => {
    const result = calculateGradeNeeded({
      currentGrade: 95,
      desiredGrade: 60,
      finalWeight: 20,
    });
    expect(result.isGuaranteed).toBe(true);
    expect(result.requiredGrade).toBe(0);
  });

  // ─── Test 4: Exact 100% needed ───
  it('returns exactly 100% needed as possible', () => {
    // current=80, desired=90, weight=50%
    // required = (90 - 80 * 0.5) / 0.5 = (90 - 40) / 0.5 = 100
    const result = calculateGradeNeeded({
      currentGrade: 80,
      desiredGrade: 90,
      finalWeight: 50,
    });
    expect(result.requiredGrade).toBeCloseTo(100, 1);
    expect(result.isPossible).toBe(true);
  });

  // ─── Test 5: Final worth 100% ───
  it('handles final worth 100% of grade', () => {
    const result = calculateGradeNeeded({
      currentGrade: 50,
      desiredGrade: 85,
      finalWeight: 100,
    });
    // required = (85 - 50*0) / 1 = 85
    expect(result.requiredGrade).toBeCloseTo(85, 1);
    expect(result.isPossible).toBe(true);
  });

  // ─── Test 6: Current equals desired ───
  it('requires same score as current when grades match and weight < 100%', () => {
    const result = calculateGradeNeeded({
      currentGrade: 85,
      desiredGrade: 85,
      finalWeight: 30,
    });
    expect(result.requiredGrade).toBeCloseTo(85, 1);
  });

  // ─── Test 7: Zero current grade ───
  it('handles zero current grade', () => {
    const result = calculateGradeNeeded({
      currentGrade: 0,
      desiredGrade: 60,
      finalWeight: 40,
    });
    // required = (60 - 0) / 0.4 = 150
    expect(result.requiredGrade).toBeCloseTo(150, 1);
    expect(result.isPossible).toBe(false);
  });

  // ─── Test 8: Very small final weight ───
  it('handles very small final weight (5%)', () => {
    const result = calculateGradeNeeded({
      currentGrade: 88,
      desiredGrade: 90,
      finalWeight: 5,
    });
    // required = (90 - 88 * 0.95) / 0.05 = (90 - 83.6) / 0.05 = 128
    expect(result.requiredGrade).toBeCloseTo(128, 0);
    expect(result.isPossible).toBe(false);
  });

  // ─── Test 9: Output includes weighted contribution ───
  it('returns correct current weighted contribution', () => {
    const result = calculateGradeNeeded({
      currentGrade: 85,
      desiredGrade: 90,
      finalWeight: 30,
    });
    // currentWeightedContribution = 85 * 0.70 = 59.5
    expect(result.currentWeightedContribution).toBeCloseTo(59.5, 1);
  });

  // ─── Test 10: Desired letter grade output ───
  it('returns correct desired letter grade', () => {
    const result = calculateGradeNeeded({
      currentGrade: 80,
      desiredGrade: 93,
      finalWeight: 25,
    });
    expect(result.desiredLetterGrade).toBe('A');
  });

  // ─── Test 11: Perfect current grade ───
  it('handles 100% current grade', () => {
    const result = calculateGradeNeeded({
      currentGrade: 100,
      desiredGrade: 95,
      finalWeight: 20,
    });
    // required = (95 - 100 * 0.80) / 0.20 = (95 - 80) / 0.20 = 75
    expect(result.requiredGrade).toBeCloseTo(75, 1);
    expect(result.isPossible).toBe(true);
  });

  // ─── Test 12: neededFromFinal output ───
  it('returns correct neededFromFinal value', () => {
    const result = calculateGradeNeeded({
      currentGrade: 85,
      desiredGrade: 90,
      finalWeight: 30,
    });
    // neededFromFinal = 90 - 59.5 = 30.5
    expect(result.neededFromFinal).toBeCloseTo(30.5, 1);
  });
});
