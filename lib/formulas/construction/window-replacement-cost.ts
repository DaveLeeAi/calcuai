/**
 * Window Replacement Cost Calculator Formula Module
 *
 * Estimates window replacement costs across seven window types:
 * single-hung, double-hung, casement, sliding, bay-bow, picture, and awning.
 * Factors in frame material, glass type, window size, and installation type.
 * Splits costs into material and labor components, with regional labor multipliers.
 *
 * Cost formula:
 *   materialCostPerWindow = windowTypeBase × frameMaterialMult × glassTypeMult × windowSizeMult
 *   laborCostPerWindow = installationLabor × regionalMultiplier
 *   costPerWindow = materialCostPerWindow + laborCostPerWindow
 *   totalLow = (materialLow + laborLow) × windowCount
 *   totalHigh = (materialHigh + laborHigh) × windowCount
 *   totalMid = (totalLow + totalHigh) / 2
 *
 * Source: HomeAdvisor / Angi 2025-2026 Window Replacement Cost Data;
 *         ENERGY STAR Window Selection Guide
 */

export interface WindowReplacementCostInput {
  windowCount: number;
  windowType: string;       // 'single-hung' | 'double-hung' | 'casement' | 'sliding' | 'bay-bow' | 'picture' | 'awning'
  frameMaterial: string;    // 'vinyl' | 'wood' | 'fiberglass' | 'aluminum' | 'composite'
  glassType: string;        // 'double-pane' | 'triple-pane' | 'low-e-double' | 'low-e-triple'
  windowSize: string;       // 'standard-3x4' | 'large-4x5' | 'oversized-5x6'
  installation: string;     // 'replacement-in-frame' | 'full-frame' | 'new-opening'
  region: string;           // 'national' | 'northeast' | 'west-coast' | 'mid-atlantic' | 'midwest' | 'south' | 'mountain-west'
}

export interface WindowReplacementCostOutput {
  windowCount: number;
  materialCostPerWindow: number;
  laborCostPerWindow: number;
  totalMaterialCost: number;
  totalLaborCost: number;
  totalLow: number;
  totalHigh: number;
  totalMid: number;
  costPerWindow: number;
  windowTypeComparison: { label: string; value: number }[];
  estimatedEnergySavings: string;
}

/**
 * Base material cost per window by window type.
 * Source: HomeAdvisor / Angi 2025-2026 national averages.
 */
const WINDOW_TYPE_COSTS: Record<string, { low: number; high: number }> = {
  'single-hung':  { low: 200,  high: 400 },
  'double-hung':  { low: 250,  high: 500 },
  'casement':     { low: 300,  high: 600 },
  'sliding':      { low: 200,  high: 450 },
  'bay-bow':      { low: 800,  high: 2500 },
  'picture':      { low: 250,  high: 600 },
  'awning':       { low: 300,  high: 650 },
};

/**
 * Frame material multipliers applied to material cost.
 * Vinyl is the baseline (1.0x).
 */
const FRAME_MATERIAL_MULTIPLIERS: Record<string, number> = {
  'vinyl':      1.0,
  'wood':       1.35,
  'fiberglass': 1.25,
  'aluminum':   0.90,
  'composite':  1.30,
};

/**
 * Glass type multipliers applied to material cost.
 * Standard double-pane is the baseline (1.0x).
 */
const GLASS_TYPE_MULTIPLIERS: Record<string, number> = {
  'double-pane':    1.0,
  'triple-pane':    1.30,
  'low-e-double':   1.15,
  'low-e-triple':   1.45,
};

/**
 * Window size multipliers applied to material cost.
 * Standard 3×4 is the baseline (1.0x).
 */
const WINDOW_SIZE_MULTIPLIERS: Record<string, number> = {
  'standard-3x4':  1.0,
  'large-4x5':     1.35,
  'oversized-5x6': 1.75,
};

/**
 * Installation labor cost per window by installation type.
 * Source: HomeAdvisor / Angi 2025-2026 national averages.
 */
const INSTALLATION_LABOR_COSTS: Record<string, { low: number; high: number }> = {
  'replacement-in-frame': { low: 150, high: 300 },
  'full-frame':           { low: 300, high: 600 },
  'new-opening':          { low: 500, high: 1000 },
};

/**
 * Regional labor multipliers.
 * Applied to labor costs only, not materials.
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
 * Display labels for window types.
 */
const WINDOW_TYPE_LABELS: Record<string, string> = {
  'single-hung':  'Single-Hung',
  'double-hung':  'Double-Hung',
  'casement':     'Casement',
  'sliding':      'Sliding',
  'bay-bow':      'Bay/Bow',
  'picture':      'Picture',
  'awning':       'Awning',
};

/**
 * Estimated annual energy savings text by glass type.
 */
const ENERGY_SAVINGS_TEXT: Record<string, string> = {
  'double-pane':    'Standard double-pane windows save 10–15% on heating/cooling vs single-pane.',
  'triple-pane':    'Triple-pane windows save 15–25% on heating/cooling vs standard double-pane.',
  'low-e-double':   'Low-E double-pane windows save 12–20% on heating/cooling vs standard double-pane.',
  'low-e-triple':   'Low-E triple-pane windows save 20–30% on heating/cooling — best energy performance.',
};

/**
 * Window replacement cost calculator.
 *
 * materialCostPerWindow = windowTypeBase × frameMult × glassMult × sizeMult
 * laborCostPerWindow = installationLabor × regionalMultiplier
 * totalLow = (materialLow + laborLow) × windowCount
 * totalHigh = (materialHigh + laborHigh) × windowCount
 * totalMid = (totalLow + totalHigh) / 2
 *
 * Source: HomeAdvisor / Angi 2025-2026, ENERGY STAR Window Selection Guide.
 */
export function calculateWindowReplacementCost(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const windowCount = Math.max(0, Math.round(Number(inputs.windowCount) || 0));
  const windowType = String(inputs.windowType || 'double-hung');
  const frameMaterial = String(inputs.frameMaterial || 'vinyl');
  const glassType = String(inputs.glassType || 'double-pane');
  const windowSize = String(inputs.windowSize || 'standard-3x4');
  const installation = String(inputs.installation || 'replacement-in-frame');
  const region = String(inputs.region || 'national');

  // ── Look up rates ─────────────────────────────────────
  const windowTypeCosts = WINDOW_TYPE_COSTS[windowType] ?? WINDOW_TYPE_COSTS['double-hung'];
  const frameMult = FRAME_MATERIAL_MULTIPLIERS[frameMaterial] ?? 1.0;
  const glassMult = GLASS_TYPE_MULTIPLIERS[glassType] ?? 1.0;
  const sizeMult = WINDOW_SIZE_MULTIPLIERS[windowSize] ?? 1.0;
  const laborRates = INSTALLATION_LABOR_COSTS[installation] ?? INSTALLATION_LABOR_COSTS['replacement-in-frame'];
  const regionMult = REGIONAL_MULTIPLIERS[region] ?? 1.0;

  // ── Calculate per-window costs ────────────────────────
  const materialPerWindowLow = parseFloat((windowTypeCosts.low * frameMult * glassMult * sizeMult).toFixed(2));
  const materialPerWindowHigh = parseFloat((windowTypeCosts.high * frameMult * glassMult * sizeMult).toFixed(2));

  const laborPerWindowLow = parseFloat((laborRates.low * regionMult).toFixed(2));
  const laborPerWindowHigh = parseFloat((laborRates.high * regionMult).toFixed(2));

  // ── Calculate totals ──────────────────────────────────
  const totalMaterialLow = parseFloat((materialPerWindowLow * windowCount).toFixed(2));
  const totalMaterialHigh = parseFloat((materialPerWindowHigh * windowCount).toFixed(2));
  const totalLaborLow = parseFloat((laborPerWindowLow * windowCount).toFixed(2));
  const totalLaborHigh = parseFloat((laborPerWindowHigh * windowCount).toFixed(2));

  const totalLow = parseFloat((totalMaterialLow + totalLaborLow).toFixed(2));
  const totalHigh = parseFloat((totalMaterialHigh + totalLaborHigh).toFixed(2));
  const totalMid = parseFloat(((totalLow + totalHigh) / 2).toFixed(2));

  // ── Mid-point per-window costs for display ────────────
  const materialCostPerWindow = parseFloat(((materialPerWindowLow + materialPerWindowHigh) / 2).toFixed(2));
  const laborCostPerWindow = parseFloat(((laborPerWindowLow + laborPerWindowHigh) / 2).toFixed(2));
  const costPerWindow = windowCount > 0 ? parseFloat((totalMid / windowCount).toFixed(2)) : 0;

  // ── Mid-point totals for display ──────────────────────
  const totalMaterialCost = parseFloat(((totalMaterialLow + totalMaterialHigh) / 2).toFixed(2));
  const totalLaborCost = parseFloat(((totalLaborLow + totalLaborHigh) / 2).toFixed(2));

  // ── Window type comparison (all 7 types, vinyl frame, double-pane, standard size, replacement-in-frame, national) ──
  const typeKeys = Object.keys(WINDOW_TYPE_COSTS);
  const windowTypeComparison = typeKeys.map(key => {
    const costs = WINDOW_TYPE_COSTS[key];
    const matMid = (costs.low + costs.high) / 2;
    const labMid = (INSTALLATION_LABOR_COSTS['replacement-in-frame'].low + INSTALLATION_LABOR_COSTS['replacement-in-frame'].high) / 2;
    const perWindowMid = matMid + labMid;
    const totalForCount = perWindowMid * windowCount;
    return {
      label: `${WINDOW_TYPE_LABELS[key]} ($${costs.low}–$${costs.high}/window)`,
      value: parseFloat(totalForCount.toFixed(2)),
    };
  });

  // ── Energy savings text ───────────────────────────────
  const estimatedEnergySavings = ENERGY_SAVINGS_TEXT[glassType] ?? ENERGY_SAVINGS_TEXT['double-pane'];

  return {
    windowCount,
    materialCostPerWindow,
    laborCostPerWindow,
    totalMaterialCost,
    totalLaborCost,
    totalLow,
    totalHigh,
    totalMid,
    costPerWindow,
    windowTypeComparison,
    estimatedEnergySavings,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'window-replacement-cost': calculateWindowReplacementCost,
};
