/**
 * Home Energy Usage Calculator
 *
 * Calculates home energy usage costs, carbon footprint, and
 * comparisons to the U.S. average household.
 *
 * Formulas:
 *   annualKwh = monthlyKwh × 12
 *   annualCost = annualKwh × electricityRate
 *   monthlyCost = annualCost / 12
 *   dailyCost = annualCost / 365
 *   annualCO2Lbs = annualKwh × 0.92
 *   annualCO2Tons = annualCO2Lbs / 2000
 *   vsUSAverage = (annualKwh / 10500) × 100
 *   solarPanelsNeeded = ceil(annualKwh / 500)
 *
 * Source: U.S. Energy Information Administration (EIA) — Annual Energy
 *         Outlook, Residential Energy Consumption Survey (10,500 kWh/yr
 *         average). EPA eGRID — U.S. average CO2 emission factor for
 *         electricity (0.92 lbs CO2/kWh).
 */

// ═══════════════════════════════════════════════════════
// Interfaces
// ═══════════════════════════════════════════════════════

export interface HomeEnergyUsageOutput {
  monthlyCost: number;
  annualCost: number;
  dailyCost: number;
  annualKwh: number;
  monthlyKwh: number;
  annualCO2Lbs: number;
  annualCO2Tons: number;
  vsUSAverage: number;
  vsUSAverageLabel: string;
  kwhPerOccupant: number;
  kwhPerSqFt: number;
  solarPanelsNeeded: number;
  costBreakdown: { label: string; value: number }[];
}

// ═══════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════

/** EIA Residential Energy Consumption Survey — U.S. average annual kWh */
const US_AVERAGE_ANNUAL_KWH = 10500;

/** EPA eGRID — U.S. average lbs CO2 per kWh of electricity */
const CO2_LBS_PER_KWH = 0.92;

/** Lbs per short ton */
const LBS_PER_TON = 2000;

/** Approximate annual kWh production per residential solar panel (400W panel, ~5 peak sun hours, capacity factor ~0.34) */
const KWH_PER_PANEL_PER_YEAR = 500;

/** Days per year */
const DAYS_PER_YEAR = 365;

/** Months per year */
const MONTHS_PER_YEAR = 12;

// ═══════════════════════════════════════════════════════
// Main function: Home Energy Usage Calculator
// ═══════════════════════════════════════════════════════

/**
 * Calculates home energy usage, costs, carbon footprint, and U.S. average comparison.
 *
 * Annual Cost = monthlyKwh × 12 × electricityRate
 * CO2 Emissions = annualKwh × 0.92 lbs/kWh (EPA eGRID)
 *
 * @param inputs - Record with monthlyKwh, electricityRate, homeSizeSqFt, occupants
 * @returns Record with costs, usage, CO2 emissions, and comparison metrics
 */
export function calculateHomeEnergyUsage(inputs: Record<string, unknown>): Record<string, unknown> {
  const num = (val: unknown, fallback: number): number => {
    const n = Number(val);
    return isNaN(n) ? fallback : n;
  };

  const monthlyKwh = Math.max(0, num(inputs.monthlyKwh, 886));
  const electricityRate = Math.max(0, num(inputs.electricityRate, 0.16));
  const homeSizeSqFt = Math.max(0, num(inputs.homeSizeSqFt, 0));
  const occupants = Math.max(1, Math.floor(num(inputs.occupants, 3)));

  // ── Usage calculations ─────────────────────────────
  const annualKwh = parseFloat((monthlyKwh * MONTHS_PER_YEAR).toFixed(2));

  // ── Cost calculations ──────────────────────────────
  const annualCost = parseFloat((annualKwh * electricityRate).toFixed(2));
  const monthlyCost = parseFloat((annualCost / MONTHS_PER_YEAR).toFixed(2));
  const dailyCost = parseFloat((annualCost / DAYS_PER_YEAR).toFixed(2));

  // ── Carbon footprint ──────────────────────────────
  const annualCO2Lbs = parseFloat((annualKwh * CO2_LBS_PER_KWH).toFixed(2));
  const annualCO2Tons = parseFloat((annualCO2Lbs / LBS_PER_TON).toFixed(2));

  // ── US average comparison ─────────────────────────
  const vsUSAverage = parseFloat(
    ((annualKwh / US_AVERAGE_ANNUAL_KWH) * 100).toFixed(1)
  );
  const vsUSAverageLabel =
    annualKwh > US_AVERAGE_ANNUAL_KWH
      ? 'above'
      : annualKwh < US_AVERAGE_ANNUAL_KWH
        ? 'below'
        : 'at';

  // ── Per-occupant and per-sqft metrics ─────────────
  const kwhPerOccupant = parseFloat((annualKwh / occupants).toFixed(2));
  const kwhPerSqFt = homeSizeSqFt > 0
    ? parseFloat((annualKwh / homeSizeSqFt).toFixed(2))
    : 0;

  // ── Solar offset estimate ─────────────────────────
  const solarPanelsNeeded = Math.ceil(annualKwh / KWH_PER_PANEL_PER_YEAR);

  // ── Cost breakdown for table output ───────────────
  const costBreakdown = [
    { label: 'Daily Cost', value: dailyCost },
    { label: 'Monthly Cost', value: monthlyCost },
    { label: 'Annual Cost', value: annualCost },
  ];

  return {
    monthlyCost,
    annualCost,
    dailyCost,
    annualKwh,
    monthlyKwh,
    annualCO2Lbs,
    annualCO2Tons,
    vsUSAverage,
    vsUSAverageLabel,
    kwhPerOccupant,
    kwhPerSqFt,
    solarPanelsNeeded,
    costBreakdown,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'home-energy-usage': calculateHomeEnergyUsage,
};
