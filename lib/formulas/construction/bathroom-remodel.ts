/**
 * Bathroom Remodel Calculator Formula Module
 *
 * Estimates bathroom remodel cost based on size, bathroom type,
 * vanity quality, shower/tub work, tile, fixtures, and plumbing scope.
 *
 * Vanity cost (midpoints by quality tier):
 *   stock=$500, mid=$1,650, custom=$4,250
 *   Master bath doubles the vanity cost (double vanity).
 *
 * Shower/tub:
 *   none=$0, refinish=$450, liner=$2,000, replace=$5,000, walkin=$8,000
 *   Half bath forces shower/tub to "none".
 *
 * Tile (installed, per sq ft):
 *   basic=$5, mid=$10, premium=$20
 *
 * Fixtures (toilet + faucets + accessories):
 *   basic=$350, mid=$1,000, premium=$2,250
 *   Master bath adds 50%.
 *
 * Plumbing:
 *   none=$0, minor=$500, major=$3,500
 *
 * Labor:
 *   laborCost = (materialsCost - tileCost) × 0.30
 *   (Tile cost already includes installation labor.)
 *
 * Total:
 *   totalCost = all individual costs + laborCost
 *
 * Source: National Kitchen & Bath Association (NKBA) — Bathroom
 * Planning Guidelines; HomeAdvisor 2024 True Cost Guide; Remodeling
 * Magazine 2024 Cost vs. Value Report.
 */

export interface BathroomRemodelInput {
  bathroomSize: number;           // sq ft
  bathroomType: string;           // 'half' | 'full' | 'master'
  vanityType: string;             // 'stock' | 'mid' | 'custom'
  showerTub: string;              // 'none' | 'refinish' | 'liner' | 'replace' | 'walkin'
  tileArea: number;               // sq ft of floor + wall tile
  tileQuality: string;            // 'basic' | 'mid' | 'premium'
  fixtureLevel: string;           // 'basic' | 'mid' | 'premium'
  plumbingChanges: string;        // 'none' | 'minor' | 'major'
}

export interface BathroomRemodelOutput {
  totalCost: number;
  costPerSqFt: number;
  vanityCost: number;
  showerTubCost: number;
  tileCost: number;
  fixtureCost: number;
  plumbingCost: number;
  laborCost: number;
  costBreakdown: { label: string; value: number }[];
}

/** Vanity cost by quality tier (midpoints) */
const VANITY_COST: Record<string, number> = {
  stock: 500,
  mid: 1650,
  custom: 4250,
};

/** Shower/tub cost by scope (midpoints) */
const SHOWER_TUB_COST: Record<string, number> = {
  none: 0,
  refinish: 450,
  liner: 2000,
  replace: 5000,
  walkin: 8000,
};

/** Tile cost per sq ft installed (midpoints) */
const TILE_COST_PER_SF: Record<string, number> = {
  basic: 5,
  mid: 10,
  premium: 20,
};

/** Fixture package cost (toilet + faucets + accessories) */
const FIXTURE_COST: Record<string, number> = {
  basic: 350,
  mid: 1000,
  premium: 2250,
};

/** Plumbing cost by scope */
const PLUMBING_COST: Record<string, number> = {
  none: 0,
  minor: 500,
  major: 3500,
};

/**
 * Bathroom remodel cost calculator.
 *
 * Vanity × type multiplier + shower/tub + tile + fixtures + plumbing + labor.
 * Half bath forces shower/tub to none.
 * Master bath doubles vanity and adds 50% to fixtures.
 * Labor = 30% of non-tile materials.
 *
 * Source: NKBA Bathroom Planning Guidelines; HomeAdvisor 2024 True Cost Guide.
 */
export function calculateBathroomRemodel(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const bathroomSize = Math.max(0, Number(inputs.bathroomSize) || 0);
  const bathroomType = String(inputs.bathroomType || 'full');
  const vanityType = String(inputs.vanityType || 'mid');
  const showerTub = String(inputs.showerTub || 'replace');
  const tileArea = Math.max(0, Number(inputs.tileArea) || 0);
  const tileQuality = String(inputs.tileQuality || 'mid');
  const fixtureLevel = String(inputs.fixtureLevel || 'mid');
  const plumbingChanges = String(inputs.plumbingChanges || 'minor');

  // ── Guard: zero bathroom size ────────────────────────
  if (bathroomSize <= 0) {
    return {
      totalCost: 0,
      costPerSqFt: 0,
      vanityCost: 0,
      showerTubCost: 0,
      tileCost: 0,
      fixtureCost: 0,
      plumbingCost: 0,
      laborCost: 0,
      costBreakdown: [
        { label: 'Vanity', value: 0 },
        { label: 'Shower/Tub', value: 0 },
        { label: 'Tile & Installation', value: 0 },
        { label: 'Fixtures', value: 0 },
        { label: 'Plumbing', value: 0 },
        { label: 'Labor & Installation', value: 0 },
      ],
    };
  }

  // ── Vanity cost (master bath doubles for double vanity) ─
  const baseVanityCost = VANITY_COST[vanityType] ?? 1650;
  const vanityMultiplier = bathroomType === 'master' ? 2 : 1;
  const vanityCost = parseFloat((baseVanityCost * vanityMultiplier).toFixed(2));

  // ── Shower/tub cost (half bath forces none) ──────────
  const effectiveShowerTub = bathroomType === 'half' ? 'none' : showerTub;
  const showerTubCost = SHOWER_TUB_COST[effectiveShowerTub] ?? 0;

  // ── Tile cost (already includes installation labor) ──
  const tileCost = parseFloat((tileArea * (TILE_COST_PER_SF[tileQuality] ?? 10)).toFixed(2));

  // ── Fixture cost (master bath adds 50%) ──────────────
  const baseFixtureCost = FIXTURE_COST[fixtureLevel] ?? 1000;
  const fixtureMultiplier = bathroomType === 'master' ? 1.5 : 1;
  const fixtureCost = parseFloat((baseFixtureCost * fixtureMultiplier).toFixed(2));

  // ── Plumbing cost ────────────────────────────────────
  const plumbingCost = PLUMBING_COST[plumbingChanges] ?? 0;

  // ── Labor (30% of non-tile materials) ────────────────
  const nonTileMaterials = vanityCost + showerTubCost + fixtureCost + plumbingCost;
  const laborCost = parseFloat((nonTileMaterials * 0.30).toFixed(2));

  // ── Total ────────────────────────────────────────────
  const totalCost = parseFloat((vanityCost + showerTubCost + tileCost + fixtureCost + plumbingCost + laborCost).toFixed(2));
  const costPerSqFt = parseFloat((totalCost / bathroomSize).toFixed(2));

  // ── Breakdown ────────────────────────────────────────
  const costBreakdown = [
    { label: 'Vanity', value: vanityCost },
    { label: 'Shower/Tub', value: showerTubCost },
    { label: 'Tile & Installation', value: tileCost },
    { label: 'Fixtures', value: fixtureCost },
    { label: 'Plumbing', value: plumbingCost },
    { label: 'Labor & Installation', value: laborCost },
  ];

  return {
    totalCost,
    costPerSqFt,
    vanityCost,
    showerTubCost,
    tileCost,
    fixtureCost,
    plumbingCost,
    laborCost,
    costBreakdown,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'bathroom-remodel': calculateBathroomRemodel,
};
