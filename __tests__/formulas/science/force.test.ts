import { calculateForce } from '@/lib/formulas/science/force';

describe('calculateForce', () => {
  // ═══════════════════════════════════════════════════════
  // Combination 1: Mass + Acceleration → Force
  // ═══════════════════════════════════════════════════════

  it('calculates force from mass=10kg and acceleration=5 m/s²', () => {
    const result = calculateForce({ mass: 10, acceleration: 5 });
    expect(result.force).toBeCloseTo(50, 4);
    expect(result.solvedFrom).toBe('Mass (m) and Acceleration (a)');
  });

  it('calculates weight force (mass=70kg, g=9.80665)', () => {
    const result = calculateForce({ mass: 70, acceleration: 9.80665 });
    expect(result.force).toBeCloseTo(686.4655, 2);
  });

  it('calculates force for car acceleration (1500kg, 3 m/s²)', () => {
    const result = calculateForce({ mass: 1500, acceleration: 3 });
    expect(result.force).toBeCloseTo(4500, 4);
  });

  // ═══════════════════════════════════════════════════════
  // Combination 2: Force + Acceleration → Mass
  // ═══════════════════════════════════════════════════════

  it('solves mass from force=100N and acceleration=5 m/s²', () => {
    const result = calculateForce({ force: 100, acceleration: 5 });
    expect(result.mass).toBeCloseTo(20, 4);
    expect(result.solvedFrom).toBe('Force (F) and Acceleration (a)');
  });

  it('solves mass from gravitational force (686.47N at g)', () => {
    const result = calculateForce({ force: 686.4655, acceleration: 9.80665 });
    expect(result.mass).toBeCloseTo(70, 2);
  });

  // ═══════════════════════════════════════════════════════
  // Combination 3: Force + Mass → Acceleration
  // ═══════════════════════════════════════════════════════

  it('solves acceleration from force=100N and mass=20kg', () => {
    const result = calculateForce({ force: 100, mass: 20 });
    expect(result.acceleration).toBeCloseTo(5, 4);
    expect(result.solvedFrom).toBe('Force (F) and Mass (m)');
  });

  it('solves gravitational acceleration from weight and mass', () => {
    const result = calculateForce({ force: 686.4655, mass: 70 });
    expect(result.acceleration).toBeCloseTo(9.80665, 2);
  });

  // ═══════════════════════════════════════════════════════
  // Unit Conversions
  // ═══════════════════════════════════════════════════════

  it('converts force to lbf correctly (50N ≈ 11.24 lbf)', () => {
    const result = calculateForce({ mass: 10, acceleration: 5 });
    const conv = result.conversions as Record<string, number>;
    expect(conv.force_lbf).toBeCloseTo(11.2404, 2);
  });

  it('converts force to kgf correctly (50N ≈ 5.1 kgf)', () => {
    const result = calculateForce({ mass: 10, acceleration: 5 });
    const conv = result.conversions as Record<string, number>;
    expect(conv.force_kgf).toBeCloseTo(5.0986, 2);
  });

  it('converts force to dynes (50N = 5,000,000 dyn)', () => {
    const result = calculateForce({ mass: 10, acceleration: 5 });
    const conv = result.conversions as Record<string, number>;
    expect(conv.force_dyn).toBeCloseTo(5000000, 0);
  });

  it('converts mass to pounds (10kg ≈ 22.05 lb)', () => {
    const result = calculateForce({ mass: 10, acceleration: 5 });
    const conv = result.conversions as Record<string, number>;
    expect(conv.mass_lb).toBeCloseTo(22.0462, 2);
  });

  // ═══════════════════════════════════════════════════════
  // Cross-Verification
  // ═══════════════════════════════════════════════════════

  it('produces consistent results across all input combinations', () => {
    const fromMA = calculateForce({ mass: 10, acceleration: 5 });
    const fromFA = calculateForce({ force: 50, acceleration: 5 });
    const fromFM = calculateForce({ force: 50, mass: 10 });
    for (const r of [fromMA, fromFA, fromFM]) {
      expect(r.force).toBeCloseTo(50, 4);
      expect(r.mass).toBeCloseTo(10, 4);
      expect(r.acceleration).toBeCloseTo(5, 4);
    }
  });

  // ═══════════════════════════════════════════════════════
  // Edge Cases
  // ═══════════════════════════════════════════════════════

  it('handles very small values (0.001 kg, 0.01 m/s²)', () => {
    const result = calculateForce({ mass: 0.001, acceleration: 0.01 });
    expect(result.force).toBeCloseTo(0.00001, 6);
  });

  it('handles very large values (rocket: 500000 kg, 30 m/s²)', () => {
    const result = calculateForce({ mass: 500000, acceleration: 30 });
    expect(result.force).toBeCloseTo(15000000, 0);
  });

  // ═══════════════════════════════════════════════════════
  // Error Cases
  // ═══════════════════════════════════════════════════════

  it('throws when fewer than 2 values provided', () => {
    expect(() => calculateForce({ force: 10 })).toThrow('Enter any two of: Force, Mass, Acceleration.');
  });

  it('throws when no values provided', () => {
    expect(() => calculateForce({})).toThrow('Enter any two of: Force, Mass, Acceleration.');
  });

  it('treats zero values as not provided', () => {
    expect(() => calculateForce({ mass: 0, acceleration: 0 })).toThrow();
  });

  // ═══════════════════════════════════════════════════════
  // Output Structure
  // ═══════════════════════════════════════════════════════

  it('returns allValues with correct labels and units', () => {
    const result = calculateForce({ mass: 10, acceleration: 5 });
    const allValues = result.allValues as { label: string; value: number; unit: string }[];
    expect(allValues).toHaveLength(3);
    expect(allValues[0]).toEqual(expect.objectContaining({ label: 'Force', unit: 'N' }));
    expect(allValues[1]).toEqual(expect.objectContaining({ label: 'Mass', unit: 'kg' }));
    expect(allValues[2]).toEqual(expect.objectContaining({ label: 'Acceleration', unit: 'm/s²' }));
  });

  it('handles string inputs by converting to numbers', () => {
    const result = calculateForce({ mass: '10', acceleration: '5' });
    expect(result.force).toBeCloseTo(50, 4);
  });

  it('uses first valid pair when all 3 inputs provided', () => {
    const result = calculateForce({ force: 50, mass: 10, acceleration: 5 });
    expect(result.solvedFrom).toBe('Mass (m) and Acceleration (a)');
  });
});
