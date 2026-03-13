/**
 * Student Loan Payoff Calculator
 *
 * Supports 4 repayment plans:
 *   - Standard (10-year fixed): M = P × [r(1+r)^n] / [(1+r)^n - 1], n=120
 *   - Graduated: starts at 60% of standard payment, increases 7% every 24 months
 *   - Extended (25-year fixed): same formula, n=300
 *   - Custom: user-provided monthly payment amount
 *
 * Income-Based Repayment (IBR) estimate:
 *   discretionaryIncome = max(0, grossIncome − 150% × FPL)
 *   ibrPayment = discretionaryIncome × 10% / 12
 *
 * Federal Poverty Level (FPL) 2024 for single filer: $15,060
 *
 * Extra payments reduce total interest and shorten the payoff timeline.
 * interestSaved = totalInterestWithout − totalInterestWith
 * timeSaved = monthsWithout − monthsWith
 *
 * Source: Federal Student Aid (studentaid.gov) — Repayment Plan Information;
 * CFPB — Paying for College; Department of Education — Income-Driven Repayment Plans.
 */

const FPL_SINGLE_2024 = 15060;
const MAX_MONTHS = 600; // 50-year cap to prevent infinite loops

/**
 * Standard amortization monthly payment formula.
 * M = P × [r(1+r)^n] / [(1+r)^n - 1]
 */
function amortizationPayment(principal: number, monthlyRate: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  if (monthlyRate === 0) return principal / months;
  const factor = Math.pow(1 + monthlyRate, months);
  return principal * (monthlyRate * factor) / (factor - 1);
}

/**
 * Simulates month-by-month loan payoff and returns total months and total interest.
 * Handles graduated payments that increase 7% every 24 months.
 */
function simulatePayoff(
  balance: number,
  monthlyRate: number,
  getPayment: (month: number) => number,
  extraPayment: number,
): { months: number; totalInterest: number } {
  if (balance <= 0) return { months: 0, totalInterest: 0 };

  let remaining = balance;
  let totalInterest = 0;
  let month = 0;

  while (remaining > 0.005 && month < MAX_MONTHS) {
    month++;
    const interest = remaining * monthlyRate;
    totalInterest += interest;
    remaining += interest;

    const basePayment = getPayment(month);
    const totalPayment = basePayment + extraPayment;

    // If payment doesn't cover interest, cap at max months
    if (totalPayment <= interest && month > 1) {
      // Payment insufficient — loan will never pay off; return capped values
      return { months: MAX_MONTHS, totalInterest: parseFloat(totalInterest.toFixed(2)) };
    }

    const applied = Math.min(totalPayment, remaining);
    remaining -= applied;
  }

  return {
    months: month,
    totalInterest: parseFloat(totalInterest.toFixed(2)),
  };
}

/**
 * Formats months as "X years Y months" string.
 */
function formatMonths(totalMonths: number): string {
  if (totalMonths <= 0) return '0 months';
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (years === 0) return `${months} month${months !== 1 ? 's' : ''}`;
  if (months === 0) return `${years} year${years !== 1 ? 's' : ''}`;
  return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`;
}

/**
 * Returns an estimated payoff date string from current date + months.
 */
function getPayoffDate(months: number): string {
  if (months <= 0) return 'Already paid off';
  const now = new Date();
  const payoff = new Date(now.getFullYear(), now.getMonth() + months, 1);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${monthNames[payoff.getMonth()]} ${payoff.getFullYear()}`;
}

/**
 * Student Loan Payoff Calculator.
 *
 * Standard plan: M = P × [r(1+r)^120] / [(1+r)^120 - 1]
 * Extended plan: M = P × [r(1+r)^300] / [(1+r)^300 - 1]
 * Graduated: starts at 60% of standard, increases 7% every 24 months
 * IBR estimate: (income - 150% FPL) × 10% / 12
 *
 * @param inputs - Record with loanBalance, interestRate, repaymentPlan, customPayment,
 *                 extraPayment, incomeForIBR
 * @returns Record with monthlyPayment, payoffMonths, totalInterest, totalPaid, payoffDate,
 *          interestSaved, timeSaved, monthlyWithExtra, ibrEstimate
 */
export function calculateStudentLoanPayoff(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs
  const loanBalance = Math.max(0, Number(inputs.loanBalance) || 0);
  const annualRate = Math.max(0, Number(inputs.interestRate) || 0);
  const repaymentPlan = String(inputs.repaymentPlan || 'standard');
  const customPayment = Math.max(0, Number(inputs.customPayment) || 0);
  const extraPayment = Math.max(0, Number(inputs.extraPayment) || 0);
  const incomeForIBR = Math.max(0, Number(inputs.incomeForIBR) || 0);

  const monthlyRate = annualRate / 100 / 12;

  // 2. Guard: zero balance
  if (loanBalance <= 0) {
    return {
      monthlyPayment: 0,
      payoffMonths: '0 months',
      totalInterest: 0,
      totalPaid: 0,
      payoffDate: 'Already paid off',
      interestSaved: 0,
      timeSaved: '0 months',
      monthlyWithExtra: 0,
      ibrEstimate: 0,
    };
  }

  // 3. Calculate base monthly payment based on plan
  let baseMonthlyPayment: number;
  let paymentFn: (month: number) => number;

  const standardPayment = amortizationPayment(loanBalance, monthlyRate, 120);

  switch (repaymentPlan) {
    case 'graduated': {
      // Starts at 60% of standard, increases 7% every 24 months
      const startPayment = standardPayment * 0.6;
      baseMonthlyPayment = startPayment;
      paymentFn = (month: number) => {
        const period = Math.floor((month - 1) / 24);
        return startPayment * Math.pow(1.07, period);
      };
      break;
    }
    case 'extended': {
      baseMonthlyPayment = amortizationPayment(loanBalance, monthlyRate, 300);
      paymentFn = () => baseMonthlyPayment;
      break;
    }
    case 'custom': {
      baseMonthlyPayment = customPayment;
      paymentFn = () => customPayment;
      break;
    }
    default: {
      // standard 10-year
      baseMonthlyPayment = standardPayment;
      paymentFn = () => standardPayment;
      break;
    }
  }

  baseMonthlyPayment = parseFloat(baseMonthlyPayment.toFixed(2));

  // 4. Simulate payoff WITHOUT extra payments
  const withoutExtra = simulatePayoff(loanBalance, monthlyRate, paymentFn, 0);

  // 5. Simulate payoff WITH extra payments
  const withExtra = simulatePayoff(loanBalance, monthlyRate, paymentFn, extraPayment);

  // 6. Calculate savings
  const interestSaved = parseFloat(Math.max(0, withoutExtra.totalInterest - withExtra.totalInterest).toFixed(2));
  const timeSavedMonths = Math.max(0, withoutExtra.months - withExtra.months);

  // 7. IBR estimate
  const discretionaryIncome = Math.max(0, incomeForIBR - FPL_SINGLE_2024 * 1.5);
  const ibrEstimate = parseFloat((discretionaryIncome * 0.10 / 12).toFixed(2));

  // 8. Final outputs
  const totalInterest = withExtra.totalInterest;
  const totalPaid = parseFloat((loanBalance + totalInterest).toFixed(2));
  const monthlyWithExtra = parseFloat((baseMonthlyPayment + extraPayment).toFixed(2));

  return {
    monthlyPayment: baseMonthlyPayment,
    payoffMonths: formatMonths(withExtra.months),
    totalInterest,
    totalPaid,
    payoffDate: getPayoffDate(withExtra.months),
    interestSaved,
    timeSaved: formatMonths(timeSavedMonths),
    monthlyWithExtra,
    ibrEstimate,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'student-loan-payoff': calculateStudentLoanPayoff,
};
