/**
 * Fuel Cost Calculator
 *
 * Calculates the fuel cost for a trip based on distance, fuel efficiency,
 * and fuel price.
 *
 * Formulas:
 *   gallonsUsed = distance / mpg
 *   totalCost = gallonsUsed × pricePerGallon
 *   costPerMile = totalCost / distance
 *
 * For metric (L/100km):
 *   litersUsed = (distance / 100) × litersPer100km
 *   totalCost = litersUsed × pricePerLiter
 *
 * Source: U.S. Department of Energy / fueleconomy.gov —
 *         EPA fuel economy ratings and calculation standards.
 */

// ═══════════════════════════════════════════════════════
// Interfaces
// ═══════════════════════════════════════════════════════

export interface FuelCostOutput {
  totalCost: number;
  fuelUsed: number;
  fuelUnit: string;
  costPerMile: number;
  costPerKm: number;
  distance: number;
  distanceUnit: string;
  fuelEfficiency: number;
  efficiencyUnit: string;
  fuelPrice: number;
  priceUnit: string;
  roundTripCost: number;
  roundTripFuel: number;
}

// ═══════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════

const MILES_PER_KM = 0.621371;
const KM_PER_MILE = 1.60934;
const LITERS_PER_GALLON = 3.78541;

// ═══════════════════════════════════════════════════════
// Main function: Fuel Cost Calculator
// ═══════════════════════════════════════════════════════

/**
 * Calculates total fuel cost for a trip.
 *
 * US: gallonsUsed = distance / mpg; totalCost = gallonsUsed × pricePerGallon
 * Metric: litersUsed = (distance / 100) × L/100km; totalCost = litersUsed × pricePerLiter
 *
 * @param inputs - Record with distance, fuelEfficiency, fuelPrice, unitSystem
 * @returns Record with fuel cost breakdown
 */
export function calculateFuelCost(inputs: Record<string, unknown>): Record<string, unknown> {
  const distance = Math.max(0, Number(inputs.distance) || 0);
  const fuelEfficiency = Math.max(0.1, Number(inputs.fuelEfficiency) || 25);
  const fuelPrice = Math.max(0, Number(inputs.fuelPrice) || 3.50);
  const unitSystem = String(inputs.unitSystem || 'us');

  let fuelUsed: number;
  let totalCost: number;
  let costPerMile: number;
  let costPerKm: number;
  let fuelUnit: string;
  let distanceUnit: string;
  let efficiencyUnit: string;
  let priceUnit: string;

  if (unitSystem === 'metric') {
    // Metric: L/100km
    fuelUnit = 'liters';
    distanceUnit = 'km';
    efficiencyUnit = 'L/100km';
    priceUnit = '$/L';

    fuelUsed = (distance / 100) * fuelEfficiency;
    totalCost = fuelUsed * fuelPrice;
    costPerKm = distance > 0 ? totalCost / distance : 0;
    costPerMile = costPerKm * KM_PER_MILE;
  } else {
    // US: MPG
    fuelUnit = 'gallons';
    distanceUnit = 'miles';
    efficiencyUnit = 'MPG';
    priceUnit = '$/gal';

    fuelUsed = distance / fuelEfficiency;
    totalCost = fuelUsed * fuelPrice;
    costPerMile = distance > 0 ? totalCost / distance : 0;
    costPerKm = costPerMile * MILES_PER_KM;
  }

  const roundTripFuel = fuelUsed * 2;
  const roundTripCost = totalCost * 2;

  return {
    totalCost: parseFloat(totalCost.toFixed(2)),
    fuelUsed: parseFloat(fuelUsed.toFixed(2)),
    fuelUnit,
    costPerMile: parseFloat(costPerMile.toFixed(4)),
    costPerKm: parseFloat(costPerKm.toFixed(4)),
    distance,
    distanceUnit,
    fuelEfficiency,
    efficiencyUnit,
    fuelPrice,
    priceUnit,
    roundTripCost: parseFloat(roundTripCost.toFixed(2)),
    roundTripFuel: parseFloat(roundTripFuel.toFixed(2)),
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'fuel-cost': calculateFuelCost,
};
