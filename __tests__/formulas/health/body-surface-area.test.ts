import { calculateBodySurfaceArea, calculateBodySurfaceAreaFromInputs } from '@/lib/formulas/health/body-surface-area';

describe('calculateBodySurfaceArea', () => {
  // ─── DuBois & DuBois formula tests ───

  it('calculates DuBois BSA for average adult (70 kg, 170 cm)', () => {
    const result = calculateBodySurfaceArea({ weight: 70, height: 170, unitSystem: 'metric' });
    // 0.007184 × 70^0.425 × 170^0.725 ≈ 1.8097
    expect(result.duboisBSA).toBeCloseTo(1.8097, 2);
  });

  it('calculates DuBois BSA for small person (50 kg, 150 cm)', () => {
    const result = calculateBodySurfaceArea({ weight: 50, height: 150, unitSystem: 'metric' });
    // 0.007184 × 50^0.425 × 150^0.725 ≈ 1.4325
    expect(result.duboisBSA).toBeCloseTo(1.4325, 2);
  });

  it('calculates DuBois BSA for large person (120 kg, 190 cm)', () => {
    const result = calculateBodySurfaceArea({ weight: 120, height: 190, unitSystem: 'metric' });
    // 0.007184 × 120^0.425 × 190^0.725 ≈ 2.4667
    expect(result.duboisBSA).toBeCloseTo(2.4667, 2);
  });

  it('calculates DuBois BSA for child (20 kg, 110 cm)', () => {
    const result = calculateBodySurfaceArea({ weight: 20, height: 110, unitSystem: 'metric' });
    // 0.007184 × 20^0.425 × 110^0.725 ≈ 0.7750
    expect(result.duboisBSA).toBeCloseTo(0.7750, 2);
  });

  // ─── Mosteller formula tests ───

  it('calculates Mosteller BSA for average adult (70 kg, 170 cm)', () => {
    const result = calculateBodySurfaceArea({ weight: 70, height: 170, unitSystem: 'metric' });
    // √(70 × 170 / 3600) = √(3.3056) ≈ 1.8181
    expect(result.mostellerBSA).toBeCloseTo(1.8181, 2);
  });

  it('calculates Mosteller BSA for small person (50 kg, 150 cm)', () => {
    const result = calculateBodySurfaceArea({ weight: 50, height: 150, unitSystem: 'metric' });
    // √(50 × 150 / 3600) = √(2.0833) ≈ 1.4434
    expect(result.mostellerBSA).toBeCloseTo(1.4434, 2);
  });

  // ─── Haycock formula tests ───

  it('calculates Haycock BSA for average adult (70 kg, 170 cm)', () => {
    const result = calculateBodySurfaceArea({ weight: 70, height: 170, unitSystem: 'metric' });
    // 0.024265 × 70^0.5378 × 170^0.3964 ≈ 1.8257
    expect(result.haycockBSA).toBeCloseTo(1.8257, 2);
  });

  it('calculates Haycock BSA for child (20 kg, 110 cm)', () => {
    const result = calculateBodySurfaceArea({ weight: 20, height: 110, unitSystem: 'metric' });
    // 0.024265 × 20^0.5378 × 110^0.3964 ≈ 0.7832
    expect(result.haycockBSA).toBeCloseTo(0.7832, 2);
  });

  // ─── Boyd formula tests ───

  it('calculates Boyd BSA for average adult (70 kg, 170 cm)', () => {
    const result = calculateBodySurfaceArea({ weight: 70, height: 170, unitSystem: 'metric' });
    // W_g = 70000; exponent = 0.7285 − 0.0188 × log10(70000) ≈ 0.6374
    // 0.0003207 × 70000^0.6374 × 170^0.3 ≈ 1.8347
    expect(result.boydBSA).toBeCloseTo(1.8347, 2);
  });

  // ─── Average BSA ───

  it('calculates average BSA as mean of all four formulas', () => {
    const result = calculateBodySurfaceArea({ weight: 70, height: 170, unitSystem: 'metric' });
    const expectedAvg = (result.duboisBSA + result.mostellerBSA + result.haycockBSA + result.boydBSA) / 4;
    expect(result.averageBSA).toBeCloseTo(expectedAvg, 3);
  });

  // ─── Comparison table ───

  it('returns comparison table with 4 rows', () => {
    const result = calculateBodySurfaceArea({ weight: 70, height: 170, unitSystem: 'metric' });
    expect(result.comparisonTable).toHaveLength(4);
    expect(result.comparisonTable[0].formula).toBe('DuBois & DuBois');
    expect(result.comparisonTable[1].formula).toBe('Mosteller');
    expect(result.comparisonTable[2].formula).toBe('Haycock');
    expect(result.comparisonTable[3].formula).toBe('Boyd');
  });

  it('comparison table includes correct years', () => {
    const result = calculateBodySurfaceArea({ weight: 70, height: 170, unitSystem: 'metric' });
    expect(result.comparisonTable[0].year).toBe('1916');
    expect(result.comparisonTable[1].year).toBe('1987');
    expect(result.comparisonTable[2].year).toBe('1978');
    expect(result.comparisonTable[3].year).toBe('1935');
  });

  // ─── Cross-formula agreement ───

  it('all formulas agree within ±15% for normal adults (70 kg, 170 cm)', () => {
    const result = calculateBodySurfaceArea({ weight: 70, height: 170, unitSystem: 'metric' });
    const avg = result.averageBSA;
    expect(Math.abs(result.duboisBSA - avg) / avg).toBeLessThan(0.15);
    expect(Math.abs(result.mostellerBSA - avg) / avg).toBeLessThan(0.15);
    expect(Math.abs(result.haycockBSA - avg) / avg).toBeLessThan(0.15);
    expect(Math.abs(result.boydBSA - avg) / avg).toBeLessThan(0.15);
  });

  it('all formulas agree within ±15% for large adult (100 kg, 185 cm)', () => {
    const result = calculateBodySurfaceArea({ weight: 100, height: 185, unitSystem: 'metric' });
    const avg = result.averageBSA;
    expect(Math.abs(result.duboisBSA - avg) / avg).toBeLessThan(0.15);
    expect(Math.abs(result.mostellerBSA - avg) / avg).toBeLessThan(0.15);
    expect(Math.abs(result.haycockBSA - avg) / avg).toBeLessThan(0.15);
    expect(Math.abs(result.boydBSA - avg) / avg).toBeLessThan(0.15);
  });

  // ─── Imperial unit conversion ───

  it('converts imperial units correctly (154 lb, 67 in)', () => {
    const resultImperial = calculateBodySurfaceArea({ weight: 154, height: 67, unitSystem: 'imperial' });
    // 154 lb ÷ 2.20462 ≈ 69.85 kg; 67 in × 2.54 = 170.18 cm
    const resultMetric = calculateBodySurfaceArea({ weight: 69.85, height: 170.18, unitSystem: 'metric' });
    expect(resultImperial.duboisBSA).toBeCloseTo(resultMetric.duboisBSA, 2);
    expect(resultImperial.mostellerBSA).toBeCloseTo(resultMetric.mostellerBSA, 2);
  });

  it('handles imperial large person (264 lb, 75 in)', () => {
    const result = calculateBodySurfaceArea({ weight: 264, height: 75, unitSystem: 'imperial' });
    // 264 lb ≈ 119.75 kg; 75 in = 190.5 cm → should be ~2.5 m²
    expect(result.duboisBSA).toBeGreaterThan(2.0);
    expect(result.duboisBSA).toBeLessThan(3.0);
  });

  // ─── Edge cases ───

  it('handles newborn-sized inputs (3 kg, 50 cm)', () => {
    const result = calculateBodySurfaceArea({ weight: 3, height: 50, unitSystem: 'metric' });
    // Newborn BSA is typically ~0.20-0.25 m²
    expect(result.duboisBSA).toBeGreaterThan(0.15);
    expect(result.duboisBSA).toBeLessThan(0.35);
    expect(result.mostellerBSA).toBeGreaterThan(0.15);
    expect(result.mostellerBSA).toBeLessThan(0.35);
  });

  it('handles very high weight (200 kg, 200 cm)', () => {
    const result = calculateBodySurfaceArea({ weight: 200, height: 200, unitSystem: 'metric' });
    // Very large person, BSA should be > 3.0 m²
    expect(result.duboisBSA).toBeGreaterThan(2.8);
    expect(result.duboisBSA).toBeLessThan(4.0);
  });

  // ─── Error handling ───

  it('returns error when weight is zero', () => {
    const result = calculateBodySurfaceArea({ weight: 0, height: 170, unitSystem: 'metric' });
    expect(result.error).toBe('Weight must be greater than zero');
    expect(result.duboisBSA).toBe(0);
    expect(result.mostellerBSA).toBe(0);
    expect(result.comparisonTable).toHaveLength(0);
  });

  it('returns error when height is zero', () => {
    const result = calculateBodySurfaceArea({ weight: 70, height: 0, unitSystem: 'metric' });
    expect(result.error).toBe('Height must be greater than zero');
    expect(result.duboisBSA).toBe(0);
  });

  it('returns error when weight is negative', () => {
    const result = calculateBodySurfaceArea({ weight: -10, height: 170, unitSystem: 'metric' });
    expect(result.error).toBe('Weight must be greater than zero');
    expect(result.duboisBSA).toBe(0);
  });

  it('returns error when height is negative', () => {
    const result = calculateBodySurfaceArea({ weight: 70, height: -50, unitSystem: 'metric' });
    expect(result.error).toBe('Height must be greater than zero');
    expect(result.duboisBSA).toBe(0);
  });

  // ─── Registry wrapper ───

  it('registry wrapper handles string inputs', () => {
    const result = calculateBodySurfaceAreaFromInputs({
      weight: '70',
      height: '170',
      unitSystem: 'metric',
    });
    expect((result as { duboisBSA: number }).duboisBSA).toBeCloseTo(1.8106, 2);
  });

  it('registry wrapper defaults to metric for unknown unitSystem', () => {
    const result = calculateBodySurfaceAreaFromInputs({
      weight: 70,
      height: 170,
      unitSystem: 'unknown',
    });
    expect((result as { duboisBSA: number }).duboisBSA).toBeCloseTo(1.8106, 2);
  });

  it('registry wrapper handles imperial correctly', () => {
    const result = calculateBodySurfaceAreaFromInputs({
      weight: 154,
      height: 67,
      unitSystem: 'imperial',
    });
    expect((result as { duboisBSA: number }).duboisBSA).toBeGreaterThan(1.5);
    expect((result as { duboisBSA: number }).duboisBSA).toBeLessThan(2.1);
  });

  // ─── Precision tests ───

  it('returns values rounded to 4 decimal places', () => {
    const result = calculateBodySurfaceArea({ weight: 70, height: 170, unitSystem: 'metric' });
    const decimalPlaces = (n: number) => {
      const str = n.toString();
      const idx = str.indexOf('.');
      return idx === -1 ? 0 : str.length - idx - 1;
    };
    expect(decimalPlaces(result.duboisBSA)).toBeLessThanOrEqual(4);
    expect(decimalPlaces(result.mostellerBSA)).toBeLessThanOrEqual(4);
    expect(decimalPlaces(result.haycockBSA)).toBeLessThanOrEqual(4);
    expect(decimalPlaces(result.boydBSA)).toBeLessThanOrEqual(4);
  });

  it('comparison table BSA values match output fields', () => {
    const result = calculateBodySurfaceArea({ weight: 80, height: 175, unitSystem: 'metric' });
    expect(result.comparisonTable[0].bsa).toBe(result.duboisBSA);
    expect(result.comparisonTable[1].bsa).toBe(result.mostellerBSA);
    expect(result.comparisonTable[2].bsa).toBe(result.haycockBSA);
    expect(result.comparisonTable[3].bsa).toBe(result.boydBSA);
  });
});
