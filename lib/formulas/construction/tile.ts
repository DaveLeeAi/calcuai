/**
 * Tile Calculator Formula Module
 *
 * Calculates the number of tiles needed for a given room area, accounting for
 * grout gap width and a configurable waste factor.
 *
 * Effective tile coverage:
 *   effectiveTileLength = (tileLength + gapSize) / 12   (feet)
 *   effectiveTileWidth  = (tileWidth + gapSize) / 12    (feet)
 *   effectiveTileArea   = effectiveTileLength × effectiveTileWidth
 *
 * Tiles needed:
 *   tilesNeeded = ⌈totalArea / effectiveTileArea⌉
 *
 * Tiles with waste:
 *   tilesWithWaste = ⌈tilesNeeded × (1 + wasteFactor)⌉
 *
 * Source: Tile Council of North America (TCNA) Handbook for Ceramic,
 * Glass, and Stone Tile Installation.
 */

export interface TileInput {
  roomLength: number;    // feet
  roomWidth: number;     // feet
  tileLength: number;    // inches
  tileWidth: number;     // inches
  gapSize: number;       // inches (grout gap)
  wasteFactor: number;   // percentage (e.g. 10 = 10%)
  costPerTile: number;   // dollars per tile
}

export interface TileOutput {
  totalArea: number;
  tilesNeeded: number;
  tilesWithWaste: number;
  tileAreaSqFt: number;
  estimatedCost: number;
  summary: { label: string; value: string | number }[];
}

/**
 * Tile calculator — tiles needed, waste, and cost estimate.
 *
 * Tiles = ⌈(roomLength × roomWidth) / effectiveTileArea⌉ × (1 + waste%)
 *
 * Source: Tile Council of North America (TCNA).
 */
export function calculateTile(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const roomLength = Number(inputs.roomLength) || 0;
  const roomWidth = Number(inputs.roomWidth) || 0;
  const tileLength = Number(inputs.tileLength) || 0;
  const tileWidth = Number(inputs.tileWidth) || 0;
  const gapSize = Number(inputs.gapSize) || 0;
  const wasteRaw = inputs.wasteFactor !== undefined ? Number(inputs.wasteFactor) : 10;
  const wasteFactor = (wasteRaw || 0) / 100;
  const costPerTile = Number(inputs.costPerTile) || 0;

  // ── Guard: invalid dimensions ─────────────────────────
  if (roomLength <= 0 || roomWidth <= 0 || tileLength <= 0 || tileWidth <= 0) {
    return {
      totalArea: 0,
      tilesNeeded: 0,
      tilesWithWaste: 0,
      tileAreaSqFt: 0,
      estimatedCost: 0,
      summary: [],
    };
  }

  // ── Total room area in square feet ────────────────────
  const totalArea = parseFloat((roomLength * roomWidth).toFixed(1));

  // ── Tile coverage calculations ────────────────────────
  // Actual tile area (no gap) — for display
  const tileAreaSqFt = parseFloat((tileLength * tileWidth / 144).toFixed(4));

  // Effective tile dimensions (tile + one grout gap per tile)
  const effectiveTileLengthFt = (tileLength + gapSize) / 12;
  const effectiveTileWidthFt = (tileWidth + gapSize) / 12;
  const effectiveTileArea = effectiveTileLengthFt * effectiveTileWidthFt;

  // ── Tiles needed (without waste) ──────────────────────
  const tilesNeeded = Math.ceil(totalArea / effectiveTileArea);

  // ── Tiles with waste ──────────────────────────────────
  // Round the intermediate product to avoid floating-point ceiling artifacts
  // (e.g. 100 * 1.1 = 110.00000000000001 → ceil = 111 without rounding)
  const tilesWithWaste = Math.ceil(parseFloat((tilesNeeded * (1 + wasteFactor)).toFixed(6)));

  // ── Cost estimate ─────────────────────────────────────
  const estimatedCost = costPerTile > 0
    ? parseFloat((tilesWithWaste * costPerTile).toFixed(2))
    : 0;

  // ── Summary breakdown ─────────────────────────────────
  const wastePercent = Math.round(wasteFactor * 100);
  const summary: { label: string; value: string | number }[] = [
    { label: 'Room Area', value: totalArea + ' sq ft' },
    { label: 'Tile Size', value: tileLength + '" \u00d7 ' + tileWidth + '"' },
    { label: 'Coverage Per Tile', value: tileAreaSqFt + ' sq ft' },
    { label: 'Tiles (No Waste)', value: tilesNeeded },
    { label: 'Tiles (With ' + wastePercent + '% Waste)', value: tilesWithWaste },
    { label: 'Extra Tiles for Waste', value: tilesWithWaste - tilesNeeded },
  ];

  if (costPerTile > 0) {
    summary.push({ label: 'Estimated Cost', value: '$' + estimatedCost.toFixed(2) });
  }

  return {
    totalArea,
    tilesNeeded,
    tilesWithWaste,
    tileAreaSqFt,
    estimatedCost,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'tile': calculateTile,
};
