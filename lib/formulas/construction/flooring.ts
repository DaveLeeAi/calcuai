/**
 * Flooring Calculator Formula Module
 *
 * Calculates flooring materials needed based on room dimensions and material type.
 *
 * Floor Area Formula:
 *   Area (sq ft) = Length × Width
 *   Material Needed = Area × (1 + Waste Factor)
 *
 * Waste factors by material type:
 *   Hardwood: 10% (straight lay) to 15% (diagonal)
 *   Laminate: 10%
 *   Vinyl Plank (LVP): 10%
 *   Tile (square): 10% (straight lay) to 15% (diagonal)
 *   Tile (large format): 15%
 *   Carpet: 10%
 *   Natural Stone: 15%
 *
 * Box/Carton Calculation:
 *   Boxes = ⌈Material Needed ÷ sq ft per box⌉
 *
 * Source: National Wood Flooring Association (NWFA) installation guidelines,
 * Tile Council of North America (TCNA) waste factor recommendations.
 */

export interface FlooringInput {
  length: number;
  lengthUnit: string;
  width: number;
  widthUnit: string;
  materialType: string;      // 'hardwood' | 'laminate' | 'vinyl-plank' | 'tile' | 'carpet' | 'stone'
  wastePercent: number;
  boxSize: number;           // sq ft per box/carton
  rooms: number;             // number of identical rooms
}

export interface FlooringOutput {
  totalArea: number;
  materialNeeded: number;
  boxesNeeded: number;
  wasteArea: number;
  costEstimate: { label: string; value: number }[];
  flooringBreakdown: { label: string; value: number }[];
}

const lengthToFeet: Record<string, number> = {
  ft: 1,
  in: 1 / 12,
  m: 3.28084,
  yd: 3,
};

/**
 * Default recommended waste percentages by material type.
 * Source: NWFA, TCNA installation guidelines.
 */
const defaultWaste: Record<string, number> = {
  'hardwood': 10,
  'laminate': 10,
  'vinyl-plank': 10,
  'tile': 10,
  'carpet': 10,
  'stone': 15,
};

/**
 * Default box/carton sizes in sq ft.
 * These are typical retail box sizes — actual varies by product.
 */
const defaultBoxSize: Record<string, number> = {
  'hardwood': 20,        // typical hardwood box
  'laminate': 25,        // typical laminate box
  'vinyl-plank': 24,     // typical LVP box
  'tile': 15,            // typical tile box (varies widely)
  'carpet': 12,          // carpet sold by sq yd (12 ft wide rolls)
  'stone': 10,           // natural stone boxes
};

/**
 * Cost per sq ft (USD) — low and high estimates (materials only).
 * Source: HomeAdvisor / Angi 2025-2026 national averages.
 */
const costPerSqFtLow: Record<string, number> = {
  'hardwood': 3.00,
  'laminate': 1.00,
  'vinyl-plank': 1.50,
  'tile': 1.50,
  'carpet': 1.00,
  'stone': 5.00,
};

const costPerSqFtHigh: Record<string, number> = {
  'hardwood': 12.00,
  'laminate': 5.00,
  'vinyl-plank': 7.00,
  'tile': 8.00,
  'carpet': 5.00,
  'stone': 20.00,
};

/**
 * Flooring calculator — area, materials, boxes, and cost estimate.
 *
 * Area = Length × Width × Number of Rooms
 * Material Needed = Area × (1 + Waste%)
 * Boxes = ⌈Material Needed ÷ Box Size⌉
 *
 * Source: NWFA installation guidelines, TCNA handbook.
 */
export function calculateFlooring(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const rawLength = Number(inputs.length) || 0;
  const rawWidth = Number(inputs.width) || 0;
  const lengthUnit = String(inputs.lengthUnit || 'ft');
  const widthUnit = String(inputs.widthUnit || 'ft');
  const materialType = String(inputs.materialType || 'hardwood');
  const rooms = Math.max(1, Math.round(Number(inputs.rooms) || 1));

  // Use provided waste or default by material
  const wastePercent = inputs.wastePercent !== undefined && inputs.wastePercent !== null
    ? Math.min(30, Math.max(0, Number(inputs.wastePercent)))
    : (defaultWaste[materialType] ?? 10);

  // Use provided box size or default by material
  const boxSize = Number(inputs.boxSize) || defaultBoxSize[materialType] || 20;

  // ── Convert to feet ───────────────────────────────────
  const lengthFt = rawLength * (lengthToFeet[lengthUnit] ?? 1);
  const widthFt = rawWidth * (lengthToFeet[widthUnit] ?? 1);

  // ── Calculate areas ───────────────────────────────────
  const roomArea = lengthFt * widthFt;
  const totalArea = roomArea * rooms;

  const wasteFactor = 1 + wastePercent / 100;
  const materialNeeded = totalArea * wasteFactor;
  const wasteArea = materialNeeded - totalArea;

  // ── Boxes ─────────────────────────────────────────────
  const boxesNeeded = materialNeeded > 0 ? Math.ceil(materialNeeded / boxSize) : 0;

  // ── Cost estimate ─────────────────────────────────────
  const lowRate = costPerSqFtLow[materialType] ?? 2.00;
  const highRate = costPerSqFtHigh[materialType] ?? 8.00;
  const costLow = materialNeeded * lowRate;
  const costHigh = materialNeeded * highRate;
  const costMid = (costLow + costHigh) / 2;

  const costEstimate = [
    { label: 'Low Estimate', value: parseFloat(costLow.toFixed(2)) },
    { label: 'Mid Estimate', value: parseFloat(costMid.toFixed(2)) },
    { label: 'High Estimate', value: parseFloat(costHigh.toFixed(2)) },
  ];

  const flooringBreakdown = [
    { label: 'Room Area (sq ft)', value: parseFloat(roomArea.toFixed(2)) },
    { label: 'Total Area (sq ft)', value: parseFloat(totalArea.toFixed(2)) },
    { label: 'Waste Added (sq ft)', value: parseFloat(wasteArea.toFixed(2)) },
    { label: 'Material Needed (sq ft)', value: parseFloat(materialNeeded.toFixed(2)) },
    { label: 'Boxes/Cartons', value: boxesNeeded },
  ];

  return {
    totalArea: parseFloat(totalArea.toFixed(2)),
    materialNeeded: parseFloat(materialNeeded.toFixed(2)),
    boxesNeeded,
    wasteArea: parseFloat(wasteArea.toFixed(2)),
    costEstimate,
    flooringBreakdown,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'flooring': calculateFlooring,
};
