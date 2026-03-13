/**
 * Acceleration Calculator
 *
 * Two modes:
 *   Kinematic:  a = (v_f - v_i) / t
 *   Force:      a = F / m
 *
 * Kinematic mode calculates acceleration from change in velocity
 * over time. Force mode uses Newton's second law.
 *
 * Source: Isaac Newton, Philosophiae Naturalis Principia Mathematica (1687);
 * Galileo Galilei, Discorsi (1638) for kinematic equations.
 */

export interface AccelerationInput {
  mode?: string;
  initialVelocity?: number;
  finalVelocity?: number;
  time?: number;
  force?: number;
  mass?: number;
}

export interface AccelerationOutput {
  acceleration: number;
  mode: string;
  allValues: { label: string; value: number; unit: string }[];
  conversions: {
    acceleration_g: number;
    acceleration_fts2: number;
    acceleration_cms2: number;
    acceleration_kmhs: number;
    acceleration_gal: number;
  };
  breakdown: { step: string; expression: string }[];
}

export function calculateAcceleration(inputs: Record<string, unknown>): Record<string, unknown> {
  const mode = inputs.mode !== undefined && inputs.mode !== null && inputs.mode !== ''
    ? String(inputs.mode).toLowerCase()
    : 'kinematic';
  const initialVelocity = inputs.initialVelocity !== undefined && inputs.initialVelocity !== null && inputs.initialVelocity !== ''
    ? Number(inputs.initialVelocity)
    : undefined;
  const finalVelocity = inputs.finalVelocity !== undefined && inputs.finalVelocity !== null && inputs.finalVelocity !== ''
    ? Number(inputs.finalVelocity)
    : undefined;
  const time = inputs.time !== undefined && inputs.time !== null && inputs.time !== ''
    ? Number(inputs.time)
    : undefined;
  const force = inputs.force !== undefined && inputs.force !== null && inputs.force !== ''
    ? Number(inputs.force)
    : undefined;
  const mass = inputs.mass !== undefined && inputs.mass !== null && inputs.mass !== ''
    ? Number(inputs.mass)
    : undefined;

  if (mode !== 'kinematic' && mode !== 'force') {
    throw new Error('Mode must be either "kinematic" or "force".');
  }

  let acceleration: number;
  let allValues: { label: string; value: number; unit: string }[];
  let breakdown: { step: string; expression: string }[];

  if (mode === 'kinematic') {
    if (initialVelocity === undefined || !isFinite(initialVelocity)) {
      throw new Error('Initial velocity is required for kinematic mode.');
    }
    if (finalVelocity === undefined || !isFinite(finalVelocity)) {
      throw new Error('Final velocity is required for kinematic mode.');
    }
    if (time === undefined || !isFinite(time) || time <= 0) {
      throw new Error('Time must be a positive number for kinematic mode.');
    }

    acceleration = (finalVelocity - initialVelocity) / time;
    const deltaV = finalVelocity - initialVelocity;

    allValues = [
      { label: 'Acceleration', value: parseFloat(acceleration.toFixed(10)), unit: 'm/s²' },
      { label: 'Initial Velocity', value: initialVelocity, unit: 'm/s' },
      { label: 'Final Velocity', value: finalVelocity, unit: 'm/s' },
      { label: 'Velocity Change', value: parseFloat(deltaV.toFixed(10)), unit: 'm/s' },
      { label: 'Time', value: time, unit: 's' },
    ];

    breakdown = [
      { step: 'Formula', expression: 'a = (v_f - v_i) / t' },
      { step: 'Substitute', expression: `a = (${finalVelocity} - ${initialVelocity}) / ${time}` },
      { step: 'Velocity change', expression: `a = ${parseFloat(deltaV.toFixed(10))} / ${time}` },
      { step: 'Result', expression: `a = ${parseFloat(acceleration.toFixed(10))} m/s²` },
    ];
  } else {
    if (force === undefined || !isFinite(force)) {
      throw new Error('Force is required for force mode.');
    }
    if (mass === undefined || !isFinite(mass) || mass <= 0) {
      throw new Error('Mass must be a positive number for force mode.');
    }

    acceleration = force / mass;

    allValues = [
      { label: 'Acceleration', value: parseFloat(acceleration.toFixed(10)), unit: 'm/s²' },
      { label: 'Force', value: force, unit: 'N' },
      { label: 'Mass', value: mass, unit: 'kg' },
    ];

    breakdown = [
      { step: 'Formula', expression: 'a = F / m' },
      { step: 'Substitute', expression: `a = ${force} N / ${mass} kg` },
      { step: 'Result', expression: `a = ${parseFloat(acceleration.toFixed(10))} m/s²` },
    ];
  }

  acceleration = parseFloat(acceleration.toFixed(10));

  const conversions = {
    acceleration_g: parseFloat((acceleration / 9.80665).toFixed(6)),
    acceleration_fts2: parseFloat((acceleration * 3.28084).toFixed(6)),
    acceleration_cms2: parseFloat((acceleration * 100).toFixed(6)),
    acceleration_kmhs: parseFloat((acceleration * 3.6).toFixed(6)),
    acceleration_gal: parseFloat((acceleration * 100).toFixed(6)),
  };

  return {
    acceleration,
    mode,
    allValues,
    conversions,
    breakdown,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'acceleration': calculateAcceleration,
};
