/**
 * Whole House Repipe Cost Calculator Formula Module
 *
 * Estimates whole-house repiping costs across three pipe materials:
 * copper, PEX, and CPVC. Factors in home size, stories, bathroom count,
 * wall repair, permits, and regional labor multipliers.
 *
 * Cost formula:
 *   baseLow/baseHigh = HOME_SIZE_COSTS[homeSize]
 *   adjusted = base × pipeMaterial mult × stories mult × bathrooms mult
 *   materialCost = adjusted × 0.35
 *   laborCost = adjusted × 0.65 × regionalMultiplier
 *   pipingCost = materialCost + laborCost
 *   wallRepairCost = WALL_REPAIR[wallRepair] midpoint
 *   permitCost = PERMIT_COSTS midpoint if toggle on
 *   totalLow = pipingCostLow + wallRepairLow + permitLow
 *   totalHigh = pipingCostHigh + wallRepairHigh + permitHigh
 *   totalMid = (totalLow + totalHigh) / 2
 *
 * Source: HomeAdvisor / Angi 2025-2026 national averages;
 *         Plumbing-Heating-Cooling Contractors Association (PHCC)
 */

export interface WholeHouseRepipeCostInput {
  homeSize: string;       // 'small-under-1000' | 'medium-1000-1500' | 'large-1500-2500' | 'xlarge-over-2500'
  pipeMaterial: string;   // 'copper' | 'pex' | 'cpvc'
  stories: string;        // '1-story' | '2-story' | '3-story'
  bathrooms: string;      // '1-bath' | '2-bath' | '3-bath' | '4-plus-bath'
  wallRepair: string;     // 'none' | 'drywall-patches' | 'full-drywall-repair'
  permitRequired: string; // 'yes' | 'no'
  region: string;         // 'national' | 'northeast' | 'west-coast' | 'mid-atlantic' | 'midwest' | 'south' | 'mountain-west'
}

export interface WholeHouseRepipeCostOutput {
  pipingCost: number;
  materialCost: number;
  laborCost: number;
  wallRepairCost: number;
  permitCost: number;
  totalLow: number;
  totalHigh: number;
  totalMid: number;
  costPerBathroom: number;
  materialComparison: { label: string; value: number }[];
  timeline: string;
}

/**
 * Base cost ranges by home size (before multipliers).
 * Source: HomeAdvisor / Angi 2025-2026 national averages.
 */
const HOME_SIZE_COSTS: Record<string, { low: number; high: number }> = {
  'small-under-1000':  { low: 3000,  high: 5000 },
  'medium-1000-1500':  { low: 4500,  high: 8000 },
  'large-1500-2500':   { low: 7000,  high: 13000 },
  'xlarge-over-2500':  { low: 10000, high: 18000 },
};

/**
 * Pipe material multipliers.
 * Copper is baseline (1.0x), PEX is 40% cheaper, CPVC is 45% cheaper.
 */
const PIPE_MATERIAL_MULTIPLIERS: Record<string, number> = {
  'copper': 1.0,
  'pex':    0.60,
  'cpvc':   0.55,
};

/**
 * Story multipliers — additional labor for multi-story access.
 */
const STORY_MULTIPLIERS: Record<string, number> = {
  '1-story': 1.0,
  '2-story': 1.15,
  '3-story': 1.30,
};

/**
 * Bathroom count multipliers — more fixtures = more pipe runs.
 */
const BATHROOM_MULTIPLIERS: Record<string, number> = {
  '1-bath':      0.85,
  '2-bath':      1.0,
  '3-bath':      1.15,
  '4-plus-bath': 1.30,
};

/**
 * Wall repair cost ranges (flat adder, not per-sq-ft).
 */
const WALL_REPAIR_COSTS: Record<string, { low: number; high: number }> = {
  'none':               { low: 0,    high: 0 },
  'drywall-patches':    { low: 500,  high: 1500 },
  'full-drywall-repair': { low: 1500, high: 4000 },
};

/**
 * Permit cost range.
 */
const PERMIT_COSTS = { low: 200, high: 500 };

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
 * Display labels for pipe materials.
 */
const MATERIAL_LABELS: Record<string, string> = {
  'copper': 'Copper (1.0x)',
  'pex':    'PEX (0.60x)',
  'cpvc':   'CPVC (0.55x)',
};

/**
 * Bathroom count numeric mapping for costPerBathroom.
 */
const BATHROOM_COUNTS: Record<string, number> = {
  '1-bath':      1,
  '2-bath':      2,
  '3-bath':      3,
  '4-plus-bath': 4,
};

/**
 * Timeline estimates by home size.
 */
const TIMELINES: Record<string, string> = {
  'small-under-1000':  '2–4 days',
  'medium-1000-1500':  '3–5 days',
  'large-1500-2500':   '4–7 days',
  'xlarge-over-2500':  '5–10 days',
};

/**
 * Whole house repipe cost calculator.
 *
 * totalLow = pipingCostLow + wallRepairLow + permitLow
 * totalHigh = pipingCostHigh + wallRepairHigh + permitHigh
 * totalMid = (totalLow + totalHigh) / 2
 *
 * Source: HomeAdvisor / Angi 2025-2026, PHCC.
 */
export function calculateWholeHouseRepipeCost(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const homeSize = String(inputs.homeSize || 'medium-1000-1500');
  const pipeMaterial = String(inputs.pipeMaterial || 'copper');
  const stories = String(inputs.stories || '1-story');
  const bathrooms = String(inputs.bathrooms || '2-bath');
  const wallRepair = String(inputs.wallRepair || 'none');
  const permitRequired = String(inputs.permitRequired || 'no');
  const region = String(inputs.region || 'national');

  // ── Look up rates ─────────────────────────────────────
  const sizeRates = HOME_SIZE_COSTS[homeSize] ?? HOME_SIZE_COSTS['medium-1000-1500'];
  const pipeMult = PIPE_MATERIAL_MULTIPLIERS[pipeMaterial] ?? 1.0;
  const storyMult = STORY_MULTIPLIERS[stories] ?? 1.0;
  const bathMult = BATHROOM_MULTIPLIERS[bathrooms] ?? 1.0;
  const wallRates = WALL_REPAIR_COSTS[wallRepair] ?? WALL_REPAIR_COSTS['none'];
  const regionMult = REGIONAL_MULTIPLIERS[region] ?? 1.0;
  const bathCount = BATHROOM_COUNTS[bathrooms] ?? 2;

  // ── Calculate adjusted piping base ────────────────────
  const adjustedLow = sizeRates.low * pipeMult * storyMult * bathMult;
  const adjustedHigh = sizeRates.high * pipeMult * storyMult * bathMult;

  // ── Split into material (35%) and labor (65%) ─────────
  const materialCostLow = parseFloat((adjustedLow * 0.35).toFixed(2));
  const materialCostHigh = parseFloat((adjustedHigh * 0.35).toFixed(2));
  const laborCostLow = parseFloat((adjustedLow * 0.65 * regionMult).toFixed(2));
  const laborCostHigh = parseFloat((adjustedHigh * 0.65 * regionMult).toFixed(2));

  const pipingCostLow = parseFloat((materialCostLow + laborCostLow).toFixed(2));
  const pipingCostHigh = parseFloat((materialCostHigh + laborCostHigh).toFixed(2));

  // ── Wall repair ───────────────────────────────────────
  const wallRepairLow = parseFloat(wallRates.low.toFixed(2));
  const wallRepairHigh = parseFloat(wallRates.high.toFixed(2));
  const wallRepairCost = parseFloat(((wallRepairLow + wallRepairHigh) / 2).toFixed(2));

  // ── Permit ────────────────────────────────────────────
  const permitLow = permitRequired === 'yes' ? PERMIT_COSTS.low : 0;
  const permitHigh = permitRequired === 'yes' ? PERMIT_COSTS.high : 0;
  const permitCost = parseFloat(((permitLow + permitHigh) / 2).toFixed(2));

  // ── Totals ────────────────────────────────────────────
  const totalLow = parseFloat((pipingCostLow + wallRepairLow + permitLow).toFixed(2));
  const totalHigh = parseFloat((pipingCostHigh + wallRepairHigh + permitHigh).toFixed(2));
  const totalMid = parseFloat(((totalLow + totalHigh) / 2).toFixed(2));

  // ── Mid-point costs for display ───────────────────────
  const pipingCost = parseFloat(((pipingCostLow + pipingCostHigh) / 2).toFixed(2));
  const materialCost = parseFloat(((materialCostLow + materialCostHigh) / 2).toFixed(2));
  const laborCost = parseFloat(((laborCostLow + laborCostHigh) / 2).toFixed(2));

  // ── Cost per bathroom ─────────────────────────────────
  const costPerBathroom = bathCount > 0 ? parseFloat((totalMid / bathCount).toFixed(2)) : 0;

  // ── Material comparison (all 3 materials, same home size/stories/bathrooms, national, no wall/permit) ──
  const materialKeys = Object.keys(PIPE_MATERIAL_MULTIPLIERS);
  const materialComparison = materialKeys.map(key => {
    const mult = PIPE_MATERIAL_MULTIPLIERS[key];
    const adjLow = sizeRates.low * mult * storyMult * bathMult;
    const adjHigh = sizeRates.high * mult * storyMult * bathMult;
    const mid = (adjLow + adjHigh) / 2;
    return {
      label: MATERIAL_LABELS[key] ?? key,
      value: parseFloat(mid.toFixed(2)),
    };
  });

  // ── Timeline ──────────────────────────────────────────
  const timeline = TIMELINES[homeSize] ?? '3–5 days';

  return {
    pipingCost,
    materialCost,
    laborCost,
    wallRepairCost,
    permitCost,
    totalLow,
    totalHigh,
    totalMid,
    costPerBathroom,
    materialComparison,
    timeline,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'whole-house-repipe-cost': calculateWholeHouseRepipeCost,
};
