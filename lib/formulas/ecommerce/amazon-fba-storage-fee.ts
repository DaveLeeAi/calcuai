/**
 * Amazon FBA Storage Fee Calculator
 *
 * Formulas:
 *   Monthly Storage Fee = Cubic Feet per Unit × Units × Monthly Rate
 *   Aged Inventory Surcharge = Cubic Feet × Units × Surcharge Rate (if days > 271)
 *   Annual Estimated Cost = (Monthly Fee × 9 regular months) + (Peak Monthly Fee × 3 Q4 months)
 *   Storage Fee per Unit = Monthly Storage Fee / Units
 *
 * Monthly Rates (2026):
 *   Standard Size: $0.78/cuft (Jan–Sep), $2.40/cuft (Oct–Dec)
 *   Oversize:      $0.56/cuft (Jan–Sep), $1.40/cuft (Oct–Dec)
 *
 * Aged Inventory Surcharge (2026):
 *   271–365 days: $0.50/cuft/month
 *   365+ days:    $6.90/cuft/month
 *
 * Source: Amazon Seller Central — FBA storage fees (2026).
 * Source: Amazon — Aged inventory surcharge rates (2026).
 */

// ─────────────────────────────────────────────
// Storage rate tables (2026)
// ─────────────────────────────────────────────

const STORAGE_RATES = {
  standard: { regular: 0.78, peak: 2.40 },
  oversize:  { regular: 0.56, peak: 1.40 },
};

const AGED_SURCHARGE_RATES = {
  tier1: { minDays: 271, maxDays: 365, rate: 0.50 },  // $0.50/cuft
  tier2: { minDays: 365, maxDays: Infinity, rate: 6.90 }, // $6.90/cuft
};

// ─────────────────────────────────────────────
// Interfaces
// ─────────────────────────────────────────────

export interface StorageFeeSummaryRow {
  label: string;
  value: number;
}

export interface StorageFeeOutput {
  monthlyStorageFee: number;
  storageFeePerUnit: number;
  agedInventorySurcharge: number;
  annualStorageCost: number;
  capitalTiedUp: number;
  summary: StorageFeeSummaryRow[];
}

// ─────────────────────────────────────────────
// Main function
// ─────────────────────────────────────────────

/**
 * Calculates Amazon FBA monthly and annual storage fees including aged inventory surcharges.
 *
 * Monthly Storage = CubicFeet × Units × Rate
 * Aged Surcharge = CubicFeet × Units × SurchargeRate (if daysAged > 271)
 * Annual = (Monthly × 9) + (PeakMonthly × 3)
 *
 * @param inputs - Record with cubicFeetPerUnit, unitsStored, sizeType, storagePeriod,
 *                 daysAged, unitCost
 * @returns Record with monthlyStorageFee, storageFeePerUnit, agedInventorySurcharge,
 *          annualStorageCost, capitalTiedUp, summary
 */
export function calculateFBAStorageFee(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs
  const cubicFeet      = Math.max(0.001, Number(inputs.cubicFeetPerUnit) || 0);
  const units          = Math.max(1, Math.round(Number(inputs.unitsStored) || 1));
  const sizeType       = (inputs.sizeType as string) === 'oversize' ? 'oversize' : 'standard';
  const storagePeriod  = (inputs.storagePeriod as string) === 'peak' ? 'peak' : 'regular';
  const daysAged       = Math.max(0, Number(inputs.daysAged) || 0);
  const unitCost       = Math.max(0, Number(inputs.unitCost) || 0);

  // 2. Monthly storage rate
  const rates          = STORAGE_RATES[sizeType];
  const monthlyRate    = storagePeriod === 'peak' ? rates.peak : rates.regular;
  const totalCubicFeet = Math.round(cubicFeet * units * 10000) / 10000;
  const monthlyStorageFee = Math.round(totalCubicFeet * monthlyRate * 100) / 100;
  const storageFeePerUnit = units > 0 ? Math.round((monthlyStorageFee / units) * 10000) / 10000 : 0;

  // 3. Aged inventory surcharge
  let agedInventorySurcharge = 0;
  if (daysAged >= AGED_SURCHARGE_RATES.tier2.minDays) {
    agedInventorySurcharge = Math.round(totalCubicFeet * AGED_SURCHARGE_RATES.tier2.rate * 100) / 100;
  } else if (daysAged >= AGED_SURCHARGE_RATES.tier1.minDays) {
    agedInventorySurcharge = Math.round(totalCubicFeet * AGED_SURCHARGE_RATES.tier1.rate * 100) / 100;
  }

  // 4. Annual cost estimate (9 regular months + 3 peak months)
  const regularRate    = rates.regular;
  const peakRate       = rates.peak;
  const regularMonthly = Math.round(totalCubicFeet * regularRate * 100) / 100;
  const peakMonthly    = Math.round(totalCubicFeet * peakRate * 100) / 100;
  const annualStorageCost = Math.round((regularMonthly * 9 + peakMonthly * 3) * 100) / 100;

  // 5. Capital tied up
  const capitalTiedUp  = Math.round(units * unitCost * 100) / 100;

  // 6. Summary
  const summary: StorageFeeSummaryRow[] = [
    { label: 'Total Cubic Feet in Storage',     value: Math.round(totalCubicFeet * 1000) / 1000 },
    { label: 'Monthly Storage Fee',             value: monthlyStorageFee },
    { label: 'Storage Fee per Unit',            value: storageFeePerUnit },
    { label: 'Aged Inventory Surcharge',        value: agedInventorySurcharge },
    { label: 'Annual Estimated Storage Cost',   value: annualStorageCost },
    { label: 'Capital Tied Up in Inventory',    value: capitalTiedUp },
  ];

  return {
    monthlyStorageFee,
    storageFeePerUnit,
    agedInventorySurcharge,
    annualStorageCost,
    capitalTiedUp,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'amazon-fba-storage-fee': calculateFBAStorageFee,
};
