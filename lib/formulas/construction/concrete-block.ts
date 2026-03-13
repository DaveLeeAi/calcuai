/**
 * Concrete Block Calculator Formula Module
 *
 * Calculates the number of CMU (Concrete Masonry Unit) blocks needed for a wall,
 * accounting for block size, mortar joint width, openings, and waste factor.
 * Also estimates mortar bags, fill concrete, and rebar count.
 *
 * Wall area:
 *   netArea = (wallLength × wallHeight) - (openings × openingArea)
 *
 * Effective block face:
 *   faceArea = ((blockLength + mortarJoint) × (blockHeight + mortarJoint)) / 144  (sq ft)
 *
 * Blocks per sq ft:
 *   blocksPerSqFt = 1 / faceArea
 *
 * Blocks needed:
 *   totalBlocks = ⌈netArea × blocksPerSqFt × (1 + wasteFactor)⌉
 *
 * Courses (rows):
 *   courses = ⌈(wallHeight_ft × 12) / (blockHeight + mortarJoint)⌉
 *
 * Blocks per course:
 *   blocksPerCourse = ⌈(wallLength_ft × 12) / (blockLength + mortarJoint)⌉
 *
 * Mortar bags (80 lb):
 *   mortarBags = ⌈totalBlocks × 3.5 / 100⌉
 *
 * Fill concrete (cubic yards):
 *   fillConcrete = totalBlocks × 0.8 / 27
 *
 * Rebar (vertical, every 48"):
 *   rebarBars = ⌈(wallLength_ft × 12) / 48⌉
 *
 * Source: National Concrete Masonry Association (NCMA) TEK 4-1A —
 * Productivity and Modular Coordination in Concrete Masonry Construction.
 */

export interface ConcreteBlockInput {
  wallLength: number;       // feet (or meters)
  wallHeight: number;       // feet (or meters)
  wallLengthUnit?: string;  // 'ft' | 'm'
  wallHeightUnit?: string;  // 'ft' | 'm'
  blockSize: string;        // '8x8x16' | '8x4x16' | '12x8x16' | '6x8x16'
  mortarJoint: number;      // inches (default 0.375)
  openings: number;         // number of openings
  openingArea: number;      // sq ft per opening
  wasteFactor: number;      // percentage (e.g. 5 = 5%)
}

export interface ConcreteBlockOutput {
  totalBlocks: number;
  blocksWithoutWaste: number;
  wallArea: number;
  courses: number;
  blocksPerCourse: number;
  mortarBags: number;
  fillConcrete: number;
  rebarBars: number;
  costEstimate: { label: string; value: string | number }[];
  blockSummary: { label: string; value: string | number }[];
  summary: { label: string; value: string | number }[];
}

/**
 * Block size lookup (Height × Depth × Length in inches).
 * Nominal dimensions — the H×D×L label convention used by masonry industry.
 * Source: NCMA TEK 4-1A.
 */
const BLOCK_SIZES: Record<string, { height: number; depth: number; length: number; label: string }> = {
  '8x8x16':  { height: 8, depth: 8,  length: 16, label: 'Standard CMU (8" × 8" × 16")' },
  '8x4x16':  { height: 8, depth: 4,  length: 16, label: 'Half-Height CMU (8" × 4" × 16")' },
  '12x8x16': { height: 8, depth: 12, length: 16, label: 'Thick Wall CMU (12" × 8" × 16")' },
  '6x8x16':  { height: 8, depth: 6,  length: 16, label: 'Thin Wall CMU (6" × 8" × 16")' },
};

/** Length unit conversion to feet */
const LENGTH_TO_FEET: Record<string, number> = {
  ft: 1,
  m: 3.28084,
};

/**
 * Concrete block calculator — block count, mortar, fill concrete, rebar, and cost estimate.
 *
 * Total blocks = ⌈netArea × blocksPerSqFt × (1 + waste%)⌉
 *
 * Source: National Concrete Masonry Association (NCMA) TEK 4-1A.
 */
export function calculateConcreteBlock(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const rawLength = Number(inputs.wallLength) || 0;
  const rawHeight = Number(inputs.wallHeight) || 0;
  const wallLengthUnit = String(inputs.wallLengthUnit || 'ft');
  const wallHeightUnit = String(inputs.wallHeightUnit || 'ft');
  const blockSizeKey = String(inputs.blockSize || '8x8x16');
  const mortarJoint = Math.max(0, Number(inputs.mortarJoint) ?? 0.375);
  const openings = Math.max(0, Math.round(Number(inputs.openings) || 0));
  const openingAreaEach = Math.max(0, Number(inputs.openingArea) || 15);
  const wasteRaw = inputs.wasteFactor !== undefined ? Number(inputs.wasteFactor) : 5;
  const wasteFactor = Math.max(0, wasteRaw || 0) / 100;

  // ── Convert to feet ───────────────────────────────────
  const wallLengthFt = rawLength * (LENGTH_TO_FEET[wallLengthUnit] ?? 1);
  const wallHeightFt = rawHeight * (LENGTH_TO_FEET[wallHeightUnit] ?? 1);

  // ── Get block dimensions ──────────────────────────────
  const block = BLOCK_SIZES[blockSizeKey] ?? BLOCK_SIZES['8x8x16'];

  // ── Guard: invalid dimensions ─────────────────────────
  if (wallLengthFt <= 0 || wallHeightFt <= 0) {
    return {
      totalBlocks: 0,
      blocksWithoutWaste: 0,
      wallArea: 0,
      courses: 0,
      blocksPerCourse: 0,
      mortarBags: 0,
      fillConcrete: 0,
      rebarBars: 0,
      costEstimate: [],
      blockSummary: [],
      summary: [],
    };
  }

  // ── Wall area (deduct openings) ───────────────────────
  const grossArea = wallLengthFt * wallHeightFt;
  const openingsDeduction = openings * openingAreaEach;
  const wallArea = parseFloat(Math.max(0, grossArea - openingsDeduction).toFixed(1));

  // ── Guard: zero wall area after openings ──────────────
  if (wallArea <= 0) {
    return {
      totalBlocks: 0,
      blocksWithoutWaste: 0,
      wallArea: 0,
      courses: Math.ceil(wallHeightFt * 12 / (block.height + mortarJoint)),
      blocksPerCourse: Math.ceil(wallLengthFt * 12 / (block.length + mortarJoint)),
      mortarBags: 0,
      fillConcrete: 0,
      rebarBars: 0,
      costEstimate: [],
      blockSummary: [
        { label: 'Block Type', value: block.label },
        { label: 'Block Height', value: block.height + '"' },
        { label: 'Block Depth', value: block.depth + '"' },
        { label: 'Block Length', value: block.length + '"' },
      ],
      summary: [],
    };
  }

  // ── Blocks per square foot ────────────────────────────
  const effectiveBlockFace = ((block.length + mortarJoint) * (block.height + mortarJoint)) / 144;
  const blocksPerSqFt = 1 / effectiveBlockFace;

  // ── Blocks needed (without waste) ─────────────────────
  const blocksWithoutWaste = Math.ceil(
    parseFloat((wallArea * blocksPerSqFt).toFixed(6))
  );

  // ── Blocks with waste ─────────────────────────────────
  const totalBlocks = Math.ceil(
    parseFloat((blocksWithoutWaste * (1 + wasteFactor)).toFixed(6))
  );

  // ── Courses (rows) ────────────────────────────────────
  const courses = Math.ceil(wallHeightFt * 12 / (block.height + mortarJoint));

  // ── Blocks per course ─────────────────────────────────
  const blocksPerCourse = Math.ceil(wallLengthFt * 12 / (block.length + mortarJoint));

  // ── Mortar bags (80 lb) ───────────────────────────────
  // Approximately 3.5 bags per 100 blocks for standard 3/8" joints
  // Scale proportionally for different joint widths
  const mortarScale = mortarJoint > 0 ? mortarJoint / 0.375 : 0;
  const mortarBags = Math.ceil(totalBlocks * 3.5 * mortarScale / 100);

  // ── Fill concrete ─────────────────────────────────────
  // ~0.8 cu ft per standard CMU to fill cores (hollow blocks)
  // Scale by depth ratio relative to 8" standard
  const depthScale = block.depth / 8;
  const fillCuFtPerBlock = 0.8 * depthScale;
  const fillConcrete = parseFloat((totalBlocks * fillCuFtPerBlock / 27).toFixed(2));

  // ── Rebar (vertical, every 48") ───────────────────────
  const rebarBars = Math.ceil(wallLengthFt * 12 / 48);

  // ── Cost estimate ─────────────────────────────────────
  const blockCostLow = parseFloat((totalBlocks * 1.50).toFixed(2));
  const blockCostHigh = parseFloat((totalBlocks * 3.00).toFixed(2));
  const mortarCost = parseFloat((mortarBags * 10).toFixed(2)); // ~$10 per 80-lb bag
  const totalLow = parseFloat((blockCostLow + mortarCost).toFixed(2));
  const totalHigh = parseFloat((blockCostHigh + mortarCost).toFixed(2));

  const costEstimate: { label: string; value: string | number }[] = [
    { label: 'Blocks (Low @ $1.50/ea)', value: '$' + blockCostLow.toFixed(2) },
    { label: 'Blocks (High @ $3.00/ea)', value: '$' + blockCostHigh.toFixed(2) },
    { label: 'Mortar (80-lb bags)', value: '$' + mortarCost.toFixed(2) },
    { label: 'Total Material (Low)', value: '$' + totalLow.toFixed(2) },
    { label: 'Total Material (High)', value: '$' + totalHigh.toFixed(2) },
  ];

  // ── Block summary ─────────────────────────────────────
  const blockSummary: { label: string; value: string | number }[] = [
    { label: 'Block Type', value: block.label },
    { label: 'Block Height', value: block.height + '"' },
    { label: 'Block Depth', value: block.depth + '"' },
    { label: 'Block Length', value: block.length + '"' },
  ];

  // ── Summary breakdown ─────────────────────────────────
  const wastePercent = Math.round(wasteFactor * 100);
  const summary: { label: string; value: string | number }[] = [
    { label: 'Wall Area (Net)', value: wallArea + ' sq ft' },
    { label: 'Blocks (No Waste)', value: blocksWithoutWaste },
    { label: 'Blocks (With ' + wastePercent + '% Waste)', value: totalBlocks },
    { label: 'Courses (Rows)', value: courses },
    { label: 'Blocks Per Course', value: blocksPerCourse },
    { label: 'Mortar Bags (80 lb)', value: mortarBags },
    { label: 'Fill Concrete (cu yd)', value: fillConcrete },
    { label: 'Rebar Bars (Vertical)', value: rebarBars },
    { label: 'Openings Deducted', value: openings + ' (' + openingsDeduction + ' sq ft)' },
  ];

  return {
    totalBlocks,
    blocksWithoutWaste,
    wallArea,
    courses,
    blocksPerCourse,
    mortarBags,
    fillConcrete,
    rebarBars,
    costEstimate,
    blockSummary,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'concrete-block': calculateConcreteBlock,
};
