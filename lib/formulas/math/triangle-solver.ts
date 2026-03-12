export interface TriangleSolverInput {
  mode: 'sss' | 'sas' | 'aas' | 'asa';
  sideA?: number;
  sideB?: number;
  sideC?: number;
  angleA?: number;  // in degrees
  angleB?: number;  // in degrees
  angleC?: number;  // in degrees
}

export interface TriangleSolverOutput {
  sideA: number;
  sideB: number;
  sideC: number;
  angleA: number;
  angleB: number;
  angleC: number;
  area: number;
  perimeter: number;
  semiperimeter: number;
  triangleType: string;
}

/** Convert degrees to radians */
function toRadians(degrees: number): number {
  return degrees * Math.PI / 180;
}

/** Convert radians to degrees */
function toDegrees(radians: number): number {
  return radians * 180 / Math.PI;
}

/**
 * Classify a triangle by its angles and sides.
 */
function classifyTriangle(
  angleA: number,
  angleB: number,
  angleC: number,
  sideA: number,
  sideB: number,
  sideC: number
): string {
  // Angle classification
  const maxAngle = Math.max(angleA, angleB, angleC);
  let angleType: string;
  if (Math.abs(maxAngle - 90) < 0.01) {
    angleType = 'right';
  } else if (maxAngle > 90) {
    angleType = 'obtuse';
  } else {
    angleType = 'acute';
  }

  // Side classification
  const sides = [
    parseFloat(sideA.toFixed(6)),
    parseFloat(sideB.toFixed(6)),
    parseFloat(sideC.toFixed(6)),
  ];
  let sideType: string;
  if (sides[0] === sides[1] && sides[1] === sides[2]) {
    sideType = 'equilateral';
  } else if (sides[0] === sides[1] || sides[1] === sides[2] || sides[0] === sides[2]) {
    sideType = 'isosceles';
  } else {
    sideType = 'scalene';
  }

  return `${angleType} ${sideType}`;
}

/**
 * Triangle solver using the Law of Cosines and Law of Sines.
 *
 * Law of Cosines:
 *   c^2 = a^2 + b^2 - 2ab * cos(C)
 *   cos(A) = (b^2 + c^2 - a^2) / (2bc)
 *
 * Law of Sines:
 *   a / sin(A) = b / sin(B) = c / sin(C)
 *
 * Heron's Formula for area (SSS):
 *   s = (a + b + c) / 2
 *   Area = sqrt(s * (s-a) * (s-b) * (s-c))
 *
 * Area from two sides and included angle:
 *   Area = 0.5 * a * b * sin(C)
 *
 * Supports four modes:
 *   SSS — 3 sides given
 *   SAS — 2 sides and the included angle given
 *   AAS — 2 angles and a non-included side given
 *   ASA — 2 angles and the included side given
 *
 * Source: Law of cosines and law of sines — fundamental trigonometric identities.
 * Heron's formula attributed to Heron of Alexandria (1st century AD),
 * documented in "Metrica" (c. 60 AD).
 */
export function calculateTriangle(inputs: Record<string, unknown>): Record<string, unknown> {
  const mode = String(inputs.mode || 'sss');

  switch (mode) {
    case 'sss':
      return solveSSS(inputs);
    case 'sas':
      return solveSAS(inputs);
    case 'aas':
      return solveAAS(inputs);
    case 'asa':
      return solveASA(inputs);
    default:
      throw new Error(`Unknown triangle mode: ${mode}. Expected "sss", "sas", "aas", or "asa".`);
  }
}

/**
 * SSS: Given three sides, find all angles and area.
 * Uses law of cosines to find each angle.
 * Uses Heron's formula for area.
 */
function solveSSS(inputs: Record<string, unknown>): Record<string, unknown> {
  const a = Number(inputs.sideA);
  const b = Number(inputs.sideB);
  const c = Number(inputs.sideC);

  // Validate positive sides
  if (a <= 0 || b <= 0 || c <= 0) {
    return { error: 'All sides must be positive numbers.' };
  }

  // Validate triangle inequality
  if (a + b <= c || a + c <= b || b + c <= a) {
    return { error: 'Invalid triangle: the sum of any two sides must be greater than the third side.' };
  }

  // Law of cosines to find angles
  const cosA = (b * b + c * c - a * a) / (2 * b * c);
  const cosB = (a * a + c * c - b * b) / (2 * a * c);
  const cosC = (a * a + b * b - c * c) / (2 * a * b);

  const angleA = toDegrees(Math.acos(Math.max(-1, Math.min(1, cosA))));
  const angleB = toDegrees(Math.acos(Math.max(-1, Math.min(1, cosB))));
  const angleC = toDegrees(Math.acos(Math.max(-1, Math.min(1, cosC))));

  // Heron's formula for area
  const s = (a + b + c) / 2;
  const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
  const perimeter = a + b + c;

  const triangleType = classifyTriangle(angleA, angleB, angleC, a, b, c);

  return {
    sideA: parseFloat(a.toFixed(6)),
    sideB: parseFloat(b.toFixed(6)),
    sideC: parseFloat(c.toFixed(6)),
    angleA: parseFloat(angleA.toFixed(6)),
    angleB: parseFloat(angleB.toFixed(6)),
    angleC: parseFloat(angleC.toFixed(6)),
    area: parseFloat(area.toFixed(6)),
    perimeter: parseFloat(perimeter.toFixed(6)),
    semiperimeter: parseFloat(s.toFixed(6)),
    triangleType,
  };
}

/**
 * SAS: Given two sides and the included angle, find the third side and remaining angles.
 * Uses law of cosines for the third side, then law of sines for remaining angles.
 */
function solveSAS(inputs: Record<string, unknown>): Record<string, unknown> {
  const a = Number(inputs.sideA);
  const b = Number(inputs.sideB);
  const C = Number(inputs.angleC); // included angle between sides a and b

  if (a <= 0 || b <= 0) {
    return { error: 'Both sides must be positive numbers.' };
  }

  if (C <= 0 || C >= 180) {
    return { error: 'The included angle must be between 0 and 180 degrees (exclusive).' };
  }

  const Crad = toRadians(C);

  // Law of cosines: c^2 = a^2 + b^2 - 2ab*cos(C)
  const cSquared = a * a + b * b - 2 * a * b * Math.cos(Crad);
  const c = Math.sqrt(cSquared);

  // Law of cosines to find angle A
  const cosA = (b * b + c * c - a * a) / (2 * b * c);
  const angleA = toDegrees(Math.acos(Math.max(-1, Math.min(1, cosA))));

  // Angle B = 180 - A - C
  const angleB = 180 - angleA - C;

  // Area = 0.5 * a * b * sin(C)
  const area = 0.5 * a * b * Math.sin(Crad);
  const perimeter = a + b + c;
  const s = perimeter / 2;

  const triangleType = classifyTriangle(angleA, angleB, C, a, b, c);

  return {
    sideA: parseFloat(a.toFixed(6)),
    sideB: parseFloat(b.toFixed(6)),
    sideC: parseFloat(c.toFixed(6)),
    angleA: parseFloat(angleA.toFixed(6)),
    angleB: parseFloat(angleB.toFixed(6)),
    angleC: parseFloat(C.toFixed(6)),
    area: parseFloat(area.toFixed(6)),
    perimeter: parseFloat(perimeter.toFixed(6)),
    semiperimeter: parseFloat(s.toFixed(6)),
    triangleType,
  };
}

/**
 * AAS: Given two angles and a non-included side.
 * The third angle = 180 - A - B, then law of sines for remaining sides.
 * Convention: angleA and angleB are given, sideA is the known side (opposite angleA).
 */
function solveAAS(inputs: Record<string, unknown>): Record<string, unknown> {
  const A = Number(inputs.angleA);
  const B = Number(inputs.angleB);
  const a = Number(inputs.sideA);

  if (A <= 0 || B <= 0) {
    return { error: 'Both angles must be positive.' };
  }

  if (A + B >= 180) {
    return { error: 'The sum of two angles must be less than 180 degrees.' };
  }

  if (a <= 0) {
    return { error: 'The side must be a positive number.' };
  }

  const C = 180 - A - B;

  const Arad = toRadians(A);
  const Brad = toRadians(B);
  const Crad = toRadians(C);

  // Law of sines: a/sin(A) = b/sin(B) = c/sin(C)
  const ratio = a / Math.sin(Arad);
  const b = ratio * Math.sin(Brad);
  const c = ratio * Math.sin(Crad);

  // Area = 0.5 * b * c * sin(A), or use any pair
  const area = 0.5 * b * c * Math.sin(Arad);
  const perimeter = a + b + c;
  const s = perimeter / 2;

  const triangleType = classifyTriangle(A, B, C, a, b, c);

  return {
    sideA: parseFloat(a.toFixed(6)),
    sideB: parseFloat(b.toFixed(6)),
    sideC: parseFloat(c.toFixed(6)),
    angleA: parseFloat(A.toFixed(6)),
    angleB: parseFloat(B.toFixed(6)),
    angleC: parseFloat(C.toFixed(6)),
    area: parseFloat(area.toFixed(6)),
    perimeter: parseFloat(perimeter.toFixed(6)),
    semiperimeter: parseFloat(s.toFixed(6)),
    triangleType,
  };
}

/**
 * ASA: Given two angles and the included side.
 * The third angle = 180 - A - B, then law of sines for remaining sides.
 * Convention: angleA and angleB are given, sideC is the included side (between A and B).
 */
function solveASA(inputs: Record<string, unknown>): Record<string, unknown> {
  const A = Number(inputs.angleA);
  const B = Number(inputs.angleB);
  const c = Number(inputs.sideC);

  if (A <= 0 || B <= 0) {
    return { error: 'Both angles must be positive.' };
  }

  if (A + B >= 180) {
    return { error: 'The sum of two angles must be less than 180 degrees.' };
  }

  if (c <= 0) {
    return { error: 'The side must be a positive number.' };
  }

  const C = 180 - A - B;

  const Arad = toRadians(A);
  const Brad = toRadians(B);
  const Crad = toRadians(C);

  // Law of sines: c/sin(C) = a/sin(A) = b/sin(B)
  const ratio = c / Math.sin(Crad);
  const a = ratio * Math.sin(Arad);
  const b = ratio * Math.sin(Brad);

  // Area = 0.5 * a * b * sin(C)
  const area = 0.5 * a * b * Math.sin(Crad);
  const perimeter = a + b + c;
  const s = perimeter / 2;

  const triangleType = classifyTriangle(A, B, C, a, b, c);

  return {
    sideA: parseFloat(a.toFixed(6)),
    sideB: parseFloat(b.toFixed(6)),
    sideC: parseFloat(c.toFixed(6)),
    angleA: parseFloat(A.toFixed(6)),
    angleB: parseFloat(B.toFixed(6)),
    angleC: parseFloat(C.toFixed(6)),
    area: parseFloat(area.toFixed(6)),
    perimeter: parseFloat(perimeter.toFixed(6)),
    semiperimeter: parseFloat(s.toFixed(6)),
    triangleType,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'triangle-solver': calculateTriangle,
};
