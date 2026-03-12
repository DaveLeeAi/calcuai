import { calculateConception } from '@/lib/formulas/health/conception';

describe('calculateConception', () => {
  // === FROM DUE DATE TESTS ===

  it('calculates conception from due date with 28-day cycle', () => {
    // Due date: 2026-10-08, cycle: 28
    // LMP = 2026-10-08 - 280 = 2026-01-01
    // Conception = 2026-01-01 + 14 = 2026-01-15
    const result = calculateConception({
      calculationMethod: 'fromDueDate',
      dueDate: '2026-10-08',
      cycleLength: 28,
    });
    expect(result.conceptionDate).toBe('2026-01-15');
    expect(result.lmpDate).toBe('2026-01-01');
  });

  it('calculates conception from due date with short cycle (24 days)', () => {
    // Due date: 2026-10-08, cycle: 24
    // LMP = 2026-10-08 - 280 - (24-28) = 2026-10-08 - 276 = 2026-01-05
    // Conception = 2026-01-05 + (24-14) = 2026-01-05 + 10 = 2026-01-15
    const result = calculateConception({
      calculationMethod: 'fromDueDate',
      dueDate: '2026-10-08',
      cycleLength: 24,
    });
    expect(result.conceptionDate).toBe('2026-01-15');
    expect(result.lmpDate).toBe('2026-01-05');
  });

  it('calculates conception from due date with long cycle (32 days)', () => {
    // Due date: 2026-10-08, cycle: 32
    // LMP = 2026-10-08 - 280 - (32-28) = 2026-10-08 - 284 = 2025-12-28
    // Conception = 2025-12-28 + (32-14) = 2025-12-28 + 18 = 2026-01-15
    const result = calculateConception({
      calculationMethod: 'fromDueDate',
      dueDate: '2026-10-08',
      cycleLength: 32,
    });
    expect(result.conceptionDate).toBe('2026-01-15');
    expect(result.lmpDate).toBe('2025-12-28');
  });

  // === FROM LMP TESTS ===

  it('calculates conception from LMP with 28-day cycle', () => {
    const result = calculateConception({
      calculationMethod: 'fromLMP',
      lastMenstrualPeriod: '2026-01-01',
      cycleLength: 28,
    });
    // Conception = LMP + (28-14) = 2026-01-15
    expect(result.conceptionDate).toBe('2026-01-15');
    expect(result.conceptionDateFormatted).toBe('January 15, 2026');
    // Due date = LMP + 280 = 2026-10-08
    expect(result.estimatedDueDate).toBe('2026-10-08');
  });

  it('calculates conception from LMP with short cycle (21 days)', () => {
    const result = calculateConception({
      calculationMethod: 'fromLMP',
      lastMenstrualPeriod: '2026-01-01',
      cycleLength: 21,
    });
    // Conception = LMP + (21-14) = LMP + 7 = 2026-01-08
    expect(result.conceptionDate).toBe('2026-01-08');
    // Due date = LMP + 280 + (21-28) = LMP + 273 = 2026-10-01
    expect(result.estimatedDueDate).toBe('2026-10-01');
  });

  it('calculates conception from LMP with long cycle (35 days)', () => {
    const result = calculateConception({
      calculationMethod: 'fromLMP',
      lastMenstrualPeriod: '2026-01-01',
      cycleLength: 35,
    });
    // Conception = LMP + (35-14) = LMP + 21 = 2026-01-22
    expect(result.conceptionDate).toBe('2026-01-22');
    // Due date = LMP + 280 + (35-28) = LMP + 287 = 2026-10-15
    expect(result.estimatedDueDate).toBe('2026-10-15');
  });

  it('defaults to 28-day cycle when not specified', () => {
    const result = calculateConception({
      calculationMethod: 'fromLMP',
      lastMenstrualPeriod: '2026-01-01',
    });
    expect(result.conceptionDate).toBe('2026-01-15');
    expect(result.estimatedDueDate).toBe('2026-10-08');
  });

  // === FERTILE WINDOW TESTS ===

  it('calculates fertile window as 6-day span around ovulation', () => {
    const result = calculateConception({
      calculationMethod: 'fromLMP',
      lastMenstrualPeriod: '2026-01-01',
      cycleLength: 28,
    });
    // Ovulation: 2026-01-15
    // Fertile start: 2026-01-15 - 5 = 2026-01-10
    // Fertile end: 2026-01-15 + 1 = 2026-01-16
    expect(result.fertileWindowStart).toBe('2026-01-10');
    expect(result.fertileWindowEnd).toBe('2026-01-16');

    // Window is 6 days wide
    const start = new Date(result.fertileWindowStart);
    const end = new Date(result.fertileWindowEnd);
    const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    expect(diffDays).toBe(6);
  });

  // === IMPLANTATION RANGE TESTS ===

  it('calculates implantation range as 6-12 days after conception', () => {
    const result = calculateConception({
      calculationMethod: 'fromLMP',
      lastMenstrualPeriod: '2026-01-01',
      cycleLength: 28,
    });
    // Conception: 2026-01-15
    // Early implantation: 2026-01-15 + 6 = 2026-01-21
    // Late implantation: 2026-01-15 + 12 = 2026-01-27
    expect(result.implantationEarly).toBe('2026-01-21');
    expect(result.implantationLate).toBe('2026-01-27');
  });

  // === TIMELINE TESTS ===

  it('generates 10 timeline events', () => {
    const result = calculateConception({
      calculationMethod: 'fromLMP',
      lastMenstrualPeriod: '2026-01-01',
      cycleLength: 28,
    });
    expect(result.timeline.length).toBe(10);
    expect(result.timeline[0].event).toBe('Last Menstrual Period (LMP)');
    expect(result.timeline[result.timeline.length - 1].event).toBe('Estimated Due Date');
  });

  it('timeline events are in chronological order', () => {
    const result = calculateConception({
      calculationMethod: 'fromLMP',
      lastMenstrualPeriod: '2026-01-01',
      cycleLength: 28,
    });
    for (let i = 1; i < result.timeline.length; i++) {
      expect(result.timeline[i].date >= result.timeline[i - 1].date).toBe(true);
    }
  });

  // === REVERSE VERIFICATION ===

  it('from LMP → conception → back-calculate due date matches', () => {
    const lmp = '2026-03-15';
    const cycleLength = 30;

    // Calculate from LMP
    const fromLMP = calculateConception({
      calculationMethod: 'fromLMP',
      lastMenstrualPeriod: lmp,
      cycleLength,
    });

    // Now calculate from that due date
    const fromDueDate = calculateConception({
      calculationMethod: 'fromDueDate',
      dueDate: fromLMP.estimatedDueDate,
      cycleLength,
    });

    // Conception dates should match
    expect(fromDueDate.conceptionDate).toBe(fromLMP.conceptionDate);
    // LMP dates should match
    expect(fromDueDate.lmpDate).toBe(lmp);
  });

  // === EDGE CASES ===

  it('handles very short cycle (21 days) from due date', () => {
    const result = calculateConception({
      calculationMethod: 'fromDueDate',
      dueDate: '2026-12-15',
      cycleLength: 21,
    });
    // LMP = 2026-12-15 - 280 - (21-28) = 2026-12-15 - 273 = 2026-03-17
    // Conception = 2026-03-17 + (21-14) = 2026-03-17 + 7 = 2026-03-24
    expect(result.lmpDate).toBe('2026-03-17');
    expect(result.conceptionDate).toBe('2026-03-24');
  });

  it('handles very long cycle (35 days) from due date', () => {
    const result = calculateConception({
      calculationMethod: 'fromDueDate',
      dueDate: '2026-12-15',
      cycleLength: 35,
    });
    // LMP = 2026-12-15 - 280 - (35-28) = 2026-12-15 - 287 = 2026-03-03
    // Conception = 2026-03-03 + (35-14) = 2026-03-03 + 21 = 2026-03-24
    expect(result.lmpDate).toBe('2026-03-03');
    expect(result.conceptionDate).toBe('2026-03-24');
  });

  it('formats dates correctly', () => {
    const result = calculateConception({
      calculationMethod: 'fromLMP',
      lastMenstrualPeriod: '2026-01-01',
      cycleLength: 28,
    });
    expect(result.conceptionDateFormatted).toBe('January 15, 2026');
    expect(result.ovulationDateFormatted).toBe('January 15, 2026');
    expect(result.fertileWindowStartFormatted).toBe('January 10, 2026');
    expect(result.estimatedDueDateFormatted).toBe('October 8, 2026');
  });

  it('ovulation date matches conception date', () => {
    const result = calculateConception({
      calculationMethod: 'fromLMP',
      lastMenstrualPeriod: '2026-06-01',
      cycleLength: 30,
    });
    expect(result.ovulationDate).toBe(result.conceptionDate);
  });
});
