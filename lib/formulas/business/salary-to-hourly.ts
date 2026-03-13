/**
 * Salary to Hourly Calculator — Convert Annual Salary to Hourly Rate
 *
 * Formulas:
 *   Hourly Rate = Annual Salary / (Hours/Week x Weeks/Year)
 *   Adjusted Hourly Rate = Annual Salary / (Hours/Week x (Weeks/Year - (Holidays + Vacation Days) / 5))
 *   Monthly Pay = Annual Salary / 12
 *   Biweekly Pay = Annual Salary / 26
 *   Weekly Pay = Annual Salary / 52
 *   Daily Pay = Weekly Pay / 5
 *   Total Work Hours = Hours/Week x Weeks/Year
 *   Adjusted Work Hours = Hours/Week x (Weeks/Year - (Holidays + Vacation Days) / 5)
 *
 * Source: Bureau of Labor Statistics — Standard Work Week Conventions (2024).
 */

// ═══════════════════════════════════════════════════════
// Interfaces
// ═══════════════════════════════════════════════════════

export interface SalaryToHourlyInput {
  annualSalary: number;
  hoursPerWeek: number;
  weeksPerYear: number;
  paidHolidays: number;
  paidVacationDays: number;
}

export interface SalaryToHourlyOutput {
  hourlyRate: number;
  adjustedHourlyRate: number;
  monthlyPay: number;
  biweeklyPay: number;
  weeklyPay: number;
  dailyPay: number;
  totalWorkHours: number;
  adjustedWorkHours: number;
  payBreakdown: { label: string; value: number }[];
  summary: { label: string; value: number }[];
}

// ═══════════════════════════════════════════════════════
// Main function: Salary to Hourly Calculator
// ═══════════════════════════════════════════════════════

/**
 * Converts an annual salary to hourly rate, with optional PTO adjustment.
 *
 * Hourly Rate = annualSalary / (hoursPerWeek x weeksPerYear)
 * Adjusted Hourly Rate = annualSalary / (hoursPerWeek x (weeksPerYear - ptoWeeks))
 * where ptoWeeks = (paidHolidays + paidVacationDays) / 5
 *
 * @param inputs - Record with annualSalary, hoursPerWeek, weeksPerYear, paidHolidays, paidVacationDays
 * @returns Record with hourlyRate, adjustedHourlyRate, monthlyPay, biweeklyPay, weeklyPay, dailyPay, totalWorkHours, adjustedWorkHours, payBreakdown, summary
 */
export function calculateSalaryToHourly(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs with safe defaults
  const annualSalary = Math.max(0, Number(inputs.annualSalary) || 0);
  const hoursPerWeek = Math.max(0, Math.min(168, Number(inputs.hoursPerWeek) || 0));
  const weeksPerYear = Math.max(0, Math.min(52, Number(inputs.weeksPerYear) || 0));
  const paidHolidays = Math.max(0, Math.min(30, Number(inputs.paidHolidays) || 0));
  const paidVacationDays = Math.max(0, Math.min(60, Number(inputs.paidVacationDays) || 0));

  // 2. Calculate total work hours per year
  const totalWorkHours = hoursPerWeek * weeksPerYear;

  // 3. Calculate base hourly rate
  const hourlyRate = totalWorkHours > 0
    ? Math.round((annualSalary / totalWorkHours) * 100) / 100
    : 0;

  // 4. Calculate adjusted work hours (accounting for PTO)
  const ptoWeeks = (paidHolidays + paidVacationDays) / 5;
  const adjustedWeeks = Math.max(0, weeksPerYear - ptoWeeks);
  const adjustedWorkHours = Math.round(hoursPerWeek * adjustedWeeks * 100) / 100;

  // 5. Calculate adjusted hourly rate (what you actually earn per hour worked)
  const adjustedHourlyRate = adjustedWorkHours > 0
    ? Math.round((annualSalary / adjustedWorkHours) * 100) / 100
    : 0;

  // 6. Calculate pay period breakdowns
  const monthlyPay = Math.round((annualSalary / 12) * 100) / 100;
  const biweeklyPay = Math.round((annualSalary / 26) * 100) / 100;
  const weeklyPay = Math.round((annualSalary / 52) * 100) / 100;
  const dailyPay = Math.round((weeklyPay / 5) * 100) / 100;

  // 7. Pay breakdown for pie chart
  const payBreakdown: { label: string; value: number }[] = [
    { label: 'Monthly Pay', value: monthlyPay },
    { label: 'Biweekly Pay', value: biweeklyPay },
    { label: 'Weekly Pay', value: weeklyPay },
  ];

  // 8. Summary value group
  const summary: { label: string; value: number }[] = [
    { label: 'Hourly Rate', value: hourlyRate },
    { label: 'Adjusted Hourly Rate', value: adjustedHourlyRate },
    { label: 'Daily Pay', value: dailyPay },
    { label: 'Weekly Pay', value: weeklyPay },
    { label: 'Biweekly Pay', value: biweeklyPay },
    { label: 'Monthly Pay', value: monthlyPay },
    { label: 'Total Work Hours/Year', value: totalWorkHours },
    { label: 'Adjusted Work Hours/Year', value: adjustedWorkHours },
  ];

  return {
    hourlyRate,
    adjustedHourlyRate,
    monthlyPay,
    biweeklyPay,
    weeklyPay,
    dailyPay,
    totalWorkHours,
    adjustedWorkHours,
    payBreakdown,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'salary-to-hourly': calculateSalaryToHourly,
};
