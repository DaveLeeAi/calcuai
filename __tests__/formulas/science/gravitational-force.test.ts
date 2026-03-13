import { calculateGravitationalForce } from '@/lib/formulas/science/gravitational-force';

describe('calculateGravitationalForce', () => {
  // ═══════════════════════════════════════════════════════
  // Solve for Force (given m1, m2, r)
  // ═══════════════════════════════════════════════════════

  it('calculates gravitational force between Earth and a 70 kg person', () => {
    const result = calculateGravitationalForce({
      mass1: 5.972e24,
      mass2: 70,
      distance: 6371000,
    });
    // F = 6.6743e-11 * 5.972e24 * 70 / (6371000^2) ≈ 687.07 N
    expect(result.force).toBeCloseTo(687.07, 0);
    expect(result.solvedFrom).toBe('Mass 1, Mass 2, and Distance');
  });

  it('calculates force between two 1 kg masses at 1 m apart', () => {
    const result = calculateGravitationalForce({
      mass1: 1,
      mass2: 1,
      distance: 1,
    });
    // F = G = 6.6743e-11 N
    expect(result.force).toBeCloseTo(6.6743e-11, 15);
  });

  it('calculates Earth-Moon gravitational force', () => {
    const result = calculateGravitationalForce({
      mass1: 5.972e24,   // Earth
      mass2: 7.342e22,   // Moon
      distance: 3.844e8, // avg distance
    });
    // F ≈ 1.98e20 N
    expect(result.force).toBeCloseTo(1.98e20, -18);
  });

  it('calculates force between two 100 kg masses at 2 m', () => {
    const result = calculateGravitationalForce({
      mass1: 100,
      mass2: 100,
      distance: 2,
    });
    // F = 6.6743e-11 * 100 * 100 / 4 = 1.668575e-7
    expect(result.force).toBeCloseTo(1.668575e-7, 11);
  });

  // ═══════════════════════════════════════════════════════
  // Solve for Mass 1 (given F, m2, r)
  // ═══════════════════════════════════════════════════════

  it('solves for mass1 given force, mass2, and distance', () => {
    // Use the exact computed force for a round-trip test
    const fwd = calculateGravitationalForce({
      mass1: 5.972e24,
      mass2: 70,
      distance: 6371000,
    });
    const result = calculateGravitationalForce({
      force: fwd.force as number,
      mass2: 70,
      distance: 6371000,
    });
    expect(result.mass1).toBeCloseTo(5.972e24, -21);
    expect(result.solvedFrom).toBe('Force, Mass 2, and Distance');
  });

  it('solves for mass1 from unit values', () => {
    const result = calculateGravitationalForce({
      force: 6.6743e-11,
      mass2: 1,
      distance: 1,
    });
    expect(result.mass1).toBeCloseTo(1, 4);
  });

  // ═══════════════════════════════════════════════════════
  // Solve for Mass 2 (given F, m1, r)
  // ═══════════════════════════════════════════════════════

  it('solves for mass2 given force, mass1, and distance', () => {
    const result = calculateGravitationalForce({
      force: 687.07,
      mass1: 5.972e24,
      distance: 6371000,
    });
    expect(result.mass2).toBeCloseTo(70, 0);
    expect(result.solvedFrom).toBe('Force, Mass 1, and Distance');
  });

  // ═══════════════════════════════════════════════════════
  // Solve for Distance (given F, m1, m2)
  // ═══════════════════════════════════════════════════════

  it('solves for distance given force and both masses', () => {
    // Use exact computed force for round-trip
    const fwd = calculateGravitationalForce({
      mass1: 5.972e24,
      mass2: 70,
      distance: 6371000,
    });
    const result = calculateGravitationalForce({
      force: fwd.force as number,
      mass1: 5.972e24,
      mass2: 70,
    });
    expect(result.distance).toBeCloseTo(6371000, -3);
    expect(result.solvedFrom).toBe('Force, Mass 1, and Mass 2');
  });

  it('solves for distance between unit masses', () => {
    const result = calculateGravitationalForce({
      force: 6.6743e-11,
      mass1: 1,
      mass2: 1,
    });
    expect(result.distance).toBeCloseTo(1, 4);
  });

  // ═══════════════════════════════════════════════════════
  // Cross-Verification
  // ═══════════════════════════════════════════════════════

  it('produces consistent results across all solver paths', () => {
    // First compute force
    const fromMasses = calculateGravitationalForce({
      mass1: 1000,
      mass2: 500,
      distance: 10,
    });
    const F = fromMasses.force as number;

    // Now verify all other paths give consistent values
    const fromForceM2R = calculateGravitationalForce({
      force: F,
      mass2: 500,
      distance: 10,
    });
    expect(fromForceM2R.mass1).toBeCloseTo(1000, 0);

    const fromForceM1R = calculateGravitationalForce({
      force: F,
      mass1: 1000,
      distance: 10,
    });
    expect(fromForceM1R.mass2).toBeCloseTo(500, 0);

    const fromForceM1M2 = calculateGravitationalForce({
      force: F,
      mass1: 1000,
      mass2: 500,
    });
    expect(fromForceM1M2.distance).toBeCloseTo(10, 2);
  });

  // ═══════════════════════════════════════════════════════
  // Unit Conversions
  // ═══════════════════════════════════════════════════════

  it('converts force to lbf correctly', () => {
    const result = calculateGravitationalForce({
      mass1: 5.972e24,
      mass2: 70,
      distance: 6371000,
    });
    const conv = result.conversions as Record<string, number>;
    // ~687 N * 0.224809 ≈ 154.4 lbf
    expect(conv.force_lbf).toBeCloseTo(154.5, 0);
  });

  it('converts distance to km and miles', () => {
    const result = calculateGravitationalForce({
      mass1: 5.972e24,
      mass2: 70,
      distance: 6371000,
    });
    const conv = result.conversions as Record<string, number>;
    expect(conv.distance_km).toBeCloseTo(6371, 0);
    expect(conv.distance_mi).toBeCloseTo(3958.8, 0);
  });

  it('converts force to dynes', () => {
    const result = calculateGravitationalForce({
      mass1: 1,
      mass2: 1,
      distance: 1,
    });
    const conv = result.conversions as Record<string, number>;
    // 6.6743e-11 N * 100000 = 6.6743e-6 dyn
    expect(conv.force_dyn).toBeCloseTo(6.6743e-6, 9);
  });

  // ═══════════════════════════════════════════════════════
  // Edge Cases
  // ═══════════════════════════════════════════════════════

  it('handles very large masses (Sun-Earth system)', () => {
    const result = calculateGravitationalForce({
      mass1: 1.989e30,   // Sun
      mass2: 5.972e24,   // Earth
      distance: 1.496e11, // 1 AU
    });
    // F ≈ 3.54e22 N
    expect(result.force).toBeCloseTo(3.54e22, -20);
  });

  it('handles very small masses (two protons)', () => {
    const result = calculateGravitationalForce({
      mass1: 1.673e-27,
      mass2: 1.673e-27,
      distance: 1e-15,
    });
    // F = 6.6743e-11 * (1.673e-27)^2 / (1e-15)^2 ≈ 1.868e-34
    expect(result.force).toBeCloseTo(1.868e-34, 37);
  });

  it('handles very large distances (1 AU)', () => {
    const result = calculateGravitationalForce({
      mass1: 100,
      mass2: 100,
      distance: 1.496e11,
    });
    // F ≈ 2.98e-29 N
    expect(result.force).toBeCloseTo(2.982e-29, 32);
  });

  // ═══════════════════════════════════════════════════════
  // Error Cases
  // ═══════════════════════════════════════════════════════

  it('throws when fewer than 3 values provided', () => {
    expect(() => calculateGravitationalForce({ mass1: 100, mass2: 50 })).toThrow(
      'Enter any three of: Mass 1, Mass 2, Distance, Force.'
    );
  });

  it('throws when only one value provided', () => {
    expect(() => calculateGravitationalForce({ mass1: 100 })).toThrow();
  });

  it('throws when no values provided', () => {
    expect(() => calculateGravitationalForce({})).toThrow();
  });

  it('treats zero values as not provided', () => {
    expect(() => calculateGravitationalForce({ mass1: 0, mass2: 0, distance: 0 })).toThrow();
  });

  // ═══════════════════════════════════════════════════════
  // Output Structure
  // ═══════════════════════════════════════════════════════

  it('returns allValues with correct labels and units', () => {
    const result = calculateGravitationalForce({
      mass1: 5.972e24,
      mass2: 70,
      distance: 6371000,
    });
    const allValues = result.allValues as { label: string; value: number; unit: string }[];
    expect(allValues).toHaveLength(4);
    expect(allValues[0]).toEqual(expect.objectContaining({ label: 'Gravitational Force', unit: 'N' }));
    expect(allValues[1]).toEqual(expect.objectContaining({ label: 'Mass 1', unit: 'kg' }));
    expect(allValues[2]).toEqual(expect.objectContaining({ label: 'Mass 2', unit: 'kg' }));
    expect(allValues[3]).toEqual(expect.objectContaining({ label: 'Distance', unit: 'm' }));
  });

  it('handles string inputs by converting to numbers', () => {
    const result = calculateGravitationalForce({
      mass1: '5.972e24',
      mass2: '70',
      distance: '6371000',
    });
    expect(result.force).toBeCloseTo(687.07, 0);
  });

  it('uses first valid triplet when all 4 inputs provided', () => {
    const result = calculateGravitationalForce({
      mass1: 5.972e24,
      mass2: 70,
      distance: 6371000,
      force: 687,
    });
    expect(result.solvedFrom).toBe('Mass 1, Mass 2, and Distance');
  });
});
