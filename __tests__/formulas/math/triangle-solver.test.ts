import { calculateTriangle } from '@/lib/formulas/math/triangle-solver';

describe('calculateTriangle', () => {
  // ═══════════════════════════════════════════════════════
  // SSS Mode — Three Sides
  // ═══════════════════════════════════════════════════════

  // ─── Test 1: 3-4-5 right triangle ───
  it('solves the 3-4-5 right triangle (SSS)', () => {
    const result = calculateTriangle({ mode: 'sss', sideA: 3, sideB: 4, sideC: 5 });
    expect(result.angleA).toBeCloseTo(36.8699, 2);
    expect(result.angleB).toBeCloseTo(53.1301, 2);
    expect(result.angleC).toBeCloseTo(90, 2);
    expect(result.area).toBeCloseTo(6, 4);
    expect(result.perimeter).toBeCloseTo(12, 4);
    expect(result.triangleType).toContain('right');
    expect(result.triangleType).toContain('scalene');
  });

  // ─── Test 2: Equilateral triangle 5-5-5 ───
  it('solves an equilateral triangle 5-5-5 (SSS)', () => {
    const result = calculateTriangle({ mode: 'sss', sideA: 5, sideB: 5, sideC: 5 });
    expect(result.angleA).toBeCloseTo(60, 2);
    expect(result.angleB).toBeCloseTo(60, 2);
    expect(result.angleC).toBeCloseTo(60, 2);
    // Area of equilateral triangle with side 5: (√3/4) × 25 ≈ 10.8253
    expect(result.area).toBeCloseTo(10.8253, 2);
    expect(result.triangleType).toContain('equilateral');
    expect(result.triangleType).toContain('acute');
  });

  // ─── Test 3: Isosceles triangle detection ───
  it('detects isosceles triangle 5-5-8 (SSS)', () => {
    const result = calculateTriangle({ mode: 'sss', sideA: 5, sideB: 5, sideC: 8 });
    expect(result.triangleType).toContain('isosceles');
    expect(result.angleA).toBeCloseTo(result.angleB as number, 2);
  });

  // ─── Test 4: Obtuse triangle classification ───
  it('classifies obtuse triangle 3-4-6 (SSS)', () => {
    const result = calculateTriangle({ mode: 'sss', sideA: 3, sideB: 4, sideC: 6 });
    expect(result.triangleType).toContain('obtuse');
    expect(result.triangleType).toContain('scalene');
  });

  // ─── Test 5: Heron's formula area verification ───
  it('computes area correctly via Heron\'s formula for 7-8-9 triangle', () => {
    const result = calculateTriangle({ mode: 'sss', sideA: 7, sideB: 8, sideC: 9 });
    // s = 12, Area = √(12 × 5 × 4 × 3) = √720 ≈ 26.8328
    expect(result.area).toBeCloseTo(26.8328, 2);
    expect(result.semiperimeter).toBeCloseTo(12, 4);
  });

  // ═══════════════════════════════════════════════════════
  // SAS Mode — Two Sides and Included Angle
  // ═══════════════════════════════════════════════════════

  // ─── Test 6: SAS with sides 7, 8 and 30° included angle ───
  it('solves SAS with sides 7, 8 and angle C = 30°', () => {
    const result = calculateTriangle({ mode: 'sas', sideA: 7, sideB: 8, angleC: 30 });
    // c² = 49 + 64 − 2(7)(8)cos(30°) = 113 − 96.9948 ≈ 16.005
    // c ≈ 4.0006
    expect(result.sideC).toBeCloseTo(4.0006, 1);
    expect(result.area).toBeCloseTo(14, 2); // 0.5 × 7 × 8 × sin(30°) = 14
    expect(result.angleC).toBeCloseTo(30, 2);
  });

  // ─── Test 7: SAS recreating 3-4-5 right triangle ───
  it('solves SAS with sides 3, 4 and angle C = 90° → c = 5', () => {
    const result = calculateTriangle({ mode: 'sas', sideA: 3, sideB: 4, angleC: 90 });
    expect(result.sideC).toBeCloseTo(5, 2);
    expect(result.area).toBeCloseTo(6, 2);
  });

  // ═══════════════════════════════════════════════════════
  // AAS Mode — Two Angles and Non-Included Side
  // ═══════════════════════════════════════════════════════

  // ─── Test 8: AAS with angles 45°, 60° and side a = 8 ───
  it('solves AAS with angles 45°, 60° and side a = 8', () => {
    const result = calculateTriangle({ mode: 'aas', angleA: 45, angleB: 60, sideA: 8 });
    expect(result.angleC).toBeCloseTo(75, 2);
    // Law of sines: b = 8 × sin(60°) / sin(45°) ≈ 8 × 0.8660 / 0.7071 ≈ 9.798
    expect(result.sideB).toBeCloseTo(9.798, 1);
    expect(result.sideC).toBeCloseTo(10.928, 1);
  });

  // ═══════════════════════════════════════════════════════
  // ASA Mode — Two Angles and Included Side
  // ═══════════════════════════════════════════════════════

  // ─── Test 9: ASA with angles 60°, 70° and side c = 10 ───
  it('solves ASA with angles 60°, 70° and side c = 10', () => {
    const result = calculateTriangle({ mode: 'asa', angleA: 60, angleB: 70, sideC: 10 });
    expect(result.angleC).toBeCloseTo(50, 2);
    // Law of sines: a = 10 × sin(60°) / sin(50°) ≈ 10 × 0.8660 / 0.7660 ≈ 11.305
    expect(result.sideA).toBeCloseTo(11.305, 1);
    expect(result.sideB).toBeCloseTo(12.267, 1);
  });

  // ═══════════════════════════════════════════════════════
  // Special Triangles
  // ═══════════════════════════════════════════════════════

  // ─── Test 10: 30-60-90 triangle verification ───
  it('solves a 30-60-90 triangle (SSS with sides 1, √3, 2)', () => {
    const result = calculateTriangle({ mode: 'sss', sideA: 1, sideB: Math.sqrt(3), sideC: 2 });
    expect(result.angleA).toBeCloseTo(30, 2);
    expect(result.angleB).toBeCloseTo(60, 2);
    expect(result.angleC).toBeCloseTo(90, 2);
  });

  // ─── Test 11: 45-45-90 triangle verification ───
  it('solves a 45-45-90 triangle (SSS with sides 1, 1, √2)', () => {
    const result = calculateTriangle({ mode: 'sss', sideA: 1, sideB: 1, sideC: Math.sqrt(2) });
    expect(result.angleA).toBeCloseTo(45, 2);
    expect(result.angleB).toBeCloseTo(45, 2);
    expect(result.angleC).toBeCloseTo(90, 2);
    expect(result.triangleType).toContain('right');
    expect(result.triangleType).toContain('isosceles');
  });

  // ═══════════════════════════════════════════════════════
  // Error Cases
  // ═══════════════════════════════════════════════════════

  // ─── Test 12: Invalid triangle (1, 1, 10) ───
  it('returns error for invalid triangle with sides 1, 1, 10', () => {
    const result = calculateTriangle({ mode: 'sss', sideA: 1, sideB: 1, sideC: 10 });
    expect(result.error).toBeDefined();
    expect(String(result.error)).toContain('sum of any two sides');
  });

  // ─── Test 13: Angles sum > 180 → error ───
  it('returns error when two angles sum to 180 or more', () => {
    const result = calculateTriangle({ mode: 'aas', angleA: 100, angleB: 90, sideA: 5 });
    expect(result.error).toBeDefined();
    expect(String(result.error)).toContain('less than 180');
  });

  // ─── Test 14: Zero side → error ───
  it('returns error for zero-length side', () => {
    const result = calculateTriangle({ mode: 'sss', sideA: 0, sideB: 4, sideC: 5 });
    expect(result.error).toBeDefined();
    expect(String(result.error)).toContain('positive');
  });

  // ─── Test 15: Negative side → error ───
  it('returns error for negative-length side', () => {
    const result = calculateTriangle({ mode: 'sss', sideA: -3, sideB: 4, sideC: 5 });
    expect(result.error).toBeDefined();
  });

  // ─── Test 16: Very small angles ───
  it('handles triangle with a very small angle (SSS: 1, 1, 1.99)', () => {
    const result = calculateTriangle({ mode: 'sss', sideA: 1, sideB: 1, sideC: 1.99 });
    // The angle opposite side 1.99 should be very close to 180° (very obtuse)
    expect(result.angleC).toBeGreaterThan(160);
    expect(result.triangleType).toContain('obtuse');
  });

  // ─── Test 17: Unknown mode throws error ───
  it('throws error for unknown mode', () => {
    expect(() =>
      calculateTriangle({ mode: 'ssa', sideA: 3, sideB: 4, angleA: 30 })
    ).toThrow('Unknown triangle mode');
  });

  // ═══════════════════════════════════════════════════════
  // Angle Sum Verification
  // ═══════════════════════════════════════════════════════

  // ─── Test 18: Angles sum to 180° for SSS ───
  it('verifies angles sum to 180° for arbitrary SSS triangle', () => {
    const result = calculateTriangle({ mode: 'sss', sideA: 13, sideB: 14, sideC: 15 });
    const angleSum = (result.angleA as number) + (result.angleB as number) + (result.angleC as number);
    expect(angleSum).toBeCloseTo(180, 2);
  });
});
