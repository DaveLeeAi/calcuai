import { calculateStair } from '@/lib/formulas/construction/stair';

describe('calculateStair', () => {
  // ─── Test 1: Standard 9-foot ceiling (108" rise) ───
  it('calculates standard 9-foot ceiling staircase', () => {
    const result = calculateStair({
      totalRise: 108,
      stairWidth: 36,
      maxRiserHeight: 7.75,
    });
    // ceil(108 / 7.75) = ceil(13.935) = 14 risers
    expect(result.numberOfRisers).toBe(14);
    // Treads = 14 - 1 = 13
    expect(result.numberOfTreads).toBe(13);
    // Actual riser = 108 / 14 = 7.714... → 7.71
    expect(result.actualRiserHeight).toBe(7.71);
    // Tread depth = max(10, 25 - 2 × 7.71) = max(10, 9.58) = 10
    expect(result.treadDepth).toBe(10);
    // Total run = 13 × 10 = 130
    expect(result.totalRun).toBe(130);
    // Stringer = sqrt(108² + 130²) = sqrt(11664 + 16900) = sqrt(28564) ≈ 169.0
    expect(result.stringerLength).toBeCloseTo(169.0, 0);
    // Should meet code
    expect(result.meetsCode).toContain('Yes');
  });

  // ─── Test 2: 8-foot ceiling (96" rise) ───
  it('calculates an 8-foot ceiling staircase', () => {
    const result = calculateStair({
      totalRise: 96,
      stairWidth: 36,
      maxRiserHeight: 7.75,
    });
    // ceil(96 / 7.75) = ceil(12.387) = 13 risers
    expect(result.numberOfRisers).toBe(13);
    expect(result.numberOfTreads).toBe(12);
    // Actual riser = 96 / 13 ≈ 7.38
    expect(result.actualRiserHeight).toBe(7.38);
    // Tread = max(10, 25 - 2×7.38) = max(10, 10.24) = 10.24
    expect(result.treadDepth).toBe(10.24);
    expect(result.meetsCode).toContain('Yes');
  });

  // ─── Test 3: 10-foot ceiling (120" rise) ───
  it('calculates a 10-foot ceiling staircase', () => {
    const result = calculateStair({
      totalRise: 120,
      stairWidth: 36,
      maxRiserHeight: 7.75,
    });
    // ceil(120 / 7.75) = ceil(15.48) = 16 risers
    expect(result.numberOfRisers).toBe(16);
    expect(result.numberOfTreads).toBe(15);
    // Actual riser = 120 / 16 = 7.5
    expect(result.actualRiserHeight).toBe(7.5);
    // Tread = max(10, 25 - 15) = 10
    expect(result.treadDepth).toBe(10);
    expect(result.meetsCode).toContain('Yes');
  });

  // ─── Test 4: Tread depth meets IRC minimum (≥10") ───
  it('enforces minimum tread depth of 10 inches', () => {
    // Even with a very low riser (lots of risers), tread should still be ≥ 10
    const result = calculateStair({
      totalRise: 108,
      stairWidth: 36,
      maxRiserHeight: 7.75,
    });
    expect(result.treadDepth).toBeGreaterThanOrEqual(10);
  });

  // ─── Test 5: Actual riser never exceeds maxRiserHeight ───
  it('actual riser height never exceeds max riser height', () => {
    const result = calculateStair({
      totalRise: 108,
      stairWidth: 36,
      maxRiserHeight: 7.75,
    });
    expect(result.actualRiserHeight).toBeLessThanOrEqual(7.75);
  });

  // ─── Test 6: Stringer length via Pythagorean theorem ───
  it('calculates stringer length as hypotenuse of rise and run', () => {
    const result = calculateStair({
      totalRise: 96,
      stairWidth: 36,
      maxRiserHeight: 7.75,
    });
    const rise = 96;
    const run = result.totalRun as number;
    const expected = parseFloat(Math.sqrt(rise * rise + run * run).toFixed(1));
    expect(result.stringerLength).toBe(expected);
  });

  // ─── Test 7: Zero total rise returns all zeros ───
  it('returns all zeros for zero total rise', () => {
    const result = calculateStair({
      totalRise: 0,
      stairWidth: 36,
      maxRiserHeight: 7.75,
    });
    expect(result.numberOfRisers).toBe(0);
    expect(result.numberOfTreads).toBe(0);
    expect(result.actualRiserHeight).toBe(0);
    expect(result.treadDepth).toBe(0);
    expect(result.totalRun).toBe(0);
    expect(result.stringerLength).toBe(0);
    expect(result.meetsCode).toBe('');
  });

  // ─── Test 8: Narrow stairs (30") — code violation flag ───
  it('flags code violation for stairs narrower than 36 inches', () => {
    const result = calculateStair({
      totalRise: 108,
      stairWidth: 30,
      maxRiserHeight: 7.75,
    });
    expect(result.meetsCode).toContain('No');
    expect(result.meetsCode).toContain('Width below IRC min of 36"');
  });

  // ─── Test 9: Very tall rise (240") — many risers, still compliant ───
  it('handles very tall rises with many risers', () => {
    const result = calculateStair({
      totalRise: 240,
      stairWidth: 36,
      maxRiserHeight: 7.75,
    });
    // ceil(240 / 7.75) = ceil(30.97) = 31 risers
    expect(result.numberOfRisers).toBe(31);
    expect(result.numberOfTreads).toBe(30);
    expect(result.actualRiserHeight).toBeLessThanOrEqual(7.75);
    expect(result.meetsCode).toContain('Yes');
  });

  // ─── Test 10: Custom max riser — 7.0" instead of 7.75" ───
  it('uses custom max riser height resulting in more risers', () => {
    const standard = calculateStair({
      totalRise: 108,
      stairWidth: 36,
      maxRiserHeight: 7.75,
    });
    const custom = calculateStair({
      totalRise: 108,
      stairWidth: 36,
      maxRiserHeight: 7.0,
    });
    // ceil(108/7.0) = ceil(15.43) = 16 risers vs 14
    expect(custom.numberOfRisers).toBeGreaterThan(standard.numberOfRisers as number);
    expect(custom.numberOfRisers).toBe(16);
    expect(custom.actualRiserHeight).toBe(6.75);
  });

  // ─── Test 11: Summary labels present ───
  it('returns summary with all expected labels', () => {
    const result = calculateStair({
      totalRise: 108,
      stairWidth: 36,
      maxRiserHeight: 7.75,
    });
    const summary = result.summary as Array<{ label: string; value: string | number }>;
    expect(summary.length).toBeGreaterThanOrEqual(9);
    const labels = summary.map(s => s.label);
    expect(labels).toContain('Total Rise');
    expect(labels).toContain('Number of Risers');
    expect(labels).toContain('Number of Treads');
    expect(labels).toContain('Riser Height');
    expect(labels).toContain('Tread Depth');
    expect(labels).toContain('Total Run');
    expect(labels).toContain('Stringer Length');
    expect(labels).toContain('Stair Width');
    expect(labels).toContain('Code Compliance');
  });

  // ─── Test 12: Total run equals numberOfTreads × treadDepth ───
  it('total run equals treads times tread depth', () => {
    const result = calculateStair({
      totalRise: 96,
      stairWidth: 36,
      maxRiserHeight: 7.75,
    });
    const expectedRun = parseFloat(
      ((result.numberOfTreads as number) * (result.treadDepth as number)).toFixed(1)
    );
    expect(result.totalRun).toBe(expectedRun);
  });

  // ─── Test 13: Code compliance with exact IRC max riser ───
  it('meets code when actual riser is exactly at IRC max', () => {
    // 7.75 * 14 = 108.5, so 108 / 14 = 7.71 < 7.75 → meets code
    // Try an exact case: totalRise = 7.75 * 4 = 31 → 4 risers at exactly 7.75
    const result = calculateStair({
      totalRise: 31,
      stairWidth: 36,
      maxRiserHeight: 7.75,
    });
    // ceil(31/7.75) = 4
    expect(result.numberOfRisers).toBe(4);
    expect(result.actualRiserHeight).toBe(7.75);
    expect(result.meetsCode).toContain('Yes');
  });

  // ─── Test 14: Tread depth uses 2R+T=25 rule ───
  it('calculates tread depth using the 2R+T=25 comfort rule', () => {
    const result = calculateStair({
      totalRise: 96,
      stairWidth: 36,
      maxRiserHeight: 7.75,
    });
    // riser ≈ 7.38, tread = 25 - 2(7.38) = 10.24
    const expectedTread = parseFloat(Math.max(10, 25 - 2 * (result.actualRiserHeight as number)).toFixed(2));
    expect(result.treadDepth).toBe(expectedTread);
  });
});
