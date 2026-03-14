import { calculateWorkBreakRatio } from '@/lib/formulas/productivity/work-break-ratio';

describe('calculateWorkBreakRatio', () => {
  it('calculates total work sessions for 8-hour day with 52/17 rhythm', () => {
    const result = calculateWorkBreakRatio({ availableHours: 8, workBlockMinutes: 52, breakLengthMinutes: 17, startTime: '09:00' });
    // 480 min / (52 + 17) = 6.95 → floor = 6 sessions
    expect(Number(result.totalWorkSessions)).toBe(6);
  });

  it('calculates total work minutes correctly', () => {
    const result = calculateWorkBreakRatio({ availableHours: 8, workBlockMinutes: 52, breakLengthMinutes: 17, startTime: '09:00' });
    expect(Number(result.totalWorkMinutes)).toBe(6 * 52);
  });

  it('calculates total break minutes correctly', () => {
    const result = calculateWorkBreakRatio({ availableHours: 8, workBlockMinutes: 52, breakLengthMinutes: 17, startTime: '09:00' });
    expect(Number(result.totalBreakMinutes)).toBe(6 * 17);
  });

  it('work efficiency is between 0 and 100', () => {
    const result = calculateWorkBreakRatio({ availableHours: 8, workBlockMinutes: 52, breakLengthMinutes: 17, startTime: '09:00' });
    expect(Number(result.workEfficiencyPercent)).toBeGreaterThan(0);
    expect(Number(result.workEfficiencyPercent)).toBeLessThanOrEqual(100);
  });

  it('work efficiency = total work minutes / available minutes × 100', () => {
    const result = calculateWorkBreakRatio({ availableHours: 8, workBlockMinutes: 52, breakLengthMinutes: 17, startTime: '09:00' });
    // 6 sessions × 52 min = 312 work min / 480 available min = 65%
    const expectedEff = (6 * 52 / 480) * 100;
    expect(Number(result.workEfficiencyPercent)).toBeCloseTo(expectedEff, 0);
  });

  it('returns estimated end time as AM/PM string', () => {
    const result = calculateWorkBreakRatio({ availableHours: 8, workBlockMinutes: 52, breakLengthMinutes: 17, startTime: '09:00' });
    expect(typeof result.estimatedEndTime).toBe('string');
    expect((result.estimatedEndTime as string).length).toBeGreaterThan(0);
  });

  it('returns preset comparisons array with 5 entries', () => {
    const result = calculateWorkBreakRatio({ availableHours: 8, workBlockMinutes: 52, breakLengthMinutes: 17, startTime: '09:00' });
    const presets = result.presetComparisons as unknown[];
    expect(Array.isArray(presets)).toBe(true);
    expect(presets.length).toBe(5);
  });

  it('Pomodoro 25/5 gives more sessions than 52/17 in same time', () => {
    const pomodoro = calculateWorkBreakRatio({ availableHours: 8, workBlockMinutes: 25, breakLengthMinutes: 5, startTime: '09:00' });
    const desktime = calculateWorkBreakRatio({ availableHours: 8, workBlockMinutes: 52, breakLengthMinutes: 17, startTime: '09:00' });
    expect(Number(pomodoro.totalWorkSessions)).toBeGreaterThan(Number(desktime.totalWorkSessions));
  });

  it('longer break = fewer sessions', () => {
    const shortBreak = calculateWorkBreakRatio({ availableHours: 8, workBlockMinutes: 50, breakLengthMinutes: 5, startTime: '09:00' });
    const longBreak = calculateWorkBreakRatio({ availableHours: 8, workBlockMinutes: 50, breakLengthMinutes: 30, startTime: '09:00' });
    expect(Number(shortBreak.totalWorkSessions)).toBeGreaterThan(Number(longBreak.totalWorkSessions));
  });

  it('returns summary array with 6 items', () => {
    const result = calculateWorkBreakRatio({ availableHours: 8, workBlockMinutes: 52, breakLengthMinutes: 17, startTime: '09:00' });
    expect(Array.isArray(result.summary)).toBe(true);
    expect((result.summary as unknown[]).length).toBe(6);
  });

  it('handles missing inputs gracefully', () => {
    const result = calculateWorkBreakRatio({});
    expect(typeof result.totalWorkSessions).toBe('number');
    expect(typeof result.workEfficiencyPercent).toBe('number');
  });
});
