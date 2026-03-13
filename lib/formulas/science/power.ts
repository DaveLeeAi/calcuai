/**
 * Power Calculator (Mechanical / Physics)
 *
 * Two modes:
 *   Work/Time:       P = W / t
 *   Force/Velocity:  P = F × v
 *
 * Where:
 *   P = power (watts)
 *   W = work or energy (joules)
 *   t = time (seconds)
 *   F = force (newtons)
 *   v = velocity (m/s)
 *
 * Source: James Watt (1782) for the horsepower unit;
 * SI unit watt defined as 1 J/s by the CGPM (1960).
 */

export interface PowerInput {
  mode?: string;
  work?: number;
  time?: number;
  force?: number;
  velocity?: number;
}

export interface PowerOutput {
  power: number;
  mode: string;
  allValues: { label: string; value: number; unit: string }[];
  conversions: {
    power_kW: number;
    power_MW: number;
    power_hp: number;
    power_BTUh: number;
    power_ftlbs: number;
    power_cals: number;
    power_erg_s: number;
  };
  breakdown: { step: string; expression: string }[];
}

export function calculatePower(inputs: Record<string, unknown>): Record<string, unknown> {
  const mode = inputs.mode !== undefined && inputs.mode !== null && inputs.mode !== ''
    ? String(inputs.mode).toLowerCase()
    : 'work-time';
  const work = inputs.work !== undefined && inputs.work !== null && inputs.work !== ''
    ? Number(inputs.work)
    : undefined;
  const time = inputs.time !== undefined && inputs.time !== null && inputs.time !== ''
    ? Number(inputs.time)
    : undefined;
  const force = inputs.force !== undefined && inputs.force !== null && inputs.force !== ''
    ? Number(inputs.force)
    : undefined;
  const velocity = inputs.velocity !== undefined && inputs.velocity !== null && inputs.velocity !== ''
    ? Number(inputs.velocity)
    : undefined;

  if (mode !== 'work-time' && mode !== 'force-velocity') {
    throw new Error('Mode must be either "work-time" or "force-velocity".');
  }

  let power: number;
  let allValues: { label: string; value: number; unit: string }[];
  let breakdown: { step: string; expression: string }[];

  if (mode === 'work-time') {
    if (work === undefined || !isFinite(work) || work < 0) {
      throw new Error('Work/energy is required and must be a non-negative number.');
    }
    if (time === undefined || !isFinite(time) || time <= 0) {
      throw new Error('Time must be a positive number.');
    }

    power = work / time;

    allValues = [
      { label: 'Power', value: parseFloat(power.toFixed(10)), unit: 'W' },
      { label: 'Work', value: work, unit: 'J' },
      { label: 'Time', value: time, unit: 's' },
    ];

    breakdown = [
      { step: 'Formula', expression: 'P = W / t' },
      { step: 'Substitute', expression: `P = ${work} J / ${time} s` },
      { step: 'Result', expression: `P = ${parseFloat(power.toFixed(10))} W` },
    ];
  } else {
    if (force === undefined || !isFinite(force) || force < 0) {
      throw new Error('Force is required and must be a non-negative number.');
    }
    if (velocity === undefined || !isFinite(velocity) || velocity < 0) {
      throw new Error('Velocity is required and must be a non-negative number.');
    }

    power = force * velocity;

    allValues = [
      { label: 'Power', value: parseFloat(power.toFixed(10)), unit: 'W' },
      { label: 'Force', value: force, unit: 'N' },
      { label: 'Velocity', value: velocity, unit: 'm/s' },
    ];

    breakdown = [
      { step: 'Formula', expression: 'P = F × v' },
      { step: 'Substitute', expression: `P = ${force} N × ${velocity} m/s` },
      { step: 'Result', expression: `P = ${parseFloat(power.toFixed(10))} W` },
    ];
  }

  power = parseFloat(power.toFixed(10));

  const conversions = {
    power_kW: parseFloat((power / 1000).toFixed(6)),
    power_MW: parseFloat((power / 1e6).toFixed(6)),
    power_hp: parseFloat((power / 745.7).toFixed(6)),
    power_BTUh: parseFloat((power * 3.41214).toFixed(6)),
    power_ftlbs: parseFloat((power * 0.737562).toFixed(6)),
    power_cals: parseFloat((power / 4.184).toFixed(6)),
    power_erg_s: parseFloat((power * 1e7).toFixed(6)),
  };

  return {
    power,
    mode,
    allValues,
    conversions,
    breakdown,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'power': calculatePower,
};
