import { calculateWaveSpeed } from '@/lib/formulas/science/wave-speed';

describe('calculateWaveSpeed', () => {
  // ═══════════════════════════════════════════════════════
  // Combination 1: Frequency + Wavelength → Wave Speed
  // ═══════════════════════════════════════════════════════

  it('calculates wave speed from f=100Hz and λ=3.43m (sound)', () => {
    const result = calculateWaveSpeed({ frequency: 100, wavelength: 3.43 });
    expect(result.waveSpeed).toBeCloseTo(343, 0);
    expect(result.solvedFrom).toBe('Frequency (f) and Wavelength (λ)');
  });

  it('calculates speed of light from visible light (f × λ = c)', () => {
    // green light: f ≈ 5.45e14 Hz, λ = 550e-9 m
    const result = calculateWaveSpeed({ frequency: 5.4508e14, wavelength: 550e-9 });
    expect(result.waveSpeed).toBeCloseTo(299792458, -4);
  });

  it('calculates wave speed for FM radio (100 MHz, λ=3m)', () => {
    const result = calculateWaveSpeed({ frequency: 1e8, wavelength: 3 });
    expect(result.waveSpeed).toBeCloseTo(3e8, -4);
  });

  // ═══════════════════════════════════════════════════════
  // Combination 2: Wave Speed + Wavelength → Frequency
  // ═══════════════════════════════════════════════════════

  it('solves frequency from speed=343 and λ=1m (343 Hz)', () => {
    const result = calculateWaveSpeed({ waveSpeed: 343, wavelength: 1 });
    expect(result.frequency).toBeCloseTo(343, 4);
    expect(result.solvedFrom).toBe('Wave Speed (v) and Wavelength (λ)');
  });

  it('solves frequency of middle C (v=343, λ=1.31m)', () => {
    const result = calculateWaveSpeed({ waveSpeed: 343, wavelength: 1.31 });
    expect(result.frequency).toBeCloseTo(261.83, 0);
  });

  // ═══════════════════════════════════════════════════════
  // Combination 3: Wave Speed + Frequency → Wavelength
  // ═══════════════════════════════════════════════════════

  it('solves wavelength from speed=343 and f=440 Hz (A4 note)', () => {
    const result = calculateWaveSpeed({ waveSpeed: 343, frequency: 440 });
    expect(result.wavelength).toBeCloseTo(0.7795, 3);
    expect(result.solvedFrom).toBe('Wave Speed (v) and Frequency (f)');
  });

  it('solves wavelength of Wi-Fi signal (c / 2.4 GHz)', () => {
    const result = calculateWaveSpeed({ waveSpeed: 299792458, frequency: 2.4e9 });
    expect(result.wavelength).toBeCloseTo(0.1249, 3);
  });

  // ═══════════════════════════════════════════════════════
  // Period Calculation
  // ═══════════════════════════════════════════════════════

  it('returns correct period (T = 1/f)', () => {
    const result = calculateWaveSpeed({ frequency: 100, wavelength: 3.43 });
    expect(result.period).toBeCloseTo(0.01, 4);
  });

  // ═══════════════════════════════════════════════════════
  // Unit Conversions
  // ═══════════════════════════════════════════════════════

  it('converts speed to km/h (343 m/s = 1234.8 km/h)', () => {
    const result = calculateWaveSpeed({ frequency: 100, wavelength: 3.43 });
    const conv = result.conversions as Record<string, number>;
    expect(conv.speed_kmh).toBeCloseTo(1234.8, 0);
  });

  it('converts frequency to kHz (343 Hz = 0.343 kHz)', () => {
    const result = calculateWaveSpeed({ waveSpeed: 343, wavelength: 1 });
    const conv = result.conversions as Record<string, number>;
    expect(conv.frequency_kHz).toBeCloseTo(0.343, 3);
  });

  it('converts wavelength to cm (1m = 100 cm)', () => {
    const result = calculateWaveSpeed({ waveSpeed: 343, frequency: 343 });
    const conv = result.conversions as Record<string, number>;
    expect(conv.wavelength_cm).toBeCloseTo(100, 2);
  });

  it('converts wavelength to nm for visible light', () => {
    const result = calculateWaveSpeed({ waveSpeed: 299792458, frequency: 5.4508e14 });
    const conv = result.conversions as Record<string, number>;
    expect(conv.wavelength_nm).toBeCloseTo(550, -1);
  });

  // ═══════════════════════════════════════════════════════
  // Cross-Verification
  // ═══════════════════════════════════════════════════════

  it('all three combinations produce consistent results', () => {
    const fromFL = calculateWaveSpeed({ frequency: 343, wavelength: 1 });
    const fromVL = calculateWaveSpeed({ waveSpeed: 343, wavelength: 1 });
    const fromVF = calculateWaveSpeed({ waveSpeed: 343, frequency: 343 });
    for (const r of [fromFL, fromVL, fromVF]) {
      expect(r.waveSpeed).toBeCloseTo(343, 2);
      expect(r.frequency).toBeCloseTo(343, 2);
      expect(r.wavelength).toBeCloseTo(1, 2);
    }
  });

  // ═══════════════════════════════════════════════════════
  // Edge Cases
  // ═══════════════════════════════════════════════════════

  it('handles very low frequency (infrasound: 1 Hz)', () => {
    const result = calculateWaveSpeed({ waveSpeed: 343, frequency: 1 });
    expect(result.wavelength).toBeCloseTo(343, 2);
  });

  it('handles ultrasonic frequency (50 kHz)', () => {
    const result = calculateWaveSpeed({ waveSpeed: 343, frequency: 50000 });
    expect(result.wavelength).toBeCloseTo(0.00686, 4);
  });

  // ═══════════════════════════════════════════════════════
  // Error Cases
  // ═══════════════════════════════════════════════════════

  it('throws when fewer than 2 values provided', () => {
    expect(() => calculateWaveSpeed({ waveSpeed: 343 })).toThrow('Enter any two of: Wave Speed, Frequency, Wavelength.');
  });

  it('throws with no inputs', () => {
    expect(() => calculateWaveSpeed({})).toThrow('Enter any two of: Wave Speed, Frequency, Wavelength.');
  });

  it('treats zero as not provided', () => {
    expect(() => calculateWaveSpeed({ waveSpeed: 0, frequency: 0 })).toThrow();
  });

  // ═══════════════════════════════════════════════════════
  // String Inputs
  // ═══════════════════════════════════════════════════════

  it('handles string inputs', () => {
    const result = calculateWaveSpeed({ frequency: '100', wavelength: '3.43' });
    expect(result.waveSpeed).toBeCloseTo(343, 0);
  });

  it('uses first valid pair when all 3 provided', () => {
    const result = calculateWaveSpeed({ waveSpeed: 343, frequency: 343, wavelength: 1 });
    expect(result.solvedFrom).toBe('Frequency (f) and Wavelength (λ)');
  });
});
