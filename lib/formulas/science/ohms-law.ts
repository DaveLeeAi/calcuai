/**
 * Ohm's Law Calculator
 *
 * Core formulas:
 *   V = I × R        (Ohm's Law)
 *   P = I × V        (Joule's Law / Power Law)
 *   P = I² × R       (derived)
 *   P = V² / R       (derived)
 *
 * Given any 2 of the 4 electrical quantities (Voltage, Current,
 * Resistance, Power), this function solves for the remaining 2.
 *
 * Source: Georg Simon Ohm, "Die galvanische Kette, mathematisch
 * bearbeitet" (1827); James Prescott Joule (1841).
 */

export interface OhmsLawInput {
  voltage?: number;
  current?: number;
  resistance?: number;
  power?: number;
}

export interface OhmsLawOutput {
  voltage: number;
  current: number;
  resistance: number;
  power: number;
  solvedFrom: string;
  allValues: { label: string; value: number; unit: string }[];
  formulaRelationships: { formula: string; result: string }[];
}

/**
 * Determines which two of the four electrical quantities are provided
 * (defined, numeric, and > 0), solves for the other two using the
 * appropriate pair of Ohm's Law / Joule's Law formulas, and returns
 * all four values along with metadata.
 *
 * The 6 valid input combinations:
 *   V + I → R = V/I,       P = V×I
 *   V + R → I = V/R,       P = V²/R
 *   V + P → I = P/V,       R = V²/P
 *   I + R → V = I×R,       P = I²×R
 *   I + P → V = P/I,       R = P/I²
 *   R + P → V = √(R×P),    I = √(P/R)
 */
export function calculateOhmsLaw(inputs: Record<string, unknown>): Record<string, unknown> {
  const voltage = inputs.voltage !== undefined && inputs.voltage !== null && inputs.voltage !== ''
    ? Number(inputs.voltage)
    : undefined;
  const current = inputs.current !== undefined && inputs.current !== null && inputs.current !== ''
    ? Number(inputs.current)
    : undefined;
  const resistance = inputs.resistance !== undefined && inputs.resistance !== null && inputs.resistance !== ''
    ? Number(inputs.resistance)
    : undefined;
  const power = inputs.power !== undefined && inputs.power !== null && inputs.power !== ''
    ? Number(inputs.power)
    : undefined;

  // Identify which values are provided (finite and > 0)
  const hasVoltage = voltage !== undefined && isFinite(voltage) && voltage > 0;
  const hasCurrent = current !== undefined && isFinite(current) && current > 0;
  const hasResistance = resistance !== undefined && isFinite(resistance) && resistance > 0;
  const hasPower = power !== undefined && isFinite(power) && power > 0;

  const providedCount = [hasVoltage, hasCurrent, hasResistance, hasPower].filter(Boolean).length;

  if (providedCount < 2) {
    throw new Error(
      'At least 2 values are required. Enter any two of: Voltage (V), Current (A), Resistance (Ω), Power (W).'
    );
  }

  let V: number;
  let I: number;
  let R: number;
  let P: number;
  let solvedFrom: string;

  // Solve based on which two inputs are provided.
  // When more than 2 are provided, use the first valid pair in priority order.
  if (hasVoltage && hasCurrent) {
    V = voltage as number;
    I = current as number;
    R = V / I;
    P = V * I;
    solvedFrom = 'Voltage (V) and Current (I)';
  } else if (hasVoltage && hasResistance) {
    V = voltage as number;
    R = resistance as number;
    I = V / R;
    P = (V * V) / R;
    solvedFrom = 'Voltage (V) and Resistance (R)';
  } else if (hasVoltage && hasPower) {
    V = voltage as number;
    P = power as number;
    I = P / V;
    R = (V * V) / P;
    solvedFrom = 'Voltage (V) and Power (P)';
  } else if (hasCurrent && hasResistance) {
    I = current as number;
    R = resistance as number;
    V = I * R;
    P = I * I * R;
    solvedFrom = 'Current (I) and Resistance (R)';
  } else if (hasCurrent && hasPower) {
    I = current as number;
    P = power as number;
    V = P / I;
    R = P / (I * I);
    solvedFrom = 'Current (I) and Power (P)';
  } else if (hasResistance && hasPower) {
    R = resistance as number;
    P = power as number;
    V = Math.sqrt(R * P);
    I = Math.sqrt(P / R);
    solvedFrom = 'Resistance (R) and Power (P)';
  } else {
    throw new Error(
      'Could not determine a valid pair of inputs. Provide exactly two positive values.'
    );
  }

  // Round to avoid floating-point display artifacts
  V = parseFloat(V.toFixed(10));
  I = parseFloat(I.toFixed(10));
  R = parseFloat(R.toFixed(10));
  P = parseFloat(P.toFixed(10));

  const allValues = [
    { label: 'Voltage', value: V, unit: 'V' },
    { label: 'Current', value: I, unit: 'A' },
    { label: 'Resistance', value: R, unit: 'Ω' },
    { label: 'Power', value: P, unit: 'W' },
  ];

  const formulaRelationships = [
    { formula: 'V = I × R', result: `${I.toPrecision(6)} A × ${R.toPrecision(6)} Ω = ${V.toPrecision(6)} V` },
    { formula: 'P = I × V', result: `${I.toPrecision(6)} A × ${V.toPrecision(6)} V = ${P.toPrecision(6)} W` },
    { formula: 'P = I² × R', result: `${I.toPrecision(6)}² A × ${R.toPrecision(6)} Ω = ${P.toPrecision(6)} W` },
    { formula: 'P = V² / R', result: `${V.toPrecision(6)}² V / ${R.toPrecision(6)} Ω = ${P.toPrecision(6)} W` },
  ];

  return {
    voltage: V,
    current: I,
    resistance: R,
    power: P,
    solvedFrom,
    allValues,
    formulaRelationships,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'ohms-law': calculateOhmsLaw,
};
