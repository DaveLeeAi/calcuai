import { calculateAcceleration } from '@/lib/formulas/science/acceleration';

describe('calculateAcceleration', () => {
  // ═══════════════════════════════════════════════════════
  // Kinematic Mode: a = (vf - vi) / t
  // ═══════════════════════════════════════════════════════

  it('calculates acceleration from 0 to 100 m/s in 10s', () => {
    const result = calculateAcceleration({ mode: 'kinematic', initialVelocity: 0, finalVelocity: 100, time: 10 });
    expect(result.acceleration).toBeCloseTo(10, 4);
    expect(result.mode).toBe('kinematic');
  });

  it('calculates deceleration (braking: 30 to 0 m/s in 5s)', () => {
    const result = calculateAcceleration({ mode: 'kinematic', initialVelocity: 30, finalVelocity: 0, time: 5 });
    expect(result.acceleration).toBeCloseTo(-6, 4);
  });

  it('calculates car 0-60mph acceleration (0 to 26.82 m/s in 6s)', () => {
    const result = calculateAcceleration({ mode: 'kinematic', initialVelocity: 0, finalVelocity: 26.82, time: 6 });
    expect(result.acceleration).toBeCloseTo(4.47, 1);
  });

  it('handles equal initial and final velocity (zero acceleration)', () => {
    const result = calculateAcceleration({ mode: 'kinematic', initialVelocity: 50, finalVelocity: 50, time: 10 });
    expect(result.acceleration).toBeCloseTo(0, 6);
  });

  it('calculates gravitational free-fall (0 to 9.81 m/s in 1s)', () => {
    const result = calculateAcceleration({ mode: 'kinematic', initialVelocity: 0, finalVelocity: 9.80665, time: 1 });
    expect(result.acceleration).toBeCloseTo(9.80665, 3);
  });

  // ═══════════════════════════════════════════════════════
  // Force Mode: a = F / m
  // ═══════════════════════════════════════════════════════

  it('calculates acceleration from force=100N, mass=20kg', () => {
    const result = calculateAcceleration({ mode: 'force', force: 100, mass: 20 });
    expect(result.acceleration).toBeCloseTo(5, 4);
    expect(result.mode).toBe('force');
  });

  it('calculates gravitational acceleration (686.47N / 70kg)', () => {
    const result = calculateAcceleration({ mode: 'force', force: 686.4655, mass: 70 });
    expect(result.acceleration).toBeCloseTo(9.80665, 2);
  });

  it('calculates rocket acceleration (1500000N / 50000kg)', () => {
    const result = calculateAcceleration({ mode: 'force', force: 1500000, mass: 50000 });
    expect(result.acceleration).toBeCloseTo(30, 4);
  });

  // ═══════════════════════════════════════════════════════
  // Unit Conversions
  // ═══════════════════════════════════════════════════════

  it('converts to g-force correctly (9.80665 m/s² = 1g)', () => {
    const result = calculateAcceleration({ mode: 'kinematic', initialVelocity: 0, finalVelocity: 9.80665, time: 1 });
    const conv = result.conversions as Record<string, number>;
    expect(conv.acceleration_g).toBeCloseTo(1, 2);
  });

  it('converts to ft/s² correctly (10 m/s² ≈ 32.81 ft/s²)', () => {
    const result = calculateAcceleration({ mode: 'force', force: 100, mass: 10 });
    const conv = result.conversions as Record<string, number>;
    expect(conv.acceleration_fts2).toBeCloseTo(32.8084, 2);
  });

  it('converts to km/h/s correctly (10 m/s² = 36 km/h/s)', () => {
    const result = calculateAcceleration({ mode: 'force', force: 100, mass: 10 });
    const conv = result.conversions as Record<string, number>;
    expect(conv.acceleration_kmhs).toBeCloseTo(36, 2);
  });

  // ═══════════════════════════════════════════════════════
  // Breakdown Structure
  // ═══════════════════════════════════════════════════════

  it('returns breakdown with velocity change in kinematic mode', () => {
    const result = calculateAcceleration({ mode: 'kinematic', initialVelocity: 0, finalVelocity: 100, time: 10 });
    const allValues = result.allValues as { label: string; value: number; unit: string }[];
    const deltaV = allValues.find(v => v.label === 'Velocity Change');
    expect(deltaV).toBeDefined();
    expect(deltaV!.value).toBeCloseTo(100, 4);
  });

  it('returns force and mass in force mode allValues', () => {
    const result = calculateAcceleration({ mode: 'force', force: 100, mass: 20 });
    const allValues = result.allValues as { label: string; value: number; unit: string }[];
    expect(allValues.find(v => v.label === 'Force')).toBeDefined();
    expect(allValues.find(v => v.label === 'Mass')).toBeDefined();
  });

  // ═══════════════════════════════════════════════════════
  // Error Cases
  // ═══════════════════════════════════════════════════════

  it('throws for invalid mode', () => {
    expect(() => calculateAcceleration({ mode: 'invalid' })).toThrow('Mode must be either "kinematic" or "force".');
  });

  it('throws when kinematic mode missing initial velocity', () => {
    expect(() => calculateAcceleration({ mode: 'kinematic', finalVelocity: 10, time: 5 })).toThrow('Initial velocity is required');
  });

  it('throws when kinematic mode has zero time', () => {
    expect(() => calculateAcceleration({ mode: 'kinematic', initialVelocity: 0, finalVelocity: 10, time: 0 })).toThrow('Time must be a positive number');
  });

  it('throws when force mode missing force', () => {
    expect(() => calculateAcceleration({ mode: 'force', mass: 10 })).toThrow('Force is required');
  });

  it('throws when force mode has zero mass', () => {
    expect(() => calculateAcceleration({ mode: 'force', force: 100, mass: 0 })).toThrow('Mass must be a positive number');
  });

  // ═══════════════════════════════════════════════════════
  // String Inputs
  // ═══════════════════════════════════════════════════════

  it('handles string inputs by converting to numbers', () => {
    const result = calculateAcceleration({ mode: 'kinematic', initialVelocity: '0', finalVelocity: '100', time: '10' });
    expect(result.acceleration).toBeCloseTo(10, 4);
  });

  it('defaults to kinematic mode when mode not specified', () => {
    const result = calculateAcceleration({ initialVelocity: 0, finalVelocity: 100, time: 10 });
    expect(result.mode).toBe('kinematic');
    expect(result.acceleration).toBeCloseTo(10, 4);
  });
});
