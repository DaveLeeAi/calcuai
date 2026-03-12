import { calculateSignificantFigures } from '@/lib/formulas/math/significant-figures';

describe('calculateSignificantFigures', () => {
  // ═══════════════════════════════════════════════════════
  // Basic sig fig counting
  // ═══════════════════════════════════════════════════════

  it('counts sig figs in 1234 → 4', () => {
    const result = calculateSignificantFigures({ number: '1234', mode: 'count' });
    expect(result.significantFigures).toBe(4);
  });

  it('counts sig figs in 1200 → 2 (trailing zeros in whole number, no decimal)', () => {
    const result = calculateSignificantFigures({ number: '1200', mode: 'count' });
    expect(result.significantFigures).toBe(2);
  });

  it('counts sig figs in 1200. → 4 (trailing decimal point indicates significance)', () => {
    const result = calculateSignificantFigures({ number: '1200.', mode: 'count' });
    expect(result.significantFigures).toBe(4);
  });

  it('counts sig figs in 0.0045 → 2 (leading zeros not significant)', () => {
    const result = calculateSignificantFigures({ number: '0.0045', mode: 'count' });
    expect(result.significantFigures).toBe(2);
  });

  it('counts sig figs in 0.00450 → 3 (trailing zero after decimal IS significant)', () => {
    const result = calculateSignificantFigures({ number: '0.00450', mode: 'count' });
    expect(result.significantFigures).toBe(3);
  });

  it('counts sig figs in 100.10 → 5 (zeros between and trailing are significant)', () => {
    const result = calculateSignificantFigures({ number: '100.10', mode: 'count' });
    expect(result.significantFigures).toBe(5);
  });

  it('counts sig figs in 5.00 → 3', () => {
    const result = calculateSignificantFigures({ number: '5.00', mode: 'count' });
    expect(result.significantFigures).toBe(3);
  });

  it('counts sig figs in 10203 → 5 (zeros between non-zeros are significant)', () => {
    const result = calculateSignificantFigures({ number: '10203', mode: 'count' });
    expect(result.significantFigures).toBe(5);
  });

  // ═══════════════════════════════════════════════════════
  // Special cases
  // ═══════════════════════════════════════════════════════

  it('counts sig figs in 0 → 1', () => {
    const result = calculateSignificantFigures({ number: '0', mode: 'count' });
    expect(result.significantFigures).toBe(1);
  });

  it('handles negative numbers: -45.30 → 4', () => {
    const result = calculateSignificantFigures({ number: '-45.30', mode: 'count' });
    expect(result.significantFigures).toBe(4);
  });

  it('handles scientific notation input: 3.00e5 → 3', () => {
    const result = calculateSignificantFigures({ number: '3.00e5', mode: 'count' });
    expect(result.significantFigures).toBe(3);
  });

  it('handles commas: 1,234,567 → 7', () => {
    const result = calculateSignificantFigures({ number: '1,234,567', mode: 'count' });
    expect(result.significantFigures).toBe(7);
  });

  // ═══════════════════════════════════════════════════════
  // Rounding mode
  // ═══════════════════════════════════════════════════════

  it('rounds 12345 to 3 sig figs → 12300', () => {
    const result = calculateSignificantFigures({ number: '12345', mode: 'round', roundTo: 3 });
    expect(result.roundedValue).toBe('12300');
  });

  it('rounds 0.004567 to 2 sig figs → 0.0046', () => {
    const result = calculateSignificantFigures({ number: '0.004567', mode: 'round', roundTo: 2 });
    expect(result.roundedValue).toBe('0.0046');
  });

  it('rounds 9876 to 1 sig fig → 10000', () => {
    const result = calculateSignificantFigures({ number: '9876', mode: 'round', roundTo: 1 });
    expect(result.roundedValue).toBe('10000');
  });

  it('rounds 3.14159 to 4 sig figs → 3.142', () => {
    const result = calculateSignificantFigures({ number: '3.14159', mode: 'round', roundTo: 4 });
    expect(result.roundedValue).toBe('3.142');
  });

  // ═══════════════════════════════════════════════════════
  // Scientific notation output
  // ═══════════════════════════════════════════════════════

  it('converts 45600 to scientific notation', () => {
    const result = calculateSignificantFigures({ number: '45600', mode: 'count' });
    expect(result.scientificNotation).toContain('10^');
  });

  it('count mode returns null roundedValue', () => {
    const result = calculateSignificantFigures({ number: '123', mode: 'count' });
    expect(result.roundedValue).toBeNull();
  });

  // ═══════════════════════════════════════════════════════
  // Invalid input
  // ═══════════════════════════════════════════════════════

  it('returns error for non-numeric input', () => {
    const result = calculateSignificantFigures({ number: 'abc', mode: 'count' });
    expect(result.significantFigures).toBe(0);
    expect(result.error).toBeDefined();
  });
});
