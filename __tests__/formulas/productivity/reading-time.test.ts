import { calculateReadingTime } from '@/lib/formulas/productivity/reading-time';

describe('calculateReadingTime', () => {
  it('calculates total words correctly', () => {
    const result = calculateReadingTime({ totalPages: 300, wordsPerPage: 300, readingSpeedWpm: 250, dailyReadingMinutes: 30, readingType: 'fiction' });
    expect(result.totalWords).toBe(90000);
  });

  it('calculates reading time in minutes', () => {
    const result = calculateReadingTime({ totalPages: 300, wordsPerPage: 300, readingSpeedWpm: 300, dailyReadingMinutes: 30, readingType: 'fiction' });
    // 90000 words / 300 wpm × 1.0 = 300 minutes
    expect(Number(result.totalReadingMinutes)).toBeCloseTo(300, 1);
  });

  it('converts minutes to hours correctly', () => {
    const result = calculateReadingTime({ totalPages: 300, wordsPerPage: 300, readingSpeedWpm: 300, dailyReadingMinutes: 30, readingType: 'fiction' });
    expect(Number(result.totalReadingHours)).toBeCloseTo(5, 1);
  });

  it('applies textbook difficulty multiplier (slower reading)', () => {
    const fiction = calculateReadingTime({ totalPages: 200, wordsPerPage: 300, readingSpeedWpm: 250, dailyReadingMinutes: 30, readingType: 'fiction' });
    const textbook = calculateReadingTime({ totalPages: 200, wordsPerPage: 300, readingSpeedWpm: 250, dailyReadingMinutes: 30, readingType: 'textbook' });
    expect(Number(textbook.totalReadingHours)).toBeGreaterThan(Number(fiction.totalReadingHours));
  });

  it('calculates days to finish from daily reading time', () => {
    const result = calculateReadingTime({ totalPages: 300, wordsPerPage: 300, readingSpeedWpm: 300, dailyReadingMinutes: 60, readingType: 'fiction' });
    // 300 min total / 60 min daily = 5 days
    expect(Number(result.daysToFinish)).toBeCloseTo(5, 1);
  });

  it('more pages = more reading time', () => {
    const short = calculateReadingTime({ totalPages: 100, wordsPerPage: 300, readingSpeedWpm: 250, dailyReadingMinutes: 30, readingType: 'fiction' });
    const long = calculateReadingTime({ totalPages: 800, wordsPerPage: 300, readingSpeedWpm: 250, dailyReadingMinutes: 30, readingType: 'fiction' });
    expect(Number(long.totalReadingHours)).toBeGreaterThan(Number(short.totalReadingHours));
  });

  it('faster reader finishes sooner', () => {
    const slow = calculateReadingTime({ totalPages: 300, wordsPerPage: 300, readingSpeedWpm: 150, dailyReadingMinutes: 30, readingType: 'fiction' });
    const fast = calculateReadingTime({ totalPages: 300, wordsPerPage: 300, readingSpeedWpm: 400, dailyReadingMinutes: 30, readingType: 'fiction' });
    expect(Number(fast.daysToFinish)).toBeLessThan(Number(slow.daysToFinish));
  });

  it('casual blog reads faster than textbook', () => {
    const blog = calculateReadingTime({ totalPages: 100, wordsPerPage: 300, readingSpeedWpm: 250, dailyReadingMinutes: 30, readingType: 'casual-blog' });
    const textbook = calculateReadingTime({ totalPages: 100, wordsPerPage: 300, readingSpeedWpm: 250, dailyReadingMinutes: 30, readingType: 'textbook' });
    expect(Number(blog.totalReadingHours)).toBeLessThan(Number(textbook.totalReadingHours));
  });

  it('returns minutesPerPage as a positive number', () => {
    const result = calculateReadingTime({ totalPages: 300, wordsPerPage: 300, readingSpeedWpm: 250, dailyReadingMinutes: 30, readingType: 'fiction' });
    expect(Number(result.minutesPerPage)).toBeGreaterThan(0);
  });

  it('returns summary with 7 items', () => {
    const result = calculateReadingTime({ totalPages: 300, wordsPerPage: 300, readingSpeedWpm: 250, dailyReadingMinutes: 30, readingType: 'fiction' });
    expect(Array.isArray(result.summary)).toBe(true);
    expect((result.summary as unknown[]).length).toBe(7);
  });

  it('handles missing inputs gracefully', () => {
    const result = calculateReadingTime({});
    expect(typeof result.totalReadingHours).toBe('number');
    expect(typeof result.daysToFinish).toBe('number');
  });
});
