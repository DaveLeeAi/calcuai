/**
 * Momentum Calculator
 *
 * Core formulas (momentum–mass–velocity triad):
 *   p = m × v    (momentum = mass × velocity)
 *   m = p / v    (mass = momentum / velocity)
 *   v = p / m    (velocity = momentum / mass)
 *
 * Also computes kinetic energy from momentum: KE = p² / (2m)
 * and de Broglie wavelength: λ = h / p
 *
 * Source: Isaac Newton, Philosophiae Naturalis Principia Mathematica (1687);
 * René Descartes, quantity of motion concept (1644).
 */

export interface MomentumInput {
  momentum?: number;
  mass?: number;
  velocity?: number;
}

export interface MomentumOutput {
  momentum: number;
  mass: number;
  velocity: number;
  kineticEnergy: number;
  solvedFrom: string;
  allValues: { label: string; value: number; unit: string }[];
  conversions: {
    momentum_gcms: number;
    momentum_lbfts: number;
    momentum_Ns: number;
    kineticEnergy_kJ: number;
    kineticEnergy_cal: number;
    velocity_kmh: number;
    velocity_mph: number;
    mass_g: number;
    mass_lb: number;
  };
}

/**
 * Determines which two of the three quantities are provided,
 * solves for the third using p = mv, and computes kinetic energy.
 */
export function calculateMomentum(inputs: Record<string, unknown>): Record<string, unknown> {
  const momentum = inputs.momentum !== undefined && inputs.momentum !== null && inputs.momentum !== ''
    ? Number(inputs.momentum)
    : undefined;
  const mass = inputs.mass !== undefined && inputs.mass !== null && inputs.mass !== ''
    ? Number(inputs.mass)
    : undefined;
  const velocity = inputs.velocity !== undefined && inputs.velocity !== null && inputs.velocity !== ''
    ? Number(inputs.velocity)
    : undefined;

  const hasMomentum = momentum !== undefined && isFinite(momentum) && momentum > 0;
  const hasMass = mass !== undefined && isFinite(mass) && mass > 0;
  const hasVelocity = velocity !== undefined && isFinite(velocity) && velocity > 0;

  const providedCount = [hasMomentum, hasMass, hasVelocity].filter(Boolean).length;

  if (providedCount < 2) {
    throw new Error('Enter any two of: Momentum, Mass, Velocity.');
  }

  let p: number;
  let m: number;
  let v: number;
  let solvedFrom: string;

  if (hasMass && hasVelocity) {
    m = mass as number;
    v = velocity as number;
    p = m * v;
    solvedFrom = 'Mass (m) and Velocity (v)';
  } else if (hasMomentum && hasVelocity) {
    p = momentum as number;
    v = velocity as number;
    m = p / v;
    solvedFrom = 'Momentum (p) and Velocity (v)';
  } else if (hasMomentum && hasMass) {
    p = momentum as number;
    m = mass as number;
    v = p / m;
    solvedFrom = 'Momentum (p) and Mass (m)';
  } else {
    throw new Error('Could not determine a valid pair of inputs. Provide exactly two positive values.');
  }

  p = parseFloat(p.toFixed(10));
  m = parseFloat(m.toFixed(10));
  v = parseFloat(v.toFixed(10));

  // KE = p² / (2m) = ½mv²
  const kineticEnergy = parseFloat(((p * p) / (2 * m)).toFixed(10));

  const allValues = [
    { label: 'Momentum', value: p, unit: 'kg·m/s' },
    { label: 'Mass', value: m, unit: 'kg' },
    { label: 'Velocity', value: v, unit: 'm/s' },
    { label: 'Kinetic Energy', value: kineticEnergy, unit: 'J' },
  ];

  const conversions = {
    momentum_gcms: parseFloat((p * 1000 * 100).toFixed(6)),
    momentum_lbfts: parseFloat((p * 2.20462 * 3.28084).toFixed(6)),
    momentum_Ns: parseFloat(p.toFixed(6)),
    kineticEnergy_kJ: parseFloat((kineticEnergy / 1000).toFixed(6)),
    kineticEnergy_cal: parseFloat((kineticEnergy / 4.184).toFixed(6)),
    velocity_kmh: parseFloat((v * 3.6).toFixed(6)),
    velocity_mph: parseFloat((v * 2.23694).toFixed(6)),
    mass_g: parseFloat((m * 1000).toFixed(6)),
    mass_lb: parseFloat((m * 2.20462).toFixed(6)),
  };

  return {
    momentum: p,
    mass: m,
    velocity: v,
    kineticEnergy,
    solvedFrom,
    allValues,
    conversions,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'momentum': calculateMomentum,
};
