/**
 * Crown Molding Cost Calculator Formula Module
 *
 * Estimates crown molding installation costs across five materials, four
 * profile complexities, and four ceiling heights. Calculates material,
 * paint, and labor costs per linear foot, then multiplies by room perimeter.
 * Regional multipliers apply to the labor portion only.
 *
 * Cost formula:
 *   materialCostPerFt = MATERIAL_RATES[moldingMaterial] × profileMultiplier
 *   paintCostPerFt = PAINT_COSTS[paintFinish]
 *   laborCostPerFt = LABOR_RATES × profileMultiplier × ceilingMultiplier × regionalMultiplier
 *   totalPerFt = materialCostPerFt + paintCostPerFt + laborCostPerFt
 *   total = totalPerFt × perimeter
 *
 * Source: HomeAdvisor / Angi 2025-2026 national averages;
 *         National Association of Home Builders (NAHB) trim cost data;
 *         Bureau of Labor Statistics (SOC 47-2031) for carpenter wages
 */

export interface CrownMoldingCostInput {
  roomPerimeter: string;     // 'small-40ft' | 'medium-60ft' | 'standard-80ft' | 'large-120ft' | 'xlarge-200ft'
  moldingMaterial: string;   // 'mdf-paint-grade' | 'pine-finger-joint' | 'solid-poplar' | 'solid-oak' | 'polyurethane-foam'
  moldingProfile: string;    // 'simple-cove' | 'standard-3-piece' | 'elaborate-5-piece' | 'custom-built-up'
  ceilingHeight: string;     // 'standard-8ft' | 'raised-9ft' | 'tall-10ft' | 'vaulted-over-10ft'
  paintFinish: string;       // 'unfinished' | 'primer-only' | 'one-coat' | 'two-coat-premium'
  region: string;            // 'national' | 'northeast' | 'west-coast' | 'mid-atlantic' | 'midwest' | 'south' | 'mountain-west'
}

export interface CrownMoldingCostOutput {
  materialCost: number;
  paintCost: number;
  laborCost: number;
  subtotalLow: number;
  subtotalHigh: number;
  subtotal: number;
  totalLow: number;
  totalHigh: number;
  totalMid: number;
  materialComparison: { label: string; value: number }[];
  timeline: string;
}

/**
 * Room perimeter values in linear feet.
 */
const PERIMETER_VALUES: Record<string, number> = {
  'small-40ft':   40,
  'medium-60ft':  60,
  'standard-80ft': 80,
  'large-120ft':  120,
  'xlarge-200ft': 200,
};

/**
 * Material cost per linear foot (material only, before profile multiplier).
 * Source: HomeAdvisor / Angi 2025-2026, NAHB.
 */
const MATERIAL_RATES: Record<string, { low: number; high: number }> = {
  'mdf-paint-grade':    { low: 1, high: 3 },
  'pine-finger-joint':  { low: 2, high: 5 },
  'solid-poplar':       { low: 3, high: 7 },
  'solid-oak':          { low: 5, high: 12 },
  'polyurethane-foam':  { low: 2, high: 6 },
};

/**
 * Profile complexity multipliers applied to material and labor costs.
 * Simple cove is baseline (1.0x).
 */
const PROFILE_MULTIPLIERS: Record<string, number> = {
  'simple-cove':       1.0,
  'standard-3-piece':  1.40,
  'elaborate-5-piece': 2.00,
  'custom-built-up':   2.75,
};

/**
 * Ceiling height multipliers applied to labor cost only.
 * Standard 8ft is baseline (1.0x).
 */
const CEILING_MULTIPLIERS: Record<string, number> = {
  'standard-8ft':     1.0,
  'raised-9ft':       1.10,
  'tall-10ft':        1.25,
  'vaulted-over-10ft': 1.50,
};

/**
 * Paint/finish add-on cost per linear foot.
 */
const PAINT_COSTS: Record<string, { low: number; high: number }> = {
  'unfinished':        { low: 0,    high: 0 },
  'primer-only':       { low: 0.50, high: 1.00 },
  'one-coat':          { low: 1.00, high: 2.00 },
  'two-coat-premium':  { low: 1.50, high: 3.00 },
};

/**
 * Base labor cost per linear foot (before profile/ceiling/regional multipliers).
 * Source: HomeAdvisor / Angi 2025-2026, BLS SOC 47-2031.
 */
const LABOR_RATES: { low: number; high: number } = { low: 3, high: 8 };

/**
 * Regional labor multipliers.
 * Applied to labor portion only, not materials.
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
 * Display labels for molding materials.
 */
const MATERIAL_LABELS: Record<string, string> = {
  'mdf-paint-grade':   'MDF (Paint Grade)',
  'pine-finger-joint': 'Pine (Finger Joint)',
  'solid-poplar':      'Solid Poplar',
  'solid-oak':         'Solid Oak',
  'polyurethane-foam': 'Polyurethane Foam',
};

/**
 * Crown molding cost calculator.
 *
 * materialPerFt = materialRate × profileMult
 * paintPerFt = paintRate
 * laborPerFt = laborRate × profileMult × ceilingMult × regionMult
 * total = (materialPerFt + paintPerFt + laborPerFt) × perimeter
 *
 * Source: HomeAdvisor / Angi 2025-2026, NAHB, BLS SOC 47-2031.
 */
export function calculateCrownMoldingCost(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const roomPerimeter = String(inputs.roomPerimeter || 'standard-80ft');
  const moldingMaterial = String(inputs.moldingMaterial || 'mdf-paint-grade');
  const moldingProfile = String(inputs.moldingProfile || 'simple-cove');
  const ceilingHeight = String(inputs.ceilingHeight || 'standard-8ft');
  const paintFinish = String(inputs.paintFinish || 'unfinished');
  const region = String(inputs.region || 'national');

  // ── Look up rates ─────────────────────────────────────
  const perimeter = PERIMETER_VALUES[roomPerimeter] ?? 80;
  const materialRates = MATERIAL_RATES[moldingMaterial] ?? MATERIAL_RATES['mdf-paint-grade'];
  const profileMult = PROFILE_MULTIPLIERS[moldingProfile] ?? 1.0;
  const ceilingMult = CEILING_MULTIPLIERS[ceilingHeight] ?? 1.0;
  const paintRates = PAINT_COSTS[paintFinish] ?? PAINT_COSTS['unfinished'];
  const regionMult = REGIONAL_MULTIPLIERS[region] ?? 1.0;

  // ── Material cost per linear foot (× profile multiplier) ─
  const materialPerFtLow = parseFloat((materialRates.low * profileMult).toFixed(2));
  const materialPerFtHigh = parseFloat((materialRates.high * profileMult).toFixed(2));

  // ── Paint cost per linear foot ────────────────────────
  const paintPerFtLow = parseFloat(paintRates.low.toFixed(2));
  const paintPerFtHigh = parseFloat(paintRates.high.toFixed(2));

  // ── Labor cost per linear foot (× profile × ceiling × regional) ─
  const laborPerFtLow = parseFloat((LABOR_RATES.low * profileMult * ceilingMult * regionMult).toFixed(2));
  const laborPerFtHigh = parseFloat((LABOR_RATES.high * profileMult * ceilingMult * regionMult).toFixed(2));

  // ── Total costs (per-foot rates × perimeter) ─────────
  const materialCostLow = parseFloat((materialPerFtLow * perimeter).toFixed(2));
  const materialCostHigh = parseFloat((materialPerFtHigh * perimeter).toFixed(2));

  const paintCostLow = parseFloat((paintPerFtLow * perimeter).toFixed(2));
  const paintCostHigh = parseFloat((paintPerFtHigh * perimeter).toFixed(2));

  const laborCostLow = parseFloat((laborPerFtLow * perimeter).toFixed(2));
  const laborCostHigh = parseFloat((laborPerFtHigh * perimeter).toFixed(2));

  // ── Subtotals (material + paint + labor at national rate) ─
  const subtotalLow = parseFloat((materialCostLow + paintCostLow + (LABOR_RATES.low * profileMult * ceilingMult * perimeter)).toFixed(2));
  const subtotalHigh = parseFloat((materialCostHigh + paintCostHigh + (LABOR_RATES.high * profileMult * ceilingMult * perimeter)).toFixed(2));

  // ── Totals ────────────────────────────────────────────
  const totalLow = parseFloat((materialCostLow + paintCostLow + laborCostLow).toFixed(2));
  const totalHigh = parseFloat((materialCostHigh + paintCostHigh + laborCostHigh).toFixed(2));
  const totalMid = parseFloat(((totalLow + totalHigh) / 2).toFixed(2));

  // ── Mid-point costs for display ───────────────────────
  const materialCost = parseFloat(((materialCostLow + materialCostHigh) / 2).toFixed(2));
  const paintCost = parseFloat(((paintCostLow + paintCostHigh) / 2).toFixed(2));
  const laborCost = parseFloat(((laborCostLow + laborCostHigh) / 2).toFixed(2));
  const subtotal = parseFloat(((subtotalLow + subtotalHigh) / 2).toFixed(2));

  // ── Material comparison (standard-80ft, simple cove, 8ft ceiling, unfinished, national) ──
  const materialKeys = Object.keys(MATERIAL_RATES);
  const comparisonPerimeter = 80;
  const materialComparison = materialKeys.map(key => {
    const mRates = MATERIAL_RATES[key];
    const midMat = (mRates.low + mRates.high) / 2;
    const midLabor = (LABOR_RATES.low + LABOR_RATES.high) / 2;
    const total = (midMat + midLabor) * comparisonPerimeter;
    return {
      label: MATERIAL_LABELS[key] ?? key,
      value: parseFloat(total.toFixed(2)),
    };
  });

  // ── Timeline ──────────────────────────────────────────
  const timeline = '1-3 days';

  return {
    materialCost,
    paintCost,
    laborCost,
    subtotalLow,
    subtotalHigh,
    subtotal,
    totalLow,
    totalHigh,
    totalMid,
    materialComparison,
    timeline,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'crown-molding-cost': calculateCrownMoldingCost,
};
