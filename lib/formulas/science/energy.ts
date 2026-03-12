/**
 * Energy Calculator
 *
 * Core formulas:
 *   KE = ½ × m × v²     (kinetic energy)
 *   PE = m × g × h       (gravitational potential energy)
 *
 * Calculates kinetic energy or potential energy based on the
 * selected mode. Returns energy in joules with unit conversions.
 *
 * Source: Gottfried Wilhelm Leibniz, vis viva concept (1676);
 * William Rankine coined "potential energy" (1853).
 */

export interface EnergyInput {
  mode?: string;
  mass?: number;
  velocity?: number;
  height?: number;
  gravity?: number;
}

export interface EnergyOutput {
  energy: number;
  mode: string;
  allValues: { label: string; value: number; unit: string }[];
  conversions: {
    energy_kj: number;
    energy_cal: number;
    energy_kcal: number;
    energy_kwh: number;
    energy_btu: number;
    energy_ev: number;
    energy_ftlb: number;
  };
  breakdown: { step: string; expression: string }[];
}

/**
 * Calculates kinetic energy (KE = ½mv²) or gravitational potential
 * energy (PE = mgh) based on the selected mode. Mass is always
 * required. Velocity is required for kinetic mode; height is
 * required for potential mode. Gravity defaults to 9.80665 m/s²
 * (standard gravity) if not provided.
 */
export function calculateEnergy(inputs: Record<string, unknown>): Record<string, unknown> {
  const mode = inputs.mode !== undefined && inputs.mode !== null && inputs.mode !== ''
    ? String(inputs.mode).toLowerCase()
    : 'kinetic';
  const mass = inputs.mass !== undefined && inputs.mass !== null && inputs.mass !== ''
    ? Number(inputs.mass)
    : undefined;
  const velocity = inputs.velocity !== undefined && inputs.velocity !== null && inputs.velocity !== ''
    ? Number(inputs.velocity)
    : undefined;
  const height = inputs.height !== undefined && inputs.height !== null && inputs.height !== ''
    ? Number(inputs.height)
    : undefined;
  const gravityRaw = inputs.gravity !== undefined && inputs.gravity !== null && inputs.gravity !== ''
    ? Number(inputs.gravity)
    : undefined;

  // Validate mode
  if (mode !== 'kinetic' && mode !== 'potential') {
    throw new Error(
      'Mode must be either "kinetic" or "potential".'
    );
  }

  // Validate mass (required for both modes)
  if (mass === undefined || !isFinite(mass) || mass <= 0) {
    throw new Error(
      'Mass is required and must be a positive number.'
    );
  }

  // Validate and default gravity
  const g = gravityRaw !== undefined ? gravityRaw : 9.80665;
  if (!isFinite(g) || g <= 0) {
    throw new Error(
      'Gravity must be a positive number.'
    );
  }

  let energy: number;
  let allValues: { label: string; value: number; unit: string }[];
  let breakdown: { step: string; expression: string }[];

  if (mode === 'kinetic') {
    // Validate velocity for kinetic mode
    if (velocity === undefined || !isFinite(velocity) || velocity < 0) {
      throw new Error(
        'Velocity is required for kinetic energy calculation.'
      );
    }

    // KE = ½ × m × v²
    energy = 0.5 * mass * velocity * velocity;

    allValues = [
      { label: 'Energy', value: parseFloat(energy.toFixed(10)), unit: 'J' },
      { label: 'Mass', value: mass, unit: 'kg' },
      { label: 'Velocity', value: velocity, unit: 'm/s' },
    ];

    breakdown = [
      { step: 'Formula', expression: 'KE = ½ × m × v²' },
      { step: 'Substitute', expression: `KE = ½ × ${mass} kg × (${velocity} m/s)²` },
      { step: 'Square velocity', expression: `KE = ½ × ${mass} kg × ${parseFloat((velocity * velocity).toFixed(10))} m²/s²` },
      { step: 'Result', expression: `KE = ${parseFloat(energy.toFixed(10))} J` },
    ];
  } else {
    // Validate height for potential mode
    if (height === undefined || !isFinite(height)) {
      throw new Error(
        'Height is required for potential energy calculation.'
      );
    }

    // PE = m × g × h
    energy = mass * g * height;

    allValues = [
      { label: 'Energy', value: parseFloat(energy.toFixed(10)), unit: 'J' },
      { label: 'Mass', value: mass, unit: 'kg' },
      { label: 'Height', value: height, unit: 'm' },
      { label: 'Gravity', value: g, unit: 'm/s²' },
    ];

    breakdown = [
      { step: 'Formula', expression: 'PE = m × g × h' },
      { step: 'Substitute', expression: `PE = ${mass} kg × ${g} m/s² × ${height} m` },
      { step: 'Result', expression: `PE = ${parseFloat(energy.toFixed(10))} J` },
    ];
  }

  // Round main output
  energy = parseFloat(energy.toFixed(10));

  const conversions = {
    energy_kj: parseFloat((energy / 1000).toFixed(6)),
    energy_cal: parseFloat((energy / 4.184).toFixed(6)),
    energy_kcal: parseFloat((energy / 4184).toFixed(6)),
    energy_kwh: parseFloat((energy / 3600000).toFixed(6)),
    energy_btu: parseFloat((energy / 1055.06).toFixed(6)),
    energy_ev: parseFloat((energy / 1.602e-19).toFixed(6)),
    energy_ftlb: parseFloat((energy / 1.35582).toFixed(6)),
  };

  return {
    energy,
    mode,
    allValues,
    conversions,
    breakdown,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'energy': calculateEnergy,
};
