import { calculateRafterLength } from '@/lib/formulas/construction/rafter-length';

describe('calculateRafterLength', () => {
  // ─── Test 1: Standard 24ft span at 6:12 pitch ───
  it('calculates standard 24ft span at 6:12 pitch with 12" overhang', () => {
    const result = calculateRafterLength({
      buildingSpan: 24,
      roofPitch: '6',
      overhang: 12,
      ridgeBoard: 1.5,
    });
    // run = (24/2) - (1.5/2/12) = 12 - 0.0625 = 11.9375
    expect(result.run).toBeCloseTo(11.9375, 2);
    // rise = 11.9375 × (6/12) = 5.96875
    expect(result.rise).toBeCloseTo(5.9688, 2);
    // rafterLength = sqrt(11.9375² + 5.96875²) ≈ 13.346
    expect(result.rafterLength).toBeCloseTo(13.35, 1);
    // totalLength = 13.346 + 1 (12"/12) ≈ 14.346
    expect(result.totalLength).toBeCloseTo(14.35, 1);
    // Plumb cut angle = atan(5.96875/11.9375) ≈ 26.57°
    expect(result.rafterAngle).toBeCloseTo(26.6, 0);
    // Seat cut = 90 - 26.57 ≈ 63.43°
    expect(result.seatCutAngle).toBeCloseTo(63.4, 0);
    // Should recommend 16-foot lumber
    expect(result.commonLumber).toBe('16-foot');
  });

  // ─── Test 2: 30ft span at 4:12 pitch ───
  it('calculates 30ft span at 4:12 pitch', () => {
    const result = calculateRafterLength({
      buildingSpan: 30,
      roofPitch: '4',
      overhang: 12,
      ridgeBoard: 1.5,
    });
    // run = 15 - 0.0625 = 14.9375
    expect(result.run).toBeCloseTo(14.9375, 2);
    // rise = 14.9375 × (4/12) ≈ 4.979
    expect(result.rise).toBeCloseTo(4.979, 1);
    // rafterLength = sqrt(14.9375² + 4.979²) ≈ 15.746
    expect(result.rafterLength).toBeCloseTo(15.75, 0);
    // totalLength ≈ 16.746
    expect(result.totalLength).toBeCloseTo(16.75, 0);
    // Should recommend 18-foot lumber
    expect(result.commonLumber).toBe('18-foot');
  });

  // ─── Test 3: Steep 12:12 pitch (45°) ───
  it('calculates steep 12:12 pitch correctly', () => {
    const result = calculateRafterLength({
      buildingSpan: 24,
      roofPitch: '12',
      overhang: 12,
      ridgeBoard: 1.5,
    });
    // run ≈ 11.9375, rise ≈ 11.9375
    expect(result.rise).toBeCloseTo(result.run as number, 1);
    // angle should be ≈ 45°
    expect(result.rafterAngle).toBeCloseTo(45, 0);
    expect(result.seatCutAngle).toBeCloseTo(45, 0);
  });

  // ─── Test 4: Low 3:12 pitch ───
  it('calculates low 3:12 pitch', () => {
    const result = calculateRafterLength({
      buildingSpan: 24,
      roofPitch: '3',
      overhang: 12,
      ridgeBoard: 1.5,
    });
    // rise = 11.9375 × 0.25 ≈ 2.984
    expect(result.rise).toBeCloseTo(2.984, 1);
    // angle = atan(2.984/11.9375) ≈ 14.04°
    expect(result.rafterAngle).toBeCloseTo(14, 0);
    expect(result.birdsmouth).toContain('Shallow');
  });

  // ─── Test 5: With 18" overhang ───
  it('accounts for 18-inch overhang', () => {
    const result = calculateRafterLength({
      buildingSpan: 24,
      roofPitch: '6',
      overhang: 18,
      ridgeBoard: 1.5,
    });
    // totalLength should be rafterLength + 1.5 ft
    const rafterLen = result.rafterLength as number;
    expect(result.totalLength).toBeCloseTo(rafterLen + 1.5, 1);
  });

  // ─── Test 6: No overhang ───
  it('handles zero overhang', () => {
    const result = calculateRafterLength({
      buildingSpan: 24,
      roofPitch: '6',
      overhang: 0,
      ridgeBoard: 1.5,
    });
    // totalLength should equal rafterLength when no overhang
    expect(result.totalLength).toBe(result.rafterLength);
  });

  // ─── Test 7: Zero span returns all zeros ───
  it('returns all zeros for zero building span', () => {
    const result = calculateRafterLength({
      buildingSpan: 0,
      roofPitch: '6',
      overhang: 12,
      ridgeBoard: 1.5,
    });
    expect(result.run).toBe(0);
    expect(result.rise).toBe(0);
    expect(result.rafterLength).toBe(0);
    expect(result.totalLength).toBe(0);
    expect(result.rafterAngle).toBe(0);
    expect(result.seatCutAngle).toBe(90);
    expect(result.commonLumber).toBe('');
    expect(result.birdsmouth).toBe('');
  });

  // ─── Test 8: Ridge board adjustment ───
  it('correctly adjusts run for ridge board thickness', () => {
    const withRidge = calculateRafterLength({
      buildingSpan: 24,
      roofPitch: '6',
      overhang: 0,
      ridgeBoard: 1.5,
    });
    const withoutRidge = calculateRafterLength({
      buildingSpan: 24,
      roofPitch: '6',
      overhang: 0,
      ridgeBoard: 0,
    });
    // Ridge board should reduce the run slightly
    expect(withRidge.run).toBeLessThan(withoutRidge.run as number);
    // Difference should be half ridge / 12 = 0.75/12 = 0.0625 ft
    const diff = (withoutRidge.run as number) - (withRidge.run as number);
    expect(diff).toBeCloseTo(0.0625, 3);
  });

  // ─── Test 9: Seat cut angle + rafter angle = 90 ───
  it('seat cut angle plus rafter angle equals 90 degrees', () => {
    const result = calculateRafterLength({
      buildingSpan: 24,
      roofPitch: '6',
      overhang: 12,
      ridgeBoard: 1.5,
    });
    const sum = (result.rafterAngle as number) + (result.seatCutAngle as number);
    expect(sum).toBeCloseTo(90, 0);
  });

  // ─── Test 10: Lumber size rounding ───
  it('rounds up to correct standard lumber length', () => {
    // 24ft span, 6:12, 12" overhang → ~14.35 ft → 16-foot lumber
    const result = calculateRafterLength({
      buildingSpan: 24,
      roofPitch: '6',
      overhang: 12,
      ridgeBoard: 1.5,
    });
    expect(result.commonLumber).toBe('16-foot');

    // Shorter span → should get smaller lumber
    const short = calculateRafterLength({
      buildingSpan: 14,
      roofPitch: '4',
      overhang: 6,
      ridgeBoard: 1.5,
    });
    const shortTotal = short.totalLength as number;
    expect(shortTotal).toBeLessThan(10);
    expect(short.commonLumber).toBe('8-foot');
  });

  // ─── Test 11: Flat pitch (0:12) ───
  it('handles flat pitch (0 rise)', () => {
    const result = calculateRafterLength({
      buildingSpan: 24,
      roofPitch: '0',
      overhang: 12,
      ridgeBoard: 1.5,
    });
    expect(result.rise).toBe(0);
    // Rafter length should equal the run (no rise component)
    expect(result.rafterLength).toBeCloseTo(result.run as number, 1);
    // totalLength = run + 1 ft overhang
    expect(result.totalLength).toBeCloseTo((result.run as number) + 1, 1);
    expect(result.rafterAngle).toBe(0);
    expect(result.seatCutAngle).toBe(90);
  });

  // ─── Test 12: Various pitches produce increasing rise ───
  it('increasing pitch produces increasing rise for same span', () => {
    const pitches = ['3', '4', '6', '8', '10', '12'];
    let prevRise = -1;
    for (const p of pitches) {
      const result = calculateRafterLength({
        buildingSpan: 24,
        roofPitch: p,
        overhang: 0,
        ridgeBoard: 1.5,
      });
      expect(result.rise).toBeGreaterThan(prevRise);
      prevRise = result.rise as number;
    }
  });

  // ─── Test 13: Output structure contains all expected keys ───
  it('returns all expected output keys', () => {
    const result = calculateRafterLength({
      buildingSpan: 24,
      roofPitch: '6',
      overhang: 12,
      ridgeBoard: 1.5,
    });
    expect(result).toHaveProperty('run');
    expect(result).toHaveProperty('rise');
    expect(result).toHaveProperty('rafterLength');
    expect(result).toHaveProperty('totalLength');
    expect(result).toHaveProperty('rafterAngle');
    expect(result).toHaveProperty('seatCutAngle');
    expect(result).toHaveProperty('birdsmouth');
    expect(result).toHaveProperty('commonLumber');
    expect(result).toHaveProperty('pitchAngle');
    expect(result).toHaveProperty('summary');
  });

  // ─── Test 14: Summary labels present ───
  it('returns summary with all expected labels', () => {
    const result = calculateRafterLength({
      buildingSpan: 24,
      roofPitch: '6',
      overhang: 12,
      ridgeBoard: 1.5,
    });
    const summary = result.summary as Array<{ label: string; value: string | number }>;
    expect(summary.length).toBeGreaterThanOrEqual(11);
    const labels = summary.map(s => s.label);
    expect(labels).toContain('Building Span');
    expect(labels).toContain('Roof Pitch');
    expect(labels).toContain('Run (half span)');
    expect(labels).toContain('Rise');
    expect(labels).toContain('Rafter Length');
    expect(labels).toContain('Total Rafter Length');
    expect(labels).toContain('Plumb Cut Angle');
    expect(labels).toContain('Seat Cut Angle');
    expect(labels).toContain('Recommended Lumber');
  });

  // ─── Test 15: Birdsmouth description varies by pitch ───
  it('returns appropriate birdsmouth description by pitch', () => {
    const low = calculateRafterLength({
      buildingSpan: 24, roofPitch: '3', overhang: 12, ridgeBoard: 1.5,
    });
    expect(low.birdsmouth).toContain('Shallow');

    const mid = calculateRafterLength({
      buildingSpan: 24, roofPitch: '6', overhang: 12, ridgeBoard: 1.5,
    });
    expect(mid.birdsmouth).toContain('Standard');

    const steep = calculateRafterLength({
      buildingSpan: 24, roofPitch: '10', overhang: 12, ridgeBoard: 1.5,
    });
    expect(steep.birdsmouth).toContain('Deep');
  });

  // ─── Test 16: Pythagorean theorem verification ───
  it('rafter length satisfies Pythagorean theorem', () => {
    const result = calculateRafterLength({
      buildingSpan: 24,
      roofPitch: '6',
      overhang: 0,
      ridgeBoard: 1.5,
    });
    const run = result.run as number;
    const rise = result.rise as number;
    const rafter = result.rafterLength as number;
    const expected = Math.sqrt(run * run + rise * rise);
    expect(rafter).toBeCloseTo(expected, 1);
  });
});
