export interface BodySurfaceAreaInput {
  weight: number;
  height: number;
  unitSystem: 'metric' | 'imperial';
}

export interface BodySurfaceAreaOutput {
  duboisBSA: number;
  mostellerBSA: number;
  haycockBSA: number;
  boydBSA: number;
  averageBSA: number;
  comparisonTable: { formula: string; bsa: number; year: string }[];
  error?: string;
}

/**
 * Body Surface Area (BSA) Calculator
 *
 * Calculates BSA using four established formulas:
 *
 *   DuBois & DuBois (1916):
 *     BSA = 0.007184 × W^0.425 × H^0.725
 *
 *   Mosteller (1987):
 *     BSA = √(W × H / 3600)
 *
 *   Haycock (1978):
 *     BSA = 0.024265 × W^0.5378 × H^0.3964
 *
 *   Boyd (1935):
 *     BSA = 0.0003207 × Wg^(0.7285 − 0.0188 × log10(Wg)) × H^0.3
 *     (Wg = weight in grams)
 *
 * Where:
 *   W = weight in kilograms
 *   H = height in centimeters
 *   BSA = body surface area in square meters (m²)
 *
 * Sources:
 *   DuBois D, DuBois EF. Archives of Internal Medicine. 1916;17:863-871
 *   Mosteller RD. N Engl J Med. 1987;317(17):1098
 *   Haycock GB et al. J Pediatr. 1978;93(1):62-66
 *   Boyd E. The Growth of the Surface Area of the Human Body. 1935
 */
export function calculateBodySurfaceArea(input: BodySurfaceAreaInput): BodySurfaceAreaOutput {
  const { unitSystem } = input;
  let { weight, height } = input;

  // Validate inputs
  if (weight <= 0 || height <= 0) {
    return {
      duboisBSA: 0,
      mostellerBSA: 0,
      haycockBSA: 0,
      boydBSA: 0,
      averageBSA: 0,
      comparisonTable: [],
      error: weight <= 0 ? 'Weight must be greater than zero' : 'Height must be greater than zero',
    };
  }

  // Convert imperial to metric if needed
  if (unitSystem === 'imperial') {
    weight = weight / 2.20462;  // lb to kg
    height = height * 2.54;      // in to cm
  }

  // DuBois & DuBois (1916): BSA = 0.007184 × W^0.425 × H^0.725
  const duboisBSA = 0.007184 * Math.pow(weight, 0.425) * Math.pow(height, 0.725);

  // Mosteller (1987): BSA = √(W × H / 3600)
  const mostellerBSA = Math.sqrt((weight * height) / 3600);

  // Haycock (1978): BSA = 0.024265 × W^0.5378 × H^0.3964
  const haycockBSA = 0.024265 * Math.pow(weight, 0.5378) * Math.pow(height, 0.3964);

  // Boyd (1935): BSA = 0.0003207 × W_g^(0.7285 − 0.0188 × log10(W_g)) × H^0.3
  // Note: Boyd formula uses weight in GRAMS, not kilograms
  const weightGrams = weight * 1000;
  const boydExponent = 0.7285 - 0.0188 * Math.log10(weightGrams);
  const boydBSA = 0.0003207 * Math.pow(weightGrams, boydExponent) * Math.pow(height, 0.3);

  // Average of all four formulas
  const averageBSA = (duboisBSA + mostellerBSA + haycockBSA + boydBSA) / 4;

  // Round to 4 decimal places
  const round4 = (n: number): number => Math.round(n * 10000) / 10000;

  const comparisonTable = [
    { formula: 'DuBois & DuBois', bsa: round4(duboisBSA), year: '1916' },
    { formula: 'Mosteller', bsa: round4(mostellerBSA), year: '1987' },
    { formula: 'Haycock', bsa: round4(haycockBSA), year: '1978' },
    { formula: 'Boyd', bsa: round4(boydBSA), year: '1935' },
  ];

  return {
    duboisBSA: round4(duboisBSA),
    mostellerBSA: round4(mostellerBSA),
    haycockBSA: round4(haycockBSA),
    boydBSA: round4(boydBSA),
    averageBSA: round4(averageBSA),
    comparisonTable,
  };
}

// Wrapper for the formula registry (takes Record<string, unknown>)
export function calculateBodySurfaceAreaFromInputs(inputs: Record<string, unknown>): Record<string, unknown> {
  const unitSystem = (inputs.unitSystem as string) === 'imperial' ? 'imperial' : 'metric';
  const weight = typeof inputs.weight === 'string' ? parseFloat(inputs.weight) : (inputs.weight as number);
  const height = typeof inputs.height === 'string' ? parseFloat(inputs.height) : (inputs.height as number);

  const result = calculateBodySurfaceArea({
    weight: weight || 0,
    height: height || 0,
    unitSystem,
  });

  return result as unknown as Record<string, unknown>;
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'body-surface-area': calculateBodySurfaceAreaFromInputs,
};
