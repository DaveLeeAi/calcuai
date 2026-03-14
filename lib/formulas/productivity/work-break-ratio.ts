/**
 * Work-Break Ratio Calculator
 *
 * Formulas:
 *   Work Sessions = Total Available Hours × 60 / (Work Block + Break Length)
 *   Total Work Time = Work Sessions × Work Block Minutes
 *   Total Break Time = Work Sessions × Break Length Minutes
 *   Productivity Index = Work Time / Total Available Time × Cognitive Efficiency Factor
 *
 * Source: Ariga & Lleras — "Brief and rare mental 'breaks' keep you focused," Cognition (2011).
 * Source: DeskTime Productivity Study — "The Secret of the 10% Most Productive People," (2014) — 52-min work / 17-min break ratio.
 * Source: Cirillo, Francesco — "The Pomodoro Technique" (2006) — 25/5 ratio.
 */

export interface WorkBreakRatioInput {
  availableHours: number;
  workBlockMinutes: number;
  breakLengthMinutes: number;
  startTime: string;
}

export interface WorkBreakPreset {
  name: string;
  workMinutes: number;
  breakMinutes: number;
  ratio: string;
  bestFor: string;
}

export interface WorkBreakRatioOutput {
  totalWorkSessions: number;
  totalWorkMinutes: number;
  totalBreakMinutes: number;
  workEfficiencyPercent: number;
  estimatedEndTime: string;
  presetComparisons: WorkBreakPreset[];
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
 * Calculates optimal work sessions and total productive time for a given work-break ratio.
 *
 * Sessions = Available Minutes / (Work Block + Break)
 * Work Efficiency = Work Minutes / Total Available Minutes × 100
 *
 * @param inputs - Record with availableHours, workBlockMinutes, breakLengthMinutes, startTime
 * @returns Record with totalWorkSessions, totalWorkMinutes, workEfficiencyPercent, presetComparisons, summary
 */
export function calculateWorkBreakRatio(inputs: Record<string, unknown>): Record<string, unknown> {
  const availableHours = Math.min(16, Math.max(0.5, Number(inputs.availableHours) || 8));
  const workBlockMinutes = Math.min(180, Math.max(5, Number(inputs.workBlockMinutes) || 52));
  const breakLengthMinutes = Math.min(60, Math.max(1, Number(inputs.breakLengthMinutes) || 17));
  const startTime = String(inputs.startTime || '09:00');

  const availableMinutes = availableHours * 60;
  const cycleLengthMinutes = workBlockMinutes + breakLengthMinutes;
  const totalWorkSessions = Math.floor(availableMinutes / cycleLengthMinutes);
  const totalWorkMinutes = totalWorkSessions * workBlockMinutes;
  const totalBreakMinutes = totalWorkSessions * breakLengthMinutes;
  const remainingMinutes = availableMinutes - (totalWorkSessions * cycleLengthMinutes);

  const workEfficiencyPercent = parseFloat(((totalWorkMinutes / availableMinutes) * 100).toFixed(1));

  const startMinutes = parseTimeToMinutes(startTime);
  const estimatedEndTime = formatTime(startMinutes + availableMinutes);

  // Compare common productivity presets
  const presetComparisons: WorkBreakPreset[] = [
    { name: 'Pomodoro', workMinutes: 25, breakMinutes: 5, ratio: '5:1', bestFor: 'Beginners, creative tasks' },
    { name: 'DeskTime 52/17', workMinutes: 52, breakMinutes: 17, ratio: '3:1', bestFor: 'Deep focus, knowledge work' },
    { name: '90/20 Ultradian', workMinutes: 90, breakMinutes: 20, ratio: '4.5:1', bestFor: 'Complex problem-solving' },
    { name: '50/10', workMinutes: 50, breakMinutes: 10, ratio: '5:1', bestFor: 'Administrative tasks' },
    { name: 'Custom', workMinutes: workBlockMinutes, breakMinutes: breakLengthMinutes, ratio: `${(workBlockMinutes / breakLengthMinutes).toFixed(1)}:1`, bestFor: 'Your preference' },
  ];

  const summary: { label: string; value: number | string }[] = [
    { label: 'Work Sessions', value: totalWorkSessions },
    { label: 'Total Work Time (min)', value: totalWorkMinutes },
    { label: 'Total Break Time (min)', value: totalBreakMinutes },
    { label: 'Work Efficiency (%)', value: workEfficiencyPercent },
    { label: 'Estimated End Time', value: estimatedEndTime },
    { label: 'Remaining Minutes', value: remainingMinutes },
  ];

  return { totalWorkSessions, totalWorkMinutes, totalBreakMinutes, workEfficiencyPercent, estimatedEndTime, presetComparisons, summary };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'work-break-ratio': calculateWorkBreakRatio,
};
