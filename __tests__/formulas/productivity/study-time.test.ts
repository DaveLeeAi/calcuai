import { calculateStudyTime } from '@/lib/formulas/productivity/study-time';

describe('calculateStudyTime', () => {
  it('calculates total study hours correctly', () => {
    const result = calculateStudyTime({ totalPages: 100, readingSpeedWpm: 300, wordsPerPage: 300, difficultyLevel: 'medium', reviewRepetitions: 1, hoursPerDay: 3, sessionLengthMinutes: 50 });
    // 100 pages × 300 words / 300 wpm × 1.0 difficulty × 1 rep = 100 minutes = 1.67 hours
    expect(Number(result.totalStudyHours)).toBeCloseTo(100 * 300 / 300 / 60, 1);
  });

  it('applies difficulty multiplier for hard content', () => {
    const medium = calculateStudyTime({ totalPages: 100, readingSpeedWpm: 300, wordsPerPage: 300, difficultyLevel: 'medium', reviewRepetitions: 1, hoursPerDay: 3, sessionLengthMinutes: 50 });
    const hard = calculateStudyTime({ totalPages: 100, readingSpeedWpm: 300, wordsPerPage: 300, difficultyLevel: 'hard', reviewRepetitions: 1, hoursPerDay: 3, sessionLengthMinutes: 50 });
    expect(Number(hard.totalStudyHours)).toBeGreaterThan(Number(medium.totalStudyHours));
  });

  it('multiplies time by review repetitions', () => {
    const once = calculateStudyTime({ totalPages: 100, readingSpeedWpm: 300, wordsPerPage: 300, difficultyLevel: 'medium', reviewRepetitions: 1, hoursPerDay: 3, sessionLengthMinutes: 50 });
    const thrice = calculateStudyTime({ totalPages: 100, readingSpeedWpm: 300, wordsPerPage: 300, difficultyLevel: 'medium', reviewRepetitions: 3, hoursPerDay: 3, sessionLengthMinutes: 50 });
    expect(Number(thrice.totalStudyHours)).toBeCloseTo(Number(once.totalStudyHours) * 3, 0);
  });

  it('calculates days needed from hours per day', () => {
    const result = calculateStudyTime({ totalPages: 200, readingSpeedWpm: 250, wordsPerPage: 300, difficultyLevel: 'medium', reviewRepetitions: 2, hoursPerDay: 4, sessionLengthMinutes: 50 });
    const expectedDays = Number(result.totalStudyHours) / 4;
    expect(Number(result.daysNeeded)).toBeCloseTo(expectedDays, 1);
  });

  it('pages per hour is inversely related to difficulty', () => {
    const easy = calculateStudyTime({ totalPages: 100, readingSpeedWpm: 300, wordsPerPage: 300, difficultyLevel: 'easy', reviewRepetitions: 1, hoursPerDay: 3, sessionLengthMinutes: 50 });
    const hard = calculateStudyTime({ totalPages: 100, readingSpeedWpm: 300, wordsPerPage: 300, difficultyLevel: 'hard', reviewRepetitions: 1, hoursPerDay: 3, sessionLengthMinutes: 50 });
    expect(Number(easy.pagesPerHour)).toBeGreaterThan(Number(hard.pagesPerHour));
  });

  it('calculates total sessions based on session length', () => {
    const result = calculateStudyTime({ totalPages: 100, readingSpeedWpm: 300, wordsPerPage: 300, difficultyLevel: 'medium', reviewRepetitions: 1, hoursPerDay: 4, sessionLengthMinutes: 50 });
    const expectedSessions = Math.ceil(Number(result.totalStudyHours) / (50 / 60));
    expect(Number(result.totalSessions)).toBe(expectedSessions);
  });

  it('returns study schedule array', () => {
    const result = calculateStudyTime({ totalPages: 200, readingSpeedWpm: 250, wordsPerPage: 300, difficultyLevel: 'medium', reviewRepetitions: 2, hoursPerDay: 3, sessionLengthMinutes: 50 });
    const schedule = result.studySchedule as unknown[];
    expect(Array.isArray(schedule)).toBe(true);
    expect(schedule.length).toBeGreaterThan(0);
  });

  it('more pages = more study hours', () => {
    const small = calculateStudyTime({ totalPages: 50, readingSpeedWpm: 300, wordsPerPage: 300, difficultyLevel: 'medium', reviewRepetitions: 1, hoursPerDay: 3, sessionLengthMinutes: 50 });
    const large = calculateStudyTime({ totalPages: 500, readingSpeedWpm: 300, wordsPerPage: 300, difficultyLevel: 'medium', reviewRepetitions: 1, hoursPerDay: 3, sessionLengthMinutes: 50 });
    expect(Number(large.totalStudyHours)).toBeGreaterThan(Number(small.totalStudyHours));
  });

  it('returns summary array with 7 items', () => {
    const result = calculateStudyTime({ totalPages: 100, readingSpeedWpm: 300, wordsPerPage: 300, difficultyLevel: 'medium', reviewRepetitions: 2, hoursPerDay: 3, sessionLengthMinutes: 50 });
    expect(Array.isArray(result.summary)).toBe(true);
    expect((result.summary as unknown[]).length).toBe(7);
  });

  it('handles missing inputs gracefully', () => {
    const result = calculateStudyTime({});
    expect(typeof result.totalStudyHours).toBe('number');
    expect(typeof result.daysNeeded).toBe('number');
  });

  it('minutesPerPage = 60 / pagesPerHour', () => {
    const result = calculateStudyTime({ totalPages: 100, readingSpeedWpm: 300, wordsPerPage: 300, difficultyLevel: 'medium', reviewRepetitions: 1, hoursPerDay: 3, sessionLengthMinutes: 50 });
    expect(Number(result.minutesPerPage)).toBeCloseTo(60 / Number(result.pagesPerHour), 1);
  });
});
