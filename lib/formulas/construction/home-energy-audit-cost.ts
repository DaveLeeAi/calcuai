/**
 * Home Energy Audit Cost Calculator Formula Module
 *
 * Estimates professional home energy audit costs across five home sizes and
 * four audit levels. Factors in optional add-ons for thermal imaging, duct
 * testing, and combustion safety testing, plus regional labor multipliers.
 *
 * Cost formula:
 *   baseCost = HOME_SIZE_COSTS[homeSize]
 *   adjustedBase = baseCost × auditLevelMultiplier
 *   thermalCost = THERMAL_IMAGING_COSTS[thermalImaging]
 *   ductTestCost = DUCT_TESTING_COSTS[ductTesting]
 *   combustionCost = COMBUSTION_SAFETY_COSTS[combustionSafety]
 *   subtotal = adjustedBase + thermalCost + ductTestCost + combustionCost
 *   total = subtotal × regionalMultiplier
 *
 * Source: HomeAdvisor / Angi 2025-2026 national averages;
 *         Residential Energy Services Network (RESNET);
 *         Building Performance Institute (BPI) certified auditor rates
 */

export interface HomeEnergyAuditCostInput {
  homeSize: string;          // 'small-under-1500' | 'medium-1500-2500' | 'standard-2500-3500' | 'large-3500-5000' | 'xlarge-over-5000'
  auditLevel: string;        // 'visual-walkthrough' | 'standard-diagnostic' | 'comprehensive-with-blower' | 'full-performance-testing'
  thermalImaging: string;    // 'none' | 'basic-scan' | 'detailed-report'
  ductTesting: string;       // 'none' | 'pressure-test' | 'full-duct-leakage'
  combustionSafety: string;  // 'none' | 'basic' | 'comprehensive'
  region: string;            // 'national' | 'northeast' | 'west-coast' | 'mid-atlantic' | 'midwest' | 'south' | 'mountain-west'
}

export interface HomeEnergyAuditCostOutput {
  baseCost: number;
  thermalCost: number;
  ductTestCost: number;
  combustionCost: number;
  subtotalLow: number;
  subtotalHigh: number;
  subtotal: number;
  totalLow: number;
  totalHigh: number;
  totalMid: number;
  auditLevelComparison: { label: string; value: number }[];
  potentialSavings: string;
  timeline: string;
}

/**
 * Home size base cost ranges (audit service is ~100% labor).
 * Source: HomeAdvisor / Angi 2025-2026, RESNET.
 */
const HOME_SIZE_COSTS: Record<string, { low: number; high: number }> = {
  'small-under-1500':  { low: 150, high: 300 },
  'medium-1500-2500':  { low: 200, high: 400 },
  'standard-2500-3500': { low: 300, high: 500 },
  'large-3500-5000':   { low: 400, high: 700 },
  'xlarge-over-5000':  { low: 500, high: 1000 },
};

/**
 * Audit level multipliers applied to base cost.
 * Visual walkthrough is baseline (1.0x).
 */
const AUDIT_LEVEL_MULTIPLIERS: Record<string, number> = {
  'visual-walkthrough':          1.0,
  'standard-diagnostic':         1.50,
  'comprehensive-with-blower':   2.00,
  'full-performance-testing':    2.75,
};

/**
 * Thermal imaging add-on cost ranges.
 */
const THERMAL_IMAGING_COSTS: Record<string, { low: number; high: number }> = {
  'none':            { low: 0,   high: 0 },
  'basic-scan':      { low: 100, high: 200 },
  'detailed-report': { low: 200, high: 400 },
};

/**
 * Duct testing add-on cost ranges.
 */
const DUCT_TESTING_COSTS: Record<string, { low: number; high: number }> = {
  'none':              { low: 0,   high: 0 },
  'pressure-test':     { low: 100, high: 250 },
  'full-duct-leakage': { low: 200, high: 450 },
};

/**
 * Combustion safety testing add-on cost ranges.
 */
const COMBUSTION_SAFETY_COSTS: Record<string, { low: number; high: number }> = {
  'none':          { low: 0,   high: 0 },
  'basic':         { low: 50,  high: 100 },
  'comprehensive': { low: 100, high: 250 },
};

/**
 * Regional labor multipliers.
 * Applied to the full cost (energy audits are 100% labor/service).
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
 * Display labels for audit levels.
 */
const AUDIT_LEVEL_LABELS: Record<string, string> = {
  'visual-walkthrough':        'Visual Walkthrough',
  'standard-diagnostic':       'Standard Diagnostic',
  'comprehensive-with-blower': 'Comprehensive (Blower Door)',
  'full-performance-testing':  'Full Performance Testing',
};

/**
 * Home energy audit cost calculator.
 *
 * total = (baseCost × auditMultiplier + thermalCost + ductTestCost + combustionCost) × regionalMultiplier
 *
 * Source: HomeAdvisor / Angi 2025-2026, RESNET, BPI.
 */
export function calculateHomeEnergyAuditCost(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const homeSize = String(inputs.homeSize || 'standard-2500-3500');
  const auditLevel = String(inputs.auditLevel || 'standard-diagnostic');
  const thermalImaging = String(inputs.thermalImaging || 'none');
  const ductTesting = String(inputs.ductTesting || 'none');
  const combustionSafety = String(inputs.combustionSafety || 'none');
  const region = String(inputs.region || 'national');

  // ── Look up rates ─────────────────────────────────────
  const sizeRates = HOME_SIZE_COSTS[homeSize] ?? HOME_SIZE_COSTS['standard-2500-3500'];
  const auditMult = AUDIT_LEVEL_MULTIPLIERS[auditLevel] ?? 1.50;
  const thermalRates = THERMAL_IMAGING_COSTS[thermalImaging] ?? THERMAL_IMAGING_COSTS['none'];
  const ductRates = DUCT_TESTING_COSTS[ductTesting] ?? DUCT_TESTING_COSTS['none'];
  const combustionRates = COMBUSTION_SAFETY_COSTS[combustionSafety] ?? COMBUSTION_SAFETY_COSTS['none'];
  const regionMult = REGIONAL_MULTIPLIERS[region] ?? 1.0;

  // ── Base cost (adjusted by audit level) ───────────────
  const baseCostLow = parseFloat((sizeRates.low * auditMult).toFixed(2));
  const baseCostHigh = parseFloat((sizeRates.high * auditMult).toFixed(2));

  // ── Add-on costs ──────────────────────────────────────
  const thermalCostLow = parseFloat(thermalRates.low.toFixed(2));
  const thermalCostHigh = parseFloat(thermalRates.high.toFixed(2));
  const ductTestCostLow = parseFloat(ductRates.low.toFixed(2));
  const ductTestCostHigh = parseFloat(ductRates.high.toFixed(2));
  const combustionCostLow = parseFloat(combustionRates.low.toFixed(2));
  const combustionCostHigh = parseFloat(combustionRates.high.toFixed(2));

  // ── Subtotals (before regional multiplier) ────────────
  const subtotalLow = parseFloat((baseCostLow + thermalCostLow + ductTestCostLow + combustionCostLow).toFixed(2));
  const subtotalHigh = parseFloat((baseCostHigh + thermalCostHigh + ductTestCostHigh + combustionCostHigh).toFixed(2));

  // ── Totals (with regional multiplier) ─────────────────
  const totalLow = parseFloat((subtotalLow * regionMult).toFixed(2));
  const totalHigh = parseFloat((subtotalHigh * regionMult).toFixed(2));
  const totalMid = parseFloat(((totalLow + totalHigh) / 2).toFixed(2));

  // ── Mid-point costs for display ───────────────────────
  const baseCost = parseFloat(((baseCostLow + baseCostHigh) / 2).toFixed(2));
  const thermalCost = parseFloat(((thermalCostLow + thermalCostHigh) / 2).toFixed(2));
  const ductTestCost = parseFloat(((ductTestCostLow + ductTestCostHigh) / 2).toFixed(2));
  const combustionCost = parseFloat(((combustionCostLow + combustionCostHigh) / 2).toFixed(2));
  const subtotal = parseFloat(((subtotalLow + subtotalHigh) / 2).toFixed(2));

  // ── Audit level comparison (standard-2500-3500 home, no add-ons, national) ──
  const auditKeys = Object.keys(AUDIT_LEVEL_MULTIPLIERS);
  const comparisonSizeRates = HOME_SIZE_COSTS['standard-2500-3500'];
  const auditLevelComparison = auditKeys.map(key => {
    const mult = AUDIT_LEVEL_MULTIPLIERS[key];
    const midBase = (comparisonSizeRates.low + comparisonSizeRates.high) / 2;
    const total = midBase * mult;
    return {
      label: AUDIT_LEVEL_LABELS[key] ?? key,
      value: parseFloat(total.toFixed(2)),
    };
  });

  // ── Potential savings ─────────────────────────────────
  const potentialSavings = '10-30% on energy bills';

  // ── Timeline ──────────────────────────────────────────
  const timeline = '2-4 hours';

  return {
    baseCost,
    thermalCost,
    ductTestCost,
    combustionCost,
    subtotalLow,
    subtotalHigh,
    subtotal,
    totalLow,
    totalHigh,
    totalMid,
    auditLevelComparison,
    potentialSavings,
    timeline,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'home-energy-audit-cost': calculateHomeEnergyAuditCost,
};
