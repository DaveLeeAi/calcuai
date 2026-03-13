/**
 * Solar Panel Calculator
 *
 * Calculates the number of solar panels, system size, cost estimates,
 * and payback period based on monthly electricity bill and local conditions.
 *
 * Formulas:
 *   monthlyKWh = monthlyBill / electricityRate
 *   annualKWh = monthlyKWh × 12
 *   targetKWh = annualKWh × (electricityOffset / 100)
 *   dailyKWh = targetKWh / 365
 *   systemSizeKW = dailyKWh / sunHours / (systemEfficiency / 100)
 *   numberOfPanels = ⌈systemSizeKW × 1000 / panelWattage⌉
 *   systemSizeActual = numberOfPanels × panelWattage / 1000
 *   annualProduction = systemSizeActual × sunHours × 365 × (systemEfficiency / 100)
 *   costEstimate = systemSizeActual × 1000 × costPerWatt
 *   federalCredit = systemCost × 0.30
 *   netCost = systemCost - federalCredit
 *   annualSavings = min(annualProduction, annualKWh) × electricityRate
 *   paybackYears = netCost / annualSavings
 *   twentyFiveYearSavings = annualSavings × 25 - netCost
 *
 * Source: Solar Energy Industries Association (SEIA), National Renewable
 *         Energy Laboratory (NREL), EnergySage marketplace data, and
 *         IRS Investment Tax Credit (IRC §48) — 30% through 2032.
 */

// ═══════════════════════════════════════════════════════
// Interfaces
// ═══════════════════════════════════════════════════════

export interface SolarPanelOutput {
  numberOfPanels: number;
  systemSizeKW: number;
  annualProduction: number;
  monthlyUsage: number;
  annualSavings: number;
  paybackYears: number;
  federalTaxCredit: number;
  costEstimate: { label: string; value: number }[];
  twentyFiveYearSavings: { label: string; value: number }[];
}

// ═══════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════

const COST_PER_WATT_LOW = 2.50;
const COST_PER_WATT_HIGH = 3.50;
const FEDERAL_ITC_RATE = 0.30;
const SYSTEM_LIFESPAN_YEARS = 25;

// ═══════════════════════════════════════════════════════
// Main function: Solar Panel Calculator
// ═══════════════════════════════════════════════════════

/**
 * Calculates solar panel system sizing, cost, and payback period.
 *
 * systemSizeKW = (monthlyBill / rate × 12 × offset%) / (365 × sunHours × efficiency%)
 * panels = ⌈systemSizeKW × 1000 / panelWattage⌉
 *
 * @param inputs - Record with monthlyBill, electricityRate, sunHours, panelWattage, systemEfficiency, electricityOffset
 * @returns Record with panel count, system size, cost estimates, payback, and savings
 */
export function calculateSolarPanel(inputs: Record<string, unknown>): Record<string, unknown> {
  const monthlyBill = Math.max(0, Number(inputs.monthlyBill) || 0);
  const electricityRate = Math.max(0.01, Number(inputs.electricityRate) || 0.15);
  const sunHours = Math.max(1, Math.min(8, Number(inputs.sunHours) || 5));
  const panelWattage = Math.max(200, Math.min(600, Number(inputs.panelWattage) || 400));
  const systemEfficiency = Math.max(50, Math.min(95, Number(inputs.systemEfficiency) || 80));
  const electricityOffset = Math.max(50, Math.min(100, Number(inputs.electricityOffset) || 100));

  // ── Energy usage ──────────────────────────────────────
  const monthlyKWh = parseFloat((monthlyBill / electricityRate).toFixed(2));
  const annualKWh = parseFloat((monthlyKWh * 12).toFixed(2));
  const targetKWh = parseFloat((annualKWh * (electricityOffset / 100)).toFixed(2));

  // ── Guard: zero bill ──────────────────────────────────
  if (monthlyBill <= 0) {
    return {
      numberOfPanels: 0,
      systemSizeKW: 0,
      annualProduction: 0,
      monthlyUsage: 0,
      annualSavings: 0,
      paybackYears: 0,
      federalTaxCredit: 0,
      costEstimate: [
        { label: 'System Cost (Low $2.50/W)', value: 0 },
        { label: 'System Cost (High $3.50/W)', value: 0 },
        { label: 'Federal Tax Credit (30%)', value: 0 },
        { label: 'Net Cost (Low)', value: 0 },
        { label: 'Net Cost (High)', value: 0 },
      ],
      twentyFiveYearSavings: [
        { label: 'Total Energy Savings', value: 0 },
        { label: 'Net Profit (Low)', value: 0 },
        { label: 'Net Profit (High)', value: 0 },
      ],
    };
  }

  // ── System sizing ─────────────────────────────────────
  const dailyKWhNeeded = targetKWh / 365;
  const efficiencyFactor = systemEfficiency / 100;
  const systemSizeKW = parseFloat((dailyKWhNeeded / sunHours / efficiencyFactor).toFixed(2));

  // ── Panel count (rounded up) ──────────────────────────
  const numberOfPanels = Math.ceil(systemSizeKW * 1000 / panelWattage);

  // ── Actual system size based on whole panels ──────────
  const systemSizeActual = parseFloat((numberOfPanels * panelWattage / 1000).toFixed(2));

  // ── Annual production ─────────────────────────────────
  const annualProduction = parseFloat(
    (systemSizeActual * sunHours * 365 * efficiencyFactor).toFixed(2)
  );

  // ── Cost estimates ────────────────────────────────────
  const systemWatts = systemSizeActual * 1000;
  const costLow = parseFloat((systemWatts * COST_PER_WATT_LOW).toFixed(2));
  const costHigh = parseFloat((systemWatts * COST_PER_WATT_HIGH).toFixed(2));

  // ── Federal tax credit (30% ITC) ──────────────────────
  const federalCreditLow = parseFloat((costLow * FEDERAL_ITC_RATE).toFixed(2));
  const federalCreditHigh = parseFloat((costHigh * FEDERAL_ITC_RATE).toFixed(2));

  // ── Net cost ──────────────────────────────────────────
  const netCostLow = parseFloat((costLow - federalCreditLow).toFixed(2));
  const netCostHigh = parseFloat((costHigh - federalCreditHigh).toFixed(2));

  // Use midpoint for federal credit display and payback
  const federalTaxCredit = parseFloat(((federalCreditLow + federalCreditHigh) / 2).toFixed(2));

  // ── Annual savings ────────────────────────────────────
  const effectiveProduction = Math.min(annualProduction, annualKWh);
  const annualSavings = parseFloat((effectiveProduction * electricityRate).toFixed(2));

  // ── Payback period (use midpoint net cost) ────────────
  const netCostMid = (netCostLow + netCostHigh) / 2;
  const paybackYears = annualSavings > 0
    ? parseFloat((netCostMid / annualSavings).toFixed(1))
    : 0;

  // ── 25-year savings ───────────────────────────────────
  const totalEnergySavings = parseFloat((annualSavings * SYSTEM_LIFESPAN_YEARS).toFixed(2));
  const netProfitLow = parseFloat((totalEnergySavings - netCostHigh).toFixed(2));
  const netProfitHigh = parseFloat((totalEnergySavings - netCostLow).toFixed(2));

  // ── Cost estimate value group ─────────────────────────
  const costEstimate = [
    { label: 'System Cost (Low $2.50/W)', value: costLow },
    { label: 'System Cost (High $3.50/W)', value: costHigh },
    { label: 'Federal Tax Credit (30%)', value: federalTaxCredit },
    { label: 'Net Cost (Low)', value: netCostLow },
    { label: 'Net Cost (High)', value: netCostHigh },
  ];

  // ── 25-year savings value group ───────────────────────
  const twentyFiveYearSavings = [
    { label: 'Total Energy Savings', value: totalEnergySavings },
    { label: 'Net Profit (Low)', value: netProfitLow },
    { label: 'Net Profit (High)', value: netProfitHigh },
  ];

  return {
    numberOfPanels,
    systemSizeKW: systemSizeActual,
    annualProduction,
    monthlyUsage: monthlyKWh,
    annualSavings,
    paybackYears,
    federalTaxCredit,
    costEstimate,
    twentyFiveYearSavings,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'solar-panel': calculateSolarPanel,
};
