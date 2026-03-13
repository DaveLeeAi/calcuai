/**
 * Heat Transfer Calculator — Specific Heat Formula
 *
 * Core formula:
 *   Q = m * c * DT
 *
 * Where:
 *   Q  = heat energy (J)
 *   m  = mass (kg)
 *   c  = specific heat capacity (J/(kg*K))
 *   DT = temperature change (K or degC — same magnitude)
 *
 * 4-way solver: given any three of Q, m, c, DT, solves for the fourth.
 *
 * Material presets (specific heat in J/(kg*K)):
 *   Water: 4186, Ice: 2090, Steam: 2010, Aluminum: 897, Copper: 385,
 *   Iron: 449, Glass: 840, Wood: 1700, Air: 1005, Concrete: 880,
 *   Ethanol: 2440, Olive Oil: 1970
 *
 * Source: Joseph Black, Lectures on the Elements of Chemistry (1803);
 *         NIST thermophysical data.
 */

export interface HeatTransferInput {
  heatEnergy?: number;
  mass?: number;
  specificHeat?: number;
  materialPreset?: string;
  temperatureChange?: number;
}

export interface HeatTransferOutput {
  heatEnergy: number;
  mass: number;
  specificHeat: number;
  temperatureChange: number;
  solvedFrom: string;
  allValues: { label: string; value: number; unit: string }[];
  conversions: {
    energy_kJ: number;
    energy_cal: number;
    energy_kcal: number;
    energy_BTU: number;
    energy_Wh: number;
    mass_g: number;
    mass_lb: number;
  };
}

const MATERIAL_PRESETS: Record<string, number> = {
  '4186': 4186,   // Water
  '2090': 2090,   // Ice
  '2010': 2010,   // Steam
  '897': 897,     // Aluminum
  '385': 385,     // Copper
  '449': 449,     // Iron
  '840': 840,     // Glass
  '1700': 1700,   // Wood
  '1005': 1005,   // Air
  '880': 880,     // Concrete
  '2440': 2440,   // Ethanol
  '1970': 1970,   // Olive Oil
};

export function calculateHeatTransfer(inputs: Record<string, unknown>): Record<string, unknown> {
  // Handle material preset → override specificHeat
  let specificHeatRaw = inputs.specificHeat;
  if (inputs.materialPreset !== undefined && inputs.materialPreset !== null && inputs.materialPreset !== '' && inputs.materialPreset !== 'custom') {
    const presetKey = String(inputs.materialPreset);
    if (MATERIAL_PRESETS[presetKey]) {
      specificHeatRaw = MATERIAL_PRESETS[presetKey];
    }
  }

  const heatEnergy = inputs.heatEnergy !== undefined && inputs.heatEnergy !== null && inputs.heatEnergy !== ''
    ? Number(inputs.heatEnergy)
    : undefined;
  const mass = inputs.mass !== undefined && inputs.mass !== null && inputs.mass !== ''
    ? Number(inputs.mass)
    : undefined;
  const specificHeat = specificHeatRaw !== undefined && specificHeatRaw !== null && specificHeatRaw !== ''
    ? Number(specificHeatRaw)
    : undefined;
  const temperatureChange = inputs.temperatureChange !== undefined && inputs.temperatureChange !== null && inputs.temperatureChange !== ''
    ? Number(inputs.temperatureChange)
    : undefined;

  // Q can be negative (cooling), DT can be negative, but mass and c must be positive
  const hasQ = heatEnergy !== undefined && isFinite(heatEnergy) && heatEnergy !== 0;
  const hasMass = mass !== undefined && isFinite(mass) && mass > 0;
  const hasC = specificHeat !== undefined && isFinite(specificHeat) && specificHeat > 0;
  const hasDT = temperatureChange !== undefined && isFinite(temperatureChange) && temperatureChange !== 0;

  const providedCount = [hasQ, hasMass, hasC, hasDT].filter(Boolean).length;

  if (providedCount < 3) {
    throw new Error('Enter any three of: Heat Energy, Mass, Specific Heat, Temperature Change.');
  }

  let Q: number;
  let m: number;
  let c: number;
  let dT: number;
  let solvedFrom: string;

  if (hasMass && hasC && hasDT) {
    // Solve for Q
    m = mass as number;
    c = specificHeat as number;
    dT = temperatureChange as number;
    Q = m * c * dT;
    solvedFrom = 'Mass, Specific Heat, and Temperature Change';
  } else if (hasQ && hasC && hasDT) {
    // Solve for mass
    Q = heatEnergy as number;
    c = specificHeat as number;
    dT = temperatureChange as number;
    m = Q / (c * dT);
    if (m <= 0) {
      throw new Error('Calculated mass is non-positive. Check signs of heat energy and temperature change.');
    }
    solvedFrom = 'Heat Energy, Specific Heat, and Temperature Change';
  } else if (hasQ && hasMass && hasDT) {
    // Solve for specific heat
    Q = heatEnergy as number;
    m = mass as number;
    dT = temperatureChange as number;
    c = Q / (m * dT);
    if (c <= 0) {
      throw new Error('Calculated specific heat is non-positive. Check signs of heat energy and temperature change.');
    }
    solvedFrom = 'Heat Energy, Mass, and Temperature Change';
  } else if (hasQ && hasMass && hasC) {
    // Solve for temperature change
    Q = heatEnergy as number;
    m = mass as number;
    c = specificHeat as number;
    dT = Q / (m * c);
    solvedFrom = 'Heat Energy, Mass, and Specific Heat';
  } else {
    throw new Error('Could not determine a valid set of three inputs.');
  }

  Q = parseFloat(Q.toFixed(10));
  m = parseFloat(m.toFixed(10));
  c = parseFloat(c.toFixed(10));
  dT = parseFloat(dT.toFixed(10));

  const allValues = [
    { label: 'Heat Energy', value: Q, unit: 'J' },
    { label: 'Mass', value: m, unit: 'kg' },
    { label: 'Specific Heat', value: c, unit: 'J/(kg·K)' },
    { label: 'Temperature Change', value: dT, unit: '°C / K' },
  ];

  const conversions = {
    energy_kJ: parseFloat((Q / 1000).toFixed(6)),
    energy_cal: parseFloat((Q / 4.184).toFixed(6)),
    energy_kcal: parseFloat((Q / 4184).toFixed(6)),
    energy_BTU: parseFloat((Q / 1055.06).toFixed(6)),
    energy_Wh: parseFloat((Q / 3600).toFixed(6)),
    mass_g: parseFloat((m * 1000).toFixed(6)),
    mass_lb: parseFloat((m * 2.20462).toFixed(6)),
  };

  return {
    heatEnergy: Q,
    mass: m,
    specificHeat: c,
    temperatureChange: dT,
    solvedFrom,
    allValues,
    conversions,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'heat-transfer': calculateHeatTransfer,
};
