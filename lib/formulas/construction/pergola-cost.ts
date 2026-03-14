/**
 * Pergola Cost Calculator Formula Module
 *
 * Estimates pergola installation costs across six materials:
 * pressure-treated wood, cedar, redwood, vinyl, aluminum, and fiberglass.
 * Includes roof type add-ons, foundation adjustments, and electrical extras.
 * Splits costs into structure and labor components, with regional labor multipliers.
 *
 * Cost formula:
 *   structureLow  = sizeBaseLow × materialMult
 *   structureHigh = sizeBaseHigh × materialMult
 *   laborLow  = structureLow × 0.50 × regionalMultiplier
 *   laborHigh = structureHigh × 0.50 × regionalMultiplier
 *   roofCostLow / roofCostHigh = roofType add-on range
 *   electricalCostLow / electricalCostHigh = electrical add-on range
 *   subtotalLow  = structureLow + laborLow + roofCostLow + electricalCostLow
 *   subtotalHigh = structureHigh + laborHigh + roofCostHigh + electricalCostHigh
 *   totalLow  = subtotalLow × foundationMult
 *   totalHigh = subtotalHigh × foundationMult
 *   totalMid  = (totalLow + totalHigh) / 2
 *   costPerSqFt = totalMid / sqft
 *
 * Source: HomeAdvisor / Angi 2025-2026 national averages;
 *         NADRA Outdoor Living Cost Data
 */

export interface PergolaCostInput {
  size: string;             // 'small-8x8' | 'medium-10x12' | 'large-12x16' | 'xlarge-14x20'
  material: string;         // 'pressure-treated-wood' | 'cedar' | 'redwood' | 'vinyl' | 'aluminum' | 'fiberglass'
  roofType: string;         // 'open-rafter' | 'shade-slats' | 'polycarbonate-roof' | 'retractable-canopy'
  foundation: string;       // 'surface-mount' | 'concrete-footings' | 'deck-mount'
  electricalOutlet: string; // 'none' | 'basic-outlet' | 'fan-and-lights'
  region: string;           // 'national' | 'northeast' | 'west-coast' | 'mid-atlantic' | 'midwest' | 'south' | 'mountain-west'
}

export interface PergolaCostOutput {
  sqft: number;
  structureCost: number;
  laborCost: number;
  roofCost: number;
  foundationAdj: number;
  electricalCost: number;
  totalLow: number;
  totalHigh: number;
  totalMid: number;
  costPerSqFt: number;
  materialComparison: { label: string; value: number }[];
  timeline: string;
}

/**
 * Size base cost ranges (structure materials only, before labor).
 * Source: HomeAdvisor / Angi 2025-2026.
 */
const SIZE_BASES: Record<string, { low: number; high: number; sqft: number }> = {
  'small-8x8':    { low: 2000, high: 4000,  sqft: 64 },
  'medium-10x12': { low: 3500, high: 7000,  sqft: 120 },
  'large-12x16':  { low: 5500, high: 11000, sqft: 192 },
  'xlarge-14x20': { low: 8000, high: 16000, sqft: 280 },
};

/**
 * Material cost multipliers.
 * Pressure-treated wood is baseline (1.0x).
 * Source: HomeAdvisor / Angi 2025-2026.
 */
const MATERIAL_MULTIPLIERS: Record<string, number> = {
  'pressure-treated-wood': 1.00,
  'cedar':                 1.30,
  'redwood':               1.50,
  'vinyl':                 1.20,
  'aluminum':              1.35,
  'fiberglass':            1.40,
};

/**
 * Roof type add-on costs.
 * Open rafter = no additional cost. Others are additive flat ranges.
 * Source: HomeAdvisor / NADRA 2025-2026.
 */
const ROOF_COSTS: Record<string, { low: number; high: number }> = {
  'open-rafter':          { low: 0,    high: 0 },
  'shade-slats':          { low: 500,  high: 1500 },
  'polycarbonate-roof':   { low: 1000, high: 2500 },
  'retractable-canopy':   { low: 1500, high: 3500 },
};

/**
 * Foundation multipliers applied to the (structure + labor + roof + electrical) subtotal.
 * Surface mount is baseline (1.0x).
 * Source: HomeAdvisor 2025-2026.
 */
const FOUNDATION_MULTIPLIERS: Record<string, number> = {
  'surface-mount':      1.00,
  'concrete-footings':  1.15,
  'deck-mount':         1.05,
};

/**
 * Electrical add-on cost ranges.
 * Source: HomeAdvisor / Angi 2025-2026.
 */
const ELECTRICAL_COSTS: Record<string, { low: number; high: number }> = {
  'none':            { low: 0,   high: 0 },
  'basic-outlet':    { low: 200, high: 400 },
  'fan-and-lights':  { low: 500, high: 1200 },
};

/**
 * Regional labor multipliers — applied to labor portion only.
 * Source: HomeAdvisor regional cost index 2025-2026.
 */
const REGIONAL_MULTIPLIERS: Record<string, number> = {
  'national':       1.0,
  'northeast':      1.20,
  'west-coast':     1.25,
  'mid-atlantic':   1.15,
  'midwest':        0.90,
  'south':          0.85,
  'mountain-west':  0.95,
};

/**
 * Display labels for material types.
 */
const MATERIAL_LABELS: Record<string, string> = {
  'pressure-treated-wood': 'Pressure-Treated Wood',
  'cedar':                 'Cedar',
  'redwood':               'Redwood',
  'vinyl':                 'Vinyl',
  'aluminum':              'Aluminum',
  'fiberglass':            'Fiberglass',
};

/**
 * Timeline estimates by size.
 */
const TIMELINE_ESTIMATES: Record<string, string> = {
  'small-8x8':    '2-3 days',
  'medium-10x12': '3-5 days',
  'large-12x16':  '4-6 days',
  'xlarge-14x20': '5-8 days',
};

/**
 * Pergola cost calculator.
 *
 * totalLow  = (structureLow + laborLow + roofLow + electricalLow) × foundationMult
 * totalHigh = (structureHigh + laborHigh + roofHigh + electricalHigh) × foundationMult
 * totalMid  = (totalLow + totalHigh) / 2
 *
 * Source: HomeAdvisor / Angi 2025-2026, NADRA Outdoor Living Cost Data.
 */
export function calculatePergolaCost(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const size = String(inputs.size || 'medium-10x12');
  const material = String(inputs.material || 'pressure-treated-wood');
  const roofType = String(inputs.roofType || 'open-rafter');
  const foundation = String(inputs.foundation || 'surface-mount');
  const electricalOutlet = String(inputs.electricalOutlet || 'none');
  const region = String(inputs.region || 'national');

  // ── Look up rates ─────────────────────────────────────
  const sizeBase = SIZE_BASES[size] ?? SIZE_BASES['medium-10x12'];
  const materialMult = MATERIAL_MULTIPLIERS[material] ?? 1.0;
  const roofCostRange = ROOF_COSTS[roofType] ?? ROOF_COSTS['open-rafter'];
  const foundationMult = FOUNDATION_MULTIPLIERS[foundation] ?? 1.0;
  const electricalRange = ELECTRICAL_COSTS[electricalOutlet] ?? ELECTRICAL_COSTS['none'];
  const regionMult = REGIONAL_MULTIPLIERS[region] ?? 1.0;
  const sqft = sizeBase.sqft;

  // ── Calculate structure cost ──────────────────────────
  const structureLow = parseFloat((sizeBase.low * materialMult).toFixed(2));
  const structureHigh = parseFloat((sizeBase.high * materialMult).toFixed(2));

  // ── Calculate labor cost (50% of structure × regional multiplier) ──
  const laborLow = parseFloat((structureLow * 0.50 * regionMult).toFixed(2));
  const laborHigh = parseFloat((structureHigh * 0.50 * regionMult).toFixed(2));

  // ── Roof and electrical add-ons ───────────────────────
  const roofCostLow = roofCostRange.low;
  const roofCostHigh = roofCostRange.high;
  const electricalCostLow = electricalRange.low;
  const electricalCostHigh = electricalRange.high;

  // ── Subtotal before foundation adjustment ─────────────
  const subtotalLow = structureLow + laborLow + roofCostLow + electricalCostLow;
  const subtotalHigh = structureHigh + laborHigh + roofCostHigh + electricalCostHigh;

  // ── Apply foundation multiplier ───────────────────────
  const totalLow = parseFloat((subtotalLow * foundationMult).toFixed(2));
  const totalHigh = parseFloat((subtotalHigh * foundationMult).toFixed(2));
  const totalMid = parseFloat(((totalLow + totalHigh) / 2).toFixed(2));
  const costPerSqFt = sqft > 0 ? parseFloat((totalMid / sqft).toFixed(2)) : 0;

  // ── Mid-point costs for display ───────────────────────
  const structureCost = parseFloat(((structureLow + structureHigh) / 2).toFixed(2));
  const laborCost = parseFloat(((laborLow + laborHigh) / 2).toFixed(2));
  const roofCost = parseFloat(((roofCostLow + roofCostHigh) / 2).toFixed(2));
  const electricalCost = parseFloat(((electricalCostLow + electricalCostHigh) / 2).toFixed(2));

  // Foundation adjustment = how much foundation adds above 1.0x
  const foundationAdj = parseFloat((((subtotalLow + subtotalHigh) / 2) * (foundationMult - 1)).toFixed(2));

  // ── Material comparison (all 6 materials, user's size, national, open rafter, surface mount, no electrical) ──
  const materialKeys = Object.keys(MATERIAL_MULTIPLIERS);
  const materialComparison = materialKeys.map(key => {
    const mult = MATERIAL_MULTIPLIERS[key];
    const sLow = sizeBase.low * mult;
    const sHigh = sizeBase.high * mult;
    const lLow = sLow * 0.50;
    const lHigh = sHigh * 0.50;
    const mid = (sLow + sHigh + lLow + lHigh) / 2;
    return {
      label: `${MATERIAL_LABELS[key]} (${mult.toFixed(2)}x)`,
      value: parseFloat(mid.toFixed(2)),
    };
  });

  // ── Timeline ──────────────────────────────────────────
  const timeline = TIMELINE_ESTIMATES[size] ?? '3-5 days';

  return {
    sqft,
    structureCost,
    laborCost,
    roofCost,
    foundationAdj,
    electricalCost,
    totalLow,
    totalHigh,
    totalMid,
    costPerSqFt,
    materialComparison,
    timeline,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'pergola-cost': calculatePergolaCost,
};
