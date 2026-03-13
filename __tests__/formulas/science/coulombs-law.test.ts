import { calculateCoulombsLaw } from '@/lib/formulas/science/coulombs-law';

describe('calculateCoulombsLaw', () => {
  const K = 8.9875517873681764e9;

  // ═══════════════════════════════════════════════════════
  // Solve for Force (given q1, q2, r)
  // ═══════════════════════════════════════════════════════

  it('calculates force between two +1 uC charges at 0.1 m', () => {
    const result = calculateCoulombsLaw({
      charge1: 1e-6,
      charge2: 1e-6,
      distance: 0.1,
    });
    // F = k * 1e-6 * 1e-6 / 0.01 = 8.9875517873681764e9 * 1e-12 / 0.01 ≈ 0.8988 N
    expect(result.forceMagnitude).toBeCloseTo(0.8988, 3);
    expect(result.forceDirection).toBe('Repulsive');
    expect(result.solvedFrom).toBe('Charge 1, Charge 2, and Distance');
  });

  it('calculates attractive force between opposite charges', () => {
    const result = calculateCoulombsLaw({
      charge1: 1e-6,
      charge2: -1e-6,
      distance: 0.1,
    });
    expect(result.forceMagnitude).toBeCloseTo(0.8988, 3);
    expect(result.forceDirection).toBe('Attractive');
  });

  it('calculates force between two negative charges (repulsive)', () => {
    const result = calculateCoulombsLaw({
      charge1: -2e-6,
      charge2: -3e-6,
      distance: 0.5,
    });
    // F = k * 2e-6 * 3e-6 / 0.25 = 8.9875517873681764e9 * 6e-12 / 0.25 ≈ 0.2157 N
    expect(result.forceMagnitude).toBeCloseTo(0.2157, 3);
    expect(result.forceDirection).toBe('Repulsive');
  });

  it('calculates force for electron-proton at Bohr radius', () => {
    const result = calculateCoulombsLaw({
      charge1: 1.602e-19,   // proton charge
      charge2: -1.602e-19,  // electron charge
      distance: 5.292e-11,  // Bohr radius
    });
    // F ≈ 8.24e-8 N
    expect(result.forceMagnitude).toBeCloseTo(8.24e-8, 9);
    expect(result.forceDirection).toBe('Attractive');
  });

  // ═══════════════════════════════════════════════════════
  // Solve for Charge 1 (given F, q2, r)
  // ═══════════════════════════════════════════════════════

  it('solves for charge1 given force, charge2, and distance', () => {
    const result = calculateCoulombsLaw({
      force: 0.8988,
      charge2: 1e-6,
      distance: 0.1,
    });
    // |q1| = F * r^2 / (k * |q2|) = 0.8988 * 0.01 / (8.9875e9 * 1e-6) ≈ 1e-6
    expect(result.charge1).toBeCloseTo(1e-6, 9);
    expect(result.solvedFrom).toBe('Force, Charge 2, and Distance');
  });

  // ═══════════════════════════════════════════════════════
  // Solve for Charge 2 (given F, q1, r)
  // ═══════════════════════════════════════════════════════

  it('solves for charge2 given force, charge1, and distance', () => {
    const result = calculateCoulombsLaw({
      force: 0.8988,
      charge1: 1e-6,
      distance: 0.1,
    });
    expect(result.charge2).toBeCloseTo(1e-6, 9);
    expect(result.solvedFrom).toBe('Force, Charge 1, and Distance');
  });

  // ═══════════════════════════════════════════════════════
  // Solve for Distance (given F, q1, q2)
  // ═══════════════════════════════════════════════════════

  it('solves for distance given force and both charges', () => {
    const result = calculateCoulombsLaw({
      force: 0.8988,
      charge1: 1e-6,
      charge2: 1e-6,
    });
    expect(result.distance).toBeCloseTo(0.1, 3);
    expect(result.solvedFrom).toBe('Force, Charge 1, and Charge 2');
  });

  it('solves for distance with larger charges', () => {
    const result = calculateCoulombsLaw({
      force: 3.595,
      charge1: 2e-6,
      charge2: 2e-6,
    });
    // r = sqrt(k * 2e-6 * 2e-6 / 3.595) = sqrt(8.9875e9 * 4e-12 / 3.595) ≈ 0.1 m
    expect(result.distance).toBeCloseTo(0.1, 2);
  });

  // ═══════════════════════════════════════════════════════
  // Cross-Verification
  // ═══════════════════════════════════════════════════════

  it('produces consistent results across all solver paths', () => {
    const fromCharges = calculateCoulombsLaw({
      charge1: 5e-6,
      charge2: 3e-6,
      distance: 0.2,
    });
    const F = fromCharges.forceMagnitude as number;

    const fromFQ2R = calculateCoulombsLaw({
      force: F,
      charge2: 3e-6,
      distance: 0.2,
    });
    expect(fromFQ2R.charge1).toBeCloseTo(5e-6, 9);

    const fromFQ1R = calculateCoulombsLaw({
      force: F,
      charge1: 5e-6,
      distance: 0.2,
    });
    expect(fromFQ1R.charge2).toBeCloseTo(3e-6, 9);

    const fromFQ1Q2 = calculateCoulombsLaw({
      force: F,
      charge1: 5e-6,
      charge2: 3e-6,
    });
    expect(fromFQ1Q2.distance).toBeCloseTo(0.2, 4);
  });

  // ═══════════════════════════════════════════════════════
  // Unit Conversions
  // ═══════════════════════════════════════════════════════

  it('converts force to lbf correctly', () => {
    const result = calculateCoulombsLaw({
      charge1: 1e-6,
      charge2: 1e-6,
      distance: 0.1,
    });
    const conv = result.conversions as Record<string, number>;
    expect(conv.force_lbf).toBeCloseTo(0.8988 * 0.224809, 3);
  });

  it('converts charges to microcoulombs', () => {
    const result = calculateCoulombsLaw({
      charge1: 5e-6,
      charge2: 3e-6,
      distance: 0.1,
    });
    const conv = result.conversions as Record<string, number>;
    expect(conv.charge1_uC).toBeCloseTo(5, 2);
    expect(conv.charge2_uC).toBeCloseTo(3, 2);
  });

  it('converts charges to nanocoulombs', () => {
    const result = calculateCoulombsLaw({
      charge1: 5e-9,
      charge2: 3e-9,
      distance: 0.01,
    });
    const conv = result.conversions as Record<string, number>;
    expect(conv.charge1_nC).toBeCloseTo(5, 2);
    expect(conv.charge2_nC).toBeCloseTo(3, 2);
  });

  it('converts distance to cm and mm', () => {
    const result = calculateCoulombsLaw({
      charge1: 1e-6,
      charge2: 1e-6,
      distance: 0.1,
    });
    const conv = result.conversions as Record<string, number>;
    expect(conv.distance_cm).toBeCloseTo(10, 2);
    expect(conv.distance_mm).toBeCloseTo(100, 2);
  });

  // ═══════════════════════════════════════════════════════
  // Edge Cases
  // ═══════════════════════════════════════════════════════

  it('handles very small charges (electron charge)', () => {
    const result = calculateCoulombsLaw({
      charge1: 1.602e-19,
      charge2: 1.602e-19,
      distance: 1e-10,
    });
    expect(result.forceMagnitude).toBeGreaterThan(0);
    expect(result.forceMagnitude).toBeCloseTo(2.307e-8, 10);
  });

  it('handles very large charges', () => {
    const result = calculateCoulombsLaw({
      charge1: 1,
      charge2: 1,
      distance: 1,
    });
    // F = k ≈ 8.988e9 N
    expect(result.forceMagnitude).toBeCloseTo(K, 0);
  });

  it('handles negative charge1 with positive charge2', () => {
    const result = calculateCoulombsLaw({
      charge1: -1e-6,
      charge2: 1e-6,
      distance: 0.1,
    });
    expect(result.forceMagnitude).toBeCloseTo(0.8988, 3);
    expect(result.forceDirection).toBe('Attractive');
  });

  // ═══════════════════════════════════════════════════════
  // Error Cases
  // ═══════════════════════════════════════════════════════

  it('throws when fewer than 3 values provided', () => {
    expect(() => calculateCoulombsLaw({ charge1: 1e-6, charge2: 1e-6 })).toThrow(
      'Enter any three of: Charge 1, Charge 2, Distance, Force.'
    );
  });

  it('throws when no values provided', () => {
    expect(() => calculateCoulombsLaw({})).toThrow();
  });

  it('treats zero charge as not provided', () => {
    expect(() => calculateCoulombsLaw({ charge1: 0, charge2: 1e-6, distance: 0.1 })).toThrow();
  });

  // ═══════════════════════════════════════════════════════
  // Output Structure
  // ═══════════════════════════════════════════════════════

  it('returns allValues with correct labels and units', () => {
    const result = calculateCoulombsLaw({
      charge1: 1e-6,
      charge2: 1e-6,
      distance: 0.1,
    });
    const allValues = result.allValues as { label: string; value: number | string; unit: string }[];
    expect(allValues.length).toBeGreaterThanOrEqual(5);
    expect(allValues[0]).toEqual(expect.objectContaining({ label: 'Force Magnitude', unit: 'N' }));
    expect(allValues[1]).toEqual(expect.objectContaining({ label: 'Force Direction' }));
    expect(allValues[2]).toEqual(expect.objectContaining({ label: 'Charge 1', unit: 'C' }));
    expect(allValues[3]).toEqual(expect.objectContaining({ label: 'Charge 2', unit: 'C' }));
    expect(allValues[4]).toEqual(expect.objectContaining({ label: 'Distance', unit: 'm' }));
  });

  it('handles string inputs by converting to numbers', () => {
    const result = calculateCoulombsLaw({
      charge1: '1e-6',
      charge2: '1e-6',
      distance: '0.1',
    });
    expect(result.forceMagnitude).toBeCloseTo(0.8988, 3);
  });

  it('uses first valid triplet when all 4 inputs provided', () => {
    const result = calculateCoulombsLaw({
      charge1: 1e-6,
      charge2: 1e-6,
      distance: 0.1,
      force: 0.9,
    });
    expect(result.solvedFrom).toBe('Charge 1, Charge 2, and Distance');
  });
});
