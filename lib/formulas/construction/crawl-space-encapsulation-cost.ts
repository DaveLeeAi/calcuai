/**
 * Crawl Space Encapsulation Cost Calculator Formula Module
 *
 * Estimates crawl space encapsulation costs across five crawl space sizes,
 * three vapor barrier grades, drainage options, dehumidifier options,
 * and insulation types. Includes regional labor multipliers.
 *
 * Cost formula:
 *   baseLow / baseHigh = size base cost range
 *   barrierCostLow = baseLow × barrierMultiplier
 *   barrierCostHigh = baseHigh × barrierMultiplier
 *   drainageCost = drainage add-on range
 *   dehumidifierCost = dehumidifier add-on range
 *   insulationCost = insulation add-on range
 *   laborCost = baseCost × 0.40 × regionalMultiplier
 *   totalLow = barrierCostLow + drainageLow + dehumidifierLow + insulationLow + laborLow
 *   totalHigh = barrierCostHigh + drainageHigh + dehumidifierHigh + insulationHigh + laborHigh
 *   totalMid = (totalLow + totalHigh) / 2
 *
 * Source: HomeAdvisor / Angi 2025-2026 national averages;
 *         Basement Health Association encapsulation cost data
 */

export interface CrawlSpaceEncapsulationCostInput {
  crawlSpaceSize: string;   // 'small-500sqft' | 'medium-1000sqft' | 'standard-1500sqft' | 'large-2000sqft' | 'xlarge-2500sqft'
  vaporBarrier: string;     // '6-mil-standard' | '12-mil-reinforced' | '20-mil-premium'
  drainage: string;         // 'none' | 'interior-drain' | 'sump-pump'
  dehumidifier: string;     // 'none' | 'portable' | 'commercial-grade'
  insulation: string;       // 'none' | 'fiberglass-batt' | 'rigid-foam' | 'spray-foam'
  region: string;           // 'national' | 'northeast' | 'west-coast' | 'mid-atlantic' | 'midwest' | 'south' | 'mountain-west'
}

export interface CrawlSpaceEncapsulationCostOutput {
  baseCost: number;
  barrierCost: number;
  drainageCost: number;
  dehumidifierCost: number;
  insulationCost: number;
  laborCost: number;
  subtotalLow: number;
  subtotalHigh: number;
  subtotal: number;
  totalLow: number;
  totalHigh: number;
  totalMid: number;
  sizeComparison: { label: string; value: number }[];
  timeline: string;
}

/**
 * Size base cost ranges (material + basic encapsulation).
 * Source: HomeAdvisor / Angi 2025-2026.
 */
const SIZE_COSTS: Record<string, { low: number; high: number; sqft: number }> = {
  'small-500sqft':    { low: 2000,  high: 4000,  sqft: 500 },
  'medium-1000sqft':  { low: 3500,  high: 7000,  sqft: 1000 },
  'standard-1500sqft':{ low: 5000,  high: 10000, sqft: 1500 },
  'large-2000sqft':   { low: 7000,  high: 14000, sqft: 2000 },
  'xlarge-2500sqft':  { low: 9000,  high: 18000, sqft: 2500 },
};

/**
 * Vapor barrier grade multipliers applied to base cost.
 * Source: HomeAdvisor / Angi 2025-2026.
 */
const BARRIER_MULTIPLIERS: Record<string, number> = {
  '6-mil-standard':    1.0,
  '12-mil-reinforced': 1.15,
  '20-mil-premium':    1.30,
};

/**
 * Drainage system add-on cost ranges (flat).
 * Source: HomeAdvisor / Angi 2025-2026.
 */
const DRAINAGE_COSTS: Record<string, { low: number; high: number }> = {
  'none':           { low: 0,    high: 0 },
  'interior-drain': { low: 800,  high: 1500 },
  'sump-pump':      { low: 1200, high: 2500 },
};

/**
 * Dehumidifier add-on cost ranges (unit + installation).
 * Source: HomeAdvisor / Angi 2025-2026.
 */
const DEHUMIDIFIER_COSTS: Record<string, { low: number; high: number }> = {
  'none':             { low: 0,    high: 0 },
  'portable':         { low: 300,  high: 600 },
  'commercial-grade': { low: 1500, high: 3000 },
};

/**
 * Insulation add-on cost ranges (installed).
 * Source: HomeAdvisor / Angi 2025-2026.
 */
const INSULATION_COSTS: Record<string, { low: number; high: number }> = {
  'none':            { low: 0,    high: 0 },
  'fiberglass-batt': { low: 500,  high: 1000 },
  'rigid-foam':      { low: 800,  high: 1500 },
  'spray-foam':      { low: 1500, high: 3000 },
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
 * Display labels for crawl space sizes.
 */
const SIZE_LABELS: Record<string, string> = {
  'small-500sqft':     'Small (500 sq ft)',
  'medium-1000sqft':   'Medium (1,000 sq ft)',
  'standard-1500sqft': 'Standard (1,500 sq ft)',
  'large-2000sqft':    'Large (2,000 sq ft)',
  'xlarge-2500sqft':   'Extra Large (2,500 sq ft)',
};

/**
 * Crawl space encapsulation cost calculator.
 *
 * totalLow = barrierCostLow + drainageLow + dehumidifierLow + insulationLow + laborLow
 * totalHigh = barrierCostHigh + drainageHigh + dehumidifierHigh + insulationHigh + laborHigh
 * totalMid = (totalLow + totalHigh) / 2
 *
 * Source: HomeAdvisor / Angi 2025-2026, Basement Health Association.
 */
export function calculateCrawlSpaceEncapsulationCost(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const crawlSpaceSize = String(inputs.crawlSpaceSize || 'standard-1500sqft');
  const vaporBarrier = String(inputs.vaporBarrier || '6-mil-standard');
  const drainage = String(inputs.drainage || 'none');
  const dehumidifier = String(inputs.dehumidifier || 'none');
  const insulation = String(inputs.insulation || 'none');
  const region = String(inputs.region || 'national');

  // ── Look up rates ─────────────────────────────────────
  const sizeData = SIZE_COSTS[crawlSpaceSize] ?? SIZE_COSTS['standard-1500sqft'];
  const barrierMult = BARRIER_MULTIPLIERS[vaporBarrier] ?? 1.0;
  const drainageRange = DRAINAGE_COSTS[drainage] ?? DRAINAGE_COSTS['none'];
  const dehumidifierRange = DEHUMIDIFIER_COSTS[dehumidifier] ?? DEHUMIDIFIER_COSTS['none'];
  const insulationRange = INSULATION_COSTS[insulation] ?? INSULATION_COSTS['none'];
  const regionMult = REGIONAL_MULTIPLIERS[region] ?? 1.0;

  // ── Calculate barrier-adjusted base cost ──────────────
  const barrierCostLow = parseFloat((sizeData.low * barrierMult).toFixed(2));
  const barrierCostHigh = parseFloat((sizeData.high * barrierMult).toFixed(2));

  // ── Labor cost (40% of base cost × regional multiplier) ──
  const laborLow = parseFloat((sizeData.low * 0.40 * regionMult).toFixed(2));
  const laborHigh = parseFloat((sizeData.high * 0.40 * regionMult).toFixed(2));

  // ── Totals ────────────────────────────────────────────
  const totalLow = parseFloat((barrierCostLow + drainageRange.low + dehumidifierRange.low + insulationRange.low + laborLow).toFixed(2));
  const totalHigh = parseFloat((barrierCostHigh + drainageRange.high + dehumidifierRange.high + insulationRange.high + laborHigh).toFixed(2));
  const totalMid = parseFloat(((totalLow + totalHigh) / 2).toFixed(2));

  // ── Mid-point costs for display ───────────────────────
  const baseCost = parseFloat(((sizeData.low + sizeData.high) / 2).toFixed(2));
  const barrierCost = parseFloat(((barrierCostLow + barrierCostHigh) / 2).toFixed(2));
  const drainageCost = parseFloat(((drainageRange.low + drainageRange.high) / 2).toFixed(2));
  const dehumidifierCost = parseFloat(((dehumidifierRange.low + dehumidifierRange.high) / 2).toFixed(2));
  const insulationCost = parseFloat(((insulationRange.low + insulationRange.high) / 2).toFixed(2));
  const laborCost = parseFloat(((laborLow + laborHigh) / 2).toFixed(2));
  const subtotalLow = totalLow;
  const subtotalHigh = totalHigh;
  const subtotal = totalMid;

  // ── Size comparison (all sizes, 6-mil barrier, no add-ons, national) ──
  const sizeKeys = Object.keys(SIZE_COSTS);
  const sizeComparison = sizeKeys.map(key => {
    const data = SIZE_COSTS[key];
    const midBase = (data.low + data.high) / 2;
    const midLabor = midBase * 0.40;
    const mid = midBase + midLabor;
    return {
      label: `${SIZE_LABELS[key]} ($${data.low.toLocaleString()}–$${data.high.toLocaleString()})`,
      value: parseFloat(mid.toFixed(2)),
    };
  });

  // ── Timeline ──────────────────────────────────────────
  const timeline = '2-5 days';

  return {
    baseCost,
    barrierCost,
    drainageCost,
    dehumidifierCost,
    insulationCost,
    laborCost,
    subtotalLow,
    subtotalHigh,
    subtotal,
    totalLow,
    totalHigh,
    totalMid,
    sizeComparison,
    timeline,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'crawl-space-encapsulation-cost': calculateCrawlSpaceEncapsulationCost,
};
