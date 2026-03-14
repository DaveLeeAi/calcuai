/**
 * Accessibility Remodel Cost Calculator Formula Module
 *
 * Estimates accessibility/ADA remodeling costs across five project scopes:
 * basic grab bars, bathroom ADA, kitchen ADA, entrance ramp, and whole-home.
 * Includes mobility level multiplier, bathroom modifications, doorway widening,
 * flooring changes, and regional labor multipliers.
 *
 * Cost formula:
 *   baseLow / baseHigh = scope base cost range
 *   adjustedBaseLow = baseLow × mobilityMultiplier
 *   adjustedBaseHigh = baseHigh × mobilityMultiplier
 *   bathroomCost = bathroom modification add-on range
 *   doorwayCost = doorway widening add-on range
 *   flooringCost = flooring changes add-on range
 *   laborCost = baseCost × 0.45 × regionalMultiplier
 *   totalLow = adjustedBaseLow + bathroomLow + doorwayLow + flooringLow + laborLow
 *   totalHigh = adjustedBaseHigh + bathroomHigh + doorwayHigh + flooringHigh + laborHigh
 *   totalMid = (totalLow + totalHigh) / 2
 *
 * Source: HomeAdvisor / Angi 2025-2026 national averages;
 *         National Association of Home Builders (NAHB) Aging-in-Place data
 */

export interface AccessibilityRemodelCostInput {
  projectScope: string;    // 'basic-grab-bars' | 'bathroom-ada' | 'kitchen-ada' | 'entrance-ramp' | 'whole-home'
  mobilityLevel: string;   // 'ambulatory-assist' | 'wheelchair-partial' | 'wheelchair-full'
  bathroomMods: string;    // 'none' | 'grab-bars-only' | 'roll-in-shower' | 'full-ada-bathroom'
  doorwayWidening: string; // 'none' | '1-2-doorways' | '3-5-doorways' | '6-plus-doorways'
  flooringChanges: string; // 'none' | 'threshold-removal' | 'full-non-slip'
  region: string;          // 'national' | 'northeast' | 'west-coast' | 'mid-atlantic' | 'midwest' | 'south' | 'mountain-west'
}

export interface AccessibilityRemodelCostOutput {
  baseCost: number;
  bathroomCost: number;
  doorwayCost: number;
  flooringCost: number;
  laborCost: number;
  subtotalLow: number;
  subtotalHigh: number;
  subtotal: number;
  totalLow: number;
  totalHigh: number;
  totalMid: number;
  scopeComparison: { label: string; value: number }[];
  timeline: string;
}

/**
 * Project scope base cost ranges.
 * Source: HomeAdvisor / Angi 2025-2026.
 */
const SCOPE_COSTS: Record<string, { low: number; high: number }> = {
  'basic-grab-bars': { low: 500,   high: 1500 },
  'bathroom-ada':    { low: 5000,  high: 15000 },
  'kitchen-ada':     { low: 8000,  high: 20000 },
  'entrance-ramp':   { low: 2000,  high: 8000 },
  'whole-home':      { low: 20000, high: 100000 },
};

/**
 * Mobility level multipliers applied to base cost.
 * Higher mobility needs require more extensive modifications.
 * Source: NAHB Aging-in-Place Specialist data 2025.
 */
const MOBILITY_MULTIPLIERS: Record<string, number> = {
  'ambulatory-assist':  1.0,
  'wheelchair-partial': 1.25,
  'wheelchair-full':    1.50,
};

/**
 * Bathroom modification add-on cost ranges.
 * Source: HomeAdvisor / Angi 2025-2026.
 */
const BATHROOM_COSTS: Record<string, { low: number; high: number }> = {
  'none':             { low: 0,    high: 0 },
  'grab-bars-only':   { low: 200,  high: 600 },
  'roll-in-shower':   { low: 3000, high: 8000 },
  'full-ada-bathroom':{ low: 8000, high: 20000 },
};

/**
 * Doorway widening add-on cost ranges.
 * Source: HomeAdvisor / Angi 2025-2026.
 */
const DOORWAY_COSTS: Record<string, { low: number; high: number }> = {
  'none':           { low: 0,    high: 0 },
  '1-2-doorways':   { low: 500,  high: 1500 },
  '3-5-doorways':   { low: 1500, high: 4000 },
  '6-plus-doorways':{ low: 3000, high: 8000 },
};

/**
 * Flooring changes add-on cost ranges.
 * Source: HomeAdvisor / Angi 2025-2026.
 */
const FLOORING_COSTS: Record<string, { low: number; high: number }> = {
  'none':              { low: 0,    high: 0 },
  'threshold-removal': { low: 300,  high: 800 },
  'full-non-slip':     { low: 2000, high: 6000 },
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
 * Display labels for project scopes.
 */
const SCOPE_LABELS: Record<string, string> = {
  'basic-grab-bars': 'Basic Grab Bars',
  'bathroom-ada':    'Bathroom ADA Remodel',
  'kitchen-ada':     'Kitchen ADA Remodel',
  'entrance-ramp':   'Entrance Ramp',
  'whole-home':      'Whole-Home Accessibility',
};

/**
 * Timeline estimates by project scope.
 */
const TIMELINE_ESTIMATES: Record<string, string> = {
  'basic-grab-bars': '1-2 hours',
  'bathroom-ada':    '1-3 weeks',
  'kitchen-ada':     '2-4 weeks',
  'entrance-ramp':   '2-5 days',
  'whole-home':      '4-12 weeks',
};

/**
 * Accessibility remodel cost calculator.
 *
 * totalLow = adjustedBaseLow + bathroomLow + doorwayLow + flooringLow + laborLow
 * totalHigh = adjustedBaseHigh + bathroomHigh + doorwayHigh + flooringHigh + laborHigh
 * totalMid = (totalLow + totalHigh) / 2
 *
 * Source: HomeAdvisor / Angi 2025-2026, NAHB Aging-in-Place.
 */
export function calculateAccessibilityRemodelCost(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const projectScope = String(inputs.projectScope || 'bathroom-ada');
  const mobilityLevel = String(inputs.mobilityLevel || 'ambulatory-assist');
  const bathroomMods = String(inputs.bathroomMods || 'none');
  const doorwayWidening = String(inputs.doorwayWidening || 'none');
  const flooringChanges = String(inputs.flooringChanges || 'none');
  const region = String(inputs.region || 'national');

  // ── Look up rates ─────────────────────────────────────
  const scopeRange = SCOPE_COSTS[projectScope] ?? SCOPE_COSTS['bathroom-ada'];
  const mobilityMult = MOBILITY_MULTIPLIERS[mobilityLevel] ?? 1.0;
  const bathroomRange = BATHROOM_COSTS[bathroomMods] ?? BATHROOM_COSTS['none'];
  const doorwayRange = DOORWAY_COSTS[doorwayWidening] ?? DOORWAY_COSTS['none'];
  const flooringRange = FLOORING_COSTS[flooringChanges] ?? FLOORING_COSTS['none'];
  const regionMult = REGIONAL_MULTIPLIERS[region] ?? 1.0;

  // ── Calculate mobility-adjusted base cost ─────────────
  const adjustedBaseLow = parseFloat((scopeRange.low * mobilityMult).toFixed(2));
  const adjustedBaseHigh = parseFloat((scopeRange.high * mobilityMult).toFixed(2));

  // ── Labor cost (45% of base cost × regional multiplier) ──
  const laborLow = parseFloat((scopeRange.low * 0.45 * regionMult).toFixed(2));
  const laborHigh = parseFloat((scopeRange.high * 0.45 * regionMult).toFixed(2));

  // ── Totals ────────────────────────────────────────────
  const totalLow = parseFloat((adjustedBaseLow + bathroomRange.low + doorwayRange.low + flooringRange.low + laborLow).toFixed(2));
  const totalHigh = parseFloat((adjustedBaseHigh + bathroomRange.high + doorwayRange.high + flooringRange.high + laborHigh).toFixed(2));
  const totalMid = parseFloat(((totalLow + totalHigh) / 2).toFixed(2));

  // ── Mid-point costs for display ───────────────────────
  const baseCost = parseFloat(((adjustedBaseLow + adjustedBaseHigh) / 2).toFixed(2));
  const bathroomCost = parseFloat(((bathroomRange.low + bathroomRange.high) / 2).toFixed(2));
  const doorwayCost = parseFloat(((doorwayRange.low + doorwayRange.high) / 2).toFixed(2));
  const flooringCost = parseFloat(((flooringRange.low + flooringRange.high) / 2).toFixed(2));
  const laborCost = parseFloat(((laborLow + laborHigh) / 2).toFixed(2));
  const subtotalLow = totalLow;
  const subtotalHigh = totalHigh;
  const subtotal = totalMid;

  // ── Scope comparison (all scopes, ambulatory-assist, no add-ons, national) ──
  const scopeKeys = Object.keys(SCOPE_COSTS);
  const scopeComparison = scopeKeys.map(key => {
    const range = SCOPE_COSTS[key];
    const midBase = (range.low + range.high) / 2;
    const midLabor = midBase * 0.45;
    const mid = midBase + midLabor;
    return {
      label: `${SCOPE_LABELS[key]} ($${range.low.toLocaleString()}–$${range.high.toLocaleString()})`,
      value: parseFloat(mid.toFixed(2)),
    };
  });

  // ── Timeline ──────────────────────────────────────────
  const timeline = TIMELINE_ESTIMATES[projectScope] ?? '1-4 weeks';

  return {
    baseCost,
    bathroomCost,
    doorwayCost,
    flooringCost,
    laborCost,
    subtotalLow,
    subtotalHigh,
    subtotal,
    totalLow,
    totalHigh,
    totalMid,
    scopeComparison,
    timeline,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'accessibility-remodel-cost': calculateAccessibilityRemodelCost,
};
