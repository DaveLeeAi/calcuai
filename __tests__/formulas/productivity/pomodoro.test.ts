import { calculatePomodoro } from '@/lib/formulas/productivity/pomodoro';

describe('calculatePomodoro', () => {
  it('calculates correct number of pomodoros for 4 hours at 25 min', () => {
    const result = calculatePomodoro({ totalWorkHours: 4, pomodoroMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15, sessionsBeforeLongBreak: 4, startTime: '09:00' });
    // 4 hours = 240 minutes / 25 min = ceil(9.6) = 10 pomodoros
    expect(Number(result.totalPomodoros)).toBe(10);
  });

  it('calculates long breaks correctly', () => {
    const result = calculatePomodoro({ totalWorkHours: 4, pomodoroMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15, sessionsBeforeLongBreak: 4, startTime: '09:00' });
    // 10 pomodoros / 4 per long break = 2 long breaks
    expect(Number(result.totalLongBreaks)).toBe(2);
  });

  it('total time includes work + breaks', () => {
    const result = calculatePomodoro({ totalWorkHours: 2, pomodoroMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15, sessionsBeforeLongBreak: 4, startTime: '09:00' });
    expect(Number(result.totalTimeMinutes)).toBeGreaterThan(120); // more than pure work time due to breaks
  });

  it('work efficiency is less than 100%', () => {
    // Note: this formula calculates session schedule, efficiency isn't an output - totalTimeHours > totalWorkHours
    const result = calculatePomodoro({ totalWorkHours: 4, pomodoroMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15, sessionsBeforeLongBreak: 4, startTime: '09:00' });
    expect(Number(result.totalTimeHours)).toBeGreaterThan(4); // includes breaks
  });

  it('returns estimated end time as a string', () => {
    const result = calculatePomodoro({ totalWorkHours: 4, pomodoroMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15, sessionsBeforeLongBreak: 4, startTime: '09:00' });
    expect(typeof result.estimatedEndTime).toBe('string');
    expect((result.estimatedEndTime as string).length).toBeGreaterThan(0);
  });

  it('returns session schedule array', () => {
    const result = calculatePomodoro({ totalWorkHours: 2, pomodoroMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15, sessionsBeforeLongBreak: 4, startTime: '09:00' });
    const schedule = result.sessionSchedule as unknown[];
    expect(Array.isArray(schedule)).toBe(true);
    expect(schedule.length).toBeGreaterThan(0);
  });

  it('session schedule includes both pomodoros and breaks', () => {
    const result = calculatePomodoro({ totalWorkHours: 2, pomodoroMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15, sessionsBeforeLongBreak: 4, startTime: '09:00' });
    const schedule = result.sessionSchedule as { type: string }[];
    const hasPomodoro = schedule.some(s => s.type.includes('Pomodoro'));
    const hasBreak = schedule.some(s => s.type.includes('Break'));
    expect(hasPomodoro).toBe(true);
    expect(hasBreak).toBe(true);
  });

  it('handles 52/17 DeskTime configuration', () => {
    const result = calculatePomodoro({ totalWorkHours: 8, pomodoroMinutes: 52, shortBreakMinutes: 17, longBreakMinutes: 30, sessionsBeforeLongBreak: 3, startTime: '09:00' });
    expect(Number(result.totalPomodoros)).toBe(Math.ceil(480 / 52));
  });

  it('handles 90-min ultradian rhythm configuration', () => {
    const result = calculatePomodoro({ totalWorkHours: 9, pomodoroMinutes: 90, shortBreakMinutes: 20, longBreakMinutes: 30, sessionsBeforeLongBreak: 3, startTime: '09:00' });
    expect(Number(result.totalPomodoros)).toBe(6); // 9 hours = 540 min / 90 = 6
  });

  it('returns summary with 6 items', () => {
    const result = calculatePomodoro({ totalWorkHours: 4, pomodoroMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15, sessionsBeforeLongBreak: 4, startTime: '09:00' });
    expect(Array.isArray(result.summary)).toBe(true);
    expect((result.summary as unknown[]).length).toBe(6);
  });

  it('handles missing inputs gracefully', () => {
    const result = calculatePomodoro({});
    expect(typeof result.totalPomodoros).toBe('number');
  });
});
