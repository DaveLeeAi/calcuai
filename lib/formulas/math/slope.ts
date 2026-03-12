/**
 * Slope Calculator
 *
 * Given two points (x1, y1) and (x2, y2), calculates:
 *
 *   Slope:       m = (y2 - y1) / (x2 - x1)
 *   Y-intercept: b = y1 - m * x1
 *   Distance:    d = sqrt((x2 - x1)^2 + (y2 - y1)^2)
 *   Angle:       theta = arctan(m) in degrees
 *   Equation:    y = mx + b (slope-intercept form)
 *
 * Source: Euclidean geometry, standard coordinate geometry formulas
 */

export interface SlopeInput {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface SlopeOutput {
  slope: number | null;
  yIntercept: number | null;
  distance: number;
  angle: number | null;
  equation: string;
  midpointX: number;
  midpointY: number;
  deltaX: number;
  deltaY: number;
  isVertical: boolean;
  isHorizontal: boolean;
}

export function calculateSlope(inputs: Record<string, unknown>): Record<string, unknown> {
  const x1 = Number(inputs.x1) || 0;
  const y1 = Number(inputs.y1) || 0;
  const x2 = Number(inputs.x2) || 0;
  const y2 = Number(inputs.y2) || 0;

  const deltaX = x2 - x1;
  const deltaY = y2 - y1;

  // Distance between points (always computable)
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

  // Midpoint
  const midpointX = (x1 + x2) / 2;
  const midpointY = (y1 + y2) / 2;

  // Check for vertical line (undefined slope)
  if (deltaX === 0) {
    return {
      slope: null,
      yIntercept: null,
      distance: parseFloat(distance.toFixed(10)),
      angle: deltaY > 0 ? 90 : deltaY < 0 ? -90 : null,
      equation: `x = ${x1}`,
      midpointX: parseFloat(midpointX.toFixed(10)),
      midpointY: parseFloat(midpointY.toFixed(10)),
      deltaX: 0,
      deltaY: parseFloat(deltaY.toFixed(10)),
      isVertical: true,
      isHorizontal: false,
    };
  }

  const slope = deltaY / deltaX;
  const yIntercept = y1 - slope * x1;

  // Angle in degrees
  const angle = Math.atan(slope) * (180 / Math.PI);

  // Build equation string
  let equation: string;
  const slopeRounded = parseFloat(slope.toFixed(10));
  const interceptRounded = parseFloat(yIntercept.toFixed(10));

  if (slope === 0) {
    equation = `y = ${interceptRounded}`;
  } else if (yIntercept === 0) {
    equation = `y = ${slopeRounded}x`;
  } else if (yIntercept > 0) {
    equation = `y = ${slopeRounded}x + ${interceptRounded}`;
  } else {
    equation = `y = ${slopeRounded}x - ${Math.abs(interceptRounded)}`;
  }

  return {
    slope: parseFloat(slope.toFixed(10)),
    yIntercept: parseFloat(yIntercept.toFixed(10)),
    distance: parseFloat(distance.toFixed(10)),
    angle: parseFloat(angle.toFixed(6)),
    equation,
    midpointX: parseFloat(midpointX.toFixed(10)),
    midpointY: parseFloat(midpointY.toFixed(10)),
    deltaX: parseFloat(deltaX.toFixed(10)),
    deltaY: parseFloat(deltaY.toFixed(10)),
    isVertical: false,
    isHorizontal: slope === 0,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'slope': calculateSlope,
};
