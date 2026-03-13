/**
 * Travel Budget Calculator
 *
 * Calculates comprehensive travel budget across all major expense categories:
 * flights/transport, accommodation, food, activities, local transport, shopping,
 * and travel insurance. Returns total trip cost, per-person, and per-day breakdowns.
 *
 * Formulas:
 *   days = nights + 1
 *   accommodationTotal = nights x accommodationPerNight
 *   foodTotal = days x dailyFoodBudget x travelers
 *   activityTotal = days x dailyActivityBudget x travelers
 *   transportTotal = days x dailyTransportBudget
 *   totalTripCost = flightCost + accommodationTotal + foodTotal + activityTotal
 *                   + transportTotal + shoppingBudget + travelInsurance
 *   costPerPerson = totalTripCost / travelers
 *   costPerDay = totalTripCost / days
 *
 * Source: Bureau of Labor Statistics — Consumer Expenditure Survey;
 *         U.S. Travel Association; Numbeo — Cost of Living Index.
 */

// ═══════════════════════════════════════════════════════
// Interfaces
// ═══════════════════════════════════════════════════════

export interface TravelBudgetOutput {
  totalTripCost: number;
  costPerPerson: number;
  costPerDay: number;
  accommodationTotal: number;
  foodTotal: number;
  activityTotal: number;
  transportTotal: number;
  flightCost: number;
  shoppingBudget: number;
  travelInsurance: number;
  days: number;
  costBreakdown: { label: string; value: number }[];
}

// ═══════════════════════════════════════════════════════
// Main function: Travel Budget Calculator
// ═══════════════════════════════════════════════════════

/**
 * Calculates a comprehensive travel budget with per-person and per-day breakdowns.
 *
 * Total = Flight + Accommodation + Food + Activities + Local Transport + Shopping + Insurance
 * costPerPerson = Total / travelers
 * costPerDay = Total / days
 *
 * @param inputs - Record with travelers, nights, flightCost, accommodationPerNight,
 *                 dailyFoodBudget, dailyActivityBudget, dailyTransportBudget,
 *                 shoppingBudget, travelInsurance
 * @returns Record with total cost, per-person cost, per-day cost, itemized breakdown
 */
export function calculateTravelBudget(inputs: Record<string, unknown>): Record<string, unknown> {
  // Helper: parse number with fallback that treats 0 as valid
  const num = (val: unknown, fallback: number): number => {
    const n = Number(val);
    return isNaN(n) ? fallback : n;
  };

  const travelers = Math.max(1, Math.floor(num(inputs.travelers, 2)));
  const nights = Math.max(1, Math.floor(num(inputs.nights, 7)));
  const flightCost = Math.max(0, num(inputs.flightCost, 800));
  const accommodationPerNight = Math.max(0, num(inputs.accommodationPerNight, 150));
  const dailyFoodBudget = Math.max(0, num(inputs.dailyFoodBudget, 60));
  const dailyActivityBudget = Math.max(0, num(inputs.dailyActivityBudget, 40));
  const dailyTransportBudget = Math.max(0, num(inputs.dailyTransportBudget, 20));
  const shoppingBudget = Math.max(0, num(inputs.shoppingBudget, 200));
  const travelInsurance = Math.max(0, num(inputs.travelInsurance, 0));

  // ── Days = nights + 1 ────────────────────────────────
  const days = nights + 1;

  // ── Accommodation ─────────────────────────────────────
  const accommodationTotal = parseFloat((nights * accommodationPerNight).toFixed(2));

  // ── Food (per person, per day) ────────────────────────
  const foodTotal = parseFloat((days * dailyFoodBudget * travelers).toFixed(2));

  // ── Activities (per person, per day) ──────────────────
  const activityTotal = parseFloat((days * dailyActivityBudget * travelers).toFixed(2));

  // ── Local transport (group, per day) ──────────────────
  const transportTotal = parseFloat((days * dailyTransportBudget).toFixed(2));

  // ── Totals ────────────────────────────────────────────
  const totalTripCost = parseFloat(
    (flightCost + accommodationTotal + foodTotal + activityTotal + transportTotal + shoppingBudget + travelInsurance).toFixed(2)
  );

  const costPerPerson = parseFloat((totalTripCost / travelers).toFixed(2));
  const costPerDay = parseFloat((totalTripCost / Math.max(1, days)).toFixed(2));

  // ── Cost breakdown value-group ────────────────────────
  const costBreakdown = [
    { label: 'Flights/Transport', value: parseFloat(flightCost.toFixed(2)) },
    { label: 'Accommodation', value: accommodationTotal },
    { label: 'Food', value: foodTotal },
    { label: 'Activities', value: activityTotal },
    { label: 'Local Transport', value: transportTotal },
    { label: 'Shopping & Souvenirs', value: parseFloat(shoppingBudget.toFixed(2)) },
    { label: 'Travel Insurance', value: parseFloat(travelInsurance.toFixed(2)) },
  ];

  return {
    totalTripCost,
    costPerPerson,
    costPerDay,
    accommodationTotal,
    foodTotal,
    activityTotal,
    transportTotal,
    flightCost: parseFloat(flightCost.toFixed(2)),
    shoppingBudget: parseFloat(shoppingBudget.toFixed(2)),
    travelInsurance: parseFloat(travelInsurance.toFixed(2)),
    days,
    costBreakdown,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'travel-budget': calculateTravelBudget,
};
