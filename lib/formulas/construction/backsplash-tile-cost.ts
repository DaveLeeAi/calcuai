/**
 * Backsplash Tile Cost Calculator Formula Module
 *
 * Estimates kitchen backsplash tiling costs across five tile materials:
 * ceramic subway, glass mosaic, natural stone, porcelain, and peel-and-stick.
 * Splits costs into material and labor components, with regional labor multipliers.
 *
 * Cost formula:
 *   area = length × height (in feet)
 *   materialArea = area × (1 + wasteFactor / 100)
 *   materialCost = materialArea × materialRate
 *   laborCost = materialArea × laborRate × regionalMultiplier
 *   demoCost = area × demoRate (if selected)
 *   suppliesCost = area × $2.50
 *   totalLow = materialCostLow + laborCostLow + demoCost + suppliesCost
 *   totalHigh = materialCostHigh + laborCostHigh + demoCost + suppliesCost
 *   totalMid = (totalLow + totalHigh) / 2
 *
 * Source: HomeAdvisor / Angi 2025-2026 national averages;
 *         Tile Council of North America
 */

export interface BacksplashTileCostInput {
  backsplashLength: number;
  backsplashLengthUnit: string;   // 'ft' | 'm'
  backsplashHeight: number;
  backsplashHeightUnit: string;   // 'ft' | 'm'
  tileType: string;               // 'ceramic-subway' | 'glass-mosaic' | 'natural-stone' | 'porcelain' | 'peel-and-stick'
  demoOldBacksplash: string;      // 'none' | 'yes'
  wasteFactor: number;            // percentage 5-25
  region: string;                 // 'national' | 'northeast' | 'west-coast' | 'mid-atlantic' | 'midwest' | 'south' | 'mountain-west'
}

export interface BacksplashTileCostOutput {
  area: number;
  materialArea: number;
  materialCost: number;
  laborCost: number;
  demoCost: number;
  suppliesCost: number;
  totalLow: number;
  totalHigh: number;
  totalMid: number;
  costPerSqFt: number;
  tileComparison: { label: string; value: number }[];
}

/**
 * Unit conversion factors to feet.
 */
const lengthToFeet: Record<string, number> = {
  ft: 1,
  m: 3.28084,
};

/**
 * Material cost per square foot by tile type (material portion only).
 * Source: HomeAdvisor / Angi 2025-2026 national averages.
 */
const MATERIAL_COSTS: Record<string, { low: number; high: number }> = {
  'ceramic-subway':  { low: 4,  high: 8 },
  'glass-mosaic':    { low: 7,  high: 14 },
  'natural-stone':   { low: 9,  high: 16 },
  'porcelain':       { low: 5,  high: 11 },
  'peel-and-stick':  { low: 2,  high: 5 },
};

/**
 * Labor cost per square foot by tile type.
 * Source: HomeAdvisor / Angi 2025-2026 national averages.
 */
const LABOR_COSTS: Record<string, { low: number; high: number }> = {
  'ceramic-subway':  { low: 6,  high: 12 },
  'glass-mosaic':    { low: 11, high: 21 },
  'natural-stone':   { low: 13, high: 24 },
  'porcelain':       { low: 7,  high: 17 },
  'peel-and-stick':  { low: 3,  high: 7 },
};

/**
 * Demo cost per square foot of existing backsplash.
 * Applied to raw area (not material area with waste).
 */
const DEMO_COSTS: Record<string, { low: number; high: number }> = {
  'none': { low: 0, high: 0 },
  'yes':  { low: 3, high: 6 },
};

/**
 * Regional labor multipliers.
 * Applied to labor portion only, not materials.
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
 * Supplies cost per square foot (grout, thin-set, spacers, trim).
 */
const SUPPLIES_PER_SQFT = 2.50;

/**
 * Display labels for tile types.
 */
const TILE_LABELS: Record<string, string> = {
  'ceramic-subway':  'Ceramic Subway',
  'glass-mosaic':    'Glass Mosaic',
  'natural-stone':   'Natural Stone',
  'porcelain':       'Porcelain',
  'peel-and-stick':  'Peel-and-Stick',
};

/**
 * Backsplash tile cost calculator.
 *
 * totalLow = materialCostLow + laborCostLow + demoCost + suppliesCost
 * totalHigh = materialCostHigh + laborCostHigh + demoCost + suppliesCost
 * totalMid = (totalLow + totalHigh) / 2
 *
 * Source: HomeAdvisor / Angi 2025-2026, Tile Council of North America.
 */
export function calculateBacksplashTileCost(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const rawLength = Number(inputs.backsplashLength) || 0;
  const rawHeight = Number(inputs.backsplashHeight) || 0;
  const lengthUnit = String(inputs.backsplashLengthUnit || 'ft');
  const heightUnit = String(inputs.backsplashHeightUnit || 'ft');
  const tileType = String(inputs.tileType || 'ceramic-subway');
  const demoOption = String(inputs.demoOldBacksplash || 'none');
  const wasteFactor = Math.max(0, Math.min(100, Number(inputs.wasteFactor) || 10));
  const region = String(inputs.region || 'national');

  // ── Convert to feet ───────────────────────────────────
  const lengthFt = rawLength * (lengthToFeet[lengthUnit] ?? 1);
  const heightFt = rawHeight * (lengthToFeet[heightUnit] ?? 1);

  // ── Calculate area ────────────────────────────────────
  const area = parseFloat((lengthFt * heightFt).toFixed(2));

  // ── Material area with waste ──────────────────────────
  const materialArea = parseFloat((area * (1 + wasteFactor / 100)).toFixed(2));

  // ── Look up rates ─────────────────────────────────────
  const matRates = MATERIAL_COSTS[tileType] ?? MATERIAL_COSTS['ceramic-subway'];
  const labRates = LABOR_COSTS[tileType] ?? LABOR_COSTS['ceramic-subway'];
  const demoRates = DEMO_COSTS[demoOption] ?? DEMO_COSTS['none'];
  const regionMult = REGIONAL_MULTIPLIERS[region] ?? 1.0;

  // ── Calculate costs ───────────────────────────────────
  const materialCostLow = parseFloat((materialArea * matRates.low).toFixed(2));
  const materialCostHigh = parseFloat((materialArea * matRates.high).toFixed(2));
  const laborCostLow = parseFloat((materialArea * labRates.low * regionMult).toFixed(2));
  const laborCostHigh = parseFloat((materialArea * labRates.high * regionMult).toFixed(2));
  const demoCostLow = parseFloat((area * demoRates.low).toFixed(2));
  const demoCostHigh = parseFloat((area * demoRates.high).toFixed(2));
  const demoCost = parseFloat(((demoCostLow + demoCostHigh) / 2).toFixed(2));
  const suppliesCost = parseFloat((area * SUPPLIES_PER_SQFT).toFixed(2));

  const totalLow = parseFloat((materialCostLow + laborCostLow + demoCostLow + suppliesCost).toFixed(2));
  const totalHigh = parseFloat((materialCostHigh + laborCostHigh + demoCostHigh + suppliesCost).toFixed(2));
  const totalMid = parseFloat(((totalLow + totalHigh) / 2).toFixed(2));
  const costPerSqFt = area > 0 ? parseFloat((totalMid / area).toFixed(2)) : 0;

  // ── Mid-point costs for display ───────────────────────
  const materialCost = parseFloat(((materialCostLow + materialCostHigh) / 2).toFixed(2));
  const laborCost = parseFloat(((laborCostLow + laborCostHigh) / 2).toFixed(2));

  // ── Tile comparison (all 5 types, national avg, no demo) ──
  const tileKeys = Object.keys(MATERIAL_COSTS);
  const tileComparison = tileKeys.map(key => {
    const mr = MATERIAL_COSTS[key];
    const lr = LABOR_COSTS[key];
    const matMid = materialArea * (mr.low + mr.high) / 2;
    const labMid = materialArea * (lr.low + lr.high) / 2;
    const mid = matMid + labMid + suppliesCost;
    return {
      label: `${TILE_LABELS[key]} ($${mr.low + lr.low}–$${mr.high + lr.high}/sq ft)`,
      value: parseFloat(mid.toFixed(2)),
    };
  });

  return {
    area,
    materialArea,
    materialCost,
    laborCost,
    demoCost,
    suppliesCost,
    totalLow,
    totalHigh,
    totalMid,
    costPerSqFt,
    tileComparison,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'backsplash-tile-cost': calculateBacksplashTileCost,
};
