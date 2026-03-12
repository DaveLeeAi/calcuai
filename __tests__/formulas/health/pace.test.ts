import { calculatePace } from '@/lib/formulas/health/pace';

describe('calculatePace', () => {
  // === FIND PACE TESTS ===

  it('calculates pace for 5K in 25:00 (miles)', () => {
    // 5K = 3.10686 miles, 25:00 = 1500 seconds
    // Pace = 1500 / 3.10686 = ~482.8 sec/mile = ~8:03/mile
    const result = calculatePace({
      calculationMode: 'findPace',
      distance: 3.10686,
      distanceUnit: 'miles',
      hours: 0,
      minutes: 25,
      seconds: 0,
    });
    expect(result.pacePerMile).toBeCloseTo(482.8, 0);
    expect(result.pacePerMileFormatted).toBe('8:03 min/mile');
  });

  it('calculates pace for marathon in 4:00:00', () => {
    // Marathon = 26.2188 miles, 4:00:00 = 14400 seconds
    // Pace = 14400 / 26.2188 = ~549.2 sec/mile = ~9:09/mile
    const result = calculatePace({
      calculationMode: 'findPace',
      distance: 26.2188,
      distanceUnit: 'miles',
      hours: 4,
      minutes: 0,
      seconds: 0,
    });
    expect(result.pacePerMile).toBeCloseTo(549.2, 0);
    expect(result.pacePerMileFormatted).toBe('9:09 min/mile');
  });

  it('calculates pace for 1 mile in 6:00', () => {
    const result = calculatePace({
      calculationMode: 'findPace',
      distance: 1,
      distanceUnit: 'miles',
      hours: 0,
      minutes: 6,
      seconds: 0,
    });
    expect(result.pacePerMile).toBeCloseTo(360, 1);
    expect(result.pacePerMileFormatted).toBe('6:00 min/mile');
  });

  it('calculates pace in km when distance unit is kilometers', () => {
    // 5 km in 25:00 = 1500 / 5 = 300 sec/km = 5:00/km
    const result = calculatePace({
      calculationMode: 'findPace',
      distance: 5,
      distanceUnit: 'kilometers',
      hours: 0,
      minutes: 25,
      seconds: 0,
    });
    expect(result.pacePerKm).toBeCloseTo(300, 1);
    expect(result.pacePerKmFormatted).toBe('5:00 min/km');
  });

  // === FIND TIME TESTS ===

  it('calculates finish time for 10K at 8:00 min/mile', () => {
    // 10K = 6.21371 miles, pace = 8:00/mile = 480 sec/mile
    // Time = 480 * 6.21371 = 2982.58 seconds = ~49:43
    const result = calculatePace({
      calculationMode: 'findTime',
      distance: 6.21371,
      distanceUnit: 'miles',
      paceMinutes: 8,
      paceSeconds: 0,
      paceUnit: 'min/mile',
    });
    expect(result.finishTimeSeconds).toBeCloseTo(2982.6, 0);
    expect(result.finishTime).toBe('49:43');
  });

  it('calculates finish time for half marathon at 9:00 min/mile', () => {
    // Half marathon = 13.1094 miles, pace = 9:00/mile = 540 sec/mile
    // Time = 540 * 13.1094 = 7079.08 seconds = ~1:57:59
    const result = calculatePace({
      calculationMode: 'findTime',
      distance: 13.1094,
      distanceUnit: 'miles',
      paceMinutes: 9,
      paceSeconds: 0,
      paceUnit: 'min/mile',
    });
    expect(result.finishTimeSeconds).toBeCloseTo(7079.1, 0);
    expect(result.finishTime).toBe('1:57:59');
  });

  // === FIND DISTANCE TESTS ===

  it('calculates distance for 30 minutes at 8:00/mile', () => {
    // 30 min = 1800 seconds, pace = 480 sec/mile
    // Distance = 1800 / 480 = 3.75 miles
    const result = calculatePace({
      calculationMode: 'findDistance',
      distanceUnit: 'miles',
      hours: 0,
      minutes: 30,
      seconds: 0,
      paceMinutes: 8,
      paceSeconds: 0,
      paceUnit: 'min/mile',
    });
    expect(result.distance).toBeCloseTo(3.75, 2);
  });

  it('calculates distance in km for 60 minutes at 5:00/km', () => {
    // 60 min = 3600 seconds, pace = 300 sec/km
    // Distance = 3600 / 300 = 12 km
    const result = calculatePace({
      calculationMode: 'findDistance',
      distanceUnit: 'kilometers',
      hours: 1,
      minutes: 0,
      seconds: 0,
      paceMinutes: 5,
      paceSeconds: 0,
      paceUnit: 'min/km',
    });
    expect(result.distance).toBeCloseTo(12, 2);
  });

  // === CONVERSION TESTS ===

  it('converts 8:00 min/mile to approximately 4:58 min/km', () => {
    const result = calculatePace({
      calculationMode: 'findPace',
      distance: 1,
      distanceUnit: 'miles',
      hours: 0,
      minutes: 8,
      seconds: 0,
    });
    // 480 sec/mile / 1.60934 = ~298.26 sec/km = ~4:58/km
    expect(result.pacePerKm).toBeCloseTo(298.3, 0);
    expect(result.pacePerKmFormatted).toBe('4:58 min/km');
  });

  // === SPEED TESTS ===

  it('calculates speed as 7.5 mph for 8:00/mile pace', () => {
    const result = calculatePace({
      calculationMode: 'findPace',
      distance: 1,
      distanceUnit: 'miles',
      hours: 0,
      minutes: 8,
      seconds: 0,
    });
    // Speed = 3600 / 480 = 7.5 mph
    expect(result.speedMph).toBeCloseTo(7.5, 2);
    // 3600 / 298.26 = ~12.07 kph
    expect(result.speedKph).toBeCloseTo(12.07, 1);
  });

  // === SPLIT TIMES TESTS ===

  it('generates 6 split times for common race distances', () => {
    const result = calculatePace({
      calculationMode: 'findPace',
      distance: 1,
      distanceUnit: 'miles',
      hours: 0,
      minutes: 8,
      seconds: 0,
    });
    expect(result.splitTimes.length).toBe(6);
    expect(result.splitTimes[0].raceName).toBe('1 Mile');
    expect(result.splitTimes[5].raceName).toBe('Marathon');
  });

  it('calculates correct 5K split at 8:00/mile pace', () => {
    const result = calculatePace({
      calculationMode: 'findPace',
      distance: 1,
      distanceUnit: 'miles',
      hours: 0,
      minutes: 8,
      seconds: 0,
    });
    // 5K = 3.10686 miles * 480 sec = 1491.29 sec = ~24:51
    const fiveK = result.splitTimes.find(s => s.raceName === '5K');
    expect(fiveK).toBeDefined();
    expect(fiveK!.finishTimeSeconds).toBeCloseTo(1491.3, 0);
    expect(fiveK!.finishTime).toBe('24:51');
  });

  it('calculates correct marathon split at 8:00/mile pace', () => {
    const result = calculatePace({
      calculationMode: 'findPace',
      distance: 1,
      distanceUnit: 'miles',
      hours: 0,
      minutes: 8,
      seconds: 0,
    });
    // Marathon = 26.2188 miles * 480 sec = 12585.02 sec = ~3:29:45
    const marathon = result.splitTimes.find(s => s.raceName === 'Marathon');
    expect(marathon).toBeDefined();
    expect(marathon!.finishTimeSeconds).toBeCloseTo(12585, 1);
    expect(marathon!.finishTime).toBe('3:29:45');
  });

  // === EDGE CASES ===

  it('handles very fast pace (4:00/mile)', () => {
    const result = calculatePace({
      calculationMode: 'findPace',
      distance: 1,
      distanceUnit: 'miles',
      hours: 0,
      minutes: 4,
      seconds: 0,
    });
    expect(result.pacePerMile).toBeCloseTo(240, 1);
    expect(result.speedMph).toBeCloseTo(15, 1);
  });

  it('handles very slow pace (15:00/mile)', () => {
    const result = calculatePace({
      calculationMode: 'findPace',
      distance: 1,
      distanceUnit: 'miles',
      hours: 0,
      minutes: 15,
      seconds: 0,
    });
    expect(result.pacePerMile).toBeCloseTo(900, 1);
    expect(result.speedMph).toBeCloseTo(4, 1);
  });

  it('throws error for zero distance in findPace mode', () => {
    expect(() => {
      calculatePace({
        calculationMode: 'findPace',
        distance: 0,
        distanceUnit: 'miles',
        hours: 0,
        minutes: 25,
        seconds: 0,
      });
    }).toThrow('Distance must be greater than zero');
  });

  it('throws error for zero pace in findTime mode', () => {
    expect(() => {
      calculatePace({
        calculationMode: 'findTime',
        distance: 5,
        distanceUnit: 'miles',
        paceMinutes: 0,
        paceSeconds: 0,
        paceUnit: 'min/mile',
      });
    }).toThrow('Pace must be greater than zero');
  });
});
