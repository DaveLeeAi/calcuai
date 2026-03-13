import { calculateRoofPitch } from '@/lib/formulas/construction/roof-pitch';

describe('calculateRoofPitch', () => {
  // ─── Test 1: Standard 6:12 pitch ───
  it('calculates standard 6:12 residential pitch', () => {
    const result = calculateRoofPitch({ rise: 6, run: 12, calculationMode: 'rise-run' });
    expect(result.pitch).toBe('6:12');
    expect(result.pitchRatio).toBe(0.5);
    expect(result.angleDegrees).toBeCloseTo(26.6, 0);
    expect(result.percentGrade).toBe(50);
    expect(result.pitchDescription).toBe('Standard Slope');
    expect(result.walkable).toBe('Yes — generally walkable');
  });

  // ─── Test 2: Flat roof (0:12) ───
  it('handles flat roof with zero rise', () => {
    const result = calculateRoofPitch({ rise: 0, run: 12, calculationMode: 'rise-run' });
    expect(result.pitch).toBe('0:12');
    expect(result.pitchRatio).toBe(0);
    expect(result.angleDegrees).toBe(0);
    expect(result.percentGrade).toBe(0);
    expect(result.pitchDescription).toBe('Flat');
    expect(result.roofMultiplier).toBe(1);
  });

  // ─── Test 3: Standard 4:12 residential ───
  it('calculates 4:12 standard residential pitch', () => {
    const result = calculateRoofPitch({ rise: 4, run: 12, calculationMode: 'rise-run' });
    expect(result.pitch).toBe('4:12');
    expect(result.pitchRatio).toBeCloseTo(0.3333, 3);
    expect(result.angleDegrees).toBeCloseTo(18.4, 0);
    expect(result.pitchDescription).toBe('Moderate Slope');
    expect(result.walkable).toBe('Yes — generally walkable');
  });

  // ─── Test 4: 12:12 pitch (45°) ───
  it('calculates 12:12 pitch at 45 degrees', () => {
    const result = calculateRoofPitch({ rise: 12, run: 12, calculationMode: 'rise-run' });
    expect(result.pitch).toBe('12:12');
    expect(result.pitchRatio).toBe(1);
    expect(result.angleDegrees).toBe(45);
    expect(result.percentGrade).toBe(100);
    expect(result.pitchDescription).toBe('Very Steep');
    expect(result.walkable).toBe('No — requires safety equipment');
  });

  // ─── Test 5: Steep 18:12 pitch ───
  it('calculates steep 18:12 pitch', () => {
    const result = calculateRoofPitch({ rise: 18, run: 12, calculationMode: 'rise-run' });
    expect(result.pitch).toBe('18:12');
    expect(result.pitchRatio).toBe(1.5);
    expect(result.angleDegrees).toBeCloseTo(56.3, 0);
    expect(result.pitchDescription).toBe('Very Steep');
    expect(result.walkable).toBe('No — requires safety equipment');
  });

  // ─── Test 6: Non-standard rise/run (8 rise, 12 run) ───
  it('handles non-standard 8:12 pitch', () => {
    const result = calculateRoofPitch({ rise: 8, run: 12, calculationMode: 'rise-run' });
    expect(result.pitch).toBe('8:12');
    expect(result.pitchRatio).toBeCloseTo(0.6667, 3);
    expect(result.angleDegrees).toBeCloseTo(33.7, 0);
    expect(result.pitchDescription).toBe('Standard Slope');
  });

  // ─── Test 7: Angle mode — 30 degrees ───
  it('calculates from angle input (30 degrees)', () => {
    const result = calculateRoofPitch({ calculationMode: 'angle', roofAngle: 30 });
    // tan(30°) ≈ 0.5774; rise = 0.5774 × 12 ≈ 6.928
    expect(result.angleDegrees).toBeCloseTo(30, 0);
    expect(result.pitchRatio).toBeCloseTo(0.5774, 2);
    expect(result.pitchDescription).toBe('Standard Slope');
  });

  // ─── Test 8: Angle mode — 45 degrees ───
  it('calculates from angle input (45 degrees)', () => {
    const result = calculateRoofPitch({ calculationMode: 'angle', roofAngle: 45 });
    expect(result.angleDegrees).toBe(45);
    expect(result.pitchRatio).toBeCloseTo(1, 1);
    expect(result.pitch).toBe('12:12');
  });

  // ─── Test 9: Zero run returns flat/vertical based on rise ───
  it('handles zero run with positive rise as vertical', () => {
    const result = calculateRoofPitch({ rise: 6, run: 0, calculationMode: 'rise-run' });
    expect(result.pitch).toBe('Vertical');
    expect(result.angleDegrees).toBe(90);
    expect(result.pitchDescription).toBe('Very Steep');
  });

  // ─── Test 10: Both zero returns flat ───
  it('handles both rise and run as zero', () => {
    const result = calculateRoofPitch({ rise: 0, run: 0, calculationMode: 'rise-run' });
    expect(result.pitch).toBe('0:12');
    expect(result.angleDegrees).toBe(0);
    expect(result.pitchDescription).toBe('Flat');
    expect(result.roofMultiplier).toBe(1);
  });

  // ─── Test 11: Roof multiplier accuracy ───
  it('calculates correct roof multiplier for 6:12 pitch', () => {
    const result = calculateRoofPitch({ rise: 6, run: 12, calculationMode: 'rise-run' });
    // 1 / cos(26.57°) ≈ 1.118
    expect(result.roofMultiplier).toBeCloseTo(1.118, 2);
  });

  // ─── Test 12: Walkability threshold at exactly 35 degrees ───
  it('marks roof as not walkable at 35 degrees', () => {
    // tan(35°) ≈ 0.7002; rise ≈ 8.4 for run = 12
    const result = calculateRoofPitch({ rise: 8.4, run: 12, calculationMode: 'rise-run' });
    expect(result.angleDegrees).toBeCloseTo(35, 0);
    // At exactly 35° it should be "No — requires safety equipment"
    expect(result.walkable).toBe('No — requires safety equipment');
  });

  // ─── Test 13: Percent grade calculation ───
  it('calculates correct percent grade', () => {
    const result = calculateRoofPitch({ rise: 3, run: 12, calculationMode: 'rise-run' });
    expect(result.percentGrade).toBe(25);
    expect(result.pitch).toBe('3:12');
  });

  // ─── Test 14: Pitch description categories ───
  it('assigns correct pitch descriptions for each range', () => {
    // Low slope: < 15° → 2:12 ≈ 9.46°
    const low = calculateRoofPitch({ rise: 2, run: 12, calculationMode: 'rise-run' });
    expect(low.pitchDescription).toBe('Low Slope');

    // Moderate slope: 15-25° → 4:12 ≈ 18.43°
    const mod = calculateRoofPitch({ rise: 4, run: 12, calculationMode: 'rise-run' });
    expect(mod.pitchDescription).toBe('Moderate Slope');

    // Standard slope: 25-35° → 6:12 ≈ 26.57°
    const std = calculateRoofPitch({ rise: 6, run: 12, calculationMode: 'rise-run' });
    expect(std.pitchDescription).toBe('Standard Slope');

    // Steep slope: 35-45° → 10:12 ≈ 39.81°
    const steep = calculateRoofPitch({ rise: 10, run: 12, calculationMode: 'rise-run' });
    expect(steep.pitchDescription).toBe('Steep Slope');

    // Very steep: 45°+ → 12:12 = 45°
    const vsteep = calculateRoofPitch({ rise: 12, run: 12, calculationMode: 'rise-run' });
    expect(vsteep.pitchDescription).toBe('Very Steep');
  });

  // ─── Test 15: Output structure contains all expected keys ───
  it('returns all expected output keys', () => {
    const result = calculateRoofPitch({ rise: 6, run: 12, calculationMode: 'rise-run' });
    expect(result).toHaveProperty('pitch');
    expect(result).toHaveProperty('pitchRatio');
    expect(result).toHaveProperty('angleDegrees');
    expect(result).toHaveProperty('percentGrade');
    expect(result).toHaveProperty('pitchDescription');
    expect(result).toHaveProperty('roofMultiplier');
    expect(result).toHaveProperty('walkable');
    expect(result).toHaveProperty('commonUse');
    expect(result).toHaveProperty('pitchFraction');
    expect(result).toHaveProperty('summary');
  });

  // ─── Test 16: Summary labels present ───
  it('returns summary with expected labels', () => {
    const result = calculateRoofPitch({ rise: 6, run: 12, calculationMode: 'rise-run' });
    const summary = result.summary as Array<{ label: string; value: string | number }>;
    expect(summary.length).toBeGreaterThanOrEqual(8);
    const labels = summary.map(s => s.label);
    expect(labels).toContain('Roof Pitch');
    expect(labels).toContain('Angle');
    expect(labels).toContain('Percent Grade');
    expect(labels).toContain('Roof Multiplier');
    expect(labels).toContain('Walkable');
  });

  // ─── Test 17: Pitch fraction for 6:12 (ratio 0.5) ───
  it('returns correct pitch fraction for common ratios', () => {
    const result = calculateRoofPitch({ rise: 6, run: 12, calculationMode: 'rise-run' });
    expect(result.pitchFraction).toBe('1/2');

    const result4 = calculateRoofPitch({ rise: 4, run: 12, calculationMode: 'rise-run' });
    expect(result4.pitchFraction).toBe('1/3');
  });

  // ─── Test 18: Angle mode with 0 degrees ───
  it('handles angle mode with 0 degrees as flat', () => {
    const result = calculateRoofPitch({ calculationMode: 'angle', roofAngle: 0 });
    expect(result.pitch).toBe('0:12');
    expect(result.angleDegrees).toBe(0);
    expect(result.pitchDescription).toBe('Flat');
  });

  // ─── Test 19: Common use text ───
  it('returns appropriate common use text', () => {
    const low = calculateRoofPitch({ rise: 1, run: 12, calculationMode: 'rise-run' });
    expect(low.commonUse).toContain('Low slope');

    const standard = calculateRoofPitch({ rise: 6, run: 12, calculationMode: 'rise-run' });
    expect(standard.commonUse).toContain('Standard residential');
  });

  // ─── Test 20: Non-12 run normalizes correctly ───
  it('normalizes pitch to X:12 with non-12 run', () => {
    // 3:6 = 6:12
    const result = calculateRoofPitch({ rise: 3, run: 6, calculationMode: 'rise-run' });
    expect(result.pitch).toBe('6:12');
    expect(result.pitchRatio).toBe(0.5);
    expect(result.angleDegrees).toBeCloseTo(26.6, 0);
  });
});
