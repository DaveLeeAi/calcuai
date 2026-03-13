/**
 * Square Meter Calculator Formula Module
 *
 * Two modes:
 *   1. Dimensions mode — calculate area from length × width (in meters or feet)
 *   2. Convert mode — convert an area value between sq ft, sq m, sq yd, acres, hectares
 *
 * Dimensions mode:
 *   sqMeters = length_m × width_m
 *   sqFeet = sqMeters × 10.7639
 *   sqYards = sqFeet / 9
 *   sqInches = sqFeet × 144
 *   acres = sqMeters / 4046.86
 *   hectares = sqMeters / 10000
 *
 * Convert mode:
 *   Convert input to sq meters first, then to all other units.
 *   sqft → sqm: ÷ 10.7639
 *   sqyd → sqm: × 0.836127
 *   acres → sqm: × 4046.86
 *   hectares → sqm: × 10000
 *
 * Source: NIST Special Publication 330, "The International System of Units (SI)"
 * (2019 Edition). International Yard and Pound Agreement (1959).
 */

export interface SquareMeterInput {
  calculationMode: string;   // 'dimensions' | 'convert'
  length?: number;           // meters or feet
  lengthUnit?: string;       // 'm' | 'ft'
  width?: number;            // meters or feet
  widthUnit?: string;        // 'm' | 'ft'
  areaToConvert?: number;    // area value to convert
  convertFrom?: string;      // 'sqft' | 'sqm' | 'sqyd' | 'acres' | 'hectares'
}

export interface SquareMeterOutput {
  squareMeters: number;
  squareFeet: number;
  squareYards: number;
  squareInches: number;
  acres: number;
  hectares: number;
  conversionTable: { label: string; value: string | number }[];
}

/** Conversion factors: multiply by this to get square meters */
const TO_SQ_METERS: Record<string, number> = {
  sqm: 1,
  sqft: 0.09290304,
  sqyd: 0.83612736,
  acres: 4046.8564224,
  hectares: 10000,
};

/** Length unit conversion to meters */
const LENGTH_TO_METERS: Record<string, number> = {
  m: 1,
  ft: 0.3048,
};

/**
 * Square Meter Calculator — area from dimensions or unit conversion.
 *
 * Dimensions mode: sqMeters = length_m × width_m
 * Convert mode: sqMeters = areaToConvert × conversionFactor
 *
 * Source: NIST SP 330 (2019).
 */
export function calculateSquareMeter(inputs: Record<string, unknown>): Record<string, unknown> {
  const mode = String(inputs.calculationMode || 'dimensions');

  let sqMeters = 0;

  if (mode === 'convert') {
    // ── Convert mode ──────────────────────────────────────
    const areaToConvert = Math.max(0, Number(inputs.areaToConvert) || 0);
    const convertFrom = String(inputs.convertFrom || 'sqft');
    const factor = TO_SQ_METERS[convertFrom] ?? TO_SQ_METERS['sqft'];
    sqMeters = areaToConvert * factor;
  } else {
    // ── Dimensions mode ───────────────────────────────────
    const rawLength = Math.max(0, Number(inputs.length) || 0);
    const rawWidth = Math.max(0, Number(inputs.width) || 0);
    const lengthUnit = String(inputs.lengthUnit || 'm');
    const widthUnit = String(inputs.widthUnit || 'm');

    const lengthM = rawLength * (LENGTH_TO_METERS[lengthUnit] ?? 1);
    const widthM = rawWidth * (LENGTH_TO_METERS[widthUnit] ?? 1);

    sqMeters = lengthM * widthM;
  }

  // ── Derive all unit values ────────────────────────────
  const squareMeters = parseFloat(sqMeters.toFixed(4));
  const squareFeet = parseFloat((sqMeters / TO_SQ_METERS['sqft']).toFixed(2));
  const squareYards = parseFloat((sqMeters / TO_SQ_METERS['sqyd']).toFixed(2));
  const squareInches = parseFloat((squareFeet * 144).toFixed(2));
  const acres = parseFloat((sqMeters / TO_SQ_METERS['acres']).toFixed(6));
  const hectares = parseFloat((sqMeters / TO_SQ_METERS['hectares']).toFixed(6));

  // ── Conversion table ──────────────────────────────────
  const conversionTable: { label: string; value: string | number }[] = [
    { label: 'Square Meters (m²)', value: squareMeters },
    { label: 'Square Feet (ft²)', value: squareFeet },
    { label: 'Square Yards (yd²)', value: squareYards },
    { label: 'Square Inches (in²)', value: squareInches },
    { label: 'Acres', value: acres },
    { label: 'Hectares', value: hectares },
  ];

  return {
    squareMeters,
    squareFeet,
    squareYards,
    squareInches,
    acres,
    hectares,
    conversionTable,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'square-meter': calculateSquareMeter,
};
