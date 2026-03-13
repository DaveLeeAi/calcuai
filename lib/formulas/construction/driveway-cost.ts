/**
 * Driveway Cost Calculator Formula Module
 *
 * Estimates driveway installation, replacement, and resurfacing costs
 * across five common materials: concrete, asphalt, gravel, pavers,
 * and stamped concrete.
 *
 * Cost formula:
 *   costLow  = area × lowRate × conditionMultiplier + (gradingAdj × area)
 *   costHigh = area × highRate × conditionMultiplier + (gradingAdj × area)
 *   costMid  = (costLow + costHigh) / 2
 *
 * Source: HomeAdvisor / Angi 2025-2026 national averages,
 *         Concrete Network, Asphalt Institute
 */

export interface DrivewayCostInput {
  length: number;
  lengthUnit: string;         // 'ft' | 'm'
  width: number;
  widthUnit: string;          // 'ft' | 'm'
  material: string;           // 'concrete' | 'asphalt' | 'gravel' | 'pavers' | 'stamped-concrete'
  condition: string;          // 'new-install' | 'replacement' | 'resurfacing'
  grading: string;            // 'flat' | 'slight-slope' | 'steep'
}

export interface DrivewayCostOutput {
  area: number;
  costLow: number;
  costHigh: number;
  costMid: number;
  costPerSqFt: number;
  materialComparison: { label: string; value: number }[];
  conditionNote: string;
  timeline: string;
}

/**
 * Unit conversion factors to feet for length/width inputs.
 */
const lengthToFeet: Record<string, number> = {
  ft: 1,
  m: 3.28084,
};

/**
 * Cost per square foot by material (installed, 2025-2026 estimates).
 * Source: HomeAdvisor, Angi, Concrete Network, Asphalt Institute.
 */
const MATERIAL_COSTS: Record<string, { low: number; high: number }> = {
  'concrete':         { low: 6,  high: 12 },
  'asphalt':          { low: 3,  high: 7 },
  'gravel':           { low: 1,  high: 3 },
  'pavers':           { low: 10, high: 25 },
  'stamped-concrete': { low: 12, high: 20 },
};

/**
 * Condition multipliers.
 * - new-install: 1.0x baseline
 * - replacement: 1.15x (includes demolition/removal of existing driveway)
 * - resurfacing: 0.4x (overlay only, existing base stays)
 */
const CONDITION_MULTIPLIERS: Record<string, number> = {
  'new-install':  1.0,
  'replacement':  1.15,
  'resurfacing':  0.4,
};

/**
 * Grading adjustments (additional cost per square foot).
 * Source: Landscaping cost data from HomeAdvisor 2025.
 */
const GRADING_ADJUSTMENTS: Record<string, number> = {
  'flat':          0,
  'slight-slope':  1,
  'steep':         3,
};

/**
 * Condition descriptions for user context.
 */
const CONDITION_NOTES: Record<string, string> = {
  'new-install':  'New installation on prepared subgrade. Includes grading, base preparation, and material installation.',
  'replacement':  'Includes demolition and removal of existing driveway ($1–$3/sq ft), plus new installation. Total cost is approximately 15% more than new install.',
  'resurfacing':  'Overlay or resurfacing of existing driveway. Only viable when the existing base is structurally sound. Approximately 40% of new install cost.',
};

/**
 * Material display names for comparison output.
 */
const MATERIAL_LABELS: Record<string, string> = {
  'concrete':         'Concrete',
  'asphalt':          'Asphalt',
  'gravel':           'Gravel',
  'pavers':           'Pavers',
  'stamped-concrete': 'Stamped Concrete',
};

/**
 * Timeline estimates per material.
 */
const TIMELINE_ESTIMATES: Record<string, string> = {
  'concrete':         '3–7 days (plus 7-day cure before driving)',
  'asphalt':          '1–3 days (24–48 hours before driving)',
  'gravel':           '1–2 days',
  'pavers':           '3–7 days',
  'stamped-concrete': '5–10 days (plus 7-day cure before driving)',
};

/**
 * Driveway cost calculator.
 *
 * costLow  = area × lowRate × conditionMultiplier + (gradingAdj × area)
 * costHigh = area × highRate × conditionMultiplier + (gradingAdj × area)
 * costMid  = (costLow + costHigh) / 2
 *
 * Source: HomeAdvisor / Angi 2025-2026, Concrete Network, Asphalt Institute.
 */
export function calculateDrivewayCost(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const rawLength = Number(inputs.length) || 0;
  const rawWidth = Number(inputs.width) || 0;
  const lengthUnit = String(inputs.lengthUnit || 'ft');
  const widthUnit = String(inputs.widthUnit || 'ft');
  const material = String(inputs.material || 'concrete');
  const condition = String(inputs.condition || 'new-install');
  const grading = String(inputs.grading || 'flat');

  // ── Convert to feet ───────────────────────────────────
  const lengthFt = rawLength * (lengthToFeet[lengthUnit] ?? 1);
  const widthFt = rawWidth * (lengthToFeet[widthUnit] ?? 1);

  // ── Calculate area ────────────────────────────────────
  const area = parseFloat((lengthFt * widthFt).toFixed(2));

  // ── Look up rates ─────────────────────────────────────
  const rates = MATERIAL_COSTS[material] ?? MATERIAL_COSTS['concrete'];
  const conditionMultiplier = CONDITION_MULTIPLIERS[condition] ?? 1.0;
  const gradingAdj = GRADING_ADJUSTMENTS[grading] ?? 0;

  // ── Calculate costs ───────────────────────────────────
  const costLow = parseFloat((area * rates.low * conditionMultiplier + gradingAdj * area).toFixed(2));
  const costHigh = parseFloat((area * rates.high * conditionMultiplier + gradingAdj * area).toFixed(2));
  const costMid = parseFloat(((costLow + costHigh) / 2).toFixed(2));
  const costPerSqFt = area > 0 ? parseFloat((costMid / area).toFixed(2)) : 0;

  // ── Material comparison (all 5 at new-install, flat) ──
  const materialKeys = Object.keys(MATERIAL_COSTS);
  const materialComparison = materialKeys.map(key => {
    const r = MATERIAL_COSTS[key];
    const mid = area * (r.low + r.high) / 2;
    return {
      label: `${MATERIAL_LABELS[key]} ($${r.low}–$${r.high}/sq ft)`,
      value: parseFloat(mid.toFixed(2)),
    };
  });

  // ── Condition note ────────────────────────────────────
  const conditionNote = CONDITION_NOTES[condition] ?? CONDITION_NOTES['new-install'];

  // ── Timeline ──────────────────────────────────────────
  const timeline = TIMELINE_ESTIMATES[material] ?? '3–7 days';

  return {
    area,
    costLow,
    costHigh,
    costMid,
    costPerSqFt,
    materialComparison,
    conditionNote,
    timeline,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'driveway-cost': calculateDrivewayCost,
};
