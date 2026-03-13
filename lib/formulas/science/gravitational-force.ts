/**
 * Gravitational Force Calculator — Newton's Law of Universal Gravitation
 *
 * Core formula:
 *   F = G * m1 * m2 / r^2
 *
 * Where:
 *   F  = gravitational force (N)
 *   G  = gravitational constant = 6.67430e-11 N*m^2/kg^2
 *   m1 = first mass (kg)
 *   m2 = second mass (kg)
 *   r  = center-to-center distance (m)
 *
 * 4-way solver: given any three of F, m1, m2, r, solves for the fourth.
 *
 * Source: Isaac Newton, Principia Mathematica (1687); CODATA 2018 value of G.
 */

const G = 6.67430e-11; // N*m^2/kg^2

export interface GravitationalForceInput {
  mass1?: number;
  mass2?: number;
  distance?: number;
  force?: number;
}

export interface GravitationalForceOutput {
  force: number;
  mass1: number;
  mass2: number;
  distance: number;
  solvedFrom: string;
  allValues: { label: string; value: number; unit: string }[];
  conversions: {
    force_kN: number;
    force_lbf: number;
    force_dyn: number;
    force_kgf: number;
    distance_km: number;
    distance_mi: number;
    distance_AU: number;
  };
}

export function calculateGravitationalForce(inputs: Record<string, unknown>): Record<string, unknown> {
  const mass1 = inputs.mass1 !== undefined && inputs.mass1 !== null && inputs.mass1 !== ''
    ? Number(inputs.mass1)
    : undefined;
  const mass2 = inputs.mass2 !== undefined && inputs.mass2 !== null && inputs.mass2 !== ''
    ? Number(inputs.mass2)
    : undefined;
  const distance = inputs.distance !== undefined && inputs.distance !== null && inputs.distance !== ''
    ? Number(inputs.distance)
    : undefined;
  const force = inputs.force !== undefined && inputs.force !== null && inputs.force !== ''
    ? Number(inputs.force)
    : undefined;

  const hasMass1 = mass1 !== undefined && isFinite(mass1) && mass1 > 0;
  const hasMass2 = mass2 !== undefined && isFinite(mass2) && mass2 > 0;
  const hasDistance = distance !== undefined && isFinite(distance) && distance > 0;
  const hasForce = force !== undefined && isFinite(force) && force > 0;

  const providedCount = [hasMass1, hasMass2, hasDistance, hasForce].filter(Boolean).length;

  if (providedCount < 3) {
    throw new Error('Enter any three of: Mass 1, Mass 2, Distance, Force.');
  }

  let F: number;
  let m1: number;
  let m2: number;
  let r: number;
  let solvedFrom: string;

  if (hasMass1 && hasMass2 && hasDistance) {
    // Solve for Force
    m1 = mass1 as number;
    m2 = mass2 as number;
    r = distance as number;
    F = G * m1 * m2 / (r * r);
    solvedFrom = 'Mass 1, Mass 2, and Distance';
  } else if (hasForce && hasMass2 && hasDistance) {
    // Solve for Mass 1
    F = force as number;
    m2 = mass2 as number;
    r = distance as number;
    m1 = F * r * r / (G * m2);
    solvedFrom = 'Force, Mass 2, and Distance';
  } else if (hasForce && hasMass1 && hasDistance) {
    // Solve for Mass 2
    F = force as number;
    m1 = mass1 as number;
    r = distance as number;
    m2 = F * r * r / (G * m1);
    solvedFrom = 'Force, Mass 1, and Distance';
  } else if (hasForce && hasMass1 && hasMass2) {
    // Solve for Distance
    F = force as number;
    m1 = mass1 as number;
    m2 = mass2 as number;
    r = Math.sqrt(G * m1 * m2 / F);
    solvedFrom = 'Force, Mass 1, and Mass 2';
  } else {
    throw new Error('Could not determine a valid set of three inputs. Provide exactly three positive values.');
  }

  // Use toPrecision for astronomical-scale values instead of toFixed
  // toFixed(10) rounds 6.6743e-11 to 0, so we preserve 10 significant digits
  F = Number(F.toPrecision(10));
  m1 = Number(m1.toPrecision(10));
  m2 = Number(m2.toPrecision(10));
  r = Number(r.toPrecision(10));

  const allValues = [
    { label: 'Gravitational Force', value: F, unit: 'N' },
    { label: 'Mass 1', value: m1, unit: 'kg' },
    { label: 'Mass 2', value: m2, unit: 'kg' },
    { label: 'Distance', value: r, unit: 'm' },
  ];

  const conversions = {
    force_kN: Number((F / 1000).toPrecision(10)),
    force_lbf: Number((F * 0.224809).toPrecision(10)),
    force_dyn: Number((F * 100000).toPrecision(10)),
    force_kgf: Number((F / 9.80665).toPrecision(10)),
    distance_km: parseFloat((r / 1000).toFixed(6)),
    distance_mi: parseFloat((r / 1609.344).toFixed(6)),
    distance_AU: Number((r / 1.496e11).toPrecision(10)),
  };

  return {
    force: F,
    mass1: m1,
    mass2: m2,
    distance: r,
    solvedFrom,
    allValues,
    conversions,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'gravitational-force': calculateGravitationalForce,
};
