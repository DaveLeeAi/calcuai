export interface OvulationInput {
  lastPeriodDate: string;   // ISO date string (YYYY-MM-DD)
  cycleLength?: number;     // days, default 28
  cyclesToShow?: number;    // 1, 3, or 6
}

export interface CycleCalendarRow {
  cycle: number;
  periodStart: string;
  fertileStart: string;
  ovulation: string;
  fertileEnd: string;
  nextPeriod: string;
}

export interface OvulationOutput {
  ovulationDate: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  nextPeriodDate: string;
  summary: { label: string; value: string | number }[];
  cycleCalendar: CycleCalendarRow[];
}

/**
 * Ovulation Calculator
 *
 * Ovulation occurs approximately 14 days BEFORE the next period
 * (the luteal phase is relatively constant at ~14 days).
 *
 *   Ovulation Day = Cycle Length - 14
 *   Ovulation Date = LMP + (Cycle Length - 14)
 *
 * Fertile window: 5 days before ovulation through 1 day after
 * (sperm survive up to 5 days; egg viable for 12-24 hours)
 *
 *   Fertile Window = [Ovulation - 5 days, Ovulation + 1 day]
 *
 * Next period: LMP + Cycle Length
 *
 * Source: American College of Obstetricians and Gynecologists (ACOG).
 */
export function calculateOvulation(input: OvulationInput): OvulationOutput {
  const cycleLength = input.cycleLength ?? 28;
  const cyclesToShow = input.cyclesToShow ?? 3;

  if (!input.lastPeriodDate) {
    return {
      ovulationDate: '',
      fertileWindowStart: '',
      fertileWindowEnd: '',
      nextPeriodDate: '',
      summary: [],
      cycleCalendar: [],
    };
  }

  const lmpDate = parseDate(input.lastPeriodDate);
  if (isNaN(lmpDate.getTime())) {
    return {
      ovulationDate: '',
      fertileWindowStart: '',
      fertileWindowEnd: '',
      nextPeriodDate: '',
      summary: [],
      cycleCalendar: [],
    };
  }

  // Ovulation day of cycle (luteal phase is ~14 days)
  const lutealPhase = 14;
  const ovulationDayOfCycle = cycleLength - lutealPhase;

  // Current/next cycle calculations
  const ovulationDate = addDays(lmpDate, ovulationDayOfCycle);
  const fertileWindowStart = addDays(ovulationDate, -5);
  const fertileWindowEnd = addDays(ovulationDate, 1);
  const nextPeriodDate = addDays(lmpDate, cycleLength);

  // Build cycle calendar for multiple cycles
  const cycleCalendar: CycleCalendarRow[] = [];
  for (let i = 0; i < cyclesToShow; i++) {
    const cycleStart = addDays(lmpDate, cycleLength * i);
    const cycleOvulation = addDays(cycleStart, ovulationDayOfCycle);
    const cycleFertileStart = addDays(cycleOvulation, -5);
    const cycleFertileEnd = addDays(cycleOvulation, 1);
    const cycleNextPeriod = addDays(cycleStart, cycleLength);

    cycleCalendar.push({
      cycle: i + 1,
      periodStart: toDateString(cycleStart),
      fertileStart: toDateString(cycleFertileStart),
      ovulation: toDateString(cycleOvulation),
      fertileEnd: toDateString(cycleFertileEnd),
      nextPeriod: toDateString(cycleNextPeriod),
    });
  }

  const summary: { label: string; value: string | number }[] = [
    { label: 'Last Period', value: formatDateUTC(lmpDate) },
    { label: 'Cycle Length', value: cycleLength + ' days' },
    { label: 'Ovulation Day of Cycle', value: 'Day ' + ovulationDayOfCycle },
    { label: 'Next Ovulation', value: formatDateUTC(ovulationDate) },
    { label: 'Fertile Window', value: formatDateUTC(fertileWindowStart) + ' \u2013 ' + formatDateUTC(fertileWindowEnd) },
    { label: 'Fertile Window Duration', value: '7 days' },
    { label: 'Next Period Expected', value: formatDateUTC(nextPeriodDate) },
  ];

  return {
    ovulationDate: toDateString(ovulationDate),
    fertileWindowStart: toDateString(fertileWindowStart),
    fertileWindowEnd: toDateString(fertileWindowEnd),
    nextPeriodDate: toDateString(nextPeriodDate),
    summary,
    cycleCalendar,
  };
}

/**
 * Parse an ISO date string (YYYY-MM-DD) into a Date at UTC midnight.
 * This avoids timezone issues that occur with `new Date('YYYY-MM-DD')` in some environments.
 */
function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/** Add N days to a Date object, returning a new Date */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

/** Format a Date as YYYY-MM-DD using UTC values */
function toDateString(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Format a Date as "Month Day, Year" using UTC values */
function formatDateUTC(date: Date): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

// Wrapper for the formula registry
export function calculateOvulationFromInputs(inputs: Record<string, unknown>): Record<string, unknown> {
  const result = calculateOvulation({
    lastPeriodDate: inputs.lastPeriodDate as string,
    cycleLength: inputs.cycleLength ? Number(inputs.cycleLength) : undefined,
    cyclesToShow: inputs.cyclesToShow ? Number(inputs.cyclesToShow) : undefined,
  });
  return result as unknown as Record<string, unknown>;
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'ovulation': calculateOvulationFromInputs,
};
