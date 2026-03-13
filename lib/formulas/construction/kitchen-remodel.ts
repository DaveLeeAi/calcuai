/**
 * Kitchen Remodel Calculator Formula Module
 *
 * Estimates kitchen remodel cost based on size, cabinet quality,
 * countertop material, appliance package, flooring, backsplash,
 * and layout changes.
 *
 * Cabinet linear feet (industry rule of thumb):
 *   cabinetLF = sqrt(kitchenSize) × 2.5
 *
 * Counter area (approx 40% of floor area):
 *   counterArea = kitchenSize × 0.4
 *
 * Backsplash area (18-inch typical height):
 *   backsplashArea = cabinetLF × 1.5
 *
 * Labor:
 *   laborCost = materialsCost × 0.35
 *
 * Plumbing & Electrical:
 *   plumbingElectrical = materialsCost × 0.10 + layoutBonus
 *
 * Total:
 *   totalCost = materialsCost + laborCost + plumbingElectrical
 *
 * Source: National Kitchen & Bath Association (NKBA) — Kitchen Planning
 * Guidelines; HomeAdvisor 2024 True Cost Guide; Remodeling Magazine
 * 2024 Cost vs. Value Report.
 */

export interface KitchenRemodelInput {
  kitchenSize: number;            // sq ft
  cabinetQuality: string;         // 'stock' | 'semi-custom' | 'custom'
  countertopMaterial: string;     // 'laminate' | 'granite' | 'quartz' | 'marble'
  appliancePackage: string;       // 'basic' | 'mid' | 'premium'
  flooringType: string;           // 'vinyl' | 'tile' | 'hardwood'
  backsplashIncluded: string;     // 'no' | 'basic' | 'premium'
  layoutChange: string;           // 'none' | 'minor' | 'major'
}

export interface KitchenRemodelOutput {
  totalCost: number;
  costPerSqFt: number;
  cabinetCost: number;
  countertopCost: number;
  applianceCost: number;
  flooringCost: number;
  backsplashCost: number;
  laborCost: number;
  plumbingElectrical: number;
  costBreakdown: { label: string; value: number }[];
}

/** Cost per linear foot by cabinet quality (midpoints) */
const CABINET_COST_PER_LF: Record<string, number> = {
  stock: 200,
  'semi-custom': 400,
  custom: 850,
};

/** Cost per sq ft by countertop material (midpoints) */
const COUNTERTOP_COST_PER_SF: Record<string, number> = {
  laminate: 25,
  granite: 70,
  quartz: 100,
  marble: 137.5,
};

/** Appliance package costs (midpoints) */
const APPLIANCE_COST: Record<string, number> = {
  basic: 3000,
  mid: 6000,
  premium: 11500,
};

/** Flooring cost per sq ft (midpoints, installed) */
const FLOORING_COST_PER_SF: Record<string, number> = {
  vinyl: 4.5,
  tile: 10,
  hardwood: 16.5,
};

/** Backsplash cost per sq ft (midpoints, installed) */
const BACKSPLASH_COST_PER_SF: Record<string, number> = {
  no: 0,
  basic: 17.5,
  premium: 37.5,
};

/** Layout change costs */
const LAYOUT_CHANGE_COST: Record<string, number> = {
  none: 0,
  minor: 3000,
  major: 8000,
};

/**
 * Kitchen remodel cost calculator.
 *
 * Cabinet LF = sqrt(kitchenSize) × 2.5
 * Counter area = kitchenSize × 0.4
 * Backsplash area = cabinetLF × 1.5
 * Labor = 35% of materials
 * Plumbing/Electrical = 10% of materials + layout bonus
 *
 * Source: NKBA Kitchen Planning Guidelines; HomeAdvisor 2024 True Cost Guide.
 */
export function calculateKitchenRemodel(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const kitchenSize = Math.max(0, Number(inputs.kitchenSize) || 0);
  const cabinetQuality = String(inputs.cabinetQuality || 'semi-custom');
  const countertopMaterial = String(inputs.countertopMaterial || 'granite');
  const appliancePackage = String(inputs.appliancePackage || 'mid');
  const flooringType = String(inputs.flooringType || 'tile');
  const backsplashIncluded = String(inputs.backsplashIncluded || 'yes');
  const layoutChange = String(inputs.layoutChange || 'minor');

  // ── Guard: zero kitchen size ─────────────────────────
  if (kitchenSize <= 0) {
    return {
      totalCost: 0,
      costPerSqFt: 0,
      cabinetCost: 0,
      countertopCost: 0,
      applianceCost: 0,
      flooringCost: 0,
      backsplashCost: 0,
      laborCost: 0,
      plumbingElectrical: 0,
      costBreakdown: [
        { label: 'Cabinets', value: 0 },
        { label: 'Countertops', value: 0 },
        { label: 'Appliances', value: 0 },
        { label: 'Flooring', value: 0 },
        { label: 'Backsplash', value: 0 },
        { label: 'Layout Changes', value: 0 },
        { label: 'Labor & Installation', value: 0 },
        { label: 'Plumbing & Electrical', value: 0 },
      ],
    };
  }

  // ── Derived dimensions ───────────────────────────────
  const cabinetLF = Math.sqrt(kitchenSize) * 2.5;
  const counterArea = kitchenSize * 0.4;
  const backsplashArea = cabinetLF * 1.5;

  // ── Individual costs ─────────────────────────────────
  const cabinetCost = parseFloat((cabinetLF * (CABINET_COST_PER_LF[cabinetQuality] ?? 400)).toFixed(2));
  const countertopCost = parseFloat((counterArea * (COUNTERTOP_COST_PER_SF[countertopMaterial] ?? 70)).toFixed(2));
  const applianceCost = APPLIANCE_COST[appliancePackage] ?? 6000;
  const flooringCost = parseFloat((kitchenSize * (FLOORING_COST_PER_SF[flooringType] ?? 10)).toFixed(2));
  const backsplashCost = parseFloat((backsplashArea * (BACKSPLASH_COST_PER_SF[backsplashIncluded] ?? 0)).toFixed(2));
  const layoutChangeCost = LAYOUT_CHANGE_COST[layoutChange] ?? 0;

  // ── Materials total (for labor/plumbing calculations) ─
  const materialsCost = cabinetCost + countertopCost + applianceCost + flooringCost + backsplashCost;

  // ── Labor & plumbing ─────────────────────────────────
  const laborCost = parseFloat((materialsCost * 0.35).toFixed(2));
  const plumbingElectrical = parseFloat((materialsCost * 0.10 + layoutChangeCost).toFixed(2));

  // ── Total ────────────────────────────────────────────
  const totalCost = parseFloat((materialsCost + laborCost + plumbingElectrical).toFixed(2));
  const costPerSqFt = parseFloat((totalCost / kitchenSize).toFixed(2));

  // ── Breakdown ────────────────────────────────────────
  const costBreakdown = [
    { label: 'Cabinets', value: cabinetCost },
    { label: 'Countertops', value: countertopCost },
    { label: 'Appliances', value: applianceCost },
    { label: 'Flooring', value: flooringCost },
    { label: 'Backsplash', value: backsplashCost },
    { label: 'Layout Changes', value: layoutChangeCost },
    { label: 'Labor & Installation', value: laborCost },
    { label: 'Plumbing & Electrical', value: plumbingElectrical },
  ];

  return {
    totalCost,
    costPerSqFt,
    cabinetCost,
    countertopCost,
    applianceCost,
    flooringCost,
    backsplashCost,
    laborCost,
    plumbingElectrical,
    costBreakdown,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'kitchen-remodel': calculateKitchenRemodel,
};
