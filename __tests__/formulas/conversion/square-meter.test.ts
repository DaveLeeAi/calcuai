import { calculateSquareMeter } from '@/lib/formulas/conversion/square-meter';

describe('calculateSquareMeter — Dimensions mode', () => {
  // ─── Test 1: Standard 5×4 m = 20 sq m ───
  it('calculates 5×4 meters as 20 square meters', () => {
    const result = calculateSquareMeter({
      calculationMode: 'dimensions',
      length: 5,
      width: 4,
      lengthUnit: 'm',
      widthUnit: 'm',
    });
    expect(result.squareMeters).toBe(20);
    // 20 sq m × 10.7639 = 215.278 sq ft
    expect(result.squareFeet).toBeCloseTo(215.28, 0);
  });

  // ─── Test 2: Feet inputs ───
  it('calculates area when inputs are in feet', () => {
    const result = calculateSquareMeter({
      calculationMode: 'dimensions',
      length: 10,
      width: 10,
      lengthUnit: 'ft',
      widthUnit: 'ft',
    });
    // 10 ft = 3.048 m → 3.048 × 3.048 = 9.290304 sq m
    expect(result.squareMeters).toBeCloseTo(9.2903, 3);
    expect(result.squareFeet).toBeCloseTo(100, 0);
  });

  // ─── Test 3: Mixed units (length in m, width in ft) ───
  it('handles mixed units correctly', () => {
    const result = calculateSquareMeter({
      calculationMode: 'dimensions',
      length: 5,
      width: 10,
      lengthUnit: 'm',
      widthUnit: 'ft',
    });
    // 5 m × (10 ft × 0.3048) = 5 × 3.048 = 15.24 sq m
    expect(result.squareMeters).toBeCloseTo(15.24, 2);
  });

  // ─── Test 4: Zero dimensions ───
  it('returns zero for zero dimensions', () => {
    const result = calculateSquareMeter({
      calculationMode: 'dimensions',
      length: 0,
      width: 5,
      lengthUnit: 'm',
      widthUnit: 'm',
    });
    expect(result.squareMeters).toBe(0);
    expect(result.squareFeet).toBe(0);
    expect(result.squareYards).toBe(0);
    expect(result.squareInches).toBe(0);
    expect(result.acres).toBe(0);
    expect(result.hectares).toBe(0);
  });

  // ─── Test 5: Large area ───
  it('calculates a large area correctly', () => {
    const result = calculateSquareMeter({
      calculationMode: 'dimensions',
      length: 100,
      width: 100,
      lengthUnit: 'm',
      widthUnit: 'm',
    });
    expect(result.squareMeters).toBe(10000);
    expect(result.hectares).toBe(1);
    expect(result.acres).toBeCloseTo(2.4711, 3);
  });

  // ─── Test 6: Small area ───
  it('calculates a small area correctly', () => {
    const result = calculateSquareMeter({
      calculationMode: 'dimensions',
      length: 0.5,
      width: 0.5,
      lengthUnit: 'm',
      widthUnit: 'm',
    });
    expect(result.squareMeters).toBe(0.25);
    expect(result.squareFeet).toBeCloseTo(2.69, 1);
  });

  // ─── Test 7: Default mode is dimensions ───
  it('defaults to dimensions mode when no mode specified', () => {
    const result = calculateSquareMeter({
      length: 5,
      width: 4,
      lengthUnit: 'm',
      widthUnit: 'm',
    });
    expect(result.squareMeters).toBe(20);
  });
});

describe('calculateSquareMeter — Convert mode', () => {
  // ─── Test 8: sqft → sqm ───
  it('converts 100 sq ft to sq m', () => {
    const result = calculateSquareMeter({
      calculationMode: 'convert',
      areaToConvert: 100,
      convertFrom: 'sqft',
    });
    // 100 sq ft × 0.09290304 = 9.290304 sq m
    expect(result.squareMeters).toBeCloseTo(9.2903, 3);
    expect(result.squareFeet).toBeCloseTo(100, 0);
  });

  // ─── Test 9: sqm → sqft ───
  it('converts 20 sq m to sq ft', () => {
    const result = calculateSquareMeter({
      calculationMode: 'convert',
      areaToConvert: 20,
      convertFrom: 'sqm',
    });
    expect(result.squareMeters).toBe(20);
    expect(result.squareFeet).toBeCloseTo(215.28, 0);
  });

  // ─── Test 10: sqyd → sqm ───
  it('converts square yards to square meters', () => {
    const result = calculateSquareMeter({
      calculationMode: 'convert',
      areaToConvert: 10,
      convertFrom: 'sqyd',
    });
    // 10 sq yd × 0.83612736 = 8.3613 sq m
    expect(result.squareMeters).toBeCloseTo(8.3613, 3);
  });

  // ─── Test 11: acres → sqm ───
  it('converts acres to square meters', () => {
    const result = calculateSquareMeter({
      calculationMode: 'convert',
      areaToConvert: 1,
      convertFrom: 'acres',
    });
    // 1 acre = 4046.86 sq m
    expect(result.squareMeters).toBeCloseTo(4046.86, 0);
    expect(result.squareFeet).toBeCloseTo(43560, 0);
  });

  // ─── Test 12: hectares → sqm ───
  it('converts hectares to square meters', () => {
    const result = calculateSquareMeter({
      calculationMode: 'convert',
      areaToConvert: 1,
      convertFrom: 'hectares',
    });
    expect(result.squareMeters).toBe(10000);
    expect(result.hectares).toBe(1);
  });

  // ─── Test 13: Zero conversion ───
  it('handles zero conversion value', () => {
    const result = calculateSquareMeter({
      calculationMode: 'convert',
      areaToConvert: 0,
      convertFrom: 'sqft',
    });
    expect(result.squareMeters).toBe(0);
    expect(result.squareFeet).toBe(0);
  });
});

describe('calculateSquareMeter — Output structure', () => {
  // ─── Test 14: All output fields present ───
  it('returns all expected output fields', () => {
    const result = calculateSquareMeter({
      calculationMode: 'dimensions',
      length: 5,
      width: 4,
      lengthUnit: 'm',
      widthUnit: 'm',
    });
    expect(result).toHaveProperty('squareMeters');
    expect(result).toHaveProperty('squareFeet');
    expect(result).toHaveProperty('squareYards');
    expect(result).toHaveProperty('squareInches');
    expect(result).toHaveProperty('acres');
    expect(result).toHaveProperty('hectares');
    expect(result).toHaveProperty('conversionTable');
  });

  // ─── Test 15: Conversion table structure ───
  it('returns conversion table with 6 entries', () => {
    const result = calculateSquareMeter({
      calculationMode: 'dimensions',
      length: 5,
      width: 4,
      lengthUnit: 'm',
      widthUnit: 'm',
    });
    const table = result.conversionTable as Array<{ label: string; value: string | number }>;
    expect(table.length).toBe(6);
    const labels = table.map(t => t.label);
    expect(labels).toContain('Square Meters (m²)');
    expect(labels).toContain('Square Feet (ft²)');
    expect(labels).toContain('Square Yards (yd²)');
    expect(labels).toContain('Square Inches (in²)');
    expect(labels).toContain('Acres');
    expect(labels).toContain('Hectares');
  });

  // ─── Test 16: Square inches derivation ───
  it('calculates square inches correctly from square feet', () => {
    const result = calculateSquareMeter({
      calculationMode: 'dimensions',
      length: 1,
      width: 1,
      lengthUnit: 'm',
      widthUnit: 'm',
    });
    // 1 sq m = 10.7639 sq ft × 144 = 1550 sq in
    expect(result.squareInches).toBeCloseTo(1550, -1);
  });

  // ─── Test 17: Precision for acres ───
  it('provides appropriate precision for acres', () => {
    const result = calculateSquareMeter({
      calculationMode: 'dimensions',
      length: 10,
      width: 10,
      lengthUnit: 'm',
      widthUnit: 'm',
    });
    // 100 sq m / 4046.86 = 0.02471 acres
    expect(result.acres).toBeCloseTo(0.02471, 4);
  });

  // ─── Test 18: Default convertFrom is sqft ───
  it('defaults convertFrom to sqft when not specified', () => {
    const result = calculateSquareMeter({
      calculationMode: 'convert',
      areaToConvert: 100,
    });
    // Should treat as sqft → sqm
    expect(result.squareMeters).toBeCloseTo(9.2903, 3);
  });
});
