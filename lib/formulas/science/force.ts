/**
 * Force Calculator — Newton's Second Law
 *
 * Core formulas (force–mass–acceleration triad):
 *   F = m × a    (force = mass × acceleration)
 *   m = F / a    (mass = force / acceleration)
 *   a = F / m    (acceleration = force / mass)
 *
 * Given any 2 of the 3 quantities (Force, Mass, Acceleration),
 * this function solves for the unknown third value.
 *
 * Source: Isaac Newton, Philosophiae Naturalis Principia Mathematica (1687).
 */

export interface ForceInput {
  force?: number;
  mass?: number;
  acceleration?: number;
}

export interface ForceOutput {
  force: number;
  mass: number;
  acceleration: number;
  solvedFrom: string;
  allValues: { label: string; value: number; unit: string }[];
  conversions: {
    force_kN: number;
    force_dyn: number;
    force_lbf: number;
    force_kgf: number;
    force_poundal: number;
    mass_g: number;
    mass_lb: number;
    acceleration_g: number;
    acceleration_fts2: number;
  };
}

/**
 * Determines which two of the three quantities are provided
 * (defined, numeric, and > 0), solves for the third using
 * Newton's second law, and returns all three values along with
 * unit conversions and metadata.
 */
export function calculateForce(inputs: Record<string, unknown>): Record<string, unknown> {
  const force = inputs.force !== undefined && inputs.force !== null && inputs.force !== ''
    ? Number(inputs.force)
    : undefined;
  const mass = inputs.mass !== undefined && inputs.mass !== null && inputs.mass !== ''
    ? Number(inputs.mass)
    : undefined;
  const acceleration = inputs.acceleration !== undefined && inputs.acceleration !== null && inputs.acceleration !== ''
    ? Number(inputs.acceleration)
    : undefined;

  const hasForce = force !== undefined && isFinite(force) && force > 0;
  const hasMass = mass !== undefined && isFinite(mass) && mass > 0;
  const hasAcceleration = acceleration !== undefined && isFinite(acceleration) && acceleration > 0;

  const providedCount = [hasForce, hasMass, hasAcceleration].filter(Boolean).length;

  if (providedCount < 2) {
    throw new Error('Enter any two of: Force, Mass, Acceleration.');
  }

  let F: number;
  let m: number;
  let a: number;
  let solvedFrom: string;

  if (hasMass && hasAcceleration) {
    m = mass as number;
    a = acceleration as number;
    F = m * a;
    solvedFrom = 'Mass (m) and Acceleration (a)';
  } else if (hasForce && hasAcceleration) {
    F = force as number;
    a = acceleration as number;
    m = F / a;
    solvedFrom = 'Force (F) and Acceleration (a)';
  } else if (hasForce && hasMass) {
    F = force as number;
    m = mass as number;
    a = F / m;
    solvedFrom = 'Force (F) and Mass (m)';
  } else {
    throw new Error('Could not determine a valid pair of inputs. Provide exactly two positive values.');
  }

  F = parseFloat(F.toFixed(10));
  m = parseFloat(m.toFixed(10));
  a = parseFloat(a.toFixed(10));

  const allValues = [
    { label: 'Force', value: F, unit: 'N' },
    { label: 'Mass', value: m, unit: 'kg' },
    { label: 'Acceleration', value: a, unit: 'm/s²' },
  ];

  const conversions = {
    force_kN: parseFloat((F / 1000).toFixed(6)),
    force_dyn: parseFloat((F * 100000).toFixed(6)),
    force_lbf: parseFloat((F * 0.224809).toFixed(6)),
    force_kgf: parseFloat((F / 9.80665).toFixed(6)),
    force_poundal: parseFloat((F * 7.23301).toFixed(6)),
    mass_g: parseFloat((m * 1000).toFixed(6)),
    mass_lb: parseFloat((m * 2.20462).toFixed(6)),
    acceleration_g: parseFloat((a / 9.80665).toFixed(6)),
    acceleration_fts2: parseFloat((a * 3.28084).toFixed(6)),
  };

  return {
    force: F,
    mass: m,
    acceleration: a,
    solvedFrom,
    allValues,
    conversions,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'force': calculateForce,
};
