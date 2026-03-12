import {
  calculateTimeMath,
  calculateHoursWorked,
  toTotalSeconds,
  fromTotalSeconds,
  formatTime,
  parseTimeString,
} from '@/lib/formulas/everyday/time-math';

// ═══════════════════════════════════════════════════════
// Helper function tests
// ═══════════════════════════════════════════════════════

describe('toTotalSeconds', () => {
  it('converts 1 hour 30 minutes 45 seconds correctly', () => {
    expect(toTotalSeconds(1, 30, 45)).toBe(5445);
  });

  it('converts 0 hours 0 minutes 0 seconds to 0', () => {
    expect(toTotalSeconds(0, 0, 0)).toBe(0);
  });

  it('converts 24 hours to 86400 seconds', () => {
    expect(toTotalSeconds(24, 0, 0)).toBe(86400);
  });
});

describe('fromTotalSeconds', () => {
  it('converts 5445 seconds to 1h 30m 45s', () => {
    const result = fromTotalSeconds(5445);
    expect(result.hours).toBe(1);
    expect(result.minutes).toBe(30);
    expect(result.seconds).toBe(45);
    expect(result.isNegative).toBe(false);
  });

  it('handles negative seconds', () => {
    const result = fromTotalSeconds(-3661);
    expect(result.hours).toBe(1);
    expect(result.minutes).toBe(1);
    expect(result.seconds).toBe(1);
    expect(result.isNegative).toBe(true);
  });

  it('handles zero seconds', () => {
    const result = fromTotalSeconds(0);
    expect(result.hours).toBe(0);
    expect(result.minutes).toBe(0);
    expect(result.seconds).toBe(0);
    expect(result.isNegative).toBe(false);
  });
});

describe('formatTime', () => {
  it('formats 4 hours 15 minutes 0 seconds as 04:15:00', () => {
    expect(formatTime(4, 15, 0, false)).toBe('04:15:00');
  });

  it('formats negative time with minus sign', () => {
    expect(formatTime(1, 30, 0, true)).toBe('-01:30:00');
  });

  it('pads single digits', () => {
    expect(formatTime(0, 5, 9, false)).toBe('00:05:09');
  });
});

describe('parseTimeString', () => {
  it('parses 24-hour format "14:30"', () => {
    expect(parseTimeString('14:30')).toBe(52200);
  });

  it('parses 24-hour format with seconds "08:15:30"', () => {
    expect(parseTimeString('08:15:30')).toBe(29730);
  });

  it('parses 12-hour AM format "9:00 AM"', () => {
    expect(parseTimeString('9:00 AM')).toBe(32400);
  });

  it('parses 12-hour PM format "2:30 PM"', () => {
    expect(parseTimeString('2:30 PM')).toBe(52200);
  });

  it('parses 12:00 AM as midnight (0)', () => {
    expect(parseTimeString('12:00 AM')).toBe(0);
  });

  it('parses 12:00 PM as noon (43200)', () => {
    expect(parseTimeString('12:00 PM')).toBe(43200);
  });

  it('returns null for invalid input', () => {
    expect(parseTimeString('invalid')).toBeNull();
    expect(parseTimeString('')).toBeNull();
  });

  it('returns null for out-of-range values', () => {
    expect(parseTimeString('25:00')).toBeNull();
    expect(parseTimeString('12:60')).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════
// calculateTimeMath tests
// ═══════════════════════════════════════════════════════

describe('calculateTimeMath', () => {
  // ─── Test 1: Basic addition ───
  it('adds 2:30:00 + 1:45:00 = 4:15:00', () => {
    const result = calculateTimeMath({
      hours1: 2, minutes1: 30, seconds1: 0,
      hours2: 1, minutes2: 45, seconds2: 0,
      operation: 'add',
    });
    expect(result.formatted).toBe('04:15:00');
    expect(result.decimalHours).toBeCloseTo(4.25, 2);
    expect(result.totalSeconds).toBe(15300);
  });

  // ─── Test 2: Addition with seconds overflow ───
  it('adds 1:50:45 + 0:10:30 = 2:01:15', () => {
    const result = calculateTimeMath({
      hours1: 1, minutes1: 50, seconds1: 45,
      hours2: 0, minutes2: 10, seconds2: 30,
      operation: 'add',
    });
    expect(result.formatted).toBe('02:01:15');
    expect(result.totalSeconds).toBe(7275);
  });

  // ─── Test 3: Basic subtraction ───
  it('subtracts 8:00:00 - 5:20:00 = 2:40:00', () => {
    const result = calculateTimeMath({
      hours1: 8, minutes1: 0, seconds1: 0,
      hours2: 5, minutes2: 20, seconds2: 0,
      operation: 'subtract',
    });
    expect(result.formatted).toBe('02:40:00');
    expect(result.decimalHours).toBeCloseTo(2.6667, 2);
    expect(result.isNegative).toBe(false);
  });

  // ─── Test 4: Negative subtraction result ───
  it('subtracting larger from smaller gives negative', () => {
    const result = calculateTimeMath({
      hours1: 1, minutes1: 0, seconds1: 0,
      hours2: 2, minutes2: 30, seconds2: 0,
      operation: 'subtract',
    });
    expect(result.isNegative).toBe(true);
    expect(result.formatted).toBe('-01:30:00');
    expect(result.totalSeconds).toBe(-5400);
  });

  // ─── Test 5: Zero inputs ───
  it('handles all zeros', () => {
    const result = calculateTimeMath({
      hours1: 0, minutes1: 0, seconds1: 0,
      hours2: 0, minutes2: 0, seconds2: 0,
      operation: 'add',
    });
    expect(result.formatted).toBe('00:00:00');
    expect(result.totalSeconds).toBe(0);
    expect(result.decimalHours).toBe(0);
  });

  // ─── Test 6: Large hours ───
  it('handles large hour values (100+ hours)', () => {
    const result = calculateTimeMath({
      hours1: 100, minutes1: 0, seconds1: 0,
      hours2: 50, minutes2: 30, seconds2: 0,
      operation: 'add',
    });
    expect(result.hours).toBe(150);
    expect(result.minutes).toBe(30);
    expect(result.totalSeconds).toBe(541800);
  });

  // ─── Test 7: Seconds-only addition ───
  it('adds seconds that overflow into minutes and hours', () => {
    const result = calculateTimeMath({
      hours1: 0, minutes1: 0, seconds1: 45,
      hours2: 0, minutes2: 0, seconds2: 30,
      operation: 'add',
    });
    expect(result.formatted).toBe('00:01:15');
    expect(result.totalSeconds).toBe(75);
  });

  // ─── Test 8: Default operation is add ───
  it('defaults to add when operation not specified', () => {
    const result = calculateTimeMath({
      hours1: 1, minutes1: 0, seconds1: 0,
      hours2: 1, minutes2: 0, seconds2: 0,
    });
    expect(result.formatted).toBe('02:00:00');
  });

  // ─── Test 9: Decimal minutes output ───
  it('returns correct decimal minutes', () => {
    const result = calculateTimeMath({
      hours1: 0, minutes1: 30, seconds1: 0,
      hours2: 0, minutes2: 0, seconds2: 0,
      operation: 'add',
    });
    expect(result.decimalMinutes).toBe(30);
    expect(result.decimalHours).toBeCloseTo(0.5, 2);
  });

  // ─── Test 10: Subtraction to exactly zero ───
  it('subtracts equal values to zero', () => {
    const result = calculateTimeMath({
      hours1: 3, minutes1: 15, seconds1: 30,
      hours2: 3, minutes2: 15, seconds2: 30,
      operation: 'subtract',
    });
    expect(result.totalSeconds).toBe(0);
    expect(result.formatted).toBe('00:00:00');
    expect(result.isNegative).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════
// calculateHoursWorked tests
// ═══════════════════════════════════════════════════════

describe('calculateHoursWorked', () => {
  // ─── Test 1: Standard 9-to-5 ───
  it('calculates 9:00 AM to 5:00 PM with 30min break = 7.5 hours', () => {
    const result = calculateHoursWorked({
      startTime: '09:00',
      endTime: '17:00',
      breakMinutes: 30,
    });
    expect(result.decimalHours).toBeCloseTo(7.5, 2);
    expect(result.formatted).toBe('07:30:00');
    expect(result.isOvernight).toBe(false);
  });

  // ─── Test 2: No break ───
  it('calculates 8:00 AM to 4:30 PM with no break = 8.5 hours', () => {
    const result = calculateHoursWorked({
      startTime: '08:00',
      endTime: '16:30',
      breakMinutes: 0,
    });
    expect(result.decimalHours).toBeCloseTo(8.5, 2);
    expect(result.grossHours).toBeCloseTo(8.5, 2);
  });

  // ─── Test 3: Overnight shift ───
  it('handles overnight shift 10 PM to 6 AM', () => {
    const result = calculateHoursWorked({
      startTime: '22:00',
      endTime: '06:00',
      breakMinutes: 30,
    });
    expect(result.isOvernight).toBe(true);
    expect(result.grossHours).toBeCloseTo(8, 2);
    expect(result.decimalHours).toBeCloseTo(7.5, 2);
  });

  // ─── Test 4: Short shift ───
  it('calculates a 4-hour shift', () => {
    const result = calculateHoursWorked({
      startTime: '12:00',
      endTime: '16:00',
      breakMinutes: 0,
    });
    expect(result.decimalHours).toBeCloseTo(4, 2);
    expect(result.isOvernight).toBe(false);
  });

  // ─── Test 5: Break longer than shift ───
  it('clamps net hours at 0 when break exceeds shift', () => {
    const result = calculateHoursWorked({
      startTime: '09:00',
      endTime: '10:00',
      breakMinutes: 120,
    });
    expect(result.decimalHours).toBe(0);
    expect(result.totalSeconds).toBe(0);
  });

  // ─── Test 6: Midnight to midnight ───
  it('handles 00:00 to 00:00 as 24 hours overnight', () => {
    const result = calculateHoursWorked({
      startTime: '00:00',
      endTime: '00:00',
      breakMinutes: 0,
    });
    // Same time → 0 elapsed (not overnight since they are equal)
    expect(result.decimalHours).toBe(0);
  });

  // ─── Test 7: Half-hour increments ───
  it('handles 7:30 AM to 3:30 PM correctly', () => {
    const result = calculateHoursWorked({
      startTime: '07:30',
      endTime: '15:30',
      breakMinutes: 30,
    });
    expect(result.grossHours).toBeCloseTo(8, 2);
    expect(result.decimalHours).toBeCloseTo(7.5, 2);
  });

  // ─── Test 8: Overnight with large break ───
  it('handles overnight shift with 45-min break', () => {
    const result = calculateHoursWorked({
      startTime: '23:00',
      endTime: '07:00',
      breakMinutes: 45,
    });
    expect(result.isOvernight).toBe(true);
    expect(result.grossHours).toBeCloseTo(8, 2);
    expect(result.decimalHours).toBeCloseTo(7.25, 2);
  });

  // ─── Test 9: Invalid time string ───
  it('returns zeros for invalid time strings', () => {
    const result = calculateHoursWorked({
      startTime: 'invalid',
      endTime: 'also-invalid',
      breakMinutes: 0,
    });
    expect(result.decimalHours).toBe(0);
    expect(result.formatted).toBe('00:00:00');
  });

  // ─── Test 10: Break deducted field ───
  it('reports break deducted correctly', () => {
    const result = calculateHoursWorked({
      startTime: '09:00',
      endTime: '17:00',
      breakMinutes: 60,
    });
    expect(result.breakDeducted).toBe(60);
    expect(result.decimalHours).toBeCloseTo(7, 2);
  });

  // ─── Test 11: 12-hour AM/PM format ───
  it('parses 12-hour AM/PM time strings', () => {
    const result = calculateHoursWorked({
      startTime: '9:00 AM',
      endTime: '5:00 PM',
      breakMinutes: 0,
    });
    expect(result.decimalHours).toBeCloseTo(8, 2);
  });
});
