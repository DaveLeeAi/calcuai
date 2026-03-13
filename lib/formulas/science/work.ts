/**
 * Work Calculator
 *
 * Core formula:
 *   W = F × d × cos(θ)
 *
 * Where:
 *   W = work (joules)
 *   F = force (newtons)
 *   d = displacement (meters)
 *   θ = angle between force and displacement (degrees)
 *
 * When θ = 0° (default), work reduces to W = F × d.
 * When θ = 90°, work = 0 (force perpendicular to motion).
 *
 * Source: Gaspard-Gustave de Coriolis, Du calcul de l'effet des
 * machines (1829), first formal definition of mechanical work.
 */

export interface WorkInput {
  force?: number;
  distance?: number;
  angle?: number;
}

export interface WorkOutput {
  work: number;
  force: number;
  distance: number;
  angle: number;
  effectiveForce: number;
  allValues: { label: string; value: number; unit: string }[];
  conversions: {
    work_kJ: number;
    work_cal: number;
    work_kcal: number;
    work_kWh: number;
    work_BTU: number;
    work_eV: number;
    work_ftlb: number;
  };
  breakdown: { step: string; expression: string }[];
}

export function calculateWork(inputs: Record<string, unknown>): Record<string, unknown> {
  const force = inputs.force !== undefined && inputs.force !== null && inputs.force !== ''
    ? Number(inputs.force)
    : undefined;
  const distance = inputs.distance !== undefined && inputs.distance !== null && inputs.distance !== ''
    ? Number(inputs.distance)
    : undefined;
  const angleRaw = inputs.angle !== undefined && inputs.angle !== null && inputs.angle !== ''
    ? Number(inputs.angle)
    : 0;

  if (force === undefined || !isFinite(force) || force < 0) {
    throw new Error('Force is required and must be a non-negative number.');
  }
  if (distance === undefined || !isFinite(distance) || distance < 0) {
    throw new Error('Distance is required and must be a non-negative number.');
  }
  if (!isFinite(angleRaw) || angleRaw < 0 || angleRaw > 180) {
    throw new Error('Angle must be between 0 and 180 degrees.');
  }

  const angle = angleRaw;
  const angleRadians = (angle * Math.PI) / 180;
  const cosTheta = Math.cos(angleRadians);
  const effectiveForce = parseFloat((force * cosTheta).toFixed(10));
  let work = force * distance * cosTheta;

  work = parseFloat(work.toFixed(10));

  const allValues = [
    { label: 'Work', value: work, unit: 'J' },
    { label: 'Force', value: force, unit: 'N' },
    { label: 'Distance', value: distance, unit: 'm' },
    { label: 'Angle', value: angle, unit: '°' },
    { label: 'Effective Force', value: parseFloat(effectiveForce.toFixed(10)), unit: 'N' },
  ];

  const conversions = {
    work_kJ: parseFloat((work / 1000).toFixed(6)),
    work_cal: parseFloat((work / 4.184).toFixed(6)),
    work_kcal: parseFloat((work / 4184).toFixed(6)),
    work_kWh: parseFloat((work / 3600000).toFixed(6)),
    work_BTU: parseFloat((work / 1055.06).toFixed(6)),
    work_eV: parseFloat((work / 1.602e-19).toFixed(6)),
    work_ftlb: parseFloat((work / 1.35582).toFixed(6)),
  };

  const breakdown = angle === 0
    ? [
        { step: 'Formula', expression: 'W = F × d (angle = 0°, cos(0°) = 1)' },
        { step: 'Substitute', expression: `W = ${force} N × ${distance} m` },
        { step: 'Result', expression: `W = ${work} J` },
      ]
    : [
        { step: 'Formula', expression: 'W = F × d × cos(θ)' },
        { step: 'Convert angle', expression: `θ = ${angle}°, cos(${angle}°) = ${parseFloat(cosTheta.toFixed(6))}` },
        { step: 'Effective force', expression: `F_eff = ${force} × ${parseFloat(cosTheta.toFixed(6))} = ${parseFloat(effectiveForce.toFixed(4))} N` },
        { step: 'Substitute', expression: `W = ${force} N × ${distance} m × ${parseFloat(cosTheta.toFixed(6))}` },
        { step: 'Result', expression: `W = ${work} J` },
      ];

  return {
    work,
    force,
    distance,
    angle,
    effectiveForce: parseFloat(effectiveForce.toFixed(10)),
    allValues,
    conversions,
    breakdown,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'work': calculateWork,
};
