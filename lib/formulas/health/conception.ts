export interface ConceptionInput {
  calculationMethod: 'fromDueDate' | 'fromLMP';
  dueDate?: string; // ISO date string, used when method = fromDueDate
  lastMenstrualPeriod?: string; // ISO date string, used when method = fromLMP
  cycleLength?: number; // days, default 28
}

export interface TimelineEvent {
  event: string;
  date: string;
  dateFormatted: string;
  description: string;
}

export interface ConceptionOutput {
  conceptionDate: string;
  conceptionDateFormatted: string;
  ovulationDate: string;
  ovulationDateFormatted: string;
  fertileWindowStart: string;
  fertileWindowStartFormatted: string;
  fertileWindowEnd: string;
  fertileWindowEndFormatted: string;
  implantationEarly: string;
  implantationEarlyFormatted: string;
  implantationLate: string;
  implantationLateFormatted: string;
  lmpDate: string;
  lmpDateFormatted: string;
  estimatedDueDate: string;
  estimatedDueDateFormatted: string;
  implantation: { label: string; value: string }[];
  timeline: TimelineEvent[];
}

/**
 * Conception Date Calculator
 *
 * Two calculation modes:
 *
 * From Due Date:
 *   LMP = dueDate - 280 - (cycleLength - 28)
 *   Conception = LMP + (cycleLength - 14)
 *     Simplified: Conception = dueDate - 266 - (cycleLength - 28) + (cycleLength - 14)
 *                            = dueDate - 266 + 14 - 28 = dueDate - 280 + (cycleLength - 14)
 *     More precisely: Conception = dueDate - 280 - (cycleLength - 28) + (cycleLength - 14)
 *                                = dueDate - 280 + 28 - 14 = dueDate - 266
 *   So conception is always dueDate - 266 days regardless of cycle (since cycle
 *   adjustments cancel out). But we keep LMP calculation for timeline.
 *
 * From LMP:
 *   Conception = LMP + (cycleLength - 14) (ovulation day)
 *   DueDate = LMP + 280 + (cycleLength - 28)
 *
 * Fertile window: ovulationDate - 5 days to ovulationDate + 1 day (6-day window)
 * Implantation: 6-12 days after conception
 *
 * Source: American College of Obstetricians and Gynecologists (ACOG).
 * "Methods for Estimating the Due Date." Committee Opinion No. 700 (2017).
 */
export function calculateConception(input: ConceptionInput): ConceptionOutput {
  const cycleLength = input.cycleLength ?? 28;
  const cycleAdjustment = cycleLength - 28;
  const ovulationOffset = cycleLength - 14;

  let lmpDate: Date;
  let dueDate: Date;

  if (input.calculationMethod === 'fromDueDate') {
    if (!input.dueDate) {
      throw new Error('Due date is required when calculating from due date');
    }
    dueDate = parseDate(input.dueDate);

    // LMP = dueDate - 280 - cycleAdjustment
    lmpDate = new Date(dueDate);
    lmpDate.setUTCDate(lmpDate.getUTCDate() - 280 - cycleAdjustment);
  } else {
    if (!input.lastMenstrualPeriod) {
      throw new Error('Last menstrual period is required when calculating from LMP');
    }
    lmpDate = parseDate(input.lastMenstrualPeriod);

    // Due date = LMP + 280 + cycleAdjustment
    dueDate = new Date(lmpDate);
    dueDate.setUTCDate(dueDate.getUTCDate() + 280 + cycleAdjustment);
  }

  // Conception/ovulation date: LMP + ovulationOffset
  const conceptionDate = new Date(lmpDate);
  conceptionDate.setUTCDate(conceptionDate.getUTCDate() + ovulationOffset);

  // Ovulation is the same as conception estimate
  const ovulationDate = new Date(conceptionDate);

  // Fertile window: ovulation - 5 days to ovulation + 1 day
  const fertileWindowStart = new Date(ovulationDate);
  fertileWindowStart.setUTCDate(fertileWindowStart.getUTCDate() - 5);

  const fertileWindowEnd = new Date(ovulationDate);
  fertileWindowEnd.setUTCDate(fertileWindowEnd.getUTCDate() + 1);

  // Implantation range: 6-12 days after conception
  const implantationEarly = new Date(conceptionDate);
  implantationEarly.setUTCDate(implantationEarly.getUTCDate() + 6);

  const implantationLate = new Date(conceptionDate);
  implantationLate.setUTCDate(implantationLate.getUTCDate() + 12);

  // First missed period: LMP + cycleLength
  const firstMissedPeriod = new Date(lmpDate);
  firstMissedPeriod.setUTCDate(firstMissedPeriod.getUTCDate() + cycleLength);

  // Positive test possible: ~14 days after conception (4 weeks from LMP)
  const positiveTestPossible = new Date(conceptionDate);
  positiveTestPossible.setUTCDate(positiveTestPossible.getUTCDate() + 14);

  // First ultrasound: week 6-8 from LMP (midpoint week 7)
  const firstUltrasound = new Date(lmpDate);
  firstUltrasound.setUTCDate(firstUltrasound.getUTCDate() + 7 * 7); // Week 7

  // Timeline
  const timeline: TimelineEvent[] = [
    {
      event: 'Last Menstrual Period (LMP)',
      date: toDateString(lmpDate),
      dateFormatted: formatDateUTC(lmpDate),
      description: 'First day of your last period — the clinical start of pregnancy dating',
    },
    {
      event: 'Fertile Window Opens',
      date: toDateString(fertileWindowStart),
      dateFormatted: formatDateUTC(fertileWindowStart),
      description: 'Sperm can survive up to 5 days, so intercourse from this date could lead to conception',
    },
    {
      event: 'Ovulation / Estimated Conception',
      date: toDateString(conceptionDate),
      dateFormatted: formatDateUTC(conceptionDate),
      description: 'Egg released from ovary — most likely day of conception',
    },
    {
      event: 'Fertile Window Closes',
      date: toDateString(fertileWindowEnd),
      dateFormatted: formatDateUTC(fertileWindowEnd),
      description: 'Egg survives 12-24 hours after ovulation',
    },
    {
      event: 'Implantation (Earliest)',
      date: toDateString(implantationEarly),
      dateFormatted: formatDateUTC(implantationEarly),
      description: 'Embryo may begin implanting in the uterine lining (6 days post-conception)',
    },
    {
      event: 'Implantation (Latest)',
      date: toDateString(implantationLate),
      dateFormatted: formatDateUTC(implantationLate),
      description: 'Most embryos have implanted by 12 days post-conception',
    },
    {
      event: 'First Missed Period',
      date: toDateString(firstMissedPeriod),
      dateFormatted: formatDateUTC(firstMissedPeriod),
      description: 'Your next period would have started — a missed period is the most common first sign',
    },
    {
      event: 'Positive Pregnancy Test Possible',
      date: toDateString(positiveTestPossible),
      dateFormatted: formatDateUTC(positiveTestPossible),
      description: 'hCG levels typically detectable by home pregnancy test (~14 days post-conception)',
    },
    {
      event: 'First Ultrasound (Week 7)',
      date: toDateString(firstUltrasound),
      dateFormatted: formatDateUTC(firstUltrasound),
      description: 'Heartbeat usually visible on ultrasound between weeks 6-8',
    },
    {
      event: 'Estimated Due Date',
      date: toDateString(dueDate),
      dateFormatted: formatDateUTC(dueDate),
      description: 'Estimated delivery date — 280 days (40 weeks) from LMP',
    },
  ];

  return {
    conceptionDate: toDateString(conceptionDate),
    conceptionDateFormatted: formatDateUTC(conceptionDate),
    ovulationDate: toDateString(ovulationDate),
    ovulationDateFormatted: formatDateUTC(ovulationDate),
    fertileWindowStart: toDateString(fertileWindowStart),
    fertileWindowStartFormatted: formatDateUTC(fertileWindowStart),
    fertileWindowEnd: toDateString(fertileWindowEnd),
    fertileWindowEndFormatted: formatDateUTC(fertileWindowEnd),
    implantationEarly: toDateString(implantationEarly),
    implantationEarlyFormatted: formatDateUTC(implantationEarly),
    implantationLate: toDateString(implantationLate),
    implantationLateFormatted: formatDateUTC(implantationLate),
    lmpDate: toDateString(lmpDate),
    lmpDateFormatted: formatDateUTC(lmpDate),
    estimatedDueDate: toDateString(dueDate),
    estimatedDueDateFormatted: formatDateUTC(dueDate),
    implantation: [
      { label: 'Earliest', value: formatDateUTC(implantationEarly) },
      { label: 'Latest', value: formatDateUTC(implantationLate) },
    ],
    timeline,
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
export function calculateConceptionFromInputs(inputs: Record<string, unknown>): Record<string, unknown> {
  const result = calculateConception({
    calculationMethod: inputs.calculationMethod as 'fromDueDate' | 'fromLMP',
    dueDate: inputs.dueDate as string | undefined,
    lastMenstrualPeriod: inputs.lastMenstrualPeriod as string | undefined,
    cycleLength: inputs.cycleLength ? Number(inputs.cycleLength) : undefined,
  });
  return result as unknown as Record<string, unknown>;
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'conception': calculateConceptionFromInputs,
};
