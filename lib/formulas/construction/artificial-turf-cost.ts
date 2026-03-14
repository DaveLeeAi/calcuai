/**
 * Artificial Turf Cost Calculator Formula Module
 *
 * Estimates artificial turf installation costs across five area sizes,
 * four turf quality grades, four infill types, three base prep levels,
 * and three drainage options. Includes regional labor multipliers.
 *
 * Cost formula:
 *   areaSqFt = lookup from area size selection
 *   materialCostPerSqFt = base rate × qualityMultiplier
 *   materialCost = areaSqFt × materialCostPerSqFt
 *   infillCost = areaSqFt × infillRate
 *   basePrepCost = materialCost × (basePrepMultiplier - 1)
 *   drainageCost = areaSqFt × drainageRate
 *   laborCost = materialCost × 0.35 × regionalMultiplier
 *   totalLow = sum of all low components
 *   totalHigh = sum of all high components
 *   totalMid = (totalLow + totalHigh) / 2
 *
 * Source: HomeAdvisor / Angi 2025-2026 national averages;
 *         Synthetic Turf Council
 */

export interface ArtificialTurfCostInput {
  areaSize: string;         // 'small-200sqft' | 'medium-500sqft' | 'standard-1000sqft' | 'large-2000sqft' | 'xlarge-5000sqft'
  turfQuality: string;      // 'economy' | 'mid-range' | 'premium' | 'sport-grade'
  infill: string;           // 'crumb-rubber' | 'silica-sand' | 'organic-coconut' | 'zeolite'
  basePrepNeeded: string;   // 'minimal' | 'standard' | 'extensive'
  drainageSystem: string;   // 'none' | 'basic-perforated' | 'full-drain-board'
  region: string;           // 'national' | 'northeast' | 'west-coast' | 'mid-atlantic' | 'midwest' | 'south' | 'mountain-west'
}

export interface ArtificialTurfCostOutput {
  materialCost: number;
  infillCost: number;
  basePrepCost: number;
  drainageCost: number;
  laborCost: number;
  subtotalLow: number;
  subtotalHigh: number;
  subtotal: number;
  totalLow: number;
  totalHigh: number;
  totalMid: number;
  qualityComparison: { label: string; value: number }[];
  timeline: string;
}

/**
 * Area size lookup — square footage and base cost per sq ft range.
 * Larger areas get volume discounts on base rate.
 * Source: HomeAdvisor / Angi 2025-2026.
 */
const AREA_SIZES: Record<string, { sqft: number; low: number; high: number }> = {
  'small-200sqft':    { sqft: 200,  low: 5, high: 8 },
  'medium-500sqft':   { sqft: 500,  low: 5, high: 8 },
  'standard-1000sqft':{ sqft: 1000, low: 5, high: 8 },
  'large-2000sqft':   { sqft: 2000, low: 4, high: 7 },
  'xlarge-5000sqft':  { sqft: 5000, low: 4, high: 7 },
};

/**
 * Turf quality multipliers applied to material cost.
 * Source: HomeAdvisor / Angi 2025-2026.
 */
const QUALITY_MULTIPLIERS: Record<string, number> = {
  'economy':     1.0,
  'mid-range':   1.25,
  'premium':     1.60,
  'sport-grade': 2.0,
};

/**
 * Infill cost per square foot add-on.
 * Source: HomeAdvisor / Angi 2025-2026.
 */
const INFILL_COSTS: Record<string, { low: number; high: number }> = {
  'crumb-rubber':    { low: 0.50, high: 1.00 },
  'silica-sand':     { low: 0.75, high: 1.25 },
  'organic-coconut': { low: 1.00, high: 2.00 },
  'zeolite':         { low: 1.25, high: 2.50 },
};

/**
 * Base preparation multipliers applied to material cost.
 * minimal = no additional prep, standard = grading + compaction,
 * extensive = excavation + gravel base + compaction.
 */
const BASE_PREP_MULTIPLIERS: Record<string, number> = {
  'minimal':   1.0,
  'standard':  1.15,
  'extensive': 1.35,
};

/**
 * Drainage system cost per square foot add-on.
 * Source: HomeAdvisor / Angi 2025-2026.
 */
const DRAINAGE_COSTS: Record<string, { low: number; high: number }> = {
  'none':              { low: 0,    high: 0 },
  'basic-perforated':  { low: 0.50, high: 1.00 },
  'full-drain-board':  { low: 1.50, high: 3.00 },
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
 * Display labels for turf quality grades.
 */
const QUALITY_LABELS: Record<string, string> = {
  'economy':     'Economy',
  'mid-range':   'Mid-Range',
  'premium':     'Premium',
  'sport-grade': 'Sport Grade',
};

/**
 * Artificial turf cost calculator.
 *
 * totalLow = materialCostLow + infillCostLow + basePrepCostLow + drainageCostLow + laborCostLow
 * totalHigh = materialCostHigh + infillCostHigh + basePrepCostHigh + drainageCostHigh + laborCostHigh
 * totalMid = (totalLow + totalHigh) / 2
 *
 * Source: HomeAdvisor / Angi 2025-2026, Synthetic Turf Council.
 */
export function calculateArtificialTurfCost(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const areaSize = String(inputs.areaSize || 'standard-1000sqft');
  const turfQuality = String(inputs.turfQuality || 'mid-range');
  const infill = String(inputs.infill || 'crumb-rubber');
  const basePrepNeeded = String(inputs.basePrepNeeded || 'standard');
  const drainageSystem = String(inputs.drainageSystem || 'none');
  const region = String(inputs.region || 'national');

  // ── Look up rates ─────────────────────────────────────
  const areaData = AREA_SIZES[areaSize] ?? AREA_SIZES['standard-1000sqft'];
  const sqft = areaData.sqft;
  const qualityMult = QUALITY_MULTIPLIERS[turfQuality] ?? 1.0;
  const infillRange = INFILL_COSTS[infill] ?? INFILL_COSTS['crumb-rubber'];
  const basePrepMult = BASE_PREP_MULTIPLIERS[basePrepNeeded] ?? 1.0;
  const drainageRange = DRAINAGE_COSTS[drainageSystem] ?? DRAINAGE_COSTS['none'];
  const regionMult = REGIONAL_MULTIPLIERS[region] ?? 1.0;

  // ── Calculate material cost (area × base rate × quality) ──
  const materialCostLow = parseFloat((sqft * areaData.low * qualityMult).toFixed(2));
  const materialCostHigh = parseFloat((sqft * areaData.high * qualityMult).toFixed(2));

  // ── Calculate infill cost ─────────────────────────────
  const infillCostLow = parseFloat((sqft * infillRange.low).toFixed(2));
  const infillCostHigh = parseFloat((sqft * infillRange.high).toFixed(2));

  // ── Calculate base prep cost (additional cost above material) ──
  const basePrepCostLow = parseFloat((materialCostLow * (basePrepMult - 1)).toFixed(2));
  const basePrepCostHigh = parseFloat((materialCostHigh * (basePrepMult - 1)).toFixed(2));

  // ── Calculate drainage cost ───────────────────────────
  const drainageCostLow = parseFloat((sqft * drainageRange.low).toFixed(2));
  const drainageCostHigh = parseFloat((sqft * drainageRange.high).toFixed(2));

  // ── Calculate labor cost (35% of material × regional) ──
  const laborCostLow = parseFloat((materialCostLow * 0.35 * regionMult).toFixed(2));
  const laborCostHigh = parseFloat((materialCostHigh * 0.35 * regionMult).toFixed(2));

  // ── Totals ────────────────────────────────────────────
  const totalLow = parseFloat((materialCostLow + infillCostLow + basePrepCostLow + drainageCostLow + laborCostLow).toFixed(2));
  const totalHigh = parseFloat((materialCostHigh + infillCostHigh + basePrepCostHigh + drainageCostHigh + laborCostHigh).toFixed(2));
  const totalMid = parseFloat(((totalLow + totalHigh) / 2).toFixed(2));

  // ── Mid-point costs for display ───────────────────────
  const materialCost = parseFloat(((materialCostLow + materialCostHigh) / 2).toFixed(2));
  const infillCost = parseFloat(((infillCostLow + infillCostHigh) / 2).toFixed(2));
  const basePrepCost = parseFloat(((basePrepCostLow + basePrepCostHigh) / 2).toFixed(2));
  const drainageCost = parseFloat(((drainageCostLow + drainageCostHigh) / 2).toFixed(2));
  const laborCost = parseFloat(((laborCostLow + laborCostHigh) / 2).toFixed(2));
  const subtotalLow = totalLow;
  const subtotalHigh = totalHigh;
  const subtotal = totalMid;

  // ── Quality comparison (all grades, standard area, crumb-rubber infill, standard prep, no drainage, national) ──
  const qualityKeys = Object.keys(QUALITY_MULTIPLIERS);
  const qualityComparison = qualityKeys.map(key => {
    const qMult = QUALITY_MULTIPLIERS[key];
    const baseRate = (areaData.low + areaData.high) / 2;
    const matMid = sqft * baseRate * qMult;
    const infMid = sqft * (infillRange.low + infillRange.high) / 2;
    const labMid = matMid * 0.35;
    const mid = matMid + infMid + labMid;
    return {
      label: `${QUALITY_LABELS[key]} (${qMult}x base)`,
      value: parseFloat(mid.toFixed(2)),
    };
  });

  // ── Timeline ──────────────────────────────────────────
  const timeline = '2-5 days';

  return {
    materialCost,
    infillCost,
    basePrepCost,
    drainageCost,
    laborCost,
    subtotalLow,
    subtotalHigh,
    subtotal,
    totalLow,
    totalHigh,
    totalMid,
    qualityComparison,
    timeline,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'artificial-turf-cost': calculateArtificialTurfCost,
};
