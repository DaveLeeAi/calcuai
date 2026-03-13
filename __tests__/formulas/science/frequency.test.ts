import { calculateFrequency } from '@/lib/formulas/science/frequency';

describe('calculateFrequency', () => {
  // ═══════════════════════════════════════════════════════
  // Period Mode: f = 1/T
  // ═══════════════════════════════════════════════════════

  it('calculates frequency from period=0.01s (100 Hz)', () => {
    const result = calculateFrequency({ mode: 'period', period: 0.01 });
    expect(result.frequency).toBeCloseTo(100, 4);
    expect(result.period).toBeCloseTo(0.01, 4);
  });

  it('calculates frequency of AC power (period=0.01667s → 60 Hz)', () => {
    const result = calculateFrequency({ mode: 'period', period: 1 / 60 });
    expect(result.frequency).toBeCloseTo(60, 2);
  });

  it('calculates period from frequency=440 Hz (A4 note)', () => {
    const result = calculateFrequency({ mode: 'period', frequency: 440 });
    expect(result.period).toBeCloseTo(0.002273, 4);
    expect(result.frequency).toBeCloseTo(440, 4);
  });

  it('calculates period from 1 MHz', () => {
    const result = calculateFrequency({ mode: 'period', frequency: 1000000 });
    expect(result.period).toBeCloseTo(0.000001, 8);
  });

  // ═══════════════════════════════════════════════════════
  // Wave Mode: f = v / λ
  // ═══════════════════════════════════════════════════════

  it('calculates frequency of sound wave (343 m/s, λ=1m → 343 Hz)', () => {
    const result = calculateFrequency({ mode: 'wave', waveSpeed: 343, wavelength: 1 });
    expect(result.frequency).toBeCloseTo(343, 4);
    expect(result.mode).toBe('wave');
  });

  it('calculates FM radio frequency (light speed, λ=3m → 100 MHz)', () => {
    const result = calculateFrequency({ mode: 'wave', waveSpeed: 299792458, wavelength: 3 });
    expect(result.frequency).toBeCloseTo(99930819.33, -2);
  });

  it('calculates visible light frequency (λ=550nm, green light)', () => {
    // f = c / λ = 299792458 / 550e-9 ≈ 5.45 × 10^14 Hz
    const result = calculateFrequency({ mode: 'wave', waveSpeed: 299792458, wavelength: 550e-9 });
    expect(result.frequency / 1e14).toBeCloseTo(5.4508, 2);
  });

  // ═══════════════════════════════════════════════════════
  // Unit Conversions
  // ═══════════════════════════════════════════════════════

  it('converts to kHz correctly (1000 Hz = 1 kHz)', () => {
    const result = calculateFrequency({ mode: 'period', period: 0.001 });
    const conv = result.conversions as Record<string, number>;
    expect(conv.frequency_kHz).toBeCloseTo(1, 4);
  });

  it('converts to MHz correctly (1000000 Hz = 1 MHz)', () => {
    const result = calculateFrequency({ mode: 'period', frequency: 1000000 });
    const conv = result.conversions as Record<string, number>;
    expect(conv.frequency_MHz).toBeCloseTo(1, 4);
  });

  it('converts to rpm correctly (60 Hz = 3600 rpm)', () => {
    const result = calculateFrequency({ mode: 'period', frequency: 60 });
    const conv = result.conversions as Record<string, number>;
    expect(conv.frequency_rpm).toBeCloseTo(3600, 0);
  });

  it('converts to rad/s correctly (1 Hz ≈ 6.2832 rad/s)', () => {
    const result = calculateFrequency({ mode: 'period', frequency: 1 });
    const conv = result.conversions as Record<string, number>;
    expect(conv.frequency_rads).toBeCloseTo(6.2832, 2);
  });

  it('converts period to milliseconds (0.01s = 10 ms)', () => {
    const result = calculateFrequency({ mode: 'period', period: 0.01 });
    const conv = result.conversions as Record<string, number>;
    expect(conv.period_ms).toBeCloseTo(10, 2);
  });

  it('converts period to microseconds', () => {
    const result = calculateFrequency({ mode: 'period', frequency: 1000000 });
    const conv = result.conversions as Record<string, number>;
    expect(conv.period_us).toBeCloseTo(1, 2);
  });

  // ═══════════════════════════════════════════════════════
  // Reciprocal Consistency
  // ═══════════════════════════════════════════════════════

  it('f from period and period from f are reciprocals', () => {
    const fromPeriod = calculateFrequency({ mode: 'period', period: 0.005 });
    const fromFreq = calculateFrequency({ mode: 'period', frequency: 200 });
    expect(fromPeriod.frequency).toBeCloseTo(fromFreq.frequency as number, 4);
    expect(fromPeriod.period).toBeCloseTo(fromFreq.period as number, 4);
  });

  // ═══════════════════════════════════════════════════════
  // Wave mode also returns period
  // ═══════════════════════════════════════════════════════

  it('wave mode returns period as well', () => {
    const result = calculateFrequency({ mode: 'wave', waveSpeed: 343, wavelength: 1 });
    expect(result.period).toBeCloseTo(1 / 343, 6);
  });

  // ═══════════════════════════════════════════════════════
  // Error Cases
  // ═══════════════════════════════════════════════════════

  it('throws for invalid mode', () => {
    expect(() => calculateFrequency({ mode: 'invalid' })).toThrow('Mode must be either "period" or "wave".');
  });

  it('throws in period mode when neither frequency nor period provided', () => {
    expect(() => calculateFrequency({ mode: 'period' })).toThrow('Enter either frequency (Hz) or period (s).');
  });

  it('throws in wave mode with missing wave speed', () => {
    expect(() => calculateFrequency({ mode: 'wave', wavelength: 1 })).toThrow('Wave speed must be a positive number.');
  });

  it('throws in wave mode with missing wavelength', () => {
    expect(() => calculateFrequency({ mode: 'wave', waveSpeed: 343 })).toThrow('Wavelength must be a positive number.');
  });

  it('throws for zero period', () => {
    expect(() => calculateFrequency({ mode: 'period', period: 0 })).toThrow('Enter either frequency (Hz) or period (s).');
  });

  // ═══════════════════════════════════════════════════════
  // Defaults & String Inputs
  // ═══════════════════════════════════════════════════════

  it('defaults to period mode', () => {
    const result = calculateFrequency({ frequency: 100 });
    expect(result.mode).toBe('period');
  });

  it('handles string inputs', () => {
    const result = calculateFrequency({ mode: 'period', period: '0.01' });
    expect(result.frequency).toBeCloseTo(100, 4);
  });
});
