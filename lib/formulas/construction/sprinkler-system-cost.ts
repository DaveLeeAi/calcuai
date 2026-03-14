/**
 * Sprinkler System Cost Calculator Formula Module
 *
 * Estimates lawn sprinkler / irrigation system installation costs
 * across four system types: above-ground, in-ground manual, in-ground automatic,
 * and drip irrigation. Includes zone adjustments, soil difficulty, backflow
 * preventer add-ons, and regional labor multipliers.
 *
 * Cost formula:
 *   baseLow / baseHigh = lawn-size base range
 *   systemLow  = baseLow × systemMult
 *   systemHigh = baseHigh × systemMult
 *   materialLow  = systemLow × 0.40
 *   materialHigh = systemHigh × 0.40
 *   laborLow   = systemLow × 0.60 × soilMult × regionMult
 *   laborHigh  = systemHigh × 0.60 × soilMult × regionMult
 *   zoneAdj    = max(0, zones - includedZones) × zoneAddCost (low/high)
 *   backflowLow / backflowHigh = backflow preventer cost range
 *   totalLow  = materialLow + laborLow + zoneAdjLow + backflowLow
 *   totalHigh = materialHigh + laborHigh + zoneAdjHigh + backflowHigh
 *   totalMid  = (totalLow + totalHigh) / 2
 *   costPerZone = totalMid / zones
 *
 * Source: HomeAdvisor / Angi 2025-2026 national averages;
 *         Irrigation Association installation cost data
 */

export interface SprinklerSystemCostInput {
  lawnSize: string;        // 'small-under-2500' | 'medium-2500-5000' | 'large-5000-10000' | 'xlarge-over-10000'
  systemType: string;      // 'above-ground' | 'in-ground-manual' | 'in-ground-automatic' | 'drip-irrigation'
  zones: number;           // 1–12, default 4
  soilType: string;        // 'normal' | 'clay' | 'rocky'
  backflowPreventer: string; // 'none' | 'standard' | 'rpz-valve'
  region: string;          // 'national' | 'northeast' | 'west-coast' | 'mid-atlantic' | 'midwest' | 'south' | 'mountain-west'
}

export interface SprinklerSystemCostOutput {
  materialCost: number;
  laborCost: number;
  backflowCost: number;
  zoneAdjustment: number;
  totalLow: number;
  totalHigh: number;
  totalMid: number;
  costPerZone: number;
  systemComparison: { label: string; value: number }[];
  timeline: string;
}

/**
 * Base cost ranges by lawn size (total installed, before system type multiplier).
 * Source: HomeAdvisor / Angi 2025-2026.
 */
const BASE_COSTS: Record<string, { low: number; high: number; includedZones: number }> = {
  'small-under-2500':  { low: 1500, high: 2500, includedZones: 3 },
  'medium-2500-5000':  { low: 2500, high: 4500, includedZones: 4 },
  'large-5000-10000':  { low: 4500, high: 7500, includedZones: 6 },
  'xlarge-over-10000': { low: 7500, high: 12000, includedZones: 8 },
};

/**
 * System type multipliers applied to base cost.
 * In-ground automatic is the baseline (1.0x).
 * Source: HomeAdvisor / Angi 2025-2026.
 */
const SYSTEM_MULTIPLIERS: Record<string, number> = {
  'above-ground':        0.40,
  'in-ground-manual':    0.85,
  'in-ground-automatic': 1.00,
  'drip-irrigation':     0.70,
};

/**
 * Additional cost per extra zone beyond what's included with the lawn size.
 * Source: HomeAdvisor 2025-2026.
 */
const ZONE_ADD_COST = { low: 200, high: 400 };

/**
 * Soil type multipliers — applied to labor portion only.
 * Normal soil is baseline (1.0x).
 * Source: HomeAdvisor / Angi 2025-2026.
 */
const SOIL_MULTIPLIERS: Record<string, number> = {
  'normal': 1.00,
  'clay':   1.15,
  'rocky':  1.30,
};

/**
 * Backflow preventer cost ranges.
 * Source: HomeAdvisor / Angi 2025-2026; Irrigation Association.
 */
const BACKFLOW_COSTS: Record<string, { low: number; high: number }> = {
  'none':      { low: 0,   high: 0 },
  'standard':  { low: 100, high: 300 },
  'rpz-valve': { low: 300, high: 600 },
};

/**
 * Regional labor multipliers — applied to labor portion only.
 * Source: HomeAdvisor regional cost index 2025-2026.
 */
const REGIONAL_MULTIPLIERS: Record<string, number> = {
  'national':      1.00,
  'northeast':     1.20,
  'west-coast':    1.25,
  'mid-atlantic':  1.15,
  'midwest':       0.90,
  'south':         0.85,
  'mountain-west': 0.95,
};

/**
 * Display labels for system types.
 */
const SYSTEM_LABELS: Record<string, string> = {
  'above-ground':        'Above-Ground',
  'in-ground-manual':    'In-Ground Manual',
  'in-ground-automatic': 'In-Ground Automatic',
  'drip-irrigation':     'Drip Irrigation',
};

/**
 * Timeline estimates by lawn size.
 */
const TIMELINE_ESTIMATES: Record<string, string> = {
  'small-under-2500':  '1-2 days',
  'medium-2500-5000':  '2-3 days',
  'large-5000-10000':  '3-5 days',
  'xlarge-over-10000': '5-7 days',
};

/**
 * Sprinkler system cost calculator.
 *
 * totalLow  = materialLow + laborLow + zoneAdjLow + backflowLow
 * totalHigh = materialHigh + laborHigh + zoneAdjHigh + backflowHigh
 * totalMid  = (totalLow + totalHigh) / 2
 *
 * Source: HomeAdvisor / Angi 2025-2026, Irrigation Association.
 */
export function calculateSprinklerSystemCost(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const lawnSize = String(inputs.lawnSize || 'medium-2500-5000');
  const systemType = String(inputs.systemType || 'in-ground-automatic');
  const zones = Math.max(1, Math.min(12, Number(inputs.zones) || 4));
  const soilType = String(inputs.soilType || 'normal');
  const backflowPreventer = String(inputs.backflowPreventer || 'none');
  const region = String(inputs.region || 'national');

  // ── Look up rates ─────────────────────────────────────
  const baseCost = BASE_COSTS[lawnSize] ?? BASE_COSTS['medium-2500-5000'];
  const systemMult = SYSTEM_MULTIPLIERS[systemType] ?? 1.0;
  const soilMult = SOIL_MULTIPLIERS[soilType] ?? 1.0;
  const backflowRange = BACKFLOW_COSTS[backflowPreventer] ?? BACKFLOW_COSTS['none'];
  const regionMult = REGIONAL_MULTIPLIERS[region] ?? 1.0;

  // ── Calculate system-adjusted base cost ───────────────
  const systemLow = baseCost.low * systemMult;
  const systemHigh = baseCost.high * systemMult;

  // ── Material cost (40% of system cost) ────────────────
  const materialLow = parseFloat((systemLow * 0.40).toFixed(2));
  const materialHigh = parseFloat((systemHigh * 0.40).toFixed(2));

  // ── Labor cost (60% of system cost × soil × region) ───
  const laborLow = parseFloat((systemLow * 0.60 * soilMult * regionMult).toFixed(2));
  const laborHigh = parseFloat((systemHigh * 0.60 * soilMult * regionMult).toFixed(2));

  // ── Zone adjustment ───────────────────────────────────
  const extraZones = Math.max(0, zones - baseCost.includedZones);
  const zoneAdjLow = extraZones * ZONE_ADD_COST.low;
  const zoneAdjHigh = extraZones * ZONE_ADD_COST.high;

  // ── Backflow preventer ────────────────────────────────
  const backflowLow = backflowRange.low;
  const backflowHigh = backflowRange.high;

  // ── Totals ────────────────────────────────────────────
  const totalLow = parseFloat((materialLow + laborLow + zoneAdjLow + backflowLow).toFixed(2));
  const totalHigh = parseFloat((materialHigh + laborHigh + zoneAdjHigh + backflowHigh).toFixed(2));
  const totalMid = parseFloat(((totalLow + totalHigh) / 2).toFixed(2));
  const costPerZone = zones > 0 ? parseFloat((totalMid / zones).toFixed(2)) : 0;

  // ── Mid-point costs for display ───────────────────────
  const materialCost = parseFloat(((materialLow + materialHigh) / 2).toFixed(2));
  const laborCost = parseFloat(((laborLow + laborHigh) / 2).toFixed(2));
  const backflowCost = parseFloat(((backflowLow + backflowHigh) / 2).toFixed(2));
  const zoneAdjustment = parseFloat(((zoneAdjLow + zoneAdjHigh) / 2).toFixed(2));

  // ── System comparison (all 4 system types, user's lawn size, national, normal soil, no backflow, no extra zones) ──
  const systemKeys = Object.keys(SYSTEM_MULTIPLIERS);
  const systemComparison = systemKeys.map(key => {
    const mult = SYSTEM_MULTIPLIERS[key];
    const sLow = baseCost.low * mult;
    const sHigh = baseCost.high * mult;
    const matLow = sLow * 0.40;
    const matHigh = sHigh * 0.40;
    const labLow = sLow * 0.60;
    const labHigh = sHigh * 0.60;
    const mid = (matLow + matHigh + labLow + labHigh) / 2;
    return {
      label: `${SYSTEM_LABELS[key]} (${mult.toFixed(2)}x)`,
      value: parseFloat(mid.toFixed(2)),
    };
  });

  // ── Timeline ──────────────────────────────────────────
  const timeline = TIMELINE_ESTIMATES[lawnSize] ?? '2-3 days';

  return {
    materialCost,
    laborCost,
    backflowCost,
    zoneAdjustment,
    totalLow,
    totalHigh,
    totalMid,
    costPerZone,
    systemComparison,
    timeline,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'sprinkler-system-cost': calculateSprinklerSystemCost,
};
