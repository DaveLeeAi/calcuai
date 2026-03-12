export interface HeartRateZoneInput {
  age: number;
  restingHeartRate: number;
  maxHeartRateMethod: 'formula' | 'known';
  knownMaxHeartRate?: number;
}

export interface HeartRateZone {
  zone: number;
  name: string;
  percentMin: number;
  percentMax: number;
  bpmMin: number;
  bpmMax: number;
  description: string;
}

export interface HeartRateZoneOutput {
  maxHeartRate: number;
  heartRateReserve: number;
  zones: HeartRateZone[];
  averageZoneBpm: number[];
  zoneChart: { name: string; bpmMin: number; bpmMax: number }[];
}

/**
 * Heart Rate Zone calculation using the Karvonen formula:
 *
 * Max Heart Rate (Fox formula, 1971):
 *   MHR = 220 − age
 *
 * Heart Rate Reserve:
 *   HRR = MHR − RHR
 *
 * Target Heart Rate (Karvonen formula, 1957):
 *   THR = (HRR × intensity%) + RHR
 *
 * 5 Training Zones (American Heart Association aligned):
 *   Zone 1: Very Light     (50–60% HRR) — warm-up, recovery
 *   Zone 2: Light          (60–70% HRR) — fat oxidation, endurance base
 *   Zone 3: Moderate       (70–80% HRR) — cardiovascular fitness
 *   Zone 4: Hard           (80–90% HRR) — speed, lactate threshold
 *   Zone 5: Maximum        (90–100% HRR) — peak effort, VO2max
 *
 * Source: Karvonen MJ, Kentala E, Mustala O (1957). "The effects of training
 * on heart rate." Annales Medicinae Experimentalis et Biologiae Fenniae.
 * Fox SM, Naughton JP, Haskell WL (1971). "Physical activity and the
 * prevention of coronary heart disease." American Heart Association.
 */
export function calculateHeartRateZones(input: HeartRateZoneInput): HeartRateZoneOutput {
  const { age, restingHeartRate, maxHeartRateMethod, knownMaxHeartRate } = input;

  // Determine max heart rate
  const maxHeartRate =
    maxHeartRateMethod === 'known' && knownMaxHeartRate !== undefined
      ? knownMaxHeartRate
      : 220 - age;

  // Heart Rate Reserve
  const heartRateReserve = maxHeartRate - restingHeartRate;

  // Zone definitions
  const zoneDefinitions: Array<{
    zone: number;
    name: string;
    percentMin: number;
    percentMax: number;
    description: string;
  }> = [
    {
      zone: 1,
      name: 'Very Light',
      percentMin: 50,
      percentMax: 60,
      description: 'Warm-up and recovery. Improves overall health and helps with recovery from harder workouts.',
    },
    {
      zone: 2,
      name: 'Light',
      percentMin: 60,
      percentMax: 70,
      description: 'Fat burning and endurance base. Builds aerobic capacity and improves fat oxidation efficiency.',
    },
    {
      zone: 3,
      name: 'Moderate',
      percentMin: 70,
      percentMax: 80,
      description: 'Cardiovascular fitness. Strengthens the heart and improves blood circulation and respiratory capacity.',
    },
    {
      zone: 4,
      name: 'Hard',
      percentMin: 80,
      percentMax: 90,
      description: 'Anaerobic threshold and speed. Increases lactate threshold and improves high-speed endurance.',
    },
    {
      zone: 5,
      name: 'Maximum',
      percentMin: 90,
      percentMax: 100,
      description: 'Peak effort and VO2max. Develops maximum performance capacity. Only sustainable for short intervals.',
    },
  ];

  // Calculate BPM ranges using Karvonen formula: THR = (HRR × intensity%) + RHR
  const zones: HeartRateZone[] = zoneDefinitions.map((zd) => ({
    zone: zd.zone,
    name: zd.name,
    percentMin: zd.percentMin,
    percentMax: zd.percentMax,
    bpmMin: Math.round(heartRateReserve * (zd.percentMin / 100) + restingHeartRate),
    bpmMax: Math.round(heartRateReserve * (zd.percentMax / 100) + restingHeartRate),
    description: zd.description,
  }));

  // Calculate midpoint BPM for each zone (for chart)
  const averageZoneBpm: number[] = zones.map(
    (z) => Math.round((z.bpmMin + z.bpmMax) / 2)
  );

  // Chart-bar data for spec's zoneChart output
  const zoneChart = zones.map((z) => ({
    name: z.name,
    bpmMin: z.bpmMin,
    bpmMax: z.bpmMax,
  }));

  return {
    maxHeartRate,
    heartRateReserve,
    zones,
    averageZoneBpm,
    zoneChart,
  };
}

// Wrapper for the formula registry
export function calculateHeartRateZonesFromInputs(
  inputs: Record<string, unknown>
): Record<string, unknown> {
  const result = calculateHeartRateZones({
    age: inputs.age as number,
    restingHeartRate: inputs.restingHeartRate as number,
    maxHeartRateMethod:
      (inputs.maxHeartRateMethod as string) === 'known' ? 'known' : 'formula',
    knownMaxHeartRate: inputs.knownMaxHeartRate as number | undefined,
  });
  return result as unknown as Record<string, unknown>;
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'heart-rate-zones': calculateHeartRateZonesFromInputs,
};
