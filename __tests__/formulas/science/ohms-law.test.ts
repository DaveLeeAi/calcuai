import { calculateOhmsLaw } from '@/lib/formulas/science/ohms-law';

describe('calculateOhmsLaw', () => {
  // ═══════════════════════════════════════════════════════
  // Combination 1: Voltage + Current → Resistance, Power
  // ═══════════════════════════════════════════════════════

  // ─── Test 1: 12V car battery at 2A ───
  it('solves R and P from V=12 and I=2 (car battery)', () => {
    const result = calculateOhmsLaw({ voltage: 12, current: 2 });
    expect(result.voltage).toBeCloseTo(12, 4);
    expect(result.current).toBeCloseTo(2, 4);
    expect(result.resistance).toBeCloseTo(6, 4);
    expect(result.power).toBeCloseTo(24, 4);
    expect(result.solvedFrom).toBe('Voltage (V) and Current (I)');
  });

  // ─── Test 2: USB power — 5V at 0.5A ───
  it('solves R and P from V=5 and I=0.5 (USB port)', () => {
    const result = calculateOhmsLaw({ voltage: 5, current: 0.5 });
    expect(result.resistance).toBeCloseTo(10, 4);
    expect(result.power).toBeCloseTo(2.5, 4);
  });

  // ═══════════════════════════════════════════════════════
  // Combination 2: Voltage + Resistance → Current, Power
  // ═══════════════════════════════════════════════════════

  // ─── Test 3: 120V outlet with 60Ω load ───
  it('solves I and P from V=120 and R=60', () => {
    const result = calculateOhmsLaw({ voltage: 120, resistance: 60 });
    expect(result.current).toBeCloseTo(2, 4);
    expect(result.power).toBeCloseTo(240, 4);
    expect(result.solvedFrom).toBe('Voltage (V) and Resistance (R)');
  });

  // ─── Test 4: 9V battery with 1000Ω resistor ───
  it('solves I and P from V=9 and R=1000', () => {
    const result = calculateOhmsLaw({ voltage: 9, resistance: 1000 });
    expect(result.current).toBeCloseTo(0.009, 4);
    expect(result.power).toBeCloseTo(0.081, 4);
  });

  // ═══════════════════════════════════════════════════════
  // Combination 3: Voltage + Power → Current, Resistance
  // ═══════════════════════════════════════════════════════

  // ─── Test 5: 120V outlet, 1500W heater ───
  it('solves I and R from V=120 and P=1500 (space heater)', () => {
    const result = calculateOhmsLaw({ voltage: 120, power: 1500 });
    expect(result.current).toBeCloseTo(12.5, 4);
    expect(result.resistance).toBeCloseTo(9.6, 4);
    expect(result.solvedFrom).toBe('Voltage (V) and Power (P)');
  });

  // ─── Test 6: 240V circuit, 5000W oven ───
  it('solves I and R from V=240 and P=5000 (electric oven)', () => {
    const result = calculateOhmsLaw({ voltage: 240, power: 5000 });
    expect(result.current).toBeCloseTo(20.8333, 3);
    expect(result.resistance).toBeCloseTo(11.52, 2);
  });

  // ═══════════════════════════════════════════════════════
  // Combination 4: Current + Resistance → Voltage, Power
  // ═══════════════════════════════════════════════════════

  // ─── Test 7: 3A through 4Ω ───
  it('solves V and P from I=3 and R=4', () => {
    const result = calculateOhmsLaw({ current: 3, resistance: 4 });
    expect(result.voltage).toBeCloseTo(12, 4);
    expect(result.power).toBeCloseTo(36, 4);
    expect(result.solvedFrom).toBe('Current (I) and Resistance (R)');
  });

  // ─── Test 8: 0.02A (20mA) through 250Ω (LED circuit) ───
  it('solves V and P from I=0.02 and R=250 (LED)', () => {
    const result = calculateOhmsLaw({ current: 0.02, resistance: 250 });
    expect(result.voltage).toBeCloseTo(5, 4);
    expect(result.power).toBeCloseTo(0.1, 4);
  });

  // ═══════════════════════════════════════════════════════
  // Combination 5: Current + Power → Voltage, Resistance
  // ═══════════════════════════════════════════════════════

  // ─── Test 9: 10A drawing 1200W ───
  it('solves V and R from I=10 and P=1200', () => {
    const result = calculateOhmsLaw({ current: 10, power: 1200 });
    expect(result.voltage).toBeCloseTo(120, 4);
    expect(result.resistance).toBeCloseTo(12, 4);
    expect(result.solvedFrom).toBe('Current (I) and Power (P)');
  });

  // ─── Test 10: 0.5A drawing 60W ───
  it('solves V and R from I=0.5 and P=60', () => {
    const result = calculateOhmsLaw({ current: 0.5, power: 60 });
    expect(result.voltage).toBeCloseTo(120, 4);
    expect(result.resistance).toBeCloseTo(240, 4);
  });

  // ═══════════════════════════════════════════════════════
  // Combination 6: Resistance + Power → Voltage, Current
  // ═══════════════════════════════════════════════════════

  // ─── Test 11: 8Ω speaker at 50W ───
  it('solves V and I from R=8 and P=50 (speaker)', () => {
    const result = calculateOhmsLaw({ resistance: 8, power: 50 });
    expect(result.voltage).toBeCloseTo(20, 4);
    expect(result.current).toBeCloseTo(2.5, 4);
    expect(result.solvedFrom).toBe('Resistance (R) and Power (P)');
  });

  // ─── Test 12: 100Ω resistor at 0.25W ───
  it('solves V and I from R=100 and P=0.25', () => {
    const result = calculateOhmsLaw({ resistance: 100, power: 0.25 });
    expect(result.voltage).toBeCloseTo(5, 4);
    expect(result.current).toBeCloseTo(0.05, 4);
  });

  // ═══════════════════════════════════════════════════════
  // Edge Cases
  // ═══════════════════════════════════════════════════════

  // ─── Test 13: Very small values (microelectronics) ───
  it('handles very small values (3.3V, 0.001A)', () => {
    const result = calculateOhmsLaw({ voltage: 3.3, current: 0.001 });
    expect(result.resistance).toBeCloseTo(3300, 4);
    expect(result.power).toBeCloseTo(0.0033, 4);
  });

  // ─── Test 14: Very large values (high-voltage transmission) ───
  it('handles very large values (500000V, 1000A)', () => {
    const result = calculateOhmsLaw({ voltage: 500000, current: 1000 });
    expect(result.resistance).toBeCloseTo(500, 4);
    expect(result.power).toBeCloseTo(500000000, 0);
  });

  // ─── Test 15: Textbook verification — 1V, 1A, 1Ω, 1W ───
  it('verifies unit values: 1V across 1Ω = 1A and 1W', () => {
    const result = calculateOhmsLaw({ voltage: 1, resistance: 1 });
    expect(result.current).toBeCloseTo(1, 4);
    expect(result.power).toBeCloseTo(1, 4);
  });

  // ─── Test 16: Cross-verification — all 6 combos yield same result ───
  it('produces consistent results across all input combinations for 12V/2A/6Ω/24W', () => {
    const fromVI = calculateOhmsLaw({ voltage: 12, current: 2 });
    const fromVR = calculateOhmsLaw({ voltage: 12, resistance: 6 });
    const fromVP = calculateOhmsLaw({ voltage: 12, power: 24 });
    const fromIR = calculateOhmsLaw({ current: 2, resistance: 6 });
    const fromIP = calculateOhmsLaw({ current: 2, power: 24 });
    const fromRP = calculateOhmsLaw({ resistance: 6, power: 24 });

    const expected = { voltage: 12, current: 2, resistance: 6, power: 24 };

    for (const result of [fromVI, fromVR, fromVP, fromIR, fromIP, fromRP]) {
      expect(result.voltage).toBeCloseTo(expected.voltage, 4);
      expect(result.current).toBeCloseTo(expected.current, 4);
      expect(result.resistance).toBeCloseTo(expected.resistance, 4);
      expect(result.power).toBeCloseTo(expected.power, 4);
    }
  });

  // ═══════════════════════════════════════════════════════
  // Error Cases
  // ═══════════════════════════════════════════════════════

  // ─── Test 17: Fewer than 2 inputs throws error ───
  it('throws error when fewer than 2 values are provided', () => {
    expect(() => calculateOhmsLaw({ voltage: 12 })).toThrow('At least 2 values are required');
  });

  // ─── Test 18: No inputs throws error ───
  it('throws error when no values are provided', () => {
    expect(() => calculateOhmsLaw({})).toThrow('At least 2 values are required');
  });

  // ─── Test 19: Zero values are treated as not provided ───
  it('treats zero values as not provided', () => {
    expect(() => calculateOhmsLaw({ voltage: 0, current: 0 })).toThrow('At least 2 values are required');
  });

  // ─── Test 20: More than 2 inputs uses first valid pair ───
  it('uses first valid pair when more than 2 inputs are provided', () => {
    const result = calculateOhmsLaw({ voltage: 12, current: 2, resistance: 6, power: 24 });
    expect(result.voltage).toBeCloseTo(12, 4);
    expect(result.current).toBeCloseTo(2, 4);
    expect(result.resistance).toBeCloseTo(6, 4);
    expect(result.power).toBeCloseTo(24, 4);
    expect(result.solvedFrom).toBe('Voltage (V) and Current (I)');
  });

  // ─── Test 21: Output metadata structure ───
  it('returns allValues array with correct labels and units', () => {
    const result = calculateOhmsLaw({ voltage: 12, current: 2 });
    const allValues = result.allValues as { label: string; value: number; unit: string }[];
    expect(allValues).toHaveLength(4);
    expect(allValues[0]).toEqual(expect.objectContaining({ label: 'Voltage', unit: 'V' }));
    expect(allValues[1]).toEqual(expect.objectContaining({ label: 'Current', unit: 'A' }));
    expect(allValues[2]).toEqual(expect.objectContaining({ label: 'Resistance', unit: 'Ω' }));
    expect(allValues[3]).toEqual(expect.objectContaining({ label: 'Power', unit: 'W' }));
  });

  // ─── Test 22: Formula relationships table is populated ───
  it('returns formulaRelationships array with 4 entries', () => {
    const result = calculateOhmsLaw({ voltage: 12, current: 2 });
    const relationships = result.formulaRelationships as { formula: string; result: string }[];
    expect(relationships).toHaveLength(4);
    expect(relationships[0].formula).toBe('V = I × R');
    expect(relationships[1].formula).toBe('P = I × V');
    expect(relationships[2].formula).toBe('P = I² × R');
    expect(relationships[3].formula).toBe('P = V² / R');
  });

  // ─── Test 23: Handles string numeric inputs ───
  it('handles string inputs by converting to numbers', () => {
    const result = calculateOhmsLaw({ voltage: '12', current: '2' });
    expect(result.voltage).toBeCloseTo(12, 4);
    expect(result.current).toBeCloseTo(2, 4);
    expect(result.resistance).toBeCloseTo(6, 4);
    expect(result.power).toBeCloseTo(24, 4);
  });

  // ─── Test 24: Empty string inputs treated as not provided ───
  it('treats empty string inputs as not provided', () => {
    expect(() => calculateOhmsLaw({ voltage: '', current: '' })).toThrow('At least 2 values are required');
  });

  // ─── Test 25: Fractional/decimal precision ───
  it('handles fractional values with precision (3.3V, 0.02A)', () => {
    const result = calculateOhmsLaw({ voltage: 3.3, current: 0.02 });
    expect(result.resistance).toBeCloseTo(165, 2);
    expect(result.power).toBeCloseTo(0.066, 4);
  });
});
