/**
 * Metal Roofing Calculator Formula Module
 *
 * Calculates metal roofing panels, accessories, and cost for standing seam,
 * corrugated, R-panel, and stone-coated steel installations.
 *
 * Panel count:
 *   effectiveWidth = (panelWidth - overlap) / 12   (convert inches to feet)
 *   panelsPerRow = ceil(roofLength / effectiveWidth)
 *   totalPanels = panelsPerRow x roofSides
 *   totalWithWaste = ceil(totalPanels x (1 + wasteFactor/100))
 *
 * Accessories:
 *   Ridge cap = roofLength (linear feet)
 *   Trim = 2 x roofWidth x roofSides + roofLength (approximate)
 *   Screws = totalArea x 1.5 per sq ft
 *   Underlayment = totalArea / 100 (rolls, 1 roll per roofing square)
 *
 * Source: Metal Roofing Alliance (MRA) and Metal Construction Association (MCA)
 * installation guidelines and panel coverage specifications.
 */

export interface MetalRoofingInput {
  roofLength: number;
  roofLengthUnit: string;    // 'ft' | 'm'
  roofWidth: number;
  roofWidthUnit: string;     // 'ft' | 'm'
  roofSides: string;         // '1' (shed) | '2' (gable)
  panelType: string;         // 'standing-seam' | 'corrugated' | 'r-panel' | 'stone-coated'
  panelWidth: number;        // Panel coverage width in inches
  overlap: number;           // Panel side overlap in inches
  wasteFactor: number;       // Percentage (e.g. 15)
}

export interface MetalRoofingOutput {
  totalPanels: number;
  panelsWithoutWaste: number;
  totalArea: number;
  squares: number;
  ridgeCap: number;
  screws: number;
  underlayment: number;
  trim: number;
  panelLength: number;
  costEstimate: { label: string; value: number }[];
  panelDetails: { label: string; value: number }[];
}

/** Conversion: length units to feet */
const toFeet: Record<string, number> = {
  ft: 1,
  m: 3.28084,
};

/**
 * Installed cost per sq ft by panel type (USD), low and high.
 * Source: HomeAdvisor / Angi 2025-2026 national averages for
 * material + professional installation.
 */
const costPerSqFtLow: Record<string, number> = {
  'standing-seam': 8,
  'corrugated': 4,
  'r-panel': 4,
  'stone-coated': 8,
};

const costPerSqFtHigh: Record<string, number> = {
  'standing-seam': 14,
  'corrugated': 8,
  'r-panel': 7,
  'stone-coated': 12,
};

/**
 * Metal roofing calculator — panels, accessories, and cost estimate.
 *
 * effectiveWidth = (panelWidth - overlap) / 12
 * panelsPerRow = ceil(roofLength / effectiveWidth)
 * totalPanels = panelsPerRow x sides
 * totalWithWaste = ceil(totalPanels x (1 + waste/100))
 *
 * Source: MRA and MCA installation guidelines
 */
export function calculateMetalRoofing(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const rawLength = Math.max(0, Number(inputs.roofLength) || 0);
  const rawWidth = Math.max(0, Number(inputs.roofWidth) || 0);
  const lengthUnit = String(inputs.roofLengthUnit || 'ft');
  const widthUnit = String(inputs.roofWidthUnit || 'ft');
  const roofSides = Math.max(1, Math.min(2, Number(inputs.roofSides) || 2));
  const panelType = String(inputs.panelType || 'standing-seam');
  const panelWidth = Math.max(1, Number(inputs.panelWidth) || 16);
  const overlap = Math.max(0, Number(inputs.overlap) || 1);
  const wasteFactor = Math.min(25, Math.max(0, inputs.wasteFactor !== undefined && inputs.wasteFactor !== null && inputs.wasteFactor !== '' ? Number(inputs.wasteFactor) : 15));

  // ── Convert to feet ───────────────────────────────────
  const lengthFt = rawLength * (toFeet[lengthUnit] ?? 1);
  const widthFt = rawWidth * (toFeet[widthUnit] ?? 1);

  // ── Calculate areas ───────────────────────────────────
  const areaPerSide = lengthFt * widthFt;
  const totalArea = areaPerSide * roofSides;
  const squares = totalArea / 100;

  // ── Panel calculations ────────────────────────────────
  // Panel effective width in feet (panelWidth and overlap in inches)
  const effectiveWidthFt = Math.max(0.01, (panelWidth - overlap) / 12);
  const panelsPerRow = totalArea > 0 ? Math.ceil(lengthFt / effectiveWidthFt) : 0;
  const panelLength = widthFt; // Metal panels are cut to length (ridge to eave)
  const panelsWithoutWaste = panelsPerRow * roofSides;

  // ── Apply waste factor ────────────────────────────────
  const wasteMultiplier = 1 + wasteFactor / 100;
  const totalPanels = Math.ceil(panelsWithoutWaste * wasteMultiplier);

  // ── Accessories ───────────────────────────────────────
  // Ridge cap: runs the length of the ridge line
  const ridgeCap = parseFloat(lengthFt.toFixed(2));

  // Trim: eave trim + gable trim approximation
  // 2 x roofWidth x sides (rake/gable edges) + roofLength (eave edges)
  const trim = parseFloat((2 * widthFt * roofSides + lengthFt).toFixed(2));

  // Screws: approximately 1.5 per sq ft of total area
  const screws = totalArea > 0 ? Math.ceil(totalArea * 1.5) : 0;

  // Underlayment: 1 roll per roofing square (100 sq ft)
  const underlayment = totalArea > 0 ? Math.ceil(totalArea / 100) : 0;

  // ── Cost estimate ─────────────────────────────────────
  const lowRate = costPerSqFtLow[panelType] ?? 8;
  const highRate = costPerSqFtHigh[panelType] ?? 14;
  const costLow = totalArea * lowRate;
  const costHigh = totalArea * highRate;

  const costEstimate = [
    { label: 'Low Estimate (installed)', value: parseFloat(costLow.toFixed(2)) },
    { label: 'High Estimate (installed)', value: parseFloat(costHigh.toFixed(2)) },
  ];

  // ── Panel details summary ─────────────────────────────
  const panelDetails = [
    { label: 'Panels Per Row', value: panelsPerRow },
    { label: 'Panel Length (ft)', value: parseFloat(panelLength.toFixed(2)) },
    { label: 'Effective Panel Width (in)', value: parseFloat((panelWidth - overlap).toFixed(2)) },
    { label: 'Total Roof Area (sq ft)', value: parseFloat(totalArea.toFixed(2)) },
    { label: 'Roofing Squares', value: parseFloat(squares.toFixed(2)) },
  ];

  return {
    totalPanels,
    panelsWithoutWaste,
    totalArea: parseFloat(totalArea.toFixed(2)),
    squares: parseFloat(squares.toFixed(2)),
    ridgeCap,
    screws,
    underlayment,
    trim,
    panelLength: parseFloat(panelLength.toFixed(2)),
    costEstimate,
    panelDetails,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'metal-roofing': calculateMetalRoofing,
};
