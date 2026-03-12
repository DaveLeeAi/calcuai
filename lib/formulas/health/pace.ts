export interface PaceInput {
  calculationMode: 'findPace' | 'findTime' | 'findDistance';
  distance?: number;
  distanceUnit?: 'miles' | 'kilometers';
  hours?: number;
  minutes?: number;
  seconds?: number;
  paceMinutes?: number;
  paceSeconds?: number;
  paceUnit?: 'min/mile' | 'min/km';
}

export interface SplitTime {
  raceName: string;
  distanceMiles: number;
  distanceKm: number;
  finishTime: string;
  finishTimeSeconds: number;
}

export interface PaceOutput {
  pace: string;
  pacePerMile: number;
  pacePerKm: number;
  pacePerMileFormatted: string;
  pacePerKmFormatted: string;
  finishTime: string;
  finishTimeSeconds: number;
  distance: number;
  distanceUnit: string;
  speedMph: number;
  speedKph: number;
  speed: { label: string; value: number }[];
  paceConversion: { label: string; value: string }[];
  splitTimes: SplitTime[];
}

const MILES_PER_KM = 0.621371;
const KM_PER_MILE = 1.60934;

const RACE_DISTANCES: { name: string; miles: number; km: number }[] = [
  { name: '1 Mile', miles: 1, km: 1.60934 },
  { name: '1 Kilometer', miles: 0.621371, km: 1 },
  { name: '5K', miles: 3.10686, km: 5 },
  { name: '10K', miles: 6.21371, km: 10 },
  { name: 'Half Marathon', miles: 13.1094, km: 21.0975 },
  { name: 'Marathon', miles: 26.2188, km: 42.195 },
];

/**
 * Pace Calculator for running and walking
 *
 * Three calculation modes:
 *
 * findPace: pace = totalTime / distance
 *   pace (seconds per unit) = total seconds / distance in chosen unit
 *
 * findTime: time = pace * distance
 *   total seconds = pace (seconds per unit) * distance in matching unit
 *
 * findDistance: distance = totalTime / pace
 *   distance = total seconds / pace (seconds per unit)
 *
 * Speed conversions:
 *   speed (mph) = 3600 / pacePerMile (seconds)
 *   speed (kph) = 3600 / pacePerKm (seconds)
 *
 * Pace conversions:
 *   pacePerKm = pacePerMile / KM_PER_MILE
 *   pacePerMile = pacePerKm * KM_PER_MILE
 *
 * Source: American College of Sports Medicine (ACSM).
 * "ACSM's Guidelines for Exercise Testing and Prescription" (11th ed., 2022).
 */
export function calculatePace(input: PaceInput): PaceOutput {
  let pacePerMile: number; // seconds per mile
  let pacePerKm: number; // seconds per km
  let finishTimeSeconds: number;
  let distance: number;
  let distanceUnit: string;

  if (input.calculationMode === 'findPace') {
    // Given: distance + time → find pace
    distance = input.distance ?? 0;
    distanceUnit = input.distanceUnit ?? 'miles';
    const totalSeconds = (input.hours ?? 0) * 3600 + (input.minutes ?? 0) * 60 + (input.seconds ?? 0);
    finishTimeSeconds = totalSeconds;

    if (distance <= 0) {
      throw new Error('Distance must be greater than zero');
    }

    if (distanceUnit === 'miles') {
      pacePerMile = totalSeconds / distance;
      pacePerKm = pacePerMile / KM_PER_MILE;
    } else {
      pacePerKm = totalSeconds / distance;
      pacePerMile = pacePerKm * KM_PER_MILE;
    }
  } else if (input.calculationMode === 'findTime') {
    // Given: distance + pace → find time
    distance = input.distance ?? 0;
    distanceUnit = input.distanceUnit ?? 'miles';
    const paceUnit = input.paceUnit ?? 'min/mile';
    const paceInSeconds = (input.paceMinutes ?? 0) * 60 + (input.paceSeconds ?? 0);

    if (paceInSeconds <= 0) {
      throw new Error('Pace must be greater than zero');
    }

    if (paceUnit === 'min/mile') {
      pacePerMile = paceInSeconds;
      pacePerKm = pacePerMile / KM_PER_MILE;
    } else {
      pacePerKm = paceInSeconds;
      pacePerMile = pacePerKm * KM_PER_MILE;
    }

    // Calculate finish time based on distance in the pace unit
    if (distanceUnit === 'miles') {
      if (paceUnit === 'min/mile') {
        finishTimeSeconds = pacePerMile * distance;
      } else {
        // Convert distance to km, then multiply by pace per km
        finishTimeSeconds = pacePerKm * (distance * KM_PER_MILE);
      }
    } else {
      if (paceUnit === 'min/km') {
        finishTimeSeconds = pacePerKm * distance;
      } else {
        // Convert distance to miles, then multiply by pace per mile
        finishTimeSeconds = pacePerMile * (distance * MILES_PER_KM);
      }
    }
  } else {
    // findDistance: Given: time + pace → find distance
    const totalSeconds = (input.hours ?? 0) * 3600 + (input.minutes ?? 0) * 60 + (input.seconds ?? 0);
    finishTimeSeconds = totalSeconds;
    distanceUnit = input.distanceUnit ?? 'miles';
    const paceUnit = input.paceUnit ?? 'min/mile';
    const paceInSeconds = (input.paceMinutes ?? 0) * 60 + (input.paceSeconds ?? 0);

    if (paceInSeconds <= 0) {
      throw new Error('Pace must be greater than zero');
    }

    if (paceUnit === 'min/mile') {
      pacePerMile = paceInSeconds;
      pacePerKm = pacePerMile / KM_PER_MILE;
    } else {
      pacePerKm = paceInSeconds;
      pacePerMile = pacePerKm * KM_PER_MILE;
    }

    // Calculate distance in the requested unit
    if (distanceUnit === 'miles') {
      distance = totalSeconds / pacePerMile;
    } else {
      distance = totalSeconds / pacePerKm;
    }
  }

  // Speed calculations
  const speedMph = pacePerMile > 0 ? 3600 / pacePerMile : 0;
  const speedKph = pacePerKm > 0 ? 3600 / pacePerKm : 0;

  // Split times for common race distances
  const splitTimes: SplitTime[] = RACE_DISTANCES.map(race => {
    const raceFinishSeconds = pacePerMile * race.miles;
    return {
      raceName: race.name,
      distanceMiles: race.miles,
      distanceKm: race.km,
      finishTime: formatTime(raceFinishSeconds),
      finishTimeSeconds: Math.round(raceFinishSeconds),
    };
  });

  const speedMphRounded = Math.round(speedMph * 100) / 100;
  const speedKphRounded = Math.round(speedKph * 100) / 100;

  return {
    pace: distanceUnit === 'miles' || (input.paceUnit ?? 'min/mile') === 'min/mile'
      ? `${formatPace(pacePerMile)} min/mile`
      : `${formatPace(pacePerKm)} min/km`,
    pacePerMile: Math.round(pacePerMile * 100) / 100,
    pacePerKm: Math.round(pacePerKm * 100) / 100,
    pacePerMileFormatted: `${formatPace(pacePerMile)} min/mile`,
    pacePerKmFormatted: `${formatPace(pacePerKm)} min/km`,
    finishTime: formatTime(finishTimeSeconds),
    finishTimeSeconds: Math.round(finishTimeSeconds),
    distance: Math.round(distance * 10000) / 10000,
    distanceUnit,
    speedMph: speedMphRounded,
    speedKph: speedKphRounded,
    speed: [
      { label: 'Speed (mph)', value: speedMphRounded },
      { label: 'Speed (km/h)', value: speedKphRounded },
    ],
    paceConversion: [
      { label: 'Per Mile', value: `${formatPace(pacePerMile)} min/mile` },
      { label: 'Per Kilometer', value: `${formatPace(pacePerKm)} min/km` },
    ],
    splitTimes,
  };
}

function formatPace(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.round(totalSeconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.round(totalSeconds % 60);

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Wrapper for the formula registry
export function calculatePaceFromInputs(inputs: Record<string, unknown>): Record<string, unknown> {
  const result = calculatePace({
    calculationMode: inputs.calculationMode as 'findPace' | 'findTime' | 'findDistance',
    distance: inputs.distance ? Number(inputs.distance) : undefined,
    distanceUnit: inputs.distanceUnit as 'miles' | 'kilometers' | undefined,
    hours: inputs.hours ? Number(inputs.hours) : undefined,
    minutes: inputs.minutes ? Number(inputs.minutes) : undefined,
    seconds: inputs.seconds ? Number(inputs.seconds) : undefined,
    paceMinutes: inputs.paceMinutes ? Number(inputs.paceMinutes) : undefined,
    paceSeconds: inputs.paceSeconds ? Number(inputs.paceSeconds) : undefined,
    paceUnit: inputs.paceUnit as 'min/mile' | 'min/km' | undefined,
  });
  return result as unknown as Record<string, unknown>;
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'pace': calculatePaceFromInputs,
};
