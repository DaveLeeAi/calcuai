/**
 * Coulomb's Law Calculator — Electrostatic Force
 *
 * Core formula:
 *   F = k * |q1| * |q2| / r^2
 *
 * Where:
 *   F  = electrostatic force magnitude (N)
 *   k  = Coulomb's constant = 8.9875517873681764e9 N*m^2/C^2
 *   q1 = first charge (C) — can be negative
 *   q2 = second charge (C) — can be negative
 *   r  = distance between charge centers (m)
 *
 * Force sign convention:
 *   Same-sign charges → repulsive (positive force)
 *   Opposite-sign charges → attractive (negative force)
 *
 * 4-way solver: given any three of F, q1, q2, r, solves for the fourth.
 *
 * Source: Charles-Augustin de Coulomb, Memoires de l'Academie Royale des Sciences (1785).
 */

const K = 8.9875517873681764e9; // N*m^2/C^2

export interface CoulombsLawInput {
  charge1?: number;
  charge2?: number;
  distance?: number;
  force?: number;
}

export interface CoulombsLawOutput {
  forceMagnitude: number;
  forceDirection: string;
  charge1: number;
  charge2: number;
  distance: number;
  solvedFrom: string;
  allValues: { label: string; value: number | string; unit: string }[];
  conversions: {
    force_kN: number;
    force_lbf: number;
    force_dyn: number;
    charge1_uC: number;
    charge1_nC: number;
    charge2_uC: number;
    charge2_nC: number;
    distance_cm: number;
    distance_mm: number;
  };
}

export function calculateCoulombsLaw(inputs: Record<string, unknown>): Record<string, unknown> {
  const charge1 = inputs.charge1 !== undefined && inputs.charge1 !== null && inputs.charge1 !== ''
    ? Number(inputs.charge1)
    : undefined;
  const charge2 = inputs.charge2 !== undefined && inputs.charge2 !== null && inputs.charge2 !== ''
    ? Number(inputs.charge2)
    : undefined;
  const distance = inputs.distance !== undefined && inputs.distance !== null && inputs.distance !== ''
    ? Number(inputs.distance)
    : undefined;
  const force = inputs.force !== undefined && inputs.force !== null && inputs.force !== ''
    ? Number(inputs.force)
    : undefined;

  // Charges can be negative, but must be non-zero
  const hasCharge1 = charge1 !== undefined && isFinite(charge1) && charge1 !== 0;
  const hasCharge2 = charge2 !== undefined && isFinite(charge2) && charge2 !== 0;
  const hasDistance = distance !== undefined && isFinite(distance) && distance > 0;
  const hasForce = force !== undefined && isFinite(force) && force > 0;

  const providedCount = [hasCharge1, hasCharge2, hasDistance, hasForce].filter(Boolean).length;

  if (providedCount < 3) {
    throw new Error('Enter any three of: Charge 1, Charge 2, Distance, Force.');
  }

  let F: number;
  let q1: number;
  let q2: number;
  let r: number;
  let solvedFrom: string;

  if (hasCharge1 && hasCharge2 && hasDistance) {
    // Solve for Force
    q1 = charge1 as number;
    q2 = charge2 as number;
    r = distance as number;
    F = K * Math.abs(q1) * Math.abs(q2) / (r * r);
    solvedFrom = 'Charge 1, Charge 2, and Distance';
  } else if (hasForce && hasCharge2 && hasDistance) {
    // Solve for |q1|, preserve sign from charge2 context
    F = force as number;
    q2 = charge2 as number;
    r = distance as number;
    const absQ1 = F * r * r / (K * Math.abs(q2));
    q1 = absQ1; // Return positive magnitude when solving
    solvedFrom = 'Force, Charge 2, and Distance';
  } else if (hasForce && hasCharge1 && hasDistance) {
    // Solve for |q2|
    F = force as number;
    q1 = charge1 as number;
    r = distance as number;
    const absQ2 = F * r * r / (K * Math.abs(q1));
    q2 = absQ2; // Return positive magnitude when solving
    solvedFrom = 'Force, Charge 1, and Distance';
  } else if (hasForce && hasCharge1 && hasCharge2) {
    // Solve for Distance
    F = force as number;
    q1 = charge1 as number;
    q2 = charge2 as number;
    r = Math.sqrt(K * Math.abs(q1) * Math.abs(q2) / F);
    solvedFrom = 'Force, Charge 1, and Charge 2';
  } else {
    throw new Error('Could not determine a valid set of three inputs. Provide exactly three non-zero values.');
  }

  F = parseFloat(F.toFixed(10));

  // Determine force direction from charge signs
  let forceDirection: string;
  if (hasCharge1 && hasCharge2) {
    const q1Val = charge1 as number;
    const q2Val = charge2 as number;
    forceDirection = (q1Val > 0 && q2Val > 0) || (q1Val < 0 && q2Val < 0)
      ? 'Repulsive'
      : 'Attractive';
  } else {
    forceDirection = 'Unknown (need both charges for direction)';
  }

  const allValues: { label: string; value: number | string; unit: string }[] = [
    { label: 'Force Magnitude', value: F, unit: 'N' },
    { label: 'Force Direction', value: forceDirection, unit: '' },
    { label: 'Charge 1', value: q1, unit: 'C' },
    { label: 'Charge 2', value: q2, unit: 'C' },
    { label: 'Distance', value: r, unit: 'm' },
  ];

  const conversions = {
    force_kN: parseFloat((F / 1000).toFixed(10)),
    force_lbf: parseFloat((F * 0.224809).toFixed(10)),
    force_dyn: parseFloat((F * 100000).toFixed(10)),
    charge1_uC: parseFloat((q1 * 1e6).toFixed(6)),
    charge1_nC: parseFloat((q1 * 1e9).toFixed(6)),
    charge2_uC: parseFloat((q2 * 1e6).toFixed(6)),
    charge2_nC: parseFloat((q2 * 1e9).toFixed(6)),
    distance_cm: parseFloat((r * 100).toFixed(6)),
    distance_mm: parseFloat((r * 1000).toFixed(6)),
  };

  return {
    forceMagnitude: F,
    forceDirection,
    charge1: q1,
    charge2: q2,
    distance: r,
    solvedFrom,
    allValues,
    conversions,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'coulombs-law': calculateCoulombsLaw,
};
