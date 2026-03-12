import {
  calculateTimezoneConvert,
  findTimezone,
  TIMEZONES,
} from '@/lib/formulas/everyday/timezone';

describe('findTimezone', () => {
  it('finds EST timezone', () => {
    const tz = findTimezone('EST');
    expect(tz).toBeDefined();
    expect(tz!.utcOffsetMinutes).toBe(-300);
    expect(tz!.abbreviation).toBe('EST');
  });

  it('finds IST timezone with half-hour offset', () => {
    const tz = findTimezone('IST');
    expect(tz).toBeDefined();
    expect(tz!.utcOffsetMinutes).toBe(330);
  });

  it('returns undefined for unknown timezone', () => {
    expect(findTimezone('FAKE')).toBeUndefined();
  });

  it('has at least 25 timezones', () => {
    expect(TIMEZONES.length).toBeGreaterThanOrEqual(25);
  });
});

describe('calculateTimezoneConvert', () => {
  // ─── Test 1: EST to PST (same day) ───
  it('converts 9:00 AM EST to 6:00 AM PST', () => {
    const result = calculateTimezoneConvert({
      sourceHour: 9,
      sourceMinute: 0,
      sourceTimezone: 'EST',
      targetTimezone: 'PST',
    });
    expect(result.targetTime24).toBe('06:00');
    expect(result.dayShift).toBe(0);
    expect(result.dayShiftLabel).toBe('Same day');
    expect(result.timeDifferenceHours).toBe(-3);
  });

  // ─── Test 2: PST to EST (same day) ───
  it('converts 9:00 AM PST to 12:00 PM EST', () => {
    const result = calculateTimezoneConvert({
      sourceHour: 9,
      sourceMinute: 0,
      sourceTimezone: 'PST',
      targetTimezone: 'EST',
    });
    expect(result.targetTime24).toBe('12:00');
    expect(result.dayShift).toBe(0);
  });

  // ─── Test 3: EST to JST (next day) ───
  it('converts 3:00 PM EST to 5:00 AM JST next day', () => {
    const result = calculateTimezoneConvert({
      sourceHour: 15,
      sourceMinute: 0,
      sourceTimezone: 'EST',
      targetTimezone: 'JST',
    });
    expect(result.targetTime24).toBe('05:00');
    expect(result.dayShift).toBe(1);
    expect(result.dayShiftLabel).toBe('Next day');
  });

  // ─── Test 4: JST to EST (previous day) ───
  it('converts 2:00 AM JST to 12:00 PM EST previous day', () => {
    const result = calculateTimezoneConvert({
      sourceHour: 2,
      sourceMinute: 0,
      sourceTimezone: 'JST',
      targetTimezone: 'EST',
    });
    expect(result.targetTime24).toBe('12:00');
    expect(result.dayShift).toBe(-1);
    expect(result.dayShiftLabel).toBe('Previous day');
  });

  // ─── Test 5: Half-hour offset (IST) ───
  it('converts 12:00 PM UTC to 5:30 PM IST', () => {
    const result = calculateTimezoneConvert({
      sourceHour: 12,
      sourceMinute: 0,
      sourceTimezone: 'UTC',
      targetTimezone: 'IST',
    });
    expect(result.targetTime24).toBe('17:30');
    expect(result.timeDifferenceHours).toBe(5.5);
    expect(result.dayShift).toBe(0);
  });

  // ─── Test 6: Same timezone (no change) ───
  it('returns same time when source and target are identical', () => {
    const result = calculateTimezoneConvert({
      sourceHour: 14,
      sourceMinute: 30,
      sourceTimezone: 'CST',
      targetTimezone: 'CST',
    });
    expect(result.targetTime24).toBe('14:30');
    expect(result.timeDifferenceHours).toBe(0);
    expect(result.dayShift).toBe(0);
  });

  // ─── Test 7: Midnight boundary crossing forward ───
  it('handles midnight crossing (11 PM EST to PST)', () => {
    const result = calculateTimezoneConvert({
      sourceHour: 23,
      sourceMinute: 0,
      sourceTimezone: 'EST',
      targetTimezone: 'PST',
    });
    expect(result.targetTime24).toBe('20:00');
    expect(result.dayShift).toBe(0);
  });

  // ─── Test 8: Early morning conversion crossing to previous day ───
  it('converts 1:00 AM EST to previous day HST', () => {
    const result = calculateTimezoneConvert({
      sourceHour: 1,
      sourceMinute: 0,
      sourceTimezone: 'EST',
      targetTimezone: 'HST',
    });
    // HST is UTC-10, EST is UTC-5, diff = -5 hours
    expect(result.targetTime24).toBe('20:00');
    expect(result.dayShift).toBe(-1);
    expect(result.dayShiftLabel).toBe('Previous day');
  });

  // ─── Test 9: Unknown timezone returns defaults ───
  it('returns zeroed output for unknown timezone', () => {
    const result = calculateTimezoneConvert({
      sourceHour: 10,
      sourceMinute: 0,
      sourceTimezone: 'FAKE',
      targetTimezone: 'ALSO_FAKE',
    });
    expect(result.sourceTimezone).toBe('Unknown');
    expect(result.targetTimezone).toBe('Unknown');
    expect(result.timeDifferenceHours).toBe(0);
  });

  // ─── Test 10: Minutes preserved ───
  it('preserves minutes during conversion', () => {
    const result = calculateTimezoneConvert({
      sourceHour: 10,
      sourceMinute: 45,
      sourceTimezone: 'EST',
      targetTimezone: 'CET',
    });
    // CET = UTC+1, EST = UTC-5, diff = +6 hours
    expect(result.targetTime24).toBe('16:45');
    expect(result.dayShift).toBe(0);
  });

  // ─── Test 11: Largest offset difference (HST to NZST) ───
  it('handles large offset difference HST to NZST', () => {
    const result = calculateTimezoneConvert({
      sourceHour: 12,
      sourceMinute: 0,
      sourceTimezone: 'HST',
      targetTimezone: 'NZST',
    });
    // HST = UTC-10, NZST = UTC+12, diff = +22 hours
    // 12:00 + 22 hours = 10:00 next day
    expect(result.targetTime24).toBe('10:00');
    expect(result.dayShift).toBe(1);
  });

  // ─── Test 12: Source and target output fields ───
  it('includes source and target metadata in output', () => {
    const result = calculateTimezoneConvert({
      sourceHour: 9,
      sourceMinute: 0,
      sourceTimezone: 'EST',
      targetTimezone: 'GMT',
    });
    expect(result.sourceAbbreviation).toBe('EST');
    expect(result.targetAbbreviation).toBe('GMT');
    expect(result.sourceOffset).toBe('UTC-5:00');
    expect(result.targetOffset).toBe('UTC+0:00');
    expect(result.timeDifferenceFormatted).toContain('5 hours');
  });
});
