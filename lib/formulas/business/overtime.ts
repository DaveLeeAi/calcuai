/**
 * Overtime Calculator — Regular + Overtime Pay
 *
 * Formulas:
 *   Regular Pay = Regular Hours × Hourly Rate
 *   Overtime Pay = Overtime Hours × Hourly Rate × Overtime Multiplier
 *   Total Pay = Regular Pay + Overtime Pay
 *   Effective Hourly Rate = Total Pay / Total Hours
 *   Overtime Premium = Overtime Hours × Hourly Rate × (Overtime Multiplier − 1)
 *   Monthly Projection = Total Pay × Weeks Per Month
 *
 * FLSA Standard: Overtime multiplier is 1.5× (time-and-a-half) for hours over 40/week.
 * Source: U.S. Department of Labor, Fair Labor Standards Act (FLSA), 29 U.S.C. § 207 (2024).
 */

// ═══════════════════════════════════════════════════════
// Interfaces
// ═══════════════════════════════════════════════════════

export interface OvertimeInput {
  hourlyRate: number;
  regularHours: number;
  overtimeHours: number;
  overtimeMultiplier: number;
  weeksPerMonth: number;
}

export interface OvertimePayBreakdownSegment {
  label: string;
  value: number;
}

export interface OvertimeOutput {
  totalPay: number;
  regularPay: number;
  overtimePay: number;
  effectiveRate: number;
  monthlyProjection: number;
  overtimePremium: number;
  payBreakdown: OvertimePayBreakdownSegment[];
  summary: { label: string; value: number }[];
}

// ═══════════════════════════════════════════════════════
// Main function: Overtime Calculator
// ═══════════════════════════════════════════════════════

/**
 * Calculates regular pay, overtime pay, total pay, effective hourly rate,
 * monthly projection, and overtime premium.
 *
 * Regular Pay = regularHours × hourlyRate
 * Overtime Pay = overtimeHours × hourlyRate × overtimeMultiplier
 * Total Pay = Regular Pay + Overtime Pay
 * Effective Rate = Total Pay / (regularHours + overtimeHours)
 *
 * @param inputs - Record with hourlyRate, regularHours, overtimeHours, overtimeMultiplier, weeksPerMonth
 * @returns Record with totalPay, regularPay, overtimePay, effectiveRate, monthlyProjection, overtimePremium, payBreakdown, summary
 */
export function calculateOvertime(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs with safe defaults
  const hourlyRate = Math.max(0, Number(inputs.hourlyRate) || 0);
  const regularHours = Math.max(0, Math.min(168, Number(inputs.regularHours) || 0));
  const overtimeHours = Math.max(0, Math.min(128, Number(inputs.overtimeHours) || 0));
  const overtimeMultiplier = Math.max(1, Number(inputs.overtimeMultiplier) || 1.5);
  const weeksPerMonth = Math.max(0, Number(inputs.weeksPerMonth) || 4.33);

  // 2. Calculate regular pay
  const regularPay = Math.round(regularHours * hourlyRate * 100) / 100;

  // 3. Calculate overtime pay
  const overtimePay = Math.round(overtimeHours * hourlyRate * overtimeMultiplier * 100) / 100;

  // 4. Calculate total pay
  const totalPay = Math.round((regularPay + overtimePay) * 100) / 100;

  // 5. Calculate effective hourly rate
  const totalHours = regularHours + overtimeHours;
  const effectiveRate = totalHours > 0
    ? Math.round((totalPay / totalHours) * 100) / 100
    : 0;

  // 6. Calculate monthly projection
  const monthlyProjection = Math.round(totalPay * weeksPerMonth * 100) / 100;

  // 7. Calculate overtime premium (extra amount earned beyond regular rate for OT hours)
  const overtimePremium = Math.round(
    overtimeHours * hourlyRate * (overtimeMultiplier - 1) * 100
  ) / 100;

  // 8. Pay breakdown for pie chart
  const payBreakdown: OvertimePayBreakdownSegment[] = [
    { label: 'Regular Pay', value: regularPay },
    { label: 'Overtime Pay', value: overtimePay },
  ];

  // 9. Summary value group
  const summary: { label: string; value: number }[] = [
    { label: 'Regular Pay', value: regularPay },
    { label: 'Overtime Pay', value: overtimePay },
    { label: 'Total Weekly Pay', value: totalPay },
    { label: 'Effective Hourly Rate', value: effectiveRate },
    { label: 'Overtime Premium', value: overtimePremium },
    { label: 'Monthly Projection', value: monthlyProjection },
  ];

  return {
    totalPay,
    regularPay,
    overtimePay,
    effectiveRate,
    monthlyProjection,
    overtimePremium,
    payBreakdown,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'overtime': calculateOvertime,
};
