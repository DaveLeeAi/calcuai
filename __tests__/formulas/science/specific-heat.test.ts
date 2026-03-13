import { calculateSpecificHeat } from '@/lib/formulas/science/specific-heat';

describe('calculateSpecificHeat', () => {
  // ═══════════════════════════════════════════════════════
  // Solve for Heat Energy (Q = mcΔT)
  // ═══════════════════════════════════════════════════════

  // ─── Test 1: Basic heat calculation for water ───
  it('calculates heat to warm 1 kg of water by 10°C', () => {
    const result = calculateSpecificHeat({
      solveFor: 'heat',
      mass: 1,
      specificHeat: 4186,
      temperatureChange: 10,
    });
    // Q = 1 * 4186 * 10 = 41860 J
    expect(result.result).toBeCloseTo(41860, 0);
    expect(result.resultLabel).toBe('Heat Energy (Q)');
    expect(result.resultUnit).toBe('J');
  });

  // ─── Test 2: Heat for aluminum ───
  it('calculates heat to warm 2 kg of aluminum by 50°C', () => {
    const result = calculateSpecificHeat({
      solveFor: 'heat',
      mass: 2,
      specificHeat: 897,
      temperatureChange: 50,
    });
    // Q = 2 * 897 * 50 = 89700 J
    expect(result.result).toBeCloseTo(89700, 0);
  });

  // ─── Test 3: Negative temperature change (cooling) ───
  it('calculates negative heat for cooling', () => {
    const result = calculateSpecificHeat({
      solveFor: 'heat',
      mass: 1,
      specificHeat: 4186,
      temperatureChange: -20,
    });
    // Q = 1 * 4186 * (-20) = -83720 J
    expect(result.result).toBeCloseTo(-83720, 0);
  });

  // ─── Test 4: Zero temperature change produces zero heat ───
  it('returns zero heat when temperature change is zero', () => {
    const result = calculateSpecificHeat({
      solveFor: 'heat',
      mass: 5,
      specificHeat: 4186,
      temperatureChange: 0,
    });
    expect(result.result).toBe(0);
  });

  // ═══════════════════════════════════════════════════════
  // Solve for Mass (m = Q / (c × ΔT))
  // ═══════════════════════════════════════════════════════

  // ─── Test 5: Basic mass calculation ───
  it('solves for mass given heat, specific heat, and temperature change', () => {
    const result = calculateSpecificHeat({
      solveFor: 'mass',
      heatEnergy: 41860,
      specificHeat: 4186,
      temperatureChange: 10,
    });
    // m = 41860 / (4186 * 10) = 1 kg
    expect(result.result).toBeCloseTo(1, 4);
    expect(result.resultLabel).toBe('Mass (m)');
    expect(result.resultUnit).toBe('kg');
  });

  // ─── Test 6: Mass with large heat energy ───
  it('solves for mass with large Q', () => {
    const result = calculateSpecificHeat({
      solveFor: 'mass',
      heatEnergy: 224250,
      specificHeat: 897,
      temperatureChange: 50,
    });
    // m = 224250 / (897 * 50) = 5 kg
    expect(result.result).toBeCloseTo(5, 2);
  });

  // ─── Test 7: Mass throws on zero temperature change ───
  it('throws when solving for mass with ΔT = 0', () => {
    expect(() =>
      calculateSpecificHeat({
        solveFor: 'mass',
        heatEnergy: 1000,
        specificHeat: 4186,
        temperatureChange: 0,
      })
    ).toThrow('Temperature change cannot be zero when solving for mass.');
  });

  // ═══════════════════════════════════════════════════════
  // Solve for Specific Heat (c = Q / (m × ΔT))
  // ═══════════════════════════════════════════════════════

  // ─── Test 8: Identify water by specific heat ───
  it('solves for specific heat and identifies water', () => {
    const result = calculateSpecificHeat({
      solveFor: 'specificHeat',
      heatEnergy: 41860,
      mass: 1,
      temperatureChange: 10,
    });
    // c = 41860 / (1 * 10) = 4186 J/(kg·°C) → Water
    expect(result.result).toBeCloseTo(4186, 0);
    expect(result.resultLabel).toBe('Specific Heat (c)');
    expect(result.resultUnit).toBe('J/(kg·°C)');
  });

  // ─── Test 9: Identify iron by specific heat ───
  it('identifies iron specific heat correctly', () => {
    const result = calculateSpecificHeat({
      solveFor: 'specificHeat',
      heatEnergy: 4490,
      mass: 0.1,
      temperatureChange: 100,
    });
    // c = 4490 / (0.1 * 100) = 449 → Iron
    expect(result.result).toBeCloseTo(449, 0);
  });

  // ─── Test 10: Specific heat throws on zero temperature change ───
  it('throws when solving for specific heat with ΔT = 0', () => {
    expect(() =>
      calculateSpecificHeat({
        solveFor: 'specificHeat',
        heatEnergy: 1000,
        mass: 1,
        temperatureChange: 0,
      })
    ).toThrow('Temperature change cannot be zero when solving for specific heat.');
  });

  // ═══════════════════════════════════════════════════════
  // Solve for Temperature Change (ΔT = Q / (m × c))
  // ═══════════════════════════════════════════════════════

  // ─── Test 11: Basic temperature change calculation ───
  it('solves for temperature change', () => {
    const result = calculateSpecificHeat({
      solveFor: 'temperatureChange',
      heatEnergy: 41860,
      mass: 1,
      specificHeat: 4186,
    });
    // ΔT = 41860 / (1 * 4186) = 10°C
    expect(result.result).toBeCloseTo(10, 2);
    expect(result.resultLabel).toBe('Temperature Change (ΔT)');
    expect(result.resultUnit).toBe('°C');
  });

  // ─── Test 12: Negative temperature change from negative heat ───
  it('returns negative ΔT for heat loss', () => {
    const result = calculateSpecificHeat({
      solveFor: 'temperatureChange',
      heatEnergy: -83720,
      mass: 1,
      specificHeat: 4186,
    });
    // ΔT = -83720 / (1 * 4186) ≈ -20°C
    expect(result.result).toBeCloseTo(-20, 1);
  });

  // ═══════════════════════════════════════════════════════
  // Cross-Verification
  // ═══════════════════════════════════════════════════════

  // ─── Test 13: Round-trip consistency across all 4 modes ───
  it('produces consistent results across all solver paths', () => {
    // Start: Q = 2 * 385 * 75 = 57750 J (copper)
    const fromHeat = calculateSpecificHeat({
      solveFor: 'heat',
      mass: 2,
      specificHeat: 385,
      temperatureChange: 75,
    });
    const Q = fromHeat.result as number;
    expect(Q).toBeCloseTo(57750, 0);

    const fromMass = calculateSpecificHeat({
      solveFor: 'mass',
      heatEnergy: Q,
      specificHeat: 385,
      temperatureChange: 75,
    });
    expect(fromMass.result).toBeCloseTo(2, 4);

    const fromC = calculateSpecificHeat({
      solveFor: 'specificHeat',
      heatEnergy: Q,
      mass: 2,
      temperatureChange: 75,
    });
    expect(fromC.result).toBeCloseTo(385, 2);

    const fromDT = calculateSpecificHeat({
      solveFor: 'temperatureChange',
      heatEnergy: Q,
      mass: 2,
      specificHeat: 385,
    });
    expect(fromDT.result).toBeCloseTo(75, 2);
  });

  // ═══════════════════════════════════════════════════════
  // String Coercion
  // ═══════════════════════════════════════════════════════

  // ─── Test 14: String inputs are coerced to numbers ───
  it('handles string inputs by converting to numbers', () => {
    const result = calculateSpecificHeat({
      solveFor: 'heat',
      mass: '1',
      specificHeat: '4186',
      temperatureChange: '10',
    });
    expect(result.result).toBeCloseTo(41860, 0);
  });

  // ─── Test 15: String solveFor value ───
  it('accepts string solveFor value', () => {
    const result = calculateSpecificHeat({
      solveFor: 'mass',
      heatEnergy: '41860',
      specificHeat: '4186',
      temperatureChange: '10',
    });
    expect(result.result).toBeCloseTo(1, 4);
  });

  // ═══════════════════════════════════════════════════════
  // Edge Cases
  // ═══════════════════════════════════════════════════════

  // ─── Test 16: Very small mass ───
  it('handles very small mass (0.001 kg)', () => {
    const result = calculateSpecificHeat({
      solveFor: 'heat',
      mass: 0.001,
      specificHeat: 4186,
      temperatureChange: 100,
    });
    // Q = 0.001 * 4186 * 100 = 418.6 J
    expect(result.result).toBeCloseTo(418.6, 1);
  });

  // ─── Test 17: Very large heat energy ───
  it('handles very large heat energy values', () => {
    const result = calculateSpecificHeat({
      solveFor: 'mass',
      heatEnergy: 1000000000,
      specificHeat: 4186,
      temperatureChange: 50,
    });
    // m = 1e9 / (4186 * 50) = 4777.83 kg
    expect(result.result).toBeCloseTo(4777.83, 0);
  });

  // ─── Test 18: Air specific heat ───
  it('calculates correctly with air specific heat (1005)', () => {
    const result = calculateSpecificHeat({
      solveFor: 'heat',
      mass: 10,
      specificHeat: 1005,
      temperatureChange: 25,
    });
    // Q = 10 * 1005 * 25 = 251250 J
    expect(result.result).toBeCloseTo(251250, 0);
  });

  // ═══════════════════════════════════════════════════════
  // Error Cases
  // ═══════════════════════════════════════════════════════

  // ─── Test 19: Invalid solveFor value ───
  it('throws on invalid solveFor value', () => {
    expect(() =>
      calculateSpecificHeat({
        solveFor: 'invalid',
        mass: 1,
        specificHeat: 4186,
        temperatureChange: 10,
      })
    ).toThrow('Invalid solveFor value');
  });

  // ─── Test 20: Negative mass is clamped to minimum ───
  it('clamps negative mass to 0.001 minimum', () => {
    const result = calculateSpecificHeat({
      solveFor: 'heat',
      mass: -5,
      specificHeat: 4186,
      temperatureChange: 10,
    });
    // Mass clamped to 0.001
    expect(result.mass).toBeCloseTo(0.001, 3);
  });

  // ─── Test 21: Missing inputs default to 0 ───
  it('defaults missing numeric inputs to 0', () => {
    const result = calculateSpecificHeat({
      solveFor: 'heat',
    });
    // mass defaults to 0.001 (clamped), specificHeat defaults to 0.001 (clamped), dT = 0
    expect(result.result).toBe(0);
  });

  // ═══════════════════════════════════════════════════════
  // Output Structure
  // ═══════════════════════════════════════════════════════

  // ─── Test 22: allValues output has correct structure ───
  it('returns allValues with correct labels and units', () => {
    const result = calculateSpecificHeat({
      solveFor: 'heat',
      mass: 1,
      specificHeat: 4186,
      temperatureChange: 10,
    });
    const allValues = result.allValues as { label: string; value: number; unit: string }[];
    expect(allValues).toHaveLength(4);
    expect(allValues[0]).toEqual(expect.objectContaining({ label: 'Heat Energy', unit: 'J' }));
    expect(allValues[1]).toEqual(expect.objectContaining({ label: 'Mass', unit: 'kg' }));
    expect(allValues[2]).toEqual(expect.objectContaining({ label: 'Specific Heat', unit: 'J/(kg·°C)' }));
    expect(allValues[3]).toEqual(expect.objectContaining({ label: 'Temperature Change', unit: '°C' }));
  });

  // ─── Test 23: heatEnergy output field matches result when solving for heat ───
  it('output heatEnergy field matches result when solving for heat', () => {
    const result = calculateSpecificHeat({
      solveFor: 'heat',
      mass: 3,
      specificHeat: 449,
      temperatureChange: 20,
    });
    expect(result.heatEnergy).toBe(result.result);
  });

  // ─── Test 24: mass output field matches result when solving for mass ───
  it('output mass field matches result when solving for mass', () => {
    const result = calculateSpecificHeat({
      solveFor: 'mass',
      heatEnergy: 26940,
      specificHeat: 449,
      temperatureChange: 20,
    });
    expect(result.mass).toBe(result.result);
  });

  // ─── Test 25: Copper specific heat calculation ───
  it('calculates correctly with copper specific heat (385)', () => {
    const result = calculateSpecificHeat({
      solveFor: 'heat',
      mass: 0.5,
      specificHeat: 385,
      temperatureChange: 100,
    });
    // Q = 0.5 * 385 * 100 = 19250 J
    expect(result.result).toBeCloseTo(19250, 0);
  });
});
