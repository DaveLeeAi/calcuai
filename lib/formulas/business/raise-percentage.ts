/**
 * Raise Calculator — Salary Raise Percentage and Pay Breakdown
 *
 * Formulas:
 *   Annual Salary (from any frequency):
 *     monthly × 12, biweekly × 26, weekly × 52, hourly × 2080
 *
 *   New Salary = Current Annual Salary × (1 + Raise Percentage / 100)
 *   Raise Amount = New Salary − Current Annual Salary
 *
 *   Pay Period Breakdowns:
 *     Monthly  = Annual / 12
 *     Biweekly = Annual / 26
 *     Weekly   = Annual / 52
 *     Hourly   = Annual / 2080
 *
 * Source: Bureau of Labor Statistics — Employment Cost Index (2024).
 */

// ═══════════════════════════════════════════════════════
// Interfaces
// ═══════════════════════════════════════════════════════

export interface RaiseInput {
  currentSalary: number;
  raisePercentage: number;
  payFrequency: string;
}

export interface RaiseOutput {
  newSalary: number;
  raiseAmount: number;
  newMonthly: number;
  newBiweekly: number;
  newWeekly: number;
  newHourly: number;
  oldMonthly: number;
  oldBiweekly: number;
  oldWeekly: number;
  oldHourly: number;
  monthlyDifference: number;
  biweeklyDifference: number;
  summary: { label: string; value: number }[];
}

// ═══════════════════════════════════════════════════════
// Main function: Raise Calculator
// ═══════════════════════════════════════════════════════

/**
 * Calculates new salary after a raise, with breakdowns by pay period.
 *
 * New Salary = Current Annual × (1 + raisePercentage / 100)
 * Raise Amount = New Salary − Current Annual
 *
 * If payFrequency is not annual, converts the input salary to annual first:
 *   monthly × 12, biweekly × 26, weekly × 52, hourly × 2080
 *
 * @param inputs - Record with currentSalary, raisePercentage, payFrequency
 * @returns Record with newSalary, raiseAmount, all period breakdowns, differences, summary
 */
export function calculateRaisePercentage(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs with safe defaults
  const rawSalary = Math.max(0, Number(inputs.currentSalary) || 0);
  const raisePercentage = Math.max(0, Math.min(200, Number(inputs.raisePercentage) || 0));
  const payFrequency = String(inputs.payFrequency || 'annual');

  // 2. Convert input salary to annual based on pay frequency
  let currentAnnual: number;
  switch (payFrequency) {
    case 'monthly':
      currentAnnual = rawSalary * 12;
      break;
    case 'biweekly':
      currentAnnual = rawSalary * 26;
      break;
    case 'weekly':
      currentAnnual = rawSalary * 52;
      break;
    case 'hourly':
      currentAnnual = rawSalary * 2080;
      break;
    default: // 'annual'
      currentAnnual = rawSalary;
      break;
  }

  currentAnnual = Math.round(currentAnnual * 100) / 100;

  // 3. Calculate new salary and raise amount
  const newSalary = Math.round(currentAnnual * (1 + raisePercentage / 100) * 100) / 100;
  const raiseAmount = Math.round((newSalary - currentAnnual) * 100) / 100;

  // 4. Calculate old pay period breakdowns
  const oldMonthly = Math.round((currentAnnual / 12) * 100) / 100;
  const oldBiweekly = Math.round((currentAnnual / 26) * 100) / 100;
  const oldWeekly = Math.round((currentAnnual / 52) * 100) / 100;
  const oldHourly = Math.round((currentAnnual / 2080) * 100) / 100;

  // 5. Calculate new pay period breakdowns
  const newMonthly = Math.round((newSalary / 12) * 100) / 100;
  const newBiweekly = Math.round((newSalary / 26) * 100) / 100;
  const newWeekly = Math.round((newSalary / 52) * 100) / 100;
  const newHourly = Math.round((newSalary / 2080) * 100) / 100;

  // 6. Calculate differences
  const monthlyDifference = Math.round((newMonthly - oldMonthly) * 100) / 100;
  const biweeklyDifference = Math.round((newBiweekly - oldBiweekly) * 100) / 100;

  // 7. Summary value group
  const summary: { label: string; value: number }[] = [
    { label: 'New Annual Salary', value: newSalary },
    { label: 'Raise Amount', value: raiseAmount },
    { label: 'New Monthly Pay', value: newMonthly },
    { label: 'New Biweekly Pay', value: newBiweekly },
    { label: 'New Weekly Pay', value: newWeekly },
    { label: 'New Hourly Rate', value: newHourly },
    { label: 'Monthly Increase', value: monthlyDifference },
    { label: 'Biweekly Increase', value: biweeklyDifference },
  ];

  return {
    newSalary,
    raiseAmount,
    newMonthly,
    newBiweekly,
    newWeekly,
    newHourly,
    oldMonthly,
    oldBiweekly,
    oldWeekly,
    oldHourly,
    monthlyDifference,
    biweeklyDifference,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'raise-percentage': calculateRaisePercentage,
};
