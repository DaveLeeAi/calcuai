/**
 * Propane Tank Refill Cost Calculator
 *
 * Calculates the cost to refill a propane tank based on tank size and local price.
 *
 * Formula: Refill cost = usable_gallons × price_per_gallon
 *          Annual cost = refills_per_year × refill_cost
 *
 * Source: U.S. EIA — Propane Prices (2025);
 *         Propane Education & Research Council — Tank Sizing Guide.
 */

const TANK_SIZES: Record<string, { totalGallons: number; usableGallons: number; label: string }> = {
  '20lb':   { totalGallons: 4.7,  usableGallons: 4.0,  label: '20 lb (BBQ)' },
  '30lb':   { totalGallons: 7.1,  usableGallons: 6.0,  label: '30 lb' },
  '40lb':   { totalGallons: 9.4,  usableGallons: 8.0,  label: '40 lb' },
  '100lb':  { totalGallons: 23.6, usableGallons: 20.0,  label: '100 lb' },
  '120gal': { totalGallons: 120,  usableGallons: 96,    label: '120 gallon' },
  '250gal': { totalGallons: 250,  usableGallons: 200,   label: '250 gallon' },
  '500gal': { totalGallons: 500,  usableGallons: 400,   label: '500 gallon' },
  '1000gal':{ totalGallons: 1000, usableGallons: 800,   label: '1,000 gallon' },
  custom:   { totalGallons: 0,    usableGallons: 0,     label: 'Custom' },
};

export function calculatePropaneTankRefill(inputs: Record<string, unknown>): Record<string, unknown> {
  const num = (v: unknown, d: number) => v !== undefined && v !== null && v !== '' ? Number(v) : d;
  const tankSize = String(inputs.tankSize || '500gal');
  const tank = TANK_SIZES[tankSize] || TANK_SIZES['500gal'];
  const usableGallons = tankSize === 'custom' ? Math.max(0, num(inputs.customGallons, 400)) : tank.usableGallons;
  const pricePerGallon = Math.max(0, num(inputs.pricePerGallon, 2.80));
  const refillsPerYear = Math.max(0, num(inputs.refillsPerYear, 3));
  const currentLevel = Math.min(100, Math.max(0, num(inputs.currentLevel, 20))); // percent remaining

  const gallonsNeeded = parseFloat((usableGallons * (1 - currentLevel / 100)).toFixed(1));
  const refillCost = parseFloat((gallonsNeeded * pricePerGallon).toFixed(2));
  const fullRefillCost = parseFloat((usableGallons * pricePerGallon).toFixed(2));
  const annualCost = parseFloat((fullRefillCost * refillsPerYear).toFixed(2));

  // Bulk discount estimate: orders > 200 gallons often get $0.10-$0.30/gal discount
  const bulkDiscount = usableGallons >= 200 ? 0.20 : 0;
  const discountedRefillCost = parseFloat(((pricePerGallon - bulkDiscount) * gallonsNeeded).toFixed(2));
  const bulkSavings = parseFloat((refillCost - discountedRefillCost).toFixed(2));

  return {
    gallonsNeeded,
    refillCost,
    fullRefillCost,
    annualCost,
    bulkDiscount,
    discountedRefillCost,
    bulkSavings,
    annualBulkSavings: parseFloat((bulkSavings * refillsPerYear).toFixed(2)),
    tankLabel: tank.label,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'propane-tank-refill': calculatePropaneTankRefill,
};
