import { calculateDensity } from '@/lib/formulas/science/density';

describe('calculateDensity', () => {
  // ═══════════════════════════════════════════════════════
  // Combination 1: Density + Mass → Volume
  // ═══════════════════════════════════════════════════════

  // ─── Test 1: Water — density=1000, mass=5 → V=0.005 ───
  it('solves volume from density=1000 and mass=5 (water)', () => {
    const result = calculateDensity({ density: 1000, mass: 5 });
    expect(result.density).toBeCloseTo(1000, 4);
    expect(result.mass).toBeCloseTo(5, 4);
    expect(result.volume).toBeCloseTo(0.005, 4);
    expect(result.solvedFrom).toBe('Density (\u03C1) and Mass (m)');
  });

  // ─── Test 2: Gold — density=19320, mass=1 → V=0.0000517 ───
  it('solves volume from density=19320 and mass=1 (gold)', () => {
    const result = calculateDensity({ density: 19320, mass: 1 });
    expect(result.volume).toBeCloseTo(0.00005176, 6);
  });

  // ═══════════════════════════════════════════════════════
  // Combination 2: Density + Volume → Mass
  // ═══════════════════════════════════════════════════════

  // ─── Test 3: Aluminum — density=2700, volume=0.001 → m=2.7 ───
  it('solves mass from density=2700 and volume=0.001 (aluminum)', () => {
    const result = calculateDensity({ density: 2700, volume: 0.001 });
    expect(result.mass).toBeCloseTo(2.7, 4);
    expect(result.solvedFrom).toBe('Density (\u03C1) and Volume (V)');
  });

  // ─── Test 4: 1 cubic meter of water — density=1000, volume=1 → m=1000 ───
  it('solves mass from density=1000 and volume=1 (cubic meter of water)', () => {
    const result = calculateDensity({ density: 1000, volume: 1 });
    expect(result.mass).toBeCloseTo(1000, 4);
  });

  // ═══════════════════════════════════════════════════════
  // Combination 3: Mass + Volume → Density
  // ═══════════════════════════════════════════════════════

  // ─── Test 5: Iron — mass=7.874, volume=0.001 → density=7874 ───
  it('solves density from mass=7.874 and volume=0.001 (iron)', () => {
    const result = calculateDensity({ mass: 7.874, volume: 0.001 });
    expect(result.density).toBeCloseTo(7874, 0);
    expect(result.solvedFrom).toBe('Mass (m) and Volume (V)');
  });

  // ─── Test 6: Floats on water — mass=0.5, volume=0.0006 → density=833.33 ───
  it('solves density from mass=0.5 and volume=0.0006 (floats on water)', () => {
    const result = calculateDensity({ mass: 0.5, volume: 0.0006 });
    expect(result.density).toBeCloseTo(833.33, 1);
  });

  // ═══════════════════════════════════════════════════════
  // Unit Conversions
  // ═══════════════════════════════════════════════════════

  // ─── Test 7: g/cm³ conversion (1000 kg/m³ = 1 g/cm³) ───
  it('converts density to g/cm³ correctly', () => {
    const result = calculateDensity({ density: 1000, mass: 5 });
    const conv = result.conversions as Record<string, number>;
    expect(conv.density_gcm3).toBeCloseTo(1, 4);
  });

  // ─── Test 8: lb/ft³ conversion (1000 kg/m³ ≈ 62.428 lb/ft³) ───
  it('converts density to lb/ft³ correctly', () => {
    const result = calculateDensity({ density: 1000, mass: 5 });
    const conv = result.conversions as Record<string, number>;
    expect(conv.density_lbft3).toBeCloseTo(62.428, 1);
  });

  // ─── Test 9: mass_lb conversion (1 kg ≈ 2.20462 lb) ───
  it('converts mass to lb correctly', () => {
    const result = calculateDensity({ density: 1000, mass: 1 });
    const conv = result.conversions as Record<string, number>;
    expect(conv.mass_lb).toBeCloseTo(2.20462, 2);
  });

  // ─── Test 10: volume_L conversion (0.001 m³ = 1 L) ───
  it('converts volume to liters correctly', () => {
    const result = calculateDensity({ mass: 7.874, volume: 0.001 });
    const conv = result.conversions as Record<string, number>;
    expect(conv.volume_L).toBeCloseTo(1, 4);
  });

  // ═══════════════════════════════════════════════════════
  // Cross-Verification
  // ═══════════════════════════════════════════════════════

  // ─── Test 11: All 3 combos for ρ=1000, m=1, V=0.001 match ───
  it('produces consistent results across all input combinations', () => {
    const fromDM = calculateDensity({ density: 1000, mass: 1 });
    const fromDV = calculateDensity({ density: 1000, volume: 0.001 });
    const fromMV = calculateDensity({ mass: 1, volume: 0.001 });
    for (const r of [fromDM, fromDV, fromMV]) {
      expect(r.density).toBeCloseTo(1000, 4);
      expect(r.mass).toBeCloseTo(1, 4);
      expect(r.volume).toBeCloseTo(0.001, 4);
    }
  });

  // ═══════════════════════════════════════════════════════
  // Edge Cases
  // ═══════════════════════════════════════════════════════

  // ─── Test 12: Very small values (air density=1.225, mass=0.001) ───
  it('handles very small values (air density)', () => {
    const result = calculateDensity({ density: 1.225, mass: 0.001 });
    expect(result.volume).toBeCloseTo(0.000816, 4);
  });

  // ─── Test 13: Very large values (osmium density=22590, mass=1000) ───
  it('handles very large values (osmium density)', () => {
    const result = calculateDensity({ density: 22590, mass: 1000 });
    expect(result.volume).toBeCloseTo(0.04427, 3);
  });

  // ═══════════════════════════════════════════════════════
  // Error Cases
  // ═══════════════════════════════════════════════════════

  // ─── Test 14: Fewer than 2 inputs throws error ───
  it('throws error when fewer than 2 values provided', () => {
    expect(() => calculateDensity({ density: 1000 })).toThrow();
  });

  // ─── Test 15: No inputs throws error ───
  it('throws error when no values provided', () => {
    expect(() => calculateDensity({})).toThrow();
  });

  // ─── Test 16: Zero values treated as not provided ───
  it('treats zero values as not provided', () => {
    expect(() => calculateDensity({ density: 0, mass: 0 })).toThrow();
  });

  // ═══════════════════════════════════════════════════════
  // Output Structure
  // ═══════════════════════════════════════════════════════

  // ─── Test 17: allValues array structure ───
  it('returns allValues with correct labels and units', () => {
    const result = calculateDensity({ density: 1000, mass: 5 });
    const allValues = result.allValues as { label: string; value: number; unit: string }[];
    expect(allValues).toHaveLength(3);
    expect(allValues[0]).toEqual(expect.objectContaining({ label: 'Density', unit: 'kg/m\u00B3' }));
    expect(allValues[1]).toEqual(expect.objectContaining({ label: 'Mass', unit: 'kg' }));
    expect(allValues[2]).toEqual(expect.objectContaining({ label: 'Volume', unit: 'm\u00B3' }));
  });

  // ─── Test 18: materialComparison array check ───
  it('returns materialComparison array with common materials', () => {
    const result = calculateDensity({ density: 1000, mass: 5 });
    const materialComparison = result.materialComparison as { material: string; density: number; unit: string }[];
    expect(materialComparison).toBeDefined();
    expect(materialComparison.length).toBeGreaterThanOrEqual(6);
    const names = materialComparison.map((m) => m.material);
    expect(names).toContain('Water (4°C)');
  });

  // ─── Test 19: String input handling ───
  it('handles string inputs by converting to numbers', () => {
    const result = calculateDensity({ density: '1000', mass: '5' });
    expect(result.density).toBeCloseTo(1000, 4);
    expect(result.mass).toBeCloseTo(5, 4);
    expect(result.volume).toBeCloseTo(0.005, 4);
  });

  // ─── Test 20: More than 2 inputs uses first valid pair ───
  it('uses first valid pair when all 3 inputs provided', () => {
    const result = calculateDensity({ density: 1000, mass: 1, volume: 0.001 });
    expect(result.solvedFrom).toBe('Density (\u03C1) and Mass (m)');
  });
});
