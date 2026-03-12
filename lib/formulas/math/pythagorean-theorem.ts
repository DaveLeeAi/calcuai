/**
 * Pythagorean Theorem Calculator
 *
 * For a right triangle with legs a, b and hypotenuse c:
 *
 *   a^2 + b^2 = c^2
 *
 * Solve for any missing side:
 *   c = sqrt(a^2 + b^2)         [find hypotenuse]
 *   a = sqrt(c^2 - b^2)         [find leg a]
 *   b = sqrt(c^2 - a^2)         [find leg b]
 *
 * Also computes:
 *   Area = (1/2) * a * b
 *   Perimeter = a + b + c
 *   Angle A = arctan(a/b)
 *   Angle B = arctan(b/a)
 *
 * Source: Euclid's Elements, Book I, Proposition 47
 */

export interface PythagoreanInput {
  mode: 'find-c' | 'find-a' | 'find-b';
  sideA?: number;
  sideB?: number;
  hypotenuse?: number;
}

export interface PythagoreanOutput {
  sideA: number;
  sideB: number;
  hypotenuse: number;
  area: number;
  perimeter: number;
  angleA: number;
  angleB: number;
  isValid: boolean;
}

export function calculatePythagorean(inputs: Record<string, unknown>): Record<string, unknown> {
  const mode = String(inputs.mode || 'find-c');

  let a: number;
  let b: number;
  let c: number;

  switch (mode) {
    case 'find-c': {
      a = Number(inputs.sideA);
      b = Number(inputs.sideB);

      if (isNaN(a) || isNaN(b) || a <= 0 || b <= 0) {
        return {
          sideA: a || null,
          sideB: b || null,
          hypotenuse: null,
          area: null,
          perimeter: null,
          angleA: null,
          angleB: null,
          isValid: false,
          error: 'Both sides must be positive numbers.',
        };
      }

      c = Math.sqrt(a * a + b * b);
      break;
    }

    case 'find-a': {
      b = Number(inputs.sideB);
      c = Number(inputs.hypotenuse);

      if (isNaN(b) || isNaN(c) || b <= 0 || c <= 0) {
        return {
          sideA: null,
          sideB: b || null,
          hypotenuse: c || null,
          area: null,
          perimeter: null,
          angleA: null,
          angleB: null,
          isValid: false,
          error: 'Side b and hypotenuse must be positive numbers.',
        };
      }

      if (c <= b) {
        return {
          sideA: null,
          sideB: b,
          hypotenuse: c,
          area: null,
          perimeter: null,
          angleA: null,
          angleB: null,
          isValid: false,
          error: 'Hypotenuse must be greater than the other side.',
        };
      }

      a = Math.sqrt(c * c - b * b);
      break;
    }

    case 'find-b': {
      a = Number(inputs.sideA);
      c = Number(inputs.hypotenuse);

      if (isNaN(a) || isNaN(c) || a <= 0 || c <= 0) {
        return {
          sideA: a || null,
          sideB: null,
          hypotenuse: c || null,
          area: null,
          perimeter: null,
          angleA: null,
          angleB: null,
          isValid: false,
          error: 'Side a and hypotenuse must be positive numbers.',
        };
      }

      if (c <= a) {
        return {
          sideA: a,
          sideB: null,
          hypotenuse: c,
          area: null,
          perimeter: null,
          angleA: null,
          angleB: null,
          isValid: false,
          error: 'Hypotenuse must be greater than the other side.',
        };
      }

      b = Math.sqrt(c * c - a * a);
      break;
    }

    default:
      return {
        sideA: null,
        sideB: null,
        hypotenuse: null,
        area: null,
        perimeter: null,
        angleA: null,
        angleB: null,
        isValid: false,
        error: `Unknown mode: ${mode}`,
      };
  }

  const area = 0.5 * a * b;
  const perimeter = a + b + c;
  const angleA = Math.atan2(a, b) * (180 / Math.PI); // angle opposite side a
  const angleB = Math.atan2(b, a) * (180 / Math.PI); // angle opposite side b

  return {
    sideA: parseFloat(a.toFixed(10)),
    sideB: parseFloat(b.toFixed(10)),
    hypotenuse: parseFloat(c.toFixed(10)),
    area: parseFloat(area.toFixed(10)),
    perimeter: parseFloat(perimeter.toFixed(10)),
    angleA: parseFloat(angleA.toFixed(6)),
    angleB: parseFloat(angleB.toFixed(6)),
    isValid: true,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'pythagorean-theorem': calculatePythagorean,
};
