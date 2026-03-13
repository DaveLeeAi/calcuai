import { calculateMomentum } from '@/lib/formulas/science/momentum';

describe('calculateMomentum', () => {
  // ═══════════════════════════════════════════════════════
  // Combination 1: Mass + Velocity → Momentum
  // ═══════════════════════════════════════════════════════

  it('calculates momentum from mass=10kg and velocity=5 m/s', () => {
    const result = calculateMomentum({ mass: 10, velocity: 5 });
    expect(result.momentum).toBeCloseTo(50, 4);
    expect(result.solvedFrom).toBe('Mass (m) and Velocity (v)');
  });

  it('calculates baseball momentum (0.145kg at 40 m/s)', () => {
    const result = calculateMomentum({ mass: 0.145, velocity: 40 });
    expect(result.momentum).toBeCloseTo(5.8, 4);
  });

  it('calculates truck momentum (10000kg at 25 m/s)', () => {
    const result = calculateMomentum({ mass: 10000, velocity: 25 });
    expect(result.momentum).toBeCloseTo(250000, 0);
  });

  // ═══════════════════════════════════════════════════════
  // Combination 2: Momentum + Velocity → Mass
  // ═══════════════════════════════════════════════════════

  it('solves mass from momentum=50 and velocity=5', () => {
    const result = calculateMomentum({ momentum: 50, velocity: 5 });
    expect(result.mass).toBeCloseTo(10, 4);
    expect(result.solvedFrom).toBe('Momentum (p) and Velocity (v)');
  });

  it('solves mass of bullet from momentum and velocity', () => {
    const result = calculateMomentum({ momentum: 6, velocity: 750 });
    expect(result.mass).toBeCloseTo(0.008, 3);
  });

  // ═══════════════════════════════════════════════════════
  // Combination 3: Momentum + Mass → Velocity
  // ═══════════════════════════════════════════════════════

  it('solves velocity from momentum=50 and mass=10', () => {
    const result = calculateMomentum({ momentum: 50, mass: 10 });
    expect(result.velocity).toBeCloseTo(5, 4);
    expect(result.solvedFrom).toBe('Momentum (p) and Mass (m)');
  });

  // ═══════════════════════════════════════════════════════
  // Kinetic Energy from Momentum
  // ═══════════════════════════════════════════════════════

  it('calculates kinetic energy correctly (KE = p²/2m)', () => {
    const result = calculateMomentum({ mass: 10, velocity: 5 });
    // KE = ½mv² = 0.5 × 10 × 25 = 125 J
    // Also: KE = p²/(2m) = 2500/20 = 125 J
    expect(result.kineticEnergy).toBeCloseTo(125, 4);
  });

  it('KE from momentum matches KE from ½mv²', () => {
    const result = calculateMomentum({ mass: 2, velocity: 10 });
    const expectedKE = 0.5 * 2 * 10 * 10; // 100 J
    expect(result.kineticEnergy).toBeCloseTo(expectedKE, 4);
  });

  // ═══════════════════════════════════════════════════════
  // Unit Conversions
  // ═══════════════════════════════════════════════════════

  it('momentum in N·s equals kg·m/s', () => {
    const result = calculateMomentum({ mass: 10, velocity: 5 });
    const conv = result.conversions as Record<string, number>;
    expect(conv.momentum_Ns).toBeCloseTo(50, 4);
  });

  it('converts velocity to km/h (5 m/s = 18 km/h)', () => {
    const result = calculateMomentum({ mass: 10, velocity: 5 });
    const conv = result.conversions as Record<string, number>;
    expect(conv.velocity_kmh).toBeCloseTo(18, 2);
  });

  it('converts mass to grams (10 kg = 10000 g)', () => {
    const result = calculateMomentum({ mass: 10, velocity: 5 });
    const conv = result.conversions as Record<string, number>;
    expect(conv.mass_g).toBeCloseTo(10000, 0);
  });

  // ═══════════════════════════════════════════════════════
  // Cross-Verification
  // ═══════════════════════════════════════════════════════

  it('all three input combinations produce consistent results', () => {
    const fromMV = calculateMomentum({ mass: 10, velocity: 5 });
    const fromPV = calculateMomentum({ momentum: 50, velocity: 5 });
    const fromPM = calculateMomentum({ momentum: 50, mass: 10 });
    for (const r of [fromMV, fromPV, fromPM]) {
      expect(r.momentum).toBeCloseTo(50, 4);
      expect(r.mass).toBeCloseTo(10, 4);
      expect(r.velocity).toBeCloseTo(5, 4);
    }
  });

  // ═══════════════════════════════════════════════════════
  // Edge Cases
  // ═══════════════════════════════════════════════════════

  it('handles very small momentum (electron-scale)', () => {
    const result = calculateMomentum({ mass: 0.00001, velocity: 0.001 });
    expect(result.momentum).toBeCloseTo(1e-8, 10);
  });

  it('handles very large momentum (spacecraft)', () => {
    const result = calculateMomentum({ mass: 420000, velocity: 7700 });
    expect(result.momentum).toBeCloseTo(3234000000, -3);
  });

  // ═══════════════════════════════════════════════════════
  // Error Cases
  // ═══════════════════════════════════════════════════════

  it('throws when fewer than 2 values provided', () => {
    expect(() => calculateMomentum({ mass: 10 })).toThrow('Enter any two of: Momentum, Mass, Velocity.');
  });

  it('throws with no inputs', () => {
    expect(() => calculateMomentum({})).toThrow('Enter any two of: Momentum, Mass, Velocity.');
  });

  it('treats zero values as not provided', () => {
    expect(() => calculateMomentum({ mass: 0, velocity: 0 })).toThrow();
  });

  // ═══════════════════════════════════════════════════════
  // Output Structure
  // ═══════════════════════════════════════════════════════

  it('returns allValues with kinetic energy included', () => {
    const result = calculateMomentum({ mass: 10, velocity: 5 });
    const allValues = result.allValues as { label: string; value: number; unit: string }[];
    expect(allValues).toHaveLength(4);
    expect(allValues[3]).toEqual(expect.objectContaining({ label: 'Kinetic Energy', unit: 'J' }));
  });

  it('handles string inputs', () => {
    const result = calculateMomentum({ mass: '10', velocity: '5' });
    expect(result.momentum).toBeCloseTo(50, 4);
  });
});
