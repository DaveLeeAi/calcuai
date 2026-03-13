import { calculateOvulation } from '@/lib/formulas/health/ovulation';

describe('calculateOvulation', () => {
  // === STANDARD 28-DAY CYCLE ===

  it('calculates ovulation for standard 28-day cycle', () => {
    // LMP: 2026-01-01, cycle: 28
    // Ovulation day = 28 - 14 = 14 → Jan 1 + 14 = Jan 15
    // Fertile start = Jan 15 - 5 = Jan 10
    // Fertile end = Jan 15 + 1 = Jan 16
    // Next period = Jan 1 + 28 = Jan 29
    const result = calculateOvulation({
      lastPeriodDate: '2026-01-01',
      cycleLength: 28,
      cyclesToShow: 1,
    });
    expect(result.ovulationDate).toBe('2026-01-15');
    expect(result.fertileWindowStart).toBe('2026-01-10');
    expect(result.fertileWindowEnd).toBe('2026-01-16');
    expect(result.nextPeriodDate).toBe('2026-01-29');
  });

  // === SHORT CYCLE ===

  it('calculates ovulation for short 21-day cycle', () => {
    // Ovulation day = 21 - 14 = 7 → Jan 1 + 7 = Jan 8
    // Next period = Jan 1 + 21 = Jan 22
    const result = calculateOvulation({
      lastPeriodDate: '2026-01-01',
      cycleLength: 21,
      cyclesToShow: 1,
    });
    expect(result.ovulationDate).toBe('2026-01-08');
    expect(result.nextPeriodDate).toBe('2026-01-22');
  });

  // === LONG CYCLE ===

  it('calculates ovulation for long 35-day cycle', () => {
    // Ovulation day = 35 - 14 = 21 → Jan 1 + 21 = Jan 22
    // Next period = Jan 1 + 35 = Feb 5
    const result = calculateOvulation({
      lastPeriodDate: '2026-01-01',
      cycleLength: 35,
      cyclesToShow: 1,
    });
    expect(result.ovulationDate).toBe('2026-01-22');
    expect(result.nextPeriodDate).toBe('2026-02-05');
  });

  // === VERY LONG CYCLE ===

  it('calculates ovulation for very long 45-day cycle', () => {
    // Ovulation day = 45 - 14 = 31 → Jan 1 + 31 = Feb 1
    // Next period = Jan 1 + 45 = Feb 15
    const result = calculateOvulation({
      lastPeriodDate: '2026-01-01',
      cycleLength: 45,
      cyclesToShow: 1,
    });
    expect(result.ovulationDate).toBe('2026-02-01');
    expect(result.nextPeriodDate).toBe('2026-02-15');
  });

  // === FERTILE WINDOW ===

  it('fertile window is always 7 days (5 before + ovulation day + 1 after)', () => {
    const result = calculateOvulation({
      lastPeriodDate: '2026-01-01',
      cycleLength: 28,
      cyclesToShow: 1,
    });
    // Fertile start = Jan 10, Fertile end = Jan 16
    const start = new Date(result.fertileWindowStart);
    const end = new Date(result.fertileWindowEnd);
    const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    expect(diffDays).toBe(6); // 6 calendar-day span = 7 days inclusive
  });

  // === MULTIPLE CYCLES ===

  it('shows 3 cycles with correct date increments', () => {
    const result = calculateOvulation({
      lastPeriodDate: '2026-01-01',
      cycleLength: 28,
      cyclesToShow: 3,
    });
    expect(result.cycleCalendar.length).toBe(3);

    // Cycle 1
    expect(result.cycleCalendar[0].cycle).toBe(1);
    expect(result.cycleCalendar[0].periodStart).toBe('2026-01-01');
    expect(result.cycleCalendar[0].ovulation).toBe('2026-01-15');
    expect(result.cycleCalendar[0].nextPeriod).toBe('2026-01-29');

    // Cycle 2: starts at Jan 29 (Jan 1 + 28)
    expect(result.cycleCalendar[1].cycle).toBe(2);
    expect(result.cycleCalendar[1].periodStart).toBe('2026-01-29');
    expect(result.cycleCalendar[1].ovulation).toBe('2026-02-12');
    expect(result.cycleCalendar[1].nextPeriod).toBe('2026-02-26');

    // Cycle 3: starts at Feb 26 (Jan 1 + 56)
    expect(result.cycleCalendar[2].cycle).toBe(3);
    expect(result.cycleCalendar[2].periodStart).toBe('2026-02-26');
    expect(result.cycleCalendar[2].ovulation).toBe('2026-03-12');
    expect(result.cycleCalendar[2].nextPeriod).toBe('2026-03-26');
  });

  it('shows 6 cycles when requested', () => {
    const result = calculateOvulation({
      lastPeriodDate: '2026-01-01',
      cycleLength: 28,
      cyclesToShow: 6,
    });
    expect(result.cycleCalendar.length).toBe(6);
    expect(result.cycleCalendar[5].cycle).toBe(6);
  });

  it('shows 1 cycle when requested', () => {
    const result = calculateOvulation({
      lastPeriodDate: '2026-01-01',
      cycleLength: 28,
      cyclesToShow: 1,
    });
    expect(result.cycleCalendar.length).toBe(1);
    expect(result.cycleCalendar[0].cycle).toBe(1);
  });

  // === FORMULA VERIFICATION ===

  it('ovulation = LMP + (cycleLength - 14) for minimum cycle', () => {
    const result = calculateOvulation({
      lastPeriodDate: '2026-03-01',
      cycleLength: 21,
      cyclesToShow: 1,
    });
    // Ovulation day = 21 - 14 = 7 → Mar 1 + 7 = Mar 8
    expect(result.ovulationDate).toBe('2026-03-08');
  });

  it('next period = LMP + cycleLength', () => {
    const result = calculateOvulation({
      lastPeriodDate: '2026-06-15',
      cycleLength: 30,
      cyclesToShow: 1,
    });
    // Next period = Jun 15 + 30 = Jul 15
    expect(result.nextPeriodDate).toBe('2026-07-15');
  });

  it('ovulation = LMP + (cycleLength - 14)', () => {
    const result = calculateOvulation({
      lastPeriodDate: '2026-06-15',
      cycleLength: 30,
      cyclesToShow: 1,
    });
    // Ovulation = Jun 15 + (30 - 14) = Jun 15 + 16 = Jul 1
    expect(result.ovulationDate).toBe('2026-07-01');
  });

  // === SUMMARY ===

  it('summary contains correct labels', () => {
    const result = calculateOvulation({
      lastPeriodDate: '2026-01-01',
      cycleLength: 28,
      cyclesToShow: 3,
    });
    expect(result.summary.length).toBe(7);
    expect(result.summary[0].label).toBe('Last Period');
    expect(result.summary[1].label).toBe('Cycle Length');
    expect(result.summary[2].label).toBe('Ovulation Day of Cycle');
    expect(result.summary[3].label).toBe('Next Ovulation');
    expect(result.summary[4].label).toBe('Fertile Window');
    expect(result.summary[5].label).toBe('Fertile Window Duration');
    expect(result.summary[6].label).toBe('Next Period Expected');
  });

  // === EDGE CASES ===

  it('returns empty results for missing lastPeriodDate', () => {
    const result = calculateOvulation({
      lastPeriodDate: '',
      cycleLength: 28,
      cyclesToShow: 3,
    });
    expect(result.ovulationDate).toBe('');
    expect(result.fertileWindowStart).toBe('');
    expect(result.cycleCalendar).toEqual([]);
  });

  it('defaults to 28-day cycle when not specified', () => {
    const result = calculateOvulation({
      lastPeriodDate: '2026-01-01',
    });
    // Ovulation day = 28 - 14 = 14 → Jan 15
    expect(result.ovulationDate).toBe('2026-01-15');
  });

  it('defaults to 3 cycles when not specified', () => {
    const result = calculateOvulation({
      lastPeriodDate: '2026-01-01',
      cycleLength: 28,
    });
    expect(result.cycleCalendar.length).toBe(3);
  });

  // === CYCLE CALENDAR CORRECTNESS ===

  it('each cycle calendar row has fertile window 7 days wide', () => {
    const result = calculateOvulation({
      lastPeriodDate: '2026-01-01',
      cycleLength: 30,
      cyclesToShow: 3,
    });
    for (const row of result.cycleCalendar) {
      const start = new Date(row.fertileStart);
      const end = new Date(row.fertileEnd);
      const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBe(6); // 6 calendar-day span = 7 days inclusive
    }
  });
});
