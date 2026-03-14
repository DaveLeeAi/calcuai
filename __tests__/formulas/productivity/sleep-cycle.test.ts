import { calculateSleepCycle } from '@/lib/formulas/productivity/sleep-cycle';

describe('calculateSleepCycle', () => {
  it('returns 5 bedtime options', () => {
    const result = calculateSleepCycle({ targetWakeTime: '07:00', sleepOnsetMinutes: 14 });
    const options = result.recommendedBedtimes as unknown[];
    expect(Array.isArray(options)).toBe(true);
    expect(options.length).toBe(5); // cycles 4–8
  });

  it('returns an optimalBedtime string', () => {
    const result = calculateSleepCycle({ targetWakeTime: '07:00', sleepOnsetMinutes: 14 });
    expect(typeof result.optimalBedtime).toBe('string');
    expect((result.optimalBedtime as string).length).toBeGreaterThan(0);
  });

  it('optimal bedtime is for 6 cycles (9 hours)', () => {
    const result = calculateSleepCycle({ targetWakeTime: '07:00', sleepOnsetMinutes: 14 });
    expect(result.optimalCycles).toBe(6);
    expect(result.optimalSleepHours).toBe(9);
  });

  it('each cycle is 90 minutes', () => {
    const result = calculateSleepCycle({ targetWakeTime: '07:00', sleepOnsetMinutes: 0 });
    const options = result.recommendedBedtimes as { cycles: number; totalSleepHours: number }[];
    const fiveCycles = options.find(o => o.cycles === 5);
    expect(fiveCycles?.totalSleepHours).toBe(7.5);
  });

  it('4 cycles = 6 hours of sleep', () => {
    const result = calculateSleepCycle({ targetWakeTime: '07:00', sleepOnsetMinutes: 0 });
    const options = result.recommendedBedtimes as { cycles: number; totalSleepHours: number }[];
    const fourCycles = options.find(o => o.cycles === 4);
    expect(fourCycles?.totalSleepHours).toBe(6);
  });

  it('sleep onset shifts bedtime earlier', () => {
    const noOnset = calculateSleepCycle({ targetWakeTime: '07:00', sleepOnsetMinutes: 0 });
    const withOnset = calculateSleepCycle({ targetWakeTime: '07:00', sleepOnsetMinutes: 14 });
    // With longer sleep onset, bedtime should be earlier (different string)
    expect(noOnset.optimalBedtime).not.toBe(withOnset.optimalBedtime);
  });

  it('bedtimes are formatted as time strings with AM/PM', () => {
    const result = calculateSleepCycle({ targetWakeTime: '07:00', sleepOnsetMinutes: 14 });
    const options = result.recommendedBedtimes as { bedtime: string }[];
    options.forEach(o => {
      expect(o.bedtime).toMatch(/\d{1,2}:\d{2}\s(AM|PM)/);
    });
  });

  it('handles midnight wake time', () => {
    const result = calculateSleepCycle({ targetWakeTime: '00:00', sleepOnsetMinutes: 14 });
    expect(typeof result.optimalBedtime).toBe('string');
  });

  it('handles noon wake time', () => {
    const result = calculateSleepCycle({ targetWakeTime: '12:00', sleepOnsetMinutes: 14 });
    const options = result.recommendedBedtimes as { cycles: number; totalSleepHours: number }[];
    expect(options.length).toBe(5);
  });

  it('returns summary array', () => {
    const result = calculateSleepCycle({ targetWakeTime: '07:00', sleepOnsetMinutes: 14 });
    expect(Array.isArray(result.summary)).toBe(true);
    expect((result.summary as unknown[]).length).toBe(5);
  });

  it('handles missing inputs gracefully', () => {
    const result = calculateSleepCycle({});
    expect(typeof result.optimalBedtime).toBe('string');
    expect(typeof result.optimalCycles).toBe('number');
  });
});
