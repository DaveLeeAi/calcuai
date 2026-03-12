/**
 * Density Calculator
 *
 * Core formulas (density–mass–volume triangle):
 *   ρ = m / V    (density = mass / volume)
 *   m = ρ × V    (mass = density × volume)
 *   V = m / ρ    (volume = mass / density)
 *
 * Given any 2 of the 3 quantities (Density, Mass, Volume),
 * this function solves for the unknown third value.
 *
 * Source: Archimedes, "On Floating Bodies" (c. 250 BC).
 */

export interface DensityInput {
  density?: number;
  mass?: number;
  volume?: number;
}

export interface DensityOutput {
  density: number;
  mass: number;
  volume: number;
  solvedFrom: string;
  allValues: { label: string; value: number; unit: string }[];
  conversions: {
    density_gcm3: number;
    density_gml: number;
    density_lbft3: number;
    density_kgl: number;
    mass_g: number;
    mass_lb: number;
    mass_oz: number;
    volume_cm3: number;
    volume_L: number;
    volume_mL: number;
    volume_ft3: number;
    volume_gal: number;
  };
  materialComparison: { material: string; density: number; unit: string }[];
}

/**
 * Determines which two of the three quantities are provided
 * (defined, numeric, and > 0), solves for the third using the
 * appropriate formula, and returns all three values along with
 * unit conversions, material comparison table, and metadata.
 *
 * The 3 valid input combinations:
 *   ρ + m → V = m / ρ
 *   ρ + V → m = ρ × V
 *   m + V → ρ = m / V
 */
export function calculateDensity(inputs: Record<string, unknown>): Record<string, unknown> {
  const density = inputs.density !== undefined && inputs.density !== null && inputs.density !== ''
    ? Number(inputs.density)
    : undefined;
  const mass = inputs.mass !== undefined && inputs.mass !== null && inputs.mass !== ''
    ? Number(inputs.mass)
    : undefined;
  const volume = inputs.volume !== undefined && inputs.volume !== null && inputs.volume !== ''
    ? Number(inputs.volume)
    : undefined;

  // Identify which values are provided (finite and > 0)
  const hasDensity = density !== undefined && isFinite(density) && density > 0;
  const hasMass = mass !== undefined && isFinite(mass) && mass > 0;
  const hasVolume = volume !== undefined && isFinite(volume) && volume > 0;

  const providedCount = [hasDensity, hasMass, hasVolume].filter(Boolean).length;

  if (providedCount < 2) {
    throw new Error(
      'Enter any two of: Density, Mass, Volume.'
    );
  }

  let rho: number;
  let m: number;
  let V: number;
  let solvedFrom: string;

  // Solve based on which two inputs are provided.
  // When more than 2 are provided, use the first valid pair in priority order.
  if (hasDensity && hasMass) {
    rho = density as number;
    m = mass as number;
    V = m / rho;
    solvedFrom = 'Density (ρ) and Mass (m)';
  } else if (hasDensity && hasVolume) {
    rho = density as number;
    V = volume as number;
    m = rho * V;
    solvedFrom = 'Density (ρ) and Volume (V)';
  } else if (hasMass && hasVolume) {
    m = mass as number;
    V = volume as number;
    rho = m / V;
    solvedFrom = 'Mass (m) and Volume (V)';
  } else {
    throw new Error(
      'Could not determine a valid pair of inputs. Provide exactly two positive values.'
    );
  }

  // Round to avoid floating-point display artifacts
  rho = parseFloat(rho.toFixed(10));
  m = parseFloat(m.toFixed(10));
  V = parseFloat(V.toFixed(10));

  const allValues = [
    { label: 'Density', value: rho, unit: 'kg/m³' },
    { label: 'Mass', value: m, unit: 'kg' },
    { label: 'Volume', value: V, unit: 'm³' },
  ];

  const conversions = {
    density_gcm3: parseFloat((rho / 1000).toFixed(6)),
    density_gml: parseFloat((rho / 1000).toFixed(6)),
    density_lbft3: parseFloat((rho * 0.062428).toFixed(6)),
    density_kgl: parseFloat((rho / 1000).toFixed(6)),
    mass_g: parseFloat((m * 1000).toFixed(6)),
    mass_lb: parseFloat((m * 2.20462).toFixed(6)),
    mass_oz: parseFloat((m * 35.274).toFixed(6)),
    volume_cm3: parseFloat((V * 1e6).toFixed(6)),
    volume_L: parseFloat((V * 1000).toFixed(6)),
    volume_mL: parseFloat((V * 1e6).toFixed(6)),
    volume_ft3: parseFloat((V * 35.3147).toFixed(6)),
    volume_gal: parseFloat((V * 264.172).toFixed(6)),
  };

  const materialComparison = [
    { material: 'Air (STP)', density: 1.225, unit: 'kg/m³' },
    { material: 'Water (4°C)', density: 1000, unit: 'kg/m³' },
    { material: 'Aluminum', density: 2700, unit: 'kg/m³' },
    { material: 'Iron', density: 7874, unit: 'kg/m³' },
    { material: 'Gold', density: 19320, unit: 'kg/m³' },
    { material: 'Osmium', density: 22590, unit: 'kg/m³' },
  ];

  return {
    density: rho,
    mass: m,
    volume: V,
    solvedFrom,
    allValues,
    conversions,
    materialComparison,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'density': calculateDensity,
};
