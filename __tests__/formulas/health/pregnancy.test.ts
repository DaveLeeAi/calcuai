import { calculatePregnancy } from '@/lib/formulas/health/pregnancy';

describe('calculatePregnancy', () => {
  // Standard 28-day cycle, reference date at week 20
  it('calculates gestational age for standard 28-day cycle at week 20', () => {
    // LMP: 2026-01-01, reference: 2026-05-21 = day 140 = week 20, day 0
    const result = calculatePregnancy({
      lastMenstrualPeriod: '2026-01-01',
      cycleLength: 28,
      referenceDate: '2026-05-21',
    });
    expect(result.currentWeek).toBe(20);
    expect(result.currentDay).toBe(0);
    expect(result.currentWeekDisplay).toBe('Week 20, Day 0');
  });

  // Due date with standard cycle
  it('calculates due date as LMP + 280 days for 28-day cycle', () => {
    const result = calculatePregnancy({
      lastMenstrualPeriod: '2026-01-01',
      cycleLength: 28,
      referenceDate: '2026-03-01',
    });
    // 2026-01-01 + 280 = 2026-10-08
    expect(result.dueDate).toBe('2026-10-08');
    expect(result.dueDateFormatted).toBe('October 8, 2026');
  });

  // Short cycle (21 days)
  it('adjusts due date for short 21-day cycle', () => {
    const result = calculatePregnancy({
      lastMenstrualPeriod: '2026-01-01',
      cycleLength: 21,
      referenceDate: '2026-03-01',
    });
    // 280 + (21-28) = 273 days
    // 2026-01-01 + 273 = 2026-10-01
    expect(result.dueDate).toBe('2026-10-01');
  });

  // Long cycle (35 days)
  it('adjusts due date for long 35-day cycle', () => {
    const result = calculatePregnancy({
      lastMenstrualPeriod: '2026-01-01',
      cycleLength: 35,
      referenceDate: '2026-03-01',
    });
    // 280 + (35-28) = 287 days
    // 2026-01-01 + 287 = 2026-10-15
    expect(result.dueDate).toBe('2026-10-15');
  });

  // Early pregnancy (week 6)
  it('identifies early pregnancy at week 6', () => {
    // LMP: 2026-01-01, reference: 2026-02-12 = day 42 = week 6, day 0
    const result = calculatePregnancy({
      lastMenstrualPeriod: '2026-01-01',
      cycleLength: 28,
      referenceDate: '2026-02-12',
    });
    expect(result.currentWeek).toBe(6);
    expect(result.currentDay).toBe(0);
    expect(result.trimester).toBe(1);
    expect(result.trimesterText).toBe('First trimester (weeks 1-12)');
  });

  // Mid pregnancy (week 20)
  it('identifies mid pregnancy at week 20 in second trimester', () => {
    // LMP: 2026-01-01, reference: 2026-05-21 = day 140 = week 20
    const result = calculatePregnancy({
      lastMenstrualPeriod: '2026-01-01',
      cycleLength: 28,
      referenceDate: '2026-05-21',
    });
    expect(result.currentWeek).toBe(20);
    expect(result.trimester).toBe(2);
    expect(result.trimesterText).toBe('Second trimester (weeks 13-26)');
  });

  // Late pregnancy (week 38)
  it('identifies late pregnancy at week 38 in third trimester', () => {
    // LMP: 2026-01-01, reference: 2026-09-24 = day 266 = week 38, day 0
    const result = calculatePregnancy({
      lastMenstrualPeriod: '2026-01-01',
      cycleLength: 28,
      referenceDate: '2026-09-24',
    });
    expect(result.currentWeek).toBe(38);
    expect(result.currentDay).toBe(0);
    expect(result.trimester).toBe(3);
    expect(result.trimesterText).toBe('Third trimester (weeks 27-40)');
  });

  // Trimester boundary: week 12 (last week of first trimester)
  it('classifies week 12 as first trimester', () => {
    // LMP: 2026-01-01, reference: 2026-03-26 = day 84 = week 12
    const result = calculatePregnancy({
      lastMenstrualPeriod: '2026-01-01',
      cycleLength: 28,
      referenceDate: '2026-03-26',
    });
    expect(result.currentWeek).toBe(12);
    expect(result.trimester).toBe(1);
  });

  // Trimester boundary: week 13 (first week of second trimester)
  it('classifies week 13 as second trimester', () => {
    // LMP: 2026-01-01, reference: 2026-04-02 = day 91 = week 13
    const result = calculatePregnancy({
      lastMenstrualPeriod: '2026-01-01',
      cycleLength: 28,
      referenceDate: '2026-04-02',
    });
    expect(result.currentWeek).toBe(13);
    expect(result.trimester).toBe(2);
  });

  // Trimester boundary: week 26 → still second trimester
  it('classifies week 26 as second trimester', () => {
    // LMP: 2026-01-01, reference: 2026-07-02 = day 182 = week 26
    const result = calculatePregnancy({
      lastMenstrualPeriod: '2026-01-01',
      cycleLength: 28,
      referenceDate: '2026-07-02',
    });
    expect(result.currentWeek).toBe(26);
    expect(result.trimester).toBe(2);
  });

  // Trimester boundary: week 27 → third trimester
  it('classifies week 27 as third trimester', () => {
    // LMP: 2026-01-01, reference: 2026-07-09 = day 189 = week 27
    const result = calculatePregnancy({
      lastMenstrualPeriod: '2026-01-01',
      cycleLength: 28,
      referenceDate: '2026-07-09',
    });
    expect(result.currentWeek).toBe(27);
    expect(result.trimester).toBe(3);
  });

  // Progress percentage
  it('calculates progress percentage at halfway point', () => {
    // LMP: 2026-01-01, reference: 2026-05-21 = day 140 = 50% of 280
    const result = calculatePregnancy({
      lastMenstrualPeriod: '2026-01-01',
      cycleLength: 28,
      referenceDate: '2026-05-21',
    });
    expect(result.progressPercentage).toBe(50);
  });

  it('caps progress percentage at 100', () => {
    // Reference well past due date
    const result = calculatePregnancy({
      lastMenstrualPeriod: '2026-01-01',
      cycleLength: 28,
      referenceDate: '2027-01-01',
    });
    expect(result.progressPercentage).toBe(100);
  });

  // Weekly development array
  it('generates weekly development from week 4 through week 40', () => {
    const result = calculatePregnancy({
      lastMenstrualPeriod: '2026-01-01',
      cycleLength: 28,
      referenceDate: '2026-03-01',
    });
    expect(result.weeklyDevelopment.length).toBe(37); // weeks 4-40 inclusive
    expect(result.weeklyDevelopment[0].week).toBe(4);
    expect(result.weeklyDevelopment[0].size).toBe('Poppy seed');
    expect(result.weeklyDevelopment[result.weeklyDevelopment.length - 1].week).toBe(40);
    expect(result.weeklyDevelopment[result.weeklyDevelopment.length - 1].size).toBe('Watermelon');
  });

  // Key dates count
  it('generates 7 key dates', () => {
    const result = calculatePregnancy({
      lastMenstrualPeriod: '2026-01-01',
      cycleLength: 28,
      referenceDate: '2026-03-01',
    });
    expect(result.keyDates.length).toBe(7);
    expect(result.keyDates[0].event).toBe('Estimated Conception Date');
    expect(result.keyDates[result.keyDates.length - 1].event).toBe('Estimated Due Date (Week 40)');
  });

  // Conception date
  it('calculates conception date correctly for 28-day cycle', () => {
    const result = calculatePregnancy({
      lastMenstrualPeriod: '2026-01-01',
      cycleLength: 28,
      referenceDate: '2026-03-01',
    });
    // Conception = LMP + (28-14) = LMP + 14 = 2026-01-15
    expect(result.conceptionDate).toBe('2026-01-15');
    expect(result.conceptionDateFormatted).toBe('January 15, 2026');
  });

  // Days remaining
  it('calculates days remaining correctly', () => {
    // LMP: 2026-01-01, due: 2026-10-08, reference: 2026-05-21 = 140 days remaining
    const result = calculatePregnancy({
      lastMenstrualPeriod: '2026-01-01',
      cycleLength: 28,
      referenceDate: '2026-05-21',
    });
    expect(result.daysRemaining).toBe(140);
    expect(result.daysElapsed).toBe(140);
  });

  // Default cycle length
  it('defaults to 28-day cycle when not specified', () => {
    const result = calculatePregnancy({
      lastMenstrualPeriod: '2026-01-01',
      referenceDate: '2026-03-01',
    });
    expect(result.dueDate).toBe('2026-10-08');
  });

  // Gestational age with fractional week
  it('calculates gestational age with days correctly', () => {
    // LMP: 2026-01-01, reference: 2026-05-24 = day 143 = week 20, day 3
    const result = calculatePregnancy({
      lastMenstrualPeriod: '2026-01-01',
      cycleLength: 28,
      referenceDate: '2026-05-24',
    });
    expect(result.currentWeek).toBe(20);
    expect(result.currentDay).toBe(3);
    expect(result.currentWeekDisplay).toBe('Week 20, Day 3');
  });
});
