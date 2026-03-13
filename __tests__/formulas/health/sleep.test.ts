import { calculateSleep, parseTimeToMinutes, formatMinutesToTime, calculateSleepFromInputs } from '@/lib/formulas/health/sleep';

describe('calculateSleep', () => {
  // ─── Test 1: Basic 6:30 AM wake-up with default fall-asleep time ───
  it('calculates correct bedtimes for 6:30 AM wake-up, 15 min fall-asleep', () => {
    const result = calculateSleep({ wakeUpTime: '06:30', fallAsleepMinutes: 15 });
    expect(result.bedtimeOptions).toHaveLength(3);
    // 4 cycles: 6:30 AM − (4 × 90) − 15 = 6:30 − 375 min = 12:15 AM
    expect(result.bedtimeOptions[0].cycles).toBe(4);
    expect(result.bedtimeOptions[0].bedtime).toBe('12:15 AM');
    expect(result.bedtimeOptions[0].sleepHours).toBe(6);
  });

  // ─── Test 2: 5-cycle recommended bedtime ───
  it('returns 5-cycle option as recommended bedtime', () => {
    const result = calculateSleep({ wakeUpTime: '06:30', fallAsleepMinutes: 15 });
    // 5 cycles: 6:30 − (5 × 90) − 15 = 6:30 − 465 = 10:45 PM
    expect(result.recommendedBedtime).toBe('10:45 PM');
    expect(result.totalSleepHours).toBe(7.5);
  });

  // ─── Test 3: 6-cycle optimal bedtime ───
  it('calculates 6-cycle optimal bedtime correctly', () => {
    const result = calculateSleep({ wakeUpTime: '06:30', fallAsleepMinutes: 15 });
    // 6 cycles: 6:30 − (6 × 90) − 15 = 6:30 − 555 = 9:15 PM
    expect(result.bedtimeOptions[2].cycles).toBe(6);
    expect(result.bedtimeOptions[2].bedtime).toBe('9:15 PM');
    expect(result.bedtimeOptions[2].sleepHours).toBe(9);
  });

  // ─── Test 4: Midnight wrapping — early wake-up ───
  it('handles midnight wrapping for very early wake-up (5:00 AM)', () => {
    const result = calculateSleep({ wakeUpTime: '05:00', fallAsleepMinutes: 15 });
    // 5 cycles: 5:00 − 465 = −165 min → 1440 − 165 = 1275 min = 9:15 PM
    expect(result.recommendedBedtime).toBe('9:15 PM');
  });

  // ─── Test 5: Late wake-up time (10:00 AM) ───
  it('calculates for late wake-up (10:00 AM)', () => {
    const result = calculateSleep({ wakeUpTime: '10:00', fallAsleepMinutes: 15 });
    // 5 cycles: 10:00 − 465 = 135 min = 2:15 AM
    expect(result.recommendedBedtime).toBe('2:15 AM');
  });

  // ─── Test 6: Zero fall-asleep time ───
  it('handles zero fall-asleep time', () => {
    const result = calculateSleep({ wakeUpTime: '06:30', fallAsleepMinutes: 0 });
    // 5 cycles: 6:30 − 450 − 0 = 390 − 450 = −60 → 1380 = 11:00 PM
    expect(result.recommendedBedtime).toBe('11:00 PM');
  });

  // ─── Test 7: Large fall-asleep time (60 minutes) ───
  it('handles 60-minute fall-asleep time', () => {
    const result = calculateSleep({ wakeUpTime: '06:30', fallAsleepMinutes: 60 });
    // 5 cycles: 6:30 − 450 − 60 = 390 − 510 = −120 → 1320 = 10:00 PM
    expect(result.recommendedBedtime).toBe('10:00 PM');
  });

  // ─── Test 8: AM/PM format input ───
  it('parses AM/PM time format correctly', () => {
    const result = calculateSleep({ wakeUpTime: '6:30 AM', fallAsleepMinutes: 15 });
    expect(result.recommendedBedtime).toBe('10:45 PM');
  });

  // ─── Test 9: PM wake-up time (night shift) ───
  it('handles PM wake-up time for night shift (6:30 PM)', () => {
    const result = calculateSleep({ wakeUpTime: '18:30', fallAsleepMinutes: 15 });
    // 5 cycles: 18:30 − 465 = 1110 − 465 = 645 min = 10:45 AM
    expect(result.recommendedBedtime).toBe('10:45 AM');
  });

  // ─── Test 10: Midnight wake-up (00:00) ───
  it('handles midnight wake-up (00:00)', () => {
    const result = calculateSleep({ wakeUpTime: '00:00', fallAsleepMinutes: 15 });
    // 5 cycles: 0 − 465 = −465 → 1440 − 465 = 975 min = 4:15 PM
    expect(result.recommendedBedtime).toBe('4:15 PM');
  });

  // ─── Test 11: Noon wake-up (12:00) ───
  it('handles noon wake-up (12:00)', () => {
    const result = calculateSleep({ wakeUpTime: '12:00', fallAsleepMinutes: 15 });
    // 5 cycles: 720 − 465 = 255 min = 4:15 AM
    expect(result.recommendedBedtime).toBe('4:15 AM');
  });

  // ─── Test 12: All bedtime options have correct labels ───
  it('assigns correct labels to bedtime options', () => {
    const result = calculateSleep({ wakeUpTime: '07:00', fallAsleepMinutes: 15 });
    expect(result.bedtimeOptions[0].label).toBe('Minimum (6 hrs)');
    expect(result.bedtimeOptions[1].label).toBe('Recommended (7.5 hrs)');
    expect(result.bedtimeOptions[2].label).toBe('Optimal (9 hrs)');
  });

  // ─── Test 13: Sleep hours for each cycle count ───
  it('returns correct sleep hours per option', () => {
    const result = calculateSleep({ wakeUpTime: '07:00', fallAsleepMinutes: 15 });
    expect(result.bedtimeOptions[0].sleepHours).toBe(6);    // 4 × 90 / 60
    expect(result.bedtimeOptions[1].sleepHours).toBe(7.5);  // 5 × 90 / 60
    expect(result.bedtimeOptions[2].sleepHours).toBe(9);    // 6 × 90 / 60
  });

  // ─── Test 14: Summary output has correct structure ───
  it('returns summary with 6 items and correct labels', () => {
    const result = calculateSleep({ wakeUpTime: '06:30', fallAsleepMinutes: 15 });
    expect(result.summary).toHaveLength(6);
    expect(result.summary[0].label).toBe('Recommended Bedtime');
    expect(result.summary[1].label).toBe('Total Sleep (Recommended)');
    expect(result.summary[2].label).toBe('Sleep Cycles');
    expect(result.summary[3].label).toBe('Wake-Up Time');
    expect(result.summary[4].label).toBe('Time to Fall Asleep');
    expect(result.summary[5].label).toBe('Cycle Duration');
  });

  // ─── Test 15: Sleep quality tip for adequate sleep ───
  it('returns positive sleep tip for 7.5 hours of sleep', () => {
    const result = calculateSleep({ wakeUpTime: '06:30', fallAsleepMinutes: 15 });
    expect(result.sleepQualityTip).toContain('Aim for 5');
  });

  // ─── Test 16: Invalid time string ───
  it('returns empty defaults for invalid time string', () => {
    const result = calculateSleep({ wakeUpTime: 'not-a-time', fallAsleepMinutes: 15 });
    expect(result.bedtimeOptions).toHaveLength(0);
    expect(result.recommendedBedtime).toBe('--:--');
    expect(result.totalSleepHours).toBe(0);
    expect(result.summary).toHaveLength(0);
  });

  // ─── Test 17: Empty time string defaults to 06:30 via wrapper ───
  it('handles empty time string via wrapper (defaults to 06:30)', () => {
    const result = calculateSleepFromInputs({ wakeUpTime: '', fallAsleepMinutes: 15 });
    // Wrapper converts '' to default '06:30'
    expect((result as { recommendedBedtime: string }).recommendedBedtime).toBe('10:45 PM');
  });

  // ─── Test 18: Negative fall-asleep time clamped to 0 ───
  it('clamps negative fall-asleep minutes to 0', () => {
    const result = calculateSleep({ wakeUpTime: '06:30', fallAsleepMinutes: -10 });
    // Should clamp to 0: 5 cycles: 6:30 − 450 − 0 = 11:00 PM
    expect(result.recommendedBedtime).toBe('11:00 PM');
  });

  // ─── Test 19: Excessive fall-asleep time clamped to 120 ───
  it('clamps excessive fall-asleep minutes to 120', () => {
    const result = calculateSleep({ wakeUpTime: '06:30', fallAsleepMinutes: 200 });
    // Should clamp to 120: 5 cycles: 6:30 − 450 − 120 = 390 − 570 = −180 → 1260 = 9:00 PM
    expect(result.recommendedBedtime).toBe('9:00 PM');
  });

  // ─── Test 20: String coercion for fall-asleep minutes ───
  it('handles string coercion for fallAsleepMinutes', () => {
    const result = calculateSleepFromInputs({ wakeUpTime: '06:30', fallAsleepMinutes: '15' });
    expect((result as { recommendedBedtime: string }).recommendedBedtime).toBe('10:45 PM');
  });

  // ─── Test 21: Registry wrapper with defaults ───
  it('registry wrapper uses default values for missing inputs', () => {
    const result = calculateSleepFromInputs({});
    // Default wakeUpTime = 06:30, fallAsleepMinutes = 15
    expect((result as { recommendedBedtime: string }).recommendedBedtime).toBe('10:45 PM');
    expect((result as { totalSleepHours: number }).totalSleepHours).toBe(7.5);
  });

  // ─── Test 22: 12:00 AM PM format ───
  it('parses 12:00 AM correctly as midnight', () => {
    const result = calculateSleep({ wakeUpTime: '12:00 AM', fallAsleepMinutes: 15 });
    // 12 AM = 0 minutes
    // 5 cycles: 0 − 465 = −465 → 975 min = 4:15 PM
    expect(result.recommendedBedtime).toBe('4:15 PM');
  });

  // ─── Test 23: 12:00 PM format ───
  it('parses 12:00 PM correctly as noon', () => {
    const result = calculateSleep({ wakeUpTime: '12:00 PM', fallAsleepMinutes: 15 });
    // 12 PM = 720 minutes
    // 5 cycles: 720 − 465 = 255 min = 4:15 AM
    expect(result.recommendedBedtime).toBe('4:15 AM');
  });
});

describe('parseTimeToMinutes', () => {
  // ─── Test 24: Basic 24-hour format ───
  it('parses 06:30 as 390 minutes', () => {
    expect(parseTimeToMinutes('06:30')).toBe(390);
  });

  // ─── Test 25: Midnight ───
  it('parses 00:00 as 0 minutes', () => {
    expect(parseTimeToMinutes('00:00')).toBe(0);
  });

  // ─── Test 26: End of day ───
  it('parses 23:59 as 1439 minutes', () => {
    expect(parseTimeToMinutes('23:59')).toBe(1439);
  });

  // ─── Test 27: AM/PM format ───
  it('parses 6:30 AM as 390 minutes', () => {
    expect(parseTimeToMinutes('6:30 AM')).toBe(390);
  });

  // ─── Test 28: Invalid string ───
  it('returns -1 for invalid string', () => {
    expect(parseTimeToMinutes('abc')).toBe(-1);
  });

  // ─── Test 29: Invalid hours ───
  it('returns -1 for hours > 23 in 24h format', () => {
    expect(parseTimeToMinutes('25:00')).toBe(-1);
  });
});

describe('formatMinutesToTime', () => {
  // ─── Test 30: Standard morning ───
  it('formats 390 minutes as 6:30 AM', () => {
    expect(formatMinutesToTime(390)).toBe('6:30 AM');
  });

  // ─── Test 31: Midnight ───
  it('formats 0 minutes as 12:00 AM', () => {
    expect(formatMinutesToTime(0)).toBe('12:00 AM');
  });

  // ─── Test 32: Noon ───
  it('formats 720 minutes as 12:00 PM', () => {
    expect(formatMinutesToTime(720)).toBe('12:00 PM');
  });

  // ─── Test 33: Negative wrapping ───
  it('wraps negative minutes correctly', () => {
    // -60 → 1380 → 11:00 PM
    expect(formatMinutesToTime(-60)).toBe('11:00 PM');
  });
});
