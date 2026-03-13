/**
 * Gas Mileage Calculator
 *
 * Calculates fuel efficiency (MPG), cost per mile, annual fuel expenses,
 * and CO2 emissions from distance driven and fuel consumed.
 *
 * Formulas:
 *   MPG = distanceDriven / fuelUsed
 *   costPerMile = fuelPrice / MPG
 *   annualFuelCost = costPerMile × 12000 (assumed annual miles)
 *   co2Emissions = fuelUsed × 19.6 (lbs CO2 per gallon, EPA factor)
 *
 * Unit conversions:
 *   1 mile = 1.60934 km
 *   1 US gallon = 3.78541 liters
 *   1 UK gallon = 4.54609 liters
 *   UK MPG = US MPG × 1.20095
 *
 * Source: EPA — Fuel Economy Guide and Greenhouse Gas Emissions Standards
 *         https://www.fueleconomy.gov/
 */

// ═══════════════════════════════════════════════════════
// Interfaces
// ═══════════════════════════════════════════════════════

export interface GasMileageOutput {
  mpg: number;
  kpl: number;
  lper100km: number;
  mpgUS: number;
  mpgUK: number;
  costPerMile: number;
  costPerKm: number;
  costPer100Miles: number;
  annualFuelCost: number;
  monthlyFuelCost: number;
  co2Emissions: number;
  fuelEfficiencyRating: string;
  costBreakdown: {
    label: string;
    items: { label: string; value: string }[];
  };
}

// ═══════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════

const KM_PER_MILE = 1.60934;
const LITERS_PER_US_GALLON = 3.78541;
const UK_TO_US_GALLON_RATIO = 1.20095; // 1 UK gallon = 1.20095 US gallons
const CO2_LBS_PER_GALLON = 19.6; // EPA factor: lbs CO2 per gallon of gasoline
const CO2_KG_PER_LITER = 2.31; // kg CO2 per liter of gasoline
const DEFAULT_ANNUAL_MILES = 12000;
const MAX_EFFICIENCY = 999; // cap for division by zero

// ═══════════════════════════════════════════════════════
// Helper: Efficiency rating
// ═══════════════════════════════════════════════════════

function getEfficiencyRating(mpgUS: number): string {
  if (mpgUS >= 50) return 'Excellent';
  if (mpgUS >= 35) return 'Good';
  if (mpgUS >= 25) return 'Average';
  if (mpgUS >= 15) return 'Below Average';
  return 'Poor — consider a more fuel-efficient vehicle';
}

// ═══════════════════════════════════════════════════════
// Main function: Gas Mileage Calculator
// ═══════════════════════════════════════════════════════

/**
 * Calculates fuel efficiency and cost metrics from distance and fuel used.
 *
 * MPG = distance / fuel; costPerMile = fuelPrice / MPG
 *
 * @param inputs - Record with distanceDriven, distanceUnit, fuelUsed, fuelUnit, fuelPrice
 * @returns Record with efficiency metrics, costs, and CO2 emissions
 */
export function calculateGasMileage(inputs: Record<string, unknown>): Record<string, unknown> {
  const distanceDriven = Math.max(0, Number(inputs.distanceDriven) || 0);
  const distanceUnit = String(inputs.distanceUnit || 'miles');
  const fuelUsed = Math.max(0, Number(inputs.fuelUsed) || 0);
  const fuelUnit = String(inputs.fuelUnit || 'gallons');
  const fuelPrice = Math.max(0, Number(inputs.fuelPrice) || 0);

  // Convert everything to miles and gallons for internal calculations
  let distanceMiles: number;
  let fuelGallons: number;

  if (distanceUnit === 'km') {
    distanceMiles = distanceDriven / KM_PER_MILE;
  } else {
    distanceMiles = distanceDriven;
  }

  if (fuelUnit === 'liters') {
    fuelGallons = fuelUsed / LITERS_PER_US_GALLON;
  } else {
    fuelGallons = fuelUsed;
  }

  // Calculate primary efficiency in native units
  let mpg: number;
  let kpl: number;
  let lper100km: number;

  if (fuelUsed === 0) {
    // No fuel used — cap at max efficiency
    mpg = distanceDriven > 0 ? MAX_EFFICIENCY : 0;
    kpl = distanceDriven > 0 ? MAX_EFFICIENCY : 0;
    lper100km = 0;
  } else if (distanceDriven === 0) {
    mpg = 0;
    kpl = 0;
    lper100km = 0;
  } else {
    mpg = distanceDriven / fuelUsed;
    kpl = distanceDriven / fuelUsed; // same formula, different units
    lper100km = (fuelUsed / distanceDriven) * 100;
  }

  // US MPG (always converted from miles/gallons)
  let mpgUS: number;
  if (fuelGallons === 0) {
    mpgUS = distanceMiles > 0 ? MAX_EFFICIENCY : 0;
  } else if (distanceMiles === 0) {
    mpgUS = 0;
  } else {
    mpgUS = distanceMiles / fuelGallons;
  }

  // UK MPG (imperial gallon is larger, so more miles per imperial gallon)
  const mpgUK = mpgUS * UK_TO_US_GALLON_RATIO;

  // L/100km from US values
  let lper100kmConverted: number;
  if (mpgUS === 0 || mpgUS >= MAX_EFFICIENCY) {
    lper100kmConverted = mpgUS === 0 ? 0 : 0;
  } else {
    lper100kmConverted = 235.215 / mpgUS;
  }

  // Cost calculations (based on native units the user entered)
  let costPerMile: number;
  let costPerKm: number;

  if (mpgUS === 0 || mpgUS >= MAX_EFFICIENCY) {
    costPerMile = mpgUS === 0 ? 0 : 0;
    costPerKm = 0;
  } else {
    // Cost per mile based on actual fuel price and efficiency
    if (distanceUnit === 'km' && fuelUnit === 'liters') {
      // Price is per liter, efficiency in km/L
      const kplActual = distanceDriven / fuelUsed;
      costPerKm = fuelPrice / kplActual;
      costPerMile = costPerKm * KM_PER_MILE;
    } else if (distanceUnit === 'miles' && fuelUnit === 'gallons') {
      // Price is per gallon, efficiency in MPG
      costPerMile = fuelPrice / mpg;
      costPerKm = costPerMile / KM_PER_MILE;
    } else if (distanceUnit === 'miles' && fuelUnit === 'liters') {
      // Mixed: miles and liters
      const milesPerLiter = distanceDriven / fuelUsed;
      costPerMile = fuelPrice / milesPerLiter;
      costPerKm = costPerMile / KM_PER_MILE;
    } else {
      // km and gallons (unusual but handle it)
      const kmPerGallon = distanceDriven / fuelUsed;
      costPerKm = fuelPrice / kmPerGallon;
      costPerMile = costPerKm * KM_PER_MILE;
    }
  }

  const costPer100Miles = costPerMile * 100;
  const annualFuelCost = costPerMile * DEFAULT_ANNUAL_MILES;
  const monthlyFuelCost = annualFuelCost / 12;

  // CO2 emissions
  let co2Emissions: number;
  if (fuelUnit === 'liters') {
    co2Emissions = fuelUsed * CO2_KG_PER_LITER * 2.20462; // convert kg to lbs
  } else {
    co2Emissions = fuelGallons * CO2_LBS_PER_GALLON;
  }

  // Efficiency rating (always based on US MPG)
  const fuelEfficiencyRating = getEfficiencyRating(mpgUS);

  // Use L/100km from native input if metric, otherwise from conversion
  const displayLper100km = (distanceUnit === 'km' && fuelUnit === 'liters')
    ? lper100km
    : lper100kmConverted;

  // Cost breakdown value-group
  const costBreakdown = {
    label: 'Cost Breakdown',
    items: [
      { label: 'Cost Per Mile', value: `$${costPerMile.toFixed(3)}` },
      { label: 'Cost Per 100 Miles', value: `$${costPer100Miles.toFixed(2)}` },
      { label: 'Monthly Fuel Cost', value: `$${monthlyFuelCost.toFixed(2)}` },
      { label: 'Annual Fuel Cost (12k mi)', value: `$${annualFuelCost.toFixed(2)}` },
    ],
  };

  return {
    mpg: parseFloat(mpg.toFixed(1)),
    kpl: parseFloat(kpl.toFixed(1)),
    lper100km: parseFloat(displayLper100km.toFixed(1)),
    mpgUS: parseFloat(mpgUS.toFixed(1)),
    mpgUK: parseFloat(mpgUK.toFixed(1)),
    costPerMile: parseFloat(costPerMile.toFixed(3)),
    costPerKm: parseFloat(costPerKm.toFixed(3)),
    costPer100Miles: parseFloat(costPer100Miles.toFixed(2)),
    annualFuelCost: parseFloat(annualFuelCost.toFixed(2)),
    monthlyFuelCost: parseFloat(monthlyFuelCost.toFixed(2)),
    co2Emissions: parseFloat(co2Emissions.toFixed(1)),
    fuelEfficiencyRating,
    costBreakdown,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'gas-mileage': calculateGasMileage,
};
