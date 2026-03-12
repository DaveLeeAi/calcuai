import { calculateCentralTendency, parseDataSet } from '@/lib/formulas/math/central-tendency';

// ═══════════════════════════════════════════════════════
// Main calculateCentralTendency tests
// ═══════════════════════════════════════════════════════

describe('calculateCentralTendency', () => {
  // ─── Test 1: Basic odd-count data set ───
  it('computes mean, median, and mode for {3, 7, 7, 2, 9}', () => {
    const result = calculateCentralTendency({ dataSet: '3, 7, 7, 2, 9' });
    expect(result.mean).toBeCloseTo(5.6, 4);
    expect(result.median).toBe(7);
    expect(result.mode).toBe('7');
    expect(result.count).toBe(5);
    expect(result.sum).toBeCloseTo(28, 4);
    expect(result.range).toBeCloseTo(7, 4);
    expect(result.min).toBe(2);
    expect(result.max).toBe(9);
  });

  // ─── Test 2: Single value ───
  it('handles a single value correctly', () => {
    const result = calculateCentralTendency({ dataSet: '42' });
    expect(result.mean).toBe(42);
    expect(result.median).toBe(42);
    expect(result.mode).toBe('No mode');
    expect(result.count).toBe(1);
    expect(result.sum).toBe(42);
    expect(result.range).toBe(0);
  });

  // ─── Test 3: All same values ───
  it('handles all identical values {5, 5, 5, 5}', () => {
    const result = calculateCentralTendency({ dataSet: '5, 5, 5, 5' });
    expect(result.mean).toBe(5);
    expect(result.median).toBe(5);
    expect(result.mode).toBe('5');
    expect(result.count).toBe(4);
    expect(result.range).toBe(0);
  });

  // ─── Test 4: Even count — median is average of two middle values ───
  it('computes median for even-count data {2, 4, 6, 8}', () => {
    const result = calculateCentralTendency({ dataSet: '2, 4, 6, 8' });
    expect(result.mean).toBe(5);
    expect(result.median).toBe(5); // (4 + 6) / 2
    expect(result.mode).toBe('No mode');
    expect(result.count).toBe(4);
  });

  // ─── Test 5: Odd count — median is exact middle value ───
  it('computes median for odd-count data {1, 3, 5, 7, 9}', () => {
    const result = calculateCentralTendency({ dataSet: '1, 3, 5, 7, 9' });
    expect(result.mean).toBe(5);
    expect(result.median).toBe(5);
  });

  // ─── Test 6: No mode — all values unique ───
  it('returns "No mode" when all values are unique', () => {
    const result = calculateCentralTendency({ dataSet: '1, 2, 3, 4, 5' });
    expect(result.mode).toBe('No mode');
  });

  // ─── Test 7: Bimodal data set ───
  it('identifies bimodal data {1, 2, 2, 3, 3, 4}', () => {
    const result = calculateCentralTendency({ dataSet: '1, 2, 2, 3, 3, 4' });
    expect(result.mode).toBe('2, 3');
  });

  // ─── Test 8: Multimodal data set ───
  it('identifies multimodal data {1, 1, 2, 2, 3, 3, 4}', () => {
    const result = calculateCentralTendency({ dataSet: '1, 1, 2, 2, 3, 3, 4' });
    expect(result.mode).toBe('1, 2, 3');
  });

  // ─── Test 9: All values appear equally (frequency > 1) — no mode ───
  it('returns "No mode" when all values have equal frequency > 1: {1,1,2,2,3,3}', () => {
    const result = calculateCentralTendency({ dataSet: '1, 1, 2, 2, 3, 3' });
    expect(result.mode).toBe('No mode');
  });

  // ─── Test 10: Negative numbers ───
  it('handles negative numbers correctly', () => {
    const result = calculateCentralTendency({ dataSet: '-5, -3, -1, 0, 2' });
    expect(result.mean).toBeCloseTo(-1.4, 4);
    expect(result.median).toBe(-1);
    expect(result.min).toBe(-5);
    expect(result.max).toBe(2);
    expect(result.range).toBeCloseTo(7, 4);
  });

  // ─── Test 11: Decimal values ───
  it('handles decimal values correctly', () => {
    const result = calculateCentralTendency({ dataSet: '1.5, 2.5, 3.5, 4.5' });
    expect(result.mean).toBeCloseTo(3, 4);
    expect(result.median).toBeCloseTo(3, 4); // (2.5 + 3.5) / 2
    expect(result.range).toBeCloseTo(3, 4);
  });

  // ─── Test 12: Empty data set ───
  it('returns zeros for empty data set', () => {
    const result = calculateCentralTendency({ dataSet: '' });
    expect(result.mean).toBe(0);
    expect(result.median).toBe(0);
    expect(result.mode).toBe('No data');
    expect(result.count).toBe(0);
    expect(result.sum).toBe(0);
    expect(result.range).toBe(0);
  });

  // ─── Test 13: Large data set ───
  it('handles a large data set correctly', () => {
    const result = calculateCentralTendency({
      dataSet: '10, 20, 30, 40, 50, 60, 70, 80, 90, 100',
    });
    expect(result.mean).toBeCloseTo(55, 4);
    expect(result.median).toBeCloseTo(55, 4); // (50 + 60) / 2
    expect(result.count).toBe(10);
    expect(result.sum).toBeCloseTo(550, 4);
    expect(result.min).toBe(10);
    expect(result.max).toBe(100);
    expect(result.range).toBeCloseTo(90, 4);
  });

  // ─── Test 14: Two values ───
  it('handles exactly two values', () => {
    const result = calculateCentralTendency({ dataSet: '3, 7' });
    expect(result.mean).toBe(5);
    expect(result.median).toBe(5); // (3 + 7) / 2
    expect(result.mode).toBe('No mode');
    expect(result.count).toBe(2);
  });

  // ─── Test 15: Sorted data output ───
  it('returns sorted data as a comma-separated string', () => {
    const result = calculateCentralTendency({ dataSet: '9, 2, 7, 3, 7' });
    expect(result.sortedData).toBe('2, 3, 7, 7, 9');
  });

  // ─── Test 16: Non-numeric values are filtered ───
  it('filters out non-numeric entries', () => {
    const result = calculateCentralTendency({ dataSet: '2, abc, 4, , 6' });
    expect(result.count).toBe(3);
    expect(result.mean).toBeCloseTo(4, 4);
    expect(result.median).toBe(4);
  });

  // ─── Test 17: Single mode amid unique values ───
  it('identifies single mode when one value repeats', () => {
    const result = calculateCentralTendency({ dataSet: '1, 2, 3, 3, 4, 5' });
    expect(result.mode).toBe('3');
  });
});

// ═══════════════════════════════════════════════════════
// parseDataSet utility tests
// ═══════════════════════════════════════════════════════

describe('parseDataSet (central-tendency)', () => {
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
