/**
 * Paver Calculator Formula Module
 *
 * Calculates the number of pavers needed for a given area, accounting for
 * joint width, lay pattern, and a configurable waste factor. Also estimates
 * base materials (gravel, leveling sand, polymeric sand).
 *
 * Effective paver coverage:
 *   effectivePaverArea = ((paverLength + jointWidth) × (paverWidth + jointWidth)) / 144  (sq ft)
 *
 * Pavers needed:
 *   paversNeeded = ⌈(totalArea / effectivePaverArea) × patternMultiplier × (1 + wasteFactor)⌉
 *
 * Base materials:
 *   sandBase   = totalArea × 1" / 12 / 27  (cubic yards — 1" leveling sand)
 *   gravelBase = totalArea × 4" / 12 / 27  (cubic yards — 4" compacted gravel)
 *   polymericSandBags = ⌈totalArea / 75⌉    (50-lb bags, ~75 sq ft coverage)
 *
 * Source: Interlocking Concrete Pavement Institute (ICPI) — Paver Installation Guide.
 */

export interface PaverInput {
  areaLength: number;       // feet (or meters with unit conversion)
  areaWidth: number;        // feet (or meters with unit conversion)
  areaLengthUnit?: string;  // 'ft' | 'm'
  areaWidthUnit?: string;   // 'ft' | 'm'
  paverLength: number;      // inches (or cm with unit conversion)
  paverWidth: number;       // inches (or cm with unit conversion)
  paverLengthUnit?: string; // 'in' | 'cm'
  paverWidthUnit?: string;  // 'in' | 'cm'
  jointWidth: number;       // inches
  pattern: string;          // 'running-bond' | 'herringbone' | 'basketweave' | 'stack-bond'
  wasteFactor: number;      // percentage (e.g. 10 = 10%)
}

export interface PaverOutput {
  paversNeeded: number;
  paversWithoutWaste: number;
  totalArea: number;
  paverAreaEach: number;
  sandBase: number;
  gravelBase: number;
  polymericSand: number;
  costEstimate: { label: string; value: string | number }[];
  summary: { label: string; value: string | number }[];
}

/** Pattern multipliers — herringbone requires ~5% more cuts */
const PATTERN_MULTIPLIERS: Record<string, number> = {
  'running-bond': 1.0,
  'herringbone': 1.05,
  'basketweave': 1.0,
  'stack-bond': 1.0,
};

/** Length unit conversion to feet */
const LENGTH_TO_FEET: Record<string, number> = {
  ft: 1,
  m: 3.28084,
};

/** Paver dimension unit conversion to inches */
const DIM_TO_INCHES: Record<string, number> = {
  in: 1,
  cm: 0.393701,
};

/**
 * Paver calculator — paver count, base materials, and cost estimate.
 *
 * Pavers = ⌈(Area / effectivePaverArea) × patternMultiplier × (1 + waste%)⌉
 *
 * Source: Interlocking Concrete Pavement Institute (ICPI).
 */
export function calculatePaver(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const rawLength = Number(inputs.areaLength) || 0;
  const rawWidth = Number(inputs.areaWidth) || 0;
  const areaLengthUnit = String(inputs.areaLengthUnit || 'ft');
  const areaWidthUnit = String(inputs.areaWidthUnit || 'ft');

  const rawPaverLength = Number(inputs.paverLength) || 0;
  const rawPaverWidth = Number(inputs.paverWidth) || 0;
  const paverLengthUnit = String(inputs.paverLengthUnit || 'in');
  const paverWidthUnit = String(inputs.paverWidthUnit || 'in');

  const jointWidth = Math.max(0, Number(inputs.jointWidth) ?? 0.25);
  const pattern = String(inputs.pattern || 'running-bond');
  const wasteRaw = inputs.wasteFactor !== undefined ? Number(inputs.wasteFactor) : 10;
  const wasteFactor = Math.max(0, wasteRaw || 0) / 100;

  // ── Convert to standard units ─────────────────────────
  const areaLengthFt = rawLength * (LENGTH_TO_FEET[areaLengthUnit] ?? 1);
  const areaWidthFt = rawWidth * (LENGTH_TO_FEET[areaWidthUnit] ?? 1);
  const paverLengthIn = rawPaverLength * (DIM_TO_INCHES[paverLengthUnit] ?? 1);
  const paverWidthIn = rawPaverWidth * (DIM_TO_INCHES[paverWidthUnit] ?? 1);

  // ── Guard: invalid dimensions ─────────────────────────
  if (areaLengthFt <= 0 || areaWidthFt <= 0 || paverLengthIn <= 0 || paverWidthIn <= 0) {
    return {
      paversNeeded: 0,
      paversWithoutWaste: 0,
      totalArea: 0,
      paverAreaEach: 0,
      sandBase: 0,
      gravelBase: 0,
      polymericSand: 0,
      costEstimate: [],
      summary: [],
    };
  }

  // ── Total area in square feet ─────────────────────────
  const totalArea = parseFloat((areaLengthFt * areaWidthFt).toFixed(1));

  // ── Paver coverage calculations ───────────────────────
  // Actual paver area (no joint) in square inches — for display
  const paverAreaEach = parseFloat((paverLengthIn * paverWidthIn).toFixed(2));

  // Effective paver dimensions (paver + one joint per direction)
  const effectivePaverLengthFt = (paverLengthIn + jointWidth) / 12;
  const effectivePaverWidthFt = (paverWidthIn + jointWidth) / 12;
  const effectivePaverArea = effectivePaverLengthFt * effectivePaverWidthFt;

  // ── Pattern multiplier ────────────────────────────────
  const patternMultiplier = PATTERN_MULTIPLIERS[pattern] ?? 1.0;

  // ── Pavers needed (without waste) ─────────────────────
  const paversWithoutWaste = Math.ceil(
    parseFloat(((totalArea / effectivePaverArea) * patternMultiplier).toFixed(6))
  );

  // ── Pavers with waste ─────────────────────────────────
  const paversNeeded = Math.ceil(
    parseFloat((paversWithoutWaste * (1 + wasteFactor)).toFixed(6))
  );

  // ── Base materials ────────────────────────────────────
  // Leveling sand: 1 inch deep
  const sandBase = parseFloat((totalArea * (1 / 12) / 27).toFixed(2));
  // Gravel base: 4 inches deep
  const gravelBase = parseFloat((totalArea * (4 / 12) / 27).toFixed(2));
  // Polymeric sand: ~75 sq ft per 50-lb bag
  const polymericSand = Math.ceil(totalArea / 75);

  // ── Cost estimate ─────────────────────────────────────
  const paverCostLow = parseFloat((paversNeeded * 0.50).toFixed(2));
  const paverCostHigh = parseFloat((paversNeeded * 2.00).toFixed(2));
  const sandCost = parseFloat((sandBase * 35).toFixed(2));   // ~$35/cu yd
  const gravelCost = parseFloat((gravelBase * 30).toFixed(2)); // ~$30/cu yd
  const polySandCost = parseFloat((polymericSand * 25).toFixed(2)); // ~$25/bag

  const costEstimate: { label: string; value: string | number }[] = [
    { label: 'Pavers (Low @ $0.50/ea)', value: '$' + paverCostLow.toFixed(2) },
    { label: 'Pavers (High @ $2.00/ea)', value: '$' + paverCostHigh.toFixed(2) },
    { label: 'Leveling Sand', value: '$' + sandCost.toFixed(2) },
    { label: 'Gravel Base', value: '$' + gravelCost.toFixed(2) },
    { label: 'Polymeric Sand', value: '$' + polySandCost.toFixed(2) },
  ];

  // ── Summary breakdown ─────────────────────────────────
  const wastePercent = Math.round(wasteFactor * 100);
  const summary: { label: string; value: string | number }[] = [
    { label: 'Total Area', value: totalArea + ' sq ft' },
    { label: 'Paver Size', value: paverLengthIn + '" \u00d7 ' + paverWidthIn + '"' },
    { label: 'Coverage Per Paver', value: paverAreaEach + ' sq in' },
    { label: 'Pattern', value: pattern.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) },
    { label: 'Pavers (No Waste)', value: paversWithoutWaste },
    { label: 'Pavers (With ' + wastePercent + '% Waste)', value: paversNeeded },
    { label: 'Gravel Base', value: gravelBase + ' cu yd' },
    { label: 'Leveling Sand', value: sandBase + ' cu yd' },
    { label: 'Polymeric Sand Bags', value: polymericSand + ' bags' },
  ];

  return {
    paversNeeded,
    paversWithoutWaste,
    totalArea,
    paverAreaEach,
    sandBase,
    gravelBase,
    polymericSand,
    costEstimate,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'paver': calculatePaver,
};
