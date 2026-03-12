import { calculateLeanBodyMass } from '@/lib/formulas/health/lean-body-mass';

describe('calculateLeanBodyMass', () => {
  // Case 1: Male, 70 kg, 175 cm (metric)
  it('calculates LBM for 70 kg male at 175 cm', () => {
    const result = calculateLeanBodyMass({
      unitSystem: 'metric',
      sex: 'male',
      weight: 70,
      height: 175,
    });
    // LBM = (0.407 × 70) + (0.267 × 175) − 19.2
    //     = 28.49 + 46.725 − 19.2 = 56.015
    expect(result.leanBodyMass).toBeCloseTo(56.0, 0);
    expect(result.unitLabel).toBe('kg');
  });

  // Case 2: Female, 60 kg, 165 cm (metric)
  it('calculates LBM for 60 kg female at 165 cm', () => {
    const result = calculateLeanBodyMass({
      unitSystem: 'metric',
      sex: 'female',
      weight: 60,
      height: 165,
    });
    // LBM = (0.252 × 60) + (0.473 × 165) − 48.3
    //     = 15.12 + 78.045 − 48.3 = 44.865
    expect(result.leanBodyMass).toBeCloseTo(44.9, 1);
    expect(result.unitLabel).toBe('kg');
  });

  // Case 3: Male, 200 lbs, 71 inches (imperial)
  it('calculates LBM for 200 lb male at 71 inches', () => {
    const result = calculateLeanBodyMass({
      unitSystem: 'imperial',
      sex: 'male',
      weight: 200,
      height: 71,
    });
    // 200 lbs = 90.7185 kg, 71 in = 180.34 cm
    // LBM = (0.407 × 90.7185) + (0.267 × 180.34) − 19.2
    //     = 36.922 + 48.151 − 19.2 = 65.873 kg = 145.2 lbs
    expect(result.leanBodyMass).toBeCloseTo(145.2, 0);
    expect(result.unitLabel).toBe('lbs');
  });

  // Case 4: Female, 140 lbs, 65 inches (imperial)
  it('calculates LBM for 140 lb female at 65 inches', () => {
    const result = calculateLeanBodyMass({
      unitSystem: 'imperial',
      sex: 'female',
      weight: 140,
      height: 65,
    });
    // 140 lbs = 63.503 kg, 65 in = 165.1 cm
    // LBM = (0.252 × 63.503) + (0.473 × 165.1) − 48.3
    //     = 16.003 + 78.092 − 48.3 = 45.795 kg = 100.98 lbs
    expect(result.leanBodyMass).toBeCloseTo(101.0, 0);
    expect(result.unitLabel).toBe('lbs');
  });

  // Case 5: Heavy male (120 kg, 185 cm)
  it('calculates LBM for heavy male (120 kg, 185 cm)', () => {
    const result = calculateLeanBodyMass({
      unitSystem: 'metric',
      sex: 'male',
      weight: 120,
      height: 185,
    });
    // LBM = (0.407 × 120) + (0.267 × 185) − 19.2
    //     = 48.84 + 49.395 − 19.2 = 79.035
    expect(result.leanBodyMass).toBeCloseTo(79.0, 0);
    // Body fat mass = 120 - 79.035 = 40.965
    expect(result.bodyFatMass).toBeCloseTo(41.0, 0);
  });

  // Case 6: Light female (45 kg, 155 cm)
  it('calculates LBM for light female (45 kg, 155 cm)', () => {
    const result = calculateLeanBodyMass({
      unitSystem: 'metric',
      sex: 'female',
      weight: 45,
      height: 155,
    });
    // LBM = (0.252 × 45) + (0.473 × 155) − 48.3
    //     = 11.34 + 73.315 − 48.3 = 36.355
    expect(result.leanBodyMass).toBeCloseTo(36.4, 1);
  });

  // Body fat percentage is reasonable (10-40% for most cases)
  it('produces reasonable body fat percentage for average male', () => {
    const result = calculateLeanBodyMass({
      unitSystem: 'metric',
      sex: 'male',
      weight: 80,
      height: 178,
    });
    expect(result.bodyFatPercentage).toBeGreaterThan(10);
    expect(result.bodyFatPercentage).toBeLessThan(40);
  });

  it('produces reasonable body fat percentage for average female', () => {
    const result = calculateLeanBodyMass({
      unitSystem: 'metric',
      sex: 'female',
      weight: 65,
      height: 163,
    });
    expect(result.bodyFatPercentage).toBeGreaterThan(10);
    expect(result.bodyFatPercentage).toBeLessThan(40);
  });

  // Lean to fat ratio > 1 for healthy individuals
  it('has lean-to-fat ratio greater than 1 for healthy individual', () => {
    const result = calculateLeanBodyMass({
      unitSystem: 'metric',
      sex: 'male',
      weight: 75,
      height: 180,
    });
    expect(result.leanToFatRatio).toBeGreaterThan(1);
  });

  // Composition chart has 2 entries
  it('returns composition with lean mass and body fat entries', () => {
    const result = calculateLeanBodyMass({
      unitSystem: 'metric',
      sex: 'male',
      weight: 70,
      height: 175,
    });
    expect(result.composition).toHaveLength(2);
    expect(result.composition[0].label).toBe('Lean Mass');
    expect(result.composition[1].label).toBe('Body Fat');
    // They should sum to approximately 100
    const total = result.composition[0].value + result.composition[1].value;
    expect(total).toBeCloseTo(100, 0);
  });

  // Edge: very tall person
  it('handles very tall person (200 cm male)', () => {
    const result = calculateLeanBodyMass({
      unitSystem: 'metric',
      sex: 'male',
      weight: 95,
      height: 200,
    });
    // LBM = (0.407 × 95) + (0.267 × 200) − 19.2 = 38.665 + 53.4 − 19.2 = 72.865
    expect(result.leanBodyMass).toBeCloseTo(72.9, 1);
    expect(result.bodyFatPercentage).toBeGreaterThan(0);
  });

  // Edge: very short person
  it('handles very short person (148 cm female)', () => {
    const result = calculateLeanBodyMass({
      unitSystem: 'metric',
      sex: 'female',
      weight: 50,
      height: 148,
    });
    // LBM = (0.252 × 50) + (0.473 × 148) − 48.3 = 12.6 + 70.004 − 48.3 = 34.304
    expect(result.leanBodyMass).toBeCloseTo(34.3, 0);
    expect(result.bodyFatMass).toBeCloseTo(15.7, 0);
  });
});
