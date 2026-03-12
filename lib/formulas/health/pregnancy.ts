export interface PregnancyInput {
  lastMenstrualPeriod: string; // ISO date string
  cycleLength?: number; // days, default 28
  referenceDate?: string; // ISO date string for testing, defaults to today
}

export interface WeeklyDevelopment {
  week: number;
  size: string;
  development: string;
}

export interface KeyDate {
  event: string;
  date: string;
  dateFormatted: string;
}

export interface PregnancyOutput {
  currentWeek: number;
  currentDay: number;
  currentWeekDisplay: string;
  dueDate: string;
  dueDateFormatted: string;
  trimester: 1 | 2 | 3;
  trimesterText: string;
  progressPercentage: number;
  weeklyDevelopment: WeeklyDevelopment[];
  keyDates: KeyDate[];
  daysRemaining: number;
  daysElapsed: number;
  conceptionDate: string;
  conceptionDateFormatted: string;
}

/**
 * Pregnancy Week-by-Week Calculator
 *
 * Uses Naegele's Rule for estimated due date:
 *   EDD = LMP + 280 days + (cycleLength - 28)
 *
 * Gestational age = (referenceDate - LMP) in weeks and days
 *
 * Conception estimated at: LMP + (cycleLength - 14) days
 *
 * Trimesters:
 *   First:  Weeks 1-12
 *   Second: Weeks 13-26
 *   Third:  Weeks 27-40
 *
 * Source: American College of Obstetricians and Gynecologists (ACOG).
 * "Methods for Estimating the Due Date." Committee Opinion No. 700 (2017).
 */
export function calculatePregnancy(input: PregnancyInput): PregnancyOutput {
  const cycleLength = input.cycleLength ?? 28;
  const lmp = parseDate(input.lastMenstrualPeriod);

  const cycleAdjustment = cycleLength - 28;

  // Due date: LMP + 280 days + cycle adjustment
  const dueDate = new Date(lmp);
  dueDate.setUTCDate(dueDate.getUTCDate() + 280 + cycleAdjustment);

  // Conception date: LMP + (cycleLength - 14)
  const conceptionDate = new Date(lmp);
  conceptionDate.setUTCDate(conceptionDate.getUTCDate() + (cycleLength - 14));

  // Reference date (today or test override)
  const today = input.referenceDate ? parseDate(input.referenceDate) : parseDate(new Date().toISOString().split('T')[0]);

  // Gestational age from LMP (use UTC to avoid timezone issues)
  const msElapsed = today.getTime() - lmp.getTime();
  const daysElapsed = Math.max(0, Math.round(msElapsed / (1000 * 60 * 60 * 24)));
  const currentWeek = Math.floor(daysElapsed / 7);
  const currentDay = daysElapsed % 7;

  // Trimester
  let trimester: 1 | 2 | 3;
  let trimesterText: string;
  if (currentWeek < 13) {
    trimester = 1;
    trimesterText = `First trimester (weeks 1-12)`;
  } else if (currentWeek < 27) {
    trimester = 2;
    trimesterText = `Second trimester (weeks 13-26)`;
  } else {
    trimester = 3;
    trimesterText = `Third trimester (weeks 27-40)`;
  }

  const currentWeekDisplay = `Week ${currentWeek}, Day ${currentDay}`;

  // Progress percentage
  const totalDays = 280 + cycleAdjustment;
  const progressPercentage = Math.min(100, Math.max(0, Math.round((daysElapsed / totalDays) * 100)));

  // Days remaining
  const daysRemaining = Math.max(0, Math.round((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  // Weekly development data (weeks 4-40)
  const weeklyDevelopment = generateWeeklyDevelopment();

  // Key dates
  const keyDates = generateKeyDates(lmp, cycleLength, cycleAdjustment);

  return {
    currentWeek,
    currentDay,
    currentWeekDisplay,
    dueDate: toDateString(dueDate),
    dueDateFormatted: formatDateUTC(dueDate),
    trimester,
    trimesterText,
    progressPercentage,
    weeklyDevelopment,
    keyDates,
    daysRemaining,
    daysElapsed,
    conceptionDate: toDateString(conceptionDate),
    conceptionDateFormatted: formatDateUTC(conceptionDate),
  };
}

function generateWeeklyDevelopment(): WeeklyDevelopment[] {
  const data: WeeklyDevelopment[] = [
    { week: 4, size: 'Poppy seed', development: 'Embryo implants in uterine wall' },
    { week: 5, size: 'Sesame seed', development: 'Heart begins to beat; neural tube forming' },
    { week: 6, size: 'Lentil', development: 'Nose, mouth, and ears start to take shape' },
    { week: 7, size: 'Blueberry', development: 'Brain developing rapidly; arm and leg buds appear' },
    { week: 8, size: 'Raspberry', development: 'All major organs beginning to form' },
    { week: 9, size: 'Cherry', development: 'Embryo becomes a fetus; tiny movements begin' },
    { week: 10, size: 'Kumquat', development: 'Vital organs fully formed and starting to function' },
    { week: 11, size: 'Fig', development: 'Tooth buds and nail beds forming' },
    { week: 12, size: 'Lime', development: 'Fingers and toes fully formed' },
    { week: 13, size: 'Lemon', development: 'Vocal cords developing; fingerprints forming' },
    { week: 14, size: 'Nectarine', development: 'Baby can squint, frown, and grimace' },
    { week: 15, size: 'Apple', development: 'Bones hardening; baby may suck thumb' },
    { week: 16, size: 'Avocado', development: 'Baby can make facial expressions' },
    { week: 17, size: 'Pear', development: 'Skeleton changing from cartilage to bone' },
    { week: 18, size: 'Bell pepper', development: 'Baby can yawn and hiccup' },
    { week: 19, size: 'Mango', development: 'Sensory development accelerating; vernix forms' },
    { week: 20, size: 'Banana', development: 'Halfway point — anatomy scan' },
    { week: 21, size: 'Carrot', development: 'Baby can taste amniotic fluid; movements stronger' },
    { week: 22, size: 'Papaya (small)', development: 'Eyes formed but irises lack color' },
    { week: 23, size: 'Grapefruit', development: 'Baby can hear sounds from outside the womb' },
    { week: 24, size: 'Ear of corn', development: 'Viability milestone reached' },
    { week: 25, size: 'Cauliflower', development: 'Baby responds to familiar voices' },
    { week: 26, size: 'Lettuce head', development: 'Eyes open for the first time' },
    { week: 27, size: 'Rutabaga', development: 'Sleep-wake cycles becoming regular' },
    { week: 28, size: 'Eggplant', development: 'Eyes can open and close' },
    { week: 29, size: 'Butternut squash', development: 'Baby can kick, stretch, and grasp' },
    { week: 30, size: 'Cabbage', development: 'Brain growing rapidly; gaining body fat' },
    { week: 31, size: 'Coconut', development: 'All five senses fully functional' },
    { week: 32, size: 'Squash', development: 'Practicing breathing movements' },
    { week: 33, size: 'Pineapple', development: 'Bones hardening except skull (for delivery)' },
    { week: 34, size: 'Cantaloupe', development: 'Central nervous system and lungs maturing' },
    { week: 35, size: 'Honeydew melon', development: 'Kidneys fully developed; liver can process waste' },
    { week: 36, size: 'Papaya', development: 'Lungs nearly mature' },
    { week: 37, size: 'Swiss chard bunch', development: 'Early term — baby considered full term soon' },
    { week: 38, size: 'Leek', development: 'Organ function continues to mature' },
    { week: 39, size: 'Mini watermelon', development: 'Full term — brain and lungs still developing' },
    { week: 40, size: 'Watermelon', development: 'Full term — estimated due date' },
  ];

  return data;
}

function generateKeyDates(lmp: Date, cycleLength: number, cycleAdjustment: number): KeyDate[] {
  const events: { event: string; weekOffset: number; dayOffset?: number }[] = [
    { event: 'Estimated Conception Date', weekOffset: 0, dayOffset: cycleLength - 14 },
    { event: 'End of First Trimester', weekOffset: 12, dayOffset: undefined },
    { event: 'Anatomy Scan (Week 20)', weekOffset: 20, dayOffset: undefined },
    { event: 'Viability Milestone (Week 24)', weekOffset: 24, dayOffset: undefined },
    { event: 'Third Trimester Begins (Week 27)', weekOffset: 27, dayOffset: undefined },
    { event: 'Full Term (Week 37)', weekOffset: 37, dayOffset: undefined },
    { event: 'Estimated Due Date (Week 40)', weekOffset: 40, dayOffset: undefined },
  ];

  return events.map(({ event, weekOffset, dayOffset }) => {
    const date = new Date(lmp);
    if (dayOffset !== undefined) {
      date.setUTCDate(date.getUTCDate() + dayOffset);
    } else {
      date.setUTCDate(date.getUTCDate() + weekOffset * 7 + cycleAdjustment);
    }
    return {
      event,
      date: toDateString(date),
      dateFormatted: formatDateUTC(date),
    };
  });
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
export function calculatePregnancyFromInputs(inputs: Record<string, unknown>): Record<string, unknown> {
  const result = calculatePregnancy({
    lastMenstrualPeriod: inputs.lastMenstrualPeriod as string,
    cycleLength: inputs.cycleLength ? Number(inputs.cycleLength) : undefined,
    referenceDate: inputs.referenceDate as string | undefined,
  });
  return result as unknown as Record<string, unknown>;
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'pregnancy': calculatePregnancyFromInputs,
};
