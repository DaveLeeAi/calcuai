/**
 * Wire Size Calculator Formula Module
 *
 * Determines the correct AWG wire gauge for an electrical circuit based on
 * amperage, voltage, distance, wire material, phase, and maximum allowable
 * voltage drop.
 *
 * Voltage Drop (single-phase):
 *   Vd = (2 × L × I × R) / 1000
 *
 * Voltage Drop (three-phase):
 *   Vd = (1.732 × L × I × R) / 1000
 *
 * Where:
 *   Vd = voltage drop (volts)
 *   L  = one-way wire run distance (feet)
 *   I  = current (amps)
 *   R  = wire resistance (Ω per 1,000 feet)
 *
 * The calculator selects the smallest wire gauge that satisfies BOTH
 * the ampacity requirement and the voltage drop limit.
 *
 * Source: NEC (National Electrical Code) Table 310.16 — Ampacity of
 * Conductors Rated 0–2000 Volts. Resistance values from NEC Chapter 9,
 * Table 8.
 */

export interface WireSizeInput {
  amperage: number;
  voltage: string;
  distance: number;
  distanceUnit?: string;
  wireType: string;           // 'copper' | 'aluminum'
  phase: string;              // 'single' | 'three'
  maxVoltageDrop: number;     // percentage (e.g. 3 for 3%)
  conduitType: string;        // 'pvc' | 'emt' | 'mc'
}

export interface WireGaugeData {
  gauge: string;
  ampacityCopper: number;
  ampacityAluminum: number;
  resistanceCopper: number;   // Ω per 1,000 ft
  resistanceAluminum: number;
}

export interface WireSizeOutput {
  recommendedGauge: string;
  ampacityGauge: string;
  voltageDropGauge: string;
  actualVoltageDrop: number;
  actualVoltageDropPercent: number;
  wireLength: number;
  watts: number;
  costEstimate: { label: string; value: number }[];
  wireInfo: { label: string; value: string }[];
}

/**
 * AWG wire data: ampacity at 75°C in conduit (NEC Table 310.16)
 * and resistance per 1,000 feet (NEC Chapter 9, Table 8).
 *
 * Aluminum ampacity is approximately 78-80% of copper.
 * Aluminum resistance is approximately 1.6× copper.
 */
const AWG_DATA: WireGaugeData[] = [
  { gauge: '14 AWG', ampacityCopper: 15,  ampacityAluminum: 12,  resistanceCopper: 3.14,    resistanceAluminum: 5.024  },
  { gauge: '12 AWG', ampacityCopper: 20,  ampacityAluminum: 16,  resistanceCopper: 1.98,    resistanceAluminum: 3.168  },
  { gauge: '10 AWG', ampacityCopper: 30,  ampacityAluminum: 24,  resistanceCopper: 1.24,    resistanceAluminum: 1.984  },
  { gauge: '8 AWG',  ampacityCopper: 40,  ampacityAluminum: 32,  resistanceCopper: 0.778,   resistanceAluminum: 1.245  },
  { gauge: '6 AWG',  ampacityCopper: 55,  ampacityAluminum: 44,  resistanceCopper: 0.491,   resistanceAluminum: 0.786  },
  { gauge: '4 AWG',  ampacityCopper: 70,  ampacityAluminum: 56,  resistanceCopper: 0.308,   resistanceAluminum: 0.493  },
  { gauge: '3 AWG',  ampacityCopper: 85,  ampacityAluminum: 68,  resistanceCopper: 0.245,   resistanceAluminum: 0.392  },
  { gauge: '2 AWG',  ampacityCopper: 95,  ampacityAluminum: 76,  resistanceCopper: 0.194,   resistanceAluminum: 0.310  },
  { gauge: '1 AWG',  ampacityCopper: 110, ampacityAluminum: 88,  resistanceCopper: 0.154,   resistanceAluminum: 0.246  },
  { gauge: '1/0 AWG', ampacityCopper: 125, ampacityAluminum: 100, resistanceCopper: 0.122,  resistanceAluminum: 0.195  },
  { gauge: '2/0 AWG', ampacityCopper: 145, ampacityAluminum: 116, resistanceCopper: 0.0967, resistanceAluminum: 0.155  },
  { gauge: '3/0 AWG', ampacityCopper: 165, ampacityAluminum: 132, resistanceCopper: 0.0766, resistanceAluminum: 0.123  },
  { gauge: '4/0 AWG', ampacityCopper: 195, ampacityAluminum: 156, resistanceCopper: 0.0608, resistanceAluminum: 0.0973 },
];

/**
 * Approximate cost per foot for THHN copper wire by gauge.
 * Source: Cerrowire / electrical distributor retail pricing, 2025–2026.
 */
const COST_PER_FOOT_COPPER: Record<string, number> = {
  '14 AWG': 0.15,
  '12 AWG': 0.22,
  '10 AWG': 0.35,
  '8 AWG':  0.55,
  '6 AWG':  0.85,
  '4 AWG':  1.25,
  '3 AWG':  1.55,
  '2 AWG':  1.85,
  '1 AWG':  2.40,
  '1/0 AWG': 3.00,
  '2/0 AWG': 3.75,
  '3/0 AWG': 4.60,
  '4/0 AWG': 5.80,
};

/**
 * Aluminum wire costs approximately 60% of copper.
 */
const ALUMINUM_COST_MULTIPLIER = 0.6;

/**
 * Convert distance to feet from the given unit.
 */
const distanceToFeet: Record<string, number> = {
  ft: 1,
  m: 3.28084,
};

/**
 * Calculates the correct wire gauge for an electrical circuit.
 *
 * Vd (single-phase) = (2 × L × I × R) / 1000
 * Vd (three-phase)  = (1.732 × L × I × R) / 1000
 * Vd% = (Vd / V) × 100
 *
 * Source: NEC Table 310.16 (ampacity) and NEC Chapter 9, Table 8 (resistance).
 */
export function calculateWireSize(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const amperage = Math.max(0, Number(inputs.amperage) || 0);
  const voltageNum = Number(inputs.voltage) || 120;
  const rawDistance = Math.max(0, Number(inputs.distance) || 0);
  const distUnit = String(inputs.distanceUnit || 'ft');
  const wireType = String(inputs.wireType || 'copper');
  const phase = String(inputs.phase || 'single');
  const maxVoltageDrop = Math.max(0.1, Math.min(10, Number(inputs.maxVoltageDrop) || 3));
  const conduitType = String(inputs.conduitType || 'pvc');

  // ── Convert distance to feet ──────────────────────────
  const distanceFt = rawDistance * (distanceToFeet[distUnit] ?? 1);

  // ── Guard: zero amperage or zero distance ─────────────
  if (amperage <= 0 || distanceFt <= 0) {
    return {
      recommendedGauge: 'N/A',
      ampacityGauge: 'N/A',
      voltageDropGauge: 'N/A',
      actualVoltageDrop: 0,
      actualVoltageDropPercent: 0,
      wireLength: 0,
      watts: 0,
      costEstimate: [
        { label: 'THHN Wire (per ft)', value: 0 },
        { label: 'Total Wire Cost (est.)', value: 0 },
      ],
      wireInfo: [
        { label: 'Gauge', value: 'N/A' },
        { label: 'Ampacity Rating', value: '0 A' },
        { label: 'Resistance', value: '0 Ω/1000ft' },
        { label: 'Max Circuit Amps', value: '0 A' },
      ],
    };
  }

  // ── Determine phase multiplier ────────────────────────
  const isThreePhase = phase === 'three';
  const phaseMultiplier = isThreePhase ? 1.732 : 2;
  const conductorCount = isThreePhase ? 3 : 2;

  // ── Wire length (total conductor length) ──────────────
  // Single-phase: hot + neutral = 2 × distance
  // Three-phase: 3 conductors × distance
  const wireLength = parseFloat((distanceFt * conductorCount).toFixed(1));

  // ── Wattage calculation ───────────────────────────────
  const watts = isThreePhase
    ? parseFloat((amperage * voltageNum * 1.732).toFixed(0))
    : parseFloat((amperage * voltageNum).toFixed(0));

  // ── Determine if copper or aluminum ───────────────────
  const isCopper = wireType === 'copper';

  // ── Step 1: Find minimum gauge for ampacity ───────────
  let ampacityGaugeIdx = -1;
  for (let i = 0; i < AWG_DATA.length; i++) {
    const ampacity = isCopper ? AWG_DATA[i].ampacityCopper : AWG_DATA[i].ampacityAluminum;
    if (ampacity >= amperage) {
      ampacityGaugeIdx = i;
      break;
    }
  }

  // ── Step 2: Find minimum gauge for voltage drop ───────
  let voltageDropGaugeIdx = -1;
  for (let i = 0; i < AWG_DATA.length; i++) {
    const resistance = isCopper ? AWG_DATA[i].resistanceCopper : AWG_DATA[i].resistanceAluminum;
    const vDrop = (phaseMultiplier * distanceFt * amperage * resistance) / 1000;
    const vDropPercent = (vDrop / voltageNum) * 100;
    if (vDropPercent <= maxVoltageDrop) {
      voltageDropGaugeIdx = i;
      break;
    }
  }

  // ── Step 3: Check if circuit exceeds 4/0 AWG capacity ─
  const exceedsCapacity = ampacityGaugeIdx === -1 || voltageDropGaugeIdx === -1;

  if (exceedsCapacity) {
    // One or both requirements cannot be met with our wire table
    const ampGauge = ampacityGaugeIdx >= 0 ? AWG_DATA[ampacityGaugeIdx].gauge : 'Exceeds 4/0 AWG';
    const vdGauge = voltageDropGaugeIdx >= 0 ? AWG_DATA[voltageDropGaugeIdx].gauge : 'Exceeds 4/0 AWG';

    return {
      recommendedGauge: 'Consult electrician — exceeds standard wire sizes',
      ampacityGauge: ampGauge,
      voltageDropGauge: vdGauge,
      actualVoltageDrop: 0,
      actualVoltageDropPercent: 0,
      wireLength,
      watts,
      costEstimate: [
        { label: 'THHN Wire (per ft)', value: 0 },
        { label: 'Total Wire Cost (est.)', value: 0 },
      ],
      wireInfo: [
        { label: 'Gauge', value: 'Consult electrician' },
        { label: 'Ampacity Rating', value: `>${isCopper ? 195 : 156} A needed` },
        { label: 'Resistance', value: 'N/A' },
        { label: 'Max Circuit Amps', value: `${amperage} A required` },
      ],
    };
  }

  // ── Step 4: Select the larger of the two gauges ───────
  // Higher index = larger wire (lower AWG number / bigger cross-section)
  const recommendedIdx = Math.max(ampacityGaugeIdx, voltageDropGaugeIdx);
  const wire = AWG_DATA[recommendedIdx];

  // ── Step 5: Calculate actual voltage drop with selected wire ──
  const resistance = isCopper ? wire.resistanceCopper : wire.resistanceAluminum;
  const actualVoltageDrop = parseFloat(
    ((phaseMultiplier * distanceFt * amperage * resistance) / 1000).toFixed(2)
  );
  const actualVoltageDropPercent = parseFloat(
    ((actualVoltageDrop / voltageNum) * 100).toFixed(2)
  );

  // ── Step 6: Cost estimate ─────────────────────────────
  const baseCostPerFt = COST_PER_FOOT_COPPER[wire.gauge] ?? 0;
  const costPerFt = isCopper ? baseCostPerFt : parseFloat((baseCostPerFt * ALUMINUM_COST_MULTIPLIER).toFixed(2));
  const totalCost = parseFloat((costPerFt * wireLength).toFixed(2));

  const costEstimate = [
    { label: `THHN ${isCopper ? 'Copper' : 'Aluminum'} (per ft)`, value: costPerFt },
    { label: 'Total Wire Cost (est.)', value: totalCost },
  ];

  // ── Step 7: Wire info summary ─────────────────────────
  const ampacity = isCopper ? wire.ampacityCopper : wire.ampacityAluminum;
  const wireInfo = [
    { label: 'Gauge', value: wire.gauge },
    { label: 'Ampacity Rating', value: `${ampacity} A` },
    { label: 'Resistance', value: `${resistance} Ω/1000ft` },
    { label: 'Max Circuit Amps', value: `${ampacity} A` },
  ];

  return {
    recommendedGauge: wire.gauge,
    ampacityGauge: AWG_DATA[ampacityGaugeIdx].gauge,
    voltageDropGauge: AWG_DATA[voltageDropGaugeIdx].gauge,
    actualVoltageDrop,
    actualVoltageDropPercent,
    wireLength,
    watts,
    costEstimate,
    wireInfo,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'wire-size': calculateWireSize,
};
