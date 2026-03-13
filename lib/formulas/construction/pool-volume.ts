/**
 * Swimming Pool Volume Calculator Formula Module
 *
 * Calculates pool water volume for rectangular, circular, oval, and kidney shapes.
 *
 * Rectangular:  V = L x W x avgDepth
 * Circular:     V = pi x (D/2)^2 x avgDepth
 * Oval:         V = pi x (L/2) x (W/2) x avgDepth
 * Kidney:       V = 0.45 x (L + W) x L x avgDepth  (industry approximation)
 *
 * Conversion: 1 cubic foot = 7.48052 US gallons
 *
 * Source: Association of Pool & Spa Professionals (APSP) / Pool & Hot Tub
 * Alliance (PHTA) — Technical Manual for Pool Volume Calculations
 */

export interface PoolVolumeInput {
  poolShape: string;        // 'rectangular' | 'circular' | 'oval' | 'kidney'
  length: number;
  lengthUnit: string;       // 'ft' | 'm'
  width: number;
  widthUnit: string;        // 'ft' | 'm'
  shallowDepth: number;
  shallowDepthUnit: string; // 'ft' | 'm'
  deepDepth: number;
  deepDepthUnit: string;    // 'ft' | 'm'
  diameter: number;
  diameterUnit: string;     // 'ft' | 'm'
}

export interface PoolVolumeOutput {
  gallons: number;
  liters: number;
  cubicFeet: number;
  cubicMeters: number;
  averageDepth: number;
  surfaceArea: number;
  chemicalEstimate: { label: string; value: number }[];
  waterCost: { label: string; value: number }[];
  poolSummary: { label: string; value: number }[];
}

/** Conversion: length units to feet */
const toFeet: Record<string, number> = {
  ft: 1,
  m: 3.28084,
};

/** Gallons per cubic foot */
const GALLONS_PER_CUFT = 7.48052;

/** Liters per gallon */
const LITERS_PER_GALLON = 3.78541;

/** Cubic meters per cubic foot */
const CUBICM_PER_CUFT = 0.0283168;

/** Average garden hose flow rate in gallons per hour */
const HOSE_GPH = 540;

/** Approximate water cost per gallon (USD) */
const WATER_COST_PER_GAL = 0.005;

/**
 * Swimming pool volume calculator.
 *
 * Rectangular: V = L x W x avgDepth
 * Circular:    V = pi x (D/2)^2 x avgDepth
 * Oval:        V = pi x (L/2) x (W/2) x avgDepth
 * Kidney:      V = 0.45 x (L + W) x L x avgDepth
 *
 * Source: APSP/PHTA pool volume standards
 */
export function calculatePoolVolume(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const poolShape = String(inputs.poolShape || 'rectangular');
  const rawLength = Math.max(0, Number(inputs.length) || 0);
  const rawWidth = Math.max(0, Number(inputs.width) || 0);
  const rawShallowDepth = Math.max(0, Number(inputs.shallowDepth) || 0);
  const rawDeepDepth = Math.max(0, Number(inputs.deepDepth) || 0);
  const rawDiameter = Math.max(0, Number(inputs.diameter) || 0);

  const lengthUnit = String(inputs.lengthUnit || 'ft');
  const widthUnit = String(inputs.widthUnit || 'ft');
  const shallowDepthUnit = String(inputs.shallowDepthUnit || 'ft');
  const deepDepthUnit = String(inputs.deepDepthUnit || 'ft');
  const diameterUnit = String(inputs.diameterUnit || 'ft');

  // ── Convert to feet ───────────────────────────────────
  const lengthFt = rawLength * (toFeet[lengthUnit] ?? 1);
  const widthFt = rawWidth * (toFeet[widthUnit] ?? 1);
  const shallowFt = rawShallowDepth * (toFeet[shallowDepthUnit] ?? 1);
  const deepFt = rawDeepDepth * (toFeet[deepDepthUnit] ?? 1);
  const diameterFt = rawDiameter * (toFeet[diameterUnit] ?? 1);

  // ── Average depth ─────────────────────────────────────
  const averageDepth = (shallowFt + deepFt) / 2;

  // ── Volume and surface area by shape ──────────────────
  let cubicFeet = 0;
  let surfaceArea = 0;

  switch (poolShape) {
    case 'circular': {
      const radius = diameterFt / 2;
      surfaceArea = Math.PI * radius * radius;
      cubicFeet = surfaceArea * averageDepth;
      break;
    }
    case 'oval': {
      surfaceArea = Math.PI * (lengthFt / 2) * (widthFt / 2);
      cubicFeet = surfaceArea * averageDepth;
      break;
    }
    case 'kidney': {
      // Industry approximation for kidney-shaped pools
      surfaceArea = 0.45 * (lengthFt + widthFt) * lengthFt;
      cubicFeet = surfaceArea * averageDepth;
      break;
    }
    case 'rectangular':
    default: {
      surfaceArea = lengthFt * widthFt;
      cubicFeet = surfaceArea * averageDepth;
      break;
    }
  }

  // ── Conversions ───────────────────────────────────────
  const gallons = cubicFeet * GALLONS_PER_CUFT;
  const liters = gallons * LITERS_PER_GALLON;
  const cubicMeters = cubicFeet * CUBICM_PER_CUFT;

  // ── Chemical estimates ────────────────────────────────
  // Chlorine: ~2 lbs per 10,000 gallons for initial fill
  // pH adjustment: ~1.5 lbs per 10,000 gallons
  // Fill time: garden hose at ~540 GPH
  const chlorineLbs = parseFloat(((gallons / 10000) * 2).toFixed(2));
  const phLbs = parseFloat(((gallons / 10000) * 1.5).toFixed(2));
  const fillTimeHours = gallons > 0 ? Math.ceil(gallons / HOSE_GPH) : 0;

  const chemicalEstimate = [
    { label: 'Chlorine (initial fill, lbs)', value: chlorineLbs },
    { label: 'pH Adjustment (lbs)', value: phLbs },
    { label: 'Fill Time (hours, garden hose ~540 GPH)', value: fillTimeHours },
  ];

  // ── Water cost ────────────────────────────────────────
  const waterCost = [
    { label: 'Water Cost (@ $0.005/gal)', value: parseFloat((gallons * WATER_COST_PER_GAL).toFixed(2)) },
  ];

  // ── Pool summary ──────────────────────────────────────
  const poolSummary = [
    { label: 'Surface Area (sq ft)', value: parseFloat(surfaceArea.toFixed(2)) },
    { label: 'Average Depth (ft)', value: parseFloat(averageDepth.toFixed(2)) },
    { label: 'Volume (cu ft)', value: parseFloat(cubicFeet.toFixed(2)) },
  ];

  return {
    gallons: parseFloat(gallons.toFixed(2)),
    liters: parseFloat(liters.toFixed(2)),
    cubicFeet: parseFloat(cubicFeet.toFixed(2)),
    cubicMeters: parseFloat(cubicMeters.toFixed(4)),
    averageDepth: parseFloat(averageDepth.toFixed(2)),
    surfaceArea: parseFloat(surfaceArea.toFixed(2)),
    chemicalEstimate,
    waterCost,
    poolSummary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'pool-volume': calculatePoolVolume,
};
