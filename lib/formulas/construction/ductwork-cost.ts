/**
 * Ductwork Cost Calculator Formula Module
 *
 * Estimates full ductwork installation costs (material + labor) for new
 * installation, replacement, or modification projects. Includes duct material
 * multipliers, project type multipliers, insulation adders, access difficulty
 * multipliers, and regional labor multipliers.
 *
 * Cost formula:
 *   baseCost = BASE_COSTS[homeSize]  (low/high range)
 *   materialAdjusted = baseCost × MATERIAL_MULTIPLIER
 *   projectAdjusted = materialAdjusted × PROJECT_MULTIPLIER
 *   materialCost = projectAdjusted × 0.40
 *   laborCost = projectAdjusted × 0.60 × ACCESS_MULTIPLIER × REGIONAL_MULTIPLIER
 *   insulationCost = INSULATION_ADDER[insulation]
 *   total = materialCost + laborCost + insulationCost
 *
 * Source: HomeAdvisor / Angi 2025-2026 national averages;
 *         ACCA Manual D duct design standards
 */

export interface DuctworkCostInput {
  homeSize: string;        // 'small-under-1000' | 'medium-1000-1500' | 'large-1500-2500' | 'xlarge-over-2500'
  ductMaterial: string;    // 'sheet-metal' | 'flexible' | 'fiberglass-board'
  projectType: string;     // 'new-installation' | 'replacement' | 'modification'
  insulation: string;      // 'standard-r6' | 'upgraded-r8' | 'none'
  accessType: string;      // 'accessible-attic' | 'crawlspace' | 'in-wall-ceiling'
  region: string;          // 'national' | 'northeast' | 'west-coast' | 'mid-atlantic' | 'midwest' | 'south' | 'mountain-west'
}

export interface DuctworkCostOutput {
  materialCost: number;
  laborCost: number;
  insulationCost: number;
  totalLow: number;
  totalHigh: number;
  totalMid: number;
  costPerSqFt: number;
  materialComparison: { label: string; value: number }[];
  timeline: string;
}

/**
 * Base costs by home size (total project cost before adjustments).
 * Source: HomeAdvisor / Angi 2025-2026 national averages.
 */
const BASE_COSTS: Record<string, { low: number; high: number; sqft: number }> = {
  'small-under-1000':  { low: 2000, high: 3500, sqft: 800 },
  'medium-1000-1500':  { low: 3500, high: 6000, sqft: 1250 },
  'large-1500-2500':   { low: 5500, high: 9000, sqft: 2000 },
  'xlarge-over-2500':  { low: 8000, high: 14000, sqft: 3000 },
};

/**
 * Material multipliers applied to base cost.
 * Sheet metal is baseline (1.0x).
 */
const MATERIAL_MULTIPLIERS: Record<string, number> = {
  'sheet-metal':      1.0,
  'flexible':         0.70,
  'fiberglass-board': 1.15,
};

/**
 * Project type multipliers applied to base cost.
 * New installation is baseline (1.0x).
 */
const PROJECT_MULTIPLIERS: Record<string, number> = {
  'new-installation': 1.0,
  'replacement':      1.20,
  'modification':     0.50,
};

/**
 * Insulation adders (flat cost added to project total).
 * Standard R-6 is included in base cost.
 */
const INSULATION_ADDERS: Record<string, { low: number; high: number }> = {
  'standard-r6':  { low: 0, high: 0 },
  'upgraded-r8':  { low: 500, high: 1500 },
  'none':         { low: -500, high: -300 },
};

/**
 * Access type multipliers (applied to labor portion only).
 * Accessible attic is baseline (1.0x).
 */
const ACCESS_MULTIPLIERS: Record<string, number> = {
  'accessible-attic': 1.0,
  'crawlspace':       1.15,
  'in-wall-ceiling':  1.35,
};

/**
 * Regional labor multipliers. Applied to labor only, not materials.
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
 * Display labels for duct materials.
 */
const MATERIAL_LABELS: Record<string, string> = {
  'sheet-metal':      'Sheet Metal',
  'flexible':         'Flexible Duct',
  'fiberglass-board': 'Fiberglass Board',
};

/**
 * Timeline estimates by project type.
 */
const TIMELINE_ESTIMATES: Record<string, string> = {
  'new-installation': '2–5 days',
  'replacement':      '2–4 days (includes demo)',
  'modification':     '1–2 days',
};

/**
 * Ductwork cost calculator.
 *
 * baseCost = BASE_COSTS[homeSize]
 * materialAdjusted = baseCost × MATERIAL_MULTIPLIER × PROJECT_MULTIPLIER
 * materialCost = materialAdjusted × 0.40
 * laborCost = materialAdjusted × 0.60 × ACCESS_MULTIPLIER × REGIONAL_MULTIPLIER
 * insulationCost = INSULATION_ADDER
 * total = materialCost + laborCost + insulationCost
 *
 * Source: HomeAdvisor / Angi 2025-2026; ACCA Manual D.
 */
export function calculateDuctworkCost(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const homeSize = String(inputs.homeSize || 'medium-1000-1500');
  const ductMaterial = String(inputs.ductMaterial || 'sheet-metal');
  const projectType = String(inputs.projectType || 'new-installation');
  const insulation = String(inputs.insulation || 'standard-r6');
  const accessType = String(inputs.accessType || 'accessible-attic');
  const region = String(inputs.region || 'national');

  // ── Look up rates ─────────────────────────────────────
  const base = BASE_COSTS[homeSize] ?? BASE_COSTS['medium-1000-1500'];
  const matMult = MATERIAL_MULTIPLIERS[ductMaterial] ?? 1.0;
  const projMult = PROJECT_MULTIPLIERS[projectType] ?? 1.0;
  const insulAdder = INSULATION_ADDERS[insulation] ?? INSULATION_ADDERS['standard-r6'];
  const accessMult = ACCESS_MULTIPLIERS[accessType] ?? 1.0;
  const regionMult = REGIONAL_MULTIPLIERS[region] ?? 1.0;

  // ── Calculate adjusted base (base × material × project) ──
  const adjustedLow = base.low * matMult * projMult;
  const adjustedHigh = base.high * matMult * projMult;

  // ── Split into material (40%) and labor (60%) ──
  const materialCostLow = parseFloat((adjustedLow * 0.40).toFixed(2));
  const materialCostHigh = parseFloat((adjustedHigh * 0.40).toFixed(2));

  const laborCostLow = parseFloat((adjustedLow * 0.60 * accessMult * regionMult).toFixed(2));
  const laborCostHigh = parseFloat((adjustedHigh * 0.60 * accessMult * regionMult).toFixed(2));

  // ── Insulation adder ──────────────────────────────────
  const insulationCostLow = insulAdder.low;
  const insulationCostHigh = insulAdder.high;

  // ── Totals ────────────────────────────────────────────
  const totalLow = parseFloat((materialCostLow + laborCostLow + insulationCostLow).toFixed(2));
  const totalHigh = parseFloat((materialCostHigh + laborCostHigh + insulationCostHigh).toFixed(2));
  const totalMid = parseFloat(((totalLow + totalHigh) / 2).toFixed(2));

  // ── Mid values for outputs ────────────────────────────
  const materialCostMid = parseFloat(((materialCostLow + materialCostHigh) / 2).toFixed(2));
  const laborCostMid = parseFloat(((laborCostLow + laborCostHigh) / 2).toFixed(2));
  const insulationCostMid = parseFloat(((insulationCostLow + insulationCostHigh) / 2).toFixed(2));

  // ── Cost per sq ft ────────────────────────────────────
  const sqft = base.sqft;
  const costPerSqFt = sqft > 0 ? parseFloat((totalMid / sqft).toFixed(2)) : 0;

  // ── Material comparison (all 3 materials, new-installation, standard-r6, accessible-attic, national) ──
  const materialKeys = Object.keys(MATERIAL_MULTIPLIERS);
  const materialComparison = materialKeys.map(key => {
    const mm = MATERIAL_MULTIPLIERS[key];
    const adjLow = base.low * mm * 1.0; // new-installation baseline
    const adjHigh = base.high * mm * 1.0;
    const matLow = adjLow * 0.40;
    const matHigh = adjHigh * 0.40;
    const labLow = adjLow * 0.60;
    const labHigh = adjHigh * 0.60;
    const tLow = matLow + labLow;
    const tHigh = matHigh + labHigh;
    const tMid = (tLow + tHigh) / 2;
    return {
      label: `${MATERIAL_LABELS[key]} ($${Math.round(tLow).toLocaleString()}–$${Math.round(tHigh).toLocaleString()})`,
      value: parseFloat(tMid.toFixed(2)),
    };
  });

  // ── Timeline ──────────────────────────────────────────
  const timeline = TIMELINE_ESTIMATES[projectType] ?? '2–5 days';

  return {
    materialCost: materialCostMid,
    laborCost: laborCostMid,
    insulationCost: insulationCostMid,
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
  'ductwork-cost': calculateDuctworkCost,
};
