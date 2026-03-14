/**
 * Energy Rebate & Incentive Calculator
 *
 * Formulas:
 *   HEAR rebate = income <= 0.8×AMI ? up to $14,000 : income <= 1.5×AMI ? up to $8,000 : $0
 *   HOMES rebate = income <= 0.8×AMI ? up to $8,000 : income <= 1.5×AMI ? up to $4,000 : $0
 *   Federal tax credit (25C) = eligible amount × 30% (up to $2,000 for heat pumps)
 *   Total rebate = HEAR + HOMES + state + federal 25C
 *   Net cost = project cost - total rebate
 *
 * Source: IRA HOMES and HEAR Programs, DOE 2026; One Big Beautiful Bill Act (Public Law 119-21).
 */

const PROJECT_CAPS: Record<string, { hearMax: number; federal25C: number }> = {
  'heat-pump':     { hearMax: 8000,  federal25C: 2000 },
  'water-heater':  { hearMax: 1750,  federal25C: 2000 },
  'insulation':    { hearMax: 1600,  federal25C: 1200 },
  'windows':       { hearMax: 2500,  federal25C: 600  },
  'ev-charger':    { hearMax: 0,     federal25C: 1000 },
  'solar':         { hearMax: 0,     federal25C: 0    }, // solar uses 30% ITC, handled separately
};

export function calculateEnergyRebate(inputs: Record<string, unknown>): Record<string, unknown> {
  const projectType = String(inputs.projectType || 'heat-pump');
  const householdIncome = Math.max(0, Number(inputs.householdIncome) || 60000);
  const areaMedianIncome = Math.max(1, Number(inputs.areaMedianIncome) || 80000);
  const projectCost = Math.max(0, Number(inputs.projectCost) || 15000);
  const stateRebate = Math.max(0, Number(inputs.stateRebate) || 0);

  const incomeRatio = householdIncome / areaMedianIncome;
  const caps = PROJECT_CAPS[projectType] || PROJECT_CAPS['heat-pump'];

  // HEAR (Home Efficiency Rebates) — point-of-sale rebates
  let hearRebate = 0;
  if (incomeRatio <= 0.8) {
    hearRebate = Math.min(caps.hearMax, projectCost);
  } else if (incomeRatio <= 1.5) {
    hearRebate = Math.min(caps.hearMax * 0.5, projectCost * 0.5);
  }
  hearRebate = parseFloat(hearRebate.toFixed(2));

  // HOMES (Whole-House Rebates) — performance-based
  let homesRebate = 0;
  if (incomeRatio <= 0.8) {
    homesRebate = Math.min(8000, projectCost * 0.8);
  } else if (incomeRatio <= 1.5) {
    homesRebate = Math.min(4000, projectCost * 0.5);
  }
  homesRebate = parseFloat(homesRebate.toFixed(2));

  // Federal 25C tax credit (30% of cost, capped per project type)
  const federal25C = projectType === 'solar'
    ? parseFloat((projectCost * 0.30).toFixed(2)) // 30% ITC, no cap
    : parseFloat(Math.min(caps.federal25C, projectCost * 0.30).toFixed(2));

  const totalRebate = parseFloat((hearRebate + homesRebate + stateRebate + federal25C).toFixed(2));
  const netCost = parseFloat(Math.max(0, projectCost - totalRebate).toFixed(2));

  return {
    hearRebate,
    homesRebate,
    federal25C,
    stateRebate,
    totalRebate,
    netCost,
    incomeRatio: parseFloat(incomeRatio.toFixed(2)),
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'energy-rebate': calculateEnergyRebate,
};
