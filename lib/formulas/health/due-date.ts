export interface DueDateInput {
  lastMenstrualPeriod: string; // ISO date string
  cycleLength?: number; // days, default 28
}

export interface DueDateOutput {
  dueDate: string; // ISO date string
  dueDateFormatted: string;
  gestationalAge: { weeks: number; days: number };
  trimester: 1 | 2 | 3;
  trimesterProgress: string;
  conceptionDate: string;
  conceptionDateFormatted: string;
  firstTrimesterEnd: string;
  secondTrimesterEnd: string;
  milestones: Milestone[];
  daysRemaining: number;
  daysElapsed: number;
  progressPercentage: number;
  progressBar: number;
}

export interface Milestone {
  week: number;
  date: string;
  dateFormatted: string;
  description: string;
}

/**
 * Naegele's Rule for estimated due date:
 *
 * EDD = LMP + 280 days (for a standard 28-day cycle)
 *
 * For non-standard cycles:
 * EDD = LMP + 280 + (cycleLength − 28) days
 *
 * Conception estimated at: LMP + 14 days (adjusted for cycle length)
 * Ovulation offset = cycleLength − 14
 *
 * Trimesters:
 *   First:  Weeks 1–12
 *   Second: Weeks 13–26
 *   Third:  Weeks 27–40
 *
 * Source: American College of Obstetricians and Gynecologists (ACOG).
 * "Methods for Estimating the Due Date." Committee Opinion No. 700 (2017).
 */
export function calculateDueDate(input: DueDateInput): DueDateOutput {
  const cycleLength = Math.max(1, Math.min(60, Number(input.cycleLength) || 28));
  const lmpRaw = input.lastMenstrualPeriod;
  const lmp = new Date(typeof lmpRaw === 'string' ? lmpRaw : '');

  // Guard: if LMP is invalid, fall back to today to avoid throwing
  if (isNaN(lmp.getTime())) {
    lmp.setTime(new Date().getTime());
  }

  // Cycle length adjustment
  const cycleAdjustment = cycleLength - 28;

  // Due date: LMP + 280 days + cycle adjustment
  const dueDate = new Date(lmp);
  dueDate.setDate(dueDate.getDate() + 280 + cycleAdjustment);

  // Conception date: LMP + ovulation offset (cycleLength - 14)
  const conceptionDate = new Date(lmp);
  conceptionDate.setDate(conceptionDate.getDate() + (cycleLength - 14));

  // Gestational age from LMP
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lmpClean = new Date(lmp);
  lmpClean.setHours(0, 0, 0, 0);

  const msElapsed = today.getTime() - lmpClean.getTime();
  const daysElapsed = Math.max(0, Math.floor(msElapsed / (1000 * 60 * 60 * 24)));
  const gestationalWeeks = Math.floor(daysElapsed / 7);
  const gestationalDays = daysElapsed % 7;

  // Trimester
  let trimester: 1 | 2 | 3;
  let trimesterProgress: string;
  if (gestationalWeeks < 13) {
    trimester = 1;
    trimesterProgress = `Week ${gestationalWeeks} of first trimester (weeks 1-12)`;
  } else if (gestationalWeeks < 27) {
    trimester = 2;
    trimesterProgress = `Week ${gestationalWeeks} of second trimester (weeks 13-26)`;
  } else {
    trimester = 3;
    trimesterProgress = `Week ${gestationalWeeks} of third trimester (weeks 27-40)`;
  }

  // Trimester end dates
  const firstTrimesterEnd = new Date(lmp);
  firstTrimesterEnd.setDate(firstTrimesterEnd.getDate() + 12 * 7 + cycleAdjustment);

  const secondTrimesterEnd = new Date(lmp);
  secondTrimesterEnd.setDate(secondTrimesterEnd.getDate() + 26 * 7 + cycleAdjustment);

  // Days remaining
  const dueDateClean = new Date(dueDate);
  dueDateClean.setHours(0, 0, 0, 0);
  const daysRemaining = Math.max(0, Math.ceil((dueDateClean.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  // Progress percentage
  const totalDays = 280 + cycleAdjustment;
  const progressPercentage = Math.min(100, Math.round((daysElapsed / totalDays) * 100));

  // Key milestones
  const milestones = generateMilestones(lmp, cycleAdjustment);

  return {
    dueDate: dueDate.toISOString().split('T')[0],
    dueDateFormatted: formatDate(dueDate),
    gestationalAge: { weeks: gestationalWeeks, days: gestationalDays },
    trimester,
    trimesterProgress,
    conceptionDate: conceptionDate.toISOString().split('T')[0],
    conceptionDateFormatted: formatDate(conceptionDate),
    firstTrimesterEnd: firstTrimesterEnd.toISOString().split('T')[0],
    secondTrimesterEnd: secondTrimesterEnd.toISOString().split('T')[0],
    milestones,
    daysRemaining,
    daysElapsed,
    progressPercentage,
    progressBar: progressPercentage,
  };
}

function generateMilestones(lmp: Date, cycleAdjustment: number): Milestone[] {
  const milestoneData = [
    { week: 6, description: 'Heartbeat may be detectable via ultrasound' },
    { week: 8, description: 'All major organs begin forming' },
    { week: 12, description: 'End of first trimester; risk of miscarriage drops significantly' },
    { week: 16, description: 'Baby may begin to move (quickening)' },
    { week: 20, description: 'Anatomy scan ultrasound; halfway point' },
    { week: 24, description: 'Viability milestone; lungs begin producing surfactant' },
    { week: 28, description: 'Third trimester begins; eyes can open' },
    { week: 32, description: 'Baby is practicing breathing movements' },
    { week: 36, description: 'Baby is considered early term; head may engage' },
    { week: 37, description: 'Full term begins' },
    { week: 40, description: 'Estimated due date' },
  ];

  return milestoneData.map(({ week, description }) => {
    const date = new Date(lmp);
    date.setDate(date.getDate() + week * 7 + cycleAdjustment);
    return {
      week,
      date: date.toISOString().split('T')[0],
      dateFormatted: formatDate(date),
      description,
    };
  });
}

function formatDate(date: Date): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

// Wrapper for the formula registry
export function calculateDueDateFromInputs(inputs: Record<string, unknown>): Record<string, unknown> {
  const result = calculateDueDate({
    lastMenstrualPeriod: inputs.lastMenstrualPeriod as string,
    cycleLength: inputs.cycleLength as number | undefined,
  });
  return result as unknown as Record<string, unknown>;
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'due-date': calculateDueDateFromInputs,
};
