/**
 * Wave Speed Calculator
 *
 * Core formulas (wave speed–frequency–wavelength triad):
 *   v = f × λ    (wave speed = frequency × wavelength)
 *   f = v / λ    (frequency = wave speed / wavelength)
 *   λ = v / f    (wavelength = wave speed / frequency)
 *
 * Given any 2 of the 3 quantities, solves for the unknown third.
 *
 * Source: Christiaan Huygens, Traité de la Lumière (1690);
 * wave equation formalized by Jean le Rond d'Alembert (1747).
 */

export interface WaveSpeedInput {
  waveSpeed?: number;
  frequency?: number;
  wavelength?: number;
}

export interface WaveSpeedOutput {
  waveSpeed: number;
  frequency: number;
  wavelength: number;
  period: number;
  solvedFrom: string;
  allValues: { label: string; value: number; unit: string }[];
  conversions: {
    speed_kmh: number;
    speed_mph: number;
    frequency_kHz: number;
    frequency_MHz: number;
    wavelength_cm: number;
    wavelength_mm: number;
    wavelength_um: number;
    wavelength_nm: number;
    period_ms: number;
  };
}

export function calculateWaveSpeed(inputs: Record<string, unknown>): Record<string, unknown> {
  const waveSpeed = inputs.waveSpeed !== undefined && inputs.waveSpeed !== null && inputs.waveSpeed !== ''
    ? Number(inputs.waveSpeed)
    : undefined;
  const frequency = inputs.frequency !== undefined && inputs.frequency !== null && inputs.frequency !== ''
    ? Number(inputs.frequency)
    : undefined;
  const wavelength = inputs.wavelength !== undefined && inputs.wavelength !== null && inputs.wavelength !== ''
    ? Number(inputs.wavelength)
    : undefined;

  const hasSpeed = waveSpeed !== undefined && isFinite(waveSpeed) && waveSpeed > 0;
  const hasFrequency = frequency !== undefined && isFinite(frequency) && frequency > 0;
  const hasWavelength = wavelength !== undefined && isFinite(wavelength) && wavelength > 0;

  const providedCount = [hasSpeed, hasFrequency, hasWavelength].filter(Boolean).length;

  if (providedCount < 2) {
    throw new Error('Enter any two of: Wave Speed, Frequency, Wavelength.');
  }

  let v: number;
  let f: number;
  let lambda: number;
  let solvedFrom: string;

  if (hasFrequency && hasWavelength) {
    f = frequency as number;
    lambda = wavelength as number;
    v = f * lambda;
    solvedFrom = 'Frequency (f) and Wavelength (λ)';
  } else if (hasSpeed && hasWavelength) {
    v = waveSpeed as number;
    lambda = wavelength as number;
    f = v / lambda;
    solvedFrom = 'Wave Speed (v) and Wavelength (λ)';
  } else if (hasSpeed && hasFrequency) {
    v = waveSpeed as number;
    f = frequency as number;
    lambda = v / f;
    solvedFrom = 'Wave Speed (v) and Frequency (f)';
  } else {
    throw new Error('Could not determine a valid pair of inputs. Provide exactly two positive values.');
  }

  v = parseFloat(v.toFixed(10));
  f = parseFloat(f.toFixed(10));
  lambda = parseFloat(lambda.toFixed(10));
  const period = parseFloat((1 / f).toFixed(10));

  const allValues = [
    { label: 'Wave Speed', value: v, unit: 'm/s' },
    { label: 'Frequency', value: f, unit: 'Hz' },
    { label: 'Wavelength', value: lambda, unit: 'm' },
    { label: 'Period', value: period, unit: 's' },
  ];

  const conversions = {
    speed_kmh: parseFloat((v * 3.6).toFixed(6)),
    speed_mph: parseFloat((v * 2.23694).toFixed(6)),
    frequency_kHz: parseFloat((f / 1000).toFixed(6)),
    frequency_MHz: parseFloat((f / 1e6).toFixed(6)),
    wavelength_cm: parseFloat((lambda * 100).toFixed(6)),
    wavelength_mm: parseFloat((lambda * 1000).toFixed(6)),
    wavelength_um: parseFloat((lambda * 1e6).toFixed(6)),
    wavelength_nm: parseFloat((lambda * 1e9).toFixed(6)),
    period_ms: parseFloat((period * 1000).toFixed(6)),
  };

  return {
    waveSpeed: v,
    frequency: f,
    wavelength: lambda,
    period,
    solvedFrom,
    allValues,
    conversions,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'wave-speed': calculateWaveSpeed,
};
