/**
 * Water Heater Cost Calculator (Energy/Operating Cost Focus)
 *
 * Formulas:
 *   Annual energy (BTU) = gallons/day × 8.34 lbs/gal × temp rise × 365
 *   Annual kWh (electric) = BTU / (3412 × efficiency)
 *   Annual therms (gas) = BTU / (100000 × efficiency)
 *   Annual cost = kWh × elec rate  OR  therms × gas rate
 *   10-yr total = (annual energy cost × 10) + unit cost + installation
 *
 * Source: U.S. DOE — Energy Saver Water Heater Guide (2025); ENERGY STAR Water Heater Calculator.
 */

const HEATER_EFFICIENCY: Record<string, { efficiency: number; fuelType: 'electric' | 'gas' }> = {
  'electric-resistance': { efficiency: 0.92, fuelType: 'electric' },
  'gas':                 { efficiency: 0.60, fuelType: 'gas'      },
  'heat-pump':           { efficiency: 3.50, fuelType: 'electric' }, // COP 3.5
  'solar':               { efficiency: 2.00, fuelType: 'electric' }, // effective COP
};

export function calculateWaterHeaterCost(inputs: Record<string, unknown>): Record<string, unknown> {
  const heaterType = String(inputs.heaterType || 'electric-resistance');
  const hotWaterUsage = Math.max(1, Number(inputs.hotWaterUsage) || 64);
  const electricityRate = Math.max(0, Number(inputs.electricityRate) || 0.1724);
  const gasRate = Math.max(0, Number(inputs.gasRate) || 1.50);
  const unitCost = Math.max(0, Number(inputs.unitCost) || 1200);
  const installationCost = Math.max(0, Number(inputs.installationCost) || 800);
  const lifespan = Math.max(1, Number(inputs.lifespan) || 12);

  const tempRise = 70; // degrees F (cold 50°F to hot 120°F)
  const annualBtu = hotWaterUsage * 8.34 * tempRise * 365;
  const heater = HEATER_EFFICIENCY[heaterType] || HEATER_EFFICIENCY['electric-resistance'];

  let annualEnergyCost: number;
  if (heater.fuelType === 'electric') {
    const annualKwh = annualBtu / (3412 * heater.efficiency);
    annualEnergyCost = parseFloat((annualKwh * electricityRate).toFixed(2));
  } else {
    const annualTherms = annualBtu / (100000 * heater.efficiency);
    annualEnergyCost = parseFloat((annualTherms * gasRate).toFixed(2));
  }

  const tenYearTotal = parseFloat((annualEnergyCost * 10 + unitCost + installationCost).toFixed(2));
  const lifetimeTotal = parseFloat((annualEnergyCost * lifespan + unitCost + installationCost).toFixed(2));

  // Compare to electric resistance baseline
  const baselineKwh = annualBtu / (3412 * 0.92);
  const baselineCost = parseFloat((baselineKwh * electricityRate).toFixed(2));
  const annualSavingsVsResistance = parseFloat((baselineCost - annualEnergyCost).toFixed(2));

  const breakdown: { label: string; value: number }[] = [
    { label: 'Annual Energy Cost', value: annualEnergyCost },
    { label: 'Unit Cost', value: unitCost },
    { label: 'Installation Cost', value: installationCost },
    { label: '10-Year Total Cost', value: tenYearTotal },
    { label: 'Annual Savings vs Electric Resistance', value: annualSavingsVsResistance },
  ];

  return {
    annualEnergyCost,
    tenYearTotal,
    lifetimeTotal,
    annualSavingsVsResistance,
    breakdown,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'water-heater-energy-cost': calculateWaterHeaterCost,
};
