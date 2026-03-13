import { calculateWork } from '@/lib/formulas/science/work';

describe('calculateWork', () => {
  // ═══════════════════════════════════════════════════════
  // Basic Calculations (angle = 0°)
  // ═══════════════════════════════════════════════════════

  it('calculates work at 0° angle (W = F × d)', () => {
    const result = calculateWork({ force: 100, distance: 5 });
    expect(result.work).toBeCloseTo(500, 4);
  });

  it('calculates work for lifting 10kg one meter (98.07 J)', () => {
    const result = calculateWork({ force: 98.0665, distance: 1 });
    expect(result.work).toBeCloseTo(98.0665, 2);
  });

  it('calculates large work value (pushing car: 500N for 50m)', () => {
    const result = calculateWork({ force: 500, distance: 50 });
    expect(result.work).toBeCloseTo(25000, 0);
  });

  // ═══════════════════════════════════════════════════════
  // Angular Calculations
  // ═══════════════════════════════════════════════════════

  it('calculates work at 30° angle', () => {
    const result = calculateWork({ force: 100, distance: 5, angle: 30 });
    // W = 100 × 5 × cos(30°) = 500 × 0.866 = 433.01
    expect(result.work).toBeCloseTo(433.01, 0);
  });

  it('calculates work at 45° angle', () => {
    const result = calculateWork({ force: 100, distance: 5, angle: 45 });
    // W = 100 × 5 × cos(45°) = 500 × 0.7071 = 353.55
    expect(result.work).toBeCloseTo(353.55, 0);
  });

  it('calculates work at 60° angle', () => {
    const result = calculateWork({ force: 100, distance: 5, angle: 60 });
    // W = 100 × 5 × cos(60°) = 500 × 0.5 = 250
    expect(result.work).toBeCloseTo(250, 2);
  });

  it('calculates zero work at 90° angle (perpendicular force)', () => {
    const result = calculateWork({ force: 100, distance: 5, angle: 90 });
    expect(result.work).toBeCloseTo(0, 4);
  });

  it('calculates negative work at 120° (opposing force)', () => {
    const result = calculateWork({ force: 100, distance: 5, angle: 120 });
    // cos(120°) = -0.5, W = -250
    expect(result.work).toBeCloseTo(-250, 2);
  });

  it('calculates full negative work at 180° (friction/braking)', () => {
    const result = calculateWork({ force: 100, distance: 5, angle: 180 });
    expect(result.work).toBeCloseTo(-500, 2);
  });

  // ═══════════════════════════════════════════════════════
  // Effective Force
  // ═══════════════════════════════════════════════════════

  it('returns correct effective force at 30°', () => {
    const result = calculateWork({ force: 100, distance: 5, angle: 30 });
    expect(result.effectiveForce).toBeCloseTo(86.6025, 2);
  });

  it('returns full force as effective at 0°', () => {
    const result = calculateWork({ force: 100, distance: 5, angle: 0 });
    expect(result.effectiveForce).toBeCloseTo(100, 4);
  });

  // ═══════════════════════════════════════════════════════
  // Unit Conversions
  // ═══════════════════════════════════════════════════════

  it('converts to kJ correctly (500 J = 0.5 kJ)', () => {
    const result = calculateWork({ force: 100, distance: 5 });
    const conv = result.conversions as Record<string, number>;
    expect(conv.work_kJ).toBeCloseTo(0.5, 4);
  });

  it('converts to calories correctly (500 J ≈ 119.5 cal)', () => {
    const result = calculateWork({ force: 100, distance: 5 });
    const conv = result.conversions as Record<string, number>;
    expect(conv.work_cal).toBeCloseTo(119.52, 0);
  });

  it('converts to BTU correctly (500 J ≈ 0.474 BTU)', () => {
    const result = calculateWork({ force: 100, distance: 5 });
    const conv = result.conversions as Record<string, number>;
    expect(conv.work_BTU).toBeCloseTo(0.4739, 2);
  });

  it('converts to ft·lb correctly (500 J ≈ 368.78 ft·lb)', () => {
    const result = calculateWork({ force: 100, distance: 5 });
    const conv = result.conversions as Record<string, number>;
    expect(conv.work_ftlb).toBeCloseTo(368.78, 0);
  });

  // ═══════════════════════════════════════════════════════
  // Breakdown Structure
  // ═══════════════════════════════════════════════════════

  it('uses simplified breakdown when angle is 0', () => {
    const result = calculateWork({ force: 100, distance: 5 });
    const breakdown = result.breakdown as { step: string; expression: string }[];
    expect(breakdown[0].expression).toContain('angle = 0°');
  });

  it('uses full breakdown with cos(θ) when angle > 0', () => {
    const result = calculateWork({ force: 100, distance: 5, angle: 45 });
    const breakdown = result.breakdown as { step: string; expression: string }[];
    expect(breakdown.find(b => b.step === 'Convert angle')).toBeDefined();
  });

  // ═══════════════════════════════════════════════════════
  // Error Cases
  // ═══════════════════════════════════════════════════════

  it('throws for negative force', () => {
    expect(() => calculateWork({ force: -10, distance: 5 })).toThrow('Force is required and must be a non-negative number.');
  });

  it('throws for missing distance', () => {
    expect(() => calculateWork({ force: 100 })).toThrow('Distance is required and must be a non-negative number.');
  });

  it('throws for angle > 180', () => {
    expect(() => calculateWork({ force: 100, distance: 5, angle: 200 })).toThrow('Angle must be between 0 and 180 degrees.');
  });

  it('throws for negative angle', () => {
    expect(() => calculateWork({ force: 100, distance: 5, angle: -10 })).toThrow('Angle must be between 0 and 180 degrees.');
  });

  // ═══════════════════════════════════════════════════════
  // String Inputs & Defaults
  // ═══════════════════════════════════════════════════════

  it('handles string inputs', () => {
    const result = calculateWork({ force: '100', distance: '5' });
    expect(result.work).toBeCloseTo(500, 4);
  });

  it('defaults angle to 0 when not provided', () => {
    const result = calculateWork({ force: 100, distance: 5 });
    expect(result.angle).toBe(0);
  });
});
