/**
 * Debt-to-Income (DTI) Ratio Calculator
 *
 * Calculates front-end and back-end debt-to-income ratios used by
 * mortgage lenders to determine borrowing capacity.
 *
 * Formula:
 *   DTI = (Total Monthly Debt Payments / Gross Monthly Income) × 100
 *
 * Where:
 *   Total Monthly Debt = housing + car + student loans + credit cards + other debt
 *   Gross Monthly Income = pre-tax monthly income
 *
 * Front-end ratio (housing only):
 *   Front-End DTI = Housing Payment / Gross Monthly Income × 100
 *
 * Rating thresholds (per CFPB / Fannie Mae guidelines):
 *   ≤ 28%  = Excellent
 *   ≤ 36%  = Good
 *   ≤ 43%  = Acceptable (QM limit)
 *   ≤ 50%  = High
 *   > 50%  = Very High
 *
 * Source: Consumer Financial Protection Bureau (CFPB) Qualified Mortgage rules;
 *         Fannie Mae Selling Guide Section B3-6-02 (DTI requirements).
 */

export function calculateDebtToIncome(inputs: Record<string, unknown>): Record<string, unknown> {
  const monthlyIncome = Number(inputs.monthlyIncome) || 0;
  const mortgageRent = Number(inputs.mortgageRent) || 0;
  const carPayment = Number(inputs.carPayment) || 0;
  const studentLoanPayment = Number(inputs.studentLoanPayment) || 0;
  const creditCardPayment = Number(inputs.creditCardPayment) || 0;
  const otherDebt = Number(inputs.otherDebt) || 0;

  const totalMonthlyDebt = parseFloat(
    (mortgageRent + carPayment + studentLoanPayment + creditCardPayment + otherDebt).toFixed(2)
  );

  // Edge case: zero income
  if (monthlyIncome <= 0) {
    return {
      dtiRatio: 0,
      rating: 'N/A',
      totalMonthlyDebt,
      frontEndRatio: 0,
      summary: [
        { label: 'DTI Ratio', value: 'N/A — no income entered' },
        { label: 'Rating', value: 'N/A' },
        { label: 'Total Monthly Debt', value: totalMonthlyDebt },
        { label: 'Front-End Ratio (Housing)', value: 'N/A' },
        { label: 'Annual Income', value: 0 },
      ],
      debtBreakdown: [],
      maxMortgageAt36: 0,
    };
  }

  const dtiRatio = parseFloat(((totalMonthlyDebt / monthlyIncome) * 100).toFixed(1));
  const frontEndRatio = parseFloat(((mortgageRent / monthlyIncome) * 100).toFixed(1));

  // DTI rating
  let rating: string;
  if (dtiRatio <= 28) {
    rating = 'Excellent';
  } else if (dtiRatio <= 36) {
    rating = 'Good';
  } else if (dtiRatio <= 43) {
    rating = 'Acceptable';
  } else if (dtiRatio <= 50) {
    rating = 'High';
  } else {
    rating = 'Very High';
  }

  // Pie chart — only include non-zero values
  const debtBreakdown: { name: string; value: number }[] = [];
  if (mortgageRent > 0) debtBreakdown.push({ name: 'Housing', value: mortgageRent });
  if (carPayment > 0) debtBreakdown.push({ name: 'Car', value: carPayment });
  if (studentLoanPayment > 0) debtBreakdown.push({ name: 'Student Loans', value: studentLoanPayment });
  if (creditCardPayment > 0) debtBreakdown.push({ name: 'Credit Cards', value: creditCardPayment });
  if (otherDebt > 0) debtBreakdown.push({ name: 'Other', value: otherDebt });

  // Maximum mortgage at 36% DTI
  const nonHousingDebt = carPayment + studentLoanPayment + creditCardPayment + otherDebt;
  const maxMortgageAt36 = parseFloat(Math.max(0, monthlyIncome * 0.36 - nonHousingDebt).toFixed(2));

  // Remaining capacity at 36% DTI
  const remainingAt36 = parseFloat(Math.max(0, monthlyIncome * 0.36 - totalMonthlyDebt).toFixed(2));

  const summary: { label: string; value: number | string }[] = [
    { label: 'DTI Ratio', value: `${dtiRatio}%` },
    { label: 'Rating', value: rating },
    { label: 'Total Monthly Debt', value: totalMonthlyDebt },
    { label: 'Front-End Ratio (Housing)', value: `${frontEndRatio}%` },
    { label: 'Remaining for Debt at 36% DTI', value: remainingAt36 },
    { label: 'Annual Income', value: parseFloat((monthlyIncome * 12).toFixed(2)) },
  ];

  return {
    dtiRatio,
    rating,
    totalMonthlyDebt,
    frontEndRatio,
    summary,
    debtBreakdown,
    maxMortgageAt36,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'debt-to-income': calculateDebtToIncome,
};
