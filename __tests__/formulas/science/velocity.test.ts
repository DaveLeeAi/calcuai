import { calculateVelocity } from '@/lib/formulas/science/velocity';

describe('calculateVelocity', () => {
  // ═══════════════════════════════════════════════════════
  // Combination 1: Speed + Distance → Time
  // ═══════════════════════════════════════════════════════

  // ─── Test 1: 10 m/s for 100 m → t = 10 s ───
  it('solves time from speed=10 and distance=100', () => {
    const result = calculateVelocity({ speed: 10, distance: 100 });
    expect(result.speed).toBeCloseTo(10, 4);
    expect(result.distance).toBeCloseTo(100, 4);
    expect(result.time).toBeCloseTo(10, 4);
    expect(result.solvedFrom).toBe('Speed (v) and Distance (d)');
  });

  // ─── Test 2: Usain Bolt — 10.44 m/s for 100 m → t = 9.578 s ───
  it('solves time for Usain Bolt sprint (10.44 m/s, 100m)', () => {
    const result = calculateVelocity({ speed: 10.44, distance: 100 });
    expect(result.time).toBeCloseTo(9.5785, 2);
  });

  // ═══════════════════════════════════════════════════════
  // Combination 2: Speed + Time → Distance
  // ═══════════════════════════════════════════════════════

  // ─── Test 3: 5 m/s for 60 s → d = 300 m ───
  it('solves distance from speed=5 and time=60', () => {
    const result = calculateVelocity({ speed: 5, time: 60 });
    expect(result.distance).toBeCloseTo(300, 4);
    expect(result.solvedFrom).toBe('Speed (v) and Time (t)');
  });

  // ─── Test 4: Speed of sound (343 m/s) for 3 s → d = 1029 m ───
  it('solves distance for thunder delay (343 m/s, 3s)', () => {
    const result = calculateVelocity({ speed: 343, time: 3 });
    expect(result.distance).toBeCloseTo(1029, 4);
  });

  // ═══════════════════════════════════════════════════════
  // Combination 3: Distance + Time → Speed
  // ═══════════════════════════════════════════════════════

  // ─── Test 5: 100 m in 9.58 s → v = 10.438 m/s ───
  it('solves speed from distance=100 and time=9.58', () => {
    const result = calculateVelocity({ distance: 100, time: 9.58 });
    expect(result.speed).toBeCloseTo(10.438, 2);
    expect(result.solvedFrom).toBe('Distance (d) and Time (t)');
  });

  // ─── Test 6: Marathon (42195 m) in 7200 s (2 hr) → v = 5.860 m/s ───
  it('solves speed for 2-hour marathon', () => {
    const result = calculateVelocity({ distance: 42195, time: 7200 });
    expect(result.speed).toBeCloseTo(5.8604, 2);
  });

  // ═══════════════════════════════════════════════════════
  // Unit Conversions
  // ═══════════════════════════════════════════════════════

  // ─── Test 7: km/h conversion (10 m/s = 36 km/h) ───
  it('converts speed to km/h correctly', () => {
    const result = calculateVelocity({ speed: 10, distance: 100 });
    const conv = result.conversions as Record<string, number>;
    expect(conv.speed_kmh).toBeCloseTo(36, 2);
  });

  // ─── Test 8: mph conversion (10 m/s ≈ 22.37 mph) ───
  it('converts speed to mph correctly', () => {
    const result = calculateVelocity({ speed: 10, distance: 100 });
    const conv = result.conversions as Record<string, number>;
    expect(conv.speed_mph).toBeCloseTo(22.3694, 2);
  });

  // ─── Test 9: distance km conversion ───
  it('converts distance to km correctly', () => {
    const result = calculateVelocity({ speed: 10, time: 1000 });
    const conv = result.conversions as Record<string, number>;
    expect(conv.distance_km).toBeCloseTo(10, 4);
  });

  // ─── Test 10: time minutes conversion ───
  it('converts time to minutes correctly', () => {
    const result = calculateVelocity({ distance: 100, time: 120 });
    const conv = result.conversions as Record<string, number>;
    expect(conv.time_min).toBeCloseTo(2, 4);
  });

  // ═══════════════════════════════════════════════════════
  // Cross-Verification
  // ═══════════════════════════════════════════════════════

  // ─── Test 11: All 3 combos for v=10, d=100, t=10 match ───
  it('produces consistent results across all input combinations', () => {
    const fromVD = calculateVelocity({ speed: 10, distance: 100 });
    const fromVT = calculateVelocity({ speed: 10, time: 10 });
    const fromDT = calculateVelocity({ distance: 100, time: 10 });
    for (const r of [fromVD, fromVT, fromDT]) {
      expect(r.speed).toBeCloseTo(10, 4);
      expect(r.distance).toBeCloseTo(100, 4);
      expect(r.time).toBeCloseTo(10, 4);
    }
  });

  // ═══════════════════════════════════════════════════════
  // Edge Cases
  // ═══════════════════════════════════════════════════════

  // ─── Test 12: Very small values (0.001 m/s, 0.01 m) ───
  it('handles very small values', () => {
    const result = calculateVelocity({ speed: 0.001, distance: 0.01 });
    expect(result.time).toBeCloseTo(10, 4);
  });

  // ─── Test 13: Very large values (speed of light, ~1 light-year) ───
  it('handles very large values (speed of light)', () => {
    const result = calculateVelocity({ speed: 300000000, distance: 9.461e15 });
    expect(result.time).toBeCloseTo(31536666.67, -2);
  });

  // ═══════════════════════════════════════════════════════
  // Error Cases
  // ═══════════════════════════════════════════════════════

  // ─── Test 14: Fewer than 2 inputs throws error ───
  it('throws error when fewer than 2 values provided', () => {
    expect(() => calculateVelocity({ speed: 10 })).toThrow('Enter any two of: Speed, Distance, Time.');
  });

  // ─── Test 15: No inputs throws error ───
  it('throws error when no values provided', () => {
    expect(() => calculateVelocity({})).toThrow('Enter any two of: Speed, Distance, Time.');
  });

  // ─── Test 16: Zero values treated as not provided ───
  it('treats zero values as not provided', () => {
    expect(() => calculateVelocity({ speed: 0, distance: 0 })).toThrow();
  });

  // ═══════════════════════════════════════════════════════
  // Output Structure
  // ═══════════════════════════════════════════════════════

  // ─── Test 17: allValues array structure ───
  it('returns allValues with correct labels and units', () => {
    const result = calculateVelocity({ speed: 10, distance: 100 });
    const allValues = result.allValues as { label: string; value: number; unit: string }[];
    expect(allValues).toHaveLength(3);
    expect(allValues[0]).toEqual(expect.objectContaining({ label: 'Speed', unit: 'm/s' }));
    expect(allValues[1]).toEqual(expect.objectContaining({ label: 'Distance', unit: 'm' }));
    expect(allValues[2]).toEqual(expect.objectContaining({ label: 'Time', unit: 's' }));
  });

  // ─── Test 18: String inputs converted to numbers ───
  it('handles string inputs by converting to numbers', () => {
    const result = calculateVelocity({ speed: '10', distance: '100' });
    expect(result.speed).toBeCloseTo(10, 4);
    expect(result.time).toBeCloseTo(10, 4);
  });

  // ─── Test 19: Empty string treated as not provided ───
  it('treats empty string as not provided', () => {
    expect(() => calculateVelocity({ speed: '', distance: '' })).toThrow();
  });

  // ─── Test 20: More than 2 inputs uses first valid pair ───
  it('uses first valid pair when all 3 inputs provided', () => {
    const result = calculateVelocity({ speed: 10, distance: 100, time: 10 });
    expect(result.solvedFrom).toBe('Speed (v) and Distance (d)');
  });
});
