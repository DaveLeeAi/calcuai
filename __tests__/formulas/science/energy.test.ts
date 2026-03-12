import { calculateEnergy } from '@/lib/formulas/science/energy';

describe('calculateEnergy', () => {
  // ═══════════════════════════════════════════════════════
  // Kinetic Energy: KE = ½mv²
  // ═══════════════════════════════════════════════════════

  // ─── Test 1: Basic kinetic — mass=1, velocity=10 → KE = 50 J ───
  it('calculates kinetic energy for mass=1 and velocity=10', () => {
    const result = calculateEnergy({ mode: 'kinetic', mass: 1, velocity: 10 });
    expect(result.energy).toBeCloseTo(50, 4);
    expect(result.mode).toBe('kinetic');
  });

  // ─── Test 2: Car at 100 km/h — mass=1500, velocity=27.78 → KE ≈ 578703 J ───
  it('calculates kinetic energy for a car at 100 km/h', () => {
    const result = calculateEnergy({ mode: 'kinetic', mass: 1500, velocity: 27.78 });
    // KE = 0.5 × 1500 × 27.78² = 578796.3
    expect(result.energy).toBeCloseTo(578796.3, -1);
  });

  // ─── Test 3: Baseball pitch — mass=0.145, velocity=40 → KE = 116 J ───
  it('calculates kinetic energy for a baseball pitch', () => {
    const result = calculateEnergy({ mode: 'kinetic', mass: 0.145, velocity: 40 });
    expect(result.energy).toBeCloseTo(116, 0);
  });

  // ─── Test 4: Tennis ball serve — mass=0.057, velocity=70 → KE ≈ 139.65 J ───
  it('calculates kinetic energy for a tennis ball serve', () => {
    const result = calculateEnergy({ mode: 'kinetic', mass: 0.057, velocity: 70 });
    expect(result.energy).toBeCloseTo(139.65, 0);
  });

  // ═══════════════════════════════════════════════════════
  // Potential Energy: PE = mgh
  // ═══════════════════════════════════════════════════════

  // ─── Test 5: Basic potential — mass=10, height=10 → PE ≈ 980.665 J ───
  it('calculates potential energy for mass=10 and height=10', () => {
    const result = calculateEnergy({ mode: 'potential', mass: 10, height: 10 });
    expect(result.energy).toBeCloseTo(980.665, 2);
    expect(result.mode).toBe('potential');
  });

  // ─── Test 6: Water dam — mass=1000, height=50 → PE ≈ 490332.5 J ───
  it('calculates potential energy for water behind a dam', () => {
    const result = calculateEnergy({ mode: 'potential', mass: 1000, height: 50 });
    expect(result.energy).toBeCloseTo(490332.5, 0);
  });

  // ─── Test 7: Skydiver — mass=80, height=100 → PE ≈ 78453.2 J ───
  it('calculates potential energy for a skydiver at 100m', () => {
    const result = calculateEnergy({ mode: 'potential', mass: 80, height: 100 });
    expect(result.energy).toBeCloseTo(78453.2, 0);
  });

  // ─── Test 8: Custom gravity (Moon) — mass=10, height=10, gravity=1.625 → PE = 162.5 J ───
  it('calculates potential energy with custom gravity (Moon)', () => {
    const result = calculateEnergy({ mode: 'potential', mass: 10, height: 10, gravity: 1.625 });
    expect(result.energy).toBeCloseTo(162.5, 4);
  });

  // ═══════════════════════════════════════════════════════
  // Unit Conversions
  // ═══════════════════════════════════════════════════════

  // ─── Test 9: energy_kj conversion (50 J = 0.05 kJ) ───
  it('converts energy to kJ correctly', () => {
    const result = calculateEnergy({ mode: 'kinetic', mass: 1, velocity: 10 });
    const conv = result.conversions as Record<string, number>;
    expect(conv.energy_kj).toBeCloseTo(0.05, 4);
  });

  // ─── Test 10: energy_cal conversion (50 J ≈ 11.95 cal) ───
  it('converts energy to calories correctly', () => {
    const result = calculateEnergy({ mode: 'kinetic', mass: 1, velocity: 10 });
    const conv = result.conversions as Record<string, number>;
    expect(conv.energy_cal).toBeCloseTo(11.95, 1);
  });

  // ─── Test 11: energy_btu conversion ───
  it('converts energy to BTU correctly', () => {
    const result = calculateEnergy({ mode: 'kinetic', mass: 1, velocity: 10 });
    const conv = result.conversions as Record<string, number>;
    // 50 J ≈ 0.04739 BTU
    expect(conv.energy_btu).toBeCloseTo(0.04739, 3);
  });

  // ═══════════════════════════════════════════════════════
  // Edge Cases
  // ═══════════════════════════════════════════════════════

  // ─── Test 12: Zero velocity kinetic → KE = 0 J ───
  it('returns zero kinetic energy for zero velocity', () => {
    const result = calculateEnergy({ mode: 'kinetic', mass: 10, velocity: 0 });
    expect(result.energy).toBeCloseTo(0, 4);
  });

  // ─── Test 13: Negative height potential (below reference) ───
  it('handles negative height for potential energy', () => {
    const result = calculateEnergy({ mode: 'potential', mass: 10, height: -5 });
    expect(result.energy).toBeCloseTo(-490.3325, 2);
  });

  // ─── Test 14: Default gravity (9.80665) when not provided ───
  it('uses default gravity of 9.80665 when not provided', () => {
    const resultDefault = calculateEnergy({ mode: 'potential', mass: 10, height: 10 });
    const resultExplicit = calculateEnergy({ mode: 'potential', mass: 10, height: 10, gravity: 9.80665 });
    expect(resultDefault.energy).toBeCloseTo(resultExplicit.energy as number, 4);
  });

  // ═══════════════════════════════════════════════════════
  // Error Cases
  // ═══════════════════════════════════════════════════════

  // ─── Test 15: Missing mass throws error ───
  it('throws error when mass is missing', () => {
    expect(() => calculateEnergy({ mode: 'kinetic', velocity: 10 })).toThrow();
  });

  // ─── Test 16: Kinetic mode with missing velocity throws error ───
  it('throws error when kinetic mode has missing velocity', () => {
    expect(() => calculateEnergy({ mode: 'kinetic', mass: 10 })).toThrow();
  });

  // ─── Test 17: Potential mode with missing height throws error ───
  it('throws error when potential mode has missing height', () => {
    expect(() => calculateEnergy({ mode: 'potential', mass: 10 })).toThrow();
  });

  // ─── Test 18: Invalid mode throws error ───
  it('throws error when an invalid mode is provided', () => {
    expect(() => calculateEnergy({ mode: 'invalid', mass: 10, velocity: 10 })).toThrow();
  });

  // ═══════════════════════════════════════════════════════
  // Output Structure
  // ═══════════════════════════════════════════════════════

  // ─── Test 19: allValues structure check ───
  it('returns allValues with correct labels and units', () => {
    const result = calculateEnergy({ mode: 'kinetic', mass: 1, velocity: 10 });
    const allValues = result.allValues as { label: string; value: number; unit: string }[];
    expect(allValues).toBeDefined();
    expect(allValues.length).toBeGreaterThanOrEqual(2);
    const labels = allValues.map((v) => v.label);
    expect(labels).toContain('Energy');
    expect(labels).toContain('Mass');
  });

  // ─── Test 20: breakdown array check ───
  it('returns breakdown array with calculation steps', () => {
    const result = calculateEnergy({ mode: 'kinetic', mass: 1, velocity: 10 });
    const breakdown = result.breakdown as { label: string; value: string }[];
    expect(breakdown).toBeDefined();
    expect(breakdown.length).toBeGreaterThanOrEqual(1);
  });
});
