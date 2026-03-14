/**
 * Foundation Repair Cost Calculator Formula Module
 *
 * Estimates foundation repair costs across eight repair methods:
 * crack sealing, carbon fiber straps, steel piers, helical piers,
 * mudjacking, polyurethane foam, wall anchors, and underpinning.
 * Splits costs into material (40%) and labor (60%) components,
 * with multipliers for foundation type, damage severity, access
 * difficulty, and regional labor rates.
 *
 * Cost formula:
 *   baseLow / baseHigh = repairType per-unit rate
 *   adjusted = base × foundationMultiplier × severityMultiplier × accessMultiplier
 *   materialCost = adjusted × 0.40
 *   laborCost = adjusted × 0.60 × regionalMultiplier
 *   costPerUnit = materialCost + laborCost
 *   grandTotal = costPerUnit × quantity
 *
 * Source: HomeAdvisor / Angi 2025-2026 Foundation Repair Cost Data;
 *         Foundation Repair Association (FRA)
 */

export interface FoundationRepairCostInput {
  repairType: string;        // 'crack-sealing' | 'carbon-fiber-straps' | 'steel-piers' | 'helical-piers' | 'mudjacking' | 'polyurethane-foam' | 'wall-anchors' | 'underpinning'
  quantity: number;          // number of units (cracks, piers, walls, sections)
  foundationType: string;    // 'slab-on-grade' | 'pier-and-beam' | 'basement' | 'crawl-space'
  severity: string;          // 'minor-cosmetic' | 'moderate-structural' | 'severe-critical'
  accessDifficulty: string;  // 'easy' | 'moderate' | 'difficult'
  region: string;            // 'national' | 'northeast' | 'west-coast' | 'mid-atlantic' | 'midwest' | 'south' | 'mountain-west'
}

export interface FoundationRepairCostOutput {
  repairCostPerUnit: number;
  totalMaterialCost: number;
  totalLaborCost: number;
  totalLow: number;
  totalHigh: number;
  totalMid: number;
  costPerUnit: number;
  repairComparison: { label: string; value: number }[];
  timeline: string;
  permitNote: string;
}

/**
 * Per-unit cost ranges by repair type.
 * Source: HomeAdvisor / Angi 2025-2026 national averages.
 */
const REPAIR_COSTS: Record<string, { low: number; high: number; unit: string }> = {
  'crack-sealing':       { low: 250,  high: 800,   unit: 'per crack' },
  'carbon-fiber-straps': { low: 5000, high: 10000, unit: 'per wall' },
  'steel-piers':         { low: 1000, high: 2000,  unit: 'per pier' },
  'helical-piers':       { low: 1500, high: 3000,  unit: 'per pier' },
  'mudjacking':          { low: 500,  high: 1300,  unit: 'per section' },
  'polyurethane-foam':   { low: 1000, high: 2500,  unit: 'per section' },
  'wall-anchors':        { low: 3000, high: 7000,  unit: 'per wall' },
  'underpinning':        { low: 1000, high: 3000,  unit: 'per pier' },
};

/**
 * Foundation type multipliers.
 * Adjusts for complexity of working with different foundation styles.
 */
const FOUNDATION_MULTIPLIERS: Record<string, number> = {
  'slab-on-grade': 1.0,
  'pier-and-beam': 1.10,
  'basement':      1.25,
  'crawl-space':   1.15,
};

/**
 * Damage severity multipliers.
 */
const SEVERITY_MULTIPLIERS: Record<string, number> = {
  'minor-cosmetic':      0.75,
  'moderate-structural': 1.0,
  'severe-critical':     1.50,
};

/**
 * Access difficulty multipliers.
 */
const ACCESS_MULTIPLIERS: Record<string, number> = {
  'easy':      1.0,
  'moderate':  1.15,
  'difficult': 1.30,
};

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
 * Material / labor split.
 */
const MATERIAL_RATIO = 0.40;
const LABOR_RATIO = 0.60;

/**
 * Display labels for repair types.
 */
const REPAIR_LABELS: Record<string, string> = {
  'crack-sealing':       'Crack Sealing',
  'carbon-fiber-straps': 'Carbon Fiber Straps',
  'steel-piers':         'Steel Piers',
  'helical-piers':       'Helical Piers',
  'mudjacking':          'Mudjacking',
  'polyurethane-foam':   'Polyurethane Foam Injection',
  'wall-anchors':        'Wall Anchors',
  'underpinning':        'Underpinning',
};

/**
 * Estimated project timelines by repair type.
 */
const TIMELINES: Record<string, string> = {
  'crack-sealing':       '1–2 hours per crack',
  'carbon-fiber-straps': '1–2 days per wall',
  'steel-piers':         '1–3 days depending on pier count',
  'helical-piers':       '1–3 days depending on pier count',
  'mudjacking':          '2–4 hours per section',
  'polyurethane-foam':   '2–4 hours per section',
  'wall-anchors':        '1–2 days per wall',
  'underpinning':        '2–5 days depending on pier count',
};

/**
 * Permit notes by repair type.
 */
const PERMIT_NOTES: Record<string, string> = {
  'crack-sealing':       'Permits are generally not required for cosmetic crack sealing.',
  'carbon-fiber-straps': 'Most municipalities require a building permit for structural wall reinforcement.',
  'steel-piers':         'A building permit is typically required for pier installation. Structural engineering report may be needed.',
  'helical-piers':       'A building permit is typically required for pier installation. Structural engineering report may be needed.',
  'mudjacking':          'Permits are generally not required for mudjacking unless part of a larger structural repair.',
  'polyurethane-foam':   'Permits are generally not required for foam injection unless part of a larger structural repair.',
  'wall-anchors':        'Most municipalities require a building permit for wall anchor installation.',
  'underpinning':        'A building permit and structural engineering report are almost always required for underpinning.',
};

/**
 * Foundation repair cost calculator.
 *
 * adjustedLow = baseLow × foundationMult × severityMult × accessMult
 * adjustedHigh = baseHigh × foundationMult × severityMult × accessMult
 * materialLow = adjustedLow × 0.40
 * laborLow = adjustedLow × 0.60 × regionMult
 * costPerUnitLow = materialLow + laborLow
 * totalLow = costPerUnitLow × quantity
 *
 * Source: HomeAdvisor / Angi 2025-2026, Foundation Repair Association (FRA).
 */
export function calculateFoundationRepairCost(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const repairType = String(inputs.repairType || 'crack-sealing');
  const quantity = Math.max(1, Math.min(50, Math.round(Number(inputs.quantity) || 4)));
  const foundationType = String(inputs.foundationType || 'slab-on-grade');
  const severity = String(inputs.severity || 'moderate-structural');
  const accessDifficulty = String(inputs.accessDifficulty || 'easy');
  const region = String(inputs.region || 'national');

  // ── Look up rates and multipliers ─────────────────────
  const repairRates = REPAIR_COSTS[repairType] ?? REPAIR_COSTS['crack-sealing'];
  const foundationMult = FOUNDATION_MULTIPLIERS[foundationType] ?? 1.0;
  const severityMult = SEVERITY_MULTIPLIERS[severity] ?? 1.0;
  const accessMult = ACCESS_MULTIPLIERS[accessDifficulty] ?? 1.0;
  const regionMult = REGIONAL_MULTIPLIERS[region] ?? 1.0;

  // ── Adjusted base cost per unit ───────────────────────
  const adjustedLow = repairRates.low * foundationMult * severityMult * accessMult;
  const adjustedHigh = repairRates.high * foundationMult * severityMult * accessMult;

  // ── Material portion (40% of adjusted, not affected by region) ──
  const materialLow = parseFloat((adjustedLow * MATERIAL_RATIO).toFixed(2));
  const materialHigh = parseFloat((adjustedHigh * MATERIAL_RATIO).toFixed(2));

  // ── Labor portion (60% of adjusted × regional multiplier) ──
  const laborLow = parseFloat((adjustedLow * LABOR_RATIO * regionMult).toFixed(2));
  const laborHigh = parseFloat((adjustedHigh * LABOR_RATIO * regionMult).toFixed(2));

  // ── Cost per unit ─────────────────────────────────────
  const costPerUnitLow = parseFloat((materialLow + laborLow).toFixed(2));
  const costPerUnitHigh = parseFloat((materialHigh + laborHigh).toFixed(2));
  const costPerUnitMid = parseFloat(((costPerUnitLow + costPerUnitHigh) / 2).toFixed(2));

  // ── Grand totals ──────────────────────────────────────
  const totalLow = parseFloat((costPerUnitLow * quantity).toFixed(2));
  const totalHigh = parseFloat((costPerUnitHigh * quantity).toFixed(2));
  const totalMid = parseFloat(((totalLow + totalHigh) / 2).toFixed(2));

  // ── Mid-point material and labor for display ──────────
  const totalMaterialCost = parseFloat(((materialLow + materialHigh) / 2 * quantity).toFixed(2));
  const totalLaborCost = parseFloat(((laborLow + laborHigh) / 2 * quantity).toFixed(2));
  const repairCostPerUnit = costPerUnitMid;

  // ── Repair comparison (all 8 types, quantity=1, national, slab, moderate, easy) ──
  const repairKeys = Object.keys(REPAIR_COSTS);
  const repairComparison = repairKeys.map(key => {
    const rates = REPAIR_COSTS[key];
    const baseMid = (rates.low + rates.high) / 2;
    const matPortion = baseMid * MATERIAL_RATIO;
    const labPortion = baseMid * LABOR_RATIO;
    const mid = parseFloat((matPortion + labPortion).toFixed(2));
    return {
      label: `${REPAIR_LABELS[key]} ($${rates.low.toLocaleString()}–$${rates.high.toLocaleString()} ${rates.unit})`,
      value: mid,
    };
  });

  // ── Timeline and permit note ──────────────────────────
  const timeline = TIMELINES[repairType] ?? '1–3 days';
  const permitNote = PERMIT_NOTES[repairType] ?? 'Check with your local building department for permit requirements.';

  return {
    repairCostPerUnit,
    totalMaterialCost,
    totalLaborCost,
    totalLow,
    totalHigh,
    totalMid,
    costPerUnit: costPerUnitMid,
    repairComparison,
    timeline,
    permitNote,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'foundation-repair-cost': calculateFoundationRepairCost,
};
