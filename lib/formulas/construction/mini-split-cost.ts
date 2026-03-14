/**
 * Mini-Split Cost Calculator Formula Module
 *
 * Estimates ductless mini-split installation costs across six system types:
 * single-zone 9K BTU, single-zone 12K BTU, single-zone 18K BTU,
 * multi-zone 2-zone, multi-zone 3-zone, and multi-zone 4-zone.
 * Includes efficiency tier multipliers, line set length adjustments,
 * electrical work add-ons, and regional labor multipliers.
 *
 * Cost formula:
 *   equipmentLow = systemTypeBaseLow × efficiencyMultiplier
 *   equipmentHigh = systemTypeBaseHigh × efficiencyMultiplier
 *   laborLow = equipmentLow × 0.40 × lineSetMultiplier × regionalMultiplier
 *   laborHigh = equipmentHigh × 0.40 × lineSetMultiplier × regionalMultiplier
 *   electricalLow = electricalWorkLow
 *   electricalHigh = electricalWorkHigh
 *   totalLow = equipmentLow + laborLow + electricalLow
 *   totalHigh = equipmentHigh + laborHigh + electricalHigh
 *   totalMid = (totalLow + totalHigh) / 2
 *
 * Source: HomeAdvisor / Angi 2025-2026 Mini-Split Cost Data;
 *         AHRI Mini-Split Performance Data
 */

export interface MiniSplitCostInput {
  systemType: string;       // 'single-zone-9k' | 'single-zone-12k' | 'single-zone-18k' | 'multi-zone-2' | 'multi-zone-3' | 'multi-zone-4'
  efficiency: string;       // 'standard-20-seer2' | 'high-22-seer2' | 'premium-25-seer2'
  lineSetLength: string;    // 'standard-15ft' | 'extended-25ft' | 'long-run-50ft'
  electricalWork: string;   // 'existing-circuit' | 'new-circuit' | 'sub-panel-required'
  region: string;           // 'national' | 'northeast' | 'west-coast' | 'mid-atlantic' | 'midwest' | 'south' | 'mountain-west'
}

export interface MiniSplitCostOutput {
  equipmentCost: number;
  laborCost: number;
  electricalCost: number;
  totalLow: number;
  totalHigh: number;
  totalMid: number;
  costPerZone: number;
  systemComparison: { label: string; value: number }[];
  timeline: string;
}

/**
 * Equipment base cost per system type (equipment only, before labor).
 * Source: HomeAdvisor / Angi 2025-2026 national averages.
 */
const SYSTEM_TYPE_COSTS: Record<string, { low: number; high: number; zones: number }> = {
  'single-zone-9k':  { low: 1500, high: 2500, zones: 1 },
  'single-zone-12k': { low: 2000, high: 3500, zones: 1 },
  'single-zone-18k': { low: 2500, high: 4000, zones: 1 },
  'multi-zone-2':    { low: 3500, high: 6000, zones: 2 },
  'multi-zone-3':    { low: 5000, high: 8000, zones: 3 },
  'multi-zone-4':    { low: 6500, high: 10000, zones: 4 },
};

/**
 * Efficiency tier multipliers.
 * Higher SEER2 ratings increase equipment cost.
 */
const EFFICIENCY_MULTIPLIERS: Record<string, number> = {
  'standard-20-seer2': 1.0,
  'high-22-seer2':     1.15,
  'premium-25-seer2':  1.30,
};

/**
 * Line set length multipliers.
 * Longer refrigerant line runs increase labor cost.
 */
const LINE_SET_MULTIPLIERS: Record<string, number> = {
  'standard-15ft': 1.0,
  'extended-25ft': 1.10,
  'long-run-50ft': 1.25,
};

/**
 * Electrical work costs.
 * Additional electrical work required for mini-split installation.
 */
const ELECTRICAL_COSTS: Record<string, { low: number; high: number }> = {
  'existing-circuit':    { low: 0,   high: 0 },
  'new-circuit':         { low: 300, high: 600 },
  'sub-panel-required':  { low: 800, high: 1500 },
};

/**
 * Regional labor multipliers.
 * Applied to labor portion only, not equipment or electrical.
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
 * Display labels for system types.
 */
const SYSTEM_LABELS: Record<string, string> = {
  'single-zone-9k':  'Single-Zone 9K BTU',
  'single-zone-12k': 'Single-Zone 12K BTU',
  'single-zone-18k': 'Single-Zone 18K BTU',
  'multi-zone-2':    'Multi-Zone 2-Zone',
  'multi-zone-3':    'Multi-Zone 3-Zone',
  'multi-zone-4':    'Multi-Zone 4-Zone',
};

/**
 * Estimated installation timeline by system type.
 */
const TIMELINES: Record<string, string> = {
  'single-zone-9k':  '4-6 hours (1 day)',
  'single-zone-12k': '4-8 hours (1 day)',
  'single-zone-18k': '6-8 hours (1 day)',
  'multi-zone-2':    '1-2 days',
  'multi-zone-3':    '2-3 days',
  'multi-zone-4':    '2-3 days',
};

/**
 * Labor factor: labor = 40% of equipment cost.
 */
const LABOR_FACTOR = 0.40;

/**
 * Mini-split cost calculator.
 *
 * totalLow = equipmentLow + laborLow + electricalLow
 * totalHigh = equipmentHigh + laborHigh + electricalHigh
 * totalMid = (totalLow + totalHigh) / 2
 *
 * Source: HomeAdvisor / Angi 2025-2026, AHRI Mini-Split Performance Data.
 */
export function calculateMiniSplitCost(inputs: Record<string, unknown>): Record<string, unknown> {
  // -- Parse inputs --
  const systemType = String(inputs.systemType || 'single-zone-12k');
  const efficiency = String(inputs.efficiency || 'standard-20-seer2');
  const lineSetLength = String(inputs.lineSetLength || 'standard-15ft');
  const electricalWork = String(inputs.electricalWork || 'existing-circuit');
  const region = String(inputs.region || 'national');

  // -- Look up rates --
  const systemCosts = SYSTEM_TYPE_COSTS[systemType] ?? SYSTEM_TYPE_COSTS['single-zone-12k'];
  const efficiencyMult = EFFICIENCY_MULTIPLIERS[efficiency] ?? 1.0;
  const lineSetMult = LINE_SET_MULTIPLIERS[lineSetLength] ?? 1.0;
  const elecCosts = ELECTRICAL_COSTS[electricalWork] ?? ELECTRICAL_COSTS['existing-circuit'];
  const regionMult = REGIONAL_MULTIPLIERS[region] ?? 1.0;

  // -- Calculate equipment cost --
  const equipmentLow = parseFloat((systemCosts.low * efficiencyMult).toFixed(2));
  const equipmentHigh = parseFloat((systemCosts.high * efficiencyMult).toFixed(2));
  const equipmentMid = parseFloat(((equipmentLow + equipmentHigh) / 2).toFixed(2));

  // -- Calculate labor cost (40% of equipment x lineSet x region) --
  const laborLow = parseFloat((equipmentLow * LABOR_FACTOR * lineSetMult * regionMult).toFixed(2));
  const laborHigh = parseFloat((equipmentHigh * LABOR_FACTOR * lineSetMult * regionMult).toFixed(2));
  const laborMid = parseFloat(((laborLow + laborHigh) / 2).toFixed(2));

  // -- Calculate electrical cost --
  const electricalLow = parseFloat(elecCosts.low.toFixed(2));
  const electricalHigh = parseFloat(elecCosts.high.toFixed(2));
  const electricalMid = parseFloat(((electricalLow + electricalHigh) / 2).toFixed(2));

  // -- Calculate totals --
  const totalLow = parseFloat((equipmentLow + laborLow + electricalLow).toFixed(2));
  const totalHigh = parseFloat((equipmentHigh + laborHigh + electricalHigh).toFixed(2));
  const totalMid = parseFloat(((totalLow + totalHigh) / 2).toFixed(2));

  // -- Cost per zone --
  const zones = systemCosts.zones;
  const costPerZone = parseFloat((totalMid / zones).toFixed(2));

  // -- Timeline --
  const timeline = TIMELINES[systemType] ?? '1-2 days';

  // -- System comparison (all 6 types, national avg, standard efficiency, standard line set, no electrical) --
  const systemKeys = Object.keys(SYSTEM_TYPE_COSTS);
  const systemComparison = systemKeys.map(key => {
    const sc = SYSTEM_TYPE_COSTS[key];
    const eqLow = sc.low * 1.0; // standard efficiency
    const eqHigh = sc.high * 1.0;
    const labLow = eqLow * LABOR_FACTOR * 1.0 * 1.0; // standard line set, national
    const labHigh = eqHigh * LABOR_FACTOR * 1.0 * 1.0;
    const mid = (eqLow + labLow + eqHigh + labHigh) / 2;
    return {
      label: `${SYSTEM_LABELS[key]} ($${sc.low.toLocaleString()}–$${sc.high.toLocaleString()})`,
      value: parseFloat(mid.toFixed(2)),
    };
  });

  return {
    equipmentCost: equipmentMid,
    laborCost: laborMid,
    electricalCost: electricalMid,
    totalLow,
    totalHigh,
    totalMid,
    costPerZone,
    systemComparison,
    timeline,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'mini-split-cost': calculateMiniSplitCost,
};
