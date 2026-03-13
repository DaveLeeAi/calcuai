import { calculateLensEquation } from '@/lib/formulas/science/lens-equation';

describe('calculateLensEquation', () => {
  // ═══════════════════════════════════════════════════════
  // Solve for Image Distance (given f and do)
  // ═══════════════════════════════════════════════════════

  it('calculates image distance for converging lens (f=10, do=30)', () => {
    const result = calculateLensEquation({ focalLength: 10, objectDistance: 30 });
    // 1/di = 1/10 - 1/30 = 3/30 - 1/30 = 2/30 → di = 15
    expect(result.imageDistance).toBeCloseTo(15, 4);
    expect(result.solvedFrom).toBe('Focal Length and Object Distance');
  });

  it('calculates virtual image for object inside focal length (f=10, do=5)', () => {
    const result = calculateLensEquation({ focalLength: 10, objectDistance: 5 });
    // 1/di = 1/10 - 1/5 = 1/10 - 2/10 = -1/10 → di = -10
    expect(result.imageDistance).toBeCloseTo(-10, 4);
    expect(result.imageType).toBe('Virtual, Upright');
  });

  it('calculates image for converging lens at 2f (f=10, do=20)', () => {
    const result = calculateLensEquation({ focalLength: 10, objectDistance: 20 });
    // 1/di = 1/10 - 1/20 = 2/20 - 1/20 = 1/20 → di = 20
    expect(result.imageDistance).toBeCloseTo(20, 4);
    expect(result.magnification).toBeCloseTo(-1, 4);
  });

  it('calculates image for diverging lens (f=-10, do=30)', () => {
    const result = calculateLensEquation({ focalLength: -10, objectDistance: 30 });
    // 1/di = 1/(-10) - 1/30 = -3/30 - 1/30 = -4/30 → di = -7.5
    expect(result.imageDistance).toBeCloseTo(-7.5, 4);
    expect(result.imageType).toBe('Virtual, Upright');
  });

  it('throws when object is at focal point (image at infinity)', () => {
    expect(() => calculateLensEquation({ focalLength: 10, objectDistance: 10 })).toThrow(
      'Object is at the focal point'
    );
  });

  // ═══════════════════════════════════════════════════════
  // Solve for Focal Length (given do and di)
  // ═══════════════════════════════════════════════════════

  it('calculates focal length from object and image distances', () => {
    const result = calculateLensEquation({ objectDistance: 30, imageDistance: 15 });
    // 1/f = 1/30 + 1/15 = 1/30 + 2/30 = 3/30 → f = 10
    expect(result.focalLength).toBeCloseTo(10, 4);
    expect(result.solvedFrom).toBe('Object Distance and Image Distance');
  });

  it('calculates negative focal length for diverging lens scenario', () => {
    const result = calculateLensEquation({ objectDistance: 30, imageDistance: -7.5 });
    // 1/f = 1/30 + 1/(-7.5) = 1/30 - 4/30 = -3/30 → f = -10
    expect(result.focalLength).toBeCloseTo(-10, 4);
  });

  // ═══════════════════════════════════════════════════════
  // Solve for Object Distance (given f and di)
  // ═══════════════════════════════════════════════════════

  it('calculates object distance from focal length and image distance', () => {
    const result = calculateLensEquation({ focalLength: 10, imageDistance: 15 });
    // 1/do = 1/10 - 1/15 = 3/30 - 2/30 = 1/30 → do = 30
    expect(result.objectDistance).toBeCloseTo(30, 4);
    expect(result.solvedFrom).toBe('Focal Length and Image Distance');
  });

  it('throws when no valid positive object distance exists', () => {
    // f = -10, di = -5 → 1/do = 1/(-10) - 1/(-5) = -0.1 + 0.2 = 0.1 → do = 10 (valid)
    // But f = 10, di = 5 → 1/do = 1/10 - 1/5 = -0.1 → do = -10 (invalid)
    expect(() => calculateLensEquation({ focalLength: 10, imageDistance: 5 })).toThrow(
      'No valid positive object distance'
    );
  });

  // ═══════════════════════════════════════════════════════
  // Magnification & Image Properties
  // ═══════════════════════════════════════════════════════

  it('returns correct magnification for real inverted image', () => {
    const result = calculateLensEquation({ focalLength: 10, objectDistance: 30 });
    // M = -di/do = -15/30 = -0.5
    expect(result.magnification).toBeCloseTo(-0.5, 4);
    expect(result.imageType).toBe('Real, Inverted');
    expect(result.imageSize).toContain('Reduced');
  });

  it('returns correct magnification for virtual upright image', () => {
    const result = calculateLensEquation({ focalLength: 10, objectDistance: 5 });
    // M = -(-10)/5 = 2
    expect(result.magnification).toBeCloseTo(2, 4);
    expect(result.imageType).toBe('Virtual, Upright');
    expect(result.imageSize).toContain('Enlarged');
  });

  it('returns magnification of -1 at 2f (same size, inverted)', () => {
    const result = calculateLensEquation({ focalLength: 10, objectDistance: 20 });
    expect(result.magnification).toBeCloseTo(-1, 4);
    expect(result.imageSize).toBe('Same size as object');
  });

  it('returns enlarged real image for object between f and 2f', () => {
    const result = calculateLensEquation({ focalLength: 10, objectDistance: 15 });
    // 1/di = 1/10 - 1/15 = 1/30 → di = 30; M = -30/15 = -2
    expect(result.magnification).toBeCloseTo(-2, 4);
    expect(result.imageType).toBe('Real, Inverted');
    expect(result.imageSize).toContain('Enlarged');
  });

  // ═══════════════════════════════════════════════════════
  // Cross-Verification
  // ═══════════════════════════════════════════════════════

  it('produces consistent results across all solver paths', () => {
    const fromFDo = calculateLensEquation({ focalLength: 20, objectDistance: 60 });
    const di = fromFDo.imageDistance as number; // should be 30

    const fromDoDi = calculateLensEquation({ objectDistance: 60, imageDistance: di });
    expect(fromDoDi.focalLength).toBeCloseTo(20, 4);

    const fromFDi = calculateLensEquation({ focalLength: 20, imageDistance: di });
    expect(fromFDi.objectDistance).toBeCloseTo(60, 4);
  });

  // ═══════════════════════════════════════════════════════
  // Unit Conversions
  // ═══════════════════════════════════════════════════════

  it('converts focal length to mm correctly', () => {
    const result = calculateLensEquation({ focalLength: 5, objectDistance: 20 });
    const conv = result.conversions as Record<string, number>;
    expect(conv.focalLength_mm).toBeCloseTo(50, 2);
  });

  it('converts focal length to meters', () => {
    const result = calculateLensEquation({ focalLength: 10, objectDistance: 30 });
    const conv = result.conversions as Record<string, number>;
    expect(conv.focalLength_m).toBeCloseTo(0.1, 4);
  });

  it('calculates lens power in diopters', () => {
    const result = calculateLensEquation({ focalLength: 10, objectDistance: 30 });
    const conv = result.conversions as Record<string, number>;
    // Power = 1 / (0.1 m) = 10 diopters
    expect(conv.lensPower_diopters).toBeCloseTo(10, 2);
  });

  it('converts focal length to inches', () => {
    const result = calculateLensEquation({ focalLength: 10, objectDistance: 30 });
    const conv = result.conversions as Record<string, number>;
    expect(conv.focalLength_in).toBeCloseTo(3.937, 2);
  });

  // ═══════════════════════════════════════════════════════
  // Edge Cases
  // ═══════════════════════════════════════════════════════

  it('handles very large object distance (approaches parallel light)', () => {
    const result = calculateLensEquation({ focalLength: 10, objectDistance: 100000 });
    // di approaches f as do → infinity
    expect(result.imageDistance).toBeCloseTo(10, 0);
  });

  it('handles strong diverging lens', () => {
    const result = calculateLensEquation({ focalLength: -5, objectDistance: 10 });
    // 1/di = -1/5 - 1/10 = -2/10 - 1/10 = -3/10 → di = -10/3 ≈ -3.333
    expect(result.imageDistance).toBeCloseTo(-3.333, 2);
    expect(result.imageType).toBe('Virtual, Upright');
  });

  // ═══════════════════════════════════════════════════════
  // Error Cases
  // ═══════════════════════════════════════════════════════

  it('throws when fewer than 2 values provided', () => {
    expect(() => calculateLensEquation({ focalLength: 10 })).toThrow(
      'Enter any two of: Focal Length, Object Distance, Image Distance.'
    );
  });

  it('throws when no values provided', () => {
    expect(() => calculateLensEquation({})).toThrow();
  });

  it('treats zero focal length as not provided', () => {
    expect(() => calculateLensEquation({ focalLength: 0, objectDistance: 30 })).toThrow();
  });

  // ═══════════════════════════════════════════════════════
  // Output Structure
  // ═══════════════════════════════════════════════════════

  it('returns allValues with correct labels and units', () => {
    const result = calculateLensEquation({ focalLength: 10, objectDistance: 30 });
    const allValues = result.allValues as { label: string; value: number | string; unit: string }[];
    expect(allValues.length).toBeGreaterThanOrEqual(6);
    expect(allValues[0]).toEqual(expect.objectContaining({ label: 'Focal Length', unit: 'cm' }));
    expect(allValues[1]).toEqual(expect.objectContaining({ label: 'Object Distance', unit: 'cm' }));
    expect(allValues[2]).toEqual(expect.objectContaining({ label: 'Image Distance', unit: 'cm' }));
    expect(allValues[3]).toEqual(expect.objectContaining({ label: 'Magnification', unit: 'x' }));
  });

  it('handles string inputs by converting to numbers', () => {
    const result = calculateLensEquation({ focalLength: '10', objectDistance: '30' });
    expect(result.imageDistance).toBeCloseTo(15, 4);
  });
});
