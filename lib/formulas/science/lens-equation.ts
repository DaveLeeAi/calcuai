/**
 * Lens Equation Calculator — Thin Lens Formula
 *
 * Core formula:
 *   1/f = 1/do + 1/di
 *   Magnification: M = -di / do
 *
 * Where:
 *   f  = focal length (cm) — positive for converging, negative for diverging
 *   do = object distance (cm) — must be positive for real objects
 *   di = image distance (cm) — positive for real image, negative for virtual
 *   M  = magnification — negative means inverted, |M| > 1 means enlarged
 *
 * 3-way solver: given any two of f, do, di, solves for the third.
 *
 * Source: Gauss thin lens equation; Rene Descartes, Dioptrique (1637).
 */

export interface LensEquationInput {
  focalLength?: number;
  objectDistance?: number;
  imageDistance?: number;
}

export interface LensEquationOutput {
  focalLength: number;
  objectDistance: number;
  imageDistance: number;
  magnification: number;
  imageType: string;
  imageOrientation: string;
  imageSize: string;
  solvedFrom: string;
  allValues: { label: string; value: number | string; unit: string }[];
  conversions: {
    focalLength_mm: number;
    focalLength_m: number;
    focalLength_in: number;
    objectDistance_mm: number;
    objectDistance_m: number;
    imageDistance_mm: number;
    imageDistance_m: number;
    lensPower_diopters: number;
  };
}

export function calculateLensEquation(inputs: Record<string, unknown>): Record<string, unknown> {
  const focalLength = inputs.focalLength !== undefined && inputs.focalLength !== null && inputs.focalLength !== ''
    ? Number(inputs.focalLength)
    : undefined;
  const objectDistance = inputs.objectDistance !== undefined && inputs.objectDistance !== null && inputs.objectDistance !== ''
    ? Number(inputs.objectDistance)
    : undefined;
  const imageDistance = inputs.imageDistance !== undefined && inputs.imageDistance !== null && inputs.imageDistance !== ''
    ? Number(inputs.imageDistance)
    : undefined;

  // Focal length can be negative (diverging lens); object distance must be positive; image distance can be negative (virtual)
  const hasFocal = focalLength !== undefined && isFinite(focalLength) && focalLength !== 0;
  const hasObject = objectDistance !== undefined && isFinite(objectDistance) && objectDistance > 0;
  const hasImage = imageDistance !== undefined && isFinite(imageDistance) && imageDistance !== 0;

  const providedCount = [hasFocal, hasObject, hasImage].filter(Boolean).length;

  if (providedCount < 2) {
    throw new Error('Enter any two of: Focal Length, Object Distance, Image Distance.');
  }

  let f: number;
  let dO: number;
  let dI: number;
  let solvedFrom: string;

  if (hasObject && hasImage) {
    // Solve for focal length: 1/f = 1/do + 1/di
    dO = objectDistance as number;
    dI = imageDistance as number;
    f = (dO * dI) / (dO + dI);
    solvedFrom = 'Object Distance and Image Distance';
  } else if (hasFocal && hasObject) {
    // Solve for image distance: 1/di = 1/f - 1/do
    f = focalLength as number;
    dO = objectDistance as number;
    const invDi = (1 / f) - (1 / dO);
    if (Math.abs(invDi) < 1e-15) {
      throw new Error('Object is at the focal point — image forms at infinity.');
    }
    dI = 1 / invDi;
    solvedFrom = 'Focal Length and Object Distance';
  } else if (hasFocal && hasImage) {
    // Solve for object distance: 1/do = 1/f - 1/di
    f = focalLength as number;
    dI = imageDistance as number;
    const invDo = (1 / f) - (1 / dI);
    if (invDo <= 0) {
      throw new Error('No valid positive object distance exists for these values.');
    }
    dO = 1 / invDo;
    solvedFrom = 'Focal Length and Image Distance';
  } else {
    throw new Error('Could not determine a valid pair of inputs.');
  }

  f = parseFloat(f.toFixed(10));
  dO = parseFloat(dO.toFixed(10));
  dI = parseFloat(dI.toFixed(10));

  // Magnification
  const magnification = parseFloat((-dI / dO).toFixed(10));

  // Image characteristics
  const imageType = dI > 0 ? 'Real' : 'Virtual';
  const imageOrientation = magnification < 0 ? 'Inverted' : 'Upright';
  const absMag = Math.abs(magnification);
  let imageSize: string;
  if (Math.abs(absMag - 1) < 0.001) {
    imageSize = 'Same size as object';
  } else if (absMag > 1) {
    imageSize = `Enlarged (${absMag.toFixed(2)}x)`;
  } else {
    imageSize = `Reduced (${absMag.toFixed(2)}x)`;
  }

  const imageTypeFull = `${imageType}, ${imageOrientation}`;

  const allValues: { label: string; value: number | string; unit: string }[] = [
    { label: 'Focal Length', value: f, unit: 'cm' },
    { label: 'Object Distance', value: dO, unit: 'cm' },
    { label: 'Image Distance', value: dI, unit: 'cm' },
    { label: 'Magnification', value: magnification, unit: 'x' },
    { label: 'Image Type', value: imageTypeFull, unit: '' },
    { label: 'Image Size', value: imageSize, unit: '' },
  ];

  // Convert focal length in cm to meters for diopter calculation
  const fMeters = f / 100;
  const lensPower = fMeters !== 0 ? parseFloat((1 / fMeters).toFixed(6)) : 0;

  const conversions = {
    focalLength_mm: parseFloat((f * 10).toFixed(6)),
    focalLength_m: parseFloat((f / 100).toFixed(6)),
    focalLength_in: parseFloat((f / 2.54).toFixed(6)),
    objectDistance_mm: parseFloat((dO * 10).toFixed(6)),
    objectDistance_m: parseFloat((dO / 100).toFixed(6)),
    imageDistance_mm: parseFloat((dI * 10).toFixed(6)),
    imageDistance_m: parseFloat((dI / 100).toFixed(6)),
    lensPower_diopters: lensPower,
  };

  return {
    focalLength: f,
    objectDistance: dO,
    imageDistance: dI,
    magnification,
    imageType: imageTypeFull,
    imageOrientation,
    imageSize,
    solvedFrom,
    allValues,
    conversions,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'lens-equation': calculateLensEquation,
};
