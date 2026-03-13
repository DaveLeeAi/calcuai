/**
 * Renovation Cost Calculator Formula Module
 *
 * Estimates whole-home renovation costs based on square footage, quality level,
 * room-specific upgrades (kitchen, bathrooms), structural changes, permits,
 * and contingency buffer.
 *
 * Base cost:
 *   baseCost = squareFootage × costPerSqFt(qualityLevel)
 *
 * Quality level midpoints:
 *   basic = $62.50/sqft, mid-range = $112.50/sqft,
 *   high-end = $225/sqft, luxury = $400/sqft
 *
 * Kitchen premium (midpoints by quality):
 *   basic = $15,000, mid-range = $35,000, high-end = $55,000, luxury = $80,000
 *
 * Bathroom premium (midpoints by quality):
 *   basic = $8,000, mid-range = $20,000, high-end = $35,000, luxury = $50,000
 *
 * Structural surcharge:
 *   structuralCost = baseCost × 0.20
 *
 * Permits:
 *   permitCost = subtotal × (permitPercent / 100)
 *
 * Contingency:
 *   contingency = subtotal × (contingencyPercent / 100)
 *
 * Total:
 *   totalCost = baseCost + kitchenCost + bathroomCost + structuralCost + permitCost + contingency
 *
 * Source: HomeAdvisor 2024 True Cost Guide; Remodeling Magazine 2024 Cost vs. Value
 * Report; National Association of Home Builders (NAHB) Remodeling Market Index.
 */

export interface RenovationCostInput {
  squareFootage: number;           // total livable sq ft being renovated
  qualityLevel: string;            // 'basic' | 'mid-range' | 'high-end' | 'luxury'
  includeKitchen: string;          // 'yes' | 'no'
  includeBathrooms: number;        // 0–5
  structuralChanges: string;       // 'yes' | 'no'
  contingencyPercent: number;      // 10–20, default 15
  permitPercent: number;           // 1–2, default 1.5
}

export interface RenovationCostOutput {
  totalCost: number;
  baseCost: number;
  kitchenCost: number;
  bathroomCost: number;
  structuralCost: number;
  permitCost: number;
  contingency: number;
  effectiveCostPerSqFt: number;
  costBreakdown: { label: string; value: number }[];
}

/** Cost per sq ft midpoints by quality level */
const COST_PER_SQFT: Record<string, number> = {
  'basic': 62.50,         // ($50–$75 range)
  'mid-range': 112.50,    // ($75–$150 range)
  'high-end': 225.00,     // ($150–$300 range)
  'luxury': 400.00,       // ($300–$500 range)
};

/** Kitchen premium by quality level (midpoints) */
const KITCHEN_PREMIUM: Record<string, number> = {
  'basic': 15000,
  'mid-range': 35000,
  'high-end': 55000,
  'luxury': 80000,
};

/** Bathroom premium per bathroom by quality level (midpoints) */
const BATHROOM_PREMIUM: Record<string, number> = {
  'basic': 8000,
  'mid-range': 20000,
  'high-end': 35000,
  'luxury': 50000,
};

/**
 * Whole-home renovation cost calculator.
 *
 * baseCost = squareFootage × costPerSqFt(qualityLevel)
 * kitchenCost = KITCHEN_PREMIUM[qualityLevel] if includeKitchen === 'yes'
 * bathroomCost = BATHROOM_PREMIUM[qualityLevel] × includeBathrooms
 * structuralCost = baseCost × 0.20 if structuralChanges === 'yes'
 * subtotal = baseCost + kitchenCost + bathroomCost + structuralCost
 * permitCost = subtotal × (permitPercent / 100)
 * contingency = subtotal × (contingencyPercent / 100)
 * totalCost = subtotal + permitCost + contingency
 *
 * Source: HomeAdvisor 2024 True Cost Guide; Remodeling Magazine 2024 Cost vs. Value Report.
 */
export function calculateRenovationCost(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const squareFootage = Math.max(0, Number(inputs.squareFootage) || 0);
  const qualityLevel = String(inputs.qualityLevel || 'mid-range');
  const includeKitchen = String(inputs.includeKitchen || 'no');
  const includeBathrooms = Math.max(0, Math.min(5, Math.floor(Number(inputs.includeBathrooms) || 0)));
  const structuralChanges = String(inputs.structuralChanges || 'no');
  const contingencyPercent = Math.max(0, Math.min(100, Number(inputs.contingencyPercent) ?? 15));
  const permitPercent = Math.max(0, Math.min(100, Number(inputs.permitPercent) ?? 1.5));

  // ── Guard: zero square footage ────────────────────────
  if (squareFootage <= 0) {
    return {
      totalCost: 0,
      baseCost: 0,
      kitchenCost: 0,
      bathroomCost: 0,
      structuralCost: 0,
      permitCost: 0,
      contingency: 0,
      effectiveCostPerSqFt: 0,
      costBreakdown: [
        { label: 'Base Renovation', value: 0 },
        { label: 'Kitchen Renovation', value: 0 },
        { label: 'Bathroom Renovation(s)', value: 0 },
        { label: 'Structural Changes', value: 0 },
        { label: 'Estimated Permits', value: 0 },
        { label: 'Contingency Buffer', value: 0 },
      ],
    };
  }

  // ── Base cost ─────────────────────────────────────────
  const costPerSqFt = COST_PER_SQFT[qualityLevel] ?? 112.50;
  const baseCost = parseFloat((squareFootage * costPerSqFt).toFixed(2));

  // ── Kitchen premium ───────────────────────────────────
  const kitchenCost = includeKitchen === 'yes'
    ? (KITCHEN_PREMIUM[qualityLevel] ?? 35000)
    : 0;

  // ── Bathroom premium ──────────────────────────────────
  const bathroomCostPerUnit = BATHROOM_PREMIUM[qualityLevel] ?? 20000;
  const bathroomCost = parseFloat((includeBathrooms * bathroomCostPerUnit).toFixed(2));

  // ── Structural surcharge (20% of base cost) ───────────
  const structuralCost = structuralChanges === 'yes'
    ? parseFloat((baseCost * 0.20).toFixed(2))
    : 0;

  // ── Subtotal before permits & contingency ─────────────
  const subtotal = baseCost + kitchenCost + bathroomCost + structuralCost;

  // ── Permits ───────────────────────────────────────────
  const permitCost = parseFloat((subtotal * (permitPercent / 100)).toFixed(2));

  // ── Contingency ───────────────────────────────────────
  const contingency = parseFloat((subtotal * (contingencyPercent / 100)).toFixed(2));

  // ── Total ─────────────────────────────────────────────
  const totalCost = parseFloat((subtotal + permitCost + contingency).toFixed(2));
  const effectiveCostPerSqFt = parseFloat((totalCost / squareFootage).toFixed(2));

  // ── Breakdown ─────────────────────────────────────────
  const costBreakdown = [
    { label: 'Base Renovation', value: baseCost },
    { label: 'Kitchen Renovation', value: kitchenCost },
    { label: 'Bathroom Renovation(s)', value: bathroomCost },
    { label: 'Structural Changes', value: structuralCost },
    { label: 'Estimated Permits', value: permitCost },
    { label: 'Contingency Buffer', value: contingency },
  ];

  return {
    totalCost,
    baseCost,
    kitchenCost,
    bathroomCost,
    structuralCost,
    permitCost,
    contingency,
    effectiveCostPerSqFt,
    costBreakdown,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'renovation-cost': calculateRenovationCost,
};
