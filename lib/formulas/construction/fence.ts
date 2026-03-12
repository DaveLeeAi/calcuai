/**
 * Fence Calculator Formula Module
 *
 * Calculates fence materials based on length, height, style, and post spacing.
 *
 * Posts:
 *   Posts = ⌈(Fence Length ÷ Post Spacing)⌉ + 1 + Corner Posts + Gate Posts
 *
 * Rails:
 *   Rails per section = 2 (fences ≤ 6 ft) or 3 (fences > 6 ft)
 *   Total Rails = (Posts - 1) × Rails per section
 *
 * Pickets/Boards:
 *   Privacy: Boards = Fence Length ÷ Board Width (no gaps)
 *   Picket: Pickets = Fence Length ÷ (Picket Width + Gap Width)
 *   Board-on-Board: Boards = Fence Length ÷ Board Width × 1.5 (overlap)
 *
 * Concrete per post:
 *   Post holes: 10" diameter × (Fence Height ÷ 3 + 6") depth
 *   Bags (80 lb) ≈ 2 bags per post for standard 6 ft fence
 *
 * Source: American Fence Association (AFA) installation standards,
 * IRC Section R312 (height requirements for barriers).
 */

export interface FenceInput {
  fenceLength: number;
  fenceLengthUnit: string;
  fenceHeight: number;       // feet
  fenceType: string;         // 'privacy' | 'picket' | 'board-on-board' | 'split-rail' | 'chain-link'
  postSpacing: number;       // feet (typically 6 or 8)
  gateCount: number;
  gateWidth: number;         // feet per gate
  boardWidth: number;        // inches (3.5" or 5.5" typical)
}

export interface FenceOutput {
  posts: number;
  rails: number;
  boards: number;
  concreteBags: number;
  gateHardwareSets: number;
  postCaps: number;
  costEstimate: { label: string; value: number }[];
  materialBreakdown: { label: string; value: number }[];
}

const lengthToFeet: Record<string, number> = {
  ft: 1,
  in: 1 / 12,
  m: 3.28084,
  yd: 3,
};

/**
 * Rails per section by fence height.
 * Standard: 2 rails for ≤6 ft, 3 rails for >6 ft.
 */
function getRailsPerSection(heightFt: number): number {
  return heightFt > 6 ? 3 : 2;
}

/**
 * Concrete bags (80 lb) per post.
 * Rule of thumb: 1-2 bags for 4 ft fence, 2-3 bags for 6 ft, 3-4 for 8 ft.
 * Post depth = height/3 + 6 inches (AFA recommendation).
 * Hole diameter = 3× post width (typically 10-12" for 4×4 post).
 */
function getConcreteBagsPerPost(heightFt: number): number {
  const postDepthFt = heightFt / 3 + 0.5; // height/3 + 6 inches
  const holeDiameterFt = 10 / 12;          // 10 inch hole
  const radiusFt = holeDiameterFt / 2;
  const volumeCuFt = Math.PI * radiusFt * radiusFt * postDepthFt;
  // 80 lb bag yields 0.60 cu ft
  return Math.ceil(volumeCuFt / 0.60);
}

/**
 * Cost per linear foot by fence type (materials only).
 * Source: HomeAdvisor / Angi 2025-2026 national averages.
 */
const costPerFootLow: Record<string, number> = {
  'privacy': 12,
  'picket': 8,
  'board-on-board': 15,
  'split-rail': 6,
  'chain-link': 5,
};

const costPerFootHigh: Record<string, number> = {
  'privacy': 25,
  'picket': 18,
  'board-on-board': 30,
  'split-rail': 12,
  'chain-link': 15,
};

/**
 * Fence calculator — posts, rails, boards, concrete, and cost estimate.
 *
 * Posts = ⌈Fence Length ÷ Spacing⌉ + 1 + (2 × Gates)
 * Rails = (Posts - 1) × Rails per section
 * Boards = varies by fence type (see formula above)
 * Concrete = Posts × bags per post
 *
 * Source: American Fence Association (AFA) installation standards.
 */
export function calculateFence(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const rawLength = Number(inputs.fenceLength) || 0;
  const fenceLengthUnit = String(inputs.fenceLengthUnit || 'ft');
  const fenceHeight = Math.max(2, Math.min(10, Number(inputs.fenceHeight) || 6));
  const fenceType = String(inputs.fenceType || 'privacy');
  const postSpacing = Math.max(4, Math.min(10, Number(inputs.postSpacing) || 8));
  const gateCount = Math.max(0, Math.round(Number(inputs.gateCount) || 0));
  const gateWidth = Math.max(3, Math.min(16, Number(inputs.gateWidth) || 4));
  const boardWidthIn = Number(inputs.boardWidth) || 5.5; // default 5.5" (nominal 6")

  // ── Convert to feet ───────────────────────────────────
  const totalFenceLengthFt = rawLength * (lengthToFeet[fenceLengthUnit] ?? 1);

  // Subtract gate openings from fenced length
  const gateLinearFt = gateCount * gateWidth;
  const fencedLengthFt = Math.max(0, totalFenceLengthFt - gateLinearFt);

  // ── Posts ──────────────────────────────────────────────
  const fenceSections = Math.ceil(fencedLengthFt / postSpacing);
  const linePosts = fenceSections + 1;
  const gatePosts = gateCount * 2; // two posts per gate opening
  const totalPosts = linePosts + gatePosts;

  // ── Rails ──────────────────────────────────────────────
  const railsPerSection = getRailsPerSection(fenceHeight);
  // Each section between posts needs railsPerSection rails
  // Gate sections also need rails (for the gate panel)
  const totalRails = (fenceSections + gateCount) * railsPerSection;

  // ── Boards / Pickets ───────────────────────────────────
  const boardWidthFt = boardWidthIn / 12;
  let totalBoards: number;

  switch (fenceType) {
    case 'picket': {
      // Picket fence: picket width + gap (typically same as picket width for 50% open)
      const gapIn = boardWidthIn; // standard picket gap = picket width
      const picketSpacingFt = (boardWidthIn + gapIn) / 12;
      totalBoards = fencedLengthFt > 0 ? Math.ceil(fencedLengthFt / picketSpacingFt) : 0;
      break;
    }
    case 'board-on-board': {
      // Board-on-board: ~50% overlap, so roughly 1.5× the boards of privacy
      totalBoards = fencedLengthFt > 0 ? Math.ceil((fencedLengthFt / boardWidthFt) * 1.5) : 0;
      break;
    }
    case 'split-rail': {
      // Split rail has no boards — rails ARE the fence
      totalBoards = 0;
      break;
    }
    case 'chain-link': {
      // Chain link: measured in linear feet of fabric (sold by roll)
      // Represent as "rolls" — each roll is 50 ft
      totalBoards = fencedLengthFt > 0 ? Math.ceil(fencedLengthFt / 50) : 0;
      break;
    }
    case 'privacy':
    default: {
      // Privacy fence: boards touch, no gap
      totalBoards = fencedLengthFt > 0 ? Math.ceil(fencedLengthFt / boardWidthFt) : 0;
      break;
    }
  }

  // ── Concrete ───────────────────────────────────────────
  const bagsPerPost = getConcreteBagsPerPost(fenceHeight);
  const concreteBags = totalPosts * bagsPerPost;

  // ── Post caps ──────────────────────────────────────────
  const postCaps = totalPosts;

  // ── Gate hardware ──────────────────────────────────────
  const gateHardwareSets = gateCount;

  // ── Cost estimate ──────────────────────────────────────
  const lowRate = costPerFootLow[fenceType] ?? 10;
  const highRate = costPerFootHigh[fenceType] ?? 20;
  const costLow = totalFenceLengthFt * lowRate;
  const costHigh = totalFenceLengthFt * highRate;
  const costMid = (costLow + costHigh) / 2;

  const costEstimate = [
    { label: 'Low Estimate', value: parseFloat(costLow.toFixed(2)) },
    { label: 'Mid Estimate', value: parseFloat(costMid.toFixed(2)) },
    { label: 'High Estimate', value: parseFloat(costHigh.toFixed(2)) },
  ];

  const materialBreakdown = [
    { label: 'Total Fence Length (ft)', value: parseFloat(totalFenceLengthFt.toFixed(2)) },
    { label: 'Fenced Length (ft)', value: parseFloat(fencedLengthFt.toFixed(2)) },
    { label: 'Gate Openings (ft)', value: parseFloat(gateLinearFt.toFixed(2)) },
    { label: 'Fence Sections', value: fenceSections },
    { label: 'Rails per Section', value: railsPerSection },
    { label: 'Concrete per Post (bags)', value: bagsPerPost },
  ];

  return {
    posts: totalPosts,
    rails: totalRails,
    boards: totalBoards,
    concreteBags,
    gateHardwareSets,
    postCaps,
    costEstimate,
    materialBreakdown,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'fence': calculateFence,
};
