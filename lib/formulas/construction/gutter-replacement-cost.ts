/**
 * Gutter Replacement Cost Calculator Formula Module
 *
 * Estimates gutter installation/replacement costs across five materials:
 * aluminum, vinyl, steel, copper, and zinc. Priced per linear foot with
 * separate material and labor components. Regional multiplier applies
 * to labor only.
 *
 * Cost formula:
 *   materialCost = gutterLength × materialRate × styleMultiplier
 *   laborCost = gutterLength × (laborRate × styleMultiplier + storyAdj) × regionalMultiplier
 *   gutterCost = materialCost + laborCost
 *   downspoutCost = downspoutCount × downspoutRate
 *   guardCost = gutterLength × guardRate
 *   removalCost = gutterLength × removalRate
 *   total = gutterCost + downspoutCost + guardCost + removalCost
 *
 * Source: HomeAdvisor / Angi 2025-2026 national averages,
 *         Gutter Helmet, LeafFilter
 */

export interface GutterReplacementCostInput {
  gutterLength: number;
  gutterMaterial: string;   // 'aluminum' | 'vinyl' | 'steel' | 'copper' | 'zinc'
  gutterStyle: string;      // 'k-style' | 'half-round'
  downspoutCount: number;
  gutterGuards: string;     // 'none' | 'basic-screen' | 'micro-mesh' | 'reverse-curve'
  oldGutterRemoval: string; // 'none' | 'yes'
  stories: string;          // '1-story' | '2-story' | '3-story'
  region: string;
}

export interface GutterReplacementCostOutput {
  gutterLength: number;
  gutterCost: number;
  downspoutCost: number;
  guardCost: number;
  removalCost: number;
  totalLow: number;
  totalHigh: number;
  totalMid: number;
  costPerLinFt: number;
  materialComparison: { label: string; value: number }[];
  timeline: string;
}

/**
 * Material cost per linear foot (material portion only, ~40% of installed).
 * Source: HomeAdvisor / Angi 2025-2026.
 */
const MATERIAL_RATES: Record<string, { low: number; high: number }> = {
  'aluminum': { low: 2.40, high: 4.80 },
  'vinyl':    { low: 1.20, high: 2.80 },
  'steel':    { low: 3.20, high: 6.00 },
  'copper':   { low: 7.20, high: 14.00 },
  'zinc':     { low: 6.00, high: 10.00 },
};

/**
 * Labor cost per linear foot (~60% of installed).
 * Source: HomeAdvisor / Angi 2025-2026.
 */
const LABOR_RATES: Record<string, { low: number; high: number }> = {
  'aluminum': { low: 3.60, high: 7.20 },
  'vinyl':    { low: 1.80, high: 4.20 },
  'steel':    { low: 4.80, high: 9.00 },
  'copper':   { low: 10.80, high: 21.00 },
  'zinc':     { low: 9.00, high: 15.00 },
};

/**
 * Installed cost per linear foot (material + labor combined) for comparison display.
 */
const INSTALLED_RATES: Record<string, { low: number; high: number }> = {
  'aluminum': { low: 6, high: 12 },
  'vinyl':    { low: 3, high: 7 },
  'steel':    { low: 8, high: 15 },
  'copper':   { low: 18, high: 35 },
  'zinc':     { low: 15, high: 25 },
};

/**
 * Style multipliers.
 * K-style: 1.0x (standard residential)
 * Half-round: 1.25x (traditional/upscale)
 */
const STYLE_MULTIPLIERS: Record<string, number> = {
  'k-style':    1.0,
  'half-round': 1.25,
};

/**
 * Story labor adjustment per linear foot (added to labor before regional multiplier).
 */
const STORY_ADJUSTMENTS: Record<string, number> = {
  '1-story': 0,
  '2-story': 1.50,
  '3-story': 4.00,
};

/**
 * Downspout cost per unit.
 */
const DOWNSPOUT_COST = { low: 15, high: 25 };

/**
 * Gutter guard cost per linear foot.
 */
const GUARD_RATES: Record<string, { low: number; high: number }> = {
  'none':          { low: 0, high: 0 },
  'basic-screen':  { low: 4, high: 6 },
  'micro-mesh':    { low: 6, high: 10 },
  'reverse-curve': { low: 7, high: 12 },
};

/**
 * Old gutter removal cost per linear foot.
 */
const REMOVAL_RATES: Record<string, { low: number; high: number }> = {
  'none': { low: 0, high: 0 },
  'yes':  { low: 1.50, high: 3.00 },
};

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
 * Material display names.
 */
const MATERIAL_LABELS: Record<string, string> = {
  'aluminum': 'Aluminum',
  'vinyl':    'Vinyl',
  'steel':    'Steel',
  'copper':   'Copper',
  'zinc':     'Zinc',
};

/**
 * Timeline estimates per material.
 */
const TIMELINE_ESTIMATES: Record<string, string> = {
  'aluminum': '1–2 days',
  'vinyl':    '1 day',
  'steel':    '1–2 days',
  'copper':   '2–4 days (custom fabrication)',
  'zinc':     '2–3 days (custom fabrication)',
};

/**
 * Gutter replacement cost calculator.
 *
 * materialCost = gutterLength × materialRate × styleMultiplier
 * laborCost = gutterLength × (laborRate × styleMultiplier + storyAdj) × regionalMultiplier
 * gutterCost = materialCost + laborCost
 * downspoutCost = downspoutCount × downspoutRate
 * guardCost = gutterLength × guardRate
 * removalCost = gutterLength × removalRate
 * total = gutterCost + downspoutCost + guardCost + removalCost
 *
 * Source: HomeAdvisor / Angi 2025-2026, Gutter Helmet, LeafFilter.
 */
export function calculateGutterReplacementCost(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const gutterLength = Math.max(0, Number(inputs.gutterLength) || 0);
  const gutterMaterial = String(inputs.gutterMaterial || 'aluminum');
  const gutterStyle = String(inputs.gutterStyle || 'k-style');
  const downspoutCount = Math.max(0, Number(inputs.downspoutCount) || 0);
  const gutterGuards = String(inputs.gutterGuards || 'none');
  const oldGutterRemoval = String(inputs.oldGutterRemoval || 'none');
  const stories = String(inputs.stories || '1-story');
  const region = String(inputs.region || 'national');

  // ── Look up rates ─────────────────────────────────────
  const matRates = MATERIAL_RATES[gutterMaterial] ?? MATERIAL_RATES['aluminum'];
  const labRates = LABOR_RATES[gutterMaterial] ?? LABOR_RATES['aluminum'];
  const styleMultiplier = STYLE_MULTIPLIERS[gutterStyle] ?? 1.0;
  const storyAdj = STORY_ADJUSTMENTS[stories] ?? 0;
  const regionalMultiplier = REGIONAL_MULTIPLIERS[region] ?? 1.0;
  const guardRate = GUARD_RATES[gutterGuards] ?? GUARD_RATES['none'];
  const removalRate = REMOVAL_RATES[oldGutterRemoval] ?? REMOVAL_RATES['none'];

  // ── Calculate gutter material cost ────────────────────
  const materialCostLow = parseFloat((gutterLength * matRates.low * styleMultiplier).toFixed(2));
  const materialCostHigh = parseFloat((gutterLength * matRates.high * styleMultiplier).toFixed(2));

  // ── Calculate gutter labor cost ───────────────────────
  const laborCostLow = parseFloat((gutterLength * (labRates.low * styleMultiplier + storyAdj) * regionalMultiplier).toFixed(2));
  const laborCostHigh = parseFloat((gutterLength * (labRates.high * styleMultiplier + storyAdj) * regionalMultiplier).toFixed(2));

  // ── Combined gutter cost ──────────────────────────────
  const gutterCostLow = parseFloat((materialCostLow + laborCostLow).toFixed(2));
  const gutterCostHigh = parseFloat((materialCostHigh + laborCostHigh).toFixed(2));
  const gutterCostMid = parseFloat(((gutterCostLow + gutterCostHigh) / 2).toFixed(2));

  // ── Downspout cost ────────────────────────────────────
  const downspoutCostLow = parseFloat((downspoutCount * DOWNSPOUT_COST.low).toFixed(2));
  const downspoutCostHigh = parseFloat((downspoutCount * DOWNSPOUT_COST.high).toFixed(2));
  const downspoutCostMid = parseFloat(((downspoutCostLow + downspoutCostHigh) / 2).toFixed(2));

  // ── Gutter guard cost ─────────────────────────────────
  const guardCostLow = parseFloat((gutterLength * guardRate.low).toFixed(2));
  const guardCostHigh = parseFloat((gutterLength * guardRate.high).toFixed(2));
  const guardCostMid = parseFloat(((guardCostLow + guardCostHigh) / 2).toFixed(2));

  // ── Old gutter removal cost ───────────────────────────
  const removalCostLow = parseFloat((gutterLength * removalRate.low).toFixed(2));
  const removalCostHigh = parseFloat((gutterLength * removalRate.high).toFixed(2));
  const removalCostMid = parseFloat(((removalCostLow + removalCostHigh) / 2).toFixed(2));

  // ── Totals ────────────────────────────────────────────
  const totalLow = parseFloat((gutterCostLow + downspoutCostLow + guardCostLow + removalCostLow).toFixed(2));
  const totalHigh = parseFloat((gutterCostHigh + downspoutCostHigh + guardCostHigh + removalCostHigh).toFixed(2));
  const totalMid = parseFloat(((totalLow + totalHigh) / 2).toFixed(2));
  const costPerLinFt = gutterLength > 0 ? parseFloat((totalMid / gutterLength).toFixed(2)) : 0;

  // ── Material comparison (all 5 at k-style, 1-story, national, no guards/removal) ──
  const materialKeys = Object.keys(INSTALLED_RATES);
  const materialComparison = materialKeys.map(key => {
    const r = INSTALLED_RATES[key];
    const mid = gutterLength * (r.low + r.high) / 2;
    return {
      label: `${MATERIAL_LABELS[key]} ($${r.low}–$${r.high}/lin ft)`,
      value: parseFloat(mid.toFixed(2)),
    };
  });

  // ── Timeline ──────────────────────────────────────────
  const timeline = TIMELINE_ESTIMATES[gutterMaterial] ?? '1–2 days';

  return {
    gutterLength,
    gutterCost: gutterCostMid,
    downspoutCost: downspoutCostMid,
    guardCost: guardCostMid,
    removalCost: removalCostMid,
    totalLow,
    totalHigh,
    totalMid,
    costPerLinFt,
    materialComparison,
    timeline,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'gutter-replacement-cost': calculateGutterReplacementCost,
};
