/**
 * Velocity / Speed Calculator
 *
 * Core formulas (distance–speed–time triangle):
 *   v = d / t    (speed = distance / time)
 *   d = v × t    (distance = speed × time)
 *   t = d / v    (time = distance / speed)
 *
 * Given any 2 of the 3 quantities (Speed, Distance, Time),
 * this function solves for the unknown third value.
 *
 * Source: Classical mechanics — Galileo Galilei, "Discorsi e
 * dimostrazioni matematiche intorno a due nuove scienze" (1638).
 */

export interface VelocityInput {
  speed?: number;
  distance?: number;
  time?: number;
}

export interface VelocityOutput {
  speed: number;
  distance: number;
  time: number;
  solvedFrom: string;
  allValues: { label: string; value: number; unit: string }[];
  conversions: {
    speed_kmh: number;
    speed_mph: number;
    speed_fps: number;
    speed_knots: number;
    distance_km: number;
    distance_mi: number;
    distance_ft: number;
    time_min: number;
    time_hr: number;
  };
}

/**
 * Determines which two of the three kinematic quantities are provided
 * (defined, numeric, and > 0), solves for the third using the
 * appropriate formula, and returns all three values along with
 * unit conversions and metadata.
 *
 * The 3 valid input combinations:
 *   v + d → t = d / v
 *   v + t → d = v × t
 *   d + t → v = d / t
 */
export function calculateVelocity(inputs: Record<string, unknown>): Record<string, unknown> {
  const speed = inputs.speed !== undefined && inputs.speed !== null && inputs.speed !== ''
    ? Number(inputs.speed)
    : undefined;
  const distance = inputs.distance !== undefined && inputs.distance !== null && inputs.distance !== ''
    ? Number(inputs.distance)
    : undefined;
  const time = inputs.time !== undefined && inputs.time !== null && inputs.time !== ''
    ? Number(inputs.time)
    : undefined;

  // Identify which values are provided (finite and > 0)
  const hasSpeed = speed !== undefined && isFinite(speed) && speed > 0;
  const hasDistance = distance !== undefined && isFinite(distance) && distance > 0;
  const hasTime = time !== undefined && isFinite(time) && time > 0;

  const providedCount = [hasSpeed, hasDistance, hasTime].filter(Boolean).length;

  if (providedCount < 2) {
    throw new Error(
      'Enter any two of: Speed, Distance, Time.'
    );
  }

  let v: number;
  let d: number;
  let t: number;
  let solvedFrom: string;

  // Solve based on which two inputs are provided.
  // When more than 2 are provided, use the first valid pair in priority order.
  if (hasSpeed && hasDistance) {
    v = speed as number;
    d = distance as number;
    t = d / v;
    solvedFrom = 'Speed (v) and Distance (d)';
  } else if (hasSpeed && hasTime) {
    v = speed as number;
    t = time as number;
    d = v * t;
    solvedFrom = 'Speed (v) and Time (t)';
  } else if (hasDistance && hasTime) {
    d = distance as number;
    t = time as number;
    v = d / t;
    solvedFrom = 'Distance (d) and Time (t)';
  } else {
    throw new Error(
      'Could not determine a valid pair of inputs. Provide exactly two positive values.'
    );
  }

  // Round to avoid floating-point display artifacts
  v = parseFloat(v.toFixed(10));
  d = parseFloat(d.toFixed(10));
  t = parseFloat(t.toFixed(10));

  const allValues = [
    { label: 'Speed', value: v, unit: 'm/s' },
    { label: 'Distance', value: d, unit: 'm' },
    { label: 'Time', value: t, unit: 's' },
  ];

  const conversions = {
    speed_kmh: parseFloat((v * 3.6).toFixed(6)),
    speed_mph: parseFloat((v * 2.23694).toFixed(6)),
    speed_fps: parseFloat((v * 3.28084).toFixed(6)),
    speed_knots: parseFloat((v * 1.94384).toFixed(6)),
    distance_km: parseFloat((d / 1000).toFixed(6)),
    distance_mi: parseFloat((d / 1609.344).toFixed(6)),
    distance_ft: parseFloat((d * 3.28084).toFixed(6)),
    time_min: parseFloat((t / 60).toFixed(6)),
    time_hr: parseFloat((t / 3600).toFixed(6)),
  };

  return {
    speed: v,
    distance: d,
    time: t,
    solvedFrom,
    allValues,
    conversions,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'velocity': calculateVelocity,
};
