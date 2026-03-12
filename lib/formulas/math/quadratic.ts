export interface QuadraticInput {
  a: number;
  b: number;
  c: number;
}

export interface QuadraticOutput {
  x1: number | string;
  x2: number | string;
  discriminant: number;
  rootType: string;
  vertexX: number;
  vertexY: number;
  axisOfSymmetry: number;
  isLinear: boolean;
  factoredForm?: string;
}

/**
 * Quadratic formula for solving ax^2 + bx + c = 0:
 *
 *   x = (-b +/- sqrt(b^2 - 4ac)) / (2a)
 *
 * Discriminant D = b^2 - 4ac determines the nature of roots:
 *   D > 0  =>  two distinct real roots
 *   D = 0  =>  one repeated real root
 *   D < 0  =>  two complex conjugate roots
 *
 * Vertex of the parabola:
 *   x_vertex = -b / (2a)
 *   y_vertex = c - b^2 / (4a)
 *
 * Axis of symmetry: x = -b / (2a)
 *
 * When a = 0, the equation is linear: bx + c = 0 => x = -c/b
 *
 * Source: Quadratic formula derived from completing the square,
 * standard algebraic identity documented in all algebra textbooks
 * and the CRC Standard Mathematical Tables and Formulae (33rd Edition).
 */
export function calculateQuadratic(inputs: Record<string, unknown>): Record<string, unknown> {
  const a = Number(inputs.a);
  const b = Number(inputs.b);
  const c = Number(inputs.c);

  // Handle the degenerate case where a = 0 (linear equation)
  if (a === 0) {
    if (b === 0) {
      // 0x + c = 0 => either no solution or infinite solutions
      return {
        x1: c === 0 ? 'infinite solutions' : 'no solution',
        x2: c === 0 ? 'infinite solutions' : 'no solution',
        discriminant: NaN,
        rootType: c === 0 ? 'identity (0 = 0)' : 'no solution (contradiction)',
        vertexX: NaN,
        vertexY: NaN,
        axisOfSymmetry: NaN,
        isLinear: true,
        error: c === 0
          ? 'The equation 0 = 0 is always true (infinite solutions).'
          : `The equation ${c} = 0 is a contradiction (no solution).`,
      };
    }

    // Linear equation: bx + c = 0 => x = -c/b
    const x = -c / b;
    return {
      x1: parseFloat(x.toFixed(10)),
      x2: parseFloat(x.toFixed(10)),
      discriminant: NaN,
      rootType: 'linear (one solution)',
      vertexX: NaN,
      vertexY: NaN,
      axisOfSymmetry: NaN,
      isLinear: true,
    };
  }

  const discriminant = b * b - 4 * a * c;

  // Vertex calculation
  const vertexX = -b / (2 * a);
  const vertexY = c - (b * b) / (4 * a);

  // Axis of symmetry
  const axisOfSymmetry = vertexX;

  if (discriminant > 0) {
    // Two distinct real roots
    const sqrtD = Math.sqrt(discriminant);
    const x1 = (-b + sqrtD) / (2 * a);
    const x2 = (-b - sqrtD) / (2 * a);

    return {
      x1: parseFloat(x1.toFixed(10)),
      x2: parseFloat(x2.toFixed(10)),
      discriminant: parseFloat(discriminant.toFixed(10)),
      rootType: 'two distinct real roots',
      vertexX: parseFloat(vertexX.toFixed(10)),
      vertexY: parseFloat(vertexY.toFixed(10)),
      axisOfSymmetry: parseFloat(axisOfSymmetry.toFixed(10)),
      isLinear: false,
    };
  }

  if (discriminant === 0) {
    // One repeated real root
    const x = -b / (2 * a);

    return {
      x1: parseFloat(x.toFixed(10)),
      x2: parseFloat(x.toFixed(10)),
      discriminant: 0,
      rootType: 'one repeated real root',
      vertexX: parseFloat(vertexX.toFixed(10)),
      vertexY: parseFloat(vertexY.toFixed(10)),
      axisOfSymmetry: parseFloat(axisOfSymmetry.toFixed(10)),
      isLinear: false,
    };
  }

  // discriminant < 0: two complex conjugate roots
  const realPart = -b / (2 * a);
  const imaginaryPart = Math.sqrt(Math.abs(discriminant)) / (2 * a);

  // Format complex roots as strings
  const absImaginary = Math.abs(imaginaryPart);
  const x1Str = `${parseFloat(realPart.toFixed(6))} + ${parseFloat(absImaginary.toFixed(6))}i`;
  const x2Str = `${parseFloat(realPart.toFixed(6))} - ${parseFloat(absImaginary.toFixed(6))}i`;

  return {
    x1: x1Str,
    x2: x2Str,
    discriminant: parseFloat(discriminant.toFixed(10)),
    rootType: 'two complex conjugate roots',
    realPart: parseFloat(realPart.toFixed(10)),
    imaginaryPart: parseFloat(absImaginary.toFixed(10)),
    vertexX: parseFloat(vertexX.toFixed(10)),
    vertexY: parseFloat(vertexY.toFixed(10)),
    axisOfSymmetry: parseFloat(axisOfSymmetry.toFixed(10)),
    isLinear: false,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'quadratic': calculateQuadratic,
};
