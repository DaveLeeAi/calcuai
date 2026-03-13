import { calculateHeatTransfer } from '@/lib/formulas/science/heat-transfer';

describe('calculateHeatTransfer', () => {
  // ═══════════════════════════════════════════════════════
  // Solve for Heat Energy (given m, c, DT)
  // ═══════════════════════════════════════════════════════

  it('calculates heat to warm 1 kg water by 10°C', () => {
    const result = calculateHeatTransfer({
      mass: 1,
      specificHeat: 4186,
      temperatureChange: 10,
    });
    // Q = 1 * 4186 * 10 = 41860 J
    expect(result.heatEnergy).toBeCloseTo(41860, 2);
    expect(result.solvedFrom).toBe('Mass, Specific Heat, and Temperature Change');
  });

  it('calculates heat to warm 5 kg aluminum by 50°C', () => {
    const result = calculateHeatTransfer({
      mass: 5,
      specificHeat: 897,
      temperatureChange: 50,
    });
    // Q = 5 * 897 * 50 = 224250 J
    expect(result.heatEnergy).toBeCloseTo(224250, 2);
  });

  it('calculates heat for cooling (negative DT)', () => {
    const result = calculateHeatTransfer({
      mass: 2,
      specificHeat: 4186,
      temperatureChange: -15,
    });
    // Q = 2 * 4186 * (-15) = -125580 J (heat released)
    expect(result.heatEnergy).toBeCloseTo(-125580, 2);
  });

  it('uses material preset for copper', () => {
    const result = calculateHeatTransfer({
      mass: 0.5,
      materialPreset: '385',
      temperatureChange: 100,
    });
    // Q = 0.5 * 385 * 100 = 19250 J
    expect(result.heatEnergy).toBeCloseTo(19250, 2);
  });

  // ═══════════════════════════════════════════════════════
  // Solve for Mass (given Q, c, DT)
  // ═══════════════════════════════════════════════════════

  it('solves for mass given heat, specific heat, and temperature change', () => {
    const result = calculateHeatTransfer({
      heatEnergy: 41860,
      specificHeat: 4186,
      temperatureChange: 10,
    });
    expect(result.mass).toBeCloseTo(1, 4);
    expect(result.solvedFrom).toBe('Heat Energy, Specific Heat, and Temperature Change');
  });

  it('solves mass for large energy input', () => {
    const result = calculateHeatTransfer({
      heatEnergy: 224250,
      specificHeat: 897,
      temperatureChange: 50,
    });
    expect(result.mass).toBeCloseTo(5, 4);
  });

  // ═══════════════════════════════════════════════════════
  // Solve for Specific Heat (given Q, m, DT)
  // ═══════════════════════════════════════════════════════

  it('solves for specific heat given heat, mass, and temperature change', () => {
    const result = calculateHeatTransfer({
      heatEnergy: 41860,
      mass: 1,
      temperatureChange: 10,
    });
    expect(result.specificHeat).toBeCloseTo(4186, 2);
    expect(result.solvedFrom).toBe('Heat Energy, Mass, and Temperature Change');
  });

  it('identifies unknown material by specific heat', () => {
    const result = calculateHeatTransfer({
      heatEnergy: 4490,
      mass: 0.1,
      temperatureChange: 100,
    });
    // c = 4490 / (0.1 * 100) = 449 → Iron
    expect(result.specificHeat).toBeCloseTo(449, 2);
  });

  // ═══════════════════════════════════════════════════════
  // Solve for Temperature Change (given Q, m, c)
  // ═══════════════════════════════════════════════════════

  it('solves for temperature change given heat, mass, and specific heat', () => {
    const result = calculateHeatTransfer({
      heatEnergy: 41860,
      mass: 1,
      specificHeat: 4186,
    });
    expect(result.temperatureChange).toBeCloseTo(10, 4);
    expect(result.solvedFrom).toBe('Heat Energy, Mass, and Specific Heat');
  });

  it('returns negative DT for heat loss', () => {
    const result = calculateHeatTransfer({
      heatEnergy: -125580,
      mass: 2,
      specificHeat: 4186,
    });
    expect(result.temperatureChange).toBeCloseTo(-15, 2);
  });

  // ═══════════════════════════════════════════════════════
  // Cross-Verification
  // ═══════════════════════════════════════════════════════

  it('produces consistent results across all solver paths', () => {
    const fromMCDT = calculateHeatTransfer({
      mass: 3,
      specificHeat: 840,
      temperatureChange: 25,
    });
    const Q = fromMCDT.heatEnergy as number; // 3 * 840 * 25 = 63000

    const fromQCDT = calculateHeatTransfer({
      heatEnergy: Q,
      specificHeat: 840,
      temperatureChange: 25,
    });
    expect(fromQCDT.mass).toBeCloseTo(3, 4);

    const fromQMDT = calculateHeatTransfer({
      heatEnergy: Q,
      mass: 3,
      temperatureChange: 25,
    });
    expect(fromQMDT.specificHeat).toBeCloseTo(840, 4);

    const fromQMC = calculateHeatTransfer({
      heatEnergy: Q,
      mass: 3,
      specificHeat: 840,
    });
    expect(fromQMC.temperatureChange).toBeCloseTo(25, 4);
  });

  // ═══════════════════════════════════════════════════════
  // Unit Conversions
  // ═══════════════════════════════════════════════════════

  it('converts energy to kJ correctly', () => {
    const result = calculateHeatTransfer({
      mass: 1,
      specificHeat: 4186,
      temperatureChange: 10,
    });
    const conv = result.conversions as Record<string, number>;
    expect(conv.energy_kJ).toBeCloseTo(41.86, 2);
  });

  it('converts energy to calories correctly', () => {
    const result = calculateHeatTransfer({
      mass: 1,
      specificHeat: 4186,
      temperatureChange: 10,
    });
    const conv = result.conversions as Record<string, number>;
    // 41860 / 4.184 ≈ 10004.8 cal
    expect(conv.energy_cal).toBeCloseTo(10004.8, 0);
  });

  it('converts energy to kilocalories correctly', () => {
    const result = calculateHeatTransfer({
      mass: 1,
      specificHeat: 4186,
      temperatureChange: 10,
    });
    const conv = result.conversions as Record<string, number>;
    // 41860 / 4184 ≈ 10.005 kcal
    expect(conv.energy_kcal).toBeCloseTo(10.005, 2);
  });

  it('converts energy to BTU correctly', () => {
    const result = calculateHeatTransfer({
      mass: 1,
      specificHeat: 4186,
      temperatureChange: 10,
    });
    const conv = result.conversions as Record<string, number>;
    // 41860 / 1055.06 ≈ 39.67 BTU
    expect(conv.energy_BTU).toBeCloseTo(39.67, 1);
  });

  it('converts energy to Wh correctly', () => {
    const result = calculateHeatTransfer({
      mass: 1,
      specificHeat: 4186,
      temperatureChange: 10,
    });
    const conv = result.conversions as Record<string, number>;
    // 41860 / 3600 ≈ 11.628 Wh
    expect(conv.energy_Wh).toBeCloseTo(11.628, 2);
  });

  it('converts mass to grams and pounds', () => {
    const result = calculateHeatTransfer({
      mass: 2,
      specificHeat: 4186,
      temperatureChange: 10,
    });
    const conv = result.conversions as Record<string, number>;
    expect(conv.mass_g).toBeCloseTo(2000, 2);
    expect(conv.mass_lb).toBeCloseTo(4.409, 2);
  });

  // ═══════════════════════════════════════════════════════
  // Material Presets
  // ═══════════════════════════════════════════════════════

  it('applies water preset correctly', () => {
    const result = calculateHeatTransfer({
      mass: 1,
      materialPreset: '4186',
      temperatureChange: 1,
    });
    expect(result.heatEnergy).toBeCloseTo(4186, 2);
  });

  it('applies iron preset correctly', () => {
    const result = calculateHeatTransfer({
      mass: 1,
      materialPreset: '449',
      temperatureChange: 1,
    });
    expect(result.heatEnergy).toBeCloseTo(449, 2);
  });

  it('ignores custom preset and uses specificHeat input', () => {
    const result = calculateHeatTransfer({
      mass: 1,
      materialPreset: 'custom',
      specificHeat: 500,
      temperatureChange: 10,
    });
    expect(result.heatEnergy).toBeCloseTo(5000, 2);
  });

  // ═══════════════════════════════════════════════════════
  // Edge Cases
  // ═══════════════════════════════════════════════════════

  it('handles very small mass (0.001 kg)', () => {
    const result = calculateHeatTransfer({
      mass: 0.001,
      specificHeat: 4186,
      temperatureChange: 100,
    });
    // Q = 0.001 * 4186 * 100 = 418.6 J
    expect(result.heatEnergy).toBeCloseTo(418.6, 2);
  });

  it('handles very large temperature change', () => {
    const result = calculateHeatTransfer({
      mass: 1,
      specificHeat: 897,
      temperatureChange: 500,
    });
    // Q = 1 * 897 * 500 = 448500 J
    expect(result.heatEnergy).toBeCloseTo(448500, 2);
  });

  // ═══════════════════════════════════════════════════════
  // Error Cases
  // ═══════════════════════════════════════════════════════

  it('throws when fewer than 3 values provided', () => {
    expect(() => calculateHeatTransfer({ mass: 1, specificHeat: 4186 })).toThrow(
      'Enter any three of: Heat Energy, Mass, Specific Heat, Temperature Change.'
    );
  });

  it('throws when no values provided', () => {
    expect(() => calculateHeatTransfer({})).toThrow();
  });

  it('treats zero mass as not provided', () => {
    expect(() => calculateHeatTransfer({ mass: 0, specificHeat: 4186, temperatureChange: 10 })).toThrow();
  });

  it('treats zero specific heat as not provided', () => {
    expect(() => calculateHeatTransfer({ mass: 1, specificHeat: 0, temperatureChange: 10 })).toThrow();
  });

  // ═══════════════════════════════════════════════════════
  // Output Structure
  // ═══════════════════════════════════════════════════════

  it('returns allValues with correct labels and units', () => {
    const result = calculateHeatTransfer({
      mass: 1,
      specificHeat: 4186,
      temperatureChange: 10,
    });
    const allValues = result.allValues as { label: string; value: number; unit: string }[];
    expect(allValues).toHaveLength(4);
    expect(allValues[0]).toEqual(expect.objectContaining({ label: 'Heat Energy', unit: 'J' }));
    expect(allValues[1]).toEqual(expect.objectContaining({ label: 'Mass', unit: 'kg' }));
    expect(allValues[2]).toEqual(expect.objectContaining({ label: 'Specific Heat', unit: 'J/(kg·K)' }));
    expect(allValues[3]).toEqual(expect.objectContaining({ label: 'Temperature Change', unit: '°C / K' }));
  });

  it('handles string inputs by converting to numbers', () => {
    const result = calculateHeatTransfer({
      mass: '1',
      specificHeat: '4186',
      temperatureChange: '10',
    });
    expect(result.heatEnergy).toBeCloseTo(41860, 2);
  });
});
