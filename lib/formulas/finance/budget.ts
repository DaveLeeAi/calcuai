/**
 * Budget Calculator — 50/30/20, 60/20/20, 70/20/10, and custom budget allocation
 *
 * Formulas:
 *   Needs Amount = Monthly Income × (Needs% / 100)
 *   Wants Amount = Monthly Income × (Wants% / 100)
 *   Savings Amount = Monthly Income × (Savings% / 100)
 *   Annual = Monthly × 12
 *
 * Source: Elizabeth Warren & Amelia Warren Tyagi, All Your Worth (2005) — 50/30/20 budgeting rule
 */

// ═══════════════════════════════════════════════════════
// Preset budget methods
// ═══════════════════════════════════════════════════════

const BUDGET_METHODS: Record<string, { needs: number; wants: number; savings: number }> = {
  '50-30-20': { needs: 50, wants: 30, savings: 20 },
  '60-20-20': { needs: 60, wants: 20, savings: 20 },
  '70-20-10': { needs: 70, wants: 20, savings: 10 },
};

// ═══════════════════════════════════════════════════════
// Helper
// ═══════════════════════════════════════════════════════

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ═══════════════════════════════════════════════════════
// Main function: Budget Calculator
// ═══════════════════════════════════════════════════════

/**
 * Calculates monthly and annual budget allocations using preset or custom
 * percentage splits for needs, wants, and savings/debt repayment.
 *
 * Needs = monthlyIncome × (needsPct / 100)
 * Wants = monthlyIncome × (wantsPct / 100)
 * Savings = monthlyIncome × (savingsPct / 100)
 *
 * @param inputs - Record with monthlyIncome, budgetMethod, customNeeds, customWants, customSavings
 * @returns Record with monthly/annual allocations, summary, and pie chart data
 */
export function calculateBudget(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs
  const monthlyIncome = Math.max(0, Number(inputs.monthlyIncome) || 0);
  const budgetMethod = String(inputs.budgetMethod || '50-30-20');

  // 2. Determine percentages
  let needsPct: number;
  let wantsPct: number;
  let savingsPct: number;

  if (budgetMethod === 'custom') {
    needsPct = Math.max(0, Math.min(100, Number(inputs.customNeeds) || 0));
    wantsPct = Math.max(0, Math.min(100, Number(inputs.customWants) || 0));
    savingsPct = Math.max(0, Math.min(100, Number(inputs.customSavings) || 0));
  } else {
    const preset = BUDGET_METHODS[budgetMethod] || BUDGET_METHODS['50-30-20'];
    needsPct = preset.needs;
    wantsPct = preset.wants;
    savingsPct = preset.savings;
  }

  // 3. Calculate monthly allocations
  const needsAmount = round2(monthlyIncome * (needsPct / 100));
  const wantsAmount = round2(monthlyIncome * (wantsPct / 100));
  const savingsAmount = round2(monthlyIncome * (savingsPct / 100));
  const totalAllocated = round2(needsAmount + wantsAmount + savingsAmount);
  const unallocated = round2(monthlyIncome - totalAllocated);

  // 4. Calculate annual allocations
  const annualNeeds = round2(needsAmount * 12);
  const annualWants = round2(wantsAmount * 12);
  const annualSavings = round2(savingsAmount * 12);
  const annualTotal = round2(totalAllocated * 12);

  // 5. Build pie chart data
  const budgetBreakdown: { name: string; value: number }[] = [
    { name: 'Needs', value: needsAmount },
    { name: 'Wants', value: wantsAmount },
    { name: 'Savings', value: savingsAmount },
  ];
  if (unallocated > 0.01) {
    budgetBreakdown.push({ name: 'Unallocated', value: unallocated });
  }

  // 6. Build summary value group
  const summary: { label: string; value: number; format?: string }[] = [
    { label: 'Monthly Income', value: monthlyIncome, format: 'currency' },
    { label: 'Needs (Monthly)', value: needsAmount, format: 'currency' },
    { label: 'Wants (Monthly)', value: wantsAmount, format: 'currency' },
    { label: 'Savings (Monthly)', value: savingsAmount, format: 'currency' },
    { label: 'Needs (Annual)', value: annualNeeds, format: 'currency' },
    { label: 'Wants (Annual)', value: annualWants, format: 'currency' },
    { label: 'Savings (Annual)', value: annualSavings, format: 'currency' },
    { label: 'Total Allocated (Annual)', value: annualTotal, format: 'currency' },
  ];

  if (unallocated > 0.01) {
    summary.push({ label: 'Unallocated (Monthly)', value: unallocated, format: 'currency' });
  }

  return {
    needsAmount,
    wantsAmount,
    savingsAmount,
    totalAllocated,
    unallocated,
    annualNeeds,
    annualWants,
    annualSavings,
    annualTotal,
    needsPct,
    wantsPct,
    savingsPct,
    budgetBreakdown,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'budget': calculateBudget,
};
