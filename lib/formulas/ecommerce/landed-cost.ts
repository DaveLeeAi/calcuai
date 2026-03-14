/**
 * Landed Cost Calculator
 *
 * Formula:
 *   Total Landed Cost = (FOB Cost × Units) + Freight + Insurance + Duty + Broker Fee + Inland Freight + Other Fees
 *   Import Duty = FOB Value × Duty Rate%
 *   Landed Cost per Unit = Total Landed Cost / Units
 *   Landed Cost Markup = (Landed Cost per Unit / FOB per Unit − 1) × 100
 *
 * Source: US Customs and Border Protection — Harmonized Tariff Schedule (2026).
 * Source: Flexport — Landed Cost Guide (2025).
 * Source: Incoterms 2020 — ICC Publication No. 723.
 */

// ─────────────────────────────────────────────
// Interfaces
// ─────────────────────────────────────────────

export interface CostBreakdownRow {
  item: string;
  total: number;
  perUnit: number;
  pctOfLanded: number;
}

export interface LandedCostOutput {
  landedCostPerUnit: number;
  landedCostMarkupPct: number;
  totalDutyPaid: number;
  costBreakdownTable: CostBreakdownRow[];
  summary: { label: string; value: number }[];
}

// ─────────────────────────────────────────────
// Main function
// ─────────────────────────────────────────────

/**
 * Calculates the fully landed cost per unit for an imported shipment.
 *
 * Landed Cost = FOB Value + Freight + Insurance + Import Duty + Broker Fee + Inland Freight + Other
 * Duty = FOB Value × (Duty Rate / 100)
 * Landed Cost per Unit = Total Landed Cost / Units in Shipment
 *
 * @param inputs - Record with fobCostPerUnit, unitsPerShipment, totalFreightCost, freightInsurance,
 *                 importDutyRate, customsBrokerFee, inlandFreight, otherFees
 * @returns Record with landedCostPerUnit, landedCostMarkupPct, totalDutyPaid, costBreakdownTable, summary
 */
export function calculateLandedCost(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs
  const fobPerUnit = Math.max(0.01, Number(inputs.fobCostPerUnit) || 0);
  const units = Math.max(1, Number(inputs.unitsPerShipment) || 1);
  const freight = Math.max(0, Number(inputs.totalFreightCost) || 0);
  const insurance = Math.max(0, Number(inputs.freightInsurance) || 0);
  const dutyRate = Math.max(0, Number(inputs.importDutyRate) || 0);
  const brokerFee = Math.max(0, Number(inputs.customsBrokerFee) || 0);
  const inlandFreight = Math.max(0, Number(inputs.inlandFreight) || 0);
  const otherFees = Math.max(0, Number(inputs.otherFees) || 0);

  // 2. Calculate totals
  const fobTotal = fobPerUnit * units;
  const dutyTotal = Math.round(fobTotal * (dutyRate / 100) * 100) / 100;
  const totalLandedCost = fobTotal + freight + insurance + dutyTotal + brokerFee + inlandFreight + otherFees;
  const landedCostPerUnit = Math.round((totalLandedCost / units) * 100) / 100;

  // 3. Markup vs FOB
  const landedCostMarkupPct = fobPerUnit > 0
    ? Math.round(((landedCostPerUnit / fobPerUnit) - 1) * 10000) / 100
    : 0;

  // 4. Helper: per-unit + pct of landed
  const row = (item: string, total: number): CostBreakdownRow => ({
    item,
    total: Math.round(total * 100) / 100,
    perUnit: Math.round((total / units) * 100) / 100,
    pctOfLanded: totalLandedCost > 0 ? Math.round((total / totalLandedCost) * 10000) / 100 : 0,
  });

  // 5. Cost breakdown table
  const costBreakdownTable: CostBreakdownRow[] = [
    row('FOB Product Cost', fobTotal),
    row('Ocean/Air Freight', freight),
    row('Freight Insurance', insurance),
    row(`Import Duty (${dutyRate}%)`, dutyTotal),
    row('Customs Broker Fee', brokerFee),
    row('Inland Freight / Drayage', inlandFreight),
    row('Other Fees', otherFees),
  ];

  // 6. Summary
  const summary: { label: string; value: number }[] = [
    { label: 'FOB Cost per Unit', value: Math.round(fobPerUnit * 100) / 100 },
    { label: 'Total Duty Paid', value: dutyTotal },
    { label: 'Total Landed Cost', value: Math.round(totalLandedCost * 100) / 100 },
    { label: 'Landed Cost per Unit', value: landedCostPerUnit },
    { label: 'Landed vs. FOB Markup', value: landedCostMarkupPct },
    { label: 'Units in Shipment', value: units },
  ];

  return {
    landedCostPerUnit,
    landedCostMarkupPct,
    totalDutyPaid: dutyTotal,
    costBreakdownTable,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'landed-cost': calculateLandedCost,
};
