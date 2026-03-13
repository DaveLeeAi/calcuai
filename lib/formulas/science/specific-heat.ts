/**
 * Specific Heat Calculator — Q = mcΔT
 *
 * 4-way solver: given a solveFor mode, computes the unknown variable
 * from the other three known values.
 *
 *   Q = m × c × ΔT    (heat energy)
 *   m = Q / (c × ΔT)  (mass)
 *   c = Q / (m × ΔT)  (specific heat capacity)
 *   ΔT = Q / (m × c)  (temperature change)
 *
 * Where:
 *   Q  = heat energy (joules, J)
 *   m  = mass (kilograms, kg)
 *   c  = specific heat capacity (J/(kg·°C))
 *   ΔT = temperature change (°C)
 *
 * Note: ΔT can be negative (cooling). Mass and specific heat must be positive.
 *
 * Source: Serway & Jewett, "Physics for Scientists and Engineers" (10th ed.);
 *         NIST Standard Reference Data.
 */

export interface SpecificHeatInput {
  solveFor: 'heat' | 'mass' | 'specificHeat' | 'temperatureChange';
  mass?: number;
  specificHeat?: number;
  temperatureChange?: number;
  heatEnergy?: number;
}

export interface SpecificHeatOutput {
  result: number;
  resultLabel: string;
  resultUnit: string;
  heatEnergy: number;
  mass: number;
  specificHeat: number;
  temperatureChange: number;
  allValues: { label: string; value: number; unit: string }[];
}

/**
 * Calculates the unknown variable in Q = mcΔT based on the solveFor mode.
 * Returns the solved value, a descriptive label, and a summary of all four variables.
 */
export function calculateSpecificHeat(inputs: Record<string, unknown>): Record<string, unknown> {
  const solveFor = String(inputs.solveFor || 'heat');

  let Q: number;
  let m: number;
  let c: number;
  let dT: number;
  let result: number;
  let resultLabel: string;
  let resultUnit: string;

  if (solveFor === 'heat') {
    // Solve for Q = m × c × ΔT
    m = Math.max(0.001, Number(inputs.mass) || 0);
    c = Math.max(0.001, Number(inputs.specificHeat) || 0);
    dT = Number(inputs.temperatureChange) || 0;

    if (dT === 0) {
      Q = 0;
    } else {
      Q = m * c * dT;
    }

    result = Q;
    resultLabel = 'Heat Energy (Q)';
    resultUnit = 'J';
  } else if (solveFor === 'mass') {
    // Solve for m = Q / (c × ΔT)
    Q = Number(inputs.heatEnergy) || 0;
    c = Math.max(0.001, Number(inputs.specificHeat) || 0);
    dT = Number(inputs.temperatureChange) || 0;

    if (dT === 0) {
      throw new Error('Temperature change cannot be zero when solving for mass.');
    }
    if (c * dT === 0) {
      throw new Error('Specific heat and temperature change must both be non-zero.');
    }

    m = Q / (c * dT);
    if (m < 0) {
      throw new Error('Calculated mass is negative. Check signs of heat energy and temperature change.');
    }

    result = m;
    resultLabel = 'Mass (m)';
    resultUnit = 'kg';
  } else if (solveFor === 'specificHeat') {
    // Solve for c = Q / (m × ΔT)
    Q = Number(inputs.heatEnergy) || 0;
    m = Math.max(0.001, Number(inputs.mass) || 0);
    dT = Number(inputs.temperatureChange) || 0;

    if (dT === 0) {
      throw new Error('Temperature change cannot be zero when solving for specific heat.');
    }
    if (m * dT === 0) {
      throw new Error('Mass and temperature change must both be non-zero.');
    }

    c = Q / (m * dT);
    if (c < 0) {
      throw new Error('Calculated specific heat is negative. Check signs of heat energy and temperature change.');
    }

    result = c;
    resultLabel = 'Specific Heat (c)';
    resultUnit = 'J/(kg·°C)';
  } else if (solveFor === 'temperatureChange') {
    // Solve for ΔT = Q / (m × c)
    Q = Number(inputs.heatEnergy) || 0;
    m = Math.max(0.001, Number(inputs.mass) || 0);
    c = Math.max(0.001, Number(inputs.specificHeat) || 0);

    if (m * c === 0) {
      throw new Error('Mass and specific heat must both be non-zero.');
    }

    dT = Q / (m * c);

    result = dT;
    resultLabel = 'Temperature Change (ΔT)';
    resultUnit = '°C';
  } else {
    throw new Error('Invalid solveFor value. Use "heat", "mass", "specificHeat", or "temperatureChange".');
  }

  // Round to appropriate precision
  Q = parseFloat(Q.toFixed(4));
  m = parseFloat(m.toFixed(6));
  c = parseFloat(c.toFixed(4));
  dT = parseFloat(dT.toFixed(4));
  result = parseFloat(result.toFixed(4));

  const allValues = [
    { label: 'Heat Energy', value: Q, unit: 'J' },
    { label: 'Mass', value: m, unit: 'kg' },
    { label: 'Specific Heat', value: c, unit: 'J/(kg·°C)' },
    { label: 'Temperature Change', value: dT, unit: '°C' },
  ];

  return {
    result,
    resultLabel,
    resultUnit,
    heatEnergy: Q,
    mass: m,
    specificHeat: c,
    temperatureChange: dT,
    allValues,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'specific-heat': calculateSpecificHeat,
};
