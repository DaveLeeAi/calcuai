/**
 * Time Math Calculator
 *
 * Performs addition and subtraction on time values (hours, minutes, seconds).
 * Also converts between start/end times and total elapsed hours for timesheets.
 *
 * Used by: Time Calculator, Hours Calculator
 *
 * Formulas:
 *   Total seconds = hours × 3600 + minutes × 60 + seconds
 *   Add/subtract: convert both operands to total seconds, operate, convert back
 *   Elapsed time: (endTime - startTime) in seconds, adjusted for overnight spans
 *
 * Source: International System of Units (SI) — 1 hour = 3600 seconds,
 *         1 minute = 60 seconds. Standard sexagesimal time arithmetic.
 */

// ═══════════════════════════════════════════════════════
// Interfaces
// ═══════════════════════════════════════════════════════

export interface TimeValue {
  hours: number;
  minutes: number;
  seconds: number;
}

export interface TimeMathOutput {
  totalSeconds: number;
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
  decimalHours: number;
  decimalMinutes: number;
  isNegative: boolean;
}

export interface HoursWorkedOutput {
  totalSeconds: number;
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
  decimalHours: number;
  isOvernight: boolean;
  breakDeducted: number;
  grossHours: number;
  grossFormatted: string;
}

// ═══════════════════════════════════════════════════════
// Helper functions
// ═══════════════════════════════════════════════════════

/**
 * Converts hours, minutes, seconds to total seconds.
 * totalSeconds = h × 3600 + m × 60 + s
 */
export function toTotalSeconds(hours: number, minutes: number, seconds: number): number {
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Converts total seconds back to hours, minutes, seconds.
 * Handles negative values by tracking sign separately.
 */
export function fromTotalSeconds(totalSeconds: number): TimeValue & { isNegative: boolean } {
  const isNegative = totalSeconds < 0;
  const abs = Math.abs(totalSeconds);
  const hours = Math.floor(abs / 3600);
  const minutes = Math.floor((abs % 3600) / 60);
  const seconds = Math.round(abs % 60);

  return { hours, minutes, seconds, isNegative };
}

/**
 * Formats a time value as HH:MM:SS with optional negative sign.
 */
export function formatTime(hours: number, minutes: number, seconds: number, isNegative: boolean): string {
  const sign = isNegative ? '-' : '';
  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return `${sign}${hh}:${mm}:${ss}`;
}

/**
 * Parses a time string (HH:MM, HH:MM:SS, or H:MM AM/PM) to total seconds from midnight.
 * Returns null if unparseable.
 */
export function parseTimeString(timeStr: string): number | null {
  if (!timeStr || typeof timeStr !== 'string') return null;

  const trimmed = timeStr.trim().toUpperCase();

  // Try 12-hour format: "2:30 PM", "11:00 AM"
  const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = parseInt(ampmMatch[2], 10);
    const seconds = ampmMatch[3] ? parseInt(ampmMatch[3], 10) : 0;
    const period = ampmMatch[4];

    if (hours < 1 || hours > 12 || minutes > 59 || seconds > 59) return null;

    if (period === 'AM' && hours === 12) hours = 0;
    if (period === 'PM' && hours !== 12) hours += 12;

    return toTotalSeconds(hours, minutes, seconds);
  }

  // Try 24-hour format: "14:30", "08:00:00"
  const h24Match = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (h24Match) {
    const hours = parseInt(h24Match[1], 10);
    const minutes = parseInt(h24Match[2], 10);
    const seconds = h24Match[3] ? parseInt(h24Match[3], 10) : 0;

    if (hours > 23 || minutes > 59 || seconds > 59) return null;

    return toTotalSeconds(hours, minutes, seconds);
  }

  return null;
}

// ═══════════════════════════════════════════════════════
// Main function: Time Calculator (add/subtract HH:MM:SS)
// ═══════════════════════════════════════════════════════

/**
 * Adds or subtracts two time values.
 *
 * @param inputs - Record with hours1, minutes1, seconds1, hours2, minutes2, seconds2, operation
 * @returns Record with result in multiple formats
 */
export function calculateTimeMath(inputs: Record<string, unknown>): Record<string, unknown> {
  const hours1 = Math.max(0, Math.floor(Number(inputs.hours1) || 0));
  const minutes1 = Math.max(0, Math.floor(Number(inputs.minutes1) || 0));
  const seconds1 = Math.max(0, Math.floor(Number(inputs.seconds1) || 0));

  const hours2 = Math.max(0, Math.floor(Number(inputs.hours2) || 0));
  const minutes2 = Math.max(0, Math.floor(Number(inputs.minutes2) || 0));
  const seconds2 = Math.max(0, Math.floor(Number(inputs.seconds2) || 0));

  const operation = (inputs.operation as string) || 'add';

  const totalSec1 = toTotalSeconds(hours1, minutes1, seconds1);
  const totalSec2 = toTotalSeconds(hours2, minutes2, seconds2);

  const resultSeconds = operation === 'subtract'
    ? totalSec1 - totalSec2
    : totalSec1 + totalSec2;

  const { hours, minutes, seconds, isNegative } = fromTotalSeconds(resultSeconds);
  const absSeconds = Math.abs(resultSeconds);

  return {
    totalSeconds: resultSeconds,
    hours,
    minutes,
    seconds,
    formatted: formatTime(hours, minutes, seconds, isNegative),
    decimalHours: parseFloat((absSeconds / 3600).toFixed(4)),
    decimalMinutes: parseFloat((absSeconds / 60).toFixed(2)),
    isNegative,
    // Input echo for display
    time1Formatted: formatTime(
      Math.floor(totalSec1 / 3600),
      Math.floor((totalSec1 % 3600) / 60),
      totalSec1 % 60,
      false
    ),
    time2Formatted: formatTime(
      Math.floor(totalSec2 / 3600),
      Math.floor((totalSec2 % 3600) / 60),
      totalSec2 % 60,
      false
    ),
    operationLabel: operation === 'subtract' ? 'Subtracted' : 'Added',
  };
}

// ═══════════════════════════════════════════════════════
// Main function: Hours Calculator (timesheet)
// ═══════════════════════════════════════════════════════

/**
 * Calculates total hours worked from start time, end time, and break duration.
 * Handles overnight shifts (end time < start time).
 *
 * @param inputs - Record with startTime, endTime (as strings), breakMinutes
 * @returns Record with hours worked in multiple formats
 */
export function calculateHoursWorked(inputs: Record<string, unknown>): Record<string, unknown> {
  const startTimeStr = String(inputs.startTime || '09:00');
  const endTimeStr = String(inputs.endTime || '17:00');
  const breakMinutes = Math.max(0, Math.floor(Number(inputs.breakMinutes) || 0));

  const startSeconds = parseTimeString(startTimeStr);
  const endSeconds = parseTimeString(endTimeStr);

  if (startSeconds === null || endSeconds === null) {
    return {
      totalSeconds: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      formatted: '00:00:00',
      decimalHours: 0,
      isOvernight: false,
      breakDeducted: breakMinutes,
      grossHours: 0,
      grossFormatted: '00:00:00',
    };
  }

  // Calculate elapsed seconds, handling overnight
  let elapsedSeconds: number;
  let isOvernight = false;

  if (endSeconds >= startSeconds) {
    elapsedSeconds = endSeconds - startSeconds;
  } else {
    // Overnight: add 24 hours (86400 seconds) to end time
    isOvernight = true;
    elapsedSeconds = (86400 - startSeconds) + endSeconds;
  }

  const grossSeconds = elapsedSeconds;
  const breakSeconds = breakMinutes * 60;
  const netSeconds = Math.max(0, grossSeconds - breakSeconds);

  const gross = fromTotalSeconds(grossSeconds);
  const net = fromTotalSeconds(netSeconds);

  return {
    totalSeconds: netSeconds,
    hours: net.hours,
    minutes: net.minutes,
    seconds: net.seconds,
    formatted: formatTime(net.hours, net.minutes, net.seconds, false),
    decimalHours: parseFloat((netSeconds / 3600).toFixed(4)),
    isOvernight,
    breakDeducted: breakMinutes,
    grossHours: parseFloat((grossSeconds / 3600).toFixed(4)),
    grossFormatted: formatTime(gross.hours, gross.minutes, gross.seconds, false),
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'time-math': calculateTimeMath,
  'hours-worked': calculateHoursWorked,
};
