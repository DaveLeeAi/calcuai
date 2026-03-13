/**
 * Trip Cost Calculator
 *
 * Calculates the total cost of a road trip including fuel, lodging,
 * food, activities, and miscellaneous expenses. Returns per-person
 * and per-day breakdowns.
 *
 * Formulas:
 *   fuelCost = (distance / fuelEfficiency) × fuelPrice
 *   lodgingCost = nights × hotelPerNight
 *   days = nights + 1
 *   foodCost = mealsPerDay × mealCost × travelers × days
 *   totalTripCost = fuelCost + lodgingCost + foodCost + activitiesBudget + miscBudget
 *   costPerPerson = totalTripCost / travelers
 *   costPerDay = totalTripCost / days
 *
 * Source: AAA — Your Driving Costs; Bureau of Transportation Statistics;
 *         GSA Per Diem Rates.
 */

// ═══════════════════════════════════════════════════════
// Interfaces
// ═══════════════════════════════════════════════════════

export interface TripCostOutput {
  totalTripCost: number;
  costPerPerson: number;
  fuelCost: number;
  lodgingCost: number;
  foodCost: number;
  activityCost: number;
  miscCost: number;
  costPerDay: number;
  costBreakdown: { label: string; value: number }[];
}

// ═══════════════════════════════════════════════════════
// Main function: Trip Cost Calculator
// ═══════════════════════════════════════════════════════

/**
 * Calculates total road trip cost with per-person and per-day breakdowns.
 *
 * fuelCost = (distance / MPG) × fuelPrice
 * totalTripCost = fuel + lodging + food + activities + misc
 *
 * @param inputs - Record with distance, fuelEfficiency, fuelPrice, nights,
 *                 hotelPerNight, mealsPerDay, mealCost, travelers,
 *                 activitiesBudget, miscBudget
 * @returns Record with total cost, per-person cost, itemized breakdown
 */
export function calculateTripCost(inputs: Record<string, unknown>): Record<string, unknown> {
  // Helper: parse number with fallback that treats 0 as valid
  const num = (val: unknown, fallback: number): number => {
    const n = Number(val);
    return isNaN(n) ? fallback : n;
  };

  const distance = Math.max(0, num(inputs.distance, 0));
  const fuelEfficiency = Math.max(0.1, num(inputs.fuelEfficiency, 28));
  const fuelPrice = Math.max(0, num(inputs.fuelPrice, 3.50));
  const nights = Math.max(0, Math.floor(num(inputs.nights, 0)));
  const hotelPerNight = Math.max(0, num(inputs.hotelPerNight, 150));
  const mealsPerDay = Math.max(0, num(inputs.mealsPerDay, 3));
  const mealCost = Math.max(0, num(inputs.mealCost, 15));
  const travelers = Math.max(1, Math.floor(num(inputs.travelers, 1)));
  const activitiesBudget = Math.max(0, num(inputs.activitiesBudget, 0));
  const miscBudget = Math.max(0, num(inputs.miscBudget, 0));

  // ── Fuel cost ───────────────────────────────────────
  const fuelCost = parseFloat(((distance / fuelEfficiency) * fuelPrice).toFixed(2));

  // ── Lodging cost ────────────────────────────────────
  const lodgingCost = parseFloat((nights * hotelPerNight).toFixed(2));

  // ── Food cost (days = nights + 1 for travel days) ──
  const days = nights + 1;
  const foodCost = parseFloat((mealsPerDay * mealCost * travelers * days).toFixed(2));

  // ── Activities & miscellaneous (already total) ──────
  const activityCost = parseFloat(activitiesBudget.toFixed(2));
  const miscCost = parseFloat(miscBudget.toFixed(2));

  // ── Totals ──────────────────────────────────────────
  const totalTripCost = parseFloat(
    (fuelCost + lodgingCost + foodCost + activityCost + miscCost).toFixed(2)
  );

  const costPerPerson = parseFloat((totalTripCost / travelers).toFixed(2));
  const costPerDay = parseFloat((totalTripCost / Math.max(1, days)).toFixed(2));

  // ── Cost breakdown value-group ──────────────────────
  const costBreakdown = [
    { label: 'Fuel', value: fuelCost },
    { label: 'Lodging', value: lodgingCost },
    { label: 'Food', value: foodCost },
    { label: 'Activities', value: activityCost },
    { label: 'Miscellaneous', value: miscCost },
  ];

  return {
    totalTripCost,
    costPerPerson,
    fuelCost,
    lodgingCost,
    foodCost,
    activityCost,
    miscCost,
    costPerDay,
    costBreakdown,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'trip-cost': calculateTripCost,
};
