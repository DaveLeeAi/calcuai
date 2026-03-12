/**
 * Salary Calculator — Annual / Monthly / Biweekly / Weekly / Daily / Hourly conversion
 *
 * Formulas:
 *   Annual Salary = Hourly Rate × Hours per Week × Weeks per Year
 *   Monthly Salary = Annual Salary / 12
 *   Biweekly Salary = Annual Salary / 26
 *   Weekly Salary = Annual Salary / 52
 *   Daily Salary = Annual Salary / (Weeks per Year × Days per Week)
 *   Hourly Rate = Annual Salary / (Hours per Week × Weeks per Year)
 *
 * Adjusted for:
 *   - Vacation/PTO days (reduces effective weeks worked)
 *   - Holidays (reduces effective days worked)
 *
 * Source: U.S. Bureau of Labor Statistics (BLS) — "Occupational Employment and
 * Wage Statistics" (2024). Standard work year: 2,080 hours (40 hrs × 52 weeks).
 */

// ═══════════════════════════════════════════════════════
// Interfaces
// ═══════════════════════════════════════════════════════

export interface SalaryInput {
  inputMode: 'annual' | 'hourly';
  annualSalary: number;
  hourlyRate: number;
  hoursPerWeek: number;
  weeksPerYear: number;
  vacationDays: number;
  holidays: number;
}

export interface SalaryBreakdown {
  annual: number;
  monthly: number;
  biweekly: number;
  weekly: number;
  daily: number;
  hourly: number;
}

export interface SalaryComparisonRow {
  frequency: string;
  unadjusted: number;
  adjusted: number;
}

export interface SalaryOutput {
  annualSalary: number;
  monthlySalary: number;
  biweeklySalary: number;
  weeklySalary: number;
  dailySalary: number;
  hourlyRate: number;
  adjustedAnnual: number;
  adjustedHourly: number;
  totalWorkingDays: number;
  totalWorkingHours: number;
  salaryBreakdown: SalaryComparisonRow[];
  summary: { label: string; value: number }[];
}

// ═══════════════════════════════════════════════════════
// Main function: Salary Calculator
// ═══════════════════════════════════════════════════════

/**
 * Converts between annual salary and hourly rate, and provides
 * breakdowns at every frequency (annual, monthly, biweekly, weekly, daily, hourly).
 *
 * Annual = Hourly × Hours/Week × Weeks/Year
 * Hourly = Annual / (Hours/Week × Weeks/Year)
 *
 * @param inputs - Record with inputMode, annualSalary, hourlyRate, hoursPerWeek, weeksPerYear, vacationDays, holidays
 * @returns Record with all salary breakdowns, adjusted values, and comparison table
 */
export function calculateSalary(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs with safe defaults
  const inputMode = String(inputs.inputMode || 'annual');
  const hoursPerWeek = Math.max(1, Math.min(168, Number(inputs.hoursPerWeek) || 40));
  const weeksPerYear = Math.max(1, Math.min(52, Number(inputs.weeksPerYear) || 52));
  const vacationDays = Math.max(0, Math.min(365, Number(inputs.vacationDays) || 0));
  const holidays = Math.max(0, Math.min(365, Number(inputs.holidays) || 0));

  // 2. Determine annual salary and hourly rate
  let annualSalary: number;
  let hourlyRate: number;

  if (inputMode === 'hourly') {
    hourlyRate = Math.max(0, Number(inputs.hourlyRate) || 0);
    annualSalary = hourlyRate * hoursPerWeek * weeksPerYear;
  } else {
    annualSalary = Math.max(0, Number(inputs.annualSalary) || 0);
    const totalHours = hoursPerWeek * weeksPerYear;
    hourlyRate = totalHours > 0 ? annualSalary / totalHours : 0;
  }

  // 3. Calculate standard (unadjusted) breakdowns
  const monthlySalary = annualSalary / 12;
  const biweeklySalary = annualSalary / 26;
  const weeklySalary = annualSalary / 52;
  const daysPerWeek = 5; // standard work week
  const totalWorkDaysPerYear = weeksPerYear * daysPerWeek;
  const dailySalary = totalWorkDaysPerYear > 0 ? annualSalary / totalWorkDaysPerYear : 0;

  // 4. Calculate adjusted values (accounting for vacation & holidays)
  const paidTimeOffDays = vacationDays + holidays;
  const adjustedWorkDays = Math.max(0, totalWorkDaysPerYear - paidTimeOffDays);
  const adjustedWorkHours = adjustedWorkDays * (hoursPerWeek / daysPerWeek);

  // Adjusted hourly: same annual salary but fewer working hours
  const adjustedHourly = adjustedWorkHours > 0
    ? annualSalary / adjustedWorkHours
    : 0;

  // Adjusted annual: if paid hourly, fewer hours means less total pay
  const adjustedAnnual = inputMode === 'hourly'
    ? hourlyRate * adjustedWorkHours
    : annualSalary; // salaried workers get same annual regardless of PTO

  // 5. Build comparison table
  const salaryBreakdown: SalaryComparisonRow[] = [
    {
      frequency: 'Annual',
      unadjusted: round2(annualSalary),
      adjusted: round2(inputMode === 'hourly' ? adjustedAnnual : annualSalary),
    },
    {
      frequency: 'Monthly',
      unadjusted: round2(monthlySalary),
      adjusted: round2(inputMode === 'hourly' ? adjustedAnnual / 12 : monthlySalary),
    },
    {
      frequency: 'Biweekly',
      unadjusted: round2(biweeklySalary),
      adjusted: round2(inputMode === 'hourly' ? adjustedAnnual / 26 : biweeklySalary),
    },
    {
      frequency: 'Weekly',
      unadjusted: round2(weeklySalary),
      adjusted: round2(inputMode === 'hourly' ? adjustedAnnual / 52 : weeklySalary),
    },
    {
      frequency: 'Daily',
      unadjusted: round2(dailySalary),
      adjusted: round2(adjustedWorkDays > 0 ? (inputMode === 'hourly' ? adjustedAnnual / adjustedWorkDays : annualSalary / adjustedWorkDays) : 0),
    },
    {
      frequency: 'Hourly',
      unadjusted: round2(hourlyRate),
      adjusted: round2(adjustedHourly),
    },
  ];

  // 6. Summary value group
  const summary: { label: string; value: number }[] = [
    { label: 'Annual Salary', value: round2(annualSalary) },
    { label: 'Monthly', value: round2(monthlySalary) },
    { label: 'Biweekly', value: round2(biweeklySalary) },
    { label: 'Weekly', value: round2(weeklySalary) },
    { label: 'Daily', value: round2(dailySalary) },
    { label: 'Hourly', value: round2(hourlyRate) },
    { label: 'Working Days/Year', value: adjustedWorkDays },
    { label: 'Working Hours/Year', value: round2(adjustedWorkHours) },
  ];

  return {
    annualSalary: round2(annualSalary),
    monthlySalary: round2(monthlySalary),
    biweeklySalary: round2(biweeklySalary),
    weeklySalary: round2(weeklySalary),
    dailySalary: round2(dailySalary),
    hourlyRate: round2(hourlyRate),
    adjustedAnnual: round2(inputMode === 'hourly' ? adjustedAnnual : annualSalary),
    adjustedHourly: round2(adjustedHourly),
    totalWorkingDays: adjustedWorkDays,
    totalWorkingHours: round2(adjustedWorkHours),
    salaryBreakdown,
    summary,
  };
}

// ═══════════════════════════════════════════════════════
// Helper: round to 2 decimal places
// ═══════════════════════════════════════════════════════

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'salary-convert': calculateSalary,
};
