/**
 * Reading Time Calculator
 *
 * Formulas:
 *   Reading Time (minutes) = Total Words / Reading Speed (WPM)
 *   Total Words = Pages × Words Per Page
 *   Reading Time (hours) = Reading Time (minutes) / 60
 *   Days to Finish = Reading Time (hours) / Hours Per Day
 *   Finish Date = Today + Days to Finish
 *
 * Source: Brysbaert, Marc — "How many words do we read per minute? A review and meta-analysis of reading rate," Journal of Memory and Language (2019).
 * Source: Rayner et al. — "Eye Movements and Information Processing During Reading," Psychological Bulletin (2016).
 */

export interface ReadingTimeInput {
  totalPages: number;
  wordsPerPage: number;
  readingSpeedWpm: number;
  dailyReadingMinutes: number;
  readingType: string;
}

export interface ReadingTimeOutput {
  totalWords: number;
  totalReadingMinutes: number;
  totalReadingHours: number;
  daysToFinish: number;
  minutesPerPage: number;
  adjustedWpm: number;
  summary: { label: string; value: number | string }[];
}

/**
 * Calculates reading time for a book or document based on length and speed.
 *
 * Reading Time = Words / WPM
 * Days = Total Hours / Daily Reading Hours
 *
 * @param inputs - Record with totalPages, wordsPerPage, readingSpeedWpm, dailyReadingMinutes, readingType
 * @returns Record with totalWords, totalReadingMinutes, totalReadingHours, daysToFinish, summary
 */
export function calculateReadingTime(inputs: Record<string, unknown>): Record<string, unknown> {
  const totalPages = Math.max(1, Number(inputs.totalPages) || 300);
  const wordsPerPage = Math.max(50, Number(inputs.wordsPerPage) || 300);
  const readingSpeedWpm = Math.max(50, Number(inputs.readingSpeedWpm) || 250);
  const dailyReadingMinutes = Math.max(1, Number(inputs.dailyReadingMinutes) || 30);
  const readingType = String(inputs.readingType || 'fiction');

  // Reading speed multipliers by content type
  const typeMultipliers: Record<string, number> = {
    'fiction': 1.0,
    'non-fiction': 0.85,
    'textbook': 0.60,
    'technical': 0.50,
    'casual-blog': 1.15,
  };
  const typeMultiplier = typeMultipliers[readingType] ?? 1.0;
  const adjustedWpm = parseFloat((readingSpeedWpm * typeMultiplier).toFixed(0));

  const totalWords = totalPages * wordsPerPage;
  const totalReadingMinutes = parseFloat((totalWords / adjustedWpm).toFixed(1));
  const totalReadingHours = parseFloat((totalReadingMinutes / 60).toFixed(2));
  const minutesPerPage = parseFloat((totalReadingMinutes / totalPages).toFixed(2));
  const daysToFinish = parseFloat((totalReadingHours / (dailyReadingMinutes / 60)).toFixed(1));

  const summary: { label: string; value: number | string }[] = [
    { label: 'Total Words', value: totalWords },
    { label: 'Reading Speed (WPM)', value: adjustedWpm },
    { label: 'Total Reading Time (min)', value: totalReadingMinutes },
    { label: 'Total Reading Time (hrs)', value: totalReadingHours },
    { label: 'Minutes Per Page', value: minutesPerPage },
    { label: 'Days to Finish', value: daysToFinish },
    { label: 'Daily Reading (min)', value: dailyReadingMinutes },
  ];

  return { totalWords, totalReadingMinutes, totalReadingHours, daysToFinish, minutesPerPage, adjustedWpm, summary };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'reading-time': calculateReadingTime,
};
