/**
 * Sleep Cycle Calculator
 *
 * Formulas:
 *   Sleep Cycles = Total Sleep Duration / 90 minutes
 *   Optimal Bedtimes = Wake Time − (N × 90 min) − Sleep Onset Time
 *   Optimal Wake Times = Bedtime + Sleep Onset + (N × 90 min)
 *   Sleep Quality Window = 5–6 complete cycles (7.5–9 hours)
 *
 * Source: Walker, Matthew — "Why We Sleep," Penguin Press (2017).
 * Source: National Sleep Foundation — Sleep Duration Recommendations by Age (2015).
 * Source: Rechtschaffen & Kales — "A Manual of Standardized Terminology for Sleep Stages" (1968).
 */

export interface SleepCycleInput {
  targetWakeTime: string;
  sleepOnsetMinutes: number;
  mode: string;
}

export interface SleepOption {
  bedtime: string;
  cycles: number;
  totalSleepHours: number;
  quality: string;
}

export interface SleepCycleOutput {
  recommendedBedtimes: SleepOption[];
  optimalBedtime: string;
  optimalCycles: number;
  optimalSleepHours: number;
  summary: { label: string; value: number | string }[];
}

function formatTime(totalMinutes: number): string {
  // Normalize to 0–1439 minute range (24-hour day)
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  const period = hours < 12 ? 'AM' : 'PM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
}

function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 7 * 60; // default 7:00 AM
  const parts = timeStr.split(':');
  return (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0);
}

/**
 * Calculates optimal bedtimes to wake up at the end of a complete sleep cycle.
 *
 * Bedtime = Wake Time − Sleep Onset − (N × 90 minutes)
 * Each 90-minute cycle includes N1, N2, N3, and REM sleep stages.
 *
 * @param inputs - Record with targetWakeTime, sleepOnsetMinutes, mode
 * @returns Record with recommendedBedtimes, optimalBedtime, optimalCycles, summary
 */
export function calculateSleepCycle(inputs: Record<string, unknown>): Record<string, unknown> {
  const targetWakeTime = String(inputs.targetWakeTime || '07:00');
  const sleepOnsetMinutes = inputs.sleepOnsetMinutes !== undefined
    ? Math.min(60, Math.max(0, Number(inputs.sleepOnsetMinutes)))
    : 14;

  const wakeMinutes = parseTimeToMinutes(targetWakeTime);

  // Calculate bedtimes for 4, 5, 6, 7, and 8 cycles
  const recommendedBedtimes: SleepOption[] = [];

  for (let cycles = 8; cycles >= 4; cycles--) {
    const totalSleepMinutes = cycles * 90;
    const bedtimeMinutes = wakeMinutes - totalSleepMinutes - sleepOnsetMinutes;
    const totalSleepHours = parseFloat((totalSleepMinutes / 60).toFixed(1));

    let quality = 'Poor';
    if (cycles === 5 || cycles === 6) quality = 'Optimal';
    else if (cycles === 4) quality = 'Minimal (sleep debt likely)';
    else if (cycles === 7 || cycles === 8) quality = 'Extended';

    recommendedBedtimes.push({
      bedtime: formatTime(bedtimeMinutes),
      cycles,
      totalSleepHours,
      quality,
    });
  }

  // Optimal is 5 or 6 cycles (7.5 or 9 hours)
  const optimal = recommendedBedtimes.find(o => o.cycles === 6) ?? recommendedBedtimes[0];

  const summary: { label: string; value: number | string }[] = [
    { label: 'Wake Time', value: formatTime(wakeMinutes) },
    { label: 'Sleep Onset (min)', value: sleepOnsetMinutes },
    { label: 'Optimal Bedtime', value: optimal.bedtime },
    { label: 'Optimal Cycles', value: optimal.cycles },
    { label: 'Optimal Sleep Hours', value: optimal.totalSleepHours },
  ];

  return {
    recommendedBedtimes,
    optimalBedtime: optimal.bedtime,
    optimalCycles: optimal.cycles,
    optimalSleepHours: optimal.totalSleepHours,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'sleep-cycle': calculateSleepCycle,
};
