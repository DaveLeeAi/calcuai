/**
 * Pomodoro Calculator
 *
 * Formulas:
 *   Work Sessions = Total Work Minutes / Pomodoro Length
 *   Short Breaks = Work Sessions − 1 (between sessions, before long break)
 *   Long Breaks = floor(Work Sessions / Sessions Before Long Break)
 *   Total Time = Work Minutes + (Short Breaks × Short Break Length) + (Long Breaks × Long Break Length)
 *   Completion Time = Start Time + Total Time
 *
 * Source: Cirillo, Francesco — "The Pomodoro Technique" (2006).
 * Source: Desktime Productivity Study — Optimal Work-Break Ratio (2014).
 */

export interface PomodoroInput {
  totalWorkHours: number;
  pomodoroMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
  startTime: string;
}

export interface PomodoroSessionRow {
  block: number;
  type: string;
  duration: number;
  startTime: string;
  endTime: string;
}

export interface PomodoroOutput {
  totalPomodoros: number;
  totalShortBreaks: number;
  totalLongBreaks: number;
  totalTimeMinutes: number;
  totalTimeHours: number;
  estimatedEndTime: string;
  sessionSchedule: PomodoroSessionRow[];
  summary: { label: string; value: number | string }[];
}

function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 9 * 60;
  const parts = timeStr.split(':');
  return (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0);
}

function formatTime(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  const period = hours < 12 ? 'AM' : 'PM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
}

/**
 * Calculates Pomodoro session schedule for a given amount of work.
 *
 * Total Pomodoros = ceil(Work Minutes / Pomodoro Length)
 * Total Time = Work + Short Breaks + Long Breaks
 *
 * @param inputs - Record with totalWorkHours, pomodoroMinutes, shortBreakMinutes, longBreakMinutes, sessionsBeforeLongBreak, startTime
 * @returns Record with totalPomodoros, breaks, totalTimeHours, estimatedEndTime, sessionSchedule, summary
 */
export function calculatePomodoro(inputs: Record<string, unknown>): Record<string, unknown> {
  const totalWorkHours = Math.min(16, Math.max(0.25, Number(inputs.totalWorkHours) || 4));
  const pomodoroMinutes = Math.min(90, Math.max(5, Number(inputs.pomodoroMinutes) || 25));
  const shortBreakMinutes = Math.min(30, Math.max(1, Number(inputs.shortBreakMinutes) || 5));
  const longBreakMinutes = Math.min(60, Math.max(5, Number(inputs.longBreakMinutes) || 15));
  const sessionsBeforeLongBreak = Math.min(8, Math.max(2, Number(inputs.sessionsBeforeLongBreak) || 4));
  const startTime = String(inputs.startTime || '09:00');

  const totalWorkMinutes = totalWorkHours * 60;
  const totalPomodoros = Math.ceil(totalWorkMinutes / pomodoroMinutes);
  const totalLongBreaks = Math.floor(totalPomodoros / sessionsBeforeLongBreak);
  const totalShortBreaks = totalPomodoros - 1 - totalLongBreaks;

  const totalBreakMinutes = (Math.max(0, totalShortBreaks) * shortBreakMinutes) + (totalLongBreaks * longBreakMinutes);
  const totalTimeMinutes = Math.round(totalWorkMinutes + totalBreakMinutes);
  const totalTimeHours = parseFloat((totalTimeMinutes / 60).toFixed(1));

  const startMinutes = parseTimeToMinutes(startTime);
  const estimatedEndTime = formatTime(startMinutes + totalTimeMinutes);

  // Build session schedule (cap at 30 rows for display)
  const sessionSchedule: PomodoroSessionRow[] = [];
  let currentMinute = startMinutes;
  let pomodoroCount = 0;

  for (let i = 0; i < Math.min(totalPomodoros, 30); i++) {
    pomodoroCount++;
    const sessionStart = formatTime(currentMinute);
    currentMinute += pomodoroMinutes;
    const sessionEnd = formatTime(currentMinute);

    sessionSchedule.push({
      block: pomodoroCount,
      type: `Pomodoro ${pomodoroCount}`,
      duration: pomodoroMinutes,
      startTime: sessionStart,
      endTime: sessionEnd,
    });

    if (i < totalPomodoros - 1) {
      const isLongBreak = pomodoroCount % sessionsBeforeLongBreak === 0;
      const breakDuration = isLongBreak ? longBreakMinutes : shortBreakMinutes;
      const breakStart = formatTime(currentMinute);
      currentMinute += breakDuration;
      const breakEnd = formatTime(currentMinute);
      sessionSchedule.push({
        block: pomodoroCount,
        type: isLongBreak ? 'Long Break' : 'Short Break',
        duration: breakDuration,
        startTime: breakStart,
        endTime: breakEnd,
      });
    }
  }

  const summary: { label: string; value: number | string }[] = [
    { label: 'Total Pomodoros', value: totalPomodoros },
    { label: 'Short Breaks', value: Math.max(0, totalShortBreaks) },
    { label: 'Long Breaks', value: totalLongBreaks },
    { label: 'Total Time (Hours)', value: totalTimeHours },
    { label: 'Estimated End Time', value: estimatedEndTime },
    { label: 'Work Hours', value: totalWorkHours },
  ];

  return { totalPomodoros, totalShortBreaks: Math.max(0, totalShortBreaks), totalLongBreaks, totalTimeMinutes, totalTimeHours, estimatedEndTime, sessionSchedule, summary };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'pomodoro': calculatePomodoro,
};
