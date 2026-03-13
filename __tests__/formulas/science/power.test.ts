import { calculatePower } from '@/lib/formulas/science/power';

describe('calculatePower', () => {
  // ═══════════════════════════════════════════════════════
  // Work/Time Mode: P = W / t
  // ═══════════════════════════════════════════════════════

  it('calculates power from work=1000J and time=10s', () => {
    const result = calculatePower({ mode: 'work-time', work: 1000, time: 10 });
    expect(result.power).toBeCloseTo(100, 4);
    expect(result.mode).toBe('work-time');
  });

  it('calculates 1 watt (1J in 1s)', () => {
    const result = calculatePower({ mode: 'work-time', work: 1, time: 1 });
    expect(result.power).toBeCloseTo(1, 4);
  });

  it('calculates lightbulb power (3600J in 60s = 60W)', () => {
    const result = calculatePower({ mode: 'work-time', work: 3600, time: 60 });
    expect(result.power).toBeCloseTo(60, 4);
  });

  it('calculates kilowatt range (500000J in 10s = 50kW)', () => {
    const result = calculatePower({ mode: 'work-time', work: 500000, time: 10 });
    expect(result.power).toBeCloseTo(50000, 0);
  });

  // ═══════════════════════════════════════════════════════
  // Force/Velocity Mode: P = F × v
  // ═══════════════════════════════════════════════════════

  it('calculates power from force=500N and velocity=10 m/s', () => {
    const result = calculatePower({ mode: 'force-velocity', force: 500, velocity: 10 });
    expect(result.power).toBeCloseTo(5000, 4);
    expect(result.mode).toBe('force-velocity');
  });

  it('calculates cyclist power (20N drag at 10 m/s = 200W)', () => {
    const result = calculatePower({ mode: 'force-velocity', force: 20, velocity: 10 });
    expect(result.power).toBeCloseTo(200, 4);
  });

  it('calculates car engine power at highway speed', () => {
    // 300N air resistance at 30 m/s (108 km/h) = 9000W = 12.1 hp
    const result = calculatePower({ mode: 'force-velocity', force: 300, velocity: 30 });
    expect(result.power).toBeCloseTo(9000, 0);
  });

  // ═══════════════════════════════════════════════════════
  // Unit Conversions
  // ═══════════════════════════════════════════════════════

  it('converts to kilowatts correctly (5000W = 5 kW)', () => {
    const result = calculatePower({ mode: 'force-velocity', force: 500, velocity: 10 });
    const conv = result.conversions as Record<string, number>;
    expect(conv.power_kW).toBeCloseTo(5, 4);
  });

  it('converts to horsepower correctly (745.7W ≈ 1 hp)', () => {
    const result = calculatePower({ mode: 'work-time', work: 745.7, time: 1 });
    const conv = result.conversions as Record<string, number>;
    expect(conv.power_hp).toBeCloseTo(1, 1);
  });

  it('converts to BTU/h correctly (1W ≈ 3.412 BTU/h)', () => {
    const result = calculatePower({ mode: 'work-time', work: 1, time: 1 });
    const conv = result.conversions as Record<string, number>;
    expect(conv.power_BTUh).toBeCloseTo(3.41214, 2);
  });

  it('converts to ft·lb/s correctly (1W ≈ 0.7376 ft·lb/s)', () => {
    const result = calculatePower({ mode: 'work-time', work: 1, time: 1 });
    const conv = result.conversions as Record<string, number>;
    expect(conv.power_ftlbs).toBeCloseTo(0.7376, 2);
  });

  it('converts to MW correctly (1000000W = 1 MW)', () => {
    const result = calculatePower({ mode: 'work-time', work: 1000000, time: 1 });
    const conv = result.conversions as Record<string, number>;
    expect(conv.power_MW).toBeCloseTo(1, 4);
  });

  // ═══════════════════════════════════════════════════════
  // Cross-verification between modes
  // ═══════════════════════════════════════════════════════

  it('both modes agree for equivalent inputs', () => {
    // 500J over 10s = 50W; force 50N at 1 m/s = 50W
    const fromWorkTime = calculatePower({ mode: 'work-time', work: 500, time: 10 });
    const fromForceVel = calculatePower({ mode: 'force-velocity', force: 50, velocity: 1 });
    expect(fromWorkTime.power).toBeCloseTo(fromForceVel.power as number, 4);
  });

  // ═══════════════════════════════════════════════════════
  // Breakdown Structure
  // ═══════════════════════════════════════════════════════

  it('returns W/t formula in work-time mode', () => {
    const result = calculatePower({ mode: 'work-time', work: 1000, time: 10 });
    const breakdown = result.breakdown as { step: string; expression: string }[];
    expect(breakdown[0].expression).toBe('P = W / t');
  });

  it('returns F×v formula in force-velocity mode', () => {
    const result = calculatePower({ mode: 'force-velocity', force: 500, velocity: 10 });
    const breakdown = result.breakdown as { step: string; expression: string }[];
    expect(breakdown[0].expression).toBe('P = F × v');
  });

  // ═══════════════════════════════════════════════════════
  // Error Cases
  // ═══════════════════════════════════════════════════════

  it('throws for invalid mode', () => {
    expect(() => calculatePower({ mode: 'invalid' })).toThrow('Mode must be either "work-time" or "force-velocity".');
  });

  it('throws for missing work in work-time mode', () => {
    expect(() => calculatePower({ mode: 'work-time', time: 10 })).toThrow('Work/energy is required');
  });

  it('throws for zero time in work-time mode', () => {
    expect(() => calculatePower({ mode: 'work-time', work: 100, time: 0 })).toThrow('Time must be a positive number.');
  });

  it('throws for missing force in force-velocity mode', () => {
    expect(() => calculatePower({ mode: 'force-velocity', velocity: 10 })).toThrow('Force is required');
  });

  // ═══════════════════════════════════════════════════════
  // Defaults & String Inputs
  // ═══════════════════════════════════════════════════════

  it('defaults to work-time mode', () => {
    const result = calculatePower({ work: 1000, time: 10 });
    expect(result.mode).toBe('work-time');
    expect(result.power).toBeCloseTo(100, 4);
  });

  it('handles string inputs', () => {
    const result = calculatePower({ mode: 'work-time', work: '1000', time: '10' });
    expect(result.power).toBeCloseTo(100, 4);
  });
});
