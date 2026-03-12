/**
 * Time Zone Converter
 *
 * Converts a given time from one time zone to another using UTC offset arithmetic.
 *
 * Formula:
 *   targetTime = sourceTime - sourceOffset + targetOffset
 *
 * Where offsets are in minutes relative to UTC (e.g., EST = -300, IST = +330).
 *
 * Source: IANA Time Zone Database (maintained by ICANN).
 *         UTC offsets per ISO 8601.
 */

// ═══════════════════════════════════════════════════════
// Interfaces
// ═══════════════════════════════════════════════════════

export interface TimezoneInfo {
  id: string;
  label: string;
  abbreviation: string;
  utcOffsetMinutes: number;
  utcOffsetFormatted: string;
}

export interface TimezoneConvertOutput {
  sourceTime: string;
  sourceTimezone: string;
  sourceAbbreviation: string;
  sourceOffset: string;
  targetTime: string;
  targetTimezone: string;
  targetAbbreviation: string;
  targetOffset: string;
  timeDifferenceHours: number;
  timeDifferenceFormatted: string;
  dayShift: number; // -1 = previous day, 0 = same day, 1 = next day
  dayShiftLabel: string;
}

// ═══════════════════════════════════════════════════════
// Time zone database (common zones with standard offsets)
// ═══════════════════════════════════════════════════════

/**
 * Common world time zones with their standard UTC offsets.
 * Note: DST is not applied — offsets are standard time.
 */
export const TIMEZONES: TimezoneInfo[] = [
  { id: 'UTC', label: 'UTC (Coordinated Universal Time)', abbreviation: 'UTC', utcOffsetMinutes: 0, utcOffsetFormatted: 'UTC+0:00' },
  { id: 'EST', label: 'Eastern Standard Time', abbreviation: 'EST', utcOffsetMinutes: -300, utcOffsetFormatted: 'UTC-5:00' },
  { id: 'EDT', label: 'Eastern Daylight Time', abbreviation: 'EDT', utcOffsetMinutes: -240, utcOffsetFormatted: 'UTC-4:00' },
  { id: 'CST', label: 'Central Standard Time', abbreviation: 'CST', utcOffsetMinutes: -360, utcOffsetFormatted: 'UTC-6:00' },
  { id: 'CDT', label: 'Central Daylight Time', abbreviation: 'CDT', utcOffsetMinutes: -300, utcOffsetFormatted: 'UTC-5:00' },
  { id: 'MST', label: 'Mountain Standard Time', abbreviation: 'MST', utcOffsetMinutes: -420, utcOffsetFormatted: 'UTC-7:00' },
  { id: 'MDT', label: 'Mountain Daylight Time', abbreviation: 'MDT', utcOffsetMinutes: -360, utcOffsetFormatted: 'UTC-6:00' },
  { id: 'PST', label: 'Pacific Standard Time', abbreviation: 'PST', utcOffsetMinutes: -480, utcOffsetFormatted: 'UTC-8:00' },
  { id: 'PDT', label: 'Pacific Daylight Time', abbreviation: 'PDT', utcOffsetMinutes: -420, utcOffsetFormatted: 'UTC-7:00' },
  { id: 'AKST', label: 'Alaska Standard Time', abbreviation: 'AKST', utcOffsetMinutes: -540, utcOffsetFormatted: 'UTC-9:00' },
  { id: 'HST', label: 'Hawaii Standard Time', abbreviation: 'HST', utcOffsetMinutes: -600, utcOffsetFormatted: 'UTC-10:00' },
  { id: 'GMT', label: 'Greenwich Mean Time', abbreviation: 'GMT', utcOffsetMinutes: 0, utcOffsetFormatted: 'UTC+0:00' },
  { id: 'BST', label: 'British Summer Time', abbreviation: 'BST', utcOffsetMinutes: 60, utcOffsetFormatted: 'UTC+1:00' },
  { id: 'CET', label: 'Central European Time', abbreviation: 'CET', utcOffsetMinutes: 60, utcOffsetFormatted: 'UTC+1:00' },
  { id: 'CEST', label: 'Central European Summer Time', abbreviation: 'CEST', utcOffsetMinutes: 120, utcOffsetFormatted: 'UTC+2:00' },
  { id: 'EET', label: 'Eastern European Time', abbreviation: 'EET', utcOffsetMinutes: 120, utcOffsetFormatted: 'UTC+2:00' },
  { id: 'MSK', label: 'Moscow Standard Time', abbreviation: 'MSK', utcOffsetMinutes: 180, utcOffsetFormatted: 'UTC+3:00' },
  { id: 'IST', label: 'India Standard Time', abbreviation: 'IST', utcOffsetMinutes: 330, utcOffsetFormatted: 'UTC+5:30' },
  { id: 'CST_CHINA', label: 'China Standard Time', abbreviation: 'CST (China)', utcOffsetMinutes: 480, utcOffsetFormatted: 'UTC+8:00' },
  { id: 'JST', label: 'Japan Standard Time', abbreviation: 'JST', utcOffsetMinutes: 540, utcOffsetFormatted: 'UTC+9:00' },
  { id: 'KST', label: 'Korea Standard Time', abbreviation: 'KST', utcOffsetMinutes: 540, utcOffsetFormatted: 'UTC+9:00' },
  { id: 'AEST', label: 'Australian Eastern Standard Time', abbreviation: 'AEST', utcOffsetMinutes: 600, utcOffsetFormatted: 'UTC+10:00' },
  { id: 'AEDT', label: 'Australian Eastern Daylight Time', abbreviation: 'AEDT', utcOffsetMinutes: 660, utcOffsetFormatted: 'UTC+11:00' },
  { id: 'NZST', label: 'New Zealand Standard Time', abbreviation: 'NZST', utcOffsetMinutes: 720, utcOffsetFormatted: 'UTC+12:00' },
  { id: 'AST', label: 'Atlantic Standard Time', abbreviation: 'AST', utcOffsetMinutes: -240, utcOffsetFormatted: 'UTC-4:00' },
  { id: 'BRT', label: 'Brasília Time', abbreviation: 'BRT', utcOffsetMinutes: -180, utcOffsetFormatted: 'UTC-3:00' },
  { id: 'GST', label: 'Gulf Standard Time', abbreviation: 'GST', utcOffsetMinutes: 240, utcOffsetFormatted: 'UTC+4:00' },
  { id: 'SGT', label: 'Singapore Time', abbreviation: 'SGT', utcOffsetMinutes: 480, utcOffsetFormatted: 'UTC+8:00' },
  { id: 'HKT', label: 'Hong Kong Time', abbreviation: 'HKT', utcOffsetMinutes: 480, utcOffsetFormatted: 'UTC+8:00' },
  { id: 'ICT', label: 'Indochina Time', abbreviation: 'ICT', utcOffsetMinutes: 420, utcOffsetFormatted: 'UTC+7:00' },
];

// ═══════════════════════════════════════════════════════
// Helper functions
// ═══════════════════════════════════════════════════════

/**
 * Finds a timezone by its ID string.
 */
export function findTimezone(id: string): TimezoneInfo | undefined {
  return TIMEZONES.find(tz => tz.id === id);
}

/**
 * Formats minutes of the day (0-1439) as HH:MM in 12-hour format.
 */
function formatTime12(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayHour}:${String(m).padStart(2, '0')} ${period}`;
}

/**
 * Formats minutes of the day as HH:MM in 24-hour format.
 */
function formatTime24(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Formats a UTC offset in minutes as a human-readable string.
 */
function formatOffset(offsetMinutes: number): string {
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMinutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `UTC${sign}${h}:${String(m).padStart(2, '0')}`;
}

/**
 * Formats the difference in hours between two offsets.
 */
function formatDifference(diffMinutes: number): string {
  const sign = diffMinutes >= 0 ? '+' : '-';
  const abs = Math.abs(diffMinutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  if (m === 0) return `${sign}${h} hours`;
  return `${sign}${h} hours ${m} minutes`;
}

// ═══════════════════════════════════════════════════════
// Main function: Time Zone Converter
// ═══════════════════════════════════════════════════════

/**
 * Converts time from one timezone to another.
 *
 * targetTime = sourceTime - sourceOffset + targetOffset
 *
 * @param inputs - Record with sourceHour, sourceMinute, sourceTimezone, targetTimezone
 * @returns Record with conversion results
 */
export function calculateTimezoneConvert(inputs: Record<string, unknown>): Record<string, unknown> {
  const sourceHour = Math.min(23, Math.max(0, Math.floor(Number(inputs.sourceHour) || 0)));
  const sourceMinute = Math.min(59, Math.max(0, Math.floor(Number(inputs.sourceMinute) || 0)));
  const sourceTimezoneId = String(inputs.sourceTimezone || 'EST');
  const targetTimezoneId = String(inputs.targetTimezone || 'PST');

  const sourceTz = findTimezone(sourceTimezoneId);
  const targetTz = findTimezone(targetTimezoneId);

  if (!sourceTz || !targetTz) {
    return {
      sourceTime: '00:00',
      sourceTimezone: 'Unknown',
      sourceAbbreviation: '?',
      sourceOffset: 'UTC+0:00',
      targetTime: '00:00',
      targetTimezone: 'Unknown',
      targetAbbreviation: '?',
      targetOffset: 'UTC+0:00',
      timeDifferenceHours: 0,
      timeDifferenceFormatted: '0 hours',
      dayShift: 0,
      dayShiftLabel: 'Same day',
    };
  }

  // Convert source time to minutes from midnight
  const sourceMinutes = sourceHour * 60 + sourceMinute;

  // Convert to UTC, then to target
  // targetMinutes = sourceMinutes - sourceOffset + targetOffset
  const diffMinutes = targetTz.utcOffsetMinutes - sourceTz.utcOffsetMinutes;
  let targetMinutes = sourceMinutes + diffMinutes;

  // Handle day boundary crossings
  let dayShift = 0;
  if (targetMinutes < 0) {
    targetMinutes += 1440; // add 24 hours
    dayShift = -1;
  } else if (targetMinutes >= 1440) {
    targetMinutes -= 1440;
    dayShift = 1;
  }

  const dayShiftLabel = dayShift === -1
    ? 'Previous day'
    : dayShift === 1
      ? 'Next day'
      : 'Same day';

  const timeDiffHours = parseFloat((diffMinutes / 60).toFixed(2));

  return {
    sourceTime: formatTime12(sourceMinutes),
    sourceTime24: formatTime24(sourceMinutes),
    sourceTimezone: sourceTz.label,
    sourceAbbreviation: sourceTz.abbreviation,
    sourceOffset: formatOffset(sourceTz.utcOffsetMinutes),
    targetTime: formatTime12(targetMinutes),
    targetTime24: formatTime24(targetMinutes),
    targetTimezone: targetTz.label,
    targetAbbreviation: targetTz.abbreviation,
    targetOffset: formatOffset(targetTz.utcOffsetMinutes),
    timeDifferenceHours: timeDiffHours,
    timeDifferenceFormatted: formatDifference(diffMinutes),
    dayShift,
    dayShiftLabel,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'timezone': calculateTimezoneConvert,
};
