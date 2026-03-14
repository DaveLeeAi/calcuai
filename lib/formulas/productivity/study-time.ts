/**
 * Study Time Calculator
 *
 * Formulas:
 *   Total Pages to Review = Pages × Chapters × Coverage%
 *   Time Per Page = Base Reading Time × Difficulty Multiplier
 *   Raw Study Hours = Total Pages × Time Per Page / 60
 *   Adjusted Hours = Raw Hours × Retention Repetitions
 *   Days Needed = Adjusted Hours / Hours Per Day
 *   Study Sessions = Adjusted Hours / Session Length
 *
 * Source: Dunlosky et al., "Improving Students' Learning With Effective Learning Techniques," Psychological Science in the Public Interest (2013).
 * Source: Cepeda et al., "Spacing Effects in Learning," Psychological Science (2006).
 */

export interface StudyTimeInput {
  totalPages: number;
  readingSpeedWpm: number;
  wordsPerPage: number;
  difficultyLevel: string;
  reviewRepetitions: number;
  hoursPerDay: number;
  sessionLengthMinutes: number;
}

export interface StudyScheduleRow {
  day: number;
  sessionType: string;
  pagesTarget: number;
  hoursRequired: number;
}

export interface StudyTimeOutput {
  totalStudyHours: number;
  daysNeeded: number;
  totalSessions: number;
  pagesPerHour: number;
  minutesPerPage: number;
  studySchedule: StudyScheduleRow[];
  summary: { label: string; value: number }[];
}

/**
 * Calculates total study time required and optimal scheduling.
 *
 * Study Hours = (Pages × Words Per Page / Reading Speed WPM / 60) × Difficulty × Repetitions
 *
 * @param inputs - Record with totalPages, readingSpeedWpm, wordsPerPage, difficultyLevel, reviewRepetitions, hoursPerDay, sessionLengthMinutes
 * @returns Record with totalStudyHours, daysNeeded, totalSessions, studySchedule, summary
 */
export function calculateStudyTime(inputs: Record<string, unknown>): Record<string, unknown> {
  const totalPages = Math.max(1, Number(inputs.totalPages) || 100);
  const readingSpeedWpm = Math.max(50, Number(inputs.readingSpeedWpm) || 250);
  const wordsPerPage = Math.max(50, Number(inputs.wordsPerPage) || 300);
  const difficultyLevel = String(inputs.difficultyLevel || 'medium');
  const reviewRepetitions = Math.min(5, Math.max(1, Number(inputs.reviewRepetitions) || 2));
  const hoursPerDay = Math.min(16, Math.max(0.5, Number(inputs.hoursPerDay) || 3));
  const sessionLengthMinutes = Math.min(180, Math.max(15, Number(inputs.sessionLengthMinutes) || 50));

  const difficultyMultipliers: Record<string, number> = {
    'easy': 0.8,
    'medium': 1.0,
    'hard': 1.4,
    'very-hard': 1.8,
  };
  const difficultyMultiplier = difficultyMultipliers[difficultyLevel] ?? 1.0;

  const minutesPerPage = parseFloat(((wordsPerPage / readingSpeedWpm) * difficultyMultiplier).toFixed(2));
  const rawStudyMinutes = totalPages * minutesPerPage * reviewRepetitions;
  const totalStudyHours = parseFloat((rawStudyMinutes / 60).toFixed(1));
  const pagesPerHour = parseFloat((60 / minutesPerPage).toFixed(1));

  const daysNeeded = parseFloat((totalStudyHours / hoursPerDay).toFixed(1));
  const sessionLengthHours = sessionLengthMinutes / 60;
  const totalSessions = Math.ceil(totalStudyHours / sessionLengthHours);

  // Build a simple study schedule (up to 14 days)
  const studySchedule: StudyScheduleRow[] = [];
  const pagesPerSession = parseFloat((pagesPerHour * sessionLengthHours).toFixed(0));
  const sessionsPerDay = Math.floor(hoursPerDay / sessionLengthHours);

  for (let day = 1; day <= Math.min(Math.ceil(daysNeeded), 14); day++) {
    const sessionType = day === 1 ? 'First Read' : day <= Math.ceil(daysNeeded * 0.6) ? 'Review' : 'Final Review';
    studySchedule.push({
      day,
      sessionType,
      pagesTarget: Math.min(pagesPerSession * Math.max(1, sessionsPerDay), totalPages),
      hoursRequired: Math.min(hoursPerDay, totalStudyHours - (day - 1) * hoursPerDay),
    });
  }

  const summary: { label: string; value: number }[] = [
    { label: 'Total Pages', value: totalPages },
    { label: 'Total Study Hours', value: totalStudyHours },
    { label: 'Days Needed', value: daysNeeded },
    { label: 'Total Sessions', value: totalSessions },
    { label: 'Minutes Per Page', value: minutesPerPage },
    { label: 'Pages Per Hour', value: pagesPerHour },
    { label: 'Review Repetitions', value: reviewRepetitions },
  ];

  return { totalStudyHours, daysNeeded, totalSessions, pagesPerHour, minutesPerPage, studySchedule, summary };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'study-time': calculateStudyTime,
};
