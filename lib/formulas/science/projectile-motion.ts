/**
 * Projectile Motion Calculator
 *
 * Core formulas (2D projectile with initial height):
 *   Horizontal range:    R = vx * T
 *   Maximum height:      H = h0 + (v0 * sin(θ))² / (2g)
 *   Time of flight:      T = (v0*sin(θ) + √((v0*sin(θ))² + 2*g*h0)) / g
 *   Impact velocity:     v_impact = √(vx² + vy_final²)
 *   Position at time t:  x(t) = v0*cos(θ)*t, y(t) = h0 + v0*sin(θ)*t - ½*g*t²
 *
 * Where:
 *   v0 = initial velocity (m/s)
 *   θ  = launch angle (degrees, converted to radians)
 *   h0 = initial height (m)
 *   g  = gravitational acceleration (m/s², default 9.80665)
 *
 * Source: Halliday, Resnick & Walker, "Fundamentals of Physics" (12th ed.);
 *         NASA projectile motion reference.
 */

export interface ProjectileMotionInput {
  initialVelocity: number;
  launchAngle: number;
  initialHeight?: number;
  gravity?: number;
}

export interface TrajectoryPoint {
  x: number;
  y: number;
  t: number;
}

export interface ProjectileMotionOutput {
  range: number;
  maxHeight: number;
  timeOfFlight: number;
  impactVelocity: number;
  horizontalVelocity: number;
  verticalVelocityInitial: number;
  verticalVelocityFinal: number;
  trajectoryData: TrajectoryPoint[];
  allValues: { label: string; value: number; unit: string }[];
}

/**
 * Calculates projectile motion parameters including range, max height,
 * time of flight, impact velocity, and a trajectory curve (50 points).
 */
export function calculateProjectileMotion(inputs: Record<string, unknown>): Record<string, unknown> {
  const v0 = Math.max(0, Number(inputs.initialVelocity) || 0);
  const angleDeg = Math.max(0, Math.min(90, Number(inputs.launchAngle) || 0));
  const h0 = Math.max(0, Number(inputs.initialHeight) || 0);
  const g = Math.max(0.1, Number(inputs.gravity) || 9.80665);

  if (v0 === 0 && h0 === 0) {
    return {
      range: 0,
      maxHeight: 0,
      timeOfFlight: 0,
      impactVelocity: 0,
      horizontalVelocity: 0,
      verticalVelocityInitial: 0,
      verticalVelocityFinal: 0,
      trajectoryData: [{ x: 0, y: 0, t: 0 }],
      allValues: [
        { label: 'Range', value: 0, unit: 'm' },
        { label: 'Maximum Height', value: 0, unit: 'm' },
        { label: 'Time of Flight', value: 0, unit: 's' },
        { label: 'Impact Velocity', value: 0, unit: 'm/s' },
      ],
    };
  }

  // Convert angle to radians
  const thetaRad = angleDeg * (Math.PI / 180);

  // Velocity components
  const vx = v0 * Math.cos(thetaRad);
  const vy0 = v0 * Math.sin(thetaRad);

  // Time of flight: solve h0 + vy0*t - 0.5*g*t² = 0 for t > 0
  // Using quadratic formula: -0.5*g*t² + vy0*t + h0 = 0
  // t = (vy0 + sqrt(vy0² + 2*g*h0)) / g
  const discriminant = vy0 * vy0 + 2 * g * h0;
  const T = (vy0 + Math.sqrt(discriminant)) / g;

  // Range = horizontal velocity × time of flight
  const R = vx * T;

  // Maximum height = initial height + (vy0²) / (2g)
  const H = h0 + (vy0 * vy0) / (2 * g);

  // Final vertical velocity at impact: vy_final = vy0 - g*T
  const vyFinal = vy0 - g * T;

  // Impact velocity = sqrt(vx² + vyFinal²)
  const vImpact = Math.sqrt(vx * vx + vyFinal * vyFinal);

  // Generate 50 trajectory points from t=0 to t=T
  const numPoints = 50;
  const trajectoryData: TrajectoryPoint[] = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = (i / numPoints) * T;
    const x = parseFloat((vx * t).toFixed(2));
    const y = parseFloat((h0 + vy0 * t - 0.5 * g * t * t).toFixed(2));
    trajectoryData.push({
      x,
      y: Math.max(0, y), // Clamp to ground level
      t: parseFloat(t.toFixed(4)),
    });
  }

  const range = parseFloat(R.toFixed(2));
  const maxHeight = parseFloat(H.toFixed(2));
  const timeOfFlight = parseFloat(T.toFixed(2));
  const impactVelocity = parseFloat(vImpact.toFixed(2));
  const horizontalVelocity = parseFloat(vx.toFixed(2));
  const verticalVelocityInitial = parseFloat(vy0.toFixed(2));
  const verticalVelocityFinal = parseFloat(vyFinal.toFixed(2));

  const allValues = [
    { label: 'Range', value: range, unit: 'm' },
    { label: 'Maximum Height', value: maxHeight, unit: 'm' },
    { label: 'Time of Flight', value: timeOfFlight, unit: 's' },
    { label: 'Impact Velocity', value: impactVelocity, unit: 'm/s' },
    { label: 'Horizontal Velocity', value: horizontalVelocity, unit: 'm/s' },
    { label: 'Initial Vertical Velocity', value: verticalVelocityInitial, unit: 'm/s' },
    { label: 'Final Vertical Velocity', value: verticalVelocityFinal, unit: 'm/s' },
  ];

  return {
    range,
    maxHeight,
    timeOfFlight,
    impactVelocity,
    horizontalVelocity,
    verticalVelocityInitial,
    verticalVelocityFinal,
    trajectoryData,
    allValues,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'projectile-motion': calculateProjectileMotion,
};
