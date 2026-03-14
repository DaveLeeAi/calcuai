/**
 * Door Replacement Cost Calculator Formula Module
 *
 * Estimates door replacement costs across seven door types
 * (interior-hollow, interior-solid, exterior-steel, exterior-fiberglass,
 * exterior-wood, french-door, sliding-glass) with three hardware tiers,
 * two frame options, three trim options, quantity scaling, and regional
 * labor multipliers.
 *
 * Cost formula:
 *   doorCostBase = doorType base price range
 *   hardwareCostBase = hardware add-on range
 *   frameMult = frame multiplier on door cost
 *   trimCostBase = trim add-on range
 *   laborCostBase = labor per door by type × regional multiplier
 *   perDoorLow = doorLow × frameMult + hardwareLow + trimLow + laborLow
 *   perDoorHigh = doorHigh × frameMult + hardwareHigh + trimHigh + laborHigh
 *   totalLow = perDoorLow × quantity
 *   totalHigh = perDoorHigh × quantity
 *   totalMid = (totalLow + totalHigh) / 2
 *
 * Source: HomeAdvisor / Angi 2025-2026 national averages;
 *         American Architectural Manufacturers Association (AAMA)
 */

export interface DoorReplacementCostInput {
  doorType: string;    // 'interior-hollow' | 'interior-solid' | 'exterior-steel' | 'exterior-fiberglass' | 'exterior-wood' | 'french-door' | 'sliding-glass'
  quantity: number;    // 1–20
  hardware: string;    // 'standard' | 'upgraded' | 'smart-lock'
  frame: string;       // 'door-only' | 'with-frame'
  trimWork: string;    // 'none' | 'standard-trim' | 'decorative-trim'
  region: string;      // 'national' | 'northeast' | 'west-coast' | 'mid-atlantic' | 'midwest' | 'south' | 'mountain-west'
}

export interface DoorReplacementCostOutput {
  doorCost: number;
  laborCost: number;
  hardwareCost: number;
  frameCost: number;
  trimCost: number;
  totalPerDoor: number;
  totalLow: number;
  totalHigh: number;
  totalMid: number;
  costPerDoor: number;
  doorTypeComparison: { label: string; value: number }[];
  timeline: string;
}

/**
 * Door unit base price ranges (door only, before frame/hardware/trim).
 * Source: HomeAdvisor / Angi 2025-2026.
 */
const DOOR_COSTS: Record<string, { low: number; high: number }> = {
  'interior-hollow':       { low: 75,   high: 200 },
  'interior-solid':        { low: 150,  high: 500 },
  'exterior-steel':        { low: 250,  high: 600 },
  'exterior-fiberglass':   { low: 400,  high: 1000 },
  'exterior-wood':         { low: 500,  high: 1500 },
  'french-door':           { low: 800,  high: 2500 },
  'sliding-glass':         { low: 1000, high: 3000 },
};

/**
 * Hardware add-on cost ranges (per door).
 */
const HARDWARE_COSTS: Record<string, { low: number; high: number }> = {
  'standard':    { low: 0,   high: 0 },
  'upgraded':    { low: 50,  high: 150 },
  'smart-lock':  { low: 150, high: 400 },
};

/**
 * Frame multiplier applied to door cost.
 * 'door-only' = no frame work (1.0x).
 * 'with-frame' = new frame + door (1.35x of door cost).
 */
const FRAME_MULTIPLIERS: Record<string, number> = {
  'door-only':   1.0,
  'with-frame':  1.35,
};

/**
 * Trim work add-on cost ranges (per door).
 */
const TRIM_COSTS: Record<string, { low: number; high: number }> = {
  'none':            { low: 0,   high: 0 },
  'standard-trim':   { low: 50,  high: 150 },
  'decorative-trim': { low: 150, high: 400 },
};

/**
 * Labor cost per door by door type.
 * Interior types: $150–$300, Exterior types: $250–$500, French/Sliding: $300–$600.
 * Source: HomeAdvisor / Angi 2025-2026.
 */
const LABOR_RATES: Record<string, { low: number; high: number }> = {
  'interior-hollow':       { low: 150, high: 300 },
  'interior-solid':        { low: 150, high: 300 },
  'exterior-steel':        { low: 250, high: 500 },
  'exterior-fiberglass':   { low: 250, high: 500 },
  'exterior-wood':         { low: 250, high: 500 },
  'french-door':           { low: 300, high: 600 },
  'sliding-glass':         { low: 300, high: 600 },
};

/**
 * Regional labor multipliers.
 * Applied to labor portion only.
 */
const REGIONAL_MULTIPLIERS: Record<string, number> = {
  'national':      1.00,
  'northeast':     1.20,
  'west-coast':    1.25,
  'mid-atlantic':  1.15,
  'midwest':       0.90,
  'south':         0.85,
  'mountain-west': 0.95,
};

/**
 * Display labels for door types.
 */
const DOOR_TYPE_LABELS: Record<string, string> = {
  'interior-hollow':     'Interior Hollow-Core',
  'interior-solid':      'Interior Solid-Core',
  'exterior-steel':      'Exterior Steel',
  'exterior-fiberglass': 'Exterior Fiberglass',
  'exterior-wood':       'Exterior Wood',
  'french-door':         'French Door',
  'sliding-glass':       'Sliding Glass Door',
};

/**
 * Timeline estimates by door type.
 */
const TIMELINE_ESTIMATES: Record<string, string> = {
  'interior-hollow':     '1–2 hours per door',
  'interior-solid':      '1–2 hours per door',
  'exterior-steel':      '2–4 hours per door',
  'exterior-fiberglass': '2–4 hours per door',
  'exterior-wood':       '3–5 hours per door',
  'french-door':         '4–6 hours per door',
  'sliding-glass':       '4–8 hours per door',
};

/**
 * Door replacement cost calculator.
 *
 * perDoorLow = (doorLow × frameMult) + hardwareLow + trimLow + (laborLow × regionMult)
 * perDoorHigh = (doorHigh × frameMult) + hardwareHigh + trimHigh + (laborHigh × regionMult)
 * totalLow = perDoorLow × quantity
 * totalHigh = perDoorHigh × quantity
 * totalMid = (totalLow + totalHigh) / 2
 *
 * Source: HomeAdvisor / Angi 2025-2026, AAMA.
 */
export function calculateDoorReplacementCost(inputs: Record<string, unknown>): Record<string, unknown> {
  // ── Parse inputs ──────────────────────────────────────
  const doorType = String(inputs.doorType || 'interior-hollow');
  const quantity = Math.max(1, Math.min(20, Number(inputs.quantity) || 1));
  const hardware = String(inputs.hardware || 'standard');
  const frame = String(inputs.frame || 'door-only');
  const trimWork = String(inputs.trimWork || 'none');
  const region = String(inputs.region || 'national');

  // ── Look up rates ─────────────────────────────────────
  const doorBase = DOOR_COSTS[doorType] ?? DOOR_COSTS['interior-hollow'];
  const hardwareBase = HARDWARE_COSTS[hardware] ?? HARDWARE_COSTS['standard'];
  const frameMult = FRAME_MULTIPLIERS[frame] ?? 1.0;
  const trimBase = TRIM_COSTS[trimWork] ?? TRIM_COSTS['none'];
  const laborBase = LABOR_RATES[doorType] ?? LABOR_RATES['interior-hollow'];
  const regionMult = REGIONAL_MULTIPLIERS[region] ?? 1.0;

  // ── Calculate per-door costs ──────────────────────────
  const doorCostLow = parseFloat((doorBase.low * frameMult).toFixed(2));
  const doorCostHigh = parseFloat((doorBase.high * frameMult).toFixed(2));

  const hardwareCostLow = parseFloat(hardwareBase.low.toFixed(2));
  const hardwareCostHigh = parseFloat(hardwareBase.high.toFixed(2));

  const trimCostLow = parseFloat(trimBase.low.toFixed(2));
  const trimCostHigh = parseFloat(trimBase.high.toFixed(2));

  const laborCostLow = parseFloat((laborBase.low * regionMult).toFixed(2));
  const laborCostHigh = parseFloat((laborBase.high * regionMult).toFixed(2));

  // ── Per-door totals ───────────────────────────────────
  const perDoorLow = parseFloat((doorCostLow + hardwareCostLow + trimCostLow + laborCostLow).toFixed(2));
  const perDoorHigh = parseFloat((doorCostHigh + hardwareCostHigh + trimCostHigh + laborCostHigh).toFixed(2));

  // ── Project totals (× quantity) ───────────────────────
  const totalLow = parseFloat((perDoorLow * quantity).toFixed(2));
  const totalHigh = parseFloat((perDoorHigh * quantity).toFixed(2));
  const totalMid = parseFloat(((totalLow + totalHigh) / 2).toFixed(2));

  // ── Mid-point costs for display (per door) ────────────
  const doorCost = parseFloat(((doorCostLow + doorCostHigh) / 2).toFixed(2));
  const laborCost = parseFloat(((laborCostLow + laborCostHigh) / 2).toFixed(2));
  const hardwareCost = parseFloat(((hardwareCostLow + hardwareCostHigh) / 2).toFixed(2));
  const trimCost = parseFloat(((trimCostLow + trimCostHigh) / 2).toFixed(2));
  const frameCost = parseFloat((doorCost - ((doorBase.low + doorBase.high) / 2)).toFixed(2));
  const totalPerDoor = parseFloat(((perDoorLow + perDoorHigh) / 2).toFixed(2));
  const costPerDoor = totalPerDoor;

  // ── Door type comparison (door-only, standard hardware, no trim, national) ──
  const doorTypeKeys = Object.keys(DOOR_COSTS);
  const doorTypeComparison = doorTypeKeys.map(key => {
    const base = DOOR_COSTS[key];
    const labor = LABOR_RATES[key] ?? LABOR_RATES['interior-hollow'];
    const doorMid = (base.low + base.high) / 2;
    const laborMid = (labor.low + labor.high) / 2;
    const mid = doorMid + laborMid;
    return {
      label: `${DOOR_TYPE_LABELS[key]} ($${base.low}–$${base.high} door)`,
      value: parseFloat(mid.toFixed(2)),
    };
  });

  // ── Timeline ──────────────────────────────────────────
  let timeline = TIMELINE_ESTIMATES[doorType] ?? '2–4 hours per door';
  if (quantity > 1) {
    timeline = `${timeline} (${quantity} doors total)`;
  }

  return {
    doorCost,
    laborCost,
    hardwareCost,
    frameCost,
    trimCost,
    totalPerDoor,
    totalLow,
    totalHigh,
    totalMid,
    costPerDoor,
    doorTypeComparison,
    timeline,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'door-replacement-cost': calculateDoorReplacementCost,
};
