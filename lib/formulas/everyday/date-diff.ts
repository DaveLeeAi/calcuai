/**
 * Date Difference Calculator
 * Calculates exact differences between dates and date arithmetic.
 *
 * Used by: Age Calculator, Date Calculator, Countdown Calculator
 *
 * Algorithms:
 *   - Year/Month/Day decomposition: Gregorian calendar arithmetic
 *     counting complete years, then complete months, then remaining days,
 *     with proper handling of month-end boundaries and leap years.
 *   - Total days: millisecond difference / 86,400,000
 *   - Add/subtract: JavaScript Date arithmetic with day offset
 *
 * Leap year rule (Gregorian calendar, Pope Gregory XIII, 1582):
 *   A year is a leap year if divisible by 4,
 *   EXCEPT centuries (divisible by 100) are NOT leap years,
 *   UNLESS also divisible by 400.
 *
 * Source: Gregorian calendar system adopted by papal bull
 * Inter gravissimas (February 24, 1582).
 */

// ═══════════════════════════════════════════════════════
// Interfaces
// ═══════════════════════════════════════════════════════

export interface DateDiffInput {
  startDate: string; // ISO date string (YYYY-MM-DD)
  endDate: string;   // ISO date string (YYYY-MM-DD)
  mode: 'difference' | 'add' | 'subtract';
  daysToAdd?: number;
}

export interface DateDiffOutput {
  // For difference mode:
  totalDays: number;
  years: number;
  months: number;
  days: number;
  weeks: number;
  totalWeeks: number;
  totalMonths: number;
  totalHours: number;
  totalMinutes: number;
  // For add/subtract mode:
  resultDate?: string;
  resultDateFormatted?: string;
  dayOfWeek?: string;
}

export interface AgeOutput {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  totalMonths: number;
  totalHours: number;
  totalMinutes: number;
  ageText: string;
  nextBirthday: string;
  nextBirthdayFormatted: string;
  daysUntilBirthday: number;
  dayOfBirth: string;
  zodiacSign: string;
  chineseZodiac: string;
  leapYearBirth: boolean;
}

// ═══════════════════════════════════════════════════════
// Helper functions
// ═══════════════════════════════════════════════════════

const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday',
  'Thursday', 'Friday', 'Saturday',
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const ZODIAC_SIGNS: { name: string; start: [number, number]; end: [number, number] }[] = [
  { name: 'Capricorn', start: [12, 22], end: [1, 19] },
  { name: 'Aquarius', start: [1, 20], end: [2, 18] },
  { name: 'Pisces', start: [2, 19], end: [3, 20] },
  { name: 'Aries', start: [3, 21], end: [4, 19] },
  { name: 'Taurus', start: [4, 20], end: [5, 20] },
  { name: 'Gemini', start: [5, 21], end: [6, 20] },
  { name: 'Cancer', start: [6, 21], end: [7, 22] },
  { name: 'Leo', start: [7, 23], end: [8, 22] },
  { name: 'Virgo', start: [8, 23], end: [9, 22] },
  { name: 'Libra', start: [9, 23], end: [10, 22] },
  { name: 'Scorpio', start: [10, 23], end: [11, 21] },
  { name: 'Sagittarius', start: [11, 22], end: [12, 21] },
];

const CHINESE_ZODIAC_ANIMALS = [
  'Monkey', 'Rooster', 'Dog', 'Pig',
  'Rat', 'Ox', 'Tiger', 'Rabbit',
  'Dragon', 'Snake', 'Horse', 'Goat',
];

/**
 * Returns true if the given year is a leap year under the Gregorian calendar.
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * Returns the number of days in the given month (1-indexed) for the given year.
 */
export function daysInMonth(year: number, month: number): number {
  const daysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month === 2 && isLeapYear(year)) return 29;
  return daysPerMonth[month - 1];
}

/**
 * Parses an ISO date string (YYYY-MM-DD) into a UTC Date object at midnight.
 * Avoids timezone issues by constructing directly in UTC.
 */
function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Formats a Date object to a human-readable string.
 */
function formatDate(date: Date): string {
  const month = MONTH_NAMES[date.getUTCMonth()];
  return `${month} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

/**
 * Gets the day of week name for a UTC date.
 */
function getDayOfWeek(date: Date): string {
  return DAYS_OF_WEEK[date.getUTCDay()];
}

/**
 * Gets the Western zodiac sign for a given month (1-indexed) and day.
 */
function getZodiacSign(month: number, day: number): string {
  for (const sign of ZODIAC_SIGNS) {
    if (sign.name === 'Capricorn') {
      // Capricorn spans year boundary: Dec 22 - Jan 19
      if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
        return sign.name;
      }
    } else {
      const [startMonth, startDay] = sign.start;
      const [endMonth, endDay] = sign.end;
      if (
        (month === startMonth && day >= startDay) ||
        (month === endMonth && day <= endDay)
      ) {
        return sign.name;
      }
    }
  }
  return 'Unknown';
}

/**
 * Gets the Chinese zodiac animal for a given year.
 * Based on the cycle: the year mod 12 maps to the animal list.
 */
function getChineseZodiac(year: number): string {
  return CHINESE_ZODIAC_ANIMALS[year % 12];
}

// ═══════════════════════════════════════════════════════
// Core calculation: Year/Month/Day decomposition
// ═══════════════════════════════════════════════════════

/**
 * Calculates the exact difference between two dates as years, months, and days.
 *
 * Algorithm:
 * 1. Count complete years from startDate to endDate
 * 2. Count remaining complete months after the years
 * 3. Count remaining days after the months
 *
 * Handles month-end boundaries: if start day > end month's max days,
 * the day component accounts for the shorter month.
 */
function decomposeDateDiff(
  start: Date,
  end: Date
): { years: number; months: number; days: number } {
  const startYear = start.getUTCFullYear();
  const startMonth = start.getUTCMonth() + 1; // 1-indexed
  const startDay = start.getUTCDate();

  const endYear = end.getUTCFullYear();
  const endMonth = end.getUTCMonth() + 1;
  const endDay = end.getUTCDate();

  let years = endYear - startYear;
  let months = endMonth - startMonth;
  let days = endDay - startDay;

  // If days are negative, borrow a month
  if (days < 0) {
    months -= 1;
    // Calculate how many days were in the month BEFORE the end month
    // This represents the month we're "borrowing" from
    const prevMonth = endMonth - 1 === 0 ? 12 : endMonth - 1;
    const prevMonthYear = endMonth - 1 === 0 ? endYear - 1 : endYear;
    const prevMonthDays = daysInMonth(prevMonthYear, prevMonth);
    // When the start day exceeds the previous month's length (e.g., start=31, prev month=Feb with 28 days),
    // we treat the start as if it were the last day of that month for borrowing purposes
    const effectiveStartDay = Math.min(startDay, prevMonthDays);
    days = prevMonthDays - effectiveStartDay + endDay;
  }

  // If months are negative, borrow a year
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years, months, days };
}

// ═══════════════════════════════════════════════════════
// Main function: Date Difference Calculator
// ═══════════════════════════════════════════════════════

/**
 * Calculates date differences or performs date arithmetic.
 *
 * Modes:
 * - 'difference': Calculates the exact difference between startDate and endDate
 * - 'add': Adds daysToAdd to startDate, returns the resulting date
 * - 'subtract': Subtracts daysToAdd from startDate, returns the resulting date
 *
 * @param inputs - Record with startDate, endDate, mode, and optional daysToAdd
 * @returns Record with calculation results
 */
export function calculateDateDiff(inputs: Record<string, unknown>): Record<string, unknown> {
  const mode = (inputs.mode as string) || 'difference';

  if (mode === 'add' || mode === 'subtract') {
    const baseDateStr = (inputs.startDate as string) || (inputs.baseDate as string);
    const daysToAdd = Number(inputs.daysToAdd) || 0;
    const baseDate = parseDate(baseDateStr);

    const resultDate = new Date(baseDate);
    if (mode === 'add') {
      resultDate.setUTCDate(resultDate.getUTCDate() + daysToAdd);
    } else {
      resultDate.setUTCDate(resultDate.getUTCDate() - daysToAdd);
    }

    return {
      totalDays: daysToAdd,
      daysBetween: daysToAdd,
      years: 0,
      months: 0,
      days: 0,
      weeks: 0,
      totalWeeks: Math.floor(daysToAdd / 7),
      totalMonths: 0,
      totalHours: daysToAdd * 24,
      totalMinutes: daysToAdd * 24 * 60,
      dateBreakdown: [
        { label: 'Days', value: daysToAdd },
        { label: 'Weeks', value: Math.floor(daysToAdd / 7) },
        { label: 'Hours', value: daysToAdd * 24 },
      ],
      resultDate: resultDate.toISOString().split('T')[0],
      resultDateFormatted: formatDate(resultDate),
      dayOfWeek: getDayOfWeek(resultDate),
    };
  }

  // Difference mode
  const startDate = parseDate(inputs.startDate as string);
  const endDate = parseDate(inputs.endDate as string);

  // Ensure start <= end for positive results
  const isReversed = startDate.getTime() > endDate.getTime();
  const earlier = isReversed ? endDate : startDate;
  const later = isReversed ? startDate : endDate;

  const { years, months, days } = decomposeDateDiff(earlier, later);

  // Total days via millisecond difference
  const msDiff = later.getTime() - earlier.getTime();
  const totalDays = Math.round(msDiff / (1000 * 60 * 60 * 24));

  const totalWeeks = Math.floor(totalDays / 7);
  const remainingDaysAfterWeeks = totalDays % 7;
  const totalMonths = years * 12 + months;
  const totalHours = totalDays * 24;
  const totalMinutes = totalHours * 60;

  const totalDaysSigned = isReversed ? -totalDays : totalDays;

  return {
    totalDays: totalDaysSigned,
    daysBetween: Math.abs(totalDaysSigned),
    years,
    months,
    days,
    weeks: remainingDaysAfterWeeks,
    totalWeeks,
    totalMonths,
    totalHours,
    totalMinutes,
    dateBreakdown: [
      { label: 'Years', value: years },
      { label: 'Months', value: months },
      { label: 'Days', value: days },
      { label: 'Total Weeks', value: totalWeeks },
      { label: 'Total Hours', value: totalHours },
    ],
    // Include add/subtract fields as null so OutputDisplay shows '—' for inactive tab
    resultDate: null,
    resultDateFormatted: null,
    dayOfWeek: null,
  };
}

// ═══════════════════════════════════════════════════════
// Specialized function: Age Calculator
// ═══════════════════════════════════════════════════════

/**
 * Calculates exact age from a birth date to a target date.
 * Returns years, months, days plus bonus info like next birthday,
 * zodiac sign, and Chinese zodiac animal.
 *
 * Uses the Gregorian calendar year/month/day decomposition algorithm.
 *
 * @param inputs - Record with birthDate and toDate (ISO strings)
 * @returns Record with age breakdown and metadata
 */
export function calculateAge(inputs: Record<string, unknown>): Record<string, unknown> {
  const birthDateStr = inputs.birthDate as string;
  const toDateStr = inputs.toDate as string;

  const birthDate = parseDate(birthDateStr);
  const toDate = parseDate(toDateStr);

  // If birth date is after target date, return zeros
  if (birthDate.getTime() > toDate.getTime()) {
    return {
      years: 0,
      months: 0,
      days: 0,
      totalDays: 0,
      totalWeeks: 0,
      totalMonths: 0,
      totalHours: 0,
      totalMinutes: 0,
      ageText: '0 years, 0 months, 0 days',
      nextBirthday: '',
      nextBirthdayFormatted: 'N/A',
      daysUntilBirthday: 0,
      dayOfBirth: getDayOfWeek(birthDate),
      zodiacSign: getZodiacSign(birthDate.getUTCMonth() + 1, birthDate.getUTCDate()),
      chineseZodiac: getChineseZodiac(birthDate.getUTCFullYear()),
      leapYearBirth: birthDate.getUTCMonth() === 1 && birthDate.getUTCDate() === 29,
    };
  }

  const { years, months, days } = decomposeDateDiff(birthDate, toDate);

  // Total days via millisecond difference
  const msDiff = toDate.getTime() - birthDate.getTime();
  const totalDays = Math.round(msDiff / (1000 * 60 * 60 * 24));

  const totalWeeks = Math.floor(totalDays / 7);
  const totalMonths = years * 12 + months;
  const totalHours = totalDays * 24;
  const totalMinutes = totalHours * 60;

  // Build age text
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? 'year' : 'years'}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? 'month' : 'months'}`);
  parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
  const ageText = parts.join(', ');

  // Calculate next birthday
  const birthMonth = birthDate.getUTCMonth(); // 0-indexed
  const birthDay = birthDate.getUTCDate();
  const toYear = toDate.getUTCFullYear();

  let nextBirthdayYear = toYear;
  let nextBirthday: Date;

  // Try this year's birthday first
  const thisYearBirthday = createBirthdayDate(toYear, birthMonth, birthDay);

  if (thisYearBirthday.getTime() > toDate.getTime()) {
    nextBirthday = thisYearBirthday;
  } else {
    // Birthday has passed this year or is today, use next year
    nextBirthdayYear = toYear + 1;
    nextBirthday = createBirthdayDate(nextBirthdayYear, birthMonth, birthDay);
  }

  const daysUntilBirthday = Math.round(
    (nextBirthday.getTime() - toDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const isLeapBirthday = birthMonth === 1 && birthDay === 29; // Feb 29

  return {
    years,
    months,
    days,
    totalDays,
    totalWeeks,
    totalMonths,
    totalHours,
    totalMinutes,
    ageText,
    ageResult: ageText,
    ageBreakdown: [
      { label: 'Years', value: years },
      { label: 'Months', value: months },
      { label: 'Days', value: days },
      { label: 'Total Days', value: totalDays },
      { label: 'Total Weeks', value: totalWeeks },
    ],
    nextBirthday: nextBirthday.toISOString().split('T')[0],
    nextBirthdayFormatted: formatDate(nextBirthday),
    daysUntilBirthday,
    dayOfBirth: getDayOfWeek(birthDate),
    zodiacSign: getZodiacSign(birthMonth + 1, birthDay),
    chineseZodiac: getChineseZodiac(birthDate.getUTCFullYear()),
    leapYearBirth: isLeapBirthday,
  };
}

/**
 * Creates a birthday Date for a given year, handling Feb 29 in non-leap years.
 */
function createBirthdayDate(year: number, month: number, day: number): Date {
  // If birthday is Feb 29 and the target year is not a leap year, use Feb 28
  if (month === 1 && day === 29 && !isLeapYear(year)) {
    return new Date(Date.UTC(year, 1, 28));
  }
  return new Date(Date.UTC(year, month, day));
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'date-diff': calculateDateDiff,
  'age-calc': calculateAge,
};
