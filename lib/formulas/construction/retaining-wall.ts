/**
 * Retaining Wall Calculator Formula Module
 *
 * Calculates block count, courses, cap blocks, gravel backfill, drainage pipe,
 * base material, and cost estimate for retaining walls.
 *
 * Wall Face Area = Wall Length (ft) x Wall Height (ft)
 * Blocks per sq ft = 144 / (Block Length (in) x Block Height (in))
 * Total Blocks = ceil(Wall Face Area x Blocks per sq ft x (1 + Waste%/100))
 * Rows = ceil(Wall Height (ft) x 12 / Block Height (in))
 * Blocks per Row = ceil(Wall Length (ft) x 12 / Block Length (in))
 * Cap Blocks = ceil(Wall Length (ft) x 12 / Block Length (in))
 * Gravel Backfill = Wall Length x 1 x Wall Height / 27  (cu yd, 1 ft wide zone)
 * Drain Pipe = Wall Length (linear ft)
 * Landscape Fabric = Wall Length x (Wall Height + 2) (sq ft)
 * Base Material = Wall Length x (Block Depth/12 + 0.5) x 0.5 / 27  (cu yd, 6" compacted)
 *
 * Source: National Concrete Masonry Association (NCMA) TEK guides,
 * International Code Council (ICC) residential building standards.
 */

export interface RetainingWallInput {
  wallLength: number;
  wallLengthUnit: string;       // 'ft' | 'm'
  wallHeight: number;
  wallHeightUnit: string;       // 'ft' | 'm'
  blockType: string;            // 'standard' | 'large' | 'natural-stone'
  blockLength: number;          // inches
  blockHeight: number;          // inches
  blockDepth: number;           // inches
  wasteFactor: number;          // percentage (e.g. 10)
}

export interface RetainingWallOutput {
  totalBlocks: number;
  blocksWithoutWaste: number;
  rows: number;
  blocksPerRow: number;
  capBlocks: number;
  gravelBackfill: number;
  drainPipe: number;
  baseMaterial: number;
  landscapeFabric: number;
  wallArea: number;
  costEstimate: { label: string; value: number }[];
}

const lengthToFeet: Record<string, number> = {
  ft: 1,
  m: 3.28084,
};

/**
 * Default block dimensions by type (inches).
 * Standard: 16 x 6 x 12 — typical retaining wall block (e.g. Allan Block, Versa-Lok)
 * Large: 18 x 6 x 12 — large-format landscape block
 * Natural Stone: 12 x 6 x 8 — irregular fieldstone/flagstone (higher waste)
 */
const blockDefaults: Record<string, { length: number; height: number; depth: number }> = {
  'standard': { length: 16, height: 6, depth: 12 },
  'large': { length: 18, height: 6, depth: 12 },
  'natural-stone': { length: 12, height: 6, depth: 8 },
};

/**
 * Retaining wall calculator — blocks, drainage, base, and cost estimate.
 *
 * Wall Face Area = L(ft) x H(ft)
 * Blocks per sq ft = 144 / (blockLength x blockHeight) in sq inches
 * Total Blocks = ceil(area x blocksPerSqFt x (1 + waste/100))
 * Gravel Backfill = L x 1 x H / 27 cu yd (1 ft wide behind wall)
 * Drain Pipe = L (linear ft)
 * Base Material = L x (blockDepth/12 + 0.5) x 0.5 / 27 cu yd
 *
 * Source: National Concrete Masonry Association (NCMA) TEK 15-5B.
 */
export function calculateRetainingWall(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const rawLength = Number(inputs.wallLength) || 0;
  const wallLengthUnit = String(inputs.wallLengthUnit || 'ft');
  const rawHeight = Number(inputs.wallHeight) || 0;
  const wallHeightUnit = String(inputs.wallHeightUnit || 'ft');
  const blockType = String(inputs.blockType || 'standard');
  const wasteFactor = Math.max(0, Math.min(25, Number(inputs.wasteFactor) || 10));

  // Use block defaults if user hasn't overridden
  const defaults = blockDefaults[blockType] ?? blockDefaults['standard'];
  const blockLength = Number(inputs.blockLength) || defaults.length;
  const blockHeight = Number(inputs.blockHeight) || defaults.height;
  const blockDepth = Number(inputs.blockDepth) || defaults.depth;

  // ── Convert to feet ───────────────────────────────────
  const wallLengthFt = rawLength * (lengthToFeet[wallLengthUnit] ?? 1);
  const wallHeightFt = rawHeight * (lengthToFeet[wallHeightUnit] ?? 1);

  // ── Edge case: zero dimensions ────────────────────────
  if (wallLengthFt <= 0 || wallHeightFt <= 0) {
    return {
      totalBlocks: 0,
      blocksWithoutWaste: 0,
      rows: 0,
      blocksPerRow: 0,
      capBlocks: 0,
      gravelBackfill: 0,
      drainPipe: 0,
      baseMaterial: 0,
      landscapeFabric: 0,
      wallArea: 0,
      costEstimate: [
        { label: 'Blocks (Low)', value: 0 },
        { label: 'Blocks (High)', value: 0 },
        { label: 'Cap Blocks (Low)', value: 0 },
        { label: 'Cap Blocks (High)', value: 0 },
        { label: 'Gravel Backfill', value: 0 },
        { label: 'Base Material', value: 0 },
        { label: 'Drain Pipe', value: 0 },
        { label: 'Total Material (Low)', value: 0 },
        { label: 'Total Material (High)', value: 0 },
      ],
      engineeredWallNote: false,
    };
  }

  // ── Wall face area ────────────────────────────────────
  const wallArea = wallLengthFt * wallHeightFt;

  // ── Block calculations ────────────────────────────────
  // Block face area in sq inches
  const blockFaceAreaSqIn = blockLength * blockHeight;
  // Blocks per sq ft (144 sq inches per sq ft)
  const blocksPerSqFt = 144 / blockFaceAreaSqIn;

  // Raw block count (no waste)
  const blocksWithoutWaste = Math.ceil(wallArea * blocksPerSqFt);

  // With waste
  const totalBlocks = Math.ceil(wallArea * blocksPerSqFt * (1 + wasteFactor / 100));

  // Courses (rows)
  const rows = Math.ceil((wallHeightFt * 12) / blockHeight);

  // Blocks per row (course)
  const blocksPerRow = Math.ceil((wallLengthFt * 12) / blockLength);

  // Cap blocks — one row on top
  const capBlocks = Math.ceil((wallLengthFt * 12) / blockLength);

  // ── Drainage & base materials ─────────────────────────
  // Gravel backfill: 1 ft wide zone behind wall, full height
  const gravelBackfill = parseFloat(((wallLengthFt * 1 * wallHeightFt) / 27).toFixed(2));

  // Drain pipe: runs the full length at the base
  const drainPipe = parseFloat(wallLengthFt.toFixed(1));

  // Landscape fabric: wraps behind wall + 2 ft overlap
  const landscapeFabric = parseFloat((wallLengthFt * (wallHeightFt + 2)).toFixed(1));

  // Base material: compacted gravel base, 6" deep, width = blockDepth + 6"
  const baseWidthFt = blockDepth / 12 + 0.5;
  const baseMaterial = parseFloat(((wallLengthFt * baseWidthFt * 0.5) / 27).toFixed(2));

  // ── Cost estimate ─────────────────────────────────────
  // Block cost: $3-8/block for standard/large, $5-12 for natural stone
  const isNaturalStone = blockType === 'natural-stone';
  const blockCostLow = isNaturalStone ? 5 : 3;
  const blockCostHigh = isNaturalStone ? 12 : 8;
  const capCostLow = 5;
  const capCostHigh = 12;
  // Gravel: ~$35/cu yd
  const gravelCost = parseFloat((gravelBackfill * 35).toFixed(2));
  // Base: ~$35/cu yd
  const baseCost = parseFloat((baseMaterial * 35).toFixed(2));
  // Drain pipe: ~$1.50/ft for perforated 4" PVC
  const drainCost = parseFloat((drainPipe * 1.50).toFixed(2));

  const blocksTotalLow = totalBlocks * blockCostLow;
  const blocksTotalHigh = totalBlocks * blockCostHigh;
  const capsTotalLow = capBlocks * capCostLow;
  const capsTotalHigh = capBlocks * capCostHigh;

  const totalLow = blocksTotalLow + capsTotalLow + gravelCost + baseCost + drainCost;
  const totalHigh = blocksTotalHigh + capsTotalHigh + gravelCost + baseCost + drainCost;

  const costEstimate = [
    { label: 'Blocks (Low)', value: parseFloat(blocksTotalLow.toFixed(2)) },
    { label: 'Blocks (High)', value: parseFloat(blocksTotalHigh.toFixed(2)) },
    { label: 'Cap Blocks (Low)', value: parseFloat(capsTotalLow.toFixed(2)) },
    { label: 'Cap Blocks (High)', value: parseFloat(capsTotalHigh.toFixed(2)) },
    { label: 'Gravel Backfill', value: gravelCost },
    { label: 'Base Material', value: baseCost },
    { label: 'Drain Pipe', value: drainCost },
    { label: 'Total Material (Low)', value: parseFloat(totalLow.toFixed(2)) },
    { label: 'Total Material (High)', value: parseFloat(totalHigh.toFixed(2)) },
  ];

  // ── Engineered wall note (walls > 6 ft) ───────────────
  const engineeredWallNote = wallHeightFt > 6;

  return {
    totalBlocks,
    blocksWithoutWaste,
    rows,
    blocksPerRow,
    capBlocks,
    gravelBackfill,
    drainPipe,
    baseMaterial,
    landscapeFabric,
    wallArea: parseFloat(wallArea.toFixed(2)),
    costEstimate,
    engineeredWallNote,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'retaining-wall': calculateRetainingWall,
};
