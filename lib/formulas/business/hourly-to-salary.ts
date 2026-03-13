/**
 * Hourly to Salary Calculator — Convert Hourly Wage to Annual Salary
 *
 * Formulas:
 *   Annual Salary = Hourly Rate × Hours/Week × Weeks/Year
 *   Overtime Pay = Hourly Rate × Overtime Multiplier × Overtime Hours × Weeks/Year
 *   Total Compensation = Annual Salary + Overtime Pay
 *   Monthly Pay = Annual Salary / 12
 *   Biweekly Pay = Annual Salary / 26
 *   Weekly Pay = Annual Salary / 52
 *   Daily Pay = Annual Salary / (Weeks/Year × 5)
 *   Effective Hourly Rate = Total Compensation / ((Hours/Week + Overtime Hours) × Weeks/Year)
 *
 * Source: Bureau of Labor Statistics — Standard Work Week and Overtime Provisions
 *         (Fair Labor Standards Act, 29 U.S.C. § 207)
 */

// ═══════════════════════════════════════════════════════
// Interfaces
// ═══════════════════════════════════════════════════════

export interface HourlyToSalaryInput {
  hourlyRate: number;
  hoursPerWeek: number;
  weeksPerYear: number;
  overtimeHours: number;
  overtimeMultiplier: string;
}

export interface HourlyToSalaryOutput {
  annualSalary: number;
  monthlyPay: number;
  biweeklyPay: number;
  weeklyPay: number;
  dailyPay: number;
  overtimePay: number;
  totalWithOvertime: number;
  effectiveHourlyRate: number;
  summary: { label: string; value: number }[];
}

// ═══════════════════════════════════════════════════════
// Main function: Hourly to Salary Calculator
// ═══════════════════════════════════════════════════════

/**
 * Converts an hourly wage to annual salary with optional overtime calculation.
 * Produces breakdowns by month, biweekly, weekly, and daily pay periods.
 *
 * Annual Salary = hourlyRate × hoursPerWeek × weeksPerYear
 * Overtime Pay = hourlyRate × overtimeMultiplier × overtimeHours × weeksPerYear
 * Total = Annual Salary + Overtime Pay
 *
 * @param inputs - Record with hourlyRate, hoursPerWeek, weeksPerYear, overtimeHours, overtimeMultiplier
 * @returns Record with annualSalary, monthlyPay, biweeklyPay, weeklyPay, dailyPay, overtimePay, totalWithOvertime, effectiveHourlyRate, summary
 */
export function calculateHourlyToSalary(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs with safe defaults
  const hourlyRate = Math.max(0, Number(inputs.hourlyRate) || 0);
  const hoursPerWeek = Math.max(0, Math.min(168, Number(inputs.hoursPerWeek) || 0));
  const weeksPerYear = Math.max(0, Math.min(52, Number(inputs.weeksPerYear) || 0));
  const overtimeHours = Math.max(0, Math.min(80, Number(inputs.overtimeHours) || 0));
  const overtimeMultiplier = Math.max(1, Number(inputs.overtimeMultiplier) || 1.5);

  // 2. Calculate base annual salary
  const annualSalary = Math.round(hourlyRate * hoursPerWeek * weeksPerYear * 100) / 100;

  // 3. Calculate overtime pay
  const overtimePay = Math.round(hourlyRate * overtimeMultiplier * overtimeHours * weeksPerYear * 100) / 100;

  // 4. Calculate total compensation
  const totalWithOvertime = Math.round((annualSalary + overtimePay) * 100) / 100;

  // 5. Calculate pay period breakdowns (based on base annual salary, not including overtime)
  const monthlyPay = Math.round((annualSalary / 12) * 100) / 100;
  const biweeklyPay = Math.round((annualSalary / 26) * 100) / 100;
  const weeklyPay = Math.round((annualSalary / 52) * 100) / 100;
  const workingDays = weeksPerYear * 5;
  const dailyPay = workingDays > 0
    ? Math.round((annualSalary / workingDays) * 100) / 100
    : 0;

  // 6. Calculate effective hourly rate (total comp / total hours worked)
  const totalHoursPerYear = (hoursPerWeek + overtimeHours) * weeksPerYear;
  const effectiveHourlyRate = totalHoursPerYear > 0
    ? Math.round((totalWithOvertime / totalHoursPerYear) * 100) / 100
    : 0;

  // 7. Summary value group
  const summary: { label: string; value: number }[] = [
    { label: 'Annual Salary', value: annualSalary },
    { label: 'Monthly Pay', value: monthlyPay },
    { label: 'Biweekly Pay', value: biweeklyPay },
    { label: 'Weekly Pay', value: weeklyPay },
    { label: 'Daily Pay', value: dailyPay },
    { label: 'Annual Overtime Pay', value: overtimePay },
    { label: 'Total Annual Compensation', value: totalWithOvertime },
    { label: 'Effective Hourly Rate', value: effectiveHourlyRate },
  ];

  return {
    annualSalary,
    monthlyPay,
    biweeklyPay,
    weeklyPay,
    dailyPay,
    overtimePay,
    totalWithOvertime,
    effectiveHourlyRate,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'hourly-to-salary': calculateHourlyToSalary,
};
