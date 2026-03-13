/**
 * Deck Calculator Formula Module
 *
 * Calculates decking boards, joists, beams, posts, footings, screws,
 * and cost estimates for a rectangular deck.
 *
 * Decking Boards:
 *   deckArea = deckLength × deckWidth (sq ft)
 *   boards = ⌈(deckArea / (boardWidth/12 × deckLength)) × 1.1⌉  (10% waste)
 *
 * Joists:
 *   joists = ⌈deckLength / (joistSpacing/12)⌉ + 1
 *
 * Beams:
 *   beams = ⌈deckWidth / 8⌉ + 1  (beam every 8 ft)
 *
 * Posts:
 *   postRows = ⌈deckLength / 8⌉ + 1
 *   postCols = ⌈deckWidth / 8⌉ + 1
 *   posts = postRows × postCols (minimum 4)
 *
 * Screws:
 *   screws = ⌈deckArea × 350 / 100⌉  (350 screws per 100 sq ft)
 *
 * Source: American Wood Council — Deck Construction Guide (DCA6)
 */

export interface DeckInput {
  deckLength: number;
  deckLengthUnit: string;
  deckWidth: number;
  deckWidthUnit: string;
  deckHeight: number;
  deckHeightUnit: string;
  boardType: string;       // 'pressure-treated' | 'cedar' | 'composite' | 'tropical-hardwood'
  boardWidth: string;      // '5.5' (nominal 6") | '3.5' (nominal 4")
  joistSpacing: string;    // '12' | '16' | '24' (inches on center)
  railingLength: number;
  stairCount: number;
}

export interface DeckOutput {
  deckArea: number;
  deckingBoards: number;
  deckingLinearFeet: number;
  joists: number;
  joistLinearFeet: number;
  beams: number;
  beamLinearFeet: number;
  posts: number;
  postHeight: number;
  concreteFootings: number;
  railingPosts: number;
  railingLinearFeet: number;
  screws: number;
  costEstimate: { label: string; value: number }[];
  materialsBreakdown: { label: string; value: number }[];
}

const lengthToFeet: Record<string, number> = {
  ft: 1,
  in: 1 / 12,
  m: 3.28084,
  cm: 0.0328084,
};

/**
 * Cost per sq ft by board type: [low, high].
 * Source: HomeAdvisor / Angi 2025-2026 national averages (materials only).
 */
const costPerSqFt: Record<string, [number, number]> = {
  'pressure-treated': [15, 25],
  'cedar': [25, 35],
  'composite': [30, 45],
  'tropical-hardwood': [40, 60],
};

/**
 * Deck calculator — boards, joists, posts, footings, screws, and cost.
 *
 * Deck Area = L × W
 * Boards = ⌈(Area / (boardWidth/12 × L)) × 1.1⌉
 * Joists = ⌈L / (spacing/12)⌉ + 1
 * Posts = postRows × postCols (beam every 8 ft grid)
 * Screws = ⌈Area × 3.5⌉
 *
 * Source: American Wood Council DCA6 Deck Construction Guide.
 */
export function calculateDeck(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const rawLength = Number(inputs.deckLength) || 0;
  const rawWidth = Number(inputs.deckWidth) || 0;
  const rawHeight = Number(inputs.deckHeight) || 0;
  const lengthUnit = String(inputs.deckLengthUnit || 'ft');
  const widthUnit = String(inputs.deckWidthUnit || 'ft');
  const heightUnit = String(inputs.deckHeightUnit || 'ft');
  const boardType = String(inputs.boardType || 'pressure-treated');
  const boardWidthIn = parseFloat(String(inputs.boardWidth || '5.5'));
  const joistSpacingIn = parseFloat(String(inputs.joistSpacing || '16'));
  const railingLength = Math.max(0, Number(inputs.railingLength) || 0);
  const stairCount = Math.max(0, Math.round(Number(inputs.stairCount) || 0));

  // ── Convert to feet ───────────────────────────────────
  const lengthFt = rawLength * (lengthToFeet[lengthUnit] ?? 1);
  const widthFt = rawWidth * (lengthToFeet[widthUnit] ?? 1);
  const heightFt = rawHeight * (lengthToFeet[heightUnit] ?? 1);

  // ── Guard: zero dimensions ────────────────────────────
  if (lengthFt <= 0 || widthFt <= 0) {
    return {
      deckArea: 0,
      deckingBoards: 0,
      deckingLinearFeet: 0,
      joists: 0,
      joistLinearFeet: 0,
      beams: 0,
      beamLinearFeet: 0,
      posts: 0,
      postHeight: 0,
      concreteFootings: 0,
      railingPosts: 0,
      railingLinearFeet: 0,
      screws: 0,
      costEstimate: [
        { label: 'Low Estimate', value: 0 },
        { label: 'Mid Estimate', value: 0 },
        { label: 'High Estimate', value: 0 },
      ],
      materialsBreakdown: [],
    };
  }

  // ── Deck area ─────────────────────────────────────────
  const deckArea = parseFloat((lengthFt * widthFt).toFixed(2));

  // ── Decking boards ────────────────────────────────────
  // Number of boards across width: width / boardWidthFt, × 1.1 waste
  const boardWidthFt = boardWidthIn / 12;
  const boardsAcross = widthFt / boardWidthFt;
  const deckingBoards = Math.ceil(boardsAcross * 1.1);
  const deckingLinearFeet = parseFloat((deckingBoards * lengthFt).toFixed(2));

  // ── Joists ────────────────────────────────────────────
  const joistSpacingFt = joistSpacingIn / 12;
  const joists = Math.ceil(lengthFt / joistSpacingFt) + 1;
  const joistLinearFeet = parseFloat((joists * widthFt).toFixed(2));

  // ── Beams ─────────────────────────────────────────────
  // One beam every 8 feet across the width
  const beams = Math.ceil(widthFt / 8) + 1;
  const beamLinearFeet = parseFloat((beams * lengthFt).toFixed(2));

  // ── Posts ─────────────────────────────────────────────
  // Posts at grid intersections of beams and 8-ft spans along length
  const postRows = Math.ceil(lengthFt / 8) + 1;
  const postCols = Math.ceil(widthFt / 8) + 1;
  const posts = Math.max(4, postRows * postCols);

  // ── Post height (deck height + 1 ft below grade) ─────
  const postHeight = parseFloat((heightFt + 1).toFixed(2));

  // ── Concrete footings (one per post) ──────────────────
  const concreteFootings = posts;

  // ── Railing ───────────────────────────────────────────
  const railingPosts = railingLength > 0 ? Math.ceil(railingLength / 6) + 1 : 0;
  const railingLinearFeet = railingLength;

  // ── Screws ────────────────────────────────────────────
  // 350 screws per 100 sq ft
  const screws = Math.ceil(deckArea * 350 / 100);

  // ── Cost estimate ─────────────────────────────────────
  const [lowRate, highRate] = costPerSqFt[boardType] ?? [15, 25];
  const costLow = parseFloat((deckArea * lowRate).toFixed(2));
  const costHigh = parseFloat((deckArea * highRate).toFixed(2));
  const costMid = parseFloat(((costLow + costHigh) / 2).toFixed(2));

  const costEstimate = [
    { label: 'Low Estimate', value: costLow },
    { label: 'Mid Estimate', value: costMid },
    { label: 'High Estimate', value: costHigh },
  ];

  // ── Materials breakdown ───────────────────────────────
  const materialsBreakdown = [
    { label: 'Decking Boards', value: deckingBoards },
    { label: 'Decking Linear Feet', value: deckingLinearFeet },
    { label: 'Joists', value: joists },
    { label: 'Joist Linear Feet', value: joistLinearFeet },
    { label: 'Beams', value: beams },
    { label: 'Beam Linear Feet', value: beamLinearFeet },
    { label: 'Posts (4×4 or 6×6)', value: posts },
    { label: 'Concrete Footings', value: concreteFootings },
    { label: 'Deck Screws', value: screws },
  ];

  if (railingLength > 0) {
    materialsBreakdown.push(
      { label: 'Railing Posts', value: railingPosts },
      { label: 'Railing Linear Feet', value: railingLinearFeet },
    );
  }

  if (stairCount > 0) {
    materialsBreakdown.push({ label: 'Stair Treads', value: stairCount });
  }

  return {
    deckArea,
    deckingBoards,
    deckingLinearFeet,
    joists,
    joistLinearFeet,
    beams,
    beamLinearFeet,
    posts,
    postHeight,
    concreteFootings,
    railingPosts,
    railingLinearFeet,
    screws,
    costEstimate,
    materialsBreakdown,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'deck': calculateDeck,
};
