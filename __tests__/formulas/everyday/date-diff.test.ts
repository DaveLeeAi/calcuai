import {
  calculateDateDiff,
  calculateAge,
  isLeapYear,
  daysInMonth,
} from '@/lib/formulas/everyday/date-diff';

// ═══════════════════════════════════════════════════════
// Helper function tests
// ═══════════════════════════════════════════════════════

describe('isLeapYear', () => {
  it('returns true for years divisible by 4', () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2028)).toBe(true);
    expect(isLeapYear(1996)).toBe(true);
  });

  it('returns false for century years not divisible by 400', () => {
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(1800)).toBe(false);
    expect(isLeapYear(2100)).toBe(false);
  });

  it('returns true for century years divisible by 400', () => {
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(1600)).toBe(true);
  });

  it('returns false for common years', () => {
    expect(isLeapYear(2023)).toBe(false);
    expect(isLeapYear(2025)).toBe(false);
    expect(isLeapYear(2026)).toBe(false);
  });
});

describe('daysInMonth', () => {
  it('returns 28 for February in non-leap year', () => {
    expect(daysInMonth(2025, 2)).toBe(28);
  });

  it('returns 29 for February in leap year', () => {
    expect(daysInMonth(2024, 2)).toBe(29);
  });

  it('returns 31 for January', () => {
    expect(daysInMonth(2025, 1)).toBe(31);
  });

  it('returns 30 for April', () => {
    expect(daysInMonth(2025, 4)).toBe(30);
  });
});

// ═══════════════════════════════════════════════════════
// calculateAge tests
// ═══════════════════════════════════════════════════════

describe('calculateAge', () => {
  it('calculates age for Jan 15, 1990 to March 10, 2026', () => {
    const result = calculateAge({
      birthDate: '1990-01-15',
      toDate: '2026-03-10',
    });
    expect(result.years).toBe(36);
    expect(result.months).toBe(1);
    expect(result.days).toBe(23);
    expect(result.ageText).toBe('36 years, 1 month, 23 days');
  });

  it('calculates total days for Jan 15, 1990 to March 10, 2026', () => {
    const result = calculateAge({
      birthDate: '1990-01-15',
      toDate: '2026-03-10',
    });
    // 36 years spanning 9 leap years (1992,1996,2000,2004,2008,2012,2016,2020,2024)
    // Verified via Date UTC millisecond difference: 13,203 days
    expect(result.totalDays).toBe(13203);
  });

  it('handles leap year birthday (Feb 29, 2000 to Mar 10, 2026)', () => {
    const result = calculateAge({
      birthDate: '2000-02-29',
      toDate: '2026-03-10',
    });
    expect(result.years).toBe(26);
    // Feb 29 -> Mar 10: since 2026 is not a leap year, the birthday
    // effectively falls on Feb 28, so from Feb 28 to Mar 10 = 10 days
    expect(result.months).toBe(0);
    expect(result.days).toBe(10);
    expect(result.leapYearBirth).toBe(true);
  });

  it('returns zero for same-day birth and target', () => {
    const result = calculateAge({
      birthDate: '2026-03-10',
      toDate: '2026-03-10',
    });
    expect(result.years).toBe(0);
    expect(result.months).toBe(0);
    expect(result.days).toBe(0);
    expect(result.totalDays).toBe(0);
    expect(result.ageText).toBe('0 days');
  });

  it('calculates age for one day apart', () => {
    const result = calculateAge({
      birthDate: '2026-03-09',
      toDate: '2026-03-10',
    });
    expect(result.years).toBe(0);
    expect(result.months).toBe(0);
    expect(result.days).toBe(1);
    expect(result.totalDays).toBe(1);
  });

  it('handles end of month boundaries (Jan 31 to Feb 28 non-leap year)', () => {
    const result = calculateAge({
      birthDate: '2025-01-31',
      toDate: '2025-02-28',
    });
    expect(result.years).toBe(0);
    expect(result.months).toBe(0);
    expect(result.days).toBe(28);
    expect(result.totalDays).toBe(28);
  });

  it('handles Jan 31 to Mar 1 (crossing short February)', () => {
    const result = calculateAge({
      birthDate: '2025-01-31',
      toDate: '2025-03-01',
    });
    expect(result.years).toBe(0);
    expect(result.months).toBe(1);
    expect(result.days).toBe(1);
    expect(result.totalDays).toBe(29);
  });

  it('returns zero when birthDate is after toDate', () => {
    const result = calculateAge({
      birthDate: '2026-03-15',
      toDate: '2026-03-10',
    });
    expect(result.years).toBe(0);
    expect(result.months).toBe(0);
    expect(result.days).toBe(0);
    expect(result.totalDays).toBe(0);
  });

  it('calculates total weeks correctly', () => {
    const result = calculateAge({
      birthDate: '1990-01-15',
      toDate: '2026-03-10',
    });
    expect(result.totalWeeks).toBe(Math.floor(13203 / 7)); // 1886
  });

  it('calculates total hours correctly', () => {
    const result = calculateAge({
      birthDate: '1990-01-15',
      toDate: '2026-03-10',
    });
    expect(result.totalHours).toBe(13203 * 24); // 316872
  });

  it('calculates total months correctly', () => {
    const result = calculateAge({
      birthDate: '1990-01-15',
      toDate: '2026-03-10',
    });
    // 36 years * 12 + 1 month = 433
    expect(result.totalMonths).toBe(433);
  });

  it('calculates next birthday correctly when birthday has not yet occurred this year', () => {
    const result = calculateAge({
      birthDate: '1990-12-25',
      toDate: '2026-03-10',
    });
    expect(result.nextBirthdayFormatted).toBe('December 25, 2026');
  });

  it('calculates next birthday correctly when birthday has already passed this year', () => {
    const result = calculateAge({
      birthDate: '1990-01-15',
      toDate: '2026-03-10',
    });
    expect(result.nextBirthdayFormatted).toBe('January 15, 2027');
  });

  it('reports correct zodiac sign for January 15 birth', () => {
    const result = calculateAge({
      birthDate: '1990-01-15',
      toDate: '2026-03-10',
    });
    expect(result.zodiacSign).toBe('Capricorn');
  });

  it('reports correct zodiac sign for July 4 birth (Cancer)', () => {
    const result = calculateAge({
      birthDate: '2000-07-04',
      toDate: '2026-03-10',
    });
    expect(result.zodiacSign).toBe('Cancer');
  });

  it('reports correct day of birth', () => {
    const result = calculateAge({
      birthDate: '1990-01-15',
      toDate: '2026-03-10',
    });
    expect(result.dayOfBirth).toBe('Monday');
  });

  it('handles very old date (Jan 1, 1900)', () => {
    const result = calculateAge({
      birthDate: '1900-01-01',
      toDate: '2026-03-10',
    });
    expect(result.years).toBe(126);
    expect(result.months).toBe(2);
    expect(result.days).toBe(9);
  });

  it('handles exactly one year', () => {
    const result = calculateAge({
      birthDate: '2025-03-10',
      toDate: '2026-03-10',
    });
    expect(result.years).toBe(1);
    expect(result.months).toBe(0);
    expect(result.days).toBe(0);
    expect(result.totalDays).toBe(365);
  });

  it('handles exactly one leap year', () => {
    const result = calculateAge({
      birthDate: '2024-03-10',
      toDate: '2025-03-10',
    });
    expect(result.years).toBe(1);
    expect(result.months).toBe(0);
    expect(result.days).toBe(0);
    expect(result.totalDays).toBe(365); // Mar 10 to Mar 10 is 365 even in leap year (leap day is Feb 29)
  });
});

// ═══════════════════════════════════════════════════════
// calculateDateDiff — difference mode tests
// ═══════════════════════════════════════════════════════

describe('calculateDateDiff — difference mode', () => {
  it('returns 0 days for same date', () => {
    const result = calculateDateDiff({
      startDate: '2026-03-10',
      endDate: '2026-03-10',
      mode: 'difference',
    });
    expect(result.totalDays).toBe(0);
    expect(result.years).toBe(0);
    expect(result.months).toBe(0);
    expect(result.days).toBe(0);
  });

  it('calculates 365 days for one non-leap year', () => {
    const result = calculateDateDiff({
      startDate: '2025-01-01',
      endDate: '2026-01-01',
      mode: 'difference',
    });
    expect(result.totalDays).toBe(365);
    expect(result.years).toBe(1);
    expect(result.months).toBe(0);
    expect(result.days).toBe(0);
  });

  it('calculates 366 days for one leap year', () => {
    const result = calculateDateDiff({
      startDate: '2024-01-01',
      endDate: '2025-01-01',
      mode: 'difference',
    });
    expect(result.totalDays).toBe(366);
    expect(result.years).toBe(1);
    expect(result.months).toBe(0);
    expect(result.days).toBe(0);
  });

  it('calculates days between two specific dates', () => {
    const result = calculateDateDiff({
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      mode: 'difference',
    });
    expect(result.totalDays).toBe(364);
    expect(result.years).toBe(0);
    expect(result.months).toBe(11);
    expect(result.days).toBe(30);
  });

  it('calculates 261 days for Feb 15 to Nov 3, 2025', () => {
    const result = calculateDateDiff({
      startDate: '2025-02-15',
      endDate: '2025-11-03',
      mode: 'difference',
    });
    expect(result.totalDays).toBe(261);
    expect(result.months).toBe(8);
    expect(result.days).toBe(19);
  });

  it('handles reversed dates (end before start)', () => {
    const result = calculateDateDiff({
      startDate: '2026-03-10',
      endDate: '2025-03-10',
      mode: 'difference',
    });
    // Should return negative totalDays
    expect(result.totalDays).toBe(-365);
    // Years/months/days should still be the absolute decomposition
    expect(result.years).toBe(1);
  });

  it('calculates total weeks correctly', () => {
    const result = calculateDateDiff({
      startDate: '2026-01-01',
      endDate: '2026-03-10',
      mode: 'difference',
    });
    // Jan: 31 days remaining, Feb: 28 days, Mar: 10 days = 68 days total
    expect(result.totalDays).toBe(68);
    expect(result.totalWeeks).toBe(9); // 68 / 7 = 9 weeks, 5 days
    expect(result.weeks).toBe(5); // remainder days
  });

  it('calculates total hours correctly', () => {
    const result = calculateDateDiff({
      startDate: '2026-03-01',
      endDate: '2026-03-10',
      mode: 'difference',
    });
    expect(result.totalDays).toBe(9);
    expect(result.totalHours).toBe(216); // 9 * 24
  });

  it('calculates crossing multiple leap years correctly', () => {
    const result = calculateDateDiff({
      startDate: '2020-01-01',
      endDate: '2026-01-01',
      mode: 'difference',
    });
    // 2020 (leap) + 2021 + 2022 + 2023 + 2024 (leap) + 2025 = 6 years
    // 366 + 365 + 365 + 365 + 366 + 365 = 2192
    expect(result.totalDays).toBe(2192);
    expect(result.years).toBe(6);
  });

  it('handles very old date (1900-01-01 to 2026-03-10)', () => {
    const result = calculateDateDiff({
      startDate: '1900-01-01',
      endDate: '2026-03-10',
      mode: 'difference',
    });
    expect(result.years).toBe(126);
    expect(result.months).toBe(2);
    expect(result.days).toBe(9);
    // Total days should be a large number
    expect(result.totalDays).toBeGreaterThan(46000);
  });
});

// ═══════════════════════════════════════════════════════
// calculateDateDiff — add/subtract mode tests
// ═══════════════════════════════════════════════════════

describe('calculateDateDiff — add mode', () => {
  it('adds 30 days to March 10, 2026', () => {
    const result = calculateDateDiff({
      startDate: '2026-03-10',
      mode: 'add',
      daysToAdd: 30,
    });
    expect(result.resultDate).toBe('2026-04-09');
    expect(result.dayOfWeek).toBe('Thursday');
  });

  it('adds 90 days to March 10, 2026', () => {
    const result = calculateDateDiff({
      startDate: '2026-03-10',
      mode: 'add',
      daysToAdd: 90,
    });
    expect(result.resultDate).toBe('2026-06-08');
    expect(result.dayOfWeek).toBe('Monday');
  });

  it('adds 365 days crossing year boundary', () => {
    const result = calculateDateDiff({
      startDate: '2026-03-10',
      mode: 'add',
      daysToAdd: 365,
    });
    expect(result.resultDate).toBe('2027-03-10');
    expect(result.dayOfWeek).toBe('Wednesday');
  });

  it('adds 0 days returns same date', () => {
    const result = calculateDateDiff({
      startDate: '2026-03-10',
      mode: 'add',
      daysToAdd: 0,
    });
    expect(result.resultDate).toBe('2026-03-10');
  });

  it('adds days crossing leap year February', () => {
    const result = calculateDateDiff({
      startDate: '2024-02-28',
      mode: 'add',
      daysToAdd: 1,
    });
    expect(result.resultDate).toBe('2024-02-29'); // leap year
  });

  it('adds days in non-leap year February', () => {
    const result = calculateDateDiff({
      startDate: '2025-02-28',
      mode: 'add',
      daysToAdd: 1,
    });
    expect(result.resultDate).toBe('2025-03-01'); // not a leap year
  });

  it('returns formatted date and day of week', () => {
    const result = calculateDateDiff({
      startDate: '2026-03-10',
      mode: 'add',
      daysToAdd: 90,
    });
    expect(result.resultDateFormatted).toBe('June 8, 2026');
    expect(result.dayOfWeek).toBe('Monday');
  });
});

describe('calculateDateDiff — subtract mode', () => {
  it('subtracts 30 days from March 10, 2026', () => {
    const result = calculateDateDiff({
      startDate: '2026-03-10',
      mode: 'subtract',
      daysToAdd: 30,
    });
    expect(result.resultDate).toBe('2026-02-08');
    expect(result.dayOfWeek).toBe('Sunday');
  });

  it('subtracts 180 days from March 10, 2026', () => {
    const result = calculateDateDiff({
      startDate: '2026-03-10',
      mode: 'subtract',
      daysToAdd: 180,
    });
    expect(result.resultDate).toBe('2025-09-11');
    expect(result.dayOfWeek).toBe('Thursday');
  });

  it('subtracts days crossing year boundary', () => {
    const result = calculateDateDiff({
      startDate: '2026-01-15',
      mode: 'subtract',
      daysToAdd: 30,
    });
    expect(result.resultDate).toBe('2025-12-16');
  });

  it('subtracts days crossing month boundary', () => {
    const result = calculateDateDiff({
      startDate: '2026-03-05',
      mode: 'subtract',
      daysToAdd: 10,
    });
    expect(result.resultDate).toBe('2026-02-23');
  });
});

// ═══════════════════════════════════════════════════════
// calculateDateDiff — baseDate alias for add/subtract
// ═══════════════════════════════════════════════════════

describe('calculateDateDiff — baseDate alias', () => {
  it('accepts baseDate as alias for startDate in add mode', () => {
    const result = calculateDateDiff({
      baseDate: '2026-03-10',
      mode: 'add',
      daysToAdd: 30,
    });
    expect(result.resultDate).toBe('2026-04-09');
  });
});

// ═══════════════════════════════════════════════════════
// Edge cases and far-future dates
// ═══════════════════════════════════════════════════════

describe('Edge cases', () => {
  it('handles far future date (add 36500 days ~ 100 years)', () => {
    const result = calculateDateDiff({
      startDate: '2026-03-10',
      mode: 'add',
      daysToAdd: 36500,
    });
    // ~100 years from 2026 ≈ 2126
    expect(result.resultDate).toMatch(/^2126-/);
    expect(result.resultDateFormatted).toContain('2126');
  });

  it('handles age calculation for a centenarian', () => {
    const result = calculateAge({
      birthDate: '1926-03-10',
      toDate: '2026-03-10',
    });
    expect(result.years).toBe(100);
    expect(result.months).toBe(0);
    expect(result.days).toBe(0);
  });

  it('correctly counts total minutes', () => {
    const result = calculateAge({
      birthDate: '2026-03-09',
      toDate: '2026-03-10',
    });
    expect(result.totalMinutes).toBe(1440); // 1 day * 24 * 60
  });
});
