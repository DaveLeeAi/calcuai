/**
 * Frequency Calculator
 *
 * Two modes:
 *   Period:  f = 1 / T   and   T = 1 / f
 *   Wave:   f = v / λ
 *
 * Where:
 *   f = frequency (Hz)
 *   T = period (seconds)
 *   v = wave speed (m/s)
 *   λ = wavelength (m)
 *
 * Source: Heinrich Hertz (1887) experimental confirmation of
 * electromagnetic waves; SI unit hertz (Hz) = 1 cycle/second.
 */

export interface FrequencyInput {
  mode?: string;
  frequency?: number;
  period?: number;
  waveSpeed?: number;
  wavelength?: number;
}

export interface FrequencyOutput {
  frequency: number;
  period: number;
  mode: string;
  allValues: { label: string; value: number; unit: string }[];
  conversions: {
    frequency_kHz: number;
    frequency_MHz: number;
    frequency_GHz: number;
    frequency_rpm: number;
    frequency_rads: number;
    period_ms: number;
    period_us: number;
    period_ns: number;
  };
  breakdown: { step: string; expression: string }[];
}

export function calculateFrequency(inputs: Record<string, unknown>): Record<string, unknown> {
  const mode = inputs.mode !== undefined && inputs.mode !== null && inputs.mode !== ''
    ? String(inputs.mode).toLowerCase()
    : 'period';
  const frequencyIn = inputs.frequency !== undefined && inputs.frequency !== null && inputs.frequency !== ''
    ? Number(inputs.frequency)
    : undefined;
  const period = inputs.period !== undefined && inputs.period !== null && inputs.period !== ''
    ? Number(inputs.period)
    : undefined;
  const waveSpeed = inputs.waveSpeed !== undefined && inputs.waveSpeed !== null && inputs.waveSpeed !== ''
    ? Number(inputs.waveSpeed)
    : undefined;
  const wavelength = inputs.wavelength !== undefined && inputs.wavelength !== null && inputs.wavelength !== ''
    ? Number(inputs.wavelength)
    : undefined;

  if (mode !== 'period' && mode !== 'wave') {
    throw new Error('Mode must be either "period" or "wave".');
  }

  let frequency: number;
  let periodResult: number;
  let allValues: { label: string; value: number; unit: string }[];
  let breakdown: { step: string; expression: string }[];

  if (mode === 'period') {
    // Either frequency or period must be provided
    const hasFrequency = frequencyIn !== undefined && isFinite(frequencyIn) && frequencyIn > 0;
    const hasPeriod = period !== undefined && isFinite(period) && period > 0;

    if (!hasFrequency && !hasPeriod) {
      throw new Error('Enter either frequency (Hz) or period (s).');
    }

    if (hasFrequency) {
      frequency = frequencyIn as number;
      periodResult = 1 / frequency;
      breakdown = [
        { step: 'Formula', expression: 'T = 1 / f' },
        { step: 'Substitute', expression: `T = 1 / ${frequency} Hz` },
        { step: 'Result', expression: `T = ${parseFloat(periodResult.toFixed(10))} s` },
      ];
    } else {
      periodResult = period as number;
      frequency = 1 / periodResult;
      breakdown = [
        { step: 'Formula', expression: 'f = 1 / T' },
        { step: 'Substitute', expression: `f = 1 / ${periodResult} s` },
        { step: 'Result', expression: `f = ${parseFloat(frequency.toFixed(10))} Hz` },
      ];
    }

    allValues = [
      { label: 'Frequency', value: parseFloat(frequency.toFixed(10)), unit: 'Hz' },
      { label: 'Period', value: parseFloat(periodResult.toFixed(10)), unit: 's' },
    ];
  } else {
    // Wave mode: f = v / λ
    if (waveSpeed === undefined || !isFinite(waveSpeed) || waveSpeed <= 0) {
      throw new Error('Wave speed must be a positive number.');
    }
    if (wavelength === undefined || !isFinite(wavelength) || wavelength <= 0) {
      throw new Error('Wavelength must be a positive number.');
    }

    frequency = waveSpeed / wavelength;
    periodResult = 1 / frequency;

    allValues = [
      { label: 'Frequency', value: parseFloat(frequency.toFixed(10)), unit: 'Hz' },
      { label: 'Period', value: parseFloat(periodResult.toFixed(10)), unit: 's' },
      { label: 'Wave Speed', value: waveSpeed, unit: 'm/s' },
      { label: 'Wavelength', value: wavelength, unit: 'm' },
    ];

    breakdown = [
      { step: 'Formula', expression: 'f = v / λ' },
      { step: 'Substitute', expression: `f = ${waveSpeed} m/s / ${wavelength} m` },
      { step: 'Result', expression: `f = ${parseFloat(frequency.toFixed(10))} Hz` },
      { step: 'Period', expression: `T = 1/f = ${parseFloat(periodResult.toFixed(10))} s` },
    ];
  }

  frequency = parseFloat(frequency.toFixed(10));
  periodResult = parseFloat(periodResult.toFixed(10));

  const conversions = {
    frequency_kHz: parseFloat((frequency / 1000).toFixed(6)),
    frequency_MHz: parseFloat((frequency / 1e6).toFixed(6)),
    frequency_GHz: parseFloat((frequency / 1e9).toFixed(6)),
    frequency_rpm: parseFloat((frequency * 60).toFixed(6)),
    frequency_rads: parseFloat((frequency * 2 * Math.PI).toFixed(6)),
    period_ms: parseFloat((periodResult * 1000).toFixed(6)),
    period_us: parseFloat((periodResult * 1e6).toFixed(6)),
    period_ns: parseFloat((periodResult * 1e9).toFixed(6)),
  };

  return {
    frequency,
    period: periodResult,
    mode,
    allValues,
    conversions,
    breakdown,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'frequency': calculateFrequency,
};
