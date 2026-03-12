import { calculatePressure } from '@/lib/formulas/science/pressure';

describe('calculatePressure', () => {
  // ═══════════════════════════════════════════════════════
  // Combination 1: Pressure + Area → Force
  // ═══════════════════════════════════════════════════════

  // ─── Test 1: 1 atm on 1 m² → force = 101325 N ───
  it('solves force from pressure=101325 and area=1 (1 atm on 1 m²)', () => {
    const result = calculatePressure({ pressure: 101325, area: 1 });
    expect(result.pressure).toBeCloseTo(101325, 4);
    expect(result.area).toBeCloseTo(1, 4);
    expect(result.force).toBeCloseTo(101325, 4);
    expect(result.solvedFrom).toBe('Pressure (P) and Area (A)');
  });

  // ─── Test 2: Pressure=50000, force=500 → area=0.01 ───
  it('solves area from pressure=50000 and force=500', () => {
    const result = calculatePressure({ pressure: 50000, force: 500 });
    expect(result.area).toBeCloseTo(0.01, 4);
    expect(result.solvedFrom).toBe('Pressure (P) and Force (F)');
  });

  // ═══════════════════════════════════════════════════════
  // Combination 2: Force + Area → Pressure
  // ═══════════════════════════════════════════════════════

  // ─── Test 3: Hydraulic press — force=500, area=0.01 → pressure=50000 ───
  it('solves pressure from force=500 and area=0.01 (hydraulic press)', () => {
    const result = calculatePressure({ force: 500, area: 0.01 });
    expect(result.pressure).toBeCloseTo(50000, 4);
    expect(result.solvedFrom).toBe('Force (F) and Area (A)');
  });

  // ─── Test 4: Stiletto heel — force=588.6, area=0.0001 → pressure=5886000 ───
  it('solves pressure from force=588.6 and area=0.0001 (stiletto heel)', () => {
    const result = calculatePressure({ force: 588.6, area: 0.0001 });
    expect(result.pressure).toBeCloseTo(5886000, 0);
  });

  // ═══════════════════════════════════════════════════════
  // Combination 3: Pressure + Force → Area
  // ═══════════════════════════════════════════════════════

  // ─── Test 5: pressure=101325, force=101325 → area=1 ───
  it('solves area from pressure=101325 and force=101325', () => {
    const result = calculatePressure({ pressure: 101325, force: 101325 });
    expect(result.area).toBeCloseTo(1, 4);
  });

  // ─── Test 6: force=100, area=0.5 → pressure=200 ───
  it('solves pressure from force=100 and area=0.5', () => {
    const result = calculatePressure({ force: 100, area: 0.5 });
    expect(result.pressure).toBeCloseTo(200, 4);
  });

  // ═══════════════════════════════════════════════════════
  // Unit Conversions
  // ═══════════════════════════════════════════════════════

  // ─── Test 7: kPa conversion (101325 Pa = 101.325 kPa) ───
  it('converts pressure to kPa correctly', () => {
    const result = calculatePressure({ pressure: 101325, area: 1 });
    const conv = result.conversions as Record<string, number>;
    expect(conv.pressure_kpa).toBeCloseTo(101.325, 3);
  });

  // ─── Test 8: bar conversion (101325 Pa ≈ 1.01325 bar) ───
  it('converts pressure to bar correctly', () => {
    const result = calculatePressure({ pressure: 101325, area: 1 });
    const conv = result.conversions as Record<string, number>;
    expect(conv.pressure_bar).toBeCloseTo(1.01325, 4);
  });

  // ─── Test 9: atm conversion (101325 Pa = 1 atm) ───
  it('converts pressure to atm correctly', () => {
    const result = calculatePressure({ pressure: 101325, area: 1 });
    const conv = result.conversions as Record<string, number>;
    expect(conv.pressure_atm).toBeCloseTo(1, 4);
  });

  // ─── Test 10: psi conversion (101325 Pa ≈ 14.696 psi) ───
  it('converts pressure to psi correctly', () => {
    const result = calculatePressure({ pressure: 101325, area: 1 });
    const conv = result.conversions as Record<string, number>;
    expect(conv.pressure_psi).toBeCloseTo(14.696, 1);
  });

  // ─── Test 11: mmHg conversion (101325 Pa ≈ 760 mmHg) ───
  it('converts pressure to mmHg correctly', () => {
    const result = calculatePressure({ pressure: 101325, area: 1 });
    const conv = result.conversions as Record<string, number>;
    expect(conv.pressure_mmhg).toBeCloseTo(760, 0);
  });

  // ═══════════════════════════════════════════════════════
  // Cross-Verification
  // ═══════════════════════════════════════════════════════

  // ─── Test 12: All 3 combos for P=100000, F=1000, A=0.01 match ───
  it('produces consistent results across all input combinations', () => {
    const fromPA = calculatePressure({ pressure: 100000, area: 0.01 });
    const fromPF = calculatePressure({ pressure: 100000, force: 1000 });
    const fromFA = calculatePressure({ force: 1000, area: 0.01 });
    for (const r of [fromPA, fromPF, fromFA]) {
      expect(r.pressure).toBeCloseTo(100000, 4);
      expect(r.force).toBeCloseTo(1000, 4);
      expect(r.area).toBeCloseTo(0.01, 4);
    }
  });

  // ═══════════════════════════════════════════════════════
  // Edge Cases
  // ═══════════════════════════════════════════════════════

  // ─── Test 13: Very small area (precision test) ───
  it('handles very small area values', () => {
    const result = calculatePressure({ force: 1, area: 0.000001 });
    expect(result.pressure).toBeCloseTo(1000000, 0);
  });

  // ─── Test 14: Very large pressure (precision test) ───
  it('handles very large pressure values', () => {
    const result = calculatePressure({ pressure: 1e9, area: 0.001 });
    expect(result.force).toBeCloseTo(1000000, 0);
  });

  // ═══════════════════════════════════════════════════════
  // Error Cases
  // ═══════════════════════════════════════════════════════

  // ─── Test 15: Fewer than 2 inputs throws error ───
  it('throws error when fewer than 2 values provided', () => {
    expect(() => calculatePressure({ pressure: 101325 })).toThrow();
  });

  // ─── Test 16: No inputs throws error ───
  it('throws error when no values provided', () => {
    expect(() => calculatePressure({})).toThrow();
  });

  // ─── Test 17: Zero values treated as not provided ───
  it('treats zero values as not provided', () => {
    expect(() => calculatePressure({ pressure: 0, force: 0 })).toThrow();
  });

  // ═══════════════════════════════════════════════════════
  // Output Structure
  // ═══════════════════════════════════════════════════════

  // ─── Test 18: allValues array structure ───
  it('returns allValues with correct labels and units', () => {
    const result = calculatePressure({ pressure: 101325, area: 1 });
    const allValues = result.allValues as { label: string; value: number; unit: string }[];
    expect(allValues).toHaveLength(3);
    expect(allValues[0]).toEqual(expect.objectContaining({ label: 'Pressure', unit: 'Pa' }));
    expect(allValues[1]).toEqual(expect.objectContaining({ label: 'Force', unit: 'N' }));
    expect(allValues[2]).toEqual(expect.objectContaining({ label: 'Area', unit: 'm\u00B2' }));
  });

  // ─── Test 19: String input handling ───
  it('handles string inputs by converting to numbers', () => {
    const result = calculatePressure({ force: '500', area: '0.01' });
    expect(result.pressure).toBeCloseTo(50000, 4);
    expect(result.force).toBeCloseTo(500, 4);
    expect(result.area).toBeCloseTo(0.01, 4);
  });

  // ─── Test 20: More than 2 inputs uses first valid pair ───
  it('uses first valid pair when all 3 inputs provided', () => {
    const result = calculatePressure({ pressure: 100000, force: 1000, area: 0.01 });
    expect(result.solvedFrom).toBe('Pressure (P) and Force (F)');
  });
});
