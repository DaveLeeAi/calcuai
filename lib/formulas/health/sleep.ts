export interface SleepInput {
  wakeUpTime: string;       // HH:MM format (24-hour or with AM/PM)
  fallAsleepMinutes: number; // minutes to fall asleep, default 15
}

export interface BedtimeOption {
  cycles: number;
  bedtime: string;         // formatted HH:MM AM/PM
  sleepHours: number;      // total sleep hours (not counting fall-asleep time)
  label: string;           // "Minimum", "Recommended", "Optimal"
}

export interface SleepOutput {
  bedtimeOptions: BedtimeOption[];
  recommendedBedtime: string;
  totalSleepHours: number;
  sleepQualityTip: string;
  summary: { label: string; value: string | number }[];
}

/**
 * Sleep Calculator
 *
 * Based on 90-minute sleep cycles (National Sleep Foundation):
 *
 *   Bedtime = Wake Time − (Cycles × 90 min) − Fall-Asleep Time
 *
 * Recommended sleep for adults: 5–6 cycles (7.5–9 hours).
 * Each complete cycle moves through light sleep → deep sleep → REM.
 * Waking at the end of a cycle (rather than mid-cycle) reduces
 * sleep inertia and grogginess.
 *
 * Sources:
 *   National Sleep Foundation sleep cycle research
 *   Walker, M. "Why We Sleep" (2017)
 */
export function calculateSleep(input: SleepInput): SleepOutput {
  const fallAsleepMinutes = input.fallAsleepMinutes != null
    ? Math.max(0, Math.min(120, Number(input.fallAsleepMinutes)))
    : 15;

  // Parse wakeUpTime string to minutes since midnight
  const wakeMinutes = parseTimeToMinutes(String(input.wakeUpTime || '06:30'));

  if (wakeMinutes < 0) {
    // Invalid time — return empty defaults
    return {
      bedtimeOptions: [],
      recommendedBedtime: '--:--',
      totalSleepHours: 0,
      sleepQualityTip: 'Enter a valid wake-up time in HH:MM format.',
      summary: [],
    };
  }

  const cycleMinutes = 90;
  const cycleConfigs: { cycles: number; label: string }[] = [
    { cycles: 4, label: 'Minimum (6 hrs)' },
    { cycles: 5, label: 'Recommended (7.5 hrs)' },
    { cycles: 6, label: 'Optimal (9 hrs)' },
  ];

  const bedtimeOptions: BedtimeOption[] = cycleConfigs.map(({ cycles, label }) => {
    const totalSleepMin = cycles * cycleMinutes;
    let bedtimeMinutes = wakeMinutes - totalSleepMin - fallAsleepMinutes;

    // Wrap past midnight (handle negative values)
    if (bedtimeMinutes < 0) {
      bedtimeMinutes += 1440;
    }

    const sleepHours = Math.round((totalSleepMin / 60) * 100) / 100;

    return {
      cycles,
      bedtime: formatMinutesToTime(bedtimeMinutes),
      sleepHours,
      label,
    };
  });

  // The 5-cycle option is the recommended bedtime
  const recommendedOption = bedtimeOptions[1]; // 5 cycles
  const recommendedBedtime = recommendedOption.bedtime;
  const totalSleepHours = recommendedOption.sleepHours;

  // Generate contextual sleep quality tip
  const sleepQualityTip = totalSleepHours >= 7
    ? 'Aim for 5–6 complete sleep cycles. Avoid screens 30 minutes before bed and keep your bedroom cool (65–68°F) for optimal sleep quality.'
    : 'You may not be getting enough sleep. Adults need 7–9 hours per night. Consider adjusting your schedule to allow at least 5 full sleep cycles.';

  const summary: { label: string; value: string | number }[] = [
    { label: 'Recommended Bedtime', value: recommendedBedtime },
    { label: 'Total Sleep (Recommended)', value: totalSleepHours + ' hrs' },
    { label: 'Sleep Cycles', value: '5 cycles' },
    { label: 'Wake-Up Time', value: formatMinutesToTime(wakeMinutes) },
    { label: 'Time to Fall Asleep', value: fallAsleepMinutes + ' min' },
    { label: 'Cycle Duration', value: '90 min' },
  ];

  return {
    bedtimeOptions,
    recommendedBedtime,
    totalSleepHours,
    sleepQualityTip,
    summary,
  };
}

/**
 * Parse a time string (HH:MM, with optional AM/PM) to minutes since midnight.
 * Returns -1 for invalid input.
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr || typeof timeStr !== 'string') return -1;

  const trimmed = timeStr.trim().toUpperCase();

  // Try HH:MM AM/PM format
  const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = parseInt(ampmMatch[2], 10);
    const period = ampmMatch[3];

    if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) return -1;

    if (period === 'AM' && hours === 12) hours = 0;
    if (period === 'PM' && hours !== 12) hours += 12;

    return hours * 60 + minutes;
  }

  // Try 24-hour HH:MM format
  const h24Match = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (h24Match) {
    const hours = parseInt(h24Match[1], 10);
    const minutes = parseInt(h24Match[2], 10);

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return -1;

    return hours * 60 + minutes;
  }

  return -1;
}

/**
 * Format minutes since midnight to HH:MM AM/PM string.
 */
export function formatMinutesToTime(totalMinutes: number): string {
  // Normalize to 0-1439 range
  let mins = ((totalMinutes % 1440) + 1440) % 1440;

  const hours24 = Math.floor(mins / 60);
  const minutes = Math.round(mins % 60);

  const period = hours24 >= 12 ? 'PM' : 'AM';
  let hours12 = hours24 % 12;
  if (hours12 === 0) hours12 = 12;

  const minuteStr = minutes < 10 ? '0' + minutes : String(minutes);

  return `${hours12}:${minuteStr} ${period}`;
}

// Wrapper for the formula registry
export function calculateSleepFromInputs(inputs: Record<string, unknown>): Record<string, unknown> {
  const result = calculateSleep({
    wakeUpTime: String(inputs.wakeUpTime || '06:30'),
    fallAsleepMinutes: inputs.fallAsleepMinutes != null ? Number(inputs.fallAsleepMinutes) : 15,
  });
  return result as unknown as Record<string, unknown>;
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'sleep': calculateSleepFromInputs,
};
