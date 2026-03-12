export type ShapeType = 'rectangle' | 'triangle' | 'circle' | 'trapezoid';

export interface SquareFootageInput {
  shape: ShapeType;
  // Rectangle
  length?: number;
  lengthUnit?: string;
  width?: number;
  widthUnit?: string;
  // Triangle
  base?: number;
  baseUnit?: string;
  triangleHeight?: number;
  triangleHeightUnit?: string;
  // Circle
  radius?: number;
  radiusUnit?: string;
  // Trapezoid
  parallelSide1?: number;
  parallelSide1Unit?: string;
  parallelSide2?: number;
  parallelSide2Unit?: string;
  trapezoidHeight?: number;
  trapezoidHeightUnit?: string;
  // Common
  numberOfRooms?: number;
}

export interface CostEstimateItem {
  label: string;
  value: number;
}

export interface SquareFootageOutput {
  squareFeet: number;
  squareMeters: number;
  squareYards: number;
  acres: number;
  perimeter: number;
  costEstimate: CostEstimateItem[];
}

/** Unit conversion factors: multiply the input value by this factor to get feet. */
const UNIT_TO_FEET: Record<string, number> = {
  ft: 1,
  in: 0.0833333,
  m: 3.28084,
  yd: 3,
};

/**
 * Convert a measurement value to feet based on its unit.
 * @param value - The raw measurement value
 * @param unit - The unit string (ft, in, m, yd)
 * @returns The value converted to feet
 */
function toFeet(value: number, unit: string): number {
  const factor = UNIT_TO_FEET[unit] ?? 1;
  return value * factor;
}

/**
 * Standard geometric area formulas (Euclidean geometry):
 *
 * Rectangle: A = L x W
 * Triangle:  A = 1/2 x b x h
 * Circle:    A = pi x r^2
 * Trapezoid: A = 1/2 x (a + b) x h
 *
 * Unit conversions:
 *   Square meters  = sq ft x 0.092903
 *   Square yards   = sq ft / 9
 *   Acres          = sq ft / 43,560
 *
 * Perimeter formulas:
 *   Rectangle:  P = 2(L + W)
 *   Triangle:   P = a + b + sqrt(a^2 + b^2) (right triangle approximation)
 *   Circle:     C = 2 x pi x r
 *   Trapezoid:  P = a + b + 2h (approximation using height as leg length)
 *
 * Source: Standard Euclidean geometry area formulas.
 *         ANSI Z765-2021 (Measuring standards for residential floor area).
 */
export function calculateSquareFootage(inputs: Record<string, unknown>): Record<string, unknown> {
  const shape = (String(inputs.shape || inputs.activeTab || 'rectangle')) as ShapeType;
  const numberOfRooms = Math.max(1, Math.round(Number(inputs.numberOfRooms) || 1));

  let areaFt = 0;
  let perimeterFt = 0;

  switch (shape) {
    case 'rectangle': {
      const lengthFt = toFeet(
        Number(inputs.length) || 0,
        String(inputs.lengthUnit || 'ft')
      );
      const widthFt = toFeet(
        Number(inputs.width) || 0,
        String(inputs.widthUnit || 'ft')
      );
      areaFt = lengthFt * widthFt;
      perimeterFt = 2 * (lengthFt + widthFt);
      break;
    }

    case 'triangle': {
      const baseFt = toFeet(
        Number(inputs.base) || 0,
        String(inputs.baseUnit || 'ft')
      );
      const heightFt = toFeet(
        Number(inputs.triangleHeight) || 0,
        String(inputs.triangleHeightUnit || 'ft')
      );
      areaFt = 0.5 * baseFt * heightFt;
      // Right triangle approximation: hypotenuse = sqrt(base^2 + height^2)
      const hypotenuse = Math.sqrt(baseFt * baseFt + heightFt * heightFt);
      perimeterFt = baseFt + heightFt + hypotenuse;
      break;
    }

    case 'circle': {
      const radiusFt = toFeet(
        Number(inputs.radius) || 0,
        String(inputs.radiusUnit || 'ft')
      );
      areaFt = Math.PI * radiusFt * radiusFt;
      perimeterFt = 2 * Math.PI * radiusFt;
      break;
    }

    case 'trapezoid': {
      const side1Ft = toFeet(
        Number(inputs.parallelSide1) || 0,
        String(inputs.parallelSide1Unit || 'ft')
      );
      const side2Ft = toFeet(
        Number(inputs.parallelSide2) || 0,
        String(inputs.parallelSide2Unit || 'ft')
      );
      const trapHeightFt = toFeet(
        Number(inputs.trapezoidHeight) || 0,
        String(inputs.trapezoidHeightUnit || 'ft')
      );
      areaFt = 0.5 * (side1Ft + side2Ft) * trapHeightFt;
      // Approximation: parallel sides + 2 * height as leg estimate
      perimeterFt = side1Ft + side2Ft + 2 * trapHeightFt;
      break;
    }

    default: {
      // Default to rectangle if unknown shape
      const lengthFt = toFeet(
        Number(inputs.length) || 0,
        String(inputs.lengthUnit || 'ft')
      );
      const widthFt = toFeet(
        Number(inputs.width) || 0,
        String(inputs.widthUnit || 'ft')
      );
      areaFt = lengthFt * widthFt;
      perimeterFt = 2 * (lengthFt + widthFt);
    }
  }

  // Multiply by number of identical rooms/areas
  const totalAreaFt = areaFt * numberOfRooms;
  const totalPerimeterFt = perimeterFt * numberOfRooms;

  // Unit conversions
  const squareMeters = totalAreaFt * 0.092903;
  const squareYards = totalAreaFt / 9;
  const acres = totalAreaFt / 43560;

  // Cost estimates at common price points per square foot
  const costEstimate: CostEstimateItem[] = [
    { label: 'Budget Flooring (~$3/sq ft)', value: parseFloat((totalAreaFt * 3).toFixed(2)) },
    { label: 'Mid-Range Flooring (~$6/sq ft)', value: parseFloat((totalAreaFt * 6).toFixed(2)) },
    { label: 'Premium Flooring (~$12/sq ft)', value: parseFloat((totalAreaFt * 12).toFixed(2)) },
    { label: 'Interior Painting (~$2/sq ft)', value: parseFloat((totalAreaFt * 2).toFixed(2)) },
    { label: 'Carpet Installation (~$4/sq ft)', value: parseFloat((totalAreaFt * 4).toFixed(2)) },
  ];

  return {
    squareFeet: parseFloat(totalAreaFt.toFixed(2)),
    squareMeters: parseFloat(squareMeters.toFixed(2)),
    squareYards: parseFloat(squareYards.toFixed(2)),
    acres: parseFloat(acres.toFixed(4)),
    perimeter: parseFloat(totalPerimeterFt.toFixed(2)),
    costEstimate,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'square-footage': calculateSquareFootage,
};
