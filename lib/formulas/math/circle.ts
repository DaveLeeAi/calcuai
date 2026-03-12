export interface CircleInput {
  mode: 'from-radius' | 'from-diameter' | 'from-area' | 'from-circumference';
  value: number;
}

export interface CircleOutput {
  radius: number;
  diameter: number;
  circumference: number;
  area: number;
}

/**
 * Circle calculator — computes all four circle properties from any one known value.
 *
 * Formulas:
 *   From radius r:
 *     diameter       = 2r
 *     circumference  = 2πr
 *     area           = πr²
 *
 *   From diameter d:
 *     radius         = d / 2
 *     circumference  = πd
 *     area           = π(d/2)²
 *
 *   From area A:
 *     radius         = √(A / π)
 *     diameter       = 2√(A / π)
 *     circumference  = 2π√(A / π)
 *
 *   From circumference C:
 *     radius         = C / (2π)
 *     diameter       = C / π
 *     area           = π(C / (2π))²
 *
 * Source: Circle formulas attributed to Archimedes (3rd century BC).
 *         A = πr², C = 2πr. Documented in Euclid's Elements, Book XII.
 */
export function calculateCircle(inputs: Record<string, unknown>): Record<string, unknown> {
  const mode = String(inputs.mode || 'from-radius') as CircleInput['mode'];
  const rawValue = Number(inputs.value);

  if (isNaN(rawValue)) {
    throw new Error('Value must be a valid number');
  }

  // Use absolute value for negative inputs
  const value = Math.abs(rawValue);

  // If value is zero, all outputs are zero
  if (value === 0) {
    return {
      radius: 0,
      diameter: 0,
      circumference: 0,
      area: 0,
    };
  }

  let radius: number;

  switch (mode) {
    case 'from-radius':
      radius = value;
      break;

    case 'from-diameter':
      radius = value / 2;
      break;

    case 'from-area':
      // A = πr² → r = √(A/π)
      radius = Math.sqrt(value / Math.PI);
      break;

    case 'from-circumference':
      // C = 2πr → r = C/(2π)
      radius = value / (2 * Math.PI);
      break;

    default:
      throw new Error(`Unknown mode: ${mode}`);
  }

  const diameter = 2 * radius;
  const circumference = 2 * Math.PI * radius;
  const area = Math.PI * radius * radius;

  return {
    radius: parseFloat(radius.toFixed(6)),
    diameter: parseFloat(diameter.toFixed(6)),
    circumference: parseFloat(circumference.toFixed(6)),
    area: parseFloat(area.toFixed(6)),
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'circle': calculateCircle,
};
