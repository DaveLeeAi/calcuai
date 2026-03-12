/**
 * Pressure Calculator
 *
 * Core formulas (pressure–force–area triangle):
 *   P = F / A    (pressure = force / area)
 *   F = P × A    (force = pressure × area)
 *   A = F / P    (area = force / pressure)
 *
 * Given any 2 of the 3 quantities (Pressure, Force, Area),
 * this function solves for the unknown third value.
 *
 * Source: Blaise Pascal, "Traité de l'équilibre des liqueurs" (1663).
 */

export interface PressureInput {
  pressure?: number;
  force?: number;
  area?: number;
}

export interface PressureOutput {
  pressure: number;
  force: number;
  area: number;
  solvedFrom: string;
  allValues: { label: string; value: number; unit: string }[];
  conversions: {
    pressure_kpa: number;
    pressure_bar: number;
    pressure_atm: number;
    pressure_psi: number;
    pressure_mmhg: number;
    pressure_torr: number;
    pressure_inhg: number;
    force_lbf: number;
    force_kgf: number;
    force_dyn: number;
    area_cm2: number;
    area_ft2: number;
    area_in2: number;
  };
}

/**
 * Determines which two of the three quantities are provided
 * (defined, numeric, and > 0), solves for the third using the
 * appropriate formula, and returns all three values along with
 * unit conversions and metadata.
 *
 * The 3 valid input combinations:
 *   P + F → A = F / P
 *   P + A → F = P × A
 *   F + A → P = F / A
 */
export function calculatePressure(inputs: Record<string, unknown>): Record<string, unknown> {
  const pressure = inputs.pressure !== undefined && inputs.pressure !== null && inputs.pressure !== ''
    ? Number(inputs.pressure)
    : undefined;
  const force = inputs.force !== undefined && inputs.force !== null && inputs.force !== ''
    ? Number(inputs.force)
    : undefined;
  const area = inputs.area !== undefined && inputs.area !== null && inputs.area !== ''
    ? Number(inputs.area)
    : undefined;

  // Identify which values are provided (finite and > 0)
  const hasPressure = pressure !== undefined && isFinite(pressure) && pressure > 0;
  const hasForce = force !== undefined && isFinite(force) && force > 0;
  const hasArea = area !== undefined && isFinite(area) && area > 0;

  const providedCount = [hasPressure, hasForce, hasArea].filter(Boolean).length;

  if (providedCount < 2) {
    throw new Error(
      'Enter any two of: Pressure, Force, Area.'
    );
  }

  let P: number;
  let F: number;
  let A: number;
  let solvedFrom: string;

  // Solve based on which two inputs are provided.
  // When more than 2 are provided, use the first valid pair in priority order.
  if (hasPressure && hasForce) {
    P = pressure as number;
    F = force as number;
    A = F / P;
    solvedFrom = 'Pressure (P) and Force (F)';
  } else if (hasPressure && hasArea) {
    P = pressure as number;
    A = area as number;
    F = P * A;
    solvedFrom = 'Pressure (P) and Area (A)';
  } else if (hasForce && hasArea) {
    F = force as number;
    A = area as number;
    P = F / A;
    solvedFrom = 'Force (F) and Area (A)';
  } else {
    throw new Error(
      'Could not determine a valid pair of inputs. Provide exactly two positive values.'
    );
  }

  // Round to avoid floating-point display artifacts
  P = parseFloat(P.toFixed(10));
  F = parseFloat(F.toFixed(10));
  A = parseFloat(A.toFixed(10));

  const allValues = [
    { label: 'Pressure', value: P, unit: 'Pa' },
    { label: 'Force', value: F, unit: 'N' },
    { label: 'Area', value: A, unit: 'm²' },
  ];

  const conversions = {
    pressure_kpa: parseFloat((P / 1000).toFixed(6)),
    pressure_bar: parseFloat((P / 100000).toFixed(6)),
    pressure_atm: parseFloat((P / 101325).toFixed(6)),
    pressure_psi: parseFloat((P / 6894.757).toFixed(6)),
    pressure_mmhg: parseFloat((P / 133.322).toFixed(6)),
    pressure_torr: parseFloat((P / 133.322).toFixed(6)),
    pressure_inhg: parseFloat((P / 3386.39).toFixed(6)),
    force_lbf: parseFloat((F / 4.44822).toFixed(6)),
    force_kgf: parseFloat((F / 9.80665).toFixed(6)),
    force_dyn: parseFloat((F * 100000).toFixed(6)),
    area_cm2: parseFloat((A * 10000).toFixed(6)),
    area_ft2: parseFloat((A * 10.7639).toFixed(6)),
    area_in2: parseFloat((A * 1550.003).toFixed(6)),
  };

  return {
    pressure: P,
    force: F,
    area: A,
    solvedFrom,
    allValues,
    conversions,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'pressure': calculatePressure,
};
