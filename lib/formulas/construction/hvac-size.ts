/**
 * HVAC Size Calculator
 *
 * Calculates heating/cooling capacity (BTU and tonnage) needed for a home
 * based on square footage, ceiling height, climate, insulation, and other factors.
 *
 * Formulas:
 *   baseBTU = squareFootage × 20 BTU/sq ft
 *   totalBTU = baseBTU × climateMultiplier × insulationMultiplier
 *              × ceilingMultiplier × storiesMultiplier
 *              × windowsMultiplier × sunMultiplier
 *   tons = totalBTU / 12,000
 *   recommendedTons = round to nearest 0.5 ton
 *   cfmAirflow = totalBTU / 30
 *
 * Source: ACCA Manual J (Residential Load Calculation), ENERGY STAR,
 *         U.S. Department of Energy — HVAC sizing guidelines.
 */

// ═══════════════════════════════════════════════════════
// Interfaces
// ═══════════════════════════════════════════════════════

export interface HvacSizeOutput {
  btuRequired: number;
  tons: number;
  recommendedTons: number;
  recommendedUnit: string;
  cubicFeet: number;
  cfmAirflow: number;
  costEstimate: { label: string; value: number }[];
  energyEstimate: { label: string; value: number }[];
}

// ═══════════════════════════════════════════════════════
// Multiplier Lookup Tables
// ═══════════════════════════════════════════════════════

const climateMultipliers: Record<string, number> = {
  'hot-humid': 1.2,
  'hot-dry': 1.1,
  'mixed': 1.0,
  'cold': 1.1,
  'very-cold': 1.25,
};

const insulationMultipliers: Record<string, number> = {
  'poor': 1.3,
  'average': 1.0,
  'good': 0.85,
  'excellent': 0.75,
};

const storiesMultipliers: Record<string, number> = {
  '1': 1.0,
  '2': 1.1,
  '3': 1.15,
};

const windowsMultipliers: Record<string, number> = {
  'few': 0.9,
  'average': 1.0,
  'many': 1.15,
};

const sunMultipliers: Record<string, number> = {
  'shaded': 0.9,
  'partial': 1.0,
  'full-sun': 1.1,
};

// ═══════════════════════════════════════════════════════
// Cost ranges by tonnage
// ═══════════════════════════════════════════════════════

/**
 * Returns central AC cost range based on system tonnage.
 * Source: HomeAdvisor/Angi 2025 national averages.
 */
function getCentralACCost(tons: number): [number, number] {
  if (tons <= 1.5) return [2500, 4500];
  if (tons <= 2.5) return [3000, 5500];
  if (tons <= 3.5) return [3500, 6500];
  if (tons <= 4.5) return [4500, 7500];
  return [5500, 9000];
}

/**
 * Returns heat pump cost range based on system tonnage.
 */
function getHeatPumpCost(tons: number): [number, number] {
  if (tons <= 1.5) return [3500, 6000];
  if (tons <= 2.5) return [4500, 7500];
  if (tons <= 3.5) return [5500, 8500];
  if (tons <= 4.5) return [6500, 9500];
  return [7500, 11000];
}

// ═══════════════════════════════════════════════════════
// Main function: HVAC Size Calculator
// ═══════════════════════════════════════════════════════

/**
 * Calculates HVAC sizing based on home characteristics.
 *
 * totalBTU = sqft × 20 × climate × insulation × ceiling × stories × windows × sun
 * tons = totalBTU / 12,000 (rounded to nearest 0.5)
 *
 * @param inputs - Record with squareFootage, ceilingHeight, climate, insulation, stories, windows, sunExposure
 * @returns Record with BTU, tonnage, airflow, cost, and energy estimates
 */
export function calculateHvacSize(inputs: Record<string, unknown>): Record<string, unknown> {
  const squareFootage = Math.max(0, Number(inputs.squareFootage) || 0);
  const ceilingHeight = Math.max(7, Math.min(20, Number(inputs.ceilingHeight) || 8));
  const climate = String(inputs.climate || 'mixed');
  const insulation = String(inputs.insulation || 'average');
  const stories = String(inputs.stories || '1');
  const windows = String(inputs.windows || 'average');
  const sunExposure = String(inputs.sunExposure || 'partial');

  // ── Guard: zero square footage ────────────────────────
  if (squareFootage <= 0) {
    return {
      btuRequired: 0,
      tons: 0,
      recommendedTons: 0,
      recommendedUnit: '0-ton system',
      cubicFeet: 0,
      cfmAirflow: 0,
      costEstimate: [
        { label: 'Central AC Unit', value: 0 },
        { label: 'Heat Pump', value: 0 },
        { label: 'Installation', value: 0 },
      ],
      energyEstimate: [
        { label: 'Annual Cooling Cost (est.)', value: 0 },
        { label: 'Annual Heating Cost (est.)', value: 0 },
      ],
    };
  }

  // ── Multipliers ───────────────────────────────────────
  const climateMult = climateMultipliers[climate] ?? 1.0;
  const insulationMult = insulationMultipliers[insulation] ?? 1.0;
  const ceilingMult = ceilingHeight / 8;
  const storiesMult = storiesMultipliers[stories] ?? 1.0;
  const windowsMult = windowsMultipliers[windows] ?? 1.0;
  const sunMult = sunMultipliers[sunExposure] ?? 1.0;

  // ── Base BTU calculation ──────────────────────────────
  const baseBTU = squareFootage * 20;

  // ── Total BTU ─────────────────────────────────────────
  const totalBTU = Math.round(
    baseBTU * climateMult * insulationMult * ceilingMult * storiesMult * windowsMult * sunMult
  );

  // ── Tonnage ───────────────────────────────────────────
  const exactTons = parseFloat((totalBTU / 12000).toFixed(1));
  const recommendedTons = Math.round(exactTons * 2) / 2; // round to nearest 0.5

  // ── Recommended unit label ────────────────────────────
  const recommendedUnit = `${recommendedTons}-ton system`;

  // ── Cubic feet (volume) ───────────────────────────────
  const cubicFeet = Math.round(squareFootage * ceilingHeight);

  // ── CFM airflow estimate ──────────────────────────────
  const cfmAirflow = Math.round(totalBTU / 30);

  // ── Cost estimates ────────────────────────────────────
  const displayTons = recommendedTons > 0 ? recommendedTons : exactTons;
  const [acLow, acHigh] = getCentralACCost(displayTons);
  const [hpLow, hpHigh] = getHeatPumpCost(displayTons);
  const installLow = 1500;
  const installHigh = 3000;

  const costEstimate = [
    { label: `Central AC Unit ($${acLow.toLocaleString()}–$${acHigh.toLocaleString()})`, value: Math.round((acLow + acHigh) / 2) },
    { label: `Heat Pump ($${hpLow.toLocaleString()}–$${hpHigh.toLocaleString()})`, value: Math.round((hpLow + hpHigh) / 2) },
    { label: `Installation ($${installLow.toLocaleString()}–$${installHigh.toLocaleString()})`, value: Math.round((installLow + installHigh) / 2) },
  ];

  // ── Energy cost estimates ─────────────────────────────
  // Approximate: SEER 16 for cooling, HSPF 9 for heating
  // Cooling hours ~1,000/year, heating hours ~1,000/year (varies by climate)
  const electricityRate = 0.16; // national average $/kWh
  const coolingKWh = (totalBTU / 16000) * 1000; // SEER 16 × 1000 hours
  const heatingKWh = (totalBTU / (9 * 1000 / 3.412)) * 1000; // HSPF 9 conversion
  const annualCoolingCost = parseFloat((coolingKWh * electricityRate).toFixed(2));
  const annualHeatingCost = parseFloat((heatingKWh * electricityRate).toFixed(2));

  const energyEstimate = [
    { label: 'Annual Cooling Cost (est.)', value: annualCoolingCost },
    { label: 'Annual Heating Cost (est.)', value: annualHeatingCost },
  ];

  return {
    btuRequired: totalBTU,
    tons: exactTons,
    recommendedTons,
    recommendedUnit,
    cubicFeet,
    cfmAirflow,
    costEstimate,
    energyEstimate,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'hvac-size': calculateHvacSize,
};
