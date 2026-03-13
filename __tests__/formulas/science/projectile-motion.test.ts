import { calculateProjectileMotion } from '@/lib/formulas/science/projectile-motion';

describe('calculateProjectileMotion', () => {
  // ─── Test 1: Classic 45° launch on flat ground ───
  it('calculates range for 20 m/s at 45° on flat ground', () => {
    const result = calculateProjectileMotion({
      initialVelocity: 20,
      launchAngle: 45,
      initialHeight: 0,
      gravity: 9.81,
    });
    // R = v0² * sin(2*45°) / g = 400 * 1 / 9.81 ≈ 40.77 m
    expect(result.range).toBeCloseTo(40.77, 1);
  });

  // ─── Test 2: Maximum height at 45° ───
  it('calculates max height for 20 m/s at 45°', () => {
    const result = calculateProjectileMotion({
      initialVelocity: 20,
      launchAngle: 45,
      initialHeight: 0,
      gravity: 9.81,
    });
    // H = (20*sin45)² / (2*9.81) = (14.142)² / 19.62 ≈ 10.19 m
    expect(result.maxHeight).toBeCloseTo(10.19, 1);
  });

  // ─── Test 3: Time of flight at 45° ───
  it('calculates time of flight for 20 m/s at 45° on flat ground', () => {
    const result = calculateProjectileMotion({
      initialVelocity: 20,
      launchAngle: 45,
      initialHeight: 0,
      gravity: 9.81,
    });
    // T = 2*v0*sin(45°)/g = 2*20*0.7071/9.81 ≈ 2.88 s
    expect(result.timeOfFlight).toBeCloseTo(2.88, 1);
  });

  // ─── Test 4: 0° angle (horizontal launch from height) ───
  it('calculates horizontal launch from height', () => {
    const result = calculateProjectileMotion({
      initialVelocity: 10,
      launchAngle: 0,
      initialHeight: 20,
      gravity: 9.81,
    });
    // T = sqrt(2*h0/g) = sqrt(40/9.81) ≈ 2.02 s
    // R = 10 * 2.02 ≈ 20.2 m
    expect(result.timeOfFlight).toBeCloseTo(2.02, 1);
    expect(result.range).toBeCloseTo(20.20, 0);
    expect(result.maxHeight).toBeCloseTo(20, 1);
  });

  // ─── Test 5: 90° angle (straight up) ───
  it('calculates straight-up launch (90°)', () => {
    const result = calculateProjectileMotion({
      initialVelocity: 30,
      launchAngle: 90,
      initialHeight: 0,
      gravity: 9.81,
    });
    // H = 30²/(2*9.81) ≈ 45.87 m
    // T = 2*30/9.81 ≈ 6.12 s
    // Range ≈ 0 (cos90 = 0)
    expect(result.maxHeight).toBeCloseTo(45.87, 0);
    expect(result.timeOfFlight).toBeCloseTo(6.12, 1);
    expect(result.range).toBeCloseTo(0, 0);
  });

  // ─── Test 6: Impact velocity equals initial velocity on flat ground ───
  it('impact velocity equals initial velocity on flat ground (energy conservation)', () => {
    const result = calculateProjectileMotion({
      initialVelocity: 25,
      launchAngle: 60,
      initialHeight: 0,
      gravity: 9.81,
    });
    expect(result.impactVelocity).toBeCloseTo(25, 0);
  });

  // ─── Test 7: Impact velocity greater than initial when launched from height ───
  it('impact velocity exceeds initial velocity when launched from height', () => {
    const result = calculateProjectileMotion({
      initialVelocity: 15,
      launchAngle: 30,
      initialHeight: 50,
      gravity: 9.81,
    });
    expect(result.impactVelocity as number).toBeGreaterThan(15);
  });

  // ─── Test 8: Horizontal velocity component ───
  it('calculates horizontal velocity correctly', () => {
    const result = calculateProjectileMotion({
      initialVelocity: 20,
      launchAngle: 60,
      initialHeight: 0,
      gravity: 9.81,
    });
    // vx = 20 * cos(60°) = 20 * 0.5 = 10
    expect(result.horizontalVelocity).toBeCloseTo(10, 1);
  });

  // ─── Test 9: Initial vertical velocity component ───
  it('calculates initial vertical velocity correctly', () => {
    const result = calculateProjectileMotion({
      initialVelocity: 20,
      launchAngle: 30,
      initialHeight: 0,
      gravity: 9.81,
    });
    // vy0 = 20 * sin(30°) = 20 * 0.5 = 10
    expect(result.verticalVelocityInitial).toBeCloseTo(10, 1);
  });

  // ─── Test 10: Final vertical velocity is negative on flat ground ───
  it('final vertical velocity is negative (downward) on flat ground', () => {
    const result = calculateProjectileMotion({
      initialVelocity: 20,
      launchAngle: 45,
      initialHeight: 0,
      gravity: 9.81,
    });
    expect(result.verticalVelocityFinal as number).toBeLessThan(0);
  });

  // ─── Test 11: Trajectory data has 51 points ───
  it('generates 51 trajectory data points (0 to 50)', () => {
    const result = calculateProjectileMotion({
      initialVelocity: 20,
      launchAngle: 45,
      initialHeight: 0,
      gravity: 9.81,
    });
    const traj = result.trajectoryData as { x: number; y: number; t: number }[];
    expect(traj).toHaveLength(51);
  });

  // ─── Test 12: Trajectory first point starts at origin (or initial height) ───
  it('trajectory starts at (0, h0)', () => {
    const result = calculateProjectileMotion({
      initialVelocity: 20,
      launchAngle: 45,
      initialHeight: 5,
      gravity: 9.81,
    });
    const traj = result.trajectoryData as { x: number; y: number; t: number }[];
    expect(traj[0].x).toBe(0);
    expect(traj[0].y).toBe(5);
    expect(traj[0].t).toBe(0);
  });

  // ─── Test 13: Trajectory last point is near ground level ───
  it('trajectory last point y is at ground level', () => {
    const result = calculateProjectileMotion({
      initialVelocity: 20,
      launchAngle: 45,
      initialHeight: 0,
      gravity: 9.81,
    });
    const traj = result.trajectoryData as { x: number; y: number; t: number }[];
    expect(traj[traj.length - 1].y).toBeCloseTo(0, 0);
  });

  // ─── Test 14: String input coercion ───
  it('handles string inputs by converting to numbers', () => {
    const result = calculateProjectileMotion({
      initialVelocity: '20',
      launchAngle: '45',
      initialHeight: '0',
      gravity: '9.81',
    });
    expect(result.range).toBeCloseTo(40.77, 1);
  });

  // ─── Test 15: Missing inputs default to zero/default ───
  it('uses defaults when inputs are missing', () => {
    const result = calculateProjectileMotion({
      initialVelocity: 20,
      launchAngle: 45,
    });
    // initialHeight defaults to 0, gravity defaults to 9.80665
    expect(result.range).toBeCloseTo(40.77, 0);
    expect(result.maxHeight).toBeGreaterThan(0);
  });

  // ─── Test 16: Zero velocity and zero height returns zeros ───
  it('returns all zeros for v0=0 and h0=0', () => {
    const result = calculateProjectileMotion({
      initialVelocity: 0,
      launchAngle: 45,
      initialHeight: 0,
      gravity: 9.81,
    });
    expect(result.range).toBe(0);
    expect(result.maxHeight).toBe(0);
    expect(result.timeOfFlight).toBe(0);
    expect(result.impactVelocity).toBe(0);
  });

  // ─── Test 17: Dropped from height (v0=0, h0>0) ───
  it('calculates free fall when v0=0 but h0>0', () => {
    const result = calculateProjectileMotion({
      initialVelocity: 0,
      launchAngle: 0,
      initialHeight: 100,
      gravity: 9.81,
    });
    // T = sqrt(2*100/9.81) ≈ 4.52 s
    expect(result.timeOfFlight).toBeCloseTo(4.52, 1);
    expect(result.range).toBeCloseTo(0, 1);
    expect(result.maxHeight).toBe(100);
    // impact velocity = sqrt(2*g*h) ≈ sqrt(1962) ≈ 44.29
    expect(result.impactVelocity).toBeCloseTo(44.29, 0);
  });

  // ─── Test 18: Low gravity (Moon: 1.625 m/s²) ───
  it('calculates for lunar gravity (1.625 m/s²)', () => {
    const result = calculateProjectileMotion({
      initialVelocity: 20,
      launchAngle: 45,
      initialHeight: 0,
      gravity: 1.625,
    });
    // Range on Moon should be ~6x Earth range
    expect(result.range as number).toBeGreaterThan(200);
  });

  // ─── Test 19: Large velocity (artillery) ───
  it('handles large velocity values (500 m/s)', () => {
    const result = calculateProjectileMotion({
      initialVelocity: 500,
      launchAngle: 45,
      initialHeight: 0,
      gravity: 9.81,
    });
    // R = 500² * sin(90°) / 9.81 ≈ 25484 m
    expect(result.range).toBeCloseTo(25484, -1);
  });

  // ─── Test 20: Negative velocity clamped to 0 ───
  it('clamps negative velocity to 0', () => {
    const result = calculateProjectileMotion({
      initialVelocity: -10,
      launchAngle: 45,
      initialHeight: 0,
      gravity: 9.81,
    });
    expect(result.range).toBe(0);
    expect(result.timeOfFlight).toBe(0);
  });

  // ─── Test 21: Angle clamped within 0-90 ───
  it('clamps angle above 90 to 90', () => {
    const result = calculateProjectileMotion({
      initialVelocity: 20,
      launchAngle: 100,
      initialHeight: 0,
      gravity: 9.81,
    });
    // Clamped to 90°, so range ≈ 0
    expect(result.range).toBeCloseTo(0, 0);
  });

  // ─── Test 22: allValues output structure ───
  it('returns allValues with correct labels and units', () => {
    const result = calculateProjectileMotion({
      initialVelocity: 20,
      launchAngle: 45,
      initialHeight: 0,
      gravity: 9.81,
    });
    const allValues = result.allValues as { label: string; value: number; unit: string }[];
    expect(allValues.length).toBeGreaterThanOrEqual(4);
    expect(allValues[0]).toEqual(expect.objectContaining({ label: 'Range', unit: 'm' }));
    expect(allValues[1]).toEqual(expect.objectContaining({ label: 'Maximum Height', unit: 'm' }));
    expect(allValues[2]).toEqual(expect.objectContaining({ label: 'Time of Flight', unit: 's' }));
    expect(allValues[3]).toEqual(expect.objectContaining({ label: 'Impact Velocity', unit: 'm/s' }));
  });

  // ─── Test 23: Symmetry — complementary angles give same range on flat ground ───
  it('complementary angles (30° and 60°) produce the same range on flat ground', () => {
    const result30 = calculateProjectileMotion({
      initialVelocity: 25,
      launchAngle: 30,
      initialHeight: 0,
      gravity: 9.81,
    });
    const result60 = calculateProjectileMotion({
      initialVelocity: 25,
      launchAngle: 60,
      initialHeight: 0,
      gravity: 9.81,
    });
    expect(result30.range).toBeCloseTo(result60.range as number, 1);
  });

  // ─── Test 24: With initial height, range increases ───
  it('initial height increases range compared to ground level', () => {
    const flat = calculateProjectileMotion({
      initialVelocity: 20,
      launchAngle: 45,
      initialHeight: 0,
      gravity: 9.81,
    });
    const elevated = calculateProjectileMotion({
      initialVelocity: 20,
      launchAngle: 45,
      initialHeight: 10,
      gravity: 9.81,
    });
    expect(elevated.range as number).toBeGreaterThan(flat.range as number);
  });

  // ─── Test 25: Gravity clamped to minimum 0.1 ───
  it('clamps gravity to minimum 0.1', () => {
    const result = calculateProjectileMotion({
      initialVelocity: 20,
      launchAngle: 45,
      initialHeight: 0,
      gravity: 0,
    });
    // Gravity defaults to 0.1, not 0
    expect(result.timeOfFlight as number).toBeGreaterThan(0);
    expect(result.range as number).toBeGreaterThan(0);
  });
});
