/**
 * Home Energy Audit ROI Calculator
 *
 * Estimates combined savings from multiple energy improvement categories
 * identified in a professional energy audit.
 *
 * Formula: Total savings = sum of (improvement_savings × applicable_flag)
 *          Payback = (audit_cost + improvement_costs) / annual_savings
 *
 * Source: U.S. DOE — Home Energy Audits (2025);
 *         ENERGY STAR — Home Performance Contractors (2024).
 */

const IMPROVEMENT_SAVINGS_PCT: Record<string, { label: string; savingsPct: number; avgCost: number }> = {
  'air-sealing':     { label: 'Air Sealing',          savingsPct: 0.15, avgCost: 400   },
  insulation:        { label: 'Attic Insulation',      savingsPct: 0.15, avgCost: 2000  },
  'duct-sealing':    { label: 'Duct Sealing',          savingsPct: 0.10, avgCost: 500   },
  'hvac-tuneup':     { label: 'HVAC Tune-Up',          savingsPct: 0.05, avgCost: 150   },
  'water-heater':    { label: 'Water Heater Upgrade',   savingsPct: 0.08, avgCost: 1500  },
  windows:           { label: 'Window Upgrades',        savingsPct: 0.08, avgCost: 5000  },
  'smart-thermostat':{ label: 'Smart Thermostat',       savingsPct: 0.10, avgCost: 250   },
  lighting:          { label: 'LED Lighting',           savingsPct: 0.05, avgCost: 200   },
};

export function calculateEnergyAuditRoi(inputs: Record<string, unknown>): Record<string, unknown> {
  const num = (v: unknown, d: number) => v !== undefined && v !== null && v !== '' ? Number(v) : d;
  const annualEnergyBill = Math.max(0, num(inputs.annualEnergyBill, 2400));
  const auditCost = Math.max(0, num(inputs.auditCost, 400));

  // Parse selected improvements
  let selected: string[] = [];
  if (Array.isArray(inputs.improvements)) {
    selected = inputs.improvements.map(String);
  } else if (typeof inputs.improvements === 'string' && inputs.improvements) {
    selected = inputs.improvements.split(',').map((s: string) => s.trim());
  } else {
    selected = ['air-sealing', 'insulation', 'duct-sealing', 'hvac-tuneup', 'smart-thermostat', 'lighting'];
  }

  // Diminishing returns: combined savings can't exceed 50% of bill
  let totalSavingsPct = 0;
  let totalImprovementCost = 0;
  const breakdown = selected
    .filter(id => IMPROVEMENT_SAVINGS_PCT[id])
    .map(id => {
      const imp = IMPROVEMENT_SAVINGS_PCT[id];
      totalSavingsPct += imp.savingsPct;
      totalImprovementCost += imp.avgCost;
      const savings = parseFloat((annualEnergyBill * imp.savingsPct).toFixed(2));
      return { id, label: imp.label, savingsPct: imp.savingsPct * 100, estimatedCost: imp.avgCost, annualSavings: savings };
    });

  // Cap at 50% — diminishing returns
  const effectiveSavingsPct = Math.min(totalSavingsPct, 0.50);
  const annualSavings = parseFloat((annualEnergyBill * effectiveSavingsPct).toFixed(2));
  const totalCost = parseFloat((auditCost + totalImprovementCost).toFixed(2));
  const paybackYears = annualSavings > 0
    ? parseFloat((totalCost / annualSavings).toFixed(1))
    : -1;
  const tenYearNet = parseFloat((annualSavings * 10 - totalCost).toFixed(2));
  const twentyYearNet = parseFloat((annualSavings * 20 - totalCost).toFixed(2));

  return {
    annualSavings,
    totalImprovementCost: parseFloat(totalImprovementCost.toFixed(2)),
    totalCost,
    paybackYears,
    tenYearNet,
    twentyYearNet,
    effectiveSavingsPct: parseFloat((effectiveSavingsPct * 100).toFixed(1)),
    breakdown,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'energy-audit-roi': calculateEnergyAuditRoi,
};
