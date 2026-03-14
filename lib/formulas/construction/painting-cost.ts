/**
 * Painting Cost Calculator Formula Module
 *
 * Estimates interior and exterior painting costs including labor, prep,
 * materials, and regional adjustments. Covers four project types:
 * interior walls, interior ceiling, exterior siding, and exterior trim.
 * Distinct from the paint-calculator (gallons needed only — no labor).
 *
 * Cost formula:
 *   materialCost = paintArea × paintRate(quality) × coatsMultiplier
 *   laborCost = paintArea × laborRate(projectType) × ceilingHeightMult × coatsMultiplier × regionMult
 *   prepCost = paintArea × prepRate
 *   total = materialCost + laborCost + prepCost
 *   paintGallons = (paintArea × coatsNum) / 350
 *
 * Source: HomeAdvisor / Angi 2025-2026 Painting Cost Data;
 *         Painting Contractors Association (PCA)
 */

export interface PaintingCostInput {
  paintArea: number;
  paintAreaUnit: string;        // 'sqft' | 'sqm'
  projectType: string;          // 'interior-walls' | 'interior-ceiling' | 'exterior-siding' | 'exterior-trim-only'
  paintQuality: string;         // 'builder-grade' | 'mid-range' | 'premium'
  coats: string;                // '1-coat' | '2-coats' | '3-coats'
  preparation: string;          // 'minimal-clean' | 'standard-sand-prime' | 'extensive-scrape-repair'
  ceilingHeight: string;        // 'standard-8ft' | 'tall-9-10ft' | 'extra-tall-12ft'
  region: string;               // 'national' | 'northeast' | 'west-coast' | 'mid-atlantic' | 'midwest' | 'south' | 'mountain-west'
}

export interface PaintingCostOutput {
  paintArea: number;
  materialCost: number;
  laborCost: number;
  prepCost: number;
  totalLow: number;
  totalHigh: number;
  totalMid: number;
  costPerSqFt: number;
  projectTypeComparison: { label: string; value: number }[];
  paintGallonsEstimate: number;
  timeline: string;
}

/**
 * Unit conversion factors to square feet.
 */
const areaToSqFt: Record<string, number> = {
  sqft: 1,
  sqm: 10.7639,
};

/**
 * Paint material cost per square foot by quality (paint only).
 * Source: HomeAdvisor / Angi 2025-2026 national averages.
 */
const PAINT_MATERIAL_RATES: Record<string, { low: number; high: number }> = {
  'builder-grade': { low: 0.50, high: 1.00 },
  'mid-range':     { low: 0.65, high: 1.25 },
  'premium':       { low: 0.85, high: 1.75 },
};

/**
 * Coats multiplier for paint material and labor.
 */
const COATS_MULTIPLIER: Record<string, { factor: number; coatsNum: number }> = {
  '1-coat':  { factor: 0.75, coatsNum: 1 },
  '2-coats': { factor: 1.00, coatsNum: 2 },
  '3-coats': { factor: 1.20, coatsNum: 3 },
};

/**
 * Labor cost per square foot by project type.
 * Source: HomeAdvisor / Angi 2025-2026 national averages.
 */
const LABOR_RATES: Record<string, { low: number; high: number }> = {
  'interior-walls':      { low: 1.50, high: 3.00 },
  'interior-ceiling':    { low: 1.50, high: 3.00 },
  'exterior-siding':     { low: 2.00, high: 4.00 },
  'exterior-trim-only':  { low: 3.00, high: 6.00 },
};

/**
 * Additional labor surcharge per sq ft for ceiling work
 * (added on top of base labor rate for interior-ceiling).
 */
const CEILING_SURCHARGE: { low: number; high: number } = { low: 1.00, high: 2.00 };

/**
 * Surface preparation cost per square foot.
 * Source: PCA / HomeAdvisor 2025-2026.
 */
const PREP_RATES: Record<string, { low: number; high: number }> = {
  'minimal-clean':            { low: 0.25, high: 0.50 },
  'standard-sand-prime':      { low: 0.50, high: 1.00 },
  'extensive-scrape-repair':  { low: 1.50, high: 3.00 },
};

/**
 * Ceiling height multiplier (affects labor only).
 */
const CEILING_HEIGHT_MULTIPLIER: Record<string, number> = {
  'standard-8ft':     1.00,
  'tall-9-10ft':      1.15,
  'extra-tall-12ft':  1.35,
};

/**
 * Regional labor multipliers.
 * Applied to labor portion only, not materials or prep.
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
 * Coverage per gallon of paint in square feet (one coat).
 * Industry standard: 350 sq ft per gallon.
 */
const COVERAGE_PER_GALLON = 350;

/**
 * Display labels for project types.
 */
const PROJECT_TYPE_LABELS: Record<string, string> = {
  'interior-walls':     'Interior Walls ($1.50–$3.00/sq ft labor)',
  'interior-ceiling':   'Interior Ceiling (+$1–$2/sq ft surcharge)',
  'exterior-siding':    'Exterior Siding ($2.00–$4.00/sq ft labor)',
  'exterior-trim-only': 'Exterior Trim ($3.00–$6.00/sq ft labor)',
};

/**
 * Estimate project timeline based on area and project type.
 */
function estimateTimeline(areaSqFt: number, projectType: string): string {
  if (areaSqFt <= 0) return 'N/A';
  const isExterior = projectType.startsWith('exterior');
  if (areaSqFt <= 500) return isExterior ? '1–2 days' : '1 day';
  if (areaSqFt <= 1500) return isExterior ? '2–4 days' : '1–2 days';
  if (areaSqFt <= 3000) return isExterior ? '3–5 days' : '2–3 days';
  return isExterior ? '5–10 days' : '3–5 days';
}

/**
 * Painting cost calculator.
 *
 * totalLow = materialCostLow + laborCostLow + prepCostLow
 * totalHigh = materialCostHigh + laborCostHigh + prepCostHigh
 * totalMid = (totalLow + totalHigh) / 2
 *
 * Source: HomeAdvisor / Angi 2025-2026, Painting Contractors Association (PCA).
 */
export function calculatePaintingCost(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const rawArea = Number(inputs.paintArea) || 0;
  const areaUnit = String(inputs.paintAreaUnit || 'sqft');
  const projectType = String(inputs.projectType || 'interior-walls');
  const paintQuality = String(inputs.paintQuality || 'mid-range');
  const coats = String(inputs.coats || '2-coats');
  const preparation = String(inputs.preparation || 'standard-sand-prime');
  const ceilingHeight = String(inputs.ceilingHeight || 'standard-8ft');
  const region = String(inputs.region || 'national');

  // ── Convert to square feet ────────────────────────────
  const paintArea = parseFloat((rawArea * (areaToSqFt[areaUnit] ?? 1)).toFixed(2));

  // ── Look up rates ─────────────────────────────────────
  const matRates = PAINT_MATERIAL_RATES[paintQuality] ?? PAINT_MATERIAL_RATES['mid-range'];
  const coatsData = COATS_MULTIPLIER[coats] ?? COATS_MULTIPLIER['2-coats'];
  const labRates = LABOR_RATES[projectType] ?? LABOR_RATES['interior-walls'];
  const prepRates = PREP_RATES[preparation] ?? PREP_RATES['standard-sand-prime'];
  const ceilMult = CEILING_HEIGHT_MULTIPLIER[ceilingHeight] ?? 1.0;
  const regionMult = REGIONAL_MULTIPLIERS[region] ?? 1.0;

  // ── Material cost (paint only) ────────────────────────
  const materialCostLow = parseFloat((paintArea * matRates.low * coatsData.factor).toFixed(2));
  const materialCostHigh = parseFloat((paintArea * matRates.high * coatsData.factor).toFixed(2));

  // ── Labor cost ────────────────────────────────────────
  // Base labor rates + ceiling surcharge for interior-ceiling
  let labLow = labRates.low;
  let labHigh = labRates.high;
  if (projectType === 'interior-ceiling') {
    labLow += CEILING_SURCHARGE.low;
    labHigh += CEILING_SURCHARGE.high;
  }

  const laborCostLow = parseFloat((paintArea * labLow * coatsData.factor * ceilMult * regionMult).toFixed(2));
  const laborCostHigh = parseFloat((paintArea * labHigh * coatsData.factor * ceilMult * regionMult).toFixed(2));

  // ── Prep cost ─────────────────────────────────────────
  const prepCostLow = parseFloat((paintArea * prepRates.low).toFixed(2));
  const prepCostHigh = parseFloat((paintArea * prepRates.high).toFixed(2));

  // ── Totals ────────────────────────────────────────────
  const totalLow = parseFloat((materialCostLow + laborCostLow + prepCostLow).toFixed(2));
  const totalHigh = parseFloat((materialCostHigh + laborCostHigh + prepCostHigh).toFixed(2));
  const totalMid = parseFloat(((totalLow + totalHigh) / 2).toFixed(2));
  const costPerSqFt = paintArea > 0 ? parseFloat((totalMid / paintArea).toFixed(2)) : 0;

  // ── Mid-point costs for display ───────────────────────
  const materialCost = parseFloat(((materialCostLow + materialCostHigh) / 2).toFixed(2));
  const laborCost = parseFloat(((laborCostLow + laborCostHigh) / 2).toFixed(2));
  const prepCost = parseFloat(((prepCostLow + prepCostHigh) / 2).toFixed(2));

  // ── Paint gallons estimate ────────────────────────────
  const paintGallonsEstimate = paintArea > 0
    ? parseFloat(((paintArea * coatsData.coatsNum) / COVERAGE_PER_GALLON).toFixed(2))
    : 0;

  // ── Timeline estimate ─────────────────────────────────
  const timeline = estimateTimeline(paintArea, projectType);

  // ── Project type comparison (all 4 types, national avg, standard prep) ──
  const projectTypeKeys = Object.keys(LABOR_RATES);
  const projectTypeComparison = projectTypeKeys.map(key => {
    const lr = LABOR_RATES[key];
    let compLabLow = lr.low;
    let compLabHigh = lr.high;
    if (key === 'interior-ceiling') {
      compLabLow += CEILING_SURCHARGE.low;
      compLabHigh += CEILING_SURCHARGE.high;
    }
    const matMid = paintArea * (matRates.low + matRates.high) / 2 * coatsData.factor;
    const labMid = paintArea * (compLabLow + compLabHigh) / 2 * coatsData.factor * ceilMult * regionMult;
    const prpMid = paintArea * (prepRates.low + prepRates.high) / 2;
    const mid = matMid + labMid + prpMid;
    return {
      label: PROJECT_TYPE_LABELS[key] ?? key,
      value: parseFloat(mid.toFixed(2)),
    };
  });

  return {
    paintArea,
    materialCost,
    laborCost,
    prepCost,
    totalLow,
    totalHigh,
    totalMid,
    costPerSqFt,
    projectTypeComparison,
    paintGallonsEstimate,
    timeline,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'painting-cost': calculatePaintingCost,
};
