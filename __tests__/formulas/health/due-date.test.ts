import { calculateDueDate } from '@/lib/formulas/health/due-date';

describe('calculateDueDate', () => {
  // Standard Naegele's rule (28-day cycle)
  it('calculates due date as LMP + 280 days for standard cycle', () => {
    const result = calculateDueDate({
      lastMenstrualPeriod: '2026-01-01',
      cycleLength: 28,
    });
    // 2026-01-01 + 280 days = 2026-10-08
    expect(result.dueDate).toBe('2026-10-08');
  });

  it('calculates due date with default 28-day cycle', () => {
    const result = calculateDueDate({
      lastMenstrualPeriod: '2026-01-01',
    });
    expect(result.dueDate).toBe('2026-10-08');
  });

  // Cycle length adjustments
  it('adjusts for longer cycle (35 days)', () => {
    const result = calculateDueDate({
      lastMenstrualPeriod: '2026-01-01',
      cycleLength: 35,
    });
    // 280 + (35 - 28) = 287 days from LMP
    // 2026-01-01 + 287 = 2026-10-15
    expect(result.dueDate).toBe('2026-10-15');
  });

  it('adjusts for shorter cycle (25 days)', () => {
    const result = calculateDueDate({
      lastMenstrualPeriod: '2026-01-01',
      cycleLength: 25,
    });
    // 280 + (25 - 28) = 277 days from LMP
    // 2026-01-01 + 277 = 2026-10-05
    expect(result.dueDate).toBe('2026-10-05');
  });

  // Conception date
  it('calculates conception date as LMP + (cycleLength - 14)', () => {
    const result = calculateDueDate({
      lastMenstrualPeriod: '2026-01-01',
      cycleLength: 28,
    });
    // Conception = 2026-01-01 + 14 = 2026-01-15
    expect(result.conceptionDate).toBe('2026-01-15');
  });

  it('adjusts conception date for longer cycle', () => {
    const result = calculateDueDate({
      lastMenstrualPeriod: '2026-01-01',
      cycleLength: 35,
    });
    // Conception = 2026-01-01 + (35-14) = 2026-01-01 + 21 = 2026-01-22
    expect(result.conceptionDate).toBe('2026-01-22');
  });

  // Trimester end dates
  it('calculates first trimester end correctly', () => {
    const result = calculateDueDate({
      lastMenstrualPeriod: '2026-01-01',
      cycleLength: 28,
    });
    // First trimester end = LMP + 12 weeks = LMP + 84 days
    // 2026-01-01 + 84 = 2026-03-26
    expect(result.firstTrimesterEnd).toBe('2026-03-26');
  });

  it('calculates second trimester end correctly', () => {
    const result = calculateDueDate({
      lastMenstrualPeriod: '2026-01-01',
      cycleLength: 28,
    });
    // Second trimester end = LMP + 26 weeks = LMP + 182 days
    // 2026-01-01 + 182 = 2026-07-02
    expect(result.secondTrimesterEnd).toBe('2026-07-02');
  });

  // Milestones
  it('generates 11 pregnancy milestones', () => {
    const result = calculateDueDate({
      lastMenstrualPeriod: '2026-01-01',
    });
    expect(result.milestones).toHaveLength(11);
  });

  it('includes week 20 anatomy scan milestone', () => {
    const result = calculateDueDate({
      lastMenstrualPeriod: '2026-01-01',
    });
    const week20 = result.milestones.find(m => m.week === 20);
    expect(week20).toBeDefined();
    expect(week20?.description).toContain('Anatomy scan');
    // Week 20 = LMP + 140 days = 2026-05-21
    expect(week20?.date).toBe('2026-05-21');
  });

  it('milestone dates are sequential', () => {
    const result = calculateDueDate({
      lastMenstrualPeriod: '2026-01-01',
    });
    for (let i = 1; i < result.milestones.length; i++) {
      expect(result.milestones[i].date > result.milestones[i - 1].date).toBe(true);
    }
  });

  // Date formatting
  it('formats due date correctly', () => {
    const result = calculateDueDate({
      lastMenstrualPeriod: '2026-01-01',
    });
    expect(result.dueDateFormatted).toBe('October 8, 2026');
  });

  it('formats conception date correctly', () => {
    const result = calculateDueDate({
      lastMenstrualPeriod: '2026-01-01',
    });
    expect(result.conceptionDateFormatted).toBe('January 15, 2026');
  });

  // Progress and gestational age (these depend on "today" so we test structure)
  it('returns valid gestational age structure', () => {
    const result = calculateDueDate({
      lastMenstrualPeriod: '2026-01-01',
    });
    expect(result.gestationalAge.weeks).toBeGreaterThanOrEqual(0);
    expect(result.gestationalAge.days).toBeGreaterThanOrEqual(0);
    expect(result.gestationalAge.days).toBeLessThan(7);
  });

  it('returns valid progress percentage', () => {
    const result = calculateDueDate({
      lastMenstrualPeriod: '2026-01-01',
    });
    expect(result.progressPercentage).toBeGreaterThanOrEqual(0);
    expect(result.progressPercentage).toBeLessThanOrEqual(100);
  });

  it('returns valid trimester (1, 2, or 3)', () => {
    const result = calculateDueDate({
      lastMenstrualPeriod: '2026-01-01',
    });
    expect([1, 2, 3]).toContain(result.trimester);
  });

  // Leap year handling
  it('handles LMP in leap year correctly', () => {
    const result = calculateDueDate({
      lastMenstrualPeriod: '2024-02-29',
      cycleLength: 28,
    });
    // 2024-02-29 + 280 days = 2024-12-05
    expect(result.dueDate).toBe('2024-12-05');
  });

  // Year boundary
  it('handles due date crossing year boundary', () => {
    const result = calculateDueDate({
      lastMenstrualPeriod: '2026-06-01',
      cycleLength: 28,
    });
    // 2026-06-01 + 280 = 2027-03-08
    expect(result.dueDate).toBe('2027-03-08');
  });

  // ─── Edge case: invalid date string ───
  it('returns error for invalid date string', () => {
    const result = calculateDueDate({
      lastMenstrualPeriod: 'not-a-date',
    });
    expect(result.error).toBe('Invalid date format');
    expect(result.dueDate).toBe('');
    expect(result.daysElapsed).toBe(0);
  });

  it('returns error for empty date string', () => {
    const result = calculateDueDate({
      lastMenstrualPeriod: '',
    });
    expect(result.error).toBe('Invalid date format');
  });

  // ─── Edge case: cycleLength = 1 (medically impossible, clamped to 21) ───
  it('clamps cycleLength=1 to 21 and adds warning', () => {
    const result = calculateDueDate({
      lastMenstrualPeriod: '2026-01-01',
      cycleLength: 1,
    });
    // Clamped to 21: 280 + (21 - 28) = 273 days → 2026-10-01
    expect(result.dueDate).toBe('2026-10-01');
    expect(result.cycleLengthWarning).toContain('outside the valid range');
    expect(result.cycleLengthWarning).toContain('Clamped to 21');
  });

  // ─── Edge case: cycleLength = 60 (clamped to 45) ───
  it('clamps cycleLength=60 to 45 and adds warning', () => {
    const result = calculateDueDate({
      lastMenstrualPeriod: '2026-01-01',
      cycleLength: 60,
    });
    // Clamped to 45: 280 + (45 - 28) = 297 days → 2026-10-25
    expect(result.dueDate).toBe('2026-10-25');
    expect(result.cycleLengthWarning).toContain('outside the valid range');
    expect(result.cycleLengthWarning).toContain('Clamped to 45');
  });

  // ─── Edge case: cycleLength = 22 (valid but atypical, warning) ───
  it('adds warning for atypical cycle length of 22', () => {
    const result = calculateDueDate({
      lastMenstrualPeriod: '2026-01-01',
      cycleLength: 22,
    });
    expect(result.cycleLengthWarning).toContain('outside the typical range');
    // Should NOT be clamped — 22 is within 21-45
    // 280 + (22 - 28) = 274 days
    expect(result.dueDate).toBe('2026-10-02');
  });

  // ─── Edge case: cycleLength = 28 (no warning) ───
  it('no warning for standard 28-day cycle', () => {
    const result = calculateDueDate({
      lastMenstrualPeriod: '2026-01-01',
      cycleLength: 28,
    });
    expect(result.cycleLengthWarning).toBeUndefined();
  });
});
