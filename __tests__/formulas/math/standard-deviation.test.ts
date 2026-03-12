import { calculateStandardDeviation, parseDataSet } from '@/lib/formulas/math/standard-deviation';

describe('calculateStandardDeviation', () => {
  // ─── Test 1: Classic textbook data set — population σ ───
  it('calculates population standard deviation for {2,4,4,4,5,5,7,9}', () => {
    const result = calculateStandardDeviation({
      dataSet: '2, 4, 4, 4, 5, 5, 7, 9',
      calculationType: 'population',
    });
    // Population σ = 2.0 exactly
    expect(result.standardDeviation).toBeCloseTo(2.0, 4);
    expect(result.mean).toBeCloseTo(5.0, 4);
    expect(result.variance).toBeCloseTo(4.0, 4);
    expect(result.count).toBe(8);
    expect(result.sum).toBeCloseTo(40, 4);
  });

  // ─── Test 2: Same data set — sample s ───
  it('calculates sample standard deviation for {2,4,4,4,5,5,7,9}', () => {
    const result = calculateStandardDeviation({
      dataSet: '2, 4, 4, 4, 5, 5, 7, 9',
      calculationType: 'sample',
    });
    // Sample s = √(32/7) ≈ 2.13809
    expect(result.standardDeviation).toBeCloseTo(2.13809, 4);
    expect(result.variance).toBeCloseTo(4.57143, 4);
  });

  // ─── Test 3: Single value — σ = 0 ───
  it('returns zero standard deviation for a single value', () => {
    const result = calculateStandardDeviation({
      dataSet: '42',
      calculationType: 'population',
    });
    expect(result.standardDeviation).toBe(0);
    expect(result.variance).toBe(0);
    expect(result.mean).toBe(42);
    expect(result.count).toBe(1);
    expect(result.range).toBe(0);
  });

  // ─── Test 4: Single value — sample also 0 ───
  it('returns zero sample standard deviation for a single value (no division by zero)', () => {
    const result = calculateStandardDeviation({
      dataSet: '10',
      calculationType: 'sample',
    });
    expect(result.standardDeviation).toBe(0);
    expect(result.variance).toBe(0);
  });

  // ─── Test 5: Two values — population σ ───
  it('calculates population SD for two values {3, 7}', () => {
    const result = calculateStandardDeviation({
      dataSet: '3, 7',
      calculationType: 'population',
    });
    // Mean = 5, deviations = -2, 2, sum of squares = 8, variance = 4, σ = 2
    expect(result.standardDeviation).toBeCloseTo(2.0, 4);
    expect(result.mean).toBeCloseTo(5.0, 4);
    expect(result.variance).toBeCloseTo(4.0, 4);
  });

  // ─── Test 6: Two values — sample s ───
  it('calculates sample SD for two values {3, 7}', () => {
    const result = calculateStandardDeviation({
      dataSet: '3, 7',
      calculationType: 'sample',
    });
    // Sample variance = 8/1 = 8, s = √8 ≈ 2.82843
    expect(result.standardDeviation).toBeCloseTo(2.82843, 4);
    expect(result.variance).toBeCloseTo(8.0, 4);
  });

  // ─── Test 7: All same values — σ = 0 ───
  it('returns zero for all identical values {5, 5, 5, 5}', () => {
    const result = calculateStandardDeviation({
      dataSet: '5, 5, 5, 5',
      calculationType: 'population',
    });
    expect(result.standardDeviation).toBe(0);
    expect(result.variance).toBe(0);
    expect(result.mean).toBe(5);
    expect(result.range).toBe(0);
  });

  // ─── Test 8: All same values — sample s = 0 ───
  it('returns zero sample SD for all identical values', () => {
    const result = calculateStandardDeviation({
      dataSet: '5, 5, 5, 5',
      calculationType: 'sample',
    });
    expect(result.standardDeviation).toBe(0);
    expect(result.variance).toBe(0);
  });

  // ─── Test 9: Negative values included ───
  it('handles negative values correctly', () => {
    const result = calculateStandardDeviation({
      dataSet: '-3, -1, 0, 1, 3',
      calculationType: 'population',
    });
    // Mean = 0, sum of squares = 9+1+0+1+9 = 20, variance = 4, σ = 2
    expect(result.mean).toBeCloseTo(0, 4);
    expect(result.variance).toBeCloseTo(4.0, 4);
    expect(result.standardDeviation).toBeCloseTo(2.0, 4);
    expect(result.range).toBeCloseTo(6.0, 4);
  });

  // ─── Test 10: Decimal values ───
  it('handles decimal values correctly', () => {
    const result = calculateStandardDeviation({
      dataSet: '1.5, 2.5, 3.5, 4.5, 5.5',
      calculationType: 'population',
    });
    // Mean = 3.5, deviations = -2,-1,0,1,2, sum of sq = 10, variance = 2, σ ≈ 1.41421
    expect(result.mean).toBeCloseTo(3.5, 4);
    expect(result.variance).toBeCloseTo(2.0, 4);
    expect(result.standardDeviation).toBeCloseTo(1.41421, 4);
  });

  // ─── Test 11: Mean calculation correctness ───
  it('calculates mean correctly for {10, 20, 30, 40, 50}', () => {
    const result = calculateStandardDeviation({
      dataSet: '10, 20, 30, 40, 50',
      calculationType: 'population',
    });
    expect(result.mean).toBeCloseTo(30, 4);
    expect(result.sum).toBeCloseTo(150, 4);
    expect(result.count).toBe(5);
  });

  // ─── Test 12: Range calculation ───
  it('calculates range correctly', () => {
    const result = calculateStandardDeviation({
      dataSet: '3, 1, 9, 2, 7',
      calculationType: 'sample',
    });
    expect(result.range).toBeCloseTo(8, 4); // 9 - 1 = 8
  });

  // ─── Test 13: Step-by-step table has correct number of rows ───
  it('generates step-by-step table with one row per data point', () => {
    const result = calculateStandardDeviation({
      dataSet: '10, 20, 30, 40, 50, 60',
      calculationType: 'sample',
    });
    const table = result.stepByStep as Array<{ value: number }>;
    expect(table).toHaveLength(6);
  });

  // ─── Test 14: Sum calculation ───
  it('calculates sum correctly for mixed values', () => {
    const result = calculateStandardDeviation({
      dataSet: '1, 2, 3, 4, 5, 6, 7, 8, 9, 10',
      calculationType: 'population',
    });
    expect(result.sum).toBeCloseTo(55, 4);
    expect(result.count).toBe(10);
    expect(result.mean).toBeCloseTo(5.5, 4);
  });

  // ─── Test 15: Large numbers ───
  it('handles very large numbers correctly', () => {
    const result = calculateStandardDeviation({
      dataSet: '1000000, 1000001, 1000002, 1000003, 1000004',
      calculationType: 'population',
    });
    // Same spread as 0,1,2,3,4 → mean = 1000002, variance = 2, σ ≈ 1.41421
    expect(result.mean).toBeCloseTo(1000002, 4);
    expect(result.standardDeviation).toBeCloseTo(1.41421, 4);
  });

  // ─── Test 16: Very small differences ───
  it('handles very small differences between values', () => {
    const result = calculateStandardDeviation({
      dataSet: '0.001, 0.002, 0.003, 0.004, 0.005',
      calculationType: 'population',
    });
    // Mean = 0.003, same proportional spread as 1,2,3,4,5 scaled by 0.001
    expect(result.mean).toBeCloseTo(0.003, 6);
    expect(result.standardDeviation).toBeCloseTo(0.001414, 4);
  });

  // ─── Test 17: Empty data set ───
  it('returns zeros for empty data set', () => {
    const result = calculateStandardDeviation({
      dataSet: '',
      calculationType: 'sample',
    });
    expect(result.standardDeviation).toBe(0);
    expect(result.variance).toBe(0);
    expect(result.mean).toBe(0);
    expect(result.count).toBe(0);
    expect(result.sum).toBe(0);
    expect(result.range).toBe(0);
    const table = result.stepByStep as Array<unknown>;
    expect(table).toHaveLength(0);
  });

  // ─── Test 18: Larger known data set — sample SD ───
  it('calculates sample SD for a 10-element data set', () => {
    const result = calculateStandardDeviation({
      dataSet: '6, 2, 3, 1, 7, 8, 4, 5, 9, 10',
      calculationType: 'sample',
    });
    // Mean = 5.5, sum of squared deviations = 82.5, sample variance = 82.5/9 ≈ 9.16667
    // Sample SD ≈ 3.02765
    expect(result.mean).toBeCloseTo(5.5, 4);
    expect(result.variance).toBeCloseTo(9.16667, 3);
    expect(result.standardDeviation).toBeCloseTo(3.02765, 3);
  });

  // ─── Test 19: Non-numeric values are filtered out ───
  it('filters out non-numeric entries from the data set', () => {
    const result = calculateStandardDeviation({
      dataSet: '2, abc, 4, , 6, xyz',
      calculationType: 'population',
    });
    // Only parses [2, 4, 6]: mean = 4, variance = (4+0+4)/3 ≈ 2.66667, σ ≈ 1.63299
    expect(result.count).toBe(3);
    expect(result.mean).toBeCloseTo(4, 4);
    expect(result.standardDeviation).toBeCloseTo(1.63299, 4);
  });

  // ─── Test 20: Deviation table values are correct ───
  it('produces correct deviation values in step-by-step table', () => {
    const result = calculateStandardDeviation({
      dataSet: '2, 4, 6',
      calculationType: 'population',
    });
    // Mean = 4. Deviations: -2, 0, 2. Squared: 4, 0, 4
    const table = result.stepByStep as Array<{
      value: number;
      deviation: number;
      deviationSquared: number;
    }>;
    expect(table[0].value).toBeCloseTo(2, 4);
    expect(table[0].deviation).toBeCloseTo(-2, 4);
    expect(table[0].deviationSquared).toBeCloseTo(4, 4);
    expect(table[1].value).toBeCloseTo(4, 4);
    expect(table[1].deviation).toBeCloseTo(0, 4);
    expect(table[1].deviationSquared).toBeCloseTo(0, 4);
    expect(table[2].value).toBeCloseTo(6, 4);
    expect(table[2].deviation).toBeCloseTo(2, 4);
    expect(table[2].deviationSquared).toBeCloseTo(4, 4);
  });
});

describe('parseDataSet', () => {
  it('parses comma-separated numbers', () => {
    expect(parseDataSet('1, 2, 3')).toEqual([1, 2, 3]);
  });

  it('handles extra whitespace', () => {
    expect(parseDataSet('  1 ,  2 ,  3  ')).toEqual([1, 2, 3]);
  });

  it('filters out empty strings', () => {
    expect(parseDataSet('1,, 2,,3,')).toEqual([1, 2, 3]);
  });

  it('filters out non-numeric values', () => {
    expect(parseDataSet('1, abc, 2, def, 3')).toEqual([1, 2, 3]);
  });

  it('returns empty array for empty string', () => {
    expect(parseDataSet('')).toEqual([]);
  });

  it('handles negative and decimal numbers', () => {
    expect(parseDataSet('-3.5, 0, 2.7')).toEqual([-3.5, 0, 2.7]);
  });
});
