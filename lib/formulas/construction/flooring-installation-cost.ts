/**
 * Flooring Installation Cost Calculator Formula Module
 *
 * Estimates flooring installation costs across six types: hardwood,
 * laminate, vinyl-plank, tile, carpet, and engineered-hardwood.
 * Includes old floor removal, subfloor prep, underlayment, and
 * trim/transition costs. Regional multiplier applies to labor only.
 *
 * Cost formula:
 *   area = roomLength × roomWidth (in feet)
 *   materialArea = area × (1 + wasteFactor/100)
 *   materialCost = materialArea × materialRate
 *   laborCost = materialArea × laborRate × regionalMultiplier
 *   removalCost = area × removalRate
 *   subfloorCost = area × subfloorRate
 *   underlaymentCost = area × underlaymentRate
 *   trimCost = 2 × (roomLength + roomWidth) × $3
 *   total = materialCost + laborCost + removalCost + subfloorCost + underlaymentCost + trimCost
 *
 * Source: HomeAdvisor / Angi 2025-2026 national averages,
 *         National Wood Flooring Association (NWFA)
 */

export interface FlooringInstallationCostInput {
  roomLength: number;
  roomLengthUnit: string;     // 'ft' | 'm'
  roomWidth: number;
  roomWidthUnit: string;      // 'ft' | 'm'
  flooringType: string;       // 'hardwood' | 'laminate' | 'vinyl-plank' | 'tile' | 'carpet' | 'engineered-hardwood'
  removeOldFloor: string;     // 'none' | 'carpet-removal' | 'hardwood-removal' | 'tile-removal'
  subfloorPrep: string;       // 'none' | 'minor-repair' | 'full-leveling'
  underlayment: string;       // 'none' | 'standard' | 'premium'
  wasteFactor: number;        // percentage, default 10
  region: string;
}

export interface FlooringInstallationCostOutput {
  area: number;
  materialArea: number;
  materialCost: number;
  laborCost: number;
  removalCost: number;
  subfloorCost: number;
  underlaymentCost: number;
  trimCost: number;
  totalLow: number;
  totalHigh: number;
  totalMid: number;
  costPerSqFt: number;
  flooringComparison: { label: string; value: number }[];
  timeline: string;
}

/**
 * Unit conversion factors to feet.
 */
const lengthToFeet: Record<string, number> = {
  ft: 1,
  m: 3.28084,
};

/**
 * Material cost per sq ft (~45% of installed).
 * Source: HomeAdvisor / Angi 2025-2026.
 */
const MATERIAL_RATES: Record<string, { low: number; high: number }> = {
  'hardwood':            { low: 2.70, high: 8.10 },
  'laminate':            { low: 1.35, high: 3.60 },
  'vinyl-plank':         { low: 1.80, high: 4.50 },
  'tile':                { low: 3.15, high: 7.20 },
  'carpet':              { low: 1.35, high: 3.60 },
  'engineered-hardwood': { low: 2.25, high: 6.30 },
};

/**
 * Labor cost per sq ft (~55% of installed).
 * Source: HomeAdvisor / Angi 2025-2026.
 */
const LABOR_RATES: Record<string, { low: number; high: number }> = {
  'hardwood':            { low: 3.30, high: 9.90 },
  'laminate':            { low: 1.65, high: 4.40 },
  'vinyl-plank':         { low: 2.20, high: 5.50 },
  'tile':                { low: 3.85, high: 8.80 },
  'carpet':              { low: 1.65, high: 4.40 },
  'engineered-hardwood': { low: 2.75, high: 7.70 },
};

/**
 * Installed cost per sq ft (material + labor combined) for comparison display.
 */
const INSTALLED_RATES: Record<string, { low: number; high: number }> = {
  'hardwood':            { low: 6, high: 18 },
  'laminate':            { low: 3, high: 8 },
  'vinyl-plank':         { low: 4, high: 10 },
  'tile':                { low: 7, high: 16 },
  'carpet':              { low: 3, high: 8 },
  'engineered-hardwood': { low: 5, high: 14 },
};

/**
 * Old floor removal cost per sq ft (applied to raw area, not materialArea).
 */
const REMOVAL_RATES: Record<string, { low: number; high: number }> = {
  'none':             { low: 0, high: 0 },
  'carpet-removal':   { low: 1, high: 2 },
  'hardwood-removal': { low: 2, high: 4 },
  'tile-removal':     { low: 3, high: 5 },
};

/**
 * Subfloor preparation cost per sq ft (applied to raw area).
 */
const SUBFLOOR_RATES: Record<string, { low: number; high: number }> = {
  'none':          { low: 0, high: 0 },
  'minor-repair':  { low: 1.50, high: 3.00 },
  'full-leveling': { low: 3.00, high: 6.00 },
};

/**
 * Underlayment cost per sq ft (applied to raw area).
 */
const UNDERLAYMENT_RATES: Record<string, { low: number; high: number }> = {
  'none':     { low: 0, high: 0 },
  'standard': { low: 0.50, high: 1.50 },
  'premium':  { low: 1.50, high: 3.00 },
};

/**
 * Trim/transition cost per linear foot of perimeter.
 */
const TRIM_COST_PER_LINFT = 3;

/**
 * Regional labor multipliers. Applies to labor only, not materials.
 */
const REGIONAL_MULTIPLIERS: Record<string, number> = {
  'national':      1.0,
  'northeast':     1.20,
  'west-coast':    1.25,
  'mid-atlantic':  1.15,
  'midwest':       0.90,
  'south':         0.85,
  'mountain-west': 0.95,
};

/**
 * Flooring type display names.
 */
const FLOORING_LABELS: Record<string, string> = {
  'hardwood':            'Hardwood',
  'laminate':            'Laminate',
  'vinyl-plank':         'Vinyl Plank',
  'tile':                'Tile',
  'carpet':              'Carpet',
  'engineered-hardwood': 'Engineered Hardwood',
};

/**
 * Timeline estimates per flooring type.
 */
const TIMELINE_ESTIMATES: Record<string, string> = {
  'hardwood':            '3–5 days (plus acclimation)',
  'laminate':            '1–3 days',
  'vinyl-plank':         '1–2 days',
  'tile':                '3–7 days (plus grout cure)',
  'carpet':              '1 day',
  'engineered-hardwood': '2–4 days',
};

/**
 * Flooring installation cost calculator.
 *
 * area = roomLength × roomWidth
 * materialArea = area × (1 + wasteFactor / 100)
 * materialCost = materialArea × materialRate
 * laborCost = materialArea × laborRate × regionalMultiplier
 * removalCost = area × removalRate
 * subfloorCost = area × subfloorRate
 * underlaymentCost = area × underlaymentRate
 * trimCost = 2 × (roomLength + roomWidth) × $3
 * total = materialCost + laborCost + removalCost + subfloorCost + underlaymentCost + trimCost
 *
 * Source: HomeAdvisor / Angi 2025-2026, NWFA.
 */
export function calculateFlooringInstallationCost(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const rawLength = Math.max(0, Number(inputs.roomLength) || 0);
  const rawWidth = Math.max(0, Number(inputs.roomWidth) || 0);
  const lengthUnit = String(inputs.roomLengthUnit || 'ft');
  const widthUnit = String(inputs.roomWidthUnit || 'ft');
  const flooringType = String(inputs.flooringType || 'hardwood');
  const removeOldFloor = String(inputs.removeOldFloor || 'none');
  const subfloorPrep = String(inputs.subfloorPrep || 'none');
  const underlayment = String(inputs.underlayment || 'none');
  const wasteFactor = Math.max(0, Math.min(100, Number(inputs.wasteFactor) || 10));
  const region = String(inputs.region || 'national');

  // ── Convert to feet ───────────────────────────────────
  const lengthFt = rawLength * (lengthToFeet[lengthUnit] ?? 1);
  const widthFt = rawWidth * (lengthToFeet[widthUnit] ?? 1);

  // ── Calculate areas ───────────────────────────────────
  const area = parseFloat((lengthFt * widthFt).toFixed(2));
  const materialArea = parseFloat((area * (1 + wasteFactor / 100)).toFixed(2));

  // ── Look up rates ─────────────────────────────────────
  const matRates = MATERIAL_RATES[flooringType] ?? MATERIAL_RATES['hardwood'];
  const labRates = LABOR_RATES[flooringType] ?? LABOR_RATES['hardwood'];
  const regionalMultiplier = REGIONAL_MULTIPLIERS[region] ?? 1.0;
  const removalRate = REMOVAL_RATES[removeOldFloor] ?? REMOVAL_RATES['none'];
  const subfloorRate = SUBFLOOR_RATES[subfloorPrep] ?? SUBFLOOR_RATES['none'];
  const underlayRate = UNDERLAYMENT_RATES[underlayment] ?? UNDERLAYMENT_RATES['none'];

  // ── Calculate material cost ───────────────────────────
  const materialCostLow = parseFloat((materialArea * matRates.low).toFixed(2));
  const materialCostHigh = parseFloat((materialArea * matRates.high).toFixed(2));
  const materialCostMid = parseFloat(((materialCostLow + materialCostHigh) / 2).toFixed(2));

  // ── Calculate labor cost ──────────────────────────────
  const laborCostLow = parseFloat((materialArea * labRates.low * regionalMultiplier).toFixed(2));
  const laborCostHigh = parseFloat((materialArea * labRates.high * regionalMultiplier).toFixed(2));
  const laborCostMid = parseFloat(((laborCostLow + laborCostHigh) / 2).toFixed(2));

  // ── Calculate removal cost (uses raw area) ────────────
  const removalCostLow = parseFloat((area * removalRate.low).toFixed(2));
  const removalCostHigh = parseFloat((area * removalRate.high).toFixed(2));
  const removalCostMid = parseFloat(((removalCostLow + removalCostHigh) / 2).toFixed(2));

  // ── Calculate subfloor cost (uses raw area) ───────────
  const subfloorCostLow = parseFloat((area * subfloorRate.low).toFixed(2));
  const subfloorCostHigh = parseFloat((area * subfloorRate.high).toFixed(2));
  const subfloorCostMid = parseFloat(((subfloorCostLow + subfloorCostHigh) / 2).toFixed(2));

  // ── Calculate underlayment cost (uses raw area) ───────
  const underlayCostLow = parseFloat((area * underlayRate.low).toFixed(2));
  const underlayCostHigh = parseFloat((area * underlayRate.high).toFixed(2));
  const underlayCostMid = parseFloat(((underlayCostLow + underlayCostHigh) / 2).toFixed(2));

  // ── Calculate trim cost ───────────────────────────────
  const perimeter = 2 * (lengthFt + widthFt);
  const trimCost = parseFloat((perimeter * TRIM_COST_PER_LINFT).toFixed(2));

  // ── Totals ────────────────────────────────────────────
  const totalLow = parseFloat((materialCostLow + laborCostLow + removalCostLow + subfloorCostLow + underlayCostLow + trimCost).toFixed(2));
  const totalHigh = parseFloat((materialCostHigh + laborCostHigh + removalCostHigh + subfloorCostHigh + underlayCostHigh + trimCost).toFixed(2));
  const totalMid = parseFloat(((totalLow + totalHigh) / 2).toFixed(2));
  const costPerSqFt = area > 0 ? parseFloat((totalMid / area).toFixed(2)) : 0;

  // ── Flooring type comparison (all 6 at national, no extras) ──
  const flooringKeys = Object.keys(INSTALLED_RATES);
  const flooringComparison = flooringKeys.map(key => {
    const r = INSTALLED_RATES[key];
    const mid = area * (r.low + r.high) / 2;
    return {
      label: `${FLOORING_LABELS[key]} ($${r.low}–$${r.high}/sq ft)`,
      value: parseFloat(mid.toFixed(2)),
    };
  });

  // ── Timeline ──────────────────────────────────────────
  const timeline = TIMELINE_ESTIMATES[flooringType] ?? '2–5 days';

  return {
    area,
    materialArea,
    materialCost: materialCostMid,
    laborCost: laborCostMid,
    removalCost: removalCostMid,
    subfloorCost: subfloorCostMid,
    underlaymentCost: underlayCostMid,
    trimCost,
    totalLow,
    totalHigh,
    totalMid,
    costPerSqFt,
    flooringComparison,
    timeline,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'flooring-installation-cost': calculateFlooringInstallationCost,
};
