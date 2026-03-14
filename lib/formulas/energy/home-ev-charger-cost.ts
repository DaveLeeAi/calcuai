/**
 * Home EV Charger Installation Cost Calculator
 *
 * Formulas:
 *   Equipment cost = base cost by charger level
 *   Installation labor = base labor × distance factor × regional index
 *   Panel upgrade cost = needs_upgrade ? panel_cost : 0
 *   Total cost = equipment + labor + panel upgrade
 *   Annual charging cost = (annual miles / efficiency) × electricity rate
 *
 * Source: U.S. DOE Alternative Fuels Data Center — EVSE Installation Guide (2026).
 */

const CHARGER_COSTS: Record<string, { equipmentLow: number; equipmentHigh: number; laborBase: number }> = {
  'level-1':          { equipmentLow: 0,    equipmentHigh: 200,   laborBase: 0     },
  'level-2':          { equipmentLow: 300,  equipmentHigh: 700,   laborBase: 500   },
  'level-2-hardwired':{ equipmentLow: 500,  equipmentHigh: 1200,  laborBase: 800   },
};

export function calculateHomeEvChargerCost(inputs: Record<string, unknown>): Record<string, unknown> {
  const chargerLevel = String(inputs.chargerLevel || 'level-2');
  const panelUpgradeNeeded = inputs.panelUpgradeNeeded === true || inputs.panelUpgradeNeeded === 'yes';
  const outletDistance = Math.max(0, Number(inputs.outletDistance) || 20);

  const charger = CHARGER_COSTS[chargerLevel] || CHARGER_COSTS['level-2'];
  const equipmentCostMid = parseFloat(((charger.equipmentLow + charger.equipmentHigh) / 2).toFixed(2));
  const distanceFactor = 1 + Math.max(0, (outletDistance - 10)) * 0.015; // +1.5% per foot beyond 10
  const installationLabor = parseFloat((charger.laborBase * distanceFactor).toFixed(2));
  const panelUpgradeCost = panelUpgradeNeeded ? 2000 : 0;
  const totalCost = parseFloat((equipmentCostMid + installationLabor + panelUpgradeCost).toFixed(2));

  // Annual charging cost estimate
  const annualMiles = 12000;
  const evEfficiency = 3.5; // mi/kWh
  const electricityRate = 0.1724;
  const annualChargingCost = parseFloat(((annualMiles / evEfficiency) * electricityRate).toFixed(2));

  const breakdown: { label: string; value: number }[] = [
    { label: 'Equipment Cost', value: equipmentCostMid },
    { label: 'Installation Labor', value: installationLabor },
    { label: 'Panel Upgrade', value: panelUpgradeCost },
    { label: 'Total Cost', value: totalCost },
    { label: 'Est. Annual Charging Cost', value: annualChargingCost },
  ];

  return {
    equipmentCost: equipmentCostMid,
    installationLabor,
    panelUpgradeCost,
    totalCost,
    annualChargingCost,
    breakdown,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'home-ev-charger-cost': calculateHomeEvChargerCost,
};
