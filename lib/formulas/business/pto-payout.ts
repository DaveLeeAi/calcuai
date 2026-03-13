/**
 * PTO Payout Calculator — Calculate the Value of Accrued PTO Hours
 *
 * Formulas:
 *   Total Hours = Accrued Hours + (Accrued Days × Hours per Day)
 *   Total Days = Total Hours / Hours per Day
 *   Gross Payout = Total Hours × Hourly Rate × (Payout Percent / 100)
 *   Tax Withholding = Gross Payout × (Tax Rate / 100)
 *   Net Payout = Gross Payout - Tax Withholding
 *   Daily Value = Hourly Rate × Hours per Day
 *   Weekly Value = Daily Value × 5
 *   Total Weeks Off = Total Days / 5
 *
 * Source: Bureau of Labor Statistics — Employee Benefits Survey;
 *         DOL Wage and Hour Division
 */

// ═══════════════════════════════════════════════════════
// Interfaces
// ═══════════════════════════════════════════════════════

export interface PtoPayoutInput {
  hourlyRate: number;
  accruedHours: number;
  accruedDays: number;
  hoursPerDay: number;
  taxRate: number;
  ptoPolicy: string;
  payoutPercent: number;
}

export interface PtoPayoutOutput {
  totalHours: number;
  totalDays: number;
  grossPayout: number;
  taxWithholding: number;
  netPayout: number;
  dailyValue: number;
  weeklyValue: number;
  totalWeeksOff: number;
  payoutBreakdown: { label: string; value: number }[];
}

// ═══════════════════════════════════════════════════════
// Main function: PTO Payout Calculator
// ═══════════════════════════════════════════════════════

/**
 * Calculates the monetary value of accrued PTO hours including
 * gross payout, estimated tax withholding, and net payout.
 *
 * Gross Payout = totalHours × hourlyRate × (payoutPercent / 100)
 * Net Payout = Gross Payout − Tax Withholding
 *
 * If ptoPolicy is "use-it-or-lose-it", gross and net payout are 0.
 *
 * @param inputs - Record with hourlyRate, accruedHours, accruedDays, hoursPerDay, taxRate, ptoPolicy, payoutPercent
 * @returns Record with totalHours, totalDays, grossPayout, taxWithholding, netPayout, dailyValue, weeklyValue, totalWeeksOff, payoutBreakdown
 */
export function calculatePtoPayout(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs with safe defaults
  const hourlyRate = Math.max(0, Number(inputs.hourlyRate) || 0);
  const accruedHours = Math.max(0, Math.min(500, Number(inputs.accruedHours) || 0));
  const accruedDays = Math.max(0, Math.min(60, Number(inputs.accruedDays) || 0));
  const hoursPerDay = Math.max(4, Math.min(12, Number(inputs.hoursPerDay) || 8));
  const taxRate = Math.max(0, Math.min(50, Number(inputs.taxRate) || 0));
  const ptoPolicy = String(inputs.ptoPolicy || 'full-payout');
  const payoutPercent = Math.max(0, Math.min(100, Number(inputs.payoutPercent) || 100));

  // 2. Calculate total hours and days
  const totalHours = Math.round((accruedHours + accruedDays * hoursPerDay) * 100) / 100;
  const totalDays = hoursPerDay > 0
    ? Math.round((totalHours / hoursPerDay) * 10) / 10
    : 0;

  // 3. Calculate daily and weekly value (always shown regardless of policy)
  const dailyValue = Math.round(hourlyRate * hoursPerDay * 100) / 100;
  const weeklyValue = Math.round(dailyValue * 5 * 100) / 100;

  // 4. Calculate total weeks off equivalent
  const totalWeeksOff = Math.round((totalDays / 5) * 10) / 10;

  // 5. Calculate payout based on policy
  let grossPayout: number;
  if (ptoPolicy === 'use-it-or-lose-it') {
    grossPayout = 0;
  } else {
    const effectivePercent = ptoPolicy === 'partial-payout' ? payoutPercent : 100;
    grossPayout = Math.round(totalHours * hourlyRate * (effectivePercent / 100) * 100) / 100;
  }

  // 6. Calculate tax withholding and net payout
  const taxWithholding = Math.round(grossPayout * (taxRate / 100) * 100) / 100;
  const netPayout = Math.round((grossPayout - taxWithholding) * 100) / 100;

  // 7. Payout breakdown value group
  const payoutBreakdown: { label: string; value: number }[] = [
    { label: 'Gross PTO Payout', value: grossPayout },
    { label: 'Tax Withholding', value: taxWithholding },
    { label: 'Net Payout', value: netPayout },
  ];

  return {
    totalHours,
    totalDays,
    grossPayout,
    taxWithholding,
    netPayout,
    dailyValue,
    weeklyValue,
    totalWeeksOff,
    payoutBreakdown,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'pto-payout': calculatePtoPayout,
};
