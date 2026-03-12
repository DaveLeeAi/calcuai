import { calculateOneRepMax } from '@/lib/formulas/health/one-rep-max';

describe('calculateOneRepMax', () => {
  // Case 1: 135 lbs × 5 reps
  it('calculates 1RM for 135 lbs × 5 reps', () => {
    const result = calculateOneRepMax({ weight: 135, reps: 5, weightUnit: 'lbs' });
    // Epley: 135 × (1 + 5/30) = 135 × 1.1667 = 157.5
    expect(result.epley1RM).toBeCloseTo(157.5, 1);
    // Brzycki: 135 × (36 / 32) = 135 × 1.125 = 151.875
    expect(result.brzycki1RM).toBeCloseTo(151.9, 1);
  });

  // Case 2: 225 lbs × 3 reps
  it('calculates 1RM for 225 lbs × 3 reps', () => {
    const result = calculateOneRepMax({ weight: 225, reps: 3, weightUnit: 'lbs' });
    // Epley: 225 × (1 + 3/30) = 225 × 1.1 = 247.5
    expect(result.epley1RM).toBeCloseTo(247.5, 1);
    // Brzycki: 225 × (36 / 34) = 225 × 1.0588 = 238.2
    expect(result.brzycki1RM).toBeCloseTo(238.2, 1);
  });

  // Case 3: 315 lbs × 1 rep (special case)
  it('returns weight itself when reps = 1', () => {
    const result = calculateOneRepMax({ weight: 315, reps: 1, weightUnit: 'lbs' });
    expect(result.epley1RM).toBe(315);
    expect(result.brzycki1RM).toBe(315);
    expect(result.average1RM).toBe(315);
  });

  // Case 4: 100 kg × 10 reps
  it('calculates 1RM for 100 kg × 10 reps', () => {
    const result = calculateOneRepMax({ weight: 100, reps: 10, weightUnit: 'kg' });
    // Epley: 100 × (1 + 10/30) = 100 × 1.3333 = 133.3
    expect(result.epley1RM).toBeCloseTo(133.3, 1);
    // Brzycki: 100 × (36 / 27) = 100 × 1.3333 = 133.3
    expect(result.brzycki1RM).toBeCloseTo(133.3, 1);
  });

  // Case 5: 185 lbs × 8 reps
  it('calculates 1RM for 185 lbs × 8 reps', () => {
    const result = calculateOneRepMax({ weight: 185, reps: 8, weightUnit: 'lbs' });
    // Epley: 185 × (1 + 8/30) = 185 × 1.2667 = 234.3
    expect(result.epley1RM).toBeCloseTo(234.3, 0);
    // Brzycki: 185 × (36 / 29) = 185 × 1.2414 = 229.7
    expect(result.brzycki1RM).toBeCloseTo(229.7, 0);
  });

  // Case 6: Edge — high reps (15)
  it('handles high rep count (15 reps)', () => {
    const result = calculateOneRepMax({ weight: 100, reps: 15, weightUnit: 'lbs' });
    // Epley: 100 × (1 + 15/30) = 100 × 1.5 = 150
    expect(result.epley1RM).toBeCloseTo(150, 1);
    // Brzycki: 100 × (36 / 22) = 100 × 1.6364 = 163.6
    expect(result.brzycki1RM).toBeCloseTo(163.6, 0);
  });

  // Case 7: Edge — high reps (20)
  it('handles very high rep count (20 reps)', () => {
    const result = calculateOneRepMax({ weight: 80, reps: 20, weightUnit: 'kg' });
    // Epley: 80 × (1 + 20/30) = 80 × 1.6667 = 133.3
    expect(result.epley1RM).toBeCloseTo(133.3, 0);
    // Brzycki: 80 × (36 / 17) = 80 × 2.1176 = 169.4
    expect(result.brzycki1RM).toBeCloseTo(169.4, 0);
  });

  // Percentage chart has 9 entries
  it('produces percentage chart with 9 entries', () => {
    const result = calculateOneRepMax({ weight: 135, reps: 5, weightUnit: 'lbs' });
    expect(result.percentageChart).toHaveLength(9);
    expect(result.percentageChart[0].percentage).toBe(100);
    expect(result.percentageChart[8].percentage).toBe(60);
  });

  // Average is mean of both formulas
  it('calculates average as mean of Epley and Brzycki', () => {
    const result = calculateOneRepMax({ weight: 135, reps: 5, weightUnit: 'lbs' });
    const expectedAverage = (result.epley1RM + result.brzycki1RM) / 2;
    expect(result.average1RM).toBeCloseTo(expectedAverage, 1);
  });

  // Weight unit is passed through
  it('passes through weight unit in output', () => {
    const resultLbs = calculateOneRepMax({ weight: 135, reps: 5, weightUnit: 'lbs' });
    expect(resultLbs.weightUnit).toBe('lbs');

    const resultKg = calculateOneRepMax({ weight: 60, reps: 5, weightUnit: 'kg' });
    expect(resultKg.weightUnit).toBe('kg');
  });

  // Percentage chart 100% entry equals average 1RM
  it('has 100% chart entry weight equal to average 1RM', () => {
    const result = calculateOneRepMax({ weight: 200, reps: 5, weightUnit: 'lbs' });
    expect(result.percentageChart[0].weight).toBeCloseTo(result.average1RM, 1);
    expect(result.percentageChart[0].estimatedReps).toBe(1);
  });

  // Percentage chart weights decrease
  it('has decreasing weights in percentage chart', () => {
    const result = calculateOneRepMax({ weight: 185, reps: 8, weightUnit: 'lbs' });
    for (let i = 0; i < result.percentageChart.length - 1; i++) {
      expect(result.percentageChart[i].weight).toBeGreaterThan(
        result.percentageChart[i + 1].weight
      );
    }
  });
});
